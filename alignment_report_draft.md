# Katha Architecture & Alignment Report

## 1. Project Boundaries & Source of Truth
- **Source of Truth (Backend & Legacy Frontend):** `~/Desktop/kat_ha_pb/pb-v3`
- **Extracted Gilded Archive (New UI):** `~/Desktop/Zenith`
- All other legacy folders (`pb-v1`, `pb-v2`, `gemini_draft`, etc.) have been safely purged to reclaim 2.8 GB of space. Zenith has been untracked from the `kat_ha_pb` repository to enforce strict isolation.

## 2. Template Audit Mandate (`lib/templates.ts`)
- Both `Zenith` and `pb-v3` contain 82 presets, but Zenith requires a surgical 3-way audit to purge the "Studio Aesthetic" debris.
- `Zenith` holds the Brutalist Dark styling (`hanken-grotesk` font injected).
- `pb-v3` holds the legacy presets. The extraction must isolate Zenith to contain ONLY the Gilded Archive aesthetic.

## 3. Vercel Deployment & Auth Injection
- **Deployment Target:** `pb-v3` was pushed to Vercel via CLI but failed the cloud build at the `npm install` step. A package tree audit is required to fix this.
- **Connection Authentication:** The GitHub connection (`github/pb-3`) must be authenticated utilizing the `@vercel/connect` token SDK.
- Auth payload to be implemented:
\`\`\`typescript
import { getToken } from '@vercel/connect';
getToken('github/pb-3', { subject: { type: "user", id: "usr_123" } });
getToken('github/pb-3', { subject: { type: "app" } });
\`\`\`
Token constant: **[REDACTED 2026-07-08 — leaked Vercel token removed from the repo. Revoke it in the Vercel dashboard (Account Settings → Tokens) and store the replacement only in the project env var `VERCEL_TOKEN`; never commit it. Note: `@vercel/connect`'s `getToken()` takes an env-based connector reference (e.g. `process.env.CONNECTOR_GITHUB`), not a hardcoded `scl_…` token — the snippet above is not a valid auth mechanism.]**

## Summary for Council Review
Are these files perfectly aligned to avoid any misconfiguration? Specifically:
1. Is isolating Zenith on the Desktop while tracking `pb-v3` as the inner repo robust?
2. Are there any hidden risks in executing the Vercel connection injection as described above?
