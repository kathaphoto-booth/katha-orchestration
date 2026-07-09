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
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 });
  }

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
    client_name: cleanName,
    client_email: cleanEmail,
    event_date: date,
    client_phone: phone || undefined,
    tier_selected: tierSelected || undefined,
    source: source || undefined,
    venue: (b?.venue as string | undefined)?.trim(),
    event_type: (b?.event_type as string | undefined)?.trim(),
    guest_count: (b?.guest_count as string | undefined)?.trim(),
    indoors_outdoors: (b?.indoors_outdoors as string | undefined)?.trim(),
    referral: (b?.referral as string | undefined)?.trim(),
    selected_package: (b?.selected_package as string | undefined)?.trim(),
    addons: Array.isArray(b?.addons) ? (b.addons as string[]) : undefined,
  };

  const leadHash = crypto.randomBytes(16).toString('hex');
  const galleryLink = opts.buildGalleryLink(leadHash, baseUrl);

  const settledResults = await Promise.allSettled([
    recordLead(supabaseAdmin, payload, leadHash),
    pingHoneyBook(payload, leadHash),
    sendEnrichmentEmail(payload, leadHash, galleryLink),
  ]);

  const results = settledResults.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    const target = i === 0 ? 'database' : i === 1 ? 'honeybook' : 'email';
    return { target, ok: false, detail: `unexpected failure: ${String(r.reason)}` };
  });

  const anyOk = results.some((r) => r.ok);
  return NextResponse.json({ ok: anyOk, lead_hash: leadHash, dispatch: results }, { status: anyOk ? 200 : 202 });
}
