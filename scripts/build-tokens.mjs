// Datum token build: figma/variables.raw.json → tokens/tokens.json (W3C DTCG 2025.10)
//                                            → src/tokens/tokens.css (plain CSS variables, light + dark)
//                                            → src/tokens/tailwind-theme.css (Tailwind v4 theme)
// Run: npm run tokens          Check only, write nothing: npm run tokens -- --check
// Every rule below fails the build with a readable message instead of shipping a broken token.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const RAW = path.join(ROOT, 'figma/variables.raw.json');
const OUT_JSON = path.join(ROOT, 'tokens/tokens.json');
const OUT_CSS = path.join(ROOT, 'src/tokens/tokens.css');
const OUT_TW = path.join(ROOT, 'src/tokens/tailwind-theme.css');
const EXT = 'io.github.sytnykk.datum'; // $extensions key (reverse-domain, as the spec recommends)
const CHECK_ONLY = process.argv.includes('--check');

const errors = [];
const fail = (msg) => errors.push(msg);

// ---------- 1. Read and verify the raw export ----------
const raw = JSON.parse(fs.readFileSync(RAW, 'utf8'));
{
  const { checksum, ...body } = raw;
  let h = 0x811c9dc5;
  const s = JSON.stringify(body);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  const got = h.toString(16).padStart(8, '0');
  if (got !== checksum) {
    console.error(`✗ Checksum mismatch: Figma said ${checksum}, file gives ${got}.\n  The export was not copied exactly. Re-run the export; don't hand-edit variables.raw.json.`);
    process.exit(1);
  }
}

const col = (name) => {
  const c = raw.collections.find((c) => c.name === name);
  if (!c) { console.error(`✗ Collection "${name}" is missing from the Figma file.`); process.exit(1); }
  return c;
};
const primitives = col('Primitives');
const light = col('Semantic');
const dark = col('Semantic Dark');
const dims = col('Dimensions');

// ---------- 2. Validate ----------
const prim = new Map(primitives.variables.map((v) => [v.name, v]));
const cssNames = new Map();
const claimCss = (css, who) => {
  if (!/^--[a-z0-9-]+$/.test(css)) fail(`${who}: CSS name "${css}" is missing or invalid. Set the Web code syntax in Figma (e.g. var(--space-12)).`);
  const prev = cssNames.get(css);
  if (prev && prev !== who) fail(`${who}: CSS name ${css} is already used by ${prev}.`);
  cssNames.set(css, who);
};

