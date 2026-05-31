import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

/**
 * KSection — the foundational section wrapper.
 *
 * Injects the correct Ma breathing (section-level vertical padding),
 * horizontal gutter, and optional surface variant.
 *
 * Any content dropped inside automatically inherits the Katha
 * spatial grammar — the brother can inject anything here.
 *
 * Variants:
 *  - 'light'  (default): Piña Ecru ground
 *  - 'dark'            : Knalum Ink ground (T'nalak background, narrative sections)
 *  - 'mid'             : Champagne Heirloom tonal shift
 */
export function KSection({
  children,
  id,
  className,
  variant = 'light',
  noPadding = false,
}: {
  children: ReactNode;
  id?: string;
  className?: string;
  variant?: 'light' | 'dark' | 'mid';
  noPadding?: boolean;
}) {
  const surfaces = {
    light: 'bg-bg-primary text-text-primary',
    dark:  'bg-bg-narrative text-text-on-dark',
    mid:   'bg-katha-champagne-heirloom text-text-primary',
  };

  return (
    <section
      id={id}
      className={cn(
        'relative w-full scroll-mt-[80px]',
        surfaces[variant],
        !noPadding && 'px-[var(--spacing-margin-mobile)] md:px-[var(--spacing-margin-desktop)] py-[var(--spacing-section-gap)]',
        className
      )}
    >
      {children}
    </section>
  );
}
