It's a typical story. Your friends show you how to use vim, and somehow you end up as a soldier in a war you didn't know existed. You can't back down, so you pick a team and say you hate the other side. Then you sneak over to see what's so fancy about the other side, it's too hard, and you give up. A few times.

Then AI comes around and it finally clicks. Now you're hiding your new Emacs habit from your friends. You're in the terminal, so nobody can tell. And the editing parts are vim keys anyway. They'll never know!!

## Why it stuck this time

I've tried switching to Emacs a bunch of times before. My one mistake, I think, was trying to do it on work stuff. You need a lot of time to acclimate and form your tastes, and if you're in a hurry, it doesn't go well. I also didn't have LLMs to help with the configuration back in the day :D.

The idea came from trying out [herdr]([PJ: fill in herdr link]). I loved the idea of it, and I kept seeing little tweaks I wanted here and there. The more little things I wanted, the more I thought about how nice it would be to have an environment I could just edit. Then it clicked. Sure, Emacs is not meant to be your terminal multiplexer and your editor and your agent dashboard, but... I was told that with the magic of Elisp, I could do whatever I wanted. So I took that to its next logical step.

## The setup

I have a MacBook M2 Max, a custom-built PC running [NixOS](https://nixos.org), and a Lenovo ThinkPad T14, also on NixOS. Getting [Doom Emacs](https://github.com/doomemacs/doomemacs) running on all three with matching configs was not too bad, since everything is declared in [Nix](https://nixos.org) and [home-manager](https://github.com/nix-community/home-manager). Every tweak below is reproducible wherever I go.

I'm on week 3 ish. I'm still making little tweaks, and I love that it's so tweakable. I can only assume Emacs people won't like that I'm using AI to help with the config, but it truly has been helpful, and I've learned some Lisp along the way.

![Emacs in a single Ghostty window, split between a source buffer and an agent buffer](/images/emacs/one-window.png)

## Three weeks of tweaks

Every change lives in my nix-config repo, so this timeline came straight out of the commit log.

| When | What happened |
| --- | --- |
| Week 0 (27 Aug) | Doom lands, built into the Nix store from the [Unstraightened](https://github.com/marienz/nix-doom-emacs-unstraightened) flake. First gotcha: `doom sync` can't write to a store path. Fix: keep the built profile in Nix, but load a mutable `config.el` from the repo through a symlink, so edits take effect on reload. I didn't touch it much yet; I read blog posts and watched some YouTube first. |
| Week 1 (1 to 5 Sep) | Agents move in. v1 was each agent in a vterm pane with a bespoke hook per tool. v2, two days later, swapped that for [agent-shell](https://github.com/xenodium/agent-shell), which speaks the [Agent Client Protocol](https://agentclientprotocol.com) to Claude, Codex, and pi. Thirty commits in one day. herdr retired. A project dashboard showed up despite "no dashboard" on day one. Config split into one file per concern. |
| Week 2 (10 to 11 Sep) | Driving the sessions: a session picker, steering a running turn, forking a session, diffing an agent's working tree. Workers get their own git worktree. Agent buffers get generated titles from the first prompt. |
| Week 3 (16 to 17 Sep) | Living in it. Reveal the path under point in Finder, Quick Look for images (a terminal Emacs can't draw pictures). `EDITOR=emacsclient` inside vterm, after getting trapped in nvim inside vterm inside Emacs. The dashboard finds pull requests from whichever forge the repo pushes to. |

## What it looks like now

- One window. [Ghostty](https://ghostty.org) runs one Emacs. Editing, terminals, agents, git, tasks, and todos are all buffers, with a Doom workspace per project.
- Agents are buffers. `SPC a l`, `SPC a c`, and `SPC a p` start Claude, Codex, or pi in the current project. Each buffer knows its model, thought level, state, and title.
- Attention is a protocol event. A mode-line count, a sound, and `SPC a n` jumps to whoever has waited longest.
- Agents spawn agents. `emacs-agent` is a CLI any agent can call: start a hidden worker, prompt it, wait, read, report, kill. The shape is one architect, an optional team lead, and workers on cheaper models in their own worktrees.
- Remote Control is the escape hatch. When I need the phone, the real Claude TUI runs in a tracked vterm, and an ACP session can move into it by id.
- The dashboard is the home screen. `SPC p p` opens git state, agents, mise task terminals, recent files, org todos, and PRs, with single-key actions for each.
- Everything is declared. Doom's profile is built by Nix, the config is a symlink into the repo, and `mise run emacs:check` catches compile errors before a reload.
- Docs follow Diátaxis, and every gotcha that bit me went into a troubleshooting reference.

![The project dashboard: git status, running agents with model and effort, mise tasks, and open PRs in one magit-section buffer](/images/emacs/project-dashboard.png)

![An agent buffer waiting on a permission prompt, with the attention count in the mode line](/images/emacs/agent-attention.png)

## What happened to tmux

I barely use [tmux](https://github.com/tmux/tmux) locally anymore. Everything I used to reach for it for, a scratch shell here, a long-running process there, is a popup vterm now, one key away and gone when I'm done. On remote machines it's still very nice to have, and I'm not giving it up there. But on my own boxes, the need just went away.

## Why I'm staying

Everything is customizable, but that's not what made me stick. What made me stick is that changes are a prompt away. There are help files everywhere, and I still use them, but a quick edit for something I want, like a custom project dashboard, is very nice.

I won't write a ton of posts on Emacs (at least I don't think I will). But in the current AI era, having an editor (IDE??) this customizable can only be a boon. This isn't a knock on herdr, which is a great project. It's just that the more little tools I created, downloaded, or added, the more I realized I needed an environment that could support any functionality I might want. And that's what Emacs has become for me.

Thanks for reading :D

-Pachev
