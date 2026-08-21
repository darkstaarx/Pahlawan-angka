let db=JSON.parse(localStorage.getItem("pa_coach_v6_full")||localStorage.getItem("pa_coach_v5")||"null");
let uiSession=JSON.parse(localStorage.getItem('pa_dummy_login')||'null');
const MINION_ENEMIES=[
 {name:'Askabus',image:'assets/enemies/minions/askabus.webp',tone:'minion-a'},
 {name:'Syilinggit',image:'assets/enemies/minions/syilinggit.webp',tone:'minion-b'},
 {name:'Pigiramid',image:'assets/enemies/minions/pigiramid.webp',tone:'minion-c'}
];
const BOSS_BY_CHAPTER={
 '1':{name:'Maharaja Nilai Tempat',image:'assets/enemies/place-value/maharaja-nilai-tempat.webp',frames:'assets/enemies/place-value/frames',tone:'place'},
 '2':{name:'Jeneral Tambah-Tolak',image:'assets/enemies/operations/jeneral-tambah-tolak.webp',frames:'assets/enemies/operations/frames',tone:'operation'},
 '3':{name:'Bahbahgi',image:'assets/enemies/fractions/bahbahgi.webp',tone:'fraction'},
 '4':{name:'Penjaga Wang',image:'assets/enemies/money/penjaga-wang.webp',frames:'assets/enemies/money/frames',tone:'money'},
 '5':{name:'Penguasa Jam Berdetik',image:'assets/enemies/time/penguasa-jam-berdetik.webp',frames:'assets/enemies/time/frames',tone:'time'},
 '6':{name:'Penjaga Ukuran',image:'assets/enemies/measurement/penjaga-ukuran.webp',frames:'assets/enemies/measurement/frames',tone:'measurement'},
 '7':{name:'Penjaga Ruang',image:'assets/enemies/geometry/penjaga-ruang.webp',frames:'assets/enemies/geometry/frames',tone:'geometry'},
 '8':{name:'Penjaga Data',image:'assets/enemies/data/penjaga-data.webp',frames:'assets/enemies/data/frames',tone:'data'}
};
const TERRAIN_BY_THEME={
 number:'assets/battlefields/forest-temple/arena-v1.webp',
 operation:'assets/battlefields/operations-forge/arena-v1.webp',
 fraction:'assets/battlefields/cave-temple/arena-depth-v2.webp',
 money:'assets/battlefields/money-market/arena-v1.webp',
 time:'assets/battlefields/time-tower/arena-v1.webp',
 measure:'assets/battlefields/measurement-court/arena-v1.webp',
 shape:'assets/battlefields/nusantara-temple/arena-v1.webp',
 data:'assets/battlefields/data-observatory/arena-v1.webp'
};
function terrainThemeFor(meta){
 const domain=String(meta?.domain||'').toLowerCase(),chapter=Number(meta?.chapter||0);
 if(/wang/.test(domain)||chapter===4)return'money';
 if(/masa/.test(domain)||chapter===5)return'time';
 if(/ukuran|panjang|jisim|isipadu/.test(domain)||chapter===6)return'measure';
 if(/ruang|bentuk|koordinat|kedudukan/.test(domain)||chapter===7)return'shape';
 if(/data|kebolehjadian/.test(domain)||chapter===8)return'data';
 if(/pecahan|perpuluhan|peratus|nisbah|kadaran/.test(domain)||chapter===3)return'fraction';
 if(/operasi|tambah|tolak|darab|bahagi/.test(domain)||chapter===2)return'operation';
 return'number';
}
function setBattleTerrain(meta){
 const arena=document.getElementById('battleArena');if(!arena)return;
 const theme=terrainThemeFor(meta),src=TERRAIN_BY_THEME[theme]||TERRAIN_BY_THEME.number;
 const absoluteSrc=new URL(`${src}?v=3.16.3`,document.baseURI).href,value=`url("${absoluteSrc}")`;
 if(arena.dataset.terrain===theme&&arena.style.getPropertyValue('--battle-terrain')===value)return;
 arena.dataset.terrain=theme;arena.style.setProperty('--battle-terrain',value);
}
if(db && !db.schoolGrade) db.schoolGrade=2;
let selectedHero='wira';
let sess={hp:20,ehp:12,streak:0,q:null,start:0,hint:false,enemy:1,recent:[],mode:"calibrate",recoveryFor:null,stretchFor:null};
function save(){localStorage.setItem("pa_coach_v6_full",JSON.stringify(db))}
function initSkill(id){
 if(!db.skills[id]) db.skills[id]={mastery:(META[id].grade===db.schoolGrade?18:0),confidence:8,evidence:0,correct:0,wrong:0,hints:0,mis:{},lastSeen:0,stability:0,probePass:0,probeFail:0};
}
function initAll(){GRAPH.skills.forEach(x=>initSkill(x.id))}
function chooseHero(id){selectedHero=id;document.querySelectorAll('.heroPick').forEach(x=>{const active=x.id==='pick-'+id;x.classList.toggle('active',active);x.setAttribute('aria-pressed',active?'true':'false')})}
function applyHeroToBattle(){
 let h=HEROES[(db&&db.hero)||selectedHero||"wira"];
 document.getElementById('heroName').textContent=h.name;
 document.getElementById('heroIdle').src=h.idle;
 document.getElementById('heroAnticipation').src=h.anticipation;
 document.getElementById('heroAttack').src=h.attack;
 document.getElementById('heroFollowThrough').src=h.followThrough;
 document.getElementById('iceFx').style.display=h.theme==='ice'?'block':'none';
 document.getElementById('bloomFx').src=h.finisher;
 document.getElementById('bloomFx').style.display=h.theme==='bloom'?'block':'none';
 applyEnemyVariant();
 if(typeof renderBattlePet==='function')renderBattlePet();
}

