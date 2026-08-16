// Pahlawan Angka v3.21.7 — clean typed-answer presentation layer.
(()=>{
  'use strict';
  const VERSION='3.21.7';
  let typedFocused=false;
  let maxViewportHeight=window.visualViewport?.height||window.innerHeight||0;

  function syncKeyboardState(){
    const vv=window.visualViewport;
    if(vv?.height)maxViewportHeight=Math.max(maxViewportHeight,vv.height);
    const keyboardOpen=!!(typedFocused&&vv&&maxViewportHeight>0&&vv.height<maxViewportHeight*.82);
    document.body?.classList.toggle('paTypedKeyboardOpen',keyboardOpen);
  }

  function syncCardState(){
    document.querySelectorAll('.qcard.paTypedQCard').forEach(card=>{
      if(!card.querySelector('.paTypedAnswer'))card.classList.remove('paTypedQCard');
    });
    document.querySelectorAll('.answers.paTypedAnswers').forEach(answers=>{
      if(!answers.querySelector('.paTypedAnswer'))answers.classList.remove('paTypedAnswers');
    });
  }

  function polishTypedForm(form){
    if(!(form instanceof HTMLElement)||!form.classList.contains('paTypedAnswer'))return;
    const input=form.querySelector('.paTypedInput');
    const button=form.querySelector('.paTypedSubmit');
    const label=form.querySelector('.paTypedLabel');
    if(!input||!button||!label)return;

    form.classList.add('paTypedAnswerClean');

    // Pupil-facing copy only. Remove experiment/debug wording.
    label.innerHTML='<b>Jawapan kamu</b>';
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
  }

  function scan(root=document){
    if(root instanceof HTMLElement&&root.matches('.paTypedAnswer'))polishTypedForm(root);
    root.querySelectorAll?.('.paTypedAnswer').forEach(polishTypedForm);
    syncCardState();
  }

  const observer=new MutationObserver(records=>{
    let needsScan=false;
    for(const record of records){
      if(record.type==='childList'){needsScan=true;break;}
    }
    if(needsScan)queueMicrotask(()=>scan(document));
  });

  function start(){
    scan(document);
    observer.observe(document.body||document.documentElement,{childList:true,subtree:true});

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
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();

  window.PATypedAnswerUI={version:VERSION,polish:polishTypedForm,scan};
  document.documentElement.dataset.typedAnswerUi=VERSION;
  const version=document.querySelector('.loginVersion');
  if(version)version.textContent=`Pahlawan Angka · v${VERSION}`;
})();
