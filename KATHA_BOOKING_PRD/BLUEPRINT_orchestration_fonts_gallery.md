# Katha — Orchestration + Design Blueprint (v1)
### "Lock where we left off": CLI orchestration · Obsidian MCP · 12–15 custom Katha fonts · /gallery · layout cleanup · terracotta
> Date: 2026-07-03 · Author: Claude Code (general contractor). Decisions from Jed's boot prompt + AskUserQuestion answers.
> Status: blueprint for execution. §A config is being applied now; §B–E are the design build, sequenced after.

---

## A. MULTI-AGENT ORCHESTRATION — the "General Contractor" model

**Roles (locked):**
- **Claude Code** = general contractor. Natively queries **Obsidian MCP** for vault knowledge; chairs the council; delegates.
- **codex** (local, Ollama) = heavy code lifting. Model **`qwen2.5-coder:7b`** — already pinned (`council.sh:95`, `CODEX_OSS_MODEL`, `--oss`). ✅ no change.
- **agy** (Antigravity CLI) = agentic critic + **computer-use** driver. Model **Gemini 2.5 Pro**; UI control via **`gemini-2.5-computer-use-preview-10-2025`** (Vertex, Playwright-driven Chrome). The Managed-Agents sandbox literally "uses the Antigravity harness."
- **copilot** (GitHub Copilot CLI) = interactive terminal problem-solving on **GLM-5**.

### A.1 codex — no change
`CODEX_OSS_MODEL=qwen2.5-coder:7b`, `CODEX_USE_OSS=1`. Verify Ollama has it: `ollama list | grep qwen2.5-coder`.

### A.2 agy → (Gemini 2.5 Pro requested — NOT available in agy) + Computer Use Preview
- **⚠ VERIFIED BLOCKER:** `agy models` does **not** list "Gemini 2.5 Pro." The real list is: **Gemini 3.5 Flash (Low/Medium/High), Gemini 3.1 Pro (Low/High), Gemini 3 Flash.** So `AGY_MODEL="Gemini 2.5 Pro"` would be the exact non-existent-name failure the council guard warns about. **Need Jed to pick from the real list** — the closest "Pro" is **`Gemini 3.1 Pro (High)`** (or Low). Only then do I change `council.sh:145`.
- Note: "Gemini 2.5 Pro" + `gemini-2.5-computer-use-preview-10-2025` are **Vertex/Agent-Platform** models (Gen AI SDK), a *different access path* than `agy --model`. So agy's council/critic model (from the list above) is separate from the computer-use capability below.
  - Tradeoff to accept: 2.5 Pro is slower + more quota than Flash-Low for read-only critiques. If council latency/quota bites, keep council on Flash and use 2.5 Pro only for the delegation/computer-use path (a `COUNCIL_AGY_MODEL` vs `AGY_MODEL` split).
