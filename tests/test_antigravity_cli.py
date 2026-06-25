import subprocess
import json
import os
import sys
import unittest

class TestAntigravityCLI(unittest.TestCase):
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

if __name__ == '__main__':
    unittest.main()
