# KATHA — Genesis Operating Workflow (client + operator + system)

_Genesis revision: 2026-06-13. Supersedes the 2026-05-30 "Template Gallery → HoneyBook" plan
(retained in git history for the dependency graph + earlier checkpoints). The 2026-05-30 plan's
Phases A–D + the broader HONEYBOOK_CRM.md pipeline are already ☑ done in code; this plan picks up
from the **uncompleted human checkpoints** + the **connectivity drift** discovered 2026-06-13._

## Why this exists
One end-to-end workflow that nothing falls through: every step a **client** takes from first glance
to finished prints, every step **Jed/Vince** take to run it, and the **technical pipeline** that
delivers both. Grounded in this session's end-to-end audit + the 2026-05-30 plan's earned state.

## Locked decisions (this session)
- **Two surfaces.** `kathabooth.com` (Squarespace) = brand/SEO face. `book.kathabooth.com` (Next.js
  on Vercel) = the booking home + studio. The storefront's **"Commission"** button bridges into the
  app. No domain cutover.
- **Brand marks LOCKED.** Two marks only — **word mark** (`katha` Fraunces-flow) + **logo mark**
  (leaf "K"). **NO maker's mark.** CTA text = **"Commission"** (no "KTHA" suffix). Canon now in
  CLAUDE.md (lines ~81–87) + HAM vault `memory.md` (2026-06-13).
- **Three aesthetic keepers** from `useful studio ai tool/`: template-library look, hard `16px 16px 0`
  sombrado shadows, black barong (`velvet-obsidian-bg.jpeg`) contrasted fill.
- **Pragmatic HoneyBook.** Keep `/api/inquiry` (Supabase + Resend + HoneyBook webhook ping) as
  owned-data. **Reconcile the two HoneyBook project ids** — widget `6809e4c1…` (AI Studio app) vs
  `/api/inquiry`/HONEYBOOK_CRM.md `679039857c…`. One is stale; decide which is live.

## Lead lifecycle (the spine — one state machine end to end)
`Inquired` → `Enriched` → `Contracted & Paid` → `Installed` → `Delivered`
- `Inquired` — 3-field intake → Supabase `leads` + HoneyBook ping + Resend enrichment.
- `Enriched` — client completed `/api/selection` (package/template/logistics); synced to HoneyBook.
- `Contracted & Paid` — HoneyBook inbound webhook flips status (HMAC-verified).
- `Installed` / `Delivered` — operator-set in `/admin/[id]` post-event.

---

# PART I — THE CLIENT JOURNEY (front-stage)

