---
title: "lnav Is A Nice Log Viewer"
date: 2026-02-20
tags: ["cli", "kubernetes", "logging"]
---

I was tailing Kubernetes logs with `kubectl` and hit an issue when trying to scroll up and search. Piping to `less` doesn't stream, so you miss new output. Using `less +F` follows the stream, but you have to hit `Ctrl+C` before you can scroll or search. It's clunky.

Then I found [lnav]. It handles streaming log output natively, so you can pipe `kubectl` logs straight into it:

```bash
k logs deploy/my-service -n my-namespace -f | lnav
```

New lines appear in real time and you can scroll up, search, filter, all without stopping the stream. It also auto-detects common log formats, highlights errors, and lets you run SQL queries against your logs.

If you're spending any amount of time reading logs in a terminal, `lnav` is worth the install.

[lnav]: https://lnav.org/
