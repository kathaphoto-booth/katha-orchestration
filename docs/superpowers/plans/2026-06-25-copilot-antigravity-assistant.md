# Antigravity Assistant Copilot CLI Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a non-interactive, auditable Python CLI wrapper `tools/antigravity_cli.py` that implements a strict JSON stdin/stdout contract to integrate with your local GitHub Copilot agent.

**Architecture:** Expose the underlying shell orchestration files (`loop.sh`, `council.sh`, `lib.sh`) through a Python JSON parser. Secrets are scanned and redacted before any network calls, outputs are validated, and ingestion attempts post to an MCP service with a robust fallback.

**Tech Stack:** Python 3 (standard library only), Bash, jq, git

## Global Constraints
- **Format:** Accepts single JSON on stdin, outputs exactly one JSON object to stdout.
- **Log Isolation:** Detailed execution logs written to `.orchestration/test-run-<ts>/cli.log`. No extra text on stdout.
- **Read-Only Safeties:** Strictly read-only with respect to git/source control. Never execute pushes, rollbacks, or production deploys.
- **Secret Protection:** Abort the action and exit nonzero if unredacted secret patterns match files in the workspace.
- **Zero Third-Party Dependencies:** Python standard library (`json`, `sys`, `subprocess`, `os`, `re`, `urllib.request`) only.

---

### Task 1: Scaffolding and Contract Parsing
**Files:**
- Create: `tools/antigravity_cli.py`
- Test: `tests/test_antigravity_cli.py`

**Interfaces:**
- Consumes: JSON on stdin containing standard fields like `"action"`
- Produces: JSON on stdout conforming to standard schema

- [ ] **Step 1: Write the failing contract parser test**
Create a test file `tests/test_antigravity_cli.py` to assert that sending a malformed JSON input or missing actions fails loudly with a JSON response:
```python
import subprocess
import json

def test_missing_action():
    proc = subprocess.run(
        ["python3", "tools/antigravity_cli.py"],
        input=json.dumps({"run_dir": "/tmp"}),
        text=True,
        capture_output=True
    )
    assert proc.returncode != 0
    data = json.loads(proc.stdout.strip())
    assert "error" in data["status"]
    assert "missing_action" in data["errors"]
```

- [ ] **Step 2: Run the test to verify it fails**
Run: `python3 -m pytest tests/test_antigravity_cli.py`
Expected: FAIL with "No module named tests" or "FileNotFoundError"

- [ ] **Step 3: Implement minimal CLI parser**
Create `tools/antigravity_cli.py` with standard library JSON input handling and response generation:
```python
#!/usr/bin/env python3
import sys
import json
import os
import time

def output_json(status, errors=None, artifacts=None, mcp="skipped", run_id=None, run_sha=None, exit_code=0):
    res = {
        "run_id": run_id,
        "run_sha": run_sha or "",
        "status": status,
        "artifacts": artifacts or [],
        "mcp_ingest": mcp,
        "errors": errors or [],
        "exit_code": exit_code
    }
    print(json.dumps(res))
    sys.exit(exit_code)

def main():
    try:
        input_data = json.load(sys.stdin)
    except Exception as e:
        output_json("error", errors=["invalid_json", str(e)], exit_code=1)

    action = input_data.get("action")
    if not action:
        output_json("error", errors=["missing_action"], exit_code=1)

    # placeholder for trimmed_run
    if action == "trimmed_run":
        ts = str(int(time.time()))
        run_dir = f".orchestration/test-run-{ts}"
        os.makedirs(run_dir, exist_ok=True)
        # Create synthetic files
        with open(os.path.join(run_dir, "audit.json"), "w") as f:
            json.dump({"project": "antigravity"}, f)
        with open(os.path.join(run_dir, "perf.json"), "w") as f:
            json.dump({"agy": []}, f)
        output_json(
            "success", 
            artifacts=[f"{run_dir}/audit.json", f"{run_dir}/perf.json"],
            run_id=ts,
            exit_code=0
        )
    else:
        output_json("error", errors=[f"unsupported_action: {action}"], exit_code=1)

if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Run the test to verify it passes**
Make script executable: `chmod +x tools/antigravity_cli.py`
Run: `python3 -m unittest tests/test_antigravity_cli.py` (or pytest)
Expected: PASS

- [ ] **Step 5: Commit scaffolding**
```bash
git add tools/antigravity_cli.py
git commit -m "feat(copilot): add basic JSON contract scaffolding for CLI"
```

---

### Task 2: Action Routing and Safety Scan
**Files:**
- Modify: `tools/antigravity_cli.py`

**Interfaces:**
- Consumes: Stdin JSON with keys `"action"`, `"redact_patterns"`
- Produces: Execution routing, logs to `.orchestration/test-run-<ts>/cli.log`, runs safety regex matching over workspace.

- [ ] **Step 1: Write a test for the secret scanner**
Add a test in `tests/test_antigravity_cli.py` proving that if a secret matches the patterns, the tool aborts and does not proceed.
```python
def test_secrets_abort():
    # Send pattern that will match an existing file
    proc = subprocess.run(
        ["python3", "tools/antigravity_cli.py"],
        input=json.dumps({"action": "trimmed_run", "redact_patterns": ["antigravity-assistant"]}),
        text=True,
        capture_output=True
    )
    assert proc.returncode != 0
    data = json.loads(proc.stdout.strip())
    assert data["status"] == "error"
    assert "secret_detected" in data["errors"]
