// Lens 4.6 Strategy choice (interleaving), docs/PA-DIAGNOSTIC-BRAIN.md §4.6: word problems are right when
// the same operation comes in a row (blocked) and wrong when the operations are mixed.
// Browser side (Gudang Harta "soalan bercampur"): minigame-targets-browser.test.js.
const test = require('node:test');
const assert = require('node:assert/strict');
const B = require('../js/engine/diagnostic-brain-v1.js');
const T = require('../js/engine/diagnostic-targets-v1.js');
const R = require('../js/engine/diagnostic-recheck-v1.js');

const NOW = Date.UTC(2026, 9, 21, 4);
const many = (n, fn) => Array.from({ length: n }, (_, i) => fn(i));
// A story record as the brain stores it; il = 0 blocked, 1 mixed.
const rec = (i, over) => ({ t: NOW - (i + 1) * 6e5, s: 'D4.SUB', o: 'sub', c: 'plain', f: 'word', k: 1, sec: 14, w: 12, ...over });
const runLog = (blockedOk, mixedOk, over = {}) => [
  ...many(10, i => rec(i, { il: 0, k: i < blockedOk ? 1 : 0, ...over })),
  ...many(10, i => rec(i + 10, { il: 1, o: ['add', 'sub', 'mul', 'div'][i % 4], k: i < mixedOk ? 1 : 0, ...over }))];

test('each answer says whether the two answers before had the same operation (blocked) or not (mixed)', () => {
  const story = (token, op) => ({ token, prompt: 'Cerita.', skill: 'D4.SUB', facets: { op, format: 'word', operands: [900, 300] } });
  let log = [];
  const add = (token, op, at, extra = {}) => { log = B.applyResponse(log, { q: { ...story(token, op), ...extra }, ok: true, sec: 9, mode: 'gembok', at }); return log.at(-1).il; };
  assert.equal(add('a', 'sub', NOW), undefined, 'nothing before it');
  assert.equal(add('b', 'sub', NOW + 6e4), undefined, 'only one answer before it');
  assert.equal(add('c', 'sub', NOW + 12e4), 0, 'sub after sub, sub');
  assert.equal(add('d', 'add', NOW + 18e4), 1, 'add after sub, sub');
  assert.equal(add('e', 'add', NOW + 24e4), 1, 'add after add, sub');
  assert.equal(add('f', 'add', NOW + 30e4), 0);
  assert.equal(add('g', 'sub', NOW + 60 * 6e4), undefined, 'a new sitting starts again');
  const explicit = { facets: { op: 'sub', format: 'word', interleaved: true } };
  assert.equal(add('h', 'sub', NOW + 61 * 6e4, explicit), 1, 'a page that knows its run wins');
});

test('blocked 10/10, mixed 3/10: a strategy finding that replaces 4.4 and the wrong-operation bug', () => {
  const r = B.analyze(runLog(10, 3), { now: NOW, name: 'Faris' });
  const f = r.findings.find(x => x.id === 'strategy_choice');
  assert.ok(f, JSON.stringify(r.findings.map(x => x.id)));
  assert.equal(f.lens, '4.6');
  assert.match(f.text, /^Faris tahu cara kira, tetapi keliru memilih operasi bila soalan bercampur\. Soalan cerita dengan operasi yang sama berturut-turut betul 10\/10, tetapi bila tambah, tolak, darab dan bahagi bercampur hanya 3\/10\.$/);
  // Wrong mixed answers that used the other operation (e.g. 900 + 300 for 900 − 300) support it.
  const op = runLog(10, 3).map(x => x.il === 1 && x.k === 0 ? { ...x, o: 'sub', a: [900, 300], v: '1200', x: '600' } : x);
  const lazim = many(10, i => rec(i + 30, { f: 'lazim', w: 4, sec: 8, il: undefined }));
  const both = B.analyze([...op, ...lazim], { now: NOW, name: 'Faris' }).findings;
  const g = both.find(x => x.id === 'strategy_choice');
  assert.match(g.text, / 7 kali Faris guna operasi yang salah\.$/);
  assert.equal(g.confidence, 'tinggi');
  assert.ok(!both.some(x => x.id === 'format_word' || x.id === 'bug_wrong_operation'), both.map(x => x.id).join());
});

