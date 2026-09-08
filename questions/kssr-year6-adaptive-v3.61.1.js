// Pahlawan Angka — Year 6 competency-level adaptive routing v3.61.1
// Makes the 38 curriculum nodes operational: persistent evidence now drives
// question selection and the mastery gate uses the same SP identifiers.
(function(){
'use strict';
const VERSION='3.61.1',banks=window.PAQuestionBanks=window.PAQuestionBanks||{};
const prior=banks.d6,RT=window.PAY6V2Runtime,C=window.PAY6CompetencyV2,integrity=window.PAContentIntegrity;
if(typeof prior!=='function'||!RT||!C)return;

function recentNodes(id){
 return (RT.recentFor?.(id)||[]).map(x=>x.subcompetencyId||x.competencyId||x.curriculumNode||String(x.standardRef||'').split('/')[0]).filter(Boolean);
}
function nodeStats(state,node){
 const x=state?.competencies?.[node]||{};
 return{attempts:Number(x.attempts||0),correct:Number(x.correct||0),clean:Number(x.clean||0)};
}
function choosePersistentNode(id,state){
 const route=C.routes[id]||[];if(!route.length)return null;
 const recent=recentNodes(id),last=recent.at(-1);
 return route.map(node=>{
   const x=nodeStats(state,node),recentCount=recent.filter(n=>n===node).length;
   const accuracy=x.attempts?x.correct/x.attempts:0;
   let score=0;
   if(!x.attempts)score+=120;
   if(!x.clean)score+=80;
   score+=(1-accuracy)*24;
   score-=Math.min(30,x.attempts*3);
   score-=recentCount*8;
   if(node===last&&route.length>1)score-=35;
   return[node,score+Math.random()*.01];
 }).sort((a,b)=>b[1]-a[1])[0][0];
}
function moneyStateFor(node,state){
 const base={...(state||{})};
 if(node==='3.1.1'||node==='3.2.1'||node==='3.2.2')return{...base,mastery:15,evidence:2,confidence:20,wrong:1};
 if(node==='3.1.2'||(node==='3.3.1'&&RT.stage(base)===1))return{...base,mastery:55,evidence:4,confidence:55,wrong:0};
 return base;
}
function generatedNode(out){return String(out?.subcompetencyId||out?.competencyId||out?.standardRef||'').split('/')[0]}
function targetMoney(id,state,shift,target){
 // Money v3.60.5 is kept intact. Its stage-specific bank is sampled until the
 // least-proven SP is reached; conceptual SPs deliberately use the low band.
 const targetState=moneyStateFor(target,state);let fallback=null;
 for(let i=0;i<96;i++){
   const out=prior(id,targetState,shift);fallback=fallback||out;
   if(generatedNode(out)===target)return out;
 }
 return fallback||prior(id,state,shift);
}
function tagTarget(out,target){
 if(!out)return out;
 out.adaptiveTargetNode=target;
 out.adaptiveTargetMatched=generatedNode(out)===target;
 out.kssrYear6AdaptiveVersion=VERSION;
 return out;
}

// The integrity guard keeps a live reference to this object, so replacing the
// D6 entries here also updates frontier, stretch and parent mastery decisions.
if(integrity?.requirements){
 for(const id of C.activeSkills)integrity.requirements[id]=(C.routes[id]||[]).map(node=>[node]);
 integrity.year6CompetencyVersion=VERSION;
}

// A correct retry is useful learning evidence, but it is not independent
// proof for unlocking a curriculum node. The legacy recorder only knew about
// hint use, so preserve its counters while undoing the misleading clean tick.
const priorRecord=window.recordFrontierResponse;
if(typeof priorRecord==='function'&&!priorRecord.__paY6IndependentProof){
 const guardedRecord=function(id,ok,sec,usedHint,question){
   const node=String(question?.subcompetencyId||question?.competencyId||'');
   const entry=String(id).startsWith('D6.')&&node?stateEntry(id,node):null;
   const before=Number(entry?.clean||0),retried=!!window.sess?.retryState;
   const out=priorRecord.apply(this,arguments);
   if(entry&&ok&&retried)entry.clean=before;
   return out;
 };
 guardedRecord.__paY6IndependentProof=true;
 window.recordFrontierResponse=guardedRecord;
}

function stateEntry(id,node){
 try{
   if(typeof scoreState!=='function')return null;
   const state=scoreState(id);state.competencies=state.competencies||{};
   return state.competencies[node]||(state.competencies[node]={attempts:0,correct:0,clean:0});
 }catch(_){return null}
}

banks.d6=function(id,state,shift){
 if(id==='D6.AREA'||id==='D6.DATA')return null;
 const target=choosePersistentNode(id,state);
 if(!target)return prior(id,state,shift);
 if(id==='D6.MONEY')return tagTarget(targetMoney(id,state,shift,target),target);
 const generator=RT.GEN[target];
 return tagTarget(generator?generator(id,state,shift):prior(id,state,shift),target);
};

window.PAY6Adaptive={version:VERSION,choosePersistentNode,nodeStats};
document.documentElement?.setAttribute('data-kssr-year6-adaptive',VERSION);
})();
