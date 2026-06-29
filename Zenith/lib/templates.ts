// Katha Template Studio — shared template catalog (SINGLE SOURCE OF TRUTH).
// PRESETS + renderDecorativeSvg are consumed by BOTH the studio (app/page.tsx)
// and the client gallery (app/gallery/). Edit decoration HERE only — it updates
// preview, canvas export, AND the gallery thumbnails simultaneously.

import { LAYOUTS, SAFE_MARGIN, SLOT_GAP, VIEWBOX, getLayout, layoutsForFormat, defaultLayoutFor, resolveLayout, getModifiedLayout, FORMAT_MARGIN } from "./layouts.js";
export { LAYOUTS, SAFE_MARGIN, SLOT_GAP, VIEWBOX, getLayout, layoutsForFormat, defaultLayoutFor, resolveLayout, getModifiedLayout };

// Types
export interface PhotoboothPreset {
  id: string;
  name: string;
  type: "strip" | "postcard" | "postcard-vertical";
  // OPTIONAL — references a layout in lib/layouts.js. If omitted, the default
  // layout for `type` is used. This makes every preset render with declarative
  // slot geometry rather than hand-computed math.
  layoutId?: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  secondaryColor: string;
  fontFamily: string;
  titleText: string;
  subTitleText: string;
  dateText: string;
  slotBorderRadius: string;
  slotBorderWidth: string;
  slotGap: string;
  slotBgColor: string;
  innerSpacing: string;
  decorativeSvg: string;
  designerExplanation: string;
}

