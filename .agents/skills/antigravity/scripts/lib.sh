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
