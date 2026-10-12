# Focus Diagnosis v2 — Phase C browser audit

Date: 12 October 2026. Decision: **NO-GO for user-facing Focus v2 integration.** The pure shadow oracle passes; complete authored runtime probes and a recovery controller do not exist. Production findings remain separate from v2 readiness.

## Scope and baseline

- Repository: darkstaarx/Pahlawan-angka. Work performed only on feature/focus-diagnosis-foundations-v1, based on 065f0c2; fetched main snapshot 27e1e69 (refresh division offline bank). No merge, push or deployment was performed.
- Live read-only URL: https://darkstaarx.github.io/Pahlawan-angka/ ; observed release 3.86.1. Local feature served over loopback. Isolated Edge/Chromium contexts, service workers blocked, desktop 1280×800 and Android-emulated portrait 360×640 (9:16). This is browser emulation, not physical Android hardware.
- Automated browser contexts reject non-GET/HEAD network requests. Synthetic Focus profiles bypass commercial/rest gates in memory and disable save/cloud. No real account, child profile or cloud data was used.
- Reviewed README, foundation map, tag audit, Phase C shadow report, ten fixtures, engine, collector, guardian Focus, adaptive and learner-review code. Static app deploy surface is index.html/sw.js/version.js. The sole checked-in Actions workflow builds marketing posters on main; GitHub Pages dashboard/source settings were not independently verified (gh unavailable). Local feature is never presented as deployed.
- Existing Node checks initially passed except the Guardian audit's stale 3.9.0 version assertion. That audit now checks the current version source and cache wiring; all six final Node suites pass.

## Final results

**239 listed checks: 219 PASS, 3 FAIL, 17 BLOCKED.** 222 checks executed with final outcomes; blocked rows are unimplemented/inaccessible acceptance gates, not passing tests. All three final failures concern unchanged production. Feature fixes passed dedicated browser retests.

The initial broad browser run recorded 58 checks (48 pass, 4 storage failures, 6 metadata blockers). Its four storage rows are superseded in the final totals by dedicated post-fix persistence retests. Original results.json is preserved; old feature console exceptions there predate the bootstrap fix. Sample counts are supporting evidence, not separate tests. Routing's 148 assertions are setup-assisted component/browser checks and do not prove naturally earned authenticated Kembara progress.

## Verified bugs and minimal fixes

1. **Guest D3 overwrites local learner profile.** Fresh isolated production storage starts empty. Open/close demos through grades 1–6; pa_coach_v6_full becomes a Demo grade-3 profile. Root cause: Topic-7 epoch preparation persists directly, bypassing save()'s demo guard. The companion non-T7 recorder has the same persistence bypass. Added demoMode guards to both persistence functions. Retests: production desktop/mobile still FAIL; feature desktop/mobile PASS. Unit regression also verifies normal-profile persistence/cloud scheduling and legacy mastery preservation. This could overwrite a saved profile; no existing real profile was exposed to the test.
2. **Fresh login console exception.** Production worksheet mounting invokes coreGrade() while db is null. Early local load can also expose an undefined db to the dev quick button. Profile-only panel mounts now return until db exists, and the quick-button guard tolerates absence. Feature desktop/mobile: zero page exceptions; worksheet still mounts after a synthetic profile is supplied and does not alter that profile.
3. **Obsolete audit assertion.** Guardian test required 3.9.0 literals although release version/cache use js/version.js. Replaced only the obsolete assertion with version/cache wiring checks. Eight checks pass.

No diagnosis rule, mastery algorithm, sprite, battle design, Gerai design or curriculum threshold was changed. The harness is a separate opt-in audit page and is not referenced by index.html or sw.js.

## Actual runtime metadata and variation

Waited for iframe document completion and the live asset refresh, then inspected generate() after all browser wrappers. Earlier measurements taken before wrapper completion were discarded. Tested mastery bands 15/35/80 with 20 generated items per skill/band: **7020 valid questions**, **117 effective runtime skill IDs**, **44 authored diagnostic tags**. The static/VM contract has 114 skills; browser-loaded curriculum wrappers extend/replace the effective graph. Every effective ID was actually generated; presence in the graph alone was not counted as assessability.

| Grade | Skill IDs | Samples | Authored tags | Minimum unique / 20 |
|---|---:|---:|---:|---:|
| 1 | 14 | 840 | 0 | 12 |
| 2 | 37 | 2220 | 44 | 12 |
| 3 | 15 | 900 | 0 | 11 |
| 4 | 17 | 1020 | 0 | 19 |
| 5 | 18 | 1080 | 0 | 3 |
| 6 | 16 | 960 | 0 | 4 |

Only D2.4.5 money sharing retained authored tags in this sample. All final D2.2.4 plain division samples lacked them, despite the separate 250-question source smoke passing. Money tag availability varies with mastery/demand; richer replacement questions do not reliably preserve the pilot tag.

| Required trait | Observed final availability |
|---|---|
| originSkillId / provenance | Authored money pilot only. generate() does not itself assign q.skill; production caller assignment is reproduced before review capture. |
| Operation family | Money tag: division. Other rich question archetypes/competency IDs do not constitute authored atomic operation metadata. |
| Operand values/dimensions | Money pilot carries sen dividend/divisor/quotient digits. These are minor-unit dimensions, not equivalent plain-integer task difficulty. |
| Regroup/remainder | Money exact sharing reports no remainder and regrouping unknown. No final authored plain regroup/remainder contrast probes demonstrated. |
| Question family / context domain | Money sharing family and money context in authored tags; many other questions have broad archetype/context metadata only. |
| Candidate foundation IDs | Present only in pilot tags; remaining domains unavailable. Proposed foundation graph IDs are not automatically runnable probes. |
| Mathematical variant identity | Pilot tags have no stable variantFingerprint. Adapter falls back to question key; differing wording of the same arithmetic equation can be counted separately. Raw-observation duplicate guard passes, but normalized authored equation identity remains a rollout gate. |

