---
name: antigravity
description: Leak-proof delegation to the agy CLI with a deterministic, non-LLM verification gate. Use when CC should hand bulk agentic work (multi-file edits, scaffolding, refactors) to Antigravity (agy) and must verify the result before trusting it — i.e. whenever you would otherwise take a CLI's "done" on faith. Routes execution to agy (sandboxed, per-run isolated), verifies via verdict.sh (truth computed from git, never from agy's self-report), and rolls back transactionally on any leak. NOT for fast opinion/critique — use the codex+agy council for that.
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
- **Multi-model consultation → council** (`council.sh`: `codex` + `agy`, read-only).
  Opinion / peer review on a CC-authored blob (e.g. a proposed canon-file diff). CC
  (Opus) is chairman and synthesizes; `council.sh` only COLLECTS the two critiques.
  `agy` is NEVER a council voice on its OWN just-completed delegation output
  (executor ≠ critic; conflict of interest) — `council.sh` takes an explicit blob
  path precisely so this can't happen by accident.

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
   reaches HAM. `checkpoint.sh status <run> <repo> <vault>` detects a torn
   rollback (process died mid-transaction between the repo and vault halves)
   and exits 1 with a manual-review warning — detect-and-warn only, no
   auto-resume.

`delegate_agy.sh`'s prompt also requires agy to emit `${OUT}/digest.json`
(`{files_touched:[...], external_effects:[...]}`) — `verdict.sh` hard-requires it
as the CLAIM side of the leak check. A missing digest is a hard FAIL, never a guess.

## Bounded auto-retry (`loop.sh`)
`loop.sh --repo <repo> --vault <vault> --run <prefix> --brief <task> [--max 3]
[--timeout 5m] [--gate fast]` wraps steps 1–5 in a bounded retry loop (Loop
Engineering: Trigger → Action → objective Stop, capped so it can never run
unbounded). Each failed attempt rolls back transactionally, then feeds the
verdict's `reasons[]` into the next attempt's brief (concrete feedback, not a
blind retry). Stop conditions / exit codes:
- `0` PASS (terminal success)
- `1` cap exhausted (every attempt failed *differently*, never passed)
- `2` early-exit (same failure *class* repeated → no progress → stop before
  burning the rest of the cap; reasons are classified by the verdict-reason
  prefix, so "unclaimed change: a" and "...: b" count as the same class)
- `3` rollback failed (a between-attempts rollback errored → repo/vault may be
  torn → abort loudly rather than snapshot a poisoned baseline next attempt)
- `4` snapshot failed (can't proceed without a recoverable checkpoint)
- `5` locked (another run with the same `--run` prefix is in progress; the
  mkdir-based lock prevents two loops corrupting shared checkpoint state)
- `130/143` propagated (user interrupt aborts the whole loop)

## Council (`council.sh`) — opinion path, NOT execution
`council.sh <run_id> <blob-file> [--repo <dir>] [--timeout <secs>]` collects two
read-only critiques (`codex` via `codex exec -s read-only`; `agy` via `--print`
with NO `--sandbox`/`--add-dir`, zero write surface) of a CC-authored blob and
writes them under `.orchestration/<run>/council/` for CC to chair. A failed voice
is marked `ABSENT` (fail-loud); exit 1 only if BOTH are absent. **Never** point it
at agy's own just-completed `result.md` — it takes an explicit blob path so that
mistake can't happen implicitly. Secrets in the reviewed blob are redacted before
anything is persisted.

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

## Known infra constraints (2026-06-24)
- **Council voices are `codex` + `agy`** (the gemini Vertex + OSS-via-Ollama design
  is fully retired — gemini had a persistent trusted-folder gate failure, exit 55).
  `codex` is ChatGPT-account authenticated (`codex login status` → "Logged in using
  ChatGPT"); `agy` wraps Gemini/Claude/GPT-OSS models. Both confirmed live 2026-06-24.
- No `timeout`/`gtimeout` on PATH → `council.sh` bounds BOTH voices via `lib.sh`'s
  pure-bash `run_with_timeout` (the `codex` CLI has no self-timeout and once stalled
  7.5 min unbounded; agy also self-bounds via `--print-timeout` as belt-and-suspenders).
- `codex` usage now stacks council-critique calls on top of whatever else invokes it
  on this machine — no combined rate-limit/cost data yet (watch via `self_eval`).

## Deferred to v2
§5 reader/verifier model split + Opus tiering · §6 differential/active-recall
human approval · §7 vault-fsck hash-chain + per-line canon provenance · full
git-worktree-per-run isolation (the per-run `.orchestration/<run>/` state dir is
the v1 floor).
