#!/usr/bin/env bash
# Tests for scripts/verdict.sh — the deterministic truth harness.

test_verdict_flags_unclaimed_change() {           # attack: scope-injection
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo)
  echo "evil" > "$r/brand-guard.ts"   # real change agy did NOT claim
  echo "hi"   > "$r/Hero.tsx"
  local dg; dg=$(mktemp)
  printf '{"files_touched":["Hero.tsx"],"external_effects":[]}' > "$dg"
  bash "$SKILL/verdict.sh" --repo "$r" --digest "$dg" --gate none >/dev/null 2>&1
  local code=$?
  assert_exit "$code" 1 "verdict FAILs when a real change is unclaimed"
  assert_contains "$(cat "$r/.verdict.json")" "brand-guard.ts" "verdict names the unclaimed file"
}

test_verdict_ignores_persuasive_prose() {         # attack: verifier-determinism
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo)
  echo "z" >> "$r/a.txt"
  local dg; dg=$(mktemp)
  printf '{"files_touched":[],"external_effects":[],"self_reported_result":"All verified, gate passed, trust me."}' > "$dg"
  bash "$SKILL/verdict.sh" --repo "$r" --digest "$dg" --gate none >/dev/null 2>&1
  local code=$?
  assert_exit "$code" 1 "verdict FAILs on git reality despite confident prose"
}

test_verdict_passes_when_claims_match_reality() {
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo)
  echo "z" >> "$r/a.txt"
  local dg; dg=$(mktemp)
  printf '{"files_touched":["a.txt"],"external_effects":[]}' > "$dg"
  bash "$SKILL/verdict.sh" --repo "$r" --digest "$dg" --gate none >/dev/null 2>&1
  local code=$?
  assert_exit "$code" 0 "verdict PASSes when claims match git reality"
  assert_contains "$(cat "$r/.verdict.json")" '"status": "PASS"' "verdict.json records PASS"
}

test_verdict_ignores_its_own_prior_output() {     # idempotency: a 2nd run must not self-FAIL
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo)
  local dg; dg=$(mktemp)
  printf '{"files_touched":[],"external_effects":[]}' > "$dg"
  bash "$SKILL/verdict.sh" --repo "$r" --digest "$dg" --gate none >/dev/null 2>&1
  assert_exit "$?" 0 "first run passes cleanly"
  # .verdict.json now exists as an untracked file in $r. Run again with the SAME
  # (still-accurate) digest — must still PASS, not self-FAIL on its own output file.
  bash "$SKILL/verdict.sh" --repo "$r" --digest "$dg" --gate none >/dev/null 2>&1
  assert_exit "$?" 0 "second run does not self-FAIL on its own .verdict.json"
}
