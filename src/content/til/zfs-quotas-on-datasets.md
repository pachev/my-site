---
title: "ZFS Can Set Quotas on Datasets"
date: 2026-02-16
tags: ["zfs", "til", "backups", "homelab"]
---

# ZFS Can Set Quotas on Datasets

I was setting up [Arq] to back up my Mac to my NAS and realized I didn't want my backups to eventually consume all available storage. ZFS makes this trivially easy with quotas.

First, create a dedicated dataset for backups:

```bash
sudo zfs create my-nas/arq-backups
```

Then set compression (might as well):

```bash
sudo zfs set compression=zstd my-nas/arq-backups
```

And finally, cap it at 200GB:

```bash
sudo zfs set quota=200G my-nas/arq-backups
```

That's it. Now Arq sees a 200GB volume and will manage retention accordingly, while my other datasets stay protected from backup bloat.

[Arq]: https://www.arqbackup.com/
