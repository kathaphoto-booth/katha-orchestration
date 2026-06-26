#!/usr/bin/env bash
# Tests for scripts/council.sh — the read-only critique collector (codex + agy
# required-pair, copilot optional 3rd voice).
#
# Design (2026-06-24 rebuild): the council is codex + agy, CC chairs. The OLD
# gemini+Vertex+OSS-via-Ollama design is fully retired. council.sh COLLECTS two
# independent critiques of a CC-authored blob; it does NOT synthesize a verdict
# (CC chairs in the next step). Both CLIs are stubbed here via CODEX_BIN/AGY_BIN
# so the tests are hermetic: no real codex, no real agy, no network.
#
# Hard invariants under test:
#   - both voices OK  => exit 0, council.json marks both OK, both .out populated
#   - one voice ABSENT => exit 0 (partial council, explicitly marked), not silent
#   - both voices ABSENT => exit 1 (nothing for CC to chair)
#   - secrets in the reviewed blob are REDACTED before anything is persisted
#   - council.sh refuses a missing/blank blob arg (no "default to agy's last output")
#   - no stale gemini/Vertex/qwen strings; reuses lib.sh run_with_timeout;
#     never calls delegate_agy.sh (separate entrypoint, executor != critic)

# A codex stub that succeeds with output. council.sh invokes:
#   codex exec -s read-only --skip-git-repo-check -C <repo> <prompt>
_mk_codex_ok() { printf '#!/usr/bin/env bash\necho "codex critique: looks fine"\nexit 0\n' > "$1/codex"; chmod +x "$1/codex"; }
_mk_codex_fail() { printf '#!/usr/bin/env bash\nexit 1\n' > "$1/codex"; chmod +x "$1/codex"; }
_mk_codex_quota_exhausted() { printf '#!/usr/bin/env bash\necho "ERROR: You'"'"'ve hit your usage limit. Upgrade to Plus to continue using Codex (https://chatgpt.com/explore/plus), or try again at Jul 20th, 2026 1:41 AM." >&2\nexit 1\n' > "$1/codex"; chmod +x "$1/codex"; }
# An agy stub that succeeds with output. council.sh invokes (model pinned to
# AGY_MODEL, default "Gemini 3.5 Flash (Low)" — see COUNCIL_INCLUDE_AGY):
#   agy --print --print-timeout <t>s --model <m> <prompt>
_mk_agy_ok() { printf '#!/usr/bin/env bash\necho "agy critique: ship it"\nexit 0\n' > "$1/agy"; chmod +x "$1/agy"; }
_mk_agy_fail() { printf '#!/usr/bin/env bash\nexit 1\n' > "$1/agy"; chmod +x "$1/agy"; }
_mk_agy_quota_exhausted() { printf '#!/usr/bin/env bash\necho "RESOURCE_EXHAUSTED (code 429): Resource has been exhausted (e.g. check quota)." >&2\nexit 1\n' > "$1/agy"; chmod +x "$1/agy"; }
_mk_agy_guarded() {
  printf '#!/usr/bin/env bash\ntouch "${AGY_SENTINEL:-/tmp/agy_invoked}"\necho "should-not-run"\nexit 0\n' > "$1/agy"
  chmod +x "$1/agy"
}