| # | Stage | Touchpoint / route | Client action | Acceptance criteria |
|---|-------|--------------------|----------------|---------------------|
| C1 | Discover | `kathabooth.com` (Squarespace) → or direct `book.kathabooth.com/` | Sees brand, library, work | Public homepage, brand-clean (word mark, no maker's mark, "Commission" CTA), barong plates + hard shadows, AA contrast, no overflow 320–1280 |
| C2 | Inquire | Storefront "**Commission**" button → bridges to `/inquire` (or homepage modal) | Submits 3 fields (name, email, event_date) | Creates a Supabase `Inquired` lead + Resend email + HoneyBook ping; user sees real success (body `ok`, not just `res.ok`); no dead links |
| C3 | Receive enrichment | Email (Resend) | Receives personalized email with tokenized portal link | Email lands ≤ ~1 min; link = `book.kathabooth.com/portal/[lead_hash]/template-design` (canonical) |
| C4 | Configure | `/portal/[id]/template-design` | Picks tier/template/customizes (names/date/venue/font/color) + uploads reference photos | Token-gated; live SVG preview; `/api/selection` flips lead → `Enriched`; user text XSS-escaped |
| C5 | Proposal & sign & pay | HoneyBook smart contract | Reviews, signs, pays | Contract carries the config; on pay, inbound webhook flips lead → `Contracted & Paid` |
| C6 | Confirm | Email + status | Confirmation | Confirmation email; status visible in `/admin` |
| C7 | Event / install | On-site | Booth installed, guests print | Operational — see Part II |
| C8 | Delivery | Prints + optional gallery | Receives prints | Same-night print SLA; gallery link if applicable |
| C9 | Post-event | Email | Review request / referral | Follow-up; referral path |

**Drift to close (Phase 2/5 below):** C2 storefront button is a **dead `/inquire` link** in
`squarespace/01_hero.html` — no live target. C3/C4 path name drifts (spec says `/reserve`, code is
`/portal/[id]/template-design`). C5 HoneyBook depends on pid reconciliation.

---

# PART II — THE OPERATOR JOURNEY (back-stage: Jed / Vince)

| # | Step | Tool / route | Acceptance criteria |
|---|------|--------------|---------------------|
| O1 | Lead alert | Supabase `leads` + Resend notify | New lead in admin + notification mail to ops |
| O2 | Triage / qualify | `/admin` (list), `/admin/[id]` (detail) | Basic-auth gated (`STUDIO_PASSWORD`); shows lead + status; `/api/admin/status` updates state |
| O3 | Send proposal | HoneyBook | Proposal under ONE reconciled pid |
| O4 | Track configuration | `/admin/[id]` reflects `Enriched` + selection | `/api/admin/notify` can re-send the portal link |
| O5 | Production dispatch | Automated email to Vince & Jed (HONEYBOOK_CRM.md Phase 4 — NOT BUILT) | On `Enriched`, ops gets the exact parameter checklist (template, layout, names/date, venue/address, add-ons) |
| O6 | Install ops | On-site runbook | Load-in checklist; booth + strobe + printer; same-night print SLA |
| O7 | Deliver + close | `/admin/[id]` → `Installed`/`Delivered` | Status advanced; prints/gallery delivered; lead archived |
| O8 | Studio (build templates) | `/studio` (protected) | 82-preset catalog editor; password-gated; `force-dynamic` |

---

# PART III — THE SYSTEM WORKFLOW (vertical slices that deliver Parts I & II)

Each slice is a **complete working path**, ordered by dependency, with a **Jed checkpoint** between
phases. All work continues on the held `feat/fable6-port` branch (homepage at `/`, studio at
`/studio`) — held until Phase 6 ratification.

### ✅ Already shipped (from 2026-05-30 plan + this session, verified)
- Single catalog `lib/templates.ts` (82 presets); preview==export.
- `/api/inquiry` (Supabase `Inquired` + Resend enrichment + HoneyBook ping),
  `/api/selection` (pluggable dispatch + Supabase `Enriched` flip),
  `/api/webhooks/honeybook` (HMAC inbound → `Contracted & Paid`),
  `/api/admin/{notify,status}`, `/api/upload-url`.
- `middleware.ts` Basic-auth gates `/studio` + `/admin` (fixes Jun-11 regression).
- `/portal/[id]/template-design` (token-gated client config), `/admin` + `/admin/[id]`.
- Deploy + DNS: `book.kathabooth.com` live on Vercel (Porkbun CNAME); env set in Vercel.
- Squarespace `katha-injection.css` injected; storefront page exists.
- **Phase 0 brand marks LOCKED** — candidate (`scratch/print_archive_v2.tsx`) + CLAUDE.md canon + vault.

### Phase 1 — Homepage as the booking home  ·  depends: Phase 0 ☑  ·  CHECKPOINT after
Vertical slice: visitor lands `/`, sees the template library, reaches the Commission CTA. Graft
the three keepers onto the brand-clean base; wire real `PRESETS` via `resolveLayout`/`VIEWBOX`,
`next/image`, fonts via `lib/fonts.ts`, barong plate `velvet-obsidian-bg.jpeg`.
- **Resolve the uncommitted Task-B `next/image` work FIRST** (finish or revert) so `app/page.tsx` is clean.
- Apply judgment fixes (false count → dynamic; XSS escape names in SVG; no `rounded-full`; no soft
  shadows/blur; drop "Curated/Bespoke/flawless/masterpiece"; modal a11y + focus-trap + `inert`).
- Remove the maker's-mark drift in `app/page.tsx` (`.makers-mark`, `logo-paint` "process seal",
  `KTHA` marginalia, "Commission KTHA" string).
- **AC:** `npm run guard` P0:0 · `tsc` 0 · build (`/` static, `/studio` dynamic) · 24/24 e2e ·
  brand-clean · no overflow 320/375.

### Phase 2 — Reconcile drift + verify checkpoint B (C2–C3 path)  ·  depends: Phase 1  ·  CHECKPOINT after
Vertical slice: clicking "Commission" captures a 3-field lead end-to-end.
- **Reconcile HoneyBook pid** — pick widget `6809e4c1…` vs `/api/inquiry`/spec `679039857c…`;
  update the surviving one in code + HONEYBOOK_CRM.md.
- Add the real **`/inquire`** route (full-page form) for storefront deep-links; both POST `/api/inquiry`.
- Make `/api/inquiry` form trust **response body `ok`** (not just `res.ok`) so a degraded env (202)
  shows the error path, not false success. (Candidate already does this; carry into app.)
- **Complete Checkpoint B** (uncompleted from 2026-05-30): phone test of branded URL + pick → email.
- **AC:** modal AND `/inquire` write `Inquired` lead + send Resend email with working portal link.