Real final-question -> production learner-review -> collector test captured 2 money keys and rejected 2 untagged plain keys. Outcomes remained independent/corrected/assisted/unresolved. Collector abstained from a root label and requested contrast, rather than inventing division weakness. Closing clears in-memory tags. Per-band samples and exact prompt/answer/tag objects are in runtime-metadata.json.

Distinct fingerprints alone do not establish diagnostic form diversity. Some finite families repeat within 20 samples. No matched arithmetic-load visual/context/plain contrast bank or probe scheduler was demonstrated. Numeric source invariants were tested; this audit does not independently validate the mathematics of every generated question.

## Educational correctness, recovery and integrity

- All ten golden specifications match actual browser and Node evaluator decisions. Money failures with successful pure division request money-unit contrast; two division fact failures plus grouping success produce a provisional div.facts candidate. Digit-depth failures can isolate regrouping; successful subtraction/multiplication plus percent-concept failures isolate percent.part_whole. These are synthetic tagged observations, not live pupil diagnoses.
- One error/repeated same probe yields insufficient_evidence. Assistance/correction is not independent mastery. Two independent transfer probes report transfer_observed separately from certainty about a previous root cause; assisted transfer does not verify. Historical candidates are not automatically cleared into mastery after transfer.
- Addition/subtraction carry/borrow/place-value separation and multiplication group/fact/multi-digit root rules are absent. Remainder evidence abstains conservatively but falls back to div.facts rather than a specific remainder probe. Cross-topic unsupported families abstain; that is a safety pass, not validated cross-topic diagnosis.
- D6 synthetic cases request earlier foundations without changing grade. Existing UI Focus remains same-grade and the adaptive engine's prior-grade readiness shortcut is not diagnostic proof. No v2 controller generates a D2-style probe for a D6 learner and returns to an independent D6 task. This is BLOCKED.
- Existing recent independent evidence removes a weak-skill card in the setup-assisted tests. That is the current twenty-encounter selector, not a full v2 recovery/transfer lifecycle.
- Shadow evaluation leaves cloned mastery, rewards, XP, coins, unlocks, grade and input objects unchanged; production review writes only the ephemeral clone's review history. No permanent v2 tags or profile writes were introduced. Production guest persistence defect is distinct from shadow engine integrity.

## Browser and manual evidence

Computer Use used @oai/sky on an isolated visible Edge window: open demo, select default D2, choose incorrect 836 for 635+191, request hint, choose 826, observe next data question. Playwright exercised first-question wrong/hint/correct for all six grades in both device sizes on live and local. These are representative first-question samples, not full six-grade mission completion. Focus card/route tests supplied five varied synthetic encounters; original Wira asset loaded in Gerai. Mobile Focus and Gerai screenshots were visually inspected; no horizontal clipping prevented use in those inspected views. Canvas screenshots are recaptured after using the normal Langkau control and waiting for the entry cinematic to disappear; early black cinematic captures are not layout evidence. No performance budget was measured.

Authenticated Google onboarding, child-profile persistence/reload, naturally earning Focus through Kembara, physical-device testing and exhaustive manual grade journeys remain BLOCKED. No test account was supplied; no real Google sign-in was attempted.

Screenshots (repository-relative):

- audit/focus-v2-e2e/manual-production-d2-after-hint.png
- audit/focus-v2-e2e/feature-mobile-focus-card.png
- audit/focus-v2-e2e/feature-mobile-wirayung.png
- audit/focus-v2-e2e/{production,feature}-{desktop,android}-login.png
- audit/focus-v2-e2e/feature-{desktop,android}-d{1..6}-battle.png
- audit/focus-v2-e2e/production-{desktop,android}-d2-battle.png
- audit/focus-v2-e2e/{production,feature}-{desktop,android}-focus-wirayung.png
- audit/focus-v2-e2e/shadow-harness.png

## Reproduction

Node and Edge/Chromium with Playwright are required. Runners accept FOCUS_AUDIT_BROWSER for the executable; loopback helpers accept FOCUS_AUDIT_URL (default port 8765). Playwright resolves from the installed module or this host's bundled runtime; adjust the fallback path on another machine.

~~~powershell
python -m http.server 8765 --bind 127.0.0.1
# In a second terminal:
node audit/focus-v2-browser-e2e.cjs
node audit/focus-v2-routing-browser.cjs
node audit/focus-v2-bootstrap-browser.cjs
node audit/focus-v2-persistence-browser.cjs
node audit/focus-v2-capture-battles.cjs
node audit/focus-v2-scenario-guards.cjs
node audit/focus-v2-foundation-contract.cjs
node audit/focus-v2-d2-tag-smoke.cjs
node audit/focus-v2-diagnosis-shadow.cjs
node audit/focus-practice-v3.85.68.js
node audit/guardian-focus-v3.8.30.js
node audit/focus-v2-demo-persistence.cjs
node audit/focus-v2-build-report.cjs
~~~

Open /audit/focus-v2-shadow-harness.html?shadow=1 for the isolated shadow panel. Without the query, no engine or app iframe loads. Never add this harness to the production shell.

## Detailed acceptance table

Evidence files below live in audit/focus-v2-e2e. Long exact observations are retained in JSON; table text is abbreviated. Final-results.json contains unabridged consolidated rows and totals.

