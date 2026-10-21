/**
 * Datum Spinner. Figma: Icons page → "spinner".
 * A 3/4 ring with the same 1.5px weight as Phosphor Bold icons at 16px.
 * Rotates; with reduced motion it pulses instead. Colour = currentColor.
 * Decorative: the control that shows it carries the busy state (aria-busy).
 */
export function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false"
      className={`animate-spin motion-reduce:animate-pulse ${className}`}>
      {/* From 12 o'clock, clockwise to 9 o'clock. Radius 7.25 = centre of a 1.5px ring in a 16px box. */}
      <path d="M8 0.75 A7.25 7.25 0 1 1 0.75 8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
