# Zenith Portal Aesthetic Amplification — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the Zenith portal route (`/portal/[id]/template-design`) to design parity with the landing page — packages-first 4-tier comparison, 6 auto-curated featured templates, visual availability calendar against a Supabase `booked_dates` table, drawer-driven flow reusing the landing page's z-depth primitive — while canonicalizing brand marks and self-hosting the FH Ronaldson font family.

**Architecture:** Single SPA route under `app/portal/[id]/template-design/`. Server Component fetches lead + booked dates from Supabase, hands off to a Client orchestrator. Drawer + tier card are extracted into shared primitives so both surfaces consume one component. Featured-preset selector is a pure derivation from `lib/templates.ts`. Calendar is hand-rolled to avoid a 50KB+ library dependency.

**Tech Stack:** Next.js 15 (App Router) · React 19 · Supabase (`@supabase/supabase-js`) · GSAP 3 · Resend · `next/font/local` for FH Ronaldson · Vitest + happy-dom (new this plan) for unit tests · Playwright via the local `playwright-cli` skill for E2E.

**Reference spec:** [docs/superpowers/specs/2026-06-27-zenith-portal-aesthetic-amplification-design.md](../specs/2026-06-27-zenith-portal-aesthetic-amplification-design.md)

**Council loop (locked):** codex=`qwen2.5-coder:7b` (Ollama) · agy=`Gemini 3.5 Flash (Low)` · copilot=`gpt-5-mini` (auto-mode). All env-var defaults in [.agents/skills/antigravity/scripts/council.sh](../../../.agents/skills/antigravity/scripts/council.sh).

---

## File Structure

**New files (Phase 1):**

| Path | Responsibility |
|---|---|
| `Zenith/lib/featured.ts` | Pure: `getFeaturedPresets()` derives 6 featured from `PRESETS` |
| `Zenith/lib/featured.test.ts` | Unit tests for featured selector |
| `Zenith/lib/calendar-logic.ts` | Pure: month grid, isBlocked, isInRange (no React) |
| `Zenith/lib/calendar-logic.test.ts` | Unit tests for calendar pure helpers |
| `Zenith/app/components/ZDrawer.tsx` | Shared z-depth drawer primitive (landing + portal) |
| `Zenith/app/components/TierCard.tsx` | Shared tier comparison card |
| `Zenith/app/components/AvailabilityCalendar.tsx` | Month-view calendar with blocked dates |
| `Zenith/app/components/FeaturedTemplateRow.tsx` | Phase-1 horizontal row of 6 templates |
| `Zenith/app/portal/[id]/template-design/actions.ts` | `getLead`, `getBookedDates`, `finalizeBooking` |
| `Zenith/app/portal/[id]/template-design/PortalClient.tsx` | Client orchestrator + step reducer |
| `Zenith/public/fonts/fh-ronaldson/` | OTF files moved from `fh-ronaldson-display-test-cdnfonts/` |
| `Zenith/vitest.config.ts` | Test runner config |
| `supabase/migrations/<ts>_booked_dates.sql` | New table + RLS + new `leads` columns |

**Modified files:**

| Path | Change |
|---|---|
| `Zenith/app/layout.tsx` | Register FH Ronaldson via `next/font/local`; expose CSS variable |
| `Zenith/app/page.tsx` | Swap inline `@import` for `var(--font-fh-ronaldson-display)`; consume shared `ZDrawer` + `TierCard` |
| `Zenith/app/portal/[id]/template-design/page.tsx` | Rewrite as Server Component shell |
| `Zenith/package.json` | Add `vitest`, `happy-dom`, `@vitejs/plugin-react`, `test` script |
| `photobooth-template-studio/components/Header.tsx` + any other import sites of purged marks | Rewrite imports to Zenith canonical components, or replace with raster |

**Purged files (per spec §5):** see Task 2 for the full list.

---

## Task 1 — Set up test infrastructure

**Files:**
- Modify: `Zenith/package.json`
- Create: `Zenith/vitest.config.ts`
- Create: `Zenith/lib/__smoke__/sanity.test.ts`

- [ ] **Step 1: Install vitest + happy-dom**

```bash
cd Zenith && npm install --save-dev vitest happy-dom @vitejs/plugin-react
```

Expected: lockfile updated, no errors.

- [ ] **Step 2: Create vitest config**

