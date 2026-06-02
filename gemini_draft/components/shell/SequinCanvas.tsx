'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────
 * Types
 * ───────────────────────────────────────────── */
interface Particle {
  /** Current position */
  x: number;
  y: number;
  /** Anchor (rest) position on the jittered grid */
  ax: number;
  ay: number;
  /** Velocity */
  vx: number;
  vy: number;
  /** Visual radius 1.5–3 px */
  r: number;
  /** Random phase offset for sinusoidal glint */
  phase: number;
}

interface SequinCanvasProps {
  className?: string;
}

/* ─────────────────────────────────────────────
 * Constants — physics model
 * ───────────────────────────────────────────── */
const SPRING_K = 0.02;
const REPULSE_C = 800;
const REPULSE_RADIUS = 120;
const DAMPING = 0.92;
const FILL_COLOR = '#C4B59D'; // --katha-champagne-heirloom fallback
const DESKTOP_COUNT = 200;
const MOBILE_COUNT = 80;
const BREAKPOINT = 768;
const SLOW_FRAME_THRESHOLD_MS = 20;
const SLOW_FRAME_BUDGET = 10;

/* ─────────────────────────────────────────────
 * Helpers
 * ───────────────────────────────────────────── */

/** Resolve the CSS variable at runtime, falling back to the hardcoded value. */
function resolveFillColor(): string {
  if (typeof document === 'undefined') return FILL_COLOR;
  const val = getComputedStyle(document.documentElement)
    .getPropertyValue('--katha-champagne-heirloom')
    .trim();
  return val || FILL_COLOR;
}

/** Build a jittered grid of particles that fills `w × h`. */
function createParticles(w: number, h: number, count: number): Particle[] {
  const cols = Math.round(Math.sqrt(count * (w / h)));
  const rows = Math.max(1, Math.round(count / Math.max(cols, 1)));
  const cellW = w / Math.max(cols, 1);
  const cellH = h / Math.max(rows, 1);

  const particles: Particle[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ax = cellW * (c + 0.5) + (Math.random() - 0.5) * cellW * 0.6;
      const ay = cellH * (r + 0.5) + (Math.random() - 0.5) * cellH * 0.6;
      particles.push({
        x: ax,
        y: ay,
        ax,
        ay,
        vx: 0,
        vy: 0,
        r: 1.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }
  return particles;
}

/* ─────────────────────────────────────────────
 * Component
 * ───────────────────────────────────────────── */
export function SequinCanvas({ className }: SequinCanvasProps) {
  const shouldReduceMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Return null for reduced-motion users — pure decoration.
  if (shouldReduceMotion) return null;

  /* eslint-disable react-hooks/rules-of-hooks --
     The early return above is stable (hook value never changes mid-session)
     so the hooks below are called in a consistent order. */

  // biome-ignore lint: hooks order is stable
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    /* ── State ────────────────────────────── */
    let w = container.offsetWidth;
    let h = container.offsetHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles = createParticles(
      w,
      h,
      w > BREAKPOINT ? DESKTOP_COUNT : MOBILE_COUNT,
    );
    let color = resolveFillColor();
    let cursorX = -9999;
    let cursorY = -9999;
    let rafId = 0;
    let slowFrames = 0;
    let hasHalved = false;
    let lastFrameTime = performance.now();

    /* ── OffscreenCanvas (when available) ─── */
    let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null =
      null;

    const supportsOffscreen =
      typeof OffscreenCanvas !== 'undefined' &&
      typeof canvas.transferControlToOffscreen === 'function';

    if (supportsOffscreen) {
      try {
        const offscreen = canvas.transferControlToOffscreen();
        ctx = offscreen.getContext('2d');
      } catch {
        // Fallback — some browsers throw on double-transfer
        ctx = canvas.getContext('2d');
      }
    } else {
      ctx = canvas.getContext('2d');
    }

    if (!ctx) return;

    /* ── Resize handling ──────────────────── */
    function resize() {
      w = container!.offsetWidth;
      h = container!.offsetHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (!supportsOffscreen) {
        canvas!.width = w * dpr;
        canvas!.height = h * dpr;
      } else {
        // OffscreenCanvas dimensions are set differently —
        // we cannot resize after transfer, so we scale via context.
        // The canvas already took its size from the CSS 100%×100%.
      }

      // Re-seed particles for new dimensions
      particles = createParticles(
        w,
        h,
        w > BREAKPOINT ? DESKTOP_COUNT : MOBILE_COUNT,
      );
      slowFrames = 0;
      hasHalved = false;
    }

    // Initial sizing
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    /* ── Pointer tracking ─────────────────── */
    function onPointerMove(e: PointerEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      cursorX = e.clientX - rect.left;
      cursorY = e.clientY - rect.top;
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    /* ── Animation loop ───────────────────── */
    function tick(now: number) {
      const dt = now - lastFrameTime;
      lastFrameTime = now;

      /* ─ Performance guardrail ─ */
      if (dt > SLOW_FRAME_THRESHOLD_MS) {
        slowFrames++;
        if (slowFrames >= SLOW_FRAME_BUDGET && !hasHalved) {
          particles = particles.filter((_, i) => i % 2 === 0);
          hasHalved = true;
          slowFrames = 0;
        }
      } else {
        slowFrames = Math.max(0, slowFrames - 1);
      }

      if (!ctx) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      /* ─ Clear ─ */
      const cw = supportsOffscreen ? w : w * dpr;
      const ch = supportsOffscreen ? h : h * dpr;
      ctx.clearRect(0, 0, cw, ch);

      const scale = supportsOffscreen ? 1 : dpr;

      /* ─ Update & draw each particle ─ */
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Spring restoring force: F_spring = -k * (pos - anchor)
        const fsx = -SPRING_K * (p.x - p.ax);
        const fsy = -SPRING_K * (p.y - p.ay);

        // Cursor repulsion
        const dx = p.x - cursorX;
        const dy = p.y - cursorY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        let frx = 0;
        let fry = 0;
        if (dist < REPULSE_RADIUS) {
          const distCubed = dist * dist * dist;
          frx = (REPULSE_C * dx) / distCubed;
          fry = (REPULSE_C * dy) / distCubed;
        }

        // Integrate
        p.vx = (p.vx + fsx + frx) * DAMPING;
        p.vy = (p.vy + fsy + fry) * DAMPING;
        p.x += p.vx;
        p.y += p.vy;

        // Sinusoidal glint: alpha = 0.3 + 0.4 * sin(t * 0.003 + phase)
        const alpha = 0.3 + 0.4 * Math.sin(now * 0.003 + p.phase);

        // Draw
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x * scale, p.y * scale, p.r * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    /* ── Cleanup ──────────────────────────── */
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []); // Stable deps — nothing changes after mount

  return (
    <div
      ref={containerRef}
      className={cn('k-sequin-canvas', className)}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        willChange: 'transform',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
