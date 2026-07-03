# KATHA BOOTH — Booking Experience PRD
### The "Roasted Archive" Unified Booking Flow · v1.1 (One-Shot Build Spec)

> **Author:** Claude (Opus 4.8) for Jed / Katha Atelier
> **Date:** 2026-07-02
> **Intended executor:** **Fable 5** (`claude-fable-5`), single-pass ("one-shot") build.
> **Status:** Ready to execute. Business facts pinned in §13; confirm before the *live* cutover.
> **v1.2 — real data wired.** v1.1 hardened the spec via a 5-lens adversarial audit. v1.2 replaces placeholders with **Jed's real inputs**: the actual tier catalog + add-ons (scraped from `client.kathabooth.com`), the live Supabase project (`hvvomiyskizxzhyytcfd`, verified schema), and a new **availability admin portal** (backend + RLS already created) replacing the block-list. §13 records what's resolved vs still needs Jed.

---

## 0. HOW TO USE THIS DOCUMENT

There are two readers.

**If you are Jed:** Read §1–§3 and §13 (Open Decisions). Confirm/adjust the four business facts in §13. Then paste the prompt in [`FABLE5_ONESHOT_PROMPT.md`](./FABLE5_ONESHOT_PROMPT.md) into a fresh Fable 5 session. That prompt points Fable 5 back at *this* file plus the three prototype files.

**If you are Fable 5:** This is your complete build spec. Everything you need is inline — tokens, copy, pricing, motion timings, acceptance criteria. **Do not improvise brand decisions.** Where a value is given, use it exactly. Where §13 marks something "PLACEHOLDER — confirm," keep the given default and wire it so it is trivially swappable (one constant, one comment). Build to the **Definition of Done** in §12; you are expected to self-verify against it before declaring done.

**Canonical source of truth for the *current* design** = the three prototype files, in this order of authority:
1. `/Users/jedg./Desktop/kat_ha_pb/katha-booking-html/1_booking_intake.html`
2. `/Users/jedg./Desktop/kat_ha_pb/katha-booking-html/2_template_customizer.html`
3. `/Users/jedg./Desktop/kat_ha_pb/katha-booking-html/3_confirmation_ticket.html`

**IGNORE** `/Users/jedg./Desktop/kat_ha_pb/DESIGN.md` — it is a stale, superseded light-theme ("ATELIER / Forest + Cream") spec. It does **not** describe this product. The tokens in §4 of this PRD are canonical.

---

## 1. PROBLEM STATEMENT

Katha Booth (a Southern-California / Manila luxury photo-booth atelier) has a **beautiful but broken** prototype: three separately-deployed static HTML pages on Vercel (`katha-booking-html.vercel.app`). Each page is individually gorgeous — a dark "Roasted Archive" aesthetic with cinematic GSAP motion — but as a **product** it does not hold together:

- **The three pages are disconnected.** Data does not carry. A client enters "Full Name / date / tier" on Page 1, then Page 2 shows a hardcoded "LORENZO & CORAZON / OCTOBER 15, 2026 · MANILA", and Page 3 shows a hardcoded "$949 Signature / #8D49F03B" regardless of what was chosen. The confirmation is theater, not a receipt.
- **Nothing is submitted.** Page 1's "submit" calls `e.preventDefault()`, fakes a random ID, and animates a success screen. No lead is captured. For a *live client-facing booking site*, this is the critical failure — inquiries are lost.
- **Availability is fake.** The calendar is hardcoded to October 2026 with arbitrary blocked days. It never reflects real booked dates.
- **Fidelity gaps block launch.** No `prefers-reduced-motion` fallback (violates the locked Quiet-Luxury motion law), thin mobile/responsive handling, no keyboard/ARIA support, contrast risk on the light ticket, layout shift on font load, and a CDN Tailwind + CDN font mix that is slow and fragile.

**In one sentence:** we have three static mockups; we need one *seamless, functional, accessible, launch-grade* booking experience that actually captures the lead and reflects the client's real choices — without losing an ounce of the existing craft.

---

## 2. GOALS & NON-GOALS

### 2.1 Goals (this build)
- **G1 — Unify:** Merge intake → customizer → confirmation into **one seamless flow** with shared state, using the existing cinematic shutter transition as the between-step device.
- **G2 — Make it real:** The confirmation ticket must reflect the *client's actual selections* (name, date, tier, price, add-ons, title/subtitle, palette). A real lead must be captured on submit.
- **G3 — Elevate to launch fidelity:** Enforce the Quiet-Luxury motion law, tighten type/spacing, fill every hover/focus/empty/error/loading state.
- **G4 — Accessibility + Responsive + Performance:** Keyboard-navigable, ARIA-correct, WCAG AA contrast, mobile-first, zero layout shift, self-hosted fonts, no render-blocking CDN surprises.
- **G5 — Launch on Vercel** at the existing `katha-booking-html` project, client-ready.

### 2.2 Non-Goals (explicitly out of scope this pass)
- **N1 — No full Next.js/React port now.** The port is spec'd in **Appendix A** for a *later* session; do not attempt it in this one-shot.
- **N2 — No payment processing / deposits.** This captures an inquiry/booking request; money is handled off-platform by Katha.
- **N3 — No auth / client accounts / login.**
- **N4 — No general admin dashboard / CMS.** The **one** admin surface in scope is the lightweight **availability admin portal** (`admin.html`, §7.7) for Jed & his brother to set open dates. Pricing/tier content is managed in `content.json`, not a UI.
- **N5 — No new brand invention.** Use only the tokens, type, motion, and copy defined here and in the prototype. No new colors, no new fonts, no AI-slop gradients/shadows.
- **N6 — No reference-photo upload, no per-template style notes** (those are Zenith Phase 2, tracked separately).

---

## 3. PRODUCT OVERVIEW & TARGET ARCHITECTURE

### 3.1 The end state
A **single self-contained page** — `index.html` — that presents a **3-step booking flow** in one continuous experience:

```
┌──────────────────────────────────────────────────────────────┐
│  STEP 1 · INTAKE          STEP 2 · DESIGN         STEP 3 · TICKET │
│  Tiers · Add-ons ·        Format · Title/Sub ·    Confirmed voucher│
│  Availability · Contact   Palette · Live proof    (real data)      │
│         │  shutter close/open  │  shutter close/open  │            │
│         └─────────►───────────►└─────────►───────────►            │
└──────────────────────────────────────────────────────────────┘
              one shared STATE object flows left → right
```

- One in-memory `STATE` object (§7) is the single source of truth; every step reads/writes it.
- The **shutter transition** (already built on Page 1) becomes the *step-change device*: on "next," the shutters close, the DOM swaps to the next step, the shutters part. On "back," the reverse.
- The confirmation ticket (Step 3) is **rendered from `STATE`** — real name, date, tier, price, add-ons, title/subtitle, palette — not hardcoded.
- On reaching Step 3, the lead has already been **persisted** (§7.4) — submission happens at the Step 1→2 boundary (the "Secure Dates & Begin Design" moment), which matches the existing button copy and the business reality (the date is what needs securing).

### 3.2 Why single-file (not 3 files + storage), and why static (not React now)
- **Single-file** eliminates the cross-page state problem at the root: state is just a JS object, no `sessionStorage` serialization, no page-reload flashes, no font re-fetch between steps. It also makes the shutter a *true* transition rather than a navigation. This is the **lowest-risk path to a reliable one-shot** and the most seamless UX.
- **Static (this pass)** keeps Fable 5's one-shot inside a domain it can nail: no build config, no SSR/RLS/type mismatches. The React/Supabase port is real and wanted — it is fully spec'd in **Appendix A** for a follow-up session, so nothing is lost.
- The old `1_/2_/3_` files are **archived, not deleted** (move to `katha-booking-html/_archive/`) so the deployed URLs and history survive.

### 3.3 Tech constraints

