// Pahlawan Angka v3.24.10 — Cikgu Dimensi DEV preview launcher only.
(()=>{
  'use strict';
  const VERSION='3.24.10';
  const PILOT='Y3-PV-A2';

  const LABS=[
    {key:PILOT,label:'Y3-PV-A2 · Regrouping',skillId:'D3.SUB10000',pilot:true},
    {key:'fraction-equivalence',label:'Pecahan Setara',skillId:'D3.FRAC'},
    {key:'division-meaning',label:'Bahagi · Kongsi vs Kumpulan',skillId:'D3.DIV'},
    {key:'word-problem-bar',label:'Masalah Berayat · Bar',skillId:'D3.SUB10000'},
    {key:'multiply-decompose',label:'Darab · Pecah Susunan',skillId:'D3.MUL'},
    {key:'make-ten',label:'Make Ten',skillId:'D3.ADD10000'},
    {key:'compensation',label:'Compensation',skillId:'D3.ADD10000'},
    {key:'difference-count-up',label:'Tolak · Cari Beza',skillId:'D3.SUB10000'},
    {key:'scale-ten',label:'×10 / ÷10 Nilai Tempat',skillId:'D3.PV10000'}
  ];

  function devActive(){
    try{return !!(db&&typeof isDevMode==='function'&&isDevMode())}
    catch(_){return false}
  }

  function toast(msg){
    if(typeof showRewardToast==='function')showRewardToast(msg);
    else console.info('[Cikgu Dimensi DEV]',msg);
  }

  function runtimeReady(pilot){
    return pilot
      ? !!(window.PADimensionalView&&typeof window.PADimensionalView.start==='function')
      : !!(window.PADimensionalLab&&typeof window.PADimensionalLab.start==='function');
  }

  function updateStatus(){
    const el=document.getElementById('devDimensiRuntimeStatus');if(!el)return;
    const lab=runtimeReady(false),pilot=runtimeReady(true);
    el.textContent=lab&&pilot?'Runtime siap':'Runtime sedang dimuat…';
    el.classList.toggle('good',lab&&pilot);
  }

  function waitForRuntime(pilot,done,attempt=0){
    if(runtimeReady(pilot)){done();return}
    updateStatus();
    if(attempt>=50){
      toast('Runtime Cikgu Dimensi belum siap. Tutup DEV dan buka semula.');
      return;
    }
    setTimeout(()=>waitForRuntime(pilot,done,attempt+1),100);
  }

  function setDevGradeThree(){
    const grade=document.getElementById('devGrade');
    if(grade)grade.value='3';
    if(typeof devChangeGrade==='function'){
      try{devChangeGrade('3')}catch(err){console.warn('DEV grade setup gagal',err)}
    }
  }

  function prepareBattle(skillId,done){
    if(!devActive()){toast('Cikgu Dimensi Lab hanya untuk DEV Mode.');return}

    // Reuse the existing DEV skill launcher so the preview gets a real battle/session
    // context instead of inventing a parallel battle path.
    setDevGradeThree();

    setTimeout(()=>{
      const skill=document.getElementById('devSkill');
      if(skill){
        const exists=[...skill.options].some(o=>o.value===skillId);
        if(exists)skill.value=skillId;
      }

      if(typeof startDevSkill!=='function'||!skill||skill.value!==skillId){
        toast(`DEV launcher tak dapat sediakan ${skillId}.`);
        return;
      }

      try{startDevSkill()}
      catch(err){
        console.error('Cikgu Dimensi DEV battle setup gagal',err);
        toast('Battle DEV gagal dimulakan.');
        return;
      }

      setTimeout(()=>{
        if(typeof closeDevPanel==='function')closeDevPanel();
        if(typeof screen==='function')screen('game');
        done();
      },140);
    },0);
  }

  function startPilot(){
    prepareBattle('D3.SUB10000',()=>{
      const q=(typeof sess!=='undefined'&&sess?.q)||{token:`DEV-${Date.now()}`};
      const ok=window.PADimensionalView.start({
        prototypeId:PILOT,
        skillId:'D3.SUB10000',
        misconceptionId:'PV-005',
        diagnosticConfidence:'DEV_PREVIEW',
        evidenceCount:2,
        question:q
      });
      if(!ok)toast('Y3-PV-A2 preview tak dapat dimulakan.');
    });
  }

  function startLab(key,skillId){
    prepareBattle(skillId,()=>{
      const ok=window.PADimensionalLab.start(key);
      if(!ok)toast(`Dimensi ${key} tak dapat dimulakan.`);
    });
  }

  function open(key){
    const spec=LABS.find(x=>x.key===key);
    if(!spec)return;
    waitForRuntime(!!spec.pilot,()=>spec.pilot?startPilot():startLab(spec.key,spec.skillId));
  }

  function ensureControls(){
    const panel=document.getElementById('devPanel');
    if(!panel||panel.querySelector('[data-pa-dimensi-dev="3.24.10"]')){updateStatus();return}

    const box=document.createElement('div');
    box.className='devScenario paDevDimensiLab';
    box.dataset.paDimensiDev=VERSION;
    box.innerHTML=`
      <b>Cikgu Dimensi Lab</b>
      <p class="mut devMiniCopy">Preview terus flow Cikgu Dimensi. Y3-PV-A2 ialah live pilot; butang DEV ini bypass syarat 2 evidence untuk tujuan visual QA sahaja. Flow lain kekal manual/DEV dan tidak mengubah auto-routing production.</p>
      <div class="devLabGrid" id="devDimensiGrid"></div>
      <small id="devDimensiRuntimeStatus" class="mut">Runtime sedang dimuat…</small>`;

    const visual=[...panel.querySelectorAll('.devScenario')].find(x=>/Visual Coach Lab/.test(x.textContent||''));
    if(visual)visual.insertAdjacentElement('afterend',box);
    else{
      const terrain=[...panel.querySelectorAll('.devScenario')].find(x=>/Terrain Preview/.test(x.textContent||''));
      if(terrain)panel.insertBefore(box,terrain);else panel.appendChild(box);
    }

    const grid=box.querySelector('#devDimensiGrid');
    LABS.forEach(spec=>{
      const b=document.createElement('button');
      b.type='button';
      b.className=spec.pilot?'btn devPrimary small':'btn ghost small';
      b.textContent=spec.label;
      if(spec.pilot)b.title='Direct DEV preview: bypass evidence gate; production evidence routing unchanged.';
      b.onclick=()=>open(spec.key);
      grid.appendChild(b);
    });
    updateStatus();
    setTimeout(updateStatus,350);
  }

  const previousRenderDev=window.renderDevPanel;
  if(typeof previousRenderDev==='function'&&!previousRenderDev.__paDimensiDevWrapped){
    const wrapped=function(){
      const out=previousRenderDev.apply(this,arguments);
      ensureControls();
      return out;
    };
    wrapped.__paDimensiDevWrapped=true;
    wrapped.__paDimensiDevOriginal=previousRenderDev;
    window.renderDevPanel=wrapped;
  }

  window.PADevCikguDimensi={
    version:VERSION,
    labs:LABS.map(x=>({...x})),
    open,
    ensureControls,
    runtimeReady
  };

  ensureControls();
  setTimeout(updateStatus,500);
})();
