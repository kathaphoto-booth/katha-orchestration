#!/usr/bin/env bash

# sniper-loop.sh
TARGET_URL="$1"
PORT=3000
NEXT_JS_SRC="app/page.tsx"
BACKUP_FILE="${NEXT_JS_SRC}.bak"
NEXT_PROJECT_DIR="photobooth-template-studio"

if [ -z "$TARGET_URL" ]; then
  echo "Usage: ./sniper-loop.sh <URL>"
  exit 1
fi

# 1. Port Check: Ensure no other service is already binding $PORT
if lsof -i :$PORT >/dev/null 2>&1; then
  echo "Error: Port $PORT is already in use by another process. Exiting."
  exit 1
fi

# Load Env
if [ -f ".llm_wiki_vault/.env" ]; then
  set -a
  source .llm_wiki_vault/.env
  set +a
fi

# Step 1: Ingest Design
node fetch.js "$TARGET_URL"

# Move into Next.js directory
if [ -d "$NEXT_PROJECT_DIR" ]; then
  cd "$NEXT_PROJECT_DIR" || exit 1
else
  echo "Error: Next.js project directory not found."
  exit 1
fi

# Ensure Next.js project root context
if [ ! -f "package.json" ]; then
  echo "Error: Must be run in a Next.js project root."
  exit 1
fi

# --- Safety/Rollback System ---
# Backup the current page before starting modifications
if [ -f "$NEXT_JS_SRC" ]; then
  cp "$NEXT_JS_SRC" "$BACKUP_FILE"
else
  # Write empty placeholder backup if page doesn't exist
  touch "$BACKUP_FILE"
fi

cleanup() {
  echo "Cleaning up local server process..."
  kill $SERVER_PID 2>/dev/null || true
  
  # Restore backup on failure or signal exit
  if [ -f "$BACKUP_FILE" ]; then
    echo "Restoring target source from backup..."
    if [ ! -s "$BACKUP_FILE" ]; then
      rm -f "$NEXT_JS_SRC"
    else
      mv "$BACKUP_FILE" "$NEXT_JS_SRC"
    fi
    rm -f "$BACKUP_FILE"
  fi
}
trap cleanup EXIT

# --- Helper Function for Copilot ---
run_evolution() {
  local ERROR_LOG="$1"
  local ERROR_CONTEXT=""
  
  if [ -s "$ERROR_LOG" ]; then
    # Read the error context to feed back to Copilot on retries
    ERROR_CONTEXT="The previous attempt failed with this error: $(cat $ERROR_LOG). Please fix these console/hydration errors and produce clean React code."
  fi

  echo "[Orchestrator] Generating code via Copilot CLI..."

  # Construct prompt targeting Next.js source code (remember we are in a subfolder now)
  local PROMPT="Read UI requirements from ../.llm_wiki_vault/raw/target_raw.md. Write a production-ready Next.js React component using Tailwind CSS. $ERROR_CONTEXT. Use your tools to directly overwrite the $NEXT_JS_SRC file with the new code. Do not ask for permission, just do it."

  # Execute Copilot
  gh copilot -p "$PROMPT" --allow-all-tools -s
}

# --- Main loop ---

# Start Next.js dev server in background for testing
echo "Starting Next.js dev server on port $PORT..."
npm run dev -- -p $PORT &
SERVER_PID=$!

# 2. Server Boot Health check (Poll HTTP port)
echo "Waiting for Next.js dev server to start on port $PORT..."
TIMEOUT=30
COUNT=0
while ! curl -s -f "http://localhost:$PORT" > /dev/null; do
  sleep 1
  COUNT=$((COUNT+1))
  if [ $COUNT -eq $TIMEOUT ]; then
    echo "Error: Next.js dev server failed to start within $TIMEOUT seconds. Aborting."
    exit 1
  fi
done
echo "Next.js dev server is up and responsive."

MAX_EVOLUTION_LOOPS=5
CURRENT_LOOP=1
ERROR_LOG="/tmp/playwright_error.log"

# Clear previous log
> "$ERROR_LOG"

while [ $CURRENT_LOOP -le $MAX_EVOLUTION_LOOPS ]
do
 echo "=== Beginning Evolution Loop: $CURRENT_LOOP ==="
  
 # 1. Generate/Modify Code
 run_evolution "$ERROR_LOG"

 # 2. Wait for Next.js HMR compilation
 echo "Waiting for Hot Module Replacement (HMR) to compile changes..."
 sleep 5
 
 # Run verification and pipe stderr (exceptions/hydration issues) to error log
 TARGET_URL="http://localhost:$PORT" node ../verify-layout.js 2> "$ERROR_LOG"
 HARNESS_EXIT_CODE=$?

 if [ $HARNESS_EXIT_CODE -eq 0 ]; then
   echo "[Success] Copilot generated valid, clean code at Loop $CURRENT_LOOP."
   # Disarm the rollback since execution succeeded
   rm -f "$BACKUP_FILE"
   exit 0
 else
   echo "[Loop Rejection] Fault detected. Storing logs for feedback..."
   ((CURRENT_LOOP++))
 fi
done

echo "[Failure] Max loops reached without successful build. Rolling back..."
exit 1
