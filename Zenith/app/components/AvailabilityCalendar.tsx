'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buildMonthGrid, formatISO, isBlocked, isInRange } from '@/lib/calendar-logic';

const N = { hi: '#ECE7DB', mut: '#AAA8A2', fnt: '#8F8C8A', loko: '#882D17', ln: 'rgba(236, 231, 219, 0.12)', l2: '#3D352E' };
const F = { d: "var(--font-fh-ronaldson-display), serif", m: "'Courier Prime', monospace" };
const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type Props = {
  blockedDates: string[];
  value: string | null;
  onChange: (date: string | null) => void;
  minDate?: string;
  maxDate?: string;
};

export function AvailabilityCalendar({ blockedDates, value, onChange, minDate, maxDate }: Props) {
  const today = new Date();
  const defaultMin = formatISO(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 30)));
  const defaultMax = formatISO(new Date(Date.UTC(today.getUTCFullYear() + 1, today.getUTCMonth() + 6, today.getUTCDate())));
  const min = minDate ?? defaultMin;
  const max = maxDate ?? defaultMax;

  const [view, setView] = useState(() => {
    const seed = value ? new Date(value + 'T00:00:00Z') : new Date(min + 'T00:00:00Z');
    return { year: seed.getUTCFullYear(), month: seed.getUTCMonth() };
  });

  const grid = useMemo(() => buildMonthGrid(view.year, view.month), [view]);
  const monthLabel = new Date(Date.UTC(view.year, view.month, 1))
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

  const step = (delta: number) => {
    const d = new Date(Date.UTC(view.year, view.month + delta, 1));
    setView({ year: d.getUTCFullYear(), month: d.getUTCMonth() });
  };

  return (
    <div role="group" aria-label={`Availability calendar, ${monthLabel}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button onClick={() => step(-1)} aria-label="Previous month"
          style={{ background: 'transparent', border: 'none', color: N.mut, padding: 8, cursor: 'pointer' }}>
          <ChevronLeft size={18} />
        </button>
        <span style={{ fontFamily: F.d, fontSize: 22, color: N.hi }}>{monthLabel}</span>
        <button onClick={() => step(1)} aria-label="Next month"
          style={{ background: 'transparent', border: 'none', color: N.mut, padding: 8, cursor: 'pointer' }}>
          <ChevronRight size={18} />
        </button>
      </div>

      <div role="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {DOW.map((d, i) => (
          <div key={i} style={{ fontFamily: F.m, fontSize: 9, letterSpacing: '0.14em', color: N.fnt, textAlign: 'center', padding: '8px 0' }}>{d}</div>
        ))}
        {grid.map((d, i) => {
          const iso = formatISO(d);
          const inMonth = d.getUTCMonth() === view.month;
          const blocked = isBlocked(iso, blockedDates);
          const outOfRange = !isInRange(iso, min, max);
          const disabled = blocked || outOfRange || !inMonth;
          const selected = value === iso;
          return (
            <button
              key={i}
              role="gridcell"
              aria-pressed={selected}
              aria-disabled={disabled}
              disabled={disabled}
              onClick={() => !disabled && onChange(iso)}
              style={{
                background: selected ? N.loko : 'transparent',
                color: selected ? N.hi : disabled ? N.fnt : N.mut,
                border: `1px solid ${selected ? N.loko : N.ln}`,
                padding: '12px 0',
                fontFamily: F.m, fontSize: 12,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: !inMonth ? 0.25 : blocked || outOfRange ? 0.4 : 1,
                textDecoration: blocked ? 'line-through' : 'none',
                transition: 'background 0.2s',
              }}
            >
              {d.getUTCDate()}
            </button>
          );
        })}
      </div>
      {value && (
        <div style={{ marginTop: 16, fontFamily: F.m, fontSize: 10, letterSpacing: '0.14em', color: N.mut }}>
          Selected: {value}
          <button onClick={() => onChange(null)} style={{ marginLeft: 12, color: N.loko, background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            clear
          </button>
        </div>
      )}
    </div>
  );
}
