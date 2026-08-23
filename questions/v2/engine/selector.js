// questions/v2/engine/selector.js
//
// Selector Engine (blueprint §1 item 5 / §7 — global anti-repetition
// selector). Chooses the next competency/archetype/representation while
// penalising repetition of: exact fingerprint, archetypeId, competencyId,
// representation, contextId, and identical operation structure.
//
// Phase 1: intentionally not implemented. The legacy per-grade
// anti-repeat logic in questions/index.js (questionFingerprint /
// sess.questionFingerprints / sess.questionHistory) remains the only
// active selector in production. This module exists so Phase 2 has an
// explicit contract to implement against instead of extending the legacy
// dispatcher further.

'use strict';

function selectNext() {
  throw new Error(
    'questions/v2/engine/selector.js: not implemented in Phase 1. ' +
    'Production selection continues to run through questions/index.js.'
  );
}

module.exports = { selectNext };
