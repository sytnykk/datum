# Datum design system

Design tokens and docs for **Datum**, a fictional observability platform for engineering teams. Built as a portfolio project to learn an AI-assisted workflow from Figma variables to a live coded prototype.

Live docs: https://sytnykk.github.io/datum/
Figma: https://www.figma.com/design/qYrAS6I0CwM9veRdhMSb20

## How tokens get from Figma to code

```
Figma variables + text styles
  │  scripts/figma-export.js, run read-only through Figma MCP (use_figma)
  ▼
figma/variables.raw.json      exact export + checksum
  │  npm run tokens  (scripts/build-tokens.mjs: verifies, validates, converts)
  ▼
tokens/tokens.json            W3C Design Tokens Format 2025.10
src/tokens/tokens.css         CSS variables, light + dark
src/tokens/tailwind-theme.css Tailwind v4 theme
  │  git push → GitHub Actions: re-check tokens, build, deploy
  ▼
sytnykk.github.io/datum
```

To sync after changing Figma, ask Claude to **run sync-tokens** (see `.claude/skills/sync-tokens/SKILL.md`).

Why not a scheduled GitHub Action? Figma's variables REST API needs an Enterprise plan; this file is on Starter.

## Naming

Figma name = token path = CSS name = Tailwind class:

| Figma | tokens.json | CSS | Tailwind |
|---|---|---|---|
| `bg/surface` | `bg.surface` | `--color-bg-surface` | `bg-surface` |
| `text/muted` | `text.muted` | `--color-text-muted` | `text-muted` |
| `space/12` | `space.12` | `--space-12` | `p-12`, `gap-12` |
| `radius/sm` | `radius.sm` | `--radius-sm` | `rounded-sm` |
| text style `mono/xl` | `type.mono.xl` | `--text-mono-xl` | `type-mono-xl` |

Figma scopes carry over: a `bg/*` token only makes background classes, so `bg-text-default` doesn't exist. Tailwind's default colours, spacing and radii are switched off, so off-system values like `p-10` or `bg-red-500` don't compile.

Dark mode: light is the default. Dark values are in `$extensions["io.github.sytnykk.datum"].modes` in tokens.json, and under `[data-theme="dark"]` / `prefers-color-scheme: dark` in tokens.css.

## Scripts

- `npm run tokens`: rebuild token files from `figma/variables.raw.json`
- `npm run dev`: docs site locally
- `npm run build`: check tokens and build the site
