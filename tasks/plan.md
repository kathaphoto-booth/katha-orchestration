# Plan — Template Gallery → HoneyBook Integration & Launch Sequencing

_Last updated: 2026-05-30_

## Decisions locked (with Jed)

1. **Deploy now, standalone.** The gallery is a Next.js app → it lives on **Vercel** (the `book.kathabooth.com` track), NOT rebuilt inside Squarespace. It works today, independent of the Squarespace launch. At launch, `kathabooth.com/template-gallery` simply redirects/iframes to it. **One source of truth** (`lib/templates.ts`) stays intact — no Squarespace re-implementation, no preview≠export drift.
2. **Email-first feedback that upgrades into HoneyBook sync.** `/api/selection` is built with **pluggable dispatch targets**. Target #1 = email notification (Resend) now. Target #2 = push to the HoneyBook contract (PID `679039857c7a9b001f4098a8`) added later — same payload, same endpoint, zero rework.

## Why this is the right architecture (not just expedient)

`HONEYBOOK_CRM.md` already specifies this: a token-authed `/reserve` panel where the client picks **Tier, Template, Gallery, Logistics**, syncing to the HoneyBook contract. The gallery built on 2026-05-30 IS the missing **template-selection step** of that documented pipeline. We are not inventing topology — we are filling in a phase that was already designed. The dual-track split (Squarespace = marketing/SEO, Vercel = the app) is the project's stated deployment topology in `CLAUDE.md`.

## Current state (done)

- `lib/templates.ts` — single source of truth (PRESETS + `renderDecorativeSvg`), consumed by studio + export + gallery.
- Studio at `/` (admin tweak tool). Gallery at `/gallery` (client-facing, text-free vibe picker, tier filter, two-stage personalize modal). Selection currently saved to `localStorage` only.
- 6 Katha Signature templates; render paths unified (preview == export); AI routes fixed.

---

## Dependency graph

```
                          [lib/templates.ts]  ✅ done
                                  │
                ┌─────────────────┴───────────────────┐
            [studio /]  ✅                        [gallery /gallery]  ✅
                │                                       │
        (A3) gate studio                     (A2) submit → POST /api/selection
                │                                       │
                │                              (A1) /api/selection
                │                                ├─ record (localStorage now; Supabase later)
                │                                └─ dispatch target #1: email (Resend)
                └───────────────┬───────────────────────┘
                                ▼
                        (B) Deploy to Vercel + env
                                │
                        (B3) Porkbun DNS → book.kathabooth.com
                                │
              ┌─────────────────┼─────────────────────┐
        (C) HoneyBook link   (D) dispatch #2:      (E) Squarespace
        + ?lead= identity     HoneyBook sync        /template-gallery
                              (upgrade of A1)        redirect (at launch)
```

Critical path to "hosted gallery where a client picks and Jed is notified": **A1 → A2 → A3 → B → B3 → C2.**
D and E are independent upgrades that do not block the critical path.

---

## Phases (vertically sliced — each ends in a working, demoable path)

### Phase A — Make the pick actionable + protect the studio
**Goal:** A client can pick a template and Jed gets notified; the admin editor is not public.

- **A1. `/api/selection` endpoint with pluggable dispatch.**
  - Accepts the selection payload (already shaped: `{templateId, templateName, layout, names, date, venue, lead?, selectedAt}`).
  - Records it (MVP: append to a store; Supabase table added in backlog).
  - Dispatch target #1: email to Jed via **Resend** (template name + client details).
  - Structured so target #2 (HoneyBook) is an added function call, not a rewrite.
  - **Acceptance:** `curl -XPOST /api/selection` with a sample payload → `200`; Jed receives an email containing template + names + date + venue.
  - **Verify:** curl locally; check inbox.

- **A2. Wire gallery submit → POST `/api/selection`.**
  - Replace localStorage-only with a real POST (keep localStorage as offline fallback). Show the "Thank you" screen only on `200`; show a soft error otherwise.
  - **Acceptance:** Clicking "Choose this style" fires the POST and the email arrives.
  - **Verify:** browser run on localhost; observe network 200 + inbox.

