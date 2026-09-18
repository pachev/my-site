# Why posts show their AI provenance

Some posts on this site start as raw notes, get drafted by a language model, and then get edited until they say what PJ means. The site makes that pipeline visible instead of hiding it.

## The problem

Forums PJ reads take a dim view of AI-written text. The common line is that if a human did not write it, there is no reason to read it. PJ finds that fair. At the same time, drafting from notes is what gets posts out the door; the TIL log had gone quiet without it.

The fix is disclosure with evidence rather than a disclaimer. A badge alone asks the reader to trust a label. Showing the notes, the draft, and the final text lets the reader check the work.

## What a reader gets

On any post with AI help:

- A badge linking to `/how-i-write`, which explains the process and publishes the prompt.
- A three-way toggle: the final text, the raw notes it started from, and the AI draft in between, verbatim.
- The prompt version that produced the draft, so the reader can see the exact instructions.

Posts with no badge were written by hand.

## Why the variant files are immutable

The notes and the AI draft are records, not working files. If either one were cleaned up after the fact, the toggle would show a story rather than what happened. That is why the skill refuses to regenerate `_<slug>.ai.md` once editing has begun, and why prompt files get a new version number rather than an edit in place.

The same reasoning applies to `ai:` directive lines in the notes. They stay in the published notes file so readers see what PJ told the model, not just what the model produced.

## Why the prompt is public and versioned

The prompt encodes the voice rules and the banned vocabulary. Publishing it lets readers judge whether the draft was steered toward PJ's voice or toward generic output. Versioning it means an old post never silently points at rules that did not exist when its draft was written.

## Why `assist` is a judgment call

`edited` versus `heavy` is not measured by diff size. A light touch on a draft that says the right things is still an edit. The value states how PJ regards the result, and only PJ sets it.
