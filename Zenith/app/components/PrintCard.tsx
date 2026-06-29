'use client';

import { resolveLayout, VIEWBOX } from '@/lib/layouts';

const F = { m: "'Courier Prime', monospace" };

export function Print({ t, height = 200 }: { t: any; height?: number }) {
  const vb = VIEWBOX[t.type as keyof typeof VIEWBOX];
  const layout = resolveLayout(t.layoutId, t.type);
  const H = height, W = Math.round(H * vb.w / vb.h);
  const scale = H / vb.h;
  return (
    <div className="pw" style={{ width: W, height: H, flexShrink: 0, background: t.backgroundColor, position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 4px 12px rgba(0,0,0,0.4)', transition: 'box-shadow .45s cubic-bezier(.16,1,.3,1)' }}>
      {layout.slots.map((s: any, i: number) => (
        <div key={i} style={{ position: 'absolute', left: s.x * scale, top: s.y * scale, width: s.w * scale, height: s.h * scale, background: t.slotBgColor, outline: t.slotBorderWidth !== '0px' ? `1px solid ${t.borderColor}` : 'none', outlineOffset: '-1px', borderRadius: parseFloat(t.slotBorderRadius) * scale }} />
      ))}
      <div style={{ position: 'absolute', left: layout.textZone.x * scale, top: layout.textZone.y * scale, width: layout.textZone.w * scale, height: layout.textZone.h * scale, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <p style={{ fontFamily: t.fontFamily, fontSize: 80 * scale, color: t.textColor, letterSpacing: '0.12em', marginBottom: 20 * scale }}>{t.titleText}</p>
        {t.subTitleText && <p style={{ fontFamily: F.m, fontSize: 35 * scale, color: t.secondaryColor, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{t.subTitleText}</p>}
      </div>
    </div>
  );
}

export function Tag({ style }: { style: string }) {
  const N = { loko: '#882D17', mut: '#AAA8A2' };
  return <span style={{ fontFamily: F.m, fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: style === 'Signature' ? N.loko : N.mut }}>{style === 'Signature' ? '◆ Signature' : 'Classic'}</span>;
}
