const REWARD_PETS={
 aurora:{id:'aurora',name:'Aurora',species:'Musang Ekor Angka',desc:'Teman fantasi dengan kuasa bintang dan kristal.',price:120,battleScale:1,front:'assets/pets/aurora/standby-v2.webp',hub:'assets/pets/aurora/hub/adventure-v1.webp',anticipation:'assets/pets/aurora/frames/anticipation-v1.webp',battle:'assets/pets/aurora/attack-v2.webp',followThrough:'assets/pets/aurora/frames/follow-through-v1.webp',fx:'assets/fx/pets/aurora/impact.png'},
 arif:{id:'arif',name:'Arif Arnab Abakus',desc:'Arnab bijak yang menyerang dengan manik abakus kristal.',price:160,battleScale:1.14,front:'assets/pets/arif/front.png',hub:'assets/pets/arif/hub/adventure-v1.webp',anticipation:'assets/pets/arif/anticipation.png',battle:'assets/pets/arif/battle.png',followThrough:'assets/pets/arif/follow-through.png',fx:'assets/fx/pets/arif/impact.png'},
 pembaris:{id:'pembaris',name:'Kucing Pembaris Ais',desc:'Pahlawan kecil dengan pedang pembaris ais.',price:180,battleScale:1,front:'assets/pets/kucing-pembaris/standby-v2.webp',hub:'assets/pets/kucing-pembaris/hub/adventure-v1.webp',anticipation:'assets/pets/kucing-pembaris/frames/anticipation-v1.webp',battle:'assets/pets/kucing-pembaris/attack-v2.webp',followThrough:'assets/pets/kucing-pembaris/frames/follow-through-v1.webp',fx:'assets/fx/pets/pembaris/impact.png'},
 tiko:{id:'tiko',name:'Tiko Burung Waktu',desc:'Burung waktu yang mengunci musuh dengan gelang jam.',price:200,front:'assets/pets/tiko/front.png',hub:'assets/pets/tiko/hub/adventure-v1.webp',anticipation:'assets/pets/tiko/anticipation.png',battle:'assets/pets/tiko/battle.png',followThrough:'assets/pets/tiko/follow-through.png',fx:'assets/fx/pets/tiko/impact.png'}
};
const TROPHY_ASSET='assets/ui/trophies-v1/';
const REWARD_BADGES={
 pemula:{id:'pemula',name:'Langkah Pertama',icon:'⭐',image:TROPHY_ASSET+'langkah-pertama.png',desc:'Tamatkan misi pertama.',target:1,metric:()=>db.rewards.firstMissionDone?1:0,tier:'legacy'},
 rentak5:{id:'rentak5',name:'Rentak Lima',icon:'⚡',image:TROPHY_ASSET+'rentak-lima.png',desc:'Capai 5 jawapan betul berturut-turut.',target:5,metric:()=>db.bestStreak||0},
 tepat50:{id:'tepat50',name:'50 Tepat',icon:'🎯',image:TROPHY_ASSET+'tepat-50.png',desc:'Kumpulkan 50 jawapan betul.',target:50,metric:()=>db.totalCorrect||0},
 bintang3:{id:'bintang3',name:'Bintang Sempurna',icon:'🌟',image:TROPHY_ASSET+'bintang-sempurna.png',desc:'Dapatkan 3 bintang dalam satu misi.',target:3,metric:()=>Math.max(0,...Object.values(db.chapterStars||{}).map(Number))},
 tanpaHint:{id:'tanpaHint',name:'Yakin Sendiri',icon:'💡',image:TROPHY_ASSET+'yakin-sendiri.png',desc:'Tamatkan misi tanpa menggunakan Petunjuk.',target:1,metric:()=>db.rewards.badges.tanpaHint?1:0},
 gigih:{id:'gigih',name:'Gigih Berlatih',icon:'🛡️',image:TROPHY_ASSET+'gigih-berlatih.png',desc:'Jawab 100 soalan sepanjang pengembaraan.',target:100,metric:()=>db.totalQuestions||0},
 cabaran:{id:'cabaran',name:'Penakluk Cabaran',icon:'👑',image:TROPHY_ASSET+'penakluk-cabaran.png',desc:'Jawab betul cabaran tambahan Darjah +1.',target:1,metric:()=>db.rewards.bossStretchWin?1:0,tier:'legacy'},
 dailyHero:{id:'dailyHero',name:'Wira Harian',icon:'☀️',image:TROPHY_ASSET+'wira-harian.png',desc:'Capai sasaran harian 15 jawapan betul.',target:1,metric:()=>db.daily?.claimed&&Number(db.daily.correct)>=15?1:0,tier:'bronze'},
 level5:{id:'level5',name:'Pahlawan Tahap 5',icon:'🛡️',image:TROPHY_ASSET+'pahlawan-tahap-5.png',desc:'Capai Tahap 5.',target:5,metric:()=>Math.min(5,Number(db.level)||0),tier:'bronze'},
 level10:{id:'level10',name:'Juara Tahap 10',icon:'🏅',image:TROPHY_ASSET+'juara-tahap-10.png',desc:'Capai Tahap 10.',target:10,metric:()=>Math.min(10,Number(db.level)||0),tier:'silver'},
 topics3:{id:'topics3',name:'Penjelajah Tiga Topik',icon:'🗺️',image:TROPHY_ASSET+'penjelajah-tiga-topik.png',desc:'Lengkapkan 3 topik.',target:3,metric:()=>Math.min(3,Object.values(db.completedMissions||{}).filter(Number).length),tier:'silver'},
 topics5:{id:'topics5',name:'Penakluk Lima Topik',icon:'🏰',image:TROPHY_ASSET+'penakluk-lima-topik.png',desc:'Lengkapkan 5 topik.',target:5,metric:()=>Math.min(5,Object.values(db.completedMissions||{}).filter(Number).length),tier:'gold'},
 mastery1:{id:'mastery1',name:'Kuasa Dikuasai',icon:'✦',image:TROPHY_ASSET+'kuasa-dikuasai.png',desc:'Kuasai 1 kemahiran dengan sekurang-kurangnya 85% penguasaan.',target:1,metric:()=>Math.min(1,Object.values(db.skills||{}).filter(s=>Number(s?.mastery)>=85).length),tier:'bronze'},
 mastery5:{id:'mastery5',name:'Lima Kuasa Dikuasai',icon:'✧',image:TROPHY_ASSET+'lima-kuasa-dikuasai.png',desc:'Kuasai 5 kemahiran dengan sekurang-kurangnya 85% penguasaan.',target:5,metric:()=>Math.min(5,Object.values(db.skills||{}).filter(s=>Number(s?.mastery)>=85).length),tier:'gold'},
 firstBoss:{id:'firstBoss',name:'Penewas Cabaran',icon:'⚔️',image:TROPHY_ASSET+'penewas-boss.png',desc:'Selesaikan cabaran besar buat kali pertama.',target:1,metric:()=>db.rewards.firstBossDone?1:0,tier:'gold'}
};
const TROPHY_TOPIC_FAMILIES=[
 {id:'nombor',label:'Nombor',chapter:'1',image:TROPHY_ASSET+'pakar-nombor.png'},
 {id:'operasi',label:'Operasi',chapter:'2',image:TROPHY_ASSET+'jagoan-operasi.png'},
 {id:'pecahan',label:'Pecahan',chapter:'3',image:TROPHY_ASSET+'wira-pecahan.png'},
 {id:'wang',label:'Wang',chapter:'4',image:TROPHY_ASSET+'tepat-50.png'},
 {id:'masa',label:'Masa',chapter:'5',image:TROPHY_ASSET+'wira-harian.png'},
 {id:'ukuran',label:'Ukuran',chapter:'6',image:TROPHY_ASSET+'kuasa-dikuasai.png'},
 {id:'ruang',label:'Ruang',chapter:'7',image:TROPHY_ASSET+'penjelajah-tiga-topik.png'},
 {id:'data',label:'Data',chapter:'8',image:TROPHY_ASSET+'bintang-sempurna.png'}
];
const TROPHY_TIERS=[
 {id:'bronze',label:'Gangsa',target:20},
 {id:'silver',label:'Perak',target:50},
 {id:'gold',label:'Emas',target:100}
];
const TROPHY_TIER_LABELS=Object.fromEntries(TROPHY_TIERS.map(t=>[t.id,t.label]));
function topicTrophyId(family,tier){return `topic${family.id[0].toUpperCase()}${family.id.slice(1)}${tier.target}`}
function topicCorrectCount(chapter){
 const root=typeof db==='undefined'?null:db;
 return Object.entries(root?.skills||{}).reduce((total,[skillId,skill])=>{
  const meta=typeof META!=='undefined'?META?.[skillId]:null;
  return total+(String(meta?.chapter||'')===String(chapter)?Number(skill?.correct||0):0);
 },0);
}
TROPHY_TOPIC_FAMILIES.forEach(family=>TROPHY_TIERS.forEach(tier=>{
 const id=topicTrophyId(family,tier);
 REWARD_BADGES[id]={id,name:`${family.label} · ${tier.label}`,icon:'✦',image:family.image,desc:`Jawab betul ${tier.target} soalan topik ${family.label}.`,target:tier.target,metric:()=>Math.min(tier.target,topicCorrectCount(family.chapter)),tier:tier.id,topicFamily:family.id,tierTarget:tier.target};
}));
const REWARD_AURAS={
 numbers:{id:'numbers',name:'Lingkaran Nombor',desc:'Sigil nilai tempat untuk serangan terakhir.',price:60,image:'assets/fx/math-auras-approved/numbers-normalized.webp'},
 operations:{id:'operations',name:'Meterai Operasi',desc:'Kuasa +, −, × dan ÷ berpusing di bawah hero.',price:90,image:'assets/fx/math-auras-approved/operations-normalized.webp'},
 fractions:{id:'fractions',name:'Mandala Pecahan',desc:'Lingkaran pecahan yang memusatkan tenaga.',price:120,image:'assets/fx/math-auras-approved/fractions-normalized.webp'},
 data:{id:'data',name:'Grid Data',desc:'Grid data untuk finisher berkuasa.',price:120,image:'assets/fx/math-auras-approved/data-normalized.webp'}
};
function ensureRewards(){
 if(!db)return; db.rewards=db.rewards||{}; db.rewards.pets=db.rewards.pets||{}; db.rewards.auras=db.rewards.auras||{}; db.rewards.badges=db.rewards.badges||{};
 if(!db.rewards.auraMigrationV386){const now=Date.now(),earned={1:'numbers',2:'operations',3:'fractions',8:'data'};Object.entries(earned).forEach(([ch,id])=>{if((db.chapterStars&&Number(db.chapterStars[ch])>0)||(db.completedMissions&&Number(db.completedMissions[ch])>0))db.rewards.auras[id]=db.rewards.auras[id]||{unlockedAt:now,migrated:true}});db.rewards.auraMigrationV386=true;}
 db.rewards.equippedPet=db.rewards.equippedPet||null; db.rewards.equippedAura=(db.rewards.equippedAura&&db.rewards.auras[db.rewards.equippedAura])?db.rewards.equippedAura:null; db.rewards.firstMissionDone=!!db.rewards.firstMissionDone; db.rewards.firstBossDone=!!db.rewards.firstBossDone; db.rewards.bossStretchWin=!!db.rewards.bossStretchWin;
 if(!db.shopWelcomeV1){db.coins=(db.coins||0)+50;db.shopWelcomeV1=true;save();}
}
const REWARD_UNLOCK_QUEUE=[];
let rewardUnlockShowing=false;
function queueUnlock(type,id,silent=false){
 ensureRewards(); const item=type==='pet'?REWARD_PETS[id]:type==='aura'?REWARD_AURAS[id]:REWARD_BADGES[id]; if(!item)return;
 const store=type==='pet'?db.rewards.pets:type==='aura'?db.rewards.auras:db.rewards.badges; if(store[id])return; store[id]={unlockedAt:Date.now()}; save();
 if(silent)return;
 REWARD_UNLOCK_QUEUE.push({type,id});setTimeout(showNextUnlock,200);
}
function showNextUnlock(){if(rewardUnlockShowing||!REWARD_UNLOCK_QUEUE.length)return;rewardUnlockShowing=true;const next=REWARD_UNLOCK_QUEUE.shift();showUnlock(next.type,next.id)}
function showUnlock(type,id){
 const item=type==='pet'?REWARD_PETS[id]:type==='aura'?REWARD_AURAS[id]:REWARD_BADGES[id],ov=document.getElementById('unlockOverlay'); if(!item||!ov)return;
 document.getElementById('unlockKicker').textContent=type==='pet'?'HAIWAN TEMAN BARU!':type==='aura'?'AURA KUASA BARU!':'LENCANA BARU!';
 document.getElementById('unlockTitle').textContent=item.name; document.getElementById('unlockText').textContent=item.desc;
 const img=document.getElementById('unlockImage'),icon=document.getElementById('unlockIcon'),hasImage=type==='pet'||type==='aura'||(type==='badge'&&item.image);
 ov.dataset.rewardType=type;ov.dataset.rewardTier=item.tier||'legacy';
 img.classList.remove('trophyUnlockArt');
 if(hasImage){img.src=type==='pet'?item.front:type==='aura'?item.image:item.image;img.alt=item.name;img.classList.remove('hidden');icon.classList.add('hidden');if(type==='badge'&&item.image){void img.offsetWidth;img.classList.add('trophyUnlockArt')}}else{img.classList.add('hidden');icon.classList.remove('hidden');icon.textContent=item.icon}
 ov.classList.remove('hidden'); if(typeof playSfx==='function')playSfx('ui');
}
function closeUnlock(){const ov=document.getElementById('unlockOverlay');if(ov){ov.classList.add('hidden');delete ov.dataset.rewardType;delete ov.dataset.rewardTier}rewardUnlockShowing=false;setTimeout(showNextUnlock,120)}
function equipPet(id){ensureRewards(); if(!db.rewards.pets[id])return; db.rewards.equippedPet=id;save();renderTreasure();renderBattlePet();showRewardToast(`${REWARD_PETS[id].name} dilengkapi 🐾`)}
function unequipPet(){ensureRewards();db.rewards.equippedPet=null;save();renderTreasure();renderBattlePet()}
function equipAura(id){ensureRewards();if(!REWARD_AURAS[id]||!db.rewards.auras[id])return;db.rewards.equippedAura=id;save();renderTreasure();showRewardToast(`${REWARD_AURAS[id].name} dilengkapi ✦`)}
function unequipAura(){ensureRewards();db.rewards.equippedAura=null;save();renderTreasure();showRewardToast('Aura ditanggalkan')}
function buyReward(type,id){
 ensureRewards();const items=type==='pet'?REWARD_PETS:REWARD_AURAS,item=items[id],store=type==='pet'?db.rewards.pets:db.rewards.auras;if(!item||store[id])return;
 const price=Number(item.price||0);if((db.coins||0)<price){showRewardToast(`Perlu ${price-(db.coins||0)} syiling lagi`);return;}
 db.coins-=price;store[id]={unlockedAt:Date.now(),purchased:true,price};
 if(type==='pet')db.rewards.equippedPet=id;else db.rewards.equippedAura=id;
 save();renderTreasure();renderBattlePet();showPurchaseCelebration(type,item);
}
function showPurchaseCelebration(type,item){
 const ov=document.getElementById('purchaseOverlay'),img=document.getElementById('purchaseImage');if(!ov||!img)return;
 img.src=type==='pet'?item.front:item.image;img.alt=item.name;document.getElementById('purchaseTitle').textContent=item.name;
 document.getElementById('purchaseText').textContent=type==='pet'?'Teman baharu anda sudah bersedia untuk battle seterusnya.':'Aura baharu anda akan muncul pada serangan terakhir.';
 ov.classList.remove('hidden');if(typeof playSfx==='function')playSfx('ui');
}
function closePurchaseCelebration(){document.getElementById('purchaseOverlay')?.classList.add('hidden');renderTreasure()}
function activeBattlePet(){
 /* Khazanah owns selection through expedition.activePetId. Battle deliberately
    has no rewards.equippedPet fallback: a stale legacy value must never place
    a different companion beside Wira. */
 const selected=window.PetCollection?.active?.(db);
 if(!selected)return {id:null,item:null};
 const id=selected.id;
 const legacy=REWARD_PETS[id];
 if(legacy)return {id,item:legacy};
 const idle=selected.assets?.idle||selected.assets?.happy||'';
 const happy=selected.assets?.happy||idle;
 return {id,item:{id,name:selected.name,battleScale:1,front:idle,anticipation:happy,battle:happy,followThrough:idle}};
}
function renderBattlePet(){
 const wrap=document.getElementById('battlePet'),idle=document.getElementById('battlePetIdle'),anticipation=document.getElementById('battlePetAnticipation'),attack=document.getElementById('battlePetAttack'),follow=document.getElementById('battlePetFollowThrough'); if(!wrap||!idle||!anticipation||!attack||!follow||!db)return;ensureRewards(); const {id,item}=activeBattlePet();
 if(!item){wrap.classList.add('hidden');wrap.removeAttribute('data-pet');return;} wrap.dataset.pet=id;wrap.style.setProperty('--pet-art-scale',String(item.battleScale||1));idle.src=item.front;idle.alt=`${item.name} bersedia`;anticipation.src=item.anticipation;anticipation.alt=`${item.name} mengambil ancang-ancang`;attack.src=item.battle;attack.alt=`${item.name} menyerang`;follow.src=item.followThrough;follow.alt=`${item.name} selepas serangan`;wrap.classList.remove('hidden');
}
function openTreasure(){ensureRewards();renderTreasure();screen('treasure')}
function treasureTab(tab){document.getElementById('petCollection').classList.toggle('hidden',tab!=='pets');document.getElementById('auraCollection').classList.toggle('hidden',tab!=='auras');document.getElementById('badgeCollection').classList.toggle('hidden',tab!=='badges');document.getElementById('treasurePetTab').classList.toggle('active',tab==='pets');document.getElementById('treasureAuraTab').classList.toggle('active',tab==='auras');document.getElementById('treasureBadgeTab').classList.toggle('active',tab==='badges')}
function renderTreasure(){
 ensureRewards(); if(typeof evaluateMilestoneBadges==='function')evaluateMilestoneBadges(true); const c=document.getElementById('treasureCoins');if(c)c.textContent=`🪙 ${db.coins||0}`;
 const pets=document.getElementById('petCollection'); if(pets)pets.innerHTML=Object.values(REWARD_PETS).map(p=>shopCard('pet',p)).join('');
 const auras=document.getElementById('auraCollection');if(auras)auras.innerHTML=Object.values(REWARD_AURAS).map(a=>shopCard('aura',a)).join('');
 const badges=document.getElementById('badgeCollection'); if(badges)badges.innerHTML=Object.values(REWARD_BADGES).map(b=>{const record=db.rewards.badges[b.id],owned=!!record,current=Math.min(b.target,Number(b.metric?.()||0)),pct=Math.round(current/b.target*100),date=record?.unlockedAt?new Date(record.unlockedAt).toLocaleDateString('ms-MY',{day:'numeric',month:'short',year:'numeric'}):'',tier=b.tier||'legacy',tierChip=tier==='legacy'?'':`<em class="badgeTier">${TROPHY_TIER_LABELS[tier]}</em>`,art=b.image?`<img class="badgeMedal" src="${b.image}" alt="${b.name}">`:`<div class="badgeMedal">${owned?b.icon:'?'}</div>`;return `<article class="badgeCard ${owned?'owned':'locked'} tier-${tier}" data-tier="${tier}">${art}${tierChip}<b>${b.name}</b><small>${b.desc}</small><div class="badgeProgress" aria-label="${current} daripada ${b.target}"><i style="width:${pct}%"></i></div><span>${owned?`✓ Diperoleh · ${date}`:`${current}/${b.target} kemajuan`}</span></article>`}).join('');
}
function shopCard(type,item){const store=type==='pet'?db.rewards.pets:db.rewards.auras,owned=!!store[item.id],eq=type==='pet'?db.rewards.equippedPet===item.id:db.rewards.equippedAura===item.id,img=type==='pet'?item.front:item.image,short=Math.max(0,item.price-(db.coins||0)),action=type==='pet'?`equipPet('${item.id}')`:`equipAura('${item.id}')`,remove=type==='pet'?'unequipPet()':'unequipAura()';return `<div class="petCard ${type==='aura'?'auraCard':''} ${owned?'owned':'shopItem'}"><div class="petArtWrap ${type==='aura'?'auraArtWrap':''}"><img src="${img}" alt="${item.name}"></div><div class="petInfo"><div class="petStatus">${eq?'Dilengkapi':owned?'Dimiliki':'Kedai'}</div><h3>${item.name}</h3><p>${item.desc}</p>${owned?`<button class="btn ${eq?'secondary':'primary'} small" onclick="${eq?remove:action}">${eq?'Tanggalkan':'Lengkapi'}</button>`:`<button class="btn primary small shopBuy" onclick="buyReward('${type}','${item.id}')">🪙 ${item.price}</button><small class="coinShort">${short?`Lagi ${short} syiling`:'Boleh dibeli sekarang'}</small>`}</div></div>`}
function processMissionRewards(){
 ensureRewards(); if(!db.rewards.firstMissionDone){db.rewards.firstMissionDone=true;queueUnlock('badge','pemula')}
 if(sess?.bossDefeated){db.rewards.firstBossDone=true;queueUnlock('badge','firstBoss');}
 if((sess?.missionHints||0)===0)queueUnlock('badge','tanpaHint');
 if(db.rewards.bossStretchWin)queueUnlock('badge','cabaran');
 save();
}
function evaluateMilestoneBadges(silent=false){
 ensureRewards();
 const award=id=>queueUnlock('badge',id,silent);
 if((db.bestStreak||0)>=5)award('rentak5');
 if((db.totalCorrect||0)>=50)award('tepat50');
 if((db.totalQuestions||0)>=100)award('gigih');
 if(Math.max(0,...Object.values(db.chapterStars||{}).map(Number))>=3)award('bintang3');
 if(db.daily?.claimed&&Number(db.daily.correct)>=15)award('dailyHero');
 if((db.level||0)>=5)award('level5');
 if((db.level||0)>=10)award('level10');
 if(db.rewards.firstBossDone)award('firstBoss');
 const completedTopics=Object.values(db.completedMissions||{}).filter(Number).length;
 if(completedTopics>=3)award('topics3');
 if(completedTopics>=5)award('topics5');
 const masteredSkills=Object.values(db.skills||{}).filter(s=>Number(s?.mastery)>=85).length;
 if(masteredSkills>=1)award('mastery1');
 if(masteredSkills>=5)award('mastery5');
 TROPHY_TOPIC_FAMILIES.forEach(family=>{
  const correct=topicCorrectCount(family.chapter);
  TROPHY_TIERS.forEach(tier=>{if(correct>=tier.target)award(topicTrophyId(family,tier));});
 });
}
function previewTrophyUnlockFromQuery(){
 const host=typeof location==='undefined'?'':location.hostname;
 if(!['localhost','127.0.0.1','[::1]'].includes(host))return;
 const key=new URLSearchParams(location.search).get('trophy-preview');
 if(!key)return;
 const match=/^(nombor|operasi|pecahan|wang|masa|ukuran|ruang|data)(20|50|100)$/.exec(key.toLowerCase());
 if(!match)return;
 const family=TROPHY_TOPIC_FAMILIES.find(item=>item.id===match[1]),tier=TROPHY_TIERS.find(item=>String(item.target)===match[2]);
 if(family&&tier)setTimeout(()=>showUnlock('badge',topicTrophyId(family,tier)),260);
}
previewTrophyUnlockFromQuery();
