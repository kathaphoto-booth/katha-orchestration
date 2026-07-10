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

## 2b. The Council (rebuilt 2026-07-10 — CC chairs both forms)
Two council mechanisms share the same voices; both relay verdicts to vault `council/verdicts/` + `wiki/log.md` (only the chair writes to the vault).

- **Blob critique (repo)**: `bash .agents/skill-tiers/scripts/council.sh <run_id> <blob>` — read-only critics on a CC-authored blob.
- **Deliberation (plugin)**: `/council`, `/council-verify-deps`, `/council-media` via the customized `llm-council-plugin` (source of truth: `scratch/repos/llm-council-plugin/`). 3-phase protocol + Phase 0 prompt restructuring (Fable brief) + Phase 4 vault relay.

**The seats (env pinning in the plugin's `council_env.sh`):**
- **claude** — chairman + heavy lifter. CAVEAT: headless `claude -p` is bound to an empty-credit Console key until `claude /login` re-binds it to the subscription; the chair role is unaffected (the orchestrating session chairs).
- **codex** — debugger; `codex exec --oss -m qwen2.5-coder:7b` (local Ollama, zero-cost, auto-started).
- **google cascade** — code check; first healthy of: `agy` (Gemini 3.5, AI Pro; auto-skipped 30 min after failure — expired Antigravity login needs one interactive `agy` browser login) → `copilot` BYOK → local Vertex proxy `:8788` (Qwen3-coder-480B MaaS on Cloud credits; proxy is a launchd service `com.katha.vertex-proxy`, always on) → `gemini` CLI if installed.

**Doctor**: `/council-verify-deps` (or `bash scratch/repos/llm-council-plugin/scripts/verify-dependencies.sh`) checks and self-heals every layer. Media gen (nano banana / Veo 3 on Cloud credits): `/council-media` → `scripts/media-gen.sh`.

---

## 3. Obsidian Integration & Personas
- **Daily Logging**: Every session MUST be initialized via `obdaily init` and logged via `obdaily log`.
- **Live Diagnostics**: Use `obdiag` for screenshots and Dataview queries.
- **Shared Personas**: All agents (Batman, Robin, AG) share the same memory bank in the Vault. Never duplicate knowledge locally.
- **Scheduled hygiene**: codex (zero-token, local) runs the nightly wiki-lint audit; findings land in `wiki/log.md` and `.memory/inbox.md`.
