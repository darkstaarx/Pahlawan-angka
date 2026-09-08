// Pahlawan Angka — Year 1 competency-level adaptive routing v3.62.6
(function(){
'use strict';
const VERSION='3.62.6',banks=window.PAQuestionBanks=window.PAQuestionBanks||{};
const prior=banks.d1,RT=window.PAY1V2Runtime,C=window.PAY1CompetencyV2,integrity=window.PAContentIntegrity;
if(typeof prior!=='function'||!RT||!C)return;
function recentNodes(id){return (RT.recentFor?.(id)||[]).map(x=>x.subcompetencyId||x.competencyId||x.curriculumNode||String(x.standardRef||'').split('/')[0]).filter(Boolean)}
function nodeStats(state,node){const x=state?.competencies?.[node]||{};return{attempts:Number(x.attempts||0),correct:Number(x.correct||0),clean:Number(x.clean||0)}}
function choosePersistentNode(id,state){
 const route=C.routes[id]||[];if(!route.length)return null;
 const recent=recentNodes(id),last=recent.at(-1);
 return route.map(node=>{
   const x=nodeStats(state,node),recentCount=recent.filter(n=>n===node).length,accuracy=x.attempts?x.correct/x.attempts:0;
   let score=0;if(!x.attempts)score+=120;if(!x.clean)score+=80;score+=(1-accuracy)*24;score-=Math.min(30,x.attempts*3);score-=recentCount*8;if(node===last&&route.length>1)score-=35;
   return[node,score+Math.random()*.01];
 }).sort((a,b)=>b[1]-a[1])[0][0];
}
function generatedNode(out){return String(out?.subcompetencyId||out?.competencyId||out?.standardRef||'').split('/')[0]}
function tagTarget(out,target){if(!out)return out;out.adaptiveTargetNode=target;out.adaptiveTargetMatched=generatedNode(out)===target;out.kssrYear1AdaptiveVersion=VERSION;return out}

if(integrity?.requirements){
 for(const id of C.activeSkills)integrity.requirements[id]=(C.routes[id]||[]).map(node=>[node]);
 integrity.year1CompetencyVersion=VERSION;
}
function stateEntry(id,node){
 try{
   if(typeof scoreState!=='function')return null;const state=scoreState(id);state.competencies=state.competencies||{};
   return state.competencies[node]||(state.competencies[node]={attempts:0,correct:0,clean:0});
 }catch(_){return null}
}
const priorRecord=window.recordFrontierResponse;
if(typeof priorRecord==='function'&&!priorRecord.__paY1IndependentProof){
 const guarded=function(id,ok,sec,usedHint,question){
   const node=String(question?.subcompetencyId||question?.competencyId||''),entry=String(id).startsWith('D1.')&&node?stateEntry(id,node):null;
   const before=Number(entry?.clean||0),retried=!!window.sess?.retryState,out=priorRecord.apply(this,arguments);
   if(entry&&ok&&retried)entry.clean=before;
   return out;
 };
 guarded.__paY1IndependentProof=true;window.recordFrontierResponse=guarded;
}
banks.d1=function(id,state,shift){
 const target=choosePersistentNode(id,state);if(!target)return prior(id,state,shift);
 const generator=RT.GEN[target];return tagTarget(generator?generator(id,state,shift):prior(id,state,shift),target);
};
window.PAY1Adaptive={version:VERSION,choosePersistentNode,nodeStats};
document.documentElement?.setAttribute('data-kssr-year1-adaptive',VERSION);
})();