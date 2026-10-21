// "Kemungkinan punca" for Darjah 2–5: live questions carry authored foundation tags
// (questions/focus-tags-d2-d5-v1.js), so the foundation finder (js/engine/focus-foundation-v1.js)
// can name a cross-topic cause on the Kemahiran Fokus card. Untagged archetypes are an explicit
// abstain list, never a silent gap. Same contract as audit/focus-v2-d6-tags.cjs.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
// The app's question loading (as audit/question-bank-choices.test.js), plus the ledger, finder and Fokus cards.
function app() {
  const doc = { documentElement: { dataset: {}, setAttribute() {} }, getElementById() { return null }, querySelector() { return null }, querySelectorAll() { return [] } };
  const c = { console: { log() {}, info() {}, warn() {}, error() {} }, Math, document: doc, setTimeout() {}, clearTimeout() {},
    sess: { mode: 'practice', questionHistory: [], questionFingerprints: [] }, localStorage: { getItem() { return null }, setItem() {} } };
  c.window = c; c.globalThis = c; vm.createContext(c);
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8'), sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  assert.ok(html.includes('src="questions/focus-tags-d2-d5-v1.js') && sw.includes("'./questions/focus-tags-d2-d5-v1.js'"), 'loaded and cached');
  const eager = [...html.matchAll(/src="((?:questions|data\/kssr|js\/engine\/reading)[^"?]*\.js)/g)].map(m => m[1]).filter(f => !/questions\/index\.js|fractions-audit/.test(f));
  const lazy = [...sw.matchAll(/'\.\/((?:questions|data\/kssr)\/[^']+\.js)'/g)].map(m => m[1]).filter(f => !/index\.js$/.test(f));
  const late = f => /kssr-year[16]-|year[16]-competencies/.test(f);
  for (const f of [...new Set([...eager, ...lazy.filter(f => !late(f)), ...lazy.filter(late), 'js/written-arithmetic-v1.0.0.js', 'questions/index.js',
    'js/engine/learner-review-v1.js', 'js/engine/focus-foundation-v1.js', 'js/guardian-focus.js'])]) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), c, { filename: f });
  vm.runInContext('globalThis.__generate=generate;globalThis.__skills=GRAPH.skills;globalThis.__summary=focusPracticeSummary', c);
  return c;
}
const c = app(), T = c.PAFocusTagsD2D5, finder = c.PAFocusFoundationV1, review = c.PALearnerReview;
const MAP = new Set(JSON.parse(fs.readFileSync(path.join(root, 'data/focus-v2/foundation-map-v1.json'), 'utf8')).foundations.map(f => f.id));
const DOMAINS = new Set(['money', 'number', 'operations', 'time', 'measurement', 'fraction', 'percent', 'ratio', 'data', 'other']);
const OPS = new Set(['addition', 'subtraction', 'multiplication', 'division']);
const states = [{ mastery: 10, evidence: 1, confidence: 10, correct: 0, wrong: 1 }, { mastery: 55, evidence: 5, confidence: 55, correct: 4, wrong: 1 }, { mastery: 85, evidence: 8, confidence: 80, correct: 7, wrong: 0 }];
const fresh = () => { c.sess.questionHistory = []; c.sess.questionFingerprints = []; c.sess.questionKeys = []; };

test('every authored entry names real foundations, operations and domains', () => {
  const entries = [...Object.entries(T.SHARED), ...Object.values(T.BY_SKILL).flatMap(Object.entries)];
  assert.ok(entries.length > 300, entries.length);
  for (const [arch, [domain, steps, foundations, concepts]] of entries) {
    assert.ok(DOMAINS.has(domain), `${arch}: domain ${domain}`);
    for (const op of steps ? steps.split(',') : []) assert.ok(OPS.has(op), `${arch}: op ${op}`);
    assert.ok(foundations.length, `${arch}: no foundation`);
    for (const f of [...foundations, ...concepts]) { assert.ok(MAP.has(f), `${arch}: ${f} not in the foundation map`); assert.ok(finder.LABELS[f], `${arch}: ${f} has no label`); }
  }
});

