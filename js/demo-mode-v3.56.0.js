// Guest entry for the Segel battlefield. No profile, cloud save, or legacy battle state is retained.
(()=>{'use strict';
const st={grade:2,active:false,db:null,sess:null};
const grades=[1,2,3,4,5,6];

function demoScope(grade){
  try{
    const skills=GRAPH.skills.filter(skill=>skill.grade===grade&&skill.role==='core');
    const topics=new Set(skills.map(skill=>skill.domain||`Bab ${skill.chapter||'lain'}`));
    return `${topics.size} topik · ${topics.size*2} soalan`;
  }catch(_){return 'Latihan teras'}
}

function mount(){
  const host=document.getElementById('paDemoMount');
  if(!host||document.getElementById('paDemoButton'))return;
  const button=document.createElement('button');
  button.id='paDemoButton';button.className='btn secondary paDemoButton';button.type='button';
  button.innerHTML='<b>⚔ Cuba Demo</b><small>Pilih darjah · terus ke battlefield</small>';
  button.onclick=open;host.appendChild(button);
  document.body.insertAdjacentHTML('beforeend',`<div id="paDemoOverlay" class="paDemoOverlay hidden" role="dialog" aria-modal="true" aria-labelledby="paDemoTitle"><section class="paDemoCard"><button class="paDemoClose" type="button" onclick="PADemo.close()" aria-label="Tutup">×</button><div class="eyebrow">DEMO BATTLEFIELD</div><h2 id="paDemoTitle">Pilih Darjah</h2><p>Setiap topik teras muncul sekurang-kurangnya dua kali. Tiada akaun atau progres diperlukan.</p><div class="paDemoGrades" role="radiogroup" aria-label="Pilih darjah">${grades.map(grade=>`<button class="paDemoGrade${grade===2?' active':''}" type="button" role="radio" aria-checked="${grade===2?'true':'false'}" data-demo-grade="${grade}" onclick="PADemo.selectGrade(${grade})"><b>Darjah ${grade}</b><small>${demoScope(grade)}</small></button>`).join('')}</div><button id="paDemoStart" class="btn primary paDemoStart" type="button" onclick="PADemo.start()">Masuk ke Battlefield</button><small class="paDemoNote">Wira dan Aurora akan menanti di pentas Segel.</small></section></div>`);
}

function open(){document.getElementById('paDemoOverlay')?.classList.remove('hidden')}
function close(){document.getElementById('paDemoOverlay')?.classList.add('hidden')}
function selectGrade(grade){
  st.grade=Number(grade)||2;
  document.querySelectorAll('[data-demo-grade]').forEach(button=>{
    const selected=Number(button.dataset.demoGrade)===st.grade;
    button.classList.toggle('active',selected);
    button.setAttribute('aria-checked',selected?'true':'false');
  });
}
function demoDb(){return{name:'Demo',schoolGrade:st.grade,hero:'wira',demoMode:true,skills:{},coreFrontier:8,focus:null,logs:[],created:Date.now(),xp:0,coins:0,level:1,completedMissions:{},chapterStars:{},activeMissionChapter:null,rewards:{pets:{},auras:{},badges:{},equippedPet:null,equippedAura:null}}}
function demoSession(){return{demoMode:true,hp:20,ehp:12,streak:0,q:null,start:0,hint:false,enemy:1,recent:[],mode:'segel-demo',missionChapter:null,missionAnswered:0,missionCorrect:0,missionHints:0,missionSkills:{},missionFinished:false,devBankTest:false,coachAdaptive:false,questionFingerprints:[],bossActive:false,bossDefeated:false,bossQuestionsAnswered:0}}
function restoreGuest(){
  if(!st.active)return false;
  swapDemoState(st.db,st.sess||{mode:'calibrate'});
  st.db=null;st.sess=null;st.active=false;
  return true;
}
function start(){
  if(st.active)restoreGuest();
  const previous=swapDemoState(demoDb(),demoSession());
  st.db=previous.db;st.sess=previous.sess;st.active=true;
  try{initAll();ensureProgression()}catch(error){console.warn('[demo] initialization failed',error)}
  close();
  if(typeof window.openSegelDemo!=='function'){
    restoreGuest();open();
    console.error('[demo] Segel battlefield is unavailable');
    return;
  }
  window.openSegelDemo({guestDemo:true});
}

window.PADemo={mount,open,close,selectGrade,start,restoreGuest};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
