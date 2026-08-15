# Pahlawan Angka v3.12.1

Adaptive placement confidence fix.

- Early completion now requires four resolved domains, not merely four sampled domains.
- Unresolved mixed evidence continues to be sampled up to the 15-question cap.
- Added end-to-end regression coverage for misconception, retry, hint dependence, confirmation, recovery, advancement and session completion.
- Bumped the service-worker cache and adaptive frontier asset version.

Validation:

- Adaptive E2E: 19 checks across 7 learner profiles.
- Mastery knowledge base: 114 profiles.
- KSSR variety: 114 skills, zero failures.
- Year 2 regression: 37 skills, zero failures.
- Years 3–6 audit: 63 skills / 31,500 samples, zero problems.
