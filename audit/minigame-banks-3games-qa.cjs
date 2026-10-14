const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const games = [
  { id: 'dapur-ramuan', global: 'PADapurRamuan', modes: ['nisbah', 'kadaran', 'masalah'] },
  { id: 'pos-peninjau', global: 'PAPosPeninjau', modes: ['gundal', 'piktograf', 'carta', 'kumpul', 'pai', 'purata', 'peluang', 'masalah'] },
  { id: 'lombong-permata', global: 'PALombongPermata', modes: ['perpuluhan', 'peratus', 'masalah'] }
];
let sampled = 0;
const report = [];

function seededRandom(seed) {
  let x = seed >>> 0;
  return () => { x = (1664525 * x + 1013904223) >>> 0; return x / 0x100000000; };
}
function gameSources(game) {
  const html = fs.readFileSync(path.join(root, `${game.id}.html`), 'utf8');
  const marker = '<script>\n(()=>{';
  const from = html.indexOf(marker);
  const to = html.indexOf('/* ---------- enjin ', from);
  assert(from >= 0 && to > from, `${game.id}: could not locate embedded bank`);
  const bankSource = html.slice(from + marker.length, to);
  const math = Object.create(Math);
  math.random = seededRandom(0xA11CE + game.id.length);
  const bankContext = { Math: math, window: { PAMiniGameDev: { enabled: () => false } } };
  const bank = vm.runInNewContext(`(()=>{${bankSource}\nreturn {GEN};})()`, bankContext, { timeout: 5000 });
  for (const script of [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]) new vm.Script(script[1], { filename: `${game.id}.inline.js` });
  const routerContext = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, `js/${game.id}-router.js`), 'utf8'), routerContext, { timeout: 5000 });
  return { html, bank, router: routerContext.window[game.global] };
}
function sampleQuestion(gameId, grade, mode, tier, template, question) {
  assert(question && typeof question.q === 'string' && question.q.trim(), `${gameId} D${grade}/${mode}/T${tier}: blank question`);
  assert.equal(typeof question.arch, 'string', `${gameId} D${grade}/${mode}/T${tier}: missing diagnostic archetype`);
  assert(!/\b(?:undefined|NaN)\b/.test(question.q), `${gameId} D${grade}/${mode}/T${tier}: invalid prompt ${question.q}`);
  if (question.form?.fields) {
    assert(question.form.fields.length > 0, `${gameId} D${grade}/${mode}/T${tier}: empty answer fields`);
    for (const field of question.form.fields) assert(Number.isFinite(Number(field.v)), `${gameId} D${grade}/${mode}/T${tier}: non-finite answer field`);
    if (question.form.fields.length === 1 && !question.form.ratio && !question.form.frac && question.a) {
      const explanation = String(question.a).trim().split(/[.;]\s+/).at(-1);
      if (!/\d\s\d{3}/.test(explanation)) {
        const ending = explanation.match(/=\s*(-?(?:\d+(?:\.\d+)?|\.\d+))\s*(?:[A-Za-z%ℓ²³]+)?\.?$/);
        if (ending) assert(Math.abs(Number(ending[1]) - Number(question.form.fields[0].v)) < 1e-7, `${gameId} D${grade}/${mode}/T${tier}: worked answer disagrees with expected answer (${question.a} vs ${question.form.fields[0].v})`);
      }
    }
  }
  if (question.opts) {
    const ids = question.opts.map(option => String(option.id));
    assert.equal(new Set(ids).size, ids.length, `${gameId} D${grade}/${mode}/T${tier}: duplicate option IDs`);
    if (Array.isArray(question.correct)) assert(question.correct.every(id => ids.includes(String(id))), `${gameId} D${grade}/${mode}/T${tier}: order answer references missing option`);
    else assert(ids.includes(String(question.correct)), `${gameId} D${grade}/${mode}/T${tier}: answer is missing from options`);
  }
  if (question.kind === 'line') assert(question.line && Number.isFinite(question.need), `${gameId} D${grade}/${mode}/T${tier}: incomplete number-line answer`);
  if (question.kind === 'grid') assert(Number.isFinite(question.need), `${gameId} D${grade}/${mode}/T${tier}: incomplete grid answer`);
  if (question.kind === 'mix') assert(question.mix && Number.isFinite(question.need?.v ?? question.mix.max), `${gameId} D${grade}/${mode}/T${tier}: incomplete ratio mixer answer`);
  if (question.kind === 'piebuild') assert(question.need?.length > 0 && question.need.every(Number.isFinite), `${gameId} D${grade}/${mode}/T${tier}: incomplete pie-chart answer`);
  if (question.kind === 'lazim') assert(question.lz?.ans, `${gameId} D${grade}/${mode}/T${tier}: incomplete column-arithmetic answer`);
  assert(template && typeof template.f === 'function', `${gameId} D${grade}/${mode}/T${tier}: missing generator`);
}

