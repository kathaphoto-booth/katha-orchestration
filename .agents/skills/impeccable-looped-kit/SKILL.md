---
name: impeccable-looped-kit
description: End-to-end automated impeccable designing workflow based on impeccable.style. Orchestrates the four-phase Impeccable loop (Start, Iterate, Polish, Maintain) to produce 80%+ complete, stress-tested frontend features without hallucinations. Trigger when the user wants a complete, robust, polished frontend design process or a looped kit workflow.
---

# Impeccable Looped Kit Workflow

This skill automates the entire "Impeccable" frontend design loop as defined by `impeccable.style/designing`. It provides a proven, stress-tested workflow for designing features, components, and pages.

**The Mandate:** All outputs must meet the standard of **general front-end, quiet luxury, timeless, Awwwards-competitive designs** for both mobile and desktop. Do not settle for basic SaaS layouts.

## The Core Loop (4 Phases)

When invoked for a design task, execute these four phases systematically. NEVER skip the `init` phase.

### 1. Start (Context & Brief)
Before writing any code or generating designs, establish context.
- **`init`**: Run a short setup interview about the audience, lane, voice, and anti-references. Write the decisions to `PRODUCT.md`. If there's existing code to scan, offer a `DESIGN.md`. Every later command reads both files.
- **Lane Classification**: Determine if the task is **Brand** (landing pages, image-led, impression is the product) or **Product** (app UI, dashboards, semantic states, fluent density).
- **`shape`**: Draft a brand toolkit for review (identity, palette, type, applications).
- **`craft`**: Code toward a concrete high-fidelity mock instead of an abstract brief. 

### 2. Iterate (Refine & Explore)
Once the base is established, refine it.
- **Specific Disciplines**: Run specific commands when the edit has a name:
  - `/typeset`: Typography focus.
  - `/layout`: Structure and positioning focus.
  - `/colorize`: Palette focus.
  - `/animate`: Motion focus.
- **Tuning**: Run `/bolder` to bring a safe design to life, or `/quieter` to tone a shouting one down.
- **`live`**: When the edit is easier to point at, use the Live mode browser picker for visual exploration side-by-side.
- **`/critique`**: Ask the engine "is this any good?"

### 3. Polish (The Pre-Ship Gauntlet)
Three commands before anything ships. Run on a narrow target (e.g., one section).
- **`/audit`**: Score the output (0 to 4) on five dimensions: accessibility, performance, theming, responsive behavior, and anti-patterns. Findings tagged P0 to P3.
- **`/clarify`**: Rewrite copy, labels, error messages, and microcopy to match the voice established in `PRODUCT.md`.
- **`/harden`**: Stress-test reality. Test against 60-character names, German product titles, prices in the billions, 500 errors, and offline states.

### 4. Maintain (Design Debt & Consistency)
Ensure the design system doesn't drift.
- **`/extract`**: Consolidate drift. Find patterns used three or more times with the same intent and propose tokens/primitives.
- **`/document`**: Re-capture the system. Scan tokens, components, and rendered routes, then write a `DESIGN.md` in the Stitch format to reflect the actual language, rather than guessing.

## Surfaces and Anti-Patterns
- **CI/CD Gate**: `npx impeccable detect src/` can be run to fail builds when design slop slips into a PR.
- **Chrome Extension**: Use the Chrome extension to check competitor sites or staging environments.
- **Anti-Pattern**: Do NOT run Anthropic's legacy frontend-design skill simultaneously, as they collide on vocabulary.
- **Anti-Pattern**: Do NOT skip `init`. Commands run without `PRODUCT.md` and `DESIGN.md` will default to generic SaaS patterns.
- **Anti-Pattern**: Treat it as an opinionated design partner, not just a validator. Push back with reasoning if you disagree.

## Automation Execution
If the user asks to "automate the whole kit process", run through these phases autonomously. Start by creating `PRODUCT.md`, define the lane (Brand vs Product), create the visuals, write the component, run the audit, harden it, and document the final design tokens.
