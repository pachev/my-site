# pachevjoseph.com

Personal portfolio website built with Astro. Features blog posts and Today I Learned (TIL) entries for sharing notes and tips.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 📝 Content Types

### Blog Posts
Long-form articles with full markdown support. Each post requires:
- Title
- Date
- Description
- Tags (optional)

### Today I Learned (TIL)
Quick notes and things I've learned along the way. Shorter than blog posts, focused on specific tips or learnings. Each TIL entry requires:
- Title
- Date
- Tags (for filtering)

## 🔍 Features

- **Tag filtering**: Filter TIL entries by tags to find specific topics
- **Responsive design**: Works on mobile, tablet, and desktop
- **Markdown support**: Write content in markdown format

### Lab inventory

`/lab` presents the homelab as an interactive desktop. Keep node summaries in
`src/components/lab/LabNetwork.astro`, compute panels in `LabCompute.astro`,
and the node inspector data in `src/scripts/labWindowManager.ts` consistent. Dated
deployment notes belong in `LabLog.astro`.

The S13 hosts Jellyfin in NixOS LXC 212, with Intel GPU transcoding and
read-only NAS media mounts. CPU and RAM gauges are illustrative values,
not live telemetry.
