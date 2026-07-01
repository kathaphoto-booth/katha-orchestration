'use client';

import type { Tier } from '@/lib/tiers';
import { TIERS } from '@/lib/tiers';

const N = {
  l2: '#3D352E',
  hi: '#ECE7DB',
  mut: '#AAA8A2',
  fnt: '#8F8C8A',
  loko: '#8C382A',
  ln: 'rgba(236, 231, 219, 0.12)',
  safeText: '#5A564E'
};

const F = {
  d: 'var(--font-fh-ronaldson-display), serif',
  b: "'Cormorant', serif",
  m: "'Courier Prime', monospace"
};

type Props = {
  selectedId: string | null;
  onSelect: (tierId: string) => void;
};

export function ServiceTierCards({ selectedId, onSelect }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, width: '100%' }}>
      {TIERS.map((t) => {
        const selected = selectedId === t.id;
        const accentColor = t.booth === 'Oak' ? N.loko : N.fnt;
        return (
          <div
            key={t.id}
            onClick={() => onSelect(t.id)}
            role="button"
            tabIndex={0}
            aria-pressed={selected}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(t.id);
              }
            }}
            style={{
              position: 'relative',
              background: selected ? N.l2 : 'rgba(236, 231, 219, 0.03)',
              border: `1px solid ${selected ? N.loko : N.ln}`,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s, background 0.4s',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ fontFamily: F.d, fontWeight: 300, fontSize: 22, color: N.hi, margin: 0 }}>{t.id}</h4>
                <span style={{ fontFamily: F.m, fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4, display: 'inline-block', color: accentColor }}>
                  {t.booth === 'Oak' ? '◆ ' : ''}{t.booth} · {t.formats}
                </span>
              </div>
              <div style={{ fontFamily: F.d, fontWeight: 300, fontSize: 24, color: N.hi, whiteSpace: 'nowrap' }}>
                ${t.price.toLocaleString()}
              </div>
            </div>
            <p style={{ fontFamily: F.b, fontStyle: 'italic', fontSize: 15, lineHeight: 1.45, color: N.mut, margin: 0, paddingBottom: 12 }}>
              {t.blurb}
            </p>
            <span style={{ fontFamily: F.m, fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: selected ? N.loko : N.fnt, marginTop: 'auto' }}>
              {selected ? '✓ Selected' : 'Select Package'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
