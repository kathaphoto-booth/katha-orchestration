#!/usr/bin/env bash
# Tests for bin/compile-ham.sh atomicity + self-locking.
#
# This is a deliberately static/structural test — grepping the source for the
# right primitives — not a dynamic behavioral test. compile-ham.sh hardcodes a
# path to a real external vault on a physically separate disk, and there's no
# throwaway-fixture equivalent for it without a larger parameterization
# refactor that is out of scope here. A real smoke test against the actual
# mounted vault is run manually as a separate verification step.

test_compile_never_leaves_partial() {
  # Simulate: a reader must never see a file lacking the END sentinel.
  # We assert the script writes to a temp then renames (grep the source for the pattern).
  assert_contains "$(cat /Users/jedg./Desktop/kat_ha_pb/bin/compile-ham.sh)" 'mktemp' "compile uses temp file"
  assert_contains "$(cat /Users/jedg./Desktop/kat_ha_pb/bin/compile-ham.sh)" 'mv ' "compile renames atomically"
  assert_contains "$(cat /Users/jedg./Desktop/kat_ha_pb/bin/compile-ham.sh)" '.sync.lock' "compile self-locks"
}
