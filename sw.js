// App shell uses PA_APP_VERSION from js/version.js; includes current Focus mini-game banks.
importScripts('./js/version.js');
importScripts('./js/asset-manifest.js');
const CACHE_NAME=`pahlawan-angka-v${self.PA_APP_VERSION}-dev-mini-game-lab-v3-d4-completion-currency-1-d5-uasa-3`;
const ASSET_CACHE_NAME='pahlawan-angka-assets-v1';
const APP_SHELL=[
  './questions/d5/completion-v1.js','./questions/d4/completion-data-money-v1.js','./questions/d4/completion-measures-v1.js','./questions/d4/completion-v1.js','./js/entry-flow-v1.js','./css/entry-flow-v1.css',
  './js/demo-funnel-v1.js',
  './kedai-kek.html',
  './js/minigame-dev-gate.js',
  './js/kedai-kek-router.js',
  './bengkel-ajaib.html',
  './js/bengkel-ajaib-router.js',
  './gudang-harta.html','./js/gudang-harta-router.js',
  './assets/minigames/gudang-harta/wira-thumb.webp','./assets/minigames/gudang-harta/wira-idle.webp','./assets/minigames/gudang-harta/wira-victory.webp',
  './assets/minigames/gudang-harta/bintang.webp',
  './assets/minigames/gudang-harta/arnab-kek-lapis-idle.webp','./assets/minigames/gudang-harta/arnab-kek-lapis-happy.webp','./assets/minigames/gudang-harta/arnab-kek-lapis-sad.webp',
  './assets/minigames/gudang-harta/durian-kerbau-idle.webp','./assets/minigames/gudang-harta/durian-kerbau-happy.webp','./assets/minigames/gudang-harta/durian-kerbau-sad.webp',
  './assets/minigames/gudang-harta/harimau-bunga-idle.webp','./assets/minigames/gudang-harta/harimau-bunga-happy.webp','./assets/minigames/gudang-harta/harimau-bunga-sad.webp',
  './assets/minigames/gudang-harta/ketupat-kura-idle.webp','./assets/minigames/gudang-harta/ketupat-kura-happy.webp','./assets/minigames/gudang-harta/ketupat-kura-sad.webp',
  './assets/minigames/gudang-harta/kumbang-manggis-idle.webp','./assets/minigames/gudang-harta/kumbang-manggis-happy.webp','./assets/minigames/gudang-harta/kumbang-manggis-sad.webp',  './js/focus-mini-games-live-bridge.js',
  './assets/minigames/kedai-kek/wira-thumb.webp',
  './assets/minigames/kedai-kek/ketupat-kura-idle.webp',
  './assets/minigames/kedai-kek/arnab-kek-lapis-idle.webp',
  './assets/minigames/kedai-kek/wira-idle.webp',
  './assets/minigames/kedai-kek/ketupat-kura-happy.webp',
  './assets/minigames/kedai-kek/harimau-bunga-happy.webp',
  './assets/minigames/kedai-kek/kumbang-manggis-sad.webp',
  './assets/minigames/kedai-kek/ketupat-kura-sad.webp',
  './assets/minigames/kedai-kek/kumbang-manggis-happy.webp',
  './assets/minigames/kedai-kek/durian-kerbau-sad.webp',
  './assets/minigames/kedai-kek/kumbang-manggis-idle.webp',
  './assets/minigames/kedai-kek/durian-kerbau-happy.webp',
  './assets/minigames/kedai-kek/arnab-kek-lapis-happy.webp',
  './assets/minigames/kedai-kek/harimau-bunga-sad.webp',
  './assets/minigames/kedai-kek/wira-victory.webp',
  './assets/minigames/kedai-kek/arnab-kek-lapis-sad.webp',
  './assets/minigames/kedai-kek/durian-kerbau-idle.webp',
  './assets/minigames/kedai-kek/harimau-bunga-idle.webp',
  './assets/minigames/kedai-kek/bintang.webp',
  './assets/minigames/bengkel-ajaib/wira-thumb.webp',
  './assets/minigames/bengkel-ajaib/ketupat-kura-idle.webp',
  './assets/minigames/bengkel-ajaib/arnab-kek-lapis-idle.webp',
  './assets/minigames/bengkel-ajaib/wira-idle.webp',
  './assets/minigames/bengkel-ajaib/ketupat-kura-happy.webp',
  './assets/minigames/bengkel-ajaib/harimau-bunga-happy.webp',
  './assets/minigames/bengkel-ajaib/kumbang-manggis-sad.webp',
  './assets/minigames/bengkel-ajaib/ketupat-kura-sad.webp',
  './assets/minigames/bengkel-ajaib/kumbang-manggis-happy.webp',
  './assets/minigames/bengkel-ajaib/durian-kerbau-sad.webp',
  './assets/minigames/bengkel-ajaib/kumbang-manggis-idle.webp',
  './assets/minigames/bengkel-ajaib/durian-kerbau-happy.webp',
  './assets/minigames/bengkel-ajaib/arnab-kek-lapis-happy.webp',
  './assets/minigames/bengkel-ajaib/harimau-bunga-sad.webp',
  './assets/minigames/bengkel-ajaib/wira-victory.webp',
  './assets/minigames/bengkel-ajaib/arnab-kek-lapis-sad.webp',
  './assets/minigames/bengkel-ajaib/durian-kerbau-idle.webp',
  './assets/minigames/bengkel-ajaib/harimau-bunga-idle.webp',
  './assets/minigames/bengkel-ajaib/bintang.webp',
  './dapur-ramuan.html','./js/dapur-ramuan-router.js',
  './pos-peninjau.html','./js/pos-peninjau-router.js',
  './lombong-permata.html','./js/lombong-permata-router.js',
  './assets/minigames/dapur-ramuan/arnab-kek-lapis-happy.webp',
  './assets/minigames/dapur-ramuan/arnab-kek-lapis-idle.webp',
  './assets/minigames/dapur-ramuan/arnab-kek-lapis-sad.webp',
  './assets/minigames/dapur-ramuan/bintang.webp',
  './assets/minigames/dapur-ramuan/durian-kerbau-happy.webp',
  './assets/minigames/dapur-ramuan/durian-kerbau-idle.webp',
  './assets/minigames/dapur-ramuan/durian-kerbau-sad.webp',
  './assets/minigames/dapur-ramuan/harimau-bunga-happy.webp',
  './assets/minigames/dapur-ramuan/harimau-bunga-idle.webp',
  './assets/minigames/dapur-ramuan/harimau-bunga-sad.webp',
  './assets/minigames/dapur-ramuan/ketupat-kura-happy.webp',
  './assets/minigames/dapur-ramuan/ketupat-kura-idle.webp',
  './assets/minigames/dapur-ramuan/ketupat-kura-sad.webp',
  './assets/minigames/dapur-ramuan/kumbang-manggis-happy.webp',
  './assets/minigames/dapur-ramuan/kumbang-manggis-idle.webp',
  './assets/minigames/dapur-ramuan/kumbang-manggis-sad.webp',
  './assets/minigames/dapur-ramuan/wira-idle.webp',
  './assets/minigames/dapur-ramuan/wira-thumb.webp',
  './assets/minigames/dapur-ramuan/wira-victory.webp',
  './assets/minigames/pos-peninjau/arnab-kek-lapis-happy.webp',
  './assets/minigames/pos-peninjau/arnab-kek-lapis-idle.webp',
  './assets/minigames/pos-peninjau/arnab-kek-lapis-sad.webp',
  './assets/minigames/pos-peninjau/bintang.webp',
  './assets/minigames/pos-peninjau/durian-kerbau-happy.webp',
  './assets/minigames/pos-peninjau/durian-kerbau-idle.webp',
  './assets/minigames/pos-peninjau/durian-kerbau-sad.webp',
  './assets/minigames/pos-peninjau/harimau-bunga-happy.webp',
  './assets/minigames/pos-peninjau/harimau-bunga-idle.webp',
  './assets/minigames/pos-peninjau/harimau-bunga-sad.webp',
  './assets/minigames/pos-peninjau/ketupat-kura-happy.webp',
  './assets/minigames/pos-peninjau/ketupat-kura-idle.webp',
  './assets/minigames/pos-peninjau/ketupat-kura-sad.webp',
  './assets/minigames/pos-peninjau/kumbang-manggis-happy.webp',
  './assets/minigames/pos-peninjau/kumbang-manggis-idle.webp',
  './assets/minigames/pos-peninjau/kumbang-manggis-sad.webp',
  './assets/minigames/pos-peninjau/wira-idle.webp',
  './assets/minigames/pos-peninjau/wira-thumb.webp',
  './assets/minigames/pos-peninjau/wira-victory.webp',
  './assets/minigames/lombong-permata/arnab-kek-lapis-happy.webp',
  './assets/minigames/lombong-permata/arnab-kek-lapis-idle.webp',
  './assets/minigames/lombong-permata/arnab-kek-lapis-sad.webp',
  './assets/minigames/lombong-permata/bintang.webp',
  './assets/minigames/lombong-permata/durian-kerbau-happy.webp',
  './assets/minigames/lombong-permata/durian-kerbau-idle.webp',
  './assets/minigames/lombong-permata/durian-kerbau-sad.webp',
  './assets/minigames/lombong-permata/harimau-bunga-happy.webp',
  './assets/minigames/lombong-permata/harimau-bunga-idle.webp',
  './assets/minigames/lombong-permata/harimau-bunga-sad.webp',
  './assets/minigames/lombong-permata/ketupat-kura-happy.webp',
  './assets/minigames/lombong-permata/ketupat-kura-idle.webp',
  './assets/minigames/lombong-permata/ketupat-kura-sad.webp',
  './assets/minigames/lombong-permata/kumbang-manggis-happy.webp',
  './assets/minigames/lombong-permata/kumbang-manggis-idle.webp',
  './assets/minigames/lombong-permata/kumbang-manggis-sad.webp',
  './assets/minigames/lombong-permata/wira-idle.webp',
  './assets/minigames/lombong-permata/wira-thumb.webp',
  './assets/minigames/lombong-permata/wira-victory.webp',
  './tapak-bina.html','./js/tapak-bina-router.js','./js/tapak-bina-live-bridge.js',
  './assets/minigames/tapak-bina/wira-idle.webp','./assets/minigames/tapak-bina/wira-thumb.webp','./assets/minigames/tapak-bina/wira-victory.webp',
  './assets/minigames/tapak-bina/bintang.webp',
  './assets/minigames/tapak-bina/arnab-kek-lapis-idle.webp','./assets/minigames/tapak-bina/arnab-kek-lapis-happy.webp','./assets/minigames/tapak-bina/arnab-kek-lapis-sad.webp',
  './assets/minigames/tapak-bina/durian-kerbau-idle.webp','./assets/minigames/tapak-bina/durian-kerbau-happy.webp','./assets/minigames/tapak-bina/durian-kerbau-sad.webp',
  './assets/minigames/tapak-bina/harimau-bunga-idle.webp','./assets/minigames/tapak-bina/harimau-bunga-happy.webp','./assets/minigames/tapak-bina/harimau-bunga-sad.webp',
  './assets/minigames/tapak-bina/ketupat-kura-idle.webp','./assets/minigames/tapak-bina/ketupat-kura-happy.webp','./assets/minigames/tapak-bina/ketupat-kura-sad.webp',
  './assets/minigames/tapak-bina/kumbang-manggis-idle.webp','./assets/minigames/tapak-bina/kumbang-manggis-happy.webp','./assets/minigames/tapak-bina/kumbang-manggis-sad.webp',
  './gerai-wirayung.html', './js/wirayung-live-bridge.js', './js/minigame-exit-guard-v1.js', './js/bug-report-v1.js', './css/bug-report-v1.css', './js/gerai-wirayung-router.js',
  './menara-jam.html', './js/menara-jam-router.js', './js/engine/focus-time-diagnostic-v1.js',
  './assets/minigames/tren-jam/train-v1.svg', './assets/battlefields/money-market/arena-v1.webp',
  './assets/minigames/menara-jam/arnab-kek-lapis-happy.webp', './assets/minigames/menara-jam/arnab-kek-lapis-idle.webp', './assets/minigames/menara-jam/arnab-kek-lapis-sad.webp',
  './assets/minigames/menara-jam/bintang.webp', './assets/minigames/menara-jam/durian-kerbau-happy.webp', './assets/minigames/menara-jam/durian-kerbau-idle.webp', './assets/minigames/menara-jam/durian-kerbau-sad.webp',
  './assets/minigames/menara-jam/harimau-bunga-happy.webp', './assets/minigames/menara-jam/harimau-bunga-idle.webp', './assets/minigames/menara-jam/harimau-bunga-sad.webp',
  './assets/minigames/menara-jam/ketupat-kura-happy.webp', './assets/minigames/menara-jam/ketupat-kura-idle.webp', './assets/minigames/menara-jam/ketupat-kura-sad.webp',
  './assets/minigames/menara-jam/kumbang-manggis-happy.webp', './assets/minigames/menara-jam/kumbang-manggis-idle.webp', './assets/minigames/menara-jam/kumbang-manggis-sad.webp',
  './assets/minigames/menara-jam/wira-idle.webp', './assets/minigames/menara-jam/wira-thumb.webp', './assets/minigames/menara-jam/wira-victory.webp',
  './assets/minigames/kedai-ajaib/wira-idle.webp', './assets/minigames/kedai-ajaib/wira-thumb.webp', './assets/minigames/kedai-ajaib/wira-victory.webp',
  './assets/minigames/kedai-ajaib/wira-peniaga-idle.webp','./assets/minigames/kedai-ajaib/wira-peniaga-thumb.webp','./assets/minigames/kedai-ajaib/wira-peniaga-victory.webp',
  './assets/minigames/menara-jam/wira-konduktor-idle.webp','./assets/minigames/menara-jam/wira-konduktor-thumb.webp','./assets/minigames/menara-jam/wira-konduktor-victory.webp',
  './assets/minigames/tapak-bina/wira-arkitek-idle.webp','./assets/minigames/tapak-bina/wira-arkitek-thumb.webp','./assets/minigames/tapak-bina/wira-arkitek-victory.webp',
  './assets/minigames/kedai-kek/wira-baker-idle.webp','./assets/minigames/kedai-kek/wira-baker-thumb.webp','./assets/minigames/kedai-kek/wira-baker-victory.webp',
  './assets/minigames/bengkel-ajaib/wira-mekanik-idle.webp','./assets/minigames/bengkel-ajaib/wira-mekanik-thumb.webp','./assets/minigames/bengkel-ajaib/wira-mekanik-victory.webp',
  './assets/minigames/gudang-harta/wira-penjaga-harta-idle.webp','./assets/minigames/gudang-harta/wira-penjaga-harta-thumb.webp','./assets/minigames/gudang-harta/wira-penjaga-harta-victory.webp',
  './assets/minigames/dapur-ramuan/wira-ahli-ramuan-idle.webp','./assets/minigames/dapur-ramuan/wira-ahli-ramuan-thumb.webp','./assets/minigames/dapur-ramuan/wira-ahli-ramuan-victory.webp',
  './assets/minigames/pos-peninjau/wira-peninjau-idle.webp','./assets/minigames/pos-peninjau/wira-peninjau-thumb.webp','./assets/minigames/pos-peninjau/wira-peninjau-victory.webp',
  './assets/minigames/lombong-permata/wira-pelombong-idle.webp','./assets/minigames/lombong-permata/wira-pelombong-thumb.webp','./assets/minigames/lombong-permata/wira-pelombong-victory.webp',
  './assets/heroes/wira-chibi/frames/victory-v1.webp',
  './assets/ui/focus-v1/focus-panel-illustrated-v1.webp',
  './assets/ui/focus-v1/focus-skill-card-clean-v1.svg',
  './assets/pets/evolution/fire/aurora/happy-sprite-v1.webp',
  './assets/pets/evolution/fire/ketupatKura/happy-sprite-v1.webp',
  './assets/pets/evolution/fire/kumbangManggis/happy-sprite-v1.webp',
  './assets/pets/evolution/fire/harimauBunga/happy-sprite-v1.webp',
  './assets/pets/evolution/fire/arnabKekLapis/happy-sprite-v1.webp',
  './assets/pets/evolution/fire/durianKerbau/happy-sprite-v1.webp',

  './assets/ui/menu-v2/kembara-dimensi-book-v7.webp',
  './js/parent-live-runtime-v1.js',
  './js/worksheet-graphics-v1.js',
  './css/loading-screen-v1.css',
  './assets/ui/loading/wira-shield-v1.webp',
  './questions/grade-depth-v1.js',
  './css/teman-evolution-cinematic-v1.css',
 './assets/questions/counting/apple.png','./assets/questions/counting/orange.png','./assets/questions/counting/rambutan.png','./assets/questions/counting/watermelon_slice.png','./assets/questions/counting/starfruit_slice.png','./assets/questions/counting/pencil.png','./assets/questions/counting/eraser.png','./assets/questions/counting/candy.png','./assets/questions/counting/balloon.png',
  './assets/questions/money/money_5sen.png',
  './assets/questions/money/money_10sen.png',
  './assets/questions/money/money_20sen.png',
  './assets/questions/money/money_50sen.png',
  './assets/questions/money/money_rm1.png',
  './assets/questions/money/money_rm5.png',
  './assets/questions/money/money_rm10.png',
  './assets/questions/money/money_rm20.png',
  './assets/questions/money/money_rm50.png',
  './js/dev-khazanah-v1.js','./css/dev-khazanah-v1.css',
  './assets/fx/wira/final-v5/jurus-penamat-logo-sheet-v1.png',
  './assets/fx/wira/final-v5/glacier-clean-sheet-v1.png',
  './assets/audio/glacier-thunder.wav',
  './css/page-lock-v1.css','./js/page-lock-v1.js',
  './assets/avatars/pupils/avatar-01.png','./assets/avatars/pupils/avatar-02.png','./assets/avatars/pupils/avatar-03.png','./assets/avatars/pupils/avatar-04.png','./assets/avatars/pupils/avatar-05.png','./assets/avatars/pupils/avatar-06.png','./assets/avatars/pupils/avatar-07.png','./assets/avatars/pupils/avatar-08.png',
  './css/pet-battlefield-dev-v1.0.0.css','./js/pet-battlefield-dev-v1.0.0.js','./css/dev-pet-reward-debug-v1.0.0.css','./js/dev-pet-reward-debug-v1.0.0.js','./css/teman-reveal-v1.0.0.css','./css/teman-reveal-stars-v1.0.0.css','./js/teman-reveal-v1.0.0.js',
  './assets/pets/evolution/fire/aurora/happy-v1.webp',
  './assets/pets/evolution/fire/aurora/companion-idle-v1.webp',
  './assets/pets/evolution/fire/ketupatKura/happy-v2.webp',
  './assets/pets/evolution/fire/ketupatKura/companion-idle-v2.webp',
  './assets/pets/evolution/fire/kumbangManggis/happy-v1.webp',
  './assets/pets/evolution/fire/kumbangManggis/companion-idle-v1.webp',
  './assets/pets/evolution/fire/harimauBunga/happy-v1.webp',
  './assets/pets/evolution/fire/harimauBunga/companion-idle-v1.webp',
  './assets/pets/evolution/fire/arnabKekLapis/happy-v2.webp',
  './assets/pets/evolution/fire/arnabKekLapis/companion-idle-v2.webp',
  './assets/pets/evolution/fire/durianKerbau/happy-v1.webp',
  './assets/pets/evolution/fire/durianKerbau/companion-idle-v1.webp',
  './assets/pets/aurora/standby-v2.webp','./assets/pets/aurora/frames/sad-0-v1.webp','./assets/pets/aurora/frames/sad-1-v1.webp','./assets/pets/aurora/frames/sad-2-v1.webp','./assets/pets/aurora/frames/sad-3-v1.webp','./assets/pets/aurora/frames/sad-4-v1.webp','./assets/pets/aurora/frames/sad-5-v1.webp','./assets/pets/aurora/frames/sad-6-v1.webp','./assets/pets/aurora/frames/sad-7-v1.webp','./assets/pets/aurora/frames/joy-0-v1.webp','./assets/pets/aurora/frames/joy-1-v1.webp',
  './assets/pets/collection/ketupat-kura/idle.png','./assets/pets/collection/ketupat-kura/sad-v1.webp','./assets/pets/collection/ketupat-kura/happy-v1.webp',
  './assets/pets/collection/kumbang-manggis/idle.png','./assets/pets/collection/kumbang-manggis/sad-v1.webp','./assets/pets/collection/kumbang-manggis/happy-v1.webp',
  './assets/pets/collection/harimau-bunga/idle.png','./assets/pets/collection/harimau-bunga/sad-v1.webp','./assets/pets/collection/harimau-bunga/happy-v1.webp',
  './assets/pets/collection/arnab-kek-lapis/idle.png','./assets/pets/collection/arnab-kek-lapis/sad-v1.webp','./assets/pets/collection/arnab-kek-lapis/happy-v1.webp',
  './assets/pets/collection/durian-kerbau/idle.png','./assets/pets/collection/durian-kerbau/sad-v1.webp','./assets/pets/collection/durian-kerbau/happy-v1.webp',
  './assets/pets/collection/ketupat-kura/sprite-sheets/sad-v1.webp','./assets/pets/collection/ketupat-kura/sprite-sheets/happy-v1.webp',
  './assets/pets/collection/kumbang-manggis/sprite-sheets/sad-v1.webp','./assets/pets/collection/kumbang-manggis/sprite-sheets/happy-v1.webp',
  './assets/pets/collection/harimau-bunga/sprite-sheets/sad-v1.webp','./assets/pets/collection/harimau-bunga/sprite-sheets/happy-v1.webp',
  './assets/pets/collection/arnab-kek-lapis/sprite-sheets/sad-v1.webp','./assets/pets/collection/arnab-kek-lapis/sprite-sheets/happy-v1.webp',
  './assets/pets/collection/durian-kerbau/sprite-sheets/sad-v1.webp','./assets/pets/collection/durian-kerbau/sprite-sheets/happy-v1.webp',
  './css/segel-demo-v2.1.0.css','./js/segel-demo-v2.1.0.js',
  './assets/ui/star-earned-v1.webp','./assets/ui/star-empty-v1.webp','./assets/ui/victory-result/star-earned.png','./assets/ui/victory-result/star-empty.png','./assets/ui/victory-result/crest-frame.png','./assets/ui/victory-result/crest-side-left.png','./assets/ui/victory-result/crest-side-right.png','./assets/ui/victory-result/summary-frame.png','./assets/ui/victory-result/button-navy-rest.png','./assets/ui/victory-result/button-gold-rest.png','./assets/ui/victory-result/button-navy-press.png','./assets/ui/victory-result/button-gold-press.png','./assets/coach/cikgu-dimensi/hub-portrait-v1.webp',
  './assets/ui/khazanah/teman-night-math-v1.webp','./css/khazanah-v2-v1.0.0.css','./js/khazanah-v2-v1.0.0.js','./js/pet-stage-v1.0.0.js',
  './assets/ui/trophies-v1/langkah-pertama.png','./assets/ui/trophies-v1/rentak-lima.png','./assets/ui/trophies-v1/tepat-50.png','./assets/ui/trophies-v1/bintang-sempurna.png','./assets/ui/trophies-v1/pakar-nombor.png','./assets/ui/trophies-v1/jagoan-operasi.png','./assets/ui/trophies-v1/wira-pecahan.png','./assets/ui/trophies-v1/yakin-sendiri.png','./assets/ui/trophies-v1/gigih-berlatih.png','./assets/ui/trophies-v1/penakluk-cabaran.png','./assets/ui/trophies-v1/wira-harian.png','./assets/ui/trophies-v1/pahlawan-tahap-5.png','./assets/ui/trophies-v1/juara-tahap-10.png','./assets/ui/trophies-v1/penjelajah-tiga-topik.png','./assets/ui/trophies-v1/penakluk-lima-topik.png','./assets/ui/trophies-v1/kuasa-dikuasai.png','./assets/ui/trophies-v1/lima-kuasa-dikuasai.png','./assets/ui/trophies-v1/penewas-boss.png',
  './css/menu-v2-v1.0.0.css','./js/menu-v2-v1.0.0.js','./assets/ui/menu-v2/jejak-map-v1.webp','./assets/ui/menu-v2/hero-stage-v1.webp','./assets/ui/menu-v2/stage-aurora-v1.webp','./assets/ui/menu-v2/cikgu-card-v2.webp','./assets/ui/menu-v2/cikgu-dimensi-book-hq-v1.webp','./assets/ui/menu-v2/cikgu-dimensi-book-fixed-v1.webp','./assets/ui/menu-v2/cikgu-dimensi-book-v4.webp','./assets/pets/aurora/frames/happy-v1.webp',
  // three.js dan bingkai sprite demo sengaja TIDAK di-precache: ia dimuat
  // hanya bila demo dibuka, dan runtime cache di bawah menyimpannya selepas itu.
  './assets/heroes/wira-chibi/hub/idle-loop-v3.webp',
  './css/combat-motion-v1.css','./js/combat-motion-v1.js','./css/battle-story-v3.60.0.css','./js/battle-story-v3.60.0.js',
  './css/learner-review-v1.css','./js/engine/learner-review-v1.js',
  './css/demo-result-child-v3.56.6.css',
  './js/fraction-lesson-v1.js',
  './js/cikgu-mini-games-v1.0.0.js','./js/dev-coach-games-v1.0.0.js','./css/cikgu-mini-games-v1.0.0.css',

  './','./index.html','./manifest.webmanifest','./js/version.js',
  './assets/story/intro-alam-matemagik-v2.webp','./assets/story/intro-kabut-lalai.webp','./assets/story/intro-ikrar.webp','./assets/story/intro-ayuh-v2.webp',
  './css/action-variety-v3.30.0.css','./js/action-variety-v3.30.0.js','./css/demo-mode-v3.56.0.css','./js/demo-mode-v3.56.0.js','./css/hero-wira-finisher-v1.0.0.css','./js/hero-wira-finisher-v1.0.0.js','./css/hero-bunga-v2.0.0.css','./js/hero-bunga-v2.0.0.js',
  './css/hub-hero-switch-v1.0.0.css','./js/hub-hero-switch-v1.0.0.js','./css/question-card-theme-v1.0.0.css','./css/written-arithmetic-v1.0.0.css','./js/written-arithmetic-v1.0.0.js',

  './assets/ui/coin-gold.svg',

  './css/effort-restu-v3.32.0.css','./js/effort-guard-v3.32.0.js',
  './assets/heroes/wira/attack.webp','./assets/heroes/wira/frames/attack-dash-v2.webp','./assets/heroes/wira/frames/attack-arc-v2.webp','./assets/heroes/wira/frames/attack-pulse-v2.webp',
  './assets/heroes/wira-chibi/idle.webp','./assets/heroes/wira-chibi/attack.webp','./assets/heroes/wira-chibi/frames/anticipation-v1.webp','./assets/heroes/wira-chibi/frames/aura-framing-v1.webp','./assets/heroes/wira-chibi/frames/attack-dash-v2.webp','./assets/heroes/wira-chibi/frames/attack-arc-v2.webp','./assets/heroes/wira-chibi/frames/attack-pulse-v2.webp','./assets/heroes/wira-chibi/frames/follow-through-v1.webp','./assets/heroes/wira-chibi/frames/ice-combo-spritesheet-v2.webp',
  './assets/heroes/wira-chibi/frames/shield-throw-release-v1.webp','./assets/heroes/wira-chibi/frames/shield-projectile-v1.webp',
  './assets/heroes/wira-chibi/frames/rescue-happy-v4/rescue-happy-00-v4.png','./assets/heroes/wira-chibi/frames/rescue-happy-v4/rescue-happy-01-v4.png','./assets/heroes/wira-chibi/frames/rescue-happy-v4/rescue-happy-02-v4.png','./assets/heroes/wira-chibi/frames/rescue-happy-v4/rescue-happy-03-v4.png','./assets/heroes/wira-chibi/frames/rescue-happy-v4/rescue-happy-04-v4.png','./assets/heroes/wira-chibi/frames/rescue-happy-v4/rescue-happy-05-v4.png','./assets/heroes/wira-chibi/frames/rescue-happy-v4/rescue-happy-06-v4.png','./assets/heroes/wira-chibi/frames/rescue-happy-v4/rescue-happy-07-v4.png','./assets/heroes/wira-chibi/frames/rescue-happy-v4/rescue-happy-08-v4.png','./assets/heroes/wira-chibi/frames/rescue-happy-v4/rescue-happy-09-v4.png','./assets/heroes/wira-chibi/frames/rescue-happy-v4/rescue-happy-10-v4.png','./assets/heroes/wira-chibi/frames/rescue-happy-v4/rescue-happy-11-v4.png',
'./assets/fx/wira/final-v2/fx-charge-aura-v1.webp','./assets/fx/wira/final-v2/fx-frost-seal-v1.webp','./assets/fx/wira/final-v2/fx-ice-electric-burst-v1.webp','./assets/fx/wira/final-v2/fx-glacier-burst-v2.png','./assets/fx/wira/final-v3/fx-glacier-burst-v3.png','./assets/fx/wira/final-v2/fx-impact-end-v1.webp',
  './assets/heroes/bunga/redesign-v1/runtime/idle-master-v1.webp','./assets/heroes/bunga/redesign-v1/runtime/idle-breathe-v1.webp','./assets/heroes/bunga/redesign-v1/runtime/profile-happy-v1.webp',
  './assets/heroes/bunga/redesign-v1/runtime/kelopak-pecahan/quick-ready-v1.webp','./assets/heroes/bunga/redesign-v1/runtime/kelopak-pecahan/staff-aim-v1.webp','./assets/heroes/bunga/redesign-v1/runtime/kelopak-pecahan/release-v1.webp','./assets/heroes/bunga/redesign-v1/runtime/kelopak-pecahan/fx-projectile-v1.webp','./assets/heroes/bunga/redesign-v1/runtime/kelopak-pecahan/fx-impact-v1.webp',
  './assets/heroes/bunga/redesign-v1/runtime/bulatan-harmoni/cast-start-v1.webp','./assets/heroes/bunga/redesign-v1/runtime/bulatan-harmoni/levitate-charge-v1.webp','./assets/heroes/bunga/redesign-v1/runtime/bulatan-harmoni/remote-release-v1.webp','./assets/heroes/bunga/redesign-v1/runtime/bulatan-harmoni/recovery-v1.webp','./assets/heroes/bunga/redesign-v1/runtime/bulatan-harmoni/fx-charge-arc-v1.webp','./assets/heroes/bunga/redesign-v1/runtime/bulatan-harmoni/fx-enemy-impact-v1.webp',
  './assets/heroes/bunga/redesign-v1/runtime/teorem-mekar/focus-eyes-closed-v1.webp','./assets/heroes/bunga/redesign-v1/runtime/teorem-mekar/fx-charge-aura-v1.webp','./assets/heroes/bunga/redesign-v1/runtime/teorem-mekar/fx-enemy-bloom-v1.webp','./assets/heroes/bunga/redesign-v1/runtime/teorem-mekar/fx-impact-end-v1.webp','./assets/heroes/bunga/redesign-v1/runtime/states/hurt-v1.webp','./assets/heroes/bunga/redesign-v1/runtime/states/defeat-v1.webp',
  './assets/icons/pahlawan-angka-app-32.png','./assets/icons/pahlawan-angka-app-64.png','./assets/icons/pahlawan-angka-app-180.png','./assets/icons/pahlawan-angka-app-192.png','./assets/icons/pahlawan-angka-app-512.png','./assets/icons/pahlawan-angka-app-maskable-512.png','./assets/icons/pahlawan-angka-crest-192.png',
  './assets/branding/login-chibi-math-world-v1.webp','./assets/branding/pahlawan-angka-full-logo-v1.webp','./assets/ui/login/guardian-crest.svg',
  './assets/battlefields/forest-temple/arena-v1.webp','./assets/battlefields/cave-temple/arena-depth-v2.webp','./assets/battlefields/nusantara-temple/arena-v1.webp',
  './assets/battlefields/operations-forge/arena-v1.webp','./assets/battlefields/money-market/arena-v1.webp','./assets/battlefields/time-tower/arena-v1.webp','./assets/battlefields/measurement-court/arena-v1.webp','./assets/battlefields/data-observatory/arena-v1.webp',

  './assets/heroes/wira/idle.webp','./assets/heroes/wira/profile-happy-v1.webp',
  './assets/heroes/switch-cards/wira-v1.webp','./assets/heroes/switch-cards/bunga-v1.webp',
  './assets/heroes/wira/hub/adventure-v1.webp','./assets/fx/hub/wira-math-runes-v1.webp','./assets/fx/hub/bunga-fraction-bloom-v1.webp',
  './assets/pets/aurora/hub/adventure-v1.webp','./assets/pets/arif/hub/adventure-v1.webp','./assets/pets/kucing-pembaris/hub/adventure-v1.webp','./assets/pets/tiko/hub/adventure-v1.webp',
  './assets/coach/cikgu-wajar/welcome.webp','./assets/coach/cikgu-dimensi/dimensional-aura.svg','./assets/coach/cikgu-dimensi/dimensional-eye-cutin-v1.webp',
  './css/game.css','./css/login-chibi-world-v1.css','./css/commercial-foundation-v3.25.0.css','./css/guardian-onboarding-v3.25.1.css','./css/parent-pin-recovery-v3.27.3.css','./css/google-auth-v3.25.2.css','./css/parent-dashboard-v3.25.4.css','./css/theme-controls-v3.25.5.css','./css/custom-picker-v3.25.6.css','./css/parent-learning-tools-v3.26.0.css','./css/hint-overlay-v3.28.1.css','./css/beta-trust-v3.29.0.css','./css/cloud-auth-v3.15.0.css','./css/visual-coach-v3.16.0.css','./css/finisher-auras-v3.8.7.css','./css/finisher-cinematic-v3.8.8.css','./css/kssr-question-v3.9.0.css',
  './css/phase-3.6.4.css','./css/phase-3.6.6.css','./css/phase-3.6.8-animation.css',
  './css/battlefield-motion-v3.7.2.css','./css/battlefield-depth-v3.7.3.css',
  './css/pet-monster-motion-v3.7.4.css','./css/mobile-battle-v3.7.5.css','./css/combat-fov-v3.7.6.css',
  './css/battle-flow-v3.7.7.css','./css/boss-motion-v3.7.9.css','./css/coach-mascot-v3.8.1.css',
  './css/responsive-modes-v3.8.2.css','./css/responsive-layout-v1.css','./css/minigame-desktop-shell-v1.css','./css/minigame-scene-depth-v1.css','./css/pet-sizing-v3.8.21.css','./css/battle-polish-v3.8.22.css',
  './css/battle-scene-v3.8.25.css','./css/coach-teaching-v3.8.26.css','./css/battle-scene-v3.8.27.css',
  './css/battle-scene-v3.8.28.css','./css/pwa-v3.8.29.css','./css/guardian-focus-v3.8.30.css','./css/hero-pose-normalization-v3.8.31.css','./css/battle-fix-v3.9.1.css','./css/battle-fix-v3.11.css','./css/pet-staging-v3.14.3.css',
  './css/sensory-learning-v3.19.0.css','./css/cikgu-manipulatives-v3.19.1.css','./css/daily-spaced-review-v3.20.0.css',
  './css/dev-experiments-v3.21.2.css','./css/combat-polish-v3.21.3.css','./css/boss-stage-dev-v3.21.4.css','./css/combat-target-anchor-v3.21.5.css','./css/finisher-alpha-hotspots-v3.21.6.css','./css/typed-answer-ui-v3.21.8.css',
  './css/kssr-assessment-depth-v3.22.1.css','./css/kssr-year6-space-data-v3.23.0.css','./css/profile-manager-v3.24.2.css',
  './css/game-question-interactions-v3.62.4.css',
  './css/unit-grounding-v3.24.5.css','./css/cikgu-dimensi-place-value-v0.1.css','./css/cikgu-dimensi-core-v0.2.css','./css/hub-adventure-v3.24.11.css',
  './data/kssr/knowledge-graph.js','./data/kssr/mastery-knowledge-v1.js','./data/kssr/alignment-v3.9.0.js','./data/kssr/d3-topic7-curriculum-correction-v3.38.0.js','./data/kssr/d3-topic7-evidence-epoch-v3.39.0.js','./data/kssr/d3-topic7-live-cutover-v3.40.0.js','./data/kssr/d3-nonT7-live-isolation-v1.0.0.js',
  './questions/helpers.js','./questions/index.js','./data/kssr/year1-competencies-v2.js','./questions/kssr-year1-v2-runtime-v3.62.6.js','./questions/kssr-year1-v2-unit1-v3.62.6.js','./questions/kssr-year1-v2-unit2-v3.62.6.js','./questions/kssr-year1-v2-unit34-v3.62.6.js','./questions/kssr-year1-v2-unit56-v3.62.6.js','./questions/kssr-year1-v2-unit78-v3.62.6.js','./questions/kssr-year1-curriculum-v2-v3.62.6.js','./questions/kssr-year1-adaptive-v3.62.6.js','./questions/v2/dist/runtime.js','./questions/v2/engine/d3-rollout.js','./questions/v2/engine/legacy-adapter.js','./js/dev-qsv2-v3.36.0.js','./js/dev-qsv2-live-v3.40.0.js','./questions/kssr-archetypes-v3.9.0.js','./questions/kssr-content-v3.11.js','./questions/kssr-content-integrity-v3.18.1.js','./questions/kssr-assessment-depth-v3.22.1.js','./questions/kssr-year4-curriculum-v3.58.0.js','./questions/kssr-year6-space-data-v3.23.0.js','./questions/kssr-year6-curriculum-v3.60.3.js','./questions/kssr-year6-experience-v3.60.4.js','./questions/kssr-year6-money-real-v3.60.5.js','./data/kssr/year6-competencies-v2.js','./questions/kssr-year6-v2-runtime-v3.61.0.js','./questions/kssr-year6-v2-unit1-v3.61.0.js','./questions/kssr-year6-v2-unit2-v3.61.0.js','./questions/kssr-year6-v2-unit45-v3.61.0.js','./questions/kssr-year6-v2-unit6-angle-v3.61.0.js','./questions/kssr-year6-v2-unit6-circle-v3.61.0.js','./questions/kssr-year6-v2-unit6-space-v3.61.0.js','./questions/kssr-year6-v2-unit7-v3.61.0.js','./questions/kssr-year6-v2-unit8-v3.61.0.js','./questions/kssr-year6-curriculum-v2-v3.61.0.js','./questions/kssr-year6-adaptive-v3.61.1.js','./js/game-question-interactions-v3.62.4.js',
  './questions/d1/core.js','./questions/d2/topic-1.js','./questions/d2/topic-2.js','./questions/d2/topic-3.js',
  './questions/d2/topic-4.js','./questions/d2/topic-5.js','./questions/d2/topic-6.js','./questions/d2/topic-7.js','./questions/d2/topic-8.js',
  './questions/d3/core.js','./questions/d4/core.js','./questions/d5/core.js','./questions/d6/core.js',
  './js/engine/telemetry.js','./js/engine/intervention.js','./js/engine/frontier.js','./js/engine/adaptive.js',
  './js/engine/dimensional-memory.js','./js/engine/dimensional-portal.js','./js/engine/representations/place-value.js','./js/engine/representations/fraction-area.js','./js/engine/representations/number-line.js','./js/engine/representations/grouping-array.js','./js/engine/representations/number-bond.js','./js/engine/representations/bar-relational.js','./js/engine/dimensional-catalog.js','./js/engine/dimensional-view.js','./js/engine/dimensional-lab.js',
  './js/heroes.js','./js/progression.js','./js/rewards-v2.js','./js/learning.js','./js/audio.js','./js/dev-minigame-launcher-v1.js',
  './js/battle.js','./js/parent.js','./js/parent-learning-tools-v3.26.0.js','./js/guardian-focus.js','./js/app.js','./js/beta-trust-v3.29.0.js','./js/cloud.js','./js/qsv2-shadow-sync-v3.37.0.js','./js/qsv2-pilot-sync-v3.40.0.js','./js/qsv2-beta-rollout-v3.42.0.js','./js/commercial-foundation-v3.25.0.js','./js/guardian-onboarding-v3.25.1.js','./js/custom-picker-v3.25.6.js','./js/phase-3.6.4.js','./js/dev-cikgu-dimensi-v3.24.10.js',
  './js/sensory-learning-v3.19.0.js','./js/cikgu-manipulatives-v3.19.1.js','./js/daily-spaced-review-v3.20.0.js',
  './js/dev-experiments-v3.21.2.js','./js/combat-polish-v3.21.3.js','./js/dev-boss-lab-v3.21.4.js','./js/combat-target-anchor-v3.21.5.js','./js/finisher-alpha-hotspots-v3.21.6.js','./js/typed-answer-ui-v3.21.8.js','./js/profile-manager-v3.24.2.js','./js/pwa.js'
];