// ─── 15 AESTHETIC FAMILIES (SINGLE SOURCE OF TRUTH) ───────────────────────────
export const PRESETS: PhotoboothPreset[] = [
  // ─── 1. HEIRLOOM PIÑA (Katha Signature)
  {
    id: "katha-heirloom-pina",
    name: "Katha Signature — Heirloom Piña",
    type: "strip",
    backgroundColor: "#EAE2D5",
    textColor: "#241E1A",
    borderColor: "#C4B59D",
    secondaryColor: "#C4B59D",
    fontFamily: "'Playfair Display', serif",
    titleText: "Maria & Jose",
    subTitleText: "JULY 25, 2026",
    dateText: "MANILA",
    slotBorderRadius: "2px",
    slotBorderWidth: "1.5px",
    slotGap: "24px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Unbleached piña-fiber ground with a fine calado openwork divider drawn in champagne thread. Iron-bark serif set with quiet restraint."
  },
  {
    id: "katha-editorial-void",
    name: "Katha Signature — The Editorial Void",
    type: "strip",
    layoutId: "strip-3",
    backgroundColor: "#EAE2D5",
    textColor: "#111112",
    borderColor: "#111112",
    secondaryColor: "#1A1816",
    fontFamily: "'Playfair Display', serif",
    titleText: "A Study in Ma",
    subTitleText: "MMXXVI",
    dateText: "MANILA",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "24px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "An uncompromising execution of Ma. Severe, clean photo strip layout floating on a massive expanse of Piña Ecru. For clients who want pure text, negative space, and absolute minimal decoration."
  },
  {
    id: "katha-editorial-void-postcard",
    name: "Katha Signature — The Editorial Void Postcard",
    type: "postcard-vertical",
    layoutId: "pv-2",
    backgroundColor: "#EAE2D5",
    textColor: "#111112",
    borderColor: "#111112",
    secondaryColor: "#1A1816",
    fontFamily: "'Playfair Display', serif",
    titleText: "A Study in Ma",
    subTitleText: "MMXXVI",
    dateText: "MANILA",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "24px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "60px",
    decorativeSvg: "",
    designerExplanation: "An uncompromising execution of Ma. Severe, clean vertical postcard layout floating on a massive expanse of Piña Ecru."
  },
  {
    id: "katha-editorial-void-landscape",
    name: "Katha Signature — The Editorial Void Landscape",
    type: "postcard",
    layoutId: "pc-3-v",
    backgroundColor: "#EAE2D5",
    textColor: "#111112",
    borderColor: "#111112",
    secondaryColor: "#1A1816",
    fontFamily: "'Playfair Display', serif",
    titleText: "A Study in Ma",
    subTitleText: "MMXXVI",
    dateText: "MANILA",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "18px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "An uncompromising execution of Ma. Severe, clean landscape postcard layout floating on a massive expanse of Piña Ecru."
  },
  {
    id: "katha-heirloom-pina-landscape",
    name: "Katha Signature — Heirloom Piña Landscape",
    type: "postcard",
    layoutId: "pc-3-v",
    backgroundColor: "#EAE2D5",
    textColor: "#241E1A",
    borderColor: "#C4B59D",
    secondaryColor: "#C4B59D",
    fontFamily: "'Playfair Display', serif",
    titleText: "Maria & Jose",
    subTitleText: "JULY 25, 2026",
    dateText: "MANILA",
    slotBorderRadius: "2px",
    slotBorderWidth: "1.5px",
    slotGap: "18px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Unbleached piña-fiber ground with a fine calado openwork divider. Landscape postcard variant."
  },

  // ─── 2. LOOM FRAME (Katha Signature)
  {
    id: "katha-loom-frame",
    name: "Katha Signature — Loom Frame",
    type: "strip",
    backgroundColor: "#EAE2D5",
    textColor: "#241E1A",
    borderColor: "#241E1A",
    secondaryColor: "#241E1A",
    fontFamily: "'Playfair Display', serif",
    titleText: "Maria & Jose",
    subTitleText: "JULY 25, 2026",
    dateText: "ILOCOS NORTE",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "24px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "A loom-frame border of nested rules and corner cross-ties, echoing the hardwood frame that holds the warp threads taut."
  },
  {
    id: "katha-loom-frame-postcard",
    name: "Katha Signature — Loom Frame Postcard",
    type: "postcard-vertical",
    layoutId: "pv-2",
    backgroundColor: "#EAE2D5",
    textColor: "#241E1A",
    borderColor: "#241E1A",
    secondaryColor: "#241E1A",
    fontFamily: "'Playfair Display', serif",
    titleText: "Maria & Jose",
    subTitleText: "JULY 25, 2026",
    dateText: "ILOCOS NORTE",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "24px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "60px",
    decorativeSvg: "",
    designerExplanation: "Loom-frame border in iron-bark serif. Postcard variant of the Loom Frame strip."
  },
  {
    id: "katha-loom-frame-landscape",
    name: "Katha Signature — Loom Frame Landscape",
    type: "postcard",
    layoutId: "pc-3-v",
    backgroundColor: "#EAE2D5",
    textColor: "#241E1A",
    borderColor: "#241E1A",
    secondaryColor: "#241E1A",
    fontFamily: "'Playfair Display', serif",
    titleText: "Maria & Jose",
    subTitleText: "JULY 25, 2026",
    dateText: "ILOCOS NORTE",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "18px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Loom-frame border in iron-bark serif. Landscape postcard variant for three-photo Katha events."
  },

  // ─── 3. KNALUM NIGHT (Katha Signature)
  {
    id: "katha-knalum-night",
    name: "Katha Signature — Knalum Night",
    type: "strip",
    backgroundColor: "#1A1816",
    textColor: "#EAE2D5",
    borderColor: "#241E1A",
    secondaryColor: "#C4B59D",
    fontFamily: "'Playfair Display', serif",
    titleText: "Maria & Jose",
    subTitleText: "JULY 25, 2026",
    dateText: "LAKE SEBU",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "24px",
    slotBgColor: "#241E1A",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "T'nalak soil-black ground from the seven-day knalum boil. Raw-fiber ecru lettering with a single loko-root rust rule — the dreamweaver's tri-color."
  },
  {
    id: "katha-knalum-night-postcard",
    name: "Katha Signature — Knalum Night Postcard",
    type: "postcard-vertical",
    layoutId: "pv-2",
    backgroundColor: "#1A1816",
    textColor: "#EAE2D5",
    borderColor: "#241E1A",
    secondaryColor: "#C4B59D",
    fontFamily: "'Playfair Display', serif",
    titleText: "Maria & Jose",
    subTitleText: "JULY 25, 2026",
    dateText: "LAKE SEBU",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "24px",
    slotBgColor: "#241E1A",
    innerSpacing: "60px",
    decorativeSvg: "",
    designerExplanation: "T'nalak soil-black ground with raw-fiber ecru lettering and a single loko-root rust accent. 4×6 postcard variant."
  },
  {
    id: "katha-knalum-night-landscape",
    name: "Katha Signature — Knalum Night Landscape",
    type: "postcard",
    layoutId: "pc-3-v",
    backgroundColor: "#1A1816",
    textColor: "#EAE2D5",
    borderColor: "#241E1A",
    secondaryColor: "#C4B59D",
    fontFamily: "'Playfair Display', serif",
    titleText: "Maria & Jose",
    subTitleText: "JULY 25, 2026",
    dateText: "LAKE SEBU",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "18px",
    slotBgColor: "#241E1A",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "T'nalak soil-black ground with raw-fiber ecru lettering and a single loko-root rust accent. Landscape postcard variant."
  },

  // ─── 4. BRASS RING (Katha Signature)
  {
    id: "katha-brass-ring",
    name: "Katha Signature — Brass Ring",
    type: "strip",
    backgroundColor: "#EAE2D5",
    textColor: "#241E1A",
    borderColor: "#8C382A",
    secondaryColor: "#8C382A",
    fontFamily: "'Playfair Display', serif",
    titleText: "Maria & Jose",
    subTitleText: "JULY 25, 2026",
    dateText: "SOUTH COTABATO",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "24px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "The brass ring offered when a finished cloth leaves the loom, drawn as a single loko-rust circle beneath the names. Permission, and blessing."
  },
  {
    id: "katha-brass-ring-postcard",
    name: "Katha Signature — Brass Ring Postcard",
    type: "postcard-vertical",
    layoutId: "pv-2",
    backgroundColor: "#EAE2D5",
    textColor: "#241E1A",
    borderColor: "#8C382A",
    secondaryColor: "#8C382A",
    fontFamily: "'Playfair Display', serif",
    titleText: "Maria & Jose",
    subTitleText: "JULY 25, 2026",
    dateText: "SOUTH COTABATO",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "24px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "60px",
    decorativeSvg: "",
    designerExplanation: "The brass ring permission seal, postcard-format. A single loko-rust ring beneath the names."
  },
  {
    id: "katha-brass-ring-landscape",
    name: "Katha Signature — Brass Ring Landscape",
    type: "postcard",
    layoutId: "pc-3-v",
    backgroundColor: "#EAE2D5",
    textColor: "#241E1A",
    borderColor: "#8C382A",
    secondaryColor: "#8C382A",
    fontFamily: "'Playfair Display', serif",
    titleText: "Maria & Jose",
    subTitleText: "JULY 25, 2026",
    dateText: "SOUTH COTABATO",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "18px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "The brass ring permission seal, landscape postcard format. A single loko-rust ring beneath the names."
  },

  // ─── 5. BINAKUL WEAVE (Katha Signature)
  {
    id: "katha-binakul-weave",
    name: "Katha Signature — Binakul Weave",
    type: "strip",
    backgroundColor: "#EAE2D5",
    textColor: "#241E1A",
    borderColor: "#C4B59D",
    secondaryColor: "#5A5D5A",
    fontFamily: "'Playfair Display', serif",
    titleText: "Maria & Jose",
    subTitleText: "JULY 25, 2026",
    dateText: "ABRA",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "24px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Ilocos binakul optical weave at the corners — apotropaic geometry meant to confuse malevolent spirits, woven quietly at low contrast."
  },
  {
    id: "katha-binakul-weave-postcard",
    name: "Katha Signature — Binakul Weave Postcard",
    type: "postcard-vertical",
    layoutId: "pv-2",
    backgroundColor: "#EAE2D5",
    textColor: "#241E1A",
    borderColor: "#C4B59D",
    secondaryColor: "#5A5D5A",
    fontFamily: "'Playfair Display', serif",
    titleText: "Maria & Jose",
    subTitleText: "JULY 25, 2026",
    dateText: "ABRA",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "24px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "60px",
    decorativeSvg: "",
    designerExplanation: "Ilocos binakul optical weave at the corners. Apotropaic geometry for a 4x6 vertical postcard."
  },
  {
    id: "katha-binakul-weave-landscape",
    name: "Katha Signature — Binakul Weave Landscape",
    type: "postcard",
    layoutId: "pc-3-v",
    backgroundColor: "#EAE2D5",
    textColor: "#241E1A",
    borderColor: "#C4B59D",
    secondaryColor: "#5A5D5A",
    fontFamily: "'Playfair Display', serif",
    titleText: "Maria & Jose",
    subTitleText: "JULY 25, 2026",
    dateText: "ABRA",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "18px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Ilocos binakul optical weave at the corners. Landscape variant."
  },

  // ─── 6. CAPIZ SAGE (Katha Signature)
  {
    id: "katha-capiz-sage",
    name: "Katha Signature — Capiz Sage",
    type: "strip",
    backgroundColor: "#EAE2D5",
    textColor: "#241E1A",
    borderColor: "#9C958A",
    secondaryColor: "#6E6A62",
    fontFamily: "'Playfair Display', serif",
    titleText: "Maria & Jose",
    subTitleText: "JULY 25, 2026",
    dateText: "CAPIZ",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "24px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Capiz-shell windowpane lattice rendered in sage — the translucent pane that filters lowland light into a soft, even glow."
  },
  {
    id: "katha-capiz-sage-postcard",
    name: "Katha Signature — Capiz Sage Postcard",
    type: "postcard-vertical",
    layoutId: "pv-2",
    backgroundColor: "#EAE2D5",
    textColor: "#241E1A",
    borderColor: "#9C958A",
    secondaryColor: "#6E6A62",
    fontFamily: "'Playfair Display', serif",
    titleText: "Maria & Jose",
    subTitleText: "JULY 25, 2026",
    dateText: "CAPIZ",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "24px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "60px",
    decorativeSvg: "",
    designerExplanation: "Capiz windowpane in sage green. 4×6 vertical postcard variant."
  },
  {
    id: "katha-capiz-sage-landscape",
    name: "Katha Signature — Capiz Sage Landscape",
    type: "postcard",
    layoutId: "pc-3-v",
    backgroundColor: "#EAE2D5",
    textColor: "#241E1A",
    borderColor: "#9C958A",
    secondaryColor: "#6E6A62",
    fontFamily: "'Playfair Display', serif",
    titleText: "Maria & Jose",
    subTitleText: "JULY 25, 2026",
    dateText: "CAPIZ",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "18px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Capiz-shell windowpane in sage. Landscape postcard variant of the Capiz Sage signature."
  },

  // ─── 7. TRACY & PRINCE (Katha Signature) — palette + Playfair Display (Vince-Alignment 2.2)
  {
    id: "katha-tracy-prince",
    name: "Katha Signature — Tracy & Prince",
    type: "postcard-vertical",
    layoutId: "pv-2",
    backgroundColor: "#EAE2D5",
    textColor: "#241E1A",
    borderColor: "#C4B59D",
    secondaryColor: "#C4B59D",
    fontFamily: "'Playfair Display', serif",
    titleText: "Tracy & Prince",
    subTitleText: "",
    dateText: "",
    slotBorderRadius: "0px",
    slotBorderWidth: "0px",
    slotGap: "24px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "60px",
    decorativeSvg: "",
    designerExplanation: "Double fine-lined frame in Champagne Heirloom with Playfair Display set on a Piña Ecru ground. The Signature tier's quiet restraint for Tracy & Prince."
  },

  // ─── 8. TRADITION GOLD LUXE (Classic Tier)
  {
    id: "wedding-luxe-gold",
    name: "Style 1 — Tradition Gold Luxe",
    type: "strip",
    layoutId: "strip-3",
    backgroundColor: "#FAF6F0",
    textColor: "#544634",
    borderColor: "#766023",
    secondaryColor: "#766023",
    fontFamily: "'Cinzel', serif",
    titleText: "Steven & Cristalyn",
    subTitleText: "JULY 25, 2026",
    dateText: "",
    slotBorderRadius: "0px",
    slotBorderWidth: "0px",
    slotGap: "22px",
    slotBgColor: "#F4EDE3",
    innerSpacing: "26px",
    decorativeSvg: "",
    designerExplanation: "Double gold foil fine outline detailing around each slot. Clean Roman serif display, providing timeless heirloom appeal."
  },
  {
    id: "wedding-luxe-gold-postcard",
    name: "Style 1 — Tradition Gold Postcard",
    type: "postcard-vertical",
    layoutId: "pv-2",
    backgroundColor: "#FAF6F0",
    textColor: "#1C1917",
    borderColor: "#766023",
    secondaryColor: "#766023",
    fontFamily: "'Cinzel', serif",
    titleText: "STEVEN & CRISTALYN",
    subTitleText: "JULY 25, 2026",
    dateText: "NAPA VALLEY, CALIFORNIA",
    slotBorderRadius: "4px",
    slotBorderWidth: "3px",
    slotGap: "24px",
    slotBgColor: "#F4EDE3",
    innerSpacing: "60px",
    decorativeSvg: "",
    designerExplanation: "Double gold-foil hairline frame with crisp corner accents. A 4×6 postcard distillation of the Tradition Gold strip."
  },
  {
    id: "wedding-luxe-gold-landscape",
    name: "Style 1 — Tradition Gold Landscape",
    type: "postcard",
    layoutId: "pc-3-v",
    backgroundColor: "#FAF6F0",
    textColor: "#1C1917",
    borderColor: "#766023",
    secondaryColor: "#766023",
    fontFamily: "'Cinzel', serif",
    titleText: "STEVEN & CRISTALYN",
    subTitleText: "JULY 25, 2026",
    dateText: "NAPA VALLEY, CALIFORNIA",
    slotBorderRadius: "4px",
    slotBorderWidth: "3px",
    slotGap: "18px",
    slotBgColor: "#F4EDE3",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Tradition Gold rendered horizontal: gold-foil hairline frame, three photos in a row, formal Cinzel display."
  },

  // ─── 8. MINIMAL LINEN ROSE (Classic Tier)
  {
    id: "rose-whisper",
    name: "Style 2 — Minimal Linen Rose",
    type: "strip",
    backgroundColor: "#FAF9F6",
    textColor: "#292524",
    borderColor: "#EBE9E4",
    secondaryColor: "#A59E92",
    fontFamily: "'Playfair Display', serif",
    titleText: "Steven & Cristalyn",
    subTitleText: "JULY 25, 2026",
    dateText: "ESTABLISHED IN NAPA VALLEY",
    slotBorderRadius: "0px",
    slotBorderWidth: "1px",
    slotGap: "24px",
    slotBgColor: "#EDEDE9",
    innerSpacing: "24px",
    decorativeSvg: "",
    designerExplanation: "Deckled ivory paper backdrop adorned with a hand-sketched classic cream and white rose nested gracefully above the text."
  },
  {
    id: "rose-whisper-postcard",
    name: "Style 2 — Minimal Linen Rose Postcard",
    type: "postcard-vertical",
    layoutId: "pv-2",
    backgroundColor: "#FAF9F6",
    textColor: "#292524",
    borderColor: "#EBE9E4",
    secondaryColor: "#A59E92",
    fontFamily: "'Playfair Display', serif",
    titleText: "Steven & Cristalyn",
    subTitleText: "JULY 25, 2026",
    dateText: "ESTABLISHED IN NAPA VALLEY",
    slotBorderRadius: "0px",
    slotBorderWidth: "1px",
    slotGap: "24px",
    slotBgColor: "#EDEDE9",
    innerSpacing: "60px",
    decorativeSvg: "",
    designerExplanation: "Deckled ivory paper backdrop adorned with a hand-sketched classic rose nested gracefully above the text. Postcard vertical format."
  },
  {
    id: "rose-whisper-landscape",
    name: "Style 2 — Linen Rose Landscape",
    type: "postcard",
    layoutId: "pc-3-v",
    backgroundColor: "#FAF9F6",
    textColor: "#292524",
    borderColor: "#EBE9E4",
    secondaryColor: "#A59E92",
    fontFamily: "'Playfair Display', serif",
    titleText: "Steven & Cristalyn",
    subTitleText: "JULY 25, 2026",
    dateText: "ESTABLISHED IN NAPA VALLEY",
    slotBorderRadius: "0px",
    slotBorderWidth: "1px",
    slotGap: "18px",
    slotBgColor: "#EDEDE9",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Linen-paper ground with a hand-sketched English rose. Landscape postcard variant — three stacked moments side by side."
  },

  // ─── 9. EARTHEN CLAY SUNSET (Classic Tier)
  {
    id: "wedding-warm-terracotta",
    name: "Style 4 — Earthen Clay Sunset",
    type: "strip",
    backgroundColor: "#8F4D39",
    textColor: "#FCFAF7",
    borderColor: "#DEC190",
    secondaryColor: "#E3CE9F",
    fontFamily: "'Hanken Grotesk', sans-serif",
    titleText: "Steven & Cristalyn",
    subTitleText: "JULY 25, 2026",
    dateText: "NAPA VALLEY ● CALIFORNIA",
    slotBorderRadius: "2px",
    slotBorderWidth: "4px",
    slotGap: "24px",
    slotBgColor: "#9A543E",
    innerSpacing: "26px",
    decorativeSvg: "",
    designerExplanation: "Bohemian dry terracotta sunset clay color. Accentuated by fine hairline gold rules and micro leafy contours."
  },
  {
    id: "wedding-warm-terracotta-postcard",
    name: "Style 4 — Earthen Clay Sunset Postcard",
    type: "postcard-vertical",
    layoutId: "pv-2",
    backgroundColor: "#8F4D39",
    textColor: "#FCFAF7",
    borderColor: "#DEC190",
    secondaryColor: "#E3CE9F",
    fontFamily: "'Hanken Grotesk', sans-serif",
    titleText: "Steven & Cristalyn",
    subTitleText: "JULY 25, 2026",
    dateText: "NAPA VALLEY ● CALIFORNIA",
    slotBorderRadius: "2px",
    slotBorderWidth: "4px",
    slotGap: "24px",
    slotBgColor: "#9A543E",
    innerSpacing: "60px",
    decorativeSvg: "",
    designerExplanation: "Bohemian dry terracotta sunset clay color. Accentuated by fine hairline gold rules and micro leafy contours. Postcard format."
  },
  {
    id: "wedding-warm-terracotta-landscape",
    name: "Style 4 — Earthen Clay Sunset Landscape",
    type: "postcard",
    layoutId: "pc-3-v",
    backgroundColor: "#8F4D39",
    textColor: "#FCFAF7",
    borderColor: "#DEC190",
    secondaryColor: "#E3CE9F",
    fontFamily: "'Hanken Grotesk', sans-serif",
    titleText: "Steven & Cristalyn",
    subTitleText: "JULY 25, 2026",
    dateText: "NAPA VALLEY ● CALIFORNIA",
    slotBorderRadius: "2px",
    slotBorderWidth: "4px",
    slotGap: "18px",
    slotBgColor: "#9A543E",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Bohemian dry terracotta sunset clay color. Accentuated by fine hairline gold rules and micro leafy contours. Landscape format."
  },

  // ─── 10. GATSBY MIDNIGHT GOLD (Classic Tier)
  {
    id: "wedding-art-deco",
    name: "Style 5 — Gatsby Midnight Gold",
    type: "strip",
    backgroundColor: "#161616",
    textColor: "#DEC190",
    borderColor: "#90774D",
    secondaryColor: "#DEC190",
    fontFamily: "'Cinzel', serif",
    titleText: "STEVEN & CRISTALYN",
    subTitleText: "JULY 25, 2026",
    dateText: "THE GRAND PLAZA SUITE",
    slotBorderRadius: "0px",
    slotBorderWidth: "3px",
    slotGap: "20px",
    slotBgColor: "#222222",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Gatsby-era black velvet base framing interlocking linear art-deco brass-yellow chevrons and tall typography."
  },
  {
    id: "wedding-art-deco-postcard",
    name: "Style 5 — Gatsby Midnight Gold Postcard",
    type: "postcard-vertical",
    layoutId: "pv-2",
    backgroundColor: "#161616",
    textColor: "#DEC190",
    borderColor: "#90774D",
    secondaryColor: "#DEC190",
    fontFamily: "'Cinzel', serif",
    titleText: "STEVEN & CRISTALYN",
    subTitleText: "JULY 25, 2026",
    dateText: "THE GRAND PLAZA SUITE",
    slotBorderRadius: "0px",
    slotBorderWidth: "3px",
    slotGap: "24px",
    slotBgColor: "#222222",
    innerSpacing: "60px",
    decorativeSvg: "",
    designerExplanation: "Gatsby-era black velvet base framing interlocking linear art-deco brass-yellow chevrons. Postcard vertical format."
  },
  {
    id: "wedding-art-deco-landscape",
    name: "Style 5 — Gatsby Midnight Gold Landscape",
    type: "postcard",
    layoutId: "pc-3-v",
    backgroundColor: "#161616",
    textColor: "#DEC190",
    borderColor: "#90774D",
    secondaryColor: "#DEC190",
    fontFamily: "'Cinzel', serif",
    titleText: "STEVEN & CRISTALYN",
    subTitleText: "JULY 25, 2026",
    dateText: "THE GRAND PLAZA SUITE",
    slotBorderRadius: "0px",
    slotBorderWidth: "3px",
    slotGap: "18px",
    slotBgColor: "#222222",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Gatsby-era black velvet base framing interlocking linear art-deco brass-yellow chevrons. Landscape postcard format."
  },

  // ─── 11. HAUTE GALLERY EDITORIAL (Classic Tier)
  {
    id: "wedding-editorial",
    name: "Style 8 — Haute Gallery Editorial",
    type: "strip",
    backgroundColor: "#FCFCFC",
    textColor: "#121212",
    borderColor: "#E5E5E5",
    secondaryColor: "#737373",
    fontFamily: "'Italiana', serif",
    titleText: "STEVEN & CRISTALYN",
    subTitleText: "JULY 25, 2026",
    dateText: "MUSEUM OF BRIDAL ARTS",
    slotBorderRadius: "0px",
    slotBorderWidth: "1px",
    slotGap: "30px",
    slotBgColor: "#F5F5F5",
    innerSpacing: "36px",
    decorativeSvg: "",
    designerExplanation: "Extremely spacious high-fashion gallery margins and thin borders paired with tracked wide, clean-lined display fonts."
  },
  {
    id: "wedding-editorial-postcard",
    name: "Style 8 — Editorial Postcard",
    type: "postcard-vertical",
    layoutId: "pv-2",
    backgroundColor: "#FCFCFC",
    textColor: "#121212",
    borderColor: "#E5E5E5",
    secondaryColor: "#737373",
    fontFamily: "'Italiana', serif",
    titleText: "STEVEN & CRISTALYN",
    subTitleText: "JULY 25, 2026",
    dateText: "MUSEUM OF BRIDAL ARTS",
    slotBorderRadius: "0px",
    slotBorderWidth: "1px",
    slotGap: "30px",
    slotBgColor: "#F5F5F5",
    innerSpacing: "60px",
    decorativeSvg: "",
    designerExplanation: "Generous gallery margins with a single hairline rule and wide-tracked Italiana display. Quiet, modernist."
  },
  {
    id: "wedding-editorial-landscape",
    name: "Style 8 — Editorial Landscape",
    type: "postcard",
    layoutId: "pc-3-v",
    backgroundColor: "#FCFCFC",
    textColor: "#121212",
    borderColor: "#E5E5E5",
    secondaryColor: "#737373",
    fontFamily: "'Italiana', serif",
    titleText: "STEVEN & CRISTALYN",
    subTitleText: "JULY 25, 2026",
    dateText: "MUSEUM OF BRIDAL ARTS",
    slotBorderRadius: "0px",
    slotBorderWidth: "1px",
    slotGap: "18px",
    slotBgColor: "#F5F5F5",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Editorial gallery margins, hairline rule, wide-tracked display. Landscape postcard for cinematic three-photo storytelling."
  },

  // ─── 12. VICTORIAN CREAM LACE (Classic Tier)
  {
    id: "wedding-vintage-lace",
    name: "Style 10 — Victorian Cream Lace",
    type: "strip",
    backgroundColor: "#F2EFE7",
    textColor: "#4E4138",
    borderColor: "#D9D1C5",
    secondaryColor: "#A39382",
    fontFamily: "'Rochester', cursive",
    titleText: "Steven & Cristalyn",
    subTitleText: "JULY 25, 2026",
    dateText: "HERITAGE MANOR GARDENS",
    slotBorderRadius: "4px",
    slotBorderWidth: "2px",
    slotGap: "24px",
    slotBgColor: "#EFECE3",
    innerSpacing: "26px",
    decorativeSvg: "",
    designerExplanation: "Fine Victorian scalloped curves and lace-like dotted alignments evoking elegant hand-crocheted silk ribbons."
  },
  {
    id: "wedding-vintage-lace-postcard",
    name: "Style 10 — Victorian Cream Lace Postcard",
    type: "postcard-vertical",
    layoutId: "pv-2",
    backgroundColor: "#F2EFE7",
    textColor: "#4E4138",
    borderColor: "#D9D1C5",
    secondaryColor: "#A39382",
    fontFamily: "'Rochester', cursive",
    titleText: "Steven & Cristalyn",
    subTitleText: "JULY 25, 2026",
    dateText: "HERITAGE MANOR GARDENS",
    slotBorderRadius: "4px",
    slotBorderWidth: "2px",
    slotGap: "24px",
    slotBgColor: "#EFECE3",
    innerSpacing: "60px",
    decorativeSvg: "",
    designerExplanation: "Fine Victorian scalloped curves and lace-like dotted alignments. Postcard vertical format."
  },
  {
    id: "wedding-vintage-lace-landscape",
    name: "Style 10 — Victorian Cream Lace Landscape",
    type: "postcard",
    layoutId: "pc-3-v",
    backgroundColor: "#F2EFE7",
    textColor: "#4E4138",
    borderColor: "#D9D1C5",
    secondaryColor: "#A39382",
    fontFamily: "'Rochester', cursive",
    titleText: "Steven & Cristalyn",
    subTitleText: "JULY 25, 2026",
    dateText: "HERITAGE MANOR GARDENS",
    slotBorderRadius: "4px",
    slotBorderWidth: "2px",
    slotGap: "18px",
    slotBgColor: "#EFECE3",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Fine Victorian scalloped curves and lace-like dotted alignments. Landscape format."
  },

  // ─── 13. IMPERIAL CREST SEAL (Classic Tier)
  {
    id: "wedding-royal-crest",
    name: "Style 12 — Imperial Crest Seal",
    type: "strip",
    backgroundColor: "#FCFBF8",
    textColor: "#6B5526",
    borderColor: "#D4C59B",
    secondaryColor: "#8A7342",
    fontFamily: "'Cinzel', serif",
    titleText: "S & C",
    subTitleText: "2026.07.25",
    dateText: "CASTLE HALL ESTATE",
    slotBorderRadius: "0px",
    slotBorderWidth: "2px",
    slotGap: "24px",
    slotBgColor: "#FAFAF8",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Nobility Stationery theme featuring royal gold borders and a stately circular dynamic seal design under the photo slots."
  },
  {
    id: "wedding-royal-crest-postcard",
    name: "Style 12 — Imperial Crest Postcard",
    type: "postcard-vertical",
    layoutId: "pv-2",
    backgroundColor: "#FCFBF8",
    textColor: "#6B5526",
    borderColor: "#D4C59B",
    secondaryColor: "#8A7342",
    fontFamily: "'Cinzel', serif",
    titleText: "S & C",
    subTitleText: "2026.07.25",
    dateText: "CASTLE HALL ESTATE",
    slotBorderRadius: "0px",
    slotBorderWidth: "2px",
    slotGap: "24px",
    slotBgColor: "#FAFAF8",
    innerSpacing: "60px",
    decorativeSvg: "",
    designerExplanation: "Nobility Stationery theme featuring royal gold borders and a stately circular dynamic seal. Postcard vertical format."
  },
  {
    id: "wedding-royal-crest-landscape",
    name: "Style 12 — Imperial Crest Landscape",
    type: "postcard",
    layoutId: "pc-3-v",
    backgroundColor: "#FCFBF8",
    textColor: "#6B5526",
    borderColor: "#D4C59B",
    secondaryColor: "#8A7342",
    fontFamily: "'Cinzel', serif",
    titleText: "S & C",
    subTitleText: "2026.07.25",
    dateText: "CASTLE HALL ESTATE",
    slotBorderRadius: "0px",
    slotBorderWidth: "2px",
    slotGap: "18px",
    slotBgColor: "#FAFAF8",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Nobility Stationery theme featuring royal gold borders and a stately circular dynamic seal. Landscape format."
  },

  // ─── 14. DELICATE FINE-LINE ARCH (Classic Tier)
  {
    id: "wedding-botanical-arch",
    name: "Style 14 — Delicate Fine-Line Arch",
    type: "strip",
    backgroundColor: "#FCFAF6",
    textColor: "#2B2D2B",
    borderColor: "#E3DFD5",
    secondaryColor: "#707A65",
    fontFamily: "'Hanken Grotesk', sans-serif",
    titleText: "Steven & Cristalyn",
    subTitleText: "JULY 25, 2026",
    dateText: "THE BOTANICAL SANCTUARY",
    slotBorderRadius: "25px 25px 0px 0px",
    slotBorderWidth: "2px",
    slotGap: "20px",
    slotBgColor: "#F5F3ED",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Canva style double fine-lined cathedral arch framing. Features high-curved slots and minimalist organic grass sprigs."
  },
  {
    id: "wedding-botanical-arch-postcard",
    name: "Style 14 — Delicate Fine-Line Arch Postcard",
    type: "postcard-vertical",
    layoutId: "pv-2",
    backgroundColor: "#FCFAF6",
    textColor: "#2B2D2B",
    borderColor: "#E3DFD5",
    secondaryColor: "#707A65",
    fontFamily: "'Hanken Grotesk', sans-serif",
    titleText: "Steven & Cristalyn",
    subTitleText: "JULY 25, 2026",
    dateText: "THE BOTANICAL SANCTUARY",
    slotBorderRadius: "25px 25px 0px 0px",
    slotBorderWidth: "2px",
    slotGap: "24px",
    slotBgColor: "#F5F3ED",
    innerSpacing: "60px",
    decorativeSvg: "",
    designerExplanation: "Double fine-lined cathedral arch framing wrapping vertical slots. Postcard vertical format."
  },
  {
    id: "wedding-botanical-arch-landscape",
    name: "Style 14 — Botanical Arch Landscape",
    type: "postcard",
    layoutId: "pc-3-v",
    backgroundColor: "#FCFAF6",
    textColor: "#2B2D2B",
    borderColor: "#E3DFD5",
    secondaryColor: "#707A65",
    fontFamily: "'Hanken Grotesk', sans-serif",
    titleText: "Steven & Cristalyn",
    subTitleText: "JULY 25, 2026",
    dateText: "THE BOTANICAL SANCTUARY",
    slotBorderRadius: "25px 25px 0px 0px",
    slotBorderWidth: "2px",
    slotGap: "18px",
    slotBgColor: "#F5F3ED",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Double fine-lined cathedral arch crowning three photo slots. Landscape variant of the Delicate Fine-Line Arch."
  },

  // ─── 15. DECKLED WAX SEAL (Classic Tier)
  {
    id: "wedding-decked-monogram",
    name: "Style 19 — Deckled Wax Seal",
    type: "strip",
    backgroundColor: "#FAF7F0",
    textColor: "#3D3A35",
    borderColor: "#DDD7CD",
    secondaryColor: "#A68D6A",
    fontFamily: "'Rochester', cursive",
    titleText: "Steven & Cristalyn",
    subTitleText: "JULY 25, 2026",
    dateText: "STONEWOOD CASTLE HEIRLOOM",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "24px",
    slotBgColor: "#F2ECE0",
    innerSpacing: "24px",
    decorativeSvg: "",
    designerExplanation: "Etsy bestseller deckled-edge paper base carrying an intimate calligraphic handwriting signature and simulated copper wax-seal monogram."
  },
  {
    id: "wedding-decked-monogram-postcard",
    name: "Style 19 — Deckled Wax Seal Postcard",
    type: "postcard-vertical",
    layoutId: "pv-2",
    backgroundColor: "#FAF7F0",
    textColor: "#3D3A35",
    borderColor: "#DDD7CD",
    secondaryColor: "#A68D6A",
    fontFamily: "'Rochester', cursive",
    titleText: "Steven & Cristalyn",
    subTitleText: "JULY 25, 2026",
    dateText: "STONEWOOD CASTLE HEIRLOOM",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "24px",
    slotBgColor: "#F2ECE0",
    innerSpacing: "60px",
    decorativeSvg: "",
    designerExplanation: "Etsy bestseller deckled-edge paper carrying calligraphic handwriting and simulated copper wax-seal. Postcard format."
  },
  {
    id: "wedding-decked-monogram-landscape",
    name: "Style 19 — Deckled Wax Seal Landscape",
    type: "postcard",
    layoutId: "pc-3-v",
    backgroundColor: "#FAF7F0",
    textColor: "#3D3A35",
    borderColor: "#DDD7CD",
    secondaryColor: "#A68D6A",
    fontFamily: "'Rochester', cursive",
    titleText: "Steven & Cristalyn",
    subTitleText: "JULY 25, 2026",
    dateText: "STONEWOOD CASTLE HEIRLOOM",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "18px",
    slotBgColor: "#F2ECE0",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Etsy bestseller deckled-edge paper carrying calligraphic handwriting and simulated copper wax-seal. Landscape postcard format."
  },

  // ─── ASYMMETRICAL EDITORIAL SPECIFIC DESIGNS (LEGACY ALIGNMENTS) ──────────
  {
    id: "heirloom-pina-L",
    name: "Katha Signature — Heirloom Piña L-Shape",
    type: "postcard",
    layoutId: "pc-L",
    backgroundColor: "#EAE2D5",
    textColor: "#241E1A",
    borderColor: "#C4B59D",
    secondaryColor: "#C4B59D",
    fontFamily: "'Playfair Display', serif",
    titleText: "Maria & Jose",
    subTitleText: "JULY 25, 2026",
    dateText: "MANILA",
    slotBorderRadius: "2px",
    slotBorderWidth: "1.5px",
    slotGap: "20px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Three photos trace an L on a piña-fiber ground, with the open corner cradling a champagne calado divider."
  },
  {
    id: "loom-frame-invL",
    name: "Katha Signature — Loom Frame Γ-Shape",
    type: "postcard",
    layoutId: "pc-invL",
    backgroundColor: "#EAE2D5",
    textColor: "#241E1A",
    borderColor: "#241E1A",
    secondaryColor: "#241E1A",
    fontFamily: "'Playfair Display', serif",
    titleText: "Maria & Jose",
    subTitleText: "JULY 25, 2026",
    dateText: "ILOCOS NORTE",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "20px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Inverted-L arrangement framed by the loom-bark border. The open bottom-left becomes a quiet whitespace for the names."
  },
  {
    id: "editorial-landscape-L",
    name: "Style 8 — Editorial L-Shape Landscape",
    type: "postcard",
    layoutId: "pc-L",
    backgroundColor: "#FCFCFC",
    textColor: "#121212",
    borderColor: "#E5E5E5",
    secondaryColor: "#737373",
    fontFamily: "'Italiana', serif",
    titleText: "Maria & Jose",
    subTitleText: "JULY 25, 2026",
    dateText: "GALLERY",
    slotBorderRadius: "0px",
    slotBorderWidth: "1px",
    slotGap: "20px",
    slotBgColor: "#F5F5F5",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Three photos trace an L on a gallery-clean ground. Hairline rule, wide-tracked Italiana display."
  },
  {
    id: "capiz-sage-invL",
    name: "Katha Signature — Capiz Sage Γ-Shape Landscape",
    type: "postcard",
    layoutId: "pc-invL",
    backgroundColor: "#EAE2D5",
    textColor: "#241E1A",
    borderColor: "#9FA38F",
    secondaryColor: "#6E7268",
    fontFamily: "'Playfair Display', serif",
    titleText: "Maria & Jose",
    subTitleText: "JULY 25, 2026",
    dateText: "CAPIZ",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "20px",
    slotBgColor: "#E4DCCE",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Capiz windowpane in sage. Inverted-L photo arrangement with the open corner reserved for the names."
  },

  // ─── SQUARE LANDSCAPE VARIANTS (2×, 3× — 550×550 slots) ─────────────────────────
  // — Katha Signature families first —
  {
    id: "katha-heirloom-pina-landscape-2sq",
    name: "Katha Signature — Heirloom Piña Landscape 2 Squares",
    type: "postcard",
    layoutId: "pc-2-sq",
    backgroundColor: "#EAE2D5",
    textColor: "#241E1A",
    borderColor: "#C4B59D",
    secondaryColor: "#C4B59D",
    fontFamily: "'Playfair Display', serif",
    titleText: "Maria & Jose",
    subTitleText: "JULY 25, 2026",
    dateText: "MANILA",
    slotBorderRadius: "2px",
    slotBorderWidth: "1.5px",
    slotGap: "18px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Piña-fiber ecru ground — two square photos balanced across the canvas."
  },
  {
    id: "katha-heirloom-pina-landscape-3sq",
    name: "Katha Signature — Heirloom Piña Landscape 3 Squares",
    type: "postcard",
    layoutId: "pc-3-sq",
    backgroundColor: "#EAE2D5",
    textColor: "#241E1A",
    borderColor: "#C4B59D",
    secondaryColor: "#C4B59D",
    fontFamily: "'Playfair Display', serif",
    titleText: "Maria & Jose",
    subTitleText: "JULY 25, 2026",
    dateText: "MANILA",
    slotBorderRadius: "2px",
    slotBorderWidth: "1.5px",
    slotGap: "18px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Piña-fiber ecru ground — three square photos in a row with champagne thread accents."
  },
  {
    id: "katha-knalum-night-landscape-2sq",
    name: "Katha Signature — Knalum Night Landscape 2 Squares",
    type: "postcard",
    layoutId: "pc-2-sq",
    backgroundColor: "#1A1816",
    textColor: "#EAE2D5",
    borderColor: "#241E1A",
    secondaryColor: "#C4B59D",
    fontFamily: "'Playfair Display', serif",
    titleText: "Maria & Jose",
    subTitleText: "JULY 25, 2026",
    dateText: "LAKE SEBU",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "18px",
    slotBgColor: "#241E1A",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "T’nalak soil-black — two square photos, ecru lettering with loko-root rust accent."
  },
  {
    id: "katha-knalum-night-landscape-3sq",
    name: "Katha Signature — Knalum Night Landscape 3 Squares",
    type: "postcard",
    layoutId: "pc-3-sq",
    backgroundColor: "#1A1816",
    textColor: "#EAE2D5",
    borderColor: "#241E1A",
    secondaryColor: "#C4B59D",
    fontFamily: "'Playfair Display', serif",
    titleText: "Maria & Jose",
    subTitleText: "JULY 25, 2026",
    dateText: "LAKE SEBU",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "18px",
    slotBgColor: "#241E1A",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "T’nalak soil-black — three square photos in a row, raw-fiber ecru lettering."
  },
  {
    id: "katha-editorial-void-landscape-2sq",
    name: "Katha Signature — The Editorial Void Landscape 2 Squares",
    type: "postcard",
    layoutId: "pc-2-sq",
    backgroundColor: "#EAE2D5",
    textColor: "#111112",
    borderColor: "#111112",
    secondaryColor: "#1A1816",
    fontFamily: "'Playfair Display', serif",
    titleText: "A Study in Ma",
    subTitleText: "MMXXVI",
    dateText: "MANILA",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "18px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "An uncompromising execution of Ma. Severe, clean side-by-side square photos layout floating on a massive expanse of Piña Ecru."
  },
  {
    id: "katha-editorial-void-landscape-3sq",
    name: "Katha Signature — The Editorial Void Landscape 3 Squares",
    type: "postcard",
    layoutId: "pc-3-sq",
    backgroundColor: "#EAE2D5",
    textColor: "#111112",
    borderColor: "#111112",
    secondaryColor: "#1A1816",
    fontFamily: "'Playfair Display', serif",
    titleText: "A Study in Ma",
    subTitleText: "MMXXVI",
    dateText: "MANILA",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "18px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "An uncompromising execution of Ma. Severe, clean three square photos layout floating on a massive expanse of Piña Ecru."
  },
  {
    id: "wedding-luxe-gold-landscape-2sq",
    name: "Style 1 — Tradition Gold Landscape 2 Squares",
    type: "postcard",
    layoutId: "pc-2-sq",
    backgroundColor: "#FAF6F0",
    textColor: "#1C1917",
    borderColor: "#766023",
    secondaryColor: "#766023",
    fontFamily: "'Cinzel', serif",
    titleText: "STEVEN & CRISTALYN",
    subTitleText: "JULY 25, 2026",
    dateText: "NAPA VALLEY, CALIFORNIA",
    slotBorderRadius: "4px",
    slotBorderWidth: "3px",
    slotGap: "18px",
    slotBgColor: "#F4EDE3",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Tradition Gold — two square photos, gold-foil detail, formal Cinzel display."
  },
  {
    id: "wedding-luxe-gold-landscape-3sq",
    name: "Style 1 — Tradition Gold Landscape 3 Squares",
    type: "postcard",
    layoutId: "pc-3-sq",
    backgroundColor: "#FAF6F0",
    textColor: "#1C1917",
    borderColor: "#766023",
    secondaryColor: "#766023",
    fontFamily: "'Cinzel', serif",
    titleText: "STEVEN & CRISTALYN",
    subTitleText: "JULY 25, 2026",
    dateText: "NAPA VALLEY, CALIFORNIA",
    slotBorderRadius: "4px",
    slotBorderWidth: "3px",
    slotGap: "18px",
    slotBgColor: "#F4EDE3",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Tradition Gold — three square photos in a row, gold-foil hairline, formal Roman display."
  },
  // ─── 16. WOVEN SILK (Katha Signature — generative agent concept)
  {
    id: "katha-woven-silk",
    name: "Katha Signature — Woven Silk",
    type: "strip",
    backgroundColor: "#EAE2D5",
    textColor: "#241E1A",
    borderColor: "#EAE2D5",
    secondaryColor: "#C4B59D",
    fontFamily: "'Playfair Display', serif",
    titleText: "Bespoke Silk",
    subTitleText: "HANDCRAFTED",
    dateText: "KATHA",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "24px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Generative signature theme representing pure unrefined structural thread paths running continuously. Features delicate threadlines that subtly overlay slots."
  },
  {
    id: "katha-woven-silk-postcard",
    name: "Katha Signature — Woven Silk Postcard",
    type: "postcard-vertical",
    layoutId: "pv-2",
    backgroundColor: "#EAE2D5",
    textColor: "#241E1A",
    borderColor: "#EAE2D5",
    secondaryColor: "#C4B59D",
    fontFamily: "'Playfair Display', serif",
    titleText: "Bespoke Silk",
    subTitleText: "HANDCRAFTED",
    dateText: "KATHA",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "24px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "60px",
    decorativeSvg: "",
    designerExplanation: "Generative signature theme representing structural thread paths in a 4x6 vertical postcard format."
  },
  {
    id: "katha-woven-silk-landscape",
    name: "Katha Signature — Woven Silk Landscape",
    type: "postcard",
    layoutId: "pc-3-v",
    backgroundColor: "#EAE2D5",
    textColor: "#241E1A",
    borderColor: "#EAE2D5",
    secondaryColor: "#C4B59D",
    fontFamily: "'Playfair Display', serif",
    titleText: "Bespoke Silk",
    subTitleText: "HANDCRAFTED",
    dateText: "KATHA",
    slotBorderRadius: "0px",
    slotBorderWidth: "1.5px",
    slotGap: "18px",
    slotBgColor: "#EAE2D5",
    innerSpacing: "28px",
    decorativeSvg: "",
    designerExplanation: "Generative signature theme representing structural thread paths in a 6x4 landscape postcard format."
  },
];


