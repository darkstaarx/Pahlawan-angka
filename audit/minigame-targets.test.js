// Kemahiran Fokus cards open mini games; a brain-backed card tells the game what
// to drill, and the game's answers come back to the brain with exact facets.
// (docs/PA-DIAGNOSTIC-BRAIN.md §8a, Next 3; browser side: minigame-targets-browser.test.js)
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const T = require('../js/engine/diagnostic-targets-v1.js');
const S = require('../tools/diagnostic-sim.js');

const GRAPH = JSON.parse(fs.readFileSync('data/kssr/knowledge-graph.json', 'utf8'));
const META = Object.fromEntries(GRAPH.skills.map(m => [m.id, m]));
const load = (c, file) => vm.runInContext(fs.readFileSync(file, 'utf8'), c, { filename: file });
const plain = x => JSON.parse(JSON.stringify(x));      // records live in another VM realm

test('plan steps map to what the mini game drills', () => {
  const mg = target => T.miniGameTarget({ target });
  assert.deepEqual(mg({ kind: 'tables', tables: [7, 3] }), { kind: 'tables', tables: [7, 3] });
  assert.deepEqual(mg({ kind: 'review', review: ['sifir 6', 'tambah asas'] }), { kind: 'tables', tables: [6] });
  assert.deepEqual(mg({ kind: 'regroup', op: 'sub' }), { kind: 'regroup', op: 'sub', zero: false });
  assert.deepEqual(T.miniGameTarget({ finding: 'regroup_sub', also: ['bug_borrow_from_zero'], target: { kind: 'regroup', op: 'sub' } }), { kind: 'regroup', op: 'sub', zero: true });
  assert.deepEqual(mg({ kind: 'regroup', op: 'add' }), { kind: 'regroup', op: 'add', zero: false });
  assert.deepEqual(mg({ kind: 'money', op: 'sub' }), { kind: 'money', mode: 'baki' });
  assert.deepEqual(mg({ kind: 'word' }), { kind: 'bar' }, 'word problems: bar model rounds');
  for (const t of [{ kind: 'money', op: 'mixed' }, { kind: 'units' }, { kind: 'tables', tables: [] }]) assert.equal(mg(t), null, JSON.stringify(t));
});

test('a brain card hands its target to the mini game bridges; other cards hand nothing', () => {
  const profile = { name: 'Aisyah', schoolGrade: 3, diagLog: S.simulate('aisyah').log1 }, calls = [];
  const node = () => ({ classList: { add() {}, remove() {}, contains: () => false }, focus() {} });
  const c = { console, Math, Date, Set, Map, GRAPH, META, db: profile, questionBankFor: () => () => ({}),
    document: { getElementById: node, activeElement: null }, openGembok: o => calls.push(['gembok', o]) };
  c.PAWirayungLive = { tryStartFocus: (id, t) => (calls.push(['wirayung', id, t]), /MONEY/.test(id)) };
  c.PAFocusMiniGamesLive = { tryStartFocus: (id, t) => (calls.push(['minigame', id, t]), true) };
  c.window = c; c.globalThis = c; vm.createContext(c);
  load(c, 'js/engine/diagnostic-brain-v1.js'); load(c, 'js/engine/diagnostic-targets-v1.js'); load(c, 'js/guardian-focus.js');
  vm.runInContext('focusPickerProfile=db', c);
  const cards = c.PAFocusPractice.summary().items.map(x => x.id);
  assert.deepEqual(cards, ['D3.MUL', 'D3.MONEY', 'D3.SUB10000']);
  cards.forEach(id => c.PAFocusPractice.start(id));
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [
    ['wirayung', 'D3.MUL', { kind: 'tables', tables: [3] }], ['minigame', 'D3.MUL', { kind: 'tables', tables: [3] }],
    ['wirayung', 'D3.MONEY', { kind: 'money', mode: 'baki' }],
    ['wirayung', 'D3.SUB10000', { kind: 'regroup', op: 'sub', zero: false }], ['minigame', 'D3.SUB10000', { kind: 'regroup', op: 'sub', zero: false }]]);
  // A card without brain findings passes no target.
  calls.length = 0; profile.diagLog = [];
  profile.learnerReviewV1 = { encounters: [0, 1, 2, 3, 4].map(i => ({ skillId: 'D3.MUL', grade: 3, questionKey: 'k' + (i % 2), outcome: 'unresolved', mode: 'gembok' })) };
  c.PAFocusPractice.start('D3.MUL');
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [['wirayung', 'D3.MUL', null], ['minigame', 'D3.MUL', null]]);
});

