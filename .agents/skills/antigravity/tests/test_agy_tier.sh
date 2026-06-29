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

test_agy_tier_does_not_inject_raw_compiled_ham() {  # regression guard, added 2026-06-26
  # A 2026-06-24 handoff doc claimed compile-ham.sh was removed from this
  # script and replaced with a lean DESIGN.md injection, "confirmed by grep."
  # That claim was false (confirmed by live re-read 2026-06-26: both the
  # compile-ham.sh call and the raw COMPILED_HAM.md injection were still
  # there) — and this is the actual reason it went unnoticed: this file is
  # the only test ever wired to agy-tier-run.sh, and it never asserted on
  # either. See scripts/tests/test_agy_tier_run.sh for full behavioral
  # coverage (stubbed agy, real script, real assertions on what reaches the
  # prompt) — these two are the cheap source-level backstop.
  local src; src="$(cat "/Users/jedg./Desktop/kat_ha_pb/scripts/agy-tier-run.sh" 2>/dev/null)"
  assert_not_contains "$src" "bin/compile-ham.sh" "agy-tier-run.sh no longer invokes bin/compile-ham.sh"
  assert_not_contains "$src" 'cat "$VAULT/COMPILED_HAM.md"' "agy-tier-run.sh no longer injects raw COMPILED_HAM.md"
  assert_contains "$src" "DESIGN_PATH" "agy-tier-run.sh injects the lean DESIGN.md context instead"
}
