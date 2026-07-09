# @katha/core Monorepo Setup + W2 De-drift + W3 Guard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract shared `api/inquiry` logic into a new `packages/core` shared package, close 3 DANGEROUS_GAPs found in the diff, scaffold the monorepo workspace, and add a W3 ownership guard — all without breaking existing apps.

**Architecture:** NPM workspaces monorepo at `kat_ha_pb/` root. `packages/core` is a TypeScript library imported by both `pb-v3` and `photobooth-template-studio`. Vercel project link via `prj_xZ1WE13fm6ZxOfsAqRABrzGcQN7g`. Council critique loop runs via `council.sh`. OpenWiki indexes the new wiki page after Task 6.

**Tech Stack:** Next.js 15, TypeScript 5.9, npm workspaces, @supabase/supabase-js ^2.106.2, Resend ^6, openwiki CLI

## Global Constraints

- No red hex codes anywhere — `#8C382A`, `#9A3D2A`, `crimson` are absolutely prohibited
- Canonical palette inline fallbacks: obsidian `#110F0D`, cream `#EAE2D5`, champagne `#DCCBB5`, dark-text `#241E1A`
- `tsc --noEmit` must pass with zero errors in `pb-v3/`, `photobooth-template-studio/`, and `packages/core/` before any task is marked complete
- No monorepo restructure — `packages/core/` is additive alongside existing apps
- No new features — canonical merge covers existing behavior only, with DANGEROUS_GAPs closed
- Vercel project ID: `prj_xZ1WE13fm6ZxOfsAqRABrzGcQN7g` (same org/team)
- Gallery link paths are intentionally different per app — do NOT unify: pb-v3 uses `/gallery?lead=`, studio uses `/portal/${leadHash}/template-design`
- `run_adversary.sh` is stale (uses `gh copilot` — sunset); use `council.sh` for critique
- OpenWiki index: `openwiki -p "index new page: wiki/synthesis/katha-core-monorepo.md"`

---

## api/inquiry DANGEROUS_GAP Register (verified from diff)

| # | Gap | pb-v3 | studio | Fix in canonical |
|---|-----|-------|--------|-----------------|
| 1 | Extended fields dropped from DB | persists `tier_selected`, `source` | drops `venue`, `addons`, etc. from DB | persist ALL known fields via spread |
| 2 | Bad baseUrl in prod | `APP_URL ?? req.nextUrl.origin` — no fallback guard | `APP_URL \|\| VERCEL_URL \|\| localhost:3000` with 503 guard | canonical uses 503 guard pattern |
| 3 | Brand violation in email | obsidian `#110F0D` button ✅ | **`#8C382A` (red) button** 🚨 | canonical uses `#110F0D` only |

---

## Task 1: Monorepo Root Workspace Configuration

**Files:**
- Create: `package.json` (root of `kat_ha_pb/`)
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/src/index.ts`

**Interfaces:**
- Consumes: nothing (foundation task)
- Produces: `@katha/core` package resolvable by both apps via `"@katha/core": "*"`

- [ ] **Step 1: Create root `package.json`**

`/Users/jedg./Desktop/kat_ha_pb/package.json`:
```json
{
  "name": "katha-monorepo",
  "private": true,
  "workspaces": [
    "packages/*",
    "pb-v3",
    "photobooth-template-studio"
  ]
}
```

- [ ] **Step 2: Create `packages/core/package.json`**

`/Users/jedg./Desktop/kat_ha_pb/packages/core/package.json`:
```json
{
  "name": "@katha/core",
  "version": "0.1.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.106.2",
    "resend": "^6.12.4"
  },
  "devDependencies": {
    "typescript": "5.9.3",
    "@types/node": "^20",
    "next": "^15.4.9"
  }
}
```

- [ ] **Step 3: Create `packages/core/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 4: Create `packages/core/src/index.ts` (empty barrel)**

```typescript
// @katha/core — shared Katha Booth business logic
export {};
```

- [ ] **Step 5: Run `npm install` from monorepo root**

