// Pahlawan Angka — Year 2 Curriculum Bank v2 runtime v3.62.12
(function(){
'use strict';
const VERSION='3.62.12',C=window.PAY2CompetencyV2;
if(!C)return;
const VH=window.PAKSSRDepth?.visualHelpers||{};
const rand=(a,b)=>R(a,b),choose=a=>pick(a),nq=(v,t)=>N(v,t);
const names=['Aina','Hakim','Siti','Kumar','Mei Ling','Arun','Izzah','Daniel'];
const foods=['karipap','pau','kuih lapis','roti canai','kuih seri muka','nasi lemak'];
const fruits=['rambutan','pisang','jambu','mangga','limau','durian'];
const places=['kantin sekolah','pasar pagi','kedai runcit','perpustakaan sekolah','perhentian bas','koperasi sekolah'];
const name=()=>choose(names),food=()=>choose(foods),fruit=()=>choose(fruits),place=()=>choose(places);
const sessRef=()=>{try{return typeof sess!=='undefined'?sess:window.sess}catch(_){return window.sess}};
function stage(s){const m=Number(s?.mastery||0),e=Number(s?.evidence||0),c=Number(s?.confidence||0),w=Number(s?.wrong||0);if(e<2||m<30||w>=2&&e<=4)return 1;if(e>=5&&m>=60&&c>=50)return 3;return 2}
function q(prompt,answer,wrong,hint,kind='Tahun 2'){return Q(prompt,answer,wrong,hint,kind,true,true)}
function recentFor(id){return (sessRef()?.questionHistory||[]).filter(x=>x.skillId===id).slice(-30)}
function chooseNode(id){const route=C.routes[id]||[];if(!route.length)return null;const seen=recentFor(id).map(x=>x.subcompetencyId||x.competencyId||x.curriculumNode||String(x.standardRef||'').split('/')[0]).filter(Boolean),last=seen.at(-1),counts=Object.fromEntries(route.map(n=>[n,seen.filter(x=>x===n).length]));const pool=route.filter(n=>n!==last);return (pool.length?pool:route).sort((a,b)=>counts[a]-counts[b]||Math.random()-.5)[0]}
function chooseMode(id,node,modes){const prefix='y2v2_'+node.replaceAll('.','_')+'_',full=modes.map(m=>prefix+m),recent=recentFor(id).map(x=>String(x.archetypeId||'')),last=recent.at(-1),counts=Object.fromEntries(full.map(m=>[m,recent.filter(x=>x===m).length])),pool=full.filter(m=>m!==last),chosen=(pool.length?pool:full).sort((a,b)=>counts[a]-counts[b]||Math.random()-.5)[0];return chosen.slice(prefix.length)}
function bandModes(s,low,core,high){return stage(s)===1?low:stage(s)===3?high:core}
function mark(out,id,node,mode,rep,demand,s,targets=[]){if(!out)return out;const meta=C.byId[node];Object.assign(out,{source:'kssr-year2-curriculum-v2-v3.62.12',standardRef:node,competencyId:node,subcompetencyId:node,curriculumNode:node,curriculumUnit:meta?.unit,curriculumUnitTitle:meta?.unitTitle,competencyTitle:meta?.title,archetypeId:'y2v2_'+node.replaceAll('.','_')+'_'+mode,representation:rep,demand,difficultyBand:stage(s)===3?4:stage(s)===2?3:1,misconceptionTargets:targets,kssrYear2V2Version:VERSION});return out}
function wrongNums(ans,step=1,tag='operation'){const vals=[ans+step,Math.max(0,ans-step),ans+step*2],seen=new Set([String(ans)]),out=[];for(const v of vals)if(!seen.has(String(v))){seen.add(String(v));out.push(nq(v,tag))}let k=3;while(out.length<3){const v=Math.max(0,ans+k++);if(!seen.has(String(v))){seen.add(String(v));out.push(nq(v,tag))}}return out.slice(0,3)}
function words(n){return typeof numWords==='function'?numWords(n):String(n)}
function fmtMoney(c){return typeof moneyFmt==='function'?moneyFmt(c):c<100?c+' sen':'RM'+(c/100).toFixed(c%100?2:0)}
function table(headers,rows){return `<table style="border-collapse:collapse;margin:6px auto 10px;background:#fff"><tr>${headers.map(x=>`<th style="border:2px solid #9aa8c3;padding:6px 8px">${x}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map(x=>`<td style="border:2px solid #9aa8c3;padding:6px 8px">${x}</td>`).join('')}</tr>`).join('')}</table>`}
function fractionBar(n,d){return typeof fractionVisual==='function'?fractionVisual(n,d):`<div>${n}/${d}</div>`}
function decimalBar(n){return typeof decimalTenthsVisual==='function'?decimalTenthsVisual(n):fractionBar(n,10)}
function clock(h,m){return typeof clockSvg==='function'?clockSvg(h,m):`<div>${h}:${String(m).padStart(2,'0')}</div>`}
function moneyVisualSafe(c){return typeof moneyVisual==='function'?moneyVisual(c):`<div>${fmtMoney(c)}</div>`}
function ruler(cm){return typeof rulerSvg==='function'?rulerSvg(cm):`<div>${cm} cm</div>`}
function scale(g){return typeof scaleSvg==='function'?scaleSvg(g):`<div>${g} g</div>`}
function cylinder(ml){return typeof cylinderSvg==='function'?cylinderSvg(ml):`<div>${ml} mL</div>`}
function bar(labels,vals){return typeof barChart==='function'?barChart(labels,vals):table(['Item','Bilangan'],labels.map((x,i)=>[x,vals[i]]))}
function solid(kind){return typeof shape3DSvg==='function'?shape3DSvg(kind):`<div>${kind}</div>`}
function shape(kind){return typeof shapeSvg==='function'?shapeSvg(kind):`<div>${kind}</div>`}
function net(kind){return typeof shapeNetSvg==='function'?shapeNetSvg(kind):`<div>Bentangan ${kind}</div>`}
function reasonableEstimate(actual,unit){const step=unit==='m'?1:unit==='kg'?1:unit==='L'?1:unit==='cm'?10:unit==='g'?100:100;return Math.max(step,Math.round(actual/step)*step)}
window.PAY2V2Runtime={version:VERSION,C,GEN:{},stage,nq,rand,choose,q,recentFor,chooseNode,chooseMode,bandModes,mark,wrongNums,words,fmtMoney,table,fractionBar,decimalBar,clock,moneyVisualSafe,ruler,scale,cylinder,bar,solid,shape,net,reasonableEstimate,name,food,fruit,place};
document.documentElement?.setAttribute('data-y2-v2-runtime',VERSION);
})();