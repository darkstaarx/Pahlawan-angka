const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require.resolve('../js/rapid-lock-v1.js'), 'utf8');

function makeClassList() {
  const values = new Set();
  return {
    add: (...xs) => xs.forEach(x => values.add(x)),
    remove: (...xs) => xs.forEach(x => values.delete(x)),
    contains: x => values.has(x),
    toggle: (x, on) => (on === undefined ? (values.has(x) ? values.delete(x) : values.add(x)) : on ? values.add(x) : values.delete(x))
  };
}

function makeElement(tag = 'div', selector = '') {
  const listeners = {};
  const node = {
    tagName: tag.toUpperCase(), selector, className: '', classList: makeClassList(),
    style: { setProperty() {} }, children: [], hidden: false, value: '', textContent: '',
    dataset: {}, parentElement: null, attributes: {}, onended: null, onerror: null,
    addEventListener(type, fn) { listeners[type] = fn; },
    dispatchEvent(event) { listeners[event.type]?.(event); },
    setAttribute(name, value) { this.attributes[name] = String(value); },
    getAttribute(name) { return this.attributes[name] ?? null; },
    append(child) { child.parentElement = this; this.children.push(child); },
    focus() {}, pause() { this.paused = true; },
    play() { this.played = true; this._play?.(); return undefined; },
    closest() { return this; },
    querySelector() { return null; }, querySelectorAll() { return [] }
  };
  return node;
}

function harness({ reducedMotion = false, host, withHost = true } = {}) {
  const events = [];
  const timers = [];
  const body = makeElement('body');
  const bySelector = new Map();
  const pinA = makeElement('input', '#paRapidPin');
  const pinB = makeElement('input', '#paRapidPin2');
  const steps = {
    child: makeElement('section', '[data-step="child"]'),
    review: makeElement('section', '[data-step="review"]'),
    fall: makeElement('div', '[data-step="fall"]')
  };
  const stage = makeElement('section', '.paRapidStage');
  const video = makeElement('video', '.paRapidVideo');
  const items = makeElement('ol', '.paRapidItems');
  const error = makeElement('p', '.paRapidError');
  const slotA = makeElement('div', '[data-slots="a"]');
  const slotB = makeElement('div', '[data-slots="b"]');
  const unlock = makeElement('button', '[data-act="unlock"]');
  const resume = makeElement('button', '[data-act="resume"]');
  const explore = makeElement('button', '[data-act="explore"]');
  const labelA = makeElement('label', '[data-pin-label]');
  const labelB = makeElement('label', '[data-pin2-label]');
  const elements = { pinA, pinB, stage, video, items, error, slotA, slotB, unlock, resume, explore, labelA, labelB, ...steps };
  for (const [key, value] of Object.entries(elements)) bySelector.set(key, value);
  pinA.id = 'paRapidPin'; pinB.id = 'paRapidPin2';
  pinA.parentElement = slotA; pinB.parentElement = slotB;
  pinA.closest = () => slotA; pinB.closest = () => slotB;
  slotA.querySelectorAll = () => [0, 1, 2, 3].map(() => makeElement('i'));
  slotB.querySelectorAll = slotA.querySelectorAll;
  const dialog = makeElement('div');
  dialog.querySelector = selector => {
    const map = {
      '#paRapidPin': pinA, '#paRapidPin2': pinB, '.paRapidStage': stage,
      '.paRapidVideo': video, '.paRapidItems': items, '.paRapidError': error,
      '[data-step="child"]': steps.child, '[data-step="review"]': steps.review,
      '[data-step="fall"]': steps.fall, '[data-slots="a"]': slotA,
      '[data-slots="b"]': slotB, '[data-pin-label]': labelA, '[data-pin2-label]': labelB,
      '[data-act="unlock"]': unlock, '[data-act="resume"]': resume, '[data-act="explore"]': explore
    };
    return map[selector] || makeElement('div', selector);
  };
  dialog.querySelectorAll = selector => selector === '.paRapidPin' ? [pinA, pinB] : [];
  dialog.append = child => { child.parentElement = dialog; dialog.children.push(child); };
  body.append = child => { child.parentElement = body; body.children.push(child); };
  const document = {
    body,
    createElement: tag => {
      const el = makeElement(tag);
      if (tag === 'div') {
        el.innerHTML = '';
        Object.defineProperty(el, 'innerHTML', { get: () => '', set() {} });
      }
      return el;
    }
  };
  const context = {
    window: null, document, console, Date, Promise, performance: { now: () => 0 },
    setTimeout(fn, ms) { const t = { fn, ms, cancelled: false }; timers.push(t); return t; },
    clearTimeout(t) { if (t) t.cancelled = true; },
    matchMedia: () => ({ matches: reducedMotion }),
    PA_ASSETS: { fall: 'portal.mp4' }, db: {}, sess: {}, paMuted: false,
    pageLockParentPin: () => '1234', createPageLockParentPin: () => true,
    PAEffortGuard: { resetAfterParent() {} }, save() {},
    PASegelHost: withHost ? host : undefined
  };
  context.window = context;
  vm.runInNewContext(source, context, { filename: 'js/rapid-lock-v1.js' });
  const lock = context.PARapidLock;
  video._play = () => { events.push('video'); video.playCount = (video.playCount || 0) + 1; };
  const originalCreate = document.createElement;
  document.createElement = tag => {
    const el = originalCreate(tag);
    if (tag === 'div') {
      // The production lock assigns the dialog markup after creation. Return the
      // deterministic fixture for that dialog while retaining normal elements.
      el.querySelector = dialog.querySelector;
      el.querySelectorAll = dialog.querySelectorAll;
      el.append = dialog.append;
      el.className = 'paRapidLock hidden';
      bySelector.set('dialog', el);
    }
    return el;
  };
  return { context, lock, events, timers, dialog: bySelector.get('dialog'), elements, flush() {
    for (const timer of timers.splice(0)) if (!timer.cancelled) timer.fn();
  }, triggerVideoEnd() { video.onended?.(); }, markTeacher() { events.push('teacher'); } };
}

