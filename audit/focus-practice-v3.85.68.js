(async()=>{
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const repo=path.resolve(__dirname,'..');
const ctx={console,Math,Date,Set,Map,URL,URLSearchParams,setTimeout:()=>0,clearTimeout:()=>{},location:{search:''},localStorage:{getItem:()=>null,setItem:()=>{}},document:{addEventListener:()=>{},getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[]}};
ctx.window=ctx;ctx.globalThis=ctx;ctx.sess={mode:'practice',questionFingerprints:[],questionHistory:[]};
vm.createContext(ctx);
function load(p){vm.runInContext(fs.readFileSync(path.join(repo,p),'utf8'),ctx,{filename:p})}
const bankScripts=[...fs.readFileSync(path.join(repo,'index.html'),'utf8').matchAll(/<script[^>]+src="([^"?]+)(?:\?[^\"]*)?"/g)].map(m=>m[1]).filter(p=>p.startsWith('questions/')||p.startsWith('data/kssr/'));
load('js/fraction-visuals-v2.js');
bankScripts.forEach(load);
load('js/guardian-focus.js');
const skills=vm.runInContext('GRAPH.skills',ctx),report=[];
for(const skill of skills){
 ctx.db={schoolGrade:skill.grade};ctx.sess={mode:'practice',questionFingerprints:[],questionHistory:[]};
 const seen=new Set();
 for(let i=0;i<80;i++){
  const q=ctx.generate(skill.id,{mastery:35,evidence:5,confidence:40,correct:2,wrong:3},{strictSkill:true,battleTier:'gembok'});
  assert(q,skill.id+': question bank returned null');
  assert(q.prompt&&q.answer!==undefined,skill.id+': malformed question');
  assert(q.title!=='Fallback',skill.id+': unrelated fallback');
  if(q.wrong){const options=[q.answer,...q.wrong.map(w=>w.v)].map(v=>String(v).trim().toLowerCase());assert.equal(new Set(options).size,options.length,skill.id+': duplicate answers')}
  seen.add(ctx.questionFingerprint(q));
 }
 report.push({id:skill.id,unique:seen.size});
}
function evidence(id,outcomes,grade=2){return outcomes.map((outcome,i)=>({skillId:id,grade,outcome,questionKey:id+'-'+i,mode:'practice'}))}
const ids=skills.filter(s=>s.grade===2).slice(0,6).map(s=>s.id);
const profile={schoolGrade:2,learnerReviewV1:{encounters:[
 ...evidence(ids[0],Array(5).fill('unresolved')),
 ...evidence(ids[1],['independent','corrected','corrected','corrected','corrected']),
 ...evidence(ids[2],['independent','independent','assisted','assisted','assisted']),
 ...evidence(ids[3],['independent','independent','independent','corrected','corrected']),
 ...evidence(ids[4],['independent','independent','independent','independent','corrected']),
 ...evidence(ids[5],Array(5).fill('unresolved'),1)]}};
assert.deepEqual(Array.from(ctx.PAFocusPractice.summary(profile).items,i=>i.id),ids.slice(0,3),'ranks top three weak skills; excludes strong/off-grade');
assert.equal(ctx.PAFocusPractice.summary({schoolGrade:2}).items.length,0,'unseen skills never labelled weak');
const repeated={schoolGrade:2,learnerReviewV1:{encounters:evidence(ids[0],Array(5).fill('unresolved')).map(e=>({...e,questionKey:'same'}))}};
assert.equal(ctx.PAFocusPractice.summary(repeated).items.length,0,'one repeated question insufficient');
const recovered={schoolGrade:2,learnerReviewV1:{encounters:[...evidence(ids[0],Array(5).fill('unresolved')),...evidence(ids[0],Array(20).fill('independent'))]}};
assert.equal(ctx.PAFocusPractice.summary(recovered).items.length,0,'recent recovery removes weak suggestion');
ctx.sess={mode:'practice',questionFingerprints:[],questionHistory:[]};
assert.equal(ctx.generate('UNKNOWN',{evidence:0,mastery:0},{strictSkill:true}),null,'focused run must never fallback to addition');
// Exercise the actual production route rather than a duplicate selector.
ctx.performance={now:()=>10};ctx.db=profile;
ctx.scoreState=()=>({mastery:35,evidence:5,confidence:40,correct:2,wrong:3});
ctx.swapDemoState=(profile,session)=>{const old={db:ctx.db,sess:ctx.sess};ctx.db=profile;ctx.sess=session;return old};
ctx.PASegelHost={openProduction:()=>{}};
ctx.PACommercial={requireFeature:feature=>feature==='focus',authorizeMission:async()=>true};
const doc=ctx.document;ctx.document=undefined;
load('js/engine/production-journey.js');ctx.document=doc;ctx.__PA_LIVE_ASSET_REFRESHED=true;
await ctx.PAProductionJourney.open({focusSkill:'D2.2.3'});
const run=ctx.PAProductionJourney.state();
assert.equal(run.route,'focus');assert.deepEqual(Array.from(run.pool),['D2.2.3']);
for(let i=0;i<30;i++){const q=ctx.PAProductionJourney.nextQuestion(run);assert.equal(q.skill,'D2.2.3');assert(!/Fallback/.test(q.kind||''));assert.equal(ctx.sess.focusSkill,'D2.2.3')}
// Mobile picker selection and profile changes.
function node(){return {children:[],dataset:{},setAttribute(){},hidden:false,textContent:'',classList:{values:new Set(['hidden']),add(k){this.values.add(k)},remove(k){this.values.delete(k)},contains(k){return this.values.has(k)}},appendChild(n){this.children.push(n)},replaceChildren(){this.children=[]},get firstElementChild(){return this.children[0]},focus(){doc.activeElement=this},getBoundingClientRect:()=>({width:300}),scrollBy(o){this.lastScroll=o},querySelector:()=>null,querySelectorAll(){return this.children}}}
const nodes=Object.fromEntries(['focusPickerOverlay','focusPickerDeck','focusPickerEmpty','focusPickerEmptyText','focusPickerNav','focusPickerHint'].map(id=>[id,node()]));
doc.getElementById=id=>nodes[id];doc.createElement=node;
ctx.db=profile;const opened=[];ctx.openGembok=options=>opened.push(options);
ctx.PAFocusPractice.open();assert.equal(nodes.focusPickerDeck.children.length,3);assert.equal(nodes.focusPickerOverlay.classList.contains('hidden'),false);
nodes.focusPickerDeck.children[0].onclick();assert.equal(opened[0].focusSkill,ids[0]);assert.equal(nodes.focusPickerOverlay.classList.contains('hidden'),true);
ctx.PAFocusPractice.open();ctx.db={schoolGrade:1};nodes.focusPickerDeck.children[0].onclick();assert.equal(opened.length,1,'stale profile selection cannot launch');assert.equal(nodes.focusPickerEmpty.hidden,false);
console.log(JSON.stringify({skills:report.length,samples:report.length*80,minimumUnique:Math.min(...report.map(r=>r.unique)),lowVariety:report.filter(r=>r.unique<20),multiplication:report.filter(r=>/MUL|D2\.2\.3/.test(r.id)),ranking:'passed'},null,2));

})().catch(error=>{console.error(error);process.exitCode=1});
