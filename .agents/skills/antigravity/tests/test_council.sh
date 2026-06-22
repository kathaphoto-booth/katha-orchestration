#!/usr/bin/env bash
# Source-assertion test for the Katha-native council.sh (council-wrapper
# hardening, 2026-06-22). council.sh drives real CLIs, so (like test_agy_tier)
# we assert the source carries the three fixes the council itself surfaced:
# portable timeout, Vertex env self-load (fail-loud), OSS via Ollama HTTP API.

test_council_is_hardened() {
  local src; src="/Users/jedg./Desktop/kat_ha_pb/.agents/skills/antigravity/scripts/council.sh"
  assert_eq "$([[ -f "$src" ]] && echo yes || echo no)" "yes" "council.sh exists"
  local b; b="$(cat "$src" 2>/dev/null)"
  assert_contains "$b" "run_with_timeout" "bounds CLI calls with the portable timeout"
  assert_contains "$b" "load_vertex_env" "self-loads the Vertex env (no silent broken-tier fallback)"
  assert_contains "$b" "11434/api/generate" "routes the OSS voice via the Ollama HTTP API (codex CLI bypassed)"
  assert_contains "$b" "ABSENT" "marks a voice absent / fails loud rather than degrading silently"
}
