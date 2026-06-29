#!/usr/bin/env bash
# Shim → .agents/skill-tiers/scripts/checkpoint.sh
# Interface unchanged: <snapshot|rollback|status> <run_id> <repo> <vault>
# The skill-tiers version accepts vault as an optional 4th arg (backward compatible).
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
exec "$DIR/../../../skill-tiers/scripts/checkpoint.sh" "$@"
