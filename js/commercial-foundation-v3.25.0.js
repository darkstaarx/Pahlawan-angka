(()=>{
'use strict';
const DEFAULT={role:'guardian',plan:'free',status:'inactive',current_period_end:null,profile_limit:1};
let access={...DEFAULT},wrapped=false,verified=false,missionClaimPending=false;
const valid=()=>['active','trialing'].includes(access.status)&&(!access.current_period_end||Date.parse(access.current_period_end)>Date.now());
const premium=()=>valid()&&access.plan==='family_plus';
const paid=()=>valid()&&['premium','family_plus'].includes(access.plan);
function canUse(feature){if(feature==='demo')return true;if(!['profiles','missions','progress','focus','report','worksheet'].includes(feature))return false;return canUseDev()||(['focus','report'].includes(feature)?premium():feature==='worksheet'?paid():verified&&!!window.PACloud?.state?.user)}
function requireFeature(feature){if(canUse(feature))return true;openPricing();return false}
const canUseDev=()=>access.role==='admin';
function reset(){verified=false;access={...DEFAULT};localStorage.removeItem('pa_dev_unlocked');if(typeof db!=='undefined'&&db)db.devMode=false;render()}
async function refresh(){
 const state=window.PACloud?.state;verified=false;access={...DEFAULT};if(!state?.client||!state.user){reset();return access}
 const userId=state.user.id;
 try{const {data,error}=await state.client.rpc('get_commercial_access');if(error)throw error;if(window.PACloud?.state?.user?.id!==userId)return access;access={...DEFAULT,...(Array.isArray(data)?data[0]:data||{})};verified=!!data}
 catch(error){console.warn('Commercial access unavailable; using free plan',error);access={...DEFAULT}}
 if(!canUseDev()){localStorage.removeItem('pa_dev_unlocked');if(typeof db!=='undefined'&&db)db.devMode=false}
 render();installProfileLimit();return access
}
 function currentPlan(){
  if(!window.PACloud?.state?.user||!verified)return '';
  if(access.plan==='free'&&access.status==='inactive')return 'free';
  return valid()&&['premium','family_plus'].includes(access.plan)?access.plan:'';
 }
 function planPrice(plan){return Number(window.PAPayments?.plans?.[plan]?.price ?? (plan==='family_plus'?29:19));}
 function money(value){const n=Number(value||0);return Number.isInteger(n)?`RM${n}`:`RM${n.toFixed(2)}`;}
 const plannedNormalPrices={premium:29,family_plus:49};
 function pricingMarkup(){const plus=premium(),active=paid();return `<section class="paPlanCard"><div><small>PELAN SEMASA</small><h3>${plus?'Family Plus aktif':active?'Akses Keluarga aktif':'Akses Mesra'}</h3><p>${plus?'Kemahiran Fokus (9 mini games) dan sehingga lima profil anak.':active?'Semua Darjah 1–6, dua profil anak dan satu muat turun worksheet sehari.':'Satu profil anak, satu misi sehari dan rekod kemajuan.'}</p></div><button type="button" onclick="PACommercial.openPricing()">${active?'Lihat akses':'Naik taraf akses'}</button></section>`}
function render(){
 const focus=document.getElementById('mv2FocusCard');
 if(focus){const locked=!canUse('focus');focus.setAttribute('data-plan-locked',String(locked));focus.setAttribute('aria-label',locked?'Kemahiran Fokus dikunci · Family Plus':'Latih kemahiran fokus');
 let badge=document.getElementById('paFocusPlanBadge');if(!badge){focus.insertAdjacentHTML('afterbegin','<span id="paFocusPlanBadge" class="paFocusPlanBadge">🔒 Family Plus</span>');badge=document.getElementById('paFocusPlanBadge');}if(badge)badge.hidden=!locked;}

 const controls=document.getElementById('cloudParentControls');if(controls&&!document.getElementById('paPlanMount')){const mount=document.createElement('div');mount.id='paPlanMount';controls.before(mount)}
 const mount=document.getElementById('paPlanMount');if(mount)mount.innerHTML=pricingMarkup();
 const manager=document.querySelector('.pmManager');if(manager){const plan=manager.querySelector('.paManagerPlan');if(plan)plan.innerHTML=pricingMarkup();else manager.insertAdjacentHTML('beforeend',`<div class="paManagerPlan">${pricingMarkup()}</div>`)}
  const pricing=document.getElementById('paPricingOverlay');if(pricing)updatePricingCards(pricing);
}
 function updatePricingCards(overlay){if(!overlay?.querySelectorAll)return;const current=currentPlan(); const difference=planPrice('family_plus')-planPrice('premium'); overlay.querySelectorAll('[data-pa-card]').forEach(card=>{const plan=card.dataset.paCard,badge=card.querySelector('.paCurrentPlanBadge'),button=card.querySelector('[data-pa-checkout]'),price=card.querySelector('[data-plan-price]'),saving=card.querySelector('[data-pa-saving]');const isCurrent=plan===current; if(badge)badge.hidden=!isCurrent; if(price&&planPrice(plan)!==0)price.textContent=money(planPrice(plan)); if(saving&&plannedNormalPrices[plan]!==undefined){const amount=plannedNormalPrices[plan]-planPrice(plan);saving.hidden=amount<=0;if(amount>0)saving.textContent=`Jimat ${money(amount)}`;} if(button){button.disabled=isCurrent||current==='family_plus'&&(plan==='premium');button.textContent=plan==='family_plus'&&current==='premium'?`Upgrade · Tambah ${money(difference)}`:isCurrent?'Pelan semasa':plan==='family_plus'?'Pilih Family Plus':'Pilih Akses Keluarga';}});}
 /* One pricing component for both uses: manage/upgrade (signed in) and the first-time entry flow
    (options.entry): choose a plan → Google sign-in → CHIP → verified payment → child profiles. */
 function openPricing(options){
 const entry=!!(options&&options.entry);
 let overlay=document.getElementById('paPricingOverlay');if(!overlay){document.body.insertAdjacentHTML('beforeend',`<div id="paPricingOverlay" class="paPricingOverlay hidden" role="dialog" aria-modal="true"><div class="paPricing"><button class="paPricingClose" onclick="PACommercial.closePricing()">×</button><small>SEKALI BAYAR · AKSES KEKAL</small><h2>Pilih akses untuk keluarga</h2><ol class="paPricingSteps" data-entry-only aria-label="Langkah pembelian"><li>Pilih pakej</li><li>Log masuk Google</li><li>Bayar</li><li>Setup profil anak</li></ol><aside class="paPromoBanner" aria-labelledby="paPromoTitle"><div class="paPromoBannerContent"><small>MASA TERHAD</small><h2 id="paPromoTitle">PROMO PELANCARAN</h2><p><span data-plan-price="premium">RM19</span> Akses Keluarga <span aria-hidden="true">·</span> <span data-plan-price="family_plus">RM29</span> Family Plus</p><span>Sekali bayar · Akses kekal</span></div></aside><div class="paPrices"><article class="best" data-pa-card="family_plus"><em>PALING LENGKAP</em><span class="paCurrentPlanBadge" hidden>Pelan semasa</span><b>Family Plus</b><span class="paBetaLabel">PROMO PELANCARAN</span><del class="paRegularPrice" aria-label="Harga biasa RM49">RM49</del><span class="paSaving" data-pa-saving>Jimat RM20</span><strong data-plan-price="family_plus">RM29</strong><span>sekali bayar</span><ul><li>Semua dalam Akses Keluarga</li><li>Akses ke Kemahiran Fokus (9 mini games)</li><li>Laporan PDF dan worksheet tanpa had muat turun</li><li>Sehingga lima profil anak</li><li>Akses automatik kepada semua ciri baharu yang dilancarkan dalam <b>2 bulan selepas pembelian</b>, tanpa caj tambahan.</li></ul><button type="button" class="btn primary" data-pa-checkout="family_plus">Pilih Family Plus</button></article><article data-pa-card="premium"><span class="paCurrentPlanBadge" hidden>Pelan semasa</span><b>Akses Keluarga</b><span class="paBetaLabel">PROMO PELANCARAN</span><del class="paRegularPrice" aria-label="Harga biasa RM29">RM29</del><span class="paSaving" data-pa-saving>Jimat RM10</span><strong data-plan-price="premium">RM19</strong><span>sekali bayar</span><ul><li>Semua Darjah 1–6 · misi tanpa had</li><li>Dua profil anak</li><li>Worksheet: satu muat turun sehari bagi setiap akaun keluarga</li><li>Cikgu Dimensi dan rekod kemajuan</li></ul><button type="button" class="btn primary" data-pa-checkout="premium">Pilih Akses Keluarga</button></article><article class="free" data-pa-card="free"><span class="paCurrentPlanBadge" hidden>Pelan semasa</span><b>Akses Mesra</b><strong>RM0</strong><span>Percuma</span><ul><li>Satu profil anak</li><li>Satu misi sehari</li><li>Demo boleh dimainkan tanpa had</li><li>Rekod kemajuan anak</li><li>Worksheet dan ciri Plus memerlukan pelan berbayar</li></ul><p>Kuota misi dikira apabila misi dimulakan. Reset pada tengah malam waktu Malaysia.</p></article></div><p class="paBetaNote">Promo pelancaran: harga semasa RM19 untuk Akses Keluarga dan RM29 untuk Family Plus. Harga biasa yang dirancang: RM29 dan RM49.</p><p class="paPriceNote">Perlu satu profil tambahan sahaja? Tambah <b>RM5</b> bagi setiap profil.</p><p class="paPriceNote">Pembayaran melalui ToyyibPay. Akses dibuka selepas bayaran disahkan.</p><p class="paPriceNote" data-manage-only>Komisen affiliate dikira untuk jualan penuh. Upgrade tidak menerima komisen tambahan.</p><p>Urusan pembelian hanya melalui akaun penjaga.</p></div></div>`);overlay=document.getElementById('paPricingOverlay');
  // Entry mode: plan buttons continue the entry flow (sign-in first if needed) instead of the signed-in checkout.
  overlay.addEventListener('click',event=>{if(overlay.dataset.mode!=='entry')return;const button=event.target.closest?.('[data-pa-checkout]');if(!button)return;event.preventDefault();event.stopImmediatePropagation();overlay.classList.add('hidden');window.PAEntry?.choose?.(button.dataset.paCheckout==='family_plus'?'family_plus':'premium')},true)}
 overlay.dataset.mode=entry?'entry':'manage';const freeCard=overlay.querySelector('[data-pa-card="free"]');if(freeCard)freeCard.hidden=entry;
 updatePricingCards(overlay); overlay.classList.remove('hidden');window.PAPayments?.refreshCatalog?.().then(()=>{if(!overlay.classList.contains('hidden')){updatePricingCards(overlay);}}).catch(()=>{});
}
let missionCheckPending=false;
async function checkMissionAccess(){
 if(missionCheckPending||!requireFeature('missions'))return false;
 const cloud=window.PACloud?.state,userId=cloud?.user?.id;if(!cloud?.client||!userId)return false;
 missionCheckPending=true;
 try{const {data,error}=await cloud.client.rpc('get_daily_mission_access');if(error)throw error;
 if(window.PACloud?.state?.user?.id!==userId)return false;
 if(!data?.allowed){showMissionLimit(data?.day);return false;}return true;
 }catch(error){console.warn('Mission access unavailable',error);alert('Akses misi belum dapat disahkan. Semak sambungan dan cuba semula.');return false;}
 finally{missionCheckPending=false;}
}
async function authorizeMission(){
 if(missionClaimPending||!requireFeature('missions'))return false;
 const cloud=window.PACloud?.state,userId=cloud?.user?.id;
 if(!cloud?.client||!userId)return false;
 missionClaimPending=true;
 try{const {data,error}=await cloud.client.rpc('claim_daily_mission');
 if(error)throw error;
 if(window.PACloud?.state?.user?.id!==userId)return false;
 if(!data?.allowed){showMissionLimit(data.day);return false;}return true;
 }catch(error){console.warn('Mission quota unavailable',error);alert('Akses misi belum dapat disahkan. Semak sambungan dan cuba semula.');return false;}
 finally{missionClaimPending=false;}
}
function missionResetLabel(day){
 const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(day||''));
 if(!match)return '12:00 tengah malam waktu Malaysia';
 const reset=new Date(Date.UTC(Number(match[1]),Number(match[2])-1,Number(match[3])+1)-8*60*60*1000);
 return '12:00 tengah malam, '+reset.toLocaleDateString('ms-MY',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Kuala_Lumpur'})+' (waktu Malaysia)';
}
let missionLimitTrigger=null;
function showMissionLimit(day){
 missionLimitTrigger=document.activeElement;
 let overlay=document.getElementById('paMissionLimitOverlay');
 if(!overlay){document.body.insertAdjacentHTML('beforeend',`<div id="paMissionLimitOverlay" class="paPricingOverlay hidden" role="dialog" aria-modal="true" aria-labelledby="paMissionLimitTitle"><div class="paPricing paMissionLimitCard" tabindex="-1"><button class="paPricingClose" aria-label="Tutup" onclick="PACommercial.closeMissionLimit()">×</button><div class="paMissionLimitIcon" aria-hidden="true">🛡️</div><small>KEMBARA WIRA</small><h2 id="paMissionLimitTitle">Rehat sekejap, Wira!</h2><p>Wira sudah menggunakan satu misi percuma hari ini. Kembara seterusnya menanti apabila kuota dibuka semula!</p><div class="paMissionReset"><b>Misi seterusnya dibuka pada</b><span id="paMissionResetTime"></span></div><p>Tunggu sehingga kuota dibuka semula, atau pilih pelan berbayar untuk teruskan kembara tanpa had misi.</p><div class="paMissionLimitActions"><button class="btn secondary" onclick="PACommercial.closeMissionLimit()">Tunggu esok</button><button class="btn primary" onclick="PACommercial.viewMissionPlans()">Lihat pelan untuk sambung</button></div></div></div>`);overlay=document.getElementById('paMissionLimitOverlay');
 overlay.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();closeMissionLimit();}});
 }
 document.getElementById('paMissionResetTime').textContent=missionResetLabel(day);
 overlay.classList.remove('hidden');overlay.querySelector('.paMissionLimitCard')?.focus();
}
function closeMissionLimit(){document.getElementById('paMissionLimitOverlay')?.classList.add('hidden');missionLimitTrigger?.focus?.();}
function viewMissionPlans(){closeMissionLimit();openPricing();}
function closePricing(){const overlay=document.getElementById('paPricingOverlay');if(!overlay)return;const entry=overlay.dataset.mode==='entry';overlay.classList.add('hidden');if(entry&&!window.PACloud?.state?.user)window.PAEntry?.welcome?.()}
function installProfileLimit(){
 const pm=window.PAProfileManager;if(!pm||wrapped)return;const original=pm.create;
 pm.create=function(){
  const count=window.PACloud?.state?.profiles?.length||0;
  const limit=Number(access.profile_limit||0);
  if(!canUseDev()&&(!canUse('profiles')||count>=limit)){openPricing();return}
  return original.apply(pm,arguments)
 };
 wrapped=true
}
function boot(){refresh();setInterval(()=>{installProfileLimit();render()},1200)}
window.PACommercial={refresh,reset,render,openPricing,closePricing,isPremium:premium,isPaid:paid,canUse,requireFeature,canUseDev,checkMissionAccess,authorizeMission,closeMissionLimit,viewMissionPlans,getAccess:()=>({...access})};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
