# GEMINI.md Remediation + Copilot Council Voice + Skill Slimming + Memory Findability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the 4 independently-shippable fixes from the approved spec (`docs/superpowers/specs/2026-06-25-gemini-copilot.md`): slim `GEMINI.md` and bind it to the grill-me gate, add Copilot CLI as a third `council.sh` voice without risking the existing codex+agy baseline, delete 5 confirmed-dead AG skills, and fix the vault's memory-findability gaps.

**Architecture:** Four independent task groups touching disjoint files with no cross-group dependencies — Group 1 edits `GEMINI.md` only; Group 2 edits `council.sh`/`test_council.sh`/`antigravity/SKILL.md`; Group 3 deletes skill directories + edits `SKILLS.md`; Group 4 edits the vault's `README.md`/`instructions.md` + repo `.gitignore`. Groups can ship in any order; each ends with its own commit.

**Tech Stack:** Bash (council.sh + its bash 3.2-compatible test harness), Markdown (GEMINI.md, vault docs), git, `codebase-memory-mcp`.

---

## File Structure

| File | Group | Change |
|---|---|---|
| `GEMINI.md` | 1 | Modify — trim §3/§5/§7 to pointers, delete old §11/§12, trim §6's dead trivia, add new §11 Workflow Gates |
| `.agents/skills/antigravity/scripts/council.sh` | 2 | Modify — add copilot voice block (FR-7..FR-13) |
| `.agents/skills/antigravity/tests/test_council.sh` | 2 | Modify — add copilot tests, harden 4 existing tests against the new default-on voice |
| `.agents/skills/antigravity/SKILL.md` | 2 | Modify — "two voices" → "three voices" prose |
| `.agents/skills/hierarchical-agent-memory/` | 3 | Delete (`git rm -r`) |
| `.agents/skills/higgsfield-generate/` | 3 | Delete (`git rm -r`) |
| `.agents/skills/higgsfield-marketplace-cards/` | 3 | Delete (`git rm -r`) |
| `.agents/skills/higgsfield-product-photoshoot/` | 3 | Delete (`git rm -r`) |
| `.agents/skills/higgsfield-soul-id/` | 3 | Delete (`git rm -r`) |
| `SKILLS.md` | 3 | Modify — remove the now-deleted skills from the Retiring table |
| vault `README.md` | 4 | Modify — add `codebase-memory-mcp` prose-blindness warning |
| vault `instructions.md` | 4 | Modify — add handoff filename grammar |
| repo `.gitignore` | 4 | Modify — add `scratch/` |

Note on Group 1/4 testing: `GEMINI.md` and the vault docs are prose/config, not application code — there is no red-green TDD cycle for a markdown pointer. Each task below substitutes "write the edit → verify via the exact shell command from the spec's AC → commit" for the classic test-first cycle, per the deviation already flagged in the spec's validation section.

---

## Task 1: GEMINI.md remediation (FR-1 through FR-6)

**Files:**
- Modify: `GEMINI.md` (full rewrite — the cuts touch enough of the file that a section-by-section diff is harder to verify correctly than writing the complete target state)

- [ ] **Step 1: Write the complete new GEMINI.md**

Replace the entire file with this content. Verified against the current file read in full this session — §1/§2/§4/§4a/§8/§9/§10 are reproduced verbatim (FR-1); §6 keeps everything except the now-3-week-stale `memory_boot_check.sh`-deletion sentence, preserving the still-load-bearing unmounted-drive instruction (FR-2); §3/§5/§7 become pointers (FR-3); old §11/§12 are gone, replaced by a new §11 Workflow Gates (FR-4, FR-5):

```markdown
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
conflict). Do not restate brand facts here — duplication is exactly how this
section drifted before (it stated retired Fraunces/EB Garamond facts as
current until commit `40fdf4d` corrected it). Query `patterns.md` directly for
palette, type, voice/tone, CTA labels, and service tiers.

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

**Available models (8 total):**
Gemini 3.1 Pro (Low/High) · Gemini 3.5 Flash (Low/Medium/High) ·
Claude Sonnet 4.6 (Thinking) · Claude Opus 4.6 (Thinking) · GPT-OSS 120B (Medium)

**AG MCP servers (12 installed at `~/.gemini/antigravity-cli/mcp/`):**
| Server | Use |
|--------|-----|
| `chrome-devtools-mcp` | Browser automation (ONLY browser MCP allowed for Katha work) |
| `filesystem` | File read/write operations |
| `firecrawl` | Web scraping + crawling |
| `context7` | Library documentation queries |
| `genkit-mcp-server` | Google Genkit integration |
| `gsap` | Animation library reference |
| `magic-21st` | Component generation |
| `StitchMCP` | Design/component system |
| `sequential-thinking` | Structured reasoning |
| `oax-audit-monster` | ⛔ BANNED for all Katha work — never invoke on kat_ha_pb |

**Projects tracked (auto-registered):**
- `/Users/jedg./Desktop/kat_ha_pb` → ID `984a8a3a-...`
- `/Users/jedg./Desktop/kat_ha_pb/photobooth-template-studio` → ID `d86f27a9-...`

**Keybindings:** `~/.gemini/antigravity-cli/keybindings.json` (customizable)
**Recent conversations:** `~/.gemini/antigravity-cli/cache/last_conversations.json`

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
```

