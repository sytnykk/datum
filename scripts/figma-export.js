// Datum: Figma → raw token export.
// Run this file's contents, unchanged, with the Figma MCP `use_figma` tool on the Datum file.
// It only reads (no edits) and uses the Plugin API, so it doesn't count against Starter's design-read quota.
// Output: a compact JSON payload. Save it verbatim as figma/variables.raw.json, then run `npm run tokens`.
// The payload carries a checksum; the build recomputes it, so a copy error fails the build instead of shipping.

const toHex = (c) => {
  const h = (x) => Math.round(x * 255).toString(16).padStart(2, '0').toUpperCase();
  return '#' + h(c.r) + h(c.g) + h(c.b);
};
const round = (n, d = 4) => Math.round(n * 10 ** d) / 10 ** d;

const collections = [];
for (const c of await figma.variables.getLocalVariableCollectionsAsync()) {
  const variables = [];
  for (const id of c.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    const values = {};
    for (const m of c.modes) {
      const raw = v.valuesByMode[m.modeId];
      if (raw && raw.type === 'VARIABLE_ALIAS') {
        values[m.name] = { alias: (await figma.variables.getVariableByIdAsync(raw.id)).name };
      } else if (v.resolvedType === 'COLOR') {
        values[m.name] = raw.a < 1 ? { hex: toHex(raw), a: round(raw.a, 3) } : { hex: toHex(raw) };
      } else {
        values[m.name] = typeof raw === 'number' ? round(raw) : raw;
      }
    }
    variables.push({ name: v.name, type: v.resolvedType, css: (v.codeSyntax.WEB || '').replace(/^var\((.*)\)$/, '$1'), scopes: v.scopes, description: v.description, values });
  }
  collections.push({ name: c.name, modes: c.modes.map((m) => m.name), variables });
}

const textStyles = (await figma.getLocalTextStylesAsync()).map((s) => ({
  name: s.name,
  family: s.fontName.family,
  style: s.fontName.style,
  size: s.fontSize,
  lineHeight: s.lineHeight.unit === 'PIXELS' ? s.lineHeight.value : null,
  letterSpacingPercent: s.letterSpacing.unit === 'PERCENT' ? round(s.letterSpacing.value, 2) : 0,
  description: s.description,
}));

const body = { file: figma.root.name, collections, textStyles };
// FNV-1a 32-bit over the JSON text: a cheap fingerprint, not security.
let h = 0x811c9dc5;
const str = JSON.stringify(body);
for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
return { ...body, checksum: h.toString(16).padStart(8, '0') };
