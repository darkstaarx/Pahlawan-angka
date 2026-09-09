// Lightweight production smoke guard for Year 2 v2. No learner state is changed.
(function(){
'use strict';
const VERSION='3.62.12',C=window.PAY2CompetencyV2,RT=window.PAY2V2Runtime,errors=[];
if(!C||!RT){window.PAY2Smoke={version:VERSION,status:'FAIL',errors:['runtime missing']};return;}
const oldSess=window.sess;
try{
 for(const node of C.nodes){
   try{
     window.sess={...(oldSess||{}),questionHistory:[],questionFingerprints:[]};
     const out=RT.GEN[node.id]?.(node.owner,{mastery:70,evidence:6,confidence:70,wrong:0},false);
     if(!out)errors.push(node.id+': null');
     else if(out.standardRef!==node.id||out.competencyId!==node.id)errors.push(node.id+': metadata');
     else if(!Array.isArray(out.wrong)||out.wrong.length!==3)errors.push(node.id+': choices');
   }catch(e){errors.push(node.id+': '+String(e?.message||e));}
 }
}finally{window.sess=oldSess;}
const status=errors.length?'FAIL':'PASS';window.PAY2Smoke={version:VERSION,status,standards:C.uniqueStandardCount,generators:Object.keys(RT.GEN).length,errors};
document.documentElement?.setAttribute('data-y2-v2-smoke',status.toLowerCase());
if(errors.length)console.error('Year 2 v2 smoke failed',errors);
})();