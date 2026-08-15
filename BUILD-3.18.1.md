# Pahlawan Angka v3.18.1

## Content-integrity hardening

This point release hardens the v3.18.0 curriculum repair without redesigning gameplay or UI.

### Changes
- Fixed integrity-archetype rotation so it reads the real lexical `sess.questionHistory` instead of relying on `window.sess`.
- Tightened mandatory competency evidence for repaired KSSR skills; equivalent variations may share a requirement, but required subcompetencies can no longer be skipped.
- Chapter unlock now requires both the existing mastery/evidence thresholds and mandatory competency proof for skills with an integrity contract.
- Stretch probes now require mandatory competency proof before moving above the learner's current grade.
- Runtime build label is synchronized to v3.18.1 by the integrity guard.
- Service-worker cache and guard loader are bumped to v3.18.1.
- Validation metadata updated to the current Auto Coach range (8–15 questions).
- Version audit now validates the runtime integrity release chain rather than relying on a stale static login label.

### Validation
- JavaScript syntax: PASS (`kssr-content-integrity-v3.18.1.js`, `js/pwa.js`, `sw.js`).
- Repaired question paths: 52.
- Samples: 4,160 (80 per repaired path).
- Duplicate/correctness/content failures: 0.
- Frontier gate without competency proof: PASS (blocked).
- Frontier gate after competency proof: PASS (unlocked).
- Stretch gate without competency proof: PASS (blocked).
- Stretch gate after competency proof: PASS (allowed).

Base reviewed: v3.18.0 commit `6e807f510f8c1a23f22eace31c93c42d474964db`.
