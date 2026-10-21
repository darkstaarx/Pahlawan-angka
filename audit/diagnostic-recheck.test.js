// Re-check loop (docs/PA-DIAGNOSTIC-BRAIN.md §8a, Next 4, lens 4.7): after a targeted
// set, wait 2 days, then a short check decides "Semakin baik" or keep the focus.
// Browser side (Gudang Harta check mode): minigame-targets-browser.test.js.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const R = require('../js/engine/diagnostic-recheck-v1.js');
const T = require('../js/engine/diagnostic-targets-v1.js');
const S = require('../tools/diagnostic-sim.js');

const GRAPH = JSON.parse(fs.readFileSync('data/kssr/knowledge-graph.json', 'utf8'));
const META = Object.fromEntries(GRAPH.skills.map(m => [m.id, m]));
const load = (c, file) => vm.runInContext(fs.readFileSync(file, 'utf8'), c, { filename: file });
const plain = x => JSON.parse(JSON.stringify(x));
const DAY = 864e5, T0 = Date.UTC(2026, 9, 19, 2);      // Monday 10:00 in Malaysia
const STEP = { finding: 'fact_fluency', target: { kind: 'tables', tables: [3] }, card: 'Sifir 3', skills: ['D3.MUL'] };
// A sifir 3 answer as the brain stores it (js/engine/diagnostic-brain-v1.js compact()).
const rec = (t, ok, extra = {}) => ({ t, s: 'D3.MUL', o: 'mul', c: 'plain', f: 'symbolic', k: ok ? 1 : 0, sec: 6, w: 4, tb: [3], a: [3, 4], ...extra });
const answers = (from, oks, gap = 6e4) => oks.map((ok, i) => rec(from + i * gap, ok));

test('a set, a 2-day wait, then a 6-question check: 5/6 → Semakin baik', () => {
  const p = { diagLog: [] };
  assert.equal(R.state(p, STEP, T0), null, 'nothing until a Fokus card starts the target');
  assert.equal(R.start(p, STEP, T0).status, 'practising');
  p.diagLog.push(...answers(T0 + 1e3, [1, 0, 1, 1, 0, 1, 1]));
  assert.deepEqual([R.state(p, STEP, T0 + DAY).status, R.state(p, STEP, T0 + DAY).done], ['practising', 7]);
  p.diagLog.push(rec(T0 + 1e6, 1));
  const wait = R.state(p, STEP, T0 + 2e6);
  assert.equal(wait.status, 'waiting'); assert.equal(wait.dueLabel, 'lusa');
  assert.equal(R.state(p, STEP, T0 + 1e6 + 2 * DAY).status, 'due');
  // Practice during the wait is not the check: only answers after the due time count.
  p.diagLog.push(...answers(T0 + DAY, [0, 0, 0]));
  p.diagLog.push(...answers(T0 + 3 * DAY, [1, 1, 0, 1, 1]));
  assert.deepEqual([R.state(p, STEP, T0 + 3 * DAY + 1e6).status, R.state(p, STEP, T0 + 3 * DAY + 1e6).done], ['due', 5]);
  p.diagLog.push(rec(T0 + 3 * DAY + 2e6, 1));
  const passed = R.state(p, STEP, T0 + 3 * DAY + 3e6);
  assert.deepEqual([passed.status, passed.score], ['passed', '5/6']);
  assert.equal(R.state(p, STEP, T0 + 11 * DAY).status, 'settled', '"Semakin baik" shows for a week');
});

test('a failed check keeps the focus and starts a new set; guesses and other skills never count', () => {
  const p = { diagLog: [] };
  R.start(p, STEP, T0);
  p.diagLog.push(...answers(T0 + 1e3, [1, 1, 1, 1, 1, 1, 1, 1]));
  // Check after 2 days: only 3/6 on the first try (hints do not count as independent).
  p.diagLog.push(...answers(T0 + 3 * DAY, [1, 0, 1, 0, 0, 1]).map((r, i) => i === 0 ? { ...r, h: 1 } : r));
  const kept = R.state(p, STEP, T0 + 3 * DAY + 1e6);
  assert.deepEqual([kept.status, kept.round, kept.done], ['practising', 2, 0]);
  // Rapid guesses, other tables and other operations are ignored.
  p.diagLog.push(rec(T0 + 4 * DAY, 1, { sec: 0.6 }), rec(T0 + 4 * DAY + 1, 1, { tb: [7] }), rec(T0 + 4 * DAY + 2, 1, { o: 'add', tb: undefined }));
  assert.equal(R.state(p, STEP, T0 + 4 * DAY + 1e5).done, 0);
  // Starting the card again does not reset a running loop.
  R.start(p, STEP, T0 + 4 * DAY + 2e5);
  assert.equal(p.diagRecheckV1.starts['tables:3'].at, T0);
});

