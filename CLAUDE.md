# Katha Booth Unified Governance & Operational Schema
# Last updated: 2026-06-30 (AG 2.0 Sync)

---

## 1. The LLM Wiki & Vault Architecture
We have transitioned to a persistent, compounding LLM Wiki knowledge system managed via **Obsidian** and resident in the Samsung 970 Vault.

### Canonical Paths:
- **Vault Root**: `/Volumes/samsung 970 pro - Data/KATHA_VAULT/`
- **Memory Root**: `/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/`
- **Shared Skills**: `/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/skills/`

### The 3 Layers:
- **Layer 1: Immutable Sources** (`knowledge/wiki/sources/`). Curated source documents and local HTML-to-Markdown scrapes.
- **Layer 2: Living Synthesis** (`knowledge/wiki/entities/` and `concepts/`). Markdown files, summaries, and concept maps.
- **Layer 3: Operational Schema** (This `CLAUDE.md` and the Vault's `.memory/instructions.md`).

### Shared Skill Arsenal (Pointer Pattern):
Local `.agents/skills/` and global `.gemini/config/plugins/` now contain **Lightweight Pointers**. 
- Agents **MUST** read the pointer file first.
- Agents **MUST** follow the pointer to the Vault path to retrieve full canonical instructions before execution.
- Exception: `/playwright-cli` remains local for high-performance scraping.

---

## 2. Master Orchestrator (Sniper Pipeline)

The autonomous pipeline is offline-first and zero-SaaS dependent.

- **Extraction**: Uses `playwright-cli` to capture headless HTML and `obformat` (`obsidian-format.js`) to convert it to GFM Markdown locally. Firecrawl is deprecated.
- **Generation**: Invokes GitHub Copilot CLI (`gh copilot`) as the adversarial critic and code generator.
- **Verification**: Playwright runs against `localhost:3000` to capture snapshots and verify brand-guard compliance via `npm run guard`.

---

## 3. Obsidian Integration & Personas
- **Daily Logging**: Every session MUST be initialized via `obdaily init` and logged via `obdaily log`.
- **Live Diagnostics**: Use `obdiag` for screenshots and Dataview queries.
- **Shared Personas**: All agents (Batman, Robin, AG) share the same memory bank in the Vault. Never duplicate knowledge locally.