# A copilot stub (gh wrapper) with the Copilot CLI INSTALLED. council.sh's
# pre-flight is `gh copilot -- --help` (the form that passes --help THROUGH to
# the real Copilot CLI, so $2 == "--"); the critique call is `gh copilot -p`.
# The stub answers both. (Plain `gh copilot --help`, $2 == "--help", is gh's own
# wrapper help and is NOT what the gate uses — see council.sh FR-11 comment.)
_mk_copilot_ok() {
  printf '#!/usr/bin/env bash\nif [[ "$1" == "copilot" && "$2" == "--" ]]; then exit 0; fi\nif [[ "$1" == "copilot" && "$2" == "-p" ]]; then echo "copilot critique: looks fine"; exit 0; fi\nexit 1\n' > "$1/gh"
  chmod +x "$1/gh"
}
# Simulates `gh` present but the Copilot CLI NOT installed: the pre-flight
# `gh copilot -- --help` fails fast (rc=1), matching real gh's verified behavior
# (2026-06-25). council.sh must mark copilot ABSENT and never reach `-p`.
_mk_copilot_absent() {
  printf '#!/usr/bin/env bash\nexit 1\n' > "$1/gh"
  chmod +x "$1/gh"
}
# Like _mk_copilot_absent, but if council.sh ever WRONGLY reaches the `-p` call
# (FR-11 violation), the stub records it by touching $COPILOT_SENTINEL — letting
# a test assert the pre-flight gate truly prevents the blind prompted call.
_mk_copilot_absent_guarded() {
  printf '#!/usr/bin/env bash\nif [[ "$1" == "copilot" && "$2" == "-p" ]]; then touch "${COPILOT_SENTINEL:-/tmp/copilot_p_invoked}"; echo "should-not-run"; exit 1; fi\nexit 1\n' > "$1/gh"
  chmod +x "$1/gh"
}

test_council_both_voices_ok() {
  local r; r=$(mk_repo); local bin; bin=$(mktemp -d)
  _mk_codex_ok "$bin"; _mk_agy_ok "$bin"
  local blob; blob=$(mktemp); echo "proposed diff: rename X to Y" > "$blob"
  CODEX_BIN="$bin/codex" AGY_BIN="$bin/agy" COUNCIL_INCLUDE_COPILOT=0 \
    bash "$SKILL/council.sh" cr1 "$blob" --repo "$r" --timeout 30 >/dev/null 2>&1
  assert_exit "$?" 0 "both voices producing output => exit 0"
  local cj="$r/.orchestration/cr1/council/council.json"
  assert_eq "$(jq -r '.voices.codex.status' "$cj" 2>/dev/null)" "OK" "council.json marks codex OK"
  assert_eq "$(jq -r '.voices.agy.status' "$cj" 2>/dev/null)" "OK" "council.json marks agy OK"
  assert_contains "$(cat "$r/.orchestration/cr1/council/codex.out" 2>/dev/null)" "codex critique" "codex.out captured"
  assert_contains "$(cat "$r/.orchestration/cr1/council/agy.out" 2>/dev/null)" "agy critique" "agy.out captured"
}

test_council_partial_when_one_absent() {
  local r; r=$(mk_repo); local bin; bin=$(mktemp -d)
  _mk_codex_fail "$bin"; _mk_agy_ok "$bin"      # codex dies, agy survives
  local blob; blob=$(mktemp); echo "diff" > "$blob"
  CODEX_BIN="$bin/codex" AGY_BIN="$bin/agy" COUNCIL_INCLUDE_COPILOT=0 \
    bash "$SKILL/council.sh" cr2 "$blob" --repo "$r" --timeout 30 >/dev/null 2>&1
  assert_exit "$?" 0 "one voice absent => partial council still exit 0"
  local cj="$r/.orchestration/cr2/council/council.json"
  assert_eq "$(jq -r '.voices.codex.status' "$cj" 2>/dev/null)" "ABSENT" "dead codex marked ABSENT, not silently dropped"
  assert_eq "$(jq -r '.voices.agy.status' "$cj" 2>/dev/null)" "OK" "surviving agy marked OK"
}

test_council_fails_when_both_absent() {
  local r; r=$(mk_repo); local bin; bin=$(mktemp -d)
  _mk_codex_fail "$bin"; _mk_agy_fail "$bin"
  local blob; blob=$(mktemp); echo "diff" > "$blob"
  CODEX_BIN="$bin/codex" AGY_BIN="$bin/agy" COUNCIL_INCLUDE_COPILOT=0 \
    bash "$SKILL/council.sh" cr3 "$blob" --repo "$r" --timeout 30 >/dev/null 2>&1
  assert_exit "$?" 1 "both voices absent => exit 1 (nothing for CC to chair)"
}

