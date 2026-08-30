/* Pahlawan Angka v3.19.1 — Cikgu Dimensi Visual Manipulatives
 * Teaching-only layer. It changes visual explanation and interaction only;
 * it never changes question generation, scoring, mastery, evidence, damage,
 * adaptive routing, checkpoints, or Restu logic.
 */
(()=>{
  'use strict';
  const VERSION='3.19.1';
  const ENHANCED=new Set(['number','compare','place','place-basic','add','subtract','multiply','divide','fraction','decimal','percent','ratio','money','time','measure','shape','area','data','coord']);
  const originalMode=window.visualCoachMode;
  const originalRender=window.renderVisualCoachArena;
  const originalInteract=window.visualCoachInteract;
  const originalContent=window.visualCoachContent;

  const dots=(n,cls='')=>Array.from({length:n},()=>`<i${cls?` class="${cls}"`:''}></i>`).join('');
  const cells=(n,on=0,cls='')=>Array.from({length:n},(_,i)=>`<i class="${i<on?'on ':''}${cls}"></i>`).join('');
  const metaTitle=m=>String(m?.title||m?.domain||'').toLowerCase();
  const motionOK=()=>!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const later=(fn,ms)=>setTimeout(fn,motionOK()?ms:0);

  function measureKind(m){
    const t=metaTitle(m),id=String(m?.id||'');
    if(/6\.2$/.test(id)||/jisim|berat/.test(t))return'scale';
    if(/6\.3$/.test(id)||/isipadu|isi padu|silinder|cecair/.test(t))return'jug';
    if(/6\.1$/.test(id)||/panjang|pembaris/.test(t))return'ruler';
    return'convert';
  }
  function modeFor(key,m){
    let old=null;
    try{old=typeof originalMode==='function'?originalMode(key,m):null}catch(_){old=null}
    if(old)return old;
    const title=metaTitle(m);
    if(key==='decimal')return'decimal';
    if(key==='percent')return'percent';
    if(key==='ratio')return'ratio';
    if(key==='coord')return'coord';
    if(key==='operation'){
      if(/tambah/.test(title))return'add';
      if(/tolak/.test(title))return'subtract';
      if(/darab/.test(title))return'multiply';
      if(/bahagi/.test(title))return'divide';
    }
    return old;
  }

  function rulerScene(stage){
    if(stage===0)return `<div class="pam-measure"><div class="pam-object"></div><div class="pam-ruler">${Array.from({length:6},(_,i)=>`<span><i></i><b>${i}</b></span>`).join('')}</div><small>Objek bermula tepat pada 0 cm</small></div>`;
    if(stage===1)return `<button class="vcTap pam-action" onclick="visualCoachInteract('measure')"><div class="pam-measure active"><div class="pam-object"></div><div class="pam-ruler">${Array.from({length:6},(_,i)=>`<span class="${i===5?'hot':''}"><i></i><b>${i}</b></span>`).join('')}</div></div><b>Baca tanda di hujung objek</b></button>`;
    return `<div class="pam-result"><strong>5 cm</strong><small>0 → hujung pada 5 cm</small></div>`;
  }
  function scaleScene(stage){
    if(stage===0)return `<div class="pam-scale"><div class="pam-dial"><i></i><b>500</b></div><small>g</small></div>`;
    if(stage===1)return `<button class="vcTap pam-action" onclick="visualCoachInteract('measure')"><div class="pam-scale active"><div class="pam-dial"><i></i><b>500</b></div><small>g</small></div><b>Baca nombor bersama unit</b></button>`;
    return `<div class="pam-result"><strong>500 g</strong><small>Nilai + unit jisim</small></div>`;
  }
  function jugScene(stage){
    if(stage===0)return `<div class="pam-jug"><div class="pam-water"></div>${[100,200,300,400,500].map(v=>`<span style="--p:${v/5}%">${v}</span>`).join('')}<b>mL</b></div>`;
    if(stage===1)return `<button class="vcTap pam-action" onclick="visualCoachInteract('measure')"><div class="pam-jug active"><div class="pam-water"></div>${[100,200,300,400,500].map(v=>`<span style="--p:${v/5}%" class="${v===500?'hot':''}">${v}</span>`).join('')}<b>mL</b></div><strong>Baca paras air</strong></button>`;
    return `<div class="pam-result"><strong>500 mL</strong><small>Paras air berada pada tanda 500</small></div>`;
  }
  function convertScene(stage){
    if(stage===0)return `<div class="pam-convert"><span>1 m</span><b>=</b><span>100 cm</span></div>`;
    if(stage===1)return `<button class="vcTap pam-action" onclick="visualCoachInteract('measure')"><div class="pam-convert active"><span>2 m</span><b>× 100</b><span>?</span></div><strong>Tukar kepada cm</strong></button>`;
    return `<div class="pam-result"><strong>200 cm</strong><small>2 × 100 cm</small></div>`;
  }

  function scene(mode,stage,m){
    if(mode==='measure'){
      const kind=measureKind(m);
      return kind==='scale'?scaleScene(stage):kind==='jug'?jugScene(stage):kind==='ruler'?rulerScene(stage):convertScene(stage);
    }
    const map={
      number:[
        `<div class="pam-place"><div class="pam-place-number">342</div><div class="pam-place-labels"><span>3 ratus</span><span>4 puluh</span><span>2 sa</span></div></div>`,
        `<button class="vcTap pam-action" onclick="visualCoachInteract('number')"><div class="pam-base-ten"><span class="hundreds">${dots(3)}</span><span class="tens">${dots(4)}</span><span class="ones">${dots(2)}</span></div><b>Bina 342 dengan blok nilai tempat</b></button>`,
        `<div class="pam-result"><strong>300 + 40 + 2</strong><small>= 342</small></div>`
      ],
      compare:[
        `<div class="pam-compare"><strong>342</strong><b>?</b><strong>324</strong></div>`,
        `<button class="vcTap pam-action" onclick="visualCoachInteract('compare')"><div class="pam-place-columns"><span><small>Ratus</small><b>3 = 3</b></span><span class="hot"><small>Puluh</small><b>4 &gt; 2</b></span></div><b>Banding dari nilai tempat terbesar</b></button>`,
        `<div class="pam-result"><strong>342 &gt; 324</strong><small>Ratus sama, jadi banding puluh</small></div>`
      ],
      place:[
        `<div class="pam-place"><div class="pam-place-number">3<span>4</span>2</div><small>Apakah nilai digit 4?</small></div>`,
        `<button class="vcTap pam-action" onclick="visualCoachInteract('place')"><div class="pam-place-columns"><span><small>Ratus</small><b>3</b></span><span class="hot"><small>Puluh</small><b>4</b></span><span><small>Sa</small><b>2</b></span></div><b>Sentuh tempat digit 4</b></button>`,
        `<div class="pam-result"><strong>4 puluh = 40</strong><small>Digit sama, nilai ikut tempat</small></div>`
      ],
      'place-basic':[
        `<div class="pam-place"><div class="pam-place-number">18</div><small>1 puluh dan 8 sa</small></div>`,
        `<button class="vcTap pam-action" onclick="visualCoachInteract('place-basic')"><div class="pam-basic-ten"><span>${dots(10)}</span><b>+</b><span>${dots(8)}</span></div><strong>Kumpulkan 10 sa menjadi 1 puluh</strong></button>`,
        `<div class="pam-result"><strong>10 + 8 = 18</strong><small>1 puluh = 10 sa</small></div>`
      ],
      add:[
        `<div class="pam-equation"><span>${dots(8)}</span><b>+</b><span>${dots(5)}</span><small>8 + 5</small></div>`,
        `<button class="vcTap pam-action" onclick="visualCoachInteract('add')"><div class="pam-bundle"><span class="ten">${dots(10)}</span><span class="loose">${dots(3)}</span></div><b>Kumpul 10 sa dahulu</b></button>`,
        `<div class="pam-result"><strong>1 puluh + 3 sa = 13</strong><small>8 + 5 = 13</small></div>`
      ],
      subtract:[
        `<div class="pam-equation"><span class="pam-twelve">${dots(12)}</span><small>12 − 7</small></div>`,
        `<button class="vcTap pam-action" onclick="visualCoachInteract('subtract')"><div class="pam-remove">${Array.from({length:12},(_,i)=>`<i class="${i>=5?'take':''}"></i>`).join('')}</div><b>Ambil 7 daripada 12</b></button>`,
        `<div class="pam-result"><strong>5 tinggal</strong><small>12 − 7 = 5</small></div>`
      ],
      multiply:[
        `<div class="pam-groups"><span>${dots(4)}</span><span>${dots(4)}</span><span>${dots(4)}</span></div><div class="pam-caption">3 kumpulan, 4 setiap kumpulan</div>`,
        `<button class="vcTap pam-action" onclick="visualCoachInteract('multiply')"><div class="pam-groups active"><span>${dots(4)}</span><span>${dots(4)}</span><span>${dots(4)}</span></div><b>Kira semua kumpulan sama banyak</b></button>`,
        `<div class="pam-result"><strong>4 + 4 + 4 = 12</strong><small>3 × 4 = 12</small></div>`
      ],
      divide:[
        `<div class="pam-share"><div class="pam-pool">${dots(12)}</div><div class="pam-baskets"><span></span><span></span><span></span></div><small>12 objek → 3 kumpulan</small></div>`,
        `<button class="vcTap pam-action" onclick="visualCoachInteract('divide')"><div class="pam-baskets active"><span>${dots(4)}</span><span>${dots(4)}</span><span>${dots(4)}</span></div><b>Agih sama rata</b></button>`,
        `<div class="pam-result"><strong>4 setiap kumpulan</strong><small>12 ÷ 3 = 4</small></div>`
      ],
      fraction:[
        `<div class="pam-fraction"><div class="pam-fracbar two">${cells(2,1)}</div><strong>1/2</strong></div>`,
        `<button class="vcTap pam-action" onclick="visualCoachInteract('fraction')"><div class="pam-frac-eq"><div class="pam-fracbar two">${cells(2,1)}</div><b>=</b><div class="pam-fracbar four">${cells(4,2)}</div></div><b>Potong setiap bahagian sekali lagi</b></button>`,
        `<div class="pam-result"><strong>1/2 = 2/4</strong><small>Bilangan bahagian berubah, saiz berwarna kekal</small></div>`
      ],
      decimal:[
        `<div class="pam-tenths">${cells(10,4)}</div><div class="pam-caption">4 daripada 10 bahagian</div>`,
        `<button class="vcTap pam-action" onclick="visualCoachInteract('decimal')"><div class="pam-frac-eq"><strong>4/10</strong><b>→</b><strong>0.?</strong></div><b>Tulis sebagai persepuluh</b></button>`,
        `<div class="pam-result"><strong>4/10 = 0.4</strong><small>4 berada di tempat persepuluh</small></div>`
      ],
      percent:[
        `<div class="pam-percent-grid">${cells(100,40)}</div><div class="pam-caption">40 daripada 100</div>`,
        `<button class="vcTap pam-action" onclick="visualCoachInteract('percent')"><div class="pam-percent-grid active">${cells(100,40)}</div><b>Kira bahagian daripada 100</b></button>`,
        `<div class="pam-result"><strong>40/100 = 40%</strong><small>Peratus bermaksud “daripada 100”</small></div>`
      ],
      ratio:[
        `<div class="pam-ratio"><span class="a">${dots(4)}</span><b>:</b><span class="b">${dots(6)}</span></div><div class="pam-caption">4 : 6</div>`,
        `<button class="vcTap pam-action" onclick="visualCoachInteract('ratio')"><div class="pam-ratio split"><span class="a">${dots(2)}</span><b>:</b><span class="b">${dots(3)}</span></div><b>Bahagi kedua-dua bahagian dengan 2</b></button>`,
        `<div class="pam-result"><strong>4 : 6 = 2 : 3</strong><small>Kedua-dua kuantiti berubah dengan faktor sama</small></div>`
      ],
      money:[
        `<div class="pam-money"><span class="note">RM10</span><b>Harga RM7</b></div>`,
        `<button class="vcTap pam-action" onclick="visualCoachInteract('money')"><div class="pam-money active"><span class="note">RM10</span><b>−</b><span class="price">RM7</span></div><strong>Cari baki</strong></button>`,
        `<div class="pam-result"><strong>RM3 baki</strong><small>RM10 − RM7 = RM3</small></div>`
      ],
      time:[
        `<div class="pam-clock"><i class="hour"></i><i class="minute"></i><b>2:30</b></div>`,
        `<button class="vcTap pam-action" onclick="visualCoachInteract('time')"><div class="pam-time-line"><span>2:30</span><i>+30m</i><span>3:00</span><i>+15m</i><span>?</span></div><b>Gerak 45 minit ke hadapan</b></button>`,
        `<div class="pam-result"><strong>3:15</strong><small>2:30 + 45 minit</small></div>`
      ],
      shape:[
        `<div class="pam-shape"><span>◇</span><i>1</i><i>2</i><i>3</i><i>4</i></div><div class="pam-caption">Putar bentuk — cirinya kekal</div>`,
        `<button class="vcTap pam-action" onclick="visualCoachInteract('shape')"><div class="pam-shape active"><span>◇</span><i>1</i><i>2</i><i>3</i><i>4</i></div><b>Kira sisi, bukan arah gambar</b></button>`,
        `<div class="pam-result"><strong>4 sisi</strong><small>Putaran tidak menukar ciri bentuk</small></div>`
      ],
      area:[
        `<div class="pam-area">${cells(12,0)}</div><div class="pam-caption">3 baris × 4 lajur</div>`,
        `<button class="vcTap pam-action" onclick="visualCoachInteract('area')"><div class="pam-area active">${cells(12,12)}</div><b>Isi seluruh permukaan dengan unit persegi</b></button>`,
        `<div class="pam-result"><strong>3 × 4 = 12 unit²</strong><small>Tiada ruang kosong atau bertindih</small></div>`
      ],
      data:[
        `<div class="pam-data-objects"><span>${dots(3)}</span><span>${dots(5)}</span><span>${dots(2)}</span></div><div class="pam-caption">A=3 · B=5 · C=2</div>`,
        `<button class="vcTap pam-action" onclick="visualCoachInteract('data')"><div class="pam-chart"><i style="--h:3"><b>3</b></i><i class="hot" style="--h:5"><b>5</b></i><i style="--h:2"><b>2</b></i></div><b>Susun nilai menjadi carta</b></button>`,
        `<div class="pam-result"><strong>B paling tinggi = 5</strong><small>Baca nilai, kemudian banding</small></div>`
      ],
      coord:[
        `<div class="pam-coord"><div class="pam-grid">${cells(25,0)}</div><span class="origin">O</span><span class="target">●</span></div><div class="pam-caption">Cari titik (3, 2)</div>`,
        `<button class="vcTap pam-action" onclick="visualCoachInteract('coord')"><div class="pam-axis-steps"><span>→ 3 pada x</span><b>kemudian</b><span>↑ 2 pada y</span></div><b>x dahulu, y kemudian</b></button>`,
        `<div class="pam-result"><strong>(3, 2)</strong><small>Gerak mengufuk dahulu, kemudian menegak</small></div>`
      ]
    };
    return map[mode]?.[stage]||'';
  }

  function contentSpec(mode,m){
    const measure=measureKind(m);
    const map={
      number:{a:'Pecahkan nombor ikut nilai tempat',b:'Bina nombor dengan blok',c:'342 dibina sebagai…',choices:[['300 + 40 + 2',true],['30 + 4 + 2',false]]},
      compare:{a:'Banding nombor dari kiri',b:'Cari nilai tempat pertama yang berbeza',c:'342 dan 324: simbol yang betul?',choices:[['342 > 324',true],['342 < 324',false]]},
      place:{a:'Nilai digit bergantung pada tempat',b:'Cari digit di lajur puluh',c:'Digit 4 dalam 342 bernilai…',choices:[['40',true],['4',false]]},
      'place-basic':{a:'Satu puluh ialah sepuluh sa',b:'Kumpulkan 10 sa',c:'1 puluh bernilai…',choices:[['10',true],['1',false]]},
      add:{a:'Tambah dengan membina satu puluh',b:'Kumpulkan 10 sa dahulu',c:'8 + 5 =',choices:[['13',true],['3',false]]},
      subtract:{a:'Tolak bermaksud ambil daripada jumlah',b:'Ambil 7 daripada 12',c:'12 − 7 =',choices:[['5',true],['7',false]]},
      multiply:{a:'Darab ialah kumpulan sama banyak',b:'Kira semua kumpulan',c:'3 kumpulan × 4 =',choices:[['12',true],['7',false]]},
      divide:{a:'Bahagi ialah agihan sama rata',b:'Agih 12 objek kepada 3 kumpulan',c:'Setiap kumpulan mendapat…',choices:[['4',true],['3',false]]},
      fraction:{a:'Pecahan mesti guna bahagian sama besar',b:'Potong setiap bahagian dengan cara sama',c:'Pecahan setara dengan 1/2 ialah…',choices:[['2/4',true],['2/2',false]]},
      decimal:{a:'Perpuluhan menunjukkan nilai tempat selepas titik',b:'Tukar persepuluh kepada perpuluhan',c:'4/10 =',choices:[['0.4',true],['0.04',false]]},
      percent:{a:'Peratus bermaksud daripada 100',b:'Lihat berapa petak daripada 100',c:'40 daripada 100 =',choices:[['40%',true],['4%',false]]},
      ratio:{a:'Nisbah membandingkan dua kuantiti',b:'Ubah kedua-duanya dengan faktor sama',c:'4 : 6 dalam bentuk mudah =',choices:[['2 : 3',true],['2 : 6',false]]},
      money:{a:'Wang: bezakan harga, bayaran dan baki',b:'Tolak harga daripada wang dibayar',c:'RM10 bayar, harga RM7. Baki?',choices:[['RM3',true],['RM17',false]]},
      time:{a:'Tempoh masa ialah pergerakan dari waktu mula',b:'Pecahkan 45 minit kepada lompatan mudah',c:'2:30 + 45 minit =',choices:[['3:15',true],['2:75',false]]},
      shape:{a:'Kenal bentuk melalui ciri',b:'Putar dan semak ciri yang kekal',c:'Bentuk itu mempunyai…',choices:[['4 sisi',true],['3 sisi',false]]},
      area:{a:'Luas menutup seluruh permukaan',b:'Isi dengan unit persegi tanpa jurang',c:'3 × 4 unit persegi =',choices:[['12 unit²',true],['7 unit²',false]]},
      data:{a:'Data perlu dibaca sebelum dibanding',b:'Tukar nilai kepada palang',c:'Nilai tertinggi ialah…',choices:[['5',true],['3',false]]},
      coord:{a:'Koordinat dibaca sebagai (x, y)',b:'Gerak pada x dahulu, kemudian y',c:'3 ke kanan dan 2 ke atas =',choices:[['(3, 2)',true],['(2, 3)',false]]}
    };
    if(mode==='measure'){
      if(measure==='scale')return {a:'Jisim dibaca bersama unit',b:'Baca penimbang tepat pada penunjuk',c:'Penimbang menunjukkan 500 g. Jisim?',choices:[['500 g',true],['500 kg',false]]};
      if(measure==='jug')return {a:'Isi padu dibaca pada paras cecair',b:'Cari tanda skala yang sama dengan paras air',c:'Paras pada 500 mL. Isi padu?',choices:[['500 mL',true],['500 g',false]]};
      if(measure==='ruler')return {a:'Panjang dibaca dari mula ke hujung objek',b:'Pastikan objek bermula pada 0',c:'Hujung objek pada 5 cm. Panjang?',choices:[['5 cm',true],['0 cm',false]]};
      return {a:'Samakan unit sebelum mengira',b:'Gunakan hubungan 1 m = 100 cm',c:'2 m =',choices:[['200 cm',true],['20 cm',false]]};
    }
    return map[mode]||null;
  }

  function setupArena(stage,mode,m){
    const arena=document.getElementById('visualCoachArena'),board=document.getElementById('visualCoachBoard'),hero=document.getElementById('visualCoachHero'),pet=document.getElementById('visualCoachPet'),cue=document.getElementById('visualCoachCue');
    if(!arena||!board)return null;
    arena.classList.remove('hidden','vcSuccess','pam-success');arena.classList.toggle('vcCheckpoint',stage>2);board.classList.remove('vcDone','pam-complete');
    arena.dataset.mode=mode;arena.dataset.complete='0';arena.dataset.manipulative=VERSION;
    try{
      const theme=typeof terrainThemeFor==='function'?terrainThemeFor(m):'number';
      const source=typeof TERRAIN_BY_THEME!=='undefined'?(TERRAIN_BY_THEME[theme]||TERRAIN_BY_THEME.number):null;
      if(source){arena.dataset.terrain=theme;arena.style.setProperty('--coach-terrain',`url("${new URL(`${source}?v=3.16.3`,document.baseURI).href}")`)}
    }catch(_){/* visual fallback keeps existing background */}
    try{
      const heroes=typeof HEROES!=='undefined'?HEROES:null,heroData=heroes?.[db?.hero]||heroes?.wira;
      if(hero&&heroData)hero.src=stage===1?(heroData.anticipation||heroData.idle):heroData.idle;
      const petId=db?.rewards?.equippedPet,petData=typeof REWARD_PETS!=='undefined'?REWARD_PETS[petId]:null;
      if(pet&&petData){pet.src=petData.front;pet.classList.remove('hidden')}else pet?.classList.add('hidden');
    }catch(_){/* no cosmetic state */}
    if(cue)cue.textContent=stage===0?'Lihat hubungan':stage===1?'Sentuh untuk cuba':'Apa yang berubah?';
    return {arena,board,cue,hero};
  }

  function renderEnhanced(stage,key,m){
    const mode=modeFor(key,m);if(!ENHANCED.has(mode))return false;
    if(stage>2)return false;
    const ctx=setupArena(stage,mode,m);if(!ctx)return false;
    ctx.board.innerHTML=scene(mode,stage,m);return true;
  }

  function interactEnhanced(mode){
    if(!ENHANCED.has(mode))return false;
    const arena=document.getElementById('visualCoachArena'),board=document.getElementById('visualCoachBoard'),cue=document.getElementById('visualCoachCue');
    if(!arena||!board||arena.dataset.mode!==mode||arena.dataset.complete==='1')return true;
    arena.dataset.complete='1';arena.classList.add('pam-success');board.classList.add('pam-complete');
    const m=(typeof learningState!=='undefined'&&learningState&&typeof META!=='undefined')?META[learningState.skillId]:null;
    board.innerHTML=scene(mode,2,m);
    if(cue)cue.textContent=mode==='divide'?'Sama banyak setiap kumpulan':mode==='measure'?'Baca nilai bersama unit':'Nampak hubungannya?';
    try{window.PASensory?.setIntensity?.('calm',700)}catch(_){}
    try{if(typeof playSfx==='function')playSfx('ui')}catch(_){}
    later(()=>{try{if(typeof learningAdvance==='function')learningAdvance()}catch(_){}},780);
    return true;
  }

  function contentEnhanced(stage,key,m){
    const mode=modeFor(key,m),spec=contentSpec(mode,m);if(!ENHANCED.has(mode)||!spec||stage>2)return null;
    if(stage===0)return `<div class="visualCoachOnly pam-copy"><div class="stageTag">LIHAT</div><h2>${spec.a}</h2><p>Cikgu Dimensi tunjuk satu hubungan dahulu. Tak perlu hafal langkah panjang.</p><button class="btn primary learningNext" onclick="learningAdvance()">Lihat caranya →</button></div>`;
    if(stage===1)return `<div class="visualCoachOnly pam-copy"><div class="stageTag">CUBA DENGAN MODEL</div><h2>${spec.b}</h2><p>Sentuh model di atas. Kita ubah <b>satu perkara sahaja</b>.</p></div>`;
    return `<div class="visualCoachOnly pam-copy"><div class="stageTag">SEMAK FAHAM</div><h2>${spec.c}</h2><div class="learningChoices">${spec.choices.map(([label,ok])=>`<button onclick="learningGuidedChoice(this,${ok})">${label}</button>`).join('')}</div><div id="guidedFeedback" class="learningFeedback"></div></div>`;
  }

  function install(){
    if(typeof originalMode==='function')window.visualCoachMode=function(key,m){return modeFor(key,m)};
    if(typeof originalRender==='function')window.renderVisualCoachArena=function(stage,key,m){
      document.getElementById('visualCoachArena')?.classList.remove('pam-time-lab');
      if(m?.id==='D2.5.3'&&stage<=2){renderTimeLab(stage,m);return}
      const mode=modeFor(key,m);
      if(stage<=2&&ENHANCED.has(mode)){renderEnhanced(stage,key,m);return}
      return originalRender.call(this,stage,key,m);
    };
    if(typeof originalInteract==='function')window.visualCoachInteract=function(mode){
      if(ENHANCED.has(mode)){interactEnhanced(mode);return}
      return originalInteract.call(this,mode);
    };
    if(typeof originalContent==='function')window.visualCoachContent=function(stage,key,m){
      if(m?.id==='D2.5.3'&&stage<=2)return timeLabContent(stage);
      const enhanced=contentEnhanced(stage,key,m);if(enhanced!==null)return enhanced;
      return originalContent.call(this,stage,key,m);
    };
    const versionButton=document.querySelector('.loginVersion');if(versionButton)versionButton.textContent=`Pahlawan Angka · v${VERSION}`;
    document.documentElement.dataset.paManipulatives=VERSION;
  }

  // First interactive lesson: deliberately scoped to elapsed-time problems.
  // No global timers, scoring, question generators or intervention rules change.
  function timeExample(prompt){
    const plain=String(prompt||'').replace(/<svg[\s\S]*?<\/svg>/gi,'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
    const hit=plain.match(/bermula(?: pada)?\s*(\d{1,2}):(\d{2})\s*dan berlangsung\s*(\d+) minit/i);
    if(hit){
      const [,h,m,d]=hit.map(Number);
      if(h>=0&&h<24&&m>=0&&m<60&&m%5===0&&d>=5&&d<=120&&d%5===0)return{start:h*60+m,target:d,fromQuestion:true};
    }
    return{start:435,target:30,fromQuestion:false};
  }
  const timeLabel=minutes=>`${Math.floor(((minutes%1440)+1440)%1440/60)}:${String(((minutes%60)+60)%60).padStart(2,'0')}`;
  function moveTime(model,delta){
    if(delta!==5&&delta!==-5)return false;
    const next=model.elapsed+delta;
    if(next<0||next>model.target+15)return false;
    model.elapsed=next;return true;
  }
  function timeModel(){
    if(!learningState.timeLab)learningState.timeLab={...timeExample(learningState.originalPrompt),elapsed:0,stage:-1,shown:false};
    return learningState.timeLab;
  }
  function renderTimeLab(stage,m){
    const ctx=setupArena(stage,'time',m);if(!ctx)return;
    const model=timeModel();
    if(model.stage!==stage){model.stage=stage;if(stage<2){model.elapsed=0;model.shown=false}}
    ctx.arena.classList.add('pam-time-lab');
    if(stage===2){ctx.board.innerHTML='<div class="pam-time-question">Jam sudah disimpan.<br>Cuba ingat perjalanan tadi.</div>';ctx.cue.textContent='Sekarang kamu jawab';return}
    ctx.board.innerHTML=`<div class="pam-time-clock" role="img" aria-label="Jam interaktif">
      <svg viewBox="0 0 240 240" aria-hidden="true"><circle cx="120" cy="120" r="99" fill="#112b48" stroke="#d9efff" stroke-width="4"/>
      ${Array.from({length:12},(_,i)=>{const a=(i+1)*Math.PI/6;return `<text x="${120+79*Math.sin(a)}" y="${125-79*Math.cos(a)}" text-anchor="middle" fill="#fff" font-size="15">${i+1}</text>`}).join('')}
      ${Array.from({length:60},(_,i)=>`<line x1="120" y1="24" x2="120" y2="${i%5?28:33}" stroke="#89bad9" transform="rotate(${i*6} 120 120)"/>`).join('')}
      <line class="pam-hour-hand" x1="120" y1="120" x2="120" y2="69" stroke="#ffe176" stroke-width="7" stroke-linecap="round"/>
      <line class="pam-minute-hand" x1="120" y1="120" x2="120" y2="47" stroke="#69ddff" stroke-width="5" stroke-linecap="round"/>
      <circle cx="120" cy="120" r="6" fill="#fff"/></svg>
      <div class="pam-time-orbit"><span class="pam-time-rider"><img src="assets/coach/time-lab/sidma-push-v1.png" alt="Sidma menolak jarum minit" draggable="false"/><i></i></span></div>
      </div><div class="pam-time-readout" aria-live="polite"></div>`;
    updateTimeLab();
  }
  function updateTimeLab(){
    const arena=document.getElementById('visualCoachArena');if(!arena?.classList.contains('pam-time-lab')||learningState?.stage>1)return;
    const model=timeModel(),now=model.start+model.elapsed,angle=(model.start%60+model.elapsed)*6;
    arena.querySelector('.pam-minute-hand')?.setAttribute('transform',`rotate(${angle} 120 120)`);
    arena.querySelector('.pam-hour-hand')?.setAttribute('transform',`rotate(${(model.start%720+model.elapsed)/2} 120 120)`);
    const orbit=arena.querySelector('.pam-time-orbit');if(orbit)orbit.style.transform=`rotate(${angle}deg)`;
    const rider=arena.querySelector('.pam-time-rider');if(rider)rider.style.transform=`rotate(${-angle}deg)`;
    const readout=arena.querySelector('.pam-time-readout');if(readout)readout.textContent=`${timeLabel(model.start)} → ${timeLabel(now)} · +${model.elapsed} minit`;
    arena.querySelector('.pam-time-clock')?.setAttribute('aria-label',`Jam ${timeLabel(now)}, sudah bergerak ${model.elapsed} minit`);
    const status=document.getElementById('timeLabStatus');if(status)status.textContent=model.elapsed>model.target?`Terlebih ${model.elapsed-model.target} minit. Boleh undur.`:`Sudah ${model.elapsed} minit. Baki ${model.target-model.elapsed} minit.`;
    const back=document.getElementById('timeLabBack'),forward=document.getElementById('timeLabForward');
    if(back)back.disabled=model.elapsed===0;if(forward)forward.disabled=model.elapsed===model.target+15;
    const cue=document.getElementById('visualCoachCue');if(cue)cue.textContent=model.elapsed?'Satu langkah = 5 minit':'Bantu Sidma gerakkan jarum';
  }
  function timeLabContent(stage){
    const model=timeModel();
    if(stage===2){
      const answer=model.start+model.target;
      // Rotated positions avoid teaching pupils to select the first option.
      const values=[answer-5,answer+5,answer];
      const offset=Math.floor(model.start/5)%3;values.push(...values.splice(0,offset));
      return `<div class="visualCoachOnly pam-copy"><div class="stageTag">SEMAK FAHAM</div><h2>Mula ${timeLabel(model.start)}, tambah ${model.target} minit. Waktu tamat?</h2><div class="learningChoices">${values.map(n=>`<button onclick="learningGuidedChoice(this,${n===answer})">${timeLabel(n)}</button>`).join('')}</div><div id="guidedFeedback" class="learningFeedback"></div></div>`;
    }
    return `<div class="visualCoachOnly pam-copy"><div class="stageTag">${model.fromQuestion?'SOALAN TADI':'CONTOH LATIHAN'}</div><h2>Mula ${timeLabel(model.start)}. Tambah ${model.target} minit.</h2><p>${stage===0?'Cikgu tunjuk satu langkah bersama Sidma. Perhatikan kedua-dua jarum bergerak.':'Tekan +5 minit untuk bantu Sidma. Kamu tentukan bila hendak berhenti.'}</p>
      <p id="timeLabStatus" role="status">Sudah 0 minit. Baki ${model.target} minit.</p>
      ${stage===0?'<button class="btn primary learningNext" onclick="PACikguTimeLab.demonstrate(this)">Cikgu, tunjuk satu langkah</button>':`<div class="pam-time-controls"><button id="timeLabBack" disabled onclick="PACikguTimeLab.move(-5)">Undur 5 minit</button><button id="timeLabForward" onclick="PACikguTimeLab.move(5)">Tolak +5 minit</button></div><button class="btn primary learningNext" onclick="PACikguTimeLab.check()">Semak gerakan saya</button><p id="timeLabFeedback" role="status"></p>`}</div>`;
  }
  window.PACikguTimeLab={timeExample,timeLabel,moveTime,
    demonstrate(button){
      if(learningState?.stage!==0)return;const model=timeModel();
      if(model.shown){learningAdvance();return}
      model.shown=true;moveTime(model,5);updateTimeLab();button.textContent='Sekarang saya kawal dari mula →';
    },
    move(delta){if(learningState?.skillId!=='D2.5.3'||learningState.stage!==1)return;if(moveTime(timeModel(),delta)){const feedback=document.getElementById('timeLabFeedback');if(feedback)feedback.textContent='';updateTimeLab()}},
    check(){
      if(learningState?.skillId!=='D2.5.3'||learningState.stage!==1)return;
      const model=timeModel();if(model.elapsed===model.target){learningAdvance();return}
      const feedback=document.getElementById('timeLabFeedback');if(feedback)feedback.textContent=model.elapsed<model.target?'Belum cukup. Cuba tambah lagi dan perhatikan baki minit.':'Terlebih sedikit. Undur dan semak semula.';
    }
  };

  window.PACikguManipulatives={version:VERSION,enhancedModes:[...ENHANCED],modeFor,measureKind,scene,contentSpec};
  install();
})();
