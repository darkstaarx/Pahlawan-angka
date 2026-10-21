/* Pahlawan Angka — re-check loop for Cikgu Dimensi targets (docs/PA-DIAGNOSTIC-BRAIN.md §8a item 4, lens 4.7).
   After a targeted set (8 matching answers once the child starts a brain-backed
   Fokus card), wait 2 days, then check with the next 6 matching answers from
   anywhere (mini game, battle). 5 of 6 right on the first try → "Semakin baik";
   otherwise the focus stays and a new set starts. Only the start time and the
   plan step of each target are stored (the step keeps the card alive when the
   brain drops the finding as the child improves); every state is derived from
   db.diagLog, so it cannot drift from the evidence. Rapid guesses never count. */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.PARecheck=api;
})(typeof window!=='undefined'?window:undefined,function(){
  'use strict';
  const VERSION='1.0.0',DAY=864e5;
  const RULES=Object.freeze({setSize:8,gapDays:2,checkSize:6,pass:5,showPassedDays:7,maxTargets:12});
  const DAYS=['Ahad','Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu'];
  const independent=r=>r.k===1&&!r.h;
  // Same rapid-guess floor as the brain (js/engine/diagnostic-brain-v1.js).
  const floor=r=>Math.min(3.2,Math.max(1.8,1.35+(Number(r.w)||0)*5.5*.018));
  const considered=r=>!(r.sec>0&&r.sec<floor(r));

  /* Which answers practise this step. null = not re-checkable (operation
     choice: worksheet work, no clean matching rule). */
  function matcher(step){
    const t=step?.target||{};
    if(t.kind==='tables'||(t.kind==='review'&&(t.review||[]).some(x=>/^sifir \d+$/.test(x)))){
      const tables=t.kind==='tables'?(t.tables||[]).map(Number):(t.review||[]).map(x=>Number((/^sifir (\d+)$/.exec(x)||[])[1])).filter(Boolean);
      if(!tables.length)return null;
      return {key:'tables:'+[...new Set(tables)].sort((a,b)=>a-b).join(','),test:r=>(r.tb||[]).some(x=>tables.includes(Number(x)))};
    }
    if(t.kind==='facts'||t.kind==='review'){
      const fams=t.kind==='facts'?(t.factFamilies||[]):(t.review||[]).map(x=>/^tambah asas$/.test(x)?'add20':/^tolak asas$/.test(x)?'sub20':null).filter(Boolean);
      if(!fams.length)return null;
      return {key:'facts:'+[...new Set(fams)].sort().join(','),test:r=>fams.includes(r.fx)};
    }
    if(t.kind==='regroup'&&(t.op==='add'||t.op==='sub'))return {key:'regroup:'+t.op,test:r=>r.o===t.op&&r.rg===1};
    if(t.kind==='money')return {key:'money:'+(t.op||'mixed'),test:r=>r.c==='money'&&(!t.op||t.op==='mixed'||r.o===t.op)};
    if(t.kind==='units')return {key:'units',test:r=>r.c==='money'};
    // Word problems: the check is word problems without a drawn bar model.
    if(t.kind==='word')return {key:'word',test:r=>r.f==='word'};
    // Long wording (lens 4.8): the check is long questions of the same family read alone (not heard first).
    if(t.kind==='reading'){const ctx=t.context||'plain';
      return {key:'reading:'+(t.op||'any')+':'+ctx,test:r=>r.rd===3&&r.ra!==1&&(!t.op||r.o===t.op)&&(r.c||'plain')===ctx}}
    // Fading pictures: the check is the same skill answered with numbers only.
    if(t.kind==='fade'&&t.skill)return {key:'fade:'+t.skill+':'+(t.op||'none'),test:r=>r.s===t.skill&&r.rp==='a'&&(!t.op||t.op==='none'||r.o===t.op)};
    return null;
  }
  function store(profile){
    if(!profile||typeof profile!=='object')return null;
    const s=profile.diagRecheckV1;
    if(!s||s.schema!==1||!s.starts||typeof s.starts!=='object')profile.diagRecheckV1={schema:1,starts:{}};
    // Each entry: {at, step:{finding,target,card,skills}}.
    return profile.diagRecheckV1;
  }
  function dayLabel(at,now){
    const d0=new Date(now);d0.setHours(0,0,0,0);
    const diff=Math.round((new Date(at).setHours(0,0,0,0)-d0.getTime())/DAY);
    return diff<=0?'hari ini':diff===1?'esok':diff===2?'lusa':DAYS[new Date(at).getDay()];
  }
  /* Derived state of one step. Cycles: practise → wait → check → passed, or back to practise. */
  function state(profile,step,now=Date.now()){
    const m=matcher(step),startedAt=Number(profile?.diagRecheckV1?.starts?.[m?.key]?.at);
    if(!m||!Number.isFinite(startedAt))return null;
    const rs=(Array.isArray(profile?.diagLog)?profile.diagLog:[]).filter(r=>r&&r.t>=startedAt&&r.t<=now+6e4&&considered(r)&&m.test(r)).sort((a,b)=>a.t-b.t);
    let from=startedAt,round=1;
    for(;;){
      const practice=rs.filter(r=>r.t>=from);
      if(practice.length<RULES.setSize)return {key:m.key,status:'practising',round,done:practice.length,need:RULES.setSize};
      const practicedAt=practice[RULES.setSize-1].t,dueAt=practicedAt+RULES.gapDays*DAY;
      if(now<dueAt)return {key:m.key,status:'waiting',round,practicedAt,dueAt,dueLabel:dayLabel(dueAt,now)};
      const check=rs.filter(r=>r.t>=dueAt).slice(0,RULES.checkSize);
      if(check.length<RULES.checkSize)return {key:m.key,status:'due',round,dueAt,done:check.length,need:RULES.checkSize};
      const ok=check.filter(independent).length,endedAt=check[check.length-1].t,score=ok+'/'+RULES.checkSize;
      if(ok>=RULES.pass)return {key:m.key,status:now-endedAt<=RULES.showPassedDays*DAY?'passed':'settled',round,passedAt:endedAt,score};
      from=endedAt+1;round++;  // not yet: keep the focus, start a new set
      if(round>20)return {key:m.key,status:'practising',round,done:0,need:RULES.setSize,lastScore:score};
    }
  }
  /* A brain-backed Fokus card was opened: start the loop for its target (once). */
  function start(profile,step,now=Date.now()){
    const m=matcher(step),s=m&&store(profile);if(!s)return null;
    const cur=state(profile,step,now);
    if(!cur||cur.status==='settled'){
      const t=step.target||{};
      s.starts[m.key]={at:now,step:{finding:String(step.finding||''),card:String(step.card||'Latihan sasaran'),
        target:JSON.parse(JSON.stringify(t)),skills:(step.skills||[]).map(String).slice(0,3),also:(step.also||[]).map(String).slice(0,4)}};
      const keys=Object.keys(s.starts).sort((a,b)=>s.starts[a].at-s.starts[b].at);
      while(keys.length>RULES.maxTargets)delete s.starts[keys.shift()];
    }
    return state(profile,step,now);
  }
  /* Stored targets with their state, for cards whose finding the brain no longer reports. */
  function list(profile,now=Date.now()){
    const starts=profile?.diagRecheckV1?.starts||{};
    return Object.values(starts).filter(e=>e&&e.step).map(e=>({step:e.step,state:state(profile,e.step,now)})).filter(x=>x.state);
  }
  return Object.freeze({VERSION,RULES,matcher,state,start,list,dayLabel});
});
