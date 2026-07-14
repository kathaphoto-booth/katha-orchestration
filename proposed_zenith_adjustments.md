# Zenith Reimagined Booking Pipeline & Design Studio Adjustments

## 1. Core Objectives
Transform `book.kathabooth.com` into an award-winning, immersive ("Awwwards-style") luxury booking experience. We are repurposing the physical oak-carved and minimalist dark aesthetics of the Zenith homepage, ensuring absolute continuity of storytelling from the moment the user clicks "Begin your Inquiry" on Squarespace, through the direct booking intake, and into their private Design Studio.

---

## 2. Design System & Palette Tokens (Zenith Lock)
The interface is governed by the following color tokens:

```typescript
const N = {
  // ── THE ROASTED ELEVATION ──
  l0:  "#161311",   // The Void (Darker than Black Coffee)
  l1:  "#211D1A",   // Intermediate shadow
  l2:  "#3D352E",   // Black Coffee (Physical Surfaces, Cards)
  l3:  "#4A4139",   // Lifted Black Coffee
  
  // ── THE INK & DATA ──
  hi:  "#ECE7DB",   // Piña Ecru (Primary Light / Ink)
  ecru:"#ECE7DB",   // Piña Ecru
  mut: "#AAA8A2",   // Quick Silver (Body text)
  fnt: "#8F8C8A",   // Philippine Gray (Meta text)
  dim: "#8F8C8A",   // Philippine Gray

  // ── THE PULSE ──
  loko:"#882D17",   // Kobe (The Sacred Thread / CTA)
  terra:"#794A33",  // Bole (Secondary warm accents)
  champ:"#ECE7DB",  // Piña Ecru (Highlights)
  sage:"#8F8C8A",   // Philippine Gray (Neutral success indicator)
  
  // ── ARCHITECTURE ──
  ln:  "rgba(236, 231, 219, 0.12)", // Piña Ecru translucent
  ln2: "rgba(236, 231, 219, 0.25)",
  glass: "rgba(255,255,255,0.03)",
  shadow:"rgba(0,0,0,0.85)",
};
```

### Typography Settings (Zenith Font Stack)
- **Display Style**: FH Ronaldson Display (`var(--font-fh-ronaldson-display), serif`)
- **Accent Italic Style**: Cormorant (`'Cormorant', serif`)
- **Monospace/Metadata Style**: Courier Prime (`'Courier Prime', monospace`)

---

## 3. Four-Tier Package Structure
Instead of classic-vs-signature, use the official 4-tier system:
1.  **Signature** ($949, Oak booth, 2x6 or 4x6, weathered oak, cotton prints)
2.  **Editorial** ($1149, Oak booth, 4x6, hand-finished B&W, flagship)
3.  **Modernist** ($749, White booth, 2x6 or 4x6, white shell, galleries/lofts)
4.  **Monochrome** ($949, White booth, 4x6, high-contrast B&W, razor frames)

---

## 4. Booking Intake Interactions & Features
- **Progress Tracking Line**: Horizontal animated line using Framer Motion directly above form container (25% → 50% → 75% → 100%).
- **Custom Themed Scrollbar**: Global body scrollbar, slim dark track (`#161311`), rounded thumb using rattan accent/Bole (`#794A33`).
- **Accessibility Completeness**: High contrast, `aria-label`, and `aria-live` on input/calendar states.
- **Custom Magnetic Calendar**: Custom calendar replacing native picker, monospace numbers, moody dark hover and active circular states using Loko Kobe (`#882D17`). Previous/next month buttons with clear ARIA labels.
- **Form Validation "Shake"**: Framer Motion `useAnimation` horizontal shake on invalid form submit with inline error displays.
- **Editorial Background**: Grayscale picsum.photos texture at 35% opacity inside the double-bezel card during lead capture.
- **Printable Registry Ticket (2x6 Photo Strip)**:
  - Slide-down, 3D unfolding peel-out dispensing animation.
  - Formatted as 2x6 strip, faux film frames, SVG paper texture, and unique barcode.
  - Print-specific CSS queries so "Print Strip" outputs *only* the pristine black-and-white 2x6 ticket.
- **Send to Email Button**: Triggers `sendTicketEmailAction` server action, showcasing asynchronous visual states (Sending / Dispatched / Error) with a simulated delay.

---

## 5. Design Studio Porting
- **URL**: `https://book.kathabooth.com/portal/[lead_hash]/template-design`
- Repurpose the exact same Zenith visual aesthetics (smooth 3D depth, the exact typography, custom scrollbars, and Barong void textures) to ensure cohesive transition.
- **Email Customization**: Update transactional emails to share the exact dark-roasted luxury theme.
