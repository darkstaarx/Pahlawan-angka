// Pahlawan Angka — Year 6 Curriculum Bank v2 runtime v3.61.0
(function(){
'use strict';
const VERSION='3.61.0',C=window.PAY6CompetencyV2;
if(!C)return;
const H=window.PAY6KSSRRepair?.helpers||{},VH=window.PAKSSRDepth?.visualHelpers||{};
const stage=window.PAKSSRYear6?.stage||function(s){
 const m=Number(s?.mastery||0),e=Number(s?.evidence||0),c=Number(s?.confidence||0),w=Number(s?.wrong||0);
 if(e===0)return 2;if(w>=1&&e<=3)return 1;if(w>=2)return 1;if(e>=4&&(m<35||c<35))return 1;if(e<4||m<70||c<60)return 2;return 3;
};
const Nq=(v,t)=>N(v,t),choose=a=>pick(a),rand=(a,b)=>R(a,b);
const tidy=(v,d=2)=>typeof tidyNumber==='function'?tidyNumber(v,d):Number(Number(v).toFixed(d));
const table=(h,rows)=>VH.miniTable?VH.miniTable(h,rows):'<table>'+rows.map(x=>'<tr>'+x.map(y=>'<td>'+y+'</td>').join('')+'</tr>').join('')+'</table>';
const coord=(pts,scale)=>VH.coordinateMap?VH.coordinateMap(pts,scale):table(['Titik','x','y'],pts.map(p=>[p.label,p.x,p.y]));
const protractor=d=>H.protractorSvg?H.protractorSvg(d):'<div class="kssrDiagram">Sudut '+d+'°</div>';
const polygon=n=>H.regularPolygonSvg?H.regularPolygonSvg(n):'<div class="kssrDiagram">Poligon '+n+' sisi</div>';
const circle=(m,r)=>H.circleSvg?H.circleSvg(m,r):'<div class="kssrDiagram">Bulatan</div>';
const pie=(s,o={})=>H.pieSvg?H.pieSvg(s,o):table(['Kategori','Sudut'],s.map(x=>[x.label,x.angle+'°']));
const bag=(r,b,g=0)=>H.bagVisual?H.bagVisual(r,b,g):table(['Warna','Bilangan'],[['Merah',r],['Biru',b],['Hijau',g]]);
const sessRef=()=>{try{return typeof sess!=='undefined'?sess:window.sess}catch(_){return window.sess}};
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){const t=b;b=a%b;a=t}return a||1};
const frac=(n,d)=>{const g=gcd(n,d);n/=g;d/=g;if(d===1)return String(n);if(n>d){const w=Math.floor(n/d),r=n%d;return r?w+' '+r+'/'+d:String(w)}return n+'/'+d};
const fmtTime=mins=>{mins=((mins%1440)+1440)%1440;return String(Math.floor(mins/60)).padStart(2,'0')+':'+String(mins%60).padStart(2,'0')};
const cities=[
 {name:'Kuala Lumpur',offset:480},{name:'Tokyo',offset:540},{name:'Bangkok',offset:420},{name:'Dubai',offset:240},
 {name:'New Delhi',offset:330},{name:'Darwin',offset:570},{name:'London',offset:0},{name:'Paris',offset:60}
];
function q(prompt,answer,wrong,hint,kind){return Q(prompt,answer,wrong,hint,kind,true,true)}
function recentFor(id){return (sessRef()?.questionHistory||[]).filter(x=>x.skillId===id).slice(-24)}
function chooseNode(id){
 const route=C.routes[id]||[];if(!route.length)return null;
 const seen=recentFor(id).map(x=>x.subcompetencyId||x.competencyId||x.curriculumNode||String(x.standardRef||'').split('/')[0]).filter(Boolean);
 const last=seen.at(-1),counts=Object.fromEntries(route.map(n=>[n,seen.filter(x=>x===n).length]));
 const pool=route.filter(n=>n!==last);
 return (pool.length?pool:route).sort((a,b)=>counts[a]-counts[b]||Math.random()-.5)[0];
}
function chooseMode(id,node,modes){
 const prefix='y6v2_'+node.replaceAll('.','_')+'_',full=modes.map(m=>prefix+m);
 const recent=recentFor(id).map(x=>String(x.archetypeId||'')),last=recent.at(-1);
 const counts=Object.fromEntries(full.map(m=>[m,recent.filter(x=>x===m).length]));
 const pool=full.filter(m=>m!==last),chosen=(pool.length?pool:full).sort((a,b)=>counts[a]-counts[b]||Math.random()-.5)[0];
 return chosen.slice(prefix.length);
}
function bandModes(s,low,core,high){return stage(s)===1?low:stage(s)===3?high:core}
function mark(out,id,node,mode,rep,demand,s,targets=[]){
 if(!out)return out;const meta=C.byId[node];
 out.source='kssr-year6-curriculum-v2-v3.61.0';out.standardRef=node;out.competencyId=node;out.subcompetencyId=node;out.curriculumNode=node;
 out.curriculumUnit=meta?.unit;out.curriculumUnitTitle=meta?.unitTitle;out.competencyTitle=meta?.title;
 out.archetypeId='y6v2_'+node.replaceAll('.','_')+'_'+mode;out.representation=rep;out.demand=demand;
 out.difficultyBand=stage(s)===3?4:stage(s)===2?3:2;out.misconceptionTargets=targets;out.kssrYear6V2Version=VERSION;
 return out;
}
window.PAY6V2Runtime={version:VERSION,C,GEN:{},stage,Nq,choose,rand,tidy,table,coord,protractor,polygon,circle,pie,bag,gcd,frac,fmtTime,cities,q,recentFor,chooseNode,chooseMode,bandModes,mark};
document.documentElement?.setAttribute('data-y6-v2-runtime',VERSION);
})();