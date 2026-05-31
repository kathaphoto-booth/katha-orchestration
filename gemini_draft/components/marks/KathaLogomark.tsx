import { cn } from '@/lib/utils';

/**
 * KathaLogomark — "The Threshold"
 *
 * One continuous stroke representing both photo booths.
 * - Left leg, full-height, rooted to baseline → wooden booth (loom, gravity)
 * - Right leg, shorter, lifted (ends mid-air) → pearl-white modern booth (restraint)
 * - Lintel above → the shared threshold both booths create
 * - Reverse-tuck overhang at top-right → Fukinsei + the katha act (doubled weight)
 *
 * Passes the Arturo Luz single-line test: reproducible as one bent strand
 * of stainless steel. The reverse-tuck is the strand folded over itself.
 */
export function KathaLogomark({
  variant = 'default',
  className,
  title = "Katha threshold mark",
}: {
  variant?: 'default' | 'sacred';
  className?: string;
  title?: string;
}) {
  const stroke = variant === 'sacred' ? 'var(--katha-loko-rust)' : 'var(--katha-iron-bark)';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      role="img"
      aria-label={title}
      className={cn('w-9 h-9', className)}
    >
      <path
        d="M 18 88 L 18 18 L 78 18 L 90 18 L 78 18 L 78 68"
        stroke={stroke}
        strokeWidth="6"
        strokeLinecap="square"
        strokeLinejoin="miter"
        fill="none"
      />
    </svg>
  );
}
