global.window=global;
global.sess={questionHistory:[]};
global.document={querySelector:()=>null,documentElement:{dataset:{}}};
function R(a,b){return Math.floor(Math.random()*(b-a+1))+a} global.R=R;
function pick(a){return a[R(0,a.length-1)]} global.pick=pick;
function shuffle(a){return [...a].sort(()=>Math.random()-.5)} global.shuffle=shuffle;
function N(v,tag){return {v,tag,label:v}} global.N=N;
function tidyNumber(v,maxDp=2){return typeof v==='number'?Number(v.toFixed(maxDp)):v} global.tidyNumber=tidyNumber;
function moneyFmtUpper(v){return `RM${Number(v).toFixed(2).replace(/\.00$/,'')}`} global.moneyFmtUpper=moneyFmtUpper;
function semantic(v){return String(v).trim().toLowerCase()}
function Q(prompt,answer,wrong,hint,kind,diagnostic,formatShift){
  const seen=new Set([semantic(answer)]), out=[];
  for(const x of wrong||[]){const k=semantic(x.label??x.v);if(!seen.has(k)){seen.add(k);out.push(x)}}
  let d=1;while(out.length<3){let v=typeof answer==='number'?answer+d:String(answer)+'?'+d;d++;let k=semantic(v);if(!seen.has(k)){seen.add(k);out.push(N(v,'generated'))}}
  return {prompt,answer,wrong:out.slice(0,3),hint,kind,diagnostic,formatShift};
} global.Q=Q;
function addDistractors(a,b,ans){return [N(ans+10,'same_end'),N((a%10)+(b%10),'units_only'),N(Math.max(0,ans-10),'place')]} global.addDistractors=addDistractors;
for(const name of ['fractionVisual','dotsEstimateVisual','clockSvg','timelineSvg','rulerSvg','scaleSvg','cylinderSvg','tallyTable','barChart','shapeSvg','coordGrid'])global[name]=()=>'';
function moneyQ(id,shift,s){return Q('money', 'RM10',[N('RM5','money'),N('RM15','money'),N('RM20','money')],'hint','money',true,shift)} global.moneyQ=moneyQ;
const states={}; function scoreState(id){return states[id]||(states[id]={correct:0,wrong:0,evidence:0,mastery:80,confidence:80,hints:0,mis:{}})} global.scoreState=scoreState;
global.recordFrontierResponse=function(){};
global.masteryEvidenceDecision=function(id,h){return {status:'secure',secure:true,provisional:false,reasons:[],clean:h.length}};
global.powerLevel=function(){return 3};
global.lessonSpecFor=function(id){return {title:id}};
// Stubs used to verify progression gating wrappers.
global.db={schoolGrade:2,coreFrontier:2};
global.CFG={unlock_mastery:70,min_evidence_unlock:3,stretch_min_evidence:3,stretch_trigger_mastery:70,stretch_trigger_confidence:60};
global.coreGrade=()=>2;global.totalChapters=()=>3;global.gradeLabel=g=>`Darjah ${g}`;global.log=()=>{};
global.coreChapterSkills=()=>[{id:'D2.2.1'},{id:'D2.2.2'}];
global.chapterScore=()=>90;global.chapterEvidence=()=>10;
global.updateFrontier=function(){db.coreFrontier++};
global.canStretch=function(){return true};
const skillIds=['D1.N20','D1.ADD20','D1.SUB20','D2.1.5','D2.2.1','D2.2.2','D2.2.3','D2.2.4','D2.2.5','D2.4.1','D2.4.2','D2.4.3','D2.4.4','D2.4.5','D2.4.6','D2.4.7','D2.5.1','D2.5.2','D2.5.3','D2.6.1','D2.6.2','D2.6.3','D2.6.4','D2.8.1','D2.8.2','D2.8.3','D3.SHAPE','D4.FRAC','D4.PERIM','D4.DATA','D4.RATIO','D4.RATE','D5.MUL','D5.DIV','D5.OPS','D5.FRAC','D5.DEC','D5.MONEY','D5.AREA','D5.DATA','D5.RATIO','D5.RATE','D6.NUMBERS','D6.OPS','D6.FRAC','D6.RATIO','D6.MONEY','D6.TIME','D6.AREA','D6.COORD','D6.DATA','D6.PROB'];
global.GRAPH={skills:skillIds.map(id=>({id})),recovery_map:{},stretch_map:{}};
global.PAQuestionBanks={};
for(const k of ['d1','d2t1','d2t2','d2t3','d2t4','d2t5','d2t6','d2t7','d2t8','d3','d4','d5','d6'])PAQuestionBanks[k]=(id)=>Q('fallback',4,[N(3,'x'),N(5,'x'),N(6,'x')],'h','fallback',false,false);
require('../questions/kssr-content-integrity-v3.18.1.js');
function bankFor(id){if(id.startsWith('D1.'))return PAQuestionBanks.d1;if(id.startsWith('D2.'))return PAQuestionBanks['d2t'+id.split('.')[1]];if(id.startsWith('D3.'))return PAQuestionBanks.d3;if(id.startsWith('D4.'))return PAQuestionBanks.d4;if(id.startsWith('D5.'))return PAQuestionBanks.d5;return PAQuestionBanks.d6}
let failures=[];
for(const id of skillIds){
  for(let i=0;i<80;i++){
    const q=bankFor(id)(id,{evidence:i<3?0:5,mastery:60},false);
    if(!q||q.answer===undefined||!q.competencyId){failures.push(`${id}: missing repaired question`);break}
    const all=[q.answer,...q.wrong.map(x=>x.v)];if(new Set(all.map(semantic)).size!==4){failures.push(`${id}: duplicate choices`);break}
    sess.questionHistory.push({skillId:id,archetypeId:q.archetypeId}); if(sess.questionHistory.length>80)sess.questionHistory.shift();
    if(id==='D1.ADD20' && typeof q.answer==='number' && q.answer>20) failures.push('D1.ADD20 >20');
    if(id==='D1.SUB20' && typeof q.answer==='number' && q.answer>20) failures.push('D1.SUB20 >20');
    if(id==='D6.NUMBERS'){
      const nums=(String(q.prompt).match(/\d+/g)||[]).map(Number).filter(n=>n>0);
      if(nums.length && Math.max(...nums)<100000) failures.push('D6.NUMBERS too small');
    }
    if(id==='D6.FRAC'&&q.competencyId==='fraction_compare'&&q.answer==='Sama') failures.push('D6.FRAC compare tie');
    if(id.endsWith('RATIO')&&q.competencyId==='ratio_simplify'){
      const m=String(q.answer).match(/^(\d+):(\d+)$/); if(m && (function(a,b){while(b){let t=b;b=a%b;a=t}return a})(+m[1],+m[2])!==1) failures.push(`${id}: ratio not simplest`);
    }
  }
}

