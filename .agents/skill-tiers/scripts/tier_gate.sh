#!/usr/bin/env bash
# tier_gate.sh [ack | --skill <name> --repo <dir>]
#
# Subcommand: ack
#   tier_gate.sh ack --skill <name> --run <run-id>
#   Writes a human acknowledgment row to tiers.jsonl for a specific run.
#   Row format: {"skill":"...","run":"...","human_ack_ts":"<ISO8601 UTC>","type":"ack"}
#
# Default subcommand (check):
#   tier_gate.sh --skill <name> --repo <dir>
#
#   Reads ledger.jsonl + promotion-gates.json to determine whether a skill has
#   earned enough evidence to be promoted from its current tier to its target.
#
# Output (stdout):
#   PASS  — clean-run and session requirements met; human (Jed) may promote by
#            editing tier.current in the skill's SKILL.md frontmatter.
#   HOLD  — not enough clean runs or distinct sessions yet.
#   FAIL  — a hard gate condition is violated (dishonest run, unclaimed leak, etc.)
#            The clean-run streak is reset to zero for this run's entry.
#
# Updates .agents/skill-tiers/state/tiers.jsonl with the latest counts after
# each check (tiers.jsonl is a CACHE — ledger.jsonl remains the source of truth).
#
# Promotion is NEVER performed automatically. tier_gate.sh recommends; a human
# edits the YAML. This is the one deliberate friction point that survives tier 4.
#
# For the 3->4 gate specifically, EVERY clean run additionally requires a
# human_ack_ts ack row in tiers.jsonl (written AFTER the run's ts). This is the
# one friction point that survives to tier 4 — Jed never does verification work,
# but Jed never gets removed from the promotion decision.
#
# Standalone (not sourced) — set -euo pipefail is safe here.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="$DIR/../state"
GATES_FILE="$STATE_DIR/promotion-gates.json"
TIERS_FILE="$STATE_DIR/tiers.jsonl"

# ── Subcommand: ack ──────────────────────────────────────────────────────────
if [[ "${1:-}" == "ack" ]]; then
  shift
  ACK_SKILL=""
  ACK_RUN=""
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --skill) ACK_SKILL="$2"; shift 2;;
      --run)   ACK_RUN="$2";   shift 2;;
      *) echo "unknown arg $1" >&2
         echo "usage: tier_gate.sh ack --skill <name> --run <run-id>" >&2
         exit 2;;
    esac
  done
  [[ -n "$ACK_SKILL" && -n "$ACK_RUN" ]] || {
    echo "usage: tier_gate.sh ack --skill <name> --run <run-id>" >&2
    exit 2
  }
  mkdir -p "$STATE_DIR"
  if [[ -f "$TIERS_FILE" ]] && jq -e --arg skill "$ACK_SKILL" --arg run "$ACK_RUN" \
      'select(.type=="ack" and .skill==$skill and .run==$run)' "$TIERS_FILE" > /dev/null 2>&1; then
    echo "human_ack_ts already recorded: skill='$ACK_SKILL' run='$ACK_RUN' (idempotent — no duplicate written)"
    exit 0
  fi
  ACK_TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  ACK_ROW=$(jq -cn \
    --arg skill "$ACK_SKILL" --arg run "$ACK_RUN" --arg ts "$ACK_TS" \
    '{skill:$skill, run:$run, human_ack_ts:$ts, type:"ack"}')
  echo "$ACK_ROW" >> "$TIERS_FILE"
  echo "human_ack_ts recorded: skill='$ACK_SKILL' run='$ACK_RUN'"
  exit 0
fi

# ── Default subcommand: check ────────────────────────────────────────────────
SKILL=""
REPO=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --skill) SKILL="$2"; shift 2;;
    --repo)  REPO="$2";  shift 2;;
    *) echo "unknown arg $1" >&2; exit 2;;
  esac
done
[[ -n "$SKILL" && -n "$REPO" ]] || {
  echo "usage: tier_gate.sh --skill <name> --repo <dir>" >&2
  exit 2
}

LEDGER="$REPO/.orchestration/ledger.jsonl"
[[ -f "$LEDGER" ]] || {
  echo "HOLD: no ledger yet at $LEDGER (0 runs recorded for skill '$SKILL')"
  exit 0
}
[[ -f "$GATES_FILE" ]] || {
  echo "tier_gate.sh: promotion-gates.json not found at $GATES_FILE" >&2
  exit 2
}

# Read current tier state for this skill from tiers.jsonl (or default to tier 0).
CURRENT_TIER=0
TARGET_TIER=1
if [[ -f "$TIERS_FILE" ]]; then
  # -c flag: compact single-line output so tail -1 returns the whole object,
  # not just the closing "}" of a pretty-printed entry.
  # Only consider evidence rows (not ack rows) for tier state.
  ROW=$(jq -rc --arg skill "$SKILL" 'select(.skill==$skill and .type != "ack")' "$TIERS_FILE" 2>/dev/null | tail -1)
  if [[ -n "$ROW" ]]; then
    CURRENT_TIER=$(echo "$ROW" | jq -r '.current_tier // 0')
    TARGET_TIER=$(echo  "$ROW" | jq -r '.target_tier // 1')
  fi
