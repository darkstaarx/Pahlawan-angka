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
  // Measure with the real fonts: Google Fonts swap in late, and the fallback font is wider.
  await page.evaluate(() => document.fonts.ready);
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

test('baca soalan panjang (lens 4.8): short wording → long with the question marked → long alone; keypad stays in reach', async () => {
  // Common phones and a laptop: the keypad is in view. A 320 px phone scrolls to it, as every mini game does (small phones test).
  for (const [hash, op, viewport, scroll] of [['d4-tolak', 'sub', { width: 390, height: 844 }], ['d3-darab', 'mul', { width: 360, height: 640 }], ['d5-bahagi', 'div', { width: 375, height: 667 }], ['d6-gabung', null, { width: 1366, height: 768 }], ['d3-tolak', 'sub', { width: 320, height: 500 }, true]]) {
    const g = await gudang({ kind: 'reading' }, hash, viewport);
    const rounds = await g.page.evaluate(() => window.__gudangGen.sample(10).map(q => q.target));
    assert.ok(rounds.filter(Boolean).length >= 6, hash + ' 7 in 10 rounds');
    for (let i = 0; i < 9; i++) {
      const r = await g.page.evaluate(async ([t, scroll]) => {
        const q = window.__gudangGen.show(t, 0);
        await new Promise(res => setTimeout(res, 300));   // the panel fit settles (js/minigame-panel-fit-v1.js)
        if (scroll) document.querySelector('.pa-game').scrollTop = 1e5;
        const keys = [...document.querySelectorAll('#tiles .tl')].map(k => k.getBoundingClientRect().bottom), act = document.querySelector('.actions').getBoundingClientRect().top;
        return { arch: q.arch, fx: q.fx, ans: q.form.fields[0].v, story: document.querySelector('.story')?.textContent, mark: document.querySelector('.story mark')?.textContent || '',
          keysOk: Math.max(...keys) <= act + 1, off: document.documentElement.scrollWidth > innerWidth };
      }, [i % 3, !!scroll]);
      assert.equal(r.arch, ['target_read_short', 'target_read_marked', 'target_read_long'][i % 3]);
      assert.equal(r.fx.reading, [1, 2, 3][i % 3]);
      assert.equal(r.fx.format, 'word');
      if (op) assert.equal(r.fx.op, op, hash);
      const [a, b] = r.fx.operands;
      assert.equal(r.ans, { add: a + b, sub: a - b, mul: a * b, div: a / b }[r.fx.op], r.story);
      const words = r.story.replace(/(\d)[ \u00a0](?=\d{3}\b)/g, '$1').trim().split(/\s+/).length;
      assert.ok(i % 3 === 0 ? words <= 12 : words >= 25, r.story);
      // The marked step highlights the question sentence (the last one), nothing else.
      assert.equal(r.mark, i % 3 === 1 ? (r.story.match(/[^.?!]+\?\s*$/) || [''])[0].trim() : '');
      assert.equal(r.keysOk, true, `${hash} ${viewport.width}×${viewport.height}: keypad under the action row`);
      assert.equal(r.off, false, hash + ' sideways scroll');
    }
    assert.deepEqual(g.errors, []); await g.close();
  }
  const chk = await gudang({ kind: 'reading', check: true }, 'd4-tolak');
  assert.equal((await chk.page.evaluate(() => window.__gudangGen.sample(1)[0])).arch, 'target_read_long', 'a re-check is the long wording alone');
  await chk.close();
});

test('soalan bercampur (choose, lens 4.6): pick the sentence (no bar) → story alone; the operation never repeats', async () => {
  for (const hash of ['d4-tambah', 'd3-tolak', 'd5-gabung']) {
    const g = await gudang({ kind: 'choose' }, hash, { width: 360, height: 640 });
    const rounds = await g.page.evaluate(() => window.__gudangGen.sample(10).map(q => ({ target: q.target, arch: q.arch, op: q.fx && q.fx.op })));
    const tg = rounds.filter(r => r.target);
    assert.ok(tg.length >= 6, hash + ' 7 in 10 rounds are mixed story rounds');
    assert.equal(tg[0].arch, 'target_choose_sentence', hash + ' starts by choosing the sentence');
    assert.ok(tg.every((r, i) => i === 0 || r.op !== tg[i - 1].op), hash + ' ops ' + tg.map(r => r.op).join());
    for (let i = 0; i < 12; i++) {
      const r = await g.page.evaluate(t => { const q = window.__gudangGen.show(t, 0);
        return { arch: q.arch, fx: q.fx, vis: !!q.vis, ans: q.form ? q.form.fields[0].v : null, ok: q.opts ? q.opts.find(o => o.id === q.correct).label : null, n: q.opts ? q.opts.length : 0, badge: document.getElementById('mode').textContent };
      }, i % 2);
      const [a, b] = r.fx.operands, want = { add: a + b, sub: a - b, mul: a * b, div: a / b }[r.fx.op];
      assert.equal(r.vis, false, 'no bar drawn: the child chooses alone');
      assert.match(r.badge, /^BERCAMPUR · T\d$/, 'the mode badge must not give the operation away');
      assert.equal(r.fx.format, 'word');
      if (r.arch === 'target_choose_sentence') { assert.equal(r.n, 3); assert.equal(r.ok.replace(/\s/g, ''), (a + { add: '+', sub: '−', mul: '×', div: '÷' }[r.fx.op] + b + '=?').replace(/\s/g, '')) }
      else assert.equal(r.ans, want);
    }
    assert.deepEqual(g.errors, []); await g.close();
  }
  const chk = await gudang({ kind: 'choose', check: true }, 'd4-tolak');
  assert.equal((await chk.page.evaluate(() => window.__gudangGen.sample(1)[0])).arch, 'target_choose_story', 'a re-check is the story alone');
  await chk.close();
});

