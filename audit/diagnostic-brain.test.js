const test = require('node:test');
const assert = require('node:assert/strict');
const B = require('../js/engine/diagnostic-brain-v1.js');

const NOW = Date.UTC(2026, 9, 21, 4);
const DAY = 864e5;
let seq = 0;
function rec(over) { seq++; return { t: NOW - (seq % 5) * DAY / 2, s: 'D3.MUL', o: 'mul', c: 'plain', f: 'symbolic', k: 1, sec: 2, w: 4, ...over }; }
const many = (n, fn) => Array.from({ length: n }, (_, i) => fn(i));

test('facets: basic multiplication fact gives op and both tables', () => {
  const f = B.facets({ prompt: '<b>7 × 8</b> = ?', skill: 'D3.MUL' }, { domain: 'Operasi', title: 'Darab' });
  assert.equal(f.op, 'mul'); assert.deepEqual(f.tables, [7, 8]); assert.deepEqual(f.operands, [7, 8]); assert.equal(f.format, 'symbolic');
});

test('facets: explicit generator facets win (bentuk lazim)', () => {
  const f = B.facets({ prompt: '52 − 38 = ?', contextId: 'written-arithmetic', facets: { op: 'sub', operands: [52, 38], format: 'lazim' } }, { domain: 'Operasi' });
  assert.equal(f.format, 'lazim'); assert.equal(f.op, 'sub'); assert.deepEqual(f.operands, [52, 38]);
});

test('facets: money word problem uses domain, archetype and word format', () => {
  const f = B.facets({ prompt: 'Ali ada RM20. Dia membeli buku berharga RM7. Berapakah baki wang Ali sekarang?', archetypeId: 'money_sub', representation: 'story' }, { domain: 'Wang', title: 'Tolak wang' });
  assert.equal(f.context, 'money'); assert.equal(f.op, 'sub'); assert.equal(f.format, 'word');
});

test('record keeps the first attempt and adds the retry outcome to the same item', () => {
  let log = B.applyResponse([], { q: { token: 'q1', prompt: '7 × 8 = ?', skill: 'D3.MUL' }, ok: false, sec: 3.2, mode: 'gembok-first-attempt', value: 49, at: NOW });
  log = B.applyResponse(log, { q: { token: 'q1', prompt: '7 × 8 = ?', skill: 'D3.MUL' }, ok: true, sec: 6, mode: 'gembok-retry', value: 56, at: NOW });
  assert.equal(log.length, 1); assert.equal(log[0].k, 0); assert.equal(log[0].v, '49'); assert.equal(log[0].r, 1);
  log = B.applyResponse(log, { q: { token: 'q2', prompt: '6 × 6 = ?' }, ok: true, sec: 1.4, mode: 'gembok', at: NOW });
  assert.equal(log.length, 2); assert.equal(log[1].k, 1);
});

test('too little evidence produces no findings', () => {
  const r = B.analyze(many(4, () => rec({ k: 0, tb: [7] })), { now: NOW });
  assert.equal(r.enough, false); assert.equal(r.findings.length, 0);
});

test('fact fluency names the weak and slow tables, and praises fluent ones', () => {
  const log = [
    ...many(10, i => rec({ tb: [7], k: i < 5 ? 1 : 0, sec: 5, v: '1' })),           // sifir 7: 5/10
    ...many(10, () => rec({ tb: [3], k: 1, sec: 6 })),                              // sifir 3: right but slow
    ...many(10, () => rec({ tb: [2], k: 1, sec: 1.9 })), ...many(10, () => rec({ tb: [5], k: 1, sec: 2.2 })), ...many(10, () => rec({ tb: [10], k: 1, sec: 2 }))
  ];
  const r = B.analyze(log, { now: NOW, name: 'Aisyah' });
  const f = r.findings.find(x => x.id === 'fact_fluency');
  assert.ok(f, JSON.stringify(r.findings));
  assert.match(f.text, /Hebat dalam sifir 2, 5 dan 10/);
  assert.match(f.text, /sifir 7 belum dikuasai \(5\/10 betul\)/);
  assert.match(f.text, /sifir 3 betul tetapi lambat/);
  assert.deepEqual(f.target.tables, [7, 3]);
  assert.match(f.action, /sifir 7 dan 3/);
});