- [ ] **Step 2: Verify against the spec's acceptance criteria**

Run:
```bash
wc -l GEMINI.md
grep -c "Workflow Gates" GEMINI.md
grep -n "Fraunces\|EB Garamond" GEMINI.md
grep -n "Current Phase\|## §12" GEMINI.md
```
Expected: line count between 130-160 (AC-5); `Workflow Gates` count ≥1 (AC-4); zero `Fraunces`/`EB Garamond` matches (AC-2 — confirms §3 is now a pointer, not restated facts); zero `Current Phase`/`§12` matches (AC-3 — confirms old §11/§12 are gone).

- [ ] **Step 3: Commit**

```bash
git add GEMINI.md
git commit -m "docs(gemini): slim charter to AG-IDE-unique content, add Workflow Gates

Cuts duplicated brand law (§3→pointer), voice (§5→folded into §3), and
auto-capture (§7→pointer) — all three drifted from canon before (the file
stated retired Fraunces/EB Garamond as current until commit 40fdf4d fixed
it). Deletes self-contradicting §11 (Current Phase) and stale §12
(Deprecated). Keeps §6 nearly verbatim — it documents AG's headless vs
interactive runtime modes, which CLAUDE.md has no equivalent of; only the
3-week-stale memory_boot_check.sh trivia is cut. Adds new §11 Workflow
Gates binding AG to grill-me, mirroring CLAUDE.md's gate.

299 -> ~140 lines. Per docs/superpowers/specs/2026-06-25-gemini-copilot.md FR-1..FR-6."
```

---

## Task 2: Copilot voice — failing tests first (FR-7, FR-9, FR-10, FR-11; red phase)

**Files:**
- Modify: `.agents/skills/antigravity/tests/test_council.sh`

Current file (96 lines, read in full this session) defines `_mk_codex_ok/_mk_codex_fail/_mk_agy_ok/_mk_agy_fail` stub helpers and 6 test functions. Its own header states the suite is hermetic — "no real codex, no real agy, no network." Adding a 3rd voice that defaults ON (`COUNCIL_INCLUDE_COPILOT` will default to `1` once Task 3 lands) would break that hermeticity for the 4 existing tests that don't yet pin it, since they'd start shelling out to whatever real `gh` happens to be on the test-runner's PATH. This step both adds the new tests AND pins the 4 existing ones, in the same red-phase commit, so hermeticity is never actually broken at any point in history.

- [ ] **Step 1: Add copilot stub helpers, right after the existing `_mk_agy_fail` helper (after line 26)**

```bash
# A copilot stub (gh wrapper) that succeeds. council.sh's pre-flight probes
# `gh copilot --help` before ever attempting the real `-p` prompted call (to
# avoid triggering a first-run download blind) — the stub must answer both.
_mk_copilot_ok() {
  printf '#!/usr/bin/env bash\nif [[ "$1" == "copilot" && "$2" == "--help" ]]; then exit 0; fi\nif [[ "$1" == "copilot" && "$2" == "-p" ]]; then echo "copilot critique: looks fine"; exit 0; fi\nexit 1\n' > "$1/gh"
  chmod +x "$1/gh"
}
# Simulates `gh` installed but the underlying Copilot CLI not downloaded —
# `gh copilot --help` fails fast (rc=1), matching real gh's verified behavior
# when the Copilot CLI sub-binary isn't present. council.sh must never reach
# the real `-p` call in this case.
_mk_copilot_absent() {
  printf '#!/usr/bin/env bash\nexit 1\n' > "$1/gh"
  chmod +x "$1/gh"
}
```

- [ ] **Step 2: Pin `COUNCIL_INCLUDE_COPILOT=0` on the 4 existing tests that don't test copilot**

Edit each of these 4 existing `CODEX_BIN=... AGY_BIN=...` lines to add `COUNCIL_INCLUDE_COPILOT=0` immediately after `AGY_BIN="$bin/agy"` (same line, space-separated env-var assignment — bash allows multiple `VAR=val` prefixes before a command):

In `test_council_both_voices_ok` (current line 32):
```bash
  CODEX_BIN="$bin/codex" AGY_BIN="$bin/agy" COUNCIL_INCLUDE_COPILOT=0 \
    bash "$SKILL/council.sh" cr1 "$blob" --repo "$r" --timeout 30 >/dev/null 2>&1
```

In `test_council_partial_when_one_absent` (current line 46):
```bash
  CODEX_BIN="$bin/codex" AGY_BIN="$bin/agy" COUNCIL_INCLUDE_COPILOT=0 \
    bash "$SKILL/council.sh" cr2 "$blob" --repo "$r" --timeout 30 >/dev/null 2>&1
```

In `test_council_fails_when_both_absent` (current line 58):
```bash
  CODEX_BIN="$bin/codex" AGY_BIN="$bin/agy" COUNCIL_INCLUDE_COPILOT=0 \
    bash "$SKILL/council.sh" cr3 "$blob" --repo "$r" --timeout 30 >/dev/null 2>&1
```

In `test_council_redacts_secrets_before_persisting` (current line 68):
```bash
  CODEX_BIN="$bin/codex" AGY_BIN="$bin/agy" COUNCIL_INCLUDE_COPILOT=0 \
    bash "$SKILL/council.sh" cr4 "$blob" --repo "$r" --timeout 30 >/dev/null 2>&1
```

