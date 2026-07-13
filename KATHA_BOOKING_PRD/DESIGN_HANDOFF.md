# KATHA BOOKING — DESIGN HANDOFF (Zero-Questions Edition)
### The design authority for the one-shot build · v1.0 · 2026-07-04

> **Author:** Claude Code (Fable 5), chairing three parallel audits (design.html specimen, PRD v1.2 + content.json, vault brand law).
> **Reader:** the one-shot executor. Read `KATHA_BOOKING_PRD.md` for functional contracts; read THIS file for design authority, conflict resolutions, and pre-answered decisions. **If this file and any older doc disagree, this file wins** (it is dated later and chaired against the vault).
> **Rule zero:** you have no design questions to ask Jed. Every ambiguity found by audit is resolved in §6. If you believe you found a new one, you didn't — re-read §6; if it is genuinely novel, pick the conservative option, note it in the final report, and continue.

---

## 1. AUTHORITY CHAIN (what wins, in order)

1. **This file** — conflict resolutions + missing-state specs (2026-07-04)
2. **`KATHA_BOOKING_PRD/katha-booking-html/design.html`** — THE VISUAL CEILING. Rendered specimen; every token, easing, and component state in it is canonical.
3. **`KATHA_BOOKING_PRD/KATHA_BOOKING_PRD.md` v1.2** — functional contracts (§7 STATE/submission/availability, §8 goToStep, §12 DoD)
4. **`KATHA_BOOKING_PRD/content.json`** — the data SSOT (tiers, add-ons, palettes, copy, keys)
5. **`_reference/1|2|3_*.html`** — implementation reference (GSAP patterns, markup)
6. Vault `.memory/patterns.md` — brand law for anything the above doesn't cover
- **IGNORE**: root `DESIGN.md` (stale light theme), any doc mentioning "ATELIER / Forest + Cream".

## 2. TOKENS (verbatim — no invention)

### 2.1 Color

| Token | Hex | Name | Use |
|---|---|---|---|
| `--color-l0` | `#110F0D` | Kamagong | page ground |
| `--color-l1` | `#1A1714` | Dark Abacá | cards, panels |
| `--color-l2` | `#241F1B` | Kape | inputs, active card |
| `--color-l3` | `#2E2722` | Lifted | hover elevation |
| `--color-hi` | `#E8E1D3` | Piña Ecru | primary ink, **focus rings** |
| `--color-mut` | `#A39B8E` | Rattan | body text inside containers |
| `--color-fnt` | `#857D71` | Capiz Slate | mono meta **on `--l0` only** |
| `--color-loko` | `#9A3D2A` | Achuete (sacred) | CTA fills/borders/active — **never readable text, never focus ring** |
| `--color-loko-hover` | `#a9432f` | Achuete hover | primary button hover |
| `--color-ln` | `rgba(232,225,211,.08)` | hairline | dividers (`.16` strong variant) |
| `--color-ok` | `#10B981` | Emerald | secured/pulse only |
| ticket stock | `#F7F5F1` paper · `#2C2523` ink | Bone | Step-3 voucher, fixed (client palette never applied to voucher) |

Print-stock palette swatches (Step 2): Heirloom Piña `#F5EFE6` (default) · The Void `#110F0D` · Achuete `#9A3D2A` · Moss Patina `#4E5B48` · Satin Champagne `#DCCBB5` — full text/sub/slot/stroke values in `content.json.palettes`.

**Contrast corrections (mandatory, from audit):** `--color-fnt` fails on l1/l2/l3 → use `--color-mut` inside containers. Error text renders in `--color-hi`/`--color-mut` with a `--color-loko` left border — never loko text. Slot captions in light palettes: `aria-hidden` decorative OR palette-aware ≥4.5:1.

### 2.2 Type

| Role | Stack | Source | Spec |
|---|---|---|---|
| Display | `'FH Ronaldson Display','Fraunces',serif` | **self-hosted** `./fonts/fh-ronaldson/` (preload Light+Regular) | hero `clamp(30px,5.4vw,64px)` w300 lh1.05 ls-0.02em |
| Editorial | `'Fraunces',serif` italic | Google `<link>` + swap + preconnect | subs `clamp(15px,1.6vw,19px)` w300 lh1.55 |
| UI/body | `'Outfit',sans-serif` | Google `<link>` | 18px body w300; buttons 10–11px |
| Meta/registry | `'Courier Prime',monospace` | Google `<link>` | 7–12px, `.1–.28em` tracking, uppercase, `//` prefixes |

