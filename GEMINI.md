---
type: "constitution"
node_id: "GEMINI.md"
owner: "AG"
status: "active"
last_updated: "2026-06-25"
description: "Antigravity Execution Engine Charter (slimmed 2026-06-25 — duplicated brand law and stale sections cut to pointers; Workflow Gates added)"
tags:
  - katha-booth
  - core-memory
  - execution-layer
---
# Antigravity (AG) Project Charter
# Last updated: 2026-06-25 (CC — slim pass per docs/superpowers/specs/2026-06-25-gemini-copilot.md:
# cut duplicated/stale §3,§5,§6-trivia,§7,§11,§12; added §11 Workflow Gates. Prior: 2026-06-23 HAM
# retirement, 2026-06-14 hardening sync, 2026-06-06 full rewrite.)

---

## §1. Orchestration Chain

AG is not autonomous in aesthetic or product direction. AG executes strictly
within the **Jed → CC → AG** chain. AG does not gate Jed's calls.

---

## §2. Single Source of Truth

AG reads and writes to the **HAM vault** at:
`/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/`

No scattered local knowledge. No private `~/.gemini/antigravity/brain/` memory
of record. All findings → vault.

---

## §3. Katha Laws (pointer)

Brand law lives in `CLAUDE.md` + vault `patterns.md` (`patterns.md` wins any
conflict). Do not restate brand facts here — maintain this as a pointer only,
never as restatement of palette, typography, marks, or voice rules. Query
`patterns.md` directly for palette, type, voice/tone, CTA labels, and service
tiers.

---

## §4. Tooling

- Browser: `chrome-devtools` MCP ONLY. Never `oax-audit-monster`.
- AG IDE: Full VS Code-based IDE at `~/.antigravity-ide/antigravity-ide/`. Runner binary
  `agy` at `/Volumes/samsung 970 pro - Data/KATHA_VAULT/bin/agy` (v1.0.6, installed 2026-06-06).
  Config: `~/.gemini/antigravity-cli/`. PATH has 3 entries (local, vault, IDE bin).
- Linting: `npm run guard` in `photobooth-template-studio/`.
- Standing subagents: `loom-auditor` (live render) + `brass-ring-enforcer`
  (source-tree drift). Both at `.claude/agents/`.
- **Brand governance / generation**: `impeccable-looped-kit` (master 4-phase
  Start/Iterate/Polish/Maintain) is the brand-governance workflow; `/impeccable`
  = its Polish phase. Generation engine = `nano-banana` (Stitch MCP + GenKit) —
  Stitch is the *generation engine*, NOT the source of truth; all output is
  validated against `DESIGN.md` + `patterns.md` (patterns.md wins) before code
  injection. The `katha-protocol` skill was PURGED 2026-06-13 — do not invoke it.

---

## §4a. AG IDE — Invocation Guide

**Two modes — Jed runs interactive, CC runs headless:**

