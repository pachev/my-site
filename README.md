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

`/lab` presents the homelab as an interactive desktop. Public node inventory and
dated host readings live in `src/data/labSnapshot.ts`, shared by compute panels,
network inspectors and the read-only `htop` command. Process demonstration rows
are labeled separately in `src/data/lab-processes.json`. Metrics never imply a
live connection. LOG links existing writing; deployment notes stay in
`LabLog.astro`. See [Lab desktop](docs/reference/lab-desktop.md) for controls,
data provenance, the architecture walkthrough and regression checks.

## Docs

Working docs live in [`docs/`](docs/README.md) (Diataxis layout). Start with
[Draft a post with AI help](docs/how-to/draft-a-post-with-ai.md).
