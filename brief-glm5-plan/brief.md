You are GLM 5. You are tasked with analyzing the following sample code and creating a holistic implementation plan to overhaul the Zenith pipeline end-to-end, then execute it with the CLI counsel. Write the detailed implementation plan.

User Request:
<USER_REQUEST>
the woven pattern can definitely be animated in a intentional orchestral dance. The Kobe accent isnt it. You know , now that I think about it, I feel that glm 5 would have a better and clearer picture if it had zenith knowledge of design baseline output. Glm 5 should be responsible to 'actually' enhance the zenith structure as a whole so it can orchestrate how the aesthetic output would be holistically. Please task glm 5, ensure you do not trick me again - with the amplification zenith brief. Glm 5 can only amplify existing foundational architecture. Please add micro animations and transitions while ensuring the booking pipeline is incorporated perfectly along with seo/aio

I have a new example that glm 5 can reference from
import React, { useState, useEffect, useRef, useMemo } from "react";

/* ════════════════════════════════════════════════════════════════
   KATHA · THE KAMAGONG & ACHUETE ATELIER (FILIPINO HERITAGE)
   
   Aesthetic: Philippine Ebony (Kamagong) base, Piña Ecru ink, 
              Achuete / Vigan Brick (Rust Red) accents.
   Physics:   100% Pure CSS Keyframes & Transitions.
   Layout:    Mirrors the cinematic "Nightfall" screenshot.
   ════════════════════════════════════════════════════════════════ */

const N = {
  // ── FILIPINO HERITAGE DARK TONES ──
  l0:  "#110F0D",   // Kamagong (Deepest Ebony/Charcoal Void)
  l1:  "#1A1714",   // Dark Abacá (Intermediate shadow)
  l2:  "#241F1B",   // Kape (Surfaces, Date Gate)
  l3:  "#2E2722",   // Lifted surface
  
  hi:  "#E8E1D3",   // Piña Ecru (Primary Light / Ink)
  ecru:"#E8E1D3",   // Piña Ecru
  mut: "#A39B8E",   // Rattan (Body text / Italics)
  fnt: "#857D71",   // Capiz Slate (Meta text)
  dim: "#5C554C",   // Muted outline

  // ── THE ACHUETE ACCENT (VIGAN BRICK) ──
  loko:"#9A3D2A",   // Achuete (The Sacred Thread / CTA / Lines) - Matches the screenshot red perfectly
  terra:"#9A3D2A",  // Achuete Secondary
  champ:"#C9A57B",  // Brass accent
  sage:"#727B5E",   // Pandanus (Success indicator)
  
  ln:  "rgba(232, 225, 211, 0.08)", // Piña translucent
  ln2: "rgba(232, 225, 211, 0.16)",
  glass: "rgba(255,255,255,0.02)",
  shadow:"rgba(0,0,0,0.85)",
};

const F = {
  d: "'FH Ronaldson Display Test', serif", 
  s: "'Outfit', sans-serif",               
  m: "'Courier Prime', monospace", // Perfect for the tracked-out meta text        
};

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`;
const OAK_B64 = "https://images.unsplash.com/photo-1621245643448-4e86db703fc6?q=80&w=800&auto=format&fit=crop"; 

const CSS = `
@import url('https://fonts.cdnfonts.com/css/fh-ronaldson-display-test');
@import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;1,400&family=Courier+Prime&family=Outfit:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

html, body { background-color: ${N.l0} !important; color: ${N.hi}; margin: 0; padding: 0; width: 100%; height: 100%; overflow-x: hidden; }
#root, #__next { min-height: 100vh; background-color: ${N.l0}; }

input,select,textarea,button{font-family:inherit;outline:none;}
input::placeholder{color:rgba(232, 225, 211, 0.25);}
button{cursor:pointer;border:none;background:none;}
input[type=date]{color-scheme:dark;}

/* ── CINEMATIC STUDIO LIGHT LEAK (Mimics the background in your screenshot) ── */
.studio-backdrop {
  position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background-color: ${N.l0};
  background-image: 
    radial-gradient(circle at 80% -20%, rgba(232, 225, 211, 0.04) 0%, transparent 50%),
    linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.015) 41%, rgba(255,255,255,0.005) 45%, transparent 46%),
    ${GRAIN};
}