const freshRequest=(input)=>new Request(
  typeof input==='string'?input:input.url,
  {cache:'reload'}
);

const shellRequest=(input)=>new Request(input,{cache:'reload'});
const assetPath=(url)=>{
  const scope=new URL((self.registration&&self.registration.scope)||self.location.href).pathname.replace(/[^/]*$/,'');
  const pathname=url.pathname.startsWith(scope)?url.pathname.slice(scope.length):url.pathname.replace(/^\//,'');
  return `./${pathname.replace(/^\//,'')}`;
};
const assetHash=(url)=>self.PA_ASSET_MANIFEST&&self.PA_ASSET_MANIFEST[assetPath(url)];
const assetKey=(request,hash)=>{
  const url=new URL(request.url,self.location.origin);url.searchParams.set('__pa_asset_hash',hash);
  return new Request(url.href,{method:'GET'});
};
async function digest(response){
  const bytes=await response.arrayBuffer();
  const hash=await crypto.subtle.digest('SHA-256',bytes);
  return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
}
async function verifiedResponse(response,expected){
  if(!response||response.status!==200)throw new Error(`Asset fetch failed: ${response&&response.status}`);
  const copy=response.clone();
  if(await digest(copy)!==expected)throw new Error('Asset hash mismatch');
  return response;
}
async function installAssets(){
  const stable=await caches.open(ASSET_CACHE_NAME);
  const legacyNames=(await caches.keys()).filter(name=>name.startsWith('pahlawan-angka-')&&name!==ASSET_CACHE_NAME);
  const legacyCaches=await Promise.all(legacyNames.map(name=>caches.open(name)));
  await Promise.all([...new Set(APP_SHELL.filter(path=>path.startsWith('./assets/')))].map(async path=>{
    const expected=self.PA_ASSET_MANIFEST[path];if(!expected)throw new Error(`Missing asset hash: ${path}`);
    const key=new Request(new URL(path,(self.registration&&self.registration.scope)||self.location.href).href);
    const hashed=assetKey(key,expected);
    if(await stable.match(hashed))return;
    let old;for(const legacy of legacyCaches){old=await legacy.match(key);if(old)break;}
    if(old){try{await verifiedResponse(old,expected);await stable.put(hashed,old);return}catch(_){}}
    const response=await verifiedResponse(await fetch(new Request(key,{cache:'no-cache'})),expected);
    await stable.put(hashed,response);
  }));
}

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>cache.addAll(APP_SHELL.filter(path=>!path.startsWith('./assets/')).map(shellRequest)))
      .then(installAssets)
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(
        keys.filter(key=>key.startsWith('pahlawan-angka-')&&key!==CACHE_NAME&&key!==ASSET_CACHE_NAME)
            .map(key=>caches.delete(key))
      ))
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  // The admin portal has its own navigation and must never replace the game shell cache.
  if(url.pathname==='/admin'||url.pathname.startsWith('/admin/'))return;

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

  if(assetHash(url)){
    if(event.request.headers&&event.request.headers.get('range'))return;
    const expected=assetHash(url);
    const key=assetKey(event.request,expected);
    event.respondWith(
      caches.open(ASSET_CACHE_NAME).then(async cache=>{
        const cached=await cache.match(key);if(cached)return cached;
        const canonical=new URL(event.request.url);canonical.search='';
        const canonicalKey=assetKey(new Request(canonical.href),expected);
        const canonicalCached=await cache.match(canonicalKey);
        if(canonicalCached)return canonicalCached;
        try{
          const response=await verifiedResponse(await fetch(new Request(event.request,{cache:'no-cache'})),expected);
          // Storage can be full or unavailable; a verified online response is
          // still usable even when opportunistic persistence cannot complete.
          await cache.put(canonicalKey,response.clone()).catch(()=>{});return response;
        }catch(error){
          const fallback=await cache.match(key);if(fallback)return fallback;throw error;
        }
      })
    );
    return;
  }

  if(url.pathname.includes('/assets/')){event.respondWith(fetch(event.request));return;}

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







