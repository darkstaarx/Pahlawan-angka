// Parent Ringkasan at a glance: activity + praise first, then what to strengthen.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const G = require('../js/parent-glance-v1.js');
const B = require('../js/engine/diagnostic-brain-v1.js');
const T = require('../js/engine/diagnostic-targets-v1.js');
const S = require('../tools/diagnostic-sim.js');

const DAY = 864e5;
const noon = new Date(2026, 9, 21, 12).getTime();
const META = Object.fromEntries(JSON.parse(fs.readFileSync('data/kssr/knowledge-graph.json', 'utf8')).skills.map(m => [m.id, m]));
const title = g => id => META[id] && META[id].grade === g ? META[id].title : null;
const view = (id, extra = {}) => {
  const r = S.simulate(id), now = Date.now(), result = B.analyze(r.log1, { now, name: r.persona.name });
  return G.compose({ name: r.persona.name, log: r.log1, result, plan: T.plan(result, { grade: r.persona.grade }), skillTitle: title(r.persona.grade), now, ...extra });
};

test('activity counts this week, today and active days on local calendar days', () => {
  const t = [noon, noon - 3e5, noon - DAY, noon - 3 * DAY, noon - 6 * DAY, noon - 7 * DAY, noon - 30 * DAY];
  assert.deepEqual(G.activity(t, noon), { week: 5, today: 2, days: 4 });
  assert.deepEqual(G.activity([], noon), { week: 0, today: 0, days: 0 });
});

test('dummy child: praise first (effort, then strengths), then up to 3 short labels to strengthen', () => {
  const v = view('aisyah', { strongIds: ['D3.ADD10000'] });
  assert.equal(v.title, 'Syabas, Aisyah!');
  assert.ok(v.activity.week >= 100 && v.activity.days >= 5, JSON.stringify(v.activity));
  assert.match(v.praise, /^Aisyah rajin berlatih: \d daripada 7 hari\. Hebat dalam sifir [\d, dan]+, dan selesa dengan tambah hingga 10,000\.$/);
  assert.deepEqual(v.improve.items, ['Sifir 3', 'Wang: operasi tolak', 'Tolak, meminjam']);
  assert.equal(v.improve.title, '3 perkara untuk dilatih');
  assert.ok(v.improve.detail);
  for (const x of v.improve.items) assert.ok(x.length <= 30, x);
});

test('rapid guessing leads the list; a skill being strengthened is not praised as comfortable', () => {
  const v = view('adam', { strongIds: ['D1.SUB20', 'D1.N20'] });
  assert.equal(v.improve.items[0], 'Menjawab terlalu cepat');
  assert.match(v.improve.note, /baca soalan dahulu/);
  const steps = { steps: [{ card: 'Fakta asas hingga 20', skills: ['D1.SUB20'] }] };
  const w = G.compose({ name: 'Adam', log: [{ t: noon, s: 'D1.N20', k: 1 }], result: { enough: true, findings: [], strengths: [] }, plan: steps, strongIds: ['D1.SUB20', 'D1.N20'], skillTitle: title(1), now: noon });
  assert.match(w.praise, /Selesa dengan nombor hingga 20\./);
  assert.doesNotMatch(w.praise, /tolak hingga 20/i);
});

test('cleared bugs are praised as "semakin baik"; no strengths still praises effort only', () => {
  const log = [{ t: noon - 3e5, k: 1 }];
  const v = G.compose({ name: 'Mei', log, result: { enough: true, findings: [], strengths: [{ id: 'improved_smaller_from_larger', strength: true }, { id: 'basic_strength', strength: true, evidence: { facts: ['tambah asas hingga 20'] } }] }, now: noon });
  assert.equal(v.praise, 'Mei sudah berlatih hari ini. Hebat dalam tambah asas hingga 20. Semakin baik dalam tolak yang perlu meminjam.');
  assert.deepEqual([v.improve.title, v.improve.items], ['Tiada yang membimbangkan', []]);
  const w = G.compose({ name: 'Mei', log: [{ t: noon - 2 * DAY, k: 1 }], result: { enough: false, total: 1, findings: [], strengths: [] }, now: noon });
  assert.equal(w.praise, 'Mei berlatih 1 hari minggu ini.');
  assert.equal(w.improve.title, 'Belum cukup bukti'); assert.equal(w.improve.detail, false);
});

