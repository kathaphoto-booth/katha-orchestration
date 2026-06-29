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

test_changed_set_handles_filename_with_space() {
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo)
  echo "x" > "$r/has space.txt"
  local out; out=$(changed_set "$r")
  assert_eq "$out" "has space.txt" "changed_set preserves filename with space"
}

test_changed_set_handles_embedded_quote() {
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo)
  # filename containing a literal double-quote
  printf 'x\n' > "$r/has\"quote.txt"
  local out; out=$(changed_set "$r")
  assert_eq "$out" 'has"quote.txt' "changed_set preserves filename with embedded quote"
}

test_changed_set_handles_rename() {
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo)
  # Rename the tracked file. With --porcelain -z this emits an R record.
  git -C "$r" mv a.txt b.txt
  local out; out=$(changed_set "$r" | sort | tr '\n' ',')
  # Both halves of the rename must appear — the gate needs to see BOTH a.txt
  # disappearing and b.txt appearing as parts of the change footprint.
  assert_eq "$out" "a.txt,b.txt," "changed_set emits both sides of a rename"
}
