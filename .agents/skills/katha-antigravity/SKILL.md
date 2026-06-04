---
name: katha-antigravity
description: The CC → AG bridge protocol. Use whenever Claude Code (CC) needs to delegate work to Antigravity (AG), or when AG receives a task from CC, or when wrapping AGY SDK scripts with Katha brand context. Triggers on "delegate to AG", "antigravity", "send to Gemini", "AG pipeline", or any task routing between CC and AG. Ensures the 11-token palette, Two-Tier rule, and vocabulary constraints are pre-injected into every AG prompt.
---

# Katha Antigravity — The CC ↔ AG Bridge

## Why This Exists

CC and AG run on different model platforms with different context windows and different boot sequences. When CC delegates a task to AG without pre-injecting brand constraints, AG improvises — and its improvisation may include `#000000`, Cormorant Garamond, or the word "keepsake." This skill defines the context package that must accompany every delegation, and the validation gate AG's output must pass before CC accepts it.

## Type: Flexible

Adapt the context package to the task. A CSS injection task needs the full palette. A research task needs the phase position but not the typography rules. Use judgment, but when in doubt, include more context rather than less.

## The Delegation Flow

```
CC prepares context package
  → CC sends task + package to AG
    → AG executes within constraints
      → AG returns output
        → CC validates output against katha-verify
          → CC presents to Jed (or rejects and re-routes)
```

## CC → AG: The Context Package

Before delegating any task to AG, CC must assemble and include:

### Always Include (Every Delegation)
1. **Current phase position** — from `SESSION_HANDOFF.json` (`checkpoint` field)
2. **The 11-token palette** — all hex codes, with the rule: no pure `#000`, no pure `#fff`, no legacy OAX
3. **The forbidden word list** — "keepsake", "handloomed", "heirloom artistry", "raw silk", "golden moments", "capture memories", "magic", "magical"
4. **Tooling constraint** — `chrome-devtools-mcp` only, never `oax-audit-monster`

### Include When Task Touches UI/HTML/CSS
5. **Typography mandate** — Fraunces (display), EB Garamond (narrative), Inter (utility). No Cormorant, no Italiana
6. **The Two-Tier Rule** — Katha Signature presets (id `^katha-`) held to palette + Fraunces; Classic presets exempt
7. **Layout physics** — Asymmetric Void (`12rem` padding), Calado grid, L-Frame positioning
8. **Anti-patterns** — no `sepia()`, no party tropes, no generic CSS wrappers, no `border-radius` on cards

### Include When Task Touches Copy/Voice
9. **Voice rules** — Peer executive, direct, confident. No sentimentality, no reflected-praise
10. **The $10K vocabulary** — specify the craft, don't claim luxury. See `reference_high_ticket_selling_pitch.md`

## AG → CC: The Output Contract

AG must return output that satisfies:

1. **No forbidden hex** — grep for `#000000`, `#ffffff`, `#0a0806`, `#bf9d2c`, `#c4c1b8`. Zero matches required.
2. **No forbidden words** — grep for the banned vocabulary list. Zero matches required.
3. **No forbidden fonts** — grep for `Cormorant`, `Italiana`. Zero matches required.
4. **Evidence attached** — per `katha-verify`, AG cannot claim "done" without cited proof.

## CC Validation Gate

When CC receives AG's output:

```bash
# Hex audit
grep -rni '#000000\|#ffffff\|#0a0806\|#bf9d2c\|#c4c1b8' <output_files>

# Vocab audit  
grep -rni 'keepsake\|handloomed\|heirloom artistry\|golden moments\|capture memories' <output_files>

# Font audit
grep -rni 'cormorant\|italiana' <output_files>
```

If **any** grep returns matches: **block the output**. Do not persist to the catalog, do not present to Jed. Report violations and re-route.

If zero matches on all three: run `npm run guard:templates` (if touching template studio) and proceed.

## AG's Boot Obligations (Already Enforced via GEMINI.md)

AG's own boot sequence reads these Vault files in order:
1. `SESSION_HANDOFF.json` — current state
2. `project_katha_booth.md` — full project context
3. `MEMORY.md` — knowledge node index

This skill does not replace AG's boot — it supplements it by ensuring CC also pre-injects the critical constraints that AG might miss if it boots from a compacted context.

## Relationship to Other Skills

- `katha-protocol` provides the constraint data this skill packages
- `katha-verify` provides the validation gate this skill enforces
- `katha-workflow` Step 3 invokes this skill when delegation is needed
