const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../kedai-kek.html'), 'utf8');
const PAWorked = require('../js/minigame-worked-v1.js');

function between(start, end) {
  const from = source.indexOf(start), to = source.indexOf(end, from + start.length);
  assert.ok(from >= 0 && to > from, 'Cannot find production implementation: ' + start);
  return source.slice(from, to);
}
const order = source.match(/^const ORDER=.*;$/m);
assert.ok(order, 'Missing fraction field order');

function padHarness(form) {
  const q = { kind: 'pad', form };
  const inp = {};
  let fk = form.type === 'frac' ? 'n' : 'v';
  const context = {
    q, inp, solved: false, fk, renderFields() {},
    $(id) {
      assert.equal(id, 'ansrow');
      return { querySelectorAll() { return [{ classList: { remove() {} } }]; } };
    },
    hideMsg() {}, sfx() {},
  };
  const api = vm.runInNewContext([
    order[0],
    between('function key(k){', 'function renderFields(){'),
    between('function evalPad(){', 'const FORM_MSG='),
    '({ key, evalPad, get focus() { return fk; } })',
  ].join('\n'), context);
  return { api, inp };
}

test('a Darjah 2 bottle accepts 4 / 10 with the visible fraction separator', () => {
  const h = padHarness({ type: 'frac', n: 4, d: 10 });
  h.api.key('4');
  h.api.key('/');
  assert.equal(h.api.focus, 'd');
  h.api.key('1');
  h.api.key('0');
  assert.equal(h.inp.n, '4');
  assert.equal(h.inp.d, '10');
  assert.equal(h.api.evalPad().ok, 1);
});
test('other input modes keep their keypad semantics and fraction prompts are explicit', () => {
  assert.match(source, /const keys=dual\?/);
  assert.match(source, /e\.key==='\/'&&\['frac','tenth'\]\.includes\(q\.form\.type\)/);
  assert.match(source, /Atas: pengangka · Tekan \/ · Bawah: penyebut/);
  const h = padHarness({ type: 'int', v: 13 });
  h.api.key('1'); h.api.key('3');
  assert.equal(h.api.evalPad().ok, true);
});
test('the actual Wira explanation for 4 of 10 bottle parts matches the answer', () => {
  const p = PAWorked.buildFrac({ t: 'read', d: 10, sh: 4, label: 'berisi jus' });
  assert.ok(p);
  assert.deepEqual(p.value, { N: 4, D: 10, exact: true });
  assert.equal(p.steps.length, 2);
  assert.equal(p.steps[0].right, '10');
  assert.equal(p.steps[1].right, '4');
});
test('after two hints the pupil can open guided steps without deliberately answering wrong', () => {
  const hint = { textContent: 'Tanya Wira', disabled: false, classList: { add() {} } };
  let opened = 0;
  const q = {
    kind: 'pad', mode: 'persepuluh',
    wk: { t: 'read', d: 10, sh: 4, label: 'berisi jus' },
    form: { type: 'frac', n: 4, d: 10 },
    s: 'Kira bahagian berisi jus.', a: '4 daripada 10 = [4/10].',
  };
  const context = {
    q, window: { PAWorked }, solved: false, misses: 0, hints: 0, hint2: 0,
    $(id) { assert.equal(id, 'hint'); return hint; },
    hintTwo() { return 'Empat bahagian berisi jus.'; },
    msg() {}, sfx() {}, startWorked() { opened++; },
  };
  const code = [
    between('let workedOffer=false,repeatNext=null;', 'function startWorked(){'),
    between("$('hint').onclick=()=>", "$('sound').onclick="),
    '({ click() { return $("hint").onclick(); }, get offered() { return workedOffer; } })',
  ].join('\n');
  const api = vm.runInNewContext(code, context);
  api.click();
  assert.equal(hint.textContent, 'Petunjuk lagi');
  api.click();
  assert.equal(api.offered, true);
  assert.equal(hint.textContent, 'Jom tengok cara');
  assert.equal(hint.disabled, false);
  api.click();
  assert.equal(opened, 1);
});

