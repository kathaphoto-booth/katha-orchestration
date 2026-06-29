---
type: "spec"
node_id: "2026-06-22-antigravity-debloat-design"
owner: "CC"
status: "approved-pending-write"
last_updated: "2026-06-22"
---

# Antigravity 2.0 Debloat — Design

## Problem

Jed's Antigravity 2.0 (Gemini/AG) session is "slowing down really bad." He pasted a
customization token-budget breakdown showing the budget exceeded: Rules 8,184 / Skills
7,981 / MCP Tools 6,262 (~22,427 total). Goal: cut real bloat without losing anything he
actually uses. Scope, established via clarifying questions: **safe cuts only** (zero
functional risk, no consolidating overlapping-but-used skills), and Claude Code may edit
both repo files and local Antigravity config on disk (showing diffs), but should not
hand-edit anything that only has a supported toggle inside the Antigravity app itself.

Mid-investigation, two things expanded the scope (both confirmed against real files, not
inferred): the pasted breakdown only measures *static* rules/skills/MCP config — it does
not capture the *live vault read* GEMINI.md's own boot sequence requires every session,
which turned out to be larger than the static budget; and a chunk of GEMINI.md's bulk is
brand-law content that has drifted from CLAUDE.md's current canon, which is an accuracy
bug, not just size. Jed approved folding both into this pass.

## What's real vs. what's not (ground-truth, not the first-pass guesses)