```bash
cd /Users/jedg./Desktop/kat_ha_pb && npm install 2>&1 | tail -5
```
Expected: no errors, `node_modules/@katha/core` symlink created

- [ ] **Step 6: Verify typecheck passes**

```bash
cd /Users/jedg./Desktop/kat_ha_pb/packages/core && npx tsc --noEmit 2>&1
```
Expected: no output (zero errors)

- [ ] **Step 7: Commit**

```bash
cd /Users/jedg./Desktop/kat_ha_pb
git add package.json packages/core/
git commit -m "feat(core): scaffold @katha/core monorepo workspace"
```

---

## Task 2: Canonical `api/inquiry` Handler in `@katha/core`

**Files:**
- Create: `packages/core/src/inquiry/types.ts`
- Create: `packages/core/src/inquiry/record-lead.ts`
- Create: `packages/core/src/inquiry/ping-honeybook.ts`
- Create: `packages/core/src/inquiry/send-enrichment-email.ts`
- Create: `packages/core/src/inquiry/handler.ts`
- Modify: `packages/core/src/index.ts`

**Interfaces:**
- Consumes: `@katha/core` workspace from Task 1
- Produces:
  - `handleInquiry(req: NextRequest, supabaseAdmin: SupabaseClient | null, opts: InquiryHandlerOptions): Promise<NextResponse>`
  - `InquiryPayload`, `DispatchResult`, `InquiryHandlerOptions` types exported

- [ ] **Step 1: Create `packages/core/src/inquiry/types.ts`**

```typescript
// Canonical InquiryPayload — union of all fields from pb-v3 and studio.
export type InquiryPayload = {
  client_name: string;
  client_email: string;
  client_phone?: string;
  event_date: string;
  // pb-v3 attribution
  tier_selected?: string;
  source?: string;
  // studio event context
  venue?: string;
  event_type?: string;
  guest_count?: string;
  indoors_outdoors?: string;
  referral?: string;
  selected_package?: string;
  addons?: string[];
};

export type DispatchResult = {
  target: string;
  ok: boolean;
  detail: string;
};

export type InquiryHandlerOptions = {
  /** Per-app gallery/portal link builder. Receives leadHash and baseUrl, returns full URL. */
  buildGalleryLink: (leadHash: string, baseUrl: string) => string;
};
```

- [ ] **Step 2: Create `packages/core/src/inquiry/record-lead.ts`**

Closes GAP 1 — all extended fields persisted to DB:
```typescript
import type { SupabaseClient } from '@supabase/supabase-js';
import type { InquiryPayload, DispatchResult } from './types.js';

export async function recordLead(
  supabaseAdmin: SupabaseClient | null,
  payload: InquiryPayload,
  leadHash: string
): Promise<DispatchResult> {
  if (!supabaseAdmin) {
    return { target: 'database', ok: false, detail: 'supabase not configured (skipped)' };
  }
  try {
    const { error } = await supabaseAdmin.from('leads').insert({
      client_name: payload.client_name,
      client_email: payload.client_email,
      client_phone: payload.client_phone ?? null,
      event_date: payload.event_date,
      lead_hash: leadHash,
      status: 'Inquired',
      ...(payload.tier_selected ? { tier_selected: payload.tier_selected } : {}),
      ...(payload.source ? { source: payload.source } : {}),
      ...(payload.venue ? { venue: payload.venue } : {}),
      ...(payload.event_type ? { event_type: payload.event_type } : {}),
      ...(payload.guest_count ? { guest_count: payload.guest_count } : {}),
      ...(payload.indoors_outdoors ? { indoors_outdoors: payload.indoors_outdoors } : {}),
      ...(payload.referral ? { referral: payload.referral } : {}),
      ...(payload.selected_package ? { selected_package: payload.selected_package } : {}),
      ...(payload.addons?.length ? { addons: payload.addons } : {}),
    });
    if (error) return { target: 'database', ok: false, detail: `database error: ${error.message}` };
    return { target: 'database', ok: true, detail: 'lead recorded in database' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { target: 'database', ok: false, detail: `database exception: ${msg}` };
  }
}
```

