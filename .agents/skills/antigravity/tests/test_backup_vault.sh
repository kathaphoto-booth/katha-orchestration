#!/usr/bin/env bash
# Source-assertion test for the Task 0 vault-durability retrofit of
# scripts/backup-vault.sh. The script drives the REAL vault, so (like
# test_compile / test_agy_tier) we assert the source carries the durability
# wiring: a conditional push to KATHA_VAULT_REMOTE, and COMPILED_HAM.md is no
# longer excluded (so the boot artifact is versioned + diffable). The actual
# remote-add + first push is a Jed action (private repo creation), so this
# does NOT execute the script.

test_backup_vault_versions_and_pushes() {           # Task 0 (CC-side)
  local src; src="/Users/jedg./Desktop/kat_ha_pb/scripts/backup-vault.sh"
  assert_eq "$([[ -f "$src" ]] && echo yes || echo no)" "yes" "backup-vault.sh exists"
  local body; body="$(cat "$src")"
  assert_contains "$body" "KATHA_VAULT_REMOTE" "push target is configurable + inert until set"
  assert_contains "$body" "git push" "pushes to the private remote when configured"
  assert_not_contains "$body" "exclude='COMPILED_HAM.md'" "COMPILED_HAM.md is no longer rsync-excluded (versioned)"
}
