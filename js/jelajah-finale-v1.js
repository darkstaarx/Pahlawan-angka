/* Journey close: completed activities plus the end of the sample parent report. */
(()=>{'use strict';
 let dialog,player,serial=0,unwatch=()=>{};
 const offer=mode=>window.open('jelajah-offer.html?mode='+mode,'_blank','noopener');
 function init(){
  if(dialog)return;
  dialog=document.createElement('dialog');dialog.id='journeyFinale';
  dialog.setAttribute('aria-labelledby','journeyFinaleTitle');
  dialog.innerHTML=`<section class="journey-finale-card"><button class="finale-close" aria-label="Tutup dan tengok laporan semula">✕</button><div class="finale-scene" aria-hidden="true"><div class="finale-banner">JELAJAH SELESAI</div><img src="preview/assets/wira-invite-v1.png" alt=""><canvas class="finale-trophy" width="500" height="500"></canvas><span class="finale-scene-note">Giliran anak pula jadi Wira.</span></div><div class="finale-copy"><p class="finale-eyebrow">EMPAT PERSINGGAHAN. DAH CUBA SEMUA!</p><div class="finale-checks" aria-label="Semua bahagian demo selesai"><span>✓ Tempur</span><span>✓ Mini-game</span><span>✓ Cikgu Dimensi</span><span>✓ Otak Pahlawan</span></div><h2 id="journeyFinaleTitle">Macam mana, <br>ibu ayah?</h2><p class="finale-intro">Dah nampak cara Wira bantu anak?<br><strong>Jom pilih langkah seterusnya.</strong></p><div class="finale-options"><button data-finale-offer="daftar" class="finale-option finale-free"><span class="finale-option-symbol" aria-hidden="true">✦</span><span><b>Daftar Demo <small>PERCUMA</small></b><em>Buat akaun dan mula dengan anak.</em></span><span aria-hidden="true">↗</span></button><button data-finale-offer="pakej" class="finale-option finale-plans"><span class="finale-option-symbol" aria-hidden="true">◆</span><span><b>Lihat Pakej</b><em>Pilih akses yang sesuai untuk keluarga.</em></span><span aria-hidden="true">↗</span></button><button class="finale-replay">↻ &nbsp; Nak cuba demo lagi</button></div><button class="finale-report">Tengok laporan semula</button></div></section>`;
  document.body.append(dialog);
  dialog.querySelectorAll('[data-finale-offer]').forEach(b=>b.onclick=()=>offer(b.dataset.finaleOffer));
  dialog.querySelector('.finale-close').onclick=()=>dialog.close();
  dialog.querySelector('.finale-report').onclick=()=>dialog.close();
  dialog.querySelector('.finale-replay').onclick=()=>{dialog.close();window.PAJelajahFinale.onReplay?.()};
  dialog.addEventListener('close',()=>{serial++;player?.stop();player=null});
 }
 async function open(){
  init();if(dialog.open)return;dialog.showModal();
  const token=++serial;
  try{
   const [{play},{trophy}]=await Promise.all([import('./fun-isometric/fun.js'),import('./fun-isometric/trophy.js')]);
   if(!dialog.open||token!==serial)return;
   player=play(dialog.querySelector('canvas'),trophy,{loop:false,palette:{main:'#0067d9',gold:'#ffcb32',deep:'#063d80',ink:'#06164c',white:'#fffdf6'}});
  }catch(error){console.warn('Journey trophy unavailable',error);dialog.querySelector('canvas').hidden=true}
 }
 function watchReport(host,eligible,onFinish,automatic=true){
  unwatch();const end=host.querySelector('.journey-report-end');if(!end)return;
  let reached=false,scrolled=false;
  const finish=()=>{if(!eligible()||reached)return;reached=true;onFinish();open()};
  end.querySelector('button').onclick=()=>{if(!eligible())return;if(reached){open();return}finish()};
  const check=()=>{if(!automatic||!scrolled||!eligible()||document.visibilityState!=='visible')return;
   const r=end.getBoundingClientRect(),h=host.getBoundingClientRect();
   if(r.top>=h.top&&r.bottom<=Math.min(h.bottom,innerHeight))finish();
  };
  const scroll=()=>{scrolled=true;check()};
  host.addEventListener('scroll',scroll,{passive:true});
  const observer=new IntersectionObserver(check,{root:host,threshold:1});observer.observe(end);
  unwatch=()=>{host.removeEventListener('scroll',scroll);observer.disconnect()};
 }
 window.PAJelajahFinale={open,watchReport,offer,onReplay:null,leave(){unwatch();unwatch=()=>{};if(dialog?.open)dialog.close()}};
})();
