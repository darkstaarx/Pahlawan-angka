// Lens 4.8 language load (docs/PA-DIAGNOSTIC-BRAIN.md §4.8): the same family of word problem is
// right in a short wording and wrong in a long one. Wordings: js/engine/reading-pairs-v1.js.
// Browser side (Gudang Harta "Baca soalan panjang"): minigame-targets-browser.test.js.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const B = require('../js/engine/diagnostic-brain-v1.js');
const T = require('../js/engine/diagnostic-targets-v1.js');
const R = require('../js/engine/diagnostic-recheck-v1.js');
const P = require('../js/engine/reading-pairs-v1.js');
const S = require('../tools/diagnostic-sim.js');

const NOW = Date.UTC(2026, 9, 21, 4);
const many = (n, fn) => Array.from({ length: n }, (_, i) => fn(i));
// A record as the brain stores it; rd = 1 short | 3 long, ra = 1 heard first | 2 heard after a miss.
const rec = (i, over) => ({ t: NOW - (i + 1) * 6e5, s: 'D4.SUB', o: 'sub', c: 'plain', f: 'word', k: 1, sec: 14, w: 30, rp: 'a', ...over });
// short right `shortOk`/10, long (read alone) right `longOk`/10
const readLog = (shortOk, longOk, over = {}) => [
  ...many(10, i => rec(i, { rd: 1, w: 10, k: i < shortOk ? 1 : 0, ...over })),
  ...many(10, i => rec(i + 10, { rd: 3, w: 40, k: i < longOk ? 1 : 0, sec: 25, ...over }))];
const plain = x => JSON.parse(JSON.stringify(x));      // values made in another VM realm

test('wordings: short is one sentence of at most 12 words, long is 2–3 sentences, same numbers and answer', () => {
  let n = 0;
  for (let seed = 1; seed <= 60; seed++) for (const fam of P.FAMILIES) for (const g of [3, 4, 5, 6]) {
    const r = T._rng(seed * 31 + g), p = P.pair(fam, g, r), { a, b, ans } = p.numbers;
    assert.ok(P.words(p.short.prompt) <= 12 && P.sentences(p.short.prompt) === 1, p.short.prompt);
    assert.ok(P.sentences(p.long.prompt) >= 2 && P.sentences(p.long.prompt) <= 3 && P.words(p.long.prompt) >= 25, p.long.prompt);
    assert.deepEqual([p.short.facets.reading, p.long.facets.reading], [1, 3]);
    assert.deepEqual({ ...p.short.facets, reading: 3 }, p.long.facets, 'same op, operands and schema');
    assert.equal(p.short.answer, p.long.answer);
    const want = { add: a + b, sub: a - b, mul: a * b, div: a / b }[p.short.facets.op];
    assert.equal(ans, want); assert.ok(Number.isInteger(ans) && ans > 0, fam);
    // Both wordings carry the same numbers (KSSR writes 10 000 and up with a space).
    const shown = fam.startsWith('wang') ? [P._rm(a), P._rm(b)] : [P._nf(a), String(b).length < 2 ? String(b) : P._nf(b)];
    for (const x of shown) { assert.ok(p.short.prompt.includes(x), `${x} in ${p.short.prompt}`); assert.ok(p.long.prompt.includes(x), `${x} in ${p.long.prompt}`); }
    if (fam.startsWith('wang')) assert.equal(p.short.facets.context, 'money');
    assert.ok(!p.short.wrongs.some(w => String(w.v) === String(p.short.answer)), 'no wrong choice equals the answer');
    n++;
  }
  assert.equal(n, 60 * 6 * 4);
});

