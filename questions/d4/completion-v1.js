/* Installed AFTER the final dynamic D4 bank. No other grade is wrapped. */
(function(root){
 'use strict';
 if(root.PAD4Completion?.installed)return;
 const banks=root.PAQuestionBanks,previous=banks?.d4;
 if(typeof previous!=='function'||!root.PAD4CompletionContent||!root.PAD4MeasureCompletion)throw new Error('D4 completion requires the final bank and content modules');
 // generate() keeps the best of up to 16 candidates per question, so a per-call coin almost never lets a new task
 // through. Decide once per question slot, keyed by the newest history entry (it changes only when a question is shown).
 const slot={id:null,last:null,len:-1,value:false};
 function newTask(id,chance){
  let h=null;try{h=sess?.questionHistory}catch(_){}
  if(!Array.isArray(h))return Math.random()<chance;
  if(slot.id!==id||slot.last!==h.at(-1)||slot.len!==h.length){slot.id=id;slot.last=h.at(-1);slot.len=h.length;slot.value=Math.random()<chance}
  return slot.value;
 }
 banks.d4=function(id,s,shift){
  // Match the final curriculum bank's mastery/evidence stages.
  const stage=Number(s?.mastery||0)<35||Number(s?.evidence||0)<2?1:Number(s?.mastery||0)>=70&&Number(s?.confidence||0)>=55?3:2;
  // Keep existing families in the final bank alongside the new tasks.
  if(id==='D4.DATA'&&newTask(id,0.55))return root.PAD4CompletionContent.pictographQuestion(stage===1?['read','legend']:stage===2?['total','difference','maximum']:undefined);
  if(id==='D4.MONEY'&&newTask(id,0.4))return root.PAD4CompletionContent.paymentQuestion();
  if(id==='D4.MEASURE'&&stage===3&&newTask(id,0.6))return root.PAD4MeasureCompletion.question();
  return previous.call(this,id,s,shift);
 };
 root.PAD4Completion={version:'1.0.0',installed:true};
})(typeof window!=='undefined'?window:globalThis);
