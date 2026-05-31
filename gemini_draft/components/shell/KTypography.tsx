import { cn } from '@/lib/utils';
import { ReactNode, ElementType } from 'react';

/**
 * KEyebrow — section label / eyebrow above headings.
 * Inter, ALL CAPS, Abel Slate, +0.16em tracking, 0.7rem.
 * The standard Katha section opener.
 */
export function KEyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn('text-label-ui text-text-muted mb-6', className)}
      style={{ fontSize: '0.7rem', letterSpacing: '0.16em' }}
    >
      {children}
    </p>
  );
}

/**
 * KHeading — Fraunces display heading.
 * SOFT=100 WONK=1 variation always applied (the carved-wood feel).
 * The `t`-crossbar Fukinsei asymmetry is baked into the font variation.
 *
 * Sizes:
 *  - 'display' (h1): clamp(3rem, 7vw, 6.5rem), lh 1.05
 *  - 'xl'     (h2): 2.5rem, lh 1.1
 *  - 'lg'     (h3): 1.875rem, lh 1.2
 *  - 'md'     (h4): 1.5rem, lh 1.3
 */
export function KHeading({
  children,
  as,
  size = 'xl',
  className,
  dark = false,
}: {
  children: ReactNode;
  as?: ElementType;
  size?: 'display' | 'xl' | 'lg' | 'md';
  className?: string;
  dark?: boolean;
}) {
  const defaultTag = size === 'display' ? 'h1' : size === 'xl' ? 'h2' : size === 'lg' ? 'h3' : 'h4';
  const Tag = as ?? defaultTag;

  const sizes = {
    display: 'text-[clamp(3rem,7vw,6.5rem)] leading-[1.05]',
    xl:      'text-[2.5rem] leading-[1.1]',
    lg:      'text-[1.875rem] leading-[1.2]',
    md:      'text-[1.5rem] leading-[1.3]',
  };

  return (
    <Tag
      className={cn(
        'font-display',
        sizes[size],
        dark ? 'text-text-on-dark' : 'text-text-primary',
        className
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * KBody — EB Garamond body copy.
 * The slow, deliberate reading voice of Katha.
 *
 * Sizes:
 *  - 'lg': 1.125rem, lh 1.55  (pull quotes, intro paragraphs)
 *  - 'md': 1rem, lh 1.55      (default body)
 *  - 'sm': 0.875rem, lh 1.55  (captions, secondary notes)
 */
export function KBody({
  children,
  as: Tag = 'p',
  size = 'md',
  className,
  dark = false,
}: {
  children: ReactNode;
  as?: ElementType;
  size?: 'lg' | 'md' | 'sm';
  className?: string;
  dark?: boolean;
}) {
  const sizes = {
    lg: 'text-[1.125rem] leading-[1.55]',
    md: 'text-[1rem] leading-[1.55]',
    sm: 'text-[0.875rem] leading-[1.55]',
  };

  return (
    <Tag
      className={cn(
        'font-body',
        sizes[size],
        dark ? 'text-katha-hammered-sequin' : 'text-text-muted',
        className
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * KMeta — JetBrains Mono metadata / stamp line.
 * For ordinals, captions, keepsake stamps, maker's metadata.
 * Format: "KTHA · №034 · 2026 · FAMILY"
 */
export function KMeta({
  children,
  className,
  dark = false,
}: {
  children: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <span
      className={cn(
        'font-mono uppercase',
        dark ? 'text-katha-hammered-sequin' : 'text-text-muted',
        className
      )}
      style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}
    >
      {children}
    </span>
  );
}

/**
 * KOrdinal — section number stamp.
 * "01", "02", "03" — mono, muted, deliberate.
 */
export function KOrdinal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn('font-mono text-text-muted block mb-4', className)}
      style={{ fontSize: '0.75rem', letterSpacing: '0.25em' }}
    >
      {children}
    </span>
  );
}