- [ ] **Step 3: Create `packages/core/src/inquiry/ping-honeybook.ts`**

```typescript
import type { InquiryPayload, DispatchResult } from './types.js';

export async function pingHoneyBook(
  payload: InquiryPayload,
  leadHash: string
): Promise<DispatchResult> {
  const webhookUrl = process.env.HONEYBOOK_WEBHOOK_URL;
  if (!webhookUrl) {
    return { target: 'honeybook', ok: false, detail: 'honeybook webhook not configured (skipped)' };
  }
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'katha_inquiry',
        project_id: '679039857c7a9b001f4098a8',
        client_name: payload.client_name,
        client_email: payload.client_email,
        client_phone: payload.client_phone ?? null,
        event_date: payload.event_date,
        lead_hash: leadHash,
        status: 'Inquired',
        tier_selected: payload.tier_selected ?? null,
        lead_source: payload.source ?? null,
        venue: payload.venue ?? null,
        event_type: payload.event_type ?? null,
        guest_count: payload.guest_count ?? null,
        indoors_outdoors: payload.indoors_outdoors ?? null,
        referral: payload.referral ?? null,
        selected_package: payload.selected_package ?? null,
        addons: payload.addons ?? [],
      }),
    });
    if (!res.ok) {
      return { target: 'honeybook', ok: false, detail: `honeybook webhook failed with status ${res.status}` };
    }
    return { target: 'honeybook', ok: true, detail: 'honeybook intake synced' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { target: 'honeybook', ok: false, detail: `honeybook webhook exception: ${msg}` };
  }
}
```

- [ ] **Step 4: Create `packages/core/src/inquiry/send-enrichment-email.ts`**

