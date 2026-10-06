// Battle-only accidental-exit protection. Device Home gestures remain OS-owned.
(()=>{
 'use strict';
 if(window.PAPageLock)return;
 const key='paPageLock';
 let enabled=true, installed=false, restoring=false, previousFocus=null, pendingExit=null, setupMode=false;
 const guardianPin=()=>{
  const pin=String(window.pageLockParentPin?.()||'');
  return /^\d{4}$/.test(pin)?pin:null;
 };
 const inBattle=()=>['game','segelDemo'].includes(document.body.dataset.screen);
 const active=()=>inBattle()&&enabled&&!!guardianPin();
 const dialog=document.createElement('dialog');
 dialog.className='paExitDialog';
 dialog.setAttribute('aria-labelledby','paExitTitle');
 dialog.innerHTML='<div class="paExitHead"><div><span class="paExitEyebrow">KAWALAN IBU BAPA</span><h2 id="paExitTitle">Kunci battle aktif</h2></div><button type="button" class="paExitInfoButton" data-open-info aria-label="Maklumat kunci aplikasi" aria-haspopup="dialog">ⓘ</button></div><p data-exit-message>Masukkan PIN ibu bapa untuk buka kunci.</p><form data-pin-form><label class="paExitPinLabel">PIN ibu bapa<input data-exit-pin type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off" aria-describedby="paExitError" placeholder="••••"></label><label class="paExitPinLabel" data-confirm-label>Sahkan PIN ibu bapa<input data-confirm-pin type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off" placeholder="••••"></label><p id="paExitError" role="alert"></p><div class="paExitActions"><button type="button" class="btn primary" data-stay autofocus>Sambung battle</button><button type="submit" class="btn secondary" data-unlock>Sahkan PIN · Buka kunci</button></div></form>';
 document.body.append(dialog);
 const infoDialog=document.createElement('dialog');
 infoDialog.className='paExitDialog paExitInfoOverlay';
 infoDialog.setAttribute('aria-labelledby','paExitInfoTitle');
 infoDialog.innerHTML='<div class="paExitHead"><h2 id="paExitInfoTitle">Info kunci</h2><button type="button" class="paExitInfoButton" data-close-info aria-label="Tutup maklumat" autofocus>×</button></div><p class="paExitNote">Kunci ini menjaga keluar dari battle. PIN ibu bapa diperlukan untuk membuka kunci. Panduan kunci peranti ada dalam Tetapan Ibu Bapa.</p><p class="paExitNote">Untuk kunci butang Home, guna Screen Pinning (Android) atau Guided Access (iPhone). Tutup tab masih dikawal pelayar.</p>';
 document.body.append(infoDialog);
 const infoButton=dialog.querySelector('[data-open-info]');
 function closeInfo(){infoDialog.close();infoButton.focus();}
 infoButton.addEventListener('click',()=>{if(!infoDialog.open)infoDialog.showModal();});
 infoDialog.querySelector('[data-close-info]').addEventListener('click',closeInfo);
 infoDialog.addEventListener('cancel',event=>{event.preventDefault();closeInfo();});
 const confirmLabel=dialog.querySelector('[data-confirm-label]');
 const input=dialog.querySelector('[data-exit-pin]');
 const confirmInput=dialog.querySelector('[data-confirm-pin]');
 const error=dialog.querySelector('#paExitError');
 function render(){
  document.querySelectorAll('[data-page-lock]').forEach(button=>{
   button.hidden=!inBattle();
   button.textContent=active()?'🔒':'🔓';
   button.title=active()?'Buka kunci battle':'Kunci battle';
   button.setAttribute('aria-pressed',String(active()));
   button.setAttribute('aria-label',active()?'Kunci battle aktif. Masukkan PIN untuk buka kunci.':'Aktifkan kunci battle');
  });
 }
 function arm(){
  if(installed||!active())return;
  try{
   history.replaceState({...history.state,[key]:'base'},'',location.href);
   history.pushState({...history.state,[key]:'guard'},'',location.href);
   installed=true;
  }catch(error){console.warn('Kunci Back tidak tersedia.',error);}
 }
 function close(){if(infoDialog.open)infoDialog.close();pendingExit=null;input.value='';confirmInput.value='';error.textContent='';dialog.close();previousFocus?.focus();}
 function prompt(onExit=null){
  if(dialog.open)return;
  pendingExit=onExit;previousFocus=document.activeElement;
  input.value='';confirmInput.value='';error.textContent='';
  if(infoDialog.open)infoDialog.close();
  const configured=!!guardianPin();
  setupMode=!configured;
  input.disabled=false;
  confirmLabel.hidden=configured;
  confirmInput.disabled=configured;
  dialog.querySelector('[data-unlock]').disabled=false;
  dialog.querySelector('[data-unlock]').textContent=configured?(onExit?'Sahkan PIN · Keluar battle':'Sahkan PIN · Buka kunci'):'Simpan PIN · Aktifkan kunci';
  dialog.querySelector('#paExitTitle').textContent=configured?(onExit?'Keluar dari battle?':'Kunci battle aktif'):'Cipta PIN ibu bapa';
  dialog.querySelector('[data-stay]').textContent=configured?'Sambung battle':'Batal';
  dialog.querySelector('[data-exit-message]').textContent=configured
   ?(onExit?'Masukkan PIN ibu bapa untuk teruskan keluar.':'Masukkan PIN ibu bapa untuk buka kunci battle.')
   :'Cipta dan sahkan PIN 4 digit.';
  dialog.showModal();
 }
 function unlock(event){
  event.preventDefault();
  const expected=guardianPin();
  const pin=input.value.trim();
  if(!/^\d{4}$/.test(pin)){error.textContent='Masukkan 4 digit PIN ibu bapa.';input.focus();return;}
  if(setupMode){
   if(expected){error.textContent='PIN sudah tersedia. Tutup dan buka semula untuk pengesahan.';return;}
   if(pin!==confirmInput.value.trim()){error.textContent='PIN pengesahan tidak sepadan.';confirmInput.focus();return;}
   try{
    if(!window.createPageLockParentPin?.(pin)){error.textContent='PIN belum dapat disimpan. Cuba semula.';return;}
   }catch(_){error.textContent='PIN tidak dapat disimpan. Benarkan storan pelayar dan cuba semula.';return;}
   enabled=true;close();sync();return;
  }
  if(!expected){error.textContent='PIN ibu bapa belum ditetapkan. Tutup dan buka semula untuk mencipta PIN.';return;}
  if(pin!==expected){error.textContent='PIN tidak tepat. Cuba semula.';input.value='';input.focus();return;}
  const onExit=pendingExit;
  enabled=false;close();sync();
  if(onExit)onExit();
 }
 dialog.querySelector('[data-stay]').addEventListener('click',close);
 dialog.querySelector('[data-pin-form]').addEventListener('submit',unlock);
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 function toggle(){
  if(active()||!guardianPin())prompt();
  else{enabled=true;sync();}
 }
 // Battle controls only: the classic battle header and the live Segel row.
 for(const host of document.querySelectorAll('.appHeader,.segelTop')){
  const button=document.createElement('button');
  button.type='button';button.className='paPageLockButton';
  button.setAttribute('data-page-lock','');button.addEventListener('click',toggle);
  host.append(button);
 }
 // While battle is locked, protect its Back/exit controls as well as browser exit.
 document.addEventListener('click',event=>{
  if(!active()||dialog.open)return;
  const target=event.target.closest?.('button,a,[onclick]');
  if(!target||target.hasAttribute('data-page-lock'))return;
  const handler=target.getAttribute('onclick')||'';
  const appPath=new URL('.',location.href).pathname;
  const destination=target.tagName==='A'&&target.hasAttribute('href')?new URL(target.href,location.href):null;
  const external=destination&&!target.hasAttribute('download')&&(destination.origin!==location.origin||!destination.pathname.startsWith(appPath));
  const exits=/\b(?:goLogin|logoutDemo|closeSegelDemo|goHub|navHome|returnFromLearning)\s*\(|PACloud\.logout\s*\(/.test(handler);
  if(!external&&!exits)return;
  event.preventDefault();event.stopImmediatePropagation();
  prompt(()=>target.click());
 },true);
 window.addEventListener('popstate',event=>{
  if(restoring){restoring=false;return;}
  if(!installed||event.state?.[key]!=='base')return;
  if(active()){restoring=true;history.forward();prompt(()=>{installed=false;history.go(-2);});}
  else{installed=false;history.back();}
 });
 function beforeUnload(event){if(active()){event.preventDefault();event.returnValue='';}}
 let unloadArmed=false;
 function sync(){
  if(active()&&!unloadArmed){window.addEventListener('beforeunload',beforeUnload);unloadArmed=true;}
  if(!active()&&unloadArmed){window.removeEventListener('beforeunload',beforeUnload);unloadArmed=false;}
  render();arm();
 }
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['data-screen']});
 window.PAPageLock={isLocked:active,refresh:sync,requestExit(onExit){if(!active())return true;prompt(onExit);return false;}};
 sync();
})();


