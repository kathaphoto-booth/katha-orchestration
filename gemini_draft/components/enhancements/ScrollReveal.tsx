'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

/**
 * ScrollReveal — clip-path mask reveal + gentle parallax on scroll.
 * Harvested from quiet_lux. BUG FIXED: original referenced GSAP
 * ScrollTrigger which was never loaded → silent failure on browsers
 * without native view-timeline. This uses native CSS
 * `animation-timeline: view()` when supported, and a pure
 * IntersectionObserver fallback otherwise — zero external deps.
 *
 * Reduced-motion → content shown immediately.
 */
export function ScrollReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [supportsViewTimeline, setSupportsViewTimeline] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduced(true);
      setRevealed(true);
      return;
    }
    const native = CSS.supports?.('animation-timeline: view()');
    setSupportsViewTimeline(!!native);
    if (native) return; // CSS handles it

    // JS fallback
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const nativeStyle: React.CSSProperties =
    supportsViewTimeline && !reduced
      ? ({
          animation: 'k-reveal-mask linear both',
          animationTimeline: 'view()',
          animationRange: 'entry 10% cover 40%',
        } as React.CSSProperties)
      : {
          clipPath: revealed || reduced ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)',
          transition: reduced ? 'none' : 'clip-path 1.6s cubic-bezier(0.16,1,0.3,1)',
        };

  return (
    <div ref={ref} className={className} style={nativeStyle}>
      {children}
      <style jsx global>{`
        @keyframes k-reveal-mask {
          from { clip-path: inset(100% 0 0 0); }
          to   { clip-path: inset(0 0 0 0); }
        }
      `}</style>
    </div>
  );
}
