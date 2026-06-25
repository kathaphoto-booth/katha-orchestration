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
        run_dir = input_data.get("run_dir") or f".orchestration/test-run-{ts}"
        os.makedirs(run_dir, exist_ok=True)
        
        log_path = os.path.join(run_dir, "cli.log")
        
        def log_msg(msg):
            timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
            with open(log_path, "a") as log_f:
                log_f.write(f"[{timestamp}] {msg}\n")
                
        log_msg(f"Starting trimmed_run. Action: {action}")
        log_msg(f"Input parameters: {json.dumps(input_data)}")
        
        # Create synthetic files
        audit_path = os.path.join(run_dir, "audit.json")
        perf_path = os.path.join(run_dir, "perf.json")
        
        with open(audit_path, "w") as f:
            json.dump({"project": "antigravity"}, f)
        log_msg(f"Created audit.json at: {audit_path}")
            
        with open(perf_path, "w") as f:
            json.dump({"agy": []}, f)
        log_msg(f"Created perf.json at: {perf_path}")
        
        log_msg("Status: success")
        
        output_json(
            "success", 
            artifacts=[audit_path, perf_path, log_path],
            run_id=ts,
            exit_code=0
        )
    else:
        output_json("error", errors=[f"unsupported_action: {action}"], exit_code=1)

if __name__ == "__main__":
    main()
