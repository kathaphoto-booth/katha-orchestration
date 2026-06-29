'use server';

import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export type Lead = {
  id: string;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  event_date: string | null;
  status: string | null;
  final_template_id: string | null;
  final_date: string | null;
  notes: string | null;
  finalized_at: string | null;
};

export async function getLead(id: string): Promise<Lead | null> {
  const { data, error } = await supabaseAdmin.from('leads').select('*').eq('id', id).maybeSingle();
  if (error) { console.error('getLead:', error); return null; }
  return (data as Lead) ?? null;
}

export async function getBookedDates(): Promise<string[]> {
  const { data, error } = await supabaseAdmin.from('booked_dates').select('date');
  if (error) { console.error('getBookedDates:', error); return []; }
  return (data ?? []).map((r: { date: string }) => r.date);
}

export async function finalizeBooking(leadId: string, payload: {
  final_template_id: string | null;
  final_date: string;
  notes?: string;
}) {
  try {
    const { error } = await supabaseAdmin
      .from('leads')
      .update({ ...payload, finalized_at: new Date().toISOString() })
      .eq('id', leadId);
    if (error) throw new Error(error.message);

    if (resend) {
      await resend.emails.send({
        from: 'Katha Booth <hello@kathabooth.com>',
        to: 'kathabooth@gmail.com',
        subject: `Booking Finalized: ${leadId}`,
        html: `<p>Lead ${leadId} finalized template + date.</p><pre>${JSON.stringify(payload, null, 2)}</pre>`,
      });
    }
    return { success: true };
  } catch (error: any) {
    console.error('finalizeBooking:', error);
    return { success: false, error: error.message };
  }
}
