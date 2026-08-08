// Adaptive coaching engine.
function scoreState(id){return db.skills[id]}

function evidenceQuality(sec,q,usedHint){
 let x=1;if(usedHint)x*=.55;
 if(sec<.65)x*=.3; else if(sec<1.15)x*=.62;
 if(q.diagnostic)x*=1.08;
 if(q.formatShift)x*=1.08;
 return Math.max(.22,Math.min(1.2,x))
}

function decayedMastery(id){
 let s=scoreState(id); if(!s.lastSeen)return s.mastery;
 let hrs=(Date.now()-s.lastSeen)/36e5, decay=Math.pow(.5,hrs/CFG.forgetting_half_life_hours);
 // only small decay toward 55 rather than to zero
 if(s.mastery<=55)return s.mastery;
 return 55+(s.mastery-55)*decay;
}

function prereqReady(id){
 return META[id].prereq.every(p=>scoreState(p).mastery>=45 || META[p].grade===1);
}

function coreChapterSkills(ch){return GRAPH.skills.filter(x=>x.grade===2&&x.chapter===String(ch))}

function chapterScore(ch){
 let arr=coreChapterSkills(ch), active=arr.filter(x=>scoreState(x.id).evidence>0);
 if(!active.length)return 0;
 return arr.reduce((z,x)=>z+(scoreState(x.id).evidence?scoreState(x.id).mastery:0),0)/arr.length
}

function chapterEvidence(ch){return coreChapterSkills(ch).reduce((z,x)=>z+scoreState(x.id).evidence,0)}

function updateFrontier(){
 while(db.coreFrontier<8){
  let ch=db.coreFrontier;
  if(chapterScore(ch)>=CFG.unlock_mastery && chapterEvidence(ch)>=Math.max(8,coreChapterSkills(ch).length*2)){
   db.coreFrontier++; log(`Coach buka Topik D2.${db.coreFrontier}: topik sebelumnya cukup stabil untuk curriculum expansion.`);
  } else break;
 }
}

function needsRecovery(coreId){
 let s=scoreState(coreId);
 if(META[coreId].grade!==2 || !REC[coreId])return false;
 return s.evidence>=3 && (s.mastery<CFG.recovery_trigger_mastery || (s.wrong>=2 && s.confidence<CFG.recovery_trigger_confidence));
}

function chooseRecovery(coreId){
 let candidates=(REC[coreId]||[]).filter(id=>META[id]&&META[id].grade===1);
 if(!candidates.length)return null;
 candidates.sort((a,b)=>(scoreState(a).mastery+scoreState(a).confidence*.5)-(scoreState(b).mastery+scoreState(b).confidence*.5));
 return candidates[0];
}

function canStretch(coreId){
 let s=scoreState(coreId), tgt=STR[coreId];
 if(!tgt)return false;
 return s.evidence>=CFG.stretch_min_evidence && s.mastery>=CFG.stretch_trigger_mastery && s.confidence>=CFG.stretch_trigger_confidence;
}

function chooseModeAndSkill(){
 updateFrontier();

 // 1) Complete an active recovery mini-loop before returning to core.
 if(sess.recoveryFor){
  let rid=chooseRecovery(sess.recoveryFor);
  if(rid){
   let rs=scoreState(rid);
   if(rs.evidence<3 || rs.mastery<65){
    sess.mode="recover";return rid;
   }
  }
  log(`Recovery selesai untuk ${sess.recoveryFor}; coach kembali ke skill D2 asal.`);
  let ret=sess.recoveryFor;sess.recoveryFor=null;sess.mode="recheck";return ret;
 }

 // 2) Complete an active stretch check, then return.
 if(sess.stretchFor){
  let sid=STR[sess.stretchFor], ss=scoreState(sid);
  if(ss.evidence<3 && ss.probeFail<2){sess.mode="stretch";return sid}
  let base=sess.stretchFor;
  if(ss.probePass>=2) log(`${base} menunjukkan bukti melebihi D2; D3 stretch disahkan secara provisional.`);
  else log(`D3 stretch untuk ${base} belum stabil; coach kekalkan D2 sebagai working level.`);
  sess.stretchFor=null;sess.mode="review";return base;
 }

 // 3) Parent focus (but not exclusive)
 let core = GRAPH.skills.filter(x=>x.grade===2 && +x.chapter<=db.coreFrontier);
 let weighted=[];
 for(let m of core){
  let s=scoreState(m.id);
  let coverage=s.evidence===0?3.2:s.evidence<2?2.0:1;
  let weak=s.evidence>=2?(s.mastery<35?2.5:s.mastery<50?1.9:s.mastery<70?1.35:s.mastery<85?.85:.42):1;
  let frontier=(+m.chapter===db.coreFrontier?1.35:1);
  let spaced=(Date.now()-s.lastSeen>24*36e5?1.35:1);
  let focus=(db.focus===m.id?CFG.parent_focus_boost:1);
  let repeat=sess.recent.slice(-CFG.anti_repeat_window).includes(m.id)?.12:1;
  let score=coverage*weak*frontier*spaced*focus*repeat*(.88+Math.random()*.24);
  weighted.push([m.id,score]);
 }
 weighted.sort((a,b)=>b[1]-a[1]);
 let pool=weighted.slice(0,Math.min(4,weighted.length)), total=pool.reduce((z,x)=>z+x[1],0), r=Math.random()*total, pick=pool[0][0];
 for(let x of pool){r-=x[1]; if(r<=0){pick=x[0];break}}

 // 4) Downward recovery is rooted in the core skill currently being sampled.
 if(needsRecovery(pick)){
  let rid=chooseRecovery(pick);
  if(rid){sess.recoveryFor=pick;sess.mode="recover";log(`${pick} lemah; coach turun sementara ke prerequisite ${rid} untuk cari root cause.`);return rid}
 }

 // 5) Upward stretch is local to this skill, not a global "Darjah 3" label.
 if(canStretch(pick) && Math.random()<.42){
  sess.stretchFor=pick;sess.mode="stretch";log(`${pick} kuat; coach mulakan D3 stretch probe ${STR[pick]}.`);return STR[pick]
 }

 sess.mode = scoreState(pick).evidence<2 ? "calibrate" : (scoreState(pick).mastery<50 ? "teach" : scoreState(pick).mastery>=85 ? "review" : "practice");
 return pick;
}

function coachReason(id){
 let m=META[id],s=scoreState(id);
 if(sess.mode==="recover")return"recovery prerequisite";
 if(sess.mode==="stretch")return"stretch +1 Darjah";
 if(sess.mode==="recheck")return"recheck selepas recovery";
 if(db.focus===id)return"parent focus";
 if(s.evidence===0)return"coverage baharu";
 if(sess.mode==="teach")return"skill belum stabil";
 if(sess.mode==="review")return"spaced review";
 return"curriculum practice";
}