**⚠ Tailwind is load-bearing — read carefully.** The runtime Tailwind Play CDN (`https://cdn.tailwindcss.com`) is a render-blocking JS dependency we want gone for a production/live site — BUT the prototypes define **zero** layout utilities in their own `<style>` blocks. The *entire* layout (the `lg:grid-cols-12` / `col-span-7|5` split, every `flex`/`items-center`/`justify-between`, `sticky top-28`, `backdrop-blur-xl`, all `sm:`/`md:`/`lg:` responsive prefixes, and the shutter-blade geometry `fixed w-[50vw] h-screen z-[1000] bg-[#110F0D]`) is produced by the CDN's JIT at runtime. **Naively deleting the CDN collapses the page to an unstyled single column and breaks the shutter.** So:
- **Preferred path:** precompile Tailwind **once** into a static `styles.css` (Tailwind CLI: `npx tailwindcss -i ./src.css -o ./styles.css --minify` with a `content` glob over `index.html`) and link that — no runtime JS, every class still resolves. If you hand-author instead, you must reproduce **all** used utilities, not "a handful": the 12-col grid + `col-span` at `lg`, `flex`/alignment, `sticky`, the `sm/md/lg` breakpoints, and the shutter-blade fixed/50vw/`100dvh`/z-index/border classes.
- **Acceptable fallback (do NOT hand-port partially):** if precompiling isn't feasible in the pass, **keep the CDN** rather than shipping a half-ported broken layout — and flag "Tailwind CDN still present" as a known perf follow-up in your final report. A working layout beats a broken "CDN-free" one.
- GSAP stays (CDN acceptable) but `defer` it.

**Fonts.**
- **FH Ronaldson:** already self-hosted at `./fonts/fh-ronaldson/` — but as **`.otf`** (not `woff2`). Reuse the existing `@font-face` block. `<link rel="preload">` the 1–2 above-the-fold weights (Regular/Light) — and note these are OTF, larger than woff2; that's the current reality.
- **Fraunces / Outfit / Courier Prime:** the `woff2` files **do not exist in this repo** (`./fonts/` contains only `fh-ronaldson/`). A one-shot cannot fetch binary font files. **DEFAULT: keep the Google Fonts `<link>`** with `font-display: swap` + the existing preconnect. Self-hosting these three is a **follow-up requiring Jed to add the `woff2` files** (§13-D) — do **not** `@font-face` at non-existent local paths (that ships broken display type). Do not fail the DoD over this; report it.

---

## 4. CANONICAL DESIGN SYSTEM (exact — do not deviate)

### 4.1 Color tokens (the "Roasted Archive" palette)
Use these CSS custom properties verbatim. These are the living tokens from the prototype.

```css
:root {
  /* Surfaces — darkest → lifted */
  --color-l0:  #110F0D;  /* Kamagong — page background (deepest ebony) */
  --color-l1:  #1A1714;  /* Dark Abacá — containers/cards */
  --color-l2:  #241F1B;  /* Kape — surfaces, inputs, active card */
  --color-l3:  #2E2722;  /* Lifted surface */
  /* Ink */
  --color-hi:  #E8E1D3;  /* Piña Ecru — primary light / ink */
  --color-mut: #A39B8E;  /* Rattan — body / subtitle */
  --color-fnt: #857D71;  /* Capiz Slate — monospace meta / faint */
  /* Sacred accent — CTAs, active states, "loko/achuete" ONLY */
  --color-loko:#9A3D2A;  /* Achuete Red */
  --color-loko-hover:#a9432f;
  /* Hairline */
  --color-ln:  rgba(232, 225, 211, 0.08);
  /* Status */
  --color-ok:  #10B981;  /* emerald — "confirmed/secured" only */
}
```

**Print-stock (light) colors** used inside the card/ticket preview (these are the *product paper*, not the UI):
- Bone paper `#F7F5F1`, warm paper `#F5EFE6`, charcoal ink `#2C2523`.

**Palette swatches** (Step 2 paper choices) — exact values, from the prototype `PALETTES` map:
| Name | key | bg | text | subtitle | slot | stroke |
|---|---|---|---|---|---|---|
| Heirloom Piña | `pina` | `#F5EFE6` | `#2C2523` | `#2C2523` | `#E8E1D3` | `#2C2523` |
| The Void | `void` | `#110F0D` | `#E8E1D3` | `#A39B8E` | `#241F1B` | `#E8E1D3` |
| Achuete Red | `achuete` | `#9A3D2A` | `#F5EFE6` | `#E8E1D3` | `#7A2E1F` | `#F5EFE6` |
| Moss Patina | `moss` | `#4E5B48` | `#F5EFE6` | `#DCCBB5` | `#3A4437` | `#F5EFE6` |
| Satin Champagne | `champagne` | `#DCCBB5` | `#2C2523` | `#5C554C` | `#C2B19D` | `#2C2523` |

> **Contrast note (a11y) — CORRECTED & VERIFIED. Fix these exact pairs; do not "fix" the ones that pass:**
> - `--color-fnt (#857D71)` on `--color-l0 (#110F0D)` = **4.71:1 → PASSES** AA body. Leave it. (My v1.0 said ~4.0:1; that was wrong.)
> - `--color-fnt` on `--color-l1 (#1A1714)` = **4.39:1** and on `--color-l2 (#241F1B)` = **4.02:1 → FAIL.** This is where `--color-fnt` actually lives (floating input labels/borders, mono meta *inside* cards, active tier card). **Fix:** any `--color-fnt` text on `l1/l2/l3` → bump to `--color-mut (#A39B8E)` (~6.5:1+), or reserve `--color-fnt` for genuinely large/bold decorative meta only.
> - `--color-loko (#9A3D2A)` as **readable text** on dark surfaces = **~2.80:1 → FAIL.** So **do NOT render validation/error copy in loko text** (see §7.2) and **do NOT use loko as the sole focus ring** on dark (see §9.1). Loko stays an accent/fill/border color, not readable small text.
> - `--color-loko` as a **focus-ring/border** (non-text, 3:1 rule) on `l0` ≈ 2.8:1 → also short of 3:1. Use `--color-hi` (or a hi halo) for focus indicators.
> - **Slot caption text** (`text-black/35` on light slot fill, Step 2 preview) ≈ **1.87:1 → FAIL.** Make it `aria-hidden` decorative *or* palette-aware ≥4.5:1 per palette.
> - Light-palette **ticket/print** (charcoal `#2C2523` on bone `#F7F5F1`) passes; champagne sub `#5C554C`/`#DCCBB5` = 4.64:1 (pass) and moss sub `#DCCBB5`/`#4E5B48` = 4.55:1 (barely) — do **not** tighten these by mistake.

### 4.2 Typography
```css
--font-display: 'FH Ronaldson Display', 'Fraunces', serif; /* hero headlines */
--font-serif:   'Fraunces', serif;                          /* italic editorial body */
--font-body:    'Outfit', sans-serif;                       /* UI / inputs / labels */
--font-mono:    'Courier Prime', monospace;                 /* meta, registry codes, tracking */
```
- FH Ronaldson Display self-hosted from `./fonts/fh-ronaldson/` — `@font-face` block already exists in the prototype; reuse it (weights 300/400/500/600/700/900, normal+italic).
- Type scale is inherited from the prototype (hero `text-4xl→6xl` light weight, tight tracking; mono meta at 7–9.5px with `0.15–0.24em` letter-spacing uppercase). Keep it. Do **not** introduce new fonts (no IvyMode, no Proxima, no Playfair — all superseded).

