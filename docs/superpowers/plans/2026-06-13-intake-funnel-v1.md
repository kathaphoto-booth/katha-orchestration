# Unified Intake Funnel V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a unified Next.js intake funnel (V1 manual handoff): `/inquire` → portal template + service-tier selection → structured operator email, in `photobooth-template-studio`.

**Architecture:** Extend the existing dispatch backbone in place (`/api/inquiry`, `/api/selection`, the portal) + build a fresh `/inquire` page + one migration. All DB writes go through `supabaseAdmin` (service_role); `selections` RLS is service_role-only. No HoneyBook API bridge, payments, or AI. The 82-preset catalog is untouched.

**Tech Stack:** Next.js 15 (App Router, `await params`), React 19, Supabase (service_role), Resend (env-gated, currently dead), Playwright E2E, `npm run guard`.

**Spec:** `docs/superpowers/specs/2026-06-13-intake-funnel-v1-design.md`.

**Brand law (hard):** no `border-radius`; Loko Rust `#8C382A` is sacred-CTA only (≤1/viewport); no forbidden hex (`#000`/`#fff`/`#F9F6F0`); §3 voice (no luxury/experience(noun)/heirloom/curated/algorithm/KTHA). Verify every task with `npm run guard`.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `supabase/migrations/20260613120000_selections_service_tier_address.sql` | Create | Add `service_tier` + `address` columns to `selections` |
| `lib/serviceTiers.ts` | Create | Single source of truth for the 4 installation tiers (§3-clean copy) + validators |
| `app/inquire/page.tsx` | Create | Public 3-field intake form → `/api/inquiry` → on-screen portal link + email |
| `app/api/inquiry/route.ts` | Modify | §3-scrub the client email copy (remove heirloom/KTHA/loom) |
| `app/api/selection/route.ts` | Modify | Add `serviceTier` + `address` to type/validation/persistence/operator email |
| `app/portal/[id]/template-design/page.tsx` | Modify→split | Becomes a server wrapper that validates `lead_hash` |
| `app/portal/[id]/template-design/TemplateDesignClient.tsx` | Create (extract) | The existing client component, now rendered by the server wrapper; gains the serviceTier + address step |
| `tests/e2e/intake-funnel.spec.ts` | Create | Playwright E2E (API-mocked) for `/inquire` + portal serviceTier step |

---

## Task 0: Branch

**Files:** none (git only)

- [ ] **Step 1: Confirm a clean nested-repo tree and branch off `main`**

The repo is currently on `feat/fable6-port` (held, not merged). Build the funnel on a fresh branch off `main` to avoid coupling to the held homepage relocation.

```bash
cd photobooth-template-studio
git status            # confirm/stash any in-progress work first
git checkout main
git checkout -b feat/intake-funnel-v1
```
Expected: now on `feat/intake-funnel-v1`, clean tree.

---

## Task 1: Migration — `service_tier` + `address`

**Files:**
- Create: `supabase/migrations/20260613120000_selections_service_tier_address.sql`

- [ ] **Step 1: Write the migration**

```sql
-- V1 intake funnel: service tier + venue address on selections.
-- service_tier maps to lib/serviceTiers.ts ids (validated app-side; no DB CHECK
-- since the tier set evolves). address is PII — selections RLS is service_role-only,
-- so it is never exposed to anon/other clients.
ALTER TABLE public.selections
  ADD COLUMN IF NOT EXISTS service_tier text,
  ADD COLUMN IF NOT EXISTS address text;
```

- [ ] **Step 2: Apply to the linked Supabase project (`hvvomiyskizxzhyytcfd`)**

