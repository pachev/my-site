# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website built with Astro. It uses TypeScript and MDX for content.

## Commands

- **Development:** `bun run dev` or `bun start`
- **Build:** `bun run build`
- **Preview Build:** `bun run preview`
- **Astro CLI:** `bun run astro -- <astro_command>` (e.g., `bun run astro -- add react`)

*Note: Linting and testing commands are not explicitly defined in `package.json`.*

## Code Style Guidelines

- **Framework:** Astro
- **Language:** TypeScript (strict mode enabled via `tsconfig.json`)
- **Content:** MDX is used alongside Markdown.
- **Formatting:** Follow standard Astro/TypeScript/MDX formatting conventions. Use Prettier if configured (check `package.json` or config files).
- **Imports:** Use standard ES module imports.
- **Naming:** Follow TypeScript conventions (e.g., `camelCase` for variables/functions, `PascalCase` for types/interfaces/components).
- **Types:** Adhere to strict TypeScript typing. Define types where appropriate.
- **Error Handling:** Use standard JavaScript/TypeScript error handling (try/catch).
- **Components:** Astro components (`.astro`) are used for UI structure and layout.
- **Styles:** CSS modules or global styles can be used. Check for any existing styles in the project.
