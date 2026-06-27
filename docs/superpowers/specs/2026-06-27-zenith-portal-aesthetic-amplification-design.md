# Zenith Portal Aesthetic Amplification — Design Spec

**Date:** 2026-06-27
**Surface:** `Zenith/` (Next.js 15 booking front end; reimagined design, exempt from legacy Katha brand guards per Jed 2026-06-27)
**Author:** CC (Claude Code) with Jed approval
**Status:** Approved approach A; entering council loop → writing-plans → TDD

---

## 1. Problem

The Zenith **landing page** (`Zenith/app/page.tsx`, 810 LOC) is production-quality: GSAP cinematic bridge, scroll-pinned horizontal gallery, sticky-anchor pricing tiers, deep z-depth drawer, brutalist success state. It is wired end-to-end to `submitBooking` → Supabase `leads` insert → Resend operator email.

The Zenith **portal route** (`Zenith/app/portal/[id]/template-design/page.tsx`, 87 LOC) is a stub: 8 hardcoded placeholder presets with fake slot geometry, no GSAP motion, a basic modal, no calendar, no tier comparison, no upload, no confirmation. The gap between landing-page craft and portal craft is the entire scope of this spec.

A booking pipeline gap-fix landed in the same commit chain (this turn): addons now persist to Supabase, sender is `hello@kathabooth.com`, portal token is wired to the real returned `lead.id`. The portal route now needs to receive that `lead.id` as `params.id` and resolve the lead from Supabase.

Concurrently, the canonical **wordmark** was reconciled this turn — the previous `KathaWordmark.tsx` included 50+ extra potrace paths from foundry specimen text that squashed the aspect ratio. The component now ships exactly 5 paths (k-a-t-h-a) in viewBox `0 -10 1640 580`, matching the canonical `wordmark-obsidian.png` / `wordmark-ecru.png` source.

## 2. Goal

Bring the Zenith portal route to design parity with the landing page, in two phases:

- **Phase 1 (this spec):** A teaser/interest-grabber. Packages lead. 6 best-commissioned templates (1 per layout format) auto-curated. Visual availability calendar with real blocked-date checks. Drawer-driven flow reusing the landing page's z-depth pattern. Page-level CRO that does not duplicate the landing page's pitch.
- **Phase 2 (future spec):** Final-draft surface with full 82-preset catalog (responsive grid 4→2→1), filters, customization panel, reference photo upload. Built on top of Phase 1's primitives.

This spec covers Phase 1 only. Phase 2 stacks cleanly.

## 3. Locked Decisions (Jed-confirmed 2026-06-27)

| # | Decision |
|---|---|
| 1 | **Two-phase build.** Phase 1 = teaser; Phase 2 = full catalog. |
| 2 | **Packages first.** The 4 tiers (Signature/Editorial/Modernist/Monochrome) lead the portal page above templates. |
| 3 | **Drawer-driven flow.** Reuse the landing page's deep z-depth drawer (`#app` scales down, blurs, greys; drawer slides in from right). Tier click *or* template click → drawer opens. |
| 4 | **Visual calendar with blocked dates.** Month-view component checking a Supabase `booked_dates` table. Blocked dates rendered struck/greyed and unselectable. |
| 5 | **Auto-curated 6 featured.** Programmatic pick: first preset of each layout format × style tier, yielding ~6 templates without hardcoded IDs or a Supabase featured flag. |
| 6 | **Brand-mark canonization.** Purge all non-canonical logos and wordmarks across the repo; the only living marks are the polished `KathaWordmark` + `KathaLogomark` Zenith components plus their canonical PNG sources. |
| 7 | **Real FH Ronaldson fonts.** The `fh-ronaldson-display-test-cdnfonts/` OTF folder (Display + Text + Condensed, 30 weights) replaces the `fonts.cdnfonts.com` `@import` demo currently in `page.tsx`. Self-host via `next/font/local`. |
| 8 | **Zenith brand-guard exemption holds.** Zenith is exempt from legacy palette tokens, type stack, forbidden-hex, `npm run guard`, and `brass-ring-enforcer`. Judge on its own design merit. |