for (const game of games) {
  const { html, bank, router } = gameSources(game);
  assert(router, `${game.id}: router did not initialize`);
  const htmlScripts = html.match(/<script src="js\/minigame-dev-gate\.js"><\/script>/g) || [];
  assert.equal(htmlScripts.length, 1, `${game.id}: expected DEV gate exactly once`);
  assert(html.includes('hint2>=2'), `${game.id}: Tanya Wira is not limited to two clues`);
  assert(html.includes('index:served,tier:q.tierIx+1,prompt:q.q'), `${game.id}: completed-round report lacks index/tier/prompt`);
  assert(html.includes('function focusLaunchAllowed()') && html.includes('plan?.hash===location.hash.slice(1)'), `${game.id}: live standalone/profile gate is missing`);
  const bankCounts = {};
  for (const [gradeText, modes] of Object.entries(bank.GEN)) {
    const grade = Number(gradeText);
    for (const [mode, templates] of Object.entries(modes)) {
      const expectedTags = router.ARCH?.[grade]?.[mode] || [];
      assert.equal(templates.length, expectedTags.length, `${game.id} D${grade}/${mode}: template/tag count mismatch`);
      for (let i = 0; i < templates.length; i++) {
        const template = templates[i];
        assert.equal(template.arch, expectedTags[i], `${game.id} D${grade}/${mode}/T${i + 1}: tag does not match router bank`);
        for (let n = 0; n < 60; n++) {
          const question = { ...template.f({ who: 'Wira' }), arch: template.arch };
          sampleQuestion(game.id, grade, mode, i + 1, template, question);
          sampled++;
        }
      }
      bankCounts[`D${grade}/${mode}`] = templates.length;
    }
  }
  for (const [skillId, [grade, modes]] of Object.entries(router.SKILL)) {
    assert(bank.GEN[grade], `${game.id}: ${skillId} grade has no bank`);
    for (const mode of modes) assert(bank.GEN[grade][mode]?.length, `${game.id}: ${skillId} maps to empty ${mode} bank`);
  }
  report.push({ game: game.id, skillTags: Object.keys(router.SKILL), banks: bankCounts });
}

const kgSource = fs.readFileSync(path.join(root, 'data/kssr/knowledge-graph.js'), 'utf8');
const kgMatch = kgSource.match(/const GRAPH = (\{[\s\S]*?\});/);
assert(kgMatch, 'Could not parse app KSSR skill graph');
const graph = JSON.parse(kgMatch[1]);
const skillById = new Map(graph.skills.map(skill => [skill.id, skill]));
const liveContext = { window: { addEventListener() {} }, META: Object.fromEntries(graph.skills.map(skill => [skill.id, skill])) };
for (const game of games) {
  const routerContext = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, `js/${game.id}-router.js`), 'utf8'), routerContext, { timeout: 5000 });
  const key = game.global;
  liveContext.window[key] = routerContext.window[key];
  for (const [skillId, [grade]] of Object.entries(routerContext.window[key].SKILL)) {
    const skill = skillById.get(skillId);
    assert(skill, `${game.id}: unsupported Focus skill ${skillId}`);
    assert.equal(Number(skill.grade), Number(grade), `${game.id}: ${skillId} routed to wrong grade`);
    const expectedDomain = game.id === 'dapur-ramuan' ? 'Nisbah' : game.id === 'pos-peninjau' ? 'Data' : ['D3.DEC','D4.DEC','D5.DEC','D6.DEC'].includes(skillId) ? 'Perpuluhan' : 'Peratus';
    assert.equal(skill.domain, expectedDomain, `${game.id}: ${skillId} routes to the wrong curriculum domain`);
  }
  const router = routerContext.window[key];
  for (const [skillId, [grade, modes]] of Object.entries(router.SKILL)) {
    for (const mode of modes) {
      const archetypeId = router.ARCH[grade][mode][0];
      const profile = { learnerReviewV1: { encounters: [0,1].map(i => ({ skillId, archetypeId, outcome: 'unresolved', mode: 'practice', questionKey: `${skillId}-${i}` })) } };
      const plan = router.planFor(profile, skillId);
      assert(plan?.start?.some(row => row.mode === mode), `${game.id}: ${skillId}/${mode} diagnostics do not route to its question bank`);
      assert.equal(Number(plan.grade), Number(grade), `${game.id}: ${skillId} plan has wrong grade`);
    }
  }
}
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/focus-mini-games-live-bridge.js'), 'utf8'), liveContext, { timeout: 5000 });
for (const [gameKey, routerGlobal] of [['ratio','PADapurRamuan'],['data','PAPosPeninjau'],['decimal','PALombongPermata']]) {
  for (const skillId of Object.keys(liveContext.window[routerGlobal].SKILL)) {
    assert.equal(liveContext.window.PAFocusMiniGamesLive.gameFor(skillId)?.id, `
      ${gameKey === 'ratio' ? 'dapur-ramuan' : gameKey === 'data' ? 'pos-peninjau' : 'lombong-permata'}`.trim(), `Focus bridge does not map ${skillId} to ${gameKey}`);
  }
}
assert.equal(liveContext.window.PAFocusMiniGamesLive.gameFor('D6.PROB'), null, 'unsupported legacy pseudo-tag should not open a live game');
for (const skillId of ['D4.RATIO','D5.RATE','D3.PERCENT','D4.PERCENT']) assert.equal(liveContext.window.PAFocusMiniGamesLive.gameFor(skillId), null, `${skillId} must not be forced onto an unrelated live curriculum tag`);

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const bridgeIndex = index.indexOf('js/focus-mini-games-live-bridge.js');
for (const game of games) {
  assert(index.includes(`js/${game.id}-router.js`), `index.html does not load ${game.id} router`);
  assert(index.indexOf(`js/${game.id}-router.js`) < bridgeIndex, `${game.id} router loads after the Focus bridge`);
}
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
for (const game of games) {
  assert(sw.includes(`'./${game.id}.html'`), `service worker app shell misses ${game.id}.html`);
  for (const file of fs.readdirSync(path.join(root, `assets/minigames/${game.id}`))) {
    assert(sw.includes(`'./assets/minigames/${game.id}/${file}'`), `service worker app shell misses ${game.id}/${file}`);
  }
}

console.log(JSON.stringify({ result: 'PASS', sampled, report }, null, 2));
