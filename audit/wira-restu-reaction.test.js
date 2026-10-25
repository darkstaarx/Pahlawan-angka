const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const sourcePath = require.resolve('../js/segel-demo-v2.1.0.js');

function extractFunction(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `stage function ${name} must exist`);
  const open = source.indexOf('{', start);
  let depth = 0, quote = null, escaped = false, lineComment = false, blockComment = false;
  for (let i = open; i < source.length; i++) {
    const ch = source[i], next = source[i + 1];
    if (lineComment) { if (ch === '\n') lineComment = false; continue; }
    if (blockComment) { if (ch === '*' && next === '/') { blockComment = false; i++; } continue; }
    if (quote) { if (escaped) escaped = false; else if (ch === '\\') escaped = true; else if (ch === quote) quote = null; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '/' && next === '/') { lineComment = true; i++; continue; }
    if (ch === '/' && next === '*') { blockComment = true; i++; continue; }
    if (ch === '{') depth++;
    if (ch === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`unterminated stage function ${name}`);
}

function makeReactionFixture() {
  const source = fs.readFileSync(sourcePath, 'utf8');
  const helper = extractFunction(source, 'applyRestuHeroReaction');
  const S = { heroLock: 'idle' };
  const hero = { userData: { e: 'idle' }, material: { map: 'idle' }, scale: { set() {} } };
  const sandbox = {
    S, hero, showRestuSurprise() {},
    swap(mesh, entry) {
      mesh.userData.e = entry;
      mesh.material.map = entry.tex;
    }
  };
  vm.runInNewContext(`${helper}\nthis.applyRestuHeroReaction=applyRestuHeroReaction;`, sandbox);
  return { apply: sandbox.applyRestuHeroReaction, S, hero };
}

function makeLoadFixture() {
  const source = fs.readFileSync(sourcePath, 'utf8');
  const loadRestu = extractFunction(source, 'loadRestu');
  const loaded = [];
  const assets = {};
  const sandbox = {
    RESTU_ASSETS: Object.fromEntries(Object.keys({ anticipate: 1, fall: 1, preland: 1, land: 1, fx: 1, surprised: 1 }).map(key => [key, key])),
    restuLoaded: null,
    restuLoadPromise: null,
    restuDisposed: false,
    restuFx: { material: {} },
    load: async key => { loaded.push(key); return key === 'surprised' ? null : { key }; },
    restuEntry: (tex, anchor, scale = 1) => ({ tex, anchor, scale }),
    swap() {}
  };
  vm.runInNewContext(`${loadRestu}\nthis.loadRestu=loadRestu;`, sandbox);
  return { load: sandbox.loadRestu, sandbox, loaded };
}

function restoreFixture() {
  const source = fs.readFileSync(sourcePath, 'utf8');
  const restore = extractFunction(source, 'restoreRestuState');
  const hero = { userData: { e: 'surprised' }, material: { map: 'surprised' } };
  const S = { heroLock: 'surprised', dark: 1, darkTo: 1, speedFx: 1, camZoom: 2, camZoomTo: 2, camPunch: 1, camFX: 1, camFY: 1, camK: 1, par: 1, parTo: 1, introT: 1, running: true };
  const sandbox = {
    S, hero, restuActive: null, restuMesh: { visible: true }, restuFx: { visible: true },
    host: { classList: { remove() {}, toggle() {} } },
    restuNamePlate() {}, hideSay() {}, restoreRestuLayout() {}, fxParts:[], introShown: false,
    camera: { view: null }, applyParallax() {}, swap(mesh, entry) { mesh.userData.e = entry; mesh.material.map = entry.tex; }
  };
  vm.runInNewContext(`${restore}\nthis.restoreRestuState=restoreRestuState;`, sandbox);
  return { restore: sandbox.restoreRestuState, sandbox, hero, S };
}

test('Wira keeps the normal hero pose during the early close-up', () => {
  const { apply, S, hero } = makeReactionFixture();
  const active = { heroSurprised: false };
  apply(active, { surprised: { tex: 'surprised' } }, 1.21);
  assert.equal(active.heroSurprised, false);
  assert.equal(S.heroLock, 'idle');
  assert.equal(hero.material.map, 'idle');
});

test('Wira swaps to the optional surprised full-body pose on the wide reveal', () => {
  const { apply, S, hero } = makeReactionFixture();
  const active = { heroSurprised: false };
  const surprised = { tex: 'surprised' };
  apply(active, { surprised }, 1.2);
  assert.equal(active.heroSurprised, true);
  assert.equal(S.heroLock, surprised);
  assert.equal(hero.material.map, 'surprised', 'the wide shot renders the reaction immediately');
  apply(active, { surprised: { tex: 'other' } }, 1.21);
  assert.equal(active.heroSurprised, true);
  assert.equal(S.heroLock, surprised, 'the surprise lock remains until Restu cleanup restores the saved state');
});

test('missing optional surprised asset leaves Restu loading usable', async () => {
  const source = fs.readFileSync(sourcePath, 'utf8');
  assert.match(source, /surprised\s*:\s*['"]assets\/heroes\/wira\/frames\/restu-surprised-v1\.webp['"]/);
  const { load, sandbox } = makeLoadFixture();
  const data = await load();
  assert.ok(data, 'required Restu assets should still resolve');
  assert.equal(data.surprised == null, true, 'missing optional asset falls back to no reaction');
  assert.equal(sandbox.restuFx.material.map.key, 'fx');
});

test('Restu cleanup restores the saved Wira map and lock', () => {
  const { restore, sandbox, hero, S } = restoreFixture();
  const oldPose = { tex: 'idle', w: 1, h: 1 };
  const oldState = { camZoom: 1, camZoomTo: 1, camPunch: 0, camFX: 0, camFY: 0, camK: 8, par: 0, parTo: 0, introT: -1, running: false, introShown: false, heroPose: oldPose, heroLock: 'slash' };
  restore(oldState);
  assert.equal(hero.material.map, 'idle');
  assert.equal(hero.userData.e, oldPose);
  assert.equal(S.heroLock, 'slash');
  assert.equal(hero.userData.e.tex, 'idle');
  assert.equal(sandbox.restuMesh.visible, false);
  assert.equal(sandbox.restuFx.visible, false);
});

test('cancel cleanup cannot leak the temporary Wira surprised pose', () => {
  const { restore, hero, S } = restoreFixture();
  const oldPose = { tex: 'idle', w: 1, h: 1 };
  restore({ camZoom: 1, camZoomTo: 1, camPunch: 0, camFX: 0, camFY: 0, camK: 8, par: 0, parTo: 0, introT: -1, running: false, introShown: false, heroPose: oldPose, heroLock: null });
  assert.equal(hero.material.map, 'idle');
  assert.equal(S.heroLock, null);
});
