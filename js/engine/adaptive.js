function scoreState(id){return db.skills[id]}
function evidenceQuality(sec,q,usedHint){ let x=1;if(usedHint)x*=.55; if(sec<.65)x*=.3; else if(sec<1.15)x*=.62; if(q.diagnostic)x*=1.08; if(q.formatShift)x*=1.08; return Math.max(.22,Math.min(1.2,x)) }
function coreGrade(){return db.schoolGrade||2}
function recoveryGrade(){return Math.max(1,coreGrade()-1)}
function stretchGrade(){return Math.min(6,coreGrade()+1)}
function prereqReady(id){ return (META[id].prereq||[]).every(p=>scoreState(p).mastery>=45 || META[p].grade<coreGrade()) }
function coreChapterSkills(ch){return GRAPH.skills.filter(x=>x.grade===coreGrade()&&String(x.chapter)===String(ch))}
function chapterScore(ch){let arr=coreChapterSkills(ch), active=arr.filter(x=>scoreState(x.id).evidence>0); if(!active.length)return 0; return arr.reduce((z,x)=>z+(scoreState(x.id).evidence?scoreState(x.id).mastery:0),0)/arr.length}
function chapterEvidence(ch){return coreChapterSkills(ch).reduce((z,x)=>z+scoreState(x.id).evidence,0)}
function totalChapters(){return [...new Set(GRAPH.skills.filter(x=>x.grade===coreGrade()).map(x=>String(x.chapter)))].length || 1}
function updateFrontier(){
 while(db.coreFrontier<totalChapters()){
  let ch=db.coreFrontier;
  if(chapterScore(ch)>=CFG.unlock_mastery && chapterEvidence(ch)>=Math.max(CFG.min_evidence_unlock,coreChapterSkills(ch).length*2-1)){
   db.coreFrontier++; log(`Coach buka Topik ${gradeLabel(coreGrade())}.${db.coreFrontier}: topik sebelumnya cukup stabil untuk expansion.`);
  } else break;
 }
}
function needsRecovery(coreId){ let s=scoreState(coreId); if(coreGrade()===1 || META[coreId].grade!==coreGrade() || !REC[coreId])return false; return s.evidence>=3 && (s.mastery<CFG.recovery_trigger_mastery || (s.wrong>=2 && s.confidence<CFG.recovery_trigger_confidence)) }
function chooseRecovery(coreId){ let candidates=(REC[coreId]||[]).filter(id=>META[id]&&META[id].grade===recoveryGrade()); if(!candidates.length)return null; candidates.sort((a,b)=>(scoreState(a).mastery+scoreState(a).confidence*.5)-(scoreState(b).mastery+scoreState(b).confidence*.5)); return candidates[0] }
function canStretch(coreId){ let s=scoreState(coreId), tgt=STR[coreId]; if(!tgt || coreGrade()===6)return false; return s.evidence>=CFG.stretch_min_evidence && s.mastery>=CFG.stretch_trigger_mastery && s.confidence>=CFG.stretch_trigger_confidence }


const BOSS_STRETCH_D3_BY_CHAPTER={
 '1':['D3.N10000','D3.PV10000'],
 '2':['D3.ADD10000','D3.SUB10000','D3.MUL','D3.DIV'],
 '3':['D3.FRAC','D3.DEC','D3.PERCENT'],
 '4':['D3.MONEY'],
 '5':['D3.TIME'],
 '6':['D3.MEASURE'],
 '7':['D3.SHAPE','D3.POSITION'],
 '8':['D3.DATA']
};
function chooseBossStretchSkill(ch){
 const pool=(BOSS_STRETCH_D3_BY_CHAPTER[String(ch)]||[]).filter(id=>META[id]&&scoreState(id));
 if(!pool.length)return null;
 const unseen=pool.filter(id=>scoreState(id).evidence===0);
 return (unseen.length?unseen:pool)[Math.floor(Math.random()*(unseen.length?unseen:pool).length)];
}
function inManualBossPhase(){
 return !!(sess&&sess.missionChapter&&!sess.coachAdaptive&&!sess.devBankTest&&(sess.missionAnswered||0)>=PROGRESSION.regularMissionQuestions&&!sess.bossDefeated);
}

