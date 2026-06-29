#!/usr/bin/env bash
# Shim → .agents/skill-tiers/scripts/authority-guard.sh
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$DIR/../../../skill-tiers/scripts/authority-guard.sh" "$@"
