const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { stripTypeScriptTypes } = require('node:module');

const root = path.resolve(__dirname, '..');
const env = { APP_URL: 'https://pahlawanangka.app', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'service-secret', GMAIL_CLIENT_ID: 'client', GMAIL_CLIENT_SECRET: 'secret', GMAIL_REFRESH_TOKEN: 'refresh', GMAIL_SENDER_EMAIL: 'pahlawanangka.app@gmail.com' };

function load({ client, fetchImpl, emailEnabled = 'true', extraEnv = {}, allowAffiliate = false }) {
  let source = fs.readFileSync(path.join(root, 'supabase/functions/send-payment-emails/index.ts'), 'utf8');
  source = source.replace(/^import \{ createClient \}[^\n]+\n/m, '');
  source = source.replace(/^import \{ paymentEmail \}[^\n]+\n/m, '');
  source = source.replace(/^import \{ affiliateWelcomeEmail \}[^\n]+\n/m, '');
  source = source.replace(/^import \{ json, requireConfig \}[^\n]+\n/m, '');
  source = stripTypeScriptTypes(source, { mode: 'transform' });
  source = source.replace(/Deno\.serve\(async \(req\)\s*=>\s*\{/, 'globalThis.executeRequest = async (req) => {');
  source = source.replace(/\n\}\);\s*$/, '\n};\n');
  const values = { ...env, EMAIL_DELIVERY_ENABLED: emailEnabled, ...extraEnv };
  const originalRpc = client.rpc;
  client = { ...client, rpc: async (name, args) => allowAffiliate || name !== 'claim_affiliate_welcome_email_outbox' ? originalRpc(name, args) : { data: [], error: null } };
  const vm = require('node:vm');
  const context = {
    Response, Request, URLSearchParams, TextEncoder, AbortController, setTimeout, clearTimeout, btoa: (value) => Buffer.from(value, 'binary').toString('base64'), crypto,
    fetch: fetchImpl, createClient: () => client,
    paymentEmail: ({ plan, amountCents, orderId, appUrl }) => ({ subject: `${plan}:${orderId}`, text: `plain ${amountCents}`, html: `<p>${appUrl}</p>` }),
    affiliateWelcomeEmail: ({ affiliateCode }) => ({ subject: `affiliate:${affiliateCode}`, text: `welcome ${affiliateCode}`, html: `<p>${affiliateCode}</p>` }),
    Deno: { env: { get: (name) => values[name] ?? '' } },
    json: (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }),
    requireConfig: (...names) => Object.fromEntries(names.map((name) => [name, values[name]])),
  };
  vm.createContext(context); vm.runInContext(source, context); return context.executeRequest;
}

function item() { return [{ id: 'outbox-1', order_id: 'order-1', user_id: 'user-1', recipient_email: 'parent@example.com', plan: 'premium', amount_cents: 1900, attempts: 1 }]; }
function affiliateItem() { return [{ id: 'welcome-1', affiliate_id: 'affiliate-1', user_id: 'user-2', recipient_email: 'affiliate@example.com', affiliate_code: 'PA1234ABCD', commission_snapshot: { premium_commission_cents: 900, family_plus_commission_cents: 1500 }, attempts: 1 }]; }

test('outbox trigger is paid-only, unique per order, and browser roles receive no access', () => {
  const sql = fs.readFileSync(path.join(root, 'supabase/schema/payment_email_outbox.sql'), 'utf8');
  assert.match(sql, /order_id uuid not null unique/);
  assert.match(sql, /if new\.status <> 'paid'/);
  assert.match(sql, /revoke all on pa_private\.payment_email_outbox from public, anon, authenticated/);
});

test('sender rejects callers without the exact service-role bearer', async () => {
  let calls = 0;
  const handler = load({ client: {}, fetchImpl: async () => { calls++; throw new Error('must not send'); } });
  const response = await handler(new Request('https://example.invalid', { method: 'POST', headers: { authorization: 'Bearer wrong' } }));
  assert.equal(response.status, 401); assert.equal(calls, 0);
});

test('sender accepts the dedicated worker key alongside a gateway bearer', async () => {
  let calls = 0;
  const workerKey = 'worker-key-with-at-least-32-characters';
  const handler = load({ emailEnabled: 'false', extraEnv: { PAYMENT_EMAIL_WORKER_KEY: workerKey }, client: {}, fetchImpl: async () => { calls++; throw new Error('must not send while disabled'); } });
  const response = await handler(new Request('https://example.invalid', { method: 'POST', headers: { authorization: 'Bearer valid-gateway-jwt', 'x-payment-email-worker-key': workerKey } }));
  assert.equal(response.status, 200); assert.deepEqual(await response.json(), { ok: true, disabled: true, processed: 0 }); assert.equal(calls, 0);
});

