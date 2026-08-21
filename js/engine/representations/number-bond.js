/* Cikgu Dimensi — R5 Number Bond / Decomposition Engine v0.2. */
(function(root){
  'use strict';
  const int=n=>Number.isInteger(Number(n))?Number(n):null;
  function bond(total,part){total=int(total);part=int(part);if(total===null||part===null||part<0||part>total)return{ok:false,error:'INVALID_BOND'};return{ok:true,total,parts:[part,total-part],invariant:part+(total-part)===total}}
  function makeTen(a,b){a=int(a);b=int(b);if(a===null||b===null||a<0||b<0)return{ok:false,error:'INVALID'};const next=Math.ceil((a+1)/10)*10,needed=next-a;if(needed<=0||needed>b)return{ok:false,error:'NO_USEFUL_TEN'};return{ok:true,a,b,target:next,transfer:needed,remainder:b-needed,result:a+b,invariant:next+(b-needed)===a+b}}
  function makeBase(a,b,base=10){a=int(a);b=int(b);base=int(base);if(a===null||b===null||!base)return{ok:false,error:'INVALID'};const target=Math.ceil((a+1)/base)*base,transfer=target-a;if(transfer<=0||transfer>b)return{ok:false,error:'NO_USEFUL_BASE'};return{ok:true,a,b,base,target,transfer,remainder:b-transfer,result:a+b,invariant:target+b-transfer===a+b}}
  function compensationAdd(a,b,base=10){a=int(a);b=int(b);base=int(base);if(a===null||b===null||!base)return{ok:false,error:'INVALID'};const rounded=Math.round(a/base)*base;const adjustment=rounded-a;if(Math.abs(adjustment)>Math.max(5,base/2))return{ok:false,error:'POOR_COMPENSATION'};return{ok:true,a,b,rounded,adjustment,easy:rounded+b,result:a+b,final:(rounded+b)-adjustment,invariant:(rounded+b)-adjustment===a+b}}
  root.PANumberBondEngine={bond,makeTen,makeBase,compensationAdd};
})(typeof window!=='undefined'?window:globalThis);
