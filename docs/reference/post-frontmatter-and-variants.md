# Post frontmatter and variant files

The schema lives in `src/content/config.ts`. Four collections exist: `blog`, `til`, `lab`, and `essays`. Only `blog` and `til` support AI provenance fields.

## Frontmatter

| Field | blog | til | Notes |
| --- | --- | --- | --- |
| `title` | required | required | |
| `date` | required | required | ISO date, optionally with time and offset (`2026-08-06T14:00:00-05:00`) |
| `description` | required | absent | The TIL schema has no description |
| `tags` | optional | optional | Defaults to `[]` |
| `draft` | optional | optional | Defaults to `false` |
| `assist` | optional | optional | `none` (default), `edited`, or `heavy` |
| `promptVersion` | optional | optional | Matches a file in `src/prompts/`, for example `v1` |

`assist` values:

- `none`: written by hand. No badge, no toggle.
- `edited`: AI draft that PJ reworked. Badge reads "AI-assisted, edited by me".
- `heavy`: published mostly as the AI wrote it. Badge reads "Mostly AI-written".

## Variant files

Posts with `assist` other than `none` can ship two sibling files in the same folder:

| File | Purpose |
| --- | --- |
| `_<slug>.notes.md` | PJ's raw notes, verbatim, including any `ai:` directive lines |
| `_<slug>.ai.md` | The AI draft, markdown body only, no frontmatter |

The leading underscore keeps them out of the content collection, so they never become pages of their own. The post page (`src/pages/posts/[slug].astro`, and the TIL equivalent) globs for them by slug and passes them to `PostVariants.astro`, which renders the final / notes / AI draft toggle. A missing file just hides that tab.

The toggle footer links to `/how-i-write` with the `promptVersion` value.

## Draft behavior

`draft: true` posts still get a static route, so they preview at `/posts/<slug>` in dev and in the built site. They are filtered out of the post index, the TIL index, and `llms.txt`.

## Prompt versions

`src/prompts/write-like-pj-v<n>.md` files are immutable once committed. The `/draft-post` skill reads the highest-numbered one. `src/pages/how-i-write.astro` renders the current prompt and a changelog of all versions.

## Skill

`.claude/skills/draft-post/SKILL.md` is the source of truth for the drafting steps, the `ai:` directive rules, and the no-overwrite rules for variant files.
