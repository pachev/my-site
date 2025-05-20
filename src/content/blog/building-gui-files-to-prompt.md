---
title: "Building a GUI for simonw's files-to-prompt"
date: 2025-05-12T09:00:00-08:00
description: "How I built a visual interface for files-to-prompt using Python, uv, ruff, and two of the big LLMs"
tags: ["python", "llm", "tools", "side-projects"]
draft: false
---

# Building a GUI for files-to-prompt

I recently discovered Simon Willison's [files-to-prompt](https://github.com/simonw/files-to-prompt) tool, which is brilliant for converting a directory of files into a prompt for LLMs. While the command-line version is powerful, I wanted a visual way to see what files I was sending and to have more interactive control.

So I built a [GUI version!][context-builder] This project has become pretty useful for me, but it also gave me an excuse to try some new Python tools like [uv](https://github.com/astral-sh/uv) and [ruff](https://github.com/astral-sh/ruff). I used a mix of Gemini and Claude to more or less vibe-code the final output. I did verify outputs manually but towards the end, I embraced Claude Code and experienced the dark side of vibe coding :).

I initially wanted to build this as a native Mac OS app. But after talking to Claude, I realized that the simplest path was just to use Python to give me the excuses I needed to use the tools above. This doesn't mean that in the future I won't build a native Mac OS app, as I've always been interested in doing that.

![Screenshot of the GUI Files-to-Prompt application](/images/posts/building-gui-files-to-prompt/1.png)

## Inspiration

Two main tools inspired this project:

1. Simon Willison's [files-to-prompt](https://github.com/simonw/files-to-prompt) - A CLI tool that takes a directory of files and formats them for use in LLM prompts
2. [Prompt Tower](https://github.com/backnotprop/prompt-tower) - A tool that helped me think about the visual organization and prompt management

## Why Build a GUI?

Command-line tools are great, but sometimes I want to:

- Visually see which files I'm including in the prompt
- Quickly include/exclude specific files
- Preview the formatting before sending to an LLM
- Save commonly used file groups for reuse

## Using uv and ruff

### UV

UV is a new kid on the block. Before this, I moved from virtualenvs, to poetry, to finally pyenv. So, to keep up with the cool kids, I decided to give uv a try. 
I use nix, so it was as simple as adding it to my config. For certain files, I like to use the nix-darwin and still install via homebrew, and this was what I did
here. 

The speed difference was noticeable, especially when setting up the initial environment.

### ruff

ruff is an extremely fast Python linter and formatter, replacing tools like flake8, black, isort, and more in a single tool. It's made by the same people who 
make uv. It was so fast that I had to add errors to make sure it was actually running. It's ridiculously fast. I configured it in my pyproject.toml:

```toml
[tool.ruff]
line-length = 120
output-format = "grouped"
target-version = "py37"

[tool.ruff.lint]
select = [
  # isort
  "I",
  # bugbear rules
  "B",
  # remove unused imports
  "F401",
  # bare except statements
  "E722",
  # unused arguments
  "ARG",
  # typing.TYPE_CHECKING misuse
  "TC004",
  "TC005",
  # import rules
  "TID251",
]
ignore = [
  # mutable defaults
  "B006",
  # function calls in defaults
  "B008",
]


[tool.ruff.lint.isort]
length-sort = true
length-sort-straight = true
combine-as-imports = true
extra-standard-library = ["typing_extensions"]

[tool.ruff.format]
quote-style = "single"
docstring-code-format = true
```

And the auto-formatting was seamless:

```bash
ruff check . --fix
ruff format .
```

## Mixing Gemini and Claude

One interesting aspect of this project was using different LLMs for different parts of the development:

- I used **Gemini 2.5 Peview** for thinking about the initial UI layout and basic structure
- I used **Claude Code** to save me typing too much. 

This approach worked well enough:

- Claude was excellent at generating boilerplate UI code
- Gemini Pro excelled at understanding complex requirements and fixing subtle bugs. I even used the tool iteself to past the context to Gemini the moment it became semi usable. 

Side Note: I actualy used the cli version of files-to-prompt to copy the context of files-to-prompt that I fed to Gemini. There should be a term for this :). 


## Key Features

The final application includes:

1. Directory browser to select files
2. Preview of formatted prompt
3. Token count estimation for the prompt
3. Toggle for different formatting styles
4. Easy copy to clipboard
5. Save/load file selections
6. Error handling for unreadable files
7. An optional project tree at the top

![Preview of the formatted prompt](/images/posts/building-gui-files-to-prompt/4.png)

## Lessons Learned

Building this tool taught me a few things:

1. Python is somewhat viable for a GUI using the PyQT 6 framework
2. uv and ruff are just as cool as they've been hyped up to me
3. Using different LLMs for different tasks can be very effective

## What's Next

I'd like to extend this tool with:

- Better pattern-based file matching
- More sophisticated file previews
- Custom template support for context output
- Prefixes and suffixes for context output
- Integration with LLM APIs to send prompts directly (very far off in the future or never at all.)

## Final Thoughts

Building this thing was a perfect distraction from life and work :D. I'm excited about this era of coding where we can quickly build personalized tools that enhance our workflows.
I really wasn't sure what license to put on this thing. I didn't actually use any of the code from either project but I did use them as inspiration. I'm assuming this means
derivative work. I just copied over the license from files-to-prompt. If you think I should change it, please let me know.


Thanks for reading! :D

-Pachev

[files-to-prompt]: https://github.com/simonw/files-to-prompt
[prompt-tower]: https://github.com/PromptTower/prompt-tower
[context-builder]: https://github.com/pachev/context-builder
