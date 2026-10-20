const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { stripTypeScriptTypes } = require('node:module');

const root = path.resolve(__dirname, '..');
const fakeEnv = {
  APP_URL: 'https://example.invalid/app',
  CATEGORY_CODE: 'fake-category',
  SUPABASE_ANON_KEY: 'fake-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'fake-service-key',
  SUPABASE_URL: 'https://fake.supabase.invalid',
  TOYYIBPAY_BASE_URL: 'https://dev.toyyibpay.com',
  TOYYIBPAY_SECRET_KEY: 'fake-secret',
  CHIP_SECRET_KEY: 'fake-chip-secret',
  CHIP_BRAND_ID: '11111111-2222-4333-8444-555555555555',
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function chipSharedSource() {
  let source = fs.readFileSync(path.join(root, 'supabase/functions/_shared/chip.ts'), 'utf8');
  source = source.replace(/^import \{ createVerify \} from 'node:crypto';\r?\n/m, "const { createVerify } = require('node:crypto');\n");
  source = source.replace(/^import \{ Buffer \} from 'node:buffer';\r?\n/m, "const { Buffer } = require('node:buffer');\n");
  source = source.replace(/^export /gm, '');
  return stripTypeScriptTypes(source, { mode: 'transform' });
}

function loadFunction(relativeFile, { clientFactory, fetchImpl, env = {} } = {}) {
  let source = fs.readFileSync(path.join(root, relativeFile), 'utf8');
  const usesChip = /from '\.\.\/_shared\/chip\.ts';/.test(source);
  source = source.replace(/^import \{[^}]*\} from '\.\.\/_shared\/chip\.ts';\r?\n/m, '');
  source = source.replace(/^import \{ json, requireConfig \} from '\.\.\/_shared\/http\.ts';\r?\n/m, '');
  source = source.replace(/^import \{ createClient \} from 'https:\/\/esm\.sh\/@supabase\/supabase-js@2\.49\.8';\r?\n/m, '');
  source = source.replace(/^import \{ corsHeaders, json, requireConfig \} from '\.\.\/_shared\/http\.ts';\r?\n/m, '');
  source = source.replace(/^import \{ createHash \} from 'node:crypto';\r?\n/m, "const { createHash } = require('node:crypto');\n");
  source = stripTypeScriptTypes(source, { mode: 'transform' });
  source = source.replace(/Deno\.serve\(async \(req\)\s*=>\s*\{/, 'globalThis.executeRequest = async (req) => {');
  assert.match(source, /\n\}\);\s*$/, `could not find Deno.serve closing expression in ${relativeFile}`);
  source = source.replace(/\n\}\);\s*$/, '\n};\n');

  const values = { ...fakeEnv, ...env };
  const context = {
    Response,
    TextDecoder,
    Uint8Array,
    URL,
    URLSearchParams,
    console,
    fetch: fetchImpl || (async () => { throw new Error('unexpected network request'); }),
    require,
    createClient: clientFactory || (() => { throw new Error('unexpected Supabase client creation'); }),
    Deno: { env: { get: (name) => values[name] ?? '' } },
    corsHeaders: () => ({ 'Content-Type': 'application/json' }),
    json: jsonResponse,
    requireConfig: (...names) => {
      const result = Object.fromEntries(names.map((name) => [name, values[name] ?? '']));
      const missing = names.filter((name) => !result[name]);
      if (missing.length) throw new Error(`Missing payment configuration: ${missing.join(', ')}`);
      return result;
    },
  };
  const vm = require('node:vm');
  vm.createContext(context);
  if (usesChip) vm.runInContext(chipSharedSource(), context, { filename: '_shared/chip.ts' });
  vm.runInContext(source, context, { filename: relativeFile });
  return context.executeRequest;
}

function callbackRequest(fields, method = 'POST') {
  const body = new URLSearchParams(fields);
  return new Request('https://example.invalid/callback', {
    method,
    body: method === 'POST' ? body : undefined,
    headers: method === 'POST' ? { 'content-type': 'application/x-www-form-urlencoded' } : undefined,
  });
}

function callbackHash({ status = '1', orderId = 'order-1', refno = 'invoice-1' } = {}) {
  return createHash('md5').update(`${fakeEnv.TOYYIBPAY_SECRET_KEY}${status}${orderId}${refno}ok`, 'utf8').digest('hex');
}

