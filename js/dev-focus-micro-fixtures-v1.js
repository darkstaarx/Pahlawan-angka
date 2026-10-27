/* Pahlawan Angka — Micro Diagnosis DEV scenario fixtures.
 * Pure, deterministic, no profile/cloud reads or writes. Not a KSSR question bank.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.PADevMicroFixturesV1=api;
})(typeof window!=='undefined'?window:undefined,function(){
 'use strict';
 const item=(op,a,b,shouldPass=true,extra={})=>Object.freeze({op,a,b,shouldPass,...extra});
 const BASE_SCENARIOS=Object.freeze({
  table8:Object.freeze({name:'Sifir 8 berulang',description:'Tiga fakta darab 8 salah; tiga fakta darab lain betul.',items:[
   item('mul',8,6,false),item('mul',5,6),item('mul',8,7,false),item('mul',3,9),
   item('mul',8,8,false),item('mul',5,9)
  ],expected:'mul.table.8'}),
  oneWrong:Object.freeze({name:'Salah sekali sahaja',description:'Satu fakta 8 × 7 salah; tiada bukti mencukupi untuk label lemah.',items:[
   item('mul',8,7,false),item('mul',5,6),item('mul',3,9),item('mul',5,9)
  ],expected:null}),
  exactFact:Object.freeze({name:'7 × 8 berulang pada dua hari',description:'Fakta sama salah dua kali pada hari berbeza; fakta lain betul.',items:[
   item('mul',7,8,false,{day:0}),item('mul',5,6,true,{day:0}),
   item('mul',8,7,false,{day:2}),item('mul',3,9,true,{day:2}),
   item('mul',5,9,true,{day:2})
  ],expected:'mul.fact.7x8'}),
  borrowZero:Object.freeze({name:'Pinjam merentas sifar',description:'Soalan 402 − 175 dan 300 − 127 salah; pinjam biasa betul.',items:[
   item('sub',402,175,false),item('sub',52,18),item('sub',300,127,false),
   item('sub',73,29)
  ],expected:'sub.borrow.cross_zero'}),
  remainder:Object.freeze({name:'Bahagi dengan baki',description:'Bahagi yang ada baki salah, tetapi bahagi tepat berjaya.',items:[
   item('div',25,4,false),item('div',24,4),item('div',29,4,false),
   item('div',32,4)
  ],expected:'div.remainder'}),
  units:Object.freeze({name:'cm → m (belum disokong)',description:'Walaupun soalan boleh dijawab, log operasi sahaja tidak membuktikan arah penukaran unit.',items:[
   item('div',340,100,false,{unit:'cm → m'}),item('div',250,100,false,{unit:'cm → m'})
  ],expected:null,deferred:'measurement.cm_to_m'})
 });
 // Data-driven demonstration for every sifir 2–12; this generator is only a
 // DEV fixture, not the production selector or an assertion of pupil weakness.
 const TABLES=Object.freeze(Array.from({length:11},(_,i)=>i+2));
 function tableFixture(n){
  const rest=TABLES.filter(x=>x!==n);
  const [a,b,c]=rest.slice(0,3);
  const [d,e,f,g]=rest.slice(-4);
  return Object.freeze({
   name:'Sifir '+n+' berulang',
   description:'Tiga fakta darab '+n+' salah; dua persamaan kawalan lain betul. Data sintetik sahaja.',
   items:[item('mul',n,a,false),item('mul',d,e,true),item('mul',n,b,false),
    item('mul',f,g,true),item('mul',n,c,false)],
   expected:'mul.table.'+n
  });
 }
 const SCENARIOS=Object.freeze({
  ...BASE_SCENARIOS,
  ...Object.fromEntries(TABLES.filter(n=>n!==8).map(n=>['table'+n,tableFixture(n)]))
 });
 function answerOf(q){
  if(!q||!['add','sub','mul','div'].includes(q.op)||![q.a,q.b].every(Number.isFinite)||q.b===0&&q.op==='div')return null;
  return q.op==='add'?q.a+q.b:q.op==='sub'?q.a-q.b:q.op==='mul'?q.a*q.b:q.a/q.b;
 }
 function promptOf(q){return String(q.a)+' '+({add:'+',sub:'−',mul:'×',div:'÷'}[q.op]||'?')+' '+q.b+' = ?'+(q.unit?' ('+q.unit+')':'')}
 // Simulated response logs: times are fixed at 8 seconds because this is
 // a deterministic fixture, not measurement of a human response.
 function toLog(name,outcomes,at=Date.UTC(2026,9,1)){
  const spec=SCENARIOS[name];
  if(!spec)throw new RangeError('Unknown DEV scenario');
  if(!Array.isArray(outcomes)||outcomes.length>spec.items.length)throw new RangeError('Invalid results');
  return outcomes.map((pass,i)=>{
   if(typeof pass!=='boolean')throw new TypeError('Results must be boolean');
   const q=spec.items[i],t=at+(Number(q.day)||0)*86400000+i*120000;
   return {s:'D6.OPS',o:q.op,a:[q.a,q.b],t,sec:8,w:3,k:pass?1:0,h:0,
    c:q.unit?'measurement':'plain',f:'symbolic',id:'micro-fixture-'+name+'-'+i};
  });
 }
 function automatic(name,at){
  const s=SCENARIOS[name];if(!s)throw new RangeError('Unknown DEV scenario');
  return toLog(name,s.items.map(q=>q.shouldPass),at);
 }
 return Object.freeze({SCENARIOS,answerOf,promptOf,toLog,automatic});
});
