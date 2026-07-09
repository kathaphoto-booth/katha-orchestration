import base64
import os
import tempfile
import subprocess

import google.auth
import google.auth.transport.requests
import requests
from flask import Flask, request, jsonify, send_file

app = Flask(__name__)

PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "premium-buckeye-501316-b2")
# Model discovery (verified live 2026-07-07): this project has NO Imagen
# publisher models in any probed region — every imagen-3.x/4.x predict call
# returns NOT_FOUND. Gemini 2.5 Flash Image ("Nano Banana") on the global
# endpoint is the working image-generation path, returning inline PNG data
# from generateContent (verified on both v1 GA and v1beta1; v1 used here).
IMAGE_MODEL = os.environ.get("IMAGE_MODEL", "gemini-2.5-flash-image")
GEMINI_URL = (
    "https://aiplatform.googleapis.com/v1/projects/"
    f"{PROJECT_ID}/locations/global/publishers/google/models/"
    f"{IMAGE_MODEL}:generateContent"
)


def _gemini_image(prompt, base_image_b64=None, base_image_mime="image/png"):
    """Call Gemini image generation; return (png_bytes, None) or (None, (msg, status))."""
    creds, _ = google.auth.default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
    creds.refresh(google.auth.transport.requests.Request())
    parts = []
    if base_image_b64:
        parts.append({"inlineData": {"mimeType": base_image_mime, "data": base_image_b64}})
    parts.append({"text": prompt})
    body = {
        "contents": [{"role": "user", "parts": parts}],
        "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]},
    }
    res = requests.post(
        GEMINI_URL,
        headers={"Authorization": f"Bearer {creds.token}", "Content-Type": "application/json"},
        json=body,
        timeout=110,
    )
    if res.status_code != 200:
        # Surface the raw Vertex status code — never a silent empty result.
        return None, (f"vertex error {res.status_code}: {res.text[:500]}", res.status_code)
    for cand in res.json().get("candidates", []):
        for part in cand.get("content", {}).get("parts", []):
            data = part.get("inlineData", {}).get("data")
            if data:
                return base64.b64decode(data), None
    return None, ("vertex returned no image part", 502)

BRAND_STYLE_SUFFIX = ", in a quiet luxury style, sophisticated, understated, deep obsidian, kamagong, ecru, high-fidelity, highly polished, premium"
NEGATIVE_PROMPT = "red, crimson, brick, #8C382A, #9A3D2A, cheap, loud, oversaturated, generic luxury, bad anatomy, bad architecture"

@app.route('/vectorize', methods=['POST'])
def vectorize():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    file = request.files['image']
    with tempfile.TemporaryDirectory() as tempdir:
        input_path = os.path.join(tempdir, 'input.png')
        bmp_path = os.path.join(tempdir, 'temp.bmp')
        svg_path = os.path.join(tempdir, 'output.svg')
        
        file.save(input_path)
        
        # Binarize with ImageMagick
        # We handle transparency by flattening against white background for potrace, then making white transparent later if needed
        # Potrace ignores colors, just traces black.
        subprocess.run(['convert', input_path, '-alpha', 'remove', '-threshold', '50%', bmp_path], check=True)
        
        # Vectorize with Potrace
        turdsize = request.form.get('turdsize', '2')
        opttolerance = request.form.get('opttolerance', '0.2')
        subprocess.run(['potrace', bmp_path, '-s', '-o', svg_path, '-t', turdsize, '-O', opttolerance], check=True)
        
        # Optimize with SVGO
        subprocess.run(['svgo', svg_path], check=True)
        
        return send_file(svg_path, mimetype='image/svg+xml')

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json() or {}
    prompt = data.get("prompt", "")
    raw_prompt = data.get("raw_prompt", False)
    
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400
        
    final_prompt = prompt if raw_prompt else f"{prompt}{BRAND_STYLE_SUFFIX}"
    # Gemini generateContent has no negative_prompt parameter; the exclusion
    # list rides in the prompt text instead.
    final_prompt = f"Generate an image: {final_prompt}. Strictly avoid: {NEGATIVE_PROMPT}."

    png, err = _gemini_image(final_prompt)
    if err:
        return jsonify({"error": err[0]}), err[1]

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        tmp.write(png)
        return send_file(tmp.name, mimetype='image/png')

@app.route('/restyle', methods=['POST'])
def restyle():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
        
    prompt = request.form.get("prompt", "")
    raw_prompt = request.form.get("raw_prompt", "false").lower() == "true"
    
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400
        
    final_prompt = prompt if raw_prompt else f"{prompt}{BRAND_STYLE_SUFFIX}"
    
    file = request.files['image']
    src_b64 = base64.b64encode(file.read()).decode()
    mime = file.mimetype or "image/png"
    final_prompt = (
        f"Restyle the provided image: {final_prompt}. "
        f"Strictly avoid: {NEGATIVE_PROMPT}."
    )

    png, err = _gemini_image(final_prompt, base_image_b64=src_b64, base_image_mime=mime)
    if err:
        return jsonify({"error": err[0]}), err[1]

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        tmp.write(png)
        return send_file(tmp.name, mimetype='image/png')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
