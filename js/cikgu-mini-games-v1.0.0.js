/* Teaching-only mini-games. No saves, rewards, question generation or routing.
 * One fixed hero per activity. Objects are exact SVG/HTML, not generated art.
 * Model strategy only: preserve the existing contrast/micro fallback ladder.
 */
(()=>{
  'use strict';
  const VERSION='1.0.0';
  const DEFINITIONS={
    cake:{hero:'wira',title:'Dapur Wira',goal:'Kongsi satu kek kepada 4 pet, sama besar.',idea:'Pecahan memerlukan bahagian sama besar daripada keseluruhan yang sama.',challenge:'Satu kek dibahagi kepada 8 bahagian sama besar. Dua bahagian ialah pecahan yang sama dengan…',choices:['1/8','1/4','1/2'],answer:'1/4'},
    bridge:{hero:'wira',title:'Jambatan Sepuluh',goal:'Ada 8 papan. Gunakan bekalan 5 papan untuk cukupkan 10 dahulu.',idea:'Pecahkan 5 kepada 2 dan 3: 8 + 5 = 10 + 3.',challenge:'Untuk 9 + 4, berapa daripada 4 perlu dipindahkan supaya 9 menjadi 10?',choices:['3','2','1'],answer:'1'},
    supply:{hero:'sidma',title:'Kem Bekalan Sidma',goal:'Agihkan 12 bekalan kepada 3 pet, sama banyak.',idea:'Bezakan bilangan kumpulan daripada bilangan dalam setiap kumpulan.',challenge:'Ada 15 bekalan. Setiap pet mendapat 3. Berapa pet boleh menerima bekalan?',choices:['5 pet','3 pet','12 pet'],answer:'5 pet'},
    garden:{hero:'bunga',title:'Kebun Susunan Bunga',goal:'Bina 4 baris dengan 6 pokok dalam setiap baris.',idea:'4 × 6 = (4 × 5) + (4 × 1). Jumlah pokok tidak berubah apabila susunan diputar.',challenge:'Untuk 3 × 7, pecahkan 7 kepada 5 + 2. Yang manakah sama nilainya?',choices:['3 × 5 + 2','3 × 5 + 3 × 2','3 + 5 + 2'],answer:'3 × 5 + 3 × 2'},
    market:{hero:'sidma',title:'Pasar Baki Sidma',goal:'Harga RM7. Pelanggan bayar RM10. Lengkapkan wang dari RM7 ke RM10.',idea:'Mengira naik mencari beza: RM7 + RM3 = RM10, jadi baki RM3.',challenge:'Harga RM8, bayar RM12. Berapakah baki?',choices:['RM20','RM3','RM4'],answer:'RM4'},
    symmetry:{hero:'bunga',title:'Gerbang Simetri',goal:'Cari garis lipatan yang membuat dua bahagian segi empat tepat bertindih.',idea:'Paksi simetri membahagi bentuk kepada dua bahagian yang bertindih tepat apabila dilipat.',challenge:'Segi empat tepat ini bukan segi empat sama. Berapa paksi simetrinya, walaupun diputar?',choices:['1','2','4'],answer:'2'}
  };
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function selectGame(id,prompt='',strategy='model'){
    if(strategy!=='model')return null;
    if(id==='D2.3.1')return 'cake';
    if(['D1.ADD20','D1.ADD100','D2.2.1'].includes(id))return 'bridge';
    if(id==='D2.2.4')return 'supply';
    if(id==='D2.2.3')return 'garden';
    if(id==='D2.4.3')return 'market';
    // Do not replace unrelated 2D/3D lessons with symmetry.
    if(id==='D3.SHAPE'&&/simetri/i.test(prompt))return 'symmetry';
    return null;
  }
  function create(kind){
    if(!DEFINITIONS[kind])throw new Error('Unknown teaching game');
    return {kind,phase:0,done:false,feedback:'',last:'',turn:0,moved:0,cut:0,equal:false,plates:[0,0,0,0],boxes:[0,0,0],rows:2,cols:3,split:false,rotated:false,axis:'vertical',folded:false,seen:[],jumps:[],attempts:0};
  }
  // Pure bounded transition function, also used by the runtime and audits.
  function reduce(previous,action,value){
    const s=JSON.parse(JSON.stringify(previous));
    if(s.done&&action!=='reset')return s;
    if(action==='reset')return create(s.kind);
    s.feedback='';s.last=action;s.turn++;
    if(action==='check')s.attempts++;
    switch(s.kind){
      case 'cake':
        if(action==='cut'&&s.phase===0){s.cut=4;s.equal=value==='equal';s.plates=[0,0,0,0]}
        if(action==='serve'&&s.phase===0&&s.cut&&Number.isInteger(value)&&value>=0&&value<4&&s.plates.reduce((a,b)=>a+b,0)<4)s.plates[value]++;
        if(action==='check'&&s.phase===0){
          if(!s.cut)s.feedback='Pilih potongan kek dahulu.';
          else if(!s.equal)s.feedback='Empat potongan belum tentu sama besar. Bandingkan lebarnya, kemudian potong semula.';
          else if(!s.plates.every(n=>n===1))s.feedback='Setiap pet perlu satu daripada empat bahagian sama besar. Cuba agih semula.';
          else{s.phase=1;s.feedback='Setiap pet mendapat 1/4. Sekarang belah setiap suku kepada dua.'}
        }
        if(action==='halve'&&s.phase===1){s.phase=2;s.done=true;s.feedback='Lihat kawasan berwarna: 1/4 = 2/8. Saiz kek asal tidak berubah.'}
        break;
      case 'bridge':
        if(action==='move'&&[-1,1].includes(value))s.moved=Math.max(0,Math.min(5,s.moved+value));
        if(action==='check'){s.done=s.moved===2;s.feedback=s.done?'Cukup 10, berbaki 3. Jadi 8 + 5 = 13.':s.moved<2?'Jambatan belum cukup 10. Pindahkan sedikit lagi.':'Terlebih daripada 10. Undur papan supaya nampak kumpulan sepuluh.'}
        break;
      case 'supply':
        if(action==='serve'&&s.phase===0&&Number.isInteger(value)&&value>=0&&value<3&&s.boxes.reduce((a,b)=>a+b,0)<12)s.boxes[value]++;
        if(action==='group'&&s.phase===1&&s.moved<4)s.moved++;
        if(action==='undo'&&s.phase===1&&s.moved>0)s.moved--;
        if(action==='check'&&s.phase===0){
          if(s.boxes.every(n=>n===4)){s.phase=1;s.feedback='3 pet mendapat 4 setiap pet. Kini ubah misi: setiap pet mendapat 3 bekalan.'}
          else s.feedback='Agihkan semua 12 bekalan sama banyak. Kamu boleh mula semula.';
        }else if(action==='check'&&s.phase===1){s.done=s.moved===4;s.feedback=s.done?'Kini 4 pet mendapat 3 setiap pet. 12 ÷ 3 = 4, tetapi 4 kini mengira pet.':'Masih ada bekalan. Bina kumpulan 3 sehingga semua 12 digunakan.'}
        break;
      case 'garden':
        if(s.phase===0&&action==='rows'&&[-1,1].includes(value))s.rows=Math.max(1,Math.min(5,s.rows+value));
        if(s.phase===0&&action==='cols'&&[-1,1].includes(value))s.cols=Math.max(1,Math.min(7,s.cols+value));
        if(action==='check'&&s.phase===0){if(s.rows===4&&s.cols===6){s.phase=1;s.feedback='24 pokok. Pecahkan lajur kepada 5 + 1.'}else s.feedback='Semak baris dan pokok setiap baris, bukan jumlah sahaja.'}
        if(action==='split'&&s.phase===1){s.split=true;s.feedback='20 pokok + 4 pokok = 24. Sekarang putar susunannya.'}
        if(action==='rotate'&&s.phase===1&&s.split){s.rotated=true;s.done=true;s.feedback='4 baris × 6 menjadi 6 baris × 4. Masih 24 pokok.'}
        break;
      case 'market':
        if(action==='coin'&&[1,2].includes(value)&&s.moved+value<=5){s.moved+=value;s.jumps.push(value)}
        if(action==='undo'&&s.jumps.length)s.moved-=s.jumps.pop();
        if(action==='check'){s.done=s.moved===3;s.feedback=s.done?'RM7 + RM3 = RM10. Pulangkan RM3 kepada pelanggan.':s.moved<3?'Belum sampai RM10. Tambah sedikit lagi.':'Terlebih daripada bayaran RM10. Ambil semula langkah terakhir.'}
        break;
      case 'symmetry':
        if(action==='axis'&&['vertical','horizontal','diagonal'].includes(value)){s.axis=value;s.folded=false}
        if(action==='fold'){s.folded=true;if(s.axis!=='diagonal'){if(!s.seen.includes(s.axis))s.seen.push(s.axis);s.feedback='Bertindih tepat. Cuba garis lain untuk mencari kedua-dua paksi.'}else s.feedback='Tidak bertindih tepat. Diagonal bukan paksi simetri bagi segi empat tepat ini.'}
        if(action==='rotate'){s.rotated=!s.rotated;s.folded=false}
        if(action==='check'){s.done=s.seen.length===2;s.feedback=s.done?'Dua paksi: melalui tengah sisi berlawanan. Memutar bentuk tidak mengubah bilangan paksi.':'Uji lipatan menegak dan mendatar dahulu. Diagonal juga boleh diuji.'}
        break;
    }
    return s;
  }
  const button=(label,action,value,disabled=false)=>`<button type="button" data-cg-action="${action}"${value===undefined?'':` data-cg-value="${esc(value)}"`}${disabled?' disabled':''}>${label}</button>`;
  const dots=(n,cls='')=>Array.from({length:n},()=>`<i class="cg-token ${cls}" aria-hidden="true"></i>`).join('');
  function controls(s){
    if(s.done)return '<button type="button" data-cg-next>Jawab tanpa model →</button>';
    let c='';
    if(s.kind==='cake')c=s.phase===0?button('Potong sama besar','cut','equal')+button('Cuba potongan tak sama','cut','unequal')+(s.cut?`<div class="cg-controls">${s.plates.map((n,i)=>button(`Beri pet ${i+1}`,'serve',i,s.plates.reduce((a,b)=>a+b,0)>=4)).join('')}</div>`:''):button('Belah setiap suku kepada dua','halve');
    if(s.kind==='bridge')c=button('Undur 1 papan','move',-1,s.moved===0)+button('Pindah 1 papan','move',1,s.moved===5);
    if(s.kind==='supply')c=s.phase===0?s.boxes.map((n,i)=>button(`Beri pet ${i+1}`,'serve',i,s.boxes.reduce((a,b)=>a+b,0)>=12)).join(''):button('Bina kumpulan 3','group',undefined,s.moved===4)+button('Undur kumpulan','undo',undefined,s.moved===0);
    if(s.kind==='garden')c=s.phase===0?button('− baris','rows',-1,s.rows===1)+button('+ baris','rows',1,s.rows===5)+button('− lajur','cols',-1,s.cols===1)+button('+ lajur','cols',1,s.cols===7):!s.split?button('Pisahkan 5 + 1 lajur','split'):button('Putar susunan','rotate');
    if(s.kind==='market')c=button('Tambah RM1','coin',1,s.moved>=5)+button('Tambah RM2','coin',2,s.moved>=4)+button('Undur wang','undo',undefined,!s.jumps.length);
    if(s.kind==='symmetry')c=button('Garis menegak','axis','vertical')+button('Garis mendatar','axis','horizontal')+button('Garis pepenjuru','axis','diagonal')+button('Lipat gerbang','fold')+button('Putar bentuk','rotate');
    const check=!(s.kind==='cake'&&s.phase>0)&&!(s.kind==='garden'&&s.phase>0);
    return `<div class="cg-controls">${c}</div><div class="cg-controls">${check?button('Semak tindakan saya','check'):''}${button('Mula semula','reset')}</div>`;
  }
  function diagram(s){
    if(s.kind==='cake'){
      const widths=s.equal?[60,60,60,60]:[30,50,70,90];let x=20;
      return `<svg viewBox="0 0 280 150" role="img" aria-label="Kek segi empat, ${s.cut?s.equal?'empat bahagian sama besar':'empat bahagian tidak sama besar':'belum dipotong'}">${(s.cut?widths:[240]).map((w,i)=>{const r=`<rect x="${x}" y="25" width="${w}" height="88" rx="3" fill="${i===0?'#ffd96a':'#f2b5a1'}" stroke="#603a3e" stroke-width="3"/>`;x+=w;return r}).join('')}${s.phase===2?[50,110,170,230].map(x=>`<path d="M${x} 25v88" stroke="#603a3e" stroke-width="2"/>`).join(''):''}<text x="140" y="139" text-anchor="middle" fill="white">${s.phase===2?'1/4 = 2/8 · kawasan kuning sama':'Satu kek yang sama'}</text></svg><div class="cg-plates">${s.plates.map((n,i)=>`<span>Pet ${i+1}<b>${n} potongan</b></span>`).join('')}</div>`;
    }
    if(s.kind==='bridge')return `<div class="cg-bridge" role="img" aria-label="${8+s.moved} papan di jambatan, ${5-s.moved} berbaki">${Array.from({length:10},(_,i)=>`<i class="${i<8?'built':i<8+s.moved?'added':''}"></i>`).join('')}</div><p>${8+s.moved} di jambatan${s.moved>2?' — melebihi sasaran 10':''}</p><div class="cg-stock">${dots(5-s.moved)}<span>Bekalan: ${5-s.moved}</span></div>${s.moved>2?`<p>${s.moved-2} papan terlebih di tebing.</p>`:''}${s.done?'<strong>8 + 5 = 10 + 3 = 13</strong>':''}`;
    if(s.kind==='supply'){
      const boxes=s.phase===0?s.boxes:Array.from({length:s.moved},()=>3),used=boxes.reduce((a,b)=>a+b,0);
      return `<p>${s.phase===0?'Misi A: 3 pet, cari bekalan setiap pet':'Misi B: 3 setiap pet, cari bilangan pet'}</p><div class="cg-crates">${boxes.map((n,i)=>`<div><b>Pet ${i+1}</b><div>${dots(n)}</div><small>${n} bekalan</small></div>`).join('')}</div><p>Belum diagih: ${12-used} / 12</p>`;
    }
    if(s.kind==='garden'){
      const rows=s.rotated?s.cols:s.rows,cols=s.rotated?s.rows:s.cols;
      return `<div class="cg-garden" style="--cols:${cols}" role="img" aria-label="${rows} baris, ${cols} pokok setiap baris">${Array.from({length:rows*cols},(_,i)=>{const separate=s.split&&(s.rotated?Math.floor(i/cols)===5:i%cols===5);return `<i class="cg-plant ${separate?'cg-extra':''}" aria-hidden="true"></i>`}).join('')}</div><p>${rows} baris × ${cols} pokok = ${rows*cols}</p>${s.split?'<strong>4 × 5 + 4 × 1 = 20 + 4</strong>':''}`;
    }
    if(s.kind==='market')return `<div class="cg-money-line">${Array.from({length:6},(_,i)=>`<span class="${7+i===7+s.moved?'current':''}">RM${7+i}</span>`).join('')}</div><p>Harga RM7 · Bayaran RM10</p><div class="cg-stock">${s.jumps.map(n=>`<b class="cg-coin">RM${n}</b>`).join('')||'<span>Pilih wang untuk mengira naik.</span>'}</div><strong>RM7 + RM${s.moved} = RM${7+s.moved}</strong>`;
    const path=s.axis==='vertical'?'M0 -65V65':s.axis==='horizontal'?'M-95 0H95':'M-75 -75L75 75';
    const matrix=s.axis==='vertical'?'matrix(-1 0 0 1 0 0)':s.axis==='horizontal'?'matrix(1 0 0 -1 0 0)':'matrix(0 1 1 0 0 0)';
    const clip=s.axis==='vertical'?'<rect x="0" y="-100" width="100" height="200"/>':s.axis==='horizontal'?'<rect x="-100" y="-100" width="200" height="100"/>':'<path d="M-100 -100H100V100Z"/>';
    return `<svg viewBox="0 0 260 195" role="img" aria-label="Segi empat tepat bukan segi empat sama; garis ${s.axis}; ${s.folded?s.axis==='diagonal'?'tidak bertindih tepat':'bertindih tepat':'belum dilipat'}"><defs><clipPath id="cg-fold-half">${clip}</clipPath></defs><g transform="translate(130 96) rotate(${s.rotated?30:0})"><rect x="-70" y="-40" width="140" height="80" fill="#203f58" stroke="#ffdc78" stroke-width="3"/><g class="cg-fold ${s.folded?'folded':''}" transform="${s.folded?matrix:''}"><g clip-path="url(#cg-fold-half)"><rect x="-70" y="-40" width="140" height="80" fill="#70e1b7" opacity=".8"/></g></g><path d="${path}" stroke="white" stroke-width="2" stroke-dasharray="5 4"/></g></svg><p>Paksi ditemui: ${s.seen.length} / 2</p>`;
  }
  function scene(s){
    const d=DEFINITIONS[s.kind],heroes=typeof HEROES==='undefined'?{}:HEROES,h=heroes[d.hero]||{};
    const src=s.turn?(h.anticipation||h.idle):h.idle;
    return `<div class="cg-scene cg-${s.kind}"><div class="cg-actor ${s.turn?'cg-act':''}"><img src="${esc(src||'')}" alt="${esc(d.hero)} membantu tindakan matematik" draggable="false"/></div><div class="cg-objects" data-turn="${s.turn}">${diagram(s)}</div></div>`;
  }
  function current(){return typeof learningState==='undefined'?null:learningState}
  function active(){const l=current();return l?selectGame(l.skillId,l.originalPrompt,l.strategy||'model'):null}
  function model(){const l=current(),kind=active();if(!l||!kind)return null;if(!l.miniGame||l.miniGame.kind!==kind)l.miniGame=create(kind);if(l.miniGame.stage!==l.stage){l.miniGame.stage=l.stage;if(l.stage===2){l.miniGame.recalled=false;l.miniGame.recallFeedback=''}}return l.miniGame}
  function body(stage){
    const s=model(),d=DEFINITIONS[s.kind];
    if(stage===0)return `<section class="cg-copy"><small>CONTOH LATIHAN · ${esc(d.hero.toUpperCase())}</small><h2>${d.title}</h2><p>${d.goal}</p><p>${d.idea}</p><button type="button" data-cg-next>Bantu ${esc(d.hero)} →</button></section>`;
    if(stage===2)return `<section class="cg-copy"><small>TANPA MODEL · SEMAK FAHAM</small><h2>${d.title}</h2><p>${d.challenge}</p><div class="cg-controls">${d.choices.map((v,i)=>`<button type="button" data-cg-answer="${i}" ${s.recalled?'disabled':''}>${esc(v)}</button>`).join('')}</div><p role="status">${esc(s.recallFeedback||'')}</p>${s.recalled?'<button type="button" data-cg-next>Cuba soalan seterusnya →</button>':''}</section>`;
    return `<section class="cg-copy"><small>CONTOH LATIHAN · KAMU KAWAL</small><h2>${d.title}</h2><p>${s.kind==='supply'&&s.phase===1?'Setiap pet memerlukan 3 bekalan. Gunakan semua 12.':d.goal}</p><p class="cg-feedback" role="status">${esc(s.feedback||'Cuba satu tindakan. Kamu boleh ubah atau mula semula.')}</p>${controls(s)}</section>`;
  }
  function paintArena(stage){
    const a=document.getElementById('visualCoachArena'),b=document.getElementById('visualCoachBoard');if(!a||!b)return;
    a.classList.remove('hidden','pam-time-lab','vcCheckpoint');a.classList.add('cg-arena');
    b.innerHTML=stage===2?'<p class="cg-hidden-model">Model disimpan. Ingat hubungan yang kamu bina tadi.</p>':scene(model());
    const cue=document.getElementById('visualCoachCue');if(cue)cue.textContent=stage===2?'Sekarang cuba tanpa model':'Tindakan kamu mengubah model';
  }
  function refresh(focusAction,focusValue){
    const l=current();if(!active()||!l||l.stage>2)return;
    paintArena(l.stage);const b=document.getElementById('learningBody');if(b)b.innerHTML=body(l.stage);
    if(focusAction){const el=Array.from(b?.querySelectorAll('[data-cg-action]')||[]).find(e=>e.dataset.cgAction===focusAction&&e.dataset.cgValue===focusValue&&!e.disabled);el?.focus({preventScroll:true})}
  }
  let installed=false;
  function install(){
    if(installed)return true;
    if(typeof window.renderVisualCoachArena!=='function'||typeof window.visualCoachContent!=='function')return false;
    installed=true;
    const render=window.renderVisualCoachArena,content=window.visualCoachContent;
    window.renderVisualCoachArena=function(stage,key,m){
      document.getElementById('visualCoachArena')?.classList.remove('cg-arena');
      if(active()&&stage<=2){paintArena(stage);return}
      const l=current();if(l?.miniGame)l.miniGame.stage=stage;
      return render.call(this,stage,key,m);
    };
    window.visualCoachContent=function(stage,key,m){if(active()&&stage<=2)return body(stage);return content.call(this,stage,key,m)};
    document.addEventListener('click',event=>{
      const target=event.target.closest?.('[data-cg-action],[data-cg-next],[data-cg-answer]');
      if(!target||target.disabled||!target.closest('#learningBody')||!active())return;
      const l=current(),s=model();if(l.stage>2)return;
      if(target.hasAttribute('data-cg-next')){
        if(l.stage===0||(l.stage===1&&s.done)||(l.stage===2&&s.recalled))learningAdvance();return;
      }
      if(target.hasAttribute('data-cg-answer')&&l.stage===2){
        const d=DEFINITIONS[s.kind],i=Number(target.dataset.cgAnswer);if(s.recalled)return;
        s.recalled=d.choices[i]===d.answer;s.recallFeedback=s.recalled?'Betul. Kini cuba contoh lain.':'Belum tepat. Fikirkan hubungan tadi; kamu boleh cuba lagi.';refresh();return;
      }
      if(l.stage!==1)return;
      const raw=target.dataset.cgValue,value=raw!==undefined&&/^-?\d+$/.test(raw)?Number(raw):raw;
      l.miniGame=reduce(s,target.dataset.cgAction,value);refresh(target.dataset.cgAction,raw);
    });
    return true;
  }
  window.PACoachGames={version:VERSION,definitions:DEFINITIONS,selectGame,create,reduce,diagram,controls,scene,install};
  install();
})();
