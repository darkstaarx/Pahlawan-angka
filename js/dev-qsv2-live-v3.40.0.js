// Pahlawan Angka v3.40.0 — DEV-only controlled LIVE cutover controls.
(()=>{
 'use strict';
 const VERSION='3.40.0';
 function devActive(){try{return !!(db&&typeof isDevMode==='function'&&isDevMode())}catch(_){return false}}
 function toast(m){if(typeof showRewardToast==='function')showRewardToast(m);else console.info('[QS v2 LIVE]',m)}
 function cutover(){return window.PAD3Topic7LiveCutover||null}
 function refresh(){
  const box=document.querySelector('[data-pa-qsv2-live="3.40.0"]');if(!box)return;
  const c=cutover(),s=c&&db?c.getStatus(db):null,b=window.PAQuestionSystemV2Bridge?.getStatus?.(),e=s?.evidence;
  box.querySelector('[data-live-headline]').textContent=s?`${s.controlledLive?'CONTROLLED LIVE':'SHADOW'} · ${s.devAuthorized?'admin/dev sah':'tidak authorized'} · ${b?.battleCompatibleTemplates||0} MCQ`:'Cutover belum siap';
  box.querySelector('[data-live-detail]').textContent=e?.ok?`Evidence: ${e.totalAttempts} attempt · ${e.secureCompetencies}/6 competency secure · legacy excluded`:'Evidence epoch belum tersedia';
  const on=box.querySelector('[data-live-activate]'),off=box.querySelector('[data-live-deactivate]');if(on)on.disabled=!!s?.controlledLive;if(off)off.disabled=!s?.controlledLive;
 }
 function activate(){if(!devActive())return toast('Controlled LIVE hanya untuk DEV/admin.');const r=cutover()?.activate?.(db);toast(r?.ok?'D3 Topic 7 Controlled LIVE aktif':`LIVE ditolak: ${r?.reason||'unknown'}`);refresh()}
 function deactivate(){if(!devActive())return toast('Controlled LIVE hanya untuk DEV/admin.');cutover()?.deactivate?.(db);toast('D3 Topic 7 kembali SHADOW');refresh()}
 function ensure(){const panel=document.getElementById('devPanel');if(!panel||panel.querySelector('[data-pa-qsv2-live="3.40.0"]')){refresh();return}const box=document.createElement('div');box.className='devScenario paDevQSV2Live';box.dataset.paQsv2Live=VERSION;box.innerHTML=`<b>QS v2 · Controlled LIVE · D3 Topic 7</b><p class="mut devMiniCopy">Admin-device pilot sahaja. LIVE hanya memaparkan bank MCQ battle-compatible yang diluluskan. Legacy fallback dan kill switch kekal aktif. Corak binaan/paksi lukisan belum diroute ke battle.</p><div class="devLabGrid"><button type="button" class="btn ghost small" data-live-activate>Aktifkan LIVE Pilot</button><button type="button" class="btn ghost small" data-live-deactivate>Kembali SHADOW</button></div><small class="mut" data-live-headline>Memuat status…</small><small class="mut" data-live-detail style="display:block;margin-top:4px"></small>`;panel.appendChild(box);box.querySelector('[data-live-activate]').addEventListener('click',activate);box.querySelector('[data-live-deactivate]').addEventListener('click',deactivate);refresh()}
 const prev=window.renderDevPanel;if(typeof prev==='function'&&!prev.__paQsv2LiveWrapped){const wrapped=function(){const out=prev.apply(this,arguments);ensure();return out};wrapped.__paQsv2LiveWrapped=true;wrapped.__paQsv2LiveOriginal=prev;window.renderDevPanel=wrapped}
 window.PADevQSV2Live={version:VERSION,ensure,refresh,activate,deactivate};ensure();setInterval(refresh,1500);
})();
