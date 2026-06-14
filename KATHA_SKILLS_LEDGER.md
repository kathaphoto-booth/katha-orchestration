# Katha Skills Lean-Out Ledger
> Lean-out audit — 2026-06-04. Proposal map (CC) → Jed ratifies → CC executes
> (archive-reversible, like katha-memory). Buckets: **KEEP** · **FLEX-WORTH** ·
> **FLEX-NOT-WORTH** · **REMOVE**. Each carries a purpose + conviction. Deep
> `/skill-tester` (trigger/eval) + `/writing-skills` (tighten) runs on KEEPERS.
> Verdicts marked *(prov.)* await a deep read before final.

> **ARCHIVAL NOTE (2026-06-14):** This ledger is a 2026-06-04 snapshot — several
> verdicts below are superseded. `katha-protocol` was purged 2026-06-13;
> `impeccable-looped-kit` (Start/Iterate/Polish/Maintain over the `impeccable`
> skill) is now the master brand-governance workflow, and `katha-impeccable`
> below maps to the `impeccable` skill. `DESIGN_SYSTEM.v2.md` is superseded by
> root `DESIGN.md` + vault `patterns.md` (patterns.md wins conflicts). Treat
> this file as history — see root `CLAUDE.md` SLASH COMMANDS for live routing.

## The bar (every skill must clear it)
1. **Does it serve THIS stack?** Next.js 15 + React 19 + Supabase + Vercel +
   Squarespace storefront. Not native mobile, not someone else's design system.
2. **Does it serve THIS brand?** Wabi-sabi / Loom Silence / 10-token palette /
   Fraunces+EB Garamond+Inter. A skill that fights the canon is worse than no skill.
3. **Is it non-redundant?** If katha-* or a built-in already covers it, cut it.

---

## Batch 1 — Katha spine · DISSOLVED 5 → 2 (2026-06-04)
Jed's call: the process/wrapper skills were redundant. Dissolved; proven remains
folded into the two proven constitution skills. Built-ins cover generic process.
| Skill | Verdict | Outcome |
|---|---|---|
| `katha-protocol` | **KEEP** | The constitution. **Absorbed:** §8 Delegation Protocol (from katha-antigravity), §9 Operating Discipline (from katha-workflow). |
| `katha-impeccable` | **KEEP** | UI/UX audit via `npm run guard`. **Absorbed:** evidence-before-claims + brand-asset/CSS checklists (from katha-verify). |
| `katha-verify` | **DISSOLVED** | → katha-impeccable Evidence section + built-in `verify`. Archived. |
| `katha-workflow` | **DISSOLVED** | → katha-protocol §9 + `superpowers:brainstorming`/`writing-plans`. Archived. |
| `katha-antigravity` | **DISSOLVED** | → katha-protocol §8. Forbidden-vocab "handloomed/raw silk" defect dropped, not migrated. Archived. |
| `using-superpowers` | **KEEP** | System meta — skill routing. |

## Batch 2 — Front-end (AG-absorbed, the ones you named) · mostly REMOVE
| Skill | Verdict | Conviction |
|---|---|---|
| `high-end-visual-design` | **REMOVE** | **Actively fights Katha.** It BANS Inter (our UI default), MANDATES `rounded-[2rem]`/`rounded-full` (we forbid border-radius), and pushes glassmorphism + OLED `#050505` + radial mesh gradients (Loom Silence forbids gradients/gloss). It's generic Awwwards-luxury — the opposite of *our* specific luxury. `katha-impeccable` + DESIGN_SYSTEM.v2 already do "high-end" the Katha way. |
| `mobile-design` | **REMOVE** | **Wrong platform.** It's React Native / Flutter / SwiftUI / Compose (FlatList, AsyncStorage, SecureStore, Expo). Katha is responsive Next.js *web* — none of that applies. The useful 10% (44px touch targets, thumb zones) is generic responsive hygiene already in `katha-impeccable`/a11y. Revisit only if Katha ships a native app. |
| `frontend-design` | **FLEX-NOT-WORTH** *(prov.)* | 42L generic "distinctive frontend." Redundant with katha-impeccable + the design system. |
| `ui-page` | **REMOVE** *(prov.)* | Scaffolds pages in "StyleSeed Toss" — a *different* external design system. Off-brand scaffolder. |
| `frontend-mobile-development-component-scaffold` | **FLEX-NOT-WORTH** *(prov.)* | 411L generic React/mobile component scaffolder. Katha components follow the shell primitives, not a generic scaffold. |

