#!/usr/bin/env node
'use strict';
// Baseline two-session audit retained as a before/after record. The separate
// money-two-session-pilot now covers the requested addition contrast in shadow.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const review=require(path.join(root,'js/engine/learner-review-v1.js'));
const diagnosis=require(path.join(root,'js/engine/focus-diagnosis-v2.js'));
const collectorApi=require(path.join(root,'js/engine/focus-diagnosis-shadow-v1.js'));
const focusSource=fs.readFileSync(path.join(root,'js/guardian-focus.js'),'utf8');
const focusFunctionSource=focusSource.slice(0,focusSource.indexOf('let focusPickerProfile'));
const focusSummaryFactory=new Function('GRAPH','questionBankFor',`${focusFunctionSource}; return focusPracticeSummary;`);
const GRAPH={skills:[{id:'D2.4.2',grade:2,chapter:'4',title:'Tambah wang'}]};
const focusPracticeSummary=focusSummaryFactory(GRAPH,id=>id==='D2.4.2'?()=>{}:null);
let seed=53108;const math=Object.create(Math);math.random=()=>((seed=Math.imul(1664525,seed)+1013904223|0)>>>0)/4294967296;
const qctx={Math:math,window:{PAQuestionBanks:{}}};vm.createContext(qctx);
for(const file of ['questions/helpers.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),qctx,{filename:file});
const profile={name:'Profil ujian sementara',schoolGrade:2,skills:{'D2.4.2':{mastery:52}},xp:100,coins:55};
const before=JSON.stringify({skills:profile.skills,xp:profile.xp,coins:profile.coins});
const firstSession=[];
for(let i=0;i<5;i++){
 const q=qctx.moneyQ('D2.4.2',false,{mastery:20,evidence:i});q.skill='D2.4.2';q.token='session1-'+i;
 const begun=review.beginQuestion(q,{grade:2,mode:'kembara',now:1000+i*2000});
 review.firstWrong(q,{tag:'money',now:1100+i*2000});
 const row=review.resolve(q,{correct:false,seconds:8,now:1500+i*2000},profile);
 firstSession.push({skillId:row.skillId,questionKey:row.questionKey,outcome:row.outcome,tagged:!!q.focusDiagnosticV1});
}
const focus=focusPracticeSummary(profile);
const parent=review.parentSummary(profile,{'D2.4.2':{title:'Tambah Wang'}},{name:'Aina',grade:2});
assert.equal(focus.items[0]?.id,'D2.4.2','normal Kembara should raise the weak money skill after five encounters/two distinct questions');
assert.equal(firstSession.filter(x=>x.outcome==='unresolved').length,5);

// Replay the two manually played Gerai BAYAR TEPAT rounds into the same
// PALearnerReview shape used by the live bridge: first corrected, then independent.
const miniGameSession=[];
for(let i=0;i<2;i++){
 const q={skill:'D2.4.2',token:'session2-gerai-'+i,questionId:'wirayung:money-basic-'+i,archetypeId:'wirayung_bayar',prompt:`Gerai Wirayung semakan wang ${i+1}`,answer:'ok'};
 const begun=review.beginQuestion(q,{grade:2,mode:'practice',selectionReason:'wirayung',now:20000+i*2000});
 if(i===0)review.firstWrong(q,{tag:'wirayung_bayar',seconds:2,now:20100});
 miniGameSession.push(review.resolve(q,{correct:true,seconds:8,now:20500+i*2000},profile));
}
const parentAfterCurrentMiniGame=review.parentSummary(profile,{'D2.4.2':{title:'Tambah Wang'}},{name:'Aina',grade:2});
const focusAfterCurrentMiniGame=focusPracticeSummary(profile);

// The separate live shadow panel's existing money scenario was exercised in the browser:
// it is still the D2.4.5 division pilot, not a matched addition probe.
const availableShadowProbe={
 source:'browser: Simulate: money context issue',
 originSkillId:'D2.4.5',
 observed:{uniqueTaggedQuestions:7,money:{independent:0,nonindependent:2},plainDivision:{independent:2,nonindependent:0},grouping:{independent:1,nonindependent:0},regroupDivision:{independent:2,nonindependent:0}},
 diagnosis:{state:'needs_contrast',rootCause:null,nextProbe:'money.ringgit_sen',confidence:'low',reasonCode:'MONEY_CONTEXT_VS_DIVISION_CONTRAST'},
 parentSummaryAfterProbe:'Belum ada rumusan punca operasi yang dipautkan kepada laporan parent.'
};
assert.equal(availableShadowProbe.diagnosis.rootCause,null);
assert.equal(availableShadowProbe.diagnosis.nextProbe,'money.ringgit_sen');
assert.equal(JSON.stringify({skills:profile.skills,xp:profile.xp,coins:profile.coins}),before,'diagnosis must not mutate mastery/rewards');
const result={
 status:'two_session_money_baseline_before_pilot',
 session1:{name:'Kembara Wang normal',encounters:firstSession.length,distinctQuestions:new Set(firstSession.map(x=>x.questionKey)).size,focusCard:focus.items[0],parentSummary:{ready:parent.ready,learning:parent.learning,headline:parent.headline}},
 session2:{name:'Mini-game Gerai Wirayung · BAYAR TEPAT',manualBrowserRounds:[{order:'Kuih Lapis RM1.90',firstAttempt:'salah item dan RM1.50',final:'RM1.90',outcome:'corrected',stars:1},{order:'Ramuan Wira RM1.50',firstAttempt:'betul',final:'RM1.50',outcome:'independent',stars:3}],recordsSentToApp:'none; opened as a standalone game page without the production parent bridge',bridgeReplay:{recordedUnderSkill:'D2.4.2',focusCardAfter:focusAfterCurrentMiniGame.items[0]?.id||null,parentSummaryAfter:parentAfterCurrentMiniGame.learning}},
 availableShadowProbe,
 requestedScenario:'Wang asas berjaya; operasi tambah nombor besar gagal; final Focus should move to tambah/nilai tempat.',
 requestedScenarioStatus:'BASELINE_NOT_TESTABLE; NOW_COVERED_BY_SHADOW_PILOT',
 reason:'This baseline was captured before authored tags were added to D2.4.2/D2.4.1. The separate focus-v2-money-two-session-pilot.cjs now tests the requested pattern with actual question generators, but live production routing/report integration remains disconnected.',
 currentParentText:{afterKembara:parent.learning,afterGeraiBridgeReplay:parentAfterCurrentMiniGame.learning},
 desiredParentText:'Pada awalnya, latihan menunjukkan Wang mencabar. Ujian susulan mendapati asas Wang boleh dibuat sendiri, tetapi tambah nombor besar masih mengelirukan. Fokus seterusnya ialah nilai tempat dan tambah nombor besar.',
 profileMasteryXpCoinsUnchanged:true,
 productionIntegration:'NO-GO: diagnosis remains shadow-only; no live Focus route/report update.',
 followupPilot:'audit/focus-v2-e2e/two-session-money-pilot.json'
};
fs.writeFileSync(path.join(root,'audit/focus-v2-e2e/two-session-money-current.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