### 4.3 The Quiet-Luxury Motion Law (LOCKED — Jed-approved 2026-07-01)
Every animation in the build MUST obey:
- **Tilt/rotation ceiling:** max **5°–6°** on any card tilt. (Current 3D tilt maps `xc*10` where `xc∈[-0.5,0.5]` → ±5°: compliant. Keep ≤6°.)
- **Duration floor for settle/return:** **≥1.2s** for the damped return-to-rest; easing **`power3.out` or `power4.out`** for settle/return/reveal motions. No `back`, no `elastic`, no `bounce`, no spring presets.
- **Ease whitelist is scoped, not absolute:** the `.out` rule governs *settle/return/reveal*. **Symmetric transitions may keep their existing `inOut` eases** — specifically the shutter close→open (`power4.inOut`, verified in the prototype) and the format-geometry morph (`power3.inOut`). These are Jed-approved craft; **preserve them verbatim — do not "correct" them to `.out`.**
- **Weighted feel:** motion should read like a solid wood plate turning in soft gallery light — heavy, decelerating, never snappy.
- **Spatial continuity:** expansions/lightboxes use GSAP **Flip** (or layout morph) rather than abrupt overlays. (Applies if you add any expand interaction; the shutter step-change is already continuous.)
- **Graceful degradation (MANDATORY):** wrap **every** GSAP timeline in
  ```js
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => { /* full timeline */ });
  ```
  and provide an instant/static fallback for `(prefers-reduced-motion: reduce)`. This is currently **absent** and is a launch blocker. **Wrapping timelines in `matchMedia` is not enough — you MUST also write the reduce-branch that force-reveals what the animations would have revealed**, or the page bricks. Enumerated traps that WILL blank the site if you forget (all verified in the prototype):
  - **Ticket folds:** `#ticket-fold-1/2/3` are `gsap.set(... opacity:0)` on load and only the timeline reveals them → under `reduce` set them `opacity:1, rotateX:0, y:0` instantly, else the *entire confirmation is invisible*.
  - **Shutter blades:** start at `translateX(0)` **covering the page**, only parted by the intro timeline → under `reduce` immediately part/hide them (`display:none` / `translateX(±100%)`), else two fixed `z-1000` panels cover the whole app.
  - **Wordmark:** `.wordmark-path { opacity:0 }` is cleared only by GSAP → under `reduce` set `opacity:1` with no dash animation.
  - **Step-swap:** `goToStep()` must still work with the shutter timeline skipped (§8).
  - **Acceptance:** load the page with reduced-motion ON and confirm every step's content is visible and the full flow completes. This is a DoD line, not a nicety.
- **No placeholders:** never simulate template previews with grey dummy boxes where real vector geometry is intended. Photo slots may remain as styled empty slots (that is the design), but they must be intentional, palette-aware SVG/CSS, not "loading" stand-ins.

### 4.4 Texture & atmosphere (keep — exact params pinned so they don't get merged)
- **Grain overlay** (all steps): `feTurbulence type=fractalNoise baseFrequency=0.85 numOctaves=3 stitchTiles=stitch`, rect `opacity≈0.03`. Decorative → `aria-hidden`.
- **Wabi-sabi wordmark filter** (wordmark ONLY — *different* frequency from the grain; do not reuse 0.85 here or the wordmark turns to destructive noise): `feTurbulence type=fractalNoise baseFrequency="0.03 0.06" numOctaves=3` → `feDisplacementMap scale=4 xChannelSelector=R yChannelSelector=G`.
- Perforation lines on the ticket stay (`linear-gradient` dashed, 8px).

---

## 5. USERS & USER STORIES

**Primary persona — "Ana," the discerning couple/planner.** Booking a wedding or milestone event, values craft and calm, on mobile ~50% of the time, wants to feel the brand is meticulous before paying four figures.

| # | As a… | I want to… | so that… | Acceptance |
|---|---|---|---|---|
| U1 | prospective client | see the four tiers with what each includes and its price | I can choose confidently | All 4 tiers render with name, blurb, booth/print meta, price; selecting one visibly activates it and updates the running total |
| U2 | client | pick optional add-ons and see the total change live | I know the real cost | Each add-on toggles; total = tier + Σ add-ons, updated instantly and correctly |
| U3 | client | pick an available date and be blocked from taken ones | I don't request an impossible date | Booked dates are visually blocked & non-selectable; picking a date is required to proceed; the month reflects real availability (§7.5) |
| U4 | client | enter my contact + venue details with a frictionless form | it feels effortless & premium | Floating-label inputs; required-field validation with inline (not `alert()`) errors; keyboard + screen-reader usable |
| U5 | client | design my commemorative print (format, title, subtitle, paper palette) and see a live proof | I feel ownership of the keepsake | Live preview updates on every keystroke and palette/format change; 3D tilt within motion law |
| U6 | client | reach a confirmation that shows *my* real choices + a voucher | I trust it was received | Ticket shows my name/date/venue/tier/price/add-ons/title/subtitle/palette; unique ID; print + email actions work |
| U7 | Katha (business) | actually receive the lead | no inquiry is lost | On submit, a lead is persisted and/or emailed to `kathabooth@gmail.com` (§7.4); failure is surfaced to the user, never silent |
| U8 | any user on any device | use it on a phone, with a keyboard, or with reduced motion | it's inclusive & correct | Fully responsive ≥320px; full keyboard path; `prefers-reduced-motion` honored; AA contrast |

---

## 6. CONTENT — SINGLE SOURCE OF TRUTH

All copy, tiers, pricing, add-ons, palettes are centralized in [`content.json`](./content.json) (also embedded below). Fable 5: load these into JS constants at the top of the file; **render the UI from them** (do not re-hardcode strings inline). This makes pricing/copy edits a one-place change and prevents the "hardcoded LORENZO" bug from ever recurring.

### 6.1 Tiers — REAL catalog (scraped from client.kathabooth.com 2026-07-02, Jed-confirmed)
Full inclusion lists live in `content.json.tiers`. Render them; do **not** alter names/prices/inclusions (they mirror the live HoneyBook form). Present with the Roasted Archive styling.

| key | name | price | hours | available | one-line |
|---|---|---|---|---|---|
| `editorial` | Editorial Installation | $949 | up to 3h | ✔ | Oak-wood DSLR, professional-grade photos, Metallic Pearl proprietary prints. |
| `glam_editorial` | Glam Editorial Installation | $1,149 | up to 3h | ✔ (**default**) | The Editorial installation in professional monochrome, skin-soothing. |
| `architectural` | Architectural Installation | $749 | up to 3h | ✖ **Currently Unavailable** | Render as a visible-but-disabled/sold-out card; not selectable. |
| `katha_booth` | Katha Booth Installation | $549 | up to 4h | ✔ | The essential booth — unlimited high-grade photos, GIFs, instant sharing. |

- Every tier is "**up to N hours print service, $149 per additional hour**" — surface that line. Default selected tier: **Glam Editorial**.
- The `architectural` tier must render (real catalog) but with an "Currently Unavailable" state — greyed, non-selectable, `aria-disabled`.

### 6.2 Add-ons — REAL (from the live form)
| key | name | price | type | note |
|---|---|---|---|---|
| `bespoke_backdrop` | Bespoke Backdrop | $499 | toggle | Stylish high-quality backdrop to match your theme. Flower wall not included. |
| `white_flower_backdrop` | White Flower Backdrop | $499 | toggle | Gorgeous white flower backdrop; perfect for weddings & socials. |
| `additional_hours` | Additional Hour(s) | $149/hr | quantity 0–2 | Up to 2 hours max. Total = `149 × qty`. |

`additional_hours` is a **stepper (0–2)**, not a checkbox. Total = tier price + Σ toggled backdrops + (149 × additional_hours).

