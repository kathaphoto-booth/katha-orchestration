/* ═══════════════════════════════════════════════════════════════════════════
   KATHA — templates.js · The curated print catalog (LOOM & VOID)
   ─────────────────────────────────────────────────────────────────────────
   SSOT: pb-v3/lib/data.ts (Jed's 2026-07-03 curation — 5 Signature + 5 Classic)
   Geometry: pb-v3/lib/layouts.js (300-DPI viewBox slot registry — verbatim)
   Philosophy: KATHA_BOOKING_PRD/TEMPLATE_DESIGN_PHILOSOPHY.md
     — apertures are sacred voids, never filled;
     — decoration lives at the selvage, deterministic like handwork;
     — one thread of Achuete does the work of ten.
   Zero placeholders: every preview is real vector geometry (quiet-luxury law).
   ═══════════════════════════════════════════════════════════════════════════ */
'use strict';

const KATHA_VIEWBOX = {
  strip: { w: 600, h: 1800 },
  'postcard-vertical': { w: 1200, h: 1800 },
  postcard: { w: 1800, h: 1200 },
};

const KR = (x, y, w, h) => ({ x, y, w, h });

const KATHA_LAYOUTS = {
  'strip-3': { format: 'strip', slots: [KR(60,150,480,380), KR(60,570,480,380), KR(60,990,480,380)], textZone: KR(60,1410,480,330) },
  'strip-4': { format: 'strip', slots: [KR(60,70,480,300), KR(60,400,480,300), KR(60,730,480,300), KR(60,1060,480,300)], textZone: KR(60,1400,480,340) },
  'pv-2':    { format: 'postcard-vertical', slots: [KR(60,150,1080,590), KR(60,780,1080,590)], textZone: KR(60,1410,1080,330) },
  'pc-2-sq': { format: 'postcard', slots: [KR(180,100,680,680), KR(940,100,680,680)], textZone: KR(100,880,1600,220) },
};

/* The curated ten. Copy is verbatim from the curation; hexes are per-plate
   material grounds (each piece owns its ground the way paper owns its fiber). */
