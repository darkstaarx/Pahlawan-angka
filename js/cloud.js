(function(){
  'use strict';
  const URL='https://pxxekdeqlxwqwaqvfbnh.supabase.co';
  const KEY='sb_publishable_xVRVgrb4EP6RnFv_p6WI_g_u67xGW6C';
  const ACTIVE_SCREENS=new Set(['hub','missions','treasure','game','learning','result']);
  const state={client:null,user:null,childId:null,controls:null,timerActive:false,sessionSeconds:0,todayBefore:0,lastTick:0,lastFlush:0,lastLocalSecond:-1,dailySyncInFlight:false,dailySyncPending:false,saveTimer:null,saveInFlight:false,savePending:false,authMode:'login',locked:false,ready:false,needsOnboarding:false};
  const $=id=>document.getElementById(id);
  const message=(text,bad=false)=>{const el=$('loginError');if(!el)return;el.textContent=text||'';el.classList.toggle('show',!!text);el.classList.toggle('success',!!text&&!bad)};
  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const currentScreen=()=>document.body.dataset.screen||'';
  const playing=()=>ACTIVE_SCREENS.has(currentScreen())&&!document.hidden&&!state.locked;
  const formatTime=seconds=>{const mins=Math.floor(Math.max(0,seconds)/60),hrs=Math.floor(mins/60),rest=mins%60;return hrs?`${hrs}:${String(rest).padStart(2,'0')}`:`${String(mins).padStart(2,'0')}:${String(Math.floor(seconds%60)).padStart(2,'0')}`};
  const localDay=()=>{const now=new Date();return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`};
  const timerKey=()=>state.childId?`pa_play_seconds_${state.childId}_${localDay()}`:'';
  const readLocalSeconds=()=>Number(localStorage.getItem(timerKey())||0);
  const rememberLocalSeconds=()=>{const total=Math.floor(state.todayBefore+state.sessionSeconds);if(!timerKey()||total===state.lastLocalSecond)return;state.lastLocalSecond=total;localStorage.setItem(timerKey(),String(total));};

  function setAuthMode(mode){
    state.authMode=mode==='register'?'register':'login';
    $('authLoginTab')?.classList.toggle('active',state.authMode==='login');
    $('authRegisterTab')?.classList.toggle('active',state.authMode==='register');
    const button=$('authSubmit'),pass=$('authPassword');
    if(button)button.textContent=state.authMode==='login'?'Log masuk':'Cipta akaun penjaga';
    if(pass)pass.autocomplete=state.authMode==='login'?'current-password':'new-password';
    message('');
  }

  async function submitAuth(event){
    event?.preventDefault();
    const email=($('authEmail')?.value||'').trim().toLowerCase(),password=$('authPassword')?.value||'',button=$('authSubmit');
    if(!email||password.length<8)return message('Masukkan e-mel sah dan kata laluan minimum 8 aksara.',true);
    if(button){button.disabled=true;button.textContent='Sedang diproses…'} message('');
    try{
      if(state.authMode==='register'){
        const {data,error}=await state.client.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname}});
        if(error)throw error;
        if(!data.session)message('Akaun dicipta. Semak e-mel untuk pengesahan sebelum log masuk.');
        else await signedIn(data.session);
      }else{
        const {data,error}=await state.client.auth.signInWithPassword({email,password});
        if(error)throw error;await signedIn(data.session);
      }
    }catch(error){message(authMessage(error),true)}finally{if(button){button.disabled=false;button.textContent=state.authMode==='login'?'Log masuk':'Cipta akaun penjaga'}}
  }

  function authMessage(error){
    const raw=String(error?.message||error||'').toLowerCase();
    if(raw.includes('invalid login'))return 'E-mel atau kata laluan tidak tepat.';
    if(raw.includes('already registered'))return 'E-mel ini sudah berdaftar. Cuba log masuk.';
    if(raw.includes('rate limit'))return 'Terlalu banyak cubaan. Tunggu sebentar dan cuba lagi.';
    return 'Sambungan akaun gagal. Semak internet dan cuba semula.';
  }

  async function signedIn(session){
    state.user=session?.user||null;if(!state.user)return;
    message('');await window.PACommercial?.refresh?.();await loadProfiles();renderAccount();
  }

  async function loadProfiles(){
    const {data,error}=await state.client.from('child_profiles').select('id,display_name,grade,hero_id,updated_at').eq('is_active',true).order('created_at');
    if(error)throw error;
    state.profiles=data||[];
    if(!state.profiles.length){state.childId=null;state.needsOnboarding=true;renderAccount();screen('setup');return;}
    const remembered=localStorage.getItem('pa_active_child_id');
    const profile=state.profiles.find(p=>p.id===remembered)||state.profiles[0];
    await selectChild(profile.id,false);
    state.needsOnboarding=false;
  }

  async function selectChild(childId,navigate=true){
    await endPlaySession('user_exit');state.childId=childId;state.locked=false;localStorage.setItem('pa_active_child_id',childId);
    const profile=state.profiles.find(p=>p.id===childId);
    const [{data:saveRow,error:saveError},{data:control,error:controlError}]=await Promise.all([
      state.client.from('game_saves').select('*').eq('child_id',childId).maybeSingle(),
      state.client.from('parental_controls').select('*').eq('child_id',childId).maybeSingle()
    ]);
    if(saveError)throw saveError;if(controlError)throw controlError;
    state.controls=control||null;
    const cloudState=saveRow?.state&&Object.keys(saveRow.state).length?saveRow.state:null;
    const localMatches=db&&(!db.cloudChildId||db.cloudChildId===childId);
    const localUpdated=localMatches?Number(db.lastSavedAt||0):0;
    const cloudUpdated=saveRow?.client_updated_at?new Date(saveRow.client_updated_at).getTime():Number(cloudState?.lastSavedAt||0);
    const keepNewerLocal=!!(cloudState&&localMatches&&localUpdated>cloudUpdated);
    if(cloudState&&!keepNewerLocal){db=cloudState;}
    else if(!localMatches){db=null;}
    if(db){db.cloudChildId=childId;db.name=profile.display_name;db.schoolGrade=profile.grade;db.hero=profile.hero_id;localStorage.setItem('pa_coach_v6_full',JSON.stringify(db));}
    else{await createBlankLocal(profile);}
    await loadTodaySeconds();renderAccount();updateTimer();
    if(keepNewerLocal)await syncSaveNow();
    if(navigate||currentScreen()==='login'){initAll();ensureProgression();renderHub();}
  }

  async function createBlankLocal(profile){
    db={name:profile.display_name,schoolGrade:profile.grade,hero:profile.hero_id,cloudChildId:profile.id,skills:{},coreFrontier:1,focus:null,logs:[],created:Date.now(),xp:0,coins:0,level:1,completedMissions:{},chapterStars:{},activeMissionChapter:null,rewards:{pets:{},auras:{},badges:{},equippedPet:null,equippedAura:null,firstMissionDone:false,firstBossDone:false,bossStretchWin:false}};initAll();ensureProgression();localStorage.setItem('pa_coach_v6_full',JSON.stringify(db));await syncSaveNow();
  }

  async function attachNewChild(){
    if(!state.user||!db)return;
    try{
      const {data,error}=await state.client.rpc('create_initial_child',{child_display_name:db.name,child_grade:db.schoolGrade,child_hero_id:db.hero||'wira'});
      if(error)throw error;state.childId=data;db.cloudChildId=data;localStorage.setItem('pa_active_child_id',data);localStorage.setItem('pa_coach_v6_full',JSON.stringify(db));
      await loadProfiles();state.needsOnboarding=false;await syncSaveNow();if(playing())ensurePlaySession();showRewardToast('Progress kini disimpan ke awan ✓');
    }catch(error){console.warn('Cloud profile creation failed',error);showRewardToast('Progress disimpan pada peranti · sync akan dicuba lagi');}
  }

  function scheduleSave(){
    clearTimeout(state.saveTimer);if(!db)return;
    db.lastSavedAt=Date.now();localStorage.setItem('pa_coach_v6_full',JSON.stringify(db));
    if(!state.user||!state.childId)return;state.saveTimer=setTimeout(syncSaveNow,900);
  }
  async function syncSaveNow(){
    if(!state.user||!state.childId||!db)return false;
    if(state.saveInFlight){state.savePending=true;return false;}
    state.saveInFlight=true;clearTimeout(state.saveTimer);
    if(!db.lastSavedAt)db.lastSavedAt=Date.now();db.cloudChildId=state.childId;localStorage.setItem('pa_coach_v6_full',JSON.stringify(db));
    const snapshot=JSON.parse(JSON.stringify(db)),savedAt=Number(snapshot.lastSavedAt);
    const {error}=await state.client.from('game_saves').upsert({child_id:state.childId,schema_version:1,state:snapshot,xp:Number(snapshot.xp||0),coins:Number(snapshot.coins||0),level:Number(snapshot.level||1),active_mission_chapter:snapshot.activeMissionChapter==null?null:String(snapshot.activeMissionChapter),client_updated_at:new Date(savedAt).toISOString()},{onConflict:'child_id'});
    state.saveInFlight=false;
    if(error){console.warn('Cloud save failed',error);state.savePending=true;state.saveTimer=setTimeout(syncSaveNow,3000);return false;}
    const changed=Number(db?.lastSavedAt||0)>savedAt,pending=state.savePending;state.savePending=false;
    if(changed||pending)state.saveTimer=setTimeout(syncSaveNow,0);
    return true;
  }

  async function loadTodaySeconds(){
    if(!state.childId)return;
    const {data,error}=await state.client.from('daily_play_totals').select('active_seconds').eq('child_id',state.childId).eq('play_date',localDay()).maybeSingle();
    const cloudTotal=error?0:Number(data?.active_seconds||0),safeTotal=Math.max(cloudTotal,readLocalSeconds());
    state.timerActive=false;state.sessionSeconds=0;state.todayBefore=safeTotal;state.lastLocalSecond=Math.floor(safeTotal);state.lastTick=performance.now();state.lastFlush=safeTotal;
    rememberLocalSeconds();
  }

  function ensurePlaySession(){
    if(!state.user||!state.childId||state.timerActive||state.locked)return;
    state.timerActive=true;state.sessionSeconds=0;state.lastTick=performance.now();state.lastFlush=state.todayBefore;
  }

  async function endPlaySession(reason='user_exit'){
    if(!state.timerActive)return;tick();state.timerActive=false;state.todayBefore+=state.sessionSeconds;state.sessionSeconds=0;rememberLocalSeconds();await syncDailyTotal(reason);
  }

  async function syncDailyTotal(reason='heartbeat'){
    rememberLocalSeconds();if(!state.user||!state.childId)return false;
    if(state.dailySyncInFlight){state.dailySyncPending=true;return false;}state.dailySyncInFlight=true;
    const localTotal=Math.floor(state.todayBefore+state.sessionSeconds);
    const {data,error:readError}=await state.client.from('daily_play_totals').select('active_seconds').eq('child_id',state.childId).eq('play_date',localDay()).maybeSingle();
    if(readError){state.dailySyncInFlight=false;console.warn('Daily timer read failed',readError);return false;}
    const activeSeconds=Math.max(localTotal,Number(data?.active_seconds||0));
    const {error}=await state.client.from('daily_play_totals').upsert({child_id:state.childId,play_date:localDay(),active_seconds:activeSeconds,last_sync_reason:reason,updated_at:new Date().toISOString()},{onConflict:'child_id,play_date'});
    state.dailySyncInFlight=false;if(error){console.warn('Daily timer sync failed',error);return false;}state.lastFlush=localTotal;
    if(state.dailySyncPending){state.dailySyncPending=false;setTimeout(()=>syncDailyTotal('pending'),0);}return true;
  }

  function tick(){
    const now=performance.now();if(!state.lastTick)state.lastTick=now;
    if(playing()&&state.timerActive)state.sessionSeconds+=(now-state.lastTick)/1000;
    state.lastTick=now;rememberLocalSeconds();updateTimer();checkLimit();
    if(state.timerActive&&state.todayBefore+state.sessionSeconds-state.lastFlush>=120)syncDailyTotal();
  }

  function updateTimer(){
    const el=$('playTimer');if(!el)return;const total=state.todayBefore+state.sessionSeconds;el.querySelector('b').textContent=formatTime(total);
    const daily=Number(state.controls?.daily_limit_minutes||0)*60,session=Number(state.controls?.session_limit_minutes||0)*60;
    const remaining=Math.min(daily?daily-total:Infinity,session?session-state.sessionSeconds:Infinity);el.classList.toggle('nearLimit',remaining<300);el.classList.toggle('limitReached',remaining<=0);
    el.classList.toggle('hidden',state.controls?.show_elapsed_timer===false);
  }

  function checkLimit(){
    if(state.locked||!state.controls?.hard_lock_enabled)return;
    const daily=Number(state.controls.daily_limit_minutes||0)*60,session=Number(state.controls.session_limit_minutes||0)*60,total=state.todayBefore+state.sessionSeconds;
    if((daily&&total>=daily)||(session&&state.sessionSeconds>=session)){
      state.locked=true;const dailyHit=daily&&total>=daily;$('timeLockMessage').textContent=dailyHit?'Had masa bermain hari ini sudah dicapai. Rehat dan sambung semula esok.':'Had untuk sesi ini sudah dicapai. Ambil masa rehat sebelum sambung.';endPlaySession(dailyHit?'daily_limit':'session_limit');screen('timeLock');
    }
  }

  function renderAccount(){
    const form=$('authForm'),tabs=document.querySelector('.authTabs'),box=$('cloudAccount'),resume=$('loginResume');if(!box)return;
    const signed=!!state.user;form?.classList.toggle('hidden',signed);tabs?.classList.toggle('hidden',signed);box.classList.toggle('hidden',!signed);
    if(resume)resume.classList.toggle('hidden',!signed&&!!db?.cloudChildId);
    if(!signed){box.innerHTML='';return;}
    const profiles=(state.profiles||[]).map(p=>`<button class="cloudProfile ${p.id===state.childId?'active':''}" onclick="PACloud.selectChild('${p.id}')"><span class="cloudProfileIcon">⚔</span><span><b>${safe(p.display_name)}</b><small>Darjah ${p.grade}</small></span><em>${p.id===state.childId?'Aktif':'Pilih'}</em></button>`).join('');
    box.innerHTML=`<div class="cloudAccountHead"><span>☁</span><span><b>Akaun tersambung</b><small>${safe(state.user.email||'')}</small></span></div><div class="cloudProfiles">${profiles||'<small>Belum ada profil anak.</small>'}</div><div class="cloudAccountActions"><button class="btn secondary small" onclick="PACloud.addChild()">+ Profil anak</button><button class="btn ghost small" onclick="PACloud.logout()">Log keluar</button></div>`;
  }

  function renderParentControls(){
    const el=$('cloudParentControls');if(!el)return;if(!state.user||!state.childId){el.innerHTML='';return;}const c=state.controls||{};
    el.innerHTML=`<section class="cloudControls card"><div class="cloudControlsHead"><div><div class="eyebrow">KESEJAHTERAAN DIGITAL</div><h3>Had Masa Bermain</h3></div><span class="cloudSync">☁ Disimpan</span></div><div class="todayPlayTotal"><span>⏱</span><small>Jumlah hari ini</small><b>${formatTime(state.todayBefore+state.sessionSeconds)}</b></div><div class="limitGrid"><label>Had sehari (minit)<input id="dailyLimit" type="number" min="5" max="480" value="${c.daily_limit_minutes??''}" placeholder="Tiada had"></label><label>Had satu sesi (minit)<input id="sessionLimit" type="number" min="5" max="180" value="${c.session_limit_minutes??''}" placeholder="Tiada had"></label><label>Peringatan rehat (minit)<input id="nudgeLimit" type="number" min="5" max="120" value="${c.soft_nudge_minutes??30}"></label><label class="limitToggle"><input id="hardLock" type="checkbox" ${c.hard_lock_enabled?'checked':''}> Kunci apabila had dicapai</label><label class="limitToggle"><input id="showTimer" type="checkbox" ${c.show_elapsed_timer!==false?'checked':''}> Paparkan timer kepada anak</label></div><div class="cloudControlActions"><button class="btn primary small" onclick="PACloud.saveControls()">Simpan had</button><button class="btn ghost small" onclick="PACloud.logout()">Log keluar akaun</button></div></section>`;
  }

  async function saveControls(){
    const value=id=>{const raw=$(id)?.value;return raw===''?null:Number(raw)};
    const payload={child_id:state.childId,daily_limit_minutes:value('dailyLimit'),session_limit_minutes:value('sessionLimit'),soft_nudge_minutes:value('nudgeLimit')||30,hard_lock_enabled:!!$('hardLock')?.checked,show_elapsed_timer:!!$('showTimer')?.checked};
    const {data,error}=await state.client.from('parental_controls').upsert(payload,{onConflict:'child_id'}).select().single();if(error){showRewardToast('Tetapan gagal disimpan');return;}state.controls=data;state.locked=false;updateTimer();renderParentControls();showRewardToast('Had masa disimpan ✓');
  }

  async function saveOnboardingControls(values){
    if(!state.user||!state.childId)throw new Error('Profil anak belum tersedia');
    const payload={child_id:state.childId,...values};
    const {data,error}=await state.client.from('parental_controls').upsert(payload,{onConflict:'child_id'}).select().single();
    if(error)throw error;state.controls=data;state.locked=false;updateTimer();return data;
  }

  function addChild(){state.needsOnboarding=true;screen('setup')}

  async function logout(){await syncSaveNow();await endPlaySession('user_exit');await state.client.auth.signOut();state.user=null;state.childId=null;state.profiles=[];window.PACommercial?.reset?.();renderAccount();screen('login');}

  function wireLegacy(){
    const oldSave=window.save;window.save=function(){oldSave();scheduleSave()};
    const oldStart=window.startNew;window.startNew=function(){oldStart();if(state.user)attachNewChild()};
    const oldScreen=window.screen;window.screen=function(id){oldScreen(id);if(ACTIVE_SCREENS.has(id))ensurePlaySession();else if(['login','parent','setup'].includes(id))endPlaySession(id==='parent'?'parent_lock':'user_exit');if(id==='parent')setTimeout(renderParentControls,0)};
    if(window.PATelemetry?.response){const oldResponse=window.PATelemetry.response;window.PATelemetry.response=function(skillId,ok,tag,sec,usedHint,q,mode){oldResponse(skillId,ok,tag,sec,usedHint,q,mode);if(!state.user||!state.childId)return;state.client.from('learning_attempts').insert({client_event_id:crypto.randomUUID(),child_id:state.childId,question_id:String(q?.token||''),skill_id:String(skillId),grade:Number(db?.schoolGrade||1),is_correct:!!ok,used_hint:!!usedHint,response_ms:Math.round((Number(sec)||0)*1000),misconception_tag:ok?null:(tag||'generic'),battle_type:mode==='boss'?'boss':'practice'}).then(({error})=>{if(error)console.warn('Attempt sync failed',error)});};}
  }

  async function init(){
    if(!window.supabase?.createClient){message('Cloud login gagal dimuat. Semak internet dan muat semula.',true);return;}
    state.client=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});wireLegacy();
    const {data}=await state.client.auth.getSession();if(data.session)await signedIn(data.session);else renderAccount();
    state.client.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_IN'&&session&&session.user.id!==state.user?.id)setTimeout(()=>signedIn(session),0);if(event==='SIGNED_OUT'){state.user=null;renderAccount();}});
    setInterval(tick,1000);document.addEventListener('visibilitychange',()=>{tick();if(document.hidden){syncSaveNow();syncDailyTotal('background');}else state.lastTick=performance.now();});window.addEventListener('pagehide',()=>{tick();syncSaveNow();syncDailyTotal('pagehide');});window.addEventListener('online',()=>{syncSaveNow();syncDailyTotal('online');if(playing())ensurePlaySession()});state.ready=true;
  }

  window.PACloud={init,setAuthMode,submitAuth,selectChild,attachNewChild,scheduleSave,syncSaveNow,renderParentControls,saveControls,saveOnboardingControls,addChild,logout,state};
  init().catch(error=>{console.error('Cloud init failed',error);message('Cloud tidak dapat disambungkan. Progress lokal masih selamat.',true)});
})();