Create `Zenith/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['lib/**/*.test.{ts,tsx}', 'app/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

- [ ] **Step 3: Add `test` script to package.json**

Edit `Zenith/package.json` `scripts`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Write a sanity test that must pass**

Create `Zenith/lib/__smoke__/sanity.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('test infrastructure', () => {
  it('runs vitest', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run tests and verify GREEN**

```bash
cd Zenith && npm test
```

Expected: 1 passed, exit 0.

- [ ] **Step 6: Commit**

```bash
git add Zenith/package.json Zenith/package-lock.json Zenith/vitest.config.ts Zenith/lib/__smoke__/sanity.test.ts
git commit -m "test(zenith): add vitest + happy-dom for unit tests"
```

---

## Task 2 — Brand-mark purge

**Files:**
- Delete: 20 files listed below
- Modify: any tracked file that imports a purged path (search-and-fix)

- [ ] **Step 1: Capture the import-site baseline**

```bash
cd /Users/jedg./Desktop/kat_ha_pb
grep -rEn "(wordmark|logomark|KathaWordmark|KathaLogomark|katha-wordmark|logo-paint)" \
  --include="*.tsx" --include="*.ts" --include="*.html" --include="*.css" --include="*.md" \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=Zenith \
  | grep -v "^docs/" | tee /tmp/zenith-purge-imports.txt
```

Expected: a list of all import/reference sites OUTSIDE Zenith. Review the file before deleting anything.

- [ ] **Step 2: For each import found in step 1, decide rewrite vs raster**

For each line in `/tmp/zenith-purge-imports.txt`:
- If the consumer is a Next.js component → rewrite to import from `Zenith/app/components/Katha{Word,Logo}mark.tsx` (cross-package via relative path or path alias).
- If the consumer is HTML/Squarespace/email template → swap to a `<img>` pointing at `photobooth-template-studio/public/brand/brand/{wordmark,logo}-{obsidian,ecru}.png` (the canonical raster — stays for traceability).

Apply rewrites BEFORE deleting source files. Run `grep -rn <deleted-path>` after each rewrite to confirm zero remaining references.

- [ ] **Step 3: Delete the 20 purged files**

```bash
cd /Users/jedg./Desktop/kat_ha_pb
rm -v photobooth-template-studio/public/brand/wordmark.svg
rm -v photobooth-template-studio/public/brand/wordmark.png
rm -v photobooth-template-studio/public/brand/wordmark-traditional.jpeg
rm -v photobooth-template-studio/public/brand/katha-wordmark-transparent.png
rm -v photobooth-template-studio/public/brand/katha-wordmark-cream.png
rm -v photobooth-template-studio/public/brand/katha-wordmark-cream.svg
rm -v photobooth-template-studio/public/brand/new-wordmark.png
rm -v photobooth-template-studio/public/brand/wordmark-final.svg
rm -v photobooth-template-studio/public/brand/wordmark_paths.txt
rm -v photobooth-template-studio/public/components/KathaWordmark.tsx
rm -v photobooth-template-studio/public/brand/logomark.png
rm -v photobooth-template-studio/public/brand/logomark.pbm
rm -v photobooth-template-studio/public/brand/logomark.svg
rm -v photobooth-template-studio/public/brand/logomark-final.svg
rm -v photobooth-template-studio/public/brand/logomark_paths.txt
rm -v photobooth-template-studio/public/brand/new-logomark.png
rm -v photobooth-template-studio/public/components/KathaLogomark.tsx
rm -v photobooth-template-studio/public/brand/brand/logo-paint.png
rm -v gemini_draft/components/marks/KathaWordmark.tsx
rm -v gemini_draft/components/marks/KathaLogomark.tsx
```

Expected: 20 confirmations, no errors.

- [ ] **Step 4: Verify zero remaining imports of the purged paths**

```bash
cd /Users/jedg./Desktop/kat_ha_pb
grep -rEn "(wordmark|logomark|katha-wordmark)" \
  --include="*.tsx" --include="*.ts" --include="*.html" --include="*.css" \
  --exclude-dir=node_modules --exclude-dir=.next \
  | grep -vE "(Zenith/|wordmark-(obsidian|ecru)\.png|logo-(obsidian|ecru)\.png|katha-wordmark.*\.md)" \
  | head -20
```

Expected: empty output (only Zenith components + canonical PNGs + docs/specs match).

- [ ] **Step 5: Type-check the photobooth-template-studio still compiles**

```bash
cd photobooth-template-studio && npx tsc --noEmit 2>&1 | tail -10
```

Expected: no errors mentioning the purged paths.

- [ ] **Step 6: Commit**

```bash
cd /Users/jedg./Desktop/kat_ha_pb
git add -A
git commit -m "chore: purge non-canonical brand marks; Zenith components are sole source"
```

---

## Task 3 — FH Ronaldson local fonts

**Files:**
- Move: `fh-ronaldson-display-test-cdnfonts/*.otf` → `Zenith/public/fonts/fh-ronaldson/`
- Modify: `Zenith/app/layout.tsx`
- Modify: `Zenith/app/page.tsx`
- Delete: `fh-ronaldson-display-test-cdnfonts/` (empty after move)

- [ ] **Step 1: Create the target directory and move + rename OTFs**

```bash
cd /Users/jedg./Desktop/kat_ha_pb
mkdir -p Zenith/public/fonts/fh-ronaldson
for f in fh-ronaldson-display-test-cdnfonts/*.otf; do
  base=$(basename "$f")
  clean=$(echo "$base" | sed -E 's/-BF[0-9a-f]+\.otf$/.otf/')
  mv "$f" "Zenith/public/fonts/fh-ronaldson/$clean"
done
ls Zenith/public/fonts/fh-ronaldson/
```

Expected: 30 files, all named without the `-BF65...` hash (e.g. `FHRonaldsonDisplayTest-Regular.otf`).

- [ ] **Step 2: Remove the now-empty source directory**

```bash
rmdir fh-ronaldson-display-test-cdnfonts
```

Expected: no error (directory must be empty).

- [ ] **Step 3: Update layout.tsx to register the local font**

Replace `Zenith/app/layout.tsx` contents:

```tsx
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const fhRonaldsonDisplay = localFont({
  src: [
    { path: '../public/fonts/fh-ronaldson/FHRonaldsonDisplayTest-Light.otf',        weight: '300', style: 'normal' },
    { path: '../public/fonts/fh-ronaldson/FHRonaldsonDisplayTest-LightItalic.otf',  weight: '300', style: 'italic' },
    { path: '../public/fonts/fh-ronaldson/FHRonaldsonDisplayTest-Regular.otf',      weight: '400', style: 'normal' },
    { path: '../public/fonts/fh-ronaldson/FHRonaldsonDisplayTest-RegularItalic.otf', weight: '400', style: 'italic' },
    { path: '../public/fonts/fh-ronaldson/FHRonaldsonDisplayTest-Medium.otf',       weight: '500', style: 'normal' },
    { path: '../public/fonts/fh-ronaldson/FHRonaldsonDisplayTest-SemiBold.otf',     weight: '600', style: 'normal' },
    { path: '../public/fonts/fh-ronaldson/FHRonaldsonDisplayTest-Bold.otf',         weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-fh-ronaldson-display',
});

export const metadata: Metadata = {
  title: 'Katha Booth — Booking',
  description: 'Heritage photo booth installations · Southern California',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fhRonaldsonDisplay.variable}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Swap the page.tsx font reference**

In `Zenith/app/page.tsx`:

Find:
```ts
@import url('https://fonts.cdnfonts.com/css/fh-ronaldson-display-test');
```
Delete this line from the `CSS` constant.

Find:
```ts
const F = {
  d: "'FH Ronaldson Display Test', serif",
```
Replace with:
```ts
const F = {
  d: "var(--font-fh-ronaldson-display), serif",
```

- [ ] **Step 5: Type-check and build**

```bash
cd Zenith && npx tsc --noEmit && npm run build 2>&1 | tail -20
```

Expected: tsc exit 0; `next build` finishes with no warnings about font loading.

- [ ] **Step 6: Visual smoke — verify the wordmark renders in dev**

```bash
cd Zenith && npm run dev
```

Open `http://localhost:3000` in chrome-devtools MCP. Confirm the headline uses FH Ronaldson (not a fallback serif). Take a screenshot, attach to the commit message.

- [ ] **Step 7: Commit**

```bash
git add Zenith/public/fonts/fh-ronaldson/ Zenith/app/layout.tsx Zenith/app/page.tsx
git commit -m "feat(zenith): self-host FH Ronaldson via next/font/local, kill cdnfonts @import"
```

---

## Task 4 — Extract ZDrawer primitive

**Files:**
- Create: `Zenith/app/components/ZDrawer.tsx`
- Create: `Zenith/app/components/ZDrawer.test.tsx`
- Modify: `Zenith/app/page.tsx` (consume shared component)

- [ ] **Step 1: Write the failing test**

Create `Zenith/app/components/ZDrawer.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ZDrawer } from './ZDrawer';

describe('ZDrawer', () => {
  it('renders children when open', () => {
    render(<ZDrawer open={true} onClose={() => {}}><div>panel content</div></ZDrawer>);
    expect(screen.getByText('panel content')).toBeTruthy();
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(<ZDrawer open={true} onClose={onClose}><div /></ZDrawer>);
    fireEvent.click(screen.getByTestId('zdrawer-overlay'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('adds body.drawer class when open', () => {
    render(<ZDrawer open={true} onClose={() => {}}><div /></ZDrawer>);
    expect(document.body.classList.contains('drawer')).toBe(true);
  });

  it('removes body.drawer class when closed', () => {
    const { rerender } = render(<ZDrawer open={true} onClose={() => {}}><div /></ZDrawer>);
    rerender(<ZDrawer open={false} onClose={() => {}}><div /></ZDrawer>);
    expect(document.body.classList.contains('drawer')).toBe(false);
  });
});
```

- [ ] **Step 2: Install testing-library**

```bash
cd Zenith && npm install --save-dev @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Run the test to verify it FAILS with "Cannot find module './ZDrawer'"**

```bash
cd Zenith && npm test -- ZDrawer
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement ZDrawer**

Create `Zenith/app/components/ZDrawer.tsx`:

```tsx
'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

type ZDrawerProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
  align?: 'right' | 'left';
};

export function ZDrawer({ open, onClose, children, width = 600, align = 'right' }: ZDrawerProps) {
  useEffect(() => {
    if (open) document.body.classList.add('drawer');
    else document.body.classList.remove('drawer');
    return () => document.body.classList.remove('drawer');
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (open) {
        gsap.to('.zdrawer-container', { x: '0%', duration: 0.7, ease: 'expo.out' });
        gsap.to('.zdrawer-overlay', { opacity: 1, duration: 0.6, ease: 'power2.out' });
      } else {
        gsap.to('.zdrawer-container', { x: align === 'right' ? '100%' : '-100%', duration: 0.7, ease: 'expo.out' });
        gsap.to('.zdrawer-overlay', { opacity: 0, duration: 0.6, ease: 'power2.out' });
      }
    });
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('.zdrawer-container', { x: open ? '0%' : align === 'right' ? '100%' : '-100%' });
      gsap.set('.zdrawer-overlay', { opacity: open ? 1 : 0 });
    });
  }, [open, align]);

  const sideStyle = align === 'right' ? { right: 0 } : { left: 0 };
  const initialX = align === 'right' ? '100%' : '-100%';

  return (
    <>
      <div
        data-testid="zdrawer-overlay"
        className="zdrawer-overlay"
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.55)', opacity: 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      />
      <div
        className="zdrawer-container"
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed', top: 0, bottom: 0, ...sideStyle,
          width: '100%', maxWidth: width,
          background: '#3D352E', zIndex: 301, overflowY: 'auto',
          transform: `translateX(${initialX})`,
          boxShadow: align === 'right' ? '-60px 0 120px rgba(0,0,0,0.9)' : '60px 0 120px rgba(0,0,0,0.9)',
        }}
      >
        {children}
      </div>
    </>
  );
}
```

- [ ] **Step 5: Run tests, verify all 4 PASS**

```bash
cd Zenith && npm test -- ZDrawer
```

Expected: 4 passed.

- [ ] **Step 6: Swap the landing page to use ZDrawer**

In `Zenith/app/page.tsx`:
- Import: `import { ZDrawer } from './components/ZDrawer';`
- Find the `drawer-overlay` + `drawer-container` divs near the bottom of the JSX (lines ~747-806).
- Replace those two divs with `<ZDrawer open={drawer} onClose={closeDrawer}> ... existing inner content ... </ZDrawer>`.
- Remove the now-duplicated GSAP `useGSAP` block that animates the drawer (the ZDrawer owns it).

- [ ] **Step 7: Type-check + manual smoke**

```bash
cd Zenith && npx tsc --noEmit && npm run dev
```

Open localhost, click "Inquire Now", confirm the drawer slides in and the `#app` blurs identically to before.

- [ ] **Step 8: Commit**

```bash
git add Zenith/app/components/ZDrawer.tsx Zenith/app/components/ZDrawer.test.tsx Zenith/app/page.tsx Zenith/package.json Zenith/package-lock.json
git commit -m "refactor(zenith): extract ZDrawer primitive, shared landing + portal"
```

---

## Task 5 — Extract TierCard primitive

**Files:**
- Create: `Zenith/lib/tiers.ts` (data extracted from page.tsx)
- Create: `Zenith/app/components/TierCard.tsx`
- Modify: `Zenith/app/page.tsx` (consume shared component + data)

- [ ] **Step 1: Extract tier data to a shared module**

Create `Zenith/lib/tiers.ts`:

```ts
export type Tier = {
  id: 'Signature' | 'Editorial' | 'Modernist' | 'Monochrome';
  price: number;
  flagship?: boolean;
  booth: 'Oak' | 'White';
  formats: string;
  blurb: string;
};

export const TIERS: Tier[] = [
  { id: 'Signature',  price: 949,  booth: 'Oak',   formats: '2×6 or 4×6', blurb: 'Weathered oak booth, DSLR capture, archival cotton prints handed over in the room.' },
  { id: 'Editorial',  price: 1149, booth: 'Oak',   formats: '4×6', flagship: true, blurb: 'The full build — oak booth, refined black-and-white retouching, every print hand-finished.' },
  { id: 'Modernist',  price: 749,  booth: 'White', formats: '2×6 or 4×6', blurb: 'The white shell booth, built for galleries, lofts, and modern rooms.' },
  { id: 'Monochrome', price: 949,  booth: 'White', formats: '4×6', blurb: 'The white booth tuned for high-contrast black-and-white, razor frames that last.' },
];

export const ADDONS: Record<string, number> = {
  'Heirloom Guestbook': 150,
  'Extra Hour of Service': 200,
  'Custom Backdrop': 250,
};
```

- [ ] **Step 2: Create TierCard component**

Create `Zenith/app/components/TierCard.tsx`:

```tsx
'use client';

import type { Tier } from '@/lib/tiers';

const N = { l2: '#3D352E', l3: '#4A4139', hi: '#ECE7DB', mut: '#AAA8A2', fnt: '#8F8C8A', loko: '#882D17', ln: 'rgba(236, 231, 219, 0.12)' };
const F = { d: "var(--font-fh-ronaldson-display), serif", b: "'Cormorant', serif", m: "'Courier Prime', monospace" };

type Props = {
  tier: Tier;
  selected: boolean;
  onSelect: () => void;
};

export function TierCard({ tier, selected, onSelect }: Props) {
  const accent = tier.booth === 'Oak' ? N.loko : N.fnt;
  return (
    <div
      className={`tier-card ${selected ? 'selected' : ''} ${tier.flagship ? 'tier-flag' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
      style={{
        position: 'relative', background: N.l2, border: `1px solid ${N.ln}`, padding: '32px 36px',
        display: 'flex', flexDirection: 'column', gap: 16,
        transition: 'transform .4s cubic-bezier(.16,1,.3,1), border-color .4s, background .4s',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
        <div>
          <div style={{ fontFamily: F.d, fontWeight: 300, fontSize: 30, color: N.hi, lineHeight: 1.05 }}>{tier.id}</div>
          <span style={{ fontFamily: F.m, fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: 10, display: 'inline-block', color: accent }}>
            {tier.booth === 'Oak' ? '◆ ' : ''}{tier.booth} Booth · {tier.formats}
          </span>
        </div>
        <div style={{ fontFamily: F.d, fontWeight: 300, fontSize: 34, color: N.hi, whiteSpace: 'nowrap', lineHeight: 1 }}>
          ${tier.price.toLocaleString()}
        </div>
      </div>
      <p style={{ fontFamily: F.b, fontStyle: 'italic', fontSize: 19, lineHeight: 1.55, paddingBottom: '4px', color: N.mut, maxWidth: '42ch' }}>
        {tier.blurb}
      </p>
      <span className="tier-cta">{selected ? 'Selected' : 'Select Package'}</span>
    </div>
  );
}
```

- [ ] **Step 3: Swap page.tsx to use TIERS data + TierCard**

In `Zenith/app/page.tsx`:
- Import: `import { TIERS, ADDONS } from '@/lib/tiers'; import { TierCard } from './components/TierCard';`
- Delete the inline `tiersData` and `addonsData` constants.
- Update `calcTotal` to use `TIERS.find(t => t.id === calcTier)?.price ?? 0` and `ADDONS[a[0]]`.
- Replace the 4 inline tier-card divs with `{TIERS.map(t => <TierCard key={t.id} tier={t} selected={calcTier === t.id} onSelect={() => setCalcTier(t.id)} />)}`.

- [ ] **Step 4: Type-check + manual smoke**

```bash
cd Zenith && npx tsc --noEmit && npm run dev
```

Open localhost, scroll to pricing, click each tier, confirm selection state + price updates work identically.

- [ ] **Step 5: Commit**

```bash
git add Zenith/lib/tiers.ts Zenith/app/components/TierCard.tsx Zenith/app/page.tsx
git commit -m "refactor(zenith): extract TierCard + TIERS data, shared landing + portal"
```

---

## Task 6 — Supabase migration: booked_dates + leads columns

**Files:**
- Create: `supabase/migrations/20260627120000_booked_dates_and_finalize.sql`

- [ ] **Step 1: Create the migration file**

```bash
mkdir -p /Users/jedg./Desktop/kat_ha_pb/supabase/migrations
```

Create `supabase/migrations/20260627120000_booked_dates_and_finalize.sql`:

```sql
-- New table: booked_dates
create table if not exists public.booked_dates (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  reason text,
  created_at timestamptz default now()
);

create index if not exists booked_dates_date_idx on public.booked_dates (date);

alter table public.booked_dates enable row level security;

drop policy if exists "anyone can read booked dates" on public.booked_dates;
create policy "anyone can read booked dates"
  on public.booked_dates for select using (true);

-- No insert/update/delete policy → only service_role can mutate.

-- New leads columns for portal finalization
alter table public.leads
  add column if not exists final_template_id text,
  add column if not exists final_date date,
  add column if not exists notes text,
  add column if not exists finalized_at timestamptz;
```

- [ ] **Step 2: Apply the migration to the linked Supabase project**

Via the Supabase MCP tool `apply_migration` with project `hvvomiyskizxzhyytcfd` and the SQL above. The MCP confirms apply or returns an error.

- [ ] **Step 3: Verify schema with `list_tables`**

Via `mcp__af07fb99...__list_tables` with `schemas: ["public"]`. Confirm `booked_dates` row appears and `leads` has the 4 new columns.

- [ ] **Step 4: Seed two sample blocked dates for development**

Via `execute_sql`:

```sql
insert into public.booked_dates (date, reason) values
  ('2026-07-04', 'holiday'),
  ('2026-12-31', 'holiday')
on conflict (date) do nothing;
```

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260627120000_booked_dates_and_finalize.sql
git commit -m "feat(supabase): add booked_dates table + leads finalize columns"
```

---

## Task 7 — Featured-preset selector (TDD)

**Files:**
- Create: `Zenith/lib/featured.ts`
- Create: `Zenith/lib/featured.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `Zenith/lib/featured.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getFeaturedPresets } from './featured';
import { PRESETS } from './templates';

describe('getFeaturedPresets', () => {
  it('returns up to 6 presets', () => {
    const result = getFeaturedPresets();
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(6);
  });

  it('returns at most one Signature and one Classic per format', () => {
    const result = getFeaturedPresets();
    const counts = new Map<string, { sig: number; cls: number }>();
    for (const p of result) {
      const c = counts.get(p.type) ?? { sig: 0, cls: 0 };
      if (p.name.includes('Signature')) c.sig++; else c.cls++;
      counts.set(p.type, c);
    }
    for (const [, c] of counts) {
      expect(c.sig).toBeLessThanOrEqual(1);
      expect(c.cls).toBeLessThanOrEqual(1);
    }
  });

  it('covers all available formats present in PRESETS', () => {
    const formats = new Set(PRESETS.map(p => p.type));
    const resultFormats = new Set(getFeaturedPresets().map(p => p.type));
    for (const f of formats) {
      expect(resultFormats.has(f)).toBe(true);
    }
  });

  it('is deterministic across calls', () => {
    const a = getFeaturedPresets().map(p => p.id);
    const b = getFeaturedPresets().map(p => p.id);
    expect(a).toEqual(b);
  });
});
```

- [ ] **Step 2: Run, verify FAIL ("Cannot find module './featured'")**

```bash
cd Zenith && npm test -- featured
```

Expected: FAIL.

- [ ] **Step 3: Implement the selector**

Create `Zenith/lib/featured.ts`:

```ts
import { PRESETS, type PhotoboothPreset } from './templates';

const FORMATS = ['strip', 'postcard-vertical', 'postcard'] as const;

export function getFeaturedPresets(): PhotoboothPreset[] {
  const out: PhotoboothPreset[] = [];
  for (const fmt of FORMATS) {
    const signature = PRESETS.find(p => p.type === fmt && p.name.includes('Signature'));
    const classic   = PRESETS.find(p => p.type === fmt && !p.name.includes('Signature'));
    if (signature) out.push(signature);
    if (classic)   out.push(classic);
  }
  return out;
}
```

- [ ] **Step 4: Run, verify all 4 tests PASS**

```bash
cd Zenith && npm test -- featured
```

Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add Zenith/lib/featured.ts Zenith/lib/featured.test.ts
git commit -m "feat(zenith): getFeaturedPresets pure selector with unit tests"
```

---

## Task 8 — Calendar logic helpers (TDD)

**Files:**
- Create: `Zenith/lib/calendar-logic.ts`
- Create: `Zenith/lib/calendar-logic.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `Zenith/lib/calendar-logic.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildMonthGrid, isBlocked, isInRange, formatISO } from './calendar-logic';

describe('formatISO', () => {
  it('formats a Date to YYYY-MM-DD UTC', () => {
    expect(formatISO(new Date(Date.UTC(2026, 6, 4)))).toBe('2026-07-04');
  });
});

describe('buildMonthGrid', () => {
  it('returns 42 cells (6 weeks × 7 days)', () => {
    expect(buildMonthGrid(2026, 6).length).toBe(42);
  });

  it('first cell is a Sunday', () => {
    expect(buildMonthGrid(2026, 6)[0].getUTCDay()).toBe(0);
  });

  it('contains July 1 2026 (Wednesday) at index 3', () => {
    const grid = buildMonthGrid(2026, 6); // July (0-indexed month: 6)
    expect(formatISO(grid[3])).toBe('2026-07-01');
  });
});

describe('isBlocked', () => {
  it('returns true when date is in blocked list', () => {
    expect(isBlocked('2026-07-04', ['2026-07-04', '2026-12-31'])).toBe(true);
  });
  it('returns false when not in list', () => {
    expect(isBlocked('2026-07-05', ['2026-07-04'])).toBe(false);
  });
});

describe('isInRange', () => {
  it('returns true when iso is between min and max inclusive', () => {
    expect(isInRange('2026-08-15', '2026-07-27', '2027-12-27')).toBe(true);
  });
  it('returns false when before min', () => {
    expect(isInRange('2026-07-01', '2026-07-27', '2027-12-27')).toBe(false);
  });
  it('returns false when after max', () => {
    expect(isInRange('2028-01-01', '2026-07-27', '2027-12-27')).toBe(false);
  });
});
```

- [ ] **Step 2: Run, verify FAIL**

```bash
cd Zenith && npm test -- calendar-logic
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the helpers**

Create `Zenith/lib/calendar-logic.ts`:

```ts
export function formatISO(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function buildMonthGrid(year: number, month: number): Date[] {
  const first = new Date(Date.UTC(year, month, 1));
  const firstDow = first.getUTCDay();
  const start = new Date(Date.UTC(year, month, 1 - firstDow));
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    cells.push(new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + i)));
  }
  return cells;
}

export function isBlocked(iso: string, blocked: string[]): boolean {
  return blocked.includes(iso);
}

export function isInRange(iso: string, minIso: string, maxIso: string): boolean {
  return iso >= minIso && iso <= maxIso;
}
```

- [ ] **Step 4: Run, verify all 8 tests PASS**

```bash
cd Zenith && npm test -- calendar-logic
```

Expected: 8 passed.

- [ ] **Step 5: Commit**

```bash
git add Zenith/lib/calendar-logic.ts Zenith/lib/calendar-logic.test.ts
git commit -m "feat(zenith): pure calendar grid + block/range helpers with tests"
```

---

## Task 9 — AvailabilityCalendar component

**Files:**
- Create: `Zenith/app/components/AvailabilityCalendar.tsx`

- [ ] **Step 1: Implement the component**

Create `Zenith/app/components/AvailabilityCalendar.tsx`:

```tsx
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
```

- [ ] **Step 2: Type-check**

```bash
cd Zenith && npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add Zenith/app/components/AvailabilityCalendar.tsx
git commit -m "feat(zenith): AvailabilityCalendar with blocked/range/keyboard support"
```

---

## Task 10 — FeaturedTemplateRow

**Files:**
- Create: `Zenith/app/components/FeaturedTemplateRow.tsx`
- Modify: `Zenith/app/page.tsx` (extract Print + Tag so portal can import them)

- [ ] **Step 1: Extract the `Print` and `Tag` components from page.tsx**

In `Zenith/app/page.tsx`, find the `function Print(...)` and `function Tag(...)` definitions (around lines 208-230).

Move both into a new file `Zenith/app/components/PrintCard.tsx`:

```tsx
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
```

In `page.tsx`, delete the inline definitions and add `import { Print, Tag } from './components/PrintCard';`

- [ ] **Step 2: Create FeaturedTemplateRow**

Create `Zenith/app/components/FeaturedTemplateRow.tsx`:

```tsx
'use client';

import { Print, Tag } from './PrintCard';
import { VIEWBOX } from '@/lib/layouts';
import type { PhotoboothPreset } from '@/lib/templates';

const N = { l2: '#3D352E', hi: '#ECE7DB', fnt: '#8F8C8A', shadow: 'rgba(0,0,0,0.85)', glass: 'rgba(255,255,255,0.03)' };
const F = { d: 'var(--font-fh-ronaldson-display), serif', m: "'Courier Prime', monospace" };

type Props = {
  presets: PhotoboothPreset[];
  selectedId: string | null;
  onSelect: (preset: PhotoboothPreset) => void;
};

export function FeaturedTemplateRow({ presets, selectedId, onSelect }: Props) {
  return (
    <div style={{ display: 'flex', gap: 32, overflowX: 'auto', padding: '32px 0', scrollbarWidth: 'none' }}>
      {presets.map(t => {
        const style = t.name.includes('Signature') ? 'Signature' : 'Classic';
        const formatLabel = t.type === 'strip' ? '2×6 Strip' : (t.type === 'postcard-vertical' ? '4×6 Postcard' : '6×4 Landscape');
        const vb = VIEWBOX[t.type as keyof typeof VIEWBOX];
        const printHeight = vb.h > vb.w ? 240 : 160;
        const sel = selectedId === t.id;
        return (
          <div
            key={t.id}
            onClick={() => onSelect(t)}
            role="button"
            tabIndex={0}
            aria-pressed={sel}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(t); } }}
            style={{ flexShrink: 0, cursor: 'pointer', transition: 'transform .6s cubic-bezier(.16,1,.3,1)' }}
          >
            <div style={{
              background: N.l2, borderTop: `1px solid ${sel ? N.hi : N.glass}`,
              padding: '32px 20px 24px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
              boxShadow: `0 24px 60px ${N.shadow}`,
            }}>
              <Print t={t} height={printHeight} />
              <div style={{ textAlign: 'center' }}>
                <Tag style={style} />
                <h3 style={{ fontFamily: F.d, fontSize: 20, fontWeight: 300, color: N.hi, marginTop: 8, marginBottom: 4 }}>{t.name}</h3>
                <p style={{ fontFamily: F.m, fontSize: 8.5, letterSpacing: '0.1em', color: N.fnt }}>{formatLabel}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Type-check + commit**

```bash
cd Zenith && npx tsc --noEmit
git add Zenith/app/components/PrintCard.tsx Zenith/app/components/FeaturedTemplateRow.tsx Zenith/app/page.tsx
git commit -m "refactor(zenith): extract PrintCard + add FeaturedTemplateRow for portal"
```

---

## Task 11 — Portal server-side actions

**Files:**
- Create: `Zenith/app/portal/[id]/template-design/actions.ts`

- [ ] **Step 1: Create the actions module**

Create `Zenith/app/portal/[id]/template-design/actions.ts`:

```ts
'use server';

import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export type Lead = {
  id: string;
  name: string | null;
  email: string | null;
  event_date: string | null;
  venue_name: string | null;
  tier_selected: string | null;
  template_selected: string | null;
  final_template_id: string | null;
  final_date: string | null;
  notes: string | null;
  finalized_at: string | null;
};

export async function getLead(id: string): Promise<Lead | null> {
  const { data, error } = await supabaseAdmin.from('leads').select('*').eq('id', id).maybeSingle();
  if (error) { console.error('getLead:', error); return null; }
  return (data as Lead) ?? null;
}

export async function getBookedDates(): Promise<string[]> {
  const { data, error } = await supabaseAdmin.from('booked_dates').select('date');
  if (error) { console.error('getBookedDates:', error); return []; }
  return (data ?? []).map((r: { date: string }) => r.date);
}

export async function finalizeBooking(leadId: string, payload: {
  final_template_id: string | null;
  final_date: string;
  notes?: string;
}) {
  try {
    const { error } = await supabaseAdmin
      .from('leads')
      .update({ ...payload, finalized_at: new Date().toISOString() })
      .eq('id', leadId);
    if (error) throw new Error(error.message);

    if (resend) {
      await resend.emails.send({
        from: 'Katha Booth <hello@kathabooth.com>',
        to: 'kathabooth@gmail.com',
        subject: `Booking Finalized: ${leadId}`,
        html: `<p>Lead ${leadId} finalized template + date.</p><pre>${JSON.stringify(payload, null, 2)}</pre>`,
      });
    }
    return { success: true };
  } catch (error: any) {
    console.error('finalizeBooking:', error);
    return { success: false, error: error.message };
  }
}
```

- [ ] **Step 2: Type-check + commit**

```bash
cd Zenith && npx tsc --noEmit
git add Zenith/app/portal/[id]/template-design/actions.ts
git commit -m "feat(zenith): portal server actions getLead/getBookedDates/finalizeBooking"
```

---

## Task 12 — PortalClient orchestrator

**Files:**
- Create: `Zenith/app/portal/[id]/template-design/PortalClient.tsx`

- [ ] **Step 1: Implement the client orchestrator**

Create `Zenith/app/portal/[id]/template-design/PortalClient.tsx`:

```tsx
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
  const [state, dispatch] = useReducer(reducer, {
    step: 'summary',
    tier: lead.tier_selected,
    template: featured.find(p => p.name === lead.template_selected) ?? null,
    date: null,
    notes: '',
  });

  const closeDrawer = () => { setDrawerOpen(false); setTimeout(() => dispatch({ type: 'goto', value: 'summary' }), 600); };

  const openWithTier = (tier: string) => { dispatch({ type: 'set-tier', value: tier }); setDrawerOpen(true); };
  const openWithTemplate = (preset: PhotoboothPreset) => { dispatch({ type: 'set-template', value: preset }); setDrawerOpen(true); };

  const submit = async () => {
    if (!state.date) return;
    setSubmitting(true);
    const res = await finalizeBooking(lead.id, {
      final_template_id: state.template?.id ?? null,
      final_date: state.date,
      notes: state.notes || undefined,
    });
    setSubmitting(false);
    if (res.success) dispatch({ type: 'goto', value: 'success' });
    else console.error(res.error);
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
        <p style={{ fontFamily: F.m, fontSize: 9.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: N.loko, marginBottom: 12 }}>Welcome, {lead.name ?? 'Friend'}</p>
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
              <button
                onClick={submit}
                disabled={submitting}
                style={{ marginTop: 32, width: '100%', padding: 16, background: N.loko, color: N.hi, border: `1px solid ${N.loko}`, fontFamily: F.m, fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: submitting ? 'wait' : 'pointer' }}>
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
                We've sent a confirmation to {lead.email}. Expect a follow-up within 24 hours.
              </p>
            </div>
          )}
        </div>
      </ZDrawer>
    </div>
  );
}
```

- [ ] **Step 2: Type-check + commit**

```bash
cd Zenith && npx tsc --noEmit
git add Zenith/app/portal/[id]/template-design/PortalClient.tsx
git commit -m "feat(zenith): PortalClient orchestrator with step reducer + drawer"
```

---

## Task 13 — Rewrite portal Server Component

**Files:**
- Modify: `Zenith/app/portal/[id]/template-design/page.tsx` (full rewrite)

- [ ] **Step 1: Rewrite page.tsx as Server Component**

Replace `Zenith/app/portal/[id]/template-design/page.tsx` with:

```tsx
import { notFound } from 'next/navigation';
import { getLead, getBookedDates } from './actions';
import { getFeaturedPresets } from '@/lib/featured';
import { PortalClient } from './PortalClient';

export default async function PortalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [lead, blockedDates] = await Promise.all([
    getLead(id),
    getBookedDates(),
  ]);
  if (!lead) notFound();
  const featured = getFeaturedPresets();
  return <PortalClient lead={lead} featured={featured} blockedDates={blockedDates} />;
}
```

- [ ] **Step 2: Type-check + build**

```bash
cd Zenith && npx tsc --noEmit && npm run build 2>&1 | tail -15
```

Expected: tsc exit 0; build succeeds; `/portal/[id]/template-design` listed as a server route.

- [ ] **Step 3: Run vitest, confirm zero regressions**

```bash
cd Zenith && npm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add Zenith/app/portal/[id]/template-design/page.tsx
git commit -m "feat(zenith): rewrite portal as Server Component shell wired to PortalClient"
```

---

## Task 14 — Manual E2E smoke test

**Files:** none (verification only)

- [ ] **Step 1: Start dev server**

```bash
cd Zenith && npm run dev
```

- [ ] **Step 2: Land → submit landing form → portal redirect**

Use chrome-devtools MCP (`mcp__chrome-devtools__navigate_page`):
1. Navigate to `http://localhost:3000`
2. Click "Inquire Now" (top nav)
3. Fill: name, email, today + 60 days, venue
4. Submit
5. On success card, click "Proceed to Portal →"
6. Confirm URL is `/portal/{uuid}/template-design` (UUID, not a random token)

