import type { ButtonHTMLAttributes, MouseEvent, ReactNode, Ref } from 'react';
import { IconContext } from '@phosphor-icons/react';
import { Spinner } from './Spinner';
import { base, sizes, variants, type ButtonSize, type ButtonVariant } from './button-styles';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> {
  /** Figma: icon (instance swap). A Phosphor icon; Bold weight and size are applied for you. */
  icon: ReactNode;
  /**
   * Required: what the button does, for screen readers ("Delete service", not "Trash").
   * An icon has no text, so without this the button is announced as just "button".
   * TypeScript won't compile an IconButton without it (decision 5A).
   */
  'aria-label': string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

const ICONS = { weight: 'bold', size: '100%', color: 'currentColor', mirrored: false } as const;

/** Datum IconButton. Figma: Button page → IconButton. Square, same variants, sizes and states as Button. */
export function IconButton({
  icon,
  variant = 'secondary',
  size = 'md',
  loading = false,
  type,
  className = '',
  onClick,
  ref,
  ...rest
}: IconButtonProps) {
  const s = sizes[size];
  if (import.meta.env?.DEV && !rest['aria-label']?.trim()) {
    console.error('Datum IconButton: aria-label is required, e.g. aria-label="Delete service".');
  }
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (loading) { e.preventDefault(); return; }
    onClick?.(e);
  };
  return (
    <IconContext.Provider value={ICONS}>
      <button
        ref={ref}
        type={type ?? 'button'}
        className={`${base} ${variants[variant]} ${s.square} ${className}`}
        aria-busy={loading || undefined}
        data-loading={loading || undefined}
        onClick={handleClick}
        {...rest}
      >
        <span aria-hidden="true" className={`inline-flex shrink-0 ${s.icon} ${loading ? 'invisible' : ''}`}>{icon}</span>
        {loading && <Spinner className={`absolute inset-0 m-auto ${s.icon}`} />}
      </button>
    </IconContext.Provider>
  );
}
