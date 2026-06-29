#!/usr/bin/env bash
# Shim → .agents/skill-tiers/scripts/self_eval.sh
# Interface unchanged: record/report with same flags.
# The skill-tiers version adds optional --skill, --tier, --executor flags and
# reads drift_check/taste_checkpoint from .verdict.json. Callers not passing
# the new flags get the same behavior as before.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$DIR/../../../skill-tiers/scripts/self_eval.sh" "$@"
