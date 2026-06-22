#!/usr/bin/env bash
# checkpoint.sh — transactional snapshot/rollback across repo + vault + build
# caches. See docs/superpowers/specs/2026-06-22-orchestration-layer-design.md
# §3 "The checkpoint is transactional across ALL mutable state".
#
# Anti-leak principle: a repo-only `git reset --hard && git clean -fd` rolls
# back ZERO of what agy writes to the vault (inbox.md/handoff/ live OUTSIDE
# the project repo, on a separate disk with no git history of its own), and
# leaves gitignored build caches (*.tsbuildinfo, .next/cache) intact — a
# poisoned incremental-compile cache can make a broken tree report green even
# after a "rollback". This script snapshots/restores all three so the
# verification gate's truth-oracle is always reproducible from source.
#
# Usage:
#   checkpoint.sh snapshot <run_id> <repo> <vault>
#   checkpoint.sh rollback <run_id> <repo> <vault>
#
# This is a standalone (non-sourced) script, so `set -euo pipefail` is safe
# here — unlike lib.sh, which is deliberately sourced and leaves the
# caller's shell options alone.
set -euo pipefail

usage() {
  echo "usage: checkpoint.sh <snapshot|rollback> <run_id> <repo> <vault>" >&2
}

if [[ $# -ne 4 ]]; then
  usage
  exit 2
fi

CMD="$1"
RUN="$2"
REPO="$3"
VAULT="$4"

case "$CMD" in
  snapshot|rollback) ;;
  *) usage; exit 2;;
esac

STATE_DIR="$REPO/.orchestration/$RUN"

do_snapshot() {
  mkdir -p "$STATE_DIR/vault/handoff"

  # Repo: record HEAD so rollback can `git reset --hard` back to it.
  git -C "$REPO" rev-parse HEAD > "$STATE_DIR/repo_head"

  # Vault: copy agy's only sanctioned write targets (inbox.md + handoff/).
  # Defensive about missing optional state — a throwaway test vault, or a
  # real vault mid-migration, may not have every node yet.
  if [[ -f "$VAULT/inbox.md" ]]; then
    cp -a "$VAULT/inbox.md" "$STATE_DIR/vault/inbox.md"
  fi
  if [[ -d "$VAULT/handoff" ]]; then
    rm -rf "$STATE_DIR/vault/handoff"
    cp -a "$VAULT/handoff" "$STATE_DIR/vault/handoff"
  fi
}

do_rollback() {
  if [[ ! -f "$STATE_DIR/repo_head" ]]; then
    echo "no snapshot for $RUN" >&2
    exit 1
  fi

  # The state dir lives under $REPO/.orchestration/$RUN — it is itself
  # untracked, so `git clean -fd` below would delete it before the vault
  # half of the transaction gets a chance to read it back. Stage the bits
  # rollback still needs into a holding area OUTSIDE the repo first.
  local HOLD; HOLD="$(mktemp -d)"
  local REPO_HEAD; REPO_HEAD="$(cat "$STATE_DIR/repo_head")"
  if [[ -f "$STATE_DIR/vault/inbox.md" ]]; then
    cp -a "$STATE_DIR/vault/inbox.md" "$HOLD/inbox.md"
  fi
  if [[ -d "$STATE_DIR/vault/handoff" ]]; then
    cp -a "$STATE_DIR/vault/handoff" "$HOLD/handoff"
  fi

  # --- Repo half of the transaction ---
  git -C "$REPO" reset --hard "$REPO_HEAD"
  # Exclude .orchestration/ so this run's own snapshot survives the clean —
  # a same-run retry of rollback (e.g. after the orchestrator dies mid-
  # rollback) can still find it instead of hard-failing on a missing snapshot.
  git -C "$REPO" clean -fd -e .orchestration

  # Purge build caches that survive `clean -fd` because they're gitignored.
  # *.tsbuildinfo anywhere under the repo except inside node_modules.
  find "$REPO" -name '*.tsbuildinfo' -not -path '*/node_modules/*' -exec rm -f {} +

  # .next/cache contents (not the .next dir itself — other .next state may
  # matter; only the cache subdir is the incremental-compile poison vector).
  find "$REPO" -type d -name cache -path '*/.next/cache' -not -path '*/node_modules/*' -print0 \
    | while IFS= read -r -d '' cache_dir; do
        rm -rf "${cache_dir:?}"/*
        rm -rf "${cache_dir:?}"/.[!.]* 2>/dev/null || true
      done

  # --- Vault half of the transaction (same rollback, same atomicity) ---
  if [[ -f "$HOLD/inbox.md" ]]; then
    cp -a "$HOLD/inbox.md" "$VAULT/inbox.md"
  fi
  if [[ -d "$HOLD/handoff" ]]; then
    # Full-replace, not merge: clear the live dir first so files agy added
    # that aren't in the snapshot are removed, not just files restored.
    rm -rf "$VAULT/handoff"
    cp -a "$HOLD/handoff" "$VAULT/handoff"
  fi
  rm -rf "$HOLD"
}

case "$CMD" in
  snapshot) do_snapshot;;
  rollback) do_rollback;;
esac
