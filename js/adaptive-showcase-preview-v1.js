
/* Opt-in adaptive preview UI. Does not replace any gameplay runtime. */
(()=>{'use strict';
if(new URLSearchParams(location.search).get('pa_demo_adaptive_preview')!=='1')return;
const $=id=>document.getElementById(id);
const ICONS={
  skill:'<path d="m4 17 5-5 4 3 7-9"/><path d="M16 6h4v4"/>',
  map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>',
  teach:'<rect x="3" y="4" width="18" height="15" rx="2"/><path d="M7 9h10M7 13h6M8 22h8M12 19v3"/>',
  pets:'<circle cx="7.5" cy="8.5" r="1.4"/><circle cx="12" cy="6.8" r="1.4"/><circle cx="16.5" cy="8.5" r="1.4"/><path d="M7 17c0-2 2-5 5-5s5 3 5 5c0 2-2 3-5 3s-5-1-5-3z"/>'
};
const NAV=[['skill','Kemahiran'],['map','Peta'],['teach','Cikgu'],['pets','Koleksi']];
let root=null,sheet=null,active='map',mounted=false;
const escapeText=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function isShowcase(){return !!(window.segelEntryMode?.()?.guestDemo&&window.segelEntryMode?.()?.adaptiveShowcase&&document.body.dataset.screen==='segelDemo')}
function state(){return window.PASegelDemo?.state?.()||null}
function patterns(){
 const a=(state()?.previewResponses||[]).filter(x=>!x.correct);
 const map=new Map();
 a.forEach(x=>{let k=x.skill||'unknown';map.set(k,(map.get(k)||0)+1)});
 return [...map].sort((a,b)=>b[1]-a[1]).map(([skill,n])=>({skill,n,title:window.META?.[skill]?.title||skill}));
}
function renderSection(tab){
 const s=state(),done=!!$('segelDone')&&!$('segelDone').hidden;
 const first=Math.min(6,s?.asked||0),good=Math.min(6,s?.manualClean||0);
 const patternsList=patterns();
 if(tab==='skill'){
   const cards=patternsList.length?patternsList.slice(0,3).map(x=>'<div class="paShowcaseCard"><b>'+escapeText(x.title)+'</b><small>'+x.n+' cubaan pertama belum tepat · bukti awal</small></div>').join(''):'<div class="paShowcaseCard"><b>Belum ada kesilapan direkod</b><small>Jawab beberapa soalan dulu untuk lihat topik yang perlukan perhatian.</small></div>';
   return '<p>Ringkasan jawapan kau dalam demo. Ini belum cukup untuk tentukan tahap penguasaan sebenar.</p><div class="paShowcaseGrid"><div class="paShowcaseCard"><small>Soalan sendiri</small><div class="paShowcaseNum">'+first+' / 6</div></div><div class="paShowcaseCard"><small>Betul tanpa bantuan</small><div class="paShowcaseNum">'+good+' / 6</div></div></div>'+cards+'<button class="paShowcaseAction" data-a="battle">Sambung Pertempuran</button>';
 }
 if(tab==='teach'){
   const top=patternsList[0];
   const heading=top?escapeText(top.title):'Contoh: Sifir 8';
   return '<p>Cikgu Dimensi patut ajar semula topik yang kerap salah — bukan sekadar ulang soalan.</p><div class="paShowcaseCard"><small>'+(top?'KESILAPAN AWAL DARIPADA DEMO':'CONTOH PENGAJARAN')+'</small><b>'+heading+'</b><p>Mula dengan penerangan mudah, tunjuk secara visual, kemudian semak semula tanpa bantuan.</p><div class="paShowcaseLesson" aria-label="Contoh lapan kumpulan"><span>8</span><span>16</span><span>24</span><span>32</span><span>40</span><span>48</span><span>56</span><span>64</span></div><small>Contoh visual sifir 8. Ini bukan bukti diagnosis murid.</small></div><button class="paShowcaseAction" data-a="hint">Guna Petunjuk Game Sebenar</button><p class="paShowcaseMuted">Butang ini terus buka petunjuk pada soalan battle semasa.</p>';
 }
 return '<p>Teman yang kau akan selamatkan dalam pertarungan Gembok sebenar.</p><div class="paShowcaseCard"><small>KOLEKSI DEMO</small><b>Aurora</b><p>'+(done?'Aurora berjaya diselamatkan!':'Masih terperangkap dalam Gembok. Jawab soalan untuk memecahkan lapisan Gangsa, Perak dan Emas.')+'</p></div><button class="paShowcaseAction" data-a="'+(done?'replay':'battle')+'">'+(done?'Main Semula':'Sambung Selamatkan Aurora')+'</button>';
}
function select(tab){
 if(!root||!isShowcase())return;
 active=tab;
 root.querySelectorAll('[data-pa-tab]').forEach(x=>{
  const yes=x.dataset.paTab===tab;x.classList.toggle('active',yes);x.setAttribute('aria-selected',String(yes));
 });
 if(tab==='map'){sheet.hidden=true;return}
 const labels={skill:'Kemahiran',teach:'Cikgu Dimensi',pets:'Koleksi'};
 sheet.querySelector('.paShowcaseSheetHead strong').textContent=labels[tab];
 sheet.querySelector('.paShowcaseBody').innerHTML=renderSection(tab);
 sheet.hidden=false;
}
function proceed(what){
 sheet.hidden=true;
 if(what==='battle'){select('map');return}
 if(what==='hint'){$('segelHint')?.click();select('map');return}
 if(what==='replay'){window.restartSegelDemo?.();select('map');return}
 if(what==='register'||what==='plans'){
   window.closeSegelDemo?.();
   window.PADemoWrapup?.close?.();
   if(what==='register')window.PAEntry?.registerFree?.();
   else window.PAEntry?.plans?.();
 }
}
function mount(){
 if(mounted)return;
 const host=$('segelDemo');if(!host)return;
 host.classList.add('paShowcaseMode');mounted=true;
 root=document.createElement('div');root.className='paShowcaseUI';root.id='paShowcaseUI';
 const nav=document.createElement('nav');nav.className='paShowcaseTabs';nav.setAttribute('aria-label','Tab demo');
 nav.innerHTML=NAV.map(([k,v])=>'<button type="button" role="tab" class="paShowcaseTab'+(k==='map'?' active':'')+'" data-pa-tab="'+k+'" aria-selected="'+(k==='map')+'"><svg viewBox="0 0 24 24" aria-hidden="true">'+ICONS[k]+'</svg><span>'+v+'</span></button>').join('');
 const cta=document.createElement('aside');cta.className='paShowcaseFloat';cta.setAttribute('aria-label','Daftar dan pakej');
 cta.innerHTML='<button type="button" class="paFree" data-a="register">Daftar Percuma</button><button type="button" class="paPlans" data-a="plans">Lihat Pakej</button>';
 sheet=document.createElement('section');sheet.className='paShowcaseSheet';sheet.hidden=true;sheet.setAttribute('aria-label','Maklumat demo');
 sheet.innerHTML='<header class="paShowcaseSheetHead"><div><small>PAHLAWAN ANGKA · PREVIEW</small><strong>Kemahiran</strong></div><button type="button" data-a="battle" aria-label="Tutup panel">×</button></header><div class="paShowcaseBody"></div>';
 root.append(nav,cta,sheet);host.appendChild(root);
 root.addEventListener('click',e=>{
  const tab=e.target.closest('[data-pa-tab]');if(tab){select(tab.dataset.paTab);return}
  const act=e.target.closest('[data-a]');if(act)proceed(act.dataset.a);
 });
}
function sync(){
 const host=$('segelDemo');
 if(!host)return;
 if(isShowcase()){if(!mounted)mount()}
 else if(mounted){host.classList.remove('paShowcaseMode');root?.remove();root=null;sheet=null;mounted=false;active='map'}
}
function init(){
 sync();
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['data-screen']});
 // Keep current sheet accurate when questions progress; do not interfere with
 // the question surface or render callbacks.
 const label=$('segelQLabel');
 if(label)new MutationObserver(()=>{if(sheet&&!sheet.hidden&&active!=='map')sheet.querySelector('.paShowcaseBody').innerHTML=renderSection(active)}).observe(label,{childList:true,characterData:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