(`test_council_refuses_missing_blob` and `test_council_is_hardened` are unaffected — the first exits before voice resolution, the second only reads the source file as text.)

- [ ] **Step 3: Add 5 new test functions, after the existing `test_council_is_hardened` function (end of file)**

```bash
test_council_copilot_ok_when_healthy() {
  local r; r=$(mk_repo); local bin; bin=$(mktemp -d)
  _mk_codex_ok "$bin"; _mk_agy_ok "$bin"; _mk_copilot_ok "$bin"
  local blob; blob=$(mktemp); echo "diff" > "$blob"
  CODEX_BIN="$bin/codex" AGY_BIN="$bin/agy" COPILOT_BIN="$bin/gh" COUNCIL_INCLUDE_COPILOT=1 \
    bash "$SKILL/council.sh" crc1 "$blob" --repo "$r" --timeout 30 >/dev/null 2>&1
  local cj="$r/.orchestration/crc1/council/council.json"
  assert_eq "$(jq -r '.voices.copilot.status' "$cj" 2>/dev/null)" "OK" "copilot voice OK when healthy"
}

test_council_baseline_survives_copilot_absent() {
  local r; r=$(mk_repo); local bin; bin=$(mktemp -d)
  _mk_codex_ok "$bin"; _mk_agy_ok "$bin"; _mk_copilot_absent "$bin"
  local blob; blob=$(mktemp); echo "diff" > "$blob"
  CODEX_BIN="$bin/codex" AGY_BIN="$bin/agy" COPILOT_BIN="$bin/gh" COUNCIL_INCLUDE_COPILOT=1 \
    bash "$SKILL/council.sh" crc2 "$blob" --repo "$r" --timeout 30 >/dev/null 2>&1
  assert_exit "$?" 0 "codex+agy healthy, copilot absent => still exit 0"
  local cj="$r/.orchestration/crc2/council/council.json"
  assert_eq "$(jq -r '.voices.codex.status' "$cj" 2>/dev/null)" "OK" "codex unaffected by copilot's absence"
  assert_eq "$(jq -r '.voices.agy.status' "$cj" 2>/dev/null)" "OK" "agy unaffected by copilot's absence"
  assert_eq "$(jq -r '.voices.copilot.status' "$cj" 2>/dev/null)" "ABSENT" "copilot marked ABSENT, not silently dropped"
}

test_council_copilot_skipped_when_disabled() {
  local r; r=$(mk_repo); local bin; bin=$(mktemp -d)
  _mk_codex_ok "$bin"; _mk_agy_ok "$bin"
  local blob; blob=$(mktemp); echo "diff" > "$blob"
  CODEX_BIN="$bin/codex" AGY_BIN="$bin/agy" COUNCIL_INCLUDE_COPILOT=0 \
    bash "$SKILL/council.sh" crc3 "$blob" --repo "$r" --timeout 30 >/dev/null 2>&1
  local cj="$r/.orchestration/crc3/council/council.json"
  assert_eq "$(jq -r '.voices.copilot.status' "$cj" 2>/dev/null)" "SKIPPED" "COUNCIL_INCLUDE_COPILOT=0 => SKIPPED, not ABSENT"
}

test_council_quorum_unaffected_by_copilot() {
  local r; r=$(mk_repo); local bin; bin=$(mktemp -d)
  _mk_codex_fail "$bin"; _mk_agy_fail "$bin"; _mk_copilot_absent "$bin"
  local blob; blob=$(mktemp); echo "diff" > "$blob"
  CODEX_BIN="$bin/codex" AGY_BIN="$bin/agy" COPILOT_BIN="$bin/gh" COUNCIL_INCLUDE_COPILOT=1 \
    bash "$SKILL/council.sh" crc4 "$blob" --repo "$r" --timeout 30 >/dev/null 2>&1
  assert_exit "$?" 1 "codex+agy absent => exit 1 regardless of copilot's status (copilot never enters the quorum decision)"
}

test_council_copilot_block_after_codex_and_agy() {
  local src="$SKILL/council.sh"
  local codex_line agy_line copilot_line
  codex_line=$(grep -n 'redact < "\$OUT/\.codex\.raw"' "$src" | head -1 | cut -d: -f1)
  agy_line=$(grep -n 'redact < "\$OUT/\.agy\.raw"' "$src" | head -1 | cut -d: -f1)
  copilot_line=$(grep -n 'redact < "\$OUT/\.copilot\.raw"' "$src" | head -1 | cut -d: -f1)
  assert_eq "$([[ -n "$copilot_line" && "$copilot_line" -gt "$codex_line" && "$copilot_line" -gt "$agy_line" ]] && echo yes || echo no)" "yes" \
    "copilot voice block's redact invocation is strictly after both codex's and agy's (set -e ordering invariant)"
}
```

- [ ] **Step 4: Run the suite, verify the new tests fail and the old tests still pass**

