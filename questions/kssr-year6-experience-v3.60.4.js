// Pahlawan Angka — Year 6 Question Experience Hardening v3.60.4
// Loaded after kssr-year6-curriculum-v3.60.3.js.
// Prevents "same template, different numbers" fatigue while preserving KSSR demand.
(function(){
'use strict';
const V='3.60.4',banks=window.PAQuestionBanks=window.PAQuestionBanks||{},prior=banks.d6;
if(typeof prior!=='function')return;
const stage=window.PAKSSRYear6?.stage||function(){return 2};
const H=window.PAY6KSSRRepair?.helpers||{},VH=window.PAKSSRDepth?.visualHelpers||{};
const choose=a=>pick(a),rand=(a,b)=>R(a,b),Nq=(v,t)=>N(v,t);
const tidy=(v,d=2)=>typeof tidyNumber==='function'?tidyNumber(v,d):Number(Number(v).toFixed(d));
const money=v=>typeof moneyFmtUpper==='function'?moneyFmtUpper(Number(tidy(v,2))):'RM'+Number(v).toFixed(2);
const table=(h,r)=>VH.miniTable?VH.miniTable(h,r):'<table>'+r.map(x=>'<tr>'+x.map(y=>'<td>'+y+'</td>').join('')+'</tr>').join('')+'</table>';
const coord=(pts,scale)=>VH.coordinateMap?VH.coordinateMap(pts,scale):table(['Titik','x','y'],pts.map(p=>[p.label,p.x,p.y]));
const protractor=d=>H.protractorSvg?H.protractorSvg(d):'<div class="kssrDiagram">Sudut '+d+'°</div>';
const polygon=n=>H.regularPolygonSvg?H.regularPolygonSvg(n):'<div class="kssrDiagram">Poligon sekata '+n+' sisi</div>';
const circle=(m,r)=>H.circleSvg?H.circleSvg(m,r):'<div class="kssrDiagram">Bulatan</div>';
const pie=(s,o={})=>H.pieSvg?H.pieSvg(s,o):table(['Kategori','Sudut'],s.map(x=>[x.label,x.angle+'°']));
const bag=(r,b,g=0)=>H.bagVisual?H.bagVisual(r,b,g):table(['Warna','Bilangan'],[['Merah',r],['Biru',b],['Hijau',g]]);
const sessRef=()=>{try{return typeof sess!=='undefined'?sess:window.sess}catch(_){return window.sess}};
function rotate(id,modes){
  const recent=(sessRef()?.questionHistory||[]).filter(x=>x.skillId===id).slice(-14).map(x=>String(x.archetypeId||'').replace(/^y6x_/,'').replace(/^y6kssr_/,''));
  const last=recent.at(-1),counts=Object.fromEntries(modes.map(x=>[x,recent.filter(y=>y===x).length]));
  const pool=modes.filter(x=>x!==last);
  return (pool.length?pool:modes).sort((a,b)=>counts[a]-counts[b]||Math.random()-.5)[0];
}
function mark(q,id,sp,mode,rep,demand,s,targets=[]){
  if(!q)return q;
  q.source='kssr-year6-experience-v3.60.4';
  q.standardRef=sp;q.competencyId=sp;q.archetypeId='y6x_'+mode;
  q.representation=rep;q.demand=demand;
  q.difficultyBand=stage(s)===3?4:stage(s)===2?3:2;
  q.misconceptionTargets=targets;q.kssrExperienceVersion=V;
  return q;
}
function usePrior(q){if(q)q.kssrExperienceVersion=V;return q}
function priorCore(id,s,shift){
  const e=Number(s?.evidence||0);
  const lifted=e<2?Object.assign({},s,{evidence:4,mastery:Math.max(50,Number(s?.mastery||0)),confidence:Math.max(50,Number(s?.confidence||0)),wrong:0}):s;
  return usePrior(prior(id,lifted,shift));
}
const Z=[['Kuala Lumpur',8],['Tokyo',9],['Bangkok',7],['Dubai',4]];
const fmt=(h,m)=>String((h%24+24)%24).padStart(2,'0')+':'+String(m).padStart(2,'0');
const CORE={},HIGH={};

/*__REGISTRATIONS__*/

banks.d6=function(id,s,shift){
  if(id==='D6.AREA'||id==='D6.DATA')return null;
  const st=stage(s);let q=null;
  if(st===3&&HIGH[id])q=HIGH[id](id,s,shift);
  else if(st===2&&CORE[id])q=CORE[id](id,s,shift);
  else if(st===2)q=priorCore(id,s,shift);
  else q=usePrior(prior(id,s,shift));
  if(q)q.kssrExperienceVersion=V;
  return q;
};
window.PAY6QuestionExperience={version:V,stage};
document.documentElement?.setAttribute('data-kssr-year6-experience',V);
})();