function callbackHarness({ providerText = JSON.stringify([{ billpaymentStatus: '1', billpaymentAmount: '19.00', billpaymentInvoiceNo: 'provider-invoice-1' }]) } = {}) {
  const completeCalls = [];
  const requests = [];
  const service = {
    from: () => ({
      select: () => ({
        eq: (_column, value) => {
          requests.push(value);
          return {
            eq: (_nextColumn, nextValue) => {
              requests.push(nextValue);
              return { single: async () => ({ data: { id: 'order-row', external_uuid: 'order-1', billcode: 'BILL1234', amount_cents: 1900 }, error: null }) };
            },
          };
        },
      }),
    }),
    rpc: async (name, args) => { completeCalls.push({ name, args }); return { data: true, error: null }; },
  };
  const executeRequest = loadFunction('supabase/functions/toyyibpay-callback/index.ts', {
    clientFactory: () => service,
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return { text: async () => providerText };
    },
  });
  return { executeRequest, completeCalls, requests };
}

test('disabled checkout returns 503 before creating an order or calling the provider', async () => {
  let clients = 0;
  let networkCalls = 0;
  const executeRequest = loadFunction('supabase/functions/create-checkout/index.ts', {
    env: { PAYMENTS_ENABLED: 'false' },
    clientFactory: () => { clients++; throw new Error('checkout must be disabled'); },
    fetchImpl: async () => { networkCalls++; throw new Error('provider must not be called'); },
  });
  const response = await executeRequest(new Request('https://example.invalid/checkout', {
    method: 'POST',
    body: JSON.stringify({ plan: 'premium', phone: '0123456789', parent_name: 'Parent' }),
    headers: { 'content-type': 'application/json' },
  }));
  assert.equal(response.status, 503);
  assert.match(await response.text(), /Pembayaran belum dibuka/);
  assert.equal(clients, 0);
  assert.equal(networkCalls, 0);
});

test('upgrade checkout creates a CHIP purchase for the server order amount and returns to Netlify', async () => {
  let providerCall;
  const purchaseId = '9b2f5c1e-0d4a-4b7e-9c3f-6a1e2d3c4b5a';
  const auth = {
    auth: { getUser: async () => ({ data: { user: { id: 'buyer', email: 'buyer@example.invalid' } } }) },
    rpc: (name) => name === 'create_payment_order'
      ? { single: async () => ({ data: { id: 'upgrade-order', external_uuid: '00000000-0000-4000-8000-000000000001', amount_cents: 1000, billcode: null } }) }
      : Promise.resolve({ data: true }),
  };
  let stored;
  const service = { from: () => ({ update: (row) => { stored = row; return { eq: () => ({ eq: async () => ({ error: null }) }) }; } }) };
  const executeRequest = loadFunction('supabase/functions/create-checkout/index.ts', {
    env: { PAYMENTS_ENABLED: 'true' },
    clientFactory: (_url, key) => key === fakeEnv.SUPABASE_SERVICE_ROLE_KEY ? service : auth,
    fetchImpl: async (url, options) => { providerCall = { url, options, body: JSON.parse(options.body) }; return jsonResponse({ id: purchaseId, status: 'created', checkout_url: `https://gate.chip-in.asia/p/${purchaseId}/` }, 201); },
  });
  const response = await executeRequest(new Request('https://example.invalid/checkout', {
    method: 'POST', headers: { Authorization: 'Bearer buyer-token', 'content-type': 'application/json' },
    body: JSON.stringify({ plan: 'family_plus', phone: '0123456789', parent_name: 'Parent', expected_price_cents: 1000, external_uuid: '00000000-0000-4000-8000-000000000001' }),
  }));
  assert.equal(response.status, 200, await response.clone().text());
  assert.equal(providerCall.url, 'https://gate.chip-in.asia/api/v1/purchases/');
  assert.equal(providerCall.options.headers.Authorization, `Bearer ${fakeEnv.CHIP_SECRET_KEY}`);
  assert.equal(providerCall.body.brand_id, fakeEnv.CHIP_BRAND_ID);
  assert.equal(providerCall.body.reference, '00000000-0000-4000-8000-000000000001');
  assert.equal(providerCall.body.purchase.products[0].price, 1000);
  assert.equal(providerCall.body.purchase.currency, 'MYR');
  assert.equal(providerCall.body.success_redirect, 'https://pahlawanangka.netlify.app/?payment_order=upgrade-order');
  assert.equal(providerCall.body.success_callback, `${fakeEnv.SUPABASE_URL}/functions/v1/chip-callback`);
  assert.equal(stored.billcode, purchaseId);
  assert.equal(stored.status, 'pending');
  const json = await response.json();
  assert.equal(json.live_url, `https://gate.chip-in.asia/p/${purchaseId}/`);
});

