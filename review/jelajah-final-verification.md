# Real-engine revision verification — 28 October 2026

- Mobile integration: Darjah 1–6 passed actual-bank mixed first six, scripted
  answer intentions through real confirmation routing, six focus questions,
  original diagnostic/parent card markup, no page errors, protected storage.
  Evidence: jelajah-v3-engine-1-6.json and jelajah-v3-d1 through d6 screenshots.
- Real mini-game DOM audit: all six grades passed three manual successful rounds
  plus two PAWorked guided rounds. Darjah 1–2 verified earlier in this revision;
  Darjah 3–6 repeated after adding shade/field support to the audit solver.
- 40 regression checks passed: isolation, scenario bounds, original game copying,
  commercial entitlement/quota protection, funnel privacy, guardian page lock.
- Landing query aliases and both original CTA entry paths passed.
- Original signup/pricing offer flow and desktop layout passed.
- The battle integration audit uses existing submitInteraction for manual answers;
  it does not claim exhaustive DOM testing of every question-bank interaction.
- An additional independent reviewer could not run because its usage limit was
  reached. The implementation was inspected locally and the tests above ran.
- Netlify production deployment remains 6added09bf3b6b33d6e1d792. Only a separate
  draft preview is authorized. No production promotion was performed.

Draft deployment: 6ae1acf6dca0849e12af728f. Source commit: f5cb3b5.
