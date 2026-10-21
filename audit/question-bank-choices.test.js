// Darjah 1–2 choices are real: no "tidak pasti" / "tidak tahu" fillers, four different
// choices, and a claim never compares a group with an equal one. Loads the question banks
// the way the app does (index.html scripts, then the lazily loaded banks, Year 1/6 v2 last as in js/pwa.js).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
function app() {
  const doc = { documentElement: { dataset: {}, setAttribute() {} }, getElementById() { return null }, querySelector() { return null }, querySelectorAll() { return [] } };
  const c = { console: { log() {}, info() {}, warn() {}, error() {} }, Math, document: doc, setTimeout() {}, clearTimeout() {},
    sess: { mode: 'practice', questionHistory: [], questionFingerprints: [] }, localStorage: { getItem() { return null }, setItem() {} } };
  c.window = c; c.globalThis = c; vm.createContext(c);
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8'), sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const eager = [...html.matchAll(/src="((?:questions|data\/kssr)\/[^"?]+\.js)/g)].map(m => m[1]).filter(f => !/questions\/index\.js|fractions-audit/.test(f));
  const lazy = [...sw.matchAll(/'\.\/((?:questions|data\/kssr)\/[^']+\.js)'/g)].map(m => m[1]).filter(f => !/index\.js$/.test(f));
  // js/pwa.js loads the Year 1 and Year 6 v2 banks after the older depth banks, so they win.
  const late = f => /kssr-year[16]-|year[16]-competencies/.test(f);
  for (const f of [...new Set([...eager, ...lazy.filter(f => !late(f)), ...lazy.filter(late), 'questions/index.js'])]) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), c, { filename: f });
  vm.runInContext('globalThis.__generate=generate;globalThis.__skills=GRAPH.skills', c);
  return c;
}
const strip = s => String(s ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const states = [{ mastery: 5 }, { mastery: 55, evidence: 5, confidence: 55, correct: 4, wrong: 1 }, { mastery: 85, evidence: 8, confidence: 80, correct: 7, wrong: 0 }];

test('Darjah 1–2: every choice is real and the four choices differ', () => {
  const c = app(), bad = [];
  for (const sk of c.__skills.filter(s => s.grade <= 2)) {
    c.sess.questionHistory = []; c.sess.questionFingerprints = []; c.sess.questionKeys = [];
    for (let i = 0; i < 120; i++) {
      const q = c.__generate(sk.id, states[i % 3]), ans = strip(q.answer), opts = (q.wrong || []).map(w => strip(w && typeof w === 'object' ? (w.label ?? w.v) : w));
      if (opts.some(o => /tidak pasti|tidak tahu|fallback/i.test(o))) bad.push(`${sk.id} ${q.archetypeId}: ${opts.join(' / ')}`);
      if (new Set([ans, ...opts]).size !== 4) bad.push(`${sk.id} ${q.archetypeId}: not 4 choices: ${[ans, ...opts].join(' / ')}`);
      // "kumpulan 8 objek lebih banyak daripada kumpulan 8 objek" has no right answer.
      const m = /kumpulan (\d+) objek lebih banyak daripada kumpulan (\d+) objek/.exec(strip(q.prompt));
      if (m && m[1] === m[2]) bad.push(`${sk.id}: equal groups ${m[0]}`);
    }
  }
  assert.deepEqual([...new Set(bad)].slice(0, 10), []);
});

test('repaired items keep a right answer that matches the question', () => {
  const c = app(), seen = {};
  for (const id of ['D1.N20', 'D1.N100', 'D2.6.1', 'D2.6.2', 'D2.6.3', 'D2.3.3', 'D2.5.2']) {
    c.sess.questionHistory = []; c.sess.questionFingerprints = []; c.sess.questionKeys = [];
    for (let i = 0; i < 300; i++) {
      const q = c.__generate(id, states[i % 3]), p = strip(q.prompt), ans = strip(q.answer);
      let m;
      if ((m = /Pita A (\d+) cm, Pita B (\d+) cm dan Pita C (\d+) cm/.exec(p)) || (m = /Bungkusan A (\d+) g, B (\d+) g dan C (\d+) g/.exec(p)) || (m = /Bekas A (\d+) mL, Bekas B (\d+) mL dan Bekas C (\d+) mL/.exec(p))) {
        const v = m.slice(1).map(Number); assert.equal(ans, 'ABC'[v.indexOf(Math.max(...v))], p); seen.three = 1;
      }
      if ((m = /membundarkan (\d+) kepada (\d+)/.exec(p))) {
        const r = Math.round(+m[1] / 10) * 10; assert.equal(ans, +m[2] === r ? 'betul' : `salah, sepatutnya ${r}`, p); seen.round = 1;
      }
      if ((m = /^(\d+) jam (\d+) minit = \? minit$/.exec(p))) { assert.equal(+ans, m[1] * 60 + +m[2], p); seen.mix = 1; }
      if ((m = /^(\d+) (minit = \? jam|jam = \? hari|hari = \? minggu)$/.exec(p))) { assert.equal(+ans, m[1] / { 'minit = ? jam': 60, 'jam = ? hari': 24, 'hari = ? minggu': 7 }[m[2]], p); seen.back = 1; }
    }
  }
  assert.deepEqual(Object.keys(seen).sort(), ['back', 'mix', 'round', 'three']);
});