| Test | Grade | Expected | Actual | PASS/FAIL/BLOCKED | Evidence |
|---|---|---|---|---|---|
| production desktop login | 1–6 | Login + demo visible | 1 Google button; 3.86.1 | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| production desktop demo wrong/hint/correct | 1 | Valid question; wrong retry; hint; correct accepted | D1.SUB20 18 − 6 = ? = 12 | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| production desktop demo wrong/hint/correct | 2 | Valid question; wrong retry; hint; correct accepted | D2.1.4 Apakah nilai digit yang ditanda pada tempat ratus dalam 4 99 ? = 400 | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| production desktop demo wrong/hint/correct | 3 | Valid question; wrong retry; hint; correct accepted | D3.MEASURE 4 kg 272 g 3 kg 172 g + 698 g + 402 g = ? = 4 kg 272 g | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| production desktop demo wrong/hint/correct | 4 | Valid question; wrong retry; hint; correct accepted | D4.COORD 4 · · · · · 3 · · · · · 2 · · ● · · 1 · · · · · 0 · · · · · 0 1 2 3 4 Apakah koordinat titik ●? = (2,2) | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| production desktop demo wrong/hint/correct | 5 | Valid question; wrong retry; hint; correct accepted | D5.FRAC Gambar mewakili 1/5 . Jika kuantiti ini diambil 4 kali , hasil 1/5 × 4 ialah? = 4/5 | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| production desktop demo wrong/hint/correct | 6 | Valid question; wrong retry; hint; correct accepted | D6.DEC 7.2 ÷ □ = 3. Apakah nilai □? = 2.4 | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| production android login | 1–6 | Login + demo visible | 1 Google button; 3.86.1 | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| production android demo wrong/hint/correct | 1 | Valid question; wrong retry; hint; correct accepted | D1.MONEY Di kantin, satu pau berharga 40 sen dan air 10 sen. Jumlah harga? = 50 sen | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| production android demo wrong/hint/correct | 2 | Valid question; wrong retry; hint; correct accepted | D2.1.4 Apakah nilai digit yang ditanda pada tempat sa dalam 59 7 ? = 7 | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| production android demo wrong/hint/correct | 3 | Valid question; wrong retry; hint; correct accepted | D3.SHAPE Segi empat tepat mempunyai berapa sisi? = 4 | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| production android demo wrong/hint/correct | 4 | Valid question; wrong retry; hint; correct accepted | D4.RATIO Ringkaskan nisbah 2:4. = 1:2 | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| production android demo wrong/hint/correct | 5 | Valid question; wrong retry; hint; correct accepted | D5.FRAC Gambar mewakili 1/4 . Jika kuantiti ini diambil 2 kali , hasil 1/4 × 2 ialah? = 1/2 | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| production android demo wrong/hint/correct | 6 | Valid question; wrong retry; hint; correct accepted | D6.RATIO 4 botol menggunakan 10 L air. Pada kadar sama, 10 botol menggunakan? = 25 L | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| feature desktop login | 1–6 | Login + demo visible | 1 Google button; 3.86.1 | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| feature desktop demo wrong/hint/correct | 1 | Valid question; wrong retry; hint; correct accepted | D1.DATA Makanan Gundalan Karipap Pau Kuih Berapakah Karipap direkod? = 5 | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| feature desktop demo wrong/hint/correct | 2 | Valid question; wrong retry; hint; correct accepted | D2.2.2 978 − 374 − 108 = ? = 496 | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| feature desktop demo wrong/hint/correct | 3 | Valid question; wrong retry; hint; correct accepted | D3.PERCENT Berapakah peratus petak yang berlorek? = 95% | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| feature desktop demo wrong/hint/correct | 4 | Valid question; wrong retry; hint; correct accepted | D4.RATE 16 botol disusun sama rata dalam 4 kotak. Berapa botol satu kotak? = 4 | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| feature desktop demo wrong/hint/correct | 5 | Valid question; wrong retry; hint; correct accepted | D5.RATIO Nisbah setara bagi 1:1 ialah? = 3:3 | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| feature desktop demo wrong/hint/correct | 6 | Valid question; wrong retry; hint; correct accepted | D6.MEASURE Setiap 2 m kain memerlukan 0.5 L pewarna. Terdapat 1.4 L pewarna. Berapakah bilangan kumpulan penuh kain sepanjang 2 m yang boleh disiapkan? = 2 | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| feature android login | 1–6 | Login + demo visible | 1 Google button; 3.86.1 | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| feature android demo wrong/hint/correct | 1 | Valid question; wrong retry; hint; correct accepted | D1.MEASURE Untuk membanding panjang dua reben, perkataan yang sesuai? = lebih panjang / lebih pendek | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| feature android demo wrong/hint/correct | 2 | Valid question; wrong retry; hint; correct accepted | D2.3.3 Notasi manakah sepadan dengan rajah? = 0.7 | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| feature android demo wrong/hint/correct | 3 | Valid question; wrong retry; hint; correct accepted | D3.DEC 0.08 + 0.11 Aina mempunyai 0.08 m reben merah dan 0.11 m reben biru. Berapakah jumlah panjang reben? = 0.19 m | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| feature android demo wrong/hint/correct | 4 | Valid question; wrong retry; hint; correct accepted | D4.MONEY Apakah mata wang yang digunakan di Indonesia? = rupiah | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| feature android demo wrong/hint/correct | 5 | Valid question; wrong retry; hint; correct accepted | D5.PERCENT Peratus yang ditunjukkan/ditanya ialah 75% . Dalam bentuk perpuluhan? = 0.75 | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| feature android demo wrong/hint/correct | 6 | Valid question; wrong retry; hint; correct accepted | D6.FRAC (3.5 + 2.5) × 4 = ? = 24 | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| Harness default off | 1–6 | No engine without opt-in | undefined | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| Oracle no-evidence-single-error | 2 | {"state":"insufficient_evidence","rootCause":null,"nextProbe":"div.facts"} | {"state":"insufficient_evidence","rootCause":null,"nextProbe":"div.facts"} | PASS | [runtime-metadata.json](../../audit/focus-v2-e2e/runtime-metadata.json) |
| Oracle money-context-versus-divide | 2 | {"state":"needs_contrast","rootCause":null,"nextProbe":"money.ringgit_sen"} | {"state":"needs_contrast","rootCause":null,"nextProbe":"money.ringgit_sen"} | PASS | [runtime-metadata.json](../../audit/focus-v2-e2e/runtime-metadata.json) |
| Oracle weak-basic-division | 2 | {"state":"candidate","rootCause":"div.facts","nextProbe":"mul.facts"} | {"state":"candidate","rootCause":"div.facts","nextProbe":"mul.facts"} | PASS | [runtime-metadata.json](../../audit/focus-v2-e2e/runtime-metadata.json) |
| Oracle digit-depth-probe | 2 | {"state":"candidate","rootCause":"div.regroup","nextProbe":"number.place_value"} | {"state":"candidate","rootCause":"div.regroup","nextProbe":"number.place_value"} | PASS | [runtime-metadata.json](../../audit/focus-v2-e2e/runtime-metadata.json) |
| Oracle operation-selection-not-fluency | 2 | {"state":"candidate","rootCause":"operation.choose","nextProbe":"operation.choose"} | {"state":"candidate","rootCause":"operation.choose","nextProbe":"operation.choose"} | PASS | [runtime-metadata.json](../../audit/focus-v2-e2e/runtime-metadata.json) |
| Oracle discount-concept-not-subtraction | 5 | {"state":"candidate","rootCause":"percent.part_whole","nextProbe":"fraction.equal_parts"} | {"state":"candidate","rootCause":"percent.part_whole","nextProbe":"fraction.equal_parts"} | PASS | [runtime-metadata.json](../../audit/focus-v2-e2e/runtime-metadata.json) |
| Oracle d6-mixed-ambiguous | 6 | {"state":"insufficient_evidence","rootCause":null,"nextProbe":"operation.choose"} | {"state":"insufficient_evidence","rootCause":null,"nextProbe":"operation.choose"} | PASS | [runtime-metadata.json](../../audit/focus-v2-e2e/runtime-metadata.json) |
| Oracle assistance-not-independent | 2 | {"state":"needs_contrast","rootCause":null,"nextProbe":"div.facts"} | {"state":"needs_contrast","rootCause":null,"nextProbe":"div.facts"} | PASS | [runtime-metadata.json](../../audit/focus-v2-e2e/runtime-metadata.json) |
| Oracle cross-grade-recovery | 6 | {"state":"needs_contrast","rootCause":null,"nextProbe":"div.regroup"} | {"state":"needs_contrast","rootCause":null,"nextProbe":"div.regroup"} | PASS | [runtime-metadata.json](../../audit/focus-v2-e2e/runtime-metadata.json) |
| Oracle cannot-downscore-other-subject | 2 | {"state":"insufficient_evidence","rootCause":null,"nextProbe":"div.facts","mustNotMutate":["D2.2.4","D2.2.3"]} | {"state":"insufficient_evidence","rootCause":null,"nextProbe":"div.facts"} | PASS | [runtime-metadata.json](../../audit/focus-v2-e2e/runtime-metadata.json) |
| Shadow review outcomes | 2 | Independent/corrected/assisted/unresolved kept distinct | independent, corrected, assisted, unresolved | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| Shadow mastery integrity | 2 | No mastery/reward/grade writes; clone review only | true | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| Collector disposal | 2 | In-memory session clears on close | true | PASS | [results.json](../../audit/focus-v2-e2e/results.json) |
| Final runtime generation | 1 | 20 valid items per available skill; distinct variants | 42 skills; 840 valid; min unique 12 | PASS | [runtime-metadata.json](../../audit/focus-v2-e2e/runtime-metadata.json) |
| Authored diagnostic metadata | 1 | Final items carry complete diagnostic tags | 0/840 tagged | BLOCKED | [runtime-metadata.json](../../audit/focus-v2-e2e/runtime-metadata.json) |
| Final runtime generation | 2 | 20 valid items per available skill; distinct variants | 111 skills; 2220 valid; min unique 12 | PASS | [runtime-metadata.json](../../audit/focus-v2-e2e/runtime-metadata.json) |
| Authored diagnostic metadata | 2 | Final items carry complete diagnostic tags | 44/2220 tagged | BLOCKED | [runtime-metadata.json](../../audit/focus-v2-e2e/runtime-metadata.json) |
| Final runtime generation | 3 | 20 valid items per available skill; distinct variants | 45 skills; 900 valid; min unique 11 | PASS | [runtime-metadata.json](../../audit/focus-v2-e2e/runtime-metadata.json) |
| Authored diagnostic metadata | 3 | Final items carry complete diagnostic tags | 0/900 tagged | BLOCKED | [runtime-metadata.json](../../audit/focus-v2-e2e/runtime-metadata.json) |
| Final runtime generation | 4 | 20 valid items per available skill; distinct variants | 51 skills; 1020 valid; min unique 19 | PASS | [runtime-metadata.json](../../audit/focus-v2-e2e/runtime-metadata.json) |
| Authored diagnostic metadata | 4 | Final items carry complete diagnostic tags | 0/1020 tagged | BLOCKED | [runtime-metadata.json](../../audit/focus-v2-e2e/runtime-metadata.json) |
| Final runtime generation | 5 | 20 valid items per available skill; distinct variants | 54 skills; 1080 valid; min unique 3 | PASS | [runtime-metadata.json](../../audit/focus-v2-e2e/runtime-metadata.json) |
| Authored diagnostic metadata | 5 | Final items carry complete diagnostic tags | 0/1080 tagged | BLOCKED | [runtime-metadata.json](../../audit/focus-v2-e2e/runtime-metadata.json) |
| Final runtime generation | 6 | 20 valid items per available skill; distinct variants | 48 skills; 960 valid; min unique 4 | PASS | [runtime-metadata.json](../../audit/focus-v2-e2e/runtime-metadata.json) |
| Authored diagnostic metadata | 6 | Final items carry complete diagnostic tags | 0/960 tagged | BLOCKED | [runtime-metadata.json](../../audit/focus-v2-e2e/runtime-metadata.json) |
| production desktop No focus before evidence | 1 | No focus before evidence | true | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Money card from varied evidence | 1 | Money card from varied evidence | ["D1.MONEY"] | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Money route -> Wirayung | 1 | Money route -> Wirayung | gerai-wirayung.html?pa_nonce= #d1-bayar | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Wira asset loaded | 1 | Wira asset loaded | Loaded original Wira asset | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Wirayung exit keeps grade | 1 | Wirayung exit keeps grade | 1 | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Recent independent evidence removes card | 1 | Recent independent evidence removes card | false | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop No focus before evidence | 2 | No focus before evidence | true | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Money card from varied evidence | 2 | Money card from varied evidence | ["D2.4.5"] | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Money route -> Wirayung | 2 | Money route -> Wirayung | gerai-wirayung.html?pa_nonce= #d2-bahagi | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Wira asset loaded | 2 | Wira asset loaded | Loaded original Wira asset | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Wirayung exit keeps grade | 2 | Wirayung exit keeps grade | 2 | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Recent independent evidence removes card | 2 | Recent independent evidence removes card | false | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop No focus before evidence | 3 | No focus before evidence | true | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Money card from varied evidence | 3 | Money card from varied evidence | ["D3.MONEY"] | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Money route -> Wirayung | 3 | Money route -> Wirayung | gerai-wirayung.html?pa_nonce= #d3-bayar-baki | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Wira asset loaded | 3 | Wira asset loaded | Loaded original Wira asset | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Wirayung exit keeps grade | 3 | Wirayung exit keeps grade | 3 | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Recent independent evidence removes card | 3 | Recent independent evidence removes card | false | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop No focus before evidence | 4 | No focus before evidence | true | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Money card from varied evidence | 4 | Money card from varied evidence | ["D4.MONEY"] | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Money route -> Wirayung | 4 | Money route -> Wirayung | gerai-wirayung.html?pa_nonce= #d4-bayar-baki | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Wira asset loaded | 4 | Wira asset loaded | Loaded original Wira asset | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Wirayung exit keeps grade | 4 | Wirayung exit keeps grade | 4 | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Recent independent evidence removes card | 4 | Recent independent evidence removes card | false | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop No focus before evidence | 5 | No focus before evidence | true | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Money card from varied evidence | 5 | Money card from varied evidence | ["D5.MONEY"] | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Money route -> Wirayung | 5 | Money route -> Wirayung | gerai-wirayung.html?pa_nonce= #d5-diskaun | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Wira asset loaded | 5 | Wira asset loaded | Loaded original Wira asset | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Wirayung exit keeps grade | 5 | Wirayung exit keeps grade | 5 | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Recent independent evidence removes card | 5 | Recent independent evidence removes card | false | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop No focus before evidence | 6 | No focus before evidence | true | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Money card from varied evidence | 6 | Money card from varied evidence | ["D6.MONEY"] | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Money route -> Wirayung | 6 | Money route -> Wirayung | gerai-wirayung.html?pa_nonce= #d6-diskaun | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Wira asset loaded | 6 | Wira asset loaded | Loaded original Wira asset | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Wirayung exit keeps grade | 6 | Wirayung exit keeps grade | 6 | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Recent independent evidence removes card | 6 | Recent independent evidence removes card | false | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production desktop Operations route -> focused battle | 2 | Operations route -> focused battle | {"route":"focus","pool":["D2.2.3"],"grade":2} | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android No focus before evidence | 1 | No focus before evidence | true | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Money card from varied evidence | 1 | Money card from varied evidence | ["D1.MONEY"] | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Money route -> Wirayung | 1 | Money route -> Wirayung | gerai-wirayung.html?pa_nonce= #d1-bayar | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Wira asset loaded | 1 | Wira asset loaded | Loaded original Wira asset | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Wirayung exit keeps grade | 1 | Wirayung exit keeps grade | 1 | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Recent independent evidence removes card | 1 | Recent independent evidence removes card | false | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android No focus before evidence | 2 | No focus before evidence | true | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Money card from varied evidence | 2 | Money card from varied evidence | ["D2.4.5"] | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Money route -> Wirayung | 2 | Money route -> Wirayung | gerai-wirayung.html?pa_nonce= #d2-bahagi | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Wira asset loaded | 2 | Wira asset loaded | Loaded original Wira asset | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Wirayung exit keeps grade | 2 | Wirayung exit keeps grade | 2 | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Recent independent evidence removes card | 2 | Recent independent evidence removes card | false | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android No focus before evidence | 3 | No focus before evidence | true | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Money card from varied evidence | 3 | Money card from varied evidence | ["D3.MONEY"] | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Money route -> Wirayung | 3 | Money route -> Wirayung | gerai-wirayung.html?pa_nonce= #d3-bayar-baki | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Wira asset loaded | 3 | Wira asset loaded | Loaded original Wira asset | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Wirayung exit keeps grade | 3 | Wirayung exit keeps grade | 3 | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Recent independent evidence removes card | 3 | Recent independent evidence removes card | false | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android No focus before evidence | 4 | No focus before evidence | true | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Money card from varied evidence | 4 | Money card from varied evidence | ["D4.MONEY"] | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Money route -> Wirayung | 4 | Money route -> Wirayung | gerai-wirayung.html?pa_nonce= #d4-bayar-baki | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Wira asset loaded | 4 | Wira asset loaded | Loaded original Wira asset | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Wirayung exit keeps grade | 4 | Wirayung exit keeps grade | 4 | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Recent independent evidence removes card | 4 | Recent independent evidence removes card | false | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android No focus before evidence | 5 | No focus before evidence | true | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Money card from varied evidence | 5 | Money card from varied evidence | ["D5.MONEY"] | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Money route -> Wirayung | 5 | Money route -> Wirayung | gerai-wirayung.html?pa_nonce= #d5-diskaun | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Wira asset loaded | 5 | Wira asset loaded | Loaded original Wira asset | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Wirayung exit keeps grade | 5 | Wirayung exit keeps grade | 5 | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Recent independent evidence removes card | 5 | Recent independent evidence removes card | false | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android No focus before evidence | 6 | No focus before evidence | true | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Money card from varied evidence | 6 | Money card from varied evidence | ["D6.MONEY"] | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Money route -> Wirayung | 6 | Money route -> Wirayung | gerai-wirayung.html?pa_nonce= #d6-diskaun | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Wira asset loaded | 6 | Wira asset loaded | Loaded original Wira asset | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Wirayung exit keeps grade | 6 | Wirayung exit keeps grade | 6 | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Recent independent evidence removes card | 6 | Recent independent evidence removes card | false | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| production android Operations route -> focused battle | 2 | Operations route -> focused battle | {"route":"focus","pool":["D2.2.3"],"grade":2} | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop No focus before evidence | 1 | No focus before evidence | true | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Money card from varied evidence | 1 | Money card from varied evidence | ["D1.MONEY"] | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Money route -> Wirayung | 1 | Money route -> Wirayung | gerai-wirayung.html?pa_nonce= #d1-bayar | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Wira asset loaded | 1 | Wira asset loaded | Loaded original Wira asset | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Wirayung exit keeps grade | 1 | Wirayung exit keeps grade | 1 | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Recent independent evidence removes card | 1 | Recent independent evidence removes card | false | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop No focus before evidence | 2 | No focus before evidence | true | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Money card from varied evidence | 2 | Money card from varied evidence | ["D2.4.5"] | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Money route -> Wirayung | 2 | Money route -> Wirayung | gerai-wirayung.html?pa_nonce= #d2-bahagi | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Wira asset loaded | 2 | Wira asset loaded | Loaded original Wira asset | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Wirayung exit keeps grade | 2 | Wirayung exit keeps grade | 2 | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Recent independent evidence removes card | 2 | Recent independent evidence removes card | false | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop No focus before evidence | 3 | No focus before evidence | true | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Money card from varied evidence | 3 | Money card from varied evidence | ["D3.MONEY"] | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Money route -> Wirayung | 3 | Money route -> Wirayung | gerai-wirayung.html?pa_nonce= #d3-bayar-baki | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Wira asset loaded | 3 | Wira asset loaded | Loaded original Wira asset | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Wirayung exit keeps grade | 3 | Wirayung exit keeps grade | 3 | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Recent independent evidence removes card | 3 | Recent independent evidence removes card | false | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop No focus before evidence | 4 | No focus before evidence | true | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Money card from varied evidence | 4 | Money card from varied evidence | ["D4.MONEY"] | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Money route -> Wirayung | 4 | Money route -> Wirayung | gerai-wirayung.html?pa_nonce= #d4-bayar-baki | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Wira asset loaded | 4 | Wira asset loaded | Loaded original Wira asset | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Wirayung exit keeps grade | 4 | Wirayung exit keeps grade | 4 | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Recent independent evidence removes card | 4 | Recent independent evidence removes card | false | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop No focus before evidence | 5 | No focus before evidence | true | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Money card from varied evidence | 5 | Money card from varied evidence | ["D5.MONEY"] | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Money route -> Wirayung | 5 | Money route -> Wirayung | gerai-wirayung.html?pa_nonce= #d5-diskaun | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Wira asset loaded | 5 | Wira asset loaded | Loaded original Wira asset | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Wirayung exit keeps grade | 5 | Wirayung exit keeps grade | 5 | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Recent independent evidence removes card | 5 | Recent independent evidence removes card | false | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop No focus before evidence | 6 | No focus before evidence | true | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Money card from varied evidence | 6 | Money card from varied evidence | ["D6.MONEY"] | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Money route -> Wirayung | 6 | Money route -> Wirayung | gerai-wirayung.html?pa_nonce= #d6-diskaun | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Wira asset loaded | 6 | Wira asset loaded | Loaded original Wira asset | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Wirayung exit keeps grade | 6 | Wirayung exit keeps grade | 6 | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Recent independent evidence removes card | 6 | Recent independent evidence removes card | false | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature desktop Operations route -> focused battle | 2 | Operations route -> focused battle | {"route":"focus","pool":["D2.2.3"],"grade":2} | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android No focus before evidence | 1 | No focus before evidence | true | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Money card from varied evidence | 1 | Money card from varied evidence | ["D1.MONEY"] | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Money route -> Wirayung | 1 | Money route -> Wirayung | gerai-wirayung.html?pa_nonce= #d1-bayar | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Wira asset loaded | 1 | Wira asset loaded | Loaded original Wira asset | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Wirayung exit keeps grade | 1 | Wirayung exit keeps grade | 1 | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Recent independent evidence removes card | 1 | Recent independent evidence removes card | false | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android No focus before evidence | 2 | No focus before evidence | true | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Money card from varied evidence | 2 | Money card from varied evidence | ["D2.4.5"] | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Money route -> Wirayung | 2 | Money route -> Wirayung | gerai-wirayung.html?pa_nonce= #d2-bahagi | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Wira asset loaded | 2 | Wira asset loaded | Loaded original Wira asset | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Wirayung exit keeps grade | 2 | Wirayung exit keeps grade | 2 | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Recent independent evidence removes card | 2 | Recent independent evidence removes card | false | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android No focus before evidence | 3 | No focus before evidence | true | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Money card from varied evidence | 3 | Money card from varied evidence | ["D3.MONEY"] | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Money route -> Wirayung | 3 | Money route -> Wirayung | gerai-wirayung.html?pa_nonce= #d3-bayar-baki | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Wira asset loaded | 3 | Wira asset loaded | Loaded original Wira asset | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Wirayung exit keeps grade | 3 | Wirayung exit keeps grade | 3 | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Recent independent evidence removes card | 3 | Recent independent evidence removes card | false | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android No focus before evidence | 4 | No focus before evidence | true | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Money card from varied evidence | 4 | Money card from varied evidence | ["D4.MONEY"] | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Money route -> Wirayung | 4 | Money route -> Wirayung | gerai-wirayung.html?pa_nonce= #d4-bayar-baki | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Wira asset loaded | 4 | Wira asset loaded | Loaded original Wira asset | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Wirayung exit keeps grade | 4 | Wirayung exit keeps grade | 4 | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Recent independent evidence removes card | 4 | Recent independent evidence removes card | false | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android No focus before evidence | 5 | No focus before evidence | true | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Money card from varied evidence | 5 | Money card from varied evidence | ["D5.MONEY"] | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Money route -> Wirayung | 5 | Money route -> Wirayung | gerai-wirayung.html?pa_nonce= #d5-diskaun | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Wira asset loaded | 5 | Wira asset loaded | Loaded original Wira asset | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Wirayung exit keeps grade | 5 | Wirayung exit keeps grade | 5 | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Recent independent evidence removes card | 5 | Recent independent evidence removes card | false | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android No focus before evidence | 6 | No focus before evidence | true | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Money card from varied evidence | 6 | Money card from varied evidence | ["D6.MONEY"] | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Money route -> Wirayung | 6 | Money route -> Wirayung | gerai-wirayung.html?pa_nonce= #d6-diskaun | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Wira asset loaded | 6 | Wira asset loaded | Loaded original Wira asset | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Wirayung exit keeps grade | 6 | Wirayung exit keeps grade | 6 | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Recent independent evidence removes card | 6 | Recent independent evidence removes card | false | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| feature android Operations route -> focused battle | 2 | Operations route -> focused battle | {"route":"focus","pool":["D2.2.3"],"grade":2} | PASS | [routing-results.json](../../audit/focus-v2-e2e/routing-results.json) |
| Feature desktop fresh login regression | 1–6 | No null/undefined profile exceptions | [] | PASS | [bootstrap-results.json](../../audit/focus-v2-e2e/bootstrap-results.json) |
| Feature desktop panel mounts after profile supplied | 2 | Worksheet available; profile unchanged | {"worksheet":true,"integrity":true} | PASS | [bootstrap-results.json](../../audit/focus-v2-e2e/bootstrap-results.json) |
| Feature android fresh login regression | 1–6 | No null/undefined profile exceptions | [] | PASS | [bootstrap-results.json](../../audit/focus-v2-e2e/bootstrap-results.json) |
| Feature android panel mounts after profile supplied | 2 | Worksheet available; profile unchanged | {"worksheet":true,"integrity":true} | PASS | [bootstrap-results.json](../../audit/focus-v2-e2e/bootstrap-results.json) |
| B distinct remainder failures do not condemn all division | 2 | Conservative abstention; precise remainder probe selection is unavailable | {"version":"0.1.0-shadow","mode":"shadow_read_only","originSkillId":"D2.2.4","state":"needs_contrast","rootCause":null,"nextProbe":"div.facts","confidence":"low","reasonCode":"AMBI | PASS | [scenario-results.json](../../audit/focus-v2-e2e/scenario-results.json) |
| H same equation repeated does not become evidence | 2 | One unique question is insufficient | {"version":"0.1.0-shadow","mode":"shadow_read_only","originSkillId":"D2.4.5","state":"insufficient_evidence","rootCause":null,"nextProbe":"div.facts","confidence":"none","reasonCod | PASS | [scenario-results.json](../../audit/focus-v2-e2e/scenario-results.json) |
| I assisted transfer does not verify | 2 | Only independent transfer verifies | {"version":"0.1.0-shadow","mode":"shadow_read_only","originSkillId":"D2.4.5","state":"needs_contrast","rootCause":null,"nextProbe":"div.facts","confidence":"low","reasonCode":"ASSI | PASS | [scenario-results.json](../../audit/focus-v2-e2e/scenario-results.json) |
| I two independent transfers observed | 6 | Transfer observation is separate from mastery certification | {"version":"0.1.0-shadow","mode":"shadow_read_only","originSkillId":"D6.MONEY","state":"insufficient_evidence","rootCause":null,"nextProbe":"operation.choose","confidence":"none"," | PASS | [scenario-results.json](../../audit/focus-v2-e2e/scenario-results.json) |
| J unsupported time abstains | 1–6 | No arithmetic weakness inferred from unsupported context | {"version":"0.1.0-shadow","mode":"shadow_read_only","originSkillId":"context-audit","state":"insufficient_evidence","rootCause":null,"nextProbe":"operation.choose","confidence":"no | PASS | [scenario-results.json](../../audit/focus-v2-e2e/scenario-results.json) |
| J unsupported measurement abstains | 1–6 | No arithmetic weakness inferred from unsupported context | {"version":"0.1.0-shadow","mode":"shadow_read_only","originSkillId":"context-audit","state":"insufficient_evidence","rootCause":null,"nextProbe":"operation.choose","confidence":"no | PASS | [scenario-results.json](../../audit/focus-v2-e2e/scenario-results.json) |
| J unsupported fraction abstains | 1–6 | No arithmetic weakness inferred from unsupported context | {"version":"0.1.0-shadow","mode":"shadow_read_only","originSkillId":"context-audit","state":"insufficient_evidence","rootCause":null,"nextProbe":"operation.choose","confidence":"no | PASS | [scenario-results.json](../../audit/focus-v2-e2e/scenario-results.json) |
| J unsupported percent abstains | 1–6 | No arithmetic weakness inferred from unsupported context | {"version":"0.1.0-shadow","mode":"shadow_read_only","originSkillId":"context-audit","state":"insufficient_evidence","rootCause":null,"nextProbe":"operation.choose","confidence":"no | PASS | [scenario-results.json](../../audit/focus-v2-e2e/scenario-results.json) |
| J unsupported ratio abstains | 1–6 | No arithmetic weakness inferred from unsupported context | {"version":"0.1.0-shadow","mode":"shadow_read_only","originSkillId":"context-audit","state":"insufficient_evidence","rootCause":null,"nextProbe":"operation.choose","confidence":"no | PASS | [scenario-results.json](../../audit/focus-v2-e2e/scenario-results.json) |
| J unsupported data abstains | 1–6 | No arithmetic weakness inferred from unsupported context | {"version":"0.1.0-shadow","mode":"shadow_read_only","originSkillId":"context-audit","state":"insufficient_evidence","rootCause":null,"nextProbe":"operation.choose","confidence":"no | PASS | [scenario-results.json](../../audit/focus-v2-e2e/scenario-results.json) |
| A real money vs plain arithmetic contrast | 2 | Matched varied authored money/plain probes | Money tags partially survive; final plain D2 division tags absent | BLOCKED | [scenario-results.json](../../audit/focus-v2-e2e/scenario-results.json) |
| B operand depth/remainder diagnostic bank | 2–6 | Choose digit/regroup/remainder probes at matched arithmetic load | Synthetic digit-depth fixture exists; no runtime contrast-bank scheduler; remainder falls back to div.facts | BLOCKED | [scenario-results.json](../../audit/focus-v2-e2e/scenario-results.json) |
| C addition/subtraction root separation | 1–6 | Facts vs carrying/borrowing/place-value/conceptual probes | Families do not encode carry/borrow; no specialized inference rule or authored runtime probes | BLOCKED | [scenario-results.json](../../audit/focus-v2-e2e/scenario-results.json) |
| D multiplication root separation | 1–6 | Equal groups vs facts vs multi-digit probes | Multiplication is only clean-computation evidence; no root-specific rule | BLOCKED | [scenario-results.json](../../audit/focus-v2-e2e/scenario-results.json) |
| E live discount root separation | 5 | Percent misconception contrasted with subtraction | Synthetic oracle supported; final authored D5 diagnostic tags absent | BLOCKED | [scenario-results.json](../../audit/focus-v2-e2e/scenario-results.json) |
| F cross-grade v2 remediation | 6 | Earlier-grade probes with D6 identity and return to origin | V2 returns a probe ID only; active Focus router remains same-grade; no v2 recovery controller | BLOCKED | [scenario-results.json](../../audit/focus-v2-e2e/scenario-results.json) |
| I recover -> independent -> transfer -> card removal | 1–6 | Complete v2 recovery lifecycle | Independent recent evidence removes existing cards; v2 transfer lifecycle/root re-evaluation not wired | BLOCKED | [scenario-results.json](../../audit/focus-v2-e2e/scenario-results.json) |
| J mathematically validated cross-topic dependency probes | 1–6 | Time/measure/fraction/percent/ratio/data operation vs context contrast | Context banks generate content but authored v2 dependency metadata and contrast orchestration absent | BLOCKED | [scenario-results.json](../../audit/focus-v2-e2e/scenario-results.json) |
| Authenticated onboarding/save/reload | 1–6 | Real account onboarding, child grade selection and save/reload | No dedicated authorized test account supplied; guest and synthetic profiles only | BLOCKED | [scenario-results.json](../../audit/focus-v2-e2e/scenario-results.json) |
| Kembara earns focus through authenticated gameplay | 1–6 | Earn five encounters naturally, open hub Focus and complete/reload a real profile | Guest gameplay and setup-assisted production Focus route tested; authenticated cumulative journey not executed | BLOCKED | [scenario-results.json](../../audit/focus-v2-e2e/scenario-results.json) |
| Manual D1–D6 full focus journeys | 1–6 | Computer Use verifies every full journey | Manual production D2 wrong/hint/correct and local shadow inspected; remaining journeys automated/setup-assisted | BLOCKED | [scenario-results.json](../../audit/focus-v2-e2e/scenario-results.json) |
| production desktop guest persistence retest | 1–6 | Learner profile keys unchanged after six lifecycle cycles | {"profileKeysBefore":[["pa_coach_v6_full",null],["pa_coach_v5",null]],"profileKeysAfter":[["pa_coach_v6_full",{"name":"Demo","schoolGrade":3,"demoMode":true,"skills":117}],["pa_coa | FAIL | [persistence-results.json](../../audit/focus-v2-e2e/persistence-results.json) |
| production android guest persistence retest | 1–6 | Learner profile keys unchanged after six lifecycle cycles | {"profileKeysBefore":[["pa_coach_v6_full",null],["pa_coach_v5",null]],"profileKeysAfter":[["pa_coach_v6_full",{"name":"Demo","schoolGrade":3,"demoMode":true,"skills":117}],["pa_coa | FAIL | [persistence-results.json](../../audit/focus-v2-e2e/persistence-results.json) |
| feature desktop guest persistence retest | 1–6 | Learner profile keys unchanged after six lifecycle cycles | {"profileKeysBefore":[["pa_coach_v6_full",null],["pa_coach_v5",null]],"profileKeysAfter":[["pa_coach_v6_full",null],["pa_coach_v5",null]],"otherChangedKeys":[]} | PASS | [persistence-results.json](../../audit/focus-v2-e2e/persistence-results.json) |
| feature android guest persistence retest | 1–6 | Learner profile keys unchanged after six lifecycle cycles | {"profileKeysBefore":[["pa_coach_v6_full",null],["pa_coach_v5",null]],"profileKeysAfter":[["pa_coach_v6_full",null],["pa_coach_v5",null]],"otherChangedKeys":[]} | PASS | [persistence-results.json](../../audit/focus-v2-e2e/persistence-results.json) |
| Foundation contract | 1–6 | Regression passes | 114 curriculum skills; 23 operation; 12 money; 33 proposed foundations; 10 fixture specs | PASS | See reproduction commands |
| Source D2 tag smoke | 1–6 | Regression passes | 500 seeded source questions; numeric/tag invariants passed | PASS | See reproduction commands |
| Shadow Node regression | 1–6 | Regression passes | 10 fixtures; 77 assertions; scoped adapter/collector; no mutation | PASS | See reproduction commands |
| Existing Focus regression | 1–6 | Regression passes | 9,120 VM samples across 114 skills; minimum unique 20; ranking/routing passed | PASS | See reproduction commands |
| Guardian Focus version wiring | 1–6 | Regression passes | 8 checks; obsolete version literal replaced by current-version/cache contract | PASS | See reproduction commands |
| D3 persistence unit regression | 1–6 | Regression passes | 16 assertions: demo does not persist/schedule cloud; normal profiles still persist; legacy mastery unchanged | PASS | See reproduction commands |
| Manual Computer Use production D2 | 2 | Wrong -> hint -> correct -> next question | 635 + 191; chose 836, read hint, chose 826; next question was Tafsir Carta | PASS | [manual-production-d2-after-hint.png](../../audit/focus-v2-e2e/manual-production-d2-after-hint.png) |
| Production fresh-login console | 1–6 | No profile-null exception | coreGrade -> parent worksheet mount reads null schoolGrade; feature fixed separately | FAIL | [production-bootstrap-errors.json](../../audit/focus-v2-e2e/production-bootstrap-errors.json) |
