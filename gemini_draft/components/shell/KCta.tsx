'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ReactNode, useEffect } from 'react';

/**
 * KCta — Katha call-to-action.
 *
 * Variants:
 *  - 'sacred'   (Loko Rust bg, Piña Ecru text) — primary action; ONE per page section
 *  - 'ghost'    (no bg, Iron Bark border-bottom) — secondary / inline link-style
 *  - 'outline'  (Piña Ecru bg, Iron Bark border) — tertiary, decorative contexts
 *
 * Rule: 'sacred' is a scarce resource. The T'nalak brass ring is not used for everything.
 * If more than one 'sacred' CTA is visible simultaneously, demote one to 'ghost'.
 *
 * Dev-mode guard: counts all DOM elements with [data-ktha-sacred].
 * Throws a descriptive error if more than one sacred CTA is mounted.
 *
 * Both href (Link) and onClick (button) modes supported.
 * Hover uses --ease-spring (physics-based linear() easing) for the settle effect.
 */
export function KCta({
  children,
  href,
  onClick,
  variant = 'ghost',
  className,
  type = 'button',
  disabled = false,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'sacred' | 'ghost' | 'outline';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  // Dev-mode runtime guard: enforce single sacred CTA per viewport
  useEffect(() => {
    if (variant !== 'sacred') return;
    if (process.env.NODE_ENV !== 'development') return;

    // Defer count to next frame to allow all CTAs to mount
    const raf = requestAnimationFrame(() => {
      const sacredCount = document.querySelectorAll('[data-ktha-sacred]').length;
      if (sacredCount > 1) {
        console.error(
          `[KCta] Brand violation: ${sacredCount} sacred CTAs visible simultaneously. ` +
          `The T'nalak brass ring is reserved for exactly ONE booking moment per viewport. ` +
          `Demote excess sacred CTAs to variant="ghost" or variant="outline".`
        );
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [variant]);

  const base = cn(
    'inline-flex items-center rounded-none cursor-pointer',
    'font-ui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-cta-sacred focus-visible:ring-offset-bg-primary',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  );

  const variants = {
    sacred: cn(
      base,
      'bg-cta-sacred text-text-on-dark px-8 py-4',
      'hover:bg-katha-loko-rust/90',
      'focus-visible:ring-cta-sacred',
    ),
    ghost: cn(
      base,
      'text-text-muted hover:text-text-primary',
      'underline underline-offset-4',
      'px-0 py-0',
    ),
    outline: cn(
      base,
      'bg-transparent text-text-primary',
      'border border-katha-iron-bark px-8 py-4',
      'hover:bg-katha-iron-bark hover:text-katha-pina-ecru',
    ),
  };

  const styles = {
    fontSize: '0.875rem',
    letterSpacing: '0.04em',
    // Spring hover easing via --ease-spring (linear() physics-based)
    transitionProperty: 'background-color, color, transform, box-shadow',
    transitionDuration: 'var(--dur-fast)',
    transitionTimingFunction: 'var(--ease-spring)',
  };

  const sacredProps = variant === 'sacred' ? { 'data-ktha-sacred': true } : {};

  if (href) {
    return (
      <Link
        href={href}
        className={cn(variants[variant], className)}
        style={styles}
        {...sacredProps}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(variants[variant], className)}
      style={styles}
      {...sacredProps}
    >
      {children}
    </button>
  );
}
