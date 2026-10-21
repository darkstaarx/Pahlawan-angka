// Senaraikan soalan cerita Gudang Harta yang ada "Jom tengok cara" bagi satu mod (#d2-tolak, dll.).
const { chromium } = require('playwright');
const hash = process.argv[2] || 'd2-tolak';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 412, height: 853 }, serviceWorkers: 'block' });
  await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1:8765/') ? r.continue() : r.abort());
  await ctx.addInitScript(() => localStorage.setItem('pa_dev_unlocked', '1'));
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:8765/gudang-harta.html#${hash}`);
  await p.waitForFunction(() => window.__gudangGen, null, { timeout: 30000 });
  const r = await p.evaluate(() => {
    const out = [];
    for (let i = 0; i < 400 && out.length < 12; i++) {
      const q = window.__gudangGen.showNormal(i % 6, 0);
      if (q.kind === 'pad' && q.form && window.PAWorked.parse(q)) out.push({ i, card: !!q.card, ans: q.form.fields[0].v, a: String(q.a || '').slice(0, 60), arch: q.arch, steps: (window.PAWorked.build(...Object.values(window.PAWorked.parse(q)), { story: !q.card }) || { steps: [] }).steps.length });
    }
    return out;
  });
  console.log(JSON.stringify(r, null, 0));
  await b.close();
})();
