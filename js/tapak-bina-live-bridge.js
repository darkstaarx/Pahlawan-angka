/* Arkitek Dimensi — focused Ruang practice bridge.
   Uses the supplied game and its grade-specific bank. Completed answers are
   added to the existing learner-review evidence only; no mastery or reward
   state is written by this bridge. */
(function(){
'use strict';
let run=null;
const text=x=>String(x??'').trim();
function nonce(){return crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`}
function allowedSession(){
 return typeof db!=='undefined'&&db&&!db.demoMode&&
  !(typeof isDemoStudent==='function'&&isDemoStudent())&&
  !(typeof isDevMode==='function'&&isDevMode())&&
  !!window.PACommercial?.requireFeature?.('focus')&&
  !(typeof enforceRestuLock==='function'&&enforceRestuLock());
}
function close(){if(!run)return;run.node.remove();run=null;document.body.classList.remove('pa-tapak-bina-active');window.PACloud?.syncSaveNow?.()}
function isActiveFrame(frame,nonce,skillId){return!!run&&run.frame.contentWindow===frame&&run.nonce===nonce&&run.skillId===skillId}
function tryStartFocus(skillId){
 if(!allowedSession())return false;
 const grade=Number(db.schoolGrade),id=text(skillId),meta=typeof META==='undefined'?null:META[id],router=window.PATapakBina;
 if(!meta||Number(meta.grade)!==grade||!router?.planFor)return false;
 const plan=router.planFor(db,id);
 if(!plan||Number(plan.grade)!==grade||!Array.isArray(plan.fams)||!plan.fams.length)return false;
 if(run)close();
 const idNonce=nonce(),node=document.createElement('section');node.id='paTapakBinaOverlay';node.setAttribute('role','dialog');node.setAttribute('aria-modal','true');node.setAttribute('aria-label','Arkitek Dimensi · Kemahiran Fokus Ruang');
 node.innerHTML='<div class="paTapakBinaNav"><b>Arkitek Dimensi · Fokus Ruang · Darjah '+grade+'</b><button type="button" id="paTapakBinaExit">✕ Kembali</button></div><iframe title="Arkitek Dimensi · Kemahiran Fokus Ruang" id="paTapakBinaFrame"></iframe><p class="paTapakBinaStatus" id="paTapakBinaStatus" aria-live="polite">Setiap jawapan membantu Cikgu Dimensi memilih latihan seterusnya.</p>';
 let style=document.getElementById('paTapakBinaBridgeStyle');
 if(!style){style=document.createElement('style');style.id='paTapakBinaBridgeStyle';style.textContent=`body.pa-tapak-bina-active{overflow:hidden!important}#paTapakBinaOverlay{position:fixed;z-index:2147483000;inset:0;background:#07111feF;display:flex;flex-direction:column;padding:0 max(0px,env(safe-area-inset-left)) env(safe-area-inset-bottom) max(0px,env(safe-area-inset-right));font:700 14px/1.35 system-ui,sans-serif;color:#fff}#paTapakBinaOverlay .paTapakBinaNav{min-height:48px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:6px 12px;background:#14335c;border-bottom:2px solid #b78b47}#paTapakBinaOverlay .paTapakBinaNav b{font-size:13px}#paTapakBinaOverlay button{border:1px solid #e7d9b7;border-radius:10px;background:#fffcf0;color:#123158;font-weight:900;padding:8px 11px;white-space:nowrap}#paTapakBinaOverlay iframe{width:100%;flex:1;min-height:0;border:0;background:#08101d}#paTapakBinaOverlay .paTapakBinaStatus{margin:0;padding:7px 12px;background:#fffcf0;color:#38567c;font-size:12px;text-align:center}@media(min-width:720px){#paTapakBinaOverlay{padding:14px}#paTapakBinaOverlay .paTapakBinaNav,#paTapakBinaOverlay .paTapakBinaStatus{max-width:650px;width:100%;margin-left:auto;margin-right:auto}#paTapakBinaOverlay iframe{max-width:650px;margin:0 auto;border-radius:14px;box-shadow:0 8px 32px #0008}}`;
  document.head.appendChild(style)}
 document.body.append(node);
 const frame=node.querySelector('#paTapakBinaFrame');run={node,frame,nonce:idNonce,grade,skillId:id,profile:db,plan,seen:new Set()};
 node.querySelector('#paTapakBinaExit').onclick=close;
 const params=new URLSearchParams({pa_focus_live:'ruang',pa_grade:String(grade),pa_origin_skill:id,pa_nonce:idNonce});
 const [page,hash]=router.url(plan).split('#');frame.src=page+'?'+params.toString()+(hash?'#'+hash:'');
 document.body.classList.add('pa-tapak-bina-active');window.PAFocusPractice?.close?.();
 return true;
}
function receive(event){
 if(!run||event.origin!==location.origin||event.source!==run.frame.contentWindow)return;
 const m=event.data;if(!m||m.type!=='PA_TAPAK_BINA_ROUND'||m.version!==1||m.nonce!==run.nonce||m.skillId!==run.skillId||Number(m.grade)!==run.grade)return;
 if(db!==run.profile||Number(db?.schoolGrade)!==run.grade||typeof window.PALearnerReview?.beginQuestion!=='function')return;
 const row=m.round,questionKey=text(row?.questionKey),index=Number(row?.index),family=text(row?.family),arch=text(row?.archetypeId);
 if(!questionKey||!Number.isInteger(index)||index<1||!arch||!family||run.seen.has(questionKey))return;
 const hit=window.PATapakBina?.mapArch?.(run.grade,run.skillId,arch);
 if(!hit||hit.fam!==family||!run.plan.fams.some(x=>x.fam===family))return;
 run.seen.add(questionKey);
 const q={token:run.nonce+'-'+questionKey,questionId:'arkitek-dimensi:'+questionKey,skill:run.skillId,archetypeId:arch,
  representation:text(row.representation||'visual'),demand:text(row.demand||'concept'),difficultyBand:Math.max(1,Math.min(4,Number(row.difficultyBand)||1)),prompt:text(row.prompt).slice(0,600)};
 const context={grade:run.grade,mode:'practice',selectionReason:'focus-arkitek-dimensi',demoMode:false,devMode:false};
 if(!window.PALearnerReview.beginQuestion(q,context))return;
 const misses=Math.max(0,Math.min(20,Number(row.misses)||0)),hints=Math.max(0,Math.min(20,Number(row.hints)||0));
 if(misses)window.PALearnerReview.firstWrong(q,{tag:'generic'});
 if(hints)window.PALearnerReview.hintUsed(q,hints);
 const encounter=window.PALearnerReview.resolve(q,{correct:true,usedHint:hints>0,hintLevel:hints,seconds:0},run.profile);
 if(!encounter)return;
 if(typeof save==='function')save();window.PACloud?.scheduleSave?.();
 const status=run.node.querySelector('#paTapakBinaStatus');
 if(status)status.textContent='Bukti latihan direkod: '+run.seen.size+' cabaran Ruang. Tiada perubahan mastery daripada bintang permainan.';
}
window.addEventListener('message',receive);
window.PATapakBinaLive={tryStartFocus,close,isActiveFrame};
})();
