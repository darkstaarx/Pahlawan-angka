const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require('node:path').join(__dirname, '../js/segel-demo-v2.1.0.js'), 'utf8');

function blockAfter(needle, open = '{') {
  const start = source.indexOf(needle);
  assert.notEqual(start, -1, `source marker not found: ${needle}`);
  const bodyStart = source.indexOf(open, start);
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let i = bodyStart; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return source.slice(bodyStart + 1, i);
  }
  throw new Error(`unterminated source block: ${needle}`);
}

function runIdleNormalization(heroIdle, heroPrepare = null, heroSlash = null, heroHappy = [{ id: 'happy' }]) {
  const start = source.indexOf('    const fillHeroFrames=');
  const end = source.indexOf('    /* latar:', start);
  assert.ok(start >= 0 && end > start, 'hero normalization slice must exist');
  const context = { heroIdle, heroPrepare, heroSlash, heroHappy };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end) + '\nthis.result={heroIdle,heroPrepare,heroSlash,heroHappy};', context);
  return context.result;
}

function entryFailureHarness({ prepare = () => false, overlay = true } = {}) {
  const events = [];
  const hero = { userData: { e: { tex: { image: {} }, w: 2, h: 3 } }, visible: false, material: { opacity: 0 }, position: {} };
  const enPoints = { visible: true }, enHalo = { visible: true }, enGlow = { visible: true, material: { opacity: .8 } };
  const enMat = { opacity: .7 }, enHaloMat = { opacity: .4 };
  const S = { enterT: -1, heroFade: 0, heroLock: 'locked', heroX: 10, heroFeet: 10, heroFrames: ['old'], heroHold: 'old-hold', heroFrameT0: 0 };
  const document = { querySelector: selector => selector === '.paSegelEntryCinematic' && overlay ? {} : null };
  const context = { hero, enPoints, enHalo, enGlow, enMat, enHaloMat, S, document, reduceMotion: false,
    HERO_HOME: -1.62, GROUND: -1.92, heroIdleE: ['idle'], HERO_IDLE_HOLD: 'idle-hold', tAcc: 22,
    swap: (_mesh, frame) => events.push(['swap', frame]), sfx: () => events.push('sfx'), restoreHeroAfterEntranceFailure: null,
    prepareEntrance: prepare };
  const restore = blockAfter('    function restoreHeroAfterEntranceFailure()');
  const enter = blockAfter('      enter(){');
  vm.createContext(context);
  vm.runInContext(`this.restoreHeroAfterEntranceFailure=function(){${restore}}; this.enter=function(){${enter}};`, context);
  context.enter();
  return { ...context, events };
}

function prepareEntranceResult(texture) {
  const context = {
    hero: { userData: { e: { tex: texture, w: 2, h: 3 } } },
    EN: 4,
    sampleSilhouette: () => { throw new Error('must not sample a null texture'); },
    enTarget: new Float32Array(8), enStart: new Float32Array(8), enDelay: new Float32Array(4), enSwirl: new Float32Array(4)
  };
  vm.createContext(context);
  vm.runInContext(`this.prepareEntrance=function(){${blockAfter('    function prepareEntrance()')}};`, context);
  return context.prepareEntrance();
}

test('failed idle slots fall back to nearby loaded frames without changing loop length or holds', () => {
  const a = { id: 'a' }, c = { id: 'c' };
  const result = runIdleNormalization([a, null, c, null]);
  assert.deepEqual(result.heroIdle, [a, a, c, c]);
  assert.equal(result.heroIdle.length, 4);
  const context = { frames: result.heroIdle, holds: [.40, .40, .40, .11] };
  vm.createContext(context);
  vm.runInContext(`this.heldFrame=function(frames,holds,t){${blockAfter('  function heldFrame(frames, holds, t)')}};`, context);
  assert.equal(vm.runInContext('heldFrame(frames, holds, .81)', context), c);
  assert.equal(vm.runInContext('heldFrame(frames, holds, 1.21)', context), c);
  assert.equal(vm.runInContext('heldFrame(frames, holds, 1.30)', context), c);
  assert.deepEqual(result.heroHappy, [{ id: 'happy' }]);
});

test('the real entrance preparation returns false safely when the active hero texture is null', () => {
  assert.equal(prepareEntranceResult(null), false);
});

test('all-null happy and strike textures fall back to the normalized idle frame', () => {
  const a = { id: 'idle' };
  const result = runIdleNormalization([a, null, a, null], null, null, [null, null]);
  assert.deepEqual(result.heroIdle, [a, a, a, a]);
  assert.equal(result.heroPrepare, a);
  assert.equal(result.heroSlash, a);
  assert.deepEqual(result.heroHappy, [a, a]);
});

