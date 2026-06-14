---
name: handoff
description: Mechanical HAM sync — refreshes SESSION_HANDOFF.json's derived staleness-checkpoint fields (.session, .latest_memory_entry, .latest_inbox_entry_date, .inbox_pending_count) from the vault's memory.md and inbox.md tails, and prints a drift report of new entries since the last checkpoint. Use at the end of any session that added memory.md/inbox.md entries, or at boot if CLAUDE.md's staleness check flags drift.
---

# /handoff — Mechanical HAM Sync

## What this does

Runs `sync.sh`, which:

1. Reads `SESSION_HANDOFF.json`'s current checkpoint fields
   (`.latest_memory_entry.date`, `.latest_inbox_entry_date`,
   `.inbox_pending_count`).
2. Scans vault `memory.md` for the newest `[YYYY-MM-DD] category - entry` line
   **by date, not by file position** — `memory.md` is not guaranteed strictly
   chronological after a `consolidate-memory` pass.
3. Scans vault `inbox.md`'s `## Pending (AG-proposed)` section for its line
   count and the newest dated entry (this is AG's append point — see
   `instructions.md` Agent Boundaries).
4. Updates `SESSION_HANDOFF.json` in place via `jq`: bumps `.session` to now,
   and sets/refreshes `.latest_memory_entry` (`{date, category, summary}`),
   `.latest_inbox_entry_date`, and `.inbox_pending_count`. Key order and
   2-space indentation are preserved; these four fields are the only ones
   touched.
5. Prints a drift report: any `memory.md`/`inbox.md` signal newer than the
   OLD checkpoint values — i.e. what changed since the last `/handoff`.

## What this does NOT do

- Does **not** touch `flags_for_jed`, `held_back_pending_jed`,
  `canonical_infra`, `next_build`, `pending_blockers`, `current_task`,
  `next_owner`, `phase`, `shipped_*`, or `resolved_since_last_handoff`. Those
  are curated/narrative fields — only CC, editing deliberately in the same
  session, should change them.
- Does **not** regenerate `SESSION_HANDOFF.json` wholesale. It is a targeted
  `jq` field update — four fields only.
- Does **not** write to `memory.md`, `inbox.md`, `decisions.md`, or
  `patterns.md`. Those follow the Auto-Capture / Promotion / Staleness rules
  in vault `instructions.md`, applied by CC directly via Read/Edit.

## How to run

```bash
bash .agents/skills/handoff/sync.sh
```

Read the drift report it prints. If it shows new `memory.md`/`inbox.md`
entries relevant to the current session's work, fold a one-line summary into
`SESSION_HANDOFF.json`'s `.resolved_since_last_handoff` via a normal `Edit` —
that field stays narrative/CC-curated; `sync.sh` never touches it.

View the updated vault live in Obsidian (vault root =
`/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/`) — no
dashboard regeneration needed.

## When to run

- **End of session** — if this session appended to `memory.md` or `inbox.md`,
  run `/handoff` before finishing so the next session's staleness check
  (CLAUDE.md BOOT ORDER / vault `instructions.md` Boot Order) has an accurate
  checkpoint.
- **Boot time** — if the staleness check finds `memory.md`/`inbox.md` newer
  than the recorded checkpoint, read the new entries first — then run
  `/handoff` once you've incorporated them, to clear the drift signal for the
  next session.