Apply via the Supabase MCP `apply_migration` (name `selections_service_tier_address`) or the dashboard SQL editor. Expected: `selections` now has `service_tier` and `address` columns (confirm with `list_tables` / `\d selections`).

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260613120000_selections_service_tier_address.sql
git commit -m "feat(db): add selections.service_tier + selections.address"
```

---

## Task 2: `lib/serviceTiers.ts` — the four tiers (single source)

**Files:**
- Create: `lib/serviceTiers.ts`

Copy below is the **§3-scrubbed** version of `.memory/handoff/2026-06-13_service-tiers-update_spec.md` (luxury/experience/heirloom/algorithm/curator removed; craft-specific, peer-executive).

- [ ] **Step 1: Write the module**

```ts
export type ServiceTierId =
  | "signature-oak"
  | "editorial-oak"
  | "modernist-white"
  | "monochrome-white";

export type ServiceTier = {
  id: ServiceTierId;
  name: string;
  architecture: "Oak" | "White";
  price: number; // USD
  blackAndWhite: boolean;
  narrative: string;
  inclusions: string[];
};

export const SERVICE_TIERS: readonly ServiceTier[] = [
  {
    id: "signature-oak",
    name: "Signature Installation",
    architecture: "Oak",
    price: 949,
    blackAndWhite: false,
    narrative:
      "Weathered oak hardware with studio DSLR optics and full-color calibration. Built to sit inside heritage venues and historic estates without asking for attention.",
    inclusions: [
      "Four hours of continuous portraiture",
      "Studio DSLR sensors calibrated for true-to-life color",
      "Early arrival, clean install, no exposed cabling",
      "One installation director guiding composition and light",
      "Unlimited instant matte prints",
      "Private high-resolution gallery after the event",
    ],
  },
  {
    id: "editorial-oak",
    name: "Editorial Installation",
    architecture: "Oak",
    price: 1149,
    blackAndWhite: true,
    narrative:
      "The flagship oak configuration, set to a black-and-white skin-rendering profile. Stark, high-contrast portraiture that holds up in print.",
    inclusions: [
      "Four hours of black-tie portraiture",
      "Black-and-white rendering tuned for luminous skin and deep shadow",
      "Full site integration, precise hardware mapping, no exposed cabling",
      "One installation director managing the light space",
      "Unlimited instant archival black-and-white matte prints",
      "Private high-resolution gallery after the event",
    ],
  },
  {
    id: "modernist-white",
    name: "Modernist Installation",
    architecture: "White",
    price: 749,
    blackAndWhite: false,
    narrative:
      "A minimalist white chassis with studio DSLR optics and full-color calibration. A clean, bright presence for contemporary galleries and industrial rooms.",
    inclusions: [
      "Four hours of continuous portraiture",
      "Studio DSLR sensors tuned for bright, sharp color",
      "Fast install with hidden power and data routing",
      "One installation director holding grid symmetry",
      "Unlimited instant matte prints",
      "Private high-resolution gallery after the event",
    ],
  },
  {
    id: "monochrome-white",
    name: "Monochrome Installation",
    architecture: "White",
    price: 949,
    blackAndWhite: true,
    narrative:
      "White hardware set to a black-and-white rendering profile. High-contrast, sharp portraiture for clean lines and modern rooms.",
    inclusions: [
      "Four hours of editorial portraiture",
      "High-contrast black-and-white rendering that sharpens facial structure",
      "Low-footprint install with full wire containment",
      "One installation director directing guest movement",
      "Unlimited instant high-contrast matte prints",
      "Private high-resolution gallery after the event",
    ],
  },
] as const;

export const SERVICE_TIER_IDS = SERVICE_TIERS.map((t) => t.id);

export function getServiceTier(id: string): ServiceTier | undefined {
  return SERVICE_TIERS.find((t) => t.id === id);
}

