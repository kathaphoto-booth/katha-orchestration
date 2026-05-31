'use client';

import { useEffect, useRef, useState, ReactNode, ElementType } from 'react';

/**
 * WhisperReveal — line rises from a clipped container (the loom shuttle reveal).
 * Harvested from quiet_lux. Uses IntersectionObserver (no GSAP dependency)
 * so there is no missing-plugin failure mode.
 *
 * Reduced-motion → content shown immediately, no transform.
 * `delay` staggers multiple lines.
 */
export function WhisperReveal({
  children,
  as: Tag = 'div',
  delay = 0,
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduced(true);
      setRevealed(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className={className} style={{ display: 'block', overflow: 'hidden' }}>
      <Tag
        style={{
          display: 'block',
          transform: revealed || reduced ? 'translateY(0)' : 'translateY(110%)',
          opacity: revealed || reduced ? 1 : 0,
          transition: reduced
            ? 'none'
            : `transform 1.4s cubic-bezier(0.16,1,0.3,1) ${delay}s, opacity 1.4s ease ${delay}s`,
        }}
      >
        {children}
      </Tag>
    </span>
  );
}