function item(token) { return { token, prompt: '7 × 8 = ?', answer: 56 }; }

// Execute the real stage functions with a tiny Three-like fixture. This keeps
// the geometry assertions independent from source-pattern checks while avoiding
// a full WebGL boot in the regression suite.
function extractFunction(sourceText, name) {
  const start = sourceText.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `stage function ${name} must exist`);
  const declarationStart = sourceText.slice(Math.max(0, start - 6), start) === 'async ' ? start - 6 : start;
  const open = sourceText.indexOf('{', start);
  let depth = 0, quote = null, escaped = false, lineComment = false, blockComment = false;
  for (let i = open; i < sourceText.length; i++) {
    const ch = sourceText[i], next = sourceText[i + 1];
    if (lineComment) { if (ch === '\n') lineComment = false; continue; }
    if (blockComment) { if (ch === '*' && next === '/') { blockComment = false; i++; } continue; }
    if (quote) { if (escaped) escaped = false; else if (ch === '\\') escaped = true; else if (ch === quote) quote = null; continue; }
    if ((ch === '"' || ch === "'" || ch === '`')) { quote = ch; continue; }
    if (ch === '/' && next === '/') { lineComment = true; i++; continue; }
    if (ch === '/' && next === '*') { blockComment = true; i++; continue; }
    if (ch === '{') depth++;
    if (ch === '}' && --depth === 0) return sourceText.slice(declarationStart, i + 1);
  }
  throw new Error(`unterminated stage function ${name}`);
}

function extractArrowMethod(sourceText, name) {
  const start = sourceText.indexOf(`${name}:()=>`);
  assert.notEqual(start, -1, `host method ${name} must exist`);
  const open = sourceText.indexOf('{', start);
  let depth = 0, quote = null, escaped = false, lineComment = false, blockComment = false;
  for (let i = open; i < sourceText.length; i++) {
    const ch = sourceText[i], next = sourceText[i + 1];
    if (lineComment) { if (ch === '\n') lineComment = false; continue; }
    if (blockComment) { if (ch === '*' && next === '/') { blockComment = false; i++; } continue; }
    if (quote) { if (escaped) escaped = false; else if (ch === '\\') escaped = true; else if (ch === quote) quote = null; continue; }
    if ((ch === '"' || ch === "'" || ch === '`')) { quote = ch; continue; }
    if (ch === '/' && next === '/') { lineComment = true; i++; continue; }
    if (ch === '/' && next === '*') { blockComment = true; i++; continue; }
    if (ch === '{') depth++;
    if (ch === '}' && --depth === 0) return sourceText.slice(start + name.length + 1, i + 1);
  }
  throw new Error(`unterminated host method ${name}`);
}

