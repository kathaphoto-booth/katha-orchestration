# BRIEF: Design Inspiration Agent

## 1. Core Identity & Directives
**Identity:** Threadline Cartographer & Wabi-Sabi Finalizer.
**Role:** This agent is responsible for taking raw layout blueprints (e.g., `pc-F`, `pc-G`) and conceptualizing them into high-fidelity "Finalized Expressions" (like the Steven & Cristalyn plate). 
**SDK Usage:** Built using the Google Antigravity SDK (`google-antigravity-sdk`), leveraging multimodal ingestion to "read" layout specs and output precise aesthetic choices.

## 2. Input Parameters
The agent receives:
- **Wireframe ID:** (e.g., `pc-K`)
- **Client Narrative:** (e.g., "A moody, intimate autumn wedding in a redwood grove")
- **Reference Photos:** (Optional mood board uploads from the client)

## 3. Workflow & Tools
Using the AGY SDK, the agent is equipped with the following custom tools:
- `apply_threadline_texture(canvas_color)`: Calculates the exact noise and grain parameters to simulate *Piña Ecru* or *Obsidian Weave*.
- `generate_foil_spec(metallic_type)`: Outputs the SVG filter coordinates for Rose Gold or Antique Gold stamping.
- `pair_typography(vibe)`: Selects the optimal combination of Katha-mandated display serif (**Fraunces**, SOFT 100, WONK 1) and clinical sans-serifs (Inter) to balance the grid. Never output Cormorant Garamond or Italiana for Signature presets — those are drift D1.

## 4. Expected Output (Structured)
The agent uses the SDK's `structured_output` feature (Pydantic schema) to return a reproducible JSON payload:
```json
{
  "canvas": "pina_ecru",
  "texture_opacity": 0.12,
  "foil_accent": "rose_gold_double_border",
  "typography": {
    "display": "Fraunces",
    "tracking": "0.05em",
    "caption": "Inter",
    "caption_tracking": "0.2em"
  },
  "justification": "The redwood grove setting requires warmth; the rose gold foil provides tension against the organic Piña Ecru texture, honoring the Threadline philosophy."
}
```

## 5. Validation Gate
CC (Claude Code) must validate this agent's output JSON against `npm run guard:templates` (in `photobooth-template-studio/`) before persisting to the catalog or emailing to the client. Any output containing legacy OAX tokens, forbidden hex, or non-Katha fonts is blocked. The palette tokens are locked in `DESIGN_SYSTEM.v2.md` §2; the font mandate is `Fraunces` for display, `Inter` for captions.

## 6. External Integrations
- **Squarespace API** — `SQUARESPACE_API_KEY` in `.env`. Read-only access to the reference storefront (Jed's brother's site) for design inspiration pulls: products, inventory, and page structure. AG may query this to extract layout patterns, product photography styles, and section ordering as input to the Finalized Expression pipeline.
- **Gemini API** — `GEMINI_API_KEY` in `.env`. Powers `scripts/katha_design_agent.py` and the Antigravity SDK structured output.

## 7. Deployment Strategy
This agent runs as a background process (invoked via webhook from the Next.js API route `/api/selection`). It intercepts the client's wireframe choice and instantly emails a rendered mockup of their "Finalized Expression" to both the client and Katha.
