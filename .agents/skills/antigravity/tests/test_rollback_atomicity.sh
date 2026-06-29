#!/usr/bin/env bash
# Tests for checkpoint.sh's torn-transaction detection (Task 13).
# do_rollback restores repo state then vault state as two sequential halves;
# if the process dies between them, the repo is rolled back but the vault
# still holds the failed run's poisoned state, with no detection. The fix is
# a marker file written before the repo half starts and removed only after
# the vault half completes, plus a `status` subcommand that surfaces it.

test_rollback_atomicity_clean_after_normal_rollback() {
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local v; v=$(mk_vault)
  bash "$SKILL/checkpoint.sh" snapshot run_clean "$r" "$v" >/dev/null
  echo "agy edit" >> "$r/a.txt"
  bash "$SKILL/checkpoint.sh" rollback run_clean "$r" "$v" >/dev/null
  assert_eq "$([[ -f "$r/.orchestration/run_clean/.rollback_inprogress" ]] && echo present || echo gone)" "gone" \
    "marker is removed after a normal rollback completes"
  bash "$SKILL/checkpoint.sh" status run_clean "$r" "$v" >/dev/null 2>&1
  assert_exit "$?" 0 "status reports clean (exit 0) after a normal rollback"
}

test_rollback_atomicity_detects_torn_rollback() {
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local v; v=$(mk_vault)
  bash "$SKILL/checkpoint.sh" snapshot run_torn "$r" "$v" >/dev/null
  # Simulate a rollback that was killed after writing its marker but before
  # finishing the vault half — i.e. exactly what do_rollback would have left
  # behind had it died mid-transaction. We do NOT invoke a real interrupted
  # rollback (bash has no clean way to SIGKILL itself mid-function from
  # within the same test process); instead we reproduce the artifact a real
  # interruption leaves: the marker file present, at the exact path
  # do_rollback writes it, with no corresponding cleanup having run.
  touch "$r/.orchestration/run_torn/.rollback_inprogress"
  local rc
  bash "$SKILL/checkpoint.sh" status run_torn "$r" "$v" >/dev/null 2>/tmp/rollback_atomicity_stderr.$$
  rc=$?
  assert_exit "$rc" 1 "status detects a torn rollback marker and exits 1"
  assert_contains "$(cat /tmp/rollback_atomicity_stderr.$$)" "torn" "status stderr names the torn/incomplete rollback"
  rm -f /tmp/rollback_atomicity_stderr.$$
}

test_rollback_atomicity_status_no_snapshot() {
  local r; r=$(mk_repo); local v; v=$(mk_vault)
  bash "$SKILL/checkpoint.sh" status run_never_snapshotted "$r" "$v" >/dev/null 2>/tmp/rollback_atomicity_nosnap.$$
  local rc=$?
  assert_exit "$rc" 2 "status on a run with no snapshot at all is its own outcome, not torn or clean (exit 2)"
  assert_contains "$(cat /tmp/rollback_atomicity_nosnap.$$)" "no snapshot found" "status stderr names the no-snapshot case"
  rm -f /tmp/rollback_atomicity_nosnap.$$
}

test_rollback_atomicity_status_typo_run_id_not_confused_with_clean() {
  # Regression for the review finding: a typo'd run_id (here simulating
  # run_importnat vs a real run_important) must report "no snapshot" (exit
  # 2), never "clean" (exit 0) — even though a genuinely clean, correctly
  # snapshotted run with a similar id exists right next to it.
  local r; r=$(mk_repo); local v; v=$(mk_vault)
  bash "$SKILL/checkpoint.sh" snapshot run_important "$r" "$v" >/dev/null
  echo "agy edit" >> "$r/a.txt"
  bash "$SKILL/checkpoint.sh" rollback run_important "$r" "$v" >/dev/null

  bash "$SKILL/checkpoint.sh" status run_important "$r" "$v" >/dev/null 2>&1
  assert_exit "$?" 0 "the correctly-spelled, genuinely clean run still reports clean (exit 0)"

  bash "$SKILL/checkpoint.sh" status run_importnat "$r" "$v" >/dev/null 2>/tmp/rollback_atomicity_typo.$$
  local rc=$?
  assert_exit "$rc" 2 "a typo'd run_id reports no-snapshot (exit 2), never clean"
  assert_contains "$(cat /tmp/rollback_atomicity_typo.$$)" "no snapshot found" "typo'd run_id stderr names the no-snapshot case"
  rm -f /tmp/rollback_atomicity_typo.$$
}
