#!/usr/bin/env bash
# Dependency-free test helpers. No bats.
set -uo pipefail

PASS_COUNT=0; FAIL_COUNT=0
assert_eq() { # <actual> <expected> <msg>
  if [[ "$1" == "$2" ]]; then PASS_COUNT=$((PASS_COUNT+1)); echo "  ok: $3";
  else FAIL_COUNT=$((FAIL_COUNT+1)); echo "  FAIL: $3 (got '$1' want '$2')"; fi
}
assert_exit() { # <actual_code> <expected_code> <msg>
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
