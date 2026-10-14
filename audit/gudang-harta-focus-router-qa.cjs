'use strict';
const assert=require('node:assert/strict');
global.window=global;
require('../js/gudang-harta-router.js');
const R=global.PAGudangHarta;
const graphCtx={};
require('node:vm').runInNewContext(require('node:fs').readFileSync('data/kssr/knowledge-graph.js','utf8')+';globalThis.out=GRAPH.skills;',graphCtx);
const byId=new Map(graphCtx.out.map(x=>[x.id,x]));
const applicable=Object.keys(R.SKILL).filter(id=>['Nombor','Operasi'].includes(byId.get(id)?.domain));
assert.ok(applicable.length>=30,'Nombor & Operasi tags from D1–D6 should be covered');
for(const id of applicable){
 const skill=byId.get(id),plan=R.planFor({},id);
 assert.ok(plan,`${id} should have a starter plan`);
 assert.equal(plan.grade,skill.grade,`${id} must stay on its profile grade`);
 assert.ok(plan.start.length,`${id} should select at least one activity`);
 for(const item of plan.start)assert.ok(R.ARCH[plan.grade][item.mode]?.length,`${id} maps to an existing question bank`);
}
const weak=(skill,arch)=>R.planFor({learnerReviewV1:{encounters:[
 {skillId:skill,archetypeId:arch,outcome:'unresolved',mode:'practice',questionKey:'a'},
 {skillId:skill,archetypeId:arch,outcome:'assisted',mode:'practice',questionKey:'b'}
]}},skill);
assert.deepEqual(weak('D1.SUB100','y1v2_2_3_2_sub_two').start,[{mode:'tolak',start:3,min:3,end:4}]);
assert.deepEqual(weak('D2.2.4','integrity_div_remainder').start,[{mode:'bahagi',start:3,min:0,end:5}]);
assert.deepEqual(weak('D3.ADD10000','direct_addition_fluency').start,[{mode:'tambah',start:0,min:0,end:1}]);
assert.deepEqual(weak('D4.MUL','depth_two_by_one').start,[{mode:'darab',start:0,min:0,end:3}]);
assert.deepEqual(weak('D5.OPS','integrity_combined_brackets').start,[{mode:'gabung',start:1,min:0,end:2}]);
assert.deepEqual(weak('D6.OPS','y6v2_1_2_1_brackets').start,[{mode:'gabung',start:1,min:0,end:4}]);
const devOnly=R.planFor({learnerReviewV1:{encounters:[{skillId:'D1.SUB100',archetypeId:'y1v2_2_3_2_sub_two',outcome:'unresolved',mode:'dev-test'}]}},'D1.SUB100');
assert.equal(devOnly.reason,'skill-langsung','DEV runs must not influence the learner routing');
const html=require('node:fs').readFileSync('gudang-harta.html','utf8');
const vm=require('node:vm');
const generatorStart=html.indexOf('const R=');
const generatorEnd=html.indexOf('/* penjana yang pulangkan null dicuba semula */',generatorStart);
assert.ok(generatorStart>=0&&generatorEnd>generatorStart,'question-bank source can be isolated for generation checks');
const generatorCtx={Math};
vm.runInNewContext(html.slice(generatorStart,generatorEnd)+`\nObject.values(GEN).forEach(g=>Object.values(g).forEach(list=>list.forEach(e=>{const f=e.f;e.f=C=>{let r;for(let i=0;i<60&&!r;i++)r=f(C);return r}})));globalThis.GEN=GEN;`,generatorCtx);
let generated=0;
for(let grade=1;grade<=6;grade++)for(const[mode,bank]of Object.entries(generatorCtx.GEN[grade]))for(let i=0;i<bank.length;i++){
 const entry=bank[i];for(let n=0;n<60;n++){
  const q=entry.f({who:'Wira'});assert.ok(q&&typeof q.q==='string'&&q.q.length>0,`D${grade} ${mode} tier ${i+1} generates a question`);
  assert.ok(entry.arch,`D${grade} ${mode} tier ${i+1} has a diagnostic tag`);
  if(q.form)for(const f of q.form.fields)assert.ok(Number.isFinite(f.v),`D${grade} ${mode} tier ${i+1} has a numeric answer`);
  if(grade===6&&mode==='gabung'){
   const text=q.q+' '+(q.card||'');
   if(i===0){const big=[...text.matchAll(/\d[\d ]*\d/g)].map(x=>Number(x[0].replace(/ /g,''))).filter(Number.isFinite);assert.ok(big.some(x=>x>=10000),`D6 combined-operation tier ${i+1} must use an upper-primary number`)}
   else assert.match(text,/juta/,`D6 combined-operation tier ${i+1} should include million/fractional-million content`);
   if(i<=1){let expr=q.card.split('=')[0].replaceAll('×','*').replaceAll('÷','/');expr=expr.replace(/(\d+)\s+(\d+)\/(\d+)/g,'($1+$2/$3)').replace(/(\d+)\/(\d+)/g,'($1/$2)').replaceAll(' ','');assert.match(expr,/^[\d+*/().-]+$/);const evaluated=Function('return ('+expr+')')();assert.ok(Math.abs(evaluated-q.form.fields[0].v)<1e-8,`D6 combined-operation tier ${i+1} answer matches its expression`)}
  }
  generated++;
 }
}
assert.match(html,/minigame-dev-gate\.js/);
assert.match(html,/PAFocusMiniGamesLive\?\.isActiveFrame/);
assert.match(html,/hint2>=2/,'Tanya Wira is limited to two clues');
assert.match(html,/window\.parent\.postMessage\(\{type:'PA_GUDANG_HARTA_ROUND'/,'completed rounds send learner evidence');
assert.match(html,/PA_GUDANG_HARTA_PROGRESS/,'wrong answers and clue use send evidence to the live Focus bridge');
assert.match(html,/liveAuthorized\?Math\.max\(floor,Math\.min\(tier\[k\],cap/,'live tier escalation remains inside the tagged focus skill range');
const bridge=require('node:fs').readFileSync('js/focus-mini-games-live-bridge.js','utf8');
assert.match(bridge,/operations:\{id:'gudang-harta'/);
assert.match(bridge,/function isActiveFrame\(/);
assert.match(require('node:fs').readFileSync('index.html','utf8'),/js\/gudang-harta-router\.js/);
console.log(`PASS: ${applicable.length} curriculum tags route to same-grade D1–D6 banks; generated ${generated} questions across all bank tiers; D6 operation values, operation weakness probes, live tier limits, and DEV evidence isolation pass.`);
