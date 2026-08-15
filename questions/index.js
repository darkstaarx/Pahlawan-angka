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
function generate(id,s){
  let shift = s.evidence>=2 && (s.confidence+15<s.mastery || s.correct>=3 && s.wrong===0) && Math.random()<.45;
  const bank=questionBankFor(id);
  let q=null,fp='';
  if(!sess.questionFingerprints)sess.questionFingerprints=[];
  if(!sess.questionHistory)sess.questionHistory=[];
  const recent=new Set(sess.questionFingerprints.slice(-18));
  const recentArchetypes=sess.questionHistory.filter(x=>x.skillId===id).slice(-2).map(x=>x.archetypeId);
  const attempts=(sess.mode==='confirm'?8:16);
  for(let i=0;i<attempts;i++){
    q=bank ? bank(id,s,shift || i>7) : null;
    if(!q)break;
    fp=questionFingerprint(q);
    const repeatedArchetype=recentArchetypes.length&&recentArchetypes.at(-1)===(q.archetypeId||'legacy');
    if(!recent.has(fp)&&(!repeatedArchetype||i===attempts-1))break;
  }
  q=q || Q("2 + 2 = ?",4,[N(3,"generic"),N(5,"generic"),N(6,"generic")],"Tambah kedua-dua nombor.","Fallback",false,false);
  fp=questionFingerprint(q);
  sess.questionFingerprints.push(fp);
  if(sess.questionFingerprints.length>40)sess.questionFingerprints.shift();
  sess.questionHistory.push({skillId:id,archetypeId:q.archetypeId||'legacy',representation:q.representation||'symbolic',demand:q.demand||'procedure',contextId:q.contextId||'general',difficultyBand:q.difficultyBand||2,fingerprint:fp});
  if(sess.questionHistory.length>60)sess.questionHistory.shift();
  return q;
}
