#!/usr/bin/env python3
"""Generate Threadline Cartography specimen plate for Katha Photo Booth."""

from PIL import Image, ImageDraw, ImageFont
import os
import random

# ─── CONFIG ────────────────────────────────────────────────────────
W, H = 2400, 3200
FONTS_DIR = "/Users/jedg./Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/05e0c54f-5a53-43c0-810b-f059c7d4c7b1/2540ebd4-9984-48d2-8ff1-07a6f324121d/skills/canvas-design/canvas-fonts"
OUTPUT = "/Users/jedg./Desktop/kat_ha_pb/threadline_cartography_plate001.png"

# Katha Palette (RGB)
ECRU       = (234, 226, 213)   # Piña Ecru — background
INK        = (26, 24, 22)      # Knalum Ink — primary text
BARK       = (36, 30, 26)      # Iron Bark
OBSIDIAN   = (17, 17, 18)      # Obsidian Weave
HAMMERED   = (156, 149, 138)   # Hammered Sequin — secondary
CHAMPAGNE  = (196, 181, 157)   # Champagne Heirloom — rules/accents
RUST       = (140, 56, 42)     # Loko Rust — sacred accent
TERRA      = (163, 92, 68)     # Terracotta Earth
SLATE      = (90, 93, 90)      # Abel Slate — tertiary text
SAGE       = (181, 184, 163)   # Capiz Sage
SLOT_FILL  = (226, 220, 208)   # Slightly darker than ECRU for slot placeholders
BRAND_FILL = (218, 210, 196)   # Even slightly darker for branding zone

# ─── CREATE CANVAS WITH GRAIN ─────────────────────────────────────
img = Image.new('RGB', (W, H), ECRU)

