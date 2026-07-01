'use client';

import { useReducer, useState } from 'react';
import { KathaWordmark } from '@/app/components/KathaWordmark';
import { ZDrawer } from '@/app/components/ZDrawer';
import { TierCard } from '@/app/components/TierCard';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { TIERS } from '@/lib/tiers';
import type { PhotoboothPreset } from '@/lib/templates';
import { finalizeBooking, type Lead } from './actions';

// New deconstructed components
import { TemplateGallery } from '@/app/components/booking/TemplateGallery';
import { PersonalizationPanel } from '@/app/components/booking/PersonalizationPanel';
import { ReviewScreen } from '@/app/components/booking/ReviewScreen';
import { ConfirmationScreen } from '@/app/components/booking/ConfirmationScreen';

const N = {
  l0: '#161311',
  l1: '#211D1A',
  l2: '#3D352E',
  hi: '#ECE7DB',
  mut: '#AAA8A2',
  fnt: '#8F8C8A',
  loko: '#882D17',
  ln: 'rgba(236, 231, 219, 0.12)'
};

const F = {
  d: 'var(--font-fh-ronaldson-display), serif',
  b: "'Cormorant', serif",
  m: "'Courier Prime', monospace"
};

type Step = 'summary' | 'date' | 'notes' | 'success' | 'browse' | 'review';

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

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => dispatch({ type: 'goto', value: 'summary' }), 600);
  };

  const openWithTier = (tier: string) => {
    dispatch({ type: 'set-tier', value: tier });
    dispatch({ type: 'goto', value: 'summary' });
    setDrawerOpen(true);
  };

  const openWithTemplate = (preset: PhotoboothPreset) => {
    dispatch({ type: 'set-template', value: preset });
    dispatch({ type: 'goto', value: 'summary' });
    setDrawerOpen(true);
  };

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
    if (res.success) {
      dispatch({ type: 'goto', value: 'success' });
    } else {
      setSubmitError(res.error ?? 'Something went wrong — please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100dvh', background: N.l0, color: N.hi }}>
      {/* Sticky Premium Nav */}
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

      {/* Screen 2: Main Client Landing & Living Specimen Template Gallery */}
      <section style={{ padding: 'clamp(64px, 9vw, 120px) clamp(20px, 5vw, 32px) 48px', maxWidth: 1100, margin: '0 auto' }}>
        <p style={{ fontFamily: F.m, fontSize: 9.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: N.loko, marginBottom: 12 }}>Welcome, {lead.client_name ?? 'Friend'}</p>
        <h1 style={{ fontFamily: F.d, fontWeight: 300, fontSize: 'clamp(40px, 6vw, 64px)', lineHeight: 1.05, color: N.hi, marginBottom: 16 }}>
          Two booths. Four ways to <em style={{ fontFamily: F.b, fontStyle: 'italic', color: N.mut }}>hold the night.</em>
        </h1>
        <p style={{ fontFamily: F.m, fontSize: 10, color: N.fnt, marginBottom: 48 }}>
          We respond within 24 hours · Southern California only
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
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

      {/* Living Specimen Collection / Gallery */}
      <section style={{ padding: 'clamp(48px, 6vw, 80px) clamp(20px, 5vw, 32px)', borderTop: `1px solid ${N.ln}`, maxWidth: 1400, margin: '0 auto' }}>
        <TemplateGallery presets={featured} onSelect={openWithTemplate} />
      </section>

      {/* Elegant Footer */}
      <footer style={{ padding: '64px clamp(20px, 5vw, 32px) 48px', borderTop: `1px solid ${N.ln}`, textAlign: 'center' }}>
        <KathaWordmark style={{ height: 32, width: 'auto', color: N.hi, margin: '0 auto' }} />
        <p style={{ fontFamily: F.m, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: N.fnt, marginTop: 20 }}>© 2026 Katha Studio</p>
      </footer>

      {/* Slide-out Inquiry Workspace */}
      <ZDrawer open={drawerOpen} onClose={closeDrawer}>
        <div style={{ padding: '48px clamp(24px, 5vw, 48px)', minHeight: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
            <button onClick={closeDrawer} style={{ fontFamily: F.m, fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: N.mut, background: 'transparent', border: 'none', cursor: 'pointer' }}>
              Close ✕
            </button>
          </div>

          {/* Screen 3: Post-Selection Personalization Panel */}
          {state.step === 'summary' && (
            <PersonalizationPanel
              selectedTier={state.tier}
              selectedTemplate={state.template}
              selectedDate={state.date}
              notes={state.notes}
              blockedDates={blockedDates}
              onSetTier={(tier) => dispatch({ type: 'set-tier', value: tier })}
              onSetDate={(date) => dispatch({ type: 'set-date', value: date })}
              onSetNotes={(notes) => dispatch({ type: 'set-notes', value: notes })}
              onNextStep={() => dispatch({ type: 'goto', value: 'review' })}
            />
          )}

          {/* Screen 4: Review Summary Stage */}
          {state.step === 'review' && (
            <ReviewScreen
              selectedTier={state.tier}
              selectedTemplateName={state.template?.name ?? null}
              selectedDate={state.date}
              notes={state.notes}
              submitting={submitting}
              submitError={submitError}
              onSubmit={submit}
              onEditSection={(sectionStep) => dispatch({ type: 'goto', value: sectionStep })}
            />
          )}

          {/* Screen 5: Succinct, Calm Confirmation State */}
          {state.step === 'success' && (
            <ConfirmationScreen
              clientEmail={lead.client_email ?? ''}
              onReset={() => {
                dispatch({ type: 'reset' });
                closeDrawer();
              }}
            />
          )}
        </div>
      </ZDrawer>
    </div>
  );
}
