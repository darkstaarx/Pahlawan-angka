// Guards Year 6 against fixed-sentence templates: every D6 skill must keep a large pool of distinct items.
// Run: node audit/d6-question-variety.cjs
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const doc={documentElement:{dataset:{},setAttribute(){}},getElementById(){return null},querySelector(){return null},querySelectorAll(){return []}};
const c={console:{log(){},info(){},warn(){},error:console.error},Math,document:doc,setTimeout(){},clearTimeout(){},sess:{mode:'practice',questionHistory:[],questionFingerprints:[]},db:{schoolGrade:6,skills:{}},localStorage:{getItem(){return null},setItem(){}}};
c.window=c;c.globalThis=c;vm.createContext(c);
const load=f=>vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c,{filename:f});
['data/kssr/knowledge-graph.js','questions/helpers.js','questions/d6/core.js','questions/kssr-archetypes-v3.9.0.js','questions/kssr-content-v3.11.js','questions/kssr-content-integrity-v3.18.1.js','questions/kssr-assessment-depth-v3.22.1.js',
 'questions/kssr-year6-space-data-v3.23.0.js','questions/kssr-year6-curriculum-v3.60.3.js','questions/kssr-year6-experience-v3.60.4.js','questions/kssr-year6-money-real-v3.60.5.js','data/kssr/year6-competencies-v2.js','questions/kssr-year6-v2-runtime-v3.61.0.js',
 'questions/kssr-year6-v2-unit1-v3.61.0.js','questions/kssr-year6-v2-unit2-v3.61.0.js','questions/kssr-year6-v2-unit45-v3.61.0.js','questions/kssr-year6-v2-unit6-angle-v3.61.0.js','questions/kssr-year6-v2-unit6-circle-v3.61.0.js','questions/kssr-year6-v2-unit6-space-v3.61.0.js',
 'questions/kssr-year6-v2-unit7-v3.61.0.js','questions/kssr-year6-v2-unit8-v3.61.0.js','questions/kssr-year6-curriculum-v2-v3.61.0.js','questions/kssr-year6-adaptive-v3.61.1.js'].forEach(load);
const ids=['D6.NUMBERS','D6.OPS','D6.FRAC','D6.DEC','D6.PERCENT','D6.RATIO','D6.MONEY','D6.TIME','D6.MEASURE','D6.COORD','D6.PROB','D6.ANGLE','D6.CIRCLE','D6.SPACE_PROBLEM','D6.PIE','D6.DATA_PROBLEM'];
// Money keeps a set of fixed concept items (receipts, insurance terms), so its floor is lower.
const FLOOR={'D6.MONEY':80},DEFAULT_FLOOR=120,DRAWS=300;
const states=[{mastery:0,evidence:0,confidence:0,correct:0,wrong:0},{mastery:60,evidence:5,confidence:55,correct:4,wrong:1},{mastery:85,evidence:8,confidence:80,correct:7,wrong:0}];
const key=q=>String(q.prompt).replace(/\s+/g,' ')+'|'+String(q.answer);
const report={};
for(const id of ids){
 const pool=new Set();
 for(let i=0;i<DRAWS;i++){
  c.sess.questionHistory=[];c.sess.questionFingerprints=[];
  const q=c.PAQuestionBanks.d6(id,states[i%3],false);
  assert(q&&q.prompt,id+' no question');
  const text=[q.prompt,q.answer,...(q.wrong||[]).map(w=>w&&typeof w==='object'?(w.label??w.v):w)].join(' ');
  assert(!/undefined|NaN|\[object/.test(String(text).replace(/<[^>]*>/g,' ')),id+' broken text: '+String(q.prompt).slice(0,80));
  pool.add(key(q));
 }
 report[id]=pool.size;
 assert(pool.size>=(FLOOR[id]||DEFAULT_FLOOR),`${id} has only ${pool.size} distinct items in ${DRAWS} draws`);
}
console.log(JSON.stringify({status:'pass',draws:DRAWS,distinct:report}));
