const REWARD_PETS={
 aurora:{id:'aurora',name:'Aurora Ekor Angka',desc:'Teman fantasi dengan kuasa bintang dan kristal.',price:120,front:'assets/pets/aurora/standby-v2.webp',anticipation:'assets/pets/aurora/frames/anticipation-v1.webp',battle:'assets/pets/aurora/attack-v2.webp',followThrough:'assets/pets/aurora/frames/follow-through-v1.webp',fx:'assets/fx/pets/aurora/impact.png'},
 arif:{id:'arif',name:'Arif Arnab Abakus',desc:'Arnab bijak yang menyerang dengan manik abakus kristal.',price:160,front:'assets/pets/arif/front.png',anticipation:'assets/pets/arif/anticipation.png',battle:'assets/pets/arif/battle.png',followThrough:'assets/pets/arif/follow-through.png',fx:'assets/fx/pets/arif/impact.png'},
 pembaris:{id:'pembaris',name:'Kucing Pembaris Ais',desc:'Pahlawan kecil dengan pedang pembaris ais.',price:180,front:'assets/pets/kucing-pembaris/standby-v2.webp',anticipation:'assets/pets/kucing-pembaris/frames/anticipation-v1.webp',battle:'assets/pets/kucing-pembaris/attack-v2.webp',followThrough:'assets/pets/kucing-pembaris/frames/follow-through-v1.webp',fx:'assets/fx/pets/pembaris/impact.png'},
 tiko:{id:'tiko',name:'Tiko Burung Waktu',desc:'Burung waktu yang mengunci musuh dengan gelang jam.',price:200,front:'assets/pets/tiko/front.png',anticipation:'assets/pets/tiko/anticipation.png',battle:'assets/pets/tiko/battle.png',followThrough:'assets/pets/tiko/follow-through.png',fx:'assets/fx/pets/tiko/impact.png'}
};
const REWARD_BADGES={
 pemula:{id:'pemula',name:'Pemula Berani',icon:'⭐',desc:'Tamatkan misi pertama.'},
 nombor:{id:'nombor',name:'Pakar Nombor',icon:'📘',desc:'Kalahkan boss Topik Nombor.'},
 operasi:{id:'operasi',name:'Jagoan Operasi',icon:'➕',desc:'Kalahkan boss Topik Operasi.'},
 pecahan:{id:'pecahan',name:'Raja Pecahan',icon:'◔',desc:'Kalahkan boss Topik Pecahan.'},
 tanpaHint:{id:'tanpaHint',name:'Tanpa Bantuan',icon:'💡',desc:'Tamatkan misi tanpa menggunakan Petunjuk.'},
 cabaran:{id:'cabaran',name:'Cabaran Boss',icon:'👑',desc:'Jawab betul soalan Boss Darjah +1.'}
};
const REWARD_AURAS={
 numbers:{id:'numbers',name:'Lingkaran Nombor',desc:'Sigil nilai tempat untuk serangan terakhir.',price:60,image:'assets/fx/math-auras-approved/numbers-normalized.webp'},
 operations:{id:'operations',name:'Meterai Operasi',desc:'Kuasa +, −, × dan ÷ berpusing di bawah hero.',price:90,image:'assets/fx/math-auras-approved/operations-normalized.webp'},
 fractions:{id:'fractions',name:'Mandala Pecahan',desc:'Lingkaran pecahan yang memusatkan tenaga.',price:120,image:'assets/fx/math-auras-approved/fractions-normalized.webp'},
 data:{id:'data',name:'Grid Data',desc:'Grid data untuk finisher berkuasa.',price:120,image:'assets/fx/math-auras-approved/data-normalized.webp'}
};
function ensureRewards(){
 if(!db)return; db.rewards=db.rewards||{}; db.rewards.pets=db.rewards.pets||{}; db.rewards.auras=db.rewards.auras||{}; db.rewards.badges=db.rewards.badges||{};
 const devGrid=document.querySelector('.devRewardGrid');if(devGrid&&!document.getElementById('devShopCoinsBtn')){const b=document.createElement('button');b.id='devShopCoinsBtn';b.className='btn ghost small';b.textContent='+500 Syiling Kedai';b.onclick=devAddShopCoins;devGrid.insertBefore(b,devGrid.children[1]||null);}
 if(!db.rewards.auraMigrationV386){const now=Date.now(),earned={1:'numbers',2:'operations',3:'fractions',8:'data'};Object.entries(earned).forEach(([ch,id])=>{if((db.chapterStars&&Number(db.chapterStars[ch])>0)||(db.completedMissions&&Number(db.completedMissions[ch])>0))db.rewards.auras[id]=db.rewards.auras[id]||{unlockedAt:now,migrated:true}});db.rewards.auraMigrationV386=true;}
 db.rewards.equippedPet=db.rewards.equippedPet||null; db.rewards.equippedAura=(db.rewards.equippedAura&&db.rewards.auras[db.rewards.equippedAura])?db.rewards.equippedAura:null; db.rewards.firstMissionDone=!!db.rewards.firstMissionDone; db.rewards.firstBossDone=!!db.rewards.firstBossDone; db.rewards.bossStretchWin=!!db.rewards.bossStretchWin;
 if(!db.shopWelcomeV1){db.coins=(db.coins||0)+50;db.shopWelcomeV1=true;save();}
}
const REWARD_UNLOCK_QUEUE=[];
let rewardUnlockShowing=false;
function queueUnlock(type,id){
 ensureRewards(); const item=type==='pet'?REWARD_PETS[id]:type==='aura'?REWARD_AURAS[id]:REWARD_BADGES[id]; if(!item)return;
 const store=type==='pet'?db.rewards.pets:type==='aura'?db.rewards.auras:db.rewards.badges; if(store[id])return; store[id]={unlockedAt:Date.now()}; save();
 REWARD_UNLOCK_QUEUE.push({type,id});setTimeout(showNextUnlock,200);
}
function showNextUnlock(){if(rewardUnlockShowing||!REWARD_UNLOCK_QUEUE.length)return;rewardUnlockShowing=true;const next=REWARD_UNLOCK_QUEUE.shift();showUnlock(next.type,next.id)}
function showUnlock(type,id){
 const item=type==='pet'?REWARD_PETS[id]:type==='aura'?REWARD_AURAS[id]:REWARD_BADGES[id],ov=document.getElementById('unlockOverlay'); if(!item||!ov)return;
 document.getElementById('unlockKicker').textContent=type==='pet'?'HAIWAN TEMAN BARU!':type==='aura'?'AURA KUASA BARU!':'LENCANA BARU!';
 document.getElementById('unlockTitle').textContent=item.name; document.getElementById('unlockText').textContent=item.desc;
 const img=document.getElementById('unlockImage'),icon=document.getElementById('unlockIcon');
 if(type==='pet'||type==='aura'){img.src=type==='pet'?item.front:item.image;img.classList.remove('hidden');icon.classList.add('hidden')}else{img.classList.add('hidden');icon.classList.remove('hidden');icon.textContent=item.icon}
 ov.classList.remove('hidden'); if(typeof playSfx==='function')playSfx('ui');
}
function closeUnlock(){document.getElementById('unlockOverlay')?.classList.add('hidden');rewardUnlockShowing=false;setTimeout(showNextUnlock,120)}
function equipPet(id){ensureRewards(); if(!db.rewards.pets[id])return; db.rewards.equippedPet=id;save();renderTreasure();renderBattlePet();showRewardToast(`${REWARD_PETS[id].name} dilengkapi 🐾`)}
function unequipPet(){ensureRewards();db.rewards.equippedPet=null;save();renderTreasure();renderBattlePet()}
function equipAura(id){ensureRewards();if(!REWARD_AURAS[id]||!db.rewards.auras[id])return;db.rewards.equippedAura=id;save();renderTreasure();showRewardToast(`${REWARD_AURAS[id].name} dilengkapi ✦`)}
function unequipAura(){ensureRewards();db.rewards.equippedAura=null;save();renderTreasure();showRewardToast('Aura ditanggalkan')}
function buyReward(type,id){
 ensureRewards();const items=type==='pet'?REWARD_PETS:REWARD_AURAS,item=items[id],store=type==='pet'?db.rewards.pets:db.rewards.auras;if(!item||store[id])return;
 const price=Number(item.price||0);if((db.coins||0)<price){showRewardToast(`Perlu ${price-(db.coins||0)} syiling lagi`);return;}
 db.coins-=price;store[id]={unlockedAt:Date.now(),purchased:true,price};save();renderTreasure();if(typeof renderHub==='function')renderHub();showRewardToast(`${item.name} dibeli!`);
}
function renderBattlePet(){
 const wrap=document.getElementById('battlePet'),idle=document.getElementById('battlePetIdle'),anticipation=document.getElementById('battlePetAnticipation'),attack=document.getElementById('battlePetAttack'),follow=document.getElementById('battlePetFollowThrough'); if(!wrap||!idle||!anticipation||!attack||!follow||!db)return;ensureRewards(); const id=db.rewards.equippedPet,item=REWARD_PETS[id];
 if(!item){wrap.classList.add('hidden');wrap.removeAttribute('data-pet');return;} wrap.dataset.pet=id;wrap.style.setProperty('--pet-art-scale',String(item.battleScale||1));idle.src=item.front;idle.alt=`${item.name} bersedia`;anticipation.src=item.anticipation;anticipation.alt=`${item.name} mengambil ancang-ancang`;attack.src=item.battle;attack.alt=`${item.name} menyerang`;follow.src=item.followThrough;follow.alt=`${item.name} selepas serangan`;wrap.classList.remove('hidden');
}
function openTreasure(){ensureRewards();renderTreasure();screen('treasure')}
function treasureTab(tab){document.getElementById('petCollection').classList.toggle('hidden',tab!=='pets');document.getElementById('auraCollection').classList.toggle('hidden',tab!=='auras');document.getElementById('badgeCollection').classList.toggle('hidden',tab!=='badges');document.getElementById('treasurePetTab').classList.toggle('active',tab==='pets');document.getElementById('treasureAuraTab').classList.toggle('active',tab==='auras');document.getElementById('treasureBadgeTab').classList.toggle('active',tab==='badges')}
function renderTreasure(){
 ensureRewards(); const c=document.getElementById('treasureCoins');if(c)c.textContent=`🪙 ${db.coins||0}`;
 const pets=document.getElementById('petCollection'); if(pets)pets.innerHTML=Object.values(REWARD_PETS).map(p=>shopCard('pet',p)).join('');
 const auras=document.getElementById('auraCollection');if(auras)auras.innerHTML=Object.values(REWARD_AURAS).map(a=>shopCard('aura',a)).join('');
 const badges=document.getElementById('badgeCollection'); if(badges)badges.innerHTML=Object.values(REWARD_BADGES).map(b=>{const owned=!!db.rewards.badges[b.id];return `<div class="badgeCard ${owned?'owned':'locked'}"><div class="badgeMedal">${owned?b.icon:'🔒'}</div><b>${b.name}</b><small>${b.desc}</small><span>${owned?'✓ Diperoleh':'Belum diperoleh'}</span></div>`}).join('');
}
function shopCard(type,item){const store=type==='pet'?db.rewards.pets:db.rewards.auras,owned=!!store[item.id],eq=type==='pet'?db.rewards.equippedPet===item.id:db.rewards.equippedAura===item.id,img=type==='pet'?item.front:item.image,short=Math.max(0,item.price-(db.coins||0)),action=type==='pet'?`equipPet('${item.id}')`:`equipAura('${item.id}')`,remove=type==='pet'?'unequipPet()':'unequipAura()';return `<div class="petCard ${type==='aura'?'auraCard':''} ${owned?'owned':'shopItem'}"><div class="petArtWrap ${type==='aura'?'auraArtWrap':''}"><img src="${img}" alt="${item.name}"></div><div class="petInfo"><div class="petStatus">${eq?'Dilengkapi':owned?'Dimiliki':'Kedai'}</div><h3>${item.name}</h3><p>${item.desc}</p>${owned?`<button class="btn ${eq?'secondary':'primary'} small" onclick="${eq?remove:action}">${eq?'Tanggalkan':'Lengkapi'}</button>`:`<button class="btn primary small shopBuy" onclick="buyReward('${type}','${item.id}')">🪙 ${item.price}</button><small class="coinShort">${short?`Lagi ${short} syiling`:'Boleh dibeli sekarang'}</small>`}</div></div>`}
function devAddShopCoins(){if(typeof isDevMode==='function'&&!isDevMode())return;db.coins=(db.coins||0)+500;save();renderTreasure();if(typeof renderHub==='function')renderHub();showRewardToast('DEV: +500 Syiling Kedai')}
function devUnlockAllRewards(){
 if(typeof isDevMode==='function'&&!isDevMode())return;
 ensureRewards();
 const now=Date.now();
 Object.keys(REWARD_PETS).forEach(id=>{db.rewards.pets[id]=db.rewards.pets[id]||{unlockedAt:now,dev:true}});
 Object.keys(REWARD_AURAS).forEach(id=>{db.rewards.auras[id]=db.rewards.auras[id]||{unlockedAt:now,dev:true}});
 Object.keys(REWARD_BADGES).forEach(id=>{db.rewards.badges[id]=db.rewards.badges[id]||{unlockedAt:now,dev:true}});
 db.rewards.firstMissionDone=true; db.rewards.firstBossDone=true; db.rewards.bossStretchWin=true;
 save(); renderTreasure(); if(typeof renderHub==='function')renderHub();
 showRewardToast('DEV: Semua Khazanah dibuka');
}
function devResetRewards(){
 if(typeof isDevMode==='function'&&!isDevMode())return;
 if(!db)return; db.rewards={pets:{},auras:{},badges:{},equippedPet:null,equippedAura:null,auraMigrationV386:true,firstMissionDone:false,firstBossDone:false,bossStretchWin:false};
 save(); renderBattlePet(); renderTreasure(); if(typeof renderHub==='function')renderHub();
 showRewardToast('DEV: Khazanah direset');
}
function devEquipPet(id){
 if(typeof isDevMode==='function'&&!isDevMode())return;
 ensureRewards();
 if(REWARD_PETS[id]){db.rewards.pets[id]=db.rewards.pets[id]||{unlockedAt:Date.now(),dev:true};db.rewards.equippedPet=id;save();renderBattlePet();renderTreasure();showRewardToast(`DEV: ${REWARD_PETS[id].name} dilengkapi`)}
}
function devEquipAura(id){
 if(typeof isDevMode==='function'&&!isDevMode())return;ensureRewards();
 if(REWARD_AURAS[id]){db.rewards.auras[id]=db.rewards.auras[id]||{unlockedAt:Date.now(),dev:true};db.rewards.equippedAura=id;save();renderTreasure();showRewardToast(`DEV: ${REWARD_AURAS[id].name} dilengkapi`)}
}
function devOpenTreasure(tab='pets'){
 if(typeof isDevMode==='function'&&!isDevMode())return;
 ensureRewards(); renderTreasure(); treasureTab(tab); screen('treasure');
}

function processMissionRewards(){
 ensureRewards(); if(!db.rewards.firstMissionDone){db.rewards.firstMissionDone=true;queueUnlock('badge','pemula')}
 if(sess?.bossDefeated){db.rewards.firstBossDone=true;const ch=String(sess.missionChapter||'');if(ch==='1')queueUnlock('badge','nombor');if(ch==='2')queueUnlock('badge','operasi');if(ch==='3')queueUnlock('badge','pecahan');}
 if((sess?.missionHints||0)===0)queueUnlock('badge','tanpaHint');
 if(db.rewards.bossStretchWin)queueUnlock('badge','cabaran');
 save();
}
