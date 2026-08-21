/* Cikgu Dimensi — R3 Number Line Engine v0.2. Pure distance / position helpers. */
(function(root){
  'use strict';
  function safe(n){n=Number(n);return Number.isFinite(n)?n:null}
  function fractionPosition(n,d){n=safe(n);d=safe(d);if(n===null||d===null||d===0)return null;return n/d}
  function nextLandmark(n,target){
    n=safe(n);target=safe(target);if(n===null||target===null||n>=target)return target;
    const gaps=[10,100,1000];
    for(const base of gaps){const next=Math.ceil((n+1)/base)*base;if(next>n&&next<target)return next}
    return target;
  }
  function countUp(from,to){
    from=safe(from);to=safe(to);if(from===null||to===null||to<from)return{ok:false,error:'INVALID_RANGE'};
    const points=[from];let cur=from,guard=0;
    while(cur<to&&guard++<8){const next=nextLandmark(cur,to);if(next<=cur)break;points.push(next);cur=next}
    if(points.at(-1)!==to)points.push(to);
    const jumps=points.slice(1).map((p,i)=>({from:points[i],to:p,delta:p-points[i]}));
    return{ok:true,from,to,points,jumps,difference:to-from,invariant:jumps.reduce((s,j)=>s+j.delta,0)===to-from};
  }
  function samePosition(fractions){
    const vals=(fractions||[]).map(f=>fractionPosition(f.n,f.d));
    return vals.length>1&&vals.every(v=>Math.abs(v-vals[0])<1e-12);
  }
  root.PANumberLineEngine={fractionPosition,countUp,samePosition,nextLandmark};
})(typeof window!=='undefined'?window:globalThis);
