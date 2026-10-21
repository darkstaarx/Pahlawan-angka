// Rakam battle Demo (Darjah 2) di mana soalan ke-2 ialah cerita tolak (D2.1.8 "Cerita Berkurang"):
// S1 betul → S2 salah (petunjuk) → S2 salah lagi (petunjuk, soalan beralih).
// Benih Math.random tetap supaya rakaman boleh diulang. node capture_salah.js <outdir> <seed> [probe]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const out = process.argv[2], SEED = parseInt(process.argv[3] || '1', 10), PROBE = process.argv[4] === 'probe';
const FPS = 30, DT = 1000 / FPS, DPR = PROBE ? 1 : 1080 / 412;
const SEED_JS = s => `(()=>{if(window!==window.top)return;let a=${s}>>>0;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};})();`;
if (!PROBE) fs.mkdirSync(out, { recursive: true });
const log = { events: [], frames: 0, seed: SEED };
const ev = (type, extra = {}) => { const e = { type, frame: log.frames, t: +(log.frames / FPS).toFixed(3), ...extra }; log.events.push(e); console.log(JSON.stringify(e)); };

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--hide-scrollbars'] });
  const ctx = await b.newContext({ viewport: { width: 412, height: 853 }, deviceScaleFactor: DPR, isMobile: true, hasTouch: true });
  await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1:8765/') ? r.continue() : r.abort());
  await ctx.addInitScript({ content: SEED_JS(SEED) });
  await ctx.addInitScript({ path: path.join(__dirname, 'vtime-shim.js') });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('pageerror', e.message.slice(0, 200)));
  const cdp = await ctx.newCDPSession(p);
  const adv = () => p.evaluate(dt => window.__advance(dt), DT);
  async function shot() {
    if (PROBE) { log.frames++; return; }
    const r = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 92, clip: { x: 0, y: 0, width: 412, height: 853, scale: 1080 / 412 } });
    fs.writeFileSync(path.join(out, `f_${String(log.frames).padStart(5, '0')}.jpg`), Buffer.from(r.data, 'base64'));
    log.frames++;
  }
  async function step(n = 1) { for (let i = 0; i < n; i++) { await adv(); await shot(); } }
  const idle = sec => step(Math.round(sec * FPS));
  async function fast(sec) { for (let i = 0; i < Math.round(sec * FPS); i++) await adv(); }
  async function tapH(h, label) {
    const bb = await h.boundingBox();
    const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
    ev('tap', { label, x: Math.round(x * 1080 / 412), y: Math.round(y * 1080 / 412) });
    await p.mouse.click(x, y);
  }
  const st = () => p.evaluate(() => { const r = window.PASegelDemo && window.PASegelDemo.state(); return r && r.q ? { asked: r.asked, locked: !!r.locked, answer: String(r.q.answer), kind: r.q.kind || '' } : null; });
  const ready = () => p.evaluate(() => !!document.querySelector('#segelAnswers button.ans:not([disabled]), .paTypedInput'));
  async function buttons() {
    const hs = await p.$$('#segelAnswers button.ans');
    return Promise.all(hs.map(async h => ({ h, label: (await h.innerText()).trim(), off: await h.evaluate(b => b.disabled) })));
  }

  await p.goto('http://127.0.0.1:8765/index.html?pa_tracking_test=1', { waitUntil: 'load' });
  for (let i = 0; i < 40; i++) { await fast(0.1); await p.waitForTimeout(40); }
  await p.frameLocator('#paApprovedLanding').locator('.btn.demo').first().click({ force: true });
  await fast(1.2);
  await p.click('[data-demo-grade="2"]', { force: true });
  await fast(0.4);
  await p.click('#paDemoStart', { force: true });
  for (let i = 0; i < FPS * 12; i++) { await adv(); const s = await st(); if (s && !s.locked && await ready()) break; }
  // soalan ke-2 = cerita tolak (topik demo Darjah 2 yang sama, hanya urutan diubah)
  await p.evaluate(() => { const r = window.PASegelDemo.state(); r.pool[1 % r.pool.length] = 'D2.1.8'; });
  let s = await st();
  ev('q1', s);
  await shot();
  await idle(1.6);
  let bs = await buttons();
  await tapH(bs.find(x => x.label === s.answer).h, 'betul');
  for (let i = 0; i < FPS * 8; i++) { await step(); const n = await st(); if (n && n.asked >= 1 && !n.locked && await ready()) break; }
  s = await st();
  ev('q2', s);
  if (PROBE) { console.log(`SEED ${SEED} Q2 ${s.kind}`); await b.close(); return; }
  await idle(2.2);
  bs = await buttons();
  // salah 1: tambah, bukan tolak (kesilapan "operation" sebenar dalam bank)
  const wrong1 = bs.find(x => x.label !== s.answer && Number(x.label) > Number(s.answer) * 1.5) || bs.find(x => x.label !== s.answer);
  await tapH(wrong1.h, 'salah-1');
  ev('wrong1', { value: wrong1.label });
  await idle(3.0);
  bs = await buttons();
  const wrong2 = bs.find(x => !x.off && x.label !== s.answer && x.label !== wrong1.label);
  await tapH(wrong2.h, 'salah-2');
  ev('wrong2', { value: wrong2.label, feedback: await p.evaluate(() => document.getElementById('segelFeedback').textContent) });
  await idle(3.2);
  ev('end', await st());
  log.sfx = await p.evaluate(() => window.__sfx);
  fs.writeFileSync(path.join(out, 'log.json'), JSON.stringify(log, null, 1));
  await b.close();
})();
