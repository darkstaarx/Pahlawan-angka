// Pahlawan Angka v3.36.0 — Question System v2 shadow observability controls for DEV Mode.
(()=>{
  'use strict';
  const VERSION='3.36.0';

  function bridge(){return window.PAQuestionSystemV2Bridge||null}
  function devActive(){try{return !!(db&&typeof isDevMode==='function'&&isDevMode())}catch(_){return false}}
  function toast(msg){if(typeof showRewardToast==='function')showRewardToast(msg);else console.info('[QS v2 DEV]',msg)}
  function localShadowEvents(){
    try{
      if(!window.PATelemetry||typeof window.PATelemetry.read!=='function')return [];
      return window.PATelemetry.read().filter(e=>e&&e.type==='qsv2_shadow');
    }catch(_){return []}
  }
  function statusText(){
    const b=bridge();
    if(!b||typeof b.getStatus!=='function')return {headline:'Bridge belum siap',detail:'Runtime belum tersedia.'};
    const s=b.getStatus(),m=s.shadowMetrics||{},events=localShadowEvents();
    const mode=String(s.mode||'off').toUpperCase();
    const health=s.runtimeReady?'runtime siap':'runtime tiada';
    return {
      headline:`${mode} · ${health} · ${s.enabledStandards?.length||0} SP · ${s.battleCompatibleTemplates||0} MCQ`,
      detail:`Sesi: ${m.generated||0} generated · ${m.fallbacks||0} fallback · ${m.errors||0} error · last ${m.lastDurationMs==null?'—':m.lastDurationMs+' ms'} · device telemetry ${events.length}`
    };
  }
  function refresh(){
    const box=document.querySelector('[data-pa-qsv2-dev="3.36.0"]');if(!box)return;
    const t=statusText();
    const h=box.querySelector('[data-qsv2-headline]'),d=box.querySelector('[data-qsv2-detail]');
    if(h)h.textContent=t.headline;if(d)d.textContent=t.detail;
    const b=bridge(),s=b&&typeof b.getStatus==='function'?b.getStatus():null;
    box.querySelectorAll('[data-qsv2-mode]').forEach(btn=>btn.classList.toggle('devPrimary',s&&s.mode===btn.dataset.qsv2Mode));
    const kill=box.querySelector('[data-qsv2-kill]');if(kill){kill.textContent=s&&s.killSwitch?'Kill Switch: ON':'Kill Switch: OFF';kill.classList.toggle('danger',!!s?.killSwitch)}
  }
  function setMode(mode){
    if(!devActive())return toast('QS v2 controls hanya untuk DEV Mode.');
    const b=bridge();if(!b||typeof b.setPilotMode!=='function')return toast('QS v2 bridge belum siap.');
    b.setPilotMode(mode,true);toast(`QS v2 ${String(mode).toUpperCase()}`);refresh();
  }
  function toggleKill(){
    if(!devActive())return toast('QS v2 controls hanya untuk DEV Mode.');
    const b=bridge();if(!b||typeof b.setKillSwitch!=='function')return toast('QS v2 bridge belum siap.');
    const current=b.getStatus?.().killSwitch;b.setKillSwitch(!current);toast(`QS v2 kill switch ${!current?'ON':'OFF'}`);refresh();
  }
  function resetSession(){const b=bridge();if(b&&typeof b.resetShadowMetrics==='function')b.resetShadowMetrics();refresh()}
  function ensureControls(){
    const panel=document.getElementById('devPanel');
    if(!panel||panel.querySelector('[data-pa-qsv2-dev="3.36.0"]')){refresh();return}
    const box=document.createElement('div');
    box.className='devScenario paDevQSV2';box.dataset.paQsv2Dev=VERSION;
    box.innerHTML=`<b>Question System v2 · D3 Topic 7</b>
      <p class="mut devMiniCopy">Shadow menjana v2 di belakang tabir tetapi murid kekal melihat soalan legacy. Telemetry hanya menyimpan metadata teknikal pada peranti; tiada prompt, jawapan atau PII direkod.</p>
      <div class="devLabGrid"><button type="button" class="btn ghost small" data-qsv2-mode="off">OFF</button><button type="button" class="btn ghost small" data-qsv2-mode="shadow">SHADOW</button><button type="button" class="btn ghost small" data-qsv2-kill>Kill Switch: OFF</button><button type="button" class="btn ghost small" data-qsv2-reset>Reset Session Stats</button></div>
      <small class="mut" data-qsv2-headline>Memuat status…</small><small class="mut" data-qsv2-detail style="display:block;margin-top:4px"></small>`;
    const dimensi=panel.querySelector('[data-pa-dimensi-dev]');
    if(dimensi)dimensi.insertAdjacentElement('afterend',box);else panel.appendChild(box);
    box.querySelectorAll('[data-qsv2-mode]').forEach(btn=>btn.addEventListener('click',()=>setMode(btn.dataset.qsv2Mode)));
    box.querySelector('[data-qsv2-kill]')?.addEventListener('click',toggleKill);
    box.querySelector('[data-qsv2-reset]')?.addEventListener('click',resetSession);
    refresh();
  }

  const previousRenderDev=window.renderDevPanel;
  if(typeof previousRenderDev==='function'&&!previousRenderDev.__paQsv2DevWrapped){
    const wrapped=function(){const out=previousRenderDev.apply(this,arguments);ensureControls();return out};
    wrapped.__paQsv2DevWrapped=true;wrapped.__paQsv2DevOriginal=previousRenderDev;window.renderDevPanel=wrapped;
  }
  window.PADevQSV2={version:VERSION,ensureControls,refresh,setMode,toggleKill,localShadowEvents};
  ensureControls();setInterval(refresh,1500);
})();