function setupHeroPicker(){
 refreshLoginResume();
 let w=document.getElementById('pickImgWira'),b=document.getElementById('pickImgBunga');
 if(w)w.src=HEROES.wira.idle;
 if(b)b.src=HEROES.bunga.idle;
 chooseHero((db&&db.hero)||selectedHero||'wira');
 if(db){document.getElementById('resume').innerHTML=`<button class=\"btn secondary\" onclick=\"resumeGame()\">Sambung ${db.name} · Darjah ${db.schoolGrade} · ${HEROES[db.hero||'wira'].name}</button>`} refreshLoginResume();
}
function currentCoreSkills(){ return GRAPH.skills.filter(x=>x.grade===db.schoolGrade) }
function chapterCountForGrade(g){ return [...new Set(GRAPH.skills.filter(x=>x.grade===g).map(x=>String(x.chapter)))].length || 1 }
function startNew(){
 let g=+document.getElementById('gradeSelect').value||2;
 db={name:document.getElementById("child").value.trim()||"Anak",schoolGrade:g,hero:selectedHero||"wira",skills:{},coreFrontier:1,focus:null,logs:[],created:Date.now(),xp:0,coins:0,level:1,completedMissions:{},chapterStars:{},activeMissionChapter:null,rewards:{pets:{},auras:{},badges:{},equippedPet:null,equippedAura:null,firstMissionDone:false,firstBossDone:false,bossStretchWin:false}};
 initAll();ensureProgression();save();renderHub()
}
function resumeGame(){if(db&&db.hero)selectedHero=db.hero;initAll();ensureProgression();if(playSfx)playSfx('ui');renderHub()}
function resetAll(){if(confirm("Reset semua progress coach?")){localStorage.removeItem("pa_coach_v6_full");location.reload()}}
function screen(id){
  document.querySelectorAll(".screen").forEach(x=>x.classList.remove("on"));
  const target=document.getElementById(id); if(target) target.classList.add("on");
  document.body.dataset.screen=id;
  if(typeof syncBattleAudio==='function')syncBattleAudio(id);
  updateBottomNav(id);
  updateDevQuickButton();
  window.scrollTo({top:0,left:0,behavior:"auto"});
}
function updateBottomNav(id){
  const nav=document.getElementById("appBottomNav"); if(!nav)return;
  const visible=["hub","missions","treasure","parent"].includes(id);
  nav.classList.toggle("show",visible);
  nav.querySelectorAll(".navItem").forEach(b=>b.classList.remove("active"));
  const key=id==="treasure"?"treasure":id==="parent"?"parent":id==="missions"?"mission":id==="hub"?"hub":"";
  const active=key&&nav.querySelector(`[data-nav="${key}"]`); if(active)active.classList.add("active");
}
function navHome(){ if(!db)return goLogin(); renderHub(); }
function navMission(){ if(!db)return goLogin(); if(typeof renderMissions==="function")renderMissions(); else screen("missions"); }
function isDemoStudent(){return !!(uiSession&&uiSession.role==='student')}
let devVersionTaps=0,devVersionTapTimer=null;
function tapVersionForDev(){
 devVersionTaps++;clearTimeout(devVersionTapTimer);devVersionTapTimer=setTimeout(()=>devVersionTaps=0,1200);
 if(devVersionTaps<3)return;devVersionTaps=0;
 const local=location.hostname==='localhost'||location.hostname==='127.0.0.1'||location.hostname==='[::1]';
 if(!local&&window.PACommercial?.canUseDev?.()!==true){localStorage.removeItem('pa_dev_unlocked');if(db)db.devMode=false;showRewardToast('DEV hanya tersedia untuk pentadbir.');return}
 localStorage.setItem('pa_dev_unlocked','1');
 if(db){db.devMode=true;save();updateDevQuickButton();openDevPanel()}else{showRewardToast('DEV dibuka · masuk sebagai Murid dahulu')}
}
function updateDevQuickButton(){const b=document.getElementById('devQuickBtn');if(!b)return;b.classList.toggle('hidden',!(db&&isDevMode()));}
function openDevPanel(){if(!(db&&isDevMode()))return;renderDevPanel();document.getElementById('devOverlay')?.classList.remove('hidden');document.body.classList.add('dev-open');}
function closeDevPanel(){document.getElementById('devOverlay')?.classList.add('hidden');document.body.classList.remove('dev-open');}
function goGame(){db?renderHub():screen("login")}
function openParent(){if(!db)return;openParentPin()}
function gradeLabel(n){return `Darjah ${n}`}
function roleLabel(g){ if(!db) return 'Misi'; if(g<db.schoolGrade) return 'Misi Asas'; if(g>db.schoolGrade) return 'Cabaran Bonus'; return 'Misi Matematik'; }
function nextQ(){
 if(sess.learningActive)return;
 let id=chooseModeAndSkill(),m=META[id],s=scoreState(id),q=generate(id,s);q.skill=id;sess.q=q;sess.start=performance.now();sess.hint=false;sess.hintLevel=0;sess.retryState=null;
 sess.questionToken=(sess.questionToken||0)+1;q.token=sess.questionToken;
 sess.recent.push(id);if(sess.recent.length>10)sess.recent.shift();
 document.getElementById("skillTitle").textContent=sess.bossStretchCurrent?`Cabaran Boss · Darjah ${m.grade} · ${m.domain}`:(m.grade===db.schoolGrade?(m.textbookUnit?`Unit ${m.textbookUnit} · ${m.textbookUnitTitle}`:m.title):(m.grade>db.schoolGrade?`Cabaran Bonus · ${m.domain}`:`Misi Asas · ${m.domain}`));
 document.getElementById("why").textContent="";
 document.getElementById("coachMode").textContent=sess.guardianFocus?"Fokus Penjaga":(sess.devBankTest?"DEV TEST":(sess.mode==="recover"?"Bantuan":(sess.mode==="stretch"?"Bonus":"Misi")));
 document.getElementById("gradeLayer").textContent=m.grade===db.schoolGrade?gradeLabel(m.grade):(m.grade<db.schoolGrade?"Asas":"Bonus");
 document.getElementById("mastery").style.width=sess.devBankTest?Math.max(3,s.mastery)+"%":Math.min(100,Math.round((sess.missionAnswered||0)/(sess.coachAdaptive?PROGRESSION.coachMinQuestions:PROGRESSION.missionQuestions)*100))+"%";
 document.getElementById("kind").textContent=sess.bossStretchCurrent?`Cabaran Boss · ${m.title}`:m.title;
 document.getElementById("evidence").textContent=sess.guardianFocus?`Soalan ${(sess.missionAnswered||0)+1}/${sess.focusTarget}`:(sess.devBankTest?`${id} · Test ${(sess.missionAnswered||0)+1}`:(sess.coachAdaptive?`Cabaran Cikgu ${(sess.missionAnswered||0)+1}`:(sess.bossStretchCurrent?'Cabaran Boss +1 Darjah':`Soalan ${(sess.missionAnswered||0)+1}`))); updateMissionHud();
 applyEnemyVariant();
 document.getElementById("question").innerHTML=q.prompt;document.getElementById("feedback").textContent="";
 const hintButton=document.querySelector('.hintBtn');if(hintButton){hintButton.classList.remove('needs-help','used');hintButton.disabled=false;hintButton.setAttribute('aria-label','Guna Petunjuk');}
 let e=document.getElementById("answers");e.innerHTML="";
 shuffle([{v:q.answer,tag:"correct",label:q.answer},...q.wrong]).forEach(o=>{let b=document.createElement("button");b.className="ans";b.textContent=o.label??o.v;b.dataset.v=String(o.v);b.dataset.questionToken=String(q.token);b.onclick=()=>respond(o,b,q);e.appendChild(b)})
}
function log(t){db.logs.unshift({t:Date.now(),text:t});db.logs=db.logs.slice(0,180)}
function setupBattleHud(){
 const arena=document.getElementById('battleArena');
 ['hero','enemy'].forEach(id=>{
  const unit=document.getElementById(id),name=unit?.querySelector('.nm'),hp=unit?.querySelector('.hp');
  if(!arena||!unit||!name||!hp)return;
  let hud=arena.querySelector(':scope > .'+id+'Hud');
  if(!hud){hud=document.createElement('div');hud.className='unitHud '+id+'Hud';arena.appendChild(hud);}
  hud.append(name,hp);
 });
}
setupHeroPicker();
setupBattleHud();
screen('login');refreshLoginResume();

