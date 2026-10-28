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

3.87.80: 102 boundary/random coordinate diagrams verified entirely inside their SVG bounds, including C at y=8. GitHub Pages /Pahlawan-angka/ prefix entry, launch of the original mini-game, and all five tracked demo game pages passed. Cream/navy modal colors verified. 40 access/isolation/funnel/page-lock tests and offline-cache checks passed.

Public release verification: both https://pahlawanangka.netlify.app/ and https://darkstaarx.github.io/Pahlawan-angka/ passed the browser audit for landing-to-demo entry, five mini-game URLs, branded dialog and 102 coordinate boundary/random diagrams. GitHub Pages deployment workflow 40686953306 completed successfully for fecad68. Netlify production deployment: 6ae1e887ce6ebc56fe3098df.

3.87.81 compact grade entry: Wira is a 56–68px side illustration beside the title, rather than a separate tall header. All six accessible grade buttons fit in a compact card: 354px high at 320px viewport, 376px at 390px, 356.5px at desktop. Verified no horizontal overflow; original entry, CTA, pricing and explanatory dialogs passed at 320/390px.

3.87.83 verification: 51 unit/access/isolation/funnel/page-lock checks passed. Six-grade mini-game browser audit passed three manual rounds and two guided rounds. Targeted streamlined browser audit verified no video requests for demo/coach entry, bright red erroneous field and pulse, canonical Gudang auto-next with one completion event, third manual round completed via real Wira guidance, exactly five total rounds, matching Seterusnya label, button spacing and CTA. Release UI audit passed 320/390px signup/pricing and demo controls. Netlify untouched.

GitHub-only 3.87.85: post-battle/post-activity keywords now use the same blue highlight as introductory popups. Jom tengok cara gains a blue high-contrast button and inline slab-arrow cue styled after fun-isometric; a short blue/white focus ring animates without moving the click target. Verified 320/390/1200px, original hint text remains exact, clicking the arrow opens real PAWorked, cue removes after starting, reduced motion disables the ring. Eleven pacing/guard tests passed; Netlify untouched.

GitHub-only 3.87.86: continuation now sits inside the worked card while reading steps and replaces the old check area beside the result when an example finishes. It is no longer in the top toolbar. Persistent cursor/ripple cues continue until the relevant action is taken; help-offer cue also repeats, with reduced-motion opt-out. Six-grade 3+2 browser flow passed with bounds assertions proving continuation remains visible inside the game viewport; desktop 1200px case passed. Streamlined end-to-end flow and 13 pacing/mount checks passed.