for (const v of primitives.variables) {
  claimCss(v.css, `Primitives/${v.name}`);
  const val = v.values[primitives.modes[0]];
  if (v.type !== 'COLOR' || !/^#[0-9A-F]{6}$/.test(val?.hex)) fail(`Primitives/${v.name}: expected a colour, got ${JSON.stringify(val)}.`);
}
for (const v of dims.variables) {
  claimCss(v.css, `Dimensions/${v.name}`);
  if (typeof v.values[dims.modes[0]] !== 'number') fail(`Dimensions/${v.name}: expected a number.`);
}
const darkByName = new Map(dark.variables.map((v) => [v.name, v]));
for (const v of light.variables) {
  claimCss(v.css, `Semantic/${v.name}`);
  const d = darkByName.get(v.name);
  if (!d) { fail(`Semantic/${v.name} has no twin in Semantic Dark. Add it with the same name.`); continue; }
  if (d.css !== v.css) fail(`${v.name}: CSS name differs between Light (${v.css}) and Dark (${d.css}).`);
  for (const [mode, src] of [['Light', v.values[light.modes[0]]], ['Dark', d.values[dark.modes[0]]]]) {
    if (!src?.alias) fail(`${v.name} (${mode}) is a raw colour. Semantic tokens must alias a primitive.`);
    else if (!prim.has(src.alias)) fail(`${v.name} (${mode}) points to "${src.alias}", which isn't a primitive.`);
  }
}
for (const d of dark.variables) if (!light.variables.some((v) => v.name === d.name)) fail(`Semantic Dark/${d.name} has no twin in Semantic (Light).`);

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s) in the Figma export:\n` + errors.map((e) => '  - ' + e).join('\n'));
  process.exit(1);
}

// ---------- 3. Build the W3C token tree ----------
// Token path = Figma variable name with "/" → "." (slate/600 → slate.600), so names match Figma 1:1.
const hexToColor = (hex, a) => {
  const n = (i) => Math.round((parseInt(hex.slice(i, i + 2), 16) / 255) * 10000) / 10000;
  const c = { colorSpace: 'srgb', components: [n(1), n(3), n(5)], hex };
  if (a !== undefined) c.alpha = a;
  return c;
};
const ref = (figmaName) => `{${figmaName.replaceAll('/', '.')}}`;
const tree = {};
const put = (figmaName, token) => {
  const parts = figmaName.split('/');
  let node = tree;
  for (const p of parts.slice(0, -1)) node = node[p] ??= {};
  node[parts.at(-1)] = token;
};
const ext = (o) => ({ [EXT]: o });

for (const v of primitives.variables) {
  const { hex, a } = v.values[primitives.modes[0]];
  put(v.name, {
    $type: 'color',
    $value: hexToColor(hex, a),
    ...(v.description && { $description: v.description }),
    $extensions: ext({ figma: { collection: 'Primitives', name: v.name }, css: v.css }),
  });
}
for (const v of light.variables) {
  const d = darkByName.get(v.name);
  put(v.name, {
    $type: 'color',
    $value: ref(v.values[light.modes[0]].alias), // light is the default mode
    ...(v.description && { $description: v.description }),
    $extensions: ext({
      figma: { collection: 'Semantic + Semantic Dark', name: v.name, scopes: v.scopes },
      css: v.css,
      modes: { light: ref(v.values[light.modes[0]].alias), dark: ref(d.values[dark.modes[0]].alias) },
    }),
  });
}
for (const v of dims.variables) {
  put(v.name, {
    $type: 'dimension',
    $value: { value: v.values[dims.modes[0]], unit: 'px' },
    ...(v.description && { $description: v.description }),
    $extensions: ext({ figma: { collection: 'Dimensions', name: v.name, scopes: v.scopes }, css: v.css }),
  });
}
const WEIGHT = { Thin: 100, ExtraLight: 200, Light: 300, Regular: 400, Medium: 500, SemiBold: 600, Bold: 700, ExtraBold: 800, Black: 900 };
const STACK = { Geist: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'], 'Geist Mono': ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'] };
const r4 = (n) => Math.round(n * 10000) / 10000;
for (const s of raw.textStyles) {
  if (!(s.style in WEIGHT)) { console.error(`✗ Text style ${s.name}: unknown font style "${s.style}".`); process.exit(1); }
  if (!s.lineHeight) { console.error(`✗ Text style ${s.name}: line height must be in px in Figma.`); process.exit(1); }
  const name = 'type/' + s.name; // grouped so "text/…" colour tokens and type styles never collide
  put(name, {
    $type: 'typography',
    $value: {
      fontFamily: STACK[s.family] ?? [s.family],
      fontSize: { value: s.size, unit: 'px' },
      fontWeight: WEIGHT[s.style],
      lineHeight: r4(s.lineHeight / s.size),
      letterSpacing: { value: r4((s.letterSpacingPercent / 100) * s.size), unit: 'px' },
    },
    ...(s.description && { $description: s.description.replace(/\s*CSS: var\(.*\)$/, '') }),
    $extensions: ext({ figma: { textStyle: s.name }, css: `--text-${s.name.replaceAll('/', '-')}`, lineHeightPx: s.lineHeight, utility: `type-${s.name.replaceAll('/', '-')}` }),
  });
}

const tokensJson = {
  $description: 'Datum design tokens. Generated from Figma by scripts/build-tokens.mjs; do not edit by hand. Format: W3C Design Tokens Format Module 2025.10. Light is the default; dark values live in $extensions["' + EXT + '"].modes.',
  $extensions: ext({ source: 'figma.com/design/qYrAS6I0CwM9veRdhMSb20', exportChecksum: raw.checksum, modes: ['light', 'dark'] }),
  ...tree,
};

// ---------- 4. CSS variables ----------
const rgba = (hex, a) => {
  if (a === undefined) return hex.toLowerCase();
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgb(${r} ${g} ${b} / ${a})`;
};
const varOf = (figmaName) => `var(${prim.get(figmaName).css})`;
const header = '/* Generated by scripts/build-tokens.mjs from Figma (checksum ' + raw.checksum + '). Do not edit by hand: change Figma and run the sync. */\n';

