# TODO — Katha Genesis Operating Workflow

Status: ☐ todo · ◐ in progress · ☑ done. See `tasks/plan.md` for full detail, acceptance criteria,
dependency graph. Genesis revision 2026-06-13: picks up from uncompleted checkpoints + drift since
the 2026-05-30 plan (whose Phases A–D + the broader HoneyBook pipeline are ☑ in code).

## ✅ Already shipped (carried forward, verified)
- ☑ Single catalog `lib/templates.ts` (82 presets); preview==export render unification.
- ☑ `/api/inquiry` (Supabase `Inquired` + Resend + HoneyBook ping), `/api/selection` (Supabase
  `Enriched`), `/api/webhooks/honeybook` (HMAC inbound → `Contracted & Paid`),
  `/api/admin/{notify,status}`, `/api/upload-url`.
- ☑ `middleware.ts` gates `/studio` + `/admin` via `STUDIO_PASSWORD` (Jun-11 regression fixed).
- ☑ `/portal/[id]/template-design`, `/admin`, `/admin/[id]` built.
- ☑ Deploy: `book.kathabooth.com` live on Vercel; Porkbun CNAME; env set.
- ☑ Squarespace injection CSS in place.
- ☑ **Phase 0 brand marks LOCKED** — candidate fixed, CLAUDE.md canon updated, vault `memory.md`
  recorded (2026-06-13). Marks: word mark + logo mark only. NO maker's mark. CTA = "Commission".

## Phase 1 — Homepage as the booking home
- ☐ **1A** Resolve uncommitted Task-B `next/image` work in `app/page.tsx` (finish OR revert) so the
  branch is clean before grafting. AC: working tree clean on `feat/fable6-port`.
- ☐ **1B** Remove maker's-mark drift in `app/page.tsx`: `.makers-mark` SVG, `logo-paint` "process
  seal", `KTHA` marginalia, every "Commission KTHA" → "Commission".
- ☐ **1C** Graft the three keepers from `useful studio ai tool/`: template-library aesthetic, hard
  `16px 16px 0` sombrado shadows, black barong (`velvet-obsidian-bg.jpeg`) plate.
- ☐ **1D** Wire real `PRESETS` (`lib/templates.ts`) + `resolveLayout`/`VIEWBOX`; swap `<img>` → `next/image`;
  fonts via `lib/fonts.ts` CSS vars; inline `<style>` → `app/globals.css`.
- ☐ **1E** Judgment fixes from AI Studio app: dynamic catalog count (no false "Sixty-three"); XSS-
  escape user text in any SVG; remove `rounded-full` swatches/dots; remove soft shadows/blur; copy
  pass ("Curated"/"Bespoke"/"flawless"/"masterpiece" → on-voice); modal a11y (`role=dialog`, focus-
  trap, focus-return, `inert`, labeled `<X>`).
- ☐ **Checkpoint 1 (Jed):** desktop + 375px screenshots; brand guard green; visual sign-off.

## Phase 2 — Reconcile drift + close C2 (inquiry path)
- ☐ **2A** **Reconcile HoneyBook pid** — pick widget `6809e4c1…` vs `/api/inquiry`/spec `679039857c…`;
  update the survivor in code + HONEYBOOK_CRM.md.
- ☐ **2B** Add **`/inquire`** page route (full-page form; same `InquiryPayload` shape as the modal).
- ☐ **2C** Change `/api/inquiry` form to trust **response body `ok`**, not just `res.ok` (degraded-env
  202 must NOT show "Received").
- ☐ **2D** Phone smoke test the branded URL: tap "Commission" → submit → Supabase `Inquired` row +
  Resend mail with portal link arrives.
- ☐ **Checkpoint 2 (Jed):** the 2026-05-30 Checkpoint B (uncompleted) — phone test signed off.

## Phase 3 — Portal → Enriched (C4)
- ☐ **3A** Spec/code alignment: standardize on `/portal/[id]/template-design` (drop `/reserve` in
  HONEYBOOK_CRM.md OR add `/reserve` → `/portal` alias).
- ☐ **3B** Audit `/api/selection` XSS-safety: escape `<>&"'` in names/date/venue before any SVG
  interpolation.
- ☐ **3C** Verify `/api/upload-url` (reference photo upload): signed URL works, size/type caps enforced.
- ☐ **Checkpoint 3 (Jed):** real (or test) client end-to-end through portal → `Enriched`.

## Phase 4 — HoneyBook contract + ops dispatch (C5 + O3–O5)
- ☐ **4A** Wire the chosen HoneyBook path (widget OR `/api/inquiry` outbound) to the surviving pid.
- ☐ **4B** **Build ops-dispatch email** on `Enriched` → parameter checklist to Vince & Jed
  (template, layout, names/date, venue/address, add-ons). _The only unbuilt spec piece._
- ☐ **4C** Simulate HoneyBook `payment_completed` webhook → confirm lead flips to `Contracted & Paid`.
- ☐ **Checkpoint 4 (Jed):** the 2026-05-30 Checkpoint D (uncompleted) — both email + HoneyBook update.

## Phase 5 — Fix storefront bridge + checkpoints C/E
- ☐ **5A** `squarespace/01_hero.html` — change dead `/inquire` → `https://book.kathabooth.com/inquire`
  (or `/#commission`); CTA text "Commission" (drop "KTHA"); preserve `?lead=` forwarding per
  `squarespace/HANDOFF_GUIDE.md`.
- ☐ **5B** Prepare CSS-only injection snippet (raster fallback per Squarespace constraint) — Jed/Vince
  paste it via CMS.
- ☐ **5C** App SEO: metadata + canonical + OG/Twitter on `app/layout.tsx` + `app/page.tsx`;
  `app/sitemap.ts` + `app/robots.ts` list only live routes; LocalBusiness/Organization JSON-LD.
- ☐ **Checkpoint 5 (Jed):** the 2026-05-30 Checkpoints C + E (uncompleted) — storefront button reaches
  live funnel; Vince launch review.

## Phase 6 — Verify, adversarial re-review, ship
- ☐ **6A** Run the end-to-end smoke test (plan §End-to-end verification): C1→C9 + O1→O8.
- ☐ **6B** Re-run the parallel adversarial swarm on the integrated code.
- ☐ **6C** Retire the legacy `template-studio` Vercel git integration (doomed ERROR build).
- ☐ **6D** **Jed ratifies** `feat/fable6-port` → `main`; push to deploy.

## Open / risks
- ☑ Decide HoneyBook pid: `679039857c…` is canonical.
- ☑ Widget vs owned-data: Owned-data model is canonical.
- ☐ Rotate the AI Studio access token pasted earlier (live credential — security).
- ☐ Squarespace injection deploy needs Vince/CMS access.
