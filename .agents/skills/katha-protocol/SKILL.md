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
- **Palette**: 11 canonical tokens.
  - `#0a0806` (Obsidian), `#EAE2D5` (Piña Ecru), `#9C958A` (Hammered Sequin - careful on light bg), `#8C382A` (Loko Rust - max 1 per page).
  - Pure `#000` or `#fff` are forbidden.
- **Voice**: Peer executive. Direct, confident, no sentimentality.
  - *Forbidden Words*: "keepsake", "handloomed", "heirloom artistry", "raw silk", "fabric of the keepsake", "golden moments", "capture memories", "magic", "magical".
- **Typography**: 
  - *Display*: Cormorant Garamond / Fraunces (hero/ceremonial only).
  - *Functional*: Outfit / Inter (neutral defaults).
- **Anti-Patterns (Reject)**:
  - `sepia()` filter
  - Party tropes / confetti UI / AI gradients

## 4. Adversarial Verify Workflow
Before publishing any new design direction or mark, AG must execute the adversarial-verify pattern: 
Synthesize reviews from 5 independent simulated critics against the $10K Brief constraints, checking for hex drift, contrast failures, and mood-amplification, before asking Jed to approve.
