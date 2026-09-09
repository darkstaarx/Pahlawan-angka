// Pahlawan Angka — Year 1 Curriculum Bank v2 runtime v3.62.6
(function(){
'use strict';
const VERSION='3.62.6',C=window.PAY1CompetencyV2;
if(!C)return;
const VH=window.PAKSSRDepth?.visualHelpers||{};
const Nq=(v,t)=>N(v,t),choose=a=>pick(a),rand=(a,b)=>R(a,b);
const sessRef=()=>{try{return typeof sess!=='undefined'?sess:window.sess}catch(_){return window.sess}};
const stage=s=>{
 const m=Number(s?.mastery||0),e=Number(s?.evidence||0),c=Number(s?.confidence||0),w=Number(s?.wrong||0);
 if(e<2||m<30)return 1;if(w>=2&&e<=4)return 1;if(e>=5&&m>=60&&c>=50)return 3;return 2;
};
const names=['Aina','Hakim','Siti','Kumar','Mei Ling','Arun','Izzah','Daniel'];
const foods=['karipap','pau','kuih lapis','roti canai','kuih seri muka'];
const fruits=['rambutan','pisang','jambu','mangga','limau'];
const places=['kantin sekolah','pasar pagi','kedai runcit','perpustakaan sekolah','perhentian bas'];
const name=()=>choose(names),food=()=>choose(foods),fruit=()=>choose(fruits),place=()=>choose(places);
const table=(h,rows)=>VH.miniTable?VH.miniTable(h,rows):'<table>'+rows.map(x=>'<tr>'+x.map(y=>'<td>'+y+'</td>').join('')+'</tr>').join('')+'</table>';
const pictograph=(labels,vals)=>VH.pictograph?VH.pictograph(labels,vals):table(['Item','Bilangan'],labels.map((x,i)=>[x,vals[i]]));
const numLine=(min,max,value,label='?')=>VH.numLine?VH.numLine(min,max,value,label):'<div class="kssrDiagram">'+Array.from({length:max-min+1},(_,i)=>min+i===value?label:min+i).join(' — ')+'</div>';
const fractionStrip=(n,d)=>VH.fractionStrip?VH.fractionStrip(n,d):'<div class="kssrDiagram">'+('■'.repeat(n)+'□'.repeat(Math.max(0,d-n)))+'</div>';
const fractionSet=(n,d)=>VH.fractionSet?VH.fractionSet(n,d):'<div class="kssrDiagram">'+('●'.repeat(n)+'○'.repeat(Math.max(0,d-n)))+'</div>';
function q(prompt,answer,wrong,hint,kind){return Q(prompt,answer,wrong,hint,kind,true,true)}
function recentFor(id){return (sessRef()?.questionHistory||[]).filter(x=>x.skillId===id).slice(-30)}
function chooseNode(id){
 const route=C.routes[id]||[];if(!route.length)return null;
 const seen=recentFor(id).map(x=>x.subcompetencyId||x.competencyId||x.curriculumNode||String(x.standardRef||'').split('/')[0]).filter(Boolean);
 const last=seen.at(-1),counts=Object.fromEntries(route.map(n=>[n,seen.filter(x=>x===n).length]));
 const pool=route.filter(n=>n!==last);
 return (pool.length?pool:route).sort((a,b)=>counts[a]-counts[b]||Math.random()-.5)[0];
}
function chooseMode(id,node,modes){
 const prefix='y1v2_'+node.replaceAll('.','_')+'_',full=modes.map(m=>prefix+m);
 const recent=recentFor(id).map(x=>String(x.archetypeId||'')),last=recent.at(-1),counts=Object.fromEntries(full.map(m=>[m,recent.filter(x=>x===m).length]));
 const pool=full.filter(m=>m!==last),chosen=(pool.length?pool:full).sort((a,b)=>counts[a]-counts[b]||Math.random()-.5)[0];
 return chosen.slice(prefix.length);
}
function bandModes(s,low,core,high){return stage(s)===1?low:stage(s)===3?high:core}
function mark(out,id,node,mode,rep,demand,s,targets=[]){
 if(!out)return out;const meta=C.byId[node];
 out.source='kssr-year1-curriculum-v2-v3.62.6';out.standardRef=node;out.competencyId=node;out.subcompetencyId=node;out.curriculumNode=node;
 out.curriculumUnit=meta?.unit;out.curriculumUnitTitle=meta?.unitTitle;out.competencyTitle=meta?.title;
 out.archetypeId='y1v2_'+node.replaceAll('.','_')+'_'+mode;out.representation=rep;out.demand=demand;
 out.difficultyBand=stage(s)===3?4:stage(s)===2?3:1;out.misconceptionTargets=targets;out.kssrYear1V2Version=VERSION;
 return out;
}
function words(n){
 n=Number(n);if(n===0)return'sifar';if(n===100)return'seratus';
 const one=['','satu','dua','tiga','empat','lima','enam','tujuh','lapan','sembilan'];
 if(n<10)return one[n];if(n===10)return'sepuluh';if(n===11)return'sebelas';if(n<20)return one[n-10]+' belas';
 const t=Math.floor(n/10),o=n%10;return one[t]+' puluh'+(o?' '+one[o]:'');
}
function wrongNums(ans,step=1,tag='operation'){
 const vals=[ans+step,Math.max(0,ans-step),ans+step*2],seen=new Set([String(ans)]),out=[];
 for(const v of vals)if(!seen.has(String(v))){seen.add(String(v));out.push(Nq(v,tag))}
 let k=3;while(out.length<3){const v=Math.max(0,ans+k++);if(!seen.has(String(v))){seen.add(String(v));out.push(Nq(v,tag))}}
 return out.slice(0,3);
}
function dots(n){
 const cols=5,rows=Math.ceil(n/cols),w=250,h=Math.max(70,rows*38+18);let s='';
 for(let i=0;i<n;i++){const x=35+(i%cols)*45,y=28+Math.floor(i/cols)*38;s+=`<circle cx="${x}" cy="${y}" r="10" class="kd-fill"/>`}
 return `<div class="kssrDiagram"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${n} objek">${s}</svg></div>`;
}
function estimateCloud(n){
 const cols=7,rows=Math.ceil(n/cols),w=290,h=Math.max(80,rows*28+18);let s='';
 for(let i=0;i<n;i++){const x=25+(i%cols)*39+(i%2?4:0),y=24+Math.floor(i/cols)*28+(i%3);s+=`<circle cx="${x}" cy="${y}" r="7" class="kd-fill"/>`}
 return `<div class="kssrDiagram"><svg viewBox="0 0 ${w} ${h}" aria-label="sekumpulan objek untuk dianggar">${s}</svg></div>`;
}
function nonStandard(count,label='klip'){
 return '<div class="kssrDiagram"><div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap">'+Array.from({length:count},()=>'<span style="display:inline-block;border:2px solid currentColor;border-radius:7px;padding:4px 6px">'+label+'</span>').join('')+'</div></div>';
}
function tally(n){return '||||| '.repeat(Math.floor(n/5))+'|'.repeat(n%5)}
function solid(kind){
 const common='class="kd-shape"';
 const map={
  kubus:`<polygon points="75,30 135,15 175,45 115,62" ${common}/><polygon points="75,30 115,62 115,125 75,92" ${common}/><polygon points="115,62 175,45 175,105 115,125" ${common}/>`,
  kuboid:`<polygon points="55,35 145,20 190,45 100,62" ${common}/><polygon points="55,35 100,62 100,120 55,93" ${common}/><polygon points="100,62 190,45 190,103 100,120" ${common}/>`,
  kon:`<path d="M115 18 L55 120 Q115 145 175 120 Z" ${common}/><ellipse cx="115" cy="120" rx="60" ry="18" ${common}/>`,
  silinder:`<ellipse cx="115" cy="35" rx="55" ry="18" ${common}/><rect x="60" y="35" width="110" height="85" ${common}/><ellipse cx="115" cy="120" rx="55" ry="18" ${common}/>`,
  sfera:`<circle cx="115" cy="78" r="58" ${common}/><ellipse cx="115" cy="78" rx="58" ry="18" fill="none" class="kd-line"/>`,
  piramid:`<polygon points="115,15 45,120 185,120" ${common}/><line x1="115" y1="15" x2="155" y2="95" class="kd-line"/><polygon points="45,120 155,95 185,120 75,140" ${common}/>`
 };
 return `<div class="kssrDiagram"><svg viewBox="0 0 230 155" role="img" aria-label="bentuk ${kind}">${map[kind]||''}</svg></div>`;
}
function clock(h,m){return typeof clockSvg==='function'?clockSvg(h,m):`<div class="kssrDiagram">Jam ${h}:${String(m).padStart(2,'0')}</div>`}
function moneyVis(c){return typeof moneyVisual==='function'?moneyVisual(c):`<div class="kssrDiagram">${c<100?c+' sen':'RM'+(c/100)}</div>`}
window.PAY1V2Runtime={version:VERSION,C,GEN:{},stage,Nq,choose,rand,q,recentFor,chooseNode,chooseMode,bandModes,mark,words,wrongNums,dots,estimateCloud,nonStandard,tally,solid,clock,moneyVis,table,pictograph,numLine,fractionStrip,fractionSet,name,food,fruit,place};
document.documentElement?.setAttribute('data-y1-v2-runtime',VERSION);
})();