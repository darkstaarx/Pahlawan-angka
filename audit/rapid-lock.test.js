const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../js/rapid-lock-v1.js');

let n = 0;
const q = (prompt = '7 × 8 = ?') => ({ token: 't' + (++n), prompt, answer: 56 });
const fastWrong = (e, item = q()) => e.observe({ q: item, ok: false, sec: 0.9, firstAttempt: true, value: 49 });
const slowWrong = (e, item = q()) => e.observe({ q: item, ok: false, sec: 6, firstAttempt: true, value: 49 });
const right = (e, item = q()) => e.observe({ q: item, ok: true, sec: 2, firstAttempt: false });

test('floor follows reading length within 1.8–3.2 seconds', () => {
  assert.equal(L.floor({ prompt: '7 × 8 = ?' }), 1.8);
  assert.equal(L.floor({ prompt: 'x'.repeat(400) }), 3.2);
});

test('2 rapid wrongs warn, the 3rd locks with the three items for the parent', () => {
  const e = L.createEngine();
  assert.equal(fastWrong(e), null);
  assert.equal(fastWrong(e), 'warn');
  assert.equal(fastWrong(e), 'lock');
  assert.equal(e.lastItems.length, 3);
  assert.deepEqual(Object.keys(e.lastItems[0]).sort(), ['answer', 'correct', 'prompt', 'sec']);
  assert.equal(e.lastItems[0].answer, '49'); assert.equal(e.lastItems[0].correct, '56');
});

test('a correct first try resets the streak', () => {
  const e = L.createEngine();
  fastWrong(e); fastWrong(e); right(e);
  assert.equal(e.streak, 0);
  assert.equal(fastWrong(e), null);
});

test('a wrong answer with real thinking time resets the streak (no punishment for trying)', () => {
  const e = L.createEngine();
  fastWrong(e); fastWrong(e);
  assert.equal(slowWrong(e), null);
  assert.equal(e.streak, 0);
  assert.equal(e.hasLocked, false);
});

test('retry of an item already counted does not reset or add', () => {
  const e = L.createEngine();
  const a = q(); fastWrong(e, a);
  assert.equal(e.observe({ q: a, ok: true, sec: 3, firstAttempt: false }), null);
  assert.equal(e.streak, 1);
});

test('long questions get more time before a wrong counts as rapid', () => {
  const long = () => q('Ali ada RM20. Dia membeli sebuah buku berharga RM7 dan sebatang pen berharga RM2. Berapakah baki wang Ali?');
  const shortE = L.createEngine(), longE = L.createEngine();
  for (let i = 0; i < 3; i++) shortE.observe({ q: q(), ok: false, sec: 2.5, firstAttempt: true, value: 1 });
  assert.equal(shortE.streak, 0, '2.5 s on a short sum is real thinking time');
  longE.observe({ q: long(), ok: false, sec: 2.5, firstAttempt: true, value: 1 });
  assert.equal(longE.streak, 1, '2.5 s is too fast to read a long story problem');
});

test('only one lock per session; later rapid streaks only warn', () => {
  const e = L.createEngine();
  fastWrong(e); fastWrong(e); assert.equal(fastWrong(e), 'lock');
  fastWrong(e); fastWrong(e); assert.equal(fastWrong(e), 'warn');
});
