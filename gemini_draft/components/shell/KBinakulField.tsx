'use client';

import { useReducedMotion } from 'motion/react';

/**
 * KBinakulField — Global Wabi-Sabi patina overlay.
 *
 * Uses SVG feTurbulence fractalNoise (baseFrequency=0.65, numOctaves=3)
 * per DESIGN_SYSTEM_SKELETON.md §10 and BRAND_GENESIS_PLAN.md §V.
 *
 * Named after the Binakul weave — Ilocos mathematical optical illusion
 * designed to confuse malevolent spirits with whirlpools, wind, waves.
 *
 * Mounted once in layout.tsx. pointer-events-none.
 * Reduced-motion: freezes noise to a static seed (seed=1).
 */
export function KBinakulField() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none"
      style={{ opacity: 0.12, mixBlendMode: 'multiply' }}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <filter id="katha-patina">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves={3}
            seed={shouldReduceMotion ? 1 : undefined}
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#katha-patina)" />
      </svg>
    </div>
  );
}
