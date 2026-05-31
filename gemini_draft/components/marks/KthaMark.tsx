import { cn } from '@/lib/utils';

/**
 * KTHA Maker's Mark — the brass ring.
 * "Permission to leave the loom." (T'nalak tradition)
 *
 * A single continuous calado-stitch ligature enters K at bottom-left
 * and exits A at upper-right — the loom shuttle's full traverse.
 * Default: Hammered Sequin on Piña Ecru (tone-on-tone, sheer).
 * Sacred: Loko Rust on Piña Ecru (anniversary, founder contexts only).
 */
export function KthaMark({
  variant = 'default',
  caption = 'KTHA · woven',
  className,
}: {
  variant?: 'default' | 'sacred';
  caption?: string | null;
  className?: string;
}) {
  const letterColor =
    variant === 'sacred' ? 'var(--katha-loko-rust)' : 'var(--katha-hammered-sequin)';
  const stitchColor =
    variant === 'sacred' ? 'var(--katha-loko-rust)' : 'var(--katha-champagne-heirloom)';
  const captionColor = 'var(--katha-abel-slate)';

  return (
    <div className={cn('inline-flex flex-col items-center gap-2', className)}>
      {/*
        SVG viewBox: 120 × 44
        Four monospaced letter cells, each 28u wide with 4u gutter.
        Letters rendered as paths so the mark survives any font load state.
        Calado-stitch ligature: single dashed path, one continuous stroke,
        entering K at (4, 36) bottom-left → exiting A at (116, 8) upper-right.
      */}
      <svg
        viewBox="0 0 120 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="KTHA maker's mark"
        style={{ width: '6rem', height: 'auto' }}
      >
        {/* ── Calado-stitch ligature (single continuous path, drawn first as underlay) ── */}
        <path
          d="M 4,36 C 8,24 14,10 20,18 C 24,24 22,32 18,36
             C 28,38 34,30 40,20 C 44,12 46,8 50,10
             C 54,12 54,20 56,28 C 58,34 60,38 64,36
             C 68,28 70,14 74,10 C 76,6 76,10 74,20
             C 84,10 90,8 96,12 C 100,16 104,24 108,30
             C 112,34 116,16 116,8"
          stroke={stitchColor}
          strokeWidth="0.75"
          strokeDasharray="2 3"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* ── K ── */}
        {/* Vertical stem */}
        <line x1="6" y1="8" x2="6" y2="36" stroke={letterColor} strokeWidth="1.5" strokeLinecap="square" />
        {/* Upper diagonal */}
        <line x1="6" y1="22" x2="18" y2="8" stroke={letterColor} strokeWidth="1.5" strokeLinecap="square" />
        {/* Lower diagonal */}
        <line x1="6" y1="22" x2="18" y2="36" stroke={letterColor} strokeWidth="1.5" strokeLinecap="square" />

        {/* ── T ── */}
        {/* Crossbar — deliberately heavier (Fukinsei: the one weighted terminal) */}
        <line x1="32" y1="8" x2="48" y2="8" stroke={letterColor} strokeWidth="2" strokeLinecap="square" />
        {/* Vertical */}
        <line x1="40" y1="8" x2="40" y2="36" stroke={letterColor} strokeWidth="1.5" strokeLinecap="square" />

        {/* ── H ── */}
        {/* Left stem */}
        <line x1="56" y1="8" x2="56" y2="36" stroke={letterColor} strokeWidth="1.5" strokeLinecap="square" />
        {/* Crossbar */}
        <line x1="56" y1="22" x2="72" y2="22" stroke={letterColor} strokeWidth="1.5" strokeLinecap="square" />
        {/* Right stem */}
        <line x1="72" y1="8" x2="72" y2="36" stroke={letterColor} strokeWidth="1.5" strokeLinecap="square" />

        {/* ── A ── */}
        {/* Left diagonal */}
        <line x1="84" y1="36" x2="98" y2="8" stroke={letterColor} strokeWidth="1.5" strokeLinecap="square" />
        {/* Right diagonal */}
        <line x1="98" y1="8" x2="112" y2="36" stroke={letterColor} strokeWidth="1.5" strokeLinecap="square" />
        {/* Crossbar */}
        <line x1="88" y1="26" x2="108" y2="26" stroke={letterColor} strokeWidth="1.5" strokeLinecap="square" />
      </svg>

      {/* Companion metadata line — always present unless explicitly nulled */}
      {caption !== null && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            letterSpacing: '0.04em',
            color: captionColor,
            textTransform: 'uppercase',
          }}
        >
          {caption}
        </span>
      )}
    </div>
  );
}