test('all idle frames missing fails cleanly before an invisible entrance can be armed', () => {
  assert.throws(() => runIdleNormalization([null, null, null, null]), /Wira hero texture gagal dimuat/);
});

test('partial attack failures retain attack calibration and idle fallback keeps idle size', () => {
  const start = source.indexOf('    const fillHeroFrames=');
  const end = source.indexOf('    /* latar:', start);
  const scaleStart = source.indexOf('    const HERO_UPP=');
  const scaleEnd = source.indexOf('    const heroHappyAnchor=', scaleStart);
  const idle = { image: { height: 480 }, boxH: .85 };
  const prepare = { image: { height: 768 }, boxH: .44 };
  const slash = { image: { height: 768 }, boxH: .47 };
  for (const [p, s] of [[prepare, slash], [null, slash], [prepare, null], [null, null]]) {
    const c = { heroIdle: [idle, null, idle, idle], heroPrepare: p, heroSlash: s, heroHappy: [null, null],
      HERO_CHAR_H: 2, HERO_HAPPY_SCALE: 1.08, heroCalibratedUpp: (t, h) => h / (t.image.height * t.boxH) };
    vm.createContext(c);
    vm.runInContext(source.slice(start, end) + source.slice(scaleStart, scaleEnd) + '\nthis.scales={HERO_UPP,HERO_STRIKE_UPP,HERO_HAPPY_UPP};', c);
    const ref = p || s || idle;
    assert.equal(c.scales.HERO_STRIKE_UPP, 2 / (ref.image.height * ref.boxH));
    assert.equal(c.scales.HERO_HAPPY_UPP, c.scales.HERO_UPP);
    assert.equal(c.heroPrepare, p || s || idle);
    assert.equal(c.heroSlash, s || p || idle);
  }
});

test('normal entrance remains a fade-in when the cinematic overlay exists', () => {
  const h = entryFailureHarness({ prepare: () => true, overlay: true });
  // The extracted production enter() only commits the fade after preparation succeeds.
  assert.equal(h.S.enterT, 0);
  assert.equal(h.S.heroFade, 0);
  assert.equal(h.enPoints.visible, true);
  assert.equal(h.enHalo.visible, true);
  assert.equal(h.enGlow.visible, true);
  assert.deepEqual(h.events, ['sfx']);
});

test('replay without an entry overlay restores a visible hero immediately', () => {
  const h = entryFailureHarness({ prepare: () => { throw new Error('late callback'); }, overlay: false });
  assert.equal(h.S.enterT, -1);
  assert.equal(h.S.heroFade, 1);
  assert.equal(h.hero.visible, true);
  assert.equal(h.hero.material.opacity, 1);
  assert.equal(h.enPoints.visible, false);
  assert.equal(h.enHalo.visible, false);
  assert.equal(h.enGlow.visible, false);
  assert.equal(h.enMat.opacity, 0);
  assert.equal(h.enHaloMat.opacity, 0);
});

test('prepare failure and an empty silhouette both leave the hero visible with no particles', () => {
  for (const prepare of [() => { throw new Error('texture race'); }, () => false]) {
    const h = entryFailureHarness({ prepare, overlay: true });
    assert.equal(h.S.enterT, -1);
    assert.equal(h.S.heroFade, 1);
    assert.equal(h.hero.visible, true);
    assert.equal(h.hero.material.opacity, 1);
    assert.equal(h.enPoints.visible, false);
    assert.equal(h.enHalo.visible, false);
    assert.equal(h.enGlow.visible, false);
  }
});

test('module guard initializes the host once across different script URLs', () => {
  const start = source.indexOf('(function(){');
  const end = source.indexOf("  'use strict';", start) + "  'use strict';".length;
  const guard = source.slice(start, end) + '\nwindow.__segelInitCount=(window.__segelInitCount||0)+1;\n})();';
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(guard, context, { filename: 'segel-demo-v2.1.0.js?v=old' });
  const first = { ...context.window };
  vm.runInContext(guard, context, { filename: 'segel-demo-v2.1.0.js?v=new' });
  assert.equal(context.window.__segelInitCount, 1);
  assert.equal(context.window.__PA_SEGEL_RUNTIME__, 'segel-demo-v2.1.0');
  assert.equal(context.window.__PA_SEGEL_CANONICAL__, true);
  assert.deepEqual(context.window, first);
});

