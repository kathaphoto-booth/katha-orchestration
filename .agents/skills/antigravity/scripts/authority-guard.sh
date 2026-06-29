#!/usr/bin/env bash
# Shim → .agents/skill-tiers/scripts/authority-guard.sh
# DO NOT source this file — exec semantics will terminate the calling shell.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$DIR/../../../skill-tiers/scripts/authority-guard.sh" "$@"