test('callback rejects a tampered signature before loading the order or provider', async () => {
  const h = callbackHarness();
  const response = await h.executeRequest(callbackRequest({ status: '1', order_id: 'order-1', refno: 'invoice-1', billcode: 'BILL1234', amount: '19.00', hash: '00000000000000000000000000000000' }));
  assert.equal(response.status, 401);
  assert.match(await response.text(), /Invalid callback signature/);
  assert.deepEqual(h.completeCalls, []);
  assert.equal(h.requests.length, 0);
});

test('admin test mode denies a guardian even when editable metadata says admin', async () => {
  let orders = 0;
  const client = {
    auth: { getUser: async () => ({ data: { user: { id: 'guardian', user_metadata: { role: 'admin' } } }, error: null }) },
    from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { role: 'guardian' }, error: null }) }) }) }),
    rpc: () => { orders++; throw new Error('must not create order'); },
  };
  const handler = loadFunction('supabase/functions/create-checkout/index.ts', {
    env: { PAYMENTS_ENABLED: 'false', PAYMENTS_ADMIN_TEST_MODE: 'true' }, clientFactory: () => client,
  });
  const response = await handler(new Request('https://example.invalid/checkout', { method: 'POST', headers: { authorization: 'Bearer fake' }, body: '{}' }));
  assert.equal(response.status, 503);
  assert.equal(orders, 0);
});

test('admin test mode validates authentication and allows a database admin to reach input validation', async () => {
  const client = {
    auth: { getUser: async () => ({ data: { user: { id: 'admin' } }, error: null }) },
    from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { role: 'admin' }, error: null }) }) }) }),
  };
  const handler = loadFunction('supabase/functions/create-checkout/index.ts', {
    env: { PAYMENTS_ENABLED: 'false', PAYMENTS_ADMIN_TEST_MODE: 'true' }, clientFactory: () => client,
  });
  const anonymous = await handler(new Request('https://example.invalid/checkout', { method: 'POST', body: '{}' }));
  assert.equal(anonymous.status, 401);
  const admin = await handler(new Request('https://example.invalid/checkout', { method: 'POST', headers: { authorization: 'Bearer fake' }, body: '{}' }));
  assert.equal(admin.status, 400);
  assert.match(await admin.text(), /Unknown plan/);
});

test('test account allowlist uses the verified user id and leaves other guardians blocked', async () => {
  let identity = 'selected-buyer';
  const client = {
    auth: { getUser: async () => ({ data: { user: { id: identity, user_metadata: { id: 'selected-buyer' } } }, error: null }) },
    from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { role: 'guardian' }, error: null }) }) }) }),
  };
  const handler = loadFunction('supabase/functions/create-checkout/index.ts', {
    env: { PAYMENTS_ENABLED: 'false', PAYMENTS_ADMIN_TEST_MODE: 'true', PAYMENTS_TEST_USER_IDS: ' selected-buyer ' }, clientFactory: () => client,
  });
  const request = () => new Request('https://example.invalid/checkout', { method: 'POST', headers: { authorization: 'Bearer fake' }, body: '{}' });
  assert.equal((await handler(request())).status, 400);
  identity = 'other-buyer';
  assert.equal((await handler(request())).status, 503);
});

test('signed successful callback rejects a provider transaction with the wrong amount', async () => {
  const h = callbackHarness({ providerText: JSON.stringify([{ billpaymentStatus: '1', billpaymentAmount: '18.99', billpaymentInvoiceNo: 'provider-invoice-1' }]) });
  const response = await h.executeRequest(callbackRequest({ status: '1', order_id: 'order-1', refno: 'invoice-1', billcode: 'BILL1234', amount: '19.00', hash: callbackHash() }));
  assert.equal(response.status, 400);
  assert.match(await response.text(), /Payment verification failed/);
  assert.deepEqual(h.completeCalls, []);
});