// Progression integrity: strong raw mastery must not unlock before required clean competency proof.
db.coreFrontier=2;updateFrontier();if(db.coreFrontier!==2)failures.push('frontier unlocked without competency proof');
if(canStretch('D2.2.1'))failures.push('stretch allowed without competency proof');
const req=PAContentIntegrity.requirements;
for(const id of ['D2.2.1','D2.2.2']){
  const bucket=scoreState(id).competencies||(scoreState(id).competencies={});
  for(const group of req[id]){const mode=group[0];bucket[mode]={attempts:1,correct:1,clean:1};}
}
updateFrontier();if(db.coreFrontier!==3)failures.push('frontier stayed locked after competency proof');
if(!canStretch('D2.2.1'))failures.push('stretch stayed blocked after competency proof');
// Requirement semantics: D2 three-number addition and D6 number coverage are genuinely mandatory.
if(PAContentIntegrity.requirementStatus('D2.2.1',{add_two:{clean:1}}).ok)failures.push('D2.2.1 accepted without add_three');
if(PAContentIntegrity.requirementStatus('D6.NUMBERS',{large_sequence:{clean:1}}).ok)failures.push('D6.NUMBERS accepted without compare/round');
const result={version:PAContentIntegrity.version,skills:skillIds.length,samples:skillIds.length*80,failures:[...new Set(failures)],frontier_gate:true,stretch_gate:true,recovery:GRAPH.recovery_map,stretch:GRAPH.stretch_map};
console.log(JSON.stringify(result,null,2));
process.exit(failures.length?1:0);
