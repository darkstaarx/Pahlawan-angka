// Lens 4.1 Representation (Concrete–Pictorial–Abstract), docs/PA-DIAGNOSTIC-BRAIN.md §4.1:
// the same skill and operation is right with a picture or blocks and wrong with numbers only.
// Browser side (Gudang Harta "kurangkan gambar"): minigame-targets-browser.test.js.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const B = require('../js/engine/diagnostic-brain-v1.js');
const T = require('../js/engine/diagnostic-targets-v1.js');
const R = require('../js/engine/diagnostic-recheck-v1.js');

const NOW = Date.UTC(2026, 9, 21, 4);
const many = (n, fn) => Array.from({ length: n }, (_, i) => fn(i));
// A record as the brain stores it; rp = c | p | a.
const rec = (i, over) => ({ t: NOW - (i + 1) * 6e5, s: 'D2.2.1', o: 'add', c: 'plain', f: 'symbolic', k: 1, sec: 7, w: 6, ...over });
// pictorial right `picOk`/10, numbers-only right `absOk`/10
const cpaLog = (picOk, absOk, over = {}) => [
  ...many(10, i => rec(i, { rp: 'p', f: 'visual', k: i < picOk ? 1 : 0, ...over })),
  ...many(10, i => rec(i + 10, { rp: 'a', k: i < absOk ? 1 : 0, ...over }))];

test('facets: picture, blocks, numbers only; data tables and unknown mini game rounds stay unknown', () => {
  const rep = (q, meta) => B.facets(q, meta).rep;
  assert.equal(rep({ prompt: 'Berapakah bilangan objek? <svg></svg>', skill: 'D1.N20' }), 'pictorial');
  assert.equal(rep({ prompt: 'Kira.', representation: 'visual' }), 'pictorial');
  assert.equal(rep({ prompt: 'Susun blok.', representation: 'manipulative' }), 'concrete');
  assert.equal(rep({ prompt: '7 + 5 = ?', representation: 'symbolic' }), 'abstract');
  assert.equal(rep({ prompt: 'Ali ada 7 guli. Dia dapat 5 lagi. Berapakah semuanya?', representation: 'story' }), 'abstract');
  assert.equal(rep({ prompt: '<table></table> Berapakah jumlah?', representation: 'table' }), null);
  assert.equal(rep({ prompt: '7 + 5', archetypeId: 'minigame_gudang-harta' }), null, 'a mini game must say it');
  assert.equal(rep({ prompt: '7 + 5', archetypeId: 'minigame_gudang-harta', facets: { rep: 'concrete' } }), 'concrete');
  const log = B.applyResponse([], { q: { token: 'q', prompt: '<svg></svg> 3 + 4 = ?', skill: 'D1.ADD20' }, ok: true, sec: 5, mode: 'gembok', at: NOW });
  assert.equal(log[0].rp, 'p');
});

test('right with a picture (8/10), wrong with numbers only (3/10): finding with both scores and a fading target', () => {
  const r = B.analyze(cpaLog(8, 3), { now: NOW, name: 'Hana' });
  const f = r.findings.find(x => x.id === 'rep_cpa');
  assert.ok(f, JSON.stringify(r.findings.map(x => x.id)));
  assert.equal(f.lens, '4.1');
  assert.match(f.text, /Hana mudah jawab bila ada gambar \(8\/10 betul\), tetapi tanpa gambar hanya 3\/10\./);
  assert.deepEqual(f.target, { rep: 'fade', skill: 'D2.2.1', op: 'add' });
  assert.deepEqual(f.skills, ['D2.2.1']);
  assert.match(f.action, /kurangkan gambar/);
});

test('no finding below the rule: small gap, too few items, guesses, or different operations', () => {
  const none = log => !B.analyze(log, { now: NOW }).findings.some(x => x.id === 'rep_cpa');
  assert.ok(none(cpaLog(8, 6)), 'gap 20 < 25');
  assert.ok(none(cpaLog(8, 3).filter((r, i) => r.rp === 'p' || i < 15)), 'only 5 numbers-only items');
  // Wrong numbers-only answers given in under a second are guesses (lens 4.5), not CPA evidence.
  assert.ok(none(cpaLog(8, 3).map(r => r.rp === 'a' && r.k === 0 ? { ...r, sec: 0.6 } : r)), 'guesses');
  // Pictures with addition, numbers only with subtraction: not the same question.
  assert.ok(none(cpaLog(8, 3).map(r => r.rp === 'a' ? { ...r, o: 'sub' } : r)), 'different operation');
});

