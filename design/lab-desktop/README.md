# Lab desktop environment design

Design source for the /lab fake desktop environment. The live, editable canvas is at
https://claude.ai/code/artifact/c2c35aad-a36c-4143-ae2e-6ab28a576967 and the phased build
plan lives in the repo issues (phase 1: #3, phase 2: #4, phase 3: #5).

## The arc

Calm sage site, click LAB, skippable boot screen, full-viewport dark desktop with a
waybar and four workspaces (1:NETWORK, 2:COMPUTE, 3:STORAGE, 4:LOG). Journal entries in
4:LOG open as regular light Astro articles. Everything outside /lab stays calm.

## Files

- `Boot.dc.html`, `Main.dc.html`, `Compute.dc.html`, `Storage.dc.html`, `Journal.dc.html`:
  the five artboards, plain HTML/CSS, openable in a browser
- `canvas.json`: artboard layout plus annotations (tokens, data rules, phases)
- `reference-final-render.png`: north-star mood render (NERV/Eva-industrial). Not one to
  one; phase 1 ships the flat artboard look, later phases pull toward this.

## Tokens

Derived from the home page terminal card so LAB reads as stepping inside that card.

| Token | Value |
|---|---|
| room bg | `#121411` |
| surface | `#191b18` |
| raised surface | `#1f221d` |
| border | `#2e312b` |
| border bright | `#3a3e36` |
| text | `#c9cec4` |
| bright | `#f2f0e9` |
| muted | `#6d7268` |
| dim | `#4c5148` |
| sage | `#a3b3a0` |
| accent | `#829280` |
| warn | `#d4b483` |
| err | `#c98a7d` |
| boot bg | `#0d0f0c` |
| window shadow | `10px 10px 0 rgba(0,0,0,.45)` |

Type: JetBrains Mono Nerd Font everywhere. No border-radius. Waybar 48px.
Micro-labels 9 to 12px with letter-spacing 0.14 to 0.26em.

## Rules

- Inventory is real (katzenbase HomeLab project) but IPs, VLAN ids, and SSIDs never
  appear on the public page
- Telemetry numbers are plausible fakes seeded at build time; a later upgrade can read a
  static JSON exported from VictoriaMetrics on cron
- Motion: GSAP for cinematic beats, CSS/SVG transitions for micro-interactions
- Non-negotiables: prefers-reduced-motion support, noscript fallback is a plain list,
  articles stay normal Astro pages