### 2.3 Texture

- Grain (all steps): `feTurbulence fractalNoise baseFrequency=0.85 numOctaves=3 stitchTiles=stitch`, rect opacity ≈0.03, `aria-hidden`, fixed inset 0.
- Wabi-sabi displacement (wordmark ONLY): `baseFrequency="0.03 0.06" numOctaves=3` → `feDisplacementMap scale=4`.
- Nav: `rgba(17,15,13,.86)` + `backdrop-filter: blur(18px)`.
- Shadows: tilt card `0 30px 60px rgba(0,0,0,.45), 0 0 40px rgba(154,61,42,.06)`; ticket `0 30px 60px rgba(0,0,0,.4)`. No gradients anywhere.

## 3. MOTION LAW (locked 2026-07-01, Jed)

| Motion | Duration | Ease | Value |
|---|---|---|---|
| Card tilt (hover) | 0.4s to move, **≥1.2s return** | `power3.out` | max **±6°**, perspective 1200px |
| Shutter close / open | ~0.9s / ~1.0–1.2s | **`power4.inOut`** close, `power4.out` open | xPercent ±100 ↔ 0; preserve verbatim |
| Wordmark trace | 2.0s stroke + 1.2s fill | `power3.out` / `power2.out` | dasharray 2600→0, stagger 0.18s |
| Ticket accordion | 1.4s / 1.2s / 1.2s | `power4.out` / `power3.out` | rotateX -75/45/-45 → 0 |
| Palette / format morph | 0.8s | `power3.out` / **`power3.inOut`** (format) | color + geometry tween |
| Progress fill | 0.6s | `cubic-bezier(.16,1,.3,1)` | width |

**Forbidden:** `back`, `elastic`, `bounce`, spring. **Every** timeline inside `gsap.matchMedia()` with an explicit reduce-branch that **force-reveals** (folds `opacity:1 rotateX:0`, blades hidden, wordmark filled, `goToStep` bladeless). Test with reduced-motion ON: nothing may stay hidden.

## 4. COMPONENTS — states table (audit-complete; missing states now SPECIFIED)

The specimen defines: buttons (default/hover/active), tier card (default/selected/disabled), add-on (off/on), calendar day (open/today/selected/blocked), input (rest/focus/filled/error), nav pulse. **The audit found these states missing — build them exactly as follows, using only existing tokens:**

| Missing state | Spec |
|---|---|
| **Button `:disabled`** | opacity .42, `filter: grayscale(.4)`, `cursor: not-allowed`, retain size (no layout shift). Same recipe as tier `.disabled`. |
| **Button loading** (submit in-flight) | label swaps to `Securing…` in Courier Prime; 14px spinner = 1.5px `--color-hi` top-border circle rotating 0.9s linear; button `disabled`; `aria-live="polite"` announces "Submitting inquiry". |
| **Checkbox/radio focus** | `outline: 2px solid var(--color-hi); outline-offset: 3px` on the styled label via `:focus-visible` on the hidden input (`input:focus-visible + label`). Same ring everywhere — hi only, never loko. |
| **Error toast** (submit failure) | fixed bottom-center (mobile: above CTA bar), `--l1` bg, 1px `--ln-strong` border, 2px radius, `--color-loko` 2px left border, text `--color-hi` 13px Outfit; enters y+16→0 0.6s `power3.out`; persists until dismissed (✕) or retry; `role="alert"`. Copy: "We couldn't log your inquiry. Check your connection and try again — your details are safe on this page." |
| **Success toast** (email copy) | same shell, `--color-ok` left border, auto-dismiss 4s. |
| **Empty month** (calendar) | centered Courier Prime 9px uppercase `--color-mut`: "No open dates this month — try the next." with next-month ghost button beneath. |
| **Availability fetch failure** | calendar area replaced by same shell as error toast, inline: "Availability temporarily unavailable — email kathabooth@gmail.com". Never a silently empty grid. |
| **No add-ons on ticket** | single Fraunces italic 12.5px `--color-mut` line: "No additions — the installation stands alone." |
| **Long text** | ticket inscription: `clamp` down to 18px then wrap (max 2 lines, `overflow-wrap: anywhere`); tier names never truncate; input values scroll natively. |
| **Mobile nav** | no hamburger — nav is wordmark + logomark + meta only; meta (`// Los Angeles & Orange County`) hides ≤520px. Nothing to collapse; do not invent a menu. |
| **`<a>` links** | Courier Prime, `--color-mut`, underline 1px offset 3px, hover → `--color-hi`. (Rare — footer/legal only.) |

