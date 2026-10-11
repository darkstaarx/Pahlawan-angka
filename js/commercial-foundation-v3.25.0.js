(()=>{
'use strict';
const DEFAULT={role:'guardian',plan:'free',status:'inactive',current_period_end:null,profile_limit:0};
let access={...DEFAULT},wrapped=false;
const valid=()=>['active','trialing'].includes(access.status)&&(!access.current_period_end||Date.parse(access.current_period_end)>Date.now());
const premium=()=>valid()&&access.plan==='family_plus';
const paid=()=>valid()&&['premium','family_plus'].includes(access.plan);
function canUse(feature){if(feature==='demo')return true;if(!['profiles','missions','progress','focus','report','worksheet'].includes(feature))return false;return canUseDev()||(['focus','report','worksheet'].includes(feature)?premium():paid())}
function requireFeature(feature){if(canUse(feature))return true;openPricing();return false}
const canUseDev=()=>access.role==='admin';
function reset(){access={...DEFAULT};localStorage.removeItem('pa_dev_unlocked');if(typeof db!=='undefined'&&db)db.devMode=false;render()}
async function refresh(){
 const state=window.PACloud?.state;access={...DEFAULT};if(!state?.client||!state.user){reset();return access}
 const userId=state.user.id;
 try{const {data,error}=await state.client.rpc('get_commercial_access');if(error)throw error;if(window.PACloud?.state?.user?.id!==userId)return access;access={...DEFAULT,...(Array.isArray(data)?data[0]:data||{})}}
 catch(error){console.warn('Commercial access unavailable; using free plan',error);access={...DEFAULT}}
 if(!canUseDev()){localStorage.removeItem('pa_dev_unlocked');if(typeof db!=='undefined'&&db)db.devMode=false}
 render();installProfileLimit();return access
}
function pricingMarkup(){const plus=premium(),active=paid();return `<section class="paPlanCard"><div><small>AKSES KELUARGA</small><h3>${plus?'Family Plus aktif':active?'Akses Keluarga aktif':'Cuba dahulu'}</h3><p>${plus?'Latihan Fokus Plus dan sehingga lima profil anak.':active?'Semua Darjah 1–6 untuk dua profil anak.':'Demo Matematik sahaja. Pilih akses berbayar untuk membuka pembelajaran penuh.'}</p></div><button type="button" onclick="PACommercial.openPricing()">${active?'Lihat akses':'Lihat harga'}</button></section>`}
function render(){
 const controls=document.getElementById('cloudParentControls');if(controls&&!document.getElementById('paPlanMount')){const mount=document.createElement('div');mount.id='paPlanMount';controls.before(mount)}
 const mount=document.getElementById('paPlanMount');if(mount)mount.innerHTML=pricingMarkup();
 const manager=document.querySelector('.pmManager');if(manager&&!manager.querySelector('.paManagerPlan'))manager.insertAdjacentHTML('beforeend',`<div class="paManagerPlan">${pricingMarkup()}</div>`)
}
 function openPricing(){
 let overlay=document.getElementById('paPricingOverlay');if(!overlay){document.body.insertAdjacentHTML('beforeend',`<div id="paPricingOverlay" class="paPricingOverlay hidden" role="dialog" aria-modal="true"><div class="paPricing"><button class="paPricingClose" onclick="PACommercial.closePricing()">×</button><small>SEKALI BAYAR · AKSES KEKAL</small><h2>Pilih akses untuk keluarga</h2><div class="paPrices"><article><b>Akses Keluarga</b><strong>RM19</strong><span>sekali bayar</span><ul><li>Semua Darjah 1–6</li><li>Dua profil anak</li><li>Cikgu Dimensi dan rekod kemajuan</li></ul></article><article class="best"><em>PALING LENGKAP</em><b>Family Plus</b><strong>RM29</strong><span>sekali bayar</span><ul><li>Semua dalam Akses Keluarga</li><li>Latihan Fokus Plus</li><li>Laporan PDF dan worksheet penuh</li><li>Sehingga lima profil anak</li></ul></article></div><p class="paPriceNote">Perlu satu profil tambahan sahaja? Tambah <b>RM5</b> bagi setiap profil.</p><button class="paFounder" disabled>Pembayaran dibuka selepas beta</button><p>Urusan pembelian hanya melalui akaun penjaga.</p></div></div>`);overlay=document.getElementById('paPricingOverlay')}
 overlay.classList.remove('hidden')
}
function closePricing(){document.getElementById('paPricingOverlay')?.classList.add('hidden')}
function installProfileLimit(){
 const pm=window.PAProfileManager;if(!pm||wrapped)return;const original=pm.create;
 pm.create=function(){
  const count=window.PACloud?.state?.profiles?.length||0;
  const limit=Number(access.profile_limit||0);
  if(!canUseDev()&&(!paid()||count>=limit)){openPricing();return}
  return original.apply(pm,arguments)
 };
 wrapped=true
}
function boot(){refresh();setInterval(()=>{installProfileLimit();render()},1200)}
window.PACommercial={refresh,reset,render,openPricing,closePricing,isPremium:premium,isPaid:paid,canUse,requireFeature,canUseDev,getAccess:()=>({...access})};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
