# Bump the writing prompt

Goal: change how AI drafts sound without breaking the link between old posts and the prompt that produced them.

## Rules

- Never edit an existing `src/prompts/write-like-pj-v<n>.md`. Old posts cite it by version, and readers can compare the draft with the prompt.
- Every new version gets a changelog entry on the public page.

## Steps

1. Copy the current highest version to the next number:

   ```
   cp src/prompts/write-like-pj-v1.md src/prompts/write-like-pj-v2.md
   ```

2. Edit the new file. Bump the heading to match (`# Write like PJ, v2`). Typical reasons: a new slop word to ban, a voice rule the drafts keep missing, a new register.

3. Update `src/pages/how-i-write.astro`:
   - Import the new file with `?raw` and render it in the prompt box as the current version.
   - Add an entry to the `versions` array, newest first, with the version, month, and a one-line note on what changed.

4. Run `npm run build` to confirm the page compiles.

5. New posts drafted after this commit get `promptVersion: v2` from the skill automatically, since it always reads the highest-numbered file. Existing posts keep their old value.
