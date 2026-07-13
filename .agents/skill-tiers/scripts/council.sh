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
# < /dev/null is required: without it, codex sits on "Reading additional input
# from stdin..." and is SIGKILLed by run_with_timeout's watcher at the full
# $TIMEOUT bound every non-interactive run (confirmed live 2026-06-26: rc=137,
# stderr shows the stdin-wait message) — silently misread in the past as a
# quota/auth issue. Same fix as agy's invocation below.
codex_status="ABSENT"
# CODEX_USE_OSS (default 1): codex's cloud path is account-quota-blocked
# (confirmed live 2026-06-26: "ERROR: You've hit your usage limit... try
# again at Jul 20th, 2026" — an account wall, not fixable by model choice).
# codex's own first-party `--oss --local-provider ollama` flag routes to a
# local model instead — free, no external quota. Pinned to qwen2.5-coder:7b
# (smaller, coding-purpose-built; confirmed installed and working via `ollama
# list` + a live generate call 2026-06-27) over the larger general-purpose
# gpt-oss:20b also present locally — "lowest yet impactful" per Jed.
CODEX_USE_OSS="${CODEX_USE_OSS:-1}"
CODEX_OSS_MODEL="${CODEX_OSS_MODEL:-qwen2.5-coder:7b}"
set +e
if [[ "$CODEX_USE_OSS" == "1" ]]; then
  run_with_timeout "$TIMEOUT" "$CODEX_BIN" exec --oss -m "$CODEX_OSS_MODEL" -s read-only --skip-git-repo-check -C "$REPO" "$PROMPT" \
    < /dev/null > "$OUT/.codex.raw" 2> "$OUT/.codex.raw.err"
else
  run_with_timeout "$TIMEOUT" "$CODEX_BIN" exec -s read-only --skip-git-repo-check -C "$REPO" "$PROMPT" \
    < /dev/null > "$OUT/.codex.raw" 2> "$OUT/.codex.raw.err"
