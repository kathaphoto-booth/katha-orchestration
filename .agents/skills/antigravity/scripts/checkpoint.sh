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
#   checkpoint.sh status   <run_id> <repo> <vault>
#
# `status` detects a torn rollback: do_rollback restores the repo half and
# the vault half sequentially (see the comment above do_rollback). If the
# process dies between those halves, the repo is back at the snapshot HEAD
# but the vault still holds the failed run's poisoned inbox.md/handoff/ —
# a torn transaction with no other signal. `status` checks for the
# `.rollback_inprogress` marker that do_rollback brackets around both
# halves and reports it loudly instead of silently leaving it undetected.
# This is detect-and-warn only, not auto-resume (see Task 13 design notes
# in docs/superpowers/plans/2026-06-22-orchestration-layer-v1.md §Phase 7):
# safely auto-resuming a torn transaction is genuinely hard and a
# single-operator v1 just needs to know to look.
#
# This is a standalone (non-sourced) script, so `set -euo pipefail` is safe
# here — unlike lib.sh, which is deliberately sourced and leaves the
# caller's shell options alone.
set -euo pipefail

usage() {
  echo "usage: checkpoint.sh <snapshot|rollback|status> <run_id> <repo> <vault>" >&2
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
  snapshot|rollback|status) ;;
  *) usage; exit 2;;
esac

STATE_DIR="$REPO/.orchestration/$RUN"

do_snapshot() {
  # Harness bookkeeping must never look like an agy-attributable change. Idempotent,
  # self-healing nested gitignore — covers every file this skill ever writes under
  # .orchestration/, including self_eval.sh's ledger.jsonl, with zero verdict.sh logic.
  mkdir -p "$REPO/.orchestration"
  echo '*' > "$REPO/.orchestration/.gitignore"
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

MARKER="$STATE_DIR/.rollback_inprogress"

do_rollback() {
  if [[ ! -f "$STATE_DIR/repo_head" ]]; then
    echo "no snapshot for $RUN" >&2
    exit 1
  fi

  # Torn-transaction marker: written FIRST, before any repo mutation, and
  # removed LAST, only after the vault half below fully completes. If this
  # process dies anywhere in between, the marker survives on disk and
  # `checkpoint.sh status` reports it — see the usage-comment block at the
  # top of this file for why this is detect-and-warn rather than auto-resume.
  touch "$MARKER"

  # The state dir lives under $REPO/.orchestration/$RUN — it is itself
  # untracked, so `git clean -fd` below would delete it before the vault
  # half of the transaction gets a chance to read it back. Stage the bits
  # rollback still needs into a holding area OUTSIDE the repo first.
  # Not `local`: the EXIT trap below is script-global (bash traps are not
  # function-scoped) and can fire after do_rollback returns, by which point
  # a `local` would already be unset — HOLD must outlive this function.
  HOLD="$(mktemp -d)"
  trap 'rm -rf "$HOLD"' EXIT
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

  # Vault half done — the transaction is no longer torn. Must be the very
  # last line of do_rollback (see marker comment above).
  rm -f "$MARKER"
}

do_status() {
  # Three-way, not two-way: "no snapshot ever taken" and "clean" are
  # deliberately reported as DIFFERENT outcomes (exit 2 vs exit 0). A
  # typo'd run_id (e.g. run_importnat vs run_important) has no
  # $STATE_DIR/repo_head and must never be folded into "clean" — that would
  # read as false reassurance when the real run with the correct id could
  # still be torn. Exit codes: 0 clean, 1 torn, 2 no snapshot for this run_id.
  #
  # Caveat: a marker found here can also mean a rollback is genuinely IN
  # PROGRESS right now, not crashed — this marker-only design can't tell the
  # two apart. Treat "torn" from a concurrent run as inconclusive, not fatal.
  if [[ ! -f "$STATE_DIR/repo_head" ]]; then
    echo "checkpoint.sh status: no snapshot found for run '$RUN' — check the run id" >&2
    echo "(no $STATE_DIR/repo_head; this run_id was never snapshotted, or the" >&2
    echo "spelling doesn't match the run that was)." >&2
    exit 2
  fi
  if [[ -f "$MARKER" ]]; then
    echo "checkpoint.sh status: TORN ROLLBACK for run '$RUN' — a prior rollback" >&2
    echo "started (marker $MARKER exists) but never finished cleanly." >&2
    echo "Repo and vault state may be inconsistent. Needs manual review" >&2
    echo "before retrying rollback or trusting this run's state." >&2
    exit 1
  fi
  echo "checkpoint.sh status: clean for run '$RUN' (no torn rollback marker)"
}

case "$CMD" in
  snapshot) do_snapshot;;
  rollback) do_rollback;;
  status) do_status;;
esac
