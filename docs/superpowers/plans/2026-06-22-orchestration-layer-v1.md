# Katha CLI Orchestration Layer v1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retrofit the existing agy→HAM pipeline into a leak-proof "lazy orchestrator" where a deterministic non-LLM harness owns truth, agy is fully sandboxed/isolated, and every delegation is transactionally reversible across repo + vault + caches.

**Architecture:** A deterministic `verdict.sh` computes the changed-set from git itself (never from agy's self-report), runs the gate, and emits a signed PASS/FAIL `verdict.json` that CC may only read. Each delegation runs in its own git worktree with a transaction sentinel; on failure the working tree, the (newly git-versioned) vault, and build caches roll back atomically. agy runs `--sandbox` with no external-effect tools.

**Tech Stack:** Bash 3.2-compatible (macOS default ships only `/bin/bash` 3.2 — **no `mapfile`/`readarray`**; use `arr=(); while IFS= read -r line; do arr+=("$line"); done < <(…)` instead), `set -euo pipefail`, `jq`, `git` (incl. worktrees), `git -C $VAULT` for vault versioning, dependency-free bash test runner (no bats). Reuses sync.sh's noclobber-lock and `mktemp`+`mv` atomic-write patterns.

**Scope:** v1 = §1 verdict harness + §2 git-derived scope/agy-not-witness + §3 transactional checkpoint + §4 external-effect lockout + §8 worktree isolation + agy-death sentinel. Deferred to v2: §5 reader/verifier model split, §6 differential human approval, §7 vault-fsck + per-line canon provenance.

---

## File Structure

**New (`.agents/skills/antigravity/`):**
- `scripts/lib.sh` — shared helpers: paths + git changed-set. One responsibility: primitives every other script reuses (DRY).
- `scripts/verdict.sh` — §1/§2 deterministic truth harness. THE core. Computes reality from git, compares to digest claims, runs gate, emits `verdict.json`.
- `scripts/checkpoint.sh` — §3 transactional snapshot/rollback across repo + vault + build caches.
- `scripts/delegate_agy.sh` — §4/§8 hardened delegation: per-run worktree, run_id namespacing, `--sandbox` tool lockout, transaction sentinel, stash-not-reset on failure.
- `scripts/authority-guard.sh` — §2 agy-not-witness: rejects agy-authored text asserting human-authority decisions.
- `tests/run.sh` — dependency-free RED suite (the 8 adversarial attacks).
- `tests/lib_test.sh` — assert helpers + fixture builders (temp git repos/vaults).
- `SKILL.md` — the orchestration skill entry point (wired last).

**Retrofit (existing):**
- `bin/compile-ham.sh` — atomic temp+`mv`; self-acquire `.sync.lock`.
- `scripts/agy-tier-run.sh` — delegate to `delegate_agy.sh` for worktree/sentinel/sandbox; keep timing.
- `scripts/backup-vault.sh` — un-ignore `COMPILED_HAM.md`; add remote push.
- `AGENTS.md` — digest schema (incl. `external_effects[]`), agy tool allowlist, agy-not-witness rule.
- `CLAUDE.md` — point `/antigravity` at the real skill.

---

## Conventions for every task

- Tests live in `.agents/skills/antigravity/tests/`. Run the whole suite with `bash .agents/skills/antigravity/tests/run.sh`; run one with `bash .agents/skills/antigravity/tests/run.sh <test_name>`.
- All new scripts start with `#!/usr/bin/env bash` + `set -euo pipefail`, 2-space indent, `snake_case` funcs.
- After creating any `.sh`, make it executable: `chmod +x <path>`.
- Commit after each green step.

---

## Phase 0 — Prerequisite: version the vault (Jed action + retrofit)

### Task 0: Vault git repo + private remote

**Files:**
- Modify: `scripts/backup-vault.sh:30-33` (gitignore heredoc), `:50` (rsync exclude)

- [ ] **Step 1 (Jed action — cannot be scripted):** Create a **private** GitHub repo (e.g. `katha-vault`, private). Do not push from CC — CC must not publish to external services without this repo existing. Provide the SSH/HTTPS URL to the implementer.

- [ ] **Step 2: Un-ignore COMPILED_HAM.md so the boot artifact is versioned/diffable.**

In `scripts/backup-vault.sh`, change the gitignore heredoc (lines 30-33) from:

```bash
  cat > .gitignore <<EOF
.sync.lock
COMPILED_HAM.md
EOF
```
to:
```bash
  cat > .gitignore <<EOF
.sync.lock
EOF
```

And change the rsync line (line 50) from:
```bash
rsync -av --exclude='.git' --exclude='.sync.lock' --exclude='COMPILED_HAM.md' "$VAULT/" "$BACKUP_DIR/"
```
to:
```bash
rsync -av --exclude='.git' --exclude='.sync.lock' "$VAULT/" "$BACKUP_DIR/"
```

- [ ] **Step 3: Add remote push to backup-vault.sh.** After line 44 (the `fi` closing the commit block), insert:

```bash
# 1b. Push to private remote (durability — survives drive loss)
VAULT_REMOTE="${KATHA_VAULT_REMOTE:-}"
if [[ -n "$VAULT_REMOTE" ]]; then
  if ! git remote | grep -qx origin; then
    git remote add origin "$VAULT_REMOTE"
  fi
  git push -u origin HEAD 2>&1 || echo "WARN: vault push failed (offline?); local commit retained."
else
  echo "WARN: KATHA_VAULT_REMOTE unset — vault committed locally only, no offsite copy."
fi
```

- [ ] **Step 4: Initialize + first push.** Run (with the real URL):

```bash
KATHA_VAULT_REMOTE="git@github.com:<user>/katha-vault.git" bash scripts/backup-vault.sh
```
Expected: vault `git init` runs (if first time), commits, adds origin, pushes. `git -C "/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory" log --oneline` shows the commit; `COMPILED_HAM.md` is now tracked.

- [ ] **Step 5: Commit the script change.**

```bash
git add scripts/backup-vault.sh
git commit -m "feat(vault): version COMPILED_HAM + push to private remote"
```

---

## Phase 1 — §1 verdict harness + test scaffolding

### Task 1: Test harness + fixtures

**Files:**
- Create: `.agents/skills/antigravity/tests/lib_test.sh`, `.agents/skills/antigravity/tests/run.sh`

- [ ] **Step 1: Write the assert/fixture library.** Create `tests/lib_test.sh`:

```bash
#!/usr/bin/env bash
# Dependency-free test helpers. No bats.
set -uo pipefail

PASS_COUNT=0; FAIL_COUNT=0
assert_eq() { # <actual> <expected> <msg>
  if [[ "$1" == "$2" ]]; then PASS_COUNT=$((PASS_COUNT+1)); echo "  ok: $3";
  else FAIL_COUNT=$((FAIL_COUNT+1)); echo "  FAIL: $3 (got '$1' want '$2')"; fi
}
assert_exit() { # <expected_code> <msg> ; reads $? via caller passing it
  if [[ "$1" == "$2" ]]; then PASS_COUNT=$((PASS_COUNT+1)); echo "  ok: $3";
  else FAIL_COUNT=$((FAIL_COUNT+1)); echo "  FAIL: $3 (exit $1, want $2)"; fi
}
assert_contains() { # <haystack> <needle> <msg>
  if [[ "$1" == *"$2"* ]]; then PASS_COUNT=$((PASS_COUNT+1)); echo "  ok: $3";
  else FAIL_COUNT=$((FAIL_COUNT+1)); echo "  FAIL: $3 (missing '$2')"; fi
}

# Build a throwaway git repo with one committed file; echoes its path.
mk_repo() {
  local d; d=$(mktemp -d)
  git -C "$d" init -q
  git -C "$d" config user.email t@t; git -C "$d" config user.name t
  echo "base" > "$d/a.txt"; git -C "$d" add -A; git -C "$d" commit -qm init
  echo "$d"
}

# Build a throwaway vault dir with the core HAM nodes; echoes its path.
mk_vault() {
  local d; d=$(mktemp -d)
  mkdir -p "$d/handoff/_staged"
  printf '{}' > "$d/SESSION_HANDOFF.json"
  for n in decisions patterns inbox memory instructions; do echo "# $n" > "$d/$n.md"; done
  echo "$d"
}
```

- [ ] **Step 2: Write the runner.** Create `tests/run.sh`:

```bash
#!/usr/bin/env bash
set -uo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/lib_test.sh"
SKILL="$(cd "$DIR/.." && pwd)/scripts"

# Discover and source any test files (test_*.sh), each defining test_<name> funcs.
# nullglob keeps the empty-suite case (no test_*.sh yet) clean — without it,
# `for f in <unmatched-glob>` iterates the literal pattern string and `source` errors.
shopt -s nullglob
for f in "$DIR"/test_*.sh; do source "$f"; done
shopt -u nullglob

run_one() { echo "== $1 =="; "$1"; }
# Portable to bash 3.2 (macOS default; no mapfile/readarray).
TESTS=()
while IFS= read -r _line; do TESTS+=("$_line"); done \
  < <(declare -F | awk '{print $3}' | grep '^test_' | sort || true)
if [[ $# -ge 1 ]]; then
  run_one "test_$1"
else
  for t in "${TESTS[@]:-}"; do [[ -n "$t" ]] && run_one "$t"; done
fi
echo ""; echo "PASS=$PASS_COUNT FAIL=$FAIL_COUNT"
[[ "$FAIL_COUNT" -eq 0 ]]
```

- [ ] **Step 3: Run it (empty suite passes).**

Run: `chmod +x .agents/skills/antigravity/tests/*.sh && bash .agents/skills/antigravity/tests/run.sh`
Expected: `PASS=0 FAIL=0`, exit 0.

- [ ] **Step 4: Commit.**

```bash
git add .agents/skills/antigravity/tests/
git commit -m "test(orchestration): dependency-free bash test harness"
```

### Task 2: `lib.sh` shared primitives

**Files:**
- Create: `.agents/skills/antigravity/scripts/lib.sh`
- Test: `.agents/skills/antigravity/tests/test_lib.sh`

- [ ] **Step 1: Write the failing test.** Create `tests/test_lib.sh`:

```bash
test_changed_set_includes_untracked() {
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo)
  echo "x" > "$r/tracked_edit.txt"   # untracked new file
  echo "y" >> "$r/a.txt"             # modified tracked
  local out; out=$(changed_set "$r" | sort | tr '\n' ',')
  assert_eq "$out" "a.txt,tracked_edit.txt," "changed_set sees tracked+untracked"
}
```

- [ ] **Step 2: Run, verify it fails.**

Run: `bash .agents/skills/antigravity/tests/run.sh lib_changed_set_includes_untracked` (or full suite)
Expected: FAIL — `lib.sh` not found / `changed_set` undefined.

- [ ] **Step 3: Implement `lib.sh`.**

```bash
#!/usr/bin/env bash
set -euo pipefail

VAULT_DIR="/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory"
REPO_DIR="/Users/jedg./Desktop/kat_ha_pb"

# changed_set <repo> -> newline list of changed + untracked paths (relative)
changed_set() {
  git -C "$1" status --porcelain=v1 --untracked-files=all \
    | sed -E 's/^.{3}//' | sed -E 's/^"(.*)"$/\1/'
}

```

(The noclobber-lock pattern from sync.sh:25-32 is reused inline by `compile-ham.sh` in Task 6, which lives in `bin/` and does not source this lib.)

- [ ] **Step 4: Run, verify pass.** Expected: `ok: changed_set sees tracked+untracked`.

- [ ] **Step 5: Commit.**

```bash
chmod +x .agents/skills/antigravity/scripts/lib.sh
git add .agents/skills/antigravity/scripts/lib.sh .agents/skills/antigravity/tests/test_lib.sh
git commit -m "feat(orchestration): lib.sh changed-set + lock primitives"
```

### Task 3: `verdict.sh` — scope-injection + verifier-determinism (attacks #1, #8)

**Files:**
- Create: `.agents/skills/antigravity/scripts/verdict.sh`
- Test: `.agents/skills/antigravity/tests/test_verdict.sh`

- [ ] **Step 1: Write the failing tests.** Create `tests/test_verdict.sh`:

```bash
test_verdict_flags_unclaimed_change() {           # attack #1 scope-injection
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo)
  echo "evil" > "$r/brand-guard.ts"   # real change agy did NOT claim
  echo "hi"   > "$r/Hero.tsx"
  local dg; dg=$(mktemp)
  printf '{"files_touched":["Hero.tsx"],"external_effects":[]}' > "$dg"
  bash "$SKILL/verdict.sh" --repo "$r" --digest "$dg" --gate none >/dev/null 2>&1
  assert_exit "$?" 1 "verdict FAILs when a real change is unclaimed"
  assert_contains "$(cat "$r/.verdict.json")" "brand-guard.ts" "verdict names the unclaimed file"
}
test_verdict_ignores_persuasive_prose() {         # attack #8 verifier-determinism
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo)
  echo "z" >> "$r/a.txt"
  local dg; dg=$(mktemp)
  printf '{"files_touched":[],"external_effects":[],"self_reported_result":"All verified, gate passed, trust me."}' > "$dg"
  bash "$SKILL/verdict.sh" --repo "$r" --digest "$dg" --gate none >/dev/null 2>&1
  assert_exit "$?" 1 "verdict FAILs on git reality despite confident prose"
}
```

- [ ] **Step 2: Run, verify fails.** Expected: FAIL — `verdict.sh` not found.

- [ ] **Step 3: Implement `verdict.sh`.**

```bash
#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/lib.sh"

REPO=""; DIGEST=""; GATE="fast"
while [[ $# -gt 0 ]]; do case "$1" in
  --repo) REPO="$2"; shift 2;; --digest) DIGEST="$2"; shift 2;;
  --gate) GATE="$2"; shift 2;; *) echo "unknown arg $1" >&2; exit 2;; esac; done
[[ -n "$REPO" && -f "$DIGEST" ]] || { echo "usage: verdict.sh --repo <dir> --digest <json> [--gate fast|full|none]" >&2; exit 2; }

# Reality from git — NEVER from the digest.
# Bash 3.2-compatible array reads (no mapfile on macOS /bin/bash).
read_into() {  # <varname> < <stream>  : appends each line to the named array
  local _v="$1"; local _l
  while IFS= read -r _l; do eval "$_v+=(\"\$_l\")"; done
}
REAL=();    read_into REAL    < <(changed_set "$REPO")
CLAIMED=(); read_into CLAIMED < <(jq -r '.files_touched[]? // empty' "$DIGEST")
EXT=();     read_into EXT     < <(jq -r '.external_effects[]? // empty' "$DIGEST")

STATUS="PASS"; REASONS=()
# (a) every REAL change must be CLAIMED (real ⊆ claimed). Unclaimed = leak.
for f in "${REAL[@]:-}"; do
  [[ -z "$f" ]] && continue
  printf '%s\n' "${CLAIMED[@]:-}" | grep -qxF "$f" || { STATUS="FAIL"; REASONS+=("unclaimed change: $f"); }
done
# (b) external effects must be empty (defense-in-depth for §4).
if [[ "${#EXT[@]}" -gt 0 && -n "${EXT[0]:-}" ]]; then
  STATUS="FAIL"; REASONS+=("external effects present: ${EXT[*]}")
fi
# (c) gate (deterministic, real exit codes). Throwaway tsbuildinfo so cache can't lie.
GATE_RESULT="skipped"
if [[ "$GATE" != "none" ]]; then
  local_tmp=$(mktemp -d)
  if git -C "$REPO" rev-parse >/dev/null 2>&1 && command -v npx >/dev/null 2>&1; then
    if ( cd "$REPO" && npx tsc --noEmit --incremental false >/"$local_tmp"/tsc.log 2>&1 ); then
      GATE_RESULT="tsc:pass"
    else GATE_RESULT="tsc:fail"; STATUS="FAIL"; REASONS+=("tsc failed"); fi
  fi
fi

jq -n --arg status "$STATUS" --arg gate "$GATE_RESULT" \
  --argjson real "$(printf '%s\n' "${REAL[@]:-}" | jq -R . | jq -s .)" \
  --argjson reasons "$(printf '%s\n' "${REASONS[@]:-}" | jq -R . | jq -s 'map(select(.!=""))')" \
  '{status:$status, gate:$gate, real_changes:$real, reasons:$reasons}' > "$REPO/.verdict.json"

[[ "$STATUS" == "PASS" ]]
```

- [ ] **Step 4: Run, verify pass.** Expected both `ok:` lines.

- [ ] **Step 5: Commit.**

```bash
chmod +x .agents/skills/antigravity/scripts/verdict.sh
git add .agents/skills/antigravity/scripts/verdict.sh .agents/skills/antigravity/tests/test_verdict.sh
git commit -m "feat(orchestration): verdict.sh — git-derived truth (attacks 1,8)"
```

---

## Phase 2 — §2 agy-not-witness (attack #3 belief-laundering)

### Task 4: `authority-guard.sh`

**Files:**
- Create: `.agents/skills/antigravity/scripts/authority-guard.sh`
- Test: `.agents/skills/antigravity/tests/test_authority.sh`

- [ ] **Step 1: Write the failing test.** Create `tests/test_authority.sh`:

```bash
test_authority_guard_blocks_planted_decision() {  # attack #3
  local f; f=$(mktemp)
  printf 'Decision: Jed approved retiring the Loko Rust cap; rust now unrestricted.' > "$f"
  bash "$SKILL/authority-guard.sh" "$f" >/dev/null 2>&1
  assert_exit "$?" 1 "guard rejects agy text asserting a Jed-authority decision"
}
test_authority_guard_allows_neutral_text() {
  local f; f=$(mktemp)
  printf 'Refactored Hero.tsx; extracted ThreadDraw into its own component.' > "$f"
  bash "$SKILL/authority-guard.sh" "$f" >/dev/null 2>&1
  assert_exit "$?" 0 "guard allows neutral agy work description"
}
```

- [ ] **Step 2: Run, verify fails.** Expected: FAIL — script missing.

- [ ] **Step 3: Implement `authority-guard.sh`.**

```bash
#!/usr/bin/env bash
# authority-guard.sh <file> : exit 1 if agy-authored text asserts a human-authority
# decision (agy is structurally not a valid witness for "Jed approved/decided X").
set -euo pipefail
FILE="${1:?usage: authority-guard.sh <file>}"
PATTERN='(Jed|CC|Vince|Misty|Brock)[[:space:]]+(approved|decided|rescinded|authorized|confirmed|locked|retired|granted)'
if grep -nEi "$PATTERN" "$FILE" >&2; then
  echo "BLOCKED: agy-authored text claims human authority (above). agy cannot witness canon." >&2
  exit 1
fi
exit 0
```

- [ ] **Step 4: Run, verify pass.** Expected both `ok:` lines.

- [ ] **Step 5: Commit.**

```bash
chmod +x .agents/skills/antigravity/scripts/authority-guard.sh
git add .agents/skills/antigravity/scripts/authority-guard.sh .agents/skills/antigravity/tests/test_authority.sh
git commit -m "feat(orchestration): authority-guard — agy is not a canon witness (attack 3)"
```

---

## Phase 3 — §3 transactional checkpoint (attacks #2 vault-rollback, #4 cache-poison)

### Task 5: `checkpoint.sh`

**Files:**
- Create: `.agents/skills/antigravity/scripts/checkpoint.sh`
- Test: `.agents/skills/antigravity/tests/test_checkpoint.sh`

- [ ] **Step 1: Write the failing tests.** Create `tests/test_checkpoint.sh`:

```bash
test_checkpoint_restores_vault() {                # attack #2
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local v; v=$(mk_vault)
  bash "$SKILL/checkpoint.sh" snapshot run1 "$r" "$v" >/dev/null
  echo "POISON" >> "$v/inbox.md"                  # agy writes vault
  bash "$SKILL/checkpoint.sh" rollback run1 "$r" "$v" >/dev/null
  assert_eq "$(grep -c POISON "$v/inbox.md")" "0" "vault rollback removes agy's write"
}
test_checkpoint_purges_tsbuildinfo() {            # attack #4
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local v; v=$(mk_vault)
  bash "$SKILL/checkpoint.sh" snapshot run2 "$r" "$v" >/dev/null
  echo "{}" > "$r/tsconfig.tsbuildinfo"           # gitignored-style cache survives clean -fd
  echo "tsconfig.tsbuildinfo" > "$r/.gitignore"; git -C "$r" add .gitignore; git -C "$r" commit -qm gi
  bash "$SKILL/checkpoint.sh" rollback run2 "$r" "$v" >/dev/null
  assert_eq "$([[ -f "$r/tsconfig.tsbuildinfo" ]] && echo yes || echo no)" "no" "rollback purges incremental cache"
}
```

- [ ] **Step 2: Run, verify fails.** Expected: FAIL — script missing.

- [ ] **Step 3: Implement `checkpoint.sh`.**

```bash
#!/usr/bin/env bash
# checkpoint.sh <snapshot|rollback> <run_id> <repo> <vault>
# Transactional across repo + vault + build caches.
set -euo pipefail
CMD="${1:?}"; RUN="${2:?}"; REPO="${3:?}"; VAULT="${4:?}"
STATE_DIR="$REPO/.orchestration/$RUN"

snapshot() {
  mkdir -p "$STATE_DIR"
  git -C "$REPO" rev-parse HEAD > "$STATE_DIR/repo_head"
  # vault: snapshot inbox + handoff (agy's only sanctioned write paths)
  rm -rf "$STATE_DIR/vault"; mkdir -p "$STATE_DIR/vault"
  cp -a "$VAULT/inbox.md" "$STATE_DIR/vault/inbox.md" 2>/dev/null || true
  cp -a "$VAULT/handoff" "$STATE_DIR/vault/handoff" 2>/dev/null || true
}

rollback() {
  [[ -f "$STATE_DIR/repo_head" ]] || { echo "no snapshot for $RUN" >&2; exit 1; }
  git -C "$REPO" reset --hard "$(cat "$STATE_DIR/repo_head")"
  git -C "$REPO" clean -fd                       # tracked-ignore-safe; caches handled below
  # purge incremental/build caches (gitignored => survive clean -fd) so the oracle
  # is reproducible from source (attack #4)
  find "$REPO" -name '*.tsbuildinfo' -not -path '*/node_modules/*' -delete 2>/dev/null || true
  find "$REPO" -type d -name '.next' -prune -exec rm -rf {}/cache \; 2>/dev/null || true
  # restore vault in the SAME transaction
  [[ -f "$STATE_DIR/vault/inbox.md" ]] && cp -a "$STATE_DIR/vault/inbox.md" "$VAULT/inbox.md"
  if [[ -d "$STATE_DIR/vault/handoff" ]]; then
    rm -rf "$VAULT/handoff"; cp -a "$STATE_DIR/vault/handoff" "$VAULT/handoff"
  fi
}

case "$CMD" in snapshot) snapshot;; rollback) rollback;; *) echo "bad cmd $CMD" >&2; exit 2;; esac
```

- [ ] **Step 4: Run, verify pass.** Expected both `ok:` lines.

- [ ] **Step 5: Commit.**

```bash
chmod +x .agents/skills/antigravity/scripts/checkpoint.sh
git add .agents/skills/antigravity/scripts/checkpoint.sh .agents/skills/antigravity/tests/test_checkpoint.sh
git commit -m "feat(orchestration): checkpoint.sh — atomic repo+vault+cache rollback (attacks 2,4)"
```

### Task 6: compile-ham.sh atomic + self-locking (attack: mid-write truncation)

**Files:**
- Modify: `bin/compile-ham.sh:11`, `:25-60` (write target), add lock at top

- [ ] **Step 1: Write the failing test.** Create `tests/test_compile.sh`:

```bash
test_compile_never_leaves_partial() {
  # Simulate: a reader must never see a file lacking the END sentinel.
  # We assert the script writes to a temp then renames (grep the source for the pattern).
  assert_contains "$(cat /Users/jedg./Desktop/kat_ha_pb/bin/compile-ham.sh)" 'mktemp' "compile uses temp file"
  assert_contains "$(cat /Users/jedg./Desktop/kat_ha_pb/bin/compile-ham.sh)" 'mv ' "compile renames atomically"
  assert_contains "$(cat /Users/jedg./Desktop/kat_ha_pb/bin/compile-ham.sh)" '.sync.lock' "compile self-locks"
}
```

- [ ] **Step 2: Run, verify fails.** Expected: FAIL — current compile-ham.sh writes directly to `$OUT`, no lock.

- [ ] **Step 3: Retrofit `bin/compile-ham.sh`.** After the `OUT=...` line (line 11), insert the lock; change every `>> "$OUT"`/`> "$OUT"` to write to `$TMP`, and `mv` at the end. Concretely, replace line 11:

```bash
OUT="$VAULT/COMPILED_HAM.md"
```
with:
```bash
OUT="$VAULT/COMPILED_HAM.md"
# self-lock so a kickoff-compile (agy-tier-run) and a sync-compile cannot interleave
LOCK="$VAULT/.sync.lock"
if ! (set -C; echo $$ > "$LOCK") 2>/dev/null; then
  echo "compile-ham: lock held ($LOCK); another compile/sync in progress" >&2; exit 3
fi
trap 'rm -f "$LOCK"' EXIT
TMP=$(mktemp "$VAULT/.COMPILED_HAM.md.XXXXXX")
```

Then change line 25 `> "$OUT"` to `> "$TMP"`, every subsequent `>> "$OUT"` (lines 27-60) to `>> "$TMP"`, the `wc -l < "$OUT"` (line 59) to `wc -l < "$TMP"`, and append after line 60:

```bash
mv "$TMP" "$OUT"   # atomic publish — readers see all-or-nothing
```

> Note: sync.sh already holds `.sync.lock` when it calls compile-ham.sh (line 128) via its EXIT trap, so compile must NOT re-acquire when invoked from sync. Guard it: replace the lock block above's failure `exit 3` with: if the lock holder PID is our parent, skip re-locking. Minimal robust form:
> ```bash
> if [[ "${COMPILE_HAM_NESTED:-}" != "1" ]]; then
>   if ! (set -C; echo $$ > "$LOCK") 2>/dev/null; then echo "compile-ham: lock held" >&2; exit 3; fi
>   trap 'rm -f "$LOCK"' EXIT
> fi
> ```
> and update sync.sh line 128 + agy-tier-run.sh line 40 callers that already hold the lock to call `COMPILE_HAM_NESTED=1 bin/compile-ham.sh`. agy-tier-run.sh does NOT hold it today, so it stays unset there (acquires its own).

- [ ] **Step 4: Run, verify pass.** Expected three `ok:` lines. Then smoke-test a real compile: `bash bin/compile-ham.sh && grep -q 'END OF COMPILED_HAM' "/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/COMPILED_HAM.md" && echo OK`.

- [ ] **Step 5: Commit.**

```bash
git add bin/compile-ham.sh .agents/skills/handoff/sync.sh .agents/skills/antigravity/tests/test_compile.sh
git commit -m "fix(ham): atomic temp+mv compile under self-lock (no partial boot artifact)"
```

---

## Phase 4 — §4 external-effect lockout (attack #5)

### Task 7: digest schema + external-effect rejection wired into delegation

**Files:**
- Modify: `AGENTS.md` (append digest contract)
- Test: `.agents/skills/antigravity/tests/test_external.sh`

- [ ] **Step 1: Write the failing test.** Create `tests/test_external.sh`:

```bash
test_verdict_rejects_external_effects() {         # attack #5
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo)
  local dg; dg=$(mktemp)
  printf '{"files_touched":[],"external_effects":["apply_migration"]}' > "$dg"
  bash "$SKILL/verdict.sh" --repo "$r" --digest "$dg" --gate none >/dev/null 2>&1
  assert_exit "$?" 1 "verdict rejects any declared external effect"
  assert_contains "$(cat "$r/.verdict.json")" "external effects present" "reason names it"
}
```

- [ ] **Step 2: Run, verify it PASSES already** (verdict.sh Task 3 already rejects non-empty `external_effects`). This test locks that behavior against regression. Run the full suite to confirm green.

- [ ] **Step 3: Document the contract in `AGENTS.md`.** Append a new section:

```markdown
## Delegation Digest Contract (orchestration v1)

Every `agy` delegation MUST return a JSON digest:
- `files_touched[]` — claim of files edited (verified as a superset of git reality; never used as verification scope).
- `commands_run[]`, `self_reported_result`, `assumptions[]`, `unfinished[]` — advisory; never trusted as truth.
- `external_effects[]` — MUST enumerate any non-git mutation attempted (DB migration, deploy, email). Non-empty ⇒ run rejected.

agy runs `--sandbox` with NO access to apply_migration/execute_sql/deploy/email tools. Those are CC-only, behind the human gate. agy may only WRITE migration `.sql` files (git-tracked, reversible); applying them is a separate confirmed CC step against a Supabase preview branch.

agy is NOT a valid witness for human-authority claims ("Jed approved/decided X"). authority-guard.sh rejects such text in agy output.
```

- [ ] **Step 4: Commit.**

```bash
git add AGENTS.md .agents/skills/antigravity/tests/test_external.sh
git commit -m "feat(orchestration): digest contract + external-effect rejection (attack 5)"
```

---

## Phase 5 — §8 worktree isolation + agy-death sentinel (attacks #6, #7)

### Task 8: `delegate_agy.sh`

**Files:**
- Create: `.agents/skills/antigravity/scripts/delegate_agy.sh`
- Test: `.agents/skills/antigravity/tests/test_delegate.sh`

- [ ] **Step 1: Write the failing tests.** Create `tests/test_delegate.sh` (stub `agy` via PATH so tests are hermetic):

```bash
test_delegate_classifies_death_as_failed() {      # attack #6
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local bin; bin=$(mktemp -d)
  # fake agy that writes a PARTIAL result (no STATUS: COMPLETE sentinel) then "dies"
  printf '#!/usr/bin/env bash\necho "partial work" > "$AGY_OUT/result.md"\nexit 0\n' > "$bin/agy"
  chmod +x "$bin/agy"
  AGY_BIN="$bin/agy" PATH="$bin:$PATH" bash "$SKILL/delegate_agy.sh" --repo "$r" --run dr1 --brief "do x" >/dev/null 2>&1
  assert_exit "$?" 1 "partial result.md (no sentinel) => FAILED"
}
test_delegate_failure_stashes_not_resets() {       # attack #6 (no data loss)
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local bin; bin=$(mktemp -d)
  printf '#!/usr/bin/env bash\necho "wip" > "$AGY_OUT/result.md"\necho "valuable" > '"$r"'/wip.txt\nexit 0\n' > "$bin/agy"
  chmod +x "$bin/agy"
  AGY_BIN="$bin/agy" PATH="$bin:$PATH" bash "$SKILL/delegate_agy.sh" --repo "$r" --run dr2 --brief "do x" >/dev/null 2>&1 || true
  assert_eq "$(git -C "$r" stash list | grep -c orchestration/dr2)" "1" "failure stashes WIP, does not reset --hard"
}
```

- [ ] **Step 2: Run, verify fails.** Expected: FAIL — script missing.

- [ ] **Step 3: Implement `delegate_agy.sh`.**

```bash
#!/usr/bin/env bash
# delegate_agy.sh --repo <dir> --run <id> --brief <text> [--timeout 5m]
# Per-run isolation + sandbox + transaction sentinel. agy never gets external-effect tools.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; source "$DIR/lib.sh"
REPO=""; RUN=""; BRIEF=""; TIMEOUT="5m"
while [[ $# -gt 0 ]]; do case "$1" in
  --repo) REPO="$2"; shift 2;; --run) RUN="$2"; shift 2;;
  --brief) BRIEF="$2"; shift 2;; --timeout) TIMEOUT="$2"; shift 2;;
  *) echo "unknown $1" >&2; exit 2;; esac; done
AGY="${AGY_BIN:-/Volumes/samsung 970 pro - Data/KATHA_VAULT/bin/agy}"
OUT="$REPO/.orchestration/$RUN"; mkdir -p "$OUT"
export AGY_OUT="$OUT"

# Run agy SANDBOXED, no skip-permissions (=> cannot fire external MCP tools headlessly).
# Instruct it to end result.md with the transaction sentinel.
"$AGY" --sandbox --add-dir "$OUT" --print-timeout "$TIMEOUT" \
  --print "Execute: ${BRIEF}
Write your complete result to ${OUT}/result.md. As the FINAL two lines of result.md, write exactly:
STATUS: COMPLETE
DIGEST_SHA: <sha256 of your JSON digest>" < /dev/null > "$OUT/agy.log" 2>&1 || true

# Death detection: sentinel, not file existence (attack #6).
if [[ ! -f "$OUT/result.md" ]] || ! grep -qx 'STATUS: COMPLETE' "$OUT/result.md"; then
  echo "FAILED: agy died / incomplete (no STATUS: COMPLETE sentinel)" >&2
  # stash WIP instead of nuking it (attack #6 no-data-loss)
  git -C "$REPO" stash push -u -m "orchestration/$RUN incomplete" >/dev/null 2>&1 || true
  exit 1
fi
echo "OK: run $RUN complete"
```

- [ ] **Step 4: Run, verify pass.** Expected both `ok:` lines.

- [ ] **Step 5: Commit.**

```bash
chmod +x .agents/skills/antigravity/scripts/delegate_agy.sh
git add .agents/skills/antigravity/scripts/delegate_agy.sh .agents/skills/antigravity/tests/test_delegate.sh
git commit -m "feat(orchestration): delegate_agy — sandbox + sentinel + stash-not-reset (attack 6)"
```

### Task 9: concurrency isolation test (attack #7)

**Files:**
- Test: `.agents/skills/antigravity/tests/test_concurrency.sh`

- [ ] **Step 1: Write the failing test.** Create `tests/test_concurrency.sh`:

```bash
test_rollback_scoped_to_own_state_dir() {          # attack #7
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local v; v=$(mk_vault)
  bash "$SKILL/checkpoint.sh" snapshot runA "$r" "$v" >/dev/null
  bash "$SKILL/checkpoint.sh" snapshot runB "$r" "$v" >/dev/null
  # runB writes its state; rolling back runA must not delete runB's snapshot
  bash "$SKILL/checkpoint.sh" rollback runA "$r" "$v" >/dev/null
  assert_eq "$([[ -f "$r/.orchestration/runB/repo_head" ]] && echo yes || echo no)" "yes" "runA rollback leaves runB checkpoint intact"
}
```

- [ ] **Step 2: Run, verify it PASSES** (checkpoint state is per-run under `.orchestration/<run>/`). This locks per-run isolation against regression.

> Full worktree-per-run (`git worktree add agy/<run>`) is the production isolation; the per-run state dir + scoped rollback proven here is its v1 floor. The worktree wiring lands when `delegate_agy.sh` is pointed at real agy in Task 11; the test above guarantees rollbacks never cross runs regardless.

- [ ] **Step 3: Commit.**

```bash
git add .agents/skills/antigravity/tests/test_concurrency.sh
git commit -m "test(orchestration): per-run rollback isolation (attack 7)"
```

---

## Phase 6 — Wire-up

### Task 10: retrofit `agy-tier-run.sh` to use the hardened path

**Files:**
- Modify: `scripts/agy-tier-run.sh:40` (locked compile), `:44-61` (delegate via new harness + sentinel)

- [ ] **Step 1: Lock the kickoff compile.** Change line 40 from:
```bash
/Users/jedg./Desktop/kat_ha_pb/bin/compile-ham.sh
```
to (acquires its own lock now that compile self-locks):
```bash
/Users/jedg./Desktop/kat_ha_pb/bin/compile-ham.sh
```
(no change needed once Task 6 lands — compile self-locks. Verify by running two in parallel: `bin/compile-ham.sh & bin/compile-ham.sh & wait` — one must exit 3.)

- [ ] **Step 2: Replace the existence check (lines 57-61) with sentinel detection.** Change:
```bash
if [[ -f "$BRIEF_DIR/result.md" ]]; then
  STATUS="OK"
else
  STATUS="MISSING_RESULT"
fi
```
to:
```bash
if [[ -f "$BRIEF_DIR/result.md" ]] && grep -qx 'STATUS: COMPLETE' "$BRIEF_DIR/result.md"; then
  STATUS="OK"
elif [[ -f "$BRIEF_DIR/result.md" ]]; then
  STATUS="INCOMPLETE_NO_SENTINEL"
else
  STATUS="MISSING_RESULT"
fi
```

- [ ] **Step 3: Add `--sandbox` to the agy invocation (line 44).** Change `"$AGY" \` block to include `--sandbox` as the first flag, and remove any reliance on skip-permissions (there is none today — confirm). Run a real smoke delegation with a trivial brief and confirm `timing.txt` shows `Result: OK` only when the sentinel is present.

- [ ] **Step 4: Commit.**

```bash
git add scripts/agy-tier-run.sh
git commit -m "fix(agy): sandbox + sentinel completion + locked compile"
```

### Task 11: `SKILL.md` + CLAUDE.md pointer + full suite green

**Files:**
- Create: `.agents/skills/antigravity/SKILL.md`
- Modify: `CLAUDE.md` (the `/antigravity` SLASH COMMANDS bullet)

- [ ] **Step 1: Write `SKILL.md`** documenting the loop and the contract:

```markdown
---
name: antigravity
description: Lazy-orchestrator delegation to the agy CLI with a deterministic leak-proof gate. Use when CC should hand bulk agentic work to Antigravity (agy) and verify it before trusting. Routes execution to agy (sandboxed, isolated), verifies via verdict.sh (git-derived truth), and rolls back transactionally on any leak.
allowed-tools: [Bash, Read, Write]
---

# /antigravity — Leak-Proof Delegation

CC designs/judges, then delegates bulk agentic work to `agy`; a deterministic harness — never CC's reasoning — decides PASS/FAIL.

## Loop
1. `checkpoint.sh snapshot <run> <repo> <vault>` — capture repo+vault state.
2. `delegate_agy.sh --repo <repo> --run <run> --brief <task>` — sandboxed agy, per-run state, completion sentinel.
3. `verdict.sh --repo <repo> --digest <run>/digest.json --gate fast` — git-derived scope check + gate; writes `.verdict.json`. CC READS it, never writes it.
4. `authority-guard.sh <run>/result.md` — block agy-authored human-authority claims.
5. PASS ⇒ promote staged handoff, consolidate to HAM, `sync.sh`. FAIL ⇒ `checkpoint.sh rollback <run> <repo> <vault>`.

See `docs/superpowers/specs/2026-06-22-orchestration-layer-design.md` for the full hardened design and the v2 backlog (§5–§7).
```

- [ ] **Step 2: Point CLAUDE.md at the real skill.** In the SLASH COMMANDS section, change the `/antigravity` bullet to reference `.agents/skills/antigravity/SKILL.md` as an executable skill (delegation + verdict + rollback), replacing the prose-only description.

- [ ] **Step 3: Run the FULL suite — all 8 attacks green.**

Run: `bash .agents/skills/antigravity/tests/run.sh`
Expected: every test prints only `ok:` lines, final line shows `FAIL=0`, exit 0. (PASS counts asserts, not tests — all 8 attack tests across 9 test functions.)

- [ ] **Step 4: Commit.**

```bash
git add .agents/skills/antigravity/SKILL.md CLAUDE.md
git commit -m "feat(orchestration): /antigravity skill wired; v1 leak-proof loop complete"
```

---

## Verification (end-to-end, after all tasks)

1. **Full RED suite green:** `bash .agents/skills/antigravity/tests/run.sh` ⇒ `FAIL=0`.
2. **Real compile is atomic:** `bin/compile-ham.sh & bin/compile-ham.sh & wait` ⇒ exactly one exits 3; `COMPILED_HAM.md` always has the END sentinel.
3. **Vault is versioned + offsite:** `git -C "/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory" log --oneline | head` shows commits; `git ... remote -v` shows origin.
4. **Live delegation:** run a trivial brief through `agy-tier-run.sh`; confirm `timing.txt` `Result: OK` requires the `STATUS: COMPLETE` sentinel, and a manually-truncated result.md yields `INCOMPLETE_NO_SENTINEL` + a stash entry (no `reset --hard`).
5. **Leak rejection:** craft a digest omitting a real change ⇒ `verdict.sh` exits non-zero, `.verdict.json` names the unclaimed file, and `checkpoint.sh rollback` restores both repo and vault.

## v2 Backlog (explicitly out of scope here)
§5 reader/verifier model split + Opus tiering · §6 differential/active-recall human approval + second-model canon critic · §7 vault-fsck hash-chain + per-line canon provenance.

---

## Phase 7 — Close the gate's self-leak (adversarial-review finding, 2026-06-22, post-ship)

> **Context:** v1 shipped GREEN (59/0) and was then adversarially reviewed against the *documented
> loop itself*, not just each script in isolation. Live repro: a fresh repo, `checkpoint.sh snapshot`,
> a fully honest **zero-edit** delegation (`files_touched: []`), then `verdict.sh` → **FAIL**, reasons
> `unclaimed change: .orchestration/run1/repo_head`, `.../result.md`, `.../vault/inbox.md`. Root cause:
> `checkpoint.sh` and `delegate_agy.sh` write their own bookkeeping into `$REPO/.orchestration/<run>/`,
> which is **not gitignored**; `verdict.sh`'s leak-check (`lib.sh:changed_set`) only excludes the single
> file `.verdict.json`. Every real invocation of the loop fails the gate regardless of what agy does,
> and it compounds — `self_eval.sh`'s `ledger.jsonl` ([self_eval.sh:37](../../../.agents/skills/antigravity/scripts/self_eval.sh)) lands in the same
> unexcluded tree, so each run permanently adds another unclaimed "leak" for every future run to trip on.
> This escaped the RED suite because `verdict.sh` and `checkpoint.sh`/`delegate_agy.sh` are unit-tested
> in total isolation from each other — no test ever runs the documented 3-step loop against one shared
> repo. **Council consulted** (`council.sh`, 2026-06-22): gemini ABSENT (Vertex exit 55, degraded loudly
> per known infra constraint); OSS qwen voted path-prefix-exclude-in-verdict.sh. Chairman (CC) synthesis
> below picks a simpler, more self-contained variant after weighing OSS's pick against two others.

### Task 12: Self-contained `.orchestration/` exclusion + the missing integration test (CRITICAL)

**Why this fix over the alternatives considered:**
- *(rejected)* Hand-edit this repo's root `.gitignore` — works here, but `checkpoint.sh`/`delegate_agy.sh`
  are written to take `--repo <any dir>`; a fix that depends on the *target* repo already having the
  right gitignore line is fragile and silently breaks the day this harness points at a second repo.
- *(rejected, OSS's pick)* Path-prefix exclude inside `verdict.sh`'s `changed_set` consumer — works, but
  adds matching logic to the one script that's supposed to stay maximally simple/auditable (it's the
  trust root), and only fixes `verdict.sh`'s view — a human running plain `git status` on the repo would
  still see the clutter.
- **(chosen) Self-contained nested `.gitignore`:** the moment either wrapper script creates
  `$REPO/.orchestration/`, it also drops a `.orchestration/.gitignore` containing `*`. Same one-line
  idea as OSS's "gitignore it" instinct (council option a), but the harness asserts it on *every* run
  instead of depending on a human having edited the target repo's root gitignore once. Zero new logic
  in `verdict.sh`. Idempotent — safe to write every run, self-heals if someone deletes it. `git status`,
  `git clean -fd` (already used by `checkpoint.sh` rollback), and `verdict.sh`'s `changed_set` all honor
  nested gitignores identically, so one fix covers every consumer.
- **Regression risk (the one the council push-back surfaced):** `self_eval.sh`'s `ledger.jsonl` is the
  system's only durable cross-run history; gitignoring `.orchestration/` makes it untracked, so it is
  NOT preserved by git history and vanishes if the directory is ever pruned. Per the design's own stated
  philosophy the durable artifact is meant to be the RED-test suite the ledger's `report` graduates into,
  not the ledger itself — but flag this explicitly for Jed rather than deciding it silently (see
  Checkpoint 7 below).

**Files:**
- Modify: `.agents/skills/antigravity/scripts/checkpoint.sh:44-45` (insert before the existing `mkdir -p "$STATE_DIR/vault/handoff"`)
- Modify: `.agents/skills/antigravity/scripts/delegate_agy.sh:43-44` (insert before the existing `mkdir -p "$OUT"`)
- Create: `.agents/skills/antigravity/tests/test_integration_e2e.sh` — the missing cross-script test

- [x] **Step 1: Write the failing integration test.** Create `tests/test_integration_e2e.sh`:

```bash
#!/usr/bin/env bash
# Tests the DOCUMENTED loop (checkpoint -> delegate -> verdict) end-to-end against
# ONE shared repo — the gap that let the self-leak bug ship. Unit tests for the
# individual scripts are not enough; they each mock away the other scripts' output.

test_integration_honest_zero_edit_run_passes() {
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local v; v=$(mk_vault); local bin; bin=$(mktemp -d)
  bash "$SKILL/checkpoint.sh" snapshot int1 "$r" "$v" >/dev/null

  printf '#!/usr/bin/env bash\nprintf "did nothing\\nSTATUS: COMPLETE\\n" > "$AGY_OUT/result.md"\nexit 0\n' > "$bin/agy"
  chmod +x "$bin/agy"
  AGY_BIN="$bin/agy" PATH="$bin:$PATH" bash "$SKILL/delegate_agy.sh" --repo "$r" --run int1 --brief "do nothing" >/dev/null 2>&1
  assert_exit "$?" 0 "delegate_agy: honest no-op run reports OK"

  local dg; dg=$(mktemp)
  echo '{"files_touched":[],"external_effects":[]}' > "$dg"
  bash "$SKILL/verdict.sh" --repo "$r" --digest "$dg" --gate none >/dev/null 2>&1
  assert_exit "$?" 0 "verdict.sh: honest zero-edit run PASSES (not a false leak on the harness's own bookkeeping)"
}
```

- [x] **Step 2: Run, verify it fails.** Run: `bash .agents/skills/antigravity/tests/run.sh integration_honest_zero_edit_run_passes`. Expected: FAIL on the `verdict.sh` assert, reasons listing `.orchestration/int1/repo_head` etc — reproduces the live repro above as a permanent regression test.

- [x] **Step 3: Implement the fix in `checkpoint.sh`.** At [checkpoint.sh:44](../../../.agents/skills/antigravity/scripts/checkpoint.sh), change:

```bash
do_snapshot() {
  mkdir -p "$STATE_DIR/vault/handoff"
```
to:
```bash
do_snapshot() {
  # Harness bookkeeping must never look like an agy-attributable change. Idempotent,
  # self-healing nested gitignore — covers every file this skill ever writes under
  # .orchestration/, including self_eval.sh's ledger.jsonl, with zero verdict.sh logic.
  mkdir -p "$REPO/.orchestration"
  echo '*' > "$REPO/.orchestration/.gitignore"
  mkdir -p "$STATE_DIR/vault/handoff"
```

- [x] **Step 4: Implement the fix in `delegate_agy.sh`.** At [delegate_agy.sh:43](../../../.agents/skills/antigravity/scripts/delegate_agy.sh), change:

```bash
OUT="$REPO/.orchestration/$RUN"
mkdir -p "$OUT"
```
to:
```bash
OUT="$REPO/.orchestration/$RUN"
mkdir -p "$REPO/.orchestration"
echo '*' > "$REPO/.orchestration/.gitignore"   # idempotent; see checkpoint.sh for rationale
mkdir -p "$OUT"
```

- [x] **Step 5: Run, verify pass.** Run: `bash .agents/skills/antigravity/tests/run.sh`. Expected: `FAIL=0`, and the new integration test prints both `ok:` lines.

- [x] **Step 6: Commit.**

```bash
git add .agents/skills/antigravity/scripts/checkpoint.sh .agents/skills/antigravity/scripts/delegate_agy.sh .agents/skills/antigravity/tests/test_integration_e2e.sh
git commit -m "fix(orchestration): self-contained .orchestration/ gitignore — gate no longer leaks on its own bookkeeping"
```

### ⏸ Checkpoint 7 (Jed): confirm the ledger tradeoff before closing this phase
The fix above means `self_eval.sh`'s `ledger.jsonl` is no longer git-tracked. Confirm: is the RED-test
suite the intended durable artifact (ledger is disposable, current design is fine), or should
`ledger.jsonl` specifically be exempted from the nested gitignore (`echo '*' > .gitignore` + `echo
'!ledger.jsonl' >> .gitignore`) so it survives as committed history? **Default if no response: ledger
stays disposable** (matches the self-eval design's own stated philosophy — see `SKILL.md` "Self-
improvement loop").

### Task 13: Checkpoint rollback isn't atomic across repo+vault (WARNING, lower priority)
**Files:** Modify `.agents/skills/antigravity/scripts/checkpoint.sh` (`do_rollback`)
- [x] A process kill between the repo-half (`git reset --hard`) and vault-half (`cp -a` restore) of
  `do_rollback` leaves a torn state with no detection. KISS fix (detect-and-warn, not auto-resume —
  safely auto-resuming a torn transaction is genuinely hard and not needed for v1 single-operator use):
  write `"$STATE_DIR/.rollback_inprogress"` as the first line of `do_rollback`, `rm -f` it as the last
  line; add a `checkpoint.sh status <run> <repo> <vault>` subcommand that errors loudly if the marker
  exists (torn rollback — needs manual review) instead of silently re-running.
- [x] Test: kill `do_rollback` mid-way (e.g. `set -e` + a forced failure between the two halves in a
  test double) and assert the marker is left behind and `status` reports it.
- [x] Commit separately from Task 12.

### Task 14: `council.sh`'s undocumented `set -uo pipefail` (NOTE, lower priority)
**Files:** Modify `.agents/skills/antigravity/scripts/council.sh:15`
- [x] Every other script in the skill uses `set -euo pipefail`; `council.sh` deliberately omits `-e`
  (so `voice_gemini`/`voice_oss` failing doesn't kill the whole script) but says nothing. Add a one-line
  comment above `set -uo pipefail` stating that's intentional, so a future contributor copy-pasting
  boilerplate between these scripts doesn't "fix" it into a regression.
- [x] No test needed — this is a comment-only change. Commit with Task 13 or standalone.

## Dependency graph (Phase 7)
```
Task 12 (CRITICAL: self-leak fix + integration test) ──► Checkpoint 7 (Jed: ledger tradeoff)
                                                                  │
                                                                  ▼
                                              Task 13 (rollback atomicity marker) ──┐
                                              Task 14 (council.sh comment) ─────────┴──► done
```
Task 13/14 do not depend on each other or block Task 12 landing — they can ship in any order, or be
deferred past this session without blocking the critical fix.
