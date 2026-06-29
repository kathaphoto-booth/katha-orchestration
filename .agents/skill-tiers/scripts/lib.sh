#!/usr/bin/env bash
# Shared bash 3.2-compatible primitives for the orchestration skill.
# NOTE: This file is intended to be `source`'d by other scripts. It deliberately
# does NOT `set -euo pipefail` at file scope — that would silently flip the
# caller's shell options. Each consumer sets its own.

# changed_set <repo> -> newline list of changed + untracked paths (relative).
# (anti-leak foundation: reality is computed from git, never from agy)
# Uses --porcelain=v1 -z so paths are NUL-delimited and never C-escaped.
# A rename record (R/C status) emits TWO NUL fields under -z (new path, then
# old path); we emit BOTH so the verification gate catches the full footprint.
#
# NOTE: macOS's bundled /usr/bin/awk (the "one true awk") does not split
# records on RS='\0' the way GNU awk does — it reads the whole NUL-delimited
# stream as a single record. So this parses the NUL stream with bash's own
# `read -d ''`, which IS NUL-aware and is bash 3.2-compatible.
changed_set() {
  local repo="$1"
  local skip=0 xy path
  git -C "$repo" status --porcelain=v1 -z --untracked-files=all \
    | while IFS= read -r -d '' rec; do
        if [[ "$skip" == "1" ]]; then
          printf '%s\n' "$rec"
          skip=0
          continue
        fi
        xy="${rec:0:2}"
        path="${rec:3}"
        printf '%s\n' "$path"
        if [[ "$xy" == *R* || "$xy" == *C* ]]; then
          skip=1
        fi
      done
}

# redact (stdin -> stdout): replace common secret shapes with [REDACTED] before
# anything is persisted to disk. Shared by delegate_agy.sh (agy.log), council.sh
# (voice output), and loop.sh (jsonl) so there is ONE scrubber, not three diverging
# copies. Errs toward over-redaction (safe for forensic logs). Adversarial review
# (2026-06-24) hardened it: case-INSENSITIVE token prefixes (sk-/AIza/xox), and
# multi-line PEM private-key BLOCKS collapsed whole (the old line-based pattern only
# caught the BEGIN/END lines and leaked the base64 key material in between).
# awk for the stateful PEM block; sed -E for the single-line token patterns.
redact() {
  awk '
    /-----BEGIN[ A-Za-z]*PRIVATE KEY-----/ { print "[REDACTED]"; inkey=1; next }
    inkey && /-----END[ A-Za-z]*PRIVATE KEY-----/ { inkey=0; next }
    inkey { next }
    { print }
  ' \
  | sed -E \
      -e 's/[sS][kK]-[A-Za-z0-9_-]{16,}/[REDACTED]/g' \
      -e 's/[aA][iI][zZ][aA][0-9A-Za-z_-]{30,}/[REDACTED]/g' \
      -e 's/[xX][oO][xX][baprsBAPRS]-[A-Za-z0-9-]{6,}/[REDACTED]/g'
}

# run_with_timeout <secs> <cmd...> -> runs cmd bounded by <secs>; returns cmd's
# exit code, or a signal exit (e.g. 137 = 128+SIGKILL) if it was killed at the
# bound. Portable + zero-dependency: macOS ships no coreutils timeout/gtimeout,
# so the council/CLI wrappers otherwise run UNBOUNDED (codex once hung 7.5min).
# Pure-bash background-watcher pattern (council-recommended).
run_with_timeout() {
  local secs="$1"; shift
  "$@" &
  local pid=$!
  ( sleep "$secs"; kill -9 "$pid" 2>/dev/null ) &
  local watcher=$!
  local rc=0
  wait "$pid" 2>/dev/null || rc=$?
  kill "$watcher" 2>/dev/null
  wait "$watcher" 2>/dev/null || true
  return "$rc"
}