## 4. Architecture

### 4.1 Route shape

```
Zenith/app/
├── page.tsx                              # Landing (unchanged — already shipped)
├── actions.ts                            # submitBooking + submitInquiry (gap-fixed this turn)
├── layout.tsx                            # NEW: registers next/font/local for FH Ronaldson
├── components/
│   ├── KathaWordmark.tsx                 # POLISHED this turn (5 paths, correct ratio)
│   ├── KathaLogomark.tsx                 # KEEP (unchanged in this spec)
│   ├── ZDrawer.tsx                       # NEW: extracted z-depth drawer primitive (shared)
│   ├── AvailabilityCalendar.tsx          # NEW: month-view with blocked dates
│   ├── TierCard.tsx                      # NEW: tier comparison card
│   └── FeaturedTemplateRow.tsx           # NEW: horizontal row of 6 templates
└── portal/
    └── [id]/
        └── template-design/
            ├── page.tsx                  # REWRITTEN: Phase 1 SPA orchestrator
            └── actions.ts                # NEW: getLead, getBookedDates, finalizeBooking
```

### 4.2 Data flow

```
Landing submitBooking() → leads INSERT → returns lead.id
                                            │
                                            ▼
                         router.push(/portal/{lead.id}/template-design)
                                            │
                                            ▼
Portal page.tsx (Server Component shell)
  ├── getLead(params.id) ──→ Supabase leads SELECT by id
  ├── getBookedDates() ────→ Supabase booked_dates SELECT (next 18 mo)
  └── PRESETS.featured() ──→ pure derivation from lib/templates.ts
                                            │
                                            ▼
PortalClient (single 'use client' orchestrator)
  ├── Tier section          (4 tier cards)
  ├── Featured templates    (6 cards from auto-curation)
  ├── ZDrawer (state)       reuses landing pattern
  │   ├── Step 1: Tier + template summary
  │   ├── Step 2: AvailabilityCalendar (blocks unavailable)
  │   ├── Step 3: Final confirm / notes textarea
  │   └── Step 4: Brutalist Dark success card
  └── footer (wordmark)
```

### 4.3 Supabase schema additions

```sql
-- migrations/<timestamp>_booked_dates.sql
create table booked_dates (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  reason text,                              -- 'booked' | 'blocked' | 'holiday'
  created_at timestamptz default now()
);
create index booked_dates_date_idx on booked_dates (date);

-- Read policy: public can read (the calendar needs them); writes are service-role only.
alter table booked_dates enable row level security;
create policy "anyone can read booked dates"
  on booked_dates for select using (true);
-- No insert/update/delete policy → only service_role can mutate.
```

