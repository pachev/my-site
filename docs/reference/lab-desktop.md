# Lab desktop

`/lab` uses a dark desktop separate from the homepage. The shell, themes,
Konami sequence and inspector drag/tiling remain local browser interactions.

## Controls

- Click workspaces or press 1–4. Tabs support Space, Enter, Left/Right, Home/End.
- Space on the desktop background opens the shell. Focused controls retain their
  normal Space behavior. The launcher also opens the shell.
- Escape closes the active modal. Boot, shell and trace keep Tab focus inside;
  closing restores focus to the launcher (or the selected workspace after boot).
- Inspectors support pointer dragging, double-click tiling and Super+Q closing.
- Shell commands include help, fastfetch/neofetch, htop, clear and the existing
  joke/rebuild commands. Up/Down browse command history.

## Inventory and resource readings

`src/data/labSnapshot.ts` holds public node inventory shared by compute panels,
network inspectors and htop. PJ supplied the snapshot checked by his other agent
on October 1, 2026, 08:30–08:37 CDT. This implementation did not independently
query infrastructure. Gauges are frozen, dated readings; they do not randomize.
Missing NAS CPU/RAM readings display N/A. The clock shows browser-local time and
is separate from the sampling time.

Storage distinguishes two mirrored 4 TB drives, six configured NFS export paths
and four Proxmox storage definitions. The four displayed export uses are selected
existing examples, not a complete list of all six paths. Resource readings do not
assert current health. Private operational caveats are excluded from public data.

`src/data/lab-processes.json` supplies a separate synthetic process demonstration
for htop. The demo IDs, commands and per-process resource values are not observed
processes. htop labels this separately from the host snapshot. Sort controls only
reorder the demo rows. No commands send signals or connect to infrastructure.
Replace fixtures only with sanitized, explicitly sourced data, preserving a dated
snapshot or demo label. Do not add addresses, credentials or account identifiers.

## Writing

`src/lib/labArticles.ts` curates the existing NixOS and Atuin blog posts and ZFS
TIL, alongside any published Lab articles. Titles, dates and draft status come
from the content collections. LOG and the no-JavaScript fallback share these
links. Article dates render in UTC to avoid moving date-only metadata to the
previous day on a developer's machine. Deployment notes remain separate.

## Trace this page

The Network hintbar opens an interactive architecture walkthrough. It does not
probe services or report latency. The repository documents Cloudflare Tunnel
in the network inventory, Coolify on the SER5 in the compute inventory, and
redeployment on a push to main in `docs/how-to/draft-a-post-with-ai.md`.
`astro.config.mjs` uses default static output with MDX. Tunnel connector location,
DNS/cache/TLS settings, origin serving and reverse proxy configuration are absent
from the repository and labeled unknown in the walkthrough.

## Validation

Run `npm ci`, `npm run check`, `npm run build`, and `npm test`.
Install the browser once with `npx playwright install chromium` if unavailable.
The browser tests use Chromium and cover desktop/narrow Storage, homepage fit,
modal focus, workspace keys, writing links/history, trace steps/reopening, shell
commands, frozen snapshots, and inspector pointer behavior. There is no configured
lint tool; `git diff --check` checks whitespace.
