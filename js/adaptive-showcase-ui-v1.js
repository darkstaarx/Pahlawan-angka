// Opt-in presentation shell. Original KSSR questions, Segel stage and responder stay untouched.
(()=>{'use strict';
if(new URLSearchParams(location.search).get('pa_demo_adaptive_preview')!=='1')return;
const $=id=>document.getElementById(id);
const icons={
 kemahiran:'<path d="M4 17V8m5 9V4m5 13v-6m5 6V7"/><path d="M2 21h20"/>',
 peta:'<path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15m6-12v15"/>',
 cikgu:'<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M7 9h8m-8 4h5M12 18v3m-5 0h10"/>',
 koleksi:'<rect x="4" y="7" width="16" height="14" rx="2"/><path d="M4 11h16M12 7V5a2 2 0 0 0-4 0c0 2 4 2 4 2zm0 0V5a2 2 0 0 1 4 0c0 2-4 2-4 2z"/>'
};
const names={kemahiran:'Kemahiran',peta:'Peta',cikgu:'Cikgu',koleksi:'Koleksi'};
const svg=name=>'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">'+icons[name]+'</svg>';
const entries=Object.keys(names);
let active=false,grade=2,tab='kemahiran',pane=false;
const state=()=>window.PASegelDemo?.state?.();
const game=()=>!!$('segelDemo')?.classList.contains('on');
function copy(name){
 const run=state(), count=run?.asked||0,clean=run?.manualClean||0,finished=!!($('segelDone')&&!$('segelDone').hidden&&game());
 if(name==='kemahiran')return '<span class="paApLabel">Pemerhatian pembelajaran</span><h2>Kemahiran</h2><p>'+ (game()?'Jawapan sendiri tanpa bantuan: <strong>'+clean+'/6</strong>.':'Cuba jawab enam soalan dahulu supaya pengalaman pembelajaran terasa sebenar.')+'</p><div class="paApInsight"><b>Contoh fokus: Sifir 8</b><span>Dalam demo, ini hanya contoh. Sistem sebenar perlukan jawapan yang mencukupi sebelum kenal pasti sesuatu pola.</span></div>';
 if(name==='peta')return '<span class="paApLabel">Kembara Dimensi</span><h2>Peta misi</h2><div class="paApProgress"><b>'+(game()?Math.min(12,count):0)+' / 12</b><span>soalan dalam perjalanan demo</span></div><p><strong>1–6:</strong> kau jawab sendiri menggunakan gameplay sebenar.</p><p><strong>7–12:</strong> autopilot tunjuk contoh fokus ulang kaji.</p><p>Gembok Gangsa → Perak → Emas; Aurora diselamatkan melalui animasi sebenar.</p>';
 if(name==='cikgu')return '<span class="paApLabel">Contoh pengajaran semula</span><h2>Cikgu Dimensi</h2><p>Kalau murid kerap tersilap sifir 8, Cikgu tak sekadar ulang soalan. Dia terangkan konsep dengan cara lain.</p><div class="paApLesson"><span>3 × 8</span><b>8 + 8 + 8 = 24</b><small>Tiga kumpulan lapan. Selepas dibimbing, beri soalan baharu tanpa bantuan untuk semak kefahaman.</small></div><p class="paApNote">Ini penerangan contoh, bukan keputusan diagnosis daripada sesi demo singkat.</p>';
 return '<span class="paApLabel">Ganjaran pengembaraan</span><h2>Koleksi</h2><div class="paApInsight"><b>Aurora · teman penyelamat</b><span>'+(finished?'Pentas demo telah selesai. Lihat animasi kemenangan dan ganjaran pada skrin game.':'Bantu Wira pecahkan Gembok untuk bebaskan Aurora. Ganjaran sebenar dipaparkan dalam pentas.')+'</span></div><p>Koleksi sebenar dan kemajuan anak hanya tersedia apabila penjaga mempunyai profil.</p>';
}
function renderContent(){
 const html=copy(tab);
 const summary=$('paApSummary'),sheetBody=$('paApSheetBody');
 if(summary)summary.innerHTML=html;
 if(sheetBody)sheetBody.innerHTML=html;
 document.querySelectorAll('[data-pa-ap-tab]').forEach(el=>{
  const is=el.dataset.paApTab===tab;
  el.classList.toggle('active',is);
  el.setAttribute('aria-pressed',String(is));
 });
}
function create(){
 if($('paAdaptivePreviewRoot'))return;
 const root=document.createElement('div');root.id='paAdaptivePreviewRoot';root.className='paApRoot';root.hidden=true;
 root.innerHTML='<div class="paApBackdrop" data-pa-ap-close></div><section class="paApHub" role="dialog" aria-modal="true" aria-label="Preview adaptif Pahlawan Angka"><header class="paApHeader"><div><small>PAHLAWAN ANGKA</small><h1>Demo Adaptif</h1><p>Gameplay sebenar · 6 sendiri + 6 autopilot</p></div><button class="paApX" type="button" data-pa-ap-close aria-label="Tutup preview">×</button></header><div class="paApGrades" aria-label="Pilih darjah">'+[1,2,3,4,5,6].map(n=>'<button type="button" data-pa-ap-grade="'+n+'" aria-pressed="'+(n===2)+'">D'+n+'</button>').join('')+'</div><div class="paApGrid">'+entries.map(n=>'<button type="button" class="paApTile" data-pa-ap-tab="'+n+'" aria-pressed="false">'+svg(n)+'<span>'+names[n]+'</span><small>'+({kemahiran:'Lihat kemajuan',peta:'12 soalan',cikgu:'Fokus belajar',koleksi:'Ganjaran'}[n])+'</small></button>').join('')+'</div><article id="paApSummary" class="paApSummary"></article><button type="button" class="paApPlay" id="paApPlay">Mula Gameplay Sebenar <span>›</span></button><p class="paApFoot">Mod preview. Diagnosis sebenar perlukan lebih banyak jawapan dan tidak boleh disimpulkan daripada skrip autopilot.</p></section>';
 document.body.appendChild(root);
 const dock=document.createElement('div');dock.id='paAdaptiveDock';dock.className='paApDock';dock.hidden=true;
 dock.innerHTML='<div class="paApActions"><button type="button" data-pa-ap-action="free">Daftar Percuma</button><button type="button" data-pa-ap-action="plans">Lihat Pakej</button></div><nav aria-label="Tab demo adaptif" class="paApNav">'+entries.map(n=>'<button type="button" data-pa-ap-tab="'+n+'" aria-pressed="false">'+svg(n)+'<span>'+names[n]+'</span></button>').join('')+'</nav>';
 document.body.appendChild(dock);
 const sheet=document.createElement('div');sheet.id='paAdaptiveSheet';sheet.className='paApSheet';sheet.hidden=true;
 sheet.innerHTML='<div class="paApShade" data-pa-ap-sheet-close></div><section class="paApSheetPanel" role="dialog" aria-modal="true" aria-label="Tab demo"><div class="paApSheetHead"><b>PAHLAWAN ANGKA</b><button type="button" data-pa-ap-sheet-close aria-label="Tutup tab">×</button></div><article id="paApSheetBody"></article><button class="paApBackGame" type="button" data-pa-ap-sheet-close>Sambung Game</button></section>';
 document.body.appendChild(sheet);
 document.querySelectorAll('[data-pa-ap-tab]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.paApTab)));
 document.querySelectorAll('[data-pa-ap-grade]').forEach(b=>b.addEventListener('click',()=>chooseGrade(Number(b.dataset.paApGrade))));
 document.querySelectorAll('[data-pa-ap-close]').forEach(b=>b.addEventListener('click',stop));
 document.querySelectorAll('[data-pa-ap-sheet-close]').forEach(b=>b.addEventListener('click',closeSheet));
 document.querySelectorAll('[data-pa-ap-action]').forEach(b=>b.addEventListener('click',()=>exitTo(b.dataset.paApAction)));
 $('paApPlay').addEventListener('click',play);
 document.addEventListener('focusin',e=>{if(e.target.matches('input,textarea,[contenteditable="true"]'))document.body.classList.add('paApTyping')});
 document.addEventListener('focusout',()=>document.body.classList.remove('paApTyping'));
 renderContent();
}
function chooseGrade(g){
 grade=g;window.PADemo?.selectGrade?.(g);
 document.querySelectorAll('[data-pa-ap-grade]').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.paApGrade)===g)));
}
function select(next){
 tab=next;renderContent();
 if(game()){
  pane=true;$('paAdaptiveSheet').hidden=false;
 }else{$('paAdaptivePreviewRoot').hidden=false}
}
function open(){
 create();active=true;pane=false;tab='kemahiran';
 document.body.classList.add('paApActive');
 $('paAdaptiveDock').hidden=false;$('paAdaptivePreviewRoot').hidden=false;$('paAdaptiveSheet').hidden=true;
 chooseGrade(grade);renderContent();
}
function closeSheet(){pane=false;if($('paAdaptiveSheet'))$('paAdaptiveSheet').hidden=true}
function play(){
 if(!active)return;
 $('paAdaptivePreviewRoot').hidden=true;closeSheet();
 window.PADemo?.selectGrade?.(grade);
 window.PADemo?.start?.();
}
function stop(){
 active=false;pane=false;
 document.body.classList.remove('paApActive','paApTyping');
 if($('paAdaptiveDock'))$('paAdaptiveDock').hidden=true;
 if($('paAdaptivePreviewRoot'))$('paAdaptivePreviewRoot').hidden=true;
 if($('paAdaptiveSheet'))$('paAdaptiveSheet').hidden=true;
}
function exitTo(where){
 if(game()){window.closeSegelDemo?.();window.PADemoWrapup?.close?.()}else stop();
 if(where==='free')window.PAEntry?.registerFree?.();
 else window.PAEntry?.plans?.();
}
window.PAAdaptivePreview=Object.freeze({open,stop,isPanelOpen:()=>pane,refresh:renderContent});
})();
