// questions/v2/engine/d3-rollout.js
//
// Phase 3A-4 -- D3 non-Topic-7 rollout state registry, production-activated.
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
// History:
//   Phase 3A-3 R2 proved this plumbing with exactly one LIVE entry (a
//   controlled fixture, standardId 2.1.1) gated behind a test-harness-only
//   authorization flag that no shipped code ever set -- so marking any
//   standard LIVE had zero effect on real gameplay.
//   Phase 3A-3 R3 added generic, topic-agnostic mastery isolation
//   (data/kssr/d3-nonT7-live-isolation-v1.0.0.js) so a LIVE QSv2 result
//   for ANY D3 non-T7 standard cannot contaminate the legacy mastery
//   bucket, exactly mirroring the existing T7 mechanism.
//   Phase 3A-4 retires the fixture-only test gate now that the authored
//   content has passed authoring (3A-1), semantic/KSSR hardening (3A-2),
//   and an independent red-team review, and the isolation mechanism it
//   depends on exists and is proven (3A-3 R3). Every mapped D3 non-T7
//   standard is now LIVE by explicit entry below.
//
// Contract:
//   getState(standardId) -> 'SHADOW' | 'LIVE' | 'HOLD'   (default SHADOW
//     for any standardId not explicitly listed below -- default-safe: a
//     future curriculum addition never goes live without an explicit,
//     reviewed registry entry.)
//   isLiveAuthorized(standardId) -> boolean
//     True whenever getState(standardId) === 'LIVE'. No caller-supplied
//     flag is required or consulted -- this is the real, unconditional
//     production authorization path. The kill switch (checked separately
//     in legacy-adapter.js, unchanged) remains the operational override
//     for pausing all D3 QSv2 traffic, LIVE or SHADOW, instantly.
(function (root) {
  'use strict';

  var CURRICULUM_VERSION = 'KSSR-E3-2024';
  var GRADE = 3;
  var DEFAULT_STATE = 'SHADOW';
  var VALID_STATES = { SHADOW: true, LIVE: true, HOLD: true };

  // Registry entries, keyed by standardId. Every one of the 44 mapped D3
  // non-T7 standards is listed explicitly below (no silent reliance on an
  // absent-entry default) so the production rollout state is fully
  // auditable at a glance. Any standardId NOT in this map -- e.g. a future
  // curriculum addition -- defaults to SHADOW (DEFAULT_STATE below), never
  // LIVE: a new standard must be given an explicit reviewed entry here
  // before it can ever be served live to a real learner.
  //
  // History: 6.3.3 was previously used as the Phase 3A-3 demonstration of
  // the HOLD mechanism, not because of any known content defect (none was
  // found for it in authoring, semantic hardening, or the independent
  // red-team review). It has since been explicitly cleared: no content
  // defect required it to remain held, so it is now LIVE like every other
  // mapped standard. The HOLD state itself remains fully supported by
  // getState()/isLiveAuthorized() below for any future standard that
  // genuinely needs it -- clearing this one entry does not remove HOLD
  // capability from the rollout engine.
  var ENTRIES = {
    '1.1.1':'LIVE','1.1.2':'LIVE','1.2.1':'LIVE','1.3.1':'LIVE','1.4.1':'LIVE','1.4.2':'LIVE',
    '2.1.1':'LIVE','2.1.2':'LIVE','2.2.1':'LIVE',
    '3.1.1':'LIVE','3.1.2':'LIVE','3.1.3':'LIVE','3.1.4':'LIVE','3.1.5':'LIVE','3.2.1':'LIVE','3.2.2':'LIVE','3.3.1':'LIVE','3.3.2':'LIVE','3.4.1':'LIVE',
    '4.1.1':'LIVE','4.1.2':'LIVE','4.2.1':'LIVE','4.3.1':'LIVE','4.4.1':'LIVE',
    '5.1.1':'LIVE','5.1.2':'LIVE','5.2.1':'LIVE','5.2.2':'LIVE','5.3.1':'LIVE',
    '6.1.1':'LIVE','6.1.2':'LIVE','6.1.3':'LIVE','6.2.1':'LIVE','6.2.2':'LIVE','6.2.3':'LIVE','6.3.1':'LIVE','6.3.2':'LIVE','6.3.3':'LIVE',
    '8.1.1':'LIVE','8.1.2':'LIVE','8.1.3':'LIVE',
    '9.1.1':'LIVE','9.2.1':'LIVE','9.2.2':'LIVE'
  };

  function normaliseState(value) {
    var s = String(value || '').toUpperCase();
    return VALID_STATES[s] ? s : DEFAULT_STATE;
  }

  function getState(standardId) {
    if (!standardId) return DEFAULT_STATE;
    return Object.prototype.hasOwnProperty.call(ENTRIES, standardId) ? normaliseState(ENTRIES[standardId]) : DEFAULT_STATE;
  }

  // Real, unconditional production authorization. No flag, no fixture
  // constant, no caller-supplied context -- the registry entry IS the
  // authorization. HOLD and any never-mapped/never-listed standardId both
  // correctly return false here.
  function isLiveAuthorized(standardId) {
    return getState(standardId) === 'LIVE';
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
    getState: getState,
    isLiveAuthorized: isLiveAuthorized,
    listEntries: listEntries,
    _test: { ENTRIES: ENTRIES, normaliseState: normaliseState }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PAD3RolloutRegistry = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
