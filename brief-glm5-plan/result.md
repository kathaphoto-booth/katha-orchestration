# Zenith Pipeline Overhaul Plan: ATELIER (Vanguard Edition)

This document details the holistic implementation plan to overhaul the Katha Photo Booth digital pipeline from its previous Filipino Heritage dark aesthetic (Kamagong & Achuete) to the agency-level **ATELIER (Vanguard Edition)** design system, prioritizing quiet luxury, soft structuralism, and premium micro-interactions.

---

## 1. Executive Summary & Design System Mapping

The overhaul transitions the Katha booking experience to a high-end editorial canvas. The design tokens from the legacy system are mapped as follows:

| Design Dimension | Legacy System (Kamagong & Achuete) | Overhauled System: ATELIER (Vanguard Edition) |
| :--- | :--- | :--- |
| **Aesthetic Theme** | Dark Filipino Heritage (Ebony base, Ecru text, Rust accents) | Quiet Luxury / Heritage Minimalist |
| **Macro Background** | `#110F0D` (Kamagong Charcoal Void) | `#FBFBF9` (Alabaster / Soft Ivory) |
| **Primary Typography** | `FH Ronaldson Display Test` (Serif) | `IvyMode` (Editorial Display Serif, tightened tracking) |
| **UI/Body Typography** | `Outfit` (Sans-Serif) | `Proxima Nova` (Micro-copy, floating labels, input text) |
| **Main Accent Color** | `#9A3D2A` (Achuete / Vigan Brick Rust) | `#043927` (Deep Emerald Green) |
| **Elevated Surface Style**| Flat border overlays (`border: 1px solid rgba(232,225,211,0.08)`) | Doppelrand (Double-Bezel) nested hardware container |
| **Layout Paradigm** | Single-page vertical scrolling with sticky media element | Editorial Split (60vw fixed display left / 40vw scrollable form right) |
| **Input System** | Border-bottom inputs with fixed labels | Frictionless floating labels (translate to top-left on focus) |
| **Micro-interactions** | Traditional scale-up hover transforms | Button-in-Button magnetic physics & diagonal translation |

---

## 2. Structural & Layout Architecture

### The Editorial Split (Desktop vs. Mobile)
*   **Desktop Layout (Grid / Flex Split):**
    *   Left Column (`60vw` width): Scroll-locked viewport displaying massive `IvyMode` display typography, a subtle looping canvas of woven patterns, and persistent gallery previews.
    *   Right Column (`40vw` width): A scrollable region containing the Double-Bezel form containers, pricing details, and date checking interface.
*   **Mobile Layout (Aggressive Stacking Override):**
    *   Collapses column layout to full-width stack (`w-full`).
    *   Uses `min-h-[100dvh]` blocks to lock elements safely, eliminating jumping and browser toolbars shifting layout viewports on active inputs.

### The Doppelrand (Double-Bezel) Architecture
To simulate precision-machined luxury hardware, all form blocks, selection cards, and elevated detail surfaces utilize nested containers:
*   **Outer Bezel:**
    *   `padding: 0.375rem`
    *   `background: rgba(0, 0, 0, 0.04)`
    *   `border: 1px solid rgba(0, 0, 0, 0.05)`
    *   `border-radius: 2rem`
*   **Inner Core:**
    *   `background: #FFFFFF`
    *   `box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.8)`
    *   `border-radius: calc(2rem - 0.375rem)` (1.625rem)

---

## 3. Step-by-Step Overhaul Implementation Plan

### Phase 1: Test-Driven Development (TDD) Setup
1.  **Draft Playwright Test Specifications:** Set up the behavioral checkpoints for magnetic buttons, double-bezel containment, floating input states, and transition states.
2.  **Define Visual Regressions:** Lock element structures in CSS to ensure the left-side display column remains scroll-locked while the right side scrolls.

### Phase 2: Design Token & Core Styles Injection
1.  **CSS Variable Declarations:** Introduce `--color-bg-macro: #FBFBF9`, `--color-text: #0F0F0F`, `--color-accent: #043927`, and the Double-Bezel styles in `index.css`.
2.  **Font Injection:** Load `IvyMode` and `Proxima Nova` from global web font providers, falling back gracefully to `serif` and `sans-serif`.
3.  **Woven Pattern Orchestral Dance:** Set up a lightweight SVG pattern simulating a traditional weave that animates smoothly along subtle path distortions.