/* ── PURE CSS ENTRANCE ANIMATIONS ── */
@keyframes bridgeOut {
  0% { opacity: 1; transform: scale(1); filter: blur(0px); }
  60% { opacity: 1; transform: scale(1); filter: blur(0px); }
  100% { opacity: 0; transform: scale(0.95); filter: blur(10px); visibility: hidden; }
}
@keyframes charBloom {
  0% { opacity: 0; transform: translateY(40px) scale(1.1); filter: blur(15px); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
}
@keyframes swashDraw {
  0% { stroke-dashoffset: 100; }
  100% { stroke-dashoffset: 0; }
}
@keyframes heroDrift {
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
}

.bridge-container { animation: bridgeOut 3.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.char-bloom { animation: charBloom 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
.swash-path { stroke-dasharray: 100; stroke-dashoffset: 100; animation: swashDraw 1.4s cubic-bezier(0.65, 0, 0.35, 1) forwards; }
.hero-drift { animation: heroDrift 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }

.d1 { animation-delay: 2.8s; }
.d2 { animation-delay: 2.9s; }
.d3 { animation-delay: 3.0s; }

/* ── HOVER PHYSICS ── */
.tier-card { 
  position: relative; background: transparent; border: 1px solid ${N.ln}; padding: 32px 36px; 
  display: flex; flex-direction: column; gap: 16px; cursor: pointer; 
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.tier-cta { 
  font-family: ${F.s}; font-weight: 500; font-size: 10px; letter-spacing: .18em; text-transform: uppercase; color: ${N.loko}; 
  border-bottom: 1px solid ${N.loko}; padding-bottom: 3px; align-self: flex-start; 
  opacity: 0; transform: translateY(4px); transition: all 0.3s ease;
}
.tier-card:hover {
  transform: translateY(-8px); background: ${N.l1}; border-color: ${N.loko}; box-shadow: 0 24px 50px ${N.shadow};
}
.tier-card:hover .tier-cta { opacity: 1; transform: translateY(0); }

/* Exhibition Track */
.track{display:flex;gap:48px;padding:16px clamp(20px, 5vw, 32px) 60px;overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;align-items:center;scrollbar-width:none;}
.track::-webkit-scrollbar{display:none;}
.titem{flex:0 0 auto; transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1); will-change: transform;}
.titem:hover{ transform: translateY(-8px); }

/* Pricing Grid */
.pricing-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 0.82fr 1fr; gap: 44px; align-items: start; }
.oak-sticky { position: sticky; top: 120px; }
@media(max-width: 820px) { .pricing-grid { grid-template-columns: 1fr; gap: 32px; } .oak-sticky { position: static; } .tier-card { padding: 24px 28px; } }

/* ── PURE CSS Z-DEPTH VAULT DRAWER ── */
#app-content { transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.8s ease, opacity 0.8s ease; transform-origin: center 20%; min-height: 100vh; position: relative; }
body.drawer-open #app-content { transform: scale(0.96) translateY(8px); filter: blur(6px); opacity: 0.6; pointer-events: none; }
body.drawer-open { overflow: hidden; }

.vault-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 300; opacity: 0; pointer-events: none; transition: opacity 0.6s ease; }
body.drawer-open .vault-overlay { opacity: 1; pointer-events: auto; }

.vault-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 600px; background: ${N.l0}; border-left: 1px solid ${N.ln}; z-index: 301; overflow-y: auto; padding: 48px; transform: translateX(100%); transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: none; }
body.drawer-open .vault-drawer { transform: translateX(0); box-shadow: -40px 0 100px ${N.shadow}; }

.grab{cursor:grab;} .grabbing{cursor:grabbing;}
`;

// ── RASTER MARKS (With Fallbacks for Preview) ─────────────────────

function BrandMark({ size = 40, mode = "ecru" }) {
  const [error, setError] = useState(false);
  if (error) return <div style={{width: size, height: size, border: `1px solid ${N.loko}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.d, color: N.hi}}>K</div>;
  
  return <img src={`logo-${mode}.png`} alt="Katha Brand Mark" onError={() => setError(true)} style={{ width: size, height: "auto", objectFit: "contain", userSelect: "none" }} draggable="false" />;
}

