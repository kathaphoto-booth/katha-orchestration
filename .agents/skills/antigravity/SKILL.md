---
name: antigravity
description: Leak-proof delegation to the agy CLI with a deterministic, non-LLM verification gate. Use when CC should hand bulk agentic work (multi-file edits, scaffolding, refactors) to Antigravity (agy) and must verify the result before trusting it — i.e. whenever you would otherwise take a CLI's "done" on faith. Routes execution to agy (sandboxed, per-run isolated), verifies via verdict.sh (truth computed from git, never from agy's self-report), and rolls back transactionally on any leak. NOT for fast opinion/critique — use the codex+agy council for that.
allowed-tools: [Bash, Read, Write]
tier:
  current: 1
  target: 2
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
- **Multi-model consultation → council** (`council.sh`: `codex` + `agy` + `copilot`, read-only).
  Opinion / peer review on a CC-authored blob (e.g. a proposed canon-file diff). CC
  (Opus) is chairman and synthesizes; `council.sh` only COLLECTS the critiques.
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
`council.sh <run_id> <blob-file> [--repo <dir>] [--timeout <secs>]` collects up to
three read-only critiques (`codex` via `codex exec --oss -m qwen2.5-coder:7b -s
read-only` — default ON via `CODEX_USE_OSS=1`, free/local since the cloud path
is account-quota-blocked; cloud fallback via `CODEX_USE_OSS=0` once quota
resets; `agy` via `--print` with NO `--sandbox`/`--add-dir`, model pinned to
the fastest free-tier-friendly choice (`Gemini 3.5 Flash (Low)`,
env-overridable via `AGY_MODEL`) — never a hardcoded Anthropic name, that
silently broke every run before — env-toggle `COUNCIL_INCLUDE_AGY`, default
on; `copilot` via the standalone `copilot` CLI (npm `@github/copilot`, NOT the
sunset `gh copilot` extension), `--allow-all-tools --deny-tool=write
--deny-tool=shell` to keep it a critic (no write surface, matching codex/agy),
no `--model` flag (every named model fails identically via an account-level
policy gate — auto-mode already self-selects the cheap tier), pre-flight
gated on `copilot --version` so it never attempts a call when the CLI isn't
installed — env-toggle `COUNCIL_INCLUDE_COPILOT`, default on) of a CC-authored blob and writes them under
`.orchestration/<run>/council/` for CC to chair. A failed or disabled voice is
marked `ABSENT`/`SKIPPED` (fail-loud); exit 1 only if codex AND agy are both
absent (disabling agy via `COUNCIL_INCLUDE_AGY=0` counts as absent for this
check — it reuses the ABSENT status, unlike copilot's distinct SKIPPED, because
agy is one of the two voices the quorum check itself reads) — copilot's
presence never affects that decision. **Never** point it at agy's own
just-completed `result.md` — it takes an explicit blob path so that mistake
can't happen implicitly. Secrets in the reviewed blob are redacted before
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

