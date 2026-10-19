// Deterministic contract test for Wira Chibi's alternating shield throw.
// This executes the real renderer in a small VM browser harness; it does not
// stub PACombatMotion.begin/render/reset or mutate gameplay HP.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const motionSource = fs.readFileSync(path.join(root, 'js/combat-motion-v1.js'), 'utf8');
const shieldRelease = 'assets/heroes/wira-chibi/frames/shield-throw-release-v1.webp';
const shieldProjectile = 'assets/heroes/wira-chibi/frames/shield-projectile-v1.webp';
const attackSheet = 'assets/heroes/wira-chibi/frames/ice-combo-spritesheet-v2.webp';
const slashFrame = 'assets/heroes/wira-chibi/frames/attack-arc-v2.webp';

function webpInfo(relative) {
  const bytes = fs.readFileSync(path.join(root, relative));
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', `${relative} is not RIFF`);
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', `${relative} is not WEBP`);
  // WebP alpha is encoded in the VP8X/ALPH/VP8L payload; this check catches
  // accidental opaque replacement files without depending on an image codec.
  const hasAlphaChunk = bytes.includes(Buffer.from('ALPH')) ||
    (bytes.includes(Buffer.from('VP8X')) && (bytes[20] & 0x10) !== 0) ||
    (bytes.includes(Buffer.from('VP8L')) && (bytes[24] & 0x10) !== 0);
  assert(hasAlphaChunk, `${relative} must retain an alpha-capable WebP payload`);
}

function makeHarness({ shieldReady = true, reduced = false } = {}) {
  let now = 0;
  let rafId = 0;
  const rafs = new Map();
  const timers = [];
  const draws = [];
  const rotations = [];
  const classes = new Set();
  const nodes = new Map();
  const imageState = new Map();
  const alpha = new Uint8ClampedArray(8 * 8 * 4).fill(255);
  let tx = 0, ty = 0, transformStack = [];

  const classList = {
    add: name => classes.add(name),
    remove: name => classes.delete(name),
    contains: name => classes.has(name),
    toggle: (name, on) => on ? classes.add(name) : classes.delete(name)
  };
  const node = (left = 0) => ({
    classList: { ...classList }, style: {}, currentSrc: '',
    getBoundingClientRect: () => ({ left, top: 0, bottom: 120, width: 100, height: 100 }),
    getAttribute: name => name === 'src' ? this.currentSrc : null,
    setAttribute() {}, appendChild() {}, addEventListener() {},
    clientWidth: 420, clientHeight: 240, clientLeft: 0, clientTop: 0
  });
  const arena = node();
  const hero = node(0), heroIdle = node(0), enemy = node(260), enemySprite = node(260);
  enemySprite.currentSrc = 'assets/enemies/minions/askabus.webp';
  const pet = node(); let petHidden = true;
  pet.classList.contains = name => name === 'hidden' ? petHidden : classes.has(name);
  pet.classList.add = name => { if (name === 'hidden') petHidden = true; else classes.add(name); };
  pet.classList.remove = name => { if (name === 'hidden') petHidden = false; else classes.delete(name); };
  pet.classList.add('hidden');
  nodes.set('battleArena', arena); nodes.set('hero', hero); nodes.set('heroIdle', heroIdle);
  nodes.set('enemy', enemy); nodes.set('enemySprite', enemySprite); nodes.set('battlePet', pet);

  const ctx2d = {
    setTransform() { tx = 0; ty = 0; }, clearRect() {},
    save() { transformStack.push([tx, ty]); },
    restore() { [tx, ty] = transformStack.pop() || [0, 0]; },
    translate(x, y) { tx += x; ty += y; }, scale() {}, rotate(angle) { rotations.push(angle); },
    drawImage(...args) { draws.push({ src: args[0]?.src || '', args, x: tx + (args.length === 9 ? args[5] : args[1]), y: ty + (args.length === 9 ? args[6] : args[2]) }); },
    createRadialGradient: () => ({ addColorStop() {} }),
    beginPath() {}, arc() {}, fill() {}, ellipse() {}, stroke() {}, fillRect() {},
    strokeText() {}, fillText() {},
    getImageData: () => ({ data: alpha })
  };
  const document = {
    readyState: 'complete', body: { dataset: { screen: 'game' } },
    getElementById: id => nodes.get(id) || null,
    createElement: tag => tag === 'canvas' ? {
      className: '', width: 8, height: 8, setAttribute() {},
      getContext: () => ctx2d
    } : { ...node(), textContent: '', remove() {} },
    addEventListener() {}
  };
  class ImageMock {
    constructor() { this.naturalWidth = 8; this.naturalHeight = 8; this.src = ''; }
    decode() {
      imageState.set(this.src, this);
      if (!shieldReady && (this.src.endsWith('shield-throw-release-v1.webp') || this.src.endsWith('shield-projectile-v1.webp'))) {
        return Promise.reject(new Error('shield asset decode failure'));
      }
      return Promise.resolve();
    }
  }
  const context = {
    document, console, Image: ImageMock,
    window: null, db: { hero: 'wirachibi', rewards: {} }, sess: { hp: 20, ehp: 12 },
    performance: { now: () => now }, matchMedia: () => ({ matches: reduced }),
    requestAnimationFrame: fn => { const id = ++rafId; rafs.set(id, fn); return id; },
    cancelAnimationFrame: id => rafs.delete(id),
    MutationObserver: class { observe() {} },
    ResizeObserver: class { observe() {} },
    PABattlePresentation: null
  };
  context.window = context;
  let journeyGeneration = 0;
  context.PABattlePresentation = {
    later: (raw, delay) => {
      const timer = { raw, delay, cleared: false, generation: journeyGeneration, fn: null };
      timer.fn = () => {
        if (timer.cleared || timer.generation !== journeyGeneration) return;
        timer.cleared = true; raw();
      };
      timers.push(timer); return timer;
    },
    cancel: () => {
      journeyGeneration++;
      timers.forEach(timer => { timer.cleared = true; });
      context.PACombatMotion?.reset?.();
    },
    clear: timer => { if (timer) timer.cleared = true; },
    generation: () => journeyGeneration,
    pending: () => timers.filter(timer => !timer.cleared).length
  };
  vm.createContext(context);
  vm.runInContext(motionSource, context, { filename: 'js/combat-motion-v1.js' });

  const flush = async () => { await Promise.resolve(); await Promise.resolve(); context.PACombatMotion.sync(); await Promise.resolve(); await Promise.resolve(); };
  const renderAt = time => {
    now = time;
    const callback = [...rafs.values()].at(-1);
    assert(callback, `renderer scheduled no frame at ${time}ms`);
    draws.length = 0;
    callback(time);
    return draws.slice();
  };
  const srcs = () => draws.map(draw => draw.src);
  const setPet = enabled => { if (enabled) pet.classList.remove('hidden'); else pet.classList.add('hidden'); };
  return { context, flush, renderAt, srcs, draws, rotations, timers, classes, pet, setPet, imageState };
}