Component dimension specs (padding/borders/radii per component) are canonical in design.html — copy them, don't re-derive. Buttons: primary 54px h / radius 3px / Courier 11px `.14em`; secondary 48px h outline `--ln-strong`; ghost 9px Courier `.16em`.

## 5. BRAND LAW APPLIED TO THIS SURFACE

- **Marks:** exactly two — Fraunces-flow "Katha" wordmark + leaf/feather-K logomark (`role="img"` + labels). No maker's mark, no calado diamond, no geometric k. These marks belong on this surface (book.kathabooth.com successor).
- **Sacred accent:** Achuete `#9A3D2A` is this surface's sacred thread — CTA fills, active borders, intent hairlines only. Scarcity is the aesthetic: if a viewport reads "red everywhere," you've failed the law. (The older Loko-Rust `#8C382A`/"Commission" rule governs *other* Katha surfaces; on this surface PRD v1.2 tokens + CTA verbs are canonical.)
- **Copy voice:** quiet, editorial, direct. Approved CTA verbs live in content.json (`Secure Dates & Begin Design`, `Finalize Custom Design`, etc.). Banned: *keepsake, magical, stunning, Instagrammable*; heritage material vocab (barong/calado/knalum…) lives in product specs only, never headlines. `//` mono prefixes are the system voice.
- **Fukinsei scope:** brand chrome may breathe asymmetrically; client-facing template previews stay symmetric.
- **Photography:** the 8 real portfolio shots (`assets/portfolio/`) are the only imagery. Never stock, never inside customizer preview slots (slots stay empty — client photos print there).

## 6. DECISIONS — PRE-ANSWERED (the "no questions" table)

