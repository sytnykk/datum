// Shared by Button and IconButton. Each class maps to a Datum token with the same name as in Figma:
// bg-accent-hover = bg/accent-hover, px-12 = space/12, h-control-md = size/control-md, type-label-md = label/md.

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

/** Layout, focus and disabled behaviour every button shares. */
export const base = [
  'relative inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-sm',
  'cursor-pointer select-none no-underline transition-colors duration-100 motion-reduce:transition-none',
  'outline-none focus-ring:focus-ring-button', // 2px ring, 2px gap (decision 4B)
  'touch-target', // 40px tap area on touch screens (decision 6A)
  'is-disabled:cursor-not-allowed',
  'data-loading:cursor-progress',
].join(' ');

/** Figma: variant=… × state=… Hover/pressed only apply when the button can be used. */
export const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent can-hover:bg-accent-hover can-press:bg-accent-pressed is-disabled:bg-disabled is-disabled:text-disabled',
  secondary:
    'border-(length:--stroke-default) border-default bg-surface text-default can-hover:bg-hover can-press:bg-pressed is-disabled:bg-disabled is-disabled:text-disabled',
  ghost: 'bg-transparent text-default can-hover:bg-hover can-press:bg-pressed is-disabled:text-disabled',
  danger:
    'border-(length:--stroke-default) border-default bg-surface text-error can-hover:bg-error-subtle can-press:bg-error-pressed can-press:text-error-strong is-disabled:bg-disabled is-disabled:text-disabled',
};

/** Figma: size=sm | md | lg (height, padding, gap, text style, icon size). */
export const sizes: Record<ButtonSize, { button: string; square: string; icon: string }> = {
  sm: { button: 'h-control-sm gap-4 px-8 type-label-sm', square: 'size-control-sm', icon: 'size-icon-sm' },
  md: { button: 'h-control-md gap-6 px-12 type-label-md', square: 'size-control-md', icon: 'size-icon-md' },
  lg: { button: 'h-control-lg gap-8 px-16 type-label-lg', square: 'size-control-lg', icon: 'size-icon-md' },
};
