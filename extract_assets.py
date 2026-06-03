import os
import sys
import base64
import json

try:
    from PIL import Image, ImageFilter
    import numpy as np
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--user", "pillow", "numpy"])
    from PIL import Image, ImageFilter
    import numpy as np

def extract_l_frame():
    path = "/Users/jedg./Desktop/kat_ha_pb/CC_ITERATION/DARK_ITERATION/assets/perfect_that's_exactly_it_now_202606021446.jpeg"
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return None
    img = Image.open(path).convert("RGBA")
    data = np.array(img)
    
    h, w = data.shape[:2]
    bg_color = data[h//2, w//2, :3]
    
    diff = np.linalg.norm(data[:, :, :3] - bg_color, axis=2)
    mask = diff > 25
    
    mask_img = Image.fromarray((mask * 255).astype(np.uint8), mode='L')
    mask_img = mask_img.filter(ImageFilter.GaussianBlur(1))
    
    data[:, :, 3] = np.array(mask_img)
    
    out_img = Image.fromarray(data)
    out_path = "/Users/jedg./Desktop/kat_ha_pb/l_frame_transparent.png"
    out_img.save(out_path)
    
    with open(out_path, "rb") as f:
        return base64.b64encode(f.read()).decode('utf-8')

def extract_logo():
    path = "/Users/jedg./.gemini/antigravity/brain/845028fc-f6ad-4238-8977-8024a8d178b4/media__1780436873624.jpg"
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return None
    img = Image.open(path).convert("RGBA")
    data = np.array(img)
    
    luminance = np.dot(data[:, :, :3], [0.2989, 0.5870, 0.1140])
    redness = data[:, :, 0].astype(float) - data[:, :, 1].astype(float)
    redness = np.clip(redness, 0, 255)
    
    alpha = np.clip(luminance + redness * 2, 0, 255).astype(np.uint8)
    alpha_img = Image.fromarray(alpha, mode='L').filter(ImageFilter.GaussianBlur(0.5))
    data[:, :, 3] = np.array(alpha_img)
    
    out_img = Image.fromarray(data)
    out_path = "/Users/jedg./Desktop/kat_ha_pb/logo_transparent.png"
    out_img.save(out_path)
    
    with open(out_path, "rb") as f:
        return base64.b64encode(f.read()).decode('utf-8')

print("Starting extraction...")
l_frame_b64 = extract_l_frame()
logo_b64 = extract_logo()

payload = {
    "l_frame": f"data:image/png;base64,{l_frame_b64}" if l_frame_b64 else None,
    "logo": f"data:image/png;base64,{logo_b64}" if logo_b64 else None
}

with open("/Users/jedg./Desktop/kat_ha_pb/katha_physical_assets.json", "w") as f:
    json.dump(payload, f, indent=2)

print("Extraction complete. Wrote katha_physical_assets.json")