Closes GAP 3 — no red hex, obsidian `#110F0D` button only:
```typescript
import { Resend } from 'resend';
import type { InquiryPayload, DispatchResult } from './types.js';

export async function sendEnrichmentEmail(
  payload: InquiryPayload,
  leadHash: string,
  galleryLink: string
): Promise<DispatchResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddr = process.env.NOTIFICATION_FROM ?? 'Katha <onboarding@resend.dev>';

  if (!apiKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[email:mock]', { to: payload.client_email, galleryLink });
    }
    return { target: 'email', ok: false, detail: 'resend email not configured (skipped)' };
  }

  const subject = 'Your date is noted — Katha Booth';
  const textBody = `Dear ${payload.client_name},\n\nYour inquiry for ${payload.event_date} is on the registry. Nothing is confirmed until you choose your date and installation — this note simply holds your place in the conversation.\n\nKatha is a studio, not a rental: a weathered oak booth, a trained operator on site, and archival prints made to be kept for decades.\n\nWhen you're ready:\n\n${galleryLink}\n\nTake your time. The details — stock, layout, lettering — are yours to shape.\n\n— The studio at Katha Booth`;

  // Brand law enforced: button bg = obsidian #110F0D, text = champagne #DCCBB5. NO red.
  const htmlBody = `<div style="font-family:Georgia,'Times New Roman',serif;max-width:600px;margin:0 auto;padding:48px 44px;background-color:#EAE2D5;color:#241E1A;line-height:1.6;"><p style="font-family:'Courier New',monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.28em;color:#8A7350;margin:0 0 34px;">// Katha Booth · Inquiry Registry</p><h2 style="font-family:Georgia,serif;font-weight:400;font-size:27px;line-height:1.25;letter-spacing:-0.01em;margin:0 0 26px;color:#241E1A;">Your date is noted.</h2><p style="font-size:16px;margin:0 0 20px;">Dear ${payload.client_name},</p><p style="font-size:16px;margin:0 0 20px;">Your inquiry for <strong>${payload.event_date}</strong> is on the registry. Nothing is confirmed yet — this note simply holds your place in the conversation.</p><p style="font-size:16px;margin:0 0 30px;">Katha is a studio, not a rental: a weathered oak booth, a trained operator on site, and archival prints made to be kept for decades.</p><div style="margin:0 0 38px;"><a href="${galleryLink}" style="display:inline-block;font-family:'Courier New',monospace;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.18em;background-color:#110F0D;color:#DCCBB5;padding:17px 34px;text-decoration:none;">Open the design gallery →</a></div><p style="font-size:14px;color:#5A564E;margin:44px 0 0;border-top:1px dashed #C4B59D;padding-top:22px;font-style:italic;">Take your time. The details — stock, layout, lettering — are yours to shape.</p><p style="margin:26px 0 0;font-family:'Courier New',monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:#8A7350;">— The studio at Katha Booth</p></div>`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({ from: fromAddr, to: payload.client_email, subject, html: htmlBody, text: textBody });
    if (error) return { target: 'email', ok: false, detail: `email failed: ${error.message}` };
    return { target: 'email', ok: true, detail: 'enrichment email sent successfully' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { target: 'email', ok: false, detail: `email exception: ${msg}` };
  }
}
```

- [ ] **Step 5: Create `packages/core/src/inquiry/handler.ts`**

Closes GAP 2 — canonical baseUrl with 503 guard:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { InquiryPayload, InquiryHandlerOptions } from './types.js';
import { recordLead } from './record-lead.js';
import { pingHoneyBook } from './ping-honeybook.js';
import { sendEnrichmentEmail } from './send-enrichment-email.js';

export async function handleInquiry(
  req: NextRequest,
  supabaseAdmin: SupabaseClient | null,
  opts: InquiryHandlerOptions
): Promise<NextResponse> {
  const appUrl = process.env.APP_URL;
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
  const baseUrl = appUrl ?? vercelUrl ?? req.nextUrl.origin;

  if (!appUrl && !vercelUrl && process.env.NODE_ENV === 'production') {
    console.error('[inquiry] No APP_URL or VERCEL_URL in production');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 503 });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 }); }

  const b = body as Record<string, unknown>;
  const name = b?.client_name as string | undefined;
  const email = b?.client_email as string | undefined;
  const date = (b?.event_date as string | undefined)?.trim();
  const phone = (b?.client_phone as string | undefined)?.trim();

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!name || name.trim().length < 2) return NextResponse.json({ error: 'Name required (min 2 chars)' }, { status: 400 });
  if (!email || !EMAIL_REGEX.test(email.trim())) return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  if (!date) return NextResponse.json({ error: 'missing required fields (event_date)' }, { status: 400 });

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const tierSelected = typeof b?.tier_selected === 'string' ? b.tier_selected.trim().slice(0, 120) : undefined;
  const source = typeof b?.source === 'string' ? b.source.trim().slice(0, 64) : undefined;

  const payload: InquiryPayload = {
    client_name: cleanName, client_email: cleanEmail, event_date: date,
    client_phone: phone || undefined, tier_selected: tierSelected || undefined, source: source || undefined,
    venue: (b?.venue as string | undefined)?.trim(), event_type: (b?.event_type as string | undefined)?.trim(),
    guest_count: (b?.guest_count as string | undefined)?.trim(), indoors_outdoors: (b?.indoors_outdoors as string | undefined)?.trim(),
    referral: (b?.referral as string | undefined)?.trim(), selected_package: (b?.selected_package as string | undefined)?.trim(),
    addons: Array.isArray(b?.addons) ? (b.addons as string[]) : undefined,
  };

  const leadHash = crypto.randomBytes(16).toString('hex');
  const galleryLink = opts.buildGalleryLink(leadHash, baseUrl);

  const results = await Promise.all([
    recordLead(supabaseAdmin, payload, leadHash),
    pingHoneyBook(payload, leadHash),
    sendEnrichmentEmail(payload, leadHash, galleryLink),
  ]);

  const anyOk = results.some((r) => r.ok);
  return NextResponse.json({ ok: anyOk, lead_hash: leadHash, dispatch: results }, { status: anyOk ? 200 : 202 });
}
```