test('sender rejects an anonymous bearer with a wrong or missing worker key', async () => {
  const handler = load({ client: {}, fetchImpl: async () => { throw new Error('must not send'); } });
  const wrong = await handler(new Request('https://example.invalid', { method: 'POST', headers: { authorization: 'Bearer anon-jwt', 'x-payment-email-worker-key': 'wrong-key' } }));
  const missing = await handler(new Request('https://example.invalid', { method: 'POST', headers: { authorization: 'Bearer anon-jwt' } }));
  assert.equal(wrong.status, 401); assert.equal(missing.status, 401);
});

test('worker key shorter than 32 characters is rejected', async () => {
  const handler = load({ extraEnv: { PAYMENT_EMAIL_WORKER_KEY: 'too-short' }, client: {}, fetchImpl: async () => { throw new Error('must not send'); } });
  const response = await handler(new Request('https://example.invalid', { method: 'POST', headers: { authorization: 'Bearer anon-jwt', 'x-payment-email-worker-key': 'too-short' } }));
  assert.equal(response.status, 401);
});

test('successful delivery sends multipart plain text and HTML, then marks sent', async () => {
  const rpcCalls = [];
  let sendBody;
  let remaining = 1;
  const client = { rpc: async (name, args) => { rpcCalls.push({ name, args }); if (name.startsWith('claim')) return { data: remaining-- > 0 ? item() : [], error: null }; return { data: true, error: null }; } };
  const handler = load({ client, fetchImpl: async (url, options) => {
    if (url.includes('oauth2')) return new Response(JSON.stringify({ access_token: 'access' }), { status: 200 });
    sendBody = JSON.parse(options.body); return new Response('{}', { status: 200 });
  } });
  const response = await handler(new Request('https://example.invalid', { method: 'POST', headers: { authorization: 'Bearer service-secret' } }));
  assert.equal(response.status, 200); assert.deepEqual(rpcCalls.map((x) => x.name), ['claim_payment_email_outbox', 'mark_payment_email_sent', 'claim_payment_email_outbox']);
  const raw = Buffer.from(sendBody.raw.replace(/-/g, '+').replace(/_/g, '/') + '==', 'base64').toString();
  assert.match(raw, /From: Pahlawan Angka <pahlawanangka\.app@gmail\.com>/); assert.match(raw, /multipart\/alternative/); assert.match(raw, /plain 1900/); assert.match(raw, /<p>https:\/\/pahlawanangka\.app<\/p>/);
});

test('affiliate welcome delivery uses its own claim and mark RPCs and snapshot', async () => {
  const rpcCalls = [];
  let remaining = 1;
  const client = { rpc: async (name) => {
    rpcCalls.push(name);
    if (name === 'claim_payment_email_outbox') return { data: [], error: null };
    if (name === 'claim_affiliate_welcome_email_outbox') return { data: remaining-- > 0 ? affiliateItem() : [], error: null };
    return { data: true, error: null };
  } };
  const handler = load({ allowAffiliate: true, client, fetchImpl: async (url, options) => {
    if (url.includes('oauth2')) return new Response(JSON.stringify({ access_token: 'access' }), { status: 200 });
    const raw = Buffer.from(JSON.parse(options.body).raw.replace(/-/g, '+').replace(/_/g, '/') + '==', 'base64').toString();
    assert.match(raw, /affiliate:PA1234ABCD/); return new Response('{}', { status: 200 });
  } });
  const response = await handler(new Request('https://example.invalid', { method: 'POST', headers: { authorization: 'Bearer service-secret' } }));
  assert.equal(response.status, 200); assert.deepEqual(rpcCalls, ['claim_payment_email_outbox', 'claim_affiliate_welcome_email_outbox', 'mark_affiliate_welcome_email_sent', 'claim_payment_email_outbox', 'claim_affiliate_welcome_email_outbox']);
});

test('payment ambiguity does not preclaim an affiliate item', async () => {
  const rpcCalls = [];
  const client = { rpc: async (name) => {
    rpcCalls.push(name);
    if (name === 'claim_payment_email_outbox') return { data: item(), error: null };
    if (name === 'claim_affiliate_welcome_email_outbox') return { data: affiliateItem(), error: null };
    return { data: true, error: null };
  } };
  const handler = load({ allowAffiliate: true, client, fetchImpl: async (url) => url.includes('oauth2') ? new Response(JSON.stringify({ access_token: 'access' }), { status: 200 }) : (() => { throw new Error('network'); })() });
  await handler(new Request('https://example.invalid', { method: 'POST', headers: { authorization: 'Bearer service-secret' } }));
  assert.deepEqual(rpcCalls, ['claim_payment_email_outbox']);
});

