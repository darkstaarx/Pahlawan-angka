// Kemahiran Fokus cards follow the Diagnostic Brain (docs/PA-DIAGNOSTIC-BRAIN.md §8a, Next 1).
// Runs the real focusPracticeSummary() with the real KSSR graph, brain and targets.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const B = require('../js/engine/diagnostic-brain-v1.js');
const T = require('../js/engine/diagnostic-targets-v1.js');
const S = require('../tools/diagnostic-sim.js');

const GRAPH = JSON.parse(fs.readFileSync('data/kssr/knowledge-graph.json', 'utf8'));
const source = fs.readFileSync('js/guardian-focus.js', 'utf8');
const summarySource = source.slice(0, source.indexOf('let focusPickerProfile'));
const plain = x => JSON.parse(JSON.stringify(x));
function summary(profile, { brain = true } = {}) {
  const c = { GRAPH, questionBankFor: () => () => ({}) };
  if (brain) { c.PADiagnostic = B; c.PATargets = T; }
  vm.createContext(c); vm.runInContext(summarySource, c);
  return plain(c.focusPracticeSummary(profile));
}

// Money word problems on one skill: subtraction mostly wrong, addition right.
function moneyLog(skill, now = Date.now()) {
  let log = [];
  for (let i = 0; i < 14; i++) {
    const sub = i < 10, ok = sub ? i < 2 : true, ans = `RM${(3 + i * .1).toFixed(2)}`;
    const q = { token: `m${i}`, skill, prompt: `Adik ada wang. Dia membeli air. Berapakah baki wang adik? (${i})`, answer: ans, facets: { op: sub ? 'sub' : 'add', context: 'money', format: 'word' } };
    log = B.applyResponse(log, { q, meta: { domain: 'Wang' }, ok, sec: 12, mode: ok ? 'gembok' : 'gembok-first-attempt', value: ok ? ans : 'RM1.00', at: now - (14 - i) * 36e5 });
  }
  return log;
}
const encounter = (skillId, i, outcome) => ({ skillId, grade: 2, questionKey: `${skillId}#${i % 3}`, outcome, mode: 'gembok', resolvedAt: Date.now() - (10 - i) * 6e5 });

test('dummy children: the first card is the first brain finding, with its short practice label', () => {
  for (const id of ['aisyah', 'mei', 'adam']) {
    const r = S.simulate(id), p = r.persona;
    const usable = GRAPH.skills.filter(m => m.grade === p.grade);
    const out = summary({ name: p.name, schoolGrade: p.grade, diagLog: r.log1 });
    assert.equal(out.hasEvidence, true, id);
    const first = out.items[0], step = r.plan.steps[0];
    assert.equal(first.id, T.skillFor(step, usable), id);
    assert.equal(first.reason, step.card, id);
    assert.equal(first.diagnostic, true, id);
    assert.equal(first.brainStep.finding, step.finding, id);
    assert.ok(out.items.length <= 3 && new Set(out.items.map(x => x.id)).size === out.items.length, id);
    // Short on the card; the full finding is in the parent tab's Ringkasan Cikgu Dimensi.
    for (const x of out.items.filter(x => x.brainStep)) assert.ok(x.reason.length <= 30, `${id}: ${x.reason}`);
  }
  const aisyah = summary({ name: 'Aisyah', schoolGrade: 3, diagLog: S.simulate('aisyah').log1 }).items[0];
  assert.equal(aisyah.id, 'D3.MUL'); assert.match(aisyah.reason, /^Sifir \d+( & \d+)?$/);
  const mei = summary({ name: 'Mei Ling', schoolGrade: 3, diagLog: S.simulate('mei').log1 }).items[0];
  assert.equal(mei.id, 'D3.MONEY'); assert.equal(mei.reason, 'Sen dan ringgit');
  const adam = summary({ name: 'Adam', schoolGrade: 1, diagLog: S.simulate('adam').log1 }).items;
  assert.ok(adam.some(x => x.id === 'D1.SUB20' && x.reason === 'Fakta asas hingga 20'), JSON.stringify(adam.map(x => [x.id, x.reason])));
});

test('the card goes to the skill where the evidence came from, not only the grade default', () => {
  const out = summary({ name: 'Aina', schoolGrade: 2, diagLog: moneyLog('D2.4.7') });
  assert.equal(out.items[0].id, 'D2.4.7', 'Masalah wang, where the mistakes were');
  assert.equal(out.items[0].reason, 'Wang: operasi tolak');
  // The same answers without a usable skill id fall back to the grade's subtraction money skill.
  assert.equal(summary({ name: 'Aina', schoolGrade: 2, diagLog: moneyLog('D9.X') }).items[0].id, 'D2.4.3');
});

