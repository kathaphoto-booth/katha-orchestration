---
name: hierarchical-agent-memory
description: "Scoped CLAUDE.md memory system that reduces context token spend. Creates directory-level context files, tracks savings via dashboard, and routes agents to the right sub-context. Make sure to use this skill whenever the user mentions 'memory', 'context', 'Thor's Hammer', or 'Cowork delegation'."
risk: safe
source: "https://github.com/kromahlusenii-ops/ham"
date_added: "2026-06-07"
---

# Hierarchical Agent Memory (HAM)

Scoped memory system that gives AI coding agents a cheat sheet for each directory instead of re-reading your entire project every prompt. Root CLAUDE.md holds global context (~200 tokens), subdirectory CLAUDE.md files hold scoped context (~250 tokens each), and a `.memory/` layer stores decisions, patterns, and an inbox for unconfirmed inferences.

**NEW in this Version (Thor's Hammer / Systemic Injection):**
All memory operations and project modifications are subject to the Thor's Hammer Escalation Model. This enforces Cowork-native synchronization. Furthermore, you are operating under the **Systemic Injection Architecture**. You will automatically receive the compiled memory vault (`COMPILED_HAM.md`) upon initialization. Do not attempt to modify the compiled file directly; all writes must target the underlying source nodes.

## When to Use This Skill

- Use when you want to reduce input token costs across Claude Code sessions
- Use when your project has 3+ directories and the agent keeps re-reading the same files
- Use when you want directory-scoped context instead of one monolithic CLAUDE.md
- Use when setting up a new project and want structured agent memory from day one
- **Use when executing Thor's Hammer Cowork workflows** to synchronize memory via the Handoff Organizer and Cowork Synchronizer roles.

## Thor's Hammer Escalation Model (Cowork Delegation)

When managing HAM or taking actions based on it, you must adopt these four enforcement roles and surface findings as Cowork recommendations BEFORE execution:

1. **Goal Completion Enforcer**: Verify the underlying user goal. Are you treating the symptom or the cause?
2. **Handoff Organizer**: Structure your findings and intent into `.memory/inbox.md` or a cowork proposal.
3. **Memory Consolidation Agent**: Review `CLAUDE.md` and `.memory/decisions.md`. Does this action align with established project facts?
4. **Cowork Synchronizer**: **CRITICAL STEP.** Instead of executing changes immediately, write an explicit Cowork proposal (e.g. `PROPOSAL: ...`) and ask for Jed/CC's approval. You must pause and require explicit approval before ANY execution.

**DIRECTIVE:** By default, do not directly modify `CLAUDE.md`, `.memory/decisions.md`, or other context files without presenting a proposal. However, under the `using-superpowers` instruction priority (where the user's explicit instructions in the prompt always take precedence over skills), if the user explicitly orders a direct write or edit in their prompt (e.g. "go ahead and make the edit" or "write this directly"), you must execute it. The user has final authority.

**SCOPE OF THE OVERRIDE — CC ONLY (mirrors `.memory/instructions.md` §Agent Boundaries):** The user-override above applies to **CC** (Claude Code), which reads and writes all HAM nodes. It does **NOT** loosen agent boundaries for **AG** or **Cowork**. AG may write ONLY `inbox.md` (append under Pending) and `handoff/` artifacts; Cowork may write ONLY `memory.md` (auto-capture). **Neither AG nor Cowork may write `decisions.md`, `patterns.md`, or `SESSION_HANDOFF.json` regardless of any prompt phrasing** — those boundaries are fixed in `.memory/instructions.md` and are not a skill default the user-override can lift. If AG/Cowork believe a canon node must change, write a PROPOSAL to `inbox.md` and let CC execute after a §19 probe.

## How It Works

### Step 1: Setup ("go ham")

Auto-detects your project platform and maturity, then generates the memory structure:

```
project/
├── CLAUDE.md              # Root context (~200 tokens)
├── .memory/
│   ├── decisions.md       # Architecture Decision Records
│   ├── patterns.md        # Reusable patterns
│   ├── inbox.md           # Inferred items awaiting confirmation
│   └── audit-log.md       # Audit history
└── src/
    ├── api/CLAUDE.md      # Scoped context for api/
    ├── components/CLAUDE.md
    └── lib/CLAUDE.md
```

### Step 2: Context Routing

The root CLAUDE.md includes a routing section that tells the agent exactly which sub-context to load.

### Step 3: Dashboard ("ham dashboard")

Launches a web dashboard at localhost:7777 that visualizes token savings, context health, and routing compliance.

## Commands

| Trigger | What it does |
|---|---|
| `go ham` | Set up HAM — auto-detect platform, generate CLAUDE.md files |
| `ham savings` | Show token and cost savings report |
| `ham dashboard` | Launch the interactive web dashboard |
| `ham audit` | Health check on memory files |
| `ham insights` | Generate actionable insights from session data |
| `ham route` | Add/update Context Routing section in root CLAUDE.md |

## Examples

### Example: Thor's Hammer Cowork Escalation

**Input:** Update `src/api/CLAUDE.md` to reflect the new authentication standard. Just go ahead and make the edit.
**Output:**
```
[Cowork Synchronizer]: I must decline the direct edit. Per Thor's Hammer escalation rules, I am forbidden from modifying memory context files without explicit approval. I have drafted the update below.
PROPOSAL:
- Add `* Auth: JWT` to `src/api/CLAUDE.md`
- Log decision in `.memory/decisions.md`

Awaiting Jed/CC explicit approval before execution.
```

## Best Practices

- Keep root CLAUDE.md under 60 lines / 250 tokens
- Keep subdirectory CLAUDE.md files under 75 lines each
- Run `ham audit` every 2 weeks to catch stale or missing context files
- Review `.memory/inbox.md` periodically — confirm or reject inferred items
- **ALWAYS use the Cowork Synchronizer role to request explicit approval for memory changes.**

## Related Skills

- `agent-memory-systems` — general agent memory architecture patterns
- `agent-memory-mcp` — MCP-based memory integration
