// Lens 4.7 Retention (full), docs/PA-DIAGNOSTIC-BRAIN.md §4.7: mastered earlier, slipping now — per sifir,
// basic-fact family or KSSR skill — and the 1/3/7/14-day review queue (js/engine/review-queue-v1.js)
// that brings due skills into Kembara Dimensi (js/engine/production-journey.js, adaptive route).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const B = require('../js/engine/diagnostic-brain-v1.js');
const T = require('../js/engine/diagnostic-targets-v1.js');
const R = require('../js/engine/diagnostic-recheck-v1.js');
const Q = require('../js/engine/review-queue-v1.js');

const DAY = 864e5, NOW = Date.UTC(2026, 9, 21, 4);
const many = (n, fn) => Array.from({ length: n }, (_, i) => fn(i));
const rec = (t, over) => ({ t, s: 'D3.SUB10000', o: 'sub', c: 'plain', f: 'lazim', k: 1, sec: 7, w: 4, ...over });
// Right a week ago (old), then `freshOk` of `freshN` right in the last 3 days.
const slipLog = (freshOk, freshN = 6, over = {}) => [
  ...many(8, i => rec(NOW - 6 * DAY + i * 6e4, over)),
  ...many(freshN, i => rec(NOW - DAY + i * 6e4, { k: i < freshOk ? 1 : 0, ...over }))];

test('a KSSR skill mastered earlier and slipping now: one sentence, one score, a review target', () => {
  const f = B.analyze(slipLog(1), { now: NOW, name: 'Nadia' }).findings.find(x => x.id === 'retention');
  assert.ok(f);
  assert.equal(f.lens, '4.7');
  assert.equal(f.text, 'Tolak nombor sudah dikuasai sebelum ini, tetapi mula lupa (1/6 betul dalam 3 hari).');
  assert.match(f.action, /secara berjadual \(selepas 1, 3, 7 dan 14 hari\)/);
  assert.deepEqual(f.target.skills, ['D3.SUB10000']);
  assert.deepEqual(f.target.slips, [{ key: 'skill:D3.SUB10000', label: 'tolak nombor', tables: [], facts: [], skills: ['D3.SUB10000'] }]);
  assert.equal(f.evidence.slips[0].old, '8/8');
  // Two slips: no score in the sentence (owner: no clutter).
  const two = [...slipLog(1), ...slipLog(1, 6, { s: 'D3.ADD10000', o: 'add' })];
  assert.equal(B.analyze(two, { now: NOW }).findings.find(x => x.id === 'retention').text,
    'Tolak nombor dan tambah nombor sudah dikuasai sebelum ini, tetapi mula lupa dalam 3 hari terakhir.');
});

test('no retention finding below the rule; a sifir answer counts for the sifir, not for its skill', () => {
  const none = log => !B.analyze(log, { now: NOW }).findings.some(x => x.id === 'retention');
  assert.ok(none(slipLog(4)), '4/6 = 67% > 50%');
  assert.ok(none(slipLog(1, 3)), 'only 3 recent answers');
  assert.ok(none([...slipLog(1).slice(0, 8).map((r, i) => i < 2 ? { ...r, k: 0 } : r), ...slipLog(1).slice(8)]), 'old 6/8 = 75%: never mastered');
  assert.ok(none(slipLog(1).map(r => r.t > NOW - 3 * DAY && r.k === 0 ? { ...r, sec: 0.5 } : r)), 'recent misses were guesses');
  const sifir = slipLog(1, 6, { s: 'D3.MUL', o: 'mul', tb: [6], a: [6, 7], sec: 3 });
  const f = B.analyze(sifir, { now: NOW }).findings.find(x => x.id === 'retention');
  assert.deepEqual([f.target.review, f.target.skills, f.target.slips[0].tables], [['sifir 6'], [], [6]]);
});

