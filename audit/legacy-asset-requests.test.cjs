/* Full browser request audit for the welcome screen and guest Segel demo. */
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4' };
const forbidden = url => {
  const value = url.toLowerCase();
  return value.includes('sidma') || /\/assets\/enemies\/minions\/(askabus|syilinggit|pigiramid)(?:[./?]|$)/.test(value);
};

async function main() {
  const requests = [];
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    requests.push({ method: req.method, pathname, url: req.url });
    const target = path.resolve(ROOT, pathname === '/' ? './index.html' : `.${decodeURIComponent(pathname)}`);
    if (!target.startsWith(ROOT) || !fs.existsSync(target) || fs.statSync(target).isDirectory()) { res.statusCode = 404; return res.end('not found'); }
    res.setHeader('Content-Type', MIME[path.extname(target).toLowerCase()] || 'application/octet-stream');
    fs.createReadStream(target).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PA_BROWSER_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' });
  const context = await browser.newContext();
  context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const page = await context.newPage();
  try {
    await page.goto(`${origin}/index.html`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.evaluate(() => navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' }));
    let registration;
    for (let i = 0; i < 180; i++) {
      registration = await page.evaluate(async () => {
        const r = (await navigator.serviceWorker.getRegistrations())[0];
        return r ? { active: r.active?.state || null, installing: r.installing?.state || null, controller: !!navigator.serviceWorker.controller } : null;
      });
      if (registration?.active === 'activated') break;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    assert.equal(registration?.active, 'activated', `service worker did not activate: ${JSON.stringify(registration)}`);
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => navigator.serviceWorker.controller && window.PADemo && window.openSegelDemo, null, { timeout: 30000 });
    // Use the same guest entry surface as the welcome screen: choose grade, then start.
    await page.evaluate(() => window.PADemo.open());
    await page.locator('#paDemoStart').click();
    await page.waitForFunction(() => document.body.dataset.screen === 'segelDemo' || !document.getElementById('segelDemo')?.classList.contains('hidden'), null, { timeout: 30000 });
    await page.waitForTimeout(3000); // allow the live canvas animation and lazy demo assets to start.
    const state = await page.evaluate(() => {
      const run = window.PASegelDemo?.state?.();
      return { screen: document.body.dataset.screen, canvas: !!document.querySelector('#segelCanvas'), running: !!window.segelEntryMode?.(), controller: !!navigator.serviceWorker.controller, question: !!run?.q, questionTarget: run?.questionTarget ?? null, asked: run?.asked ?? null };
    });
    // A persisted Sidma profile must remain safe to open at the welcome route; it must not
    // cause archive-only hero assets to load before the user explicitly enters a legacy flow.
    const profilePage = await context.newPage();
    await profilePage.addInitScript(() => localStorage.setItem('pa_coach_v6_full', JSON.stringify({ name: 'Saved Sidma', schoolGrade: 2, hero: 'sidma', skills: {}, rewards: {}, logs: [] })));
    await profilePage.goto(`${origin}/index.html`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await profilePage.waitForTimeout(1500);
    await profilePage.close();
    const hits = requests.filter(request => forbidden(request.url));
    console.log(JSON.stringify({ registration, state, requestCount: requests.length, forbiddenRequests: hits }, null, 2));
    assert.equal(hits.length, 0, `legacy Sidma/minion requests detected: ${JSON.stringify(hits)}`);
    assert.equal(state.screen, 'segelDemo', 'guest Segel demo must open');
    assert.equal(state.canvas, true, 'guest Segel demo canvas must exist');
    assert.equal(state.running, true, 'guest Segel demo must have an active entry mode');
    assert.equal(state.question, true, 'guest Segel demo must start an actual question run');
  } finally {
    await context.close();
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
