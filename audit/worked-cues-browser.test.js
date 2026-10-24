// "Jom tengok cara": the pupil sees where to look (owner, 2026-10-24). Each step pulses the slot the
// answer goes into (.wk-next, a "?" when empty) and the numbers it works on (.wk-src); a work-card line
// that holds its answer stays hidden behind a "?" ghost line; the cues go once the step is answered.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { loadPlaywright, browserPath } = require('./lib/browser');

const ROOT = path.join(__dirname, '..');
const TYPES = { '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp4': 'video/mp4' };
let server, base, browser;

test.before(async () => {
  server = http.createServer((req, res) => {
    const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = 'http://127.0.0.1:' + server.address().port;
  browser = await loadPlaywright().chromium.launch({ executablePath: browserPath() });
});
test.after(async () => { await browser?.close(); server?.close(); });

async function open(page, game, hash, label) {
  await page.goto(`${base}/${game}.html#${hash}`); await page.waitForTimeout(1200);
  await page.evaluate(() => document.getElementById('devBtn').click()); await page.waitForTimeout(200);
  const used = await page.evaluate(l => { const all = [...document.querySelectorAll('#wkTry button')]; const b = l ? all.find(x => x.textContent === l) : all[0]; b.click(); return b.textContent; }, label);
  await page.waitForTimeout(900);
  await page.evaluate(() => document.getElementById('hint').click()); await page.waitForTimeout(800);
  return used;
}
const state = page => page.evaluate(() => {
  const s = window.__wkStep(); const say = document.querySelector('.wk-say');
  return { say: say.textContent, qm: say.querySelectorAll('.wk-qm').length, next: document.querySelectorAll('.wk-next').length,
    src: [...document.querySelectorAll('.wk-src')].map(c => c.textContent.replace(/\s+/g, '')), ghost: document.querySelectorAll('.wk-ghost').length, kind: s && s.kind };
});
const answer = page => page.evaluate(() => { const v = window.__wkRight(); const x = [...document.querySelectorAll('.wk-t')].find(b => b.dataset.v === v); x.click(); });

test('Kedai Kek "Pecahan setara": a × k glows a and × k, the empty slot pulses, cues go after the answer', async () => {
  const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => localStorage.setItem('pa_dev_unlocked', '1'));
  const page = await ctx.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
  await open(page, 'kedai-kek', 'd3', 'Pecahan setara');
  let st = await state(page);
  assert.equal(st.kind, 'show'); assert.equal(st.next, 1, 'the × k tag pulses before it is shown');
  await page.evaluate(() => document.querySelector('.wk-t').click()); await page.waitForTimeout(900);
  st = await state(page);
  const m = /^(\d+) × (\d+) = \?$/.exec(st.say);
  assert.ok(m, st.say);
  assert.equal(st.qm, 1, 'the "?" in Wira\'s line is the pulsing blank');
  assert.equal(st.next, 1, 'one slot pulses');
  assert.deepEqual(st.src, [m[1], '×' + m[2]], 'the numbers of the step glow');
  await answer(page); await page.waitForTimeout(200);
  st = await state(page);
  assert.equal(st.next + st.src.length, 0, 'cues go once answered');
  assert.deepEqual(errors, []); await ctx.close();
});

test('Pos Peninjau work card: the answer line stays hidden behind a pulsing "?" line, "Jadi jawapannya?" is not a blank', async () => {
  const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => localStorage.setItem('pa_dev_unlocked', '1'));
  const page = await ctx.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
  await open(page, 'pos-peninjau', 'd4', null);
  let ghosts = 0, steps = 0;
  for (let i = 0; i < 12 && !(await page.evaluate(() => !!document.querySelector('.stamp.show'))); i++) {
    const st = await state(page);
    if (st.kind === 'pick' && st.ghost) {
      ghosts++;
      const leak = await page.evaluate(() => { const r = String(window.__wkRight()); return [...document.querySelectorAll('.wk-list .wk-frow:not(.wk-hide):not(.wk-ghost)')].some(x => x.textContent.includes('= ' + r)); });
      assert.equal(leak, false, 'no visible line gives the answer');
    }
    if (/jawapannya\?$/.test(st.say)) assert.equal(st.qm, 0, 'a question mark at the end of a sentence stays plain');
    await answer(page); steps++; await page.waitForTimeout(250);
    assert.equal(await page.evaluate(() => document.querySelectorAll('.wk-ghost').length), 0, 'the ghost line goes once answered');
    await page.waitForTimeout(700);
  }
  assert.ok(steps >= 1 && ghosts >= 1, `steps ${steps}, ghost lines ${ghosts}`);
  assert.deepEqual(errors, []); await ctx.close();
});

