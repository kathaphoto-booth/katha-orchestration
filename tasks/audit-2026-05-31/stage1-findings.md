# Stage 1 — Live Audit Findings (book.kathabooth.com)

Date: 2026-05-31 · Surface: `book.kathabooth.com` · Method: firecrawl scrape + screenshot + HTML token grep · Pages probed: `/` (editor), `/gallery`

Screenshots: `screenshots/gallery-desktop-1440.png`, `screenshots/home-desktop-1440.png`

---

## ✅ Locked (passing)

| Check | Result | Source |
|---|---|---|
| No legacy `oax` tokens | 0 occurrences | HTML grep |
| No legacy hex (`#0a0806`, `#bf9d2c`, `#c4c1b8`) | 0 each | HTML grep |
| DS §6 forbidden vocab (luxury, premium, stunning, journey, vibe, curated, Instagrammable, once-in-a-lifetime) | 0 each | HTML+markdown grep |
| §VIII agentic leak (Antigravity, SDK, agentic, automation pipeline, Alpha-Transparent) | 0 each | HTML grep |
| `<hr>` | 0 | HTML |
| `rounded-*` class | 0 | HTML |
| `grid-cols-12` / `6/6` | 0 | HTML |
| Iron Bark (`#241E1A`) text | 91× | active |
| Piña Ecru (`#EAE2D5`) ground | 40× + visible | active |
| Editor copy on-voice | "Unbleached piña-fiber ground with a fine calado openwork divider drawn in champagne thread. Iron-bark serif set with quiet restraint." | home page |
| Template names Katha-rooted | Heirloom Piña, Loom Frame, Knalum Night, Brass Ring, Binakul Weave, Capiz Sage | gallery |

---

## ❌ Drifts (must fix)

### D1 — Font drift (HIGH) — wrong display + body family
- **Spec (DESIGN_SYSTEM.md §3):** Fraunces SOFT 100 WONK 1 (display), EB Garamond (body), Inter (UI), JetBrains Mono (meta).
- **Actual (HTML grep):** `Fraunces` 0×, `EB Garamond` 0×, `Cormorant Garamond` 58× as the only declared `font-family`.
- **Why it matters:** Cormorant is too clean/aristocratic; Fraunces' SOFT/WONK axes are the carved-imperfection mechanism for the Wabi-Sabi voice. Shipping Cormorant betrays the carved-wood character of the wordmark.
- **Fix locus:** `gemini_draft/app/globals.css` `@font-face` + `photobooth-template-studio` equivalent. One single font-loader source of truth.

### D2 — KathaThread absent (HIGH) — no closing brass-ring stroke
- **Spec (BRAND_GENESIS_PLAN §V + DS §4):** Continuous SVG `Piña Ecru` shuttle; KTHA mark draws as the **final stroke** at every page-end.
- **Actual:** Neither gallery nor editor page renders the thread or the closing KTHA. Long scroll terminates in form fields with no stroke close.
- **Fix locus:** `gemini_draft/components/shell/KathaThread.tsx` not mounted in `app/layout.tsx`.

### D3 — Loko Rust dilution (HIGH) — sacred CTA used on filter chips
- **Spec (DS §6):** "More than one `sacred` CTA visible at once" is forbidden. Loko Rust is reserved for sacred moments.
- **Actual:** `#8C382A` appears 50× in HTML; gallery screenshot shows it as the **active state** of filter pills. Filter state is not a sacred CTA — it's an inactive/active toggle.
- **Fix locus:** filter chip active-state should use Iron Bark on Champagne Heirloom, or Knalum Ink underline. Reserve Loko Rust for the booking CTA only.

