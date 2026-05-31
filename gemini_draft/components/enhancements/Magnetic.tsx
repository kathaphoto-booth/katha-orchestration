'use client';

import { useEffect, useRef, ReactNode } from 'react';

/**
 * Magnetic — element drifts toward the cursor, springs back on leave.
 * Harvested from quiet_lux. BUG FIXED: original captured bounds once in
 * the constructor and only refreshed on resize — with smooth-scroll the
 * hit-zone drifted. Here bounds are recomputed on every mouse enter
 * (cheap, and always correct regardless of scroll position).
 *
 * Next.js portal ONLY. Reduced-motion → inert (renders children, no motion).
 */
export function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let bounds: DOMRect | null = null;
    let raf = 0;
    let targetX = 0, targetY = 0, curX = 0, curY = 0;

    const animate = () => {
      curX += (targetX - curX) * 0.18;
      curY += (targetY - curY) * 0.18;
      el.style.transform = `translate(${curX}px, ${curY}px)`;
      if (Math.abs(targetX - curX) > 0.1 || Math.abs(targetY - curY) > 0.1) {
        raf = requestAnimationFrame(animate);
      } else {
        raf = 0;
      }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(animate); };

    const onEnter = () => { bounds = el.getBoundingClientRect(); }; // FIX: fresh bounds every time
    const onMove = (e: MouseEvent) => {
      if (!bounds) bounds = el.getBoundingClientRect();
      const cx = bounds.left + bounds.width / 2;
      const cy = bounds.top + bounds.height / 2;
      targetX = (e.clientX - cx) * strength;
      targetY = (e.clientY - cy) * strength;
      kick();
    };
    const onLeave = () => { targetX = 0; targetY = 0; kick(); };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [strength]);

  return (
    <span ref={ref} className={className} style={{ display: 'inline-block', willChange: 'transform' }}>
      {children}
    </span>
  );
}