test('facets: reading only when the generator says so; read aloud before (ra 1) or after a miss (ra 2)', () => {
  const f = q => B.facets(q);
  assert.equal(f({ prompt: 'Ali dan Abu mengumpul guli sejak awal tahun. Ali ada 645 guli. Berapakah bezanya?', representation: 'story' }).reading, null, 'never guessed from text');
  assert.equal(f({ prompt: 'x', facets: { reading: 3 } }).reading, 3);
  assert.equal(f({ prompt: 'x', facets: { reading: 7 } }).reading, null);
  const q = { token: 'q1', prompt: P.pair('beza', 4, T._rng(5)).long.prompt, facets: { op: 'sub', operands: [645, 278], format: 'word', reading: 3 } };
  let log = B.applyResponse([], { q, ok: false, sec: 20, mode: 'gembok-first-attempt', value: '433', at: NOW });
  assert.equal(log[0].rd, 3); assert.equal(log[0].ra, undefined);
  q.readAloud = true;
  log = B.applyResponse(log, { q, ok: true, sec: 30, mode: 'gembok-retry', at: NOW + 5e3 });
  assert.deepEqual([log[0].k, log[0].r, log[0].ra], [0, 1, 2], 'wrong read alone, right after hearing it');
  log = B.applyResponse(log, { q: { ...q, token: 'q2' }, ok: true, sec: 30, mode: 'gembok', at: NOW + 9e3 });
  assert.equal(log[1].ra, 1, 'heard before answering');
});

test('short 9/10, long 3/10 in the same family: "ayat panjang" finding with both scores and a reading target', () => {
  const r = B.analyze(readLog(9, 3), { now: NOW, name: 'Zara' });
  const f = r.findings.find(x => x.id === 'reading_load');
  assert.ok(f, JSON.stringify(r.findings.map(x => x.id)));
  assert.equal(f.lens, '4.8');
  assert.match(f.text, /^Matematik Zara ok — yang menyukarkan ialah ayat panjang\. Soalan tolak dengan ayat pendek betul 9\/10, tetapi dengan ayat panjang hanya 3\/10\.$/);
  assert.deepEqual(f.target, { reading: true, op: 'sub', context: 'plain' });
  assert.deepEqual(f.skills, ['D4.SUB']);
  assert.match(f.action, /ayat pendek dahulu/);
  assert.equal(f.confidence, 'sederhana');
  // Money family names the context.
  assert.match(B.analyze(readLog(9, 2, { s: 'D4.MONEY', c: 'money' }), { now: NOW, name: 'Zara' }).findings.find(x => x.id === 'reading_load').text, /Soalan tolak wang/);
});

test('no finding below the rule: small gap, few items, guesses, another family, or heard aloud', () => {
  const none = log => !B.analyze(log, { now: NOW }).findings.some(x => x.id === 'reading_load');
  assert.ok(none(readLog(7, 3)), 'short 70% < 80%');
  assert.ok(none(readLog(9, 6)), 'long 60% > 50%');
  assert.ok(none(readLog(9, 0).slice(0, 15)), 'only 5 long items');
  // Long wrong answers in under 2 seconds are guesses (lens 4.5), not reading evidence.
  assert.ok(none(readLog(9, 3).map(r => r.rd === 3 && r.k === 0 ? { ...r, sec: 1.2 } : r)), 'guesses');
  // Short wording in addition, long wording in subtraction: not the same family.
  assert.ok(none(readLog(9, 3).map(r => r.rd === 1 ? { ...r, o: 'add', s: 'D4.ADD' } : r)), 'different family');
  // Long questions the child heard read aloud first are not "read alone".
  assert.ok(none(readLog(9, 3).map(r => r.rd === 3 ? { ...r, ra: 1 } : r)), 'heard aloud');
});