### D4 — No deckled edges, no CaladoDivider on the gallery (MEDIUM)
- **Spec:** `DeckledCard` wraps every container; `CaladoDivider` is the only allowed rule line.
- **Actual:** Template thumbnails are sharp rectangles; section header is separated by whitespace alone; filter pill row has CSS-rounded pill shape (`border-radius` ≠ 0 appears 229× in HTML, top values 1px ×174, 2px ×25, 25px ×8).
- **Caveat:** Per the *No-Fukinsei-in-Templates* memory, the *template artworks themselves* stay polished. But the **gallery shell** (the frame around each template, the section header, the filter row) is brand chrome and should follow the deckled rule.
- **Fix locus:** wrap thumbnail anchors in `<DeckledCard variant="a|b|c">`; replace filter pill chips with hard-rect chips (no border-radius), drop a `<CaladoDivider>` under the section header.

### D5 — Symmetric center-stack header (MEDIUM) — Fukinsei drift
- **Spec (DS §6):** No 6/6 symmetric grids. Brand chrome must be asymmetric.
- **Actual:** Gallery header "Choose your style" + filter pill row is dead-center stacked; thumbnails sit in a strict 4-col uniform grid with equal gutters.
- **Fix:** Section header lives in `<KGrid split="8/4">` with the eyebrow + heading in the primary column and the filter row in the secondary (or pushed right with `5/7 reverse`). Thumbnail grid can keep its column count, but introduce **asymmetric vertical rhythm** (every 5th row offset by 24px) — visual loom-shuttle drift, not pure grid.

---

## ⚠️ Aesthetic gaps (Stage 3 brainstorm seeds — not violations)

### G1 — Three of nine palette tokens are dead in render
| Token | Hex | HTML occurrences | Use story |
|---|---|---|---|
| Hammered Sequin | `#9C958A` | **0** | Should be the catchlight on dark grounds — currently invisible. |
| Terracotta Earth | `#A35C44` | **0** | "Warm narrative accent" — nowhere accenting anything. |
| Capiz Sage | `#B5B8A3` | **0** | "Success / divider" — no success states or dividers ship in sage. |
| Safe-contrast muted (`#5A564E` / `#6E6A62`) | — | **0** | §VIII added these tokens for ecru-safe muted text but no component consumes them yet. |

### G2 — KTHA brass-ring slot is empty
The mark exists in `brand_assets/marks/` but never animates as page-close. The shell primitive `<KthaMark>` is defined but unmounted on the live routes.

### G3 — Binakul optical weave not rendered
DS spec calls for a 4%-opacity `feTurbulence` Binakul overlay as a global Wabi-Sabi patina. Not present in `:root::after` on the live HTML.

### G4 — Editor sidebar is sterile JSON
Left sidebar of `/` (editor) is the standard form-control stack. The CLAUDE.md "Poetic Synchronization" directive — *server fetches should feel like a deliberate, handcrafted stroke* — is not met. Form fields render as bare inputs, not woven narrative.

### G5 — Body font-size 11px detected
Branding scraper reports `body: 11px`. Likely a chip/caption, not body proper — but worth confirming none of the gallery captions fall below WCAG-recommended 14px.

---

## Token usage census (live HTML)

| Token | Hex | Occurrences | Status |
|---|---|---|---|
| Iron Bark | `#241E1A` | 91 | ✅ active |
| Champagne Heirloom | `#C4B59D` | 64 | ✅ active |
| Loko Rust | `#8C382A` | 50 | ⚠️ over-used (D3) |
| Piña Ecru | `#EAE2D5` | 40 | ✅ active |
| Abel Slate | `#5A5D5A` | 9 | ✅ active |
| Knalum Ink | `#1A1816` | 6 | ✅ active |
| Hammered Sequin | `#9C958A` | 0 | ❌ unused (G1) |
| Terracotta Earth | `#A35C44` | 0 | ❌ unused (G1) |
| Capiz Sage | `#B5B8A3` | 0 | ❌ unused (G1) |

---

## Next: Stage 2 — Design Critique
Feed these five drifts (D1–D5) + four gaps (G1–G4) into the design-critique skill against the screenshots, ranked by impact on Wabi-Sabi fidelity.
