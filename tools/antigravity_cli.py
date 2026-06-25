#!/usr/bin/env python3
import sys
import json
import os
import re
import time
import subprocess
import urllib.request
import urllib.error

def output_json(status, errors=None, artifacts=None, mcp="skipped", run_id=None, run_sha=None, exit_code=0, **kwargs):
    res = {
        "run_id": run_id,
        "run_sha": run_sha or "",
        "status": status,
        "artifacts": artifacts or [],
        "mcp_ingest": mcp,
        "errors": errors or [],
        "exit_code": exit_code
    }
    res.update(kwargs)
    print(json.dumps(res))
    sys.exit(exit_code)

def log_msg(log_file, msg):
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    try:
        with open(log_file, "a") as log_f:
            log_f.write(f"[{timestamp}] {msg}\n")
    except Exception:
        pass

def scan_for_secrets(patterns, log_file):
    if not patterns:
        return None
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
                                try:
                                    with open(log_file, "a") as lf:
                                        lf.write(f"INCIDENT: Secret match in {file_path}:{i} on pattern {r.pattern}\n")
                                except Exception:
                                    pass
                                return file_path, r.pattern
            except Exception:
                pass
    return None

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

def execute_action(action, run_dir, log_file):
    # Action mapping to shell commands
    scripts_dir = ".agents/skills/antigravity/scripts"
    if action == "status":
        codex_present = subprocess.run(["which", "codex"], capture_output=True).returncode == 0
        agy_present = os.path.exists("/Volumes/samsung 970 pro - Data/KATHA_VAULT/bin/agy")
        return {
            "codex_present": codex_present,
            "agy_present": agy_present
        }
    return None

def main():
    try:
        input_data = json.load(sys.stdin)
    except Exception as e:
        output_json("error", errors=["invalid_json", str(e)], exit_code=1)

    action = input_data.get("action")
    if not action:
        output_json("error", errors=["missing_action"], exit_code=1)

    try:
        ts = str(int(time.time()))
        run_dir = input_data.get("run_dir") or f".orchestration/test-run-{ts}"
        os.makedirs(run_dir, exist_ok=True)
        log_file = os.path.join(run_dir, "cli.log")
        
        log_msg(log_file, f"Starting {action}. Action: {action}")
        log_msg(log_file, f"Input parameters: {json.dumps(input_data)}")

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

        if action == "status":
            result = execute_action(action, run_dir, log_file)
            if result:
                output_json(
                    "success",
                    artifacts=[log_file],
                    run_id=ts,
                    exit_code=0,
                    **result
                )
            else:
                output_json("error", errors=["action_execution_failed"], run_id=ts, exit_code=1)

        elif action == "trimmed_run":
            # Create synthetic files
            audit_path = os.path.join(run_dir, "audit.json")
            perf_path = os.path.join(run_dir, "perf.json")
            
            with open(audit_path, "w") as f:
                json.dump({"project": "antigravity"}, f)
            log_msg(log_file, f"Created audit.json at: {audit_path}")
                
            with open(perf_path, "w") as f:
                json.dump({"agy": []}, f)
            log_msg(log_file, f"Created perf.json at: {perf_path}")
            
            log_msg(log_file, "Status: success")
            
            with open(audit_path, "r") as f:
                audit_data = json.load(f)
                
            mcp_url = input_data.get("mcp_url", "http://localhost:9749/api/v1/ingest_traces")
            mcp_status = post_to_mcp(mcp_url, audit_data, ts, log_file)
            
            output_json(
                "success", 
                artifacts=[audit_path, perf_path, log_file],
                run_id=ts,
                mcp=mcp_status,
                exit_code=0
            )
        else:
            output_json("error", errors=[f"unsupported_action: {action}"], run_id=ts, exit_code=1)

    except Exception as e:
        output_json("error", errors=["execution_failed", str(e)], exit_code=1)

if __name__ == "__main__":
    main()