test('a known bug or a weak sifir explains the long misses: no reading finding', () => {
  // Long subtraction misses are all "smaller from larger" (a confirmed bug), so the wording is not the cause.
  const SFL = [[52, 27, 35], [63, 48, 25], [71, 36, 45], [84, 59, 35], [92, 65, 33], [45, 18, 33], [74, 29, 55]];
  let j = 0;
  const bug = readLog(9, 3).map(r => r.rd === 3 && r.k === 0 ? (([a, b, v]) => ({ ...r, a: [a, b], rg: 1, v: String(v) }))(SFL[j++]) : r);
  const ids = B.analyze(bug, { now: NOW }).findings.map(x => x.id);
  assert.ok(ids.includes('bug_smaller_from_larger'), ids.join());
  assert.ok(!ids.includes('reading_load'), ids.join());
  // Long multiplication misses all use sifir 7, which is weak.
  const sifir = [
    ...many(10, i => rec(i, { s: 'D4.MUL', o: 'mul', rd: 1, w: 10, a: [6, 4], tb: [6, 4] })),
    ...many(10, i => rec(i + 10, { s: 'D4.MUL', o: 'mul', rd: 3, w: 40, a: [7, 8], tb: [7, 8], k: i < 3 ? 1 : 0 })),
    ...many(10, i => rec(i + 20, { s: 'D4.MUL', o: 'mul', f: 'symbolic', rd: undefined, a: [7, 6], tb: [7, 6], k: i < 2 ? 1 : 0 }))];
  const ids2 = B.analyze(sifir, { now: NOW }).findings.map(x => x.id);
  assert.ok(ids2.includes('fact_fluency'), ids2.join());
  assert.ok(!ids2.includes('reading_load'), ids2.join());
});

test('read aloud supports it; the bar-model finding (4.4) steps aside because short word problems are right', () => {
  const heard = [...readLog(9, 3).map(r => r.rd === 3 && r.k === 0 ? { ...r, ra: 2, r: 1 } : r), ...many(4, i => rec(i + 30, { rd: 3, ra: 1 }))];
  const f = B.analyze(heard, { now: NOW, name: 'Zara' }).findings.find(x => x.id === 'reading_load');
  assert.match(f.text, /Bila soalan dibacakan, Zara betul 4\/4\. 7 kali Zara betul selepas mendengar soalan\.$/);
  assert.equal(f.confidence, 'tinggi');
  // Bentuk lazim right and word problems mostly wrong (the latest are long): 4.4 alone would say
  // "keliru bila soalan dalam ayat". Short wordings right → it is the reading, not the structure.
  const lazim = many(10, i => rec(i + 40, { f: 'lazim', rd: undefined, w: 6, sec: 8 }));
  const word = shortOk => [...many(10, i => rec(i + 10, { rd: 1, w: 10, k: i < shortOk ? 1 : 0 })), ...many(10, i => rec(i, { rd: 3, w: 40, sec: 25, k: i < 2 ? 1 : 0 }))];
  const weak = B.analyze([...lazim, ...word(3)], { now: NOW }).findings.map(x => x.id);
  assert.ok(weak.includes('format_word') && !weak.includes('reading_load'), 'short wording also weak: structure, ' + weak.join());
  const ids = B.analyze([...lazim, ...word(9)], { now: NOW }).findings.map(x => x.id);
  assert.ok(ids.includes('reading_load') && !ids.includes('format_word'), ids.join());
});

test('plan: "Baca soalan panjang" card, short then long practice, Gudang target, worksheet and re-check', () => {
  const p = T.plan(B.analyze(readLog(9, 3), { now: NOW }), { grade: 4 });
  const step = p.steps.find(s => s.target.kind === 'reading');
  assert.equal(step.card, 'Baca soalan panjang');
  assert.equal(T.skillFor(step, [{ id: 'D4.SUB', domain: 'Operasi', title: 'Tolak nombor besar' }]), 'D4.SUB');
  assert.equal(T.skillFor({ ...step, skills: [] }, [{ id: 'D4.ADD', domain: 'Operasi', title: 'Tambah nombor besar' }, { id: 'D4.SUB', domain: 'Operasi', title: 'Tolak nombor besar' }]), 'D4.SUB');
  assert.deepEqual(T.miniGameTarget(step), { kind: 'reading' });
  assert.equal(T.miniGameTarget({ target: { kind: 'reading', op: 'sub', context: 'money' } }), null, 'money: Gerai Wirayung has no reading rounds');
  const items = T.practice(step, 9, { grade: 4 }, 7);
  assert.deepEqual(items.map(x => x.facets.reading), [1, 1, 1, 3, 3, 3, 3, 3, 3], 'short wording first, then long');
  assert.ok(items.every(x => x.facets.op === 'sub' && x.facets.format === 'word' && x.answer === x.facets.operands[0] - x.facets.operands[1]));
  assert.match(T.explain(items[0]), /^Cari nombor dan soalan dulu\. [\d\s]+ − [\d\s]+ = [\d\s]+\.$/);
  const ws = T.worksheet(p, { grade: 4 });
  assert.equal(ws.sections[0].title, 'Baca soalan panjang');
  assert.equal(ws.sections[0].showWorking, true);
  assert.equal(T.worksheetItems(p, 10, { grade: 4 }, 3).items.filter(x => x.focus === 'Baca soalan panjang').length >= 2, true);
  // Re-check: long wording of the same family, read alone.
  const m = R.matcher(step);
  assert.equal(m.key, 'reading:sub:plain');
  assert.equal(m.test({ o: 'sub', c: 'plain', rd: 3 }), true);
  assert.equal(m.test({ o: 'sub', c: 'plain', rd: 3, ra: 2 }), true, 'first try was read alone');
  assert.equal(m.test({ o: 'sub', c: 'plain', rd: 3, ra: 1 }), false, 'heard first');
  assert.equal(m.test({ o: 'sub', c: 'plain', rd: 1 }), false);
  assert.equal(m.test({ o: 'add', c: 'plain', rd: 3 }), false);
});