function enemyStageForQuestion(){
  const answered=Number(sess?.missionAnswered||0);
  if(sess?.devBankTest)return {tier:'minion',index:answered%3};
  if(sess?.coachAdaptive){
    if(sess.bossActive&&sess.coachBossChapter)return {tier:'boss',chapter:String(sess.coachBossChapter)};
    const checkpoint=answered>0 && (answered+1)%10===0;
    const ch=String(META[sess?.q?.skill]?.chapter||'');
    if(checkpoint&&BOSS_BY_CHAPTER[ch]){
      sess.bossActive=true;sess.coachBossChapter=ch;
      return {tier:'boss',chapter:ch};
    }
    return {tier:'minion',index:Math.floor(answered/3)%3};
  }
  if(sess?.missionChapter){
    if(answered>=PROGRESSION.regularMissionQuestions && !sess.bossDefeated)return {tier:'boss',chapter:String(sess.missionChapter)};
    return {tier:'minion',index:Math.min(2,Math.floor(answered/3))};
  }
  return {tier:'minion',index:Math.floor(answered/3)%3};
}
function applyEnemyVariant(forceReset=false){
  const stage=enemyStageForQuestion();
  const e=stage.tier==='boss' ? BOSS_BY_CHAPTER[stage.chapter] : MINION_ENEMIES[stage.index||0];
  if(!e)return;
  const key=stage.tier==='boss'?`boss-${stage.chapter}`:`minion-${stage.index||0}`;
  const isNewEnemy=forceReset||sess.enemyKey!==key;
  const terrainMeta=sess?.q?.skill?META[sess.q.skill]:null;
  if(terrainMeta&&(isNewEnemy||sess.terrainEnemyKey!==key)){
    setBattleTerrain(terrainMeta);
    sess.terrainEnemyKey=key;
  }
  if(isNewEnemy){
    sess.enemyKey=key;
    sess.enemyMaxHp=stage.tier==='boss'?PROGRESSION.bossHits*4:12;
    sess.ehp=sess.enemyMaxHp;
  }
  sess.enemyTier=stage.tier;
  if(stage.tier==='boss')sess.bossActive=true;
  const nm=document.getElementById('enemyName'), sp=document.getElementById('enemySprite'), enemy=document.getElementById('enemy');
  const anticipation=document.getElementById('enemyAnticipation'),attack=document.getElementById('enemyAttack'),follow=document.getElementById('enemyFollowThrough');
  if(nm) nm.textContent=e.name;
  if(sp){sp.src=e.image;sp.alt=e.name;}
  [anticipation,attack,follow].forEach(frame=>{if(frame){frame.removeAttribute('src');frame.alt='';}});
  if(stage.tier==='boss'&&e.frames){
    anticipation.src=e.frames+'/anticipation.webp';
    attack.src=e.frames+'/contact.webp';
    follow.src=e.frames+'/follow-through.webp';
  }
  if(enemy){
    enemy.dataset.enemyTone=e.tone;enemy.dataset.enemyTier=stage.tier;
    enemy.classList.remove('phase-anticipation','phase-contact','phase-follow-through','phase-recover');
    enemy.classList.remove('defeat-crack','defeat-shatter');
    enemy.querySelector('.monster-defeat-layer')?.remove();
    if(sp){sp.style.opacity='';sp.style.visibility='';}
    enemy.classList.remove('tone-place','tone-operation','tone-fraction','tone-money','tone-time','tone-measurement','tone-geometry','tone-data','tone-minion-a','tone-minion-b','tone-minion-c');
    enemy.classList.add('tone-'+e.tone);
  }
  if(typeof setBattleAudioMode==='function')setBattleAudioMode(stage.tier==='boss'?'boss':'ambient');
  battle();
  if(stage.tier==='boss'&&isNewEnemy&&typeof triggerBossEntrance==='function')setTimeout(triggerBossEntrance,40);
}
function nextEnemy(){ sess.enemy=(sess.enemy||1)+1;applyEnemyVariant(true); }
function goLogin(){ screen('login'); refreshLoginResume(); if(typeof updateSoundButtons==='function')updateSoundButtons(); }
function goSetup(){ if(db){ const child=document.getElementById('child'), grade=document.getElementById('gradeSelect'); if(child) child.value=db.name||''; if(grade) grade.value=String(db.schoolGrade||2); chooseHero(db.hero||selectedHero||'wira'); } screen('setup') }
function goSetupAsGuest(){ if(typeof playSfx==='function')playSfx('ui'); screen('setup') }
function setLoginError(msg=''){ const e=document.getElementById('loginError'); if(e){e.textContent=msg;e.classList.toggle('show',!!msg)} }
function loginRoute(role){
  uiSession={role,email:role==='parent'?'parent@demo.com':'student@demo.com',ts:Date.now()};
  localStorage.setItem('pa_dummy_login',JSON.stringify(uiSession));
  setLoginError(''); if(typeof playSfx==='function')playSfx('ui');
  if(role==='parent'){
    if(db){ initAll();ensureProgression();openParentPin(); }
    else { setLoginError('Belum ada profil murid. Cipta profil murid dahulu.'); setTimeout(()=>screen('setup'),650); }
  } else {
    if(db){ if(db.hero)selectedHero=db.hero;initAll();ensureProgression();renderHub(); }
    else screen('setup');
  }
}
function quickDemoLogin(role){ if(role==='parent'){openParentPin();return;} loginRoute(role); }
function dummyLogin(){
  const email=(document.getElementById('loginEmail')?.value||'').trim().toLowerCase();
  const pass=document.getElementById('loginPass')?.value||'';
  if(pass!=='123456'){setLoginError('Kata laluan demo salah. Gunakan 123456.'); if(typeof playSfx==='function')playSfx('wrong'); return;}
  if(email==='student@demo.com'){loginRoute('student');return;}
  if(email==='parent@demo.com'){openParentPin();return;}
  setLoginError('Akaun demo tidak dikenali. Gunakan student@demo.com atau parent@demo.com.'); if(typeof playSfx==='function')playSfx('wrong');
}
function logoutDemo(){ uiSession=null; localStorage.removeItem('pa_dummy_login'); goLogin(); }
function refreshLoginResume(){
  const el=document.getElementById('loginResume'); if(!el) return;
  if(db){ el.innerHTML=`<button class="btn secondary heroStart" onclick="loginRoute('student')"><img class="resumeIcon" src="assets/ui/login/menu-arrow.svg" alt="">Sambung ${db.name||'permainan'} · Darjah ${db.schoolGrade||2}</button>`; }
  else el.innerHTML='';
}
function returnFromLearning(){ if(confirm('Keluar dari Kem Latihan dan kembali ke hub?')){learningState=null;sess.learningActive=false;sess.questionToken=(sess.questionToken||0)+1;goHub()} }

