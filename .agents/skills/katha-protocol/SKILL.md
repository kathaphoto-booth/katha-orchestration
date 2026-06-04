---
name: katha-protocol
description: Master brand law for Katha Booth. The 11-token palette, $10K Brief constraints, typography mandate, layout physics, and Taheng Grepo override. Use whenever a task touches brand output — HTML, CSS, copy, images, marks, design directions, client-facing UI, or any aesthetic decision. Also triggers on "palette", "brand", "colors", "typography", "Taheng Grepo", "Barong", "Calado", "Wabi-Sabi", or any reference to the design system. This is the constraint layer — it tells you what the rules are, not how to execute or verify.
---

# Katha Protocol — Brand Law

## Why This Exists

Katha commands a $10K+ booking fee. The visual identity must project museum-grade authority through restraint, materiality, and structural precision. Every hex code, every font choice, every word in the copy either reinforces or degrades that authority. This skill is the constitutional law that all agents — CC, AG, Brock, and subagents — must follow when producing any brand-touching output.

## Type: Rigid

These constraints are not suggestions. They are the locked canon approved by Jed. Violations are rejected, not negotiated.

## §1. Ecosystem Binding

AG and CC are not autonomous in aesthetic decisions. They execute within the **Jed → CC → AG** chain.

- **Jed** — final authority (Batman)
- **CC** — orchestrator (Robin)
- **AG** — heavy execution, strictly within the chain

The single source of truth is the HAM memory at `.memory/` (canonical on the Samsung 970; see `.memory/README.md`). No scattered local knowledge. No private `.antigravity` memory of record.

## §2. The $10K Brief — Palette

### The 11 Canonical Tokens

**Core (3):**
| Token | Hex | Role |
|---|---|---|
| Obsidian Weave | `#111112` | Dark base, text, wordmark |
| Piña Ecru | `#EAE2D5` | Light ground, SVG thread, camisa texture |
| Loko Rust | `#8C382A` | Sacred CTA only — exactly one per viewport |

**Support (7):**
| Token | Hex | Role |
|---|---|---|
| Champagne Heirloom | `#C4B59D` | Tonal embroidery, L-Frame, skin base |
| Iron Bark | `#241E1A` | Text on light, loom frame |
| Hammered Sequin | `#9C958A` | Dark grounds only — never text on Ecru (3.2:1 fail) |
| Knalum Ink | `#1A1816` | Narrative dark backgrounds |
| Terracotta Earth | `#A35C44` | Warm accent, quote bars — never UI state |
| Abel Slate | `#5A5D5A` | Inactive text, muted states |
| Capiz Sage | `#B5B8A3` | Success states, Calado dividers |

**Ecru-safe muted text (accessibility):**
| Token | Hex | Contrast on Ecru |
|---|---|---|
| `--katha-ecru-muted` | `#5A564E` | 5.6:1 ✅ AA |
| `--katha-ecru-muted-soft` | `#6E6A62` | 5.0:1 ✅ AA |

### Forbidden Colors
- Pure `#000000` and `#ffffff` — always
- `#F9F6F0` (Alabaster) — always
- `#0a0806`, `#bf9d2c`, `#c4c1b8` — legacy OAX tokens
- Any hex not derivable from the 11 canonical tokens

## §3. The $10K Brief — Typography

| Role | Font | Settings |
|---|---|---|
| Display / Headlines | Fraunces | `font-variation-settings: "SOFT" 100, "WONK" 1` |
| Narrative / Body | EB Garamond | Regular weight |
| UI / Navigation | Inter | Regular weight |
| Metadata / Stamps | JetBrains Mono | Regular weight |

**Forbidden fonts:** Cormorant Garamond, Italiana.
**Tracking:** Display `-0.015em`. Utility labels `+0.12em uppercase`. Mono `+0.04em`.
**Weight:** Never `font-weight: 700` on display type.

## §4. The $10K Brief — Voice

**Tone:** Peer executive. Direct, confident, no sentimentality, no reflected-praise.

**Forbidden words (user-facing copy):**
- "keepsake", "handloomed", "heirloom artistry", "raw silk", "fabric of the keepsake"
- "golden moments", "capture memories", "magic", "magical"
- "luxury", "premium" (max once per page, only in technical specs)
- "stunning", "amazing", "unforgettable", "journey", "vibe", "aesthetic" (noun)
- "experience" (noun), "curated", "authentic", "Instagrammable", "once-in-a-lifetime"

