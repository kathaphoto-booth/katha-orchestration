# DESIGN SYSTEM: ATELIER (Vanguard Edition)

## 1. META DIRECTIVE
This is an Awwwards-tier, $150k+ agency-level execution of the "Quiet Luxury / Heritage Minimalist" ATELIER aesthetic. 
- **NO SLOP:** No AI-purple gradients, no generic drop shadows, no standard Bootstrap grids.
- **Architecture:** Soft Structuralism + Editorial Luxury.
- **Execution Mandate for CC:** This spec must be executed with strict Test-Driven Development (TDD). Playwright interaction tests MUST be written for the magnetic buttons, double-bezel structures, and staggered scroll reveals *before* component implementation.

## 2. TYPOGRAPHY & COLOR
- **Display Typography:** `IvyMode` (Demanded by User). Used for massive, asymmetric editorial headlines. Letter-spacing tightened (`tracking-tighter`).
- **UI Typography:** `Proxima Nova` (Demanded by User). Used for micro-copy, floating labels, and form inputs.
- **Palette (The "Forest + Cream" Archetype):**
  - Background (Macro): Alabaster / Soft Ivory (`#FBFBF9`).
  - Text: Obsidian (`#0F0F0F`).
  - Accent: Deep Emerald Green (`#043927`). Used exclusively for the primary CTA pill and high-intent active states.
  - Hardware/Bezel Tints: `rgba(0,0,0,0.03)` for outer shells, pure `#FFFFFF` for inner cores.

## 3. STRUCTURAL ARCHITECTURE (THE DOUBLE-BEZEL)
Generic cards are banned. All form containers and elevated surfaces must use the **Doppelrand (Double-Bezel)** nested architecture to simulate machined hardware:
- **Outer Shell:** `padding: 0.375rem`, `background: rgba(0,0,0,0.04)`, `border: 1px solid rgba(0,0,0,0.05)`, `border-radius: 2rem`.
- **Inner Core:** `background: #FFFFFF`, `box-shadow: inset 0 1px 1px rgba(255,255,255,0.8)`, `border-radius: calc(2rem - 0.375rem)`.

## 4. HAPTIC MICRO-AESTHETICS & MOTION
- **CTA Button (Button-in-Button):** 
  - Primary CTA must be a fully rounded pill (`border-radius: 9999px`).
  - Trailing icon (`↗`) cannot sit naked; it must be nested in a distinct circular wrapper (`w-8 h-8 rounded-full bg-white/20`) flush right.
  - **Magnetic Physics:** On active/click, scale down the entire pill (`scale: 0.98`). On hover, scale up the inner icon circle (`scale: 1.05`) and translate it diagonally.
- **Frictionless Inputs:** Floating labels that translate cleanly to the top-left on focus, maintaining a 1px `border-bottom` that shifts from stone to obsidian.
- **Entry Choreography:** All elements must enter via a heavy, cinematic fade-up (`translateY: 4rem, filter: blur(8px), opacity: 0` resolving to `0` over 1200ms with `cubic-bezier(0.32,0.72,0,1)`).

## 5. LAYOUT (THE EDITORIAL SPLIT)
- **Desktop:** Massive, scroll-locked IvyMode typography on the left half (spanning 60vw), allowing the right half (40vw) to scroll the Double-Bezel form components into view.
- **Mobile Override:** Aggressive fallback to `w-full`, stacking typography on top and the form below with `min-h-[100dvh]` to prevent viewport jumping.
