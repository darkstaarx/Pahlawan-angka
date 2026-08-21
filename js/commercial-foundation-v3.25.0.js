(()=>{
'use strict';
const DEFAULT={role:'guardian',plan:'free',status:'inactive',current_period_end:null,profile_limit:2};
let access={...DEFAULT},wrapped=false;
const premium=()=>['active','trialing'].includes(access.status)&&['premium','family_plus'].includes(access.plan);
const canUseDev=()=>access.role==='admin';
function reset(){access={...DEFAULT};localStorage.removeItem('pa_dev_unlocked');if(typeof db!=='undefined'&&db)db.devMode=false;render()}
async function refresh(){
 const state=window.PACloud?.state;if(!state?.client||!state.user){reset();return access}
 try{const {data,error}=await state.client.rpc('get_commercial_access');if(error)throw error;access={...DEFAULT,...(Array.isArray(data)?data[0]:data||{})}}
 catch(error){console.warn('Commercial access unavailable; using free plan',error);access={...DEFAULT}}
 if(!canUseDev()){localStorage.removeItem('pa_dev_unlocked');if(typeof db!=='undefined'&&db)db.devMode=false}
 render();installProfileLimit();return access
}
function pricingMarkup(){return `<section class="paPlanCard"><div><small>PELAN KELUARGA</small><h3>${premium()?'Premium aktif':'Pelan Percuma'}</h3><p>${premium()?'Semua ciri keluarga telah dibuka.':'Dua profil anak percuma. Premium akan dibuka selepas beta.'}</p></div><button type="button" onclick="PACommercial.openPricing()">${premium()?'Lihat pelan':'Lihat harga'}</button></section>`}
function render(){
 const controls=document.getElementById('cloudParentControls');if(controls&&!document.getElementById('paPlanMount')){const mount=document.createElement('div');mount.id='paPlanMount';controls.before(mount)}
 const mount=document.getElementById('paPlanMount');if(mount)mount.innerHTML=pricingMarkup();
 const manager=document.querySelector('.pmManager');if(manager&&!manager.querySelector('.paManagerPlan'))manager.insertAdjacentHTML('beforeend',`<div class="paManagerPlan">${pricingMarkup()}</div>`)
}
function openPricing(){
 let overlay=document.getElementById('paPricingOverlay');if(!overlay){document.body.insertAdjacentHTML('beforeend',`<div id="paPricingOverlay" class="paPricingOverlay hidden" role="dialog" aria-modal="true"><div class="paPricing"><button class="paPricingClose" onclick="PACommercial.closePricing()">×</button><small>PAHLAWAN ANGKA PREMIUM</small><h2>Satu pelan untuk keluarga</h2><div class="paPrices"><article><b>Bulanan</b><strong>RM14.90</strong><span>/bulan</span></article><article class="best"><em>JIMAT</em><b>Tahunan</b><strong>RM119</strong><span>/tahun</span></article></div><ul><li>Semua topik Darjah 1–6</li><li>Auto Coach dan latihan fokus penuh</li><li>Laporan kemajuan keluarga</li><li>Dua profil anak</li></ul><button class="paFounder" disabled>Pembayaran dibuka selepas beta</button><p>Tiada pembelian boleh dibuat oleh murid.</p></div></div>`);overlay=document.getElementById('paPricingOverlay')}
 overlay.classList.remove('hidden')
}
function closePricing(){document.getElementById('paPricingOverlay')?.classList.add('hidden')}
function installProfileLimit(){
 const pm=window.PAProfileManager;if(!pm||wrapped)return;const original=pm.create;
 pm.create=function(){const count=window.PACloud?.state?.profiles?.length||0;if(count>=Number(access.profile_limit||2)&&!premium()){openPricing();return}return original.apply(pm,arguments)};
 wrapped=true
}
function boot(){refresh();setInterval(()=>{installProfileLimit();render()},1200)}
window.PACommercial={refresh,reset,render,openPricing,closePricing,isPremium:premium,canUseDev,getAccess:()=>({...access})};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
