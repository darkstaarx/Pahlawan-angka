const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync('js/engine/adaptive.js','utf8');
assert(!src.includes('BOSS_STRETCH_D3_BY_CHAPTER'),'boss stretch must not be hard-coded to Year 3');
assert(src.includes("x.grade===targetGrade&&String(x.chapter)===chapter"),'boss stretch must target same chapter at +1 grade');
assert(src.includes("if(coreGrade()>=6)return null"),'Year 6 must not stretch beyond curriculum');

const ctx={
 console,Math,
 db:{schoolGrade:1,coreFrontier:1,skills:{}},
 GRAPH:{skills:[]},
 META:{},
 CFG:{anti_repeat_window:3,unlock_mastery:70,min_evidence_unlock:2,stretch_min_evidence:5,stretch_trigger_mastery:85,stretch_trigger_confidence:70,recovery_trigger_mastery:35,recovery_trigger_confidence:35,parent_focus_boost:1},
 PROGRESSION:{regularMissionQuestions:9,missionBoost:1},
 REC:{},STR:{},
 sess:{missionChapter:'1',missionAnswered:9,bossDefeated:false,bossStretchAsked:false,bossQuestionsAnswered:4,recent:[],coachAdaptive:false,devBankTest:false},
 log(){},gradeLabel(n){return'Darjah '+n},
 confirmationSkill(){return null},chooseCoachFrontierSkill(){return null},
 window:{}
};
for(let grade=1;grade<=6;grade++){
 for(let chapter=1;chapter<=8;chapter++){
  const id=`D${grade}.CH${chapter}`;
  ctx.GRAPH.skills.push({id,grade,chapter:String(chapter)});
  ctx.META[id]={grade,chapter:String(chapter),prereq:[]};
  ctx.db.skills[id]={evidence:grade===2&&chapter===1?0:1,mastery:70,confidence:70,wrong:0,probeFail:0,probePass:0,lastSeen:0};
 }
}
// Add the exact Year 3 place-value skill that exposed the bug.
ctx.GRAPH.skills.push({id:'D3.PV10000',grade:3,chapter:'1'});
ctx.META['D3.PV10000']={grade:3,chapter:'1',prereq:[]};
ctx.db.skills['D3.PV10000']={evidence:0,mastery:0,confidence:0,wrong:0,probeFail:0,probePass:0,lastSeen:0};

vm.createContext(ctx);vm.runInContext(src,ctx,{filename:'adaptive.js'});
for(let grade=1;grade<=5;grade++){
 ctx.db.schoolGrade=grade;
 for(let chapter=1;chapter<=8;chapter++){
  for(let i=0;i<80;i++){
   const id=ctx.chooseBossStretchSkill(String(chapter));
   assert(id,'grade '+grade+' chapter '+chapter+' needs +1 boss stretch candidate');
   assert.equal(ctx.META[id].grade,grade+1,'boss stretch skipped grade for '+grade+' chapter '+chapter);
   assert.equal(String(ctx.META[id].chapter),String(chapter),'boss stretch left chapter '+chapter);
  }
 }
}
ctx.db.schoolGrade=1;
for(let i=0;i<120;i++)assert.notEqual(ctx.chooseBossStretchSkill('1'),'D3.PV10000','Year 1 boss must never jump to Year 3 place value');

ctx.sess={missionChapter:'1',missionAnswered:9,bossDefeated:false,bossStretchAsked:false,bossQuestionsAnswered:4,recent:[],coachAdaptive:false,devBankTest:false};
const d1Boss=ctx.chooseManualMissionSkill();
assert.equal(ctx.META[d1Boss].grade,2,'Year 1 boss Q5 must be a Year 2 stretch probe');
assert.equal(String(ctx.META[d1Boss].chapter),'1','Year 1 boss Q5 must remain in chapter 1');
assert.equal(ctx.sess.bossStretchCurrent,true,'boss stretch marker must be set');

ctx.db.schoolGrade=6;
assert.equal(ctx.chooseBossStretchSkill('1'),null,'Year 6 boss must not stretch beyond Year 6');
console.log('PASS boss stretch routing: D1→D2, D2→D3, D3→D4, D4→D5, D5→D6, D6→none');
