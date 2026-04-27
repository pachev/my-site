---
title: "docker buildx Has a --push Flag"
date: 2026-04-27
tags: ["docker", "cli", "til"]
---

I've been doing `docker buildx build` and then `docker push` as two separate commands. Turns out `buildx build` takes a `--push` flag that handles both.

```bash
docker buildx build --platform linux/amd64,linux/arm64 --push -t myrepo/myimage:latest .
```

For multi-arch images it's not just a shortcut. The manifest has to live in the registry for the image to work across architectures, 
so plain `docker push` on a local multi-arch build doesn't really do what you want.