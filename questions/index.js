// Question dispatcher. Loads are split by grade/topic.

// v3.86.32 — answer-option integrity for every grade, plus KSSR/UASA digit
// grouping (7 050 410, 6 000, RM1 302) for Darjah 6. A pupil must never see two
// identical choices, and the correct answer must never reappear as a wrong one.
const PAOptionIntegrity=(function(){
 const VERSION='3.86.32';
 const strip=v=>String(v??'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ');
 // Only digit-group separators are ignored (1 250 000 = 1,250,000 = 1250000). Other spaces are
 // meaningful: "1 1/4" (mixed number) and "11/4" (improper fraction) are different answers.
 const key=v=>strip(v).trim().replace(/\s+/g,' ').replace(/(\d)[ ,](?=\d{3}(?!\d|\/))/g,'$1').replace(/−/g,'-').toLowerCase();
 const labelOf=o=>o&&typeof o==='object'?(o.label??o.v):o;
 // RM prefix, a number (digits may be grouped by spaces/commas), an optional short unit.
 const NUMERIC=/^(RM)?\s*(-?\d+(?:[ ,]\d{3})*(?:\.\d+)?)(\s*)([A-Za-z%°²³]{1,4})?$/i;
 function parseNumeric(v){
  const m=strip(v).replace(/\s+/g,' ').trim().match(NUMERIC);if(!m)return null;
  const raw=m[2].replace(/[ ,]/g,''),n=Number(raw);
  if(!Number.isFinite(n))return null;
  return{prefix:m[1]||'',n,dp:(raw.split('.')[1]||'').length,suffix:m[4]?m[3]+m[4]:''};
 }
 function isNegative(v){return /^\s*[-−]\s*\d/.test(strip(v))}
 function nearValues(spec){
  const mag=Math.abs(spec.n);
  const step=spec.prefix?(mag>=100?10:1):spec.dp>0?Math.pow(10,-spec.dp)*(spec.dp>=2?10:1):(mag>=100000?Math.pow(10,String(Math.round(mag)).length-2):mag>=100?10:1);
  const out=[];
  [1,-1,2,-2,3,-3,5,-5].forEach(k=>{const v=Number((spec.n+k*step).toFixed(spec.dp));if(v>=0&&v!==spec.n)out.push(spec.prefix+(spec.dp?v.toFixed(spec.dp):String(v))+spec.suffix)});
  return out;
 }
 // Remove duplicates, answer echoes and impossible negatives; refill from the
 // answer's own numeric shape so the question keeps its usual number of choices.
 function sanitize(q){
  if(!q||!Array.isArray(q.wrong))return q;
  const answerKey=key(q.answer),answerNum=parseNumeric(q.answer),seen=new Set([answerKey]),kept=[];
  let changed=false;
  for(const o of q.wrong){
   const k=key(labelOf(o));
   if(!k||seen.has(k)||(answerNum&&answerNum.n>=0&&isNegative(labelOf(o)))){changed=true;continue}
   seen.add(k);kept.push(o);
  }
  if(!changed)return q;
  const target=Math.min(3,q.wrong.length);
  if(answerNum&&kept.length<target){
   for(const v of nearValues(answerNum)){
    if(kept.length>=target)break;
    const k=key(v);if(seen.has(k))continue;seen.add(k);
    kept.push({v,label:v,tag:'near_value'});
   }
  }
  return Object.assign({},q,{wrong:kept,optionIntegrity:VERSION});
 }
 const group=d=>d.replace(/\B(?=(\d{3})+(?!\d))/g,' ');
 function groupText(str){
  return String(str).split(/(<[^>]*>)/).map(seg=>seg.startsWith('<')?seg:seg
   .replace(/RM(\d{4,})(?=[.\s]|$|[^\d:\/])/g,(m,d)=>'RM'+group(d))
   .replace(/(^|[^\d.,:\/A-Za-z])(\d{1,3}(?:,\d{3})+|\d{4,})(?![\d:\/]|,\d)/g,(m,pre,num)=>pre+group(num.replace(/,/g,'')))
  ).join('');
 }
 // Bare arithmetic prompts are parsed by the written-column renderer; leave them as typed.
 const bareExpression=p=>/^[\d\s.,()+\-−×÷=?□\/]+$/.test(strip(p).trim());
 function groupDigits(q,skillId){
  if(!q||!/^D6\./.test(String(skillId||'')))return q;
  if(bareExpression(q.prompt))return q;
  const out=Object.assign({},q);
  if(typeof out.prompt==='string')out.prompt=groupText(out.prompt);
  if(typeof out.hint==='string')out.hint=groupText(out.hint);
  if(typeof out.answer==='number'&&Number.isInteger(out.answer)&&Math.abs(out.answer)>=1000)out.answer=group(String(out.answer));
  else if(typeof out.answer==='string')out.answer=groupText(out.answer);
  if(Array.isArray(out.wrong))out.wrong=out.wrong.map(o=>{
   if(!o||typeof o!=='object')return o;
   const label=labelOf(o),formatted=typeof label==='number'&&Number.isInteger(label)&&Math.abs(label)>=1000?group(String(label)):typeof label==='string'?groupText(label):label;
   return formatted===label?o:Object.assign({},o,{label:formatted});
  });
  return out;
 }
 return{version:VERSION,sanitize,groupDigits,groupText,key};
})();
window.PAOptionIntegrity=PAOptionIntegrity;

