// Datum contrast rules, checked by scripts/build-tokens.mjs in both modes on every build.
// Source: the Stage 1 contrast report on the Figma Foundations page (36 pairs per mode, WCAG 2.2 AA),
// plus the Button pairs added in Stage 3. A pair below its minimum FAILS the build,
// so an inaccessible colour can't reach the site.

const BASES = ['bg/default', 'bg/surface', 'bg/selected'];
const ON_BASES = [
  ['text/default', 4.5], ['text/muted', 4.5], ['text/accent', 4.5],
  ['text/success', 4.5], ['text/warning', 4.5], ['text/error', 4.5], ['text/info', 4.5],
  ['border/strong', 3, 'input borders (non-text)'], ['focus/ring', 3, 'focus ring (non-text)'],
];

export const contrastPairs = [
  ...ON_BASES.flatMap(([fg, min, note]) => BASES.map((bg) => ({ fg, bg, min, note }))),
  { fg: 'text/on-accent', bg: 'bg/accent', min: 4.5, note: 'primary button label' },
  ...['success', 'warning', 'error', 'info'].flatMap((s) => [
    { fg: `text/${s}`, bg: `bg/${s}-subtle`, min: 4.5, note: `${s} badge` },
    { fg: 'text/default', bg: `bg/${s}-subtle`, min: 4.5, note: `text in a ${s} toast` },
  ]),
  // Stage 3, Button: every label colour on every fill it sits on, in every interactive state.
  { fg: 'text/on-accent', bg: 'bg/accent-hover', min: 4.5, note: 'primary button, hover' },
  { fg: 'text/on-accent', bg: 'bg/accent-pressed', min: 4.5, note: 'primary button, pressed' },
  { fg: 'text/default', bg: 'bg/hover', min: 4.5, note: 'secondary/ghost button, hover' },
  { fg: 'text/default', bg: 'bg/pressed', min: 4.5, note: 'secondary/ghost button, pressed' },
  { fg: 'text/error-strong', bg: 'bg/error-pressed', min: 4.5, note: 'danger button, pressed' },
  // (danger rest = text/error on bg/surface and hover = text/error on bg/error-subtle are already above;
  //  the focus ring sits 2px outside the button, so it's checked against the page: focus/ring on the bases above.)
];

// Warnings: printed, never fail the build. Not WCAG rules, but problems we've actually hit.
// 1. A subtle fill should be visible against what it sits on. Stage 1: badge fills at 1.00–1.03
//    read as plain coloured text; at 1.09–1.16 they were fine. Threshold proposed by Claude, Sasha to confirm.
export const FILL_MIN = 1.05;
export const fillPairs = [
  ...['success', 'warning', 'error', 'info'].map((s) => ({ fg: `bg/${s}-subtle`, bg: 'bg/surface', note: `${s} badge fill` })),
  { fg: 'bg/selected', bg: 'bg/surface', note: 'selected row' },
  // Stage 3: a hover you can't see is no hover. Secondary buttons sit on surface, ghost buttons on either.
  { fg: 'bg/hover', bg: 'bg/surface', note: 'secondary/ghost hover on a card' },
  { fg: 'bg/hover', bg: 'bg/default', note: 'ghost hover on the page' },
];
// 2. The focus halo is its own primitive (Figma can't alias a colour at a different opacity),
//    so check its colour still matches the ring's.
export const haloPair = { halo: 'focus/halo', ring: 'focus/ring' };
// 3. Disabled text is exempt from WCAG contrast (1.4.3), but Datum keeps it legible (Stage 3, Sasha's choice:
//    2.25:1 light, 2.70:1 dark). Warn if a change makes it fainter than 2:1, or so strong it reads as enabled.
export const disabledPair = { fg: 'text/disabled', bg: 'bg/disabled', min: 2, max: 3.5, note: 'disabled control label' };
