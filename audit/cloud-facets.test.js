// Phase 5 (docs/PA-DIAGNOSTIC-BRAIN.md §8a): the cloud copy of each answer carries the
// brain's own record, and the admin calibration page rebuilds it and runs the same analyze().
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const B = require('../js/engine/diagnostic-brain-v1.js');
const S = require('../tools/diagnostic-sim.js');
const Cal = require('../admin/kalibrasi-core.js');

const ROOT = path.join(__dirname, '..');
const toRows = (log, child, extra = {}) => log.map(e => ({ c: child, g: 3, s: e.s, q: e.id, k: e.k === 1, h: !!e.h, ms: Math.round(e.sec * 1000), b: 'practice', t: e.t, f: B.cloudFacets(e), ...extra }));
const ids = (log, now) => B.analyze(log, { now, name: 'X' }).findings.map(f => f.id + ':' + JSON.stringify(f.evidence)).sort();

test('cloudFacets keeps brain categories and numbers only, never question text', () => {
  const f = B.cloudFacets({ t: 1, s: 'D3.SUB', o: 'sub', c: 'money', f: 'lazim', k: 0, sec: 4.2, w: 9, a: [52, 18, 'x'], tb: [7], rg: 1, rp: 'a', v: 'RM5.20', x: 'RM0.52', prompt: 'Ali ada RM5', id: 'tok' }, { arch: 'money_sub' });
  assert.deepEqual(f, { v: 1, o: 'sub', c: 'money', f: 'lazim', w: 9, rg: 1, rp: 'a', a: [52, 18], tb: [7], wv: 'RM5.20', x: 'RM0.52', ar: 'money_sub' });
  assert.equal(B.cloudFacets({ o: 'add', v: 'Karipap', x: 'Pau' }).wv, undefined, 'a word answer is not stored');
  assert.equal(B.cloudFacets({ o: 'add', v: '3/4' }).wv, '3/4');
  assert.equal(B.cloudFacets({ o: 'add', v: '10:45' }).wv, '10:45');
  assert.equal(B.cloudFacets(null), null);
  assert.ok(JSON.stringify(B.cloudFacets({ o: 'add', fk: 'x'.repeat(200) })).length < 120, 'strings are capped');
});

test('cloudFacetsAfter: a new record is a first try, the same token later is a retry', () => {
  const log = [{ id: 'a', o: 'add', k: 1 }];
  const before = log[0];
  log.push({ id: 'b', o: 'sub', k: 0, v: '46' });
  assert.deepEqual(B.cloudFacetsAfter(log, before, { token: 'b' }), { v: 1, o: 'sub', wv: '46' });
  log[1].r = 1;
  assert.deepEqual(B.cloudFacetsAfter(log, log[1], { token: 'b' }), { v: 1, o: 'sub', r: 1, wv: '46', rt: 1 });
  assert.equal(B.cloudFacetsAfter(log, log[1], { token: 'zzz' }), null);
  assert.equal(B.cloudFacetsAfter([], undefined, {}), null);
});

test('every dummy child: the log rebuilt from cloud rows gives the same findings and evidence', () => {
  for (const id of Object.keys(S.PERSONAS)) {
    const o = S.simulate(id);
    for (const log of [o.log1, o.log2]) {
      const now = Math.max(...log.map(r => r.t)) + 1000;
      const cloud = log.map(e => ({ t: e.t, question_id: e.id, skill_id: e.s, is_correct: e.k === 1, used_hint: !!e.h, response_ms: Math.round(e.sec * 1000), facets: B.cloudFacets(e) }));
      assert.deepEqual(ids(B.fromCloudRows(cloud), now), ids(log, now), id);
    }
  }
});

test('retry rows mark the first record, they are not new answers', () => {
  const rows = [
    { t: 1000, question_id: 'q1', skill_id: 'D3.SUB', is_correct: false, used_hint: false, response_ms: 5000, facets: { v: 1, o: 'sub', wv: '46' } },
    { t: 9000, question_id: 'q1', skill_id: 'D3.SUB', is_correct: true, used_hint: true, response_ms: 3000, facets: { v: 1, o: 'sub', rt: 1 } },
  ];
  const log = B.fromCloudRows(rows);
  assert.equal(log.length, 1);
  assert.deepEqual(log[0], { t: 1000, s: 'D3.SUB', k: 0, sec: 5, o: 'sub', v: '46', id: 'q1', r: 1, h: 1 });
});