function telemetry() {
  const listeners = [], child = {}, profile = { name: 'Aisyah', diagLog: [] };
  const c = { console, Math, Date, Set, Map, db: profile, location: { origin: 'https://pa.test' },
    document: { querySelectorAll: () => [{ contentWindow: child }] }, addEventListener: (t, f) => listeners.push(f) };
  c.window = c; c.globalThis = c; vm.createContext(c);
  load(c, 'js/engine/diagnostic-brain-v1.js');
  c.PATelemetry = { response: (...a) => c.PADiagnostic.record(...a) };       // same call as js/engine/telemetry.js
  load(c, 'js/minigame-telemetry-v1.js');
  const send = data => listeners.forEach(f => f({ data: { type: 'PA_MINIGAME_ATTEMPT', version: 1, game: 'gudang-harta', skillId: 'D3.SUB10000', hints: 0, ms: 9000, ...data }, source: child, origin: 'https://pa.test' }));
  return { c, profile, send };
}

test('mini game answers carry exact facets and the wrong value into the brain; bad facets are dropped', () => {
  const { c, profile, send } = telemetry();
  send({ key: 'n:1', prompt: 'Kira hasil tolak.', answer: '25', ok: false, first: true, value: '35', facets: { op: 'sub', operands: [52, 27], format: 'lazim' } });
  send({ key: 'n:1', prompt: 'Kira hasil tolak.', answer: '25', ok: true, first: false, facets: { op: 'sub', operands: [52, 27], format: 'lazim' } });
  const r = profile.diagLog[0];
  assert.deepEqual(plain([r.s, r.o, r.a, r.rg, r.k, r.r, r.v]), ['D3.SUB10000', 'sub', [52, 27], 1, 0, 1, '35']);
  assert.equal(c.PADiagnostic.detectBug(r), 'smaller_from_larger');
  send({ key: 'n:2', prompt: 'Kira hasil darab.', answer: '42', ok: true, first: true, facets: { op: 'mul', operands: [6, 7], table: 7 } });
  assert.deepEqual(plain(profile.diagLog[1].tb), [7]);
  send({ key: 'n:3', prompt: 'Kira hasil tolak.', answer: '3', ok: true, first: true, facets: { op: 'evil', operands: ['<x>', 1] } });
  send({ key: 'n:4', prompt: 'Kira hasil tolak.', answer: '3', ok: true, first: true, facets: { op: 'sub', operands: [5, '2'], table: 99, format: '<b>' } });
  assert.equal(profile.diagLog[2].o, 'none'); assert.equal(profile.diagLog[2].a, undefined);
  assert.equal(profile.diagLog[3].o, 'sub'); assert.equal(profile.diagLog[3].a, undefined); assert.equal(profile.diagLog[3].f, 'symbolic');
});

test('practising borrowing in the mini game clears the bug and the brain says "Semakin baik"', () => {
  const { c, profile, send } = telemetry();
  profile.diagLog = S.simulate('aisyah').log1.slice();
  assert.ok(c.PADiagnostic.analyze(profile.diagLog).findings.some(f => f.id === 'bug_smaller_from_larger'));
  const step = T.plan(c.PADiagnostic.analyze(profile.diagLog), { grade: 3 }).steps.find(s => s.finding === 'bug_smaller_from_larger');
  T.practice(step, 8, { grade: 3 }, 11).forEach((it, i) => send({ key: 'g:' + i, prompt: 'Kira hasil tolak.', answer: String(it.answer), ok: true, first: true, facets: it.facets }));
  const after = c.PADiagnostic.analyze(profile.diagLog);
  assert.ok(!after.findings.some(f => f.id === 'bug_smaller_from_larger'));
  assert.match(after.strengths.find(f => f.id === 'improved_smaller_from_larger')?.text || '', /^Semakin baik: /);
});