test('D2–D5 questions are tagged, or their archetype is an explicit abstain', () => {
  const gaps = [], report = {};
  for (const sk of c.__skills.filter(s => s.grade >= 2 && s.grade <= 5)) {
    fresh();
    let tagged = 0;
    for (let i = 0; i < 120; i++) {
      const q = c.__generate(sk.id, states[i % 3]), t = q.focusDiagnosticV1, arch = String(q.archetypeId);
      if (!t) { if (!T.ABSTAIN_SKILLS.has(sk.id) && !(T.ABSTAIN[sk.id] || []).includes(arch)) gaps.push(`${sk.id} ${arch}`); continue; }
      assert.ok(!T.ABSTAIN_SKILLS.has(sk.id), `${sk.id} should abstain but tagged ${arch}`);
      tagged++;
      assert.equal(t.schema, 'pa.focus.question-tag.v1'); assert.equal(t.tagOrigin, 'authored'); assert.equal(t.originSkillId, sk.id);
      assert.ok(t.probes.foundationIds.length, `${sk.id} ${arch} no foundation`);
      for (const f of t.probes.foundationIds) assert.ok(MAP.has(f), `${sk.id} ${arch}: ${f}`);
      assert.ok(t.evidence.variantFingerprint && !/[A-Za-z]{4,} [A-Za-z]{4,}/.test(t.evidence.variantFingerprint), 'fingerprint must be opaque');
      assert.ok(!JSON.stringify(t).includes(String(q.prompt).slice(0, 40)), 'tag must not carry prompt text');
      // Archetypes authored here carry this revision and the archetype as family (older pilots keep
      // their own, e.g. D2 division "div_exact" and D5 add/sub).
      if (T.specFor(q, sk.id)) { assert.equal(t.evidence.tagRevision, 'd2-d5-authored-v1', `${sk.id} ${arch}`); assert.equal(t.evidence.questionFamilyKey, arch, sk.id); }
    }
    report[sk.id] = tagged;
  }
  assert.deepEqual([...new Set(gaps)], [], 'untagged archetypes must be authored or listed in ABSTAIN');
  // Coverage per grade, abstain topics included (measured before: D2 11%, D3 1%, D4 1%, D5 10%).
  for (const g of [2, 3, 4, 5]) {
    const ids = Object.keys(report).filter(id => id.startsWith(`D${g}.`)), share = ids.reduce((n, id) => n + report[id], 0) / (ids.length * 120);
    assert.ok(share >= 0.75, `D${g}: ${Math.round(share * 100)}% tagged`);
  }
});

test('Tambah/Tolak with known numbers: the regrouping foundation only when the sum needs it', () => {
  const seen = { yes: 0, no: 0 };
  for (const id of ['D2.2.1', 'D2.2.2', 'D4.ADD', 'D4.SUB']) {
    fresh();
    for (let i = 0; i < 160; i++) {
      const q = c.__generate(id, states[i % 3]), t = q.focusDiagnosticV1;
      if (!/^integrity_(add|sub)_|^depth_(symbolic|three_step)$/.test(q.archetypeId) || t?.evidence?.tagRevision !== 'd2-d5-authored-v1' || !t.arithmeticProfile.operands.unit) continue;
      const o = t.arithmeticProfile.operands, add = t.diagnosticFamily === 'addition';
      // Recompute from the numbers in the prompt: column carrying / borrowing.
      const nums = String(q.prompt).replace(/<[^>]*>/g, ' ').replace(/(\d) (?=\d{3}\b)/g, '$1').match(/\d+/g).map(Number);
      if (add) assert.deepEqual([...o.addends].sort((a, b) => a - b), nums.slice(0, o.addends.length).sort((a, b) => a - b), q.prompt);
      else assert.deepEqual([o.minuend, o.subtrahend, ...o.subsequentSubtrahends], nums.slice(0, 2 + o.subsequentSubtrahends.length), q.prompt);
      const needs = t.arithmeticProfile.operandDimensions.usesRegrouping, f = t.probes.foundationIds;
      assert.equal(f.includes(add ? 'add.regroup' : 'sub.regroup'), needs, `${q.prompt} ${JSON.stringify(f)}`);
      seen[needs ? 'yes' : 'no']++;
    }
  }
  assert.ok(seen.yes > 20 && seen.no > 20, JSON.stringify(seen));
});

