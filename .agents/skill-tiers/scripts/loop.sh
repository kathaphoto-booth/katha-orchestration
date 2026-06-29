#!/usr/bin/env bash
# loop.sh — bounded retry wrapper. Promoted from antigravity/scripts/ to
# skill-tiers/scripts/.
#
# Extension over the antigravity version: --executor {agy|copilot} (default: agy)
# replaces the hardcoded call to delegate_agy.sh. The loop now dispatches to
# delegate.sh --executor $EXECUTOR, which routes to the correct adapter.
# --vault is passed through to checkpoint.sh (optional there).
# --skill and --phase are forwarded to delegate.sh for ledger tagging.
#
# Usage:
#   loop.sh --repo <dir> --run <prefix> --brief "<text>"
#           [--executor agy|copilot] [--skill <name>] [--phase <name>] [--tier <N>]
#           [--vault <dir>] [--max 3] [--timeout 5m] [--gate fast|full|none]
#
# Standalone (not sourced) — set -euo pipefail is safe here.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./lib.sh
source "$DIR/lib.sh"

REPO=""; VAULT=""; RUN_PREFIX=""; BRIEF=""
EXECUTOR="agy"; SKILL=""; PHASE=""; TIER=""
MAX=3; TIMEOUT="5m"; GATE="fast"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo)     [[ $# -ge 2 ]] || { echo "loop: --repo requires a value" >&2; exit 2; }
                REPO="$2";       shift 2;;
    --vault)    [[ $# -ge 2 ]] || { echo "loop: --vault requires a value" >&2; exit 2; }
                VAULT="$2";      shift 2;;
    --run)      [[ $# -ge 2 ]] || { echo "loop: --run requires a value" >&2; exit 2; }
                RUN_PREFIX="$2"; shift 2;;
    --brief)    [[ $# -ge 2 ]] || { echo "loop: --brief requires a value" >&2; exit 2; }
                BRIEF="$2";      shift 2;;
    --executor) [[ $# -ge 2 ]] || { echo "loop: --executor requires a value" >&2; exit 2; }
                EXECUTOR="$2";   shift 2;;
    --skill)    [[ $# -ge 2 ]] || { echo "loop: --skill requires a value" >&2; exit 2; }
                SKILL="$2";      shift 2;;
    --phase)    [[ $# -ge 2 ]] || { echo "loop: --phase requires a value" >&2; exit 2; }
                PHASE="$2";      shift 2;;
    --tier)     [[ $# -ge 2 ]] || { echo "loop: --tier requires a value" >&2; exit 2; }
                TIER="$2";       shift 2;;
    --max)      [[ $# -ge 2 ]] || { echo "loop: --max requires a value" >&2; exit 2; }
                MAX="$2";        shift 2;;
    --timeout)  [[ $# -ge 2 ]] || { echo "loop: --timeout requires a value" >&2; exit 2; }
                TIMEOUT="$2";    shift 2;;
    --gate)     [[ $# -ge 2 ]] || { echo "loop: --gate requires a value" >&2; exit 2; }
                GATE="$2";       shift 2;;
    *) echo "unknown arg $1" >&2; exit 2;;
  esac
done
[[ -n "$REPO" && -n "$RUN_PREFIX" && -n "$BRIEF" ]] || {
  echo "usage: loop.sh --repo <dir> --run <prefix> --brief <text> [--executor agy|copilot] [--skill <name>] [--phase <name>] [--tier <N>] [--vault <dir>] [--max 3] [--timeout 5m] [--gate fast]" >&2
  exit 2
}
if [[ -n "$TIER" ]] && ! [[ "$TIER" =~ ^[0-4]$ ]]; then
  echo "loop: --tier must be an integer 0-4, got '$TIER'" >&2
  exit 2
fi

LOGDIR="$REPO/.orchestration/$RUN_PREFIX"
mkdir -p "$REPO/.orchestration"
echo '*' > "$REPO/.orchestration/.gitignore"

LOCK="$REPO/.orchestration/${RUN_PREFIX}.lock"
if ! mkdir "$LOCK" 2>/dev/null; then
  echo "loop: a run with prefix '$RUN_PREFIX' is already in progress ($LOCK). Refusing to avoid checkpoint-state corruption." >&2
  exit 5
fi
trap 'rmdir "$LOCK" 2>/dev/null || true' EXIT

mkdir -p "$LOGDIR"
LOG="$LOGDIR/loop.jsonl"

normalize_reasons() {
  tr '|' '\n' \
    | sed -E 's/:.*$//; s/^[[:space:]]+//; s/[[:space:]]+$//' \
    | tr 'A-Z' 'a-z' \
    | sed '/^$/d' \
    | sort -u \
    | paste -sd'|' -
}

BRIEF_CUR="$BRIEF"
PREV_NORM=""
attempt=1
while [[ "$attempt" -le "$MAX" ]]; do
  RUN_ID="${RUN_PREFIX}-attempt${attempt}"

  # checkpoint.sh: vault arg is optional (empty string = no-op vault ops)
  if ! "$DIR/checkpoint.sh" snapshot "$RUN_ID" "$REPO" ${VAULT:+"$VAULT"} >/dev/null 2>&1; then
    echo "loop: snapshot failed for $RUN_ID — cannot proceed without a recoverable checkpoint" >&2
    exit 4
  fi

  # Dispatch to the general delegate router instead of hardcoded delegate_agy.sh.
  DELEGATE_ARGS=(--repo "$REPO" --run "$RUN_ID" --brief "$BRIEF_CUR" --timeout "$TIMEOUT" --executor "$EXECUTOR")
  [[ -n "$SKILL" ]] && DELEGATE_ARGS+=(--skill "$SKILL")
  [[ -n "$PHASE" ]] && DELEGATE_ARGS+=(--phase "$PHASE")

  set +e
  "$DIR/delegate.sh" "${DELEGATE_ARGS[@]}" >/dev/null 2>&1
  drc=$?
  set -e
  case "$drc" in 130|143) exit "$drc";; esac

  status="FAIL"; reasons=""
  DIGEST="$REPO/.orchestration/$RUN_ID/digest.json"
  RESULT="$REPO/.orchestration/$RUN_ID/result.md"

  if [[ "$drc" -ne 0 ]]; then
    reasons="delegate failed: no STATUS COMPLETE sentinel (executor crashed or timed out)"
  elif [[ ! -f "$DIGEST" ]]; then
    reasons="missing digest: executor did not emit the required digest.json manifest"
  elif [[ -f "$RESULT" ]] && ! "$DIR/authority-guard.sh" "$RESULT" >/dev/null 2>&1; then
    reasons="authority-guard: result.md contains an executor-authored human-authority claim"
  else
    set +e
    "$DIR/verdict.sh" --repo "$REPO" --digest "$DIGEST" --gate "$GATE" >/dev/null 2>&1
    vrc=$?
    set -e
    if [[ "$vrc" -eq 0 ]]; then
      status="PASS"
    else
      reasons="$(jq -r '.reasons[]? // empty' "$REPO/.verdict.json" 2>/dev/null | paste -sd'|' -)"
      [[ -z "$reasons" ]] && reasons="verdict FAIL (no reasons recorded)"
    fi
  fi

  # Extended self_eval record with skill/tier/executor tags.
  EVAL_ARGS=(record --run "$RUN_ID" --repo "$REPO" --executor "$EXECUTOR")
  [[ -n "$SKILL" ]] && EVAL_ARGS+=(--skill "$SKILL")
  [[ -n "$TIER" ]] && EVAL_ARGS+=(--tier "$TIER")
  "$DIR/self_eval.sh" "${EVAL_ARGS[@]}" >/dev/null 2>&1 || true

  ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  brief_red="$(printf '%s' "$BRIEF_CUR" | redact)"
  reasons_red="$(printf '%s' "$reasons" | redact)"
  jq -n --arg ts "$ts" --argjson attempt "$attempt" --arg run "$RUN_ID" \
        --arg executor "$EXECUTOR" --arg skill "$SKILL" --arg phase "$PHASE" \
        --arg status "$status" --arg reasons "$reasons_red" --arg brief "$brief_red" \
        '{ts:$ts, attempt:$attempt, run:$run, executor:$executor, skill:$skill, phase:$phase,
          status:$status, reasons:$reasons, brief:$brief}' \
        >> "$LOG"

  if [[ "$status" == "PASS" ]]; then
    echo "loop: PASS on attempt $attempt/$MAX"
    exit 0
  fi

  if ! "$DIR/checkpoint.sh" rollback "$RUN_ID" "$REPO" ${VAULT:+"$VAULT"} >/dev/null 2>&1; then
    echo "loop: rollback FAILED for $RUN_ID — repo/vault may be torn. Aborting." >&2
    exit 3
  fi

  norm="$(printf '%s' "$reasons" | normalize_reasons)"
  if [[ -n "$PREV_NORM" && "$norm" == "$PREV_NORM" ]]; then
    echo "loop: EARLY EXIT on attempt $attempt — repeated failure class '$norm', no progress." >&2
    exit 2
  fi
  PREV_NORM="$norm"

  if [[ "$attempt" -lt "$MAX" ]]; then
    BRIEF_CUR="${BRIEF}

PREVIOUS ATTEMPT ${attempt}/${MAX} FAILED. Verdict reasons:
$(printf '%s' "$reasons" | tr '|' '\n')
Fix these specific issues; do not repeat the change that caused them."
  fi

  attempt=$((attempt + 1))
done

echo "loop: FAIL — exhausted $MAX attempts, escalating to CC/Jed" >&2
exit 1
