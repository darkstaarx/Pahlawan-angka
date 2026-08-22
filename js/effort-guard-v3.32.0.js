/* Detect sustained rapid guessing after support; never lock on one fast answer. */
(function(root){
 const state=()=>{if(typeof sess==='undefined'||!sess)return null;return sess.effortGuard||(sess.effortGuard={supportedGuess:false,coachActive:false,postCoach:false,postCoachQuestions:0,current:null})};
 const limit=q=>Math.min(3.2,Math.max(1.8,1.35+String(q?.prompt||'').replace(/<[^>]*>/g,'').length*.018));
 const retryLimit=q=>Math.min(2.5,Math.max(1.5,1.15+String(q?.prompt||'').replace(/<[^>]*>/g,'').length*.012));
 function firstWrong(q,sec){
  const s=state();if(!s)return false;const fast=Number(sec)>0&&Number(sec)<limit(q);
  s.current={token:q?.token,skill:q?.skill,fastFirst:fast,hintAt:0};
  if(s.postCoach){s.postCoachQuestions++;if(fast&&s.supportedGuess)return true;if(s.postCoachQuestions>=2)s.postCoach=false}
  return false;
 }
 function hintOpened(q){const s=state();if(!s)return;s.current=s.current||{token:q?.token,skill:q?.skill,fastFirst:false};s.current.hintAt=performance.now()}
 function retryResolved(q,ok){
  const s=state(),c=s?.current;if(!s||!c||c.token!==q?.token)return false;
  const afterHint=c.hintAt?(performance.now()-c.hintAt)/1000:Infinity;
  if(!ok&&c.fastFirst&&afterHint<retryLimit(q)){s.supportedGuess=true;s.lastEvidenceAt=Date.now();s.lastSkill=q?.skill}
  if(ok&&afterHint>=retryLimit(q)){s.supportedGuess=false;s.postCoach=false}
  return false;
 }
 function shouldCoach(skill){const s=state();return !!(s?.supportedGuess&&!s.coachActive&&!s.postCoach&&(!s.lastSkill||s.lastSkill===skill))}
 function coachStarted(skill){const s=state();if(!s)return;s.coachActive=true;s.coachSkill=skill}
 function coachFinished(skill){const s=state();if(!s||!s.supportedGuess)return;s.coachActive=false;s.postCoach=true;s.postCoachQuestions=0;s.coachSkill=skill}
 function resetAfterParent(){const s=state();if(!s)return;s.supportedGuess=false;s.coachActive=false;s.postCoach=false;s.postCoachQuestions=0;s.current=null;s.parentCheckedAt=Date.now()}
 root.PAEffortGuard={firstWrong,hintOpened,retryResolved,shouldCoach,coachStarted,coachFinished,resetAfterParent,limit,retryLimit};
})(typeof window!=='undefined'?window:globalThis);
