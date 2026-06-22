#!/usr/bin/env bash
# Tests for scripts/delegate_agy.sh — per-run isolation + agy-death sentinel.
#
# agy is stubbed via a fake binary on PATH (AGY_BIN) so these tests are
# hermetic: no real agy, no network, no MCP tools. The contract under test:
#   1. A result.md WITHOUT the `STATUS: COMPLETE` sentinel => the run is
#      classified FAILED (exit 1), even though agy exited 0 (attack #6:
#      agy-death must be detected by the transaction sentinel, not by mere
#      file existence — a half-written result.md still exists).
#   2. On failure, WIP must be PRESERVED via `git stash` (no `reset --hard`),
#      so a crashed delegation never silently destroys partial work.

test_delegate_classifies_death_as_failed() {       # attack #6
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local bin; bin=$(mktemp -d)
  # fake agy: writes a PARTIAL result (no STATUS: COMPLETE sentinel) then exits 0.
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

test_delegate_success_on_sentinel() {              # the happy path is real, too
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local bin; bin=$(mktemp -d)
  # fake agy writes a COMPLETE result with the sentinel as the final lines.
  printf '#!/usr/bin/env bash\nprintf "did the thing\\nSTATUS: COMPLETE\\n" > "$AGY_OUT/result.md"\nexit 0\n' > "$bin/agy"
  chmod +x "$bin/agy"
  AGY_BIN="$bin/agy" PATH="$bin:$PATH" bash "$SKILL/delegate_agy.sh" --repo "$r" --run dr3 --brief "do x" >/dev/null 2>&1
  assert_exit "$?" 0 "result.md with STATUS: COMPLETE sentinel => OK"
}

test_delegate_failure_stash_excludes_unrelated_untracked() {  # council finding #1: no sweep
  # The failure stash must preserve the delegation's OWN wip but must NOT sweep
  # pre-existing, unrelated untracked files (the live repo is full of them:
  # .council/, brand_assets/, ...). Scope the stash to the run's delta, not the tree.
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local bin; bin=$(mktemp -d)
  echo "PRE-EXISTING NOISE" > "$r/noise.txt"   # unrelated untracked file, present BEFORE the run
  printf '#!/usr/bin/env bash\necho "wip" > "$AGY_OUT/result.md"\necho "agy-made" > '"$r"'/agy_wip.txt\nexit 0\n' > "$bin/agy"
  chmod +x "$bin/agy"
  AGY_BIN="$bin/agy" PATH="$bin:$PATH" bash "$SKILL/delegate_agy.sh" --repo "$r" --run dr4 --brief "do x" >/dev/null 2>&1 || true
  assert_eq "$(git -C "$r" stash list | grep -c orchestration/dr4)" "1" "a stash was created for the failed run"
  assert_eq "$([[ -f "$r/noise.txt" ]] && echo present || echo gone)" "present" "pre-existing unrelated untracked file is NOT swept into the stash"
  assert_eq "$([[ -f "$r/agy_wip.txt" ]] && echo present || echo gone)" "gone" "the delegation's own wip WAS preserved (stashed out of the tree)"
}
