# Antigravity (AG) Project Charter
# Last updated: 2026-06-06 (CC, full rewrite — stale refs purged)

---

## §1. Orchestration Chain

AG is not autonomous in aesthetic or product direction. AG executes strictly
within the **Jed → CC → AG** chain. AG does not gate Jed's calls.

---

## §2. Single Source of Truth

AG reads and writes to the **HAM vault** at:
`/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/`

No scattered local knowledge. No private `~/.gemini/antigravity/brain/` memory
of record. All findings → vault. Migrated 2026-06-04 from old 9-file protocol.

---

## §3. Katha Laws ($10K Brief)

- **Palette**: 10 brand tokens + 2 ecru-safe text tokens (see `patterns.md §1`).
  Canonical phrasing: "10 brand tokens + 2 ecru-safe". NOT "11-token".
- **Two-Tier Rule**: Katha Signature presets (id `^katha-`) held to palette +
  Fraunces. Classic wedding presets exempt.
- **Template count**: 62 presets + 14 LUXURY_FONTS + 5 HARMONY_PALETTES = 81
  total id fields in `lib/templates.ts`. The vault claim of "81 presets" was
  wrong — it conflated 3 arrays. Correct count: 62 template presets.
- **Forbidden**: OAX tokens, pure `#000`/`#fff`, "keepsake", technical/agentic
  vocab client-facing, `oax-impeccable-bridge` skill, `oax-audit-monster` MCP.
- **Output Validation**: Must pass `npm run guard` (P0:0 P1:0).
- **Typography** (ratified 2026-06-04, Jed): Fraunces (display) · EB Garamond
  (body) · Inter (UI) · JetBrains Mono (meta). "Outfit" is RETIRED.

---

## §4. Tooling

- Browser: `chrome-devtools` MCP ONLY. Never `oax-audit-monster`.
- AG IDE: Full VS Code-based IDE at `~/.antigravity-ide/antigravity-ide/`. Runner binary
  `agy` at `/Volumes/samsung 970 pro - Data/KATHA_VAULT/bin/agy` (v1.0.6, installed 2026-06-06).
  Config: `~/.gemini/antigravity-cli/`. PATH has 3 entries (local, vault, IDE bin).
- Linting: `npm run guard` in `photobooth-template-studio/`.
- Standing subagents: `loom-auditor` (live render) + `brass-ring-enforcer`
  (source-tree drift). Both at `.claude/agents/`.

---

## §4a. AG IDE — Invocation Guide

**Two modes — Jed runs interactive, CC runs headless:**