test('Darjah 2 cake and bottle both accept a fraction or an equivalent decimal', () => {
  for (const n of [1, 3, 4, 9]) {
    const forms = [n + '/10', '0.' + n, '0.' + n + '0', (n * 2) + '/20'];
    for (const entered of forms) {
      const h = padHarness({ type: 'tenth', n, d: 10, v: n / 10 });
      for (const key of entered) h.api.key(key);
      assert.equal(h.inp.v, entered);
      assert.equal(h.api.evalPad().ok, true, entered);
    }
  }
});
test('invalid, incomplete, zero-denominator and wrong tenth answers are rejected', () => {
  const cases = [
    ['', 'empty'], ['3/', 'incomplete'], ['0.', 'incomplete'],
    ['3/0', 'zero'], ['4/10', 'wrong'], ['0.4', 'wrong'], ['3/9', 'wrong'],
  ];
  for (const [entered, reason] of cases) {
    const h = padHarness({ type: 'tenth', n: 3, d: 10, v: 0.3 });
    for (const key of entered) h.api.key(key);
    const result = h.api.evalPad();
    assert.equal(reason === 'wrong' ? result.ok : result[reason], reason === 'wrong' ? false : 1, entered);
  }
  const h = padHarness({ type: 'tenth', n: 3, d: 10 });
  for (const key of '0.3') h.api.key(key);
  h.api.key('/');
  assert.equal(h.inp.v, '0.3', 'mixed separators cannot create malformed input');
  h.api.key('⌫');
  assert.equal(h.inp.v, '0.');
});
test('the actual D2 generator uses dual answers only when mathematically appropriate', () => {
  const gen = between('const GEN={', "const A='assets/minigames/kedai-kek/';");
  const context = {
    R: (a, b) => Math.min(b, Math.max(a, 3)),
    fs: (n, d) => '[' + n + '/' + d + ']',
    FR: (n, d) => ({ type: 'frac', n, d }),
    DEC: v => ({ type: 'dec', v }),
    TENTH: n => ({ type: 'tenth', n, d: 10, v: n/10 }),
    Math,
  };
  const GEN = vm.runInNewContext(gen + '\nGEN', context);
  for (const archetype of ['coloured_card', 'filled_bottle', 'remaining_part']) {
    const item = GEN[2].persepuluh.find(t => t.arch === archetype);
    assert.ok(item, archetype);
    const round = item.f({ who: 'Kawan', fl: { n: 'pandan' } });
    assert.equal(round.form.type, 'tenth', archetype);
    assert.match(round.q, /pecahan atau perpuluhan/, archetype);
    const h = padHarness(round.form);
    const actual = round.form.n;
    for (const key of '0.' + actual) h.api.key(key);
    assert.equal(h.api.evalPad().ok, true, archetype);
  }
  const convert = GEN[2].persepuluh.find(t => t.arch === 'decimal_to_fraction').f({});
  assert.equal(convert.form.type, 'frac', 'conversion exercises must require a new representation');
});
test('the worked example stays accessible with the equivalent tenth form', () => {
  assert.match(source, /f\.type==='frac'\|\|f\.type==='tenth'\?\[f\.n,f\.d\]/);
  const p = PAWorked.buildFrac({ t: 'read', d: 10, sh: 9, label: 'berisi jus' });
  assert.equal(p.value.N, 9);
  assert.equal(p.value.D, 10);
});
test('tutorial highlights are static gold, not red pulsing', () => {
  assert.match(source, /\.wk-c\.wk-next,\.wk-box\.wk-next\{[^}]*animation:none!important/);
  assert.match(source, /\.wk-c\.wk-next,\.wk-box\.wk-next\{[^}]*#fff4cf/);
  assert.match(source, /\.tiles\.kp\.dual\{grid-template-columns:repeat\(7,minmax\(0,1fr\)\)/);
});

test('all three real D2 tenth generators still produce the exact guided solution', () => {
  const gen = between('const GEN={', "const A='assets/minigames/kedai-kek/';");
  const GEN = vm.runInNewContext(gen + '\nGEN', {
    R: (a, b) => Math.min(b, Math.max(a, 3)),
    fs: (n, d) => '[' + n + '/' + d + ']',
    FR: (n, d) => ({ type: 'frac', n, d }),
    DEC: v => ({ type: 'dec', v }),
    TENTH: n => ({ type: 'tenth', n, d: 10, v: n / 10 }),
    Math,
  });
  const worked = between('function workedPlan(){', 'const KK_HTML=');
  for (const archetype of ['coloured_card', 'filled_bottle', 'remaining_part']) {
    const item = GEN[2].persepuluh.find(t => t.arch === archetype);
    const round = item.f({ who: 'Kawan', fl: { n: 'pandan' } });
    const plan = vm.runInNewContext(worked + '\nworkedPlan()', {
      q: round, window: { PAWorked },
    });
    assert.ok(plan, 'Guided plan missing: ' + archetype);
    assert.equal(plan.value.N, round.form.n);
    assert.equal(plan.value.D, 10);
  }
});
