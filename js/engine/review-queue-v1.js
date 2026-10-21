/* Pahlawan Angka — spaced review queue for lens 4.7 (docs/PA-DIAGNOSTIC-BRAIN.md §4.7).
   When Cikgu Dimensi finds that something mastered earlier is slipping (finding
   `retention`), each slip (a sifir, a basic-fact family or a KSSR skill) gets a
   review schedule: 1, 3, 7 and 14 days. A step is passed by the first matching
   answer on or after its due time, right on the first try without a hint; a miss
   starts the schedule again from 1 day. Answers before the due time are ordinary
   practice and do not move the schedule. Only the start time and the slip are
   stored (db.diagReviewV1); every state is derived from db.diagLog, as in
   js/engine/diagnostic-recheck-v1.js. Rapid guesses never count.
   Used by Kembara Dimensi (js/engine/production-journey.js, adaptive route) to bring
   due skills in. Pure module; Node-testable. */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.PAReviewQueue=api;
})(typeof window!=='undefined'?window:undefined,function(){
  'use strict';
  const VERSION='1.0.0',DAY=864e5;
  const RULES=Object.freeze({intervals:[1,3,7,14],maxItems:12,keepDoneDays:30});
  const independent=r=>r.k===1&&!r.h;
  // Same rapid-guess floor as the brain (js/engine/diagnostic-brain-v1.js).
  const floor=r=>Math.min(3.2,Math.max(1.8,1.35+(Number(r.w)||0)*5.5*.018));
  const considered=r=>!(r.sec>0&&r.sec<floor(r));
  const list=x=>Array.isArray(x)?x:[];

  /* The answers that review one slip: its sifir, its basic-fact family, or its skill
     (a skill answer that carries a sifir or basic fact belongs to that group instead). */
  function matcher(item){
    const tables=list(item?.tables).map(Number),facts=list(item?.facts),skills=list(item?.skills);
    if(tables.length)return r=>list(r.tb).some(t=>tables.includes(Number(t)));
    if(facts.length)return r=>facts.includes(r.fx);
    if(skills.length)return r=>skills.includes(r.s)&&!list(r.tb).length&&!r.fx;
    return null;
  }
  function store(profile){
    if(!profile||typeof profile!=='object')return null;
    const s=profile.diagReviewV1;
    if(!s||s.schema!==1||!s.items||typeof s.items!=='object')profile.diagReviewV1={schema:1,items:{}};
    return profile.diagReviewV1;
  }
  /* Derived state of one item: waiting (next step not due yet) → due → … → done after the 14-day step. */
  function state(profile,item,now=Date.now()){
    const m=matcher(item),at=Number(item?.at);if(!m||!Number.isFinite(at))return null;
    const rs=list(profile?.diagLog).filter(r=>r&&r.t>at&&r.t<=now+6e4&&considered(r)&&m(r)).sort((a,b)=>a.t-b.t);
    let step=0,from=at,restarts=0;
    for(;;){
      const dueAt=from+RULES.intervals[step]*DAY,r=rs.find(x=>x.t>=dueAt);
      if(!r)return{status:now>=dueAt?'due':'waiting',step,steps:RULES.intervals.length,dueAt,restarts};
      if(independent(r)){step++;from=r.t;if(step>=RULES.intervals.length)return{status:'done',step,steps:step,doneAt:r.t,restarts}}
      else{step=0;from=r.t;restarts++}
    }
  }
  /* Start a schedule for every slip of the current retention finding (once per slip;
     a finished one starts again if the slip comes back). Returns true when it stored something. */
  function sync(profile,result,now=Date.now()){
    const f=list(result?.findings).find(x=>x&&x.id==='retention'),slips=list(f?.target?.slips);
    const s=slips.length&&store(profile);if(!s)return false;
    let changed=false;
    for(const x of slips){
      if(!x||!x.key)continue;const cur=s.items[x.key],st=cur&&state(profile,cur,now);
      if(cur&&st&&st.status!=='done')continue;
      s.items[x.key]={at:now,key:String(x.key),label:String(x.label||''),tables:list(x.tables).map(Number),facts:list(x.facts).map(String),skills:list(x.skills).map(String).slice(0,3)};
      changed=true;
    }
    for(const [k,it] of Object.entries(s.items)){const st=state(profile,it,now);if(st&&st.status==='done'&&now-st.doneAt>RULES.keepDoneDays*DAY){delete s.items[k];changed=true}}
    const keys=Object.keys(s.items).sort((a,b)=>s.items[a].at-s.items[b].at);
    while(keys.length>RULES.maxItems){delete s.items[keys.shift()];changed=true}
    return changed;
  }
  function items(profile,now=Date.now()){
    return Object.values(profile?.diagReviewV1?.items||{}).map(item=>({item,state:state(profile,item,now)})).filter(x=>x.state);
  }
  /* Skills whose review is due now (for the daily review plan). */
  function dueSkills(profile,now=Date.now()){
    return [...new Set(items(profile,now).filter(x=>x.state.status==='due').flatMap(x=>x.item.skills))];
  }
  /* Kembara Dimensi (adaptive Gembok run, js/engine/production-journey.js): every 4th question
     from the 2nd is a due review skill the run has not asked yet; otherwise null (the normal pick). */
  function nextForRun(profile,run,now=Date.now(),ok=()=>true){
    if(!run||Number(run.questionNumber)%4!==1)return null;
    const asked=run.reviewAsked||(run.reviewAsked=[]),id=dueSkills(profile,now).find(x=>!asked.includes(x)&&ok(x));
    if(id)asked.push(id);
    return id||null;
  }
  return Object.freeze({VERSION,RULES,matcher,state,sync,items,dueSkills,nextForRun});
});
