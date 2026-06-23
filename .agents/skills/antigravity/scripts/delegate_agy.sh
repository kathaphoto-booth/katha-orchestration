#!/usr/bin/env bash
# delegate_agy.sh --repo <dir> --run <id> --brief <text> [--timeout 5m]
#
# Hardened delegation to the agy CLI (§4/§8). agy runs SANDBOXED with no
# external-effect tools; completion is judged by a transaction SENTINEL written
# to result.md, never by agy's exit code (a half-written result.md still exists
# and a crashed agy can still exit 0). On failure, the delegation's own WIP is
# PRESERVED via a SCOPED git stash — never `git reset --hard`, and never a
# blanket `git stash -u` that would sweep the repo's many unrelated untracked
# files (council finding #1).
#
# Standalone (not sourced) — `set -euo pipefail` is safe here.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./lib.sh
source "$DIR/lib.sh"

REPO=""
RUN=""
BRIEF=""
TIMEOUT="5m"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo) REPO="$2"; shift 2;;
    --run) RUN="$2"; shift 2;;
    --brief) BRIEF="$2"; shift 2;;
    --timeout) TIMEOUT="$2"; shift 2;;
    *) echo "unknown arg $1" >&2; exit 2;;
  esac
done
[[ -n "$REPO" && -n "$RUN" && -n "$BRIEF" ]] || {
  echo "usage: delegate_agy.sh --repo <dir> --run <id> --brief <text> [--timeout 5m]" >&2
  exit 2
}

AGY="${AGY_BIN:-/Volumes/samsung 970 pro - Data/KATHA_VAULT/bin/agy}"

# (1) Baseline the changed-set BEFORE we touch anything, so a failure stash can
#     be scoped to exactly the delta this delegation produced (council #1).
BASE_F="$(mktemp)"
changed_set "$REPO" 2>/dev/null | sort > "$BASE_F" || true

OUT="$REPO/.orchestration/$RUN"
mkdir -p "$REPO/.orchestration"
echo '*' > "$REPO/.orchestration/.gitignore"   # idempotent; see checkpoint.sh for rationale
mkdir -p "$OUT"
export AGY_OUT="$OUT"

# (2) Run agy sandboxed. agy self-bounds via --print-timeout (no external
#     `timeout` needed — and macOS ships none). Capture rc; do NOT `|| true`,
#     which would swallow user interrupts (council #3).
PROMPT="Execute: ${BRIEF}
Write your complete result to ${OUT}/result.md. As the FINAL line of result.md, write exactly this transaction sentinel and nothing after it:
STATUS: COMPLETE"

set +e
"$AGY" --sandbox --add-dir "$OUT" --print-timeout "$TIMEOUT" --print "$PROMPT" \
  < /dev/null > "$OUT/agy.log" 2>&1
rc=$?
set -e
# Propagate interrupt/termination signals instead of masking them as a normal
# (recoverable) delegation failure.
case "$rc" in 130|143) exit "$rc";; esac

# (3) Completion is the SENTINEL, not file existence or agy's rc. Check the tail
#     and strip CR so trailing \r / blank lines / mid-file noise can't fool it
#     (council #2).
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

# (4) FAILED. Preserve WIP with a SCOPED stash: only paths this run newly
#     changed (post-delta vs baseline), excluding the forensic .orchestration/
#     dir. Never sweep pre-existing untracked files.
echo "FAILED: agy died / incomplete (no STATUS: COMPLETE sentinel)" >&2
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
  git -C "$REPO" stash push -u -m "orchestration/$RUN incomplete" -- "${DELTA[@]}" >/dev/null 2>&1 \
    || echo "WARN: scoped stash failed for run $RUN; WIP left in tree (not reset)." >&2
fi
exit 1
