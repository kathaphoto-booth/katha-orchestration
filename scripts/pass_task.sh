#!/usr/bin/env bash
set -euo pipefail

TASK="${1:-}"
if [[ -z "$TASK" ]]; then
    echo "Usage: $0 \"<task description>\""
    exit 1
fi

CODE_FILE="codex_output.tmp"
PROMPT_FILE="agy_prompt.tmp"

echo "🤖 Step 1: Running Codex (Qwen 2.5) to generate code..."
echo "Please implement the following task: $TASK" | codex exec "$TASK" > "$CODE_FILE" || {
    echo "❌ Error: Codex execution failed."
    exit 1
}

if [ ! -s "$CODE_FILE" ]; then
    echo "❌ Error: Codex output was empty."
    rm -f "$CODE_FILE"
    exit 1
fi

echo "✅ Codex output saved to $CODE_FILE"
echo "🤖 Step 2: Routing code to agy CLI for sandbox testing..."

echo "Review the generated code in $CODE_FILE. Apply it to the workspace, run the test suite, and fix any breaking bugs." > "$PROMPT_FILE"

# Provide agy with the files/context to do its job
"/Volumes/samsung 970 pro - Data/KATHA_VAULT/bin/agy" -p "$(cat "$PROMPT_FILE")" --add-dir "$(pwd)" --add-dir "/Volumes/samsung 970 pro - Data/KATHA_VAULT/knowledge" --model "Gemini 3.5 Flash (Medium)"

rm -f "$CODE_FILE" "$PROMPT_FILE"
echo "🏁 Process complete. Review the results above before committing to Claude!"
