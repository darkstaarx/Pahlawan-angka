// Pahlawan Angka — Year 2 Curriculum Bank v2 finalizer v3.62.12
(function(){
'use strict';
const VERSION='3.62.12',banks=window.PAQuestionBanks=window.PAQuestionBanks||{};
const RT=window.PAY2V2Runtime,C=window.PAY2CompetencyV2;
if(!RT||!C)return;
const {GEN,chooseNode}=RT;
const keys=['d2t1','d2t2','d2t3','d2t4','d2t5','d2t6','d2t7','d2t8'];
function tagFallback(out,node){
 if(!out)return out;
 const fallback=String(out.standardRef||node||'').split('/')[0]||node,meta=C.byId[fallback];
 out.subcompetencyId=fallback;out.curriculumNode=fallback;out.competencyId=fallback;out.standardRef=fallback;
 out.curriculumUnit=meta?.unit;out.curriculumUnitTitle=meta?.unitTitle;out.competencyTitle=meta?.title;
 out.kssrYear2V2Version=VERSION;
 return out;
}
for(const key of keys){
 const prior=banks[key];if(typeof prior!=='function')continue;
 banks[key]=function(id,s,shift){
   const node=chooseNode(id),fn=node&&GEN[node];
   return tagFallback(fn?fn(id,s,shift):prior(id,s,shift),node);
 };
}
window.PAY2CurriculumV2={version:VERSION,competencies:C,generatorCount:Object.keys(GEN).length,bankKeys:keys};
document.documentElement?.setAttribute('data-kssr-year2-curriculum-v2',VERSION);
})();