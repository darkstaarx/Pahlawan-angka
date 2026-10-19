const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

function loadScript(file, context) {
  vm.runInContext(read(file), context, { filename: file });
}

function registryChecks() {
  const context = vm.createContext({ console });
  loadScript('js/heroes.js', context);
  const registry = vm.runInContext('({ HEROES, canonicalHeroId, migrateCanonicalHeroState: typeof migrateCanonicalHeroState === "function" ? migrateCanonicalHeroState : null })', context);
  assert.deepEqual(Object.keys(registry.HEROES).sort(), ['bunga', 'sidma', 'wira']);
  const heroAssets = (value, id, slot = 'pose') => {
    if (typeof value === 'string' && value.startsWith('assets/heroes/')) {
      assert.equal(value, `assets/heroes/${id}/idle.webp`, `${id}.${slot} points at a non-canonical hero asset: ${value}`);
    } else if (value && typeof value === 'object') {
      for (const [key, child] of Object.entries(value)) heroAssets(child, id, `${slot}.${key}`);
    }
  };
  for (const [id, hero] of Object.entries(registry.HEROES)) {
    assert.equal(hero.id, undefined, `${id}: registry keys are the public ids`);
    heroAssets(hero, id);
  }
  assert.equal(registry.canonicalHeroId('wirachibi'), 'wira');
  assert.equal(registry.canonicalHeroId('wira'), 'wira');
  assert.equal(registry.canonicalHeroId('unknown'), 'wira');
  if (typeof registry.migrateCanonicalHeroState === 'function') {
    const state = { hero: 'wirachibi', profiles: [{ hero: 'wirachibi', score: 9 }, { hero: 'bunga', score: 2 }], keep: true };
    const migrated = registry.migrateCanonicalHeroState(state);
    assert.equal(migrated.hero, 'wira');
    assert.equal(migrated.profiles[0].hero, 'wira');
    assert.equal(migrated.profiles[1].hero, 'bunga');
    assert.equal(migrated.keep, true);
    assert.equal(state.hero, 'wirachibi', 'migration must not mutate its input');
  }
}

function assetChecks() {
  const manifest = JSON.parse(read('assets/heroes/manifest.json'));
  const expected = {
    wira: ['assets/heroes/wira/idle.webp', 'cc5fd2ce33117240fa9907068398015c890ed45a136ada03e902cc8f7f965e68'],
    bunga: ['assets/heroes/bunga/idle.webp', '830a0d0afee54e64c2d9a7187831d35abea47fb4e0272a2e3686ab440535e3c7'],
    sidma: ['assets/heroes/sidma/idle.webp', 'af4d2f64b0ace5c67624b0b9aedf4366f29add4bb7f6a06633579fa6775cfc91']
  };
  assert.deepEqual(manifest.characters.map(x => x.id), ['wira', 'bunga', 'sidma']);
  for (const entry of manifest.characters) {
    const [file, hash] = expected[entry.id];
    assert.equal(entry.base, file);
    assert.equal(entry.sha256, hash);
    assert.equal(sha256(file), hash, `${file} hash does not match the approved manifest`);
    assert(fs.existsSync(path.join(root, file)), `${file} is missing`);
  }
  assert.equal(manifest.characters.length, 3);
  for (const old of ['assets/heroes/wira-chibi', 'assets/heroes/bunga-chibi', 'assets/heroes/sidma-chibi', 'assets/heroes/switch-cards']) {
    assert(!fs.existsSync(path.join(root, old)), `retired hero directory remains: ${old}`);
  }
}

function productionReferenceChecks() {
  const roots = ['js', 'css', 'admin', 'index.html', 'bengkel-ajaib.html', 'dapur-ramuan.html', 'gerai-wirayung.html', 'gudang-harta.html', 'kedai-kek.html', 'lombong-permata.html', 'menara-jam.html', 'pos-peninjau.html', 'tapak-bina.html', 'sw.js'];
  const files = [];
  for (const item of roots) {
    const absolute = path.join(root, item);
    if (!fs.existsSync(absolute)) continue;
    if (fs.statSync(absolute).isDirectory()) {
      const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : files.push(path.join(dir, entry.name)));
      walk(absolute);
    } else files.push(absolute);
  }
  const stale = [];
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const token of ['assets/heroes/wira-chibi', 'assets/heroes/bunga-chibi', 'assets/heroes/sidma-chibi', 'assets/heroes/switch-cards']) {
      if (text.includes(token)) stale.push(`${path.relative(root, file)}: ${token}`);
    }
  }
  assert.deepEqual(stale, [], `retired hero paths remain in production:\n${stale.join('\n')}`);
  const missing = [];
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(/assets\/heroes\/[A-Za-z0-9_./-]+/g)) {
      const after = text.slice(match.index + match[0].length);
      if (after.startsWith('${')) continue;
      const literal = match[0].replace(/[.,;:)\]}]+$/, '');
      if (literal.includes('${') || literal.endsWith('/')) continue;
      if (!fs.existsSync(path.join(root, literal))) missing.push(`${path.relative(root, file)}: ${literal}`);
    }
  }
  assert.deepEqual(missing, [], `production references missing hero assets:\n${missing.join('\n')}`);
}

