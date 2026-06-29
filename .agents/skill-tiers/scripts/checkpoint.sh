#!/usr/bin/env bash
# checkpoint.sh — transactional snapshot/rollback across repo + optional vault +
# build caches. Promoted from antigravity/scripts/ to skill-tiers/scripts/ so
# any skill can use it, not just antigravity.
#
# Change from the antigravity version: <vault> is now OPTIONAL (4th positional
# arg). Skills that have no vault concept (e.g. impeccable-looped-kit) pass only
# 3 args; vault operations become no-ops. Skills that DO use the vault (antigravity)
# still pass 4 args — full backward compatibility.
#
# Usage:
#   checkpoint.sh snapshot <run_id> <repo> [<vault>]
#   checkpoint.sh rollback <run_id> <repo> [<vault>]
#   checkpoint.sh status   <run_id> <repo> [<vault>]
#
# See antigravity/scripts/checkpoint.sh header for the full design rationale
# (transactional two-phase, torn-rollback detection, etc.).
#
# Standalone (not sourced) — set -euo pipefail is safe here.
set -euo pipefail

usage() {
  echo "usage: checkpoint.sh <snapshot|rollback|status> <run_id> <repo> [<vault>]" >&2
}

if [[ $# -lt 3 || $# -gt 4 ]]; then
  usage
  exit 2
fi

CMD="$1"
RUN="$2"
REPO="$3"
VAULT="${4:-}"  # optional; empty = no vault operations

case "$CMD" in
  snapshot|rollback|status) ;;
  *) usage; exit 2;;
esac

STATE_DIR="$REPO/.orchestration/$RUN"

do_snapshot() {
  mkdir -p "$REPO/.orchestration"
  echo '*' > "$REPO/.orchestration/.gitignore"
  mkdir -p "$STATE_DIR/vault/handoff"

  git -C "$REPO" rev-parse HEAD > "$STATE_DIR/repo_head"

  if [[ -n "$VAULT" ]]; then
    if [[ -f "$VAULT/inbox.md" ]]; then
      cp -a "$VAULT/inbox.md" "$STATE_DIR/vault/inbox.md"
    fi
    if [[ -d "$VAULT/handoff" ]]; then
      rm -rf "$STATE_DIR/vault/handoff"
      cp -a "$VAULT/handoff" "$STATE_DIR/vault/handoff"
    fi
  fi
}

MARKER="$STATE_DIR/.rollback_inprogress"

do_rollback() {
  if [[ ! -f "$STATE_DIR/repo_head" ]]; then
    echo "no snapshot for $RUN" >&2
    exit 1
  fi

  touch "$MARKER"

  HOLD="$(mktemp -d)"
  trap 'rm -rf "$HOLD"' EXIT
  local REPO_HEAD; REPO_HEAD="$(cat "$STATE_DIR/repo_head")"

  if [[ -n "$VAULT" ]]; then
    if [[ -f "$STATE_DIR/vault/inbox.md" ]]; then
      cp -a "$STATE_DIR/vault/inbox.md" "$HOLD/inbox.md"
    fi
    if [[ -d "$STATE_DIR/vault/handoff" ]]; then
      cp -a "$STATE_DIR/vault/handoff" "$HOLD/handoff"
    fi
  fi

  # --- Repo half ---
  git -C "$REPO" reset --hard "$REPO_HEAD"
  git -C "$REPO" clean -fd -e .orchestration

  find "$REPO" -name '*.tsbuildinfo' -not -path '*/node_modules/*' -exec rm -f {} +
  find "$REPO" -type d -name cache -path '*/.next/cache' -not -path '*/node_modules/*' -print0 \
    | while IFS= read -r -d '' cache_dir; do
        rm -rf "${cache_dir:?}"/*
        rm -rf "${cache_dir:?}"/.[!.]* 2>/dev/null || true
      done

  # --- Vault half (no-op when vault not provided) ---
  if [[ -n "$VAULT" ]]; then
    if [[ -f "$HOLD/inbox.md" ]]; then
      cp -a "$HOLD/inbox.md" "$VAULT/inbox.md"
    fi
    if [[ -d "$HOLD/handoff" ]]; then
      rm -rf "$VAULT/handoff"
      cp -a "$HOLD/handoff" "$VAULT/handoff"
    fi
  fi

  rm -f "$MARKER"
}

do_status() {
  if [[ ! -f "$STATE_DIR/repo_head" ]]; then
    echo "checkpoint.sh status: no snapshot found for run '$RUN' — check the run id" >&2
    exit 2
  fi
  if [[ -f "$MARKER" ]]; then
    echo "checkpoint.sh status: TORN ROLLBACK for run '$RUN' — a prior rollback started but never finished cleanly." >&2
    echo "Repo and vault state may be inconsistent. Needs manual review before retrying." >&2
    exit 1
  fi
  echo "checkpoint.sh status: clean for run '$RUN' (no torn rollback marker)"
}

case "$CMD" in
  snapshot) do_snapshot;;
  rollback) do_rollback;;
  status) do_status;;
esac
