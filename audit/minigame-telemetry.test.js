const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const GAMES = ['gudang-harta', 'kedai-kek', 'bengkel-ajaib', 'dapur-ramuan', 'pos-peninjau', 'lombong-permata', 'tapak-bina', 'menara-jam', 'gerai-wirayung'];

test('every mini game reports each try (wrong and right) to the parent', () => {
  for (const g of GAMES) {
    const s = fs.readFileSync(path.join(ROOT, g + '.html'), 'utf8');
    assert.match(s, /function paAttempt\(ok\)/, g);
    assert.match(s, /type:'PA_MINIGAME_ATTEMPT'/, g);
    assert.ok((s.match(/paAttempt\(false\),misses\+\+/g) || []).length >= 1, g + ' wrong tries');
    assert.ok(/paAttempt\(true\)/.test(s), g + ' right answer');
    assert.match(s, /paLast=(Date\.now\(\)|paLast)|roundStartedAt=paLast=Date\.now\(\)/, g + ' round timer');
  }
});

function load() {
  const calls = [], listeners = [], child = { id: 'child' };
  const win = {
    addEventListener: (t, f) => listeners.push(f),
    PATelemetry: { response: (...a) => calls.push(a) }
  };
  const doc = { querySelectorAll: () => [{ contentWindow: child }] };
  const src = fs.readFileSync(path.join(ROOT, 'js/minigame-telemetry-v1.js'), 'utf8');
  new Function('window', 'document', 'location', src)(win, doc, { origin: 'https://pa.test' });
  const send = (data, source = child, origin = 'https://pa.test') => listeners.forEach(f => f({ data: { type: 'PA_MINIGAME_ATTEMPT', version: 1, game: 'gudang-harta', skillId: 'D2.2.2', hints: 0, ...data }, source, origin }));
  return { calls, send };
}

test('wrong first try → first-attempt, later right → retry; extra wrong tries are not double counted', () => {
  const { calls, send } = load();
  send({ key: 'n:1', prompt: '52 − 27 = ?', ok: false, first: true, ms: 600 });
  send({ key: 'n:1', prompt: '52 − 27 = ?', ok: false, first: false, ms: 400 });
  send({ key: 'n:1', prompt: '52 − 27 = ?', answer: '25', ok: true, first: false, ms: 5000 });
  send({ key: 'n:1', ok: true, first: false, ms: 10 });                    // duplicate success ignored
  send({ key: 'n:2', prompt: '9 × 7 = ?', answer: '63', ok: true, first: true, ms: 2500 });
  assert.deepEqual(calls.map(c => [c[1], c[6], c[3]]), [[false, 'minigame-first-attempt', 0.6], [true, 'minigame-retry', 5], [true, 'minigame', 2.5]]);
  assert.equal(calls[0][5].token, 'mg-n:1'); assert.equal(calls[0][5].prompt, '52 − 27 = ?');
});

test('a real session nonce (UUID) still gives every round its own brain record', () => {
  const B = require('../js/engine/diagnostic-brain-v1.js');
  const { calls, send } = load(), nonce = '0c4aaffa-3987-4688-b159-bd954ff9d657';
  for (let i = 1; i <= 12; i++) send({ key: `${nonce}:${i}`, prompt: `${i} + 5 = ?`, answer: String(i + 5), ok: true, first: true, ms: 4000 });
  let log = [];
  for (const c of calls) log = B.applyResponse(log, { q: c[5], ok: c[1], sec: c[3], mode: c[6], at: 1e12 });
  assert.equal(log.length, 12, 'the brain keeps 40 characters of a token; the round number must survive');
  assert.equal(new Set(log.map(r => r.id)).size, 12);
});

test('messages from outside a child frame or another origin are ignored', () => {
  const { calls, send } = load();
  send({ key: 'f:1', ok: false, first: true, ms: 300 }, { id: 'stranger' });
  send({ key: 'f:2', ok: false, first: true, ms: 300 }, undefined, 'https://evil.test');
  assert.equal(calls.length, 0);
});
