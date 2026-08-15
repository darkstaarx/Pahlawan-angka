const fs=require('fs'),vm=require('vm'),assert=require('assert');
const code=fs.readFileSync('js/daily-spaced-review-v3.20.0.js','utf8');
class ClassList{constructor(){this.s=new Set()}add(...xs){xs.forEach(x=>this.s.add(x))}remove(...xs){xs.forEach(x=>this.s.delete(x))}toggle(x,on){if(on===undefined)on=!this.s.has(x);on?this.s.add(x):this.s.delete(x);return on}contains(x){return this.s.has(x)}}
class El{constructor(){this.textContent='';this.style={};this.classList=new ClassList();this.children=[];this.attrs={};this.tabIndex=0;this.innerHTML='';}setAttribute(k,v){this.attrs[k]=v}appendChild(e){this.children.push(e);return e}querySelector(sel){if(sel==='.grow')return this.grow||null;if(sel==='.paDailyMeta')return this.children.find(x=>x.classList.contains('paDailyMeta'))||null;return null}querySelectorAll(){return []}}
const els={};for(const id of ['dailyText','dailyFill','dailyReward','missionTitle','missionCount','missionProgressFill','coachMode','evidence','mastery','resultTitle','resultStars','resultScore','resultRewards','resultCoach'])els[id]=new El();
const version=new El(),dailyCard=new El();dailyCard.grow=new El();const result=new El();result.querySelectorAll=()=>[new El(),new El()];
const document={documentElement:{dataset:{}},querySelector(sel){if(sel==='.loginVersion')return version;if(sel==='.hubDailyCompact')return dailyCard;return null},getElementById(id){if(id==='result')return result;return els[id]||null},createElement(){return new El()}};
const now=Date.now(),states={
 S1:{mastery:82,confidence:72,evidence:7,stability:48,correct:6,wrong:1,hints:0,mis:{},lastSeen:now-8*86400000,competencies:{core:{clean:1}}},
 S2:{mastery:46,confidence:40,evidence:5,stability:28,correct:2,wrong:3,hints:1,mis:{place:3},lastSeen:now-2*86400000,competencies:{core:{clean:0}}},
 S3:{mastery:91,confidence:88,evidence:8,stability:86,correct:8,wrong:0,hints:0,mis:{},lastSeen:now-1*86400000,competencies:{core:{clean:1}}},
 S4:{mastery:68,confidence:58,evidence:4,stability:42,correct:3,wrong:1,hints:1,mis:{},lastSeen:now-3*86400000,competencies:{core:{clean:0}}},
 S5:{mastery:20,confidence:15,evidence:0,stability:5,correct:0,wrong:0,hints:0,mis:{},lastSeen:0,competencies:{}},
 LOCKED:{mastery:10,confidence:10,evidence:0,stability:0,correct:0,wrong:0,hints:0,mis:{},lastSeen:0,competencies:{}}
};
const META={S1:{id:'S1',title:'Skill 1',grade:2,chapter:1},S2:{id:'S2',title:'Skill 2',grade:2,chapter:1},S3:{id:'S3',title:'Skill 3',grade:2,chapter:2},S4:{id:'S4',title:'Parent Skill',grade:2,chapter:2},S5:{id:'S5',title:'New Skill',grade:2,chapter:2},LOCKED:{id:'LOCKED',title:'Locked',grade:2,chapter:3}};
const GRAPH={skills:Object.values(META)};const db={schoolGrade:2,coreFrontier:2,focus:'S4',skills:states,coins:0,daily:{date:'legacy',correct:0,claimed:false}};
let sess={dailyQuest:false},screens=[],coins=0,nextCalls=0,missionCalls=0,coachCalls=0;
const PROGRESSION={dailyTarget:15,coinPerCorrect:1,streakEvery:5,xpPerCorrect:12,xpPerWrong:0,streakCoinBonus:5};
const ctx={console,document,Date,Math,window:null,db,META,GRAPH,PROGRESSION,sess,scoreState:id=>states[id],coreGrade:()=>2,
 PAContentIntegrity:{requirements:{S2:[['core']],S4:[['core']]},requirementStatus:(id,b)=>({ok:Number(b?.core?.clean||0)>0})},
 confirmationSkill:()=>null,enforceRestuLock:()=>false,ensureProgression:()=>{},applyHeroToBattle:()=>{},battle:()=>{},save:()=>{},showRewardToast:()=>{},
 addCoins:n=>{coins+=n;db.coins+=n},screen:id=>{screens.push(id)},renderHub:()=>{},resultPrimary:()=>{},resultReplay:()=>{},updateMissionHud:()=>{},
 nextQ:()=>{nextCalls++},recordCoachResponse:()=>{coachCalls++},chooseModeAndSkill:()=>S1,
 recordMissionAnswer:(ok,id,hint)=>{missionCalls++;sess.missionAnswered=(sess.missionAnswered||0)+1;if(ok)sess.missionCorrect=(sess.missionCorrect||0)+1;if(hint)sess.missionHints=(sess.missionHints||0)+1;},
 setTimeout,clearTimeout};ctx.window=ctx;
vm.runInNewContext(code,ctx,{filename:'daily-spaced-review-v3.20.0.js'});
assert.equal(version.textContent,'Pahlawan Angka · v3.20.0');
assert.equal(ctx.PADailyQuest.target,8);
const plan=ctx.PADailyQuest.buildPlan(8,[]);assert.equal(plan.length,8,'plan must contain eight questions');
assert(!plan.some(x=>x.skill==='LOCKED'),'locked future chapter leaked into daily plan');
for(let i=1;i<plan.length;i++)assert.notEqual(plan[i].skill,plan[i-1].skill,'planner repeated same skill immediately');
const focusCount=plan.filter(x=>x.skill==='S4').length;assert(focusCount>=1&&focusCount<=3,'parent focus must be represented but capped');
assert.equal(ctx.PADailyQuest.priority('S4').reason,'Fokus Ibu Bapa');
ctx.recordCoachResponse('S2',false,'place',4,false,'q1');assert.equal(coachCalls,1);assert(states.S2.lastSeen>now,'practice timestamp not recorded');assert(db.spacedReview.skills.S2.lastWrong>0,'wrong evidence not persisted');
ctx.startDailyQuest();sess=ctx.sess;assert(sess.dailyQuest,'daily session not started');assert.equal(sess.dailyTarget,8);assert(screens.includes('game'),'daily session did not enter game');
for(let i=0;i<8;i++){ctx.recordMissionAnswer(i!==2,plan[i]?.skill||'S1',i===4);}
assert.equal(db.dailyQuestV2.attempts.length,8);assert(sess.dailyQuestCompletePending,'completion was not queued after question 8');
ctx.nextQ();assert.equal(db.dailyQuestV2.status,'complete','daily quest did not finish');assert.equal(coins,15,'completion reward must be exactly once');assert(screens.includes('result'),'daily result screen missing');
ctx.PADailyQuest.finish();assert.equal(coins,15,'daily completion reward duplicated');
console.log('PASS Daily Quest + Spaced Review v3.20.0 runtime integration');
