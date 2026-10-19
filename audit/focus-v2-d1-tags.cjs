// Focus Diagnosis v2: D1 questions carry authored tags, and a cross-topic weakness
// (e.g. subtraction facts) shows as a likely cause on the home focus card.
// Run: node audit/focus-v2-d1-tags.cjs
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const doc={documentElement:{dataset:{},setAttribute(){}},getElementById(){return null},querySelector(){return null},querySelectorAll(){return []}};
const c={console:{log(){},info(){},warn(){},error(){}},Math,document:doc,setTimeout(){},clearTimeout(){},sess:{mode:'practice',questionHistory:[],questionFingerprints:[]},localStorage:{getItem(){return null},setItem(){}}};
c.window=c;c.globalThis=c;vm.createContext(c);
const load=f=>vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c,{filename:f});
// Same load order as the app: eager scripts from index.html, then the lazily loaded Year 1 bank.
const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const eager=[...html.matchAll(/src="((?:questions|data\/kssr)\/[^"?]+\.js)/g)].map(m=>m[1]).filter(f=>!/questions\/index\.js|fractions-audit/.test(f));
const year1=[...sw.matchAll(/'\.\/((?:questions|data\/kssr)\/[^']*year1[^']*\.js)'/g)].map(m=>m[1]);
[...new Set([...eager,...year1,'questions/index.js','js/engine/learner-review-v1.js','js/engine/focus-foundation-v1.js','js/guardian-focus.js'])].forEach(load);
vm.runInContext('globalThis.__generate=generate;globalThis.__summary=focusPracticeSummary;globalThis.__skills=GRAPH.skills',c);
const foundations=new Set(JSON.parse(fs.readFileSync(path.join(root,'data/focus-v2/foundation-map-v1.json'),'utf8')).foundations.map(f=>f.id));
const state={mastery:60,evidence:5,confidence:55,correct:4,wrong:1};
// D1.ADD20 symbol-naming items (+, =) abstain; everything else in it is tagged.
const FULL=['D1.ADD100','D1.SUB20','D1.SUB100','D1.PV100','D1.FRAC'],NONE=['D1.SHAPE'],report={};
for(const sk of c.__skills.filter(s=>s.grade===1)){
 let tagged=0;
 for(let i=0;i<150;i++){
  c.sess.questionHistory=[];const q=c.__generate(sk.id,state),t=q.focusDiagnosticV1;if(!t)continue;tagged++;
  assert.equal(t.tagOrigin,'authored');assert.equal(t.originSkillId,sk.id);
  for(const f of t.probes.foundationIds)assert(foundations.has(f),sk.id+' unknown foundation '+f);
  assert(t.probes.foundationIds.length&&t.evidence.questionFamilyKey===q.archetypeId&&t.evidence.variantFingerprint);
  if(/_fact_direct$|_add_two$|_sub_two$/.test(q.archetypeId)){const o=t.arithmeticProfile.operands;assert(o.sum!==undefined||o.difference!==undefined,'exact operands on '+q.archetypeId);assert.equal(t.evidence.tagRevision,'d1-authored-v1')}
 }
 report[sk.id]=tagged;
 if(FULL.includes(sk.id))assert.equal(tagged,150,sk.id+' must be fully tagged');
 if(sk.id==='D1.ADD20')assert(tagged>=100,'D1.ADD20 tagged '+tagged);
 if(NONE.includes(sk.id))assert.equal(tagged,0,sk.id+' must abstain');
}
// Scenario: subtraction facts fail across topics; addition and everything else is fine.
const review=c.PALearnerReview,finder=c.PAFocusFoundationV1;let clock=1e12;
const profile={schoolGrade:1,learnerReviewV1:{schema:1,encounters:[]}};
for(const id of ['D1.SUB20','D1.ADD20','D1.DATA','D1.MONEY','D1.MEASURE'])for(let i=0;i<25;i++){
 const q=c.__generate(id,state);q.skill=id;q.token='t'+(++clock);review.beginQuestion(q,{grade:1,mode:'practice',now:clock});
 const f=q.focusDiagnosticV1?.probes?.foundationIds||[];review.resolve(q,{correct:!f.includes('sub.facts'),seconds:7,now:clock+1},profile);
}
const r=finder.evaluate(profile);
assert.equal(r.candidates[0]?.foundationId,'sub.facts',JSON.stringify(r));
const hint=c.__summary(profile).items.filter(x=>x.foundationId==='sub.facts');
assert(hint.length,'home focus shows the sub.facts hint');
console.log(JSON.stringify({status:'focus_v2_d1_tags_pass',taggedPer150:report,scenario:r.candidates[0],homeHint:hint.map(x=>x.id+' → '+x.reason)}));
