
# KATHA PHOTO BOOTH — MOODY HERITAGE MINIMALIST BOOKING PIPELINE (COUNCIL ONE-SHOT)

---

## 1. REACT COMPONENT BLUEPRINT

```tsx
"use client";

import React, { useState, useTransition } from "react";
import { submitLeadAction } from "./actions";

type PipelineState = "gateDate" | "gateStatus" | "tierSelect" | "lead" | "confirmed";

interface FormFields {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  eventType: string;
  location: string;
  selectedPackage: string;
}

export default function BookingPipeline() {
  const [pipelineState, setPipelineState] = useState<PipelineState>("gateDate");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [dateAvailabilityError, setDateAvailabilityError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [formFields, setFormFields] = useState<FormFields>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    eventType: "editorial",
    location: "",
    selectedPackage: "",
  });

  const [formError, setFormError] = useState<string | null>(null);

  const handleDateCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      setDateAvailabilityError("Please select a date.");
      return;
    }
    setDateAvailabilityError(null);
    setPipelineState("gateStatus");

    setTimeout(() => {
      setPipelineState("tierSelect");
    }, 1500);
  };

  const handleTierSelect = (tier: string) => {
    setFormFields((prev) => ({ ...prev, selectedPackage: tier }));
    setPipelineState("lead");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const formData = new FormData();
    formData.append("eventDate", selectedDate);
    formData.append("firstName", formFields.firstName);
    formData.append("lastName", formFields.lastName);
    formData.append("email", formFields.email);
    formData.append("phone", formFields.phone);
    formData.append("eventType", formFields.eventType);
    formData.append("location", formFields.location);
    formData.append("selectedPackage", formFields.selectedPackage);

    startTransition(async () => {
      const response = await submitLeadAction(formData);
      if (response.success) {
        setPipelineState("confirmed");
      } else {
        setFormError(response.error || "An error occurred during submission.");
      }
    });
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-[#110F0D] text-[#E8E1D3] overflow-hidden font-sans antialiased">
      {/* Animated Weave Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        <svg className="w-full h-full" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path className="weave-strand" d="M-100,200 Q300,50 700,450 T1500,700" stroke="rgba(232, 225, 211, 0.06)" strokeWidth="1.5" />
          <path className="weave-strand" d="M-50,600 Q400,850 800,300 T1600,100" stroke="rgba(232, 225, 211, 0.06)" strokeWidth="1.5" style={{ animationDelay: "-4s" }} />
          <path className="weave-strand" d="M100,-100 Q600,400 900,150 T1300,1000" stroke="rgba(232, 225, 211, 0.06)" strokeWidth="1" style={{ animationDelay: "-8s" }} />
        </svg>
      </div>

      <section className="relative z-10 w-full md:w-[60vw] md:h-screen md:sticky md:top-0 bg-[#110F0D] p-8 md:p-24 flex flex-col justify-between select-none border-b md:border-b-0 md:border-r border-[#5C554C]/25">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#857D71]">Katha Photo Booth // Southern California</span>
        </div>

        <div className="my-16 md:my-0 cinematic-fade-up">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-normal leading-[0.95] tracking-tighter text-[#E8E1D3]">
            Heritage <br /> Minimalism, <br /> Captured.
          </h1>
          <p className="mt-8 text-base md:text-lg text-[#A39B8E] max-w-md font-light leading-relaxed">
            Crafting raw, high-contrast, editorial portraits rooted in authentic Filipino cultural expressions. Serving exclusive private commissions.
          </p>
        </div>

        <div className="flex flex-row justify-between items-center text-xs font-mono text-[#857D71] border-t border-[#5C554C]/25 pt-6">
          <span>PLATE NO. 2026-CF</span>
          <span>©2026 KATHA BOOTH</span>
        </div>
      </section>

      <section className="relative z-10 w-full md:w-[40vw] min-h-[100dvh] bg-[#1A1714] p-6 md:p-16 flex items-center justify-center">
        <div className="w-full max-w-md cinematic-fade-up" style={{ animationDelay: "150ms" }}>
          <div className="relative p-[0.375rem] bg-[#1A1714] border border-[rgba(232,225,211,0.06)] rounded-[2rem] shadow-2xl">
            <div className="bg-[#241F1B] rounded-[calc(2rem-0.375rem)] shadow-[inset_0_1px_1px_rgba(232,225,211,0.04)] p-8">
              
              {pipelineState === "gateDate" && (
                <form onSubmit={handleDateCheck} className="space-y-8 cinematic-fade-up">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#857D71]">Step 01 / Inquiry Gate</span>
                    <h2 className="mt-2 font-serif text-2xl text-[#E8E1D3] leading-snug">Verify Date Availability</h2>
                    <p className="mt-2 text-xs text-[#A39B8E] leading-relaxed">We accept limited dates to maintain editorial quality. Check if your event date is open.</p>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="gate-date" className="block text-[11px] font-mono uppercase tracking-wider text-[#857D71]">Requested Date</label>
                    <input id="gate-date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-[#1A1714] border-b border-[#5C554C] focus:border-[#9A3D2A] text-[#E8E1D3] font-mono text-sm py-3 outline-none transition-colors" required />
                    {dateAvailabilityError && <p className="text-xs text-[#9A3D2A] font-mono mt-1">{dateAvailabilityError}</p>}
                  </div>
                  <button type="submit" className="magnetic-button group relative w-full h-14 bg-[#9A3D2A] hover:bg-[#a9432f] active:scale-[0.98] text-[#E8E1D3] font-sans font-medium text-sm rounded-full pl-6 pr-3 flex items-center justify-between transition-all duration-300 shadow-lg">
                    <span>Check Availability</span>
                    <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.05] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                    </span>
                  </button>
                </form>
              )}

              {pipelineState === "gateStatus" && (
                <div className="flex flex-col items-center justify-center py-16 space-y-6 cinematic-fade-up">
                  <div className="relative w-12 h-12"><div className="absolute inset-0 rounded-full border-2 border-[#5C554C]/35"></div><div className="absolute inset-0 rounded-full border-2 border-t-[#9A3D2A] animate-spin"></div></div>
                  <div className="text-center"><span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#857D71]">Cross-Referencing Registers</span><p className="mt-2 text-sm font-light text-[#E8E1D3]">Securing date window...</p></div>
                </div>
              )}

              {pipelineState === "tierSelect" && (
                <div className="space-y-8 cinematic-fade-up">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#857D71]">Step 02 / Tier List</span>
                    <h2 className="mt-2 font-serif text-2xl text-[#E8E1D3] leading-snug">Select Package Edition</h2>
                    <p className="mt-2 text-[11px] font-mono text-[#A39B8E]">Date Secured: {selectedDate}</p>
                  </div>
                  <div className="space-y-4">
                    <button onClick={() => handleTierSelect("Signature Edition")} className="w-full text-left bg-[#1A1714] border border-[#5C554C]/50 hover:border-[#9A3D2A] transition-colors rounded-xl p-5 group flex flex-col">
                      <div className="flex justify-between items-center w-full"><h3 className="font-serif text-lg text-[#E8E1D3] group-hover:text-[#9A3D2A] transition-colors">Signature Edition</h3><span className="font-mono text-xs text-[#857D71]">33 Designs</span></div>
                      <p className="text-xs text-[#A39B8E] mt-2 font-light leading-relaxed">Licensed luxury typography (IvyMode/Proxima Nova). Deeply custom editorial compositions. Includes live web portal.</p>
                    </button>
                    <button onClick={() => handleTierSelect("Classic Edition")} className="w-full text-left bg-[#1A1714] border border-[#5C554C]/50 hover:border-[#9A3D2A] transition-colors rounded-xl p-5 group flex flex-col">
                      <div className="flex justify-between items-center w-full"><h3 className="font-serif text-lg text-[#E8E1D3] group-hover:text-[#9A3D2A] transition-colors">Classic Edition</h3><span className="font-mono text-xs text-[#857D71]">49 Designs</span></div>
                      <p className="text-xs text-[#A39B8E] mt-2 font-light leading-relaxed">Timeless layouts focusing on fundamental contrast and composition. Free Google Fonts (Playfair Display/Outfit).</p>
                    </button>
                  </div>
                </div>
              )}

              {pipelineState === "lead" && (
                <form onSubmit={handleFormSubmit} className="space-y-6 cinematic-fade-up">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#857D71]">Step 03 / Details</span>
                    <h2 className="mt-1 font-serif text-2xl text-[#E8E1D3]">Inquiry Application</h2>
                    <p className="text-[11px] text-[#A39B8E] mt-1 font-mono">Date Secured: {selectedDate} / {formFields.selectedPackage}</p>
                  </div>
                  {formError && <div className="p-3 bg-[#9A3D2A]/10 border border-[#9A3D2A]/30 text-[#E8E1D3] text-xs font-mono rounded">{formError}</div>}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative border-b border-[#5C554C] focus-within:border-[#9A3D2A] transition-colors py-2"><input type="text" name="firstName" id="firstName" required value={formFields.firstName} onChange={handleInputChange} placeholder=" " className="peer w-full bg-transparent border-none text-[#E8E1D3] focus:ring-0 outline-none text-sm pt-4 pb-1" /><label htmlFor="firstName" className="absolute left-0 top-4 text-xs text-[#857D71] transition-all duration-300 transform -translate-y-4 scale-75 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-[#E8E1D3]">First Name</label></div>
                    <div className="relative border-b border-[#5C554C] focus-within:border-[#9A3D2A] transition-colors py-2"><input type="text" name="lastName" id="lastName" required value={formFields.lastName} onChange={handleInputChange} placeholder=" " className="peer w-full bg-transparent border-none text-[#E8E1D3] focus:ring-0 outline-none text-sm pt-4 pb-1" /><label htmlFor="lastName" className="absolute left-0 top-4 text-xs text-[#857D71] transition-all duration-300 transform -translate-y-4 scale-75 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-[#E8E1D3]">Last Name</label></div>
                  </div>
                  <div className="relative border-b border-[#5C554C] focus-within:border-[#9A3D2A] transition-colors py-2"><input type="email" name="email" id="email" required value={formFields.email} onChange={handleInputChange} placeholder=" " className="peer w-full bg-transparent border-none text-[#E8E1D3] focus:ring-0 outline-none text-sm pt-4 pb-1" /><label htmlFor="email" className="absolute left-0 top-4 text-xs text-[#857D71] transition-all duration-300 transform -translate-y-4 scale-75 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-[#E8E1D3]">Email Address</label></div>
                  <div className="relative border-b border-[#5C554C] focus-within:border-[#9A3D2A] transition-colors py-2"><input type="tel" name="phone" id="phone" required value={formFields.phone} onChange={handleInputChange} placeholder=" " className="peer w-full bg-transparent border-none text-[#E8E1D3] focus:ring-0 outline-none text-sm pt-4 pb-1" /><label htmlFor="phone" className="absolute left-0 top-4 text-xs text-[#857D71] transition-all duration-300 transform -translate-y-4 scale-75 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-[#E8E1D3]">Phone Number</label></div>
                  <div className="relative border-b border-[#5C554C] focus-within:border-[#9A3D2A] transition-colors py-2"><select name="eventType" id="eventType" value={formFields.eventType} onChange={handleInputChange} className="w-full bg-transparent border-none text-[#E8E1D3] focus:ring-0 outline-none text-sm pt-4 pb-1 appearance-none cursor-pointer"><option value="editorial" className="bg-[#241F1B] text-[#E8E1D3]">Editorial Session</option><option value="private-commission" className="bg-[#241F1B] text-[#E8E1D3]">Private Commission</option><option value="cultural-soiree" className="bg-[#241F1B] text-[#E8E1D3]">Cultural Soirée</option></select><label htmlFor="eventType" className="absolute left-0 top-4 text-xs text-[#857D71] transition-all duration-300 transform -translate-y-4 scale-75 origin-[0]">Session Type</label></div>
                  <div className="relative border-b border-[#5C554C] focus-within:border-[#9A3D2A] transition-colors py-2"><input type="text" name="location" id="location" required value={formFields.location} onChange={handleInputChange} placeholder=" " className="peer w-full bg-transparent border-none text-[#E8E1D3] focus:ring-0 outline-none text-sm pt-4 pb-1" /><label htmlFor="location" className="absolute left-0 top-4 text-xs text-[#857D71] transition-all duration-300 transform -translate-y-4 scale-75 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-[#E8E1D3]">Event Location (City/Venue)</label></div>
                  <button type="submit" disabled={isPending} className="magnetic-button group relative mt-4 w-full h-14 bg-[#9A3D2A] hover:bg-[#a9432f] active:scale-[0.98] disabled:opacity-50 text-[#E8E1D3] font-sans font-medium text-sm rounded-full pl-6 pr-3 flex items-center justify-between transition-all duration-300 shadow-lg"><span>{isPending ? "Submitting Request..." : "Request Commission"}</span><span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.05] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></span></button>
                </form>
              )}

              {pipelineState === "confirmed" && (
                <div className="space-y-8 py-4 text-center cinematic-fade-up">
                  <div className="w-16 h-16 bg-[#9A3D2A]/10 border border-[#9A3D2A]/30 rounded-full flex items-center justify-center mx-auto text-[#9A3D2A]"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                  <div className="space-y-3"><span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#857D71]">Application Ingested</span><h2 className="font-serif text-3xl text-[#E8E1D3]">Inquiry Filed</h2><p className="text-xs text-[#A39B8E] leading-relaxed max-w-sm mx-auto">Your details have been successfully written to our registry. An editorial overview proposal has been dispatched to <span className="text-[#E8E1D3] font-mono">{formFields.email}</span>.</p></div>
                  <div className="border-t border-[#5C554C]/25 pt-6 font-mono text-[10px] text-left space-y-2 text-[#857D71]"><div className="flex justify-between"><span>SYSTEM LOG</span><span className="text-[#E8E1D3]">INGEST_OK</span></div><div className="flex justify-between"><span>CLIENT STAMP</span><span className="text-[#E8E1D3] uppercase">{formFields.lastName}, {formFields.firstName[0]}.</span></div><div className="flex justify-between"><span>SECURED DATE</span><span className="text-[#E8E1D3]">{selectedDate}</span></div><div className="flex justify-between"><span>TIER SELECTION</span><span className="text-[#E8E1D3] uppercase">{formFields.selectedPackage}</span></div></div>
                  <button onClick={() => { setPipelineState("gateDate"); setSelectedDate(""); setFormFields({firstName: "", lastName: "", email: "", phone: "", eventType: "editorial", location: "", selectedPackage: ""}); }} className="w-full h-12 border border-[#5C554C] hover:border-[#E8E1D3] text-[#E8E1D3] hover:bg-[#E8E1D3]/5 font-sans font-medium text-xs rounded-full transition-all duration-300">Return to Registry Check</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
```