Several initial hypotheses (mine and an explore-subagent's) turned out wrong on direct
verification — recorded here so the corrections aren't lost:

- `oax-audit-monster` is banned 4x over in GEMINI.md/AGENTS.md, but is **not** in
  Antigravity's live `~/.gemini/config/mcp_config.json`. It's costing AG nothing today;
  the only trace is an orphaned tool-schema cache dir (`~/.gemini/antigravity-cli/mcp/oax-audit-monster/`,
  untouched since May 21). It's still connected in Claude Code's own session, separately —
  out of scope here.
- `gsap`, `magic-21st`, `firecrawl`, `supabase` are already `"disabled": true` in the real
  mcp_config.json. Not contributing to the budget. Nothing to fix.
- The single biggest line item, `chrome_devtools` (5,964 tokens, ~95% of the MCP Tools
  category), is **not** in mcp_config.json, not in any repo file, not in
  `~/.gemini/antigravity-cli/mcp/`. It's almost certainly Antigravity's native built-in
  browser-tools feature, distinct from the `chrome-devtools-mcp` server actually configured
  (153 tokens, 29 tools — the one GEMINI.md documents as the sanctioned browser tool). No
  file controls this; it needs an in-app Settings toggle.
- The plugin system (`~/.gemini/config/plugins/<name>/plugin.json`) has no enable/disable
  field — presence in that folder appears to just mean "installed." Disabling a plugin
  safely means using Antigravity's own Settings/Extensions panel, not hand-editing files.
- Archiving handoff files by date (everything before the most-recent work) would have been
  wrong: `inbox.md` tracks ~30 explicitly-unresolved items back to 2026-06-08, including
  one marked P0 URGENT (`2026-06-12_blocker-sweep_task.md`) and one marked PRIMARY SESSION
  PROMPT (`2026-06-12_cc-fable5-ultra-init_task.md`), neither closed as of this writing.
  Only files `inbox.md` itself marks resolved (`[x]`, no open caveat) are touched below.

## Part A — Direct edits (this session, repo + local vault, reversible)

1. **Commit the 7 already-deleted `.agents/skills/` dirs** sitting uncommitted in the
   working tree: `council-config`, `council-orchestrator`, `desktop-commander-overview`,
   `mcp-builder`, `modern-web-guidance`, `skill-creator`, `using-superpowers`.
2. **Remove the orphaned MCP cache dir**: `~/.gemini/antigravity-cli/mcp/oax-audit-monster/`.
   Disk hygiene only — confirmed nothing references it.
3. **Archive 16 handoff files** confirmed resolved by `inbox.md`'s own `[x]` markers, by
   renaming with a leading underscore (the convention GEMINI.md's boot rule already skips,
   so nothing is deleted and nothing new has to be invented):
   - Phase-3-era cluster, already folded into `vault-hygiene-pass2_verify.md` per inbox.md:
     `2026-06-06_credential-rotation_task.md`, `2026-06-06_credential-rotation_verify.md`,
     `2026-06-06_ag-phases-C-F_task.md`, `2026-06-06_ag-holistic-report_verify.md`,
     `2026-06-07_thors-hammer-phase3-ag-supervision_task.md`,
     `2026-06-07_thors-hammer-phase3-complete_verify.md`,
     `2026-06-07_thors-hammer-phase3-verification_task.md`, `PHASE3_START.md`
   - `2026-06-14_ham-stress-test-review_verify.md`
   - `2026-06-14_squarespace-clone_wrasse.md`
   - `2026-06-15_lumabooth-boho-extra_walkthrough.md`
   - `2026-06-15_lumabooth-boho_walkthrough.md`
   - `2026-06-15_lumabooth-variants_walkthrough.md`
   - `2026-06-15_remove-double-bezels_walkthrough.md`
   - `2026-06-19_clone-tier1a-promote_walkthrough.md`
   - `2026-06-21_codex-setup_verify.md`

   Explicitly NOT archived: the 10 `thors-hammer-sync-*.md` files (plausibly superseded,
   but `inbox.md` never addresses them, so left for Jed's own call) and everything
   `inbox.md` marks `[ ]`/`[/]` or qualifies with "awaiting-jed-review" — that's live
   backlog, not cleanup scope.
4. **Sync stale brand-law references** so AG stops reading outdated "current truth"
   (accuracy fix, not a size fix):
   - GEMINI.md §3: wordmark description "Fraunces-flow" → "Playfair-flow"; Typography line
     "Fraunces (display) · EB Garamond (body)" → current near-match stack (Playfair
     Display / Hanken Grotesk, noted as the interim swap-in for IvyMode/Proxima Nova
     pending the Adobe Fonts kit); Master CTA "Commission" → reflect CTA retirement and
     point at the current unified set (Request a Proposal / Reserve Your Date / Begin Your
     Inquiry / Send Inquiry / Sign Me Up).
   - AGENTS.md Deprecated section: "'81 presets (31 Sig / 50 Classic)' — WRONG. '62 template
     presets'" → correct to current canon, 82 committed presets (33 Signature + 49 Classic),
     matching GEMINI.md's own already-updated Deprecated section.

No inbox.md edits (Jed's choice — surfaced the P0/backlog finding in conversation only,
not written into the vault).

## Part B — Checklist for Jed, Antigravity Settings → Plugins/Extensions

Nothing here is file-editable; each needs the in-app toggle.

1. Find the native "chrome devtools" / "browser tools" feature and disable or scope it
   down — ~5,964 tokens, by far the biggest line item in the whole budget. Verify
   `chrome-devtools-mcp` (already configured, 153 tokens) covers actual day-to-day use
   before assuming this is free savings.
2. Disable `android-cli-plugin` (81 tokens) — no Android surface anywhere in this stack.
3. Disable `google-antigravity-sdk` plugin (112 tokens) — needs `GEMINI_API_KEY`, which
   AGENTS.md/GEMINI.md both record as removed-as-unused on 2026-06-06.
4. Disable `modern-web-guidance-plugin` (~671 tokens for its 2 skills,
   `modern-web-guidance` + `chrome-extensions`) — both redundant with what's already in the
   CC skill tree; no Katha-specific use found.
5. Optional glance: check whether `antigravity-bundle-aas-agent-mcp-builder`'s 10 skills
   (agent-evaluation, ai-agents-architect, context-window-management, langfuse, langgraph,
   llm-app-patterns, mcp-builder, mcp-tool-developer, prompt-engineering, rag-engineer) show
   up in the live skills list at all — none appeared in the breakdown Jed pasted, so they
   may already be dormant; none are Katha-relevant if active.

Potential yield if all five are actioned: ~6,800 of the ~22,400-token customization
budget, ~95% of it gated on item 1 alone.

## Part C — Found, explicitly not touched this pass

- **Taste/design skill overlap** (gpt-taste, design-taste-frontend, design-taste-frontend-v1,
  stitch-design-taste, industrial-brutalist-ui, high-end-visual-design, minimalist-ui,
  redesign-existing-projects — ~898 tokens): genuine overlap, but Jed chose "safe cuts
  only," not the consolidation tier. Revisit if he wants to go further later.
- **`COMPILED_HAM.md`**: 723KB / 9,581 lines, which CLAUDE.md's own boot order has Claude
  Code read at every session start. This is a Claude-Code-side concern, not Antigravity,
  and is almost certainly larger than the entire Antigravity customization budget discussed
  here. Worth its own dedicated conversation; not addressed in this pass.
- **inbox.md backlog**: ~30 unresolved items dating to 2026-06-08, including one P0 and one
  marked PRIMARY SESSION PROMPT, neither closed. Surfaced to Jed directly; no vault edit
  made, per his choice.
- **thors-hammer-sync-* series** (10 files in handoff/): plausibly safe to archive, but
  `inbox.md` never confirms it, so left alone per Jed's choice.

## Verification

After Part A lands and Jed works the Part B checklist, ask him to paste a fresh
Antigravity token-budget breakdown for comparison against the ~22,427-token baseline this
spec started from.
