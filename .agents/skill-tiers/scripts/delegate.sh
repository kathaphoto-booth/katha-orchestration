#!/usr/bin/env bash
# delegate.sh — executor router for skill-tiers.
#
# Generalizes delegate_agy.sh: dispatches to the correct executor adapter
# (delegate_agy.sh or delegate_copilot.sh) based on --executor.
# Passes --skill and --phase as environment vars so adapters can surface them
# in their prompts without changing the sentinel/digest contract.
#
# Usage:
#   delegate.sh --executor <agy|copilot> --repo <dir> --run <id> --brief <text>
#               [--skill <name>] [--phase <name>] [--timeout 5m] [--tier <N>]
#
# --tier <N>: skill tier from frontmatter. When executor=copilot and N >= 2,
#             passes --allow-write to delegate_copilot.sh. Default: no write.
#
# Standalone (not sourced) — set -euo pipefail is safe here.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

EXECUTOR=""
REPO=""
RUN=""
BRIEF=""
TIMEOUT="5m"
SKILL=""
PHASE=""
TIER=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --executor) [[ $# -ge 2 ]] || { echo "delegate: --executor requires a value" >&2; exit 2; }; EXECUTOR="$2"; shift 2;;
    --repo)     [[ $# -ge 2 ]] || { echo "delegate: --repo requires a value" >&2; exit 2; }; REPO="$2";     shift 2;;
    --run)      [[ $# -ge 2 ]] || { echo "delegate: --run requires a value" >&2; exit 2; }; RUN="$2";      shift 2;;
    --brief)    [[ $# -ge 2 ]] || { echo "delegate: --brief requires a value" >&2; exit 2; }; BRIEF="$2";    shift 2;;
    --timeout)  [[ $# -ge 2 ]] || { echo "delegate: --timeout requires a value" >&2; exit 2; }; TIMEOUT="$2";  shift 2;;
    --skill)    [[ $# -ge 2 ]] || { echo "delegate: --skill requires a value" >&2; exit 2; }; SKILL="$2";    shift 2;;
    --phase)    [[ $# -ge 2 ]] || { echo "delegate: --phase requires a value" >&2; exit 2; }; PHASE="$2";    shift 2;;
    --tier)     [[ $# -ge 2 ]] || { echo "delegate: --tier requires a value" >&2; exit 2; }; TIER="$2";     shift 2;;
    *) echo "unknown arg $1" >&2; exit 2;;
  esac
done
[[ -n "$EXECUTOR" && -n "$REPO" && -n "$RUN" && -n "$BRIEF" ]] || {
  echo "usage: delegate.sh --executor <agy|copilot> --repo <dir> --run <id> --brief <text> [--skill <name>] [--phase <name>] [--timeout 5m] [--tier <N>]" >&2
  exit 2
}

# Export for adapters to embed in their prompts (cosmetic/tracing only —
# does not affect the sentinel/digest contract).
export SKILL_TIER_SKILL="$SKILL"
export SKILL_TIER_PHASE="$PHASE"

case "$EXECUTOR" in
  agy)
    exec "$DIR/delegate_agy.sh" --repo "$REPO" --run "$RUN" --brief "$BRIEF" --timeout "$TIMEOUT"
    ;;
  copilot)
    COPILOT_ARGS=(--repo "$REPO" --run "$RUN" --brief "$BRIEF" --timeout "$TIMEOUT")
    # 2>/dev/null: suppresses arithmetic error when TIER is non-integer; comparison safely returns false
    if [[ -n "$TIER" ]] && [[ "$TIER" -ge 2 ]] 2>/dev/null; then
      COPILOT_ARGS+=(--allow-write)
    fi
    exec "$DIR/delegate_copilot.sh" "${COPILOT_ARGS[@]}"
    ;;
  *)
    echo "delegate.sh: unknown executor '$EXECUTOR' (supported: agy, copilot)" >&2
    exit 2
    ;;
esac
