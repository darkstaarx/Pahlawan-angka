/* Cikgu Dimensi — R4 Fraction Area Engine v0.2. Pure fraction invariants. */
(function(root){
  'use strict';
  const gcd=(a,b)=>{a=Math.abs(Number(a));b=Math.abs(Number(b));while(b){const t=b;b=a%b;a=t}return a||1};
  function fraction(n,d){n=Number(n);d=Number(d);if(!Number.isInteger(n)||!Number.isInteger(d)||d<=0||n<0||n>d)return null;return{n,d}}
  function reduce(f){f=fraction(f?.n,f?.d);if(!f)return null;const g=gcd(f.n,f.d);return{n:f.n/g,d:f.d/g}}
  function value(f){f=fraction(f?.n,f?.d);return f?f.n/f.d:NaN}
  function equivalent(a,b){a=fraction(a?.n,a?.d);b=fraction(b?.n,b?.d);return!!(a&&b&&a.n*b.d===b.n*a.d)}
  function subdivide(f,factor){f=fraction(f?.n,f?.d);factor=Number(factor);if(!f||!Number.isInteger(factor)||factor<2)return{ok:false,error:'INVALID_FACTOR'};const after={n:f.n*factor,d:f.d*factor};return{ok:true,before:f,after,invariant:equivalent(f,after)}}
  function sameWholeSelection(f,parts){f=fraction(f?.n,f?.d);if(!f||!Number.isInteger(parts)||parts<1)return null;return Array.from({length:f.d},(_,i)=>({selected:i<f.n,subparts:parts}))}
  function position(f){f=fraction(f?.n,f?.d);return f?f.n/f.d:null}
  root.PAFractionAreaEngine={fraction,reduce,value,equivalent,subdivide,sameWholeSelection,position};
})(typeof window!=='undefined'?window:globalThis);
