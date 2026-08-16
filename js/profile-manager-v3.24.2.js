// Pahlawan Angka v3.24.0 — Parent Profile Manager + integrated child editor.
// Product flow for signed-in guardians: Profile Manager -> Student Hub.
// Existing setup screen remains only as an offline/legacy fallback.
(()=>{
'use strict';
const VERSION='3.24.2';
const HERO={
  wira:{id:'wira',name:'Wira',power:'Kuasa Ais',src:'assets/heroes/wira/profile-happy-v1.webp'},
  bunga:{id:'bunga',name:'Bunga',power:'Kuasa Flora',src:'assets/heroes/bunga/profile-happy-v1.webp'}
};
let rendering=false, statsLoading=false, editorHero='wira', editorProfileId=null, deleteProfileId=null, emptyPrompted=false;
const $=id=>document.getElementById(id);
const safe=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const cloud=()=>window.PACloud||null;
const st=()=>cloud()?.state||null;
const signed=()=>!!st()?.user;
const profileById=id=>(st()?.profiles||[]).find(p=>p.id===id)||null;
const heroFor=id=>HERO[id]||HERO.wira;
const nowIso=()=>new Date().toISOString();

function levelOf(p){return Math.max(1,Number(p.level||1))}
function coinsOf(p){return Math.max(0,Number(p.coins||0))}
function xpOf(p){return Math.max(0,Number(p.xp||0))}
function xpNeed(level){return Math.max(120,120+(Math.max(1,level)-1)*45)}
function pct(n,d){return d?Math.max(0,Math.min(100,Math.round(n/d*100))):0}

function syncSignedShell(){
  const card=document.querySelector('.cloudLoginCard');
  if(!card)return;
  card.classList.toggle('pmSigned',signed());
  const head=card.querySelector('.cloudLoginHead span');
  if(head&&signed()){
    const b=head.querySelector('b'),sm=head.querySelector('small');
    if(b)b.textContent='Akaun Ibu Bapa';
    if(sm)sm.textContent='Urus profil anak & sambung pengembaraan';
  }else if(head){
    const b=head.querySelector('b'),sm=head.querySelector('small');
    if(b)b.textContent='Akaun Ibu Bapa';
    if(sm)sm.textContent='Progress anak disimpan dengan selamat';
  }
}

async function hydrateStats(){
  const state=st(),profiles=state?.profiles||[];
  if(!state?.client||!state.user||!profiles.length||statsLoading)return profiles;
  statsLoading=true;
  try{
    const ids=profiles.map(p=>p.id);
    const {data,error}=await state.client.from('game_saves').select('child_id,level,coins,xp,client_updated_at').in('child_id',ids);
    if(error)throw error;
    const byId=Object.fromEntries((data||[]).map(x=>[x.child_id,x]));
    state.profiles=profiles.map(p=>({...p,...(byId[p.id]||{})}));
    return state.profiles;
  }catch(error){
    console.warn('Profile stats unavailable',error);
    return profiles;
  }finally{statsLoading=false}
}

async function refreshProfiles(){
  const state=st();if(!state?.client||!state.user)return [];
  const {data,error}=await state.client.from('child_profiles')
    .select('id,display_name,grade,hero_id,updated_at,created_at')
    .eq('is_active',true).order('created_at');
  if(error)throw error;
  state.profiles=data||[];
  await hydrateStats();
  return state.profiles;
}

function portrait(p,size='row'){
  const h=heroFor(p.hero_id);
  return `<span class="pmPortrait pm-${safe(h.id)} pm-${size}" aria-hidden="true"><img src="${h.src}" alt=""></span>`;
}
function profileCard(p){
  const active=p.id===st()?.childId,h=heroFor(p.hero_id),level=levelOf(p),coins=coinsOf(p),xp=xpOf(p),need=xpNeed(level),progress=pct(xp%need,need);
  return `<article class="pmProfileCard ${active?'active':''}">
    <button class="pmProfileOpen" type="button" onclick="PAProfileManager.select('${p.id}')" aria-label="Buka profil ${safe(p.display_name)}">
      ${portrait(p)}
      <span class="pmProfileCopy">
        <span class="pmProfileTitle"><b>${safe(p.display_name)}</b>${active?'<em>Aktif</em>':''}</span>
        <small>Darjah ${Number(p.grade)||1} · ${safe(h.name)}</small>
        <span class="pmProfileStats"><i>Lv. ${level}</i><i>🪙 ${coins}</i></span>
        <span class="pmMiniXp" aria-hidden="true"><span style="width:${progress}%"></span></span>
      </span>
    </button>
    <button class="pmMore" type="button" onclick="event.stopPropagation();PAProfileManager.actions('${p.id}')" aria-label="Urus profil ${safe(p.display_name)}">⋮</button>
  </article>`;
}

async function renderManager({refreshStats=false}={}){
  syncSignedShell();
  const state=st(),box=$('cloudAccount');if(!box||!state?.user)return;
  if(rendering)return;rendering=true;
  try{
    if(refreshStats)await refreshProfiles(); else await hydrateStats();
    const profiles=state.profiles||[];
    const body=profiles.length?profiles.map(profileCard).join(''):`<div class="pmEmpty">
      <span class="pmEmptyRune">✦</span><b>Belum ada profil anak</b>
      <p>Cipta profil pertama dan pilih pahlawan untuk memulakan pengembaraan.</p>
    </div>`;
    box.innerHTML=`<div class="pmManager" data-profile-manager="${VERSION}">
      <div class="pmAccountLine">
        <span class="pmCloud">☁</span><span><b>Akaun tersambung</b><small>${safe(state.user.email||'')}</small></span>
        <button class="pmLogoutMini" type="button" onclick="PACloud.logout()">Keluar</button>
      </div>
      <div class="pmSectionHead"><span><small>PROFIL ANAK</small><b>Pilih pahlawan untuk sambung</b></span><em>${profiles.length} profil</em></div>
      <div class="pmProfiles">${body}</div>
      <button class="pmAddProfile" type="button" onclick="PAProfileManager.create()">＋ Profil anak</button>
      <p class="pmGuardianNote">Akaun adalah untuk penjaga. Anak bermain melalui profil tanpa e-mel sendiri.</p>
    </div>`;
    if(document.body.dataset.screen==='setup'&&signed())screen('login');
    syncSignedShell();
    if(!profiles.length&&!emptyPrompted){
      emptyPrompted=true;
      setTimeout(()=>openEditor(),120);
    }
  }catch(error){
    console.warn('Profile manager render failed',error);
    box.innerHTML='<div class="pmEmpty"><b>Profil belum dapat dimuat.</b><p>Semak sambungan dan cuba semula.</p><button class="btn secondary small" onclick="PAProfileManager.refresh()">Cuba lagi</button></div>';
  }finally{rendering=false}
}

function ensureUi(){
  if(!$('pmEditorOverlay')){
    document.body.insertAdjacentHTML('beforeend',`
      <div id="pmEditorOverlay" class="pmOverlay hidden" role="dialog" aria-modal="true" aria-labelledby="pmEditorTitle">
        <div class="pmModal pmEditorModal">
          <button class="pmClose" type="button" onclick="PAProfileManager.closeEditor()" aria-label="Tutup">×</button>
          <div class="pmModalHead"><span class="pmRune">✦</span><span><small>PROFIL ANAK</small><h2 id="pmEditorTitle">Cipta Profil Anak</h2></span></div>
          <label class="pmField"><span>Nama anak</span><input id="pmChildName" maxlength="40" autocomplete="off" placeholder="Nama anak"></label>
          <label class="pmField"><span>Darjah</span><select id="pmChildGrade">${[1,2,3,4,5,6].map(g=>`<option value="${g}">Darjah ${g}</option>`).join('')}</select></label>
          <div class="pmHeroLabel"><span>Pilih pahlawan</span><small>Pilih pahlawan yang akan menemani pengembaraan.</small></div>
          <div class="pmHeroGrid">
            ${heroChoice('wira')}${heroChoice('bunga')}
          </div>
          <div id="pmEditorError" class="pmError" role="alert"></div>
          <button id="pmSaveProfile" class="pmPrimary" type="button" onclick="PAProfileManager.saveProfile()">Cipta Profil</button>
        </div>
      </div>
      <div id="pmActionsOverlay" class="pmOverlay hidden" role="dialog" aria-modal="true">
        <div class="pmModal pmActionModal">
          <button class="pmClose" type="button" onclick="PAProfileManager.closeActions()" aria-label="Tutup">×</button>
          <div class="pmModalHead"><span class="pmRune">⚔</span><span><small>URUS PROFIL</small><h2 id="pmActionTitle">Profil</h2></span></div>
          <button class="pmActionBtn" id="pmEditAction" type="button">✎ <span><b>Edit profil</b><small>Nama, darjah atau pahlawan</small></span></button>
          <button class="pmActionBtn danger" id="pmDeleteAction" type="button">⌫ <span><b>Padam profil</b><small>Keluarkan profil daripada akaun</small></span></button>
        </div>
      </div>
      <div id="pmDeleteOverlay" class="pmOverlay hidden" role="dialog" aria-modal="true" aria-labelledby="pmDeleteTitle">
        <div class="pmModal pmDeleteModal">
          <div class="pmDeleteIcon">⌫</div>
          <h2 id="pmDeleteTitle">Padam profil?</h2>
          <p id="pmDeleteCopy">Profil akan dikeluarkan daripada akaun.</p>
          <div class="pmDeleteNotice">Kemajuan diarkibkan dan tidak digunakan selepas profil dipadam.</div>
          <div id="pmDeleteError" class="pmError" role="alert"></div>
          <div class="pmDeleteActions"><button type="button" class="pmSecondary" onclick="PAProfileManager.closeDelete()">Batal</button><button id="pmDeleteConfirm" type="button" class="pmDanger" onclick="PAProfileManager.confirmDelete()">Padam profil</button></div>
        </div>
      </div>`);
  }
  installHubSwitch();
}

function heroChoice(id){
  const h=HERO[id];
  return `<button id="pmHero-${id}" class="pmHeroChoice ${id==='wira'?'selected':''}" type="button" onclick="PAProfileManager.chooseHero('${id}')" aria-pressed="${id==='wira'?'true':'false'}">
    <span class="pmHeroStage pmHeroStage-${id}"><span class="pmHeroAvatar"><img src="${h.src}" alt="${h.name}"></span></span>
    <span class="pmHeroChoiceCopy"><b>${h.name}</b><small>${h.power}</small><em>${id==='wira'?'✓ Dipilih':'Pilih'}</em></span>
    <i class="pmInvite">Jom!</i>
  </button>`;
}

function chooseHero(id){
  editorHero=HERO[id]?id:'wira';
  Object.keys(HERO).forEach(k=>{
    const b=$(`pmHero-${k}`),active=k===editorHero;
    if(b){b.classList.toggle('selected',active);b.setAttribute('aria-pressed',active?'true':'false');const em=b.querySelector('em');if(em)em.textContent=active?'✓ Dipilih':'Pilih';}
  });
}

function openEditor(id=null){
  ensureUi();if(!signed())return screen('login');
  const p=id?profileById(id):null;
  editorProfileId=p?.id||null;editorHero=p?.hero_id||'wira';
  $('pmEditorTitle').textContent=p?'Edit Profil Anak':'Cipta Profil Anak';
  $('pmChildName').value=p?.display_name||'';
  $('pmChildGrade').value=String(p?.grade||Math.max(1,Math.min(6,Number(db?.schoolGrade||2))));
  $('pmSaveProfile').textContent=p?'Simpan Perubahan':'Cipta Profil';
  $('pmEditorError').textContent='';
  chooseHero(editorHero);
  $('pmEditorOverlay').classList.remove('hidden');
  document.body.classList.add('pmModalOpen');
  setTimeout(()=>$('pmChildName')?.focus(),60);
}
function closeEditor(){$('pmEditorOverlay')?.classList.add('hidden');document.body.classList.remove('pmModalOpen');editorProfileId=null}
function actions(id){
  ensureUi();const p=profileById(id);if(!p)return;
  $('pmActionTitle').textContent=p.display_name;
  $('pmEditAction').onclick=()=>{closeActions();openEditor(id)};
  $('pmDeleteAction').onclick=()=>{closeActions();openDelete(id)};
  $('pmActionsOverlay').classList.remove('hidden');document.body.classList.add('pmModalOpen');
}
function closeActions(){$('pmActionsOverlay')?.classList.add('hidden');document.body.classList.remove('pmModalOpen')}

function transitionGrade(snapshot,newGrade){
  if(!snapshot||typeof snapshot!=='object')return snapshot;
  const oldGrade=Number(snapshot.schoolGrade||newGrade);
  if(oldGrade===newGrade){snapshot.schoolGrade=newGrade;return snapshot}
  snapshot.gradeProgressArchive=snapshot.gradeProgressArchive||{};
  snapshot.gradeProgressArchive[String(oldGrade)]={
    coreFrontier:Number(snapshot.coreFrontier||1),
    completedMissions:{...(snapshot.completedMissions||{})},
    chapterStars:{...(snapshot.chapterStars||{})},
    activeMissionChapter:snapshot.activeMissionChapter??null
  };
  const restore=snapshot.gradeProgressArchive[String(newGrade)]||null;
  snapshot.schoolGrade=newGrade;
  snapshot.coreFrontier=restore?.coreFrontier||1;
  snapshot.completedMissions={...(restore?.completedMissions||{})};
  snapshot.chapterStars={...(restore?.chapterStars||{})};
  snapshot.activeMissionChapter=restore?.activeMissionChapter??null;
  snapshot.focus=null;
  snapshot.profileGradeChangedAt=Date.now();
  return snapshot;
}

async function mirrorProfileIntoSave(id,{name,grade,hero},oldGrade){
  const state=st();if(!state?.client)return;
  if(id===state.childId&&typeof db!=='undefined'&&db){
    const old=Number(db.schoolGrade||oldGrade||grade);
    db.name=name;db.hero=hero;
    if(old!==grade)transitionGrade(db,grade); else db.schoolGrade=grade;
    db.lastSavedAt=Date.now();
    if(typeof save==='function')save();
    cloud()?.scheduleSave?.();
    return;
  }
  const {data,error}=await state.client.from('game_saves').select('state').eq('child_id',id).maybeSingle();
  if(error){console.warn('Profile save mirror read failed',error);return}
  if(!data?.state)return;
  const snap={...data.state,name,hero,lastSavedAt:Date.now()};
  const prior=Number(snap.schoolGrade||oldGrade||grade);
  if(prior!==grade)transitionGrade(snap,grade);else snap.schoolGrade=grade;
  const {error:updateError}=await state.client.from('game_saves')
    .update({state:snap,client_updated_at:nowIso()}).eq('child_id',id);
  if(updateError)console.warn('Profile save mirror update failed',updateError);
}

async function saveProfile(){
  const state=st();if(!state?.client||!state.user)return;
  const name=($('pmChildName')?.value||'').trim(),grade=Number($('pmChildGrade')?.value||0),hero=editorHero;
  const errorBox=$('pmEditorError'),button=$('pmSaveProfile');
  if(!name||name.length>40){errorBox.textContent='Masukkan nama anak antara 1 hingga 40 aksara.';return}
  if(grade<1||grade>6){errorBox.textContent='Pilih Darjah 1 hingga Darjah 6.';return}
  if(!HERO[hero]){errorBox.textContent='Pilih pahlawan.';return}
  button.disabled=true;button.textContent='Menyimpan…';errorBox.textContent='';
  try{
    let targetId=editorProfileId;
    if(targetId){
      const current=profileById(targetId),oldGrade=Number(current?.grade||grade);
      const {error}=await state.client.from('child_profiles')
        .update({display_name:name,grade,hero_id:hero,updated_at:nowIso()}).eq('id',targetId);
      if(error)throw error;
      await mirrorProfileIntoSave(targetId,{name,grade,hero},oldGrade);
      await refreshProfiles();closeEditor();await renderManager();
      if(typeof showRewardToast==='function')showRewardToast('Profil dikemas kini ✓');
    }else{
      const {data:family,error:familyError}=await state.client.from('families').select('id').eq('owner_user_id',state.user.id).maybeSingle();
      if(familyError)throw familyError;if(!family?.id)throw new Error('Family profile not found');
      const {data:newProfile,error}=await state.client.from('child_profiles')
        .insert({family_id:family.id,display_name:name,grade,hero_id:hero,is_active:true})
        .select('id,display_name,grade,hero_id,updated_at,created_at').single();
      if(error)throw error;
      targetId=newProfile.id;
      await refreshProfiles();closeEditor();
      await cloud().selectChild(targetId,true);
      if(typeof showRewardToast==='function')showRewardToast(`Selamat datang, ${name}!`);
    }
  }catch(error){
    console.warn('Profile save failed',error);
    errorBox.textContent='Profil belum dapat disimpan. Semak sambungan dan cuba semula.';
  }finally{
    button.disabled=false;
    button.textContent=editorProfileId?'Simpan Perubahan':'Cipta Profil';
  }
}

function openDelete(id){
  ensureUi();const p=profileById(id);if(!p)return;deleteProfileId=id;
  $('pmDeleteTitle').textContent=`Padam profil ${p.display_name}?`;
  $('pmDeleteCopy').textContent=`Semua kemajuan, mastery, coin dan rekod latihan ${p.display_name} akan dikeluarkan daripada pilihan akaun ini.`;
  $('pmDeleteError').textContent='';
  $('pmDeleteOverlay').classList.remove('hidden');document.body.classList.add('pmModalOpen');
}
function closeDelete(){$('pmDeleteOverlay')?.classList.add('hidden');document.body.classList.remove('pmModalOpen');deleteProfileId=null}
async function confirmDelete(){
  const state=st(),id=deleteProfileId,p=profileById(id),button=$('pmDeleteConfirm'),errorBox=$('pmDeleteError');
  if(!state?.client||!id||!p)return;
  button.disabled=true;button.textContent='Memadam…';errorBox.textContent='';
  try{
    if(id===state.childId)await cloud()?.syncSaveNow?.();
    const {error}=await state.client.from('child_profiles').update({is_active:false,updated_at:nowIso()}).eq('id',id);
    if(error)throw error;
    const wasActive=id===state.childId;
    await refreshProfiles();
    closeDelete();
    if(wasActive){
      localStorage.removeItem('pa_active_child_id');
      state.childId=null;state.controls=null;
      if(state.profiles.length){
        await cloud().selectChild(state.profiles[0].id,false);
        screen('login');
      }else{
        try{db=null}catch(_){}
        localStorage.removeItem('pa_coach_v6_full');
        screen('login');
        emptyPrompted=false;
      }
    }
    await renderManager();
    if(typeof showRewardToast==='function')showRewardToast('Profil dipadam daripada akaun');
  }catch(error){
    console.warn('Profile delete failed',error);
    errorBox.textContent='Profil belum dapat dipadam. Cuba semula.';
  }finally{button.disabled=false;button.textContent='Padam profil'}
}

async function selectProfile(id){
  if(!profileById(id))await refreshProfiles();
  await cloud()?.selectChild?.(id,true);
}
async function openManager(){
  if(!signed())return screen('login');
  if(typeof playSfx==='function')playSfx('ui');
  screen('login');
  await renderManager({refreshStats:true});
}

function installHubSwitch(){
  const back=document.querySelector('#hub .hubTopNav .iconBtn');
  if(back&&!back.dataset.pmBound){back.dataset.pmBound='1';back.onclick=()=>openManager();back.setAttribute('aria-label','Tukar profil anak')}
  const info=document.querySelector('#hub .hubProfileInfo');
  if(info&&!info.querySelector('.pmSwitchProfile')){
    const b=document.createElement('button');b.type='button';b.className='pmSwitchProfile';b.textContent='↔ Tukar profil';b.onclick=()=>openManager();info.appendChild(b);
  }
}

function installOverrides(){
  const oldGoSetup=window.goSetup;
  if(typeof oldGoSetup==='function'&&!oldGoSetup.__pmWrapped){
    const wrapped=function(){if(signed())return openManager();return oldGoSetup.apply(this,arguments)};
    wrapped.__pmWrapped=true;window.goSetup=wrapped;
  }
  const oldSelect=cloud()?.selectChild;
  if(typeof oldSelect==='function'&&!oldSelect.__pmWrapped){
    const wrapped=async function(){const out=await oldSelect.apply(cloud(),arguments);setTimeout(()=>renderManager(),0);return out};
    wrapped.__pmWrapped=true;cloud().selectChild=wrapped;
  }
}

function observeLegacyAccount(){
  const box=$('cloudAccount');if(!box||box.dataset.pmObserved)return;
  box.dataset.pmObserved='1';
  const observer=new MutationObserver(()=>{
    if(!signed())return syncSignedShell();
    if(rendering)return;
    if(!box.querySelector('.pmManager'))queueMicrotask(()=>renderManager());
  });
  observer.observe(box,{childList:true});
}

function boot(){
  ensureUi();installOverrides();observeLegacyAccount();installHubSwitch();syncSignedShell();
  const version=document.querySelector('.loginVersion');if(version)version.textContent=`Pahlawan Angka · v${VERSION}`;
  if(signed())renderManager().then(()=>{
    if(document.body.dataset.screen==='setup')screen('login');
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();

window.PAProfileManager={
  version:VERSION,open:openManager,refresh:()=>renderManager({refreshStats:true}),select:selectProfile,
  create:()=>openEditor(),edit:openEditor,openEditor,closeEditor,chooseHero,saveProfile,
  actions,closeActions,openDelete,closeDelete,confirmDelete,transitionGrade,
  assetMode:'approved-happy-profile-v1-avatar-frame'
};
document.documentElement.dataset.profileManager=VERSION;
})();