export function isServiceTierId(id: unknown): id is ServiceTierId {
  return typeof id === "string" && SERVICE_TIERS.some((t) => t.id === id);
}
```

- [ ] **Step 2: Verify it type-checks + passes the brand-vocab guard**

Run: `npx tsc --noEmit && npm run guard`
Expected: tsc clean; guard P0:0 (no forbidden vocab/hex introduced).

- [ ] **Step 3: Commit**

```bash
git add lib/serviceTiers.ts
git commit -m "feat(tiers): add the 4 installation tiers single-source (§3-clean)"
```

---

## Task 3: §3-scrub the existing `/api/inquiry` client email

**Files:**
- Modify: `app/api/inquiry/route.ts` (the `sendEnrichmentEmail` strings)

The current copy ships forbidden vocab + the purged KTHA mark. Replace the `subject`, `textBody`, and the two offending `htmlBody` `<p>` blocks.

- [ ] **Step 1: Replace the subject + text body**

Find the `subject` and `textBody` in `sendEnrichmentEmail` and replace with:

```ts
  const subject = "Your Katha design link — choose your template";

  const textBody = `
Dear ${payload.client_name},

Thank you for reaching out to Katha. We have recorded your event inquiry for ${payload.event_date}.

Katha runs two DSLR installations — weathered oak and modern white frames — printing archival matte portraiture on site.

To tailor the backdrop, typography, and print layout to your event, choose your template here:

${galleryLink}

You can set a style, add custom lettering, and upload up to three reference photos at your own pace.

Warmly,
The Katha Team
  `.trim();
```

- [ ] **Step 2: Replace the two violating HTML paragraphs**

In `htmlBody`, replace the `<h2>` tagline + the "wooden loom / KTHA maker's mark / heirloom" paragraph with:

```ts
      <h2 style="font-family:'Fraunces', serif; font-weight:400; font-size:24px; letter-spacing:-0.01em; margin-bottom: 24px; color:#241E1A;">
        Choose your template.
      </h2>

      <p style="font-size:16px; margin-bottom:20px;">
        Dear ${payload.client_name},
      </p>

      <p style="font-size:16px; margin-bottom:20px;">
        Thank you for reaching out to Katha. We have recorded your event inquiry for <strong>${payload.event_date}</strong>.
      </p>

      <p style="font-size:16px; margin-bottom:30px;">
        Katha runs two DSLR installations — weathered oak and modern white frames — printing archival matte portraiture on site. To tailor the backdrop, layout geometry, and typography to your event, choose your template below.
      </p>
```

(Leave the CTA button, footer, and Loko Rust `#8C382A` button untouched — it is the single sacred CTA.)

- [ ] **Step 3: Verify no forbidden vocab remains**

Run: `grep -niE "heirloom|KTHA|wooden loom|luxury|keepsake" app/api/inquiry/route.ts`
Expected: no matches. Then `npx tsc --noEmit && npm run guard` → clean / P0:0.

- [ ] **Step 4: Commit**

```bash
git add app/api/inquiry/route.ts
git commit -m "fix(voice): §3-scrub inquiry email (drop heirloom/KTHA/loom)"
```

---

## Task 4: Extend `/api/selection` — serviceTier + address

**Files:**
- Modify: `app/api/selection/route.ts`

- [ ] **Step 1: Import the tier validator + extend the `Selection` type**

At the top, add `import { isServiceTierId, getServiceTier } from "@/lib/serviceTiers";`. In the `Selection` type add:

```ts
  serviceTier?: string | null; // ServiceTierId; validated below
  address?: string | null;     // PII — server-only
```

- [ ] **Step 2: Validate + build the fields in the POST handler**

In `POST`, after the existing field-coercion block that builds `selection`, add `serviceTier` + `address` to the object:

```ts
    serviceTier:
      body.serviceTier && isServiceTierId(body.serviceTier) ? body.serviceTier : null,
    address: body.address ? String(body.address).slice(0, 500) : null,
```

If a `serviceTier` is present but invalid, reject before building:

```ts
  if (body?.serviceTier && !isServiceTierId(body.serviceTier)) {
    return NextResponse.json({ ok: false, error: "invalid serviceTier" }, { status: 400 });
  }
```

- [ ] **Step 3: Persist to the typed columns in `dispatchSupabase`**

In the `selections` insert object add:

