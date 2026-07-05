// ════════════════════════════════════════════════════════════════════
// LAYOUT REGISTRY — the single source of truth for photo-slot geometry.
//
// ⚠ LOCKED MEASUREMENT SPEC (2026-05-31). These numbers are CANON.
// Adopted from the Gemini LumaBooth Blueprint and extended coherently to
// every slot-count variant. Every render path (studio preview, canvas
// export, client gallery, headless export script) reads slot + text-zone
// rectangles from HERE. No other file computes slot math. To add an
// arrangement, add a DATA entry — never touch render code.
//
// COORDINATE SYSTEM
//   All rectangles are in viewBox units == pixels at 300 DPI.
//   A value of 60 == 0.2 inch on ANY format. Margins are physically equal.
//     strip             600 × 1800   (2"×6")
//     postcard-vertical 1200 × 1800  (4"×6")
//     postcard          1800 × 1200  (6"×4")
//
// ── THE LOCKED SPEC ──────────────────────────────────────────────────
//
//  2×6 STRIP (600×1800)  ·  marginX = 60  ·  slotW = 480
//    2-slot : padTop 150 · slot 480×520 · gap 40 · text band 470u
//    3-slot : padTop 150 · slot 480×380 · gap 40 · text band 330u
//    4-slot : padTop 120 · slot 480×320 · gap 30 · text band 220u · SINGLE-LINE
//    (NEVER 1 slot.)
//
//  4×6 VERTICAL (1200×1800)  ·  marginX = 60  ·  slotW = 1080  ·  colW 520 (gap 40)
//    2-slot : padTop 150 · slot 1080×590 · gap 40 · text band 330u
//    3-slot : padTop 150 · slot 1080×380 · gap 40 · text band 330u
//    4-slot : padTop 120 · slot 1080×330 · gap 30 · text band 180u · SINGLE-LINE
//    L  / Γ : two-column photo region (520-wide) · 560-tall rows · text band 390u
//
//  6×4 LANDSCAPE (1800×1200)  ·  MUSEUM MATTING: margin = gap = 100
//    Backbone = 2×2 grid of 750×450 cells (cols x=100,950 · rows y=100,650).
//    2-slot : top pair 750×450 · text band 1600×450 (bottom row merged)
//    L      : photo·TEXT / photo·photo   (Gemini L — 3 photos + text cell)
//    Γ inv  : photo·photo / TEXT·photo   (Gemini inverted-L)
//    3-row  : three 480×760 columns (x 120/660/1200 · gap 60) · text band 1600×220
//    4-slot : compressed 750×410 grid (vgap 50) · single-line caption 90u
//
// THE WHITESPACE LAW
//   The text band (branding pedestal) is a FIRST-CLASS region, never an
//   afterthought. Multi-line bands are ≥18% of the long axis; single-line
//   caption bands are a deliberate, enforced exception (4-slot only).
//   validate-layout.js is the gate. Nothing ships that fails it.
// ════════════════════════════════════════════════════════════════════

export const SAFE_MARGIN = 60;          // strip + vertical
export const LANDSCAPE_MARGIN = 100;    // postcard museum matting
export const SLOT_GAP = 40;

export const VIEWBOX = {
  strip: { w: 600, h: 1800 },
  "postcard-vertical": { w: 1200, h: 1800 },
  postcard: { w: 1800, h: 1200 },
};

// Per-format safe margin used by the validator + decoration insets.
export const FORMAT_MARGIN = {
  strip: 60,
  "postcard-vertical": 60,
  postcard: 100,
};

// Helper to keep entries readable
const R = (x, y, w, h) => ({ x, y, w, h });

