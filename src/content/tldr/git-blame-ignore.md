---
title: "Excluding commits from git blame"
date: 2024-05-07
tags: ["git", "tips", "development"]
---

# Git Blame Ignore Feature

TL;DR: You can exclude specific commits from git blame using:

```bash
git blame --ignore-rev <rev-id> <file>
```

For permanent configuration:

1. Create `.git-blame-ignore-revs` file with commit hashes to ignore
2. Configure git to use it:
```bash
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

Bonus: Enable "?" icon for skipped revisions:
```bash
git config blame.markIgnoredLines true
```

This is super useful for:
- Reformatting (tabs to spaces)
- Code style fixes
- Whitespace changes
- Spelling corrections
- Any mass changes that aren't actual code changes

Works in IntelliJ IDEs when properly configured!

[Official Documentation](https://git-scm.com/docs/git-blame#Documentation/git-blame.txt---ignore-revltrevgt)