random.seed(42)
grain = Image.new('L', (W // 4, H // 4))
gp = grain.load()
for y in range(H // 4):
    for x in range(W // 4):
        gp[x, y] = random.randint(118, 138)
grain = grain.resize((W, H), Image.BILINEAR)
grain_rgb = Image.merge('RGB', [grain, grain, grain])
img = Image.blend(img, grain_rgb, 0.05)

draw = ImageDraw.Draw(img)

# Subtle horizontal thread lines (warp)
for yl in range(0, H, 12):
    depth = random.randint(2, 8)
    c = tuple(max(0, e - depth) for e in ECRU)
    draw.line([(0, yl), (W, yl)], fill=c, width=1)

# ─── FONTS ─────────────────────────────────────────────────────────
def fnt(name, size):
    return ImageFont.truetype(os.path.join(FONTS_DIR, name), size)

poiret_xl  = fnt("PoiretOne-Regular.ttf", 108)
poiret_lg  = fnt("PoiretOne-Regular.ttf", 60)
poiret_md  = fnt("PoiretOne-Regular.ttf", 36)
poiret_sm  = fnt("PoiretOne-Regular.ttf", 24)
mono_md    = fnt("DMMono-Regular.ttf", 16)
mono_sm    = fnt("DMMono-Regular.ttf", 13)
mono_xs    = fnt("DMMono-Regular.ttf", 11)
mono_xxs   = fnt("DMMono-Regular.ttf", 9)
serif_it   = fnt("CrimsonPro-Italic.ttf", 24)
serif_sm   = fnt("CrimsonPro-Italic.ttf", 18)
lora_it    = fnt("Lora-Italic.ttf", 20)

# ─── HELPERS ───────────────────────────────────────────────────────
def tw(text, font):
    bb = draw.textbbox((0, 0), text, font=font)
    return bb[2] - bb[0]

def th(text, font):
    bb = draw.textbbox((0, 0), text, font=font)
    return bb[3] - bb[1]

def text_c(y, text, font, color):
    draw.text(((W - tw(text, font)) // 2, y), text, fill=color, font=font)

def text_r(y, text, font, color, margin=160):
    draw.text((W - margin - tw(text, font), y), text, fill=color, font=font)

def reg_cross(cx, cy, s=14):
    draw.line([(cx - s, cy), (cx + s, cy)], fill=HAMMERED, width=1)
    draw.line([(cx, cy - s), (cx, cy + s)], fill=HAMMERED, width=1)

def dim_h(x1, x2, y, label, above=False):
    draw.line([(x1, y), (x2, y)], fill=HAMMERED, width=1)
    draw.line([(x1, y - 5), (x1, y + 5)], fill=HAMMERED, width=1)
    draw.line([(x2, y - 5), (x2, y + 5)], fill=HAMMERED, width=1)
    lw = tw(label, mono_xxs)
    ly = y - 14 if above else y + 6
    draw.text(((x1 + x2) // 2 - lw // 2, ly), label, fill=HAMMERED, font=mono_xxs)

def dim_v(x, y1, y2, label, left=False):
    draw.line([(x, y1), (x, y2)], fill=HAMMERED, width=1)
    draw.line([(x - 5, y1), (x + 5, y1)], fill=HAMMERED, width=1)
    draw.line([(x - 5, y2), (x + 5, y2)], fill=HAMMERED, width=1)
    lx = x - tw(label, mono_xxs) - 8 if left else x + 8
    draw.text((lx, (y1 + y2) // 2 - 5), label, fill=HAMMERED, font=mono_xxs)

def dashed_rect(x, y, w, h, color, dash=5, gap=4):
    for i in range(0, w, dash + gap):
        e = min(i + dash, w)
        draw.line([(x + i, y), (x + e, y)], fill=color, width=1)
        draw.line([(x + i, y + h), (x + e, y + h)], fill=color, width=1)
    for i in range(0, h, dash + gap):
        e = min(i + dash, h)
        draw.line([(x, y + i), (x, y + e)], fill=color, width=1)
        draw.line([(x + w, y + i), (x + w, y + e)], fill=color, width=1)

def slot_label(sx, sy, sw, sh, text):
    lw = tw(text, mono_xxs)
    draw.text((sx + sw // 2 - lw // 2, sy + sh // 2 - 5), text, fill=HAMMERED, font=mono_xxs)

# ─── REGISTRATION MARKS ───────────────────────────────────────────
for cx, cy in [(72, 72), (W - 72, 72), (72, H - 72), (W - 72, H - 72)]:
    reg_cross(cx, cy, 12)

# Small reference numbers at corners
draw.text((90, 58), "001", fill=CHAMPAGNE, font=mono_xxs)
draw.text((W - 120, 58), "TC", fill=CHAMPAGNE, font=mono_xxs)

# ─── TITLE ZONE (y: 100–420) ──────────────────────────────────────
draw.text((160, 120), "THREADLINE", fill=INK, font=poiret_xl)
draw.text((160, 240), "CARTOGRAPHY", fill=HAMMERED, font=poiret_lg)

# Thin rule
draw.line([(160, 330), (2240, 330)], fill=CHAMPAGNE, width=1)

# Subtitle
draw.text((160, 350), "Specimen Plate 001", fill=SLATE, font=mono_sm)
text_r(350, "Grid Systems of the Katha Loom · 300 DPI", mono_sm, SLATE)

# Format reference line
draw.text((160, 380), "Three formats at 0.45× scale  ·  Gemini Blueprint Dimensions  ·  All units in pixels at native resolution", fill=CHAMPAGNE, font=mono_xxs)

# ─── SPECIMEN ZONE (y: 460–1400) ──────────────────────────────────
SCALE = 0.45

# === FIG. I — 2×6 STRIP (600×1800) ===
s1_ox, s1_oy = 200, 490
s1_w, s1_h = int(600 * SCALE), int(1800 * SCALE)  # 270×810

draw.text((s1_ox, s1_oy - 28), "FIG. I", fill=SLATE, font=mono_sm)
draw.rectangle([(s1_ox, s1_oy), (s1_ox + s1_w, s1_oy + s1_h)], outline=INK, width=2)

# 3 slots: 480×380, gap=40, padTop=150, marginX=60
strip_slots = [
    (60, 150, 480, 380),
    (60, 570, 480, 380),
    (60, 990, 480, 380),
]
for i, (sx, sy, sw, sh) in enumerate(strip_slots):
    rx = s1_ox + int(sx * SCALE)
    ry = s1_oy + int(sy * SCALE)
    rw = int(sw * SCALE)
    rh = int(sh * SCALE)
    draw.rectangle([(rx, ry), (rx + rw, ry + rh)], fill=SLOT_FILL, outline=HAMMERED, width=1)
    slot_label(rx, ry, rw, rh, f"{sw}×{sh}")
    # Small slot number
    draw.text((rx + 4, ry + 4), f"S{i+1}", fill=CHAMPAGNE, font=mono_xxs)

# Branding pedestal (dashed)
bz = (60, 1370, 480, 370)
bx = s1_ox + int(bz[0] * SCALE)
by_ = s1_oy + int(bz[1] * SCALE)
bw = int(bz[2] * SCALE)
bh = int(bz[3] * SCALE)
dashed_rect(bx, by_, bw, bh, CHAMPAGNE)
text_c_x = bx + bw // 2
draw.text((text_c_x - tw("BRANDING", mono_xxs) // 2, by_ + bh // 2 - 12), "BRANDING", fill=CHAMPAGNE, font=mono_xxs)
draw.text((text_c_x - tw("PEDESTAL", mono_xxs) // 2, by_ + bh // 2 + 2), "PEDESTAL", fill=CHAMPAGNE, font=mono_xxs)

# Labels below
draw.text((s1_ox, s1_oy + s1_h + 16), "2×6 STRIP", fill=INK, font=mono_sm)
draw.text((s1_ox, s1_oy + s1_h + 34), "600 × 1800 px", fill=HAMMERED, font=mono_xs)

# Dimension annotations
dim_h(s1_ox, s1_ox + s1_w, s1_oy + s1_h + 58, "600px")
dim_v(s1_ox + s1_w + 16, s1_oy, s1_oy + s1_h, "1800px")

# Margin annotation (small)
margin_x = s1_ox + int(60 * SCALE)
draw.text((s1_ox + 2, s1_oy + int(75 * SCALE)), "60", fill=CHAMPAGNE, font=mono_xxs)

# === FIG. II — 4×6 VERTICAL (1200×1800) ===
s2_ox, s2_oy = 620, 490
s2_w, s2_h = int(1200 * SCALE), int(1800 * SCALE)  # 540×810

draw.text((s2_ox, s2_oy - 28), "FIG. II", fill=SLATE, font=mono_sm)
draw.rectangle([(s2_ox, s2_oy), (s2_ox + s2_w, s2_oy + s2_h)], outline=INK, width=2)

# 2 slots: 1080×590, gap=40, padTop=150, marginX=60
vert_slots = [
    (60, 150, 1080, 590),
    (60, 780, 1080, 590),
]
for i, (sx, sy, sw, sh) in enumerate(vert_slots):
    rx = s2_ox + int(sx * SCALE)
    ry = s2_oy + int(sy * SCALE)
    rw = int(sw * SCALE)
    rh = int(sh * SCALE)
    draw.rectangle([(rx, ry), (rx + rw, ry + rh)], fill=SLOT_FILL, outline=HAMMERED, width=1)
    slot_label(rx, ry, rw, rh, f"{sw}×{sh}")
    draw.text((rx + 4, ry + 4), f"S{i+1}", fill=CHAMPAGNE, font=mono_xxs)

# Branding pedestal
bz2 = (60, 1370, 1080, 370)
bx2 = s2_ox + int(bz2[0] * SCALE)
by2 = s2_oy + int(bz2[1] * SCALE)
bw2 = int(bz2[2] * SCALE)
bh2 = int(bz2[3] * SCALE)
dashed_rect(bx2, by2, bw2, bh2, CHAMPAGNE)
draw.text((bx2 + bw2 // 2 - tw("BRANDING PEDESTAL", mono_xxs) // 2, by2 + bh2 // 2 - 5),
          "BRANDING PEDESTAL", fill=CHAMPAGNE, font=mono_xxs)

# Labels
draw.text((s2_ox, s2_oy + s2_h + 16), "4×6 VERTICAL", fill=INK, font=mono_sm)
draw.text((s2_ox, s2_oy + s2_h + 34), "1200 × 1800 px", fill=HAMMERED, font=mono_xs)

dim_h(s2_ox, s2_ox + s2_w, s2_oy + s2_h + 58, "1200px")
dim_v(s2_ox + s2_w + 16, s2_oy, s2_oy + s2_h, "1800px")

# === FIG. III — 6×4 LANDSCAPE L-SHAPE (1800×1200) ===
s3_ox, s3_oy = 1300, 625
s3_w, s3_h = int(1800 * SCALE), int(1200 * SCALE)  # 810×540

draw.text((s3_ox, s3_oy - 28), "FIG. III", fill=SLATE, font=mono_sm)
draw.rectangle([(s3_ox, s3_oy), (s3_ox + s3_w, s3_oy + s3_h)], outline=INK, width=2)

# L-shape: 2×2 grid, 750×450 slots, 100px margins/gaps
# Top-left: photo, Top-right: BRAND, Bottom-left: photo, Bottom-right: photo
land_slots = [
    (100, 100, 750, 450),    # top-left photo
    (100, 650, 750, 450),    # bottom-left photo
    (950, 650, 750, 450),    # bottom-right photo
]
for i, (sx, sy, sw, sh) in enumerate(land_slots):
    rx = s3_ox + int(sx * SCALE)
    ry = s3_oy + int(sy * SCALE)
    rw = int(sw * SCALE)
    rh = int(sh * SCALE)
    draw.rectangle([(rx, ry), (rx + rw, ry + rh)], fill=SLOT_FILL, outline=HAMMERED, width=1)
    slot_label(rx, ry, rw, rh, f"{sw}×{sh}")
    draw.text((rx + 4, ry + 4), f"S{i+1}", fill=CHAMPAGNE, font=mono_xxs)

# Branding cell (top-right, same size as a slot)
brand_cell = (950, 100, 750, 450)
bx3 = s3_ox + int(brand_cell[0] * SCALE)
by3 = s3_oy + int(brand_cell[1] * SCALE)
bw3 = int(brand_cell[2] * SCALE)
bh3 = int(brand_cell[3] * SCALE)
draw.rectangle([(bx3, by3), (bx3 + bw3, by3 + bh3)], fill=BRAND_FILL, outline=CHAMPAGNE, width=1)
# "KATHA" inside
draw.text((bx3 + bw3 // 2 - tw("K A T H A", poiret_sm) // 2, by3 + bh3 // 2 - 18),
          "K A T H A", fill=HAMMERED, font=poiret_sm)
draw.text((bx3 + bw3 // 2 - tw("BRANDING CELL", mono_xxs) // 2, by3 + bh3 // 2 + 12),
          "BRANDING CELL", fill=CHAMPAGNE, font=mono_xxs)

# Layout type label
draw.text((s3_ox + s3_w - tw("L-SHAPE GRID", mono_xxs), s3_oy + s3_h - 16), "L-SHAPE GRID", fill=CHAMPAGNE, font=mono_xxs)

# Labels
draw.text((s3_ox, s3_oy + s3_h + 16), "6×4 LANDSCAPE", fill=INK, font=mono_sm)
draw.text((s3_ox, s3_oy + s3_h + 34), "1800 × 1200 px", fill=HAMMERED, font=mono_xs)
draw.text((s3_ox, s3_oy + s3_h + 52), "Museum Matting: 100px uniform margin/gap", fill=CHAMPAGNE, font=mono_xxs)

dim_h(s3_ox, s3_ox + s3_w, s3_oy + s3_h + 72, "1800px")
dim_v(s3_ox + s3_w + 16, s3_oy, s3_oy + s3_h, "1200px")

# ─── THREAD CONNECTION LINE ───────────────────────────────────────
# A continuous line linking the three specimens at their baselines
thread_y = s1_oy + s1_h + 90
draw.line([(160, thread_y), (2240, thread_y)], fill=CHAMPAGNE, width=1)

# Accent dots at each specimen center
for ox, ow in [(s1_ox, s1_w), (s2_ox, s2_w), (s3_ox, s3_w)]:
    cx = ox + ow // 2
    draw.ellipse([(cx - 3, thread_y - 3), (cx + 3, thread_y + 3)], fill=RUST)

# ─── SPECIFICATION TABLE (y: 1440–1660) ──────────────────────────
table_y = 1440
draw.text((160, table_y), "SLOT SPECIFICATION REFERENCE", fill=SLATE, font=mono_sm)
draw.line([(160, table_y + 20), (1100, table_y + 20)], fill=CHAMPAGNE, width=1)

# Table headers
headers = ["FORMAT", "SLOT", "GAP", "MARGIN", "PEDESTAL"]
col_x = [160, 420, 640, 780, 920]
for i, h in enumerate(headers):
    draw.text((col_x[i], table_y + 30), h, fill=SLATE, font=mono_xxs)

draw.line([(160, table_y + 44), (1100, table_y + 44)], fill=CHAMPAGNE, width=1)

# Table rows
rows = [
    ["2×6 Strip (3-slot)", "480 × 380", "40px", "60px", "480 × 370"],
    ["2×6 Strip (2-slot)", "480 × 520", "40px", "60px", "480 × 370"],
    ["2×6 Strip (4-slot)", "480 × 320", "30px", "60px", "480 × 240"],
    ["4×6 Vertical (2-slot)", "1080 × 590", "40px", "60px", "1080 × 370"],
    ["6×4 Landscape (L)", "750 × 450", "100px", "100px", "750 × 450"],
]
for j, row in enumerate(rows):
    ry = table_y + 52 + j * 18
    for i, val in enumerate(row):
        color = INK if i == 0 else HAMMERED
        draw.text((col_x[i], ry), val, fill=color, font=mono_xxs)

draw.line([(160, table_y + 52 + 5 * 18 + 4), (1100, table_y + 52 + 5 * 18 + 4)], fill=CHAMPAGNE, width=1)

# ─── PATTERN REFERENCE (y: 1440, right side) ─────────────────────
pat_x, pat_y = 1300, 1440
draw.text((pat_x, pat_y), "PATTERN UNIT CELL", fill=SLATE, font=mono_sm)
draw.line([(pat_x, pat_y + 20), (pat_x + 500, pat_y + 20)], fill=CHAMPAGNE, width=1)

# Draw a simplified Binakul zigzag pattern
cell_x, cell_y = pat_x + 40, pat_y + 40
cell_size = 120

# Outer frame
draw.rectangle([(cell_x, cell_y), (cell_x + cell_size, cell_y + cell_size)],
               outline=HAMMERED, width=1)

# Binakul-inspired zigzag (simplified optical weave)
step = cell_size // 6
for i in range(6):
    y_base = cell_y + i * step
    if i % 2 == 0:
        draw.line([(cell_x, y_base), (cell_x + cell_size // 2, y_base + step)], fill=INK, width=1)
        draw.line([(cell_x + cell_size // 2, y_base + step), (cell_x + cell_size, y_base)], fill=INK, width=1)
    else:
        draw.line([(cell_x, y_base + step), (cell_x + cell_size // 2, y_base)], fill=HAMMERED, width=1)
        draw.line([(cell_x + cell_size // 2, y_base), (cell_x + cell_size, y_base + step)], fill=HAMMERED, width=1)

draw.text((cell_x + cell_size + 20, cell_y + 10), "BINAKUL", fill=SLATE, font=mono_xxs)
draw.text((cell_x + cell_size + 20, cell_y + 24), "Optical weave", fill=CHAMPAGNE, font=mono_xxs)
draw.text((cell_x + cell_size + 20, cell_y + 38), "Apotropaic", fill=CHAMPAGNE, font=mono_xxs)
draw.text((cell_x + cell_size + 20, cell_y + 52), "geometry", fill=CHAMPAGNE, font=mono_xxs)

# Calado divider sample
cal_y = cell_y + cell_size + 30
draw.text((pat_x + 40, cal_y), "CALADO DIVIDER", fill=SLATE, font=mono_xxs)
# Draw a calado-style openwork line
for i in range(0, 300, 12):
    cx = pat_x + 40 + i
    cy = cal_y + 18
    draw.ellipse([(cx, cy), (cx + 4, cy + 4)], outline=HAMMERED, width=1)
    if i > 0:
        draw.line([(cx - 4, cy + 2), (cx, cy + 2)], fill=CHAMPAGNE, width=1)

# ─── PALETTE ZONE (y: 1780–1920) ─────────────────────────────────
pal_y = 1780
draw.text((160, pal_y), "MATERIAL REFERENCE", fill=SLATE, font=mono_sm)
draw.line([(160, pal_y + 20), (2240, pal_y + 20)], fill=CHAMPAGNE, width=1)

palette = [
    ("Obsidian",    "#111112", OBSIDIAN),
    ("Iron Bark",   "#241E1A", BARK),
    ("Knalum Ink",  "#1A1816", INK),
    ("Loko Rust",   "#8C382A", RUST),
    ("Terracotta",  "#A35C44", TERRA),
    ("Abel Slate",  "#5A5D5A", SLATE),
    ("Hammered",    "#9C958A", HAMMERED),
    ("Champagne",   "#C4B59D", CHAMPAGNE),
    ("Capiz Sage",  "#B5B8A3", SAGE),
    ("Piña Ecru",   "#EAE2D5", ECRU),
]

n = len(palette)
spacing = 200
total_span = (n - 1) * spacing
start_x = (W - total_span) // 2
r = 24

for i, (name, hexv, color) in enumerate(palette):
    cx = start_x + i * spacing
    cy = pal_y + 64

    # Circle with thin border
    border = HAMMERED if color != ECRU else CHAMPAGNE
    draw.ellipse([(cx - r, cy - r), (cx + r, cy + r)], fill=color, outline=border, width=1)

    # Hex
    hw = tw(hexv, mono_xxs)
    draw.text((cx - hw // 2, cy + r + 8), hexv, fill=HAMMERED, font=mono_xxs)

    # Name
    nw = tw(name, mono_xxs)
    draw.text((cx - nw // 2, cy + r + 22), name, fill=SLATE, font=mono_xxs)

# ─── PHILOSOPHY EXCERPT (y: 1960–2120) ───────────────────────────
exc_y = 1960
draw.line([(400, exc_y), (2000, exc_y)], fill=CHAMPAGNE, width=1)

excerpts = [
    "Space is measured in tension, not distance.",
    "Color arrives as dye, not light.",
    "Form is woven, not drawn.",
    "Pattern is proof of process.",
]
for i, line in enumerate(excerpts):
    text_c(exc_y + 24 + i * 36, line, serif_it, SLATE)

draw.line([(400, exc_y + 24 + 4 * 36 + 10), (2000, exc_y + 24 + 4 * 36 + 10)], fill=CHAMPAGNE, width=1)

# ─── DESIGN PRINCIPLES (y: 2200–2500) ────────────────────────────
pr_y = 2240
draw.text((160, pr_y), "GOVERNING PRINCIPLES", fill=SLATE, font=mono_sm)
draw.line([(160, pr_y + 20), (2240, pr_y + 20)], fill=CHAMPAGNE, width=1)

principles = [
    ("01", "SELVEDGE MARGINS", "Outer safe zone = structural edge, not padding. 60u strip/vertical, 100u landscape."),
    ("02", "MUSEUM MATTING", "Equal breath on every side. The 6×4 grid: gap === margin === 100px."),
    ("03", "BRANDING PEDESTAL", "Text zone is a first-class region, never an afterthought. ≥20% of canvas height."),
    ("04", "SINGLE SOURCE", "All geometry is DATA in layouts.js. Every render path reads from one registry."),
    ("05", "DUAL FORMAT", "Every asset ships SVG+PNG (Next.js) and raster+CodeBlock (Squarespace)."),
]
for i, (num, title, desc) in enumerate(principles):
    py = pr_y + 36 + i * 42
    # Loko Rust accent dot
    draw.ellipse([(160, py + 3), (168, py + 11)], fill=RUST)
    draw.text((180, py), num, fill=HAMMERED, font=mono_xs)
    draw.text((220, py), title, fill=INK, font=mono_xs)
    draw.text((220, py + 15), desc, fill=HAMMERED, font=mono_xxs)

# ─── KATHA FOOTER (y: 2600–2800) ─────────────────────────────────
# Thin rule
draw.line([(600, 2640), (1800, 2640)], fill=CHAMPAGNE, width=1)

text_c(2670, "K  A  T  H  A", poiret_md, INK)
text_c(2720, "Est. 2026  ·  Southern California", mono_xs, HAMMERED)
text_c(2754, "Threadline Cartography  ·  Specimen Plate 001", mono_xxs, CHAMPAGNE)

# Small Loko Rust accent below
cx = W // 2
draw.ellipse([(cx - 4, 2790), (cx + 4, 2798)], fill=RUST)

# ─── OUTER PLATE FRAME ────────────────────────────────────────────
# Very thin frame inset from edges — the selvedge boundary
draw.rectangle([(40, 40), (W - 40, H - 40)], outline=CHAMPAGNE, width=1)

# ─── SAVE ──────────────────────────────────────────────────────────
img.save(OUTPUT, "PNG", dpi=(300, 300))
print(f"Saved: {OUTPUT}")
print(f"Dimensions: {W}×{H}")
print("Done.")
