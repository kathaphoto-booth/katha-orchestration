# Design Spec — Unified Intake Funnel V1 (manual handoff)

**Date:** 2026-06-13 · **Owner:** CC · **Repo:** `photobooth-template-studio` (book.kathabooth.com)
**Gates passed:** grill-me (`.memory/handoff/2026-06-13_intake-funnel-v1-grillme_plan.md`) → brainstorming.
**Next gate:** superpowers:writing-plans.

## Context & problem
Prospects currently bounce between a HoneyBook form, email, and the Next.js site —
friction, duplicate data entry, and the premium aesthetic broken at first touch. V1 unifies
the intake into one Next.js flow that ends with a structured operator email; Jed manually
creates the HoneyBook proposal from it (V1 = manual handoff, no API bridge).

## Guiding constraint discovered during exploration
**The V1 backend is ~70% already built and stays.** `app/api/inquiry/route.ts` and
`app/api/selection/route.ts` already implement the dispatch backbone (parallel fan-out,
crypto `lead_hash`, `supabaseAdmin`/service_role writes, HoneyBook ping using the Owned pid
`679039857c7a9b001f4098a8`, `selections.configuration` jsonb, signed-URL reference photos).
V1 is therefore **extend-in-place + one new page + one migration**, not a rebuild.

## Scope
**Building:** fresh `/inquire` page; `serviceTier` selection (4 tiers) + `address` in the
portal→selection path; `service_tier` + `address` typed columns; §3 copy scrub of two email
bodies + tier narratives; portal `lead_hash` validation.
**NOT building:** HoneyBook API bridge / auto-proposal, payments/invoicing, AI features,
admin-CRM changes beyond the stale-lead warning. **Not touching** the 82-preset catalog or
its Signature/Classic *design* tiers (a separate axis from the 4 *service* tiers).

## Flow
```
/inquire (NEW — 3 fields: Name / Email / Event Date)
  → POST /api/inquiry  (EXISTS: leads insert + lead_hash + HoneyBook ping + client email)
  → confirmation screen renders the portal link on-screen (route returns lead_hash) AND email fires
/portal/[lead_hash]/template-design
  → validate lead_hash server-side against leads → 404 if absent (no enumeration)
  → template pick (EXISTS) + serviceTier (4 cards, NEW) + address (NEW) + venue/add-ons
  → POST /api/selection  (EXTENDED)
  → selections row (service_tier, address typed cols) + operator email → kathabooth@gmail.com
  → Jed reads checklist, manually creates the HoneyBook proposal   ← the manual handoff
```

## Data model
New migration `supabase/migrations/<ts>_selections_service_tier_address.sql`:
```sql
ALTER TABLE public.selections
  ADD COLUMN IF NOT EXISTS service_tier text,
  ADD COLUMN IF NOT EXISTS address text;
```
- No DB CHECK on `service_tier` (tiers evolved once already); validated app-side against the
  `SERVICE_TIERS` constant. Reject unknown tier in `/api/selection`.
- `address` is PII → written only by the service_role route; `selections` RLS is already
  service_role-only (anon policies dropped 2026-06-11), so it is never exposed to other
  clients. Never logged in plaintext beyond the operator email.

## The four service tiers — single source of truth
New `lib/serviceTiers.ts` (id, name, architecture, price, blackAndWhite, narrative, inclusions):

| id | name | architecture | price |
|---|---|---|---|
| `signature-oak` | Signature Installation | Oak | 949 |
| `editorial-oak` | Editorial Installation | Oak | 1,149 |
| `modernist-white` | Modernist Installation | White | 749 |
| `monochrome-white` | Monochrome Installation | White | 949 |

Source copy: `.memory/handoff/2026-06-13_service-tiers-update_spec.md`. The portal's
`serviceTier` field maps **exclusively** to these four. Named `serviceTier` deliberately to
avoid colliding with the portal's existing **preset-filter** `tier` variable.

## Component deltas
1. **`app/inquire/page.tsx` (NEW)** — built fresh via impeccable-looped-kit
   (`/init→/shape→/craft→/audit→/clarify→/harden`). 3-field form, client validation mirroring
   the route regex, POST `/api/inquiry`, confirmation state showing the on-screen portal link +
   email fired. Public (middleware already leaves `/inquire` ungated).
2. **`app/portal/[id]/template-design/page.tsx` (EXTEND)** — after template pick, an appended
   "details" step: 4 `serviceTier` cards + `address` + venue/add-ons. Submit includes
   `serviceTier` + `address`.
3. **Portal route segment (EXTEND)** — validate `lead_hash` server-side (e.g. in the route's
   server boundary / `layout.tsx`) via `supabaseAdmin` before rendering the client picker.
4. **`app/api/selection/route.ts` (EXTEND)** — add `serviceTier` + `address` to the `Selection`
   type; validate `serviceTier ∈ SERVICE_TIERS`; persist to the new typed columns; add **Service
   Tier (name + architecture + price)** and **Address** rows to the operator email checklist.
   Existing dispatch (email/HoneyBook/supabase parallel) otherwise unchanged.

## Copy scrub (`/clarify`) — mandatory, two targets
1. **Existing `/api/inquiry` client email** currently violates §3 voice law: "passed-down
   **heirlooms**", "**heirloom**", "hand-finished **KTHA maker's mark**" (KTHA was PURGED
   2026-06-13), "wooden **loom**". Rewrite to peer-executive craft voice; remove KTHA device.
2. **4-tier narratives** violate §3: `luxury` (multiple), `experience` (noun), `heirloom`,
   client-facing tech vocab (`algorithm`, `real-time exposure rendering`). Rewrite; keep
   pricing + structure + inclusions intact.

## Error handling
- `/api/inquiry` + `/api/selection` keep the existing graceful-degrade pattern (each dispatch
  target returns `{ok, detail}`; 200 if any ok, else 202). `/inquire` UI treats a returned
  `lead_hash` as success (shows the link) even if the email leg fails — correct given dead Resend.
- Portal: invalid/absent `lead_hash` → 404.
- Selection: unknown `serviceTier` or missing required fields → 400.

## Resend / dead-key handling
`RESEND_API_KEY` is dead (401). Both routes already env-gate Resend and degrade cleanly. Add a
dev fallback that `console.log`s the email payload when the key is absent/invalid. The on-screen
portal link makes the funnel fully demoable **now**. When Jed mints the key + it lands in Vercel
env, real delivery resumes with **no code change** (env-only switch).

## Verification (success check)
- **Local E2E (mock email):** POST `/api/inquiry` → `leads` row + `lead_hash` returned →
  `/inquire` shows link → portal validates hash → pick template + tier + address + venue →
  submit → `selections` row with `service_tier` + `address` populated → operator email payload
  logged with the full checklist.
- **Gates:** `npm run guard` P0:0, `tsc` clean, `eslint` clean, `next build` clean.
- **Real inbox E2E:** runs once Jed mints the Resend key — client portal email + operator
  checklist to `kathabooth@gmail.com`.

## Open items for the implementation plan
- **Build branch:** repo is currently on `feat/fable6-port` (held, not merged). The plan must
  choose whether the funnel builds on a fresh branch off `main` or atop `feat/fable6-port`
  (recommend fresh off `main` to avoid coupling to the held homepage/admin relocation).
- Exact placement of the portal `lead_hash` server validation within the existing 1060-line
  client component boundary.
- Whether `serviceTier` also feeds the HoneyBook ping payload (currently the ping omits it).
