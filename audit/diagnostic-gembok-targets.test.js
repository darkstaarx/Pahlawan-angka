// Gembok serves targeted items for a brain-backed Fokus card (docs/PA-DIAGNOSTIC-BRAIN.md §8a, Next 2).
// Runs the real production journey, brain and targets in one context; the
// answers go through the same PATelemetry -> PADiagnostic.record path as the app.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const S = require('../tools/diagnostic-sim.js');

const GRAPH = JSON.parse(fs.readFileSync('data/kssr/knowledge-graph.json', 'utf8'));
const META = Object.fromEntries(GRAPH.skills.map(m => [m.id, m]));
const load = (c, file) => vm.runInContext(fs.readFileSync(file, 'utf8'), c, { filename: file });

function app(profile) {
  let clock = 0, normal = 0;
  const c = {
    console, Math, Date, Set, Map, Promise, GRAPH, META, db: profile, sess: { mode: 'practice' },
    performance: { now: () => (clock += 6000) },                       // 6 s per answer: never a rapid guess
    swapDemoState: (d, s) => { const old = { db: c.db, sess: c.sess }; c.db = d; c.sess = s; return old; },
    scoreState: id => (profile.skills[id] ??= { mastery: 35, evidence: 5, confidence: 40, stability: 10, correct: 2, wrong: 3, hints: 0, mis: {}, probeFail: 0, probePass: 0 }),
    generate: id => ({ prompt: `Soalan biasa ${id} #${++normal}`, answer: 5, wrong: [{ v: 6, tag: 'generated' }], kind: 'Biasa' }),
    coreGrade: () => profile.schoolGrade, evidenceQuality: () => 1, recordCoachResponse() {}, recordFrontierResponse() {},
    updateConfirmationAfterEncounter() {}, updateFrontier() {}, save() {},
    PASegelHost: { openProduction() {} }, PACommercial: { requireFeature: () => true, authorizeMission: async () => true },
    __PA_LIVE_ASSET_REFRESHED: true
  };
  c.window = c; c.globalThis = c;
  vm.createContext(c);
  load(c, 'js/engine/diagnostic-brain-v1.js'); load(c, 'js/engine/diagnostic-targets-v1.js');
  c.PATelemetry = { response: (...a) => c.PADiagnostic.record(...a) };  // same call as js/engine/telemetry.js
  load(c, 'js/engine/production-journey.js');
  return c;
}
const aisyah = () => { const r = S.simulate('aisyah'); return { r, profile: { name: 'Aisyah', schoolGrade: 3, skills: {}, diagLog: r.log1.slice() } }; };
const bugStep = r => r.plan.steps.find(s => s.finding === 'bug_smaller_from_larger');
const option = (q, tag) => tag === 'correct' ? { v: q.answer, tag: 'correct' } : q.wrong.find(w => w.tag === tag);

test('about 70% of turns are targeted items, interleaved with the normal generator', async () => {
  const { r, profile } = aisyah(), c = app(profile), J = c.PAProductionJourney;
  await J.open({ focusSkill: 'D3.SUB10000', brainStep: bugStep(r) });
  const run = J.state(), qs = Array.from({ length: 20 }, () => J.nextQuestion(run));
  assert.deepEqual(qs.map(q => q.targeted ? 'T' : 'N').join(''), 'TTNTTNTTNTTTNTTNTTNT');
  const targeted = qs.filter(q => q.targeted);
  assert.equal(new Set(targeted.map(q => q.prompt)).size, targeted.length, 'no repeated targeted prompt in a run');
  for (const q of targeted) {
    assert.equal(q.skill, 'D3.SUB10000');
    const [a, b] = q.facets.operands;
    assert.equal(q.answer, a - b); assert.equal(q.facets.op, 'sub');
    assert.ok(q.wrong.some(w => ['smaller_from_larger', 'borrow_no_decrement'].includes(w.tag)), q.prompt);
    assert.ok(!q.wrong.some(w => String(w.v) === String(q.answer)));
  }
});

