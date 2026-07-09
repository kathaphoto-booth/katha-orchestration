#!/usr/bin/env bash
set -euo pipefail

VAULT="/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory"
HANDOFF="$VAULT/SESSION_HANDOFF.json"
MEMORY="$VAULT/memory.md"
INBOX="$VAULT/inbox.md"

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required but not found on PATH." >&2
  exit 1
fi

# --- vault mount preflight (N1) — honor CLAUDE.md's "do not proceed if Samsung 970
#     is unmounted" contract instead of letting jq fail with a cryptic message ---
if [[ ! -d "$VAULT" ]]; then
  echo "vault unreachable: $VAULT" >&2
  echo "Samsung 970 may be unmounted. Per CLAUDE.md: wait for Jed before re-running." >&2
  exit 2
fi

# --- single-writer lock (W2) — prevent concurrent runs from losing each other's
#     drift signal. Portable noclobber-based lockfile (no flock dependency, which
#     macOS doesn't ship). Trap cleans up on any exit. ---
LOCK="$VAULT/.sync.lock"
if ! (set -C; echo $$ > "$LOCK") 2>/dev/null; then
  EXISTING_PID=$(cat "$LOCK" 2>/dev/null || echo "?")
  echo "another /handoff sync in progress (PID $EXISTING_PID, lockfile: $LOCK)" >&2
  echo "if no such PID is running, the lockfile is stale: rm \"$LOCK\" and retry" >&2
  exit 3
fi
trap 'rm -f "$LOCK"' EXIT

# --- old checkpoint values ---
OLD_MEM_DATE=$(jq -r '.latest_memory_entry.date // ""' "$HANDOFF" | tr -d '\r')
OLD_MEM_SUMMARY=$(jq -r '.latest_memory_entry.summary // ""' "$HANDOFF" | tr -d '\r')
OLD_INBOX_DATE=$(jq -r '.latest_inbox_entry_date // ""' "$HANDOFF" | tr -d '\r')
OLD_INBOX_COUNT=$(jq -r '.inbox_pending_count // ""' "$HANDOFF" | tr -d '\r')

# --- newest memory.md entry: find the max date (memory.md is not guaranteed
#     strictly chronological after consolidate-memory), then among entries on
#     that date take the LAST in file order. The earlier `... | sort | tail -1`
#     broke date ties alphabetically by summary text — appending a new entry
#     could leave .latest_memory_entry.summary pointing at an older same-day
#     entry whose text happened to sort later. ---
MAX_MEM_DATE=$(tr -d '\r' < "$MEMORY" | grep -oE '^\[[0-9]{4}-[0-9]{2}-[0-9]{2}\]' | sort -u | tail -1 | tr -d '[]' || true)
if [[ -n "$MAX_MEM_DATE" ]]; then
  NEWEST_MEM_LINE=$(tr -d '\r' < "$MEMORY" | grep -E "^\[${MAX_MEM_DATE}\]" | tail -1 || true)
else
  NEWEST_MEM_LINE=""
fi
# Regex parsing using sed -n to output nothing on mismatch
NEW_MEM_DATE=$(printf '%s' "$NEWEST_MEM_LINE" | sed -n -E 's/^\[([0-9]{4}-[0-9]{2}-[0-9]{2})\].*/\1/p' || true)
NEW_MEM_CATEGORY=$(printf '%s' "$NEWEST_MEM_LINE" | sed -n -E 's/^\[[0-9]{4}-[0-9]{2}-[0-9]{2}\] ([a-zA-Z-]+) - .*/\1/p' || true)
NEW_MEM_SUMMARY=$(printf '%s' "$NEWEST_MEM_LINE" | sed -n -E 's/^\[[0-9]{4}-[0-9]{2}-[0-9]{2}\] [a-zA-Z-]+ - (.*)/\1/p' || true)

# Fallbacks for malformed/uncategorized entries (e.g. [2026-06-14] - text or [2026-06-14] text)
if [[ -n "$NEW_MEM_DATE" && -z "$NEW_MEM_SUMMARY" ]]; then
  NEW_MEM_SUMMARY=$(printf '%s' "$NEWEST_MEM_LINE" | sed -n -E 's/^\[[0-9]{4}-[0-9]{2}-[0-9]{2}\] - (.*)/\1/p' || true)
fi
if [[ -n "$NEW_MEM_DATE" && -z "$NEW_MEM_SUMMARY" ]]; then
  NEW_MEM_SUMMARY=$(printf '%s' "$NEWEST_MEM_LINE" | sed -n -E 's/^\[[0-9]{4}-[0-9]{2}-[0-9]{2}\] (.*)/\1/p' || true)
