'use client';

import { Print, Tag } from './PrintCard';
import { VIEWBOX } from '@/lib/layouts';
import type { PhotoboothPreset } from '@/lib/templates';

const N = { l2: '#3D352E', hi: '#ECE7DB', fnt: '#8F8C8A', shadow: 'rgba(0,0,0,0.85)', glass: 'rgba(255,255,255,0.03)' };
const F = { d: 'var(--font-fh-ronaldson-display), serif', m: "'Courier Prime', monospace" };

type Props = {
  presets: PhotoboothPreset[];
  selectedFormat?: string;
  onSelect: (preset: PhotoboothPreset) => void;
};

export function PresetGrid({ presets, selectedFormat, onSelect }: Props) {
  const filtered = selectedFormat && selectedFormat !== 'all' 
    ? presets.filter(p => p.type === selectedFormat)
    : presets;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: 24, padding: '16px 0' }}>
      {filtered.map(t => {
        const style = t.name.includes('Signature') ? 'Signature' : 'Classic';
        const formatLabel = t.type === 'strip' ? '2×6 Strip' : (t.type === 'postcard-vertical' ? '4×6 Postcard' : '6×4 Landscape');
        const vb = VIEWBOX[t.type as keyof typeof VIEWBOX];
        const printHeight = vb.h > vb.w ? 240 : 160;
        
        return (
          <div
            key={t.id}
            onClick={() => onSelect(t)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(t); } }}
            style={{ cursor: 'pointer', transition: 'transform .6s cubic-bezier(.16,1,.3,1)' }}
          >
            <div style={{
              background: N.l2, borderTop: `1px solid ${N.glass}`,
              padding: '24px 20px 20px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
              boxShadow: `0 24px 60px ${N.shadow}`,
              height: '100%'
            }}>
              <Print t={t} height={printHeight} />
              <div style={{ textAlign: 'center', marginTop: 'auto' }}>
                <Tag style={style} />
                <h3 style={{ fontFamily: F.d, fontSize: 18, fontWeight: 300, color: N.hi, marginTop: 8, marginBottom: 4 }}>{t.name}</h3>
                <p style={{ fontFamily: F.m, fontSize: 8.5, letterSpacing: '0.1em', color: N.fnt }}>{formatLabel}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