| # | Would-be question | Answer | Authority |
|---|---|---|---|
| 1 | Customizer catalog: PRD v1.2 says 48 presets from `templates.ts`; memory 2026-07-03 curates to 5+5 | **Curated 10 (5 Signature + 5 Classic) from Jed's 2026-07-03 curation — the definitions live in `pb-v3/lib/data.ts` (TEMPLATES array; ignore its TIERS array — content.json tiers win)**, sourced via the layout registry (`lib/layouts.js` slot math). 48-preset browse is out for the one-shot; the curated set IS the gallery. `bituin` (ex-`knalum-dark`) renders in `pv-2` vertical. | memory 2026-07-03 (newer than PRD v1.2 by 1 day) |
| 2 | Which palette token set — Loko Rust `#8C382A` (vault) or Achuete `#9A3D2A` (PRD)? | **Achuete `#9A3D2A`** on this surface. Vault palette-limits were lifted 2026-06-04; PRD §4.1 is canonical here. | PRD v1.2 §4.1 + patterns.md lift |
| 3 | Default tier | `glam_editorial` ($1,149, Flagship badge) | content.json |
| 4 | Architectural tier unavailable — hide or show? | Show, greyed (`opacity .42 grayscale(.4)`), badge "Currently Unavailable", `aria-disabled`, non-selectable. | PRD §6.1 |
| 5 | Calendar a11y — full grid or fallback? | Build the full `role="grid"` roving-tabindex contract; if any part can't be completed, drop to native `<input type="date">` + soonest-dates list. **No fake grid.** | PRD §9.1 |
| 6 | Min booking notice | 7 days (`content.json.openDecisions.minNoticeDays`) | PRD §13-C |
| 7 | Ticket background with dark client palette | Voucher stays bone `#F7F5F1` always; palette is recorded as a labeled line ("Paper: The Void"), never applied. | PRD §7.6 |
| 8 | Email "copy to inbox" before Resend domain verified | Site self-notifies Katha from `onboarding@resend.dev`; client-facing button labeled truthfully ("We'll email your copy shortly") until `hello@kathabooth.com` verified. Never fake "Dispatched!". | PRD §14.2 |
| 9 | HoneyBook seam with no form URL yet | Build the branded seam wired to `content.json.integrations.HONEYBOOK_LEAD_FORM`; if empty → styled placeholder ("Your reservation desk opens here — proposal follows by email"), not fake success. Jed drops the URL in later; zero code change. | PRD §14.1 |
| 10 | Second admin (brother) | Not needed — `kathabooth@gmail.com` is the shared inbox, already seeded in `admins`. Adding one later = 1 SQL INSERT. | PRD §13-C |
| 11 | Tailwind CDN vs precompiled | Precompile via CLI to `styles.css`; if blocked, keep CDN and flag in final report. Never hand-port half. | PRD §9.3 |
| 12 | Analytics | Vercel Web Analytics hook, one line, optional — include commented. | PRD §13-D |
| 13 | Hash routing | Optional; if included: `#intake/#design/#ticket`, kept in sync with `STATE.step`. If any desync risk, omit — it's optional. | PRD §8 |
| 14 | Where do submit failures leave the user | On Step 1, state intact, error toast (§4), no advance, no fake Secured. Idempotent re-submit via `STATE.leadId` guard. | PRD §7.4 |
| 15 | Fonts not in repo (Fraunces/Outfit/Courier) | Keep Google `<link>` + swap + preconnect. Self-hosting is Jed's post-launch follow-up. | PRD §13-D |
| 16 | Barong texture opacity | Not on this surface (that's the proposal-clone rule, 0.08, scoped there). This surface's atmosphere = grain 0.03 only. | memory 2026-06-19 scope |
| 17 | Reference-photo upload (Step 2) | Optional input → Supabase Storage `refs/`; base64 fallback; listed in `selections.reference_photos`. If Storage fails, omit gracefully — not a launch blocker. | PRD §7.3 |
| 18 | What may NOT be redesigned | Everything in design.html. Your creativity budget is spent on the missing states (§4), built from existing tokens. This is a fidelity build, not a redesign. | this file |

## 7. CLAUDE DESIGN SYNC (specs always current)

- The push-ready component bundle lives at **`KATHA_BOOKING_PRD/katha-booking-html/design-system/`** (dsCard-marked HTML previews rendering tokens, type, buttons, forms, tier card, calendar, add-ons, ticket — each self-contained, first line `<!-- @dsCard group="…" -->`).
- Sync flow (after `/design-login` in an interactive session): `DesignSync list_projects → create_project "Katha — Roasted Archive" → finalize_plan (writes: design-system/**) → write_files`. Incremental, never wholesale-replace.
- **Standing rule:** any token/motion/state change lands in three places in the same change: `design.html` (specimen), this file (spec), `design-system/` (sync bundle). The nightly wiki-audit flags drift.

## 8. EXECUTOR CHECKLIST DELTA (beyond PRD §12 DoD)

- [ ] All §4 missing-state specs implemented (disabled, loading, toasts, empty month, fetch-failure, no-add-ons, long-text, links)
- [ ] Decision #1 catalog curation applied (10 curated presets; `bituin` in `pv-2`)
- [ ] Contrast corrections from §2.1 applied (fnt→mut in containers; error text; slot captions)
- [ ] `design-system/` bundle stays in lockstep with any token change made during the build
- [ ] Final report lists: §12 DoD line-by-line + §6 decisions actually exercised

*Filed to vault: `wiki/log.md` (design-handoff entry) · council verdict follows in `council/verdicts/`.*

## 9. MARKS — updated 2026-07-04 (Jed, supersedes all prior logomark locks)
Two marks total: (1) the **wordmark** "Katha" (FH Ronaldson/Fraunces-flow), (2) the **brush-drawn botanical K logomark** (five filled leaf strokes, organic taper — canonical SVG: `KATHA_BOOKING_PRD/katha-booking-html/assets/marks/katha-logomark.svg`, inlined as `#k-mark` symbol in index/admin/design). The previous thin 3-stroke line-K with red dot is **RETIRED** and removed from all live surfaces. The mark renders via `currentColor` — Piña Ecru on dark grounds, charcoal ink on the ticket. Jed's source PNG should be archived to `brand_assets/marks/` when convenient (vectorization was performed from the attachment).
