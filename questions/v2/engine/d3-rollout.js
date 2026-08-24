// questions/v2/engine/d3-rollout.js
//
// Phase 3A-3 R1/R2 -- D3 non-Topic-7 rollout state registry.
//
// This is deliberately separate from:
//   - curriculum truth (questions/v2/curriculum/kssr-e3-2024/d3.json), which
//     encodes canonicalization/authoring status and is frozen per the
//     Phase 3A-0 review notes ("Change only with curriculum re-review");
//   - authored content truth (questions/v2/banks/**, generators/**,
//     renderers/**), which is frozen per the Phase 3A-2 semantic hardening
//     review.
// Curriculum truth, authored-content truth, and production rollout state
// must remain independently changeable.
//
// This file is intentionally NOT read by questions/v2/build/build.js and is
// NOT baked into questions/v2/dist/runtime.js (see registry.js: only
// questions/v2/curriculum and questions/v2/banks are scanned by the build).
// A rollout-state change here never requires rebuilding or re-validating
// the authored content pipeline.
//
// Contract:
//   getState(standardId) -> 'SHADOW' | 'LIVE' | 'HOLD'   (default 'SHADOW')
//   isFixtureLiveAuthorized(standardId, context) -> boolean
//     Defense in depth, R2 scope: even a standardId explicitly marked LIVE
//     in ENTRIES below can only ever be served to a real learner if BOTH:
//       (a) it is the single hardcoded FIXTURE_STANDARD_ID below, and
//       (b) the caller supplies an explicit authorization flag that no
//           shipped gameplay/UI code path ever sets (see
//           FIXTURE_AUTH_FLAG). In R2 this flag is set only by the
//           dedicated regression harness -- there is no production code
//           path that flips it -- so marking ANY standard LIVE here has
//           zero effect on real gameplay in R2. It only changes what the
//           existing shadow telemetry observes. This is intentional:
//           Phase 3A-3 R2 proves the rollout-state plumbing without
//           generalizing the T7-only mastery-isolation mechanism
//           (data/kssr/d3-topic7-live-cutover-v3.40.0.js), which is
//           explicitly deferred to a future R3.
(function (root) {
  'use strict';

  var CURRICULUM_VERSION = 'KSSR-E3-2024';
  var GRADE = 3;
  var DEFAULT_STATE = 'SHADOW';
  var VALID_STATES = { SHADOW: true, LIVE: true, HOLD: true };

  // Phase 3A-3 R2 controlled fixture/proof path. This is the ONLY
  // standardId that can ever be served LIVE to a real learner, and only
  // when isFixtureLiveAuthorized() also returns true. Chosen because it
  // does not collide with any frozen historical regression assertion.
  var FIXTURE_STANDARD_ID = '2.1.1';
  var FIXTURE_AUTH_FLAG = 'd3NonT7RolloutFixtureAuthorized';

  // Sparse registry. Absence of a standardId means DEFAULT_STATE (SHADOW).
  // R2 proves the mechanism with exactly one LIVE entry (the fixture) and
  // one HOLD entry, not a broad rollout.
  var ENTRIES = {
    '2.1.1': 'LIVE',
    '6.3.3': 'HOLD'
  };

  function normaliseState(value) {
    var s = String(value || '').toUpperCase();
    return VALID_STATES[s] ? s : DEFAULT_STATE;
  }

  function getState(standardId) {
    if (!standardId) return DEFAULT_STATE;
    return Object.prototype.hasOwnProperty.call(ENTRIES, standardId) ? normaliseState(ENTRIES[standardId]) : DEFAULT_STATE;
  }

  function isFixtureLiveAuthorized(standardId, context) {
    if (standardId !== FIXTURE_STANDARD_ID) return false;
    if (getState(standardId) !== 'LIVE') return false;
    var flags = (context && context.flags) || {};
    return flags[FIXTURE_AUTH_FLAG] === true;
  }

  function listEntries() {
    var out = [];
    for (var k in ENTRIES) {
      if (Object.prototype.hasOwnProperty.call(ENTRIES, k)) out.push({ standardId: k, state: normaliseState(ENTRIES[k]) });
    }
    return out.sort(function (a, b) { return a.standardId < b.standardId ? -1 : a.standardId > b.standardId ? 1 : 0; });
  }

  var api = {
    curriculumVersion: CURRICULUM_VERSION,
    grade: GRADE,
    defaultState: DEFAULT_STATE,
    fixtureStandardId: FIXTURE_STANDARD_ID,
    fixtureAuthFlag: FIXTURE_AUTH_FLAG,
    getState: getState,
    isFixtureLiveAuthorized: isFixtureLiveAuthorized,
    listEntries: listEntries,
    _test: { ENTRIES: ENTRIES, normaliseState: normaliseState }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PAD3RolloutRegistry = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
