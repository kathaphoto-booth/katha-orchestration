#!/usr/bin/env bash
# Source-assertion test for the agy-tier-run.sh retrofit (Task 10). agy-tier-run
# drives the REAL agy binary + compiles the REAL vault, so it can't be unit-run
# hermetically; like test_compile.sh, we assert the source carries the hardened
# behavior: sandboxed agy, a sentinel COMPLETE gate, the instruction that makes
# agy emit that sentinel, and an explicit incomplete-vs-missing distinction.

test_agy_tier_is_hardened() {                       # Task 10 retrofit
  local src; src="/Users/jedg./Desktop/kat_ha_pb/scripts/agy-tier-run.sh"
  assert_eq "$([[ -f "$src" ]] && echo yes || echo no)" "yes" "agy-tier-run.sh exists"
  local body; body="$(cat "$src")"
  assert_contains "$body" "--sandbox" "agy runs sandboxed (no external-effect tools)"
  assert_contains "$body" "STATUS: COMPLETE" "completion is gated on the transaction sentinel"
  assert_contains "$body" "INCOMPLETE_NO_SENTINEL" "incomplete (sentinel-less) is distinct from MISSING_RESULT"
}
