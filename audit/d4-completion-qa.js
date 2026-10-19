'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm'),crypto=require('crypto');
const {root,loadPlan,createContext}=require('./lib/question-runtime');
let checks=0,samples=0;const modes={},examples={},promptSets={},halfKeys=new Set(),domains=new Set(),paymentMethods=new Set();
function ok(v,msg){checks++;assert(v,msg);}
const {context:c,plan}=createContext();
ok(plan.branchesAgree,'both real release loader branches agree');
const base=plan.files.indexOf('questions/kssr-year4-curriculum-v3.58.0.js'),patch=plan.files.indexOf('questions/d4/completion-v1.js');
ok(base>=0&&patch>base,'completion loads after final D4 curriculum');ok(c.PAD4Completion?.installed,'completion really installed');
const plain=s=>String(s).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
function measureBase(v,major,minor){const s=String(v),a=s.match(new RegExp('(\\d+)\\s*'+major+'(?:\\s|$)')),b=s.match(new RegExp('(\\d+)\\s*'+minor+'(?:\\s|$)'));return (a?+a[1]*1000:0)+(b?+b[1]:0);}
function inspect(q){
 samples++;const e=q.qaEvidence;ok(q.wrong.length===3,'three distractors');const opts=[q.answer,...q.wrong.map(w=>w.label??w.v)];ok(new Set(opts.map(c.semanticChoiceKey)).size===4,'four unique displayed answers');
 ok(!q.wrong.some(w=>w.tag==='generated'),'new questions need explicit meaningful distractors');ok(!/undefined|NaN|\[object Object\]/.test(q.prompt+' '+opts.join(' ')),'valid display');
 modes[q.archetypeId]=(modes[q.archetypeId]||0)+1;(promptSets[q.archetypeId]??=new Set()).add(q.prompt);examples[q.archetypeId]??={prompt:plain(q.prompt),answer:q.answer};
 const t=plain(q.prompt);
 if(e.domain==='pictograph'){
  const rows=[...q.prompt.matchAll(/<div data-category="([^"]+)" data-count="([^"]*)" data-key="(\d+)"[^>]*>([\s\S]*?)<\/div>/g)];ok(rows.length===4,'four rendered rows');
  const rendered=rows.map(m=>{const symbols=[...m[4].matchAll(/data-symbol="(whole|half)"/g)].map(x=>x[1]);const n=symbols.reduce((n,s)=>n+(s==='whole'?1:0.5),0);if(symbols.includes('half')){halfKeys.add(+m[3]);ok(/data-symbol="half"[^>]*width:8px/.test(m[4]),'half symbol is clipped to precisely half width');}if(m[2]!==''){ok(n*+m[3]===+m[2],'rendered symbols match value');ok(n===e.numberOfSymbols[rows.indexOf(m)],'rendered stimulus matches recorded evidence');return n;}return null;});
  const key=e.key,values=rendered.map(n=>n==null?null:n*key);let expected;
  const description=q.prompt.match(/role="img" aria-label="([^"]+)"/)[1];
  rows.forEach((row,j)=>{const n=rendered[j],expectedDescription=n==null?row[1]+': belum dilengkapkan':row[1]+': '+Math.floor(n)+' simbol penuh'+(n%1===0.5?' dan setengah simbol':'');ok(description.includes(expectedDescription),'accessible chart carries same visible symbol evidence');});
  ok(!/\bitem\b|1 simbol penuh =/.test(description),'accessible chart does not reveal key or hidden item totals');
  if(e.mode==='read')expected=values[e.targetIndex];
  if(e.mode==='total')expected=values.reduce((n,v)=>n+v,0);
  if(e.mode==='difference')expected=Math.max(...values)-Math.min(...values);
  if(e.mode==='missing'){const total=+t.match(/Jumlah semua item ialah (\d+)/)[1];expected=total-values.filter(v=>v!=null).reduce((n,v)=>n+v,0);ok(rendered[e.targetIndex]===null,'missing row actually hidden');}
  if(e.mode==='legend'){ok(!/1 simbol penuh =/.test(t),'legend not given away');const n=+t.match(/ialah (\d+) item/)[1];expected='1 simbol penuh = '+n/rendered[e.targetIndex]+' item';}
  if(e.mode==='maximum'){const max=Math.max(...values);expected=rows.filter((m,j)=>values[j]===max).map(m=>m[1]).join(' dan ');ok(t.includes('semua kategori'),'ties ask for complete category set');}
  ok(String(q.answer)===String(expected),'answer follows rendered pictograph and givens');
  if(e.mode!=='legend')ok(t.includes('1 simbol penuh = '+key+' item'),'key visible');
 }else if(e.domain==='payment'){
  paymentMethods.add(q.answer);ok(['tunai','kad debit','e-dompet','perbankan internet'].every(x=>opts.includes(x)),'one choice for each distinct instrument');
  ok(!t.toLowerCase().includes(String(q.answer).toLowerCase()),'instrument name not copied into question');
  const wallet=/ditambah nilai/.test(t),bank=/laman bank|laman sesawang bank/.test(t),cash=/wang kertas|syiling|terima baki/.test(t),card=/kad/.test(t)&&/akaun bank/.test(t);
  const inferred=wallet?'e-dompet':bank?'perbankan internet':card?'kad debit':cash?'tunai':null;
  ok(inferred===q.answer,'transaction/process evidence uniquely identifies instrument');ok(e.instrumentId===q.answer,'metadata matches assessed instrument');
 }else{
  domains.add(e.domain);const ns=e.operands;let expected;
  if(e.mode==='add_sub')expected=ns[0]+ns[1]-ns[2];if(e.mode==='subtract_two')expected=ns[0]-ns[1]-ns[2];if(e.mode==='multiply')expected=ns[0]*ns[1];if(e.mode==='divide')expected=ns[0]/ns[1];if(e.mode==='multiply_divide')expected=ns[0]*ns[1]/ns[2];if(e.mode==='missing')expected=ns[0]-ns[1];
  ok(Number.isInteger(expected)&&expected>=0,'measurement result nonnegative integer base units');ok(measureBase(q.answer,e.major,e.minor)===expected,'correct measurement result');
  const converted=opts.map(v=>measureBase(v,e.major,e.minor));ok(new Set(converted).size===4,'measurement options inequivalent across units');
  // Independently recover the shown mixed quantities from the actual stem.
  const amounts=[...t.matchAll(new RegExp('(?:\\d+ '+e.major+'(?: \\d+ '+e.minor+')?|\\d+ '+e.minor+')','g'))].map(m=>measureBase(m[0],e.major,e.minor));
  if(['add_sub','subtract_two'].includes(e.mode))ok(JSON.stringify(amounts)===JSON.stringify(ns),'all given quantities match expression evidence');
  if(e.mode==='multiply_divide')ok(amounts[0]===ns[0]&&t.includes('× '+ns[1]+' ÷ '+ns[2]),'combined operators and quantities agree');
  if(e.mode==='multiply')ok(amounts[0]===ns[0]&&t.includes('dalam '+ns[1]+' '+(e.domain==='mass'?'beg':'botol')),'grouping story agrees');
  if(e.mode==='divide')ok(amounts[0]===ns[0]&&t.includes('ke dalam '+ns[1]+' '+(e.domain==='mass'?'beg':'botol')),'sharing story agrees');
  if(e.mode==='missing')ok(amounts[0]===ns[1]&&amounts[1]===ns[0],'before/after quantities agree');
 }
}
for(let i=0;i<3000;i++){inspect(c.PAD4CompletionContent.paymentQuestion());inspect(c.PAD4CompletionContent.pictographQuestion());inspect(c.PAD4MeasureCompletion.question());}
ok(halfKeys.has(2)&&halfKeys.has(10),'half symbols tested for integer quantities');ok(paymentMethods.size===4&&domains.size===2,'all methods and measurement domains covered');
for(const [a,s] of Object.entries(promptSets))ok(s.size>=50,a+' has at least50 parameterized prompts; not proof50pedagogical approaches');
const before=createContext({seed:77883,omitCompletion:true}).context,after=createContext({seed:77883}).context;const skills=vm.runInContext('GRAPH.skills',after);let protectedSamples=0;
for(const s of skills.filter(s=>s.grade===4||['D1.FRAC','D2.4.2','D3.FRAC','D5.MEASURE','D6.DATA'].includes(s.id))){
 if(['D4.MONEY','D4.DATA','D4.MEASURE'].includes(s.id))continue;
 for(let i=0;i<35;i++){const st={mastery:60,confidence:70,evidence:6,correct:5,wrong:0};ok(JSON.stringify(before.questionBankFor(s.id)(s.id,st,false))===JSON.stringify(after.questionBankFor(s.id)(s.id,st,false)),s.id+' unchanged by completion router');protectedSamples++;}
}
const oldFamilies=new Set(),newFamilies=new Set();let liveSamples=0;
for(const id of ['D4.MONEY','D4.DATA','D4.MEASURE']){c.sess={mode:'practice',questionHistory:[],questionFingerprints:[]};for(let i=0;i<6000;i++){
 const q=c.generate(id,{mastery:i<1000?i%101:90,confidence:70,evidence:6,correct:5,wrong:0});liveSamples++;
 if(q.source==='d4-completion-v1'){newFamilies.add(q.archetypeId);ok(q.qaEvidence,'new task reached through actual dispatcher');}
 else oldFamilies.add(q.archetypeId);
}}
for(const a of ['money_add_three','money_record','jisim_convert','isi padu cecair_convert','panjang_convert','pictograph_read','pictograph_total','construct_bar'])ok(oldFamilies.has(a),'existing '+a+' remains reachable');
for(const a of Object.keys(modes))ok(newFamilies.has(a),'new '+a+' reached through actual dispatcher');
// Directed regression of the previously negative savings combination.
const edge=createContext({seed:319,omitCompletion:true}).context;edge.R=(a,b)=>a;edge.pick=arr=>{if(arr.includes('record'))return'record';if(arr.includes('balance'))return'balance';if(arr.includes(50)&&arr.includes(100)&&arr.includes(60))return 50;if(arr.includes(20)&&arr.includes(10)&&arr.includes(15))return 20;return arr[arr.length-1];};
const record=edge.PAQuestionBanks.d4('D4.MONEY',{},false);ok(record.archetypeId==='money_record'&&parseFloat(String(record.answer).replace('RM',''))>=0,'savings branch cannot overspend');
const committedHelper=require('child_process').execFileSync('git',['show','HEAD:questions/helpers.js'],{cwd:root});
const normalizedHash=value=>crypto.createHash('sha256').update(value.toString().replace(/\r\n/g,'\n')).digest('hex');
ok(normalizedHash(committedHelper)===normalizedHash(fs.readFileSync(path.join(root,'questions/helpers.js'))),'shared helper unchanged from GitHub baseline');

