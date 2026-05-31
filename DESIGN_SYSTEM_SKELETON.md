# Katha Booth Design System & Architecture Skeleton

Canonical token source. All visual decisions reference this file. Mirrors the unified palette in [CLAUDE.md](CLAUDE.md) and the narrative framing in [BRAND_GENESIS_PLAN.md](BRAND_GENESIS_PLAN.md).

**Status:** Foundation tokens locked. Asset specs pending Brand Agent + FE Design Expert outputs.

---

## 1. Subdirectory Navigation Structure

Route-based navigation (no anchor jumps) — optimized for page indexing and the "continuous SVG thread" between pages.

| Page Directory | Route Path | Rendering Component Purpose |
|----------------|------------|-----------------------------|
| Home           | `/`        | Reflective brand landing, rotating image frames |
| Photo Booth    | `/photobooths`| Product detail presentation, specifications |
| Process        | `/process` | Handcrafting & operational workflows |
| Events         | `/events`  | Regional target galleries & reservation gates |
| Founders       | `/founders`| Core story, philosophy & perseverance notes |
| In Action      | `/installation`| Dynamic event galleries & inline FAQ elements |
| Weddings       | `/weddings`| SEO Service page targeting luxury SoCal couples |
| Celebrations   | `/intimate-celebrations`| SEO Service page targeting high-end micro-weddings |
| Corporate      | `/corporate`| SEO Service page targeting architectural activations |
| Event Vault    | `/gallery/[slug]`| Password-protected client keepsake access |

---

## 2. Page & Layout Structure

### Homepage Architecture (`src/app/page.jsx`)
1. `HeroSection` (eyebrow, wordmark/logomark slots, frame animations)
2. `PhilosophySection` (handcrafted philosophy focus, rich narrative text)
3. `PhysicalPresence` (the physical photo booth presentation, links to `/installation`)
4. `ProcessSection` (step-by-step handcrafting workflow teaser, links to `/process`)
5. `EvidenceSection` (testimonial slider / past keepsakes)
6. `AcquisitionFooter` (contact data, active service locations, secondary routes)

### Subpage Rule
`FAQSection` is strictly a subdirectory-level component. Never on `/` — preserves editorial space.

---

## 3. Brand & Context Constants

```
Domain (storefront):  https://kathabooth.com         (Squarespace)
Domain (portal):      https://book.kathabooth.com    (Next.js + Vercel)
Phone:                424-215-1450
Email:                hello@kathabooth.com
Instagram:            @kathabooth
R2 Bucket:            katha-assets
```

---

## 4. Color Tokens (Unified Canon — 9)

### UI tokens
```css
:root {
  --katha-obsidian-weave:    #111112;  /* Base mesh / dark bg */
  --katha-pina-ecru:         #EAE2D5;  /* Historic fiber / SVG thread / light bg */
  --katha-hammered-sequin:   #9C958A;  /* Subtle catchlight */
  --katha-champagne-heirloom:#C4B59D;  /* Tonal embroidery */
  --katha-iron-bark:         #241E1A;  /* Loom frame */
}
```

### Narrative tokens (T'nalak-rooted)
```css
:root {
  --katha-knalum-ink:        #1A1816;  /* T'nalak soil (7-day knalum boil) */
  --katha-loko-rust:         #8C382A;  /* T'nalak blood — sacred CTA */
  --katha-terracotta-earth:  #A35C44;  /* Kiln & dye — warm accent */
  --katha-abel-slate:        #5A5D5A;  /* Aged Inabel cotton — inactive */
  --katha-capiz-sage:        #B5B8A3;  /* Capiz windowpane — success/divider */
}
```

### Semantic aliases
```css
:root {
  --bg-primary:        var(--katha-pina-ecru);
  --bg-secondary:      var(--katha-champagne-heirloom);
  --bg-dark:           var(--katha-obsidian-weave);
  --bg-narrative:      var(--katha-knalum-ink);

  --text-primary:      var(--katha-iron-bark);
  --text-on-dark:      var(--katha-pina-ecru);
  --text-muted:        var(--katha-abel-slate);
  --text-inverse:      var(--katha-pina-ecru);

  --accent-warm:       var(--katha-terracotta-earth);
  --accent-catchlight: var(--katha-hammered-sequin);
  --cta-sacred:        var(--katha-loko-rust);
  --success:           var(--katha-capiz-sage);
  --frame:             var(--katha-iron-bark);
}
```

---

## 5. Typography (Free, Squarespace-Compatible)

All faces are Google Fonts → load identically on Squarespace and Next.js.

| Family Key       | Font            | Role                                    | Loading |
|------------------|-----------------|-----------------------------------------|---------|
| Display Serif    | **Fraunces**    | H1 / H2 / wordmark-adjacent display     | Variable (opsz, SOFT, WONK) |
| Body Serif       | **EB Garamond** | Long-form body, philosophy passages     | 400/500/600 + italic |
| UI Sans          | **Inter**       | UI labels, buttons, nav, forms          | 400/500/600 |
| Utility Mono     | **JetBrains Mono** | Metadata, "Katha №", maker's stamp | 400/500 |

```css
:root {
  --font-display: 'Fraunces', 'Times New Roman', serif;
  --font-body:    'EB Garamond', Georgia, serif;
  --font-ui:      'Inter', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', 'SF Mono', monospace;
}
```