## Batch 3 — Memory (HAM already decided this)
| Skill | Verdict | Conviction |
|---|---|---|
| `hierarchical-agent-memory` | **FLEX-WORTH** | The reference for the HAM system we just shipped. Keep as the `/handoff` reference. |
| `mesh-memory` | **REMOVE** | AG's own eval rejected it — pgvector/Postgres overkill for deterministic state. HAM won. |
| `agent-memory-systems` | **REMOVE** | 1088L educational CoALA reference, not a tool. Archive to docs if wanted; not a live skill. |
| `planning-with-files` | **REMOVE** | Manus working-memory; superseded by HAM `inbox.md` + TodoWrite. |

## Batch 4 — Back-end / stack (this is what Katha RUNS on) · mostly KEEP
| Skill | Verdict | Conviction |
|---|---|---|
| `nextjs-app-router-patterns` | **KEEP** | The app IS Next 15 App Router. Directly on-target (small, sharp). |
| `nextjs-supabase-auth` | **KEEP** *(prov.)* | Admin/studio auth + the multi-tenant SaaS future. Today it's Basic-auth; this is the upgrade path. |
| `supabase-automation` | **FLEX-WORTH** | leads/selections table ops, project admin. Relevant; confirm not redundant with the Supabase MCP. |
| `postgres-best-practices` | **FLEX-WORTH** | 63L Supabase/Postgres perf — useful for schema/RLS work. |
| `production-audit` | **KEEP** | RLS, webhooks, launch-readiness — *exactly* the inbox gaps before end-game. High value now. |
| `vibecode-production-qa-validator` | **FLEX-NOT-WORTH** *(prov.)* | End-to-end QA/launch check — overlaps `production-audit` + `katha-verify`. Keep ONE; likely cut this. |

## Batch 5 — SEO / social (storefront SEO is Squarespace/Vince; book.* is auth-gated)
| Skill | Verdict | Conviction |
|---|---|---|
| `nextjs-seo-indexing` | **FLEX-NOT-WORTH** | book.kathabooth.com is auth-gated (no SEO surface). Storefront SEO lives on Squarespace. Low value unless public Next pages appear. |
| `schema-markup-generator` | **FLEX-NOT-WORTH** | JSON-LD — storefront is Squarespace. Marginal for the app. |
| `social-metadata-hardening` | **FLEX-NOT-WORTH** *(prov.)* | OG cards — only matters if book.* pages get shared publicly. |

## Batch 6 — Ops / tooling
| Skill | Verdict | Conviction |
|---|---|---|
| `skill-creator` | **KEEP** | The meta-tool for this very lean-out (create/refine/measure skills). |
| `desktop-commander-overview` | **FLEX-WORTH** | Router to the Desktop Commander MCP — useful ops capability. Small. |
| `adobe-create-social-variations` | **FLEX-WORTH** | Adobe CC social crops for @kathabooth marketing assets. Keep if marketing is active. |
| `agent-browser` | **REMOVE** *(prov.)* | 55L generic browser-automation CLI. Katha mandates the `chrome-devtools` MCP — redundant/conflicting. |

---

