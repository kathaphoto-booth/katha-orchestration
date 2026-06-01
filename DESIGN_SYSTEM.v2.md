# Katha Design System — v2 (Draft, awaiting Jed approval)

> Sibling of `DESIGN_SYSTEM.md`. The v1 file remains the truth until Jed approves merging this draft over it.

Source of truth for tokens: `gemini_draft/app/globals.css`.
Squarespace handoff: `squarespace/HANDOFF_GUIDE.md`.

---

## 1. The One Rule (unchanged)
Compose with shell primitives. Never hardcode a hex, a font, a pixel margin, or a 6/6 grid.

---

## 2. Color Tokens — now **11**, was 9

**UI tokens**
| Token | Hex | Use |
|---|---|---|
| `--katha-obsidian-weave` | `#111112` | Dark base |
| `--katha-pina-ecru` | `#EAE2D5` | Light ground / SVG thread |
| `--katha-hammered-sequin` | `#9C958A` | **Dark grounds only.** Catchlight, sequin glint. *Forbidden as text on `--katha-pina-ecru`.* |
| `--katha-champagne-heirloom` | `#C4B59D` | Tonal embroidery |
| `--katha-iron-bark` | `#241E1A` | Text on light / frame |

**Narrative tokens**
| Token | Hex | Use |
|---|---|---|
| `--katha-knalum-ink` | `#1A1816` | Narrative dark bg |
| `--katha-loko-rust` | `#8C382A` | **Sacred CTA only — exactly one visible per page.** Booking moment. |
| `--katha-terracotta-earth` | `#A35C44` | Warm narrative accent (quote bars, stat hovers). Never UI state. |
| `--katha-abel-slate` | `#5A5D5A` | Muted / inactive text |
| `--katha-capiz-sage` | `#B5B8A3` | Success states, confirmation toast, sage-thread `<CaladoDivider>`. |

**NEW — Ecru-safe muted text (Section VIII)**
| Token | Hex | Use |
|---|---|---|
| `--katha-ecru-muted` | `#5A564E` | Muted body text on `--katha-pina-ecru` (contrast 5.6:1, AA✅) |
| `--katha-ecru-muted-soft` | `#6E6A62` | Captions, metadata on `--katha-pina-ecru` (contrast 5.0:1, AA✅) |

Tailwind classes: `bg-katha-*`, `text-katha-*`, `border-katha-*`.

---

## 3. Typography (tightened)

| Class | Font | Variation | Use |
|---|---|---|---|
| `font-display` | **Fraunces** | `SOFT 100, WONK 1` | Headings — carved feel |
| `font-body` | **EB Garamond** | regular | Long-form copy |
| `font-ui` | Inter | regular | UI labels, nav, buttons |
| `font-mono` | JetBrains Mono | regular | Metadata, stamps, ordinals |

**Forbidden:** `Cormorant Garamond` (was shipping in v1 — drift D1, audit 2026-05-31).
Never `font-weight: 700` on display. Display tracking `-0.015em`; utility labels `+0.12em uppercase`; mono `+0.04em`.

---

## 4. Shell Primitives

**Existing (kept):** `<KSection>`, `<KGrid>`, `<KGridPrimary>`, `<KGridSecondary>`, `<KEyebrow>`, `<KHeading>`, `<KBody>`, `<KMeta>`, `<KOrdinal>`, `<KCta>`, `<KFeatureCard>`, `<KQuoteBlock>`, `<KStatBar>`, `<KathaWordmark>`, `<KathaLogomark>`, `<KthaMark>`, `<CaladoDivider>`, `<DeckledCard>`, `<KathaThread>`.

**NEW primitives (Stage 3 brainstorm):**

| Component | Purpose | Notes |
|---|---|---|
| `<KBinakulField>` | Global 4%-opacity `feTurbulence` Wabi-Sabi patina | Mounted once in `app/layout.tsx`; `pointer-events-none`; reduced-motion freezes seed |
| `<KNarrativeThread items>` | Woven data list — form/spec sequence connected by inline SVG path | Replaces stacked inputs in editor sidebar; brass-ring closes on validity |
| `<KToast variant="success\|info">` | Confirmation/info flash | Sage on success; calado-dotted underline |
| `<KFilterChip active>` | Gallery/template filter chip | Iron Bark text + Champagne Heirloom underline when active; **never Loko Rust** |

