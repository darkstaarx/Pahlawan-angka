const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const progressionSource = fs.readFileSync(path.join(__dirname, '..', 'js', 'progression.js'), 'utf8');
const journeySource = fs.readFileSync(path.join(__dirname, '..', 'js', 'engine', 'production-journey.js'), 'utf8');

function profile(overrides = {}) {
  return {
    name: 'Uji', schoolGrade: 1, xp: 0, coins: 0, level: 1,
    skills: { 'D1.N20': { correct: 0, wrong: 0, evidence: 0, mastery: 0, confidence: 0, stability: 0, hints: 0, mis: {} } },
    ...overrides
  };
}

function harness(data = profile()) {
  let context;
  const contextConfig = {
    console,
    Date,
    performance: { now: () => 1000 },
    location: { hostname: 'example.test' },
    localStorage: { getItem: () => null, setItem() {} },
    document: {
      body: {},
      head: { appendChild() {} },
      querySelector: () => ({}),
      createElement: () => ({ addEventListener: (_event, callback) => callback() })
    },
    MutationObserver: class { observe() {} },
    db: data,
    sess: { previous: true },
    GRAPH: { skills: [{ id: 'D1.N20', grade: 1, chapter: 1 }] },
    META: { 'D1.N20': { grade: 1 } },
    window: null,
    save() { context.saves++; context.serialized = JSON.stringify(context.db); },
    saves: 0,
    serialized: null,
    canonicalHeroId: id => id,
    ensureRewards() {},
    coreGrade: () => 1,
    scoreState: id => context.db.skills[id],
    generate: id => ({ skill: id, hint: 'hint', options: [{ tag: 'ok', v: 1 }, { tag: 'wrong', v: 0 }] }),
    swapDemoState(nextDb, nextSess) {
      const previous = { db: context.db, sess: context.sess };
      context.db = nextDb;
      context.sess = nextSess;
      return previous;
    },
    recordIndependentAnswer() {},
    recordCoachResponse() {},
    recordFrontierResponse() {},
    evidenceQuality: () => 1,
    updateConfirmationAfterEncounter() {},
    updateFrontier() {},
    learningStart() {},
    chooseModeAndSkill: () => 'D1.N20',
    window: {
      __PA_LIVE_ASSET_REFRESHED: true,
      PACommercial: { requireFeature: () => true, authorizeMission: async () => true },
      PASegelHost: { openProduction() {}, pause() {} },
      PetCollection: {},
      PALearnerReview: {},
      PATelemetry: {}
    }
  };
  context = contextConfig;
  vm.createContext(context);
  vm.runInContext(progressionSource, context, { filename: 'progression.js' });
  vm.runInContext(journeySource, context, { filename: 'production-journey.js' });
  return context;
}

async function opened(options = {}, data = profile()) {
  const context = harness(data);
  context.window.PAProductionJourney.open(options);
  // open() is async because production access is authorized asynchronously.
  await new Promise(resolve => setImmediate(resolve));
  const run = context.window.PAProductionJourney.state();
  assert.ok(run, 'production Gembok run should open');
  return { context, run, api: context.window.PAProductionJourney };
}

function answerCorrect(api, run) {
  const q = api.nextQuestion(run);
  assert.ok(q, 'nextQuestion should return a real question');
  api.resolve(q, q.options[0], true);
  return q;
}

test('public production flow awards 12 XP per resolved correct answer and completion once', async () => {
  const { context, run, api } = await opened({ chapter: '1' });
  for (let i = 0; i < 10; i++) answerCorrect(api, run);

  assert.equal(context.db.xp, 120);
  assert.equal(run.correct, 10);
  api.complete();
  const first = JSON.stringify(context.db);
  api.complete();

  assert.equal(context.db.xp, 120);
  assert.equal(context.db.gembok.xpAwards[run.id].correct, 10);
  assert.equal(context.db.gembok.xpAwards[run.id].xp, 120);
  assert.equal(context.db.gembok.completions[run.id].correct, 10);
  assert.equal(context.db.coins, 15);
  assert.equal(JSON.stringify(context.db), first, 'repeated completion must be idempotent');
});

test('wrong answer gives no XP, retry correct gives one award, and repeated callbacks stay idempotent', async () => {
  const { context, run, api } = await opened({ focusSkill: 'D1.N20' });
  const q = api.nextQuestion(run);
  api.firstWrong(q, q.options[1]);
  assert.equal(context.db.xp, 0);
  api.firstWrong(q, q.options[1]);
  api.resolve(q, q.options[0], true);
  api.resolve(q, q.options[0], true);

  assert.equal(context.db.xp, 12);
  assert.equal(run.correct, 1);
  assert.equal(context.db.gembok.xpAwards[run.id].correct, 1);
  assert.equal(context.db.gembok.xpAwards[run.id].xp, 12);
});

