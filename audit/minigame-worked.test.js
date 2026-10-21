// "Jom tengok cara" (js/minigame-worked-v1.js): the written method as tap-by-tap steps built from the
// round's own numbers. Browser side (Gudang Harta): minigame-targets-browser.test.js.
const test = require('node:test');
const assert = require('node:assert/strict');
const W = require('../js/minigame-worked-v1.js');

// Do every step right and read the answer row the steps write.
function answerOf(plan) {
  const row = {};
  for (const s of plan.steps) { const w = s.after?.write; if (w && w.digit !== null && w.digit !== undefined && !w.lead) row[w.col] = w.digit; }
  return Number(Object.keys(row).map(Number).sort((a, b) => b - a).map(c => row[c]).join('') || 0);
}

test('every step adds up to the real answer, for many sums of each kind', () => {
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  for (let i = 0; i < 400; i++) {
    const a = R(10, 99999), b = R(1, 99999), m = R(2, 9), d = R(2, 12);
    for (const [op, x, y, want] of [['add', a, b, a + b], ['sub', Math.max(a, b), Math.min(a, b), Math.abs(a - b)], ['mul', a, m, a * m], ['div', d * R(2, 999), d, null]]) {
      const plan = W.build(op, x, y);
      assert.ok(plan, `${op} ${x} ${y}`);
      assert.equal(answerOf(plan), want ?? Math.floor(x / y), `${op} ${x} ${y}`);
      for (const s of plan.steps.filter(s => s.kind === 'pick')) {
        assert.equal(s.choices.length, 3, s.say); assert.equal(new Set(s.choices).size, 3, s.say);
        assert.ok(s.choices.includes(s.right), s.say);
      }
    }
  }
});

test('carrying, borrowing through zero, a lone digit, and the slips a child makes', () => {
  const add = W.build('add', 478, 256);
  assert.deepEqual(add.steps.map(s => s.say), ['Tempat sa: 8 + 6 = ?', 'Tempat puluh: 7 + 5 + 1 = ?', 'Tempat ratus: 4 + 2 + 1 = ?']);
  assert.ok(add.steps[1].choices.includes(12), 'forgot the carried 1');
  const sub = W.build('sub', 503, 178);
  assert.equal(sub.steps[0].kind, 'borrow');
  assert.match(sub.steps[0].say, /Pinjam 1 dari tempat ratus \(melalui 0\)/);
  assert.deepEqual(sub.steps[0].after.borrow.map(x => [x.col, x.from, x.to]), [[2, 5, 4], [1, 0, 9]]);
  assert.deepEqual(W.build('add', 1234, 123).steps.at(-1), { kind: 'show', col: 3, say: 'Tempat ribu: hanya ada 1. 1 turun.', after: { write: { col: 3, digit: 1 }, note: 'Tulis 1.' } });
  assert.match(W.build('sub', 1002, 345).steps.at(-1).say, /0 di depan tidak ditulis/);
  assert.equal(W.build('mul', 23, 45), null, 'two-digit × two-digit: not a one-row method');
});

test('a story first asks for the number sentence; parse takes the round numbers or nothing', () => {
  const p = W.build('sub', 62000, 27345, { story: true });
  assert.equal(p.steps[0].sentence, true);
  assert.deepEqual(p.steps[0].choices.sort(), ['27 345 − 62 000', '62 000 + 27 345', '62 000 − 27 345'].sort());
  assert.equal(p.steps[0].right, '62 000 − 27 345');
  assert.deepEqual(W.parse({ a: '1 234 + 56 = 1 290.' }), { op: 'add', a: 1234, b: 56 });
  assert.deepEqual(W.parse({ fx: { op: 'sub', operands: [9, 4] } }), { op: 'sub', a: 9, b: 4 });
  assert.equal(W.parse({ a: 'Cari nombor antara 3 dan 9.' }), null);
});
