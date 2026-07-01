'use client';

const N = {
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
  selectedTemplateName: string | null;
  selectedDate: string | null;
  notes: string;
  submitting: boolean;
  submitError: string | null;
  onSubmit: () => void;
  onEditSection: (step: 'summary' | 'date' | 'notes') => void;
};

export function ReviewScreen({
  selectedTier,
  selectedTemplateName,
  selectedDate,
  notes,
  submitting,
  submitError,
  onSubmit,
  onEditSection
}: Props) {
  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ fontFamily: F.d, fontSize: 36, fontWeight: 300, color: N.hi, marginBottom: 8 }}>Review Your Selection</h2>
      <p style={{ fontFamily: F.b, fontSize: 18, fontStyle: 'italic', color: N.mut, marginBottom: 32 }}>Confirm the package, design, and reserved date.</p>

      <div style={{
        background: 'rgba(236, 231, 219, 0.02)',
        border: `1px solid ${N.ln}`,
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        marginBottom: 32
      }}>
        {/* Package Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <span style={{ fontFamily: F.m, fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: N.fnt, display: 'block', marginBottom: 4 }}>Service Package</span>
            <span style={{ fontFamily: F.d, fontSize: 24, color: N.hi }}>{selectedTier ?? 'None Selected'}</span>
          </div>
          <button
            onClick={() => onEditSection('summary')}
            style={{ fontFamily: F.m, fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: N.loko, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Edit
          </button>
        </div>

        <div style={{ height: 1, background: N.ln }} />

        {/* Template Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <span style={{ fontFamily: F.m, fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: N.fnt, display: 'block', marginBottom: 4 }}>Template Design</span>
            <span style={{ fontFamily: F.d, fontSize: 24, color: N.hi }}>{selectedTemplateName ?? 'None Selected'}</span>
          </div>
          <button
            onClick={() => onEditSection('summary')}
            style={{ fontFamily: F.m, fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: N.loko, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Edit
          </button>
        </div>

        <div style={{ height: 1, background: N.ln }} />

        {/* Date Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <span style={{ fontFamily: F.m, fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: N.fnt, display: 'block', marginBottom: 4 }}>Reserved Date</span>
            <span style={{ fontFamily: F.d, fontSize: 24, color: N.hi }}>{selectedDate ?? 'None Selected'}</span>
          </div>
          <button
            onClick={() => onEditSection('date')}
            style={{ fontFamily: F.m, fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: N.loko, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Edit
          </button>
        </div>

        {notes && (
          <>
            <div style={{ height: 1, background: N.ln }} />
            {/* Notes Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <span style={{ fontFamily: F.m, fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: N.fnt, display: 'block', marginBottom: 4 }}>Additional Notes</span>
                <p style={{ fontFamily: F.b, fontStyle: 'italic', fontSize: 16, color: N.mut, margin: 0, whiteSpace: 'pre-line' }}>{notes}</p>
              </div>
              <button
                onClick={() => onEditSection('notes')}
                style={{ fontFamily: F.m, fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: N.loko, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Edit
              </button>
            </div>
          </>
        )}
      </div>

      {submitError && (
        <p style={{ fontFamily: F.m, fontSize: 11, color: '#C0584A', marginBottom: 16 }}>{submitError}</p>
      )}

      {/* Sacred single Loko Rust CTA per viewport */}
      <button
        onClick={onSubmit}
        disabled={submitting || !selectedDate}
        style={{
          width: '100%',
          padding: 16,
          background: N.loko,
          color: N.hi,
          border: `1px solid ${N.loko}`,
          fontFamily: F.m,
          fontSize: 10.5,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          cursor: submitting ? 'wait' : 'pointer',
          transition: 'filter 0.3s'
        }}
      >
        {submitting ? 'Submitting Inquiry…' : 'Send Inquiry'}
      </button>
    </div>
  );
}