// ── LAYOUT DEFINITIONS ────────────────────────────────────────────────
// id         unique key, referenced by preset.layoutId
// label      shown in the studio layout picker
// format     which canvas it belongs to
// slots[]    photo rectangles, in draw order (slot 1, 2, 3…)
// textZone   rectangle where names/date/venue are centered (branding pedestal)
// slotCount  number of photo slots
// singleLine true → only one line of text fits (subline suppressed)
// note       short description for the picker tooltip
export const LAYOUTS = {
  // ═══════════ 2×6 STRIP (600×1800) ═══════════ NEVER 1 slot
  "strip-2": {
    id: "strip-2", label: "2 Tall", format: "strip", slotCount: 2, singleLine: false,
    note: "Two large photos, editorial text band",
    slots: [R(60, 150, 480, 520), R(60, 710, 480, 520)],
    textZone: R(60, 1270, 480, 470),
  },
  "strip-3": {
    id: "strip-3", label: "3 Stacked", format: "strip", slotCount: 3, singleLine: false,
    note: "Classic three-photo strip",
    slots: [R(60, 150, 480, 380), R(60, 570, 480, 380), R(60, 990, 480, 380)],
    textZone: R(60, 1410, 480, 330),
  },
  "strip-4": {
    id: "strip-4", label: "4 Stacked", format: "strip", slotCount: 4, singleLine: false,
    note: "Four photos — event name + date line in caption band",
    slots: [R(60, 70, 480, 300), R(60, 400, 480, 300), R(60, 730, 480, 300), R(60, 1060, 480, 300)],
    textZone: R(60, 1400, 480, 340),
  },

  // ═══════════ 4×6 VERTICAL POSTCARD (1200×1800) ═══════════
  "pv-1": {
    id: "pv-1", label: "1 Pose Portrait", format: "postcard-vertical", slotCount: 1, singleLine: false,
    note: "One grand portrait, centered text band",
    slots: [R(60, 150, 1080, 1200)],
    textZone: R(60, 1410, 1080, 330),
  },
  "pv-2": {
    id: "pv-2", label: "2 Stacked", format: "postcard-vertical", slotCount: 2, singleLine: false,
    note: "Two stacked photos, generous text band",
    slots: [R(60, 150, 1080, 590), R(60, 780, 1080, 590)],
    textZone: R(60, 1410, 1080, 330),
  },
  "pv-3": {
    id: "pv-3", label: "3 Stacked", format: "postcard-vertical", slotCount: 3, singleLine: false,
    note: "Three stacked photos, first-class text band",
    slots: [R(60, 150, 1080, 380), R(60, 570, 1080, 380), R(60, 990, 1080, 380)],
    textZone: R(60, 1410, 1080, 330),
  },
  "pv-L": {
    id: "pv-L", label: "L-Shape", format: "postcard-vertical", slotCount: 3, singleLine: false,
    note: "Photos trace an L — typography fills the top-right negative space",
    slots: [R(60, 150, 520, 560), R(60, 750, 520, 560), R(620, 750, 520, 560)],
    textZone: R(60, 1350, 1080, 390),
  },
  "pv-invL": {
    id: "pv-invL", label: "Inverted L", format: "postcard-vertical", slotCount: 3, singleLine: false,
    note: "Photos trace a Γ — typography fills the bottom-left negative space",
    slots: [R(60, 150, 520, 560), R(620, 150, 520, 560), R(620, 750, 520, 560)],
    textZone: R(60, 1350, 1080, 390),
  },

  // ═══════════ 6×4 LANDSCAPE POSTCARD (1800×1200) ═══════════ MUSEUM MATTING
  "pc-1": {
    id: "pc-1", label: "1 Pose Landscape", format: "postcard", slotCount: 1, singleLine: false,
    note: "One grand landscape, bottom pedestal",
    slots: [R(100, 100, 1600, 750)],
    textZone: R(100, 920, 1600, 180),
  },
  // pc-2-split (2 Large Vertical Portraits side-by-side)
  "pc-2-split": {
    id: "pc-2-split", label: "2 Portrait Columns", format: "postcard", slotCount: 2, singleLine: false,
    note: "Two vertical portraits side-by-side, bottom pedestal",
    slots: [R(180, 100, 680, 720), R(940, 100, 680, 720)],
    textZone: R(100, 880, 1600, 220),
  },
  // pc-2-sq (2 Balanced Squares)
  "pc-2-sq": {
    id: "pc-2-sq", label: "2 Squares", format: "postcard", slotCount: 2, singleLine: false,
    note: "Two balanced squares, bottom pedestal",
    slots: [R(180, 100, 680, 680), R(940, 100, 680, 680)],
    textZone: R(100, 880, 1600, 220),
  },
  // pc-3-v (3 Columns)
  "pc-3-v": {
    id: "pc-3-v", label: "3 Columns", format: "postcard", slotCount: 3, singleLine: false,
    note: "Three vertical columns, bottom pedestal",
    slots: [R(120, 100, 480, 760), R(660, 100, 480, 760), R(1200, 100, 480, 760)],
    textZone: R(100, 880, 1600, 220),
  },
  // pc-3-sq (3 Squares)
  "pc-3-sq": {
    id: "pc-3-sq", label: "3 Squares", format: "postcard", slotCount: 3, singleLine: false,
    note: "Three square slots in a row, bottom pedestal",
    slots: [R(100, 200, 500, 500), R(650, 200, 500, 500), R(1200, 200, 500, 500)],
    textZone: R(100, 880, 1600, 220),
  },
  // pc-L (Threadline Cartography: 3 slots + top-right pedestal)
  "pc-L": {
    id: "pc-L", label: "L-Shape", format: "postcard", slotCount: 3, singleLine: false,
    note: "Photos on left and bottom right; text pedestal top right fills negative space.",
    slots: [
      R(100, 100, 750, 450),
      R(100, 650, 750, 450),
      R(950, 650, 750, 450),
    ],
    textZone: R(950, 100, 750, 450),
  },
  // pc-invL (Threadline Cartography: 3 slots + bottom-left pedestal)
  "pc-invL": {
    id: "pc-invL", label: "Inverted L", format: "postcard", slotCount: 3, singleLine: false,
    note: "Photos on right and top left; text pedestal bottom left fills negative space.",
    slots: [
      R(100, 100, 750, 450),
      R(950, 100, 750, 450),
      R(950, 650, 750, 450),
    ],
    textZone: R(100, 650, 750, 450),
  },
  "pc-4-grid": {
    id: "pc-4-grid", label: "4 Pose Grid", format: "postcard", slotCount: 4, singleLine: false,
    note: "One heavy focal photo + three smaller baseline strips",
    slots: [
      R(100, 100, 1040, 500),
      R(100, 640, 480, 340),
      R(620, 640, 480, 340),
      R(1140, 640, 560, 340)
    ],
    textZone: R(1180, 100, 520, 500),
  },

};