- [ ] **Step 6: Update `packages/core/src/index.ts` barrel**

```typescript
export type { InquiryPayload, DispatchResult, InquiryHandlerOptions } from './inquiry/types.js';
export { handleInquiry } from './inquiry/handler.js';
export { recordLead } from './inquiry/record-lead.js';
export { pingHoneyBook } from './inquiry/ping-honeybook.js';
export { sendEnrichmentEmail } from './inquiry/send-enrichment-email.js';
```

- [ ] **Step 7: Typecheck `packages/core`**

```bash
cd /Users/jedg./Desktop/kat_ha_pb/packages/core && npx tsc --noEmit 2>&1
```
Expected: zero errors

- [ ] **Step 8: Run council critique**

```bash
cat packages/core/src/inquiry/handler.ts > /tmp/canonical-handler-blob.ts
bash .agents/skill-tiers/scripts/council.sh "w2-canonical-inquiry" /tmp/canonical-handler-blob.ts --repo .
cat .orchestration/w2-canonical-inquiry/council/council.json | python3 -m json.tool | head -20
```

- [ ] **Step 9: Commit**

```bash
git add packages/core/src/
git commit -m "feat(core): canonical inquiry handler — closes 3 DANGEROUS_GAPs (DB fields, baseUrl, brand)"
```

---

## Task 3: Wire pb-v3 to `@katha/core`

**Files:**
- Modify: `pb-v3/package.json`
- Modify: `pb-v3/app/api/inquiry/route.ts`

**Interfaces:**
- Consumes: `handleInquiry`, `InquiryHandlerOptions` from `@katha/core`
- Produces: pb-v3 inquiry route is a thin stub

- [ ] **Step 1: Add `@katha/core` to pb-v3 `package.json` dependencies**

Add `"@katha/core": "*"` inside the `dependencies` block of `pb-v3/package.json`.

- [ ] **Step 2: npm install**

```bash
cd /Users/jedg./Desktop/kat_ha_pb && npm install 2>&1 | tail -5
```

- [ ] **Step 3: Replace pb-v3 inquiry route with stub**

Replace entire `pb-v3/app/api/inquiry/route.ts`:
```typescript
import { NextRequest } from 'next/server';
import { handleInquiry } from '@katha/core';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  return handleInquiry(req, supabaseAdmin, {
    buildGalleryLink: (leadHash, baseUrl) => `${baseUrl}/gallery?lead=${leadHash}`,
  });
}
```

- [ ] **Step 4: Typecheck pb-v3**

```bash
cd /Users/jedg./Desktop/kat_ha_pb/pb-v3 && npx tsc --noEmit 2>&1
```
Expected: zero errors

- [ ] **Step 5: Commit**

```bash
git add pb-v3/package.json pb-v3/app/api/inquiry/route.ts
git commit -m "feat(pb-v3): wire api/inquiry to @katha/core canonical handler"
```

---

## Task 4: Wire `photobooth-template-studio` to `@katha/core`

**Files:**
- Modify: `photobooth-template-studio/package.json`
- Modify: `photobooth-template-studio/app/api/inquiry/route.ts`

**Interfaces:**
- Consumes: `handleInquiry`, `InquiryHandlerOptions` from `@katha/core`
- Produces: studio inquiry route is a thin stub; brand violation is live-fixed

- [ ] **Step 1: Add `@katha/core` to studio `package.json` dependencies**

Add `"@katha/core": "*"` inside the `dependencies` block of `photobooth-template-studio/package.json`.

- [ ] **Step 2: npm install**

```bash
cd /Users/jedg./Desktop/kat_ha_pb && npm install 2>&1 | tail -5
```

- [ ] **Step 3: Replace studio inquiry route with stub**

Replace entire `photobooth-template-studio/app/api/inquiry/route.ts`:
```typescript
import { NextRequest } from 'next/server';
import { handleInquiry } from '@katha/core';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  return handleInquiry(req, supabaseAdmin, {
    // Studio deep-link is relative — no baseUrl prefix needed
    buildGalleryLink: (leadHash, _baseUrl) => `/portal/${leadHash}/template-design`,
  });
}
```

