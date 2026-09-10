/* Cikgu Dimensi runtime bootstrap + DEV launcher v3.24.12.
 * The legacy filename is retained because index.html and the offline shell already
 * reference it. Production bootstrap is always active; DEV controls remain DEV-only.
 */
(()=>{
  'use strict';
  const VERSION='3.24.12',PILOT='Y3-PV-A2',PILOT_SKILL='D3.SUB10000',MISCONCEPTION_ID='PV-005';
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
    {key:PILOT,label:'Y3-PV-A2 · Regrouping',skillId:PILOT_SKILL,pilot:true},
    {key:'fraction-equivalence',label:'Pecahan Setara',skillId:'D3.FRAC'},
    {key:'division-meaning',label:'Bahagi · Kongsi vs Kumpulan',skillId:'D3.DIV'},
    {key:'word-problem-bar',label:'Masalah Berayat · Bar',skillId:PILOT_SKILL},
    {key:'multiply-decompose',label:'Darab · Pecah Susunan',skillId:'D3.MUL'},
    {key:'make-ten',label:'Make Ten',skillId:'D3.ADD10000'},
    {key:'compensation',label:'Compensation',skillId:'D3.ADD10000'},
    {key:'difference-count-up',label:'Tolak · Cari Beza',skillId:PILOT_SKILL},
    {key:'scale-ten',label:'×10 / ÷10 Nilai Tempat',skillId:'D3.PV10000'}
  ];

  function devActive(){try{return !!(typeof db!=='undefined'&&typeof isDevMode==='function'&&isDevMode())}catch(_){return false}}
  function getDb(){try{if(typeof db!=='undefined')return db}catch(_){ }return window.db||null}
  function saveDb(){try{if(typeof save==='function')save()}catch(_){ }}
  function toast(msg){if(typeof showRewardToast==='function')showRewardToast(msg);else console.info('[Cikgu Dimensi]',msg)}
  function addCss(href){if(document.querySelector(`link[data-pa-dimensi-css="${href}"]`))return;const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.dataset.paDimensiCss=href;document.head.appendChild(l)}
  function loadScript(src){return new Promise((resolve,reject)=>{if(document.querySelector(`script[data-pa-dimensi-src="${src}"]`)){resolve();return}const s=document.createElement('script');s.src=src;s.async=false;s.dataset.paDimensiSrc=src;s.onload=resolve;s.onerror=()=>reject(new Error(`Gagal memuat ${src}`));document.head.appendChild(s)})}
  async function loadList(list){for(const src of list)await loadScript(src)}

  function plainPrompt(q){return String(q?.prompt||'').replace(/<[^>]*>/g,' ').replace(/&minus;|&#8722;/gi,'−').replace(/\s+/g,' ').trim()}
  function qsv2RegroupOperands(q){
    if(!q||String(q.source||'').toLowerCase()!=='qsv2')return null;
    if(String(q.legacySkillId||q.skill||'')!==PILOT_SKILL)return null;
    const identity=`${q.templateId||''} ${q.archetypeId||''} ${q.competencyId||''}`.toLowerCase();
    if(!/(direct[_-]?subtract|211-direct_subtract)/.test(identity))return null;
    const match=plainPrompt(q).match(/^(\d+)\s*[−-]\s*(\d+)\s*=\s*\?$/);if(!match)return null;
    const minuend=Number(match[1]),subtrahend=Number(match[2]);
    if(!Number.isInteger(minuend)||!Number.isInteger(subtrahend)||minuend<=subtrahend)return null;
    if(!window.PAPlaceValueEngine?.onesRegroupRequired?.(minuend,subtrahend))return null;
    return{minuend,subtrahend};
  }
  function qsv2EvidenceNode(){return window.PADimensionalMemory?.ensureMisconception?.(MISCONCEPTION_ID,'subtraction_regrouping')||null}
  function qsv2History(){return getDb()?.skills?.[PILOT_SKILL]||{}}
  function recordQsv2Evidence(q,o,sec){
    const operands=qsv2RegroupOperands(q);if(!operands)return null;
    const itemId=String(q.qsv2AttemptId||q.token||`${operands.minuend}-${operands.subtrahend}`);
    const result=window.PADimensionalMemory?.recordEvidence?.({conceptId:'subtraction_regrouping',skillId:PILOT_SKILL,misconceptionId:MISCONCEPTION_ID,itemId,tag:o?.tag||null,type:'REGROUPING_OBSERVED',distinctItem:true,context:'natural-assessment'});
    if(result?.added){try{window.PATelemetry?.record?.('dv_qsv2_evidence',{prototypeId:PILOT,skillId:PILOT_SKILL,context:'natural-assessment',latencyBand:Number(sec)<1.15?'RAPID':Number(sec)>12?'EXTENDED':'NORMAL',evidenceCount:result.independentEvidenceCount})}catch(_){ }saveDb()}
    return result;
  }
  function evaluateQsv2Entry(q){
    const operands=qsv2RegroupOperands(q);if(!operands)return null;
    const node=qsv2EvidenceNode(),evidence=(node?.evidence||[]).filter(x=>x.context==='natural-assessment');
    const count=Number(node?.independentEvidenceCount||0),distinct=new Set(evidence.map(x=>x.itemId)).size;
    const confirmedPattern=evidence.filter(x=>x.type==='REGROUPING_PATTERN').length;
    const diagnosis=window.PADimensionalCatalog?.diagnoseRegrouping?.({wrongEvidenceCount:count,distinctWrongItems:distinct,samePatternCount:confirmedPattern,history:qsv2History()})||{failureType:'UNKNOWN',confidence:0,needsDiscriminator:true};
    const threshold=Math.max(2,Number(window.DIMENSIONAL_VIEW_CFG?.evidenceThreshold||2));
    if(diagnosis.failureType!=='CARELESS_RECHECK'&&count<threshold)return null;
    return{prototypeId:PILOT,skillId:PILOT_SKILL,diagnosis,evidenceCount:count,question:q,qsv2:true,operands};
  }
  function installQsv2Adapter(){
    const original=window.beginHintRetry;if(typeof original!=='function'||original.__paDimensiQsv2)return;
    const wrapped=function(o,btn,q){
      const out=original.apply(this,arguments);
      try{
        const s=typeof sess!=='undefined'?sess:window.sess;
        if(!s?.dimension?.active&&qsv2RegroupOperands(q)){
          const sec=s?.retryState?.firstSeconds??0;recordQsv2Evidence(q,o,sec);
          const entry=evaluateQsv2Entry(q);if(entry)window.PADimensionalView?.start?.(entry);
        }
      }catch(err){console.warn('Cikgu Dimensi QSV2 routing gagal',err)}
      return out;
    };
    wrapped.__paDimensiQsv2=true;wrapped.__paDimensiQsv2Original=original;window.beginHintRetry=wrapped;
  }

  let corePromise=null,devPromise=null;
  function ensureCore(){if(corePromise)return corePromise;CSS.forEach(addCss);corePromise=loadList(CORE).then(()=>{window.PADimensionalView?.installAdapters?.();installQsv2Adapter();updateStatus();return true}).catch(err=>{console.error('Cikgu Dimensi bootstrap gagal',err);updateStatus();return false});return corePromise}
  function ensureDev(){if(devPromise)return devPromise;devPromise=ensureCore().then(ok=>ok?loadList(DEV_EXTRA):false).then(()=>{updateStatus();return true}).catch(err=>{console.warn('Cikgu Dimensi DEV extras gagal',err);return false});return devPromise}
  function runtimeReady(pilot){return pilot?!!(window.PADimensionalView&&typeof window.PADimensionalView.start==='function'):!!(window.PADimensionalLab&&typeof window.PADimensionalLab.start==='function')}
  function updateStatus(){const el=document.getElementById('devDimensiRuntimeStatus');if(!el)return;const core=runtimeReady(true),lab=runtimeReady(false);el.textContent=core?(lab?'Runtime siap':'Pilot production siap · DEV labs sedang dimuat…'):'Runtime sedang dimuat…';el.classList.toggle('good',core)}
  function waitForRuntime(pilot,done,attempt=0){const load=pilot?ensureCore():ensureDev();load.then(()=>{if(runtimeReady(pilot)){done();return}if(attempt>=25){toast('Runtime Cikgu Dimensi belum siap.');return}setTimeout(()=>waitForRuntime(pilot,done,attempt+1),100)})}
  function setDevGradeThree(){const grade=document.getElementById('devGrade');if(grade)grade.value='3';if(typeof devChangeGrade==='function')try{devChangeGrade('3')}catch(err){console.warn('DEV grade setup gagal',err)}}
  function prepareBattle(skillId,done){if(!devActive()){toast('Cikgu Dimensi Lab hanya untuk DEV Mode.');return}setDevGradeThree();setTimeout(()=>{const skill=document.getElementById('devSkill');if(skill){const exists=[...skill.options].some(o=>o.value===skillId);if(exists)skill.value=skillId}if(typeof startDevSkill!=='function'||!skill||skill.value!==skillId){toast(`DEV launcher tak dapat sediakan ${skillId}.`);return}try{startDevSkill()}catch(err){console.error('Cikgu Dimensi DEV battle setup gagal',err);toast('Battle DEV gagal dimulakan.');return}setTimeout(()=>{if(typeof closeDevPanel==='function')closeDevPanel();if(typeof screen==='function')screen('game');done()},140)},0)}
  function startPilot(){prepareBattle(PILOT_SKILL,()=>{const q=(typeof sess!=='undefined'&&sess?.q)||{token:`DEV-${Date.now()}`};const ok=window.PADimensionalView.start({prototypeId:PILOT,skillId:PILOT_SKILL,evidenceCount:2,diagnosis:{failureType:'UNKNOWN',confidence:.55,needsDiscriminator:true},question:q});if(!ok)toast('Y3-PV-A2 preview tak dapat dimulakan.')})}
  function startLab(key,skillId){prepareBattle(skillId,()=>{const ok=window.PADimensionalLab.start(key);if(!ok)toast(`Dimensi ${key} tak dapat dimulakan.`)})}
  function open(key){const spec=LABS.find(x=>x.key===key);if(!spec)return;waitForRuntime(!!spec.pilot,()=>spec.pilot?startPilot():startLab(spec.key,spec.skillId))}
  function ensureControls(){const panel=document.getElementById('devPanel');if(!panel||!devActive()||panel.querySelector('[data-pa-dimensi-dev="3.24.12"]')){updateStatus();return}const box=document.createElement('div');box.className='devScenario paDevDimensiLab';box.dataset.paDimensiDev=VERSION;box.innerHTML='<b>Cikgu Dimensi Lab</b><p class="mut devMiniCopy">Y3-PV-A2 menggunakan runtime production. Butang DEV memintas evidence gate hanya untuk visual QA.</p><div class="devLabGrid" id="devDimensiGrid"></div><small id="devDimensiRuntimeStatus" class="mut">Runtime sedang dimuat…</small>';const visual=[...panel.querySelectorAll('.devScenario')].find(x=>/Visual Coach Lab/.test(x.textContent||''));if(visual)visual.insertAdjacentElement('afterend',box);else panel.appendChild(box);const grid=box.querySelector('#devDimensiGrid');LABS.forEach(spec=>{const b=document.createElement('button');b.type='button';b.className=spec.pilot?'btn devPrimary small':'btn ghost small';b.textContent=spec.label;b.onclick=()=>open(spec.key);grid.appendChild(b)});ensureDev();updateStatus()}
  const previousRenderDev=window.renderDevPanel;if(typeof previousRenderDev==='function'&&!previousRenderDev.__paDimensiDevWrapped){const wrapped=function(){const out=previousRenderDev.apply(this,arguments);ensureControls();return out};wrapped.__paDimensiDevWrapped=true;wrapped.__paDimensiDevOriginal=previousRenderDev;window.renderDevPanel=wrapped}
  window.PADevCikguDimensi={version:VERSION,labs:LABS.map(x=>({...x})),open,ensureControls,runtimeReady,ensureCore,qsv2RegroupOperands,evaluateQsv2Entry,installQsv2Adapter};
  ensureCore();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureControls,{once:true});else ensureControls();
})();