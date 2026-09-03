const fs=require('fs'),vm=require('vm'),crypto=require('crypto'),assert=require('assert');

class Classes{
  constructor(value=''){this.items=new Set(String(value).split(/\s+/).filter(Boolean))}
  add(...xs){xs.forEach(x=>this.items.add(x))}
  remove(...xs){xs.forEach(x=>this.items.delete(x))}
  contains(x){return this.items.has(x)}
  replace(a,b){if(!this.items.delete(a))return false;this.items.add(b);return true}
  toggle(x,force){if(force===undefined)force=!this.items.has(x);force?this.items.add(x):this.items.delete(x);return force}
  [Symbol.iterator](){return this.items[Symbol.iterator]()}
}
class Element{
  constructor(id='',classes=''){this.id=id;this.classList=new Classes(classes);this.children=[];this.style={setProperty(){},removeProperty(){}};this.dataset={};this.attributes={};this.textContent='';this.innerHTML='';this.disabled=false;this.offsetWidth=1}
  setAttribute(k,v){this.attributes[k]=String(v)}
  removeAttribute(k){delete this.attributes[k]}
  appendChild(el){this.children.push(el);el.parentElement=this;return el}
  remove(){this.removed=true}
  querySelector(selector){return this.named?.[selector]||this.children.find(x=>x.classList.contains(selector.replace('.','')))||null}
  querySelectorAll(){return this.children}
  getBoundingClientRect(){return{left:20,top:20,right:120,bottom:220,width:100,height:200}}
}
function battleHarness(){
  const ids={},answers=[new Element('a1','ans ok selected'),new Element('a2','ans no disabled')],hint=new Element('hint','hintBtn used needs-help');
  ['streak','feedback','hero','enemy','battlePet','battleArena','arenaFlash','finisherCinematic','petImpactFx','bossCheckpoint','bossCheckpointSkill','bossCheckpointProof','bossCheckpointEncourage','bossCheckpointButton'].forEach(id=>ids[id]=new Element(id));
  ids.streak.textContent='10 rentak';ids.streak.setAttribute('title','stale');ids.hero.classList.add('phase-recover','attacking');ids.enemy.classList.add('hit','defeat-shatter');ids.battlePet.classList.add('pet-attacking');ids.battleArena.classList.add('boss-cleared','shake');
  ids.battleArena.named={'.bossVictory':new Element('victory','bossVictory show'),'.bossEntrance':new Element('entrance','bossEntrance show')};
  const hintOverlay=new Element('paHintOverlay','show');ids.paHintOverlay=hintOverlay;
  const callbacks=[];let nextTimer=1;
  const document={getElementById:id=>ids[id]||null,querySelectorAll:s=>s==='#answers .ans'?answers:[],querySelector:s=>s==='.hintBtn'?hint:null,createElement:()=>new Element(),baseURI:'https://example.test/'};
  const context={console,document,URL,setTimeout:(fn,delay)=>{const rec={id:nextTimer++,fn,delay,cleared:false};callbacks.push(rec);return rec.id},clearTimeout:id=>{const rec=callbacks.find(x=>x.id===id);if(rec)rec.cleared=true},sess:{streak:0,missionAnswered:3,missionCorrect:2,missionSkills:{},q:null,coachAdaptive:false,devBankTest:false,demoMode:false},db:{hero:'sidma',xp:91,coins:27,rewards:{equippedPet:null}},META:{D2:{domain:'Nombor'}},PROGRESSION:{missionQuestions:12},HEROES:{sidma:{name:'Sidma'},wira:{name:'Wira'}},window:null};
  context.startMission=function(){context.sess={streak:0,missionAnswered:0,missionCorrect:0,missionSkills:{},q:null,coachAdaptive:false,devBankTest:false,demoMode:false}};
  context.window=context;vm.createContext(context);vm.runInContext(fs.readFileSync('js/battle.js','utf8'),context,{filename:'js/battle.js'});
  return{context,ids,answers,hint,callbacks};
}

const h=battleHarness(),c=h.context,protectedBefore=JSON.stringify({xp:c.db.xp,coins:c.db.coins,mastery:73,evidence:14,missionAnswered:c.sess.missionAnswered,missionCorrect:c.sess.missionCorrect});
c.resetBattlePresentation();
assert.equal(h.ids.streak.textContent,'0 rentak','new session streak did not render from sess');
assert(!h.ids.hero.classList.contains('phase-recover')&&!h.ids.hero.classList.contains('attacking'),'hero transient phases survived reset');
assert(!h.ids.enemy.classList.contains('hit')&&!h.ids.enemy.classList.contains('defeat-shatter'),'enemy transient state survived reset');
assert(h.answers.every(x=>!x.disabled&&!x.classList.contains('ok')&&!x.classList.contains('no')),'reused answers were not reset');
const firstState=[h.ids.streak.textContent,[...h.ids.hero.classList.items].join(','),[...h.ids.enemy.classList.items].join(',')].join('|');
c.resetBattlePresentation();
assert.equal([h.ids.streak.textContent,[...h.ids.hero.classList.items].join(','),[...h.ids.enemy.classList.items].join(',')].join('|'),firstState,'reset is not idempotent');
assert.equal(JSON.stringify({xp:c.db.xp,coins:c.db.coins,mastery:73,evidence:14,missionAnswered:c.sess.missionAnswered,missionCorrect:c.sess.missionCorrect}),protectedBefore,'reset altered persistent/progress state');
h.ids.streak.textContent='10 rentak';h.ids.hero.classList.add('phase-recover');c.startMission();assert.equal(h.ids.streak.textContent,'0 rentak');assert(!h.ids.hero.classList.contains('phase-recover'),'startMission boundary did not reset presentation');

