#!/usr/bin/env bash
# Shim → .agents/skill-tiers/scripts/loop.sh --executor agy
# Interface unchanged: --repo, --vault, --run, --brief, --max, --timeout, --gate
# The skill-tiers version adds optional --executor (defaulting to agy when
# called through this shim), --skill, and --phase flags.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
exec "$DIR/../../../skill-tiers/scripts/loop.sh" --executor agy "$@"
