import subprocess
import json
import os
import sys
import unittest

class TestAntigravityCLI(unittest.TestCase):
    def setUp(self):
        self.fallback_dir = os.path.join(os.path.dirname(__file__), '..', 'tools', 'ingest_ready')
        self.pre_existing_files = set()
        if os.path.exists(self.fallback_dir):
            self.pre_existing_files = set(os.listdir(self.fallback_dir))

    def tearDown(self):
        if os.path.exists(self.fallback_dir):
            current_files = set(os.listdir(self.fallback_dir))
            new_files = current_files - self.pre_existing_files
            for f in new_files:
                try:
                    os.remove(os.path.join(self.fallback_dir, f))
                except Exception:
                    pass
            if not os.listdir(self.fallback_dir):
                try:
                    os.rmdir(self.fallback_dir)
                except Exception:
                    pass

    def test_missing_action(self):
        # Make sure we use the correct path assuming tests are run from root
        script_path = os.path.join(os.path.dirname(__file__), '..', 'tools', 'antigravity_cli.py')
        
        proc = subprocess.run(
            [sys.executable, script_path],
            input=json.dumps({"run_dir": "/tmp"}),
            text=True,
            capture_output=True
        )
        self.assertNotEqual(proc.returncode, 0)
        data = json.loads(proc.stdout.strip())
        self.assertIn("error", data["status"])
        self.assertIn("missing_action", data["errors"])

    def test_trimmed_run_success(self):
        import tempfile
        script_path = os.path.join(os.path.dirname(__file__), '..', 'tools', 'antigravity_cli.py')
        
        with tempfile.TemporaryDirectory() as tmpdir:
            input_payload = {
                "action": "trimmed_run",
                "run_dir": tmpdir
            }
            proc = subprocess.run(
                [sys.executable, script_path],
                input=json.dumps(input_payload),
                text=True,
                capture_output=True
            )
            self.assertEqual(proc.returncode, 0)
            data = json.loads(proc.stdout.strip())
            self.assertEqual(data["status"], "success")
            
            # Verify files are created
            audit_file = os.path.join(tmpdir, "audit.json")
            perf_file = os.path.join(tmpdir, "perf.json")
            log_file = os.path.join(tmpdir, "cli.log")
            
            self.assertTrue(os.path.exists(audit_file))
            self.assertTrue(os.path.exists(perf_file))
            self.assertTrue(os.path.exists(log_file))
            
            # Verify file content
            with open(audit_file, "r") as f:
                audit_data = json.load(f)
                self.assertEqual(audit_data.get("project"), "antigravity")
                
            with open(perf_file, "r") as f:
                perf_data = json.load(f)
                self.assertEqual(perf_data.get("agy"), [])
                
            with open(log_file, "r") as f:
                log_content = f.read()
                self.assertIn("Starting trimmed_run", log_content)
                self.assertIn("Input parameters", log_content)
                self.assertIn("Created audit.json", log_content)
                self.assertIn("Created perf.json", log_content)
                self.assertIn("Status: success", log_content)

    def test_invalid_json_stdin(self):
        script_path = os.path.join(os.path.dirname(__file__), '..', 'tools', 'antigravity_cli.py')
        
        proc = subprocess.run(
            [sys.executable, script_path],
            input="this is not valid json",
            text=True,
            capture_output=True
        )
        self.assertNotEqual(proc.returncode, 0)
        data = json.loads(proc.stdout.strip())
        self.assertEqual(data["status"], "error")
        self.assertIn("invalid_json", data["errors"])
    def test_secrets_abort(self):
        script_path = os.path.join(os.path.dirname(__file__), '..', 'tools', 'antigravity_cli.py')
        proc = subprocess.run(
            [sys.executable, script_path],
            input=json.dumps({"action": "trimmed_run", "redact_patterns": ["antigravity-assistant"]}),
            text=True,
            capture_output=True
        )
        self.assertNotEqual(proc.returncode, 0)
        data = json.loads(proc.stdout.strip())
        self.assertEqual(data["status"], "error")
        self.assertIn("secret_detected", data["errors"])

    def test_status_action(self):
        script_path = os.path.join(os.path.dirname(__file__), '..', 'tools', 'antigravity_cli.py')
        proc = subprocess.run(
            [sys.executable, script_path],
            input=json.dumps({"action": "status"}),
            text=True,
            capture_output=True
        )
        self.assertEqual(proc.returncode, 0)
        data = json.loads(proc.stdout.strip())
        self.assertEqual(data["status"], "success")
        self.assertIn("codex_present", data)
        self.assertIn("agy_present", data)

    def test_run_dir_permission_error_graceful_abort(self):
        script_path = os.path.join(os.path.dirname(__file__), '..', 'tools', 'antigravity_cli.py')
        proc = subprocess.run(
            [sys.executable, script_path],
            input=json.dumps({"action": "trimmed_run", "run_dir": "/sbin/nonexistent-cli-dir-test"}),
            text=True,
            capture_output=True
        )
        self.assertNotEqual(proc.returncode, 0)
        data = json.loads(proc.stdout.strip())
        self.assertEqual(data["status"], "error")
        self.assertIn("execution_failed", data["errors"])

    def test_ingest_fallback(self):
        script_path = os.path.join(os.path.dirname(__file__), '..', 'tools', 'antigravity_cli.py')
        
        proc = subprocess.run(
            [sys.executable, script_path],
            input=json.dumps({"action": "trimmed_run", "mcp_url": "http://localhost:11111/fake"}),
            text=True,
            capture_output=True
        )
        self.assertEqual(proc.returncode, 0)
        data = json.loads(proc.stdout.strip())
        self.assertEqual(data["mcp_ingest"], "written")
        
        # Check that files were indeed written under tools/ingest_ready
        self.assertTrue(os.path.exists(self.fallback_dir))
        current_files = set(os.listdir(self.fallback_dir))
        new_files = current_files - self.pre_existing_files
        self.assertTrue(len(new_files) > 0)
        
        for filename in new_files:
            self.assertTrue(filename.startswith("audit-"))
            self.assertTrue(filename.endswith(".json"))
            file_path = os.path.join(self.fallback_dir, filename)
            with open(file_path, "r") as f:
                content = json.load(f)
                self.assertEqual(content, {"project": "antigravity"})

if __name__ == '__main__':
    unittest.main()