```ts
        service_tier: s.serviceTier,
        address: s.address,
```

- [ ] **Step 4: Add Tier + Address rows to the operator email**

In `dispatchEmail`, compute a tier label and add rows. After `const appUrl = …`:

```ts
  const tier = s.serviceTier ? getServiceTier(s.serviceTier) : undefined;
  const tierLabel = tier ? `${tier.name} · ${tier.architecture} — $${tier.price.toLocaleString()}` : "—";
```

Add to `textLines` (before `Selected At`): `` `Service Tier:  ${tierLabel}`, `` and `` `Venue Address: ${s.address || "—"}`, ``. Add two `<tr>` rows to the HTML table mirroring the existing row markup (label cell `#5A564E`, value cell `#241E1A`), e.g.:

```ts
        <tr style="border-bottom:1px dashed #EAE2D5;">
          <td style="padding:10px 0; font-weight:bold; color:#5A564E;">Service Tier</td>
          <td style="padding:10px 0; color:#241E1A;">${escapeHtml(tierLabel)}</td>
        </tr>
        <tr style="border-bottom:1px dashed #EAE2D5;">
          <td style="padding:10px 0; font-weight:bold; color:#5A564E;">Venue Address</td>
          <td style="padding:10px 0; color:#241E1A;">${s.address ? escapeHtml(s.address) : "—"}</td>
        </tr>
```

- [ ] **Step 5: Dead-Resend dev fallback**

In both `dispatchEmail` (selection) and `sendEnrichmentEmail` (inquiry), in the `if (!apiKey)` branch (and after a Resend send error), `console.log` the rendered payload so the flow is observable locally:

```ts
    console.log("[email:mock]", { to: toAddr, subject, text: textLines });
```

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && npm run guard`
Expected: tsc clean (note `escapeHtml`/`getServiceTier`/`isServiceTierId` all resolve); guard P0:0.

- [ ] **Step 7: Commit**

```bash
git add app/api/selection/route.ts
git commit -m "feat(selection): persist serviceTier + address; show in operator email"
```

---

## Task 5: `/inquire` page (fresh, via impeccable-looped-kit)

**Files:**
- Create: `app/inquire/page.tsx`
- Test: `tests/e2e/intake-funnel.spec.ts`

Build through the impeccable-looped-kit loop (`/init → /shape → /craft → /audit → /clarify → /harden`). The code below is the functional baseline the loop polishes — brand law applies (no border-radius, single Loko Rust CTA, ecru ground `#EAE2D5`, Fraunces/EB Garamond/Inter).

- [ ] **Step 1: Write the failing E2E (API-mocked)**

```ts
// tests/e2e/intake-funnel.spec.ts
import { test, expect } from "@playwright/test";

test("/inquire submits 3 fields and shows the portal link on-screen", async ({ page }) => {
  await page.route("**/api/inquiry", (route) =>
    route.fulfill({ status: 200, contentType: "application/json",
      body: JSON.stringify({ ok: true, lead_hash: "deadbeefdeadbeefdeadbeefdeadbeef" }) }));

  await page.goto("/inquire");
  await page.getByLabel(/name/i).fill("Ana Reyes");
  await page.getByLabel(/email/i).fill("ana@example.com");
  await page.getByLabel(/event date/i).fill("2026-09-12");
  await page.getByRole("button", { name: /commission|begin|continue/i }).click();

  const link = page.getByRole("link", { name: /template|design|continue/i });
  await expect(link).toHaveAttribute("href", /\/portal\/deadbeef.*\/template-design/);
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx playwright test tests/e2e/intake-funnel.spec.ts -g "shows the portal link"`
Expected: FAIL (no `/inquire` route yet).

- [ ] **Step 3: Implement `app/inquire/page.tsx`**