### Phase 3: Layout Structure Rewrite
1.  **Reorganize React Layout Tree:** Split the top-level container into `.editorial-container`, separating the editorial display columns from the interaction column.
2.  **Mobile Adaptive Media Queries:** Establish the CSS media breakpoints to switch layout flows to `flex-direction: column` at screen widths below `1024px`.

### Phase 4: Component Customization
1.  **Refactor Card Layouts:** Enclose package tiers and template selections inside `.doppelrand-outer` and `.doppelrand-inner` tags.
2.  **Build Magnetic Button-in-Button CTA:**
    *   Make a fully-rounded pill CTA button (`rounded-full bg-[#043927] text-white`).
    *   Include a trailing arrow circle wrapper (`w-8 h-8 rounded-full bg-white/20`) flush right.
    *   Assign CSS variables to track local hover translations.
3.  **Frictionless Inputs:** Update custom text and date inputs with absolute floating labels that shift font-size and color when focused or containing value.

### Phase 5: Pipeline State Sync
1.  **Lead State Tracking:** Update the state values (`lead.name`, `lead.email`, `lead.date`) to sync directly from the floating input textboxes.
2.  **Date Gate Execution:** Integrate check-status validation so reservations proceed automatically once availability is verified.

### Phase 6: Entry Choreography Integration
1.  **Define Staggered Cinematic Transition:** Apply a CSS transition rule to animate elements into view over `1200ms` with `cubic-bezier(0.32, 0.72, 0, 1)` and a staggered delay on successive elements.
2.  **Apply Entry Classes:** Apply `.cinematic-fade-up` and delays `.d-1`, `.d-2`, `.d-3` to all primary UI assets.

### Phase 7: Verification & QA
1.  **Run Playwright Tests:** Verify layout, inputs, and haptic button translations.
2.  **Perform Accessibility Audits:** Audit color contrast ratio (minimum 4.5:1 on text vs. Alabaster) and verify correct ARIA states on inputs and active panels.

---

## 4. Test-Driven Development (TDD) Specifications

These Playwright tests serve as the acceptance criteria for the design overhaul, verifying structural boundaries, motion physics, and user journeys.

```javascript
import { test, expect } from '@playwright/test';

test.describe('ATELIER Design System & Booking Pipeline Verification', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render the double-bezel card structure correctly', async ({ page }) => {
    const outerShell = page.locator('.doppelrand-outer').first();
    const innerCore = outerShell.locator('.doppelrand-inner');
    
    // Verify outer shell container styles
    await expect(outerShell).toHaveCSS('padding', '6px'); // 0.375rem
    await expect(outerShell).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.04)');
    await expect(outerShell).toHaveCSS('border-radius', '32px'); // 2rem

    // Verify inner core containment styles
    await expect(innerCore).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(innerCore).toHaveCSS('border-radius', '26px'); // 2rem - 0.375rem
  });

  test('should display the editorial split layout on desktop and stack on mobile', async ({ page }) => {
    // Set screen size to Desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    const editorialLeft = page.locator('.editorial-left-col');
    const interactiveRight = page.locator('.interactive-right-col');
    
    await expect(editorialLeft).toHaveCSS('width', '864px'); // 60vw of 1440px
    await expect(interactiveRight).toHaveCSS('width', '576px'); // 40vw of 1440px
    await expect(editorialLeft).toHaveCSS('position', 'sticky'); // Scroll locked
    
    // Set screen size to Mobile
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(editorialLeft).toHaveCSS('width', '375px'); // Stacked full width
    await expect(interactiveRight).toHaveCSS('width', '375px');
  });

  test('should apply active scale transforms to CTA buttons on click', async ({ page }) => {
    const ctaButton = page.locator('.btn-magnetic').first();
    
    // Verify initial scale
    await expect(ctaButton).toHaveCSS('transform', 'none');
    
    // Simulate hover/focus on button
    await ctaButton.hover();
    const innerCircle = ctaButton.locator('.btn-arrow-wrapper');
    await expect(innerCircle).toHaveCSS('transform', 'matrix(1.05, 0, 0, 1.05, 0, 0)'); // scale(1.05) and translate offset

    // Click and check active compression scale (using down-state class or direct style check)
    await page.mouse.down();
    await expect(ctaButton).toHaveCSS('transform', 'matrix(0.98, 0, 0, 0.98, 0, 0)'); // scale(0.98)
  });

  test('should execute the date availability check and enable reservation flow', async ({ page }) => {
    // Check elements
    const dateInput = page.locator('input[type="date"]');
    const checkBtn = page.locator('.btn-check-date');
    
    // Fill availability date
    await dateInput.fill('2026-07-10'); // Available date (not in legacy reserved date map)
    await checkBtn.click();
    
    // Status text displays open slot
    await expect(page.locator('.slot-availability-text')).toContainText('OPEN');
  });
});
```

