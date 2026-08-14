const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root=__dirname+'/..';
const context={console,window:null,document:{},Array,Math,Date,setTimeout,clearTimeout,setInterval,clearInterval};context.window=context;
vm.createContext(context);
for(const rel of ['data/kssr/knowledge-graph.js','lessons/d2/index.js','js/learning.js'])vm.runInContext(fs.readFileSync(root+'/'+rel,'utf8'),context,{filename:rel});

const graph=vm.runInContext('GRAPH',context),meta=vm.runInContext('META',context),bank=context.PALessonsD2;
const d2=graph.skills.filter(x=>x.grade===2);
assert.equal(d2.length,37,'expected 37 D2 skills');
const reports=[];
for(const skill of d2){
  const key=context.conceptKeyFor(skill.id,'generic'),spec=bank[skill.id];
  assert(spec,`missing lesson spec ${skill.id}`);
  const plan=context.conceptTeachingPlanFor(skill.id,key);
  assert.equal(plan.problem,context.childFriendlyCopy(spec.faham),`${skill.id}: example must come from its concept bank`);
  assert.equal(plan.ask,context.childFriendlyCopy(spec.goal),`${skill.id}: goal mismatch`);
  assert.equal(plan.compare.question,plan.problem,`${skill.id}: comparison changed example`);
  assert.equal(plan.compare.right,context.childFriendlyCopy(spec.good),`${skill.id}: right method mismatch`);
  assert.equal(plan.compare.wrong,context.childFriendlyCopy(spec.bad),`${skill.id}: misconception mismatch`);
  assert(plan.steps.join(' ').includes(context.childFriendlyCopy(spec.bridge)),`${skill.id}: missing concept bridge`);
  const contrast=context.contrastPanel(plan);
  assert(contrast.includes('CONTOH MUDAH')&&contrast.includes('JANGAN BUAT BEGINI')&&contrast.includes('BUAT BEGINI'),`${skill.id}: child labels missing`);
  assert(!contrast.includes('tidak memenuhi hubungan'),`${skill.id}: abstract legacy copy remains`);
  assert(!/\b(kuantiti|hubungan|notasi|orientasi|konsisten|munasabah|keyword|aplikasikan|konteks)\b/i.test([plan.problem,plan.ask,...plan.steps,contrast].join(' ')),`${skill.id}: adult vocabulary remains`);
  for(const strategy of ['model','contrast','micro']){
    for(const stage of [0,1,2]){
      const html=context.stageContent(stage,key,skill,strategy);
      assert(html&&typeof html==='string',`${skill.id}: empty ${strategy} stage ${stage}`);
    }
  }
  reports.push({id:skill.id,title:skill.title,status:'pass'});
}

// Every non-D2 fallback keeps its displayed comparison tied to its own easier checkpoint example.
for(const skill of graph.skills.filter(x=>x.grade!==2)){
  const key=context.conceptKeyFor(skill.id,'generic'),plan=context.conceptTeachingPlanFor(skill.id,key),html=context.contrastPanel(plan);
  assert(html.includes(plan.prompt),`${skill.id}: fallback comparison is not tied to its example`);
}

console.log(JSON.stringify({status:'pass',d2Skills:reports.length,d2StrategyStages:reports.length*3*3,fallbackSkills:graph.skills.length-reports.length,principles:['same concept','easier example','explicit misconception','new transfer checkpoint'],reports},null,2));
