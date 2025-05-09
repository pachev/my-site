# pachevjoseph.com

Personal portfolio website built with Astro. Features blog posts and quick TLDRs for sharing notes and tips.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `bun install`             | Installs dependencies                            |
| `bun run dev`             | Starts local dev server at `localhost:4321`      |
| `bun run build`           | Build your production site to `./dist/`          |
| `bun run preview`         | Preview your build locally, before deploying     |
| `bun run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `bun run astro -- --help` | Get help using the Astro CLI                     |
| `bun run new:post`        | Create a new blog post with interactive prompts  |
| `bun run new:tldr`        | Create a new TLDR with interactive prompts       |

## 📝 Content Types

### Blog Posts
Long-form articles with full markdown support. Each post requires:
- Title
- Date
- Description
- Tags (optional)

Create new posts with `bun run new:post`.

### TLDRs
Quick notes and tips with markdown support. Shorter than blog posts, focused on specific tips or learnings. Each TLDR requires:
- Title
- Date
- Tags (for filtering)

Create new TLDRs with `bun run new:tldr`.

## 🔍 Features

- **Tag filtering**: Filter TLDRs by tags to find specific topics
- **Responsive design**: Works on mobile, tablet, and desktop
- **Markdown support**: Write content in markdown format
- **Fast content creation**: Use built-in scripts to quickly create new posts and TLDRs