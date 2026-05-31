'use client';

import { useEffect, useRef, useState } from 'react';
import { useScroll, motion, useSpring, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from 'motion/react';

export function KathaThread({ className }: { className?: string }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const { scrollYProgress } = useScroll();
  const shouldReduceMotion = useReducedMotion();

  // Smooth out the scroll progress slightly
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  // O(s) = L · (1 - Φ(s))
  const strokeDashoffset = useTransform(smoothProgress, [0, 1], [pathLength, 0]);

  return (
    <div className={cn("pointer-events-none absolute inset-0 z-0 overflow-hidden", className)}>
      <svg 
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <motion.path
          ref={pathRef}
          d="M 10,0 C 20,200 80,400 90,600 S 10,800 20,1000 S 80,1200 90,1400 S 10,1600 20,1800 S 80,2000 90,2200"
          stroke="var(--katha-pina-ecru)"
          strokeWidth="1"
          fill="none"
          strokeDasharray={pathLength}
          style={{ 
            strokeDashoffset: shouldReduceMotion ? 0 : strokeDashoffset 
          }}
          vectorEffect="non-scaling-stroke"
        />
        {/* We would place the final segment matching the KTHA mark here if needed */}
      </svg>
    </div>
  );
}
