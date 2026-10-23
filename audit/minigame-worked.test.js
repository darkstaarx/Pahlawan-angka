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

test('place-value board: round, compare, place name, digit value end at the round answer', () => {
  const r = W.buildPV({ t: 'round', n: 5898, place: 2 });
  assert.deepEqual(r.steps.map(s => s.kind), ['tap', 'pick', 'pick']);
  assert.deepEqual([r.steps[0].row, r.steps[0].col, r.steps[1].say, r.answer], [0, 2, 'Digit 8: 5 atau lebih?', 6000]);
  assert.ok(r.steps[2].choices.includes('5900'), 'rounded at the wrong place');
  assert.equal(W.buildPV({ t: 'round', n: 4321, place: 1 }).answer, 4300);
  const c = W.buildPV({ t: 'compare', a: 4728, b: 4758, ask: 'small' });
  assert.deepEqual(c.steps.map(s => s.kind), ['show', 'tap', 'pick']);
  assert.deepEqual([c.steps[1].row, c.steps[1].col, c.answer], [1, 1, 4728], 'tap the bigger digit, answer the smaller number');
  assert.equal(W.buildPV({ t: 'compare', a: 95406, b: 15406, ask: 'symbol' }).answer, '>');
  assert.equal(W.buildPV({ t: 'compare', a: 312, b: 312, ask: 'symbol' }).answer, '=');
  assert.equal(W.buildPV({ t: 'compare', a: 1312, b: 999, ask: 'big' }).steps[0].say, 'Nombor mana ada lebih banyak digit? Tekan digit pertamanya.');
  const n = W.buildPV({ t: 'placeName', n: 38709, i: 0 });
  assert.deepEqual([n.hideHead, n.answer, n.steps[1].choices.length], [true, 'sa', 3]);
  const v = W.buildPV({ t: 'digitValue', n: 34470, i: 1 });
  assert.deepEqual([v.answer, v.steps.at(-1).right], [70, '70']);
  // Every pick has its right answer among distinct choices, over many numbers.
  for (let k = 0; k < 400; k++) {
    const x = 10 + ((k * 7919) % 99990), i = k % String(x).length;
    for (const spec of [{ t: 'round', n: x, place: Math.min(i, String(x).length - 2) }, { t: 'compare', a: x, b: x + (k % 3) * 10 ** (k % 4), ask: ['big', 'small', 'symbol'][k % 3] }, { t: 'digitValue', n: x, i }]) {
      const p = W.buildPV(spec); if (!p) continue;
      for (const s of p.steps.filter(s => s.kind === 'pick')) { assert.ok(s.choices.includes(s.right), JSON.stringify(spec)); assert.equal(new Set(s.choices).size, s.choices.length, JSON.stringify(spec)); }
    }
  }
  assert.equal(W.buildPV({ t: 'nope' }), null);
});

test('two steps: two boards left to right; a story asks for the whole sentence first', () => {
  const c = W.buildChain({ a: 3657, b: 417, d: 125, ops: ['sub', 'add'] }, { story: true });
  assert.deepEqual([c.mid, c.answer, c.chain[0].rows, c.chain[1].rows], [3240, 3365, [3657, 417], [3240, 125]]);
  assert.equal(c.chain[0].steps[0].right, '3657 − 417 + 125');
  assert.deepEqual([...c.chain[0].steps[0].choices].sort(), ['3657 + 417 − 125', '3657 − 417 + 125', '3657 − 417 − 125']);
  assert.equal(W.buildChain({ a: 900, b: 50, d: 70, ops: ['add', 'sub'] }).answer, 880);
  assert.equal(W.buildChain({ a: 10, b: 50, d: 1, ops: ['sub', 'add'] }), null, 'a negative first step');
});

test('patterns, compose and the missing part: steps end at the answer', () => {
  const s = W.buildSeq({ t: 'seq', list: [254, 255, 256, 257, 258], k: 2 });
  assert.deepEqual([s.answer, s.items[2], s.steps.map(x => x.right)], [256, null, ['Bertambah', '1', '256']]);
  assert.deepEqual(s.steps[0].pre.pair, [3, 4], 'a known pair next to the gap');
  const back = W.buildSeq({ t: 'seq', list: [50, 45, 40, 35, 30], k: 0 });
  assert.deepEqual([back.answer, back.steps[2].right], [50, '50'], 'the first box: go back from the next one');
  assert.equal(W.buildSeq({ t: 'seq', list: [1, 2, 4], k: 2 }), null, 'not a constant step');
  const a = W.buildSeq({ t: 'apply', s0: 140, st: -10, n: 3 });
  assert.deepEqual([a.answer, a.steps.map(x => x.right)], [110, ['130', '120', '110']]);
  const c = W.buildPV({ t: 'compose', n: 54030 });
  assert.deepEqual(c.steps.map(x => x.kind), ['tap', 'tap', 'show', 'tap', 'show']);
  assert.equal(c.answer, 54030);
  const m = W.buildPV({ t: 'missingPart', n: 1138, i: 2 });
  assert.deepEqual([m.answer, [...m.steps[0].pre.same].sort(), m.steps[1].right], [100, [0, 1, 3], '100']);
  // Three numbers: two boards.
  assert.equal(W.buildChain({ a: 320, b: 219, d: 129, ops: ['add', 'add'] }).answer, 668);
  assert.equal(W.buildChain({ a: 439, b: 96, d: 139, ops: ['sub', 'sub'] }).answer, 204);
});

test('order, words and expanded: per step, then the round\'s own choices', () => {
  const fin = { choices: ['4360, 5360, 5362, 5460', '5460, 5362, 5360, 4360'], right: '4360, 5360, 5362, 5460' };
  const o = W.buildPV({ t: 'order', list: [5360, 5362, 5460, 4360] }, { final: fin });
  assert.deepEqual(o.steps.filter(s => s.kind === 'tap').map(s => [s.row, s.pre.diff]), [[3, 3], [0, 2], [1, 2]], 'smallest each time, at the first place that differs');
  assert.deepEqual([o.steps.at(-1).right, o.finalLabel], [fin.right, fin.right]);
  assert.equal(W.buildPV({ t: 'order', list: [1, 1, 2] }), null, 'equal numbers');
  const w = W.buildPV({ t: 'toWords', n: 51013 });
  assert.deepEqual(w.steps.map(s => s.right), ['lima puluh satu ribu', 'tiga belas']);
  for (let n = 1; n < 100000; n += 37) {
    const p = W.buildPV({ t: 'toWords', n });
    for (const s of p.steps) { assert.ok(s.choices.includes(s.right), n); assert.equal(new Set(s.choices).size, s.choices.length, n); assert.ok(!s.choices.some(c => /^satu (ratus|puluh|ribu)/.test(c)), n + ' ' + s.choices); }   // seratus, sepuluh, seribu
    assert.equal(p.steps.map(s => s.right).join(' '), p.done.match(/“(.*)”/)[1], n);
  }
  const f = W.buildPV({ t: 'fromWords', n: 3801 });
  assert.deepEqual(f.steps.map(s => s.kind), ['tap', 'tap', 'show', 'tap']);
  assert.match(f.steps[0].say, /^“tiga ribu”/);
  const e = W.buildPV({ t: 'expanded', n: 969 });
  assert.deepEqual(e.steps.map(s => s.right), ['900', '60', '9']);
});
