/* Installed AFTER the final dynamic D4 bank. No other grade is wrapped. */
(function(root){
 'use strict';
 if(root.PAD4Completion?.installed)return;
 const banks=root.PAQuestionBanks,previous=banks?.d4;
 if(typeof previous!=='function'||!root.PAD4CompletionContent||!root.PAD4MeasureCompletion)throw new Error('D4 completion requires the final bank and content modules');
 banks.d4=function(id,s,shift){
  // Match the final curriculum bank's mastery/evidence stages.
  const stage=Number(s?.mastery||0)<35||Number(s?.evidence||0)<2?1:Number(s?.mastery||0)>=70&&Number(s?.confidence||0)>=55?3:2;
  // Keep existing families in the final bank alongside the new tasks.
  if(id==='D4.DATA'&&Math.random()<0.55)return root.PAD4CompletionContent.pictographQuestion(stage===1?['read','legend']:stage===2?['total','difference','maximum']:undefined);
  if(id==='D4.MONEY'&&Math.random()<0.4)return root.PAD4CompletionContent.paymentQuestion();
  if(id==='D4.MEASURE'&&stage===3&&Math.random()<0.6)return root.PAD4MeasureCompletion.question();
  return previous.call(this,id,s,shift);
 };
 root.PAD4Completion={version:'1.0.0',installed:true};
})(typeof window!=='undefined'?window:globalThis);
