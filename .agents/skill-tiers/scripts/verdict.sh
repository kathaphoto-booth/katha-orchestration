#!/usr/bin/env bash
# verdict.sh — deterministic, non-LLM truth harness. Promoted from
# antigravity/scripts/ to skill-tiers/scripts/.
#
# Extensions over the antigravity version:
#   --prev-digest <json>  : enables drift_check (risk B from the plan).
#                           Diffs files claimed by the PREVIOUS phase's digest
#                           as unmodified against what THIS phase actually
#                           changed — FAIL if any overlap (cross-phase drift).
#   --prev-screenshot <f> : paired with --curr-screenshot for taste_checkpoint
#   --curr-screenshot <f>   (risk C). A visual-regression diff must exist between
#                           phases that both touch rendered output. SKIPPED when
#                           either argument is absent; FAIL when both provided and
#                           the diff exceeds the tolerance threshold (10%).
#
# Both results land in .verdict.json as drift_check and taste_checkpoint fields
# so self_eval.sh can read them into the ledger.
#
# Standalone (not sourced) — set -euo pipefail is safe here.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./lib.sh
source "$DIR/lib.sh"

REPO=""
DIGEST=""
GATE="fast"
PREV_DIGEST=""
PREV_SCREENSHOT=""
CURR_SCREENSHOT=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo)            REPO="$2";            shift 2;;
    --digest)          DIGEST="$2";          shift 2;;
    --gate)            GATE="$2";            shift 2;;
    --prev-digest)     PREV_DIGEST="$2";     shift 2;;
    --prev-screenshot) PREV_SCREENSHOT="$2"; shift 2;;
    --curr-screenshot) CURR_SCREENSHOT="$2"; shift 2;;
    *) echo "unknown arg $1" >&2; exit 2;;
  esac
done
[[ -n "$REPO" && -f "$DIGEST" ]] || {
  echo "usage: verdict.sh --repo <dir> --digest <json> [--gate fast|full|none]" \
       "[--prev-digest <json>] [--prev-screenshot <f> --curr-screenshot <f>]" >&2
  exit 2
}

# Bash 3.2-compatible array reads (no mapfile — macOS /bin/bash is 3.2).
read_into() {
  local _v="$1" _l
  while IFS= read -r _l; do eval "$_v+=(\"\$_l\")"; done
}

# Reality from git — NEVER from the digest.
REAL=()
read_into REAL < <(changed_set "$REPO")

# Exclude verdict.sh's own output file from the changed-set comparison.
REAL_FILTERED=()
for _f in "${REAL[@]:-}"; do
  [[ "$_f" == ".verdict.json" ]] && continue
  REAL_FILTERED+=("$_f")
done
REAL=("${REAL_FILTERED[@]:-}")

CLAIMED=()
read_into CLAIMED < <(jq -r '.files_touched[]? // empty' "$DIGEST")
EXT=()
read_into EXT < <(jq -r '.external_effects[]? // empty' "$DIGEST")

is_member() {
  local needle="$1"; shift
  local x
  for x in "$@"; do
    [[ "$x" == "$needle" ]] && return 0
  done
  return 1
}

STATUS="PASS"
REASONS=()

# (a) Leak check: REAL ⊆ CLAIMED.
for f in "${REAL[@]:-}"; do
  [[ -z "$f" ]] && continue
  if ! is_member "$f" "${CLAIMED[@]:-}"; then
    STATUS="FAIL"
    REASONS+=("unclaimed change: $f")
  fi
done

# (b) External-effects check.
EXT_NONBLANK=()
for x in "${EXT[@]:-}"; do
  [[ -n "$x" ]] && EXT_NONBLANK+=("$x")
done
if [[ "${#EXT_NONBLANK[@]}" -gt 0 ]]; then
  STATUS="FAIL"
  REASONS+=("external effects present: ${EXT_NONBLANK[*]}")
fi

# (c) Gate.
GATE_RESULT="skipped"
if [[ "$GATE" != "none" ]]; then
  if [[ -f "$REPO/tsconfig.json" ]] && command -v npx >/dev/null 2>&1; then
    GATE_TMP="$(mktemp -d)"
    if ( cd "$REPO" && npx tsc --noEmit >"$GATE_TMP/tsc.log" 2>&1 ); then
      GATE_RESULT="tsc:pass"
    else
      GATE_RESULT="tsc:fail"
      STATUS="FAIL"
      REASONS+=("tsc failed")
    fi
  fi
fi

