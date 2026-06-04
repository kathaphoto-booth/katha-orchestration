---
name: katha-workflow
description: The 5-step Katha execution discipline for any major task. Use whenever the user starts a new feature, page, component, architectural change, or says "workflow", "let's build", "start", "new feature", "implement". Prevents agents from jumping straight to code by enforcing Brainstorm → Spec → Skills → Execute → Verify. Also triggers when an agent is about to write code without having brainstormed first.
---

# Katha Workflow — The 5-Step Execution Loop

## Why This Exists

Agents default to writing code immediately. For a $10K brand with strict aesthetic constraints, that produces drift — colors that are close-but-wrong, layouts that violate the Asymmetric Void, copy that uses forbidden words. This skill forces a deliberate sequence that catches violations before they're built, not after.

## Type: Rigid

Follow these 5 steps in order. Do not skip to Step 4 (Execute) without completing Steps 1-3.

## The 5 Steps

### Step 1: Brainstorm

Load context before generating ideas.

1. Invoke `katha-protocol` to load brand constraints (palette, voice, typography, layout physics)
2. Read current `SESSION_HANDOFF.json` to understand the active phase and roadmap position
3. Identify what needs to be built
4. Surface open questions and design decisions
5. **Output:** A written brainstorm with design rationale — not just a task list, but *why* each decision serves the brand

The brainstorm exists to catch bad ideas before they become bad code. If the brainstorm reveals a palette violation or a layout that contradicts the Asymmetric Void, it's caught here — not during a post-build audit.

### Step 2: Spec

Define the exact deliverables and acceptance criteria.

1. List every file to create or modify (with full paths)
2. Define what "done" looks like — concrete, verifiable criteria (not "looks good")
3. If delegating to AG: prepare the context package per `katha-antigravity`
4. If touching UI: note which `katha-impeccable` checks will apply
5. **Output:** Implementation spec with file list and acceptance criteria

### Step 3: Skills

Check which other skills apply to this task. Invoke them *before* executing.

| If the task involves... | Invoke... |
|---|---|
| Brand-touching output (HTML, CSS, copy) | `katha-protocol` |
| Delegating work to AG | `katha-antigravity` |
| UI/layout changes | `katha-impeccable` |
| Session end or milestone | `katha-memory` |
| Any "done" claim | `katha-verify` |

Log which skills were invoked. If none apply (rare), state why.

### Step 4: Execute

Build the thing.

1. Write code, generate assets, inject CSS — whatever the spec calls for
2. Follow `katha-protocol` constraints at every step
3. Reference the spec from Step 2 — don't improvise beyond it without updating the spec
4. **Output:** Working implementation matching the spec

### Step 5: Verify & Save

Prove the work is done and persist the state.

1. Invoke `katha-verify` to produce evidence (terminal output, screenshots, audit scores)
2. If this completes a milestone or phase: invoke `katha-memory` to sync all 9 handoff files
3. Update the task checklist (mark items complete)
4. **Output:** Evidence log + updated system memory

## When to Use the Full Loop vs. a Partial Loop

| Scope | Steps Required |
|---|---|
| New page, new component, architectural change | All 5 steps |
| Bug fix with clear cause | Steps 4-5 only (execute + verify) |
| Copy change or color tweak | Steps 1, 4-5 (quick brainstorm + execute + verify) |
| Research / investigation | Step 1 only (brainstorm) |

The user can explicitly override: "skip the brainstorm, just fix it." Honor that. But if no override is given, default to the full loop.

## Relationship to Other Skills

This skill orchestrates the others. It doesn't own brand law (`katha-protocol`), validation (`katha-verify`), or memory (`katha-memory`) — it sequences them.

```
katha-workflow
  ├── Step 1 reads → katha-protocol
  ├── Step 3 invokes → katha-protocol, katha-antigravity, katha-impeccable
  ├── Step 5 invokes → katha-verify
  └── Step 5 invokes → katha-memory
```
