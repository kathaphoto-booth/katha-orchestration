#!/usr/bin/env bash
# Dependency-free test helpers. No bats. Mirrors
# .agents/skills/antigravity/tests/lib_test.sh's conventions for consistency
# across the repo's two shell test suites.
set -uo pipefail

PASS_COUNT=0; FAIL_COUNT=0
assert_eq() { # <actual> <expected> <msg>
  if [[ "$1" == "$2" ]]; then PASS_COUNT=$((PASS_COUNT+1)); echo "  ok: $3";
  else FAIL_COUNT=$((FAIL_COUNT+1)); echo "  FAIL: $3 (got '$1' want '$2')"; fi
}
assert_contains() { # <haystack> <needle> <msg>
  if [[ "$1" == *"$2"* ]]; then PASS_COUNT=$((PASS_COUNT+1)); echo "  ok: $3";
  else FAIL_COUNT=$((FAIL_COUNT+1)); echo "  FAIL: $3 (missing '$2')"; fi
}
assert_not_contains() { # <haystack> <needle> <msg>
  if [[ "$1" != *"$2"* ]]; then PASS_COUNT=$((PASS_COUNT+1)); echo "  ok: $3";
  else FAIL_COUNT=$((FAIL_COUNT+1)); echo "  FAIL: $3 (unexpectedly present: '$2')"; fi
}

# Safety net for tests that invoke a script under test: if the script under
# test doesn't yet honor a stub override (e.g. mid-RED-phase, before the fix
# lands), it must fail FAST, never hang on a real external binary/network
# call. Bounds any test invocation to <secs>, killing it hard if exceeded.
run_test_bounded() { # <secs> <cmd...>
  local secs="$1"; shift
  "$@" & local pid=$!
  ( sleep "$secs"; kill -9 "$pid" 2>/dev/null ) & local watcher=$!
  local rc=0
  wait "$pid" 2>/dev/null || rc=$?
  kill "$watcher" 2>/dev/null; wait "$watcher" 2>/dev/null || true
  return "$rc"
}