```tsx
"use client";

import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InquirePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [portalLink, setPortalLink] = useState<string | null>(null);

  const valid = name.trim().length >= 2 && EMAIL_RE.test(email.trim()) && date.trim().length > 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_name: name.trim(), client_email: email.trim(), event_date: date.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.lead_hash) {
        setPortalLink(`${window.location.origin}/portal/${data.lead_hash}/template-design`);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (portalLink) {
    return (
      <main style={{ minHeight: "100svh", background: "#EAE2D5", color: "#241E1A", display: "grid", placeItems: "center", padding: "2rem" }}>
        <div style={{ maxWidth: 560 }}>
          <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: "2rem", letterSpacing: "-0.015em" }}>Thank you.</h1>
          <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "1.05rem", lineHeight: 1.6 }}>
            We have recorded your inquiry. Your design link is on its way by email — or continue now:
          </p>
          <a href={portalLink} style={{ display: "inline-block", marginTop: "1.5rem", background: "#8C382A", color: "#EAE2D5", fontFamily: "Inter, sans-serif", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.12em", padding: "1rem 2rem", textDecoration: "none" }}>
            Continue to your template
          </a>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100svh", background: "#EAE2D5", color: "#241E1A", display: "grid", placeItems: "center", padding: "2rem" }}>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 460, display: "grid", gap: "1.25rem" }}>
        <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 400, fontSize: "2rem", letterSpacing: "-0.015em", margin: 0 }}>Commission Katha</h1>
        <label style={{ display: "grid", gap: ".4rem", fontFamily: "Inter, sans-serif", fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".12em", color: "#5A564E" }}>
          Name
          <input aria-label="Name" value={name} onChange={(e) => setName(e.target.value)} required
            style={{ padding: ".8rem", border: "1px solid #C4B59D", background: "transparent", fontFamily: "'EB Garamond', serif", fontSize: "1rem", borderRadius: 0 }} />
        </label>
        <label style={{ display: "grid", gap: ".4rem", fontFamily: "Inter, sans-serif", fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".12em", color: "#5A564E" }}>
          Email
          <input aria-label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            style={{ padding: ".8rem", border: "1px solid #C4B59D", background: "transparent", fontFamily: "'EB Garamond', serif", fontSize: "1rem", borderRadius: 0 }} />
        </label>
        <label style={{ display: "grid", gap: ".4rem", fontFamily: "Inter, sans-serif", fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".12em", color: "#5A564E" }}>
          Event date
          <input aria-label="Event date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required
            style={{ padding: ".8rem", border: "1px solid #C4B59D", background: "transparent", fontFamily: "'EB Garamond', serif", fontSize: "1rem", borderRadius: 0 }} />
        </label>
        {error && <p style={{ color: "#8C382A", fontFamily: "'EB Garamond', serif", margin: 0 }}>{error}</p>}
        <button type="submit" disabled={!valid || busy}
          style={{ background: valid ? "#8C382A" : "#9C958A", color: "#EAE2D5", fontFamily: "Inter, sans-serif", fontSize: ".78rem", textTransform: "uppercase", letterSpacing: ".12em", padding: "1rem", border: "none", borderRadius: 0, cursor: valid ? "pointer" : "not-allowed" }}>
          {busy ? "Sending…" : "Begin"}
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 4: Run the E2E to verify it passes**

Run: `npx playwright test tests/e2e/intake-funnel.spec.ts -g "shows the portal link"`
Expected: PASS.

- [ ] **Step 5: Polish through impeccable-looped-kit**

Run the loop's Polish phase on `/inquire`: `/audit` (target 0–4 score), `/clarify` (copy), `/harden` (500-name input, long email). Keep brand law. Re-run the E2E after.

- [ ] **Step 6: Commit**

```bash
git add app/inquire/page.tsx tests/e2e/intake-funnel.spec.ts
git commit -m "feat(inquire): public 3-field intake page + on-screen portal link"
```

---

## Task 6: Portal serviceTier + address step

**Files:**
- Modify: `app/portal/[id]/template-design/TemplateDesignClient.tsx` (created in Task 7; if doing Task 6 first, this is still `page.tsx`)

> **Order note:** do Task 7 (the client extraction) FIRST if you prefer the final filename; the edits below apply to the same component either way.

- [ ] **Step 1: Add state for serviceTier + address**

Near the other `useState` hooks add:

```tsx
import { SERVICE_TIERS } from "@/lib/serviceTiers";
// ...
const [serviceTier, setServiceTier] = useState<string | null>(null);
const [address, setAddress] = useState("");
```

- [ ] **Step 2: Render the 4-tier selection + address (the appended "details" step)**

In the confirmation/details portion of the flow (where `venue`/`notes` are collected, before the final submit CTA), render symmetric tier cards (client templates stay symmetric; no border-radius; tier name + architecture + price + narrative). Selection sets `serviceTier`. Example card row:

```tsx
<fieldset style={{ border: "none", padding: 0, margin: 0 }}>
  <legend style={{ fontFamily: "Inter, sans-serif", fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".12em", color: "#5A564E" }}>Installation</legend>
  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginTop: ".75rem" }}>
    {SERVICE_TIERS.map((t) => (
      <button key={t.id} type="button" aria-pressed={serviceTier === t.id} onClick={() => setServiceTier(t.id)}
        style={{ textAlign: "left", border: serviceTier === t.id ? "1px solid #241E1A" : "1px solid #C4B59D", background: "transparent", padding: "1rem", borderRadius: 0, cursor: "pointer" }}>
        <span style={{ fontFamily: "Fraunces, serif", fontSize: "1.05rem" }}>{t.name}</span>
        <span style={{ display: "block", fontFamily: "Inter, sans-serif", fontSize: ".68rem", textTransform: "uppercase", letterSpacing: ".1em", color: "#5A564E" }}>{t.architecture} · ${t.price.toLocaleString()}</span>
        <span style={{ display: "block", marginTop: ".5rem", fontFamily: "'EB Garamond', serif", fontSize: ".9rem", lineHeight: 1.5 }}>{t.narrative}</span>
      </button>
    ))}
  </div>
