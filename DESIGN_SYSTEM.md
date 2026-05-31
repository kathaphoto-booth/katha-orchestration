# Katha Design System — Quick Reference

The shell. Build any page from these primitives and it reads as Katha automatically.
For the Squarespace handoff, see [squarespace/HANDOFF_GUIDE.md](squarespace/HANDOFF_GUIDE.md).
Source of truth for tokens: [gemini_draft/app/globals.css](gemini_draft/app/globals.css).

---

## 1. The One Rule
> Compose with shell primitives. Never hardcode a hex, a font, a pixel margin, or a 6/6 grid. The shell already knows what Katha looks like.

---

## 2. Color Tokens (9)

**UI tokens**
| Token | Hex | Use |
|---|---|---|
| `--katha-obsidian-weave` | `#111112` | Dark base |
| `--katha-pina-ecru` | `#EAE2D5` | Light ground / SVG thread |
| `--katha-hammered-sequin` | `#9C958A` | Catchlight / hairlines |
| `--katha-champagne-heirloom` | `#C4B59D` | Tonal embroidery |
| `--katha-iron-bark` | `#241E1A` | Text on light / frame |

**Narrative tokens (T'nalak-rooted)**
| Token | Hex | Use |
|---|---|---|
| `--katha-knalum-ink` | `#1A1816` | Narrative dark bg |
| `--katha-loko-rust` | `#8C382A` | **Sacred CTA only** |
| `--katha-terracotta-earth` | `#A35C44` | Warm accent |
| `--katha-abel-slate` | `#5A5D5A` | Muted / inactive |
| `--katha-capiz-sage` | `#B5B8A3` | Success / divider |

Tailwind classes: `bg-katha-*`, `text-katha-*`, `border-katha-*` (opacity OK: `border-katha-iron-bark/12`).
Semantic aliases: `bg-bg-primary`, `text-text-primary`, `text-text-muted`, `bg-cta-sacred`, `text-text-on-dark`.

---

## 3. Typography
| Class | Font | Use |
|---|---|---|
| `font-display` | Fraunces (SOFT 100, WONK 1) | Headings — carved feel |
| `font-body` | EB Garamond | Long-form copy |
| `font-ui` | Inter | UI labels, nav, buttons |
| `font-mono` | JetBrains Mono | Metadata, stamps, ordinals |

Never `font-weight: 700` on display. Display tracking `-0.015em`; utility labels `+0.12em uppercase`; mono `+0.04em`.

---

## 4. Shell Primitives — `import { … } from '@/components/shell'`

| Component | Purpose |
|---|---|
| `<KSection variant="light\|dark\|mid">` | Section wrapper — Ma breathing + gutters + surface |
| `<KGrid split="7/5\|8/4\|9/3\|5/7\|full" reverse>` | Asymmetric grid (6/6 impossible) |
| `<KGridPrimary>` / `<KGridSecondary>` | Column slots inside KGrid |
| `<KEyebrow>` | Section label (Inter caps, Abel Slate) |
| `<KHeading size="display\|xl\|lg\|md">` | Fraunces heading |
| `<KBody size="lg\|md\|sm">` | EB Garamond body |
| `<KMeta>` / `<KOrdinal>` | Mono metadata / section number |
| `<KCta variant="sacred\|ghost\|outline" href\|onClick>` | Call to action (sacred = scarce) |
| `<KFeatureCard image heading reverse>` | Image+text block (deckled + sombrado) |
| `<KQuoteBlock author role>` | Pull quote |
| `<KStatBar items columns>` | Specs / metrics row |
| `<KathaWordmark>` `<KathaLogomark>` `<KthaMark>` | Marks |
| `<CaladoDivider>` | The only allowed rule line (replaces `<hr>`) |
| `<DeckledCard variant="a\|b\|c">` | Torn-edge container |
| `<KathaThread>` | Page-wide scroll thread, closes on KTHA |

---

## 5. Inject-Any-Idea Recipe
```tsx
import { KSection, KGrid, KGridPrimary, KGridSecondary,
         KEyebrow, KHeading, KBody, KCta } from '@/components/shell';

export function AnythingMyBrotherWants() {
  return (
    <KSection variant="light" id="my-idea">
      <KGrid split="8/4">
        <KGridPrimary split="8/4">
          <KEyebrow>HIS EYEBROW</KEyebrow>
          <KHeading size="xl">His headline, carved in Fraunces.</KHeading>
          <KBody className="mt-6">His paragraph, set in Garamond, spaced correctly.</KBody>
          <KCta variant="sacred" href="/contact" className="mt-8">His CTA</KCta>
        </KGridPrimary>
        <KGridSecondary split="8/4">{/* anything */}</KGridSecondary>
      </KGrid>
    </KSection>
  );
}
```
It will look Katha. Guaranteed.

---

## 6. Forbidden
- Hardcoded hex in components (use tokens).
- 6/6 symmetric grids (use 7/5, 8/4, 9/3, 5/7).
- `border-radius` on cards/images (deckled, never rounded). Pills allowed only on nothing — avoid.
- Drop-shadows on light grounds (use the sombrado plate built into `KFeatureCard`).
- `<hr>` (use `<CaladoDivider>`).
- More than one `sacred` CTA visible at once.
- Words: *luxury, premium, stunning, amazing, unforgettable, journey, vibe, aesthetic (noun), experience (noun), curated, authentic, Instagrammable, once-in-a-lifetime*.
- Legacy `oax` hex: `#0a0806`, `#bf9d2c`, `#c4c1b8`.