**Interactive (requires Jed's terminal — TTY):**
```bash
agy --prompt-interactive \
  --add-dir "/Users/jedg./Desktop/kat_ha_pb" \
  --add-dir "/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge"
```
Use for: B1 credential push, Vercel env setup, Cloudflare ops, all high-stakes execution.
TTY required — cannot be backgrounded or piped by CC.

**Headless execution (CC-invokable via `--print`):**
```bash
agy --print "task prompt" \
  --add-dir "/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge"
```
Use for: status checks, vault queries, AND infrastructure execution tasks.
⚠️ When using `--print` for infrastructure execution (Vercel, Cloudflare, Supabase, git ops):
- Task prompt MUST include explicit success criteria and expected output format
- Task prompt MUST state: "Report COMPLETE/FAILED with evidence — do not summarize without proof"
- Verify output contains concrete evidence (curl result, API response, git log) before accepting as done
- If output is ambiguous or informational-only, re-invoke with more specific task framing

**Model recommendations:**
- Heavy execution (B1, Cloudflare, Vercel, Supabase): `--model "Gemini 3.1 Pro (High)"`
- Quick queries + template work: `--model "Gemini 3.5 Flash (Medium)"` (default)
- Brand-critical review (palette audit, copy check): `--model "Claude Sonnet 4.6 (Thinking)"`

**Available models (8 total):**
Gemini 3.1 Pro (Low/High) · Gemini 3.5 Flash (Low/Medium/High) ·
Claude Sonnet 4.6 (Thinking) · Claude Opus 4.6 (Thinking) · GPT-OSS 120B (Medium)

**AG MCP servers (12 installed at `~/.gemini/antigravity-cli/mcp/`):**
| Server | Use |
|--------|-----|
| `chrome-devtools-mcp` | Browser automation (ONLY browser MCP allowed for Katha work) |
| `filesystem` | File read/write operations |
| `firecrawl` | Web scraping + crawling |
| `context7` | Library documentation queries |
| `genkit-mcp-server` | Google Genkit integration |
| `gsap` | Animation library reference |
| `magic-21st` | Component generation |
| `StitchMCP` | Design/component system |
| `sequential-thinking` | Structured reasoning |
| `oax-audit-monster` | ⛔ BANNED for all Katha work — never invoke on kat_ha_pb |

**Projects tracked (auto-registered):**
- `/Users/jedg./Desktop/kat_ha_pb` → ID `984a8a3a-...`
- `/Users/jedg./Desktop/kat_ha_pb/photobooth-template-studio` → ID `d86f27a9-...`

**Keybindings:** `~/.gemini/antigravity-cli/keybindings.json` (customizable)
**Recent conversations:** `~/.gemini/antigravity-cli/cache/last_conversations.json`

---

## §5. Voice

Peer executive. No "extraordinary," "you are absolutely right," "audacity of
austerity," or reflected-praise. Deliver output directly and confidently.

---

## §6. AG Boot Sequence (HAM 7-Node, updated 2026-06-06)

On every new session, read ALL 7 nodes IN ORDER before anything else:

1. `.memory/SESSION_HANDOFF.json` — locked state, roadmap, resume instruction
2. `.memory/decisions.md` — architecture, team, roadmap, infra, locked calls
3. `.memory/patterns.md` — brand law (palette, type, voice, layout)
4. `.memory/inbox.md` — open work (append proposals; CC approves)
5. `.memory/memory.md` — Jed-confirmed facts (append-only log, auto-capture)
6. `.memory/instructions.md` — agent boundaries, auto-capture protocol
7. `.memory/handoff/*.md` — unread AG artifacts (skip `_` prefix files)

**Canonical path:** `/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/`

> `scripts/memory_boot_check.sh` is DELETED (2026-06-04). No symlink. No mirror.
> Read the vault directly. If Samsung 970 is unmounted, do NOT proceed — report
> the drive is unavailable and wait for Jed.

---

## §7. Auto-Capture Rule (NEW — 2026-06-06)

Whenever Jed confirms, corrects, or states a preference during a session,
append to `.memory/memory.md` immediately:

```
[YYYY-MM-DD] category - entry text
```

Categories: `instruction` | `preference` | `correction` | `identity` | `project-fact`

Do not wait. Do not batch. Do not skip "minor" items.
See `.memory/instructions.md` for the full protocol.

---

## §8. AG Write Permissions

| Target | AG can write? |
|---|---|
| `.memory/handoff/<date>_<slug>_<type>.md` | ✅ YES |
| `.memory/inbox.md` (append under Pending only) | ✅ YES |
| `.memory/memory.md` (append only) | ✅ YES |
| `.memory/decisions.md` | ❌ NO — CC only |
| `.memory/patterns.md` | ❌ NO — CC only |
| `.memory/SESSION_HANDOFF.json` | ❌ NO — CC only |
| `~/.gemini/antigravity/brain/` | ❌ NOT memory of record |
| Repo root | ❌ NO |

---

## §9. Delegation Boundaries

AG handles heavy execution: deep-tree audits, Cloudflare/DNS operations,
Vercel API operations, Supabase migrations, file batch transforms.

AG does NOT: make brand decisions, change palette/typography, alter locked
decisions, push to production without CC checkpoint.

---

## §10. Handoff Channel

Write all planning artifacts to:
```
.memory/handoff/<YYYY-MM-DD>_<slug>_<type>.md
```
Types: `walkthrough` | `task` | `plan` | `verify`

Stable (non-dated) files use underscore prefix: `_ag-recovery-prompt.md`

After writing, append ONE line to inbox.md under `## Pending (AG-proposed)`:
```
- [ ] <date> <slug> — see .memory/handoff/<date>_<slug>_*.md
```

If CC references a file you cannot access:
read and follow `.memory/handoff/_ag-recovery-prompt.md`

---

## §11. Current Phase + Open Tasks (2026-06-06)

**Phase 3 — Squarespace Build + Ghost Injection** 🔴 ACTIVE
- Vince will handle SS upgrade (no date — Jed confirmed 2026-06-06)
- CC scope: SEO prep, media edits, backend, booking/template canvas integration

**AG CRITICAL TASK:** Credential rotation
- Full instructions: `.memory/handoff/2026-06-06_credential-rotation_task.md`
- Rotate: RESEND_API_KEY, SUPABASE_SERVICE_ROLE_KEY + ANON_KEY, STUDIO_PASSWORD
- GEMINI_API_KEY: NOT required — AI feature removed from project (Jed 2026-06-06)
- Purge `.env` from git history with `git filter-repo`

**Execution plan:** `docs/superpowers/plans/2026-06-06-ground-truth-stabilization.md`
Phase 0 (remove @google/genai) → Phase A (vault corrections) → Phase B (security)
→ Phase C (bug fixes)

**SEO Migration:** BLOCKED — Cloudflare 301 misconfigured (returns www.oax, not
kathabooth.com). AG diagnostic task pending in inbox.

---

## §12. Deprecated (do not reference)

- `scripts/memory_boot_check.sh` — DELETED 2026-06-04
- `.memory.mirror/` — REMOVED 2026-06-04
- `.memory` symlink — REMOVED 2026-06-04
- `HCL.md`, `HCL_DASHBOARD.html`, `STATE.md` — archived in `_deprecated_pre_HAM/`
- `katha_design_agent.py` — PENDING DELETION (Phase 0 of execution plan)
- `@google/genai` npm package — PENDING REMOVAL (Phase 0)
- `GEMINI_API_KEY` — NOT required. AI feature removed.
- "11-token palette" phrasing — WRONG. Use "10 brand tokens + 2 ecru-safe".
- "81 presets (31 Sig / 50 Classic)" — WRONG. Use "62 template presets".
- "git submodule" for photobooth-template-studio — WRONG. Standalone nested repo.