test('Menara Jam calendar rounds (hari / bulan / waktu) show the answer on the stamp, not "undefined"', async () => {
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => localStorage.setItem('pa_dev_unlocked', '1'));
  const page = await context.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${base}/menara-jam.html#d1-kalendar`);
  await page.waitForFunction(() => window.__menaraDebug && window.__menaraDebug());
  const stamps = [];
  for (let i = 0; i < 4; i++) {
    const d = await page.evaluate(() => window.__menaraDebug());
    if (d.widget !== 'choice') break;
    await page.evaluate(t => [...document.querySelectorAll('button')].find(x => x.textContent.trim() === t).click(), d.target);
    await page.evaluate(() => document.getElementById('check').click());
    stamps.push([d.target, await page.evaluate(() => document.querySelector('.stamp').textContent)]);
    await page.evaluate(() => document.getElementById('check').click());
  }
  assert.ok(stamps.length >= 2, JSON.stringify(stamps));
  for (const [target, stamp] of stamps) { assert.ok(stamp.includes(target), stamp); assert.ok(!/undefined/.test(stamp), stamp); }
  assert.deepEqual(errors, []); await context.close();
});

test('a profile saved before newer skills existed opens the app without an error', async () => {
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  await context.route('**/*', route => route.request().url().startsWith(base) && ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
  await context.addInitScript(() => localStorage.setItem('pa_coach_v6_full', JSON.stringify({ name: 'Lama', schoolGrade: 3, hero: 'wira', level: 2, xp: 0, coins: 0, coreFrontier: 1,
    petCollectionMigrationVersion: 2, onboarding: { completed: true }, skills: { 'D3.MUL': { mastery: 60, confidence: 50, evidence: 5, correct: 4, wrong: 1, hints: 0, mis: {}, lastSeen: 0, stability: 20 } } })));
  const page = await context.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base + '/index.html');
  await page.waitForFunction(() => window.PAParentLearningTools || document.getElementById('worksheetTab'), null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2500);
  assert.deepEqual(errors, []); await context.close();
});

test('Jom tengok cara: offered after 3 wrong tries, every step tapped, the board ends at the answer, then a similar round', async () => {
  for (const [hash, story] of [['d3-tambah', false], ['d4-tolak', true]]) {
    const g = await gudang(null, hash, { width: 390, height: 780 });
    // Equal numbers (answer "=") have no differing digit to tap, so skip them here.
    const r0 = await g.page.evaluate(story => {
      for (let i = 0; i < 400; i++) { const q = window.__gudangGen.showNormal(i % 6, 0); if (q.kind === 'pad' && q.form && (story ? !q.card : !!q.card) && window.PAWorked.parse(q)) return { mode: q.mode, ans: q.form.fields[0].v, hint: document.getElementById('hint').textContent }; }
      return null;
    }, story);
    assert.ok(r0, hash);
    for (let i = 0; i < 3; i++) {
      for (const ch of String(r0.ans + 10 * (i + 1))) await g.page.keyboard.press(ch);
      await g.page.evaluate(() => document.getElementById('check').click());
      for (let k = 0; k < 8; k++) await g.page.keyboard.press('Backspace');
    }
    assert.equal(await g.page.evaluate(() => document.getElementById('hint').textContent), 'Jom tengok cara');
    await g.page.evaluate(() => document.getElementById('hint').click());
    if (story) assert.equal(await g.page.evaluate(() => [document.querySelectorAll('#wkInline .wk-t').length, !!document.querySelector('.wk-board.wk-wait')].join()), '3,true', 'sentence choices first, under Wira\'s line, board waiting');
    for (let n = 0; n < 20; n++) {
      const right = await g.page.evaluate(() => window.__wkRight && window.__wkRight());
      const open = await g.page.evaluate(() => document.querySelectorAll('.wk-t:not([disabled])').length);
      if (!open) break;
      await g.page.evaluate(v => [...document.querySelectorAll('.wk-t:not([disabled])')].find(b => b.dataset.v === v).click(), right);
      await g.page.waitForTimeout(950);
    }
    const end = await g.page.evaluate(() => ({ board: [...document.querySelectorAll('.wk-ans .wk-c')].map(c => c.textContent).join(''), check: document.getElementById('check').textContent, stamp: document.querySelector('.stamp').textContent }));
    assert.equal(Number(end.board), r0.ans, 'the board ends at the round answer');
    assert.equal(end.check, 'Cuba soalan serupa →');
    assert.match(end.stamp, /^SIAP!Cara Wira/);
    await g.page.evaluate(() => document.getElementById('check').click());
    const next = await g.page.evaluate(() => ({ mode: window.__gudangGen.current().mode, hint: document.getElementById('hint').textContent, kp: !!document.querySelector('#tiles.kp') }));
    assert.deepEqual(next, { mode: r0.mode, hint: 'Tanya Wira', kp: true }, 'the same kind of question, fresh');
    assert.deepEqual(g.errors, []); await g.close();
  }
});

