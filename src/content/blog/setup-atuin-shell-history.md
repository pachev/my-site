---
title: Setup Atuin For Shell History
description: How to set up Atuin for managing shell history with self-hosted sync
date: 2025-05-26
tags: ["shell", "tools", "self-hosting", "tips"]
draft: false
---

# Setup Atuin For Shell History

[Atuin](https://atuin.sh/) is a pretty cool utility for managing shell history. It's pretty cool for remembering what you've done but also not having to write a script for something you may use once or twice. 
I like this because it lets me sync it to a self-hosted server. If you don't want to do that, you can use their own sync service. 
Even without that, you can use this locally with an SQLite db when you turn off sync. It's pretty neat.

Here's how I got it running:

- Self-hosted using this link: https://docs.atuin.sh/self-hosting/docker/
- Use docker compose (used an LXC on my Proxmox server). Other ideas can be a VPS with systemd

Here is the docker compose file I am using:

```yml
services:
  atuin:
    restart: unless-stopped
    image: ghcr.io/atuinsh/atuin:18.6.1
    container_name: atuin
    command: server start
    volumes:
      - "./atuin-config:/config"
    links:
      - postgresql:db
    ports:
      - 8888:8888
    environment:
      ATUIN_HOST: "0.0.0.0"
      ATUIN_OPEN_REGISTRATION: "true" # Allow new users to register. I turned off registration after I set it up
      ATUIN_DB_URI: postgres://$ATUIN_DB_USERNAME:$ATUIN_DB_PASSWORD@db/$ATUIN_DB_NAME
      RUST_LOG: info,atuin_server=debug
  postgresql:
    image: postgres:15-alpine
    restart: unless-stopped
    container_name: atuin-db
    volumes:
      - /mnt/pgdata/atuin:/var/lib/postgresql/data # You don't have to volume as I did, but this is my NAS server mount point
    environment:
      POSTGRES_USER: ${ATUIN_DB_USERNAME}
      POSTGRES_PASSWORD: ${ATUIN_DB_PASSWORD}
      POSTGRES_DB: ${ATUIN_DB_NAME}
```

.env file next to it
```txt
ATUIN_DB_NAME=atuin
ATUIN_DB_USERNAME=atuin
ATUIN_DB_PASSWORD=changeMe
```

I set mine up in home manager, but you can always set things up by installing and then editing ~/.config/atuin/config.toml after installation.

Here for completeness:
```toml
db_path = "~/.history.db"
auto_sync = true
sync_address = "https://atuin.pachevjoseph.com"
sync_frequency = "5m"
workspaces = true
style="compact"
session_path = "~/.atuin-session"
filter_mode = "host"
```

Here is my config:
```nix
programs.atuin = {
  enable = true;
  enableZshIntegration = true;
  settings = {
    auto_sync = true;
    sync_address = "https://atuin.pachevjoseph.com";
    sync_frequency = "5m";
    workspaces = true;
    style="compact";
    db_path = "~/.history.db";
    session_path = "~/.atuin-session";
    filter_mode = "host";
  };
};
```

I filter by host, so I don't get the history depending on the server I'm on. This makes it easier for me when on different machines. 
There are things I may not want to see from others. If that's ok for you, you can leave the default "global" mode on.

I've been using this for about 4 months now. I like it.

Thanks for reading :D

-Pachev
