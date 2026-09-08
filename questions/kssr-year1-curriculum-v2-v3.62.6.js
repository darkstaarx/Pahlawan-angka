// Pahlawan Angka — Year 1 Curriculum Bank v2 finalizer v3.62.6
(function(){
'use strict';
const VERSION='3.62.6',banks=window.PAQuestionBanks=window.PAQuestionBanks||{},prior=banks.d1;
const RT=window.PAY1V2Runtime,C=window.PAY1CompetencyV2;
if(typeof prior!=='function'||!RT||!C)return;
const {GEN,chooseNode}=RT;
function tagFallback(out,node){
 if(!out)return out;
 const fallback=String(out.standardRef||node||'').split('/')[0]||node,meta=C.byId[fallback];
 out.subcompetencyId=fallback;out.curriculumNode=fallback;out.competencyId=fallback;
 out.curriculumUnit=meta?.unit;out.curriculumUnitTitle=meta?.unitTitle;out.competencyTitle=meta?.title;
 out.kssrYear1V2Version=VERSION;
 return out;
}
banks.d1=function(id,s,shift){
 const node=chooseNode(id),fn=node&&GEN[node];
 return tagFallback(fn?fn(id,s,shift):prior(id,s,shift),node);
};
window.PAY1CurriculumV2={version:VERSION,competencies:C,generatorCount:Object.keys(GEN).length};
document.documentElement?.setAttribute('data-kssr-year1-curriculum-v2',VERSION);
})();