(()=>{
'use strict';
let step=1,draft=null,busy=false,storyIndex=null,editingProfile=false,editingPin=false;
const $=id=>document.getElementById(id);
const loreScenes=[
 {tag:'BABAK 1 · ALAM MATEMAGIK',eyebrow:'Dulu, semuanya aman',title:'Kuasa Matematik',text:'Di Alam Matemagik, kuasa Matematik buat dunia ni bercahaya. Semua teman ajaib hidup aman dan seronok bersama.',image:'assets/story/intro-alam-matemagik-v2.png',alt:'Wira bermain bersama enam teman ajaib dan dua kawan misteri di Alam Matemagik'},
 {tag:'BABAK 2 · KABUT LALAI',eyebrow:'Sesuatu berubah',title:'Kabut Lalai menyerang',text:'Tapi bila ilmu Matematik makin dilupakan, Kabut Lalai datang menyerang. Teman ajaib ditangkap dan dibawa ke merata tempat.',image:'assets/story/intro-kabut-lalai.webp',alt:'Kabut Lalai menyelubungi Alam Matemagik dan memisahkan teman-teman ajaib'},
 {tag:'BABAK 3 · SATU IKRAR',eyebrow:'Mereka perlukan bantuan',title:'Wira tak berjuang sendiri',text:'Wira, Cikgu Dimensi dan dua kawan misteri berikrar untuk selamatkan mereka. Tapi mereka perlukan satu lagi sumber kuasa: bantuan kamu!',image:'assets/story/intro-ikrar.webp',alt:'Wira, Cikgu Dimensi dan dua kawan misteri berikrar untuk menyelamatkan teman ajaib'},
 {tag:'BABAK 4 · AYUH!',eyebrow:'Pengembaraan bermula',title:'Dah bersedia?',text:'Terima kasih sebab nak berjuang bersama Wira! Dah bersedia nak selamatkan semua? Satu, dua, tiga… Ayuh!',image:'assets/story/intro-ayuh-v2.png',alt:'Wira dan Cikgu Dimensi bersama dua rakan misteri di atas bukit, memandang Alam Matemagik'}
];
function needsWizard(){return !!window.PACloud?.state?.user&&window.PACloud.state.needsOnboarding===true}
function familyPin(){
 const cloud=window.PACloud,cloudUser=!!cloud?.state?.user;
 const localDbBelongs=!cloudUser||!!db?.cloudChildId&&!!cloud?.state?.profiles?.some(profile=>profile.id===db.cloudChildId);
 const candidates=[localDbBelongs?db?.parentPin:null,cloud?.guardianPin?.(),cloudUser?null:window.pageLockParentPin?.(),cloudUser?null:window.PADemo?.parentPin?.()];
 for(const value of candidates){const pin=String(value||'').trim();if(/^\d{4}$/.test(pin))return pin}
 if(!cloudUser)try{const pin=localStorage.getItem('pa_guardian_pin_v1');if(/^\d{4}$/.test(String(pin||'')))return String(pin)}catch(_){}
 return '';
}
function openDraft(data){const sharedPin=familyPin(),profiles=window.PACloud?.state?.profiles;draft={pin:sharedPin,daily:20,session:20,hardLock:true,skipLore:false,isAdditionalProfile:!data.existingId&&Array.isArray(profiles)&&profiles.length>0,...data};if(!draft.pin)draft.pin='';draft.pinInherited=!!sharedPin;editingPin=false;editingProfile=false;step=1;busy=false;render();screen('guardianOnboarding')}
function begin(){
 if(!window.PACommercial?.requireFeature?.('profiles'))return;
 const name=($('child')?.value||'').trim(),grade=Number($('gradeSelect')?.value||2);
 if(!name){$('child')?.focus();return}
 if(!needsWizard()){window.startNew();return}
 openDraft({name,grade,hero:'wira',avatar_id:window.PAAvatar?.normalize?.(window.PAAvatar.currentId)||'avatar-01',source:'setup'})
}
function beginProfile(data){openDraft({...data,avatar_id:window.PAAvatar?.normalize?.(data.avatar_id)||'avatar-01',source:'profile-manager'})}
function beginExisting(profile){openDraft({name:profile.display_name,grade:Number(profile.grade),hero:profile.hero_id||'wira',avatar_id:window.PAAvatar?.normalize?.(profile.avatar_id)||'avatar-01',existingId:profile.id,source:'profile-manager'})}
function avatarChoices(){const ids=window.PAAvatar?.ids||['avatar-01'];return `<div class="goalChoices onboardingAvatarChoices">${ids.map(id=>`<button type="button" class="${draft.avatar_id===id?'active':''}" onclick="PAOnboarding.chooseAvatar('${id}')" aria-label="Avatar ${id.slice(-2)}"><img src="assets/avatars/pupils/${id}.png" alt=""><small>${id.slice(-2)}</small></button>`).join('')}</div>`}
function field(){return $('onboardingBody')}
function render(){
 $('guardianOnboarding')?.scrollTo?.({top:0,left:0});
 $('onboardingStepLabel').textContent=`Langkah ${step} daripada 4`;$('onboardingProgressFill').style.width=`${step*25}%`;
 if(step===1){const inherited=draft.pin&&!editingPin;field().innerHTML=inherited?`<div class="onboardingIcon">🔐</div><div class="eyebrow">PIN PENJAGA</div><h1>Satu PIN untuk semua anak</h1><p>PIN penjaga yang sedia ada akan digunakan untuk profil ${escapeHtml(draft.name||'anak')} juga. Jadi ibu bapa tak perlu ingat PIN yang berbeza.</p><div class="pinReuseNote">PIN penjaga sedia ada akan digunakan semula. PIN tidak dipaparkan.</div><button class="btn secondary onboardingEditPin" type="button" onclick="PAOnboarding.editPin()">Tukar PIN</button><div id="obError" class="onboardingError"></div><button class="btn primary" onclick="PAOnboarding.next()">Teruskan</button>`:`<div class="onboardingIcon">🔐</div><div class="eyebrow">PIN PENJAGA</div><h1>Lindungi bahagian ibu bapa</h1><p>PIN diperlukan untuk laporan, tetapan masa, profil dan pembelian.</p><label>PIN 4 digit<input id="obPin" class="pinInput" inputmode="numeric" maxlength="4" placeholder="••••" value="${editingPin?'':draft.pin}"></label><label>Sahkan PIN<input id="obPin2" class="pinInput" inputmode="numeric" maxlength="4" placeholder="••••"></label><div id="obError" class="onboardingError"></div><button class="btn secondary onboardingEditPin" type="button" onclick="PAOnboarding.cancelPinEdit()">Batal</button><button class="btn primary" onclick="PAOnboarding.next()">Teruskan</button>`}
 if(step===2){const presets=[10,15,20,30],manual=!presets.includes(draft.daily);field().innerHTML=`<div class="onboardingIcon">⏱️</div><div class="eyebrow">RUTIN BERMAIN</div><h1>Tetapkan masa yang sesuai</h1><p>Kami cadangkan sesi pendek dan konsisten. Pilih cadangan atau tetapkan masa sendiri.</p><div class="timeChoices">${presets.map(n=>`<button class="${draft.daily===n?'active':''}" onclick="PAOnboarding.chooseTime(${n})">${n}<small>minit</small></button>`).join('')}</div><label class="customTimeField ${manual?'active':''}"><span>Masa pilihan sendiri</span><div><input id="obCustomTime" type="number" inputmode="numeric" min="5" max="180" step="1" value="${manual?draft.daily:''}" placeholder="Contoh: 25" oninput="PAOnboarding.customTime(this.value)"><b>minit</b></div><small>Minimum 5 minit, maksimum 180 minit.</small></label><label class="onboardingCheck"><input id="obHardLock" type="checkbox" ${draft.hardLock?'checked':''}> Kunci permainan apabila had dicapai</label><div id="obError" class="onboardingError"></div><button class="btn primary" onclick="PAOnboarding.next()">Teruskan</button>`}
 if(step===3)field().innerHTML=`<div class="onboardingIcon">🧭</div><div class="eyebrow">SEMAKAN TAHAP ANAK</div><h1>Misi Pengenalan cari tahap yang sesuai</h1><p>Selepas profil disimpan, anak akan jawab kira-kira 8 hingga 15 soalan. Cikgu Dimensi bermula daripada darjah sekolah, melihat bukti dalam beberapa bidang dan mengubah aras soalan mengikut jawapan anak.</p><div class="goalChoices onboardingAssessmentPoints"><div><b>Bukan peperiksaan</b><small>Tiada markah gagal atau kemajuan yang dipadam.</small></div><div><b>Tahap ikut bukti jawapan</b><small>Misi Pengenalan menganggar tahap cabaran yang sesuai; pilihan di sini tidak menentukan latihan.</small></div><div><b>Latihan disesuaikan selepas itu</b><small>Jawapan anak membantu Cikgu Dimensi memilih langkah latihan seterusnya.</small></div></div><button class="btn primary" onclick="PAOnboarding.next()">Teruskan</button>`;
 if(step===4&&editingProfile)field().innerHTML=`<div class="onboardingIcon">✏️</div><div class="eyebrow">EDIT PROFIL</div><h1>Semak butiran anak</h1><label>Nama anak<input id="obProfileName" maxlength="40" value="${escapeHtml(draft.name)}" oninput="PAOnboarding.setName(this.value)"></label><label>Darjah<select id="obProfileGrade" onchange="PAOnboarding.setGrade(this.value)">${[1,2,3,4,5,6].map(n=>`<option value="${n}" ${Number(draft.grade)===n?'selected':''}>Darjah ${n}</option>`).join('')}</select></label><div class="eyebrow">AVATAR PROFIL</div>${avatarChoices()}<div id="obError" class="onboardingError"></div><div class="onboardingEditActions"><button class="btn secondary" type="button" onclick="PAOnboarding.cancelProfileEdit()">Batal</button><button class="btn primary" type="button" onclick="PAOnboarding.saveProfileEdit()">Simpan edit</button></div>`;
 if(step===4&&!editingProfile)field().innerHTML=`<div class="onboardingIcon">🛡️</div><div class="eyebrow">SEMAKAN PENJAGA</div><h1>Sedia untuk ${escapeHtml(draft.name)}</h1><div class="onboardingAvatarReview"><img src="assets/avatars/pupils/${draft.avatar_id}.png" alt="Avatar profil yang dipilih"><span>Avatar pilihan kamu<small>Digunakan untuk profil anak</small></span></div><div class="onboardingSummary"><span>Profil<b>${escapeHtml(draft.name)} · Darjah ${draft.grade}</b><button class="onboardingSummaryEdit" type="button" onclick="PAOnboarding.editProfile()">Edit</button></span><span>PIN penjaga<b>${draft.pin?'PIN sama digunakan untuk profil anak':'Belum disediakan'}</b><button class="onboardingSummaryEdit" type="button" onclick="PAOnboarding.editStep(1)">Edit</button></span><span>Had harian<b>${draft.daily} minit</b><button class="onboardingSummaryEdit" type="button" onclick="PAOnboarding.editStep(2)">Edit</button></span><span>Misi Pengenalan<b>Semak tahap & kemahiran</b><button class="onboardingSummaryEdit" type="button" onclick="PAOnboarding.editStep(3)">Lihat</button></span></div>${draft.isAdditionalProfile?`<label class="onboardingCheck onboardingSkipLore"><input id="obSkipLore" type="checkbox" ${draft.skipLore?'checked':''} onchange="PAOnboarding.toggleSkipLore(this.checked)"><span><b>Langkau kisah pembuka untuk anak ini</b><small>Video masuk tetap dimainkan sebelum Misi Pengenalan.</small></span></label>`:''}<p class="handoffNote">Selepas ini, serahkan peranti kepada anak untuk memulakan Misi Pengenalan.</p><div id="obError" class="onboardingError"></div><div class="onboardingAction"><button class="btn secondary" type="button" onclick="PAOnboarding.editProfile()">Edit maklumat</button><button class="btn primary" onclick="PAOnboarding.finish()" ${busy?'disabled':''}>${busy?'Menyediakan profil…':'Simpan & serahkan kepada anak'}</button></div>`;
}
function next(){
 if(step===1&&(!draft.pin||editingPin)){const a=($('obPin')?.value||'').trim(),b=($('obPin2')?.value||'').trim();if(!/^\d{4}$/.test(a)||a!==b)return error(a!==b?'PIN tidak sepadan.':'Masukkan PIN 4 digit.');draft.pin=a;draft.pinInherited=false;editingPin=false}
 if(step===2){const manual=$('obCustomTime')?.value;if(manual!=='')draft.daily=draft.session=Number(manual);if(!Number.isInteger(draft.daily)||draft.daily<5||draft.daily>180)return error('Tetapkan masa antara 5 hingga 180 minit.');draft.hardLock=!!$('obHardLock')?.checked}
 if(step<4){step++;render()}
}
function back(){if(busy)return;if(storyIndex!==null){if(storyIndex>0){storyIndex--;renderLore()}return}if(editingProfile){editingProfile=false;render();return}if(editingPin){editingPin=false;render();return}if(step>1){step--;render()}else if(draft?.source==='profile-manager')window.PAProfileManager?.open?.();else screen('setup')}
function setLoreMusic(playing){if(typeof window.setBattleAudioMode==='function')window.setBattleAudioMode(playing?'ambient':'off')}
function chooseTime(n){draft.daily=n;draft.session=n;render()}
function customTime(value){const n=Number(value),label=$('obCustomTime')?.closest('.customTimeField');if(Number.isFinite(n)){draft.daily=n;draft.session=n}label?.classList.toggle('active',value!=='')}
function chooseAvatar(id){draft.avatar_id=window.PAAvatar?.normalize?.(id)||'avatar-01';render()}
function toggleSkipLore(value){if(draft?.isAdditionalProfile)draft.skipLore=!!value}
function editStep(n){if(busy)return;editingProfile=false;editingPin=false;step=Math.max(1,Math.min(3,Number(n)||1));render()}
function editPin(){editingPin=true;render()}
function cancelPinEdit(){editingPin=false;render()}
function editProfile(){if(busy)return;editingProfile=true;render()}
function setName(value){draft.name=String(value||'').slice(0,40)}
function setGrade(value){const grade=Number(value);if(grade>=1&&grade<=6)draft.grade=grade}
function cancelProfileEdit(){editingProfile=false;render()}
function saveProfileEdit(){if(!String(draft.name||'').trim())return error('Masukkan nama anak.');draft.name=draft.name.trim();if($('child'))$('child').value=draft.name;if($('gradeSelect')){$('gradeSelect').value=String(draft.grade);$('gradeSelect').dispatchEvent(new Event('change',{bubbles:true}))}editingProfile=false;render()}
async function persistExistingProfile(){
 if(!draft?.existingId)return;
 const state=window.PACloud?.state;if(!state?.client)return;
 const changes={display_name:draft.name,grade:Number(draft.grade),avatar_id:draft.avatar_id,updated_at:new Date().toISOString()};
 const result=await state.client.from('child_profiles').update(changes).eq('id',draft.existingId);
 const code=String(result.error?.code||''),msg=String(result.error?.message||'').toLowerCase();
 const schemaMissing=result.error&&(['PGRST202','PGRST204','42703','42883'].includes(code)||/avatar_id.*(column|schema cache)|column.*avatar_id/.test(msg));
 if(result.error&&schemaMissing){const fallback=await state.client.from('child_profiles').update({display_name:draft.name,grade:Number(draft.grade),updated_at:new Date().toISOString()}).eq('id',draft.existingId);if(fallback.error)throw fallback.error}
 else if(result.error)throw result.error;
 const profile=state.profiles?.find(p=>p.id===draft.existingId);if(profile){profile.display_name=draft.name;profile.grade=Number(draft.grade);profile.avatar_id=draft.avatar_id}
}
function error(message){const el=$('obError');if(el)el.textContent=message}
async function finish(){
 if(!window.PACommercial?.requireFeature?.('profiles'))return;
 if(busy)return;busy=true;render();
 try{
  if(draft.existingId){
   await persistExistingProfile();
   await window.PACloud?.selectChild?.(draft.existingId,false);
  }else{
   if($('child'))$('child').value=draft.name;if($('gradeSelect')){$('gradeSelect').value=String(draft.grade);$('gradeSelect').dispatchEvent(new Event('change',{bubbles:true}))}
   if(typeof window.chooseHero==='function')window.chooseHero(draft.hero);
   window.chooseAvatar?.(draft.avatar_id);window.startNew();db.avatar_id=draft.avatar_id;
   if(draft.pin){db.parentPin=draft.pin;window.PACloud?.setGuardianPin?.(draft.pin)}db.onboarding={completed:true,completedAt:Date.now(),introPending:true};save();
   screen('guardianOnboarding');
   await waitForChild();
  }
  db.avatar_id=draft.avatar_id;if(draft.pin){db.parentPin=draft.pin;window.PACloud?.setGuardianPin?.(draft.pin)}db.onboarding={completed:true,completedAt:Date.now(),introPending:true};save();
  await window.PACloud?.saveOnboardingControls?.({daily_limit_minutes:draft.daily,session_limit_minutes:draft.session,soft_nudge_minutes:15,hard_lock_enabled:draft.hardLock,show_elapsed_timer:true});
  await window.PACloud?.syncSaveNow?.();
  if(draft.skipLore){storyIndex=null;playEntranceAndStartIntro()}else{busy=false;storyIndex=0;renderLore()}
 }catch(e){console.error(e);busy=false;render();error('Profil disimpan pada peranti. Sambungan awan akan dicuba semula.')}
}
function waitForChild(){return new Promise((resolve,reject)=>{let tries=0;const timer=setInterval(()=>{const s=window.PACloud?.state;if(s?.childId&&!s.needsOnboarding){clearInterval(timer);resolve()}else if(++tries>60){clearInterval(timer);reject(new Error('child profile timeout'))}},150)})}
function renderLore(){
 const scene=loreScenes[storyIndex];if(!scene)return;
 setLoreMusic(true);
 $('onboardingStepLabel').textContent=`Kisah pembuka · ${storyIndex+1} daripada 4`;
 $('onboardingProgressFill').style.width=`${(storyIndex+1)*25}%`;
 const backButton=document.querySelector('#guardianOnboarding .onboardingHead button');if(backButton)backButton.disabled=storyIndex===0;
 field().innerHTML=`<div class="onboardingLore"><div class="onboardingLoreTag">${scene.tag}</div><img class="onboardingLoreImage" src="${scene.image}" alt="${scene.alt}"><div class="onboardingLoreCopy"><div class="eyebrow">${scene.eyebrow}</div><h1>${scene.title}</h1><p>${scene.text}</p></div><div class="onboardingLoreNav"><button class="btn secondary" onclick="PAOnboarding.back()" ${storyIndex===0?'disabled':''}>Sebelum</button><button class="btn primary" onclick="PAOnboarding.nextLore()">${storyIndex===3?'Teruskan ke Misi':'Seterusnya'}</button></div><div class="onboardingLoreCount">${String(storyIndex+1).padStart(2,'0')} / 04</div></div>`;
}
function playEntranceAndStartIntro(){setLoreMusic(false);busy=true;const afterEntrance=()=>{busy=false;startIntro()};if(window.PASegelEntryCinematic?.playEntrance)window.PASegelEntryCinematic.playEntrance(afterEntrance).catch(error=>{console.warn('Entry cinematic unavailable before introduction',error);afterEntrance()});else afterEntrance()}
function nextLore(){if(storyIndex===null||busy)return;if(storyIndex<loreScenes.length-1){setLoreMusic(true);storyIndex++;renderLore();return}storyIndex=null;playEntranceAndStartIntro()}
function startIntro(){setLoreMusic(false);if(!db)return;db.onboarding.introPending=false;db.onboarding.introActive=true;db.onboarding.introStartedAt=Date.now();save();startMission(null)}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
window.PAOnboarding={begin,beginProfile,beginExisting,next,back,chooseTime,customTime,chooseAvatar,toggleSkipLore,editStep,editPin,cancelPinEdit,editProfile,setName,setGrade,cancelProfileEdit,saveProfileEdit,finish,startIntro,nextLore};
document.addEventListener('visibilitychange',()=>{if(storyIndex!==null)setLoreMusic(!document.hidden)});
document.addEventListener('pa-audio-mute-change',event=>{if(storyIndex!==null)setLoreMusic(!document.hidden&&!event.detail?.muted)});
})();
