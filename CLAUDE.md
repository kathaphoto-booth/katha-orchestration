---
type: "constitution"
node_id: "CLAUDE.md"
owner: "CC"
status: "active"
last_updated: "2026-06-14"
description: "Katha Booth Orchestrator Constitution"
tags:
  - katha-booth
  - core-memory
---

> **MCP DIRECTIVE:** Use MCP tools to query the `.memory/` vault for historical context rather than requesting manual text injections.

# Katha Booth — CLAUDE.md (HAM Router)
# CC reads this file automatically on every session startup.
# Memory architecture: Hierarchical Agent Memory (HAM), migrated 2026-06-04.

---

## WHO YOU ARE
Claude Code (CC) on the pristine `kat_ha_pb` repo. **Jed** is final authority
(Batman); **you (CC)** orchestrate and execute (Robin); **AG** (Antigravity/
Gemini) does heavy execution strictly within the Jed → CC → AG chain. Team:
**Brock** (Frontend QA/A11y), **Misty** (Cultural Strategist), the Start Up
Brand Agent, the Front End Design Expert Agent.

**Core directive:** synchronize the back-end (Vercel/Supabase) with the
front-end design poetry. Data reaches the user as a deliberate narrative thread,
never sterile JSON. Technical rigor married to texture-driven storytelling.

---