// Play n questions per skill; fails(foundations) decides the child's first-try outcome.
let clock = 1e12;
function play(profile, grade, skills, n, fails) {
  for (const id of skills) { fresh(); for (let i = 0; i < n; i++) {
    const q = c.__generate(id, states[1]); q.skill = id; q.token = 't' + (++clock);
    review.beginQuestion(q, { grade, mode: 'practice', now: clock });
    review.resolve(q, { correct: !fails(q.focusDiagnosticV1?.probes?.foundationIds || []), seconds: 9, now: clock + 1 }, profile);
  } }
}
const profileOf = grade => ({ schoolGrade: grade, learnerReviewV1: { schema: 1, encounters: [] } });

test('Darjah 4: place value fails across topics → "Kemungkinan punca: Nilai tempat nombor" on the Fokus card', () => {
  const p = profileOf(4), PVF = 'number.place_value';
  play(p, 4, ['D4.N100000', 'D4.PV100000', 'D4.MUL', 'D4.MEASURE', 'D4.DEC'], 25, f => f.includes(PVF));
  const r = finder.evaluate(p);
  assert.equal(r.candidates[0]?.foundationId, PVF, JSON.stringify(r.candidates));
  assert.ok(r.candidates[0].skills.length >= 2);
  const hinted = c.__summary(p).items.filter(x => x.foundationId === PVF);
  assert.ok(hinted.length >= 1, 'home focus shows the hint');
  assert.ok(hinted.every(x => x.reason === 'Kemungkinan punca: Nilai tempat nombor.'), JSON.stringify(hinted.map(x => x.reason)));
});

test('Darjah 3: stories fail across topics → "Memilih operasi daripada cerita"; failing everything names nothing', () => {
  const p = profileOf(3), CH = 'operation.choose';
  play(p, 3, ['D3.ADD10000', 'D3.SUB10000', 'D3.MONEY', 'D3.TIME', 'D3.MEASURE'], 30, f => f.includes(CH));
  const r = finder.evaluate(p);
  assert.equal(r.candidates[0]?.foundationId, CH, JSON.stringify(r.candidates));
  assert.match(c.__summary(p).items.find(x => x.foundationId === CH)?.reason || '', /^Kemungkinan punca: Memilih operasi daripada cerita\.$/);
  // Weak everywhere is not one foundation.
  const all = profileOf(3); play(all, 3, ['D3.ADD10000', 'D3.SUB10000', 'D3.MONEY'], 25, () => true);
  assert.equal(finder.evaluate(all).state, 'insufficient_evidence');
  // Only in one topic: a topic weakness, not a cross-topic cause.
  const one = profileOf(3); play(one, 3, ['D3.TIME'], 30, f => f.includes('time.units')); play(one, 3, ['D3.MONEY', 'D3.FRAC'], 20, () => false);
  assert.ok(!finder.evaluate(one).candidates.some(x => x.foundationId === 'time.units'));
});

test('short/long wording items keep their story (no bentuk lazim swap) and carry a tag', () => {
  let n = 0;
  for (const id of ['D3.MUL', 'D4.DIV', 'D5.SUB']) { fresh(); for (let i = 0; i < 300; i++) {
    const q = c.__generate(id, states[2]);
    assert.ok(!/^reading_.*_written$/.test(q.archetypeId), `${id}: ${q.archetypeId}`);
    if (/^reading_/.test(q.archetypeId)) { n++; assert.ok(q.facets.reading && q.focusDiagnosticV1?.probes.foundationIds.includes('operation.choose'), id); }
  } }
  assert.ok(n > 60, String(n));
});
