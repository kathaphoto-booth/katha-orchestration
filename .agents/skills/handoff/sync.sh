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

# --- old checkpoint values ---
OLD_MEM_DATE=$(jq -r '.latest_memory_entry.date // ""' "$HANDOFF")
OLD_INBOX_DATE=$(jq -r '.latest_inbox_entry_date // ""' "$HANDOFF")
OLD_INBOX_COUNT=$(jq -r '.inbox_pending_count // -1' "$HANDOFF")

# --- newest memory.md entry: find the max date (memory.md is not guaranteed
#     strictly chronological after consolidate-memory), then among entries on
#     that date take the LAST in file order. The earlier `... | sort | tail -1`
#     broke date ties alphabetically by summary text — appending a new entry
#     could leave .latest_memory_entry.summary pointing at an older same-day
#     entry whose text happened to sort later. ---
MAX_MEM_DATE=$(grep -oE '^\[[0-9]{4}-[0-9]{2}-[0-9]{2}\]' "$MEMORY" | sort -u | tail -1 | tr -d '[]' || true)
if [[ -n "$MAX_MEM_DATE" ]]; then
  NEWEST_MEM_LINE=$(grep -E "^\[${MAX_MEM_DATE}\]" "$MEMORY" | tail -1 || true)
else
  NEWEST_MEM_LINE=""
fi
NEW_MEM_DATE=$(printf '%s' "$NEWEST_MEM_LINE" | sed -E 's/^\[([0-9]{4}-[0-9]{2}-[0-9]{2})\].*/\1/' || true)
NEW_MEM_CATEGORY=$(printf '%s' "$NEWEST_MEM_LINE" | sed -E 's/^\[[0-9]{4}-[0-9]{2}-[0-9]{2}\] ([a-zA-Z-]+) - .*/\1/' || true)
NEW_MEM_SUMMARY=$(printf '%s' "$NEWEST_MEM_LINE" | sed -E 's/^\[[0-9]{4}-[0-9]{2}-[0-9]{2}\] [a-zA-Z-]+ - //' || true)

# --- inbox.md "## Pending (AG-proposed)" section: header line to next "## " or EOF ---
PENDING_BLOCK=$(awk '/^## Pending \(AG-proposed\)/{flag=1; next} /^## /{flag=0} flag' "$INBOX" || true)
NEW_INBOX_COUNT=$(printf '%s\n' "$PENDING_BLOCK" | grep -cE '^[-*] ' || true)
NEW_INBOX_DATE=$(printf '%s\n' "$PENDING_BLOCK" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}' | sort | tail -1 || true)

# --- drift report ---
echo "=== /handoff drift report ==="
DRIFT=0

if [[ -n "$NEW_MEM_DATE" && "$NEW_MEM_DATE" > "$OLD_MEM_DATE" ]]; then
  echo "memory.md: newest entry now $NEW_MEM_DATE (checkpoint was '${OLD_MEM_DATE:-<none>}')"
  echo "  -> [$NEW_MEM_DATE] $NEW_MEM_CATEGORY - $NEW_MEM_SUMMARY"
  DRIFT=1
fi

if [[ "$NEW_INBOX_COUNT" != "$OLD_INBOX_COUNT" ]]; then
  echo "inbox.md Pending (AG-proposed): $NEW_INBOX_COUNT line(s) (checkpoint was '${OLD_INBOX_COUNT}')"
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
