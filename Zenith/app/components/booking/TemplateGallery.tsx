'use client';

import { Print, Tag } from '../PrintCard';
import { VIEWBOX } from '@/lib/layouts';
import type { PhotoboothPreset } from '@/lib/templates';
import { useState } from 'react';

const N = {
  l0: '#161311',
  l1: '#211D1A',
  l2: '#3D352E',
  hi: '#ECE7DB',
  mut: '#AAA8A2',
  fnt: '#8F8C8A',
  loko: '#8C382A',
  ln: 'rgba(236, 231, 219, 0.12)'
};

const F = {
  d: 'var(--font-fh-ronaldson-display), serif',
  m: "'Courier Prime', monospace"
};

type Props = {
  presets: PhotoboothPreset[];
  onSelect: (preset: PhotoboothPreset) => void;
};

export function TemplateGallery({ presets, onSelect }: Props) {
  const [formatFilter, setFormatFilter] = useState<'all' | 'strip' | 'postcard' | 'postcard-vertical'>('all');
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const filtered = formatFilter !== 'all' 
    ? presets.filter(p => p.type === formatFilter)
    : presets;

  return (
    <div style={{ width: '100%' }}>
      {/* Styles for living slots slow pulse highlights */}
      <style>{`
        @keyframes livingPulse {
          0%, 100% {
            opacity: 1;
            filter: brightness(1);
          }
          50% {
            opacity: 0.8;
            filter: brightness(1.35) contrast(1.1);
          }
        }
        .living-card:hover .living-slot {
          animation: livingPulse 1.6s ease-in-out infinite;
        }
        .living-card:hover .living-slot-0 { animation-delay: 0s; }
        .living-card:hover .living-slot-1 { animation-delay: 0.2s; }
        .living-card:hover .living-slot-2 { animation-delay: 0.4s; }
        .living-card:hover .living-slot-3 { animation-delay: 0.6s; }
      `}</style>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <p style={{ fontFamily: F.m, fontSize: 9.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: N.loko, marginBottom: 8 }}>Gallery Collection</p>
          <h2 style={{ fontFamily: F.d, fontSize: 32, fontWeight: 300, color: N.hi, margin: 0 }}>Select your template design</h2>
        </div>
        
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
          {[
            { id: 'all', label: 'All Formats' },
            { id: 'strip', label: 'Strip' },
            { id: 'postcard', label: 'Postcard' },
            { id: 'postcard-vertical', label: 'Postcard Vertical' }
          ].map(f => {
            const active = formatFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFormatFilter(f.id as any)}
                style={{
                  fontFamily: F.m, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: active ? N.hi : N.fnt, background: 'transparent', border: 'none',
                  borderBottom: active ? `1px solid ${N.loko}` : '1px solid transparent',
                  padding: '0 0 4px 0', cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'color 0.3s, border-color 0.3s'
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsive symmetric grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ gap: 24 }}>
        {filtered.map(t => {
          const style = t.name.includes('Signature') ? 'Signature' : 'Classic';
          const formatLabel = t.type === 'strip' ? '2×6 Strip' : (t.type === 'postcard-vertical' ? '4×6 Postcard' : '6×4 Landscape');
          const vb = VIEWBOX[t.type as keyof typeof VIEWBOX];
          const printHeight = vb.h > vb.w ? 220 : 140;
          
          return (
            <div
              key={t.id}
              className="living-card"
              onClick={() => onSelect(t)}
              onMouseEnter={() => setHoveredCardId(t.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(t); } }}
              style={{
                cursor: 'pointer',
                background: N.l1,
                border: `1px solid ${hoveredCardId === t.id ? N.loko : N.ln}`,
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 20,
                transition: 'border-color .4s cubic-bezier(.16,1,.3,1), transform .4s cubic-bezier(.16,1,.3,1)',
                transform: hoveredCardId === t.id ? 'translateY(-2px)' : 'none'
              }}
            >
              {/* Specialized rendering of print with living slots class names */}
              <div className="pw" style={{ width: Math.round(printHeight * vb.w / vb.h), height: printHeight, flexShrink: 0, background: t.backgroundColor, position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', transition: 'box-shadow .45s' }}>
                {/* Simulated slots with staggered delays */}
                {Array.from({ length: t.layoutId ? 3 : 1 }).map((_, i) => (
                  <div
                    key={i}
                    className={`living-slot living-slot-${i}`}
                    style={{
                      position: 'absolute',
                      left: `${15 + i * 25}%`,
                      top: '15%',
                      width: '20%',
                      height: '50%',
                      background: t.slotBgColor || '#EAE2D5',
                      border: `1px solid ${t.borderColor || '#333'}`,
                      borderRadius: '2px',
                      transition: 'filter 0.3s'
                    }}
                  />
                ))}
                {/* Fallback to original layout style info */}
                <div style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: '30%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontFamily: t.fontFamily || F.d, fontSize: 10, color: t.textColor || '#111', margin: 0 }}>{t.titleText}</p>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: 'auto' }}>
                <Tag style={style} />
                <h3 style={{ fontFamily: F.d, fontSize: 18, fontWeight: 300, color: N.hi, marginTop: 8, marginBottom: 4 }}>{t.name}</h3>
                <p style={{ fontFamily: F.m, fontSize: 8.5, letterSpacing: '0.1em', color: N.fnt, margin: 0 }}>{formatLabel}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
