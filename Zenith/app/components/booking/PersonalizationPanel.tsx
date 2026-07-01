'use client';

import { useState } from 'react';
import { AvailabilityCalendar } from '../AvailabilityCalendar';
import { ServiceTierCards } from './ServiceTierCards';
import type { PhotoboothPreset } from '@/lib/templates';

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
  b: "'Cormorant', serif",
  m: "'Courier Prime', monospace"
};

type Props = {
  selectedTier: string | null;
  selectedTemplate: PhotoboothPreset | null;
  selectedDate: string | null;
  notes: string;
  blockedDates: string[];
  onSetTier: (tier: string) => void;
  onSetDate: (date: string | null) => void;
  onSetNotes: (notes: string) => void;
  onNextStep: () => void;
};

export function PersonalizationPanel({
  selectedTier,
  selectedTemplate,
  selectedDate,
  notes,
  blockedDates,
  onSetTier,
  onSetDate,
  onSetNotes,
  onNextStep
}: Props) {
  const [subStep, setSubStep] = useState<'selection' | 'date' | 'notes'>('selection');

  return (
    <div style={{ width: '100%' }}>
      {subStep === 'selection' && (
        <>
          <h2 style={{ fontFamily: F.d, fontSize: 36, fontWeight: 300, color: N.hi, marginBottom: 8 }}>Your Selection</h2>
          <p style={{ fontFamily: F.b, fontSize: 18, fontStyle: 'italic', color: N.mut, marginBottom: 32 }}>Confirm your package and design choices.</p>

          <dl style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 32 }}>
            <div>
              <dt style={{ fontFamily: F.m, fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: N.fnt, marginBottom: 8 }}>Selected Design</dt>
              <dd style={{ fontFamily: F.d, fontSize: 24, color: N.hi, margin: 0 }}>{selectedTemplate?.name ?? '—'}</dd>
            </div>
            
            <div>
              <dt style={{ fontFamily: F.m, fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: N.fnt, marginBottom: 12 }}>Service Tier Package</dt>
              <dd style={{ margin: 0 }}>
                <ServiceTierCards selectedId={selectedTier} onSelect={onSetTier} />
              </dd>
            </div>
          </dl>

          <button
            onClick={() => setSubStep('date')}
            disabled={!selectedTier}
            style={{
              width: '100%',
              padding: 16,
              background: selectedTier ? N.loko : 'transparent',
              color: selectedTier ? N.hi : N.fnt,
              border: `1px solid ${selectedTier ? N.loko : N.ln}`,
              fontFamily: F.m,
              fontSize: 10.5,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              cursor: selectedTier ? 'pointer' : 'not-allowed',
              transition: 'background 0.3s, color 0.3s'
            }}
          >
            Continue to Date →
          </button>
        </>
      )}

      {subStep === 'date' && (
        <>
          <h2 style={{ fontFamily: F.d, fontSize: 36, fontWeight: 300, color: N.hi, marginBottom: 8 }}>Reserve Your Date</h2>
          <p style={{ fontFamily: F.b, fontSize: 18, fontStyle: 'italic', color: N.mut, marginBottom: 32 }}>Struck dates are booked or blocked.</p>
          
          <AvailabilityCalendar
            blockedDates={blockedDates}
            value={selectedDate}
            onChange={onSetDate}
          />

          <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
            <button
              onClick={() => setSubStep('selection')}
              style={{
                flex: 1,
                padding: 16,
                background: 'transparent',
                color: N.mut,
                border: `1px solid ${N.ln}`,
                fontFamily: F.m,
                fontSize: 10.5,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              ← Back
            </button>
            <button
              onClick={() => setSubStep('notes')}
              disabled={!selectedDate}
              style={{
                flex: 2,
                padding: 16,
                background: selectedDate ? N.loko : 'transparent',
                color: selectedDate ? N.hi : N.fnt,
                border: `1px solid ${selectedDate ? N.loko : N.ln}`,
                fontFamily: F.m,
                fontSize: 10.5,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                cursor: selectedDate ? 'pointer' : 'not-allowed'
              }}
            >
              Continue →
            </button>
          </div>
        </>
      )}

      {subStep === 'notes' && (
        <>
          <h2 style={{ fontFamily: F.d, fontSize: 36, fontWeight: 300, color: N.hi, marginBottom: 8 }}>One Last Thing</h2>
          <p style={{ fontFamily: F.b, fontSize: 18, fontStyle: 'italic', color: N.mut, marginBottom: 32 }}>Anything we should know about the event?</p>
          
          <textarea
            value={notes}
            onChange={(e) => onSetNotes(e.target.value)}
            placeholder="Tell us about the venue, timeline, or any special requests (Optional)"
            style={{
              width: '100%',
              minHeight: 140,
              background: N.l1,
              border: `1px solid ${N.ln}`,
              color: N.hi,
              padding: 16,
              fontFamily: F.m,
              fontSize: 13,
              resize: 'vertical',
              outline: 'none',
              marginBottom: 32
            }}
          />

          <div style={{ display: 'flex', gap: 16 }}>
            <button
              onClick={() => setSubStep('date')}
              style={{
                flex: 1,
                padding: 16,
                background: 'transparent',
                color: N.mut,
                border: `1px solid ${N.ln}`,
                fontFamily: F.m,
                fontSize: 10.5,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              ← Back
            </button>
            <button
              onClick={onNextStep}
              style={{
                flex: 2,
                padding: 16,
                background: N.loko,
                color: N.hi,
                border: `1px solid ${N.loko}`,
                fontFamily: F.m,
                fontSize: 10.5,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              Review Order →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
