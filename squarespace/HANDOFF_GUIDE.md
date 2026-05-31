# Katha × Squarespace — Handoff Guide
### For: the brother managing kathabooth.com

You manage the content. The design is already locked. You literally cannot make it ugly if you follow three steps.

> **The one rule:** Paste Layer 1 once. Build with native sections. Drop Layer 2 snippets for signature moments. Never edit Layer 1.

---

## Layer 1 — Paste the design system ONCE (5 minutes)

This is the part that makes everything automatically look Katha.

1. In Squarespace: **Settings → Advanced → Code Injection**.
2. In the **Header** box, paste this, then paste the entire contents of `katha-injection.css` between the tags:

   ```html
   <style>
   /* ⬇ paste everything from katha-injection.css here ⬇ */

   </style>
   ```
3. Save.

That's it. Now every heading you type comes out in carved Fraunces, every paragraph in EB Garamond, the background becomes Piña Ecru, buttons turn Loko Rust, images get a torn deckled edge, and a soft woven texture sits over the whole site.

> **Plan note:** Code Injection requires a Squarespace **Business plan or higher**. If you're on Personal, upgrade — there's no workaround for site-wide CSS.

**Do not touch this file again.** If something needs to look different, ask Jed — don't edit Layer 1, or the brand drifts.

---

## Layer 2 — Drop in signature pieces (as needed)

For the special moments — the hero, the maker's mark, a torn-edge photo, a divider — use the ready-made snippets in the `snippets/` folder.

For each one:
1. Add a **Code Block** where you want it (Squarespace: `+` → Code).
2. Open the matching file, copy everything, paste it in.
3. Change only the bits marked `<!-- EDIT HERE -->`. Leave the rest.

| Snippet | What it is | You edit |
|---|---|---|
| `wordmark.html` | The lowercase `katha` logo | (usually nothing) |
| `ktha-stamp.html` | KTHA maker's mark seal | the caption line |
| `hero.html` | Full hero block | eyebrow, headline, sentence, button |
| `feature-row.html` | Image + text side-by-side | image, eyebrow, heading, body, link |
| `deckled-image.html` | A single torn-edge photo | image src + alt |
| `quote.html` | Pull quote | quote, author, role |
| `calado-divider.html` | The openwork divider line | nothing |

> Squarespace strips JavaScript inside Code Blocks — every snippet here is pure HTML + CSS on purpose, so they always work.

---

## Layer 3 — Everything else, your way

For normal content — galleries, text, spacing, new pages, reordering sections — just use Squarespace's **normal editor**. Because Layer 1 styles the native elements, even plain sections come out looking Katha. Add a Gallery section → the photos get deckled edges. Add a text section → it's already in the right fonts and colors.

You have full freedom here. Rearrange, add pages, swap photos. The shell holds it together.

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
