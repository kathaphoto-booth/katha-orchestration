---
name: template-fidelity
description: "Dimension-grounding system for Katha photo booth templates. Ensures any agent reads slot dimensions from the canonical layouts.js registry rather than stale prose. Use when rendering, measuring, positioning, or documenting any template slot, margin, or canvas dimension — for any layout, any format, any client."
---

# Template Fidelity

This skill establishes the hard rule for dimension grounding in Katha Photo Booth templates. Any agent generating mockups, scripts, styles, or specs **must** read template geometries from the codebase's canonical registry (`layouts.js`) dynamically, rather than relying on hardcoded numbers in prompt instructions or skill documentation.

## The Grounding Rule

**Never state or compute a slot, margin, or canvas dimension from memory or from this SKILL.md.**

Before any render, measurement, positioning, or geometry calculation, you must run the dimension lookup tool:

```bash
node .agents/skills/template-fidelity/scripts/lookup.mjs --layout <id>
# Example: node lookup.mjs --layout strip-3   (2x6 strip, 3 slots)
# Example: node lookup.mjs --layout pv-2      (4x6 portrait, 2 slots)
# Example: node lookup.mjs --layout pc-3-v    (6x4 landscape, 3 columns)
```

You can also look up by format or preset:
```bash
node .agents/skills/template-fidelity/scripts/lookup.mjs --format <format> --slots <N>
node .agents/skills/template-fidelity/scripts/lookup.mjs --preset <presetId>
```

The tool will return the exact, live JSON definition directly from `photobooth-template-studio/lib/layouts.js`. Use this exact object.

## Provenance Audit (2026-06-28)

Why this rule exists: hardcoded dimensions in old skills silently drifted and became dangerously stale, leading to botched custom scripts.

| Source | Claim (for 2x6, 3-slot layout) | Verdict |
|---|---|---|
| `photobooth-template-studio/lib/layouts.js` (`strip-3`) | **480x380px** (margin 60) | **Ground truth** — the actual locked spec |
| Vault memory-log "canon" | 480x380px | Correct — matches the source |
| Custom calligraphy script (Steven & Cristalyn) | 478x410px | Drifted client deviation, never reconciled |
| `nano-banana/SKILL.md` Phase 4 | 510x440px | **Wrong** — stale prose, disagreed with codebase |

See `.memory/handoff/2026-06-28_steven-cristalyn-drift_verify.md` for the full audit.

## Next Phase (Custom Script Pipeline)

This grounding tool is the prerequisite for the **Custom Script Render Pipeline** (Part B). When built, the custom render pipeline will:
- Remain font-agnostic (no hardcoded client fonts).
- Use `lookup.mjs` to resolve canvas/slot geometries dynamically.
- Process PUA mappings and swashes for any provided font.