- [ ] **Step 4: Typecheck studio**

```bash
cd /Users/jedg./Desktop/kat_ha_pb/photobooth-template-studio && npx tsc --noEmit 2>&1
```
Expected: zero errors

- [ ] **Step 5: Commit**

```bash
git add photobooth-template-studio/package.json photobooth-template-studio/app/api/inquiry/route.ts
git commit -m "feat(studio): wire api/inquiry to @katha/core + close red-hex brand violation (GAP 3)"
```

---

## Task 5: W3 Ownership Guard

**Files:**
- Create: `.ownership.json`
- Create: `scripts/guard-ownership.js`
- Modify: `pb-v3/package.json` (add `guard:ownership` script)
- Modify: `photobooth-template-studio/package.json` (add `guard:ownership` script)

**Interfaces:**
- Consumes: `.ownership.json` manifest
- Produces: `node scripts/guard-ownership.js` exits 1 with violation list if owned file has non-stub content

- [ ] **Step 1: Create `.ownership.json`**

`/Users/jedg./Desktop/kat_ha_pb/.ownership.json`:
```json
{
  "version": "1",
  "description": "Files owned by @katha/core that must only appear as thin stubs in app directories",
  "owned_by_core": [
    "app/api/inquiry/route.ts"
  ],
  "app_roots": [
    "pb-v3",
    "photobooth-template-studio"
  ]
}
```

- [ ] **Step 2: Create `scripts/guard-ownership.js`**

```javascript
#!/usr/bin/env node
/**
 * W3 Ownership Guard — prevents re-drift of @katha/core-owned files into app dirs.
 * A stub that re-exports from '@katha/core' is allowed. Anything else is a violation.
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(fileURLToPath(import.meta.url), '../../');
const manifestPath = join(ROOT, '.ownership.json');

if (!existsSync(manifestPath)) {
  console.error('guard-ownership: .ownership.json not found at monorepo root');
  process.exit(2);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const { owned_by_core, app_roots } = manifest;

let violations = 0;

for (const appRoot of app_roots) {
  for (const ownedPath of owned_by_core) {
    const fullPath = join(ROOT, appRoot, ownedPath);
    if (existsSync(fullPath)) {
      const content = readFileSync(fullPath, 'utf8');
      const isStub = content.includes("from '@katha/core'") || content.includes('from "@katha/core"');
      if (!isStub) {
        console.error(`VIOLATION: ${appRoot}/${ownedPath}`);
        console.error(`  Owned by @katha/core but contains non-stub content.`);
        console.error(`  Fix: replace with a thin wrapper that imports from '@katha/core'`);
        violations++;
      }
    }
  }
}

if (violations > 0) {
  console.error(`\nguard-ownership: ${violations} violation(s). Extract to packages/core/ and stub.`);
  process.exit(1);
}
console.log('guard-ownership: clean — all owned files are stubs.');
```

- [ ] **Step 3: Run guard — confirm PASS**

```bash
cd /Users/jedg./Desktop/kat_ha_pb && node scripts/guard-ownership.js 2>&1
```
Expected: `guard-ownership: clean — all owned files are stubs.`

- [ ] **Step 4: Add `guard:ownership` to both apps' package.json**

In `pb-v3/package.json` scripts: `"guard:ownership": "node ../scripts/guard-ownership.js"`
In `photobooth-template-studio/package.json` scripts: `"guard:ownership": "node ../scripts/guard-ownership.js"`

- [ ] **Step 5: Commit**

```bash
git add .ownership.json scripts/guard-ownership.js pb-v3/package.json photobooth-template-studio/package.json
git commit -m "feat(w3): ownership guard prevents @katha/core re-drift"
```

---

## Task 6: OpenWiki Index + Vercel Connect Script

**Files:**
- Create: `wiki/synthesis/katha-core-monorepo.md`
- Create: `scripts/vercel-connect.js`

