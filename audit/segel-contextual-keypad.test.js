const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('js/segel-demo-v2.1.0.js', 'utf8');
const css = fs.readFileSync('css/segel-demo-v2.1.0.css', 'utf8');
const page = fs.readFileSync('index.html', 'utf8');
const jelajah = fs.readFileSync('jelajah-runtime.html', 'utf8');
const a = source.indexOf('  function segelSafeTypedSpec(answer){');
const b = source.indexOf('  function renderTypedAnswer(q,box){', a);
assert.ok(a > 0 && b > a, 'Production Segel helpers are present');
const doc = {
  createElement(tag) {
    return {
      tagName: tag, value: '', textContent: '', children: [], attrs: {},
      classList: { add() {}, remove() {} },
      setAttribute(k, v) { this.attrs[k] = v; },
      appendChild(child) { this.children.push(child); },
      dispatchEvent() {},
    };
  },
};
const api = vm.runInNewContext(source.slice(a, b) +
  '\n({segelSafeTypedSpec,segelSafeTypedMatch,segelAnswerFormat,segelTypedValueValid,segelTypedValueMatches,segelAnswerKeypad})', {
  document: doc, Event: class { constructor(type) { this.type = type; } },
});
const fallback = {
  typedEligible: q => !!api.segelSafeTypedSpec(q.answer),
  typedMatch: (q, raw) => api.segelSafeTypedMatch(q, raw),
};
const fmt = (answer, prompt = '', extra = {}) => api.segelAnswerFormat({ answer, prompt, ...extra }, fallback);
const matches = (answer, prompt, entered) => {
  const q = { answer, prompt }, f = fmt(answer, prompt);
  assert.ok(f);
  return api.segelTypedValueMatches(q, entered, fallback, f);
};

test('all Segel source still parses', () => {
  new vm.Script(source);
});

test('fraction answer at Emas accepts / and rejects decimal when fraction is requested', () => {
  const f = fmt('3/10', 'Tukar 0.3 kepada pecahan persepuluh');
  assert.equal(f.fraction, true);
  assert.equal(f.decimal, false);
  assert.equal(f.tenthOnly, true);
  assert.equal(matches('3/10', 'Tukar 0.3 kepada pecahan persepuluh', '3/10'), true);
  assert.equal(matches('3/10', 'Tukar 0.3 kepada pecahan persepuluh', '0.3'), false);
  assert.equal(matches('3/10', 'Tukar 0.3 kepada pecahan persepuluh', '6/20'), false);
});

test('question that expressly permits both accepts fraction and decimal equivalents', () => {
  const prompt = 'Bahagian kek: pecahan atau perpuluhan?';
  const f = fmt('3/10', prompt);
  assert.equal(f.both, true);
  assert.equal(matches('3/10', prompt, '3/10'), true);
  assert.equal(matches('3/10', prompt, '0.3'), true);
  assert.equal(matches('3/10', prompt, '6/20'), true);
  assert.equal(matches('3/10', prompt, '0.4'), false);
  assert.equal(matches('3/10', prompt, '3/0'), false);
});

test('decimal-only question is not accidentally accepted as a fraction', () => {
  const prompt = 'Tukar pecahan kepada perpuluhan.';
  const f = fmt('0.3', prompt);
  assert.equal(f.decimal, true);
  assert.equal(f.fraction, false);
  assert.equal(matches('0.3', prompt, '0.3'), true);
  assert.equal(matches('0.3', prompt, '3/10'), false);
  assert.equal(matches('0.3', 'Jawab dalam pecahan atau perpuluhan', '3/10'), true);
});

test('normal numeric, signed, RM, sen and percent typed answers retain their matching', () => {
  for (const [answer, raw] of [
    ['45', '45'], ['-2.5', '-2.5'], ['RM12.50', '12.50'],
    ['45sen', '45'], ['10%', '10%'],
  ]) {
    const f = fmt(answer);
    assert.ok(f, answer);
    assert.equal(api.segelTypedValueValid(raw, f), true);
    assert.equal(matches(answer, '', raw), true, answer);
    if (answer === '45' || answer === 'RM12.50' || answer === '45sen' || answer === '10%')
      assert.equal(f.pad, false);
  }
  assert.equal(fmt('suku'), null);
  assert.equal(fmt('Januari'), null);
});

test('interactive fraction models and authoritative gold interactions keep their own widgets', () => {
  assert.equal(fmt('3/10', '', { fractionTask: { type: 'shade' } }), null);
  assert.equal(fmt('12', '', { goldInteraction: true }), null);
  assert.match(source, /const fractionRendered=!writtenBound&&window\.PAFractionAnswers/);
  assert.match(source, /!writtenBound&&!fractionRendered&&!renderTypedAnswer/);
});

test('keypad shows correct symbols, accepts taps and prevents malformed separators', () => {
  const f = fmt('3/10', 'Jawab sebagai pecahan atau perpuluhan');
  const note = { textContent: '' },form = {
    children: [], classList: { add() {} },
    appendChild(child) { this.children.push(child); },
    querySelector(selector) { return selector === '.paTypedNote' ? note : null; },
  };
  const input = {
    value: '', disabled: false, inputMode: 'decimal',
    classList: { remove() {} }, dispatchEvent() {},
  };
  api.segelAnswerKeypad(form, input, f);
  const pad = form.children[0];
  assert.equal(pad.children.filter(x => x.textContent === '/').length, 1);
  assert.equal(pad.children.filter(x => x.textContent === '.').length, 1);
  assert.equal(input.inputMode, 'none');
  const tap = key => pad.children.find(x => x.textContent === key).onclick();
  for (const k of '3/10') tap(k);
  assert.equal(input.value, '3/10');
  tap('.'); assert.equal(input.value, '3/10');
  tap('⌫'); assert.equal(input.value, '3/1');
  tap('0'); assert.equal(input.value, '3/10');
  input.disabled = true;
  tap('⌫'); assert.equal(input.value, '3/10');
});

test('contextual script and CSS cache versions are loaded in both runtime pages', () => {
  for (const html of [page, jelajah]) {
    assert.match(html, /js\/segel-demo-v2\.1\.0\.js\?v=3\.87\.97-keypad1/);
    assert.match(html, /css\/segel-demo-v2\.1\.0\.css\?v=3\.87\.97-keypad1/);
  }
  assert.match(css, /\.paSegelKeypadForm/);
  assert.match(css, /\.paSegelKeypad \.paSegelKey/);
});
