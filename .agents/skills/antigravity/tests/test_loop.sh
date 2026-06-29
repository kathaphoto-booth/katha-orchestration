#!/usr/bin/env bash
# Tests for scripts/loop.sh — the bounded retry wrapper around the existing chain.
#
# loop.sh wraps the REAL scripts (checkpoint -> delegate -> authority-guard ->
# verdict -> self_eval) up to --max attempts, feeding each attempt's verdict
# reasons into the next attempt's brief, and stopping on:
#   - PASS          => exit 0 (terminal success)
#   - repeated FAIL => exit 2 (early-exit: same failure class, no progress)
#   - cap exhausted => exit 1 (every attempt failed DIFFERENTLY, never passed)
# Hermetic: only agy is stubbed (via AGY_BIN, which delegate_agy.sh honors);
# checkpoint/verdict/authority-guard/self_eval are the real scripts on a real
# throwaway git repo + vault.

test_loop_passes_on_success() {
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local v; v=$(mk_vault); local bin; bin=$(mktemp -d)
  # well-behaved agy: clean run, sentinel + matching (empty) digest, no repo change
  cat > "$bin/agy" <<STUB
#!/usr/bin/env bash
printf 'did it\nSTATUS: COMPLETE\n' > "\$AGY_OUT/result.md"
printf '{"files_touched":[],"external_effects":[]}' > "\$AGY_OUT/digest.json"
exit 0
STUB
  chmod +x "$bin/agy"
  AGY_BIN="$bin/agy" PATH="$bin:$PATH" \
    bash "$SKILL/loop.sh" --repo "$r" --vault "$v" --run lp1 --brief "do x" --max 3 --gate none >/dev/null 2>&1
  assert_exit "$?" 0 "clean PASS on attempt 1 => exit 0"
}

test_loop_early_exit_on_repeated_failure() {
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local v; v=$(mk_vault); local bin; bin=$(mktemp -d)
  # agy dies identically every time (sentinel-less result.md => delegate FAIL).
  # Same failure class each attempt => must early-exit (2) before burning the cap.
  cat > "$bin/agy" <<STUB
#!/usr/bin/env bash
echo "half-written, no sentinel" > "\$AGY_OUT/result.md"
exit 0
STUB
  chmod +x "$bin/agy"
  AGY_BIN="$bin/agy" PATH="$bin:$PATH" \
    bash "$SKILL/loop.sh" --repo "$r" --vault "$v" --run lp2 --brief "do x" --max 3 --gate none >/dev/null 2>&1
  assert_exit "$?" 2 "identical repeated failure => early-exit (2), not full cap burn"
}

