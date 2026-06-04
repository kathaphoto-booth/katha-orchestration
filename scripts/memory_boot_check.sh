#!/usr/bin/env bash
# memory_boot_check.sh — Katha HAM drive-safety guard.
# Verifies the Samsung 970 canonical .memory/ is mounted and the symlink
# resolves. Refreshes the local mirror when healthy; warns loudly and points
# to the (read-only, possibly stale) mirror when the drive is absent.
#
# Run at the top of any agent boot. Exit 0 = canonical live; exit 2 = mirror
# fallback (degraded); exit 1 = no memory at all (hard fail).

set -u

REPO="/Users/jedg./Desktop/kat_ha_pb"
# Paths are overridable via env (for testing the fallback branches without
# unmounting the real drive). Defaults are the live production paths.
CANON="${KATHA_CANON:-/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory}"
LINK="$REPO/.memory"
MIRROR="${KATHA_MIRROR:-$REPO/.memory.mirror}"

if [ -d "$CANON" ] && [ -r "$CANON/patterns.md" ]; then
  # Canonical drive healthy → refresh mirror CRASH-SAFELY, boot from canonical.
  # Copy to a temp sibling, then atomically swap. If the drive is yanked
  # mid-copy, the existing good mirror is left untouched (never a partial).
  if [ -n "$MIRROR" ] && [ "$MIRROR" != "/" ]; then
    TMP="${MIRROR}.tmp.$$"
    rm -rf "$TMP" 2>/dev/null
    if cp -R "$CANON/" "$TMP/" 2>/dev/null && [ -r "$TMP/patterns.md" ]; then
      rm -rf "${MIRROR}.old" 2>/dev/null
      [ -d "$MIRROR" ] && mv "$MIRROR" "${MIRROR}.old" 2>/dev/null
      mv "$TMP" "$MIRROR" 2>/dev/null && rm -rf "${MIRROR}.old" 2>/dev/null
      echo "✅ HAM: canonical memory live on Samsung 970. Mirror refreshed (atomic)."
    else
      rm -rf "$TMP" 2>/dev/null
      echo "✅ HAM: canonical memory live. ⚠ Mirror refresh skipped (copy failed); prior mirror kept."
    fi
  fi
  echo "   boot from: $LINK"
  exit 0
fi

# Drive absent → fall back to mirror.
if [ -d "$MIRROR" ] && [ -r "$MIRROR/patterns.md" ]; then
  echo "⚠️  HAM WARNING: Samsung 970 NOT mounted. Canonical .memory/ unreachable."
  echo "   Falling back to LOCAL MIRROR (read-only, may be stale):"
  echo "   $MIRROR"
  echo "   DO NOT write memory until the drive is remounted — writes would be lost."
  exit 2
fi

echo "❌ HAM FATAL: no canonical drive AND no local mirror. Memory is blind."
echo "   Mount the Samsung 970 before proceeding."
exit 1
