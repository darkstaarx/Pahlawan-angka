// affiliate.html (owner, 2026-10-25): from the front page, sign up as an affiliate without entering the
// app and get the referral link at once. Supabase is faked; the page talks to it like the real client.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const TYPES = { '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' };

const fake = `(() => {
  const st = window.__sb = { session: null, app: null, calls: [], confirm: false };
  const listeners = [];
  const user = email => ({ id: 'u1', email, user_metadata: { full_name: 'Aminah Ali' } });
  const fire = ev => listeners.forEach(f => f(ev, st.session));
  window.supabase = { createClient() { return {
    auth: {
      getSession: async () => ({ data: { session: st.session } }),
      onAuthStateChange(f) { listeners.push(f); return { data: { subscription: { unsubscribe() {} } } }; },
      signUp: async ({ email }) => { st.calls.push(['signUp', email]); if (st.confirm) return { data: { session: null }, error: null }; st.session = { user: user(email) }; fire('SIGNED_IN'); return { data: { session: st.session }, error: null }; },
      signInWithPassword: async ({ email }) => { st.calls.push(['signIn', email]); st.session = { user: user(email) }; fire('SIGNED_IN'); return { data: { session: st.session }, error: null }; },
      signInWithOAuth: async (o) => { st.calls.push(['oauth', o.provider]); return { error: null }; },
      signOut: async () => { st.session = null; fire('SIGNED_OUT'); return {}; },
    },
    from(table) { const q = { select() { return q; }, eq() { return q; },
      maybeSingle: async () => ({ data: table === 'affiliate_applications' ? st.app : null, error: null }),
      then(res) { return Promise.resolve({ data: table === 'plan_catalog' ? [{ plan: 'premium', price_cents: 1900, commission_cents: 900 }, { plan: 'family_plus', price_cents: 2900, commission_cents: 1500 }] : [], error: null }).then(res); } };
      return q; },
    functions: { invoke: async (name, { body }) => { st.calls.push([name, body]); st.app = { status: 'approved', code: 'PA1234ABCD', display_name: body.display_name }; return { data: { application: st.app }, error: null }; } },
  }; } };
})();`;

let server, base, browser;
test.before(async () => {
  server = http.createServer((req, res) => {
    const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port;
  let pw; try { pw = require('./lib/browser').loadPlaywright(); } catch (_) { return; }
  browser = await pw.chromium.launch({ executablePath: require('./lib/browser').browserPath() });
});
test.after(async () => { await browser?.close(); server?.close(); });

async function page() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route('**/supabase-js@*/**', r => r.fulfill({ contentType: 'application/javascript', body: fake }));
  const p = await ctx.newPage(); p.errors = []; p.on('pageerror', e => p.errors.push(e.message));
  return p;
}

test('sign up with e-mail, give name and phone, get the referral link with share buttons', async (t) => {
  if (!browser) { t.skip('Playwright not installed'); return; }
  const p = await page();
  await p.goto(base + '/affiliate.html');
  await p.locator('#vAuth').waitFor();
  assert.equal(await p.locator('#pComm').textContent(), 'RM9');
  await p.fill('#email', 'aminah@example.com'); await p.fill('#password', 'rahsia123');
  await p.click('#authBtn');
  assert.match(await p.locator('#authMsg').textContent(), /persetujuan/, 'consent first');
  await p.check('#consent'); await p.click('#authBtn');
  await p.locator('#vDetails').waitFor();
  assert.equal(await p.inputValue('#acct'), 'aminah@example.com');
  assert.equal(await p.inputValue('#name'), 'Aminah Ali', 'name from the account');
  await p.fill('#phone', '012-345 6789'); await p.click('#joinBtn');
  await p.locator('#vLink').waitFor();
  assert.equal(await p.inputValue('#refLink'), 'https://pahlawanangka.netlify.app/?ref=PA1234ABCD');
  assert.match(await p.getAttribute('#wa', 'href'), /^https:\/\/wa\.me\/\?text=.*PA1234ABCD/);
  assert.match(await p.locator('#caption').textContent(), /demo percuma[\s\S]*\?ref=PA1234ABCD$/);
  const calls = await p.evaluate(() => window.__sb.calls);
  assert.deepEqual(calls.find(c => c[0] === 'affiliate-application')[1], { display_name: 'Aminah Ali', phone: '0123456789', account_name: '', bank_name: '', account_number: '' });
  assert.deepEqual(p.errors, []);
});

test('an affiliate who comes back sees the link at once; e-mail confirmation shows a clear message', async (t) => {
  if (!browser) { t.skip('Playwright not installed'); return; }
  const p = await page();
  await p.route('**/supabase-js@*/**', r => r.fulfill({ contentType: 'application/javascript', body: fake + ';window.__sb.session={user:{id:"u1",email:"a@b.co",user_metadata:{}}};window.__sb.app={status:"approved",code:"PAXY"};' }));
  await p.goto(base + '/affiliate.html');
  await p.locator('#vLink').waitFor();
  assert.equal(await p.locator('#refCode').textContent(), 'PAXY');
  const q = await page();
  await q.route('**/supabase-js@*/**', r => r.fulfill({ contentType: 'application/javascript', body: fake + ';window.__sb.confirm=true;' }));
  await q.goto(base + '/affiliate.html');
  await q.locator('#vAuth').waitFor();
  await q.check('#consent'); await q.fill('#email', 'baru@example.com'); await q.fill('#password', 'rahsia123'); await q.click('#authBtn');
  assert.match(await q.locator('#authMsg').textContent(), /e-mel pengesahan ke baru@example\.com/);
  assert.equal(await q.isVisible('#vDetails'), false);
});

test('the front page links to the affiliate page, outside the app frame', () => {
  const s = fs.readFileSync(path.join(ROOT, 'landing-approved-v1.html'), 'utf8');
  assert.match(s, /<a class="aff-link" href="affiliate\.html" target="_top">/);
  assert.match(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), /landing-approved-v1\.html\?v=1\.4\.1/);
});