// ─── DECORATION ALIASES ───────────────────────────────────────────────
// Maps format variants back to the root family ID so we only write the drawing rules ONCE.
const DECORATION_ALIASES: Record<string, string> = {
  "katha-woven-silk-postcard":      "katha-woven-silk",
  "katha-woven-silk-landscape":     "katha-woven-silk",
  "katha-heirloom-pina-postcard":   "katha-heirloom-pina",
  "katha-heirloom-pina-landscape":  "katha-heirloom-pina",
  "katha-heirloom-pina-L":          "katha-heirloom-pina",
  "heirloom-pina-L":                "katha-heirloom-pina",

  "katha-loom-frame-postcard":      "katha-loom-frame",
  "katha-loom-frame-landscape":     "katha-loom-frame",
  "katha-loom-frame-invL":          "katha-loom-frame",
  "loom-frame-invL":                "katha-loom-frame",

  "katha-knalum-night-postcard":    "katha-knalum-night",
  "katha-knalum-night-landscape":   "katha-knalum-night",

  "katha-brass-ring-postcard":      "katha-brass-ring",
  "katha-brass-ring-landscape":     "katha-brass-ring",

  "katha-binakul-weave-postcard":   "katha-binakul-weave",
  "katha-binakul-weave-landscape":  "katha-binakul-weave",

  "katha-capiz-sage-postcard":      "katha-capiz-sage",
  "katha-capiz-sage-landscape":     "katha-capiz-sage",
  "katha-capiz-sage-invL":          "katha-capiz-sage",

  "wedding-luxe-gold-postcard":     "wedding-luxe-gold",
  "wedding-luxe-gold-landscape":    "wedding-luxe-gold",

  "rose-whisper-postcard":    "rose-whisper",
  "rose-whisper-landscape":   "rose-whisper",

  "wedding-warm-terracotta-postcard": "wedding-warm-terracotta",
  "wedding-warm-terracotta-landscape": "wedding-warm-terracotta",

  "wedding-art-deco-postcard":      "wedding-art-deco",
  "wedding-art-deco-landscape":     "wedding-art-deco",

  "wedding-editorial-postcard":     "wedding-editorial",
  "wedding-editorial-landscape":    "wedding-editorial",
  "editorial-landscape-L":          "wedding-editorial",

  "wedding-vintage-lace-postcard":  "wedding-vintage-lace",
  "wedding-vintage-lace-landscape": "wedding-vintage-lace",

  "wedding-royal-crest-postcard":   "wedding-royal-crest",
  "wedding-royal-crest-landscape":  "wedding-royal-crest",

  "wedding-botanical-arch-postcard": "wedding-botanical-arch",
  "wedding-botanical-arch-landscape": "wedding-botanical-arch",

  "wedding-decked-monogram-postcard": "wedding-decked-monogram",
  "wedding-decked-monogram-landscape": "wedding-decked-monogram",

  // Square-slot landscape aliases
  "katha-heirloom-pina-landscape-1sq":  "katha-heirloom-pina",
  "katha-heirloom-pina-landscape-2sq":  "katha-heirloom-pina",
  "katha-heirloom-pina-landscape-3sq":  "katha-heirloom-pina",
  "katha-knalum-night-landscape-1sq":   "katha-knalum-night",
  "katha-knalum-night-landscape-2sq":   "katha-knalum-night",
  "katha-knalum-night-landscape-3sq":   "katha-knalum-night",
  "katha-editorial-void-postcard":      "katha-editorial-void",
  "katha-editorial-void-landscape":     "katha-editorial-void",
  "katha-editorial-void-landscape-1sq": "katha-editorial-void",
  "katha-editorial-void-landscape-2sq": "katha-editorial-void",
  "katha-editorial-void-landscape-3sq": "katha-editorial-void",
  "wedding-luxe-gold-landscape-1sq":    "wedding-luxe-gold",
  "wedding-luxe-gold-landscape-2sq":    "wedding-luxe-gold",
  "wedding-luxe-gold-landscape-3sq":    "wedding-luxe-gold",
};

