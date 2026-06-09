---
name: nano-banana
description: GenKit workflow for visual design ideation of Katha Booth templates. Triggers on "ideate a template", "nano banana", "create a new preset".
---

# Nano Banana 🍌 — Katha Booth Template Ideation

## Overview
This skill orchestrates a local-only GenKit visual design ideation workflow for Katha Booth. It bridges the gap between pure creative ideation and strict, code-ready execution that honors the brand constraints.

## Trigger Scenarios
Use this skill when the user asks to:
- "ideate a template"
- "run nano banana"
- "create a new preset"
- "design a new client template"

## 1. Visual Ideation Phase
In this phase, you are an unrestrained visual ideator working exclusively within the Katha Booth brand law.

### Constraints:
- **Palette:** STRICTLY 10 brand tokens + 2 ecru-safe text tokens.
  - Core: Obsidian Weave (`#111112`), Piña Ecru (`#EAE2D5`), Loko Rust (`#8C382A` - CTA only).
  - Support: Champagne Heirloom (`#C4B59D`), Iron Bark (`#241E1A`), Hammered Sequin (`#9C958A`), Knalum Ink (`#1A1816`), Terracotta Earth (`#A35C44`), Abel Slate (`#5A5D5A`), Capiz Sage (`#B5B8A3`).
  - Ecru-safe text: `#5A564E`, `#6E6A62`.
- **Typography:** Display fonts from `LUXURY_FONTS` (Fraunces preferred). No Cormorant, no Italiana.
- **Wabi-Sabi Layout:** Fukinsei (asymmetry), Ma (negative space), sharp corners, no 6/6 grids.

*Prompt the user for an image (optional).*
If no image is provided, construct a conceptual composition directly from the brand constraints.

## 2. Function Calling Phase (Structure)
Once the design is conceptualized and the user approves the rough direction, generate the structural JSON representation of the `PhotoboothPreset`.

You must structure the design using the exact schema found in `photobooth-template-studio/lib/templates.ts` (the 62 preset structure). Example:
```json
{
  "id": "katha-signature-example",
  "name": "Example Name",
  "palette": {
    "background": "#EAE2D5",
    "primary": "#111112",
    "accent": "#8C382A",
    "text": "#5A564E"
  },
  "typography": {
    "title": "Fraunces",
    "subtitle": "JetBrains Mono"
  },
  "layout": {
    "grid": "asymmetric",
    "corners": "sharp"
  }
}
```

## 3. Code Execution Phase (Validation)
Before finalizing the preset, you MUST run a validation step to ensure:
- No forbidden hex codes (e.g., `#000`, `#fff`, `#F9F6F0`, legacy OAX codes) were used.
- The `id` prefix conforms to the signature tier rules (`katha-` prefix for signature designs).

Present the final validated preset to the user and ask if they'd like to inject it into `lib/templates.ts`.
