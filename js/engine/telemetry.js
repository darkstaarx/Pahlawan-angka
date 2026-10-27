// Privacy-first learning telemetry. Stored on-device until a consented backend exists.
(function(){
 const KEY='pa_learning_events_v1',MAX=2500;
 function read(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(_){return[]}}
 function anonymousSession(){
  let id=sessionStorage.getItem('pa_anon_session');
  if(!id){id='s-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);sessionStorage.setItem('pa_anon_session',id)}
  return id;
 }
 function enabled(){try{return !!db&&!db.demoMode&&!db.telemetryOptOut}catch(_){return false}}
 function record(type,payload={}){
  if(!enabled())return false;
  const events=read();
  events.push({schema:1,type,session:anonymousSession(),at:Date.now(),grade:Number(db.schoolGrade||0),...payload});
  localStorage.setItem(KEY,JSON.stringify(events.slice(-MAX)));
  return true;
 }
 function response(skillId,ok,tag,sec,usedHint,q,mode,value){
  // DEV Question Bank Tester must never pollute diagnostic logs, rapid lock,
  // or local telemetry. An opt-in DEV observer may inspect the call separately.
  const session=typeof sess!=='undefined'?sess:null;
  if(session?.devBankTest||session?.devBattlefield||/^dev(?:-|$)/.test(String(mode||'')))return false;
  // Diagnostic brain keeps its own per-profile log (docs/PA-DIAGNOSTIC-BRAIN.md).
  try{window.PADiagnostic?.record?.(skillId,ok,tag,sec,usedHint,q,mode,value)}catch(_){}
  // Rapid-guess lock: 3 too-fast wrong first attempts → parent PIN (docs/PA-DIAGNOSTIC-BRAIN.md §5).
  try{window.PARapidLock?.observe?.(skillId,ok,tag,sec,usedHint,q,mode,value)}catch(_){}
  return record('response',{
   skillId,correct:!!ok,misconception:ok?'':(tag||'generic'),seconds:Math.round((Number(sec)||0)*10)/10,
   usedHint:!!usedHint,mode:mode||'practice',itemId:String(q?.token||''),archetypeId:q?.archetypeId||'legacy',
   representation:q?.representation||'symbolic',demand:q?.demand||'procedure',difficultyBand:Number(q?.difficultyBand||2),
   formatShift:!!q?.formatShift,diagnostic:!!q?.diagnostic
  });
 }
 function exportData(){
  const blob=new Blob([JSON.stringify({schema:1,exportedAt:Date.now(),events:read()},null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='pahlawan-angka-learning-events.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
 }
 function clear(){localStorage.removeItem(KEY)}
 window.PATelemetry={record,response,read,exportData,clear,enabled};
})();
