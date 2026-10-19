#!/usr/bin/env node
'use strict';
// Phase C shadow-only oracle, contamination and production-record adapter tests.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const engine=require(path.join(root,'js/engine/focus-diagnosis-v2.js'));
const review=require(path.join(root,'js/engine/learner-review-v1.js'));
const shadowCollector=require(path.join(root,'js/engine/focus-diagnosis-shadow-v1.js'));
const fixtures=JSON.parse(fs.readFileSync(path.join(root,'data/focus-v2/diagnosis-fixtures-v1.json'),'utf8'));
let checks=0;
function check(condition,desc){assert(condition,desc);checks++}
for(const fixture of fixtures.cases){
 const before=JSON.stringify(fixture),actual=engine.evaluate(fixture),expected=fixture.expected;
 check(actual.state===expected.state,fixture.id+' state expected '+expected.state+' got '+actual.state);
 check(actual.rootCause===expected.rootCause,fixture.id+' root expected '+expected.rootCause+' got '+actual.rootCause);
 check(actual.nextProbe===expected.nextProbe,fixture.id+' next probe expected '+expected.nextProbe+' got '+actual.nextProbe);
 check(actual.writes===0&&actual.mode==='shadow_read_only',fixture.id+' must not mutate');
 check(JSON.stringify(fixture)===before,fixture.id+' input mutated');
}
const o=(family,probe,result,purpose='normal')=>({family,probe,result,purpose});
const diagnose=observations=>engine.evaluate({originSkillId:'D2.4.5',observations});
const D=engine.evaluate({originSkillId:'D6.MONEY',observations:[
 o('budget','budget-1','unresolved'),o('regroup_div','84-4','unresolved'),
 o('regroup_div','76-4','unresolved'),o('division_fact','24-4','independent'),
 o('division_fact','32-4','independent')]});
check(D.state==='candidate'&&D.rootCause==='div.regroup', 'D6 earlier-grade regrouping root candidate');
const single=diagnose([o('money','same','unresolved'),o('money','same','unresolved'),o('money','same','unresolved')]);
check(single.state==='insufficient_evidence'&&single.evidence.uniqueTaggedQuestions===1,'duplicate equations not repeated proof');
const money=diagnose([
 o('money','m1','unresolved'),o('money','m2','unresolved'),o('division_fact','d1','independent'),o('division_fact','d2','independent')]);
check(money.state==='needs_contrast'&&money.rootCause===null&&money.nextProbe==='money.ringgit_sen','money issue is not automatically divide facts');
const allGood=diagnose([o('division_fact','f1','independent'),o('division_fact','f2','independent')]);
check(allGood.rootCause===null,'no root cause from healthy arithmetic');
const remainder=diagnose([o('division_fact','24/4','independent'),o('division_fact','36/6','independent'),o('remainder_div','25/4','unresolved')]);
check(remainder.rootCause===null&&remainder.nextProbe==='div.remainder'&&remainder.state==='needs_contrast','remainder failure does not downgrade clean exact division');
const allHelp=diagnose([o('division_fact','f1','assisted'),o('division_fact','f2','corrected')]);
check(allHelp.rootCause===null,'hint or correction not mastered');
const none=engine.evaluate({originSkillId:'D2.4.5',observations:[]});
check(none.state==='insufficient_evidence','no evidence abstains');
const oldGrade=engine.evaluate({originSkillId:'D6.OPS',observations:[o('mixed','only-one','unresolved')]});
check(oldGrade.rootCause===null,'no D6 mixed-ops guessing');
const transfer=diagnose([
 o('division_fact','b1','unresolved'),o('division_fact','b2','unresolved'),
 o('grouping','g1','independent'),
 o('transfer_verify','v1','independent'),o('transfer_verify','v2','independent')]);
