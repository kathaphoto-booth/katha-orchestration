---
name: katha-impeccable
description: Master UI/UX audit that enforces technical correctness while protecting Wabi-Sabi aesthetics. Use for any UI review, layout audit, responsive check, accessibility scan, visual QA, pre-deploy review, or when the user says "impeccable", "audit the UI", "check the layout", "responsive test", "accessibility check". Also use when Brock (Frontend QA) is reviewing. This skill explicitly protects intentional asymmetry, deckled edges, and negative space from being "fixed" by well-meaning audits.
---

# Katha Impeccable — UI/UX Audit with Wabi-Sabi Protection

## Why This Exists

Standard UI audits flag asymmetric layouts as bugs, empty space as missing content, and irregular edges as rendering errors. For Katha, these are the design. This skill separates genuine technical defects (contrast failures, broken touch targets, missing ARIA labels) from intentional Wabi-Sabi aesthetics (Fukinsei asymmetry, Ma negative space, deckled edges). An audit that "fixes" the asymmetry destroys the brand.

## Type: Flexible

Adapt the scope to the task. A full pre-deploy audit hits every section. A quick layout check focuses on the specific component. The Wabi-Sabi protection rules always apply regardless of scope.

## The Audit — Technical Correctness

### Color & Contrast (WCAG AA)
- [ ] Muted text on Piña Ecru (`#EAE2D5`) uses `--katha-ecru-muted` (`#5A564E`, 5.6:1) or `--katha-ecru-muted-soft` (`#6E6A62`, 5.0:1)
- [ ] Hammered Sequin (`#9C958A`) is never used as text on Piña Ecru (3.2:1, AA fail)
- [ ] Loko Rust (`#8C382A`) appears only inside `<KCta variant="sacred">` — max one per visible viewport
- [ ] No pure `#000000` or `#ffffff` anywhere in the rendered output

### Layout & Components
- [ ] No `border-radius` on cards or images — deckled masks only (`<DeckledCard>`)
- [ ] No `<hr>` elements — use `<CaladoDivider>` instead
- [ ] No 6/6 symmetric grids — use 7/5, 8/4, 9/3, or 5/7
- [ ] Decorative SVG overlays at `z-index ≥ 10` have `pointer-events: none`
- [ ] Thread animation and Binakul noise respect `prefers-reduced-motion: reduce`

### Responsive Breakpoints
- [ ] **Desktop (1440px):** Full L-Frame visible, Asymmetric Void breathing, content staggered right
- [ ] **Tablet (768px):** L-Frame collapses gracefully, grid shifts toward single column, gutters reduce proportionally
- [ ] **Mobile (375px):** Content readable, no horizontal scroll, touch targets ≥ 48px, sacred CTA fully visible

### Accessibility
- [ ] Semantic HTML (`<header>`, `<main>`, `<nav>`, `<footer>`, `<section>`)
- [ ] All interactive elements have unique, descriptive `id` attributes
- [ ] Images have meaningful `alt` text (not "image" or empty)
- [ ] `<KathaThread>` emits `aria-label="Katha maker's mark — complete"` on animation finish
- [ ] Keyboard navigation works (tab order, focus visible states)

### Typography
- [ ] Headlines use Fraunces (`font-variation-settings: "SOFT" 100, "WONK" 1`)
- [ ] Body text uses EB Garamond
- [ ] UI labels use Inter
- [ ] No Cormorant Garamond, no Italiana
- [ ] Display text tracking: `-0.015em`. Utility labels: `+0.12em uppercase`. Mono: `+0.04em`

## The Shield — Wabi-Sabi Protection

These are **not bugs**. Do not "fix" them. If another tool or audit flags them, override the flag.

| Intentional Design | Why It Exists | Do NOT |
|---|---|---|
| Asymmetric layouts | Fukinsei — beauty in irregularity | Center-align or equalize columns |
| Deckled / torn edges | Handcraft materiality | Smooth, round, or clip to rectangles |
| Large negative space (Ma) | Breathing room, museum-grade presentation | Fill with content or reduce padding |
| SVG noise texture | Binakul patina, aged textile feel | Remove or reduce opacity to zero |
| Thread animation irregularity | Organic loom movement | Regularize timing or make perfectly smooth |
| Staggered content blocks | Asymmetric Void, L-Frame breathing | Align to a uniform grid |
| Tone-on-tone Calado pattern | Subtle camisa texture | Increase contrast or make more visible |

## Evidence Production (Evidence-Before-Claims)

No "done" without cited proof — raw terminal output, screenshot paths, or audit
scores. Feelings are not evidence. Produce at least one piece per the category:

**UI / visual:**
1. **Desktop screenshot** via `chrome-devtools-mcp/take_screenshot` (save to artifacts)
2. **Mobile screenshot** — `chrome-devtools-mcp/emulate` 375px + screenshot
3. **Lighthouse accessibility score** via `chrome-devtools-mcp/lighthouse_audit`
4. **Console error check** via `chrome-devtools-mcp/list_console_messages` (zero errors)

**Brand assets (marks, copy, design directions):**
- Adversarial Verify — 5-critic simulation per `katha-protocol` §6, OR
- Hex audit: `grep` output showing no off-palette drift, OR
- Typography audit: only Fraunces / EB Garamond / Inter / JetBrains Mono present

**CSS injection (Squarespace):**
- Before/after screenshots of the target page
- Console check (`list_console_messages`, no errors) + network check (CSS loaded)

Report as: **Task / Evidence (typed, with path or inline output) / Result PASS|FAIL.**
*(Evidence discipline absorbed from the dissolved katha-verify, 2026-06-04.)*

## Tools

- `chrome-devtools-mcp/take_screenshot` — visual proof
- `chrome-devtools-mcp/emulate` — responsive testing
- `chrome-devtools-mcp/lighthouse_audit` — accessibility + performance scores
- `chrome-devtools-mcp/take_snapshot` — DOM structure verification
- `chrome-devtools-mcp/list_console_messages` — error detection

Never use `oax-audit-monster`. Use `chrome-devtools-mcp` exclusively.

## Relationship to Other Skills

- Reads constraints from `katha-protocol` (palette, typography, anti-patterns, delegation)
- Reads component specs from `DESIGN_SYSTEM.v2.md` (referenced, not bundled — load when needed)
- Carries the **evidence-before-claims** discipline (absorbed from the dissolved `katha-verify`)
- Complements `loom-auditor` (live deploy) and `brass-ring-enforcer` (source tree)
- Load when a task touches UI / layout / brand assets
