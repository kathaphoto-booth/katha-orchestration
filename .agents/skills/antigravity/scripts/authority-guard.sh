#!/usr/bin/env bash
# authority-guard.sh <file> : exit 1 if the file (presumed agy-authored) asserts
# a human-authority decision (e.g. "Jed approved X"). agy is structurally not a
# valid witness for canon-law claims — see docs/superpowers/specs/2026-06-22-orchestration-layer-design.md
# "agy-not-witness" principle. Deliberately coarse: false positives (a human
# re-reads a flagged file) are cheap; false negatives (an injected claim slips
# through into canon) are not. Do not try to make this pattern "smarter."
set -euo pipefail
FILE="${1:?usage: authority-guard.sh <file>}"
PATTERN='(Jed|CC|Vince|Misty|Brock)[[:space:]]+(approved|decided|rescinded|authorized|confirmed|locked|retired|granted|has final authority)'
if grep -nEi "$PATTERN" "$FILE" >&2; then
  echo "BLOCKED: agy-authored text claims human authority (above). agy cannot witness canon." >&2
  exit 1
fi
exit 0
