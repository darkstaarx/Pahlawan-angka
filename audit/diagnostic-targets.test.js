const test = require('node:test');
const assert = require('node:assert/strict');
const T = require('../js/engine/diagnostic-targets-v1.js');
const B = require('../js/engine/diagnostic-brain-v1.js');

const evalItem = it => {
  const m = /(\d+) ([+−×]) (\d+)/.exec(it.prompt); if (!m) return null;
  const a = +m[1], b = +m[3]; return m[2] === '+' ? a + b : m[2] === '−' ? a - b : a * b;
};

test('tables practice: ~70% of items use the weak tables, all answers correct, neighbour distractors', () => {
  const step = { target: { kind: 'tables', tables: [7, 3] } };
  const items = T.practice(step, 20, { fluentTables: [2, 5, 10] }, 42);
  assert.equal(items.length, 20);
  const targeted = items.filter(i => [7, 3].includes(i.facets.table)).length;
  assert.ok(targeted >= 13, `targeted ${targeted}/20`);
  for (const it of items) {
    assert.equal(evalItem(it), it.answer, it.prompt);
    assert.equal(it.choices.length, 4); assert.equal(it.choices.filter(c => c.tag === 'correct').length, 1);
  }
  assert.ok(items.some(i => i.choices.some(c => c.tag === 'times_neighbour')));
});

test('borrowing practice: every item needs borrowing and offers the bug answers as choices', () => {
  const items = T.practice({ target: { kind: 'regroup', op: 'sub' } }, 15, { grade: 3 }, 7);
  for (const it of items) {
    const [a, b] = it.facets.operands;
    assert.equal(it.answer, a - b);
    const A = String(a).split('').reverse(), Bd = String(b).split('').reverse();
    assert.ok(A.some((x, i) => +x < +(Bd[i] || 0)), `${a}-${b} must need borrowing`);
    assert.ok(it.choices.some(c => c.tag === 'smaller_from_larger' || c.tag === 'borrow_no_decrement'));
  }
});

test('carrying practice: every addition needs carrying', () => {
  for (const it of T.practice({ target: { kind: 'regroup', op: 'add' } }, 15, { grade: 2 }, 9)) {
    const [a, b] = it.facets.operands; assert.equal(it.answer, a + b);
    const A = String(a).split('').reverse(), Bd = String(b).split('').reverse();
    assert.ok(A.some((x, i) => +x + +(Bd[i] || 0) > 9) || Bd.some((x, i) => +x + +(A[i] || 0) > 9), `${a}+${b}`);
  }
});

test('money subtraction stories: BM wording, correct RM answers, sen/RM and operation distractors', () => {
  const items = T.practice({ target: { kind: 'money', op: 'sub' } }, 12, {}, 3);
  for (const it of items) {
    const [a, b] = [...it.prompt.matchAll(/RM(\d+\.\d\d)/g)].map(m => Math.round(+m[1] * 100));
    assert.equal(it.answer, `RM${((a - b) / 100).toFixed(2)}`, it.prompt);
    assert.ok(/baki|lagi|tinggal/.test(it.prompt));
    assert.equal(it.facets.context, 'money'); assert.equal(it.facets.format, 'word');
  }
  assert.ok(items.every(i => i.choices.some(c => c.tag === 'money_unit')));
});

test('basic facts practice repeats the most-missed facts', () => {
  const items = T.practice({ target: { kind: 'facts', factFamilies: ['sub20'], facts: ['13-5'] } }, 9, {}, 1);
  assert.ok(items.filter(i => i.prompt === '13 − 5 = ?').length >= 3);
  for (const it of items) assert.equal(evalItem(it), it.answer);
});

test('generated items feed straight back into the brain (facets survive)', () => {
  const items = T.practice({ target: { kind: 'regroup', op: 'sub' } }, 3, { grade: 3 }, 5);
  const f = B.facets(items[0], { domain: 'Operasi' });
  assert.equal(f.op, 'sub'); assert.equal(f.format, 'lazim'); assert.equal(f.regroup, true);
});

test('plan maps findings to PA actions; guessing is left to Portal Restu', () => {
  const p = T.plan({ findings: [
    { id: 'fact_fluency', text: 'x', target: { tables: [7, 3] } },
    { id: 'context_money', text: 'y', target: { context: 'money', op: 'sub' } },
    { id: 'format_word', text: 'z', target: { format: 'word' } },
    { id: 'bug_smaller_from_larger', text: 'w', target: { bug: 'smaller_from_larger', op: 'sub' } },
    { id: 'rapid_guess', text: 'g' }
  ], strengths: [] }, { grade: 3 });
  assert.deepEqual(p.steps.map(s => [s.target.kind, s.where]), [['tables', 'minigame'], ['money', 'minigame'], ['word', 'worksheet'], ['regroup', 'minigame']]);
  assert.equal(p.steps[0].card, 'Sifir 7 & 3'); assert.equal(p.steps[1].card, 'Wang: operasi tolak'); assert.equal(p.steps[3].card, 'Tolak, meminjam');
});

