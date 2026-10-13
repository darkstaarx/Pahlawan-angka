#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');const root=path.resolve(__dirname,'..'),dir=path.join(__dirname,'focus-v2-e2e');
const read=n=>JSON.parse(fs.readFileSync(path.join(dir,n+'.json'),'utf8'));
// Preserve baseline artifacts; latest dedicated persistence retests supersede
// the four initial storage checks, which ran before migration guards landed.
const rows=read('results').rows.filter(r=>!r.test.endsWith('guest persistence'));
for(const n of ['routing-results','bootstrap-results','scenario-results','persistence-results'])rows.push(...read(n).rows);
for(const [test,actual] of [
 ['Foundation contract','114 curriculum skills; 23 operation; 12 money; 33 proposed foundations; 10 fixture specs'],
 ['Source D2 tag smoke','500 seeded source questions; numeric/tag invariants passed'],
 ['Shadow Node regression','10 fixtures; 77 assertions; scoped adapter/collector; no mutation'],
 ['Existing Focus regression','9,120 VM samples across 114 skills; minimum unique 20; ranking/routing passed'],
 ['Guardian Focus version wiring','8 checks; obsolete version literal replaced by current-version/cache contract'],
 ['D3 persistence unit regression','16 assertions: demo does not persist/schedule cloud; normal profiles still persist; legacy mastery unchanged']
 ])rows.push({test,grade:'1–6',expected:'Regression passes',actual,status:'PASS',evidence:'See reproduction commands'});
