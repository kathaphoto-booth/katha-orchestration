# BRAND FOUNDATION — KATHA PHOTO BOOTH

The nitty-gritty before any asset is drawn or any page is written. Mark construction rules, voice/tone, photography direction, copy patterns, file structure, and the maker's-mark anatomy. Pairs with [BRAND_GENESIS_PLAN.md](BRAND_GENESIS_PLAN.md) (story), [DESIGN_SYSTEM_SKELETON.md](DESIGN_SYSTEM_SKELETON.md) (tokens), [CLAUDE.md](CLAUDE.md) (operating canon).

---

## I. NAMING & VOICE

### Legal & Trade
- **Trade name:** Katha Photo Booth
- **Short:** Katha
- **Maker's mark:** KTHA (uppercase, no periods, no spaces)
- **Domain split:** `kathabooth.com` (storefront) · `book.kathabooth.com` (portal)
- **Possessive:** *Katha's* (never *Kathas'* or *Kathas*)
- **Diacritics:** none. Phonetic: *KUH-tah* (short *a*).

### Voice Pillars (Misty-authored)
1. **Rooted, not romantic.** Speak from craft, not nostalgia. *"Hand-knotted piña fiber"* — not *"the soul of our ancestors."*
2. **Quiet luxury.** Confidence through restraint. Never use "amazing," "stunning," "unforgettable."
3. **The maker is present.** First-person sparingly, third-person when honoring the craft. The booth, the loom, the thread are subjects.
4. **Tagalog & T'boli terms appear unitalicized when they are the most precise word** (*piña*, *calado*, *T'nalak*, *Inabel*, *Fu Dalu*). Italicize only when introducing.
5. **No colonial-myth language.** The sumptuary-law story is debunked. Frame translucency as refinement, not subjugation.

### Tone (Three Registers)
| Register | When | Example |
|---|---|---|
| **Editorial** | Long-form, philosophy, founder pages | *"Piña cannot be spun. Every filament is knotted end-to-end by hand — a slow inheritance of patience."* |
| **Functional** | UI, forms, booking flow | *"Reserve your evening. We'll send the questionnaire within 24 hours."* |
| **Stamp** | Maker's mark, captions, metadata | *"Katha №034 · Woven for the Reyes Family · 2026"* |

### Forbidden Words
*amazing · stunning · unforgettable · once-in-a-lifetime · luxury* (as a label) *· premium · curated · authentic · Instagrammable · vibe · aesthetic* (as a noun) *· journey · experience* (as a stand-alone noun). Replace with the specific craft act.

---

## II. WORDMARK CONSTRUCTION RULES