test('a weak sifir explains it: arrays right, recall wrong is fact fluency, not CPA', () => {
  const log = [
    ...many(10, i => rec(i, { s: 'D3.MUL', o: 'mul', rp: 'p', f: 'visual', tb: [7], a: [3, 7], k: 1 })),
    ...many(10, i => rec(i + 10, { s: 'D3.MUL', o: 'mul', rp: 'a', tb: [7], a: [7, 6], k: i < 2 ? 1 : 0, v: '48' }))];
  const ids = B.analyze(log, { now: NOW }).findings.map(x => x.id);
  assert.ok(ids.includes('fact_fluency'), ids.join());
  assert.ok(!ids.includes('rep_cpa'), ids.join());
});

test('plan: "Dari gambar ke nombor" card on the evidence skill, the mini game fades, the worksheet skips it', () => {
  const p = T.plan(B.analyze(cpaLog(8, 3), { now: NOW }), { grade: 2 });
  const step = p.steps.find(s => s.target.kind === 'fade');
  assert.equal(step.card, 'Dari gambar ke nombor');
  assert.equal(T.skillFor(step, [{ id: 'D2.2.1', domain: 'Operasi', title: 'Tambah' }]), 'D2.2.1');
  assert.deepEqual(T.miniGameTarget(step), { kind: 'fade' });
  assert.deepEqual(T.worksheet(p).sections, []);
  assert.deepEqual(T.worksheetItems(p).items, []);
  // Re-check loop: numbers-only answers of the same skill and operation.
  const m = R.matcher(step);
  assert.equal(m.key, 'fade:D2.2.1:add');
  assert.equal(m.test({ s: 'D2.2.1', o: 'add', rp: 'a' }), true);
  assert.equal(m.test({ s: 'D2.2.1', o: 'add', rp: 'p' }), false);
  assert.equal(m.test({ s: 'D2.2.2', o: 'add', rp: 'a' }), false);
});

test('mini game rounds say what they showed (rep), with or without an exact sum', () => {
  const listeners = [], child = {}, profile = { diagLog: [] };
  const c = { console, Math, Date, Set, Map, db: profile, location: { origin: 'https://pa.test' },
    document: { querySelectorAll: () => [{ contentWindow: child }] }, addEventListener: (t, f) => listeners.push(f) };
  c.window = c; c.globalThis = c; vm.createContext(c);
  vm.runInContext(fs.readFileSync('js/engine/diagnostic-brain-v1.js', 'utf8'), c);
  c.PATelemetry = { response: (...a) => c.PADiagnostic.record(...a) };
  vm.runInContext(fs.readFileSync('js/minigame-telemetry-v1.js', 'utf8'), c);
  const send = (key, facets) => listeners.forEach(f => f({ data: { type: 'PA_MINIGAME_ATTEMPT', version: 1, game: 'gudang-harta', skillId: 'D2.2.1', key, prompt: 'Susun harta.', answer: '45', ok: true, first: true, hints: 0, ms: 8000, facets }, source: child, origin: 'https://pa.test' }));
  send('r1', { rep: 'concrete' });
  send('r2', { op: 'add', operands: [17, 28], rep: 'abstract' });
  send('r3', { rep: 'drawing' });
  assert.deepEqual(profile.diagLog.map(r => r.rp ?? null), ['c', 'a', null]);
  assert.deepEqual([...profile.diagLog[1].a], [17, 28]);   // array from another VM realm
});

test('dummy child Hana: week 1 finds the picture gap, practising numbers-only addition closes it', () => {
  const S = require('../tools/diagnostic-sim.js');
  const r = S.simulate('hana');
  const f = r.week1.findings.find(x => x.id === 'rep_cpa');
  assert.ok(f && f.target.skill === 'D2.2.1', JSON.stringify(r.week1.findings.map(x => x.id)));
  assert.equal(r.plan.steps[0].card, 'Dari gambar ke nombor');
  const after = r.week2.findings.find(x => x.id === 'rep_cpa');
  assert.ok(!after || !after.evidence.gaps.some(g => g.skill === 'D2.2.1'), 'addition gap closed after practice');
  for (const id of ['aisyah', 'adam', 'mei']) assert.ok(!S.simulate(id).week1.findings.some(x => x.id === 'rep_cpa'), id);
});
