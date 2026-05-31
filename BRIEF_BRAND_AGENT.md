# PASTE-READY BRIEF — KATHA BRAND ASSET GENESIS

> Copy everything between `# PROMPT START` and `# PROMPT END` into your external brand-genesis agent (Gemini Advanced / Claude.ai / Stitch / v0). The brief is self-contained — it does not reference any other file.

---

# PROMPT START

## Role
You are a senior brand-identity designer and production technologist tasked with generating the complete visual identity system for **Katha Photo Booth** — a premium DSLR photo-booth brand rooted in Filipino heritage, wabi-sabi philosophy, and the craft of handcrafting passed-down keepsakes. You will produce four tiers of assets, each delivered in dual format (Next.js SVG + Squarespace raster + Code Block snippet). Tone: terse, instruction-grade, evidence-based. No marketing fluff.

**Forbidden words (do not use anywhere in copy, descriptions, or naming):** *luxury · premium · stunning · amazing · unforgettable · once-in-a-lifetime · curated · authentic · Instagrammable · vibe · aesthetic* (as a noun) *· journey · experience* (as a stand-alone noun).

**Forbidden visual moves:** gradients, drop shadows on Piña Ecru ground (use *sombrado* plate instead), pure `#000000` or `#FFFFFF`, generic red/blue/yellow Filipino-flag color combinations, sharp rectangular borders (always deckled), colonial-myth framing of the Barong (the sumptuary-law theory is debunked — translucency = ilustrado refinement, not subjugation).

**Forbidden legacy tokens (must not appear anywhere):** `#0a0806`, `#bf9d2c`, `#c4c1b8` (these are deprecated `oax` colors from a prior brand).

---

## The Story (Source Spine)

### The Word
*Katha* (Tagalog) — **to compose, to invent, to weave a poem or story.** Not a noun. A verb. The act of pressing raw earth — fiber, clay, wood — through the patience of the hand until it becomes an heirloom. The CITEM **KATHA Awards** (est. 1983) crowned the word as the apex of Philippine material poetry. The original KATHA logo was drawn by **National Artist Arturo Luz**: a single continuous geometric line; no excess; *"good design is good business."* In 2023, architect **Nolasco E. Ditan** reinterpreted it as the *Tropeo KATHA* — a stainless-steel trophy bent from one mono-material line. **This is your typographic north star.**

### The Three Ancestral Parents (Motif Sources)
1. **Barong Nipis** — sheer piña/jusi of the Tagalog lowlands. Not colonial subjugation but *ilustrado* refinement. **Calado** (drawn-thread openwork — destroy and reconstruct), **sombrado** (shadow appliqué viewed through sheer fabric). Piña cannot be spun — every filament is hand-knotted end-to-end, leaving microscopic knots as the maker's signature. **Transparency = refinement.**
2. **Inabel / Binakul** — Ilocos hardwood-loom weave. *Binakul* is mathematical optical illusion designed to **confuse malevolent spirits** — whirlpools, wind, waves. Apotropaic protective geometry.
3. **T'nalak** — T'boli dream-woven abacá from Lake Sebu, Mindanao. Patterns received in dreams from *Fu Dalu*, goddess of abacá, by **dreamweavers**. Strict tri-color: **Black** (soil, from knalum leaves boiled 7 days), **Red** (blood/vitality, from loko root), **White** (raw fiber purity). Cutting a finished cloth brings illness. When a T'nalak is sold, a **brass ring** is offered to appease the spirits — *permission to leave the loom.* **This is the metaphor for the KTHA mark.**

### Cosmos Visual Cues (Curator Evidence)
- **`katha filipino` board** — curators show *objects, not graphics*: Pierre Jeanneret caned chairs, hand-knotted rope daybeds, hanging abacá pendants, terracotta vessels, weathered oak frames on raw plaster. **The Katha aesthetic is furniture-as-philosophy.** Warm umber → ecru → cement gray → iron-black.
- **`barong filipino` board** — curators show *light through sheer fiber*: cropped close-ups of piña shirts, calado openwork, monochromatic ivory-on-ivory embroidery, lavender shadow-undertones. **The Barong aesthetic is fabric-as-protagonist.**

### Throughline
*Perseverance composed into thread.* Every photo captured by Katha is not a captured moment — it is **a stroke woven into a passed-down keepsake**. The booth is the loom; the print is a *Katha*; the **KTHA mark is the brass ring**.

---

## Unified Palette (9 Tokens — Strict Canon)

### UI tokens (chrome, layout)
| Token | Hex | RGB | Role |
|---|---|---|---|
| Obsidian Weave | `#111112` | 17,17,18 | Dark base mesh |
| Piña Ecru | `#EAE2D5` | 234,226,213 | Historic fiber / SVG thread / light bg |
| Hammered Sequin | `#9C958A` | 156,149,138 | Matte sequin catchlight |
| Champagne Heirloom | `#C4B59D` | 196,181,157 | Tone-on-tone embroidery |
| Iron Bark | `#241E1A` | 36,30,26 | Loom frame / text on light |

