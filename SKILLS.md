# SKILLS — Unified Registry (single source of truth)

> **All agents (CC, agy, Codex) read THIS file to discover and invoke skills.**
> One lean line per skill: `name · use-when · path`. Skill bodies live at the
> path; do NOT duplicate them into CLAUDE.md / AGENTS.md / GEMINI.md. To use a
> skill, open its folder's `SKILL.md`. Canonical location for all skills is
> `.agents/skills/<name>/`. (`.claude/skills/` duplicates are being retired.)

## Design / Brand
| Skill | Use when | Path |
|---|---|---|
| `impeccable` | Design/redesign/critique/audit/polish a surface against DESIGN.md | `.agents/skills/impeccable/` |
| `impeccable-looped-kit` | Full 4-phase Start→Iterate→Polish→Maintain design loop | `.agents/skills/impeccable-looped-kit/` |
| `taste-skill` | Anti-slop landing pages, portfolios, redesigns | `.agents/skills/taste-skill/` |
| `redesign-skill` | Upgrade an existing site/app to premium quality | `.agents/skills/redesign-skill/` |
| `nano-banana` | Bridge Stitch + GenKit to generate Katha templates/UI | `.agents/skills/nano-banana/` |
| `stitch-skill` | Generate agent-friendly DESIGN.md from Google Stitch | `.agents/skills/stitch-skill/` |
| `brandkit` | Brand-guideline boards / logo systems | `.agents/skills/brandkit/` |
| `soft-skill` · `minimalist-skill` · `brutalist-skill` · `gpt-tasteskill` | Stylistic design lenses (overlapping — pick one) | `.agents/skills/<name>/` |

## Build / Code
| Skill | Use when | Path |
|---|---|---|
| `nextjs-app-router-patterns` | Next.js 14+ App Router / Server Components | `.agents/skills/nextjs-app-router-patterns/` |
| `nextjs-supabase-auth` | Supabase Auth + Next.js App Router | `.agents/skills/nextjs-supabase-auth/` |
| `supabase-automation` | Supabase DB / storage / edge-function automation | `.agents/skills/supabase-automation/` |
| `postgres-best-practices` | Writing/reviewing Postgres for performance | `.agents/skills/postgres-best-practices/` |
| `image-to-code-skill` | Visual web tasks (image → code), Codex-oriented | `.agents/skills/image-to-code-skill/` |
| `imagegen-frontend-web` · `imagegen-frontend-mobile` | Premium design references before building web/mobile | `.agents/skills/<name>/` |

## Orchestration / Agents
| Skill | Use when | Path |
|---|---|---|
| `antigravity` | Delegate heavy agentic work to `agy` with the git-truth verification gate | `.agents/skills/antigravity/` |
| `antigravity/loop.sh` | Bounded auto-retry (max 3) around the delegation chain; feeds verdict reasons into each retry | `.agents/skills/antigravity/scripts/loop.sh` |
| `antigravity/council.sh` | 2nd-opinion critique (`codex` + `agy` + optional `copilot`, read-only) on a CC-authored diff — never on agy's own just-completed output | `.agents/skills/antigravity/scripts/council.sh` |
| `grill-me` | Adversarial pre-brainstorm interview (run BEFORE brainstorming) | `.agents/skills/grill-me/` |
| `handoff` | Mechanical HAM sync — refreshes SESSION_HANDOFF.json derived fields via sync.sh (wired to /handoff) | `.agents/skills/handoff/` |
| `crafting-agent-prompts` | Author/fix a delegated CLI agent's role/system prompt | `.agents/skills/crafting-agent-prompts/` |

## QA / Audit / Security
| Skill | Use when | Path |
|---|---|---|
| `production-audit` | Production-readiness audit (RLS, webhooks, secrets, grants, Stripe) | `.agents/skills/production-audit/` |
| `vibecode-production-qa-validator` | End-to-end QA + launch-readiness for fullstack Next.js | `.agents/skills/vibecode-production-qa-validator/` |
| `security-bluebook-builder` | Minimal real security policy for sensitive apps | `.agents/skills/security-bluebook-builder/` |
| `playwright-core` · `playwright-cli` | E2E / browser automation + debugging | `.agents/skills/<name>/` |

## Web / Media
| Skill | Use when | Path |
|---|---|---|
| `bootleg-firecrawl` | Fetch + convert a URL's DOM/HTML into clean markdown | `.agents/skills/bootleg-firecrawl/` |
| `adobe-create-social-variations` | Adobe CC social crop/expand variations | `.agents/skills/adobe-create-social-variations/` |

## Retiring (do not use — pending cleanup)
| Skill | Reason | Path |
|---|---|---|
| `taste-skill-v1` | Legacy v1, kept only for back-compat | `.agents/skills/taste-skill-v1/` |

> Removed 2026-06-25 (deleted from tree + skills-lock.json): `hierarchical-agent-memory`
> (legacy push-memory model, contradicted current MCP-pull) and `higgsfield-generate` ·
> `-marketplace-cards` · `-product-photoshoot` · `-soul-id` (unused side-exploration). `handoff`
> was previously mislisted here — it is LIVE (wired to /handoff) and now sits under Orchestration.

---
_Edit this file when adding/removing a skill. It is the ONLY skill index;
constitution files should link here, never re-list skills._
