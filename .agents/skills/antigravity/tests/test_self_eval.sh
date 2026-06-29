#!/usr/bin/env bash
# self_eval.sh — the honest, deterministic self-improvement ledger.
#
# Philosophy (Jed): honesty + consistency + accuracy + self-admitting faulty
# data is the simplest way. So self_eval NEVER trusts a run's self-report; it
# grades each delegation against git-truth (.verdict.json from verdict.sh) and
# records `honest:false` whenever a run CLAIMED success but the gate disagreed —
# the "AG overstated completion" failure mode, now measured per run. Missing
# inputs (e.g. no token count) are recorded as null, never faked.

test_self_eval_flags_overstated_completion() {        # the core: self-admit dishonesty
  source "$SKILL/lib.sh"
  local d; d=$(mktemp -d); mkdir -p "$d/.orchestration/r1"
  printf '{"status":"FAIL","gate":"skipped","real_changes":["x.ts"],"reasons":["unclaimed change: x.ts"]}' > "$d/.verdict.json"
  printf 'work done\nSTATUS: COMPLETE\n' > "$d/.orchestration/r1/result.md"   # run CLAIMS complete
  bash "$SKILL/self_eval.sh" record --run r1 --repo "$d" >/dev/null 2>&1
  local line; line=$(tail -n1 "$d/.agents/skill-tiers/state/ledger.jsonl")
  assert_eq "$(printf '%s' "$line" | jq -r '.honest')" "false" "claimed COMPLETE but gate FAILed => honest:false (self-admit)"
  assert_eq "$(printf '%s' "$line" | jq -r '.verdict')" "FAIL" "verdict is taken from git-truth .verdict.json, not the claim"
}

test_self_eval_pass_with_matching_claim_is_honest() {
  source "$SKILL/lib.sh"
  local d; d=$(mktemp -d); mkdir -p "$d/.orchestration/r2"
  printf '{"status":"PASS","gate":"tsc:pass","real_changes":["a.ts","b.ts"],"reasons":[]}' > "$d/.verdict.json"
  printf 'done\nSTATUS: COMPLETE\n' > "$d/.orchestration/r2/result.md"
  bash "$SKILL/self_eval.sh" record --run r2 --repo "$d" --tokens 2000 >/dev/null 2>&1
  local line; line=$(tail -n1 "$d/.agents/skill-tiers/state/ledger.jsonl")
  assert_eq "$(printf '%s' "$line" | jq -r '.honest')" "true" "PASS + claimed-complete => honest:true"
  assert_eq "$(printf '%s' "$line" | jq -r '.t2d')" "1000" "T2D = tokens(2000)/lines(2) = 1000"
}

test_self_eval_admits_missing_tokens() {              # never fake a metric
  source "$SKILL/lib.sh"
  local d; d=$(mktemp -d); mkdir -p "$d/.orchestration/r3"
  printf '{"status":"PASS","gate":"skipped","real_changes":["a.ts"],"reasons":[]}' > "$d/.verdict.json"
  printf 'done\nSTATUS: COMPLETE\n' > "$d/.orchestration/r3/result.md"
  bash "$SKILL/self_eval.sh" record --run r3 --repo "$d" >/dev/null 2>&1   # no --tokens
  local line; line=$(tail -n1 "$d/.agents/skill-tiers/state/ledger.jsonl")
  assert_eq "$(printf '%s' "$line" | jq -r '.t2d')" "null" "no token count => t2d null (self-admit missing data, not 0)"
}

test_self_eval_report_surfaces_dishonesty() {         # the loop: report flags what to graduate
  source "$SKILL/lib.sh"
  local d; d=$(mktemp -d); mkdir -p "$d/.orchestration/rA" "$d/.orchestration/rB"
  # one dishonest run...
  printf '{"status":"FAIL","gate":"skipped","real_changes":["x.ts"],"reasons":["unclaimed change: x.ts"]}' > "$d/.verdict.json"
  printf 'x\nSTATUS: COMPLETE\n' > "$d/.orchestration/rA/result.md"
  bash "$SKILL/self_eval.sh" record --run rA --repo "$d" >/dev/null 2>&1
  # ...then one honest run
  printf '{"status":"PASS","gate":"tsc:pass","real_changes":["y.ts"],"reasons":[]}' > "$d/.verdict.json"
  printf 'y\nSTATUS: COMPLETE\n' > "$d/.orchestration/rB/result.md"
  bash "$SKILL/self_eval.sh" record --run rB --repo "$d" >/dev/null 2>&1
  local out; out=$(bash "$SKILL/self_eval.sh" report --repo "$d" 2>&1)
  assert_contains "$out" "dishonest" "report names dishonest runs"
  assert_contains "$out" "graduate" "report flags a graduation action (write a RED test)"
}
