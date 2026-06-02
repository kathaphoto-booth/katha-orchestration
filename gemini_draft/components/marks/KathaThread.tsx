'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useScroll, motion, useSpring, useTransform, useMotionValueEvent } from 'motion/react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from 'motion/react';

/**
 * KTHA Brass-Ring mark path — the four letters K-T-H-A connected
 * by a single calado-stitch ligature. Positioned at the bottom
 * of the SVG thread as the closing stroke.
 *
 * "Permission to leave the loom."
 */
const KTHA_MARK_PATH =
  'M 40,0 L 40,12 M 40,6 L 46,0 M 40,6 L 46,12 ' +  // K
  'M 50,0 L 56,0 M 53,0 L 53,12 ' +                    // T
  'M 60,0 L 60,12 M 60,6 L 66,6 M 66,0 L 66,12 ' +    // H
  'M 70,12 L 73,0 L 76,12 M 71.5,8 L 74.5,8';          // A

/**
 * KathaThread — Continuous SVG thread navigation.
 *
 * A single Piña Ecru line shuttles the user down each page,
 * mimicking a loom shuttle or a calado needle. Tied to scroll position:
 *   O(s) = L · (1 − Φ(s))
 * where L = path.getTotalLength() and Φ is normalized scroll progress.
 *
 * The KTHA mark draws as the final stroke at page-end (last 8% of scroll),
 * fulfilling the "brass ring — permission to leave the loom" ritual.
 *
 * A11y: announces "Katha maker's mark — complete" via sr-only status
 * when the brass ring finishes drawing.
 */
export function KathaThread({ className }: { className?: string }) {
  const pathRef = useRef<SVGPathElement>(null);
  const kthaPathRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [kthaPathLength, setKthaPathLength] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const { scrollYProgress } = useScroll();
  const shouldReduceMotion = useReducedMotion();

  // Smooth out the scroll progress with loom-like damping
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Measure path lengths, re-measure on resize
  const measurePaths = useCallback(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
    if (kthaPathRef.current) {
      setKthaPathLength(kthaPathRef.current.getTotalLength());
    }
  }, []);

  useEffect(() => {
    measurePaths();

    // Re-measure on layout shifts
    const observer = new ResizeObserver(measurePaths);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [measurePaths]);

  // Track when the brass ring completes (play once per page visit)
  useMotionValueEvent(smoothProgress, 'change', (latest) => {
    if (latest >= 0.95 && !hasPlayedOnce) {
      setIsComplete(true);
      setHasPlayedOnce(true);
    }
  });

  // Main thread: O(s) = L · (1 − Φ(s))
  const strokeDashoffset = useTransform(smoothProgress, [0, 1], [pathLength, 0]);

  // Brass-ring: draws during the last 8% of scroll
  const kthaOpacity = useTransform(smoothProgress, [0.92, 1], [0, 1]);
  const kthaStrokeDashoffset = useTransform(
    smoothProgress,
    [0.92, 1],
    [kthaPathLength, 0]
  );

  return (
    <div
      ref={containerRef}
      className={cn('pointer-events-none absolute inset-0 z-0 overflow-hidden', className)}
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 100 2400"
      >
        {/* Main thread path — the loom shuttle */}
        <motion.path
          ref={pathRef}
          className="k-thread-animate"
          d="M 10,0 C 20,200 90,300 85,500 S 15,700 10,900 S 90,1100 85,1300 S 15,1500 10,1700 S 90,1900 85,2100 S 50,2300 50,2400"
          stroke="var(--katha-pina-ecru)"
          strokeWidth="1"
          fill="none"
          strokeDasharray={pathLength}
          style={{
            strokeDashoffset: shouldReduceMotion ? 0 : strokeDashoffset,
          }}
          vectorEffect="non-scaling-stroke"
        />

        {/* KTHA Brass-Ring closing stroke */}
        <motion.g
          style={{ opacity: shouldReduceMotion ? 1 : kthaOpacity }}
          transform="translate(12, 2360)"
        >
          <motion.path
            ref={kthaPathRef}
            className="k-thread-animate"
            d={KTHA_MARK_PATH}
            stroke="var(--katha-pina-ecru)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={kthaPathLength}
            style={{
              strokeDashoffset: shouldReduceMotion ? 0 : kthaStrokeDashoffset,
            }}
            vectorEffect="non-scaling-stroke"
          />
        </motion.g>
      </svg>

      {/* A11y: announce completion of the brass ring */}
      {isComplete && (
        <span className="sr-only" role="status" aria-live="polite">
          Katha maker&apos;s mark — complete
        </span>
      )}
    </div>
  );
}
