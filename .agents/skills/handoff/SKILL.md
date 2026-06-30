---
name: handoff
description: Mechanical HAM sync — refreshes SESSION_HANDOFF.json's derived staleness-checkpoint fields (.session, .latest_memory_entry, .latest_inbox_entry_date, .inbox_pending_count) from the vault's memory.md and inbox.md tails, and prints a drift report of new entries since the last checkpoint. Use at the end of any session that added memory.md/inbox.md entries, or at boot if CLAUDE.md's staleness check flags drift.
---
# Pointer: handoff

The canonical instructions for this skill have been migrated to the vault to optimize prompt tokens.
You MUST load and read the full instructions dynamically using your file-read tools before executing this skill:
- Vault Path: `/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/skills/handoff/SKILL.md`