---

## 5. Refactored Codebase Overhaul Blueprint

### Overhauled React Implementation
This clean React code skeleton overrides the legacy markup structure while retaining core logic.

```jsx
import React, { useState, useEffect, useRef, useMemo } from "react";

// ── DESIGN SYSTEM VARIABLES ──
const N = {
  bgMacro: "#FBFBF9",      // Alabaster / Soft Ivory
  textMain: "#0F0F0F",     // Obsidian
  accentGreen: "#043927",  // Deep Emerald Green (CTA)
  bezelOuter: "rgba(0, 0, 0, 0.04)",
  bezelOuterBorder: "rgba(0, 0, 0, 0.05)",
  bezelInner: "#FFFFFF"
};

const F = {
  display: "'IvyMode', serif",
  ui: "'Proxima Nova', sans-serif",
  mono: "'Courier Prime', monospace"
};

const TEMPLATES = [
  { id: "loom-oak", plate: "004", name: "Loom Oak", style: "Signature", booth: "Oak", formatLabel: "2×6 Strip", ratio: { w: 1, h: 3 }, desc: "Three frames on unbleached ground with a single Achuete seam — the warp line of the loom drawn straight down the strip.", paper: "#E8E1D3", slot: "#D1CBBF", edge: "#9A3D2A", ink: "#110F0D", accent: "#9A3D2A", sName: "AMARA & SEBASTIAN", sSub: "OCTOBER · LONG BEACH" },
  { id: "knalum-dark", plate: "011", name: "Knalum Dark", style: "Signature", booth: "Oak", formatLabel: "6×4 Landscape", ratio: { w: 3, h: 2 }, desc: "Kamagong ebony ground, three apertures in geometric tension, one Capiz Slate thread bisecting the field below.", paper: "#1A1714", slot: "#241F1B", edge: "#857D71", ink: "#E8E1D3", accent: "#857D71", sName: "RENZO & CAMILLE", sSub: "NOVEMBER · CARSON" },
  { id: "calado-pina", plate: "019", name: "Calado Piña", style: "Signature", booth: "Oak", formatLabel: "4×6 Postcard", ratio: { w: 2, h: 3 }, desc: "Two openings on raw piña fiber, divided by a hand-stitched calado.", paper: "#241F1B", slot: "#2E2722", edge: "#857D71", ink: "#E8E1D3", accent: "#9A3D2A", sName: "Marisol & Diego", sSub: "September · Pasadena" },
  { id: "sombra-twin", plate: "027", name: "Sombra Twin", style: "Signature", booth: "White", formatLabel: "6×4 Square", ratio: { w: 3, h: 2 }, desc: "Twin squares with breathing room, each trailing a ghost silhouette offset behind it.", paper: "#1A1714", slot: "#241F1B", edge: "#857D71", ink: "#E8E1D3", accent: "#9A3D2A", sName: "SOFIA & MARCO", sSub: "SEPTEMBER · LOS ANGELES" },
  { id: "iron-rule", plate: "041", name: "Iron Rule", style: "Classic", booth: "White", formatLabel: "2×6 Strip", ratio: { w: 1, h: 3 }, desc: "Four frames, one hairline rule. The design steps back so the portrait carries the whole strip.", paper: "#110F0D", slot: "#E8E1D3", edge: "#5C554C", ink: "#110F0D", accent: "#5C554C", sName: "NADIA + ELIAS", sSub: "JULY · LONG BEACH" }
];

const CONFIRMED = { "2026-07-05": 1, "2026-09-13": 1, "2026-10-18": 1, "2026-11-22": 1 };

function DoubleBezelCard({ children, className = "", onClick }) {
  return (
    <div className={`doppelrand-outer ${className}`} onClick={onClick}>
      <div className="doppelrand-inner">
        {children}
      </div>
    </div>
  );
}

function MagneticButton({ children, onClick, disabled }) {
  const btnRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btnRef.current.style.setProperty("--mx", `${x * 0.15}px`);
    btnRef.current.style.setProperty("--my", `${y * 0.15}px`);
  };

  const handleMouseLeave = () => {
    if (!btnRef.current) return;
    btnRef.current.style.setProperty("--mx", "0px");
    btnRef.current.style.setProperty("--my", "0px");
  };

  return (
    <button
      ref={btnRef}
      className="btn-magnetic"
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <span className="btn-label-content">{children}</span>
      <div className="btn-arrow-wrapper">↗</div>
    </button>
  );
}

function FrictionlessInput({ label, value, onChange, type = "text", required }) {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.length > 0;

  return (
    <div className={`floating-input-group ${focused ? "is-focused" : ""} ${hasValue ? "has-value" : ""}`}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
      />
      <label>{label}</label>
    </div>
  );
}

export default function App() {
  const [gateDate, setGateDate] = useState("");
  const [gateStatus, setGateStatus] = useState(null);
  const [selected, setSelected] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [lead, setLead] = useState({ name: "", email: "", date: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const checkDate = () => {
    if (!gateDate) return;
    setGateStatus(CONFIRMED[gateDate] ? "reserved" : "open");
    setLead((p) => ({ ...p, date: gateDate }));
  };

  const handleReserve = () => {
    if (!lead.name || !lead.email || !lead.date) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setConfirmed(true);
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className={`editorial-viewport ${drawer ? "drawer-open" : ""}`}>
      {/* Editorial Split Grid */}
      <main className="editorial-split-layout">
        
        {/* Left locked display block */}
        <section className="editorial-left-col cinematic-fade-up d-1">
          <div className="editorial-header-sticky">
            <h1 className="editorial-title">
              The frame<br />your night<br />
              <span className="italic-serif">lives in.</span>
            </h1>
            <p className="editorial-meta-sub">
              Eighty-two print designs, drawn by hand and held to one standard. Find the one that fits your event.
            </p>
          </div>
          
          {/* Orchestrally animated background weave pattern */}
          <div className="woven-pattern-container">
            <svg className="weaving-dance-mesh" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path className="warp-strand" d="M 10 0 Q 30 50 10 100" />
              <path className="warp-strand" d="M 50 0 Q 60 50 50 100" />
              <path className="warp-strand" d="M 90 0 Q 70 50 90 100" />
              <path className="weft-strand" d="M 0 20 Q 50 10 100 20" />
              <path className="weft-strand" d="M 0 50 Q 50 60 100 50" />
              <path className="weft-strand" d="M 0 80 Q 50 70 100 80" />
            </svg>
          </div>
        </section>

        {/* Right scrollable interaction column */}
        <section className="interactive-right-col cinematic-fade-up d-2">
          
          {/* Reservation Card with Double-Bezel */}
          <DoubleBezelCard className="booking-card">
            <div className="card-header">
              <span className="subtitle">Availability Check</span>
            </div>
            
            {gateStatus !== "open" ? (
              <div className="gate-flow-box">
                <FrictionlessInput
                  label="Select Event Date"
                  type="date"
                  value={gateDate}
                  onChange={(val) => { setGateDate(val); setGateStatus(null); }}
                />
                <div style={{ marginTop: "24px" }}>
                  <MagneticButton onClick={checkDate} disabled={!gateDate}>
                    Check Date
                  </MagneticButton>
                </div>
                {gateStatus === "reserved" && (
                  <p className="status-err-msg">The selected date is fully booked.</p>
                )}
              </div>
            ) : (
              <div className="gate-open-box">
                <div className="availability-confirmed">
                  <div className="status-dot green" />
                  <span className="slot-availability-text">OPEN slot for {gateDate}</span>
                </div>
                
                <div className="reservation-inputs-group">
                  <FrictionlessInput
                    label="Your Name"
                    value={lead.name}
                    onChange={(val) => setLead((p) => ({ ...p, name: val }))}
                  />
                  <FrictionlessInput
                    label="Email Address"
                    type="email"
                    value={lead.email}
                    onChange={(val) => setLead((p) => ({ ...p, email: val }))}
                  />
                </div>
                
                <div style={{ marginTop: "32px" }}>
                  <MagneticButton onClick={handleReserve} disabled={!lead.name || !lead.email}>
                    Reserve Secure Booking
                  </MagneticButton>
                </div>
              </div>
            )}
          </DoubleBezelCard>

          {/* Pricing Tiers in Double Bezel Form */}
          <section className="pricing-overview-section">
            <h2 className="section-title">Archival Print Collections</h2>
            <div className="packages-tier-list">
              {[
                { name: 'Signature Edition', price: '$949', desc: 'Weathered oak booth, DSLR capture, archival cotton prints.' },
                { name: 'Editorial Suite', price: '$1,149', desc: 'The full build — oak booth, refined black-and-white retouching, every print hand-finished.' }
              ].map((tier, index) => (
                <DoubleBezelCard key={index} className="pricing-card-surface">
                  <div className="pricing-header-row">
                    <span className="tier-badge-title">{tier.name}</span>
                    <span className="price-tag">{tier.price}</span>
                  </div>
                  <p className="tier-description-text">{tier.desc}</p>
                </DoubleBezelCard>
              ))}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
```