async function start(h, { finisher = false, attacker = 'hero', target = 'enemy' } = {}) {
  await h.flush();
  h.draws.length = 0;
  return h.context.PACombatMotion.begin(attacker, target, finisher);
}

function assertNoGameplayMutation(h) {
  assert.deepEqual(h.context.db, { hero: 'wirachibi', rewards: {} }, 'renderer mutated gameplay state');
  assert.deepEqual(h.context.sess, { hp: 20, ehp: 12 }, 'renderer mutated gameplay HP');
}

async function run() {
  webpInfo(shieldRelease); webpInfo(shieldProjectile); webpInfo(attackSheet); webpInfo(slashFrame);

  const h = makeHarness();
  const slash = await start(h);
  assert.equal(slash.attackVariant, 'slash');
  assert.equal(slash.contactDelay, 1050);
  assert.equal(slash.completionDelay, 1320);
  assert(h.srcs().every(src => !src.includes('shield-')), 'shield rendered during slash start');
  h.context.PACombatMotion.reset();

  // Finisher, enemy attack, and an invalid target do not consume the pending shield slot.
  assert.equal(await start(h, { finisher: true }), null);
  assert((await start(h, { attacker: 'enemy', target: 'hero' }))?.motion, 'enemy attack should be a valid presentation');
  h.context.PACombatMotion.reset();
  assert.equal(await start(h, { attacker: 'hero', target: 'hero' }), null);
  const shield = await start(h);
  assert.equal(shield.attackVariant, 'shield');
  assert.equal(shield.contactDelay, 1050);
  assert.equal(shield.completionDelay, 1320);
  assertNoGameplayMutation(h);

  let frame = h.renderAt(250);
  assert(frame.some(d => d.src.endsWith('shield-throw-release-v1.webp')), 'shield release pose missing');
  assert(frame.some(d => d.src.endsWith('shield-projectile-v1.webp')), 'shield projectile missing at launch');
  const outbound = h.renderAt(700).find(d => d.src.endsWith('shield-projectile-v1.webp'));
  assert(outbound, 'shield projectile missing while outbound');
  const outboundX = outbound.x;
  const contact = h.renderAt(1050).find(d => d.src.endsWith('shield-projectile-v1.webp'));
  assert(contact, 'shield projectile missing at contact');
  assert(Math.abs(contact.x - outboundX) > 1, 'shield projectile did not travel');
  const returning = h.renderAt(1120).find(d => d.src.endsWith('shield-projectile-v1.webp'));
  assert(returning, 'shield projectile missing on return');
  assert(returning.x < contact.x, 'shield projectile did not return after contact');
  assert(h.rotations.some(angle => Math.abs(angle) > 0.01), 'normal shield projectile did not spin');
  assert(!h.srcs().some(src => src.endsWith('attack-arc-v2.webp')), 'slash pose rendered during shield');
  h.context.PACombatMotion.reset();

  const petHarness = makeHarness();
  assert.equal((await start(petHarness)).attackVariant, 'slash');
  petHarness.context.PACombatMotion.reset();
  petHarness.context.db.rewards.equippedPet = 'aurora'; petHarness.setPet(true);
  let petCalls = 0; petHarness.context.triggerPetFollowUp = () => { petCalls++; };
  const petShield = await start(petHarness);
  assert.equal(petShield.attackVariant, 'shield');
  assert.equal(petShield.contactDelay, 1470);
  assert.equal(petShield.completionDelay, 1740);
  assert.equal(petCalls, 1, 'pet follow-up should trigger exactly once');
  const leadDraws = petHarness.renderAt(100);
  assert(!leadDraws.some(d => d.src.includes('shield-')), 'shield rendered during pet lead');
  petHarness.context.PACombatMotion.reset();
  const third = await start(petHarness);
  assert.equal(third.attackVariant, 'slash', 'third successful attack must return to slash');
  petHarness.context.PACombatMotion.reset();

  // A shield decode failure falls back to slash and leaves the shield slot pending.
  const failedAssets = makeHarness({ shieldReady: false });
  assert.equal((await start(failedAssets)).attackVariant, 'slash');
  failedAssets.context.PACombatMotion.reset();
  const fallback = await start(failedAssets);
  assert.equal(fallback.attackVariant, 'slash');
  failedAssets.context.PACombatMotion.reset();
  assert.equal((await start(failedAssets)).attackVariant, 'slash');
  assertNoGameplayMutation(failedAssets);

  // Reduced motion keeps the cue stationary and avoids shield travel.
  const reduced = makeHarness({ reduced: true });
  await start(reduced); reduced.context.PACombatMotion.reset();
  assert.equal((await start(reduced)).attackVariant, 'shield');
  const reducedDraw = reduced.renderAt(1070).find(d => d.src.endsWith('shield-projectile-v1.webp'));
  assert(reducedDraw, 'reduced motion contact cue missing');
  const reducedCue = reduced.renderAt(1030).find(d => d.src.endsWith('shield-projectile-v1.webp'));
  assert.equal(reducedDraw.x, reducedCue.x, 'reduced motion projectile traveled');
  assert(reduced.rotations.every(angle => angle === 0), 'reduced motion shield spun');
  reduced.context.PACombatMotion.reset();

  // A canceled completion callback from an old journey cannot reset a newer one.
  const canceled = makeHarness();
  await start(canceled); const oldCompletion = canceled.timers.at(-1).fn; canceled.context.PABattlePresentation.cancel();
  await start(canceled); assert(canceled.context.PACombatMotion.isActive()); oldCompletion();
  assert(canceled.context.PACombatMotion.isActive(), 'stale completion canceled newer animation');
  canceled.context.PACombatMotion.reset();
  console.log('PASS: Wira Chibi alternating shield throw, timing, flight, reduced motion, fallback, cancellation, and asset integrity');
}

run().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
