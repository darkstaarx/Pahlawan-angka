/* Cikgu Dimensi runtime bootstrap + DEV launcher v3.24.11.
 * The legacy filename is retained because index.html and the offline shell already
 * reference it. Production bootstrap is always active; DEV controls remain DEV-only.
 */
(()=>{
  'use strict';
  const VERSION='3.24.11',PILOT='Y3-PV-A2';
  const CORE=[
    'js/engine/dimensional-memory.js',
    'js/engine/dimensional-portal.js',
    'js/engine/representations/place-value.js',
    'js/engine/dimensional-catalog.js',
    'js/engine/dimensional-view.js'
  ];
  const DEV_EXTRA=[
    'js/engine/representations/fraction-area.js','js/engine/representations/number-line.js',
    'js/engine/representations/grouping-array.js','js/engine/representations/number-bond.js',
    'js/engine/representations/bar-relational.js','js/engine/dimensional-lab.js'
  ];
  const CSS=['css/cikgu-dimensi-core-v0.2.css','css/cikgu-dimensi-place-value-v0.1.css'];
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

  function devActive(){try{return !!(typeof db!=='undefined'&&typeof isDevMode==='function'&&isDevMode())}catch(_){return false}}
  function toast(msg){if(typeof showRewardToast==='function')showRewardToast(msg);else console.info('[Cikgu Dimensi]',msg)}
  function addCss(href){if(document.querySelector(`link[data-pa-dimensi-css="${href}"]`))return;const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.dataset.paDimensiCss=href;document.head.appendChild(l)}
  function loadScript(src){return new Promise((resolve,reject)=>{if(document.querySelector(`script[data-pa-dimensi-src="${src}"]`)){resolve();return}const s=document.createElement('script');s.src=src;s.async=false;s.dataset.paDimensiSrc=src;s.onload=resolve;s.onerror=()=>reject(new Error(`Gagal memuat ${src}`));document.head.appendChild(s)})}
  async function loadList(list){for(const src of list)await loadScript(src)}
  let corePromise=null,devPromise=null;
  function ensureCore(){if(corePromise)return corePromise;CSS.forEach(addCss);corePromise=loadList(CORE).then(()=>{window.PADimensionalView?.installAdapters?.();updateStatus();return true}).catch(err=>{console.error('Cikgu Dimensi bootstrap gagal',err);updateStatus();return false});return corePromise}
  function ensureDev(){if(devPromise)return devPromise;devPromise=ensureCore().then(ok=>ok?loadList(DEV_EXTRA):false).then(()=>{updateStatus();return true}).catch(err=>{console.warn('Cikgu Dimensi DEV extras gagal',err);return false});return devPromise}
  function runtimeReady(pilot){return pilot?!!(window.PADimensionalView&&typeof window.PADimensionalView.start==='function'):!!(window.PADimensionalLab&&typeof window.PADimensionalLab.start==='function')}
  function updateStatus(){const el=document.getElementById('devDimensiRuntimeStatus');if(!el)return;const core=runtimeReady(true),lab=runtimeReady(false);el.textContent=core?(lab?'Runtime siap':'Pilot production siap · DEV labs sedang dimuat…'):'Runtime sedang dimuat…';el.classList.toggle('good',core)}
  function waitForRuntime(pilot,done,attempt=0){const load=pilot?ensureCore():ensureDev();load.then(()=>{if(runtimeReady(pilot)){done();return}if(attempt>=25){toast('Runtime Cikgu Dimensi belum siap.');return}setTimeout(()=>waitForRuntime(pilot,done,attempt+1),100)})}
  function setDevGradeThree(){const grade=document.getElementById('devGrade');if(grade)grade.value='3';if(typeof devChangeGrade==='function')try{devChangeGrade('3')}catch(err){console.warn('DEV grade setup gagal',err)}}
  function prepareBattle(skillId,done){if(!devActive()){toast('Cikgu Dimensi Lab hanya untuk DEV Mode.');return}setDevGradeThree();setTimeout(()=>{const skill=document.getElementById('devSkill');if(skill){const exists=[...skill.options].some(o=>o.value===skillId);if(exists)skill.value=skillId}if(typeof startDevSkill!=='function'||!skill||skill.value!==skillId){toast(`DEV launcher tak dapat sediakan ${skillId}.`);return}try{startDevSkill()}catch(err){console.error('Cikgu Dimensi DEV battle setup gagal',err);toast('Battle DEV gagal dimulakan.');return}setTimeout(()=>{if(typeof closeDevPanel==='function')closeDevPanel();if(typeof screen==='function')screen('game');done()},140)},0)}
  function startPilot(){prepareBattle('D3.SUB10000',()=>{const q=(typeof sess!=='undefined'&&sess?.q)||{token:`DEV-${Date.now()}`};const ok=window.PADimensionalView.start({prototypeId:PILOT,skillId:'D3.SUB10000',evidenceCount:2,diagnosis:{failureType:'UNKNOWN',confidence:.55,needsDiscriminator:true},question:q});if(!ok)toast('Y3-PV-A2 preview tak dapat dimulakan.')})}
  function startLab(key,skillId){prepareBattle(skillId,()=>{const ok=window.PADimensionalLab.start(key);if(!ok)toast(`Dimensi ${key} tak dapat dimulakan.`)})}
  function open(key){const spec=LABS.find(x=>x.key===key);if(!spec)return;waitForRuntime(!!spec.pilot,()=>spec.pilot?startPilot():startLab(spec.key,spec.skillId))}
  function ensureControls(){const panel=document.getElementById('devPanel');if(!panel||!devActive()||panel.querySelector('[data-pa-dimensi-dev="3.24.11"]')){updateStatus();return}const box=document.createElement('div');box.className='devScenario paDevDimensiLab';box.dataset.paDimensiDev=VERSION;box.innerHTML='<b>Cikgu Dimensi Lab</b><p class="mut devMiniCopy">Y3-PV-A2 menggunakan runtime production. Butang DEV memintas evidence gate hanya untuk visual QA.</p><div class="devLabGrid" id="devDimensiGrid"></div><small id="devDimensiRuntimeStatus" class="mut">Runtime sedang dimuat…</small>';const visual=[...panel.querySelectorAll('.devScenario')].find(x=>/Visual Coach Lab/.test(x.textContent||''));if(visual)visual.insertAdjacentElement('afterend',box);else panel.appendChild(box);const grid=box.querySelector('#devDimensiGrid');LABS.forEach(spec=>{const b=document.createElement('button');b.type='button';b.className=spec.pilot?'btn devPrimary small':'btn ghost small';b.textContent=spec.label;b.onclick=()=>open(spec.key);grid.appendChild(b)});ensureDev();updateStatus()}
  const previousRenderDev=window.renderDevPanel;if(typeof previousRenderDev==='function'&&!previousRenderDev.__paDimensiDevWrapped){const wrapped=function(){const out=previousRenderDev.apply(this,arguments);ensureControls();return out};wrapped.__paDimensiDevWrapped=true;wrapped.__paDimensiDevOriginal=previousRenderDev;window.renderDevPanel=wrapped}
  window.PADevCikguDimensi={version:VERSION,labs:LABS.map(x=>({...x})),open,ensureControls,runtimeReady,ensureCore};
  ensureCore();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureControls,{once:true});else ensureControls();
})();
