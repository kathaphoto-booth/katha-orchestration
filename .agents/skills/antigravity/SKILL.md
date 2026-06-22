---
name: antigravity
description: Leak-proof delegation to the agy CLI with a deterministic, non-LLM verification gate. Use when CC should hand bulk agentic work (multi-file edits, scaffolding, refactors) to Antigravity (agy) and must verify the result before trusting it — i.e. whenever you would otherwise take a CLI's "done" on faith. Routes execution to agy (sandboxed, per-run isolated), verifies via verdict.sh (truth computed from git, never from agy's self-report), and rolls back transactionally on any leak. NOT for fast opinion/critique — use the gemini+codex council for that.
allowed-tools: [Bash, Read, Write]
---

# /antigravity — Leak-Proof Delegation

CC designs and judges; bulk agentic execution is delegated to `agy`; a
**deterministic harness — never CC's reasoning — decides PASS/FAIL.** The digest
agy returns is a manifest of *claims*, never trusted as truth. The source of
truth is `git` (via `verdict.sh`). A mismatch between claim and git reality is a
**leak → reject, roll back, do not promote to HAM.**

This was hardened by the 3-distinct-CLI council + a 5-lens adversarial pass that
killed the v1 design; the 8 surviving attacks are the TDD suite. Full design:
`docs/superpowers/specs/2026-06-22-orchestration-layer-design.md`. Build plan +
task status: `docs/superpowers/plans/2026-06-22-orchestration-layer-v1.md`.

## Two delegation paths (distinct, do not conflate)
- **Agentic execution → `agy`** (heavy, token-bound, writes files). Slow: it spins
  a full agent harness. Use only for genuine bulk work, never as a "fast voice."
- **Multi-model consultation → council** (`gemini` Vertex + OSS `qwen2.5-coder`).
  Read-only opinion / peer review. CC (Opus) is chairman. `agy` is NEVER a council
  voice on its own output (executor ≠ critic; council-confirmed conflict of interest).

## The loop (scripts in `scripts/`)
1. `checkpoint.sh snapshot <run> <repo> <vault>` — capture repo HEAD + vault
   (inbox.md + handoff/) so the whole transaction is reversible.
2. `delegate_agy.sh --repo <repo> --run <run> --brief <task>` — sandboxed agy,
   per-run state under `.orchestration/<run>/`, completion judged by the
   `STATUS: COMPLETE` transaction sentinel (not exit code). On failure it
   preserves WIP via a **scoped** stash (never `reset --hard`, never a blanket
   `stash -u` that would sweep the repo's unrelated untracked files).
   (The existing `scripts/agy-tier-run.sh` is the live brief→result.md executor,
   now also `--sandbox` + sentinel-gated.)
3. `verdict.sh --repo <repo> --digest <run>/digest.json --gate fast` — computes
   the changed-set from git, fails on any unclaimed change (leak) or any declared
   `external_effects[]`, runs the gate, writes `.verdict.json`. **CC READS it,
   never writes it.**
4. `authority-guard.sh <run>/result.md` — rejects agy-authored text asserting a
   human-authority decision ("Jed approved X"); agy is not a canon witness.
5. `self_eval.sh record --run <run> --repo <repo> [--tokens N]` — append an honest
   ledger entry graded against git-truth: `honest:false` whenever the run claimed
   `STATUS: COMPLETE` but the gate said FAIL (the overstatement failure mode,
   measured). Missing inputs recorded as null, never faked.
6. **PASS** ⇒ promote staged handoff, consolidate to HAM, run `handoff/sync.sh`.
   **FAIL** ⇒ `checkpoint.sh rollback <run> <repo> <vault>`; log the leak; nothing
   reaches HAM.

## Self-improvement loop (honest, deterministic)
`self_eval.sh report --repo <repo>` aggregates the ledger: pass rate, **honesty
rate**, **Token-to-Diff** (tokens/line — surfaces slop/stalling briefs), and
recurring leak reasons. It emits `→ graduate:` flags when a dishonest run or a
3×-recurring leak appears. Graduation = CC writes a RED test reproducing it (via
`/test-driven-development`) + tightens a verdict/authority rule + refines the
brief (`/senior-prompt-engineer`). So the suite gets stricter every cycle — the
system grades itself against git, never its own word. (Adversarially reviewed
2026-06-22; v2 defense-in-depth: a `.verdict.json` provenance check — currently
mitigated by agy's `--sandbox` write-lockout.)

## Write boundaries (§ Thor's Hammer)
agy may write only `inbox.md` (append) + `handoff/`. Canon nodes
(`decisions.md`, `patterns.md`, `SESSION_HANDOFF.json`) require a `PROPOSAL:` to
`inbox.md` and pause for Jed/CC approval. Irreversible external effects
(Supabase migration/SQL, Vercel deploy, email) are CC-only, pre-gated — never in
agy's sandboxed toolbelt.

## Tests
`bash .agents/skills/antigravity/tests/run.sh` — the adversarial attacks ARE the
suite. Must end `FAIL=0`.

## Known infra constraints (2026-06-22)
- Council wrappers need the Vertex env (`GOOGLE_GENAI_USE_VERTEXAI/PROJECT/LOCATION`
  from `~/.zshrc`) loaded; a non-interactive shell that lacks it silently falls
  back to a broken consumer tier. Export the three vars before invoking gemini.
- No `timeout`/`gtimeout` on PATH → wrappers run their CLI unbounded. agy
  self-bounds via `--print-timeout`; the `codex` CLI does not and currently
  stalls — route the OSS voice via the Ollama API until that wrapper is fixed.

## Deferred to v2
§5 reader/verifier model split + Opus tiering · §6 differential/active-recall
human approval · §7 vault-fsck hash-chain + per-line canon provenance · full
git-worktree-per-run isolation (the per-run `.orchestration/<run>/` state dir is
the v1 floor).
