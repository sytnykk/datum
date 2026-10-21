// Datum contrast rules, checked by scripts/build-tokens.mjs in both modes on every build.
// Source: the Stage 1 contrast report on the Figma Foundations page (36 pairs per mode, WCAG 2.2 AA).
// A pair below its minimum FAILS the build, so an inaccessible colour can't reach the site.

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
];

// Warnings: printed, never fail the build. Not WCAG rules, but problems we've actually hit.
// 1. A subtle fill should be visible against the card it sits on. Stage 1: badge fills at 1.00–1.03
//    read as plain coloured text; at 1.09–1.16 they were fine. Threshold proposed by Claude, Sasha to confirm.
export const FILL_MIN = 1.05;
export const fillPairs = [
  ...['success', 'warning', 'error', 'info'].map((s) => ({ fg: `bg/${s}-subtle`, bg: 'bg/surface', note: `${s} badge fill` })),
  { fg: 'bg/selected', bg: 'bg/surface', note: 'selected row' },
];
// 2. The focus halo is its own primitive (Figma can't alias a colour at a different opacity),
//    so check its colour still matches the ring's.
export const haloPair = { halo: 'focus/halo', ring: 'focus/ring' };
