---
type: "constitution"
node_id: "GEMINI.md"
owner: "AG"
status: "active"
last_updated: "2026-06-14"
description: "Antigravity Execution Engine Charter"
tags:
  - katha-booth
  - core-memory
  - execution-layer
---
# Antigravity (AG) Project Charter
# Last updated: 2026-06-14 (CC, HAM-hardening sync — boot staleness check, /handoff
# mechanical skill, two-marks lock, impeccable-looped-kit routing, 4 service tiers,
# catalog count. Prior full rewrite: 2026-06-06.)

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

- **Living law**: root `DESIGN.md` + vault `patterns.md` — `patterns.md` wins any
  conflict (per `PRODUCT.md`). `DESIGN.md` is currently HELD with known marks-canon
  drift (`SESSION_HANDOFF.json flags_for_jed`); when docs disagree on marks,
  `patterns.md` / `memory.md` are authoritative.
- **Marks (LOCKED 2026-06-13, scope 2026-06-18)**: exactly TWO — word mark (`katha`
  Playfair-flow, swash off the k) + logo mark (leaf/feather "K"). There is **NO
  maker's mark and NO brass ring**. Do not reintroduce a maker's mark / KTHA
  closing stroke. **CTA (Vince-Alignment 2.0, 2026-06-18): "Commission" is
  RETIRED** as master verb — unified set is "Request a Proposal" / "Reserve Your
  Date" / "Begin Your Inquiry" / "Send Inquiry" / "Sign Me Up", same on both surfaces.
- **Palette**: 10 brand tokens + 2 ecru-safe text tokens (see `patterns.md §1`).
  Canonical phrasing: "10 brand tokens + 2 ecru-safe". NOT "11-token".
- **Two-Tier Rule** (design tiers): Katha Signature presets (id `^katha-`) held to
  palette + current display type (Playfair Display now; IvyMode pending Adobe
  Fonts license). Classic wedding presets exempt.
- **Catalog count**: 82 committed presets (33 Signature + 49 Classic) in
  `lib/templates.ts` since slot-law enforcement (2026-06-12); slot-count law
  (2/3/4 only) + symmetry enforced by `npm run guard`. (The old "62 presets" /
  "81 id fields" phrasings are stale.)
- **Service Installation Tiers** (4 — a DISTINCT axis from the design tiers above):
  Signature Installation/Oak $949 · Editorial Installation/Oak $1,149 · Modernist
  Installation/White $749 · Monochrome Installation/White $949. Old tiers (Glam
  Editorial / Architectural / Katha Booth) are SUPERSEDED. Tier copy needs a voice
  scrub before any UI (`handoff/2026-06-13_service-tiers-update_spec.md`).
- **Forbidden**: OAX tokens, pure `#000`/`#fff`, "keepsake", technical/agentic
  vocab client-facing, `oax-impeccable-bridge` skill, `oax-audit-monster` MCP.
- **Output Validation**: Must pass `npm run guard` (P0:0 P1:0).
- **Typography** (Vince-Alignment 2.1/2.2, 2026-06-18): target pair is IvyMode
  (display) + Proxima Nova (body @ 15px); free near-match in use now is Playfair
  Display (display) + Hanken Grotesk (body), hot-swapped to the licensed pair once
  the Adobe Fonts kit lands. Inter (UI) · JetBrains Mono (meta) unchanged. Fraunces
  + EB Garamond are FULLY RETIRED — do not reintroduce. "Outfit" is RETIRED.

---

## §4. Tooling

- Browser: `chrome-devtools` MCP ONLY. Never `oax-audit-monster`.
- AG IDE: Full VS Code-based IDE at `~/.antigravity-ide/antigravity-ide/`. Runner binary
  `agy` at `/Volumes/samsung 970 pro - Data/KATHA_VAULT/bin/agy` (v1.0.6, installed 2026-06-06).
  Config: `~/.gemini/antigravity-cli/`. PATH has 3 entries (local, vault, IDE bin).
- Linting: `npm run guard` in `photobooth-template-studio/`.
- Standing subagents: `loom-auditor` (live render) + `brass-ring-enforcer`
  (source-tree drift). Both at `.claude/agents/`. NB: `brass-ring-enforcer` is a
  forbidden-hex/vocab/rust source guard — it does **not** enforce any
  maker's mark (ignore any stale skill blurb claiming a "KTHA closing stroke").
- **Brand governance / generation**: `impeccable-looped-kit` (master 4-phase
  Start/Iterate/Polish/Maintain) is the brand-governance workflow; `/impeccable`
  = its Polish phase. Generation engine = `nano-banana` (Stitch MCP + GenKit) —
  Stitch is the *generation engine*, NOT the source of truth; all output is
  validated against `DESIGN.md` + `patterns.md` (patterns.md wins) before code
  injection. The `katha-protocol` skill was PURGED 2026-06-13 — do not invoke it.

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

## §6. Context Retrieval (MCP Pull, updated 2026-06-23)

The legacy 7-node manual boot sequence is RETIRED to eliminate token bloat. Do not attempt to read the entire vault at startup.
AG is now connected to `codebase-memory-mcp`. You must query the vault dynamically.

