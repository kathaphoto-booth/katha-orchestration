#!/usr/bin/env bash
# Tests for lib.sh's shared redact() — the single secret-scrubber used by
# delegate_agy.sh (agy.log), council.sh (voice output), and loop.sh (jsonl).
# Adversarial review (2026-06-24) found the original per-script copies were
# case-sensitive and missed multi-line PEM blocks; these tests lock the fixes.

_redact() { printf '%s' "$1" | redact; }       # helper: run a string through redact()

test_redact_lowercase_sk_token() {
  source "$SKILL/lib.sh"
  assert_contains "$(_redact 'key=sk-abcdefghijklmnopqrstuvwxyz1234')" "REDACTED" "lowercase sk- token redacted"
  assert_not_contains "$(_redact 'key=sk-abcdefghijklmnopqrstuvwxyz1234')" "sk-abcdefghijklmnopqrstuvwxyz1234" "raw sk- token gone"
}

test_redact_uppercase_sk_token() {              # finding #4: case-sensitivity bypass
  source "$SKILL/lib.sh"
  assert_contains "$(_redact 'KEY=SK-ABCDEFGHIJKLMNOPQRSTUVWXYZ1234')" "REDACTED" "UPPERCASE SK- token redacted (case-insensitive)"
}

test_redact_google_aiza_key() {
  source "$SKILL/lib.sh"
  assert_contains "$(_redact 'g=AIzaSyA1234567890abcdefghijklmnopqrstu')" "REDACTED" "Google AIza key redacted"
}

test_redact_short_slack_token() {               # finding #7: undershoot threshold
  source "$SKILL/lib.sh"
  assert_contains "$(_redact 'tok=xoxb-1234567890')" "REDACTED" "Slack xoxb- token redacted"
}

test_redact_multiline_pem_block() {             # finding #5: line-spanning PEM bypass
  source "$SKILL/lib.sh"
  local pem; pem=$'-----BEGIN RSA PRIVATE KEY-----\nMIIBxQYJKoZIhvcNNOTAREALKEYjustbase64lookingfiller1234567890ABCD\n-----END RSA PRIVATE KEY-----'
  local out; out=$(printf '%s' "$pem" | redact)
  assert_not_contains "$out" "MIIBxQYJKoZIhvcN" "PEM key MATERIAL (not just the BEGIN line) is redacted"
  assert_contains "$out" "REDACTED" "PEM block produces a REDACTED marker"
}

test_redact_leaves_plain_text_intact() {        # guard against over-redaction
  source "$SKILL/lib.sh"
  assert_eq "$(_redact 'just a normal sentence about the booth')" "just a normal sentence about the booth" "ordinary prose is not mangled"
}
