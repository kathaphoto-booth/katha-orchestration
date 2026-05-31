'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';

export function WoodGrainEmboss() {
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();

  // Handle client-side mount cleanly to avoid server hydration drift
  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  // Dual-rate parallax scroll on the shadow overlay to create physical depth
  const backgroundY = useTransform(scrollY, [0, 4000], [0, -180]);

  if (!mounted) return null;

  return (
    <div 
      className="fixed inset-0 w-full h-[130vh] -top-[15vh] pointer-events-none z-0 overflow-hidden select-none bg-katha-pina-ecru"
      aria-hidden="true"
    >
      {/* 1. TEXTURED PAPER/WOOD FIBER UNDERLAY 
          Rich organic unbleached fiber feel to create the warm, unbleached papyrus base
      */}
      <div 
        className="absolute inset-0 opacity-[0.24] mix-blend-multiply"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 20%, rgba(44, 46, 48, 0.03) 0%, transparent 80%),
            radial-gradient(circle at 90% 80%, rgba(44, 46, 48, 0.02) 0%, transparent 80%)
          `
        }}
      />

      {/* 2. SUBTLE PROCEDURAL FIBERS (WABI-SABI DETAIL) */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06] mix-blend-multiply z-[1]">
        <defs>
          <filter id="papyrus-fibers">
            <feTurbulence type="fractalNoise" baseFrequency="0.04 0.01" numOctaves="4" result="noise" />
            <feColorMatrix type="matrix" values="
              0.15 0 0 0 0.10
              0 0.12 0 0 0.06
              0 0 0.08 0 0.03
              0 0 0 0.15 0" in="noise" />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#papyrus-fibers)" />
      </svg>

      {/* 3. CORE BACKGROUND PATINA FILTER
          Replaces the broken remote GIF with an inline fractalNoise generator.
      */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 w-full h-full opacity-[0.12] mix-blend-multiply z-[2]"
      >
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <filter id="patina-noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
              <feColorMatrix type="matrix" values="
                0 0 0 0 0
                0 0 0 0 0
                0 0 0 0 0
                0 0 0 0.25 0" in="noise" />
            </filter>
          </defs>
          <rect width="100%" height="100%" filter="url(#patina-noise)" />
        </svg>
      </motion.div>

      {/* Additional ambient lens vignette */}
      <div 
        className="absolute inset-0 z-[3] mix-blend-multiply pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, transparent 30%, rgba(44, 46, 48, 0.04) 100%)"
        }}
      />
    </div>
  );
}