test('mini game rounds pass their reading level; anything else is dropped', () => {
  const listeners = [], child = {}, profile = { diagLog: [] };
  const c = { console, Math, Date, Set, Map, db: profile, location: { origin: 'https://pa.test' },
    document: { querySelectorAll: () => [{ contentWindow: child }] }, addEventListener: (t, f) => listeners.push(f) };
  c.window = c; c.globalThis = c; vm.createContext(c);
  vm.runInContext(fs.readFileSync('js/engine/diagnostic-brain-v1.js', 'utf8'), c);
  c.PATelemetry = { response: (...a) => c.PADiagnostic.record(...a) };
  vm.runInContext(fs.readFileSync('js/minigame-telemetry-v1.js', 'utf8'), c);
  const send = (key, facets) => listeners.forEach(f => f({ data: { type: 'PA_MINIGAME_ATTEMPT', version: 1, game: 'gudang-harta', skillId: 'D4.SUB', key, prompt: 'Cerita.', answer: '5', ok: true, first: true, hints: 0, ms: 20000, facets }, source: child, origin: 'https://pa.test' }));
  send('r1', { op: 'sub', operands: [9, 4], format: 'word', reading: 3 });
  send('r2', { op: 'sub', operands: [9, 4], format: 'word', reading: 2 });
  send('r3', { op: 'sub', operands: [9, 4], format: 'word', reading: '3' });
  assert.deepEqual(profile.diagLog.map(r => r.rd ?? null), [3, 2, null]);
});

test('Segel speaker: hearing the question marks the answer as read aloud', () => {
  const src = fs.readFileSync('js/segel-demo-v2.1.0.js', 'utf8'), start = src.indexOf('function bindSpeaker()');
  const body = src.slice(start, src.indexOf('\n  }\n', start) + 4), spk = { dataset: {}, setAttribute() {} };
  const c = { run: { q: { prompt: 'Siti ada <b>12</b> guli.' } }, $: () => spk, document: { createElement: () => { const el = { set innerHTML(v) { el.textContent = v.replace(/<[^>]*>/g, '') } }; return el } },
    window: {}, speechSynthesis: { cancel() {}, speak() {} }, SpeechSynthesisUtterance: function (t) { this.text = t } };
  c.window.speechSynthesis = c.speechSynthesis; vm.createContext(c);
  vm.runInContext(body + '\nbindSpeaker();', c);
  spk.onclick();
  assert.equal(c.run.q.readAloud, true);
});

