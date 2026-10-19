const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../js/entry-flow-v1.js'), 'utf8');
const KEY = 'pa_entry_intent_v1';
const ORDER = 'bf3576c2-71b0-49ab-8fe6-5bbf2f62e901';
function harness({ signed = false, paid = false, intent, search = '', row = { status: 'pending', plan: 'premium' }, storage = new Map() } = {}) {
  if (intent) storage.set(KEY, JSON.stringify({ expires: Date.now() + 86400000, ...intent }));
  const elements = new Map(); const calls = []; let paidAccess = paid;
  const el = id => { if (!elements.has(id)) elements.set(id, { hidden: false, textContent: '', dataset: {}, setAttribute(k, v) { this[k] = v; }, focus() {}, addEventListener(k, fn) { this[k] = fn; } }); return elements.get(id); };
  const planButtons = ['premium', 'family_plus'].map(plan => Object.assign(el(plan), { dataset: { entryPlan: plan } }));
  const state = { user: signed ? { id: 'buyer' } : null, needsOnboarding: false, client: { from(table) {
    calls.push(table); return { select() { return this; }, eq(k, v) { calls.push([k, v]); return this; }, async maybeSingle() { return { data: row }; } };
  } } };
  const location = { search, href: `https://example.invalid/${search}`, assign: url => calls.push(['assign', url]) };
  const window = {
    screen: id => calls.push(['screen', id]), PACloud: { state, resumeAfterConsent: async () => calls.push('profiles') },
    PACommercial: { refresh: async () => calls.push('refresh'), isPaid: () => paidAccess, isPremium: () => false, openPricing: options => calls.push(options?.entry ? 'entry-pricing' : 'upgrades') },
    PAPayments: { refreshCatalog: async () => {}, checkout: plan => calls.push(['checkout', plan]), pollOrder: id => calls.push(['poll', id]) }, PADemo: { open: () => calls.push('demo') }
  };
  vm.runInNewContext(source, { window, document: { getElementById: el, querySelectorAll: selector => selector === '[data-entry-plan]' ? planButtons : [] }, localStorage: { getItem: k => storage.get(k), setItem: (k, v) => storage.set(k, v), removeItem: k => storage.delete(k) }, location, history: { replaceState: (_a, _b, url) => { location.search = ''; calls.push(['history', url]); } }, URL, URLSearchParams, Date });
  return { entry: window.PAEntry, state, calls, elements, storage, clickPlan: plan => el(plan).click(), setPaid: value => { paidAccess = value; } };
}
test('package selection leads guests to registration and survives the OAuth reload', async () => {
  const first = harness(); first.entry.plans();
  // The shared pricing component opens in entry mode (no separate white plans page).
  assert.ok(first.calls.includes('entry-pricing'));
  await first.entry.choose('family_plus');
  assert.equal(JSON.parse(first.storage.get(KEY)).plan, 'family_plus');
  assert.equal(first.elements.get('login')['data-entry'], 'auth');
  const returned = harness({ signed: true, storage: first.storage });
  assert.equal(await returned.entry.beforeProfiles(), true);
  assert.ok(returned.calls.some(c => Array.isArray(c) && c[0] === 'checkout' && c[1] === 'family_plus'));
  assert.ok(!returned.calls.includes('profiles'));
});
test('registered demo opens the demo without creating or loading child profiles', async () => {
  const h = harness({ signed: true, intent: { kind: 'demo' } });
  assert.equal(await h.entry.beforeProfiles(), true); assert.ok(h.calls.includes('demo'));
  assert.ok(!h.calls.includes('profiles')); assert.equal(h.storage.has(KEY), false);
});
test('a successful-looking return URL cannot bypass unpaid order status', async () => {
  const h = harness({ signed: true, search: `?payment_order=${ORDER}&status_id=1`, paid: true });
  await h.entry.beforeProfiles(); assert.ok(!h.calls.includes('profiles'));
  assert.ok(h.calls.some(c => Array.isArray(c) && c[0] === 'user_id' && c[1] === 'buyer'));
});
test('an order owned by another account cannot unlock profile setup', async () => {
  const h = harness({ signed: true, search: `?payment_order=${ORDER}`, row: null, paid: true });
  await h.entry.beforeProfiles(); assert.ok(!h.calls.includes('profiles'));
  assert.match(h.elements.get('paEntryStatus').textContent, /tidak ditemui/);
});
test('a paid order still waits for server entitlement confirmation', async () => {
  const h = harness({ signed: true, search: `?payment_order=${ORDER}`, row: { status: 'paid' } });
  await h.entry.beforeProfiles(); assert.ok(!h.calls.includes('profiles'));
  h.setPaid(true); await h.entry.checkPayment(); assert.ok(h.calls.includes('profiles'));
  assert.equal(h.storage.has(KEY), false);
});
test('return order survives a second Google sign-in instead of creating a second bill', async () => {
  const first = harness({ search: `?payment_order=${ORDER}`, intent: { kind: 'purchase', plan: 'premium' } });
  const next = harness({ signed: true, storage: first.storage });
  await next.entry.beforeProfiles(); assert.ok(next.calls.some(c => Array.isArray(c) && c[0] === 'id' && c[1] === ORDER));
  assert.ok(!next.calls.some(c => Array.isArray(c) && c[0] === 'checkout'));
});
test('existing customers without purchase intent keep their normal profile route', async () => {
  const h = harness({ signed: true, paid: true }); assert.equal(await h.entry.beforeProfiles(), false);
});
test('leaving the bank without a return query resumes the same pending order', async () => {
  const h = harness({ signed: true, intent: { kind: 'purchase', plan: 'premium' } });
  h.entry.rememberOrder(ORDER);
  const resumed = harness({ signed: true, storage: h.storage });
  await resumed.entry.beforeProfiles();
  assert.ok(resumed.calls.some(c => Array.isArray(c) && c[0] === 'id' && c[1] === ORDER));
  assert.ok(!resumed.calls.some(c => Array.isArray(c) && c[0] === 'checkout'));
});
test('purchase intent from a different account is discarded', async () => {
  const h = harness({ signed: true, intent: { kind: 'purchase', plan: 'premium', userId: 'someone-else' } });
  assert.equal(await h.entry.beforeProfiles(), false); assert.equal(h.storage.has(KEY), false);
});
test('signed-in buyer with a chosen plan goes straight to checkout over the shared pricing', async () => {
  const h = harness({ signed: true, intent: { kind: 'purchase', plan: 'premium' } });
  assert.equal(await h.entry.beforeProfiles(), true);
  assert.ok(h.calls.includes('entry-pricing'));
  assert.ok(h.calls.some(c => Array.isArray(c) && c[0] === 'checkout' && c[1] === 'premium'));
  assert.ok(!h.calls.includes('profiles'));
});

test('normal login survives the OAuth return without displaying the public landing', async () => {
  const first = harness(); await first.entry.login();
  assert.equal(JSON.parse(first.storage.get(KEY)).kind, 'login');
  const returned = harness({ signed: true, storage: first.storage });
  assert.equal(returned.elements.get('login')['data-entry'], 'auth');
  assert.equal(await returned.entry.beforeProfiles(), false);
  assert.equal(returned.elements.get('login')['data-entry'], 'account');
  assert.equal(returned.storage.has(KEY), false);
});

test('an already signed-in login goes directly to profile restoration', async () => {
  const h = harness({ signed: true }); await h.entry.login();
  assert.ok(h.calls.includes('profiles'));
  assert.equal(h.elements.get('login')['data-entry'], 'account');
  assert.ok(!h.calls.some(call => Array.isArray(call) && call[0] === 'screen'));
});
