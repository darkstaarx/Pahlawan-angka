// Focus foundation finder: names a cross-topic root skill only with contrast evidence,
// and the home focus card shows it as a hint without changing order.
// Run: node audit/focus-foundation-v1.cjs
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const doc={documentElement:{dataset:{},setAttribute(){}},getElementById(){return null},querySelector(){return null},querySelectorAll(){return []}};
const c={console:{log(){},info(){},warn(){},error:console.error},Math,document:doc,setTimeout(){},clearTimeout(){},sess:{mode:'practice',questionHistory:[],questionFingerprints:[]},localStorage:{getItem(){return null},setItem(){}}};
c.window=c;c.globalThis=c;vm.createContext(c);
const load=f=>vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c,{filename:f});
['data/kssr/knowledge-graph.js','questions/helpers.js','questions/d6/core.js','questions/kssr-archetypes-v3.9.0.js','questions/kssr-content-v3.11.js','questions/kssr-content-integrity-v3.18.1.js','questions/kssr-assessment-depth-v3.22.1.js',
 'questions/kssr-year6-space-data-v3.23.0.js','questions/kssr-year6-curriculum-v3.60.3.js','questions/kssr-year6-experience-v3.60.4.js','questions/kssr-year6-money-real-v3.60.5.js','data/kssr/year6-competencies-v2.js','questions/kssr-year6-v2-runtime-v3.61.0.js',
 'questions/kssr-year6-v2-unit1-v3.61.0.js','questions/kssr-year6-v2-unit2-v3.61.0.js','questions/kssr-year6-v2-unit45-v3.61.0.js','questions/kssr-year6-v2-unit6-angle-v3.61.0.js','questions/kssr-year6-v2-unit6-circle-v3.61.0.js','questions/kssr-year6-v2-unit6-space-v3.61.0.js',
 'questions/kssr-year6-v2-unit7-v3.61.0.js','questions/kssr-year6-v2-unit8-v3.61.0.js','questions/kssr-year6-curriculum-v2-v3.61.0.js','questions/kssr-year6-adaptive-v3.61.1.js','questions/index.js',
 'js/engine/learner-review-v1.js','js/engine/focus-foundation-v1.js','js/guardian-focus.js'].forEach(load);
vm.runInContext('globalThis.__generate=generate;globalThis.__summary=focusPracticeSummary',c);
const review=c.PALearnerReview,finder=c.PAFocusFoundationV1,state={mastery:60,evidence:5,confidence:55,correct:4,wrong:1};
let clock=1e12;
// Play n questions per skill; fails(tag) decides the child's outcome for that question.
function play(profile,skills,n,fails){
 for(const id of skills)for(let i=0;i<n;i++){
  const q=c.__generate(id,state);q.skill=id;q.token='t'+(++clock);
  review.beginQuestion(q,{grade:6,mode:'practice',now:clock});
  const bad=fails(q.focusDiagnosticV1?.probes?.foundationIds||[],q);
  review.resolve(q,{correct:!bad,seconds:8,now:clock+1},profile);
 }
}
const fresh=()=>({schoolGrade:6,learnerReviewV1:{schema:1,encounters:[]}});
const TOPICS=['D6.NUMBERS','D6.DEC','D6.PERCENT','D6.FRAC'],DPV='number.decimal_place_value';
// A: decimal place value fails across topics, everything else is fine.
const a=fresh();play(a,TOPICS,25,f=>f.includes(DPV));
const ra=finder.evaluate(a);
assert.equal(ra.state,'candidate');assert.equal(ra.candidates[0].foundationId,DPV,JSON.stringify(ra.candidates));
assert(ra.candidates[0].skills.length>=2&&ra.candidates[0].contrastFailRate<=20);
const sa=c.__summary(a);
const hinted=sa.items.filter(x=>x.foundationId===DPV);
assert(hinted.length>=1,'home focus shows the foundation hint: '+JSON.stringify(sa.items));
assert(hinted.every(x=>/Kemungkinan punca: Nilai tempat perpuluhan/.test(x.reason)));
// B: everything fails -> no contrast, no named cause.
const b=fresh();play(b,TOPICS,25,()=>true);assert.equal(finder.evaluate(b).state,'insufficient_evidence','weak everywhere is not one foundation');
// C: one topic only -> topic weakness, not a foundation.
const cc=fresh();play(cc,['D6.DEC'],30,f=>f.includes('div.decimal'));play(cc,['D6.NUMBERS','D6.PERCENT'],20,()=>false);
assert(!finder.evaluate(cc).candidates.some(x=>x.foundationId==='div.decimal'),'single-topic failure is not cross-topic');
// D: two slips are not a pattern.
const d=fresh();let slips=0;play(d,TOPICS,25,f=>f.includes(DPV)&&slips++<2);assert.equal(finder.evaluate(d).state,'insufficient_evidence');
// E: untagged rows are ignored; demo rows are ignored.
const e=JSON.parse(JSON.stringify(a));e.learnerReviewV1.encounters.forEach(x=>delete x.focusDiagnosticV1);assert.equal(finder.evaluate(e).taggedQuestions,0);
const demo=JSON.parse(JSON.stringify(a));demo.learnerReviewV1.encounters.forEach(x=>x.mode='demo');assert.equal(finder.evaluate(demo).taggedQuestions,0);
// F: recovery -> later independent work on the same foundation clears the hint.
play(a,TOPICS,45,()=>false);assert.equal(finder.evaluate(a).state,'insufficient_evidence','recovered foundation leaves the list');
// G: realistic noise -> decimal items fail 3 in 4, other items 1 in 6.
const g=fresh();let k=0;play(g,TOPICS,30,f=>{k++;return f.includes(DPV)?k%4!==0:k%6===0});
assert.equal(finder.evaluate(g).candidates[0]?.foundationId,DPV,'noisy but clear pattern still found');
// Read-only.
const snap=JSON.stringify(b);finder.evaluate(b);assert.equal(JSON.stringify(b),snap);
console.log(JSON.stringify({status:'focus_foundation_v1_pass',scenarioA:ra.candidates[0],homeHint:hinted.map(x=>x.id+' → '+x.reason)}));
