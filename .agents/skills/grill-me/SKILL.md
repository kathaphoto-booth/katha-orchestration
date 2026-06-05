---
name: grill-me
description: Pre-brainstorm adversarial interview. Run this BEFORE superpowers:brainstorming on any feature, design, spec, or refactor. Forces resolution of the decision tree before any design work begins. Rigid — do not skip steps.
---

# Grill Me — Pre-Brainstorm Decision Gate

**Type: Rigid.** Do not adapt or abbreviate. This gate exists because unexamined assumptions survive into implementation and rot there.

## The Protocol

Ask these questions ONE AT A TIME. Wait for a real answer before the next. Do not summarize or move on until each question is genuinely resolved. If an answer reveals a blocker, stop and surface it — do not paper over it.

### Round 1 — The Problem
1. What specific problem are we solving? (Not the solution — the problem.)
2. Who experiences this problem and when? (Be specific — "Jed when booking" not "users".)
3. What's the cost of NOT solving it this week?

### Round 2 — The Constraint Audit
4. What have we already tried that didn't work? Why didn't it work?
5. What are the three most likely ways this breaks in production?
6. What's the simplest version that would prove the idea works? (Force a smaller scope.)

### Round 3 — The Anti-Scope
7. What are we explicitly NOT building? (Name at least two things.)
8. Which other systems does this touch? (DB schema, Vercel env, Squarespace injection, HAM memory, AG handoff?)
9. Does this need AG? If yes, what's the handoff artifact and path in `.memory/handoff/`?

### Round 4 — The Success Gate
10. How will we know this is done? (Name a specific, observable check — not "it feels right".)
11. What's the one thing that could make this a mistake in 6 months?

## Output

After all 11 questions are answered, produce a **Decision Record** (3–5 bullets):

- What we're building and why
- What we're NOT building
- The riskiest assumption
- The success check
- Handoff path (if AG is involved, per katha-protocol §10)

This record is the direct input to `superpowers:brainstorming`. Do not invoke brainstorming without it.

## Relationship to Other Skills

- Feeds into `superpowers:brainstorming` (the Decision Record is the brief)
- If the session prompt is thin, pair with `stitch-utilities:enhance-prompt` first to sharpen it before starting Round 1
- Reads katha-protocol §8–9 for delegation and evidence discipline
