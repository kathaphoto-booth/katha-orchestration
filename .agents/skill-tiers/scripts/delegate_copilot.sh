#!/usr/bin/env bash
# delegate_copilot.sh --repo <dir> --run <id> --brief <text> [--timeout 5m]
#                     [--allow-write]
#
# Copilot CLI executor adapter for skill-tiers. Mirrors delegate_agy.sh's
# sentinel + digest contract exactly:
#   - Requires STATUS: COMPLETE as the final line of result.md.
#   - Requires a valid digest.json with files_touched[] + external_effects[].
#   - On failure, scopes a git stash to this run's delta (same as agy adapter).
#
# Permission model (read-only by default, safe for tier 1):
#   --deny-tool=write --deny-tool=shell are ALWAYS passed unless --allow-write
#   is explicitly provided. --allow-write is only granted by delegate.sh when
#   the skill's frontmatter tier.current >= 2 (write capability tier). Tier 1
#   stays read-only / proof-of-concept: it proves the sentinel+digest round-trip
#   works before granting any write surface.
#
# Standalone (not sourced) — set -euo pipefail is safe here.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./lib.sh
source "$DIR/lib.sh"

REPO=""
RUN=""
BRIEF=""
TIMEOUT="5m"
ALLOW_WRITE=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo)        REPO="$2";  shift 2;;
    --run)         RUN="$2";   shift 2;;
    --brief)       BRIEF="$2"; shift 2;;
    --timeout)     TIMEOUT="$2"; shift 2;;
    --allow-write) ALLOW_WRITE=1; shift;;
    *) echo "unknown arg $1" >&2; exit 2;;
  esac
done
[[ -n "$REPO" && -n "$RUN" && -n "$BRIEF" ]] || {
  echo "usage: delegate_copilot.sh --repo <dir> --run <id> --brief <text> [--timeout 5m] [--allow-write]" >&2
  exit 2
}

COPILOT_BIN="${COPILOT_BIN:-copilot}"

# (1) Baseline the changed-set BEFORE we touch anything (same scoped-stash
#     pattern as delegate_agy.sh, council #1).
BASE_F="$(mktemp)"
changed_set "$REPO" 2>/dev/null | sort > "$BASE_F" || true

OUT="$REPO/.orchestration/$RUN"
mkdir -p "$REPO/.orchestration"
echo '*' > "$REPO/.orchestration/.gitignore"
mkdir -p "$OUT"

# (2) Build the prompt. Identical sentinel + digest requirements to agy adapter —
#     the verification gate is executor-agnostic and must not be relaxed here.
PROMPT="Execute: ${BRIEF}
Skill: ${SKILL_TIER_SKILL:-unknown}  Phase: ${SKILL_TIER_PHASE:-unknown}

Write your complete result to ${OUT}/result.md.
You MUST also write a machine-readable digest to ${OUT}/digest.json — valid JSON, exactly this shape, no prose, no markdown fences:
{\"files_touched\": [\"<repo-relative path>\", ...], \"external_effects\": [\"<migration|deploy|email|etc>\", ...]}
List in files_touched EVERY repo file you create or modify (the verifier compares this against git reality; an unlisted change is treated as a leak). Put [] for external_effects unless you genuinely triggered one.
As the FINAL line of result.md, write exactly this transaction sentinel and nothing after it:
STATUS: COMPLETE"

# (3) Build copilot flags. Default: read-only (deny write + shell).
#     --allow-all-tools is required for non-interactive mode (no TTY).
#     --deny-tool takes precedence over --allow-all-tools per copilot's own
#     documented permission model, so write/shell stay blocked at tier 1
#     even with --allow-all-tools present.
COPILOT_FLAGS=(--allow-all-tools --deny-tool=shell --silent --log-level error)
if [[ "$ALLOW_WRITE" -eq 0 ]]; then
  COPILOT_FLAGS+=(--deny-tool=write)
fi

# Pre-flight: confirm copilot binary is present and responsive.
if ! run_with_timeout 15 "$COPILOT_BIN" --version < /dev/null >/dev/null 2>&1; then
  echo "FAILED: copilot CLI not found or not responding (pre-flight '--version' failed)" >&2
  rm -f "$BASE_F"
  exit 1
fi

# Parse timeout to seconds for run_with_timeout. Supports "Nm" (minutes) or "Ns" (seconds).
TIMEOUT_SECS="$TIMEOUT"
if [[ "$TIMEOUT" =~ ^([0-9]+)m$ ]]; then
  TIMEOUT_SECS=$(( ${BASH_REMATCH[1]} * 60 ))
elif [[ "$TIMEOUT" =~ ^([0-9]+)s$ ]]; then
  TIMEOUT_SECS="${BASH_REMATCH[1]}"
fi

# Log the invocation flags for tier gating audit trail (risk T7/T11 verification).
echo "copilot flags: ${COPILOT_FLAGS[*]}" > "$OUT/.copilot.log.raw"

set +e
run_with_timeout "$TIMEOUT_SECS" "$COPILOT_BIN" -p "$PROMPT" "${COPILOT_FLAGS[@]}" \
  < /dev/null >> "$OUT/.copilot.log.raw" 2>&1
rc=$?
set -e
# Redact before persisting — brief may carry secrets echoed back.
redact < "$OUT/.copilot.log.raw" > "$OUT/copilot.log"; rm -f "$OUT/.copilot.log.raw"
# Propagate interrupt/termination signals.
case "$rc" in 130|143) exit "$rc";; esac

# (4) Completion is the SENTINEL, not copilot's exit code.
sentinel_ok() {
  local f="$1"
  [[ -f "$f" ]] || return 1
  tail -n 3 "$f" | tr -d '\r' | grep -qx 'STATUS: COMPLETE'
}

if sentinel_ok "$OUT/result.md"; then
  rm -f "$BASE_F"
  echo "OK: run $RUN complete"
  exit 0
fi

# (5) FAILED. Scoped stash of this run's delta (same pattern as agy adapter).
echo "FAILED: copilot died / incomplete (no STATUS: COMPLETE sentinel)" >&2
POST_F="$(mktemp)"
changed_set "$REPO" 2>/dev/null | sort > "$POST_F" || true
DELTA=()
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  case "$line" in .orchestration/*) continue;; esac
  DELTA+=("$line")
done < <(comm -13 "$BASE_F" "$POST_F")
rm -f "$BASE_F" "$POST_F"

if [[ "${#DELTA[@]}" -gt 0 ]]; then
  git -C "$REPO" stash push -u -m "orchestration/$RUN incomplete (copilot)" -- "${DELTA[@]}" >/dev/null 2>&1 \
    || echo "WARN: scoped stash failed for run $RUN; WIP left in tree (not reset)." >&2
fi
exit 1
