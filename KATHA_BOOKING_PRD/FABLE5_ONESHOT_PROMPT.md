# Fable 5 — One-Shot Build Prompt

> **How to use:** Open a fresh **Fable 5** (`claude-fable-5`) session in this repo (`/Users/jedg./Desktop/kat_ha_pb`). Paste everything in the fenced block below as your first message. It is self-contained and points Fable 5 at the PRD + the three prototype files. Do not add "be creative" — the whole design is already decided; you want faithful execution, not improvisation.

---

```
You are building the launch version of the Katha Booth booking experience in ONE pass. This is a faithful execution task, not a redesign — every design decision is already made and documented. Do not invent brand, colors, fonts, or copy.

READ FIRST, IN THIS ORDER (they are your complete, authoritative spec):
1. /Users/jedg./Desktop/kat_ha_pb/KATHA_BOOKING_PRD/KATHA_BOOKING_PRD.md      ← the full build spec. Obey it.
2. /Users/jedg./Desktop/kat_ha_pb/KATHA_BOOKING_PRD/content.json              ← source of truth for tiers/pricing/add-ons/palettes/tokens/copy.
3. /Users/jedg./Desktop/kat_ha_pb/katha-booking-html/design.html              ← THE VISUAL CEILING. The rendered design specimen — tokens, type, motion law, every component state, the real catalog, do/don't. Match this aesthetic and quality exactly; it is deployed at katha-booking-html.vercel.app for reference.
4. /Users/jedg./Desktop/kat_ha_pb/katha-booking-html/_reference/1_booking_intake.html  ← implementation reference (exact GSAP, markup, interactions).
5. /Users/jedg./Desktop/kat_ha_pb/katha-booking-html/_reference/2_template_customizer.html
6. /Users/jedg./Desktop/kat_ha_pb/katha-booking-html/_reference/3_confirmation_ticket.html

IGNORE /Users/jedg./Desktop/kat_ha_pb/DESIGN.md — it is a STALE light-theme spec that does NOT describe this product. The canonical design is the dark "Roasted Archive" system in the PRD §4 and the three prototype files.

WHAT TO BUILD (two files):
1) OVERWRITE the redirect stub at /Users/jedg./Desktop/kat_ha_pb/katha-booking-html/index.html with the unified 3-step booking flow (Intake → Design → Ticket) — one seamless experience, single shared STATE (PRD §7.1). The confirmation ticket MUST render the client's REAL selections from STATE (name/title, human-formatted date from STATE.date, venue, tier, price, ONLY chosen add-ons, real leadId) — never the hardcoded "LORENZO & CORAZON / $949 / #8D49F03B / three fake add-ons".
2) NEW /Users/jedg./Desktop/kat_ha_pb/katha-booking-html/admin.html — the availability admin portal (PRD §7.7): Supabase magic-link auth, RLS-gated writes to the `available_dates` table (toggle a day open/closed, mark booked), same Roasted Archive styling. Backend + RLS already exist; kathabooth@gmail.com is seeded as admin.

REAL DATA IS PINNED — do NOT invent tiers/prices. Render tiers/add-ons/copy from content.json (real catalog, scraped from the live form): Editorial $949, Glam Editorial $1,149 (default), Architectural $749 (render DISABLED/"Currently Unavailable"), Katha Booth $549; add-ons Bespoke Backdrop $499, White Flower Backdrop $499, Additional Hour(s) $149/hr as a 0–2 stepper. Also add the real intake fields (event type, indoors/outdoors, start time, guest count, how-heard) and the privacy line — fold the extras into leads.notes as JSON (§7.4).

SUPABASE IS WIRED (content.json.supabase): url https://hvvomiyskizxzhyytcfd.supabase.co + anon key (safe client-side, for the calendar read + admin auth). Lead inserts go through the serverless fn api/lead.js using the SERVICE-ROLE key from Vercel env (never in client). Availability is an ALLOW-LIST: the public calendar shows only available_dates with status='open' and date ≥ today+7; on fetch failure show a visible "unavailable" state, never a silent empty calendar.

HARD REQUIREMENTS — the PRD is authoritative; these are the audit-hardened points a fast pass most often gets WRONG:
- Lead insert (PRD §7.4): submitLead builds a WHITELISTED row for the real `leads` table — client_name, client_email, client_phone, event_date (ISO TEXT), lead_hash (crypto.randomUUID()), venue_name, tier_selected, addons (stringified), notes (incl. a JSON blob of format/title/subtitle/palette), status. There is NO price/title/subtitle/palette COLUMN — sending them makes Supabase reject the whole insert. Do NOT copy actions.ts field naming (it's buggy). Single async call site; idempotent on re-submit (guard on STATE.leadId); on failure show a readable error and DO NOT advance; never fake "Secured". mailto is NOT a launch transport — use Formspree or the serverless fn.
- Availability (§7.5): dynamic current+next 2 months; past + min-notice dates blocked; use the Supabase ANON key (never service_role) for the booked_dates REST read; parse dates as LOCAL not UTC (no off-by-one); on fetch FAILURE show a visible "unavailable" state, do NOT silently render an empty calendar.
- Motion law (§4.3), LOCKED: tilt ≤6°, settle/return ≥1.2s power3/4.out; PRESERVE the shutter's power4.inOut and the format morph's power3.inOut (do not "correct" them). Wrap timelines in gsap.matchMedia, AND add the reduce-branch that force-reveals ticket folds (opacity:1), parts/hides the shutter blades, and reveals the wordmark — otherwise reduced-motion users get a blank/covered page. Verify by loading with reduce ON.
- Shutter is NOT reusable as-is (§8): it only exists on page 1, fused to the intro loader, with no back variant. Build a goToStep(n,dir) machine: 3 sibling <section> toggled via [hidden], ONE root blade pair, an isTransitioning lock (guards double-clicks), hydrate-from-STATE on swap, decoupled from the intro loader.
- Accessibility (§9.1): tiers + add-ons = hidden native <input radio/checkbox> + <label> (free keyboard/ARIA — don't hand-roll roles). Focus ring = --color-hi, NOT --color-loko (loko is 2.8:1, fails). Error text readable in hi/mut with a loko accent (loko text fails contrast). Calendar = real keyboard grid OR honest <input type=date> fallback (no fake grid). Replace alert() with inline aria-described errors; aria-live for total/validation/submit; skip link. Contrast: fix --color-fnt on l1/l2 (bump to --color-mut) and the slot caption; leave passing pairs alone.
- Responsive ≥320px: single-column stack; tap targets ≥44px; covering blades 100lvh (content 100dvh); mobile CTA bar uses env(safe-area-inset-bottom) and isn't trapped by the keyboard; no horizontal scroll. Test 320/375/768/1280.
- Performance: precompile Tailwind to a static styles.css (Tailwind CLI) — the prototype defines ZERO layout utilities locally, so do NOT just delete the CDN (that collapses the layout); if precompiling isn't feasible, KEEP the CDN and flag it. FH Ronaldson is local .otf (preload it); Fraunces/Outfit/Courier woff2 are NOT in-repo — keep the Google <link>+swap (self-hosting them is a Jed follow-up). defer GSAP. ZERO console errors is your hard gate; Lighthouse/CLS numbers are Jed's to verify.
- Render all content/tokens/copy from content.json (do not re-hardcode); preserve UTF-8 × and • glyphs.
- Ticket paper stays fixed bone #F7F5F1 (it's the voucher, a different artifact from the Step-2 print) with the palette recorded as a labeled line — do not apply dark palettes to the ticket bg.
- Customizer (Step 2) — MATCH the prior book.kathabooth.com model, do NOT flatten it (PRD §7.3). Read photobooth-template-studio/lib/layouts.js (LAYOUT REGISTRY — slot + textZone rectangles), lib/templates.ts (48 real "Katha Signature —" presets), and app/portal/[id]/template-design/TemplateDesignClient.tsx (reference render). Model: browse a gallery of real presets → pick a style → personalize names/date/venue (+font, text-position) → faithful live preview whose slots + text-zone are absolutely positioned as PERCENTAGES of the layout viewBox (left = slot.x/viewBox.w*100, etc.) → optional reference-photo upload to Supabase Storage. Preview slots stay EMPTY (client's booth photos print there). Persist the design to the `selections` table (lead = leads.lead_hash). Do NOT use a generic 2-format placeholder card.
- Photography — REAL work is required (PRD §6.6). Use the bundled real Katha photos at katha-booking-html/assets/portfolio/ (manifest: content.json.portfolio) in a portfolio gallery + hero atmosphere + optionally tier cards. Lazy-load, descriptive alt, keyboard-navigable. NEVER put stock photos inside the customizer preview slots.
- HoneyBook handoff (PRD §14.1a) — do NOT gloss this: payments/contracts are 100% HoneyBook. You CANNOT create the HoneyBook form or its triggers (Jed builds those in HoneyBook). You build ONLY the branded "Reserve your date" seam wired to a single config point `content.json.integrations.HONEYBOOK_LEAD_FORM` (URL or embed snippet). Present it as a first-class, on-brand transition (Roasted Archive framed panel/drawer) — never a raw un-styled HoneyBook iframe dropped inline, never a fake HoneyBook/invoice/contract/payment form, never a double-entry re-type of everything, never assume URL prefill works. If HONEYBOOK_LEAD_FORM is empty, render the styled seam with a clear placeholder + comment (not a fake success). The custom flow stays the source of truth (full lead → Supabase); HoneyBook owns the transaction after the seam.
- Move the old 1_/2_/3_*.html into katha-booking-html/_archive/; ensure nothing references those paths anymore.

BUILD EXACTLY TO THE "DEFINITION OF DONE" CHECKLIST IN PRD §12. When finished, go through §12 item by item and report which are met and which (if any) are not, with reasons. Where PRD §13 marks a business fact as PLACEHOLDER, build with the given default and leave a clearly-commented single swap point — do not stop to ask; note it in your final report instead.

Do not deploy. Leave the site ready for `npx vercel` review. Keep every ounce of the existing craft — the grain, the wabi-sabi wordmark, the shutter, the accordion ticket, the perforations — while making it real, accessible, and whole.
```

---

### Notes for Jed (not part of the prompt)

- **Before you paste it live:** skim PRD **§13** and decide the four business facts (pricing, submit transport + keys, availability source, domain). Fable 5 will build on the defaults regardless, but you'll need these settled to serve real clients. If you want, answer §13 in a sentence appended to the prompt and Fable 5 will wire your choice instead of the default.
- **If the one-shot comes back partial** (a fast model on a large scope), the §12 checklist doubles as your punch-list: hand the unchecked items back to Fable 5 (or me) as a focused follow-up.
- **Verification after the build:** run it locally / `npx vercel`, then check the DoD — especially (a) the ticket shows *your* test inputs, (b) a test lead actually lands (email or Supabase), (c) reduced-motion works (toggle it in OS settings), (d) mobile at 375px.