test('affiliate ambiguity does not preclaim a later payment item', async () => {
  const rpcCalls = [];
  const client = { rpc: async (name) => {
    rpcCalls.push(name);
    if (name === 'claim_payment_email_outbox') return { data: [], error: null };
    if (name === 'claim_affiliate_welcome_email_outbox') return { data: affiliateItem(), error: null };
    return { data: true, error: null };
  } };
  const handler = load({ allowAffiliate: true, client, fetchImpl: async (url) => url.includes('oauth2') ? new Response(JSON.stringify({ access_token: 'access' }), { status: 200 }) : (() => { throw new Error('network'); })() });
  await handler(new Request('https://example.invalid', { method: 'POST', headers: { authorization: 'Bearer service-secret' } }));
  assert.deepEqual(rpcCalls, ['claim_payment_email_outbox', 'claim_affiliate_welcome_email_outbox']);
});

test('worker processes at most ten items across both queues', async () => {
  const rpcCalls = []; let claims = 0;
  const client = { rpc: async (name) => {
    rpcCalls.push(name);
    if (name.startsWith('claim')) { claims++; return { data: claims <= 20 ? (name.includes('affiliate') ? affiliateItem() : item()) : [], error: null }; }
    return { data: true, error: null };
  } };
  const handler = load({ allowAffiliate: true, client, fetchImpl: async (url) => url.includes('oauth2') ? new Response(JSON.stringify({ access_token: 'access' }), { status: 200 }) : new Response('{}', { status: 200 }) });
  const body = await (await handler(new Request('https://example.invalid', { method: 'POST', headers: { authorization: 'Bearer service-secret' } }))).json();
  assert.equal(body.processed, 10); assert.equal(rpcCalls.filter(name => name.startsWith('claim')).length, 10);
});

test('Gmail 429 returns the item to retryable pending state', async () => {
  const rpcCalls = [];
  let remaining = 1;
  const client = { rpc: async (name) => { rpcCalls.push(name); if (name.startsWith('claim')) return { data: remaining-- > 0 ? item() : [], error: null }; return { data: true, error: null }; } };
  const handler = load({ client, fetchImpl: async (url) => url.includes('oauth2') ? new Response(JSON.stringify({ access_token: 'access' }), { status: 200 }) : new Response('{}', { status: 429 }) });
  await handler(new Request('https://example.invalid', { method: 'POST', headers: { authorization: 'Bearer service-secret' } }));
  assert.deepEqual(rpcCalls, ['claim_payment_email_outbox', 'mark_payment_email_retry', 'claim_payment_email_outbox']);
});

test('ambiguous Gmail network failure leaves processing row untouched', async () => {
  const rpcCalls = [];
  const client = { rpc: async (name) => { rpcCalls.push(name); return name.startsWith('claim') ? { data: item(), error: null } : { data: true, error: null }; } };
  const handler = load({ client, fetchImpl: async (url) => { if (url.includes('oauth2')) return new Response(JSON.stringify({ access_token: 'access' }), { status: 200 }); throw new Error('network'); } });
  const response = await handler(new Request('https://example.invalid', { method: 'POST', headers: { authorization: 'Bearer service-secret' } }));
  assert.equal(response.status, 200); assert.deepEqual(rpcCalls, ['claim_payment_email_outbox']);
});

test('Gmail token failure occurs before any outbox claim', async () => {
  const rpcCalls = [];
  const client = { rpc: async (name) => { rpcCalls.push(name); return { data: [], error: null }; } };
  const handler = load({ client, fetchImpl: async () => new Response('{}', { status: 400 }) });
  const response = await handler(new Request('https://example.invalid', { method: 'POST', headers: { authorization: 'Bearer service-secret' } }));
  assert.equal(response.status, 500); assert.deepEqual(rpcCalls, []);
});

test('network ambiguity leaves later rows unclaimed', async () => {
  const claimIds = [];
  const client = { rpc: async (name) => {
    if (name === 'claim_payment_email_outbox') { claimIds.push(name); return { data: item(), error: null }; }
    return { data: true, error: null };
  } };
  const handler = load({ client, fetchImpl: async (url) => url.includes('oauth2') ? new Response(JSON.stringify({ access_token: 'access' }), { status: 200 }) : (() => { throw new Error('network'); })() });
  await handler(new Request('https://example.invalid', { method: 'POST', headers: { authorization: 'Bearer service-secret' } }));
  assert.equal(claimIds.length, 1);
});