test('valid signed callback with a matching provider amount completes the payment once', async () => {
  const h = callbackHarness();
  const response = await h.executeRequest(callbackRequest({ status: '1', order_id: 'order-1', refno: 'invoice-1', billcode: 'BILL1234', amount: '19.00', hash: callbackHash() }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(h.completeCalls.length, 1);
  assert.equal(h.completeCalls[0].name, 'complete_payment');
  assert.equal(h.completeCalls[0].args.p_amount_cents, 1900);
  assert.equal(h.completeCalls[0].args.p_provider_ref, 'provider-invoice-1');
});

test('malformed provider JSON fails closed without completing the payment', async () => {
  const h = callbackHarness({ providerText: '{not-json' });
  const response = await h.executeRequest(callbackRequest({ status: '1', order_id: 'order-1', refno: 'invoice-1', billcode: 'BILL1234', amount: '19.00', hash: callbackHash() }));
  assert.equal(response.status, 400);
  assert.match(await response.text(), /Payment verification failed/);
  assert.deepEqual(h.completeCalls, []);
});

test('callback accepts POST only', async () => {
  const h = callbackHarness();
  const response = await h.executeRequest(callbackRequest({}, 'GET'));
  assert.equal(response.status, 405);
  assert.match(await response.text(), /Method not allowed/);
  assert.deepEqual(h.completeCalls, []);
});

// ---------- CHIP success_callback ----------
const { generateKeyPairSync, createSign } = require('node:crypto');
const chipKeys = generateKeyPairSync('rsa', { modulusLength: 2048 });
const chipPem = chipKeys.publicKey.export({ type: 'spki', format: 'pem' }).toString();
const CHIP_PURCHASE = '6f9c1b9e-1a2b-4c3d-8e9f-0a1b2c3d4e5f';

function chipHarness({ purchase = {} } = {}) {
  const completeCalls = [];
  const lookups = [];
  const service = {
    from: () => ({ select: () => ({ eq: (_c, value) => { lookups.push(value); return { single: async () => ({ data: { id: 'order-row', external_uuid: '00000000-0000-4000-8000-0000000000aa', billcode: CHIP_PURCHASE, amount_cents: 1900 }, error: null }) }; } }) }),
    rpc: async (name, args) => { completeCalls.push({ name, args }); return { data: true, error: null }; },
  };
  const live = { id: CHIP_PURCHASE, status: 'paid', brand_id: fakeEnv.CHIP_BRAND_ID, reference: '00000000-0000-4000-8000-0000000000aa', purchase: { total: 1900, currency: 'MYR' }, ...purchase };
  const executeRequest = loadFunction('supabase/functions/chip-callback/index.ts', {
    clientFactory: () => service,
    fetchImpl: async (url) => {
      if (String(url).endsWith('/public_key/')) return jsonResponse(chipPem);
      if (String(url).endsWith(`/purchases/${CHIP_PURCHASE}/`)) return jsonResponse(live);
      throw new Error('unexpected ' + url);
    },
  });
  return { executeRequest, completeCalls, lookups };
}
function chipRequest(payload, { sign = true, method = 'POST' } = {}) {
  const body = Buffer.from(JSON.stringify(payload));
  const headers = {};
  if (sign) headers['X-Signature'] = createSign('RSA-SHA256').update(body).sign(chipKeys.privateKey).toString('base64');
  return new Request('https://example.invalid/chip-callback', { method, body: method === 'POST' ? body : undefined, headers });
}

test('CHIP callback rejects an unsigned or tampered payload before touching orders', async () => {
  const h = chipHarness();
  assert.equal((await h.executeRequest(chipRequest({ id: CHIP_PURCHASE, status: 'paid' }, { sign: false }))).status, 401);
  const tampered = chipRequest({ id: CHIP_PURCHASE, status: 'paid' });
  const forged = new Request(tampered.url, { method: 'POST', headers: tampered.headers, body: JSON.stringify({ id: CHIP_PURCHASE, status: 'paid', extra: 1 }) });
  assert.equal((await h.executeRequest(forged)).status, 401);
  assert.deepEqual(h.completeCalls, []);
  assert.deepEqual(h.lookups, []);
});

test('CHIP callback completes a signed paid purchase once CHIP confirms amount and reference', async () => {
  const h = chipHarness();
  const response = await h.executeRequest(chipRequest({ id: CHIP_PURCHASE, status: 'paid', event_type: 'purchase.paid' }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(h.completeCalls.length, 1);
  assert.equal(h.completeCalls[0].args.p_billcode, CHIP_PURCHASE);
  assert.equal(h.completeCalls[0].args.p_status, '1');
  assert.equal(h.completeCalls[0].args.p_amount_cents, 1900);
});

test('CHIP callback does not grant access when CHIP reports another amount or status', async () => {
  for (const purchase of [{ purchase: { total: 1800, currency: 'MYR' } }, { status: 'created' }, { reference: 'someone-else' }, { brand_id: 'other-brand' }]) {
    const h = chipHarness({ purchase });
    const response = await h.executeRequest(chipRequest({ id: CHIP_PURCHASE, status: 'paid' }));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: false });
    assert.deepEqual(h.completeCalls, []);
  }
});

test('CHIP callback accepts POST only', async () => {
  const h = chipHarness();
  assert.equal((await h.executeRequest(chipRequest({}, { method: 'GET', sign: false }))).status, 405);
});
