// Pahlawan Angka — Year 6 Curriculum Bank v2 finalizer v3.61.0
// Loaded after the competency map, runtime and Unit 1/2/4/5/6/7/8 banks.
// Money v3.60.5 remains the benchmark bank and is tagged into the 38-node layer.
(function(){
'use strict';
const VERSION='3.61.0',banks=window.PAQuestionBanks=window.PAQuestionBanks||{},prior=banks.d6;
const RT=window.PAY6V2Runtime,C=window.PAY6CompetencyV2;
if(typeof prior!=='function'||!RT||!C)return;
const {GEN,chooseNode}=RT;
function tagMoney(out){
 if(!out)return out;
 let node=String(out.standardRef||'3.3.1').split('/')[0];
 if(!C.byId[node]||C.byId[node].unit!==3)node='3.3.1';
 const meta=C.byId[node];
 out.subcompetencyId=node;out.curriculumNode=node;out.competencyId=node;
 out.curriculumUnit=3;out.curriculumUnitTitle=C.units[3];out.competencyTitle=meta?.title||'Wang';
 out.kssrYear6V2Version=VERSION;
 return out;
}
banks.d6=function(id,s,shift){
 if(id==='D6.AREA'||id==='D6.DATA')return null;
 if(id==='D6.MONEY')return tagMoney(prior(id,s,shift));
 const node=chooseNode(id),fn=node&&GEN[node];
 const out=fn?fn(id,s,shift):prior(id,s,shift);
 if(out&&!out.kssrYear6V2Version){
   const fallback=String(out.standardRef||node||'').split('/')[0]||node;
   const meta=C.byId[fallback];
   out.subcompetencyId=fallback;out.curriculumNode=fallback;out.competencyId=fallback;
   out.curriculumUnit=meta?.unit;out.curriculumUnitTitle=meta?.unitTitle;out.competencyTitle=meta?.title;
   out.kssrYear6V2Version=VERSION;
 }
 return out;
};
window.PAY6CurriculumV2={version:VERSION,competencies:C,generatorCount:Object.keys(GEN).length};
document.documentElement?.setAttribute('data-kssr-year6-curriculum-v2',VERSION);
})();