#!/usr/bin/env bash
# council.sh <run_id> <text-or-diff-file> [--repo <dir>] [--timeout <secs>]
#
# The 2-voice read-only critique COLLECTOR (2026-06-24 rebuild). The council is
# codex + agy; CC chairs. This script does NOT synthesize a verdict — it collects
# two independent critiques of a CC-authored blob and writes them where CC reads
# them next. Synthesis is CC's job (only an LLM can chair; a wrapper can't).
#
# Distinct from delegate_agy.sh (executor) on purpose:
#   - It takes an EXPLICIT blob path. There is no "default to agy's last output".
#     This is the structural guard for the one hard rule: agy must never be a
#     council voice on its OWN just-completed delegation output (executor != critic,
#     conflict of interest). CC decides what blob to point this at; the missing
#     "auto-target" path is the enforcement. (Documented, not runtime-detected —
#     the harness cannot know a blob is agy's own result.md.)
#   - agy is invoked here as a CRITIC: --print only, NO --sandbox, NO --add-dir.
#     A critic has zero write surface — stricter than the executor's sandboxed-
#     but-writable mode.
#
# Voices fail LOUD: a voice that errors/times out is marked ABSENT in council.json,
# never silently dropped. Exit 1 only if BOTH are ABSENT (nothing to chair);
# exit 0 if at least one produced output (partial council, explicitly marked).
#
# Secrets in the reviewed blob (and in voice output) are REDACTED before anything
# is persisted to disk — this repo has live plaintext secrets in config today, so
# a reviewed config blob could carry one into .orchestration/.
#
# Standalone (not sourced) — `set -euo pipefail` is safe here.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./lib.sh
source "$DIR/lib.sh"   # run_with_timeout

RUN="${1:-}"
BLOB="${2:-}"
shift 2 2>/dev/null || true
REPO="."
TIMEOUT="300"
MODEL="Claude Sonnet 4.6 (Thinking)"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo) REPO="$2"; shift 2;;
    --timeout) TIMEOUT="$2"; shift 2;;
    --model) MODEL="$2"; shift 2;;
    *) echo "unknown arg $1" >&2; exit 2;;
  esac
done
[[ -n "$RUN" && -n "$BLOB" ]] || {
  echo "usage: council.sh <run_id> <text-or-diff-file> [--repo <dir>] [--timeout <secs>]" >&2
  exit 2
}
[[ -f "$BLOB" ]] || {
  echo "council.sh: blob '$BLOB' does not exist. council.sh requires an EXPLICIT existing" >&2
  echo "file to critique — it never defaults to agy's own last delegation output." >&2
  exit 2
}

CODEX_BIN="${CODEX_BIN:-codex}"
AGY_BIN="${AGY_BIN:-/Volumes/samsung 970 pro - Data/KATHA_VAULT/bin/agy}"

OUT="$REPO/.orchestration/$RUN/council"
mkdir -p "$REPO/.orchestration"
echo '*' > "$REPO/.orchestration/.gitignore"   # idempotent; forensic dir is gitignored
mkdir -p "$OUT"

# redact() is the shared scrubber from lib.sh (case-insensitive tokens + multi-line
# PEM block handling) — one scrubber, not a per-script copy.

# Forensic copy of EXACTLY what was reviewed (redacted).
redact < "$BLOB" > "$OUT/input.txt"

PROMPT="You are a read-only critic on a code/design council. CC is the chairman and
will synthesize; you do NOT edit files and you do NOT decide — you critique only.
Review the following proposed change and report concrete problems, risks, and
missing considerations. Be specific and direct.

--- BEGIN PROPOSED CHANGE ---
$(cat "$BLOB")
--- END PROPOSED CHANGE ---"

# --- Voice 1: codex (read-only sandbox, no write surface) ---
codex_status="ABSENT"
set +e
run_with_timeout "$TIMEOUT" "$CODEX_BIN" exec -s read-only --skip-git-repo-check -C "$REPO" "$PROMPT" \
  > "$OUT/.codex.raw" 2> "$OUT/.codex.raw.err"
codex_rc=$?
set -e
redact < "$OUT/.codex.raw" > "$OUT/codex.out"; redact < "$OUT/.codex.raw.err" > "$OUT/codex.err"
rm -f "$OUT/.codex.raw" "$OUT/.codex.raw.err"
if [[ "$codex_rc" -eq 0 && -s "$OUT/codex.out" ]]; then codex_status="OK"; else
  echo "ABSENT: codex voice failed or produced no output (rc=$codex_rc)" >> "$OUT/codex.out"
fi

# --- Voice 2: agy as critic (--print only; NO --sandbox, NO --add-dir) ---
agy_status="ABSENT"
set +e
run_with_timeout "$TIMEOUT" "$AGY_BIN" --print --print-timeout "${TIMEOUT}s" --model "$MODEL" "$PROMPT" \
  < /dev/null > "$OUT/.agy.raw" 2> "$OUT/.agy.raw.err"
agy_rc=$?
set -e
redact < "$OUT/.agy.raw" > "$OUT/agy.out"; redact < "$OUT/.agy.raw.err" > "$OUT/agy.err"
rm -f "$OUT/.agy.raw" "$OUT/.agy.raw.err"
if [[ "$agy_rc" -eq 0 && -s "$OUT/agy.out" ]]; then agy_status="OK"; else
  echo "ABSENT: agy voice failed or produced no output (rc=$agy_rc)" >> "$OUT/agy.out"
fi

# council.json: a manifest CC reads to chair. NOT a verdict — no winner is picked.
jq -n \
  --arg run "$RUN" \
  --arg blob "$BLOB" \
  --arg codex_status "$codex_status" --argjson codex_rc "$codex_rc" \
  --arg agy_status "$agy_status" --argjson agy_rc "$agy_rc" \
  '{run: $run, blob: $blob,
    voices: {
      codex: {status: $codex_status, rc: $codex_rc, out: "codex.out", err: "codex.err"},
      agy:   {status: $agy_status,   rc: $agy_rc,   out: "agy.out",   err: "agy.err"}
    },
    note: "collected critiques only; CC chairs synthesis"}' \
  > "$OUT/council.json"

echo "council: codex=$codex_status agy=$agy_status -> $OUT/council.json"
if [[ "$codex_status" == "ABSENT" && "$agy_status" == "ABSENT" ]]; then
  echo "BOTH voices ABSENT — nothing for CC to chair." >&2
  exit 1
fi
exit 0
