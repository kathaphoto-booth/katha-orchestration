'use client';

import { useReducer, useState } from 'react';
import { KathaWordmark } from '@/app/components/KathaWordmark';
import { ZDrawer } from '@/app/components/ZDrawer';
import { TierCard } from '@/app/components/TierCard';
import { FeaturedTemplateRow } from '@/app/components/FeaturedTemplateRow';
import { AvailabilityCalendar } from '@/app/components/AvailabilityCalendar';
import { TIERS } from '@/lib/tiers';
import type { PhotoboothPreset } from '@/lib/templates';
import { finalizeBooking, type Lead } from './actions';

const N = { l0: '#161311', l1: '#211D1A', l2: '#3D352E', hi: '#ECE7DB', mut: '#AAA8A2', fnt: '#8F8C8A', loko: '#882D17', ln: 'rgba(236, 231, 219, 0.12)' };
const F = { d: 'var(--font-fh-ronaldson-display), serif', b: "'Cormorant', serif", m: "'Courier Prime', monospace" };

type Step = 'summary' | 'date' | 'notes' | 'success';
type State = {
  step: Step;
  tier: string | null;
  template: PhotoboothPreset | null;
  date: string | null;
  notes: string;
};
type Action =
  | { type: 'set-tier'; value: string }
  | { type: 'set-template'; value: PhotoboothPreset }
  | { type: 'set-date'; value: string | null }
  | { type: 'set-notes'; value: string }
  | { type: 'goto'; value: Step }
  | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'set-tier':     return { ...state, tier: action.value };
    case 'set-template': return { ...state, template: action.value };
    case 'set-date':     return { ...state, date: action.value };
    case 'set-notes':    return { ...state, notes: action.value };
    case 'goto':         return { ...state, step: action.value };
    case 'reset':        return { step: 'summary', tier: null, template: null, date: null, notes: '' };
  }
}

type Props = {
  lead: Lead;
  featured: PhotoboothPreset[];
  blockedDates: string[];
};

