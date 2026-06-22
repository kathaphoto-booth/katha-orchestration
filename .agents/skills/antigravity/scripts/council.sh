#!/usr/bin/env bash
# council.sh "<question>" — Katha-native multi-model consultation council.
#
# Fixes the wrapper gaps found 2026-06-22 (all council-confirmed):
#  • self-loads the Vertex env — a non-interactive shell never sources ~/.zshrc,
#    so the consumer-tier fallback was silently breaking gemini. We FAIL LOUD
#    (mark the voice ABSENT) instead of returning a broken answer.
#  • bounds every CLI with run_with_timeout — macOS ships no coreutils timeout,
#    so wrappers otherwise run unbounded (the codex CLI once hung 7.5 min).
#  • routes the OSS voice via the Ollama HTTP API — the codex CLI stalls; Ollama
#    answers in ~5 s. curl --max-time gives the HTTP-level bound.
#
# Voices: gemini (Google/Vertex) + qwen OSS (local Ollama). CC (Opus) is chairman
# and synthesizes — agy is NEVER a council voice (executor != critic).
set -uo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./lib.sh
source "$DIR/lib.sh"

Q="${1:?usage: council.sh \"<question>\"}"
OUT="${COUNCIL_DIR:-/Users/jedg./Desktop/kat_ha_pb/.council}"
mkdir -p "$OUT"
TIMEOUT="${COUNCIL_TIMEOUT:-120}"
OSS_MODEL="${COUNCIL_OSS_MODEL:-qwen2.5-coder:7b}"

# Self-load the council CLI env from ~/.zshrc WITHOUT sourcing the whole file
# (a non-interactive shell never sources it). Includes the billing-tier switch.
load_vertex_env() {
  if [[ -z "${GOOGLE_GENAI_USE_VERTEXAI:-}" && -z "${GEMINI_TIER:-}" && -z "${GEMINI_API_KEY:-}" ]]; then
    eval "$(grep -E '^[[:space:]]*export[[:space:]]+(GOOGLE_GENAI_USE_VERTEXAI|GOOGLE_CLOUD_PROJECT|GOOGLE_CLOUD_LOCATION|GEMINI_API_KEY|GEMINI_TIER)=' "$HOME/.zshrc" 2>/dev/null || true)"
  fi
  export GOOGLE_GENAI_USE_VERTEXAI="${GOOGLE_GENAI_USE_VERTEXAI:-}"
  export GOOGLE_CLOUD_PROJECT="${GOOGLE_CLOUD_PROJECT:-}"
  export GOOGLE_CLOUD_LOCATION="${GOOGLE_CLOUD_LOCATION:-global}"
}

voice_gemini() {
  if ! command -v gemini >/dev/null 2>&1; then
    echo "[ABSENT] gemini: CLI not installed." > "$OUT/stage1_gemini.txt"; return 1
  fi
  load_vertex_env
  # Billing-aware tier (GEMINI_TIER): `vertex` = the $300 Vertex trial (default
  # while credit lasts); `free` = consumer AI Studio key, NO cost; `off` = drop
  # the voice (council runs OSS+CC). At the $290 budget alert, flip ONE env var
  # in ~/.zshrc — zero code change at cutover.
  local tier="${GEMINI_TIER:-vertex}"
  case "$tier" in
    off)
      echo "[ABSENT] gemini: disabled (GEMINI_TIER=off) — council runs OSS+CC." > "$OUT/stage1_gemini.txt"; return 1;;
    free)
      export GOOGLE_GENAI_USE_VERTEXAI=false   # consumer free tier, never Vertex/billing
      if [[ -z "${GEMINI_API_KEY:-}" ]]; then
        echo "[ABSENT] gemini: GEMINI_TIER=free but GEMINI_API_KEY unset (get a free AI Studio key)." > "$OUT/stage1_gemini.txt"; return 1
      fi ;;
    *)  # vertex (paid trial)
      if [[ -z "$GOOGLE_GENAI_USE_VERTEXAI" || -z "$GOOGLE_CLOUD_PROJECT" ]]; then
        echo "[ABSENT] gemini: Vertex env unset — set GEMINI_TIER=free (+GEMINI_API_KEY) for the no-cost path." > "$OUT/stage1_gemini.txt"; return 1
      fi ;;
  esac
  run_with_timeout "$TIMEOUT" gemini -p "$Q" < /dev/null > "$OUT/stage1_gemini.txt" 2>/dev/null
  local rc=$?
  [[ -s "$OUT/stage1_gemini.txt" ]] || echo "[ABSENT] gemini: no output (exit $rc; >=128 = killed at ${TIMEOUT}s bound)." > "$OUT/stage1_gemini.txt"
}

# OSS voice via the Ollama HTTP API (codex CLI bypassed). curl self-bounds.
voice_oss() {
  if ! curl -s -o /dev/null --max-time 3 http://localhost:11434/api/tags 2>/dev/null; then
    echo "[ABSENT] oss: ollama not reachable on :11434." > "$OUT/stage1_oss.txt"; return 1
  fi
  jq -Rs --arg m "$OSS_MODEL" '{model:$m, prompt:., stream:false, options:{temperature:0.2}}' <<<"$Q" \
    | curl -s --max-time "$TIMEOUT" -X POST http://localhost:11434/api/generate -d @- 2>/dev/null \
    | jq -r '.response // empty' > "$OUT/stage1_oss.txt" 2>/dev/null
  [[ -s "$OUT/stage1_oss.txt" ]] || echo "[ABSENT] oss: empty/error/timeout." > "$OUT/stage1_oss.txt"
}

# Run voices SEQUENTIALLY, not via `voice & voice & wait`: the gemini CLI hangs
# when double-backgrounded (nested under run_with_timeout's own &). OSS is ~5s,
# so the cost is small and robustness wins.
voice_gemini
voice_oss

echo "===== GEMINI (Vertex) ====="; cat "$OUT/stage1_gemini.txt" 2>/dev/null
echo; echo "===== OSS qwen (Ollama) ====="; cat "$OUT/stage1_oss.txt" 2>/dev/null
echo; echo "(chairman synthesis is CC's job — read both above)"