// ── DEFAULTS + LOOKUPS ────────────────────────────────────────────────
export const DEFAULT_LAYOUT = {
  strip: "strip-3",
  "postcard-vertical": "pv-2",
  postcard: "pc-3-v",
};

export function getLayout(id) {
  return LAYOUTS[id] || null;
}

export function layoutsForFormat(format) {
  return Object.values(LAYOUTS).filter((l) => l.format === format && !l.deprecated);
}

export function defaultLayoutFor(format) {
  return LAYOUTS[DEFAULT_LAYOUT[format]] || LAYOUTS["strip-3"];
}

// Resolve a (preset.layoutId, format) pair to a concrete layout, with
// graceful fallback if the layoutId doesn't match the active format.
export function resolveLayout(layoutId, format) {
  const l = layoutId && LAYOUTS[layoutId];
  if (l && l.format === format) return l;
  return defaultLayoutFor(format);
}

// Dynamic vertical layout mirroring engine (The "Flip Algorithm")
export function getModifiedLayout(layout, textPosition) {
  if (!layout) return null;
  if (textPosition !== "top") return layout;

  const viewBox = VIEWBOX[layout.format];
  if (!viewBox) return layout;

  const H = viewBox.h;

  const flippedTextZone = {
    ...layout.textZone,
    y: H - layout.textZone.y - layout.textZone.h
  };

  const flippedSlots = layout.slots.map(slot => ({
    ...slot,
    y: H - slot.y - slot.h
  })).reverse(); // reverse to keep Slot 1 visually at the top

  return {
    ...layout,
    slots: flippedSlots,
    textZone: flippedTextZone
  };
}