### Complete Overhauled CSS Stylesheet
```css
@import url('https://fonts.cdnfonts.com/css/ivymode');
@import url('https://fonts.cdnfonts.com/css/proxima-nova');

:root {
  --color-bg-macro: #FBFBF9;
  --color-text-main: #0F0F0F;
  --color-accent: #043927;
  --font-display: 'IvyMode', serif;
  --font-ui: 'Proxima Nova', sans-serif;
  --mx: 0px;
  --my: 0px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--color-bg-macro);
  color: var(--color-text-main);
  font-family: var(--font-ui);
  overflow-x: hidden;
  min-height: 100vh;
}

/* ── EDITORIAL SPLIT GRID SYSTEM ── */
.editorial-split-layout {
  display: grid;
  grid-template-columns: 60vw 40vw;
  min-height: 100vh;
}

.editorial-left-col {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 64px 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  background-color: var(--color-bg-macro);
}

.interactive-right-col {
  padding: 64px 48px;
  overflow-y: auto;
  background-color: #FFFFFF;
}

/* ── TYPOGRAPHY PARADIGM ── */
.editorial-title {
  font-family: var(--font-display);
  font-size: clamp(48px, 6vw, 96px);
  font-weight: 300;
  line-height: 1.0;
  letter-spacing: -0.05em; /* tracking-tighter */
  color: var(--color-text-main);
  margin-bottom: 24px;
}

.editorial-title .italic-serif {
  font-style: italic;
  font-family: var(--font-display);
}

.editorial-meta-sub {
  font-family: var(--font-ui);
  font-size: 18px;
  line-height: 1.6;
  color: #4A4A4A;
  max-width: 48ch;
}

/* ── DOUBLE-BEZEL (DOPPELRAND) SURFACE STRUCTURE ── */
.doppelrand-outer {
  padding: 0.375rem; /* 6px outer shell */
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 2rem;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
}

.doppelrand-inner {
  background: #FFFFFF;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.8);
  border-radius: calc(2rem - 0.375rem); /* 1.625rem inner core */
  padding: 32px;
}

.doppelrand-outer:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.03);
}

/* ── FRICTIONLESS INPUTS ── */
.floating-input-group {
  position: relative;
  border-bottom: 1px solid #D1D1D1; /* stone */
  margin-bottom: 28px;
  transition: border-color 0.3s ease;
}

.floating-input-group input {
  width: 100%;
  border: none;
  background: transparent;
  padding: 24px 0 8px 0;
  font-size: 18px;
  font-family: var(--font-ui);
  color: var(--color-text-main);
  outline: none;
}

.floating-input-group label {
  position: absolute;
  top: 24px;
  left: 0;
  font-size: 16px;
  color: #8E8E93;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  font-family: var(--font-ui);
}

.floating-input-group.is-focused,
.floating-input-group.has-value {
  border-bottom: 1px solid var(--color-text-main); /* obsidian */
}

.floating-input-group.is-focused label,
.floating-input-group.has-value label {
  top: 0;
  font-size: 12px;
  color: var(--color-text-main);
}

/* ── MAGNETIC HAPTIC CTA PILL ── */
.btn-magnetic {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 8px 8px 24px;
  background-color: var(--color-accent);
  color: #FFFFFF;
  border: none;
  border-radius: 9999px; /* pill structure */
  font-family: var(--font-ui);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  overflow: hidden;
  transform: translate(var(--mx), var(--my));
  transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.3s ease;
}

.btn-magnetic:active {
  transform: scale(0.98); /* scale down on active */
}

.btn-arrow-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px; /* w-8 */
  height: 32px; /* h-8 */
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;
}

.btn-magnetic:hover .btn-arrow-wrapper {
  transform: scale(1.05) translate(2px, -2px); /* scale up and translate diagonally */
}

/* ── ORCHESTRAL WEAVING ANIMATION ── */
.woven-pattern-container {
  position: absolute;
  inset: 0;
  opacity: 0.15;
  z-index: -1;
  pointer-events: none;
}

.weaving-dance-mesh {
  width: 100%;
  height: 100%;
  stroke: var(--color-accent);
  stroke-width: 0.2px;
  fill: none;
}

.warp-strand {
  animation: warpDrift 10s ease-in-out infinite alternate;
}

.weft-strand {
  animation: weftDrift 10s ease-in-out infinite alternate;
}

@keyframes warpDrift {
  0% { d: path("M 10 0 Q 30 50 10 100"); }
  100% { d: path("M 15 0 Q 25 55 5 100"); }
}

@keyframes weftDrift {
  0% { d: path("M 0 20 Q 50 10 100 20"); }
  100% { d: path("M 0 25 Q 55 15 100 22"); }
}

/* ── ENTRY CHOREOGRAPHY ── */
.cinematic-fade-up {
  opacity: 0;
  transform: translateY(4rem);
  filter: blur(8px);
  animation: entranceBloom 1200ms cubic-bezier(0.32, 0.72, 0, 1) forwards;
}

.d-1 { animation-delay: 100ms; }
.d-2 { animation-delay: 300ms; }
.d-3 { animation-delay: 500ms; }

@keyframes entranceBloom {
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

/* ── MOBILE OVERRIDE ── */
@media (max-width: 1024px) {
  .editorial-split-layout {
    grid-template-columns: 1fr;
  }
  
  .editorial-left-col {
    position: relative;
    height: auto;
    min-height: 50vh;
    padding: 48px 24px;
    border-right: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .interactive-right-col {
    min-height: 100dvh; /* prevent mobile viewport jumping */
    padding: 32px 24px;
  }
}
```

---

## 6. SEO & AIO Verification Mapping

To ensure search engine indexability and AI optimization (AIO) indexing of the booking pipeline, the following semantics must be strictly configured:

*   **Semantic Elements:** Wrap layout units in HTML5 elements (`<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`).
*   **A11y Labeling:** Active magnetic pills require `aria-label="Submit booking date check reservation"` to explain visual actions.
*   **Structured Metadata (JSON-LD Schema):**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Katha Photo Booth",
  "image": "https://book.kathabooth.com/cover.jpg",
  "url": "https://book.kathabooth.com",
  "telephone": "",
  "priceRange": "$749-$1149",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Long Beach",
    "addressRegion": "CA",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 33.7701,
    "longitude": -118.1937
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ],
    "opens": "00:00",
    "closes": "23:59"
  }
}
</script>
```

STATUS: COMPLETE
