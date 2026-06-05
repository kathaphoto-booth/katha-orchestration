# Final Execution Plan — 2026-06-04 Session Close

## Goal
Finish today's work, lean out the architecture, set up Obsidian, commit.

## Order of Operations

### Phase A — Finish original plan (4 items)
1. **Find and delete zombie skills** (`katha-workflow`, `katha-verify`, `katha-antigravity`, `katha-memory`) wherever they live
2. **Install playwright-skill** (`npx skills add testdino-hq/playwright-skill/core` + `/playwright-cli`)
3. **Skip dashboard panel** — Obsidian replaces it; document this decision
4. Continue to Phase B (commit at end)

### Phase B — Symlink lean-out
1. Rewrite CLAUDE.md boot section to use absolute vault path; remove all `.memory/` symlink refs
2. Update katha-protocol §10 references to absolute path
3. Update decisions.md §13 reference to absolute path
4. Update GEMINI.md §10 reference to absolute path
5. Delete `/Users/jedg./Desktop/kat_ha_pb/.memory` (symlink)
6. Delete `/Users/jedg./Desktop/kat_ha_pb/.memory.mirror/` (fallback)
7. Delete `/Users/jedg./Desktop/kat_ha_pb/scripts/memory_boot_check.sh` (no longer needed)
8. Update CLAUDE.md BOOT ORDER — remove the `bash scripts/memory_boot_check.sh` step

### Phase C — Obsidian setup
1. Verify Obsidian is installed (or instruct Jed to download from obsidian.md)
2. Point Obsidian at vault root: `/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/`
3. Confirm the 4 HAM nodes render
4. Confirm `.memory/handoff/` files render
5. Recommend Dataview plugin (optional, for inbox queries)

### Phase D — Commit and close
1. `git status` — confirm clean state expected
2. Single commit with comprehensive message covering ALL of today's work
3. Verify `git log --oneline -3` shows the new commit
4. Done

## Verification
- `ls .memory` should fail (symlink gone)
- `ls .memory.mirror` should fail (deleted)
- `ls scripts/memory_boot_check.sh` should fail (deleted)
- `grep -r ".memory/" CLAUDE.md GEMINI.md .agents/skills/katha-protocol/SKILL.md` should return zero local-path references (only absolute vault paths)
- Obsidian opens the vault and renders markdown
- `git log --oneline -1` shows the commit
