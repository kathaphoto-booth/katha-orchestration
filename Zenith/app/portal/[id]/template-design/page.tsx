'use client';

import { useState, use } from 'react';
import { KathaWordmark } from '@/app/components/KathaWordmark';
import { Upload, X } from 'lucide-react';

const N = { l0:"#0F0D0C", l1:"#13100E", l2:"#161311", l3:"#1A1715", hi:"#ECE7DB", dim:"#A6A092", mut:"#8F8C8A", fnt:"#5C5750", ln:"rgba(236, 231, 219, 0.12)", ln2:"rgba(236, 231, 219, 0.05)", loko:"#9B4B32", shadow:"rgba(0,0,0,0.4)" };
const F = { d:"'FH Ronaldson Display Test', serif", b:"'Cormorant', serif", m:"'Courier Prime', monospace" };

export default function TemplateDesignClient({ params }: { params: Promise<{ id: string }> }) {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const resolvedParams = use(params);
  
  return (
    <div style={{ minHeight: "100vh", backgroundColor: N.l0, color: N.hi, padding: "32px clamp(20px, 5vw, 48px)" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 64, borderBottom: `1px solid ${N.ln}`, paddingBottom: 24 }}>
        <KathaWordmark className="text-[#ECE7DB]" style={{ height: 20, width: "auto" }} />
        <span style={{ fontFamily: F.m, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: N.fnt }}>
          Design Portal / {resolvedParams.id}
        </span>
      </nav>

      <header style={{ maxWidth: 640, marginBottom: 80, animation: "fadeIn 1s ease both" }}>
        <h1 style={{ fontFamily: F.d, fontSize: 44, fontWeight: 300, color: N.hi, lineHeight: 1.05, marginBottom: 16 }}>
          Select your <em style={{ fontFamily: F.b, fontStyle: "italic", color: N.mut }}>blueprint.</em>
        </h1>
        <p style={{ fontFamily: F.b, fontSize: 20, fontStyle: "italic", color: N.mut, lineHeight: 1.6 }}>
          Browse the text-free design thumbnails below. Select a structure, upload your reference photos, and we will set the typography for you.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 32, animation: "subtleFadeUp 1.2s ease both" }}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} onClick={() => setSelectedTemplate(i)} className="group" style={{ cursor: "pointer", position: "relative", background: N.l1, padding: 16, border: `1px solid ${N.ln}` }}>
             <div style={{ width: "100%", aspectRatio: "2/3", background: N.l2, border: `1px solid ${N.ln}`, display: "flex", flexDirection: "column", gap: 8, padding: 12 }}>
                {i % 2 === 0 ? (
                  <>
                    <div style={{ flex: 1, background: N.l0, border: `1px solid ${N.ln}` }} />
                    <div style={{ flex: 1, background: N.l0, border: `1px solid ${N.ln}` }} />
                    <div style={{ flex: 1, background: N.l0, border: `1px solid ${N.ln}` }} />
                  </>
                ) : (
                  <>
                    <div style={{ flex: 1, background: N.l0, border: `1px solid ${N.ln}` }} />
                    <div style={{ flex: 1, background: N.l0, border: `1px solid ${N.ln}` }} />
                  </>
                )}
             </div>
             <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               <span style={{ fontFamily: F.m, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: N.mut }}>Preset {i.toString().padStart(3, '0')}</span>
               <span style={{ fontFamily: F.m, fontSize: 9, color: N.fnt }}>{i % 2 === 0 ? "2×6 Strip" : "4×6 Card"}</span>
             </div>
          </div>
        ))}
      </div>

      {selectedTemplate && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "fadeIn 0.3s ease" }}>
          <div style={{ width: "100%", maxWidth: 500, background: N.l2, border: `1px solid ${N.ln}`, padding: 40, position: "relative" }}>
            <button onClick={() => setSelectedTemplate(null)} style={{ position: "absolute", top: 24, right: 24, color: N.mut }}>
              <X size={20} />
            </button>
            
            <h2 style={{ fontFamily: F.d, fontSize: 32, fontWeight: 300, color: N.hi, marginBottom: 8 }}>Customize Preset {selectedTemplate.toString().padStart(3, '0')}</h2>
            <p style={{ fontFamily: F.b, fontStyle: "italic", fontSize: 18, color: N.mut, marginBottom: 32 }}>Upload your reference photos and styling notes.</p>
            
            <div style={{ width: "100%", height: 160, background: N.l1, border: `1px dashed ${N.fnt}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, cursor: "pointer", marginBottom: 24 }}>
              <Upload size={24} color={N.mut} />
              <span style={{ fontFamily: F.m, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: N.mut }}>Select Photos</span>
            </div>
            
            <textarea placeholder="e.g. Please use the serif font for our names..." style={{ width: "100%", height: 100, background: N.l1, border: `1px solid ${N.ln}`, padding: 16, color: N.hi, fontFamily: F.m, fontSize: 12, marginBottom: 24, resize: "none" }} />
            
            <button style={{ width: "100%", padding: "16px", background: N.loko, border: `1px solid ${N.loko}`, color: "#FFF", fontFamily: F.m, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase" }}>
              Submit Preferences →
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes subtleFadeUp { 0% { opacity: 0; transform: translateY(12px); } 100% { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}
