# TODO — Template Gallery → HoneyBook → Launch

Status: ☐ todo · ◐ in progress · ☑ done. See `tasks/plan.md` for full detail, acceptance criteria, and dependency graph.

## ✅ Already done (2026-05-30)
- ☑ Extract shared catalog → `lib/templates.ts` (single source of truth)
- ☑ Unify render paths (preview == export)
- ☑ 6 Katha Signature templates (all 3 formats)
- ☑ Client gallery `/gallery` (text-free, tier filter, personalize modal)
- ☑ Fix AI routes (valid model + brand-safe prompts)

## Phase A — Make the pick actionable + protect the studio  ✅ DONE
- ☑ **A1** `/api/selection` route built: pluggable dispatch (Resend email + HoneyBook stub). Returns 202 (no env) or 200 (dispatched). Forbidden-word guard active.
- ☑ **A2** Gallery POSTs to `/api/selection` on confirm, with `?lead=<token>` threading + localStorage fallback. Soft-success on network error.
- ☑ **A3** `middleware.ts` Basic-auth gates `/` + `/api/generate*` via `STUDIO_PASSWORD`. `/gallery` + `/api/selection` public. Disabled if password unset (local dev).
- ☑ Verified: tsc clean, build passes, curl test of /api/selection returns 202 with proper dispatch report.

## Phase B — Deploy + branded URL  ← IN PROGRESS
- ☑ **B-infra** GitHub: code pushed to `kathaphoto-booth/template-studio` (force-push to overwrite empty init). Vercel collaborator setup unblocked.
- ☑ **B1** `.env.example` full production inventory (STUDIO_PASSWORD, RESEND_API_KEY, NOTIFICATION_EMAIL, GEMINI_API_KEY, HoneyBook/Supabase Phase-D slots).
- ☐ **B2-dashboard** Connect Vercel project to `kathaphoto-booth/template-studio` repo via the dashboard (replaces stale CLI link). Steps in `DEPLOY.md`.
- ☐ **B2-env** Set env vars in Vercel: `STUDIO_PASSWORD`, `RESEND_API_KEY`, `NOTIFICATION_EMAIL`. Redeploy.
- ☐ **B2-protection** Disable Vercel Deployment Protection for production → gallery accessible.
- ☐ **B3** Porkbun DNS → CNAME `book` → `cname.vercel-dns.com.`. Add `book.kathabooth.com` in Vercel Domains.
- ☐ **Checkpoint B** — phone test branded URL + pick → email arrives.

## Phase C — HoneyBook integration (link + identity)
- ☐ **C1** Gallery reads `?lead=<token>` → include in payload. _AC: pick attributable to client._
- ☐ **C2** HoneyBook form → button/link to gallery (tokenized if possible). _AC: HoneyBook → gallery → recorded + emailed._
- ☐ **Checkpoint C** — one real/test client end-to-end.

## Phase D — Upgrade notification → HoneyBook contract sync ("convert #1 into #2")
- ☐ **D1** Add HoneyBook (API or Zapier) as dispatch target #2 in `/api/selection`. _Dep: HoneyBook API token or Zapier (not set up)._ _AC: pick appears in HoneyBook project PID 679039857c7a9b001f4098a8._
- ☐ **Checkpoint D** — pick → email + HoneyBook both update.

## Phase E — Squarespace launch integration (when site live)
- ☐ **E1** `kathabooth.com/template-gallery` → redirect/iframe to Vercel gallery.
- ☐ **E2** Storefront CTAs link to gallery.
- ☐ **Checkpoint E** — launch review with Vince.

## Backlog (non-blocking)
- ☐ Classic-template vertical-postcard decorations
- ☐ Fraunces font for Katha templates
- ☐ Supabase `selections`/`leads` tables; move persistence off localStorage
- ☐ Full `HONEYBOOK_CRM.md` pipeline (`/api/inquiry` 3-field intake + Resend enrichment + `/reserve` panel)
