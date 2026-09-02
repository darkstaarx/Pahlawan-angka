// Behaviour + misconception intervention detector.
const INTERVENTION_CFG={
  sameMisconception:2,
  wrongWindow:5,
  wrongThreshold:3,
  guessSec:1.15,
  guessWrongThreshold:3,
  hintWindow:5,
  hintThreshold:3,
  cooldownQuestions:3
};

function ensureCoachMemory(){
  if(!db)return;
  db.coachMemory=db.coachMemory||{};
  db.coachMemory.interventions=db.coachMemory.interventions||{};
  db.coachMemory.recovered=db.coachMemory.recovered||{};
  db.coachMemory.skillProfiles=db.coachMemory.skillProfiles||{};
  db.masteryRewards=db.masteryRewards||{};
}
function coachSkillProfile(skillId){
  ensureCoachMemory();
  const profiles=db.coachMemory.skillProfiles;
  return profiles[skillId]||(profiles[skillId]={interventions:0,strategyUses:{},strategySuccess:{},failedCycles:0,lastNeed:'',lastStrategy:''});
}
function coachNeedFromEvidence(skillId,type,tag){
  const recent=recentForSkill(skillId,8),wrong=recent.filter(x=>!x.ok),hints=recent.filter(x=>x.hint).length;
  const same=wrong.filter(x=>x.tag&&x.tag===tag).length;
  if(type==='guessing'||wrong.filter(x=>x.sec>0&&x.sec<INTERVENTION_CFG.guessSec).length>=3)return'impulsive';
  if(type==='hint_dependence'||hints>=3)return'scaffold';
  if(type==='misconception'||same>=2)return'concept';
  return'uncertain';
}
function strategyLadderForNeed(need){
  if(need==='impulsive')return['micro','contrast','model'];
  if(need==='scaffold')return['micro','model','contrast'];
  if(need==='concept')return['contrast','model','micro'];
  return['model','contrast','micro'];
}
function coachStrategyPlan(skillId,type,tag){
  const profile=coachSkillProfile(skillId),need=coachNeedFromEvidence(skillId,type,tag),ladder=strategyLadderForNeed(need);
  const ranked=ladder.map((strategy,index)=>({strategy,index,success:Number(profile.strategySuccess[strategy]||0),uses:Number(profile.strategyUses[strategy]||0)}))
    .sort((a,b)=>(b.success-b.uses*.15)-(a.success-a.uses*.15)||a.index-b.index);
  const strategy=ranked[0].strategy;
  profile.interventions++;profile.lastNeed=need;profile.lastStrategy=strategy;
  profile.strategyUses[strategy]=(profile.strategyUses[strategy]||0)+1;
  return{need,strategy,ladder:[strategy,...ladder.filter(x=>x!==strategy)]};
}
function recordCoachStrategyResult(skillId,strategy,ok){
  const profile=coachSkillProfile(skillId);profile.lastStrategy=strategy;
  if(ok)profile.strategySuccess[strategy]=(profile.strategySuccess[strategy]||0)+1;
  else profile.failedCycles=(profile.failedCycles||0)+1;
}
function ensureSessionHistory(){
  sess.responseHistory=sess.responseHistory||[];
  sess.interventionCooldown=sess.interventionCooldown||{};
  sess.confirmSkill=sess.confirmSkill||null;
  sess.confirmRemaining=sess.confirmRemaining||0;
}
function recordCoachResponse(skillId,ok,tag,sec,usedHint,itemId){
  ensureCoachMemory();ensureSessionHistory();
  sess.responseHistory.push({skill:skillId,ok:!!ok,tag:tag||'',sec:Number(sec)||0,hint:!!usedHint,item:String(itemId??''),t:Date.now()});
  if(sess.responseHistory.length>40)sess.responseHistory.shift();
  Object.keys(sess.interventionCooldown).forEach(k=>{sess.interventionCooldown[k]=Math.max(0,(sess.interventionCooldown[k]||0)-1)});
}
function recentForSkill(skillId,n=5){
  ensureSessionHistory();
  return sess.responseHistory.filter(x=>x.skill===skillId).slice(-n);
}
function misconceptionLabel(tag){
  if(typeof masteryMisconceptionLabel==='function')return masteryMisconceptionLabel(tag);
  const labels={
    place:'nilai tempat',digit_value:'nilai digit',units_only:'kumpul semula',same_end:'cara mengira',operation:'operasi yang sesuai',fraction:'pecahan',decimal:'perpuluhan',money:'nilai wang',time:'masa',unit:'unit ukuran',shape:'ciri bentuk',data:'carta dan data',fact:'darab',division:'bahagi',estimate:'anggaran',percent:'peratus',ratio:'nisbah',area:'luas dan isipadu',coord:'koordinat'
  };
  return labels[tag]||'bahagian ini';
}
function interventionReason(type,tag){
  const part=misconceptionLabel(tag);
  if(type==='misconception')return `Nampaknya bahagian ${part} masih mengelirukan. Jom kita buat satu contoh bersama.`;
  if(type==='guessing')return 'Jawapan tadi dipilih agak cepat. Jom kita buat satu soalan perlahan-lahan bersama.';
  if(type==='uncertain')return `Bahagian ${part} belum konsisten lagi. Jom kita fahamkan caranya dulu.`;
  if(type==='hint_dependence')return 'Petunjuk banyak membantu tadi. Jom kita belajar cara buat sendiri.';
  return 'Jom kita fahamkan bahagian ini dahulu.';
}
function evaluateIntervention(skillId){
  ensureSessionHistory();
  if(sess.devBankTest && !sess.devLearningTest)return null;
  if((sess.interventionCooldown[skillId]||0)>0)return null;
  if(window.PAEffortGuard?.shouldCoach?.(skillId))return{type:'guessing',tag:'guessing',reason:'Jawapan dipilih terlalu cepat walaupun petunjuk telah dibuka. Cikgu Dimensi akan bantu kamu berhenti, lihat dan fikir satu langkah pada satu masa.'};
  const last5=recentForSkill(skillId,5);
  if(last5.length<2)return null;

  const wrong=last5.filter(x=>!x.ok);
  // A retry on the same item is supporting evidence, not a second independent
  // misconception. Intervention requires the same tag on two distinct items.
  const tagItems={};
  wrong.forEach(x=>{if(x.tag&&x.tag!=='generic'){tagItems[x.tag]=tagItems[x.tag]||new Set();tagItems[x.tag].add(x.item||`legacy-${x.t}`)}});
  const repeated=Object.entries(tagItems).map(([tag,items])=>[tag,items.size]).sort((a,b)=>b[1]-a[1])[0];
  if(repeated&&repeated[1]>=INTERVENTION_CFG.sameMisconception){
    return{type:'misconception',tag:repeated[0],reason:interventionReason('misconception',repeated[0])};
  }
  const guesses=last5.filter(x=>!x.ok&&x.sec>0&&x.sec<INTERVENTION_CFG.guessSec);
  if(guesses.length>=INTERVENTION_CFG.guessWrongThreshold){
    return{type:'guessing',tag:'guessing',reason:interventionReason('guessing','guessing')};
  }
  if(wrong.length>=INTERVENTION_CFG.wrongThreshold){
    return{type:'uncertain',tag:wrong[wrong.length-1]?.tag||'generic',reason:interventionReason('uncertain',wrong[wrong.length-1]?.tag||'generic')};
  }
  const hints=last5.filter(x=>x.hint).length;
  if(hints>=INTERVENTION_CFG.hintThreshold){
    return{type:'hint_dependence',tag:'hint',reason:interventionReason('hint_dependence','hint')};
  }
  return null;
}
function scheduleConfirmation(skillId,count=2){
  ensureSessionHistory();
  if(sess.devBankTest)return;
  sess.confirmSkill=skillId;
  sess.confirmRemaining=Math.max(sess.confirmRemaining||0,count);
}
function consumeConfirmation(skillId){
  if(sess.confirmSkill!==skillId)return;
  sess.confirmRemaining=Math.max(0,(sess.confirmRemaining||0)-1);
  if(sess.confirmRemaining===0)sess.confirmSkill=null;
}
function confirmationSkill(){
  ensureSessionHistory();
  return sess.confirmSkill&&sess.confirmRemaining>0?sess.confirmSkill:null;
}
function updateConfirmationAfterEncounter(skillId,result={}){
  ensureSessionHistory();
  if(sess.devBankTest)return;
  const wasConfirmation=sess.confirmSkill===skillId&&sess.confirmRemaining>0;
  // A confirmation question always consumes one slot, including an unresolved
  // answer. Otherwise a struggling pupil can be trapped on the same skill.
  if(wasConfirmation){
    consumeConfirmation(skillId);
    return;
  }
  // Any corrected or assisted item needs one fresh independent check.
  if(result.hadRetry&&result.correct){scheduleConfirmation(skillId,1);return}
  // An unresolved item gets a bounded pair of fresh checks.
  if(!result.correct)scheduleConfirmation(skillId,2);
}
function setInterventionCooldown(skillId){
  ensureSessionHistory();sess.interventionCooldown[skillId]=INTERVENTION_CFG.cooldownQuestions;
}
