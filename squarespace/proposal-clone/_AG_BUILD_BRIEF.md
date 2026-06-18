# AG Build Brief — Proposal Clone (remaining pages)

**From:** CC (orchestrator) · **To:** AG (Antigravity/Gemini CLI, heavy lift)
**Date:** 2026-06-18 · **Deadline:** Fri 2026-06-19/20
**Chain:** Jed → CC → AG. Follow CLAUDE.md ALWAYS-ON CANON + this brief. patterns.md wins any conflict.

## What's already done (your golden template)
- `clone.css` — the COMPLETE shared brand system. **Do not edit it.** Reuse its classes verbatim.
- `js/clone.js` — nav toggle + annotation layer + `#inquiry-form` validation. **Reuse as-is.**
- `index.html` — the GOLDEN Home page. Copy its `<header>`, `<footer>`, the `.annot-toggle` button, and the `<script>` line into every page unchanged. Mirror its section patterns + the `data-annot="BEFORE… AFTER…"` convention.

## Your task
Build 5 pages in `squarespace/proposal-clone/`, each reusing the golden header/footer/CSS/JS:
`installations.html` · `founders.html` · `terms.html` · `contact.html` · `changelog.html`

Then write your handoff to `/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/handoff/2026-06-18_proposal-clone_build.md` and append one line to `inbox.md`.

## Rules (non-negotiable)
1. **Voice:** zero forbidden vocab in VISIBLE copy — no `timeless, experience(s), curating, curation, elevate/elevating, keepsake, journey, unforgettable, stunning, amazing, magic(al), luxury, premium, aesthetic (noun), authentic`. `Curated` + `Handcrafted` permitted ≤3 each PER PAGE.
2. **Redundancy:** kill the "architecture/-al/-es" saturation — vary with installation, booth, build, frame, form, shell, setup. De-duplicate the tier boilerplate so each tier reads distinct.
3. **CTA (unified, "Commission" retired):** `Request a Proposal` · `Reserve Your Date` · `Begin Your Inquiry` · `Send Inquiry` · keep `Sign Me Up`.
4. **Marks:** NONE. Text header "KATHA BOOTH" only — no Katha logomark/wordmark on this surface.
5. **Sacred CTA:** exactly ONE `.cta-sacred` (Loko Rust) per page; all other CTAs use plain `.cta`.
6. **Annotations:** wrap each changed element with `data-annot="BEFORE: … AFTER: …"` so the "What changed" toggle shows the rationale.
7. **Functionality must work:** mobile nav, contact form validation, dropdowns, smooth nav, responsive at 375/768/1280.

---

## PAGE COPY DIFFS (bake the AFTER; annotate the BEFORE)

### installations.html  (renamed from "Architectures")
- **Hero** (sacred CTA here): H1 **"Our Installations"** · sub **"Portrait booths deployed across Los Angeles and Orange County."** · CTA **"Request a Proposal"**.
  `BEFORE: 'CURATED ARCHITECTURE' / 'Portrait architecture deployed…' / 'Request Bespoke Proposal'. AFTER: 'architecture' removed; CTA refined.`
- **Our Approach** (ghost CTA): "Quality should never be compromised by logistics. We engineer gallery-tier portrait setups within temporary spaces, pairing high-fidelity color calibration with a minimalist physical chassis. Our presence is intentional. Our execution is silent. Our output endures." · CTA "Request a Proposal".
  `BEFORE: 'Architecture should never… output is timeless'. AFTER: 'Quality…'; timeless→endures; architecture removed.`
- **Four tiers** (accordion or stacked `.tier`; each ghost CTA "Reserve Your Date"):
  1. **Signature // Oak — $949:** "Dark oak hardware, studio-grade optics, high-fidelity color. Built to settle into historic estates and grand celebrations without intruding." `BEFORE: '…integrate seamlessly into historic estates, heritage properties, and timeless celebrations.' AFTER: heritage+timeless removed, boilerplate de-duped.`
  2. **Editorial // Oak — $1,149 (flagship):** "Our flagship. Dark oak hardware configured exclusively for refined black-and-white portraiture — stark, high-contrast frames that hold their weight for years." `BEFORE: 'flagship Katha Booth experience … timeless icons.' AFTER: experience + 'algorithm' jargon + timeless removed.`
  3. **Modernist // White — $749:** "A sleek white chassis with studio-grade optics — a clean, luminous presence for contemporary galleries and modern industrial rooms." `BEFORE: long 'architecture' + 'avant-garde' boilerplate. AFTER: tightened.`
  4. **Monochrome // White — $949:** "White hardware tuned for refined black-and-white portraiture — high-contrast, razor-sharp frames for clean-lined lofts and corporate galas." `BEFORE: '…luxury lofts and high-end corporate galas.' AFTER: luxury + algorithm jargon removed.`
