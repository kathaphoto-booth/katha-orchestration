#!/usr/bin/env bash
# test_loop_tier_flag.sh — smoke test: --tier forwarded from loop.sh to self_eval.sh ledger
#
# GAP 7 fix (T3): verifies that:
#   (a) loop.sh --tier N => self_eval.sh receives --tier N => ledger has {"tier":N}
#   (b) loop.sh (no --tier) => self_eval.sh omits --tier => ledger has {"tier":null}
set -euo pipefail

SCRIPTS="$(cd "$(dirname "${BASH_SOURCE[0]}")/../scripts" && pwd)"

pass=0; fail=0
ok()   { echo "  PASS: $1"; pass=$((pass+1)); }
fail() { echo "  FAIL: $1" >&2; fail=$((fail+1)); }

TMPD="$(mktemp -d)"
trap 'rm -rf "$TMPD"' EXIT

REPO="$TMPD/repo"
mkdir -p "$REPO"
git -C "$REPO" init -q
git -C "$REPO" config user.email "test@loop-tier"
git -C "$REPO" config user.name "Test"
touch "$REPO/marker"
git -C "$REPO" add . && git -C "$REPO" commit -qm "init"

# --- Shared fakes (placed in $TMPD so $DIR == $TMPD for the copied loop.sh) ---

cat > "$TMPD/delegate.sh" << 'EOF'
#!/usr/bin/env bash
REPO_ARG=""; RUN_ID=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo) REPO_ARG="$2"; shift 2;;
    --run)  RUN_ID="$2";   shift 2;;
    *)      shift;;
  esac
done
RUNDIR="$REPO_ARG/.orchestration/$RUN_ID"
mkdir -p "$RUNDIR"
printf 'STATUS: COMPLETE\n' > "$RUNDIR/result.md"
printf '{"files_changed":[],"external_effects":[]}\n' > "$RUNDIR/digest.json"
EOF

cat > "$TMPD/checkpoint.sh" << 'EOF'
#!/usr/bin/env bash
exit 0
EOF

cat > "$TMPD/verdict.sh" << 'EOF'
#!/usr/bin/env bash
REPO_ARG=""
while [[ $# -gt 0 ]]; do
  case "$1" in --repo) REPO_ARG="$2"; shift 2;; *) shift;; esac
done
printf '{"verdict":"PASS","reasons":[]}\n' > "$REPO_ARG/.verdict.json"
exit 0
EOF

cat > "$TMPD/authority-guard.sh" << 'EOF'
#!/usr/bin/env bash
exit 0
EOF

cp "$SCRIPTS/lib.sh" "$TMPD/lib.sh"
cp "$SCRIPTS/loop.sh" "$TMPD/loop.sh"

# self_eval.sh template — __LEDGER__ substituted per-run below
SE_TPL="$TMPD/self_eval_tpl.sh"
cat > "$SE_TPL" << 'EOF'
#!/usr/bin/env bash
TIER=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --tier) TIER="$2"; shift 2;;
    *) shift;;
  esac
done
printf '{"tier":%s}\n' "${TIER:-null}" >> "__LEDGER__"
EOF

chmod +x "$TMPD/delegate.sh" "$TMPD/checkpoint.sh" "$TMPD/verdict.sh" \
         "$TMPD/authority-guard.sh"

# ─── Test A: --tier 1 appears in ledger ──────────────────────────────────────
echo "Test A: --tier 1 forwarded to ledger"

LEDGER_A="$TMPD/ledger_a.jsonl"
sed "s|__LEDGER__|$LEDGER_A|g" "$SE_TPL" > "$TMPD/self_eval.sh"
chmod +x "$TMPD/self_eval.sh"

bash "$TMPD/loop.sh" \
  --repo "$REPO" \
  --run "tier-a" \
  --brief "smoke: tier flag" \
  --executor "copilot" \
  --skill "test-skill" \
  --tier 1 \
  --max 1 \
  --gate none >/dev/null 2>&1

if [[ ! -f "$LEDGER_A" ]]; then
  fail "ledger_a not created"
else
  TIER_VAL="$(jq -r '.tier' "$LEDGER_A" 2>/dev/null || echo "ERR")"
  if [[ "$TIER_VAL" == "1" ]]; then
    ok "tier:1 written to ledger when --tier 1 passed"
  else
    fail "expected tier 1 in ledger, got '$TIER_VAL'"
  fi
fi

# ─── Test B: no --tier => null in ledger ─────────────────────────────────────
echo "Test B: omitting --tier yields tier:null"

LEDGER_B="$TMPD/ledger_b.jsonl"
sed "s|__LEDGER__|$LEDGER_B|g" "$SE_TPL" > "$TMPD/self_eval.sh"
chmod +x "$TMPD/self_eval.sh"

bash "$TMPD/loop.sh" \
  --repo "$REPO" \
  --run "tier-b" \
  --brief "smoke: no tier flag" \
  --executor "copilot" \
  --max 1 \
  --gate none >/dev/null 2>&1

if [[ ! -f "$LEDGER_B" ]]; then
  fail "ledger_b not created"
else
  TIER_VAL2="$(jq -r '.tier' "$LEDGER_B" 2>/dev/null || echo "ERR")"
  if [[ "$TIER_VAL2" == "null" ]]; then
    ok "tier:null when --tier omitted (no spurious forwarding)"
  else
    fail "expected null in ledger, got '$TIER_VAL2'"
  fi
fi

# ─── Summary ─────────────────────────────────────────────────────────────────
echo ""
echo "=== Results: $pass passed, $fail failed ==="
[[ "$fail" -eq 0 ]]
