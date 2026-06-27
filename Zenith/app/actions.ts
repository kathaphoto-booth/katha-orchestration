'use server';

import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function submitInquiry(lead: any) {
  try {
    if (resend) {
      await resend.emails.send({
        from: 'Katha Booth <hello@kathabooth.com>',
        to: [lead.email],
        subject: `Your Katha Booth Inquiry: ${lead.venue}`,
        html: `
          <div style="font-family: sans-serif; padding: 40px; background-color: #161311; color: #ECE7DB;">
            <h1 style="font-weight: 300; font-size: 24px; color: #ECE7DB; margin-bottom: 24px;">Inquiry Received</h1>
            <p style="font-size: 16px; color: #8F8C8A; line-height: 1.6; margin-bottom: 24px;">
              Thank you, ${lead.name}. We have received your inquiry for ${lead.date} at ${lead.venue}.
            </p>
            <div style="background: rgba(236, 231, 219, 0.05); border: 1px solid rgba(236, 231, 219, 0.12); padding: 24px; border-radius: 2px;">
              <p style="margin: 0 0 12px 0; color: #ECE7DB;"><strong>Package:</strong> ${lead.tier}</p>
              ${lead.template ? `<p style="margin: 0 0 12px 0; color: #ECE7DB;"><strong>Template:</strong> ${lead.template}</p>` : ''}
              ${lead.phone ? `<p style="margin: 0; color: #ECE7DB;"><strong>Phone:</strong> ${lead.phone}</p>` : ''}
            </div>
            <p style="font-size: 14px; color: #8F8C8A; margin-top: 40px;">
              We will review our availability and be in touch shortly with a detailed proposal.
            </p>
          </div>
        `,
      });
    } else {
      console.log('No RESEND_API_KEY found, skipping email notification.');
    }
    return { success: true };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

export async function submitBooking(payload: any) {
  try {
    const { data, error } = await supabaseAdmin
      .from('leads')
      .insert([payload])
      .select();

    if (error) throw new Error(error.message);

    return { success: true, lead: data[0] };
  } catch (error: any) {
    console.error('Error submitting booking:', error);
    return { success: false, error: error.message };
  }
}