### Narrative tokens (T'nalak-rooted, sacred moments)
| Token | Hex | RGB | Role |
|---|---|---|---|
| Knalum Ink | `#1A1816` | 26,24,22 | T'nalak soil-black background |
| Loko Rust | `#8C382A` | 140,56,42 | T'nalak blood — **sacred CTA only** |
| Terracotta Earth | `#A35C44` | 163,92,68 | Kiln & dye — warm narrative accent |
| Abel Slate | `#5A5D5A` | 90,93,90 | Aged Inabel cotton — inactive UI |
| Capiz Sage | `#B5B8A3` | 181,184,163 | Capiz windowpane — success/divider |

### Required contrast pairs (WCAG)
- Iron Bark on Piña Ecru: **12.4:1** (AAA body)
- Piña Ecru on Obsidian Weave: **15.8:1** (AAA body)
- Loko Rust on Piña Ecru: **5.9:1** (AA large)
- Abel Slate on Piña Ecru: **5.2:1** (AA large only — never body text)

---

## DELIVERABLES

You will produce **four tiers**, each in dual format.

### TIER 1 — PRIMARY WORDMARK: `katha`

**Construction:**
- Grid: 8u × 2u (1u = baseline x-height).
- **Single-line rule (Luz/Ditan):** the wordmark must be reproducible as **one continuous stainless-steel strand**. Strokes connect at terminals; no broken counters. If you cannot trace it without lifting the pen, redraw.
- **Asymmetry rule (Fukinsei):** exactly one terminal heavier than the others — default is the `t` crossbar, pressed deeper as if into wood.
- Setting: lowercase only. Never `KATHA` (that is the secondary mark).
- Tracking: `-0.015em` optical baseline.
- Clear space: 1.5u (= 1.5× x-height) on all sides.
- Min size: 96px wide digital / 18mm wide print. Below this, switch to KTHA.

**Color pairings:**
- Iron Bark `#241E1A` on Piña Ecru `#EAE2D5` (light)
- Piña Ecru `#EAE2D5` on Obsidian Weave `#111112` (dark)
- Never directly on photography — always plate Piña Ecru beneath.

**Lockup variants (all required):**
1. `katha` alone — primary horizontal.
2. `katha / photo booth` — wordmark + hairline rule (Hammered Sequin) + tagline below in Fraunces `opsz=24, SOFT=100`, tracked `+0.08em`, all lowercase, 0.5u gap.
3. `katha` + logomark stacked — logomark above at 1.5u scale, 0.75u gap.

**Reference voice:** Carved wooden object. Furniture-as-philosophy. Gravity. Hand-pegged, not drawn.

---

### TIER 2 — LOGOMARK

**Construction:**
- Geometry: loom-frame abstraction — a **closed asymmetric quadrilateral**. Three corners square, **one corner deckled** (Fukinsei — default deckled corner is bottom-right).
- **Single closed path** in SVG. No interior fill — the frame is the mark.
- Stroke weight: 1.5u (matches wordmark stem).
- Aspect: 1:1 in a 6u × 6u box; mark occupies 5u × 5u centered, with slight right-bias of 0.25u.
- Counter (interior negative space): readable as both a frame and the letter *k* if squinted.

