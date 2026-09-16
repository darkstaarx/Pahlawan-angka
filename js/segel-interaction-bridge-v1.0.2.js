/* Pahlawan Angka — Segel Demo v2 -> production question interaction bridge v1.0.2.
 *
 * Demo visual is authoritative. Never infer a constructed interaction merely
 * from the shape of an answer (for example 3/10, 3:30 or a numeric value).
 * Production interaction UI is allowed only when the question explicitly opts
 * in with demoInteraction=true or interactionAuthored=true.
 */
(()=>{
  'use strict';

  const VERSION='1.0.2';
  let bridgedQuestion=null;
  let scheduled=false;
  let engineRetries=0;
  let demoAnswerClass='answers';

  const plain=value=>String(value??'')
    .replace(/<[^>]*>/g,' ')
    .replace(/\s+/g,' ')
    .trim();

  function state(){
    try{return window.PASegelDemo?.state?.()||null}catch(_){return null}
  }

  function withDemoSession(run,fn){
    const hasSession=typeof sess!=='undefined';
    const previous=hasSession?sess:null;
    try{
      if(hasSession)sess=run.sess;
      return fn();
    }finally{
      if(hasSession)sess=previous;
    }
  }

  function fallbackButtons(q,box){
    const buttons=[...box.querySelectorAll('button.ans')];
    if(buttons.length<2)return null;
    const expected=plain(q.answer);
    const correct=buttons.find(b=>plain(b.textContent)===expected);
    if(!correct)return null;
    const wrong=buttons.find(b=>b!==correct);
    if(!wrong)return null;
    return {correct,wrong};
  }

  function explicitSpec(q,engine){
    const optedIn=q?.demoInteraction===true||q?.interactionAuthored===true;
    if(!optedIn)return null;
    if(q?.interaction?.spec&&q.interaction.spec.kind!=='sigil_select')return q.interaction.spec;
    if(typeof engine?.answerSpec!=='function')return null;
    const spec=engine.answerSpec(q,q.skill||'',{});
    return spec?.kind&&spec.kind!=='sigil_select'?spec:null;
  }

  function armDemoSession(root,run){
    let armed=false,previousSession=null,previousRetry;
    const enter=()=>{
      if(armed||typeof sess==='undefined')return;
      previousSession=sess;
      previousRetry=run.sess.retryState;
      run.sess.retryState={demoSingleAttempt:true};
      sess=run.sess;
      armed=true;
    };
    const leave=()=>{
      if(!armed||typeof sess==='undefined')return;
      sess=previousSession;
      run.sess.retryState=previousRetry;
      armed=false;
    };
    root.addEventListener('click',enter,true);
    root.addEventListener('click',leave,false);
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    const kick=()=>{scheduled=false;bridgeCurrentQuestion()};
    if(typeof queueMicrotask==='function')queueMicrotask(kick);
    else Promise.resolve().then(kick);
  }

  function restoreDemoVisual(box,q){
    const fallback=fallbackButtons(q,box);
    if(fallback){
      bridgedQuestion=q;
      box.className=demoAnswerClass;
      box.dataset.segelDemoInteraction='demo-mcq';
      delete box.dataset.segelVisualReset;
      return true;
    }

    // If an older bridge already replaced the buttons in this live page,
    // rebuild the question once through the Demo's own drawQuestion() path.
    if(box.querySelector('.paInteraction')&&box.dataset.segelVisualReset!=='1'){
      box.dataset.segelVisualReset='1';
      setTimeout(()=>{ try{window.restartSegelDemo?.()}catch(_){} },0);
    }
    return false;
  }

  function bridgeCurrentQuestion(){
    const engine=window.PAGameQuestionInteractions;
    if(!engine?.render){
      if(engineRetries++<40)setTimeout(schedule,100);
      return;
    }
    engineRetries=0;

    const box=document.getElementById('segelAnswers');
    const run=state();
    const q=run?.q;
    if(!box||!run?.sess||!q)return;

    const spec=explicitSpec(q,engine);
    if(!spec){
      restoreDemoVisual(box,q);
      return;
    }

    if(bridgedQuestion===q&&box.querySelector('.paInteraction'))return;
    const fallback=fallbackButtons(q,box);
    if(!fallback)return;

    if(!q.token){
      run.sess.questionToken=(run.sess.questionToken||0)+1;
      q.token=run.sess.questionToken;
    }
    run.sess.q=q;
    q.interaction={type:spec.kind,spec};

    bridgedQuestion=q;
    const rendered=withDemoSession(run,()=>engine.render(q,box,{
      session:run.sess,
      respond:(choice,interactiveButton)=>{
        const correct=choice?.tag==='correct';
        if(interactiveButton?.classList)interactiveButton.classList.add(correct?'ok':'no');
        const target=correct?fallback.correct:fallback.wrong;
        if(typeof target?.onclick==='function')target.onclick.call(target);
      }
    }));

    if(!rendered){
      bridgedQuestion=null;
      restoreDemoVisual(box,q);
      return;
    }

    const root=box.querySelector('.paInteraction');
    if(root){
      root.dataset.segelDemoBridge=VERSION;
      armDemoSession(root,run);
    }
    box.dataset.segelDemoInteraction='production-explicit';
  }

  function install(){
    const box=document.getElementById('segelAnswers');
    if(!box){setTimeout(install,100);return}
    if(box.dataset.segelBridgeObserver==='1'){schedule();return}
    demoAnswerClass=box.className||'answers';
    box.dataset.segelBridgeObserver='1';
    new MutationObserver(schedule).observe(box,{childList:true});
    schedule();
  }

  if(typeof document!=='undefined'){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
    else install();
  }

  window.PASegelInteractionBridge={version:VERSION,sync:schedule};
})();
