# Stage 2 — Design Critique (Wabi-Sabi Fidelity)

Method: critique the live `book.kathabooth.com` against the four Katha failure modes + Section VIII rules, ranked by how badly each erodes the brand promise.

---

## Ranked critique

### 1. The voice carved into wood is shipping in marble. *(D1 — font drift)*
Cormorant Garamond is not the wrong family — it is the wrong **temperament**. Fraunces with SOFT 100 / WONK 1 is what gives a heading its slightly-pressed-deeper-into-the-wood imperfection (the Wabi-Sabi mandate, the Arturo Luz "one terminal slightly heavier than the others"). Cormorant has none of that — it's a clean Caslon revival, smooth, courtly, slightly French. On Piña Ecru it reads "wedding stationery vendor," not "carved heirloom." This is the single biggest leak between brand spec and rendered reality. Fix this first; every other heading-related fix is downstream.

### 2. The loom has no shuttle and no closing knot. *(D2 + G2)*
The brand's central animation metaphor — *the booth is a loom; the print is a Katha; the KTHA mark is the brass ring* — is **not rendered**. The user can scroll the entire gallery and never see the Piña Ecru thread shuttle down the page; the brass ring never draws as the closing stroke. The brand spec promises this on every digital page-end and ships it on none. Without it, the storytelling is a static brochure, not a loom in motion. The shell primitive `<KathaThread>` exists; it just isn't mounted in `app/layout.tsx`. This is a single-line fix with disproportionate brand payoff.

### 3. The sacred color is no longer sacred. *(D3)*
Loko Rust (`#8C382A`) is — per the T'nalak provenance documented in BRAND_GENESIS_PLAN §I — *blood, vitality, from boiled loko root, sacred*. The brand's "sacred CTA only" rule is doing the religious work of keeping it scarce. The live gallery uses it as a filter-pill active-state, which makes the brass ring of a booking moment feel no different from clicking *4x6 Postcard*. The fix is small (recolor the active chip to Iron Bark on Champagne, or a Knalum Ink underline). The cost of leaving it is high: when the *actual* booking CTA appears, it has no remaining semantic charge.

### 4. The deckled edge is missing where it does the most narrative work. *(D4)*
The gallery is the surface where every shopper *encounters* Katha. Every thumbnail is a sharp 1px-radius rectangle — a perfectly normal e-commerce grid. The brand promise says **no sharp geometric borders**. The thumbnails do not need to be wildly deckled (and per the No-Fukinsei-in-Templates memory the artworks inside stay polished), but the **frame around** each artwork is brand chrome. `<DeckledCard variant="a|b|c">` is built; it isn't wrapped around the thumbnail anchors. One mapped wrapper component fixes the entire grid.

### 5. Three of nine palette tokens are dead in render. *(G1)*
Hammered Sequin, Terracotta Earth, and Capiz Sage have **zero occurrences** in the live HTML. The brand has nine tokens and ships six. The unused three are the *narrative* slots (catchlight, warm accent, success/divider). Their absence is why the page reads as monochromatic ecru-and-iron — handsome but flat. The brainstorm in Stage 3 should focus on giving each unused token a single non-decorative home.

### 6. Symmetric center-stack header. *(D5 — Fukinsei drift)*
Minor in isolation but compounding. "Choose your style" is centered above centered filter pills above a uniform 4-col grid. Three centerings in a row produce a perfectly balanced composition — which is *the explicit opposite* of Fukinsei. One asymmetric split (`KGrid split="8/4"`) immediately Katha-ifies the section without touching the templates inside.

### 7. The Poetic Synchronization is intact in copy but absent in interaction. *(G4)*
The home/editor right-column copy is genuinely beautiful — *"Unbleached piña-fiber ground with a fine calado openwork divider drawn in champagne thread."* That sentence alone justifies the brand book. But the left-column editor form fields are standard inputs. The CLAUDE.md mandate — *"every server-side fetch must feel like a deliberate, handcrafted stroke"* — is met by the words and betrayed by the widgets. A `<KNarrativeThread>` primitive (Stage 4 candidate) could weave form labels into the continuous SVG thread instead of stacking them.

---

## Section VIII compliance check

| §VIII rule | Status | Notes |
|---|---|---|
| Woven Silk Overlay (12–16px intrusion, `pointer-events-none` on z-10+) | ⚠️ unverified | No decorative SVG threads are mounted on live routes (D2). Rule cannot be violated by something that isn't drawn — but also cannot be verified until the thread ships. |
| WCAG AA on Piña Ecru ground | ✅ likely safe | `#9C958A` never appears as text (0× in HTML). Active text is Iron Bark `#241E1A` (contrast 14.6:1) and Abel Slate `#5A5D5A` (contrast 5.3:1). Both pass AA. The §VIII-approved `#5A564E` / `#6E6A62` tokens are not yet defined in CSS — should be added preemptively. |
| Forbidden agentic vocab in user copy | ✅ clean | 0 occurrences across all tested vocab. |
| `GEMINI_API_KEY` for `scripts/katha_design_agent.py` | n/a | Not invoked this session. |

---

## Severity rollup

| Severity | Findings |
|---|---|
| HIGH | D1 (font), D2 (thread/KTHA), D3 (Loko Rust dilution) |
| MEDIUM | D4 (deckled gallery), D5 (Fukinsei) |
| LOW / aesthetic gaps | G1 (dead tokens), G2, G3, G4, G5 |

Three high-severity drifts; all three are single-file or single-component fixes. Brand promise is structurally sound — it's the **last 5%** of rendering polish that is missing, and the user feels exactly that 5%.

---

## Next: Stage 3 — Brainstorm
Take each unused token (G1) and each missing primitive (D2, D4, G2, G3) and produce a ranked list of 8–12 concrete heightening moves with effort tags.
