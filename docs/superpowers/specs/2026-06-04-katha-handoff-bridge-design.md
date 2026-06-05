# Katha Handoff Bridge — Design Spec

**Date:** 2026-06-04
**Status:** Approved by Jed, ready for implementation planning
**Brainstorm route:** `superpowers:brainstorming` → this spec → `superpowers:writing-plans`
**Constitutional home:** `katha-protocol` §10 (new section) + `GEMINI.md` mirror

---

## 1. Problem

CC and AG run in separate runtimes (Claude Code vs Antigravity/Gemini) and cannot directly invoke each other. AG produces planning artifacts (`walkthrough.md`, `task.md`, `implementation_plan.md`) in its private brain dir (`~/.gemini/antigravity/brain/<conversation-id>/`). CC boots from exactly four HAM nodes and never sees those artifacts.

Today (2026-06-04) the gap was patched by AG manually copying files to the repo root. That worked once but isn't a protocol. The deeper failure modes:

- **A — Boot-time gap:** CC boots and misses AG's handoff entirely
- **C — Path discipline:** AG writes to a runtime-private location that CC cannot reach

A standalone CC skill can't solve this because AG can't invoke `.claude/skills/`. The bridge must live in a place both runtimes already honor.

## 2. Architecture

**The rule lives in `katha-protocol` §10 "Handoff Channel"** — already the constitution both runtimes follow. CC reads it via the `/katha-protocol` skill route; AG reads it via `GEMINI.md` which mirrors `katha-protocol`.

Three enforcement layers:

| Layer | Mechanism | Solves |
|---|---|---|
| **Constitutional** | `katha-protocol` §10 + `GEMINI.md` §10 mirror | C (path discipline) |
| **Mechanical** | `scripts/memory_boot_check.sh` extended with handoff scanner | A (boot-time gap) |
| **Visibility** | `KATHA_STATE.html` "Latest Handoff" panel rendered by `scripts/build_katha_dashboard.mjs` | Human navigation |

No new top-level skill. The protocol that already bridges the runtimes carries one more rule.

## 3. Path Contract

All handoff artifacts live at:

```
.memory/handoff/<YYYY-MM-DD>_<slug>_<type>.md
```

- `<YYYY-MM-DD>` — handoff date, absolute (no relative dates)
- `<slug>` — kebab-case topic (e.g., `seo-migration`, `vercel-cache-fix`)
- `<type>` — one of: `walkthrough`, `task`, `plan`, `verify`
- File extension: `.md` only (Markdown — both runtimes parse natively)

**Examples:**
- `.memory/handoff/2026-06-04_seo-migration_walkthrough.md`
- `.memory/handoff/2026-06-04_seo-migration_task.md`
- `.memory/handoff/2026-06-04_vercel-cache-fix_verify.md`

**Forbidden locations:**
- AG private brain dir (`~/.gemini/antigravity/brain/`) — invisible to CC
- Repo root (`/walkthrough.md`, `/task.md`) — transient scratch, pollutes git status
- Anywhere outside `.memory/handoff/`

The directory is symlinked through the Samsung 970 vault like the rest of HAM. AG writes there directly; CC reads through the symlink.

## 4. Boot Script Trip-Wire

`scripts/memory_boot_check.sh` extended with a handoff scan:

```bash
# After existing vault-mount check
HANDOFF_DIR="$MEMORY_ROOT/handoff"
SESSION_TS=$(stat -f %m "$MEMORY_ROOT/SESSION_HANDOFF.json" 2>/dev/null || echo 0)
UNREAD=$(find "$HANDOFF_DIR" -name "*.md" -newer "$MEMORY_ROOT/SESSION_HANDOFF.json" 2>/dev/null)

if [ -n "$UNREAD" ]; then
  echo "⚠️  UNREAD HANDOFF ARTIFACTS:"
  echo "$UNREAD" | sed 's|^|   |'
  echo "   → Read before triaging inbox.md"
fi
```

