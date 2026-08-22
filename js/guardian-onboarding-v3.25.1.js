(()=>{
'use strict';
let step=1,draft=null,busy=false;
const $=id=>document.getElementById(id);
const goals={school:['Ikut tahap sekolah','Latihan disusun mengikut darjah anak.'],foundation:['Kukuhkan asas','Utamakan asas yang belum stabil.'],exam:['Persediaan ujian','Latihan campuran mengikut format ujian sekolah.']};
function needsWizard(){return !!window.PACloud?.state?.user&&window.PACloud.state.needsOnboarding===true}
function openDraft(data){draft={pin:'',daily:20,session:20,goal:'school',...data};step=1;busy=false;render();screen('guardianOnboarding')}
function begin(){
 const name=($('child')?.value||'').trim(),grade=Number($('gradeSelect')?.value||2);
 if(!name){$('child')?.focus();return}
 if(!needsWizard()){window.startNew();return}
 const hero=$('pick-bunga')?.classList.contains('active')?'bunga':'wira';
 openDraft({name,grade,hero,source:'setup'})
}
function beginProfile(data){openDraft({...data,source:'profile-manager'})}
function beginExisting(profile){openDraft({name:profile.display_name,grade:Number(profile.grade),hero:profile.hero_id||'wira',existingId:profile.id,source:'profile-manager'})}
function field(){return $('onboardingBody')}
function render(){
 $('onboardingStepLabel').textContent=`Langkah ${step} daripada 4`;$('onboardingProgressFill').style.width=`${step*25}%`;
 if(step===1)field().innerHTML=`<div class="onboardingIcon">🔐</div><div class="eyebrow">PIN PENJAGA</div><h1>Lindungi bahagian ibu bapa</h1><p>PIN diperlukan untuk laporan, tetapan masa, profil dan pembelian.</p><label>PIN 4 digit<input id="obPin" class="pinInput" inputmode="numeric" maxlength="4" placeholder="••••" value="${draft.pin}"></label><label>Sahkan PIN<input id="obPin2" class="pinInput" inputmode="numeric" maxlength="4" placeholder="••••"></label><div id="obError" class="onboardingError"></div><button class="btn primary" onclick="PAOnboarding.next()">Teruskan</button>`;
 if(step===2)field().innerHTML=`<div class="onboardingIcon">⏱️</div><div class="eyebrow">RUTIN BERMAIN</div><h1>Tetapkan masa yang sesuai</h1><p>Kami cadangkan sesi pendek dan konsisten. Had boleh diubah kemudian.</p><div class="timeChoices">${[10,15,20,30].map(n=>`<button class="${draft.daily===n?'active':''}" onclick="PAOnboarding.chooseTime(${n})">${n}<small>minit</small></button>`).join('')}</div><label class="onboardingCheck"><input id="obHardLock" type="checkbox" checked> Kunci permainan apabila had dicapai</label><button class="btn primary" onclick="PAOnboarding.next()">Teruskan</button>`;
 if(step===3)field().innerHTML=`<div class="onboardingIcon">🧭</div><div class="eyebrow">MATLAMAT ANAK</div><h1>Apa yang perlu diutamakan?</h1><p>Cikgu Dimensi tetap menyesuaikan latihan mengikut bukti pembelajaran sebenar.</p><div class="goalChoices">${Object.entries(goals).map(([id,g])=>`<button class="${draft.goal===id?'active':''}" onclick="PAOnboarding.chooseGoal('${id}')"><b>${g[0]}</b><small>${g[1]}</small></button>`).join('')}</div><button class="btn primary" onclick="PAOnboarding.next()">Teruskan</button>`;
 if(step===4)field().innerHTML=`<div class="onboardingIcon">🛡️</div><div class="eyebrow">SEMAKAN PENJAGA</div><h1>Sedia untuk ${escapeHtml(draft.name)}</h1><div class="onboardingSummary"><span>Profil<b>${escapeHtml(draft.name)} · Darjah ${draft.grade}</b></span><span>Pahlawan<b>${draft.hero==='bunga'?'Bunga':'Wira'}</b></span><span>Had harian<b>${draft.daily} minit</b></span><span>Matlamat<b>${goals[draft.goal][0]}</b></span></div><p class="handoffNote">Selepas ini, serahkan peranti kepada anak untuk memulakan Misi Pengenalan.</p><div id="obError" class="onboardingError"></div><button class="btn primary" onclick="PAOnboarding.finish()" ${busy?'disabled':''}>${busy?'Menyediakan profil…':'Simpan & serahkan kepada anak'}</button>`;
}
function next(){
 if(step===1){const a=($('obPin')?.value||'').trim(),b=($('obPin2')?.value||'').trim();if(!/^\d{4}$/.test(a)||a!==b)return error(a!==b?'PIN tidak sepadan.':'Masukkan PIN 4 digit.');draft.pin=a}
 if(step<4){step++;render()}
}
function back(){if(busy)return;if(step>1){step--;render()}else if(draft?.source==='profile-manager')window.PAProfileManager?.open?.();else screen('setup')}
function chooseTime(n){draft.daily=n;draft.session=n;render()}
function chooseGoal(id){if(goals[id])draft.goal=id;render()}
function error(message){const el=$('obError');if(el)el.textContent=message}
async function finish(){
 if(busy)return;busy=true;render();
 try{
  if(draft.existingId){
   await window.PACloud?.selectChild?.(draft.existingId,false);
  }else{
   if($('child'))$('child').value=draft.name;if($('gradeSelect'))$('gradeSelect').value=String(draft.grade);
   if(typeof window.chooseHero==='function')window.chooseHero(draft.hero);
   window.startNew();
   db.parentPin=draft.pin;db.learningGoal=draft.goal;db.onboarding={completed:true,completedAt:Date.now(),introPending:true};save();
   screen('guardianOnboarding');
   await waitForChild();
  }
  db.parentPin=draft.pin;db.learningGoal=draft.goal;db.onboarding={completed:true,completedAt:Date.now(),introPending:true};save();
  await window.PACloud?.saveOnboardingControls?.({daily_limit_minutes:draft.daily,session_limit_minutes:draft.session,soft_nudge_minutes:15,hard_lock_enabled:true,show_elapsed_timer:true});
  await window.PACloud?.syncSaveNow?.();
  field().innerHTML=`<div class="onboardingIcon heroReady">⚔️</div><div class="eyebrow">UNTUK ${escapeHtml(draft.name).toUpperCase()}</div><h1>Misi Pengenalan menanti!</h1><p>Ini bukan peperiksaan. Cikgu Dimensi akan mencari tahap yang paling sesuai melalui beberapa cabaran ringkas.</p><ul class="introPromises"><li>Jawab ikut kemampuan sendiri</li><li>Petunjuk boleh digunakan</li><li>Tiada markah gagal</li></ul><button class="btn primary" onclick="PAOnboarding.startIntro()">Mulakan Misi Pengenalan</button>`;
 }catch(e){console.error(e);busy=false;render();error('Profil disimpan pada peranti. Sambungan awan akan dicuba semula.')}
}
function waitForChild(){return new Promise((resolve,reject)=>{let tries=0;const timer=setInterval(()=>{const s=window.PACloud?.state;if(s?.childId&&!s.needsOnboarding){clearInterval(timer);resolve()}else if(++tries>60){clearInterval(timer);reject(new Error('child profile timeout'))}},150)})}
function startIntro(){if(!db)return;db.onboarding.introPending=false;db.onboarding.introActive=true;db.onboarding.introStartedAt=Date.now();save();startMission(null)}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
window.PAOnboarding={begin,beginProfile,beginExisting,next,back,chooseTime,chooseGoal,finish,startIntro};
})();
