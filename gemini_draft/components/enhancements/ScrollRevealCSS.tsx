'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * ScrollRevealCSS — Progressive enhancement wrapper.
 *
 * Uses CSS Scroll-Driven Animations where supported (Chrome 115+, Safari 26+).
 * Falls back to IntersectionObserver for Firefox.
 * Respects prefers-reduced-motion (CSS handles this via @media query).
 *
 * The CSS class `.k-reveal` is defined in globals.css with:
 *   animation-timeline: view()
 *   animation-range: entry 10% entry 90%, exit 60% exit 100%
 * inside an @supports + @media feature/preference detection block.
 *
 * This component adds the JS fallback for browsers without
 * scroll-driven animation support (per modern-web-guidance best practice).
 */
export function ScrollRevealCSS({
  children,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'li';
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Feature detection per modern-web-guidance:
    // Check for BOTH animation-timeline AND animation-range support
    if (
      typeof CSS !== 'undefined' &&
      CSS.supports('(animation-timeline: view()) and (animation-range: entry)')
    ) {
      // CSS handles everything natively — no JS needed
      return;
    }

    // Respect user preference
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      // Make element visible immediately
      if (ref.current) {
        ref.current.style.opacity = '1';
        ref.current.style.transform = 'none';
      }
      return;
    }

    // JS fallback for Firefox and older browsers
    const el = ref.current;
    if (!el) return;

    // Set initial hidden state
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 700ms var(--ease-loom), transform 700ms var(--ease-loom)`;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute('style',
              entry.target.getAttribute('style')?.replace(
                /opacity:\s*0/,
                'opacity: 1'
              )?.replace(
                /translateY\(24px\)/,
                'translateY(0)'
              ) || ''
            );
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref as any} className={cn('k-reveal', className)}>
      {children}
    </Tag>
  );
}
