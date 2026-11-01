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
  assert.match(source, /q\.form\.type==='frac'\?'\/':ORDER\(\)\.length>1/);
  assert.match(source, /e\.key==='\/'&&q\.form\.type==='frac'/);
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
