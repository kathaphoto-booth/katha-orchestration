# Migration Unblock — Triage Plan of Action

**Date:** 2026-06-05
**Status:** Active triage — replaces stale inbox claims
**Severity:** P0 — SEO equity bleeds daily until kathabooth.com publishes

## Ground Truth (verified 2026-06-05 07:20 GMT)

```
kathabooth.com           → HTTP 404 "Squarespace - Domain Not Claimed"
oaxphotobooth.com        → HTTP 301 → www.oaxphotobooth.com  (NOT kathabooth.com)
www.oaxphotobooth.com    → (untested — same old domain)
book.kathabooth.com      → ✅ Live (Next.js portal, verified earlier)
```

**Inbox was wrong.** AG reported "3x Cloudflare 301 rules active to kathabooth.com" but the redirect actually goes back to the same domain. Either rules weren't created correctly, propagation isn't complete, or a higher-priority rule overrides. The SEO Migration "Phase 2 complete" claim in `SESSION_HANDOFF.json` is FALSE.

## The Real Critical Path

```
[VINCE BLOCKER]              [CC + AG WORK]              [JED MANUAL]
                              
1. Attach kathabooth.com  →  3. Verify 200 + content  →  6. GSC Change of Address
   to Squarespace site        4. Inject Ghost assets      7. GBP website URL update
2. Publish (not "Coming        5. Verify 301 works         8. Priority-1 citations
   Soon" mode)                                             9. Post-migration monitoring
```

Steps 3-9 are blocked by 1-2. Every day 1-2 stays open is SEO equity drain.

## Triage Tiers

### Tier 1 — CRITICAL UNBLOCKERS (do today, in parallel)

**A. Vince handoff document.** One-page, screenshot-illustrated, walks Vince through:
   - Squarespace Settings → Domains → connect `kathabooth.com`
   - Toggle site from "Coming Soon" → "Live"
   - Verify by visiting `https://kathabooth.com` in incognito (expect 200 with homepage, not 404)
   - Path: `.memory/handoff/2026-06-05_vince-domain-publish_walkthrough.md`

**B. Cloudflare 301 diagnosis.** Delegate to AG (it has the Porkbun + Cloudflare credentials):
   - Inspect actual active Page Rules in Cloudflare dashboard
   - Compare to claimed inbox state (3 rules: `*oaxphotobooth.com/*`, `oaxphotobooth.com/*`, `www.oaxphotobooth.com/*` → `kathabooth.com/$1`)
   - Either confirm propagation is still in progress (NS switch was 2026-06-04 ~03:00, can take 24-48h) OR fix the rules
   - Write findings to `.memory/handoff/2026-06-05_cloudflare-301-audit_verify.md`

**C. HAM inbox correction.** Update `inbox.md` to reflect actual state:
   - Move SEO Migration Phase 2 from "Done by AG" to "PARTIAL — claimed done but 301 returns wrong target"
   - Add Vince blocker as the gating item
   - Update `SESSION_HANDOFF.json` checkpoint to "SEO Migration PHASE 2 NEEDS RE-VERIFICATION"

### Tier 2 — PREP IN PARALLEL (do today, ready to fire when Tier 1 clears)

**D. Stage Ghost Injection assets.** Phase 3 has 3 deliverables. Prepare them now so the moment Vince publishes, CC can drop them in:
   - Port `katha_taheng_override.css` to a Squarespace-safe Custom CSS block (test against SS class names, raster fallback for deckled masks per CLAUDE.md)
   - Prepare L-Frame overlay HTML + WebGL ambient shader JS as a single Code Injection Header block
   - Document the exact paste targets (Squarespace dashboard locations)
   - Path: `docs/squarespace-injection/2026-06-05-phase3-assets/`

**E. Identify Squarespace preview URL.** Even before kathabooth.com is attached, Vince's site has a `*.squarespace.com` preview URL. If we can get that URL, CC can:
   - Audit current site state
   - Test Ghost Injection assets against it
   - Validate render before Vince does the domain switch

### Tier 3 — UNBLOCKED EXECUTION (fires once Tier 1A clears)

**F. Inject Ghost assets** (CC) → validate via chrome-devtools
**G. Re-curl 301** to confirm cf rules fixed (CC)
**H. GSC Change of Address** (Jed — dashboard task, 2 minutes)
**I. GBP website URL** (Jed — dashboard task, 5 minutes)
**J. Priority-1 citations** (Jed — Yelp, FB, Bing, Apple Maps, IG, TikTok — staged over week)
**K. Post-migration monitoring setup** (CC — analytics dashboard, weekly check cadence)

## Anti-Scope (what we do NOT do)

- Don't redo Vince's Squarespace work — he owns the storefront
- Don't blindly delete Cloudflare rules without diagnostic first
- Don't pivot to building new features while migration bleeds
- Don't submit GSC Change of Address until kathabooth.com is verifiably live + indexable
- Don't change business name on GBP simultaneously with website URL (Phase 4 caution)

## Communication Plan

**For Jed:** This message + the Vince handoff doc.
**For Vince:** The walkthrough handoff (Tier 1A) — one document, no jargon, click-by-click.
**For AG:** Cloudflare diagnostic task via inbox.md.
**For CC:** This plan + ongoing inbox.

## Success Criteria

- [ ] `curl -sI https://kathabooth.com` returns `HTTP 200` with real homepage HTML
- [ ] `curl -sI http://oaxphotobooth.com` returns `HTTP 301 Location: https://kathabooth.com/`
- [ ] GSC Change of Address validated and submitted
- [ ] Inbox no longer contains the false "Phase 2 complete" claim
- [ ] Ghost Injection assets live on Squarespace site

## What Happens If We Don't Triage

Every day kathabooth.com returns 404:
- Google sees the destination as broken — refuses to transfer ranking
- Customers who hear about Katha and search find a dead page
- Customers who try the brand-aligned URL from any marketing → 404
- The work AG did (NS switch, rules) sits idle, providing zero value

The longer this gap, the more we're paying for a migration that hasn't started.

## Recommended Execution Order

1. **Right now:** I write the Vince handoff (Tier 1A) and AG's Cloudflare diagnostic prompt (Tier 1B)
2. **Today:** Jed sends Vince the handoff; AG runs the Cloudflare audit; CC stages Ghost Injection assets (Tier 2D)
3. **When Vince confirms publish:** CC injects (Tier 3F), verifies, then Jed runs GSC/GBP dashboard tasks
4. **Within 7 days:** Citations sweep (Tier 3J)
5. **Ongoing:** Monitoring (Tier 3K)
