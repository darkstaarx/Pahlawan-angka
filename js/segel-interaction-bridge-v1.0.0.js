/* Pahlawan Angka — Segel Demo v2 -> production question interaction bridge v1.0.1.
 *
 * Purpose:
 * - Keep Segel Demo's rescue/reward flow untouched.
 * - Preserve Demo v2's original 2x2 answer-button visual for normal MCQ/sigil questions.
 * - Use PAGameQuestionInteractions only when the question genuinely needs a constructed interaction.
 * - Run interaction callbacks against run.sess, never the learner's live sess.
 * - Fall back to the Demo's original MCQ buttons if a question cannot be bridged.
 */
(()=>{
  'use strict';

  const VERSION='1.0.1';
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

  function armDemoSession(root,run){
    let armed=false, previousSession=null, previousRetry;

    const enter=()=>{
      if(armed||typeof sess==='undefined')return;
      previousSession=sess;
      previousRetry=run.sess.retryState;
      // Segel Demo is one-attempt-per-question. Making retryState truthy only
      // during the click tells the production renderer to lock after a miss,
      // instead of re-enabling the same control while Demo advances onward.
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
    if(bridgedQuestion===q&&box.querySelector('.paInteraction'))return;

    const fallback=fallbackButtons(q,box);
    if(!fallback)return; // preserve the existing MCQ safely

    // The production interaction engine also has a generic sigil-select skin.
    // Demo v2 already has its own approved answer-button visual, so ordinary
    // selection questions must stay exactly on that skin. Only constructed
    // response families are allowed to replace the Demo buttons.
    const spec=typeof engine.answerSpec==='function'
      ? engine.answerSpec(q,q.skill||'',{})
      : null;
    if(!spec||spec.kind==='sigil_select'){
      bridgedQuestion=q;
      box.className=demoAnswerClass;
      box.dataset.segelDemoInteraction='demo-mcq';
      return;
    }

    if(!q.token){
      run.sess.questionToken=(run.sess.questionToken||0)+1;
      q.token=run.sess.questionToken;
    }
    run.sess.q=q;

    // Mark first: render() mutates #segelAnswers and triggers this observer.
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
      box.className=demoAnswerClass;
      box.dataset.segelDemoInteraction='demo-mcq';
      return;
    }

    const root=box.querySelector('.paInteraction');
    if(root){
      root.dataset.segelDemoBridge=VERSION;
      armDemoSession(root,run);
    }
    box.dataset.segelDemoInteraction='production-constructed';
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
