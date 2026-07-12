import { Resend } from 'resend';
import type { InquiryPayload, DispatchResult, DateStatus } from './types.js';

// Speed-to-lead promise (council launch-funnel-first, lever 4): the auto-reply
// carries a specific, keepable reply-time commitment. Before 5pm Pacific the
// studio answers the same evening; after that, by noon the next day.
export function replyPromise(now = new Date()): string {
  const hour = Number(
    now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', hour12: false })
  );
  return hour < 17
    ? 'You will have a personal reply from the studio by 9pm Pacific tonight.'
    : 'You will have a personal reply from the studio by noon Pacific tomorrow.';
}

// ISO YYYY-MM-DD → "October 17, 2026" by string parts — never new Date(iso),
// which parses as midnight UTC and renders Oct 17 as Oct 16 in PT. Non-ISO
// input passes through untouched.
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export function formatEventDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  const month = MONTHS[Number(m[2]) - 1];
  return month ? `${month} ${Number(m[3])}, ${m[1]}` : iso;
}

/** Pure email builder — no I/O, so previews and tests can render it directly. */
export function buildEnrichmentEmail(
  payload: InquiryPayload,
  galleryLink: string,
  dateStatus: DateStatus = 'unknown'
): { subject: string; textBody: string; htmlBody: string } {
  const dateOpen = dateStatus === 'open';
  const tierName = payload.tier_selected || payload.selected_package;
  const promise = replyPromise();
  const prettyDate = formatEventDate(payload.event_date);

  // Voice canon (wiki voice-and-tone): short declaratives, materials and
  // numbers, no exclamation marks, studio speaks as the studio. Date status
  // is only claimed when the calendar confirmed it (truth over urgency).
  const subject = dateOpen
    ? `${prettyDate} is open on the calendar — Katha Booth`
    : 'Your inquiry is on the registry — Katha Booth';

  const statusLineText = dateOpen
    ? `${prettyDate} is open on the studio calendar as of this note. Weekends hold fast; nothing is confirmed until the contract is signed.`
    : `Your inquiry for ${prettyDate} is on the registry. The studio checks every date personally; nothing is confirmed until the contract is signed.`;

  const tierLineText = tierName
    ? `Your selection, ${tierName}, is saved to your gallery.`
    : '';

  const proofLineText =
    'The studio, in materials and numbers: an oak DSLR installation, a trained operator on site, up to 3 hours of print service, and archival 2×6 or 4×6 prints made to be kept for decades.';

  const textBody = `Dear ${payload.client_name},

${statusLineText}
${tierLineText ? `\n${tierLineText}\n` : ''}
${proofLineText}

Your design gallery is open. Stock, layout, lettering: yours to shape.

${galleryLink}

${promise}

— The studio at Katha Booth`;

  const heading = dateOpen ? `${prettyDate} is open.` : 'Your inquiry is on the registry.';

  // Brand law enforced: button bg = obsidian #110F0D, text = champagne #DCCBB5. NO red.
  const htmlBody = `<div style="font-family:Georgia,'Times New Roman',serif;max-width:600px;margin:0 auto;padding:48px 44px;background-color:#EAE2D5;color:#241E1A;line-height:1.6;"><p style="font-family:'Courier New',monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.28em;color:#8A7350;margin:0 0 34px;">// Katha Booth · Inquiry Registry</p><h2 style="font-family:Georgia,serif;font-weight:400;font-size:27px;line-height:1.25;letter-spacing:-0.01em;margin:0 0 26px;color:#241E1A;">${heading}</h2><p style="font-size:16px;margin:0 0 20px;">Dear ${payload.client_name},</p><p style="font-size:16px;margin:0 0 20px;">${statusLineText}</p>${tierLineText ? `<p style="font-size:16px;margin:0 0 20px;">${tierLineText}</p>` : ''}<p style="font-size:16px;margin:0 0 30px;">${proofLineText}</p><div style="margin:0 0 18px;"><a href="${galleryLink}" style="display:inline-block;font-family:'Courier New',monospace;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.18em;background-color:#110F0D;color:#DCCBB5;padding:17px 34px;text-decoration:none;">Open your design gallery →</a></div><p style="font-size:15px;margin:0 0 38px;color:#241E1A;">${promise}</p><p style="font-size:14px;color:#5A564E;margin:44px 0 0;border-top:1px dashed #C4B59D;padding-top:22px;font-style:italic;">Take your time. Stock, layout, lettering: yours to shape.</p><p style="margin:26px 0 0;font-family:'Courier New',monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.14em;color:#8A7350;">— The studio at Katha Booth</p></div>`;

  return { subject, textBody, htmlBody };
}

export async function sendEnrichmentEmail(
  payload: InquiryPayload,
  leadHash: string,
  galleryLink: string,
  dateStatus: DateStatus = 'unknown'
): Promise<DispatchResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddr = process.env.NOTIFICATION_FROM ?? 'Katha <onboarding@resend.dev>';

  if (!apiKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[email:mock]', { to: payload.client_email, galleryLink, dateStatus });
    }
    return { target: 'email', ok: false, detail: 'resend email not configured (skipped)' };
  }

  const { subject, textBody, htmlBody } = buildEnrichmentEmail(payload, galleryLink, dateStatus);

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
