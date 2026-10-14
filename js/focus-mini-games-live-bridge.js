/* Focus mini-game bridge for Kedai Kek (pecahan) and Bengkel Ajaib (ukuran).
   Completed turns add learner-review evidence only; gameplay stars never write
   mastery, progress, or reward state. */
(function(){
'use strict';
let run=null;
const text=x=>String(x??'').trim();
const nonce=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
const GAMES={
 fraction:{id:'kedai-kek',title:'Kedai Kek',router:()=>window.PAKedaiKek,message:'PA_KEDAI_KEK_ROUND',page:'kedai-kek.html'},
 measure:{id:'bengkel-ajaib',title:'Bengkel Ajaib',router:()=>window.PABengkelAjaib,message:'PA_BENGKEL_AJAIB_ROUND',page:'bengkel-ajaib.html'}
};
function gameFor(skillId){return /^D[1-6]\.FRAC$|^D2\.3\.(1|3|4)$/.test(skillId)?GAMES.fraction:/^D[1-6]\.MEASURE$|^D2\.6\.[1-4]$/.test(skillId)?GAMES.measure:null}
function allowedSession(){return typeof db!=='undefined'&&db&&!db.demoMode&&!(typeof isDemoStudent==='function'&&isDemoStudent())&&!(typeof isDevMode==='function'&&isDevMode())&&!!window.PACommercial?.requireFeature?.('focus')&&!(typeof enforceRestuLock==='function'&&enforceRestuLock())}
function close(){if(!run)return;run.node.remove();run=null;document.body.classList.remove('pa-focus-minigame-active');window.PACloud?.syncSaveNow?.()}
function tryStartFocus(skillId){
 if(!allowedSession())return false;
 const grade=Number(db.schoolGrade),id=text(skillId),meta=typeof META==='undefined'?null:META[id],game=gameFor(id),router=game?.router();
 if(!game||!meta||Number(meta.grade)!==grade||!router?.planFor)return false;
 const plan=router.planFor(db,id);if(!plan||Number(plan.grade)!==grade||!Array.isArray(plan.start)||!plan.start.length)return false;
 if(run)close();
 const idNonce=nonce(),node=document.createElement('section');node.id='paFocusMiniGameOverlay';node.setAttribute('role','dialog');node.setAttribute('aria-modal','true');node.setAttribute('aria-label',game.title+' · Kemahiran Fokus');
 node.innerHTML='<div class="paFocusMiniGameNav"><b>'+game.title+' · Kemahiran Fokus · Darjah '+grade+'</b><button type="button" id="paFocusMiniGameExit">✕ Kembali</button></div><iframe title="'+game.title+' · Kemahiran Fokus" id="paFocusMiniGameFrame"></iframe><p class="paFocusMiniGameStatus" id="paFocusMiniGameStatus" aria-live="polite">Setiap jawapan membantu Cikgu Dimensi memilih latihan seterusnya.</p>';
 let style=document.getElementById('paFocusMiniGameBridgeStyle');if(!style){style=document.createElement('style');style.id='paFocusMiniGameBridgeStyle';style.textContent=`body.pa-focus-minigame-active{overflow:hidden!important}#paFocusMiniGameOverlay{position:fixed;z-index:2147483000;inset:0;background:#07111feF;display:flex;flex-direction:column;padding:0 max(0px,env(safe-area-inset-left)) env(safe-area-inset-bottom) max(0px,env(safe-area-inset-right));font:700 14px/1.35 system-ui,sans-serif;color:#fff}#paFocusMiniGameOverlay .paFocusMiniGameNav{min-height:48px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:6px 12px;background:#14335c;border-bottom:2px solid #b78b47}#paFocusMiniGameOverlay .paFocusMiniGameNav b{font-size:13px}#paFocusMiniGameOverlay button{border:1px solid #e7d9b7;border-radius:10px;background:#fffcf0;color:#123158;font-weight:900;padding:8px 11px;white-space:nowrap}#paFocusMiniGameOverlay iframe{width:100%;flex:1;min-height:0;border:0;background:#08101d}#paFocusMiniGameOverlay .paFocusMiniGameStatus{margin:0;padding:7px 12px;background:#fffcf0;color:#38567c;font-size:12px;text-align:center}@media(min-width:720px){#paFocusMiniGameOverlay{padding:14px}#paFocusMiniGameOverlay .paFocusMiniGameNav,#paFocusMiniGameOverlay .paFocusMiniGameStatus{max-width:650px;width:100%;margin-left:auto;margin-right:auto}#paFocusMiniGameOverlay iframe{max-width:650px;margin:0 auto;border-radius:14px;box-shadow:0 8px 32px #0008}}`;document.head.appendChild(style)}
 document.body.append(node);const frame=node.querySelector('#paFocusMiniGameFrame');run={node,frame,nonce:idNonce,grade,skillId:id,profile:db,plan,game,seen:new Set()};node.querySelector('#paFocusMiniGameExit').onclick=close;
 const params=new URLSearchParams({pa_focus_live:'1',skill:id,pa_nonce:idNonce});const [page,hash]=router.url(plan,game.page).split('#');frame.src=page+'?'+params.toString()+(hash?'#'+hash:'');
 document.body.classList.add('pa-focus-minigame-active');window.PAFocusPractice?.close?.();return true;
}
function receive(event){
 if(!run||event.origin!==location.origin||event.source!==run.frame.contentWindow)return;
 const m=event.data;if(!m||m.type!==run.game.message||m.version!==1||m.nonce!==run.nonce||Number(m.grade)!==run.grade||m.skillId!==run.skillId)return;
 if(db!==run.profile||Number(db?.schoolGrade)!==run.grade||typeof window.PALearnerReview?.beginQuestion!=='function')return;
 const mode=text(m.mode),archetype=text(m.archetypeId),questionKey=text(m.questionKey),index=Number(m.index??m.served);
 if(!questionKey||!Number.isInteger(index)||index<1||!mode||!archetype||run.seen.has(questionKey)||!run.plan.start.some(x=>x.mode===mode))return;
 run.seen.add(questionKey);const q={token:run.nonce+'-'+questionKey,questionId:run.game.id+':'+questionKey,skill:run.skillId,archetypeId:archetype,representation:run.game.id==='kedai-kek'?'fraction_visual':'measurement_tool',demand:'application',difficultyBand:Math.max(1,Math.min(4,Number(m.tier)||1)),prompt:text(m.prompt).slice(0,600)};
 const context={grade:run.grade,mode:'practice',selectionReason:'focus-'+run.game.id,demoMode:false,devMode:false};if(!window.PALearnerReview.beginQuestion(q,context))return;
 const misses=Math.max(0,Math.min(20,Number(m.misses)||0)),hints=Math.max(0,Math.min(20,Number(m.hints)||0));if(misses)window.PALearnerReview.firstWrong(q,{tag:'generic'});if(hints)window.PALearnerReview.hintUsed(q,hints);
 const encounter=window.PALearnerReview.resolve(q,{correct:true,usedHint:hints>0,hintLevel:hints,seconds:0},run.profile);if(!encounter)return;
 if(typeof save==='function')save();window.PACloud?.scheduleSave?.();const status=run.node.querySelector('#paFocusMiniGameStatus');
 if(status)status.textContent='Bukti latihan direkod: '+run.seen.size+' cabaran '+(run.game.id==='kedai-kek'?'Pecahan':'Ukuran')+'. Bintang permainan tidak mengubah mastery.';
}
window.addEventListener('message',receive);window.PAFocusMiniGamesLive={tryStartFocus,close,gameFor};
})();