### Phase 3 — Portal → Enriched (C4 path)  ·  depends: Phase 2  ·  CHECKPOINT after
Vertical slice: from email link, client configures, lead advances.
- Align spec → code: standardize on `/portal/[id]/template-design` (drop `/reserve` in HONEYBOOK_CRM.md
  OR add a `/reserve` → `/portal` alias).
- Audit `/api/selection` XSS-safety on any user text rendered into SVG (names/date/venue) — escape
  `<>&"'` before interpolation.
- Verify `/api/upload-url` (reference photo upload) returns a usable signed URL + size/type caps.
- **AC:** token-gated portal loads the lead; completed selection persists + flips status → `Enriched`
  + ops notified; user text with `<>&"` renders safely.

### Phase 4 — HoneyBook contract + ops dispatch (C5 / O3–O5)  ·  depends: Phase 3  ·  CHECKPOINT after
Vertical slice: `Enriched` → proposal → sign/pay → `Contracted & Paid`, team notified.
- Wire the chosen HoneyBook path (widget OR `/api/inquiry` outbound) to the surviving pid.
- Build the **ops-dispatch email** (parameter checklist to Vince & Jed) on the `Enriched` transition
  — HONEYBOOK_CRM.md Phase 4, currently the only unbuilt piece of the spec.
- Simulate inbound webhook → confirm `Contracted & Paid` flip.
- **AC:** `Enriched` lead produces a HoneyBook proposal under ONE pid; simulated
  `contract_signed`/`payment_completed` flips lead; ops receives the checklist.

### Phase 5 — Fix the storefront bridge + finish checkpoints C/E (C1)  ·  depends: Phase 2  ·  CHECKPOINT after
Vertical slice: Squarespace storefront button reaches the live funnel.
- `squarespace/01_hero.html`: the **dead `/inquire` link** → `https://book.kathabooth.com/inquire`
  (or `/#commission` for modal auto-open). CTA text = **"Commission"** (drop the "KTHA").
- Preserve the `?lead=<token>` forward-link pattern documented in `squarespace/HANDOFF_GUIDE.md`.
- CSS-only with raster fallback (Squarespace constraint). **Deploy requires Vince/CMS access** — I
  prep the snippet, Jed/Vince paste it.
- App-side metadata/OG/sitemap/JSON-LD on `book.kathabooth.com` (kathabooth.com keeps primary SEO).
- **Complete Checkpoints C + E** (uncompleted from 2026-05-30).
- **AC:** storefront "Commission" button routes to the live booking flow; OG preview valid; sitemap
  lists only live routes.

### Phase 6 — Verify, adversarial re-review, ship  ·  depends: Phases 1–5  ·  Jed ratifies merge
Run the end-to-end smoke test (below); re-run the parallel adversarial swarm on integrated code;
retire the legacy `template-studio` Vercel git integration (doomed ERROR build); **Jed ratifies
`feat/fable6-port` → `main`.**

---

## Dependency graph
```
Phase 0 (marks) ─done─┐
                      ▼
                  Phase 1 (homepage) ──► Phase 2 (pid+/inquire+ckpt B) ──► Phase 3 (portal→Enriched) ──► Phase 4 (HoneyBook+ops dispatch)
                                                     │                                                        │
                                                     └──► Phase 5 (storefront fix + ckpt C/E + SEO) ─────────┘
                                                                          ▼
                                                              Phase 6 (verify → ship)
```

## End-to-end verification (one smoke test, covers all 9 client stages + 8 operator steps)
1. Storefront "Commission" → lands on `/inquire` (or modal) → submit 3 fields.
2. Supabase `leads` row appears as `Inquired`; Resend email arrives with the portal link.
3. Open portal link → configure a template → submit → lead → `Enriched`; ops gets the checklist.
4. Simulate HoneyBook `payment_completed` → lead → `Contracted & Paid`.
5. `/admin` shows the lead through every state; `/studio` is 401 without auth.
6. `npm run guard` P0:0; no overflow 320/375; marks correct (word + logo only, "Commission" CTA);
   exactly one Loko Rust element per viewport.

## Open decisions / risks (UPDATED 2026-06-13)
- **HoneyBook pid reconciliation:** RESOLVED → `679039857c…` (owned-data model).
- **Widget vs owned-data:** RESOLVED → Owned-data (`/api/inquiry` + Supabase + Resend) is canonical.
- Ops-dispatch (O5) and `/reserve`↔`/portal` naming = the two biggest spec-vs-code gaps.
- `feat/fable6-port` stays HELD until Phase 6 ratification.
- Squarespace injection deploy needs Vince/CMS access.
- Rotate the AI Studio access token pasted earlier (live credential).
