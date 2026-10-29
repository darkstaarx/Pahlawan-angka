/* Parent-selected practice. Search reads the active profile; it never invents a weakness. */
(()=>{'use strict';
 const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
 const profile=()=>typeof db==='undefined'?null:db;
 const metadata=()=>typeof META==='undefined'?{}:META;
 const modeNames={bina:'Nilai tempat',banding:'Banding nombor',pola:'Pola nombor',tambah:'Tambah',tolak:'Tolak',darab:'Darab',bahagi:'Bahagi',gabung:'Operasi bergabung',juta:'Nombor hingga juta',perdana:'Nombor perdana',masalah:'Penyelesaian masalah'};
 const aliases={tambah:'addition campur',tolak:'subtraction pinjam',darab:'sifir multiplication kali',bahagi:'division agih',bina:'nilai digit place value',banding:'susun tertib compare',pola:'urutan corak pattern'};
 let dialog,fab,openedProfile,player;
 function catalog(p=profile()){
  const grade=Number(p?.schoolGrade);if(!Number.isInteger(grade)||grade<1||grade>6)return[];
  const rows=[],seen=new Set(),meta=metadata(),bridge=window.PAFocusMiniGamesLive;
  for(const [id,m] of Object.entries(meta)){
   if(Number(m.grade)!==grade)continue;
   const game=bridge?.gameFor(id);if(!game)continue;
   const router=game.router(),plan=router?.planFor({...p,learnerReviewV1:{encounters:[]}},id);if(!plan?.start?.length)continue;
   if(game.id==='gudang-harta'){
    for(const route of plan.start){const key=game.id+':'+route.mode;const existing=rows.find(r=>r.key===key),span=route.end-(route.min??0);if(existing&&span>existing.span){existing.skillId=id;existing.span=span}
     const title=modeNames[route.mode]||m.title||m.name||id;
     if(!existing)rows.push({key,skillId:id,title,game:game.title,mode:route.mode,span,keywords:aliases[route.mode]||'',kind:'mini'});
     const list=router.ARCH?.[grade]?.[route.mode]||[];
     const rounds=list.map((a,i)=>/round/.test(a)?i:-1).filter(i=>i>=0&&(i>=(route.min??0))&&i<=route.end);
     if(rounds.length&&!seen.has('bundar')){seen.add('bundar');rows.push({key:'bundar',skillId:id,title:'Bundar',game:game.title,mode:route.mode,topic:'bundar',keywords:'pembundaran rounding bulat puluh ratus ribu',kind:'mini'})}
    }
   }else{
    const key=game.id+':'+id;if(seen.has(key))continue;seen.add(key);
    rows.push({key,skillId:id,title:m.title||m.name||m.label||m.domain||id,game:game.title,keywords:({'kedai-kek':'pecahan fraction','lombong-permata':'perpuluhan peratus decimal percent','bengkel-ajaib':'ukuran panjang jisim isipadu','dapur-ramuan':'nisbah kadaran','pos-peninjau':'data graf kebolehjadian'})[game.id]||'',kind:'mini'});
   }
  }return rows.sort((a,b)=>a.title.localeCompare(b.title,'ms'));
 }
 function results(query,p=profile()){const tokens=norm(query).split(' ').filter(Boolean);return catalog(p).filter(r=>tokens.every(t=>norm(r.title+' '+r.keywords+' '+r.game).includes(t)))}
 function currentAccount(p){const cloud=window.PACloud?.state;return !!p&&!p.demoMode&&!!cloud?.user&&!!p.cloudChildId&&!!cloud.profiles?.some(x=>x.id===p.cloudChildId)}
 function start(key){
  const p=profile();if(p!==openedProfile||!currentAccount(p)){close();return false}
  const row=catalog(p).find(r=>r.key===key);if(!row)return false;
  close();return !!window.PAFocusMiniGamesLive?.tryStartPractice?.(row.skillId,{mode:row.mode,topic:row.topic});
 }
 function render(){
  if(!dialog?.open)return;
  if(profile()!==openedProfile||!currentAccount(profile())){close();return}
  const rows=results(dialog.querySelector('input').value),list=dialog.querySelector('.topic-results');list.replaceChildren();
  dialog.querySelector('.topic-count').textContent=rows.length?rows.length+' pilihan untuk Darjah '+profile().schoolGrade:'Belum ada mini-game untuk carian ini. Cuba nama topik lain.';
  for(const row of rows){const b=document.createElement('button');b.className='topic-result';b.dataset.topic=row.key;const title=document.createElement('b'),sub=document.createElement('small'),arrow=document.createElement('span');title.textContent=row.title;sub.textContent=row.game+' · Darjah '+profile().schoolGrade;arrow.textContent='Main →';b.append(title,sub,arrow);b.onclick=()=>start(row.key);list.append(b)}
 }
 function close(){if(dialog?.open)dialog.close()}
 function open(){const p=profile();if(!currentAccount(p))return;openedProfile=p;dialog.querySelector('input').value='';dialog.querySelector('.topic-child').textContent=(p.name||p.childName||'Profil anak')+' · Darjah '+p.schoolGrade;dialog.showModal();fab.setAttribute('aria-expanded','true');render();dialog.querySelector('input').focus()}
 function sync(){const visible=['hub','menuV2'].includes(document.body.dataset.screen)&&currentAccount(profile())&&!document.body.classList.contains('pa-focus-minigame-active');fab.hidden=!visible;if(!visible)close();if(dialog.open&&profile()!==openedProfile)close()}
 async function init(){
  fab=document.createElement('button');fab.id='paTopicSearchFab';fab.type='button';fab.hidden=true;fab.setAttribute('aria-label','Cari topik latihan');fab.setAttribute('aria-haspopup','dialog');fab.setAttribute('aria-expanded','false');fab.innerHTML='<canvas width="500" height="500" aria-hidden="true"></canvas>';fab.onclick=open;document.body.append(fab);
  dialog=document.createElement('dialog');dialog.id='paTopicSearch';dialog.setAttribute('aria-labelledby','topicSearchTitle');dialog.innerHTML='<header><div><small class="topic-child"></small><h2 id="topicSearchTitle">Nak berlatih topik apa?</h2></div><button class="topic-close" aria-label="Tutup carian">✕</button></header><label for="topicSearchInput">Cari topik</label><input id="topicSearchInput" type="search" placeholder="Contoh: bundar, pecahan, tambah" autocomplete="off"><p class="topic-note">Latihan pilihan ibu ayah. Cari ikut apa yang anak nak cuba hari ini.</p><p class="topic-count" role="status"></p><div class="topic-results"></div>';document.body.append(dialog);dialog.querySelector('.topic-close').onclick=close;dialog.querySelector('input').oninput=render;dialog.addEventListener('close',()=>{fab.setAttribute('aria-expanded','false');if(!fab.hidden)fab.focus()});
  new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['data-screen','class']});sync();
  try{const [{play},{search}]=await Promise.all([import('./fun-isometric/fun.js'),import('./fun-isometric/search.js?v=1.1.0')]);player=play(fab.querySelector('canvas'),search,{loop:true,palette:{main:'#0067d9',hot:'#ffcb32',deep:'#063d80',ink:'#06164c'}});fab.addEventListener('pointerenter',()=>player.replay());fab.addEventListener('focus',()=>player.replay())}catch(_){fab.querySelector('canvas').replaceWith(document.createTextNode('⌕'))}
 }
 window.PATopicSearch={catalog,results,start,open,close};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