- [ ] **Step 3: Verify portal renders correctly**

Confirm visually:
- Wordmark in nav uses the polished 5-glyph mark
- "Welcome, {name}" greeting matches landing submission
- 4 tier cards display with prices
- 6 featured templates render with real preset geometry
- "Inquiry #" shows last 6 of lead.id

- [ ] **Step 4: Click a tier → drawer flow**

1. Click "Signature" tier card → drawer opens at "Your Selection" step
2. Click "Continue to Date" → calendar shows
3. Confirm July 4 2026 + Dec 31 2026 are struck-through (seeded blocked dates)
4. Pick a valid date → "Continue" → notes step
5. Skip notes → "Reserve Your Date" → success card "Status: Secured"

- [ ] **Step 5: Verify Supabase update**

Via Supabase MCP `execute_sql`:
```sql
select id, final_template_id, final_date, notes, finalized_at from leads order by created_at desc limit 1;
```

Expected: `final_date` matches what was picked; `finalized_at` is the timestamp from the test run.

- [ ] **Step 6: Screenshot proof**

Use `mcp__chrome-devtools__take_screenshot` for: landing, portal landing, drawer at calendar step, success card. Save under `tasks/2026-06-27-portal-e2e/` for the verification PR.

---

## Task 15 — Council loop review