---

## 2. SERVER ACTIONS

```typescript
"use server";

export async function submitLeadAction(formData: FormData) {
  const payload = {
    client_name: `${formData.get("firstName")} ${formData.get("lastName")}`.trim(),
    client_email: formData.get("email") as string,
    client_phone: formData.get("phone") as string,
    event_date: formData.get("eventDate") as string,
    event_type: formData.get("eventType") as string,
    venue: formData.get("location") as string,
    selected_package: formData.get("selectedPackage") as string,
  };

  try {
    const baseUrl = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const res = await fetch(`${baseUrl}/api/inquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: 'no-store'
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.error || `HTTP error! status: ${res.status}` };
    }

    const data = await res.json();
    return { success: true, leadHash: data.lead_hash };
  } catch (error: any) {
    console.error("Submission failed:", error);
    return { success: false, error: "Network failure. Please try again." };
  }
}
```

---

## 3. EMAIL HTML & ROUTE FIXES

Add to `/api/inquiry/route.ts` the `selected_package` field parsing, and update the Resend `htmlBody` template to match the Moody Heritage palette:

```html
    <div style="font-family:'Hanken Grotesk', Georgia, serif; max-width:600px; margin:0 auto; padding:40px; background-color:#110F0D; color:#EAE2D5; line-height:1.6; border-radius:0;">
      <p style="font-family:'Courier Prime', monospace; font-size:10px; text-transform:uppercase; letter-spacing:0.25em; color:#857D71; margin-bottom: 30px;">
        Katha Photo Booth
      </p>
      
      <h2 style="font-family:'FH Ronaldson Display Test', Georgia, serif; font-weight:400; font-size:24px; letter-spacing:-0.01em; margin-bottom: 24px; color:#E8E1D3;">
        Choose your template.
      </h2>
      
      <p style="font-size:16px; margin-bottom:20px;">
        Dear ${payload.client_name},
      </p>
      
      <p style="font-size:16px; margin-bottom:20px;">
        Thank you for reaching out to Katha. We have recorded your event inquiry for <strong>${payload.event_date}</strong>.
      </p>
      
      <p style="font-size:16px; margin-bottom:30px;">
        To tailor the backdrop, layout geometry, and typography to your event, choose your template below.
      </p>
      
      <div style="margin-bottom:35px; text-align:center;">
        <a href="${galleryLink}" style="display:inline-block; font-family:'Outfit', sans-serif; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.15em; background-color:#9A3D2A; color:#EAE2D5; padding:16px 32px; text-decoration:none; border-radius:9999px;">
          Select Your Template Style
        </a>
      </div>
      
      <p style="font-size:14px; color:#A39B8E; margin-top:40px; border-top:1px dashed #5C554C; padding-top:20px; font-style:italic;">
        Details, fonts, and print outlines are fully adjustable. At your own pace, choose the blueprint that speaks to you.
      </p>
      
      <p style="margin-top:30px; font-family:'Courier Prime', monospace; font-size:11px; text-transform:uppercase; letter-spacing:0.1em; color:#857D71;">
        Warmly,<br/>
        The Katha Team
      </p>
    </div>
```

---
STATUS: COMPLETE
