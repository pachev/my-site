---
title: "Proxmox VE Helper-Scripts for Easy LXC Setup"
date: 2025-10-12
tags: ["proxmox", "lxc", "homelab", "tools"]
---

# TIL: Proxmox Community Scripts Make LXC Setup Dead Simple

I found [Proxmox VE Helper-Scripts](https://community-scripts.github.io/ProxmoxVE/scripts), a community-maintained collection of scripts that automate setting up popular homelab services in Proxmox LXC containers.

Instead of manually creating an LXC, installing packages, and configuring everything yourself, you just run a one-liner from your Proxmox shell. The script handles container creation, OS setup, and service installation.

They have scripts for pretty much everything you'd want to run:
- Home Assistant
- Plex / Jellyfin
- Pi-hole / AdGuard
- Nginx Proxy Manager
- Frigate
- Paperless-ngx
- And dozens more

Usage is straightforward. SSH into your Proxmox host and run the script for whatever service you want:

```bash
bash -c "$(wget -qLO - https://github.com/community-scripts/ProxmoxVE/raw/main/ct/homeassistant.sh)"
```

It walks you through the options (container ID, storage, resources) and does the rest.

I've used this for a bunch of my homelab services. It's a huge time saver when you just want something running without fiddling with configs for an hour.

Check it out: https://community-scripts.github.io/ProxmoxVE/scripts
