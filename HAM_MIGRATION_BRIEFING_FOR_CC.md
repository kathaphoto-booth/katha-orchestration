# CC BRIEFING: HAM Migration & Full State Dump

**Date:** 2026-06-04  
**From:** AG (Antigravity)  
**To:** CC (Claude Code) — Lead Architect  
**Status:** PROPOSED — Awaiting CC orchestration  
**Directive:** Read this entire document before taking any action. This is the zero-leak handoff.

---

## SECTION 1: WHAT HAPPENED & WHY

Jed asked AG to evaluate four persistent memory systems to determine if any should replace the current `katha-memory` skill. The evaluation was explicitly requested to be **unbiased** — no Katha favoritism. AG read, compared, and rejected three candidates. One won.

### The Four Candidates

| Skill | What It Does | Verdict | Why |
|---|---|---|---|
| `hierarchical-agent-memory` (HAM) | Directory-scoped CLAUDE.md files + `.memory/` vault + token-saving dashboard | **WINNER** | Eliminates token bloat and drift without external databases |
| `mesh-memory` | Semantic vector search via Postgres + pgvector MCP server | **Rejected** | Requires Docker + Postgres. Overkill for deterministic state tracking. |
| `planning-with-files` | Manus-style markdown task files (`task_plan.md`, `findings.md`, `progress.md`) | **Rejected** | Short-term task tracker. Does not solve long-term architectural memory. |
| `agent-memory-systems` | Educational reference (CoALA framework, LangChain patterns) | **Rejected** | Reference material, not a drop-in tool. |

### Why HAM Won (The Technical Case)

The current `katha-memory` protocol forces agents to update **10 entries across 3 physical locations** on every handoff. This causes:

1. **Token bloat**: Every agent session loads the full $10K Brief, all palette tokens, the entire roadmap, the design system, AND the Jed user profile — regardless of whether the task is a CSS fix or a Postgres query.
2. **Drift risk**: If even one file is missed during a handoff, the next agent boots with conflicting state. Example: `STATE.md` currently says "Phase 2 Complete" while `SESSION_HANDOFF.json` says "Phase 3 Active".
3. **Fragile sync**: Relies on `scripts/katha_handoff.py` / `scripts/hcl_sync.py` which can fail silently.

HAM solves all three:
- **Context Routing**: Root CLAUDE.md becomes a ~200-token router. Agents only load the subdirectory context they need.
- **Single Source of Truth**: `.memory/decisions.md` replaces the redundant copies of roadmap state.
- **No external databases**: Pure Markdown on disk.

### Jed's Confirmed Decisions

| Decision | Jed's Words |
|---|---|
| Open to Postgres for agent memory | "i dont mind" |
| New system can replace `katha_handoff.py` | "if new system supersedes why not" |
| `.memory/` must live on Samsung 970 Pro | Confirmed |
| Evaluation must be unbiased | "this is unbiased winner decision. no katha bias." |
| Do NOT auto-run `go ham` | AG recommended against it; Jed agreed to route through CC first |

---

## SECTION 2: THE FULL VAULT INVENTORY (29 FILES)

CC, here is every file currently on the Samsung 970 Pro Vault at `/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/`. Nothing is omitted.

### Core State Files (The katha-memory 9-File Manifest)

