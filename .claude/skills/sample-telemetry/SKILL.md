---
name: sample-telemetry
description: Sample live homelab metrics and bake them into src/data/lab-telemetry.json so the /lab dashboard shows realistic numbers at build time
---

# Sample lab telemetry

The /lab desktop shows fake-but-plausible telemetry. This skill refreshes those numbers
from the real homelab so the fakes stay honest. Run it on request, or before a deploy
when PJ wants fresh numbers.

## Endpoint

Never hardcode internal hosts in this public repo. The metrics endpoint comes from the
environment:

- `LAB_METRICS_URL`: base URL of the VictoriaMetrics instance (Prometheus-compatible
  `/api/v1/query`). Grafana also fronts the same data on the .lan network if a dashboard
  view helps.
- If the variable is unset, ask PJ to export it (it lives on his shell or in an untracked
  `.env.local`). Do not guess hostnames and do not write any resolved hostname or IP into
  a tracked file.

## What to collect

Query per node (hosts: ser5-proxmox, pve-ser-24gb, security-pve, s13-proxmox, joseph-nas;
telegraf tags them by host):

- CPU percent: `100 - avg by (host) (cpu_usage_idle{cpu="cpu-total"})`
- RAM percent: `mem_used_percent`
- ZFS pool capacity percent and pool size for joseph-nas (zfs series)

## Output

Write `src/data/lab-telemetry.json`:

```json
{
  "sampledAt": "2026-08-19T21:00:00Z",
  "nodes": { "ser5-proxmox": { "cpu": 24, "ram": 63 }, "...": {} },
  "pool": { "usedPercent": 68, "usedTiB": 2.7, "totalTiB": 4.0 }
}
```

Round to whole percents (one decimal for TiB). The JSON holds NO IPs, NO internal
hostnames beyond the node names that already appear on the public page, and NO extra
labels copied from query results. If a node is unreachable, keep the previous value for
it and say so.

The lab page imports this file at build time; client JS only wiggles the values for the
alive feeling. If the file is missing, the page falls back to its built-in defaults, so
this skill is always optional.
