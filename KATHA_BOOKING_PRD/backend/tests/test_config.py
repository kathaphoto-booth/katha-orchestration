import sys
import os
import pytest

# Adjust path to import from src
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

from config_loader import load_council_config

def test_load_council_config():
    config = load_council_config()
    
    assert config is not None
    assert 'agents' in config
    assert 'AGY' in config['agents']
    assert 'Codex' in config['agents']
    assert 'GH_Copilot' in config['agents']
    
    assert config.get('use_parallel_tool_calls') is True
