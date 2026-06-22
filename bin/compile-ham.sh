#!/usr/bin/env bash
set -euo pipefail

VAULT="/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory"

if [[ ! -d "$VAULT" ]]; then
  echo "Error: Vault directory $VAULT is unreachable." >&2
  exit 1
fi

OUT="$VAULT/COMPILED_HAM.md"
# self-lock so a kickoff-compile (agy-tier-run) and a sync-compile cannot
# interleave. Nestable via COMPILE_HAM_NESTED: sync.sh already holds this
# same lock for its own duration and calls us as its last step — we must
# not try to re-acquire our own caller's lock.
LOCK="$VAULT/.sync.lock"
if [[ "${COMPILE_HAM_NESTED:-}" != "1" ]]; then
  if ! (set -C; echo $$ > "$LOCK") 2>/dev/null; then
    echo "compile-ham: lock held ($LOCK); another compile/sync in progress" >&2
    exit 3
  fi
  trap 'rm -f "$LOCK"' EXIT
fi
TMP=$(mktemp "$VAULT/.COMPILED_HAM.md.XXXXXX")

# --- preflight: every core node must exist and be non-empty before we compile.
#     A missing/truncated node now fails LOUDLY here instead of producing a
#     silently-incomplete COMPILED_HAM.md that a booting agent then trusts. ---
CORE_NODES=(SESSION_HANDOFF.json decisions.md patterns.md inbox.md memory.md instructions.md)
for node in "${CORE_NODES[@]}"; do
  if [[ ! -s "$VAULT/$node" ]]; then
    echo "FATAL: core HAM node missing or empty: $VAULT/$node" >&2
    echo "Refusing to compile a partial COMPILED_HAM.md." >&2
    exit 1
  fi
done

echo "# HIERARCHICAL AGENT MEMORY (HAM) VAULT" > "$TMP"

echo "## 1. SESSION_HANDOFF.json" >> "$TMP"
cat "$VAULT/SESSION_HANDOFF.json" >> "$TMP"

echo -e "\n## 2. decisions.md" >> "$TMP"
cat "$VAULT/decisions.md" >> "$TMP"

echo -e "\n## 3. patterns.md" >> "$TMP"
cat "$VAULT/patterns.md" >> "$TMP"

echo -e "\n## 4. inbox.md" >> "$TMP"
cat "$VAULT/inbox.md" >> "$TMP"

echo -e "\n## 5. memory.md" >> "$TMP"
cat "$VAULT/memory.md" >> "$TMP"

echo -e "\n## 6. instructions.md" >> "$TMP"
cat "$VAULT/instructions.md" >> "$TMP"

echo -e "\n## 7. handoff/" >> "$TMP"
# Loop through non-underscore files in handoff/
shopt -s nullglob
for f in "$VAULT"/handoff/*.md; do
  filename=$(basename "$f")
  if [[ "$filename" != _* ]]; then
    echo -e "\n### File: $filename" >> "$TMP"
    cat "$f" >> "$TMP"
  fi
done
shopt -u nullglob

# --- completion sentinel: lets any consumer confirm the compile finished rather
#     than catching a half-written file. grep for this marker to validate. ---
LINES=$(wc -l < "$TMP" | tr -d ' ')
printf '\n# END OF COMPILED_HAM — %s lines, 6 core nodes + handoff/\n' "$LINES" >> "$TMP"

mv "$TMP" "$OUT"   # atomic publish — readers see all-or-nothing
