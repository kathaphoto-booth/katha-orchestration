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
    const { error } = await resend.emails.send({
      from: fromAddr,
      to: payload.client_email,
      subject,
      html: htmlBody,
      text: textBody
    });
    if (error) return { target: 'email', ok: false, detail: `email failed: ${error.message}` };
    return { target: 'email', ok: true, detail: 'enrichment email sent successfully' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { target: 'email', ok: false, detail: `email exception: ${msg}` };
  }
}
