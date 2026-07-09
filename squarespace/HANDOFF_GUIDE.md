# Katha × Squarespace — Handoff Guide
### For: Vince — the brother managing kathabooth.com

**Your site is the brand law (Jed, 2026-06-17).** Your design choices stand. The
files in this folder are a *light coexistence layer*, not enforcement. They
catch two narrow things on your live site (a pure-black hero overlay and
residual "OAX Photo Booth" text the prior brand left behind) and give you
ready-made signature pieces you can drop in. Beyond that, build your site the
way you want it.

> **The rule:** Paste Layer 1 + the brand guard once. Build native. Drop Layer 2
> snippets where you want a Katha signature moment. Edit Layer 1 / the guard
> only if you and Jed agree to.

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

That's it. Layer 1 loads the Katha near-match fonts — Playfair Display + Hanken
Grotesk (Katha snippets in Layer 2 use them; they hot-swap to licensed IvyMode +
Proxima Nova once Jed adds the Adobe Fonts kit) — adds a soft woven texture, and
defines the Katha color tokens. Your native Squarespace fonts, palette, and
headings render as you designed them — the layer does not override your stack.

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

The guard (updated 2026-07-07 for the Reserve CTA integration):
- Corrects any `#000` pure-black overlays → Obsidian `#0B0C10` (palette law —
  dark grounds resolve to obsidian, never pure black, never the legacy
  `#111112`)
- Corrects the two retired reds (the old Loko Rust CTA fill and its
  near-miss) → Kamagong `#3D2B1F`. Red is fully retired from the brand —
  no red anywhere, in any state.
- Corrects pure `#fff` → Piña Ecru + the `#F9F6F0` near-miss (palette law)
- Replaces residual **"OAX Photo Booth"** text + `info@oaxphotobooth.com` →
  "Katha Booth" / `kathabooth@gmail.com` (legacy brand cleanup)
- **Auto-rewrites 13 forbidden voice tokens** to canon substitutes: `timeless`,
  `curation`, `curating`, `experience`, `experiences`, `keepsake`, `journey`,
  `unforgettable`, `stunning`, `amazing`, `magical`, `elevate`, `elevating`.
- **Audits the two permitted-but-capped terms** — `Curated` and `Handcrafted`
  may each appear up to **3 times per page**. The guard counts and logs a
  `console.warn` if the cap is exceeded — it does NOT rewrite the excess
  (editorial discipline, not hostile enforcement of your authorship).

