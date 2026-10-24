// Rakam Portal Restu (js/rapid-lock-v1.js) dalam battle Demo pada 1080×2236, jam maya, benih rawak tetap:
// S1, S2 betul (GANGSA PECAH!) → S3, S4, S5 dijawab salah terlalu cepat (< 0.6 s, bawah had bacaan 1.8–3.2 s)
// → amaran Cikgu pada tekaan ke-2 → Portal Restu pada tekaan ke-3 → PIN Penjaga (titik sahaja) → SEMAKAN
// (3 soalan yang dijawab terlalu cepat) → "Teruskan main" → sambung hingga Jurus Penamat dan BERJAYA.
//
// Portal Restu sengaja tidak aktif dalam Demo tetamu ("Never in guest demo"). Rakaman ini memanggil UI sebenar
// modul itu (PARapidLock.warn / PARapidLock.lock) pada saat yang sama enjinnya akan memanggil dalam akaun sebenar,
// dengan 3 soalan sebenar yang baru dijawab laju dalam rakaman ini. PIN rakaman ialah PIN ujian; digit tidak pernah
// dipaparkan (input kata laluan + titik).
// node capture_restu.js <outdir> [seed=21] [darjah=2]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const out = process.argv[2], SEED = parseInt(process.argv[3] || '21', 10), GRADE = process.argv[4] || '2';
const FPS = 30, DT = 1000 / FPS, DPR = 1080 / 412;
const SEED_JS = s => `(()=>{if(window!==window.top)return;let a=${s}>>>0;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};})();`;
const PIN = '2580';
fs.mkdirSync(out, { recursive: true });
const log = { events: [], frames: 0, seed: SEED };
const ev = (type, extra = {}) => { const e = { type, frame: log.frames, t: +(log.frames / FPS).toFixed(3), ...extra }; log.events.push(e); console.log(JSON.stringify(e)); };

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--hide-scrollbars'] });
  const ctx = await b.newContext({ viewport: { width: 412, height: 853 }, deviceScaleFactor: DPR, isMobile: true, hasTouch: true });
  await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1:8765/') ? r.continue() : r.abort());
  await ctx.addInitScript({ content: SEED_JS(SEED) });
  await ctx.addInitScript({ path: path.join(__dirname, 'vtime-shim.js') });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('pageerror', e.message.slice(0, 200)));
  const cdp = await ctx.newCDPSession(p);
  const adv = () => p.evaluate(dt => window.__advance(dt), DT);
  async function shot() {
    const r = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 92, clip: { x: 0, y: 0, width: 412, height: 853, scale: DPR } });
    fs.writeFileSync(path.join(out, `f_${String(log.frames).padStart(5, '0')}.jpg`), Buffer.from(r.data, 'base64'));
    log.frames++;
  }
  async function step(n = 1) { for (let i = 0; i < n; i++) { await adv(); await shot(); } }
  const idle = sec => step(Math.round(sec * FPS));
  async function fast(sec) { for (let i = 0; i < Math.round(sec * FPS); i++) await adv(); }
  async function tapH(h, label) {
    const bb = await h.boundingBox();
    const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
    ev('tap', { label, x: Math.round(x * DPR), y: Math.round(y * DPR) });
    await p.mouse.click(x, y);
  }
  const st = () => p.evaluate(() => { const r = window.PASegelDemo && window.PASegelDemo.state(); return r && r.q ? { asked: r.asked, locked: !!r.locked, retry: !!r.retryOpen, answer: String(r.q.answer), kind: r.q.kind || '' } : null; });
  const ready = () => p.evaluate(() => !!document.querySelector('#segelAnswers button.ans:not([disabled]), .paTypedInput:not([disabled])'));
  const doneVisible = () => p.evaluate(() => { const d = document.getElementById('segelDone'); return !!d && !d.hidden && getComputedStyle(d).display !== 'none'; });
  const prompt = () => p.evaluate(() => ((document.querySelector('#segelQuestion .segelPrompt') || document.getElementById('segelQuestion') || {}).textContent || '').replace(/\s+/g, ' ').trim().slice(0, 140));
  async function buttons() {
    const hs = await p.$$('#segelAnswers button.ans');
    return Promise.all(hs.map(async h => ({ h, label: (await h.innerText()).trim(), off: await h.evaluate(x => x.disabled) })));
  }
  async function answerCorrect(s) {
    const typed = await p.$('.paTypedInput:not([disabled])');
    if (typed) {
      await tapH(typed, 'typed-input'); await idle(0.3);
      await p.evaluate(() => { const i = document.querySelector('.paTypedInput'); if (i) i.value = ''; });
      for (const ch of s.answer) { await p.keyboard.type(ch); await step(4); }
      await idle(0.3);
      await tapH(await p.$('.paTypedSubmit'), 'jawab');
      return 'typed';
    }
    const bs = (await buttons()).filter(x => !x.off);
    const hit = bs.find(x => x.label === s.answer);
    if (hit) { await tapH(hit.h, 'betul'); return 'button'; }
    const ok = await p.evaluate(() => { const r = window.PASegelDemo.state(); return window.PASegelDemo.submitInteraction({ v: r.q.answer, tag: 'correct', label: String(r.q.answer) }, document.querySelector('#segelAnswers button') || document.createElement('button'), r.q); });
    ev('interactive', { ok });
    return 'interactive';
  }
  async function answerRapidWrong(s) {
    const typed = await p.$('.paTypedInput:not([disabled])');
    let value = null;
    if (typed) {
      value = String((parseInt(s.answer, 10) || 1) + 3);
      await tapH(typed, 'typed-input');
      for (const ch of value) { await p.keyboard.type(ch); await step(1); }
      await tapH(await p.$('.paTypedSubmit'), 'jawab-laju');
      return value;
    }
    const bs = (await buttons()).filter(x => !x.off && x.label !== s.answer);
    if (!bs.length) return null;
    const w = bs[bs.length > 1 ? 1 : 0];
    await tapH(w.h, 'teka-laju');
    return w.label;
  }
  async function waitNext(prevAsked, maxSec = 20) {
    for (let i = 0; i < FPS * maxSec; i++) {
      await step();
      if (await doneVisible()) return 'done';
      const n = await st();
      if (n && n.asked !== prevAsked && !n.locked && await ready()) return n;
    }
    return null;
  }

  await p.goto('http://127.0.0.1:8765/index.html?pa_tracking_test=1', { waitUntil: 'load' });
  for (let i = 0; i < 40; i++) { await fast(0.1); await p.waitForTimeout(40); }
  // PIN penjaga ujian (tidak dipaparkan)
  await p.evaluate(pin => { window.pageLockParentPin = () => pin; }, PIN);
  await shot(); ev('start');
  await p.frameLocator('#paApprovedLanding').locator('.btn.demo').first().click({ force: true });
  await idle(1.2);
  await tapH(await p.$(`[data-demo-grade="${GRADE}"]`), `darjah-${GRADE}`);
  await idle(0.9);
  await tapH(await p.$('#paDemoStart'), 'masuk-battlefield');
  ev('entry');
  for (let i = 0; i < FPS * 14; i++) { await step(); const s = await st(); if (s && !s.locked && await ready()) break; }

  const PLAN_RAPID = 3;           // tekaan laju berturut-turut
  let rapid = [], qn = 0, s = await st();
  while (s && s !== 'done') {
    qn++;
    const wantRapid = qn >= 3 && rapid.length < PLAN_RAPID;
    ev('question', { n: qn, ...s, rapid: wantRapid });
    if (wantRapid) {
      const t0 = log.frames;
      await step(Math.round(0.45 * FPS));
      const text = await prompt();
      const value = await answerRapidWrong(s);
      if (value == null) {                               // soalan interaktif: jawab biasa, cuba tekaan pada soalan seterusnya
        await idle(1.4); await answerCorrect(s);
      } else {
        const sec = +((log.frames - t0) / FPS).toFixed(1);
        rapid.push({ prompt: text, answer: value, correct: s.answer, sec });
        ev('rapid', { n: rapid.length, value, sec });
        await step(3);
        if (rapid.length === 2) { await p.evaluate(() => window.PARapidLock.warn()); ev('warn'); }
        if (rapid.length === PLAN_RAPID) {
          await p.evaluate(items => window.PARapidLock.lock(items), rapid);
          ev('lock');
          for (let i = 0; i < FPS * 8; i++) { await step(); if (await p.evaluate(() => { const c = document.querySelector('.paRapidLock [data-step="child"]'); return !!c && !c.hidden; })) break; }
          ev('portal');
          await idle(3.2);
          await tapH(await p.$('#paRapidPin'), 'pin');
          await idle(0.5);
          for (const ch of PIN) { await p.keyboard.type(ch); await idle(0.38); }
          ev('pin-done');
          for (let i = 0; i < FPS * 3; i++) { await step(); if (await p.evaluate(() => { const r = document.querySelector('.paRapidLock [data-step="review"]'); return !!r && !r.hidden; })) break; }
          ev('semakan');
          await idle(5.5);
          await tapH(await p.$('.paRapidLock [data-act="resume"]'), 'teruskan-main');
          ev('resume');
          await idle(1.0);
        } else {
          await idle(rapid.length === 2 ? 3.2 : 2.2);
        }
        const r2 = await st();
        if (r2 && !r2.locked && await ready()) { await idle(0.6); await answerCorrect(r2); ev('retry-correct', { n: qn }); }
      }
    } else {
      await idle(1.7);
      const how = await answerCorrect(s);
      ev('answer', { n: qn, how, value: s.answer });
    }
    const nx = await waitNext(s.asked);
    if (nx === 'done') { ev('result'); await idle(4.6); break; }
    s = nx;
  }
  ev('end');
  log.rapid = rapid;
  log.sfx = await p.evaluate(() => window.__sfx);
  fs.writeFileSync(path.join(out, 'log.json'), JSON.stringify(log, null, 1));
  await b.close();
})();
