#!/usr/bin/env bash
set -euo pipefail

VAULT="/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge/.memory"

if [[ ! -d "$VAULT" ]]; then
  echo "Error: Vault directory $VAULT is unreachable." >&2
  exit 1
fi

OUT="$VAULT/COMPILED_HAM.md"

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

echo "# HIERARCHICAL AGENT MEMORY (HAM) VAULT" > "$OUT"

echo "## 1. SESSION_HANDOFF.json" >> "$OUT"
cat "$VAULT/SESSION_HANDOFF.json" >> "$OUT"

echo -e "\n## 2. decisions.md" >> "$OUT"
cat "$VAULT/decisions.md" >> "$OUT"

echo -e "\n## 3. patterns.md" >> "$OUT"
cat "$VAULT/patterns.md" >> "$OUT"

echo -e "\n## 4. inbox.md" >> "$OUT"
cat "$VAULT/inbox.md" >> "$OUT"

echo -e "\n## 5. memory.md" >> "$OUT"
cat "$VAULT/memory.md" >> "$OUT"

echo -e "\n## 6. instructions.md" >> "$OUT"
cat "$VAULT/instructions.md" >> "$OUT"

echo -e "\n## 7. handoff/" >> "$OUT"
# Loop through non-underscore files in handoff/
shopt -s nullglob
for f in "$VAULT"/handoff/*.md; do
  filename=$(basename "$f")
  if [[ "$filename" != _* ]]; then
    echo -e "\n### File: $filename" >> "$OUT"
    cat "$f" >> "$OUT"
  fi
done
shopt -u nullglob

# --- completion sentinel: lets any consumer confirm the compile finished rather
#     than catching a half-written file. grep for this marker to validate. ---
LINES=$(wc -l < "$OUT" | tr -d ' ')
printf '\n# END OF COMPILED_HAM — %s lines, 6 core nodes + handoff/\n' "$LINES" >> "$OUT"
