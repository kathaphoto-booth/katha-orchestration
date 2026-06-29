# council.sh agy Voice Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the confirmed root cause of `council.sh`'s agy voice silently returning ABSENT (rc=0, empty output), and add a kill-switch so the next auth/billing hiccup fails fast and loud instead of costing another full debugging session.

**Architecture:** Two independent, already-confirmed-via-live-reproduction defects in the same code block (`council.sh`'s "Voice 2: agy as critic" section): (1) a hardcoded `--model "Claude Sonnet 4.6 (Thinking)"` — an Anthropic model name fed to the Gemini-based `agy` binary — which the binary silently chokes on; (2) no env-gated kill-switch, unlike the `COUNCIL_INCLUDE_COPILOT` pattern already shipped for the copilot voice this session. Both get fixed in one TDD pass over the same block, reusing the existing `ABSENT` status (no new enum value) so the codex/agy quorum check at the bottom of the script needs zero changes.

**Tech Stack:** Bash (`set -euo pipefail`), the existing dependency-free test harness (`.agents/skills/antigravity/tests/run.sh`, auto-discovers any `test_*` function via `declare -F`), `jq` for council.json assertions.

---

## Context for the implementer (read this before starting)

This is a regression-fix plan, not new-feature work. Everything below was confirmed via live, direct reproduction against the real `agy` binary this session — none of it is speculative:

- `council.sh` line 39 sets `MODEL="Claude Sonnet 4.6 (Thinking)"` and line 97 passes it as `--model "$MODEL"` to `agy`. `agy` is Google's Antigravity/Gemini CLI (binary at `/Volumes/samsung 970 pro - Data/KATHA_VAULT/bin/agy`) — `agy models` lists only Gemini model names (`Gemini 3.5 Flash (Medium/High/Low)`, `Gemini 3.1 Pro (Low/High)`, `Gemini 3 Flash`). Feeding it a Claude model name causes the call to fail — confirmed two ways: a short test prompt hangs to the timeout bound (rc=137, killed); the real, longer council critic prompt resolves to an instant empty response (rc=0, no stdout, no stderr — silently swallowed by `agy`'s own print-mode error handling).
- The fix is to **remove the `--model` override entirely**, not to substitute a different hardcoded model name. The only other known-working `agy --print` invocation in this codebase (`scripts/agy-tier-run.sh`) never passes `--model` — it lets the binary use its own default. That is the established working pattern.
- Separately, `council.sh` has **no kill-switch for the agy voice**. The copilot voice (added earlier this session) has `COUNCIL_INCLUDE_COPILOT` — an env var that, when set to `0`, marks the voice `SKIPPED` immediately with zero cost. agy has no equivalent. A prior version of this script (commit `5dd309e`, since superseded) had a `GEMINI_TIER` billing-tier switch for exactly this kind of graceful degradation, but it was deliberately removed in a later rebuild (commit `f958c75`) along with other retired Vertex/OSS-Ollama/qwen machinery — confirmed by an **existing, intentional regression test**, `test_council_is_hardened`, which asserts `GEMINI_TIER` does NOT appear in the file. **Do not reintroduce the name `GEMINI_TIER`** — it will fail that test, correctly. The new switch in this plan is named `COUNCIL_INCLUDE_AGY`, matching the copilot convention.
- **Important asymmetry vs. copilot:** copilot's disabled state uses status `"SKIPPED"`, a value distinct from `"ABSENT"`, because copilot never participates in the codex/agy quorum check (`if [[ "$codex_status" == "ABSENT" && "$agy_status" == "ABSENT" ]]`). agy DOES participate in that check. If a disabled agy used a new `"SKIPPED"` status instead of reusing `"ABSENT"`, the quorum check would incorrectly treat "agy intentionally turned off" as "agy present," and a run where codex genuinely fails AND agy is turned off would wrongly exit 0 (nothing to chair, but reported as success). **This plan reuses the existing `"ABSENT"` status for agy's disabled state** specifically to avoid that bug, and includes a test (`test_council_quorum_correct_when_agy_disabled`) that proves the quorum check stays correct. Do not "fix" this by giving agy a SKIPPED state without re-deriving why that would break quorum.
- The auth/billing issue that was *also* contributing to today's failure (a stale OAuth token resolving via the wrong internal auth path) has already been resolved separately (Jed re-logged into GCP mid-session) and is not part of this plan's scope.
- **Out of scope, flagged separately, do not fix here:** `scripts/agy-tier-run.sh` still calls `bin/compile-ham.sh` and injects raw `COMPILED_HAM.md` (lines 36-40, 52-53), contradicting a 2026-06-24 report that claimed this was removed. That report's test harness mocked the real `agy` binary for 6 of 7 scenarios, so the claim was likely never verified live. This is a separate, already-logged inbox item (`.memory/inbox.md`, 2026-06-25 entries) — touching it is not part of this plan.

