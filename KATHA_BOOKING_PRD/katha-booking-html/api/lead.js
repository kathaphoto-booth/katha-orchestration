/**
 * Katha Booth — /api/lead
 * Single Vercel Node serverless function (Node 18+, zero npm dependencies).
 *
 * Routes (POST JSON, `action` field):
 *   - action:'lead'      (default) → whitelisted insert into Supabase `leads`
 *                          + best-effort Resend notification to Katha.
 *   - action:'selection'           → whitelisted insert into Supabase `selections`.
 *   - action:'email'               → client confirmation email via Resend.
 *
 * Env (Vercel project settings — PRD §14.2):
 *   SUPABASE_URL               (optional — falls back to the live project url)
 *   SUPABASE_SERVICE_ROLE_KEY  (required for 'lead'/'selection'; NEVER in the repo)
 *   RESEND_API_KEY             (required for 'email'; best-effort for 'lead')
 *
 * Field contract per PRD §7.4 — do NOT mirror Zenith/app/actions.ts field names.
 */
'use strict';

// ── Constants ────────────────────────────────────────────────────────────────
// SENDER: onboarding@resend.dev is the ONLY verified Resend sender at launch.
// Swap to 'Katha Booth <hello@kathabooth.com>' once the kathabooth.com domain
// is verified in Resend (PRD §14.2). One constant, one swap.
const SENDER = 'Katha Booth <onboarding@resend.dev>';
const NOTIFY_TO = 'kathabooth@gmail.com'; // content.json _meta.contactEmail

// Fallback = content.json supabase.url (live project hvvomiyskizxzhyytcfd).
const SUPABASE_URL_FALLBACK = 'https://hvvomiyskizxzhyytcfd.supabase.co';

const MAX_BODY_BYTES = 100 * 1024; // 100KB sanity cap
const FETCH_TIMEOUT_MS = 10000; // 10s on every outbound fetch

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Print-stock tokens for email HTML (PRD §4.1 — bone paper / charcoal ink).
const PAPER = '#F7F5F1';
const INK = '#2C2523';
const MONO = "'Courier New', Courier, monospace";
const BODY_FONT = "Georgia, 'Times New Roman', serif";

// ── Small utilities ──────────────────────────────────────────────────────────
function getEnv() {
  return {
    supabaseUrl: String(process.env.SUPABASE_URL || SUPABASE_URL_FALLBACK).replace(/\/+$/, ''),
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    resendKey: process.env.RESEND_API_KEY || '',
  };
}

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function isObj(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/** Trimmed string or '' — never throws. */
function str(v) {
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

/** Nullable TEXT column value: objects/arrays → JSON.stringify, else trimmed string, else null. */
function toText(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'object') {
    try {
      return JSON.stringify(v);
    } catch (err) {
      return null;
    }
  }
  const s = String(v).trim();
  return s || null;
}

function esc(s) {
  return String(s === null || s === undefined ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** camelCase / snake_case key → human label. */
function labelize(k) {
  return String(k)
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^\w/, (c) => c.toUpperCase());
}

/** Pretty-render a TEXT field that may hold JSON (addons / notes) into safe HTML lines. */
function prettyBlock(text) {
  if (!text) return '&mdash;';
  try {
    const v = JSON.parse(text);
    if (Array.isArray(v)) {
      const lines = v.map((item) =>
        esc(typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item))
      );
      return lines.length ? lines.join('<br>') : '&mdash;';
    }
    if (isObj(v)) {
      const lines = Object.entries(v)
        .filter(([, val]) => val !== null && val !== undefined && val !== '')
        .map(([k, val]) => {
          const shown = typeof val === 'object' ? JSON.stringify(val) : String(val);
          return esc(labelize(k)) + ': ' + esc(shown);
        });
      return lines.length ? lines.join('<br>') : '&mdash;';
    }
    return esc(String(v));
  } catch (err) {
    return esc(text);
  }
}

/** fetch with a hard 10s AbortController timeout. */
async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, Object.assign({}, options, { signal: controller.signal }));
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Parse the JSON body safely. Handles both the Vercel runtime (req.body
 * pre-parsed; the lazy getter can throw on malformed JSON) and a raw Node
 * stream fallback. Returns { ok, body } or { ok:false, status, error }.
 */
