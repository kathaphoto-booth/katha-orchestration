# Katha × Squarespace — Handoff Guide
### For: the brother managing kathabooth.com

You manage the content. The design is already locked. You literally cannot make it ugly if you follow these steps.

> **The rule:** Paste Layer 1 + the brand guard once. Build with native sections. Drop Layer 2 snippets for signature moments. Never edit Layer 1 or the guard.

---

## Layer 1 — Paste the design system ONCE (5 minutes)

This is the part that makes everything automatically look Katha.

1. In Squarespace: **Settings → Advanced → Code Injection**.
2. In the **Header** box, paste:

   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <style>
   /* ⬇ paste everything from katha-brand-tokens.css here ⬇ */
   </style>
   ```
3. Save.

That's it. Now every heading you type comes out in carved Fraunces, every paragraph in EB Garamond, the background becomes Piña Ecru, buttons turn Loko Rust, images get a torn deckled edge, and a soft woven texture sits over the whole site.

> **Plan note:** Code Injection requires a Squarespace **Business plan or higher**. If you're on Personal, upgrade — there's no workaround for site-wide CSS.

**Do not touch this file again.** If something needs to look different, ask Jed — don't edit Layer 1, or the brand drifts.

---

## Layer 1B — Paste the brand guard ONCE (2 minutes)

The brand guard watches the page in real time and fixes any brand violations the moment they render — wrong colors, forbidden words, wrong button labels, rounded corners.

1. Still in **Settings → Advanced → Code Injection**.
2. In the **Footer** box, paste:

   ```html
   <script>
   /* ⬇ paste everything from katha-brand-guard.js here ⬇ */
   </script>
   ```
3. Save.

The guard runs silently. It:
- Corrects any `#000` pure-black overlays → Obsidian Weave `#111112`
- Replaces forbidden words ("curated", "timeless", "experience", "OAX") with canon language
- Corrects wrong CTA button text ("Request Bespoke Proposal" → "Commission")
- Strips rounded corners from any element that has them

> This fixes the DISPLAY — not the underlying page data. When you update page text in the CMS, you should still write canon-clean copy (see the Do/Don't list below). The guard is a safety net, not a substitute.

---

## Layer 2 — Drop in signature pieces (as needed)

For the special moments — the hero, a torn-edge photo, a divider, a testimonial — use the ready-made snippets in the `snippets/` folder.

For each one:
1. Add a **Code Block** where you want it (Squarespace: `+` → Code).
2. Open the matching file, copy everything, paste it in.
3. Change only the bits marked `<!-- EDIT -->`. Leave the rest.

| Snippet | What it is | You edit |
|---|---|---|
| `wordmark.html` | The lowercase `katha` wordmark | (usually nothing) |
| `hero.html` | Full hero block | eyebrow, headline, sentence, button |
| `feature-row.html` | Image + text side-by-side | image, eyebrow, heading, body, link |
| `deckled-image.html` | A single torn-edge photo | image src + alt |
| `quote.html` | Pull quote | quote, author, role |
| `calado-divider.html` | The openwork divider line | nothing |
| `commission-cta.html` | **The sacred Loko Rust CTA** — one per page | href, optional eyebrow + heading |
| `katha-testimonial-card.html` | Testimonial block (replaces old "Oax" cards) | quote text, name, event/role |

> Squarespace strips JavaScript inside Code Blocks — every snippet here is pure HTML + CSS on purpose, so they always work.

### Commission CTA — the one rule
The red "Commission" button is a **sacred CTA**. Use it exactly once per page — the single booking moment. Never use it for navigation links, hover states, or as a repeating pattern. Its rarity is what gives it weight.

---

## Layer 3 — Everything else, your way

For normal content — galleries, text, spacing, new pages, reordering sections — just use Squarespace's **normal editor**. Because Layer 1 styles the native elements, even plain sections come out looking Katha. Add a Gallery section → the photos get deckled edges. Add a text section → it's already in the right fonts and colors.

You have full freedom here. Rearrange, add pages, swap photos. The shell holds it together.

---

## Layer 4 — Integrating the Template Gallery (Vercel Integration)

The client-facing design gallery is hosted on Vercel at `book.kathabooth.com/gallery`. There are two ways to connect this gallery to your Squarespace storefront at `kathabooth.com`:

### Option A — The Seamless Iframe Embed (Recommended)
You can embed the gallery directly inside a page on your Squarespace site so the client never feels like they are leaving your domain.

1. In Squarespace: Add a new blank page. Set the URL slug to `/template-gallery`.
2. Add a **Code Block** inside the page section.
3. Paste the following responsive iframe block:

```html
<div class="katha-gallery-wrapper" style="position:relative; width:100%; min-height:85vh; overflow:hidden; -webkit-overflow-scrolling:touch;">
  <iframe 
    src="https://book.kathabooth.com/gallery" 
    id="katha-gallery-iframe"
    style="position:absolute; top:0; left:0; width:100%; height:100%; border:none; background:transparent;"
    allow="geolocation; microphone; camera; midi; encrypted-media;"
    loading="lazy">
  </iframe>
</div>

<script>
  // Dynamic Lead Token Forwarder:
  // If a client visits kathabooth.com/template-gallery?lead=123, 
  // automatically forward the lead token into the Vercel iframe.
  window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const lead = params.get('lead');
    if (lead) {
      const iframe = document.getElementById('katha-gallery-iframe');
      if (iframe) {
        iframe.src = `https://book.kathabooth.com/gallery?lead=${encodeURIComponent(lead)}`;
      }
    }
  });
</script>
```

### Option B — Direct URL Redirect (Easiest Setup)
Alternatively, you can set up a automatic link redirect so that `kathabooth.com/template-gallery` instantly bounces users to the Vercel hosted portal.

1. In Squarespace: Go to **Settings → Advanced → URL Redirects**.
2. Add the following rule to the text box and save:
   ```text
   /template-gallery -> https://book.kathabooth.com/gallery 301
   ```
3. Update any storefront buttons or menu links ("Choose Your Template") to point to `/template-gallery`. They will dynamically bounce to the active gallery.

---


## Quick do / don't

**Do**
- Keep headlines short (3 lines max reads best in Fraunces).
- Use real event photos, shot warm. Black-and-white or muted color.
- Leave lots of empty space — Katha breathes (this is *Ma*).
- Use the `Begin` button sparingly — it's the sacred red. One per screen.

**Don't**
- Don't edit `katha-injection.css`.
- Don't add other fonts or bright colors.
- Don't use stock-photo clichés (sparklers, neon, balloon arches).
- Don't write the words *luxury, premium, stunning, amazing, unforgettable*. Say the specific craft instead.
- Don't round image corners or add drop shadows (the shell handles edges).

---

## If something looks off
99% of the time it's because Layer 1 wasn't pasted, or was pasted outside the `<style>` tags. Re-check Step 2 above. Still stuck → send Jed a screenshot.

*Rooted by perseverance, crafted for generations.*