test('the app serves short and long wordings for D3–D6 word-problem skills once the skill is learnt', () => {
  const root = path.join(__dirname, '..');
  const doc = { documentElement: { dataset: {}, setAttribute() {} }, getElementById() { return null }, querySelector() { return null }, querySelectorAll() { return [] } };
  const c = { console: { log() {}, info() {}, warn() {}, error() {} }, Math, document: doc, setTimeout() {}, clearTimeout() {},
    sess: { mode: 'practice', questionHistory: [], questionFingerprints: [] }, localStorage: { getItem() { return null }, setItem() {} } };
  c.window = c; c.globalThis = c; vm.createContext(c);
  // Same loading as audit/question-bank-choices.test.js, plus the wording module index.html loads.
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8'), sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  assert.ok(html.indexOf('js/engine/reading-pairs-v1.js') > 0 && sw.includes("'./js/engine/reading-pairs-v1.js'"), 'loaded and cached');
  const eager = [...html.matchAll(/src="((?:questions|data\/kssr)\/[^"?]+\.js)/g)].map(m => m[1]).filter(f => !/questions\/index\.js|fractions-audit/.test(f));
  const lazy = [...sw.matchAll(/'\.\/((?:questions|data\/kssr)\/[^']+\.js)'/g)].map(m => m[1]).filter(f => !/index\.js$/.test(f));
  const late = f => /kssr-year[16]-|year[16]-competencies/.test(f);
  for (const f of [...new Set([...eager, ...lazy.filter(f => !late(f)), ...lazy.filter(late), 'js/engine/reading-pairs-v1.js', 'questions/index.js'])]) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), c, { filename: f });
  vm.runInContext('globalThis.__generate=generate', c);
  const learnt = { mastery: 70, evidence: 6, confidence: 60, correct: 5, wrong: 1 }, strip = s => String(s ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  for (const id of ['D3.SUB10000', 'D3.MUL', 'D4.ADD', 'D4.DIV', 'D5.SUB', 'D5.MONEY', 'D6.NUMBERS', 'D6.MONEY']) {
    c.sess.questionHistory = []; c.sess.questionFingerprints = []; c.sess.questionKeys = [];
    const qs = many(240, () => c.__generate(id, learnt)), pairs = qs.filter(q => q.facets?.reading);
    assert.ok(pairs.length >= 30 && pairs.length <= 95, `${id}: ${pairs.length}/240 wording items`);
    const levels = new Set(pairs.map(q => q.facets.reading));
    assert.deepEqual([...levels].sort(), [1, 3], id);
    for (const q of pairs) {
      const ans = strip(q.answer), opts = q.wrong.map(w => strip(w.label ?? w.v));
      assert.equal(new Set([ans, ...opts]).size, 4, `${id} four different choices: ${[ans, ...opts].join(' / ')}`);
      if (!q.facets.context) {
        const [a, b] = q.facets.operands, want = { add: a + b, sub: a - b, mul: a * b, div: a / b }[q.facets.op];
        assert.equal(Number(ans.replace(/ /g, '')), want, strip(q.prompt));
      }
      // Darjah 4–6 group thousands in the prompt (KSSR/UASA style).
      if (/^D[456]/.test(id)) assert.ok(!/\d{4,}/.test(strip(q.prompt).replace(/RM[\d ]+\.\d\d/g, '')), strip(q.prompt));
      assert.equal(plain(B.facets(q)).reading, q.facets.reading);
    }
    // Not while the child is still building the skill.
    assert.equal(many(80, () => c.__generate(id, { mastery: 10 })).filter(q => q.facets?.reading).length, 0, id + ' weak skill');
  }
});

test('dummy child Zara: week 1 finds the long-wording gap in subtraction, practising long wording closes it', () => {
  const r = S.simulate('zara');
  const f = r.week1.findings.find(x => x.id === 'reading_load');
  assert.ok(f, JSON.stringify(r.week1.findings.map(x => x.id)));
  assert.deepEqual(f.target, { reading: true, op: 'sub', context: 'plain' });
  assert.deepEqual(f.skills, ['D4.SUB']);
  assert.equal(r.plan.steps[0].card, 'Baca soalan panjang');
  const after = r.week2.findings.find(x => x.id === 'reading_load');
  assert.ok(!after || !after.evidence.gaps.some(g => g.op === 'sub'), 'subtraction gap closed after practice');
  for (const id of ['aisyah', 'adam', 'mei', 'hana']) assert.ok(!S.simulate(id).week1.findings.some(x => x.id === 'reading_load'), id);
});