**File 1: `SESSION_HANDOFF.json`** (4,902 bytes) — The machine-readable checkpoint.
```json
{
  "checkpoint": "Phase 3 Active — Ghost Injection Deployment",
  "timestamp": "2026-06-04",
  "updated_by": "AG (Antigravity)",
  "architectural_state": {
    "true_taheng_grepo": "CSS Strict 16px Barong L-Frame (var(--champagne)) on top + left edges with complex inset box-shadows. Scroll-settle transition: flattens during scroll, deeply embossed when settled.",
    "canvas": "WebGL Ambient Texture Shader (Background Gradient Glow) from 21st.dev — Piña Ecru to Champagne glow. Injected via Vanilla JS Canvas behind Squarespace native layout.",
    "calado_grid": "Tone-on-tone 1px Piña Ecru border with 12x12px SVG Calado Star corner tacks.",
    "typography": "Fraunces (Display) · EB Garamond (Narrative) · Inter (UI Utility)",
    "wordmark": "Pure Obsidian #111112. Negative Space Calado knockout.",
    "cta": "Commission KTHA — Embroidered Tag CTA. Delicate border rgba(138,62,49,0.3). Typewriter key hover."
  },
  "palette_mandate": {
    "rule": "11 canonical tokens only. No pure #fff, no pure #000, no #F9F6F0 Alabaster, no legacy OAX tokens.",
    "core": { "obsidian_weave": "#111112", "pina_ecru": "#EAE2D5", "loko_rust": "#8C382A" },
    "support": { "champagne_heirloom": "#C4B59D", "iron_bark": "#241E1A", "hammered_sequin": "#9C958A", "knalum_ink": "#1A1816", "terracotta_earth": "#A35C44", "abel_slate": "#5A5D5A", "capiz_sage": "#B5B8A3" }
  },
  "squarespace_strategy": {
    "rule": "DIAMOND HEIST (Ghost Injection)",
    "site": "mayflower-turtle-9br3.squarespace.com",
    "details": "We build around the pre-set architecture. Clone SS layout locally into KATHA_BRAND_PROPOSAL.html. Hotlink media from images.squarespace-cdn.com. Inject WebGL shader into the local clone. Once verified, port the CSS/JS script to SS Code Injection -> Header. Do not delete native blocks."
  },
  "roadmap": {
    "phase_1": { "status": "COMPLETED", "title": "Crème de la Crème Architecture & Media Strategy" },
    "phase_2": { "status": "COMPLETED", "title": "The Diamond Heist (Squarespace Forgery)" },
    "phase_3": { "status": "ACTIVE", "title": "Ghost Injection Deployment" },
    "phase_4": { "status": "PLANNED", "title": "Next.js / Supabase CRM Integration" }
  },
  "strict_boundaries": [
    "Markdown manifestos must remain in project root — moving them breaks CC orchestration chain",
    "BRAND_GENESIS_PLAN.md is OUTDATED — preserved for history only, do NOT boot from it",
    "Do not touch Front End Gallery without permission",
    "Do not touch Admin Panel without permission",
    "Do not touch Subdomain architecture without permission"
  ],
  "agent_directives": {
    "cc_boot_order": [
      "/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/HCL.md",
      "/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/HCL_DASHBOARD.html",
      ".claude/memory/STATE.md",
      "KATHA_BRAND_PROPOSAL.html",
      "CC_ITERATION/LIGHT_ITERATION/KATHA_STYLE_PROPOSAL.html"
    ],
    "ag_vault": "/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/ — This is the single source of truth. AG reads and writes here only."
  }
}
```

**File 2: `HCL.md`** (3,853 bytes) — The living Handoff & Control Ledger.
- Contains: 10-token palette swatch, active checkpoint ("Phase 3 Active"), active skills list (`katha-protocol`, `using-superpowers`), project topography map, Mermaid orchestration diagrams (Jed→CC→AG and SS→API→Supabase→HoneyBook→Resend), and the full 4-phase roadmap checklist.
- Synced via: `python3 scripts/hcl_sync.py`

**File 3: `HCL_DASHBOARD.html`** (17,859 bytes) — Visual HTML Kanban dashboard.
- Generated from `SESSION_HANDOFF.json` by the sync script.

**File 4: `MEMORY.md`** (1,984 bytes) — Knowledge node index.
- Last Updated: 2026-06-04
- Links to 14 knowledge nodes: project files, reference docs, feedback constraints, user profiles.

