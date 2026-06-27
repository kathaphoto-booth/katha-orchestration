'use client';

import type { Tier } from '@/lib/tiers';

const N = { l2: '#3D352E', l3: '#4A4139', hi: '#ECE7DB', mut: '#AAA8A2', fnt: '#8F8C8A', loko: '#882D17', ln: 'rgba(236, 231, 219, 0.12)' };
const F = { d: "var(--font-fh-ronaldson-display), serif", b: "'Cormorant', serif", m: "'Courier Prime', monospace" };

type Props = {
  tier: Tier;
  selected: boolean;
  onSelect: () => void;
};

export function TierCard({ tier, selected, onSelect }: Props) {
  const accent = tier.booth === 'Oak' ? N.loko : N.fnt;
  return (
    <div
      className={`tier-card ${selected ? 'selected' : ''} ${tier.flagship ? 'tier-flag' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
      style={{
        position: 'relative', background: N.l2, border: `1px solid ${N.ln}`, padding: '32px 36px',
        display: 'flex', flexDirection: 'column', gap: 16,
        transition: 'transform .4s cubic-bezier(.16,1,.3,1), border-color .4s, background .4s',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
        <div>
          <div style={{ fontFamily: F.d, fontWeight: 300, fontSize: 30, color: N.hi, lineHeight: 1.05 }}>{tier.id}</div>
          <span style={{ fontFamily: F.m, fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: 10, display: 'inline-block', color: accent }}>
            {tier.booth === 'Oak' ? '◆ ' : ''}{tier.booth} Booth · {tier.formats}
          </span>
        </div>
        <div style={{ fontFamily: F.d, fontWeight: 300, fontSize: 34, color: N.hi, whiteSpace: 'nowrap', lineHeight: 1 }}>
          ${tier.price.toLocaleString()}
        </div>
      </div>
      <p style={{ fontFamily: F.b, fontStyle: 'italic', fontSize: 19, lineHeight: 1.55, paddingBottom: '4px', color: N.mut, maxWidth: '42ch' }}>
        {tier.blurb}
      </p>
      <span className="tier-cta">{selected ? 'Selected' : 'Select Package'}</span>
    </div>
  );
}