const lightLines = light.variables.map((v) => `  ${v.css}: ${varOf(v.values[light.modes[0]].alias)};`);
const darkLines = light.variables.map((v) => `  ${v.css}: ${varOf(darkByName.get(v.name).values[dark.modes[0]].alias)};`);
const typeLines = raw.textStyles.flatMap((s) => {
  const k = `--text-${s.name.replaceAll('/', '-')}`;
  return [
    `  ${k}: ${s.size}px;`,
    `  ${k}--line-height: ${s.lineHeight}px;`,
    `  ${k}--letter-spacing: ${s.letterSpacingPercent / 100}em;`,
    `  ${k}--font-weight: ${WEIGHT[s.style]};`,
  ];
});
const css =
  header +
  `:root {\n  /* Primitives (Figma: Primitives) */\n` +
  primitives.variables.map((v) => { const { hex, a } = v.values[primitives.modes[0]]; return `  ${v.css}: ${rgba(hex, a)};`; }).join('\n') +
  `\n\n  /* Dimensions (Figma: Dimensions) */\n` +
  dims.variables.map((v) => `  ${v.css}: ${v.values[dims.modes[0]]}px;`).join('\n') +
  `\n\n  /* Type (Figma: text styles) */\n  --font-sans: ${STACK.Geist.map((f) => (f.includes(' ') ? `"${f}"` : f)).join(', ')};\n  --font-mono: ${STACK['Geist Mono'].map((f) => (f.includes(' ') ? `"${f}"` : f)).join(', ')};\n` +
  typeLines.join('\n') +
  `\n\n  /* Semantic, light (Figma: Semantic) */\n  color-scheme: light;\n` +
  lightLines.join('\n') +
  `\n}\n\n/* Semantic, dark (Figma: Semantic Dark). Follows the OS unless the page sets data-theme.\n` +
  `   data-theme also works on any element, so a light panel can sit inside a dark page and vice versa. */\n` +
  `[data-theme="light"] {\n  color-scheme: light;\n${lightLines.join('\n')}\n}\n` +
  `:root[data-theme="dark"], [data-theme="dark"] {\n  color-scheme: dark;\n${darkLines.join('\n')}\n}\n` +
  `@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {\n    color-scheme: dark;\n${darkLines.map((l) => '  ' + l).join('\n')}\n  }\n}\n`;

