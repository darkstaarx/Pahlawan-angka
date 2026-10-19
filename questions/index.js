// Question dispatcher. Loads are split by grade/topic.

// v3.86.32 — answer-option integrity for every grade, plus KSSR/UASA digit
// grouping (7 050 410, 6 000, RM1 302) for Darjah 4 to 6. A pupil must never see two
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
 // Text inside <span data-no-group> (years such as 2024) is left as written.
 function groupText(str){
  let keep=false;
  return String(str).split(/(<[^>]*>)/).map(seg=>{if(seg.startsWith('<')){keep=/^<span\b[^>]*\bdata-no-group\b/.test(seg);return seg}return keep?seg:seg
   .replace(/RM(\d{4,})(?=[.\s]|$|[^\d:\/])/g,(m,d)=>'RM'+group(d))
   // "jam 1530" is a 24-hour clock reading, not a quantity: never group it.
   .replace(/(^|[^\d.,:\/A-Za-z])(?<!jam )(\d{1,3}(?:,\d{3})+|\d{4,})(?![\d:\/]|,\d)/g,(m,pre,num)=>pre+group(num.replace(/,/g,'')))}
  ).join('');
 }
 // Bare arithmetic prompts are grouped too (91 368 ÷ 8 = ?, as in UASA papers); the written-column renderer
 // reads grouped operands and answers.
 function groupDigits(q,skillId){
  if(!q||!/^D[4-6]\./.test(String(skillId||'')))return q;
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
 // Darjah 1–2: Q() fills missing choices with generic values (110, 12, "13" beside betul/salah).
 // Replace those fillers with choices a seven-year-old would actually consider.
 function refineYoung(q,skillId){
  const g=(String(skillId||'').match(/^D([12])\./)||[])[1];if(!q||!g||!Array.isArray(q.wrong))return q;
  const MAX=g==='1'?100:1000; // Tahun 1 hingga 100, Tahun 2 hingga 1 000
  const ans=strip(q.answer).trim(),n=/^\d+$/.test(ans)?Number(ans):null;
  // Year 1 works with numbers up to 100: a choice above 100 is replaced as well.
  const replace=o=>o&&(o.tag==='generated'||(n!==null&&n<=MAX&&/^\d+$/.test(strip(labelOf(o)).trim())&&Number(strip(labelOf(o)))>MAX));
  if(!q.wrong.some(replace))return q;
  const seen=new Set([key(ans),...q.wrong.filter(o=>!replace(o)).map(o=>key(labelOf(o)))]);
  let pool=[];
  const sen=ans.match(/^(\d+) sen$/),rm=ans.match(/^RM(\d+(?:\.\d{2})?)$/),list=ans.match(/^\d+(?:, \d+)+$/);
  const W1=window.PAY1V2Runtime&&window.PAY1V2Runtime.words,W2=typeof numWords==='function'?numWords:null;
  let W=null,wordN;for(const f of [W1,W2]){if(!f)continue;const hit=Array.from({length:MAX+1},(_,i)=>i).find(i=>{try{return String(f(i))===ans}catch(e){return false}});if(hit!==undefined){W=f;wordN=hit;break}}
  if(list){const xs=ans.split(', ');const perm=[];const go=(a,rest)=>{if(!rest.length){perm.push(a.join(', '));return}rest.forEach((x,i)=>go([...a,x],rest.filter((_,j)=>j!==i)))};go([],xs);pool=perm.filter(v=>v!==ans).sort(()=>Math.random()-.5)}
  else if(wordN!==undefined)pool=[wordN+1,wordN-1,wordN+10,wordN-10].filter(v=>v>=0&&v<=MAX).map(v=>String(W(v)));
  else if(/^\d{1,2}:\d{2}( [a-z ]+)?$/.test(ans)){const[,hh,mm,suf]=ans.match(/^(\d{1,2}):(\d{2})( [a-z ]+)?$/);const t=Number(hh)*60+Number(mm);pool=[t+5,t-5,t+15,t-15,t+60].filter(x=>x>=60&&x<13*60).map(x=>Math.floor(x/60)+':'+String(x%60).padStart(2,'0')+(suf||''))}
  else if(/^\d+\/\d+$/.test(ans)){const val=f=>{const[a,b]=f.split('/').map(Number);return a/b};const all=[...seen].filter(x=>/^\d+\/\d+$/.test(x)).map(val).concat(val(ans));const[an,ad]=ans.split('/').map(Number);pool=[...new Set([`${an+1}/${ad}`,`${an-1}/${ad}`,`${an+2}/${ad}`,`${an-2}/${ad}`,'1/2','1/4','3/4'])].filter(f=>{const[a,b]=f.split('/').map(Number);return a>0&&a<=b}).filter(f=>!all.some(v=>Math.abs(v-val(f))<1e-9))}
  // "Semak kewajaran" items need distractors far from the estimate: keep them ≥30 away, still within 0–100.
  else if(n!==null&&q.wrong.some(o=>o&&o.tag==='estimate'))pool=[n+30,n-30,n+40,n-40,n+50,n-50,n+60,n-60].filter(v=>v>=0&&v<=MAX).map(String);
  else if(n!==null)pool=(g==='2'&&n%100===0&&n>=100?[n-100,n+100,n-200,n+200,n+10]:n%10===0&&n>=10?[n-10,n+10,n-20,n+20,n+30]:[n+1,n-1,n+10,n-10,n+2,n+100]).filter(v=>v>0&&v<=MAX).map(String);
  else if(sen){const v=Number(sen[1]);pool=[v+10,v-10,v+5,v-5,v+20].filter(x=>x>=5&&x<=95).map(x=>x+' sen')}
  else if(rm){const v=Number(rm[1]),dp=rm[1].includes('.');pool=[v+1,v-1,v+2,v+0.5,v-0.5].filter(x=>x>0&&x<=MAX).map(x=>'RM'+(dp||!Number.isInteger(x)?x.toFixed(2):String(x)))}
  else pool=['tidak pasti','tidak boleh ditentukan','sama banyak','semua betul'];
  const fresh=pool.filter(v=>!seen.has(key(v)));
  const wrong=q.wrong.map(o=>{if(!replace(o)||!fresh.length)return o;const v=fresh.shift();seen.add(key(v));return{v,label:v,tag:'young_near'}});
  return Object.assign({},q,{wrong});
 }
 return{version:VERSION,sanitize,refineYoung,groupDigits,groupText,key};
})();
window.PAOptionIntegrity=PAOptionIntegrity;

