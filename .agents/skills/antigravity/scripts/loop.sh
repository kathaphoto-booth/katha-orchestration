#!/usr/bin/env bash
# loop.sh --repo <dir> --vault <dir> --run <prefix> --brief "<text>" \
#         [--max 3] [--timeout 5m] [--gate fast|full|none]
#
# Bounded retry wrapper around the existing single-shot chain. Each attempt runs
# the REAL scripts — nothing is reimplemented here:
#   checkpoint.sh snapshot -> delegate_agy.sh -> authority-guard.sh -> verdict.sh
#   -> self_eval.sh record
# and the loop adds only: an attempt counter with a HARD cap, verdict-reason
# feed-forward into the next attempt's brief, failure-class normalization for
# early-exit, transactional rollback between attempts, and a redacted per-attempt
# JSONL log.
#
# Loop Engineering shape: Trigger (a brief) -> Action (delegate+verify) ->
# objective Stop Condition (verdict.sh PASS/FAIL from git truth), bounded so it
# can never run unbounded:
#   exit 0  PASS               (terminal success; no rollback)
#   exit 1  cap exhausted      (every attempt failed DIFFERENTLY, never passed)
#   exit 2  early-exit         (same failure CLASS repeated -> no progress, stop
#                               before burning the rest of the cap)
#   exit 4  snapshot failed    (cannot proceed without a recoverable checkpoint)
#   130/143 propagated         (user SIGINT/SIGTERM aborts the whole loop)
#
# Standalone (not sourced) — `set -euo pipefail` is safe here.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./lib.sh
source "$DIR/lib.sh"

REPO=""; VAULT=""; RUN_PREFIX=""; BRIEF=""
MAX=3; TIMEOUT="5m"; GATE="fast"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo) REPO="$2"; shift 2;;
    --vault) VAULT="$2"; shift 2;;
    --run) RUN_PREFIX="$2"; shift 2;;
    --brief) BRIEF="$2"; shift 2;;
    --max) MAX="$2"; shift 2;;
    --timeout) TIMEOUT="$2"; shift 2;;
    --gate) GATE="$2"; shift 2;;
    *) echo "unknown arg $1" >&2; exit 2;;
  esac
done
[[ -n "$REPO" && -n "$VAULT" && -n "$RUN_PREFIX" && -n "$BRIEF" ]] || {
  echo "usage: loop.sh --repo <dir> --vault <dir> --run <prefix> --brief <text> [--max 3] [--timeout 5m] [--gate fast]" >&2
  exit 2
}

LOGDIR="$REPO/.orchestration/$RUN_PREFIX"
mkdir -p "$REPO/.orchestration"
echo '*' > "$REPO/.orchestration/.gitignore"   # idempotent; forensic dir is gitignored

# Concurrency guard: two loops sharing a --run prefix would race on the same
# per-attempt checkpoint state (.orchestration/<prefix>-attemptN) and corrupt both.
# mkdir is atomic — if the lock dir already exists, another loop holds this prefix;
# refuse rather than corrupt. Released on ANY exit via the trap (review #2).
LOCK="$REPO/.orchestration/${RUN_PREFIX}.lock"
if ! mkdir "$LOCK" 2>/dev/null; then
  echo "loop: a run with prefix '$RUN_PREFIX' is already in progress ($LOCK). Refusing to avoid checkpoint-state corruption." >&2
  exit 5
fi
trap 'rmdir "$LOCK" 2>/dev/null || true' EXIT

mkdir -p "$LOGDIR"
LOG="$LOGDIR/loop.jsonl"

# redact() (shared, from lib.sh) scrubs secrets before anything is PERSISTED (logs).
# The brief in flight is sent to agy intact — agy needs the real instructions;
# redaction is for disk only.

