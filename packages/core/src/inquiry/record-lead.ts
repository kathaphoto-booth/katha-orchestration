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
