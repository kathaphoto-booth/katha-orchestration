'use client';

import { useState, useEffect, useRef, useMemo, useId } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { submitBooking } from '@/app/actions';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { KathaLogomark } from '@/app/components/KathaLogomark';
import { KathaWordmark } from '@/app/components/KathaWordmark';
import Image from 'next/image';
import { PRESETS } from '../lib/templates';
import { VIEWBOX } from '../lib/layouts';
import { Print, Tag } from './components/PrintCard';
import { TIERS, ADDONS } from '@/lib/tiers';
import { TierCard } from './components/TierCard';
import { ZDrawer } from './components/ZDrawer';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ════════════════════════════════════════════════════════════════
   KATHA · THE ROASTED ARCHIVE (FINAL PRODUCTION MASTER)
   
   Palette: Black Coffee surfaces, Piña Ecru light, Kobe thread.
   Fonts:   FH Ronaldson (Display), Cormorant (Italics), Courier Prime.
   
   UPGRADES:
   • Raster Injection: Using your true high-res transparent PNGs.
   • Barong Void: Subtle fabric texture layered into the background.
   • Smart Form Flow: Drawer adapts if the date is already secured.
   • Oak Anchor: Pricing grid stabilized with the physical booth image.
   ════════════════════════════════════════════════════════════════ */

const N = {
  l0:  "#161311",   // The Void (Darker than Black Coffee)
  l1:  "#211D1A",   // Intermediate shadow
  l2:  "#3D352E",   // Black Coffee (Physical Surfaces, Cards)
  l3:  "#4A4139",   // Lifted Black Coffee
  
  hi:  "#ECE7DB",   // Piña Ecru (Primary Light / Ink)
  ecru:"#ECE7DB",   // Piña Ecru
  mut: "#AAA8A2",   // Quick Silver (Body text)
  fnt: "#8F8C8A",   // Philippine Gray (Meta text)
  dim: "#8F8C8A",   // Philippine Gray

  loko:"#882D17",   // Kobe (The Sacred Thread / CTA)
  terra:"#794A33",  // Bole (Secondary warm accents)
  champ:"#ECE7DB",  // Piña Ecru
  sage:"#8F8C8A",   // Philippine Gray
  
  ln:  "rgba(236, 231, 219, 0.12)", // Piña Ecru translucent
  ln2: "rgba(236, 231, 219, 0.25)",
  glass: "rgba(255,255,255,0.03)",
  shadow:"rgba(0,0,0,0.85)",
};