const KATHA_TEMPLATES = [
  { id:'loom-oak', plate:'004', name:'Loom Oak', style:'Signature', booth:'Oak', formatLabel:'2×6 Strip', layout:'strip-3', font:"'Newsreader', serif", ratio:'1 / 3',
    desc:'Three frames on unbleached ground with a single Kobe seam — the warp line of the loom drawn straight down the strip.',
    paper:'#ECE7DB', slot:'#D1CBBF', edge:'#882D17', ink:'#161311', accent:'#882D17', sName:'AMARA & SEBASTIAN', sSub:'OCTOBER · LONG BEACH' },
  { id:'bituin', plate:'011', name:'Bituin', style:'Signature', booth:'Oak', formatLabel:'4×6 Postcard', layout:'pv-2', font:"'Newsreader', serif", ratio:'2 / 3',
    desc:'Leaf-black ground, two apertures in geometric tension, one Achuete red thread bisecting the field below.',
    paper:'#1A1714', slot:'#241F1B', edge:'#8F8C8A', ink:'#E8E1D3', accent:'#9A3D2A', sName:'RENZO & CAMILLE', sSub:'NOVEMBER · CARSON' },
  { id:'calado-pina', plate:'019', name:'Calado Piña', style:'Signature', booth:'Oak', formatLabel:'4×6 Postcard', layout:'pv-2', font:"'Cormorant Garamond', serif", ratio:'2 / 3',
    desc:'Two openings on raw piña fiber, divided by a hand-stitched calado — openwork drawn the way grandmothers drew it.',
    paper:'#E3DEC5', slot:'#D2CBBF', edge:'#8F8C8A', ink:'#161311', accent:'#882D17', sName:'Marisol & Diego', sSub:'September · Pasadena' },
  { id:'sombra-twin', plate:'027', name:'Sombra Twin', style:'Signature', booth:'White', formatLabel:'6×4 Square', layout:'pc-2-sq', font:"'Cormorant Garamond', serif", ratio:'3 / 2',
    desc:'Twin squares with breathing room, each trailing a ghost silhouette offset behind it, as if seen through fabric.',
    paper:'#D2CBBF', slot:'#C0B9AC', edge:'#8F8C8A', ink:'#161311', accent:'#882D17', sName:'SOFIA & MARCO', sSub:'SEPTEMBER · LOS ANGELES' },
  { id:'katha-heritage-frame', plate:'033', name:'Abel & Calado', style:'Signature', booth:'Oak', formatLabel:'4×6 Postcard', layout:'pv-2', font:"'Fraunces', serif", ratio:'2 / 3',
    desc:'Double fine-lined frame in Champagne Heirloom with Fraunces serif set on a Piña Ecru ground.',
    paper:'#E8E1D3', slot:'#F5EFE4', edge:'#C4B59D', ink:'#241E1A', accent:'#C4B59D', sName:'Abel & Calado', sSub:'OCTOBER · MALIBU' },
  { id:'iron-rule', plate:'041', name:'Iron Rule', style:'Classic', booth:'White', formatLabel:'2×6 Strip', layout:'strip-4', font:"'Newsreader', serif", ratio:'1 / 3',
    desc:'Four frames, one hairline rule. The design steps back so the portrait carries the whole strip.',
    paper:'#FAFAF8', slot:'#ECE7DB', edge:'#8F8C8A', ink:'#161311', accent:'#8F8C8A', sName:'NADIA + ELIAS', sSub:'JULY · LONG BEACH' },
  { id:'champagne-frame', plate:'053', name:'Champagne Frame', style:'Classic', booth:'Oak', formatLabel:'4×6 Postcard', layout:'pv-2', font:"'Newsreader', serif", ratio:'2 / 3',
    desc:'A concentric pewter border around two portraits — restraint with a single quiet line.',
    paper:'#ECE7DB', slot:'#D1CBBF', edge:'#8F8C8A', ink:'#161311', accent:'#8F8C8A', sName:'JAMES & ELEANOR', sSub:'OCTOBER · MALIBU' },
  { id:'wedding-luxe-gold', plate:'062', name:'Tradition Gold', style:'Classic', booth:'White', formatLabel:'2×6 Strip', layout:'strip-3', font:"'Cinzel', serif", ratio:'1 / 3',
    desc:'Double gold foil fine outline detailing around each slot. Clean Roman serif display, providing timeless heirloom appeal.',
    paper:'#FAF6F0', slot:'#F4EDE3', edge:'#C5A85C', ink:'#544634', accent:'#C5A85C', sName:'Steven & Cristalyn', sSub:'JULY 25, 2026' },
  { id:'rose-whisper', plate:'075', name:'Rose Whisper', style:'Classic', booth:'White', formatLabel:'4×6 Postcard', layout:'pv-2', font:"'Playfair Display', serif", ratio:'2 / 3',
    desc:'Deckled ivory paper backdrop adorned with a hand-sketched classic cream and white rose nested gracefully above the text.',
    paper:'#FAF9F6', slot:'#EDEDE9', edge:'#EBE9E4', ink:'#292524', accent:'#A59E92', sName:'Steven & Cristalyn', sSub:'JULY 25, 2026' },
  { id:'wedding-warm-terracotta', plate:'088', name:'Warm Terracotta', style:'Classic', booth:'Oak', formatLabel:'2×6 Strip', layout:'strip-4', font:"'EB Garamond', serif", ratio:'1 / 3',
    desc:'Bohemian dry terracotta sunset clay color. Accentuated by fine hairline gold rules and micro leafy contours.',
    paper:'#8F4D39', slot:'#9A543E', edge:'#DEC190', ink:'#FCFAF7', accent:'#E3CE9F', sName:'Steven & Cristalyn', sSub:'JULY 25, 2026' },
];

