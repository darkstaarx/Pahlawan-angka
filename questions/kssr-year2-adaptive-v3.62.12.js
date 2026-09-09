// Pahlawan Angka — Year 2 competency-level adaptive routing v3.62.12
(function(){
'use strict';
const VERSION='3.62.12',banks=window.PAQuestionBanks=window.PAQuestionBanks||{};
const RT=window.PAY2V2Runtime,C=window.PAY2CompetencyV2;
if(!RT||!C)return;
const keys=['d2t1','d2t2','d2t3','d2t4','d2t5','d2t6','d2t7','d2t8'];
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
function tagTarget(out,target){if(!out)return out;out.adaptiveTargetNode=target;out.adaptiveTargetMatched=generatedNode(out)===target;out.kssrYear2AdaptiveVersion=VERSION;return out}
function applyIntegrity(){
 const integrity=window.PAContentIntegrity;if(!integrity?.requirements)return false;
 for(const id of C.activeSkills)integrity.requirements[id]=(C.routes[id]||[]).map(node=>[node]);
 integrity.year2CompetencyVersion=VERSION;return true;
}
function stateEntry(id,node){
 try{
   if(typeof scoreState!=='function')return null;const state=scoreState(id);state.competencies=state.competencies||{};
   return state.competencies[node]||(state.competencies[node]={attempts:0,correct:0,clean:0});
 }catch(_){return null}
}
function installRecordGuard(){
 const priorRecord=window.recordFrontierResponse;
 if(typeof priorRecord!=='function')return false;
 if(priorRecord.__paY2IndependentProof)return true;
 const guarded=function(id,ok,sec,usedHint,question){
   const node=String(question?.subcompetencyId||question?.competencyId||''),isY2=String(id).startsWith('D2.'),entry=isY2&&node?stateEntry(id,node):null;
   const retried=!!window.sess?.retryState;
   if(entry){entry.attempts=Number(entry.attempts||0)+1;if(ok)entry.correct=Number(entry.correct||0)+1;if(ok&&!usedHint&&!retried)entry.clean=Number(entry.clean||0)+1;}
   return priorRecord.apply(this,arguments);
 };
 guarded.__paY2IndependentProof=true;window.recordFrontierResponse=guarded;return true;
}
if(typeof document!=='undefined'){
 if(!applyIntegrity()||!installRecordGuard())document.addEventListener('DOMContentLoaded',()=>{applyIntegrity();installRecordGuard()},{once:true});
}
for(const key of keys){
 const prior=banks[key];if(typeof prior!=='function')continue;
 banks[key]=function(id,state,shift){
   const target=choosePersistentNode(id,state);if(!target)return prior(id,state,shift);
   const generator=RT.GEN[target];return tagTarget(generator?generator(id,state,shift):prior(id,state,shift),target);
 };
}
window.PAY2Adaptive={version:VERSION,choosePersistentNode,nodeStats,applyIntegrity,installRecordGuard};
document.documentElement?.setAttribute('data-kssr-year2-adaptive',VERSION);
})();