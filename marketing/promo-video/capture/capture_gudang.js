// Rakam mini game Gudang Harta (cerita tolak, Tahun 4) bingkai demi bingkai pada 1080×2236:
// 3 kali salah → "Jom tengok cara" → setiap langkah Cara Wira → SIAP! → Cuba soalan serupa.
// node capture_gudang.js <outdir> [hash=d4-tolak] [arch] [seed=5] [pace=1.25]   (pace: saat antara langkah Wira)   (arch: hadkan kepada archetype tertentu, contoh separate)
// Resipi ikut audit/minigame-targets-browser.test.js (main 3.87.8).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const out = process.argv[2], HASH = process.argv[3] || 'd4-tolak', ARCH = process.argv[4] || '', SEED = parseInt(process.argv[5] || '5', 10), PACE = parseFloat(process.argv[6] || '1.25');
const SEED_JS = s => `(()=>{if(window!==window.top)return;let a=${s}>>>0;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};})();`;

const FPS = 30, DT = 1000 / FPS, DPR = 1080 / 412;
fs.mkdirSync(out, { recursive: true });
const log = { events: [], frames: 0 };
const ev = (type, extra = {}) => { const e = { type, frame: log.frames, t: +(log.frames / FPS).toFixed(3), ...extra }; log.events.push(e); console.log(JSON.stringify(e)); };

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--hide-scrollbars'] });
  const ctx = await b.newContext({ viewport: { width: 412, height: 853 }, deviceScaleFactor: DPR, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1:8765/') ? r.continue() : r.abort());
  await ctx.addInitScript(() => localStorage.setItem('pa_dev_unlocked', '1'));
  await ctx.addInitScript({ content: SEED_JS(SEED) });
  await ctx.addInitScript({ path: path.join(__dirname, 'vtime-shim.js') });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('pageerror', e.message.slice(0, 200)));
  const cdp = await ctx.newCDPSession(p);
  const adv = () => p.evaluate(dt => window.__advance(dt), DT);
  async function shot() {
    const r = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 92, clip: { x: 0, y: 0, width: 412, height: 853, scale: 1080 / 412 } });
    fs.writeFileSync(path.join(out, `f_${String(log.frames).padStart(5, '0')}.jpg`), Buffer.from(r.data, 'base64'));
    log.frames++;
  }
  async function step(n = 1) { for (let i = 0; i < n; i++) { await adv(); await shot(); } }
  const idle = sec => step(Math.round(sec * FPS));
  async function fast(sec) { for (let i = 0; i < Math.round(sec * FPS); i++) await adv(); }
  async function tap(sel, label, pick) {
    const h = pick ? await pick() : await p.$(sel);
    if (!h) { console.log('missing', sel); return false; }
    const bb = await h.boundingBox();
    const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
    ev('tap', { label, x: Math.round(x * DPR), y: Math.round(y * DPR) });
    await p.mouse.click(x, y);
    return true;
  }
  const key = k => tap(`button.tl[data-k="${k}"]`, 'key-' + k);

  await p.goto(`http://127.0.0.1:8765/gudang-harta.html#${HASH}`, { waitUntil: 'load' });
  for (let i = 0; i < 80; i++) { await fast(0.1); await p.waitForTimeout(40); if (await p.evaluate(() => !!window.__gudangGen)) break; }
  // pilih soalan cerita (tanpa kad) yang ada Cara Wira, seperti ujian
  const r0 = await p.evaluate(arch => {
    for (let i = 0; i < 800; i++) {
      const q = window.__gudangGen.showNormal(i % 6, 0);
      if (!(q.kind === 'pad' && q.form && !q.card)) continue;
      const w = window.PAWorked.parse(q);
      if (!w || (arch && q.arch !== arch)) continue;
      if (arch && !(w.op === 'sub' ? w.a % 10 < w.b % 10 : w.op === 'add' && w.a % 10 + w.b % 10 >= 10)) continue;   // ada pinjam / bawa di tempat sa
      return { mode: q.mode, arch: q.arch, ans: q.form.fields[0].v, text: (q.a || q.q || '').toString().slice(0, 140) };
    }
    return null;
  }, ARCH);
  ev('round', r0 || {});
  for (let i = 0; i < 12; i++) { await fast(0.1); await p.waitForTimeout(40); }
  await shot();
  await idle(1.6);
  for (let i = 0; i < 3; i++) {
    const wrong = String(r0.ans + 10 * (i + 1));
    for (const ch of wrong) { await key(ch); await step(5); }
    await idle(0.35);
    await tap('#check', 'semak');
    ev('wrong', { n: i + 1, value: wrong });
    await idle(i < 2 ? 1.7 : 2.0);
    if (i < 2) for (let k = 0; k < wrong.length; k++) { await key('⌫'); await step(2); }
    await idle(0.3);
  }
  ev('hint-ready', { text: await p.evaluate(() => document.getElementById('hint').textContent) });
  await idle(0.6);
  await tap('#hint', 'jom-tengok-cara');
  ev('worked');
  await idle(Math.max(1.8, PACE));
  for (let n = 0; n < 24; n++) {
    const right = await p.evaluate(() => window.__wkRight && window.__wkRight());
    const open = await p.evaluate(() => document.querySelectorAll('.wk-t:not([disabled])').length);
    if (!open || right == null) break;
    const say = await p.evaluate(() => (document.querySelector('.wk-say, .wk-q, #wkInline') || {}).textContent || '');
    ev('step', { n: n + 1, right: String(right), say: say.trim().slice(0, 100) });
    await tap(null, 'langkah', async () => {
      const hs = await p.$$('.wk-t:not([disabled])');
      for (const h of hs) if (await h.evaluate((b, v) => b.dataset.v === String(v), right)) return h;
      return null;
    });
    await idle(PACE);
  }
  ev('siap', await p.evaluate(() => ({ stamp: (document.querySelector('.stamp') || {}).textContent || '', check: document.getElementById('check').textContent })));
  await idle(Math.max(2.2, PACE));
  await tap('#check', 'cuba-soalan-serupa');
  await idle(2.6);
  ev('end');
  log.sfx = await p.evaluate(() => window.__sfx);
  fs.writeFileSync(path.join(out, 'log.json'), JSON.stringify(log, null, 1));
  await b.close();
})();
