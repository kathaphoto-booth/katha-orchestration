import subprocess
import json
import os
import unittest

class TestAntigravityCLI(unittest.TestCase):
    def test_missing_action(self):
        # Make sure we use the correct path assuming tests are run from root
        script_path = os.path.join(os.path.dirname(__file__), '..', 'tools', 'antigravity_cli.py')
        
        proc = subprocess.run(
            ["python3", script_path],
            input=json.dumps({"run_dir": "/tmp"}),
            text=True,
            capture_output=True
        )
        self.assertNotEqual(proc.returncode, 0)
        data = json.loads(proc.stdout.strip())
        self.assertIn("error", data["status"])
        self.assertIn("missing_action", data["errors"])

if __name__ == '__main__':
    unittest.main()