test('ensureProgression reconciles a historical 40-correct completion to 480 XP and then settles', () => {
  const context = harness(profile({ gembok: { completions: { old: { route: 'manual', correct: 40, at: 10 } } } }));
  context.ensureProgression();
  assert.equal(context.db.xp, 480);
  assert.equal(context.db.level, 3);
  assert.equal(context.db.levelXp, 195);
  assert.equal(context.db.gembok.xpAwards.old.correct, 40);
  context.ensureProgression();
  assert.equal(context.db.xp, 480);
});

test('historical reconciliation saves its ledger and a serialized reload cannot award XP again', () => {
  const first = harness(profile({ gembok: { completions: { old: { route: 'manual', correct: 40, at: 10 } } } }));
  first.ensureProgression();
  assert.equal(first.saves, 1);
  assert.ok(first.serialized);
  const persisted = JSON.parse(first.serialized);
  assert.equal(persisted.xp, 480);
  assert.equal(persisted.gembok.xpAwards.old.correct, 40);

  const reloaded = harness(persisted);
  reloaded.ensureProgression();
  assert.equal(reloaded.db.xp, 480);
  assert.equal(reloaded.saves, 0, 'a settled persisted ledger needs no second save');
});

test('reconciliation awards only the missing delta from a partially awarded completion', () => {
  const context = harness(profile({
    xp: 24,
    gembok: {
      completions: { run: { route: 'adaptive', correct: 5, at: 10 } },
      xpAwards: { run: { correct: 2, xp: 24, at: 20 } }
    }
  }));
  context.ensureProgression();
  assert.equal(context.db.xp, 60);
  assert.equal(context.db.gembok.xpAwards.run.correct, 5);
  context.ensureProgression();
  assert.equal(context.db.xp, 60);
});

test('legacy completion ledgers remain isolated per profile and protected for guest/dev profiles', () => {
  const a = harness(profile({ gembok: { completions: { same: { route: 'manual', correct: 1 } } } }));
  const b = harness(profile({ gembok: { completions: { same: { route: 'manual', correct: 2 } } } }));
  a.ensureProgression(); b.ensureProgression();
  assert.equal(a.db.xp, 12);
  assert.equal(b.db.xp, 24);
  assert.equal(a.db.gembok.xpAwards.same.correct, 1);
  assert.equal(b.db.gembok.xpAwards.same.correct, 2);

  for (const flag of ['guestDemo', 'demoMode', 'devMode']) {
    const protectedProfile = profile({ [flag]: true, gembok: { completions: { old: { route: 'manual', correct: 40 } } } });
    const protectedContext = harness(protectedProfile);
    protectedContext.ensureProgression();
    assert.equal(protectedContext.db.xp, 0, `${flag} profile must not receive Gembok XP`);
    assert.equal(protectedContext.db.gembok?.xpAwards, undefined);
  }
});

test('a run from profile A cannot mutate profile A or B after the live profile/session swaps to B', async () => {
  const a = profile();
  const { context, run, api } = await opened({}, a);
  const q = api.nextQuestion(run);
  assert.ok(q);
  const b = profile({ name: 'Profil B' });
  const bSession = { sentinel: 'B-session' };
  context.db = b;
  context.sess = bSession;
  const beforeA = JSON.stringify(a);
  const beforeB = JSON.stringify(b);
  const savesBefore = context.saves;

  assert.equal(api.resolve(q, q.options[0], true), null);
  assert.equal(api.firstWrong(q, q.options[1]), null);
  api.complete();
  assert.equal(api.nextQuestion(run), null);

  assert.equal(JSON.stringify(a), beforeA, 'stale callbacks must not mutate profile A');
  assert.equal(JSON.stringify(b), beforeB, 'stale callbacks must not mutate profile B');
  assert.equal(context.saves, savesBefore, 'stale callbacks must not save either profile');
  assert.equal(context.db, b);
  assert.equal(context.sess, bSession, 'the replacement profile session must remain active');
});

test('a cloud child switch blocks old callbacks before the new profile finishes loading', async () => {
  const { context, run, api } = await opened({}, profile({ cloudChildId: 'child-a' }));
  context.window.PACloud = { state: { childId: 'child-a' } };
  const q = api.nextQuestion(run);
  const before = JSON.stringify(context.db);
  const savesBefore = context.saves;
  context.window.PACloud.state.childId = 'child-b';
  assert.equal(api.isCurrent(run), false);
  assert.equal(api.resolve(q, q.options[0], true), null);
  context.window.PAProductionRuntime.save();
  assert.equal(context.saves, savesBefore);
  assert.equal(JSON.stringify(context.db), before);
});

test('resolved questions reject late wrong, hint and answer callbacks', async () => {
  const { context, run, api } = await opened();
  const q = answerCorrect(api, run);
  const before = JSON.stringify(context.db);
  const savesBefore = context.saves;
  assert.equal(api.firstWrong(q, q.options[1]), null);
  assert.equal(api.resolve(q, q.options[1], false), null);
  assert.equal(api.hint(), null);
  assert.equal(context.saves, savesBefore);
  assert.equal(JSON.stringify(context.db), before);
});
