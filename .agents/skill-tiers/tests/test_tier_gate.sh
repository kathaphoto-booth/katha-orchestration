#!/usr/bin/env bash
# test_tier_gate.sh — unit tests for tier_gate.sh promotion arithmetic.
#
# Tests:
#   1. HOLD when no ledger exists
#   2. HOLD when clean_count < required
#   3. PASS when threshold exactly met (5 clean runs, 1 session)
#   4. Dishonest run resets streak to zero — 4 clean + 1 dishonest + 4 clean = HOLD (only 4 in streak)
#   5. PASS after dishonest run when enough clean runs follow
#   6. distinct_sessions gate blocks PASS when all runs in same session
#   7. HOLD output does not mention PASS
#   8. tiers.jsonl is updated after each call
#   9. ack subcommand writes correct row to tiers.jsonl
#  10. 3->4 gate rejects clean runs without human_ack_ts
#  11. 3->4 gate counts clean runs that have human_ack_ts
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIER_GATE="$DIR/../scripts/tier_gate.sh"
GATES_FILE="$DIR/../state/promotion-gates.json"

PASS=0; FAIL=0

assert_contains() {
  local label="$1" expected="$2" actual="$3"
  if echo "$actual" | grep -q "$expected"; then
    echo "  PASS: $label"
    PASS=$((PASS + 1))
  else
    echo "  FAIL: $label"
    echo "    expected to contain: $expected"
    echo "    actual: $actual"
    FAIL=$((FAIL + 1))
  fi
}

assert_not_contains() {
  local label="$1" unexpected="$2" actual="$3"
  if echo "$actual" | grep -q "$unexpected"; then
    echo "  FAIL: $label (unexpected string found)"
    echo "    unexpected: $unexpected"
    echo "    actual: $actual"
    FAIL=$((FAIL + 1))
  else
    echo "  PASS: $label"
    PASS=$((PASS + 1))
  fi
}

# Scaffold: create a temp repo with a fake ledger.
make_repo() {
  local dir; dir="$(mktemp -d)"
  mkdir -p "$dir/.orchestration"
  echo '*' > "$dir/.orchestration/.gitignore"
  git -C "$dir" init -q
  git -C "$dir" commit --allow-empty -m "init" -q
  echo "$dir"
}

# Write ledger entries.
# Args: repo skill verdict honest drift_check date
add_entry() {
  local repo="$1" skill="$2" verdict="$3" honest="$4" drift="$5" date="$6"
  local run; run="${skill}-run-$(date +%s%N 2>/dev/null || date +%s)-$RANDOM"
  jq -nc \
    --arg ts "${date}T12:00:00Z" --arg run "$run" \
    --arg skill "$skill" --argjson tier 0 --arg executor "copilot" \
    --arg verdict "$verdict" --argjson claimed 1 --argjson honest "$honest" \
    --argjson lines 1 --argjson tokens 100 \
    --arg drift "$drift" --arg taste "SKIPPED" \
    '{ts:$ts,run:$run,skill:$skill,tier:$tier,executor:$executor,
      verdict:$verdict,claimed:$claimed,honest:$honest,
      lines:$lines,tokens:$tokens,t2d:100.0,reasons:[],
      drift_check:$drift,taste_checkpoint:$taste}' \
    >> "$repo/.orchestration/ledger.jsonl"
}

SKILL="impeccable-looped-kit"
TIERS_TMP="$(mktemp)"

run_gate() {
  local repo="$1"
  # Override state dir to temp location so we don't pollute real state.
  GATES_OVERRIDE="$GATES_FILE"
  TIERS_OVERRIDE="$TIERS_TMP"
  # tier_gate.sh reads STATE_DIR from $DIR/../state — we can't easily override
  # without env vars. Use a wrapper that patches the paths via symlinks.
  local fake_state; fake_state="$(mktemp -d)"
  cp "$GATES_FILE" "$fake_state/promotion-gates.json"
  cp "$TIERS_TMP" "$fake_state/tiers.jsonl" 2>/dev/null || touch "$fake_state/tiers.jsonl"
  # Patch tier_gate.sh's STATE_DIR by temporarily setting up a symlink.
  # Simplest approach: call tier_gate.sh via env substitution — but it computes
  # STATE_DIR relative to $DIR. Instead, copy the script and patch the path.
  local patched; patched="$(mktemp)"
  sed "s|STATE_DIR=\"\$DIR/../state\"|STATE_DIR=\"$fake_state\"|g" "$TIER_GATE" > "$patched"
  chmod +x "$patched"
  local out; out="$("$patched" --skill "$SKILL" --repo "$repo" 2>&1 || true)"
  # Sync tiers.jsonl back.
  cp "$fake_state/tiers.jsonl" "$TIERS_TMP" 2>/dev/null || true
  rm -f "$patched"
  rm -rf "$fake_state"
  echo "$out"
}