test('targets map to the answers that practise them; operation choice is not re-checked', () => {
  const key = target => R.matcher({ target })?.key ?? null;
  assert.equal(key({ kind: 'tables', tables: [7, 3] }), 'tables:3,7');
  assert.equal(key({ kind: 'review', review: ['sifir 6', 'tambah asas'] }), 'tables:6');
  assert.equal(key({ kind: 'review', review: ['tolak asas'] }), 'facts:sub20');
  assert.equal(key({ kind: 'facts', factFamilies: ['sub20', 'add20'] }), 'facts:add20,sub20');
  assert.equal(key({ kind: 'regroup', op: 'sub' }), 'regroup:sub');
  assert.equal(key({ kind: 'money', op: 'sub' }), 'money:sub');
  assert.equal(key({ kind: 'word' }), 'word', 'word problems: checked with word problems without a drawn bar');
  for (const t of [{ kind: 'mixed' }, { kind: 'tables', tables: [] }]) assert.equal(key(t), null, JSON.stringify(t));
  const borrow = R.matcher({ target: { kind: 'regroup', op: 'sub' } }).test;
  assert.equal(borrow({ o: 'sub', rg: 1 }), true); assert.equal(borrow({ o: 'sub', rg: 0 }), false);
});

// The real Kemahiran Fokus code with the real brain, targets and re-check modules.
function app(profile) {
  const calls = [], node = () => ({ classList: { add() {}, remove() {}, contains: () => false }, focus() {} });
  const c = { console, Math, Set, Map, GRAPH, META, db: profile, questionBankFor: () => () => ({}), save: () => calls.push(['save']),
    document: { getElementById: node, activeElement: null }, openGembok: o => calls.push(['gembok', o]) };
  c.Date = class extends Date { constructor(...a) { super(...(a.length ? a : [c.now])); } static now() { return c.now; } };
  c.PAWirayungLive = { tryStartFocus: () => false };
  c.PAFocusMiniGamesLive = { tryStartFocus: (id, t) => (calls.push(['minigame', id, t]), true) };
  c.window = c; c.globalThis = c; vm.createContext(c);
  for (const f of ['js/engine/diagnostic-brain-v1.js', 'js/engine/diagnostic-targets-v1.js', 'js/engine/diagnostic-recheck-v1.js', 'js/guardian-focus.js']) load(c, f);
  vm.runInContext('focusPickerProfile=db', c);
  return { c, calls, cards: () => plain(c.PAFocusPractice.summary().items) };
}

test('Aisyah: the Fokus card walks practise → wait → due check → Semakin baik', () => {
  const sim = S.simulate('aisyah'), last = Math.max(...sim.log1.map(r => r.t));
  const profile = { name: 'Aisyah', schoolGrade: 3, diagLog: sim.log1.map(r => ({ ...r })) };
  const a = app(profile); a.c.now = last + 6e4;
  const first = a.cards()[0];
  assert.deepEqual([first.id, first.reason, first.recheck], ['D3.MUL', 'Sifir 3', null], 'before any targeted set');
  // Opening the card starts the loop and saves it.
  a.c.PAFocusPractice.start('D3.MUL');
  assert.deepEqual(plain(a.calls), [['save'], ['minigame', 'D3.MUL', { kind: 'tables', tables: [3] }]]);
  const t0 = profile.diagRecheckV1.starts['tables:3'].at;
  // A mixed targeted set: 8 sifir 3 answers, about half right.
  profile.diagLog.push(...answers(t0 + 1e3, [1, 0, 1, 0, 1, 0, 1, 1]));
  a.c.now = t0 + 1e6;
  let card = a.cards().find(x => x.id === 'D3.MUL');
  assert.equal(card.recheck, 'waiting'); assert.equal(card.reason, 'Sifir 3 · Semakan semula lusa');
  // Two days later the check is due: first card, and the game gets a mixed check target.
  a.c.now = t0 + 2 * DAY + 1e6;
  card = a.cards()[0];
  assert.deepEqual([card.id, card.reason, card.recheck], ['D3.MUL', 'Semakan semula: Sifir 3', 'due']);
  a.calls.length = 0; a.c.PAFocusPractice.start('D3.MUL');
  assert.deepEqual(plain(a.calls.filter(x => x[0] === 'minigame')), [['minigame', 'D3.MUL', { kind: 'tables', tables: [3], check: true }]]);
  // The check goes well; the brain may even drop the finding, but the card stays to say so.
  profile.diagLog.push(...answers(a.c.now + 1e3, [1, 1, 1, 0, 1, 1]));
  a.c.now += 1e6;
  card = a.cards().find(x => x.id === 'D3.MUL');
  assert.deepEqual([card.reason, card.recheck], ['Semakin baik: Sifir 3 (5/6)', 'passed']);
  const order = a.cards().map(x => x.id);
  assert.ok(order.indexOf('D3.MUL') > 0, 'a passed card is no longer the first focus: ' + order.join(', '));
});

test('profiles that never opened a brain card are unchanged', () => {
  const sim = S.simulate('mei');
  const profile = { name: 'Mei Ling', schoolGrade: 3, diagLog: sim.log1 };
  const a = app(profile); a.c.now = Math.max(...sim.log1.map(r => r.t)) + 6e4;
  const cards = a.cards();
  assert.ok(cards.every(x => x.recheck === null || x.recheck === undefined));
  assert.equal(cards[0].reason, 'Sen dan ringgit');
});