**Files:** none (review only)

- [ ] **Step 1: Bundle the diff as a council blob**

```bash
cd /Users/jedg./Desktop/kat_ha_pb
mkdir -p .orchestration/zenith-portal-phase1/blob
git diff main...HEAD -- Zenith/ supabase/ > .orchestration/zenith-portal-phase1/blob/diff.txt
```

- [ ] **Step 2: Run the council**

```bash
bash .agents/skills/antigravity/scripts/council.sh zenith-portal-phase1 \
  .orchestration/zenith-portal-phase1/blob/diff.txt --repo . --timeout 300
```

Expected: `.orchestration/zenith-portal-phase1/council/council.json` exists with at least one OK voice.

- [ ] **Step 3: CC (you) chair the synthesis**

Read `codex.out`, `agy.out`, `copilot.out`. For each concrete concern raised:
- If it's a real defect → fix it in a follow-up commit
- If it's a stylistic preference inconsistent with the spec → reject and document why
- If it's a defense-in-depth suggestion outside Phase 1 scope → file as a Phase 2 backlog note in the spec

- [ ] **Step 4: Apply fixes from chairman synthesis**

Make a commit per fix:
```bash
git commit -m "fix(zenith): <council finding>"
```

- [ ] **Step 5: Re-run tests + build**

