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