**Forbidden technical vocab (never in client-facing UI):**
- "Antigravity SDK", "agentic", "Alpha-Transparent Overlay", "automation pipeline"
- "verification algorithm", "MCP", "embedding"

**The craft-specificity rule:** Instead of claiming luxury, describe the materiality.
- ❌ "Our premium, luxury photo booths provide an unforgettable experience."
- ✅ "Two DSLR installations—weathered oak and raw iron frames—printing archival cotton portraiture."

Reject on sight:
- Party tropes / confetti UI / AI gradients
- Generic CSS layout wrappers
- `border-radius` on cards or images (use deckled masks)
- `<hr>` elements (use `<CaladoDivider>`)
- 6/6 symmetric grids (use 7/5, 8/4, 9/3, 5/7)
- Drop-shadows on light grounds
- `mix-blend-mode: multiply` on primary photo grids
- More than one `sacred` CTA visible at once

## §6. Adversarial Verify Workflow

Before publishing any new design direction or mark, execute the adversarial-verify pattern:

1. Simulate 5 independent critics reviewing the output
2. Each critic checks for: hex drift, contrast failures, mood-amplification, vocabulary violations, font drift
3. Compile findings into a report
4. Present to Jed for approval only after zero violations

This is not a rubber stamp. If a critic finds a violation, fix it before presenting.

## §7. Taheng Grepo Override (HTML Format Mandate)

When generating HTML, UI mockups, or code blocks, adhere to the locked baseline:

- **Canvas:** Warm Champagne (`#C4B59D`) or Morena (`#C29B85`) base with Calado diamond pattern mask in Piña Ecru (`#EAE2D5`)
- **L-Frame:** 16px translucent CSS Barong overlay on top + left edges. `rgba(234, 226, 213, 0.45)` with `backdrop-filter: blur(12px)`. Fixed positioning, `pointer-events: none`
- **Void:** `12rem` section padding. Content staggered rightward. Negative space is structural, not empty.
- **Maker's Mark:** Injected as alpha-transparent base64 assets. Loko Rust (`#8C382A`) iron burn on light skin.
- **Typography posture:** Fraunces / EB Garamond in Obsidian (`#111112`). Aggressive sizing. Massive negative space. Elegant italic contrast.

## Preflight Checklist

Before submitting any brand-touching output:

```
- [ ] All hex values are from the 11-token canon (or derived via opacity/shadow)
- [ ] Typography uses only Fraunces / EB Garamond / Inter / JetBrains Mono
- [ ] No forbidden words in user-facing copy
- [ ] No anti-patterns present
- [ ] Loko Rust appears max once per viewport, only in CTA context
- [ ] Hammered Sequin not used as text on Ecru background
- [ ] If new design direction: Adversarial Verify (§6) executed
```

## §8. Delegation Protocol (CC → AG)

When tasking AG (or any subagent) with brand-touching work, pre-inject this
protocol's canon into the agent's instructions:
- Pass the palette (§2) + typography (§3) + the two-tier rule (Signature `katha-`
  held to palette + Fraunces; Classic exempt).
- Require an output-validation step — run `npm run guard` (or `guard:templates`)
  on generated structured data; reject forbidden hex / Cormorant / off-palette.
- State the target: Next.js canvas (full SVG/PNG) or a Squarespace Code Block
  (CSS-only, no commercial web-font load).
- Never instruct an agent to use forbidden words in client copy (§4).

## §9. Operating Discipline

For any brand-touching build: load this protocol first → spec the deliverable →
execute → **prove it with evidence before claiming done** (terminal output,
screenshots, audit scores — feelings are not evidence). Use the built-ins for the
generic loop (`superpowers:brainstorming`, `superpowers:writing-plans`) and for
completion evidence (`verify` / `superpowers:verification-before-completion`).

## Relationship to Other Skills

This skill is the **constraint layer + delegation + operating discipline**.
- `katha-impeccable` — the UI/UX audit; reads this for criteria, produces evidence.
- Built-ins cover generic process: `superpowers:brainstorming` / `writing-plans` /
  `executing-plans`; `verify` / `superpowers:verification-before-completion`.

*(katha-workflow, katha-verify, katha-antigravity were dissolved into this skill
+ katha-impeccable on 2026-06-04 — see `KATHA_SKILLS_LEDGER.md`.)*
