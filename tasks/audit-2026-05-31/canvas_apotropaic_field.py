#!/usr/bin/env python3
"""
APOTROPAIC FIELD — Plate I
A museum-grade textile-analysis plate in the Katha canon.
Soul: the Binakul whirlpool as apotropaic geometry — the two brand guardians
(Loom Auditor, Brass-Ring Enforcer) encoded as twin sentinel vortices warding a field.
Strict T'nalak tri-discipline: soil-black ground, raw-fiber thread, one sacred red.
Rendered at 3x supersample, LANCZOS down for crisp hairlines.
"""
import math, numpy as np
from PIL import Image, ImageDraw, ImageFont

# ---------- canon palette ----------
KNALUM   = (26, 24, 22)      # #1A1816 soil-black ground (T'nalak)
PINA     = (234, 226, 213)   # #EAE2D5 raw-fiber thread
CHAMP    = (196, 181, 157)   # #C4B59D tonal embroidery
SEQUIN   = (156, 149, 138)   # #9C958A catchlight (dark grounds only)
SLATE    = (90, 93, 90)      # #5A5D5A muted markers
LOKO     = (140, 56, 42)     # #8C382A sacred red — used EXACTLY ONCE
IRONBARK = (36, 30, 26)      # #241E1A loom frame

# ---------- geometry ----------
SS = 3
BW, BH = 1500, 1875
W, H = BW*SS, BH*SS
M = 132*SS                    # outer margin (Ma)

FONTS = "/Users/jedg./Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/05e0c54f-5a53-43c0-810b-f059c7d4c7b1/2540ebd4-9984-48d2-8ff1-07a6f324121d/skills/canvas-design/canvas-fonts"
def F(name, px): return ImageFont.truetype(f"{FONTS}/{name}", px*SS)

serif_big  = F("YoungSerif-Regular.ttf", 86)
serif_mid  = F("YoungSerif-Regular.ttf", 30)
mono       = F("JetBrainsMono-Regular.ttf", 13)
mono_b     = F("JetBrainsMono-Bold.ttf", 13)
mono_sm    = F("JetBrainsMono-Regular.ttf", 10)
ital       = F("CrimsonPro-Italic.ttf", 27)

# ---------- base: soil ground + woven paper grain ----------
img = Image.new("RGB", (W, H), KNALUM)
rng = np.random.default_rng(7)
# subtle vertical tonal breath
grad = np.linspace(-6, 5, H).reshape(H,1)
# fine fiber grain
grain = rng.normal(0, 3.2, (H, W))
base = np.array(img, dtype=np.float32)
for c in range(3):
    base[:,:,c] = np.clip(base[:,:,c] + grad + grain, 0, 255)
img = Image.fromarray(base.astype(np.uint8), "RGB")
draw = ImageDraw.Draw(img, "RGBA")

def lw(px): return max(1, int(round(px*SS)))

# ---------- helpers ----------
def rgba(c, a): return (c[0], c[1], c[2], a)

def text_w(s, font):
    b = draw.textbbox((0,0), s, font=font); return b[2]-b[0]

def tracked(x, y, s, font, fill, trk, anchor="la"):
    """draw letter-spaced text; anchor la|ra|ma (left/right/middle baseline-top)."""
    widths = [text_w(ch, font) for ch in s]
    total = sum(widths) + trk*SS*(len(s)-1)
    if anchor=="ra": x -= total
    elif anchor=="ma": x -= total/2
    cx = x
    for ch,w in zip(s,widths):
        draw.text((cx,y), ch, font=font, fill=fill)
        cx += w + trk*SS
    return total

# ================= VORTEX ENGINE =================
def square_pts(cx, cy, half, rot):
    pts=[]
    for k in range(4):
        a = rot + math.pi/4 + k*math.pi/2
        pts.append((cx + half*math.sqrt(2)*math.cos(a),
                    cy + half*math.sqrt(2)*math.sin(a)))
    return pts