**File 5: `project_katha_booth.md`** (4,369 bytes) — Full project context.
- Contains: What Katha Is (two DSLR booths), Brand Identity (LOCKED), 11-token palette, True Taheng Grepo CSS architecture, Marks (wordmark, CTA, KTHA maker's mark), Typography, Voice Rules, Architecture (dual-track SS + Next.js), Squarespace Strategy (Diamond Heist), Media Manifest (FOLIO.mp4, Untitled design.mp4, imgg-demo placeholders), Roadmap Table, Key Files Map, Team roster.
- **CRITICAL DRIFT DETECTED**: Roadmap table says Phase 2 is "ACTIVE" but `SESSION_HANDOFF.json` says Phase 2 is "COMPLETED". This is exactly the kind of drift HAM would prevent.

**File 6: `BRAND_CANON.json`** (745 bytes) — Palette + forbidden words + typography + architecture description.
```json
{
  "type": "BRAND_CANON",
  "palette": "Strict 10-token wabi-sabi. Core: #111112, #EAE2D5, #8C382A. Support: #C4B59D, #241E1A, #9C958A, #1A1816, #A35C44, #5A5D5A, #B5B8A3. Pure #fff and #000 forbidden.",
  "forbidden_words": ["keepsake", "handloomed", "heirloom artistry", "raw silk", "fabric of the keepsake", "golden moments", "capture memories", "magic", "magical"],
  "typography": {
    "display": "Fraunces (extreme structural dominance)",
    "narrative": "EB Garamond (grounding, classic authority)",
    "utility": "Inter (neutral, invisible scaffold, wide tracked)"
  },
  "architecture": "Crème de la Crème. Deep CSS embossment, radial lighting (fabric over skin), physical grain, raised silk thread shadowing. No flat vectors."
}
```

**File 7: `TECH_DEBT.json`** (211 bytes)
```json
{ "type": "TECH_DEBT", "items": ["admin panel pagination", "admin URL UUID transition", "status PATCH defense-in-depth", "Squarespace local prototype rendering errors", "Live CSS/JS code injection alignment"] }
```

### Local Workspace State Files

**File 8: `SESSION_HANDOFF.json` (local mirror)** — Byte-identical copy of Vault version at `/Users/jedg./Desktop/kat_ha_pb/SESSION_HANDOFF.json`.

**File 9: `CLAUDE.md`** (13,461 bytes, 189 lines) — CC's system prompt.
- Contains: Agent identity, Poetic Synchronization directive, Boot order (5 files), Brand Constants (full 11-token palette with UI + Narrative categories), WCAG AA contrast rules, Voice & Copy guidelines, Skill Delegation Protocol (CC + AG triad), Slash Commands map (8 commands), Deployment Topology (dual-track), Forbidden list, Startup command, Latest AG Session Handoff section, Memory Export Directive.
- **CRITICAL**: Line 33 says "Phase 2 (Brand Book V2) and Phase 3". The Latest Handoff section (line 148+) correctly says Phase 2 COMPLETE, Phase 3 NEXT.

**File 10: `.claude/memory/STATE.md`** (1,853 bytes, 26 lines)
- Status: "Phase 2 Complete (The Taheng Grepo Heist)"
- Contains: Architectural alignment summary, Diamond Heist execution summary, File organization note, Roadmap (Phase 1 COMPLETED, Phase 2 COMPLETED, Phase 3 NEXT).

### Additional Vault Files (NOT in katha-memory manifest but critical)

| File | Bytes | Content |
|---|---|---|
| `AGENTS.md` | 2,388 | Agent personas (CC, Misty, Brock, Start Up Brand Agent, Front End Design Expert). Collaboration rules. Next.js agent rules. |
| `DESIGN_SYSTEM.v2.md` | 7,287 | Full design system: 11+2 color tokens, typography rules, 22 shell primitives, layout/motion rules, 21 forbidden entries, migration checklist. **Draft — awaiting Jed approval.** |
| `user_jed_founder.md` | 3,678 | Jed's working style, key preferences, relationships, organizational system, current state. |
| `squarespace_assets.json` | 2,768 | 10 media assets with SS CDN URLs (2 videos, 8 images). |
| `BRAND_GENESIS_PLAN.md` | 10,905 | **OUTDATED** — preserved for history only. |
| `katha_taheng_override.css` | 3,100 | The master CSS override for Squarespace injection. |
| `feedback_no_fukinsei_in_templates.md` | 1,291 | Constraint: asymmetric-imperfection scoped to brand chrome only. |
| `feedback_no_oax_audit_monster.md` | 836 | Constraint: `oax-audit-monster` is banned. Use `chrome-devtools` only. |
| `feedback_oax_skill_is_legacy.md` | 2,836 | Constraint: Never run OAX on `kat_ha_pb`. |
| `project_google_account_ban.md` | 1,712 | `kathabooth@gmail.com` banned 2026-06-01. |
| `project_katha_infra.md` | 2,594 | GitHub, Supabase, Vercel, Domain details. |
| `project_template_studio.md` | 4,419 | Next.js photobooth template gallery: 81 templates (31 Signature + 50 Classic). |
| `reference_high_ticket_selling_pitch.md` | 3,618 | $10K selling pitch rules. |
| `reference_honeybook_questionnaire.md` | 2,910 | 12-question DESIGN & EVENT form. |
| `reference_katha_enforcement_agents.md` | 2,908 | loom-auditor + brass-ring-enforcer subagents. |
| `reference_lumabooth_editor.md` | 2,499 | Luma Booth event creation. |
| `reference_mock_client.md` | 1,066 | Ana (mock client). |
| 4 HTML files | ~1MB total | `KATHA_TAHENG_PREVIEW.html`, `KATHA_FOUNDERS.html`, `KATHA_GALLERY.html`, `KATHA_INSTALLATIONS.html` — the multi-page local prototype. |

### Boot Sequence Files (Local Workspace)

| File | Bytes | Purpose |
|---|---|---|
| `GEMINI.md` | 1,573 | AG's project charter. Boot sequence: read `SESSION_HANDOFF.json` → `project_katha_booth.md` → `MEMORY.md`. |
| `AGENTS.md` | 2,485 | Local copy of agent personas + Next.js agent rules. |

---

## SECTION 3: THE PROPOSED HAM DATA MIGRATION MAP

This is the exact mapping. Every piece of data has a destination.

| Current File | Current Location | New HAM Location | Migration Action |
|---|---|---|---|
| `SESSION_HANDOFF.json` | Vault + Local (2 copies) | `.memory/state.json` (1 copy on Samsung, symlinked locally) | Consolidate to single source |
| `project_katha_booth.md` | Vault | `.memory/decisions.md` | Move architecture, roadmap, team roster |
| `BRAND_CANON.json` | Vault | `.memory/patterns.md` | Move palette, forbidden words, typography |
| `DESIGN_SYSTEM.v2.md` | Vault | `.memory/patterns.md` + route to `src/components/CLAUDE.md` | Design tokens route to UI context only |
| `TECH_DEBT.json` | Vault | `.memory/inbox.md` | Deferred issues as pending tasks |
| `MEMORY.md` | Vault | **Deprecated** | Replaced by `.memory/` directory structure |
| `HCL.md` | Vault | **Deprecated** | State now native in `.memory/` |
| `HCL_DASHBOARD.html` | Vault | **Deprecated** | Replaced by `ham dashboard` at localhost:7777 |
| `CLAUDE.md` | Local workspace | **Gutted to HAM router** (< 60 lines) | Keep agent personas + slash commands; move palette/roadmap/design system to subdirectory contexts |
| `.claude/memory/STATE.md` | Local `.claude/` | **Deprecated** | Redundant with `.memory/state.json` |
| `user_jed_founder.md` | Vault | `.memory/decisions.md` (appended) | Jed's working style is a project-level decision |
| `squarespace_assets.json` | Vault | `.memory/patterns.md` (appended) | Media manifest is a reusable pattern |
| `katha_taheng_override.css` | Vault | **Stays in Vault** — not memory, it's a deployable asset | No change |
| 4 HTML prototypes | Vault | **Stay in Vault** — not memory, they're build artifacts | No change |
| 6 feedback/reference files | Vault | `.memory/decisions.md` (constraints section) | Merge into a single constraints block |
| `BRAND_GENESIS_PLAN.md` | Vault | **Archive** — move to `.memory/archive/` | Historical only |
| `GEMINI.md` | Local workspace | **Updated** — boot sequence changes to read `.memory/` | Update paths |
| `AGENTS.md` | Local workspace | **Stays** — agent personas are not memory, they're config | No change |

### Physical Storage Plan

```bash
# 1. Create .memory/ on Samsung 970 Pro
mkdir -p "/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory"
mkdir -p "/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/archive"

# 2. Symlink from local workspace
ln -s "/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory" "/Users/jedg./Desktop/kat_ha_pb/.memory"
```

---

## SECTION 4: WHAT CC MUST DECIDE

1. **The CLAUDE.md gut**: The current 189-line CLAUDE.md needs to become a ~60-line HAM router. CC must decide what stays in root vs what moves to subdirectory contexts. AG recommends keeping: agent identity, slash commands, forbidden list, and the routing table. Moving out: full palette listing, design system details, deployment topology, memory export directive.

2. **Boot sequence update**: Both `CLAUDE.md` (CC boot order) and `GEMINI.md` (AG boot sequence) currently point at specific Vault files. After HAM, these should point at `.memory/` subdirectories instead. CC must rewrite these.

3. **The `project_katha_booth.md` drift**: This file currently says Phase 2 is "ACTIVE" while `SESSION_HANDOFF.json` says Phase 2 is "COMPLETED". CC must resolve this conflict during migration.

4. **Inbox ownership**: Should `.memory/inbox.md` be writable by both AG and CC, or should AG append and CC approve?

---

## SECTION 5: SKILLS INSTALLED BY AG (This Session)

All installed to `/Users/jedg./Desktop/kat_ha_pb/.agents/skills/`.

| Skill | Purpose | Phase Relevance |
|---|---|---|
| `hierarchical-agent-memory` | HAM system (the winner) | Immediate — replaces katha-memory |
| `mesh-memory` | Semantic vector memory | Rejected for this use case; available for future |
| `agent-memory-systems` | Memory architecture reference | Educational only |
| `planning-with-files` | Manus-style working memory | Rejected as standalone |
| `high-end-visual-design` | Premium UI design patterns | Phase 3+ |
| `mobile-design` | Mobile-first design patterns | Phase 3+ |
| `ui-page` | Mobile-first page scaffolding | Phase 3+ |
| `frontend-mobile-development-component-scaffold` | React component architecture | Phase 4 |
| `postgres-best-practices` | Supabase/Postgres optimization | Phase 4 |

---

## SECTION 6: WHAT AG WILL NOT TOUCH WITHOUT CC APPROVAL

- The `GEMINI.md` boot sequence
- The `AGENTS.md` persona definitions  
- Any Next.js source code or Supabase configuration
- The `katha-protocol`, `katha-verify`, `katha-workflow`, or `katha-impeccable` skills
- Any Squarespace live injection
- The `KATHA_BRAND_PROPOSAL.html` blueprint
- The 4 HTML prototype files in the Vault

---

## SECTION 7: ALL CONFIRMED DECISIONS (June 2-4)

### Yesterday (June 2-3)
1. WebGL DPR capped at 1.5 in `katha_ambient_shader.js` ✅
2. `content-visibility: auto` injected into `KATHA_TAHENG_PREVIEW.html` ✅
3. `visibilitychange` listener added to pause GPU when tab hidden ✅
4. Uninstalled `@runcomfy/cli` (cost concern) ✅
5. Uninstalled `nano-banana-2` ✅
6. Phase 3 and Phase 4 are NOT started — strict roadmap adherence ✅
7. No new branches — work stays in existing environment ✅

### Today (June 4)
8. Installed 13-skill strike team from `antigravity-awesome-skills` ✅
9. Installed `hierarchical-agent-memory` (HAM) ✅
10. Installed `mesh-memory`, `agent-memory-systems`, `planning-with-files` ✅
11. Installed `postgres-best-practices` ✅
12. HAM declared winner (unbiased evaluation) ✅
13. `.memory/` must live physically on Samsung 970 Pro via symlink ✅
14. New memory system can fully replace `katha-memory` and `katha_handoff.py` ✅
15. Postgres/Supabase for agent memory is acceptable ✅
16. CC must review and orchestrate before any execution ✅

---

**END OF BRIEFING. CC: Read fully, then decide.**
