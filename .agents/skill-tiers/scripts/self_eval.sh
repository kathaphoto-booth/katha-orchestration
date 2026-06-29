#!/usr/bin/env bash
# self_eval.sh — the orchestrator's honest, deterministic self-improvement ledger.
# Promoted from antigravity/scripts/ to skill-tiers/scripts/.
#
# Extensions over the antigravity version:
#   record gains --skill <name>, --tier <N>, --executor <agy|copilot> flags
#   (all optional; recorded as null when absent for backward compat).
#   record reads drift_check and taste_checkpoint from .verdict.json and
#   appends them to the ledger entry.
#
#   Commands:
#     record  --run <id> --repo <dir> [--tokens N] [--claimed 0|1]
#             [--skill <name>] [--tier <N>] [--executor <agy|copilot>]
#     report  --repo <dir>
#
set -uo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./lib.sh
source "$DIR/lib.sh"

CMD="${1:-}"; shift || true

sentinel_claims_complete() {
  local f="$1"
  [[ -f "$f" ]] || return 1
  tail -n 3 "$f" | tr -d '\r' | grep -qx 'STATUS: COMPLETE'
}

cmd_record() {
  local RUN="" REPO="" TOKENS="null" CLAIMED="" SKILL="" TIER="null" EXECUTOR="" PHASES_RUN="null"
  while [[ $# -gt 0 ]]; do case "$1" in
    --run)      RUN="$2";      shift 2;;
    --repo)     REPO="$2";     shift 2;;
    --tokens)   TOKENS="$2";   shift 2;;
    --claimed)  CLAIMED="$2";  shift 2;;
    --skill)    SKILL="$2";    shift 2;;
    --tier)     TIER="$2";     shift 2;;
    --executor) EXECUTOR="$2"; shift 2;;
    --phases)   PHASES_RUN="$2"; shift 2;;
    *) echo "unknown arg $1" >&2; exit 2;; esac; done
  [[ -n "$RUN" && -n "$REPO" ]] || {
    echo "usage: self_eval.sh record --run <id> --repo <dir> [--tokens N] [--claimed 0|1] [--skill <name>] [--tier <N>] [--executor <name>] [--phases <json>]" >&2
    exit 2
  }

  local LEDGER="$REPO/.orchestration/ledger.jsonl"
  mkdir -p "$(dirname "$LEDGER")"

  local status lines reasons drift_check taste_checkpoint
  if [[ -f "$REPO/.verdict.json" ]]; then
    status=$(jq -r '.status // "UNKNOWN"' "$REPO/.verdict.json")
    lines=$(jq '(.real_changes // []) | length' "$REPO/.verdict.json")
    reasons=$(jq -c '.reasons // []' "$REPO/.verdict.json")
    drift_check=$(jq -r '.drift_check // "SKIPPED"' "$REPO/.verdict.json")
    taste_checkpoint=$(jq -r '.taste_checkpoint // "SKIPPED"' "$REPO/.verdict.json")
  else
    status="NO_GATE"; lines=0; reasons='["no .verdict.json — delegation ran without the gate"]'
    drift_check="SKIPPED"; taste_checkpoint="SKIPPED"
  fi

  local claimed
  if [[ -n "$CLAIMED" ]]; then
    claimed="$CLAIMED"
  elif [[ -f "$REPO/.orchestration/$RUN/result.md" ]]; then
    if sentinel_claims_complete "$REPO/.orchestration/$RUN/result.md"; then claimed=1; else claimed=0; fi
  else
    claimed="null"
  fi

  local honest="null"
  if [[ "$claimed" != "null" && "$status" != "UNKNOWN" ]]; then
    if { [[ "$status" == "PASS" ]] && [[ "$claimed" == "1" ]]; } ||
       { [[ "$status" != "PASS" ]] && [[ "$claimed" == "0" ]]; }; then
      honest="true"
    else
      honest="false"
    fi
  fi

  local TS; TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  jq -nc \
    --arg ts "$TS" --arg run "$RUN" --arg verdict "$status" \
    --arg skill "$SKILL" --argjson tier "$TIER" --arg executor "$EXECUTOR" \
    --argjson phases_run "$PHASES_RUN" \
    --argjson claimed "$claimed" --argjson honest "$honest" \
    --argjson lines "$lines" --argjson tokens "$TOKENS" --argjson reasons "$reasons" \
    --arg drift_check "$drift_check" --arg taste_checkpoint "$taste_checkpoint" \
    '{ts:$ts, run:$run, skill:(if $skill=="" then null else $skill end),
      tier:$tier, executor:(if $executor=="" then null else $executor end),
      phases_run:$phases_run,
      verdict:$verdict, claimed:$claimed, honest:$honest,
      lines:$lines, tokens:$tokens,
      t2d: (if $tokens==null then null else ($tokens / (if $lines>0 then $lines else 1 end)) end),
      reasons:$reasons, drift_check:$drift_check, taste_checkpoint:$taste_checkpoint}' >> "$LEDGER"
  echo "recorded: run=$RUN verdict=$status honest=$honest drift_check=$drift_check taste_checkpoint=$taste_checkpoint"
}