test_council_redacts_secrets_before_persisting() {
  local r; r=$(mk_repo); local bin; bin=$(mktemp -d)
  _mk_codex_ok "$bin"; _mk_agy_ok "$bin"
  local blob; blob=$(mktemp)
  printf 'review this config:\nOPENAI_API_KEY=sk-abcdefghijklmnopqrstuvwxyz1234\n' > "$blob"
  CODEX_BIN="$bin/codex" AGY_BIN="$bin/agy" COUNCIL_INCLUDE_COPILOT=0 \
    bash "$SKILL/council.sh" cr4 "$blob" --repo "$r" --timeout 30 >/dev/null 2>&1
  local persisted_input="$r/.orchestration/cr4/council/input.txt"
  assert_not_contains "$(cat "$persisted_input" 2>/dev/null)" "sk-abcdefghijklmnopqrstuvwxyz1234" "raw secret token is NOT persisted"
  assert_contains "$(cat "$persisted_input" 2>/dev/null)" "REDACTED" "secret replaced with REDACTED marker"
}

test_council_refuses_missing_blob() {
  local r; r=$(mk_repo)
  bash "$SKILL/council.sh" cr5 "/no/such/blob/file" --repo "$r" >/dev/null 2>&1
  local code=$?
  assert_eq "$([[ "$code" -ne 0 ]] && echo nonzero || echo zero)" "nonzero" "refuses a nonexistent blob (no implicit 'agy's last output' default)"
}

test_council_is_hardened() {                       # source-assertion (drives real CLIs)
  local src="$SKILL/council.sh"
  assert_eq "$([[ -f "$src" ]] && echo yes || echo no)" "yes" "council.sh exists"
  local b; b="$(cat "$src" 2>/dev/null)"
  assert_contains "$b" "run_with_timeout" "reuses lib.sh portable timeout (no reinvented timeout)"
  assert_contains "$b" "exec -s read-only" "codex voice invoked read-only (no write surface)"
  assert_contains "$b" "ABSENT" "marks a voice ABSENT / fails loud rather than degrading silently"
  assert_not_contains "$b" "GEMINI_TIER" "no stale gemini billing-tier logic"
  assert_not_contains "$b" "load_vertex_env" "no stale Vertex env self-load"
  assert_not_contains "$b" "11434/api/generate" "no stale Ollama-direct OSS routing"
  assert_not_contains "$b" "qwen" "no stale qwen reference"
  # path form = an invocation; a prose mention of the bare name in comments is fine
  assert_not_contains "$b" "/delegate_agy.sh" "council never invokes delegate_agy.sh (executor != critic)"
}

test_council_copilot_ok_when_healthy() {
  local r; r=$(mk_repo); local bin; bin=$(mktemp -d)
  _mk_codex_ok "$bin"; _mk_agy_ok "$bin"; _mk_copilot_ok "$bin"
  local blob; blob=$(mktemp); echo "diff" > "$blob"
  CODEX_BIN="$bin/codex" AGY_BIN="$bin/agy" COPILOT_BIN="$bin/gh" COUNCIL_INCLUDE_COPILOT=1 \
    bash "$SKILL/council.sh" crc1 "$blob" --repo "$r" --timeout 30 >/dev/null 2>&1
  local cj="$r/.orchestration/crc1/council/council.json"
  assert_eq "$(jq -r '.voices.copilot.status' "$cj" 2>/dev/null)" "OK" "copilot voice OK when healthy"
}

test_council_baseline_survives_copilot_absent() {
  local r; r=$(mk_repo); local bin; bin=$(mktemp -d)
  _mk_codex_ok "$bin"; _mk_agy_ok "$bin"; _mk_copilot_absent "$bin"
  local blob; blob=$(mktemp); echo "diff" > "$blob"
  CODEX_BIN="$bin/codex" AGY_BIN="$bin/agy" COPILOT_BIN="$bin/gh" COUNCIL_INCLUDE_COPILOT=1 \
    bash "$SKILL/council.sh" crc2 "$blob" --repo "$r" --timeout 30 >/dev/null 2>&1
  assert_exit "$?" 0 "codex+agy healthy, copilot absent => still exit 0"
  local cj="$r/.orchestration/crc2/council/council.json"
  assert_eq "$(jq -r '.voices.codex.status' "$cj" 2>/dev/null)" "OK" "codex unaffected by copilot's absence"
  assert_eq "$(jq -r '.voices.agy.status' "$cj" 2>/dev/null)" "OK" "agy unaffected by copilot's absence"
  assert_eq "$(jq -r '.voices.copilot.status' "$cj" 2>/dev/null)" "ABSENT" "copilot marked ABSENT, not silently dropped"
}

