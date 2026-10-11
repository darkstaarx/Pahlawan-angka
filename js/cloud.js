(function(){
  'use strict';
  const URL='https://pxxekdeqlxwqwaqvfbnh.supabase.co';
  const KEY='sb_publishable_xVRVgrb4EP6RnFv_p6WI_g_u67xGW6C';
  const ACTIVE_SCREENS=new Set(['hub','missions','treasure','game','learning','result']);
  const IDLE_AFTER_MS=120000;
  const state={client:null,user:null,childId:null,controls:null,timerActive:false,sessionSeconds:0,todayBefore:0,lastTick:0,lastFlush:0,lastLocalSecond:-1,lastInteractionAt:Date.now(),dailySyncInFlight:false,dailySyncPending:false,saveTimer:null,saveInFlight:false,savePending:false,saveWaiters:[],authMode:'login',locked:false,ready:false,needsOnboarding:false};
  const $=id=>document.getElementById(id);
  const offlineSave=()=>window.PAAccountSaveV1||null;
  const hasConnection=()=>navigator.onLine!==false;
  const knownKey=id=>'pa_known_children_v1:'+id;
  const rememberedGuardian='pa_last_online_guardian_v1';
  const offlineLogoutKey=id=>'pa_offline_signed_out_v1:'+id;
  const offlineNotify=status=>window.PAOfflineUI?.setSaveStatus?.(status);
  const rememberChildren=()=>{
    if(!state.user?.id||!Array.isArray(state.profiles))return;
    const safeProfiles=state.profiles.map(p=>({id:p.id,display_name:p.display_name,grade:p.grade,hero_id:p.hero_id,avatar_id:p.avatar_id}));
    localStorage.setItem(knownKey(state.user.id),JSON.stringify(safeProfiles));
    localStorage.setItem(rememberedGuardian,state.user.id);
  };
  async function resumeOffline(){
    const userId=localStorage.getItem(rememberedGuardian);
    if(!userId||localStorage.getItem(offlineLogoutKey(userId))==='1')return false;
    const entitlement=await window.PAOfflineEntitlement?.restore?.(userId);
    if(!entitlement?.verified||entitlement.userId!==userId||!offlineSave())return false;
    let profiles;try{profiles=JSON.parse(localStorage.getItem(knownKey(userId))||'[]')}catch(_){return false}
    if(!Array.isArray(profiles)||!profiles.length)return false;
    profiles=profiles.filter(p=>p&&typeof p.id==='string'&&/^[-a-f0-9]{36}$/i.test(p.id));
    if(!profiles.length)return false;
    const preferred=localStorage.getItem('pa_active_child_id');
    const selected=profiles.find(p=>p.id===preferred)||profiles[0];
    state.user={id:userId,email:''};state.profiles=profiles;state.childId=selected.id;
    state.offline=true;state.ready=true;state.controls=null;state.needsOnboarding=false;
    offlineSave().bind(userId,selected.id,{confirmedOwnership:true});
    const stored=offlineSave().read();
    if(!stored?.profile||stored.profile.cloudChildId!==selected.id)return false;
    db=stored.profile;
    window.PACommercial?.setOfflineAccess?.(entitlement);
    initAll();ensureProgression();renderHub();renderAccount();
    offlineNotify(stored.conflict?'conflict':stored.dirty?'local_only':'synced');
    setAppLoading(false);
    return true;
  }
  function setAppLoading(on,text){
    const el=$('appLoading');if(!el)return;
    el.classList.toggle('hidden',!on);el.setAttribute('aria-busy',on?'true':'false');
    if(text&&$('appLoadingText'))$('appLoadingText').textContent=text;
    document.body.classList.toggle('app-loading-active',!!on);
  }
  const message=(text,bad=false)=>{const el=$('loginError');if(!el)return;el.textContent=text||'';el.classList.toggle('show',!!text);el.classList.toggle('success',!!text&&!bad)};
  const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const validAvatarId=value=>/^avatar-0[1-8]$/.test(String(value||''))?String(value):null;
  const avatarId=value=>/^avatar-0[1-8]$/.test(String(value||''))?String(value):'avatar-01';
  const avatarSrc=value=>`assets/avatars/pupils/${avatarId(value)}.png`;
  const schemaMismatch=error=>{const code=String(error?.code||''),msg=String(error?.message||'').toLowerCase();return ['PGRST202','PGRST204','42703','42883'].includes(code)||/avatar_id.*(column|schema cache)|column.*avatar_id|create_initial_child.*(function|schema cache|not found)/.test(msg)};
  const currentScreen=()=>document.body.dataset.screen||'';
  const playing=()=>ACTIVE_SCREENS.has(currentScreen())&&!document.hidden&&!state.locked&&(Date.now()-state.lastInteractionAt<IDLE_AFTER_MS);
  const markInteraction=()=>{const wasIdle=Date.now()-state.lastInteractionAt>=IDLE_AFTER_MS;state.lastInteractionAt=Date.now();if(wasIdle)state.lastTick=performance.now()};
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

  async function signInGoogle(){
    const trust=window.PABetaTrust?.prepareOAuth?.();if(trust&&trust.ok===false)return message(trust.message,true);
    const button=$('googleAuthButton');message('');if(button){button.disabled=true;button.querySelector('span').textContent='Membuka Google…'}
    const redirectTo=location.origin+location.pathname;
    const {error}=await state.client.auth.signInWithOAuth({provider:'google',options:{redirectTo,queryParams:{prompt:'select_account'}}});
    if(error){message('Log masuk Google belum tersedia. Cuba lagi sebentar.',true);if(button){button.disabled=false;button.querySelector('span').textContent='Teruskan dengan Google'}}
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
    if(!hasConnection()){
      if(await resumeOffline())return;
      message('Sambung internet untuk mengesahkan akaun kali pertama.',true);return;
    }
    state.offline=false;
    localStorage.removeItem(offlineLogoutKey(state.user.id));
    message('');
    try{if(window.PABetaTrust&&!await window.PABetaTrust.ensureConsent(state.client,state.user))return}catch(error){console.warn('Consent check failed',error);message('Persetujuan penjaga belum dapat disahkan. Semak sambungan dan cuba semula.',true);return}
    await resumeAfterConsent();
  }

  async function resumeAfterConsent(){
    if(!state.user)return;message('');setAppLoading(true,'Menyambung profil dan kemajuan kamu…');
    try{await window.PACommercial?.refresh?.();await loadProfiles();rememberChildren();renderAccount()}
    catch(error){setAppLoading(false);throw error}
    setAppLoading(false)
  }

  // First authenticated online session caches each authorized child's most
  // recent server snapshot. Local pending changes always take precedence.
  async function hydrateOfflineProfiles(profiles){
    const guard=offlineSave(),userId=state.user?.id;
    if(!guard||!userId||!hasConnection()||!profiles.length)return;
    const ids=profiles.map(p=>p.id);
    const {data,error}=await state.client.from('game_saves')
      .select('child_id,state,server_revision').in('child_id',ids);
    if(error){console.warn('Some offline profiles could not be cached',error);return}
    const remote=new Map((data||[]).map(v=>[v.child_id,v]));
    for(const p of profiles){
      if(state.user?.id!==userId)break;
      try{
        guard.bind(userId,p.id,{confirmedOwnership:true});
        const local=guard.read(),cloud=remote.get(p.id);
        if(cloud?.state?.cloudChildId===p.id){
          const rev=Number(cloud.server_revision||0);
          if(!local||(!local.dirty&&!local.conflict&&local.serverRevision<=rev))
            guard.installCloud(cloud.state,rev);
        }
      }catch(error){console.warn('Offline profile cache skipped',p.id,error)}
    }
    guard.unbind({clearLegacy:false});
  }

  async function loadProfiles(){
    let result=await state.client.from('child_profiles').select('id,display_name,grade,hero_id,avatar_id,updated_at').eq('is_active',true).order('created_at');
    if(result.error&&!schemaMismatch(result.error))throw result.error;
    if(result.error)result=await state.client.from('child_profiles').select('id,display_name,grade,hero_id,updated_at').eq('is_active',true).order('created_at');
    if(result.error)throw result.error;
    const profiles=result.data||[];
    let saves=[];
    if(profiles.length){
      const saveResult=await state.client.from('game_saves').select('child_id,avatar_id:state->>avatar_id').in('child_id',profiles.map(p=>p.id));
      if(saveResult.error)console.warn('Cloud profile avatars unavailable',saveResult.error);
      else saves=saveResult.data||[];
    }
    const saveById=Object.fromEntries(saves.map(save=>[save.child_id,validAvatarId(save.avatar_id)]));
    state.profiles=profiles.map(p=>{
      const profileAvatar=validAvatarId(p.avatar_id);
      const profileHasAvatarField=Object.prototype.hasOwnProperty.call(p,'avatar_id');
      // Preserve a valid profile value, including an explicit avatar-01. Recover
      // from the mirrored save only when the field/value is clearly missing.
      const saveAvatar=saveById[p.id]||null;
      const avatar_id=profileAvatar||(profileHasAvatarField&&p.avatar_id?null:saveAvatar);
      const _avatarSource=profileAvatar?'profile':(saveAvatar?'save':undefined);
      return {...p,avatar_id,...(_avatarSource?{_avatarSource}:{})};
    });
    rememberChildren();
    await hydrateOfflineProfiles(state.profiles);
    if(!state.profiles.length){state.childId=null;state.needsOnboarding=true;setAppLoading(false);renderAccount();screen('setup');return;}
    const remembered=localStorage.getItem('pa_active_child_id');
    const profile=state.profiles.find(p=>p.id===remembered)||state.profiles[0];
    await selectChild(profile.id,false);
    state.needsOnboarding=false;
  }

  async function selectChild(childId,navigate=true){
    setAppLoading(true,'Memuatkan profil kamu…');
    try{return await selectChildCore(childId,navigate)}finally{setAppLoading(false)}
  }

  async function selectChildCore(childId,navigate=true){
    if(!state.user?.id||!state.profiles?.some(p=>p.id===childId))throw Error('Profil bukan milik akaun ini');
    await endPlaySession('user_exit');
    if(!hasConnection()&&state.offline){
      const cache=offlineSave();
      cache?.bind(state.user.id,childId,{confirmedOwnership:true});
      const local=cache?.read();
      if(!local?.profile)throw Error('Profil ini belum disimpan untuk offline');
      state.childId=childId;db=local.profile;
      localStorage.setItem('pa_active_child_id',childId);
      initAll();ensureProgression();renderHub();renderAccount();
      offlineNotify(local.conflict?'conflict':local.dirty?'local_only':'synced');
      return;
    }
    const profile=state.profiles.find(p=>p.id===childId);
    const [{data:saveRow,error:saveError},{data:control,error:controlError}]=await Promise.all([
      state.client.from('game_saves').select('*').eq('child_id',childId).maybeSingle(),
      state.client.from('parental_controls').select('*').eq('child_id',childId).maybeSingle()
    ]);
    if(saveError)throw saveError;if(controlError)throw controlError;
    const previousId=state.childId;
    state.childId=childId;state.locked=false;
    localStorage.setItem('pa_active_child_id',childId);
    state.controls=control||null;
    const bridge=offlineSave();
    if(!bridge)throw Error('Offline account save bridge is required');
    bridge.bind(state.user.id,childId,{confirmedOwnership:true});
    const local=bridge.read();
    const remote=saveRow?.state&&Object.keys(saveRow.state).length?saveRow.state:null;
    const remoteRevision=Number(saveRow?.server_revision||0);
    if(remote&&remote.cloudChildId!==childId){
      throw Error('Cloud snapshot identity mismatch');
    }
    if(local?.dirty||local?.conflict)db=local.profile;
    else if(local&&local.serverRevision>remoteRevision)db=local.profile;
    else if(remote){
      const imported=bridge.installCloud(remote,remoteRevision);
      db=imported.local?.profile||remote;
    }else if(local)db=local.profile;
    else db=null;
    if(db){
      if(db.cloudChildId!==childId)throw Error('Simpanan lokal salah profil');
      db.name=profile.display_name;db.schoolGrade=profile.grade;db.hero=profile.hero_id;
      const explicitAvatar=profile._avatarSource==='profile'&&validAvatarId(profile.avatar_id);
      if(explicitAvatar)db.avatar_id=avatarId(profile.avatar_id);
      localStorage.setItem('pa_coach_v6_full',JSON.stringify(db));
    }else await createBlankLocal(profile);
    await loadTodaySeconds();
    await window.PAQSV2BetaRollout?.refresh?.(db);
    renderAccount();updateTimer();
    const latest=bridge.read();
    offlineNotify(latest?.conflict?'conflict':latest?.dirty?'local_only':'synced');
    if(latest?.dirty&&!latest.conflict)void syncSaveNow();
    if(navigate||currentScreen()==='login'){initAll();ensureProgression();renderHub()}
  }
  async function createBlankLocal(profile){
    db={name:profile.display_name,schoolGrade:profile.grade,hero:profile.hero_id,avatar_id:avatarId(profile.avatar_id),cloudChildId:profile.id,skills:{},coreFrontier:1,focus:null,logs:[],created:Date.now(),xp:0,coins:0,level:1,completedMissions:{},chapterStars:{},activeMissionChapter:null,rewards:{pets:{},auras:{},badges:{},equippedPet:null,equippedAura:null,firstMissionDone:false,firstBossDone:false,bossStretchWin:false}};
    initAll();ensureProgression();
    offlineSave()?.capture(db);
    localStorage.setItem('pa_coach_v6_full',JSON.stringify(db));
    void syncSaveNow();
  }
  async function attachNewChild(){
    if(!state.user||!db)return;
    try{
      let result=await state.client.rpc('create_initial_child',{child_display_name:db.name,child_grade:db.schoolGrade,child_hero_id:db.hero||'wira',child_avatar_id:avatarId(db.avatar_id)});
      if(result.error&&!schemaMismatch(result.error))throw result.error;
      if(result.error)result=await state.client.rpc('create_initial_child',{child_display_name:db.name,child_grade:db.schoolGrade,child_hero_id:db.hero||'wira'});
      const {data,error}=result;
      if(error)throw error;state.childId=data;db.cloudChildId=data;localStorage.setItem('pa_active_child_id',data);
      offlineSave()?.bind(state.user.id,data,{confirmedOwnership:true});
      offlineSave()?.capture(db);localStorage.setItem('pa_coach_v6_full',JSON.stringify(db));
      await loadProfiles();state.needsOnboarding=false;await syncSaveNow();if(playing())ensurePlaySession();showRewardToast('Progress kini disimpan ke awan ✓');
    }catch(error){console.warn('Cloud profile creation failed',error);showRewardToast('Progress disimpan pada peranti · sync akan dicuba lagi');}
  }

  function scheduleSave(){
    clearTimeout(state.saveTimer);
    if(!db||sess?.demoMode||sess?.devBattlefield||db?.demoMode)return;
    if(!state.user?.id||!state.childId)return; // anonymous/demo continues using legacy local save
    if(db.cloudChildId!==state.childId){console.error('Prevented cross-child save');return}
    db.lastSavedAt=Date.now();
    try{offlineSave()?.capture(db);offlineNotify('local_only')}
    catch(error){console.error('Offline local save failed',error);offlineNotify('error');return}
    if(hasConnection()&&!state.offline)state.saveTimer=setTimeout(syncSaveNow,900);
  }
  function settleSaveWaiters(result){
    const waiters=state.saveWaiters.splice(0);waiters.forEach(resolve=>resolve(result));
  }
  async function syncSaveNow(){
    if(!state.user?.id||!state.childId||!db||sess?.demoMode||sess?.devBattlefield||db?.demoMode){
      settleSaveWaiters(false);return false;
    }
    const bridge=offlineSave();
    if(!bridge){offlineNotify('error');settleSaveWaiters(false);return false}
    if(!hasConnection()||state.offline){offlineNotify('local_only');settleSaveWaiters(false);return false}
    if(state.saveInFlight){state.savePending=true;return new Promise(resolve=>state.saveWaiters.push(resolve))}
    state.saveInFlight=true;clearTimeout(state.saveTimer);
    let result;
    try{
      result=await bridge.flush(async({userId,childId,expectedRevision,profile})=>{
        if(state.user?.id!==userId||state.childId!==childId)return null;
        const {data,error}=await state.client.rpc('save_game_snapshot_cas',{
          p_child_id:childId,p_expected_revision:expectedRevision,p_state:profile
        });
        if(error)throw error;
        return Array.isArray(data)?data[0]:data;
      });
    }catch(error){
      console.warn('CAS cloud save unavailable, progress retained locally',error);
      result={status:'pending'};
    }finally{state.saveInFlight=false}
    if(result?.status==='conflict'){
      offlineNotify('conflict');
      settleSaveWaiters(false);
      return false;
    }
    const saved=result?.status==='synced';
    offlineNotify(saved?'synced':result?.status==='switched_account'?'local_only':'local_only');
    const pending=state.savePending;state.savePending=false;
    if(result?.status==='pending'||pending){
      // Bounded retry when online; local snapshots survive closures/restarts.
      state.saveTimer=setTimeout(()=>{void syncSaveNow()},5000);
    }
    settleSaveWaiters(saved);
    return saved;
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
    const form=$('authForm'),tabs=document.querySelector('.authTabs'),admin=$('adminAuth'),box=$('cloudAccount'),resume=$('loginResume');if(!box)return;
    const signed=!!state.user;form?.classList.toggle('hidden',signed);tabs?.classList.toggle('hidden',signed);admin?.classList.toggle('hidden',signed);box.classList.toggle('hidden',!signed);
    if(resume)resume.classList.toggle('hidden',!signed&&!!db?.cloudChildId);
    if(!signed){box.innerHTML='';return;}
    const profiles=(state.profiles||[]).map(p=>`<button class="cloudProfile ${p.id===state.childId?'active':''}" onclick="PACloud.selectChild('${p.id}')"><img class="cloudProfileIcon" src="${avatarSrc(p.avatar_id)}" alt=""><span><b>${safe(p.display_name)}</b><small>Darjah ${p.grade}</small></span><em>${p.id===state.childId?'Aktif':'Pilih'}</em></button>`).join('');
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

  async function confirmGuardianEmail(value){
    const email=String(value||'').trim().toLowerCase();if(!email||!state.client||!state.user)return false;
    const {data,error}=await state.client.auth.getUser();if(error||!data?.user||data.user.id!==state.user.id)return false;
    return String(data.user.email||'').trim().toLowerCase()===email;
  }

  function addChild(){state.needsOnboarding=true;screen('setup')}

  async function logout(){if(window.PAPageLock?.requestExit(()=>logout())===false)return;await syncSaveNow();await endPlaySession('user_exit');window.PAQSV2BetaRollout?.reset?.(db);
    if(state.user?.id)localStorage.setItem(offlineLogoutKey(state.user.id),'1');
    offlineSave()?.unbind();db=null;
    if(state.client?.auth)await state.client.auth.signOut();state.user=null;state.childId=null;state.profiles=[];window.PACommercial?.reset?.();renderAccount();screen('login');}

  let legacyWired=false;
  function wireLegacy(){
    if(legacyWired)return;legacyWired=true;
    const oldSave=window.save;window.save=function(){if(sess?.devBattlefield)return;if(state.user?.id&&state.childId&&db?.cloudChildId!==state.childId){console.error('Cross-child save rejected');offlineNotify('error');return;}oldSave();scheduleSave()};
    const oldStart=window.startNew;window.startNew=function(){oldStart();if(state.user)attachNewChild()};
    const oldScreen=window.screen;window.screen=function(id){oldScreen(id);if(ACTIVE_SCREENS.has(id))ensurePlaySession();else if(['login','parent','setup'].includes(id))endPlaySession(id==='parent'?'parent_lock':'user_exit');if(id==='parent')setTimeout(renderParentControls,0)};
    if(window.PATelemetry?.response){const oldResponse=window.PATelemetry.response;window.PATelemetry.response=function(skillId,ok,tag,sec,usedHint,q,mode){if(sess?.devBattlefield)return;oldResponse(skillId,ok,tag,sec,usedHint,q,mode);if(sess?.demoMode||!state.user||!state.childId)return;state.client.from('learning_attempts').insert({client_event_id:crypto.randomUUID(),child_id:state.childId,question_id:String(q?.token||''),skill_id:String(skillId),grade:Number(db?.schoolGrade||1),is_correct:!!ok,used_hint:!!usedHint,response_ms:Math.round((Number(sec)||0)*1000),misconception_tag:ok?null:(tag||'generic'),battle_type:mode==='boss'?'boss':'practice'}).then(({error})=>{if(error)console.warn('Attempt sync failed',error)});};}
  }

  async function init(){
    wireLegacy();
    if(!window.supabase?.createClient){
      if(!hasConnection()&&await resumeOffline()){
        window.addEventListener('online',()=>{
          if(window.supabase?.createClient){void init();return}
          const sdk=document.createElement('script');
          sdk.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.111.0/dist/umd/supabase.min.js';
          sdk.crossOrigin='anonymous';
          sdk.onload=()=>{void init().catch(error=>console.warn('Cloud reconnect failed',error))};
          sdk.onerror=()=>{offlineNotify('local_only')};
          document.head.appendChild(sdk);
        },{once:true});
        return;
      }
      message('Cloud login gagal dimuat. Semak internet dan muat semula.',true);return;
    }
    state.client=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    const {data}=await state.client.auth.getSession();
    if(!hasConnection()&&await resumeOffline()){
      window.addEventListener('online',()=>{
        state.offline=false;
        if(data?.session)void signedIn(data.session).catch(error=>console.warn('Offline progress remains pending',error));
        else offlineNotify('local_only');
      },{once:true});
      return;
    }
    if(data.session)await signedIn(data.session);else renderAccount();
    state.client.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_IN'&&session&&session.user.id!==state.user?.id)setTimeout(()=>signedIn(session),0);if(event==='SIGNED_OUT'){state.user=null;renderAccount();}});
    setInterval(tick,1000);document.addEventListener('pointerdown',markInteraction,{passive:true,capture:true});document.addEventListener('keydown',markInteraction,{passive:true,capture:true});document.addEventListener('visibilitychange',()=>{tick();if(document.hidden){syncSaveNow();syncDailyTotal('background');}else{state.lastTick=performance.now();markInteraction()}});window.addEventListener('pagehide',()=>{tick();syncSaveNow();syncDailyTotal('pagehide');});window.addEventListener('online',()=>{
      if(state.offline){state.offline=false;void resumeAfterConsent().catch(error=>console.warn('Online resume pending',error))}
      else{void syncSaveNow();void syncDailyTotal('online')}
      if(playing())ensurePlaySession()
    });state.ready=true;
  }

  window.PACloud={init,setAuthMode,submitAuth,signInGoogle,selectChild,attachNewChild,scheduleSave,syncSaveNow,renderParentControls,saveControls,saveOnboardingControls,confirmGuardianEmail,addChild,logout,resumeAfterConsent,setLoading:setAppLoading,state};
  init().catch(error=>{setAppLoading(false);console.error('Cloud init failed',error);message('Cloud tidak dapat disambungkan. Progress lokal masih selamat.',true)});
})();