```bash
cd Zenith && npm test && npm run build
```

Expected: all green.

---

## Task 16 — Memory entrainment + handoff

**Files:**
- Append: `/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/memory.md`

- [ ] **Step 1: Append the ship entry**

```bash
cat >> "/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/memory.md" <<'EOF'

[2026-06-27] project-fact - Zenith Portal Phase 1 SHIPPED. /portal/[id]/template-design now wires the real Supabase lead.id (from the landing-page submitBooking insert) into a Server Component shell + PortalClient orchestrator. Tiers comparison + 6 auto-curated featured templates + visual availability calendar (booked_dates table, public-read RLS) + drawer-driven 4-step flow. ZDrawer + TierCard extracted to shared primitives consumed by both landing and portal. FH Ronaldson now self-hosted via next/font/local at Zenith/public/fonts/fh-ronaldson/ (30 weights, OTF) — the fonts.cdnfonts.com @import is gone. Brand-mark purge removed 20 stale wordmark/logomark files; Zenith/app/components/Katha{Word,Logo}mark.tsx are the sole living marks. **Why:** closing the portal gap was the last major design debt vs the landing page; brand-mark + font canonicalization removes foot-guns for future agents. **How to apply:** Phase 2 (full 82-preset catalog + customization + reference upload) is the next planned build; it stacks on top of these primitives.
EOF
```

