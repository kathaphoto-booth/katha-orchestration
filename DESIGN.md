---
name: The Gilded Archive
tokens_source: pb-v3/app/globals.css
supersedes: ATELIER (Forest + Cream) — retired 2026-07-13
palette:
  void: #110F0D
  section: #181512
  card: #201B16
  raised: #28221B
  ink: #F5EFE6
  headline: #E4DACA
  muted: #A89C8A
  gilt: #DCCBB5
  moss: #4E5B48
typography:
  display: FH Ronaldson Display
  body: Cormorant Garamond
  label: Outfit
  mono: Courier Prime
---

# DESIGN SYSTEM: THE GILDED ARCHIVE

> Canonical as of 2026-07-13. This supersedes the retired "ATELIER / Forest + Cream"
> spec (Alabaster / Emerald / IvyMode / Proxima Nova), which described a light system
> that was never built. The implemented system is the dark **Gilded Archive** whose
> tokens live in `pb-v3/app/globals.css @theme` — that file is the source of truth;
> this document is its prose + governance mirror (parsed by the impeccable enforcer).

## 1. Overview & Creative North Star

**Creative North Star: "The frame your night lives in."**

Weathered oak and satin champagne, lit like a heritage darkroom. Katha is a photo-booth
atelier, and the booking pipeline is dressed as its archive: a dark, quiet-luxury surface
ladder, editorial serif display, mono eyebrows, and a single warm accent. Every surface is
senior-accessible by default — legibility is a token-level baseline, not a mode.

**Key Characteristics:**
- Dark heritage-archive palette — no white page, no red anywhere.
- Editorial asymmetry and generous negative space over centered, boxed layouts.
- Sharp 2px radii and hairline rules — machined, not soft; no uniform pill rounding.
- One warm accent (gilt) carrying all high intent; moss reserved for state, never text.
- Accessibility as baseline: ≥16px essential text, ≥44px targets, AA contrast, visible focus.

**The No-Slop Rule.** No AI-purple gradients, no generic drop shadows, no Bootstrap grids,
no Inter, no uniform rounded corners. Distinctive, intentional, editorial — or it doesn't ship.

## 2. Colors

The palette is a surface ladder in Kamagong browns, Piña-Ecru ink, and one sacred accent —
Satin Champagne gilt. Five print stocks for the proofs. There is no red token in the system.

