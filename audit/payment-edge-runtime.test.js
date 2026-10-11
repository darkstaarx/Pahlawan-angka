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
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function loadFunction(relativeFile, { clientFactory, fetchImpl, env = {} } = {}) {
  let source = fs.readFileSync(path.join(root, relativeFile), 'utf8');
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

test('callback rejects a tampered signature before loading the order or provider', async () => {
  const h = callbackHarness();
  const response = await h.executeRequest(callbackRequest({ status: '1', order_id: 'order-1', refno: 'invoice-1', billcode: 'BILL1234', amount: '19.00', hash: '00000000000000000000000000000000' }));
  assert.equal(response.status, 401);
  assert.match(await response.text(), /Invalid callback signature/);
  assert.deepEqual(h.completeCalls, []);
  assert.equal(h.requests.length, 0);
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