function openParentPin(){
  if(!db){setLoginError('Belum ada profil murid. Cipta profil murid dahulu.');return;}
  const input=document.getElementById('parentPinInput'),err=document.getElementById('parentPinError');
  if(input)input.value='';if(err){err.textContent='';err.classList.remove('show')}
  const title=document.querySelector('#parentPin .parentPinCard h2'),button=document.querySelector('#parentPin .parentPinCard .btn'),creating=!db.parentPin;
  if(title)title.textContent=creating?'Cipta PIN Ibu Bapa':'PIN Ibu Bapa';if(button)button.textContent=creating?'Simpan PIN':'Buka Parent Mode';
  screen('parentPin');setTimeout(()=>input&&input.focus(),80);
}
function verifyParentPin(){
  const input=document.getElementById('parentPinInput'),err=document.getElementById('parentPinError');
  const pin=(input?.value||'').trim();
  if(!/^\d{4}$/.test(pin)){if(err){err.textContent='Masukkan 4 digit PIN.';err.classList.add('show')}if(typeof playSfx==='function')playSfx('wrong');return;}
  if(!db.parentPin){db.parentPin=pin;save();}else if(pin!==db.parentPin){if(err){err.textContent='PIN tidak tepat.';err.classList.add('show')}if(typeof playSfx==='function')playSfx('wrong');return;}
  uiSession={role:'parent',email:'parent@demo.com',ts:Date.now(),pinVerified:true};localStorage.setItem('pa_dummy_login',JSON.stringify(uiSession));
  if(typeof playSfx==='function')playSfx('ui');renderParent();screen('parent');
}

// UI shell boot state
requestAnimationFrame(()=>{document.body.dataset.screen=document.querySelector('.screen.on')?.id||'login';updateBottomNav(document.body.dataset.screen)});