async function readJsonBody(req) {
  let raw;
  try {
    if (req.body !== undefined && req.body !== null) {
      if (isObj(req.body)) return { ok: true, body: req.body };
      if (Array.isArray(req.body)) {
        return { ok: false, status: 400, error: 'body must be a JSON object' };
      }
      raw = String(req.body);
    }
  } catch (err) {
    return { ok: false, status: 400, error: 'malformed JSON body' };
  }

  if (raw === undefined) {
    const chunks = [];
    let size = 0;
    try {
      for await (const chunk of req) {
        size += chunk.length;
        if (size > MAX_BODY_BYTES) return { ok: false, status: 413, error: 'payload too large' };
        chunks.push(chunk);
      }
    } catch (err) {
      return { ok: false, status: 400, error: 'unreadable request body' };
    }
    raw = Buffer.concat(chunks).toString('utf8');
  }

  if (!raw || !raw.trim()) return { ok: true, body: {} };
  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
    return { ok: false, status: 413, error: 'payload too large' };
  }
  try {
    const parsed = JSON.parse(raw);
    if (!isObj(parsed)) return { ok: false, status: 400, error: 'body must be a JSON object' };
    return { ok: true, body: parsed };
  } catch (err) {
    return { ok: false, status: 400, error: 'malformed JSON body' };
  }
}