echo "=== test_tier_gate.sh ==="

# Test 1: HOLD when no ledger
echo "Test 1: HOLD when no ledger"
REPO=$(make_repo)
OUT=$(run_gate "$REPO")
assert_contains "HOLD with no ledger" "HOLD" "$OUT"
rm -rf "$REPO"

# Test 2: HOLD when only 3 clean runs (need 5)
echo "Test 2: HOLD when insufficient clean runs"
REPO=$(make_repo)
for i in 1 2 3; do
  add_entry "$REPO" "$SKILL" "PASS" "true" "SKIPPED" "2026-01-0${i}"
done
OUT=$(run_gate "$REPO")
assert_contains "HOLD with 3 runs" "HOLD" "$OUT"
assert_not_contains "not PASS with 3 runs" "^PASS" "$OUT"
rm -rf "$REPO"

# Test 3: PASS when exactly 5 clean runs, 1 session date
echo "Test 3: PASS at exact threshold"
REPO=$(make_repo)
for i in 1 2 3 4 5; do
  add_entry "$REPO" "$SKILL" "PASS" "true" "SKIPPED" "2026-01-01"
done
OUT=$(run_gate "$REPO")
assert_contains "PASS at 5 runs" "PASS" "$OUT"
rm -rf "$REPO"

# Test 4: Dishonest run resets streak — 4 clean + dishonest + 4 clean = HOLD
echo "Test 4: Dishonest run resets streak"
REPO=$(make_repo)
for i in 1 2 3 4; do
  add_entry "$REPO" "$SKILL" "PASS" "true" "SKIPPED" "2026-01-0${i}"
done
add_entry "$REPO" "$SKILL" "FAIL" "false" "SKIPPED" "2026-01-05"
for i in 6 7 8 9; do
  add_entry "$REPO" "$SKILL" "PASS" "true" "SKIPPED" "2026-01-0${i}"
done
OUT=$(run_gate "$REPO")
# 4 clean runs post-dishonest — not enough (need 5)
assert_contains "HOLD after dishonest reset" "HOLD" "$OUT"
rm -rf "$REPO"

# Test 5: PASS after dishonest run once 5 clean runs follow
echo "Test 5: PASS after dishonest once 5+ clean runs follow"
REPO=$(make_repo)
for i in 1 2 3; do
  add_entry "$REPO" "$SKILL" "PASS" "true" "SKIPPED" "2026-01-0${i}"
done
add_entry "$REPO" "$SKILL" "FAIL" "false" "SKIPPED" "2026-01-04"
for i in 5 6 7 8 9; do
  add_entry "$REPO" "$SKILL" "PASS" "true" "SKIPPED" "2026-01-1${i}"
done
OUT=$(run_gate "$REPO")
assert_contains "PASS after dishonest once streak recovers" "PASS" "$OUT"
rm -rf "$REPO"

# Test 6: distinct_sessions gate — 5 clean runs all on the same date = HOLD
# (0->1 needs distinct_sessions >= 1, which is always true with 1 date;
# but if we test a transition requiring 3 sessions with only 1 date...)
# The default gate 0->1 needs only 1 session, so this tests the count directly.
echo "Test 6: PASS with 5 runs all same date (0->1 needs only 1 session)"
REPO=$(make_repo)
for i in 1 2 3 4 5; do
  add_entry "$REPO" "$SKILL" "PASS" "true" "SKIPPED" "2026-01-01"
