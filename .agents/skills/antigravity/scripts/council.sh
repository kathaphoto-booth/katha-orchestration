#!/usr/bin/env bash
# Shim → .agents/skill-tiers/scripts/council.sh
# Interface unchanged: <run_id> <text-or-diff-file> [--repo <dir>] [--timeout <secs>]
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
exec "$DIR/../../../skill-tiers/scripts/council.sh" "$@"
