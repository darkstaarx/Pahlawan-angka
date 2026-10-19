/* Full production shell smoke against a local static HTTP server. */
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.ico': 'image/x-icon' };
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const misses = [], failed = [], consoleErrors = [], serviceWorkerLogs = [];
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const target = path.resolve(ROOT, url.pathname === '/' ? './index.html' : `.${decodeURIComponent(url.pathname)}`);
    if (!target.startsWith(ROOT) || !fs.existsSync(target) || fs.statSync(target).isDirectory()) {
      misses.push(url.pathname);
      res.statusCode = 404;
      return res.end('not found');
    }
    res.setHeader('Content-Type', MIME[path.extname(target).toLowerCase()] || 'application/octet-stream');
    fs.createReadStream(target).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PA_BROWSER_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' });
  const context = await browser.newContext();
  context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  context.on('serviceworker', worker => worker.on('console', message => serviceWorkerLogs.push(`${message.type()}: ${message.text()}`)));
  const page = await context.newPage();
  page.on('requestfailed', request => failed.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  try {
    await page.goto(`${origin}/index.html`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // The production page registers on window.load; its optional remote resources can delay
    // that event, so explicitly register the same worker to keep this smoke deterministic.
    await page.evaluate(() => navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' }));
    let lastState = null;
    let registration;
    for (let elapsed = 0; elapsed < 60000; elapsed += 1000) {
      registration = await page.evaluate(async () => {
        const all = await navigator.serviceWorker.getRegistrations();
        const r = all[0];
        return r ? { active: r.active?.state || null, installing: r.installing?.state || null, waiting: r.waiting?.state || null, controller: !!navigator.serviceWorker.controller, scriptURL: r.active?.scriptURL || r.installing?.scriptURL || null } : null;
      });
      if (JSON.stringify(registration) !== JSON.stringify(lastState)) { console.log('registration', JSON.stringify(registration)); lastState = registration; }
      if (registration?.active === 'activated') break;
      await sleep(1000);
    }
    assert.equal(registration?.active, 'activated', `service worker did not activate within 60s: ${JSON.stringify({ registration, misses: misses.slice(0, 20), failed: failed.slice(0, 20), consoleErrors: consoleErrors.slice(0, 20), serviceWorkerLogs: serviceWorkerLogs.slice(0, 20) })}`);
    await page.waitForTimeout(2000);
    const firstScreenImages = await page.evaluate(() => Array.from(document.images).slice(0, 30).map(image => ({ src: image.currentSrc || image.src, width: image.naturalWidth, height: image.naturalHeight })).filter(image => image.width > 0));
    const cacheState = await page.evaluate(async () => Promise.all((await caches.keys()).map(async name => ({ name, count: (await (await caches.open(name)).keys()).length }))));
    console.log(JSON.stringify({ registration, firstScreenImages, cacheState, missingCount: misses.length, misses: misses.slice(0, 10), failed: failed.slice(0, 10), consoleErrors: consoleErrors.slice(0, 10), serviceWorkerLogs: serviceWorkerLogs.slice(0, 10) }, null, 2));
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    const offline = await page.evaluate(() => ({ controller: !!navigator.serviceWorker.controller, title: document.title, imageCount: Array.from(document.images).filter(image => image.naturalWidth > 0).length }));
    console.log('offline', JSON.stringify(offline));
    assert.equal(offline.controller, true, 'offline reload must remain service-worker controlled');
    assert.ok(offline.imageCount > 0, 'offline reload must decode at least one production image');
    const offlineHeroes = await page.evaluate(async () => {
      const sources = [...Object.values(HEROES).map(hero => hero.idle), ...Object.values(HEROES.bunga.fx)];
      for (const src of sources) { const image = new Image(); image.src = src; await image.decode(); }
      return { ids: Object.keys(HEROES), decoded: sources.length };
    });
    assert.deepEqual(offlineHeroes.ids, ['wira', 'bunga', 'sidma']);
    assert.equal(offlineHeroes.decoded, 10, 'canonical heroes and relocated Bunga effects must decode offline');
    console.log('offline heroes', JSON.stringify(offlineHeroes));
  } finally {
    await context.close();
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
