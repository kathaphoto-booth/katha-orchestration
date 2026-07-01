'use client';

import { KathaWordmark } from '../KathaWordmark';

const N = {
  l0: '#111112', // Obsidian Weave ground
  l1: '#1A1816', // Knalum Ink
  hi: '#ECE7DB',
  mut: '#AAA8A2',
  fnt: '#8F8C8A',
  loko: '#8C382A',
  ln: 'rgba(236, 231, 219, 0.12)'
};

const F = {
  d: 'var(--font-fh-ronaldson-display), serif',
  b: "'Cormorant', serif",
  m: "'Courier Prime', monospace"
};

type Props = {
  clientEmail: string;
  onReset?: () => void;
};

export function ConfirmationScreen({ clientEmail, onReset }: Props) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '80px 24px',
      background: N.l0,
      minHeight: '400px',
      textAlign: 'center',
      border: `1px solid ${N.ln}`
    }}>
      <div style={{ marginBottom: 32 }}>
        <KathaWordmark style={{ height: 28, width: 'auto', color: N.hi, margin: '0 auto' }} />
      </div>

      <p style={{ fontFamily: F.m, fontSize: 9.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: N.loko, marginBottom: 16 }}>
        // Status: Secured
      </p>

      <h2 style={{ fontFamily: F.d, fontSize: 44, fontWeight: 300, color: N.hi, lineHeight: 1.1, margin: '0 0 16px 0' }}>
        Date <em style={{ fontFamily: F.b, fontStyle: 'italic', color: N.mut }}>Reserved.</em>
      </h2>

      <div style={{ width: 64, height: 1, background: N.ln, margin: '16px auto 24px' }} />

      <p style={{ fontFamily: F.b, fontStyle: 'italic', fontSize: 18, color: N.mut, maxWidth: '44ch', margin: '0 0 32px 0', lineHeight: 1.5 }}>
        We have received your inquiry and sent a summary to <span style={{ color: N.hi, textDecoration: 'underline' }}>{clientEmail}</span>.<br />
        Expect our team to follow up within 24 hours to finalize details.
      </p>

      {onReset && (
        <button
          onClick={onReset}
          style={{
            fontFamily: F.m,
            fontSize: 9,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: N.mut,
            background: 'transparent',
            border: `1px solid ${N.ln}`,
            padding: '12px 24px',
            cursor: 'pointer',
            transition: 'color 0.3s, border-color 0.3s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = N.hi; e.currentTarget.style.borderColor = N.hi; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = N.mut; e.currentTarget.style.borderColor = N.ln; }}
        >
          View Collection Again
        </button>
      )}
    </div>
  );
}
