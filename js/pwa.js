// Pahlawan Angka release loader.
(()=>{
  const APP_VERSION='3.21.8';
  const INTEGRITY_VERSION='3.18.1';
  const SENSORY_VERSION='3.19.0';
  const MANIPULATIVE_VERSION='3.19.1';
  const DAILY_REVIEW_VERSION='3.20.0';
  const DEV_EXPERIMENTS_VERSION='3.21.2';
  const COMBAT_POLISH_VERSION='3.21.3';
  const BOSS_LAB_VERSION='3.21.4';
  const TARGET_ANCHOR_VERSION='3.21.5';
  const FINISHER_HOTSPOT_VERSION='3.21.6';
  const TYPED_UI_VERSION='3.21.8';
  const guard=`questions/kssr-content-integrity-v${INTEGRITY_VERSION}.js?v=${INTEGRITY_VERSION}`;
  const sensoryCss=`css/sensory-learning-v${SENSORY_VERSION}.css?v=${SENSORY_VERSION}`;
  const sensoryJs=`js/sensory-learning-v${SENSORY_VERSION}.js?v=${SENSORY_VERSION}`;
  const manipCss=`css/cikgu-manipulatives-v${MANIPULATIVE_VERSION}.css?v=${MANIPULATIVE_VERSION}`;
  const manipJs=`js/cikgu-manipulatives-v${MANIPULATIVE_VERSION}.js?v=${MANIPULATIVE_VERSION}`;
  const dailyCss=`css/daily-spaced-review-v${DAILY_REVIEW_VERSION}.css?v=${DAILY_REVIEW_VERSION}`;
  const dailyJs=`js/daily-spaced-review-v${DAILY_REVIEW_VERSION}.js?v=${DAILY_REVIEW_VERSION}`;
  const devCss=`css/dev-experiments-v${DEV_EXPERIMENTS_VERSION}.css?v=${DEV_EXPERIMENTS_VERSION}`;
  const devJs=`js/dev-experiments-v${DEV_EXPERIMENTS_VERSION}.js?v=${DEV_EXPERIMENTS_VERSION}`;
  const combatCss=`css/combat-polish-v${COMBAT_POLISH_VERSION}.css?v=${COMBAT_POLISH_VERSION}`;
  const combatJs=`js/combat-polish-v${COMBAT_POLISH_VERSION}.js?v=${COMBAT_POLISH_VERSION}`;
  const bossCss=`css/boss-stage-dev-v${BOSS_LAB_VERSION}.css?v=${BOSS_LAB_VERSION}`;
  const bossJs=`js/dev-boss-lab-v${BOSS_LAB_VERSION}.js?v=${BOSS_LAB_VERSION}`;
  const targetCss=`css/combat-target-anchor-v${TARGET_ANCHOR_VERSION}.css?v=${TARGET_ANCHOR_VERSION}`;
  const targetJs=`js/combat-target-anchor-v${TARGET_ANCHOR_VERSION}.js?v=${TARGET_ANCHOR_VERSION}`;
  const finisherCss=`css/finisher-alpha-hotspots-v${FINISHER_HOTSPOT_VERSION}.css?v=${FINISHER_HOTSPOT_VERSION}`;
  const finisherJs=`js/finisher-alpha-hotspots-v${FINISHER_HOTSPOT_VERSION}.js?v=${FINISHER_HOTSPOT_VERSION}`;
  const typedCss=`css/typed-answer-ui-v${TYPED_UI_VERSION}.css?v=${TYPED_UI_VERSION}`;
  const typedJs=`js/typed-answer-ui-v${TYPED_UI_VERSION}.js?v=${TYPED_UI_VERSION}`;

  if(document.readyState==='loading'){
    if(!document.querySelector(`script[src^="questions/kssr-content-integrity-v${INTEGRITY_VERSION}.js"]`))document.write(`<script src="${guard}"><\/script>`);
    if(!document.querySelector(`link[href^="css/sensory-learning-v${SENSORY_VERSION}.css"]`))document.write(`<link rel="stylesheet" href="${sensoryCss}">`);
    if(!document.querySelector(`script[src^="js/sensory-learning-v${SENSORY_VERSION}.js"]`))document.write(`<script src="${sensoryJs}"><\/script>`);
    if(!document.querySelector(`link[href^="css/cikgu-manipulatives-v${MANIPULATIVE_VERSION}.css"]`))document.write(`<link rel="stylesheet" href="${manipCss}">`);
    if(!document.querySelector(`script[src^="js/cikgu-manipulatives-v${MANIPULATIVE_VERSION}.js"]`))document.write(`<script src="${manipJs}"><\/script>`);
    if(!document.querySelector(`link[href^="css/daily-spaced-review-v${DAILY_REVIEW_VERSION}.css"]`))document.write(`<link rel="stylesheet" href="${dailyCss}">`);
    if(!document.querySelector(`script[src^="js/daily-spaced-review-v${DAILY_REVIEW_VERSION}.js"]`))document.write(`<script src="${dailyJs}"><\/script>`);
    if(!document.querySelector(`link[href^="css/dev-experiments-v${DEV_EXPERIMENTS_VERSION}.css"]`))document.write(`<link rel="stylesheet" href="${devCss}">`);
    if(!document.querySelector(`script[src^="js/dev-experiments-v${DEV_EXPERIMENTS_VERSION}.js"]`))document.write(`<script src="${devJs}"><\/script>`);
    if(!document.querySelector(`link[href^="css/combat-polish-v${COMBAT_POLISH_VERSION}.css"]`))document.write(`<link rel="stylesheet" href="${combatCss}">`);
    if(!document.querySelector(`script[src^="js/combat-polish-v${COMBAT_POLISH_VERSION}.js"]`))document.write(`<script src="${combatJs}"><\/script>`);
    if(!document.querySelector(`link[href^="css/boss-stage-dev-v${BOSS_LAB_VERSION}.css"]`))document.write(`<link rel="stylesheet" href="${bossCss}">`);
    if(!document.querySelector(`script[src^="js/dev-boss-lab-v${BOSS_LAB_VERSION}.js"]`))document.write(`<script src="${bossJs}"><\/script>`);
    if(!document.querySelector(`link[href^="css/combat-target-anchor-v${TARGET_ANCHOR_VERSION}.css"]`))document.write(`<link rel="stylesheet" href="${targetCss}">`);
    if(!document.querySelector(`script[src^="js/combat-target-anchor-v${TARGET_ANCHOR_VERSION}.js"]`))document.write(`<script src="${targetJs}"><\/script>`);
    if(!document.querySelector(`link[href^="css/finisher-alpha-hotspots-v${FINISHER_HOTSPOT_VERSION}.css"]`))document.write(`<link rel="stylesheet" href="${finisherCss}">`);
    if(!document.querySelector(`script[src^="js/finisher-alpha-hotspots-v${FINISHER_HOTSPOT_VERSION}.js"]`))document.write(`<script src="${finisherJs}"><\/script>`);
    if(!document.querySelector(`link[href^="css/typed-answer-ui-v${TYPED_UI_VERSION}.css"]`))document.write(`<link rel="stylesheet" href="${typedCss}">`);
    if(!document.querySelector(`script[src^="js/typed-answer-ui-v${TYPED_UI_VERSION}.js"]`))document.write(`<script src="${typedJs}"><\/script>`);
  }else{
    const loadCss=(src,selector)=>{if(document.querySelector(selector))return;const l=document.createElement('link');l.rel='stylesheet';l.href=src;document.head.appendChild(l);};
    const loadScript=(src,selector,onload)=>{if(document.querySelector(selector)){onload?.();return}const s=document.createElement('script');s.src=src;s.async=false;if(onload)s.onload=onload;document.head.appendChild(s);};
    const loadTyped=()=>{loadCss(typedCss,`link[href^="css/typed-answer-ui-v${TYPED_UI_VERSION}.css"]`);loadScript(typedJs,`script[src^="js/typed-answer-ui-v${TYPED_UI_VERSION}.js"]`);};
    const loadFinisher=()=>{loadCss(finisherCss,`link[href^="css/finisher-alpha-hotspots-v${FINISHER_HOTSPOT_VERSION}.css"]`);loadScript(finisherJs,`script[src^="js/finisher-alpha-hotspots-v${FINISHER_HOTSPOT_VERSION}.js"]`,loadTyped);};
    const loadTarget=()=>{loadCss(targetCss,`link[href^="css/combat-target-anchor-v${TARGET_ANCHOR_VERSION}.css"]`);loadScript(targetJs,`script[src^="js/combat-target-anchor-v${TARGET_ANCHOR_VERSION}.js"]`,loadFinisher);};
    const loadBoss=()=>{loadCss(bossCss,`link[href^="css/boss-stage-dev-v${BOSS_LAB_VERSION}.css"]`);loadScript(bossJs,`script[src^="js/dev-boss-lab-v${BOSS_LAB_VERSION}.js"]`,loadTarget);};
    const loadCombat=()=>{loadCss(combatCss,`link[href^="css/combat-polish-v${COMBAT_POLISH_VERSION}.css"]`);loadScript(combatJs,`script[src^="js/combat-polish-v${COMBAT_POLISH_VERSION}.js"]`,loadBoss);};
    const loadDev=()=>{loadCss(devCss,`link[href^="css/dev-experiments-v${DEV_EXPERIMENTS_VERSION}.css"]`);loadScript(devJs,`script[src^="js/dev-experiments-v${DEV_EXPERIMENTS_VERSION}.js"]`,loadCombat);};
    const loadDaily=()=>{loadCss(dailyCss,`link[href^="css/daily-spaced-review-v${DAILY_REVIEW_VERSION}.css"]`);loadScript(dailyJs,`script[src^="js/daily-spaced-review-v${DAILY_REVIEW_VERSION}.js"]`,loadDev);};
    const loadManip=()=>{loadCss(manipCss,`link[href^="css/cikgu-manipulatives-v${MANIPULATIVE_VERSION}.css"]`);loadScript(manipJs,`script[src^="js/cikgu-manipulatives-v${MANIPULATIVE_VERSION}.js"]`,loadDaily);};
    const loadSensory=()=>{loadCss(sensoryCss,`link[href^="css/sensory-learning-v${SENSORY_VERSION}.css"]`);loadScript(sensoryJs,`script[src^="js/sensory-learning-v${SENSORY_VERSION}.js"]`,loadManip);};
    loadScript(guard,`script[src^="questions/kssr-content-integrity-v${INTEGRITY_VERSION}.js"]`,loadSensory);
  }

  window.PARelease={version:APP_VERSION,integrity:INTEGRITY_VERSION,sensory:SENSORY_VERSION,manipulatives:MANIPULATIVE_VERSION,dailyReview:DAILY_REVIEW_VERSION,devExperiments:DEV_EXPERIMENTS_VERSION,combatPolish:COMBAT_POLISH_VERSION,bossLab:BOSS_LAB_VERSION,targetAnchor:TARGET_ANCHOR_VERSION,finisherHotspots:FINISHER_HOTSPOT_VERSION,typedAnswerUI:TYPED_UI_VERSION};
})();

(()=>{
  if(!('serviceWorker' in navigator))return;
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(registration=>{
      registration.update().catch(()=>{});
      document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')registration.update().catch(()=>{});});
    }).catch(error=>console.warn('PWA service worker tidak dapat didaftarkan:',error));
  });
})();