export const LUXURY_FONTS = [
  { id: "cinzel", name: "Cinzel (Royal Roman)", css: "'Cinzel', serif" },
  { id: "playfair", name: "Playfair Display (Elegant Serif)", css: "'Playfair Display', serif" },
  { id: "bodoni", name: "Bodoni Moda (High Fashion Serif)", css: "'Bodoni Moda', serif" },
  { id: "hanken-grotesk", name: "Hanken Grotesk (Clean Neo-Grotesque)", css: "'Hanken Grotesk', sans-serif" },
  { id: "italiana", name: "Italiana (Geometric Roman)", css: "'Italiana', serif" },
  { id: "aboreto", name: "Aboreto (Wire-Thin Modern Capital)", css: "'Aboreto', sans-serif" },
  { id: "greatvibes", name: "Great Vibes (Soft Cursive Harmony)", css: "'Great Vibes', cursive" },
  { id: "alexbrush", name: "Alex Brush (Stately Royal Calligraphy)", css: "'Alex Brush', cursive" },
  { id: "pinyon", name: "Pinyon Script (Traditional Sloped Signature)", css: "'Pinyon Script', cursive" },
  { id: "sacramento", name: "Sacramento (Graceful Midcentury Pen)", css: "'Sacramento', cursive" },
  { id: "rochester", name: "Rochester (Antique Signage Script)", css: "'Rochester', cursive" },
  { id: "parisienne", name: "Parisienne (Flowing Parisian Romance)", css: "'Parisienne', cursive" },
  { id: "labelle", name: "La Belle Aurore (Casual Handwriting ink)", css: "'La Belle Aurore', cursive" },
  { id: "montserrat", name: "Montserrat (Clean Modernist Sans)", css: "'Montserrat', sans-serif" }
];

