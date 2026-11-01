/* Pahlawan Angka CPA v1.0 — shared in-question teaching surface.
 * Singapore-informed C → P → A scaffolding. The actual question, answer,
 * response engine, evidence and scoring belong to the parent battle engine.
 * This module never calls generate, respond, score, telemetry or save.
 */
(()=>{
 'use strict';
 const VERSION='1.0.0';
 const GROUPS=Object.freeze({
  place:{title:'Nilai tempat & operasi',c:'Kumpulkan objek kepada puluh dan sa.',p:'Lihat lajur nilai tempat sebelum mengira.',a:'Susun nombor ikut nilai tempat. Semak kumpul semula jika perlu.',model:'place',equation:'Puluh + sa = ___'},
  groups:{title:'Sifir & bahagi',c:'Sentuh setiap kumpulan untuk mengira secara sama banyak.',p:'Kira baris dan objek dalam setiap baris.',a:'Kumpulan × bilangan setiap kumpulan = ___',model:'groups',equation:'Kumpulan × setiap kumpulan = ___'},
  word:{title:'Masalah berayat',c:'Kenal pasti jumlah, bahagian diketahui dan yang dicari.',p:'Susun jumlah dan bahagian dalam bar model.',a:'Pilih operasi berdasarkan hubungan dalam cerita.',model:'word',equation:'Diketahui + dicari = jumlah'},
  fraction:{title:'Pecahan & perpuluhan',c:'Sentuh petak untuk membezakan bahagian yang sama besar.',p:'Penyebut ialah jumlah bahagian sama besar; pengangka ialah bahagian dipilih.',a:'Sambungkan model dengan pecahan atau perpuluhan yang diminta.',model:'fraction',equation:'Bahagian dipilih / jumlah bahagian = ___'},
  money:{title:'Wang',c:'Bezakan nilai wang yang dibayar dan harga barang.',p:'Gunakan bar jumlah, harga dan baki.',a:'Tulis operasi dengan unit RM atau sen yang betul.',model:'money',equation:'Bayaran − harga = baki'},
  time:{title:'Masa & waktu',c:'Jejak perubahan pada jam mengikut sela masa.',p:'Lihat waktu mula, tempoh dan waktu akhir.',a:'Kira tempoh dalam minit atau jam; semak 60 minit = 1 jam.',model:'time',equation:'Waktu mula + tempoh = waktu akhir'},
  measure:{title:'Panjang, jisim & isi padu',c:'Mulakan ukuran pada sifar dan kenal pasti unit.',p:'Baca tanda skala pada alat pengukur.',a:'Samakan unit sebelum mengira.',model:'measure',equation:'Nilai + unit = ___'},
  area:{title:'Luas & perimeter',c:'Sentuh petak untuk mengisi kawasan.',p:'Luas menutup petak; perimeter mengikut garisan tepi.',a:'Pilih formula yang sesuai dengan apa yang diminta.',model:'area',equation:'Luas: baris × lajur · Perimeter: jumlah sisi'},
  shape:{title:'Bentuk & kedudukan',c:'Perhatikan sisi, bucu, sudut dan arah.',p:'Banding ciri bentuk walaupun dipusing.',a:'Gunakan istilah dan unit yang betul.',model:'shape',equation:'Ciri bentuk → nama bentuk'},
  ratio:{title:'Nisbah, peratus & kadaran',c:'Banding kumpulan menggunakan unit yang sama.',p:'Lihat bar unit yang sepadan.',a:'Tulis nisbah mengikut turutan; peratus ialah bahagian daripada 100.',model:'ratio',equation:'Bahagian : bahagian · % daripada 100'},
  data:{title:'Data & graf',c:'Kumpul tanda bagi setiap kategori.',p:'Baca paksi dan skala sebelum membandingkan palang.',a:'Baca nilai sebenar, kemudian kira beza atau jumlah.',model:'data',equation:'Nilai kategori A − nilai kategori B = ___'}
 });
 const contextMap=Object.freeze({
  money:'money',wang:'money',time:'time',masa:'time',measure:'measure',
  ukuran:'measure',length:'measure',mass:'measure',volume:'measure',
  fraction:'fraction',pecahan:'fraction',decimal:'fraction',perpuluhan:'fraction',
  ratio:'ratio',nisbah:'ratio',kadaran:'ratio',peratus:'ratio',percent:'ratio',
  geometry:'shape',ruang:'shape',bentuk:'shape',coordinate:'shape',
  data:'data',graph:'data',piktograf:'data',statistik:'data',
  area:'area',luas:'area',perimeter:'area',place:'place',number:'place',
  operasi:'place',nombor:'place'
 });
 const text=v=>String(v??'').toLowerCase().trim();
 const key=v=>text(v).normalize('NFKD').replace(/[^a-z0-9]/g,'');
 function classify(q,meta={}){
  if(!q)return null;
  const facets=q.facets||{};
  const ids=[facets.context,q.contextId,facets.schema,facets.concept,facets.skill,
    q.concept,q.skill,meta.domain,meta.title];
  const tags=ids.map(text).filter(Boolean);
  // Mathematical schema is more informative than a generic "Operasi" domain.
  if(/^(part_whole|change|compare_more|compare_less|multiplicative|multi_step|word)$/.test(text(facets.schema)))return'word';
  if(facets.format==='word'&&/masalah|cerita|ayat|problem/i.test(tags.join(' ')))return'word';
  for(const t of [facets.context,q.contextId]){const k=key(t);if(contextMap[k]&&contextMap[k]!=='place'&&contextMap[k]!=='shape')return contextMap[k]}
  const domain=key(meta.domain);
  const title=tags.join(' ');
  // A question about area/perimeter must not be swallowed by the broad Ruang domain.
  if(/luas|perimeter|keliling|area/.test(title))return'area';
  if(contextMap[domain]&&contextMap[domain]!=='place')return contextMap[domain];
  if(/masalah berayat|soalan berayat|cerita matematik/.test(title))return'word';
  if(/nisbah|kadaran|peratus|percent|ratio/.test(title))return'ratio';
  if(/pecahan|perpuluhan|decimal|fraction/.test(title)||q.fractionTask)return'fraction';
  if(/sifir|darab|bahagi|kumpulan sama|multipli|division/.test(title)||['mul','div'].includes(text(facets.op)))return'groups';
  if(/data|graf|piktograf|statistik/.test(title))return'data';
  if(/ukuran|panjang|jisim|isi padu|mℓ|sukat/.test(title))return'measure';
  if(/masa|waktu|jam|tempoh/.test(title))return'time';
  if(/wang|duit|harga|baki/.test(title))return'money';
  if(/bentuk|ruang|sudut|koordinat/.test(title))return'shape';
  if(contextMap[domain])return contextMap[domain];
  if(/operasi|nombor|nilai tempat|tambah|tolak/.test(title)||['add','sub'].includes(text(facets.op)))return'place';
  return null;
 }
 function config(q,meta){
  const k=classify(q,meta);if(!k)return null;
  const task=q?.fractionTask;
  const denominator=Number(task?.d??q?.facets?.denominator);
  const parts=Number.isInteger(denominator)&&denominator>=2&&denominator<=20?denominator:8;
  return {kind:k,group:GROUPS[k],parts,
    grounded:Number.isInteger(denominator)&&denominator>=2&&denominator<=20};
 }
 const E=(tag,cls,copy)=>{
  const node=document.createElement(tag);
  if(cls)node.className=cls;
  if(copy!==undefined)node.textContent=copy;
  return node;
 };
 let active=null;
 function paintModel(host,cfg,stage,touched){
  host.replaceChildren();
  const group=cfg.group,wrap=E('div','paCpaFigure paCpa-'+cfg.kind);
  wrap.setAttribute('role','group');
  wrap.setAttribute('aria-label','Model '+group.title);
  const label=E('div','paCpaFigureLabel',stage===0?'Sentuh objek untuk mencuba':stage===1?'Perhatikan hubungan dalam model':'Tukar kepada ayat matematik');
  host.append(label,wrap);
  const kind=cfg.kind,draw=(n,cls,textContent)=>{
   for(let i=0;i<n;i++){
    const cell=E('button','paCpaCell '+(cls||''),textContent||'');
    cell.type='button';cell.dataset.index=String(i);cell.setAttribute('aria-pressed',touched.has(i)?'true':'false');
    if(touched.has(i))cell.classList.add('selected');
    if(stage>0){cell.disabled=true;cell.tabIndex=-1}
    else cell.addEventListener('click',()=>{
      if(touched.has(i))touched.delete(i);else touched.add(i);
      paintModel(host,cfg,stage,touched);
      const next=host.querySelector('.paCpaCell[data-index="'+i+'"]');
      // Keep keyboard focus on the corresponding rebuilt piece.
      next?.focus({preventScroll:true});
      // Never derive a correct answer or submit a game response from these taps.
    });
    wrap.append(cell);
   }
  };
  if(kind==='fraction'){
    wrap.classList.add('paCpaFraction');
    draw(cfg.parts,'paCpaPiece');
  }else if(kind==='groups'){
    wrap.classList.add('paCpaGroups');
    for(let i=0;i<3;i++){
      const row=E('div','paCpaGroup');
      const heading=E('small','', 'Kumpulan '+(i+1));row.append(heading);
      for(let j=0;j<4;j++)row.append(E('span','paCpaDot'));
      if(stage===0){const button=E('button','paCpaGroupTouch',touched.has(i)?'Dipilih':'Sentuh');button.type='button';button.setAttribute('aria-pressed',String(touched.has(i)));button.onclick=()=>{if(touched.has(i))touched.delete(i);else touched.add(i);paintModel(host,cfg,stage,touched)};row.append(button)}
      wrap.append(row);
    }
  }else if(kind==='place'){
    wrap.classList.add('paCpaPlace');
    ['Ratus','Puluh','Sa'].forEach((name,i)=>{const box=E('div','paCpaPlaceColumn');box.append(E('b','',name),E('span','paCpaBlock',i===1?'▥':'□'));if(stage===0){const button=E('button','paCpaGroupTouch',touched.has(i)?'Dipilih':'Sentuh');button.type='button';button.onclick=()=>{if(touched.has(i))touched.delete(i);else touched.add(i);paintModel(host,cfg,stage,touched)};box.append(button)}wrap.append(box)});
  }else if(['word','money','ratio','time'].includes(kind)){
    wrap.classList.add('paCpaBars');
    const barNames={word:['Jumlah','Bahagian diketahui','Yang dicari'],money:['Bayaran','Harga','Baki'],ratio:['Kumpulan A','Kumpulan B','Unit sama'],time:['Waktu mula','Tempoh','Waktu akhir']};
    barNames[kind].forEach((name,i)=>{
      const bar=E('button','paCpaBar paCpaBar'+i,name);
      bar.type='button';bar.disabled=stage>0;
      if(touched.has(i))bar.classList.add('selected');
      bar.setAttribute('aria-pressed',String(touched.has(i)));
      bar.onclick=()=>{if(touched.has(i))touched.delete(i);else touched.add(i);paintModel(host,cfg,stage,touched)};
      wrap.append(bar);
    });
  }else if(kind==='measure'){
    wrap.classList.add('paCpaMeasure');wrap.append(E('div','paCpaRuler','0     1     2     3     4     5'));draw(5,'paCpaMeasureTick');
  }else if(kind==='area'){
    wrap.classList.add('paCpaArea');draw(12,'paCpaAreaCell');
  }else if(kind==='shape'){
    wrap.classList.add('paCpaShapes');
    ['△','□','◯'].forEach((shape,i)=>{const btn=E('button','paCpaShape',shape);btn.disabled=stage>0;btn.type='button';btn.setAttribute('aria-label', ['Segi tiga','Segi empat','Bulatan'][i]);btn.setAttribute('aria-pressed',String(touched.has(i)));if(touched.has(i))btn.classList.add('selected');btn.onclick=()=>{if(touched.has(i))touched.delete(i);else touched.add(i);paintModel(host,cfg,stage,touched)};wrap.append(btn)});
  }else if(kind==='data'){
    wrap.classList.add('paCpaData');
    [2,4,3].forEach((n,i)=>{const bar=E('button','paCpaGraphBar','');bar.type='button';bar.style.setProperty('--height',(n*17)+'px');bar.disabled=stage>0;bar.setAttribute('aria-label','Kategori '+(i+1));bar.setAttribute('aria-pressed',String(touched.has(i)));if(touched.has(i))bar.classList.add('selected');bar.onclick=()=>{if(touched.has(i))touched.delete(i);else touched.add(i);paintModel(host,cfg,stage,touched)};wrap.append(bar)});
  }
  // Demonstrations are generic unless the equal-part denominator is sourced
  // explicitly from question metadata. Never print the target answer.
  host.append(E('p','paCpaCaption',
    cfg.kind==='fraction'&&cfg.grounded
      ? 'Model menggunakan '+cfg.parts+' bahagian daripada data soalan. Semak bahagian yang diminta.'
      : 'Model contoh untuk memahami cara. Gunakan nombor sebenar daripada soalan kamu.'));
 }
 function render(){
  if(!active)return;
  const {host,cfg,touched,hint}=active,stage=active.stage;
  const titles=['BUAT','LIHAT','KIRA'],headings=['Cuba dengan objek','Baca model','Bina ayat matematik'];
  host.querySelector('.paCpaStep').textContent=titles[stage]+' · '+(stage+1)+'/3';
  host.querySelector('.paCpaHeading').textContent=headings[stage];
  host.querySelector('.paCpaDirection').textContent=[cfg.group.c,cfg.group.p,cfg.group.a][stage];
  host.querySelector('.paCpaHint').textContent=hint||'Cuba kenal pasti maklumat penting dalam soalan.';
  const visual=host.querySelector('.paCpaModel');
  paintModel(visual,cfg,stage,touched);
  host.querySelector('.paCpaEquation').textContent=stage===2?cfg.group.equation:'';
  host.querySelector('.paCpaEquation').hidden=stage!==2;
  const next=host.querySelector('.paCpaNext');
  next.textContent=stage===2?'Kembali kepada soalan':stage===0?'Lihat model →':'Bina ayat →';
  host.querySelector('.paCpaPrevious').hidden=stage===0;
  host.querySelector('.paCpaSteps').textContent='';
  titles.forEach((t,i)=>{const b=E('span',i===stage?'current':'',t);host.querySelector('.paCpaSteps').append(b)});
 }
 function close(){
  if(!active)return;
  const {host,previousFocus}=active;
  active=null;host.remove();
  if(previousFocus?.isConnected&&!previousFocus.disabled)previousFocus.focus({preventScroll:true});
 }
 function open({question,meta={},hint='',returnFocus}={}){
  if(typeof document==='undefined'||document.body?.dataset.screen==='timeLock'||window.PARapidLock?.isLocked?.())return false;
  const cfg=config(question,meta);if(!cfg)return false;
  close();
  const previousFocus=returnFocus||document.activeElement;
  const host=E('div','paCpaOverlay'),panel=E('section','paCpaPanel');
  host.setAttribute('role','dialog');host.setAttribute('aria-modal','true');
  host.setAttribute('aria-label','Bimbingan Cikgu Dimensi: '+cfg.group.title);
  const top=E('div','paCpaTop'),title=E('b','',cfg.group.title),exit=E('button','paCpaClose','Tutup');
  exit.type='button';exit.setAttribute('aria-label','Tutup bimbingan');exit.onclick=close;
  top.append(title,exit);
  const progress=E('div','paCpaSteps'),step=E('div','paCpaStep'),heading=E('h2','paCpaHeading'),direction=E('p','paCpaDirection');
  const visual=E('div','paCpaModel'),equation=E('p','paCpaEquation');
  const hintLabel=E('div','paCpaHintLabel','Petunjuk soalan'),hintContent=E('p','paCpaHint');
  const foot=E('div','paCpaActions'),prev=E('button','paCpaPrevious','← Kembali'),next=E('button','paCpaNext','');
  prev.type=next.type='button';
  prev.onclick=()=>{if(active&&active.stage>0){active.stage--;render()}};
  next.onclick=()=>{if(!active)return;if(active.stage>=2){close();return}active.stage++;render()};
  foot.append(prev,next);
  panel.append(top,progress,step,heading,direction,visual,equation,hintLabel,hintContent,foot);host.append(panel);
  // Prevent taps in the overlay from reaching battle or underlying number pad.
  host.addEventListener('click',e=>{if(e.target===host)close()});
  host.addEventListener('keydown',e=>{
    if(e.key==='Escape'){e.preventDefault();close();return}
    if(e.key==='Tab'){
      const items=[...host.querySelectorAll('button:not([disabled]):not([hidden])')].filter(el=>el.offsetParent!==null);
      if(!items.length)return;
      const first=items[0],last=items[items.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }
  });
  document.body.append(host);
  active={host,cfg,stage:0,touched:new Set(),hint,previousFocus};
  render();exit.focus({preventScroll:true});
  return true;
 }
 // Time lock and navigation always take precedence over a teaching modal.
 if(typeof MutationObserver!=='undefined'&&document.body){
  const watcher=new MutationObserver(()=>{
   const screen=document.body.dataset.screen;
   if(active&&screen!=='game'&&screen!=='segelDemo')close();
  });
  watcher.observe(document.body,{attributes:true,attributeFilter:['data-screen']});
 }
 window.PACPA={version:VERSION,groups:Object.keys(GROUPS),classify,config,open,close};
})();