fi

TRANSITION="${CURRENT_TIER}->${TARGET_TIER}"

# Load gate requirements for this transition.
GATE_ROW=$(jq -r --arg t "$TRANSITION" '.[$t] // empty' "$GATES_FILE")
if [[ -z "$GATE_ROW" ]]; then
  echo "HOLD: no gate defined for transition '$TRANSITION' in promotion-gates.json"
  exit 0
fi

REQUIRED_CLEAN=$(echo "$GATE_ROW" | jq -r '.clean_runs // 5')
REQUIRED_SESSIONS=$(echo "$GATE_ROW" | jq -r '.distinct_sessions // 1')
REQUIRED_FIELDS_JSON=$(echo "$GATE_ROW" | jq -c '.required_fields // []')

# For the 3->4 gate: build a JSON object mapping run_id -> human_ack_ts from
# ack rows in tiers.jsonl. Only include acks for this skill.
ACKED_RUNS="{}"
if [[ "$CURRENT_TIER" -eq 3 && "$TARGET_TIER" -eq 4 && -f "$TIERS_FILE" ]]; then
  ACKED_RUNS=$(jq -rsc --arg skill "$SKILL" '
    [ .[] | select(.type == "ack" and .skill == $skill) | {(.run): .human_ack_ts} ] |
    add // {}
  ' "$TIERS_FILE" || echo "{}")
fi

# T7: Check copilot logs for --deny-tool flags.
# Build a JSON map of run -> boolean indicating if it passed the check.
DENY_OK_JSON="{}"
COPILOT_RUNS=$(jq -r --arg skill "$SKILL" '
  select(.skill == $skill and .executor == "copilot") | .run + " " + ((.tier // 0) | tostring)
' "$LEDGER" 2>/dev/null || true)

if [[ -n "$COPILOT_RUNS" ]]; then
  while read -r run_id run_tier; do
    [[ -z "$run_id" ]] && continue
    log_file="$REPO/.orchestration/$run_id/copilot.log"
    ok=true
    if [[ ! -f "$log_file" ]]; then
      ok=false
    else
      # Check --deny-tool=shell (always required)
      if ! grep -q -- "--deny-tool=shell" "$log_file"; then
        ok=false
      fi
      # Check --deny-tool=write (required if tier < 2)
      if [[ "$run_tier" -lt 2 ]] && ! grep -q -- "--deny-tool=write" "$log_file"; then
        ok=false
      fi
    fi
    DENY_OK_JSON=$(jq -n --argjson obj "$DENY_OK_JSON" --arg run "$run_id" --argjson ok "$ok" '$obj + {($run): $ok}')
  done <<< "$COPILOT_RUNS"
fi

# A "clean run" definition varies by tier transition. required_fields encodes
# which ledger fields must be "PASS" (not "FAIL" or "SKIPPED") for this tier.
# Base requirements always: verdict=="PASS" AND honest==true AND no dishonesty.
#
# For the 3->4 gate, a clean run additionally requires a human_ack_ts ack row
# that is no earlier than the run's own ts.
#
# One dishonest run RESETS THE STREAK TO ZERO — it cannot be averaged out.
# We compute the streak by finding the longest suffix of runs that are all clean
# and have no dishonest run in between.
RESULT=$(jq -s --arg skill "$SKILL" \
              --argjson current_tier "$CURRENT_TIER" \
              --argjson required_clean "$REQUIRED_CLEAN" \
              --argjson required_sessions "$REQUIRED_SESSIONS" \
              --argjson required_fields "$REQUIRED_FIELDS_JSON" \
              --argjson acked_runs "$ACKED_RUNS" \
              --argjson deny_ok "$DENY_OK_JSON" '
  # Filter to this skill only; keep chronological order.
  [ .[] | select(.skill == $skill or ($skill == "" and .skill == null)) ] as $runs |

  # Find the last dishonest run index (0-based). Streak resets after any dishonest run.
  ($runs | to_entries | map(select(.value.honest == false)) | last | .key // -1) as $last_dishonest |

  # Clean candidates = runs AFTER the last dishonest run.
  $runs[($last_dishonest + 1):] as $candidates |

  # A clean run: verdict==PASS AND honest==true AND all required_fields == "PASS".
  # For the 3->4 gate: additionally requires human_ack_ts ack row newer than run.ts.
  # Note: using `. as $r` avoids filter-argument context pollution when `is_clean`
  # is called inside map/select — a jq def(arg) filter is re-invoked with the
  # outer context inside combinators like all(), which causes indexing errors.
  def is_clean:
    . as $r |
    $r.verdict == "PASS" and $r.honest == true
    and ($required_fields | all(. as $f | ($r | .[$f]) == "PASS"))
    and (
      if $r.executor == "copilot" then
        ($deny_ok[$r.run] // false) == true
      else
        true
      end
    )
    and (
      if $current_tier == 3 then
        ($acked_runs[$r.run] // null) != null
        and ($acked_runs[$r.run] >= $r.ts)
      else
        true
      end
    );

  ($candidates | map(select(is_clean)) ) as $clean_runs |
  ($clean_runs | length) as $clean_count |

  # Distinct sessions = distinct date prefixes of ts (YYYY-MM-DD).
  ($clean_runs | map(.ts[0:10]) | unique | length) as $distinct_sessions |

  # Check hard-gate: any dishonest run in the full history = FAIL signal.
  ($runs | map(select(.honest == false)) | length) as $total_dishonest |

  # For observability: how many of the human-acked runs are among the clean runs.
  ($clean_runs | map(select(($acked_runs[.run] // null) != null and ($acked_runs[.run] >= .ts))) | length) as $acked_clean_count |

  {
    skill: $skill,
    clean_count: $clean_count,
    required_clean: $required_clean,
    distinct_sessions: $distinct_sessions,
    required_sessions: $required_sessions,
    total_dishonest: $total_dishonest,
    last_dishonest_idx: $last_dishonest,
    clean_run_ids: ($clean_runs | map(.run)),
    acked_clean_count: $acked_clean_count,
    total_candidates: ($candidates | length)
  }
' "$LEDGER")

CLEAN_COUNT=$(echo "$RESULT" | jq -r '.clean_count')
DISTINCT=$(echo "$RESULT" | jq -r '.distinct_sessions')
TOTAL_DISHONEST=$(echo "$RESULT" | jq -r '.total_dishonest')
CLEAN_IDS=$(echo "$RESULT" | jq -c '.clean_run_ids')
ACKED_CLEAN_COUNT=$(echo "$RESULT" | jq -r '.acked_clean_count')

# Update tiers.jsonl with latest evidence (append; tier_gate.sh never edits
# tier.current — only humans do that).
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
TIERS_ROW=$(jq -cn \
  --arg skill "$SKILL" \
  --argjson ct "$CURRENT_TIER" --argjson tt "$TARGET_TIER" \
  --argjson cc "$CLEAN_COUNT" --argjson ds "$DISTINCT" \
  --arg ts "$TS" --argjson ids "$CLEAN_IDS" \
  '{skill:$skill, current_tier:$ct, target_tier:$tt,
    clean_runs_at_current_tier:$cc, distinct_sessions_at_current_tier:$ds,
    last_checked_ts:$ts, evidence_run_ids:$ids}')

# Rewrite tiers.jsonl: drop any existing evidence row for this skill (keep ack
# rows), append the fresh evidence row.
# -c flag keeps other-skill rows compact (one per line) so the file stays valid JSONL.
mkdir -p "$STATE_DIR"
TIERS_TMP="$(mktemp)"
trap 'rm -f "${TIERS_TMP:-}"' EXIT
if [[ -f "$TIERS_FILE" ]]; then
  jq -rc --arg skill "$SKILL" 'select(.skill != $skill or .type == "ack")' "$TIERS_FILE" > "$TIERS_TMP" || { rm -f "$TIERS_TMP"; echo "tier_gate: jq failed filtering tiers.jsonl — aborting to avoid cache wipe" >&2; exit 3; }
fi
echo "$TIERS_ROW" >> "$TIERS_TMP"
mv "$TIERS_TMP" "$TIERS_FILE"

# Determine verdict. Historical dishonesty doesn't block once the streak
# has recovered — it's reported as context only. Only the current streak count gates.
if [[ "$CLEAN_COUNT" -ge "$REQUIRED_CLEAN" && "$DISTINCT" -ge "$REQUIRED_SESSIONS" ]]; then
  ACK_SUFFIX=""
  if [[ "$CURRENT_TIER" -eq 3 && "$TARGET_TIER" -eq 4 ]]; then
    ACK_SUFFIX=" [${ACKED_CLEAN_COUNT} of ${CLEAN_COUNT} clean runs are human-acked]"
  fi
  echo "PASS: skill='$SKILL' transition='$TRANSITION' clean_runs=${CLEAN_COUNT}/${REQUIRED_CLEAN} sessions=${DISTINCT}/${REQUIRED_SESSIONS}${ACK_SUFFIX}"
  echo "      Human action required: edit tier.current in the skill's SKILL.md frontmatter to ${TARGET_TIER}."
  [[ "$TOTAL_DISHONEST" -gt 0 ]] && echo "      Note: $TOTAL_DISHONEST historical dishonest run(s) exist before the clean streak began."
  exit 0
fi

ACK_SUFFIX=""
if [[ "$CURRENT_TIER" -eq 3 && "$TARGET_TIER" -eq 4 ]]; then
  ACK_SUFFIX=" [${ACKED_CLEAN_COUNT} of ${CLEAN_COUNT} clean runs are human-acked]"
fi
echo "HOLD: skill='$SKILL' transition='$TRANSITION' clean_runs=${CLEAN_COUNT}/${REQUIRED_CLEAN} sessions=${DISTINCT}/${REQUIRED_SESSIONS}${ACK_SUFFIX}"
[[ "$TOTAL_DISHONEST" -gt 0 ]] && echo "      $TOTAL_DISHONEST dishonest run(s) reset the streak at some point — all subsequent clean runs count from zero after the last dishonest run."
exit 0