It still does **not** rewrite your CTAs ("Request Bespoke Proposal", "Secure An
Architecture" — yours), your fonts, or your palette. Those are unchanged from
the 2026-06-17 lift.

> The guard fixes DISPLAY only — it does not edit the CMS data. If you want a
> change to stick on republish, edit the source text in Squarespace.

### Things the guard WON'T fix — your call to edit in the CMS

These were flagged during the storefront audit. None block launch; surface them
when you have a moment:

- Home hero typo: `EDITORIAL BOOTH ARCHTECURE` is missing "IT" (should be
  `ARCHITECTURE`).
- Architectures page CTA links to `/about`, which is a 404 — point it at an
  existing page (Contact?) or build the About page.
- Contact form "CHOOSE YOUR AESTHETIC" dropdown still lists the old tier
  names (Signature / Editorial / Vintage / Vantage / Portfolio). The current
  4 canonical Service Installation tiers are: **Signature Installation /
  Oak ($949)** · **Editorial Installation / Oak ($1,149)** · **Modernist
  Installation / White ($749)** · **Monochrome Installation / White ($949)**.
- Process carousel: step `04. DELIVERY` is duplicated — delete the second one.
- T&C still references "OAX Photo Booth" in §1/3/5/6/8 — the guard masks this
  in the browser, but consider editing the underlying T&C copy for
  republishes / search indexing.
- Footer tagline still reads "Curating high-end photo experiences." — yours
  to keep or change.

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
| `reserve-cta.html` | **The Reserve button** — the canonical booking CTA | href `src` code, variant class, label |
| `inquire-bridge.html` | The complete `/inquire` page section | (usually nothing) |
| `katha-testimonial-card.html` | Testimonial block (replaces old "Oax" cards) | quote text, name, event/role |

> Squarespace strips JavaScript inside Code Blocks — every snippet here is pure HTML + CSS on purpose, so they always work.

> The old red `commission-cta.html` is retired — red is off the palette
> entirely now. It lives in `snippets/_archive/` as history. Use
> `reserve-cta.html` everywhere you would have used it.

### Where the Reserve buttons go

The Reserve button is styled to sit beside your own dark block buttons —
same shape, same voice. It comes in two looks: the default (dark button,
for your ivory sections) and `k-reserve--on-dark` (ivory button, for your
brown/dark bands). Every placement below uses the same snippet — the only
things that change are the variant class and the `src` code in the link.

**The one rule: one primary Reserve button per screenful. Never stack two.**
If a visitor can see two Reserve buttons at once, remove one.

1. **Header (site-wide).** Don't paste a snippet here — use Squarespace's
   native header button instead. Edit header → add a button, label it
   `Reserve Your Date`, and point it at
   `https://book.kathabooth.com/gallery?src=ss-nav`. Squarespace styles it to
   match your header automatically.

2. **Home — hero.** One button under the hero headline. Paste
   `reserve-cta.html`, set the src code to `ss-hero`. If your hero sits
   on a photo or dark band, add the `k-reserve--on-dark` class.

3. **Home — after the process section.** A second placement lower down,
   for people who read first and decide after. Use src `ss-home-bridge`.
   (This is fine with rule 1 — they're a full scroll apart.)

4. **Installations — one per tier card.** Under each tier's Investment
   accordion, paste the snippet with src `ss-installations` **and** the
   tier's deep link, so the booking app opens with that installation
   already chosen:
   - Signature Installation / Oak → `...?src=ss-installations&tier=signature-oak`
   - Editorial Installation / Oak → `...?src=ss-installations&tier=editorial-oak`
   - Modernist Installation / White → `...?src=ss-installations&tier=modernist-white`
   - Monochrome Installation / White → `...?src=ss-installations&tier=monochrome-white`

5. **Founders — text link only.** No block button here; the page is
   about you two, not booking. A plain sentence at the end with a text
   link is right: *"When you're ready, reserve your date."* → point the
   link at `https://book.kathabooth.com/gallery?src=ss-founders`.

6. **Contact — above the form.** A short line plus the button, so people
   who came to book don't have to fill in a form first. Use src
   `ss-contact`.

7. **Footer (site-wide).** One button in the footer band. It sits on your
   dark brown ground, so use the `k-reserve--on-dark` class. Src
   `ss-footer`.

8. **The `/inquire` page.** Paste `inquire-bridge.html` as the whole
   page — it's a complete section (headline, one line, button, and a
   quiet link to Contact). The src is already set to `ss-inquire`.

Why the src codes matter: they tell us which door each booking walked in
through, so we can see what's working. Takes ten seconds per paste;
worth it.

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
- Build the way your design instincts tell you to. The 2026-06-17 directive:
  *"None of his website creations violates any laws. He is the law."*
- Drop in a `reserve-cta.html` snippet at the booking moments listed in
  "Where the Reserve buttons go" above — one per screenful.
- Use real event photos.

**Don't**
- Don't use pure `#000` or pure `#fff` as a flat background — those are the
  one palette guardrail (the guard auto-corrects them on render).
- Don't write *luxury / premium / stunning / amazing / unforgettable / magic /
  keepsake / timeless / experience / curation / elevate* anywhere — those are
  forbidden on every Katha surface, including this one. (Words like *Curated*
  and *Handcrafted* are permitted on your storefront up to 3 times per page.)
- Don't reintroduce a "KTHA" brass-ring / maker's mark. The marks lock is two
  marks only — the wordmark and the leaf/feather "K".

---

## If something looks off
99% of the time it's because Layer 1 wasn't pasted, or was pasted outside the `<style>` tags. Re-check Step 2 above. Still stuck → send Jed a screenshot.

*Rooted by perseverance, crafted for generations.*
