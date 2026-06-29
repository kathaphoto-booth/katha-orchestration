#!/usr/bin/env bash
# Shim → .agents/skill-tiers/scripts/verdict.sh
# Interface unchanged: --repo <dir> --digest <json> [--gate fast|full|none]
# The skill-tiers version adds --prev-digest, --prev-screenshot, --curr-screenshot
# (all optional; callers not passing them get the same behavior as before).
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$DIR/../../../skill-tiers/scripts/verdict.sh" "$@"
