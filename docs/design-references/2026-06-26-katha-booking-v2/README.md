# Katha Booking v2 — design reference (ingested 2026-06-26)

**Source:** https://claude.ai/public/artifacts/35bc3930-847f-4ccc-af2e-36c3dbfc1ff1
("first ever public-record one-shot booking design system," Jed-approved)

**Status:** Frontend design reference ONLY. Not wired to any backend. This is a
new iteration of the template library / booking system front end — scope per
Jed: front end design only, backend wiring is separate, future work.

## What's actually in this folder

- `hero-viewport.png` — real screenshot of the hero section (1920×1080), captured live.
- `page-content.md` — full text content/copy scraped from the rendered page (hero, stats,
  catalog grid, filters, 8 example design cards, email capture, footer).

## What's NOT in this folder, and why

The actual component source (React/JSX) could not be captured. Claude.ai artifacts render
in a sandboxed cross-origin iframe (`claudeusercontent.com`) that requires a live
postMessage handshake with the claude.ai parent frame — visiting that URL directly (with
or without its full query string) just redirects to claude.com's marketing site, not the
artifact. The text content above WAS captured (the claude.ai wrapper page's headless
render did complete the handshake), but the underlying source code was not retrievable
this way. If literal component code is needed, it has to come from Jed (export/copy from
the Claude.ai UI directly) — an agent fetching the URL cannot get it.

## Confirmed design facts (from the captured HTML, not guessed)

- **Colors used:** `#8C382A` (exact match: Loko Rust, canon's sacred-CTA color) and
  `#EAE2D5` (exact match: Piña Ecru, canon's light ground). Both correct per current canon.
- **Font used:** `Fraunces, serif`.

## ⚠️ Real conflict to resolve before this gets wired up

The design uses **Fraunces** for display type. Per CLAUDE.md (Vince-Alignment 2.2,
2026-06-18): *"Fraunces + EB Garamond are FULLY RETIRED... completely purged from the
repository."* Current canon is **Playfair Display (display) + Hanken Grotesk (body)**
(free near-match for licensed IvyMode/Proxima Nova). This is a real, visible
typeface conflict — not cosmetic noise — since Fraunces and Playfair Display read
differently (Fraunces is rounder/warmer; Playfair is sharper/more classical), and the
whole hero's character rides on that serif italic treatment ("_night lives in._").

**Not fixed unilaterally here.** Swapping the font changes the design's actual character,
and the design was explicitly called "beautiful" — that's a call for Jed, not something
to silently override. Two ways this resolves:
1. Re-confirm Fraunces specifically for this surface (the canon retirement could be
   revisited if this is the design direction going forward), or
2. Regenerate/adjust the artifact with Playfair Display to match current canon before
   any implementation work starts.

## Page structure observed (from page-content.md)

1. Hero — eyebrow "FOR YOUR WEDDING DAY" (Loko Rust) → headline "Choose the frame your
   _night lives in._" → subhead → date-check form (`mm/dd/yyyy` + "Check →") → "GALLERY"
   scroll cue.
2. Stats band — "40+ Events shot", "100% Client satisfaction", "Est. 2024", "Carson &
   Long Beach", "2 Founding operators".
3. Catalog — "Two booths. Eighty-two designs. _One standard._" + style filter (All
   Styles / Signature / Classic) + format filter (2×6 Strip / 4×6 Postcard / 6×4
   Landscape / 6×4 Square) + "Know the name?" search + "Showing 8 of 82" grid of
   example cards (couple name, month/city, Signature/Classic tag, design name, format)
   — Loom Oak, Knalum Dark, Calado Piña, Sombra Twin, Iron Rule, Champagne Frame, Slate
   Landscape, Oak Monochrome.
4. Email capture footer — "Not ready to choose? Leave your email..." + "Send →".
5. Footer — wordmark, location, contact email, copyright.

## Next steps (not started here — front end design ingest only)

- [ ] Jed: resolve the Fraunces vs. Playfair Display conflict above.
- [ ] Get the actual component source from Jed (this ingest only has text + 1 screenshot).
- [ ] Spec the backend wiring separately (`/spec-driven-workflow`, per Jed's instruction)
      once the design itself is settled — template data model, filter logic, date-check
      availability lookup, email capture endpoint.
