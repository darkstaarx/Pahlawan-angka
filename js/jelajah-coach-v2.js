/* Scoped adapter around the shipped Learning Camp DOM, models and interactions. */
(()=>{'use strict';
 function mount(host,s,options={}){
  const frame=document.createElement('iframe');frame.title='Cikgu Dimensi · '+s.topic;frame.className='paJelajahCoachFrame';frame.src='jelajah-runtime.html?activity=coach&grade='+s.grade;host.replaceChildren(frame);
  let finished=false;
  const receive=e=>{if(e.origin!==location.origin||e.source!==frame.contentWindow||e.data?.source!=='pa-jelajah-coach'||e.data.grade!==s.grade||finished)return;if(e.data.type==='complete'){finished=true;options.onComplete?.()}else if(e.data.type==='exit'){finished=true;options.onExit?.()}};
  window.addEventListener('message',receive);return()=>{window.removeEventListener('message',receive);frame.remove()};
 }
 window.PAJelajahCoach={mount};
 if(new URLSearchParams(location.search).get('activity')!=='coach')return;
 function start(){
  const s=PAJelajahScenarios.get(new URLSearchParams(location.search).get('grade'));
  const tell=type=>parent.postMessage({source:'pa-jelajah-coach',type,grade:s.grade},location.origin);
  swapDemoState({name:'Demo',schoolGrade:s.grade,hero:'wira',demoMode:true,skills:{},logs:[],rewards:{pets:{},auras:{},equippedPet:null}},{demoMode:true,mode:'jelajah-coach'});
  learningState={skillId:s.skill,originSkill:s.skill,key:s.key,stage:0,strategy:'contrast',strategyLadder:['contrast','micro'],tag:s.key,fromDev:true,originalPrompt:s.questions[6].prompt};
  let checkIndex=0,transitioning=false;
  const originalArena=window.renderVisualCoachArena,originalContent=window.visualCoachContent;
  const meta=m=>s.grade===1?{...m,title:'Puluh dan sa'}:s.grade===4?{...m,title:'Penukaran unit'}:m;
  window.renderVisualCoachArena=(stage,key,m)=>originalArena(stage,key,meta(m));
  window.visualCoachContent=(stage,key,m)=>originalContent(stage,key,meta(m));
  document.getElementById('learningSkill').textContent=s.topic;
  document.getElementById('learningReason').textContent='Contoh bantuan untuk simulasi tadi. '+s.hint+' Bukan penilaian sebenar.';
  window.returnFromLearning=()=>tell('exit');
  window.learningAdvance=()=>{if(transitioning)return;learningState.stage=Math.min(4,learningState.stage+1);renderLearningStage()};
  const diagnostic=[
   ['Digit di tempat puluh mewakili…','Kumpulan sepuluh','Sa sahaja'],
   ['Apabila ada 13 sa, apakah pertukaran yang sama nilainya?','1 puluh dan 3 sa','3 sa sahaja'],
   ['Jika penyebut didarab dua, pengangka perlu…','Didarab dua juga','Dikekalkan sahaja'],
   ['Satu meter bersamaan…','100 sentimeter','10 sentimeter'],
   ['Digit pertama selepas titik ialah…','Persepuluh','Perseratus'],
   ['Jika satu bahagian nisbah didarab tiga, bahagian lain perlu…','Didarab tiga juga','Ditambah tiga sahaja']
  ][s.grade-1];
  const alternative=()=>s.grade===1?genericManipulative('place'):s.grade===2?lessonVisual('regroupAdd'):s.grade===3?'<div class="abstractBridge"><span>0</span><b>────</b><span>1/2 = 2/4</span><b>────</b><span>1</span></div><p>Garis nombor yang sama: titik tengah tidak bergerak apabila dua bahagian sama besar dibahagi lagi menjadi empat. Dua suku menutup separuh yang sama.</p>':s.grade===4?'<div class="barModel"><div class="part main">1 m = 100 cm</div></div><div class="barModel"><div class="part main">100 cm</div><div class="part extra">100 cm</div></div><p>Dua bar sepanjang satu meter menjadi 2 m. Setiap bar bernilai 100 cm, jadi 100 cm + 100 cm = 200 cm.</p>':s.grade===5?lessonVisual('fractionDecimal'):'<table><caption>Kuantiti merah dan biru berubah bersama</caption><tr><th>Merah</th><th>Biru</th></tr><tr><td>2</td><td>3</td></tr><tr><td>4</td><td>6</td></tr><tr><td>6</td><td>9</td></tr></table><p>Setiap lajur didarab dengan faktor yang sama. 2:3, 4:6 dan 6:9 mengekalkan hubungan yang sama.</p>';
  function diagnose(){
   const body=document.getElementById('learningBody');body.innerHTML=`<div class="stageTag">SEMAK HUBUNGAN</div><h2>${diagnostic[0]}</h2><div class="learningAnswers"><button data-diagnostic="yes">${diagnostic[1]}</button><button data-diagnostic="no">${diagnostic[2]}</button></div><p class="learningFeedback" role="status"></p>`;
   body.querySelector('[data-diagnostic="no"]').onclick=()=>body.querySelector('.learningFeedback').textContent=s.hint;
   body.querySelector('[data-diagnostic="yes"]').onclick=()=>{body.innerHTML=`<div class="stageTag">CUBA CARA LAIN</div><div class="jelajahAlternate">${alternative()}</div><p>${s.hint}</p><p>Boleh terangkan hubungan ini dengan kata-kata kamu?</p><button class="btn primary" data-retry>Cuba soalan baharu</button>`;body.querySelector('[data-retry]').onclick=()=>{checkIndex=checkIndex<2?checkIndex+2:checkIndex;checkpoint()}};
  }
  function checkpoint(){
   const q=s.coachQuestions[checkIndex],body=document.getElementById('learningBody');
   body.innerHTML=`<div class="stageTag">${learningState.stage===3?'CUBA SENDIRI':'GUNA DALAM CONTOH LAIN'}</div><h2>${q.prompt}</h2><p>Jawab tanpa model. Ini latihan contoh sahaja.</p><div class="learningAnswers"></div><div class="learningFeedback" role="status"></div>`;
   const box=body.querySelector('.learningAnswers');
   [{v:q.answer,tag:'correct'},...q.wrong].forEach(o=>{const b=document.createElement('button');b.type='button';b.textContent=o.v;b.onclick=()=>{if(transitioning)return;if(String(o.v)!==q.answer){diagnose();return}transitioning=true;box.querySelectorAll('button').forEach(x=>x.disabled=true);body.querySelector('.learningFeedback').textContent='Tepat untuk contoh ini. Tiada penguasaan disimpan.';setTimeout(()=>{transitioning=false;if(learningState.stage===4){tell('complete');return}learningState.stage=4;checkIndex=1;renderLearningStage()},450)};box.append(b)});
  }
  window.renderLearningCheckpoint=checkpoint;
  // Show only this isolated guest teaching surface. Production screen() and
  // its entitlement check are deliberately not overridden or weakened.
  const reveal=()=>{document.querySelectorAll('.screen').forEach(node=>node.classList.toggle('on',node.id==='learning'));document.body.dataset.screen='learning'};
  reveal();renderLearningStage();requestAnimationFrame(reveal);
  document.addEventListener('pointerdown',()=>parent.postMessage({source:'pa-jelajah',type:'interaction',grade:s.grade},location.origin),{capture:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
