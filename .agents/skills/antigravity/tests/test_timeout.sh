#!/usr/bin/env bash
# run_with_timeout: portable, zero-dependency bound for CLI calls (macOS ships no
# coreutils timeout/gtimeout, so the council wrappers ran unbounded — codex hung
# 7.5min). Pure-bash background-watcher pattern (council-recommended).

test_run_with_timeout_kills_slow() {
  source "$SKILL/lib.sh"
  run_with_timeout 1 sleep 10; local rc=$?
  # A real kill yields a signal exit (>=128, e.g. 137 = 128+SIGKILL); a missing
  # function yields 127, so this distinguishes "timed out" from "never ran".
  assert_eq "$([[ "$rc" -ge 128 ]] && echo killed || echo notkilled)" "killed" "a command exceeding the bound is killed by signal"
}

test_run_with_timeout_passes_fast() {
  source "$SKILL/lib.sh"
  run_with_timeout 5 true
  assert_exit "$?" 0 "a command under the bound returns its own exit code"
}
