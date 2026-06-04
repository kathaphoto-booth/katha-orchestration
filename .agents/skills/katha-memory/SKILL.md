---
name: katha-memory
description: Atomic handoff and memory synchronization between AG and CC. Use whenever the user says "save system memory", "handoff", "save state", "sync memory", "update handoff", or at any session end, phase completion, or milestone. Also use when debugging stale context between agents or when CC boots with conflicting roadmap information. This skill prevents the drift that occurs when some handoff files are updated but others are forgotten.
---

# Katha Memory — The Atomic Handoff Protocol

## Why This Exists

The Katha project stores state across **9 files in 3 locations**. When an agent updates some files but forgets others, the next agent boots with conflicting signals — the Vault says Phase 3, but `CLAUDE.md` still says Phase 2. That's a leak. This skill eliminates partial updates by defining a strict write contract.

## Type: Rigid

Follow this skill exactly. No shortcuts. No "I'll update the rest later."

## The 9-File Manifest

Every handoff touches all 9 files. No exceptions.

### Location 1: The Vault (`/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/`)

| # | File | Write Mode | Purpose |
|---|------|-----------|---------|
| 1 | `SESSION_HANDOFF.json` | **Manual first** — this is the INPUT | Machine-readable checkpoint, roadmap, palette mandate |
| 2 | `HCL.md` | Full rewrite (via script) | Living roadmap & kanban for CC |
| 3 | `HCL_DASHBOARD.html` | Full rewrite (via script) | Visual kanban — the proof layer |
| 4 | `MEMORY.md` | Timestamp bump | Knowledge node index |
| 5 | `project_katha_booth.md` | Roadmap table patch | Full project context for AG |
| 6 | `BRAND_CANON.json` | Read-only verify | Palette drift detection |
| 7 | `TECH_DEBT.json` | Append only | Deferred issues log |

### Location 2: Local Workspace (`/Users/jedg./Desktop/kat_ha_pb/`)

| # | File | Write Mode | Purpose |
|---|------|-----------|---------|
| 8 | `SESSION_HANDOFF.json` | Mirror copy from Vault | CC local access |
| 9 | `CLAUDE.md` — `## LATEST AG SESSION HANDOFF` section | Section patch | CC's system prompt handoff block |

### Location 3: CC's Private Memory (`/Users/jedg./Desktop/kat_ha_pb/.claude/memory/`)

| # | File | Write Mode | Purpose |
|---|------|-----------|---------|
| 10 | `STATE.md` | Full rewrite | CC's emergency save-game |

> Note: The manifest lists 10 entries because `SESSION_HANDOFF.json` appears in two locations (Vault original + local mirror).

## The Write Order

Execute in this exact sequence. Each step depends on the previous.

### Step 1: Write the Input
Update `SESSION_HANDOFF.json` in the Vault with:
- `checkpoint` — the current milestone string
- `timestamp` — today's date
- `updated_by` — which agent performed the handoff
- `roadmap` — all phase statuses (COMPLETED / ACTIVE / PLANNED)
- Any changes to `architectural_state` or `palette_mandate`

### Step 2: Run the Sync Script
```bash
python3 scripts/katha_handoff.py
```
This generates `HCL.md` and `HCL_DASHBOARD.html` deterministically from `SESSION_HANDOFF.json`. If the script is unavailable, run `python3 scripts/hcl_sync.py` as a fallback (partial sync — covers files 2-3 only).

### Step 3: Bump the Timestamp
Update `MEMORY.md` line 2: `**Last Updated:** <today's date>`

### Step 4: Sync the Roadmap Table
In `project_katha_booth.md`, find the `## Current Roadmap Position` section and rewrite the table to match `SESSION_HANDOFF.json` roadmap statuses.

### Step 5: Mirror to Local
```bash
cp "/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/SESSION_HANDOFF.json" "/Users/jedg./Desktop/kat_ha_pb/SESSION_HANDOFF.json"
```

### Step 6: Patch CLAUDE.md
Find the `## LATEST AG SESSION HANDOFF` section in `CLAUDE.md` and rewrite it to reflect:
- Current phase header (e.g., `PHASE 2 COMPLETE`)
- Updated locked decisions
- Updated roadmap position
- Updated known critical issues / tech debt

Also update Line 33 (the mission statement) to reference the correct active phase.

### Step 7: Rewrite STATE.md
Regenerate `.claude/memory/STATE.md` with:
- Current timestamp and status
- Architectural alignment summary
- Squarespace pivot status
- File organization integrity note
- Roadmap status (matching `SESSION_HANDOFF.json`)

### Step 8: Verify BRAND_CANON.json
Read `BRAND_CANON.json` and confirm the palette tokens match `SESSION_HANDOFF.json` `palette_mandate`. If drift is detected, alert — do not silently overwrite.

### Step 9: Append Tech Debt
Add any new deferred issues to `TECH_DEBT.json`. Never remove existing items via this step.

## Validation Checklist

After all writes, confirm every line:

```
- [ ] SESSION_HANDOFF.json (Vault) checkpoint matches CLAUDE.md section header
- [ ] SESSION_HANDOFF.json roadmap matches project_katha_booth.md table
- [ ] STATE.md status line matches SESSION_HANDOFF.json checkpoint
- [ ] HCL.md milestone matches SESSION_HANDOFF.json checkpoint
- [ ] BRAND_CANON.json palette matches SESSION_HANDOFF.json palette_mandate
- [ ] SESSION_HANDOFF.json (local) is byte-identical to Vault copy
- [ ] MEMORY.md timestamp is today's date
- [ ] All 9 files agree: Phase [X] is [STATUS]
```

## The HCL Dashboard as Proof

After the sync completes, open `HCL_DASHBOARD.html` in the browser. It visually renders the kanban board, palette swatches, active skills, and orchestration diagrams. If anything looks wrong in the dashboard, a file was missed.

## When NOT to Use This Skill

- Quick research questions ("where is X?") — no state change, no handoff needed
- Mid-task progress — save memory at milestones, not after every edit
- If the user explicitly says "don't save yet"
