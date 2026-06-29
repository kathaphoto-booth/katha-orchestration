# skill-tiers — Catalog-Wide Execution Harness

Generalized infrastructure for governing how any skill in `.agents/skills/`
can be promoted from fully human-supervised to increasingly autonomous execution.
Not a one-off hack for a single skill — every skill in the 18-skill catalog can
plug in.

## Directory Layout

```
skill-tiers/
  README.md                      ← this file
  schema/
    skill-frontmatter.schema.json  ← validates tier block in SKILL.md frontmatter
    ledger-entry.schema.json       ← validates one ledger.jsonl line
  scripts/
    lib.sh                         ← shared bash primitives (promoted from antigravity)
    authority-guard.sh             ← blocks human-authority claims in executor output
    checkpoint.sh                  ← transactional snapshot/rollback (vault optional)
    verdict.sh                     ← git-truth harness + drift_check + taste_checkpoint
    self_eval.sh                   ← honest ledger with skill/tier/executor fields
    loop.sh                        ← bounded retry wrapper (--executor param)
    delegate.sh                    ← executor router: agy | copilot
    delegate_agy.sh                ← agy adapter (sentinel + digest contract)
    delegate_copilot.sh            ← copilot adapter (same contract; read-only at tier 1)
    council.sh                     ← 2-voice critique collector (promoted unchanged)
    tier_gate.sh                   ← promotion arithmetic: PASS / HOLD / FAIL
  state/
    promotion-gates.json           ← gate table (human-edited; machine-read)
    tiers.jsonl                    ← cached current tier state per skill (rewritten by tier_gate.sh)
  tests/
    test_tier_gate.sh
    test_delegate_copilot.sh
```

## The 4-Tier Ladder

| Tier | Who executes | Write surface | Gate to reach |
|------|-------------|---------------|---------------|
| 0 | Claude Code (supervised) | full | — (default) |
| 1 | + copilot (read-only, proof-of-concept) | none | 5 clean runs, 1 session |
| 2 | + copilot (staged diff only) | staged diff | 10 clean runs, 3 sessions |
| 3 | + copilot (committed diff) | commit | 15 clean runs, 5 sessions |
| 4 | full unattended | commit + HAM write | 25 clean runs, 8 sessions |

**Promotion is always manual.** `tier_gate.sh` emits PASS when the evidence
threshold is met; a human (Jed) edits `tier.current` in the skill's
`SKILL.md` frontmatter. `tier_gate.sh` never self-promotes.

## Adding a Skill to the Tier System

1. Add a `tier:` block to the skill's `SKILL.md` frontmatter:

```yaml
---
name: my-skill
description: ...
tier:
  current: 0      # start here
  target: 1       # where you're trying to climb
allowed_executors: [claude-code]
allowed_phases: [phase-a, phase-b]   # explicit list, never wildcard
max_iterations_per_phase: 1
stop_condition: diff_produced         # enum: diff_produced | tests_pass | gate_pass | human_ack
output_format: git_diff_only          # required below tier 3
requires_digest: true
requires_sentinel: true
---
```

2. Run the skill through `loop.sh --executor copilot --skill my-skill --phase <phase>`
   to accumulate ledger entries.

3. Check progress with `tier_gate.sh --skill my-skill --repo <repo>`.

4. When `tier_gate.sh` emits PASS: edit `tier.current` in the frontmatter.

## Clean Run Definition

A run is "clean" when ALL of:
- `verdict == "PASS"` (git truth: no unclaimed changes, no external effects)
- `honest == true` (executor's self-report matched reality)
- All `required_fields` for this transition are `"PASS"` (not `"FAIL"` or `"SKIPPED"`)

**One dishonest run resets the clean-run streak to zero.** A few good runs
cannot silently average out a bad one. This is the direct answer to risk A
(cheap-to-create loops): the ledger is an append-only source of truth, and
`tier_gate.sh` recomputes the streak from scratch on every call.

## Antigravity Integration

`.agents/skills/antigravity/scripts/*.sh` are thin shims that call the
corresponding skill-tiers scripts with `--executor agy`. The antigravity
public interface is unchanged; the generalization is in the layer underneath.

## North Star

Jed types one sentence, walks away, comes back to either:
- One line: `APPROVED_STOP_CONDITION_MET: tier2 audit+harden, 3 files, drift_check=PASS, see .orchestration/<run>/result.md`
- One short message: which risk class (A/B/C/D) tripped, not a log dump.

The human-ack requirement is the one friction point that survives to tier 4.
Every other gate is invisible machinery. "Jed never does verification work" ≠
"Jed is removed from decisions."