test('Jom tengok cara on the place-value board: a 2-choice round is offered after 1 miss, the pupil taps the digit', async () => {
  for (const [hash, t, kind] of [['d4-banding', 'round', 'pick'], ['d4-banding', 'compare', 'pick'], ['d4-bina', 'digitValue', 'pad']]) {
    const g = await gudang(null, hash, { width: 390, height: 780 });
    const r0 = await g.page.evaluate(([t, kind]) => {
      for (let i = 0; i < 3000; i++) { const q = window.__gudangGen.showNormal(i % 7, 0); if (q.wk && q.wk.t === t && q.kind === kind && (kind !== 'pick' || q.opts.length <= 3) && !(t === 'compare' && q.wk.a === q.wk.b)) return { mode: q.mode, n: q.opts ? q.opts.length : 0, correct: q.correct, ans: q.form && q.form.fields[0].v, ansText: kind === 'pick' ? q.opts.find(o => o.id === q.correct).label : null }; }
      return null;
    }, [t, kind]);
    assert.ok(r0, hash + ' ' + t);
    const miss = async i => {
      if (kind === 'pick') await g.page.evaluate(c => { [...document.querySelectorAll('#tiles [data-o]')].find(x => x.dataset.o !== c).click(); document.getElementById('check').click(); }, r0.correct);
      else { for (const ch of String(r0.ans + 10 * (i + 1))) await g.page.keyboard.press(ch); await g.page.evaluate(() => document.getElementById('check').click()); for (let k = 0; k < 8; k++) await g.page.keyboard.press('Backspace'); }
    };
    const need = kind === 'pick' ? (r0.n <= 2 ? 1 : 2) : 3;
    for (let i = 0; i < need - 1; i++) await miss(i);
    assert.notEqual(await g.page.evaluate(() => document.getElementById('hint').textContent), 'Jom tengok cara', 'not yet');
    await miss(need - 1);
    assert.equal(await g.page.evaluate(() => document.getElementById('hint').textContent), 'Jom tengok cara');
    await g.page.evaluate(() => document.getElementById('hint').click());
    let taps = 0;
    for (let n = 0; n < 10; n++) {
      const right = await g.page.evaluate(() => window.__wkRight && window.__wkRight());
      if (await g.page.evaluate(() => !!document.querySelector('.stamp.show'))) break;
      if (right.startsWith('tap:')) {
        const [, row, col] = right.split(':'); taps++;
        // A wrong digit shakes and the right one glows; then the right one.
        await g.page.evaluate(([row, col]) => { const all = [...document.querySelectorAll('.wk-board.wk-tapnow .wk-c.wk-can')]; all.find(c => c.dataset.row !== row || c.dataset.col !== col).click(); }, [row, col]);
        assert.ok(await g.page.evaluate(([row, col]) => document.querySelector(`.wk-pvrow[data-row="${row}"] [data-col="${col}"]`).classList.contains('wk-hint'), [row, col]));
        await g.page.evaluate(([row, col]) => document.querySelector(`.wk-pvrow[data-row="${row}"] [data-col="${col}"]`).click(), [row, col]);
      } else await g.page.evaluate(v => [...document.querySelectorAll('.wk-t:not([disabled])')].find(b => b.dataset.v === v).click(), right);
      await g.page.waitForTimeout(950);
    }
    assert.ok(taps >= 1, 'the pupil taps a digit on the board');
    const stamp = await g.page.evaluate(() => document.querySelector('.stamp').textContent);
    assert.match(stamp, /^SIAP!Cara Wira/);
    if (r0.ansText) assert.ok(stamp.includes(r0.ansText), stamp + ' / ' + r0.ansText);
    assert.equal(await g.page.evaluate(() => document.getElementById('check').textContent), 'Cuba soalan serupa →');
    assert.deepEqual(g.errors, []); await g.close();
  }
});