test('review queue: 1, 3, 7, 14 days; a miss starts again; early practice and guesses do not move it', () => {
  const profile = { diagLog: slipLog(1) }, result = B.analyze(profile.diagLog, { now: NOW });
  assert.equal(Q.sync(profile, result, NOW), true);
  assert.equal(Q.sync(profile, result, NOW + 6e4), false, 'once per slip');
  const item = profile.diagReviewV1.items['skill:D3.SUB10000'];
  const st = t => Q.state(profile, item, t);
  assert.deepEqual([st(NOW + 3600e3).status, st(NOW + DAY).status], ['waiting', 'due']);
  assert.deepEqual(Q.dueSkills(profile, NOW + DAY), ['D3.SUB10000']);
  // Practice before the due time is ordinary practice.
  profile.diagLog.push(rec(NOW + 3600e3, { k: 1 }));
  assert.equal(st(NOW + DAY).step, 0);
  // Day 1 right → step 2 due 3 days later; a guess on day 4 is ignored; a miss on day 5 starts again.
  profile.diagLog.push(rec(NOW + DAY + 6e4, { k: 1 }));
  assert.deepEqual([st(NOW + 2 * DAY).status, st(NOW + 2 * DAY).step], ['waiting', 1]);
  profile.diagLog.push(rec(NOW + 4 * DAY + 6e4, { k: 0, sec: 0.5 }));
  assert.equal(st(NOW + 4 * DAY + 1e5).status, 'due');
  profile.diagLog.push(rec(NOW + 5 * DAY, { k: 0 }));
  const again = st(NOW + 5 * DAY + 1e5);
  assert.deepEqual([again.status, again.step, again.restarts], ['waiting', 0, 1]);
  // Then right at 1, 3, 7 and 14 days: done.
  let t = NOW + 5 * DAY;
  for (const d of [1, 3, 7, 14]) { t += d * DAY + 6e4; profile.diagLog.push(rec(t, { k: 1 })); }
  assert.equal(st(t + 1e5).status, 'done');
  assert.deepEqual(Q.dueSkills(profile, t + 1e5), []);
  // The slip comes back later: a finished schedule starts again.
  assert.equal(Q.sync(profile, result, t + 2e5), true);
  assert.equal(Q.state(profile, profile.diagReviewV1.items['skill:D3.SUB10000'], t + 3e5).status, 'waiting');
});

test('plan: "Ulang kaji berjadual" card on the skill; re-check counts that skill; no empty worksheet section', () => {
  const p = T.plan(B.analyze(slipLog(1), { now: NOW }), { grade: 3 });
  const step = p.steps.find(s => s.target.kind === 'review');
  assert.equal(step.card, 'Ulang kaji berjadual');
  assert.equal(T.skillFor(step, [{ id: 'D3.SUB10000', domain: 'Operasi', title: 'Tolak' }]), 'D3.SUB10000');
  const m = R.matcher(step);
  assert.equal(m.key, 'review:D3.SUB10000');
  assert.deepEqual([m.test({ s: 'D3.SUB10000' }), m.test({ s: 'D3.SUB10000', tb: [6] }), m.test({ s: 'D3.ADD10000' })], [true, false, false]);
  assert.deepEqual(T.worksheet(p).sections, []);
  // A sifir slip keeps its sifir re-check key.
  assert.equal(R.matcher({ target: { kind: 'review', review: ['sifir 6'], skills: [] } }).key, 'tables:6');
});

test('Kembara Dimensi: every 4th question from the 2nd is a due review skill, once per run', () => {
  const profile = { diagLog: slipLog(1) };
  Q.sync(profile, B.analyze(profile.diagLog, { now: NOW }), NOW);
  const run = { questionNumber: 0 }, at = NOW + DAY + 6e4, pick = n => { run.questionNumber = n; return Q.nextForRun(profile, run, at); };
  assert.deepEqual([pick(0), pick(1), pick(2), pick(5)], [null, 'D3.SUB10000', null, null], 'asked once in this run');
  assert.equal(Q.nextForRun(profile, { questionNumber: 1 }, NOW + 3600e3), null, 'not due yet');
  assert.equal(Q.nextForRun(profile, { questionNumber: 1 }, at, () => false), null, 'a skill the app cannot serve is skipped');
  // The real journey code asks the queue on its adaptive route.
  const src = fs.readFileSync('js/engine/production-journey.js', 'utf8');
  assert.match(src, /route==='adaptive'\)\{[\s\S]*?PAReviewQueue[\s\S]*?nextForRun[\s\S]*?chooseModeAndSkill\(\)/);
});

test('dummy child Nadia: week 1 finds the slip, the plan reviews it, week 2 is clear', () => {
  const S = require('../tools/diagnostic-sim.js');
  const r = S.simulate('nadia');
  assert.deepEqual(r.week1.findings.map(x => x.id), ['retention']);
  assert.equal(r.plan.steps[0].card, 'Ulang kaji berjadual');
  assert.ok(!r.week2.findings.some(x => x.id === 'retention'), JSON.stringify(r.week2.findings.map(x => x.text)));
  for (const id of Object.keys(S.PERSONAS).filter(x => x !== 'nadia')) assert.ok(!S.simulate(id).week1.findings.some(x => x.id === 'retention'), id);
});
