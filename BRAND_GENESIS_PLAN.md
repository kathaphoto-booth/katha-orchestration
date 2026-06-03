# BRAND GENESIS PLAN (KATHA)
**Agent Directives:** This file is the "Game Memory" for Claude Code (CC) and Claude Design (CD). Read this upon boot.

## 1. The Mandate
Katha is a $10K heirloom experience. We are not a generic, bouncy wedding photobooth. 
- **The Physical Rule**: No flat digital vectors. No pure `#000000` or `#ffffff`. Every UI element must feel like it was physically woven (Wabi-Sabi textures), embroidered (Calado cutwork), or hot-forged (Rust deboss).
- **The 80/20 Rule**: Signature elements are held tight (The L-Border, The Mark); Classic elements are exempt but must adhere strictly to the palette.

## 2. The Palette (The 4 Pillars)
1. **Woven Silk Temple (Base Skin)**: A deep, warm champagne/beige woven silk texture. The canvas.
2. **Victorian Cream (Calado Mask)**: Antique off-white cream. Used for sheer embroidery overlays and the Immersive L-Border.
3. **Loko Rust (The Flash of Life)**: `#8C382A`. Used for the heavy debossed brand mark and the Sacred CTA Buttons.
4. **Obsidian Weave (Structure)**: `#111112`. Deepest charcoal. Used for sharp typography and structural weight.

## 3. The Architecture (CD Iteration Base)
**The Immersive L-Border**: 
- A Top Frame and a Left Frame utilizing the `victorian_cream_calado.png` high-fashion texture.
- These frames employ a soft CSS `linear-gradient` mask to fade organically into the Silk Temple base, avoiding brutalist straight lines.
- Content is padded inward (`padding-left: clamp(80px, 12vw, 200px)`) so typography flows gracefully beneath and beside the soft fades without washing out.

## 4. The Assets
All physical textures have been generated at "Nano Banana Pro" high-fidelity and are located in `CD_ITERATION/assets/`:
- `woven_silk_temple.png`
- `victorian_cream_calado.png`
- `loko_rust_dye.png`
- The geometric Brand Mark uses an advanced SVG filter (`#katha-deboss`) to simulate physical hot iron pressed into silk.

**CD AGENT DIRECTIVE:** Proceed with the UI build-out in `CD_ITERATION/KATHA_STYLE_PROPOSAL.html` using these exact architectural laws. Do not revert to generic digital design.
