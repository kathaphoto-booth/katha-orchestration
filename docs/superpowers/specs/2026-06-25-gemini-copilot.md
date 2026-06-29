# Spec: GEMINI.md remediation + Copilot CLI third council voice + AG skill slimming + memory-layer findability fix

**Author:** CC (chaired; brainstormed and pressure-tested via 4-topic Workflow, 2026-06-25)
**Date:** 2026-06-25
**Status:** Approved (Jed, 2026-06-25) — proceeding to writing-plans + TDD implementation
**Reviewers:** Jed (final authority)
**Upstream artifacts:** `.claude/plans/do-we-actually-need-twinkling-pearl.md` (approved plan), `handoff/2026-06-25_gemini-copilot_decision-record.md` (vault — grill-me Decision Record + 4-topic brainstorm/pressure-test/addendum, all 3 flags resolved)

---

## Context

Three problems were named and prioritized via `/grill-me` (11 questions, 4 rounds, full transcript in the Decision Record):

- **(A) Token efficiency.** CC/AG fan-out during deep research burns 5-hour session limits before execution plans finish. AG intermittently cannot load Sonnet/Opus tiers ("error high traffic") and falls back to a slower, less accurate model.
- **(B) Hallucination / governance gaps.** AG reads files outside protocol without going through any gate; a historical incident (Jed's first-hand account, not found in any repo/vault artifact) ties rare `GEMINI.md` reads under a prior memory architecture to whole-session hallucinations. Separately, CC occasionally resurfaces legacy data from sessions already resolved.
- **(D) Orchestration loop incompleteness.** The council (`council.sh`) has run on exactly 2 voices (`codex`, `agy`) since Gemini-Vertex was retired (trusted-folder exit-55 bug). A working Copilot CLI bridge (`tools/antigravity_cli.py`, 7/7 tests green) shipped on `feat/orchestration-layer-v1` but was never wired into any orchestration script — a standalone island.

Jed explicitly locked scope to exactly three deliverables plus the memory-layer fix that emerged from validating the riskiest assumption (below) — **no other major new features.** A 4-topic generate-then-adversarially-pressure-test brainstorm (8 agents, Sonnet 4.6, effort=high) investigated all four areas against live repo/vault state rather than assumption, and CC independently re-verified two of the brainstorm's load-bearing claims afterward, correcting both before they could ship. Full evidence trail is in the Decision Record; this spec translates the resolved decisions into requirements.

**Riskiest assumption (Jed, grill-me Q5/Q11):** the memory layer (`codebase-memory-mcp` + the vault) may be just as unreliable as the legacy HAM architecture it replaced — named as the single biggest 6-month regret risk, because every other deliverable in this spec depends on council/brainstorm output actually being findable later. This was tested empirically (not assumed) in Topic 4 of the brainstorm (FR Group 4 below); the finding is real.

---

## Functional Requirements

### FR Group 1 — GEMINI.md remediation

- FR-1: `GEMINI.md` MUST retain, with light trims only, the following AG-IDE-unique sections, which have zero CLAUDE.md equivalent: §1 (Orchestration Chain), §2 (Single Source of Truth), §4 (Tooling), §4a (AG IDE Invocation Guide), §8 (AG Write Permissions), §9 (Delegation Boundaries), §10 (Handoff Channel).
- FR-2: `GEMINI.md` §6 (Context Retrieval) MUST be preserved largely intact, not gutted. CC-verified: §6 was rewritten 2026-06-23 (commit `e722788`) and is the only document describing AG's two distinct runtime modes — interactive (live vault access) vs. headless via `scripts/agy-tier-run.sh` (receives an injected `COMPILED_HAM.md` snapshot, "current at launch" but vault-disconnected thereafter). Only the dead `memory_boot_check.sh`-deletion trivia paragraph inside §6 MAY be cut.
- FR-3: §3 (Katha Laws), §5 (Voice), §7 (Auto-Capture Rule) MUST be replaced with short pointers into `CLAUDE.md` / vault `patterns.md` / `instructions.md` respectively, rather than restated facts. Rationale: duplicated content is the file's confirmed rot vector — CC-verified that §3's Fraunces/EB Garamond reference was already corrected by commit `40fdf4d` one commit before the original cut-justification was drafted, proving restated facts go stale independent of this change.
- FR-4: §11 (Current Phase) and §12 (Deprecated) MUST be deleted entirely. §11 self-contradicts (declares itself volatile, then hardcodes a phase value). §12 is a negative-space fact list (things NOT to say) which carries higher hallucination-risk per token than positive-space facts if read out of context by a degraded model.
- FR-5: A new `## Workflow Gates` section MUST be added, binding AG to the literal file path `.agents/skills/grill-me/SKILL.md` before any feature/spec/refactor work, mirroring CLAUDE.md's gate. It MUST include an explicit skip-clause for CC-delegated `--print` tasks that already carry pre-approved success criteria (per §4a), so the gate does not add friction to routine delegated execution.
- FR-6: The resulting file SHOULD land in the 210-240 line band (CORRECTED 2026-06-25 during implementation: the earlier ≤120, then ~140-150, targets were estimation errors — keeping §4a-core + §6 intact per FR-1/FR-2, both load-bearing and AG-unique, totals ~90 lines on their own and sets the real floor near 220. Actual result after FR-1 light trims: 227 lines, a 24% cut from 299. Correctness of kept content was confirmed over hitting an arbitrary line count).

### FR Group 2 — Copilot CLI as third council voice

- FR-7: `council.sh` MUST gain a third voice block, structurally symmetric to the existing `codex`/`agy` blocks (same `set +e` / `run_with_timeout` / `redact` / status-by-`rc==0 AND -s out` idiom), gated by `COUNCIL_INCLUDE_COPILOT` (default `1`) and `COPILOT_BIN` (default `gh`).
- FR-8: The third voice block MUST be appended strictly after both the `codex` and `agy` blocks and strictly before the quorum-check line, and MUST NOT reassign any `codex_*`/`agy_*` variable. This ordering is a tested invariant (AC-8), not a documentation convention, because `council.sh` runs under `set -euo pipefail` and a misordered block whose internal error escapes before its own `set +e` would abort the entire script before `codex`/`agy` ever execute.
- FR-9: The existing quorum exit condition (`exit 1` only if `codex` AND `agy` are both `ABSENT`) MUST NOT be modified. Copilot's status MUST NOT enter that decision under any circumstance.
- FR-10: The voice MUST report exactly one of three statuses: `OK`, `ABSENT` (attempted, failed/empty/timed out), or `SKIPPED` (`COUNCIL_INCLUDE_COPILOT=0`) — a distinct third state from the existing two-voice vocabulary.
- FR-11: Before any `gh copilot -p ...` invocation, the script MUST pre-flight-check whether the real Copilot CLI binary is already downloaded and route straight to `ABSENT` if not. Rationale: CC-verified that `gh` 2.92.0 is on PATH but the underlying Copilot CLI binary is not downloaded on the reference machine, and the first real prompted invocation may trigger a network auto-download — unacceptable as a side effect of a script documented as strictly read-only.
- FR-12: The exact invocation flags MUST be confirmed via a non-network `gh copilot --help` probe before implementation, not guessed. CC-verified `gh`'s own documented example is `gh copilot -p "..." --allow-tool 'shell(git)'` with no leading `--` separator — the originally brainstormed `gh copilot -- <flags> "$PROMPT"` form is unverified and likely wrong.
- FR-13: `council.json`'s manifest MUST gain a `voices.copilot` object (status/rc/out/err paths), additive only. No script outside `council.sh` itself was found reading `.voices.*` by position or count (verified by full-tree grep), so this is confirmed backward-compatible for known consumers.
- FR-14: `.agents/skills/antigravity/SKILL.md` MUST be updated in the same change — its prose currently states "two critiques"/"codex + agy"/"collects two" in three places (lines ~23-27, ~80-84, ~113) and would become factually wrong about its own behavior otherwise.

### FR Group 3 — AG skill/plugin slimming

- FR-15: The following 5 skill directories MUST be deleted via `git rm -r` (preserves history): `hierarchical-agent-memory`, `higgsfield-generate`, `higgsfield-marketplace-cards`, `higgsfield-product-photoshoot`, `higgsfield-soul-id`. CC-verified via a two-tier grep (directory name + frontmatter `name:` field, AND a concept-level grep for distinctive commands/roles the skill body introduces) that none have live dependents.
- FR-16: The deletion of `hierarchical-agent-memory` MUST NOT be construed as license to touch `bin/compile-ham.sh`, `bin/claude`, `scripts/agy-tier-run.sh`, or `antigravity/SKILL.md`'s `## Write boundaries (§ Thor's Hammer)` section. CC-verified these are live, independently-wired infra that happens to share vocabulary ("Thor's Hammer", "COMPILED_HAM.md") with the dead skill's prose — the skill's *command surface* (`go ham`, `ham audit`, `ham dashboard`, localhost:7777 dashboard) is confirmed dead and referenced nowhere live; the *infra concept* is not dead. The deletion commit message MUST state this distinction explicitly.
- FR-17: The project's own `SKILLS.md` registry MUST be corrected in the same commit: its "Retiring" table currently lumps the live `handoff` skill (edited 2026-06-22, wired into CLAUDE.md's `/handoff` slash command via `sync.sh`) into the same row as `hierarchical-agent-memory` under one "HAM machinery being retired" reason. This row MUST be split so `handoff` is not listed as retiring.
- FR-18: `impeccable-looped-kit` vs. `impeccable`'s overlapping/conflicting invocation syntax MAY be resolved in a future, separate change. Out of scope here per Jed's explicit resolution (Decision Record §Summary item 3) — not blocking, since neither is in the FR-15 delete list.

### FR Group 4 — Memory-layer findability fix

- FR-19: The vault's existing `README.md` MUST gain one line stating that `codebase-memory-mcp` indexes only headers/code symbols, never markdown body content, and MUST NOT be queried for vault decision/synthesis prose. CC-verified this empirically: `search_graph` (BM25) and `semantic_query` (vector) both return zero hits for known-present vault terms ("council synthesis decision", "Loko Rust") against the vault graph, while the same BM25 query against the repo graph returns 147 confident-but-irrelevant hits from an untracked vendored plugin in `scratch/`.
- FR-20: `instructions.md` MUST gain a short filename grammar for `handoff/*.md` artifacts: `YYYY-MM-DD_topic-slug_type.md`, type ∈ {task, plan, walkthrough, verify, report, rule, spec, review, credentials}. CC-verified drift is real, not hypothetical: 26 of 128 `handoff/` files carry an undocumented leading-underscore prefix, ~24 distinct suffix patterns exist, two `.png` files have no type suffix, and a `thors-hammer-sync-*` family follows no grammar at all.
- FR-21: `scratch/` MUST be added to `.gitignore` (it is currently untracked but unignored, and is the direct source of the 147-hit false-positive noise above) and the repo graph MUST be re-indexed afterward.
- FR-22: The memory-layer eval harness (5 known-answer questions; scored on pass rate, tool-calls-to-answer, and false-confidence events) MUST actually be executed as a literal cold-start subagent session with zero conversational carry-over, with the transcript captured as evidence. The original brainstorm designed this harness but never ran it — flagged by its own pressure-test as the same "claimed done, wasn't" pattern this project's `/antigravity` governance exists to catch. Status MUST be reported as "designed, not yet run" until this AC is satisfied.
- FR-23: This fix MUST NOT introduce a new top-level vault file (e.g. a proposed `INDEX.md`). CC-verified the vault's `README.md` already documents a 7-node boot order with a "Holds" column; a new file would duplicate it and re-grow the boot-file count that CLAUDE.md's own migration explicitly shrank.

---

## Non-Functional Requirements

- **NFR-1 (Reliability):** Adding the Copilot voice (FR Group 2) MUST NOT change the pass/fail outcome of `bash .agents/skills/antigravity/tests/run.sh` when Copilot is absent, disabled, or misconfigured. Measurable: the existing 2-voice test assertions in `tests/test_council.sh` MUST continue to pass byte-for-byte unmodified.
- **NFR-2 (No side effects from read-only tooling):** `council.sh` MUST NOT trigger any network download as a side effect of a normal invocation. Measurable: FR-11's pre-flight gate prevents any `gh copilot -p ...` call when the underlying binary isn't already present.
- **NFR-3 (Token/boot cost):** `GEMINI.md`'s line count MUST NOT regress past its pre-change baseline of 299 lines, and SHOULD land in the 210-240 band (FR-6, corrected). Achieved: 227. Not auto-loaded by any orchestrated script (CC-verified across `council.sh`, `loop.sh`, `delegate_agy.sh`, `bin/compile-ham.sh`) — this NFR concerns the AG-IDE interactive-read cost only.
- **NFR-4 (No new infrastructure):** Per Jed's explicit grill-me lock ("we are not building any more major new features, period"), FR Group 4 MUST be satisfied via edits to existing files (`README.md`, `instructions.md`) plus one `.gitignore` line — zero new top-level files, zero new scripts, zero new enforcement hooks.
- **NFR-5 (Auditability):** Every deletion in FR Group 3 MUST use `git rm -r` (not `rm`) so removed content remains recoverable from git history, and MUST follow the existing commit message convention `chore(skills): remove <reason>` (precedent: commit `1defa12`).

---

## Acceptance Criteria

### AC-1: GEMINI.md retains AG-IDE-unique sections intact (FR-1, FR-2)
*Given* the slimmed `GEMINI.md`, *when* a reviewer diffs it against the pre-change version, *then* §1, §2, §4, §4a, §8, §9, §10 are present with only the §6 dead-trivia paragraph removed from that set — no other content from these sections is deleted.

### AC-2: Duplicated content replaced with pointers, not restated facts (FR-3)
*Given* the slimmed `GEMINI.md`, *when* a reviewer searches for restated brand-law, voice, or auto-capture facts, *then* none are found — only pointers into `CLAUDE.md`/`patterns.md`/`instructions.md` remain in §3/§5/§7's place.

### AC-3: Stale and self-contradicting sections removed (FR-4)
*Given* the slimmed `GEMINI.md`, *when* a reviewer searches for the strings "Current Phase" or a deprecated-terms list, *then* zero matches are found.

### AC-4: Workflow Gates section present and correctly worded (FR-5)
*Given* the slimmed `GEMINI.md`, *when* `grep -c "Workflow Gates" GEMINI.md` is run, *then* the result is ≥1, and the section text includes the literal path `.agents/skills/grill-me/SKILL.md` and an explicit skip-clause for delegated `--print` tasks.

### AC-5: Line count lands in the target band (FR-6)
*Given* the slimmed `GEMINI.md`, *when* `wc -l GEMINI.md` is run, *then* the result is between 210 and 240 lines (corrected band — see FR-6). Achieved: 227, a 24% cut from the 299-line baseline.

### AC-6: Copilot voice reports OK when healthy (FR-7, FR-10)
*Given* `council.sh` with a valid `gh copilot` install, *when* the script runs with `COUNCIL_INCLUDE_COPILOT=1`, *then* `council.json` contains a `voices.copilot` object with status `OK`.

### AC-7: Baseline survives a broken Copilot binary (FR-9)
*Given* `council.sh` with `COPILOT_BIN` pointed at a nonexistent binary, *when* the script runs, *then* `codex` and `agy` both still report their normal statuses, the script exits 0 (assuming at least one of codex/agy succeeds, matching pre-change behavior), and `voices.copilot.status` is `ABSENT`.

### AC-8: Block order is a tested invariant, not a convention (FR-8)
*Given* the modified `council.sh` source, *when* a structural test asserts the line-number position of the copilot block's anchor relative to the `codex`/`agy` blocks' `redact <` lines, *then* the copilot block's anchor is strictly after both.

### AC-9: Quorum decision never flips on Copilot's status (FR-9)
*Given* `council.sh` with `codex`, `agy`, AND `copilot` all stubbed to fail/be absent, *when* the script runs, *then* it exits 1 — proving Copilot's presence/absence never flips the quorum decision in either direction.

### AC-10: SKIPPED is distinct from ABSENT (FR-10)
*Given* `council.sh` with `COUNCIL_INCLUDE_COPILOT=0` and no Copilot binary on PATH at all, *when* the script runs, *then* `voices.copilot.status` is `SKIPPED` (not `ABSENT`), and `codex`/`agy` behave exactly as before this change.

### AC-11: No network call is ever made when the binary is absent (FR-11)
*Given* a machine where the real Copilot CLI binary is not downloaded, *when* `council.sh` runs with `COUNCIL_INCLUDE_COPILOT=1`, *then* no network call is made (verified by absence of any download artifact at the binary's expected install path before and after the run) and `voices.copilot.status` is `ABSENT`.

### AC-12: SKILL.md documentation matches the new three-voice behavior (FR-14)
*Given* the updated `SKILL.md`, *when* a reviewer greps for "two critiques" or "codex + agy" used to describe the full voice count, *then* zero matches are found (replaced with three-voice language).

### AC-13: Deleted skills are recoverable via git history (FR-15)
*Given* the 5 target skill directories, *when* `git log --oneline -- .agents/skills/<name>/` is run post-deletion, *then* a `chore(skills): remove <reason>` commit is the most recent entry and the directory no longer exists on the working tree but is recoverable via `git show <commit>^:.agents/skills/<name>/SKILL.md`.

### AC-14: Commit message distinguishes dead prose from live infra (FR-16)
*Given* the deletion commit, *when* a reviewer reads its message, *then* it explicitly states that `bin/compile-ham.sh`, `bin/claude`, `scripts/agy-tier-run.sh`, and `antigravity/SKILL.md`'s Thor's Hammer section are untouched and remain live infra, distinct from the deleted skill's dead command surface.

### AC-15: SKILLS.md registry bug is fixed in the same commit (FR-17)
*Given* the updated `SKILLS.md`, *when* a reviewer reads the "Retiring" table, *then* `handoff` is not listed in it.

### AC-16: README.md warns against querying vault prose via the graph (FR-19)
*Given* the updated vault `README.md`, *when* a reviewer reads it, *then* it contains an explicit statement that `codebase-memory-mcp` must not be queried for vault prose.

### AC-17: Filename grammar is documented and followed going forward (FR-20)
*Given* the updated `instructions.md`, *when* a reviewer checks any newly-created `handoff/*.md` file going forward, *then* its filename matches the documented `YYYY-MM-DD_topic-slug_type.md` grammar.

### AC-18: scratch/ noise is removed from the repo graph (FR-21)
*Given* the updated `.gitignore` and a re-index, *when* `search_graph` is queried for a term known to exist only in `scratch/`'s vendored plugin code, *then* zero hits are returned from the repo graph (down from the pre-fix 147).

### AC-19: Eval harness is actually executed with captured evidence (FR-22)
*Given* a freshly-spawned, context-isolated subagent with no conversational carry-over, *when* it is asked one of the 5 known-answer eval questions, *then* the transcript shows it consulted a vault plain file (not the MCP graph) and cited the specific file path it pulled from, with the answer matching the known-correct value. Captured transcript is the evidence artifact (per `superpowers:verification-before-completion`).

### AC-20: Invocation syntax is verified before code lands, not guessed (FR-12)
*Given* the implementer is about to write the `gh copilot` invocation line in `council.sh`, *when* they run `gh copilot --help` (or an equivalent non-network probe), *then* the resulting flag order is confirmed to match what ships, and the commit diff's invocation line is identical to the probed syntax — no unverified `--` placement is committed.

### AC-21: council.json schema change is verified additive against real consumers (FR-13)
*Given* the full `.agents/skills/antigravity/` tree plus `tests/`, *when* a reviewer greps for `.voices.codex` or `.voices.agy` accessed positionally (e.g. by array index rather than by key), *then* zero such consumers are found, confirming the new `voices.copilot` key cannot break an existing reader.

### AC-22: impeccable-looped-kit conflict is deferred, not silently resolved or expanded (FR-18)
*Given* the FR-15 deletion list, *when* a reviewer checks it, *then* `impeccable-looped-kit` and `impeccable` do not appear in it, and no edit to either skill's `SKILL.md` or to CLAUDE.md's reference to `impeccable-looped-kit` is included in this change.

### AC-23: No new top-level vault file is introduced (FR-23)
*Given* the memory-layer fix lands, *when* a reviewer diffs the vault's root-level file listing before and after, *then* no new file (e.g. a proposed `INDEX.md`) appears — only edits to the existing `README.md`, `instructions.md`, and `.gitignore`.

---

## Edge Cases

- EC-1: `gh copilot` is on PATH but the user has no active Copilot subscription. Expected: fails fast with a non-zero exit and parseable stderr within the `run_with_timeout` bound, mapped to `ABSENT` — never a hang, never an interactive auth prompt despite `< /dev/null` redirection. *(Unverified pending a real provisioned install — see Phase B-Step-1 research note in the Decision Record. Not blocking FR-11's pre-flight gate, which avoids invocation entirely when the binary isn't present, but IS relevant for the case where the binary IS present without a valid seat.)*
- EC-2: `run_with_timeout` (macOS has no native `timeout`/`gtimeout`) bounds Copilot's wall-clock exactly as it already does for `codex`/`agy` — no new timeout mechanism needed.
- EC-3: A future script hardcodes "exactly 2 voices" by reading `council.json` positionally rather than by key. Mitigated by the full-tree grep already performed (FR-13) confirming no such consumer exists today; if one is added later, it is responsible for handling the additive `voices.copilot` key.
- EC-4: A skill scheduled for deletion is referenced by name in CLAUDE.md's SLASH COMMANDS section under a different display name than its directory. Mitigated by FR-15's two-tier grep (directory name + frontmatter `name:` field, separately).
- EC-5: Re-indexing after the `scratch/` gitignore change fails or times out on a very large vendored tree. Mitigated by `codebase-memory-mcp`'s existing `index_repository` mode selection (`fast` mode available if `full`/`moderate` is too slow); not a blocking risk for this spec since `scratch/` is being excluded, not indexed differently.
- EC-6: The Samsung 970 vault drive is unmounted when AG attempts the §6-documented staleness check. Pre-existing behavior (§6 already instructs AG to halt and report, not proceed) — unchanged by this spec, just preserved.

---

## API Contracts

No REST/HTTP API is introduced by this spec (the HTTP-method-and-path check below intentionally does not apply — this is a CLI/manifest contract, not a web API). The relevant contracts are CLI invocation shapes and the `council.json` manifest schema.

```typescript
// council.sh's per-run manifest — council.json (FR-13, additive change only)
interface CouncilManifest {
  run_id: string;
  blob_path: string;
  voices: {
    codex: CouncilVoiceResult;
    agy: CouncilVoiceResult;
    copilot: CouncilVoiceResult;   // NEW — additive key, optional consumers may ignore
  };
  exit_code: 0 | 1;                // UNCHANGED semantics: 1 only if codex AND agy both ABSENT
}

interface CouncilVoiceResult {
  status: "OK" | "ABSENT" | "SKIPPED";   // SKIPPED is new vocabulary, only valid for copilot today
  rc: number | null;
  out: string;   // path to redacted stdout capture, e.g. ".orchestration/<run>/council/copilot.out"
  err: string;   // path to redacted stderr capture
}

// Copilot CLI invocation contract (FR-12) — confirmed via non-network --help probe, not guessed
// gh copilot -p "<prompt>" [--allow-tool 'shell(git)']
// No leading `--` separator for a plain -p call (per gh's own documented example).
// Exact exit-code / auth-failure shape: UNVERIFIED, requires a provisioned install (EC-1).
```

---

## Data Models

No relational/database schema changes. Structured-artifact "models" introduced or modified by this spec:

| Artifact | Field | Type | Constraint |
|---|---|---|---|
| `GEMINI.md` `## Workflow Gates` section | (free text) | markdown | MUST contain literal path `.agents/skills/grill-me/SKILL.md` and a skip-clause |
| `handoff/*.md` filename (FR-20) | `date` | `YYYY-MM-DD` | ISO date, required prefix |
| `handoff/*.md` filename | `topic-slug` | kebab-case string | required |
| `handoff/*.md` filename | `type` | enum | one of {task, plan, walkthrough, verify, report, rule, spec, review, credentials} |
| `council.json` `voices.copilot` (FR-13) | `status` | enum | one of {OK, ABSENT, SKIPPED} |
| `SKILLS.md` "Retiring" table row (FR-17) | `skill_name`, `reason` | string, string | `handoff` MUST NOT co-occur with a "HAM machinery" reason |

---

## Out of Scope

- OS-1: Phase A (Copilot CLI as post-run MCP audit ingest via `loop.sh` trap). Explicitly deferred per Jed's grill-me lock — not part of this MVP.
- OS-2: Phase C (Copilot CLI as a parallel executor / agy alternative). Requires digest/sandbox/sentinel parity research not yet done. Future, requires explicit Jed sign-off to start.
- OS-3: Orchestration Task 12 (`.orchestration/` self-leak gitignore fix), Task 13 (transactional rollback marker), Task 14 (`council.sh` missing `set -e`). Tracked separately in `docs/superpowers/plans/2026-06-22-orchestration-layer-v1.md`; intentionally not folded into this spec per Jed's explicit answer.
- OS-4: The full AG IDE skill/plugin graph audit (the ~75% capacity figure) and any CC↔AG skill-format unification. This spec only covers the 21 repo-local `.agents/skills/` directories' confirmed-safe deletions (FR Group 3); the broader audit is separate future research.
- OS-5: `impeccable-looped-kit` vs. `impeccable` conflict resolution (FR-18). Deferred to a future, separate change.
- OS-6: Injecting `GEMINI.md` §1/§8/§9 into headless AG prompts via `delegate_agy.sh`/`agy-tier-run.sh` (the originally-proposed mitigation for low GEMINI.md read-frequency). Deferred — the read-frequency question was reframed during this spec's drafting (see Decision Record Addendum) as more likely a session-handoff habit issue than a file-discovery-rate issue; revisit only if the habit-change fix (pointing AG at `SESSION_HANDOFF.json` explicitly rather than re-narrating from memory) proves insufficient.
- OS-7: Write-path reliability of the `memory.md` auto-capture rule (does it actually fire on every Jed confirmation, per CLAUDE.md). Only read-path/findability was tested in FR Group 4. Separate future follow-up.
- OS-8: Instrumenting `bin/compile-ham.sh`/`agy-tier-run.sh` with compile-timestamp-vs-vault-mtime logging (the concrete debugging step suggested for Problem B's stale-snapshot hypothesis). Worth doing, but not required for this spec's deliverables to ship; tracked as a follow-up idea in the Decision Record.
- OS-9: A formal `council.sh` (codex+agy) adversarial pass on this brainstorm's findings. Explicitly skipped by Jed's decision — the generate-then-pressure-test pipeline already served this function for this round.

---

## Validation

Run before implementation begins:

```bash
python3 "/Users/jedg./.claude/plugins/cache/claude-code-skills/engineering-advanced-skills/2.3.3/skills/spec-driven-workflow/scripts/spec_validator.py" \
  --file docs/superpowers/specs/2026-06-25-gemini-copilot.md --strict
```
