#!/usr/bin/env bash
# backup-vault.sh — Automated backup and git commit for Katha memory vault
#
# DURABILITY:
#   • Offsite git push is wired but INERT until KATHA_VAULT_REMOTE is set (Jed
#     creates a PRIVATE GitHub repo + provides the URL). Once set, every run
#     pushes the committed vault (incl. the now-versioned COMPILED_HAM.md) offsite.
#   • Until then this is SOFT SAFETY ONLY: the vault git repo lives ON the Samsung
#     970 (same fault domain) and the rsync target (~/.katha-vault-backups) is on
#     the same MacBook — protects against accidental edits/rm, NOT drive loss/theft.
#   • Run with the remote:  KATHA_VAULT_REMOTE="git@github.com:<user>/katha-vault.git" bash scripts/backup-vault.sh
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

# 1b. Push to a private remote for offsite durability (survives drive loss).
# INERT until KATHA_VAULT_REMOTE is set — Jed creates the private repo and
# provides the SSH/HTTPS URL; CC never publishes to an external service before
# that repo exists. With it unset, the vault is committed locally only.
VAULT_REMOTE="${KATHA_VAULT_REMOTE:-}"
if [[ -n "$VAULT_REMOTE" ]]; then
  if ! git remote | grep -qx origin; then
    git remote add origin "$VAULT_REMOTE"
  fi
  git push -u origin HEAD 2>&1 || echo "WARN: vault push failed (offline?); local commit retained."
else
  echo "WARN: KATHA_VAULT_REMOTE unset — vault committed locally only, no offsite copy."
fi

# 2. Synchronize vault files to local home directory backup
echo "=== Synchronizing Vault to local backup directory ==="
mkdir -p "$BACKUP_DIR"
# Copy files, excluding only the git dir and the lock (COMPILED_HAM.md is now
# versioned + mirrored so the boot artifact is diffable and offsite-recoverable)
rsync -av --exclude='.git' --exclude='.sync.lock' "$VAULT/" "$BACKUP_DIR/"

echo "Backup complete. Files synced to $BACKUP_DIR"