The `leads` table needs new optional columns to record the final selection during portal finalization (separate from the lead's first-touch insert from the landing page):

```sql
alter table leads
  add column if not exists final_template_id text,
  add column if not exists final_date date,
  add column if not exists notes text,
  add column if not exists finalized_at timestamptz;
```

The portal does NOT overwrite the initial `tier_selected` / `template_selected` / `event_date` fields from the landing-page submit. Finalization layers on top.

### 4.4 Featured-preset auto-curation

`Zenith/lib/templates.ts` exports `PRESETS: PhotoboothPreset[]`. The featured selector is a pure derivation:

```ts
// Zenith/lib/featured.ts
import { PRESETS, PhotoboothPreset } from './templates';

const FORMATS = ['strip', 'postcard-vertical', 'postcard'] as const;

export function getFeaturedPresets(): PhotoboothPreset[] {
  const out: PhotoboothPreset[] = [];
  for (const fmt of FORMATS) {
    const signature = PRESETS.find(p => p.type === fmt && p.name.includes('Signature'));
    const classic   = PRESETS.find(p => p.type === fmt && !p.name.includes('Signature'));
    if (signature) out.push(signature);
    if (classic)   out.push(classic);
  }
  return out; // up to 6 — 3 formats × 2 tiers
}
```

Pure, testable, deterministic. No hardcoded IDs, no DB lookup, no featured flag. If the catalog grows or shrinks the featured set adapts automatically. Phase 2 may replace this with a curated array; the call site is one import.

### 4.5 Z-depth drawer primitive

The landing page's drawer logic in `Zenith/app/page.tsx` (the `body.drawer { #app scale + blur + grey }` CSS + the GSAP `expo.out` slide-in) is extracted to `Zenith/app/components/ZDrawer.tsx` so the portal can reuse it identically without copy-paste drift. The landing page swaps to the shared primitive in the same PR — single source of truth.

```ts
// ZDrawer.tsx
type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;          // default 600
  align?: 'right' | 'left'; // default 'right'
};
```

Implementation reuses:
- `body.drawer` class toggle for the `#app` scale/blur effect
- GSAP `gsap.to('.drawer-container', ...)` slide motion with `expo.out` easing
- `prefers-reduced-motion` branch using `gsap.set` to skip animation
- Backdrop overlay click-to-close

### 4.6 Availability calendar

```ts
// AvailabilityCalendar.tsx
type Props = {
  blockedDates: string[];              // ISO YYYY-MM-DD
  value: string | null;
  onChange: (date: string | null) => void;
  minDate?: string;                    // default today + 30 days (lead time)
  maxDate?: string;                    // default today + 18 months
};
```

Behaviour:
- Renders one month at a time with prev/next navigation
- Blocked dates render struck-through, lower opacity, not clickable
- Past dates and dates outside [minDate, maxDate] also unselectable
- Selected date renders with Loko Rust `#882D17` fill (sacred CTA color reused as the one accent)
- Keyboard nav: arrow keys move the day cursor, Enter selects
- `prefers-reduced-motion` → skip month-transition slide
- ARIA: `role="grid"`, `aria-label` on month, day buttons `aria-pressed` and `aria-disabled`

No external calendar lib (avoid the react-day-picker / react-datepicker weight); ~250 LOC of native React + Intl.DateTimeFormat.

### 4.7 Tier cards

Reuse the landing page's tier card markup and `tiersData` constants. Extract to `TierCard.tsx` so both surfaces consume the same component. Includes the "Flagship" ribbon on Editorial, hover-lift on `:hover`, and the `.tier-cta` reveal pattern.

### 4.8 Featured-template row

Horizontal flex row (NOT scroll-pinned — the landing page already owns that motif; Phase 1 portal uses a simple flex row that wraps on mobile). 6 cards using the existing `Print` component from the landing page — which already correctly renders preset slots via `resolveLayout(t.layoutId, t.type)` and the `VIEWBOX` map. Click on a card sets `lead.template` and opens the drawer at step 1.

### 4.9 Drawer steps

```
Step 1 — Summary       │ Selected tier + selected template (one or both can be null)
                       │ "Continue to date" CTA (disabled until at least one is chosen)
                       │
Step 2 — Date          │ AvailabilityCalendar
                       │ "Continue" CTA (disabled until date chosen)
                       │
Step 3 — Notes         │ Optional textarea for "anything we should know"
                       │ Loko Rust "Reserve Your Date" sacred CTA
                       │
Step 4 — Success       │ Brutalist Dark card matching landing's success state
                       │ "Status: Secured" header, optional "View Details" link
```

Step state lives in a single `useReducer` in `PortalClient` so back-button-within-drawer is trivial. Drawer close discards step state.

### 4.10 Portal finalization action

```ts
// portal/[id]/template-design/actions.ts
'use server';

export async function finalizeBooking(leadId: string, payload: {
  final_template_id: string | null;
  final_date: string;
  notes?: string;
}) {
  const { error } = await supabaseAdmin
    .from('leads')
    .update({ ...payload, finalized_at: new Date().toISOString() })
    .eq('id', leadId);
  if (error) return { success: false, error: error.message };

  // Operator notification — separate from the landing-page operator email
  if (resend) {
    await resend.emails.send({
      from: 'Katha Booth <hello@kathabooth.com>',
      to: 'kathabooth@gmail.com',
      subject: `📌 Booking Finalized: ${leadId}`,
      html: `<p>Lead ${leadId} finalized template + date.</p><pre>${JSON.stringify(payload, null, 2)}</pre>`,
    });
  }
  return { success: true };
}
```

## 5. Brand-Mark Purge

Living marks (KEEP):
- `Zenith/app/components/KathaWordmark.tsx` (polished this turn)
- `Zenith/app/components/KathaLogomark.tsx`
- `photobooth-template-studio/public/brand/brand/wordmark-{obsidian,ecru}.png` (canonical raster sources for traceability)
- `photobooth-template-studio/public/brand/brand/logo-{obsidian,ecru}.png` (canonical raster sources for traceability)

Purge (DELETE):
- `photobooth-template-studio/public/brand/wordmark.svg`
- `photobooth-template-studio/public/brand/wordmark.png`
- `photobooth-template-studio/public/brand/wordmark-traditional.jpeg`
- `photobooth-template-studio/public/brand/katha-wordmark-transparent.png`
- `photobooth-template-studio/public/brand/katha-wordmark-cream.png`
- `photobooth-template-studio/public/brand/katha-wordmark-cream.svg`
- `photobooth-template-studio/public/brand/new-wordmark.png`
- `photobooth-template-studio/public/brand/wordmark-final.svg`
- `photobooth-template-studio/public/brand/wordmark_paths.txt`
- `photobooth-template-studio/public/components/KathaWordmark.tsx` (broken EOF heredoc artifact)
- `photobooth-template-studio/public/brand/logomark.png`
- `photobooth-template-studio/public/brand/logomark.pbm`
- `photobooth-template-studio/public/brand/logomark.svg`
- `photobooth-template-studio/public/brand/logomark-final.svg`
- `photobooth-template-studio/public/brand/logomark_paths.txt`
- `photobooth-template-studio/public/brand/new-logomark.png`
- `photobooth-template-studio/public/components/KathaLogomark.tsx`
- `photobooth-template-studio/public/brand/brand/logo-paint.png` (paint draft, superseded)
- `gemini_draft/components/marks/KathaWordmark.tsx`
- `gemini_draft/components/marks/KathaLogomark.tsx`

For each delete: grep the repo for imports of the path; if any tracked file still imports the deleted artifact, fix the import to point at the Zenith canonical component (cross-package import via path or a small re-export) BEFORE deleting. The purge is part of the same PR, not a separate sweep.

## 6. Real FH Ronaldson Fonts

The landing page currently does `@import url('https://fonts.cdnfonts.com/css/fh-ronaldson-display-test')` inside an inline `<style>` block. Three problems: (1) external dependency on a font CDN with no SLA, (2) the demo CSS may pull a different weight set than what's licensed, (3) layout shift while the CSS loads.

Replacement:

```ts
// Zenith/app/layout.tsx
import localFont from 'next/font/local';

const fhRonaldsonDisplay = localFont({
  src: [
    { path: '../public/fonts/fh-ronaldson/FHRonaldsonDisplayTest-Light.otf',       weight: '300', style: 'normal' },
    { path: '../public/fonts/fh-ronaldson/FHRonaldsonDisplayTest-LightItalic.otf', weight: '300', style: 'italic' },
    { path: '../public/fonts/fh-ronaldson/FHRonaldsonDisplayTest-Regular.otf',     weight: '400', style: 'normal' },
    { path: '../public/fonts/fh-ronaldson/FHRonaldsonDisplayTest-RegularItalic.otf', weight: '400', style: 'italic' },
    { path: '../public/fonts/fh-ronaldson/FHRonaldsonDisplayTest-Medium.otf',      weight: '500', style: 'normal' },
    { path: '../public/fonts/fh-ronaldson/FHRonaldsonDisplayTest-SemiBold.otf',    weight: '600', style: 'normal' },
    { path: '../public/fonts/fh-ronaldson/FHRonaldsonDisplayTest-Bold.otf',        weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-fh-ronaldson-display',
});

const fhRonaldsonText = localFont({ /* same shape for Text */ variable: '--font-fh-ronaldson-text' });
```

**File-system move (one-shot):** `mv fh-ronaldson-display-test-cdnfonts/*.otf Zenith/public/fonts/fh-ronaldson/`, then rename to drop the BunnyCDN hash suffix (`FHRonaldsonDisplayTest-Regular-BF65139a6a2f8e8.otf` → `FHRonaldsonDisplayTest-Regular.otf`). The `fh-ronaldson-display-test-cdnfonts/` directory is removed afterward.

**page.tsx update:** Replace the `@import` inside `CSS` constant with the CSS variables:

```ts
const F = {
  d: "var(--font-fh-ronaldson-display), serif",
  b: "'Cormorant', serif",                        // unchanged
  m: "'Courier Prime', monospace",                // unchanged
};
```

Cormorant + Courier Prime stay on Google Fonts via the existing `@import` because no local files were delivered for those.

## 7. CRO (non-redundant with landing page)

Landing already sells the brand. The portal must convert. Specific CRO mechanics for Phase 1:

- **Above-fold trust line:** Lead ID echoed back as `"Inquiry #" + last 6 of lead.id` in tracked caps, communicates "you are now in the system."
- **Time-to-respond expectation:** Small line under the tier section: "We respond within 24 hours · Southern California only" — manages anxiety without overpromising.
- **Visible date scarcity:** The calendar's blocked dates ARE the CRO — visible scarcity drives commitment without fake countdowns.
- **Sticky drawer CTA:** While the drawer is open, the primary action is sticky to the bottom of the drawer panel (not the viewport) — always visible without scroll hunting.
- **No second-rust:** Only one Loko Rust button per visible viewport (sacred CTA discipline carries over from the landing page's design language even though the brand-guard is off).
- **Success state continues motion:** The brutalist success card reuses the landing's "Status: Secured" pattern, with a "We've sent a confirmation to {email}" line for closure.

## 8. Motion

Reused from landing without re-design:
1. **Drawer open/close** — GSAP `expo.out` 0.7s slide; backdrop `power2.out` 0.6s fade
2. **Tier card hover** — `translateY(-4px)` + border-color shift via CSS transition

NEW for portal:
3. **Step transition inside drawer** — opacity crossfade 0.3s; reduced-motion → instant swap
4. **Calendar month nav** — slide 0.4s horizontal between months; reduced-motion → instant
5. **Date-cell hover** — subtle background lift (CSS only, no JS)

All transforms/opacity only. No layout-property animation. `prefers-reduced-motion` honored at every callsite.

## 9. Anti-patterns

- No second hero — the landing IS the hero. The portal is the conversion surface.
- No "wizard" naming, in components or copy.
- No new gradient effects (the landing's grain + barong texture stays; portal inherits the same background layer).
- No emoji in body copy.
- No fake stats / fabricated reviews.
- No external font CDN dependencies for the FH Ronaldson stack.
- No second-instance of Loko Rust per viewport.

## 10. Testing strategy

- **Unit:** `getFeaturedPresets()` returns 6 items, one per (format × tier) combo, deterministic order.
- **Unit:** `AvailabilityCalendar` blocked dates are non-clickable; selected state survives month navigation.
- **Unit:** `ZDrawer` body-class toggle, focus-trap, escape-to-close.
- **Integration:** Portal page renders without error when `params.id` is invalid (404 path), valid (happy path), and DB-down (graceful empty state).
- **E2E (Playwright):** Land → submit landing form → routed to `/portal/{id}/template-design` → tier + template + date selected → finalize → success card visible.
- **Visual regression:** Screenshot the portal at desktop + mobile widths before/after the rewrite to catch unintended shifts.

## 11. Migration plan

PR landed in this order to keep main shippable at each commit:

1. **Wordmark canonicalization** — already done this turn
2. **Pipeline gap fixes** — already done this turn (addons, sender, lead.id wiring)
3. **Brand-mark purge + cross-package import fixes** — single commit, no behaviour change
4. **FH Ronaldson local fonts** — move OTFs into `Zenith/public/fonts/fh-ronaldson/`, register in `layout.tsx`, swap `page.tsx` to CSS variable, delete `@import`
5. **Extract `ZDrawer`, `TierCard`** from landing page — refactor, no behaviour change, both surfaces consume them
6. **Supabase migrations** — `booked_dates` table + RLS + new `leads` columns + sample blocked-date seed
7. **Portal Phase 1 build** — new `PortalClient`, new `AvailabilityCalendar`, new `FeaturedTemplateRow`, new `finalizeBooking` action
8. **Council loop + E2E verification + screenshots**
9. **Memory entrainment** — see §13

Phase 2 (deferred) covers the full catalog grid + customization panel + reference upload.

## 12. Council loop

Per Jed's directive (memory entry 2026-06-22: "DOGFEED the three CLIs"), this spec routes through:

- **Gemini (Vertex)** — opinion on the calendar UX, blocked-date semantics, and the drawer step machine
- **Codex (Ollama qwen2.5-coder)** — adversarial review of the SQL migration + RLS policy + the featured-preset selector
- **agy** — bulk file execution for the brand-mark purge sweep (delete + cross-package import fix) once the spec is approved; agy never reviews its own work
- **CC (Opus chairman)** — owns the deterministic verify gate via `.agents/skills/antigravity/verdict.sh`; never delegates judgment

Council voices report back to CC. Disagreements are surfaced to Jed. Only Jed approves canon changes.

## 13. Memory entrainment (vault writes after spec approval)

The following memory entries land in `/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/memory.md`:

- **`[2026-06-27] project-fact`** — FH Ronaldson local fonts: `Zenith/public/fonts/fh-ronaldson/` is the canonical OTF source. The Display, Text, and Condensed families are all licensed-as-delivered in 30 weights. Do NOT re-introduce the `fonts.cdnfonts.com` `@import` demo — it pulls a different/limited set and is an unmanaged external dep. Use `next/font/local` via `Zenith/app/layout.tsx`. Variable: `--font-fh-ronaldson-display`. **Why:** the demo CDN is a single point of failure and the wrong weight set; we have real licensed files on disk.

- **`[2026-06-27] project-fact`** — Brand-mark purge: the only living "katha" marks in the repo are `Zenith/app/components/KathaWordmark.tsx` (5-path canonical, polished 2026-06-27) and `Zenith/app/components/KathaLogomark.tsx`. Their raster sources (`wordmark-{obsidian,ecru}.png`, `logo-{obsidian,ecru}.png`) live under `photobooth-template-studio/public/brand/brand/` for traceability. All other wordmark/logomark files were deleted by this PR. **Why:** Jed's brand vision is supreme + Zenith is exempt from legacy guards; the proliferation of `wordmark-*.svg`, `katha-wordmark-cream.png`, etc. was past-direction drift and a foot-gun for future agents. **How to apply:** when a future task asks for "the wordmark," use `<KathaWordmark />` from `Zenith/app/components/`. Do not search `public/brand/` for a different variant — there is no other.

- **`[2026-06-27] decision`** — Zenith portal Phase 1 design locked: drawer-driven, packages first, visual calendar with blocked dates (Supabase `booked_dates`), 6 auto-curated featured templates (1 per layout format × style tier). Phase 2 (full 82-preset catalog + filters + customization) is deferred. Spec: `docs/superpowers/specs/2026-06-27-zenith-portal-aesthetic-amplification-design.md`.

## 14. Open questions for Jed (post-spec)

- **Lead time floor:** Default `minDate = today + 30 days` for the calendar — confirm or change to a different floor (e.g. 60 days for peak season).
- **Booked-date seeding:** Is there a current list of already-blocked dates (existing bookings) to import into the new table at migration time?
- **Operator finalization email subject:** Spec uses `📌 Booking Finalized: {leadId}` — emoji OK in operator-facing subject line, or strip?

These do not block the build — they have safe defaults and can be tuned post-launch.
