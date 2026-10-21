import { useEffect, useState } from 'react';
import TokensPage from './pages/Tokens.jsx';

// Docs shell: top bar + sidebar. Stage 3 components will be added as more pages here.
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

const NAV = [
  { href: '#semantic', label: 'Semantic colours' },
  { href: '#contrast', label: 'Contrast' },
  { href: '#primitives', label: 'Primitive scales' },
  { href: '#dimensions', label: 'Space, size, radius' },
  { href: '#type', label: 'Text styles' },
];

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 flex h-control-lg items-center justify-between gap-16 border-b border-default bg-default px-16 md:px-24">
        <a href="#top" className="type-heading-sm flex items-baseline gap-8 text-default no-underline">
          Datum <span className="type-body-sm text-muted">Design system</span>
        </a>
        <ThemeSwitch />
      </header>
      <div className="mx-auto grid max-w-[1280px] md:grid-cols-[200px_minmax(0,1fr)]">
        <nav aria-label="Docs" className="hidden border-r border-default px-16 py-24 md:block">
          <p className="type-label-sm text-muted">Foundations</p>
          <a href="#top" className="type-label-md mt-8 block rounded-sm bg-selected px-8 py-4 text-default no-underline" aria-current="page">
            Tokens
          </a>
          <ul className="mt-4 border-l border-default">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="type-body-sm block py-4 pl-12 text-muted no-underline hover:text-default">{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <main id="top" className="min-w-0 px-16 py-32 md:px-40">
          <TokensPage />
        </main>
      </div>
    </div>
  );
}
