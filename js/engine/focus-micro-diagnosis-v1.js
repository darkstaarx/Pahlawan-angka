/* Pahlawan Angka — Focus Micro Diagnosis Phase 1.
 * READ-ONLY shadow evaluator of observable patterns in existing diagLog.
 * Never concludes a psychological root cause or modifies mastery, routing or profile.
 * The patterns are engineering hypotheses, NOT nationally validated prevalence claims.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.PAFocusMicroV1=api;
})(typeof window!=='undefined'?window:undefined,function(){
 'use strict';
 const VERSION='1.1.0-shadow';
 const spec=(id,foundation,label,status='diaglog',nextProbe=foundation)=>
  Object.freeze({id,foundationId:foundation,label,status,nextProbe});
 const TABLES=Object.freeze(Array.from({length:11},(_,i)=>i+2));
 const CATALOG=Object.freeze([
  ...TABLES.map(n=>spec('mul.table.'+n,'mul.facts','Fakta darab melibatkan '+n)),
  spec('add.carry.ones','add.regroup','Pengumpulan semula lajur sa'),
  spec('add.carry.tens','add.regroup','Pengumpulan semula lajur puluh'),
  spec('sub.borrow.ones','sub.regroup','Meminjam pada lajur sa'),
  spec('sub.borrow.cross_zero','sub.regroup','Meminjam merentas sifar'),
  spec('div.remainder','div.remainder','Konsep baki bahagi'),
  spec('word.context_vs_symbolic','operation.choose','Soalan cerita berbanding kiraan terus'),
  spec('money.context_vs_plain','money.transaction','Kiraan dalam konteks wang'),
  spec('measurement.cm_to_m','measurement.units','Penukaran sentimeter ke meter','needs_authored_item_tags'),
  spec('time.minutes_to_hours','time.units','Penukaran minit kepada jam','needs_authored_item_tags'),
  spec('decimal.column_alignment','number.decimal_place_value','Penjajaran nilai tempat perpuluhan','needs_authored_item_tags'),
  spec('fraction.unlike_denominators','fraction.equal_parts','Pecahan berlainan penyebut','needs_authored_item_tags')
 ]);
 // Exact arithmetic patterns are NOT enumerated/hardcoded: generated only from
 // eligible factual equations with repeated failures. Never emit one for a
 // larger calculation that merely contains a component fact.
 const FACT_FAMILIES=Object.freeze({
  mul:Object.freeze({foundation:'mul.facts',prefix:'mul.fact.'}),
  div:Object.freeze({foundation:'div.facts',prefix:'div.fact.'}),
  add:Object.freeze({foundation:'add.facts',prefix:'add.fact.'}),
  sub:Object.freeze({foundation:'sub.facts',prefix:'sub.fact.'})
 });
 function exactFact(r){
  const {op,a,b}=r;
  if(op==='mul'&&a>=1&&a<=12&&b>=1&&b<=12&&(TABLES.includes(a)||TABLES.includes(b))){
   const x=Math.min(a,b),y=Math.max(a,b);
   return spec('mul.fact.'+x+'x'+y,'mul.facts','Fakta '+x+' × '+y);
  }
  if(op==='div'&&TABLES.includes(b)&&a%b===0&&a/b>=1&&a/b<=12){
   return spec('div.fact.'+a+'by'+b,'div.facts','Fakta '+a+' ÷ '+b);
  }
  if(op==='add'&&a<=10&&b<=10&&a+b<=20){
   const x=Math.min(a,b),y=Math.max(a,b);
   return spec('add.fact.'+x+'plus'+y,'add.facts','Fakta '+x+' + '+y);
  }
  if(op==='sub'&&a<=20&&b<=10&&a-b>=0&&a-b<=10){
   return spec('sub.fact.'+a+'minus'+b,'sub.facts','Fakta '+a+' − '+b);
  }
  return null;
 }
 const OUTCOMES=new Set([0,1]),OPS=new Set(['add','sub','mul','div']);
 const acceptedGrade=s=>typeof s==='string'&&/^D[1-6](?:\.|$)/.test(s);
 const num=v=>typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<=10000000;
 const day=t=>Math.floor(t/86400000);
 const rapid=r=>Number(r.sec)>0&&Number(r.sec)<Math.min(3.2,Math.max(1.8,1.35+(Number(r.w)||0)*5.5*.018));
 const independent=r=>r.k===1&&r.h!==1;
 const wrong=r=>r.k===0;
 const unique=xs=>new Set(xs).size;
 function columnsAdd(a,b){
  const out=[],digits=Math.max(String(a).length,String(b).length);
  let carry=0;
  for(let i=0;i<digits;i++){
   const x=Math.floor(a/10**i)%10,y=Math.floor(b/10**i)%10;
   if(x+y+carry>=10){out.push(i);carry=1}else carry=0;
  }
  return out;
 }
 function columnsBorrow(a,b){
  if(a<b)return {cols:[],crossZero:false};
  const A=String(a).split('').reverse().map(Number),B=String(b).split('').reverse().map(Number);
  const cols=[];let crossZero=false;
  for(let i=0;i<B.length;i++){
   if((A[i]||0)>=(B[i]||0))continue;
   let j=i+1;while(j<A.length&&A[j]===0)j++;
   if(j>=A.length)return {cols:[],crossZero:false};
   if(j>i+1)crossZero=true;
   A[i]=(A[i]||0)+10;
   for(let k=i+1;k<j;k++)A[k]=9;
   A[j]--;cols.push(i);
  }
  return {cols,crossZero};
 }
 function canonical(op,a,b){
  if(op==='mul')return 'mul:'+Math.min(a,b)+'x'+Math.max(a,b);
  if(op==='add')return 'add:'+Math.min(a,b)+'+'+Math.max(a,b);
  if(op==='sub')return 'sub:'+a+'-'+b;
  return 'div:'+a+'/'+b;
 }
 function normalize(raw){
  if(!raw||!OUTCOMES.has(raw.k)||!OPS.has(raw.o)||raw.g===1||rapid(raw)||
    ['demo','dev','dev-test'].includes(raw.mode)||!acceptedGrade(raw.s)||
    !Array.isArray(raw.a)||raw.a.length!==2||!raw.a.every(num)||
    !Number.isFinite(raw.t)||raw.t<=0)return null;
  const [a,b]=raw.a;
  if(raw.o==='div'&&(b===0||a<b))return null;
  if(raw.o==='sub'&&a<b)return null;
  const op=raw.o;
  const carry=op==='add'?columnsAdd(a,b):[];
  const borrow=op==='sub'?columnsBorrow(a,b):{cols:[],crossZero:false};
  return {op,a,b,s:raw.s,t:raw.t,k:raw.k,h:raw.h,f:raw.f,c:raw.c,
   token:String(raw.id||''),family:canonical(op,a,b),
   carry,borrow,remainder:op==='div'&&a%b!==0,
   independent:independent(raw),failed:wrong(raw),day:day(raw.t)};
 }
 function rowsFor(input){
  const log=Array.isArray(input)?input:
   Array.isArray(input?.diagLog)?input.diagLog:[];
  const dedup=new Map();
  for(let i=Math.max(0,log.length-600);i<log.length;i++){
   const x=normalize(log[i]);if(!x)continue;
   // One question token/encounter = one piece of first-attempt evidence.
   const key=x.token?'id:'+x.token:'event:'+x.t+'|'+x.s+'|'+x.op+'|'+x.a+'|'+x.b+'|'+x.f;
   dedup.set(key,x);
  }
  return [...dedup.values()].sort((a,b)=>a.t-b.t);
 }
 function evaluate(input={},options={}){
  const rows=rowsFor(input),maxFindings=Number.isInteger(options.maxFindings)?
   Math.max(0,Math.min(options.maxFindings,50)):10;
  const findings=[];
  function offer(specification,failedRows,contrastRows,reason,extra={}){
   if(failedRows.length<2)return;
   const failedKeys=unique(failedRows.map(r=>r.family));
   const independentContrast=contrastRows.filter(r=>r.independent);
   const contrastKeys=unique(independentContrast.map(r=>r.family));
   const latestFail=Math.max(...failedRows.map(r=>r.t));
   // New successes on the precise same equations can supersede an old suggestion.
   const recovered=rows.filter(r=>r.t>latestFail&&r.independent&&
    failedRows.some(x=>x.family===r.family));
   if(extra.minFailedFamilies===1?recovered.length>=2:unique(recovered.map(r=>r.family))>=2)return;
   const enough=failedKeys>=(extra.minFailedFamilies||2)&&contrastKeys>=2&&
     (extra.extraGate?extra.extraGate(failedRows,independentContrast):true);
   const status=enough?'probe_candidate':'needs_more_evidence';
   findings.push({id:specification.id,foundationId:specification.foundationId,
    label:specification.label,status,nextProbe:specification.nextProbe,
    reasonCode:reason,
    evidence:{failedAttempts:failedRows.length,distinctFailedEquations:failedKeys,
     independentContrastEquations:contrastKeys,distinctFailedDays:unique(failedRows.map(r=>r.day))},
    interpretation:'Corak pemerhatian sahaja; perlu soalan pengesahan bebas sebelum pemulihan.',
    ...(extra.context?{context:extra.context}:{})});
  }
  const cat=id=>CATALOG.find(x=>x.id===id);
  const mul=rows.filter(r=>r.c==='plain'&&r.op==='mul'&&r.a>=1&&r.b>=1&&r.a<=12&&r.b<=12);
  for(const table of TABLES){
   const withT=mul.filter(r=>r.a===table||r.b===table);
   offer(cat('mul.table.'+table),withT.filter(r=>r.failed),
    mul.filter(r=>r.a!==table&&r.b!==table),'TABLE_FACTS_REQUIRE_CONTRAST',
    {extraGate:(fails)=>unique(fails.map(r=>r.a===table?r.b:r.a))>=2});
  }
  // One algorithm for every exact ×, ÷, + and − basic fact.
  // Only inspect a repeated failed equation; no prewritten list of numbers.
  const plain=rows.filter(r=>r.c==='plain'&&['mul','div','add','sub'].includes(r.op));
  const misses=new Map();
  for(const r of plain){
   if(!r.failed)continue;
   const candidate=exactFact(r);
   if(!candidate)continue;
   if(!misses.has(candidate.id))misses.set(candidate.id,{candidate,rows:[]});
   misses.get(candidate.id).rows.push(r);
  }
  for(const {candidate,rows:failures} of misses.values()){
   if(failures.length<2)continue;
   const op=failures[0].op;
   const control=plain.filter(r=>r.op===op&&r.family!==failures[0].family);
   offer(candidate,failures,control,'EXACT_FACT_NEEDS_FRESH_PROBES',{
    minFailedFamilies:1,
    extraGate:(fails)=>unique(fails.map(r=>r.day))>=2||
     unique(fails.map(r=>(r.f||'')+'|'+(r.c||'')))>=2
   });
  }
  const add=rows.filter(r=>r.c==='plain'&&r.op==='add'&&Math.max(r.a,r.b)>=10);
  for(const col of [0,1]){
   const target=add.filter(r=>r.carry.includes(col));
   const control=add.filter(r=>!r.carry.includes(col)&&
     Math.max(r.a,r.b)>=10**Math.max(1,col));
   offer(cat(col===0?'add.carry.ones':'add.carry.tens'),
    target.filter(r=>r.failed),control,'CARRY_VS_NO_CARRY');
  }
  const sub=rows.filter(r=>r.c==='plain'&&r.op==='sub'&&Math.max(r.a,r.b)>=10);
  const borrowed=sub.filter(r=>r.borrow.cols.length);
  offer(cat('sub.borrow.ones'),borrowed.filter(r=>r.failed&&r.borrow.cols.includes(0)),
    sub.filter(r=>!r.borrow.cols.includes(0)),'BORROW_VS_NO_BORROW');
  offer(cat('sub.borrow.cross_zero'),sub.filter(r=>r.failed&&r.borrow.crossZero),
    borrowed.filter(r=>!r.borrow.crossZero),'ZERO_CROSSING_VS_SIMPLE_BORROW');
  const div=rows.filter(r=>r.c==='plain'&&r.op==='div');
  offer(cat('div.remainder'),div.filter(r=>r.failed&&r.remainder),
   div.filter(r=>!r.remainder),'REMAINDER_VS_EXACT_DIVISION');
  // Context contrasts are flags to CHECK, not claims about reading, operation choice or money units.
  const contextual=rows.filter(r=>['word','story'].includes(r.f));
  offer(cat('word.context_vs_symbolic'),contextual.filter(r=>r.failed),
   rows.filter(r=>['symbolic','plain','lazim'].includes(r.f)&&
    contextual.some(x=>x.op===r.op)),'CONTEXT_VS_SYMBOLIC_NONMATCHED_DIFFICULTY');
  const money=rows.filter(r=>r.c==='money');
  offer(cat('money.context_vs_plain'),money.filter(r=>r.failed),
   rows.filter(r=>r.c==='plain'&&money.some(x=>x.op===r.op)),
   'MONEY_VS_PLAIN_NONMATCHED_DIFFICULTY');
  findings.sort((a,b)=>(a.status==='probe_candidate'?0:1)-(b.status==='probe_candidate'?0:1)||
   b.evidence.distinctFailedEquations-a.evidence.distinctFailedEquations||
   a.id.localeCompare(b.id));
  return {version:VERSION,mode:'shadow_read_only',state:findings.some(f=>f.status==='probe_candidate')?'probe_candidates':
   findings.length?'needs_more_evidence':'insufficient_evidence',
   findings:findings.slice(0,maxFindings),
   catalogSize:CATALOG.length,eligiblePatterns:CATALOG.filter(x=>x.status==='diaglog').length,
   deferredPatterns:CATALOG.filter(x=>x.status!=='diaglog').map(x=>x.id),
   evidence:{usableRows:rows.length},writes:0,
   note:'Hypotheses only. No score, mastery, focus routing, profile, cloud or rewards changed.'};
 }
 return Object.freeze({VERSION,CATALOG,FACT_FAMILIES,rowsFor,evaluate,_test:{canonical,columnsAdd,columnsBorrow,exactFact}});
});
