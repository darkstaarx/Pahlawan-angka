const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync('questions/kssr-year6-space-data-v3.23.0.js','utf8');

global.window=global;
let __seed=2300;Math.random=()=>{__seed=(__seed*1664525+1013904223)>>>0;return __seed/4294967296};
global.document={documentElement:{setAttribute(){}},querySelector(){return null}};
global.sess={questionHistory:[]};
global.R=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
global.pick=a=>a[R(0,a.length-1)];
global.N=(v,tag)=>({v,tag,label:v});
function key(v){return String(v).replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim().toLowerCase()}
global.Q=(prompt,answer,wrong,hint,kind='Adaptive',diagnostic=false,formatShift=false)=>{
  const seen=new Set([key(answer)]),out=[];
  for(const x of wrong||[]){if(x&&!seen.has(key(x.v))){seen.add(key(x.v));out.push(x)}}
  let i=1;while(out.length<3){const v=typeof answer==='number'?answer+i*17:`pilihan tambahan ${i++}`;if(!seen.has(key(v))){seen.add(key(v));out.push(N(v,'generated'))}}
  return {prompt,answer,wrong:out.slice(0,3),hint,kind,diagnostic,formatShift};
};

const initialSkills=[
 {id:'D5.AREA',grade:5,chapter:'7',domain:'Ruang',title:'Luas',prereq:[],role:'core'},
 {id:'D5.DATA',grade:5,chapter:'8',domain:'Data',title:'Data',prereq:[],role:'core'},
 {id:'D5.COORD',grade:5,chapter:'7',domain:'Ruang',title:'Koordinat',prereq:[],role:'core'},
 {id:'D6.AREA',grade:6,chapter:'7',domain:'Ruang',title:'Luas, perimeter dan isipadu',prereq:['D5.AREA'],role:'core'},
 {id:'D6.COORD',grade:6,chapter:'7',domain:'Ruang',title:'Koordinat dan arah',prereq:['D5.COORD'],role:'core'},
 {id:'D6.DATA',grade:6,chapter:'8',domain:'Data',title:'Data dan kebarangkalian mudah',prereq:['D5.DATA'],role:'core'},
 {id:'D6.PROB',grade:6,chapter:'8',domain:'Kebolehjadian',title:'Kebolehjadian',prereq:['D5.DATA'],role:'core'}
];
global.GRAPH={skills:initialSkills.map(x=>({...x})),recovery_map:{'D6.AREA':['D5.AREA'],'D6.DATA':['D5.DATA'],'D6.PROB':['D5.DATA']},stretch_map:{'D5.AREA':'D6.AREA','D5.DATA':'D6.DATA','D5.COORD':'D6.COORD'}};
global.META=Object.fromEntries(GRAPH.skills.map(x=>[x.id,x]));
global.REC=GRAPH.recovery_map;global.STR=GRAPH.stretch_map;

global.db={schoolGrade:6,skills:{
 'D5.AREA':{mastery:80,evidence:8,competencies:{}},'D5.DATA':{mastery:80,evidence:8,competencies:{}},'D5.COORD':{mastery:80,evidence:8,competencies:{}},
 'D6.AREA':{mastery:72,evidence:8,competencies:{}},'D6.DATA':{mastery:68,evidence:7,competencies:{}},'D6.PROB':{mastery:20,evidence:1,competencies:{}},'D6.COORD':{mastery:20,evidence:1,competencies:{}}
}};
global.initSkill=id=>{db.skills[id]={mastery:18,confidence:8,evidence:0,correct:0,wrong:0,hints:0,mis:{},lastSeen:0,stability:0,probePass:0,probeFail:0,competencies:{}}};
global.save=()=>{};global.scoreState=id=>db.skills[id];

global.PAMasteryKB={profiles:Object.fromEntries(initialSkills.map(x=>[x.id,{id:x.id,evidence:{requiredClean:3,requiredRepresentations:2}}])),labels:{}};
global.masteryProfile=id=>PAMasteryKB.profiles[id]||null;
global.masteryMisconceptionLabel=tag=>tag;
global.masteryEvidenceDecision=(id,h=[])=>({status:h.length?'developing':'unproven',secure:false,reasons:[],clean:h.filter(x=>x.ok&&!x.hint).length,formats:0,transfer:false});
const integrityReq={};
function requirementStatus(id,bucket){const groups=integrityReq[id];if(!groups)return{ok:true,missing:[]};const missing=[];for(const g of groups){if(!g.some(m=>Number(bucket?.[m]?.clean||0)>0))missing.push(g)}return{ok:!missing.length,missing}}
global.PAContentIntegrity={requirements:integrityReq,requirementStatus};
global.PAKSSRDepth={contractStatus:{'D6.AREA':'depth-v3.22.0','D6.DATA':'depth-v3.22.0','D6.PROB':'integrity-v3.18.1','D6.COORD':'depth-v3.22.0'}};
global.PAQuestionBanks={d6:(id)=>Q(`fallback ${id}`,1,[N(2,'x'),N(3,'x'),N(4,'x')],'fallback','fallback')};

vm.runInThisContext(src,{filename:'kssr-year6-space-data-v3.23.0.js'});