const realRestuFrameFixture = require('./helpers/restu-stage-fixture.cjs').fixture;

async function lockWithThreeRapidWrong(h) {
  let out;
  for (let i = 0; i < 3; i++) out = h.lock.observe('D2.TEST', false, '', .5, 'first-attempt', item(String(i)), 'first-attempt', 49);
  await Promise.resolve();
  return out;
}

test('rapid lock keeps inputs gated until Cikgu, portal video, then PIN', async () => {
  const h = harness({ host: { playRestuEntry: () => { h?.markTeacher?.(); return Promise.resolve({}); } } });
  assert.equal(await lockWithThreeRapidWrong(h), 'lock');
  assert.equal(h.elements.child.hidden, true, 'PIN step is hidden during cinematic');
  h.elements.pinA.value = '1234';
  h.elements.pinA.dispatchEvent({ type: 'input' });
  assert.equal(h.elements.review.hidden, true, 'PIN cannot bypass the cinematic');
  await Promise.resolve();
  assert.equal(h.elements.video.played, true, 'portal video starts after teacher entry');
  h.triggerVideoEnd();
  assert.equal(h.elements.child.hidden, false, 'PIN step opens only after the video');
  assert.deepEqual(h.events, ['teacher', 'video']);
});

test('reduced motion reaches PIN without the synchronous playFall TDZ failure', async () => {
  const h = harness({ reducedMotion: true, withHost: false });
  assert.equal(await lockWithThreeRapidWrong(h), 'lock');
  assert.equal(h.elements.child.hidden, false);
  assert.equal(h.context.document.body.classList.contains('pa-rapid-locked'), true);
});

test('missing, rejected, and hanging Cikgu hooks all fall through to video and PIN', async t => {
  for (const [name, host] of [
    ['missing', undefined],
    ['rejected', { playRestuEntry: () => Promise.reject(new Error('texture failed')) }],
    ['hanging', { playRestuEntry: () => new Promise(() => {}) }]
  ]) t.test(name, async () => {
    const h = harness({ host, withHost: !!host });
    assert.equal(await lockWithThreeRapidWrong(h), 'lock');
    h.flush();
    await Promise.resolve();
    assert.equal(h.elements.video.played, true);
    h.triggerVideoEnd();
    assert.equal(h.elements.child.hidden, false);
  });
});

test('a cancelled entry cannot resume or advance a later lock', async () => {
  let resolveFirst;
  const h = harness({ host: {
    playRestuEntry: () => new Promise(resolve => { resolveFirst = resolve; }),
    cancelRestuEntry: () => { h.events.push('cancel'); }
  } });
  assert.equal(await lockWithThreeRapidWrong(h), 'lock');
  h.lock.cancel();
  resolveFirst?.({ cancelled: false });
  await Promise.resolve();
  assert.deepEqual(h.events, ['cancel']);
  assert.equal(h.elements.child.hidden, true, 'stale completion leaves the lock gated');
  assert.equal(h.elements.video.playCount, undefined, 'stale completion cannot start portal video');
});

test('replacing a lock cancels the old cinematic and only the new flow reaches video', async () => {
  let firstResolve, secondResolve, calls = 0;
  const h = harness({ host: {
    playRestuEntry: () => new Promise(resolve => {
      calls++;
      if (calls === 1) firstResolve = resolve; else secondResolve = resolve;
    }),
    cancelRestuEntry: () => h.events.push('cancel')
  } });
  h.lock.lock([item('first')]);
  h.lock.lock([item('second')]);
  firstResolve?.({ cancelled: false });
  await Promise.resolve();
  assert.equal(h.elements.video.playCount, undefined);
  secondResolve?.({ cancelled: false });
  await Promise.resolve();
  assert.equal(h.elements.video.playCount, 1);
  assert.equal(calls, 2);
});

