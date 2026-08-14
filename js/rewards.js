const REWARD_PETS={
 aurora:{id:'aurora',name:'Aurora Ekor Angka',desc:'Makhluk fantasi berekor angka dan kristal. Teman pertama pengembara.',front:'assets/pets/aurora/front.webp',battle:'assets/pets/aurora/battle.webp',unlock:'Kalahkan boss pertama'},
 pembaris:{id:'pembaris',name:'Kucing Pembaris Ais',desc:'Pahlawan kecil dengan pedang pembaris ais.',front:'assets/pets/kucing-pembaris/front.webp',battle:'assets/pets/kucing-pembaris/battle.webp',unlock:'Berjaya jawab Cabaran Boss Darjah +1'}
};
const REWARD_BADGES={
 pemula:{id:'pemula',name:'Pemula Berani',icon:'⭐',desc:'Tamatkan misi pertama.'},
 nombor:{id:'nombor',name:'Pakar Nombor',icon:'📘',desc:'Kalahkan boss Topik Nombor.'},
 operasi:{id:'operasi',name:'Jagoan Operasi',icon:'➕',desc:'Kalahkan boss Topik Operasi.'},
 pecahan:{id:'pecahan',name:'Raja Pecahan',icon:'◔',desc:'Kalahkan boss Topik Pecahan.'},
 tanpaHint:{id:'tanpaHint',name:'Tanpa Bantuan',icon:'💡',desc:'Tamatkan misi tanpa menggunakan hint.'},
 cabaran:{id:'cabaran',name:'Cabaran Boss',icon:'👑',desc:'Jawab betul soalan Boss Darjah +1.'}
};
function ensureRewards(){
 if(!db)return; db.rewards=db.rewards||{}; db.rewards.pets=db.rewards.pets||{}; db.rewards.badges=db.rewards.badges||{}; db.rewards.equippedPet=db.rewards.equippedPet||null; db.rewards.firstMissionDone=!!db.rewards.firstMissionDone; db.rewards.firstBossDone=!!db.rewards.firstBossDone; db.rewards.bossStretchWin=!!db.rewards.bossStretchWin;
}
function queueUnlock(type,id){
 ensureRewards(); const item=type==='pet'?REWARD_PETS[id]:REWARD_BADGES[id]; if(!item)return;
 const store=type==='pet'?db.rewards.pets:db.rewards.badges; if(store[id])return; store[id]={unlockedAt:Date.now()}; save();
 setTimeout(()=>showUnlock(type,id),200);
}
function showUnlock(type,id){
 const item=type==='pet'?REWARD_PETS[id]:REWARD_BADGES[id],ov=document.getElementById('unlockOverlay'); if(!item||!ov)return;
 document.getElementById('unlockKicker').textContent=type==='pet'?'HAIWAN TEMAN BARU!':'LENCANA BARU!';
 document.getElementById('unlockTitle').textContent=item.name; document.getElementById('unlockText').textContent=item.desc;
 const img=document.getElementById('unlockImage'),icon=document.getElementById('unlockIcon');
 if(type==='pet'){img.src=item.front;img.classList.remove('hidden');icon.classList.add('hidden')}else{img.classList.add('hidden');icon.classList.remove('hidden');icon.textContent=item.icon}
 ov.classList.remove('hidden'); if(typeof playSfx==='function')playSfx('ui');
}
function closeUnlock(){document.getElementById('unlockOverlay')?.classList.add('hidden')}
function equipPet(id){ensureRewards(); if(!db.rewards.pets[id])return; db.rewards.equippedPet=id;save();renderTreasure();renderBattlePet();showRewardToast(`${REWARD_PETS[id].name} dilengkapi 🐾`)}
function unequipPet(){ensureRewards();db.rewards.equippedPet=null;save();renderTreasure();renderBattlePet()}
function renderBattlePet(){
 const wrap=document.getElementById('battlePet'),idle=document.getElementById('battlePetIdle'),attack=document.getElementById('battlePetAttack'); if(!wrap||!idle||!attack||!db)return;ensureRewards(); const id=db.rewards.equippedPet,item=REWARD_PETS[id];
 if(!item){wrap.classList.add('hidden');return;} idle.src=item.front;idle.alt=`${item.name} bersedia`;attack.src=item.battle;attack.alt=`${item.name} menyerang`;wrap.classList.remove('hidden');
}
function openTreasure(){ensureRewards();renderTreasure();screen('treasure')}
function treasureTab(tab){document.getElementById('petCollection').classList.toggle('hidden',tab!=='pets');document.getElementById('badgeCollection').classList.toggle('hidden',tab!=='badges');document.getElementById('treasurePetTab').classList.toggle('active',tab==='pets');document.getElementById('treasureBadgeTab').classList.toggle('active',tab==='badges')}
function renderTreasure(){
 ensureRewards(); const c=document.getElementById('treasureCoins');if(c)c.textContent=`🪙 ${db.coins||0}`;
 const pets=document.getElementById('petCollection'); if(pets)pets.innerHTML=Object.values(REWARD_PETS).map(p=>{const owned=!!db.rewards.pets[p.id],eq=db.rewards.equippedPet===p.id;return `<div class="petCard ${owned?'owned':'locked'}"><div class="petArtWrap">${owned?`<img src="${p.front}" alt="${p.name}">`:'<div class="petSilhouette">?</div>'}</div><div class="petInfo"><div class="petStatus">${eq?'Dilengkapi':owned?'Dimiliki':'Belum Ditemui'}</div><h3>${owned?p.name:'???'}</h3><p>${owned?p.desc:p.unlock}</p>${owned?`<button class="btn ${eq?'secondary':'primary'} small" onclick="${eq?'unequipPet()':`equipPet('${p.id}')`}">${eq?'Tanggalkan':'Lengkapi'}</button>`:''}</div></div>`}).join('');
 const badges=document.getElementById('badgeCollection'); if(badges)badges.innerHTML=Object.values(REWARD_BADGES).map(b=>{const owned=!!db.rewards.badges[b.id];return `<div class="badgeCard ${owned?'owned':'locked'}"><div class="badgeMedal">${owned?b.icon:'🔒'}</div><b>${b.name}</b><small>${b.desc}</small><span>${owned?'✓ Diperoleh':'Belum diperoleh'}</span></div>`}).join('');
}
function devUnlockAllRewards(){
 if(typeof isDevMode==='function'&&!isDevMode())return;
 ensureRewards();
 const now=Date.now();
 Object.keys(REWARD_PETS).forEach(id=>{db.rewards.pets[id]=db.rewards.pets[id]||{unlockedAt:now,dev:true}});
 Object.keys(REWARD_BADGES).forEach(id=>{db.rewards.badges[id]=db.rewards.badges[id]||{unlockedAt:now,dev:true}});
 db.rewards.firstMissionDone=true; db.rewards.firstBossDone=true; db.rewards.bossStretchWin=true;
 save(); renderTreasure(); if(typeof renderHub==='function')renderHub();
 showRewardToast('DEV: Semua Khazanah dibuka');
}
function devResetRewards(){
 if(typeof isDevMode==='function'&&!isDevMode())return;
 if(!db)return; db.rewards={pets:{},badges:{},equippedPet:null,firstMissionDone:false,firstBossDone:false,bossStretchWin:false};
 save(); renderBattlePet(); renderTreasure(); if(typeof renderHub==='function')renderHub();
 showRewardToast('DEV: Khazanah direset');
}
function devEquipPet(id){
 if(typeof isDevMode==='function'&&!isDevMode())return;
 ensureRewards();
 if(REWARD_PETS[id]){db.rewards.pets[id]=db.rewards.pets[id]||{unlockedAt:Date.now(),dev:true};db.rewards.equippedPet=id;save();renderBattlePet();renderTreasure();showRewardToast(`DEV: ${REWARD_PETS[id].name} dilengkapi`)}
}
function devOpenTreasure(tab='pets'){
 if(typeof isDevMode==='function'&&!isDevMode())return;
 ensureRewards(); renderTreasure(); treasureTab(tab); screen('treasure');
}

function processMissionRewards(){
 ensureRewards(); if(!db.rewards.firstMissionDone){db.rewards.firstMissionDone=true;queueUnlock('badge','pemula')}
 if(sess?.bossDefeated){ if(!db.rewards.firstBossDone){db.rewards.firstBossDone=true;queueUnlock('pet','aurora')} const ch=String(sess.missionChapter||''); if(ch==='1')queueUnlock('badge','nombor');if(ch==='2')queueUnlock('badge','operasi');if(ch==='3')queueUnlock('badge','pecahan'); }
 if((sess?.missionHints||0)===0)queueUnlock('badge','tanpaHint');
 if(db.rewards.bossStretchWin){queueUnlock('badge','cabaran');queueUnlock('pet','pembaris')}
 save();
}