c.sess={demoMode:true,missionSkills:{},q:{skill:'D2'}};c.cancelBattlePresentationTimers();c.scheduleBossPresentation(100);
assert.equal(c.window.PABattlePresentation.pending(),1,'demo scheduled a normal checkpoint callback');
c.window.PABattlePresentation.cancel();assert.equal(c.window.PABattlePresentation.pending(),0,'demo finish did not cancel owned timers');
c.sess={demoMode:false,missionSkills:{},q:null,missionAnswered:0,missionCorrect:0,coachAdaptive:false,devBankTest:false};
assert.doesNotThrow(()=>c.showBossCheckpoint(),'null current skill threw');assert(!h.ids.bossCheckpoint.classList.contains('show'),'invalid checkpoint became visible');
c.sess.q={skill:'D2'};c.showBossCheckpoint();assert(h.ids.bossCheckpoint.classList.contains('show')&&c.sess.awaitingBossContinue,'normal mission checkpoint stopped working');
c.cancelBattlePresentationTimers();c.scheduleBossPresentation(100);assert.equal(c.window.PABattlePresentation.pending(),2,'normal boss did not retain victory + checkpoint schedule');

let staleMutation=0;c.cancelBattlePresentationTimers();c.battleLater(()=>staleMutation++,50);const stale=h.callbacks.at(-1).fn;c.resetBattlePresentation();stale();assert.equal(staleMutation,0,'old journey callback affected new journey');

function sidmaHarness(){
  const context={console,document:{getElementById:()=>null,querySelectorAll:()=>[],createElement:()=>new Element()},setTimeout:()=>1,clearTimeout(){},db:{hero:'sidma'},HEROES:{sidma:{}},window:null};context.window=context;context.prepareHeroAttackVariant=()=>{};context.clearHeroAttackVariant=()=>{};vm.createContext(context);vm.runInContext(fs.readFileSync('js/hero-sidma-v1.0.0.js','utf8'),context,{filename:'js/hero-sidma-v1.0.0.js'});return context;
}
const sidma=sidmaHarness();
assert.deepEqual(Array.from({length:5},()=>sidma.PASidmaBattle.dispatchSidmaAttack(false)),Array(5).fill('jejak-sigma'),'five normal Sidma attacks did not dispatch Jejak Sigma');
assert.equal(sidma.PASidmaBattle.dispatchSidmaAttack(true),'rumus-penamat','Sidma finisher no longer dispatches Rumus Penamat');

const pet=battleHarness();pet.context.db={hero:'sidma',rewards:{equippedPet:'aurora'}};pet.context.PASidmaBattle={getNextNormalSkill:()=>2};
const impact=pet.context.triggerImpact('hero','enemy','ice',false),active=pet.callbacks.filter(x=>!x.cleared).slice(-8);
assert.equal(impact.defeatDelay,1120,'pet combo defeat timing changed');assert(active.some(x=>x.delay===0)&&active.some(x=>x.delay===420),'pet-first lead was removed');assert.equal(impact.completionDelay,1850,'Sidma pet-first completion delay changed');

const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
assert.equal(sha('js/hero-wira-finisher-v1.0.0.js'),'97908395c856d989a9aab3bd34f466d50bc05501ed7ee35a52fb18e93ff7b6b1','Wira implementation changed');
assert.equal(sha('js/hero-bunga-v2.0.0.js'),'2b6a5aac65306298cf40b873cb4a8aced2ce51abc54bed1d1960aff2457e9b89','Bunga implementation changed');
const index=fs.readFileSync('index.html','utf8'),version=fs.readFileSync('js/version.js','utf8'),sw=fs.readFileSync('sw.js','utf8');
for(const file of ['js/demo-mode-v3.56.0.js','js/hero-sidma-v1.0.0.js','js/battle.js','js/guardian-focus.js','js/app.js','js/version.js','js/pwa.js'])assert(index.includes(`${file}?v=3.57.3`),`${file} release cache-bust is stale`);
assert(version.includes("PA_APP_VERSION='3.57.3'")&&sw.includes('v3.57.3'),'release/cache identity is not v3.57.3');

console.log(JSON.stringify({status:'pass',release:'3.57.3',checks:13,coverage:['new-session-streak','transient-classes','idempotence','protected-state','demo-checkpoint-ownership','null-checkpoint','normal-checkpoint','generation-isolation','sidma-five-dashes','sidma-finisher','pet-first','wira-bunga-lock','release-cache-wiring']},null,2));
