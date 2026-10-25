import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { paymentEmail } from '../_shared/payment-email.ts';
import { affiliateWelcomeEmail } from '../_shared/affiliate-email.ts';
import { json, requireConfig } from '../_shared/http.ts';

const SENDER = 'pahlawanangka.app@gmail.com';
const MAX_ITEMS = 10;
const FETCH_TIMEOUT_MS = 10_000;
type Item = { id: string; user_id: string; recipient_email: string | null; kind: 'payment'; order_id: string; plan: 'premium' | 'family_plus'; amount_cents: number; attempts: number } | { id: string; user_id: string; recipient_email: string | null; kind: 'affiliate'; affiliate_id: string; affiliate_code: string; commission_snapshot: Record<string, unknown>; attempts: number };

function base64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

/** RFC 2047: a subject with non-ASCII (an emoji, an en dash) is sent base64-encoded so every client shows it. */
function encodeHeader(value: string) {
  if (/^[\x20-\x7e]*$/.test(value)) return value;
  return `=?UTF-8?B?${btoa(String.fromCharCode(...new TextEncoder().encode(value)))}?=`;
}

function mimeMessage(to: string, subject: string, text: string, html: string, copy: { cc?: string[]; bcc?: string[] } = {}) {
  const boundary = `pa-${crypto.randomUUID()}`;
  const message = [
    `From: Pahlawan Angka <${SENDER}>`, `To: ${to}`,
    ...(copy.cc?.length ? [`Cc: ${copy.cc.join(', ')}`] : []),
    ...(copy.bcc?.length ? [`Bcc: ${copy.bcc.join(', ')}`] : []),
    `Subject: ${encodeHeader(subject)}`, 'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`, '',
    `--${boundary}`, 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: 8bit', '', text, '',
    `--${boundary}`, 'Content-Type: text/html; charset=UTF-8', 'Content-Transfer-Encoding: 8bit', '', html, '',
    `--${boundary}--`, ''
  ].join('\r\n');
  return base64Url(new TextEncoder().encode(message));
}

async function accessToken(clientId: string, clientSecret: string, refreshToken: string) {
  const response = await fetchWithTimeout('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' }),
  });
  if (!response.ok) throw new Error(`gmail_token_${response.status}`);
  const body = await response.json();
  if (typeof body.access_token !== 'string') throw new Error('gmail_token_invalid');
  return body.access_token as string;
}

async function sendGmail(token: string, to: string, subject: string, text: string, html: string, copy: { cc?: string[]; bcc?: string[] } = {}) {
  const response = await fetchWithTimeout('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: mimeMessage(to, subject, text, html, copy) }),
  });
  return response;
}