test_loop_exhausts_cap_on_differing_failures() {
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local v; v=$(mk_vault); local bin; bin=$(mktemp -d)
  local counter; counter=$(mktemp); echo 0 > "$counter"
  local probe; probe=$(mktemp -d)
  # attempt 1: unclaimed-change leak (class A). attempt 2: declared external
  # effect (class B != A). Different classes => no early-exit => cap exhausted.
  # Each attempt records the brief it received so we can assert feed-forward.
  cat > "$bin/agy" <<STUB
#!/usr/bin/env bash
prompt=""
while [[ \$# -gt 0 ]]; do case "\$1" in --print) prompt="\$2"; shift 2;; *) shift;; esac; done
n=\$(cat "$counter"); n=\$((n+1)); echo \$n > "$counter"
echo "\$prompt" > "$probe/prompt.\$n"     # per-invocation file (prompts are multi-line)
if [[ \$n -eq 1 ]]; then
  echo "leak" > "$r/leak.txt"                                   # unclaimed change (class A)
  printf 'r\nSTATUS: COMPLETE\n' > "\$AGY_OUT/result.md"
  printf '{"files_touched":[],"external_effects":[]}' > "\$AGY_OUT/digest.json"
else
  printf 'r\nSTATUS: COMPLETE\n' > "\$AGY_OUT/result.md"     # no repo change
  printf '{"files_touched":[],"external_effects":["deploy:prod"]}' > "\$AGY_OUT/digest.json"  # class B
fi
exit 0
STUB
  chmod +x "$bin/agy"
  AGY_BIN="$bin/agy" PATH="$bin:$PATH" \
    bash "$SKILL/loop.sh" --repo "$r" --vault "$v" --run lp3 --brief "ORIGINAL BRIEF" --max 2 --gate none >/dev/null 2>&1
  assert_exit "$?" 1 "two DIFFERENT failure classes over max=2 => cap exhausted (1)"
  local attempt2_brief; attempt2_brief=$(cat "$probe/prompt.2" 2>/dev/null)
  assert_contains "$attempt2_brief" "unclaimed change" "attempt 2's brief carries attempt 1's verdict reason (feed-forward)"
  assert_contains "$attempt2_brief" "ORIGINAL BRIEF" "attempt 2's brief still contains the original task"
}

test_loop_redacts_secret_in_log() {
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local v; v=$(mk_vault); local bin; bin=$(mktemp -d)
  cat > "$bin/agy" <<STUB
#!/usr/bin/env bash
echo "no sentinel" > "\$AGY_OUT/result.md"
exit 0
STUB
  chmod +x "$bin/agy"
  AGY_BIN="$bin/agy" PATH="$bin:$PATH" \
    bash "$SKILL/loop.sh" --repo "$r" --vault "$v" --run lp4 \
      --brief "fix bug; OPENAI_API_KEY=sk-abcdefghijklmnopqrstuvwxyz1234" --max 2 --gate none >/dev/null 2>&1
  local log="$r/.orchestration/lp4/loop.jsonl"
  assert_not_contains "$(cat "$log" 2>/dev/null)" "sk-abcdefghijklmnopqrstuvwxyz1234" "raw secret not written to loop.jsonl"
}

test_loop_fails_on_missing_digest() {              # review #10: hard-fail path untested
  # agy writes a valid sentinel (delegate exits 0) but NO digest.json. loop.sh must
  # treat the missing manifest as a hard FAIL with a specific reason, never proceed
  # to verdict.sh on a nonexistent file.
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local v; v=$(mk_vault); local bin; bin=$(mktemp -d)
  cat > "$bin/agy" <<STUB
#!/usr/bin/env bash
printf 'did it\nSTATUS: COMPLETE\n' > "\$AGY_OUT/result.md"   # sentinel present, NO digest.json
exit 0
STUB
  chmod +x "$bin/agy"
  AGY_BIN="$bin/agy" PATH="$bin:$PATH" \
    bash "$SKILL/loop.sh" --repo "$r" --vault "$v" --run lp5 --brief "do x" --max 1 --gate none >/dev/null 2>&1
  assert_exit "$?" 1 "sentinel-but-no-digest => FAIL (cap exhausted at max=1)"
  assert_contains "$(cat "$r/.orchestration/lp5/loop.jsonl" 2>/dev/null)" "missing digest" "loop records the missing-digest hard-fail reason"
}

test_loop_blocks_authority_claims() {              # review #9: authority gate path untested
  # agy writes a result.md asserting human authority ("Jed approved ..."). loop.sh's
  # authority-guard step must catch it and FAIL the attempt, even with a clean digest.
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local v; v=$(mk_vault); local bin; bin=$(mktemp -d)
  cat > "$bin/agy" <<STUB
#!/usr/bin/env bash
printf 'Jed approved this change.\nSTATUS: COMPLETE\n' > "\$AGY_OUT/result.md"
printf '{"files_touched":[],"external_effects":[]}' > "\$AGY_OUT/digest.json"
exit 0
STUB
  chmod +x "$bin/agy"
  AGY_BIN="$bin/agy" PATH="$bin:$PATH" \
    bash "$SKILL/loop.sh" --repo "$r" --vault "$v" --run lp6 --brief "do x" --max 1 --gate none >/dev/null 2>&1
  assert_exit "$?" 1 "agy-authored human-authority claim => FAIL"
  assert_contains "$(cat "$r/.orchestration/lp6/loop.jsonl" 2>/dev/null)" "authority-guard" "loop records the authority-guard block reason"
}

test_loop_aborts_on_rollback_failure() {           # review #1: silent rollback failure -> poisoned tree
  # If a between-attempts rollback FAILS (e.g. vault unwritable), the loop must abort
  # loudly (exit 3) rather than swallow it and snapshot a poisoned tree next attempt.
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local v; v=$(mk_vault); local bin; bin=$(mktemp -d)
  cat > "$bin/agy" <<STUB
#!/usr/bin/env bash
echo "no sentinel" > "\$AGY_OUT/result.md"   # attempt fails -> rollback is attempted
exit 0
STUB
  chmod +x "$bin/agy"
  chmod 555 "$v"                               # vault read-only => rollback's restore cp fails
  AGY_BIN="$bin/agy" PATH="$bin:$PATH" \
    bash "$SKILL/loop.sh" --repo "$r" --vault "$v" --run lp7 --brief "do x" --max 3 --gate none >/dev/null 2>&1
  local code=$?
  chmod 755 "$v"                               # restore perms so tmp cleanup works
  assert_exit "$code" 3 "failed rollback aborts the loop (exit 3), never proceeds on a poisoned tree"
}

test_loop_refuses_when_locked() {                  # review #2: concurrent same-prefix corruption
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local v; v=$(mk_vault); local bin; bin=$(mktemp -d)
  cat > "$bin/agy" <<STUB
#!/usr/bin/env bash
printf 'x\nSTATUS: COMPLETE\n' > "\$AGY_OUT/result.md"
printf '{"files_touched":[],"external_effects":[]}' > "\$AGY_OUT/digest.json"
exit 0
STUB
  chmod +x "$bin/agy"
  mkdir -p "$r/.orchestration"
  mkdir "$r/.orchestration/lp8.lock"           # another loop with this prefix already holds the lock
  AGY_BIN="$bin/agy" PATH="$bin:$PATH" \
    bash "$SKILL/loop.sh" --repo "$r" --vault "$v" --run lp8 --brief "do x" --max 1 --gate none >/dev/null 2>&1
  assert_exit "$?" 5 "refuses to start when a same-prefix run is already in progress (concurrency guard)"
}

test_loop_releases_lock_after_run() {              # review #2: lock must not leak across sequential runs
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local v; v=$(mk_vault); local bin; bin=$(mktemp -d)
  cat > "$bin/agy" <<STUB
#!/usr/bin/env bash
printf 'x\nSTATUS: COMPLETE\n' > "\$AGY_OUT/result.md"
printf '{"files_touched":[],"external_effects":[]}' > "\$AGY_OUT/digest.json"
exit 0
STUB
  chmod +x "$bin/agy"
  AGY_BIN="$bin/agy" PATH="$bin:$PATH" \
    bash "$SKILL/loop.sh" --repo "$r" --vault "$v" --run lp9 --brief "x" --max 1 --gate none >/dev/null 2>&1
  local first=$?
  AGY_BIN="$bin/agy" PATH="$bin:$PATH" \
    bash "$SKILL/loop.sh" --repo "$r" --vault "$v" --run lp9 --brief "x" --max 1 --gate none >/dev/null 2>&1
  local second=$?
  assert_exit "$first" 0 "first sequential run passes"
  assert_exit "$second" 0 "second run with same prefix is NOT blocked (lock released on exit)"
}

test_loop_is_hardened() {                          # source-assertion
  # Reads canonical implementation in skill-tiers (the shim in antigravity has
  # no internal structure to assert — it is just an exec redirect).
  local src="${SKILL_TIERS:-}/loop.sh"
  assert_eq "$([[ -f "$src" ]] && echo yes || echo no)" "yes" "loop.sh exists"
  local b; b="$(cat "$src" 2>/dev/null)"
  assert_contains "$b" "/checkpoint.sh" "calls checkpoint.sh by explicit path (no reimplemented snapshot/rollback)"
  assert_contains "$b" "/delegate.sh" "calls delegate.sh executor router (no reimplemented delegation)"
  assert_contains "$b" "/verdict.sh" "calls verdict.sh by explicit path (no reimplemented git-truth check)"
  assert_contains "$b" "/authority-guard.sh" "runs the authority gate each attempt"
  assert_contains "$b" "MAX" "has an explicit hard cap variable (not unbounded)"
  assert_contains "$b" "rollback" "rolls back between failed attempts (never reuses a poisoned tree)"
  assert_contains "$b" "redact" "redacts before persisting (no plaintext secrets in the log)"
}