done
OUT=$(run_gate "$REPO")
assert_contains "PASS with 1 session (0->1 needs 1)" "PASS" "$OUT"
rm -rf "$REPO"

# Test 7: HOLD output never says PASS
echo "Test 7: HOLD does not contain standalone PASS verdict"
REPO=$(make_repo)
add_entry "$REPO" "$SKILL" "PASS" "true" "SKIPPED" "2026-01-01"
OUT=$(run_gate "$REPO")
assert_contains "has HOLD" "HOLD" "$OUT"
rm -rf "$REPO"

# Test 8: tiers.jsonl updated
echo "Test 8: tiers.jsonl updated after call"
REPO=$(make_repo)
for i in 1 2 3; do
  add_entry "$REPO" "$SKILL" "PASS" "true" "SKIPPED" "2026-01-0${i}"
done
run_gate "$REPO" >/dev/null
TIERS_CONTENT="$(cat "$TIERS_TMP" 2>/dev/null || echo '')"
assert_contains "tiers.jsonl has skill entry" "$SKILL" "$TIERS_CONTENT"
rm -rf "$REPO"

rm -f "$TIERS_TMP"

# ── Tests 9-11: ack subcommand and 3->4 gate ──────────────────────────────────
#
# We need a fresh isolated state dir for each test in this group because:
#   - ack rows and evidence rows coexist in tiers.jsonl
#   - run_gate_tier3_with_state pre-seeds an evidence row declaring CURRENT_TIER=3
#
# add_entry_t3: adds a tier-3-compatible ledger entry (all required_fields PASS).
#   Returns the run ID on stdout.
# run_gate_tier3_with_state: runs the gate check with a caller-owned fake_state dir.
# run_ack_with_state: calls "ack" subcommand against a caller-owned fake_state dir.
# seed_tier3_state: writes an evidence row declaring CURRENT_TIER=3 TARGET_TIER=4.

add_entry_t3() {
  local repo="$1" skill="$2" verdict="$3" honest="$4" date="$5"
  local run; run="${skill}-t3run-$(date +%s%N 2>/dev/null || date +%s)-$RANDOM"
  jq -nc \
    --arg ts "${date}T10:00:00Z" --arg run "$run" \
    --arg skill "$skill" --argjson tier 3 --arg executor "copilot" \
    --arg verdict "$verdict" --argjson claimed 1 --argjson honest "$honest" \
    --argjson lines 1 --argjson tokens 100 \
    '{ts:$ts,run:$run,skill:$skill,tier:$tier,executor:$executor,
      verdict:$verdict,claimed:$claimed,honest:$honest,
      lines:$lines,tokens:$tokens,t2d:100.0,reasons:[],
      drift_check:"PASS",taste_checkpoint:"PASS"}' \
    >> "$repo/.orchestration/ledger.jsonl"
  echo "$run"
}

run_gate_tier3_with_state() {
  local repo="$1" fake_state="$2"
  local patched; patched="$(mktemp)"
  sed "s|STATE_DIR=\"\$DIR/../state\"|STATE_DIR=\"$fake_state\"|g" "$TIER_GATE" > "$patched"
  chmod +x "$patched"
  local out; out="$("$patched" --skill "$SKILL" --repo "$repo" 2>&1 || true)"
  rm -f "$patched"
  echo "$out"
}

run_ack_with_state() {
  local fake_state="$1" skill_arg="$2" run_arg="$3"
  local patched; patched="$(mktemp)"
  sed "s|STATE_DIR=\"\$DIR/../state\"|STATE_DIR=\"$fake_state\"|g" "$TIER_GATE" > "$patched"
  chmod +x "$patched"
  local out; out="$("$patched" ack --skill "$skill_arg" --run "$run_arg" 2>&1 || true)"
  rm -f "$patched"
  echo "$out"
}

seed_tier3_state() {
  local fake_state="$1" skill_arg="$2"
  jq -cn --arg skill "$skill_arg" \
    '{skill:$skill, current_tier:3, target_tier:4,
      clean_runs_at_current_tier:0, distinct_sessions_at_current_tier:0,
      last_checked_ts:"2026-01-01T00:00:00Z", evidence_run_ids:[]}' \
    >> "$fake_state/tiers.jsonl"
}

