// Pahlawan Angka — Year 6 Curriculum Bank v2 v3.61.0
// 38-standard internal competency routing. Loaded after v3.60.5 Money bank.
// Keeps the existing pupil-facing D6 skill IDs while selecting and tagging the
// exact KSSR learning standard assessed by each question.
(function(){
'use strict';
const VERSION='3.61.0', banks=window.PAQuestionBanks=window.PAQuestionBanks||{}, prior=banks.d6;
const C=window.PAY6CompetencyV2;
if(typeof prior!=='function'||!C)return;

const stage=window.PAKSSRYear6?.stage||function(s){
 const m=Number(s?.mastery||0),e=Number(s?.evidence||0),c=Number(s?.confidence||0),w=Number(s?.wrong||0);
 if(e===0)return 2;if(w>=1&&e<=3)return 1;if(w>=2)return 1;if(e>=4&&(m<35||c<35))return 1;if(e<4||m<70||c<60)return 2;return 3;
};
const H=window.PAY6KSSRRepair?.helpers||{}, VH=window.PAKSSRDepth?.visualHelpers||{};
const Nq=(v,t)=>N(v,t), choose=a=>pick(a), rand=(a,b)=>R(a,b);
const tidy=(v,d=2)=>typeof tidyNumber==='function'?tidyNumber(v,d):Number(Number(v).toFixed(d));
const table=(h,rows)=>VH.miniTable?VH.miniTable(h,rows):'<table>'+rows.map(x=>'<tr>'+x.map(y=>'<td>'+y+'</td>').join('')+'</tr>').join('')+'</table>';
const coord=(pts,scale)=>VH.coordinateMap?VH.coordinateMap(pts,scale):table(['Titik','x','y'],pts.map(p=>[p.label,p.x,p.y]));
const protractor=d=>H.protractorSvg?H.protractorSvg(d):'<div class="kssrDiagram">Sudut '+d+'°</div>';
const polygon=n=>H.regularPolygonSvg?H.regularPolygonSvg(n):'<div class="kssrDiagram">Poligon '+n+' sisi</div>';
const circle=(m,r)=>H.circleSvg?H.circleSvg(m,r):'<div class="kssrDiagram">Bulatan</div>';
const pie=(s,o={})=>H.pieSvg?H.pieSvg(s,o):table(['Kategori','Sudut'],s.map(x=>[x.label,x.angle+'°']));
const bag=(r,b,g=0)=>H.bagVisual?H.bagVisual(r,b,g):table(['Warna','Bilangan'],[['Merah',r],['Biru',b],['Hijau',g]]);
const sem=v=>String(v).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
const sessRef=()=>{try{return typeof sess!=='undefined'?sess:window.sess}catch(_){return window.sess}};
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){const t=b;b=a%b;a=t}return a||1};
const frac=(n,d)=>{const g=gcd(n,d);n/=g;d/=g;if(d===1)return String(n);if(n>d){const w=Math.floor(n/d),r=n%d;return r?w+' '+r+'/'+d:String(w)}return n+'/'+d};
const fmtTime=(mins)=>{
 mins=((mins%1440)+1440)%1440;
 const h=Math.floor(mins/60),m=mins%60;
 return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');
};
const cities=[
 {name:'Kuala Lumpur',offset:480},{name:'Tokyo',offset:540},{name:'Bangkok',offset:420},{name:'Dubai',offset:240},
 {name:'New Delhi',offset:330},{name:'Darwin',offset:570},{name:'London',offset:0},{name:'Paris',offset:60}
];
function q(prompt,answer,wrong,hint,kind){return Q(prompt,answer,wrong,hint,kind,true,true)}
function recentFor(id){
 return (sessRef()?.questionHistory||[]).filter(x=>x.skillId===id).slice(-24);
}
function chooseNode(id){
 const route=C.routes[id]||[];
 if(!route.length)return null;
 const recent=recentFor(id);
 const seen=recent.map(x=>x.subcompetencyId||x.curriculumNode||String(x.standardRef||'').split('/')[0]).filter(Boolean);
 const last=seen.at(-1);
 const counts=Object.fromEntries(route.map(n=>[n,seen.filter(x=>x===n).length]));
 const pool=route.filter(n=>n!==last);
 return (pool.length?pool:route).sort((a,b)=>counts[a]-counts[b]||Math.random()-.5)[0];
}
function chooseMode(id,node,modes){
 const recent=recentFor(id).map(x=>String(x.archetypeId||''));
 const last=recent.at(-1),full=modes.map(m=>'y6v2_'+node.replaceAll('.','_')+'_'+m);
 const counts=Object.fromEntries(full.map(m=>[m,recent.filter(x=>x===m).length]));
 const pool=full.filter(m=>m!==last),chosen=(pool.length?pool:full).sort((a,b)=>counts[a]-counts[b]||Math.random()-.5)[0];
 return chosen.replace('y6v2_'+node.replaceAll('.','_')+'_','');
}
function mark(out,id,node,mode,rep,demand,s,targets=[]){
 if(!out)return out;
 const meta=C.byId[node];
 out.source='kssr-year6-curriculum-v2-v3.61.0';
 out.standardRef=node;out.competencyId=node;out.subcompetencyId=node;out.curriculumNode=node;
 out.curriculumUnit=meta?.unit;out.curriculumUnitTitle=meta?.unitTitle;out.competencyTitle=meta?.title;
 out.archetypeId='y6v2_'+node.replaceAll('.','_')+'_'+mode;
 out.representation=rep;out.demand=demand;out.difficultyBand=stage(s)===3?4:stage(s)===2?3:2;
 out.misconceptionTargets=targets;out.kssrYear6V2Version=VERSION;
 return out;
}
function optionsNum(ans,steps=[1,2,3],tag='operation'){
 const vals=[];for(const d of steps){vals.push(Nq(ans+d,tag));if(vals.length===3)break}
 return vals;
}
const GEN={};

/*__UNIT12__*/
/*__UNIT45__*/
/*__UNIT678__*/

function tagPriorMoney(out,s){
 if(!out)return out;
 let node=String(out.standardRef||'3.3.1').split('/')[0];
 if(!C.byId[node]||C.byId[node].unit!==3)node='3.3.1';
 out.subcompetencyId=node;out.curriculumNode=node;out.curriculumUnit=3;out.curriculumUnitTitle=C.units[3];
 out.competencyTitle=C.byId[node]?.title||'Wang';out.kssrYear6V2Version=VERSION;
 return out;
}
banks.d6=function(id,s,shift){
 if(id==='D6.AREA'||id==='D6.DATA')return null;
 if(id==='D6.MONEY')return tagPriorMoney(prior(id,s,shift),s);
 const node=chooseNode(id);
 const fn=node&&GEN[node];
 const out=fn?fn(id,s,shift):prior(id,s,shift);
 if(out&&!out.kssrYear6V2Version){
   const fallbackNode=String(out.standardRef||node||'').split('/')[0];
   out.subcompetencyId=fallbackNode||node;out.curriculumNode=fallbackNode||node;out.kssrYear6V2Version=VERSION;
 }
 return out;
};
window.PAY6CurriculumV2={version:VERSION,competencies:C,stage,chooseNode};
document.documentElement?.setAttribute('data-kssr-year6-curriculum-v2',VERSION);
})();