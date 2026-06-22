#!/usr/bin/env bash
# verdict.sh — the deterministic, non-LLM truth harness.
#
# Anti-leak principle: agy's self-reported digest is a CLAIM, never truth.
# Truth = what `git` itself shows changed. This script computes REAL from
# git (via lib.sh's changed_set), compares it against the digest's claims,
# runs an optional gate, and writes a signed .verdict.json. Exit code is
# the real verdict: 0 = PASS, 1 = FAIL. Never trust the digest's prose.
#
# This is a standalone (non-sourced) script, so `set -euo pipefail` is safe
# here — unlike lib.sh, which is deliberately sourced and leaves the
# caller's shell options alone.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./lib.sh
source "$DIR/lib.sh"

REPO=""
DIGEST=""
GATE="fast"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo) REPO="$2"; shift 2;;
    --digest) DIGEST="$2"; shift 2;;
    --gate) GATE="$2"; shift 2;;
    *) echo "unknown arg $1" >&2; exit 2;;
  esac
done
[[ -n "$REPO" && -f "$DIGEST" ]] || {
  echo "usage: verdict.sh --repo <dir> --digest <json> [--gate fast|full|none]" >&2
  exit 2
}

# Bash 3.2-compatible array reads (no mapfile/readarray — macOS /bin/bash is 3.2).
# read_into <varname> < <stream> : appends each line of the stream to the
# array named by <varname>, via eval (no declare -A / namerefs in bash 3.2).
read_into() {
  local _v="$1" _l
  while IFS= read -r _l; do eval "$_v+=(\"\$_l\")"; done
}

# Reality from git — NEVER from the digest.
REAL=()
read_into REAL < <(changed_set "$REPO")

# Exclude verdict.sh's own output file from the changed-set comparison — it's
# this script's bookkeeping artifact from a prior run, not something agy or
# any external actor touched. Without this, a second run against the same
# repo would self-FAIL on its own previous .verdict.json.
REAL_FILTERED=()
for _f in "${REAL[@]:-}"; do
  [[ "$_f" == ".verdict.json" ]] && continue
  REAL_FILTERED+=("$_f")
done
REAL=("${REAL_FILTERED[@]:-}")

# Claims from the digest. `// empty` so a missing/null field doesn't blow up
# under set -e (jq would otherwise emit `null` or error on a missing key).
CLAIMED=()
read_into CLAIMED < <(jq -r '.files_touched[]? // empty' "$DIGEST")
EXT=()
read_into EXT < <(jq -r '.external_effects[]? // empty' "$DIGEST")

# is_member <needle> <haystack...> — bash-3.2-safe membership test (no
# declare -A / associative arrays). Exact, whole-string match only — correct
# for paths containing spaces or special characters since each haystack
# element is passed as its own positional argument, never re-split or globbed.
is_member() {
  local needle="$1"; shift
  local x
  for x in "$@"; do
    [[ "$x" == "$needle" ]] && return 0
  done
  return 1
}

STATUS="PASS"
REASONS=()

# (a) Leak check: every REAL change must appear in CLAIMED (REAL ⊆ CLAIMED).
# The reverse is fine — agy may claim something it didn't actually touch
# (e.g. a no-op edit); only UNCLAIMED reality is a leak.
for f in "${REAL[@]:-}"; do
  [[ -z "$f" ]] && continue
  if ! is_member "$f" "${CLAIMED[@]:-}"; then
    STATUS="FAIL"
    REASONS+=("unclaimed change: $f")
  fi
done

# (b) External-effects check: any declared external effect is an automatic
# FAIL, regardless of leak status. Guard against the empty-string artifact
# that `jq -r '...[]? // empty'` can leave behind when EXT has exactly one
# blank entry (e.g. external_effects:[""]) by filtering blanks before judging.
EXT_NONBLANK=()
for x in "${EXT[@]:-}"; do
  [[ -n "$x" ]] && EXT_NONBLANK+=("$x")
done
if [[ "${#EXT_NONBLANK[@]}" -gt 0 ]]; then
  STATUS="FAIL"
  REASONS+=("external effects present: ${EXT_NONBLANK[*]}")
fi

# (c) Gate: deterministic, real exit codes only — never parsed from prose.
GATE_RESULT="skipped"
if [[ "$GATE" != "none" ]]; then
  if [[ -f "$REPO/tsconfig.json" ]] && command -v npx >/dev/null 2>&1; then
    GATE_TMP="$(mktemp -d)"
    if ( cd "$REPO" && npx tsc --noEmit >"$GATE_TMP/tsc.log" 2>&1 ); then
      GATE_RESULT="tsc:pass"
    else
      GATE_RESULT="tsc:fail"
      STATUS="FAIL"
      REASONS+=("tsc failed")
    fi
  fi
fi

jq -n \
  --arg status "$STATUS" \
  --arg gate "$GATE_RESULT" \
  --argjson real "$(printf '%s\n' "${REAL[@]:-}" | jq -R . | jq -s 'map(select(.!=""))')" \
  --argjson reasons "$(printf '%s\n' "${REASONS[@]:-}" | jq -R . | jq -s 'map(select(.!=""))')" \
  '{status: $status, gate: $gate, real_changes: $real, reasons: $reasons}' \
  > "$REPO/.verdict.json"

[[ "$STATUS" == "PASS" ]]