test('Jom tengok cara on the rack, two steps, patterns and compose: every step done, ends at the answer', async () => {
  for (const [hash, cond] of [['d3-bina', "q.kind==='build'&&q.rack.mode==='build'"], ['d3-tambah', "q.kind==='build'&&q.rack.mode==='add'"], ['d3-tolak', "!!q.wk&&q.wk.t==='chain'&&!q.card"], ['d2-pola', "!!q.wk&&q.wk.t==='seq'"], ['d4-bina', "!!q.wk&&q.wk.t==='compose'"], ['d3-banding', "!!q.wk&&q.wk.t==='order'"], ['d3-bina', "!!q.wk&&q.wk.t==='fromWords'"], ['d1-tambah', "!!q.wk&&q.wk.t==='make10'"], ['d5-darab', "!!q.wk&&q.wk.t==='long'&&!!q.card"], ['d2-bahagi', "!!q.form&&q.form.fields.length===2"]]) {
    const g = await gudang(null, hash, { width: 390, height: 780 });
    const r0 = await g.page.evaluate(cond => { const ok = new Function('q', 'return ' + cond); for (let i = 0; i < 3000; i++) { const q = window.__gudangGen.showNormal(i % 7, 0); if (ok(q)) return { kind: q.kind, mode: q.rack && q.rack.mode, v: q.form ? q.form.fields.map(f => f.v).join('') : q.need ? q.need.v : q.opts.find(o => o.id === q.correct).label.replace(/\D/g, '') }; } return null; }, cond);
    assert.ok(r0, hash);
    await g.page.waitForTimeout(800);
    for (let i = 0; i < 3; i++) {
      if (r0.kind === 'pick') await g.page.evaluate(() => { const q = window.__gudangGen.current(); [...document.querySelectorAll('#tiles [data-o]')].find(x => x.dataset.o !== q.correct).click(); document.getElementById('check').click(); });
      else if (r0.mode === 'build') await g.page.evaluate(() => document.getElementById('check').click());
      else { await g.page.keyboard.press('1'); await g.page.evaluate(() => document.getElementById('check').click()); await g.page.keyboard.press('Backspace'); }
    }
    assert.equal(await g.page.evaluate(() => document.getElementById('hint').textContent), 'Jom tengok cara', hash);
    await g.page.evaluate(() => document.getElementById('hint').click());
    if (r0.mode === 'build') {
      // Only the lit place takes a harta; the other places' buttons wait.
      assert.deepEqual(await g.page.evaluate(() => [document.querySelectorAll('.col.wk-colon').length, document.querySelectorAll('.col:not(.wk-colon) button:not([disabled])').length]), [1, 0]);
    }
    for (let s = 0; s < 80; s++) {
      if (await g.page.evaluate(() => !!document.querySelector('.stamp.show'))) break;
      const did = await g.page.evaluate(() => { const pl = document.querySelector('.col.wk-colon button.pl:not([disabled])'); if (pl) { pl.click(); return 'plus'; } const v = window.__wkRight && window.__wkRight();
        if (v && v.startsWith('tap:')) { const [, r, c] = v.split(':'); document.querySelector(`.wk-pvrow[data-row="${r}"] [data-col="${c}"]`).click(); return 'tap'; }
        const x = [...document.querySelectorAll('.wk-t:not([disabled])')].find(b => b.dataset.v === v || (v === 'go' && b.dataset.v === 'go')); if (x) { x.click(); return 'tile'; } return null; });
      await g.page.waitForTimeout(did === 'plus' ? 120 : 1000);
    }
    const stamp = await g.page.evaluate(() => document.querySelector('.stamp.show') && document.querySelector('.stamp').textContent);
    assert.match(String(stamp), /^SIAP!Cara Wira/, hash);
    if (r0.mode === 'build') assert.equal(await g.page.evaluate(() => document.getElementById('rv').textContent.replace(/\D/g, '')), String(r0.v));
    else assert.ok(String(stamp).replace(/\D/g, '').endsWith(String(r0.v)), hash + ' ' + stamp + ' ends at ' + r0.v);
    assert.deepEqual(g.errors, []); await g.close();
  }
});

test('Lombong Permata: Jom tengok cara walks lazim, hundred-grid and compare rounds to their answer', async () => {
  for (const [hash, cond] of [['d4-perpuluhan', "q.kind==='lazim'&&q.lz.rows.length===2"], ['d3-peratus', "!!q.wk&&q.wk.t==='grid'"], ['d3-perpuluhan', "!!q.wk&&q.wk.t==='compare'"]]) {
    const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 780 } });
    await context.addInitScript(() => localStorage.setItem('pa_dev_unlocked', '1'));
    const page = await context.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(`${base}/lombong-permata.html#${hash}`); await page.waitForFunction(() => window.__lbGen && window.PAWorked);
    const r0 = await page.evaluate(cond => { const ok = new Function('q', 'return ' + cond); for (let i = 0; i < 3000; i++) { const q = window.__lbGen.showNormal(i % 7, 0); if (ok(q)) return { kind: q.kind, label: q.kind === 'pick' ? q.opts.find(o => o.id === q.correct).label : null }; } return null; }, cond);
    assert.ok(r0, hash);
    await page.waitForTimeout(800);
    for (let i = 0; i < 3; i++) {
      if (r0.kind === 'pick') await page.evaluate(() => { const q = window.__lbGen.current(); [...document.querySelectorAll('#tiles [data-o]')].find(x => x.dataset.o !== q.correct).click(); document.getElementById('check').click(); });
      else { await page.keyboard.press('1'); await page.evaluate(() => document.getElementById('check').click()); await page.keyboard.press('Backspace'); }
    }
    assert.equal(await page.evaluate(() => document.getElementById('hint').textContent), 'Jom tengok cara', hash);
    await page.evaluate(() => document.getElementById('hint').click());
    for (let n = 0; n < 20; n++) {
      if (await page.evaluate(() => !!document.querySelector('.stamp.show'))) break;
      await page.evaluate(() => { const v = window.__wkRight && window.__wkRight();
        if (v && v.startsWith('tap:')) { const [, r, c] = v.split(':'); document.querySelector(`.wk-pvrow[data-row="${r}"] [data-col="${c}"]`).click(); return; }
        const x = [...document.querySelectorAll('.wk-t:not([disabled])')].find(b => b.dataset.v === v); x && x.click(); });
      await page.waitForTimeout(1000);
    }
    const stamp = await page.evaluate(() => document.querySelector('.stamp').textContent);
    assert.match(stamp, /^SIAP!Cara Wira/, hash);
    assert.equal(await page.evaluate(() => document.getElementById('check').textContent), 'Cuba soalan serupa →');
    assert.deepEqual(errors, []); await context.close();
  }
});

