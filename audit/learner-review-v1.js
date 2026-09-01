#!/usr/bin/env node
'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const review=require('../js/engine/learner-review-v1.js');
let checks=0;
function ok(value,message){assert.ok(value,message);checks++}
function equal(actual,expected,message){assert.deepStrictEqual(actual,expected,message);checks++}
function q(token,skill='D2.PV1000',extra={}){return {token,skill,prompt:`Soalan ${token}`,archetypeId:'test',representation:'symbolic',demand:'procedure',difficultyBand:2,...extra}}
function answer(db,question,{wrong=false,hint=false,correct=true,tag='place',seconds=5,now=1000}={}){
 review.beginQuestion(question,{grade:2,mode:'practice',now});
 if(wrong)review.firstWrong(question,{tag,value:'x',seconds,now:now+100});
 if(hint)review.hintUsed(question,2);
 return review.resolve(question,{correct,tag,seconds:seconds+1,usedHint:hint,hintLevel:hint?2:0,now:now+500},db);
}

// One logical question produces exactly one outcome.
{
 const db={};
 equal(answer(db,q(1)).outcome,'independent');
 equal(answer(db,q(2),{wrong:true}).outcome,'corrected');
 equal(answer(db,q(3),{wrong:true,hint:true}).outcome,'assisted');
 equal(answer(db,q(4),{wrong:true,correct:false}).outcome,'unresolved');
 equal(db.learnerReviewV1.encounters.length,4);
 const analysis=review.analyse(db.learnerReviewV1.encounters);equal([analysis.total,analysis.independent,analysis.corrected,analysis.assisted,analysis.unresolved],[4,1,1,1,1]);
}

// Duplicate/stale resolution cannot double count.
{
 const db={},question=q(8);review.beginQuestion(question,{grade:2,now:1});review.resolve(question,{correct:true,now:2},db);
 equal(review.resolve(question,{correct:true,now:3},db),null);equal(db.learnerReviewV1.encounters.length,1);
}

// Demo and DEV encounters are excluded.
{
 const db={},question=q(9);equal(review.beginQuestion(question,{demoMode:true}),null);equal(review.resolve(question,{correct:true},db),null);
 equal(review.beginQuestion(question,{devMode:true}),null);equal(review.resolve(question,{correct:true},db),null);ok(!db.learnerReviewV1,'shadow store was not created');
}

// Old saves are upgraded additively and authoritative fields remain untouched.
{
 const db={coins:44,xp:91,skills:{A:{mastery:72}},unrelated:{keep:true}};
 const before=JSON.stringify({coins:db.coins,xp:db.xp,skills:db.skills,unrelated:db.unrelated});answer(db,q(10));
 equal(JSON.stringify({coins:db.coins,xp:db.xp,skills:db.skills,unrelated:db.unrelated}),before);equal(db.learnerReviewV1.schema,1);
}

// Evidence gating: no behavioural label from one or two mistakes.
{
 const db={};for(let i=0;i<7;i++)answer(db,q(20+i),{wrong:i<2,correct:i>=2,seconds:.5,tag:'operation',now:2000+i});
 equal(review.analyse(review.encounters(db)).patterns.length,0);
 const report=review.parentSummary(db,{'D2.PV1000':{title:'Nilai tempat'}},{name:'Amin',grade:2});
 ok(!/banyak meneka|suka meneka/i.test(report.learningStyle),'does not accuse pupil of guessing without evidence');
}

// Fast-answering hypothesis needs at least 8 encounters and 3 fast difficult answers.
{
 const db={};for(let i=0;i<8;i++)answer(db,q(40+i),{wrong:i<3,correct:i>=3,seconds:i<3?.5:5,tag:'generic',now:3000+i});
 const pattern=review.analyse(review.encounters(db)).patterns.find(x=>x.id==='fast_answering');ok(pattern);equal(pattern.status,'emerging');
}

// Repeated misconception needs multiple distinct questions.
{
 const db={};for(let i=0;i<3;i++)answer(db,q(60+i),{wrong:true,correct:i!==2,seconds:5,tag:'fraction',now:4000+i});
 const pattern=review.analyse(review.encounters(db)).patterns.find(x=>x.id==='repeated_misconception');ok(pattern);equal(pattern.tag,'fraction');equal(pattern.status,'emerging');
}