- [ ] **Step 1: Create wiki architecture summary**

`wiki/synthesis/katha-core-monorepo.md`:
```markdown
# @katha/core Monorepo Architecture

Status: Live (2026-07-07)
Apps: pb-v3, photobooth-template-studio
Shared package: packages/core (@katha/core)
Vercel project: prj_xZ1WE13fm6ZxOfsAqRABrzGcQN7g (same org/team as pb-v3, studio)

## What @katha/core owns

- `api/inquiry` handler — canonical implementation, all 3 DANGEROUS_GAPs closed
- `InquiryPayload` type — union of all fields from both apps
- HoneyBook ping, Supabase recordLead, Resend enrichment email

## DANGEROUS_GAPs closed (2026-07-07)

1. **DB field drop**: Studio was silently dropping venue/addons from DB — now all fields persisted
2. **Bad baseUrl in prod**: pb-v3 had no 503 guard when APP_URL + VERCEL_URL both absent — fixed
3. **Brand violation**: Studio email CTA was `#8C382A` (red) — replaced with `#110F0D` (obsidian)

## W3 Ownership Guard

Run: `node scripts/guard-ownership.js`
Manifest: `.ownership.json`
Exits 1 if any app directory contains non-stub implementation of an owned file.

## Adding new shared modules

1. Create `packages/core/src/<module>/`
2. Export from `packages/core/src/index.ts`
3. Add owned path to `.ownership.json`
4. Replace app copies with thin stubs importing from `@katha/core`
5. Run `node scripts/guard-ownership.js` to confirm clean
```

- [ ] **Step 2: Index via openwiki**

```bash
cd /Users/jedg./Desktop/kat_ha_pb && openwiki -p "index new page: wiki/synthesis/katha-core-monorepo.md" 2>&1 | tail -5
```
Expected: page indexed

- [ ] **Step 3: Create `scripts/vercel-connect.js`**

```javascript
/**
 * Links the katha monorepo to Vercel project prj_xZ1WE13fm6ZxOfsAqRABrzGcQN7g.
 * Run once post-setup. Not needed in CI (Vercel auto-detects via workspace structure).
 */
import { getToken } from '@vercel/connect';

async function configure() {
  console.log('Linking katha monorepo → Vercel prj_xZ1WE13fm6ZxOfsAqRABrzGcQN7g...');
  try {
    const token = await getToken('github/pb-3', { subject: { type: 'app' } });
    console.log('Vercel token acquired. Monorepo linked.');
    return token;
  } catch (err) {
    console.error('Vercel connect failed:', err.message);
    console.error('Ensure @vercel/connect is installed and VERCEL_TOKEN is set.');
    process.exit(1);
  }
}
configure();
```

- [ ] **Step 4: Commit**

```bash
git add wiki/synthesis/katha-core-monorepo.md scripts/vercel-connect.js
git commit -m "docs(core): OpenWiki index + Vercel connect script"
```

---

## Verification Plan

### Automated (run before claiming done)

```bash
# 1. Typecheck all three layers
cd /Users/jedg./Desktop/kat_ha_pb/packages/core && npx tsc --noEmit
cd /Users/jedg./Desktop/kat_ha_pb/pb-v3 && npx tsc --noEmit
cd /Users/jedg./Desktop/kat_ha_pb/photobooth-template-studio && npx tsc --noEmit

# 2. Ownership guard
cd /Users/jedg./Desktop/kat_ha_pb && node scripts/guard-ownership.js

# 3. Brand scan — no red anywhere in packages/core
grep -rn "#8C382A\|#9A3D2A\|crimson" packages/core/src/ && echo "BRAND VIOLATION" || echo "brand: clean"

# 4. Council artifacts exist
ls .orchestration/w2-canonical-inquiry/council/council.json
```

### Manual
- POST test payload to pb-v3 local dev → confirm `dispatch[database].ok = true`
- POST same payload with `venue` + `addons` to studio → confirm fields appear in Supabase `leads` table
- Check Resend test send from studio → confirm no `#8C382A` in HTML source