# Classify a reason set by its CLASS, not its exact text, so two failures with the
# same cause but different file paths ("unclaimed change: a" vs "...: b") compare
# equal. verdict.sh's reason vocabulary is "<class>: <detail>" or "tsc failed", so
# the class is everything before the first ':'. Pure bash/sed — no extra runtime.
normalize_reasons() { # stdin: reasons (one per line or '|'-joined) -> stdout: class set
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

  if ! "$DIR/checkpoint.sh" snapshot "$RUN_ID" "$REPO" "$VAULT" >/dev/null 2>&1; then
    echo "loop: snapshot failed for $RUN_ID — cannot proceed without a recoverable checkpoint" >&2
    exit 4
  fi

  # set +e ONLY around delegate (we want its nonzero rc, not an abort); capture drc,
  # then restore set -e BEFORE the signal check so all error-prone code below is
  # guarded. Keep this ordering — moving the case into the set +e block would let a
  # later failure pass silently (review #6).
  set +e
  "$DIR/delegate_agy.sh" --repo "$REPO" --run "$RUN_ID" --brief "$BRIEF_CUR" --timeout "$TIMEOUT" >/dev/null 2>&1
  drc=$?
  set -e
  case "$drc" in 130|143) exit "$drc";; esac   # user interrupt aborts the whole loop

  status="FAIL"; reasons=""
  DIGEST="$REPO/.orchestration/$RUN_ID/digest.json"
  RESULT="$REPO/.orchestration/$RUN_ID/result.md"

  if [[ "$drc" -ne 0 ]]; then
    reasons="delegate failed: no STATUS COMPLETE sentinel (agy crashed or timed out)"
  elif [[ ! -f "$DIGEST" ]]; then
    # A missing digest is a hard FAIL, never a guess. Treating "agy didn't say what
    # it touched" as a leak-by-default is the safe direction (see plan §0 reasoning).
    reasons="missing digest: agy did not emit the required digest.json manifest"
  elif [[ -f "$RESULT" ]] && ! "$DIR/authority-guard.sh" "$RESULT" >/dev/null 2>&1; then
    reasons="authority-guard: result.md contains an agy-authored human-authority claim"
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

  # Honest ledger entry (best-effort bookkeeping — never fatal to the loop).
  "$DIR/self_eval.sh" record --run "$RUN_ID" --repo "$REPO" >/dev/null 2>&1 || true

  # Structured, redacted per-attempt log line.
  ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  brief_red="$(printf '%s' "$BRIEF_CUR" | redact)"
  reasons_red="$(printf '%s' "$reasons" | redact)"
  jq -n --arg ts "$ts" --argjson attempt "$attempt" --arg run "$RUN_ID" \
        --arg status "$status" --arg reasons "$reasons_red" --arg brief "$brief_red" \
        '{ts:$ts, attempt:$attempt, run:$run, status:$status, reasons:$reasons, brief:$brief}' \
        >> "$LOG"

  if [[ "$status" == "PASS" ]]; then
    echo "loop: PASS on attempt $attempt/$MAX"
    exit 0
  fi

  # FAILED: roll back to the clean snapshot before the next attempt — never start
  # attempt N+1 from a poisoned tree. A FAILED rollback is itself fatal: checkpoint's
  # restore is two-phase (repo then vault), so a mid-rollback failure can leave a torn
  # state that the next attempt would snapshot as its baseline (review #1). Abort
  # loudly with a distinct exit code rather than swallowing it with `|| true`.
  if ! "$DIR/checkpoint.sh" rollback "$RUN_ID" "$REPO" "$VAULT" >/dev/null 2>&1; then
    echo "loop: rollback FAILED for $RUN_ID — repo/vault may be torn. Aborting; run 'checkpoint.sh status $RUN_ID $REPO $VAULT' and recover before retrying." >&2
    exit 3
  fi

  norm="$(printf '%s' "$reasons" | normalize_reasons)"
  if [[ -n "$PREV_NORM" && "$norm" == "$PREV_NORM" ]]; then
    echo "loop: EARLY EXIT on attempt $attempt — repeated failure class '$norm', no progress." >&2
    exit 2
  fi
  PREV_NORM="$norm"

  # Feed the concrete reasons forward so the next attempt gets real feedback, not a
  # blind retry. Sent to agy intact (not redacted — agy needs the detail).
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