test_council_copilot_skipped_when_disabled() {
  local r; r=$(mk_repo); local bin; bin=$(mktemp -d)
  _mk_codex_ok "$bin"; _mk_agy_ok "$bin"
  local blob; blob=$(mktemp); echo "diff" > "$blob"
  CODEX_BIN="$bin/codex" AGY_BIN="$bin/agy" COUNCIL_INCLUDE_COPILOT=0 \
    bash "$SKILL/council.sh" crc3 "$blob" --repo "$r" --timeout 30 >/dev/null 2>&1
  local cj="$r/.orchestration/crc3/council/council.json"
  assert_eq "$(jq -r '.voices.copilot.status' "$cj" 2>/dev/null)" "SKIPPED" "COUNCIL_INCLUDE_COPILOT=0 => SKIPPED, not ABSENT"
}

test_council_quorum_unaffected_by_copilot() {
  local r; r=$(mk_repo); local bin; bin=$(mktemp -d)
  _mk_codex_fail "$bin"; _mk_agy_fail "$bin"; _mk_copilot_absent "$bin"
  local blob; blob=$(mktemp); echo "diff" > "$blob"
  CODEX_BIN="$bin/codex" AGY_BIN="$bin/agy" COPILOT_BIN="$bin/gh" COUNCIL_INCLUDE_COPILOT=1 \
    bash "$SKILL/council.sh" crc4 "$blob" --repo "$r" --timeout 30 >/dev/null 2>&1
  assert_exit "$?" 1 "codex+agy absent => exit 1 regardless of copilot's status (copilot never enters the quorum decision)"
}

test_council_copilot_block_after_codex_and_agy() {
  local src="$SKILL/council.sh"
  local codex_line agy_line copilot_line
  codex_line=$(grep -n 'redact < "\$OUT/\.codex\.raw"' "$src" | head -1 | cut -d: -f1)
  agy_line=$(grep -n 'redact < "\$OUT/\.agy\.raw"' "$src" | head -1 | cut -d: -f1)
  copilot_line=$(grep -n 'redact < "\$OUT/\.copilot\.raw"' "$src" | head -1 | cut -d: -f1)
  assert_eq "$([[ -n "$copilot_line" && "$copilot_line" -gt "$codex_line" && "$copilot_line" -gt "$agy_line" ]] && echo yes || echo no)" "yes" \
    "copilot voice block's redact invocation is strictly after both codex's and agy's (set -e ordering invariant)"
}

# FR-11: the pre-flight (`gh copilot -- --help`) must structurally prevent the
# blind `gh copilot -p` call when the Copilot CLI is not installed — not merely
# mark the voice ABSENT after the fact. This is the assertion the original tests
# lacked: their stubs matched the (buggy) `--help` gate, so a wrong gate stayed
# green. Here the guarded stub records ANY `-p` invocation; we assert it never
# happened.
test_council_copilot_preflight_gates_p_call() {
  local r; r=$(mk_repo); local bin; bin=$(mktemp -d)
  _mk_codex_ok "$bin"; _mk_agy_ok "$bin"; _mk_copilot_absent_guarded "$bin"
  local sentinel; sentinel="$(mktemp -u)"      # a path that must NOT come to exist
  local blob; blob=$(mktemp); echo "diff" > "$blob"
  CODEX_BIN="$bin/codex" AGY_BIN="$bin/agy" COPILOT_BIN="$bin/gh" COUNCIL_INCLUDE_COPILOT=1 COPILOT_SENTINEL="$sentinel" \
    bash "$SKILL/council.sh" crc5 "$blob" --repo "$r" --timeout 30 >/dev/null 2>&1
  assert_eq "$([[ -e "$sentinel" ]] && echo invoked || echo not-invoked)" "not-invoked" \
    "FR-11: Copilot CLI not installed => pre-flight gates the -p call, never reached"
  local cj="$r/.orchestration/crc5/council/council.json"
  assert_eq "$(jq -r '.voices.copilot.status' "$cj" 2>/dev/null)" "ABSENT" "uninstalled copilot => ABSENT"
}

