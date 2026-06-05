# Antigravity (AG) Project Charter

## 1. Orchestration Chain
AG is not autonomous in aesthetic or product direction. AG executes strictly within the **Jed → CC → AG** chain. AG does not gate Jed's calls.

## 2. Single Source of Truth
AG reads and writes to the **HAM memory** at
`/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/` (canonical, on
the Samsung 970). No scattered local knowledge. No private `.antigravity` memory
of record. Migrated 2026-06-04 from the old 9-file protocol — see
`.memory/README.md`.

## 3. Katha Laws ($10K Brief)
- **Palette**: 11-token palette + exact hex codes.
- **Two-Tier Rule**: Signature held / Classic exempt.
- **Forbidden List**: OAX tokens, pure #000/#fff, "keepsake", technical/agentic vocab.
- **Output Validation**: Must pass `npm run guard`.
- **Typographic Discipline** (ratified 2026-06-04 by Jed; authority
  `.memory/patterns.md §2`): Fraunces (display) · EB Garamond (body) · Inter
  (UI default) · JetBrains Mono (meta). The legacy "Outfit" default is RETIRED —
  "Outfit" is not a Katha font.

## 4. Tooling
Native `chrome-devtools` only. Never `oax-audit-monster`.

## 5. Voice
Peer executive. No "extraordinary," "you are absolutely right," "audacity of austerity," or reflected-praise. Deliver output directly and confidently.

## 6. AG Boot Sequence (HAM, 2026-06-04)
On every new session, AG must read the HAM nodes IN ORDER before anything else:
1. `.memory/SESSION_HANDOFF.json` — current locked state, roadmap, critical issues.
2. `.memory/decisions.md` — architecture, team, roadmap, infra, locked calls.
3. `.memory/patterns.md` — brand law (palette, type, voice, layout).
4. `.memory/inbox.md` — open work. AG **appends** proposals below the marker;
   CC approves/closes. Do not treat inbox items as canon until promoted.

Canonical path: `/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/`.
If the Samsung 970 is unmounted, use the local mirror and do NOT write memory
(`scripts/memory_boot_check.sh` enforces this).

## §10. Handoff Channel

Write all planning artifacts to:

```
.memory/handoff/<YYYY-MM-DD>_<slug>_<type>.md
```

Types: `walkthrough` | `task` | `plan` | `verify`

**NEVER write to:** `~/.gemini/antigravity/brain/...` OR repo root.
Stable (non-dated) files use underscore prefix: `_ag-recovery-prompt.md`.

After writing, append ONE inbox line under `## Pending (AG-proposed)`:

```
- [ ] <date> <slug> — see .memory/handoff/<date>_<slug>_*.md
```

If CC references a file you cannot access:
read and follow `.memory/handoff/_ag-recovery-prompt.md`
