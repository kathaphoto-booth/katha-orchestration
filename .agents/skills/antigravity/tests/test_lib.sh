#!/usr/bin/env bash
# Tests for scripts/lib.sh shared bash primitives.

test_changed_set_includes_untracked() {
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo)
  echo "x" > "$r/tracked_edit.txt"   # untracked new file
  echo "y" >> "$r/a.txt"             # modified tracked
  local out; out=$(changed_set "$r" | sort | tr '\n' ',')
  assert_eq "$out" "a.txt,tracked_edit.txt," "changed_set sees tracked+untracked"
}