cmd_report() {
  local REPO=""
  while [[ $# -gt 0 ]]; do case "$1" in
    --repo) REPO="$2"; shift 2;; *) echo "unknown arg $1" >&2; exit 2;; esac; done
  [[ -n "$REPO" ]] || { echo "usage: self_eval.sh report --repo <dir>" >&2; exit 2; }
  local LEDGER="$REPO/.orchestration/ledger.jsonl"
  [[ -f "$LEDGER" ]] || { echo "no ledger yet at $LEDGER"; return 0; }

  jq -s '{
    runs: length,
    pass: ([.[]|select(.verdict=="PASS")]|length),
    failed_or_ungated: ([.[]|select(.verdict!="PASS")]|length),
    assessable: ([.[]|select(.honest!=null)]|length),
    honest: ([.[]|select(.honest==true)]|length),
    dishonest: ([.[]|select(.honest==false)]|length),
    drift_failures: ([.[]|select(.drift_check=="FAIL")]|length),
    taste_failures: ([.[]|select(.taste_checkpoint=="FAIL")]|length),
    avg_t2d: ([.[]|.t2d|select(.!=null)] | if length>0 then (add/length) else null end),
    top_reasons: ([.[]|select(.verdict!="PASS")|.reasons[]?] | group_by(.) | map({reason:.[0], n:length}) | sort_by(-.n) | .[0:5])
  }
  | "=== self-eval report ===",
    "runs=\(.runs)  pass=\(.pass)  failed/ungated=\(.failed_or_ungated)",
    "honesty: \(.honest)/\(.assessable) honest" + (if .dishonest>0 then "  ⚠ \(.dishonest) DISHONEST (claimed success, gate disagreed)" else "" end),
    "drift failures: \(.drift_failures)  taste failures: \(.taste_failures)",
    "avg T2D (tokens/line): \(.avg_t2d // "n/a — token counts not recorded")",
    (if (.top_reasons|length)>0 then "recurring leak reasons:" else "no leak reasons recorded" end),
    (.top_reasons[]? | "  [\(.n)x] \(.reason)"),
    (if .dishonest>0 then "→ graduate: write a RED test reproducing each dishonest run so the gate catches it next time." else "" end),
    (if (.top_reasons[0]?.n // 0) >= 3 then "→ graduate: a leak reason recurred 3+ times — encode it as a verdict/authority rule + test." else "" end)
  ' -r "$LEDGER"
}

case "$CMD" in
  record) cmd_record "$@";;
  report) cmd_report "$@";;
  *) echo "usage: self_eval.sh <record|report> ..." >&2; exit 2;;
esac
