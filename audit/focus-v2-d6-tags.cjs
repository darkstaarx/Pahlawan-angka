// Focus Diagnosis v2: D6 questions carry authored, contract-shaped tags that survive generate().
// Untagged archetypes are an explicit abstain list, never a silent gap.
// Run: node audit/focus-v2-d6-tags.cjs
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const doc={documentElement:{dataset:{},setAttribute(){}},getElementById(){return null},querySelector(){return null},querySelectorAll(){return []}};
const c={console:{log(){},info(){},warn(){},error:console.error},Math,document:doc,setTimeout(){},clearTimeout(){},sess:{mode:'practice',questionHistory:[],questionFingerprints:[]},db:{schoolGrade:6,skills:{}},localStorage:{getItem(){return null},setItem(){}}};
c.window=c;c.globalThis=c;vm.createContext(c);
const load=f=>vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c,{filename:f});
['data/kssr/knowledge-graph.js','questions/helpers.js','questions/d6/core.js','questions/kssr-archetypes-v3.9.0.js','questions/kssr-content-v3.11.js','questions/kssr-content-integrity-v3.18.1.js','questions/kssr-assessment-depth-v3.22.1.js',
 'questions/kssr-year6-space-data-v3.23.0.js','questions/kssr-year6-curriculum-v3.60.3.js','questions/kssr-year6-experience-v3.60.4.js','questions/kssr-year6-money-real-v3.60.5.js','data/kssr/year6-competencies-v2.js','questions/kssr-year6-v2-runtime-v3.61.0.js',
 'questions/kssr-year6-v2-unit1-v3.61.0.js','questions/kssr-year6-v2-unit2-v3.61.0.js','questions/kssr-year6-v2-unit45-v3.61.0.js','questions/kssr-year6-v2-unit6-angle-v3.61.0.js','questions/kssr-year6-v2-unit6-circle-v3.61.0.js','questions/kssr-year6-v2-unit6-space-v3.61.0.js',
 'questions/kssr-year6-v2-unit7-v3.61.0.js','questions/kssr-year6-v2-unit8-v3.61.0.js','questions/kssr-year6-curriculum-v2-v3.61.0.js','questions/kssr-year6-adaptive-v3.61.1.js','questions/index.js'].forEach(load);
vm.runInContext('globalThis.__generate=generate',c);
const foundations=new Set(JSON.parse(fs.readFileSync(path.join(root,'data/focus-v2/foundation-map-v1.json'),'utf8')).foundations.map(f=>f.id));
const DOMAINS=new Set(['money','number','operations','time','measurement','fraction','percent','ratio','data','other']);
const OPS=new Set(['addition','subtraction','multiplication','division']);
const REPS=new Set(['symbolic','contextual','manipulative','visual','bar_model','other']);
// Topics with no foundation in the map: tagging them would be guessing.
const ABSTAIN_ONLY=new Set(['D6.ANGLE','D6.CIRCLE','D6.SPACE_PROBLEM','D6.PROB']);
const MUST_TAG=['D6.NUMBERS','D6.OPS','D6.FRAC','D6.DEC','D6.PERCENT','D6.RATIO','D6.TIME','D6.MEASURE','D6.PIE','D6.DATA_PROBLEM'];
const ids=[...MUST_TAG,'D6.MONEY','D6.COORD',...ABSTAIN_ONLY];
const states=[{mastery:0,evidence:0,confidence:0,correct:0,wrong:0},{mastery:60,evidence:5,confidence:55,correct:4,wrong:1},{mastery:85,evidence:8,confidence:80,correct:7,wrong:0}];
const engine=require('../js/engine/focus-diagnosis-v2.js');
const report={},abstain=new Set();
for(const id of ids){
 let tagged=0,total=0;const fps=new Set();
 for(let i=0;i<240;i++){
  c.sess.questionHistory=[];c.sess.questionFingerprints=[];
  const q=c.__generate(id,states[i%3]);total++;
  const t=q.focusDiagnosticV1;
  if(!t){abstain.add(id+' '+q.archetypeId);continue}
  assert(!ABSTAIN_ONLY.has(id),id+' should abstain but tagged '+q.archetypeId);
  tagged++;
  assert.equal(t.schema,'pa.focus.question-tag.v1');assert.equal(t.tagOrigin,'authored');assert.equal(t.originSkillId,id);
  assert(DOMAINS.has(t.contextDomain),id+' domain '+t.contextDomain);
  for(const op of t.arithmeticProfile.operationFamilies)assert(OPS.has(op),id+' op '+op);
  assert(t.arithmeticProfile.operands&&typeof t.arithmeticProfile.operands==='object');
  assert(t.probes.foundationIds.length,id+' no foundation '+q.archetypeId);
  for(const f of t.probes.foundationIds)assert(foundations.has(f),id+' unknown foundation '+f);
  assert.equal(t.evidence.questionFamilyKey,q.archetypeId);
  assert(t.evidence.variantFingerprint&&!/[A-Za-z]{4,} [A-Za-z]{4,}/.test(t.evidence.variantFingerprint),'fingerprint must be opaque');
  assert.equal(t.evidence.tagRevision,'d6-authored-v1');
  if(t.evidence.representation)assert(REPS.has(t.evidence.representation),id+' rep '+t.evidence.representation);
  assert(!JSON.stringify(t).includes(String(q.prompt).slice(0,40)),'tag must not carry prompt text');
  fps.add(t.evidence.variantFingerprint);
 }
 report[id]={tagged,total,fingerprints:fps.size};
 if(MUST_TAG.includes(id))assert(tagged===total,id+' tagged '+tagged+'/'+total);
}
// Written addition carries exact column features from the shared tagger.
let addSeen=0,divSeen=0;
for(let i=0;i<200&&(addSeen<5||divSeen<5);i++){
 const q=c.__generate('D6.OPS',states[1]),t=q.focusDiagnosticV1;
 if(q.archetypeId==='y6v2_1_2_1_written_add'){addSeen++;const o=t.arithmeticProfile.operands;assert.equal(t.diagnosticFamily,'addition');assert.equal(o.sum,o.addends[0]+o.addends[1]);assert.equal(typeof t.arithmeticProfile.operandDimensions.usesRegrouping,'boolean')}
 if(q.archetypeId==='y6v2_1_2_1_written_div'){divSeen++;const o=t.arithmeticProfile.operands;assert.equal(t.diagnosticFamily,'two_digit_div');assert.equal(o.dividend,o.divisor*o.quotient)}
}
assert(addSeen&&divSeen,'written add/div sampled');
// The shadow engine accepts the tags and stays conservative on a thin record.
c.sess.questionHistory=[];const q=c.__generate('D6.PERCENT',states[1]);
const r=engine.evaluate({originSkillId:'D6.PERCENT',profile:{learnerReviewV1:{encounters:[{questionKey:'k1',skillId:'D6.PERCENT',outcome:'unresolved'}]}},questionKeys:['k1'],questionTagsByKey:{k1:q.focusDiagnosticV1}});
assert.equal(r.rootCause,null,'one miss never yields a root cause');
console.log(JSON.stringify({status:'focus_v2_d6_tags_pass',report,abstainArchetypes:[...abstain].sort()},null,1));
