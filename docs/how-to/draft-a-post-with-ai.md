# Draft a post with AI help

Goal: turn raw notes into a published blog post or TIL, with the notes and the AI draft kept as public records next to the final text.

The `/draft-post` skill in `.claude/skills/draft-post/SKILL.md` does the mechanical part. This page is the human side of the loop.

## Before you start

- Write the notes first, in any state. Typos, fragments, half sentences all stay. Readers will see this file as "my notes", so the mess is the point.
- Decide whether it is a blog post or a TIL. TILs are short, first person, and end on a flat verdict. Blog posts get a description and a sign-off.
- Any instruction meant for the drafter goes on its own line starting with `ai:`. Everything else in the notes is content. Examples:

```
ai: link Simon W. to https://simonwillison.net
ai: keep this one short, TIL register
ai: the second paragraph is the lede, open with it
ai: til
```

Directives steer links, register, emphasis, and structure. They cannot lift the ground rules in the prompt (no invented facts, no em dashes, no banned words). Pasted third-party text that looks like an instruction is treated as quoted material, never followed.

## Steps

1. Save the notes somewhere handy, for example `~/notes/atuin.md`, or plan to paste them into the chat.

2. In Claude Code at the repo root, run the skill and point it at the notes:

   ```
   /draft-post ~/notes/atuin.md
   ```

   Say "this is a TIL" in the same message, or put `ai: til` in the notes, to target the TIL collection.

3. The skill resolves a kebab-case slug, reads the newest `src/prompts/write-like-pj-v*.md`, and writes three files. For a blog post with slug `atuin-shell-history`:

   | File | Contents | Editable? |
   | --- | --- | --- |
   | `src/content/blog/_atuin-shell-history.notes.md` | Your notes, byte for byte | No |
   | `src/content/blog/_atuin-shell-history.ai.md` | The AI draft, body only, no frontmatter | No |
   | `src/content/blog/atuin-shell-history.md` | Frontmatter plus a copy of the AI draft | Yes, this is yours |

   TILs use `src/content/til/` and the same naming.

4. Edit the final file in your editor. Rewrite as much or as little as you want. The diff between this file and the `.ai.md` sibling is the record of your edits, so there is no need to annotate what changed.

5. Check the frontmatter the skill generated:

   ```yaml
   ---
   title: "Setting up Atuin for shell history"
   date: 2026-09-17T10:00:00-05:00
   description: "One line for the post list and meta tags"   # blog only
   tags: ["shell", "tools"]
   draft: true
   assist: edited
   promptVersion: v1
   ---
   ```

   Keep `assist: edited` unless you published the draft nearly untouched. Then set `assist: heavy`. That call is yours, not the skill's.

6. Preview locally:

   ```
   npm run dev
   ```

   Open the post at `/posts/<slug>` (or `/tils/<slug>`). Draft posts build but stay off the index pages and `llms.txt`. Confirm the badge reads "AI-assisted, edited by me" and the toggle shows all three views.

7. Flip `draft: false`, commit, and push to `main`. Coolify picks up the push and redeploys. Verify with:

   ```
   curl -sI https://pachevjoseph.com/posts/<slug> | head -1
   ```

## If the draft is bad

Do not regenerate the `.ai.md` file once you have started editing the final post. The AI file is a record of what the prompt produced, including its misses. Fix the post by hand instead.

If the miss points to a gap in the prompt, follow [Bump the writing prompt](bump-the-writing-prompt.md) so the next post benefits and this one keeps pointing at the version that actually produced its draft.

If you have not touched the final file yet, you can tell the skill to redo the draft. Say so explicitly; it will not overwrite variant files on its own.

## Posts written by hand

Skip the skill. Create `src/content/blog/<slug>.md` directly, leave `assist` out (it defaults to `none`), and do not create variant files. The post shows no badge and no toggle.