---

## File Structure

- **Modify:** `.agents/skills/antigravity/scripts/council.sh` — remove the `MODEL` variable, the `--model` CLI flag, and the `--model "$MODEL"` argument to `agy`; add the `COUNCIL_INCLUDE_AGY` env-gate around the existing Voice 2 block.
- **Modify:** `.agents/skills/antigravity/tests/test_council.sh` — add one stub helper (`_mk_agy_guarded`) and four new test functions; fix two stale comments (file header still says "2-voice"; `_mk_agy_ok`'s doc comment still shows `--model <m>` in the invocation shape).
- **Modify:** `.agents/skills/antigravity/SKILL.md` — update the "Council" section's one paragraph to mention the `COUNCIL_INCLUDE_AGY` toggle and the no-`--model` detail, matching how `COUNCIL_INCLUDE_COPILOT` is already documented there.

No new files. All three files already exist and were read in full this session.

---

## Task 1: Write failing tests for the agy fix (RED)

**Files:**
- Modify: `.agents/skills/antigravity/tests/test_council.sh`

- [ ] **Step 1: Add the `_mk_agy_guarded` stub helper**

Insert immediately after the existing `_mk_agy_fail` function (currently the line reading `_mk_agy_fail() { printf '#!/usr/bin/env bash\nexit 1\n' > "$1/agy"; chmod +x "$1/agy"; }`), and before the blank line that precedes the copilot stub comment block:

```bash
_mk_agy_guarded() {
  printf '#!/usr/bin/env bash\ntouch "${AGY_SENTINEL:-/tmp/agy_invoked}"\necho "should-not-run"\nexit 0\n' > "$1/agy"
  chmod +x "$1/agy"
}
```

- [ ] **Step 2: Append four new test functions at the end of the file**

Add after the existing last function, `test_council_copilot_preflight_is_bounded` (ends with its closing `}`):

```bash

test_council_agy_no_model_override() {            # source-assertion (regression guard)
  # council.sh used to hardcode --model "Claude Sonnet 4.6 (Thinking)" into the
  # agy invocation — an Anthropic model name fed to the Gemini-based agy binary.
  # Confirmed via live repro (2026-06-25) that this silently broke every council
  # run: rc=0, empty stdout/stderr, no error surfaced anywhere. agy must be left
  # to its own default model — matching the only other known-working invocation
  # (agy-tier-run.sh), which never passes --model either.
  local b; b="$(cat "$SKILL/council.sh" 2>/dev/null)"
  assert_not_contains "$b" "Claude Sonnet" "council.sh does not hardcode a Claude model name for agy"
  assert_not_contains "$b" '"$AGY_BIN" --print --print-timeout "${TIMEOUT}s" --model' "agy invocation does not pass --model at all"
}

test_council_agy_disabled_never_invokes_binary() {
  local r; r=$(mk_repo); local bin; bin=$(mktemp -d)
  _mk_codex_ok "$bin"; _mk_agy_guarded "$bin"
  local sentinel; sentinel="$(mktemp -u)"      # a path that must NOT come to exist
  local blob; blob=$(mktemp); echo "diff" > "$blob"
  CODEX_BIN="$bin/codex" AGY_BIN="$bin/agy" COUNCIL_INCLUDE_AGY=0 COUNCIL_INCLUDE_COPILOT=0 AGY_SENTINEL="$sentinel" \
    bash "$SKILL/council.sh" crc6 "$blob" --repo "$r" --timeout 30 >/dev/null 2>&1
  assert_eq "$([[ -e "$sentinel" ]] && echo invoked || echo not-invoked)" "not-invoked" \
    "COUNCIL_INCLUDE_AGY=0 => agy binary never invoked"
  local cj="$r/.orchestration/crc6/council/council.json"
  assert_eq "$(jq -r '.voices.agy.status' "$cj" 2>/dev/null)" "ABSENT" "disabled agy reports ABSENT (reuses existing status, no new value)"
  assert_contains "$(cat "$r/.orchestration/crc6/council/agy.out" 2>/dev/null)" "disabled" "agy.out distinguishes 'disabled' from a real failure"
}

test_council_agy_default_on_unchanged() {
  local r; r=$(mk_repo); local bin; bin=$(mktemp -d)
  _mk_codex_ok "$bin"; _mk_agy_ok "$bin"
  local blob; blob=$(mktemp); echo "diff" > "$blob"
  CODEX_BIN="$bin/codex" AGY_BIN="$bin/agy" COUNCIL_INCLUDE_COPILOT=0 \
    bash "$SKILL/council.sh" crc7 "$blob" --repo "$r" --timeout 30 >/dev/null 2>&1
  local cj="$r/.orchestration/crc7/council/council.json"
  assert_eq "$(jq -r '.voices.agy.status' "$cj" 2>/dev/null)" "OK" "COUNCIL_INCLUDE_AGY unset => defaults to on, unchanged behavior"
}

test_council_quorum_correct_when_agy_disabled() {
  local r; r=$(mk_repo); local bin; bin=$(mktemp -d)
  _mk_codex_fail "$bin"; _mk_agy_ok "$bin"
  local blob; blob=$(mktemp); echo "diff" > "$blob"
  CODEX_BIN="$bin/codex" AGY_BIN="$bin/agy" COUNCIL_INCLUDE_AGY=0 COUNCIL_INCLUDE_COPILOT=0 \
    bash "$SKILL/council.sh" crc8 "$blob" --repo "$r" --timeout 30 >/dev/null 2>&1
  assert_exit "$?" 1 "codex failed + agy intentionally disabled => exit 1 (nothing for CC to chair; quorum line stays correct unmodified)"
}
```

- [ ] **Step 3: Run the suite and confirm exactly these 4 tests fail, nothing else**

Run: `bash .agents/skills/antigravity/tests/run.sh 2>&1 | tail -20`

Expected: the summary line shows `FAIL=4` (or `FAIL=3` if `test_council_agy_no_model_override`'s two assertions both fail under one test-function count — check the harness's per-function vs per-assertion counting by reading the tail output directly), and the failing test names listed are exactly: `test_council_agy_no_model_override`, `test_council_agy_disabled_never_invokes_binary`, `test_council_agy_default_on_unchanged`, `test_council_quorum_correct_when_agy_disabled`. All pre-existing tests still show as passing. If any *other* test now fails, stop and re-examine — it means the new stub helper or test setup broke something unrelated.

- [ ] **Step 4: Commit the red tests**

```bash
git add .agents/skills/antigravity/tests/test_council.sh
git commit -m "test(council): add failing tests for agy --model bug + COUNCIL_INCLUDE_AGY (red phase)"
```

---

## Task 2: Implement the fix (GREEN)

**Files:**
- Modify: `.agents/skills/antigravity/scripts/council.sh`

- [ ] **Step 1: Remove the `MODEL` variable and its CLI flag**

Find this block (the argument parser, near the top of the file, right after `BLOB="${2:-}"` / `shift 2 2>/dev/null || true` / `REPO="."` / `TIMEOUT="300"`):

```bash
RUN="${1:-}"
BLOB="${2:-}"
shift 2 2>/dev/null || true
REPO="."
TIMEOUT="300"
MODEL="Claude Sonnet 4.6 (Thinking)"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo) REPO="$2"; shift 2;;
    --timeout) TIMEOUT="$2"; shift 2;;
    --model) MODEL="$2"; shift 2;;
    *) echo "unknown arg $1" >&2; exit 2;;
  esac
done
```

Replace with:

```bash
RUN="${1:-}"
BLOB="${2:-}"
shift 2 2>/dev/null || true
REPO="."
TIMEOUT="300"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo) REPO="$2"; shift 2;;
    --timeout) TIMEOUT="$2"; shift 2;;
    *) echo "unknown arg $1" >&2; exit 2;;
  esac
done
```

(This flag was undocumented — the script's own usage string and error message only ever mentioned `--repo` and `--timeout`. Nothing else in the codebase references `--model` or `$MODEL` — verified by grep across `council.sh`, `test_council.sh`, and `SKILL.md` before writing this plan.)

- [ ] **Step 2: Replace the Voice 2 (agy) block**

Find this block:

```bash
# --- Voice 2: agy as critic (--print only; NO --sandbox, NO --add-dir) ---
agy_status="ABSENT"
set +e
run_with_timeout "$TIMEOUT" "$AGY_BIN" --print --print-timeout "${TIMEOUT}s" --model "$MODEL" "$PROMPT" \
  < /dev/null > "$OUT/.agy.raw" 2> "$OUT/.agy.raw.err"
agy_rc=$?
set -e
redact < "$OUT/.agy.raw" > "$OUT/agy.out"; redact < "$OUT/.agy.raw.err" > "$OUT/agy.err"
rm -f "$OUT/.agy.raw" "$OUT/.agy.raw.err"
if [[ "$agy_rc" -eq 0 && -s "$OUT/agy.out" ]]; then agy_status="OK"; else
  echo "ABSENT: agy voice failed or produced no output (rc=$agy_rc)" >> "$OUT/agy.out"
fi
```

Replace with:

```bash
# --- Voice 2: agy as critic (--print only; NO --sandbox, NO --add-dir) ---
# COUNCIL_INCLUDE_AGY (default 1): kill-switch for the agy voice, mirroring
# COUNCIL_INCLUDE_COPILOT's pattern. Added 2026-06-25 after a real incident:
# agy silently returned ABSENT (rc=0, empty output) for an auth/billing reason
# that took a full debugging session to diagnose. Disabling agy here is
# immediate and free — no wasted $TIMEOUT — while an account issue is
# resolved. Reuses the existing ABSENT status rather than a new SKIPPED value
# (unlike copilot) because agy participates directly in the quorum check
# below; a disabled agy must still count as ABSENT for that decision to stay
# correct (see test_council_quorum_correct_when_agy_disabled).
agy_status="ABSENT"
COUNCIL_INCLUDE_AGY="${COUNCIL_INCLUDE_AGY:-1}"
if [[ "$COUNCIL_INCLUDE_AGY" == "1" ]]; then
  # No --model override: agy uses its own default model. A hardcoded model
  # name here was previously "Claude Sonnet 4.6 (Thinking)" — an Anthropic
  # name fed to this Gemini-based binary — and silently broke every council
  # run (confirmed via live repro 2026-06-25: rc=0, empty stdout/stderr, no
  # error surfaced anywhere outside agy's own --log-file). The only other
  # known-working invocation (agy-tier-run.sh) never passes --model either.
  set +e
  run_with_timeout "$TIMEOUT" "$AGY_BIN" --print --print-timeout "${TIMEOUT}s" "$PROMPT" \
    < /dev/null > "$OUT/.agy.raw" 2> "$OUT/.agy.raw.err"
  agy_rc=$?
  set -e
  redact < "$OUT/.agy.raw" > "$OUT/agy.out"; redact < "$OUT/.agy.raw.err" > "$OUT/agy.err"
  rm -f "$OUT/.agy.raw" "$OUT/.agy.raw.err"
  if [[ "$agy_rc" -eq 0 && -s "$OUT/agy.out" ]]; then
    agy_status="OK"
  else
    echo "ABSENT: agy voice failed or produced no output (rc=$agy_rc; re-run agy directly with --log-file <path> for diagnostics)" >> "$OUT/agy.out"
  fi
else
  agy_rc=0
  echo "ABSENT: agy voice disabled (COUNCIL_INCLUDE_AGY=0) — re-enable by unsetting or setting =1" > "$OUT/agy.out"
  : > "$OUT/agy.err"
fi
```

- [ ] **Step 3: Run the full suite and confirm everything passes**

Run: `bash .agents/skills/antigravity/tests/run.sh 2>&1 | tail -10`

Expected: `FAIL=0`. All 4 previously-red tests now pass, and the full pre-existing test count (including the copilot tests from earlier this session) still passes unchanged.

- [ ] **Step 4: Commit the fix**

```bash
git add .agents/skills/antigravity/scripts/council.sh
git commit -m "fix(council): remove invalid Claude model name from agy invocation, add COUNCIL_INCLUDE_AGY kill-switch

Confirmed via live reproduction: council.sh hardcoded --model \"Claude Sonnet
4.6 (Thinking)\" — an Anthropic model name — into the agy (Gemini-based) CLI
invocation. agy silently failed on this (rc=0, empty output on the real
critic prompt; hangs to timeout on a short prompt), surfacing only as the
generic ABSENT status with no diagnosable reason. Confirmed via agy's own
--log-file: the actual internal error was unrelated auth/project-ID noise
that happened to coincide; removing --model (matching the only other known-
working agy --print invocation, agy-tier-run.sh) fixes the call.

Also adds COUNCIL_INCLUDE_AGY (default 1), matching the COUNCIL_INCLUDE_COPILOT
pattern, so a disabled/broken agy voice can be turned off with zero cost
instead of silently eating a full \$TIMEOUT on every council run. Reuses the
existing ABSENT status (not a new SKIPPED value) because agy, unlike copilot,
participates in the quorum check — see test_council_quorum_correct_when_agy_disabled."
```

---

## Task 3: Fix stale documentation

**Files:**
- Modify: `.agents/skills/antigravity/tests/test_council.sh`
- Modify: `.agents/skills/antigravity/SKILL.md`

- [ ] **Step 1: Fix the test file header comment**

Find (near the top of `test_council.sh`):

```bash
#!/usr/bin/env bash
# Tests for scripts/council.sh — the 2-voice read-only critique collector.
```

Replace with:

```bash
#!/usr/bin/env bash
# Tests for scripts/council.sh — the read-only critique collector (codex + agy
# required-pair, copilot optional 3rd voice).
```

- [ ] **Step 2: Fix the stale `--model` mention in the agy stub's doc comment**

Find:

```bash
# An agy stub that succeeds with output. council.sh invokes:
#   agy --print --print-timeout <t>s --model <m> <prompt>
```

Replace with:

```bash
# An agy stub that succeeds with output. council.sh invokes (no --model
# override — agy uses its own default model; see COUNCIL_INCLUDE_AGY):
#   agy --print --print-timeout <t>s <prompt>
```

- [ ] **Step 3: Update SKILL.md's Council section**

Find (in `.agents/skills/antigravity/SKILL.md`):

```markdown
## Council (`council.sh`) — opinion path, NOT execution
`council.sh <run_id> <blob-file> [--repo <dir>] [--timeout <secs>]` collects up to
three read-only critiques (`codex` via `codex exec -s read-only`; `agy` via
`--print` with NO `--sandbox`/`--add-dir`; `copilot` via `gh copilot -p`, pre-flight
gated so it never attempts a call when the Copilot CLI isn't already downloaded —
env-toggle `COUNCIL_INCLUDE_COPILOT`, default on) of a CC-authored blob and writes
them under `.orchestration/<run>/council/` for CC to chair. A failed or disabled
voice is marked `ABSENT`/`SKIPPED` (fail-loud); exit 1 only if codex AND agy are
both absent — copilot's presence never affects that decision. **Never** point it
at agy's own just-completed `result.md` — it takes an explicit blob path so that
mistake can't happen implicitly. Secrets in the reviewed blob are redacted before
anything is persisted.
```

Replace with:

```markdown
## Council (`council.sh`) — opinion path, NOT execution
`council.sh <run_id> <blob-file> [--repo <dir>] [--timeout <secs>]` collects up to
three read-only critiques (`codex` via `codex exec -s read-only`; `agy` via
`--print` with NO `--sandbox`/`--add-dir` and no `--model` override — agy uses
its own default model, env-toggle `COUNCIL_INCLUDE_AGY`, default on; `copilot`
via `gh copilot -p`, pre-flight gated so it never attempts a call when the
Copilot CLI isn't already downloaded — env-toggle `COUNCIL_INCLUDE_COPILOT`,
default on) of a CC-authored blob and writes them under
`.orchestration/<run>/council/` for CC to chair. A failed or disabled voice is
marked `ABSENT`/`SKIPPED` (fail-loud); exit 1 only if codex AND agy are both
absent (disabling agy via `COUNCIL_INCLUDE_AGY=0` counts as absent for this
check — it reuses the ABSENT status, unlike copilot's distinct SKIPPED, because
agy is one of the two voices the quorum check itself reads) — copilot's
presence never affects that decision. **Never** point it at agy's own
just-completed `result.md` — it takes an explicit blob path so that mistake
can't happen implicitly. Secrets in the reviewed blob are redacted before
anything is persisted.
```

- [ ] **Step 4: Run the suite once more to confirm the doc-only changes didn't break anything**

Run: `bash .agents/skills/antigravity/tests/run.sh 2>&1 | tail -5`

Expected: `FAIL=0`, same pass count as Task 2 Step 3.

- [ ] **Step 5: Commit**

```bash
git add .agents/skills/antigravity/tests/test_council.sh .agents/skills/antigravity/SKILL.md
git commit -m "docs(council): fix stale --model mention + 2-voice framing, document COUNCIL_INCLUDE_AGY"
```

---

## Task 4: Live verification against the real binary (not stubs)

The entire test suite above runs against stub scripts that ignore CLI flags — by design, for hermetic/fast tests. None of it proves the fix works against the *real* `agy` binary. This step closes that gap with the same kind of live-reproduction evidence used to find the bug in the first place.

**Files:** none modified — verification only.

- [ ] **Step 1: Run the real council.sh against the real codex + agy binaries**

```bash
cd /Users/jedg./Desktop/kat_ha_pb
echo "live verification blob for the council.sh agy fix" > /tmp/council_final_verify.md
rm -rf .orchestration/final-verify
bash .agents/skills/antigravity/scripts/council.sh final-verify /tmp/council_final_verify.md --timeout 60
```

Expected output line: `council: codex=OK agy=OK copilot=ABSENT -> ./.orchestration/final-verify/council/council.json` (`copilot=ABSENT` is expected and unrelated — the Copilot CLI still isn't installed on this machine; that's a separate, already-logged item).

- [ ] **Step 2: Confirm council.json and agy.out directly**

```bash
cat .orchestration/final-verify/council/council.json
echo "--- agy.out ---"
cat .orchestration/final-verify/council/agy.out
```

Expected: `council.json`'s `.voices.agy.status` is `"OK"` and `.voices.agy.rc` is `0`; `agy.out` contains a real, non-empty critique of the test blob (not an `ABSENT:` line).

- [ ] **Step 3: Log the closing result to the vault inbox**

This step updates the vault, not the repo. Read the current tail of `/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/inbox.md` to find the exact insertion point (it changes every session), then append a line in the same style as the existing 2026-06-25 entries, stating: the `council-agy-absent-root-caused` inbox item (logged earlier this session) is now fully resolved by this plan's commits, with the live council.json output from Step 2 as closing evidence. Commit that change in the vault's own git repo (`git -C "/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory" add inbox.md && git -C "..." commit -m "..."`), matching the pattern used for every other inbox update this session.

---

## Self-Review

**Spec coverage:** Both confirmed defects (wrong `--model` value; missing kill-switch) have a task each (Task 2 implements both in one block since they're the same code region; Task 1 tests both first). The quorum-correctness concern raised by adding a kill-switch to a quorum-participating voice has its own explicit test (`test_council_quorum_correct_when_agy_disabled`) and its own paragraph of reasoning in the Context section. Stale docs that would otherwise mislead the next reader (test file header, stub comment, SKILL.md) are fixed in Task 3. Live, non-stubbed proof is Task 4. Nothing in scope is left uncovered.

**Placeholder scan:** No TBD/TODO markers. Every step shows the complete before/after code, not a description of it. No "similar to Task N" shortcuts — Task 2's two code replacements are each shown in full.

**Type/naming consistency:** `COUNCIL_INCLUDE_AGY` is spelled identically everywhere it appears (plan prose, council.sh code block, SKILL.md, all four new test functions). `agy_status`/`agy_rc` variable names match the pre-existing names in council.sh exactly — no renaming. Test function names (`test_council_agy_no_model_override`, `test_council_agy_disabled_never_invokes_binary`, `test_council_agy_default_on_unchanged`, `test_council_quorum_correct_when_agy_disabled`) don't collide with any of the 13 existing test functions in `test_council.sh` (verified by grep before writing this plan).

---

Plan complete and saved to `docs/superpowers/plans/2026-06-25-council-agy-voice-fix.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