export const HARMONY_PALETTES = [
  {
    id: "classic-noir",
    name: "Classic Noir",
    bg: "#FAF9F5",
    text: "#1C1C1C",
    secondary: "#8A7342",
    border: "#D4CFC4",
    slotBg: "#EDEDE8",
  },
  {
    id: "royal-emerald",
    name: "Royal Emerald",
    bg: "#1E2B22",
    text: "#FAF6F0",
    secondary: "#DFCE83",
    border: "#6E7F71",
    slotBg: "#161F19",
  },
  {
    id: "terracotta-sunset",
    name: "Terracotta Sunset",
    bg: "#FBF5F0",
    text: "#3C1A14",
    secondary: "#BC6C52",
    border: "#D6C3B7",
    slotBg: "#EBE0D8",
  },
  {
    id: "midnight-onyx",
    name: "Midnight Onyx",
    bg: "#111111",
    text: "#FFFFFF",
    secondary: "#766023",
    border: "#333333",
    slotBg: "#1A1A1A",
  },
  {
    id: "misty-lavender",
    name: "Misty Lavender",
    bg: "#F5F3F7",
    text: "#2C2235",
    secondary: "#8C7B99",
    border: "#D5CFDB",
    slotBg: "#EBE6EF",
  },
];

// ─── SLOT-COUNT-AGNOSTIC SVG DECORATION ENGINE ─────────────────────────────────
export function renderDecorativeSvg(
  presetId: string,
  type: "strip" | "postcard" | "postcard-vertical",
  color: string,
  secondaryColor: string,
  borderColor: string,
  textPosition: "bottom" | "top" = "bottom"
) {
  // Resolve format variants back to their root design family ID
  let baseId = presetId;
  if (DECORATION_ALIASES[presetId]) {
    baseId = DECORATION_ALIASES[presetId];
  } else {
    baseId = presetId.replace("-postcard", "").replace("-landscape", "").replace("-L", "").replace("-invL", "");
  }

  // Find preset and dynamic layout boundaries
  const preset = PRESETS.find(p => p.id === presetId) || PRESETS.find(p => p.id === baseId) || PRESETS[0];
  const rawLayout = resolveLayout(preset.layoutId, type);
  const layout = getModifiedLayout(rawLayout, textPosition);
  const vb = VIEWBOX[type];
  const margin = FORMAT_MARGIN[type];

  // Dynamically calculate the textZone ("branding pedestal") bounds
  const tz = {
    x: layout.textZone.x,
    y: layout.textZone.y,
    w: layout.textZone.w,
    h: layout.textZone.h,
    centerX: layout.textZone.x + layout.textZone.w / 2,
    centerY: layout.textZone.y + layout.textZone.h / 2
  };

  const isGoldPreset = ["wedding-luxe-gold", "wedding-art-deco", "wedding-warm-terracotta", "wedding-royal-crest", "wedding-classic-monogram"].includes(baseId);
  const strokeColor = isGoldPreset ? "url(#svg-gold-shimmer)" : secondaryColor;

  const defs = `
    <defs>
      <linearGradient id="svg-gold-shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#766023" />
        <stop offset="25%" stop-color="#F3E5BE" />
        <stop offset="50%" stop-color="#A58238" />
        <stop offset="75%" stop-color="#FFF3CD" />
        <stop offset="100%" stop-color="#766023" />
      </linearGradient>
    </defs>
  `;

  // Render SVG elements anchored ONLY to the canvas edges (relative to margin) or to the dynamic tz pedestal boundaries.
  switch (baseId) {
    case "katha-editorial-void":
      return "";
    case "katha-heirloom-pina":
      return `
        <!-- Dual calado champagne borders -->
        <rect x="${margin / 3}" y="${margin / 3}" width="${vb.w - 2 * margin / 3}" height="${vb.h - 2 * margin / 3}" fill="none" stroke="${secondaryColor}" stroke-width="1.5" />
        <rect x="${margin / 3 + 8}" y="${margin / 3 + 8}" width="${vb.w - 2 * margin / 3 - 16}" height="${vb.h - 2 * margin / 3 - 16}" fill="none" stroke="${secondaryColor}" stroke-width="0.6" opacity="0.55" />
        <!-- Dynamic Calado Openwork Divider anchored to textZone boundary -->
        <g transform="translate(${vb.w / 2}, ${textPosition === 'bottom' ? tz.y - 18 : tz.y + tz.h + 18})" stroke="${secondaryColor}" stroke-width="1.4" fill="${secondaryColor}">
          <line x1="-150" y1="0" x2="-26" y2="0" stroke-dasharray="1.5 7" stroke-linecap="round" />
          <line x1="26" y1="0" x2="150" y2="0" stroke-dasharray="1.5 7" stroke-linecap="round" />
          <path d="M -16,0 L 0,-9 L 16,0 L 0,9 Z" fill="none" stroke-width="1.1" />
          <circle cx="0" cy="0" r="2.4" />
        </g>
      `;

    case "katha-loom-frame":
      return `
        <!-- Heavy nested Iron Bark loom borders -->
        <rect x="${margin / 3 - 2}" y="${margin / 3 - 2}" width="${vb.w - 2 * margin / 3 + 4}" height="${vb.h - 2 * margin / 3 + 4}" fill="none" stroke="${secondaryColor}" stroke-width="2" />
        <rect x="${margin / 2}" y="${margin / 2}" width="${vb.w - margin}" height="${vb.h - margin}" fill="none" stroke="${secondaryColor}" stroke-width="0.9" opacity="0.7" />
        <!-- Authentic hand-pegged mortise-and-tenon corner overlays -->
        <g stroke="${secondaryColor}" stroke-width="1.6">
          <!-- Top-Left -->
          <line x1="${margin / 2}" y1="${margin / 2 - 10}" x2="${margin / 2}" y2="${margin / 2 + 20}" />
          <line x1="${margin / 2 - 10}" y1="${margin / 2}" x2="${margin / 2 + 20}" y2="${margin / 2}" />
          <!-- Top-Right -->
          <line x1="${vb.w - margin / 2}" y1="${margin / 2 - 10}" x2="${vb.w - margin / 2}" y2="${margin / 2 + 20}" />
          <line x1="${vb.w - margin / 2 - 20}" y1="${margin / 2}" x2="${vb.w - margin / 2 + 10}" y2="${margin / 2}" />
          <!-- Bottom-Left -->
          <line x1="${margin / 2}" y1="${vb.h - margin / 2 - 20}" x2="${margin / 2}" y2="${vb.h - margin / 2 + 10}" />
          <line x1="${margin / 2 - 10}" y1="${vb.h - margin / 2}" x2="${margin / 2 + 20}" y2="${vb.h - margin / 2}" />
          <!-- Bottom-Right -->
          <line x1="${vb.w - margin / 2}" y1="${vb.h - margin / 2 - 20}" x2="${vb.w - margin / 2}" y2="${vb.h - margin / 2 + 10}" />
          <line x1="${vb.w - margin / 2 - 20}" y1="${vb.h - margin / 2}" x2="${vb.w - margin / 2 + 10}" y2="${vb.h - margin / 2}" />
        </g>
      `;

    case "katha-knalum-night":
      return `
        <!-- Soil-black T'nalak raw linen rules -->
        <rect x="${margin / 2}" y="${margin / 2}" width="${vb.w - margin}" height="${vb.h - margin}" fill="none" stroke="${secondaryColor}" stroke-width="1" opacity="0.8" />
        <!-- A single, sacred loko-root rust horizontal thread above/below the text pedestal -->
        <line x1="${vb.w / 2 - 90}" y1="${textPosition === 'bottom' ? tz.y - 18 : tz.y + tz.h + 18}" x2="${vb.w / 2 + 90}" y2="${textPosition === 'bottom' ? tz.y - 18 : tz.y + tz.h + 18}" stroke="#8C382A" stroke-width="2.5" />
      `;

    case "katha-brass-ring":
      return `
        <!-- Fine ecru rules -->
        <rect x="${margin / 2}" y="${margin / 2}" width="${vb.w - margin}" height="${vb.h - margin}" fill="none" stroke="${secondaryColor}" stroke-width="1.2" />
        <!-- Sacred loko-rust brass ring centered at the boundary of the branding pedestal -->
        <g transform="translate(${vb.w / 2}, ${textPosition === 'bottom' ? tz.y - 30 : tz.y + tz.h + 30})" fill="none" stroke="${secondaryColor}">
          <circle cx="0" cy="0" r="22" stroke-width="2" />
          <circle cx="0" cy="0" r="14" stroke-width="0.75" opacity="0.6" />
        </g>
      `;

    case "katha-woven-silk":
      return `
        <!-- Outer structural thread double-line canvas border -->
        <rect x="${margin / 3}" y="${margin / 3}" width="${vb.w - 2 * margin / 3}" height="${vb.h - 2 * margin / 3}" fill="none" stroke="${secondaryColor}" stroke-width="1.2" />
        <rect x="${margin / 3 + 8}" y="${margin / 3 + 8}" width="${vb.w - 2 * margin / 3 - 16}" height="${vb.h - 2 * margin / 3 - 16}" fill="none" stroke="${secondaryColor}" stroke-width="0.6" opacity="0.6" />
        
        <!-- Subtle Overlay Threads intersecting slots by 14px -->
        ` + layout.slots.map((s: any) => `
          <!-- Transparent thread running through the slot edges -->
          <rect x="${s.x + 14}" y="${s.y + 14}" width="${s.w - 28}" height="${s.h - 28}" fill="none" stroke="${secondaryColor}" stroke-width="0.8" opacity="0.75" stroke-dasharray="4 8" />
          <line x1="${s.x - 8}" y1="${s.y + 14}" x2="${s.x + s.w + 8}" y2="${s.y + 14}" stroke="${secondaryColor}" stroke-width="0.6" opacity="0.5" />
          <line x1="${s.x + 14}" y1="${s.y - 8}" x2="${s.x + 14}" y2="${s.y + s.h + 8}" stroke="${secondaryColor}" stroke-width="0.6" opacity="0.5" />
        `).join("") + `
        
        <!-- Minimal organic hand-woven medallion centered below text pedestal -->
        <g transform="translate(${vb.w / 2}, ${textPosition === 'bottom' ? tz.y - 24 : tz.y + tz.h + 24})" fill="none" stroke="${secondaryColor}">
          <line x1="-120" y1="0" x2="-24" y2="0" stroke-width="1" />
          <line x1="24" y1="0" x2="120" y2="0" stroke-width="1" />
          <polygon points="-8,0 0,-7 8,0 0,7" stroke-width="1.2" />
        </g>
      `;

    case "katha-tracy-prince":
      return `
        <!-- Subtle Overlay Frame intruding 12px into the photo slot -->
        ` + layout.slots.map((s: any) => `
          <rect x="${s.x + 12}" y="${s.y + 12}" width="${s.w - 24}" height="${s.h - 24}" fill="none" stroke="${secondaryColor}" stroke-width="1.5" opacity="0.8" />
          <rect x="${s.x + 18}" y="${s.y + 18}" width="${s.w - 36}" height="${s.h - 36}" fill="none" stroke="${secondaryColor}" stroke-width="0.5" opacity="0.5" />
        `).join("") + `
        
        <!-- Outer Canvas Frame -->
        <rect x="${margin / 2}" y="${margin / 2}" width="${vb.w - margin}" height="${vb.h - margin}" fill="none" stroke="${secondaryColor}" stroke-width="0.5" opacity="0.8" />
        <rect x="${margin / 2 + 8}" y="${margin / 2 + 8}" width="${vb.w - margin - 16}" height="${vb.h - margin - 16}" fill="none" stroke="${secondaryColor}" stroke-width="1.5" />
        <g transform="translate(${vb.w / 2}, ${textPosition === 'bottom' ? tz.y - 20 : tz.y + tz.h + 20})" fill="none" stroke="${secondaryColor}">
           <circle cx="0" cy="0" r="14" stroke-width="1.5" />
           <circle cx="0" cy="0" r="6" stroke-width="0.75" />
           <line x1="-140" y1="0" x2="-32" y2="0" stroke-width="1" />
           <line x1="32" y1="0" x2="140" y2="0" stroke-width="1" />
        </g>
      `;

    case "katha-binakul-weave":
      return `
        <!-- Media slots boundaries to ensure visibility in LumaBooth overlays -->
        ` + layout.slots.map((s: any) => `
          <rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" fill="none" stroke="${borderColor}" stroke-width="1.5" />
        `).join("") + `
        <!-- Inactive Inabel abacá borders -->
        <rect x="${margin / 2}" y="${margin / 2}" width="${vb.w - margin}" height="${vb.h - margin}" fill="none" stroke="${secondaryColor}" stroke-width="1" opacity="0.55" />
        <!-- Mathematical optical binakul whirlpools in corners to confuse malevolent spirits -->
        <g stroke="${secondaryColor}" fill="none" stroke-width="1" opacity="0.5">
          <g transform="translate(${margin + 14}, ${margin + 14}) rotate(45)"><rect x="-26" y="-26" width="52" height="52" /><rect x="-17" y="-17" width="34" height="34" /><rect x="-9" y="-9" width="18" height="18" /></g>
          <g transform="translate(${vb.w - margin - 14}, ${margin + 14}) rotate(45)"><rect x="-26" y="-26" width="52" height="52" /><rect x="-17" y="-17" width="34" height="34" /><rect x="-9" y="-9" width="18" height="18" /></g>
          <g transform="translate(${margin + 14}, ${vb.h - margin - 14}) rotate(45)"><rect x="-26" y="-26" width="52" height="52" /><rect x="-17" y="-17" width="34" height="34" /><rect x="-9" y="-9" width="18" height="18" /></g>
          <g transform="translate(${vb.w - margin - 14}, ${vb.h - margin - 14}) rotate(45)"><rect x="-26" y="-26" width="52" height="52" /><rect x="-17" y="-17" width="34" height="34" /><rect x="-9" y="-9" width="18" height="18" /></g>
        </g>
      `;

    case "katha-capiz-sage":
      return `
        <!-- Sage border -->
        <rect x="${margin / 2}" y="${margin / 2}" width="${vb.w - margin}" height="${vb.h - margin}" fill="none" stroke="${secondaryColor}" stroke-width="1.2" />
        <!-- Translucent Capiz Windowpane Grid in the text pedestal gap -->
        <g transform="translate(${vb.w / 2}, ${textPosition === 'bottom' ? tz.y - 18 : tz.y + tz.h + 18})" stroke="${secondaryColor}" stroke-width="1">
          <rect x="-72" y="-12" width="24" height="24" fill="${secondaryColor}" fill-opacity="0.15" />
          <rect x="-42" y="-12" width="24" height="24" fill="none" />
          <rect x="-12" y="-12" width="24" height="24" fill="${secondaryColor}" fill-opacity="0.15" />
          <rect x="18" y="-12" width="24" height="24" fill="none" />
          <rect x="48" y="-12" width="24" height="24" fill="${secondaryColor}" fill-opacity="0.15" />
        </g>
      `;

    case "wedding-luxe-gold":
      return defs + `
        <!-- Subtle Corner Overlays intruding into the slots -->
        ` + layout.slots.map((s: any) => `
          <rect x="${s.x + 16}" y="${s.y + 16}" width="${s.w - 32}" height="${s.h - 32}" fill="none" stroke="${strokeColor}" stroke-width="1.5" opacity="0.9" />
          <!-- Small corner accents floating over the photo corners -->
          <line x1="${s.x + 8}" y1="${s.y + 32}" x2="${s.x + 32}" y2="${s.y + 8}" stroke="${strokeColor}" stroke-width="1.5" />
          <line x1="${s.x + s.w - 8}" y1="${s.y + 32}" x2="${s.x + s.w - 32}" y2="${s.y + 8}" stroke="${strokeColor}" stroke-width="1.5" />
          <line x1="${s.x + 8}" y1="${s.y + s.h - 32}" x2="${s.x + 32}" y2="${s.y + s.h - 8}" stroke="${strokeColor}" stroke-width="1.5" />
          <line x1="${s.x + s.w - 8}" y1="${s.y + s.h - 32}" x2="${s.x + s.w - 32}" y2="${s.y + s.h - 8}" stroke="${strokeColor}" stroke-width="1.5" />
        `).join("") + `
        
        <!-- Outer Canvas Double Frame -->
        <rect x="${margin / 4}" y="${margin / 4}" width="${vb.w - 2 * margin / 4}" height="${vb.h - 2 * margin / 4}" fill="none" stroke="${strokeColor}" stroke-width="1.5" />
        <rect x="${margin / 4 + 8}" y="${margin / 4 + 8}" width="${vb.w - 2 * margin / 4 - 16}" height="${vb.h - 2 * margin / 4 - 16}" fill="none" stroke="${strokeColor}" stroke-width="0.5" opacity="0.8" />
      `;

    case "rose-whisper":
      return `
        <!-- Ivory linen border -->
        <rect x="${margin / 4}" y="${margin / 4}" width="${vb.w - 2 * margin / 4}" height="${vb.h - 2 * margin / 4}" fill="none" stroke="${secondaryColor}" stroke-dasharray="8 6" stroke-width="1.5" opacity="0.5" />
        <!-- Hand-sketched classic ivory rose aligned dynamically above/below the text -->
        <g transform="translate(${vb.w / 2}, ${textPosition === 'bottom' ? tz.y - 45 : tz.y + tz.h + 45}) scale(1.65)">
          <path d="M 12 30 C 5 22 15 15 22 24 C 28 12 40 20 32 30 C 45 32 35 48 24 40 C 15 45 8 36 12 30 Z" fill="#FFFFFF" stroke="${color}" stroke-width="1" />
          <path d="M 22 28 C 18 24 24 20 26 26 Z" fill="#FCFAF2" stroke="${color}" stroke-width="0.75" />
          <path d="M -5 32 Q 5 18 12 28" fill="none" stroke="#9A9F95" stroke-width="1" />
          <path d="M 38 42 Q 48 48 42 54" fill="none" stroke="#9A9F95" stroke-width="1" />
          <path d="M -5 32 C -10 32 -12 26 -8 24 Z" fill="#CCD1C6" />
        </g>
      `;

    case "wedding-warm-terracotta":
      return defs + `
        <!-- Bohemian terracotta contours and rules -->
        <rect x="${margin / 3}" y="${margin / 3}" width="${vb.w - 2 * margin / 3}" height="${vb.h - 2 * margin / 3}" fill="none" stroke="${strokeColor}" stroke-width="1.5" />
        <rect x="${margin / 3 + 7}" y="${margin / 3 + 7}" width="${vb.w - 2 * margin / 3 - 14}" height="${vb.h - 2 * margin / 3 - 14}" fill="none" stroke="${strokeColor}" stroke-width="0.5" opacity="0.75" />
        <!-- Single minimal organic eucalyptus outline -->
        <g transform="translate(${vb.w - margin - 30}, ${margin + 10}) scale(1.6)" stroke="${strokeColor}" fill="none" stroke-width="1">
          <path d="M0,0 Q30,-20 60,0 Q30,20 0,0 Z" fill="${strokeColor}" opacity="0.15" />
          <path d="M0,0 C20,10 40,-10 60,0" />
        </g>
      `;

    case "wedding-art-deco":
      return defs + `
        <!-- Gatsby concentric yellow chevrons -->
        <rect x="${margin / 3}" y="${margin / 3}" width="${vb.w - 2 * margin / 3}" height="${vb.h - 2 * margin / 3}" fill="none" stroke="${strokeColor}" stroke-width="2.5" />
        <rect x="${margin / 3 + 8}" y="${margin / 3 + 8}" width="${vb.w - 2 * margin / 3 - 16}" height="${vb.h - 2 * margin / 3 - 16}" fill="none" stroke="${strokeColor}" stroke-width="1" opacity="0.8" />
        <g stroke="${strokeColor}" stroke-width="1.5" fill="none">
          <polyline points="${margin / 3},60 60,${margin / 3} 100,${margin / 3}" />
          <polyline points="${margin / 3},100 100,${margin / 3}" />
          <polyline points="${vb.w - margin / 3},60 ${vb.w - 60},${margin / 3} ${vb.w - 100},${margin / 3}" />
          <polyline points="${vb.w - margin / 3},100 ${vb.w - 100},${margin / 3}" />
        </g>
      `;

    case "wedding-editorial":
      return `
        <!-- Minimal, clean editorial margins and single hairline separating photos and text -->
        <rect x="${margin / 2}" y="${margin / 2}" width="${vb.w - margin}" height="${vb.h - margin}" fill="none" stroke="${secondaryColor}" stroke-width="1.5" />
        <line x1="${margin / 2}" y1="${textPosition === 'bottom' ? tz.y - 12 : tz.y + tz.h + 12}" x2="${vb.w - margin / 2}" y2="${textPosition === 'bottom' ? tz.y - 12 : tz.y + tz.h + 12}" stroke="${secondaryColor}" stroke-width="1.5" />
      `;

    case "wedding-vintage-lace":
      return `
        <!-- Scalloped lace paper outline rules -->
        <rect x="${margin / 3}" y="${margin / 3}" width="${vb.w - 2 * margin / 3}" height="${vb.h - 2 * margin / 3}" fill="none" stroke="${secondaryColor}" stroke-dasharray="10 5" stroke-width="1.5" />
        <g fill="none" stroke="${secondaryColor}" stroke-width="1.5">
          <path d="M ${margin / 3},50 Q 50,50 50,${margin / 3}" />
          <path d="M ${vb.w - margin / 3},50 Q ${vb.w - 50},50 ${vb.w - 50},${margin / 3}" />
        </g>
      `;

    case "wedding-royal-crest":
      return `
        <!-- Imperial stationery double borders -->
        <rect x="${margin / 3}" y="${margin / 3}" width="${vb.w - 2 * margin / 3}" height="${vb.h - 2 * margin / 3}" fill="none" stroke="${secondaryColor}" stroke-width="3" />
        <rect x="${margin / 3 + 9}" y="${margin / 3 + 9}" width="${vb.w - 2 * margin / 3 - 18}" height="${vb.h - 2 * margin / 3 - 18}" fill="none" stroke="${secondaryColor}" stroke-width="1" opacity="0.6" />
        <!-- Dynamic circular debossed crest centered at text pedestal -->
        <g transform="translate(${vb.w / 2}, ${textPosition === 'bottom' ? tz.y - 30 : tz.y + tz.h + 30}) scale(1.15)" stroke="${secondaryColor}" fill="none" stroke-width="1.2">
          <ellipse cx="0" cy="0" rx="36" ry="26" />
          <path d="M -15, -12 L 0, -20 L 15, -12 L 10, 8 L -10, 8 Z" opacity="0.2" fill="${secondaryColor}" />
        </g>
      `;

    case "wedding-botanical-arch":
      return `
        <!-- Dynamic, fully scalable double cathedral arches stretching around photo cluster -->
        <path d="M ${margin / 2},${textPosition === 'bottom' ? tz.y - 10 : vb.h - margin / 2} L ${margin / 2},${margin + (vb.w - margin) / 2} A ${(vb.w - margin) / 2},${(vb.w - margin) / 2} 0 0,1 ${vb.w - margin / 2},${margin + (vb.w - margin) / 2} L ${vb.w - margin / 2},${textPosition === 'bottom' ? tz.y - 10 : vb.h - margin / 2} Z" fill="none" stroke="${secondaryColor}" stroke-width="2" />
        <path d="M ${margin / 2 + 6},${textPosition === 'bottom' ? tz.y - 6 : vb.h - margin / 2 - 6} L ${margin / 2 + 6},${margin + 6 + (vb.w - margin - 12) / 2} A ${(vb.w - margin - 12) / 2},${(vb.w - margin - 12) / 2} 0 0,1 ${vb.w - margin / 2 - 6},${margin + 6 + (vb.w - margin - 12) / 2} L ${vb.w - margin / 2 - 6},${textPosition === 'bottom' ? tz.y - 6 : vb.h - margin / 2 - 6} Z" fill="none" stroke="${secondaryColor}" stroke-width="0.75" opacity="0.6" />
      `;

    case "wedding-decked-monogram":
      return `
        <!-- Hand-torn deckled edges -->
        <rect x="${margin / 3}" y="${margin / 3}" width="${vb.w - 2 * margin / 3}" height="${vb.h - 2 * margin / 3}" fill="none" stroke="${secondaryColor}" stroke-width="1" stroke-dasharray="20 4 4 4" />
        <!-- Dynamic copper wax-seal centered above/below names -->
        <g transform="translate(${vb.w / 2}, ${textPosition === 'bottom' ? tz.y - 30 : tz.y + tz.h + 30}) scale(1.35)" fill="none" stroke="${secondaryColor}" stroke-width="1.5">
          <path d="M -35,5 C -45,35 45,35 35,5 C 25,-25 -25,-25 -35,5 Z" fill="${secondaryColor}" opacity="0.15" stroke-width="1" />
          <circle cx="0" cy="4" r="28" stroke="${secondaryColor}" stroke-width="1" />
        </g>
      `;

    default:
      return defs + `
        <rect x="${margin / 2}" y="${margin / 2}" width="${vb.w - margin}" height="${vb.h - margin}" fill="none" stroke="${secondaryColor}" stroke-width="1" opacity="0.4" />
      `;
  }
}
