#!/usr/bin/env bash
# smoke_e2e_manual.sh — manual, non-hermetic smoke test of the REAL orchestration
# entrypoints (loop.sh, council.sh, self_eval.sh) wired together in one temp repo
# + temp vault. NOT part of run.sh's auto-discovered suite (no test_ prefix) —
# this hits a real codex process and is meant for occasional human verification,
# not CI. Cleans up after itself; never touches the real repo or real vault.
set -euo pipefail
SKILL="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/scripts"
source "$SKILL/lib.sh"

WORK="$(mktemp -d)"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

REPO="$WORK/repo"; VAULT="$WORK/vault"; BIN="$WORK/bin"
mkdir -p "$REPO" "$VAULT/handoff" "$BIN"
git -C "$REPO" init -q
git -C "$REPO" config user.email smoke@test; git -C "$REPO" config user.name smoke
echo base > "$REPO/a.txt"; git -C "$REPO" add -A; git -C "$REPO" commit -qm init
printf '# inbox\n' > "$VAULT/inbox.md"

cat > "$BIN/agy" <<'STUB'
#!/usr/bin/env bash
echo "smoke change" >> a.txt
printf 'did it\nSTATUS: COMPLETE\n' > "$AGY_OUT/result.md"
printf '{"files_touched":["a.txt"],"external_effects":[]}' > "$AGY_OUT/digest.json"
exit 0
STUB
chmod +x "$BIN/agy"

echo "=== [1/3] loop.sh real entrypoint, stubbed agy, --gate none ==="
( cd "$REPO" && AGY_BIN="$BIN/agy" PATH="$BIN:$PATH" \
    bash "$SKILL/loop.sh" --repo "$REPO" --vault "$VAULT" --run smoke1 \
      --brief "append a line to a.txt" --max 1 --gate none )
[[ -f "$REPO/.orchestration/smoke1-attempt1/digest.json" ]] || { echo "SMOKE FAIL: no digest written"; exit 1; }
[[ -f "$REPO/.orchestration/ledger.jsonl" ]] || { echo "SMOKE FAIL: self_eval ledger not written"; exit 1; }

echo "=== [2/3] council.sh on loop's own result.md — real codex, agy disabled ==="
# council.sh exits 1 when codex AND agy are both ABSENT — by design (nothing for
# CC to chair). Whether any voice is actually live today is an ACCOUNT-STATE fact
# (quota/auth/installation), not something this smoke test can control or should
# fail on. set +e here on purpose: we're checking that council.sh ran and produced
# a structurally valid council.json, not that any particular voice answered today.
set +e
COUNCIL_INCLUDE_AGY=0 \
  bash "$SKILL/council.sh" smoke1-council "$REPO/.orchestration/smoke1-attempt1/result.md" \
    --repo "$REPO" --timeout 60
COUNCIL_RC=$?
set -e
CJ="$REPO/.orchestration/smoke1-council/council/council.json"
[[ -f "$CJ" ]] || { echo "SMOKE FAIL: no council.json"; exit 1; }
jq -e '.voices.codex and .voices.agy and .voices.copilot' "$CJ" >/dev/null \
  || { echo "SMOKE FAIL: council.json missing a voice entry"; exit 1; }
echo "council.sh exit=$COUNCIL_RC (informational — voice availability is account state, not wiring):"
jq -r '.voices | to_entries[] | "  \(.key): \(.value.status)"' "$CJ"

echo "=== [3/3] self_eval.sh report ==="
bash "$SKILL/self_eval.sh" report --repo "$REPO"

echo "SMOKE OK — loop.sh, council.sh, self_eval.sh ran as real entrypoints, end to end."
