#!/usr/bin/env bash
# agy-tier-run.sh — Speed-optimized agy invocation with timing + classification
# Usage: agy-tier-run.sh <brief-dir> [print-timeout]
# Example: agy-tier-run.sh /tmp/katha-porkbun-fwd 5m
#
# Behavior:
#   1. Verifies brief.md exists in <brief-dir>
#   2. Runs agy with --add-dir <brief-dir> and a fixed --print instruction,
#      injecting DESIGN.md as the brand-law context (lean, ~2.9KB; degrades to
#      a warning if missing — never the 697KB COMPILED_HAM.md this script used
#      to inject via compile-ham.sh, the root cause of agy slowness, removed
#      2026-06-26 after confirming live it had silently regressed back in)
#   3. Records wall-clock to <brief-dir>/timing.txt
#   4. Classifies the run as T2 (<3 min) or T3 (>=3 min)
#   5. Exits non-zero if result.md was not written
#
# AGY_BIN / DESIGN_PATH env overrides exist for testing (scripts/tests/) —
# unset, behavior is unchanged from the hardcoded defaults.

set -euo pipefail

BRIEF_DIR="${1:?Usage: $0 <brief-dir> [print-timeout]}"
TIMEOUT="${2:-5m}"
AGY="${AGY_BIN:-/Volumes/samsung 970 pro - Data/KATHA_VAULT/bin/agy}"
DESIGN_PATH="${DESIGN_PATH:-/Users/jedg./Desktop/kat_ha_pb/DESIGN.md}"

if [[ ! -f "$BRIEF_DIR/brief.md" ]]; then
  echo "ERROR: $BRIEF_DIR/brief.md does not exist" >&2
  exit 2
fi

if [[ ! -x "$AGY" ]]; then
  echo "ERROR: agy not found at $AGY" >&2
  exit 3
fi

START=$(date +%s)

"$AGY" \
  --sandbox \
  --add-dir "$BRIEF_DIR" \
  --print-timeout "$TIMEOUT" \
  --print "--- TASK INSTRUCTION ---
Read brief.md in this directory. Execute the task exactly as specified. Write your complete result to ${BRIEF_DIR}/result.md before ending. Do not read files outside the directories you have been granted. As the FINAL line of result.md, write exactly this transaction sentinel and nothing after it:
STATUS: COMPLETE

--- SYSTEM ARCHITECTURE INJECTION - BRAND LAW (DESIGN.md) ---
$(if [[ -f "$DESIGN_PATH" ]]; then cat "$DESIGN_PATH"; else echo "WARNING: DESIGN.md brand law context is missing. Proceed strictly with task instructions."; fi)" \
  < /dev/null 2>&1 | tee "$BRIEF_DIR/agy-stdout.log"

END=$(date +%s)
DURATION=$((END - START))

# Completion is the transaction SENTINEL, not file existence — a crashed agy can
# leave a half-written result.md (and even exit 0). Check the tail + strip CR so
# trailing whitespace / mid-file noise can't fool it.
if [[ -f "$BRIEF_DIR/result.md" ]] && tail -n 3 "$BRIEF_DIR/result.md" | tr -d '\r' | grep -qx 'STATUS: COMPLETE'; then
  STATUS="OK"
elif [[ -f "$BRIEF_DIR/result.md" ]]; then
  STATUS="INCOMPLETE_NO_SENTINEL"
else
  STATUS="MISSING_RESULT"
fi

if (( DURATION < 180 )); then
  TIER="T2 (<3 min)"
elif (( DURATION < 900 )); then
  TIER="T3 (3-15 min)"
else
  TIER="T4 (>15 min — investigate)"
fi

cat > "$BRIEF_DIR/timing.txt" <<EOF
Brief: $BRIEF_DIR/brief.md
Started: $(date -r $START)
Ended: $(date -r $END)
Duration: ${DURATION}s
Tier: $TIER
Result: $STATUS
EOF

echo ""
echo "=== TIMING ==="
cat "$BRIEF_DIR/timing.txt"

[[ "$STATUS" == "OK" ]] || exit 1