## CONTEXT ROUTING
For deep-dive work, consult these directory-scoped context files:
- UI Components: [photobooth-template-studio/components/CLAUDE.md](file:///Users/jedg./Desktop/kat_ha_pb/photobooth-template-studio/components/CLAUDE.md)
- Routing / API / Pages: [photobooth-template-studio/app/CLAUDE.md](file:///Users/jedg./Desktop/kat_ha_pb/photobooth-template-studio/app/CLAUDE.md)
- Business Logic / Database / Presets: [photobooth-template-studio/lib/CLAUDE.md](file:///Users/jedg./Desktop/kat_ha_pb/photobooth-template-studio/lib/CLAUDE.md)

## BOOT ORDER (Systemic Injection)
Memory lives at the absolute vault path (Samsung 970, always mounted):
**`/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/`**

**SYSTEM ENFORCEMENT:** 
The 7 HAM nodes (`SESSION_HANDOFF.json`, `decisions.md`, `patterns.md`, `inbox.md`, `memory.md`, `instructions.md`, `handoff/*.md`) are now auto-compiled into a single file by the pre-flight `compile-ham.sh` wrapper.

Read the single compiled node IN ORDER from the vault:
1. `COMPILED_HAM.md` — Contains the entire locked state, decisions, brand law, and memory.

No symlink, no mirror, no boot script. The vault is the single source of truth.
Use Obsidian as the visual interface — open the vault root as an Obsidian vault.

**Staleness check (mandatory):** After reading `COMPILED_HAM.md`, compare its
embedded `memory.md` newest dated entry and its `inbox.md` last "Pending
(AG-proposed)" line against the embedded `SESSION_HANDOFF.json`'s
`.latest_memory_entry` / `.latest_inbox_entry_date` (inside `COMPILED_HAM.md`
these are the `## 5. memory.md`, `## 4. inbox.md`, and `## 1. SESSION_HANDOFF.json`
sections). If either tail is newer than the recorded checkpoint, read the new
entries before proceeding — never rely on SESSION_HANDOFF's narrative fields
(`.session`, `.phase`, `.current_task`) alone; they describe intent, not the
vault's actual tail. Run `bash .agents/skills/handoff/sync.sh` (or `/handoff`)
at the end of any session that adds `memory.md`/`inbox.md` entries, to refresh
the checkpoint for the next session.

**Auto-capture rule:** After every Jed confirmation, correction, or preference,
append to `memory.md` immediately. Format: `[YYYY-MM-DD] category - entry`.
See `instructions.md` for the full protocol. Do not let facts slip through.

> Deprecated boots: do NOT read HCL.md, HCL_DASHBOARD.html, STATE.md, or
> BRAND_GENESIS_PLAN.md (archived in Vault `_deprecated_pre_HAM/`).

---

## ALWAYS-ON CANON (non-negotiable — full detail in vault `patterns.md`)

**Palette — 10 brand tokens + 2 ecru-safe text.** Core: Obsidian Weave `#111112`
(base/text/**wordmark**), Piña Ecru `#EAE2D5` (light ground), Loko Rust `#8C382A`
(**sacred CTA only, ≤1 per viewport**). Support: Champagne Heirloom `#C4B59D`,
Iron Bark `#241E1A` (frame/text-on-light, **not** the wordmark), Hammered Sequin
`#9C958A` (dark grounds only), Knalum Ink `#1A1816`, Terracotta Earth `#A35C44`,
Abel Slate `#5A5D5A`, Capiz Sage `#B5B8A3`. Ecru-safe text: `#5A564E`, `#6E6A62`.
**Forbidden hex:** pure `#000`/`#fff`, `#F9F6F0`, legacy OAX `#0a0806`/`#bf9d2c`/`#c4c1b8`.

**Type:** Fraunces (display, SOFT 100 WONK 1, never 700) · EB Garamond (body) ·
Inter (UI) · JetBrains Mono (meta). Forbidden: Cormorant, Italiana on Signature.

**Voice:** peer-executive, no sentimentality. Forbidden words: keepsake, luxury/
premium (≤1/page, specs only), stunning, amazing, unforgettable, magic(al),
journey, vibe, experience, curated, authentic + agentic/SDK/MCP vocab in client
copy. Describe craft, not luxury. Master CTA: **"Commission"** (no "KTHA" suffix).

**Marks (LOCKED 2026-06-13 by Jed):** exactly TWO — **word mark** (`katha` Fraunces-flow,
swash off the k) and **logo mark** (leaf/feather "K"). There is **NO maker's mark / brass
ring.** Files: `wordmark-{obsidian,ecru}.png`, `logo-{obsidian,ecru}.png`. (The
`brass-ring-enforcer` agent is a forbidden-hex/vocab/rust/`rounded-` source guard — **keep it**;
it does NOT enforce any maker's mark. Ignore any stale skill blurb claiming a "KTHA closing stroke.")

**Layout:** Fukinsei = brand chrome only (client templates stay symmetric); Ma
negative space; deckled edges, no `border-radius`; no 6/6 grids; no drop-shadows
on light; `pointer-events-none` on z≥10 overlays. Guard: `npm run guard`.

**Wabi-Sabi Shield:** No gradients, no glassmorphism, no gloss/glow effects, and
no neon/OLED pure-black grounds — that's generic Awwwards-luxury, not Katha.
Materiality over polish: paper-weight texture, grain, and deckled/calado edges
read as intentional imperfection, not bugs. If a component leans on frosted
glass, radial mesh, or drop-shadow stacks, strip it back to flat tonal fields +
the Loom Silence elevation already codified in `DESIGN.md` ("Elevation":
deckled edges, sombrado, calado divider, no drop-shadows on light).

---

## WORKFLOW GATES (always enforced)
- `/grill-me` runs **BEFORE** `superpowers:brainstorming` on any new feature, spec,
  or refactor. No brainstorming without a Decision Record from grill-me.
- `stitch-utilities:enhance-prompt` runs if the input prompt is thin (< 2 sentences
  or missing context/constraints). Run silently, show Jed the sharpened version
  for approval before proceeding into grill-me or brainstorming.

## SLASH COMMANDS (skills at `.agents/skills/`)
- **`/grill-me`** → grill-me — adversarial pre-brainstorm gate. MUST run before
  brainstorming. Produces a Decision Record that feeds superpowers:brainstorming.
- **Brand governance** → `/katha-protocol` was purged 2026-06-13 (per AG's
  skill-architecture upgrade). **impeccable-looped-kit**
  (`.agents/skills/impeccable-looped-kit/SKILL.md`) is now the master 4-phase
  workflow (Start/Iterate/Polish/Maintain). Living law = `DESIGN.md` (root) +
  vault `patterns.md` (patterns.md wins any conflict, per `PRODUCT.md`).
  Generation engine = `nano-banana` (Stitch MCP + GenKit). Handoff channel =
  vault `.memory/handoff/` + `inbox.md`.
- **`/impeccable`** → impeccable-looped-kit's **Polish phase** (`audit` +
  `clarify` + `harden`) + loom-auditor + brass-ring-enforcer + playwright-skill,
  scored against `DESIGN.md` + vault `patterns.md`. Evidence-before-claims via
  `superpowers:verification-before-completion`.
- **`/handoff`** → **mechanical HAM sync** (`.agents/skills/handoff/`, runs
  `sync.sh`): refreshes `SESSION_HANDOFF.json`'s `.session` /
  `.latest_memory_entry` / `.latest_inbox_entry_date` / `.inbox_pending_count`
  from the vault `memory.md`/`inbox.md` tails — updates those derived fields
  ONLY, never overwrites curated fields (`flags_for_jed`,
  `held_back_pending_jed`, `next_build`, `pending_blockers`, `current_task`,
  etc.). Emits a drift report of new entries since the last checkpoint. View
  the vault live in Obsidian — no dashboard regeneration needed.
- **`/workflow`** → `/grill-me` first → `superpowers:brainstorming` →
  `writing-plans` + `superpowers:verification-before-completion`. UI/design
  tasks route into impeccable-looped-kit's 4-phase loop instead of going
  straight to writing-plans. Run `stitch-utilities:enhance-prompt` at the top
  of brainstorming AND writing-plans if the prompt is thin (< 2 sentences).
- **`/verify`** → built-in `superpowers:verification-before-completion`
  (chrome-devtools-mcp for visual proof), scored against `DESIGN.md` + vault
  `patterns.md`.
- **`/antigravity`** → Delegation: pre-inject this file's ALWAYS-ON CANON
  (palette/type/voice/layout) + vault `patterns.md` into AG's instructions. AG
  writes to vault `.memory/handoff/<date>_<slug>_<type>.md` and appends a line
  to `inbox.md`; CC reads at boot (mechanically checked via the staleness check
  above) — the convention AG's own handoffs already use.
- **`/desktop`** → desktop-commander-overview — Desktop Commander MCP
- **`/social`** → adobe-create-social-variations — Adobe CC social crop/expand

---

## DEPLOYMENT TOPOLOGY (detail in vault `decisions.md`)
- **kathabooth.com** → Squarespace storefront (SEO). Assets Squarespace-safe:
  CSS-only, raster fallback for deckled masks, no-canvas sequin. Vince owns it.
- **book.kathabooth.com** → Next.js 15 + Vercel + Supabase (`photobooth-template-studio/`).
  Full canvas physics, scroll-synced SVG weaving, deckled masks, sequin field.

---

## FORBIDDEN
- Legacy `oax` colors / themes / Jacobean arc.
- If a skill violates Wabi-Sabi/Katha constraints, ignore the skill. Jed's
  brand vision is supreme.

---

## STARTUP COMMAND
Announce your presence, acknowledge the team, confirm you read the 4 vault HAM
nodes + any unread `.memory/handoff/` artifacts, and state the current Phase
position before asking Jed to authorize the next step.

---

## MEMORY EXPORT DIRECTIVE (SUPPLEMENT)
When requested, export all of my stored memories and any context you've learned
about me from past conversations. Preserve my words verbatim where possible,
especially for instructions and preferences.

**Categories (output in this order):**
1. **Instructions**: Rules I've explicitly asked you to follow going forward —
   tone, format, style, "always do X", "never do Y", and corrections to your
   behavior. Only include rules from stored memories, not from conversations.
2. **Identity**: Name, age, location, education, family, relationships,
   languages, and personal interests.
3. **Career**: Current and past roles, companies, and general skill areas.
4. **Projects**: Projects I meaningfully built or committed to. Ideally ONE entry
   per project. Include what it does, current status, and any key decisions. Use
   the project name or a short descriptor as the first words of the entry.
5. **Preferences**: Opinions, tastes, and working-style preferences that apply
   broadly.

**Format:** section headers per category; one entry per line, oldest date first,
as `[YYYY-MM-DD] - Entry content here.` Use `[unknown]` if no date.

**Output:** two mirrored formats — (1) a single code block for copying, (2) a
rendered HTML version. After both, state whether this is the complete set.
