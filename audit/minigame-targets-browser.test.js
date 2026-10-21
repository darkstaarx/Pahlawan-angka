// Gudang Harta drills what Cikgu Dimensi found (focus_target), and the real app's
// Fokus cards open the mini games with that target. Needs Playwright (audit/lib/browser.js).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { loadPlaywright, browserPath } = require('./lib/browser');
const S = require('../tools/diagnostic-sim.js');

const ROOT = path.join(__dirname, '..');
const TYPES = { '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' };
let server, base, browser;
test.before(async () => {
  server = http.createServer((req, res) => {
    const p = path.join(ROOT, decodeURIComponent(req.url.split(/[?#]/)[0]));
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
    res.setHeader('Content-Type', TYPES[path.extname(p)] || 'application/octet-stream'); fs.createReadStream(p).pipe(res);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
  browser = await loadPlaywright().chromium.launch({ headless: true, executablePath: browserPath('/usr/bin/chromium'), args: ['--no-sandbox'] });
});
test.after(async () => { await browser?.close(); server?.close(); });

async function gudang(target, hash, viewport) {
  const context = await browser.newContext({ serviceWorkers: 'block', ...(viewport ? { viewport } : {}) });
  await context.addInitScript(() => localStorage.setItem('pa_dev_unlocked', '1'));   // local DEV preview of the page
  const page = await context.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${base}/gudang-harta.html?${target ? 'focus_target=' + encodeURIComponent(JSON.stringify(target)) : ''}#${hash}`);
  await page.waitForFunction(() => window.__gudangGen);
  return { page, errors, close: () => context.close() };
}
const digits = (n, c) => Array.from({ length: c }, (_, i) => Math.floor(n / 10 ** i) % 10);

test('sifir target: 7 in 10 rounds drill the weak table, interleaved, starting with the picture step', async () => {
  const g = await gudang({ kind: 'tables', tables: [7] }, 'd3-darab');
  const rounds = await g.page.evaluate(() => window.__gudangGen.sample(20).map(q => ({ target: q.target, arch: q.arch, fx: q.fx, vis: q.vis && q.vis.t })));
  assert.equal(rounds.map(r => r.target ? 'T' : 'N').join(''), 'TTNTTNTTNTTTNTTNTTNT');
  const sifir7 = rounds.filter(r => r.fx?.table === 7).length;
  assert.ok(sifir7 >= 14, `sifir 7 in ${sifir7}/20 rounds`);
  assert.deepEqual([rounds[0].arch, rounds[0].vis], ['target_table_groups', 'array']);
  // Every step of the ladder: picture → break apart (5 × t + …) → recall → missing factor; answers are right.
  const ladder = await g.page.evaluate(() => window.__gudangGen.targets().map(e => Array.from({ length: 30 }, () => e.f({ who: 'Ketupat Kura' })).map(q => ({ arch: e.arch, card: q.card, q: q.q, s: q.s, v: q.form.fields[0].v, fx: q.fx }))));
  assert.deepEqual(ladder.map(l => l[0].arch), ['target_table_groups', 'target_table_break_apart', 'target_table_recall', 'target_table_missing']);
  for (const q of ladder.flat()) {
    assert.equal(q.fx.table, 7, q.card || q.q);
    if (q.fx.op === 'mul') assert.equal(q.v, q.fx.operands[0] * q.fx.operands[1]); else assert.equal(q.v, q.fx.operands[0] / 7);
  }
  assert.ok(ladder[1].every(q => /^Pecahkan: 5 × 7 = 35/.test(q.s)), 'break-apart hint (Singapore strategy)');
  assert.deepEqual(g.errors, []); await g.close();
});

test('re-check (check: true): half the rounds are the target, mixed with normal ones, from the abstract step', async () => {
  const g = await gudang({ kind: 'tables', tables: [7], check: true }, 'd3-darab');
  const rounds = await g.page.evaluate(() => window.__gudangGen.sample(10).map(q => ({ target: q.target, arch: q.arch, fx: q.fx })));
  assert.equal(rounds.map(r => r.target ? 'T' : 'N').join(''), 'TNTNTNTNTN');
  assert.equal(rounds[0].arch, 'target_table_recall', 'no picture scaffold in a check');
  assert.ok(rounds.filter(r => r.target).every(r => r.fx.table === 7));
  assert.deepEqual(g.errors, []); await g.close();
  const b = await gudang({ kind: 'regroup', op: 'sub', check: true }, 'd3-tolak');
  assert.equal((await b.page.evaluate(() => window.__gudangGen.sample(1)[0])).arch, 'target_borrow_written');
  assert.deepEqual(b.errors, []); await b.close();
});

test('kurangkan gambar (fade, lens 4.1): picture, picture, numbers; level 2 drops the pictures; a re-check is numbers only', async () => {
  const g = await gudang({ kind: 'fade' }, 'd3-darab');
  const seq = await g.page.evaluate(() => window.__gudangGen.sample(9).map(q => (q.fade ? (q.fadeAbs ? 'A' : 'P') : '-') + (q.vis ? 'p' : q.rack ? 'c' : 'a')));
  // Every round fades; pictures come with a picture, and every 3rd round is numbers only.
  assert.ok(seq.every(x => x === 'Pp' || x === 'Aa'), seq.join());
  assert.equal(seq.filter(x => x === 'Aa').length, 3, seq.join());
  const top = await g.page.evaluate(() => { window.__gudangGen.fadeLevel.darab = 2; return window.__gudangGen.sample(6).map(q => q.fadeAbs) });
  assert.deepEqual(top, [true, true, true, true, true, true], 'level 2: pictures gone');
  assert.deepEqual(g.errors, []); await g.close();
  const chk = await gudang({ kind: 'fade', check: true }, 'd2-tambah');
  assert.ok((await chk.page.evaluate(() => window.__gudangGen.sample(6))).every(q => q.fadeAbs && !q.rack), 'a re-check is numbers only');
  assert.deepEqual(chk.errors, []); await chk.close();
});

test('model bar (word problems): read → choose the sentence → story alone; right answers, one scale, nothing clipped', async () => {
  for (const [hash, ops] of [['d2-tambah', ['add']], ['d3-tolak', ['sub']], ['d2-darab', ['mul']], ['d4-bahagi', ['div']], ['d6-gabung', ['add', 'sub', 'mul', 'div']]]) {
    const g = await gudang({ kind: 'bar' }, hash, { width: 360, height: 640 });
    const rounds = await g.page.evaluate(() => window.__gudangGen.sample(10).map(q => ({ target: q.target, arch: q.arch })));
    assert.ok(rounds.filter(r => r.target).length >= 6, hash + ' 7 in 10 rounds are bar model rounds');
    const ladder = await g.page.evaluate(() => [0, 1, 2].map(t => { const q = window.__gudangGen.show(t, 0); return { arch: q.arch, vis: q.vis && q.vis.t } }));
    assert.deepEqual(ladder, [{ arch: 'target_bar_read', vis: 'bar' }, { arch: 'target_bar_sentence', vis: 'bar' }, { arch: 'target_bar_story', vis: undefined }], hash);
    for (let i = 0; i < 20; i++) {
      const r = await g.page.evaluate(t => {
        const q = window.__gudangGen.show(t, 0), fx = q.fx;
        const rows = [...document.querySelectorAll('.bmrow')].map(row => [...row.querySelectorAll('.bmseg')].map(x => x.getBoundingClientRect().width));
        return { fx, arch: q.arch, ans: q.form ? q.form.fields[0].v : null, ok: q.opts ? q.opts.find(o => o.id === q.correct).label : null, vis: q.vis, rows,
          clipped: [...document.querySelectorAll('.bmseg,.bmbrace b')].some(x => x.scrollWidth > x.clientWidth + 1), off: document.documentElement.scrollWidth > innerWidth };
      }, i % 3);
      const [a, b] = r.fx.operands, want = { add: a + b, sub: a - b, mul: a * b, div: a / b }[r.fx.op];
      assert.ok(ops.includes(r.fx.op), hash + ' ' + r.fx.op);
      assert.ok(Number.isInteger(want) && want > 0, JSON.stringify(r.fx));
      if (r.ans !== null) assert.equal(r.ans, want, r.arch);
      if (r.ok) assert.equal(r.ok.replace(/\s/g, ''), (a + { add: '+', sub: '−', mul: '×', div: '÷' }[r.fx.op] + b + '=?').replace(/\s/g, ''), 'the right sentence');
      assert.equal(r.fx.format, r.arch === 'target_bar_story' ? 'word' : 'visual');
      if (r.vis) {
        // Same unit everywhere: equal amounts look equal across rows (Singapore bar model).
        const ppu = r.vis.rows.flatMap((row, ri) => row.segs.map((s, si) => r.rows[ri][si] / s.v)), small = Math.min(...r.vis.rows.flatMap(x => x.segs.map(s => s.v)));
        assert.ok((Math.max(...ppu) - Math.min(...ppu)) * small <= 2.5, hash + ' scale ' + JSON.stringify(r.vis.rows));
        assert.equal(r.clipped, false, hash + ' clipped label'); assert.equal(r.off, false, hash + ' sideways scroll');
      }
    }
    assert.deepEqual(g.errors, []); await g.close();
  }
  const chk = await gudang({ kind: 'bar', check: true }, 'd3-tambah');
  assert.equal((await chk.page.evaluate(() => window.__gudangGen.sample(1)[0])).arch, 'target_bar_story', 'a re-check is the story alone');
  await chk.close();
});

test('borrowing target: every targeted round needs borrowing (through zero when asked), rack first', async () => {
  for (const zero of [false, true]) {
    const g = await gudang({ kind: 'regroup', op: 'sub', zero }, 'd3-tolak');
    const first = await g.page.evaluate(() => window.__gudangGen.sample(1)[0]);
    assert.deepEqual([first.target, first.kind, first.arch], [true, 'build', 'target_borrow_rack']);
    const items = await g.page.evaluate(() => window.__gudangGen.targets().flatMap(e => Array.from({ length: 40 }, () => e.f({ who: 'Arnab' }))).map(q => ({ fx: q.fx, v: q.need ? q.need.v : q.form.fields[0].v })));
    for (const { fx: { op, operands: [a, b] }, v } of items) {
      assert.equal(op, 'sub'); assert.equal(v, a - b); assert.ok(a >= 1000 && a <= 9999 && b >= 1 && b < a, `${a} − ${b}`);
      const A = digits(a, 4), B = digits(b, 4);
      assert.ok(A.some((x, i) => x < B[i]), `${a} − ${b} needs borrowing`);
      if (zero) assert.ok(A[1] === 0 && A[0] < B[0], `${a} − ${b} borrows through zero`);
    }
    assert.deepEqual(g.errors, []); await g.close();
  }
});

test('carrying target, and no target / a bad target / another mode leave the game as it was', async () => {
  const g = await gudang({ kind: 'regroup', op: 'add' }, 'd2-tambah');
  const items = await g.page.evaluate(() => window.__gudangGen.targets().flatMap(e => Array.from({ length: 40 }, () => e.f({ who: 'Arnab' }))).map(q => q.fx.operands));
  for (const [a, b] of items) assert.ok(digits(a, 3).some((x, i) => x + digits(b, 3)[i] > 9) && a + b < 1000, `${a} + ${b}`);
  await g.close();
  for (const [target, hash] of [[null, 'd3-darab'], [{ kind: 'tables', tables: ['x', 99] }, 'd3-darab'], [{ kind: 'evil' }, 'd3-tolak'], [{ kind: 'tables', tables: [7] }, 'd3-tolak']]) {
    const h = await gudang(target, hash);
    const any = await h.page.evaluate(() => window.__gudangGen.sample(10).some(q => q.target));
    assert.equal(any, false, JSON.stringify(target) + ' ' + hash);
    assert.deepEqual(h.errors, []); await h.close();
  }
});

test('question first: the question panel is bigger than the scene and nothing is cut off', async () => {
  for (const [width, height] of [[390, 844], [360, 640], [1280, 900]]) for (const [target, hash] of [[{ kind: 'regroup', op: 'sub' }, 'd3-tolak'], [{ kind: 'tables', tables: [7] }, 'd3-darab'], [null, 'd3-bina']]) {
    const g = await gudang(target, hash, { width, height });
    await g.page.waitForFunction(() => document.querySelector('.panel').style.getPropertyValue('--qz'));
    const m = await g.page.evaluate(() => {
      const box = s => document.querySelector(s).getBoundingClientRect(), game = box('.pa-game');
      return { scene: box('.scene').height, panel: box('.panel').height, qz: Number(document.querySelector('.panel').style.getPropertyValue('--qz')),
        actionsBottom: box('.actions').bottom, gameBottom: game.bottom, legsHidden: box('.scene .wira').bottom - box('.scene .counter').top > .35 * box('.scene .wira').height, wide: document.documentElement.scrollWidth > innerWidth || document.querySelector('.panel').scrollWidth > document.querySelector('.panel').clientWidth + 1 };
    });
    const at = `${width}x${height} ${hash}: ${JSON.stringify(m)}`;
    assert.ok(m.panel > m.scene, at);
    assert.ok(m.qz >= 1 && m.qz <= 1.6, at);
    assert.ok(m.actionsBottom <= m.gameBottom + 1, 'Semak button stays on screen: ' + at);
    assert.equal(m.wide, false, at);
    assert.ok(m.legsHidden, 'waist-up Wira behind the counter: ' + at);
    assert.deepEqual(g.errors, []); await g.close();
  }
});

test('small phones: in every mini game the Tanya Wira / Semak row stays on screen and every other button can be scrolled to', async () => {
  // Inside the app the frame is the screen minus the "Kembali" bar and the status line.
  const games = ['gudang-harta', 'kedai-kek', 'dapur-ramuan', 'pos-peninjau', 'lombong-permata', 'bengkel-ajaib', 'tapak-bina', 'menara-jam', 'gerai-wirayung'];
  for (const game of games) for (const viewport of [{ width: 320, height: 500 }, { width: 360, height: 575 }]) {
    const context = await browser.newContext({ serviceWorkers: 'block', viewport });
    await context.addInitScript(() => localStorage.setItem('pa_dev_unlocked', '1'));
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`${base}/${game}.html`);
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => {
      const root = document.querySelector('.pa-game,.game'), shown = el => { const b = el.getBoundingClientRect(), s = getComputedStyle(el); return b.width > 0 && b.height > 0 && s.visibility !== 'hidden' && !el.closest('[hidden],.devfoot') };
      const acts = [...document.querySelectorAll('.actions button')].filter(shown), inView = acts.length > 0 && acts.every(x => x.getBoundingClientRect().bottom <= innerHeight + 1);
      root.scrollTop = root.scrollHeight;
      const top = Math.min(...acts.map(x => x.getBoundingClientRect().top));
      const hidden = [...document.querySelectorAll('button,[role=button],.tl')].filter(shown).filter(x => !x.closest('.actions')).filter(x => x.getBoundingClientRect().bottom > Math.min(top, innerHeight) + 1).map(x => x.textContent.trim().slice(0, 8));
      return { inView, hidden, sideways: document.documentElement.scrollWidth > innerWidth + 1 };
    });
    assert.ok(r.inView, `${game} ${viewport.width}: Tanya Wira / Semak off screen`);
    assert.deepEqual(r.hidden, [], `${game} ${viewport.width}: buttons out of reach`);
    assert.equal(r.sideways, false, `${game} ${viewport.width}: sideways scroll`);
    assert.deepEqual(errors, [], game);
    await context.close();
  }
});

test('question first in every mini game: bigger panel, waist-up Wira with his head in view', async () => {
  const games = ['gudang-harta', 'kedai-kek', 'bengkel-ajaib', 'dapur-ramuan', 'pos-peninjau', 'lombong-permata', 'tapak-bina', 'menara-jam', 'gerai-wirayung'];
  for (const [width, height] of [[390, 844], [360, 640]]) for (const game of games) {
    const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width, height } });
    await context.addInitScript(() => localStorage.setItem('pa_dev_unlocked', '1'));
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`${base}/${game}.html`);
    await page.waitForFunction(() => document.querySelector('.panel')?.style.getPropertyValue('--qz'));
    const m = await page.evaluate(() => {
      const box = s => document.querySelector(s)?.getBoundingClientRect(), scene = box('.scene'), wira = box('.scene .wira'), counter = box('.scene .counter');
      return { scene: scene.height, panel: box('.panel').height, headCut: scene.top - wira.top, floor: counter ? counter.top : scene.bottom,
        wiraBottom: wira.bottom, wiraH: wira.height, actionsBottom: box('.actions').bottom, gameBottom: box(':is(.pa-game,.game)').bottom,
        wide: document.documentElement.scrollWidth > innerWidth };
    });
    const at = `${game} ${width}x${height}: ${JSON.stringify(m)}`;
    assert.ok(m.panel > m.scene, 'panel bigger than the scene: ' + at);
    assert.ok(m.headCut <= .08 * m.wiraH, 'Wira\'s head stays in the scene: ' + at);
    assert.ok(m.wiraBottom - m.floor > .25 * m.wiraH, 'Wira shown from the waist up: ' + at);
    assert.ok(m.actionsBottom <= m.gameBottom + 1, 'buttons on screen: ' + at);
    assert.equal(m.wide, false, at);
    assert.deepEqual(errors, [], game); await context.close();
  }
});