export function PortalClient({ lead, featured, blockedDates }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [state, dispatch] = useReducer(reducer, {
    step: 'summary',
    tier: null,
    template: null,
    date: null,
    notes: '',
  });

  const closeDrawer = () => { setDrawerOpen(false); setTimeout(() => dispatch({ type: 'goto', value: 'summary' }), 600); };

  const openWithTier = (tier: string) => { dispatch({ type: 'set-tier', value: tier }); setDrawerOpen(true); };
  const openWithTemplate = (preset: PhotoboothPreset) => { dispatch({ type: 'set-template', value: preset }); setDrawerOpen(true); };

  const submit = async () => {
    if (!state.date) return;
    setSubmitting(true);
    setSubmitError(null);
    const res = await finalizeBooking(lead.id, {
      final_template_id: state.template?.id ?? null,
      final_date: state.date,
      notes: state.notes || undefined,
    });
    setSubmitting(false);
    if (res.success) dispatch({ type: 'goto', value: 'success' });
    else setSubmitError(res.error ?? 'Something went wrong — please try again.');
  };

  return (
    <div style={{ minHeight: '100dvh', background: N.l0, color: N.hi }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 200, padding: '24px clamp(20px, 5vw, 32px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(22, 19, 17, 0.85)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${N.ln}` }}>
        <KathaWordmark style={{ height: 26, width: 'auto', color: N.hi }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <span style={{ fontFamily: F.m, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: N.fnt }}>
            Inquiry #{lead.id.slice(-6).toUpperCase()}
          </span>
          <button onClick={() => setDrawerOpen(true)} style={{ fontFamily: F.m, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: N.hi, background: N.loko, padding: '8px 16px', border: 'none', cursor: 'pointer' }}>
            Begin Your Inquiry
          </button>
        </div>
      </nav>

      <section style={{ padding: 'clamp(64px, 9vw, 120px) clamp(20px, 5vw, 32px) 48px', maxWidth: 1100, margin: '0 auto' }}>
        <p style={{ fontFamily: F.m, fontSize: 9.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: N.loko, marginBottom: 12 }}>Welcome, {lead.client_name ?? 'Friend'}</p>
        <h1 style={{ fontFamily: F.d, fontWeight: 300, fontSize: 'clamp(40px, 6vw, 64px)', lineHeight: 1.05, color: N.hi, marginBottom: 16 }}>
          Two booths. Four ways to <em style={{ fontFamily: F.b, fontStyle: 'italic', color: N.mut }}>hold the night.</em>
        </h1>
        <p style={{ fontFamily: F.m, fontSize: 10, color: N.fnt, marginBottom: 48 }}>
          We respond within 24 hours · Southern California only
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3 }}>
          {TIERS.map(t => (
            <TierCard
              key={t.id}
              tier={t}
              selected={state.tier === t.id}
              onSelect={() => openWithTier(t.id)}
            />
          ))}
        </div>
      </section>

      <section style={{ padding: 'clamp(48px, 6vw, 80px) clamp(20px, 5vw, 32px)', borderTop: `1px solid ${N.ln}`, maxWidth: 1400, margin: '0 auto' }}>
        <p style={{ fontFamily: F.m, fontSize: 9.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: N.loko, marginBottom: 12 }}>Featured Templates</p>
        <h2 style={{ fontFamily: F.d, fontWeight: 300, fontSize: 'clamp(28px, 4vw, 40px)', color: N.hi, marginBottom: 24 }}>
          Six designs to set the tone.
        </h2>
        <FeaturedTemplateRow presets={featured} selectedId={state.template?.id ?? null} onSelect={openWithTemplate} />
      </section>

      <footer style={{ padding: '64px clamp(20px, 5vw, 32px) 48px', borderTop: `1px solid ${N.ln}`, textAlign: 'center' }}>
        <KathaWordmark style={{ height: 32, width: 'auto', color: N.hi, margin: '0 auto' }} />
        <p style={{ fontFamily: F.m, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: N.fnt, marginTop: 20 }}>© 2026 Katha Studio</p>
      </footer>

      <ZDrawer open={drawerOpen} onClose={closeDrawer}>
        <div style={{ padding: '48px clamp(24px, 5vw, 48px)', minHeight: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
            <button onClick={closeDrawer} style={{ fontFamily: F.m, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: N.mut, background: 'transparent', border: 'none', cursor: 'pointer' }}>
              Close ✕
            </button>
          </div>

          {state.step === 'summary' && (
            <>
              <h2 style={{ fontFamily: F.d, fontSize: 40, fontWeight: 300, color: N.hi, marginBottom: 8 }}>Your Selection</h2>
              <p style={{ fontFamily: F.b, fontSize: 18, fontStyle: 'italic', color: N.mut, marginBottom: 32 }}>Confirm the package and template you'd like.</p>
              <dl style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
                <div><dt style={{ fontFamily: F.m, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: N.fnt, marginBottom: 4 }}>Package</dt><dd style={{ fontFamily: F.d, fontSize: 22, color: N.hi }}>{state.tier ?? '—'}</dd></div>
                <div><dt style={{ fontFamily: F.m, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: N.fnt, marginBottom: 4 }}>Template</dt><dd style={{ fontFamily: F.d, fontSize: 22, color: N.hi }}>{state.template?.name ?? '—'}</dd></div>
              </dl>
              <button
                onClick={() => dispatch({ type: 'goto', value: 'date' })}
                disabled={!state.tier && !state.template}
                style={{ width: '100%', padding: 16, background: (state.tier || state.template) ? N.loko : 'transparent', color: (state.tier || state.template) ? N.hi : N.fnt, border: `1px solid ${(state.tier || state.template) ? N.loko : N.ln}`, fontFamily: F.m, fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: (state.tier || state.template) ? 'pointer' : 'not-allowed' }}>
                Continue to Date →
              </button>
            </>
          )}

          {state.step === 'date' && (
            <>
              <h2 style={{ fontFamily: F.d, fontSize: 40, fontWeight: 300, color: N.hi, marginBottom: 8 }}>Reserve Your Date</h2>
              <p style={{ fontFamily: F.b, fontSize: 18, fontStyle: 'italic', color: N.mut, marginBottom: 32 }}>Struck dates are booked or blocked.</p>
              <AvailabilityCalendar
                blockedDates={blockedDates}
                value={state.date}
                onChange={(d) => dispatch({ type: 'set-date', value: d })}
              />
              <button
                onClick={() => dispatch({ type: 'goto', value: 'notes' })}
                disabled={!state.date}
                style={{ marginTop: 32, width: '100%', padding: 16, background: state.date ? N.loko : 'transparent', color: state.date ? N.hi : N.fnt, border: `1px solid ${state.date ? N.loko : N.ln}`, fontFamily: F.m, fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: state.date ? 'pointer' : 'not-allowed' }}>
                Continue →
              </button>
            </>
          )}

          {state.step === 'notes' && (
            <>
              <h2 style={{ fontFamily: F.d, fontSize: 40, fontWeight: 300, color: N.hi, marginBottom: 8 }}>One Last Thing</h2>
              <p style={{ fontFamily: F.b, fontSize: 18, fontStyle: 'italic', color: N.mut, marginBottom: 32 }}>Anything we should know about the event?</p>
              <textarea
                value={state.notes}
                onChange={(e) => dispatch({ type: 'set-notes', value: e.target.value })}
                placeholder="Optional"
                style={{ width: '100%', minHeight: 140, background: N.l1, border: `1px solid ${N.ln}`, color: N.hi, padding: 16, fontFamily: F.m, fontSize: 13, resize: 'vertical' }}
              />
              {submitError && (
                <p style={{ marginTop: 16, fontFamily: F.m, fontSize: 11, color: '#C0584A' }}>{submitError}</p>
              )}
              <button
                onClick={submit}
                disabled={submitting}
                style={{ marginTop: 16, width: '100%', padding: 16, background: N.loko, color: N.hi, border: `1px solid ${N.loko}`, fontFamily: F.m, fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: submitting ? 'wait' : 'pointer' }}>
                {submitting ? 'Reserving…' : 'Reserve Your Date'}
              </button>
            </>
          )}

          {state.step === 'success' && (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', borderTop: `1px solid ${N.ln}`, borderBottom: `1px solid ${N.ln}`, padding: '64px 0' }}>
              <p style={{ fontFamily: F.m, fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: N.loko, marginBottom: 24 }}>// Status: Secured</p>
              <h2 style={{ fontFamily: F.d, fontSize: 56, fontWeight: 300, color: N.hi, lineHeight: 1.05, marginBottom: 24 }}>
                Date <br /><em style={{ fontFamily: F.b, fontStyle: 'italic', color: N.mut }}>Reserved.</em>
              </h2>
              <div style={{ width: '100%', height: 1, background: N.ln, marginBottom: 24 }} />
              <p style={{ fontFamily: F.m, fontSize: 14, color: N.mut, lineHeight: 1.6 }}>
                We've sent a confirmation to {lead.client_email}. Expect a follow-up within 24 hours.
              </p>
            </div>
          )}
        </div>
      </ZDrawer>
    </div>
  );
}
