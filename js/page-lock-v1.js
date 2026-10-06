// Accidental-exit protection for the web/PWA. Device Home gestures remain OS-owned.
(()=>{
 'use strict';
 if(window.PAPageLock)return;
 const key='paPageLock';
 let enabled=true, installed=false, restoring=false, previousFocus=null;
 const active=()=>enabled&&document.body.dataset.screen!=='login';
 const dialog=document.createElement('dialog');
 dialog.className='paExitDialog';
 dialog.setAttribute('aria-labelledby','paExitTitle');
 dialog.innerHTML='<h2 id="paExitTitle">Halaman dikunci</h2><p>Elakkan tersalah keluar semasa bermain. Sambung bermain atau buka kunci untuk keluar.</p><p class="paExitNote">Untuk kunci butang Home telefon, guna Screen Pinning (Android) atau Guided Access (iPhone).</p><div class="paExitActions"><button type="button" class="btn primary" data-stay autofocus>Sambung bermain</button><button type="button" class="btn secondary" data-unlock>Buka kunci</button></div>';
 document.body.append(dialog);
 function render(){
  document.querySelectorAll('[data-page-lock]').forEach(button=>{
   button.hidden=document.body.dataset.screen==='login';
   button.textContent=enabled?'🔒 Kunci keluar':'🔓 Kunci keluar';
   button.setAttribute('aria-pressed',String(enabled));
   button.setAttribute('aria-label',enabled?'Kunci keluar aktif. Buka pilihan kunci.':'Aktifkan kunci keluar');
  });
 }
 function arm(){
  if(installed||!active())return;
  try{
   // One same-URL guard entry; never add entries on repeated Back presses.
   history.replaceState({...history.state,[key]:'base'},'',location.href);
   history.pushState({...history.state,[key]:'guard'},'',location.href);
   installed=true;
  }catch(error){console.warn('Kunci Back tidak tersedia.',error);}
 }
 function close(){dialog.close();previousFocus?.focus();}
 function prompt(){
  if(dialog.open)return;
  previousFocus=document.activeElement;
  dialog.showModal();
 }
 function unlock(){enabled=false;close();render();}
 dialog.querySelector('[data-stay]').addEventListener('click',close);
 dialog.querySelector('[data-unlock]').addEventListener('click',unlock);
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 function toggle(){
  if(enabled)prompt();
  else{enabled=true;sync();}
 }
 // Put controls in existing navigation rows so they do not cover game answers.
 for(const host of document.querySelectorAll('.appHeader,.mv2HeadRight,.segelTop')){
  const button=document.createElement('button');
  button.type='button';button.className='paPageLockButton';
  button.setAttribute('data-page-lock','');button.addEventListener('click',toggle);
  host.append(button);
 }
 window.addEventListener('popstate',event=>{
  if(restoring){restoring=false;return;}
  if(!installed||event.state?.[key]!=='base')return;
  if(active()){
   restoring=true;history.forward();prompt();
  }else{
   installed=false;history.back();
  }
 });
 function beforeUnload(event){if(active()){event.preventDefault();event.returnValue='';}}
 let unloadArmed=false;
 function sync(){
  if(active()&&!unloadArmed){window.addEventListener('beforeunload',beforeUnload);unloadArmed=true;}
  if(!active()&&unloadArmed){window.removeEventListener('beforeunload',beforeUnload);unloadArmed=false;}
  render();arm();
  if(document.body.dataset.screen==='login'&&dialog.open)close();
 }
 dialog.querySelector('[data-unlock]').addEventListener('click',sync);
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['data-screen']});
 window.PAPageLock={isLocked:active};
 sync();
})();