- [ ] **Step 2: Sync session handoff**

```bash
bash .agents/skills/handoff/sync.sh
```

- [ ] **Step 3: Final ship commit**

```bash
git push origin feat/orchestration-layer-v1
```

Expected: push succeeds (or surfaces the upstream config if missing — handle per Jed direction).

---

## Self-Review

**Spec coverage:**
- §3 Locked Decision 1 (two-phase) → Task 13 + future-Phase-2 note in §11
- §3 Decision 2 (packages first) → Task 12 PortalClient JSX ordering
- §3 Decision 3 (drawer-driven) → Tasks 4 + 12
- §3 Decision 4 (visual calendar with blocked dates) → Tasks 6 + 8 + 9
- §3 Decision 5 (auto-curated 6) → Task 7
- §3 Decision 6 (brand-mark purge) → Task 2
- §3 Decision 7 (FH Ronaldson local) → Task 3
- §3 Decision 8 (Zenith guard exemption) → not codified in tasks; nothing to change
- §4.5 ZDrawer → Task 4
- §4.6 AvailabilityCalendar → Tasks 8 + 9
- §4.7 TierCards → Task 5
- §4.8 FeaturedTemplateRow → Task 10
- §4.9 Drawer steps → Task 12
- §4.10 finalizeBooking → Task 11
- §10 Testing strategy → vitest unit tests in Tasks 1, 4, 7, 8 + E2E in Task 14
- §12 Council loop → Task 15
- §13 Memory entrainment → Task 16

**Placeholder scan:** No `TBD`, `TODO`, or "fill in" patterns. All code blocks contain final code.

**Type consistency:** `Lead`, `Tier`, `PhotoboothPreset` types used consistently across Tasks 5, 7, 10, 11, 12, 13. `Step` enum + `Action` discriminated union match the reducer's `goto` actions in Task 12.

**One pre-existing gap:** Task 1's `@testing-library/react` install is moved from Task 4 (it logically belongs in test infra setup). Already addressed: Task 4 includes it. Tradeoff: an extra dep install on Task 4 commit. Acceptable.

---

## Execution Handoff

Plan complete and saved to [docs/superpowers/plans/2026-06-27-zenith-portal-aesthetic-amplification.md](../plans/2026-06-27-zenith-portal-aesthetic-amplification.md). Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Best for a 16-task plan like this one.
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints. More token-efficient but slower wall-clock.

Which approach?
