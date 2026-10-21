import { useState } from 'react';
import { Plus, CaretDown, ArrowClockwise, ArrowRight, Trash, DotsThree, GearSix, FunnelSimple, DownloadSimple, Copy, X, MagnifyingGlass } from '@phosphor-icons/react';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { CodeBlock, CopyChip } from '../docs/CodeBlock';

const FIGMA = 'https://www.figma.com/design/qYrAS6I0CwM9veRdhMSb20/Datum---Observability-platform-for-engineering-teams?node-id=';
const SOURCE = 'https://github.com/sytnykk/datum/blob/main/src/components/';
const VARIANTS = ['primary', 'secondary', 'ghost', 'danger'];
const SIZES = ['sm', 'md', 'lg'];
// Figma state → how you get it in code. hover/pressed/focus are CSS, forced here with a docs-only data-preview attribute.
const STATES = [
  { id: 'default', how: 'no prop' },
  { id: 'hover', how: 'CSS :hover' },
  { id: 'pressed', how: 'CSS :active' },
  { id: 'focus', how: 'CSS :focus-visible' },
  { id: 'disabled', how: 'disabled' },
  { id: 'loading', how: 'loading' },
];
const stateProps = (s) => ({
  ...(s === 'hover' || s === 'pressed' || s === 'focus' ? { 'data-preview': s, tabIndex: -1 } : {}),
  ...(s === 'disabled' ? { disabled: true } : {}),
  ...(s === 'loading' ? { loading: true } : {}),
});
const jsx = (name, v, s, extra = '') => {
  const p = [v !== 'secondary' && `variant="${v}"`, s === 'disabled' && 'disabled', s === 'loading' && 'loading', extra].filter(Boolean).join(' ');
  return `<${name}${p ? ' ' + p : ''}`;
};

function Section({ id, title, intro, children, level = 2 }) {
  const H = level === 2 ? 'h2' : 'h3';
  return (
    <section id={id} className={`${level === 2 ? 'mt-48' : 'mt-32'} scroll-mt-64`}>
      <H className={`${level === 2 ? 'type-heading-lg' : 'type-heading-md'} text-default`}>{title}</H>
      {intro && <p className="type-body-md mt-4 max-w-[64ch] text-muted">{intro}</p>}
      <div className="mt-16">{children}</div>
    </section>
  );
}

