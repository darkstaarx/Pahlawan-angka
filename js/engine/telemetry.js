// Privacy-first learning telemetry. Stored on-device until a consented backend exists.
(function(){
 const KEY='pa_learning_events_v1',MAX=2500;
 function read(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(_){return[]}}
 function anonymousSession(){
  let id=sessionStorage.getItem('pa_anon_session');
  if(!id){id='s-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);sessionStorage.setItem('pa_anon_session',id)}
  return id;
 }
 function record(type,payload={}){
  if(!db||db.telemetryOptOut)return;
  const events=read();
  events.push({schema:1,type,session:anonymousSession(),at:Date.now(),grade:Number(db.schoolGrade||0),...payload});
  localStorage.setItem(KEY,JSON.stringify(events.slice(-MAX)));
 }
 function response(skillId,ok,tag,sec,usedHint,q,mode){
  record('response',{
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
 window.PATelemetry={record,response,read,exportData,clear};
})();