function chooseManualMissionSkill(){
 const chapter=String(sess.missionChapter||'');
 // Boss question #5 is one deliberate +1-grade probe. It is evidence of stretch, not a D2 prerequisite.
 if(inManualBossPhase()&&!sess.bossStretchAsked&&Number(sess.bossQuestionsAnswered||0)>=4){
   const stretch=chooseBossStretchSkill(chapter);
   if(stretch){sess.bossStretchAsked=true;sess.bossStretchCurrent=true;sess.mode='stretch';return stretch;}
 }
 sess.bossStretchCurrent=false;
 let pool=GRAPH.skills.filter(x=>x.grade===coreGrade()&&String(x.chapter)===chapter);
 if(!pool.length)return GRAPH.skills.find(x=>x.grade===coreGrade())?.id;
 let ranked=pool.map(m=>{
   const st=scoreState(m.id),coverage=st.evidence===0?3.4:st.evidence<2?2.1:1;
   const need=st.mastery<35?2.4:st.mastery<55?1.8:st.mastery<75?1.25:.65;
   const repeat=sess.recent.slice(-CFG.anti_repeat_window).includes(m.id)?.16:1;
   return [m.id,coverage*need*repeat*(.9+Math.random()*.2)];
 }).sort((a,b)=>b[1]-a[1]);
 sess.mode=scoreState(ranked[0][0]).evidence<2?'calibrate':'practice';
 return ranked[0][0];
}
function chooseModeAndSkill(){
 if(sess&&sess.devBankTest&&sess.devSkill){sess.mode="dev";return sess.devSkill}
 if(sess&&sess.guardianFocus&&sess.focusSkill){sess.mode="focus";return sess.focusSkill}
 const confirm=confirmationSkill();if(confirm){sess.mode="confirm";return confirm}
 if(sess&&sess.coachAdaptive)return chooseCoachFrontierSkill();
 if(sess&&sess.missionChapter&&!sess.coachAdaptive&&!sess.devBankTest)return chooseManualMissionSkill();
 updateFrontier();
 if(sess.recoveryFor){ let rid=chooseRecovery(sess.recoveryFor); if(rid){ let rs=scoreState(rid); if(rs.evidence<3 || rs.mastery<65){ sess.mode="recover"; return rid; } } log(`Recovery selesai untuk ${sess.recoveryFor}; coach kembali ke skill asal.`); let ret=sess.recoveryFor;sess.recoveryFor=null;sess.mode="recheck";return ret; }
 if(sess.stretchFor){ let sid=STR[sess.stretchFor], ss=scoreState(sid); if(ss && ss.evidence<3 && ss.probeFail<2){sess.mode="stretch";return sid} let base=sess.stretchFor; if(ss && ss.probePass>=2) log(`${base} menunjukkan bukti melebihi ${gradeLabel(coreGrade())}; cabaran ${gradeLabel(META[sid].grade)} disahkan secara provisional.`); else log(`Stretch untuk ${base} belum stabil; coach kekalkan ${gradeLabel(coreGrade())} sebagai working level.`); sess.stretchFor=null;sess.mode="review";return base; }
 let core = GRAPH.skills.filter(x=>x.grade===coreGrade() && +x.chapter<=db.coreFrontier);
 let weighted=[];
 for(let m of core){ let s=scoreState(m.id); let coverage=s.evidence===0?3.2:s.evidence<2?2.0:1; let weak=s.evidence>=2?(s.mastery<35?2.5:s.mastery<50?1.9:s.mastery<70?1.35:s.mastery<85?.85:.42):1; let frontier=(+m.chapter===db.coreFrontier?1.35:1); let spaced=(Date.now()-s.lastSeen>24*36e5?1.35:1); let focus=(db.focus===m.id?CFG.parent_focus_boost:1); let mission=(sess.missionChapter&&String(m.chapter)===String(sess.missionChapter)?PROGRESSION.missionBoost:1); let repeat=sess.recent.slice(-CFG.anti_repeat_window).includes(m.id)?.12:1; let score=coverage*weak*frontier*spaced*focus*mission*repeat*(.88+Math.random()*.24); weighted.push([m.id,score]); }
 weighted.sort((a,b)=>b[1]-a[1]); let pool=weighted.slice(0,Math.min(4,weighted.length)), total=pool.reduce((z,x)=>z+x[1],0), r=Math.random()*total, pick=pool[0][0]; for(let x of pool){r-=x[1]; if(r<=0){pick=x[0];break}}
 if(needsRecovery(pick)){ let rid=chooseRecovery(pick); if(rid){sess.recoveryFor=pick;sess.mode="recover";log(`${pick} lemah; coach turun sementara ke prerequisite ${rid} untuk cari root cause.`);return rid} }
 if(canStretch(pick) && Math.random()<.42){ sess.stretchFor=pick;sess.mode="stretch";log(`${pick} kuat; coach mulakan stretch probe ${STR[pick]}.`);return STR[pick] }
 sess.mode = scoreState(pick).evidence<2 ? "calibrate" : (scoreState(pick).mastery<50 ? "teach" : scoreState(pick).mastery>=85 ? "review" : "practice");
 return pick;
}
function coachReason(id){ let s=scoreState(id); if(sess.mode==="recover")return"recovery prerequisite"; if(sess.mode==="stretch")return"stretch +1 Darjah"; if(sess.mode==="recheck")return"recheck selepas recovery"; if(db.focus===id)return"parent focus"; if(s.evidence===0)return"coverage baharu"; if(sess.mode==="teach")return"skill belum stabil"; if(sess.mode==="review")return"spaced review"; return"curriculum practice" }
