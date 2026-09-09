// Year 2 v2 offline precache extension v3.62.12.
// Imported only by the service worker through js/version.js.
(function(){
'use strict';
const V='3.62.12';
const assets=[
 './data/kssr/year2-competencies-v2.js',
 './questions/kssr-year2-loader-v3.62.12.js',
 './questions/kssr-year2-v2-runtime-v3.62.12.js',
 './questions/kssr-year2-v2-unit1-v3.62.12.js',
 './questions/kssr-year2-v2-unit2-v3.62.12.js',
 './questions/kssr-year2-v2-unit34-v3.62.12.js',
 './questions/kssr-year2-v2-unit56-v3.62.12.js',
 './questions/kssr-year2-v2-unit78-v3.62.12.js',
 './questions/kssr-year2-curriculum-v2-v3.62.12.js',
 './questions/kssr-year2-adaptive-v3.62.12.js',
 './questions/kssr-year2-smoke-v3.62.12.js'
];
self.addEventListener('install',event=>{
 const cacheName=`pahlawan-angka-v${self.PA_APP_VERSION}-coach-games-2`;
 event.waitUntil(caches.open(cacheName).then(cache=>cache.addAll(assets.map(src=>new Request(src,{cache:'reload'})))));
});
self.PAY2OfflineAssets={version:V,count:assets.length};
})();