test('money weakness points at subtraction when most money errors are subtraction', () => {
  const log = [
    ...many(8, () => rec({ s: 'D3.MONEY', c: 'money', o: 'sub', k: 0, sec: 8, w: 20, f: 'word' })),
    ...many(2, () => rec({ s: 'D3.MONEY', c: 'money', o: 'sub', k: 1, sec: 9, w: 20, f: 'word' })),
    ...many(4, () => rec({ s: 'D3.MONEY', c: 'money', o: 'add', k: 1, sec: 8, w: 20, f: 'word' })),
    ...many(1, () => rec({ s: 'D3.MONEY', c: 'money', o: 'add', k: 0, sec: 8, w: 20, f: 'word' }))
  ];
  const f = B.analyze(log, { now: NOW }).findings.find(x => x.id === 'context_money');
  assert.ok(f); assert.match(f.text, /^Wang: 40% betul \(6\/15\), dan hampir semua kesilapan melibatkan operasi tolak\.$/);
  assert.match(f.action, /operasi tolak dalam soalan wang/); assert.equal(f.target.op, 'sub');
});

test('bentuk lazim strong but word problems weak is reported', () => {
  const log = [
    ...many(8, () => rec({ s: 'D3.SUB10000', o: 'sub', f: 'lazim', k: 1, sec: 9 })),
    ...many(8, (i) => rec({ s: 'D3.SUB10000', o: 'sub', f: 'word', k: i < 3 ? 1 : 0, sec: 14, w: 25 }))
  ];
  const f = B.analyze(log, { now: NOW, name: 'Adam' }).findings.find(x => x.id === 'format_word');
  assert.ok(f); assert.match(f.text, /bentuk lazim hampir semua betul \(100%\).*Adam keliru bila soalan dalam ayat \(38%\)/);
});

test('rapid wrong answers are flagged as guessing and excluded from ability evidence', () => {
  const log = [
    ...many(8, () => rec({ tb: [6], k: 0, sec: 0.8, w: 4 })),
    ...many(10, () => rec({ tb: [6], k: 1, sec: 2 })),
    ...many(2, () => rec({ tb: [6], k: 0, sec: 6 }))
  ];
  const r = B.analyze(log, { now: NOW });
  assert.ok(r.findings.some(x => x.id === 'rapid_guess'));
  // 10/12 non-rapid answers right: sifir 6 must not be called weak because of guesses
  assert.ok(!r.findings.some(x => x.id === 'fact_fluency' && /sifir 6 belum/.test(x.text)));
});

test('systematic smaller-from-larger subtraction bug is detected across different items', () => {
  const pairs = [[52, 38], [71, 46], [83, 27], [64, 19]];
  const log = [
    ...pairs.map(([a, b]) => { const v = Number(String(Math.abs(Math.floor(a / 10) - Math.floor(b / 10))) + String(Math.abs(a % 10 - b % 10))); return rec({ s: 'D2.2.2', o: 'sub', a: [a, b], k: 0, v: String(v), sec: 9 }); }),
    ...many(4, () => rec({ s: 'D2.2.2', o: 'sub', k: 1, sec: 9 }))
  ];
  assert.equal(B.detectBug(log[0]), 'smaller_from_larger');
  const f = B.analyze(log, { now: NOW }).findings.find(x => x.id === 'bug_smaller_from_larger');
  assert.ok(f); assert.match(f.text, /tanpa meminjam \(4 kali, contoh 64 − 19 jadi 55\)/);
});

test('times-table neighbour answers and wrong operation are recognised', () => {
  assert.equal(B.detectBug({ o: 'mul', a: [7, 8], v: '49' }), 'times_neighbour');
  assert.equal(B.detectBug({ o: 'sub', a: [45, 12], v: '57' }), 'wrong_operation');
  assert.equal(B.detectBug({ o: 'sub', a: [45, 12], v: '30' }), null);
});

test('old records outside the 30-day window are ignored', () => {
  const log = many(12, () => ({ ...rec({ tb: [7], k: 0, sec: 5 }), t: NOW - 40 * DAY }));
  assert.equal(B.analyze(log, { now: NOW }).enough, false);
});

test('parent card shows findings, actions and evidence note; escapes names', () => {
  const log = many(10, i => rec({ tb: [7], k: i < 4 ? 1 : 0, sec: 5 }));
  const html = B.cardMarkup(B.analyze(log, { now: NOW, name: '<Ali>' }));
  assert.match(html, /Ringkasan/); assert.match(html, /Apa Pahlawan Angka akan buat/); assert.match(html, /&lt;Ali&gt;/); assert.doesNotMatch(html, /<Ali>/);
  const early = B.cardMarkup(B.analyze([], { now: NOW, name: 'Ali' }));
  assert.match(early, /Bukti awal/);
});
