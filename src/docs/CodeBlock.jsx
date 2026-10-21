import { useState } from 'react';
import { Copy, Check } from '@phosphor-icons/react';
import { IconButton } from '../components/IconButton';

/** A code example with a copy button. Built from Datum's own IconButton. */
export function CodeBlock({ code, label }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch {}
  };
  return (
    <div className="flex items-start gap-8 rounded-sm border border-default bg-surface py-4 pl-12 pr-4">
      <pre className="type-mono-sm min-w-0 flex-1 overflow-x-auto py-4 text-default"><code>{code}</code></pre>
      <IconButton size="sm" variant="ghost" icon={copied ? <Check /> : <Copy />}
        aria-label={copied ? 'Copied' : `Copy code${label ? `: ${label}` : ''}`} onClick={copy} />
    </div>
  );
}

/** Inline code chip that copies itself on click. */
export function CopyChip({ code }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch {}
  };
  return (
    <button type="button" onClick={copy} title="Copy" aria-label={`Copy ${code}`}
      className="type-mono-sm max-w-full cursor-pointer truncate rounded-sm px-4 text-left text-muted hover:bg-hover hover:text-default">
      {copied ? <span className="text-success">Copied</span> : code}
    </button>
  );
}
