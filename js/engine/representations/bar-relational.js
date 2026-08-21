/* Cikgu Dimensi — R6 Bar / Relational Engine v0.2. */
(function(root){
  'use strict';
  const num=n=>Number.isFinite(Number(n))?Number(n):null;
  function comparison({smaller,more,larger}={}){
    smaller=num(smaller);more=num(more);larger=num(larger);
    const known=[smaller,more,larger].filter(v=>v!==null).length;if(known<2)return{ok:false,error:'NEED_TWO_VALUES'};
    if(larger===null)larger=smaller+more;else if(smaller===null)smaller=larger-more;else if(more===null)more=larger-smaller;
    if(smaller<0||more<0||Math.abs(smaller+more-larger)>1e-9)return{ok:false,error:'INCONSISTENT'};
    return{ok:true,smaller,more,larger,relation:'COMPARISON',invariant:smaller+more===larger};
  }
  function partWhole({partA,partB,total}={}){
    partA=num(partA);partB=num(partB);total=num(total);const known=[partA,partB,total].filter(v=>v!==null).length;if(known<2)return{ok:false,error:'NEED_TWO_VALUES'};
    if(total===null)total=partA+partB;else if(partA===null)partA=total-partB;else if(partB===null)partB=total-partA;
    if(partA<0||partB<0||Math.abs(partA+partB-total)>1e-9)return{ok:false,error:'INCONSISTENT'};
    return{ok:true,partA,partB,total,relation:'PART_WHOLE',invariant:partA+partB===total};
  }
  function operationFor(model,unknown){
    if(!model?.ok)return null;
    if(model.relation==='COMPARISON')return unknown==='larger'?'ADD':(unknown==='smaller'||unknown==='more'?'SUBTRACT':null);
    if(model.relation==='PART_WHOLE')return unknown==='total'?'ADD':(unknown==='partA'||unknown==='partB'?'SUBTRACT':null);
    return null;
  }
  root.PABarRelationalEngine={comparison,partWhole,operationFor};
})(typeof window!=='undefined'?window:globalThis);