</fieldset>
```

Add an `address` text input (label "Venue address") next to the existing `venue` field.

- [ ] **Step 3: Add serviceTier + address to the submit payload**

In `confirmSelection`, extend the `payload` object (currently lines ~383–403) with two top-level fields (NOT inside `configuration` — these are typed columns):

```tsx
      serviceTier: serviceTier,
      address: address.trim() || null,
```

Leave the existing `configuration.tier` (preset tier) untouched — it is a different field.

- [ ] **Step 4: Gate submit on a chosen tier (optional but recommended)**

Disable the final submit CTA until `serviceTier` is set; surface a quiet hint if not.

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npm run guard`
Expected: tsc clean; guard P0:0 (no border-radius, single sacred CTA preserved, no forbidden vocab).

- [ ] **Step 6: Commit**

```bash
git add "app/portal/[id]/template-design/"
git commit -m "feat(portal): serviceTier (4-card) + address step → selection payload"
```

---

## Task 7: Portal `lead_hash` server validation

**Files:**
- Create: `app/portal/[id]/template-design/TemplateDesignClient.tsx` (the moved client component)
- Modify→replace: `app/portal/[id]/template-design/page.tsx` (becomes a server wrapper)

- [ ] **Step 1: Extract the client component**

Move the entire current `page.tsx` body into `TemplateDesignClient.tsx`. Keep `"use client"` at the top. Change its default export to a named export that accepts the lead id as a prop:

```tsx
export default function TemplateDesignClient({ id }: { id: string }) { /* …existing body, using `id` instead of reading params… */ }
```

- [ ] **Step 2: Write the failing E2E for hash validation**

```ts
test("portal 404s on an unknown lead_hash", async ({ page }) => {
  const res = await page.goto("/portal/unknownhash000000000000000000000000/template-design");
  expect(res?.status()).toBe(404);
});
```

