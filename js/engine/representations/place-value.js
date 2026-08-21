/* Cikgu Dimensi — R2 Place Value Engine v0.1.
 * Pure base-ten mathematics. DOM/controller code lives in dimensional-view.js.
 */
(function(root){
  'use strict';

  const PLACE_VALUES={THOUSANDS:1000,HUNDREDS:100,TENS:10,ONES:1};
  const LOWER={THOUSANDS:'HUNDREDS',HUNDREDS:'TENS',TENS:'ONES'};

  function safeInt(v){return Number.isInteger(Number(v))&&Number(v)>=0?Number(v):null}
  function normalizeState(state={}){
    const out={};
    for(const key of Object.keys(PLACE_VALUES))out[key]=safeInt(state[key])??0;
    return out;
  }
  function placeValueValue(state){
    const s=normalizeState(state);
    return s.THOUSANDS*1000+s.HUNDREDS*100+s.TENS*10+s.ONES;
  }
  function validatePlaceValueState(state,expectedValue=null){
    if(!state||typeof state!=='object')return{ok:false,error:'INVALID_STATE'};
    for(const key of Object.keys(PLACE_VALUES)){
      const n=safeInt(state[key]);
      if(n===null)return{ok:false,error:'NON_INTEGER_OR_NEGATIVE',column:key};
    }
    const value=placeValueValue(state);
    if(expectedValue!==null&&value!==Number(expectedValue))return{ok:false,error:'VALUE_MISMATCH',value,expectedValue:Number(expectedValue)};
    return{ok:true,value};
  }
  function canExchange(state,from,to){
    const s=normalizeState(state);
    return LOWER[from]===to&&s[from]>=1;
  }
  function exchangeBaseTen(state,from,to,{expectedValue=null}={}){
    const before=normalizeState(state);
    const beforeCheck=validatePlaceValueState(before,expectedValue);
    if(!beforeCheck.ok)return{ok:false,error:beforeCheck.error,state:before};
    if(!canExchange(before,from,to))return{ok:false,error:'EXCHANGE_NOT_ALLOWED',state:before};
    const after={...before};
    after[from]-=1;
    after[to]+=10;
    const afterCheck=validatePlaceValueState(after,beforeCheck.value);
    if(!afterCheck.ok)return{ok:false,error:afterCheck.error,state:before};
    return{ok:true,state:after,beforeValue:beforeCheck.value,afterValue:afterCheck.value,from,to};
  }
  function stateFromNumber(n){
    n=safeInt(n);if(n===null)return null;
    return{
      THOUSANDS:Math.floor(n/1000),
      HUNDREDS:Math.floor(n/100)%10,
      TENS:Math.floor(n/10)%10,
      ONES:n%10
    };
  }
  function onesRegroupRequired(minuend,subtrahend){
    const a=stateFromNumber(minuend),b=stateFromNumber(subtrahend);
    return !!(a&&b&&a.ONES<b.ONES&&a.TENS>0);
  }
  function subtractionScenario(minuend=62,subtrahend=27){
    if(!onesRegroupRequired(minuend,subtrahend))return{ok:false,error:'ONES_REGROUP_NOT_REQUIRED'};
    const before=stateFromNumber(minuend);
    const exchanged=exchangeBaseTen(before,'TENS','ONES',{expectedValue:minuend});
    if(!exchanged.ok)return exchanged;
    const b=stateFromNumber(subtrahend);
    const ones=exchanged.state.ONES-b.ONES;
    const tens=exchanged.state.TENS-b.TENS;
    if(ones<0||tens<0)return{ok:false,error:'UNSUPPORTED_MULTI_REGROUP'};
    return{
      ok:true,minuend,subtrahend,before,afterExchange:exchanged.state,
      onesResult:ones,tensResult:tens,result:minuend-subtrahend,
      invariant:placeValueValue(before)===placeValueValue(exchanged.state)
    };
  }
  function isExpectedSingleTenExchange(before,after){
    const b=normalizeState(before),a=normalizeState(after);
    return a.THOUSANDS===b.THOUSANDS&&a.HUNDREDS===b.HUNDREDS&&a.TENS===b.TENS-1&&a.ONES===b.ONES+10&&placeValueValue(a)===placeValueValue(b);
  }
  function scaleByTen(n,direction='UP'){
    n=safeInt(n);if(n===null)return{ok:false,error:'INVALID_NUMBER'};
    if(direction==='UP'){const result=n*10;return{ok:true,before:n,after:result,factor:10,direction:'UP',beforeState:stateFromNumber(n),afterState:stateFromNumber(result),invariant:result===n*10}}
    if(direction==='DOWN'){if(n%10!==0)return{ok:false,error:'NON_INTEGER_RESULT'};const result=n/10;return{ok:true,before:n,after:result,factor:10,direction:'DOWN',beforeState:stateFromNumber(n),afterState:stateFromNumber(result),invariant:result*10===n}}
    return{ok:false,error:'INVALID_DIRECTION'};
  }
  function digitShiftSummary(n,direction='UP'){
    const scaled=scaleByTen(n,direction);if(!scaled.ok)return scaled;
    const labels=['THOUSANDS','HUNDREDS','TENS','ONES'];
    const before=scaled.beforeState,after=scaled.afterState;
    return{...scaled,moves:labels.map(k=>({column:k,before:before[k],after:after[k]}))};
  }

  root.PAPlaceValueEngine={
    PLACE_VALUES,
    normalizeState,
    placeValueValue,
    validatePlaceValueState,
    canExchange,
    exchangeBaseTen,
    stateFromNumber,
    onesRegroupRequired,
    subtractionScenario,
    isExpectedSingleTenExchange,
    scaleByTen,
    digitShiftSummary
  };
})(typeof window!=='undefined'?window:globalThis);
