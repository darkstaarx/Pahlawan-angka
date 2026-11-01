/* Demo Jelajah v1: lightweight mobile SVG tabs and always-available guardian CTAs.
 * The battle, question validation, scripted autopilot and mini games remain owned by
 * PAJelajah and the original game engine. This module does not record child data. */
(()=>{'use strict';
 const $=id=>document.getElementById(id),tour=document.querySelector('.tour'),cards=$('cards'),footer=tour?.querySelector('footer');
 if(!tour||!cards||!footer)return;
 const svg={
  kemahiran:'<path d="M4 18V9m5 9V4m5 14v-7m5 7V7"/><path d="M2 21h20"/>',
  peta:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>',
  cikgu:'<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M7 9h10M7 13h6M12 18v3M7 21h10"/>',
  koleksi:'<rect x="4" y="7" width="16" height="14" rx="2"/><path d="M4 11h16M12 7V5a2 2 0 1 0-4 0c0 2 4 2 4 2zm0 0V5a2 2 0 0 1 4 0c0 2-4 2-4 2z"/>'
 };
 const tabs=['kemahiran','peta','cikgu','koleksi'];
 const names={kemahiran:'Kemahiran',peta:'Peta',cikgu:'Cikgu',koleksi:'Koleksi'};
 const icon=key=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+svg[key]+'</svg>';
 const dock=document.createElement('div');dock.id='paJelajahDock';dock.hidden=true;
 dock.innerHTML='<div class="paJelajahActions"><a href="jelajah-offer.html?mode=daftar" target="_blank" rel="noopener noreferrer">Daftar Percuma</a><a href="jelajah-offer.html?mode=pakej" target="_blank" rel="noopener noreferrer">Lihat Pakej</a></div><nav class="paJelajahTabs" aria-label="Navigasi demo">'+tabs.map(key=>'<button type="button" data-pa-jelajah-tab="'+key+'" aria-label="'+names[key]+'" aria-expanded="false">'+icon(key)+'<span>'+names[key]+'</span></button>').join('')+'</nav>';
 footer.appendChild(dock);
 const shade=document.createElement('div');shade.id='paJelajahSheet';shade.hidden=true;
 shade.innerHTML='<div class="paJelajahSheetBackdrop" data-pa-sheet-close></div><section class="paJelajahSheetPanel" role="dialog" aria-modal="true" aria-label="Maklumat demo"><header><b>PAHLAWAN ANGKA</b><button type="button" class="paJelajahClose" data-pa-sheet-close aria-label="Tutup panel">×</button></header><div id="paJelajahSheetBody"></div><button type="button" class="paJelajahReturn" data-pa-sheet-close>Sambung Demo</button></section>';
 document.body.appendChild(shade);
 let selected='',returnFocus=null;
 function step(index){return cards.querySelector('[data-card="'+index+'"]')}
 function ready(index){const b=step(index);return !!b&&!b.disabled}
 function done(index){return !!step(index)?.classList.contains('done')}
 function jump(index){
  if(!ready(index))return;
  const already=step(index).getAttribute('aria-current')==='page';
  // Clicking the current battle card restarts that battle; closing this sheet
  // must never silently restart an in-progress pupil's manual questions.
  const continueBattle=index===0&&already&&!done(0);
  close();
  if(!continueBattle)step(index)?.click();
 }
 function action(index,label){
  return '<button type="button" class="paJelajahJump" data-pa-jump="'+index+'" '+(!ready(index)?'disabled':'')+'>'+label+'</button>';
 }
 function heading(label,body){return '<span class="paJelajahEyebrow">DEMO JELAJAH</span><h2>'+label+'</h2>'+body}
 function view(key){
  const grade=Number((($('tourLabel')?.textContent||'').match(/Darjah\s*([1-6])/)||[])[1]||0);
  const scenario=grade?window.PAJelajahScenarios?.get?.(grade):null;
  const skill=scenario?.topic||'Matematik';
  if(key==='kemahiran')return heading('Kemahiran','<p>Darjah '+(grade||'—')+' · Topik contoh: <strong>'+skill+'</strong>.</p><p>Enam soalan awal dijawab sendiri. Enam lagi menunjukkan simulasi autopilot, bukan diagnosis anak.</p>'+action(0,done(0)?'Main Semula Pertempuran':'Sambung Pertempuran'));
  if(key==='peta'){
   const titles=['Pertempuran','Mini-game','Cikgu Dimensi','Otak Pahlawan'];
   return heading('Peta Jelajah','<p>Pilih hentian yang dah dibuka. Mini-game dan Cikgu tersedia selepas pertempuran.</p><div class="paJelajahStops">'+titles.map((t,i)=>'<div class="paJelajahStop"><span>'+(i+1)+'</span><div><strong>'+t+'</strong><small>'+(done(i)?'Selesai':ready(i)?'Boleh diteroka':'Selesaikan pertempuran dahulu')+'</small></div>'+action(i,'Buka')+'</div>').join('')+'</div>');
  }
  if(key==='cikgu')return heading('Cikgu Dimensi','<p>Contoh Cikgu menunjukkan cara lain untuk memahami topik yang tersilap. Pembelajaran sebenar perlukan bukti daripada lebih banyak soalan.</p>'+action(2,ready(2)?'Jumpa Cikgu Dimensi':'Belum dibuka'));
  return heading('Koleksi','<p><strong>Aurora</strong> ialah teman yang Wira selamatkan apabila segel terakhir pecah.</p><p>Ganjaran dan laporan dalam Jelajah ini hanyalah contoh. Ia tidak disimpan sebagai koleksi profil anak.</p>'+action(3,ready(3)?'Lihat Laporan Contoh':'Belum dibuka'));
 }
 function render(){
  if(!selected||shade.hidden)return;
  $('paJelajahSheetBody').innerHTML=view(selected);
  dock.querySelectorAll('[data-pa-jelajah-tab]').forEach(b=>b.setAttribute('aria-expanded',String(b.dataset.paJelajahTab===selected)));
 }
 function open(key,trigger){
  if(cards.hidden)return;
  selected=key;returnFocus=trigger;shade.hidden=false;render();
  shade.querySelector('.paJelajahClose')?.focus({preventScroll:true});
 }
 function close(){
  if(shade.hidden)return;
  shade.hidden=true;selected='';
  dock.querySelectorAll('[data-pa-jelajah-tab]').forEach(b=>b.setAttribute('aria-expanded','false'));
  if(returnFocus?.isConnected&&!returnFocus.hidden)returnFocus.focus({preventScroll:true});
  returnFocus=null;
 }
 dock.addEventListener('click',e=>{const b=e.target.closest('[data-pa-jelajah-tab]');if(b)open(b.dataset.paJelajahTab,b)});
 shade.addEventListener('click',e=>{
  if(e.target.closest('[data-pa-sheet-close]')){close();return}
  const jumpBtn=e.target.closest('[data-pa-jump]');if(jumpBtn&&!jumpBtn.disabled)jump(Number(jumpBtn.dataset.paJump));
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!shade.hidden){e.preventDefault();close()}});
 function sync(){
  const running=!cards.hidden;
  tour.classList.toggle('paJelajahRunning',running);
  dock.hidden=!running;
  if(!running)close();else render();
 }
 const observer=new MutationObserver(sync);
 observer.observe(cards,{attributes:true,attributeFilter:['hidden'],childList:true});
 sync();
})();
