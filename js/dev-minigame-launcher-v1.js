/* Developer-only launcher for reviewing every standalone Focus mini game. */
(()=>{
 'use strict';
 const games=[
  {title:'Gerai Wirayung · Wang',page:'gerai-wirayung.html'},
  {title:'Tren Jam · Masa',page:'menara-jam.html'},
  {title:'Arkitek Dimensi · Ruang',page:'tapak-bina.html',qa:true},
  {title:'Kedai Kek · Pecahan',page:'kedai-kek.html'},
  {title:'Bengkel Ajaib · Ukuran',page:'bengkel-ajaib.html'},
  {title:'Gudang Harta · Operasi',page:'gudang-harta.html'},
  {title:'Dapur Ramuan · Nisbah',page:'dapur-ramuan.html'},
  {title:'Pos Peninjau · Data',page:'pos-peninjau.html'},
  {title:'Lombong Permata · Perpuluhan',page:'lombong-permata.html'}
 ];
 const enabled=()=>typeof window.isDevMode==='function'&&window.isDevMode()===true;
 function ensureLauncher(){
  const panel=document.getElementById('devPanel');
  if(!panel||panel.querySelector('[data-pa-dev-minigame-launcher]'))return;
  const section=document.createElement('section');
  section.className='devScenario';
  section.dataset.paDevMinigameLauncher='1';
  section.innerHTML='<b>Mini Game Lab · '+games.length+' game</b><p class="mut devMiniCopy">Game ikut darjah profil murid yang sedang dipilih. Tukar darjah di sini untuk semak bank D1–D6; mod boleh dipilih dalam game.</p><div class="paDevMiniGameGrid"></div>';
  const grid=section.querySelector('.paDevMiniGameGrid');
  games.forEach((game,index)=>{
   const button=document.createElement('button');
   button.type='button';button.className='btn ghost small';button.textContent=`${index+1}. ${game.title}`;
   button.addEventListener('click',()=>openGame(game));grid.appendChild(button);
  });
  panel.appendChild(section);
 }
 function openGame(game){
  if(!enabled())return;
  document.getElementById('paDevMiniGameOverlay')?.remove();
  const overlay=document.createElement('section');
  overlay.id='paDevMiniGameOverlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label',game.title+' · DEV');
  overlay.innerHTML='<header><b></b><select data-grade aria-label="Darjah"><option value="1">Darjah 1</option><option value="2">Darjah 2</option><option value="3">Darjah 3</option><option value="4">Darjah 4</option><option value="5">Darjah 5</option><option value="6">Darjah 6</option></select><div class="paDevMiniGameActions"><button type="button" data-back>Senarai Game</button><button type="button" data-close aria-label="Tutup">✕</button></div></header><iframe title=""></iframe>';
  overlay.querySelector('header b').textContent=game.title+' · DEV';
  const frame=overlay.querySelector('iframe');frame.title=game.title+' · Ujian DEV';
  const grade=overlay.querySelector('[data-grade]');
  const profileGrade=Number(window.db?.schoolGrade);
  grade.value=String(profileGrade>=1&&profileGrade<=6?profileGrade:3);
  const frameUrl=()=>game.page+(game.qa?'?qa=1':'')+'#d'+grade.value;
  grade.addEventListener('change',()=>{frame.src=frameUrl()});
  frame.src=frameUrl();
  overlay.querySelector('[data-close]').addEventListener('click',()=>overlay.remove());
  overlay.querySelector('[data-back]').addEventListener('click',()=>overlay.remove());
  let style=document.getElementById('paDevMiniGameLauncherStyle');
  if(!style){style=document.createElement('style');style.id='paDevMiniGameLauncherStyle';style.textContent=`#paDevMiniGameOverlay{position:fixed;z-index:2147483001;inset:0;display:flex;flex-direction:column;background:#07111f;color:#fff;font:700 14px/1.35 system-ui,sans-serif}#paDevMiniGameOverlay header{min-height:48px;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 12px;background:#14335c;border-bottom:2px solid #b78b47}#paDevMiniGameOverlay header b{font-size:13px;flex:1}#paDevMiniGameOverlay button,#paDevMiniGameOverlay select{border:1px solid #e7d9b7;border-radius:10px;background:#fffcf0;color:#123158;font-weight:900;padding:8px 11px}#paDevMiniGameOverlay .paDevMiniGameActions{display:flex;gap:8px}#paDevMiniGameOverlay iframe{width:100%;flex:1;min-height:0;border:0;background:#fff}#devPanel .paDevMiniGameGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:8px;margin-top:10px}#devPanel .paDevMiniGameGrid button{min-height:42px}`;document.head.appendChild(style)}
  document.body.appendChild(overlay);
 }
 const overlay=document.getElementById('devOverlay');
 if(overlay)new MutationObserver(()=>{if(!overlay.classList.contains('hidden')&&enabled())ensureLauncher()}).observe(overlay,{attributes:true,attributeFilter:['class']});
 window.PADevMiniGameLauncher={games:games.map(({title,page})=>({title,page})),open:openGame};
})();
