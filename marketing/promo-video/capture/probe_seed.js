// Cari benih Math.random yang memberi soalan tertentu awal dalam Demo (tanpa tangkap bingkai).
// node probe_seed.js <darjah> <seed0> <seed1> [regex kind]
const { chromium } = require('playwright');
const path = require('path');
const [G, S0, S1] = [2, 3, 4].map(i => parseInt(process.argv[i], 10));
const RX = new RegExp(process.argv[5] || 'Tolak|Berkurang|Baki', 'i');
const SEED_JS = s => `(()=>{if(window!==window.top)return;let a=${s}>>>0;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};})();`;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (let seed = S0; seed <= S1; seed++) {
    const ctx = await b.newContext({ viewport: { width: 412, height: 853 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1:8765/') ? r.continue() : r.abort());
    await ctx.addInitScript({ content: SEED_JS(seed) });
    await ctx.addInitScript({ path: path.join(__dirname, 'vtime-shim.js') });
    const p = await ctx.newPage();
    const adv = ms => p.evaluate(dt => window.__advance(dt), ms);
    await p.goto('http://127.0.0.1:8765/index.html?pa_tracking_test=1', { waitUntil: 'load' });
    for (let i = 0; i < 30; i++) { await adv(100); await p.waitForTimeout(30); }
    await p.frameLocator('#paApprovedLanding').locator('.btn.demo').first().click({ force: true });
    for (let i = 0; i < 10; i++) await adv(100);
    await p.click(`[data-demo-grade="${G}"]`, { force: true });
    await p.click('#paDemoStart', { force: true });
    const kinds = [];
    let lastAsked = -1;
    for (let k = 0; k < 400 && kinds.length < 8; k++) {
      await adv(100);
      const s = await p.evaluate(() => { const r = window.PASegelDemo && window.PASegelDemo.state(); if (!r || !r.q || r.locked) return null; const ready = !!document.querySelector('#segelAnswers button.ans, .paTypedInput'); return ready ? { asked: r.asked, kind: r.q.kind || '', ans: String(r.q.answer), typed: !!document.querySelector('.paTypedInput') } : null; });
      if (!s || s.asked === lastAsked) continue;
      lastAsked = s.asked;
      kinds.push(`${s.asked + 1}:${s.kind}${s.typed ? '[T]' : ''}`);
      // jawab betul supaya bergerak ke soalan seterusnya
      await p.evaluate(ans => {
        const inp = document.querySelector('.paTypedInput');
        if (inp) { inp.value = ans; inp.closest('form').requestSubmit(); return; }
        const b = [...document.querySelectorAll('#segelAnswers button.ans')].find(x => x.innerText.trim() === ans);
        if (b) b.click(); else { const r = window.PASegelDemo.state(); window.PASegelDemo.submitInteraction({ v: r.q.answer, tag: 'correct', label: ans }, document.createElement('button'), r.q); }
      }, s.ans);
    }
    const hit = kinds.findIndex(k => RX.test(k));
    console.log(`seed ${seed} ${hit >= 0 ? 'HIT@' + (hit + 1) : '-'} | ${kinds.join(' | ')}`);
    await ctx.close();
  }
  await b.close();
})();