// ── Outbound transports ──────────────────────────────────────────────────────
/** Supabase REST call with service-role auth. Never leaks the key; logs failures server-side. */
async function supabaseRequest(method, url, serviceKey, bodyObj) {
  try {
    const resp = await fetchWithTimeout(url, {
      method,
      headers: {
        apikey: serviceKey,
        Authorization: 'Bearer ' + serviceKey,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: bodyObj !== undefined ? JSON.stringify(bodyObj) : undefined,
    });
    const text = await resp.text().catch(() => '');
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch (err) {
      json = null;
    }
    return { ok: resp.ok, status: resp.status, text, json };
  } catch (err) {
    console.error('[supabase] request failed:', (err && err.message) || err);
    return { ok: false, status: 0, text: '', json: null };
  }
}

/** Send an email via Resend. Returns true/false; never throws. */
async function sendResend(apiKey, message) {
  try {
    const resp = await fetchWithTimeout('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      console.error('[resend] send failed:', resp.status, text.slice(0, 500));
      return false;
    }
    return true;
  } catch (err) {
    console.error('[resend] send error:', (err && err.message) || err);
    return false;
  }
}

// ── Email HTML ───────────────────────────────────────────────────────────────
/** Internal notification to Katha — clean, minimal dark-on-light summary table. */
function notificationHtml(row) {
  const kv = [
    ['Name', esc(row.client_name)],
    ['Email', esc(row.client_email)],
    ['Phone', row.client_phone ? esc(row.client_phone) : '&mdash;'],
    ['Event date', esc(row.event_date)],
    ['Venue', row.venue_name ? esc(row.venue_name) : '&mdash;'],
    ['Tier', row.tier_selected ? esc(row.tier_selected) : '&mdash;'],
    ['Add-ons', prettyBlock(row.addons)],
    ['Notes', prettyBlock(row.notes)],
    ['Lead hash', esc(row.lead_hash)],
  ];
  const rows = kv
    .map(
      ([label, valueHtml]) =>
        '<tr>' +
        '<td style="padding:10px 16px 10px 0;font-family:' + MONO + ';font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:' + INK + ';vertical-align:top;white-space:nowrap;border-bottom:1px solid rgba(44,37,35,0.12);">' +
        label +
        '</td>' +
        '<td style="padding:10px 0;font-family:' + BODY_FONT + ';font-size:14px;line-height:1.5;color:' + INK + ';vertical-align:top;border-bottom:1px solid rgba(44,37,35,0.12);">' +
        valueHtml +
        '</td>' +
        '</tr>'
    )
    .join('');
  return (
    '<div style="background-color:' + PAPER + ';padding:40px 24px;">' +
    '<div style="max-width:560px;margin:0 auto;color:' + INK + ';">' +
    '<p style="margin:0 0 20px;font-family:' + MONO + ';font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:' + INK + ';">// New Inquiry &middot; Katha Booth</p>' +
    '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">' +
    rows +
    '</table>' +
    '<p style="margin:24px 0 0;font-family:' + MONO + ';font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:' + INK + ';opacity:0.6;">Plate No. 2026-CF &middot; &copy;2026 Katha Booth</p>' +
    '</div>' +
    '</div>'
  );
}

/** Client confirmation — restrained, on-brand: bone paper, charcoal ink, Courier meta. */
function clientConfirmationHtml(d) {
  const summary = [
    ['Registry date', d.date],
    ['Venue', d.venue],
    ['Installation', d.tier],
    ['Estimate', d.price],
    ['Registry no.', d.leadId ? 'KATHA-' + d.leadId : ''],
  ]
    .filter(([, v]) => v)
    .map(
      ([label, value]) =>
        '<tr>' +
        '<td style="padding:10px 16px 10px 0;font-family:' + MONO + ';font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:' + INK + ';white-space:nowrap;vertical-align:top;border-bottom:1px solid rgba(44,37,35,0.12);">' +
        esc(label) +
        '</td>' +
        '<td style="padding:10px 0;font-family:' + BODY_FONT + ';font-size:14px;line-height:1.5;color:' + INK + ';vertical-align:top;border-bottom:1px solid rgba(44,37,35,0.12);">' +
        esc(value) +
        '</td>' +
        '</tr>'
    )
    .join('');
  return (
    '<div style="background-color:' + PAPER + ';padding:48px 24px;">' +
    '<div style="max-width:520px;margin:0 auto;color:' + INK + ';">' +
    '<p style="margin:0 0 24px;font-family:' + MONO + ';font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:' + INK + ';">// Inquiry Received</p>' +
    '<h1 style="margin:0 0 16px;font-family:' + BODY_FONT + ';font-weight:400;font-size:26px;line-height:1.25;color:' + INK + ';">Inquiry registered &amp; secured.</h1>' +
    '<p style="margin:0 0 28px;font-family:' + BODY_FONT + ';font-size:15px;line-height:1.6;color:' + INK + ';">' +
    'Thank you' + (d.name ? ', ' + esc(d.name) : '') + '. Your requested date is logged with the studio.' +
    '</p>' +
    (summary
      ? '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 28px;">' + summary + '</table>'
      : '') +
    '<p style="margin:0 0 32px;font-family:' + BODY_FONT + ';font-size:15px;line-height:1.6;color:' + INK + ';">' +
    "We'll review availability and reply with a detailed proposal." +
    '</p>' +
    '<p style="margin:0;font-family:' + MONO + ';font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:' + INK + ';opacity:0.6;">Katha Booth &middot; Los Angeles &amp; Orange County &middot; Plate No. 2026-CF</p>' +
    '</div>' +
    '</div>'
  );
}

// ── Route handlers ───────────────────────────────────────────────────────────
/**
 * action:'lead' — whitelisted insert into `leads` (PRD §7.4). Idempotent on
 * duplicate lead_hash. Resend notification is best-effort: its failure must
 * never fail the lead.
 */
async function handleLead(body, res) {
  const { supabaseUrl, serviceKey, resendKey } = getEnv();
  if (!serviceKey) {
    console.error('[lead] SUPABASE_SERVICE_ROLE_KEY missing');
    return send(res, 503, { success: false, error: 'server not configured' });
  }

  const src = isObj(body.lead) ? body.lead : body;

  // WHITELIST — only real `leads` columns (§7.4). Any other key would make
  // PostgREST reject the whole insert.
  const row = {
    client_name: str(src.client_name),
    client_email: str(src.client_email).toLowerCase(),
    client_phone: str(src.client_phone) || null,
    event_date: str(src.event_date),
    lead_hash: str(src.lead_hash),
    venue_name: str(src.venue_name) || null,
    tier_selected: str(src.tier_selected) || null,
    addons: toText(src.addons),
    notes: toText(src.notes),
    status: 'Inquired', // forced — matches the existing DB default exactly
  };

  const fields = {};
  if (!row.client_name) fields.client_name = 'required';
  if (!row.client_email) fields.client_email = 'required';
  else if (!EMAIL_RE.test(row.client_email)) fields.client_email = 'invalid email';
  if (!row.event_date) fields.event_date = 'required';
  else if (!DATE_RE.test(row.event_date)) fields.event_date = 'must be YYYY-MM-DD';
  if (!row.lead_hash) fields.lead_hash = 'required';
  if (Object.keys(fields).length) {
    return send(res, 400, { success: false, error: 'validation failed', fields });
  }

  const ins = await supabaseRequest('POST', supabaseUrl + '/rest/v1/leads', serviceKey, row);

  if (!ins.ok) {
    const isDuplicate =
      ins.status === 409 ||
      /duplicate key|23505/i.test(ins.text || '') ||
      (ins.json && ins.json.code === '23505');
    if (isDuplicate) {
      // IDEMPOTENT: the row already exists (unique lead_hash) — treat as success.
      const got = await supabaseRequest(
        'GET',
        supabaseUrl + '/rest/v1/leads?lead_hash=eq.' + encodeURIComponent(row.lead_hash) + '&select=lead_hash',
        serviceKey
      );
      const existing =
        got.ok && Array.isArray(got.json) && got.json[0] && got.json[0].lead_hash
          ? String(got.json[0].lead_hash)
          : row.lead_hash;
      return send(res, 200, { success: true, leadId: existing, emailed: false, duplicate: true });
    }
    console.error('[lead] supabase insert failed:', ins.status, (ins.text || '').slice(0, 500));
    return send(res, 502, { success: false, error: 'lead could not be saved' });
  }

  // Best-effort notification — a Resend failure must NOT fail the lead.
  let emailed = false;
  if (resendKey) {
    emailed = await sendResend(resendKey, {
      from: SENDER,
      to: [NOTIFY_TO],
      subject: 'New inquiry — ' + row.client_name + ' · ' + row.event_date,
      html: notificationHtml(row),
    });
  } else {
    console.error('[lead] RESEND_API_KEY missing — skipping notification email');
  }

  return send(res, 200, { success: true, leadId: row.lead_hash, emailed });
}

/**
 * action:'selection' — whitelisted insert into `selections` (design data,
 * FK selections.lead → leads.lead_hash). Non-fatal to the flow: the client
 * treats this as fire-and-forget; failures return 502 honestly.
 */
async function handleSelection(body, res) {
  const { supabaseUrl, serviceKey } = getEnv();
  if (!serviceKey) {
    console.error('[selection] SUPABASE_SERVICE_ROLE_KEY missing');
    return send(res, 503, { success: false, error: 'server not configured' });
  }

  const src = isObj(body.selection) ? body.selection : {};

  // WHITELIST — only real `selections` columns.
  const row = {
    lead: str(src.lead),
    template_id:
      typeof src.template_id === 'number' ? src.template_id : str(src.template_id) || null,
    template_name: str(src.template_name) || null,
    layout: str(src.layout) || null,
    names: str(src.names) || null,
    date: str(src.date) || null,
    venue: str(src.venue) || null,
    font_family: str(src.font_family) || null,
    configuration: toText(src.configuration),
    service_tier: str(src.service_tier) || null,
  };

  if (!row.lead) {
    return send(res, 400, { success: false, error: 'validation failed', fields: { lead: 'required' } });
  }

  const ins = await supabaseRequest('POST', supabaseUrl + '/rest/v1/selections', serviceKey, row);
  if (!ins.ok) {
    console.error('[selection] insert failed:', ins.status, (ins.text || '').slice(0, 500));
    return send(res, 502, { success: false, error: 'selection could not be saved' });
  }
  return send(res, 200, { success: true });
}

/**
 * action:'email' — client confirmation copy (Step-3 "Email Copy to Inbox").
 * Returns { success, emailed } truthfully — UI shows success only on real success.
 */
async function handleEmail(body, res) {
  const { resendKey } = getEnv();
  if (!resendKey) {
    console.error('[email] RESEND_API_KEY missing');
    return send(res, 503, { success: false, error: 'server not configured' });
  }

  const to = str(body.to).toLowerCase();
  if (!to || !EMAIL_RE.test(to)) {
    return send(res, 400, {
      success: false,
      emailed: false,
      error: 'validation failed',
      fields: { to: !to ? 'required' : 'invalid email' },
    });
  }

  const details = {
    name: str(body.name),
    date: str(body.date),
    venue: str(body.venue),
    tier: str(body.tier),
    price: str(body.price),
    leadId: str(body.leadId),
  };

  const emailed = await sendResend(resendKey, {
    from: SENDER,
    to: [to],
    subject: 'Inquiry registered — Katha Booth' + (details.date ? ' · ' + details.date : ''),
    html: clientConfirmationHtml(details),
  });

  if (!emailed) {
    return send(res, 502, { success: false, emailed: false, error: 'email could not be sent' });
  }
  return send(res, 200, { success: true, emailed: true });
}

// ── Handler ──────────────────────────────────────────────────────────────────
module.exports = async (req, res) => {
  try {
    // Same-origin usage — no CORS headers needed; answer OPTIONS 204 for safety.
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      return res.end();
    }
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST, OPTIONS');
      return send(res, 405, { success: false, error: 'method not allowed' });
    }

    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      return send(res, 413, { success: false, error: 'payload too large' });
    }

    const parsed = await readJsonBody(req);
    if (!parsed.ok) return send(res, parsed.status, { success: false, error: parsed.error });
    const body = parsed.body;

    const action = str(body.action) || 'lead';
    if (action === 'lead') return await handleLead(body, res);
    if (action === 'selection') return await handleSelection(body, res);
    if (action === 'email') return await handleEmail(body, res);
    return send(res, 400, { success: false, error: 'unknown action' });
  } catch (err) {
    // Last-resort guard: never crash, never leak internals or key values.
    console.error('[lead.js] unhandled error:', (err && err.stack) || err);
    try {
      return send(res, 500, { success: false, error: 'internal error' });
    } catch (err2) {
      // response already gone — nothing else to do
    }
  }
};