function motionHarness(heroId, { fail = false, reduced = false } = {}) {
  let now = 0, nextRaf = 0;
  const rafs = new Map(), timers = [], draws = [], arcs = [], nodes = new Map();
  const classes = () => { const set = new Set(); return { add: x => set.add(x), remove: x => set.delete(x), contains: x => set.has(x), toggle: (x, on) => on ? set.add(x) : set.delete(x) }; };
  const node = (left, src = '') => ({ classList: classes(), currentSrc: src, src, clientWidth: 420, clientHeight: 240, clientLeft: 0, clientTop: 0,
    style: { setProperty() {} }, getAttribute: name => name === 'src' ? src : null, setAttribute() {}, appendChild() {}, addEventListener() {},
    getBoundingClientRect: () => ({ left, top: 0, bottom: 120, width: 100, height: 100 }) });
  const arena = node(0), hero = node(0), heroIdle = node(0, `assets/heroes/${heroId}/idle.webp`), enemy = node(260), enemySprite = node(260, 'assets/enemies/minions/askabus.webp');
  const pet = node(0); pet.classList.add('hidden');
  for (const [id, value] of Object.entries({ battleArena: arena, hero, heroIdle, enemy, enemySprite, battlePet: pet })) nodes.set(id, value);
  const ctx2d = { setTransform() {}, clearRect() {}, save() {}, restore() {}, translate() {}, scale() {}, rotate() {},
    drawImage(img) { draws.push(img?.src || ''); }, getImageData: () => ({ data: new Uint8ClampedArray(8 * 8 * 4).fill(255) }), createRadialGradient: () => ({ addColorStop() {} }), beginPath() {}, arc(...args) { arcs.push(args); }, fill() {}, ellipse() {}, stroke() {}, fillRect() {}, strokeText() {}, fillText() {} };
  const document = { readyState: 'complete', body: { dataset: { screen: 'game' } }, getElementById: id => nodes.get(id) || null,
    createElement: tag => tag === 'canvas' ? { width: 8, height: 8, className: '', setAttribute() {}, getContext: () => ctx2d } : { ...node(0), remove() {} }, addEventListener() {} };
  class ImageMock { constructor() { this.naturalWidth = 8; this.naturalHeight = 8; this.src = ''; } decode() { return fail ? Promise.reject(new Error('decode failure')) : Promise.resolve(); } }
  const context = { document, console, Image: ImageMock, window: null, db: { hero: heroId, rewards: {} }, sess: { hp: 20, ehp: 12 }, performance: { now: () => now }, matchMedia: () => ({ matches: reduced }),
    requestAnimationFrame: fn => { const id = ++nextRaf; rafs.set(id, fn); return id; }, cancelAnimationFrame: id => rafs.delete(id), MutationObserver: class { observe() {} }, ResizeObserver: class { observe() {} } };
  context.window = context;
  let generation = 0;
  context.PABattlePresentation = { later: (fn, delay) => { const timer = { fn, delay, generation, cleared: false }; timers.push(timer); return timer; }, clear: timer => { if (timer) timer.cleared = true; }, cancel: () => { generation++; timers.forEach(x => x.cleared = true); context.PACombatMotion?.reset(); }, pending: () => timers.filter(x => !x.cleared).length };
  vm.createContext(context); loadScript('js/combat-motion-v1.js', context);
  const flush = async () => { await Promise.resolve(); await Promise.resolve(); context.PACombatMotion.sync(); await Promise.resolve(); await Promise.resolve(); };
  const renderAt = time => { now = time; const callback = [...rafs.values()].at(-1); assert(callback, `no scheduled frame at ${time}ms`); draws.length = 0; arcs.length = 0; callback(time); return { draws: [...draws], arcs: [...arcs] }; };
  return { context, flush, renderAt, timers, draws, arcs };
}

async function motionChecks() {
  for (const hero of ['wira', 'bunga', 'sidma']) {
    const h = motionHarness(hero); await h.flush();
    const normal = h.context.PACombatMotion.begin('hero', 'enemy');
    assert(normal, `${hero}: normal attack did not start`);
    assert(Number.isFinite(normal.contactDelay) && Number.isFinite(normal.completionDelay));
    assert(normal.contactDelay < normal.completionDelay);
    assert(h.context.sess.hp === 20 && h.context.sess.ehp === 12, `${hero}: renderer wrote gameplay HP`);
    assert(h.renderAt(Math.max(1, normal.contactDelay - 1)).draws.every(src => src.includes(`assets/heroes/${hero}/idle.webp`) || src.includes('askabus.webp')),
      `${hero}: normal motion drew a non-canonical hero image`);
    assert(normal.contactDelay <= 1000, `${hero}: caster contact missed deadline`);
    h.context.PACombatMotion.reset();
    assert.equal(h.context.PACombatMotion.begin('hero', 'enemy', true), null, `${hero}: finisher should use fallback choreography`);
    assert(h.context.PACombatMotion.begin('enemy', 'hero'), `${hero}: enemy motion unavailable`);
    h.context.PABattlePresentation.cancel();
    assert.equal(h.context.PACombatMotion.isActive(), false, `${hero}: cancel did not stop motion`);
  }
  const failed = motionHarness('wira', { fail: true }); await failed.flush();
  assert.equal(failed.context.PACombatMotion.begin('hero', 'enemy'), null, 'failed image decode must return null');
  const reduced = motionHarness('bunga', { reduced: true }); await reduced.flush();
  const reducedAttack = reduced.context.PACombatMotion.begin('hero', 'enemy'); assert(reducedAttack);
  const before = reduced.renderAt(reducedAttack.contactDelay - 1).arcs.length;
  const at = reduced.renderAt(reducedAttack.contactDelay).arcs.length;
  assert(at >= before, 'reduced caster cue did not reach its deadline');
}

(async () => {
  registryChecks();
  assetChecks();
  productionReferenceChecks();
  await motionChecks();
  console.log('PASS: canonical hero registry, migration boundary, approved assets, stale-path cleanup, and three-hero motion renderer');
})().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