async function fetchWithTimeout(input: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

/** The affiliate's own name for the greeting; the e-mail still goes out without it. */
async function affiliateName(service: ReturnType<typeof createClient>, affiliateId: string) {
  try {
    const { data } = await service.from('affiliate_applications').select('display_name').eq('id', affiliateId).maybeSingle();
    return typeof data?.display_name === 'string' ? data.display_name : null;
  } catch { return null; }
}

function validRecipient(value: string) {
  return !/[\r\n]/.test(value) && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
}

/** Owner copies for payment emails, from secrets (comma-separated); invalid entries are dropped. */
function ownerCopies(name: string) {
  return (Deno.env.get(name) ?? '').split(',').map(v => v.trim()).filter(validRecipient);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = requireConfig('SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY');
    const authorization = req.headers.get('Authorization');
    const workerKey = Deno.env.get('PAYMENT_EMAIL_WORKER_KEY') ?? '';
    const suppliedWorkerKey = req.headers.get('x-payment-email-worker-key') ?? '';
    const hasServiceAuthorization = authorization === `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` || (workerKey.length >= 32 && suppliedWorkerKey === workerKey);
    if (!hasServiceAuthorization) return json({ error: 'Service authorization required' }, 401);
    if (Deno.env.get('EMAIL_DELIVERY_ENABLED') !== 'true') return json({ ok: true, disabled: true, processed: 0 });
    const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_SENDER_EMAIL } = requireConfig('GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REFRESH_TOKEN', 'GMAIL_SENDER_EMAIL');
    if (GMAIL_SENDER_EMAIL !== SENDER) return json({ error: 'Gmail sender configuration invalid' }, 500);
    const service = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = await accessToken(GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN);
    let sent = 0; let retried = 0; let failed = 0; let reconciliationRequired = 0;
    const mark = async (rpc: string, args: Record<string, string>) => {
      try {
        const result = await service.rpc(rpc, args);
        return !result.error && result.data === true;
      } catch {
        return false;
      }
    };
    outer: for (let index = 0, turn = 0, emptyQueues = 0; index < MAX_ITEMS;) {
      const affiliateTurn = turn++ % 2 === 1;
      const claimRpc = affiliateTurn ? 'claim_affiliate_welcome_email_outbox' : 'claim_payment_email_outbox';
      const claimResult = await service.rpc(claimRpc, { p_limit: 1 });
      if (claimResult.error) return json({ error: affiliateTurn ? 'Affiliate outbox claim failed' : 'Outbox claim failed' }, 500);
      const raw = claimResult.data?.[0] ?? null;
      if (!raw) {
        emptyQueues++;
        if (emptyQueues >= 2) break;
        continue;
      }
      emptyQueues = 0;
      const item = { ...raw, kind: affiliateTurn ? 'affiliate' : 'payment' } as Item;
      index++;
        const prefix = item.kind === 'payment' ? 'payment' : 'affiliate_welcome';
      let recipient = item.recipient_email;
      if (!recipient) {
        const { data, error } = await service.auth.admin.getUserById(item.user_id);
        if (error || !data.user?.email) {
          if (await mark(`mark_${prefix}_email_failed`, { p_id: item.id, p_error: 'recipient_unavailable' })) failed++;
          else reconciliationRequired++;
          continue;
        }
        recipient = data.user.email;
      }
      if (!validRecipient(recipient)) {
        if (await mark(`mark_${prefix}_email_failed`, { p_id: item.id, p_error: 'invalid_recipient' })) failed++;
        else reconciliationRequired++;
        continue;
      }
      const rendered = item.kind === 'payment'
        ? paymentEmail({ plan: item.plan, amountCents: item.amount_cents, orderId: item.order_id, appUrl: Deno.env.get('APP_URL') ?? 'https://pahlawanangka.netlify.app/' })
        : affiliateWelcomeEmail({ affiliateCode: item.affiliate_code, commissionSnapshot: item.commission_snapshot, appUrl: Deno.env.get('APP_URL') ?? 'https://pahlawanangka.netlify.app/', name: await affiliateName(service, item.affiliate_id), email: recipient });
      let response: Response;
      const copy = item.kind === 'payment' ? { cc: ownerCopies('PAYMENT_EMAIL_CC'), bcc: ownerCopies('PAYMENT_EMAIL_BCC') } : {};
      try { response = await sendGmail(token, recipient, rendered.subject, rendered.text, rendered.html, copy); }
      catch { reconciliationRequired++; break outer; }
      if (response.ok) {
        if (await mark(`mark_${prefix}_email_sent`, { p_id: item.id })) sent++;
        else reconciliationRequired++;
        continue;
      }
      if ([408, 409, 429].includes(response.status) || response.status >= 500) {
        if (await mark(`mark_${prefix}_email_retry`, { p_id: item.id, p_error: `gmail_http_${response.status}` })) retried++;
        else reconciliationRequired++;
      } else {
        if (await mark(`mark_${prefix}_email_failed`, { p_id: item.id, p_error: `gmail_http_${response.status}` })) failed++;
        else reconciliationRequired++;
      }
    }
    return json({ ok: reconciliationRequired === 0, processed: sent + retried + failed, sent, retried, failed, reconciliation_required: reconciliationRequired });
  } catch (error) {
    return json({ error: error instanceof Error && error.message.startsWith('gmail_token_') ? 'Gmail authorization failed' : 'Email delivery failed' }, 500);
  }
});
