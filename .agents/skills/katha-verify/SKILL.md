---
name: katha-verify
description: Evidence-Before-Claims protocol. Use whenever an agent says "done", "complete", "verified", "looks good", "aligned", or any completion claim. Also use pre-merge, pre-deploy, pre-handoff, or when the user says "verify", "prove it", "check", "audit". An agent cannot declare work complete without cited terminal output, screenshots, or audit scores. Feelings are not evidence.
---

# Katha Verify — Evidence-Before-Claims

## Why This Exists

Agents hallucinate completion. "The colors are aligned" means nothing without a hex grep. "The layout looks correct" means nothing without a screenshot. This skill requires concrete, cited proof before any work is declared done. It exists because we caught agents claiming Phase 1 was complete while `CLAUDE.md` still referenced Phase 2 — a drift that would have wasted an entire session.

## Type: Rigid

No "done" claim without at least one piece of evidence from the categories below.

## Evidence Requirements

### For Code Changes
At least one of:
- [ ] Terminal output from `npm run guard` (zero P0 violations)
- [ ] Terminal output from `npm run build` (clean compile)
- [ ] `npm run guard:ci` output (CI-path fast check)
- [ ] `git diff` showing the exact changes made

Paste the raw output. Do not summarize it. "Guard passed" is not evidence. The terminal text is.

### For Visual / UI Changes
At least one of:
- [ ] Desktop screenshot via `chrome-devtools-mcp/take_screenshot`
- [ ] Mobile emulation screenshot via `chrome-devtools-mcp/emulate` + `take_screenshot`
- [ ] Lighthouse audit via `chrome-devtools-mcp/lighthouse_audit`
- [ ] DOM snapshot via `chrome-devtools-mcp/take_snapshot`

Save screenshots to the artifacts directory. Reference them by path.

### For Brand Assets (Marks, Copy, Design Directions)
At least one of:
- [ ] Adversarial Verify output (5-critic simulation per `katha-protocol` §3)
- [ ] Hex audit: `grep -rn '#' <file> | grep -v 'canonical hex'` showing no drift
- [ ] Typography audit: confirm only Fraunces / EB Garamond / Inter present

### For Handoff / Memory Sync
- [ ] Consistency check: all 9 files in the `katha-memory` manifest agree on the same phase and status
- [ ] `HCL_DASHBOARD.html` opened and visually confirmed

### For CSS Injection (Squarespace)
- [ ] Before/after screenshots of the target page
- [ ] Console log check via `chrome-devtools-mcp/list_console_messages` (no errors)
- [ ] Network request check via `chrome-devtools-mcp/list_network_requests` (CSS loaded)

## What Counts as Evidence

| ✅ Valid Evidence | ❌ Not Evidence |
|---|---|
| Raw terminal output, copy-pasted | "I checked and it looks good" |
| Screenshot artifact with file path | "The changes are consistent" |
| JSON validation result | "Everything is aligned" |
| Grep output showing zero matches | "No issues found" (without the grep) |
| Lighthouse score with numbers | "Accessibility is fine" |
| Diff block showing exact changes | "I updated the file" |

## The Verification Report

After gathering evidence, produce a brief report:

```markdown
## Verification Report
**Task:** [what was done]
**Evidence:**
1. [type]: [file path or inline output]
2. [type]: [file path or inline output]
**Result:** [PASS / FAIL with details]
```

## Integration Points

- `katha-workflow` Step 5 invokes this skill
- `katha-memory` validation checklist is a specialized instance of this skill
- `katha-impeccable` produces evidence that feeds into this skill
- `loom-auditor` and `brass-ring-enforcer` are evidence-producing agents that satisfy this skill's requirements

## When NOT to Use This Skill

- Mid-task progress updates ("here's what I've done so far") — verification is for completion claims
- Research answers ("the file is located at X") — no completion claim, no evidence needed
- When the user explicitly says "don't verify, just ship it"