// Assisted success is not reported as independent mastery.
{
 const db={};for(let i=0;i<6;i++)answer(db,q(80+i,'D2.ADD1000'),{wrong:true,hint:true,seconds:5,tag:'place',now:5000+i});
 const skills=review.skillReviews(review.encounters(db),{'D2.ADD1000':{title:'Tambah hingga 1,000'}});equal(skills[0].state,'developing');equal(skills[0].independent,0);
 const report=review.parentSummary(db,{'D2.ADD1000':{title:'Tambah hingga 1,000'}},{name:'Maya',grade:2});ok(report.ready);ok(report.learning.some(x=>/petunjuk/i.test(x)));ok(report.nextSteps.some(x=>/dicuba sendiri|tanpa bantuan/i.test(x)));ok(/belum semuanya dapat dibuat sendiri/i.test(report.scoreMeaning));
}

// Strong requires five varied, fully independent encounters.
{
 const db={};for(let i=0;i<5;i++)answer(db,q(100+i,'D2.PV1000',{representation:i%2?'visual':'symbolic'}),{now:6000+i});
 const skill=review.skillReviews(review.encounters(db),{'D2.PV1000':{title:'Nilai tempat'}})[0];equal(skill.state,'strong');
 const report=review.parentSummary(db,{'D2.PV1000':{title:'Nilai tempat'}},{name:'Sara',grade:2});ok(report.strengths.some(x=>/Nilai tempat/.test(x)));ok(/dalam sesi semasa/.test(report.strengths[0]));ok(/dibuat sendiri pada percubaan pertama/i.test(report.scoreMeaning));
}

// Parent copy remains careful and non-technical.
{
 const db={};for(let i=0;i<6;i++)answer(db,q(120+i),{wrong:true,correct:false,tag:'place',seconds:6,now:7000+i});
 const report=review.parentSummary(db,{'D2.PV1000':{title:'Nilai tempat'}},{name:'Ali',grade:2});
 const copy=JSON.stringify(report);for(const banned of ['confidence','hypothesis','misconception','telemetry','accuracy'])ok(!copy.toLowerCase().includes(banned),`parent API hides ${banned}`);
 ok(!/tidak fokus|malas|lemah akal/i.test(copy),'no character judgement');
}

// Store is bounded.
{
 const db={learnerReviewV1:{schema:1,encounters:Array.from({length:600},(_,i)=>({outcome:'independent',grade:2,skillId:'A',questionKey:String(i)})),updatedAt:0}};
 answer(db,q(999));equal(db.learnerReviewV1.encounters.length,600);equal(db.learnerReviewV1.encounters.at(-1).token,'999');
}

// Runtime wiring and isolation guards.
{
 const root=path.resolve(__dirname,'..'),app=fs.readFileSync(path.join(root,'js/app.js'),'utf8'),battle=fs.readFileSync(path.join(root,'js/battle.js'),'utf8'),parent=fs.readFileSync(path.join(root,'js/parent.js'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 ok(app.includes('PALearnerReview?.beginQuestion'));ok(battle.includes('PALearnerReview?.firstWrong'));ok(battle.includes('PALearnerReview?.hintUsed'));ok(battle.includes('PALearnerReview?.resolve'));
 ok(parent.includes('PALearnerReview?.parentSummary'));ok(html.includes('learner-review-v1.js?v=3.57.0'));ok(html.includes('learner-review-v1.css?v=3.57.0'));ok(sw.includes("'./css/learner-review-v1.css','./js/engine/learner-review-v1.js'"));
 const moduleSource=fs.readFileSync(path.join(root,'js/engine/learner-review-v1.js'),'utf8');
 for(const forbidden of ['addCoins(','updateFrontier(','scheduleConfirmation(','mastery=','coreFrontier','completedMissions','chapterStars'])ok(!moduleSource.includes(forbidden),`shadow module excludes ${forbidden}`);
}

console.log(`learner-review-v1: ${checks} checks passed`);