test('no finding below the rule, for symbolic items, or when something else explains the mixed misses', () => {
  const none = log => !B.analyze(log, { now: NOW }).findings.some(x => x.id === 'strategy_choice');
  assert.ok(none(runLog(10, 6)), 'mixed 60% > 55%');
  assert.ok(none(runLog(7, 2)), 'blocked 70% < 80%');
  assert.ok(none(runLog(10, 3).filter((r, i) => r.il === 0 || i < 15)), 'only 5 mixed answers');
  assert.ok(none(runLog(10, 3, { f: 'symbolic' })), 'the sign is shown: no choice to make');
  // Wrong mixed answers in under a second are guesses (lens 4.5).
  assert.ok(none(runLog(10, 3).map(r => r.il === 1 && r.k === 0 ? { ...r, sec: 0.6 } : r)), 'guesses');
  // The mixed misses are all sifir 7, and sifir 7 is weak (4.2): that is the cause.
  const sifir = [...runLog(10, 3).map(r => r.il === 1 && r.k === 0 ? { ...r, o: 'mul', tb: [7] } : r),
    ...many(10, i => rec(i + 40, { f: 'symbolic', o: 'mul', tb: [7], a: [7, 6], k: i < 3 ? 1 : 0, v: '48' }))];
  assert.ok(B.analyze(sifir, { now: NOW }).findings.some(x => x.id === 'fact_fluency'));
  assert.ok(none(sifir), 'weak sifir explains it');
});

test('plan: "Soalan bercampur" card, Gudang choose rounds, a mixed worksheet, re-check on mixed stories', () => {
  const p = T.plan(B.analyze(runLog(10, 3), { now: NOW }), { grade: 4 });
  const step = p.steps.find(s => s.target.kind === 'choose');
  assert.equal(step.card, 'Soalan bercampur: pilih operasi');
  assert.equal(T.skillFor(step, [{ id: 'D4.SUB', domain: 'Operasi', title: 'Tolak' }]), 'D4.SUB');
  assert.deepEqual(T.miniGameTarget(step), { kind: 'choose' });
  const items = T.practice(step, 12, { grade: 4 }, 5), ops = items.map(x => x.facets.op);
  assert.ok(ops.every((o, i) => i === 0 || o !== ops[i - 1]), 'never the same operation twice in a row: ' + ops.join());
  assert.deepEqual([...new Set(ops)].sort(), ['add', 'div', 'mul', 'sub']);
  for (const it of items) {
    assert.equal(it.facets.interleaved, true);
    assert.equal(it.choices.filter(c => String(c.v) === String(it.answer)).length, 1, it.prompt);
  }
  const ws = T.worksheetItems(p, 10, { grade: 4 }, 3);
  assert.ok(ws.items.length >= 6 && ws.items.every(x => x.showWorking && x.solution), JSON.stringify(ws.items[0]));
  const m = R.matcher(step);
  assert.equal(m.key, 'choose');
  assert.deepEqual([m.test({ f: 'word', il: 1 }), m.test({ f: 'word', il: 0 }), m.test({ f: 'symbolic', il: 1 })], [true, false, false]);
});

test('dummy child Faris: week 1 finds the mixed-set gap, practising mixed sets closes it', () => {
  const S = require('../tools/diagnostic-sim.js');
  const r = S.simulate('faris');
  assert.deepEqual(r.week1.findings.map(x => x.id), ['strategy_choice']);
  assert.equal(r.plan.steps[0].card, 'Soalan bercampur: pilih operasi');
  assert.ok(!r.week2.findings.some(x => x.id === 'strategy_choice'), JSON.stringify(r.week2.findings.map(x => x.text)));
  for (const id of Object.keys(S.PERSONAS).filter(x => x !== 'faris')) assert.ok(!S.simulate(id).week1.findings.some(x => x.id === 'strategy_choice'), id);
});
