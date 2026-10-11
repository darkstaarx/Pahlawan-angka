/* Optional offline pack menu. Fail closed without signed entitlements or a tested manifest.
   This is a staging feature and must not ship until release QA A-I passes. */
(function(root){
'use strict';
const $=id=>document.getElementById(id);
const fmt=n=>(Number(n)/1048576).toFixed(1)+' MB';
const state={manifest:null,grade:2,busy:false,controller:null,ready:false,lastStatus:''};
function mount(){
 const host=$('cloudParentControls')||$('paPlanMount');
 if(!host||$('paOfflineDownloads'))return;
 const panel=document.createElement('section');
 panel.id='paOfflineDownloads';panel.className='paOfflineCard';
 panel.innerHTML=
 '<div class="paOfflineHead"><b>Main Tanpa Internet</b><small>Download hanya darjah yang kau pilih</small></div>'+
 '<p>Log masuk dan sahkan akses RM19/RM29 ketika ada internet. Progress akan disimpan pada peranti sebelum sync ke awan.</p>'+
 '<label for="paOfflineGrade">Pilih Darjah</label>'+
 '<select id="paOfflineGrade">'+Array.from({length:6},(_,i)=>'<option value="'+(i+1)+'"'+(i===1?' selected':'')+'>Darjah '+(i+1)+'</option>').join('')+'</select>'+
 '<p id="paOfflineEstimate" aria-live="polite">Semak saiz download sebelum bermula.</p>'+
 '<progress id="paOfflineProgress" max="1" value="0" hidden></progress>'+
 '<p id="paOfflineStatus" role="status" aria-live="polite">Belum dimuat turun</p>'+
 '<div class="paOfflineActions"><button type="button" id="paOfflineDownload" disabled>Download untuk main offline</button>'+
 '<button type="button" id="paOfflineRetry" hidden>Cuba Lagi</button>'+
 '<button type="button" id="paOfflineRemove" hidden>Padam Fail Offline</button></div>'+
 '<p class="paOfflineFine">Fail offline boleh dipadam oleh pelayar jika ruang telefon penuh. Padam fail download tidak memadam progress anak.</p>';
 host.appendChild(panel);
 $('paOfflineGrade').onchange=()=>{state.grade=Number($('paOfflineGrade').value);void check()};
 $('paOfflineDownload').onclick=()=>{void download()};
 $('paOfflineRetry').onclick=()=>{void download()};
 $('paOfflineRemove').onclick=()=>{void remove()};
 void check();
}
function status(msg,bad=false){state.lastStatus=msg;const el=$('paOfflineStatus');if(el){el.textContent=msg;el.classList.toggle('error',bad)}}
function buttons(){
 const active=!!state.manifest&&!state.busy&&!state.ready&&navigator.onLine!==false;
 if($('paOfflineDownload'))$('paOfflineDownload').disabled=!active;
 if($('paOfflineRetry'))$('paOfflineRetry').hidden=state.busy||!state.manifest||state.ready;
 if($('paOfflineRemove'))$('paOfflineRemove').hidden=state.busy||!state.ready;
 if($('paOfflineGrade'))$('paOfflineGrade').disabled=state.busy;
}
async function verify(){
 const id=root.PACloud?.state?.user?.id;
 if(!id)return {verified:false,reason:'Log masuk sebagai penjaga terlebih dahulu'};
 let proof=await root.PAOfflineEntitlement?.restore?.(id);
 if(!proof?.verified&&navigator.onLine!==false){
  await root.PACommercial?.prepareOfflineReceipt?.(root.PACloud.state);
  proof=await root.PAOfflineEntitlement?.restore?.(id);
 }
 return proof?.verified?proof:{verified:false,reason:'Akses pembelian offline belum disahkan. Sambung internet.'};
}
async function check(){
 if(state.busy)return;
 state.manifest=null;state.ready=false;
 const q=state.grade;
 if(!root.PAOfflinePackCore||!root.PAOfflineEntitlement){
  status('Mod offline belum tersedia pada versi ini.',true);buttons();return;
 }
 try{
  const r=await fetch('offline/manifests/darjah-'+q+'.json',{cache:'no-store'});
  if(!r.ok)throw Error('Pakej Darjah '+q+' belum disediakan atau belum disahkan');
  const manifest=await r.json(),info=await root.PAOfflinePackCore.inspect(manifest);
  if(state.grade!==q)return;
  state.manifest=manifest;
  const identity=root.PACloud?.state?.user?.id;
  const grant=identity?await root.PAOfflineEntitlement?.restore?.(identity):null;
  state.ready=!!info.ready&&!!grant?.verified&&grant.userId===identity&&
    manifest.scopes.every(s=>grant.scopes.includes(s));
  const estimate=$('paOfflineEstimate');
  if(estimate)estimate.textContent='Anggaran muat turun: '+fmt(info.estimatedBytes)+' · '+info.total+' fail';
  status(state.ready?'Sedia offline — Darjah '+q:
    info.ready?'Fail sudah dimuat turun; log masuk dan sahkan akses untuk main offline.':
    'Kandungan Darjah '+q+' belum dimuat turun');
 }catch(e){if(state.grade===q)status(e.message||'Manifest offline gagal dibuka',true)}
 buttons();
}
async function download(){
 if(state.busy||!state.manifest||!root.PAOfflinePackCore)return;
 const selected=state.grade,proof=await verify();
 if(!proof.verified){status(proof.reason||'Pengesahan akses gagal',true);return}
 state.busy=true;buttons();
 const progress=$('paOfflineProgress');if(progress){progress.hidden=false;progress.value=0;}
 const controller=new AbortController();state.controller=controller;
 try{
  const result=await root.PAOfflinePackCore.start(state.manifest,{
   verifyEntitlement:async()=>proof,signal:controller.signal,
   onProgress:({done,total,networkBytes,stage})=>{
    if(selected!==state.grade)return;
    if(progress){progress.max=total||1;progress.value=done;}
    if(stage==='downloading')status('Memuat turun '+done+'/'+total+' fail · diterima '+fmt(networkBytes));
    if(stage==='interrupted')status('Muat turun terhenti. Tekan Cuba Lagi.',true);
   }
  });
  const final=await root.PAOfflinePackCore.inspect(state.manifest);
  state.ready=!!result.ready&&!!final.ready;
  status(state.ready?'Sedia offline — Darjah '+selected:
   'Pengesahan fail gagal. Cuba Lagi.',!state.ready);
 }catch(e){status((e?.message||'Muat turun gagal')+' · Cuba Lagi',true)}
 finally{state.busy=false;state.controller=null;buttons()}
}
async function remove(){
 if(state.busy||!state.manifest)return;
 if(!confirm('Padam fail offline Darjah '+state.grade+'? Progress anak tidak dipadam.'))return;
 try{
  await root.PAOfflinePackCore.remove(state.manifest.version);
  state.ready=false;status('Fail offline telah dipadam. Progress anak tidak terjejas.');buttons();
 }catch(e){status(e.message||'Gagal membuang fail offline',true)}
}
function setSaveStatus(value){
 const mapping={
  synced:'Progress disimpan pada peranti dan awan',
  local_only:'Progress disimpan pada peranti · menunggu internet',
  conflict:'Konflik progress dikesan · jangan buang data peranti',
  error:'Gagal menyimpan progress pada peranti'
 };
 let el=$('paOfflineSync');
 if(!el){const host=$('paOfflineDownloads');
  if(host){el=document.createElement('p');el.id='paOfflineSync';host.insertBefore(el,host.querySelector('.paOfflineFine'))}}
 if(el){el.textContent=mapping[value]||'Status simpanan belum diketahui';el.dataset.status=value}
 let global=$('paOfflineGlobalSaveStatus');
 if(!global){
   global=document.createElement('aside');global.id='paOfflineGlobalSaveStatus';
   global.setAttribute('role','status');global.setAttribute('aria-live','polite');
   document.body.appendChild(global);
 }
 global.textContent=mapping[value]||'Status simpanan belum diketahui';
 global.dataset.status=value;
}
function install(){
 mount();
 new MutationObserver(()=>{if(!$('paOfflineDownloads'))mount()}).observe(document.body,{childList:true,subtree:true});
 root.addEventListener('online',()=>void check());
 root.addEventListener('offline',()=>buttons());
}
root.PAOfflineUI={mount,check,download,remove,setSaveStatus};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})(window);