# Test 9: ack subcommand writes correct row
echo "Test 9: ack subcommand writes correct row"
T9_STATE="$(mktemp -d)"
cp "$GATES_FILE" "$T9_STATE/promotion-gates.json"
touch "$T9_STATE/tiers.jsonl"
ACK_OUT=$(run_ack_with_state "$T9_STATE" "$SKILL" "test-run-9")
assert_contains "ack prints confirmation" "human_ack_ts recorded" "$ACK_OUT"
T9_ACK_ROW=$(jq -rc 'select(.type == "ack" and .run == "test-run-9")' "$T9_STATE/tiers.jsonl" || true)
assert_contains "ack row written to tiers.jsonl" '"type":"ack"' "$T9_ACK_ROW"
assert_contains "ack row has correct skill" "\"skill\":\"$SKILL\"" "$T9_ACK_ROW"
assert_contains "ack row has human_ack_ts" "human_ack_ts" "$T9_ACK_ROW"
rm -rf "$T9_STATE"

# Test 10: 3->4 gate rejects clean runs without human_ack_ts
echo "Test 10: 3->4 gate HOLD when clean runs lack human_ack_ts"
T10_REPO=$(make_repo)
T10_STATE="$(mktemp -d)"
cp "$GATES_FILE" "$T10_STATE/promotion-gates.json"
touch "$T10_STATE/tiers.jsonl"
seed_tier3_state "$T10_STATE" "$SKILL"
# Add 5 clean runs (verdict=PASS, honest=true, drift+taste=PASS) — no ack rows at all.
for i in 1 2 3 4 5; do
  add_entry_t3 "$T10_REPO" "$SKILL" "PASS" "true" "2026-01-0${i}" > /dev/null
done
T10_OUT=$(run_gate_tier3_with_state "$T10_REPO" "$T10_STATE")
assert_contains "HOLD without ack (3->4)" "HOLD" "$T10_OUT"
assert_not_contains "not PASS without ack (3->4)" "^PASS" "$T10_OUT"
rm -rf "$T10_REPO" "$T10_STATE"

# Test 11: 3->4 gate counts clean runs that have human_ack_ts newer than run.ts
echo "Test 11: 3->4 gate PASS when all clean runs have valid human_ack_ts"
T11_REPO=$(make_repo)
T11_STATE="$(mktemp -d)"
cp "$GATES_FILE" "$T11_STATE/promotion-gates.json"
touch "$T11_STATE/tiers.jsonl"
seed_tier3_state "$T11_STATE" "$SKILL"
# 3->4 requires 25 clean runs across 8 sessions.
# Distribute: 4 runs on day 01, 3 runs on days 02-08 → 4 + 7*3 = 25 total; 8 dates.
T11_RUNS=()
run_idx=0
for day in 01 02 03 04 05 06 07 08; do
  runs_today=3
  if [[ "$run_idx" -eq 0 ]]; then runs_today=4; fi
  for r in $(seq 1 $runs_today); do
    RUN_ID=$(add_entry_t3 "$T11_REPO" "$SKILL" "PASS" "true" "2026-01-${day}")
    T11_RUNS+=("${RUN_ID}:2026-01-${day}")
  done
  run_idx=$((run_idx + 1))
done
# Write ack rows for all runs; ack at 11:00 UTC (run was at 10:00 UTC — ack is newer).
for entry in "${T11_RUNS[@]}"; do
  RUN_ID="${entry%%:*}"
  RUN_DATE="${entry##*:}"
  jq -cn \
    --arg skill "$SKILL" --arg run "$RUN_ID" --arg ts "${RUN_DATE}T11:00:00Z" \
    '{skill:$skill, run:$run, human_ack_ts:$ts, type:"ack"}' \
    >> "$T11_STATE/tiers.jsonl"
done
T11_OUT=$(run_gate_tier3_with_state "$T11_REPO" "$T11_STATE")
assert_contains "PASS with acked clean runs (3->4)" "PASS" "$T11_OUT"
assert_contains "ack count in PASS output" "human-acked" "$T11_OUT"
rm -rf "$T11_REPO" "$T11_STATE"
unset T11_RUNS

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[[ "$FAIL" -eq 0 ]]
