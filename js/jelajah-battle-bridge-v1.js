(()=>{'use strict';
 const focus=new URLSearchParams(location.search).get('activity')==='focus';
 const grade=Number(new URLSearchParams(location.search).get('grade'))||1,scenario=PAJelajahScenarios.get(grade);
 const tell=(type,data={})=>parent.postMessage({source:'pa-jelajah',type,grade:scenario.grade,...data},location.origin);
 let pending,perform,started=false,waiting=false,engine=null,lastQuestion=null;
 function schedule(run){
  clearTimeout(pending);const index=run.asked,step=scenario.scriptSteps[index-6],hint=document.getElementById('segelHint');
  if(index>=8){hint.disabled=false;hint.click()}hint.disabled=true;
  const snapshot=engine.snapshot(),confirm=snapshot.session.confirmSkill;
  const reason=index===6?'Contoh murid tersalah dalam simulasi.':confirm?'Sistem sebenar meminta soalan pengesahan untuk kemahiran yang sama.':'Sistem sebenar memilih latihan seterusnya berdasarkan bukti sementara.';
  document.getElementById('segelFeedback').textContent=reason;
  tell('engine-tip',{text:reason,skill:run.q.skill,reason:confirm?'confirmation':'adaptive'});
  let consumed=false;
  perform=()=>{if(consumed||PASegelDemo.state()!==run||run.locked||run.asked!==index)return;consumed=true;clearTimeout(pending);
   const choice=scenario.script[index-6]?{v:run.q.answer,tag:'correct'}:run.q.wrong[0];
   const written=document.querySelector('#segelQuestion .paWaForm');
   if(written){
    const parts=String(choice.v).split('.');
    ['whole','fraction'].forEach((group,i)=>{const fields=[...written.querySelectorAll(`[data-group="${group}"]`)];const digits=(parts[i]||'').padStart(fields.length,'0');fields.forEach((input,n)=>{input.disabled=false;input.value=digits[n]||'0';input.dispatchEvent(new Event('input',{bubbles:true}))})});
    const division=written.querySelector('.paWaDivisionInput');if(division){division.disabled=false;division.value=String(choice.v)}
    tell('script-answer',{index,value:choice.v});written.requestSubmit();return;
   }
   document.querySelectorAll('#segelAnswers input').forEach(input=>{input.value=choice.v;input.dispatchEvent(new Event('input',{bubbles:true}))});
   const button=[...document.querySelectorAll('#segelAnswers button')].find(b=>b.textContent===String(choice.v))||document.querySelector('#segelAnswers button')||document.createElement('button');
   button.classList.add('selected');tell('script-answer',{index,value:choice.v});PASegelDemo.submitInteraction(choice,button,run.q);
  };pending=setTimeout(perform,step.duration||3200);
 }
 window.PAJelajahBridge={target:focus?6:12,question:index=>{
  if(!engine)engine=PAJelajahEngine.create(grade,{seed:grade*2026,anchorSkill:scenario.skill});
  lastQuestion=engine.next(index,{adaptive:focus});if(!lastQuestion)throw new Error('Bank soalan sebenar tidak dapat dimuat.');return lastQuestion;
 },painted:run=>{
  clearTimeout(pending);perform=null;const index=run.asked,auto=!focus&&index>=6,answers=document.getElementById('segelAnswers');
  tell('question',{index,auto,skill:run.q.skill,title:typeof META!=='undefined'?META[run.q.skill]?.title:run.q.skill,target:focus?6:12});answers.inert=auto;answers.style.pointerEvents=auto?'none':'';
  const written=document.querySelector('#segelQuestion .paWaForm');if(written)written.inert=auto;
  if(!auto)return;if(!started){waiting=true;tell('autopilot-ready');return}schedule(run);
 },resolved:(index,correct,detail={})=>{
  if(focus||index>=6)engine.respond(lastQuestion,{v:detail.value,tag:correct?'correct':lastQuestion.wrong?.find(w=>String(w.v)===String(detail.value))?.tag||'generic'},correct);
  tell('resolved',{index,correct,skill:lastQuestion.skill,simulated:!focus&&index>=6,...detail});
 },finished:()=>{clearTimeout(pending);PASegelDemo.pause();tell('finished',{snapshot:engine.snapshot(),focus})},failed:message=>tell('failed',{message})};
 window.addEventListener('message',e=>{if(e.source!==parent||e.origin!==location.origin||e.data?.source!=='pa-jelajah-controller'||e.data.grade!==grade)return;
  if(e.data.type==='start-autopilot'&&waiting&&!started){started=true;waiting=false;schedule(PASegelDemo.state())}
  if(e.data.type==='advance-autopilot'&&started)perform?.();
  if(focus&&e.data.type==='focus-start'&&!engine){
   engine=PAJelajahEngine.create(grade,{seed:grade*2033,anchorSkill:scenario.skill,profile:e.data.snapshot?.profile,session:e.data.snapshot?.session});
   engine.focus(scenario.skill);begin();
  }
 });
 document.addEventListener('pointerdown',()=>tell('interaction'),{capture:true});
 function begin(){const original=window.openSegelDemo;window.openSegelDemo=()=>original({guestDemo:true,jelajah:true});PADemo.selectGrade(scenario.grade);PADemo.start()}
 window.addEventListener('DOMContentLoaded',()=>{if(focus)tell('focus-ready');else begin()});
})();
