---
name: Katha Photo Booth
description: Perseverance composed into thread — Filipino heritage woven through wabi-sabi web design.
colors:
  primary: "#8C382A"
  primary-deep: "#6E2C20"
  neutral-bg: "#EAE2D5"
  obsidian-weave: "#111112"
  pina-ecru: "#EAE2D5"
  hammered-sequin: "#9C958A"
  champagne-heirloom: "#C4B59D"
  iron-bark: "#241E1A"
  knalum-ink: "#1A1816"
  loko-rust: "#8C382A"
  terracotta-earth: "#A35C44"
  abel-slate: "#5A5D5A"
  capiz-sage: "#B5B8A3"
  ecru-muted: "#5A564E"
  ecru-muted-soft: "#6E6A62"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(2.5rem, 7vw, 4.5rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.015em"
    fontVariation: "'SOFT' 100, 'WONK' 1"
  body:
    fontFamily: "EB Garamond, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    letterSpacing: "0.12em"
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.75rem"
    letterSpacing: "0.04em"
rounded:
  sm: "0px"
  md: "0px"
spacing:
  sm: "8px"
  md: "24px"
  lg: "64px"
components:
  button-sacred:
    backgroundColor: "{colors.loko-rust}"
    textColor: "{colors.pina-ecru}"
    rounded: "{rounded.sm}"
    padding: "16px 48px"
  button-sacred-hover:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.pina-ecru}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.iron-bark}"
    rounded: "{rounded.sm}"
    padding: "14px 40px"
---

# Katha Photo Booth — Visual Design System

## 1. Overview

Katha (Tagalog) — to compose, to weave a poem or story. Not a noun; a verb. The booth
is a loom; every print is a stroke woven into a passed-down heirloom; the KTHA maker's
mark is the brass ring offered when a finished cloth leaves the loom. The system is
rooted in three ancestral parents — **Barong Nipis** (sheer piña, calado openwork),
**Inabel / Binakul** (Ilocos optical apotropaic weave), and **T'nalak** (T'boli
dream-woven abacá, the tri-color black/red/white discipline).

North star: **Arturo Luz — continuous single-line geometric purity; "good design is
good business."** The surface should feel like a heavy, tactile textile canvas, never a
flat generic graphic. Asymmetry (Fukinsei), depth through visual noise, and held empty
space (Ma). Data must reach the user as a continuous narrative thread, never sterile JSON.

> Note: this catalog is **two-tier**. *Katha Signature* presets follow this system in
> full. *Classic* wedding presets (Cinzel, Playfair, Rochester; lighter grounds) are
> intentionally polished and symmetric and are exempt — see `.impeccable/ignore.md`.

## 2. Colors

### Primary (sacred)
- **Loko Rust** (#8C382A): The sacred CTA — and only the sacred CTA. From boiled loko
  root in the T'nalak tradition: blood, vitality, permission. Exactly one visible per
  screen. Its scarcity is the point.

### Neutral
- **Piña Ecru** (#EAE2D5): The primary light ground and the continuous SVG thread.
- **Iron Bark** (#241E1A): Primary text on light grounds; the loom frame line.
- **Obsidian Weave** (#111112) / **Knalum Ink** (#1A1816): Dark grounds (UI / narrative).
- **Champagne Heirloom** (#C4B59D): Tonal embroidery, secondary frames, hairlines.
- **Abel Slate** (#5A5D5A): Muted / inactive text.
- **Ecru-muted** (#5A564E) / **Ecru-muted-soft** (#6E6A62): The only safe muted text on
  Piña Ecru (≥5:1 WCAG AA). Never use Hammered Sequin as text on ecru.

### Tertiary (narrative)
- **Terracotta Earth** (#A35C44): Warm narrative accent (quote bars, stat emphasis).
- **Capiz Sage** (#B5B8A3): Success states and decorative dividers.
- **Hammered Sequin** (#9C958A): Catchlight on **dark grounds only** — never text on ecru.

**The Sacred Accent Rule.** Loko Rust appears on ≤1 element per screen — the booking
moment. Treating it as a UI state (filter chips, toggles) breaks the spell.

## 3. Typography

- **Display (Fraunces):** carved, grounded, asymmetric, `SOFT 100 WONK 1`. One terminal
  pressed slightly deeper, as if into wood. Tracking −0.015em. Never weight 700.
- **Body (EB Garamond):** long-form copy, 1.6 line-height.
- **Label (Inter):** UI labels, nav, buttons. Uppercase, +0.12em tracking.
- **Mono (JetBrains Mono):** metadata, ordinals, stamps. +0.04em.

**The Carved-Wood Rule.** Cormorant Garamond is forbidden as a display face — it is too
clean and courtly; it betrays the carved temperament. Fraunces' SOFT/WONK axes are the
imperfection mechanism. (Classic wedding presets keep period faces — they are exempt.)

## 4. Elevation

Flat and material, not lifted. **No drop-shadows on light grounds** — use the built-in
*sombrado* shadow-appliqué plate (a tonal offset, not a blur). Depth comes from woven
noise (a 4% Binakul `feTurbulence` patina) and from threads overlapping photo margins by
12–16px (the Woven Silk Overlay rule; any z-10+ overlay must be `pointer-events-none`).
Edges are **deckled / hand-torn via SVG `mask-image`** — never `border-radius`, never a
hard geometric border. The only allowed rule line is the **calado openwork divider**
(replaces every `<hr>`).

## 5. Components

### button-sacred
- **Style:** Loko Rust background, Piña Ecru text, zero radius, generous padding. The
  booking CTA. One per screen.

### button-ghost
- **Style:** transparent, Iron Bark text, Champagne calado-dotted underline on hover,
  zero radius.

### deckled-card
- **Style:** SVG `mask-image` torn edge (variants a/b/c rotated across a grid), sombrado
  plate instead of shadow, no radius. Wraps images and feature blocks.

### calado-divider
- **Style:** the single sanctioned rule line — a champagne (or sage, for success) openwork
  stitch path. Replaces `<hr>` and `border-top`.

### filter-chip
- **Style:** Iron Bark text on Champagne underline when active; Abel Slate when inactive.
  **Never Loko Rust** — that is reserved for the sacred CTA.

## 6. Do's and Don'ts

- **Do** keep Loko Rust to one sacred CTA per screen; its rarity is the point.
- **Do** use Fraunces for all Katha Signature display type.
- **Do** deckle every brand-chrome card via `mask-image`; rotate variants a/b/c.
- **Do** use `ecru-muted` / `ecru-muted-soft` for muted text on Piña Ecru.
- **Don't** use legacy oax hex — `#0a0806`, `#bf9d2c`, `#c4c1b8` — anywhere.
- **Don't** use Cormorant Garamond (or Italiana) as a Signature display face.
- **Don't** use pure `#000` or `#fff`; always tonal.
- **Don't** put Hammered Sequin (#9C958A) as text on Piña Ecru — fails WCAG AA.
- **Don't** use `border-radius` on cards/images, or `<hr>`, or 6/6 symmetric grids in
  brand chrome.
- **Don't** expose technical/agentic terms in user copy (Antigravity, SDK, agentic,
  automation pipeline, verification algorithm).
- **Don't** apply Wabi-Sabi/Fukinsei rules to Classic wedding presets — they are
  intentionally polished and symmetric.
