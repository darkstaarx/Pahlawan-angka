const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// Execute the actual timekeeping functions, not a rewritten test copy.
const source = fs.readFileSync('js/cloud.js', 'utf8');
const line = regex => {
  const match = source.match(regex);
  assert.ok(match, 'Missing cloud timer definition: ' + regex);
  return match[0];
};
const block = (start, end) => {
  const a = source.indexOf(start), b = source.indexOf(end, a + start.length);
  assert.ok(a >= 0 && b > a, 'Missing cloud timer block: ' + start);
  return source.slice(a, b);
};
const definitions = [
  line(/^  const ACTIVE_SCREENS=.*;$/m),
  line(/^  const IDLE_AFTER_MS=.*;$/m),
  line(/^  const currentScreen=.*;$/m),
  line(/^  const countableRun=.*;$/m),
  line(/^  const playing=.*;$/m),
  block('  function ensurePlaySession(){', '  async function endPlaySession('),
  block('  function tick(){', '  function updateTimer(){'),
  block('  function checkLimit(){', '  function renderAccount(){'),
].join('\n');

function harness(screen = 'menuV2', { mode = null, sessionDemo = false, profileDemo = false } = {}) {
  let now = 1000, flushes = 0;
  const navigations = [];
  const state = {
    user: { id: 'fixture' }, childId: 'fixture', timerActive: false,
    sessionSeconds: 0, todayBefore: 0, lastTick: 1000, lastFlush: 0,
    lastInteractionAt: Date.now(), locked: false, controls: null,
  };
  const context = {
    document: { hidden: false, body: { dataset: { screen } } },
    window: { segelEntryMode: () => mode },
    sess: { demoMode: sessionDemo }, db: { demoMode: profileDemo },
    state, performance: { now: () => now }, Date,
    rememberLocalSeconds() {}, updateTimer() {},
    syncDailyTotal() { flushes++; state.lastFlush = state.todayBefore + state.sessionSeconds; },
    endPlaySession() { state.timerActive = false; },
    $(id) { return { textContent: '', id }; },
    screen(id) { navigations.push(id); },
  };
  const api = vm.runInNewContext(definitions + '\n({ screens: ACTIVE_SCREENS, playing, ensurePlaySession, tick, checkLimit })', context);
  return { api, context, state, navigations, advance(ms) { now += ms; }, flushes: () => flushes };
}

test('both new live screens accumulate elapsed time for signed-in child profiles', () => {
  for (const screen of ['menuV2', 'segelDemo', 'hub', 'missions', 'game', 'learning']) {
    const h = harness(screen);
    assert.equal(h.api.playing(), true, screen);
    h.api.ensurePlaySession();
    assert.equal(h.state.timerActive, true, screen);
    h.advance(5000);
    h.api.tick();
    assert.equal(h.state.sessionSeconds, 5, screen);
  }
});
test('guest journey, developer previews and demo child profiles do not count', () => {
  const cases = [
    { mode: { guestDemo: true } }, { mode: { devBattlefield: true } },
    { mode: { writtenArithmeticPreview: {} } },
    { sessionDemo: true }, { profileDemo: true },
  ];
  for (const options of cases) {
    const h = harness('segelDemo', options);
    assert.equal(h.api.playing(), false);
    h.api.ensurePlaySession();
    assert.equal(h.state.timerActive, false);
    h.state.timerActive = true; // mimic a real timer left active before demo navigation
    h.advance(5000); h.api.tick();
    assert.equal(h.state.sessionSeconds, 0);
  }
});
test('idle, hidden tabs, locked players and non-game screens are not counted', () => {
  for (const screen of ['login', 'parent', 'setup', 'timeLock', 'restu']) {
    assert.equal(harness(screen).api.playing(), false, screen);
  }
  const h = harness('segelDemo'); h.api.ensurePlaySession();
  h.context.document.hidden = true; h.advance(5000); h.api.tick();
  assert.equal(h.state.sessionSeconds, 0);
  h.context.document.hidden = false;
  h.state.lastInteractionAt = Date.now() - 121000;
  h.advance(5000); h.api.tick();
  assert.equal(h.state.sessionSeconds, 0);
  h.state.lastInteractionAt = Date.now();
  h.state.locked = true; h.advance(5000); h.api.tick();
  assert.equal(h.state.sessionSeconds, 0);
});
test('the active child reaches parental hard-lock at the configured session limit', () => {
  const h = harness('segelDemo');
  h.state.controls = { hard_lock_enabled: true, session_limit_minutes: 1 };
  h.api.ensurePlaySession(); h.advance(61000); h.api.tick();
  assert.equal(h.state.locked, true);
  assert.equal(h.state.timerActive, false);
  assert.deepEqual(h.navigations, ['timeLock']);
});
test('short sessions flush after 30 seconds', () => {
  const h = harness('segelDemo'); h.api.ensurePlaySession();
  h.advance(29000); h.api.tick(); assert.equal(h.flushes(), 0);
  h.advance(2000); h.api.tick(); assert.equal(h.flushes(), 1);
});
test('backgrounding without any counted seconds does not create zero-play database rows', async () => {
  const h = harness('menuV2');
  let writes = 0;
  h.state.dailySyncInFlight = false;
  h.state.dailySyncPending = false;
  h.state.client = { from() { writes++; throw Error('should not touch Supabase on zero time'); } };
  const sync = vm.runInNewContext(block("  async function syncDailyTotal(", "  function tick(){") + '\nsyncDailyTotal', {
    state: h.state, rememberLocalSeconds() {}, localDay() { return '2026-11-01'; },
    Date, setTimeout() {},
  });
  const result = await sync('background');
  assert.equal(result, false);
  assert.equal(writes, 0);
  assert.equal(h.state.dailySyncInFlight, false);
});
test('the nonzero heartbeat still upserts daily seconds to the existing schema', async () => {
  const h = harness('segelDemo'); const writes = [];
  h.state.sessionSeconds = 42;
  h.state.dailySyncInFlight = false; h.state.dailySyncPending = false;
  h.state.client = { from(table) {
    assert.equal(table, 'daily_play_totals');
    return {
      select() { return this; }, eq() { return this; },
      async maybeSingle() { return { data: { active_seconds: 11 }, error: null }; },
      async upsert(row, opts) { writes.push({ row, opts }); return { error: null }; },
    };
  } };
  const sync = vm.runInNewContext(block("  async function syncDailyTotal(", "  function tick(){") + '\nsyncDailyTotal', {
    state: h.state, rememberLocalSeconds() {}, localDay() { return '2026-11-01'; },
    Date, setTimeout() {},
  });
  assert.equal(await sync('heartbeat'), true);
  assert.equal(writes.length, 1);
  assert.equal(writes[0].row.active_seconds, 42);
  assert.equal(writes[0].row.last_sync_reason, 'heartbeat');
  assert.equal(writes[0].opts.onConflict, 'child_id,play_date');
});
