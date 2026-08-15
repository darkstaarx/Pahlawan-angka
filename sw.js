const CACHE_NAME='pahlawan-angka-v3.20.0';
const APP_SHELL=[
  './','./index.html','./manifest.webmanifest',
  './assets/icons/pa-192.png','./assets/icons/pa-512.png','./assets/icons/pa-maskable-512.png',
  './assets/branding/login-scene-v2.webp','./assets/ui/login/student-crest.svg','./assets/ui/login/guardian-crest.svg',
  './assets/battlefields/forest-temple/arena-v1.webp','./assets/battlefields/cave-temple/arena-depth-v2.webp','./assets/battlefields/nusantara-temple/arena-v1.webp',
  './assets/battlefields/operations-forge/arena-v1.webp','./assets/battlefields/money-market/arena-v1.webp','./assets/battlefields/time-tower/arena-v1.webp','./assets/battlefields/measurement-court/arena-v1.webp','./assets/battlefields/data-observatory/arena-v1.webp',
  './css/game.css','./css/cloud-auth-v3.15.0.css','./css/visual-coach-v3.16.0.css','./css/finisher-auras-v3.8.7.css','./css/finisher-cinematic-v3.8.8.css','./css/kssr-question-v3.9.0.css',
  './css/phase-3.6.4.css','./css/phase-3.6.6.css','./css/phase-3.6.8-animation.css',
  './css/login-buttons-v3.7.1.css','./css/battlefield-motion-v3.7.2.css','./css/battlefield-depth-v3.7.3.css',
  './css/pet-monster-motion-v3.7.4.css','./css/mobile-battle-v3.7.5.css','./css/combat-fov-v3.7.6.css',
  './css/battle-flow-v3.7.7.css','./css/boss-motion-v3.7.9.css','./css/coach-mascot-v3.8.1.css',
  './css/responsive-modes-v3.8.2.css','./css/pet-sizing-v3.8.21.css','./css/battle-polish-v3.8.22.css',
  './css/battle-scene-v3.8.25.css','./css/coach-teaching-v3.8.26.css','./css/battle-scene-v3.8.27.css',
  './css/battle-scene-v3.8.28.css','./css/pwa-v3.8.29.css','./css/guardian-focus-v3.8.30.css','./css/hero-pose-normalization-v3.8.31.css','./css/battle-fix-v3.9.1.css','./css/battle-fix-v3.11.css','./css/pet-staging-v3.14.3.css','./css/sensory-learning-v3.19.0.css','./css/cikgu-manipulatives-v3.19.1.css','./css/daily-spaced-review-v3.20.0.css',
  './data/kssr/knowledge-graph.js','./data/kssr/mastery-knowledge-v1.js','./data/kssr/alignment-v3.9.0.js','./questions/helpers.js','./questions/index.js','./questions/kssr-archetypes-v3.9.0.js','./questions/kssr-content-v3.11.js','./questions/kssr-content-integrity-v3.18.1.js',
  './questions/d1/core.js','./questions/d2/topic-1.js','./questions/d2/topic-2.js','./questions/d2/topic-3.js',
  './questions/d2/topic-4.js','./questions/d2/topic-5.js','./questions/d2/topic-6.js','./questions/d2/topic-7.js','./questions/d2/topic-8.js',
  './questions/d3/core.js','./questions/d4/core.js','./questions/d5/core.js','./questions/d6/core.js',
  './js/engine/telemetry.js','./js/engine/intervention.js','./js/engine/frontier.js','./js/engine/adaptive.js',
  './js/heroes.js','./js/progression.js','./js/rewards-v2.js','./js/learning.js','./js/audio.js',
  './js/battle.js','./js/parent.js','./js/guardian-focus.js','./js/app.js','./js/cloud.js','./js/phase-3.6.4.js','./js/sensory-learning-v3.19.0.js','./js/cikgu-manipulatives-v3.19.1.js','./js/daily-spaced-review-v3.20.0.js','./js/pwa.js'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('pahlawan-angka-')&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(response=>{
      const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put('./index.html',copy));return response;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  if(event.request.destination==='script'||event.request.destination==='style'){
    event.respondWith(fetch(event.request).then(response=>{
      if(response&&response.status===200){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));}
      return response;
    }).catch(()=>caches.match(event.request,{ignoreSearch:true})));
    return;
  }
  event.respondWith(caches.match(event.request,{ignoreSearch:true}).then(cached=>cached||fetch(event.request).then(response=>{
    if(response&&response.status===200){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));}
    return response;
  })));
});