- Keep `Curated`/`Handcrafted` ≤3 across the whole page (you may use "Handcrafted" once in a tier if it reads well).

### founders.html
- **Intro:** keep the strong clinical-rigor narrative; only swap "channeled into portrait **architecture**" → "channeled into portrait **work**" and tighten the last sentence. `BEFORE: 'portrait architecture'. AFTER: 'portrait work'.`
- **Foundation Manifest:** J GREPO focus "Technical Calibration, Operational Workflow, **Experience** Engineering" → "…**Event** Engineering". `BEFORE: 'Experience Engineering'. AFTER: 'Event Engineering'.` V GREPO unchanged. Stats unchanged (Inception '25 · Verified Appraisals 40+ · Satisfaction 100%).

### terms.html
- Full sweep: **every** "OAX Photo Booth" → "Katha Booth"; `info@oaxphotobooth.com` → `kathabooth@gmail.com`. `BEFORE: 'OAX Photo Booth' / 'info@oaxphotobooth.com'. AFTER: Katha Booth / kathabooth@gmail.com.`
- Section-title cleanup: "1. The **Experience** & Intentional Use" → "1. Intentional Use"; "3. **Curated** Pricing & Services" → "3. Pricing & Services"; any "digital **experience**" → "digital service". Keep legal substance intact; just remove forbidden vocab + OAX.

### contact.html
- **Heading:** "Let's Work Together" (keep). **Intro:** "To begin planning your event, share a few details below. We review every inquiry with care and reply within 24 hours to discuss how we can shape your celebration." `BEFORE: 'begin curating your event experience … elevate your celebration.' AFTER: curating→planning; experience removed; elevate→shape.`
- **Form** (`id="inquiry-form"`, fields use `.field`): Name (First/Last, required) · Phone (required) · Email (required) · Event Date (required) · Event Start Time · Event/Venue Address (required) · Event Type (select) · **"Choose Your Installation"** (select, required) · Message (required) · submit `.cta .cta-sacred` **"Send Inquiry"**.
  - The installation dropdown options = the 4 canonical tiers: `Signature // Oak — $949`, `Editorial // Oak — $1,149`, `Modernist // White — $749`, `Monochrome // White — $949`.
  `BEFORE: 'CHOOSE YOUR AESTHETIC' + legacy options (Signature/Editorial/Vintage/Vantage/Portfolio). AFTER: 'Choose Your Installation' + 4 canonical tiers.`

### changelog.html  (no annotation toggle needed; static)
Three sections, plain `.section` blocks:
1. **"What we changed — within Vince's permission"** — table per page summarizing voice subs, CTA refinements, OAX cleanup, redundancy reduction.
2. **"Recommendations for your live site — your call"** (FLAG-only):
   - **SEO/AIO:** the live site is private (nothing is indexable — publish + allow indexing); fix the H1 typo `ARCHTECURE`→`ARCHITECTURE`; add meta descriptions + OpenGraph; add LocalBusiness + Service structured data (the 4 tiers w/ price) for local + AI search; add image alt text.
   - **Accessibility:** raise contrast on the Philosophy text-over-texture; the footer logo image is broken (missing asset); confirm form focus states.
   - **Site bugs:** Architectures CTA → `/about` is a 404; the Process "04. DELIVERY" step is duplicated; (the tier dropdown mismatch is already proposed-fixed in this clone).
   - **Testimonials:** lightly softened in this mock to drop forbidden vocab — confirm any wording change with the client, or keep verbatim.
3. **"Open proposals"** — tier naming (open to rename); the "Architectures" section renamed to "Installations".

---

## Verification before you hand back
- Per page: run a forbidden-vocab grep on VISIBLE text (exclude `data-annot` values) → zero; `Curated`/`Handcrafted` ≤3 each; "architect*" count materially reduced.
- Every page opens + navigates desktop AND mobile; contact form validates + shows success; no console errors.
- No `logo-*`/`wordmark-*` asset references anywhere.