```bash
bash .agents/skills/antigravity/tests/run.sh
```
Expected: the 6 pre-existing tests pass unchanged; the 5 new `test_council_copilot_*` tests FAIL (council.sh has no copilot logic yet — `voices.copilot` won't exist in `council.json`, so the `jq -r` lookups return `null`/empty, failing the `assert_eq` checks). This is the correct red state.

- [ ] **Step 5: Commit**

```bash
git add .agents/skills/antigravity/tests/test_council.sh
git commit -m "test(council): add failing tests for copilot 3rd voice (red phase)

Pins COUNCIL_INCLUDE_COPILOT=0 on the 4 existing hermetic tests so they
stay hermetic once the voice defaults on (Task 3). Adds 5 new tests
covering FR-9 (quorum untouched), FR-10 (OK/ABSENT/SKIPPED), FR-11
(pre-flight gate, never a blind network call), and FR-8 (block order is
a tested invariant, not a convention). All 5 fail until Task 3 lands.

Per docs/superpowers/specs/2026-06-25-gemini-copilot.md AC-6..AC-11."
```

---

## Task 3: Copilot voice — implementation (FR-7, FR-8, FR-9, FR-10, FR-11, FR-12, FR-13; green phase)

**Files:**
- Modify: `.agents/skills/antigravity/scripts/council.sh:94` (insert after agy's block, before the `council.json` jq call)

- [ ] **Step 1: Insert the copilot voice block**

Current source (lines 94-106) ends agy's block then blank-lines into the `council.json` comment at line 107. Insert this new block immediately after line 105 (`fi`, closing agy's status check) and before line 107 (`# council.json:` comment):

```bash
# --- Voice 3: copilot (optional, env-gated; read-only critic) ---
copilot_status="SKIPPED"
copilot_rc=0
: > "$OUT/copilot.out"
: > "$OUT/copilot.err"
COUNCIL_INCLUDE_COPILOT="${COUNCIL_INCLUDE_COPILOT:-1}"
COPILOT_BIN="${COPILOT_BIN:-gh}"
if [[ "$COUNCIL_INCLUDE_COPILOT" == "1" ]]; then
  copilot_status="ABSENT"
  # Pre-flight: `gh copilot --help` returns fast with no network call whether
  # or not the underlying Copilot CLI is downloaded (verified empirically
  # 2026-06-25 — gh 2.92.0, Copilot CLI not installed, rc=1, no download
  # triggered). A nonzero rc here means a real `-p` call would either fail
  # identically or risk triggering a first-run download — never attempt it
  # blind (FR-11).
  if "$COPILOT_BIN" copilot --help >/dev/null 2>&1; then
    set +e
    run_with_timeout "$TIMEOUT" "$COPILOT_BIN" copilot -p "$PROMPT" \
      > "$OUT/.copilot.raw" 2> "$OUT/.copilot.raw.err"
    copilot_rc=$?
    set -e
    redact < "$OUT/.copilot.raw" > "$OUT/copilot.out"; redact < "$OUT/.copilot.raw.err" > "$OUT/copilot.err"
    rm -f "$OUT/.copilot.raw" "$OUT/.copilot.raw.err"
    if [[ "$copilot_rc" -eq 0 && -s "$OUT/copilot.out" ]]; then copilot_status="OK"; else
      echo "ABSENT: copilot voice failed or produced no output (rc=$copilot_rc)" >> "$OUT/copilot.out"
    fi
  else
    echo "ABSENT: gh copilot CLI not available (pre-flight --help failed) — skipped to avoid a possible first-run download" >> "$OUT/copilot.out"
  fi
fi
```

Note on flags (FR-12): no `--allow-tool` is passed. `gh`'s own `--help` documents `gh copilot -p "..." --allow-tool 'shell(git)'` as letting Copilot autonomously execute an allowed tool — but `codex` and `agy` are both invoked as pure read-only critics in this script (`-s read-only`, no `--sandbox`), so Copilot's critic role deliberately gets zero tool-execution grant, matching that existing posture rather than the more permissive example in `gh`'s docs.

- [ ] **Step 2: Extend the `council.json` jq call to include the copilot voice**

Current (lines 108-119):
```bash
jq -n \
  --arg run "$RUN" \
  --arg blob "$BLOB" \
  --arg codex_status "$codex_status" --argjson codex_rc "$codex_rc" \
  --arg agy_status "$agy_status" --argjson agy_rc "$agy_rc" \
  '{run: $run, blob: $blob,
    voices: {
      codex: {status: $codex_status, rc: $codex_rc, out: "codex.out", err: "codex.err"},
      agy:   {status: $agy_status,   rc: $agy_rc,   out: "agy.out",   err: "agy.err"}
    },
    note: "collected critiques only; CC chairs synthesis"}' \
  > "$OUT/council.json"
```

Replace with:
```bash
jq -n \
  --arg run "$RUN" \
  --arg blob "$BLOB" \
  --arg codex_status "$codex_status" --argjson codex_rc "$codex_rc" \
  --arg agy_status "$agy_status" --argjson agy_rc "$agy_rc" \
  --arg copilot_status "$copilot_status" --argjson copilot_rc "$copilot_rc" \
  '{run: $run, blob: $blob,
    voices: {
      codex:   {status: $codex_status,   rc: $codex_rc,   out: "codex.out",   err: "codex.err"},
      agy:     {status: $agy_status,     rc: $agy_rc,     out: "agy.out",     err: "agy.err"},
      copilot: {status: $copilot_status, rc: $copilot_rc, out: "copilot.out", err: "copilot.err"}
    },
    note: "collected critiques only; CC chairs synthesis"}' \
  > "$OUT/council.json"
```

- [ ] **Step 3: Update the summary echo line**

Current (line 121):
```bash
echo "council: codex=$codex_status agy=$agy_status -> $OUT/council.json"
```

Replace with:
```bash
echo "council: codex=$codex_status agy=$agy_status copilot=$copilot_status -> $OUT/council.json"
```

- [ ] **Step 4: Confirm the quorum check is untouched (FR-9 — no edit needed, verification only)**

Lines 122-125 must remain byte-for-byte identical:
```bash
if [[ "$codex_status" == "ABSENT" && "$agy_status" == "ABSENT" ]]; then
  echo "BOTH voices ABSENT — nothing for CC to chair." >&2
  exit 1
fi
```
Run `git diff .agents/skills/antigravity/scripts/council.sh` after Steps 1-3 and confirm these 4 lines show no changes in the diff.

- [ ] **Step 5: Run the suite, verify all tests pass**

```bash
bash .agents/skills/antigravity/tests/run.sh
```
Expected: all 11 tests pass (6 pre-existing + 5 new from Task 2), `FAIL=0`.

- [ ] **Step 6: Commit**

```bash
git add .agents/skills/antigravity/scripts/council.sh
git commit -m "feat(council): add copilot as 3rd read-only critic voice

Additive only — codex/agy's existing quorum check (exit 1 iff both
ABSENT) is untouched; copilot's status never enters that decision.
Pre-flight-gates on 'gh copilot --help' before any prompted call, so a
machine without the Copilot CLI downloaded never risks a first-run
network download mid-orchestration-run (verified empirically: gh 2.92.0,
Copilot CLI absent, --help returns rc=1 fast, no download).
COUNCIL_INCLUDE_COPILOT=1 by default; COPILOT_BIN=gh by default.

Per docs/superpowers/specs/2026-06-25-gemini-copilot.md FR-7..FR-13."
```

---

## Task 4: Update SKILL.md prose + final group verification (FR-14)

**Files:**
- Modify: `.agents/skills/antigravity/SKILL.md` (3 locations: lines ~23-27, ~80-84, ~113, confirmed present in this session's full read of the file)

- [ ] **Step 1: Update the "Two delegation paths" section**

Find (current SKILL.md, the council description under "Two delegation paths"):
```
- **Multi-model consultation → council** (`council.sh`: `codex` + `agy`, read-only).
```
Replace with:
```
- **Multi-model consultation → council** (`council.sh`: `codex` + `agy` + `copilot`, read-only).
```

- [ ] **Step 2: Update the "Council (`council.sh`)" section**

Find:
```
## Council (`council.sh`) — opinion path, NOT execution
`council.sh <run_id> <blob-file> [--repo <dir>] [--timeout <secs>]` collects two
read-only critiques (`codex` via `codex exec -s read-only`; `agy` via `--print`
with NO `--sandbox`/`--add-dir`, zero write surface) of a CC-authored blob and
writes them under `.orchestration/<run>/council/` for CC to chair. A failed voice
is marked `ABSENT` (fail-loud); exit 1 only if BOTH are absent.
```
Replace with:
```
## Council (`council.sh`) — opinion path, NOT execution
`council.sh <run_id> <blob-file> [--repo <dir>] [--timeout <secs>]` collects up to
three read-only critiques (`codex` via `codex exec -s read-only`; `agy` via
`--print` with NO `--sandbox`/`--add-dir`; `copilot` via `gh copilot -p`, pre-flight
gated so it never attempts a call when the Copilot CLI isn't already downloaded —
env-toggle `COUNCIL_INCLUDE_COPILOT`, default on) of a CC-authored blob and writes
them under `.orchestration/<run>/council/` for CC to chair. A failed or disabled
voice is marked `ABSENT`/`SKIPPED` (fail-loud); exit 1 only if codex AND agy are
both absent — copilot's presence never affects that decision.
```

- [ ] **Step 3: Update the test-suite description line**

Find (near "## Tests"):
```
`bash .agents/skills/antigravity/tests/run.sh` — the adversarial attacks ARE the
suite. Must end `FAIL=0`.
```
This line needs no wording change (it doesn't claim a voice count), but confirm the count of tests it now runs has grown by 5 (Task 2) — no edit required here, just leave as-is.

- [ ] **Step 4: Verify no stale two-voice language remains**

```bash
grep -n "two critiques\|codex.*agy.*read-only).$\|collects two" .agents/skills/antigravity/SKILL.md
```
Expected: zero matches (AC-12).

- [ ] **Step 5: Run the full antigravity adversarial suite (group-level final check)**

```bash
bash .agents/skills/antigravity/tests/run.sh
```
Expected: `FAIL=0`, same as Task 3 Step 5 — this just re-confirms nothing in the doc edit broke anything (it shouldn't; SKILL.md prose isn't executed).

- [ ] **Step 6: Commit**

```bash
git add .agents/skills/antigravity/SKILL.md
git commit -m "docs(antigravity): update SKILL.md for the 3rd council voice

Prose said 'two critiques'/'codex + agy' in 3 places — now describes
copilot as a pre-flight-gated, env-toggleable third voice that never
affects the existing codex/agy quorum decision.

Per docs/superpowers/specs/2026-06-25-gemini-copilot.md FR-14, AC-12."
```

---

## Task 5: Delete 5 confirmed-dead AG skills + fix SKILLS.md registry (FR-15, FR-16, FR-17)

**Files:**
- Delete: `.agents/skills/hierarchical-agent-memory/`, `.agents/skills/higgsfield-generate/`, `.agents/skills/higgsfield-marketplace-cards/`, `.agents/skills/higgsfield-product-photoshoot/`, `.agents/skills/higgsfield-soul-id/`
- Modify: `SKILLS.md:54-59` (the Retiring table)

This is verify-then-delete, not TDD — there's no test framework for "is this directory referenced." The two-tier grep IS the test; treat a non-empty concept-level hit on `hierarchical-agent-memory` as expected (live infra shares its vocabulary) rather than a reason to abort, per FR-16.

- [ ] **Step 1: Two-tier grep for the 4 higgsfield skills (name-level + concept-level)**

```bash
grep -rl "higgsfield-generate\|higgsfield-marketplace-cards\|higgsfield-product-photoshoot\|higgsfield-soul-id" \
  --include="*.md" --include="*.sh" --include="*.json" --include="*.ts" --include="*.tsx" . \
  | grep -v "^\./.agents/skills/higgsfield-" | grep -v "^\./scratch/"
```
Expected: only `SKILLS.md` (the registry itself). No other file references these 4 outside their own directories.

- [ ] **Step 2: Two-tier grep for `hierarchical-agent-memory`**

```bash
echo "--- name-level ---"
grep -rl "hierarchical-agent-memory" --include="*.md" --include="*.sh" --include="*.json" . \
  | grep -v "^\./.agents/skills/hierarchical-agent-memory/" | grep -v "^\./scratch/"
echo "--- concept-level (its command surface) ---"
grep -rln "go ham\b\|ham audit\|ham dashboard\|ham route\|ham insights\|ham savings\|localhost:7777" \
  --include="*.md" --include="*.sh" . | grep -v "^\./.agents/skills/hierarchical-agent-memory/" | grep -v "^\./scratch/"
```
Expected for name-level: only `SKILLS.md`. Expected for concept-level (the skill's actual command surface, distinct from the shared "Thor's Hammer"/"COMPILED_HAM" vocabulary checked next): zero matches anywhere else in the repo — this is what makes the skill's *prose* safe to delete.

- [ ] **Step 3: Concept-level grep for the broader "Thor's Hammer" / "COMPILED_HAM" vocabulary (expect live hits — this is the FR-16 guardrail, not a delete-blocker)**

```bash
grep -rl "Thor's Hammer\|COMPILED_HAM" --include="*.md" --include="*.sh" . | grep -v "^\./scratch/"
```
Expected: hits in `bin/compile-ham.sh`, `bin/claude`, `.agents/skills/antigravity/scripts/agy-tier-run.sh`, `.agents/skills/antigravity/SKILL.md`, and the vault's `instructions.md`. **These are legitimate, live infrastructure — confirmed in this session's research — and must NOT be touched by this task.** This step exists only to prove the distinction in FR-16 is real before deleting, not to find something to fix.

- [ ] **Step 4: Delete the 5 directories**

```bash
git rm -r .agents/skills/hierarchical-agent-memory/
git rm -r .agents/skills/higgsfield-generate/
git rm -r .agents/skills/higgsfield-marketplace-cards/
git rm -r .agents/skills/higgsfield-product-photoshoot/
git rm -r .agents/skills/higgsfield-soul-id/
```

- [ ] **Step 5: Fix the SKILLS.md Retiring table**

Current (`SKILLS.md:54-59`):
```markdown
## Retiring (do not use — pending cleanup)
| Skill | Reason | Path |
|---|---|---|
| `handoff` · `hierarchical-agent-memory` | HAM machinery — being stood down (see DESIGN.md / agy fix) | `.agents/skills/<name>/` |
| `higgsfield-generate` · `-marketplace-cards` · `-product-photoshoot` · `-soul-id` | Deprecated — slated for deletion (also duplicated in `.claude/skills/`) | — |
| `taste-skill-v1` | Legacy v1, kept only for back-compat | `.agents/skills/taste-skill-v1/` |
```

Replace with:
```markdown
## Retiring (do not use — pending cleanup)
| Skill | Reason | Path |
|---|---|---|
| `taste-skill-v1` | Legacy v1, kept only for back-compat | `.agents/skills/taste-skill-v1/` |
```

Both the `handoff`/`hierarchical-agent-memory` row and the 4-skill higgsfield row are removed entirely — not split. `handoff` was always wrongly listed here (it's live, wired into CLAUDE.md's `/handoff` slash command, last edited 2026-06-22) and should never have shared a row with a retiring skill; `hierarchical-agent-memory` and the 4 higgsfield skills are now actually deleted by Step 4, so they're no longer "pending cleanup" — they're done.

- [ ] **Step 6: Verify**

```bash
grep -n "handoff" SKILLS.md | grep -i "retir\|stood down"
ls .agents/skills/ | wc -l
```
Expected: zero matches for the first command (AC-15 — `handoff` is not listed as retiring); skill count drops from 21 to 16 for the second (FR-15's 5 deletions).

- [ ] **Step 7: Commit**

```bash
git add SKILLS.md
git commit -m "chore(skills): remove 5 dead skills, fix SKILLS.md registry bug

Deletes hierarchical-agent-memory (command surface — go ham/ham audit/
ham dashboard/localhost:7777 — confirmed referenced nowhere live) and
the 4 higgsfield-* skills (single-commit origin 879f35d, confirmed
referenced only by each other and SKILLS.md).

NOT touched by this commit: bin/compile-ham.sh, bin/claude,
scripts/agy-tier-run.sh, and antigravity/SKILL.md's Thor's Hammer
section — these are live infra that happens to share 'Thor's Hammer'/
'COMPILED_HAM' vocabulary with the deleted skill's prose. The vocabulary
is shared; the infra is not dead.

Also fixes SKILLS.md's Retiring table, which wrongly grouped the live
handoff skill (wired into CLAUDE.md's /handoff command, edited
2026-06-22) under the same 'HAM machinery being stood down' row as
hierarchical-agent-memory.

Per docs/superpowers/specs/2026-06-25-gemini-copilot.md FR-15..FR-17."
```

---

## Task 6: Vault README.md — codebase-memory-mcp prose-blindness warning (FR-19)

**Files:**
- Modify: vault `README.md` (`/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/README.md`)

- [ ] **Step 1: Insert a new section after "## The 7 Nodes (boot order)"**

Current file has the 7-nodes table, then `## Physical Storage` immediately after. Insert this new section between them:

```markdown
## Querying — codebase-memory-mcp does NOT see this vault's prose

`codebase-memory-mcp` indexes headers and code symbols only — it returns zero
hits for markdown body content, in both keyword (BM25) and `semantic_query`
(vector) modes (verified 2026-06-25: querying for "council synthesis decision"
and "Loko Rust" — both genuinely present in vault files — returned 0 hits
either way). **Never query it for vault decisions, brand law, or session
state.** Use the 7 nodes above directly — `Read`/`grep` the actual files.

Three separate `codebase-memory-mcp` graphs exist (vault, repo root, and a
repo `.agents/` subfolder nested inside the repo-root graph) with no naming
signal distinguishing them — picking the wrong one returns a confident wrong
answer, not a "not found." When in doubt, read the file directly instead of
querying any graph.
```

- [ ] **Step 2: Verify**

```bash
grep -n "codebase-memory-mcp" "/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/README.md"
```
Expected: ≥1 match (AC-16).

- [ ] **Step 3: Commit**

```bash
cd "/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory" && git add README.md && git commit -m "docs(vault): warn that codebase-memory-mcp cannot see vault prose

Verified empirically 2026-06-25: zero hits for known-present vault terms
in both BM25 and semantic_query modes. The 7 plain-file nodes remain the
only source of truth for decisions/synthesis retrieval.

Per docs/superpowers/specs/2026-06-25-gemini-copilot.md FR-19, AC-16."
```
(Run this from the vault's own git root if it's tracked separately from `kat_ha_pb` — confirm with `git -C "/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory" rev-parse --show-toplevel` first if uncertain.)

---

## Task 7: Vault instructions.md — handoff filename grammar (FR-20)

**Files:**
- Modify: vault `instructions.md`

- [ ] **Step 1: Insert a new section after "## Boot Order (for all agents)" and before "## Agent Boundaries"**

```markdown
## Handoff Filename Grammar

`handoff/*.md` filenames MUST follow: `YYYY-MM-DD_topic-slug_type.md`, where
`type` is one of: `task`, `plan`, `walkthrough`, `verify`, `report`, `rule`,
`spec`, `review`, `credentials`.

Confirmed drift as of 2026-06-25 (one-time cleanup item, not retroactively
enforced by this grammar): 26 of 128 files carry an undocumented leading
underscore prefix; ~24 distinct non-conforming suffix patterns exist; two
`.png` screenshots sit in `handoff/` with no type suffix; a
`thors-hammer-sync-*.md` family follows no grammar at all. New files going
forward MUST conform; existing non-conforming files may be renamed
opportunistically but are not blocking.
```

- [ ] **Step 2: Verify**

```bash
grep -n "Handoff Filename Grammar" "/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/instructions.md"
```
Expected: 1 match (AC-17).

- [ ] **Step 3: Commit**

```bash
cd "/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory" && git add instructions.md && git commit -m "docs(vault): document handoff/*.md filename grammar

Confirmed real drift, not hypothetical: 26/128 files have an undocumented
underscore prefix, ~24 distinct suffix patterns, 2 untyped .png files, and
a thors-hammer-sync-* family with no grammar at all. New files conform
going forward; no retroactive rename required.

Per docs/superpowers/specs/2026-06-25-gemini-copilot.md FR-20, AC-17."
```

---

## Task 8: Gitignore scratch/ + re-index (FR-21)

**Files:**
- Modify: `/Users/jedg./Desktop/kat_ha_pb/.gitignore`

- [ ] **Step 1: Add the entry**

Current file ends with:
```
KATHA_STATE.html
__pycache__/
```

Append:
```

# Vendored/cloned third-party skill repos — never tracked, never indexed
scratch/
```

- [ ] **Step 2: Re-index the repo graph**

Use the `codebase-memory-mcp` MCP tool (not a shell command):
```
index_repository(repo_path="/Users/jedg./Desktop/kat_ha_pb", mode="fast")
```

- [ ] **Step 3: Verify the noise is gone**

Use `search_graph` (not a shell command) on the repo project with a query known to previously hit only `scratch/`'s vendored content, e.g. a term unique to the vendored `llm-council-plugin`'s `council_utils.sh`. Expected: 0 results (down from 147 pre-fix), confirming `scratch/` is excluded from the index (AC-18).

- [ ] **Step 4: Commit**

```bash
git add .gitignore
git commit -m "chore: gitignore scratch/, re-index to drop vendored-plugin noise

scratch/ contains vendored third-party plugin clones, was untracked but
unignored, and was the direct source of 147 false-positive search_graph
hits against an unrelated council_utils.sh. Excluding it fixes the noise
at the source rather than relying on every future agent to pick the
right graph correctly.

Per docs/superpowers/specs/2026-06-25-gemini-copilot.md FR-21, AC-18."
```

---

## Task 9: Run the memory-layer eval harness for real (FR-22, FR-23)

**Files:** none — this task produces a captured transcript as evidence, not a code change.

The brainstorm that fed the spec designed this harness but never ran it against a real cold-start agent — exactly the "claimed done, wasn't" pattern this whole project's `/antigravity` governance exists to catch. This task closes that gap.

- [ ] **Step 1: Spawn a fresh, context-isolated subagent with these 5 known-answer questions**

Use the `Agent` tool (`subagent_type: "Explore"`, since this is read-only lookup) with this exact self-contained prompt — it must NOT reference this conversation or plan, only the repo/vault paths, since the harness tests cold-start retrieval:

```
You have no prior context. Answer these 5 questions about the kat_ha_pb /
Katha Booth project. For each answer, state which file you read it from
(full path) and how you searched for it (tool name). Do not guess — if you
can't find a confident answer, say so explicitly rather than approximating.

1. What hex code is "Loko Rust" and what is its usage rule?
2. What is the canonical Vercel project name hosting book.kathabooth.com?
3. How many committed presets are in the current template catalog, and
   what's the Signature/Classic breakdown?
4. What CTA labels replaced "Commission" as the unified set?
5. Is Fraunces or EB Garamond still an active typeface choice for this
   project?

The vault lives at:
/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/
```

- [ ] **Step 2: Grade the transcript against known-correct answers**

| Q | Known-correct answer | Known-correct source file |
|---|---|---|
| 1 | `#8C382A`, sacred CTA only, ≤1 per viewport | `patterns.md` |
| 2 | `photobooth-template-studio` (`prj_iVMlkLzSlGS19cIhvabGf27ITwJQ`) | `SESSION_HANDOFF.json` → `canonical_infra.vercel_project` |
| 3 | 82 (33 Signature + 49 Classic) | `patterns.md` / `decisions.md` |
| 4 | "Request a Proposal" / "Reserve Your Date" / "Begin Your Inquiry" / "Send Inquiry" / "Sign Me Up" | `patterns.md` |
| 5 | No — fully retired 2026-06-18 (Vince-Alignment 2.2); current is Playfair Display / Hanken Grotesk → IvyMode/Proxima Nova (licensed target) | `patterns.md` |

For each of the 5 answers, confirm from the transcript: (a) the answer matches the table above, (b) the cited file is a vault plain file (any of the 7 HAM nodes), NOT a `codebase-memory-mcp` graph result, (c) a specific file path was actually cited, not a vague "I recall" or "I believe."

- [ ] **Step 3: Record the result**

Append to the vault `inbox.md` (do not skip this — an un-recorded eval run is itself a recurrence of the exact "designed, not run" failure mode this task exists to fix):
```
- [x] 2026-06-25 memory-eval-harness — DONE (CC-verified, real cold-start subagent run, not just designed). N/5 correct, all from vault plain files, zero codebase-memory-mcp vault-prose queries observed in transcript. See .memory/handoff/2026-06-25_memory-eval-harness_verify.md
```
Write the corresponding `handoff/2026-06-25_memory-eval-harness_verify.md` with the full transcript and per-question grading from Step 2.

- [ ] **Step 4: If any answer failed grading, do not mark this task done**

A failing answer means either the README.md/instructions.md edits from Tasks 6-7 aren't sufficient on their own, or the subagent ignored them. Escalate per this plan's governing spec — do not silently downgrade "4/5 correct" to "good enough" without flagging it back through the council per the standing rule in the Decision Record.

---

## Self-Review

**Spec coverage:** FR-1..FR-6 → Task 1. FR-7..FR-14 → Tasks 2-4. FR-15..FR-17 → Task 5 (FR-18 is explicitly deferred, no task — correct, it's an OS item). FR-19..FR-23 → Tasks 6-9. All 23 FRs trace to a task; FR-18's absence is intentional (OS-5).

**Placeholder scan:** No TBD/TODO/"add appropriate"/"similar to Task N" found — every step has complete file content, exact commands, or an exact prompt string.

**Type consistency:** `copilot_status`/`copilot_rc` variable names are consistent between Task 2's tests (which read them via `jq -r '.voices.copilot.status'`) and Task 3's implementation (which writes `voices.copilot` with those exact field names) and Task 4's docs (which describe the same env var names `COUNCIL_INCLUDE_COPILOT`/`COPILOT_BIN` used in both).

---

**Plan complete and saved to `docs/superpowers/plans/2026-06-25-gemini-copilot-execution.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