// ---------- 5. Tailwind v4 theme ----------
// Figma scopes become Tailwind namespaces: bg/* only makes bg-* utilities, text/* only text-* and fill-*,
// border/* only border-*, focus/* only ring-/outline-*. Default Tailwind colours, spacing and radii are
// switched off, so off-system values (bg-red-500, p-10, rounded-lg) don't exist in code.
const NS = { bg: ['--background-color'], text: ['--text-color', '--fill'], border: ['--border-color'], focus: ['--ring-color', '--outline-color'] };
const twColor = light.variables.flatMap((v) => {
  const [group, ...rest] = v.name.split('/');
  // focus/ring → ring-focus-ring (keeps the group, so it never reads as "ring-ring")
  const key = group === 'focus' ? v.name.replaceAll('/', '-') : rest.join('-');
  if (!NS[group]) fail(`Semantic/${v.name}: group "${group}" has no Tailwind mapping yet. Add it to NS in build-tokens.mjs.`);
  return (NS[group] ?? []).map((ns) => `  ${ns}-${key}: var(${v.css});`);
});
const twDims = dims.variables.map((v) => {
  const [group, ...rest] = v.name.split('/');
  const key = rest.join('-');
  if (group === 'space') return `  --spacing-${key}: ${v.values[dims.modes[0]]}px;`;
  if (group === 'size') return `  --spacing-${key}: ${v.values[dims.modes[0]]}px;`;
  if (group === 'radius') return `  --radius-${key}: ${v.values[dims.modes[0]]}px;`;
  return null;
}).filter(Boolean);
const twUtils = raw.textStyles.map((s) => {
  const k = s.name.replaceAll('/', '-');
  return `@utility type-${k} {\n  font-family: var(--font-${s.family === 'Geist Mono' ? 'mono' : 'sans'});\n  font-size: var(--text-${k});\n  line-height: var(--text-${k}--line-height);\n  letter-spacing: var(--text-${k}--letter-spacing);\n  font-weight: var(--text-${k}--font-weight);\n}`;
});
const tw =
  header +
  `/* Import after "tailwindcss" and tokens.css. Class = Figma name: bg/surface → bg-surface, space/12 → p-12, radius/sm → rounded-sm, text style mono/xl → type-mono-xl. */\n` +
  `@theme {\n  --color-*: initial;\n  --spacing: initial;\n  --spacing-*: initial;\n  --radius-*: initial;\n  --text-*: initial;\n  --font-*: initial;\n  --shadow-*: initial;\n\n` +
  `  --font-sans: ${STACK.Geist.map((f) => (f.includes(' ') ? `"${f}"` : f)).join(', ')};\n  --font-mono: ${STACK['Geist Mono'].map((f) => (f.includes(' ') ? `"${f}"` : f)).join(', ')};\n\n` +
  `  /* Colours: point at tokens.css, so light/dark switch at runtime */\n  --color-transparent: transparent;\n  --color-current: currentColor;\n` +
  twColor.join('\n') +
  `\n\n  /* Space, size, radius */\n` +
  twDims.join('\n') +
  `\n}\n\n/* Text styles: one class per Figma text style */\n` +
  twUtils.join('\n') + '\n';

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):\n` + errors.map((e) => '  - ' + e).join('\n'));
  process.exit(1);
}

// ---------- 6. Report what changed, then write ----------
const flatten = (o, p = []) => Object.entries(o).flatMap(([k, v]) => (k.startsWith('$') ? [] : v && typeof v === 'object' && '$value' in v ? [[[...p, k].join('/'), v]] : v && typeof v === 'object' ? flatten(v, [...p, k]) : []));
const show = (t) => JSON.stringify(t.$extensions?.[EXT]?.modes ?? t.$value.hex ?? t.$value);
const before = fs.existsSync(OUT_JSON) ? new Map(flatten(JSON.parse(fs.readFileSync(OUT_JSON, 'utf8')))) : new Map();
const after = new Map(flatten(tokensJson));
const changes = [];
for (const [k, t] of after) if (!before.has(k)) changes.push(`+ ${k} ${show(t)}`); else if (show(before.get(k)) !== show(t)) changes.push(`~ ${k}: ${show(before.get(k))} → ${show(t)}`);
for (const k of before.keys()) if (!after.has(k)) changes.push(`- ${k}`);
// A changed primitive changes every semantic token that points to it: list those too.
for (const c of [...changes]) {
  const m = c.match(/^~ (\S+):/);
  if (!m || !prim.has(m[1])) continue;
  const users = light.variables.flatMap((v) => [
    v.values[light.modes[0]].alias === m[1] ? `${v.name} (light)` : null,
    darkByName.get(v.name).values[dark.modes[0]].alias === m[1] ? `${v.name} (dark)` : null,
  ]).filter(Boolean);
  if (users.length) changes.splice(changes.indexOf(c) + 1, 0, `    used by ${users.join(', ')}`);
}

const counts = `${primitives.variables.length} primitives, ${light.variables.length} semantic (light + dark), ${dims.variables.length} dimensions, ${raw.textStyles.length} text styles`;
console.log(`✓ Figma export verified (checksum ${raw.checksum}): ${counts}.`);
console.log(before.size === 0 ? '  First build.' : changes.length ? `  ${changes.filter((c) => !c.startsWith(" ")).length} change(s):\n` + changes.map((c) => '    ' + c).join('\n') : '  No token changes.');

// ---------- 7. Contrast (rules in scripts/contrast-rules.mjs) ----------
// WCAG 2.x relative luminance and contrast ratio, from each mode's resolved hex.
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return Math.floor(((x + 0.05) / (y + 0.05)) * 100) / 100; }; // rounded down, so 4.499 never shows as 4.50
const semHex = (name, mode) => {
  const v = mode === 'light' ? light.variables.find((x) => x.name === name) : darkByName.get(name);
  if (!v) throw new Error(`Contrast rule mentions ${name}, which isn't a semantic token.`);
  return prim.get(v.values[(mode === 'light' ? light : dark).modes[0]].alias).values[primitives.modes[0]];
};
const { contrastPairs, fillPairs, FILL_MIN, haloPair, disabledPair } = await import('./contrast-rules.mjs');
const report = { $description: 'Generated by scripts/build-tokens.mjs. WCAG 2.2 AA contrast for every rule in scripts/contrast-rules.mjs.', exportChecksum: raw.checksum, modes: {} };
const contrastFails = [];
const warnings = [];
for (const mode of ['light', 'dark']) {
  report.modes[mode] = contrastPairs.map(({ fg, bg, min, note }) => {
    const r = ratio(semHex(fg, mode).hex, semHex(bg, mode).hex);
    if (r < min) contrastFails.push(`${mode}: ${fg} on ${bg} is ${r.toFixed(2)}:1, needs ${min}:1${note ? ` (${note})` : ''}`);
    return { fg, bg, min, ratio: r, pass: r >= min };
  });
  for (const { fg, bg, note } of fillPairs) {
    const r = ratio(semHex(fg, mode).hex, semHex(bg, mode).hex);
    if (r < FILL_MIN) warnings.push(`${mode}: ${fg} on ${bg} is ${r.toFixed(2)}:1, may be hard to see (${note}; warn below ${FILL_MIN})`);
  }
  if (disabledPair) {
    const { fg, bg, min, max, note } = disabledPair;
    const r = ratio(semHex(fg, mode).hex, semHex(bg, mode).hex);
    if (r < min) warnings.push(`${mode}: ${fg} on ${bg} is ${r.toFixed(2)}:1, may be unreadable (${note}; warn below ${min})`);
    if (r > max) warnings.push(`${mode}: ${fg} on ${bg} is ${r.toFixed(2)}:1, may read as enabled (${note}; warn above ${max})`);
  }
  const halo = semHex(haloPair.halo, mode).hex, ring = semHex(haloPair.ring, mode).hex;
  if (halo !== ring) warnings.push(`${mode}: ${haloPair.halo} is ${halo} but ${haloPair.ring} is ${ring}. Update the halo primitive to match.`);
}
const total = contrastPairs.length * 2;
const printWarnings = () => warnings.length && console.log(`! ${warnings.length} warning(s), not blocking:\n` + warnings.map((w) => '  - ' + w).join('\n'));
if (contrastFails.length) {
  printWarnings();
  console.error(`✗ Contrast: ${contrastFails.length} of ${total} pairs fail WCAG 2.2 AA. Nothing was written.\n` + contrastFails.map((f) => '  - ' + f).join('\n') +
    '\n  Fix the colour in Figma and sync again.');
  process.exit(1);
}
const lowest = (m) => report.modes[m].reduce((a, p) => (p.ratio - p.min < a.ratio - a.min ? p : a));
console.log(`✓ Contrast: ${total} of ${total} pairs pass WCAG 2.2 AA. Closest: ${['light', 'dark'].map((m) => { const p = lowest(m); return `${m} ${p.fg} on ${p.bg} ${p.ratio.toFixed(2)}:1`; }).join(', ')}.`);
printWarnings();

if (CHECK_ONLY) process.exit(0);
fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.mkdirSync(path.dirname(OUT_CSS), { recursive: true });
fs.writeFileSync(OUT_JSON, JSON.stringify(tokensJson, null, 2) + '\n');
fs.writeFileSync(path.join(ROOT, 'tokens/contrast-report.json'), JSON.stringify(report, null, 2) + '\n');
fs.writeFileSync(OUT_CSS, css);
fs.writeFileSync(OUT_TW, tw);
// The docs site renders text-style classes from tokens.json at runtime, which Tailwind can't see when scanning,
// so list them explicitly for the docs build.
fs.writeFileSync(
  path.join(ROOT, 'src/tokens/docs-safelist.css'),
  header + raw.textStyles.map((s) => `@source inline("type-${s.name.replaceAll('/', '-')}");`).join('\n') + '\n',
);
console.log('  Wrote tokens/tokens.json, tokens/contrast-report.json, src/tokens/tokens.css, src/tokens/tailwind-theme.css, src/tokens/docs-safelist.css');