// Actual dispatcher must retain the final bank's learner-stage boundaries.
for(const state of [{mastery:0,confidence:0,evidence:0},{mastery:90,confidence:80,evidence:1},{mastery:50,confidence:70,evidence:6},{mastery:90,confidence:40,evidence:6}]){
 const stage=state.mastery<35||state.evidence<2?1:2;
 for(const id of ['D4.DATA','D4.MEASURE']){
  c.sess={mode:'practice',questionHistory:[],questionFingerprints:[]};
  for(let i=0;i<300;i++){
   const q=c.generate(id,{...state,correct:0,wrong:0});
   if(id==='D4.MEASURE')ok(q.source!=='d4-completion-v1','advanced measurement completion requires established mastery and confidence');
   else if(q.source==='d4-completion-v1')ok((stage===1?['read','legend']:['total','difference','maximum']).includes(q.qaEvidence.mode),'pictograph completion respects learner stage');
  }
 }
}

const report={pass:true,checks,samples,liveSamples,protectedSamples,modes,examples,oldFamilies:[...oldFamilies],newFamilies:[...newFamilies],limitations:['Parameterized prompts are not50 distinct pedagogical approaches.','Pictograph completion uses objective choices; free drawing is not assessed.','Loader/HTML checks simulate DOM; no claim of a live browser or deployed cache update.']};
fs.writeFileSync(path.join(__dirname,'d4-completion-qa-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({pass:true,checks,samples,liveSamples,protectedSamples},null,2));
