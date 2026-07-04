# Katha Booth Unified Governance & Operational Schema
# Last updated: 2026-07-04 (Vault Rebuild — strict Karpathy LLM Wiki, single vault)

---

## 1. The LLM Wiki & Vault Architecture
One persistent, compounding LLM Wiki vault, managed via **Obsidian**, resident on the Samsung 970 SSD. **Single vault — no duplicates, no mirrors.** The vault's own schema file is the law inside it.

### Canonical Paths:
- **Vault Root**: `/Volumes/samsung 970 pro - Data/KATHA_VAULT/`
- **Obsidian Vault (the wiki)**: `/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/`
- **Vault Schema (read FIRST, every session)**: `knowledge/CLAUDE.md` (CC) / `knowledge/AGENTS.md` (codex, agy, copilot) — identical content
- **Memory Lane**: `knowledge/.memory/` (memory.md, decisions.md, patterns.md, inbox.md, instructions.md, handoff/)
- **Council Lane**: `knowledge/council/` (intake/ + verdicts/)
- **Shared Skills**: `knowledge/.memory/skills/`

### The Layers (strict Karpathy):
- **Layer 1 — Immutable Sources** (`knowledge/raw/` + `raw/assets/`). Agents READ ONLY, never write.
- **Layer 2 — LLM-owned Wiki** (`knowledge/wiki/{index.md, log.md, entities/, concepts/, sources/, comparisons/, synthesis/}`). Every page carries `title/category/summary/updated` frontmatter. Every ingest updates index + log.
- **Layer 3 — Operational Schema** (this file + the vault's `CLAUDE.md`/`AGENTS.md` + `.memory/instructions.md`).

### Naming Law (vault Iron Rule 8):
Legacy system names are **BANNED in all new files, headings, frontmatter, and scripts**: `HAM`, `COMPILED_HAM`, `thors-hammer`, `HERMES`. The memory frontmatter type is `memory-node`; the compiled artifact is `COMPILED_MEMORY.md` (built by `bin/compile-memory.sh`). Historical mentions inside dated `.memory/memory.md` entries and `_archive*` folders remain as struck history.

### Shared Skill Arsenal (Pointer Pattern):
Local `.agents/skills/` and global `.gemini/config/plugins/` contain **Lightweight Pointers**.
- Agents **MUST** read the pointer file first.
- Agents **MUST** follow the pointer to the Vault path to retrieve full canonical instructions before execution.
- Exception: `/playwright-cli` remains local for high-performance scraping.

---

## 2. Master Orchestrator (Sniper Pipeline)

The autonomous pipeline is offline-first and zero-SaaS dependent.

- **Extraction**: Uses `playwright-cli` to capture headless HTML and `obformat` (`obsidian-format.js`) to convert it to GFM Markdown locally. Firecrawl is deprecated.
- **Generation**: Invokes the standalone Copilot CLI (`copilot`, BYOK → local GLM-5 proxy) as adversarial critic and code generator.
- **Verification**: Playwright runs against `localhost:3000` to capture snapshots and verify brand-guard compliance via `npm run guard`.

## 2b. The Council (one voice, three critics — CC chairs)
- `bash .agents/skill-tiers/scripts/council.sh <run_id> <blob>` collects **codex** (Ollama `qwen2.5-coder:7b`, free/local), **agy** (Antigravity, `Gemini 3.5 Flash (Low)`), and **copilot** (BYOK → GLM-5 via `scratch/copilot-glm5/vertex-proxy.mjs`, needs the proxy running).
- The reviewed blob is copied to vault `council/intake/`; CC synthesizes the three critiques into `council/verdicts/<run_id>.md` and logs a `council` entry in `wiki/log.md`. Voices never write to the vault; only the chair does.

---

## 3. Obsidian Integration & Personas
- **Daily Logging**: Every session MUST be initialized via `obdaily init` and logged via `obdaily log`.
- **Live Diagnostics**: Use `obdiag` for screenshots and Dataview queries.
- **Shared Personas**: All agents (Batman, Robin, AG) share the same memory bank in the Vault. Never duplicate knowledge locally.
- **Scheduled hygiene**: codex (zero-token, local) runs the nightly wiki-lint audit; findings land in `wiki/log.md` and `.memory/inbox.md`.