test('Gerai Wirayung: every DEV "Cuba Jom tengok cara" kind walks the money board, then the pupil lays the amount', async () => {
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => localStorage.setItem('pa_dev_unlocked', '1'));
  const page = await context.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${base}/gerai-wirayung.html#d3`); await page.waitForFunction(() => window.__geraiWk && window.PAWorked); await page.waitForTimeout(800);
  await page.click('#devBtn'); const n = await page.evaluate(() => document.querySelectorAll('#wkTry button').length);
  assert.equal(n, 9);
  for (let i = 0; i < n; i++) {
    if (i) await page.click('#devBtn');
    const label = await page.evaluate(i => { const b = document.querySelectorAll('#wkTry button')[i]; b.click(); return b.textContent; }, i);
    await page.waitForTimeout(900);
    assert.equal(await page.evaluate(() => document.getElementById('hint').textContent), 'Jom tengok cara', label);
    await page.evaluate(() => document.getElementById('hint').click());
    for (let s = 0; s < 40; s++) {
      if (!await page.evaluate(() => !!document.getElementById('wkPanel'))) break;
      await page.evaluate(() => { const v = window.__wkRight && window.__wkRight(); const x = [...document.querySelectorAll('#wkPanel .wk-t:not([disabled])')].find(b => b.dataset.v === v); x && x.click(); });
      await page.waitForTimeout(950);
    }
    await page.waitForTimeout(1500);
    const tg = await page.evaluate(() => window.__geraiWk.target());
    assert.match(await page.evaluate(() => document.getElementById('countHint').textContent), /^Jawapan Wira: /, label);
    await page.evaluate(() => window.__geraiWk.lay()); await page.waitForTimeout(600);
    assert.match(await page.evaluate(() => document.getElementById('stamp').textContent), /^SIAP!Cara Wira/, label + ' ' + tg);
    await page.waitForTimeout(2700);
  }
  assert.deepEqual(errors, []); await context.close();
});

test('Kedai Kek: every DEV "Cuba Jom tengok cara" kind walks the fraction board to the round\'s answer; the next round is the same kind', async () => {
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => localStorage.setItem('pa_dev_unlocked', '1'));
  const page = await context.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${base}/kedai-kek.html#d3`); await page.waitForFunction(() => window.__kekGen && window.PAWorked); await page.waitForTimeout(800);
  await page.click('#devBtn'); const n = await page.evaluate(() => document.querySelectorAll('#wkTry button').length);
  assert.equal(n, 16);
  for (let i = 0; i < n; i++) {
    if (i) await page.click('#devBtn');
    const label = await page.evaluate(i => { const b = document.querySelectorAll('#wkTry button')[i]; b.click(); return b.textContent; }, i);
    await page.waitForTimeout(900);
    assert.equal(await page.evaluate(() => document.getElementById('hint').textContent), 'Jom tengok cara', label);
    const kind = await page.evaluate(() => window.__kekGen.current().wk.t);
    await page.evaluate(() => document.getElementById('hint').click());
    let steps = 0;
    for (let s = 0; s < 40; s++) {
      if (await page.evaluate(() => !!document.querySelector('.stamp.show'))) break;
      const clicked = await page.evaluate(() => { const v = window.__wkRight && window.__wkRight(); const x = [...document.querySelectorAll('.wk-t:not([disabled])')].find(b => b.dataset.v === v); if (x) { x.click(); return true; } return false; });
      if (clicked) steps++;
      await page.waitForTimeout(950);
    }
    assert.ok(steps >= 1, label);
    assert.match(await page.evaluate(() => document.getElementById('stamp').textContent), /^SIAP!Cara Wira/, label);
    assert.equal(await page.evaluate(() => document.getElementById('check').textContent), 'Cuba soalan serupa →', label);
    await page.evaluate(() => document.getElementById('check').click()); await page.waitForTimeout(500);
    assert.equal(await page.evaluate(() => window.__kekGen.current().wk?.t), kind, label + ': same kind next');
  }
  // A real round: three wrong answers on a pad bring the offer, with no DEV help.
  await page.evaluate(() => { history.replaceState(null, '', '#d3-bercampur'); dispatchEvent(new HashChangeEvent('hashchange')); }); await page.waitForTimeout(600);
  for (let t = 0; t < 40 && !(await page.evaluate(() => window.__kekGen.current().kind === 'pad' && !!window.__kekGen.planFor(window.__kekGen.current()))); t++) { await page.evaluate(() => window.__kekGen.showNormal(0, 1)); await page.waitForTimeout(100); }
  for (let m = 0; m < 3; m++) {
    assert.notEqual(await page.evaluate(() => document.getElementById('hint').textContent), 'Jom tengok cara', 'not after ' + m);
    await page.evaluate(() => { const f = window.__kekGen.current().form; window.__kekGen.setInp(f.type === 'int' || f.type === 'dec' ? { v: '999' } : { n: '99', d: '100' }); document.getElementById('check').click(); });
    await page.waitForTimeout(300);
  }
  assert.equal(await page.evaluate(() => document.getElementById('hint').textContent), 'Jom tengok cara');
  assert.deepEqual(errors, []); await context.close();
});

