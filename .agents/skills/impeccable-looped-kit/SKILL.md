---
name: impeccable-looped-kit
description: End-to-end automated impeccable designing workflow based on impeccable.style. Orchestrates the four-phase Impeccable loop (Start, Iterate, Polish, Maintain) to produce 80%+ complete, stress-tested frontend features without hallucinations. Trigger when the user wants a complete, robust, polished frontend design process or a looped kit workflow.
tier:
  current: 0        # 0 = manual/Claude Code supervised only. Jed edits this field to promote — never automated.
  target: 1         # currently accumulating evidence for tier 1 (read-only copilot proof-of-concept)
allowed_executors: [claude-code]
allowed_phases: [init, shape, craft, typeset, layout, colorize, animate, critique, audit, clarify, harden, extract, document]
max_iterations_per_phase: 1
stop_condition: diff_produced
output_format: git_diff_only
requires_digest: true
requires_sentinel: true
---
# Pointer: impeccable-looped-kit

The canonical instructions for this skill have been migrated to the vault to optimize prompt tokens.
You MUST load and read the full instructions dynamically using your file-read tools before executing this skill:
- Vault Path: `/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory/skills/impeccable-looped-kit/SKILL.md`
