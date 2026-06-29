#!/usr/bin/env bash
# Shim → .agents/skill-tiers/scripts/delegate.sh --executor agy
# Interface unchanged: --repo <dir> --run <id> --brief <text> [--timeout 5m]
# The generalized core lives in skill-tiers; this shim preserves antigravity's
# public interface and passes all args through unchanged.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
exec "$DIR/../../../skill-tiers/scripts/delegate.sh" --executor agy "$@"
