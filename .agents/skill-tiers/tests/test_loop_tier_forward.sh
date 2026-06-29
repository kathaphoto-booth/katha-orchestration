#!/usr/bin/env bash
# test_loop_tier_forward.sh — regression test for the bug where loop.sh failed to
# forward --tier to delegate.sh.
#
# Fix: loop.sh DELEGATE_ARGS must include --tier N when --tier is passed.
# This test stubs delegate.sh to record its args and asserts --tier 2 is present.
set -euo pipefail

SCRIPTS="$(cd "$(dirname "${BASH_SOURCE[0]}")/../scripts" && pwd)"

TMPD="$(mktemp -d)"
trap 'rm -rf "$TMPD"' EXIT

# Minimal git repo so loop.sh checkpoint stubs pass.
REPO="$TMPD/repo"
mkdir -p "$REPO"
git -C "$REPO" init -q
git -C "$REPO" config user.email "test@loop-forward"
git -C "$REPO" config user.name "Test"
touch "$REPO/marker"
git -C "$REPO" add . && git -C "$REPO" commit -qm "init"

ARGS_LOG="$TMPD/delegate_args.txt"

# Stub: delegate.sh records its args and creates the run artifacts loop.sh expects.
cat > "$TMPD/delegate.sh" << EOF
#!/usr/bin/env bash
echo "\$@" >> "$ARGS_LOG"
REPO_ARG=""; RUN_ID=""
while [[ \$# -gt 0 ]]; do
  case "\$1" in
    --repo) REPO_ARG="\$2"; shift 2;;
    --run)  RUN_ID="\$2";   shift 2;;
    *) shift;;
  esac
done
RUNDIR="\$REPO_ARG/.orchestration/\$RUN_ID"
mkdir -p "\$RUNDIR"
printf 'STATUS: COMPLETE\n' > "\$RUNDIR/result.md"
printf '{"files_changed":[],"external_effects":[]}\n' > "\$RUNDIR/digest.json"
EOF

cat > "$TMPD/checkpoint.sh" << 'EOF'
#!/usr/bin/env bash
exit 0
EOF

cat > "$TMPD/verdict.sh" << EOF
#!/usr/bin/env bash
REPO_ARG=""
while [[ \$# -gt 0 ]]; do
  case "\$1" in --repo) REPO_ARG="\$2"; shift 2;; *) shift;; esac
done
printf '{"verdict":"PASS","reasons":[]}\n' > "\$REPO_ARG/.verdict.json"
exit 0
EOF

cat > "$TMPD/authority-guard.sh" << 'EOF'
#!/usr/bin/env bash
exit 0
EOF

cat > "$TMPD/self_eval.sh" << 'EOF'
#!/usr/bin/env bash
exit 0
EOF

chmod +x "$TMPD/delegate.sh" "$TMPD/checkpoint.sh" "$TMPD/verdict.sh" \
         "$TMPD/authority-guard.sh" "$TMPD/self_eval.sh"

cp "$SCRIPTS/lib.sh" "$TMPD/lib.sh"
cp "$SCRIPTS/loop.sh" "$TMPD/loop.sh"

# Run loop.sh with --tier 2 — it should forward --tier 2 to the stub delegate.sh.
bash "$TMPD/loop.sh" \
  --repo "$REPO" \
  --run "test-run-001" \
  --brief "test" \
  --executor copilot \
  --skill test-skill \
  --tier 2 \
  --timeout 10s \
  --max 1 \
  --gate none >/dev/null 2>&1

# Assert --tier 2 appeared in delegate.sh's received args.
if [[ -f "$ARGS_LOG" ]] && grep -q -- "--tier 2" "$ARGS_LOG"; then
  echo "PASS: --tier forwarded to delegate.sh"
  exit 0
else
  echo "FAIL: --tier NOT forwarded to delegate.sh"
  echo "  delegate args received: $(cat "$ARGS_LOG" 2>/dev/null || echo '<none>')"
  exit 1
fi