test('no recent play: a gentle start, journey encounters count when there is no brain log', () => {
  const idle = G.compose({ name: 'Aina', log: [], encounters: [], now: noon });
  assert.equal(idle.title, 'Jom mula minggu ini');
  assert.match(idle.praise, /^Belum ada latihan dalam 7 hari lepas/);
  const journey = G.compose({ name: 'Aina', log: [], encounters: [{ resolvedAt: noon - 6e4 }, { resolvedAt: noon - DAY }], priorityTitles: ['Tolak wang'], now: noon });
  assert.deepEqual(journey.activity, { week: 2, today: 1, days: 2 });
  assert.deepEqual(journey.improve.items, ['Tolak wang']);
});

test('markup escapes the child name and links the details to the Kemahiran tab', () => {
  const html = G.markup(G.compose({ name: '<img src=x onerror=alert(1)>', log: [{ t: noon, k: 1 }], result: { enough: true, findings: [], strengths: [] }, now: noon }), { grade: 2 });
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;img src=x/);
  assert.match(html, /AKTIVITI 7 HARI · DARJAH 2/);
  assert.match(html, /onclick="tab\('core'\)">Lihat butiran/);
});

test('Ringkasan tab markup: Restu entry first when needed, then the two cards', () => {
  const src = fs.readFileSync('js/parent.js', 'utf8');
  const fn = name => { const a = src.indexOf(`function ${name}(`); return src.slice(a, src.indexOf('\n}\n', a) + 3); };
  const el = {};
  const doc = { getElementById: id => (el[id] ??= { innerHTML: '' }) };
  const r = S.simulate('aisyah'), result = B.analyze(r.log1, { name: 'Aisyah' });
  const c = { window: { PAParentGlance: G, PADiagnostic: { current: () => result }, PATargets: T }, document: doc, META,
    db: { name: 'Aisyah', diagLog: r.log1, restuLock: { active: true } }, learnerRows: () => [] };
  vm.createContext(c);
  vm.runInContext(['parentSafe', 'parentGlanceMarkup', 'parentRestuNeeded', 'renderParentRestuEntry'].map(fn).join('\n'), c);
  const summary = { strong: [], priority: [] };
  doc.getElementById('summaryTab').innerHTML = `${c.renderParentRestuEntry({ title: 'Darab' })}${c.parentGlanceMarkup(3, summary)}`;
  const html = el.summaryTab.innerHTML;
  assert.ok(html.indexOf('parentRestuEntry') < html.indexOf('paGlance') && html.indexOf('paGlance') < html.indexOf('paImprove'));
  assert.match(html, /Syabas, Aisyah!/); assert.match(html, /<li>Sifir 3<\/li>/);
  assert.match(src, /getElementById\("summaryTab"\)\.innerHTML=`\$\{renderParentRestuEntry\(restuFocus\)\}\$\{parentGlanceMarkup\(g,summary\)\}`/);
});

test('one "Punca utama" sentence next to the list, only when there is something to practise', () => {
  const v = view('aisyah', { cause: 'Nilai tempat nombor' });
  assert.equal(v.improve.note, 'Punca utama: Nilai tempat nombor. Latihan khas sudah disediakan dalam Kemahiran Fokus.');
  assert.equal(v.improve.items.length, 3, 'the list stays at 3 short labels');
  const calm = G.compose({ name: 'Ali', log: [], result: { enough: true, findings: [], strengths: [] }, plan: { steps: [] }, cause: 'Nilai tempat nombor', now: noon });
  assert.equal(calm.improve.title, 'Tiada yang membimbangkan');
  assert.ok(!/Punca/.test(calm.improve.note));
  assert.match(G.markup(v), /<p class="paGlanceNote">Punca utama: Nilai tempat nombor\./);
});
