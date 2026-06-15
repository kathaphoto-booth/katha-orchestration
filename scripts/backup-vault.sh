#!/usr/bin/env bash
# backup-vault.sh — Automated backup and git commit for Katha memory vault
#
# ⚠️ SOFT SAFETY ONLY — NOT a durable/offsite backup:
#   • the vault git repo lives ON the Samsung 970 (same fault domain as the data
#     it tracks — a drive failure loses both the data AND its git history);
#   • the rsync target (~/.katha-vault-backups) is on the same MacBook;
#   • there is no remote origin, so nothing leaves this machine.
#   This protects against accidental edits/rm, NOT against drive loss or theft.
#   TODO (durability): add a remote git origin (private GitHub) and push here,
#   and/or an offsite copy (iCloud/Time Machine). Until then, treat the vault as
#   single-copy-at-risk.
set -euo pipefail

VAULT="/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory"
BACKUP_DIR="$HOME/.katha-vault-backups"

if [[ ! -d "$VAULT" ]]; then
  echo "ERROR: Samsung 970 pro is unmounted. Vault memory is unavailable." >&2
  exit 1
fi

# 1. Commit changes in vault local git repository
echo "=== Committing changes in Vault git repository ==="
cd "$VAULT"

# Initialize git if not already initialized
if [[ ! -d .git ]]; then
  git init
  cat > .gitignore <<EOF
.sync.lock
COMPILED_HAM.md
EOF
  git add .
  git commit -m "Initial commit of memory vault"
else
  # Check if there are changes
  if [[ -n "$(git status --porcelain)" ]]; then
    git add .
    git commit -m "Automated backup commit: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  else
    echo "No changes in vault to commit."
  fi
fi

# 2. Synchronize vault files to local home directory backup
echo "=== Synchronizing Vault to local backup directory ==="
mkdir -p "$BACKUP_DIR"
# Copy files, excluding git dir, COMPILED_HAM.md and lock
rsync -av --exclude='.git' --exclude='.sync.lock' --exclude='COMPILED_HAM.md' "$VAULT/" "$BACKUP_DIR/"

echo "Backup complete. Files synced to $BACKUP_DIR"