### Primary Wordmark: `katha`
- **Construction grid:** 8u × 2u (1u = baseline x-height).
- **Single-line rule (Arturo Luz):** the wordmark must be reproducible as **one continuous stainless-steel strand** — the Ditan trophy test. Strokes connect at terminals; no broken counters.
- **Asymmetry rule (Fukinsei):** exactly one terminal is heavier than the others — as if pressed deeper into wood. Choose the `t` crossbar by default.
- **Setting:** lowercase only. Never `KATHA` (that's the abbreviation).
- **Tracking:** `-0.015em` baseline. Optical, not metric.
- **Clear space:** 1.5u on all sides (= 1.5× x-height).
- **Min size:** 96px wide digital · 18mm wide print. Below this → use KTHA.
- **Pairings:** Iron Bark on Piña Ecru. Piña Ecru on Obsidian Weave. Never on photography directly — use Piña Ecru plate underneath.

### Lockup Variants
1. **`katha`** alone (primary).
2. **`katha` / `photo booth`** — wordmark + tagline below, divided by a hairline `Hammered Sequin` rule, 0.5u gap. Tagline in `Fraunces opsz=24, SOFT=100`, tracked `+0.08em`, all lowercase.
3. **`katha` + logomark** — stacked, logomark above at 1.5u scale, 0.75u gap.

---

## III. LOGOMARK CONSTRUCTION RULES

- **Geometry:** loom-frame abstraction. A closed asymmetric quadrilateral — three corners square, **one corner deckled** (Fukinsei).
- **Single closed path** in SVG. No fills inside — the frame is the mark.
- **Stroke weight:** 1.5u (matches wordmark stem).
- **Aspect ratio:** 1:1 in a 6u × 6u box; mark occupies 5u × 5u centered, slight right-bias (0.25u).
- **Use cases:** favicon (32×32, 192×192, 512×512), social avatar, booth brand-plate (debossed Iron Bark on Piña Ecru), print watermark.
- **Color rules:** Iron Bark fill OR Loko Rust fill (sacred contexts only — anniversary keepsakes, founder bios). Never both. Never gradients.

---

## IV. KTHA MAKER'S MARK CONSTRUCTION

The KTHA mark is the brass ring — *permission to leave the loom.*

- **Anatomy:** four letters K-T-H-A connected by **one continuous calado-stitch ligature**. The ligature path is drawn with a dashed stroke evoking hand-stitch.
- **Setting:** monospaced metrics (treat each letter as a stamp).
- **Voice:** sheer / tone-on-tone. Default = `Hammered Sequin` on `Piña Ecru`. Sacred = `Loko Rust` on `Piña Ecru`.
- **Required companions:** the mark almost always appears with one metadata line in JetBrains Mono, `+0.04em` tracking:
  - `KTHA · №034 · 2026.05.29 · Reyes` (print)
  - `KTHA · woven` (digital page-end)
- **Behavior:** on every digital page, the KTHA mark draws as the **final stroke** of the SVG thread when the user reaches `Φ(s) = 1.0`. Animation: `--dur-weave` along `--ease-thread`.
- **Print debossing:** 0.6mm depth, blind (no ink), bottom-right corner of every keepsake at 12mm clear from edge.

---

## V. PATTERN SYSTEM

### Binakul Background Tile
- **Source:** Ilocos optical weave — apotropaic geometry.
- **Build:** SVG tile, 240×240 viewport, concentric squares rotated to suggest whirlpool. Black/white duotone → recolored at runtime.
- **Opacity in product:** **4%** maximum. The user feels it before they see it.
- **Forbidden:** never over text. Container backgrounds only.

### Calado Openwork Divider
- **Replaces all `<hr>`.** The only allowed rule line.
- **Build:** SVG with `feMorphology` erode/dilate alternation creating openwork dot-and-bridge pattern.
- **Color:** `Champagne Heirloom` on `Piña Ecru`, or `Hammered Sequin` on `Obsidian Weave`.
- **Length:** 1.5× section column width, centered, with negative space on either side.

### Sombrado Shadow Plate
- For images displayed on Piña Ecru: instead of drop-shadow, render an opaque silhouette of the image behind it, offset 6px down + 4px right, 18% opacity — mimicking *sombrado* shadow appliqué seen through sheer fabric.

---

## VI. PHOTOGRAPHY DIRECTION (Brock-enforced)

### What we shoot
- **Hands at work.** Tying ribbon, threading paper, pressing the booth shutter. Always macro, always shallow DOF.
- **The booth as object.** Three-quarter angle, raw plaster backdrop, natural side-light at golden hour (Cosmos-confirmed aesthetic).
- **Keepsakes in domestic context.** A print on a wooden console. A linen-bound album on a stone bench. Never floating on white.
- **Guests, never models.** Real events, candid moments, never staged "smile at camera."

### What we don't shoot
- Sparklers, neon, balloon arches, "fun" props.
- Bridal portraits with retouched skin.
- Booth interior with flash bounce (kills the wabi-sabi).
- Stock photography. Ever.

### Treatment
- **Tone:** warm umber midtones, lifted shadows, no crushed blacks. Color grade: Iron Bark shadows + Champagne Heirloom highlights.
- **Aspect ratios:** 4:5 and 3:4 vertical, 16:9 only for hero. Square reserved for keepsake reveals.
- **Edge:** always presented behind a deckled mask. Never sharp rectangles.

---

## VII. COPY PATTERNS

### Microcopy
| Context | Pattern | Example |
|---|---|---|
| CTA primary | Verb + object, no adjectives | *"Reserve the evening"* not *"Book your premium experience"* |
| CTA sacred (Loko Rust) | Single verb | *"Begin"* · *"Send"* · *"Weave"* |
| Form labels | Lowercase, no colons, no asterisks | *your name* · *event date* |
| Error states | Quiet, not alarming | *"This date is already woven. Choose another."* |
| Empty states | Honor the silence | *"Nothing here yet — the loom is rested."* |
| Loading | Describe the act, not progress | *"Threading…"* · *"Pressing the shutter…"* |

### Eyebrow Pattern
Every section begins with a 2-3 word eyebrow in `Inter` `+0.16em` uppercase `Abel Slate`. The H1 follows in `Fraunces`. Example: `THE LOOM` → `Built from weathered oak.`

### Print Caption Pattern
```
KATHA · №{ordinal} · {date.iso} · {family}
woven for {occasion} · {city}
```

---

## VIII. FILE & FOLDER STRUCTURE

```
/brand_assets/
  /marks/
    /wordmark/
      katha-wordmark-primary-dark.svg
      katha-wordmark-primary-light.svg
      katha-wordmark-stacked-dark.svg
      katha-wordmark-stacked-light.svg
    /logomark/
      katha-logomark-iron-bark.svg
      katha-logomark-loko-rust.svg
      katha-logomark-favicon-32.png
      katha-logomark-favicon-192.png
      katha-logomark-favicon-512.png
    /ktha/
      ktha-mark-sequin-on-ecru.svg
      ktha-mark-loko-on-ecru.svg
      ktha-mark-stitch-animated.svg
  /patterns/
    pattern-binakul-tile.svg
    pattern-calado-divider.svg
    pattern-sombrado-plate.svg
    texture-patina-filter.svg
  /squarespace/
    {each-mark}@1x.png
    {each-mark}@2x.png
    {each-mark}.codeblock.html
  /print/
    {each-mark}.pdf  (CMYK, vector)
  /photography/
    /raw/
    /graded/
    /web-deckled/
/brand_docs/
  BRAND_FOUNDATION.md  (this file)
  BRAND_GENESIS_PLAN.md
  DESIGN_SYSTEM_SKELETON.md
  AGENTS.md
```

---

## IX. EXPORT & DELIVERY CHECKLIST (per mark)

- [ ] SVG primary, viewBox normalized to `0 0 240 N`
- [ ] SVG inlined CSS for color variables (no hardcoded hex except fallback)
- [ ] PNG @1x, @2x, @3x with transparent backgrounds
- [ ] PDF CMYK vector for print
- [ ] Squarespace `.codeblock.html` snippet — self-contained, no external CSS dependency
- [ ] Favicon `.ico` + manifest entries
- [ ] Open Graph image 1200×630, mark + tagline on `Piña Ecru` ground
- [ ] Verification: passes the Luz single-line test (visual review)
- [ ] Verification: WCAG AA contrast verified against both `Piña Ecru` and `Obsidian Weave` grounds

---

## X. PRINT MATERIALS SPEC (Physical Keepsakes)

- **Stock:** archival cotton 308gsm, natural white (matches Piña Ecru).
- **Format:** 5×7 portrait standard. 8×10 for premium tier.
- **Treatment:** matte digital print + blind deboss of KTHA mark, bottom-right.
- **Sleeve:** linen-bound folio in Iron Bark thread with Champagne Heirloom inner liner.
- **Caption strip:** glassine band with mono-set metadata line, tied with a 2mm Hammered Sequin ribbon.
- **No logos on the back.** The KTHA deboss is the only branding.

---

## XI. ACCESSIBILITY (Brock-locked)

- WCAG **AA** minimum. AAA on body text.
- Contrast pairs verified:
  - Iron Bark on Piña Ecru: **12.4:1** ✓
  - Piña Ecru on Obsidian Weave: **15.8:1** ✓
  - Loko Rust on Piña Ecru: **5.9:1** ✓ (AA large)
  - Abel Slate on Piña Ecru: **5.2:1** ✓ (AA large only — never body)
- `prefers-reduced-motion` honored: no sequins, no thread, fade-only.
- `prefers-contrast: more` swaps Hammered Sequin → Iron Bark for hairlines.
- Deckled edges always paired with `border-radius: 0` fallback for screen readers — `aria-hidden` on decorative masks.
- Every interactive element has a focus state visible against both grounds: 2px Loko Rust outline at 2px offset.

---

## XII. SUCCESS CRITERIA

The brand foundation is complete when:
1. Any new contributor can produce a brand-aligned page using only this file + [DESIGN_SYSTEM_SKELETON.md](DESIGN_SYSTEM_SKELETON.md).
2. Every brand asset survives the Luz single-line test.
3. Every asset has dual-format exports (Next.js + Squarespace).
4. Every page ends with the KTHA stroke.
5. The word *luxury* appears nowhere in the product.
