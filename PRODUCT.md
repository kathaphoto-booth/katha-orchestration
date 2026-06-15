# Product

## Register

brand

## What this repo is

The Katha Photo Booth brand workshop — the parent of the production app. It holds the
marketing surfaces and brand source material: `gemini_draft/` (Next.js brand-homepage
draft), `squarespace/` (kathabooth.com storefront injection CSS + copy), `brand_assets/`
(marks, wordmarks, product shots), and the design-system documents
(`DESIGN_SYSTEM.md`, `DESIGN_SYSTEM.v2.md`, `BRIEF_FE_DESIGN_AGENT.md`). The production
booking app lives in the nested standalone repo `photobooth-template-studio/`
(register: product — it has its own PRODUCT.md/DESIGN.md).

## Users

Engaged couples and corporate event planners commissioning a photo booth — reached
through kathabooth.com (Squarespace storefront) and book.kathabooth.com (the portal).
Design IS the product on these surfaces: the brand homepage, the storefront, and every
piece of marketing chrome must carry the woven, wabi-sabi Katha identity.

## Voice

Peer-executive. Direct, confident, no sentimentality. Describe craft and materiality,
never luxury claims. Master CTA: "Commission". Forbidden words (user-facing):
keepsake, luxury/premium (≤1/page, specs only), stunning, amazing, unforgettable,
magic(al), journey, vibe, experience (noun), curated, authentic, aesthetic (noun),
Instagrammable, once-in-a-lifetime — plus all agentic/SDK/MCP technical vocabulary.

## Constraints

- Brand law is constitutional: see `DESIGN.md` here and the HAM vault `patterns.md`
  (which wins any conflict). Jed's brand authority is absolute.
- Squarespace surfaces must be CSS-only with raster fallbacks (no JS dependency).
- Fukinsei (asymmetry) applies to brand chrome only; client wedding templates in the
  nested repo stay polished and symmetric.
- Exactly one Loko Rust (#8C382A) element per viewport — the sacred CTA.