### 6.3b Intake fields — match the real form
The live inquiry form also collects (add these, they're real): **Event type** (dropdown, required), **Estimated guest count** (optional), **Indoors/Outdoors** (required), **Start date** (= the calendar pick) + **Start time** (required), **How did you hear about us?** (optional). Options are in `content.json.intakeFields`. Core fields map to `leads` columns; the extras fold into `leads.notes` as JSON (§7.4). Near the submit button, show the privacy note `content.copy.privacyLine` **and** an unchecked opt-in checkbox `content.copy.marketingConsentLabel` (store the boolean in the `notes` JSON as `marketingConsent`). Also: on the final "Secure Dates" handoff, per §14.1 route the inquiry into HoneyBook's embedded Lead Form so HoneyBook owns invoice/contract/payment. Emit the `LocalBusiness` JSON-LD from `content.json.seo`, and add the free **Vercel Web Analytics** script (`/_vercel/insights/script.js`).

### 6.3 Palettes
See §4.1 table (5 palettes, `pina` default).

### 6.4 Formats (Step 2)
- On-screen filter buttons: **All · Filmstrip (2×6) · Postcard (4×6)**. **"All" is a UI convenience alias that renders Postcard geometry — not a distinct data format.** `content.json.formats` therefore has only `postcard` (default) and `strip`. Initial active button = "All", initial rendered geometry + `STATE.design.format` = `postcard`.
- Filmstrip: card ~180×520, 4 square slots stacked. Postcard: card ~320×480, 3 landscape (4:3) slots. Keep; make slot geometry palette-aware and clean (no grey dummy stand-ins).

### 6.5 Standing brand copy
- Nav wordmark: **Katha**; logomark = the existing leaf-feather SVG. Tagline meta: `// Southern California`.
- Footer: `Plate No. 2026-CF` · `©2026 Katha Atelier Studio`.
- Studio voice: quiet, editorial, tactile. Mono "system" meta uses `//` prefixes and UPPERCASE tracking. Keep this exact tone; do not make it chatty.

---

## 7. FUNCTIONAL SPEC

### 7.1 The shared STATE model
```js
const STATE = {
  step: 1,                         // 1 | 2 | 3
  tier: 'signature',               // key from content.tiers
  addons: {},                      // { guestbook:true, ... }
  date: null,                      // ISO 'YYYY-MM-DD' (selected event date)
  contact: { name:'', email:'', phone:'', venue:'', notes:'' },
  design: {
    format: 'postcard',            // 'strip' | 'postcard'
    title: '',                     // client's title inscription
    subtitle: '',                  // client's subtitle/location
    palette: 'pina',
  },
  leadId: null,                    // set after successful submit (server id or generated hash)
  submittedAt: null,
};
```
- **One** object; every step reads from and writes to it. On step render, **hydrate the DOM from STATE** (so going back/forward never loses input).
- Derived: `total = content.tiers[tier].price + Σ content.addons[k].price for selected k`.

### 7.2 Step 1 — Intake (from `1_booking_intake.html`)
Keep the split layout (packages/availability left, form/summary right). Requirements:
- **Tier cards** render from `content.tiers`; selecting sets `STATE.tier`, moves the active outline + lifts bg to `--color-l2`, updates summary + total. **Accessibility — use the low-risk native pattern:** render each tier as a visually-hidden `<input type="radio" name="tier">` + styled `<label>` wrapper (gets correct radiogroup semantics, roving focus, and Arrow/Space keyboard *for free* — do **not** hand-roll `role=radio` + roving tabindex, which a one-shot reliably ships half-broken). Wrap in a `<fieldset>`/`role="radiogroup"` with an `aria-label`.
- **Add-ons** render from `content.addons`; use visually-hidden `<input type="checkbox">` + styled `<label>` (free `aria-checked`/Space semantics). Toggling updates `STATE.addons` + total.
- **Availability calendar** (§7.5): dynamic, real booked dates. Accessible pattern — either (a) a proper `role="grid"` with the full roving-tabindex/Arrow/Home/End contract in §9.1, **or** (b) the simpler, still-accessible fallback: a native `<input type="date">` (with `min`/blocked handling) plus a visible list of the soonest available dates. Pick (b) if (a) can't be done fully — a partial grid that announces as a grid but isn't keyboard-operable is worse than (b).
- **Form:** floating-label inputs bound to `STATE.contact`. Validation on "Secure Dates & Begin Design": name (required), email (required + valid format), phone (required), venue (required), **date selected** (required). **Replace the `alert()`** with inline field errors. **Error text must be readable** — render it in `--color-hi` or `--color-mut` with a `--color-loko` left-border/icon accent (loko *text* fails contrast, §4.1). Wire `aria-invalid`, `aria-describedby`→the message, and an `aria-live="polite"` region. Focus the first invalid field.
- Progress meter stays (recompute from STATE).
- **On valid submit — with idempotency:** if `STATE.leadId` is already set (user came Back and re-clicked), **do NOT insert again** — just advance to Step 2. Otherwise run §7.4 `submitLead` → on success set `STATE.leadId`/`submittedAt`, then `goToStep(2)`. On failure, stay on Step 1, show the error toast (§7.6), do not advance.
- **Submit timing note:** the lead is captured here (Step 1→2). Step-2 design choices happen *after*, so they are **display-only on the ticket** this pass and folded into the `notes` blob only if a later update is added (§7.4). Do not block on persisting design data.

### 7.3 Step 2 — Design customizer (from `2_template_customizer.html`)
- Controls bound to `STATE.design`. **Title default** = `STATE.contact.name` verbatim, uppercased (do **not** synthesize a two-name "couple line" from the single Full Name field). **Subtitle default** = empty, showing the ghost placeholder `content.copy.step2.subtitlePlaceholder`. **Never** hardcode "LORENZO & CORAZON" / "OCTOBER 15…" as real data — those are `placeholder` attributes only.
- Palette swatches animate the live card (GSAP, `power3.out`, per motion law); format buttons morph the card geometry.
- 3D tilt: keep, clamp ≤6°, return `≥1.2s` `power3.out`, and **disable under reduced-motion**.
- "Finalize Custom Design" → shutter → Step 3. "Back" control → shutter → Step 1 (state intact).

### 7.4 Submission (the critical "make it real" requirement) — VERIFIED SCHEMA

The lead must be captured. The client-side call site is a **single async `submitLead(payload)`** so the transport is a one-function swap. Generate `lead_hash` client-side (`crypto.randomUUID()`), set `STATE.leadId = lead_hash`, show it on the ticket → the confirmation ID is real even in fallback mode.

**⚠ Do NOT "mirror `actions.ts::submitBooking` verbatim."** That function does a raw `.insert([payload])` (no column whitelist) and its notification email reads `payload.name` — a key that doesn't exist under the real schema. `actions.ts` is a **transport reference only** (how to call Supabase + Resend), not a field contract. Use the exact mapping below.

**The REAL `leads` table (verified LIVE 2026-07-02 — 39 rows, all columns present).** Insert **only** these columns; any other key (e.g. `price`, `title`, `palette`, `name`) makes PostgREST reject the whole insert → **every lead lost.**

| DB column | source | notes |
|---|---|---|
| `client_name` | `contact.fullName` | **NOT NULL** |
| `client_email` | `contact.email` | **NOT NULL** |
| `client_phone` | `contact.phone` | nullable |
| `event_date` | `STATE.date` | **NOT NULL**, column is **TEXT** → store ISO `YYYY-MM-DD` |
| `lead_hash` | `crypto.randomUUID()` | **NOT NULL**, unique |
| `venue_name` | `contact.venueAddress` | nullable |
| `tier_selected` | tier name | nullable |
| `addons` | `JSON.stringify(selected add-ons incl. additional_hours qty)` | nullable TEXT |
| `notes` | `JSON.stringify({eventType, indoorsOutdoors, startTime, guestCount, howHeard, specialNotes, priceQuoted})` | nullable TEXT — folds the extra intake fields |
| `status` | `'Inquired'` | matches the existing default; keep this exact string |

**Design data has a real home — the `selections` table** (FK `selections.lead → leads.lead_hash`). After the Step-2 design, optionally write a `selections` row: `template_name=format`, `names=title`, `date=STATE.date`, `venue=venueAddress`, `service_tier=tier name`, `configuration=JSON({subtitle,palette,format})`. There is **no** `price/title/palette` column on `leads` — never send them there. (All required migrations are already applied — verified.)

**Transport — WIRED (Vercel Serverless Function `katha-booking-html/api/lead.js`):**
1. Receives `submitLead` payload. 2. Builds the **whitelisted** `leads` row above (+ optional `selections` row). 3. Inserts via Supabase **service-role** client (server-only). 4. Sends the Resend notification to `kathabooth@gmail.com` **from `hello@kathabooth.com`**, referencing `payload.client_name`. 5. Returns `{ success, leadId }`.
- **Project (live):** `SUPABASE_URL = https://hvvomiyskizxzhyytcfd.supabase.co`. Service-role key + `RESEND_API_KEY` go in **Vercel env vars** (never in the repo). The **anon key is in `content.json.supabase`** (safe client-side, for the calendar read + admin auth only).
- **Fallback (if the fn isn't deployed yet):** Formspree/Basin (real HTTP success/fail). **Never `mailto:`** on a live site (can't confirm send → fake "Secured", violates §10).

**Failure handling:** if `submitLead` rejects/times out, **stay on Step 1**, keep `STATE`, show the error toast (§7.6/§11), do **not** advance or set `submittedAt`. Never show "Secured" without a real success response.

### 7.5 Availability — ALLOW-LIST model (admin-managed), WIRED
The studio marks the dates it's **open**; the public calendar shows **only** those as selectable. (Jed's ask: "input our own available dates.") Backend is **already created** — table `public.available_dates(date, status, note)`, public-read RLS, seeded with 20 sample open dates.
- Render **current + next 2 months**, navigable prev/next. **On load, open the first month with a selectable date.** Empty month → §11 prompt ("no open dates this month — try the next").
- **Read (client-safe, anon key):**
  ```
  GET https://hvvomiyskizxzhyytcfd.supabase.co/rest/v1/available_dates?select=date,status
  headers: { apikey: <anonKey from content.json>, Authorization: Bearer <anonKey> }
  → [{date:'YYYY-MM-DD', status:'open'|'booked'}, ...]
  ```
  A date is **selectable** iff `status='open'` AND `date ≥ today + minNoticeDays` (default **7**, `content.json.openDecisions.minNoticeDays`). `status='booked'` and past/within-notice dates render disabled (`aria-disabled`).
