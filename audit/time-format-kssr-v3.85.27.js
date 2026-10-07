const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..');
let seed=92811;const math=Object.create(Math);math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
const doc={documentElement:{dataset:{},setAttribute(){}},getElementById(){return null},querySelector(){return null},querySelectorAll(){return []}};
const c={console,Math:math,document:doc,setTimeout(){},clearTimeout(){},sess:{mode:'practice',questionHistory:[],questionFingerprints:[]},db:{schoolGrade:1,skills:{}},localStorage:{getItem(){return null},setItem(){}}};c.window=c;c.globalThis=c;vm.createContext(c);
const load=f=>vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c,{filename:f});
load('data/kssr/knowledge-graph.js');load('questions/helpers.js');
assert.equal(c.formatClockTime(0),'12:00 tengah malam');assert.equal(c.formatClockTime(720),'12:00 tengah hari');assert.equal(c.formatClockTime(930),'3:30 petang');assert.equal(c.formatClockTime(930,'12','ampm'),'3:30 p.m.');assert.equal(c.formatClockTime(1440,'12','ampm'),'12:00 a.m.');assert.equal(c.formatClockTime(930,'24'),'jam 1530');assert.equal(c.formatClockTime(0,'24'),'jam 0000');assert.equal(c.formatClockTime(11*60+90),'12:30 tengah hari');
assert.equal(c.fallbackChoice('11:55 pagi',1),'12:00 tengah hari');assert.equal(c.fallbackChoice('11:55 p.m.',1),'12:00 a.m.');assert.equal(c.fallbackChoice('jam 2355',1),'jam 0000');
const hidden=c.timelineSvg(11,30,13,0,{showEnd:false,formatTime:(h,m)=>c.formatClockTime(h*60+m)});assert(hidden.includes('11:30 pagi'));assert(!hidden.includes('1:00 petang'));assert(hidden.includes('>?</text>'));
for(const g of [1,3,4,5,6])load(`questions/d${g}/core.js`);for(let i=1;i<=8;i++)load(`questions/d2/topic-${i}.js`);
load('questions/kssr-archetypes-v3.9.0.js');load('questions/kssr-content-v3.11.js');
const state={mastery:55,confidence:55,evidence:6,correct:5,wrong:1};
let count=0;const stages={};
function parseClock(text){const m=String(text).match(/(\d{1,2}):(\d{2})(?::(\d{2}))? (pagi|tengah hari|petang|malam|tengah malam)/);if(!m)return null;let h=Number(m[1])%12;if(['tengah hari','petang','malam'].includes(m[4]))h+=12;return h*3600+Number(m[2])*60+Number(m[3]||0)}
const proseText=t=>t.replace(/<[^>]*>/g,' ');
function samples(label){
 const report={};
 for(const id of ['D1.TIME','D2.5.1','D2.5.2','D2.5.3','D3.TIME','D4.TIME','D5.TIME','D6.TIME']){
  const bank=c.PAQuestionBanks[id.startsWith('D2.')?'d2t5':'d'+id[1]],seen=new Set();
  for(let i=0;i<100;i++){
   const q=bank(id,state,false);assert(q&&q.prompt,id+' '+label);assert.equal(q.wrong.length,3);assert.equal(new Set([q.answer,...q.wrong.map(w=>w.v)].map(String)).size,4,id+' choices');
   const texts=[q.prompt,q.answer,q.hint,...q.wrong.map(w=>w.v)].map(String);
   for(const t of texts){assert(!/\b(?:1[3-9]|2\d):\d{2}\s*(?:pagi|petang|malam|a\.m\.|p\.m\.)/.test(t),id+' invalid12 '+t);assert(!/\b\d{1,2}:[6-9]\d\b/.test(t),id+' invalidminute '+t);assert(!/\bjam \d{4}\s*(?:a\.m\.|p\.m\.)/.test(t),id+' mixedformat');}
   if(/^D[123]/.test(id))assert(!/sistem 24 jam|jam \d{4}/i.test(texts.join(' ')),id+' early24');
   if(id==='D2.5.3'){assert(/pagi|tengah hari|petang|malam/.test(q.prompt),label+' D2 context');if(/minit$/.test(String(q.answer)))assert(!/pagi|petang|malam|a\.m\.|p\.m\./.test(q.answer),'duration label');}
   if(id==='D2.5.3'){
    const prose=q.prompt.replace(/<svg[\s\S]*?<\/svg>/g,'').replace(/<[^>]*>/g,' '),times=[...prose.matchAll(/\d{1,2}:\d{2} (?:pagi|tengah hari|petang|malam|tengah malam)/g)].map(x=>parseClock(x[0])),duration=prose.match(/(\d+) minit/);
    if(times.length&&duration&&parseClock(q.answer)!=null){const a=parseClock(q.answer);const delta=/bermula pada|Aktiviti bermula/.test(prose)?a-times[0]:times[0]-a;assert.equal(delta,Number(duration[1])*60,id+' arithmetic '+prose);}
    if(times.length===2&&/minit$/.test(String(q.answer)))assert.equal(times[1]-times[0],parseInt(q.answer)*60,id+' duration arithmetic');
   }
   if(label==='final-live-layers'&&id==='D4.TIME'&&q.archetypeId==='time_24h'){assert(/^jam \d{4}$/.test(q.answer),'D4 requested24');const src=parseClock(proseText(q.prompt)),digits=q.answer.slice(4);assert.equal((Number(digits.slice(0,2))*60+Number(digits.slice(2)))*60,src,'D4 conversion');}
   if(label==='final-live-layers'&&id==='D6.TIME'&&/\b\d{2}:\d{2}\b/.test(q.prompt)&&!/^.*UTC[+−]\d+:\d{2}.*$/.test(q.prompt.replace(/\b\d{2}:\d{2}\b/g,'')))assert(q.prompt.includes('sistem 24 jam')||q.prompt.includes('UTC'),'D6 notation context');
   seen.add(q.archetypeId||q.subcompetencyId||'legacy');c.sess.questionHistory.push({skillId:id,archetypeId:q.archetypeId,subcompetencyId:q.subcompetencyId});c.sess.questionHistory=c.sess.questionHistory.slice(-60);count++;
  }report[id]=seen.size;
 }stages[label]=report;
}
samples('static');
load('questions/kssr-content-integrity-v3.18.1.js');load('questions/kssr-assessment-depth-v3.22.1.js');samples('integrity-depth');
for(const f of ['data/kssr/year1-competencies-v2.js','questions/kssr-year1-v2-runtime-v3.62.6.js','questions/kssr-year1-v2-unit1-v3.62.6.js','questions/kssr-year1-v2-unit2-v3.62.6.js','questions/kssr-year1-v2-unit34-v3.62.6.js','questions/kssr-year1-v2-unit56-v3.62.6.js','questions/kssr-year1-v2-unit78-v3.62.6.js','questions/kssr-year1-curriculum-v2-v3.62.6.js','questions/kssr-year1-adaptive-v3.62.6.js','questions/kssr-year4-curriculum-v3.58.0.js','questions/kssr-year6-space-data-v3.23.0.js','questions/kssr-year6-curriculum-v3.60.3.js','questions/kssr-year6-experience-v3.60.4.js','questions/kssr-year6-money-real-v3.60.5.js','data/kssr/year6-competencies-v2.js','questions/kssr-year6-v2-runtime-v3.61.0.js','questions/kssr-year6-v2-unit1-v3.61.0.js','questions/kssr-year6-v2-unit2-v3.61.0.js','questions/kssr-year6-v2-unit45-v3.61.0.js','questions/kssr-year6-v2-unit6-angle-v3.61.0.js','questions/kssr-year6-v2-unit6-circle-v3.61.0.js','questions/kssr-year6-v2-unit6-space-v3.61.0.js','questions/kssr-year6-v2-unit7-v3.61.0.js','questions/kssr-year6-v2-unit8-v3.61.0.js','questions/kssr-year6-curriculum-v2-v3.61.0.js','questions/kssr-year6-adaptive-v3.61.1.js'])load(f);
samples('final-live-layers');
// Exercise the generated runtime, not only its authoring source.
load('questions/v2/dist/runtime.js');
const {_test}=require('../questions/v2/engine/legacy-adapter.js');const rt=c.PAQuestionSystemV2;
let v2Count=0;for(const t of rt.templates.filter(t=>t.grade===3&&t.topicId==='D3.T5'))for(let seed=0;seed<40;seed++){
 const raw=rt._generators[t.generator](t.params||{},_test.makeRng(70100+seed));const q=_test.assembleLegacyQuestion(rt,t,raw),v=raw.value.visual,sem=raw.meta.semanticProperties;
 assert.equal(new Set([q.answer,...q.wrong.map(w=>w.v)]).size,4,'v2 unique');
 if(raw.meta.archetype==='read_activity_schedule'){assert(/pagi|petang/.test(q.answer),'schedule context');assert(q.prompt.includes('1:00 petang'),'school afternoon');}
 if(raw.meta.archetype==='read_analogue_clock')assert(!/pagi|petang|malam/.test(q.answer),'analog no inferred period');
 if(raw.meta.archetype==='find_time_difference'){assert.equal(parseClock(v.endLabel)-parseClock(v.startLabel),sem.durationMinutes*60);assert(!/pagi|petang|malam/.test(q.answer),'duration no period');}
 if(raw.meta.archetype==='two_step_time_schedule'){assert.equal(v.endLabel,'?','unknown time must stay hidden');assert(!q.prompt.includes('>'+q.answer+'<'),'answer leak');assert.equal(parseClock(q.answer),sem.endSeconds,'exact ending clock includes seconds');}
 if(raw.meta.archetype==='add_time_values'){assert.equal(v.endLabel,'?','sum endpoint hidden');assert(!q.prompt.includes('>'+q.answer+'<'),'sum not printed in diagram');}
 if(v?.kind==='timeline'){assert(v.startLabel!=null&&v.endLabel!=null,'time timeline explicit endpoint meaning');assert(!/text-anchor="middle"[^>]*>[^<]*(pagi|petang)/.test(q.prompt),'clock endpoints fit inside diagram');}
 v2Count++;
}
console.log(JSON.stringify({status:'pass',samples:count,v2Samples:v2Count,stages}));