### Surface Ladder
- **Kamagong** (#110F0D): Page void — the deepest surface (`--color-katha-l0`).
- **Kamagong Lift** (#181512): Section surface, one step up (`--color-katha-l1`).
- **Oiled Oak** (#201B16): Card surface (`--color-katha-l2`).
- **Kape** (#28221B): Raised card / drawer (`--color-katha-l3`).

### Ink
- **Piña Ecru** (#F5EFE6): Primary ink — body and essential text (`--color-katha-ink`).
- **Bone** (#E4DACA): Display headlines (`--color-katha-hi`).
- **Rattan** (#A89C8A): Secondary ink; passes AA on l1/l2 (`--color-katha-mut`).
- **Capiz Slate** (#8C8477): Meta only, on base surfaces — lifted 2026-07-13 to clear AA on l0/l1 (5.2/4.9:1); still fails AA on raised cards, and the contrast gate enforces both sides (`--color-katha-fnt`).

### Accent and State
- **Satin Champagne** (#DCCBB5): The sacred gilt — CTAs, active states, high intent (`--color-katha-gilt`).
- **Gilt Dark** (#8A7350): Gilt darkened to speak on light stock (`--color-katha-gilt-dark`).
- **Moss Patina** (#4E5B48): State only, never text (`--color-katha-moss`).
- **Lifted Moss** (#8FA283): When moss must read as text/icon (`--color-katha-moss-hi`).

### Print Stocks
- **Heirloom Piña** (#F5EFE6): Default warm-cream proof stock.
- **Sepia Bone** (#E9DFCC): Aged bone stock.
- **The Void** (#110F0D): Dark stock — ink prints in ecru.
- **Moss Patina** (#4E5B48): Deep green stock.
- **Satin Champagne** (#DCCBB5): Metallic-warm stock.

**The No-Red Rule.** There is no red in this system and no red token to reach for. Errors,
alerts, and validation speak in Piña-Ecru ink beside a gilt rule — never a red flash.

**The One Gilt CTA Rule.** Satin Champagne is the only high-intent accent, and exactly one
gilt primary action appears per viewport (law D2). Everything else is ink, muted, or line.

## 3. Typography

**Display Font:** FH Ronaldson Display (with Newsreader, Georgia, serif)
**Body Font:** Cormorant Garamond (with Georgia, serif)
**Label Font:** Outfit (with system-ui, sans-serif)
**Mono Font:** Courier Prime (with Courier New, monospace)

**Character:** Editorial and archival — a light-weight serif display set large and asymmetric,
warm serif body, and a mono eyebrow that behaves like a filing-cabinet label. Headlines run
light (300) with tightened tracking; eyebrows run uppercase with wide tracking.

### Hierarchy
- **Display** (FH Ronaldson Display, weight 300, 32–48px fluid clamp): massive editorial headlines.
- **Title** (Newsreader / FH Ronaldson, 24–32px fluid): section titles.
- **Lede** (Cormorant Garamond italic, 18–20px fluid): intros and quiet asides.
- **Body** (Outfit — the interface default; Cormorant carries editorial prose, 16–17px fluid): all essential and interactive text.
- **Label** (Outfit, 16px): field labels — always persistent, never placeholder-only.
- **Meta** (Courier Prime, 13px): secondary, non-essential text.
- **Eyebrow** (Courier Prime, 11px): decorative mono label only.

**The Senior Floor Rule.** Essential or interactive text never renders below 16px; secondary
text bottoms out at 13px; the 11px mono eyebrow is decorative only and every fact it carries
is duplicated in an accessible-sized element. Targets are ≥44px, primary actions 48px, fields 56px.

## 4. Elevation & Depth

Depth is carried by a near-black shadow and hairline ecru rules, not by soft grey cards.
Surfaces separate by climbing the ladder (l0→l3) and by a single deep shadow on lifted objects.

- **Proof plate** (`box-shadow: 0 24px 60px rgba(0,0,0,0.85)`): the live print proof floats over the void.
- **Gallery lift** (`box-shadow: 0 40px 80px rgba(0,0,0,0.85)`): plate cards on hover.
- **Drawer / HUD** (`box-shadow: 0 24px 60px rgba(0,0,0,0.6)`): the vault drawer and docked intent HUD.

**The Velvet Rope Rule.** Locked content is never `display:none` — it stays visible, dimmed and
softly blurred, and glides open (opacity + blur over 1.4s) once a night is noted. Nothing ships blank.

## 5. Components

The pipeline is built from a small set of accessible primitives in `pb-v3/components/ui/*`,
each labelled, aria-wired, ≥44px, and palette-agnostic so it survives any stock.

### Field
- **Height:** 56px (`--field-h`), 16px text.
- **Background:** transparent with a 1px `--color-katha-ln2` border, 2px radius.
- **Focus:** border shifts to gilt; label is always visible (never placeholder-only).
- **Default:** helper text in meta; inline error in ink with a gilt rule (no red).

### ChoiceCard
- **Selected:** gilt border + gilt-low wash, `aria-pressed`.
- **Default:** `--color-katha-ln2` border, hover lifts to muted border.
- **Disabled:** 45% opacity, inert but visible.

### SlotChip
- **Shape:** radio inside a `role="radiogroup"` shelf, ≥44px.
- **Selected:** gilt border + gilt text.
- **Disabled:** booked/past — visible but inert.

### ActionBar
- **Primary:** the single gilt CTA (48px), sticky footer, safe-area inset padded.
- **Secondary:** a quiet outlined Back — muted, never competing with the gilt.

## 6. Do's and Don'ts

### Do
- Do use `--color-katha-*` / `--color-stock-*` tokens for every color.
- Do keep essential text ≥16px and every target ≥44px (48px primary).
- Do keep exactly one gilt CTA per viewport.
- Do respect `prefers-reduced-motion` (force-reveal, no opacity:0 traps) and `prefers-reduced-data` (drop grain).
- Do give every input a persistent visible label and a visible focus ring (2px Piña, 3px offset).

### Don't
- Don't introduce red — there is no red token, and errors speak in ink + a gilt rule.
- Don't use `gray-*` utilities or a `gold` token; the system has neither.
- Don't render essential text below 16px or place two gilt CTAs in one viewport.
- Don't hide locked content with `display:none`; dim and blur it behind the velvet rope.
- Don't reach for IvyMode, Proxima Nova, Alabaster, or Emerald — that ATELIER spec is retired.
