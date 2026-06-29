#!/usr/bin/env bash
set -uo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/lib_test.sh"
SKILL="$(cd "$DIR/.." && pwd)/scripts"
# Canonical implementation location after the shim refactor (2026-06-28).
# Source-assertion tests that grep script internals must read from here, not
# from the shim files in $SKILL.
SKILL_TIERS="$(cd "$DIR/../../../skill-tiers/scripts" 2>/dev/null && pwd || echo "")"

# Discover and source any test files (test_*.sh), each defining test_<name> funcs.
shopt -s nullglob
for f in "$DIR"/test_*.sh; do source "$f"; done
shopt -u nullglob

run_one() { echo "== $1 =="; "$1"; }
# Portable to bash 3.2 (macOS default; no mapfile).
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
