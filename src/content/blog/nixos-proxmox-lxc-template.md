---
title: "Templating NixOS LXC Containers on Proxmox"
date: 2026-02-16T11:00:00-06:00
description: "Turn a configured NixOS LXC into a reusable Proxmox template you can clone across your entire cluster."
tags: ["nixos", "proxmox", "lxc", "homelab", "templates"]
draft: false
---

## The Goal

In [Part 1] I covered getting a bare NixOS LXC running on Proxmox. That's great for a single container, but I wanted something more: a golden image I can clone in seconds that comes pre-loaded with my user, dev tools, SSH keys, and sensible defaults. Spin up a new project? Clone the template, set a hostname, done.

Here's how I built that.

## The Approach

I tried a few different paths before landing on one that actually works well:

**nixos-generators** builds a tarball from a config file. Sounds perfect, but the resulting image doesn't include Nix channels (so `nixos-rebuild` fails), the `configuration.nix` isn't writable (it's a symlink into the Nix store), and you have to `scp` the tarball to your Proxmox host every time you rebuild. Too many friction points.

**Proxmox native templating** is way simpler. Configure a container exactly how you want it, stop it, back it up, and drop the backup in the template cache. Every node in your cluster can use it. The config file is writable. Channels work. Everything just behaves the way you'd expect.

Let's do the native approach.

## Setting Up the Base Container

Start with a fresh NixOS LXC from the Hydra image (see [Part 1] for details):

```bash
pct create 900 local:vztmpl/nixos-24.11-lxc.tar.xz \
  --hostname nixos-template \
  --ostype unmanaged \
  --features nesting=1 \
  --cmode console \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --memory 4096 \
  --rootfs local-lvm:16 \
  --unprivileged 0

pct start 900
pct enter 900
```

Inside the container, get the basics set up:

```bash
source /etc/set-environment
passwd --delete root
```

## Setting Up Channels

I went with `nixos-unstable` for access to the latest packages:

```bash
nix-channel --add https://channels.nixos.org/nixos-unstable nixos
nix-channel --update
```

If you prefer stability, swap `nixos-unstable` for `nixos-24.11`.

## Push Your SSH Key

From the Proxmox host, push your public key into the container so it gets baked into the template:

```bash
pct push 900 /path/to/your-key.pub /root/your-key.pub
```

## The Configuration

Now for the actual config. Here's what I'm using — it sets up an `appuser` with sudo, SSH key auth, fish shell, neovim, Docker, and a bunch of dev tools:

```nix
{ modulesPath, config, pkgs, lib, ... }:
{
  imports = [
    "${modulesPath}/virtualisation/proxmox-lxc.nix"
  ];

  boot.isContainer = true;

  systemd.suppressedSystemUnits = [
    "dev-mqueue.mount"
    "sys-kernel-debug.mount"
    "sys-fs-fuse-connections.mount"
  ];

  environment.pathsToLink = [ "/bin" "/share" ];

  # DHCP networking - set static IPs via router reservations
  networking = {
    useDHCP = lib.mkForce true;
    useHostResolvConf = false;
    hostName = "nixos-template";
  };

  services.resolved.enable = true;

  # SSH - key auth only
  services.openssh = {
    enable = true;
    settings = {
      PermitRootLogin = "prohibit-password";
      PasswordAuthentication = false;
    };
  };

  # Users
  users.users.root = {
    openssh.authorizedKeys.keyFiles = [ /root/pj-key.pub ];
    shell = pkgs.fish;
    initialPassword = "changeme";
  };

  users.users.appuser = {
    isNormalUser = true;
    home = "/home/appuser";
    extraGroups = [ "docker" "wheel" ];
    openssh.authorizedKeys.keyFiles = [ /root/pj-key.pub ];
    shell = pkgs.fish;
    initialPassword = "changeme";
  };

  security.sudo.wheelNeedsPassword = false;

  # Shell
  programs.fish.enable = true;

  # Editor
  programs.neovim = {
    enable = true;
    defaultEditor = true;
    vimAlias = true;
    viAlias = true;
    configure = {
      customRC = ''
        inoremap jj <Esc>
        set expandtab
        set tabstop=4
        set shiftwidth=4
        set softtabstop=4
        set number
        set relativenumber
        set ignorecase
        set smartcase
        set incsearch
        set hlsearch
        set autoindent
        set smartindent
      '';
    };
  };

  # Dev tools
  environment.systemPackages = with pkgs; [
    neovim nano git curl wget jq sqlite ripgrep
    htop tmux rsync coreutils findutils gnugrep gnused
  ];

  # Docker
  virtualisation.docker = {
    enable = true;
    enableOnBoot = true;
  };

  # Enable flakes
  nix.settings.experimental-features = [ "nix-command" "flakes" ];

  system.stateVersion = "24.11";
}
```

Write this to `/etc/nixos/configuration.nix` and rebuild:

```bash
nano /etc/nixos/configuration.nix
nixos-rebuild switch
```

This takes a while since it's pulling down Docker, fish, and all the dev tools. Let it cook.

## Quick Sanity Check

Before templating, make sure everything works:

```bash
fish --version
docker --version
nvim --version
```

## Creating the Template

Here's where things get interesting. You might think `pct template 900` is the answer, and it sort of is — but it creates a template that only works on the same storage. If you have multiple Proxmox nodes and want to clone from any of them, you need the template in the CT template cache on shared storage.

The move that works across your whole cluster:

```bash
# From the Proxmox host
pct stop 900

# Back it up
vzdump 900 --dumpdir /tmp --mode stop

# Copy the backup to your shared template cache
cp /tmp/vzdump-lxc-900-*.tar.zst \
   /mnt/pve/proxmox-nfs/template/cache/nixos-appuser-template.tar.zst
```

That `.tar.zst` file now shows up as a CT template on every node in your Proxmox cluster.

## Spinning Up New Containers

From any node in your cluster:

```bash
pct create 201 proxmox-nfs:vztmpl/nixos-appuser-template.tar.zst \
  --hostname my-app \
  --ostype unmanaged \
  --features nesting=1 \
  --cmode console \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --memory 4096 \
  --rootfs local-lvm:16 \
  --unprivileged 0

pct start 201
```

Get the IP:

```bash
pct exec 201 -- ip -4 addr show eth0
```

SSH in:

```bash
ssh appuser@<ip>
```

That's it. You've got a fully configured NixOS container with your user, tools, and SSH keys ready to go.

## Networking: The DHCP + Reservation Trick

You'll notice the config uses `useDHCP = lib.mkForce true` instead of a static IP. I tried hardcoding static IPs in the NixOS config, but that means every clone gets the same IP — not great.

The `mkForce` is needed because the `proxmox-lxc.nix` module sets `useDHCP = false` internally, and NixOS doesn't let you redefine an option without explicitly overriding it.

The better approach: let DHCP handle it, then set **DHCP reservations** on your router. Each container gets a unique MAC address from Proxmox (check it with `pct config 201 | grep net0`), so you tell your router "this MAC always gets this IP." The container uses DHCP, but always lands on a predictable address.

Best of both worlds — no hardcoding in NixOS, but a stable IP for SSH.

## Customizing a Clone

Since the `configuration.nix` is a real writable file (not a Nix store symlink), you can customize any clone:

```bash
pct enter 201
nano /etc/nixos/configuration.nix
# Change hostname, add packages, whatever you need
nixos-rebuild switch
```

The template is your starting point. Each clone is its own system from there.

## Updating the Template

When you want to update your golden image — new packages, config changes, whatever:

1. Create a new container from the template
2. Make your changes, `nixos-rebuild switch`
3. Stop it, `vzdump`, copy to template cache
4. Replace the old template file

Simple and repeatable.

## What I Learned

A few things that weren't obvious going in:

**nixos-generators is cool but fiddly.** The resulting images don't have channels, the config isn't editable, and you're fighting symlinks. For a homelab workflow, native Proxmox templating is way less friction.

**The `proxmox-lxc.nix` import matters.** Don't import `lxc-container.nix` alongside it — they conflict on `system.build.tarball`. And don't forget `lib.mkForce` on `useDHCP` if you want DHCP.

**`--ostype unmanaged` and `--cmode console` are non-negotiable.** Without these, you'll get a broken container that either won't boot or won't give you a console.

**Shared storage makes everything easier.** If your template tarball is on NFS, every node can create containers from it. No copying, no syncing.

Thanks for reading :D

-Pachev

[Part 1]: /blog/nixos-proxmox-lxc-from-scratch
