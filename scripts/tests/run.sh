#!/usr/bin/env bash
set -uo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/lib_test.sh"

shopt -s nullglob
for f in "$DIR"/test_*.sh; do source "$f"; done
shopt -u nullglob

run_one() { echo "== $1 =="; "$1"; }
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
