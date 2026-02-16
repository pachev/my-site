---
title: "NixOS on Proxmox LXC: From Zero to Shell"
date: 2026-02-16T10:00:00-06:00
description: "How to get a bare NixOS LXC container running on Proxmox."
tags: ["nixos", "proxmox", "lxc", "homelab"]
draft: false
---

## Why NixOS in an LXC?

I've been running Proxmox for a while now (currently on version 8.4, see my [/lab] for the full setup), and LXC containers are my go-to for lightweight services. They boot fast, use barely any resources, and you can spin up as many as you want for your services. But configuring them each time can be a little time consuming. 

There are some pre-configured LXCs found [here][3] that have helped me in the past. But for custom small services, the base ubuntu image has been my goto. But the pattern is usually, SSH in, `apt install` a bunch of stuff, tweak configs, and pray I remember what I did for the next custom service I want (I know ansible, and other tools exists, but I'm setting this up to make NixOS a hero).

NixOS fixes that. Your entire system is declared in a single `configuration.nix` file. Want the same setup on a new container? Copy the file, rebuild, done. It's like infrastructure-as-code but for your actual OS.

The problem is getting NixOS running in a Proxmox LXC isn't exactly straightforward. The Proxmox GUI doesn't play nice with it, and there are a few gotchas that'll have you staring at a blank console wondering what went wrong.

Here's how to get it working.

## Grabbing the Image

First, you need a NixOS LXC tarball. Head to [Hydra], Nix's build system, and navigate to the release you want.

1. Go to [https://hydra.nixos.org/project/nixos](https://hydra.nixos.org/project/nixos)
2. Pick your release (I went with `release-24.11`)
3. Open the **Jobs** tab
4. Search for `nixos.proxmoxLXC` and click the `x86_64-linux` link
5. Find the latest successful build (green checkmark)
6. Under **Build products**, copy the download link for `nixos-image-lxc-proxmox-*.tar.xz`

Upload this to your Proxmox template storage. You can either download it directly on the Proxmox host:

```bash
cd /var/lib/vz/template/cache/
wget <hydra-download-url> -O nixos-24.11-lxc.tar.xz
```

Or if you're using shared NFS storage like me:

```bash
cd /mnt/pve/proxmox-nfs/template/cache/
wget <hydra-download-url> -O nixos-24.11-lxc.tar.xz
```

You can also upload it through the Proxmox GUI under your storage → CT Templates → Upload.

## Creating the Container

You could use the PVE browser to create this, but I tend to use the CLI. SSH into your Proxmox host and create like so:

```bash
pct create 100 local:vztmpl/nixos-24.11-lxc.tar.xz \
  --hostname nixos \
  --ostype unmanaged \
  --features nesting=1 \
  --cmode console \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --memory 4096 \
  --rootfs local-lvm:16 \
  --unprivileged 0
```

A few things to note here:

**`--ostype unmanaged`** is critical. Without this, Proxmox tries to run LXC hooks that don't exist in NixOS and everything breaks.

**`--cmode console`** fixes the blank console problem. NixOS uses systemd which expects `/dev/console`, not the default tty mode. Without this, you'll get a black screen in the Proxmox web console and think it's broken.

**`--features nesting=1`** is needed for Nix's build sandbox to work. You'll get weird build failures without it.

**`--unprivileged 0`** runs it as a privileged container. You can try unprivileged, but some NixOS features (like Docker) don't play nice with it.

## First Boot

Start it up and enter the container:

```bash
pct start 100
pct enter 100
```

You might see a blank screen. Just hit Enter and the login prompt should appear. Log in as `root` with no password.

First thing, source the environment so your PATH is set up:

```bash
source /etc/set-environment
```

Now set up the Nix channel. The container image doesn't come with channels configured, so `nixos-rebuild` won't work until you add one:

```bash
nix-channel --add https://channels.nixos.org/nixos-unstable nixos
nix-channel --update
```

I went with `nixos-unstable` because I like living on the edge, but you can use `nixos-24.11` for stability:

```bash
nix-channel --add https://nixos.org/channels/nixos-24.11 nixos
```

## The Configuration

The container should have a minimal `/etc/nixos/configuration.nix` already. If not, create one. Here's a basic starting point that gets you SSH access and a usable system:

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

  networking = {
    useDHCP = lib.mkForce true;
    useHostResolvConf = false;
    hostName = "nixos";
  };

  services.resolved.enable = true;

  services.openssh = {
    enable = true;
    settings = {
      PermitRootLogin = "yes";
      PasswordAuthentication = true;
    };
  };

  # Set a password so you can log in
  users.users.root.initialPassword = "changeme";

  environment.systemPackages = with pkgs; [
    vim git curl wget htop
  ];

  nix.settings.experimental-features = [ "nix-command" "flakes" ];

  system.stateVersion = "24.11";
}
```

Apply it:

```bash
nixos-rebuild switch
```

This is going to take a while the first time since Nix is downloading and building everything.

## The Import Gotcha

One thing that tripped me up: the `proxmox-lxc.nix` import is important. This module sets `networking.useDHCP = false` internally, which is why we need `lib.mkForce true` to override it if you want DHCP. Without the import, you lose Proxmox-specific tweaks that make the container behave correctly.

Also, don't import `lxc-container.nix` alongside `proxmox-lxc.nix`. They both try to define `system.build.tarball` and you'll get a conflict error about the option being defined multiple times.

## Console Not Working?

If your Proxmox web console shows a black screen even after setting `--cmode console`, try restarting the container. Sometimes the console mode change doesn't take effect until a full stop/start cycle:

```bash
pct stop 100
pct start 100
```

## What's Next

At this point you have a bare NixOS container that you can SSH into and customize. In [Part 2], I cover how to set up a proper template with a default user, dev tools, and SSH keys so you can spin up pre-configured containers in seconds.

Thanks for reading :D

-Pachev

[Hydra]: https://hydra.nixos.org/project/nixos
[Part 2]: /posts/nixos-proxmox-lxc-template
[3]: https://community-scripts.github.io/ProxmoxVE/scripts
[/lab]: /lab
