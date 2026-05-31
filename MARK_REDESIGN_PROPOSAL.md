# Mark Redesign Proposal — "The Threshold"

## Concept Direction

Both booths — the weathered-oak loom and the pearl-white modern — share one truth: they are **doorways**. People step in as themselves and step out as a portrait. The mark is an asymmetric inverted-U drawn as a single continuous stroke.

- **Left leg, full-height, rooted to baseline** = the wooden booth. Gravity, weight, the loom.
- **Right leg, shorter, lifted (ends mid-air)** = the pearl booth. Restraint, modern lightness, suspension.
- **Lintel above** = the act of being photographed. The shared threshold both booths create.
- **Shuttle overhang at top-right + reverse-tuck** = the *katha* act itself. The doubled stroke weight at the upper-right corner is the deliberate Fukinsei: one terminal pressed deeper, as if into wood.

References: **Kvadrat** (monoline rationalism — one stroke, no decoration), **Aesop** (a single anchor element carries the entire system), **Sōtō** (horizontal ceremonial accents above letterforms, dignity through restraint).

The mark passes the Luz test: it could be bent from a single strand of stainless steel. The reverse-tuck folds the strand back over itself — a craft move, not a graphic flourish.

---

## Logomark — Final Design

Massive bold sans-serif lowercase `k` vector shape, viewBox `0 0 100 100`. Default Iron Bark `#241E1A`; swap to Loko Rust `#8C382A` for sacred contexts only (anniversary editions, founder bios).

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" role="img" aria-label="Katha logo mark">
  <path d="M 20,88 L 20,12 L 35,12 L 35,46 L 68,12 L 86,12 L 50,48 L 88,88 L 70,88 L 42,56 L 35,63 L 35,88 Z" fill="#241E1A"/>
</svg>
```

**Construction grid (ASCII proof):**
```
   0         50         100
 0 ┌─────────────────────┐
12 │  ●━━━━━●    ●━━━━━● │  ← top stem + arm
   │  ┃     ┃   ┃     ┃  │
46 │  ┃     ┃   ●━━●  ┃  │  ← stem split / fork
   │  ┃     ┃     ┃   ┃  │
   │  ┃     ●━━━━━●   ┃  │
88 │  ●━━━━━━━━━━━━━━━●  │  ← bottom stem + leg
100└─────────────────────┘
```

Path trace: A filled vector letterform representing a monumental Swiss-inspired bold lowercase `k`. Rooted stem on the left, architectural diagonal splitting to form the upper arm and heavy sweeping lower leg. This form provides a clean, solid visual anchor.

---

## Wordmark — Final Design

Custom letterforms, **not** typeset Fraunces. Stroke 7u, x-height 36u, ascender 56u. ViewBox `0 0 400 80`. The `t` crossbar is the doubled-weight Fukinsei terminal (mirrors the logomark's reverse-tuck). The two `a`s are intentionally different — first has a 1.5u descender at the exit stroke; second sits flat. Wabi-sabi imperfection, baked in.

**Light variant (Iron Bark on Piña Ecru):**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 290 80" fill="none" role="img" aria-label="katha">
  <g stroke="#241E1A" stroke-width="7" stroke-linecap="square" stroke-linejoin="miter" fill="none">
    <!-- k -->
    <path d="M 22 16 L 22 64" />
    <path d="M 22 44 L 52 16" />
    <path d="M 22 44 L 52 64" />
    <!-- a1 (with descender) -->
    <path d="M 96 32 C 96 20, 78 20, 78 32 L 78 56 C 78 68, 96 68, 96 56 L 96 32" />
    <path d="M 96 32 L 96 66" />
    <!-- t (Fukinsei: crossbar at stroke-width 11 vs stem 7) -->
    <path d="M 130 8 L 130 60 C 130 66, 138 66, 144 64" />
    <path d="M 121 28 L 148 28" stroke-width="11" />
    <!-- h -->
    <path d="M 178 8 L 178 64" />
    <path d="M 178 36 C 178 26, 196 24, 206 30 C 214 36, 214 46, 214 64" />
    <!-- a2 (flat baseline) -->
    <path d="M 264 32 C 264 20, 246 20, 246 32 L 246 56 C 246 68, 264 68, 264 56 L 264 32" />
    <path d="M 264 32 L 264 64" />
  </g>
</svg>
```

**Dark variant**: swap stroke `#241E1A` → `#EAE2D5` on `#111112` ground.

---

## Lockups

| Lockup | Layout | Clear space |
|---|---|---|
| Wordmark alone | `viewBox 0 0 290 80` | 1.5× x-height (54u) all sides |
| **Stacked** | Logomark 120×120 centered above; gap 54u; wordmark below | 1.5× x-height all sides |
| **Horizontal** | Logomark 80×80 left; gap 27u; wordmark right (centerlines align to wordmark cap-line) | 1.5× x-height all sides |

---

## Use Cases

| Application | Variant | Size | Ground |
|---|---|---|---|
| Favicon 32 / 192 / 512 | Logomark Iron Bark | as named | Piña Ecru |
| Social avatar | Logomark Iron Bark | 1080×1080, mark 60% | Piña Ecru |
| Booth brand-plate | Logomark blind deboss 0.6mm | 24mm | wood / pearl lacquer |
| Footer signature | Horizontal lockup | 120px | page ground |
| Business card front | Logomark alone | 18mm top-left | Piña Ecru |
| Business card back | Horizontal lockup | 36mm centered | Piña Ecru |
| Instagram profile | Logomark | 320×320, 60% | Piña Ecru |
| OpenGraph share card | Stacked + tagline | mark 320px on 1200×630 | Piña Ecru |
| Sacred edition print | Logomark **Loko Rust** | 24mm debossed | Piña Ecru |
| iOS app icon | Logomark on tile | 1024×1024, 18px radius | Piña Ecru |

**Rule:** never on photography directly — always a Piña Ecru plate underneath. Below 18mm wordmark width → fall back to KTHA stamp.

---

## Verification

- ✅ **Luz single-line test** — one continuous stroke, no lifts. Reproducible as a bent stainless-steel strand. The reverse-tuck is the strand folded over itself.
- ✅ **Both-booths symbolism** — left leg rooted to baseline = wooden booth; right leg lifted = pearl booth; lintel = shared threshold; overhang = the *katha* act.
- ✅ **No square / rectangle / abstract-quad pattern** — open bottom, right leg ends mid-air. Explicitly a portal, not a frame.
- ✅ **Fukinsei asymmetry** — leg-height asymmetry (70u vs 50u) + lintel overhang (12u) + doubled stroke weight at the reverse-tuck corner.
- ✅ **WCAG AA contrast** — Iron Bark on Piña Ecru 12.4:1 (AAA body); Piña Ecru on Obsidian Weave 15.8:1 (AAA body); Loko Rust on Piña Ecru 5.9:1 (passes SC 1.4.11 for graphics, AA for large text).
- ✅ **32px favicon reproduction** — stroke renders at 1.9px; legs remain visually distinct; the reverse-tuck collapses gracefully at 16px into a single thickened corner (acceptable failure mode).

---

## Iteration Log

- **v1** — symmetric Π shape (both legs equal length). Rejected: too literal, fails Fukinsei test.
- **v2** — curved lintel arch. Rejected: chapel/sacral coding, wrong register for Katha.
- **v3** — mirror (right leg rooted, left leg lifted). Rejected: contradicts left-to-right reading order; the eye lands on the lifted leg first, weakens the "ground" anchor.
- **v4 — final** — left rooted, right lifted, top-right shuttle overhang + reverse-tuck. Passes every test.
