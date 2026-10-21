---
name: sync-tokens
description: Sync Datum's design tokens from Figma to code and the live docs site. Use when Sasha says "sync tokens", "run sync-tokens", or has changed variables or text styles in the Datum Figma file and wants code updated.
---

# sync-tokens

Pulls Datum's Figma variables and text styles into `sytnykk/datum`, rebuilds tokens.json, CSS and the Tailwind theme, and publishes the docs site. Figma is the source of truth; the token files in the repo are never edited by hand.

Why it runs through Figma MCP: Figma's variables REST API is Enterprise-only, so a GitHub Action can't read the Starter file. The export runs as a read-only Plugin API script through `use_figma`, which also doesn't use the Starter plan's design-read quota.

## Inputs
- Figma file key: `qYrAS6I0CwM9veRdhMSb20` (Datum, Observability platform for engineering teams)
- Repo: `sytnykk/datum`, branch `main`. Attach it if it isn't in the session; clone or pull it first.

## Steps
Say in one line what each step does before running it.

1. **Get the repo current.** `git pull` (or clone). Run `npm ci` if `node_modules` is missing.
2. **Export from Figma (read-only).** Load the Figma `figma-use` skill, then call `use_figma` on the file with the exact contents of `scripts/figma-export.js`. Don't edit the script inline; if it needs changing, change the file and commit it.
3. **Save the export verbatim** to `figma/variables.raw.json`: the returned JSON exactly as returned, one line, nothing added or reformatted.
4. **Build.** Run `npm run tokens`.
   - `Checksum mismatch` means the copy in step 3 wasn't exact. Re-run steps 2–3. Never hand-edit the raw file to make it pass.
   - Any other error is a real problem in Figma (a semantic token without a dark twin, a missing code syntax, a raw colour where an alias belongs). Show the message, explain it in one line, and stop: the fix belongs in Figma.
5. **Report the change list** the build prints (`~` changed, `+` added, `-` removed), in plain words, e.g. "indigo/600 changed #3345E6 → #2F40DB; bg/accent and focus/ring follow it in light mode".
   - If anything was **removed or renamed**, ask before continuing: components may depend on it.
   - If a **colour** changed, note that contrast isn't rechecked automatically yet (planned for Stage 5). Flag the known tight pair: text/error on bg/error-subtle in light mode is 4.52:1, minimum 4.5.
   - If nothing changed, say so and stop.
6. **Check locally.** `npm run build` must pass.
7. **Commit and push to main.** Commit message: `Sync tokens from Figma (export <checksum>)` plus the change list in the body. Push: GitHub Actions re-checks the tokens, builds and deploys.
8. **Confirm it's live.** Watch the "Build and deploy" run until it finishes, then open https://sytnykk.github.io/datum/ and check that the changed token shows its new value on the Tokens page. Report the run result and the live link.

## What the person should be able to say
"Figma variables are exported by a read-only plugin script, checked with a checksum, converted to W3C design tokens, and from those to CSS variables and a Tailwind theme. CI rejects token files that don't match the export, then deploys the docs."