fi
codex_rc=$?
set -e
redact < "$OUT/.codex.raw" > "$OUT/codex.out"; redact < "$OUT/.codex.raw.err" > "$OUT/codex.err"
rm -f "$OUT/.codex.raw" "$OUT/.codex.raw.err"
if [[ "$codex_rc" -eq 0 && -s "$OUT/codex.out" ]]; then codex_status="OK"; else
  echo "ABSENT: codex voice failed or produced no output (rc=$codex_rc)" >> "$OUT/codex.out"
  # Confirmed live 2026-06-26: a ChatGPT plan usage-limit hit prints
  # "ERROR: You've hit your usage limit..." to STDERR with empty stdout
  # (rc nonzero) — easy to mistake for a wiring/auth bug without this hint.
  if grep -qi "usage limit\|upgrade to plus" "$OUT/codex.err" 2>/dev/null; then
    echo "hint: ChatGPT plan usage limit — account-level quota, not a wiring/code issue; wait for reset or upgrade." >> "$OUT/codex.out"
  fi
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
    echo "ABSENT: agy voice failed or produced no output (rc=$agy_rc). Known cause (2026-07-04): Antigravity service login expired — GCP ADC auth succeeds but the code-assist token source reports 'You are not logged into Antigravity', so print-mode emits an empty PlannerResponse with rc=0. Fix: run 'agy' interactively once and complete the browser login. Diagnose: re-run with --log-file <path> and grep 'not logged into'." >> "$OUT/agy.out"
    # RESOURCE_EXHAUSTED/429 was confirmed via --log-file (2026-06-25/26), not
    # plain stdout/stderr — agy's internal Go logger writes there separately
    # from the process streams council.sh captures, so this grep may be a
    # no-op against the real binary. Checking both files anyway: cheap,
    # harmless if it never matches, and correct if agy ever does surface it
    # on a plain stream. The --log-file re-run above remains the reliable path.
    if grep -qi "RESOURCE_EXHAUSTED\|HTTP 429\|code 429" "$OUT/agy.out" "$OUT/agy.err" 2>/dev/null; then
      echo "hint: RESOURCE_EXHAUSTED/429 — agy's account-level quota (Antigravity 'G1 Credits'), not a CLI/env issue. See SKILL.md." >> "$OUT/agy.out"
    fi
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
# 2026-06-27 (2664c28): the `gh copilot` extension this used to target was
# sunset Oct 2025. Replaced with the standalone `copilot` CLI (npm
# @github/copilot). At the time, --model was omitted deliberately: every
# named model failed identically with "not available" via GitHub's own
# auto-mode routing (an account-level policy gate, not a naming problem), so
# the voice ran on whatever GitHub's auto-mode picked (gpt-5-mini) — chosen
# for cost, not capability.
#
# 2026-07-04 (Jed, explicit): superseded. This voice now targets GLM-5 via
# BYOK, routed through a local proxy (`scratch/copilot-glm5/vertex-proxy.mjs`,
# started with `start-proxy.sh`) that injects a fresh gcloud ADC token
# upstream to Vertex `zai-org/glm-5-maas` — bypassing GitHub's account-level
# model gate entirely (BYOK mode doesn't use GitHub auth for inference; see
# `copilot help providers`). The proxy has its own gemini-flash-latest
# fallback if GLM-5 is cold/gated, so this voice degrades gracefully upstream
# — but it still needs the proxy PROCESS itself running locally, which this
# script does not start (deliberately: a read-only critique collector should
# not have the side effect of spawning a persistent, port-listening cloud
# client). If the proxy isn't up, the reachability pre-flight below marks
# this voice ABSENT with an actionable message instead of hanging on -p.
COPILOT_BIN="${COPILOT_BIN:-copilot}"
COPILOT_PROVIDER_BASE_URL="${COPILOT_PROVIDER_BASE_URL:-http://127.0.0.1:8788/v1}"
COPILOT_PROVIDER_TYPE="${COPILOT_PROVIDER_TYPE:-openai}"
COPILOT_MODEL="${COPILOT_MODEL:-zai-org/glm-5-maas}"
if [[ "$COUNCIL_INCLUDE_COPILOT" == "1" ]]; then
  copilot_status="ABSENT"
  # Pre-flight 1: `copilot --version` is fast/safe and fails when the binary
  # is genuinely absent. Bounded by run_with_timeout (council review finding
  # 1 from the old design, still applies): an UNBOUNDED probe that hung would
  # abort the whole script under set -e BEFORE the codex/agy quorum check
  # below — breaking the "copilot can't regress the 2-voice baseline"
  # invariant even with the quorum line itself untouched.
  if run_with_timeout 15 "$COPILOT_BIN" --version < /dev/null >/dev/null 2>&1; then
    # Pre-flight 2: the GLM-5 proxy is a separate local process this script
    # depends on but doesn't own. A plain GET is a valid liveness probe (the
    # proxy answers any non-POST with 200 "vertex-proxy up" — see
    # vertex-proxy.mjs). Bounded the same way as pre-flight 1, and for the
    # same reason: avoid a blind -p call that would otherwise hang trying to
    # reach a dead localhost port.
    if run_with_timeout 5 curl -sf -o /dev/null "$COPILOT_PROVIDER_BASE_URL" < /dev/null; then
      set +e
      # --allow-all-tools is required for non-interactive mode (the standalone
      # CLI is a full coding agent — without it, a permission-confirmation
      # prompt with no TTY to answer hangs forever). --deny-tool denials take
      # precedence over --allow-all-tools (per the CLI's own documented
      # permission model), so write/shell stay blocked — preserving the same
      # "no write surface" contract codex (-s read-only) and agy (no
      # --sandbox/--add-dir) already have; this voice is a critic, not an
      # executor. < /dev/null guards the same stdin-hang class found in
      # codex's invocation (2026-06-26). The COPILOT_PROVIDER_* / COPILOT_MODEL
      # exports above activate BYOK for this process only (not exported
      # globally), routing through the GLM-5 proxy instead of GitHub's model
      # routing.
      run_with_timeout "$TIMEOUT" env \
        COPILOT_PROVIDER_BASE_URL="$COPILOT_PROVIDER_BASE_URL" \
        COPILOT_PROVIDER_TYPE="$COPILOT_PROVIDER_TYPE" \
        COPILOT_MODEL="$COPILOT_MODEL" \
        "$COPILOT_BIN" -p "$PROMPT" \
        --allow-all-tools --deny-tool=write --deny-tool=shell --silent --log-level error \
        < /dev/null > "$OUT/.copilot.raw" 2> "$OUT/.copilot.raw.err"
      copilot_rc=$?
      set -e
      redact < "$OUT/.copilot.raw" > "$OUT/copilot.out"; redact < "$OUT/.copilot.raw.err" > "$OUT/copilot.err"
      rm -f "$OUT/.copilot.raw" "$OUT/.copilot.raw.err"
      if [[ "$copilot_rc" -eq 0 && -s "$OUT/copilot.out" ]]; then copilot_status="OK"; else
        echo "ABSENT: copilot voice failed or produced no output (rc=$copilot_rc)" >> "$OUT/copilot.out"
      fi
    else
      copilot_rc=$?
      echo "ABSENT: GLM-5 proxy unreachable at $COPILOT_PROVIDER_BASE_URL — run 'bash scratch/copilot-glm5/start-proxy.sh' first" >> "$OUT/copilot.out"
    fi
  else
    copilot_rc=$?   # reflect the pre-flight's real failure rc, not a misleading 0 (council review finding 6)
    echo "ABSENT: copilot CLI not installed (pre-flight '--version' failed) — skipped to avoid a blind -p call" >> "$OUT/copilot.out"
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

# --- Vault intake copy (2026-07-04 rebuild, vault CLAUDE.md "Council lane") ---
# One vault, one intake/output: the redacted blob is filed into the vault's
# council/intake/ so the chaired verdict (written by CC to council/verdicts/)
# always has its reviewed input beside it. Best-effort: an unmounted SSD must
# not fail the council run itself (the forensic copy in .orchestration/ above
# is the primary record).
VAULT_COUNCIL="${VAULT_COUNCIL:-/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/council}"
if [[ -d "$VAULT_COUNCIL" ]]; then
  mkdir -p "$VAULT_COUNCIL/intake"
  cp "$OUT/input.txt" "$VAULT_COUNCIL/intake/${RUN}_input.txt" 2>/dev/null \
    && echo "council: intake filed -> $VAULT_COUNCIL/intake/${RUN}_input.txt" \
    || echo "council: WARN vault intake copy failed (verdict chair should attach input manually)" >&2
else
  echo "council: WARN vault council lane unavailable at $VAULT_COUNCIL (SSD unmounted?)" >&2
fi

if [[ "$codex_status" == "ABSENT" && "$agy_status" == "ABSENT" ]]; then
  echo "BOTH voices ABSENT — nothing for CC to chair." >&2
  exit 1
fi
exit 0