# Finding 1 (council review): the copilot pre-flight probe must be BOUNDED. An
# unbounded probe that hung would abort the whole script under set -e before the
# codex/agy quorum check — regressing the baseline even with the quorum line
# untouched. Source-assertion (a functional hang-test would add 15s/run).
test_council_copilot_preflight_is_bounded() {
  local src="$SKILL/council.sh"
  # Match the actual `if` invocation line (starts with `if`, so comments that
  # merely mention the probe can't satisfy it) carrying BOTH the timeout wrapper
  # and the probe.
  local hit; hit="$(grep -c 'if run_with_timeout.*copilot -- --help' "$src")"
  assert_eq "$([[ "$hit" -ge 1 ]] && echo bounded || echo unbounded)" "bounded" \
    "copilot pre-flight probe is wrapped in run_with_timeout (bounded, cannot hang the script)"
}

test_council_agy_model_pinned_correctly() {       # source-assertion (regression guard)
  # council.sh once hardcoded --model "Claude Sonnet 4.6 (Thinking)" into the
  # agy invocation — an Anthropic model name fed to the Gemini-based agy
  # binary — which silently broke every council run (rc=0, empty output).
  # Later (2026-06-25), agy's free/consumer-tier quota was confirmed exhausted
  # (RESOURCE_EXHAUSTED 429, via --log-file) independent of Vertex env vars or
  # --project, so the voice is now deliberately pinned to the fastest,
  # lowest-thinking-budget model on the confirmed-valid list (`agy models`):
  # Gemini 3.5 Flash (Low). The invariant that must never regress is "no
  # Anthropic/Claude model name reaches agy" — not "no --model at all".
  local b; b="$(cat "$SKILL/council.sh" 2>/dev/null)"
  assert_not_contains "$b" "Claude Sonnet" "council.sh does not hardcode a Claude model name for agy"
  assert_contains "$b" 'AGY_MODEL="${AGY_MODEL:-Gemini 3.5 Flash (Low)}"' "agy model is pinned to a confirmed-valid, fast, free-tier-friendly default"
  assert_contains "$b" '"$AGY_BIN" --print --print-timeout "${TIMEOUT}s" --model "$AGY_MODEL" "$PROMPT"' "agy invocation passes --model with the pinned (overridable) value"
}

test_council_agy_disabled_never_invokes_binary() {
  local r; r=$(mk_repo); local bin; bin=$(mktemp -d)
  _mk_codex_ok "$bin"; _mk_agy_guarded "$bin"
  local sentinel; sentinel="$(mktemp -u)"      # a path that must NOT come to exist
  local blob; blob=$(mktemp); echo "diff" > "$blob"
  CODEX_BIN="$bin/codex" AGY_BIN="$bin/agy" COUNCIL_INCLUDE_AGY=0 COUNCIL_INCLUDE_COPILOT=0 AGY_SENTINEL="$sentinel" \
    bash "$SKILL/council.sh" crc6 "$blob" --repo "$r" --timeout 30 >/dev/null 2>&1
  assert_eq "$([[ -e "$sentinel" ]] && echo invoked || echo not-invoked)" "not-invoked" \
    "COUNCIL_INCLUDE_AGY=0 => agy binary never invoked"
  local cj="$r/.orchestration/crc6/council/council.json"
  assert_eq "$(jq -r '.voices.agy.status' "$cj" 2>/dev/null)" "ABSENT" "disabled agy reports ABSENT (reuses existing status, no new value)"
  assert_contains "$(cat "$r/.orchestration/crc6/council/agy.out" 2>/dev/null)" "disabled" "agy.out distinguishes 'disabled' from a real failure"
}