function questionFingerprint(q){
  const raw=String(q?.prompt||'')+'|'+String(q?.answer??'');
  // Keep visual markup in the fingerprint: two questions with different charts/clocks/rulers are not the same question.
  return raw.replace(/\s+/g,' ').trim().toLowerCase();
}
// Stable key for "has this pupil seen this item": digit grouping (7 050 410 vs 7050410)
// and whitespace are ignored so the key is the same before and after display formatting.
function questionSeenKey(q){
  const n=v=>String(v??'').replace(/(\d)[ ,](?=\d{3}(?!\d))/g,'$1').replace(/\s+/g,' ').trim().toLowerCase();
  const s=n(q?.prompt)+'|'+n(q?.answer);let h=5381;
  for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;
  return (h>>>0).toString(36);
}
// Per-pupil memory of recent items per skill, saved with the profile so it survives new sessions and days.
const QUESTION_SEEN_LIMIT=150;
function questionSeenStore(){
  if(typeof db==='undefined'||!db)return null;
  const st=db.questionSeenV1;
  if(!st||st.schema!==1||!st.bySkill||typeof st.bySkill!=='object')db.questionSeenV1={schema:1,bySkill:{}};
  return db.questionSeenV1;
}
function rememberQuestion(id,key){
  if(!sess.questionKeys)sess.questionKeys=[];
  sess.questionKeys.push(key);if(sess.questionKeys.length>60)sess.questionKeys.shift();
  if(sess.demoMode)return;
  const st=questionSeenStore();if(!st)return;
  const list=(st.bySkill[id]=(st.bySkill[id]||[]).filter(k=>k!==key));
  list.push(key);if(list.length>QUESTION_SEEN_LIMIT)list.splice(0,list.length-QUESTION_SEEN_LIMIT);
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
// Answer key used to avoid the same answer twice in a row (e.g. "kuboid, kuboid, kuboid" or tally answer 2 again).
function questionAnswerKey(q){return String(q?.answer??'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim().toLowerCase().slice(0,60)}
function questionSelectionScore(q,target,recent,last,prev2){
 const level=questionDemandLevel(q),key=questionAnswerKey(q);
 return Math.abs(level-target)*10+(recent.has(questionFingerprint(q))?80:0)
   +(last&&last.archetypeId===q.archetypeId?20:0)
   +(key&&last?.answerKey===key?25:0)+(key&&prev2?.answerKey===key?8:0);
}
function generate(id,s,interactionContext={}){
  let shift = s.evidence>=2 && (s.confidence+15<s.mastery || s.correct>=3 && s.wrong===0) && Math.random()<.45;
  const bank=questionBankFor(id);
  let q=null,fp='';
  if(!sess.questionFingerprints)sess.questionFingerprints=[];
  if(!sess.questionHistory)sess.questionHistory=[];
  const recent=new Set(sess.questionFingerprints.slice(-18));
  const recentKeys=new Set((sess.questionKeys||[]).slice(-30)),longSeen=new Set(questionSeenStore()?.bySkill?.[id]||[]);

  const attempts=(sess.mode==='confirm'?8:16);
  const v2Bridge=window.PAQuestionSystemV2Bridge;
  if(v2Bridge&&typeof v2Bridge.tryGenerate==='function'){
    try{
      q=v2Bridge.tryGenerate(id,s,{history:sess.questionHistory,recentFingerprints:sess.questionFingerprints,stateRoot:(typeof db!=='undefined'?db:null)});
    }catch(_){q=null}
  }
  if(!q){
    const sameSkill=sess.questionHistory.filter(x=>x.skillId===id),target=questionDepthTarget(id,s),last=sameSkill.at(-1),prev2=sameSkill.at(-2);
    let best=null,bestScore=Infinity,node=null;
    for(let i=0;i<attempts;i++){
      const candidate=bank ? bank(id,s,shift || i>7) : null;
      if(!candidate)break;
      const candidateNode=candidate.subcompetencyId||candidate.curriculumNode||null;
      if(i===0)node=candidateNode;
      // A narrow learning standard may legitimately have only basic tasks;
      // do not silently replace it with a different standard to inflate difficulty.
      if(node&&candidateNode!==node)continue;
      const ck=questionSeenKey(candidate),score=questionSelectionScore(candidate,target,recent,last,prev2)+(recentKeys.has(ck)?80:0)+(longSeen.has(ck)?40:0);
      if(score<bestScore){best=candidate;bestScore=score;}
      if(score===0)break;
    }
    q=best;
  }
  // A focused run must never substitute an unrelated arithmetic question.
  if(!q&&interactionContext.strictSkill)return null;
  q=q || Q("2 + 2 = ?",4,[N(3,"generic"),N(5,"generic"),N(6,"generic")],"Tambah kedua-dua nombor.","Fallback",false,false);
  rememberQuestion(id,questionSeenKey(q));
  q=PAOptionIntegrity.sanitize(q);
  q=PAOptionIntegrity.refineYoung(q,id);
  q=window.PAWrittenArithmetic?.inject?.(q,id,sess)||q;
  q=window.PAGameQuestionInteractions?.prepare?.(q,{skillId:id,state:s,meta:typeof META!=='undefined'?META[id]:null,...interactionContext})||q;
  // Grouping runs after prepare(): typed-answer specs keep the plain numeric value.
  q=PAOptionIntegrity.groupDigits(q,id);
  fp=questionFingerprint(q);
  sess.questionFingerprints.push(fp);
  if(sess.questionFingerprints.length>40)sess.questionFingerprints.shift();
  sess.questionHistory.push({skillId:id,competencyId:q.competencyId||null,subcompetencyId:q.subcompetencyId||null,curriculumNode:q.curriculumNode||null,standardRef:q.standardRef||null,templateId:q.templateId||null,source:q.source||'legacy',archetypeId:q.archetypeId||'legacy',representation:q.representation||'symbolic',demand:q.demand||'procedure',contextId:q.contextId||'general',difficultyBand:q.difficultyBand||2,responseType:q.responseType||'mcq',interactionType:q.interaction?.type||null,battleTier:q.responseBattleTier||interactionContext.battleTier||null,fingerprint:fp,answerKey:questionAnswerKey(q)});
  if(sess.questionHistory.length>60)sess.questionHistory.shift();
  return q;
}