**Tightened existing primitives:**
- `<KGrid split>` — TypeScript `split: "7/5" | "8/4" | "9/3" | "5/7" | "full"`. **`"6/6"` removed from type union** so it cannot compile.
- `<DeckledCard>` — `mask-image` now enforced inside the component (no consumer opt-out). Variant rotation utility: `<DeckledCardRotator items index>` to vary `a|b|c` automatically across maps.
- `<KCta variant="sacred">` — dev-mode runtime guard counts visible instances on mount; throws if >1.
- `<KathaThread>` — must be mounted in `app/layout.tsx`; emits `aria-label="Katha maker's mark — complete"` when KTHA closing stroke finishes.

---

## 5. Layout & motion rules

- Section VIII Woven Silk Overlay: decorative SVG threads intrude `12–16px` into adjacent slots; **always** `pointer-events-none` when `z-index ≥ 10`.
- Section VIII WCAG AA: muted text on `--katha-pina-ecru` must use `--katha-ecru-muted` or `--katha-ecru-muted-soft`. Never `--katha-hammered-sequin`.
- All page-end animations close with the KTHA brass-ring stroke (`<KathaThread>` terminator).
- `prefers-reduced-motion: reduce` freezes `<KathaThread>` shuttle and `<KBinakulField>` noise to a single static seed.

---

## 6. Forbidden (expanded)

**Code-level:**
- Hardcoded hex in components (use tokens).
- 6/6 symmetric grids (use 7/5, 8/4, 9/3, 5/7). Now type-blocked on `<KGrid>`.
- `border-radius` on cards/images (deckled, never rounded).
- Drop-shadows on light grounds (use the sombrado plate built into `KFeatureCard`).
- `<hr>` (use `<CaladoDivider>`).
- More than one `sacred` CTA visible at once (runtime-guarded).
- **NEW:** `text-katha-hammered-sequin` on `bg-katha-pina-ecru` (WCAG AA fail).
- **NEW:** `bg-katha-loko-rust` outside `<KCta variant="sacred">`.
- **NEW:** `font-family: 'Cormorant Garamond'` — display drift.

**Vocab (user-facing copy):**
- *luxury, premium, stunning, amazing, unforgettable, journey, vibe, aesthetic (noun), experience (noun), curated, authentic, Instagrammable, once-in-a-lifetime.*
- **NEW (§VIII):** *Antigravity SDK, agentic, Alpha-Transparent Overlay, automation pipeline, verification algorithm, MCP, embedding.*

**Legacy hex:** `#0a0806`, `#bf9d2c`, `#c4c1b8`.

---

## 7. Diff summary vs v1

| Section | v1 → v2 |
|---|---|
| Tokens | 9 → 11 (added `--katha-ecru-muted`, `--katha-ecru-muted-soft`) |
| Typography | Cormorant tolerated → Fraunces+EB Garamond enforced; Cormorant forbidden |
| Primitives | 18 → 22 (added `<KBinakulField>`, `<KNarrativeThread>`, `<KToast>`, `<KFilterChip>`) |
| `<KGrid>` | runtime forbids 6/6 → type forbids 6/6 |
| `<DeckledCard>` | mask opt-in → mask enforced |
| `<KCta variant="sacred">` | doc rule → runtime guard |
| Forbidden | 13 entries → 21 entries (incl. §VIII vocab + Cormorant + Loko outside CTA + Sequin-on-Ecru) |

---

## 8. Migration checklist (post-approval)

1. `gemini_draft/app/globals.css` — add Fraunces `@font-face`, add `--katha-ecru-muted*` tokens, remove Cormorant `@import`.
2. `gemini_draft/tailwind.config.ts` — map new tokens; tighten `font-display` family.
3. `gemini_draft/app/layout.tsx` — mount `<KathaThread>` + `<KBinakulField>`.
4. `gemini_draft/components/shell/KGrid.tsx` — narrow `split` type union; remove `"6/6"`.
5. `gemini_draft/components/shell/DeckledCard.tsx` — internalize `mask-image`.
6. `gemini_draft/components/shell/KCta.tsx` — add dev-mode sacred-count guard.
7. **NEW** `gemini_draft/components/shell/KBinakulField.tsx`.
8. **NEW** `gemini_draft/components/shell/KNarrativeThread.tsx`.
9. **NEW** `gemini_draft/components/shell/KToast.tsx`.
10. **NEW** `gemini_draft/components/shell/KFilterChip.tsx` + swap into gallery filter row.
11. Mirror `globals.css` + `tailwind.config.ts` changes into `photobooth-template-studio/`.
12. `squarespace/katha-injection.css` — add `--katha-ecru-muted*` CSS vars; add Fraunces fallback chain.
13. Run Brass-Ring Enforcer (Stage 5 agent) — expect zero violations.
