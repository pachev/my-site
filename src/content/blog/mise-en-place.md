---
title: "My First Two Weeks with Mise"
date: 2025-05-20T14:30:00-05:00
description: "Using Mise to replace some tools"
tags: ["development", "tools", "nix", "mise"]
draft: false
---

## TL;DR

After two weeks with [Mise] I’ve switched from per‑project `flake.nix` files, with `direnv` to
a `mise.toml`. Mise now boots the right Node, Python, and whatever‑else versions, wires up my env vars, and even runs project
tasks. It fit in with my current nix setup via [Home Manager].

---

## The Why

I like trying out new tools. Not for productivity reasons, although that's a reason, but because I like learning new things. The last
new thing I picked up was using [Nix] and flakes alongside direnv. I'm also a sucker for rust tools like [uv] and [zellij]. Everyone
seems to be rewriting or writing cool cli tools in rust.

### The Short List of Reasons I Switched

- **Speed** – Shims are instant and installs are pretty fast
- **Tasks Built‑In** – No separate [justfile]. I used to sprinkle `justfile`s when I need them but I don't have to reach for another tool with the mise tasks.
- **Automatic Installs** – Install happen when I `cd` into a directory.
- **.env Support** - What's not to like.
- **Nix Friendly** – Home Manager ships a `programs.mise` module, so, it was easy to integrate into my existing setup.

---

## My Home Manager Snippet

Here’s my home manager config. I won't go into detail about [Nix] or [Home Manager] here. You should check those projects out. You can 
extract the `globalConfig` block and use that in toml format for your `~/.config/mise/config.toml` file.

```nix
programs.mise = {
  enable = true;
  enableZshIntegration = true;
  globalConfig = {
    tools = {
      node = "lts";
      python = "3.13";
    };
    settings = {
      always_keep_download = false;
      always_keep_install = false;
      plugin_autoupdate_last_check_duration = "1 week";
      trusted_config_paths = [ "~/workspace" ];
      not_found_auto_install = true;
      env_file = ".env";
      python.uv_venv_auto = true;
    };
  };
};
```

---

## Day‑to‑Day Workflow

1. **Clone Repo**  
   ```
   git clone git@github.com:cool/new-thing.git
   cd new-thing   # mise activates
   ```
2. **Runtimes Install Automatically**  
   When you cd into the directory, if it has a mise.toml or .env, Mise will setup automatically. If you're familiar with
   pyenv, nvm, rubyenv, etc. this is similar to that.  
   
3. **Tasks Replace Scripts**  
   My `mise.toml` might include:
   ```toml
   [tasks]
   dev = {run = "bun run dev"}
   lint = {run = "eslint ."}
   build = {depends = ["lint"], run = "bun build"}
   ```
   Now `mise run build` will lint and build in one go. You can get creative and chain them together, or even run them in parallel.
   a good example is running backend and frontend code together with `mise run dev` and it will run backend-dev and frontend-dev in parallel.
   ```toml
    [tasks]
    backend-dev = {run = "cd backend && npm run dev"}
    frontend-dev = {run = "cd frontend && mvn spring-boot:run"}
    dev = {depends = ["backend-dev", "frontend-dev"]}
   ```
   
4. **Private Stuff**  
   Anything machine‑specific lives in `mise.local.toml` (git‑ignored). I keep things like secrets, and local only tasks there (don't blame me, some things I like to keep private :D)

---

## Tips & Tricks

- **Use `.env` + `env_file`** – Mise reads variables automatically; this replaces `direnv allow`.  
- **Leverage Legacy Files** – It respects `.nvmrc`, `.tool-versions`, and even `.python-version`, so you can mix and match when working with others.
- **Set Up Aliases** - I use `alias m="mise"` for quick access. Just like `k` for `kubectl`.

---

## Final Thoughts

Two weeks is not much time, but I'm pretty much sold. Give it a try. 

Thanks for reading :D  
-Pachev

[uv]: https://github.com/astral-sh/uv
[zellij]: https://zellij.dev
[justfile]: https://github.com/casey/just
[Nix]: https://nixos.org
[Home Manager]: https://nix-community.github.io/home-manager
[Mise]: https://mise.jdx.dev