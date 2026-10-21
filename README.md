# Datum design system

Design tokens, components and docs for **Datum**, a fictional observability platform for engineering teams. Built as a portfolio project to learn an AI-assisted workflow from Figma variables to a live coded prototype.

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
tokens/contrast-report.json   every pair in scripts/contrast-rules.mjs, light + dark
                              (82 since Stage 3; build fails below WCAG 2.2 AA)
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

Dark mode: light is the default. Dark values are in `$extensions["io.github.sytnykk.datum"].modes` in tokens.json, and under `[data-theme="dark"]` / `prefers-color-scheme: dark` in tokens.css. `data-theme` works on any element, not only the page, because the Tailwind theme is `inline` (each class points straight at its token).

## Components

`src/components/` (React + Tailwind v4 + TypeScript). Prop names match the Figma component properties.

| Component | Figma | Notes |
|---|---|---|
| `Button` | Button page → Button (72 variants) | `variant`, `size`, `iconStart`, `iconEnd`, `disabled`, `loading`, `asChild` (Radix Slot). Hover, pressed, focus are CSS states. |
| `IconButton` | Button page → IconButton (72 variants) | Square. `aria-label` is required; a type test fails the build if an unlabeled one compiles. |
| `Spinner` | Icons page → spinner | Used by the loading state. |

Icons: Phosphor, Bold weight (matches Geist Medium stems). Buttons apply the weight and size; pass `<Plus />`.

State variants live in `src/components/components.css`: `can-hover`, `can-press` (skip disabled/loading; hover only on devices that hover), `focus-ring`, `is-disabled`, plus the `touch-target` and `focus-ring-button` utilities.

## Scripts

- `npm run tokens`: rebuild token files from `figma/variables.raw.json`
- `npm run dev`: docs site locally
- `npm run typecheck`: type-check the components (includes the IconButton aria-label test)
- `npm run build`: check tokens, type-check, build the site