function Wordmark({ size = 26, mode = "ecru" }) {
  const [error, setError] = useState(false);
  if (error) return (
    <div style={{ display: 'flex', position: 'relative' }}>
      <span style={{ fontFamily: F.d, fontSize: size, fontWeight: 300, color: N.hi, lineHeight: 1, letterSpacing: "-0.01em" }}>katha</span>
      <svg width={size*2.2} height="14" viewBox="0 0 74 14" style={{ position: "absolute", left: "-5%", bottom: "-6px", overflow: "visible" }}>
        <path d="M2 9 C 18 13, 40 13, 56 5 C 62 2, 68 2, 72 6" fill="none" stroke={N.loko} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
  
  return <img src={`wordmark-${mode}.png`} alt="Katha Studio" onError={() => setError(true)} style={{ height: size, width: "auto", objectFit: "contain", userSelect: "none" }} draggable="false" />;
}

// ── CATALOG ──────────────────────────────────────────────────────

const STYLES = ["All", "Signature", "Classic"];

const TEMPLATES = [
  { id:"loom-oak", plate:"004", name:"Loom Oak", style:"Signature", booth:"Oak", formatLabel:"2×6 Strip", layout:"strip3", font:"FH Ronaldson Display Test", ratio:{w:1,h:3},
    desc:"Three frames on unbleached ground with a single Achuete seam — the warp line of the loom drawn straight down the strip.",
    paper:"#E8E1D3", slot:"#D1CBBF", edge:N.loko, ink:"#110F0D", accent:N.loko, sName:"AMARA & SEBASTIAN", sSub:"OCTOBER · LONG BEACH" },
  { id:"knalum-dark", plate:"011", name:"Knalum Dark", style:"Signature", booth:"Oak", formatLabel:"6×4 Landscape", layout:"land3", font:"FH Ronaldson Display Test", ratio:{w:3,h:2},
    desc:"Kamagong ebony ground, three apertures in geometric tension, one Capiz Slate thread bisecting the field below.",
    paper:"#1A1714", slot:N.l2, edge:N.fnt, ink:N.hi, accent:N.fnt, sName:"RENZO & CAMILLE", sSub:"NOVEMBER · CARSON" },
  { id:"fn-1", isFootnote: true, text: "Calado Piña — openwork drawn from Barong Tagalog embroidery, 17th c." },
  { id:"calado-pina", plate:"019", name:"Calado Piña", style:"Signature", booth:"Oak", formatLabel:"4×6 Postcard", layout:"strip2", font:"Outfit", ratio:{w:2,h:3},
    desc:"Two openings on raw piña fiber, divided by a hand-stitched calado — openwork drawn the way grandmothers drew it.",
    paper:"#241F1B", slot:"#2E2722", edge:N.fnt, ink:N.hi, accent:N.loko, sName:"Marisol & Diego", sSub:"September · Pasadena" },
  { id:"sombra-twin", plate:"027", name:"Sombra Twin", style:"Signature", booth:"White", formatLabel:"6×4 Square", layout:"twinsq", font:"Outfit", ratio:{w:3,h:2},
    desc:"Twin squares with breathing room, each trailing a ghost silhouette offset behind it, as if seen through fabric.",
    paper:"#1A1714", slot:"#241F1B", edge:N.fnt, ink:N.hi, accent:N.loko, sName:"SOFIA & MARCO", sSub:"SEPTEMBER · LOS ANGELES" },
  { id:"iron-rule", plate:"041", name:"Iron Rule", style:"Classic", booth:"White", formatLabel:"2×6 Strip", layout:"strip4", font:"FH Ronaldson Display Test", ratio:{w:1,h:3},
    desc:"Four frames, one hairline rule. The design steps back so the portrait carries the whole strip.",
    paper:"#110F0D", slot:N.hi, edge:N.dim, ink:"#110F0D", accent:N.dim, sName:"NADIA + ELIAS", sSub:"JULY · LONG BEACH" },
];

const CONFIRMED = { "2026-07-05":1,"2026-09-13":1,"2026-10-18":1,"2026-11-22":1 };
const fmtLong = (d) => d ? new Date(d+"T12:00:00").toLocaleDateString("en-US", {weekday:"long",month:"long",day:"numeric",year:"numeric"}) : "";

function Print({ t, height = 200 }) {
  const { w, h } = t.ratio;
  const H = height, W = Math.round(H * w / h);
  const pad = 9, iW = W - pad * 2, iH = H - pad * 2;
  let slots = [];
  if (t.layout === "strip3") { const sh = (iH - 34) / 3 - 2.5; slots = [0, 1, 2].map(i => ({ x: pad, y: pad + i * (sh + 3), w: iW, h: sh })); }
  else if (t.layout === "strip4") { const sh = (iH - 26) / 4 - 2; slots = [0, 1, 2, 3].map(i => ({ x: pad, y: pad + i * (sh + 2), w: iW, h: sh })); }
  else if (t.layout === "strip2") { const sh = (iH - 44) / 2 - 2; slots = [0, 1].map(i => ({ x: pad, y: pad + i * (sh + 3), w: iW, h: sh })); }
  else if (t.layout === "land3") { const sw = (iW - 6) / 3; const sh = iH - 24; slots = [0, 1, 2].map(i => ({ x: pad + i * (sw + 3), y: pad, w: sw, h: sh })); }
  else if (t.layout === "twinsq") { const sq = Math.min((iW - 6) / 2, iH - 26); const ox = (iW - (sq * 2 + 6)) / 2; slots = [0, 1].map(i => ({ x: pad + ox + i * (sq + 6), y: pad, w: sq, h: sq })); }
  const isLand = w > h, last = slots[slots.length - 1];
  const textY = isLand ? pad + (last?.h || 0) + 5 : (last?.y || 0) + (last?.h || 0) + 6;
  
  const fontName = t.font || "Outfit";
  const isRonaldson = fontName.includes("Ronaldson");
  
  return (
    <div style={{ width: W, height: H, flexShrink: 0, background: t.paper, position: "relative", boxShadow: `0 16px 32px rgba(0,0,0,0.5)` }}>
      {slots.map((s, i) => (
        <div key={i} style={{ position: "absolute", left: s.x, top: s.y, width: s.w, height: s.h, background: t.slot, outline: `1px solid ${t.edge}`, outlineOffset: "-2.5px" }} />
      ))}
      {textY < H && (
        <div style={{ position: "absolute", left: pad, right: pad, top: textY, textAlign: "center" }}>
          <p style={{ fontFamily: fontName, fontSize: 5.5, color: t.ink, letterSpacing: isRonaldson ? "0.12em" : "0.04em", fontWeight: fontName === "Outfit" ? 300 : 400, marginBottom: 2 }}>{t.sName}</p>
          <p style={{ fontFamily: F.m, fontSize: 4, color: t.accent, letterSpacing: "0.12em" }}>{t.sSub}</p>
        </div>
      )}
    </div>
  );
}

function Tag({ style }) {
  return <span style={{ fontFamily: F.m, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: style === "Signature" ? N.loko : N.mut }}>{style === "Signature" ? "◆ Signature" : "Classic"}</span>;
}

function ThreadWire({ label, type="text", value, onChange, placeholder, required }) {
  const [f,setF]=useState(false);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6, flex: "1 1 100%", position:"relative" }}>
      <label style={{ fontFamily:F.s, fontWeight: 500, fontSize:9, letterSpacing:"0.14em", textTransform:"uppercase", color:f?N.hi:N.fnt }}>
        {label}{required && <span style={{color:N.loko,marginLeft:3}}>*</span>}
      </label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:"100%", background:"transparent", border:"none", color:N.hi, padding:"12px 0", fontFamily:F.s, fontWeight:400, fontSize:20, borderBottom:`1px solid ${f?N.loko:N.ln}`, transition: 'border-color 0.3s' }}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// THE MAIN APP COMPONENT
