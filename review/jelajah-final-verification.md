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

Correction: finisher focus sequence verified in all six grades after scripted misses. Parent report now uses the current Ringkasan Anak summary helper and original stylesheet, with Kemahiran detail. Plain BM popups and report tabs passed the 390px browser audit. The old learnerReviewCard is absent.

Full animation (no reduced motion) Darjah 2 passed original finisher focus sequence, battle completion, focus practice and current parent report. Current draft: https://6ae1b3f58176648e0d26fa7f--pahlawanangka.netlify.app/demo-jelajah.html

Pacing revision: real mini-game audit now checks that worked step count remains unchanged during an idle pause, then advances each step with the visible Seterusnya button. Remote main was fetched and is already an ancestor of this branch (3bee537); all prior demo commits remain included.

Pacing checks passed for Darjah 1–6: three manual rounds, idle pause without step advancement, user-clicked worked steps and two completed worked examples. The 40 isolation/access/funnel/page-lock regressions also passed.

Paced preview deployment: 6ae1bbb6a46529568116f833; source ed52f36. This draft includes all earlier demo corrections and current origin/main.

Public draft Darjah 2 user-paced worked-example audit passed. Production remains 6added09bf3b6b33d6e1d792.

Production release 3.87.78 explicitly authorized on 28 October 2026. CTA polished to Mulakan Pengembaraan. Real production package preserves the original root, login and pricing; mobile release audit passed at 320/390px, 38 access/isolation/lock/funnel checks passed, asset manifest validated. Offline cache test verifies demo navigation cannot replace the game shell. All earlier six-grade gameplay and paced-worked-example fixes are included.

3.87.79: approved point copy and SVG integrated into pre-autopilot, pre-mini-game, pre-coach and post-activity summaries. Parent report/popup audit passed; 38 access/isolation/funnel/lock checks passed; asset manifest current.