const F = {
  d: "var(--font-fh-ronaldson-display), serif", 
  b: "'Cormorant', serif",                 
  m: "'Courier Prime', monospace",         
};

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`;

// Truncated Base64 for the Oak Image to keep the file fast (You can replace this with your actual image path like '/oak-booth.jpg')
const OAK_B64 = "https://images.unsplash.com/photo-1621245643448-4e86db703fc6?q=80&w=800&auto=format&fit=crop"; 
const BARONG_B64 = "https://images.unsplash.com/photo-1605273763365-d0de969eb2ec?q=80&w=1200&auto=format&fit=crop";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;1,400&family=Courier+Prime&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

html, body {
  background-color: ${N.l0} !important;
  color: ${N.hi};
  margin: 0; padding: 0;
  width: 100%;
  overflow-x: hidden;
}

#app { min-height: 100vh; background-color: ${N.l0}; }

/* ── Cinematic Entrance ── */
@keyframes weaveIn {from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn {from{opacity:0}to{opacity:1}}
@keyframes subtleFadeUp {
  0% { opacity: 0; transform: translateY(12px); filter: blur(4px); }
  100% { opacity: 1; transform: translateY(0); filter: blur(0px); }
}
@keyframes bridgeOut {0%{opacity:1} 70%{opacity:1; filter:blur(0px); transform:scale(1)} 100%{opacity:0; visibility:hidden; filter:blur(20px); transform:scale(1.08)}}
@keyframes letterSnap {
  0% { opacity: 0; filter: blur(20px); transform: scale(1.1) translateY(10px); }
  60% { opacity: 0.8; filter: blur(3px); }
  100% { opacity: 1; filter: blur(0px); transform: scale(1) translateY(0); }
}
@keyframes skeletonPulse {
  0% { opacity: 0.15; }
  50% { opacity: 0.3; }
  100% { opacity: 0.15; }
}
@keyframes pulseAlpha {
  0% { opacity: 0.3; transform: translateX(0px); }
  50% { opacity: 1; transform: translateX(4px); }
  100% { opacity: 0.3; transform: translateX(0px); }
}

.skeleton-pulse { animation: skeletonPulse 2s ease-in-out infinite; }

input,select,textarea,button{font-family:inherit;outline:none;}
input::placeholder{color:rgba(236,231,219,0.4);}
button{cursor:pointer;border:none;background:none;}

input[type=date] {
  color-scheme: dark;
  position: relative;
}
input[type=date]::-webkit-calendar-picker-indicator {
  position: absolute;
  right: 0;
  top: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  opacity: 0;
  cursor: pointer;
}
input[type=date]::-webkit-datetime-edit {
  color: #ECE7DB;
}
input[type=date]::-webkit-datetime-edit-fields-wrapper {
  padding: 0;
}
input[type=date]::-webkit-datetime-edit-text {
  color: rgba(236, 231, 219, 0.35);
  padding: 0 4px;
}
input[type=date]::-webkit-datetime-edit-month-field,
input[type=date]::-webkit-datetime-edit-day-field,
input[type=date]::-webkit-datetime-edit-year-field {
  color: #ECE7DB;
  transition: color 0.3s, background 0.3s;
}
input[type=date]::-webkit-datetime-edit-month-field:focus,
input[type=date]::-webkit-datetime-edit-day-field:focus,
input[type=date]::-webkit-datetime-edit-year-field:focus {
  background: #882D17;
  color: #fff;
}

/* ── The Rhythmic Track ── */
.track{display:flex;gap:48px;padding:16px clamp(20px, 5vw, 32px) 60px;overflow-x:auto;overflow-y:hidden;
  overscroll-behavior-x:contain;align-items:center;scrollbar-width:none;}
.track::-webkit-scrollbar{display:none;}
.titem{flex:0 0 auto;transition:transform .6s cubic-bezier(.16,1,.3,1);will-change:transform;}
.titem:hover{transform:translateY(-12px);}

/* ── Developer Fluid Hover Physics ── */
.pw { position: relative; overflow: hidden; transition: box-shadow .6s cubic-bezier(.16,1,.3,1), transform .6s cubic-bezier(.16,1,.3,1); }
.pw::after {
  content: ''; position: absolute; top: 0; left: -150%; width: 150%; height: 100%;
  background: linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.06) 50%, transparent 80%);
  transform: skewX(-20deg); transition: left 0.8s cubic-bezier(0.19, 1, 0.22, 1);
  pointer-events: none; z-index: 10;
}
.titem:hover .pw { box-shadow: 0 40px 80px ${N.shadow}, 0 12px 30px rgba(0,0,0,0.5); }
.titem:hover .pw::after { left: 150%; }

/* ── Pricing Grid & Cards ── */
.pricing-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 0.82fr 1fr; gap: 44px; align-items: start; }
.oak-sticky { position: sticky; top: 120px; }
.tier-card { 
  position: relative; background: ${N.l2}; border: 1px solid ${N.ln}; padding: 32px 36px; 
  display: flex; flex-direction: column; gap: 16px; 
  transition: transform .4s cubic-bezier(.16,1,.3,1), border-color .4s, background .4s; cursor: pointer; 
}
.tier-card:hover { transform: translateY(-4px); border-color: ${N.ln2}; background: ${N.l3}; }
.tier-cta { 
  font-family: ${F.m}; font-size: 10px; letter-spacing: .18em; text-transform: uppercase; color: ${N.loko}; 
  opacity: 0; transform: translateY(4px); transition: opacity .35s, transform .35s; 
  border-bottom: 1px solid ${N.loko}; padding-bottom: 3px; align-self: flex-start; 
}
.tier-card:hover .tier-cta { opacity: 1; transform: translateY(0); }
.tier-card.selected { border-color: ${N.loko}; background: ${N.l3}; }
.tier-card.selected .tier-cta { opacity: 1; transform: translateY(0); color: ${N.loko}; }
.tier-flag { border-color: rgba(236, 231, 219, 0.35); }
.tier-flag::before { 
  content: 'Flagship'; position: absolute; top: 0; right: 0; font-family: ${F.m}; font-size: 9px; 
  letter-spacing: .16em; text-transform: uppercase; color: ${N.l0}; background: ${N.hi}; padding: 6px 12px; 
}

@media(max-width: 820px) {
  .pricing-grid { grid-template-columns: 1fr; gap: 32px; }
  .oak-sticky { position: static; }
  .tier-card { padding: 24px 28px; }
}

/* ── Deep Z-Depth Vault Drawer ── */
#app{transition:transform .8s cubic-bezier(.16,1,.3,1), filter .8s ease, opacity .8s ease; transform-origin: center 20%; min-height: 100vh; position: relative;}
body.drawer #app{transform:scale(0.94) translateY(12px); filter:blur(8px) grayscale(40%); opacity:0.3; pointer-events:none;}
body.drawer{overflow:hidden;}
.grab{cursor:grab;} .grabbing{cursor:grabbing;}
`;

