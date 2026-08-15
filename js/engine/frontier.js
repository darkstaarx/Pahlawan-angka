// Continuous adaptive frontier-search controller used by Auto Coach.
// Mission Mode remains fixed-length; Auto Coach searches for the learner's real working ceiling.
const COACH_SESSION={minQuestions:8,maxQuestions:15,rapidWindow:4,rapidMedianSeconds:7.5,minDomains:4,secureAccuracy:.8};

function ensureCoachSession(){
  if(!sess.coachAdaptive)return null;
  if(!sess.coach){
    sess.coach={startedGrade:coreGrade(),responses:{},secure:{},frontier:{},domains:{},currentSkill:null,lastSecure:null,phase:'calibrate',visited:[],uncertain:{},stretchDepth:0};
  }
  return sess.coach;
}
function coachHistory(id){const c=ensureCoachSession();return c?(c.responses[id]||(c.responses[id]=[])):[]}
function coachFormatSignature(q){return [q?.representation||'symbolic',q?.demand||'procedure',q?.contextId||'general',q?.kind||'q',q?.formatShift?'shift':'base'].join('|')}
function median(xs){if(!xs.length)return 999;const a=[...xs].sort((x,y)=>x-y),m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2}
function recordFrontierResponse(id,ok,sec,usedHint,q){
  if(!sess.coachAdaptive||sess.devBankTest)return;
  const c=ensureCoachSession(),m=META[id];if(!m)return;
  const h=coachHistory(id);h.push({ok:!!ok,sec:+sec||99,hint:!!usedHint,format:coachFormatSignature(q),t:Date.now()});if(h.length>12)h.shift();
  c.visited.push(id);if(c.visited.length>80)c.visited.shift();
  const d=c.domains[m.domain]||(c.domains[m.domain]={attempts:0,correct:0,highestGrade:m.grade,lastSkill:id});
  d.attempts++;if(ok)d.correct++;d.lastSkill=id;if(ok)d.highestGrade=Math.max(d.highestGrade||1,m.grade);
  const r=rapidSecureEvidence(id);
  if(r.secure){
    c.secure[id]=true;c.lastSecure=id;c.uncertain[id]=false;
    c.frontier[m.domain]={grade:m.grade,skill:id,status:'secure',confidence:r.confidence};
    c.phase=m.grade>coreGrade()?'stretch':'accelerate';
  }else if(h.length>=3){
    const recent=h.slice(-5),acc=recent.filter(x=>x.ok).length/recent.length;
    if(acc<.55){c.uncertain[id]=true;c.frontier[m.domain]={grade:m.grade,skill:id,status:'challenge',confidence:Math.round(acc*100)};c.phase='challenge';}
  }
}
function rapidSecureEvidence(id){
  const c=ensureCoachSession(),m=META[id];
  const priorSecure=Object.keys(c.secure).some(x=>x!==id&&META[x]&&META[x].domain===m.domain);
  // First proof in a domain requires five clean answers. Once the learner has established strength in that domain,
  // adjacent/stretch probes can accelerate after three clean, varied answers so the coach does not waste time.
  const need=priorSecure?3:COACH_SESSION.rapidWindow;
  const h=coachHistory(id),recent=h.slice(-need);if(recent.length<need)return{secure:false,confidence:0};
  const correct=recent.filter(x=>x.ok).length, noHints=recent.every(x=>!x.hint), times=recent.filter(x=>x.ok).map(x=>x.sec), med=median(times);
  const formats=new Set(recent.map(x=>x.format)).size;
  // Response time is behavioural context only. Slow, careful reading must not
  // block mastery; genuinely impulsive wrong answers are handled by intervention.js.
  const kbDecision=typeof masteryEvidenceDecision==='function'?masteryEvidenceDecision(id,h):null;
  const secure=correct===recent.length&&noHints&&(kbDecision?kbDecision.secure:(formats>=2 || recent.some(x=>x.format.endsWith('|shift'))));
  return{secure,confidence:secure?Math.min(98,82+formats*4):Math.round(correct/recent.length*100),median:med,formats,need,kb:kbDecision};
}
function coachGradeSkills(g){return GRAPH.skills.filter(x=>x.grade===g)}
function sameChapterUnseenAfter(id){
  const m=META[id];if(!m)return null;
  const arr=GRAPH.skills.filter(x=>x.grade===m.grade&&String(x.chapter)===String(m.chapter)).sort((a,b)=>a.id.localeCompare(b.id,undefined,{numeric:true}));
  const i=arr.findIndex(x=>x.id===id);for(let j=i+1;j<arr.length;j++){const s=scoreState(arr[j].id);if(!sess.coach.secure[arr[j].id]&&s.evidence<6)return arr[j].id}return null;
}
function nextStretchFrom(id){let n=STR[id];return n&&META[n]?n:null}
function domainCoverageScore(m){
  const c=ensureCoachSession(),d=c.domains[m.domain],s=scoreState(m.id);
  const attempts=d?.attempts||0, recent=c.visited.slice(-6).includes(m.id)?0.18:1;
  const unseen=s.evidence===0?2.6:s.evidence<2?1.8:1;
  return (1/(1+attempts*.35))*unseen*recent*(.9+Math.random()*.2);
}
function chooseSchoolGradeProbe(){
  const pool=coachGradeSkills(coreGrade()).filter(m=>!sess.coach.secure[m.id]&&!sess.coach.uncertain[m.id]);
  if(!pool.length)return null;
  return pool.map(m=>[m.id,domainCoverageScore(m)]).sort((a,b)=>b[1]-a[1])[0][0];
}
function chooseCoachFrontierSkill(){
  const c=ensureCoachSession();
  // Preserve prerequisite recovery if the normal intervention/recovery system has opened one.
  if(sess.recoveryFor){const rid=chooseRecovery(sess.recoveryFor);if(rid){sess.mode='recover';return rid}else sess.recoveryFor=null}

  const last=c.currentSkill;
  if(last&&c.secure[last]){
    const lm=META[last];
    // Once a cross-grade probe is secured, sample other domains before climbing several grades in only one topic.
    // After broad coverage is established, the same frontier can continue climbing D3→D4→D5→D6 where justified.
    if(lm.grade>coreGrade() && coachCoveredDomains()<4){
      const breadth=chooseSchoolGradeProbe();if(breadth){c.currentSkill=breadth;sess.mode='calibrate';return breadth}
    }
    const secureChapter=Object.keys(c.secure).filter(x=>META[x]&&META[x].grade===lm.grade&&String(META[x].chapter)===String(lm.chapter));
    // Do not grind an entire easy chapter. Three secure adjacent skills are enough to start a vertical probe.
    if(lm.grade===coreGrade() && secureChapter.length>=3){
      const vertical=[...secureChapter].reverse().map(x=>nextStretchFrom(x)).find(Boolean);
      if(vertical){c.currentSkill=vertical;c.stretchDepth=Math.max(c.stretchDepth,META[vertical].grade-coreGrade());sess.mode='stretch';return vertical}
    }
    // Otherwise move through the next adjacent curriculum skill.
    const sibling=sameChapterUnseenAfter(last);
    if(sibling){c.currentSkill=sibling;sess.mode='accelerate';return sibling}
    // Then follow the knowledge graph upward. There is no +1-grade ceiling in Auto Coach.
    const stretch=nextStretchFrom(last);
    if(stretch){c.currentSkill=stretch;c.stretchDepth=Math.max(c.stretchDepth,META[stretch].grade-coreGrade());sess.mode='stretch';return stretch}
  }
  if(last&&c.uncertain[last]){
    const hist=coachHistory(last),recent=hist.slice(-3);
    // Failure on an above-grade probe is useful ceiling evidence, not proof that the child needs remediation.
    if(META[last].grade>coreGrade()){
      const breadth=chooseSchoolGradeProbe();if(breadth){c.currentSkill=breadth;sess.mode='calibrate';return breadth}
    }
    if(recent.length>=3&&recent.filter(x=>x.ok).length<=1){
      const rec=(REC[last]||[]).filter(x=>META[x]).sort((a,b)=>META[b].grade-META[a].grade)[0];
      if(rec){sess.recoveryFor=last;c.currentSkill=rec;sess.mode='recover';return rec}
    }
  }
  // Establish breadth across the learner's school-grade domains before spending questions on already-secure skills.
  const probe=chooseSchoolGradeProbe();
  if(probe){c.currentSkill=probe;sess.mode=scoreState(probe).evidence?'practice':'calibrate';return probe}

  // If school-grade coverage is already strong, revisit each domain's highest secure node and push upward where possible.
  const candidates=[];
  for(const f of Object.values(c.frontier)){
    if(!f?.skill)continue;const up=nextStretchFrom(f.skill);if(up&&!c.uncertain[up])candidates.push(up);
  }
  if(candidates.length){const pick=candidates.sort((a,b)=>META[a].grade-META[b].grade)[0];c.currentSkill=pick;sess.mode='stretch';return pick}

  // Final fallback uses the existing weighted engine rather than drilling the same item.
  const all=GRAPH.skills.filter(x=>x.grade===coreGrade());
  const pick=all.sort((a,b)=>(scoreState(a.id).evidence-scoreState(b.id).evidence))[0]?.id||all[0]?.id;
  c.currentSkill=pick;sess.mode='review';return pick;
}
function coachCoveredDomains(){const c=ensureCoachSession();return Object.values(c?.domains||{}).filter(x=>x.attempts>=2).length}
function coachResolvedDomains(){
  const c=ensureCoachSession();
  return Object.values(c?.frontier||{}).filter(x=>x&&(x.status==='secure'||x.status==='challenge')).length;
}
function shouldFinishAdaptiveCoach(){
  if(!sess?.coachAdaptive||sess.devBankTest)return false;
  const n=sess.missionAnswered||0;if(n<COACH_SESSION.minQuestions)return false;if(n>=COACH_SESSION.maxQuestions)return true;
  const c=ensureCoachSession(),covered=coachCoveredDomains(),resolved=coachResolvedDomains(),activeUncertain=Object.values(c.uncertain||{}).filter(Boolean).length;
  // Exposure alone is not a resolved placement result. Finish early only when
  // four domains each have clear secure/challenge evidence; otherwise keep
  // sampling (up to 15 questions) instead of reporting a false frontier.
  return covered>=COACH_SESSION.minDomains && resolved>=COACH_SESSION.minDomains && activeUncertain<=2 && !sess.recoveryFor && !sess.confirmSkill;
}
function coachFrontierSummary(){
  const c=ensureCoachSession();if(!c)return[];
  return Object.entries(c.domains).map(([domain,d])=>{
    const f=c.frontier[domain];const g=f?.grade||d.highestGrade||coreGrade();
    return{domain,grade:g,skill:f?.skill||d.lastSkill,status:f?.status||'exploring',attempts:d.attempts,accuracy:Math.round(d.correct/Math.max(1,d.attempts)*100)};
  }).sort((a,b)=>b.grade-a.grade||b.accuracy-a.accuracy);
}
