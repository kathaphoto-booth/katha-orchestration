#!/usr/bin/env bash
# agy-tier-run.sh — Speed-optimized agy invocation with timing + classification
# Usage: agy-tier-run.sh <brief-dir> [print-timeout]
# Example: agy-tier-run.sh /tmp/katha-porkbun-fwd 5m
#
# Behavior:
#   1. Verifies brief.md exists in <brief-dir>
#   2. Runs agy with --add-dir <brief-dir> and a fixed --print instruction
#   3. Records wall-clock to <brief-dir>/timing.txt
#   4. Classifies the run as T2 (<3 min) or T3 (>=3 min)
#   5. Exits non-zero if result.md was not written

set -euo pipefail

BRIEF_DIR="${1:?Usage: $0 <brief-dir> [print-timeout]}"
TIMEOUT="${2:-5m}"
AGY="/Volumes/samsung 970 pro - Data/KATHA_VAULT/bin/agy"

if [[ ! -f "$BRIEF_DIR/brief.md" ]]; then
  echo "ERROR: $BRIEF_DIR/brief.md does not exist" >&2
  exit 2
fi

if [[ ! -x "$AGY" ]]; then
  echo "ERROR: agy not found at $AGY" >&2
  exit 3
fi

VAULT="/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory"

if [[ ! -d "$VAULT" ]]; then
  echo "ERROR: Samsung 970 pro is unmounted. Vault memory is unavailable." >&2
  exit 1
fi

# Fresh-compile the vault snapshot so AG's injected COMPILED_HAM.md is CURRENT at
# invocation. Without this, agy receives whatever stale COMPILED_HAM.md happens to
# be on disk, and (since AG has no live-vault read access here) cannot detect the
# drift. This is what makes the GEMINI.md §6 headless staleness check meaningful.
/Users/jedg./Desktop/kat_ha_pb/bin/compile-ham.sh

START=$(date +%s)

"$AGY" \
  --add-dir "$BRIEF_DIR" \
  --print-timeout "$TIMEOUT" \
  --print "--- TASK INSTRUCTION ---
Read brief.md in this directory. Execute the task exactly as specified. Write your complete result to ${BRIEF_DIR}/result.md before ending. Do not read files outside the directories you have been granted.

--- SYSTEM ARCHITECTURE INJECTION - VAULT MEMORY ---
$(cat "$VAULT/COMPILED_HAM.md" 2>/dev/null || echo "Vault memory unavailable")" \
  < /dev/null 2>&1 | tee "$BRIEF_DIR/agy-stdout.log"

END=$(date +%s)
DURATION=$((END - START))

if [[ -f "$BRIEF_DIR/result.md" ]]; then
  STATUS="OK"
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