test('Gmail accepted but sent-state persistence fails reports reconciliation and does not count sent', async () => {
  const rpcCalls = [];
  let remaining = 1;
  const client = { rpc: async (name) => {
    rpcCalls.push(name);
    if (name === 'claim_payment_email_outbox') return { data: remaining-- > 0 ? item() : [], error: null };
    if (name === 'mark_payment_email_sent') return { data: false, error: { message: 'write failed' } };
    return { data: true, error: null };
  } };
  const handler = load({ client, fetchImpl: async (url) => url.includes('oauth2') ? new Response(JSON.stringify({ access_token: 'access' }), { status: 200 }) : new Response('{}', { status: 200 }) });
  const response = await handler(new Request('https://example.invalid', { method: 'POST', headers: { authorization: 'Bearer service-secret' } }));
  const body = await response.json();
  assert.equal(body.sent, 0); assert.equal(body.reconciliation_required, 1); assert.equal(body.ok, false);
  assert.deepEqual(rpcCalls, ['claim_payment_email_outbox', 'mark_payment_email_sent', 'claim_payment_email_outbox']);
});

test('processing row is not resent after a prior Gmail acceptance with unresolved state', async () => {
  let gmailSends = 0; let claims = 0;
  const client = { rpc: async (name) => {
    if (name === 'claim_payment_email_outbox') { claims++; return { data: claims === 1 ? item() : [], error: null }; }
    return { data: false, error: { message: 'write failed' } };
  } };
  const handler = load({ client, fetchImpl: async (url) => {
    if (url.includes('oauth2')) return new Response(JSON.stringify({ access_token: 'access' }), { status: 200 });
    gmailSends++; return new Response('{}', { status: 200 });
  } });
  await handler(new Request('https://example.invalid', { method: 'POST', headers: { authorization: 'Bearer service-secret' } }));
  await handler(new Request('https://example.invalid', { method: 'POST', headers: { authorization: 'Bearer service-secret' } }));
  assert.equal(gmailSends, 1);
});

test('state RPC exception is reported as reconciliation required', async () => {
  let remaining = 1;
  const client = { rpc: async (name) => {
    if (name === 'claim_payment_email_outbox') return { data: remaining-- > 0 ? item() : [], error: null };
    throw new Error('database unavailable');
  } };
  const handler = load({ client, fetchImpl: async (url) => url.includes('oauth2') ? new Response(JSON.stringify({ access_token: 'access' }), { status: 200 }) : new Response('{}', { status: 200 }) });
  const body = await (await handler(new Request('https://example.invalid', { method: 'POST', headers: { authorization: 'Bearer service-secret' } }))).json();
  assert.equal(body.sent, 0); assert.equal(body.reconciliation_required, 1); assert.equal(body.ok, false);
});

test('payment email copies the owner via PAYMENT_EMAIL_CC / BCC; affiliate email does not', async () => {
  const raws = [];
  let remainingPayment = 1; let remainingAffiliate = 1;
  const client = { rpc: async (name) => {
    if (name === 'claim_payment_email_outbox') return { data: remainingPayment-- > 0 ? item() : [], error: null };
    if (name === 'claim_affiliate_welcome_email_outbox') return { data: remainingAffiliate-- > 0 ? affiliateItem() : [], error: null };
    return { data: true, error: null };
  } };
  const handler = load({ allowAffiliate: true, client, extraEnv: { PAYMENT_EMAIL_CC: ' owner@example.com , bad\r\nBcc: x@evil.com ', PAYMENT_EMAIL_BCC: 'audit@example.com' }, fetchImpl: async (url, options) => {
    if (url.includes('oauth2')) return new Response(JSON.stringify({ access_token: 'access' }), { status: 200 });
    raws.push(Buffer.from(JSON.parse(options.body).raw.replace(/-/g, '+').replace(/_/g, '/') + '==', 'base64').toString());
    return new Response('{}', { status: 200 });
  } });
  const response = await handler(new Request('https://example.invalid', { method: 'POST', headers: { authorization: 'Bearer service-secret' } }));
  assert.equal(response.status, 200);
  const payment = raws.find(r => /plain 1900/.test(r)); const affiliate = raws.find(r => /affiliate:PA1234ABCD/.test(r));
  assert.match(payment, /\r\nTo: parent@example\.com\r\nCc: owner@example\.com\r\nBcc: audit@example\.com\r\n/);
  assert.doesNotMatch(payment, /evil/);
  assert.doesNotMatch(affiliate, /\r\n(Cc|Bcc):/);
});
