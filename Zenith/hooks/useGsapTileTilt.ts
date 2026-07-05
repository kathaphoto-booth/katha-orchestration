'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export function useGsapTileTilt(maxRotation = 5) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = containerRef.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    // Only apply complex 3D tilts if prefers-reduced-motion is not set
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const onMouseMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left; // x coordinate within the element
        const y = e.clientY - rect.top;  // y coordinate within the element

        // Calculate percentage from center (-0.5 to 0.5)
        const xc = (x / rect.width) - 0.5;
        const yc = 0.5 - (y / rect.height); // Invert so mouse up tilts forward

        gsap.to(el, {
          rotationY: xc * maxRotation,
          rotationX: yc * maxRotation,
          transformPerspective: 1000,
          ease: 'power3.out',
          duration: 1.2,
          boxShadow: `
            ${-xc * 16}px ${yc * 16}px 48px rgba(0, 0, 0, 0.65),
            0 12px 30px rgba(0, 0, 0, 0.4)
          `
        });
      };

      const onMouseLeave = () => {
        gsap.to(el, {
          rotationY: 0,
          rotationX: 0,
          ease: 'power3.out',
          duration: 1.4,
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)'
        });
      };

      el.addEventListener('mousemove', onMouseMove);
      el.addEventListener('mouseleave', onMouseLeave);

      return () => {
        el.removeEventListener('mousemove', onMouseMove);
        el.removeEventListener('mouseleave', onMouseLeave);
      };
    });

    return () => {
      mm.revert();
    };
  }, { scope: containerRef });

  return containerRef;
}