test('Pos Peninjau: every DEV "Cuba Jom tengok cara" kind reads the chart (the row lights) and works it out to the round\'s answer', async () => {
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => localStorage.setItem('pa_dev_unlocked', '1'));
  const page = await context.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${base}/pos-peninjau.html#d3`); await page.waitForFunction(() => window.__posGen && window.PAWorked); await page.waitForTimeout(800);
  await page.click('#devBtn'); const n = await page.evaluate(() => document.querySelectorAll('#wkTry button').length);
  assert.equal(n, 17);
  let lit = 0;
  for (let i = 0; i < n; i++) {
    if (i) await page.click('#devBtn');
    const label = await page.evaluate(i => { const b = document.querySelectorAll('#wkTry button')[i]; b.click(); return b.textContent; }, i);
    await page.waitForTimeout(900);
    assert.equal(await page.evaluate(() => document.getElementById('hint').textContent), 'Jom tengok cara', label);
    const arch = await page.evaluate(() => window.__posGen.current().arch);
    await page.evaluate(() => document.getElementById('hint').click());
    for (let s = 0; s < 40; s++) {
      if (await page.evaluate(() => !!document.querySelector('.stamp.show'))) break;
      lit += await page.evaluate(() => document.querySelectorAll('#widget [data-r].wk-hl').length > 0 ? 1 : 0);
      await page.evaluate(() => { const v = window.__wkRight && window.__wkRight(); const x = [...document.querySelectorAll('.wk-t:not([disabled])')].find(b => b.dataset.v === v); x && x.click(); });
      await page.waitForTimeout(950);
    }
    assert.match(await page.evaluate(() => document.getElementById('stamp').textContent), /^SIAP!Cara Wira/, label);
    await page.evaluate(() => document.getElementById('check').click()); await page.waitForTimeout(500);
    assert.equal(await page.evaluate(() => window.__posGen.current().arch), arch, label + ': same kind next');
  }
  assert.ok(lit >= 10, 'reading steps light the row on the chart: ' + lit);
  assert.deepEqual(errors, []); await context.close();
});

test('Bengkel Ajaib: every DEV "Cuba Jom tengok cara" kind works the units out on the card, with the tool still in view', async () => {
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => localStorage.setItem('pa_dev_unlocked', '1'));
  const page = await context.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${base}/bengkel-ajaib.html#d3`); await page.waitForFunction(() => window.__bengkelGen && window.PAWorked); await page.waitForTimeout(800);
  await page.click('#devBtn'); const n = await page.evaluate(() => document.querySelectorAll('#wkTry button').length);
  assert.equal(n, 13);
  for (let i = 0; i < n; i++) {
    if (i) await page.click('#devBtn');
    const label = await page.evaluate(i => { const b = document.querySelectorAll('#wkTry button')[i]; b.click(); return b.textContent; }, i);
    await page.waitForTimeout(900);
    assert.equal(await page.evaluate(() => document.getElementById('hint').textContent), 'Jom tengok cara', label);
    const arch = await page.evaluate(() => window.__bengkelGen.current().arch);
    await page.evaluate(() => document.getElementById('hint').click());
    for (let s = 0; s < 40; s++) {
      if (await page.evaluate(() => !!document.querySelector('.stamp.show'))) break;
      await page.evaluate(() => { const v = window.__wkRight && window.__wkRight(); const x = [...document.querySelectorAll('.wk-t:not([disabled])')].find(b => b.dataset.v === v); x && x.click(); });
      await page.waitForTimeout(950);
    }
    assert.match(await page.evaluate(() => document.getElementById('stamp').textContent), /^SIAP!Cara Wira/, label);
    await page.evaluate(() => document.getElementById('check').click()); await page.waitForTimeout(500);
    assert.equal(await page.evaluate(() => window.__bengkelGen.current().arch), arch, label + ': same kind next');
  }
  assert.deepEqual(errors, []); await context.close();
});

