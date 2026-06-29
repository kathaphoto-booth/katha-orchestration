#!/usr/bin/env bash
# Shim → .agents/skill-tiers/scripts/lib.sh
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
[[ -f "$DIR/../../../skill-tiers/scripts/lib.sh" ]] || { echo "FATAL: skill-tiers/scripts/lib.sh not found — is skill-tiers checked out?" >&2; exit 1; }
# shellcheck source=../../../skill-tiers/scripts/lib.sh
# source (not exec): lib.sh is a library of functions, not a standalone script
source "$DIR/../../../skill-tiers/scripts/lib.sh"
