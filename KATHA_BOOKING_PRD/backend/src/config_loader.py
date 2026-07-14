import os
import yaml

def load_council_config():
    config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../fable_council_config.yaml'))
    if not os.path.exists(config_path):
        return None
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    return config