test('Menara Jam: every DEV "Cuba Jom tengok cara" kind walks the time (hours, then minutes) with the clock in view', async () => {
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => localStorage.setItem('pa_dev_unlocked', '1'));
  const page = await context.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${base}/menara-jam.html#d3`); await page.waitForFunction(() => window.__menaraGen && window.PAWorked); await page.waitForTimeout(800);
  await page.click('#devBtn'); const n = await page.evaluate(() => document.querySelectorAll('#wkTry button').length);
  assert.equal(n, 8);
  for (let i = 0; i < n; i++) {
    if (i) await page.click('#devBtn');
    const label = await page.evaluate(i => { const b = document.querySelectorAll('#wkTry button')[i]; b.click(); return b.textContent; }, i);
    await page.waitForTimeout(900);
    assert.equal(await page.evaluate(() => document.getElementById('hint').textContent), 'Jom tengok cara', label);
    const arch = await page.evaluate(() => window.__menaraGen.current().mode);
    await page.evaluate(() => document.getElementById('hint').click());
    for (let s = 0; s < 40; s++) {
      if (await page.evaluate(() => !!document.querySelector('.stamp.show'))) break;
      await page.evaluate(() => { const v = window.__wkRight && window.__wkRight(); const x = [...document.querySelectorAll('.wk-t:not([disabled])')].find(b => b.dataset.v === v); x && x.click(); });
      await page.waitForTimeout(950);
    }
    assert.match(await page.evaluate(() => document.getElementById('stamp').textContent), /^SIAP!Cara Wira/, label);
    await page.evaluate(() => document.getElementById('check').click()); await page.waitForTimeout(500);
    assert.equal(await page.evaluate(() => window.__menaraGen.current().mode), arch, label + ': same kind next');
  }
  assert.deepEqual(errors, []); await context.close();
});

test('Dapur Ramuan: every DEV "Cuba Jom tengok cara" kind walks the ratio or rate to the round\'s answer', async () => {
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => localStorage.setItem('pa_dev_unlocked', '1'));
  const page = await context.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${base}/dapur-ramuan.html#d5`); await page.waitForFunction(() => window.__dapurGen && window.PAWorked); await page.waitForTimeout(800);
  await page.click('#devBtn'); const n = await page.evaluate(() => document.querySelectorAll('#wkTry button').length);
  assert.equal(n, 14);
  for (let i = 0; i < n; i++) {
    if (i) await page.click('#devBtn');
    const label = await page.evaluate(i => { const b = document.querySelectorAll('#wkTry button')[i]; b.click(); return b.textContent; }, i);
    await page.waitForTimeout(900);
    assert.equal(await page.evaluate(() => document.getElementById('hint').textContent), 'Jom tengok cara', label);
    const arch = await page.evaluate(() => window.__dapurGen.current().arch);
    await page.evaluate(() => document.getElementById('hint').click());
    for (let s = 0; s < 40; s++) {
      if (await page.evaluate(() => !!document.querySelector('.stamp.show'))) break;
      await page.evaluate(() => { const v = window.__wkRight && window.__wkRight(); const x = [...document.querySelectorAll('.wk-t:not([disabled])')].find(b => b.dataset.v === v); x && x.click(); });
      await page.waitForTimeout(950);
    }
    assert.match(await page.evaluate(() => document.getElementById('stamp').textContent), /^SIAP!Cara Wira/, label);
    await page.evaluate(() => document.getElementById('check').click()); await page.waitForTimeout(500);
    assert.equal(await page.evaluate(() => window.__dapurGen.current().arch), arch, label + ': same kind next');
  }
  assert.deepEqual(errors, []); await context.close();
});

