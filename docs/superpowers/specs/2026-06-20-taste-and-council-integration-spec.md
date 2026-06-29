# Spec: The "Impeccable Audit Loop" (Taste & Council Integration)

## 1. Executive Summary
This document defines how the `taste-skill` and `llm-council-plugin` interact within the Katha Booth orchestration layer (CC + AG). The core objective is to achieve the **highest possible quality at a moderate, sustainable velocity**, ensuring no unpolished or asymmetric UI reaches the Batman node (Jed).

## 2. Council Debate Summary (Simulated Synthesis)
During the initialization of this spec, the theoretical LLM Council debated three models of integration:
- **Model A (The Escalation Protocol)** prioritized raw speed, running plugins only at milestones.
- **Model B (The Gatekeeper)** placed the burden heavily on CC to pre-plan all aesthetics.
- **Model C (AG Self-Audit)** required Antigravity to autonomously loop its own UI code through the Taste plugin before submitting it.

**Resolution:** Model C won consensus. The Council ruled that forcing the Execution Agent (AG) to run its own `taste-skill` audit removes the bottleneck from CC. The Council plugin itself will be reserved exclusively for "Tier 3" architectural disputes where CC and AG cannot reach an immediate solution.

## 3. Detailed Architecture

### The Taste Skill (`taste-skill`)
The `taste-skill` is now defined as an autonomous UI gating mechanism. 
**Trigger:** AG must execute the `taste-skill` command immediately after any CSS/JSX change to a visual component, prior to marking the task as `[x]` in the ledger.
**Constraints Enforced:**
- Perfect geometric symmetry (no wabi-sabi, no deckled edges, no organic flows).
- Strict adherence to the `Playfair Display` and `Hanken Grotesk` font stacks.
- Padding and margin mathematically balanced on X/Y axes.

### The LLM Council (`council-orchestrator`)
The `llm-council-plugin` serves as the Supreme Court for Katha Booth.
**Trigger:** Invoked automatically by CC or AG when a task hits a blocked state for >10 minutes, or when a major structural refactor is proposed.
**Output:** The Council produces a `final_report.md` synthesizing the opinions of Claude, Codex, and Gemini, providing a unified architectural verdict that CC and AG must follow without further debate.

## 4. Final Recommendation & Implementation Guidance
- **Phase 1:** AG will complete the current task (rebuilding the Studio UI to remove wabi-sabi and enforcing symmetry).
- **Phase 2:** Once the code is written, AG will manually apply the `taste-skill` criteria to verify absolute symmetry.
- **Phase 3:** The code will pass the `/vibecode-production-qa-validator` checklist.

No completion claims will be made until this loop is successfully closed.
