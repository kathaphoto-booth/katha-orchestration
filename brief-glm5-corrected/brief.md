# GLM-5 CORRECTION BRIEF — Zenith Pipeline One-Shot (Palette Enforced)

## CRITICAL CORRECTION

Your previous output (the "ATELIER Vanguard Edition") was rejected because you replaced the entire brand palette with your own invention (Alabaster `#FBFBF9`, Emerald `#043927`, IvyMode, Proxima Nova). That is NOT the project aesthetic.

**This project uses a MOODY, HIGH-CONTRAST, DARK Filipino heritage look.** Not bright. Not airy. Not green. Dark ebony voids with warm ecru light and rust-red accents. Think cinematic darkroom, not Scandinavian minimalism.

## MANDATORY DESIGN TOKENS (DO NOT OVERRIDE)

### Palette
| Token | Hex | Role |
|---|---|---|
| Kamagong (Deepest Ebony) | `#110F0D` | **THE** base background — macro void, body bg, hero sections |
| Dark Abacá | `#1A1714` | Intermediate shadow, card surfaces |
| Kape | `#241F1B` | Elevated surfaces, form containers, date gate |
| Lifted Surface | `#2E2722` | Hover states, active surfaces |
| Piña Ecru | `#E8E1D3` | **THE** primary light / text color / ink |
| Rattan | `#A39B8E` | Body text, secondary text, italics |
| Capiz Slate | `#857D71` | Meta text, timestamps, labels |
| Muted Outline | `#5C554C` | Borders, dividers, subtle lines |
| Achuete / Vigan Brick | `#9A3D2A` | **THE** accent color — CTAs, focus rings, active states |
| Thread Line | `rgba(232,225,211,0.08)` | Subtle border overlays |

### Typography
| Role | Font | Notes |
|---|---|---|
| Display / Headlines | `FH Ronaldson Display Test` | The serif display face. NOT IvyMode. NOT Playfair. |
| Body / UI | `Outfit` | Clean geometric sans. NOT Proxima Nova. |
| Metadata / Stamps | `Courier Prime` | Monospace for plate numbers, dates, uppercase tracked labels |

### Design Directives
- **NO bright/light backgrounds.** The macro background is `#110F0D` (near-black).
- **NO green accents.** The accent is `#9A3D2A` (Achuete rust-red).
- **Moody contrast:** Piña Ecru (`#E8E1D3`) text on Kamagong (`#110F0D`) base.
- **No Wabi-Sabi language in outputs.**

## YOUR TASK

Take your previous structural architecture (which was excellent) and rebuild it with the CORRECT tokens above. Specifically:

### 1. Rewrite the React component blueprint
- Keep your Double-Bezel card concept BUT re-skin with dark tokens:
  - Outer bezel: `rgba(232,225,211,0.06)` border, `#1A1714` background
  - Inner core: `#241F1B` background, subtle `rgba(232,225,211,0.04)` inset shadow
- Keep your Editorial Split layout BUT with dark columns:
  - Left col: `#110F0D` background
  - Right col: `#1A1714` background
- Keep Magnetic Button BUT: `background: #9A3D2A` (Achuete), text `#E8E1D3`
- Keep Frictionless Inputs BUT: bottom border `#5C554C`, focused border `#9A3D2A`, label color `#857D71` → `#E8E1D3` on focus
- All text: `#E8E1D3` primary, `#A39B8E` secondary, `#857D71` meta

### 2. Rewrite the CSS
- `body { background: #110F0D; color: #E8E1D3; }`
- Font imports for FH Ronaldson, Outfit, Courier Prime
- Orchestral weave SVG strands: stroke `rgba(232,225,211,0.06)`, animate subtly
- Entry choreography: keep your `cinematic-fade-up` with blur(8px) → 0

### 3. Full booking pipeline flow
- Date availability gate → form reveal → lead capture → confirmation
- Server action integration with Supabase `leads` table
- Must include the complete state machine (gateDate → gateStatus → lead → confirmed)

### 4. Email template (HTML for Resend)
- Deep Kamagong background (`#110F0D`)
- Piña Ecru text (`#E8E1D3`)
- Achuete accent highlights (`#9A3D2A`)
- Courier Prime tracked metadata
- Must look like an exclusive editorial confirmation, not a generic receipt

### 5. SEO / AIO
- JSON-LD LocalBusiness schema for Katha Photo Booth
- OpenGraph meta tags
- Semantic HTML5 elements
- Service area: Southern California

### 6. Playwright test specs
- Keep your TDD specs from the previous output, adapted for dark palette assertions

## OUTPUT FORMAT

Write the COMPLETE implementation to `result.md` — all React components, all CSS, all email HTML, all server actions, all SEO metadata, all test specs. One file, one shot. End with `STATUS: COMPLETE`.