test('answers to targeted items reach the brain with their facets and the wrong value', async () => {
  const { r, profile } = aisyah(), c = app(profile), J = c.PAProductionJourney;
  await J.open({ focusSkill: 'D3.SUB10000', brainStep: bugStep(r) });
  const run = J.state(), q = J.nextQuestion(run), before = profile.diagLog.length;
  const bug = option(q, 'smaller_from_larger') || option(q, 'borrow_no_decrement');
  J.firstWrong(q, bug); J.resolve(q, option(q, 'correct'), true);
  assert.equal(profile.diagLog.length, before + 1, 'one record per question; the retry updates it');
  const rec = profile.diagLog.at(-1);
  assert.equal(rec.s, 'D3.SUB10000'); assert.equal(rec.o, 'sub'); assert.deepEqual(rec.a, q.facets.operands);
  assert.equal(rec.rg, 1); assert.equal(rec.k, 0); assert.equal(rec.r, 1); assert.equal(rec.v, String(bug.v));
  assert.equal(c.PADiagnostic.detectBug(rec), bug.tag);
  assert.equal(profile.skills['D3.SUB10000'].mis[bug.tag], 1);
});

test('practising the targeted items clears the bug and the brain says "Semakin baik"', async () => {
  const { r, profile } = aisyah(), c = app(profile), J = c.PAProductionJourney;
  assert.ok(c.PADiagnostic.analyze(profile.diagLog).findings.some(f => f.id === 'bug_smaller_from_larger'));
  await J.open({ focusSkill: 'D3.SUB10000', brainStep: bugStep(r) });
  const run = J.state();
  for (let i = 0; i < 15; i++) { const q = J.nextQuestion(run); J.resolve(q, option(q, 'correct'), true); }
  const after = c.PADiagnostic.analyze(profile.diagLog);
  assert.ok(!after.findings.some(f => f.id === 'bug_smaller_from_larger'));
  const better = after.strengths.find(f => f.id === 'improved_smaller_from_larger');
  assert.ok(better, JSON.stringify(after.strengths.map(f => f.id)));
  assert.match(better.text, /^Semakin baik: /);
});

test('a card without a brain step, or a restart, keeps the run as it was', async () => {
  const { r, profile } = aisyah(), c = app(profile), J = c.PAProductionJourney;
  await J.open({ focusSkill: 'D3.SUB10000' });
  const plain = J.state();
  assert.equal(plain.brainStep, null);
  assert.ok(Array.from({ length: 10 }, () => J.nextQuestion(plain)).every(q => !q.targeted));
  await J.open({ focusSkill: 'D3.SUB10000', brainStep: bugStep(r) });
  J.restart(J.state());
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(J.state().brainStep.finding, 'bug_smaller_from_larger', 'restart keeps the plan step');
  await J.open({ chapter: '2', brainStep: bugStep(r) });
  assert.equal(J.state().brainStep, null, 'only a focus run takes a plan step');
});

test('the Fokus card hands its plan step to Gembok', () => {
  const { profile } = aisyah(), opened = [];
  const node = () => ({ classList: { add() {}, remove() {}, contains: () => false }, focus() {} });
  const c = { console, Math, Date, Set, Map, GRAPH, META, db: profile, questionBankFor: () => () => ({}),
    document: { getElementById: node, activeElement: null }, openGembok: o => opened.push(o), PAProductionJourney: {} };
  c.window = c; c.globalThis = c; vm.createContext(c);
  load(c, 'js/engine/diagnostic-brain-v1.js'); load(c, 'js/engine/diagnostic-targets-v1.js'); load(c, 'js/guardian-focus.js');
  vm.runInContext('focusPickerProfile=db', c);
  const cards = c.PAFocusPractice.summary().items;
  for (const card of cards) c.PAFocusPractice.start(card.id);
  assert.deepEqual(opened.map(o => [o.focusSkill, o.brainStep?.card]), cards.map(x => [x.id, x.brainStep.card]));
  assert.equal(opened[0].brainStep.target.kind, 'tables');
});