// ── CATALOG ──────────────────────────────────────────────────────
const STYLES = ["All", "Signature", "Classic"];
const FORMATS = [ { id:"All", label:"All" },{ id:"2x6", label:"2×6" },{ id:"4x6", label:"4×6" },{ id:"6x4land", label:"6×4 LAND" },{ id:"6x4sq", label:"6×4 SQ" } ];

// Print + Tag extracted to ./components/PrintCard.tsx

// ── The Thread Input ──
function ThreadWire({ label, type="text", value, onChange, placeholder, required, hint }: any) {
  const [f,setF]=useState(false);
  const id = useId();
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6, flex: "1 1 100%", minWidth:"180px", position:"relative" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
        <label htmlFor={id} style={{ fontFamily:F.m, fontSize:9, letterSpacing:"0.14em", textTransform:"uppercase", color:f?N.hi:N.fnt, transition:"color .3s" }}>
          {label}{required && <span style={{color:N.loko,marginLeft:3}}>*</span>}
        </label>
        {hint && <span style={{ fontFamily:F.m, fontSize:8, color:N.fnt }}>{hint}</span>}
      </div>
      <div style={{ position: "relative" }}>
        <input id={id} type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
          style={{ width:"100%", background:"transparent", border:"none", color:N.hi, padding:"12px 0", fontFamily:F.d, fontSize:22 }}
          onFocus={()=>setF(true)} onBlur={()=>setF(false)}/>
        {type === "date" && (
          <Calendar size={16} style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", color: f ? N.hi : N.fnt, pointerEvents: "none", transition: "color 0.3s" }} />
        )}
      </div>
      <div style={{ height:1, background:N.ln, position:"absolute", bottom:0, left:0, right:0 }}>
        <div style={{ height:"100%", background:N.loko, width:f?"100%":"0%", transition:"width 0.4s cubic-bezier(0.19, 1, 0.22, 1)" }}/>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
export default function App() {
  const router = useRouter();
  const [bridge, setBridge] = useState(true);
  const [styleF, setStyleF] = useState("All");
  const [fmtF, setFmtF] = useState("All");

  const [selected, setSelected] = useState<any>(null);
  const [drawer, setDrawer] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadId, setLeadId] = useState<string|null>(null);
  const [lead, setLead] = useState({ name:"", email:"", date:"", venue: "", tier: "", template: "", phone: "" });
  const setL = (k: string) => (v: string) => setLead(p=>({...p,[k]:v}));
  
  const canSubmit = lead.name && lead.email && lead.date;
  const submit = async ()=>{ 
    if(canSubmit) {
      setIsSubmitting(true);
      try {
        const payload = {
          name: lead.name,
          email: lead.email,
          event_date: lead.date,
          venue_name: lead.venue,
          tier_selected: lead.tier,
          template_selected: lead.template,
          addons: Object.keys(calcAddons).filter(k => calcAddons[k]).join(', ')
        };
        const res = await submitBooking(payload);
        if (res?.success) {
          setLeadId(res.lead?.id ?? null);
          setIsSuccess(true);
        } else {
          console.error("Booking failed:", res?.error);
        }
      } catch (error) {
        console.error("Booking failed:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const trackRef = useRef<HTMLDivElement>(null);

  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [calcTier, setCalcTier] = useState<string>("Signature");
  const [calcAddons, setCalcAddons] = useState<Record<string, boolean>>({});

  const calcTotal = (TIERS.find(t => t.id === calcTier)?.price ?? 0) + Object.entries(calcAddons).filter(a=>a[1]).reduce((sum, a) => sum + (ADDONS[a[0]] ?? 0), 0);

  // Bridge unmount is driven by the GSAP timeline's onComplete (see below) so the
  // dissolve always finishes before unmount on any device speed — no magic-number race.
  useEffect(()=>{ const t=setTimeout(()=>setTemplatesLoading(false), 1200); return ()=>clearTimeout(t); },[]);
  
  // body.drawer class now managed by ZDrawer component

  const visible = useMemo(()=>PRESETS.filter(t=>{
    const style = t.name.includes("Signature") ? "Signature" : "Classic";
    if(styleF!=="All" && style!==styleF) return false;
    return true;
  }),[styleF]);

  const openDrawerForTemplate = (t: any) => { 
    if(t.isFootnote) return; 
    setLead(p => ({ ...p, template: t.name }));
    setDrawer(true);
  };

  const openDrawerForTier = (name: string) => {
    setLead(p => ({ ...p, tier: name }));
    setDrawer(true);
  };

  const closeDrawer = ()=>{ setDrawer(false); setTimeout(()=>{ setIsSuccess(false); setIsSubmitting(false); }, 600); };

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (bridge) {
        const tl = gsap.timeline();
        tl.fromTo('.bridge-wordmark', 
          { opacity: 0, filter: 'blur(20px)', scale: 1.1, y: 10 },
          { opacity: 1, filter: 'blur(0px)', scale: 1, y: 0, duration: 2.4, ease: "power3.inOut" }
        )
        .to('.bridge-container',
          { opacity: 0, filter: 'blur(20px)', scale: 1.08, duration: 1.4, ease: "power2.inOut", onComplete: () => setBridge(false) },
          "+=0.8"
        );
      } else {
        gsap.fromTo('.gsap-entrance',
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.15 }
        );

        gsap.utils.toArray('.pricing-grid > div').forEach((card: any, i) => {
          gsap.fromTo(card,
            { opacity: 0, y: 40 },
            { 
              opacity: 1, y: 0, 
              duration: 1.2, 
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
              },
              delay: i * 0.15
            }
          );
        });
      }
    });
    
    mm.add("(prefers-reduced-motion: reduce)", () => {
      if (bridge) {
        // Reduced motion: skip the cinematic intro entirely (no race on the old 3800ms timer).
        setBridge(false);
      } else {
        gsap.set('.gsap-entrance', { opacity: 1, y: 0 });
        gsap.set('.pricing-grid > div', { opacity: 1, y: 0 });
      }
    });
  }, [bridge]);

  // Drawer animation now managed by ZDrawer component

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (!templatesLoading) {
        gsap.fromTo('.titem-image', 
          { opacity: 0, filter: "blur(4px)" },
          { opacity: 1, filter: "blur(0px)", duration: 1.2, ease: "power3.out", stagger: 0.1 }
        );
      }
    });
    
    mm.add("(prefers-reduced-motion: reduce)", () => {
      if (!templatesLoading) {
        gsap.set('.titem-image', { opacity: 1, filter: "blur(0px)" });
      }
    });
  }, [templatesLoading]);

  useGSAP(() => {
    const track = trackRef.current;
    if (!track) return;
    
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(track, { width: "max-content", overflow: "visible" });
      const scrollAmount = track.scrollWidth - window.innerWidth;
      
      if (scrollAmount > 0) {
        gsap.to(track, {
          x: -scrollAmount,
          ease: "none",
          scrollTrigger: {
            trigger: "#track-section",
            pin: true,
            scrub: 1,
            start: "top top",
            end: () => `+=${scrollAmount}`
          }
        });
      }
    });
  }, [visible]);

  // Determine if the date is fully secured to simplify the drawer form
  return (
    <div style={{ width: "100%", position: "relative", zIndex: 1 }}>
      <style>{CSS}</style>

      {/* ════ BACKGROUND VOID LAYER ════ */}
      <div style={{ 
        position: 'fixed', inset: 0, zIndex: -1, 
        backgroundImage: `url(${BARONG_B64}), ${GRAIN}`, 
        backgroundSize: 'cover, auto', 
        backgroundPosition: 'center, center', 
        opacity: 0.05, pointerEvents: 'none',
        filter: 'grayscale(100%) contrast(1.2)'
      }} />

      {/* ════ CINEMATIC ENTRANCE ═══════ */}
      {bridge && (
        <div className="bridge-container" style={{ position:"fixed", inset:0, zIndex:1000, background:N.l0,
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          
          <div className="bridge-wordmark" style={{ opacity: 0 }}>
            <KathaWordmark className="text-[#ECE7DB]" style={{ height: 64, width: 'auto' }} />
          </div>

        </div>
      )}

      <div id="app">
        {/* nav */}
        <nav style={{ position:"sticky", top:0, zIndex:200, padding:"24px clamp(20px, 5vw, 32px)", display:"flex",
          alignItems:"center", justifyContent:"space-between", background:`rgba(22, 19, 17, 0.85)`, backdropFilter:"blur(16px)",
          borderBottom:`1px solid ${N.ln}` }}>
          <KathaWordmark className="text-[#ECE7DB]" style={{ height: 26, width: 'auto' }} />
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <span style={{ fontFamily:F.m, fontSize:9, letterSpacing:"0.16em", textTransform:"uppercase", color:N.fnt }}>
              Southern California
            </span>
            <button onClick={() => { setDrawer(true); }} style={{ fontFamily: F.m, fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: N.hi, background: N.loko, padding: "8px 16px", borderRadius: "2px" }}>Inquire Now</button>
          </div>
        </nav>

        {/* ════ HERO ═══════ */}
        <section style={{ minHeight:"85vh", display:"flex", flexDirection:"column", justifyContent:"center",
          padding:"56px clamp(20px, 5vw, 32px) 40px", position:"relative", overflow:"hidden" }}>
          
          <div style={{ position:"absolute", right:"-10%", top:"10%", opacity:0.04, pointerEvents:"none", transform:"rotate(10deg)" }}>
            <KathaLogomark className="text-[#ECE7DB]" style={{ width: 800, height: 800 }} />
          </div>

          <div style={{ maxWidth:880, width:"100%", margin:"0 auto", position: "relative", zIndex: 10 }}>
            <p className="gsap-entrance" style={{ fontFamily:F.m, fontSize:9.5, letterSpacing:"0.22em", textTransform:"uppercase",
              color:N.loko, marginBottom:32, opacity: 0 }}>Katha Photo Booth · Southern California</p>

            {templatesLoading ? (
              <div className="skeleton-pulse" style={{ width: "80%", height: "clamp(60px, 11vw, 120px)", background: N.l1, borderRadius: "2px", marginBottom: 48 }} />
            ) : (
              <h1 className="gsap-entrance hero-h1" style={{ fontFamily:F.d, fontSize:"clamp(60px, 11vw, 120px)", fontWeight:300,
                letterSpacing:"-0.02em", lineHeight:0.95, color:N.hi, marginBottom:48, opacity: 0 }}>
                The frame<br/>your night<br/><em style={{fontFamily:F.b, fontStyle:"italic", color:N.mut, fontWeight:400, lineHeight: 1.1, paddingBottom: "4px"}}>lives in.</em>
              </h1>
            )}

            <div className="gsap-entrance" style={{ maxWidth:580, borderLeft:`2px solid ${N.loko}`, paddingLeft:28, marginLeft: 2, opacity: 0 }}>
              <p style={{ fontFamily:F.b, fontSize:"clamp(24px, 3vw, 28px)", fontStyle:"italic", color:N.mut, lineHeight:1.5, paddingBottom:"4px", marginBottom:40 }}>
                Eighty-two print designs, drawn by hand and held to one standard. Find the one that fits your event — we shape the details with you.
              </p>
              <button onClick={() => { setDrawer(true); }} style={{ fontFamily: F.m, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: N.hi, background: N.loko, padding: "16px 24px", borderRadius: "2px", border: `1px solid ${N.loko}` }}>
                Inquire Now →
              </button>
            </div>
          </div>
        </section>

        {/* ════ SOCIAL BAR ════ */}
        <section style={{ borderTop:`1px solid ${N.ln}`, borderBottom:`1px solid ${N.ln}`, padding:"40px clamp(20px, 5vw, 32px)", background: N.l1 }}>
          <div style={{ maxWidth:900, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:24 }}>
            {[["40+","Events shot"],["100%","Client satisfaction"],["Est. 2024","Carson & Long Beach"]].map(([n,l],i)=>(
              <div key={i} className="gsap-entrance" style={{ textAlign:"center", flex:"1 1 auto", opacity: 0 }}>
                {templatesLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div className="skeleton-pulse" style={{ width: 80, height: 36, background: N.l2, borderRadius: "2px", marginBottom: 8 }} />
                    <div className="skeleton-pulse" style={{ width: 120, height: 10, background: N.l2, borderRadius: "2px" }} />
                  </div>
                ) : (
                  <>
                    <p style={{ fontFamily:F.d, fontSize:"clamp(28px, 4vw, 36px)", fontWeight:300, color:N.hi, lineHeight:1, marginBottom:8 }}>{n}</p>
                    <p style={{ fontFamily:F.m, fontSize:8, letterSpacing:"0.16em", textTransform:"uppercase", color:N.fnt }}>{l}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ════ THE RHYTHMIC EXHIBITION TRACK ════ */}
        <section id="track-section" style={{ padding:"48px 0 40px", overflow: "hidden" }}>
          <div style={{ padding:"0 clamp(20px, 5vw, 32px) 24px", display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:20 }}>
            <div className="gsap-entrance" style={{ display:"flex", gap:24, alignItems:"baseline", opacity: 0 }}>
              {STYLES.map(s=>(
                <button key={s} onClick={()=>setStyleF(s)} style={{ fontFamily:F.d, fontSize: s===styleF?36:26,
                  color: s===styleF?N.hi:N.fnt, transition:"all .3s ease", paddingBottom:6 }}>{s}</button>
              ))}
            </div>
          </div>

          <div style={{ position: "relative" }}>
            {/* Scroll Glow Cues */}
            <div style={{ position:"absolute", left:0, top:0, bottom:0, width:120, background:`linear-gradient(to right, ${N.l0}, transparent)`, zIndex:2, pointerEvents:"none" }} />
            <div style={{ position:"absolute", right:0, top:0, bottom:0, width:120, background:`linear-gradient(to left, ${N.l0}, transparent)`, zIndex:2, pointerEvents:"none" }} />
            
            <div ref={trackRef} className={`track gsap-entrance`} style={{ opacity: 0 }}>
              {templatesLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={`skel-${i}`} className="titem" style={{ width: 280, flexShrink: 0 }}>
                    <div style={{ background:N.l2, borderRadius:"2px", borderTop:`1px solid ${N.glass}`, padding:"40px 24px 32px",
                      display:"flex", flexDirection:"column", alignItems:"center", gap:32, position:"relative",
                      boxShadow: `0 24px 60px ${N.shadow}` }}>
                      <div className="skeleton-pulse" style={{ width: "100%", height: 200, background: N.l1, borderRadius: "2px" }} />
                      <div className="skeleton-pulse" style={{ width: "60%", height: 16, background: N.l1, borderRadius: "2px", marginTop: 12 }} />
                      <div className="skeleton-pulse" style={{ width: "40%", height: 10, background: N.l1, borderRadius: "2px" }} />
                    </div>
                  </div>
                ))
              ) : visible.map((item, idx)=>{
                const t = item as any;
                const style = t.name.includes("Signature") ? "Signature" : "Classic";
                const formatLabel = t.type === 'strip' ? "2×6 Strip" : (t.type === 'postcard-vertical' ? "4×6 Postcard" : "6×4 Landscape");
                const sel = selected?.data?.id===t.id;
                const width = style === "Signature" ? 340 : 280;
                const vb = VIEWBOX[t.type as keyof typeof VIEWBOX];
                const printHeight = vb.h > vb.w ? 280 : 180;
  
                return (
                  <div key={t.id} onClick={()=>openDrawerForTemplate(t)} className="titem titem-image" style={{ width }}>
                    <div style={{ background:N.l2, borderRadius:"2px", borderTop:`1px solid ${sel?N.terra:N.glass}`, padding:"40px 24px 32px",
                      display:"flex", flexDirection:"column", alignItems:"center", gap:32, position:"relative",
                      boxShadow: `0 24px 60px ${N.shadow}` }}>
                      
                      <div style={{ marginTop:16 }}><Print t={t} height={printHeight}/></div>
                      
                      <div style={{ textAlign:"center" }}>
                        <Tag style={style}/>
                        <h3 style={{ fontFamily:F.d, fontSize:24, fontWeight:300, color:N.hi, marginTop:12, marginBottom:4 }}>{t.name}</h3>
                        <p style={{ fontFamily:F.m, fontSize:8.5, letterSpacing:"0.1em", color:N.fnt }}>{formatLabel}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div style={{ flex:"0 0 24vw" }}></div>
            </div>
          </div>

          <div className="gsap-entrance" style={{ textAlign:"center", padding:"16px 32px 0", opacity: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontFamily:F.m, fontSize:8.5, letterSpacing:"0.16em", textTransform:"uppercase", color:N.fnt }}>
              ↓ scroll to pan the exhibition ↓
            </span>
            <div style={{ animation: "pulseAlpha 2s infinite ease-in-out", marginTop: 12, transform: "rotate(90deg)" }}>
              <ChevronRight size={14} color={N.fnt} />
            </div>
          </div>
        </section>

        {/* ════ PRICING TIERS ════ */}
        <section id="pricing-tiers" style={{ padding: "clamp(64px,9vw,120px) clamp(20px,5vw,32px)", borderTop: `1px solid ${N.ln}` }}>
          <div style={{ maxWidth: 1100, margin: "0 auto 48px" }}>
            <p className="gsap-entrance" style={{ fontFamily: F.m, fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase", color: N.loko, marginBottom: 12, opacity: 0 }}>Tiers</p>
            <h2 className="gsap-entrance" style={{ fontFamily: F.d, fontWeight: 300, fontSize: "clamp(32px, 4.5vw, 46px)", lineHeight: 1.04, letterSpacing: "-0.02em", color: N.hi, maxWidth: "16ch", opacity: 0 }}>
              Two booths. Four ways to <em style={{ fontFamily: F.b, fontStyle: "italic", color: N.mut, lineHeight: 1.1, paddingBottom: "4px" }}>hold the night.</em>
            </h2>
          </div>
          
          <div className="pricing-grid gsap-entrance" style={{ opacity: 0 }}>
            <div className="oak-sticky">
              <div style={{ position: "relative", border: `1px solid ${N.ln}`, background: N.l2, padding: 12, boxShadow: `0 30px 70px ${N.shadow}` }}>
                {/* Physical Oak Booth Image */}
                <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", background: N.l0, overflow: "hidden", border: `1px solid ${N.glass}` }}>
                   <Image src={OAK_B64} alt="Weathered Oak Booth" fill style={{ objectFit: "cover", filter: "contrast(1.04) saturate(0.96)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 16, padding: "0 4px" }}>
                  <span style={{ fontFamily: F.d, fontSize: 20, color: N.hi }}>The Oak Installation</span>
                  <span style={{ fontFamily: F.m, fontSize: 8.5, letterSpacing: "0.14em", textTransform: "uppercase", color: N.fnt }}>Carson · Long Beach</span>
                </div>
              </div>

              {/* Estimate Request Calculator */}
              <div style={{ marginTop: 24, padding: 24, background: N.l1, border: `1px solid ${N.ln}`, borderRadius: "2px" }}>
                <h3 style={{ fontFamily: F.m, fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: N.hi, marginBottom: 16 }}>Estimate Summary</h3>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontFamily: F.b, fontSize: 16, color: N.mut }}>{calcTier} Package</span>
                  <span style={{ fontFamily: F.m, fontSize: 14, color: N.hi }}>${TIERS.find(t => t.id === calcTier)?.price ?? 0}</span>
                </div>
                
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${N.ln}`, display: "flex", flexDirection: "column", gap: 12 }}>
                  {Object.entries(ADDONS).map(([name, price]) => (
                    <label key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", userSelect: "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 16, height: 16, border: `1px solid ${calcAddons[name] ? N.loko : N.ln}`, background: calcAddons[name] ? N.loko : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '1px' }}>
                          {calcAddons[name] && <div style={{ width: 8, height: 8, background: '#fff' }} />}
                        </div>
                        <span style={{ fontFamily: F.b, fontSize: 16, color: calcAddons[name] ? N.hi : N.mut }}>{name}</span>
                      </div>
                      <span style={{ fontFamily: F.m, fontSize: 12, color: N.mut }}>+${price}</span>
                      <input type="checkbox" checked={!!calcAddons[name]} onChange={() => setCalcAddons(p => ({ ...p, [name]: !p[name] }))} style={{ display: 'none' }} />
                    </label>
                  ))}
                </div>

                <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${N.ln}`, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: F.m, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: N.mut }}>Total</span>
                  <span style={{ fontFamily: F.d, fontSize: 28, color: N.hi }}>${calcTotal.toLocaleString()}</span>
                </div>

                <button onClick={() => openDrawerForTier(calcTier)} style={{ marginTop: 24, width: "100%", padding: "16px", background: N.loko, border: `none`, color: "#FFF", fontFamily: F.m, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", transition: "all .4s" }}>
                  Inquire Now →
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {TIERS.map(t => (
                <TierCard key={t.id} tier={t} selected={calcTier === t.id} onSelect={() => setCalcTier(t.id)} />
              ))}
            </div>
          </div>
        </section>

        {/* ════ FOOTER ════ */}
        <footer style={{ padding:"64px clamp(20px, 5vw, 32px) 48px", borderTop:`1px solid ${N.ln}`, display:"flex",
          justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:20 }}>
          <div>
            <KathaWordmark className="text-[#ECE7DB]" style={{ height: 32, width: 'auto' }} />
            <p style={{ fontFamily:F.m, fontSize:9, letterSpacing:"0.16em", textTransform:"uppercase", color:N.fnt, marginTop:20 }}>Southern California</p>
            <p style={{ fontFamily:F.m, fontSize:9, letterSpacing:"0.12em", color:N.mut, marginTop:8 }}>
              kathabooth@gmail.com</p>
          </div>
          <p style={{ fontFamily:F.m, fontSize:8.5, letterSpacing:"0.1em", textTransform:"uppercase", color:N.fnt }}>© 2026 Katha Studio</p>
        </footer>
      </div>

      {/* ════ DEEP Z-DEPTH VAULT DRAWER ═════ */}
      <ZDrawer open={drawer} onClose={closeDrawer}>
        <div style={{ padding: "48px clamp(24px, 5vw, 48px)", minHeight: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", marginBottom:32 }}>
              <button onClick={closeDrawer} style={{ fontFamily:F.m, fontSize:9.5, letterSpacing:"0.14em", textTransform:"uppercase", color:N.mut }}>Close ✕</button>
            </div>

            {!isSuccess ? (
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <h2 style={{ fontFamily:F.d, fontSize:48, fontWeight:300, color:N.hi, lineHeight:1.08, marginBottom:8 }}>
                  Frictionless Intake
                </h2>
                <p style={{ fontFamily:F.b, fontSize:20, fontStyle:"italic", color:N.mut, lineHeight:1.5, marginBottom:40 }}>
                  Enter your details to log the lead and continue to your template.
                </p>

                <div style={{ display:"flex", flexDirection:"column", gap:32, flex: 1 }}>
                  <ThreadWire label="Your Name" value={lead.name} onChange={setL("name")} placeholder="Marisol & Diego" required/>
                  <ThreadWire label="Email Address" type="email" value={lead.email} onChange={setL("email")} placeholder="you@email.com" required/>
                  <ThreadWire label="Event Date" type="date" value={lead.date} onChange={setL("date")} required/>
                  <ThreadWire label="Venue Name & City (Optional)" value={lead.venue} onChange={setL("venue")} placeholder="The Fig House, Los Angeles" />
                </div>

                <div style={{ marginTop: 40, display: "flex", gap: 16 }}>
                  <button onClick={submit} disabled={!canSubmit || isSubmitting} style={{ padding: "16px", flex: 2, background: canSubmit ? N.loko : "transparent", border:`1px solid ${canSubmit ? N.loko : N.glass}`, color: canSubmit ? "#FFF" : N.fnt, fontFamily:F.m, fontSize:10.5, letterSpacing:"0.18em", textTransform:"uppercase", transition: "all .3s" }}>
                    {isSubmitting ? "Submitting..." : "Submit Inquiry →"}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", borderTop: `1px solid ${N.ln}`, borderBottom: `1px solid ${N.ln}`, padding: "64px 0" }}>
                <div style={{ textAlign:"left", marginBottom:48 }}>
                  <p style={{ fontFamily:F.m, fontSize:11, letterSpacing:"0.25em", textTransform:"uppercase", color:N.loko, marginBottom:24 }}>// Status: Secured</p>
                  <h2 style={{ fontFamily:F.d, fontSize:56, fontWeight:300, color:N.hi, lineHeight:1.05, marginBottom:24 }}>
                    Request <br/><em style={{fontFamily:F.b, fontStyle:"italic", color:N.mut}}>Received.</em>
                  </h2>
                  <div style={{ width: "100%", height: "1px", background: N.ln, marginBottom: 24 }}></div>
                  <p style={{ fontFamily:F.m, fontSize:14, color:N.mut, lineHeight:1.6, maxWidth: "40ch" }}>
                    Thank you, {lead.name}. We have logged your inquiry and will be in touch shortly.
                  </p>
                </div>
                <button onClick={() => { if (leadId) router.push(`/portal/${leadId}/template-design`); }} style={{ marginTop:20, width:"100%", padding:"20px", background:"transparent", border:`1px solid ${N.hi}`,
                  color:N.hi, fontFamily:F.m, fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", transition: "all 0.3s" }}
                  onMouseOver={(e) => { e.currentTarget.style.background = N.hi; e.currentTarget.style.color = N.l0; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = N.hi; }}>
                  Proceed to Portal →
                </button>
              </div>
            )}
          </div>
        </div>
      </ZDrawer>
    </div>
  );
}