const ids=GRAPH.skills.map(x=>x.id);
for(const retired of ['D6.AREA','D6.DATA']){assert(!ids.includes(retired),`${retired} remained in graph`);assert(!META[retired],`${retired} remained in META`)}
for(const id of ['D6.ANGLE','D6.CIRCLE','D6.SPACE_PROBLEM','D6.PIE','D6.PROB','D6.DATA_PROBLEM','D6.COORD'])assert(META[id],`missing ${id}`);
assert.equal(META['D6.COORD'].domain,'Koordinat');assert.equal(META['D6.COORD'].textbookUnit,7);
assert.equal(META['D6.ANGLE'].textbookUnit,6);assert.equal(META['D6.PIE'].textbookUnit,8);assert.equal(META['D6.PROB'].textbookUnit,8);
assert.deepEqual(META['D6.ANGLE'].kssrStandards,['6.1.1','6.1.2']);assert.deepEqual(META['D6.PIE'].kssrStandards,['8.1.1']);assert.deepEqual(META['D6.PROB'].kssrStandards,['8.2.1','8.2.2']);
assert.equal(STR['D5.AREA'],'D6.ANGLE');assert.equal(STR['D5.DATA'],'D6.PIE');assert.equal(STR['D5.COORD'],'D6.COORD');
assert(db.legacySkills['D6.AREA']&&db.legacySkills['D6.DATA'],'retired learner evidence not archived');
assert.equal(db.skills['D6.ANGLE'].evidence,0,'legacy AREA evidence leaked into new angle skill');assert.equal(db.skills['D6.PIE'].evidence,0,'legacy DATA evidence leaked into new pie skill');
assert(!PAKSSRDepth.contractStatus['D6.AREA']&&!PAKSSRDepth.contractStatus['D6.DATA']);
for(const id of ['D6.ANGLE','D6.CIRCLE','D6.SPACE_PROBLEM','D6.PIE','D6.PROB','D6.DATA_PROBLEM','D6.COORD'])assert(PAKSSRDepth.contractStatus[id],`contract status missing ${id}`);

const requiredModes={
 'D6.ANGLE':['polygon_regular_measure','angle_construct_identify','angle_measure_protractor'],
 'D6.CIRCLE':['circle_parts','circle_draw_radius','radius_diameter'],
 'D6.SPACE_PROBLEM':['space_problem_angle','space_problem_circle'],
 'D6.PIE':['pie_complete_angle','pie_complete_quantity','pie_interpret'],
 'D6.PROB':['chance_possible_reason','chance_scale_reason'],
 'D6.DATA_PROBLEM':['data_problem_pie','data_problem_chance']
};
let samples=0,visual=0,reasoning=0,application=0;
for(const [id,modes] of Object.entries(requiredModes)){
  const seen=new Set();
  sess.questionHistory=[];
  for(let i=0;i<400;i++){
    const q=PAQuestionBanks.d6(id,{mastery:75,evidence:8,confidence:75},i>200);
    assert(q&&q.answer!==undefined&&q.answer!==null,`${id} missing answer`);
    assert(Array.isArray(q.wrong)&&q.wrong.length===3,`${id} wrong count`);
    assert.equal(new Set([key(q.answer),...q.wrong.map(x=>key(x.v))]).size,4,`${id} duplicate choices`);
    assert(q.archetypeId?.startsWith('y6gap_'),`${id} missing archetype metadata`);
    seen.add(q.competencyId);samples++;
    if(/y6kDiagram/.test(q.prompt))visual++;
    if(q.demand==='reasoning')reasoning++;if(q.demand==='application')application++;
    if(id==='D6.PROB'){
      assert(!/^\s*\d+\s*\/\s*\d+\s*$/.test(String(q.answer)),'numeric fractional probability answer leaked');
      assert(!/pecahan kebarangkalian|\b7\/8\b/.test(`${q.prompt} ${q.hint}`.toLowerCase()),'numeric probability wording leaked');
    }
    if(id==='D6.ANGLE'){
      const degrees=[...String(q.prompt).matchAll(/(\d+(?:\.\d+)?)°/g)].map(m=>Number(m[1]));
      assert(degrees.every(d=>d<=180),'angle prompt exceeded 180 degrees');
    }
    sess.questionHistory.push({skillId:id,archetypeId:q.archetypeId});if(sess.questionHistory.length>8)sess.questionHistory.shift();
  }
  for(const mode of modes)assert(seen.has(mode),`${id} did not generate ${mode}`);
}

// Mandatory competency proof must block secure mastery until every required group is independently evidenced.
const angleId='D6.ANGLE';
db.skills[angleId].competencies={polygon_regular_measure:{clean:1},angle_measure_protractor:{clean:1}};
let h=[
 {ok:true,hint:false,format:'visual|procedure|a'},
 {ok:true,hint:false,format:'visual|application|b'},
 {ok:true,hint:false,format:'symbolic|reasoning|c'}
];
let decision=masteryEvidenceDecision(angleId,h);assert(!decision.secure,'angle mastery secured without construction evidence');
db.skills[angleId].competencies.angle_construct_identify={clean:1};
decision=masteryEvidenceDecision(angleId,h);assert(decision.secure,'angle mastery did not secure after all requirements');

console.log(`PASS v3.23.0 runtime: samples=${samples}, visual=${visual}, reasoning=${reasoning}, application=${application}`);
console.log(`PASS graph migration: retired=2, added=5, corrected D6.COORD, qualitative D6.PROB`);