// ════════════════════════════════════════════════════════════════

export default function App() {
  const [bridge, setBridge] = useState(true);
  const [styleF, setStyleF] = useState("All");

  const [gateDate, setGateDate] = useState("");
  const [gateStatus, setGateStatus] = useState(null);
  const [selected, setSelected] = useState(null);
  const [drawer, setDrawer] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [token, setToken] = useState("");
  const [lead, setLead] = useState({ name:"", email:"", date:"" });
  const setL = k => v => setLead(p=>({...p,[k]:v}));

  const trackRef = useRef(null);
  const drag = useRef({ on:false, x:0, sl:0, moved:false });

  // 1. Clear the bridge overlay safely
  useEffect(() => {
    const timer = setTimeout(() => {
      setBridge(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Sync drawer state to body class for CSS animations
  useEffect(() => {
    if (drawer) document.body.classList.add("drawer-open");
    else document.body.classList.remove("drawer-open");
    return () => document.body.classList.remove("drawer-open");
  }, [drawer]);

  const visible = useMemo(()=>TEMPLATES.filter(t=>{
    if(t.isFootnote && styleF!=="All") return false; 
    if(!t.isFootnote && styleF!=="All" && t.style!==styleF) return false;
    return true;
  }),[styleF]);

  const checkDate = () => {
    if(!gateDate) return;
    setGateStatus(CONFIRMED[gateDate] ? "reserved" : "open");
    setLead(p => ({ ...p, date: gateDate }));
  };

  const openDrawerForTemplate = (t) => { 
    if(drag.current.moved || t.isFootnote) return; 
    setSelected({ type: 'template', data: t }); 
    setDrawer(true);
    if(!lead.date && gateStatus==="open") setLead(p=>({...p,date:gateDate})); 
  };

  const openDrawerForTier = (name, price, booth, desc) => {
    setSelected({ type: 'tier', data: { name, price, booth, desc } });
    setDrawer(true);
    if(!lead.date && gateStatus==="open") setLead(p=>({...p,date:gateDate}));
  };

  const submit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setToken('KB-' + Math.random().toString(36).substring(2,8).toUpperCase());
      setConfirmed(true);
      setIsSubmitting(false);
    }, 1200);
  };

  const closeDrawer = ()=>{ setDrawer(false); setTimeout(()=>{ setSelected(null); setConfirmed(false); }, 600); };
  const onDown=(e)=>{ drag.current={ on:true, x:e.pageX, sl:trackRef.current.scrollLeft, moved:false }; };
  const onMove=(e)=>{ if(!drag.current.on) return; const w=(e.pageX-drag.current.x); if(Math.abs(w)>4) drag.current.moved=true;
    trackRef.current.scrollLeft=drag.current.sl-w*1.5; };
  const onUp=()=>{ drag.current.on=false; setTimeout(()=>{drag.current.moved=false;},50); };

  const isDateSecured = lead.date && !CONFIRMED[lead.date];
  const canSubmit = lead.name && lead.email && lead.date && !isSubmitting;

  return (
    <div className={drawer ? "drawer-open" : ""} style={{ width: "100%", position: "relative", zIndex: 1 }}>
      <style>{CSS}</style>

      {/* ════ BACKGROUND LAYER (Studio Light Leak & Kamagong Void) ════ */}
      <div className="studio-backdrop" />

      {/* ════ PURE CSS KINETIC ENTRANCE ═══════ */}
      {bridge && (
        <div className="bridge-container" style={{ position:"fixed", inset:0, zIndex:1000, background:N.l0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* The Logo/Wordmark component will fallback to the animated text + swash if the image isn't loaded */}
            <div className="char-bloom" style={{ animationDelay: "0.2s" }}>
              <Wordmark size={64} mode="ecru" />
            </div>
          </div>
        </div>
      )}

      {/* App Content Wrapper for CSS scale/blur physics */}
      <div id="app-content">
        {/* NAV */}
        <nav className="hero-drift d1" style={{ position:"sticky", top:0, zIndex:200, padding:"24px clamp(20px, 5vw, 32px)", display:"flex", alignItems:"center", justifyContent:"space-between", background:`rgba(17, 15, 13, 0.85)`, backdropFilter:"blur(16px)", borderBottom:`1px solid ${N.ln}` }}>
          <Wordmark size={24} mode="ecru" />
          <span style={{ fontFamily:F.m, fontWeight: 400, fontSize:10, letterSpacing:"0.16em", textTransform:"uppercase", color:N.fnt }}>Carson · Long Beach</span>
        </nav>

        {/* ════ HERO (Matches Screenshot Exactly) ═══════ */}
        <section style={{ minHeight:"85vh", display:"flex", flexDirection:"column", justifyContent:"center", padding:"56px clamp(20px, 5vw, 32px) 40px", position:"relative", overflow:"hidden" }}>
          
          <div style={{ maxWidth:880, width:"100%", margin:"0 auto", position: "relative", zIndex: 10 }}>
            
            {/* Eyebrow */}
            <p className="hero-drift d1" style={{ fontFamily:F.m, fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:N.loko, marginBottom:32 }}>
              Katha Photo Booth · Southern California
            </p>
            
            {/* Massive H1 */}
            <h1 className="hero-drift d2" style={{ fontFamily:F.d, fontSize:"clamp(60px, 11vw, 120px)", fontWeight:300, letterSpacing:"-0.02em", lineHeight:0.95, color:N.hi, marginBottom:48 }}>
              The frame<br/>your night<br/><em style={{fontFamily:"'Cormorant', serif", fontWeight:400, fontStyle:"italic", color:N.mut}}>lives in.</em>
            </h1>

            {/* Red Line & Paragraph */}
            <div className="hero-drift d3" style={{ maxWidth:580, borderLeft:`2px solid ${N.loko}`, paddingLeft:28, marginLeft: 2 }}>
              <p style={{ fontFamily:"'Cormorant', serif", fontWeight:400, fontStyle:"italic", fontSize:"clamp(22px, 2.6vw, 24px)", color:N.mut, lineHeight:1.6, marginBottom:56 }}>
                Eighty-two print designs, drawn by hand and held to one standard. Find the one that fits your event — we shape the details with you.
              </p>

              {/* DATE GATE (Matches Screenshot) */}
              <div style={{ background:"transparent", border:`1px solid ${N.ln}`, padding:"36px 28px" }}>
                {gateStatus!=="open" ? (
                  <>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:24 }}>
                      <p style={{ fontFamily:F.m, fontSize:9, letterSpacing:"0.16em", textTransform:"uppercase", color:N.fnt }}>BEFORE YOU BROWSE — YOUR DATE</p>
                      {(gateStatus==="reserved") && <span style={{ fontFamily:F.m, fontSize:9, color:N.loko }}>taken</span>}
                    </div>
                    <div style={{ display:"flex", gap:20, alignItems:"flex-end", flexWrap:"wrap" }}>
                      <div style={{ flex:"1 1 200px", minWidth: 0, position:"relative", borderBottom:`1px solid ${gateStatus==="reserved"?N.loko:N.ln2}` }}>
                        <input type="date" value={gateDate} onChange={e=>{setGateDate(e.target.value);setGateStatus(null);}} style={{ width:"100%", background:"transparent", border:"none", color:N.hi, padding:"12px 0", fontFamily:F.s, fontWeight:400, fontSize:22 }}/>
                      </div>
                      <button onClick={checkDate} disabled={!gateDate} style={{ flexShrink: 0, fontFamily:F.m, fontWeight:400, fontSize:10, letterSpacing:"0.16em", textTransform:"uppercase", color: gateDate?N.loko:N.fnt, padding:"12px 0" }}>CHECK →</button>
                    </div>
                  </>
                ) : (
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:8 }}>
                      <div style={{ width:7,height:7,borderRadius:"50%",background:N.sage }}/>
                      <p style={{ fontFamily:F.m, fontSize:9.5, letterSpacing:"0.14em", textTransform:"uppercase", color:N.sage }}>{fmtLong(gateDate)} · open</p>
                    </div>
                    <button onClick={()=>window.scrollTo({top: document.getElementById('pricing-tiers').offsetTop, behavior: 'smooth'})} style={{ fontFamily:F.m, fontWeight:400, fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:N.loko, borderBottom:`1px solid ${N.loko}`, padding:"4px 0", marginTop: 8 }}>View Packages ↓</button>
                  </div>
                )}
              </div>
              
              {/* Optional: Gallery Scroll Hint from Screenshot */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 24, opacity: 0.5 }}>
                <div style={{ width: 1, height: 24, background: N.fnt, marginBottom: 8 }}></div>
                <span style={{ fontFamily: F.m, fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: N.fnt }}>Gallery</span>
              </div>

            </div>
          </div>
        </section>

        {/* ════ SOCIAL PROOF (Matches Screenshot Bottom) ════ */}
        <section className="hero-drift d3" style={{ borderTop:`1px solid ${N.ln}`, borderBottom:`1px solid ${N.ln}`, padding:"40px clamp(20px, 5vw, 32px)", background: "transparent" }}>
          <div style={{ maxWidth:900, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:24 }}>
            {[["40+","Events shot"],["100%","Client satisfaction"],["Est. 2024","Carson & Long Beach"]].map(([n,l],i)=>(
              <div key={i} style={{ textAlign:"center", flex:"1 1 auto" }}>
                <p style={{ fontFamily:F.d, fontSize:"clamp(28px, 4vw, 42px)", fontWeight:300, color:N.hi, lineHeight:1, marginBottom:8 }}>{n}</p>
                <p style={{ fontFamily:F.m, fontSize:9, letterSpacing:"0.16em", textTransform:"uppercase", color:N.fnt }}>{l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ════ THE RHYTHMIC EXHIBITION TRACK ════ */}
        <section style={{ padding:"64px 0 40px" }}>
          <div style={{ padding:"0 clamp(20px, 5vw, 32px) 24px", display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:20 }}>
            <div style={{ display:"flex", gap:24, alignItems:"baseline" }}>
              {STYLES.map(s=>(
                <button key={s} onClick={()=>setStyleF(s)} style={{ fontFamily:F.d, fontSize: s===styleF?36:26, color: s===styleF?N.hi:N.fnt, transition:"all .3s ease", paddingBottom:6 }}>{s}</button>
              ))}
            </div>
          </div>

          <div ref={trackRef} className={`track grab`} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}>
            {visible.map((t)=>{
              if(t.isFootnote) {
                return (
                  <div key={t.id} className="titem" style={{ width: 400, flexShrink: 0, padding: "0 20px" }}>
                    <div style={{ width: 40, height: 1, background: N.loko, marginBottom: 24 }} />
                    <p style={{ fontFamily:"'Cormorant', serif", fontStyle: "italic", fontSize: 22, lineHeight: 1.6, color: N.mut }}>"{t.text}"</p>
                  </div>
                );
              }

              const width = t.style === "Signature" ? 340 : 280;

              return (
                <div key={t.id} onClick={()=>openDrawerForTemplate(t)} className="titem" style={{ width }}>
                  <div className="tier-card" style={{ padding:"40px 24px 32px", alignItems:"center", gap:32, boxShadow: `0 24px 50px ${N.shadow}` }}>
                    <div style={{ position:"absolute", top:24, left:24, display:"flex", alignItems:"baseline", gap:5 }}>
                      <span style={{ fontFamily:F.m, fontSize:10, color: N.fnt }}>{t.plate}</span>
                    </div>
                    <div style={{ position:"absolute", top:24, right:24 }}>
                      <span style={{ fontFamily:F.m, fontSize:7, letterSpacing:"0.12em", textTransform:"uppercase", color:N.fnt, borderBottom:`1px solid ${N.ln}`, padding:"2px 0" }}>{t.booth}</span>
                    </div>
                    <div style={{ marginTop:16 }}><Print t={t} height={t.ratio.h>t.ratio.w?280:180}/></div>
                    <div style={{ textAlign:"center" }}>
                      <Tag style={t.style}/>
                      <h3 style={{ fontFamily:F.d, fontSize:26, fontWeight:300, color:N.hi, marginTop:12, marginBottom:4 }}>{t.name}</h3>
                      <p style={{ fontFamily:F.m, fontSize:8.5, letterSpacing:"0.1em", color:N.fnt }}>{t.formatLabel}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{ flex:"0 0 24vw" }}></div>
          </div>
        </section>

        {/* ════ PRICING TIERS ════ */}
        <section id="pricing-tiers" style={{ padding: "clamp(64px,9vw,120px) clamp(20px,5vw,32px)", borderTop: `1px solid ${N.ln}` }}>
          <div style={{ maxWidth: 1100, margin: "0 auto 48px" }}>
            <p style={{ fontFamily: F.m, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: N.loko, marginBottom: 12 }}>Tiers</p>
            <h2 style={{ fontFamily: F.d, fontWeight: 300, fontSize: "clamp(32px, 4.5vw, 46px)", lineHeight: 1.04, color: N.hi }}>
              Two booths. Four ways to <em style={{ fontFamily:"'Cormorant', serif", fontStyle: "italic", color: N.mut }}>hold the night.</em>
            </h2>
          </div>
          
          <div className="pricing-grid">
            <div className="oak-sticky">
              <div style={{ border: `1px solid ${N.ln}`, background: "transparent", padding: 12 }}>
                <div style={{ width: "100%", aspectRatio: "3/4", background: N.l0, overflow: "hidden" }}>
                   <img src={OAK_B64} alt="Weathered Oak Booth" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.05) grayscale(20%)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 16 }}>
                  <span style={{ fontFamily: F.d, fontSize: 20, color: N.hi }}>The Oak Installation</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {[
                { name: 'Signature', price: '$949', booth: '◆ Oak Booth · 2×6 or 4×6', desc: 'Weathered oak booth, DSLR capture, archival cotton prints handed over in the room.' },
                { name: 'Editorial', price: '$1,149', booth: '◆ Oak Booth · 4×6', desc: 'The full build — oak booth, refined black-and-white retouching, every print hand-finished.', flag: true },
                { name: 'Modernist', price: '$749', booth: 'White Booth · 2×6 or 4×6', desc: 'The white shell booth, built for galleries, lofts, and modern rooms.' },
                { name: 'Monochrome', price: '$949', booth: 'White Booth · 4×6', desc: 'The white booth tuned for high-contrast black-and-white, razor frames that last.' }
              ].map((tier) => (
                <div key={tier.name} className={`tier-card ${tier.flag ? 'tier-flag' : ''}`} onClick={() => openDrawerForTier(tier.name, tier.price, tier.booth, tier.desc)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
                    <div>
                      <div style={{ fontFamily: F.d, fontWeight: 300, fontSize: 32, color: N.hi }}>{tier.name}</div>
                      <span style={{ fontFamily: F.m, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 10, display: "inline-block", color: tier.booth.includes('Oak') ? N.loko : N.fnt }}>{tier.booth}</span>
                    </div>
                    <div style={{ fontFamily: F.m, fontWeight: 400, fontSize: 32, color: N.hi }}>{tier.price}</div>
                  </div>
                  <p style={{ fontFamily: F.s, fontWeight: 400, fontSize: 18, color: N.mut, maxWidth: "42ch" }}>{tier.desc}</p>
                  <span className="tier-cta">Reserve Your Date →</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer style={{ padding:"64px 32px 48px", borderTop:`1px solid ${N.ln}` }}>
          <BrandMark size={48} mode="ecru" />
        </footer>
      </div>

      {/* ════ PURE CSS Z-DEPTH VAULT DRAWER ═════ */}
      <div className="vault-overlay" onClick={closeDrawer} />
        
      <div className="vault-drawer" style={{ backgroundImage: GRAIN }}>
        
        {selected && (
          <div className="fin">
            <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:40 }}>
              <button onClick={closeDrawer} style={{ fontFamily:F.s, fontWeight: 500, fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:N.mut }}>Close ✕</button>
            </div>

            {!confirmed ? (
              <>
                {selected.type === 'template' && (
                  <>
                    <div style={{ display:"flex", justifyContent:"center", marginBottom:40, padding:"48px 0", background:N.l1, borderRadius:"2px", border:`1px solid ${N.ln}` }}>
                      <Print t={selected.data} height={selected.data.ratio.h>selected.data.ratio.w?300:200}/>
                    </div>
                    <h2 style={{ fontFamily:F.d, fontSize:48, fontWeight:300, color:N.hi, lineHeight:1.08, marginBottom:16 }}>{selected.data.name}</h2>
                    <p style={{ fontFamily:F.s, fontWeight:400, fontSize:20, color:N.mut, lineHeight:1.6, marginBottom:32 }}>{selected.data.desc}</p>
                  </>
                )}

                {selected.type === 'tier' && (
                  <>
                    <div style={{ display:"flex", justifyContent:"center", alignItems: "center", marginBottom:40, padding:"64px 0", background:N.l1, border:`1px solid ${N.ln}` }}>
                      <BrandMark size={120} mode="ecru" />
                    </div>
                    <p style={{ fontFamily:F.m, fontSize:10, letterSpacing:"0.16em", textTransform:"uppercase", color:N.loko, marginBottom:8 }}>{selected.data.booth}</p>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom: 16 }}>
                      <h2 style={{ fontFamily:F.d, fontSize:48, fontWeight:300, color:N.hi }}>{selected.data.name}</h2>
                      <span style={{ fontFamily:F.m, fontSize:36, color:N.hi }}>{selected.data.price}</span>
                    </div>
                    <p style={{ fontFamily:F.s, fontWeight: 400, fontSize:20, color:N.mut, lineHeight:1.6, marginBottom:32 }}>{selected.data.desc}</p>
                  </>
                )}

                <div style={{ background:"transparent", padding:"40px 32px", border:`1px solid ${N.ln}` }}>
                  <p style={{ fontFamily:F.m, fontSize:10, letterSpacing:"0.16em", textTransform:"uppercase", color:N.hi, marginBottom:12 }}>Reserve this {selected.type === 'tier' ? 'package' : 'design'}</p>
                  
                  <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
                    {isDateSecured ? (
                      <div style={{ padding: "16px 20px", background: N.l1, border: `1px solid ${N.ln}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontFamily: F.m, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: N.sage, marginBottom: 4 }}>Date Secured</p>
                          <p style={{ fontFamily: F.s, fontWeight: 400, fontSize: 18, color: N.hi }}>{fmtLong(lead.date)}</p>
                        </div>
                        <button onClick={() => setL("date")("")} style={{ fontFamily: F.s, fontWeight: 500, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: N.fnt, borderBottom: `1px solid ${N.ln}` }}>Edit</button>
                      </div>
                    ) : (
                      <ThreadWire label="Event Date" type="date" value={lead.date} onChange={setL("date")} required />
                    )}
                    <ThreadWire label="Your Name" value={lead.name} onChange={setL("name")} placeholder="Marisol & Diego" required/>
                    <ThreadWire label="Email Address" type="email" value={lead.email} onChange={setL("email")} placeholder="you@email.com" required/>
                  </div>
                  
                  <button onClick={canSubmit?submit:undefined} disabled={isSubmitting} style={{ marginTop:48, width:"100%", padding:"16px", background: canSubmit?N.loko:"transparent", border:`1px solid ${canSubmit?N.loko:N.ln2}`, color: canSubmit?N.l0:N.hi, fontFamily:F.s, fontWeight: 500, fontSize:11, letterSpacing:"0.18em", textTransform:"uppercase", cursor: canSubmit?"pointer":"default" }}>
                    {isSubmitting ? "Holding Date..." : (canSubmit ? "Reserve Your Date →" : "Details to continue")}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign:"center", marginTop: 40 }}>
                <p style={{ fontFamily:F.m, fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:N.loko, marginBottom:14 }}>Your date is held</p>
                <h2 style={{ fontFamily:F.d, fontSize:44, fontWeight:300, color:N.hi, marginBottom:16 }}>Now, the <em style={{fontFamily:"'Cormorant', serif", fontStyle: "italic", color:N.mut}}>handoff.</em></h2>
                <p style={{ fontFamily:F.s, fontWeight: 400, fontSize:20, color:N.mut }}>Check your inbox to finish your reservation at your pace.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-06-30T03:51:36-07:00.
</ADDITIONAL_METADATA>