test('guided facts: a wrong pick on a sifir step of "Jom tengok cara" reaches the brain as a guided fact try', async () => {
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => localStorage.setItem('pa_dev_unlocked', '1'));
  const page = await context.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${base}/terma.html`);
  await page.evaluate(() => { window.__calls = []; window.PATelemetry = { response: (...a) => window.__calls.push(a) }; });
  await page.addScriptTag({ url: `${base}/js/minigame-telemetry-v1.js` });
  await page.evaluate(() => { const f = document.createElement('iframe'); f.id = 'mg'; f.style.cssText = 'width:390px;height:780px'; f.src = 'kedai-kek.html?pa_nonce=t1#d3-tambah'; document.body.appendChild(f); });
  const frame = await (await page.waitForSelector('#mg')).contentFrame();
  await frame.waitForFunction(() => window.__kekGen && window.PAWorked); await frame.waitForTimeout(800);
  await frame.click('#devBtn');
  await frame.evaluate(() => [...document.querySelectorAll('#wkTry button')].find(b => b.textContent === 'Tambah / tolak').click()); await frame.waitForTimeout(900);
  // Different denominators: the first step is "d × ? = D" (a sifir step); same: "a + b" (a basic fact).
  for (let t = 0; t < 20 && !(await frame.evaluate(() => { const w = window.__kekGen.current().wk; return w.terms[0][1] !== w.terms[1][1]; })); t++) {
    await frame.click('#devBtn'); await frame.evaluate(() => [...document.querySelectorAll('#wkTry button')].find(b => b.textContent === 'Tambah / tolak').click()); await frame.waitForTimeout(700);
  }
  await frame.evaluate(() => document.getElementById('hint').click()); await frame.waitForTimeout(400);
  const wrong = await frame.evaluate(() => { const v = window.__wkRight(); const x = [...document.querySelectorAll('.wk-t:not([disabled])')].find(b => b.dataset.v !== v); x.click(); return x.dataset.v; });
  await frame.waitForTimeout(300);
  await frame.evaluate(() => { const v = window.__wkRight(); [...document.querySelectorAll('.wk-t:not([disabled])')].find(b => b.dataset.v === v).click(); });
  await page.waitForTimeout(300);
  const calls = await page.evaluate(() => window.__calls.map(([skill, ok, tag, sec, hint, q, mode, value]) => ({ ok, hint, mode, value, prompt: q.prompt, facets: q.facets })));
  const g = calls.filter(c => c.facets && c.facets.guided);
  assert.equal(g.length, 1, JSON.stringify(calls));
  assert.equal(g[0].ok, false); assert.equal(g[0].mode, 'minigame-first-attempt'); assert.equal(g[0].value, wrong); assert.equal(g[0].hint, false);
  assert.match(g[0].prompt, /^\d+ [+−×÷] \d+$/); assert.ok(['add', 'sub', 'mul', 'div'].includes(g[0].facets.op));
  assert.deepEqual(errors, []); await context.close();
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

test('real app: a mixed-set finding gives a "Soalan bercampur" card that opens Gudang Harta choose rounds', async () => {
  const log = S.simulate('faris').log1;
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  await context.route('**/*', route => route.request().url().startsWith(base) && ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
  const page = await context.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base + '/index.html');
  await page.waitForFunction(() => window.PAFocusPractice && window.PATargets && window.PAReadingPairs && window.PAFocusMiniGamesLive, null, { timeout: 30000 });
  const card = await page.evaluate(log => {
    window.PACommercial = { requireFeature: () => true, canUse: () => true, authorizeMission: async () => true };
    window.PACloud = { state: {}, scheduleSave() {}, syncSaveNow() {} }; window.save = () => {};
    db = { schoolGrade: 4, name: 'Faris', hero: 'wira', level: 1, coins: 0, xp: 0, skills: {}, logs: [], coreFrontier: 1, completedMissions: {}, rewards: { pets: {}, auras: {}, badges: {} }, learnerReviewV1: { schema: 1, encounters: [] }, diagLog: log };
    sess = {}; initAll(); PAFocusPractice.open();
    const el = document.querySelector('.focusPickCard'); el.click();
    return { skill: el.dataset.skill, text: el.textContent.replace(/\s+/g, ' ') };
  }, log);
  assert.match(card.skill, /^D4\./);
  assert.match(card.text, /Soalan bercampur/);
  const frame = page.locator('#paFocusMiniGameOverlay iframe');
  const src = await frame.getAttribute('src');
  assert.equal(new URLSearchParams(src.split('?')[1].split('#')[0]).get('focus_target'), '{"kind":"choose"}');
  const first = await (await frame.elementHandle()).contentFrame();
  await first.waitForFunction(() => window.__gudangGen && window.__gudangGen.current(), null, { timeout: 15000 });
  assert.equal(await first.evaluate(() => window.__gudangGen.current().arch), 'target_choose_sentence');
  assert.deepEqual(errors, []); await context.close();
});

test('real app: a long-wording finding gives a "Baca soalan panjang" card that opens Gudang Harta story rounds', async () => {
  const log = S.simulate('zara').log1;
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  await context.route('**/*', route => route.request().url().startsWith(base) && ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
  const page = await context.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base + '/index.html');
  await page.waitForFunction(() => window.PAFocusPractice && window.PATargets && window.PAReadingPairs && window.PAFocusMiniGamesLive, null, { timeout: 30000 });
  const card = await page.evaluate(log => {
    window.PACommercial = { requireFeature: () => true, canUse: () => true, authorizeMission: async () => true };
    window.PACloud = { state: {}, scheduleSave() {}, syncSaveNow() {} }; window.save = () => {};
    db = { schoolGrade: 4, name: 'Zara', hero: 'wira', level: 1, coins: 0, xp: 0, skills: {}, logs: [], coreFrontier: 1, completedMissions: {}, rewards: { pets: {}, auras: {}, badges: {} }, learnerReviewV1: { schema: 1, encounters: [] }, diagLog: log };
    sess = {}; initAll(); PAFocusPractice.open();
    const el = document.querySelector('.focusPickCard'); el.click();
    return { skill: el.dataset.skill, text: el.textContent.replace(/\s+/g, ' ') };
  }, log);
  assert.equal(card.skill, 'D4.SUB');
  assert.match(card.text, /Baca soalan panjang/);
  const frame = page.locator('#paFocusMiniGameOverlay iframe');
  const src = await frame.getAttribute('src');
  assert.equal(new URLSearchParams(src.split('?')[1].split('#')[0]).get('focus_target'), '{"kind":"reading"}');
  assert.equal(src.split('#')[1], 'd4-tolak');
  const first = await (await frame.elementHandle()).contentFrame();
  await first.waitForFunction(() => document.querySelector('.story'), null, { timeout: 15000 });
  assert.match(await first.evaluate(() => document.querySelector('.story').textContent), /beza|bezanya/);
  assert.deepEqual(errors, []); await context.close();
});
