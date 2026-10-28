/* Jelajah v3: isolated, real question/diagnostic adapter.
 * This module never saves, calls cloud code, or mutates the live demo profile.
 * The production journey supplies simulateResponse(profile, session, q, choice, ok).
 */
(()=>{
 'use strict';
 const root=typeof window!=='undefined'?window:globalThis;
 let serial=0;
 const graph=()=>typeof GRAPH!=='undefined'?GRAPH:root.GRAPH;
 const metadata=()=>typeof META!=='undefined'?META:root.META;
 const clone=value=>{
  try{return typeof structuredClone==='function'?structuredClone(value):JSON.parse(JSON.stringify(value));}
  catch(_){return JSON.parse(JSON.stringify(value,(k,v)=>typeof v==='function'?undefined:v));}
 };
 const seedRng=seed=>{let x=(Number(seed)>>>0)||0x9e3779b9;return()=>{x=(Math.imul(x^x>>>15,1|x)+0x6d2b79f5)|0;let t=x; t=Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296}};
 function withRandom(r,fn){const old=Math.random;Math.random=r;try{return fn()}finally{Math.random=old}}
 function withState(profile,session,fn){
  if(typeof root.swapDemoState!=='function')return fn();
  const before=root.swapDemoState(profile,session);try{return fn()}finally{root.swapDemoState(before.db,before.sess)}
 }
 function skillList(grade){
  const list=Array.isArray(graph()?.skills)?graph().skills.filter(x=>Number(x.grade)===Number(grade)&&x.id):[];
  const byDomain=new Map();for(const item of list){const key=String(item.domain||item.chapter||'other');(byDomain.get(key)||byDomain.set(key,[]).get(key)).push(item)}
  return [...byDomain.keys()].sort().flatMap(k=>byDomain.get(k));
 }
 function skillState(profile,id){
  profile.skills=profile.skills||{};
  if(!profile.skills[id])profile.skills[id]={mastery:0,confidence:0,evidence:0,correct:0,wrong:0,hints:0,mis:{},stability:0,lastSeen:0};
  return profile.skills[id];
 }
 function realQuestion(profile,session,id,rng){
  if(typeof root.generate!=='function'||!id)return null;
  return withState(profile,session,()=>withRandom(rng,()=>{
   const q=root.generate(id,skillState(profile,id),{battleTier:'gembok',isBoss:false,strictSkill:false});
   if(!q)return null;
   q.skill=id;q.token=`jelajah-v3-${Date.now().toString(36)}-${(++serial).toString(36)}`;return q;
  }));
 }
 function profileSnapshot(profile,session){return{profile:clone(profile),session:clone(session)}}
 function create(grade,options={}){
  const g=Number(grade)||Number(options.profile?.schoolGrade)||1;
  const profile=clone(options.profile||(typeof db!=='undefined'?db:root.db)||{});profile.schoolGrade=g;profile.name='Contoh simulasi';profile.demoMode=true;
  profile.diagLog=Array.isArray(profile.diagLog)?profile.diagLog.slice():[];
  const session=clone(options.session||{gembok:true,mode:'gembok',demoMode:true,jelajahEngine:true,coachAdaptive:false,recent:[],responseHistory:[],interventionCooldown:{},confirmSkill:null,confirmRemaining:0,questionToken:0});
  session.demoMode=true;session.jelajahEngine=true;session.coachAdaptive=false;session.gembok=true;session.mode='gembok';session.recent=session.recent||[];session.responseHistory=session.responseHistory||[];
  const rng=seedRng(options.seed||1),skills=skillList(g),used=[],anchor=options.anchorSkill||null;
  let count=0,last=null,focusPlan=null,report=null;
  function breadth(){
   const domains=new Set(used.map(id=>metadata()?.[id]?.domain));
   const freshDomain=skills.find(m=>!domains.has(m.domain));if(freshDomain)return freshDomain;
   const available=skills.filter(x=>!used.includes(x.id)&&x.id!==last?.id);if(!available.length){used.length=0;return skills.filter(x=>x.id!==last?.id)}
   const bucket=available.filter(x=>String(x.domain||x.chapter||'')!==String(last?.domain||''));return bucket[0]||available[0];
  }
  function planFocus(focusSkill){
   const B=root.PADiagnostic,T=root.PATargets;if(!B?.analyze||!T?.plan)return null;
   const p=T.plan(B.analyze(profile.diagLog,{name:profile.name}),{grade:g});
   return p.steps.find(s=>(s.skills||[]).includes(focusSkill))||p.steps[0]||null;
  }
  function next(index,opts={}){
   const n=Number(index)||count;
   let q=null,selected=null;
   if(opts.focusSkill){
    focusPlan=focusPlan&&focusPlan.skills?.includes(opts.focusSkill)?focusPlan:planFocus(opts.focusSkill);
    if(focusPlan&&root.PATargets?.practice){
     const items=root.PATargets.practice(focusPlan,1,{grade:g,fluentTables:focusPlan.fluentTables},(options.seed||1)+n);
     q=items[0]||null;selected=opts.focusSkill;
     if(q){q.token=`jelajah-v3-${Date.now().toString(36)}-${(++serial).toString(36)}`;q.skill=opts.focusSkill}
    }
   }
   if(!q){
    if(n>=6&&anchor||opts.adaptive){
     selected=anchor;
     if(n===6&&!opts.adaptive)selected=anchor;
     else if(typeof root.chooseModeAndSkill==='function')withState(profile,session,()=>{selected=root.chooseModeAndSkill()||anchor});
     if(!selected||Number(metadata()?.[selected]?.grade)!==g)selected=anchor;
    }else selected=breadth()?.id;
    for(let i=0;i<12&&!q;i++)q=realQuestion(profile,session,selected,rng);
   }
   if(!q)return null;
   q.skill=selected||q.skill;q.jelajahIndex=n;q.jelajahEngine=true;last=graph()?.skills?.find(x=>x.id===q.skill)||{id:q.skill};if(!used.includes(q.skill))used.push(q.skill);count=Math.max(count,n+1);session.q=q;session.questionToken=(session.questionToken||0)+1;
   session.hint=false;session.hintLevel=0;session.retryState=null;session.recent.push(q.skill);if(session.recent.length>10)session.recent.shift();
   return q;
  }
  function respond(q,choice,correct){
   if(!q)return null;const ok=!!correct,sec=8,tag=choice?.tag||'generic',value=choice?.v;
   let result=null;
   if(root.PAProductionJourney?.simulateResponse)result=root.PAProductionJourney.simulateResponse(profile,session,q,choice,ok);
   if(root.PADiagnostic?.applyResponse)profile.diagLog=root.PADiagnostic.applyResponse(profile.diagLog,{q,meta:metadata()?.[q.skill],ok,sec,usedHint:false,mode:'gembok',value,at:Date.now()});
   report=snapshot().report;return result;
  }
  function snapshot(){
   const B=root.PADiagnostic,T=root.PATargets;report=B?.analyze?B.analyze(profile.diagLog,{name:profile.name}):{findings:[],strengths:[],total:profile.diagLog.length,enough:false,name:profile.name};
   const plan=T?.plan?T.plan(report,{grade:g}):{steps:[]};
   const learnerMarkup=withState(profile,session,()=>typeof learnerReviewCard==='function'?learnerReviewCard():'');
   const focusSummary=withState(profile,session,()=>root.PAFocusPractice?.summary?.(profile)||null);
   return{grade:g,profile:clone(profile),session:clone(session),report:clone(report),plan:clone(plan),focusSummary:clone(focusSummary),reportMarkup:(B?.cardMarkup?B.cardMarkup(report):'')+learnerMarkup};
  }
  function restore(state){if(!state)return snapshot();Object.assign(profile,clone(state.profile||{}));Object.assign(session,clone(state.session||{}));report=clone(state.report||null);focusPlan=null;return snapshot()}
  function focus(skill){
   if(metadata()?.[skill]?.grade!==g)return false;
   profile.focus=skill;
   withState(profile,session,()=>root.scheduleConfirmation?.(skill));
   return true;
  }
  return{next,respond,snapshot,restore,focus};
 }
 root.PAJelajahEngine={create};
 if(typeof module!=='undefined')module.exports={create};
})();