- **A3. Gate the studio (`/`).**
  - Add Next.js middleware: `/gallery` and `/api/selection` are public; `/` (studio) + other AI routes require a shared `STUDIO_PASSWORD` (basic-auth or a cookie gate via env).
  - **Acceptance:** visiting `/` without the password is blocked; `/gallery` loads freely.
  - **Verify:** incognito hit on `/` → challenged; `/gallery` → open.

- **Checkpoint A (human):** On localhost, run a full pick → confirm email arrives and studio is gated. _Approve before deploying._

### Phase B — Deploy + branded URL
- **B1. Env prep.** `GEMINI_API_KEY`, `RESEND_API_KEY`, `STUDIO_PASSWORD` (+ Resend from-address). Document in `.env.example`.
  - **Acceptance:** app runs locally with these set; `/api/selection` sends real email.
- **B2. Deploy to Vercel.** _(Jed triggers — outward-facing action.)_ Set env vars in Vercel project.
  - **Acceptance:** public Vercel URL serves `/gallery` (open) and `/` (gated).
- **B3. Porkbun DNS → Vercel.** Add `book.kathabooth.com` (or `gallery.kathabooth.com`) as a domain in Vercel; create the matching CNAME in Porkbun.
  - **Acceptance:** the branded subdomain resolves over HTTPS to the gallery.
- **Checkpoint B (human):** Open the branded URL on a phone; run a pick; confirm email.

### Phase C — HoneyBook integration (link + identity)
- **C1. Lead identity.** Gallery reads `?lead=<token>` and includes it in the selection payload (works without it too).
  - **Acceptance:** a pick from a tokenized link is attributable to that client in the email/record.
- **C2. HoneyBook form → gallery link.** Replace/augment the current HoneyBook design questionnaire with a button/link to the gallery URL (tokenized per client if HoneyBook can pass a param; else a generic link).
  - **Acceptance:** client clicks from HoneyBook → gallery → pick recorded + emailed.
- **Checkpoint C (human):** Run one real (or test) client from the HoneyBook form through to the inbox.

### Phase D — Upgrade: notification → HoneyBook contract sync (Jed's "convert #1 into #2")
- **D1. Add HoneyBook as dispatch target #2** in `/api/selection` — same payload, push to project PID `679039857c7a9b001f4098a8` via HoneyBook API **or** a Zapier catch-hook.
  - **Dependency:** HoneyBook API token OR a Zapier account (not set up yet — flagged).
  - **Acceptance:** a pick appears in the HoneyBook project automatically, in addition to the email.
- **Checkpoint D (human):** Pick → both email AND HoneyBook project updated.

### Phase E — Squarespace launch integration (when `kathabooth.com` goes live)
- **E1. `kathabooth.com/template-gallery`** Squarespace page → redirect or iframe to the Vercel gallery.
  - **Acceptance:** the branded marketing URL reaches the gallery.
- **E2. Storefront CTAs** ("Choose your template") link to it.
  - **Acceptance:** nav/buttons route correctly.
- **Checkpoint E (human):** Launch review with Vince.

---

## Backlog / parallel (non-blocking)
- Classic-template **vertical-postcard decorations** (Katha Signature already complete; ~20 classics fall back to a border on vertical).
- **Fraunces** font load for Katha templates (currently Cormorant/Italiana) to match the brand book.
- Full `HONEYBOOK_CRM.md` pipeline: Supabase `leads`/`selections` tables + `/api/inquiry` 3-field intake + Resend enrichment email + `/reserve` token panel. (Bigger build; post-launch. The gallery slots in as the template step.)
- Move selection persistence from localStorage → Supabase `selections` table.

## Risks / notes
- Deploying exposes BOTH `/` and `/gallery` — **A3 (gate studio) must ship before/with B2.**
- Resend needs a verified sending domain or its onboarding address; use a verified `from` to avoid spam.
- HoneyBook's ability to pass a per-client token into an outbound link determines whether C1 is automatic or manual-per-client.
- 1 event/month: email-first is sufficient; don't over-build D before there's friction.
