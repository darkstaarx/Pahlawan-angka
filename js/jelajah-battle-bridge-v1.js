(()=>{'use strict';
 const grade=Number(new URLSearchParams(location.search).get('grade'))||1;
 const scenario=PAJelajahScenarios.get(grade);
 const tell=(type,data={})=>parent.postMessage({source:'pa-jelajah',type,grade:scenario.grade,...data},location.origin);
 let pending;
 window.PAJelajahBridge={
  question:index=>scenario.questions[index],
  painted:run=>{
   clearTimeout(pending);
   const index=run.asked,auto=index>=6;
   document.getElementById('segelTitle').textContent=scenario.topic;
   tell('question',{index,auto,remediation:index>=8});
   if(!auto)return;
   document.getElementById('segelAnswers').style.pointerEvents='none';
   document.getElementById('segelAnswers').inert=true;
   document.getElementById('segelHint').disabled=true;
   const correct=scenario.script[index-6];
   document.getElementById('segelFeedback').textContent=index>=8?'Simulasi pemulihan: '+scenario.hint:'Autopilot simulasi: contoh kesilapan berulang.';
   pending=setTimeout(()=>{
    if(PASegelDemo.state()!==run||run.locked||run.asked!==index)return;
    const choice=correct?{v:run.q.answer,tag:'correct'}:run.q.wrong[0];
    const button=[...document.querySelectorAll('#segelAnswers button')].find(b=>b.textContent===choice.v)||document.createElement('button');
    PASegelDemo.submitInteraction(choice,button,run.q);
   },2200);
  },
  resolved:(index,correct)=>tell('resolved',{index,correct,simulated:index>=6}),
  finished:()=>{clearTimeout(pending);PASegelDemo.pause();tell('finished')},
  failed:message=>tell('failed',{message})
 };
 window.addEventListener('DOMContentLoaded',()=>{
  const original=window.openSegelDemo;
  window.openSegelDemo=()=>original({guestDemo:true,jelajah:true});
  PADemo.selectGrade(scenario.grade);PADemo.start();
 });
})();
