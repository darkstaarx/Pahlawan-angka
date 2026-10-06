// App-wide accidental-exit protection. Device Home gestures remain OS-owned.
(()=>{
 'use strict';
 if(window.PAPageLock)return;
 const key='paPageLock';
 let enabled=true, installed=false, restoring=false, previousFocus=null, pendingExit=null;
 const guardianPin=()=>{
  const pin=String(window.pageLockParentPin?.()||'');
  return /^\d{4}$/.test(pin)?pin:null;
 };
 // Login and parent screens are protected too, once a guardian PIN exists.
 const active=()=>enabled&&!!guardianPin();
 const dialog=document.createElement('dialog');
 dialog.className='paExitDialog';
 dialog.setAttribute('aria-labelledby','paExitTitle');
 dialog.innerHTML='<h2 id="paExitTitle">Aplikasi dikunci</h2><p data-exit-message>Masukkan PIN ibu bapa untuk buka kunci dan keluar. Semua halaman aplikasi dilindungi.</p><form data-pin-form><label class="paExitPinLabel">PIN ibu bapa<input data-exit-pin type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off" aria-describedby="paExitError" placeholder="••••"></label><p id="paExitError" role="alert"></p><div class="paExitActions"><button type="button" class="btn primary" data-stay autofocus>Sambung guna aplikasi</button><button type="submit" class="btn secondary" data-unlock>Sahkan PIN · Buka kunci</button></div></form><p class="paExitNote">Butang Home telefon memerlukan Screen Pinning (Android) atau Guided Access (iPhone). Pelayar mungkin memaparkan pengesahan sendiri apabila tab ditutup.</p>';
 document.body.append(dialog);
 const input=dialog.querySelector('[data-exit-pin]');
 const error=dialog.querySelector('#paExitError');
 function render(){
  document.querySelectorAll('[data-page-lock]').forEach(button=>{
   button.hidden=false;
   button.textContent=active()?'🔒 Kunci keluar':'🔓 Kunci keluar';
   button.setAttribute('aria-pressed',String(active()));
   button.setAttribute('aria-label',active()?'Kunci seluruh aplikasi aktif. Masukkan PIN untuk buka kunci.':'Aktifkan kunci seluruh aplikasi');
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
 function close(){pendingExit=null;input.value='';error.textContent='';dialog.close();previousFocus?.focus();}
 function prompt(onExit=null){
  if(dialog.open)return;
  pendingExit=onExit;previousFocus=document.activeElement;
  input.value='';error.textContent='';
  const configured=!!guardianPin();
  input.disabled=!configured;
  dialog.querySelector('[data-unlock]').disabled=!configured;
  dialog.querySelector('[data-exit-message]').textContent=configured
   ?'Masukkan PIN ibu bapa untuk buka kunci dan keluar. Semua halaman aplikasi dilindungi.'
   :'Kunci belum aktif. Cipta PIN melalui bahagian Ibu Bapa pada profil dahulu. Demo menggunakan PIN profil asal jika tersedia.';
  dialog.showModal();
 }
 function unlock(event){
  event.preventDefault();
  const expected=guardianPin();
  if(!expected){error.textContent='PIN ibu bapa belum ditetapkan.';return;}
  const pin=input.value.trim();
  if(!/^\d{4}$/.test(pin)){error.textContent='Masukkan 4 digit PIN ibu bapa.';input.focus();return;}
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
 // Controls live in existing navigation rows, including the login page.
 for(const host of document.querySelectorAll('.appHeader,.mv2HeadRight,.segelTop,.loginShell,.topNav,.parentTop,.kzHead')){
  const button=document.createElement('button');
  button.type='button';button.className='paPageLockButton';
  button.setAttribute('data-page-lock','');button.addEventListener('click',toggle);
  host.append(button);
 }
 // Intercept in-app Back/exit controls before inline handlers mutate app state.
 // Forward navigation, answers and parent PIN recovery remain usable.
 document.addEventListener('click',event=>{
  if(!active()||dialog.open)return;
  const target=event.target.closest?.('button,a,[onclick]');
  if(!target||target.hasAttribute('data-page-lock'))return;
  const handler=target.getAttribute('onclick')||'';
  const label=target.getAttribute('aria-label')||target.textContent||'';
  const external=target.tagName==='A'&&target.hasAttribute('href')&&new URL(target.href,location.href).origin!==location.origin;
  const exits=/\b(?:goLogin|logoutDemo|closeSegelDemo)\s*\(|PACloud\.logout\s*\(/.test(handler);
  const back=/^Kembali(?:\s|$)/i.test(label.trim())||target.matches('.iconBtn,.kzBack')&&/\b(?:goHub|navHome|goSetup|returnFromLearning)\s*\(|PAOnboarding\.back\s*\(/.test(handler);
  if(!external&&!exits&&!back)return;
  event.preventDefault();event.stopImmediatePropagation();
  prompt(()=>target.click());
 },true);
 window.addEventListener('popstate',event=>{
  if(restoring){restoring=false;return;}
  if(!installed||event.state?.[key]!=='base')return;
  if(active()){restoring=true;history.forward();prompt();}
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
