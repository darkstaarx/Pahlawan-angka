/* DEV-only isolated preview. Never starts a battle or changes db/sess/learningState. */
(()=>{
  'use strict';
  const IDS=['cake','bridge','supply','garden','market','symmetry'];
  let dialog=null,model=null,stage=0,recall=false,feedback='',returnFocus=null;
  const api=()=>window.PACoachGames;
  const allowed=()=>{try{return typeof isDevMode==='function'&&isDevMode()}catch(_){return false}};
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function dispose(target=dialog,focusTarget=returnFocus){
    target?.remove();
    if(target!==dialog)return;
    dialog=null;model=null;returnFocus=null;
    if(focusTarget?.isConnected)focusTarget.focus({preventScroll:true});
  }
  function close(){
    const target=dialog,focusTarget=returnFocus;if(!target)return;
    if(target.open)target.close();
    dispose(target,focusTarget);
  }
  function paint(){
    if(!dialog||!model)return;
    const d=api().definitions[model.kind];
    let body='';
    if(stage===0)body=`<p>${esc(d.goal)}</p><p>${esc(d.idea)}</p><button type="button" data-cg-next>Mula aktiviti →</button>`;
    if(stage===1)body=`<p>${esc(model.kind==='supply'&&model.phase===1?'Setiap pet memerlukan 3 bekalan. Gunakan semua 12.':d.goal)}</p><p role="status" class="cg-feedback">${esc(model.feedback||'Kamu kawal tindakan. Boleh cuba, undur atau mula semula.')}</p>${api().controls(model)}`;
    if(stage===2)body=`<p>${esc(d.challenge)}</p><div class="cg-controls">${d.choices.map((v,i)=>`<button type="button" data-preview-answer="${i}"${recall?' disabled':''}>${esc(v)}</button>`).join('')}</div><p role="status">${esc(feedback)}</p>${recall?'<button type="button" data-cg-next>Selesai preview →</button>':''}`;
    if(stage===3)body='<h3>Preview selesai</h3><p>Ini ujian aktiviti sahaja. Tiada XP, syiling atau kemajuan disimpan.</p><button type="button" data-preview-replay>Ulang aktiviti</button>';
    dialog.querySelector('[data-preview-content]').innerHTML=`<h2 id="cgDevTitle">${esc(d.title)}</h2><p class="cg-dev-step">${['Faham','Bina','Semak tanpa model','Selesai'][stage]} · PREVIEW DEV</p>${stage<2?`<div class="cg-dev-scene">${api().scene(model)}</div>`:'<p class="cg-hidden-model">Model disimpan.</p>'}<section class="cg-copy">${body}</section>`;
  }
  function open(kind){
    if(!allowed()||!api()||!IDS.includes(kind))return false;
    if(dialog)close();
    returnFocus=document.activeElement;model=api().create(kind);stage=0;recall=false;feedback='';
    dialog=document.createElement('dialog');const current=dialog,focusTarget=returnFocus;
    current.className='cg-dev-dialog';current.setAttribute('aria-labelledby','cgDevTitle');
    current.innerHTML='<header><b>Mini-game Cikgu Dimensi</b><button type="button" data-preview-close>Tutup preview</button></header><p class="cg-dev-note">Ujian sahaja · tidak mengubah profil atau battle</p><div data-preview-content></div>';
    current.addEventListener('close',()=>dispose(current,focusTarget));
    current.addEventListener('click',event=>{
      const b=event.target.closest?.('button');if(!b||b.disabled)return;
      if(b.hasAttribute('data-preview-close')){close();return}
      if(!allowed()){close();return}
      if(b.hasAttribute('data-preview-replay')){model=api().create(model.kind);stage=0;recall=false;feedback='';paint();return}
      if(b.hasAttribute('data-cg-next')){
        if(stage===0||(stage===1&&model.done)||(stage===2&&recall)){stage++;paint();dialog.querySelector('h2')?.scrollIntoView({block:'nearest'})}return;
      }
      if(b.hasAttribute('data-preview-answer')&&stage===2&&!recall){
        const d=api().definitions[model.kind];recall=d.choices[Number(b.dataset.previewAnswer)]===d.answer;
        feedback=recall?'Betul. Hubungan tadi boleh digunakan tanpa model.':'Belum tepat. Fikirkan hubungan tadi dan cuba lagi.';paint();return;
      }
      if(stage!==1||!b.hasAttribute('data-cg-action'))return;
      const action=b.dataset.cgAction,raw=b.dataset.cgValue,value=raw!==undefined&&/^-?\d+$/.test(raw)?Number(raw):raw;
      model=api().reduce(model,action,value);paint();
      Array.from(dialog.querySelectorAll('[data-cg-action]')).find(e=>e.dataset.cgAction===action&&e.dataset.cgValue===raw&&!e.disabled)?.focus({preventScroll:true});
    });
    document.body.appendChild(current);paint();
    try{current.showModal()}catch(_){dispose(current,focusTarget);return false}
    return true;
  }
  function mount(){
    const panel=document.getElementById('devPanel');if(!panel||panel.querySelector('[data-coach-games-dev]')||!allowed()||!api())return;
    const box=document.createElement('section');box.className='devScenario';box.setAttribute('data-coach-games-dev','1');
    box.innerHTML='<b>Mini-game Cikgu Dimensi</b><p class="mut devMiniCopy">Enam aktiviti interaktif. Preview tidak mengubah kemajuan murid.</p><div class="devLabGrid"></div>';
    for(const id of IDS){const b=document.createElement('button');b.type='button';b.className='btn ghost small';b.textContent=api().definitions[id].title;b.addEventListener('click',()=>open(id));box.querySelector('.devLabGrid').appendChild(b)}
    panel.appendChild(box);
  }
  const original=window.renderDevPanel;
  if(typeof original==='function')window.renderDevPanel=function(){const out=original.apply(this,arguments);mount();return out};
  window.PADevCoachGames={open,close,mount};mount();
})();
