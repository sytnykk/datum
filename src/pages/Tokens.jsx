import { useState } from 'react';
import { meta, semantic, primitiveFamilies, dimensions, typography, refName, refColor, hexLabel, target, tailwindClasses, modeColor } from '../lib/tokens.js';

const FIGMA_URL = 'https://www.figma.com/design/qYrAS6I0CwM9veRdhMSb20/Datum---Observability-platform-for-engineering-teams?node-id=5-3';
const MODES = ['light', 'dark'];

/** Click to copy a CSS variable or class name. */
function Code({ children, label }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch {}
  };
  return (
    <button type="button" onClick={copy} title={`Copy ${children}`} aria-label={`Copy ${label ?? ''} ${children}`}
      className="type-mono-sm cursor-pointer rounded-sm px-4 text-left text-default hover:bg-selected">
      {copied ? <span className="text-success">Copied</span> : children}
    </button>
  );
}

/** One token shown doing its real job, on that mode's surface. Values come from tokens.json, so both modes show at once. */
function Preview({ token, mode }) {
  const name = token.x.figma.name;
  const group = name.split('/')[0];
  const c = refColor(token.x.modes[mode]);
  const surface = modeColor('bg/surface', mode);
  const line = modeColor('border/default', mode);
  let inner;
  if (group === 'bg') inner = <span className="block h-full w-full rounded-sm" style={{ background: c, border: `1px solid ${line}` }} />;
  else if (group === 'text')
    inner = (
      <span className="type-heading-md flex h-full w-full items-center justify-center rounded-sm"
        style={{ color: c, background: name === 'text/on-accent' ? modeColor('bg/accent', mode) : 'transparent' }}>Aa</span>
    );
  else if (group === 'border') inner = <span className="block h-full w-full rounded-sm" style={{ border: `1px solid ${c}` }} />;
  else if (name === 'focus/halo')
    inner = <span className="block h-full w-full rounded-sm" style={{ border: `1px solid ${modeColor('focus/ring', mode)}`, boxShadow: `0 0 0 3px ${c}` }} />;
  else inner = <span className="block h-full w-full rounded-sm" style={{ border: `1px solid ${c}` }} />;
  return (
    <span className="flex h-control-lg w-[56px] rounded-sm p-6" style={{ background: surface, boxShadow: `inset 0 0 0 1px ${line}` }}
      title={`${name}, ${mode}`}>{inner}</span>
  );
}

function ModeValue({ token, mode }) {
  const ref = token.x.modes[mode];
  return (
    <div>
      <span className="type-label-sm text-muted md:hidden">{mode === 'light' ? 'Light' : 'Dark'} </span>
      <span className="type-mono-sm text-default">{refName(ref)}</span>
      <span className="type-mono-sm block text-muted">{hexLabel(target(ref).$value)}</span>
    </div>
  );
}

function Section({ id, title, intro, children }) {
  return (
    <section id={id} className="mt-48 scroll-mt-64">
      <h2 className="type-heading-lg text-default">{title}</h2>
      {intro && <p className="type-body-md mt-4 max-w-[64ch] text-muted">{intro}</p>}
      <div className="mt-20">{children}</div>
    </section>
  );
}

const SEM_COLS = 'md:grid md:grid-cols-[128px_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] md:items-center md:gap-16';