**Canonical vault path:** `/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/`

When beginning a task, use semantic graph search (`search_graph` or `query_graph`) to pull only what you need:
- To understand current state: search `SESSION_HANDOFF.json` and `handoff/gemini_consolidated_session.md`.
- To verify rules: search `patterns.md` and `instructions.md`.
- To record actions: append to `inbox.md` or `memory.md` via `write_file`.

**Auto-Context Consolidation:** If the session context becomes too long or momentum is degrading, use the memory ingestion workflow to compress the active architectural state. Treat the resulting handoff files as the authoritative compressed memory state.

> `scripts/memory_boot_check.sh` is DELETED (2026-06-04). No symlink. No mirror.
> Read the vault directly. If Samsung 970 is unmounted, do NOT proceed — report
> the drive is unavailable and wait for Jed.

**Staleness check (mandatory — added 2026-06-14):** After reading nodes 1, 4, 5,
compare `memory.md`'s newest dated entry and `inbox.md`'s last "Pending
(AG-proposed)" line against `SESSION_HANDOFF.json`'s `.latest_memory_entry` /
`.latest_inbox_entry_date`. If either is newer than the recorded checkpoint, read
the new entries before proceeding. `SESSION_HANDOFF.json` is a **SENSOR** (a
point-in-time reading), not source-of-truth; its narrative fields (`.session`,
`.phase`, `.current_task`) describe intent, not the vault's actual tail. The 7 HAM
nodes are canonical. CC refreshes the checkpoint with the mechanical `/handoff`
skill (`.agents/skills/handoff/sync.sh`); AG cannot run that script (different
filesystem context) — if you find drift, note it in your output or append an
`inbox.md` Pending line so CC runs `/handoff` next session.

**Headless mode (`scripts/agy-tier-run.sh`):** when CC invokes you via the tier
runner, you do NOT have live-vault filesystem access — you receive the compiled
`COMPILED_HAM.md` snapshot injected into your prompt. The runner re-compiles that
snapshot immediately before invoking you, so it is CURRENT at launch. Perform the
staleness check *within* the injected text: compare the `## 1. SESSION_HANDOFF.json`
section's `.latest_memory_entry` / `.latest_inbox_entry_date` against the tails of
the embedded `## 5. memory.md` and `## 4. inbox.md` sections. (You cannot and must
not write canon — see §8; surface any drift in your handoff output for CC.)

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

> `SESSION_HANDOFF.json` is refreshed by CC's mechanical `/handoff` skill —
> derived fields only (`.session` / `.latest_memory_entry` /
> `.latest_inbox_entry_date` / `.inbox_pending_count`); it never overwrites curated
> fields (`flags_for_jed`, `held_back_pending_jed`, `next_build`, etc.). Treat it
> as a sensor, per §6. Thor's Hammer `thors-hammer-sync-*.md` artifacts are
> likewise SENSOR data, not source-of-truth — the 7 HAM nodes win any conflict.

---

## §11. Current Phase + Open Tasks

Phase, current task, and open blockers are **volatile** — do NOT hardcode them
here (that duplication is exactly the drift the §6 staleness check exists to
prevent). Read them live at boot from `SESSION_HANDOFF.json` (`.phase`,
`.current_task`, `.next_build`, `.pending_blockers`, `.flags_for_jed`) plus the
`memory.md` / `inbox.md` tails.

As of the 2026-06-14 sync: **Phase 4 — HoneyBook Native Ecosystem**; next build =
Unified Next.js Intake Funnel (V1 manual handoff), **BUILD HELD by Jed** at the
execution gate. Verify against `SESSION_HANDOFF.json` before acting — this line
is a convenience pointer, not the source of truth.

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
- "81 presets (31 Sig / 50 Classic)", "62 template presets", "62 presets", "81 id fields" — ALL stale. Catalog = 82 committed presets (33 Signature + 49 Classic).
- "git submodule" for photobooth-template-studio — WRONG. Standalone nested repo.
- `katha-protocol` skill — PURGED 2026-06-13. Brand governance → `impeccable-looped-kit` / `/impeccable`.
- `DESIGN_SYSTEM.v2.md` / `BRAND_GENESIS_PLAN.md` — SUPERSEDED. Living law = root `DESIGN.md` + vault `patterns.md`.
- Old service tiers "Glam Editorial / Architectural / Katha Booth" — SUPERSEDED by the 4 Installation tiers (§3).
- Maker's mark / brass ring / "Commission KTHA" — PURGED 2026-06-13. Two marks only.
- "Commission" as master CTA — RETIRED 2026-06-18 (Vince-Alignment 2.0). Current unified set: "Request a Proposal" / "Reserve Your Date" / "Begin Your Inquiry" / "Send Inquiry" / "Sign Me Up" (see §3).
- Fraunces (display) / EB Garamond (body) — FULLY RETIRED 2026-06-18 (Vince-Alignment 2.2). Current: Playfair Display / Hanken Grotesk (near-match) → IvyMode / Proxima Nova (licensed target).
