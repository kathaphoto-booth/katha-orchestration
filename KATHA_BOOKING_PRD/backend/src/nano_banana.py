import base64
import json

def generate_payload(image_path: str, email: str) -> str:
    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
        
    payload = {
        "email": email,
        "image": encoded_string
    }
    
    return json.dumps(payload)
