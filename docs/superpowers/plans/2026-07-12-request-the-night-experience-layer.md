# Request the Night — Plan 2: Experience Layer (Senior-Accessible, Device-Optimized, Scalable)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every surface of the Katha booking pipeline usable by a 60-year-old on any device — one accessible type/touch/contrast foundation plus a small set of reusable primitives, applied across calendar → tier → intake → customizer → portal, with the customizer reimagined as a stepped flow that keeps its live proof visible.

**Architecture:** Accessibility is a **token-level baseline**, not a mode. We add a semantic type scale and touch/spacing tokens to the existing Gilded Archive `@theme` (Tailwind v4), build ~6 accessible primitives in `components/ui/`, then refit each pipeline surface to consume them. The customizer gains a stepper + persistent preview + optional "Simple view" density (auto-on for coarse pointers / small viewports) — but the full view is fully accessible too, so nobody is ever routed into an inaccessible path. Everything is palette-agnostic at the semantic layer, so it survives whichever `DESIGN.md` becomes canonical (see Open Governance).

**Tech Stack:** Next.js 15 App Router (pb-v3), React 19, Tailwind CSS v4 (`@theme` tokens in `app/globals.css`, no config file), Vitest + `@testing-library/react` + jsdom + `jest-axe` (component a11y tests), Playwright + `@axe-core/playwright` (cross-surface audit, reusing the repo's chrome-devtools/Playwright posture — **never** the banned `oax-audit-monster`).

**Companion plan:** [Plan 1 — Data Layer](2026-07-12-request-the-night-data-layer.md). This plan is the **experience layer**; it depends on Plan 1 for `/api/request` (Task 7 here) and `/api/availability/v2` (Task 8 here). The two plans can run in parallel until those two joins.

**Reference material:** The senior-usability proposal JSON (pasted by Jed 2026-07-12) and the two reference components (`components/customizer/CustomizerClient.tsx`, `components/customizer/LivePreview.tsx`). Treated as **reference, not spec** — the reconciliation below records what we adopt, revise, and reject.

---

## Proposal reconciliation (adversarial pass, 2026-07-12)

The pasted proposal is strong on principles and wrong on two architecture calls. Mirroring the r1.1 council pattern: **Adopt / Revise / Reject**, with reasons.

### Adopted (verbatim intent)
- One-task-per-screen for the **controls** (reduces cognitive load).
- Large obvious controls — primary actions **48px**, all targets **≥44px**.
- Minimize choices — 6–8 curated options up front, the rest behind an "More options" disclosure.
- Immediate, readable live preview.
- Forgiving actions — undo last change, local draft restore, safe Cancel.
- Consistent plain-verb language (Save, Back, Next, Finalize, Preview).
- `aria-live` preview announcements; all inputs labelled; logical tab order.
- Inline, plain-language validation focused on the first invalid field.
- Reduced-motion respected; device test matrix (iPhone SE → desktop).
- Human usability test with 5 participants aged 55–70 (rollout gate).

### Revised (kept the idea, changed the mechanism)
- **`simpleMode` toggle → accessibility as baseline + additive "Simple view."** The proposal makes legibility a toggle defaulting on only on mobile — which means the *default desktop path is the hard one*, and a reset toggle strands a senior in dense mode. **Revision:** the baseline everywhere already meets the senior bar (≥16px essential text, ≥44px targets, AA contrast). "Simple view" is an *extra* one-thing-at-a-time density that auto-enables for coarse pointers / viewports <768px, but the full view is equally accessible.
- **"Advanced" as the mode label → two separate controls.** The proposal conflates "turn off senior mode" with "show advanced controls" under one "Advanced" button. **Revision:** a **"Simple view / Full view"** density switch (what's shown at once) is distinct from an **"More options"** disclosure (fine-tuning: inscription position, layout variation, font). Two jobs, two labels.
- **Wizard that hides the preview → preview stays persistent.** The live proof is the product's soul; a 4-screen wizard that hides it until finalize guts the value. **Revision:** the stepper reduces the *controls* on screen, never the preview. Desktop: preview always beside controls. Mobile: preview is a sticky top strip, visible through every step.
- **localStorage draft + "sync to server when online" → local draft restore only.** A server-sync engine (conflict resolution, staleness) is unjustified for a single magic-link page. **Revision:** keep lightweight local draft restore (survive an accidental refresh); the durable write stays the existing finalize POST. YAGNI on sync.
- **Labels at 14px → 16px for anything actionable/essential.** 14px is borderline for the audience; reserve it for genuinely secondary text.
- **Names/Date line "required" → soft-recommended.** The preview already falls back to specimen text; hard-blocking finalize on inscription creates a dead-end for a photos-only strip. Recommend, don't block.

### Rejected (do not implement)
- **"Patch CustomizerClient.tsx directly with a `simpleMode` useState + gray Tailwind snippet."** The proposal's `tailwindHelpers` use off-palette raw classes (`border-gray-300`, `focus:ring-gold`, `shadow-sm`). The Gilded Archive system has **no grays and no `gold`** — only `--color-katha-*` tokens (globals.css:33–70). Building on those raw classes would fail `npm run guard` and the brand law. We build on tokens + primitives instead.
- **Grain filter tied to `simpleMode`.** Grain is static texture, not a legibility barrier. **Instead:** gate the expensive `feTurbulence` render behind a *performance* signal (`prefers-reduced-data` / low-core devices), independent of the accessibility mode — the proposal's own "disable grain on low-power devices" belongs here, not under senior mode.

---

## Global Constraints

- Working branch: `feat/crm-replacement-v1` (current). Commit per task; do **not** push or open PRs.
- **Gilded Archive tokens only.** Every color is a `--color-katha-*` / `--color-stock-*` token (globals.css:33–70). No `gray-*`, no `gold`, no raw hex in components, **no red anywhere** (the system has none). New size/spacing values go through the tokens added in Task 1.
- **Senior accessibility floor (this project's bar, applied everywhere):**
  - Essential or interactive text **≥16px**; secondary text **≥13px**; decorative mono eyebrows may be 11px **only if** every fact they carry is also present in an accessible-sized element and they meet AA contrast.
  - Touch targets **≥44px**; primary actions **48px**.
  - Contrast **≥4.5:1** for all essential text (verified programmatically in Task 10).
  - Keyboard reachable + visible focus (the globals.css:78 focus law already applies); `prefers-reduced-motion` respected; every input has a persistent visible label (no placeholder-only fields).
- **One gilt CTA per viewport** (law D2). Gilt (`--color-katha-gilt`) stays the single high-intent accent.
- **Motion law:** tilt ≤6° (LivePreview already caps 5°), damped return ≥1.2s, fully inert under reduced-motion.
- **Date law (R6):** PT-anchored ISO strings; never `new Date(iso)` on a date string.
- **Registry voice** for all copy (see the spec's microcopy deck). Plain verbs, sentence case, honest empty/error states.
- **No legacy names** (HAM/HERMES/thors-hammer/oax-*). Testing uses Playwright/chrome-devtools only.
- All work under `pb-v3/` unless a path says otherwise.

## File Structure

```
pb-v3/
  app/globals.css                      MODIFY  +@theme type/touch tokens; grain perf-gate
  lib/a11y.ts                          CREATE  pure helpers: contrastRatio, meetsAA, env signals, announce
  lib/draft.ts                         CREATE  local customizer draft save/restore (no server sync)
  components/ui/
    Field.tsx                          CREATE  labelled input/textarea, 56px, 16px, helper + inline error
    ChoiceCard.tsx                     CREATE  selectable card (plate/layout/tier), aria-pressed, ≥48px
    Swatch.tsx                         CREATE  full-width palette row, ≥48px, name + contrast sample + check
    SlotChip.tsx                       CREATE  afternoon/evening radio chip, ≥44px, radiogroup
    Stepper.tsx                        CREATE  step header, aria-current, progress
    ActionBar.tsx                      CREATE  sticky footer, one gilt primary + back/secondary
    LiveRegion.tsx                     CREATE  polite aria-live announcer (imperative announce())
  components/customizer/
    CustomizerClient.tsx               REWRITE stepped flow + persistent preview + Simple/Full density
    LivePreview.tsx                    MODIFY  aria-live proof text, simple rendering, grain perf-gate, truncation
    useCustomizer.ts                   CREATE  reducer/state hook (steps, draft, derived proof text)
  components/booking/
    RegistryCalendar.tsx               REWRITE weekend strip + expanding slot shelf (spec Slot UX)
    IntakeForm.tsx                     CREATE  RTN tiered 6+2 intake (Field/ChoiceCard/ActionBar) + A1 line
    PricingTiers.tsx                   MODIFY  lift essential type ≥16px; ChoiceCard for tier select
    DateGate.tsx                       MODIFY  type lift; mailto→hello@ (also in Plan 1 Task 7 — whichever lands first)
  app/portal/[id]/template-design/page.tsx  MODIFY  carry tier+slot legibly; no re-asking
  tests/                              CREATE  *.test.ts(x) unit + component a11y
  playwright/a11y.spec.ts             CREATE  cross-surface axe + tap-target + reduced-motion audit
  vitest.config.ts                    MODIFY  add jsdom project for component tests (from Plan 1 Task 1)
```

---

### Task 1: Accessibility foundation — tokens, `lib/a11y.ts`, component-test harness

**Files:**
- Modify: `pb-v3/app/globals.css` (`@theme` block + grain perf-gate)
- Create: `pb-v3/lib/a11y.ts`
- Create: `pb-v3/tests/a11y.test.ts`
- Modify: `pb-v3/vitest.config.ts` (jsdom for component tests), `pb-v3/package.json` (deps)

**Interfaces:**
- Consumes: Vitest from Plan 1 Task 1 (if Plan 1 hasn't run, install Vitest here first — see Step 1).
- Produces:
  - CSS tokens: `--fs-eyebrow, --fs-meta, --fs-label, --fs-body, --fs-lede, --fs-title, --fs-display` (fluid `clamp()`), `--touch (44px)`, `--touch-lg (48px)`, `--field-h (56px)`, `--tap-gap (12px)`.
  - `contrastRatio(hexA: string, hexB: string): number`
  - `meetsAA(ratio: number, large?: boolean): boolean` (large = ≥18.66px bold / ≥24px → 3:1, else 4.5:1)
  - `coarsePointer(): boolean`, `smallViewport(): boolean`, `prefersReducedData(): boolean`, `prefersReducedMotion(): boolean`
  - `announce(message: string): void` (writes to the shared LiveRegion; no-op until Task 4 mounts it)

- [ ] **Step 1: Install deps**

```bash
cd /Users/jedg./Desktop/kat_ha_pb/pb-v3
# Vitest may already be present from Plan 1 Task 1; -D is idempotent.
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom jest-axe @axe-core/playwright
```

- [ ] **Step 2: Write the failing test for the contrast + env helpers**

Create `pb-v3/tests/a11y.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { contrastRatio, meetsAA } from '@/lib/a11y';

describe('contrastRatio (WCAG 2.1)', () => {
  it('primary ink on the void is very high', () => {
    // Piña Ecru #F5EFE6 on Kamagong #110F0D
    expect(contrastRatio('#F5EFE6', '#110F0D')).toBeGreaterThan(12);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#A89C8A', '#181512')).toBeCloseTo(
      contrastRatio('#181512', '#A89C8A'), 5,
    );
  });

  it('Rattan secondary ink passes AA on the section surface', () => {
    // --color-katha-mut #A89C8A on --color-katha-l1 #181512  (~7:1)
    expect(meetsAA(contrastRatio('#A89C8A', '#181512'))).toBe(true);
  });

  it('catches the real risk: Capiz Slate meta FAILS AA on raised cards', () => {
    // --color-katha-fnt #857D71 on --color-katha-l3 #28221B  (~3.9:1)
    // This is why 'fnt' is documented "meta, base surfaces only" — the util
    // makes that rule enforceable instead of a comment.
    expect(meetsAA(contrastRatio('#857D71', '#28221B'))).toBe(false);
  });

  it('large-text threshold is 3:1', () => {
    const r = contrastRatio('#857D71', '#28221B'); // ~3.9
    expect(meetsAA(r, false)).toBe(false);
    expect(meetsAA(r, true)).toBe(true);
  });
});
```

- [ ] **Step 3: Run to verify failure**

Run: `cd pb-v3 && npx vitest run tests/a11y.test.ts`
Expected: FAIL — cannot resolve `@/lib/a11y`.

- [ ] **Step 4: Implement `lib/a11y.ts`**

Create `pb-v3/lib/a11y.ts`:

```ts
// Accessibility helpers. Pure functions are unit-tested; the browser-signal
// helpers guard on typeof window so they are SSR-safe (return false on server).

function srgbToLinear(c: number): number {
  const cs = c / 255;
  return cs <= 0.03928 ? cs / 12.92 : ((cs + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

/** WCAG 2.1 contrast ratio, 1–21. Order-independent. */
export function contrastRatio(hexA: string, hexB: string): number {
  const la = relativeLuminance(hexA);
  const lb = relativeLuminance(hexB);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** AA: 4.5:1 for normal text, 3:1 for large text (≥24px, or ≥18.66px bold). */
export function meetsAA(ratio: number, large = false): boolean {
  return ratio >= (large ? 3 : 4.5);
}

const mql = (q: string): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(q).matches
    : false;

export const coarsePointer = (): boolean => mql('(pointer: coarse)');
export const smallViewport = (): boolean => mql('(max-width: 767px)');
export const prefersReducedData = (): boolean => mql('(prefers-reduced-data: reduce)');
export const prefersReducedMotion = (): boolean => mql('(prefers-reduced-motion: reduce)');

// Shared live-region announcer. LiveRegion (Task 4) registers a sink here;
// until then announce() is a safe no-op so callers never crash.
let sink: ((msg: string) => void) | null = null;
export function registerAnnouncer(fn: (msg: string) => void): () => void {
  sink = fn;
  return () => { if (sink === fn) sink = null; };
}
export function announce(message: string): void {
  sink?.(message);
}
```

- [ ] **Step 5: Run to verify pass**

Run: `cd pb-v3 && npx vitest run tests/a11y.test.ts`
Expected: all PASS.

- [ ] **Step 6: Add the type/touch tokens to `@theme`**

In `pb-v3/app/globals.css`, inside the `@theme { … }` block (after the architecture tokens, before the closing brace near line 70), add:

```css
  /* ═══ Accessibility scale — the senior floor, fluid across devices ═══ */
  /* Essential/interactive text never renders below --fs-body (16px). Mono
     eyebrows (--fs-eyebrow) are decorative only; every fact they carry is
     duplicated in an accessible-sized element. */
  --fs-eyebrow: 11px;                              /* decorative mono label */
  --fs-meta: 13px;                                 /* secondary, non-essential */
  --fs-label: 1rem;                                /* 16px — field labels */
  --fs-body: clamp(1rem, 0.96rem + 0.2vw, 1.0625rem);   /* 16–17px */
  --fs-lede: clamp(1.125rem, 1.05rem + 0.4vw, 1.25rem); /* 18–20px */
  --fs-title: clamp(1.5rem, 1.2rem + 1.6vw, 2rem);      /* 24–32px */
  --fs-display: clamp(2rem, 1.4rem + 3vw, 3rem);        /* 32–48px */

  --touch: 44px;        /* minimum interactive target */
  --touch-lg: 48px;     /* primary actions */
  --field-h: 56px;      /* input height */
  --tap-gap: 12px;      /* min gap between adjacent targets */
```

- [ ] **Step 7: Perf-gate the grain (decouple from accessibility)**

In `pb-v3/app/globals.css`, replace the `.grain` rule (around line 222–230) so the expensive noise is dropped when the client asks to save data:

```css
/* Wabi-Sabi Plaster & Parchment Grain Overlay — static texture, but the
   feTurbulence data-URI is skipped when the client signals reduced data,
   so low-power / metered devices keep the base surface with no render cost. */
.grain {
  position: fixed;
  inset: 0;
  z-index: 50;
  pointer-events: none;
  opacity: .9;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
}
@media (prefers-reduced-data: reduce) {
  .grain { background-image: none; }
}
```

- [ ] **Step 8: Point Vitest at jsdom for component tests**

In `pb-v3/vitest.config.ts`, replace the `test` block so `.ts` stays node and `.tsx` runs in jsdom with jest-dom + jest-axe matchers:

```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: { name: 'node', include: ['tests/**/*.test.ts'], environment: 'node' },
      },
      {
        extends: true,
        test: {
          name: 'dom',
          include: ['tests/**/*.test.tsx'],
          environment: 'jsdom',
          setupFiles: ['./tests/setup.ts'],
        },
      },
    ],
  },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
});
```

Create `pb-v3/tests/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
import { expect } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);
```

- [ ] **Step 9: Run the whole suite + commit**

Run: `cd pb-v3 && npx vitest run`
Expected: node + dom projects both green (dom has no tests yet — that's fine).

```bash
cd /Users/jedg./Desktop/kat_ha_pb
git add pb-v3/app/globals.css pb-v3/lib/a11y.ts pb-v3/tests/a11y.test.ts pb-v3/tests/setup.ts pb-v3/vitest.config.ts pb-v3/package.json pb-v3/package-lock.json
git commit -m "feat(a11y): type/touch token scale + contrast utils + grain perf-gate"
```

---

### Task 2: `Field` primitive — accessible labelled input

**Files:**
- Create: `pb-v3/components/ui/Field.tsx`
- Test: `pb-v3/tests/Field.test.tsx`

**Interfaces:**
- Consumes: tokens from Task 1.
- Produces:
  - `type FieldProps = { id: string; label: string; value: string; onChange: (v: string) => void; helper?: string; error?: string; type?: 'text' | 'tel' | 'email'; multiline?: boolean; required?: boolean; placeholder?: string; inputMode?: 'text' | 'tel' | 'email' | 'numeric' }`
  - `export function Field(props: FieldProps): JSX.Element` — a persistent visible label (never placeholder-only), 56px height, 16px text, `aria-describedby` wiring helper + error, `aria-invalid` on error, `aria-required` when required.

- [ ] **Step 1: Write the failing a11y test**

Create `pb-v3/tests/Field.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Field } from '@/components/ui/Field';

describe('Field', () => {
  it('associates the visible label with the input', () => {
    render(<Field id="phone" label="Phone" value="" onChange={() => {}} />);
    const input = screen.getByLabelText('Phone');
    expect(input).toBeInTheDocument();
  });

  it('exposes helper and error via aria-describedby', () => {
    render(
      <Field id="phone" label="Phone" value="x" onChange={() => {}}
             helper="For confirming logistics — never marketing." error="Enter a phone we can reach." />,
    );
    const input = screen.getByLabelText('Phone');
    const described = (input.getAttribute('aria-describedby') || '').split(' ');
    expect(described).toContain('phone-helper');
    expect(described).toContain('phone-error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('emits the raw string value on change', () => {
    const onChange = vi.fn();
    render(<Field id="names" label="Names" value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Names'), { target: { value: 'Ana' } });
    expect(onChange).toHaveBeenCalledWith('Ana');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <Field id="venue" label="Venue / city" value="" onChange={() => {}} helper="Where's the night?" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd pb-v3 && npx vitest run tests/Field.test.tsx`
Expected: FAIL — cannot resolve `@/components/ui/Field`.

- [ ] **Step 3: Implement `Field`**

Create `pb-v3/components/ui/Field.tsx`:

```tsx
'use client';

import React from 'react';

export type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  helper?: string;
  error?: string;
  type?: 'text' | 'tel' | 'email';
  multiline?: boolean;
  required?: boolean;
  placeholder?: string;
  inputMode?: 'text' | 'tel' | 'email' | 'numeric';
};

export function Field({
  id, label, value, onChange, helper, error,
  type = 'text', multiline = false, required = false, placeholder, inputMode,
}: FieldProps) {
  const helperId = helper ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;

  const shared = {
    id,
    value,
    placeholder,
    inputMode,
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : undefined,
    'aria-required': required || undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    className:
      'w-full bg-transparent border border-[var(--color-katha-ln2)] rounded-[2px] ' +
      'px-4 text-[var(--color-katha-ink)] placeholder-[var(--color-katha-fnt)] ' +
      'outline-none focus:border-[var(--color-katha-gilt)] transition-colors duration-300',
    style: {
      fontSize: 'var(--fs-body)',
      minHeight: multiline ? 'auto' : 'var(--field-h)',
    } as React.CSSProperties,
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[var(--color-katha-mut)]" style={{ fontSize: 'var(--fs-label)' }}>
        {label}{required && <span aria-hidden="true" className="text-[var(--color-katha-gilt)]"> ·</span>}
      </label>
      {multiline ? (
        <textarea {...shared} rows={3} style={{ ...shared.style, paddingTop: 12, paddingBottom: 12 }} />
      ) : (
        <input {...shared} type={type} />
      )}
      {helper && !error && (
        <p id={helperId} className="text-[var(--color-katha-fnt)]" style={{ fontSize: 'var(--fs-meta)' }}>{helper}</p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-[var(--color-katha-hi)]" style={{ fontSize: 'var(--fs-meta)' }}>{error}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run to verify pass + commit**

Run: `cd pb-v3 && npx vitest run tests/Field.test.tsx`
Expected: all PASS (including axe).

```bash
cd /Users/jedg./Desktop/kat_ha_pb
git add pb-v3/components/ui/Field.tsx pb-v3/tests/Field.test.tsx
git commit -m "feat(ui): accessible Field primitive (56px, 16px, described-by, inline error)"
```

---

### Task 3: Selection primitives — `ChoiceCard`, `Swatch`, `SlotChip`

**Files:**
- Create: `pb-v3/components/ui/ChoiceCard.tsx`, `pb-v3/components/ui/Swatch.tsx`, `pb-v3/components/ui/SlotChip.tsx`
- Test: `pb-v3/tests/selection-primitives.test.tsx`

**Interfaces:**
- Produces:
  - `ChoiceCard`: `{ selected: boolean; onSelect: () => void; disabled?: boolean; title: string; sub?: string; children?: ReactNode }` — a real `<button>`, `aria-pressed`, min-height `var(--touch-lg)`, title at `var(--fs-body)`.
  - `Swatch`: `{ selected: boolean; onSelect: () => void; name: string; bg: string; ink: string }` — full-width ≥48px row, shows the palette name at 16px **and** a "Aa" contrast sample painted in the palette's own ink-on-paper, plus a check when selected. Used inside a `role="listbox"` parent.
  - `SlotChip`: `{ slot: 'afternoon' | 'evening'; label: string; selected: boolean; disabled?: boolean; onSelect: () => void }` — ≥44px radio chip for a `role="radiogroup"` shelf; disabled = visible-but-inert (booked).

- [ ] **Step 1: Write the failing tests**

Create `pb-v3/tests/selection-primitives.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { ChoiceCard } from '@/components/ui/ChoiceCard';
import { Swatch } from '@/components/ui/Swatch';
import { SlotChip } from '@/components/ui/SlotChip';

describe('ChoiceCard', () => {
  it('is a button that reports pressed state and fires onSelect', () => {
    const onSelect = vi.fn();
    render(<ChoiceCard selected title="Strip · 3 slots" sub="Classic" onSelect={onSelect} />);
    const btn = screen.getByRole('button', { name: /Strip · 3 slots/ });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(btn);
    expect(onSelect).toHaveBeenCalled();
  });

  it('disabled card does not fire onSelect', () => {
    const onSelect = vi.fn();
    render(<ChoiceCard selected={false} disabled title="Sold" onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /Sold/ }));
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe('Swatch', () => {
  it('names the palette in text (not color-only) and marks selection', async () => {
    const { container } = render(
      <div role="listbox" aria-label="Paper and ink">
        <Swatch selected name="Piña Ecru" bg="#F5EFE6" ink="#2A251E" onSelect={() => {}} />
      </div>,
    );
    expect(screen.getByText('Piña Ecru')).toBeInTheDocument();
    expect(screen.getByRole('option', { selected: true })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('SlotChip', () => {
  it('booked chip is visible but disabled', () => {
    const onSelect = vi.fn();
    render(
      <div role="radiogroup" aria-label="Time">
        <SlotChip slot="afternoon" label="Afternoon · spoken for" selected={false} disabled onSelect={onSelect} />
      </div>,
    );
    const chip = screen.getByRole('radio', { name: /Afternoon/ });
    expect(chip).toBeDisabled();
    fireEvent.click(chip);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd pb-v3 && npx vitest run tests/selection-primitives.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement the three primitives**

Create `pb-v3/components/ui/ChoiceCard.tsx`:

```tsx
'use client';
import React from 'react';

export function ChoiceCard({
  selected, onSelect, disabled = false, title, sub, children,
}: {
  selected: boolean; onSelect: () => void; disabled?: boolean;
  title: string; sub?: string; children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-disabled={disabled || undefined}
      onClick={() => !disabled && onSelect()}
      className={`text-left p-4 border rounded-[2px] transition-colors duration-300 flex flex-col gap-1 ${
        disabled
          ? 'border-[var(--color-katha-ln)] opacity-45 cursor-default'
          : selected
            ? 'border-[var(--color-katha-gilt)] bg-[var(--color-katha-gilt-low)] cursor-pointer'
            : 'border-[var(--color-katha-ln2)] hover:border-[var(--color-katha-mut)] cursor-pointer'
      }`}
      style={{ minHeight: 'var(--touch-lg)' }}
    >
      <span className="text-[var(--color-katha-ink)]" style={{ fontSize: 'var(--fs-body)' }}>{title}</span>
      {sub && <span className="text-[var(--color-katha-mut)]" style={{ fontSize: 'var(--fs-meta)' }}>{sub}</span>}
      {children}
    </button>
  );
}
```

Create `pb-v3/components/ui/Swatch.tsx`:

```tsx
'use client';
import React from 'react';

export function Swatch({
  selected, onSelect, name, bg, ink,
}: { selected: boolean; onSelect: () => void; name: string; bg: string; ink: string }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-4 border rounded-[2px] transition-colors duration-300 cursor-pointer ${
        selected ? 'border-[var(--color-katha-gilt)] bg-[var(--color-katha-gilt-low)]'
                 : 'border-[var(--color-katha-ln2)] hover:border-[var(--color-katha-mut)]'
      }`}
      style={{ minHeight: 'var(--touch-lg)' }}
    >
      {/* Contrast sample painted in the palette's own paper+ink, not a bare chip */}
      <span
        className="inline-flex items-center justify-center w-9 h-9 rounded-[2px] border border-[var(--color-katha-ln2)] shrink-0"
        style={{ backgroundColor: bg, color: ink, fontFamily: 'Fraunces, Georgia, serif' }}
        aria-hidden="true"
      >
        Aa
      </span>
      <span className="flex-1 text-left text-[var(--color-katha-ink)]" style={{ fontSize: 'var(--fs-body)' }}>{name}</span>
      {selected && <span aria-hidden="true" className="text-[var(--color-katha-gilt)]">✓</span>}
    </button>
  );
}
```

Create `pb-v3/components/ui/SlotChip.tsx`:

```tsx
'use client';
import React from 'react';

export function SlotChip({
  slot, label, selected, disabled = false, onSelect,
}: {
  slot: 'afternoon' | 'evening'; label: string;
  selected: boolean; disabled?: boolean; onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      data-slot={slot}
      disabled={disabled}
      onClick={() => !disabled && onSelect()}
      className={`flex-1 px-4 border rounded-[2px] transition-colors duration-300 ${
        disabled ? 'border-[var(--color-katha-ln)] opacity-45 cursor-default'
                 : selected ? 'border-[var(--color-katha-gilt)] bg-[var(--color-katha-gilt-low)] text-[var(--color-katha-gilt)] cursor-pointer'
                            : 'border-[var(--color-katha-ln2)] text-[var(--color-katha-ink)] hover:border-[var(--color-katha-mut)] cursor-pointer'
      }`}
      style={{ minHeight: 'var(--touch)', fontSize: 'var(--fs-body)' }}
    >
      {label}
    </button>
  );
}
```

- [ ] **Step 4: Run to verify pass + commit**

Run: `cd pb-v3 && npx vitest run tests/selection-primitives.test.tsx`
Expected: all PASS.

```bash
cd /Users/jedg./Desktop/kat_ha_pb
git add pb-v3/components/ui/ChoiceCard.tsx pb-v3/components/ui/Swatch.tsx pb-v3/components/ui/SlotChip.tsx pb-v3/tests/selection-primitives.test.tsx
git commit -m "feat(ui): ChoiceCard + Swatch + SlotChip selection primitives (≥44px, aria roles)"
```

---

### Task 4: Flow primitives — `Stepper`, `ActionBar`, `LiveRegion`

**Files:**
- Create: `pb-v3/components/ui/Stepper.tsx`, `pb-v3/components/ui/ActionBar.tsx`, `pb-v3/components/ui/LiveRegion.tsx`
- Test: `pb-v3/tests/flow-primitives.test.tsx`

**Interfaces:**
- Produces:
  - `Stepper`: `{ steps: { key: string; label: string }[]; current: number; onJump?: (i: number) => void }` — `aria-current="step"` on the active item; step N label + count; visited steps are clickable when `onJump` given.
  - `ActionBar`: `{ onBack?: () => void; backLabel?: string; primaryLabel: string; onPrimary: () => void; primaryDisabled?: boolean }` — sticky footer, single gilt primary (law D2), optional quiet back.
  - `LiveRegion`: `() => JSX.Element` — mounts once near the app root; registers with `registerAnnouncer` (Task 1) so any `announce()` call updates a `role="status" aria-live="polite"` node.

- [ ] **Step 1: Write the failing tests**

Create `pb-v3/tests/flow-primitives.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Stepper } from '@/components/ui/Stepper';
import { ActionBar } from '@/components/ui/ActionBar';
import { LiveRegion } from '@/components/ui/LiveRegion';
import { announce } from '@/lib/a11y';

const STEPS = [
  { key: 'plate', label: 'Plate' },
  { key: 'paper', label: 'Paper' },
  { key: 'text', label: 'Inscription' },
  { key: 'done', label: 'Finalize' },
];

describe('Stepper', () => {
  it('marks the active step with aria-current', () => {
    render(<Stepper steps={STEPS} current={2} />);
    expect(screen.getByText('Inscription').closest('[aria-current="step"]')).toBeTruthy();
  });
});

describe('ActionBar', () => {
  it('renders one primary and fires it', () => {
    const onPrimary = vi.fn();
    render(<ActionBar primaryLabel="Next" onPrimary={onPrimary} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPrimary).toHaveBeenCalled();
  });

  it('disabled primary does not fire', () => {
    const onPrimary = vi.fn();
    render(<ActionBar primaryLabel="Finalize" onPrimary={onPrimary} primaryDisabled />);
    fireEvent.click(screen.getByRole('button', { name: 'Finalize' }));
    expect(onPrimary).not.toHaveBeenCalled();
  });
});

describe('LiveRegion', () => {
  it('announces messages politely', () => {
    render(<LiveRegion />);
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    act(() => announce('Preview updated'));
    expect(region).toHaveTextContent('Preview updated');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd pb-v3 && npx vitest run tests/flow-primitives.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement the three primitives**

Create `pb-v3/components/ui/Stepper.tsx`:

```tsx
'use client';
import React from 'react';

export function Stepper({
  steps, current, onJump,
}: { steps: { key: string; label: string }[]; current: number; onJump?: (i: number) => void }) {
  return (
    <ol className="flex items-center gap-2" aria-label={`Step ${current + 1} of ${steps.length}`}>
      {steps.map((s, i) => {
        const active = i === current;
        const visited = i < current;
        const clickable = !!onJump && visited;
        return (
          <li key={s.key} aria-current={active ? 'step' : undefined} className="flex items-center gap-2">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onJump?.(i)}
              className={`flex items-center gap-2 ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
              style={{ minHeight: 'var(--touch)' }}
            >
              <span
                className={`inline-flex items-center justify-center w-7 h-7 rounded-full border ${
                  active ? 'border-[var(--color-katha-gilt)] text-[var(--color-katha-gilt)]'
                         : visited ? 'border-[var(--color-katha-moss-hi)] text-[var(--color-katha-moss-hi)]'
                                   : 'border-[var(--color-katha-ln2)] text-[var(--color-katha-fnt)]'
                }`}
                style={{ fontSize: 'var(--fs-meta)' }}
              >
                {visited ? '✓' : i + 1}
              </span>
              <span
                className={active ? 'text-[var(--color-katha-ink)]' : 'text-[var(--color-katha-mut)]'}
                style={{ fontSize: 'var(--fs-meta)' }}
              >
                {s.label}
              </span>
            </button>
            {i < steps.length - 1 && <span aria-hidden="true" className="w-4 h-px bg-[var(--color-katha-ln2)]" />}
          </li>
        );
      })}
    </ol>
  );
}
```

Create `pb-v3/components/ui/ActionBar.tsx`:

```tsx
'use client';
import React from 'react';

export function ActionBar({
  onBack, backLabel = 'Back', primaryLabel, onPrimary, primaryDisabled = false,
}: {
  onBack?: () => void; backLabel?: string;
  primaryLabel: string; onPrimary: () => void; primaryDisabled?: boolean;
}) {
  return (
    <div
      className="sticky bottom-0 flex items-center gap-3 bg-[var(--color-katha-l1)] border-t border-[var(--color-katha-ln)] px-5 py-4"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="px-5 text-[var(--color-katha-mut)] border border-[var(--color-katha-ln2)] rounded-[2px] hover:text-[var(--color-katha-ink)] transition-colors cursor-pointer"
          style={{ minHeight: 'var(--touch-lg)', fontSize: 'var(--fs-body)' }}
        >
          {backLabel}
        </button>
      )}
      <button
        type="button"
        onClick={() => !primaryDisabled && onPrimary()}
        aria-disabled={primaryDisabled || undefined}
        className={`flex-1 rounded-[2px] font-medium transition-colors ${
          primaryDisabled
            ? 'bg-[var(--color-katha-l3)] text-[var(--color-katha-fnt)] cursor-default'
            : 'bg-[var(--color-katha-gilt)] text-[var(--color-katha-l0)] hover:bg-[var(--color-katha-champ)] cursor-pointer'
        }`}
        style={{ minHeight: 'var(--touch-lg)', fontSize: 'var(--fs-body)' }}
      >
        {primaryLabel}
      </button>
    </div>
  );
}
```

Create `pb-v3/components/ui/LiveRegion.tsx`:

```tsx
'use client';
import React, { useEffect, useState } from 'react';
import { registerAnnouncer } from '@/lib/a11y';

export function LiveRegion() {
  const [msg, setMsg] = useState('');
  useEffect(() => registerAnnouncer(setMsg), []);
  return (
    <div
      role="status"
      aria-live="polite"
      className="sr-only"
      style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}
    >
      {msg}
    </div>
  );
}
```

- [ ] **Step 4: Run to verify pass + commit**

Run: `cd pb-v3 && npx vitest run tests/flow-primitives.test.tsx`
Expected: all PASS.

```bash
cd /Users/jedg./Desktop/kat_ha_pb
git add pb-v3/components/ui/Stepper.tsx pb-v3/components/ui/ActionBar.tsx pb-v3/components/ui/LiveRegion.tsx pb-v3/tests/flow-primitives.test.tsx
git commit -m "feat(ui): Stepper + ActionBar + LiveRegion flow primitives"
```

---

### Task 5: Customizer state hook + local draft restore

**Files:**
- Create: `pb-v3/lib/draft.ts`, `pb-v3/components/customizer/useCustomizer.ts`
- Test: `pb-v3/tests/draft.test.ts`, `pb-v3/tests/useCustomizer.test.ts`

**Interfaces:**
- Produces:
  - `lib/draft.ts`: `saveDraft(leadId: string, d: DraftState): void`, `loadDraft(leadId: string): DraftState | null`, `clearDraft(leadId: string): void` — localStorage only, namespaced `katha:draft:<leadId>`, SSR-safe (no-op without window). `type DraftState = { templateId: string; paletteKey: string; layoutId: string; textPosition: 'top'|'bottom'; title: string; subtitle: string; venue: string }`.
  - `useCustomizer.ts`: `useCustomizer(leadId: string, templates, palettes): { state, step, steps, setField, select, next, back, goTo, proofText, canFinalize }` — the reducer that drives the stepped flow; hydrates from draft on mount; writes draft on every change; derives the aria-live proof sentence.

- [ ] **Step 1: Write the failing draft test**

Create `pb-v3/tests/draft.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { saveDraft, loadDraft, clearDraft } from '@/lib/draft';

const sample = {
  templateId: 't1', paletteKey: 'pina', layoutId: 'strip-3',
  textPosition: 'bottom' as const, title: 'Ana & Sam', subtitle: 'Oct', venue: '',
};

describe('draft store', () => {
  beforeEach(() => localStorage.clear());

  it('round-trips a draft per lead', () => {
    saveDraft('lead-1', sample);
    expect(loadDraft('lead-1')).toEqual(sample);
  });

  it('is isolated per lead and returns null when absent', () => {
    saveDraft('lead-1', sample);
    expect(loadDraft('lead-2')).toBeNull();
  });

  it('clears', () => {
    saveDraft('lead-1', sample);
    clearDraft('lead-1');
    expect(loadDraft('lead-1')).toBeNull();
  });
});
```

Note: this is a `.ts` test but touches `localStorage`; add `environment: 'jsdom'` for it by renaming to `.test.tsx`, OR keep `.ts` and it runs under the node project — node lacks `localStorage`. **Name this file `tests/draft.test.tsx`** so it runs in the jsdom project. (Rename in the create step above accordingly.)

- [ ] **Step 2: Run to verify failure**

Run: `cd pb-v3 && npx vitest run tests/draft.test.tsx`
Expected: FAIL — cannot resolve `@/lib/draft`.

- [ ] **Step 3: Implement `lib/draft.ts`**

Create `pb-v3/lib/draft.ts`:

```ts
export type DraftState = {
  templateId: string;
  paletteKey: string;
  layoutId: string;
  textPosition: 'top' | 'bottom';
  title: string;
  subtitle: string;
  venue: string;
};

const key = (leadId: string) => `katha:draft:${leadId}`;

export function saveDraft(leadId: string, d: DraftState): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(key(leadId), JSON.stringify(d)); } catch { /* quota / private mode — non-fatal */ }
}

export function loadDraft(leadId: string): DraftState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key(leadId));
    return raw ? (JSON.parse(raw) as DraftState) : null;
  } catch { return null; }
}

export function clearDraft(leadId: string): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(key(leadId)); } catch { /* non-fatal */ }
}
```

- [ ] **Step 4: Write the failing hook test**

Create `pb-v3/tests/useCustomizer.test.ts` → **name `tests/useCustomizer.test.tsx`** (jsdom):

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCustomizer } from '@/components/customizer/useCustomizer';

const templates = [{ id: 't1', name: 'Ronaldson', layout: 'strip-3', sName: 'AMARA', sSub: 'OCT' }] as any;
const palettes = [{ key: 'pina', name: 'Piña Ecru', bg: '#F5EFE6', text: '#2A251E' }] as any;

describe('useCustomizer', () => {
  beforeEach(() => localStorage.clear());

  it('starts on step 0 and advances', () => {
    const { result } = renderHook(() => useCustomizer('lead-1', templates, palettes));
    expect(result.current.step).toBe(0);
    act(() => result.current.next());
    expect(result.current.step).toBe(1);
  });

  it('derives an announceable proof sentence from the inscription', () => {
    const { result } = renderHook(() => useCustomizer('lead-1', templates, palettes));
    act(() => result.current.setField('title', 'Ana & Sam'));
    expect(result.current.proofText).toMatch(/Ana & Sam/);
  });

  it('persists a draft that a fresh hook rehydrates', () => {
    const { result, unmount } = renderHook(() => useCustomizer('lead-1', templates, palettes));
    act(() => result.current.setField('venue', 'Long Beach'));
    unmount();
    const { result: r2 } = renderHook(() => useCustomizer('lead-1', templates, palettes));
    expect(r2.current.state.venue).toBe('Long Beach');
  });
});
```

- [ ] **Step 5: Run to verify failure**

Run: `cd pb-v3 && npx vitest run tests/useCustomizer.test.tsx`
Expected: FAIL — cannot resolve the hook.

- [ ] **Step 6: Implement `useCustomizer.ts`**

Create `pb-v3/components/customizer/useCustomizer.ts`:

```ts
'use client';

import { useEffect, useMemo, useReducer } from 'react';
import { getLayout, layoutsForFormat } from '@/lib/layouts';
import { loadDraft, saveDraft, type DraftState } from '@/lib/draft';

export const STEPS = [
  { key: 'plate', label: 'Plate' },
  { key: 'paper', label: 'Paper' },
  { key: 'text', label: 'Inscription' },
  { key: 'done', label: 'Finalize' },
] as const;

type State = DraftState & { step: number };

type Action =
  | { t: 'field'; k: 'title' | 'subtitle' | 'venue'; v: string }
  | { t: 'select'; k: 'templateId' | 'paletteKey' | 'layoutId' | 'textPosition'; v: string }
  | { t: 'step'; v: number };

function reducer(s: State, a: Action): State {
  switch (a.t) {
    case 'field': return { ...s, [a.k]: a.v };
    case 'select':
      // Selecting a plate re-anchors its default layout.
      if (a.k === 'templateId') return { ...s, templateId: a.v };
      return { ...s, [a.k]: a.v } as State;
    case 'step': return { ...s, step: Math.max(0, Math.min(STEPS.length - 1, a.v)) };
  }
}

export function useCustomizer(leadId: string, templates: any[], palettes: any[]) {
  const initial: State = useMemo(() => {
    const saved = loadDraft(leadId);
    const t0 = templates[0];
    return {
      step: 0,
      templateId: saved?.templateId ?? t0.id,
      paletteKey: saved?.paletteKey ?? palettes[0].key,
      layoutId: saved?.layoutId ?? t0.layout ?? 'strip-3',
      textPosition: saved?.textPosition ?? 'bottom',
      title: saved?.title ?? '',
      subtitle: saved?.subtitle ?? '',
      venue: saved?.venue ?? '',
    };
  }, [leadId, templates, palettes]);

  const [state, dispatch] = useReducer(reducer, initial);

  // Persist every change (draft restore only — no server sync).
  useEffect(() => {
    const { step, ...draft } = state;
    saveDraft(leadId, draft);
  }, [leadId, state]);

  const activeTemplate = templates.find((t) => t.id === state.templateId) ?? templates[0];
  const activePalette = palettes.find((p) => p.key === state.paletteKey) ?? palettes[0];
  const activeLayout = getLayout(state.layoutId) ?? getLayout(activeTemplate.layout) ?? getLayout('strip-3')!;
  const availableLayouts = layoutsForFormat(activeLayout.format);

  const proofText = useMemo(() => {
    const names = state.title || activeTemplate.sName || 'the names';
    const date = state.subtitle || activeTemplate.sSub || 'the date';
    return `Proof updated. ${names}; ${date}${state.venue ? `; ${state.venue}` : ''}; on ${activePalette.name} paper.`;
  }, [state.title, state.subtitle, state.venue, activeTemplate, activePalette]);

  return {
    state, step: state.step, steps: STEPS,
    activeTemplate, activePalette, activeLayout, availableLayouts,
    setField: (k: 'title' | 'subtitle' | 'venue', v: string) => dispatch({ t: 'field', k, v }),
    select: (k: 'templateId' | 'paletteKey' | 'layoutId' | 'textPosition', v: string) => dispatch({ t: 'select', k, v }),
    next: () => dispatch({ t: 'step', v: state.step + 1 }),
    back: () => dispatch({ t: 'step', v: state.step - 1 }),
    goTo: (i: number) => dispatch({ t: 'step', v: i }),
    proofText,
    canFinalize: true, // inscription is soft-recommended, never blocking (reconciliation)
  };
}
```

- [ ] **Step 7: Run to verify pass + commit**

Run: `cd pb-v3 && npx vitest run tests/draft.test.tsx tests/useCustomizer.test.tsx`
Expected: all PASS.

```bash
cd /Users/jedg./Desktop/kat_ha_pb
git add pb-v3/lib/draft.ts pb-v3/components/customizer/useCustomizer.ts pb-v3/tests/draft.test.tsx pb-v3/tests/useCustomizer.test.tsx
git commit -m "feat(customizer): stepped-flow state hook + local draft restore"
```

---

### Task 6: Customizer UI rewrite — stepped flow, persistent preview, Simple/Full density

**Files:**
- Rewrite: `pb-v3/components/customizer/CustomizerClient.tsx`
- Modify: `pb-v3/components/customizer/LivePreview.tsx`
- Test: `pb-v3/tests/CustomizerClient.test.tsx`

**Interfaces:**
- Consumes: `useCustomizer` (Task 5), all `components/ui/*` primitives (Tasks 2–4), `announce` (Task 1).
- Produces: the accessible customizer. Preview is persistent across steps (sticky top strip <768px, right column ≥768px). Density defaults to Simple for coarse pointer / small viewport (via `coarsePointer()`/`smallViewport()`), with a "Full view / Simple view" switch. Finalize keeps the existing `POST /api/selection` contract unchanged; on success it `clearDraft`s.
- LivePreview gains: `announce()` of `proofText` on debounced change; `simple` prop (larger inscription type, grain skipped when `simple` or `prefersReducedData()`); display truncation with the full string still sent in the payload.

- [ ] **Step 1: Write the failing test (the flow behaves, and the preview announces)**

Create `pb-v3/tests/CustomizerClient.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import CustomizerClient from '@/components/customizer/CustomizerClient';

// content.json is imported by the component; jsdom resolves it via the alias.
describe('CustomizerClient (accessible flow)', () => {
  beforeEach(() => localStorage.clear());

  it('renders step 1 with a persistent live proof and a single primary action', () => {
    render(<CustomizerClient leadId="demo" />);
    expect(screen.getByRole('img', { name: /Live proof/ })).toBeInTheDocument();
    // exactly one gilt primary in the action bar
    expect(screen.getByRole('button', { name: /Next/ })).toBeInTheDocument();
  });

  it('advances through steps and reaches Finalize', () => {
    render(<CustomizerClient leadId="demo" />);
    fireEvent.click(screen.getByRole('button', { name: /Next/ })); // plate → paper
    fireEvent.click(screen.getByRole('button', { name: /Next/ })); // paper → inscription
    fireEvent.click(screen.getByRole('button', { name: /Next/ })); // inscription → finalize
    expect(screen.getByRole('button', { name: /Finalize/ })).toBeInTheDocument();
  });

  it('has no axe violations on the first step', async () => {
    const { container } = render(<CustomizerClient leadId="demo" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd pb-v3 && npx vitest run tests/CustomizerClient.test.tsx`
Expected: FAIL (current component is the dense single-screen version without a Stepper/ActionBar; `Next` button absent).

- [ ] **Step 3: Rewrite `CustomizerClient.tsx`**

Replace the entire contents of `pb-v3/components/customizer/CustomizerClient.tsx` with the stepped, primitive-based flow. Full file:

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import LivePreview from './LivePreview';
import content from '@/lib/content.json';
import { track } from '@/lib/track';
import { useCustomizer, STEPS } from './useCustomizer';
import { clearDraft } from '@/lib/draft';
import { coarsePointer, smallViewport, announce } from '@/lib/a11y';
import { Stepper } from '@/components/ui/Stepper';
import { ActionBar } from '@/components/ui/ActionBar';
import { ChoiceCard } from '@/components/ui/ChoiceCard';
import { Swatch } from '@/components/ui/Swatch';
import { Field } from '@/components/ui/Field';

type SubmitState = { phase: 'idle' } | { phase: 'sending' } | { phase: 'ok' } | { phase: 'error'; message: string };

export default function CustomizerClient({ leadId }: { leadId: string }) {
  const templates = (content as any).templates.filter((t: any) => !t.isFootnote);
  const palettes = (content as any).palettes;
  const cz = useCustomizer(leadId, templates, palettes);
  const [submit, setSubmit] = useState<SubmitState>({ phase: 'idle' });
  const [simple, setSimple] = useState(false);

  // Density defaults to Simple for touch / small screens; full view stays fully
  // accessible, so this is a comfort default, not a gate.
  useEffect(() => { setSimple(coarsePointer() || smallViewport()); }, []);

  async function finalize() {
    if (submit.phase === 'sending') return;
    setSubmit({ phase: 'sending' });
    track('selection_submit', {
      leadHash: leadId && leadId !== 'demo' ? leadId : undefined,
      meta: { templateId: cz.activeTemplate.id },
    });
    try {
      const res = await fetch('/api/selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: cz.activeTemplate.id,
          templateName: cz.activeTemplate.name,
          layout: cz.activeLayout.format,
          names: cz.state.title || null,
          date: cz.state.subtitle || null,
          venue: cz.state.venue || null,
          fontFamily: cz.activeTemplate.font || null,
          notes: JSON.stringify({ layoutId: cz.state.layoutId, palette: cz.activePalette.key, textPosition: cz.state.textPosition }),
          lead: leadId && leadId !== 'demo' ? leadId : null,
          selectedAt: new Date().toISOString(),
        }),
      });
      const body = await res.json().catch(() => null);
      if (res.ok && body?.ok) {
        clearDraft(leadId);
        setSubmit({ phase: 'ok' });
        announce('Design saved. We will take it from here.');
      } else {
        setSubmit({ phase: 'error', message: body?.error || "We couldn't record the design just now. Nothing was lost — please try again." });
      }
    } catch {
      setSubmit({ phase: 'error', message: "We couldn't reach the studio just now. Nothing was lost — please try again." });
    }
  }

  const preview = (
    <LivePreview
      template={cz.activeTemplate}
      layoutId={cz.state.layoutId}
      palette={cz.activePalette}
      title={cz.state.title}
      subtitle={cz.state.subtitle}
      venue={cz.state.venue}
      textPosition={cz.state.textPosition}
      simple={simple}
      proofText={cz.proofText}
    />
  );

  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row bg-[var(--color-katha-l0)]">
      {/* Preview — sticky top strip on mobile, right column on desktop */}
      <main className="order-first lg:order-last lg:flex-1 sticky top-0 lg:static z-10 bg-[var(--color-katha-l0)] border-b lg:border-b-0 lg:border-l border-[var(--color-katha-ln)] flex items-center justify-center p-4 lg:p-10 max-h-[38vh] lg:max-h-none">
        {preview}
      </main>

      {/* Controls */}
      <aside className="w-full lg:w-[440px] flex flex-col bg-[var(--color-katha-l1)]">
        <div className="p-5 lg:p-8 pb-4 flex items-center justify-between gap-4">
          <Stepper steps={STEPS as any} current={cz.step} onJump={cz.goTo} />
          <button
            type="button"
            onClick={() => setSimple((s) => !s)}
            aria-pressed={simple}
            className="text-[var(--color-katha-mut)] underline underline-offset-4 shrink-0 cursor-pointer"
            style={{ fontSize: 'var(--fs-meta)', minHeight: 'var(--touch)' }}
          >
            {simple ? 'Full view' : 'Simple view'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 lg:px-8 py-4 space-y-6">
          {cz.step === 0 && (
            <fieldset>
              <legend className="text-[var(--color-katha-hi)] mb-4" style={{ fontSize: 'var(--fs-title)', fontFamily: 'Newsreader, Georgia, serif', fontWeight: 300 }}>
                Choose your plate.
              </legend>
              <div className={`grid gap-3 ${simple ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {templates.map((t: any) => (
                  <ChoiceCard key={t.id} selected={cz.state.templateId === t.id} title={t.name} sub={t.formatLabel}
                    onSelect={() => { cz.select('templateId', t.id); cz.select('layoutId', t.layout); }} />
                ))}
              </div>
            </fieldset>
          )}

          {cz.step === 1 && (
            <fieldset>
              <legend className="text-[var(--color-katha-hi)] mb-4" style={{ fontSize: 'var(--fs-title)', fontFamily: 'Newsreader, Georgia, serif', fontWeight: 300 }}>
                Pick your paper.
              </legend>
              <div role="listbox" aria-label="Paper and ink" className="space-y-2">
                {palettes.map((p: any) => (
                  <Swatch key={p.key} selected={cz.state.paletteKey === p.key} name={p.name} bg={p.bg} ink={p.text}
                    onSelect={() => cz.select('paletteKey', p.key)} />
                ))}
              </div>
            </fieldset>
          )}

          {cz.step === 2 && (
            <fieldset className="space-y-4">
              <legend className="text-[var(--color-katha-hi)] mb-2" style={{ fontSize: 'var(--fs-title)', fontFamily: 'Newsreader, Georgia, serif', fontWeight: 300 }}>
                Write the inscription.
              </legend>
              <Field id="cz-title" label="Names" value={cz.state.title} onChange={(v) => cz.setField('title', v)} placeholder="Amara & Sebastian" helper="Optional — leave blank to keep the sample." />
              <Field id="cz-subtitle" label="Date line" value={cz.state.subtitle} onChange={(v) => cz.setField('subtitle', v)} placeholder="October · Long Beach" />
              <Field id="cz-venue" label="Venue line" value={cz.state.venue} onChange={(v) => cz.setField('venue', v)} placeholder="Optional" />
              {!simple && (
                <details className="border-t border-[var(--color-katha-ln)] pt-4">
                  <summary className="text-[var(--color-katha-mut)] cursor-pointer" style={{ fontSize: 'var(--fs-body)', minHeight: 'var(--touch)' }}>More options</summary>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {(['bottom', 'top'] as const).map((pos) => (
                      <ChoiceCard key={pos} selected={cz.state.textPosition === pos} title={pos === 'bottom' ? 'Text at bottom' : 'Text at top'} onSelect={() => cz.select('textPosition', pos)} />
                    ))}
                  </div>
                </details>
              )}
            </fieldset>
          )}

          {cz.step === 3 && (
            <div className="space-y-4">
              <h2 className="text-[var(--color-katha-hi)]" style={{ fontSize: 'var(--fs-title)', fontFamily: 'Newsreader, Georgia, serif', fontWeight: 300 }}>
                Ready to finalize.
              </h2>
              <p className="text-[var(--color-katha-mut)]" style={{ fontSize: 'var(--fs-body)' }}>
                {cz.proofText.replace(/^Proof updated\.\s*/, 'Your print: ')} You can go back and change anything.
              </p>
              {submit.phase === 'error' && (
                <p role="alert" className="border-l-2 border-[var(--color-katha-gilt)] pl-3 text-[var(--color-katha-ink)]" style={{ fontSize: 'var(--fs-body)' }}>{submit.message}</p>
              )}
              {submit.phase === 'ok' && (
                <p className="border border-[var(--color-katha-gilt)] text-[var(--color-katha-gilt)] py-4 text-center" style={{ fontSize: 'var(--fs-body)' }}>
                  Design recorded — we&rsquo;ll take it from here.
                </p>
              )}
            </div>
          )}
        </div>

        {submit.phase !== 'ok' && (
          cz.step < 3 ? (
            <ActionBar onBack={cz.step > 0 ? cz.back : undefined} primaryLabel="Next" onPrimary={cz.next} />
          ) : (
            <ActionBar onBack={cz.back} primaryLabel={submit.phase === 'sending' ? 'Recording…' : 'Finalize design'} onPrimary={finalize} primaryDisabled={submit.phase === 'sending'} />
          )
        )}
      </aside>
    </div>
  );
}
```

- [ ] **Step 4: Extend `LivePreview.tsx` — announce, simple render, grain gate, truncate**

In `pb-v3/components/customizer/LivePreview.tsx`:

1. Extend the props interface:
```tsx
interface LivePreviewProps {
  template: any;
  layoutId: string;
  palette: any;
  title: string;
  subtitle: string;
  venue: string;
  textPosition?: 'bottom' | 'top';
  simple?: boolean;
  proofText?: string;
}
```
2. Add imports at the top and destructure the new props (`simple = false, proofText`):
```tsx
import React, { useRef, useEffect } from 'react';
import { getLayout, getModifiedLayout, VIEWBOX } from '@/lib/layouts';
import { announce, prefersReducedData } from '@/lib/a11y';
```
3. Announce the proof, debounced, whenever it changes (inside the component body, after the refs):
```tsx
  useEffect(() => {
    if (!proofText) return;
    const id = setTimeout(() => announce(proofText), 300);
    return () => clearTimeout(id);
  }, [proofText]);
```
4. Gate the grain `<rect … filter="url(#grain)">` render:
```tsx
  const showGrain = !simple && !prefersReducedData();
```
   and wrap the grain overlay rect: `{showGrain && (<rect width={w} height={h} fill="none" style={{ filter: 'url(#grain)' }} className="opacity-40 mix-blend-multiply pointer-events-none" />)}`
5. Truncate long inscription text for DISPLAY only (payload already carries the full string via CustomizerClient). Add a helper above the component and apply to the title/subtitle/venue `<text>` children:
```tsx
const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
```
   e.g. `{clip(title || template.sName, 28)}`, subtitle `clip(…, 32)`, venue `clip(venue, 32)`.
6. Bump inscription font sizes when `simple` (readability): where the title `<text fontSize>` is computed, use `layout.format === 'strip' ? (simple ? 44 : 38) : (simple ? 62 : 54)` and similarly nudge the subtitle up ~15%.
7. Update the SVG `aria-label` to stay descriptive: `aria-label={`Live proof of ${template.name} on ${palette.name} paper`}` (already present — leave as is; the test matches `/Live proof/`).

- [ ] **Step 5: Run tests + typecheck**

Run: `cd pb-v3 && npx vitest run tests/CustomizerClient.test.tsx && npx tsc --noEmit`
Expected: all PASS; no new type errors.

- [ ] **Step 6: Visual verification in the live app**

Start the dev server (preview_start with the pb-v3 launch config; create one in `.claude/launch.json` if absent), open `/portal/demo/template-design` (or the customizer route), and:
- Confirm one gilt CTA per viewport, preview visible on every step, Simple view auto-on at 375px.
- resize_window to 375px (mobile) and 1280px (desktop); screenshot both.
- read_console_messages → no errors; tab through with the keyboard → visible focus everywhere.

- [ ] **Step 7: Commit**

```bash
cd /Users/jedg./Desktop/kat_ha_pb
git add pb-v3/components/customizer/CustomizerClient.tsx pb-v3/components/customizer/LivePreview.tsx pb-v3/tests/CustomizerClient.test.tsx
git commit -m "feat(customizer): stepped accessible flow + persistent preview + Simple/Full density"
```

---

### Task 7: Request-the-Night intake form (joins Plan 1 `/api/request`)

**Files:**
- Create: `pb-v3/components/booking/IntakeForm.tsx`
- Test: `pb-v3/tests/IntakeForm.test.tsx`

**Depends on:** Plan 1 Task 4 (`GUEST_ESTIMATES`, `RequestIntake`, `Slot`) and Task 5 (`POST /api/request`). If Plan 1 hasn't landed, stub `GUEST_ESTIMATES` locally and wire the POST when it does.

**Interfaces:**
- Consumes: `Field`, `ChoiceCard`, `ActionBar`, `announce`; `GUEST_ESTIMATES` from `@/lib/requests`.
- Produces: `IntakeForm({ date, slot, tier, onSubmitted }: { date: string; slot: 'afternoon'|'evening'; tier: string; onSubmitted: (ref: string) => void })` — step 2 of the funnel: 6 required (name, email, phone, venue/city, event type chips, guest-estimate chips) + 2 optional (start time, notes), the A1 contract line, plain-language validation, POSTs to `/api/request`.

- [ ] **Step 1: Write the failing test**

Create `pb-v3/tests/IntakeForm.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import { IntakeForm } from '@/components/booking/IntakeForm';

beforeEach(() => { vi.restoreAllMocks(); });

describe('IntakeForm', () => {
  it('shows the contract-terms line with the real numbers', () => {
    render(<IntakeForm date="2026-08-14" slot="evening" tier="signature" onSubmitted={() => {}} />);
    expect(screen.getByText(/\$99 retainer/)).toBeInTheDocument();
    expect(screen.getByText(/14 days before/)).toBeInTheDocument();
  });

  it('blocks submit until the six required fields are present, focusing the first gap', () => {
    render(<IntakeForm date="2026-08-14" slot="evening" tier="signature" onSubmitted={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Request the night/ }));
    // name is first-required; its error appears
    expect(screen.getByText(/your name/i)).toBeInTheDocument();
  });

  it('submits and reports the reference on success', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, status: 201, json: async () => ({ ok: true, request_id: 'abc', ref: 'KATHA-abc' }),
    } as Response);
    const onSubmitted = vi.fn();
    render(<IntakeForm date="2026-08-14" slot="evening" tier="signature" onSubmitted={onSubmitted} />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ana Reyes' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@example.com' } });
    fireEvent.change(screen.getByLabelText(/Phone/), { target: { value: '5550100' } });
    fireEvent.change(screen.getByLabelText(/Venue/), { target: { value: 'Oaxaca Hall' } });
    fireEvent.click(screen.getByRole('button', { name: 'Wedding' }));
    fireEvent.click(screen.getByRole('button', { name: '100–200' }));
    fireEvent.click(screen.getByRole('button', { name: /Request the night/ }));
    await waitFor(() => expect(onSubmitted).toHaveBeenCalledWith('KATHA-abc'));
  });

  it('has no axe violations', async () => {
    const { container } = render(<IntakeForm date="2026-08-14" slot="evening" tier="signature" onSubmitted={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd pb-v3 && npx vitest run tests/IntakeForm.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `IntakeForm.tsx`**

Create `pb-v3/components/booking/IntakeForm.tsx`:

```tsx
'use client';

import React, { useState } from 'react';
import { Field } from '@/components/ui/Field';
import { ChoiceCard } from '@/components/ui/ChoiceCard';
import { ActionBar } from '@/components/ui/ActionBar';
import { announce } from '@/lib/a11y';
import { GUEST_ESTIMATES } from '@/lib/requests';

const EVENT_TYPES = ['Wedding', 'Reception', 'Birthday', 'Corporate', 'Other'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A1 — legal-reviewed contract line, real numbers from the scraped agreement.
const CONTRACT_LINE =
  'The night is secured with a $99 retainer once we accept — non-refundable, with the balance due 14 days before your event. Date changes need 20 days’ notice.';

export function IntakeForm({
  date, slot, tier, onSubmitted,
}: { date: string; slot: 'afternoon' | 'evening'; tier: string; onSubmitted: (ref: string) => void }) {
  const [f, setF] = useState({ name: '', email: '', phone: '', venue_city: '', event_type: '', guest_estimate: '', start_time: '', notes: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState('');
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (f.name.trim().length < 2) e.name = 'Please add your name.';
    if (!EMAIL.test(f.email.trim())) e.email = 'Enter an email we can reply to.';
    if (f.phone.trim().length < 7) e.phone = 'Enter a phone we can reach.';
    if (!f.venue_city.trim()) e.venue_city = 'Where is the night?';
    if (!f.event_type) e.event_type = 'Pick the kind of event.';
    if (!f.guest_estimate) e.guest_estimate = 'Roughly how many guests?';
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      document.getElementById(first === 'event_type' || first === 'guest_estimate' ? `grp-${first}` : first)?.scrollIntoView({ block: 'center' });
      (document.getElementById(first) as HTMLElement | null)?.focus();
      announce(e[first]);
    }
    return !first;
  }

  async function submit() {
    if (sending) return;
    if (!validate()) return;
    setSending(true); setServerError('');
    try {
      const res = await fetch('/api/request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f.name, email: f.email, date, slot, tier,
          intake: {
            phone: f.phone, venue_city: f.venue_city, event_type: f.event_type, guest_estimate: f.guest_estimate,
            ...(f.start_time ? { start_time: f.start_time } : {}),
            ...(f.notes ? { notes: f.notes } : {}),
          },
        }),
      });
      const body = await res.json().catch(() => null);
      if (res.ok && body?.ok) { onSubmitted(body.ref); return; }
      setServerError(body?.error || 'We couldn’t send that just now. Nothing was lost — please try again.');
    } catch {
      setServerError('We couldn’t reach the studio just now. Nothing was lost — please try again.');
    } finally { setSending(false); }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[var(--color-katha-l1)]">
      <div className="flex-1 overflow-y-auto px-5 lg:px-8 py-6 space-y-5 max-w-[560px] w-full mx-auto">
        <header>
          <h2 className="text-[var(--color-katha-hi)]" style={{ fontSize: 'var(--fs-title)', fontFamily: 'Newsreader, Georgia, serif', fontWeight: 300 }}>
            Almost on the registry.
          </h2>
          <p className="text-[var(--color-katha-mut)] mt-1" style={{ fontSize: 'var(--fs-body)' }}>
            Six details so we can review your night.
          </p>
        </header>

        <Field id="name" label="Name" value={f.name} onChange={(v) => set('name', v)} error={errors.name} required />
        <Field id="email" label="Email" type="email" inputMode="email" value={f.email} onChange={(v) => set('email', v)} error={errors.email} required />
        <Field id="phone" label="Phone" type="tel" inputMode="tel" value={f.phone} onChange={(v) => set('phone', v)} helper="For confirming logistics — never marketing." error={errors.phone} required />
        <Field id="venue_city" label="Venue / city" value={f.venue_city} onChange={(v) => set('venue_city', v)} error={errors.venue_city} required />

        <fieldset id="grp-event_type">
          <legend className="text-[var(--color-katha-mut)] mb-2" style={{ fontSize: 'var(--fs-label)' }}>Event type</legend>
          <div className="grid grid-cols-2 gap-2">
            {EVENT_TYPES.map((t) => (
              <ChoiceCard key={t} selected={f.event_type === t} title={t} onSelect={() => set('event_type', t)} />
            ))}
          </div>
          {errors.event_type && <p role="alert" className="text-[var(--color-katha-hi)] mt-1" style={{ fontSize: 'var(--fs-meta)' }}>{errors.event_type}</p>}
        </fieldset>

        <fieldset id="grp-guest_estimate">
          <legend className="text-[var(--color-katha-mut)] mb-2" style={{ fontSize: 'var(--fs-label)' }}>Guest estimate</legend>
          <div className="grid grid-cols-2 gap-2">
            {GUEST_ESTIMATES.map((g) => (
              <ChoiceCard key={g} selected={f.guest_estimate === g} title={g} onSelect={() => set('guest_estimate', g)} />
            ))}
          </div>
          {errors.guest_estimate && <p role="alert" className="text-[var(--color-katha-hi)] mt-1" style={{ fontSize: 'var(--fs-meta)' }}>{errors.guest_estimate}</p>}
        </fieldset>

        <details className="border-t border-[var(--color-katha-ln)] pt-4">
          <summary className="text-[var(--color-katha-mut)] cursor-pointer" style={{ fontSize: 'var(--fs-body)', minHeight: 'var(--touch)' }}>Add start time or notes (optional)</summary>
          <div className="space-y-4 mt-3">
            <Field id="start_time" label="Start time" value={f.start_time} onChange={(v) => set('start_time', v)} placeholder="Defaults to the slot window" />
            <Field id="notes" label="Notes" multiline value={f.notes} onChange={(v) => set('notes', v)} placeholder="Anything we should know — venue quirks, timing, the occasion." />
          </div>
        </details>

        <p className="border-l-2 border-[var(--color-katha-gilt)] pl-3 text-[var(--color-katha-mut)]" style={{ fontSize: 'var(--fs-meta)' }}>{CONTRACT_LINE}</p>
        {serverError && <p role="alert" className="text-[var(--color-katha-ink)]" style={{ fontSize: 'var(--fs-body)' }}>{serverError}</p>}
      </div>

      <ActionBar primaryLabel={sending ? 'Sending…' : 'Request the night'} onPrimary={submit} primaryDisabled={sending} />
    </div>
  );
}
```

> **LEGAL REVIEW GATE:** `CONTRACT_LINE` (A1) must not ship until Jed's legal read-through clears it — this is the spec's blocker, restated in code.

- [ ] **Step 4: Run to verify pass + commit**

Run: `cd pb-v3 && npx vitest run tests/IntakeForm.test.tsx`
Expected: all PASS.

```bash
cd /Users/jedg./Desktop/kat_ha_pb
git add pb-v3/components/booking/IntakeForm.tsx pb-v3/tests/IntakeForm.test.tsx
git commit -m "feat(rtn): accessible tiered intake form (6+2 fields, A1 contract line, plain validation)"
```

---

### Task 8: Weekend-strip calendar + expanding slot shelf

**Files:**
- Rewrite: `pb-v3/components/booking/RegistryCalendar.tsx`
- Test: `pb-v3/tests/RegistryCalendar.test.tsx`

**Depends on:** Plan 1 Task 5 (`GET /api/availability/v2` shape: `{ days: [{ date, weekday, slots: [{ slot, status }] }] }`) and Task 4 helpers. Consumes `SlotChip`, `announce`.

**Interfaces:**
- Produces: `RegistryCalendar({ days, selected, onPick }: { days: Day[]; selected: { date: string; slot: Slot } | null; onPick: (date: string, slot: Slot) => void })` where `type Day = { date: string; weekday: string; slots: { slot: Slot; status: 'open'|'under_request'|'booked'|'past' }[] }`. Renders Fri/Sat/Sun rows only; tapping a date opens a full-width shelf (no modal) with a `role="radiogroup"` of `SlotChip`s; `aria-expanded` on the date cell; one shelf open at a time; booked chips visible-but-disabled; selection announced.

- [ ] **Step 1: Write the failing test**

Create `pb-v3/tests/RegistryCalendar.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { RegistryCalendar } from '@/components/booking/RegistryCalendar';

const days = [
  { date: '2026-08-14', weekday: 'Fri', slots: [
    { slot: 'afternoon' as const, status: 'open' as const },
    { slot: 'evening' as const, status: 'under_request' as const },
  ] },
  { date: '2026-08-15', weekday: 'Sat', slots: [
    { slot: 'afternoon' as const, status: 'booked' as const },
    { slot: 'evening' as const, status: 'open' as const },
  ] },
];

describe('RegistryCalendar (weekend strip + shelf)', () => {
  it('opens one shelf at a time and picks a slot', () => {
    const onPick = vi.fn();
    render(<RegistryCalendar days={days} selected={null} onPick={onPick} />);
    const fri = screen.getByRole('button', { name: /Aug 14/ });
    fireEvent.click(fri);
    expect(fri).toHaveAttribute('aria-expanded', 'true');
    const group = screen.getByRole('radiogroup');
    fireEvent.click(within(group).getByRole('radio', { name: /Afternoon/ }));
    expect(onPick).toHaveBeenCalledWith('2026-08-14', 'afternoon');
  });

  it('renders booked slots as disabled radios', () => {
    render(<RegistryCalendar days={days} selected={null} onPick={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Aug 15/ }));
    const group = screen.getByRole('radiogroup');
    expect(within(group).getByRole('radio', { name: /spoken for/i })).toBeDisabled();
  });

  it('has no axe violations with a shelf open', async () => {
    const { container } = render(<RegistryCalendar days={days} selected={null} onPick={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Aug 14/ }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd pb-v3 && npx vitest run tests/RegistryCalendar.test.tsx`
Expected: FAIL — the current component has a different (month-grid) signature.

- [ ] **Step 3: Rewrite `RegistryCalendar.tsx`**

Replace the entire file with the weekend-strip + shelf. Full file:

```tsx
'use client';

import { useState } from 'react';
import { SlotChip } from '@/components/ui/SlotChip';
import { announce } from '@/lib/a11y';

type Slot = 'afternoon' | 'evening';
type SlotStatus = 'open' | 'under_request' | 'booked' | 'past';
export type Day = { date: string; weekday: string; slots: { slot: Slot; status: SlotStatus }[] };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** Label from an ISO string — pure string math, never new Date(iso) (R6). */
function human(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}
const SLOT_LABEL: Record<Slot, string> = { afternoon: 'Afternoon', evening: 'Evening' };
function chipLabel(slot: Slot, status: SlotStatus): string {
  const base = SLOT_LABEL[slot];
  if (status === 'open') return `${base} · open`;
  if (status === 'under_request') return `${base} · under request — still open. First acceptance holds it.`;
  return `${base} · spoken for`;
}

export function RegistryCalendar({
  days, selected, onPick,
}: { days: Day[]; selected: { date: string; slot: Slot } | null; onPick: (date: string, slot: Slot) => void }) {
  const [open, setOpen] = useState<string | null>(days[0]?.date ?? null); // A2 — nearest open weekend focused

  return (
    <div className="w-full max-w-[600px]">
      <p className="text-[var(--color-katha-mut)] mb-4" style={{ fontSize: 'var(--fs-body)' }}>
        We install three nights a week. Pick a night, then a time.
      </p>
      <ul className="flex flex-col gap-2" aria-label="Open weekend nights">
        {days.map((day) => {
          const isOpen = open === day.date;
          const anyOpen = day.slots.some((s) => s.status === 'open' || s.status === 'under_request');
          const chosen = selected?.date === day.date;
          return (
            <li key={day.date} className="border border-[var(--color-katha-ln)] rounded-[2px] overflow-hidden">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-label={`${day.weekday} ${human(day.date)}${anyOpen ? '' : ' — fully booked'}`}
                onClick={() => setOpen(isOpen ? null : day.date)}
                disabled={!anyOpen}
                className={`w-full flex items-center justify-between px-4 transition-colors ${
                  chosen ? 'bg-[var(--color-katha-gilt-low)]' : 'hover:bg-[var(--color-katha-l2)]'
                } ${anyOpen ? 'cursor-pointer' : 'opacity-50 cursor-default'}`}
                style={{ minHeight: 'var(--touch-lg)' }}
              >
                <span className="flex items-baseline gap-3">
                  <span className="text-[var(--color-katha-fnt)]" style={{ fontSize: 'var(--fs-meta)' }}>{day.weekday}</span>
                  <span className="text-[var(--color-katha-ink)]" style={{ fontSize: 'var(--fs-lede)', fontFamily: 'Newsreader, Georgia, serif' }}>{human(day.date)}</span>
                </span>
                <span aria-hidden="true" className="text-[var(--color-katha-mut)]">{isOpen ? '–' : '+'}</span>
              </button>
              {isOpen && (
                <div role="radiogroup" aria-label={`Time on ${day.weekday} ${human(day.date)}`} className="flex gap-2 p-3 border-t border-[var(--color-katha-ln)]">
                  {day.slots.map(({ slot, status }) => (
                    <SlotChip
                      key={slot}
                      slot={slot}
                      label={chipLabel(slot, status)}
                      selected={selected?.date === day.date && selected?.slot === slot}
                      disabled={status === 'booked' || status === 'past'}
                      onSelect={() => { onPick(day.date, slot); announce(`${SLOT_LABEL[slot]} on ${day.weekday} ${human(day.date)} selected.`); }}
                    />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify pass + commit**

Run: `cd pb-v3 && npx vitest run tests/RegistryCalendar.test.tsx`
Expected: all PASS (including axe with shelf open).

```bash
cd /Users/jedg./Desktop/kat_ha_pb
git add pb-v3/components/booking/RegistryCalendar.tsx pb-v3/tests/RegistryCalendar.test.tsx
git commit -m "feat(rtn): weekend-strip calendar + expanding slot shelf (radiogroup, aria-expanded)"
```

> **Note:** `RegistryCalendar` changed signature. `DateGate.tsx` currently passes the old `{ dates, heldDate, onSelect }` props. Updating `DateGate` to the new weekend-strip data flow (feeding it `/api/availability/v2`) is folded into **Task 9**, so the app compiles as one unit there.

---

### Task 9: Type-lift the remaining surfaces — Tiers, DateGate, Portal

**Files:**
- Modify: `pb-v3/components/booking/PricingTiers.tsx`, `pb-v3/components/booking/DateGate.tsx`, `pb-v3/app/portal/[id]/template-design/page.tsx`
- Test: `pb-v3/tests/pipeline-legibility.test.tsx`

**Interfaces:** no new exports; this task brings the remaining surfaces up to the senior floor and reconciles the Task 8 signature change.

- [ ] **Step 1: Write a guard test that essential text uses the token scale**

Create `pb-v3/tests/pipeline-legibility.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PricingTiers } from '@/components/booking/PricingTiers';

const tiers = [
  { key: 'a', name: 'The Strip', price: 850, hours: 3, available: true, blurb: 'The classic.', includes: ['Attendant', 'Prints'] },
  { key: 'b', name: 'The Glam', price: 1200, hours: 4, available: false, unavailableLabel: 'Booked this season' },
] as any;

describe('PricingTiers legibility', () => {
  it('renders the price and hours as essential (token) text, not 8.5px', () => {
    render(<PricingTiers tiers={tiers} onSelect={() => {}} />);
    const hours = screen.getByText(/up to 3 hrs/i);
    // essential meta must not be the old fixed 8.5px
    expect(hours.className).not.toMatch(/text-\[8\.5px\]/);
  });

  it('keeps the unavailable tier legible and labelled', () => {
    render(<PricingTiers tiers={tiers} onSelect={() => {}} />);
    expect(screen.getByText(/Booked this season/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `cd pb-v3 && npx vitest run tests/pipeline-legibility.test.tsx`
Expected: FAIL — `up to 3 hrs` currently carries `text-[8.5px]`.

- [ ] **Step 3: Lift `PricingTiers.tsx`**

In `pb-v3/components/booking/PricingTiers.tsx`, raise the essential/interactive text to the token scale (keep the mono eyebrow decorative). Specific edits:
- Line ~85 `up to {tier.hours} hrs`: change `text-[8.5px] tracking-[0.1em]` → inline `style={{ fontSize: 'var(--fs-meta)' }}` and drop the fixed size.
- Line ~73 badge `text-[8.5px]` → `style={{ fontSize: 'var(--fs-eyebrow)' }}` (decorative eyebrow — allowed at 11px).
- Lines ~100/107 `includes` list `text-[9.5px]`/`text-[9px]` → `style={{ fontSize: 'var(--fs-meta)' }}` (these are essential "what you get" — must be legible).
- Line ~115 unavailable label `text-[9px]` → `style={{ fontSize: 'var(--fs-meta)' }}`.
- Add `minHeight: 'var(--touch-lg)'` to the tier `role="button"` card wrapper so the whole card is a comfortable target.
- Keep `The Investment` mono eyebrow (line 27) and the `.tier-cta` as-is (decorative / already gilt).

- [ ] **Step 4: Reconcile `DateGate.tsx` to the weekend-strip flow + type lift**

In `pb-v3/components/booking/DateGate.tsx`:
- Change the data contract from `dates: string[]` to `days: Day[]` (import `Day` + `RegistryCalendar` from `./RegistryCalendar`), and pass `selected` / `onPick` through instead of `heldDate` / `onSelectDate`. Update the parent caller (the page that renders `DateGate`; grep `DateGate` usage) to fetch `/api/availability/v2` and map `{ days }`.
- Raise the error/empty body copy — it already uses `text-[17px]` (fine); change the retry button `text-[10px]` → `style={{ fontSize: 'var(--fs-meta)' }}` and `min-height: var(--touch)`.
- Replace both `mailto:kathabooth@gmail.com` → `mailto:hello@kathabooth.com` and the visible text to `hello@kathabooth.com` (also in Plan 1 Task 7; whichever lands first — make the other a no-op).

- [ ] **Step 5: Portal carry-through legibility**

In `pb-v3/app/portal/[id]/template-design/page.tsx`, ensure the accepted request's **tier + slot** are shown as a legible confirmation strip (token sizes, ≥16px) and that nothing re-asks date/slot/tier (Jed's no-redundancy law). Read the file first; if it already prefills from the lead, only lift any sub-16px essential text to `var(--fs-body)` / `var(--fs-meta)` and confirm the customizer mounts with the carried context.

- [ ] **Step 6: Run tests + typecheck + commit**

Run: `cd pb-v3 && npx vitest run tests/pipeline-legibility.test.tsx && npx tsc --noEmit`
Expected: PASS; no new type errors (the DateGate/​caller change compiles).

```bash
cd /Users/jedg./Desktop/kat_ha_pb
git add pb-v3/components/booking/PricingTiers.tsx pb-v3/components/booking/DateGate.tsx "pb-v3/app/portal/[id]/template-design/page.tsx" pb-v3/tests/pipeline-legibility.test.tsx
git commit -m "feat(a11y): lift Tiers/DateGate/Portal to the senior type + touch floor"
```

---

### Task 10: Cross-surface QA gate — axe, tap targets, contrast, reduced-motion, keyboard

**Files:**
- Create: `pb-v3/playwright/a11y.spec.ts`, `pb-v3/playwright.config.ts`
- Create: `pb-v3/tests/token-contrast.test.ts` (static contrast assertion over the token pairs actually used for essential text)
- Modify: `pb-v3/package.json` (scripts: `test:a11y`)

**Interfaces:** the build gate. Green here + Plan 1's race gate + `npm run guard` = ship-ready for the pilot.

- [ ] **Step 1: Static contrast gate over essential token pairs**

Create `pb-v3/tests/token-contrast.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { contrastRatio, meetsAA } from '@/lib/a11y';

// Every (ink, surface) pair used for ESSENTIAL text must clear AA. This is the
// enforceable version of the "fnt = base surfaces only" comment: 'fnt' is
// deliberately absent from essential pairs because it fails on raised cards.
const ESSENTIAL: Array<[name: string, ink: string, surface: string]> = [
  ['ink on void',    '#F5EFE6', '#110F0D'],
  ['ink on l1',      '#F5EFE6', '#181512'],
  ['ink on l2',      '#F5EFE6', '#201B16'],
  ['ink on l3',      '#F5EFE6', '#28221B'],
  ['mut on l1',      '#A89C8A', '#181512'],
  ['mut on l2',      '#A89C8A', '#201B16'],
  ['gilt on void',   '#DCCBB5', '#110F0D'],
  ['gilt-text on l1','#DCCBB5', '#181512'],
];

describe('token contrast — essential text clears AA', () => {
  for (const [name, ink, surface] of ESSENTIAL) {
    it(name, () => {
      expect(meetsAA(contrastRatio(ink, surface))).toBe(true);
    });
  }

  it('documents the forbidden essential pair (fnt on raised card fails)', () => {
    expect(meetsAA(contrastRatio('#857D71', '#28221B'))).toBe(false);
  });
});
```

Run: `cd pb-v3 && npx vitest run tests/token-contrast.test.ts` → expected all PASS (the last test asserts the known failure, protecting against anyone promoting `fnt` to essential text).

- [ ] **Step 2: Playwright a11y sweep across surfaces + breakpoints**

Create `pb-v3/playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './playwright',
  webServer: { command: 'npm run dev', url: 'http://localhost:3000', reuseExistingServer: true, timeout: 120_000 },
  use: { baseURL: 'http://localhost:3000' },
  projects: [
    { name: 'iphone-se', use: { ...devices['iPhone SE'] } },
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
  ],
});
```

Create `pb-v3/playwright/a11y.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Surfaces reachable without auth; add the admin queue here once Plan 3 lands.
const SURFACES = ['/gallery', '/portal/demo/template-design'];

for (const path of SURFACES) {
  test(`axe: ${path} has no serious violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious, JSON.stringify(serious.map((v) => v.id), null, 2)).toEqual([]);
  });

  test(`tap targets ≥44px: ${path}`, async ({ page }) => {
    await page.goto(path);
    const small = await page.$$eval('a[href], button, [role="button"], [role="radio"], [role="option"], input', (els) =>
      els.filter((el) => {
        const r = (el as HTMLElement).getBoundingClientRect();
        const visible = r.width > 0 && r.height > 0;
        return visible && (r.height < 44 || r.width < 44);
      }).map((el) => (el.textContent || (el as HTMLElement).getAttribute('aria-label') || el.nodeName).trim().slice(0, 40)),
    );
    expect(small, `Under-44px targets on ${path}`).toEqual([]);
  });
}

test('reduced-motion renders all content (no opacity:0 traps)', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/gallery');
  await expect(page.locator('body')).toBeVisible();
  const hidden = await page.$$eval('h1,h2,h3,[data-reveal]', (els) =>
    els.filter((el) => getComputedStyle(el).opacity === '0').length);
  expect(hidden).toBe(0);
  await ctx.close();
});

test('keyboard: the funnel primary CTA is reachable and focus is visible', async ({ page }) => {
  await page.goto('/gallery');
  await page.keyboard.press('Tab');
  const outline = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    return el ? getComputedStyle(el).outlineStyle : 'none';
  });
  expect(outline).not.toBe('none');
});
```

Add to `pb-v3/package.json` scripts: `"test:a11y": "playwright test"`.

- [ ] **Step 3: Run the gate**

Run:
```bash
cd /Users/jedg./Desktop/kat_ha_pb/pb-v3
npx vitest run                 # all unit + component + contrast
npx playwright install --with-deps chromium   # first run only
npm run test:a11y              # axe + tap targets + reduced-motion + keyboard
npm run guard                  # brand-guard: 0 P0
```
Expected: all green. Any serious axe violation, sub-44px target, or opacity:0 trap is a real defect — fix the offending surface, do not relax the assertion.

- [ ] **Step 4: Commit**

```bash
cd /Users/jedg./Desktop/kat_ha_pb
git add pb-v3/playwright.config.ts pb-v3/playwright/a11y.spec.ts pb-v3/tests/token-contrast.test.ts pb-v3/package.json
git commit -m "test(a11y): cross-surface axe + tap-target + contrast + reduced-motion gate"
```

- [ ] **Step 5: Human usability gate (Jed-owned, not code)**

Recruit 5 participants aged 55–70; each completes date → slot → tier → intake → customizer → finalize on a phone. Record time-to-complete, read-aloud label accuracy, and confusion points. Ship the pilot only when all five finish unaided. This is the proposal's usability test, kept as a rollout gate. **Owner: Jed.**

---

## Self-review — spec coverage

| Proposal / spec requirement | Where |
|---|---|
| One task per screen (controls) | Task 5–6 stepper |
| Large controls (48px primary, 44px min) | Tasks 2–4 tokens + primitives; Task 10 sweep |
| Minimize choices / disclosure | Task 6 "More options" `<details>` |
| Immediate readable preview (persistent) | Task 6 sticky preview |
| Forgiving actions (undo/draft/cancel) | Task 5 draft restore; back nav |
| Consistent plain-verb language | Registry-voice copy across 6–8 |
| aria-live announcements | Task 4 LiveRegion; Tasks 6–8 announce() |
| Inline plain-language validation, focus first gap | Task 7 validate() |
| Reduced-motion + reduced-data | Task 1 grain gate; Task 10 reduced-motion test |
| Device matrix (SE → desktop) | Task 10 Playwright projects |
| Contrast AA | Task 1 utils; Task 10 static gate + axe |
| simpleMode (reframed as baseline + Simple view) | Reconciliation; Task 6 density |
| Every pipeline surface senior-usable | Calendar (8), intake (7), tiers/gate/portal (9), customizer (6) |
| Scalable | Token scale + `components/ui/*` primitives every future surface inherits |
| Device-optimized | clamp() fluid type, 100dvh, safe-area insets, sticky preview, 320px floor |
| Human usability test | Task 10 Step 5 (Jed) |

## Open governance (flag, don't fix here)
- **DESIGN.md drift:** root `DESIGN.md` describes "ATELIER / Forest+Cream" (Alabaster/Emerald/IvyMode) and is referenced by the `brass-ring-enforcer` agent as having a "§6 Do's/Don'ts" — but the current file is 5 sections and the **implemented** system is the dark Gilded Archive in `globals.css`. This plan targets the implemented system; the accessibility tokens are palette-agnostic so they survive either. **Jed to reconcile which DESIGN.md is canonical** before the enforcer is trusted in CI.

---

## Follow-up (not in this plan)
- Plan 3 (from Plan 1) — admin queue + emails — should reuse `Field`/`ChoiceCard`/`ActionBar` so the brothers' console clears the same bar.
- Wire the funnel client-side event union (`slot_pick`, `request_submit`) to the calendar/intake once the surfaces mount in the live funnel page (server allowlist already added in Plan 1 Task 5).