## Known infra constraints (2026-06-24, updated 2026-06-26 x2)
- **Council voices are `codex` + `agy`** (the gemini Vertex + OSS-via-Ollama design
  is fully retired — gemini had a persistent trusted-folder gate failure, exit 55).
  `codex` is ChatGPT-account authenticated (`codex login status` → "Logged in using
  ChatGPT"); `agy` wraps Gemini/Claude/GPT-OSS models. Both confirmed live 2026-06-24.
- No `timeout`/`gtimeout` on PATH → `council.sh` bounds BOTH voices via `lib.sh`'s
  pure-bash `run_with_timeout` (the `codex` CLI has no self-timeout and once stalled
  7.5 min unbounded; agy also self-bounds via `--print-timeout` as belt-and-suspenders).
- **Both voices' invocations MUST redirect stdin from `/dev/null`** (2026-06-26):
  without it, `codex exec` sits on "Reading additional input from stdin..." and is
  SIGKILLed at the full `$TIMEOUT` bound on every non-interactive run (rc=137) —
  in the past silently misread as a quota/auth issue when it was really a stdin
  hang masking the real error. Same risk applies to `gh copilot` on principle
  (untested — not installed). See `test_council_all_voices_redirect_stdin_from_devnull`.
- **`codex` and `agy` both have account-level quota limits independent of each
  other and independent of any CLI flag or env var** (confirmed live 2026-06-26):
  - `codex`: ChatGPT plan usage limit — `"ERROR: You've hit your usage limit.
    Upgrade to Plus..."` on stderr, resets ~Jul 20 2026 per the live message.
  - `agy`: `RESOURCE_EXHAUSTED` (code 429) on the free/consumer-tier quota.
    Confirmed this is NOT a CLI/env-fixable auth routing issue — `GOOGLE_GENAI_
    USE_VERTEXAI`, `GOOGLE_CLOUD_PROJECT`, and `--project` all had zero effect
    on `authMethod` (stays `consumer`) in live testing, despite a real $1,300
    GCP/Vertex credit balance sitting unused on the linked project. The actual
    toggle is an Antigravity account-level setting (config key `useG1Credits`,
    "G1 Credits" — a separate quota pool from generic GCP/Vertex billing),
    outside this CLI's reach entirely. `agy` is pinned to the fastest,
    lowest-thinking-budget model on the confirmed-valid list (`Gemini 3.5 Flash
    (Low)`, env-overridable via `AGY_MODEL`) to make the most of whatever quota
    is available; `COUNCIL_INCLUDE_AGY=0` is the immediate, free workaround
    while an account issue is being resolved.
  - council.sh now greps each voice's failure output for these known
    signatures and appends a specific hint instead of the generic ABSENT
    message — see `test_council_quota_diagnostic_hints`.
- `codex` usage stacks council-critique calls on top of whatever else invokes it
  on this machine — confirmed 2026-06-26 this CAN exhaust the plan's quota
  (see above); watch via `self_eval`.
- **`agy` re-verified live 2026-06-26 (second pass, same day): quota block
  persists and appears to have tightened.** Direct `agy-bin --print` calls
  (bypassing council.sh entirely) still return rc=0/empty output on a trivial
  prompt — but this time `--log-file` never even got created, vs. the earlier
  same-day confirmation where it captured a `RESOURCE_EXHAUSTED` 429 before
  exiting. Read as: the account is now failing earlier in the request
  lifecycle (before agy's Go logger initializes), not as evidence the root
  cause changed. Still an account-level `useG1Credits` issue outside this
  CLI's reach — nothing here is fixable from script/CLI side; needs Jed to
  check the Antigravity account directly.
- **`agy` ALSO hangs on unredirected stdin, like `codex`** (confirmed
  2026-06-26, extending the line-130 finding which only had `codex` live and
  flagged copilot as "untested — not installed"): `agy-bin --print "prompt"`
  with stdin left open (not redirected from `/dev/null`) blocks indefinitely
  instead of erroring — SIGKILLed at a 12s bound in testing (rc=137). With
  `/dev/null` (immediate EOF), it returns instantly. Both real call sites
  (`agy-tier-run.sh`, `council.sh`) already redirect `< /dev/null` correctly,
  so this is **not an active bug** — documented here only so a future script
  invoking `agy-bin --print` directly doesn't lose time rediscovering it.

## All 3 council voices reconfigured for free/lowest-impactful tier (2026-06-27)
Jed's verdict on the night's quota/install failures was "this failed" — three
voices, three different ways to be unusable. Response: stop depending on
external account quota where a free, local, or already-working alternative
exists.
- **codex** → `--oss -m qwen2.5-coder:7b` (see Council section above for
  exact flags). Confirmed live: real critique output, no quota dependency.
- **copilot** → installed for the first time this session (`npm install -g
  @github/copilot`, v1.0.65; already authenticated via the existing `gh`
  keyring, no extra login). First attempt pinned `--model gpt-5-mini`
  (confirmed via the CLI's own debug log to be GitHub's auto-mode default,
  tagged `model_picker_price_category="low"`) — but live testing immediately
  after proved **every** named model fails identically via `--model` with
  "not available," including gpt-5-mini itself: an account-level
  model-access policy gate, not a naming problem. Fix: omit `--model`
  entirely and let auto-mode pick (confirmed live: it already picks the
  cheap tier on its own). `--allow-all-tools --deny-tool=write
  --deny-tool=shell` keeps it read-only despite being a full coding agent
  (unlike the old gh-copilot extension) — confirmed live it asks for more
  context rather than attempting file access.
- **agy** → unchanged, already pinned to `Gemini 3.5 Flash (Low)` from
  2026-06-25 — already the lowest-impactful tier, nothing to fix.
- All three voices confirmed live (not just stub-green) via a real
  `council.sh` run against a real blob: `codex=OK agy=ABSENT(disabled)
  copilot=OK`, both real critiques substantively engaged with the proposed
  change.

## Deferred to v2
§5 reader/verifier model split + Opus tiering · §6 differential/active-recall
human approval · §7 vault-fsck hash-chain + per-line canon provenance · full
git-worktree-per-run isolation (the per-run `.orchestration/<run>/` state dir is
the v1 floor).
