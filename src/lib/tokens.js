// Reads tokens/tokens.json (the W3C file the sync writes) for the docs pages.
import tokens from '../../tokens/tokens.json';

export const EXT = 'io.github.sytnykk.datum';
export const meta = tokens.$extensions[EXT];

const flatten = (node, path = []) =>
  Object.entries(node).flatMap(([k, v]) => {
    if (k.startsWith('$') || !v || typeof v !== 'object') return [];
    if ('$value' in v) return [{ path: [...path, k].join('.'), ...v, x: v.$extensions?.[EXT] ?? {} }];
    return flatten(v, [...path, k]);
  });

export const all = flatten(tokens);
const byPath = new Map(all.map((t) => [t.path, t]));

const cssColor = (v) => {
  if (v.alpha === undefined) return v.hex;
  const [r, g, b] = v.components.map((c) => Math.round(c * 255));
  return `rgb(${r} ${g} ${b} / ${v.alpha})`;
};

/** "{slate.600}" → the primitive token it points to */
export const target = (ref) => byPath.get(ref.slice(1, -1));
/** "{slate.600}" → "slate/600" */
export const refName = (ref) => target(ref).x.figma.name;
/** "{slate.600}" → "#5A6478" (or rgb() with alpha) */
export const refColor = (ref) => cssColor(target(ref).$value);
export const hexLabel = (v) => (v.alpha === undefined ? v.hex : `${v.hex} ${Math.round(v.alpha * 100)}%`);

export const primitives = all.filter((t) => t.$type === 'color' && !t.x.modes);
export const semantic = all.filter((t) => t.x.modes);
export const dimensions = all.filter((t) => t.$type === 'dimension');
export const typography = all.filter((t) => t.$type === 'typography');

/** Group primitives by family: slate, indigo, … (keeps Figma order) */
export const primitiveFamilies = primitives.reduce((acc, t) => {
  const fam = t.x.figma.name.split('/')[0];
  (acc[fam] ??= []).push(t);
  return acc;
}, {});

/** Tailwind classes generated for a semantic token (mirrors NS in build-tokens.mjs) */
export const tailwindClasses = (t) => {
  const [group, ...rest] = t.x.figma.name.split('/');
  const k = rest.join('-');
  if (group === 'bg') return [`bg-${k}`];
  if (group === 'text') return [`text-${k}`, `fill-${k}`];
  if (group === 'border') return [`border-${k}`];
  if (group === 'focus') return [`ring-focus-${k}`, `outline-focus-${k}`];
  return [];
};

/** Resolve a semantic token by Figma name for a mode: ("bg/surface", "dark") → colour string */
export const modeColor = (figmaName, mode) => refColor(semantic.find((t) => t.x.figma.name === figmaName).x.modes[mode]);