- The `service_role` key is **never** in client JS. The anon key is safe (RLS: public may only SELECT).
- **Fetch failure must be VISIBLE, not silently faked:** on failure show "availability temporarily unavailable — contact us," not an empty calendar (a client must never request a date you're not open for). No hardcoded fallback list on the live path.
- Selecting writes ISO `YYYY-MM-DD` to `STATE.date` (parse local, not UTC — §7.5 note).

### 7.7 Admin Portal — `katha-booking-html/admin.html` (NEW deliverable)
A private page for Jed & his brother to manage `available_dates`. **Keep it separate from the client flow** (its own file), simple and robust.
- **Auth:** Supabase Auth **magic link** via `supabase-js` (anon key). `admin.html` shows an email field → `signInWithOtp({ email })` → they click the link → authenticated session. **RLS enforces** that only emails in `public.admins` can write (helper `public.is_admin()`); a non-admin who signs in sees the calendar read-only and writes are rejected. `kathabooth@gmail.com` is **already seeded**; the brother's email is a one-row add (§13-C).
- **UI (same Roasted Archive tokens/fonts):** a month calendar where the admin **clicks a day to toggle it open/closed**, and can mark an open day as **booked**. Show current open/booked/closed states. All writes go straight to Supabase (`insert`/`update`/`delete` on `available_dates`) under the authed session — no serverless fn needed for admin (RLS is the gate).
  - Open a day → `upsert {date, status:'open'}`. Close → `delete`. Mark booked → `update status='booked'`.
- **Motion/a11y:** same law as the client (reduced-motion, keyboard, focus ring `--color-hi`). Keep it lightweight — this is a tool, not a showpiece, but it should still feel Katha.
- **Note:** if Supabase magic-link email is unreliable at launch, the fallback is a shared-passcode gate + a `/api/availability` serverless fn using the service-role key (documented as a swap in the build). Prefer magic-link.
- Selecting a date writes **ISO `YYYY-MM-DD`** to `STATE.date`. **Parse as local, not UTC:** `new Date('2026-10-15')` is midnight UTC and renders as Oct 14 in PT — build the Date from parts (`new Date(y, m-1, d)`) or keep it a string. Human formatting is display-only (§7.6).

### 7.6 Step 3 — Confirmation ticket (from `3_confirmation_ticket.html`)
- **Render entirely from STATE** — no hardcoded data. Fold 1: `title` (client's inscription, defaults to their name), **`REGISTRY DATE` = human-formatted `STATE.date`**, **`VENUE` = `STATE.contact.venue`**, real `STATE.leadId`. Fold 2: selected tier name + price + blurb, then **only the actually-selected** add-ons (if none, show a graceful "no add-ons" line, not the prototype's three hardcoded "✓ Included"). Fold 3: barcode + `KATHA-{leadId}` + brand.
- **Date/venue authority:** `STATE.date` and `STATE.contact.venue` are authoritative for the ticket's date/venue fields. `design.subtitle` is **decorative print text only** — never treat it as the date/venue (it can disagree with the calendar pick). Format ISO→human once: `new Date(y,m-1,d).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}).toUpperCase()`.
- **Ticket paper = fixed bone stock `#F7F5F1` (the voucher/receipt is a *different artifact* from the Step-2 commemorative print).** Do **not** apply the client's chosen palette to the ticket background — that avoids dark-palette (Void/Achuete) contrast and print failures. Record the palette as a small labeled line ("Paper: Heirloom Piña") so the choice is captured. (If Jed later wants the ticket to adopt the palette, that's a follow-up with per-palette contrast + a forced-white `@media print` override.)
- Keep the GSAP 3D accordion unfold (fold timings `power4.out`/`power3.out`, 1.2–1.4s — **compliant**; wrap in `matchMedia` + the reduced-motion reveal in §4.3).
- **Print:** keep `@media print`; only the ticket prints, on white, with real data; verify barcode + text survive print.
- **Email copy button:** on the live path, wire it to actually send the client confirmation to `STATE.contact.email` (serverless fn `action=email`). **The confirmation-email field shape is DIFFERENT from the DB insert** — the Resend template (mirroring `submitInquiry`) reads un-prefixed `name/email/venue/date/tier`, not `client_*`. Map STATE→that shape so no field renders "undefined." If email isn't wired yet, **relabel the button truthfully** (e.g., "We'll email your copy shortly") — never fake "Email Dispatched!" on a live site (§13-B).
- **"Start New Inquiry" resets the FULL STATE to initial defaults** — including `leadId`, `submittedAt`, `addons`, `date`, `design` — and re-arms the submit guard, then returns to Step 1. (A reset that keeps `leadId` would skip the next real submit.)

---

## 8. CROSS-STEP TRANSITIONS — concrete architecture (the shutter is NOT reusable as-is)

The prototype's shutter exists **only on page 1**, is **fused to the one-time intro loader** (wordmark trace → part), has **no back/close-again variant**, and pages 2–3 have no shutter at all. You must build the reusable machine, not "reuse" it:

- **DOM:** three always-present sibling sections `<section id="step-1|2|3">`; inactive steps get the `hidden` attribute. **One** shutter-blade pair lives at the app root (not inside a step). The **intro loader timeline is decoupled** from the reusable shutter function.
- **`goToStep(n, dir)` contract (single owner):**
  1. If a transition is already running, **ignore the call** (a `isTransitioning` boolean lock — guards rapid double-clicks / next+back spam).
  2. Set lock; disable nav buttons; `blades.display = 'block'`; animate blades **closed** (`translateX → 0`) on one timeline (`power4.inOut`, existing feel).
  3. `onComplete`: toggle `hidden` (old step out, `n` in), `scrollTo(0,0)`, **hydrate the new step's DOM from `STATE`**, update the URL hash.
  4. Animate blades **open** (part `translateX ±100%`); on done set `blades.display='none'` + `pointer-events:none`, release lock, re-enable nav.
