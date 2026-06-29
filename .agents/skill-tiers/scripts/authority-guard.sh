#!/usr/bin/env bash
# authority-guard.sh <file> : exit 1 if the file (presumed agy-authored) asserts
# a human-authority decision (e.g. "Jed approved X"). agy is structurally not a
# valid witness for canon-law claims — see docs/superpowers/specs/2026-06-22-orchestration-layer-design.md
# "agy-not-witness" principle. Deliberately coarse: false positives (a human
# re-reads a flagged file) are cheap; false negatives (an injected claim slips
# through into canon) are not. Do not try to make this pattern "smarter."
#
# Fix C3a (intercalated-word bypass): changed [[:space:]]+ to [[:space:]][^.!?]*
# so "Jed definitely approved" or "Jed said he approved" are both caught.
# Fix C3b (multiline bypass): secondary awk pass detects name-only line
# immediately followed by a verb line, which grep's line-by-line scan misses.
set -euo pipefail
FILE="${1:?usage: authority-guard.sh <file>}"

NAMES='(Jed|CC|Vince|Misty|Brock)'
VERBS='(approved|decided|rescinded|authorized|confirmed|locked|retired|granted|has final authority)'

# Buffer non-regular-files (pipes, /dev/stdin) so both passes can read the same content.
# grep and awk each need a full read; a pipe can only be consumed once.
_TMPFILE=""
if [ ! -f "$FILE" ] || [ "$FILE" = "/dev/stdin" ]; then
  _TMPFILE=$(mktemp /tmp/authority-guard.XXXXXX)
  cat "$FILE" > "$_TMPFILE"
  FILE="$_TMPFILE"
fi
# Use `|| true` so set -e does not fire on the false branch of the [ ] test.
_cleanup() { [ -n "$_TMPFILE" ] && rm -f "$_TMPFILE" || true; }
trap _cleanup EXIT

# Pass 1 — single-line check (intercalated words allowed between name and verb)
PATTERN="${NAMES}[[:space:]][^.!?]*${VERBS}"
if grep -nEi "$PATTERN" "$FILE" >&2; then
  echo "BLOCKED: agy-authored text claims human authority (above). agy cannot witness canon." >&2
  exit 1
fi

# Pass 2 — multiline check: name on line N, verb on line N+1
# macOS awk (one true awk) does not support IGNORECASE; use tolower() instead.
# awk exits with code 1 on a match; the if-else block detects that.
if awk '
  function matches_name(s,    l) { l=tolower(s); return (l=="jed"||l=="cc"||l=="vince"||l=="misty"||l=="brock") }
  function matches_verb(s,    l) { l=tolower(s); return (l~/approved/||l~/decided/||l~/rescinded/||l~/authorized/||l~/confirmed/||l~/locked/||l~/retired/||l~/granted/||l~/has final authority/) }
  { trimmed=$0; gsub(/^[[:space:]]+|[[:space:]]+$/, "", trimmed) }
  matches_name(trimmed) { found=NR }
  found && NR==found+1 && matches_verb($0) { exit 1 }
  ' "$FILE"; then
  : # no multiline violation
else
  echo "BLOCKED: agy-authored text claims human authority (multiline split). agy cannot witness canon." >&2
  exit 1
fi

exit 0
