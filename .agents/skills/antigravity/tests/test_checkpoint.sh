#!/usr/bin/env bash
# Tests for scripts/checkpoint.sh — transactional snapshot/rollback across
# repo + vault + build caches.

test_checkpoint_restores_vault() {                # attack: vault-rollback
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local v; v=$(mk_vault)
  bash "$SKILL/checkpoint.sh" snapshot run1 "$r" "$v" >/dev/null
  echo "POISON" >> "$v/inbox.md"                  # agy writes vault
  bash "$SKILL/checkpoint.sh" rollback run1 "$r" "$v" >/dev/null
  assert_eq "$(grep -c POISON "$v/inbox.md")" "0" "vault rollback removes agy's write"
}

test_checkpoint_purges_tsbuildinfo() {            # attack: cache-poison
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local v; v=$(mk_vault)
  bash "$SKILL/checkpoint.sh" snapshot run2 "$r" "$v" >/dev/null
  echo "{}" > "$r/tsconfig.tsbuildinfo"           # gitignored-style cache survives clean -fd
  echo "tsconfig.tsbuildinfo" > "$r/.gitignore"; git -C "$r" add .gitignore; git -C "$r" commit -qm gi
  bash "$SKILL/checkpoint.sh" rollback run2 "$r" "$v" >/dev/null
  assert_eq "$([[ -f "$r/tsconfig.tsbuildinfo" ]] && echo yes || echo no)" "no" "rollback purges incremental cache"
}

test_checkpoint_restores_handoff_dir() {
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local v; v=$(mk_vault)
  echo "original" > "$v/handoff/note.md"
  bash "$SKILL/checkpoint.sh" snapshot run3 "$r" "$v" >/dev/null
  rm "$v/handoff/note.md"
  echo "injected" > "$v/handoff/evil.md"
  bash "$SKILL/checkpoint.sh" rollback run3 "$r" "$v" >/dev/null
  assert_eq "$(cat "$v/handoff/note.md" 2>/dev/null)" "original" "handoff/ restores the original file"
  assert_eq "$([[ -f "$v/handoff/evil.md" ]] && echo present || echo gone)" "gone" "handoff/ removes agy's injected file"
}

test_checkpoint_rollback_restores_repo_to_snapshot() {
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local v; v=$(mk_vault)
  bash "$SKILL/checkpoint.sh" snapshot run4 "$r" "$v" >/dev/null
  echo "agy edit" >> "$r/a.txt"
  echo "agy new file" > "$r/untracked.txt"
  bash "$SKILL/checkpoint.sh" rollback run4 "$r" "$v" >/dev/null
  assert_eq "$(cat "$r/a.txt")" "base" "repo file reverts to snapshot content"
  assert_eq "$([[ -f "$r/untracked.txt" ]] && echo present || echo gone)" "gone" "repo untracked file is cleaned"
}

test_checkpoint_rollback_is_retry_safe() {        # a retried rollback must not hard-fail
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local v; v=$(mk_vault)
  bash "$SKILL/checkpoint.sh" snapshot run5 "$r" "$v" >/dev/null
  echo "agy edit" >> "$r/a.txt"
  bash "$SKILL/checkpoint.sh" rollback run5 "$r" "$v" >/dev/null 2>&1
  assert_exit "$?" 0 "first rollback succeeds"
  # Retry the SAME rollback on the SAME run_id, with no new snapshot taken in between —
  # simulates a caller retrying after an interruption. Must not hard-fail.
  bash "$SKILL/checkpoint.sh" rollback run5 "$r" "$v" >/dev/null 2>&1
  assert_exit "$?" 0 "retried rollback on the same run_id does not hard-fail"
}
