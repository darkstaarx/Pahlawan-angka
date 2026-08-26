// App shell v3.52.8 — Sidma cinematic scale lock and alternating dash-impact Skill 2. Curriculum systems unchanged.
importScripts('./js/version.js');
const CACHE_NAME=`pahlawan-angka-v${self.PA_APP_VERSION}`;
const APP_SHELL=[
  './','./index.html','./manifest.webmanifest','./js/version.js',
  './css/action-variety-v3.30.0.css','./js/action-variety-v3.30.0.js',
  './css/hero-sidma-v1.0.0.css','./js/hero-sidma-v1.0.0.js','./css/hub-hero-switch-v1.0.0.css','./js/hub-hero-switch-v1.0.0.js',
  './assets/heroes/sidma/idle.webp','./assets/heroes/sidma/frames/attack-stance-v1.webp','./assets/heroes/sidma/frames/cast-start-v1.webp','./assets/heroes/sidma/frames/release-v1.webp','./assets/heroes/sidma/frames/recovery-v1.webp','./assets/heroes/sidma/frames/finisher-focus-eyes-closed-v1.webp','./assets/heroes/sidma/frames/skill2-dash-v1.webp','./assets/heroes/sidma/frames/skill2-impact-v1.webp',
  './assets/heroes/sidma/hub/adventure-v1.webp','./assets/ui/coin-gold.svg','./assets/heroes/sidma/profile-happy-v1.webp','./assets/fx/hub/sidma-math-sigma-v1.webp',
  './assets/fx/sidma/rumus-sigma/fx_sidma_charge.webp','./assets/fx/sidma/rumus-sigma/fx_sigma_projectile.webp','./assets/fx/sidma/rumus-sigma/fx_sigma_impact.webp','./assets/fx/sidma/rumus-sigma/fx_sigma_impact_end.webp',
  './css/effort-restu-v3.32.0.css','./js/effort-guard-v3.32.0.js',
  './assets/heroes/wira/attack.webp','./assets/heroes/wira/frames/attack-dash-v2.webp','./assets/heroes/wira/frames/attack-arc-v2.webp','./assets/heroes/wira/frames/attack-pulse-v2.webp',
  './assets/heroes/bunga/attack.webp','./assets/heroes/bunga/frames/attack-stance-aura-v4.webp','./assets/heroes/bunga/frames/attack-movement-portal-v4.webp','./assets/heroes/bunga/frames/attack-addition-v4.webp','./assets/heroes/bunga/frames/attack-subtraction-v4.webp','./assets/heroes/bunga/frames/attack-division-v4.webp',
  './assets/icons/pa-192.png','./assets/icons/pa-512.png','./assets/icons/pa-maskable-512.png',
  './assets/branding/login-scene-v2.webp','./assets/ui/login/student-crest.svg','./assets/ui/login/guardian-crest.svg',
  './assets/battlefields/forest-temple/arena-v1.webp','./assets/battlefields/cave-temple/arena-depth-v2.webp','./assets/battlefields/nusantara-temple/arena-v1.webp',
  './assets/battlefields/operations-forge/arena-v1.webp','./assets/battlefields/money-market/arena-v1.webp','./assets/battlefields/time-tower/arena-v1.webp','./assets/battlefields/measurement-court/arena-v1.webp','./assets/battlefields/data-observatory/arena-v1.webp',
  './assets/enemies/minions/askabus.webp','./assets/enemies/minions/syilinggit.webp','./assets/enemies/minions/pigiramid.webp',
  './assets/heroes/wira/idle.webp','./assets/heroes/bunga/idle.webp','./assets/heroes/wira/profile-happy-v1.webp','./assets/heroes/bunga/profile-happy-v1.webp',
  './assets/heroes/wira/hub/adventure-v1.webp','./assets/heroes/bunga/hub/adventure-v1.webp','./assets/fx/hub/wira-math-runes-v1.webp','./assets/fx/hub/bunga-fraction-bloom-v1.webp',
  './assets/pets/aurora/hub/adventure-v1.webp','./assets/pets/arif/hub/adventure-v1.webp','./assets/pets/kucing-pembaris/hub/adventure-v1.webp','./assets/pets/tiko/hub/adventure-v1.webp',
  './assets/coach/cikgu-wajar/welcome.webp','./assets/coach/cikgu-dimensi/dimensional-aura.svg','./assets/coach/cikgu-dimensi/dimensional-eye-cutin-v1.webp',
  './css/game.css','./css/commercial-foundation-v3.25.0.css','./css/guardian-onboarding-v3.25.1.css','./css/parent-pin-recovery-v3.27.3.css','./css/google-auth-v3.25.2.css','./css/parent-dashboard-v3.25.4.css','./css/theme-controls-v3.25.5.css','./css/custom-picker-v3.25.6.css','./css/parent-learning-tools-v3.26.0.css','./css/hint-overlay-v3.28.1.css','./css/beta-trust-v3.29.0.css','./css/cloud-auth-v3.15.0.css','./css/visual-coach-v3.16.0.css','./css/finisher-auras-v3.8.7.css','./css/finisher-cinematic-v3.8.8.css','./css/kssr-question-v3.9.0.css',
  './css/phase-3.6.4.css','./css/phase-3.6.6.css','./css/phase-3.6.8-animation.css',
  './css/login-buttons-v3.7.1.css','./css/battlefield-motion-v3.7.2.css','./css/battlefield-depth-v3.7.3.css',
  './css/pet-monster-motion-v3.7.4.css','./css/mobile-battle-v3.7.5.css','./css/combat-fov-v3.7.6.css',
  './css/battle-flow-v3.7.7.css','./css/boss-motion-v3.7.9.css','./css/coach-mascot-v3.8.1.css',
  './css/responsive-modes-v3.8.2.css','./css/pet-sizing-v3.8.21.css','./css/battle-polish-v3.8.22.css',
  './css/battle-scene-v3.8.25.css','./css/coach-teaching-v3.8.26.css','./css/battle-scene-v3.8.27.css',
  './css/battle-scene-v3.8.28.css','./css/pwa-v3.8.29.css','./css/guardian-focus-v3.8.30.css','./css/hero-pose-normalization-v3.8.31.css','./css/battle-fix-v3.9.1.css','./css/battle-fix-v3.11.css','./css/pet-staging-v3.14.3.css',
  './css/sensory-learning-v3.19.0.css','./css/cikgu-manipulatives-v3.19.1.css','./css/daily-spaced-review-v3.20.0.css',
  './css/dev-experiments-v3.21.2.css','./css/combat-polish-v3.21.3.css','./css/boss-stage-dev-v3.21.4.css','./css/combat-target-anchor-v3.21.5.css','./css/finisher-alpha-hotspots-v3.21.6.css','./css/typed-answer-ui-v3.21.8.css',
  './css/kssr-assessment-depth-v3.22.0.css','./css/kssr-year6-space-data-v3.23.0.css','./css/profile-manager-v3.24.2.css',
  './css/unit-grounding-v3.24.5.css','./css/cikgu-dimensi-place-value-v0.1.css','./css/cikgu-dimensi-core-v0.2.css','./css/hub-adventure-v3.24.11.css',
  './data/kssr/knowledge-graph.js','./data/kssr/mastery-knowledge-v1.js','./data/kssr/alignment-v3.9.0.js','./data/kssr/d3-topic7-curriculum-correction-v3.38.0.js','./data/kssr/d3-topic7-evidence-epoch-v3.39.0.js','./data/kssr/d3-topic7-live-cutover-v3.40.0.js','./data/kssr/d3-nonT7-live-isolation-v1.0.0.js',
  './questions/helpers.js','./questions/index.js','./questions/v2/dist/runtime.js','./questions/v2/engine/d3-rollout.js','./questions/v2/engine/legacy-adapter.js','./js/dev-qsv2-v3.36.0.js','./js/dev-qsv2-live-v3.40.0.js','./questions/kssr-archetypes-v3.9.0.js','./questions/kssr-content-v3.11.js','./questions/kssr-content-integrity-v3.18.1.js','./questions/kssr-assessment-depth-v3.22.0.js','./questions/kssr-year6-space-data-v3.23.0.js',
  './questions/d1/core.js','./questions/d2/topic-1.js','./questions/d2/topic-2.js','./questions/d2/topic-3.js',
  './questions/d2/topic-4.js','./questions/d2/topic-5.js','./questions/d2/topic-6.js','./questions/d2/topic-7.js','./questions/d2/topic-8.js',
  './questions/d3/core.js','./questions/d4/core.js','./questions/d5/core.js','./questions/d6/core.js',
  './js/engine/telemetry.js','./js/engine/intervention.js','./js/engine/frontier.js','./js/engine/adaptive.js',
  './js/engine/dimensional-memory.js','./js/engine/dimensional-portal.js','./js/engine/representations/place-value.js','./js/engine/representations/fraction-area.js','./js/engine/representations/number-line.js','./js/engine/representations/grouping-array.js','./js/engine/representations/number-bond.js','./js/engine/representations/bar-relational.js','./js/engine/dimensional-catalog.js','./js/engine/dimensional-view.js','./js/engine/dimensional-lab.js',
  './js/heroes.js','./js/progression.js','./js/rewards-v2.js','./js/learning.js','./js/audio.js',
  './js/battle.js','./js/parent.js','./js/parent-learning-tools-v3.26.0.js','./js/guardian-focus.js','./js/app.js','./js/beta-trust-v3.29.0.js','./js/cloud.js','./js/qsv2-shadow-sync-v3.37.0.js','./js/qsv2-pilot-sync-v3.40.0.js','./js/qsv2-beta-rollout-v3.42.0.js','./js/commercial-foundation-v3.25.0.js','./js/guardian-onboarding-v3.25.1.js','./js/custom-picker-v3.25.6.js','./js/phase-3.6.4.js','./js/dev-cikgu-dimensi-v3.24.10.js',
  './js/sensory-learning-v3.19.0.js','./js/cikgu-manipulatives-v3.19.1.js','./js/daily-spaced-review-v3.20.0.js',
  './js/dev-experiments-v3.21.2.js','./js/combat-polish-v3.21.3.js','./js/dev-boss-lab-v3.21.4.js','./js/combat-target-anchor-v3.21.5.js','./js/finisher-alpha-hotspots-v3.21.6.js','./js/typed-answer-ui-v3.21.8.js','./js/profile-manager-v3.24.2.js','./js/pwa.js'
];

const freshRequest=(input)=>new Request(
  typeof input==='string'?input:input.url,
  {cache:'reload'}
);

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>cache.addAll(APP_SHELL.map(freshRequest)))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(
        keys.filter(key=>key.startsWith('pahlawan-angka-')&&key!==CACHE_NAME)
            .map(key=>caches.delete(key))
      ))
      .then(()=>self.clients.claim())
      .then(()=>self.clients.matchAll({type:'window'}))
      .then(clients=>Promise.all(
        clients.map(client=>client.navigate(client.url).catch(()=>null))
      ))
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;

  if(event.request.mode==='navigate'){
    event.respondWith(
      fetch(freshRequest(event.request))
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put('./index.html',copy));
          return response;
        })
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  if(event.request.destination==='script'||event.request.destination==='style'){
    event.respondWith(
      fetch(freshRequest(event.request))
        .then(response=>{
          if(response&&response.status===200){
            const copy=response.clone();
            caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
          }
          return response;
        })
        .catch(()=>caches.match(event.request,{ignoreSearch:true}))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request,{ignoreSearch:true})
      .then(cached=>cached||fetch(event.request).then(response=>{
        if(response&&response.status===200){
          const copy=response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
        }
        return response;
      }))
  );
});
