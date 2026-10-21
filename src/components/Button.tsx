import type { ButtonHTMLAttributes, MouseEvent, ReactNode, Ref } from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { IconContext } from '@phosphor-icons/react';
import { Spinner } from './Spinner';
import { base, sizes, variants, type ButtonSize, type ButtonVariant } from './button-styles';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Figma: variant. Secondary is the default so the accent stays rare; use primary for the one main action in a view. */
  variant?: ButtonVariant;
  /** Figma: size. sm 28 · md 32 · lg 40. */
  size?: ButtonSize;
  /** Figma: state=loading. Shows a spinner, keeps the button's width and focus, ignores clicks, sets aria-busy. */
  loading?: boolean;
  /** Figma: iconStart + "iconStart · icon". Pass a Phosphor icon; Bold weight and size are applied for you. */
  iconStart?: ReactNode;
  /** Figma: iconEnd + "iconEnd · icon". */
  iconEnd?: ReactNode;
  /** Render the child element instead (e.g. a link that looks like a button). Radix Slot. No Figma equivalent. */
  asChild?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

/** Phosphor icons inside a button: Bold (matches Geist Medium), sized by the slot. */
const ICONS = { weight: 'bold', size: '100%', color: 'currentColor', mirrored: false } as const;

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  iconStart,
  iconEnd,
  asChild = false,
  type,
  className = '',
  children,
  onClick,
  ref,
  ...rest
}: ButtonProps) {
  const s = sizes[size];
  const Comp = asChild ? Slot : 'button';
  const icon = (node: ReactNode) => node && <span aria-hidden="true" className={`inline-flex shrink-0 ${s.icon}`}>{node}</span>;
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (loading) { e.preventDefault(); return; } // stays focusable, but doesn't fire twice
    onClick?.(e);
  };

  return (
    <IconContext.Provider value={ICONS}>
      <Comp
        ref={ref}
        type={asChild ? undefined : (type ?? 'button')} // never submits a form by accident
        className={`${base} ${variants[variant]} ${s.button} ${className}`}
        aria-busy={loading || undefined}
        data-loading={loading || undefined}
        onClick={handleClick}
        {...rest}
      >
        {asChild ? (
          // Slot puts the icons inside the child element (e.g. the <a>). Loading isn't supported on links.
          <>
            {icon(iconStart)}
            <Slottable>{children}</Slottable>
            {icon(iconEnd)}
          </>
        ) : (
          <>
            {/* While loading, the content is hidden but keeps its space, so the button doesn't change width. */}
            <span className={`contents ${loading ? 'invisible' : ''}`}>
              {icon(iconStart)}
              {children}
              {icon(iconEnd)}
            </span>
            {loading && <Spinner className={`absolute inset-0 m-auto ${s.icon}`} />}
          </>
        )}
      </Comp>
    </IconContext.Provider>
  );
}