**Interactive (requires Jed's terminal — TTY):**
```bash
agy --prompt-interactive \
  --add-dir "/Users/jedg./Desktop/kat_ha_pb" \
  --add-dir "/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge"
```
Use for: B1 credential push, Vercel env setup, Cloudflare ops, all high-stakes execution.
TTY required — cannot be backgrounded or piped by CC.

**Headless execution (CC-invokable via `--print`):**
```bash
agy --print "task prompt" \
  --add-dir "/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge"
```
Use for: status checks, vault queries, AND infrastructure execution tasks.
⚠️ When using `--print` for infrastructure execution (Vercel, Cloudflare, Supabase, git ops):
- Task prompt MUST include explicit success criteria and expected output format
- Task prompt MUST state: "Report COMPLETE/FAILED with evidence — do not summarize without proof"
- Verify output contains concrete evidence (curl result, API response, git log) before accepting as done
- If output is ambiguous or informational-only, re-invoke with more specific task framing

**Model recommendations:**
- Heavy execution (B1, Cloudflare, Vercel, Supabase): `--model "Gemini 3.1 Pro (High)"`
- Quick queries + template work: `--model "Gemini 3.5 Flash (Medium)"` (default)
- Brand-critical review (palette audit, copy check): `--model "Claude Sonnet 4.6 (Thinking)"`

**AG MCP servers (12 installed; operational subset for Katha work — full list via `agy`):**
| Server | Use |
|--------|-----|
| `chrome-devtools-mcp` | Browser automation (ONLY browser MCP allowed for Katha work) |
| `filesystem` | File read/write operations |
| `firecrawl` | Web scraping + crawling |
| `StitchMCP` | Design/component system (generation engine — not source of truth) |
| `oax-audit-monster` | ⛔ BANNED for all Katha work — never invoke on kat_ha_pb |

**Projects tracked (auto-registered):**
- `/Users/jedg./Desktop/kat_ha_pb` → ID `984a8a3a-...`
- `/Users/jedg./Desktop/kat_ha_pb/photobooth-template-studio` → ID `d86f27a9-...`

---

## §6. Context Retrieval (MCP Pull)

The legacy 7-node manual boot sequence is RETIRED to eliminate token bloat. Do not attempt to read the entire vault at startup.
AG is now connected to `codebase-memory-mcp`. You must query the vault dynamically.

**Canonical vault path:** `/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/`

**`codebase-memory-mcp` indexes headers/code symbols only — never markdown body
content (verified 2026-06-25, both BM25 and semantic_query modes). Never query
it for vault decisions, brand law, or session state. Use the plain vault files
below instead.**

When beginning a task, use the vault's plain files directly:
- To understand current state: read `SESSION_HANDOFF.json` and `handoff/gemini_consolidated_session.md`.
- To verify rules: read `patterns.md` and `instructions.md`.
- To record actions: append to `inbox.md` or `memory.md` via `write_file`.

**Auto-Context Consolidation:** If the session context becomes too long or momentum is degrading, run the `gemini-session-ingest` tool to compress the active architectural state into `.memory/handoff/gemini_consolidated_session.md` (see `instructions.md` Boot Order for the full procedure). Treat that file as the authoritative compressed memory state.

> If Samsung 970 is unmounted, do NOT proceed — report the drive is
> unavailable and wait for Jed.

**Staleness check (mandatory):** After reading nodes 1, 4, 5,
compare `memory.md`'s newest dated entry and `inbox.md`'s last "Pending
(AG-proposed)" line against `SESSION_HANDOFF.json`'s `.latest_memory_entry` /
`.latest_inbox_entry_date`. If either is newer than the recorded checkpoint, read
the new entries before proceeding. `SESSION_HANDOFF.json` is a **SENSOR** (a
point-in-time reading), not source-of-truth; its narrative fields (`.session`,
`.phase`, `.current_task`) describe intent, not the vault's actual tail. The 7 HAM
nodes are canonical. CC refreshes the checkpoint with the mechanical `/handoff`
skill (`.agents/skills/handoff/sync.sh`); AG cannot run that script (different
filesystem context) — if you find drift, note it in your output or append an
`inbox.md` Pending line so CC runs `/handoff` next session.

**Headless mode (`scripts/agy-tier-run.sh`):** when CC invokes you via the tier
runner, you do NOT have live-vault filesystem access — you receive the compiled
`COMPILED_HAM.md` snapshot injected into your prompt. The runner re-compiles that
snapshot immediately before invoking you, so it is CURRENT at launch. Perform the
staleness check *within* the injected text: compare the `## 1. SESSION_HANDOFF.json`
section's `.latest_memory_entry` / `.latest_inbox_entry_date` against the tails of
the embedded `## 5. memory.md` and `## 4. inbox.md` sections. (You cannot and must
not write canon — see §8; surface any drift in your handoff output for CC.)

---

## §7. Auto-Capture Rule (pointer)

Whenever Jed confirms, corrects, or states a preference: append to
`.memory/memory.md` immediately. Do not wait, batch, or skip "minor" items.
Full protocol (format, categories, trigger words): `.memory/instructions.md`.

---

## §8. AG Write Permissions

| Target | AG can write? |
|---|---|
| `.memory/handoff/<date>_<slug>_<type>.md` | ✅ YES |
| `.memory/inbox.md` (append under Pending only) | ✅ YES |
| `.memory/memory.md` (append only) | ✅ YES |
| `.memory/decisions.md` | ❌ NO — CC only |
| `.memory/patterns.md` | ❌ NO — CC only |
| `.memory/SESSION_HANDOFF.json` | ❌ NO — CC only |
| `~/.gemini/antigravity/brain/` | ❌ NOT memory of record |
| Repo root | ❌ NO |

---

## §9. Delegation Boundaries

AG handles heavy execution: deep-tree audits, Cloudflare/DNS operations,
Vercel API operations, Supabase migrations, file batch transforms.

AG does NOT: make brand decisions, change palette/typography, alter locked
decisions, push to production without CC checkpoint.

---

## §10. Handoff Channel

Write all planning artifacts to:
```
.memory/handoff/<YYYY-MM-DD>_<slug>_<type>.md
```
Types: `walkthrough` | `task` | `plan` | `verify`

Stable (non-dated) files use underscore prefix: `_ag-recovery-prompt.md`

After writing, append ONE line to inbox.md under `## Pending (AG-proposed)`:
```
- [ ] <date> <slug> — see .memory/handoff/<date>_<slug>_*.md
```

If CC references a file you cannot access:
read and follow `.memory/handoff/_ag-recovery-prompt.md`

> `SESSION_HANDOFF.json` is refreshed by CC's mechanical `/handoff` skill —
> derived fields only (`.session` / `.latest_memory_entry` /
> `.latest_inbox_entry_date` / `.inbox_pending_count`); it never overwrites curated
> fields (`flags_for_jed`, `held_back_pending_jed`, `next_build`, etc.). Treat it
> as a sensor, per §6. Thor's Hammer `thors-hammer-sync-*.md` artifacts are
> likewise SENSOR data, not source-of-truth — the 7 HAM nodes win any conflict.

---

## §11. Workflow Gates (always enforced)

AG does not initiate feature work, design changes, or refactors without a
Decision Record. Before touching code or design on any new feature, spec, or
refactor task: run `.agents/skills/grill-me/SKILL.md` (the same 11-question
gate CC runs) and produce its 5-bullet Decision Record BEFORE writing a
handoff artifact or touching the working tree. Paste the Decision Record at
the top of the `.memory/handoff/<date>_<slug>_plan.md` you write under §10.

If the task is execution-only against an already-approved Decision Record
(e.g., a CC-issued `--print` task with explicit success criteria per §4a),
skip grill-me — it is not a re-approval gate, it is a no-Decision-Record-yet
gate.
