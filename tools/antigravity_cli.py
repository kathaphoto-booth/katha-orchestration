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
