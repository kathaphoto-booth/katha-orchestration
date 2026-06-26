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
while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo) REPO="$2"; shift 2;;
    --timeout) TIMEOUT="$2"; shift 2;;
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
# COUNCIL_INCLUDE_AGY (default 1): kill-switch for the agy voice, mirroring
# COUNCIL_INCLUDE_COPILOT's pattern. Added 2026-06-25 after a real incident:
# agy silently returned ABSENT (rc=0, empty output) for an auth/billing reason
# that took a full debugging session to diagnose. Disabling agy here is
# immediate and free — no wasted $TIMEOUT — while an account issue is
# resolved. Reuses the existing ABSENT status rather than a new SKIPPED value
# (unlike copilot) because agy participates directly in the quorum check
# below; a disabled agy must still count as ABSENT for that decision to stay
# correct (see test_council_quorum_correct_when_agy_disabled).
agy_status="ABSENT"
COUNCIL_INCLUDE_AGY="${COUNCIL_INCLUDE_AGY:-1}"
if [[ "$COUNCIL_INCLUDE_AGY" == "1" ]]; then
  # AGY_MODEL pinned to "Gemini 3.5 Flash (Low)" (2026-06-25): the fastest,
  # lowest-thinking-budget model on the confirmed-valid list (`agy models`).
  # A hardcoded ANTHROPIC model name was previously passed here into this
  # Gemini-based binary and silently broke every council run (rc=0, empty
  # output, no error surfaced outside agy's own --log-file) — removing the
  # override entirely was the fix for that. This pin is a different, later
  # change: agy's free/consumer-tier quota is rate-limited (confirmed via
  # --log-file: RESOURCE_EXHAUSTED 429 even with Vertex env vars + --project
  # set explicitly — the account's auth resolves to authMethod=consumer
  # regardless, a billing-account-level setting outside this script's reach).
  # Flash-tier + lowest thinking budget = cheapest, fastest call, most likely
  # to fit inside whatever quota is left. Must stay a real value from
  # `agy models` — never an Anthropic/Claude name (see
  # test_council_agy_model_pinned_correctly).
  AGY_MODEL="${AGY_MODEL:-Gemini 3.5 Flash (Low)}"
  set +e
  run_with_timeout "$TIMEOUT" "$AGY_BIN" --print --print-timeout "${TIMEOUT}s" --model "$AGY_MODEL" "$PROMPT" \
    < /dev/null > "$OUT/.agy.raw" 2> "$OUT/.agy.raw.err"
  agy_rc=$?
  set -e
  redact < "$OUT/.agy.raw" > "$OUT/agy.out"; redact < "$OUT/.agy.raw.err" > "$OUT/agy.err"
  rm -f "$OUT/.agy.raw" "$OUT/.agy.raw.err"
  if [[ "$agy_rc" -eq 0 && -s "$OUT/agy.out" ]]; then
    agy_status="OK"
  else
    echo "ABSENT: agy voice failed or produced no output (rc=$agy_rc; re-run agy directly with --log-file <path> for diagnostics)" >> "$OUT/agy.out"
  fi
else
  agy_rc=0
  echo "ABSENT: agy voice disabled (COUNCIL_INCLUDE_AGY=0) — re-enable by unsetting or setting =1" > "$OUT/agy.out"
  : > "$OUT/agy.err"
fi

# --- Voice 3: copilot (optional, env-gated; read-only critic) ---
copilot_status="SKIPPED"
copilot_rc=0
: > "$OUT/copilot.out"
: > "$OUT/copilot.err"
COUNCIL_INCLUDE_COPILOT="${COUNCIL_INCLUDE_COPILOT:-1}"
COPILOT_BIN="${COPILOT_BIN:-gh}"
if [[ "$COUNCIL_INCLUDE_COPILOT" == "1" ]]; then
  copilot_status="ABSENT"
  # Pre-flight (FR-11): `gh copilot -- --help` passes --help THROUGH to the real
  # Copilot CLI, so it returns rc=1 "Copilot CLI not installed" when the binary
  # is absent and rc=0 only when it's genuinely installed (verified 2026-06-25:
  # gh 2.92.0, Copilot CLI not installed -> rc=1, no download). NOTE: plain
  # `gh copilot --help` is gh's OWN wrapper help and returns rc=0 regardless of
  # install state — it must NOT be used as the gate. A failed probe routes
  # straight to ABSENT so the `-p` call below is never reached blind (no hang,
  # no possible first-run download).
  # The pre-flight itself is bounded by run_with_timeout (council review finding 1):
  # an UNBOUNDED probe that hung would abort the whole script under set -e BEFORE
  # the codex/agy quorum check below — breaking the "copilot can't regress the
  # 2-voice baseline" invariant in practice even though the quorum line is untouched.
  if run_with_timeout 15 "$COPILOT_BIN" copilot -- --help >/dev/null 2>&1; then
    set +e
    # FR-12: the `-p` form is the documented `gh copilot -p`, but is UNVERIFIED
    # end-to-end until the Copilot CLI is actually installed (the pre-flight above
    # makes this line unreachable until then). Validate the flag form on first
    # real install before relying on this voice.
    run_with_timeout "$TIMEOUT" "$COPILOT_BIN" copilot -p "$PROMPT" \
      > "$OUT/.copilot.raw" 2> "$OUT/.copilot.raw.err"
    copilot_rc=$?
    set -e
    redact < "$OUT/.copilot.raw" > "$OUT/copilot.out"; redact < "$OUT/.copilot.raw.err" > "$OUT/copilot.err"
    rm -f "$OUT/.copilot.raw" "$OUT/.copilot.raw.err"
    if [[ "$copilot_rc" -eq 0 && -s "$OUT/copilot.out" ]]; then copilot_status="OK"; else
      echo "ABSENT: copilot voice failed or produced no output (rc=$copilot_rc)" >> "$OUT/copilot.out"
    fi
  else
    copilot_rc=$?   # reflect the pre-flight's real failure rc, not a misleading 0 (council review finding 6)
    echo "ABSENT: gh copilot CLI not installed (pre-flight 'copilot -- --help' failed) — skipped to avoid a blind -p call / possible first-run download" >> "$OUT/copilot.out"
  fi
fi

# council.json: a manifest CC reads to chair. NOT a verdict — no winner is picked.
jq -n \
  --arg run "$RUN" \
  --arg blob "$BLOB" \
  --arg codex_status "$codex_status" --argjson codex_rc "$codex_rc" \
  --arg agy_status "$agy_status" --argjson agy_rc "$agy_rc" \
  --arg copilot_status "$copilot_status" --argjson copilot_rc "$copilot_rc" \
  '{run: $run, blob: $blob,
    voices: {
      codex:   {status: $codex_status,   rc: $codex_rc,   out: "codex.out",   err: "codex.err"},
      agy:     {status: $agy_status,     rc: $agy_rc,     out: "agy.out",     err: "agy.err"},
      copilot: {status: $copilot_status, rc: $copilot_rc, out: "copilot.out", err: "copilot.err"}
    },
    note: "collected critiques only; CC chairs synthesis"}' \
  > "$OUT/council.json"

echo "council: codex=$codex_status agy=$agy_status copilot=$copilot_status -> $OUT/council.json"
if [[ "$codex_status" == "ABSENT" && "$agy_status" == "ABSENT" ]]; then
  echo "BOTH voices ABSENT — nothing for CC to chair." >&2
  exit 1
fi
exit 0