test('calibration summary: findings per child, own test children left out by default', () => {
  const rows = [];
  let now = 0;
  for (const id of ['aisyah', 'mei', 'adam']) {
    const o = S.simulate(id);
    rows.push(...toRows(o.log1, 'kid-' + id));
    now = Math.max(now, ...o.log1.map(r => r.t));
  }
  const mine = S.simulate('faris');
  rows.push(...toRows(mine.log1, 'kid-mine', { mine: true }));
  const s = Cal.summarize(rows, { now: now + 1000 });
  assert.equal(s.children, 3);
  assert.equal(s.facetsPct, 100);
  const expected = new Set(['aisyah', 'mei', 'adam'].flatMap(id => B.analyze(S.simulate(id).log1, { now: now + 1000 }).findings.map(f => f.id)));
  assert.deepEqual(new Set(s.findings.map(f => f.id)), expected);
  for (const f of s.findings) assert.ok(f.kids >= 1 && f.pct > 0 && f.pct <= 100);
  assert.equal(Cal.summarize(rows, { now: now + 1000, includeMine: true }).children, 4);
  const csv = Cal.csv(rows).split('\n');
  assert.equal(csv[0], 'murid,darjah,skill,betul,petunjuk,ms,jenis,tag,masa,facets');
  assert.equal(csv.length - 1, rows.filter(r => !r.mine).length);
});

test('admin/kalibrasi.html shows the brain findings from the RPC and denies non-admins', async (t) => {
  let pw;
  try { pw = require('./lib/browser').loadPlaywright(); } catch (_) { t.skip('Playwright not installed'); return; }
  const { browserPath } = require('./lib/browser');
  const TYPES = { '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
  const server = http.createServer((req, res) => {
    const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await pw.chromium.launch({ executablePath: browserPath() });
  try {
    const o = S.simulate('aisyah');
    const fixture = { generated_at: new Date().toISOString(), days: 90, rows: toRows(o.log1.map(e => ({ ...e, t: Date.now() - (o.log1[o.log1.length - 1].t - e.t) - 60000 })), 'kid-a') };
    const fake = (denied) => `window.supabase={createClient(){return{auth:{getSession:async()=>({data:{session:{user:{id:'u'}}}}),signOut:async()=>({}),signInWithPassword:async()=>({data:{user:{id:'u'}}})},
      rpc:async(name,args)=>{window.__rpc=[name,args];return ${denied} ? {data:null,error:{code:'42501',message:'Admin required'}} : {data:${JSON.stringify(fixture)},error:null}}}}};`;
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.route('**/supabase-js@*/**', r => r.fulfill({ contentType: 'application/javascript', body: fake(false) }));
    await page.goto(base + '/admin/kalibrasi.html');
    await page.locator('#findingRows tr').first().waitFor();
    assert.deepEqual(await page.evaluate(() => window.__rpc), ['admin_calibration_rows', { p_days: 90 }]);
    const want = B.analyze(fixture.rows.map(r => r).length ? B.fromCloudRows(fixture.rows.map(r => ({ t: r.t, question_id: r.q, skill_id: r.s, is_correct: r.k, used_hint: r.h, response_ms: r.ms, facets: r.f }))) : [], { now: Date.now() }).findings.map(f => f.id).sort();
    assert.ok(want.length > 0);
    const shown = (await page.locator('#findingRows tr td:first-child').allInnerTexts()).sort();
    assert.deepEqual(shown, want);
    assert.equal(await page.locator('#childRows tr').count(), 1);
    await page.screenshot({ path: path.join(require('node:os').tmpdir(), 'pa-kalibrasi-390.png'), fullPage: true });
    const denied = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await denied.route('**/supabase-js@*/**', r => r.fulfill({ contentType: 'application/javascript', body: fake(true) }));
    await denied.goto(base + '/admin/kalibrasi.html');
    await denied.locator('#authMessage').getByText('Akses ditolak', { exact: false }).waitFor();
    assert.ok(await denied.locator('#appView').isHidden());
  } finally { await browser.close(); server.close(); }
});