/* Deterministic PRNG — handwork repeats, machines jitter. Same seed, same sky. */
function kMulberry(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const esc = (s) => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

/* ── Per-plate decoration — the selvage work ─────────────────────────────── */
const KATHA_DECOR = {
  'loom-oak'(t, L, vb) {
    // One Kobe warp line, straight down the strip, behind the frames.
    const cx = vb.w / 2;
    return `<line x1="${cx}" y1="40" x2="${cx}" y2="${vb.h - 40}" stroke="${t.accent}" stroke-width="6" opacity=".9"/>`;
  },
  'bituin'(t, L, vb) {
    // A night sky over Carson — 120 stars plotted point by point, seeded.
    const rnd = kMulberry(11);
    let s = '';
    for (let i = 0; i < 120; i++) {
      const x = 40 + rnd() * (vb.w - 80), y = 40 + rnd() * (vb.h - 80);
      const r = 1.2 + rnd() * 2.6, o = 0.25 + rnd() * 0.6;
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${t.ink}" opacity="${o.toFixed(2)}"/>`;
    }
    // One Achuete thread bisecting the field below the apertures.
    const ty = L.textZone.y - 28;
    s += `<line x1="${L.textZone.x}" y1="${ty}" x2="${L.textZone.x + L.textZone.w}" y2="${ty}" stroke="${t.accent}" stroke-width="5"/>`;
    return s;
  },
  'calado-pina'(t, L, vb) {
    // Hand-stitched calado openwork band between the two openings.
    const a = L.slots[0], b = L.slots[1];
    const y = (a.y + a.h + b.y) / 2;
    let s = `<line x1="${a.x + 40}" y1="${y}" x2="${a.x + a.w - 40}" y2="${y}" stroke="${t.accent}" stroke-width="2" opacity=".55"/>`;
    for (let i = 0; i < 13; i++) {
      const x = a.x + 60 + i * ((a.w - 120) / 12);
      s += `<rect x="${x - 9}" y="${y - 9}" width="18" height="18" transform="rotate(45 ${x} ${y})" fill="none" stroke="${t.accent}" stroke-width="2.5"/>`;
      if (i < 12) s += `<circle cx="${x + (a.w - 120) / 24}" cy="${y}" r="3" fill="${t.accent}" opacity=".7"/>`;
    }
    return s;
  },
  'sombra-twin'(t, L) {
    // Ghost silhouettes trailing each square — seen through fabric.
    return L.slots.map(sl =>
      `<rect x="${sl.x + 26}" y="${sl.y + 26}" width="${sl.w}" height="${sl.h}" fill="none" stroke="${t.ink}" stroke-width="2" opacity=".22"/>`
    ).join('');
  },
  'katha-heritage-frame'(t, L, vb) {
    return `<rect x="34" y="34" width="${vb.w - 68}" height="${vb.h - 68}" fill="none" stroke="${t.accent}" stroke-width="3"/>
            <rect x="52" y="52" width="${vb.w - 104}" height="${vb.h - 104}" fill="none" stroke="${t.accent}" stroke-width="1.5"/>`;
  },
  'iron-rule'(t, L) {
    const y = L.textZone.y + 6;
    return `<line x1="${L.textZone.x + 30}" y1="${y}" x2="${L.textZone.x + L.textZone.w - 30}" y2="${y}" stroke="${t.accent}" stroke-width="2"/>`;
  },
  'champagne-frame'(t, L, vb) {
    return `<rect x="40" y="40" width="${vb.w - 80}" height="${vb.h - 80}" fill="none" stroke="${t.accent}" stroke-width="2.5" opacity=".8"/>`;
  },
  'wedding-luxe-gold'(t, L) {
    return L.slots.map(sl =>
      `<rect x="${sl.x - 12}" y="${sl.y - 12}" width="${sl.w + 24}" height="${sl.h + 24}" fill="none" stroke="${t.accent}" stroke-width="2.5"/>
       <rect x="${sl.x - 22}" y="${sl.y - 22}" width="${sl.w + 44}" height="${sl.h + 44}" fill="none" stroke="${t.accent}" stroke-width="1.2"/>`
    ).join('');
  },
  'rose-whisper'(t, L, vb) {
    // Line-art rose nested above the text band — drawn, not decorated.
    const cx = vb.w / 2, cy = L.textZone.y - 60, c = t.accent;
    return `<g stroke="${c}" fill="none" stroke-width="3" stroke-linecap="round" opacity=".85">
      <path d="M${cx} ${cy} c -14 -20 8 -38 24 -26 c 20 -18 46 4 32 26 c 22 8 12 40 -14 38 c -6 22 -42 22 -50 2 c -26 4 -34 -28 -12 -38 z"/>
      <path d="M${cx + 2} ${cy - 4} c -8 -10 4 -20 14 -14 m 4 34 c 14 -2 22 -12 18 -24"/>
      <path d="M${cx - 46} ${cy + 44} c 14 10 34 12 46 4 m 4 0 c 12 8 30 6 42 -6" stroke-width="2.4"/>
      <path d="M${cx - 64} ${cy + 30} c -12 18 -2 34 12 36 c 2 -16 -2 -28 -12 -36 z" stroke-width="2.4"/>
      <path d="M${cx + 66} ${cy + 28} c 14 16 6 34 -8 38 c -4 -16 0 -28 8 -38 z" stroke-width="2.4"/>
    </g>`;
  },
  'wedding-warm-terracotta'(t, L, vb) {
    // Gold hairlines top and bottom + micro leaf contours along the head rule.
    const leaf = (x, y, s, flip) =>
      `<path d="M${x} ${y} q ${6 * s * flip} ${-8 * s} ${14 * s * flip} 0 q ${-8 * s * flip} ${6 * s} ${-14 * s * flip} 0 z" fill="none" stroke="${t.accent}" stroke-width="1.6"/>`;
    let s = `<line x1="60" y1="44" x2="${vb.w - 60}" y2="44" stroke="${t.accent}" stroke-width="1.4"/>
             <line x1="60" y1="${vb.h - 44}" x2="${vb.w - 60}" y2="${vb.h - 44}" stroke="${t.accent}" stroke-width="1.4"/>`;
    const cx = vb.w / 2;
    s += leaf(cx - 44, 44, 1, 1) + leaf(cx - 22, 44, 1.2, 1) + `<circle cx="${cx}" cy="44" r="3" fill="${t.accent}"/>` + leaf(cx + 8, 44, 1.2, 1) + leaf(cx + 30, 44, 1, 1);
    return s;
  },
};

/* ── The renderer — one faithful SVG per plate ──────────────────────────────
   opts: { title, subtitle } personalize the text band (defaults = specimen). */
function renderKathaTemplate(t, opts = {}) {
  const L = KATHA_LAYOUTS[t.layout];
  const vb = KATHA_VIEWBOX[L.format];
  const title = (opts.title && String(opts.title).trim()) || t.sName;
  const subtitle = (opts.subtitle && String(opts.subtitle).trim()) || t.sSub;
  const tz = L.textZone;
  const isStrip = L.format === 'strip';
  const titleSize = isStrip ? 44 : (L.format === 'postcard' ? 84 : 76);
  const subSize = isStrip ? 20 : 30;
  const plateSize = isStrip ? 14 : 20;

  const slots = L.slots.map(sl =>
    `<rect x="${sl.x}" y="${sl.y}" width="${sl.w}" height="${sl.h}" fill="${t.slot}" stroke="${t.edge}" stroke-width="1.5" opacity=".98"/>`
  ).join('');

  const decor = (KATHA_DECOR[t.id] || (() => ''))(t, L, vb);

  const tcx = tz.x + tz.w / 2;
  const text = `
    <text x="${tcx}" y="${tz.y + tz.h * 0.42}" text-anchor="middle" fill="${t.ink}"
      font-family="${esc(t.font)}" font-size="${titleSize}" letter-spacing="${isStrip ? 2 : 4}">${esc(title)}</text>
    <text x="${tcx}" y="${tz.y + tz.h * 0.42 + subSize * 2.1}" text-anchor="middle" fill="${t.ink}" opacity=".62"
      font-family="'Courier Prime', monospace" font-size="${subSize}" letter-spacing="${subSize * 0.22}">${esc(subtitle.toUpperCase())}</text>
    <text x="${tcx}" y="${tz.y + tz.h - 18}" text-anchor="middle" fill="${t.ink}" opacity=".38"
      font-family="'Courier Prime', monospace" font-size="${plateSize}" letter-spacing="${plateSize * 0.3}">PLATE ${esc(t.plate)} · KATHA</text>`;

  return `<svg viewBox="0 0 ${vb.w} ${vb.h}" xmlns="http://www.w3.org/2000/svg" role="img"
    aria-label="${esc(t.name)} — ${esc(t.formatLabel)} print template preview" preserveAspectRatio="xMidYMid meet">
    <rect width="${vb.w}" height="${vb.h}" fill="${t.paper}"/>
    ${decor}
    ${slots}
    ${text}
  </svg>`;
}

/* Format filter chips used by the gallery. */
const KATHA_FORMAT_FILTERS = [
  { id: 'All', label: 'All' },
  { id: '2×6 Strip', label: '2×6 Strip' },
  { id: '4×6 Postcard', label: '4×6 Postcard' },
  { id: '6×4 Square', label: '6×4 Square' },
];

if (typeof window !== 'undefined') {
  window.KATHA_TEMPLATES = KATHA_TEMPLATES;
  window.KATHA_LAYOUTS = KATHA_LAYOUTS;
  window.KATHA_VIEWBOX = KATHA_VIEWBOX;
  window.KATHA_FORMAT_FILTERS = KATHA_FORMAT_FILTERS;
  window.renderKathaTemplate = renderKathaTemplate;
}