test('worksheet: sections from the plan, working boxes for word/money/borrowing, parent note', () => {
  const p = T.plan({ findings: [{ id: 'format_word', text: 'z', target: {} }, { id: 'fact_fluency', text: 'x', target: { tables: [7] } }] }, { grade: 3 });
  const w = T.worksheet(p, { name: 'Aisyah' }, 11);
  assert.equal(w.title, 'Latihan Pahlawan Angka · Aisyah');
  assert.equal(w.sections[0].showWorking, true); assert.equal(w.sections[0].items.length, 4);
  assert.equal(w.sections[1].showWorking, false); assert.equal(w.sections[1].items.length, 8);
  assert.match(w.parentNote, /Cara kerja/);
  assert.deepEqual(T.worksheet(p, {}, 11).sections[1].items.map(i => i.prompt), w.sections[1].items.map(i => i.prompt), 'same seed reprints the same sheet');
});

test('money without a clear operation gets a mixed story set; sen/RM bug absorbs it', () => {
  const p = T.plan({ findings: [{ id: 'context_money', text: 'y', target: { context: 'money' } }] }, {});
  assert.equal(p.steps[0].target.op, 'mixed'); assert.equal(p.steps[0].card, 'Wang: soalan cerita campur');
  const ops = new Set(T.practice(p.steps[0], 10, {}, 4).map(i => i.facets.op));
  assert.ok(ops.size >= 3, [...ops].join());
  const q = T.plan({ findings: [{ id: 'context_money', text: 'y', target: {} }, { id: 'bug_money_unit', text: 'u', target: { bug: 'money_unit' } }] }, {});
  assert.deepEqual(q.steps.map(s => s.target.kind), ['units']); assert.deepEqual(q.steps[0].also, ['context_money']);
});

test('a regroup lens and a borrowing bug share one drill', () => {
  const p = T.plan({ findings: [{ id: 'bug_smaller_from_larger', text: 'b', target: { bug: 'smaller_from_larger' } }, { id: 'regroup_sub', text: 'r', target: { op: 'sub' } }] }, {});
  assert.equal(p.steps.length, 1); assert.deepEqual(p.steps[0].also, ['regroup_sub']);
});

test('skema steps teach the exact fix (borrowing incl. zeros, carrying, sen/RM, money, sifir)', () => {
  const sub = (a, b) => T.explain({ facets: { op: 'sub', operands: [a, b], format: 'lazim' }, answer: a - b });
  assert.match(sub(302, 205), /Puluh: 0 perlu beri 1, jadi pinjam 10 dari ratus/);
  assert.match(sub(302, 205), /Jawapan: 97\./);
  assert.doesNotMatch(sub(1003, 456), /-1/);
  assert.match(T.explain({ facets: { op: 'add', operands: [748, 125], format: 'lazim' }, answer: 873 }), /tulis 3, kumpul semula 1 ke puluh/);
  const [u] = T.practice({ target: { kind: 'units' } }, 1, {}, 3); assert.match(T.explain(u), /100 sen/);
  for (const it of T.practice({ target: { kind: 'money', op: 'mixed' } }, 5, {}, 3)) assert.ok(T.explain(it).endsWith(it.answer + '.'), T.explain(it));
  assert.match(T.explain({ facets: { op: 'mul', operands: [3, 6], table: 3 }, answer: 18 }), /3 × 5 = 15, tambah 3 lagi/);
});

test('worksheetItems: ~60% targeted, every item has a skema, working box for word/money/regroup', () => {
  const p = T.plan({ findings: [
    { id: 'fact_fluency', text: 'Sifir 7 belum dikuasai.', target: { tables: [7] } },
    { id: 'bug_smaller_from_larger', text: 'Tolak tanpa meminjam.', target: { bug: 'smaller_from_larger' } },
    { id: 'format_word', text: 'Keliru soalan berayat.', target: {} }] }, { grade: 3 });
  const w = T.worksheetItems(p, 20, { grade: 3 }, 9);
  assert.equal(w.items.length, 12); assert.deepEqual(w.titles, ['Sifir 7', 'Tolak, meminjam', 'Soalan berayat']);
  assert.equal(new Set(w.items.map(i => i.prompt)).size, 12, 'no repeats');
  for (const it of w.items) { assert.ok(it.solution && it.targeted && it.focus); assert.equal(it.showWorking, it.focus !== 'Sifir 7'); }
  assert.deepEqual(T.worksheetItems({ steps: [] }, 20).items, []);
});

test('a single focus is capped at 8 items; the bank fills the rest', () => {
  const p = T.plan({ findings: [{ id: 'bug_money_unit', text: 'u', target: { bug: 'money_unit' } }] }, {});
  assert.equal(T.worksheetItems(p, 20, {}, 3).items.length, 8);
});
