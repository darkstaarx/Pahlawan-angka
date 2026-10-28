(()=>{'use strict';
 if(new URLSearchParams(location.search).get('activity')==='coach')return;
 const grade=Number(new URLSearchParams(location.search).get('grade'))||1,scenario=PAJelajahScenarios.get(grade);
 const tell=(type,data={})=>parent.postMessage({source:'pa-jelajah',type,grade:scenario.grade,...data},location.origin);
 let pending,perform,started=false,waiting=false;
 function schedule(run){
  clearTimeout(pending);const index=run.asked,step=scenario.scriptSteps[index-6],hint=document.getElementById('segelHint');
  if(index>=8){hint.disabled=false;hint.click()}hint.disabled=true;
  document.getElementById('jelajahVisualHelp')?.remove();
  if(index===9&&window.PACikguManipulatives?.scene){
   const model=document.createElement('div');model.id='jelajahVisualHelp';model.className='jelajahVisualHelp';
   model.innerHTML=PACikguManipulatives.scene(scenario.coachMode,2,{id:scenario.skill,title:scenario.grade===4?'Penukaran unit':scenario.topic});
   document.querySelector('#segelQuestion .segelPrompt')?.append(model);
  }
  document.getElementById('segelFeedback').textContent=step.label+' · '+step.help;
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
 window.PAJelajahBridge={question:index=>scenario.questions[index],painted:run=>{
  clearTimeout(pending);perform=null;const index=run.asked,auto=index>=6,answers=document.getElementById('segelAnswers');
  document.getElementById('segelTitle').textContent=scenario.topic;tell('question',{index,auto});answers.inert=auto;answers.style.pointerEvents=auto?'none':'';
  const written=document.querySelector('#segelQuestion .paWaForm');if(written)written.inert=auto;
  if(!auto)return;if(!started){waiting=true;tell('autopilot-ready');return}schedule(run);
 },resolved:(index,correct,detail={})=>tell('resolved',{index,correct,simulated:index>=6,...detail}),finished:()=>{clearTimeout(pending);PASegelDemo.pause();tell('finished')},failed:message=>tell('failed',{message})};
 window.addEventListener('message',e=>{if(e.source!==parent||e.origin!==location.origin||e.data?.source!=='pa-jelajah-controller'||e.data.grade!==grade)return;
  if(e.data.type==='start-autopilot'&&waiting&&!started){started=true;waiting=false;schedule(PASegelDemo.state())}
  if(e.data.type==='advance-autopilot'&&started)perform?.();
 });
 document.addEventListener('pointerdown',()=>tell('interaction'),{capture:true});
 window.addEventListener('DOMContentLoaded',()=>{const original=window.openSegelDemo;window.openSegelDemo=()=>original({guestDemo:true,jelajah:true});PADemo.selectGrade(scenario.grade);PADemo.start()});
})();