function SemanticTable() {
  const groups = [...new Set(semantic.map((t) => t.x.figma.name.split('/')[0]))];
  return (
    <div className="rounded-md border border-default bg-surface">
      <div className={`${SEM_COLS} type-label-sm hidden border-b border-default px-16 py-8 text-muted md:grid`}>
        <span>Light, dark</span><span>Figma variable</span><span>Code</span><span>Light value</span><span>Dark value</span>
      </div>
      {groups.map((g) => (
        <div key={g}>
          {semantic.filter((t) => t.x.figma.name.startsWith(g + '/')).map((t) => (
            <div key={t.path} className={`${SEM_COLS} grid gap-8 border-b border-default px-16 py-12 last:border-b-0`}>
              <div className="flex gap-8">{MODES.map((m) => <Preview key={m} token={t} mode={m} />)}</div>
              <div className="min-w-0">
                <p className="type-label-md text-default">{t.x.figma.name}</p>
                <p className="type-body-xs text-muted">{t.$description}</p>
              </div>
              <div className="flex min-w-0 flex-col items-start">
                <Code label="CSS variable">{`var(${t.x.css})`}</Code>
                {tailwindClasses(t).slice(0, 1).map((c) => <Code key={c} label="Tailwind class">{c}</Code>)}
              </div>
              <div className="flex gap-24 md:contents">
                {MODES.map((m) => <ModeValue key={m} token={t} mode={m} />)}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function Primitives() {
  return (
    <div className="flex flex-col gap-24">
      {Object.entries(primitiveFamilies).map(([fam, list]) => (
        <div key={fam}>
          <h3 className="type-heading-sm text-default">{fam}</h3>
          <ul className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(76px,1fr))] gap-8">
            {list.map((t) => {
              const step = t.x.figma.name.split('/')[1];
              return (
                <li key={t.path} title={`${t.x.figma.name}${t.$description ? ': ' + t.$description : ''}`}>
                  <span className="block h-control-lg rounded-sm border border-default"
                    style={{ background: refColor(`{${t.path}}`) }} />
                  <span className="type-label-sm mt-4 block text-default">{step}</span>
                  <span className="type-mono-sm block text-muted">{hexLabel(t.$value)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Dimensions() {
  const group = (g) => dimensions.filter((t) => t.x.figma.name.startsWith(g + '/'));
  const cls = (t) => {
    const [g, k] = t.x.figma.name.split('/');
    return g === 'radius' ? `rounded-${k}` : g === 'size' ? `h-${k}` : `p-${k}, gap-${k}`;
  };
  const Row = ({ t, visual }) => (
    <li className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-8 border-b border-default px-16 py-8 last:border-b-0 md:grid-cols-[160px_160px_160px_minmax(0,1fr)] md:gap-16">
      <span className="type-label-md text-default">{t.x.figma.name}</span>
      <span className="type-mono-sm text-muted">{t.$value.value}px</span>
      <Code label="CSS variable">{`var(${t.x.css})`}</Code>
      <div className="col-span-2 md:col-span-1">{visual}</div>
    </li>
  );
  return (
    <div className="flex flex-col gap-24">
      {[
        ['Space', 'space', (t) => <span className="block h-12 rounded-sm border border-strong bg-selected" style={{ width: t.$value.value || 1 }} />],
        ['Control size', 'size', (t) => <span className="block w-[96px] rounded-sm border border-strong bg-selected" style={{ height: t.$value.value }} />],
        ['Radius', 'radius', (t) => <span className="block h-control-lg w-[64px] border border-strong bg-selected" style={{ borderRadius: `var(${t.x.css})` }} />],
      ].map(([title, g, visual]) => (
        <div key={g}>
          <h3 className="type-heading-sm text-default">{title}</h3>
          <ul className="mt-8 rounded-md border border-default bg-surface">
            {group(g).map((t) => <Row key={t.path} t={t} visual={<div className="flex items-center gap-12">{visual(t)}<span className="type-mono-sm text-muted">{cls(t)}</span></div>} />)}
          </ul>
        </div>
      ))}
    </div>
  );
}

const SAMPLES = {
  heading: 'checkout-api latency',
  body: 'p95 latency rose 38% after deploy 4f2a1c reached eu-west-1.',
  label: 'Roll back deploy',
  caption: 'Updated 14:32 UTC',
  mono: '182 ms',
};

function TypeStyles() {
  const WEIGHT = { 400: 'Regular', 500: 'Medium', 600: 'SemiBold' };
  return (
    <ul className="rounded-md border border-default bg-surface">
      {typography.map((t) => {
        const v = t.$value;
        const family = v.fontFamily[0];
        const ls = Math.round((v.letterSpacing.value / v.fontSize.value) * 1000) / 10;
        const kind = t.x.figma.textStyle.split('/')[0];
        return (
          <li key={t.path} className="grid gap-8 border-b border-default px-16 py-16 last:border-b-0 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:items-center md:gap-24">
            <p className={`${t.x.utility} min-w-0 text-default`}>{SAMPLES[kind]}</p>
            <div>
              <p className="type-label-md text-default">{t.x.figma.textStyle}</p>
              <p className="type-body-xs text-muted">
                {family} {WEIGHT[v.fontWeight]} {v.fontSize.value}/{t.x.lineHeightPx}{ls ? `, ${ls}% tracking` : ''}. {t.$description?.replace(/ Geist.*$/, '')}
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                <Code label="Tailwind class">{t.x.utility}</Code>
                <Code label="CSS variable">{`var(${t.x.css})`}</Code>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function TokensPage() {
  return (
    <article>
      <h1 className="type-heading-xl text-default">Tokens</h1>
      <p className="type-body-md mt-8 max-w-[64ch] text-muted">
        Every design token in Datum, as it exists in Figma and in code. Names match one to one: the Figma variable
        bg/surface is the CSS variable --color-bg-surface and the Tailwind class bg-surface. Click any code to copy it.
      </p>
      <p className="type-body-sm mt-12 text-muted">
        Synced from the <a className="text-accent underline underline-offset-2" href={FIGMA_URL}>Datum Figma file</a>, export{' '}
        <span className="type-mono-sm text-default">{meta.exportChecksum}</span>. Generated, not hand-written.
      </p>

      <Section id="semantic" title="Semantic colours"
        intro="What components use. Each one points to a primitive, with a different step in light and dark. The previews show both modes side by side, whatever theme this page is in.">
        <SemanticTable />
      </Section>
      <Section id="primitives" title="Primitive scales"
        intro="Raw colour steps. Hidden from the Figma pickers and never used by components directly; semantic tokens point to them.">
        <Primitives />
      </Section>
      <Section id="dimensions" title="Space, size, radius"
        intro="A curated 4px-based scale. Only these steps exist as Tailwind classes, so p-10 or rounded-lg don't compile.">
        <Dimensions />
      </Section>
      <Section id="type" title="Text styles"
        intro="Geist for interface text, Geist Mono for numbers, metrics and code. One class per Figma text style.">
        <TypeStyles />
      </Section>
    </article>
  );
}