def vortex(cx, cy, half0, n, da, k, col, alpha, width, arms=True, arm_col=None,
           arm_alpha=None, eye=0.0):
    """nested rotating squares + 4 logarithmic spiral arms = apotropaic whirlpool.
    eye: fraction of half0 below which the weave stops, leaving a calm void."""
    corner_paths=[[],[],[],[]]
    stop = half0*eye
    for i in range(n):
        half = half0*(k**i); rot = i*da
        if half < stop: break
        p = square_pts(cx,cy,half,rot)
        draw.line(p+[p[0]], fill=rgba(col,alpha), width=lw(width), joint="curve")
        for c in range(4): corner_paths[c].append(p[c])
    if arms:
        ac = arm_col or col; aa = arm_alpha if arm_alpha is not None else min(255,alpha+40)
        for path in corner_paths:
            draw.line(path, fill=rgba(ac,aa), width=lw(width*0.8), joint="curve")

# ---------- composition frame (loom) ----------
fx0, fy0, fx1, fy1 = M, M, W-M, H-M
# faint containment rule — top & bottom hairlines only (Ma on the sides)
draw.line([(fx0,fy0),(fx1,fy0)], fill=rgba(SEQUIN,150), width=lw(1.2))
draw.line([(fx0,fy1),(fx1,fy1)], fill=rgba(SEQUIN,110), width=lw(1.2))

# ---------- header band ----------
hy = fy0 + 30*SS
tracked(fx0, hy, "PLATE  I", mono_b, rgba(PINA,235), 7)
tracked(fx1, hy, "KTHA · FIELD STUDIES · 2026", mono, rgba(SLATE,230), 5, anchor="ra")
hy2 = hy + 30*SS
tracked(fx0, hy2, "APOTROPAIC GEOMETRY — THE WARDING WEAVE", mono, rgba(SEQUIN,210), 5)

# ================= THE FIELD =================
# asymmetric: protagonist pulled left-of-centre, stillness held right (Fukinsei + Ma).
# vertical zones — field sits above a clean scale lane, above the wordmark.
PX = M + (fx1-fx0)*0.385
PY = M + (fy1-fy0)*0.445
R0 = (fx1-fx0)*0.250
EYE = 0.085                         # calm void radius fraction

# faint deep companion field — distant whirl, barely there
vortex(PX+R0*0.12, PY+R0*0.04, R0*1.16, 80, math.radians(5.0), 0.951,
       SEQUIN, 24, 1.0, arms=False, eye=0.05)

# --- TWIN SENTINELS: two guardian vortices, drawn close so the lower-left
#     quadrant stays clear for the wordmark (the soul, unannounced) ---
vortex(PX - R0*0.96, PY - R0*0.86, R0*0.265, 40, math.radians(7.6), 0.945,
       CHAMP, 110, 0.9, arm_col=PINA, arm_alpha=140, eye=0.10)
vortex(PX + R0*1.04, PY + R0*0.40, R0*0.265, 40, math.radians(-7.6), 0.945,
       CHAMP, 110, 0.9, arm_col=PINA, arm_alpha=140, eye=0.10)

# --- primary protagonist whirlpool, eye held open ---
vortex(PX, PY, R0, 90, math.radians(6.2), 0.957,
       PINA, 215, 1.15, arm_col=PINA, arm_alpha=255, eye=EYE)

# registration crop-marks around protagonist
cl = R0*1.28
for sx in (-1,1):
    for sy in (-1,1):
        x = PX + sx*cl; y = PY + sy*cl; t = 24*SS
        draw.line([(x,y),(x - sx*t,y)], fill=rgba(SEQUIN,190), width=lw(1.1))
        draw.line([(x,y),(x,y - sy*t)], fill=rgba(SEQUIN,190), width=lw(1.1))

# ---------- THE BRASS RING — sacred Loko, exactly once, in the open eye ----------
# the threads spiral inward and terminate at the ring: permission to leave the loom
er = R0*EYE*1.02
# faint clearing so the sacred mark reads against calm ground, not thread-crossings
draw.ellipse([PX-er*1.15,PY-er*1.15,PX+er*1.15,PY+er*1.15], fill=rgba(KNALUM,180))
draw.ellipse([PX-er*1.7,PY-er*1.7,PX+er*1.7,PY+er*1.7], outline=rgba(LOKO,90), width=lw(1.0))  # single glow hairline
draw.ellipse([PX-er,PY-er,PX+er,PY+er], outline=rgba(LOKO,255), width=lw(3.0))
draw.ellipse([PX-3.6*SS,PY-3.6*SS,PX+3.6*SS,PY+3.6*SS], fill=rgba(LOKO,255))