## Tally (first pass, 28 local skills)
- **KEEP:** 9 — katha-protocol, katha-impeccable, katha-verify, katha-antigravity, katha-workflow, using-superpowers, nextjs-app-router-patterns, nextjs-supabase-auth, production-audit, skill-creator *(that's 10 — skill-creator included)*
- **FLEX-WORTH:** 5 — hierarchical-agent-memory, supabase-automation, postgres-best-practices, desktop-commander-overview, adobe-create-social-variations
- **FLEX-NOT-WORTH:** 5 — frontend-design, frontend-mobile-…-scaffold, vibecode-production-qa-validator, nextjs-seo-indexing, schema-markup-generator, social-metadata-hardening
- **REMOVE:** 7 — high-end-visual-design, mobile-design, ui-page, mesh-memory, agent-memory-systems, planning-with-files, agent-browser

## Execution status (2026-06-04)
- ✅ REMOVE set archived (7): high-end-visual-design, mobile-design, ui-page,
  mesh-memory, agent-memory-systems, planning-with-files, agent-browser.
- ✅ Katha spine DISSOLVED 5 → 2 (verify/workflow/antigravity → protocol+impeccable).
- ✅ FLEX-NOT-WORTH cuts (5): frontend-design, frontend-mobile-…-scaffold,
  nextjs-seo-indexing, schema-markup-generator, social-metadata-hardening.
  **vibecode-production-qa-validator UPGRADED to KEEP** (launch-readiness, on-stack).
- **Local skills: 28 → 13.** The 13: katha-protocol, katha-impeccable,
  using-superpowers, nextjs-app-router-patterns, nextjs-supabase-auth,
  supabase-automation, postgres-best-practices, production-audit,
  vibecode-production-qa-validator, skill-creator, desktop-commander-overview,
  adobe-create-social-variations, hierarchical-agent-memory.

---

## Plugin-skill sweep (external — classify; remove = disable the plugin, not file-mv)
Bar: serves the Katha stack (Next 15 / React 19 / Supabase / Vercel / Squarespace
storefront / DSLR photo-booth product / high-touch bookings). Founder-led, not enterprise-PM.

| Plugin family | Verdict | Conviction |
|---|---|---|
| **superpowers:*** | **KEEP** | The process backbone we now lean on after dissolving katha-workflow/verify (brainstorming, writing/executing-plans, verification, debugging, TDD). Essential. |
| **vercel:*** (core) | **KEEP subset** | nextjs, react-best-practices, routing-middleware, deployments-cicd, env-vars, vercel-cli, vercel-functions, vercel-storage, shadcn — the app's actual runtime/deploy. |
| **vercel:*** (AI) | **REMOVE** | ai-gateway, ai-sdk, chat-sdk, vercel-agent, sandbox, workflow, next-forge, turbopack, next-cache-components — Katha isn't building an AI chat app. |
| **adobe-for-creativity:*** | **KEEP** | On-business: it's a *photo* booth. retouch-portraits, batch-edit-photos, resize, create-social-variations serve real event-photo + marketing work. |
| **anthropic-skills:*** (office) | **KEEP** | docx / pdf / pptx / xlsx — client proposals, contracts, invoices (HoneyBook flow). consolidate-memory marginal-keep (HAM-adjacent). |
| **anthropic-skills:katha-*** | **REMOVE** | Duplicates of the local katha-memory/verify/workflow/antigravity we already killed/dissolved. Stale. |
| **searchfit-seo:*** | **REMOVE** | SEO surface is the Squarespace storefront (Vince owns it); the Next app is auth-gated. Same reasoning as the local SEO cuts. |
| **brand-voice:*** | **REMOVE** | Katha's voice is LOCKED canon (patterns.md §3 / katha-protocol §4). Generating/enforcing generic brand voice is redundant. |
| **design:*** | **REMOVE** | accessibility-review / design-critique / design-system / ux-copy all overlap katha-impeccable + katha-protocol, which own Katha's bespoke design law. |
| **stitch:*** (build/design/utilities) | **REMOVE** | Generic UI/design-system generation. Katha UI is bespoke shell primitives + Loom Silence — stitch output risks off-brand drift. |
| **product-management:*** | **REMOVE** | Enterprise PM workflows (sprints, stakeholder updates, metrics-review). Katha is founder-led (Jed + Vince); superpowers:writing-plans covers specs. |
| **vpai:vibe-prospecting** | **REMOVE** | Cold lead prospecting. Katha is high-touch referral/inquiry bookings, not outbound prospecting. |
| **si:*** | **REMOVE** | Self-improving-agent memory — overlaps HAM. Redundant. |
| **cowork-plugin-management:*** | **HOLD** | Only relevant if using Cowork; keep dormant. |
| **skill-creator** | **KEEP** | Meta-tool for this lean-out + future skill refinement. |
| **desktop-commander:*** | **KEEP** | Ops MCP (shells/files/processes). Already keeping the local overview. |

**Removal mechanism:** disable the REMOVE-verdict plugins via the plugin manager
(`/plugin`) or settings — do NOT delete plugin-cache files. Net effect: from a
sprawling plugin surface down to ~5 families that serve the stack + business.

## Coverage check (front-end → back-end)
- Front-end ✅ katha-impeccable + DESIGN_SYSTEM.v2 · Back-end ✅ nextjs/supabase/postgres/production-audit
- Launch ✅ vibecode-qa · Photo product ✅ adobe · Deploy ✅ vercel core · Process ✅ superpowers
- **Gaps to consider (new skills only with clear purpose):** email/Resend deliverability,
  payments/Stripe (if bookings take deposits). Flag via `/skill-creator` when needed.
3. Deep pass on KEEPERS: `/skill-tester` (do they trigger right?) + `/writing-skills` (tighten description/triggers so they fire only when intended).
4. **Separate sweep:** the external *plugin* skills (vercel:*, searchfit-seo:*, brand-voice:*, stitch:*, design:*, product-management:*, etc.) — a much larger list, same bar.
5. **Coverage gap check:** front-end ✅ (katha-impeccable + design system), back-end ✅ (nextjs/supabase/production-audit). Possible gaps: **email/Resend**, **payments/Stripe** (if booking takes deposits), **testing**. Flag for new skills via `/skill-creator` only with a clear purpose.