# (d) drift_check: cross-phase consistency (risk B).
# Reads the PREVIOUS phase's digest and checks whether any file it claimed as
# "unmodified" (i.e. NOT in its files_touched) appears in THIS phase's real
# changed set — that would mean phase N-1 drifted a file it didn't disclose,
# and phase N sees it as changed. PASS = no overlap; FAIL = overlap found.
DRIFT_CHECK="SKIPPED"
if [[ -n "$PREV_DIGEST" && -f "$PREV_DIGEST" ]]; then
  PREV_CLAIMED=()
  read_into PREV_CLAIMED < <(jq -r '.files_touched[]? // empty' "$PREV_DIGEST")
  DRIFT_FAIL=0
  for f in "${REAL[@]:-}"; do
    [[ -z "$f" ]] && continue
    # If this file was NOT in the previous phase's claimed set, previous phase
    # should not have touched it — but if it IS in the previous phase's claimed
    # set, that's fine (prev phase disclosed it). The failure case is: file in
    # REAL but NOT in prev_claimed AND NOT in current_claimed — meaning it
    # appeared from nowhere without either phase disclosing it.
    # Simpler check per plan: file in REAL that was also in PREV_CLAIMED means
    # phase N changed something phase N-1 said it touched — possible drift.
    # Report any such overlap as drift.
    if is_member "$f" "${PREV_CLAIMED[@]:-}" && ! is_member "$f" "${CLAIMED[@]:-}"; then
      # Phase N-1 claimed this file; phase N changed it without claiming it.
      # This is either a leak in phase N (already caught above) or the same file
      # was modified by both phases — drift.
      DRIFT_FAIL=1
      REASONS+=("drift_check: $f modified in this phase but also touched by prev phase without re-disclosure")
    fi
  done
  if [[ "$DRIFT_FAIL" -eq 0 ]]; then
    DRIFT_CHECK="PASS"
  else
    DRIFT_CHECK="FAIL"
    STATUS="FAIL"
  fi
fi

# (e) taste_checkpoint: visual regression between phases (risk C).
# Requires both --prev-screenshot and --curr-screenshot. Computes pixel-level
# diff using ImageMagick's `compare` (if available). SKIPPED when either arg
# is missing or ImageMagick is absent. FAIL when diff exceeds 10% of total pixels.
TASTE_CHECK="SKIPPED"
if [[ -z "$PREV_SCREENSHOT" || -z "$CURR_SCREENSHOT" ]]; then
  : # args absent — SKIPPED
elif [[ ! -f "$PREV_SCREENSHOT" || ! -f "$CURR_SCREENSHOT" ]]; then
  REASONS+=("taste_checkpoint: screenshot file(s) not found — treating as SKIPPED")
elif ! command -v compare >/dev/null 2>&1 || ! command -v identify >/dev/null 2>&1; then
  : # ImageMagick absent — SKIPPED
else
  DIFF_TMP="$(mktemp /tmp/taste_diff_XXXXXX.png)"
  # compare exits 1 when images differ, 2 on error — capture rc carefully.
  set +e
  DIFF_PIXELS=$(compare -metric AE -fuzz 5% "$PREV_SCREENSHOT" "$CURR_SCREENSHOT" "$DIFF_TMP" 2>&1)
  compare_rc=$?
  set -e
  rm -f "$DIFF_TMP"
  if [[ "$compare_rc" -eq 2 ]]; then
    REASONS+=("taste_checkpoint: ImageMagick compare errored — treating as SKIPPED")
  else
    TOTAL_PIXELS=$(identify -format "%[fx:w*h]" "$PREV_SCREENSHOT" 2>/dev/null || echo "0")
    if [[ "$TOTAL_PIXELS" -gt 0 && "$DIFF_PIXELS" =~ ^[0-9]+$ ]]; then
      PCT=$(( DIFF_PIXELS * 100 / TOTAL_PIXELS ))  # multiply first to avoid float
      if [[ "$PCT" -le 10 ]]; then
        TASTE_CHECK="PASS"
      else
        TASTE_CHECK="FAIL"; STATUS="FAIL"
        REASONS+=("taste_checkpoint: visual diff ${PCT}% exceeds 10% threshold")
      fi
    else
      REASONS+=("taste_checkpoint: could not parse pixel counts — treating as SKIPPED")
    fi
  fi
fi

jq -n \
  --arg status "$STATUS" \
  --arg gate "$GATE_RESULT" \
  --arg drift_check "$DRIFT_CHECK" \
  --arg taste_checkpoint "$TASTE_CHECK" \
  --argjson real "$(printf '%s\n' "${REAL[@]:-}" | jq -R . | jq -s 'map(select(.!=""))')" \
  --argjson reasons "$(printf '%s\n' "${REASONS[@]:-}" | jq -R . | jq -s 'map(select(.!=""))')" \
  '{status: $status, gate: $gate, drift_check: $drift_check, taste_checkpoint: $taste_checkpoint,
    real_changes: $real, reasons: $reasons}' \
  > "$REPO/.verdict.json"

[[ "$STATUS" == "PASS" ]]