```

- [ ] **Step 2: Run test to verify it fails**
Run: `python3 -m unittest tests/test_antigravity_cli.py`
Expected: FAIL (as secrets abort isn't implemented)

- [ ] **Step 3: Implement secret scanner and action execution**
Add recursive regex scanning and log routing to `tools/antigravity_cli.py`:
```python
import sys
import json
import os
import re
import time
import subprocess

def scan_for_secrets(patterns, log_file):
    # Default patterns
    compiled = [re.compile(p) for p in patterns]
    ignored_dirs = {".git", ".orchestration", "node_modules", "tools/ingest_ready"}
    
    for root, dirs, files in os.walk("."):
        dirs[:] = [d for d in dirs if d not in ignored_dirs]
        for file in files:
            file_path = os.path.join(root, file)
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    for i, line in enumerate(f, 1):
                        for r in compiled:
                            if r.search(line):
                                with open(log_file, "a") as lf:
                                    lf.write(f"INCIDENT: Secret match in {file_path}:{i} on pattern {r.pattern}\n")
                                return file_path, r.pattern
            except Exception:
                pass
    return None

def execute_action(action, run_dir, log_file):
    # Action mapping to shell commands
    scripts_dir = ".agents/skills/antigravity/scripts"
    if action == "status":
        codex_present = subprocess.run(["which", "codex"], capture_output=True).returncode == 0
        agy_present = os.path.exists("/Volumes/samsung 970 pro - Data/KATHA_VAULT/bin/agy")
        return {
            "status": "success",
            "codex_present": codex_present,
            "agy_present": agy_present
        }
    return None
```
Integrate `scan_for_secrets` and actions inside `main()`:
```python
# Insert into main() after action parsing:
ts = str(int(time.time()))
run_dir = f".orchestration/test-run-{ts}"
os.makedirs(run_dir, exist_ok=True)
log_file = os.path.join(run_dir, "cli.log")

redact_patterns = input_data.get("redact_patterns", [])
match = scan_for_secrets(redact_patterns, log_file)
if match:
    file_matched, pattern = match
    output_json(
        "error",
        errors=["secret_detected", f"file:{file_matched}", f"pattern:{pattern}"],
        run_id=ts,
        exit_code=1
    )
```

- [ ] **Step 4: Run test to verify it passes**
Run: `python3 -m unittest tests/test_antigravity_cli.py`
Expected: PASS

- [ ] **Step 5: Commit safety changes**
```bash
git add tools/antigravity_cli.py
git commit -m "feat(copilot): integrate secret scanner and logging directory"
```

---

### Task 3: Ingestion and Fallback
**Files:**
- Modify: `tools/antigravity_cli.py`

**Interfaces:**
- Consumes: `"mcp_url"` or defaults to `http://localhost:9749/api/v1/ingest_traces`
- Produces: HTTP POST of `audit.json` to MCP server, fallback file save in `tools/ingest_ready/` on HTTP failures.

- [ ] **Step 1: Write test for fallback mechanism**
Add a test in `tests/test_antigravity_cli.py` to ensure that if ingestion fails (using a bogus URL), `audit.json` is written to `tools/ingest_ready/` and the stdout reports `mcp_ingest: "written"`.
```python
def test_ingest_fallback():
    proc = subprocess.run(
        ["python3", "tools/antigravity_cli.py"],
        input=json.dumps({"action": "trimmed_run", "mcp_url": "http://localhost:11111/fake"}),
        text=True,
        capture_output=True
    )
    assert proc.returncode == 0
    data = json.loads(proc.stdout.strip())
    assert data["mcp_ingest"] == "written"
    # check that file exists under tools/ingest_ready
    assert len(os.listdir("tools/ingest_ready")) > 0
```

- [ ] **Step 2: Run test to verify it fails**
Run: `python3 -m unittest tests/test_antigravity_cli.py`
Expected: FAIL

- [ ] **Step 3: Implement HTTP client ingestion**
Add standard library HTTP request poster to `tools/antigravity_cli.py`:
```python
import urllib.request
import urllib.error

def post_to_mcp(mcp_url, audit_data, run_id, log_file):
    payload = json.dumps(audit_data).encode("utf-8")
    req = urllib.request.Request(
        mcp_url,
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status in (200, 201, 202):
                with open(log_file, "a") as lf:
                    lf.write(f"MCP ingestion succeeded with status {response.status}\n")
                return "ok"
    except Exception as e:
        with open(log_file, "a") as lf:
            lf.write(f"MCP ingestion failed: {str(e)}. Writing fallback file.\n")
            
    # Fallback path
    fallback_dir = "tools/ingest_ready"
    os.makedirs(fallback_dir, exist_ok=True)
    fallback_file = os.path.join(fallback_dir, f"audit-{run_id}.json")
    with open(fallback_file, "w") as f:
        json.dump(audit_data, f)
    return "written"
```
Call `post_to_mcp` inside the action handler for `trimmed_run` and `run`.

- [ ] **Step 4: Run test to verify it passes**
Run: `python3 -m unittest tests/test_antigravity_cli.py`
Expected: PASS

- [ ] **Step 5: Commit ingestion changes**
```bash
git add tools/antigravity_cli.py
git commit -m "feat(copilot): implement safe standard library MCP ingest and fallback"
```
