#!/usr/bin/env bash
# Shared bash primitives for the antigravity orchestration skill.
# Bash 3.2-compatible (macOS default /bin/bash) — no mapfile/readarray,
# no associative arrays, no `&>>`.
set -euo pipefail

VAULT_DIR="/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory"
REPO_DIR="/Users/jedg./Desktop/kat_ha_pb"

# changed_set <repo> -> newline list of changed + untracked paths (relative)
# This is the ANTI-LEAK FOUNDATION: reality is computed from git, never from agy.
changed_set() {
  git -C "$1" status --porcelain=v1 --untracked-files=all \
    | sed -E 's/^.{3}//' | sed -E 's/^"(.*)"$/\1/'
}
