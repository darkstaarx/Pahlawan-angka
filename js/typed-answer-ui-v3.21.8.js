// Pahlawan Angka v3.21.8 — typed-answer UI hotfix.
// Observer-free. Polish exactly once after nextQ renders the typed form.
(()=>{
  'use strict';
  const VERSION='3.21.8';
  let typedFocused=false;
  let maxViewportHeight=window.visualViewport?.height||window.innerHeight||0;

  function syncKeyboardState(){
    const vv=window.visualViewport;
    if(vv?.height)maxViewportHeight=Math.max(maxViewportHeight,vv.height);
    const keyboardOpen=!!(typedFocused&&vv&&maxViewportHeight>0&&vv.height<maxViewportHeight*.82);
    document.body?.classList.toggle('paTypedKeyboardOpen',keyboardOpen);
  }

  function clearStaleCardState(){
    document.querySelectorAll('.qcard.paTypedQCard').forEach(card=>{
      if(!card.querySelector('.paTypedAnswer'))card.classList.remove('paTypedQCard');
    });
    document.querySelectorAll('.answers.paTypedAnswers').forEach(answers=>{
      if(!answers.querySelector('.paTypedAnswer'))answers.classList.remove('paTypedAnswers');
    });
  }

  function polishTypedForm(form){
    if(!(form instanceof HTMLElement)||!form.classList.contains('paTypedAnswer'))return false;
    if(form.dataset.paTypedPolished===VERSION)return true;

    const input=form.querySelector('.paTypedInput');
    const button=form.querySelector('.paTypedSubmit');
    const label=form.querySelector('.paTypedLabel');
    if(!input||!button||!label)return false;

    form.dataset.paTypedPolished=VERSION;
    form.classList.add('paTypedAnswerClean');

    const labelText=document.createElement('b');
    labelText.textContent='Jawapan kamu';
    label.replaceChildren(labelText);
    label.classList.add('paTypedLabelClean');
    form.querySelector('.paTypedNote')?.remove();

    input.placeholder='Jawapan';
    input.setAttribute('aria-label','Jawapan kamu');
    input.setAttribute('enterkeyhint','done');
    input.spellcheck=false;

    button.textContent='Jawab';
    button.setAttribute('aria-label','Hantar jawapan');

    form.closest('.answers')?.classList.add('paTypedAnswers');
    form.closest('.qcard')?.classList.add('paTypedQCard');
    return true;
  }

  function polishCurrentTyped(){
    clearStaleCardState();
    const form=document.querySelector('.paTypedAnswer');
    if(form)polishTypedForm(form);
  }

  const previousNextQ=window.nextQ;
  if(typeof previousNextQ==='function'){
    window.nextQ=function(){
      const out=previousNextQ.apply(this,arguments);
      polishCurrentTyped();
      return out;
    };
  }

  polishCurrentTyped();

  document.addEventListener('focusin',event=>{
    if(event.target?.matches?.('.paTypedInput')){
      typedFocused=true;
      document.body?.classList.add('paTypedInputFocused');
      syncKeyboardState();
    }
  });
  document.addEventListener('focusout',event=>{
    if(event.target?.matches?.('.paTypedInput')){
      typedFocused=false;
      document.body?.classList.remove('paTypedInputFocused','paTypedKeyboardOpen');
    }
  });

  window.visualViewport?.addEventListener('resize',syncKeyboardState,{passive:true});
  window.visualViewport?.addEventListener('scroll',syncKeyboardState,{passive:true});

  window.PATypedAnswerUI={version:VERSION,polish:polishTypedForm,refresh:polishCurrentTyped,observer:false};
  document.documentElement.dataset.typedAnswerUi=VERSION;
  const version=document.querySelector('.loginVersion');
  if(version)version.textContent=`Pahlawan Angka · v${VERSION}`;
})();