check(transfer.verification==='transfer_observed','distinct independent transfer is observed, not claimed psychology');
check(transfer.rootCause==='div.facts'&&transfer.state==='candidate','transfer does not erase historical root candidate without new diagnosis window');
const profile={schoolGrade:2,skills:{'D2.2.4':{mastery:44},'D2.4.5':{mastery:17}}};
const math=Object.create(Math);let seed=31;
math.random=()=>((seed=Math.imul(1664525,seed)+1013904223|0)>>>0)/4294967296;
const source=fs.readFileSync(path.join(root,'questions/helpers.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'questions/d2/topic-2.js'),'utf8');
const bank=new Function('Math','window',source+'\nreturn {moneyQ,divide:window.PAQuestionBanks.d2t2};')(math,{PAQuestionBanks:{}});
const q1=bank.moneyQ('D2.4.5',false,{mastery:15});q1.token='s1';q1.skill='D2.4.5';
const q2=bank.divide('D2.2.4',{mastery:15},false);q2.token='s2';q2.skill='D2.2.4';
const tags={};const collector=shadowCollector.createSession({originSkillId:'D2.4.5'},engine);profile.learnerReviewV1={schema:1,encounters:[],updatedAt:0};
for(const [q,outcome] of [[q1,'unresolved'],[q2,'independent']]){
 const begin=review.beginQuestion(q,{grade:2,mode:'practice',now:1000});
 check(!!begin.questionKey,'learner review produced a joinable questionKey');
 check(collector.capture(begin,q),'collector captured authored tags using exact review key');
 if(outcome==='unresolved')review.firstWrong(q,{tag:'division',now:1200});
 const e=review.resolve(q,{correct:outcome==='independent',usedHint:false,now:1500},profile);
 check(e?.outcome===outcome,'production-style learner review outcome recorded');
 tags[e.questionKey]=q.focusDiagnosticV1;
}
const keys=profile.learnerReviewV1.encounters.map(x=>x.questionKey);
const profileSnapshot=JSON.stringify(profile);
const joined=engine.fromReview(profile,tags,{originSkillId:'D2.4.5',questionKeys:keys});
check(joined.tagged===2&&joined.unmatched===0,'joined exactly two explicit tagged encounters');
const collected=collector.evaluate(profile);
check(collected.evidence.uniqueTaggedQuestions===2,'in-memory collector joined review and authored tags');
check(collector.stats().capturedQuestionKeys===2,'collector capture count before disposal');
const shadow=engine.evaluate({originSkillId:'D2.4.5',profile,questionTagsByKey:tags,questionKeys:keys});
check(shadow.evidence.uniqueTaggedQuestions===2&&shadow.mode==='shadow_read_only','shadow consumed tagged production-shaped records');
check(profile.skills['D2.2.4'].mastery===44&&profile.skills['D2.4.5'].mastery===17,'mastery untouched');
const withoutScope=engine.evaluate({originSkillId:'D2.4.5',profile,questionTagsByKey:tags});
check(withoutScope.evidence.uniqueTaggedQuestions===0&&withoutScope.state==='insufficient_evidence','no whole-profile diagnosis without explicit question scope');
// Ledger rows written before learner-review 1.1.0 carry no tag of their own.
const legacyProfile=JSON.parse(JSON.stringify(profile));legacyProfile.learnerReviewV1.encounters.forEach(e=>delete e.focusDiagnosticV1);
const withoutTags=engine.evaluate({originSkillId:'D2.4.5',profile:legacyProfile,questionKeys:keys});
check(withoutTags.evidence.uniqueTaggedQuestions===0&&withoutTags.evidence.untaggedExcluded===2,'legacy observations cannot be guessed into tagged evidence');
const fromLedger=engine.evaluate({originSkillId:'D2.4.5',profile,questionKeys:keys});
check(fromLedger.evidence.uniqueTaggedQuestions===2,'learner-review 1.1.0 rows carry their own authored tag');
check(JSON.stringify(profile)===profileSnapshot,'shadow evaluator and adapter must not mutate any profile fields');
const badQuestion={skill:'D2.4.5',focusDiagnosticV1:{schema:'pa.focus.question-tag.v1',tagOrigin:'guessed',originSkillId:'D2.4.5',evidence:{questionFamilyKey:'d2-money-equal-share'}}};
check(collector.capture({questionKey:'not-authoritative'},badQuestion)===false,'guessed tags must never enter collector');
const copied=collector.stats();check(copied.rejected===1,'rejected attempt accounted for');
check(!collector.capture({questionKey:'mismatch',skillId:'D6.2.4'},q1),'review skill must match authored question provenance');
collector.close();check(collector.stats().capturedQuestionKeys===0&&collector.stats().closed,'collector erased all in-memory keys');
let closedError=false;try{collector.evaluate(profile)}catch(_){closedError=true}
check(closedError,'closed collector cannot evaluate');
console.log(JSON.stringify({status:'focus_v2_phase_c_shadow_pass',goldenFixtures:fixtures.cases.length,assertions:checks,adapter:'tagged learner-review join and in-memory collector passed',productionRouting:'verified by focus-v2-money-contrast-shadow-e2e.cjs',masteryMutation:false},null,2));
