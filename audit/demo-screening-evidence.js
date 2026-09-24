'use strict';
const assert=require('assert'),fs=require('fs'),vm=require('vm');
const demo=fs.readFileSync('js/demo-mode-v3.56.0.js','utf8');
const segel=fs.readFileSync('js/segel-demo-v2.1.0.js','utf8');
const css=fs.readFileSync('css/demo-mode-v3.56.0.css','utf8');
const graph=JSON.parse(fs.readFileSync('data/kssr/knowledge-graph.json','utf8'));

function demoQuestionCount(grade){
  const topics=new Set(graph.skills
    .filter(skill=>skill.grade===grade&&skill.role==='core')
    .filter(skill=>grade<3||skill.domain!=='Operasi')
    .map(skill=>skill.domain||`Bab ${skill.chapter||'lain'}`));
  const limits={1:12,2:14,3:15,4:15,5:15,6:15};
  return {topics:topics.size,questions:Math.min(limits[grade],topics.size*2)};
}

assert.match(demo,/Pilih Darjah/);
assert.match(demo,/const grades=\[1,2,3,4,5,6\]/);
assert.match(demo,/Darjah \$\{grade\}/);
assert.match(demo,/openSegelDemo\(\{guestDemo:true\}\)/);
assert.match(demo,/demoMode:true/);
assert.match(demo,/restoreGuest/);
assert.match(demo,/PASegelDemo\?\.guestScope/);
assert.doesNotMatch(demo,/paDemoHeroes|PADemo\.hero|applyHeroToBattle\(\)|nextQ\(\)|battle\(\)|screen\('game'\)/);
assert.doesNotMatch(css,/paDemoHeroes/);
assert.match(segel,/entryMode\?\.guestDemo/);
assert.match(segel,/window\.PADemo\?\.restoreGuest\?\.\(\)/);
assert.match(segel,/function guestTopicPlan\(grade\)/);
assert.match(segel,/const GUEST_DEMO_LIMITS=\{1:12,2:14,3:15,4:15,5:15,6:15\}/);
assert.match(segel,/if\(grade>=3&&topic==='Operasi'\)return/);
assert.match(segel,/return \[\.\.\.first,\.\.\.followUp\]/);
assert.match(segel,/questionTarget:entryMode\?\.guestDemo\?pool\.length:MAX_Q/);
const d1=demoQuestionCount(1),d6=demoQuestionCount(6);
const d5=demoQuestionCount(5);
assert.equal(d1.questions,12);
assert.equal(d5.questions,15);
assert.equal(d6.questions,15);
assert(d6.questions>d1.questions);

const planStart=segel.indexOf('const GUEST_DEMO_LIMITS='),planEnd=segel.indexOf('  function skillPool',planStart);
assert(planStart>=0&&planEnd>planStart,'guest topic planner must remain independently testable');
const planner={GRAPH:graph,mix:list=>[...list]};vm.createContext(planner);
vm.runInContext(segel.slice(planStart,planEnd)+';globalThis.guestPlanner={scope:guestTopicScope,plan:guestTopicPlan};',planner);
for(const grade of [1,2,3,4,5,6]){
  const plan=planner.guestPlanner.plan(grade),scope=planner.guestPlanner.scope(grade);
  assert.equal(plan.length,scope.questions,`Darjah ${grade} plan length`);
  if(grade>=3)assert(!plan.some(id=>graph.skills.find(skill=>skill.id===id)?.domain==='Operasi'),`Darjah ${grade} excludes standalone operations`);
}
console.log(`PASS: guest demo enters Segel safely; D1 has ${d1.questions} questions, while D5 and D6 stop at ${d5.questions}.`);
