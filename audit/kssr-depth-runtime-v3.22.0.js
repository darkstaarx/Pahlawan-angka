const fs=require('fs'),vm=require('vm'),assert=require('assert');
global.window=global;global.document={documentElement:{setAttribute(){}}};global.sess={questionHistory:[]};
global.R=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;global.pick=a=>a[R(0,a.length-1)];
global.N=(v,tag)=>({v,tag,label:v});
global.tidyNumber=(v,dp=2)=>Number(Number(v).toFixed(dp));global.decimalFmt=(v,dp=1)=>Number(v).toFixed(dp);
global.moneyFmtUpper=v=>`RM${Number(v).toFixed(2).replace(/\.00$/,'')}`;
global.moneyFmt=c=>c<100?`${c} sen`:`RM${Math.floor(c/100)}${c%100?'.'+String(c%100).padStart(2,'0'):''}`;
global.uniqueDigitNumber=len=>{let ds=[R(1,9)];while(ds.length<len){let d=R(0,9);if(!ds.includes(d))ds.push(d)}return Number(ds.join(''))};
global.cleanChoice=v=>String(v).replace(/\s+/g,' ').trim();
global.Q=(prompt,answer,wrong,hint,kind,diagnostic,formatShift)=>{
 const seen=new Set([String(answer)]),out=[];for(const x of wrong||[]){if(x&& !seen.has(String(x.v))){seen.add(String(x.v));out.push(x)}}
 let k=1;while(out.length<3){let v=typeof answer==='number'?answer+1000+(k++):`fallback-${k++}`;if(!seen.has(String(v))){seen.add(String(v));out.push(N(v,'generated'))}}
 return {prompt,answer,wrong:out.slice(0,3),hint,kind,diagnostic,formatShift};
};
global.addQ=(a,b,ans,kind,shift)=>Q(`${a}+${b}`,ans,[N(ans+1,'operation'),N(ans-1,'operation'),N(a+b+10,'operation')],'h',kind,true,shift);
global.subQ=(a,b,ans,kind,shift)=>Q(`${a}-${b}`,ans,[N(ans+1,'operation'),N(Math.max(0,ans-1),'operation'),N(a+b,'operation')],'h',kind,true,shift);
global.base10Visual=n=>`<base10>${n}</base10>`;global.clockSvg=(h,m)=>`<clock>${h}:${m}</clock>`;
global.shapeSvg=x=>`<shape>${x}</shape>`;global.barChart=(l,v)=>`<bar>${l.join(',')}:${v.join(',')}</bar>`;
global.moneyVisual=c=>`<money>${c}</money>`;
global.PAQuestionBanks={};
for(const k of ['d1','d2t1','d2t2','d2t3','d2t4','d2t5','d2t6','d2t7','d2t8','d3','d4','d5','d6'])PAQuestionBanks[k]=(id,s,shift)=>Q(`fallback ${id}`,1,[N(2,'x'),N(3,'x'),N(4,'x')],'fallback','fallback',false,false);

vm.runInThisContext(fs.readFileSync('questions/kssr-assessment-depth-v3.22.0.js','utf8'),{filename:'depth.js'});

const ids={
d1:['D1.N20','D1.N100','D1.PV100','D1.CMP100','D1.ADD20','D1.SUB20','D1.ADD100','D1.SUB100','D1.FRAC','D1.MONEY','D1.TIME','D1.MEASURE','D1.SHAPE','D1.DATA'],
d3:['D3.N10000','D3.PV10000','D3.ADD10000','D3.SUB10000','D3.MUL','D3.DIV','D3.FRAC','D3.DEC','D3.MONEY','D3.TIME','D3.MEASURE','D3.SHAPE','D3.DATA'],
d4:['D4.N100000','D4.PV100000','D4.ADD','D4.SUB','D4.MUL','D4.DIV','D4.FRAC','D4.DEC','D4.MONEY','D4.TIME','D4.MEASURE','D4.PERIM','D4.DATA'],
d5:['D5.N1000000','D5.PV1000000','D5.MUL','D5.DIV','D5.FRAC','D5.DEC','D5.PERCENT','D5.MONEY','D5.TIME','D5.MEASURE','D5.AREA','D5.COORD','D5.DATA'],
d6:['D6.NUMBERS','D6.OPS','D6.FRAC','D6.DEC','D6.PERCENT','D6.RATIO','D6.MONEY','D6.TIME','D6.MEASURE','D6.AREA','D6.COORD','D6.DATA']};
let count=0,visual=0,reason=0,app=0,arch={};
for(const [bank,list] of Object.entries(ids)){
 for(const id of list){
  const seen=new Set();
  for(let i=0;i<120;i++){
   global.sess={questionHistory:[...seen].slice(-5).map(a=>({skillId:id,archetypeId:a}))};
   const q=PAQuestionBanks[bank](id,{mastery:80,evidence:8,confidence:75},i>60);
   assert(q,`${id} null`);assert(q.prompt!=null,`${id} no prompt`);assert(q.answer!==undefined&&q.answer!==null,`${id} no answer`);
   assert(Array.isArray(q.wrong)&&q.wrong.length===3,`${id} wrong count`);
   const keys=[String(q.answer),...q.wrong.map(x=>String(x.v))];assert(new Set(keys).size===4,`${id} duplicate choices ${keys}`);
   assert(q.archetypeId?.startsWith('depth_')||String(q.prompt).startsWith('fallback'),`${id} no depth metadata`);
   if(q.archetypeId?.startsWith('depth_'))seen.add(q.archetypeId);
   if(/kssrDiagram|<bar>|<clock>|<shape>|<base10>|<money>/.test(q.prompt))visual++;
   if(q.demand==='reasoning')reason++;if(q.demand==='application')app++;
   arch[id]=arch[id]||new Set();if(q.archetypeId)arch[id].add(q.archetypeId);
   count++;
  }
 }
}
assert(PAKSSRDepth.contractStatus['D2.1.1']==='preserve-integrity-v3.18.1');
assert(PAKSSRDepth.contractStatus['D6.FRAC']==='depth-v3.22.0');
assert.equal(Object.keys(PAKSSRDepth.contractStatus).length,102,'all current skill contracts must be accounted for');
console.log(`PASS runtime samples=${count}, visual=${visual}, reasoning=${reason}, application=${app}`);
console.log(`PASS explicit skills=${Object.values(ids).flat().length}; D2 contracts=${Object.keys(PAKSSRDepth.contractStatus).filter(x=>x.startsWith('D2.')).length}`);
console.log('ARCHETYPES');
for(const id of Object.values(ids).flat())console.log(id,arch[id]?.size||0,[...(arch[id]||[])].join(','));
