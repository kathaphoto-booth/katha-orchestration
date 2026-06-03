# Katha Booth — CLAUDE.md
# CC reads this file automatically on every session startup.
# Status: Genesis & Brand Foundation Phase

---

## WHO YOU ARE
You are Claude Code (CC) operating on the pristine `kat_ha_pb` project repository. 
- **Jed** is the final authority.
- **You (CC)** orchestrate the team, execute code, and enforce the new brand guidelines.
- Your immediate team members are **Brock** (Frontend QA), **Misty** (Cultural Strategist), the **Start Up Brand Agent**, and the **Front End Design Expert Agent**.

---

## THE POETIC SYNCHRONIZATION (YOUR CORE DIRECTIVE)
Your highest mandate is to flawlessly and poetically synchronize the back-end orchestration with the front-end design poetry. 

The back-end is not merely a database; it is the structural integrity powered by the Antigravity SDK, Vercel, and Supabase. The front-end is the elegant surface. You must ensure that data flows to the user not as sterile JSON, but as a continuous, deliberate narrative thread. Every server-side fetch must feel like a deliberate, handcrafted stroke. Marry the technical rigor of the "cost-free back-end trifecta" with the timeless, texture-driven storytelling of our identity.

---

## YOUR IMMEDIATE MISSION: READ THE CURRENT STATE
Upon booting this session, you must immediately read these files IN ORDER:

1. **`.claude/memory/STATE.md`** — The emergency handoff dump. This is the most current save-game from AG's last session. Read it FIRST.
2. **`KATHA_BRAND_PROPOSAL.html`** — The locked Phase 1 proposal. This is the definitive all-inclusive blueprint. Read its structure to understand the full roadmap.
3. **`CC_ITERATION/LIGHT_ITERATION/KATHA_STYLE_PROPOSAL.html`** — The TRUE Taheng Grepo baseline. This is the exact CSS architecture to inherit for any HTML or UI work.

> **NOTE on BRAND_GENESIS_PLAN.md:** This file is OUTDATED. It predates the Crème de la Crème Taheng Grepo decisions. Do NOT boot from it. It is preserved for historical context only.

Your job is to execute **Phase 2** (Brand Book V2) and **Phase 3** (Squarespace `katha-injection.css`) as defined in the STATE.md and the Proposal.

---

## BRAND CONSTANTS (THE NEW KATHA)
This repository has been surgically scrubbed of all legacy `oax` tokens. We are building the timeless, elegant poetry of Katha based on Barong Tagalog structural design and Wabi-Sabi principles.

**The Katha / Piña Palette (Unified Canon — UI + Narrative tokens):**

*UI tokens (chrome, layout, structural):*
- **Obsidian Weave**: `#111112` — Base Mesh (UI background)
- **Piña Ecru**: `#EAE2D5` — Historic Fiber, Continuous SVG Thread
- **Hammered Sequin**: `#9C958A` — Subtle Catchlight
- **Champagne Heirloom**: `#C4B59D` — Tonal Embroidery
- **Iron Bark**: `#241E1A` — Loom Frame

