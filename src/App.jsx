import { useEffect, useState } from 'react';
import TokensPage from './pages/Tokens.jsx';
import ButtonPage from './pages/ButtonPage.jsx';

// Docs shell: top bar + sidebar. Pages are picked from the URL hash, so GitHub Pages needs no server routing:
// #button, #icon-button and their sections open the Button page; everything else is the Tokens page.
const THEMES = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

function ThemeSwitch() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'system');
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = theme;
    try { theme === 'system' ? localStorage.removeItem('datum-theme') : localStorage.setItem('datum-theme', theme); } catch {}
  }, [theme]);
  // Plain radio group for now; replaced by the Segmented component once it exists (Stage 3).
  return (
    <fieldset className="flex rounded-sm border border-default bg-surface p-2">
      <legend className="sr-only">Colour theme</legend>
      {THEMES.map((t) => (
        <label
          key={t.id}
          className={`type-label-sm cursor-pointer rounded-sm px-8 py-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-focus-ring ${theme === t.id ? 'bg-selected text-default' : 'text-muted'}`}
        >
          <input type="radio" name="theme" value={t.id} checked={theme === t.id} onChange={() => setTheme(t.id)} className="sr-only" />
          {t.label}
        </label>
      ))}
    </fieldset>
  );
}

const PAGES = [
  {
    id: 'tokens', group: 'Foundations', label: 'Tokens', href: '#top', Page: TokensPage,
    sections: [
      { href: '#semantic', label: 'Semantic colours' },
      { href: '#contrast', label: 'Contrast' },
      { href: '#primitives', label: 'Primitive scales' },
      { href: '#dimensions', label: 'Space, size, radius, stroke' },
      { href: '#type', label: 'Text styles' },
    ],
  },
  {
    id: 'button', group: 'Components', label: 'Button', href: '#button', Page: ButtonPage, match: /^#(button|icon-button)/,
    sections: [
      { href: '#button-try', label: 'Try it' },
      { href: '#button-states', label: 'States' },
      { href: '#button-sizes', label: 'Sizes' },
      { href: '#button-examples', label: 'Examples' },
      { href: '#button-props', label: 'Props' },
      { href: '#button-a11y', label: 'Accessibility' },
      { href: '#icon-button', label: 'IconButton' },
    ],
  },
];
const pageFor = (hash) => PAGES.find((p) => p.match?.test(hash)) ?? PAGES[0];

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHash();
  const page = pageFor(hash);
  // Switching pages: scroll to the anchor once the new page has rendered.
  useEffect(() => {
    const el = hash && document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView(); else window.scrollTo(0, 0);
  }, [page]);
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 flex h-control-lg items-center justify-between gap-16 border-b border-default bg-default px-16 md:px-24">
        <a href="#top" className="type-heading-sm flex items-baseline gap-8 text-default no-underline">
          Datum <span className="type-body-sm hidden text-muted sm:inline">Design system</span>
        </a>
        <nav aria-label="Pages" className="mr-auto flex gap-4 md:hidden">
          {PAGES.map((p) => (
            <a key={p.id} href={p.href} aria-current={p === page ? 'page' : undefined}
              className={`type-label-sm rounded-sm px-8 py-4 no-underline ${p === page ? 'bg-selected text-default' : 'text-muted'}`}>{p.label}</a>
          ))}
        </nav>
        <ThemeSwitch />
      </header>
      <div className="mx-auto grid max-w-[1280px] md:grid-cols-[200px_minmax(0,1fr)]">
        <nav aria-label="Docs" className="hidden border-r border-default px-16 py-24 md:block">
          {PAGES.map((p) => (
            <div key={p.id} className="mb-24">
              <p className="type-label-sm text-muted">{p.group}</p>
              <a href={p.href} aria-current={p === page ? 'page' : undefined}
                className={`type-label-md mt-8 block rounded-sm px-8 py-4 no-underline ${p === page ? 'bg-selected text-default' : 'text-muted hover:bg-hover hover:text-default'}`}>
                {p.label}
              </a>
              {p === page && (
                <ul className="mt-4 border-l border-default">
                  {p.sections.map((n) => (
                    <li key={n.href}>
                      <a href={n.href} className="type-body-sm block py-4 pl-12 text-muted no-underline hover:text-default">{n.label}</a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>
        <main id="top" className="min-w-0 px-16 py-32 md:px-40">
          <page.Page />
        </main>
      </div>
    </div>
  );
}
