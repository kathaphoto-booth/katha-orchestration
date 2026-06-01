# Stage 3 — Aesthetic Heightening Brainstorm

Constraint: palette and marks are locked. We are making the *existing* 9 tokens feel more handloomed, and we are giving each unused token a single non-decorative home. Each move tagged with effort (S/M/L), file(s) touched, and the failure-mode it closes.

---

## Ranked moves (12)

### H1 — Mount `<KathaThread>` in `app/layout.tsx` and draw the KTHA close stroke on every page-end. **(S)**
- Closes: D2, G2. Single highest-impact fix.
- Files: `gemini_draft/app/layout.tsx` (mount), `gemini_draft/components/shell/KathaThread.tsx` (verify it terminates with `<KthaMark>` final stroke).
- Use `stroke-dashoffset` tied to `useScroll()`; `aria-label="Katha maker's mark — complete"` on the closing path.
- Section VIII: thread must be `pointer-events-none` and `z-10+`.

### H2 — Swap Cormorant Garamond → Fraunces (SOFT 100, WONK 1). **(S)**
- Closes: D1.
- Files: `gemini_draft/app/globals.css` `@font-face` block + `tailwind.config` font-family map; mirror in `photobooth-template-studio/app/globals.css`.
- Use `font-variation-settings: "SOFT" 100, "WONK" 1` on `.font-display` only — keep body in EB Garamond, UI in Inter. Add JetBrains Mono for `<KMeta>` / `<KOrdinal>`.

### H3 — Demote Loko Rust on filter chips; reserve for the booking CTA. **(S)**
- Closes: D3.
- File: gallery filter chip component (likely `gemini_draft/components/gallery/FilterRow.tsx` or template-studio equivalent).
- Active state → Iron Bark text + Champagne Heirloom underline (1px Calado-dotted). Inactive → Abel Slate. The only Loko Rust on the page should be one button: "Begin your Katha" / booking CTA.

### H4 — Wrap thumbnail anchors in `<DeckledCard variant>` rotation. **(M)**
- Closes: D4.
- File: gallery grid mapper. Rotate `variant="a"|"b"|"c"` by index so no two adjacent thumbnails share the same torn-edge mask — produces hand-torn rhythm without per-card authoring.
- Keep the artwork itself sharp (templates stay polished per memory); the deckle lives on the frame mask.

### H5 — Replace gallery section header with `<KGrid split="8/4">` asymmetry. **(S)**
- Closes: D5.
- File: `gemini_draft/app/gallery/page.tsx`.
- Primary (8): `<KEyebrow>13 KATHA SIGNATURE · 21 CLASSIC</KEyebrow>` + `<KHeading size="lg">Choose your style</KHeading>`. Secondary (4): filter row right-aligned. Drops a `<CaladoDivider>` between header and grid.

### H6 — Give Capiz Sage a job: success/confirmation states. **(S)**
- Closes: G1 (Capiz Sage).
- File: `gemini_draft/components/shell/KToast.tsx` (or wherever booking-confirmed flashes live).
- Sage background, Iron Bark text, calado-dotted underline. Also a `<CaladoDivider>` variant with sage thread for the "thank-you / booked" page.

### H7 — Give Terracotta Earth a job: warm narrative accents in long-form copy. **(S)**
- Closes: G1 (Terracotta Earth).
- Files: `KQuoteBlock` (pull-quote left bar), `KStatBar` (one stat per row in Terracotta on hover/focus), Section VIII keepsake-description card border-left.
- Use sparingly — narrative warmth, never UI state.

### H8 — Give Hammered Sequin a job: catchlight on dark grounds only. **(S)**
- Closes: G1 (Hammered Sequin) + the §VIII WCAG rule that forbids it on Piña Ecru text.
- File: `gemini_draft/components/shell/KSection.tsx` variant="dark".
- Use as 1px hairline border on dark KSections, and as the sequin glint in the Next.js sequin canvas. Forbid it as text color anywhere via a Tailwind plugin guard.

### H9 — Add §VIII-approved muted-text tokens to CSS variables. **(S)**
- Closes: §VIII contrast rule preemptively.
- File: `gemini_draft/app/globals.css`.
- Add `--katha-ecru-muted: #5A564E;` and `--katha-ecru-muted-soft: #6E6A62;`. Map Tailwind `text-katha-ecru-muted` and `text-katha-ecru-muted-soft`. Update DS doc to forbid `text-katha-hammered-sequin` on `bg-katha-pina-ecru`.

### H10 — Introduce `<KBinakulField>` 4%-opacity feTurbulence overlay. **(M)**
- Closes: G3 + global Wabi-Sabi patina.
- File: new `gemini_draft/components/shell/KBinakulField.tsx`.
- Mounted once in `app/layout.tsx` after `<KathaThread>`. `feTurbulence baseFrequency=0.65 numOctaves=3` at 4% alpha. `pointer-events-none`. Reduced-motion: freeze the noise to a single seed rather than animating.

### H11 — Three loom-shuttle micro-interactions on `<KathaThread>`. **(M)**
- Heightens H1.
- (a) On hover over a `<DeckledCard>`, the thread momentarily *catches* on that card's left edge and pulls slack (12–16px lateral nudge per §VIII Woven Silk Overlay rule).
- (b) On scroll-direction reversal, the thread "unspools" with a 200ms ease-out before re-tightening.
- (c) On reaching a `<CaladoDivider>`, the thread weaves *through* the divider's openwork (alternating `stroke-dasharray` matching the divider stitch).

### H12 — `<KNarrativeThread>` primitive for woven data lists (editor sidebar). **(L)**
- Closes: G4 — Poetic Synchronization in interaction.
- File: new `gemini_draft/components/shell/KNarrativeThread.tsx`.
- Takes a `data[]` and renders each item connected by an inline Piña Ecru SVG path — form labels, event details, photo-strip slots become *one continuous thread of narrative*, not stacked widgets. The brass ring closes the thread when the form is valid.

---

## Effort rollup

| Effort | Moves |
|---|---|
| S (≤ 1 file, ≤ 1 hour) | H1, H2, H3, H5, H6, H7, H8, H9 — **8 moves** |
| M (new primitive or non-trivial logic) | H4, H10, H11 — **3 moves** |
| L (new abstraction across pages) | H12 — **1 move** |

## Suggested execution order
**Phase A (today, all S):** H2 (font) → H1 (thread) → H3 (Loko demotion) → H5 (asymmetric header) → H9 (muted-text tokens). Five quick wins that close every HIGH-severity drift.

**Phase B (tomorrow):** H4 (deckled gallery), H6/H7/H8 (palette resurrection), H10 (Binakul patina).

**Phase C (next sprint):** H11 (loom micro-interactions), H12 (KNarrativeThread + editor weave).

---

## Next: Stage 4 — Design System v2
Translate these 12 moves into a `DESIGN_SYSTEM.v2.md` diff: new primitives (`KBinakulField`, `KNarrativeThread`, `KToast`), tightened existing ones, and an expanded Forbidden list (`text-katha-hammered-sequin` on light grounds; Loko Rust outside the booking CTA).