test('a brain finding on an existing card keeps its numbers and takes the practice label as reason', () => {
  const encounters = [0, 1, 2, 3, 4, 5].map(i => encounter('D2.4.7', i, i < 2 ? 'independent' : 'unresolved'));
  const old = summary({ schoolGrade: 2, learnerReviewV1: { encounters } }, { brain: false }).items;
  assert.deepEqual(old.map(x => [x.id, x.attempts, x.independent]), [['D2.4.7', 6, 2]]);
  const out = summary({ name: 'Aina', schoolGrade: 2, learnerReviewV1: { encounters }, diagLog: moneyLog('D2.4.7') }).items;
  assert.deepEqual(out.map(x => [x.id, x.attempts, x.independent, x.diagnostic]), [['D2.4.7', 6, 2, true]]);
  assert.equal(out[0].reason, 'Wang: operasi tolak');
});

test('a money check that moved the focus wins over brain evidence on the skill it moved away from', () => {
  const reports = [{ diagnosticVersion: '2.0.0', grade: 2, skillId: 'D2.4.3', state: 'candidate', nextSkillId: 'D2.4.2', at: Date.now(), parentText: 'Semak tambah wang dahulu.' }];
  const profile = { name: 'Aina', schoolGrade: 2, focusDiagnosticsV1: { reports }, diagLog: moneyLog('D2.4.3') };
  const out = summary(profile).items;
  assert.deepEqual(out.map(x => x.id), ['D2.4.2']);
  assert.equal(out[0].reason, 'Semak tambah wang dahulu.');
  assert.deepEqual(out, summary(profile, { brain: false }).items);
});

test('no findings: cards are exactly the old ones', () => {
  const encounters = [
    ...[0, 1, 2, 3, 4, 5].map(i => encounter('D2.4.7', i, i < 2 ? 'independent' : 'unresolved')),
    ...[0, 1, 2, 3, 4, 5, 6].map(i => encounter('D2.2.2', i, i < 4 ? 'independent' : 'assisted'))
  ];
  let right = [];
  for (let i = 0; i < 12; i++) right = B.applyResponse(right, { q: { token: `r${i}`, skill: 'D2.2.1', prompt: `${20 + i} + 3 = ?`, answer: 23 + i }, meta: { domain: 'Operasi' }, ok: true, sec: 6, mode: 'gembok', at: Date.now() - i * 6e4 });
  assert.equal(B.analyze(right).findings.length, 0);
  for (const diagLog of [undefined, [], right]) {
    const profile = { name: 'Aina', schoolGrade: 2, learnerReviewV1: { encounters }, diagLog };
    const out = summary(profile);
    assert.deepEqual(out, summary(profile, { brain: false }));
    assert.deepEqual(out.items.map(x => x.id), ['D2.4.7', 'D2.2.2']);
    assert.ok(out.items.every(x => !x.diagnostic && !x.brainStep));
  }
});

test('skillFor maps every practice kind to a skill of the child\'s grade', () => {
  const grade = g => GRAPH.skills.filter(m => m.grade === g);
  const pick = (target, g) => T.skillFor({ target }, grade(g));
  assert.equal(pick({ kind: 'tables' }, 2), 'D2.2.3'); assert.equal(pick({ kind: 'tables' }, 3), 'D3.MUL');
  assert.equal(pick({ kind: 'facts', factFamilies: ['add20'] }, 1), 'D1.ADD20'); assert.equal(pick({ kind: 'facts', factFamilies: ['sub20'] }, 1), 'D1.SUB20');
  assert.equal(pick({ kind: 'regroup', op: 'sub' }, 1), 'D1.SUB100'); assert.equal(pick({ kind: 'regroup', op: 'add' }, 3), 'D3.ADD10000');
  assert.equal(pick({ kind: 'money', op: 'sub' }, 2), 'D2.4.3'); assert.equal(pick({ kind: 'money', op: 'mixed' }, 2), 'D2.4.7'); assert.equal(pick({ kind: 'money', op: 'sub' }, 3), 'D3.MONEY');
  assert.equal(pick({ kind: 'units' }, 2), 'D2.4.1'); assert.equal(pick({ kind: 'units' }, 4), 'D4.MONEY');
  assert.equal(pick({ kind: 'word' }, 2), 'D2.2.5'); assert.equal(pick({ kind: 'word' }, 3), null, 'no word-problem skill in Darjah 3: worksheet only');
  assert.equal(pick({ kind: 'review', review: ['sifir 6'] }, 3), 'D3.MUL'); assert.equal(pick({ kind: 'review', review: ['tolak asas'] }, 1), 'D1.SUB20');
  assert.equal(T.skillFor({ target: { kind: 'tables' }, skills: ['D3.MUL'] }, grade(2)), 'D2.2.3', 'evidence from another grade is ignored');
});
