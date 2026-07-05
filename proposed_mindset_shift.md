# Proposed Design Mindset Shift: From Landing Page Mockup to Pure Booking Entity

## Core Philosophy: "We Live in a Button"
- **Context**: The Zenith portal at `book.kathabooth.com` is not a standalone landing page. It lives behind a button on the primary Squarespace site (`kathabooth.com`).
- **Antipattern to Avoid**: Having a duplicate marketing hero, feature grid, pricing tiers, and client statistics on `book.kathabooth.com` that repeats what the user just saw on the main Squarespace storefront. A landing page with another CTA on its hero is redundant and breaks the "quiet luxury" illusion.
- **New Mindset**: We are a *quiet luxury, high-ticket, minimalist brand booking experience*. The user arrives here already pre-sold. Their intent is to book, not to be marketed to.

## Proposed Architectural Shifts
1. **Purge the Landing Page Clones**: Remove the redundant Squarespace clone layout sections from `Zenith/app/page.tsx` (the hero "The frame your night lives in", the stats bar, the scroll-pinned Exhibition Track, the duplicate pricing tier lists, and the drawer triggers).
2. **First-Screen Booking Experience**: Make the landing page of `book.kathabooth.com` the pure booking flow itself, rendered directly as a gorgeous full-page, minimalist interface rather than sliding in as a drawer over a redundant page.
3. **Information Architecture**:
   - **Header**: Canonical `KathaWordmark` in Piña Ecru `#ECE7DB` over a Black Coffee `#161311` void. Small tag: `"Booking & Inquiry"`.
   - **Main Layout**: A balanced, high-variance (`DESIGN_VARIANCE: 8`), low-density (`VISUAL_DENSITY: 3`) horizontal split or asymmetric 2-column layout:
     - **Left Column**: Minimalist tier selection (Signature vs. Classic) with simple toggle/card, and the visual calendar showing real blocked-date checks.
     - **Right Column**: Simple elegant input fields (Your Name, Email, Phone, Venue) and notes, focused under the primary CTA "Begin your Inquiry" in the sacred Loko Rust `#882D17` shade.
   - **Footer**: A simple, quiet brand watermark and SoCal location label. No noisy footer menus.
4. **Interactive States & Motion**:
   - Entrance: Cinematic, slow-weave of the Katha wordmark.
   - Transitions: Seamless, spring-physics-driven crossfades between packages and date confirmation.
   - No flashy, unmotivated animations. Everything is calm, airy, and deliberate.

## Open Questions for the Council
1. Does skipping the drawer in favor of a direct-on-page elegant booking form align better with the "quiet luxury" booking entity concept?
2. What are the database schema and RLS implications of transforming the home route `/` into a direct intake funnel, while reserving `/portal/[id]/template-design` as the client-facing portal?