test('profile replacement watchdog cancels the pending flow before PIN can open', async () => {
  const h = harness({ withHost: false });
  h.lock.lock([item('profile')]);
  h.context.db = {};
  h.flush();
  assert.equal(h.context.document.body.classList.contains('pa-rapid-locked'), false);
  h.elements.pinA.value = '1234';
  h.elements.pinA.dispatchEvent({ type: 'input' });
  assert.equal(h.elements.review.hidden, true);
});

test('parent resume continues the blocked run exactly once', async () => {
  const h = harness({ withHost: false });
  let continued = 0;
  h.lock.lock([item('manual')], () => { continued++; });
  h.triggerVideoEnd();
  h.elements.pinA.value = '1234';
  h.elements.pinA.dispatchEvent({ type: 'input' });
  h.elements.resume.dispatchEvent({ type: 'click' });
  h.elements.resume.dispatchEvent({ type: 'click' });
  assert.equal(continued, 1);
  assert.equal(h.context.document.body.classList.contains('pa-rapid-locked'), false);
});

test('real Restu stage preserves the close-up, left-facing dive and contact-gated FX', () => {
  const stage=realRestuFrameFixture();
  stage.frame(0);
  assert.equal(stage.state.camZoom,3.55);
  assert.equal(stage.fx.visible,false);
  stage.frame(1249);
  assert.equal(stage.mesh.scale.x,-stage.data.fall.w);
  assert.equal(stage.fx.visible,false);
  assert.ok(Math.abs(stage.state.camZoom-1.14)<1e-9);
  stage.frame(1250);
  assert.equal(stage.mesh.scale.x,-stage.data.preland.w);
  assert.equal(stage.fx.visible,true);
  stage.frame(1500);
  assert.equal(stage.mesh.material.map,stage.data.land.tex);
  assert.equal(stage.mesh.position.y,-1.92+stage.data.land.offY);
  stage.frame(3000);
  assert.equal(stage.state.camZoom,1);
});

test('real PASegelHost.resumeAfterRestu restores retry state without regenerating the question', async () => {
  const sourceText = fs.readFileSync(require.resolve('../js/segel-demo-v2.1.0.js'), 'utf8');
  const method = extractArrowMethod(sourceText, 'resumeAfterRestu');
  const q = { token: 'q-keep', prompt: '7 × 8 = ?', answer: 56 };
  const run = {
    production: true, locked: true, retryOpen: false, q,
    productionRun: { session: { retryState: { wrongValue: '49' } } }
  };
  let resumed = 0, controls = 0, typed = 0;
  const sandbox = { run, stage: { resume: () => { resumed++; } }, unlockGuestRetryControls: () => { controls++; }, setTypedRetryEnabled: () => { typed++; } };
  vm.runInNewContext(`const fn=${method}; this.call=fn;`, sandbox);
  await sandbox.call();
  assert.equal(resumed, 1);
  assert.equal(run.locked, false);
  assert.equal(run.retryOpen, true);
  assert.strictEqual(run.q, q);
  assert.equal(controls, 1);
  assert.equal(typed, 1);
  assert.deepEqual(q, { token: 'q-keep', prompt: '7 × 8 = ?', answer: 56 });
});

test('real respondProduction returns while Portal Restu is locked', async () => {
  const sourceText = fs.readFileSync(require.resolve('../js/segel-demo-v2.1.0.js'), 'utf8');
  const respond = extractFunction(sourceText, 'respondProduction');
  const q = { token: 'q-gated', answer: 56 };
  const run = { locked: false, retryOpen: false, q, asked: 0, tally: { own: 0, hint: 0, miss: 0 } };
  let firstWrong = 0, resolved = 0;
  const sandbox = {
    run, window: { PARapidLock: { isLocked: () => true }, PAProductionJourney: { firstWrong: () => { firstWrong++; }, resolve: () => { resolved++; } } },
    markWrongAnswer() { throw new Error('locked response reached markWrongAnswer'); }
  };
  vm.runInNewContext(`const fn=${respond}; this.call=fn;`, sandbox);
  await sandbox.call({ tag: 'wrong', v: '49' }, { classList: { add() {} } });
  assert.equal(firstWrong, 0);
  assert.equal(resolved, 0);
  assert.equal(run.locked, false);
  assert.equal(run.retryOpen, false);
  assert.equal(run.asked, 0);
  assert.deepEqual(run.tally, { own: 0, hint: 0, miss: 0 });
});