- **Reduced-motion branch:** skip the blades entirely — just toggle `hidden` + hydrate + move focus to the new step's heading. No `display` toggling race, no covered step.
- **Invariant (DoD):** no code path may leave a blade covering an interactive step. Verify with reduced-motion ON and with rapid next/back clicking.
- URL hash (`#intake`/`#design`/`#ticket`) reflects the step for back-button friendliness (optional; if added, keep it in sync with `STATE.step`, don't let it desync).

---

## 9. ACCESSIBILITY · RESPONSIVE · PERFORMANCE (the explicit launch-blocker scope)

### 9.1 Accessibility (target: WCAG 2.1 AA)
- Full keyboard path; logical tab order; no traps.
- **Focus ring:** use a **`--color-hi (#E8E1D3)` outline** (~14.7:1 on `l0`) with `outline-offset`, **not** `--color-loko` (2.8:1 — fails the 3:1 non-text rule on dark). A loko fill + hi halo is fine; loko alone is not.
- **Semantics via native controls (lowest one-shot risk):** tiers = hidden `<input type=radio>` + `<label>` in a `role=radiogroup`; add-ons = hidden `<input type=checkbox>` + `<label>` — these give correct roles/`aria-checked`/keyboard for free. **Calendar:** a real `role=grid` requires the full roving-tabindex contract (exactly one cell tabbable; Arrow ±1/±7; Home/End week ends; focus crosses month on nav; Enter/Space selects; disabled days `aria-disabled=true`, focusable-but-inert — do NOT use `pointer-events:none`, it hides them from AT). **If you can't implement that fully, use the §7.2(b) fallback** (native `<input type=date>` + available-dates list) and drop the `role=grid` claim — a fake grid is worse than an honest simpler control.
- Form fields: real `<label for>` (already present) + `aria-invalid`/`aria-describedby` on error; error text readable per §4.1. `aria-live="polite"` regions for total changes, validation, and submit status.
- **Slot caption text** in the Step-2 preview (`text-black/35`, ~1.87:1) → make `aria-hidden` decorative OR palette-aware ≥4.5:1 (§4.1).
- Respect `prefers-reduced-motion` everywhere (§4.3, with the enumerated reveal branch).
- `aria-label` on meaningful SVGs (wordmark/logomark = `role=img` + label); decorative grain/noise = `aria-hidden`.
- `<html lang="en">`, a sensible document `<title>` (update per step if using hash routing), skip-to-content link.

### 9.2 Responsive (mobile-first, ≥320px)
- Single-column stack on mobile; the split grids collapse (`lg:` breakpoints already do — verify). Sticky summary becomes a bottom-docked total bar or an inline block on mobile — do **not** trap the CTA off-screen.
- Tap targets ≥44×44px. Calendar cells and swatches must be comfortably tappable.
- Live-preview card scales to viewport (no horizontal scroll; keep `overflow-x: hidden`, but ensure nothing actually overflows).
- **Viewport height:** the full-screen shutter blades + success screen currently use `h-screen` (=`100vh`). Switch covering elements to **`100lvh`** (largest viewport, so blades always fully cover during transitions) and content max-heights to **`100dvh`** — avoids the iOS URL-bar gap that shows a page strip peeking under a blade mid-transition.
- **Mobile bottom-docked total/CTA bar:** must set `padding-bottom: env(safe-area-inset-bottom)` (clear the home indicator) and must not be trapped behind the soft keyboard when a contact input is focused (let it scroll with content, or ensure the form's own submit remains reachable). Never occlude the CTA.
- Tap targets ≥44×44px (calendar cells, swatches, add-ons).
- Test at 320 / 375 / 768 / 1280.

### 9.3 Performance
- **Tailwind:** ship it as precompiled static CSS (preferred) — NOT the runtime CDN JS. If precompiling isn't feasible in the pass, keep the CDN and flag it (§3.3) rather than breaking the layout.
- **Fonts** (§3.3): preload the FH Ronaldson above-the-fold weight (OTF); `font-display: swap`. Keep the Google `<link>` for Fraunces/Outfit/Courier by default (woff2 files aren't in-repo) — self-hosting them is a Jed follow-up, not this pass.
- `defer` GSAP; gate the intro shutter timeline so it never blocks first paint or input.
- Inline SVG noise (already data-URI) — fine. Avoid huge base64 images.
- **Targets (design toward; report if unmeasurable):** mobile **Lighthouse ≥90 Perf / ≥95 A11y**, **CLS <0.05**, **zero console errors**, transfer <~500KB excl. fonts. You cannot run Lighthouse yourself — **zero console errors** and the a11y/contrast/reduced-motion checks ARE your gate; the numeric Lighthouse scores are a target for Jed to verify post-build, not a self-certified checkbox.

---

## 10. METRICS & SUCCESS THRESHOLDS

| Metric | Definition | Launch threshold |
|---|---|---|
| Lead capture success rate | successful `submitLead` / attempts | ≥ 99% (excluding user-abandoned) |
| Inquiry completion rate | reached Step 3 / started Step 1 | baseline to establish; target ≥ 35% |
| Mobile Lighthouse (Perf / A11y) | field on `/` | ≥ 90 / ≥ 95 |
| Cumulative Layout Shift | mobile | < 0.05 |
| Reduced-motion correctness | manual audit | 100% usable, zero hidden content |
| Zero-loss guarantee | leads emailed/persisted | 0 silent failures (every failure surfaced) |
| Data fidelity | ticket matches selections | 100% (name/date/tier/price/add-ons/title/palette) |

Instrument (lightweight, privacy-respecting): a `plausible`/`umami`-style event on step-advance and on submit success/fail, OR at minimum `console`/dataLayer events wired for later. (Optional; §13-D.)

---

## 11. VISUAL / STATE INVENTORY (fill every one — one-shots skip these)

For **each** interactive element, all states must exist and match the aesthetic:
- **Tier card:** default · hover · focus-visible · selected · selected+hover.
- **Add-on:** default · hover · focus · checked · checked+hover.
- **Calendar day:** available · hover · focus · selected · blocked/past (disabled) · today (subtle marker).
- **Inputs:** empty · focused (label floats, border → loko) · filled · **error** (border/label → loko + message) · disabled.
- **Buttons (primary/secondary):** default · hover · active (`scale .98`) · focus · disabled · **loading** (submit in-flight: spinner/label swap, button disabled).
- **Submit result:** success (advance) · **error** (toast + stay).
- **Empty/edge:** no add-ons selected on ticket; very long name/title (truncate/wrap gracefully); no availability in current month (prompt to advance month).

---

## 12. DEFINITION OF DONE (Fable 5 self-verifies against this before declaring complete)

- [ ] Single `index.html` presents all 3 steps; shutter transitions between them; **no** cross-page navigation for the core flow.
- [ ] `STATE` object is the single source of truth; back/forward preserves all input.
- [ ] Step 3 ticket renders **real** name/title, human-formatted date (from `STATE.date`), venue (from `contact.venue`), tier, price, **only** the selected add-ons, and a real `leadId`. **No hardcoded "LORENZO & CORAZON" / "$949" / "#8D49F03B" / three-fake-add-ons as data.**
- [ ] Submit calls a single `submitLead(payload)` that inserts **only the real `leads` columns** (§7.4 table — no `price/title/subtitle/palette` keys); idempotent on re-submit; on failure the user sees a readable error and is **not** advanced; no fake "Secured" without a real success.
- [ ] Availability is the **allow-list** model: only `available_dates` with `status='open'` and `≥ today+minNotice(7)` are selectable; read via the anon key; **fetch failure surfaces a visible state, not a silent empty calendar**; dates local-parsed ISO (no UTC off-by-one).
- [ ] **Admin portal `admin.html`** built: Supabase magic-link auth, RLS-gated writes to `available_dates` (toggle open/closed, mark booked), Roasted Archive styling, keyboard/reduced-motion correct.
- [ ] Tiers/add-ons render from `content.json` **real catalog** (Editorial $949 · Glam Editorial $1,149 · Architectural $749 *unavailable* · Katha Booth $549; backdrops $499, additional hours $149/hr ×0–2); `architectural` shown disabled; extra intake fields (event type/indoors-outdoors/start time/guest count/how-heard) present and folded into `notes`.
- [ ] Every GSAP timeline in `gsap.matchMedia()` **AND** an explicit reduced-motion branch that force-reveals ticket folds, parts/hides the shutter blades, and reveals the wordmark (verified by loading with reduce ON — nothing hidden, flow completes). Tilt ≤6°, returns ≥1.2s `power3/4.out`; shutter `power4.inOut` preserved.
- [ ] Tailwind shipped as precompiled static CSS **or** CDN kept-and-flagged (layout NOT collapsed); FH Ronaldson preloaded (OTF); Google fonts `<link>`+`swap` kept; GSAP deferred.
- [ ] Full keyboard operability via **native radio/checkbox inputs** for tiers/add-ons; **`--color-hi` focus ring** (not loko); calendar is a real keyboard-operable grid OR the honest `<input type=date>` fallback; skip link.
- [ ] WCAG AA contrast verified for the **real** failing pairs (§4.1): `--color-fnt` on `l1/l2` bumped, error text not loko, focus ring hi, slot caption fixed. Passing pairs left alone.
- [ ] Responsive & correct at 320/375/768/1280; tap targets ≥44px; covering blades `100lvh`; safe-area on mobile CTA bar; no horizontal scroll; CTA always reachable.
- [ ] Every state in §11 implemented.
- [ ] **Zero console errors** (this is the hard gate; Lighthouse ≥90/≥95 & CLS<0.05 are targets Jed verifies post-build).
- [ ] `content.json` (or inline constants) is the sole source for tiers/pricing/add-ons/palettes/copy; UI renders from it; UTF-8 `×`/`•` glyphs intact.
- [ ] Existing `index.html` redirect stub **OVERWRITTEN** with the app; old `1_/2_/3_*.html` moved to `_archive/`; no remaining reference to the `1_/2_/3_` paths.
- [ ] `DESIGN.md` (light Atelier) was **not** used; Roasted Archive tokens intact; wabi-sabi filter params preserved (§4.4).
- [ ] Deploys clean to the `katha-booking-html` Vercel project.
- [ ] **HoneyBook handoff (§14.1a):** a branded, on-brand "Reserve your date" seam wired to the single `HONEYBOOK_LEAD_FORM` config point (URL/embed). No fake HoneyBook form, no fake invoice/contract/payment UI, no raw un-framed iframe, no double-entry gauntlet, no assumed prefill. If the config is empty, a styled placeholder seam (not a fake success).
- [ ] **Final report:** walk §12 item by item, state met/unmet + reasons, and list any §13 default left in place.

---

## 13. OPEN DECISIONS — status after Jed's 2026-07-02 answers

- **§13-A · Pricing & tiers — ✅ RESOLVED.** Real catalog scraped from `client.kathabooth.com` and confirmed. In `content.json`: Editorial $949 · Glam Editorial $1,149 · Architectural $749 (unavailable) · Katha Booth $549; add-ons Bespoke/White-Flower backdrop $499 each, Additional Hour(s) $149/hr (×0–2); "$149 per additional hour" beyond the included 3–4h. *(Open sub-item: any deposit/tax/travel fee to display? Not shown today — say if you want one.)*
- **§13-B · Submission + email — ✅ WIRED.** Serverless fn → Supabase `leads` (+ optional `selections`) → Resend to `kathabooth@gmail.com` **from `hello@kathabooth.com`**. Live project `hvvomiyskizxzhyytcfd`; anon key embedded (safe); **service-role + `RESEND_API_KEY` go in Vercel env** (you add these two secrets at deploy). Migrations verified applied. *(One thing to verify: that `hello@kathabooth.com` is a verified sender domain in your Resend account — otherwise confirmation emails won't send.)*
- **§13-C · Availability — ✅ BUILT as an admin portal.** New `available_dates` allow-list + `admins` table + RLS created; 20 sample open dates seeded; `kathabooth@gmail.com` seeded as admin. `admin.html` (§7.7) lets you both set dates. **Min-notice defaulted to 7 days** (change in `content.json`). **→ Give me your brother's email and I'll add him as an admin (one row).**
- **§13-D · Domain / analytics / privacy / geography / fonts — explained + handled below.**

### §13-D explained in plain English (and what I did)
1. **Custom domain** — *the web address people type.* Today the new site would live at the long `katha-booth-html.vercel.app`. You already own `kathabooth.com` (your HoneyBook form is at `client.kathabooth.com`). **Recommendation: host the new booking site at `book.kathabooth.com`** — short, branded, and it can eventually replace the HoneyBook inquiry form. *What I did:* set that as the intended domain; the actual switch is a 2-minute DNS step in Vercel + your registrar at launch (I'll walk you through it, or do it if you connect the domain). **→ Decide: `book.kathabooth.com`, or keep the Vercel URL for now?**
2. **Analytics** — *seeing how many people visit and how many finish booking,* so you know it's working. *What I did:* left a one-line hook so **Vercel Web Analytics** (free, privacy-friendly, no cookie banner) can be switched on with one snippet. Optional; no action needed unless you want the numbers.
3. **Privacy note** — because you collect name/email/phone, it's good practice (and legally expected in some places) to say how you use it. *What I did:* added a single line by the submit button — *"We use your details only to respond to your inquiry. No spam, ever."* That's enough for a small studio; a full privacy-policy page is a later nice-to-have.
4. **Service area** — the site says **Southern California**. Your brand also mentions **Manila**. *What I did:* defaulted to "Southern California." **→ Tell me if I should say "Southern California & Manila" (or something else).**
5. **Fonts** — a minor speed detail: three fonts (Fraunces/Outfit/Courier) load from Google. That's fine; self-hosting them later shaves a fraction of load time. No action needed.

**Net (after Jed's 2026-07-02 answers):** A ✅ B ✅ C ✅ D ✅ — all resolved. Domain = **`book.kathabooth.com`**. Admin = the shared **`kathabooth@gmail.com`** (no second admin). Analytics = **Vercel Web Analytics** (free). Service area = **Los Angeles & Orange County**. Marketing consent handled (§14). The only deploy-time secrets left for Jed to paste into Vercel: the **Supabase service/secret key** and **`RESEND_API_KEY`** (values are in `Zenith/.env`, §14.2).

---

## 14. INTEGRATIONS, PAYMENTS & LEGAL (HoneyBook) + PRIVACY

### 14.1 Payments & contracts stay 100% in HoneyBook — how the site connects
Money and legal (invoice + contract + payment) are **strictly HoneyBook**; this site never processes either. The clean, **free, no-Zapier/no-Make** way to connect them:
- **HoneyBook has embeddable Lead Forms that trigger HoneyBook workflows** (brochure → invoice → contract → payment) natively. That is the bridge.
#### 14.1a HoneyBook handoff — who builds what (Fable 5 MUST NOT gloss this)
**Honest division of labor — Fable 5 cannot create the HoneyBook form or its triggers:**
- **Jed builds, inside HoneyBook (dashboard, one-time):** the Lead Form itself (Lead capture → Lead Forms → Create), and the **attached workflow/automation** that fires brochure → invoice → contract → payment. These are 100% HoneyBook-side. Jed then copies either the **embed snippet (iframe)** or the **hosted form URL**. *(No code can create these; do not pretend to.)*
- **Fable 5 builds, in the site:** the **handoff/orchestration + the aesthetic seam** — nothing more. It wires a single, clearly-commented config point `HONEYBOOK_LEAD_FORM` (URL **or** embed snippet, from `content.json.integrations`) and presents the handoff as a **first-class, branded step**, not an afterthought.

**Orchestration relative to OUR specific capture + aesthetic (decide, don't gloss):**
- Our custom flow already captures a lot (tier, add-ons, availability date, design, contact, event type). The HoneyBook form also captures contact fields, and **prefill across the seam is NOT reliable** — so **do not create a double-entry gauntlet.** Recommended: the custom site remains the **source of truth** (writes the full lead to Supabase), and the HoneyBook lead form is kept **short** (Jed trims it in HoneyBook to just what HoneyBook needs to launch the workflow — ideally contact + date), so the client isn't re-typing everything.
- **The seam must stay on-brand.** HoneyBook's embedded widget carries HoneyBook styling, which will NOT match Roasted Archive. So the handoff is presented as a **deliberate branded transition** — a Roasted-Archive framed panel/drawer ("Reserve your date →") that *then* reveals the HoneyBook form (embedded in a styled container) or opens the hosted form. Do **not** drop a raw HoneyBook iframe inline mid-flow where it clashes; frame it.
- **Fable 5 MUST NOT:** build a fake HoneyBook form; build any fake invoice/contract/payment UI; bury or auto-skip the handoff; let the HoneyBook widget break the aesthetic; or assume prefill works. **If `HONEYBOOK_LEAD_FORM` isn't provided yet,** render the branded "Reserve" step with a clear placeholder + comment (so the seam and styling exist and Jed pastes the snippet later) — never a fake success.
- Net: gorgeous, controlled UX and full capture up front (Supabase) → a branded seam → HoneyBook owns the transaction end-to-end.
- **Make.com is NOT viable for the HoneyBook bridge.** HoneyBook's only native integrations are **QuickBooks, Gmail, Calendly, Facebook, and Zapier** — there is **no HoneyBook connector on Make.com**. Driving HoneyBook from Make would require HoneyBook's limited API via raw HTTP — fragile and not worth it. **Don't put Make in the money/legal path.**
- **Make.com free tier (1,000 ops/mo, 2 scenarios) is fine for OPTIONAL side-automations** *off Supabase* only — e.g. "new lead → append to a Google Sheet," "→ text us," "→ add to a Flodesk/Mailchimp list (with consent)." Nice-to-have, never load-bearing. If you ever want a lead→HoneyBook auto-push and will pay for it, HoneyBook's **native Zapier** is the supported route — but the embedded Lead Form removes the need entirely.
- **Your HoneyBook templates** (keep as-is, in HoneyBook): the [invoice](https://www.honeybook.com/template-preview/67b24f7d9fe339002d54d44e) and [contract](https://www.honeybook.com/template-preview/67b24f7af325eb001ff73102) previews. Wire the site's "Secure Dates" handoff to the HoneyBook Lead Form that launches these.

### 14.2 Keys — where they live, what to do
- **Found (masked):** `Zenith/.env` and `photobooth-template-studio/.env` (both **gitignored** — good) hold `RESEND_API_KEY` (`re_gHqm…`) and the Supabase **secret** key (`sb_secret_bWep…`). `Zenith/lib/supabase.ts` reads `process.env.SUPABASE_SERVICE_ROLE_KEY`.
- **Action for launch:** add those two values to the **`katha-booking-html` Vercel project → Settings → Environment Variables** (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` = the `sb_secret…` value, `RESEND_API_KEY`). They are NOT in the repo and must be set in Vercel for `api/lead.js` to work.
- **Email sender:** `hello@kathabooth.com` is **not** a verified Resend sender (the env's working sender is `onboarding@resend.dev`). Since client-facing email comes from **HoneyBook**, the site only needs to self-notify Katha, which works from `onboarding@resend.dev`. Verify the `kathabooth.com` domain in Resend later only if you want the site itself to email clients from `hello@kathabooth.com`.

### 14.3 "Future promotions" vs "spam" — the distinction, handled
Using inquiry contact info for **future promotions is NOT spam** *if* you (a) have a relationship/consent, (b) identify yourself, and (c) offer unsubscribe (US CAN-SPAM). Spam = unsolicited bulk mail with no consent/opt-out. So the old "No spam, ever" line would have contradicted promoting to them. **Handled:**
- Privacy line updated to: *"We use your details to respond to your inquiry and, if you opt in, to share occasional Katha offers. Unsubscribe anytime."*
- Added an **unchecked opt-in checkbox**: *"Keep me posted on Katha offers & availability (optional)."* Store the consent (fold into `leads.notes`). Only market to those who checked it, and always include an unsubscribe link in promo emails. That keeps you both legal and trusted.

### 14.4 Service area (SEO/AIO)
"Southern California" is too generic to rank. **Set to "Los Angeles & Orange County"** (you're in Carson/90745, South Bay through OC) and emit a **`LocalBusiness` JSON-LD** block with `areaServed` = the specific cities (`content.json.seo`). Specific place names are what Google's local pack and AI answer engines actually match. Copy line: *"Serving Los Angeles & Orange County — from Carson and the South Bay through Orange County."*

---

## APPENDIX A — Zenith / Next.js / Supabase PORT SPEC (later session, not this one-shot)

When ready to move from the static build to the production React app (`Zenith/`), map as follows. Source of truth for the backend is `Zenith/app/actions.ts` (already implemented).

**Component decomposition** (React):
- `BookingFlow` (client) owns `STATE` (→ `useReducer`); renders `<StepIntake>`, `<StepDesign>`, `<StepTicket>` + `<ShutterTransition>`.
- Reuse existing shared primitives noted in project memory: `ZDrawer`, `TierCard`, `KathaWordmark`, `KathaLogomark`. Do not re-invent the marks (they live in `Zenith/app/components/`).
- Fonts: already self-hosted via `next/font/local` (`--font-fh-ronaldson-display`); use that variable, do **not** reintroduce the cdnfonts `@import`.

**Server actions (exist — reuse the TRANSPORT, not the field naming; both have latent bugs):**
- `submitBooking(payload)` → `.insert([payload])` into `leads` with **no column whitelist** and a notification email that reads `payload.name` (a nonexistent key). **Do not copy its field handling.** The **real `leads` schema (verified):**
  - Base table (`supabase-schema.sql`, repo root `/supabase/migrations/`): `id`, `client_name` (NN), `client_email` (NN), `event_date` (**TEXT**, NN), `lead_hash` (NN), `status`, `created_at`, `updated_at`.
  - `20260629120000_zenith_lead_fields.sql` adds: `client_phone`, `venue_name`, `tier_selected`, `template_selected`, `addons` (TEXT).
  - `20260627120000_booked_dates_and_finalize.sql` adds: `final_template_id`, `final_date`, `notes`, `finalized_at` — and **creates the `booked_dates` table**.
  - **Both migrations must be applied** (`npx supabase db push` from **repo root**; there is no `Zenith/supabase/`). There is **no** `price/title/subtitle/palette` column — see §7.4 for the fold-into-`notes` rule.
- `getBookedDates()` → returns a flat **`string[]`** of ISO dates (uses `supabaseAdmin`/service role — server-only; the static site uses the **anon** key instead, §7.5). `booked_dates.date` is a real `date` column with public-read RLS `using(true)`.
- `submitInquiry(lead)` → Resend **client** confirmation from `hello@kathabooth.com`, and it reads **un-prefixed** keys (`lead.name/email/venue/date/tier/template/phone`) — a **different shape** from the `client_*` insert. If one serverless fn does both, translate STATE into **both** shapes so no field renders `undefined`.

**Parity checklist for the port:** same tokens, same motion law, same content.json (promote it to a shared module or DB-backed catalog), same acceptance criteria (§12) + SSR/hydration correctness, RLS verified, TypeScript clean, and an E2E smoke (real Supabase lead round-trips and renders on the ticket).

**Route:** slot into the existing portal (`/portal/[id]/...`) or a new `/book` route; reconcile with the Phase-1 portal already shipped.

---

## APPENDIX B — ASSET & FILE MANIFEST (what ships in `katha-booking-html/`)

```
katha-booking-html/
├── index.html                 ← EXISTS as a redirect stub → OVERWRITE with the unified 3-step app
├── admin.html                 ← NEW: availability admin portal (§7.7, Supabase magic-link auth)
├── content.json               ← source of truth (copy this bundle's content.json here; has live Supabase url+anon key)
├── api/
│   └── lead.js                ← NEW: Vercel serverless — whitelisted leads insert (+selections) + Resend from hello@kathabooth.com
├── fonts/
│   ├── fh-ronaldson/          ← EXISTS (30 OTF weights — NOTE: .otf, not woff2)
│   └── (fraunces/outfit/courier — NOT present; stay on Google Fonts unless Jed adds woff2)
├── styles.css                 ← NEW: precompiled Tailwind output (or hand-authored CSS) replacing the CDN
├── _archive/
│   ├── 1_booking_intake.html  ← moved
│   ├── 2_template_customizer.html
│   └── 3_confirmation_ticket.html
├── .vercel/                   ← EXISTS (project katha-booking-html)
└── vercel.json                ← NEW (optional): route "/" → index.html, headers, api config
```

**Provided in `KATHA_BOOKING_PRD/` (this bundle):**
- `KATHA_BOOKING_PRD.md` — this document.
- `content.json` — starter content source of truth (tiers/pricing/add-ons/palettes/copy/tokens).
- `FABLE5_ONESHOT_PROMPT.md` — the exact prompt to paste into a fresh Fable 5 session.

---

## APPENDIX C — RISKS & MITIGATIONS

| Risk | Likelihood | Mitigation |
|---|---|---|
| One-shot too big; Fable 5 truncates or half-finishes | Med | Single-file scope; §12 DoD as a self-check; §13 defaults so no blocking questions; prompt tells it to build to DoD and report unmet items |
| Motion law violated (no reduced-motion) | Med | Made an explicit DoD line + §4.3 code snippet |
| Silent lead loss on live site | High if unaddressed | `submitLead` single call site; surfaced errors; fallback transport; real `lead_hash` |
| Hardcoded demo data leaks to production ticket | High if unaddressed | DoD forbids it; render-from-STATE mandated; content.json render pattern |
| Contrast/a11y regressions | Med | AA thresholds + specific `--color-fnt` fix called out |
| Fonts/Tailwind CDN slowness or outage | Med | Self-host mandate; GSAP deferred |
| Stale `DESIGN.md` misleads the model | Med | Explicit "IGNORE" in §0 + DoD line |

---

*End of PRD v1.0. Build to §12. When in doubt, match the prototype and obey §4. Do not invent brand.*
