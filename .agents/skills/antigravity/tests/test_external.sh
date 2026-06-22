#!/usr/bin/env bash
# Regression lock for scripts/verdict.sh's external-effect rejection (attack #5).
# verdict.sh already rejects any non-empty external_effects[] (Task 3) — this
# test does not introduce new behavior; it locks the existing behavior so a
# future change to verdict.sh cannot silently weaken it without a test failing.

test_verdict_rejects_external_effects() {         # attack #5
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo)
  local dg; dg=$(mktemp)
  printf '{"files_touched":[],"external_effects":["apply_migration"]}' > "$dg"
  bash "$SKILL/verdict.sh" --repo "$r" --digest "$dg" --gate none >/dev/null 2>&1
  assert_exit "$?" 1 "verdict rejects any declared external effect"
  assert_contains "$(cat "$r/.verdict.json")" "external effects present" "reason names it"
}
