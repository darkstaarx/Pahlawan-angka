/* Cikgu Dimensi — R1/R4 Grouping + Array Engine v0.2. */
(function(root){
  'use strict';
  const int=n=>Number.isInteger(Number(n))&&Number(n)>=0?Number(n):null;
  function sharing(total,recipients){total=int(total);recipients=int(recipients);if(total===null||!recipients)return{ok:false,error:'INVALID'};return{ok:true,total,divisor:recipients,quotient:Math.floor(total/recipients),remainder:total%recipients,meaning:'SHARING'}}
  function grouping(total,groupSize){total=int(total);groupSize=int(groupSize);if(total===null||!groupSize)return{ok:false,error:'INVALID'};return{ok:true,total,divisor:groupSize,quotient:Math.floor(total/groupSize),remainder:total%groupSize,meaning:'GROUPING'}}
  function sameEquation(a,b){return!!(a?.ok&&b?.ok&&a.total===b.total&&a.divisor===b.divisor&&a.quotient===b.quotient&&a.remainder===b.remainder)}
  function product(rows,cols){rows=int(rows);cols=int(cols);return rows===null||cols===null?null:rows*cols}
  function splitArray(rows,cols,leftCols){rows=int(rows);cols=int(cols);leftCols=int(leftCols);if(rows===null||cols===null||leftCols===null||leftCols<=0||leftCols>=cols)return{ok:false,error:'INVALID_SPLIT'};const rightCols=cols-leftCols,left=rows*leftCols,right=rows*rightCols,total=rows*cols;return{ok:true,rows,cols,leftCols,rightCols,left,right,total,invariant:left+right===total}}
  function suggestSplit(rows,cols,known=[2,5,10]){rows=int(rows);cols=int(cols);if(rows===null||cols===null||cols<2)return null;const candidates=[];for(let a=1;a<cols;a++){const b=cols-a;let score=0;if(known.includes(a))score+=4;if(known.includes(b))score+=3;if(a===5||b===5)score+=2;candidates.push({a,b,score})}candidates.sort((x,y)=>y.score-x.score||Math.abs(x.a-x.b)-Math.abs(y.a-y.b));return candidates[0]||null}
  root.PAGroupingArrayEngine={sharing,grouping,sameEquation,product,splitArray,suggestSplit};
})(typeof window!=='undefined'?window:globalThis);