function questionFingerprint(q){
  const raw=String(q?.prompt||'')+'|'+String(q?.answer??'');
  // Keep visual markup in the fingerprint: two questions with different charts/clocks/rulers are not the same question.
  return raw.replace(/\s+/g,' ').trim().toLowerCase();
}
function questionBankFor(id){
  if(id.startsWith("D1.")) return window.PAQuestionBanks.d1;
  if(id.startsWith("D3.")) return window.PAQuestionBanks.d3;
  if(id.startsWith("D4.")) return window.PAQuestionBanks.d4;
  if(id.startsWith("D5.")) return window.PAQuestionBanks.d5;
  if(id.startsWith("D6.")) return window.PAQuestionBanks.d6;
  const m=id.match(/^D2\.(\d+)\./);
  return m ? window.PAQuestionBanks["d2t"+m[1]] : null;
}
// Prefer on-grade depth after independent mastery evidence. Retain a retrieval
// question every fifth encounter and preserve the first selected curriculum node.
function questionDepthTarget(id,state){
 const h=(sess.questionHistory||[]).filter(x=>x.skillId===id);
 if(sess.mode==='recover'||sess.mode==='teach'||Number(state?.mastery)<35)return 1;
 if(Number(state?.evidence)<3)return 2;
 if(Number(state?.mastery)>=70&&Number(state?.confidence)>=55)return h.length%5===4?2:4;
 return Number(state?.mastery)>=50?3:2;
}
function questionDemandLevel(q){return ({foundation:1,concept:1,procedure:2,application:3,reasoning:4,transfer:4})[q?.demand]||2}
function questionSelectionScore(q,target,recent,last){
 const level=questionDemandLevel(q);
 return Math.abs(level-target)*10+(recent.has(questionFingerprint(q))?80:0)
   +(last&&last.archetypeId===q.archetypeId?20:0);
}
function generate(id,s,interactionContext={}){
  let shift = s.evidence>=2 && (s.confidence+15<s.mastery || s.correct>=3 && s.wrong===0) && Math.random()<.45;
  const bank=questionBankFor(id);
  let q=null,fp='';
  if(!sess.questionFingerprints)sess.questionFingerprints=[];
  if(!sess.questionHistory)sess.questionHistory=[];
  const recent=new Set(sess.questionFingerprints.slice(-18));

  const attempts=(sess.mode==='confirm'?8:16);
  const v2Bridge=window.PAQuestionSystemV2Bridge;
  if(v2Bridge&&typeof v2Bridge.tryGenerate==='function'){
    try{
      q=v2Bridge.tryGenerate(id,s,{history:sess.questionHistory,recentFingerprints:sess.questionFingerprints,stateRoot:(typeof db!=='undefined'?db:null)});
    }catch(_){q=null}
  }
  if(!q){
    const target=questionDepthTarget(id,s),last=sess.questionHistory.filter(x=>x.skillId===id).at(-1);
    let best=null,bestScore=Infinity,node=null;
    for(let i=0;i<attempts;i++){
      const candidate=bank ? bank(id,s,shift || i>7) : null;
      if(!candidate)break;
      const candidateNode=candidate.subcompetencyId||candidate.curriculumNode||null;
      if(i===0)node=candidateNode;
      // A narrow learning standard may legitimately have only basic tasks;
      // do not silently replace it with a different standard to inflate difficulty.
      if(node&&candidateNode!==node)continue;
      const score=questionSelectionScore(candidate,target,recent,last);
      if(score<bestScore){best=candidate;bestScore=score;}
      if(score===0)break;
    }
    q=best;
  }
  // A focused run must never substitute an unrelated arithmetic question.
  if(!q&&interactionContext.strictSkill)return null;
  q=q || Q("2 + 2 = ?",4,[N(3,"generic"),N(5,"generic"),N(6,"generic")],"Tambah kedua-dua nombor.","Fallback",false,false);
  q=PAOptionIntegrity.sanitize(q);
  q=window.PAWrittenArithmetic?.inject?.(q,id,sess)||q;
  q=window.PAGameQuestionInteractions?.prepare?.(q,{skillId:id,state:s,meta:typeof META!=='undefined'?META[id]:null,...interactionContext})||q;
  // Grouping runs after prepare(): typed-answer specs keep the plain numeric value.
  q=PAOptionIntegrity.groupDigits(q,id);
  fp=questionFingerprint(q);
  sess.questionFingerprints.push(fp);
  if(sess.questionFingerprints.length>40)sess.questionFingerprints.shift();
  sess.questionHistory.push({skillId:id,competencyId:q.competencyId||null,subcompetencyId:q.subcompetencyId||null,curriculumNode:q.curriculumNode||null,standardRef:q.standardRef||null,templateId:q.templateId||null,source:q.source||'legacy',archetypeId:q.archetypeId||'legacy',representation:q.representation||'symbolic',demand:q.demand||'procedure',contextId:q.contextId||'general',difficultyBand:q.difficultyBand||2,responseType:q.responseType||'mcq',interactionType:q.interaction?.type||null,battleTier:q.responseBattleTier||interactionContext.battleTier||null,fingerprint:fp});
  if(sess.questionHistory.length>60)sess.questionHistory.shift();
  return q;
}