# clean clinical leader OUT of the field to the right margin (calmer side)
lead_y = PY
draw.line([(PX+er+6*SS,lead_y),(fx1,lead_y)], fill=rgba(SLATE,150), width=lw(1.0))
draw.ellipse([fx1-3*SS,lead_y-3*SS,fx1+3*SS,lead_y+3*SS], fill=rgba(SLATE,170))
tracked(fx1, lead_y-30*SS, "BRASS RING", mono_b, rgba(LOKO,255), 6, anchor="ra")
tracked(fx1, lead_y+12*SS, "permission to leave the loom", ital, rgba(CHAMP,235), 0, anchor="ra")

# ---------- measured scale bar — its own clean lane below the field ----------
sby = PY + R0*1.28 + 60*SS
sbx = fx0
seg = R0*0.62
draw.line([(sbx,sby),(sbx+seg,sby)], fill=rgba(PINA,215), width=lw(1.4))
for t in (0,0.25,0.5,0.75,1.0):
    h = 6*SS if t in (0,1.0) else 4*SS
    draw.line([(sbx+seg*t,sby-h),(sbx+seg*t,sby+h)], fill=rgba(PINA,215), width=lw(1.1))
tracked(sbx, sby+13*SS, "0", mono_sm, rgba(SLATE,215), 0)
tracked(sbx+seg, sby+13*SS, "144 mm", mono_sm, rgba(SLATE,215), 0, anchor="ra")

# ================= RIGHT-COLUMN TAXONOMY (sparse, clinical, legible) =================
rcx = fx1
ty  = M + (fy1-fy0)*0.125
def field(label, value, vfont=mono_b, vcol=PINA):
    global ty
    tracked(rcx, ty, label, mono_sm, rgba(SLATE,235), 5, anchor="ra"); ty += 22*SS
    tracked(rcx, ty, value, vfont, rgba(vcol,245), 3, anchor="ra"); ty += 24*SS
    draw.line([(rcx-58*SS,ty),(rcx,ty)], fill=rgba(SLATE,90), width=lw(1.0)); ty += 30*SS

field("CLASS",      "APOTROPAIC")
field("ORDER",      "BINAKUL · WHIRLPOOL")
field("THREAD",     "CONTINUOUS / SINGLE")
field("SENTINELS",  "II", vfont=serif_mid, vcol=CHAMP)
field("WARD STATE", "WHOLE")
field("PERMISSION", "GRANTED", vcol=CHAMP)

# ================= LOWER GESTURE: movement name + creed =================
ny = fy1 - 232*SS
tracked(fx0, ny, "MOVEMENT", mono_sm, rgba(SLATE,210), 6)
draw.text((fx0-3*SS, ny+22*SS), "Apotropaic", font=serif_big, fill=rgba(PINA,240))
draw.text((fx0-3*SS, ny+22*SS+92*SS), "Field", font=serif_big, fill=rgba(PINA,240))
# sacred-adjacent accent: a single champagne hairline underscoring the name
uy = ny+22*SS+92*SS+108*SS
draw.line([(fx0,uy),(fx0+ text_w('Field',serif_big),uy)], fill=rgba(CHAMP,200), width=lw(1.4))

# the one lyrical line
tracked(fx1, fy1-58*SS, "the pattern that guards keeps the made thing whole", ital,
        rgba(CHAMP,230), 0, anchor="ra")

# clinical footer
tracked(fx0, fy1-34*SS, "FIG. 1 — NESTED ROTATION, 84 FRAMES · da 6.2°", mono_sm, rgba(SLATE,210), 4)

# ================= downsample + export =================
final = img.resize((BW*2, BH*2), Image.LANCZOS)   # high-res, crisp
out_png = "/Users/jedg./Desktop/kat_ha_pb/tasks/audit-2026-05-31/APOTROPAIC_FIELD_plate_I.png"
out_pdf = "/Users/jedg./Desktop/kat_ha_pb/tasks/audit-2026-05-31/APOTROPAIC_FIELD_plate_I.pdf"
final.save(out_png, "PNG")
final.convert("RGB").save(out_pdf, "PDF", resolution=200)
print("wrote", out_png)
print("size", final.size)
