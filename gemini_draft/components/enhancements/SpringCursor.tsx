'use client';

import { useEffect, useRef } from 'react';

/**
 * SpringCursor — Katha spring-follower cursor.
 * Harvested from quiet_lux boilerplate, retuned to Katha tokens.
 *
 * Next.js portal ONLY (book.kathabooth.com). Never on Squarespace.
 * - Dot follows instantly; ring lags via spring interpolation.
 * - Morphs over [data-cursor="media"] elements to show a label.
 * - Fully disabled on coarse pointers and prefers-reduced-motion.
 */
export function SpringCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (coarse || reduced) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    };

    const tick = () => {
      // spring lag (rate 0.15)
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    const onEnterMedia = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      document.body.dataset.cursorState = 'media';
      ring.dataset.label = el.dataset.cursorLabel ?? 'VIEW';
    };
    const onLeaveMedia = () => {
      delete document.body.dataset.cursorState;
      delete ring.dataset.label;
    };

    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(tick);

    const mediaEls = Array.from(document.querySelectorAll('[data-cursor="media"]'));
    mediaEls.forEach((el) => {
      el.addEventListener('mouseenter', onEnterMedia);
      el.addEventListener('mouseleave', onLeaveMedia);
    });

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
      mediaEls.forEach((el) => {
        el.removeEventListener('mouseenter', onEnterMedia);
        el.removeEventListener('mouseleave', onLeaveMedia);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="k-cursor-dot fixed top-0 left-0 z-[10000] pointer-events-none rounded-full"
        style={{ width: 8, height: 8, background: 'var(--katha-iron-bark)' }}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="k-cursor-ring fixed top-0 left-0 z-[9999] pointer-events-none rounded-full"
        style={{
          width: 40,
          height: 40,
          border: '1px solid var(--katha-iron-bark)',
          mixBlendMode: 'difference',
        }}
      />
      <style jsx global>{`
        @media (pointer: coarse) {
          .k-cursor-dot, .k-cursor-ring { display: none !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .k-cursor-dot, .k-cursor-ring { display: none !important; }
        }
        body[data-cursor-state='media'] .k-cursor-ring {
          width: 84px; height: 84px;
          border-color: var(--katha-pina-ecru);
          background: rgba(234, 226, 213, 0.12);
          mix-blend-mode: normal;
          transition: width .4s cubic-bezier(.16,1,.3,1), height .4s cubic-bezier(.16,1,.3,1);
        }
        body[data-cursor-state='media'] .k-cursor-dot { opacity: 0; }
        .k-cursor-ring::after {
          content: attr(data-label);
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          font-family: var(--font-mono); font-size: 9px; letter-spacing: .2em;
          color: var(--katha-pina-ecru); white-space: nowrap; opacity: 0;
          transition: opacity .3s ease;
        }
        body[data-cursor-state='media'] .k-cursor-ring::after { opacity: 1; }
      `}</style>
    </>
  );
}
