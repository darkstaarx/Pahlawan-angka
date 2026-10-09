// Question dispatcher. Loads are split by grade/topic.
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
  q=q || Q("2 + 2 = ?",4,[N(3,"generic"),N(5,"generic"),N(6,"generic")],"Tambah kedua-dua nombor.","Fallback",false,false);
  q=window.PAWrittenArithmetic?.inject?.(q,id,sess)||q;
  q=window.PAGameQuestionInteractions?.prepare?.(q,{skillId:id,state:s,meta:typeof META!=='undefined'?META[id]:null,...interactionContext})||q;
  fp=questionFingerprint(q);
  sess.questionFingerprints.push(fp);
  if(sess.questionFingerprints.length>40)sess.questionFingerprints.shift();
  sess.questionHistory.push({skillId:id,competencyId:q.competencyId||null,subcompetencyId:q.subcompetencyId||null,curriculumNode:q.curriculumNode||null,standardRef:q.standardRef||null,templateId:q.templateId||null,source:q.source||'legacy',archetypeId:q.archetypeId||'legacy',representation:q.representation||'symbolic',demand:q.demand||'procedure',contextId:q.contextId||'general',difficultyBand:q.difficultyBand||2,responseType:q.responseType||'mcq',interactionType:q.interaction?.type||null,battleTier:q.responseBattleTier||interactionContext.battleTier||null,fingerprint:fp});
  if(sess.questionHistory.length>60)sess.questionHistory.shift();
  return q;
}
