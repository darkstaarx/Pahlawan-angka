/* Cikgu Dimensi — Learning Lab v0.2.1.
 * Reviewed learning styles behind manual/DEV launch only.
 * Automatic diagnostic routing remains disabled here.
 */
(function(root){
  'use strict';
  const REVISIT_MS=24*60*60*1000;
  let lab=null;

  function getDb(){try{if(typeof db!=='undefined')return db}catch(_){ }return root.db||null}
  function getSess(){try{if(typeof sess!=='undefined')return sess}catch(_){ }return root.sess||null}
  function saveDb(){try{if(typeof save==='function')save()}catch(_){ }}
  function telemetry(type,payload={}){if(root.PATelemetry?.record)root.PATelemetry.record(type,{dimensionalLab:true,lessonId:lab?.lesson?.id||'',skillId:lab?.lesson?.skillId||'',misconceptionId:lab?.lesson?.misconceptionId||'',representation:lab?.lesson?.representation||'',...payload})}
  function esc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
  function dots(n,cls=''){return Array.from({length:n},()=>`<i${cls?` class="${cls}"`:''}></i>`).join('')}

  function ensureOverlay(){
    if(typeof document==='undefined')return null;
    let o=document.getElementById('dvLabOverlay');if(o)return o;
    o=document.createElement('div');o.id='dvLabOverlay';o.className='dvLabOverlay';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');
    o.innerHTML='<div class="dvBackdrop"></div><section class="dvPanel dvLabPanel"><header class="dvHead"><div class="dvTeacher is-active"><span class="dvDimensionalCharacter is-active" data-dimensi-state="active"><span class="dvDimensionalPortrait"><img class="dvDimensionalBase" src="assets/coach/cikgu-wajar/welcome.webp" alt=""><img class="dvDimensionalAura" src="assets/coach/cikgu-dimensi/dimensional-aura.svg" alt=""><i class="dvEyeGlow dvEyeGlowL"></i><i class="dvEyeGlow dvEyeGlowR"></i></span></span></div><div><small>CIKGU DIMENSI</small><h2 id="dvLabTitle">Dimensi Matematik</h2></div><span id="dvLabStage" class="dvStage"></span></header><div id="dvLabBody" class="dvBody"></div><div class="dvParentGuide"><b>Untuk ibu bapa / penjaga</b><span>Jika anak masih keliru, baca arahan bersama-sama satu demi satu. Minta anak terangkan apa yang dia nampak. Elakkan beri jawapan terus.</span></div></section>';
    document.body.appendChild(o);return o;
  }
  function setBody(html){const el=document.getElementById('dvLabBody');if(el){el.innerHTML=html;el.querySelector('button,input')?.focus({preventScroll:true})}}
  function setStage(t){const el=document.getElementById('dvLabStage');if(el)el.textContent=t||''}
  function setTeacherActive(active){const t=document.querySelector('#dvLabOverlay .dvTeacher');if(!t)return;t.classList.toggle('is-active',!!active);t.classList.toggle('is-normal',!active);root.PADimensionalPortal?.setCharacterActive?.(t.querySelector('.dvDimensionalCharacter'),!!active)}
  function showOverlay(){const o=ensureOverlay();o?.classList.add('show');setTeacherActive(true);document.body?.classList.add('dvTeaching')}
  function hideOverlay(){document.getElementById('dvLabOverlay')?.classList.remove('show');setTeacherActive(false);document.body?.classList.remove('dvTeaching')}
  function feedback(msg,ok=false){const el=document.getElementById('dvLabFeedback');if(el){el.innerHTML=msg;el.classList.toggle('success',!!ok)}}

  function freezeBattle(){
    const s=getSess();if(!s)return;
    if(s.dimension?.active)throw new Error('Dimensional intervention already active');
    lab.originalBattle={hp:s.hp,ehp:s.ehp,start:s.start};
    s.dimension={active:true,prototypeId:'DIMENSIONAL-LAB',state:'LAB',skillId:lab.lesson.skillId,misconceptionId:lab.lesson.misconceptionId};
    document.querySelectorAll?.('#game .ans,#game .hintBtn').forEach(el=>{el.dataset.dvLabDisabled=el.disabled?'1':'0';el.disabled=true});
    document.getElementById('battleArena')?.classList.add('dvBattleFrozen');
  }
  function unfreezeBattle(){
    const s=getSess();if(s?.dimension?.prototypeId==='DIMENSIONAL-LAB')s.dimension.active=false;
    document.querySelectorAll?.('#game .ans,#game .hintBtn').forEach(el=>{el.disabled=el.dataset.dvLabDisabled==='1';delete el.dataset.dvLabDisabled});
    document.getElementById('battleArena')?.classList.remove('dvBattleFrozen');
  }
  function recordStart(){
    const m=root.PADimensionalMemory;
    m?.ensure?.();m?.ensureSkill?.(lab.lesson.skillId);m?.ensureMisconception?.(lab.lesson.misconceptionId,lab.lesson.id);
    m?.markInterventionStarted?.(lab.lesson.skillId,lab.lesson.misconceptionId);
    m?.recordRepresentationUse?.(lab.lesson.skillId,lab.lesson.representation,'opened');
    telemetry('dv_lab_started',{kssr:lab.lesson.kssr});saveDb();
  }
  function recordClean(status){
    const m=root.PADimensionalMemory;
    m?.recordTransfer?.(lab.lesson.skillId,'KSSR_CLEAN',status,`lab-${lab.lesson.id}-${Date.now()}`,lab.lesson.misconceptionId);
    m?.recordRepresentationUse?.(lab.lesson.skillId,lab.lesson.representation,status==='PASS'?'kssr_clean_success':'kssr_clean_fail');
    if(status==='PASS')m?.scheduleRevisit?.({skillId:lab.lesson.skillId,misconceptionId:lab.lesson.misconceptionId,prototypeId:lab.lesson.id,dueAfter:Date.now()+REVISIT_MS,reason:lab.lesson.revisitReason});
    m?.markInterventionCompleted?.(lab.lesson.skillId,{guided:false,kssrClean:status,misconceptionId:lab.lesson.misconceptionId});
    telemetry('dv_lab_clean_transfer',{status});saveDb();
  }

  function start(key,{skipPortal=false}={}){
    const lesson=root.PADimensionalCatalog?.get?.(key);if(!lesson)return false;
    const s=getSess();if(!s)return false;
    if(s.dimension?.active)return false;
    lab={active:true,key,lesson,step:0,data:{},originalBattle:null};
    freezeBattle();recordStart();
    const begin=()=>{showOverlay();document.getElementById('dvLabTitle').textContent=lesson.title;render()};
    if(skipPortal||!root.PADimensionalPortal?.open)begin();else root.PADimensionalPortal.open({onDone:begin,duration:850});
    return true;
  }

  function advance(){lab.step++;render()}
  function failThen(msg){feedback(msg,false);telemetry('dv_lab_attempt',{step:lab.step,status:'FAIL'})}
  function passThen(msg,nextDelay=300){feedback(msg,true);telemetry('dv_lab_attempt',{step:lab.step,status:'PASS'});setTimeout(advance,nextDelay)}

  function render(){
    if(!lab?.active)return;
    const fn=RENDERERS[lab.key];if(!fn)throw new Error('Missing Dimensional Lab renderer: '+lab.key);
    setStage(`Langkah ${lab.step+1}`);fn();
  }

  function fractionRenderer(){
    if(lab.step===0){
      const f={n:1,d:2};lab.data.fraction=f;
      setBody(`<div class="dvIntro"><b>Pecahan boleh nampak berbeza tetapi nilainya sama.</b><span>Gunakan keseluruhan yang sama dan lihat kawasan berwarna.</span></div><div class="dvFracWhole two"><i class="on"></i><i></i></div><div class="dvEquation"><b>1/2</b></div><button class="dvPrimary" onclick="PADimensionalLab.act('subdivide')">Bahagi setiap separuh lagi</button><div id="dvLabFeedback" class="dvFeedback"></div>`);return;
    }
    if(lab.step===1){
      const out=root.PAFractionAreaEngine.subdivide({n:1,d:2},2);lab.data.fraction2=out.after;
      setBody(`<div class="dvFracCompare"><div><div class="dvFracWhole two"><i class="on"></i><i></i></div><b>1/2</b></div><span>= ?</span><div><div class="dvFracWhole four"><i class="on"></i><i class="on"></i><i></i><i></i></div><b>2/4</b></div></div><p class="dvPrompt">Kawasan berwarna masih sama banyak?</p><div class="dvChoices"><button onclick="PADimensionalLab.act('fractionSame',true)">Sama banyak</button><button onclick="PADimensionalLab.act('fractionSame',false)">Berbeza</button></div><div id="dvLabFeedback" class="dvFeedback"></div>`);return;
    }
    if(lab.step===2){
      const same=root.PANumberLineEngine.samePosition([{n:1,d:2},{n:2,d:4},{n:4,d:8}]);
      setBody(`<div class="dvCallout success"><b>Potongan bertambah. Nilainya masih sama.</b><span>1/2 = 2/4 = 4/8</span></div><div class="dvFractionStrip"><span style="--w:50%">1/2</span><span style="--w:50%">2/4</span><span style="--w:50%">4/8</span></div><div class="dvNumberLine"><i style="left:50%"></i><b style="left:50%">1/2 · 2/4 · 4/8</b><span>0</span><span>1</span></div><small>${same?'Nama berbeza. Tempat yang sama.':''}</small><button class="dvPrimary" onclick="PADimensionalLab.act('next')">Cuba tanpa gambar bantuan</button>`);return;
    }
    renderClean();
  }

  function divisionRenderer(){
    if(lab.step===0){
      const m=root.PAGroupingArrayEngine.sharing(12,3);lab.data.share=m;
      setBody(`<div class="dvProblem"><small>KONGSI SAMA RATA</small><strong>12 ÷ 3</strong></div><p>12 objek hendak dikongsi sama rata kepada 3 orang.</p><div class="dvCounterPool">${dots(12)}</div><button class="dvPrimary" onclick="PADimensionalLab.act('share')">Agih sama rata</button>`);return;
    }
    if(lab.step===1){
      const m=lab.data.share;
      setBody(`<div class="dvGroups"><span>${dots(m.quotient)}</span><span>${dots(m.quotient)}</span><span>${dots(m.quotient)}</span></div><div class="dvCallout success"><b>4 setiap orang</b><span>12 ÷ 3 = 4</span></div><p>Sekarang 3 bermaksud <b>3 objek setiap kumpulan</b>.</p><button class="dvPrimary" onclick="PADimensionalLab.act('group')">Bina kumpulan 3</button>`);return;
    }
    if(lab.step===2){
      const m=root.PAGroupingArrayEngine.grouping(12,3);lab.data.group=m;
      setBody(`<div class="dvGroups four"><span>${dots(3)}</span><span>${dots(3)}</span><span>${dots(3)}</span><span>${dots(3)}</span></div><div class="dvContrast"><div><small>12 kongsi kepada 3</small><b>4 setiap orang</b></div><div><small>12, 3 setiap kumpulan</small><b>4 kumpulan</b></div></div><div class="dvCallout"><b>Ayat matematik sama.</b><span>Yang dicari berbeza.</span></div><button class="dvPrimary" onclick="PADimensionalLab.act('next')">Cuba soalan sekolah</button>`);return;
    }
    renderClean();
  }

  function barRenderer(){
    if(lab.step===0){
      setBody(`<div class="dvStory">Badrul ada <b>47</b> guli. Dia ada <b>12 lebih</b> daripada Amir. Berapa guli Amir?</div><div class="dvCallout"><b>Jangan pilih operasi daripada perkataan “lebih”.</b><span>Cari hubungan dahulu.</span></div><button class="dvPrimary" onclick="PADimensionalLab.act('buildBar')">Bina hubungan</button>`);return;
    }
    if(lab.step===1){
      const m=root.PABarRelationalEngine.comparison({larger:47,more:12});lab.data.bar=m;
      setBody(`<div class="dvBars"><label>Badrul <span class="bar full">47</span></label><label>Amir <span class="bar main">?</span><span class="bar extra">12</span></label></div><p class="dvPrompt">Untuk cari bahagian Amir, operasi mana sesuai?</p><div class="dvChoices"><button onclick="PADimensionalLab.act('barOp','ADD')">47 + 12</button><button onclick="PADimensionalLab.act('barOp','SUBTRACT')">47 − 12</button></div><div id="dvLabFeedback" class="dvFeedback"></div>`);return;
    }
    if(lab.step===2){
      setBody(`<div class="dvBridge"><div><b>Hubungan</b><span>? + 12 = 47</span></div><i>→</i><div><b>Ayat matematik</b><span>47 − 12 = 35</span></div></div><div class="dvCallout success"><b>Cari hubungan, bukan satu kata kunci.</b><span>Perkataan “lebih” tidak semestinya bermaksud tambah.</span></div><button class="dvPrimary" onclick="PADimensionalLab.act('next')">Cuba tanpa bar</button>`);return;
    }
    renderClean();
  }

  function multiplyRenderer(){
    if(lab.step===0){
      setBody(`<div class="dvProblem"><small>DARAB</small><strong>7 × 8</strong></div><div class="dvArray" style="--cols:8">${dots(56)}</div><p>Kalau 8 terasa susah, pecahkan kepada fakta darab yang kamu sudah kenal.</p><button class="dvPrimary" onclick="PADimensionalLab.act('splitArray')">Pecahkan 8 menjadi 5 + 3</button>`);return;
    }
    if(lab.step===1){
      const m=root.PAGroupingArrayEngine.splitArray(7,8,5);lab.data.array=m;
      setBody(`<div class="dvSplitArray"><div><b>7 × 5</b><div class="dvArray" style="--cols:5">${dots(35)}</div></div><span>+</span><div><b>7 × 3</b><div class="dvArray" style="--cols:3">${dots(21)}</div></div></div><p class="dvPrompt">35 + 21 = ?</p><div class="dvChoices"><button onclick="PADimensionalLab.act('mulResult',56)">56</button><button onclick="PADimensionalLab.act('mulResult',46)">46</button><button onclick="PADimensionalLab.act('mulResult',63)">63</button></div><div id="dvLabFeedback" class="dvFeedback"></div>`);return;
    }
    if(lab.step===2){
      setBody(`<div class="dvEquation stack"><b>7 × 8</b><span>= 7 × (5 + 3)</span><span>= (7 × 5) + (7 × 3)</span><strong>= 56</strong></div><div class="dvCallout success"><b>Pecahkan nombor yang susah.</b><span>Gunakan fakta yang kamu sudah kenal.</span></div><button class="dvPrimary" onclick="PADimensionalLab.act('next')">Cuba darab baharu</button>`);return;
    }
    renderClean();
  }

  function makeTenRenderer(){
    if(lab.step===0){
      const m=root.PANumberBondEngine.makeTen(8,7);lab.data.make=m;
      setBody(`<div class="dvProblem"><small>TAMBAH</small><strong>8 + 7</strong></div><div class="dvTenFrame">${Array.from({length:10},(_,i)=>`<i class="${i<8?'on':''}"></i>`).join('')}</div><div class="dvCounterPool small">${dots(7)}</div><p class="dvPrompt">Berapa daripada 7 perlu dipindahkan supaya 8 menjadi 10?</p><div class="dvChoices"><button onclick="PADimensionalLab.act('makeTen',2)">2</button><button onclick="PADimensionalLab.act('makeTen',3)">3</button><button onclick="PADimensionalLab.act('makeTen',5)">5</button></div><div id="dvLabFeedback" class="dvFeedback"></div>`);return;
    }
    if(lab.step===1){
      setBody(`<div class="dvEquation stack"><span>7 = 2 + 5</span><b>8 + 2 + 5</b><strong>10 + 5 = 15</strong></div><div class="dvCallout success"><b>Penuhkan 10 dahulu.</b><span>10 ialah nombor rujukan yang mudah digunakan.</span></div><button class="dvPrimary" onclick="PADimensionalLab.act('next')">Cuba tanpa kotak 10</button>`);return;
    }
    renderClean();
  }

  function compensationRenderer(){
    if(lab.step===0){
      const m=root.PANumberBondEngine.compensationAdd(39,26,10);lab.data.comp=m;
      setBody(`<div class="dvProblem"><small>TAMBAH CARA MUDAH</small><strong>39 + 26</strong></div><div class="dvNumberShift"><b>39</b><span>+1</span><strong>40</strong></div><p class="dvPrompt">Kalau 39 kita jadikan 40, apa perlu dibuat pada jawapan akhir?</p><div class="dvChoices vertical"><button onclick="PADimensionalLab.act('comp','minus1')">Tolak semula 1</button><button onclick="PADimensionalLab.act('comp','plus1')">Tambah lagi 1</button></div><div id="dvLabFeedback" class="dvFeedback"></div>`);return;
    }
    if(lab.step===1){
      setBody(`<div class="dvEquation stack"><span>40 + 26 = 66</span><span>39 ialah 1 kurang daripada 40</span><strong>66 − 1 = 65</strong></div><div class="dvCallout success"><b>Ubah nombor supaya mudah dikira, kemudian betulkan semula bezanya.</b><span>Nilai tempat masih penting.</span></div><button class="dvPrimary" onclick="PADimensionalLab.act('next')">Cuba contoh baharu</button>`);return;
    }
    renderClean();
  }

  function differenceRenderer(){
    if(lab.step===0){
      const m=root.PANumberLineEngine.countUp(498,503);lab.data.diff=m;
      setBody(`<div class="dvProblem"><small>TOLAK: CARI BEZA</small><strong>503 − 498</strong></div><p>Tak perlu kira panjang dahulu. Cari jarak daripada 498 ke 503.</p><div class="dvNumberLine jumps"><i style="left:18%"></i><i style="left:50%"></i><i style="left:82%"></i><b style="left:18%">498</b><b style="left:50%">500</b><b style="left:82%">503</b></div><button class="dvPrimary" onclick="PADimensionalLab.act('countUp')">Kira lompatan</button>`);return;
    }
    if(lab.step===1){
      setBody(`<div class="dvEquation stack"><span>498 → 500 = +2</span><span>500 → 503 = +3</span><strong>2 + 3 = 5</strong></div><div class="dvBridge"><div><b>Tolak</b><span>503 − 498 = 5</span></div><i>↔</i><div><b>Semak dengan tambah</b><span>498 + 5 = 503</span></div></div><button class="dvPrimary" onclick="PADimensionalLab.act('next')">Cuba sendiri</button>`);return;
    }
    renderClean();
  }

  function scaleRenderer(){
    if(lab.step===0){
      const m=root.PAPlaceValueEngine.scaleByTen(23,'UP');lab.data.scale=m;
      setBody(`<div class="dvProblem"><small>NILAI TEMPAT</small><strong>23 × 10</strong></div><div class="dvPlaceGrid"><span><small>RATUS</small><b></b></span><span><small>PULUH</small><b>2</b></span><span><small>SA</small><b>3</b></span></div><p class="dvPrompt">Bila setiap nilai menjadi 10 kali lebih besar, digit bergerak ke tempat mana?</p><button class="dvPrimary" onclick="PADimensionalLab.act('scaleUp')">Gerakkan nilai ×10</button>`);return;
    }
    if(lab.step===1){
      setBody(`<div class="dvPlaceGrid shifted"><span><small>RATUS</small><b>2</b></span><span><small>PULUH</small><b>3</b></span><span><small>SA</small><b>0</b></span></div><div class="dvCallout success"><b>23 × 10 = 230</b><span>2 puluh menjadi 2 ratus. 3 sa menjadi 3 puluh. 0 menunjukkan tiada sa.</span></div><button class="dvSecondary" onclick="PADimensionalLab.act('scaleDown')">Sekarang 230 ÷ 10</button>`);return;
    }
    if(lab.step===2){
      const m=root.PAPlaceValueEngine.scaleByTen(230,'DOWN');lab.data.scaleDown=m;
      setBody(`<div class="dvPlaceGrid"><span><small>RATUS</small><b></b></span><span><small>PULUH</small><b>2</b></span><span><small>SA</small><b>3</b></span></div><div class="dvCallout"><b>230 ÷ 10 = 23</b><span>Setiap nilai menjadi 10 kali lebih kecil.</span></div><button class="dvPrimary" onclick="PADimensionalLab.act('next')">Cuba tanpa grid</button>`);return;
    }
    renderClean();
  }

  function renderClean(){
    setStage('Cuba sendiri');
    setBody(`<div class="dvClean"><small>Gaya sekolah · tanpa gambar bantuan</small><h3>${esc(lab.lesson.cleanPrompt)}</h3><input id="dvLabCleanAnswer" inputmode="text" autocomplete="off" aria-label="Jawapan"><button class="dvPrimary" onclick="PADimensionalLab.submitClean()">Semak</button><div id="dvLabFeedback" class="dvFeedback"></div></div>`);
  }

  const RENDERERS={
    'fraction-equivalence':fractionRenderer,'division-meaning':divisionRenderer,'word-problem-bar':barRenderer,'multiply-decompose':multiplyRenderer,
    'make-ten':makeTenRenderer,'compensation':compensationRenderer,'difference-count-up':differenceRenderer,'scale-ten':scaleRenderer
  };

  function act(name,value){
    if(!lab?.active)return;
    switch(name){
      case'subdivide':{const o=root.PAFractionAreaEngine.subdivide({n:1,d:2},2);if(o.ok&&o.invariant)advance();break}
      case'fractionSame': value===true?passThen('Betul. Jumlah yang dipilih tidak berubah.'):failThen('Keseluruhan dan kawasan berwarna masih sama. Cuba lihat panjangnya.');break;
      case'share': advance();break;
      case'group': advance();break;
      case'buildBar': advance();break;
      case'barOp': value==='SUBTRACT'?passThen('Betul. ? + 12 = 47, jadi 47 − 12.'):failThen('Perkataan “lebih” tidak menentukan operasi. Lihat bahagian yang hilang.');break;
      case'splitArray': advance();break;
      case'mulResult': Number(value)===56?passThen('Betul. Dua bahagian itu masih membina susunan 7 × 8 yang sama.'):failThen('Tambah 35 dan 21.');break;
      case'makeTen': Number(value)===2?passThen('Betul. 8 perlukan 2 lagi untuk menjadi 10.'):failThen('Lihat dua ruang kosong dalam kotak 10.');break;
      case'comp': value==='minus1'?passThen('Betul. Kita terlebih 1 apabila 39 dijadikan 40.'):failThen('40 ialah 1 lebih besar daripada 39, jadi kita perlu pulangkan 1.');break;
      case'countUp': advance();break;
      case'scaleUp': advance();break;
      case'scaleDown': advance();break;
      case'next': advance();break;
      default:break;
    }
  }

  function submitClean(){
    const input=document.getElementById('dvLabCleanAnswer');if(!input)return;
    const got=String(input.value||'').replace(/\s+/g,'').toLowerCase();const expected=String(lab.lesson.cleanAnswer).replace(/\s+/g,'').toLowerCase();
    if(got===expected){recordClean('PASS');feedback('Betul. Kamu guna cara yang sama tanpa gambar bantuan.',true);setTimeout(renderComplete,350)}
    else{recordClean('FAIL');feedback('Belum tepat. Cikgu Dimensi akan semak semula cara ini kemudian.');setTimeout(renderComplete,650)}
  }
  function renderComplete(){
    setTeacherActive(false);root.PADimensionalPortal?.deactivate?.();
    setStage('Selesai');
    setBody(`<div class="dvComplete"><div class="dvCheck">✓</div><b>Dimensi ini selesai.</b><span>Sekarang kita kembali kepada bentuk matematik sekolah tanpa gambar bantuan.</span></div><button class="dvPrimary" onclick="PADimensionalLab.resume()">Sambung pertarungan</button>`);
  }
  function resume(){if(!lab)return;telemetry('dv_lab_completed');setTeacherActive(false);root.PADimensionalPortal?.deactivate?.();hideOverlay();unfreezeBattle();lab.active=false;saveDb()}
  function abort(){if(!lab)return;telemetry('dv_lab_aborted');setTeacherActive(false);root.PADimensionalPortal?.deactivate?.();hideOverlay();unfreezeBattle();lab.active=false}
  function state(){return lab?JSON.parse(JSON.stringify({active:lab.active,key:lab.key,step:lab.step,lesson:lab.lesson,data:lab.data,originalBattle:lab.originalBattle})):null}

  root.PADimensionalLab={version:'0.2.1',start,act,submitClean,resume,abort,state,list:()=>root.PADimensionalCatalog?.list?.()||[],_render:render};
})(typeof window!=='undefined'?window:globalThis);