fi
if [[ -n "$NEW_MEM_DATE" && -z "$NEW_MEM_CATEGORY" ]]; then
  NEW_MEM_CATEGORY="uncategorized"
fi

# --- inbox.md "## Pending (AG-proposed)" section: header line to next "## " or EOF ---
PENDING_BLOCK=$(tr -d '\r' < "$INBOX" | awk '/^## Pending \(AG-proposed\)/{flag=1; next} /^## /{flag=0} flag' || true)
NEW_INBOX_COUNT=$(printf '%s\n' "$PENDING_BLOCK" | grep -cE '^[-*] ' || true)
NEW_INBOX_DATE=$(printf '%s\n' "$PENDING_BLOCK" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}' | sort | tail -1 || true)

# --- drift report ---
echo "=== /handoff drift report ==="
DRIFT=0

# --- memory.md drift: compare SUMMARY content, not just date. The earlier
#     date-only check (`NEW_MEM_DATE > OLD_MEM_DATE`) missed same-day appends —
#     a new entry on the existing checkpoint date would update the field but
#     not flag drift to the operator. ---
if [[ -n "$NEW_MEM_SUMMARY" && "$NEW_MEM_SUMMARY" != "$OLD_MEM_SUMMARY" ]]; then
  if [[ "$NEW_MEM_DATE" == "$OLD_MEM_DATE" ]]; then
    echo "memory.md: newest entry CHANGED on existing date $NEW_MEM_DATE (same-day append)"
  else
    echo "memory.md: newest entry now $NEW_MEM_DATE (checkpoint was '${OLD_MEM_DATE:-<none>}')"
  fi
  echo "  -> [$NEW_MEM_DATE] $NEW_MEM_CATEGORY - $NEW_MEM_SUMMARY"
  DRIFT=1
fi

# --- inbox count drift, with explicit first-run framing (N2) ---
if [[ -z "$OLD_INBOX_COUNT" ]]; then
  echo "inbox.md Pending (AG-proposed): $NEW_INBOX_COUNT line(s) (first run; no prior checkpoint)"
  DRIFT=1
elif [[ "$NEW_INBOX_COUNT" != "$OLD_INBOX_COUNT" ]]; then
  echo "inbox.md Pending (AG-proposed): $NEW_INBOX_COUNT line(s) (checkpoint was $OLD_INBOX_COUNT)"
  DRIFT=1
fi

if [[ -n "$NEW_INBOX_DATE" && "$NEW_INBOX_DATE" > "$OLD_INBOX_DATE" ]]; then
  echo "inbox.md Pending (AG-proposed): newest dated entry now $NEW_INBOX_DATE (checkpoint was '${OLD_INBOX_DATE:-<none>}')"
  DRIFT=1
fi

if [[ "$DRIFT" -eq 0 ]]; then
  echo "No drift since last checkpoint."
fi

# --- update SESSION_HANDOFF.json: derived checkpoint fields ONLY ---
TMP=$(mktemp "$VAULT/.SESSION_HANDOFF.json.XXXXXX")
jq \
  --arg session "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --arg mem_date "$NEW_MEM_DATE" \
  --arg mem_cat "$NEW_MEM_CATEGORY" \
  --arg mem_sum "$NEW_MEM_SUMMARY" \
  --arg inbox_date "$NEW_INBOX_DATE" \
  --argjson inbox_count "${NEW_INBOX_COUNT:-0}" \
  '.session = $session
   | .latest_memory_entry = {date: $mem_date, category: $mem_cat, summary: $mem_sum}
   | .latest_inbox_entry_date = $inbox_date
   | .inbox_pending_count = $inbox_count' \
  "$HANDOFF" > "$TMP"

mv "$TMP" "$HANDOFF"

echo ""
echo "Checkpoint refreshed: .session, .latest_memory_entry, .latest_inbox_entry_date, .inbox_pending_count"
COMPILE_MEMORY_NESTED=1 /Users/jedg./Desktop/kat_ha_pb/bin/compile-memory.sh

echo "Syncing documentation with OpenWiki..."
if command -v openwiki >/dev/null 2>&1; then
  openwiki --update || echo "openwiki --update failed."
else
  npx --yes openwiki --update || echo "npx openwiki --update failed."
fi

echo "Opening vault in Obsidian..."
if command -v obsidian >/dev/null 2>&1; then
  # The vault root is /Volumes/samsung 970 pro - Data/KATHA_VAULT
  # Obsidian hides dot-folders like .memory, so we open a known visible file to focus the vault
  obsidian open vault="knowledge" file="AGENTS.md" || true
else
  echo "obsidian CLI not found in PATH."
fi
