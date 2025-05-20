---
title: "Quick React App Scaffolding with bolt.new"
date: 2025-05-15
tags: ["react", "development", "tools", "llm", "scaffolding"]
---

# TIL: Get a Good First-Shot UI with bolt.new

I discovered a great way to quickly scaffold a React application with sensible defaults using [bolt.new](https://bolt.new). 
You can give bolt.new a specific prompt to get exactly what you need.

Here's the prompt I used to get a React + Vite + TypeScript setup with all the modern tooling:

```text
Stack → React + Vite + TypeScript, Tailwind CSS, shadcn/ui, lucide-react, zustand, zod, tanstack/react-query, tanstack/react-table, react-hook-form
Data layer → read/write flat JSON files in `src/data` via an `ApiService.ts` wrapper whose methods mirror real REST calls (later swappable). Uses TanStack Query.  
Auth → role enum [`superAdmin`,`admin`, `user`]; store currentRole in `AuthContext` using zustand, no real login yet.  
Routing → React-Router v6.  
UI → dark-mode support, responsive, use lucide icons & shadcn components. Color picker support for theming (primary/secondary color in settings page). 
Folder scheme:  
  • `src/components` – reusable UI  
  • `src/features/<domain>` – ducks pattern per domain  
  • `src/data/*.json` – seed data  
  • `src/services/ApiService.ts`  
  • `src/lib` – shared code
  
  <add your specifics here>
```

The folder structure follows modern best practices, and the tech stack is pretty decent. I usually do this
to get a scaffold going. You can exclude the JSON file portions if you do want that Supabase integration. I usually don't. 

The workflow is simple:
1. Go to https://bolt.new
2. Paste in the prompt and include your spec
3. Make initial edits directly in bolt.new to get it exactly how you want.
4. Either have it commit the code to a repo or download the archive to continue yourself

This is my preferred approach for now and then I continue with Claude Code.