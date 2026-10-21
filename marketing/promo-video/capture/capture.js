// Rakam satu pusingan Demo (Darjah 2) bingkai demi bingkai pada 1080×2236 menggunakan jam maya.
// node capture.js <outdir> [maxQ=99] [wrongAt=3]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const out = process.argv[2];
const MAXQ = parseInt(process.argv[3] || '99', 10);
const WRONG_AT = parseInt(process.argv[4] || '3', 10);
const FPS = 30, DT = 1000 / FPS, DPR = 1080 / 412;
fs.mkdirSync(out, { recursive: true });
const log = { events: [], frames: 0 };
const ev = (type, extra = {}) => { const e = { type, frame: log.frames, t: +(log.frames / FPS).toFixed(3), ...extra }; log.events.push(e); console.log(JSON.stringify(e)); };

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--hide-scrollbars'] });
  const ctx = await b.newContext({ viewport: { width: 412, height: 853 }, deviceScaleFactor: DPR, isMobile: true, hasTouch: true });
  await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1:8765/') ? r.continue() : r.abort());
  await ctx.addInitScript({ path: path.join(__dirname, 'vtime-shim.js') });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('pageerror', e.message.slice(0, 200)));
  const cdp = await ctx.newCDPSession(p);

  const adv = () => p.evaluate(dt => window.__advance(dt), DT);
  async function shot() {
    const r = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 92, captureBeyondViewport: false });
    fs.writeFileSync(path.join(out, `f_${String(log.frames).padStart(5, '0')}.jpg`), Buffer.from(r.data, 'base64'));
    log.frames++;
  }
  async function step(n = 1) { for (let i = 0; i < n; i++) { await adv(); await shot(); } }
  const idle = sec => step(Math.round(sec * FPS));
  async function fast(sec) { for (let i = 0; i < Math.round(sec * FPS); i++) await adv(); }
  async function tapEl(handle, label) {
    const bb = await handle.boundingBox();
    if (!bb) return false;
    const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
    ev('tap', { label, x: Math.round(x * DPR), y: Math.round(y * DPR) });
    await p.mouse.click(x, y);
    return true;
  }
  const st = () => p.evaluate(() => {
    const r = window.PASegelDemo && window.PASegelDemo.state();
    if (!r || !r.q) return null;
    return { asked: r.asked, target: r.questionTarget, locked: !!r.locked, retry: !!r.retryOpen, answer: String(r.q.answer), kind: r.q.kind || '', text: (r.q.text || r.q.question || '').replace(/<[^>]+>/g, ' ').slice(0, 120), id: r.q.id || r.q.skill || '' };
  });
  const doneVisible = () => p.evaluate(() => { const d = document.getElementById('segelDone'); return !!d && !d.hidden && getComputedStyle(d).display !== 'none'; });

  await p.goto('http://127.0.0.1:8765/index.html?pa_tracking_test=1', { waitUntil: 'load' });
  for (let i = 0; i < 40; i++) { await fast(0.1); await p.waitForTimeout(60); }   // biar aset dimuat

  // Pilih Darjah (overlay demo)
  await shot(); ev('start');
  await p.frameLocator('#paApprovedLanding').locator('.btn.demo').first().click({ force: true });
  ev('open-demo');
  await idle(1.4);
  await tapEl(await p.$('[data-demo-grade="2"]'), 'darjah-2');
  await idle(1.0);
  await tapEl(await p.$('#paDemoStart'), 'masuk-battlefield');
  ev('entry');
  // sinematik portal (video mungkin tidak dimainkan dalam Chromium tanpa H.264) → tunggu soalan pertama
  const ready = () => p.evaluate(() => !!document.querySelector('#segelAnswers button.ans, .paTypedInput'));
  for (let i = 0; i < FPS * 12; i++) { await step(); const s = await st(); if (s && !s.locked && await ready()) break; }
  let s = await st();
  ev('battle', s || {});

  let qn = 0;
  while (s && qn < MAXQ) {
    qn++;
    ev('question', { n: qn, ...s });
    await idle(1.8);
    const typed = await p.$('.paTypedInput');
    if (typed) {
      await tapEl(typed, 'typed-input');
      await idle(0.3);
      for (const ch of s.answer) { await p.keyboard.type(ch); await step(4); }
      await idle(0.3);
      await tapEl(await p.$('.paTypedSubmit'), 'jawab');
      ev('answer', { n: qn, typed: true, value: s.answer });
    } else {
      const btns = await p.$$('#segelAnswers button.ans');
      const labels = await Promise.all(btns.map(bt => bt.innerText().then(x => x.trim())));
      const ci = labels.indexOf(s.answer);
      if (btns.length && ci >= 0) {
        if (qn === WRONG_AT) {
          const wi = labels.findIndex((l, i) => i !== ci);
          await tapEl(btns[wi], 'salah');
          ev('answer', { n: qn, correct: false, value: labels[wi] });
          await idle(2.6);
          const btns2 = await p.$$('#segelAnswers button.ans');
          const labels2 = await Promise.all(btns2.map(bt => bt.innerText().then(x => x.trim())));
          await tapEl(btns2[labels2.indexOf(s.answer)], 'betul-selepas-petunjuk');
          ev('answer', { n: qn, correct: true, retry: true, value: s.answer });
        } else {
          await tapEl(btns[ci], 'betul');
          ev('answer', { n: qn, correct: true, value: s.answer });
        }
      } else {
        // soalan interaktif: hantar jawapan betul melalui API demo
        const ok = await p.evaluate(() => { const r = window.PASegelDemo.state(); return window.PASegelDemo.submitInteraction({ v: r.q.answer, tag: 'correct', label: String(r.q.answer) }, document.querySelector('#segelAnswers button') || document.createElement('button'), r.q); });
        ev('answer', { n: qn, interactive: true, ok });
      }
    }
    // tunggu soalan seterusnya atau skrin keputusan
    let next = null, done = false;
    for (let i = 0; i < FPS * 20; i++) {
      await step();
      done = await doneVisible();
      if (done) break;
      next = await st();
      if (next && next.asked !== s.asked && !next.locked && await ready()) break;
    }
    if (done) { ev('result'); await idle(4.5); break; }
    s = next;
  }
  ev('end');
  log.sfx = await p.evaluate(() => window.__sfx);
  fs.writeFileSync(path.join(out, 'log.json'), JSON.stringify(log, null, 1));
  await b.close();
})();
