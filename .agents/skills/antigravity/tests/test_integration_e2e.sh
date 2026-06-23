#!/usr/bin/env bash
# Tests the DOCUMENTED loop (checkpoint -> delegate -> verdict) end-to-end against
# ONE shared repo — the gap that let the self-leak bug ship. Unit tests for the
# individual scripts are not enough; they each mock away the other scripts' output.

test_integration_honest_zero_edit_run_passes() {
  source "$SKILL/lib.sh"
  local r; r=$(mk_repo); local v; v=$(mk_vault); local bin; bin=$(mktemp -d)
  bash "$SKILL/checkpoint.sh" snapshot int1 "$r" "$v" >/dev/null

  printf '#!/usr/bin/env bash\nprintf "did nothing\\nSTATUS: COMPLETE\\n" > "$AGY_OUT/result.md"\nexit 0\n' > "$bin/agy"
  chmod +x "$bin/agy"
  AGY_BIN="$bin/agy" PATH="$bin:$PATH" bash "$SKILL/delegate_agy.sh" --repo "$r" --run int1 --brief "do nothing" >/dev/null 2>&1
  assert_exit "$?" 0 "delegate_agy: honest no-op run reports OK"

  local dg; dg=$(mktemp)
  echo '{"files_touched":[],"external_effects":[]}' > "$dg"
  bash "$SKILL/verdict.sh" --repo "$r" --digest "$dg" --gate none >/dev/null 2>&1
  assert_exit "$?" 0 "verdict.sh: honest zero-edit run PASSES (not a false leak on the harness's own bookkeeping)"
}