- **Computer Use (the real capability):** `gemini-2.5-computer-use-preview-10-2025` — Vertex API only (not Agent Platform Studio). Inputs images+text → text actions; 128k in / 64k out; global endpoint; dynamic thinking. **Requires (Jed, in GCP console — I can't do these):**
  1. Enable **Agent Platform / Vertex AI API** on the project (the clipping shows project "5449" / `premium-buckeye-501316-b2`; our `.env` uses `GOOGLE_CLOUD_PROJECT=katha-booth` — reconcile which project).
  2. `gcloud auth application-default login` (ADC) with that project.
  3. Clone `github.com/google/computer-use-preview`, `pip install google-genai`, run `main.py --environment playwright [--url ...]`.
  4. Wire agy's computer-use invocation to that model id. (agy already runs via `delegate_agy.sh`; add a `--computer-use` path or an env `AGY_CU_MODEL=gemini-2.5-computer-use-preview-10-2025`.)

### A.3 copilot → GLM-5 (resolve the BYOK reality)
You picked **Vertex**, then pasted the **Ollama-local** route. Here's the honest reconciliation — Copilot BYOK wants a **static `GITHUB_COPILOT_API_KEY` + OpenAI-compatible URL**:
- **Vertex `glm-5-maas`** is OpenAI-compatible **but auth is a short-lived ADC bearer token** (`gcloud auth ... print-access-token`, ~1h TTL) — not a static key. So pointing Copilot straight at Vertex needs a **tiny local token-refresh proxy** (localhost → injects a fresh bearer, forwards to Vertex). ~30 lines; we already have the Vertex client in `genaiPartner.js` to model it on.
- **Ollama `glm-5:cloud`** (Z.ai-backed) gives a **static key + OpenAI URL** → the *cleanest* BYOK fit, zero proxy. Fully-local `glm-5.2` is impractical (744B MoE; your Mac has no NVIDIA GPU; the `scratch/copilot-glm5/docker-compose.yml` GPU block won't run).
- **Recommendation:** use **`glm-5:cloud` via Ollama** for Copilot BYOK (static key, no proxy, no GPU), *labeled as GLM-5*; keep the Vertex `glm-5-maas` path for `bin/glm5`/partner calls. If you insist on Vertex-for-Copilot, I'll build the refresh proxy.
- **Fix the POC bug regardless:** `scratch/copilot-glm5/.env` has a truncated `GITHUB_COPILOT_API_URL="http://127.0.0"` → must be `http://127.0.0.1:11434/v1`.
- BYOK env (whichever backend):
  ```
  GITHUB_COPILOT_API_URL="<openai-compatible base>"   # ollama :11434/v1  OR  local proxy
  GITHUB_COPILOT_API_KEY="<static key or dummy>"
  GITHUB_COPILOT_MODEL="glm-5.2"   # or glm-5-maas per backend
  ```
  then `gh copilot config` → select **Custom Endpoint / Provider**. Note: council.sh currently runs copilot with **no `--model`** (account-gated); BYOK bypasses that gate by redirecting the API base.

### A.4 Obsidian MCP → `obsidian-mcp-server` v3.2.9
Swap the `mcpServers.obsidian` entry in `~/.claude/settings.json`:
```jsonc
"obsidian": {
  "command": "npx",
  "args": ["-y", "obsidian-mcp-server"],
  "env": {
    "OBSIDIAN_API_KEY": "katha-mcp-key-2026",         // already set in the vault's Local REST API plugin
    "OBSIDIAN_BASE_URL": "http://127.0.0.1:27123",     // Local REST API plugin, enableMcp:true (already on)
    "OBSIDIAN_VERIFY_SSL": "false"
  }
}
```
- It talks to the **Obsidian Local REST API plugin** (port 27123, key `katha-mcp-key-2026`, `enableMcp:true` — all already configured) → gives read/write/search + **surgical note edits**, stdio or HTTP. **Requires Obsidian to be running** with the plugin enabled (unlike the old filesystem-direct `obsidian-mcp`).
- Takes effect on **Claude Code restart**. Keep the old `obsidian-mcp` line commented as fallback for one session. Verify: after restart, `search-vault`/note-read tools return vault content; confirm surgical-edit works on a scratch note.

### A.5 STATUS (verified 2026-07-03, re-verified + closed out 2026-07-04)
- ✅ **codex** — pinned `qwen2.5-coder:7b`. Re-verified 07-04: `ollama serve` running (pid live), `ollama list` shows `qwen2.5-coder:7b` present. No action needed.
- ✅ **Obsidian MCP — root cause found and fixed (07-04).** The "Auth UNVERIFIED (40101)" from 07-03 was never a restart issue — `~/.claude/settings.json` had a stale placeholder (`katha-mcp-key-2026`) that never matched any real key. The Local REST API plugin generates its own key **per vault**, on disk at `<vault>/.obsidian/plugins/obsidian-local-rest-api/data.json`. Note there are **two nested vaults** (`KATHA_VAULT/.obsidian` at the root, and `KATHA_VAULT/knowledge/.obsidian` — the one actually served on `:27124`, matching `OBSIDIAN_BASE_URL`). Pulled the real key from the `knowledge` vault's `data.json` and wrote it into `OBSIDIAN_API_KEY` in `~/.claude/settings.json`. Verified directly against the API (`curl .../vault/` → real file listing, no more 40101). **Takes effect on next Claude Code restart** (MCP server env is read at spawn). The earlier "✅ FULLY VERIFIED post-restart" bullet from 07-03 was describing a session that had since gone stale — this entry supersedes it.
- ✅ **agy — resolved, no change.** Jed's call (2026-07-04): keep `Gemini 3.5 Flash (Low)` as pinned in `council.sh:145`. Not upgrading to a "Pro" tier — the speed/cost of Flash-Low wins for read-only council critiques. §A.2's "awaiting Jed's pick" is closed.
- ✅ **copilot GLM-5 — verified end-to-end (07-04), incl. the step 07-03 left open.** `scratch/copilot-glm5/vertex-proxy.mjs` started via `start-proxy.sh` (confirmed listening on `127.0.0.1:8788`, direct curl round-trip returned real GLM-5 content). The 07-03 note about a remaining `gh copilot config` step was based on the old, Oct-2025-sunset `gh copilot` extension — **doesn't apply**. The standalone `copilot` CLI actually in use (per `council.sh`'s own 06-27 comment) activates BYOK purely via env vars (`COPILOT_PROVIDER_BASE_URL`, `COPILOT_PROVIDER_TYPE`, `COPILOT_MODEL` — see `copilot help providers`), no wizard, no `gh` involved. Verified live: `COPILOT_PROVIDER_BASE_URL=http://127.0.0.1:8788/v1 COPILOT_PROVIDER_TYPE=openai COPILOT_MODEL=zai-org/glm-5-maas copilot -p "..." --allow-all-tools --deny-tool=write --deny-tool=shell --silent` → real GLM-5 reply through the proxy. **Not wired into `council.sh`'s copilot voice** — that voice currently runs in plain GH-authenticated auto-mode (picks `gpt-5-mini`) *by design*, per council.sh's own 06-27 hardening comment (passing any `--model` there hits an account-level access gate). Switching the council voice to BYOK/GLM-5 is a real cost/quality tradeoff call, left for Jed rather than changed silently here. Also note: the proxy is a foreground/background shell process, not a persistent daemon — it dies when the shell session ends; making it durable (e.g. launchd) is a separate, not-yet-done step if wanted.
- ✅ **GCP verified:** account `kathabooth@gmail.com`; ADC works; billing True on `katha-booth` & `premium-buckeye-501316-b2` (proj 5449); `aiplatform` enabled; **both `gemini-flash-latest` AND real `zai-org/glm-5-maas` verified reachable & working** on both projects. No GCP budget alert has been set (§A.6) — still an open advisory item, needs Jed in the console.
- ✅ **Computer Use** — `computer_use.py` (Gen AI SDK, ADC, project 5449): `gemini-2.5-computer-use-preview-10-2025` (UI control) + `gemini-flash-latest` (vision) run **simultaneously** (answers Jed's Q1). `google-genai` confirmed installed (`2.10.0`) in `.venv`. The `google/computer-use-preview` sample repo for actually driving a live browser has **not** been cloned/run — left as a future step, out of scope for "config applied."

### A.6 COST-FRIENDLY ARCHITECTURE (sustained post-launch)
- **Most work is local/free:** codex = Ollama `qwen2.5-coder:7b`; keep heavy/iterative loops local.
- **Cloud only where needed, on the cheapest tier:** `gemini-flash-latest` (verified cheap) for agy-vision/Copilot; council stays on cheap Gemini Flash-Low; **preview + GLM-5 models used sparingly** (preview pricing can change).
- **Guardrails:** set a **GCP budget alert** on `katha-booth`; the proxy's fail-fast fallback avoids runaway cold-start spend; prefer `location=global` (dynamic shared quota).
- **Fits the Obsidian LLM-wiki stack:** `obsidian-mcp-server` gives CC read/write/search/surgical-edit into the vault (the knowledge layer); council/delegation write findings back to the vault.

---

## B. THE 12–15 CUSTOM KATHA FONT PROGRAM (the client "wow")

**Thesis:** deliver bespoke, Katha-owned typefaces per client — the way "Tracy & Prince" was made (identify the client's reference script → rebuild it glyph-by-glyph with custom heart-swash ligatures → a Katha-owned face). Productize that one-off into a **house foundry of 12–15 faces**.

### B.1 Licensing — why this is clean
Fonts under the **SIL Open Font License (OFL)** — which is *most* of Google Fonts — **explicitly permit modification, extension, and redistribution**, provided you (a) **don't use the original "Reserved Font Name,"** and (b) redistribute under OFL. So "an iteration of a free-source font is free game" is correct **for OFL fonts, renamed.** (Avoid Apache-2.0 fonts' trademark strings; avoid anything non-OFL.) Each Katha face ships with its own `OFL.txt` crediting the base and clearing the RFN.

### B.2 The foundry — 15 faces mapped to real template needs
Grouped by the job they do on a 2×6 / 4×6 template. Each = fork an OFL base → redraw signature glyphs (ampersand, swash caps, ligatures) → rename **"Katha …"** → subset (Latin + numerals + the couple/heart ligatures) → self-host.

| # | Katha face | Role | OFL base to fork | Signature move |
|---|---|---|---|---|
| 1 | **Katha Amoré** | couple-name script | Great Vibes / Alex Brush | heart-swash ligature (the Tracy&Prince move) |
| 2 | **Katha Vow** | delicate script | Parisienne / Sacramento | single-weight, tight loops |
| 3 | **Katha Signature** | ultra-fine signature | Mr De Haviland / Herr Von Muellerhoff | hairline entry/exit strokes |
| 4 | **Katha Pinyon** | formal calligraphy | Pinyon Script | high-contrast copperplate |
| 5 | **Katha Sway** | casual bounce script | Dancing Script | connected bounce baseline |
| 6 | **Katha Deco** | thin deco caps | Poiret One / Marcellus | geometric art-deco (Steven&Cristalyn gold frames) |
| 7 | **Katha Gatsby** | engraved monogram caps | Cinzel Decorative | inline/engraved deco |
| 8 | **Katha Editorial** | optical display serif | Fraunces (variable) | opsz axis for hero vs caption |
| 9 | **Katha Didone** | high-contrast serif | Playfair Display | dramatic thick/thin |
| 10 | **Katha Cormorant** | refined light serif | Cormorant Garamond | airy, wide |
| 11 | **Katha Roman** | inscriptional date caps | Cinzel | "JULY 25, 2026" pedestal caps |
| 12 | **Katha Heritage** | old-style body/quotes | EB Garamond | text-band body |
| 13 | **Katha Grotesque** | UI + clean date line | Hanken Grotesk / Outfit | neutral sans |
| 14 | **Katha Mono** | registry meta | Space Mono / JetBrains Mono | tracked uppercase system voice |
| 15 | **Katha Hand** | organic brush | Caveat / Kalam | warm hand-lettered accents |

### B.3 The "font-sniping" pipeline (repeatable service)
1. Client sends a reference photo/invite. 2. Identify closest OFL base (WhatFontIs / Font Matcherator). 3. Fork the base; in a font editor (**FontForge** / **Glyphs** / **fontTools**), match the client's key glyphs + add custom ligatures (`&`, hearts, monograms). 4. **Rename** to a Katha face, add `OFL.txt`, clear the RFN. 5. Subset to needed glyphs (`fonttools subset`) → `woff2`. 6. Deliver on the template; store the face in the foundry for reuse.

### B.4 Implementation
- New package/dir **`KathaFontFoundry/`**: `sources/` (forked otf/ufo), `web/` (subsetted `woff2`), `OFL/` (per-face licenses), `katha-fonts.css` (@font-face) + a `next/font/local` registration module for the studio (`--font-katha-amore`, etc.).
- Wire into `photobooth-template-studio/lib/templates.ts`: each preset's `fontFamily` → a Katha face var. Extend `lib/font-mapper.ts` (`mapFontToVar`) with the 15 faces.
- **Build tooling:** a `scripts/fork-font.mjs` (fonttools/pyftsubset wrapper) that takes a base + new name → outputs renamed, subsetted woff2 + OFL. Makes each new client face a one-command job.
- **Scope note:** producing 15 *genuinely redrawn* faces is real type-design labor. The blueprint delivers the **system + pipeline + first faces**; faces 1–5 (the couple scripts, incl. the existing Tracy&Prince) are the launch set; 6–15 fill in over subsequent passes. Flag: I can automate fork+rename+subset, but bespoke glyph redraw benefits from your eye in a font editor.

---

## C. /gallery — the redesign (Roasted Archive, one notch calmer)

**Where:** `photobooth-template-studio/app/gallery/page.tsx` (the live book.kathabooth.com, Next.js 15) — the route is already spec'd, unbuilt. Styled to the **Roasted Archive** (PRD/design.html), self-hosted FH Ronaldson, **terracotta** accent (§E), NOT the legacy palette.

**Aesthetic (from the "Shot on iPhone B&W" reference, toned down one notch per Jed):**
- Masonry, tight gutters, **no borders/shadows**, image is the hero.
- **Micro-animations, dialed calmer:** fade + rise **~14–18px** (ref was 20–30) on scroll, `ease-out` **~700–800ms**, stagger **~30–50ms**; hover = **none or ≤1.02** scale + a whisper of warmth (not the ref's 1.05). Respect `prefers-reduced-motion` (instant, visible). No parallax, no lightbox at launch (images are quiet links). Awwwards restraint = negative space + rhythm, "the eye over the instrument."
- Captions: Courier-mono, uppercase, low-opacity, bottom-left.
- **Assets:** the 8 real shots at `katha-booking-html/assets/portfolio/` → copy to `photobooth-template-studio/public/assets/portfolio/`. Data = a static `portfolio` array (mirror `content.json.portfolio`); Phase 2 = Supabase `portfolio_items` table.
- Reuse the studio's existing GSAP/IntersectionObserver reveal utilities; keep it a Server Component with a small client island for the reveal.
- **Re-proportion:** per Jed, tune slot/tile ratios to "favor us" — bias toward the formats we actually sell (2×6 strip, 4×6) and our best work; hero the strongest 2–3 shots larger in the masonry.

---

## D. LAYOUT SYSTEM CLEANUP (`lib/layouts.js` + `lib/templates.ts`)

Grounded in the real-world reference (rjrphotography Layouts A–M) + the client examples (Steven&Cristalyn 3-slot gold; Tracy&Prince 2-slot).

- **Kill the knalum 3-vertical-tall:** `katha-knalum-night` currently maps to a 3-tall arrangement that "doesn't real-world work." Re-map the knalum family to a proven arrangement (a **2-slot** strip/vertical or a landscape), or retire the 3-tall variant. Update `templates.ts` preset `layoutId`s + the `renderDecorativeSvg` `case "katha-knalum-night"` + the landscape/sq variants (lines ~1194–1257, 1400–1447, 1612).
- **Fix slots that don't exist / don't hold up:** audit every `LAYOUTS` entry against real print viability (the reference sheet). Remove/repair arrangements that render but aren't real-world (e.g., over-tall 3-stacks on a strip where photos become letterbox slivers). The **whitespace/text-band law** in `layouts.js` (validate-layout.js gate) stays the arbiter.
- **Re-proportion to favor us:** adjust slot rectangles so our default templates flatter the sold formats (2×6 strip w/ generous portraits; 4×6 2-slot like Tracy&Prince with proportioned whitespace framing — exactly the "balanced 2-slot" the Tracy&Prince email describes). Bias defaults (`DEFAULT_LAYOUT`) toward these.
- **Add the missing real-world arrangements** from the A–M reference where we lack them (e.g., a clean 4×6 2-slot with art-deco framing for the gold-frame look). Data-only additions to `LAYOUTS` — no render-code changes (per the layouts.js contract).

---

## E. TERRACOTTA — replace Loko Rust

- **Swap the sacred accent** `--color-katha-loko-rust: #8C382A` → **warm terracotta**. Target already exists: **`--color-katha-terracotta-earth: #A35C44`** (or tune warmer, e.g. `#B5654B`). Roasted-Archive equivalent: replace Achuete `#9A3D2A` → the same terracotta in `content.json.tokens.loko`, `design.html`, and the PRD.
- **Method (safe):** repoint the token, not every call-site — make `--color-katha-loko-rust` *alias* terracotta (or find/replace the var) in `photobooth-template-studio/app/globals.css`; update the Roasted-Archive `--loko`/`--color-loko` in `content.json`, `design.html`, PRD §4.1. Keep "sacred CTA-only" usage rule.
- Regenerate any templates whose decorative SVG hardcodes `#8C382A` (grep `templates.ts` for the hex).

---

## EXECUTION ORDER
1. **§A config now** (agy pin + obsidian swap + POC typo). Jed: GCP computer-use enable + pick Copilot GLM-5 backend + restart CC.
2. **§E terracotta** (small, global, unblocks the look).
3. **§C /gallery** build (calmer reveal, terracotta, real photos).
4. **§D layout cleanup** (knalum + re-proportion + missing arrangements).
5. **§B font foundry** (pipeline + launch faces 1–5, incl. Tracy&Prince) → expand to 15.

## VERIFY
- Orchestration: `bash .agents/skill-tiers/scripts/council.sh <id> <file>` runs with agy=2.5 Pro; codex qwen2.5; copilot GLM-5 answers a terminal prompt. Obsidian MCP returns vault notes after restart.
- Gallery: `npm run dev` in photobooth-template-studio → `/gallery` renders the 8 shots, calm reveal, terracotta accent, reduced-motion safe, mobile 375px.
- Fonts: a preset using a Katha face renders it self-hosted (no CDN), OFL.txt present.
- Layouts: `npm run guard` (validate-layout.js) passes; knalum no longer 3-tall; defaults favor 2×6/4×6.
