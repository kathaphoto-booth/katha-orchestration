#!/usr/bin/env bash
# Tests for scripts/council.sh — the 2-voice read-only critique collector.
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
# An agy stub that succeeds with output. council.sh invokes:
#   agy --print --print-timeout <t>s --model <m> <prompt>
_mk_agy_ok() { printf '#!/usr/bin/env bash\necho "agy critique: ship it"\nexit 0\n' > "$1/agy"; chmod +x "$1/agy"; }
_mk_agy_fail() { printf '#!/usr/bin/env bash\nexit 1\n' > "$1/agy"; chmod +x "$1/agy"; }

# A copilot stub (gh wrapper) that succeeds. council.sh's pre-flight probes
# `gh copilot --help` before ever attempting the real `-p` prompted call (to
# avoid triggering a first-run download blind) — the stub must answer both.
_mk_copilot_ok() {
  printf '#!/usr/bin/env bash\nif [[ "$1" == "copilot" && "$2" == "--help" ]]; then exit 0; fi\nif [[ "$1" == "copilot" && "$2" == "-p" ]]; then echo "copilot critique: looks fine"; exit 0; fi\nexit 1\n' > "$1/gh"
  chmod +x "$1/gh"
}
# Simulates `gh` installed but the underlying Copilot CLI not downloaded —
# `gh copilot --help` fails fast (rc=1), matching real gh's verified behavior
# when the Copilot CLI sub-binary isn't present. council.sh must never reach
# the real `-p` call in this case.
_mk_copilot_absent() {
  printf '#!/usr/bin/env bash\nexit 1\n' > "$1/gh"
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
