import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { InquiryPayload, InquiryHandlerOptions, DateStatus } from './types.js';
import { recordLead } from './record-lead.js';
import { pingHoneyBook } from './ping-honeybook.js';
import { sendEnrichmentEmail } from './send-enrichment-email.js';

export async function handleInquiry(
  req: NextRequest,
  supabaseAdmin: SupabaseClient | null,
  opts: InquiryHandlerOptions
): Promise<NextResponse> {
  // `||` not `??`: an empty-string APP_URL (seen once in seeded Vercel env)
  // must fall through to VERCEL_URL, or email gallery links render relative.
  const appUrl = process.env.APP_URL || undefined;
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

  // Durable capture FIRST — a lead must never depend on email delivery. The
  // database row is the source of truth; the HoneyBook ping and enrichment
  // email ride on top of it. If the DB write fails while Supabase is
  // configured, return 503 so the client retries rather than losing the lead.
  const dbSettled = await Promise.allSettled([recordLead(supabaseAdmin, payload, leadHash)]);
  const dbResult = dbSettled[0].status === 'fulfilled'
    ? dbSettled[0].value
    : { target: 'database', ok: false, detail: `unexpected failure: ${String(dbSettled[0].reason)}` };
  const supabaseConfigured = !!supabaseAdmin;
  if (supabaseConfigured && !dbResult.ok) {
    console.error('[LEAD_CAPTURE_FAILED]', JSON.stringify({ payload, leadHash, detail: dbResult.detail }));
    return NextResponse.json(
      { ok: false, error: 'capture failed — please retry', lead_hash: leadHash, dispatch: [dbResult] },
      { status: 503 },
    );
  }

  // Truthful date status for the auto-reply — best-effort, never blocks.
  // Claims 'open' only when the available_dates allow-list confirms it.
  let dateStatus: DateStatus = 'unknown';
  if (supabaseAdmin) {
    try {
      const { data: dateRow } = await supabaseAdmin
        .from('available_dates')
        .select('status')
        .eq('date', date)
        .maybeSingle();
      if (dateRow?.status === 'open') dateStatus = 'open';
    } catch {
      // stays 'unknown' — the email then makes no availability claim
    }
  }

  // Notifications — best-effort, never block capture.
  const notifySettled = await Promise.allSettled([
    pingHoneyBook(payload, leadHash),
    sendEnrichmentEmail(payload, leadHash, galleryLink, dateStatus),
  ]);
  const [honeybookResult, emailResult] = notifySettled.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : { target: i === 0 ? 'honeybook' : 'email', ok: false, detail: `unexpected failure: ${String(r.reason)}` },
  );

  const notified = honeybookResult.ok || emailResult.ok;
  const captured = supabaseConfigured ? dbResult.ok : notified;
  // A captured-but-unnotified lead must never look like a clean success.
  if (captured && !notified) {
    console.error('[UNNOTIFIED_LEAD]', JSON.stringify({
      leadHash, name: payload.client_name, email: payload.client_email, date: payload.event_date,
      honeybook: honeybookResult.detail, emailDetail: emailResult.detail,
    }));
  }

  const results = [dbResult, honeybookResult, emailResult];
  return NextResponse.json(
    { ok: captured, notified, lead_hash: leadHash, dispatch: results },
    { status: captured ? 200 : 202 },
  );
}
