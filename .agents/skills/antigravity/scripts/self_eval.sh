#!/usr/bin/env bash
# self_eval.sh — the orchestrator's honest, deterministic self-improvement ledger.
#
#   record  --run <id> --repo <dir> [--tokens N] [--claimed 0|1]
#   report  --repo <dir>
#
# Honesty model (Jed): never trust a run's self-report. Each delegation is graded
# against GIT-TRUTH — verdict.sh's .verdict.json — and the ledger records
# `honest:false` whenever a run CLAIMED success (STATUS: COMPLETE sentinel) while
# the gate said FAIL. Missing inputs are recorded as null, never invented. The
# report then surfaces what to GRADUATE into the RED suite — that is the loop:
# delegate -> gate -> self_eval -> graduate -> the suite gets stricter over time.
#
# Standalone script — set -euo pipefail is safe; lib.sh is sourced for nothing
# heavier than consistency with the rest of the skill.
set -uo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./lib.sh
source "$DIR/lib.sh"

CMD="${1:-}"; shift || true

sentinel_claims_complete() {  # <result.md> -> 0 if it claims completion
  local f="$1"
  [[ -f "$f" ]] || return 1
  tail -n 3 "$f" | tr -d '\r' | grep -qx 'STATUS: COMPLETE'
}

cmd_record() {
  local RUN="" REPO="" TOKENS="null" CLAIMED=""
  while [[ $# -gt 0 ]]; do case "$1" in
    --run) RUN="$2"; shift 2;; --repo) REPO="$2"; shift 2;;
    --tokens) TOKENS="$2"; shift 2;; --claimed) CLAIMED="$2"; shift 2;;
    *) echo "unknown arg $1" >&2; exit 2;; esac; done
  [[ -n "$RUN" && -n "$REPO" ]] || { echo "usage: self_eval.sh record --run <id> --repo <dir> [--tokens N] [--claimed 0|1]" >&2; exit 2; }

  local LEDGER="$REPO/.orchestration/ledger.jsonl"
  mkdir -p "$(dirname "$LEDGER")"

  # Truth from the gate — never the digest.
  local status lines reasons
  if [[ -f "$REPO/.verdict.json" ]]; then
    status=$(jq -r '.status // "UNKNOWN"' "$REPO/.verdict.json")
    lines=$(jq '(.real_changes // []) | length' "$REPO/.verdict.json")
    reasons=$(jq -c '.reasons // []' "$REPO/.verdict.json")
  else
    status="NO_GATE"; lines=0; reasons='["no .verdict.json — delegation ran without the gate"]'
  fi

  # What did the run CLAIM? explicit flag wins; else infer from the sentinel.
  local claimed
  if [[ -n "$CLAIMED" ]]; then
    claimed="$CLAIMED"
  elif [[ -f "$REPO/.orchestration/$RUN/result.md" ]]; then
    if sentinel_claims_complete "$REPO/.orchestration/$RUN/result.md"; then claimed=1; else claimed=0; fi
  else
    claimed="null"
  fi

  # Honest = the claim matched git reality. null when not assessable (self-admit).
  local honest="null"
  if [[ "$claimed" != "null" && "$status" != "UNKNOWN" ]]; then
    if { [[ "$status" == "PASS" ]] && [[ "$claimed" == "1" ]]; } || \
       { [[ "$status" != "PASS" ]] && [[ "$claimed" == "0" ]]; }; then honest="true"; else honest="false"; fi
  fi

  local TS; TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  jq -nc \
    --arg ts "$TS" --arg run "$RUN" --arg verdict "$status" \
    --argjson claimed "$claimed" --argjson honest "$honest" \
    --argjson lines "$lines" --argjson tokens "$TOKENS" --argjson reasons "$reasons" \
    '{ts:$ts, run:$run, verdict:$verdict, claimed:$claimed, honest:$honest,
      lines:$lines, tokens:$tokens,
      t2d: (if $tokens==null then null else ($tokens / (if $lines>0 then $lines else 1 end)) end),
      reasons:$reasons}' >> "$LEDGER"
  echo "recorded: run=$RUN verdict=$status honest=$honest"
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
    avg_t2d: ([.[]|.t2d|select(.!=null)] | if length>0 then (add/length) else null end),
    top_reasons: ([.[]|select(.verdict!="PASS")|.reasons[]?] | group_by(.) | map({reason:.[0], n:length}) | sort_by(-.n) | .[0:5])
  }
  | "=== self-eval report ===",
    "runs=\(.runs)  pass=\(.pass)  failed/ungated=\(.failed_or_ungated)",
    "honesty: \(.honest)/\(.assessable) honest" + (if .dishonest>0 then "  ⚠ \(.dishonest) DISHONEST (claimed success, gate disagreed)" else "" end),
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