test('real app: brain cards open Gudang Harta with the target and Gerai Wirayung on "baki"', async () => {
  const log = S.simulate('aisyah').log1, opened = [];
  for (const index of [0, 1, 2]) {
    const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
    await context.route('**/*', route => route.request().url().startsWith(base) && ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base + '/index.html');
    await page.waitForFunction(() => window.PAFocusPractice && window.PATargets && window.PAFocusMiniGamesLive && window.PAWirayungLive, null, { timeout: 30000 });
    const skill = await page.evaluate(([log, index]) => {
      window.PACommercial = { requireFeature: () => true, canUse: () => true, authorizeMission: async () => true };
      window.PACloud = { state: {}, scheduleSave() {}, syncSaveNow() {} }; window.save = () => {};
      db = { schoolGrade: 3, name: 'Aisyah', hero: 'wira', level: 1, coins: 0, xp: 0, skills: {}, logs: [], coreFrontier: 1, completedMissions: {}, rewards: { pets: {}, auras: {}, badges: {} }, learnerReviewV1: { schema: 1, encounters: [] }, diagLog: log };
      sess = {}; initAll(); PAFocusPractice.open();
      const card = document.querySelectorAll('.focusPickCard')[index]; card.click(); return card.dataset.skill;
    }, [log, index]);
    const src = await page.evaluate(() => (document.querySelector('#paFocusMiniGameOverlay iframe') || document.getElementById('paWirayungFrame'))?.getAttribute('src') || '');
    opened.push([skill, src.split('?')[0], new URLSearchParams(src.split('?')[1]?.split('#')[0]).get('focus_target'), src.split('#')[1] || '']);
    assert.deepEqual(errors, []); await context.close();
  }
  assert.deepEqual(opened, [
    ['D3.MUL', 'gudang-harta.html', '{"kind":"tables","tables":[3]}', 'd3-darab'],
    ['D3.MONEY', 'gerai-wirayung.html', null, 'd3-baki'],
    ['D3.SUB10000', 'gudang-harta.html', '{"kind":"regroup","op":"sub","zero":false}', 'd3-tolak']]);
});
