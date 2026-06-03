---
name: katha-protocol
description: Master orchestration skill for Katha Booth. Consolidates the former 4 skills into a single authoritative protocol. Governs the 11-token palette, the $10K Brief constraints, layout physics, and the Knowledge Graph memory integration (without DOM-scraping fallbacks).
---

# Katha Protocol

## 1. Ecosystem Binding
This protocol dictates that AG (Antigravity) and CC (Claude Code) are not autonomous regarding aesthetic decisions. They are strictly executors of the Jed → CC → AG orchestration chain. 
The single source of truth for the project resides in `/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/`. There is no local `.antigravity` private memory of record.

## 2. Knowledge Graph Memory (No DOM-scraping)
AG must record and read knowledge graph entities from `KATHA_VAULT/knowledge/` in structured JSON.
- **BRAND_CANON.json**: Core narrative, $10K brief constraints, voice rules.
- **TECH_DEBT.json**: Active and deferred architectural issues.
- **SESSION_HANDOFF.json**: Checkpoint states between CC and AG.
Do not use DOM-scraping fallbacks for memory retrieval. If `create_entities` MCP tool fails, write to these flat files directly.

## 3. The $10K Brief (Constraints)
- **Palette**: The 10 canonical tokens (3 core + 7 support).
  - Core: `#111112` (Obsidian Weave), `#EAE2D5` (Piña Ecru), `#8C382A` (Loko Rust).
  - Support: `#C4B59D` (Champagne Heirloom), `#241E1A` (Iron Bark), `#9C958A` (Hammered Sequin), `#1A1816` (Knalum Ink), `#A35C44` (Terracotta Earth), `#5A5D5A` (Abel Slate), `#B5B8A3` (Capiz Sage).
  - Legacy OAX colors (including `#0a0806`), pure `#000`, and pure `#fff` are **strictly forbidden**.
- **Voice**: Peer executive. Direct, confident, no sentimentality.
  - *Forbidden Words*: "keepsake", "handloomed", "heirloom artistry", "raw silk", "fabric of the keepsake", "golden moments", "capture memories", "magic", "magical".
- **Typography**: 
  - *Display/Headlines*: Fraunces (`font-variation-settings: "SOFT" 100, "WONK" 1`) or EB Garamond. Used for extreme structural dominance and lowercase luxury styling.
  - *Body/Functional*: EB Garamond (primary narrative/italic taglines) or Inter (neutral UI utility).
- **Anti-Patterns (Reject)**:
  - `sepia()` filter
  - Party tropes / confetti UI / AI gradients
  - Generic CSS layout wrappers

## 4. Adversarial Verify Workflow
Before publishing any new design direction or mark, AG must execute the adversarial-verify pattern: 
Synthesize reviews from 5 independent simulated critics against the $10K Brief constraints, checking for hex drift, contrast failures, and mood-amplification, before asking Jed to approve.

## 5. TAHENG GREPO OVERRIDE (HTML Format Mandate)
Whenever the user requests HTML generation, a UI mockup, or a code block, it **MUST** strictly adhere to the locked "Taheng Grepo" baseline (as established in `KATHA_STYLE_PROPOSAL.html`).
- **Base Canvas (The Morena Skin & Camisa)**: The background is a warm, rich tone representing pre-colonial Morena skin (`var(--morena)` `#C29B85` or Champagne `#C4B59D`). Over this skin, a CSS mask engraving of the geometric Calado diamond pattern is applied (`var(--ecru)` `#EAE2D5`), representing the camisa.
- **The Physical Barong Frame**: The architecture is framed by the physical L-Frame asset (injected via alpha-transparent JSON base64). This embossed paper frame acts as the tactile Barong overlay, anchored to the top and left edges. (Alternatively, a sheer 16px translucent CSS frame `rgba(234, 226, 213, 0.45)` with `backdrop-filter: blur(12px)` may be used if physical assets are unavailable).
- **Asymmetric Void Spacing**: The layout fuses the intimidating negative space of the Void iteration (`12rem` section padding) with the structural grid of the Calado iteration. Content should be staggered rightwards, allowing the vast negative space and physical assets to breathe.
- **The Maker's Mark**: Logos and watermarks MUST be injected surgically as alpha-transparent physical assets (JSON format) to retain realistic debossed lighting, preserving the true Loko Rust (`#8C382A`) iron burn against the light skin base.
- **Typographic Posture**: Typography *is* the architecture. Use Fraunces/EB Garamond in `var(--obsidian)` (#111112) with aggressive sizing, massive negative space, and elegant italic contrast.
- **The Flow**: All pages must inject and feature `/gallery` and `book.katha` prominently, breathing this unified architectural air.
- **The Ethos**: We are celebrating the elegantly quiet Barong wedding of a bride with Morena skin, representing deep pride in culture and pre-colonial stereotypes. The UI must feel like a breathtaking, deconstructed high-fashion editorial.
