#!/usr/bin/env bash
# Tests for scripts/agy-tier-run.sh.
#
# Context: a 2026-06-24 handoff doc (AG-authored) claimed compile-ham.sh was
# removed and COMPILED_HAM.md replaced with a lean DESIGN.md injection,
# "confirmed by grep" and backed by a 7-scenario test harness at
# scripts/test-agy-tier-run.sh. Both claims were false: re-reading the script
# directly on 2026-06-26 showed compile-ham.sh still being called and
# COMPILED_HAM.md still being injected verbatim, and that specific 7-scenario
# file does not exist anywhere on disk. A real (but much thinner) test DID
# already exist — .agents/skills/antigravity/tests/test_agy_tier.sh, 1
# function / 4 source assertions — it just never checked for compile-ham.sh
# or COMPILED_HAM.md at all, which is the actual reason the regression went
# unnoticed; that file now has the missing assertions added too. This file
# is the first REAL BEHAVIORAL test this script has had (stubbed agy, real
# script execution, real assertions on what reaches the prompt).
#
# Every invocation of the real script is wrapped in run_test_bounded with a
# short timeout: if AGY_BIN isn't yet honored (pre-fix), the script falls
# through to the real, network-bound agy binary — this must fail FAST, not
# hang for the real 5-minute default (confirmed live 2026-06-26: an early,
# unguarded RED-phase run did exactly this and had to be killed mid-flight).

SCRIPT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/agy-tier-run.sh"
BOUND=8

# A stub agy: captures every arg it was called with (the big --print prompt
# included) to $AGY_CAPTURE_FILE, parses --add-dir from its own args to find
# where result.md belongs, writes a valid sentinel-terminated result.md, exits 0.
_mk_agy_stub_ok() {
  local bin="$1"
  cat > "$bin/agy" <<'STUB'
#!/usr/bin/env bash
printf '%s\0' "$@" > "$AGY_CAPTURE_FILE"
dir=""
prev=""
for a in "$@"; do
  if [[ "$prev" == "--add-dir" ]]; then dir="$a"; fi
  prev="$a"
done
printf 'stub ran\nSTATUS: COMPLETE\n' > "$dir/result.md"
exit 0
STUB
  chmod +x "$bin/agy"
}

_mk_agy_stub_fails_no_sentinel() {
  local bin="$1"
  cat > "$bin/agy" <<'STUB'
#!/usr/bin/env bash
dir=""
prev=""
for a in "$@"; do
  if [[ "$prev" == "--add-dir" ]]; then dir="$a"; fi
  prev="$a"
done
printf 'incomplete, no sentinel\n' > "$dir/result.md"
exit 0
STUB
  chmod +x "$bin/agy"
}

test_agy_tier_run_does_not_call_compile_ham() {  # source-assertion (regression guard)
  # Checks the actual invocation shape, not bare string presence — a comment
  # explaining the historical bug (for the next person reading this file) is
  # fine; an executable call to the script is not.
  local src; src="$(cat "$SCRIPT" 2>/dev/null)"
  assert_not_contains "$src" "bin/compile-ham.sh" "script no longer invokes bin/compile-ham.sh"
}

test_agy_tier_run_does_not_reference_compiled_ham_md() {  # source-assertion (regression guard)
  local src; src="$(cat "$SCRIPT" 2>/dev/null)"
  assert_not_contains "$src" 'cat "$VAULT/COMPILED_HAM.md"' \
    "script no longer injects COMPILED_HAM.md content into the agy prompt"
}

test_agy_tier_run_injects_design_md_content() {
  local bin; bin=$(mktemp -d); _mk_agy_stub_ok "$bin"
  local briefdir; briefdir=$(mktemp -d); echo "do the thing" > "$briefdir/brief.md"
  local design; design=$(mktemp); echo "BRAND-LAW-MARKER-12345" > "$design"
  local capture; capture=$(mktemp)
  AGY_BIN="$bin/agy" DESIGN_PATH="$design" AGY_CAPTURE_FILE="$capture" \
    run_test_bounded "$BOUND" bash "$SCRIPT" "$briefdir" >/dev/null 2>&1
  local rc=$?
  assert_eq "$rc" "0" "script exits 0 on a clean stubbed run"
  assert_contains "$(cat "$capture" 2>/dev/null)" "BRAND-LAW-MARKER-12345" \
    "DESIGN.md content reaches the agy prompt"
}

test_agy_tier_run_degrades_gracefully_when_design_md_missing() {
  local bin; bin=$(mktemp -d); _mk_agy_stub_ok "$bin"
  local briefdir; briefdir=$(mktemp -d); echo "do the thing" > "$briefdir/brief.md"
  local capture; capture=$(mktemp)
  AGY_BIN="$bin/agy" DESIGN_PATH="/tmp/does-not-exist-$$.md" AGY_CAPTURE_FILE="$capture" \
    run_test_bounded "$BOUND" bash "$SCRIPT" "$briefdir" >/dev/null 2>&1
  assert_contains "$(cat "$capture" 2>/dev/null)" "DESIGN.md brand law context is missing" \
    "missing DESIGN.md degrades to a warning, not a crash"
}

test_agy_tier_run_exits_2_when_brief_missing() {
  local briefdir; briefdir=$(mktemp -d)
  run_test_bounded "$BOUND" bash "$SCRIPT" "$briefdir" >/dev/null 2>&1
  assert_eq "$?" "2" "missing brief.md => exit 2"
}

test_agy_tier_run_exits_3_when_agy_not_executable() {
  local briefdir; briefdir=$(mktemp -d); echo "x" > "$briefdir/brief.md"
  AGY_BIN="/tmp/no-such-agy-binary-$$" run_test_bounded "$BOUND" bash "$SCRIPT" "$briefdir" >/dev/null 2>&1
  assert_eq "$?" "3" "agy binary missing/not executable => exit 3"
}

test_agy_tier_run_classifies_sentinel_correctly() {
  local bin; bin=$(mktemp -d); _mk_agy_stub_ok "$bin"
  local briefdir; briefdir=$(mktemp -d); echo "x" > "$briefdir/brief.md"
  AGY_BIN="$bin/agy" DESIGN_PATH=/dev/null AGY_CAPTURE_FILE=$(mktemp) \
    run_test_bounded "$BOUND" bash "$SCRIPT" "$briefdir" >/dev/null 2>&1
  assert_contains "$(cat "$briefdir/timing.txt" 2>/dev/null)" "Result: OK" \
    "sentinel-terminated result.md classified OK"
}

test_agy_tier_run_classifies_missing_sentinel_as_failure() {
  local bin; bin=$(mktemp -d); _mk_agy_stub_fails_no_sentinel "$bin"
  local briefdir; briefdir=$(mktemp -d); echo "x" > "$briefdir/brief.md"
  AGY_BIN="$bin/agy" DESIGN_PATH=/dev/null AGY_CAPTURE_FILE=$(mktemp) \
    run_test_bounded "$BOUND" bash "$SCRIPT" "$briefdir" >/dev/null 2>&1
  local rc=$?
  assert_eq "$rc" "1" "result.md without sentinel => exit 1"
  assert_contains "$(cat "$briefdir/timing.txt" 2>/dev/null)" "INCOMPLETE_NO_SENTINEL" \
    "missing sentinel classified as INCOMPLETE_NO_SENTINEL, not silently OK"
}