test('Dapur Ramuan: the numbers of "a ÷ b" glow in the data table, with no slot on the board the choices pulse, all go after the answer', async () => {
  const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => localStorage.setItem('pa_dev_unlocked', '1'));
  const page = await ctx.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
  await open(page, 'dapur-ramuan', 'd6', 'Kadaran (darab)');
  let found = false;
  for (let i = 0; i < 6 && !found; i++) {
    const s = await page.evaluate(() => window.__wkStep());
    if (!s) break;
    if (s.fact && s.fact.op === 'div') {
      const look = await page.evaluate(() => [...document.querySelectorAll('.wk-look,.wk-lookt,.wk-src')].map(c => c.textContent.replace(/\s+/g, '')));
      assert.ok(look.includes(String(s.fact.a)) && look.includes(String(s.fact.b)), `${s.say} → ${look}`);
      assert.equal(await page.evaluate(() => !!document.querySelector('.wk-say .wk-qm')), true);
      found = true;
      await answer(page); await page.waitForTimeout(150);
      assert.equal(await page.evaluate(() => document.querySelectorAll('.wk-look,.wk-lookt,.wk-pickhere').length), 0, 'cues go once answered');
      break;
    }
    await answer(page); await page.waitForTimeout(1100);
  }
  assert.ok(found, 'a division step was shown');
  assert.deepEqual(errors, []); await ctx.close();
});

test('Lombong Permata hundred grid: "Berapa baris penuh?" outlines the full rows and the choices pulse', async () => {
  const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => localStorage.setItem('pa_dev_unlocked', '1'));
  const page = await ctx.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
  await open(page, 'lombong-permata', 'd5', 'Petak seratus');
  const st = await page.evaluate(() => ({ s: window.__wkStep(), n: document.querySelectorAll('.wk-g.on').length, src: document.querySelectorAll('.wk-g.wk-src').length, pick: !!document.querySelector('.wk-pickhere') }));
  assert.equal(st.s.look, 'full');
  assert.equal(st.src, Math.floor(st.n / 10) * 10, 'every square of the full rows, nothing else');
  assert.ok(st.pick, 'the choices pulse');
  assert.deepEqual(errors, []); await ctx.close();
});

test('Focus mode: the scene with Wira is hidden and only the answer place moves (Gerai Wirayung receipt)', async () => {
  const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => localStorage.setItem('pa_dev_unlocked', '1'));
  const page = await ctx.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
  await open(page, 'gerai-wirayung', 'd5', 'Diskaun %');
  await page.waitForTimeout(800);
  const st = await page.evaluate(() => {
    const scene = document.querySelector('.scene');
    const moving = document.getAnimations().filter(a => a.playState === 'running' && a.effect && a.effect.getComputedTiming().iterations === Infinity)
      .map(a => a.effect.target).filter(t => t && t.closest && t.closest('.panel,.actions,.tiles') && t.getClientRects().length);
    const kinds = new Set(moving.map(t => t.classList.contains('wk-next') ? 'slot' : t.closest('.wk-pickhere') ? 'choices' : t.className));
    const actions = document.querySelector('.actions').getBoundingClientRect(), panel = document.querySelector('.wk-walk,.panel:not([hidden])').getBoundingClientRect();
    return { sceneShown: !!scene && scene.getClientRects().length > 0, kinds: [...kinds], overlap: panel.bottom > actions.top + 1 };
  });
  assert.equal(st.sceneShown, false, 'the scene with Wira is out of the way');
  assert.ok(st.kinds.length <= 1 && st.kinds.every(k => k === 'slot' || k === 'choices'), 'one place moves: ' + st.kinds.join(' | '));
  assert.equal(st.overlap, false, 'the panel stays above the buttons');
  assert.deepEqual(errors, []); await ctx.close();
});

test('Gerai Wirayung: one item to pay ("Jumlah ?"), "Jom tengok cara" gives a Faham card, not a stuck screen', async () => {
  const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
  let found = false;
  for (let t = 0; t < 15 && !found; t++) {
    await page.goto(`${base}/gerai-wirayung.html#d2`); await page.waitForFunction(() => window.__geraiWk); await page.waitForTimeout(600);
    const m = await page.evaluate(() => { const m = __geraiWk.current(); return { mode: m.mode, items: m.items, qty: m.qty }; });
    if (m.mode !== 'bayar' || m.items.length !== 1 || m.qty > 1) continue;
    found = true;
    await page.evaluate(id => document.querySelector(`#stationShelf [data-id="${id}"]`).click(), m.items[0]);
    await page.waitForTimeout(300); await page.click('#go'); await page.waitForTimeout(2200);
    await page.evaluate(() => __geraiWk.start()); await page.waitForTimeout(400);
    assert.match(await page.evaluate(() => document.getElementById('wkSay').textContent), /^Jumlah /);
    await page.click('#wkTiles .wk-go'); await page.waitForTimeout(1800);
    const st = await page.evaluate(() => ({ scene: getComputedStyle(document.querySelector('.scene')).display, purse: document.getElementById('purse').getClientRects().length > 0, go: document.getElementById('go').disabled }));
    assert.deepEqual(st, { scene: 'block', purse: true, go: false }, 'back to the counter with the coins');
  }
  assert.ok(found, 'a one-item round came up');
  assert.deepEqual(errors, []); await ctx.close();
});
