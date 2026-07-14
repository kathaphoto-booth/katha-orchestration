import pytest
import os
import tempfile
import json
import base64
from backend.src.nano_banana import generate_payload

def test_generate_payload():
    email = "test@example.com"
    content = b"fake image content"
    
    with tempfile.NamedTemporaryFile(delete=False) as temp_image:
        temp_image.write(content)
        temp_image_path = temp_image.name

    try:
        payload = generate_payload(temp_image_path, email)
        payload_data = json.loads(payload)
        
        assert payload_data["email"] == email
        assert payload_data["image"] == base64.b64encode(content).decode("utf-8")
    finally:
        os.remove(temp_image_path)
