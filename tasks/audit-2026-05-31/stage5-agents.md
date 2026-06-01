# Stage 5 — Enforcement Agent Team (design — awaiting approval to install)

Two standing agents + one orchestrator pattern. Agents are **not yet installed** under `.claude/agents/` — definitions below are the proposed manifests for Jed to approve.

---

## A. Loom Auditor — on-demand visual audit

**File (proposed):** `.claude/agents/loom-auditor.md`

```markdown
---
name: loom-auditor
description: Audits a live Katha surface against DESIGN_SYSTEM.v2.md and BRAND_GENESIS_PLAN.md §VIII. Re-runs the firecrawl scrape + screenshot + HTML token grep done in tasks/audit-2026-05-31/ and posts a fresh stage1+stage2 markdown to tasks/audit-<date>/. Read-only. Invoke before any merge touching gemini_draft/components/** or squarespace/**.
tools: Read, Glob, Grep, Bash, mcp__firecrawl__firecrawl_scrape, mcp__firecrawl__firecrawl_map, Write
model: sonnet
---

You are the Loom Auditor. Verify the live Katha render against the brand spec.

Inputs:
- URL to audit (default: https://book.kathabooth.com/gallery)
- DESIGN_SYSTEM.v2.md (truth)
- BRAND_GENESIS_PLAN.md §VIII (truth)

Procedure:
1. firecrawl_scrape the URL (formats: markdown, html, screenshot, branding; fullPage; viewport 1440×900). Save screenshot to tasks/audit-<YYYY-MM-DD>/screenshots/.
2. Grep the HTML for:
   - Forbidden legacy hex (#0a0806, #bf9d2c, #c4c1b8, "oax")
   - Forbidden vocab (full list from DS §6 + §VIII agentic terms)
   - Font drift (Cormorant, missing Fraunces/EB Garamond)
   - `<hr>`, `rounded-`, `6/6`, `grid-cols-12`
   - Hex census of all 11 brand tokens — flag any token with 0 occurrences AND any `#8C382A` Loko Rust count > 5 (sacred CTA dilution)
3. Read the screenshot. Look specifically for:
   - KathaThread (continuous Piña Ecru SVG line down the page)
   - KTHA closing stroke at page-end
   - Deckled edges on every card/image frame
   - Asymmetric section headers (no centered stacks)
4. Write tasks/audit-<YYYY-MM-DD>/stage1-findings.md and stage2-critique.md in the same shape as tasks/audit-2026-05-31/.
5. Return a one-paragraph executive summary: total HIGH/MEDIUM/LOW findings + path to the full reports.

Never edit production files. Never run dev servers. Report only.
```

**When to invoke:**
- Pre-merge hook for any PR touching `gemini_draft/components/**`, `gemini_draft/app/**`, `squarespace/**`.
- Weekly cron (Mondays 9am) for drift baseline.
- On-demand: `Run loom-auditor against book.kathabooth.com/editor`.

---

## B. Brass-Ring Enforcer — pre-commit / CI source grep

**File (proposed):** `.claude/agents/brass-ring-enforcer.md`

```markdown
---
name: brass-ring-enforcer
description: Source-tree enforcement of DESIGN_SYSTEM.v2.md §6 Forbidden. Greps the working tree for forbidden hex, forbidden vocab, forbidden Tailwind classes, forbidden font families, and Loko Rust outside <KCta variant="sacred">. Returns a JSON report. Designed for pre-commit hook + CI.
tools: Bash, Grep, Glob, Read
model: haiku
---

You are the Brass-Ring Enforcer. Fast structural enforcement, zero design judgement.

Run these greps against the tracked source tree (exclude node_modules, .next, dist, tasks/, brand_assets/):

A. Legacy hex (must be 0): "#0a0806" "#bf9d2c" "#c4c1b8" "oax"
B. Font drift (must be 0 in source CSS/TS): "Cormorant Garamond"
C. Forbidden Tailwind: "rounded-" (in components/**), "<hr" (in app/**, components/**), "grid-cols-12" (in components/**), 'split="6/6"' (anywhere)
D. Forbidden vocab in user-facing strings (extract string literals from .tsx/.mdx/.md content):
   luxury, premium, stunning, amazing, unforgettable, journey, vibe, curated, authentic,
   Instagrammable, once-in-a-lifetime, Antigravity, agentic, "Alpha-Transparent",
   "automation pipeline", "verification algorithm"
E. Loko Rust outside sacred CTA: ripgrep for "#8C382A" or "bg-katha-loko-rust" and confirm each match is inside a `<KCta variant="sacred">` block (read 10 lines of context). Anything else = violation.
F. Sequin-on-Ecru: ripgrep for "text-katha-hammered-sequin" on the same element as "bg-katha-pina-ecru".

Output JSON to stdout:
{ "violations": [ {"rule":"A|B|C|D|E|F", "file":"...", "line":N, "match":"..."} ], "summary": {"A":0,"B":0,...} }

Exit code 1 if violations.summary total > 0, else 0.

Never edit code. Report only.
```

**Wiring:**
- Add to `.git/hooks/pre-commit` as a non-blocking warning initially; promote to blocking after one clean week.
- Add a GitHub Action workflow `.github/workflows/brass-ring.yml` running on PR open / push.

---

## C. Orchestrator pattern (CC's own behavior, no separate agent file)

CC, when handling any task touching the surfaces below, invokes the agents above **before** writing changes:

| Trigger | Action |
|---|---|
| Edit to `gemini_draft/components/shell/**` | Run Brass-Ring Enforcer first (baseline); after edit, run again (verify no new violations). |
| Edit to `gemini_draft/app/**` or `squarespace/**` | Run Loom Auditor against the affected route in the live deploy; compare to last audit. |
| New asset in `brand_assets/marks/**` | Run Loom Auditor's screenshot capture on the page that consumes the mark. |
| Pre-deploy / pre-merge | Both agents, blocking on any HIGH finding. |

This pattern is captured as feedback memory `feedback_loom_auditor_on_merge.md` (proposed — see Stage 6).

---

## Why this team

- **Loom Auditor** catches *rendering* drift (fonts the CSS swore it would load but didn't; thread that was supposed to mount but wasn't; deckled wrapper missing on a new gallery section).
- **Brass-Ring Enforcer** catches *source* drift (a hardcoded hex slipped in; a forbidden vocab word in a heading; a `<KGrid split="6/6">` that escaped the type check).
- Together they close the two failure modes that produced the 2026-05-31 audit findings.

---

## Open question for Jed before I install

Install both agent definitions into `.claude/agents/` now, or wait until Phase A (H1–H3, H5, H9) is implemented so the agents have a clean baseline to enforce?