**Color rules:**
- Default fill: Iron Bark.
- Sacred variant fill: Loko Rust (for anniversary keepsakes, founder bios, the *T'nalak* tier of services). Never both. Never gradients.

**Use cases:** favicon (32, 192, 512), social avatar, debossed booth brand-plate (Iron Bark blind deboss on Piña Ecru), print watermark.

---

### TIER 3 — KTHA MAKER'S MARK (Secondary / Stamp / Watermark)

**The brass ring. *Permission to leave the loom.***

**Construction:**
- Four letters K-T-H-A connected by **one continuous calado-stitch ligature** (dashed stroke evoking hand-stitched openwork).
- Setting: monospaced metrics — each letter sits in an equal cell, treated as a stamp.
- The ligature path enters the K at lower-left and exits the A at upper-right — suggesting a loom shuttle's traverse.
- Aspect: 4:1 horizontal block.

**Color/voice (sheer, tone-on-tone):**
- Default: Hammered Sequin `#9C958A` on Piña Ecru `#EAE2D5`.
- Sacred: Loko Rust `#8C382A` on Piña Ecru — anniversary and founder contexts only.
- Dark surface: Champagne Heirloom `#C4B59D` on Obsidian Weave.

**Required companion (metadata line):**
Always paired with a single mono-set line in JetBrains Mono, `+0.04em` tracking, in `Abel Slate`:
- Print: `KTHA · №034 · 2026.05.29 · REYES`
- Digital page-end: `KTHA · woven`

**Behavior:**
- On every digital page, the KTHA mark **draws as the final stroke** of the page-wide SVG thread when the user reaches the bottom of scroll. It is the closing seal.
- On every physical keepsake, the KTHA mark is **blind-debossed** (no ink, 0.6mm depth) in the bottom-right corner, 12mm clear from edge.

---

### TIER 4 — PATTERN SYSTEM

#### A. Binakul Background Tile
- Source: Ilocos optical weave, apotropaic protective geometry.
- Build: SVG tile, 240×240 viewBox. Concentric squares rotated to suggest whirlpool. Duotone (currentColor + transparent) — recolored at runtime.
- **Opacity in product: 4% maximum.** The user feels it before they see it.
- Forbidden over text. Container backgrounds only.

#### B. Calado Openwork Divider
- **Replaces all `<hr>`.** The only allowed rule line.
- Build: SVG with `feMorphology` erode/dilate alternation producing openwork dot-and-bridge.
- Color: Champagne Heirloom on Piña Ecru (light) / Hammered Sequin on Obsidian Weave (dark).
- Length: 1.5× container column width, centered, with negative space on either side.

#### C. Sombrado Shadow Plate
- **Replaces drop-shadow on Piña Ecru ground.**
- For any image displayed on Piña Ecru: render an opaque dark silhouette of the image behind the image, offset 6px down + 4px right, at 18% opacity. Mimics sombrado shadow appliqué seen through sheer piña.

---

## DUAL-FORMAT EXPORT REQUIREMENT

Every asset above must ship in **both stacks**. Per asset, produce:

```
/marks/{tier}/
  katha-{slug}-{variant}.svg          ← Next.js source of truth
  katha-{slug}-{variant}@1x.png       ← Squarespace raster
  katha-{slug}-{variant}@2x.png       ← Squarespace retina
  katha-{slug}-{variant}.codeblock.html  ← Squarespace Code Block (self-contained, inline CSS)
  katha-{slug}-{variant}.pdf          ← Print, CMYK vector
```

SVG requirements:
- `viewBox` normalized to `0 0 240 N` for marks, `0 0 240 240` for patterns.
- Inline CSS custom properties; no external dependencies.
- No raster `<image>` embeds.
- Compatible with strict CSP (no inline `<script>`).
- Use `currentColor` for re-tintability.

Squarespace Code Block requirements:
- Single `<div>` wrapper with all styles inlined.
- No external font loads inside the block (rely on global site font stack).
- Width fluid, max-width respected via wrapping container.

---

## OUTPUT FORMAT (per tier)

For each of Tier 1, 2, 3, 4 produce these six blocks in this exact order:

1. **Construction notes** — final design rationale tying back to Luz/Fukinsei/three-parent sources. ~150 words.
2. **SVG markup** — complete, valid, paste-ready SVG. Use the unified palette tokens only.
3. **Raster specs** — exact pixel dimensions for @1x/@2x/@3x, file naming.
4. **Squarespace Code Block snippet** — complete `<div>` block with inlined CSS.
5. **ASCII proof sketch** — monospaced ASCII representation showing the mark's grid construction and asymmetry. Helps Jed verify the Luz single-line property before rendering.
6. **Verification checklist** — confirm: (a) passes Luz single-line test, (b) WCAG contrast vs both Piña Ecru and Obsidian Weave grounds, (c) min-size legibility (96px digital / 18mm print), (d) no forbidden tokens used, (e) dual-format completeness.

---

## VERIFICATION CRITERIA (Global)

The submission is complete when:
- All four tiers delivered in all four formats (SVG, PNG @1x/@2x, Squarespace Code Block, PDF).
- Every mark passes the **Luz single-line test** (one continuous stroke, no broken counters).
- Every color pair meets stated WCAG contrast minimums.
- Pattern opacities respected (Binakul ≤ 4%).
- KTHA appears as the closing stroke metaphor — described in your construction notes as the brass ring.
- No forbidden words appear anywhere in your output.
- No forbidden legacy hex (`#0a0806`, `#bf9d2c`, `#c4c1b8`) anywhere.
- No gradients. No pure black/white. No sharp rectangular borders.

Begin with Tier 1.

# PROMPT END

---

## Notes for Jed (not part of the paste)
- This brief is engineered for a single paste into one external agent. If your external agent has a small context window, you can paste tiers one-by-one — each tier section is self-referential.
- After receiving the external agent's output, run a forbidden-token grep against the SVG markup before accepting: `grep -E '#0a0806|#bf9d2c|#c4c1b8|#000000|#ffffff|gradient|drop-shadow'`.
- Brock will A11y-audit at the deckled boundary once assets land.