rows.push({test:'Manual Computer Use production D2',grade:2,expected:'Wrong -> hint -> correct -> next question',actual:'635 + 191; chose 836, read hint, chose 826; next question was Tafsir Carta',status:'PASS',evidence:'manual-production-d2-after-hint.png'});
rows.push({test:'Production fresh-login console',grade:'1–6',expected:'No profile-null exception',actual:'coreGrade -> parent worksheet mount reads null schoolGrade; feature fixed separately',status:'FAIL',evidence:'production-bootstrap-errors.json'});
const totals={total:rows.length,pass:rows.filter(x=>x.status==='PASS').length,fail:rows.filter(x=>x.status==='FAIL').length,blocked:rows.filter(x=>x.status==='BLOCKED').length};
fs.writeFileSync(path.join(dir,'final-results.json'),JSON.stringify({totals,rows},null,2));
const m=read('runtime-metadata'),samples=m.metadata.reduce((n,x)=>n+x.valid,0),tagged=m.metadata.reduce((n,x)=>n+x.tagged,0);
const compact=v=>String(typeof v==='string'?v:JSON.stringify(v)).replace(/<[^>]*>/g,' ').replace(/[\r\n|]/g,' ').replace(/\s+/g,' ').slice(0,180);
let doc=`# Focus Diagnosis v2 — Phase C browser audit

Date: 12 October 2026. Decision: **NO-GO for user-facing Focus v2 integration.** The pure shadow oracle passes; complete authored runtime probes and a recovery controller do not exist. Production findings remain separate from v2 readiness.

## Scope and baseline

- Repository: darkstaarx/Pahlawan-angka. Work performed only on feature/focus-diagnosis-foundations-v1, based on 065f0c2; fetched main snapshot 27e1e69 (refresh division offline bank). No merge, push or deployment was performed.
- Live read-only URL: https://darkstaarx.github.io/Pahlawan-angka/ ; observed release 3.86.1. Local feature served over loopback. Isolated Edge/Chromium contexts, service workers blocked, desktop 1280×800 and Android-emulated portrait 360×640 (9:16). This is browser emulation, not physical Android hardware.
- Automated browser contexts reject non-GET/HEAD network requests. Synthetic Focus profiles bypass commercial/rest gates in memory and disable save/cloud. No real account, child profile or cloud data was used.
- Reviewed README, foundation map, tag audit, Phase C shadow report, ten fixtures, engine, collector, guardian Focus, adaptive and learner-review code. Static app deploy surface is index.html/sw.js/version.js. The sole checked-in Actions workflow builds marketing posters on main; GitHub Pages dashboard/source settings were not independently verified (gh unavailable). Local feature is never presented as deployed.
- Existing Node checks initially passed except the Guardian audit's stale 3.9.0 version assertion. That audit now checks the current version source and cache wiring; all six final Node suites pass.

## Final results

**${totals.total} listed checks: ${totals.pass} PASS, ${totals.fail} FAIL, ${totals.blocked} BLOCKED.** ${totals.pass+totals.fail} checks executed with final outcomes; blocked rows are unimplemented/inaccessible acceptance gates, not passing tests. All three final failures concern unchanged production. Feature fixes passed dedicated browser retests.

The initial broad browser run recorded 58 checks (48 pass, 4 storage failures, 6 metadata blockers). Its four storage rows are superseded in the final totals by dedicated post-fix persistence retests. Original results.json is preserved; old feature console exceptions there predate the bootstrap fix. Sample counts are supporting evidence, not separate tests. Routing's 148 assertions are setup-assisted component/browser checks and do not prove naturally earned authenticated Kembara progress.

## Verified bugs and minimal fixes

1. **Guest D3 overwrites local learner profile.** Fresh isolated production storage starts empty. Open/close demos through grades 1–6; pa_coach_v6_full becomes a Demo grade-3 profile. Root cause: Topic-7 epoch preparation persists directly, bypassing save()'s demo guard. The companion non-T7 recorder has the same persistence bypass. Added demoMode guards to both persistence functions. Retests: production desktop/mobile still FAIL; feature desktop/mobile PASS. Unit regression also verifies normal-profile persistence/cloud scheduling and legacy mastery preservation. This could overwrite a saved profile; no existing real profile was exposed to the test.
2. **Fresh login console exception.** Production worksheet mounting invokes coreGrade() while db is null. Early local load can also expose an undefined db to the dev quick button. Profile-only panel mounts now return until db exists, and the quick-button guard tolerates absence. Feature desktop/mobile: zero page exceptions; worksheet still mounts after a synthetic profile is supplied and does not alter that profile.
3. **Obsolete audit assertion.** Guardian test required 3.9.0 literals although release version/cache use js/version.js. Replaced only the obsolete assertion with version/cache wiring checks. Eight checks pass.

No diagnosis rule, mastery algorithm, sprite, battle design, Gerai design or curriculum threshold was changed. The harness is a separate opt-in audit page and is not referenced by index.html or sw.js.

## Actual runtime metadata and variation

Waited for iframe document completion and the live asset refresh, then inspected generate() after all browser wrappers. Earlier measurements taken before wrapper completion were discarded. Tested mastery bands 15/35/80 with 20 generated items per skill/band: **${samples} valid questions**, **${new Set(m.metadata.map(x=>x.id)).size} effective runtime skill IDs**, **${tagged} authored diagnostic tags**. The static/VM contract has 114 skills; browser-loaded curriculum wrappers extend/replace the effective graph. Every effective ID was actually generated; presence in the graph alone was not counted as assessability.

| Grade | Skill IDs | Samples | Authored tags | Minimum unique / 20 |
|---|---:|---:|---:|---:|
`;
for(let g=1;g<=6;g++){const x=m.metadata.filter(x=>x.grade===g);doc+=`| ${g} | ${new Set(x.map(y=>y.id)).size} | ${x.reduce((n,y)=>n+y.valid,0)} | ${x.reduce((n,y)=>n+y.tagged,0)} | ${Math.min(...x.map(y=>y.unique))} |\n`}
doc+=`
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

Real final-question -> production learner-review -> collector test captured ${m.stats.capturedQuestionKeys} money keys and rejected ${m.stats.rejected} untagged plain keys. Outcomes remained independent/corrected/assisted/unresolved. Collector abstained from a root label and requested contrast, rather than inventing division weakness. Closing clears in-memory tags. Per-band samples and exact prompt/answer/tag objects are in runtime-metadata.json.

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
`;
for(const r of rows){const evidence=r.evidence==='See reproduction commands'?r.evidence:`[${r.evidence}](../../audit/focus-v2-e2e/${r.evidence})`;doc+=`| ${compact(r.test)} | ${r.grade} | ${compact(r.expected)} | ${compact(r.actual)} | ${r.status} | ${evidence} |\n`}
fs.writeFileSync(path.join(root,'docs/focus-v2/PHASE-C-BROWSER-E2E-REPORT.md'),doc);console.log(totals);