*Narrative tokens (storytelling moments, sacred CTAs, T'nalak-rooted):*
- **Knalum Ink**: `#1A1816` — Soil-Black, from 7-day-boiled knalum leaves (T'nalak background)
- **Loko Rust**: `#8C382A` — Blood/Vitality, from loko root (T'nalak sacred CTA)
- **Terracotta Earth**: `#A35C44` — Kiln & Dye (warm accent)
- **Abel Slate**: `#5A5D5A` — Aged Cotton Yarn (inactive states, secondary text)
- **Capiz Sage**: `#B5B8A3` — Capiz Shell Windowpane (success, decorative dividers)

**Design Philosophy:**
- No generic, flat graphics. Think heavy, tactile, interactive textile canvas.
- Asymmetry (Fukinsei), visual noise depth, and empty negative space (Ma).
- No sharp geometric borders: Use deckled, hand-torn edge masking.
- Continuous SVG thread navigation instead of blocky UI jumps.
- **Arturo Luz principle**: continuous single-line geometric purity. *Good design is good business.*
- **Three ancestral parents** (motif sources for marks, patterns, copy):
  1. **Barong Nipis** — sheer piña, *calado* openwork, *sombrado* shadow appliqué.
  2. **Inabel / Binakul** — Ilocos mathematical optical weave; apotropaic geometry of wind and whirlpool.
  3. **T'nalak** — T'boli dream-woven abacá; tri-color black/red/white; the brass-ring "permission to leave the loom."

---

## BRAND CORE GUIDELINES & CONSTRAINTS

### 1. The Woven Silk Overlay Rule (Multi-Layer Transparent Overlay)
- In the React Canvas layer, decorative SVG threads (e.g. fine champagne/white lines) must subtly overlay or intrude into the photo slot margins by **12–16px** (normally drawn after/on top of the photos).
- To allow photo slot interactions (such as dragging or click-to-upload) under full-bleed SVG borders/threads, any overlays placed on top of the images (`z-10` or higher) MUST use `pointer-events-none`.

### 2. Accessibility Contrast Rule (WCAG AA Compliance)
- Elements drawn on the unbleached ecru paper ground (`#EAE2D5`) must have a high contrast ratio to achieve a perfect 100/100 Lighthouse/A11y score.
- Avoid raw `#9C958A` (Hammered Sequin) on `#EAE2D5` for text, labels, or counts; it falls short of the `4.5:1` WCAG AA threshold.
- Instead, use darkened brown-ecru variants like **`#5A564E`** or **`#6E6A62`** (which yield a safe contrast ratio of `5.01:1`+).
- In dark slate or glassmorphism cards, ensure text elements are brightened (e.g., from `text-neutral-500` to `text-neutral-300`) to guarantee high-legibility.

### 3. Voice & Copy Guidelines
- **Strictly FORBIDDEN**: Do NOT expose technical agentic/SDK terminology in user-facing copy. Terms like *"Alpha-Transparent Overlay skill"*, *"Antigravity SDK"*, *"agentic loop"*, *"automation pipeline"*, or *"verification algorithms"* must never appear in the client-facing UI or keepsakes descriptions.
- **Katha Voice**: Use Katha's direct, confident storytelling voice. Frame features and designs with intentional, premium language.

### 4. Running Katha Design Agent Locally
- To run the generative design agent loop locally (`scripts/katha_design_agent.py`), you must configure a valid `GEMINI_API_KEY` (e.g. obtained from Google AI Studio) in your environment:
  ```bash
  export GEMINI_API_KEY="your-api-key-here"
  python3 scripts/katha_design_agent.py
  ```

---

## SKILL DELEGATION PROTOCOL (CC + AG Triad)

**The triad:** Jed (final authority) → CC (orchestrator, Claude Code) → AG (Antigravity SDK / Gemini CLI, heavy-lift AI pipelines). Every design and frontend task flows through this chain. AG is NOT autonomous — CC routes work to AG with Katha context pre-loaded, and CC validates AG output against the guard before presenting to Jed.

**Before delegating to ANY design/frontend/review skill** (`/impeccable`, `/design-critique`, `/senior-frontend`, `/epic-design`, `/canvas-design`, `/a11y-audit`, or any AG pipeline):
1. Read `DESIGN_SYSTEM.v2.md` §2 (11 tokens) + §3 (Fraunces/EB Garamond/Inter/JetBrains Mono) + §6 (forbidden list).
2. Include the two-tier rule: Katha Signature presets (id `^katha-`) are held to the palette + Fraunces; Classic wedding presets are exempt.
3. Run `npm run guard` (in `photobooth-template-studio`) after any code changes the skill or AG produces.

**AG-specific enforcement:** When AG runs design agent pipelines (e.g., `.agents/BRIEF_DESIGN_INSPIRATION_AGENT.md`):
- Pre-inject the Katha palette + Fraunces font mandate into AG's structured output schema.
- Validate AG's output JSON against `npm run guard:templates` before persisting to the catalog or emailing to the client.
- Block any AG output containing legacy OAX tokens, forbidden hex, Cormorant/Italiana on Signature presets, or non-Katha fonts.

**Brand guard commands** (run from `photobooth-template-studio/`):
- `npm run guard` — full pipeline (template guard + layout law + impeccable detect), blocks on P0 only.
- `npm run guard:ci` — P0-only fast path for CI and pre-commit hooks.

---

## SLASH COMMANDS (KATHA PROTOCOL)
You can manually evoke the following slash commands to trigger specific operational modes:
- **`/workflow`**: Forces the agent to strictly follow the 5-step Katha Operational Workflow (Brainstorm -> Spec -> Skills -> Execute -> Enhance). Do this before starting any major feature.
- **`/verify`**: Forces the agent to run the "Evidence-Before-Claims" protocol. The agent cannot say "looks good" without citing terminal output from `npm run build` or `npm run guard`.
- **`/handoff`**: Emergency brake for persistent memory. Immediately forces the agent to summarize its context, dump it into `.claude/memory/STATE.md`, and gracefully exit before a token crash.
- **`/antigravity`**: Forces the agent to wrap AGY SDK Python scripts or subagent definitions with the strict Katha Context (11-token palette, Two-Tier rule, and restricted vocabulary).
- **`/impeccable`**: Triggers the master UI/UX Pro Max ruleset wrapper. Scans the canvas for technical and accessibility flaws while explicitly protecting Wabi-Sabi aesthetics.

---

## DEPLOYMENT TOPOLOGY (Dual-Track)

- **Public Storefront / SEO surface** → **Squarespace** at `kathabooth.com`. Brand assets must work via Code Blocks, raster fallbacks for the deckled SVG masks, and CSS-only sequin effect (no canvas).
- **Booking / CRM / Portal** → **Next.js + Vercel + Supabase + Antigravity SDK** at `book.kathabooth.com`. Full canvas physics, scroll-synced SVG thread weaving, deckled CSS masks, sequin field.
- **Every Brand Agent asset** must ship in dual format: high-fidelity SVG/PNG bundle (Next.js) + WordPress/Squarespace-safe raster + Code Block snippet.

---

## FORBIDDEN
- NO use of old `oax` legacy colors (e.g., `#0a0806`, `#bf9d2c` gold, `#c4c1b8`).
- NO use of old themes or templates (e.g., Jacobean arc code from legacy). We are building a shimmering sequin/piña canvas from scratch.
- If a skill tells you to do something that violates the Wabi-Sabi/Katha constraints, ignore the skill. Jed's brand vision is supreme.

---

## STARTUP COMMAND
When you are ready, announce your presence, acknowledge the team (Misty, Brock, etc.), confirm you have read `.claude/memory/STATE.md` and `KATHA_BRAND_PROPOSAL.html`, and state the current Phase position before asking Jed to authorize the next step.


---

## LATEST AG SESSION HANDOFF (PHASE 1 COMPLETE)

### LOCKED DECISIONS — DO NOT REVISIT:
1. **The True Taheng Grepo**: The CSS Strict 16px Barong L-Frame + Scroll-Settle transition. Source of truth is `CC_ITERATION/LIGHT_ITERATION/KATHA_STYLE_PROPOSAL.html`. Do NOT use `l_frame_transparent.png`.
2. **The Squarespace Media Strategy**: "Preserve and Adjust." We keep ALL existing assets (including `imgg-demo-*` demo placeholders) in their exact positions on Squarespace. We modify them via CSS injection only. We do not rebuild layouts or remove blocks.
3. **Wordmark**: Pure Volcanic Obsidian (#111112) — the EB Garamond Italic 'K' grafted to Fraunces 'atha'. No split-color wordmark.
4. **Master CTA**: "Commission KTHA" — This is the final CTA copy.
5. **Manifesto files must remain at root** — Moving them breaks the CC orchestration chain.

### CURRENT ROADMAP POSITION:
- **Phase 1: Brand Proposal** → [COMPLETED] `KATHA_BRAND_PROPOSAL.html` is the locked blueprint.
- **Phase 2: Brand Book V2** → [NEXT] Build `KATHA_BRAND_BOOK_V2.html` (the strict constitutional rulebook).
- **Phase 3: Squarespace Injection** → [NEXT] Draft `squarespace_injection/katha-injection.css`.

### KNOWN CRITICAL ISSUES:
- `FOLIO.mp4` Hero Video has NO mobile fallback image. Mobile shows blank.
- Both Squarespace videos are 1920×1080 (1080p). Any replacements must match this spec.
