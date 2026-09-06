// Narrative combat director v3.60.0.
// Adds a story beat to each regular chapter-mission battle question without changing
// question selection, mastery, KSSR content, or mission progression rules.
(()=>{
  const PRE_BOSS=[
    {id:'attack',kicker:'SERANG',title:'Raksasa menghalang jalan!',cue:'Jawab betul untuk membuka serangan.',action:'attack',damage:4,success:'Serangan tepat!'},
    {id:'defend',kicker:'AWAS',title:'Raksasa membalas!',cue:'Jawab betul untuk menahan serangannya.',action:'guard',damage:0,success:'Pertahanan berjaya!'},
    {id:'counter',kicker:'COUNTER',title:'Dia hilang imbangan!',cue:'Ini peluang untuk membalas serangan.',action:'attack',damage:8,success:'Counter tepat!'},
    {id:'event',kicker:'HALANGAN',title:'Laluan tiba-tiba berubah!',cue:'Selesaikan soalan untuk melepasi bahaya.',action:'event',damage:0,success:'Laluan berjaya ditembusi!'},
    {id:'attack-2',kicker:'SERANG',title:'Ruang serangan terbuka!',cue:'Gunakan peluang sebelum dia pulih.',action:'attack',damage:4,success:'Serangan kena sasaran!'},
    {id:'break',kicker:'PECAHKAN',title:'Perisai kuasa diaktifkan!',cue:'Jawapan betul akan memecahkan pertahanannya.',action:'attack',damage:8,success:'Perisai pecah!'},
    {id:'defend-2',kicker:'BERTAHAN',title:'Musuh menyerbu sekali lagi!',cue:'Tahan serangan ini untuk kekal menguasai medan.',action:'guard',damage:0,success:'Serangan ditahan!'},
    {id:'counter-2',kicker:'COUNTER',title:'Pertahanan musuh terbuka!',cue:'Balas ketika dia belum sempat bersedia.',action:'attack',damage:8,success:'Counter kuat!'},
    {id:'finish',kicker:'KEJAR',title:'Dia cuba melarikan diri!',cue:'Satu jawapan lagi untuk menamatkan pertarungan.',action:'attack',damage:4,finisherEligible:true,success:'Jalan ke boss terbuka!'}
  ];
  const BOSS=[
    {id:'boss-guard',kicker:'BOSS',title:'Boss melepaskan serangan pembukaan!',cue:'Jawab betul untuk bertahan tanpa kehilangan HP.',action:'guard',damage:0,success:'Serangan boss berjaya ditahan!'},
    {id:'boss-strike',kicker:'BOSS',title:'Ada ruang di pertahanannya!',cue:'Serang sebelum boss menutup ruang itu.',action:'attack',damage:4,success:'Boss terkena serangan!'},
    {id:'boss-break',kicker:'PECAHKAN',title:'Boss menguatkan perisai!',cue:'Pecahkan pertahanannya dengan jawapan tepat.',action:'attack',damage:4,success:'Perisai boss retak!'},
    {id:'boss-counter',kicker:'COUNTER',title:'Boss terlebih menyerang!',cue:'Gunakan peluang untuk counter besar.',action:'attack',damage:8,success:'Counter besar berjaya!'},
    {id:'boss-final',kicker:'AKHIR',title:'Boss hampir tumbang!',cue:'Jawapan ini membuka serangan terakhir.',action:'attack',damage:4,finisherEligible:true,success:'Serangan terakhir dibuka!'}
  ];

  function enabled(){
    return !!(typeof sess!=='undefined' && sess && !sess.demoMode && !sess.devBankTest && !sess.guardianFocus && !!sess.missionChapter);
  }
  function plan(){
    if(!enabled())return null;
    const answered=Math.max(0,Number(sess.missionAnswered||0));
    if(sess.enemyTier==='boss'){
      const index=Math.max(0,answered-9);
      return {...(BOSS[Math.min(index,BOSS.length-1)]||BOSS[BOSS.length-1]),index,phase:'boss'};
    }
    const index=Math.min(answered,PRE_BOSS.length-1);
    return {...PRE_BOSS[index],index,phase:'journey'};
  }
  function ensureUi(){
    const card=document.querySelector('#game .qcard');
    if(!card)return null;
    let strip=document.getElementById('battleStoryStrip');
    if(!strip){
      strip=document.createElement('div');
      strip.id='battleStoryStrip';
      strip.className='battleStoryStrip';
      strip.setAttribute('aria-live','polite');
      strip.innerHTML='<span class="battleStoryKicker"></span><span class="battleStoryText"><b></b><small></small></span>';
      card.insertBefore(strip,card.firstChild);
    }
    const enemy=document.getElementById('enemy');
    let intent=document.getElementById('battleStoryIntent');
    if(enemy&&!intent){
      intent=document.createElement('div');intent.id='battleStoryIntent';intent.className='battleStoryIntent';intent.setAttribute('aria-hidden','true');enemy.appendChild(intent);
    }
    return {strip,intent};
  }
  function intentFor(p){
    if(!p)return'';
    if(p.action==='guard')return'⚠ MUSUH MENYERANG';
    if(p.id.includes('counter'))return'↩ COUNTER';
    if(p.id.includes('break'))return'◇ PECAHKAN SHIELD';
    if(p.action==='event')return'✦ EVENT';
    if(p.finisherEligible)return'✦ FINISH';
    return'⚔ GILIRAN KAMU';
  }
  function render(){
    const ui=ensureUi();if(!ui)return;
    const p=plan();
    if(!p){ui.strip.classList.add('hidden');if(ui.intent)ui.intent.classList.add('hidden');return;}
    ui.strip.classList.remove('hidden','success','fail');
    ui.strip.dataset.beat=p.id;ui.strip.dataset.action=p.action;
    ui.strip.querySelector('.battleStoryKicker').textContent=p.kicker;
    ui.strip.querySelector('b').textContent=p.title;
    ui.strip.querySelector('small').textContent=p.cue;
    if(ui.intent){ui.intent.classList.remove('hidden');ui.intent.textContent=intentFor(p);ui.intent.dataset.action=p.action;}
  }
  function afterAnswer(ok){
    const ui=ensureUi(),p=plan();if(!ui||!p)return;
    ui.strip.classList.remove('success','fail');ui.strip.classList.add(ok?'success':'fail');
    const small=ui.strip.querySelector('small');if(small)small.textContent=ok?p.success:(p.action==='guard'?'Pertahanan gagal — musuh berjaya mengenai hero.':'Musuh mengambil peluang untuk menyerang.');
  }
  function later(fn,delay){return typeof battleLater==='function'?battleLater(fn,delay):setTimeout(fn,delay)}
  function clearEnemyPhases(enemy){enemy?.classList.remove('phase-anticipation','phase-contact','phase-follow-through','phase-recover')}
  function playGuard(){
    const arena=document.getElementById('battleArena'),enemy=document.getElementById('enemy'),hero=document.getElementById('hero');
    if(!arena||!enemy||!hero)return {completionDelay:820,contactDelay:330};
    let fx=hero.querySelector('.battleStoryGuardFx');
    if(!fx){fx=document.createElement('div');fx.className='battleStoryGuardFx';fx.setAttribute('aria-hidden','true');fx.innerHTML='<span></span>';hero.appendChild(fx)}
    enemy.classList.remove('attacking');hero.classList.remove('story-guard');fx.classList.remove('active');arena.classList.remove('attack-from-enemy','story-guard-success');
    void enemy.offsetWidth;enemy.classList.add('attacking');arena.classList.add('attack-from-enemy');
    if(enemy.dataset.enemyTier==='boss'){
      clearEnemyPhases(enemy);enemy.classList.add('phase-anticipation');
      later(()=>{clearEnemyPhases(enemy);enemy.classList.add('phase-contact')},150);
      later(()=>{clearEnemyPhases(enemy);enemy.classList.add('phase-follow-through')},335);
      later(()=>{clearEnemyPhases(enemy);enemy.classList.add('phase-recover')},500);
    }
    later(()=>{hero.classList.add('story-guard');fx.classList.add('active');arena.classList.add('story-guard-success');if(typeof playSfx==='function')playSfx('hit')},330);
    later(()=>{enemy.classList.remove('attacking');clearEnemyPhases(enemy);hero.classList.remove('story-guard');fx.classList.remove('active');arena.classList.remove('attack-from-enemy','story-guard-success')},760);
    return {completionDelay:820,contactDelay:330};
  }
  function playEventSuccess(){
    const arena=document.getElementById('battleArena'),hero=document.getElementById('hero'),pet=document.getElementById('battlePet');
    if(!arena||!hero)return {completionDelay:720,contactDelay:260};
    arena.classList.remove('story-event-success');hero.classList.remove('story-evade');pet?.classList.remove('story-assist');void hero.offsetWidth;
    arena.classList.add('story-event-success');hero.classList.add('story-evade');if(pet&&!pet.classList.contains('hidden'))pet.classList.add('story-assist');
    if(typeof playSfx==='function')playSfx('ui');
    later(()=>{arena.classList.remove('story-event-success');hero.classList.remove('story-evade');pet?.classList.remove('story-assist')},650);
    return {completionDelay:720,contactDelay:260};
  }
  function reset(){
    document.getElementById('battleStoryStrip')?.classList.remove('success','fail');
    document.getElementById('hero')?.classList.remove('story-guard','story-evade');
    document.getElementById('battlePet')?.classList.remove('story-assist');
    document.getElementById('battleArena')?.classList.remove('story-guard-success','story-event-success');
    document.querySelector('.battleStoryGuardFx')?.classList.remove('active');
  }
  function wrapNextQuestion(){
    const original=window.nextQ;if(typeof original!=='function'||original.__paBattleStoryWrapped)return;
    const wrapped=function(){reset();const result=original.apply(this,arguments);render();return result};
    wrapped.__paBattleStoryWrapped=true;wrapped.__paBattleStoryOriginal=original;window.nextQ=wrapped;
  }
  wrapNextQuestion();
  window.PABattleStory={version:'3.60.0',enabled,plan,render,afterAnswer,playGuard,playEventSuccess,reset};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})();