Run: `npx playwright test tests/e2e/intake-funnel.spec.ts -g "404s on an unknown"`
Expected: FAIL (currently renders for any id).

- [ ] **Step 3: Write the server wrapper `page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import TemplateDesignClient from "./TemplateDesignClient";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id !== "guest") {
    if (!supabaseAdmin) notFound();
    const { data, error } = await supabaseAdmin
      .from("leads")
      .select("lead_hash")
      .eq("lead_hash", id)
      .maybeSingle();
    if (error || !data) notFound();
  }
  return <TemplateDesignClient id={id} />;
}
```

- [ ] **Step 4: Run the E2E to verify it passes**

Run: `npx playwright test tests/e2e/intake-funnel.spec.ts -g "404s on an unknown"`
Expected: PASS (unknown hash → 404; `guest` and real hashes still render).

- [ ] **Step 5: Verify the full app still builds + the existing portal flow works**

Run: `npx tsc --noEmit && npm run build`
Expected: clean; `/portal/[id]/template-design` listed as dynamic (ƒ).

- [ ] **Step 6: Commit**

```bash
git add "app/portal/[id]/template-design/"
git commit -m "feat(portal): server-side lead_hash validation (404 on unknown)"
```

---

## Task 8: Verification gate (full)

**Files:** none (verification only)

- [ ] **Step 1: Static gates**

Run: `npx tsc --noEmit && npm run lint && npm run guard && npm run build`
Expected: tsc 0 errors; eslint 0; guard P0:0 (and template/layout guards pass — catalog untouched); build succeeds with `/inquire` (○ or ƒ) + `/portal/[id]/template-design` (ƒ).

- [ ] **Step 2: E2E**

Run: `npx playwright test tests/e2e/intake-funnel.spec.ts`
Expected: both specs PASS.

- [ ] **Step 3: Local manual E2E (mock email)**

Start `npm run dev`. POST `/api/inquiry` (or use `/inquire`) → confirm a `leads` row appears in Supabase + `lead_hash` returned + `/inquire` shows the on-screen link + `[email:mock]` logged. Click the link → portal validates the hash → pick a template + a serviceTier + address + venue → submit → confirm a `selections` row with `service_tier` + `address` populated + `[email:mock]` operator payload logged with the Tier + Address rows.

- [ ] **Step 4: Real inbox E2E — gated on the Resend key (Jed, in parallel)**

When Jed has minted the key and it is set in Vercel env (`RESEND_API_KEY`), re-run the manual E2E against the deployed preview: confirm the client receives the portal-link email and `kathabooth@gmail.com` receives the operator checklist. No code change — env-only.

- [ ] **Step 5: Update the HAM vault**

Append the ship facts to `.memory/memory.md`, add a `handoff/2026-06-13_intake-funnel-v1_verify.md` artifact + inbox signal, and regenerate `SESSION_HANDOFF.json` (or run `/handoff`).

---

## Self-Review

**Spec coverage:** every spec section maps to a task — `/inquire` (T5), serviceTier+address columns (T1), serviceTiers source (T2), `/api/selection` extension (T4), portal step (T6), `lead_hash` validation (T7), §3 scrub (T2 tier copy + T3 inquiry email), Resend mock (T4 S5), verification (T8). ✅

**Placeholder scan:** all code steps contain complete code; the only deferred decisions (serviceTier→HoneyBook ping; final impeccable polish) are explicitly scoped, not vague. ✅

**Type consistency:** `serviceTier` (string id) + `address` used consistently across T2/T4/T6; `ServiceTierId`/`isServiceTierId`/`getServiceTier` names match T2 definitions; portal payload uses top-level `serviceTier`/`address` (not `configuration`), matching `/api/selection`'s read. The portal's existing preset `tier` is left untouched. ✅

**Known intentional deferrals (not gaps):** the HoneyBook ping payload does not yet carry `serviceTier` (V1 manual handoff reads it from the operator email); add later if the ping is wired.
