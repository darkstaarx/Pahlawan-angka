/* Mini-game exit guard.
   The overlay "Kembali" button closes freely only after the child finishes one
   set (the game posts PA_MINIGAME_SET_DONE). Before that, leaving needs the
   parent PIN through PAPageLock.confirmExit. */
(function(){
'use strict';
if(window.PAMiniGameExit)return;
const done=new WeakSet(),buttons=new Map();
const LABELS={title:'Keluar sebelum habis?',message:'Murid perlu habiskan satu sesi dahulu. Masukkan PIN ibu bapa untuk keluar sekarang.',stay:'Sambung main',unlock:'Sahkan PIN · Keluar'};
function paint(button,frame){button.textContent=done.has(frame)?'✕ Kembali':'🔒 Kembali';button.title=done.has(frame)?'Kembali':'Habiskan satu sesi dahulu, atau minta PIN ibu bapa'}
window.addEventListener('message',e=>{
 if(e.origin!==location.origin||e.data?.type!=='PA_MINIGAME_SET_DONE')return;
 for(const [frame,button] of buttons){if(frame.contentWindow===e.source){done.add(frame);if(button.isConnected)paint(button,frame)}}
});
function guard(button,frame,close){
 if(!button||!frame)return;
 buttons.set(frame,button);paint(button,frame);
 button.onclick=()=>{
  if(done.has(frame)||!window.PAPageLock?.confirmExit){buttons.delete(frame);close();return}
  window.PAPageLock.confirmExit(()=>{buttons.delete(frame);close()},LABELS);
 };
}
window.PAMiniGameExit={guard,isDone:frame=>done.has(frame)};
})();
