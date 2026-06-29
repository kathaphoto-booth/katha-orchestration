#!/usr/bin/env bash
# Regression lock for per-run rollback isolation (attack #7: concurrency).
# checkpoint.sh keeps each run's state under .orchestration/<run>/ and its
# rollback excludes .orchestration/ from `git clean -fd` — so rolling back one
# run must never delete a concurrent run's checkpoint. This does not introduce
# new behavior; it locks it against regression. Full git-worktree-per-run
# isolation is the production ceiling (deferred); this is its v1 floor.

test_rollback_scoped_to_own_state_dir() {          # attack #7
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local v; v=$(mk_vault)
  bash "$SKILL/checkpoint.sh" snapshot runA "$r" "$v" >/dev/null
  bash "$SKILL/checkpoint.sh" snapshot runB "$r" "$v" >/dev/null
  # runA rollback must not delete runB's checkpoint state.
  bash "$SKILL/checkpoint.sh" rollback runA "$r" "$v" >/dev/null
  assert_eq "$([[ -f "$r/.orchestration/runB/repo_head" ]] && echo yes || echo no)" "yes" "runA rollback leaves runB checkpoint intact"
}