**Wabi-sabi typographic rules:**
- Fraunces always with `font-variation-settings: "SOFT" 100, "WONK" 1` for asymmetric terminals (the carved-wood feel).
- Never set `font-weight: 700` on display — feels generic. Use 400–600 + opsz.
- Tracking: display `-0.015em`, body `0`, utility labels `+0.12em uppercase`, mono `+0.04em`.
- Line height: display `1.05`, body `1.55`, UI `1.3`, mono `1.4`.

---

## 6. Type Scale (Modular, 1.25 minor third)

```
--text-xs:   0.75rem   /* 12px — micro-utility, mono stamps */
--text-sm:   0.875rem  /* 14px — captions, UI labels */
--text-base: 1rem      /* 16px — body */
--text-md:   1.125rem  /* 18px — large body / pull quote */
--text-lg:   1.5rem    /* 24px — H4 */
--text-xl:   1.875rem  /* 30px — H3 */
--text-2xl:  2.5rem    /* 40px — H2 */
--text-3xl:  3.5rem    /* 56px — H1 */
--text-hero: clamp(3rem, 7vw, 6.5rem) /* hero display */
```

---

## 7. Spacing Scale (4px base, Ma-aware)

Generous negative space honors *Ma*. Default to one step larger than feels right.

```
--space-1:   0.25rem    /* 4 */
--space-2:   0.5rem     /* 8 */
--space-3:   0.75rem    /* 12 */
--space-4:   1rem       /* 16 */
--space-6:   1.5rem     /* 24 */
--space-8:   2rem       /* 32 */
--space-12:  3rem       /* 48 */
--space-16:  4rem       /* 64 */
--space-24:  6rem       /* 96 */
--space-32:  8rem       /* 128 */
--space-48:  12rem      /* 192 — section breathing */
```

---

## 8. Grid (Asymmetric / Fukinsei)

- **Columns:** 12-col base, but Katha layouts intentionally use **7/5, 8/4, or 9/3 asymmetric splits**. Symmetric 6/6 is forbidden.
- **Max width:** 1440px container, 1280px content. Hero allowed full-bleed.
- **Gutter:** 24px desktop, 16px mobile.
- **Vertical rhythm:** sections separated by `--space-32` or `--space-48`.

---

## 9. Motion & Easing

Slow, deliberate, loom-paced. Default duration **600–900ms**, never under **400ms**.

```css
:root {
  --ease-loom:     cubic-bezier(0.22, 1, 0.36, 1);    /* primary reveals — heavy then settle */
  --ease-thread:   cubic-bezier(0.65, 0, 0.35, 1);    /* SVG thread weaving */
  --ease-shuttle:  cubic-bezier(0.85, 0, 0.15, 1);    /* page transitions, shuttle pass */
  --ease-sequin:   cubic-bezier(0.4, 0, 0.6, 1);      /* sequin canvas, sinusoidal */

  --dur-fast:      400ms;
  --dur-base:      700ms;
  --dur-slow:      1100ms;
  --dur-weave:     2400ms;  /* full thread draw on page enter */
}
```

`prefers-reduced-motion: reduce` → disable canvas sequins, instant SVG thread, fade-only transitions.

---

## 10. Texture & Effects

| Element | Implementation | Role |
|---------|---------------|------|
| **Patina** | SVG `feTurbulence` fractalNoise, `baseFrequency=0.65 numOctaves=3`, applied via `::after` overlay at 12% alpha | Global tactile paper-grain |
| **Deckled Edge** | `mask-image: url(data:image/svg+xml;…)` with hand-drawn irregular path | Replaces all sharp container borders |
| **Sequin Canvas** | HTML5 canvas particle field, spring physics + cursor repulsion (Next.js only) | Hero/section background catchlight |
| **Sequin Surrogate** | 4s looping `<video poster=…>` at 8% opacity (Squarespace) | Storefront equivalent |
| **SVG Thread** | Single `path` with `stroke-dashoffset` tied to scroll progress, `Piña Ecru` stroke | Page-wide navigation thread |
| **Calado Divider** | Inline SVG with `feMorphology` openwork pattern | Replaces all `<hr>` |

---

## 11. Dual-Track Asset Export Spec

Every brand asset ships in **both** stacks. Per asset:

```
/brand_assets/
  /next/                          → Next.js consumption
    {asset}.svg                   → single source of truth
    {asset}.webp                  → fallback raster, 2x density
  /squarespace/                   → SQSP Code Block consumption
    {asset}@1x.png                → 1× export
    {asset}@2x.png                → 2× retina
    {asset}.codeblock.html        → paste-ready snippet w/ inline CSS
  /print/                         → physical keepsake debossing
    {asset}.pdf                   → vector, CMYK
```

---

## 12. Naming Conventions

- **Files:** `kebab-case`. `katha-wordmark-primary-dark.svg`.
- **CSS classes:** BEM-lite, prefixed `k-`. `.k-hero`, `.k-thread__path`, `.k-card--deckled`.
- **CSS tokens:** `--katha-{token-name}` for raw values, `--{semantic-alias}` for usage.
- **React components:** PascalCase. `<KathaThread />`, `<DeckledCard />`.
- **Brand asset slugs:** `wordmark`, `logomark`, `ktha-mark`, `pattern-binakul`, `pattern-calado`.