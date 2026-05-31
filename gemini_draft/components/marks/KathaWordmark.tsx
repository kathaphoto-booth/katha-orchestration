import { cn } from '@/lib/utils';

/**
 * KathaWordmark — custom letterforms (not Fraunces).
 *
 * Constructed at stroke 7u, x-height 36u, ascender 56u.
 * Two intentional irregularities:
 *  - `t` crossbar at stroke-width 11 vs stem 7 → Fukinsei terminal
 *    (mirrors the logomark's reverse-tuck doubled-weight corner)
 *  - First `a` exits with a 1.5u descender; second `a` sits flat → wabi-sabi
 *
 * Light variant: Iron Bark on Piña Ecru.
 * Dark variant: Piña Ecru on Obsidian Weave.
 */
export function KathaWordmark({
  variant = 'light',
  className,
  title = 'katha',
}: {
  variant?: 'light' | 'dark';
  className?: string;
  title?: string;
}) {
  const stroke = variant === 'dark'
    ? 'var(--katha-pina-ecru)'
    : 'var(--katha-iron-bark)';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 290 80"
      fill="none"
      role="img"
      aria-label={title}
      className={cn('h-8 w-auto', className)}
    >
      <g
        stroke={stroke}
        strokeWidth="7"
        strokeLinecap="square"
        strokeLinejoin="miter"
        fill="none"
      >
        {/* k */}
        <path d="M 22 16 L 22 64" />
        <path d="M 22 44 L 52 16" />
        <path d="M 22 44 L 52 64" />
        {/* a1 (with descender) */}
        <path d="M 96 32 C 96 20, 78 20, 78 32 L 78 56 C 78 68, 96 68, 96 56 L 96 32" />
        <path d="M 96 32 L 96 66" />
        {/* t (Fukinsei crossbar at stroke-width 11) */}
        <path d="M 130 8 L 130 60 C 130 66, 138 66, 144 64" />
        <path d="M 121 28 L 148 28" strokeWidth="11" />
        {/* h */}
        <path d="M 178 8 L 178 64" />
        <path d="M 178 36 C 178 26, 196 24, 206 30 C 214 36, 214 46, 214 64" />
        {/* a2 (flat baseline) */}
        <path d="M 264 32 C 264 20, 246 20, 246 32 L 246 56 C 246 68, 264 68, 264 56 L 264 32" />
        <path d="M 264 32 L 264 64" />
      </g>
    </svg>
  );
}
