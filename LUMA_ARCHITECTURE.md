# Luma Template Generator & Dashboard Architecture Spec

This document details the architectural specifications for rebuilding a clean, high-performance, and custom-styled Luma Template Generator and Print Strip Renderer. To maintain absolute purity, no legacy code is included.

---

## 1. Architectural Overview
The Luma engine handles two core responsibilities:
1. **Interactive Client Customization:** A frontend dashboard allowing clients to select base layouts, typography overlays, graphic elements, and personalized text blocks for their print strips.
2. **Server-Side Print Rendering:** A headless rendering service that generates high-fidelity, print-ready, transparent-ready `.png` overlays and composite prints mapping physical photobooth captures to selected layouts.

---

## 2. Headless Composite Rendering Pipeline

```
[Camera Shutter / Local Capture]
               │
               ▼
   [Upload to Supabase Bucket]
               │
               ▼
[Headless Rendering Service (Next.js API / Serverless)]
   ├── 1. Fetch Selected Layout JSON Schema
   ├── 2. Fetch Alpha-Transparent Overlay Asset
   └── 3. Composite Image Node Canvas / Sharp
               │
               ▼
 [Export Composite PDF/PNG to Print Queue & Web Gallery]
```

---

## 3. Core Engine Components

### A. Template DSL (Domain-Specific Language) Schema
Instead of hardcoding layout styles, the rendering engine uses a clean, serializable JSON schema:

```json
{
  "templateId": "classic-oak-2x6",
  "dimensions": {
    "width": 1200,
    "height": 1800,
    "dpi": 300
  },
  "slots": [
    { "id": "photo_1", "x": 100, "y": 100, "width": 1000, "height": 750 },
    { "id": "photo_2", "x": 100, "y": 900, "width": 1000, "height": 750 }
  ],
  "typography": {
    "text": "April & Vince",
    "fontFamily": "slot_font",
    "fontSize": 48,
    "color": "#HEX",
    "x": 600,
    "y": 1700,
    "align": "center"
  }
}
```

### B. Canvas Compositor (Node.js/Python server-side)
*   **Engine Core:** Utilizes the lightweight `sharp` (Node.js) or `Pillow` (Python via Google Antigravity SDK workflows) for high-performance image processing.
*   **Alpha Masking:** Dynamically blends high-resolution 8K DSLR captures with custom-designed transparent borders, applying wabi-sabi paper textures or overlays on-the-fly.
*   **Resolution Target:** Outputs print strips in **300 DPI, CMYK color space** formats for direct physical printer compatibility, while outputting compressed, high-performance webp versions for digital galleries.

---

## 4. Rebuilding Recommendations

To execute this clean and unpolluted in the new Katha Booth system:
1. **Next.js API:** Place the compositor inside `src/app/api/render/route.ts`.
2. **Dynamic Slots:** Use CSS Container Queries on the dashboard panel to show responsive, accurate preview strips as the user types their names or picks different textures.
3. **Database Links:** Connect chosen template parameters to the client's `leads` record in Supabase to instantly configure the rendering queue at physical events.