- Exits 0 either way (warning, not block — bridge gap shouldn't stop boot)
- Newness compared to `SESSION_HANDOFF.json` mtime — once CC updates the handoff file as part of triage, the artifact stops surfacing as unread
- Output appears in CC's boot stream alongside the existing "canonical memory live" line

## 5. Dashboard Panel

`scripts/build_katha_dashboard.mjs` gains a `renderHandoffPanel()` step:

- Scans `.memory/handoff/*.md`, sorts by date desc
- Renders the most recent 3 as collapsible panels in `KATHA_STATE.html`
- Panel position: between "Roadmap" and "Open Work" sections
- Each panel header: `<date> · <slug> · <type>` with full markdown body rendered (use `marked` or similar — already a JS-side dep, no Python needed)
- Older handoffs accessible via a "View all (N more)" link that lists paths

**Visual treatment** follows existing dashboard tokens — Knalum Ink background, Champagne Heirloom eyebrow, no new chrome.

## 6. GEMINI.md AG Charter Mirror

Add to `GEMINI.md` (canonical Vault copy + repo symlink):

```markdown
## §10. Handoff Channel (mirrors katha-protocol §10)

When you complete work that CC must continue, write the artifacts to:

  .memory/handoff/<YYYY-MM-DD>_<slug>_<type>.md

types: walkthrough | task | plan | verify

NEVER write planning artifacts to:
- your private brain dir (~/.gemini/antigravity/brain/...)
- the repo root (/walkthrough.md, /task.md)

After writing the file(s), append ONE line to .memory/inbox.md under
"## Pending (AG-proposed) — awaiting CC triage":

  - [ ] <date> <slug> — see .memory/handoff/<date>_<slug>_*.md

That single inbox line is the signal CC sees at boot. The file itself
is surfaced by scripts/memory_boot_check.sh as an UNREAD HANDOFF warning.
```

## 7. AG-Recovery Prompt (Lost-in-Translation Failsafe)

When CC references a file AG can't see (e.g., a `.claude/skills/` file, a CC-local plan, or a Vault path AG's runtime didn't mount), paste this into AG to restore alignment:

```
You are AG (Antigravity/Gemini) operating in the Katha triad
(Jed → CC → AG). CC just referenced a file you cannot access.

Do NOT hallucinate the file's contents. Instead:

1. Confirm what runtime path you actually have access to. Your canonical
   memory is the Samsung 970 vault:
   /Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/

2. The HAM nodes you and CC both share are at .memory/ in that vault:
   - SESSION_HANDOFF.json
   - decisions.md
   - patterns.md
   - inbox.md
   - handoff/  (the bridge directory — both runtimes read+write here)

3. If CC referenced a file outside .memory/, it is CC-local
   (e.g., .claude/skills/*, docs/superpowers/specs/*). You cannot
   read these directly. Ask CC via .memory/inbox.md to either:
   (a) summarize the relevant content into a .memory/handoff/ artifact,
       OR
   (b) paste the content directly into your next prompt.

4. To respond to CC's request, write your reply to:
   .memory/handoff/<today>_<slug>_<type>.md
   then append one inbox line per katha-protocol §10.

5. Never write planning artifacts to your private brain dir
   (~/.gemini/antigravity/brain/...) — CC cannot see them.

Now restate what CC asked for, identify which files you need but
cannot access, and propose the handoff path forward.
```

Save this prompt to `.memory/handoff/_ag-recovery-prompt.md` (underscore prefix = stable, not a dated artifact) so it's discoverable by both runtimes when transmission breaks.

## 8. What Changes (Implementation Order)

1. Create `.memory/handoff/` directory in the Vault, symlink confirmed at repo
2. Add §10 to `.agents/skills/katha-protocol/SKILL.md` (CC's locked skill at this path)
3. Mirror to `GEMINI.md` §10
4. Add `decisions.md` §13 lock: handoff artifacts live in `.memory/handoff/`, projected through the dashboard
5. Extend `scripts/memory_boot_check.sh` with the handoff scanner
6. Extend `scripts/build_katha_dashboard.mjs` with `renderHandoffPanel()`
7. Migrate today's repo-root `walkthrough.md` + `task.md` → `.memory/handoff/2026-06-04_seo-migration_*.md`; delete originals
8. Update `inbox.md` to point at new paths
9. Write `.memory/handoff/_ag-recovery-prompt.md`
10. Regenerate `KATHA_STATE.html` and verify the new panel renders
11. Commit with a single message: `feat(HAM): handoff bridge — katha-protocol §10 + boot trip-wire + dashboard panel`

## 9. Non-Goals (Explicit Cuts)

- **No Gemini-side skill registry.** Closing AG's parity gap with CC's full skill arsenal (impeccable, brainstorming, plan, verify, etc.) is a separate, bigger initiative. Out of scope for this bridge.
- **No knowledge-graph integration.** `katha-memory` skill (Knowledge Graph MCP) stays untouched. Handoffs are file artifacts, not graph entities. Cross-linking is a future enhancement.
- **No automatic AG-side enforcement.** AG charter says "write here, not there"; we trust AG to honor the protocol. If drift recurs, escalate to a Gemini-side hook.

## 10. Success Criteria

- CC boots → sees `⚠️ UNREAD HANDOFF` warning when AG has left work
- AG writes to `.memory/handoff/`, never to repo root or brain dir
- `KATHA_STATE.html` shows the latest handoff inline — Jed opens one file, sees everything
- No new boot-time .md file (4 HAM nodes preserved)
- `walkthrough.md` and `task.md` no longer pollute the repo root
