/* Real Chromium verification for the service worker's persistent asset cache.
 * Run with the bundled runtime: NODE_PATH=<.../node_modules> node audit/persistent-assets-browser.test.cjs
 */
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PNG_A = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
const PNG_B = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAAgBAQDJ/pLvAAAAAElFTkSuQmCC', 'base64');
const HASH_A = require('node:crypto').createHash('sha256').update(PNG_A).digest('hex');
const HASH_B = require('node:crypto').createHash('sha256').update(PNG_B).digest('hex');

function serviceWorkerSource(release) {
  let source = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  source = source.replace(/const APP_SHELL=\[[\s\S]*?\];\r?\n\r?\nconst freshRequest/, `const APP_SHELL=['./index.html','./assets/test-image.png'];\n\nconst freshRequest`);
  source = source.replace(/importScripts\('\.\/js\/version\.js'\);/, `importScripts('./js/version.js');`);
  // The release-specific manifest is served by the test server.
  source = source.replace(/importScripts\('\.\/js\/asset-manifest\.js'\);/, `importScripts('./js/asset-manifest.js');`);
  return source.replace(/\/\/ App shell uses[^\n]*\n/, `// test release ${release}\n`);
}

async function main() {
  let release = 'A';
  let imageRequests = 0;
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname === '/sw.js') {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'no-store');
      return res.end(serviceWorkerSource(release));
    }
    if (pathname === '/js/version.js') {
      res.setHeader('Content-Type', 'application/javascript');
      return res.end(`globalThis.PA_APP_VERSION='browser-test-${release}';`);
    }
    if (pathname === '/js/asset-manifest.js') {
      res.setHeader('Content-Type', 'application/javascript');
      const hash = release === 'C' ? HASH_B : HASH_A;
      return res.end(`self.PA_ASSET_MANIFEST=Object.freeze({'./assets/test-image.png':'${hash}'});`);
    }
    if (pathname === '/assets/test-image.png') {
      imageRequests++;
      res.setHeader('Content-Type', 'image/png');
      return res.end(release === 'C' ? PNG_B : PNG_A);
    }
    if (pathname === '/index.html' || pathname === '/' || pathname === '/nested/index.html') {
      res.setHeader('Content-Type', 'text/html');
      const imageQuery = release === 'C' ? HASH_B : HASH_A;
      return res.end(`<!doctype html><meta charset=utf-8><img id=image src="/assets/test-image.png?v=${imageQuery}"><script>
        window.registration = navigator.serviceWorker.register('/sw.js?release=${release}');
      </script>`);
    }
    res.statusCode = 404;
    res.end('not found');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const origin = `http://127.0.0.1:${address.port}`;
  const executablePath = process.env.PA_BROWSER_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await chromium.launch({ headless: true, executablePath });
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto(`${origin}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('#image').evaluate(img => img.decode());
    const firstRequests = imageRequests;
    assert.ok(firstRequests >= 1, 'release A must fetch the image during install or first load');
    const firstState = await page.evaluate(async () => ({
      controller: !!navigator.serviceWorker.controller,
      naturalWidth: document.querySelector('#image').naturalWidth,
      caches: await Promise.all((await caches.keys()).map(async name => ({ name, urls: (await (await caches.open(name)).keys()).map(x => x.url) })))
    }));
    assert.equal(firstState.controller, true, 'release A page must be controlled');
    assert.equal(firstState.naturalWidth, 1, 'release A image must decode');
    const stableA = firstState.caches.find(c => c.name === 'pahlawan-angka-assets-v1');
    assert.ok(stableA && stableA.urls.some(url => url.includes(`__pa_asset_hash=${HASH_A}`)), 'release A hash key must be in Cache Storage');
    const beforeFetchSameHash = imageRequests;
    const fetchedA = await page.evaluate(async () => Array.from(new Uint8Array(await (await fetch('/assets/test-image.png?release=A')).arrayBuffer())));
    assert.deepEqual(fetchedA, Array.from(PNG_A), 'release A fetch() must return exact cached bytes');
    assert.equal(imageRequests, beforeFetchSameHash, 'fetch() of the same hash must not hit the image network');

    const beforeSameHashReload = imageRequests;
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('#image').evaluate(img => img.decode());
    assert.equal(imageRequests, beforeSameHashReload, 'same hash reload must not hit the image network');

    // A -> B changes only the app version; the image hash and bytes remain identical.
    release = 'B';
    await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      await reg.update();
      if (reg.installing) await new Promise(resolve => reg.installing.addEventListener('statechange', function done() { if (this.state === 'activated') { this.removeEventListener('statechange', done); resolve(); } }));
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('#image').evaluate(img => img.decode());
    assert.equal(imageRequests, beforeSameHashReload, 'same hash app-version update must not fetch the image');
    const fetchedB = await page.evaluate(async () => Array.from(new Uint8Array(await (await fetch('/assets/test-image.png?release=B')).arrayBuffer())));
    assert.deepEqual(fetchedB, Array.from(PNG_A), 'release B fetch() must still return release A bytes');
    assert.equal(imageRequests, beforeSameHashReload, 'release B same-hash fetch() must not hit the image network');

    // B -> C changes both the app version and the image hash/bytes.
    release = 'C';
    await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      await reg.update();
      if (reg.installing) await new Promise(resolve => reg.installing.addEventListener('statechange', function done() { if (this.state === 'activated') { this.removeEventListener('statechange', done); resolve(); } }));
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('#image').evaluate(img => img.decode());
    const secondState = await page.evaluate(async () => ({
      naturalWidth: document.querySelector('#image').naturalWidth,
      caches: await Promise.all((await caches.keys()).map(async name => ({ name, urls: (await (await caches.open(name)).keys()).map(x => x.url) })))
    }));
    assert.equal(secondState.naturalWidth, 1, 'release C image must decode');
    assert.ok(imageRequests > beforeSameHashReload, 'changed hash must fetch replacement bytes');
    const stableB = secondState.caches.find(c => c.name === 'pahlawan-angka-assets-v1');
    assert.ok(stableB && stableB.urls.some(url => url.includes(`__pa_asset_hash=${HASH_B}`)), 'release C hash key must be in Cache Storage');
    // Keeping the old content is safe for rollback; the active hash must be present and selected.

    await page.goto(`${origin}/nested/index.html`, { waitUntil: 'networkidle' });
    assert.equal(await page.evaluate(() => !!navigator.serviceWorker.controller), true, 'root service worker must control nested page scope');
    await page.locator('#image').evaluate(img => img.decode());

    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('#image').evaluate(img => img.decode());
    assert.equal(await page.locator('#image').evaluate(img => img.naturalWidth), 1, 'release C image must load offline');
    console.log(`PASS: Chromium SW install/cache/reload/update/offline; image network requests=${imageRequests}`);
  } finally {
    await context.close();
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
