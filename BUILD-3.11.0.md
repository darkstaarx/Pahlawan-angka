# Build 3.11.0 — KSSR Content Variety Batch 1

## Scope

- Corrected boss vertical framing: bosses now share the hero floor baseline and grow upward.
- Added genuine content rotation for Year 1 and Years 3–6.
- Preserved the existing Year 2 bank for a separate, lower-risk migration because it contains 37 granular skills and the strongest existing visual coverage.
- Corrected rotation for prefixed `content_` archetypes so rate/probability items cannot accidentally repeat the same task consecutively.

## Content rules

- No strategy-only or "guess the pupil's error" filler questions.
- Rotation changes the mathematical action: model, direct procedure, missing value, application or reasoning.
- Choices remain misconception-tagged and the core answer/hint schema remains compatible.
- Year 1 receives age-appropriate visual/context tasks rather than upper-primary formula questions.

## QA

- Year 1 and Years 3–6: no low-variety or consecutive-archetype failures in the structured session audit.
- Years 3–6: 31,500 generated samples, 63 skills, zero audit problems, minimum three archetypes per skill.
- Year 2 regression remains the release gate; its metadata/rotation migration is scheduled for Batch 2.