test_council_agy_default_on_unchanged() {
  local r; r=$(mk_repo); local bin; bin=$(mktemp -d)
  _mk_codex_ok "$bin"; _mk_agy_ok "$bin"
  local blob; blob=$(mktemp); echo "diff" > "$blob"
  CODEX_BIN="$bin/codex" AGY_BIN="$bin/agy" COUNCIL_INCLUDE_COPILOT=0 \
    bash "$SKILL/council.sh" crc7 "$blob" --repo "$r" --timeout 30 >/dev/null 2>&1
  local cj="$r/.orchestration/crc7/council/council.json"
  assert_eq "$(jq -r '.voices.agy.status' "$cj" 2>/dev/null)" "OK" "COUNCIL_INCLUDE_AGY unset => defaults to on, unchanged behavior"
}

test_council_quorum_correct_when_agy_disabled() {
  local r; r=$(mk_repo); local bin; bin=$(mktemp -d)
  _mk_codex_fail "$bin"; _mk_agy_ok "$bin"
  local blob; blob=$(mktemp); echo "diff" > "$blob"
  CODEX_BIN="$bin/codex" AGY_BIN="$bin/agy" COUNCIL_INCLUDE_AGY=0 COUNCIL_INCLUDE_COPILOT=0 \
    bash "$SKILL/council.sh" crc8 "$blob" --repo "$r" --timeout 30 >/dev/null 2>&1
  assert_exit "$?" 1 "codex failed + agy intentionally disabled => exit 1 (nothing for CC to chair; quorum line stays correct unmodified)"
}

test_council_all_voices_redirect_stdin_from_devnull() {  # source-assertion (regression guard)
  # Confirmed live 2026-06-26: without "< /dev/null", codex sits on "Reading
  # additional input from stdin..." and is SIGKILLed by run_with_timeout's
  # watcher at the FULL $TIMEOUT bound on every non-interactive run (rc=137) —
  # silently misread in the past as a quota/auth issue, when it was really a
  # stdin hang masking whatever the real error was. Every voice invocation
  # (preflight or real call) must close stdin explicitly.
  local b; b="$(cat "$SKILL/council.sh" 2>/dev/null)"
  assert_contains "$b" '"$CODEX_BIN" exec -s read-only --skip-git-repo-check -C "$REPO" "$PROMPT" \
  < /dev/null' "codex invocation redirects stdin from /dev/null"
  assert_contains "$b" '"$AGY_BIN" --print --print-timeout "${TIMEOUT}s" --model "$AGY_MODEL" "$PROMPT" \
    < /dev/null' "agy invocation redirects stdin from /dev/null"
  assert_contains "$b" '"$COPILOT_BIN" copilot -- --help < /dev/null' "copilot preflight redirects stdin from /dev/null"
  assert_contains "$b" '"$COPILOT_BIN" copilot -p "$PROMPT" \
      < /dev/null' "copilot -p invocation redirects stdin from /dev/null"
}

test_council_quota_diagnostic_hints() {
  local r; r=$(mk_repo); local bin; bin=$(mktemp -d)
  _mk_codex_quota_exhausted "$bin"; _mk_agy_quota_exhausted "$bin"
  local blob; blob=$(mktemp); echo "diff" > "$blob"
  CODEX_BIN="$bin/codex" AGY_BIN="$bin/agy" COUNCIL_INCLUDE_COPILOT=0 \
    bash "$SKILL/council.sh" crc9 "$blob" --repo "$r" --timeout 30 >/dev/null 2>&1
  local codex_out agy_out
  codex_out="$(cat "$r/.orchestration/crc9/council/codex.out" 2>/dev/null)"
  agy_out="$(cat "$r/.orchestration/crc9/council/agy.out" 2>/dev/null)"
  assert_contains "$codex_out" "ChatGPT plan usage limit" "codex.out carries the usage-limit hint, not just the generic ABSENT message"
  assert_contains "$agy_out" "RESOURCE_EXHAUSTED/429" "agy.out carries the quota hint, not just the generic ABSENT message"
}