/** Every variant × state, in one theme. The panel sets its own data-theme, so light and dark sit side by side. */
function StateGrid({ theme, icon = false }) {
  return (
    <div data-theme={theme} className="min-w-0 rounded-md border border-default bg-default">
      <p className="type-label-sm border-b border-default px-16 py-8 text-muted">{theme === 'light' ? 'Light' : 'Dark'}</p>
      <div className="overflow-x-auto px-16 pb-16">
        <table className="w-full border-separate border-spacing-y-12">
          <thead>
            <tr>
              <th className="type-label-sm w-[72px] text-left text-muted"><span className="sr-only">Variant</span></th>
              {STATES.map((s) => (
                <th key={s.id} className="type-label-sm px-8 text-left align-bottom font-medium text-muted">
                  <span className="block text-default">{s.id}</span>
                  <span className="type-caption block">{s.how}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {VARIANTS.map((v) => (
              <tr key={v}>
                <th scope="row" className="type-label-sm pr-8 text-left font-medium text-muted">{v}</th>
                {STATES.map((s) => (
                  <td key={s.id} className="px-8">
                    {icon ? (
                      <IconButton variant={v} icon={<DotsThree />} aria-label={`More actions (${v}, ${s.id} preview)`} {...stateProps(s.id)} />
                    ) : (
                      <Button variant={v} {...stateProps(s.id)}>Button</Button>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Example({ title, code, children }) {
  return (
    <div className="flex min-w-0 flex-col gap-8">
      <p className="type-label-md text-default">{title}</p>
      <div className="flex min-h-[72px] flex-wrap items-center gap-12 rounded-sm border border-default bg-default px-16 py-16">{children}</div>
      <CodeBlock code={code} label={title} />
    </div>
  );
}

const PROPS = [
  ['variant', "'primary' | 'secondary' | 'ghost' | 'danger'", "'secondary'", 'variant'],
  ['size', "'sm' | 'md' | 'lg'", "'md'", 'size'],
  ['children', 'ReactNode', '—', 'label (text)'],
  ['iconStart', 'ReactNode', '—', 'iconStart + iconStart · icon'],
  ['iconEnd', 'ReactNode', '—', 'iconEnd + iconEnd · icon'],
  ['disabled', 'boolean', 'false', 'state=disabled'],
  ['loading', 'boolean', 'false', 'state=loading'],
  ['asChild', 'boolean', 'false', '— (looks identical)'],
  ['type', "'button' | 'submit' | 'reset'", "'button'", '—'],
  ['(CSS) :hover, :active, :focus-visible', '—', '—', 'state=hover, pressed, focus'],
];

function SaveDemo() {
  const [saving, setSaving] = useState(false);
  const [count, setCount] = useState(0);
  const save = () => { setCount((c) => c + 1); setSaving(true); setTimeout(() => setSaving(false), 1500); };
  return (
    <div className="flex flex-wrap items-center gap-12">
      <Button variant="primary" loading={saving} onClick={save}>Save changes</Button>
      <Button iconStart={<ArrowClockwise />}>Retry</Button>
      <Button variant="ghost" iconEnd={<CaretDown />}>Last 30 days</Button>
      <Button variant="danger" iconStart={<Trash />}>Delete</Button>
      <Button disabled>Disabled</Button>
      <IconButton icon={<GearSix />} aria-label="Settings" />
      <span className="type-body-sm text-muted" aria-live="polite">Saved {count} {count === 1 ? 'time' : 'times'}</span>
    </div>
  );
}

export default function ButtonPage() {
  return (
    <div>
      <p className="type-label-sm text-muted">Components</p>
      <h1 id="button" className="type-heading-xl mt-4 scroll-mt-64 text-default">Button</h1>
      <p className="type-body-md mt-8 max-w-[64ch] text-muted">
        One action per button. Primary is the single main action in a view, so the accent stays rare; secondary is the default.
        Danger is subtle red text (a solid danger arrives with Dialog). Icon-only actions use IconButton.
      </p>
      <div className="mt-16 flex flex-wrap gap-8">
        <Button asChild size="sm" iconEnd={<ArrowRight />}><a href={FIGMA + '22-471'} target="_blank" rel="noreferrer">Figma component</a></Button>
        <Button asChild size="sm" variant="ghost" iconEnd={<ArrowRight />}><a href={SOURCE + 'Button.tsx'} target="_blank" rel="noreferrer">Source</a></Button>
      </div>

      <Section id="button-try" title="Try it" intro="Real buttons, nothing forced. Tab to move focus, Enter or Space to press. Save goes into loading for 1.5s: it keeps focus and its width, and ignores clicks while busy.">
        <div className="rounded-md border border-default bg-default p-16"><SaveDemo /></div>
      </Section>

      <Section id="button-states" title="States" intro="Every Figma variant and state, in both themes at once. Hover, pressed and focus are CSS states in code, shown here with a docs-only preview attribute. Size md.">
        <div className="grid gap-16 xl:grid-cols-2">
          <StateGrid theme="light" />
          <StateGrid theme="dark" />
        </div>
        <div className="mt-16 flex flex-wrap gap-8">
          {VARIANTS.map((v) => <CopyChip key={v} code={`${jsx('Button', v, 'default')}>Label</Button>`} />)}
          <CopyChip code="<Button disabled>Label</Button>" />
          <CopyChip code="<Button loading>Label</Button>" />
        </div>
      </Section>

      <Section id="button-sizes" title="Sizes" intro="sm 28px for dense toolbars and tables, md 32px by default, lg 40px for the rare spacious form. On touch screens every size gets an invisible 40px tap area, so the layout doesn't change.">
        <div className="flex flex-col gap-16">
          {['primary', 'secondary'].map((v) => (
            <div key={v} className="flex flex-wrap items-center gap-12">
              {SIZES.map((s) => <Button key={s} variant={v} size={s} iconStart={<Plus />}>Add service</Button>)}
            </div>
          ))}
        </div>
        <div className="mt-16"><CodeBlock code={'<Button size="sm" iconStart={<Plus />}>Add service</Button>'} label="small button with icon" /></div>
      </Section>

      <Section id="button-examples" title="Examples">
        <div className="grid gap-24 lg:grid-cols-2">
          <Example title="Icons" code={`import { Plus, CaretDown } from '@phosphor-icons/react';\n\n<Button variant="primary" iconStart={<Plus />}>New alert</Button>\n<Button iconEnd={<CaretDown />}>Last 30 days</Button>`}>
            <Button variant="primary" iconStart={<Plus />}>New alert</Button>
            <Button iconEnd={<CaretDown />}>Last 30 days</Button>
          </Example>
          <Example title="Loading" code={'<Button variant="primary" loading={isSaving}>\n  Save changes\n</Button>'}>
            <Button variant="primary" loading>Save changes</Button>
            <Button loading>Export</Button>
          </Example>
          <Example title="Link that looks like a button" code={'<Button asChild iconEnd={<ArrowRight />}>\n  <a href="/services/checkout-api">Open service</a>\n</Button>'}>
            <Button asChild iconEnd={<ArrowRight />}><a href="#button-examples">Open service</a></Button>
          </Example>
          <Example title="Toolbar" code={'<Button size="sm" variant="ghost" iconStart={<FunnelSimple />}>Filter</Button>\n<Button size="sm" variant="ghost" iconStart={<DownloadSimple />}>Export</Button>\n<IconButton size="sm" variant="ghost" icon={<DotsThree />} aria-label="More actions" />'}>
            <Button size="sm" variant="ghost" iconStart={<FunnelSimple />}>Filter</Button>
            <Button size="sm" variant="ghost" iconStart={<DownloadSimple />}>Export</Button>
            <IconButton size="sm" variant="ghost" icon={<DotsThree />} aria-label="More actions" />
          </Example>
        </div>
      </Section>

      <Section id="button-props" title="Props" intro="Code props use the Figma property names. Not every Figma variant is a prop: three states are CSS.">
        <div className="overflow-x-auto rounded-md border border-default bg-surface">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="type-label-sm text-muted">
                {['Prop', 'Type', 'Default', 'Figma'].map((h) => <th key={h} className="border-b border-default px-16 py-8 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {PROPS.map(([p, t, d, f]) => (
                <tr key={p} className="type-body-sm">
                  <td className="type-mono-sm border-b border-default px-16 py-8 text-default">{p}</td>
                  <td className="type-mono-sm border-b border-default px-16 py-8 text-muted">{t}</td>
                  <td className="type-mono-sm border-b border-default px-16 py-8 text-muted">{d}</td>
                  <td className="border-b border-default px-16 py-8 text-default">{f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="button-a11y" title="Accessibility">
        <ul className="type-body-md flex max-w-[72ch] list-disc flex-col gap-4 pl-20 text-default">
          <li>A native <code className="type-mono-sm">&lt;button&gt;</code>, so Tab, Enter and Space work without extra code. <code className="type-mono-sm">type</code> defaults to <code className="type-mono-sm">"button"</code>, so it never submits a form by accident.</li>
          <li>Focus shows only for keyboard focus (<code className="type-mono-sm">:focus-visible</code>): a 2px ring with a 2px gap, drawn with <code className="type-mono-sm">outline</code> so it survives Windows high-contrast mode. The ring against the page, card and selected-row backgrounds is 5.87–7.42:1 (the build checks it).</li>
          <li><code className="type-mono-sm">loading</code> sets <code className="type-mono-sm">aria-busy</code>, ignores clicks and stays focusable, so keyboard users don't lose their place. With reduced motion the spinner pulses instead of spinning.</li>
          <li>Every label/fill pair in every state is in the build's contrast check (82 pairs, WCAG 2.2 AA). Disabled text is exempt from WCAG; Datum keeps it at 2.25:1 (light) and 2.70:1 (dark) so it stays readable.</li>
          <li>Touch screens get a 40px tap area around every size (WCAG 2.2 AA asks for 24px).</li>
        </ul>
      </Section>

      <h1 id="icon-button" className="type-heading-xl mt-64 scroll-mt-64 text-default">IconButton</h1>
      <p className="type-body-md mt-8 max-w-[64ch] text-muted">
        Square, icon only, for toolbars and row actions. Same variants, sizes and states as Button. <code className="type-mono-sm">aria-label</code> is a required prop: an IconButton without one doesn't compile, so it can't ship unlabeled. Describe the action, not the icon: "Delete service", not "Trash".
      </p>
      <div className="mt-16 flex flex-wrap gap-8">
        <Button asChild size="sm" iconEnd={<ArrowRight />}><a href={FIGMA + '23-266'} target="_blank" rel="noreferrer">Figma component</a></Button>
        <Button asChild size="sm" variant="ghost" iconEnd={<ArrowRight />}><a href={SOURCE + 'IconButton.tsx'} target="_blank" rel="noreferrer">Source</a></Button>
      </div>
      <Section id="icon-button-states" title="States" intro="Size md, both themes.">
        <div className="grid gap-16 xl:grid-cols-2">
          <StateGrid theme="light" icon />
          <StateGrid theme="dark" icon />
        </div>
      </Section>
      <Section id="icon-button-sizes" title="Sizes and icons">
        <div className="flex flex-wrap items-center gap-12">
          {SIZES.map((s) => <IconButton key={s} size={s} icon={<MagnifyingGlass />} aria-label={`Search (${s})`} />)}
          {[[Copy, 'Copy ID'], [ArrowClockwise, 'Refresh'], [X, 'Close panel'], [Trash, 'Delete service']].map(([I, l]) => (
            <IconButton key={l} variant={l === 'Delete service' ? 'danger' : 'ghost'} icon={<I />} aria-label={l} />
          ))}
        </div>
        <div className="mt-16"><CodeBlock code={'import { Trash } from \'@phosphor-icons/react\';\n\n<IconButton variant="danger" icon={<Trash />} aria-label="Delete service" />'} label="icon button" /></div>
      </Section>
    </div>
  );
}
