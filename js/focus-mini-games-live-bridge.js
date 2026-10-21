/* Focus mini-game bridge for tagged games. Completed turns add learner-review evidence only.
   Completed turns add learner-review evidence only; gameplay stars never write
   mastery, progress, or reward state. */
(function(){
'use strict';
let run=null;
const text=x=>String(x??'').trim();
const nonce=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
const GAMES={
 operations:{id:'gudang-harta',title:'Gudang Harta Wira',router:()=>window.PAGudangHarta,message:'PA_GUDANG_HARTA_ROUND',page:'gudang-harta.html'},
 fraction:{id:'kedai-kek',title:'Kedai Kek',router:()=>window.PAKedaiKek,message:'PA_KEDAI_KEK_ROUND',page:'kedai-kek.html'},
 measure:{id:'bengkel-ajaib',title:'Bengkel Ajaib',router:()=>window.PABengkelAjaib,message:'PA_BENGKEL_AJAIB_ROUND',page:'bengkel-ajaib.html'},
 ratio:{id:'dapur-ramuan',title:'Dapur Ramuan',router:()=>window.PADapurRamuan,message:'PA_DAPUR_RAMUAN_ROUND',page:'dapur-ramuan.html'},
 data:{id:'pos-peninjau',title:'Pos Peninjau',router:()=>window.PAPosPeninjau,message:'PA_POS_PENINJAU_ROUND',page:'pos-peninjau.html'},
 decimal:{id:'lombong-permata',title:'Lombong Permata',router:()=>window.PALombongPermata,message:'PA_LOMBONG_PERMATA_ROUND',page:'lombong-permata.html'}
};
function gameFor(skillId){const id=text(skillId),meta=typeof META==='undefined'?null:META[id];
 if(window.PAGudangHarta?.SKILL?.[id]&&['Nombor','Operasi'].includes(String(meta?.domain||'')))return GAMES.operations;
 if(/^D[1-6]\.FRAC$|^D2\.3\.(1|3|4)$/.test(id))return GAMES.fraction;
 if(/^D[1-6]\.MEASURE$|^D2\.6\.[1-4]$/.test(id))return GAMES.measure;
 if(window.PADapurRamuan?.SKILL?.[id]&&['Nisbah','Kadaran'].includes(String(meta?.domain||'')))return GAMES.ratio;
 if(window.PAPosPeninjau?.SKILL?.[id]&&['Data','Kebolehjadian'].includes(String(meta?.domain||'')))return GAMES.data;
 if(window.PALombongPermata?.SKILL?.[id]&&['Perpuluhan','Peratus'].includes(String(meta?.domain||'')))return GAMES.decimal;
 return null}
function allowedSession(){return typeof db!=='undefined'&&db&&!db.demoMode&&!!window.PACommercial?.requireFeature?.('focus')&&!(typeof enforceRestuLock==='function'&&enforceRestuLock())}
function persist(){if(typeof save==='function')save();window.PACloud?.scheduleSave?.()}
function resolvePending(correct){if(!run?.pending)return null;const p=run.pending,encounter=window.PALearnerReview?.resolve?.(p.q,{correct:!!correct,usedHint:p.hints>0,hintLevel:p.hints,seconds:0},run.profile)||null;run.pending=null;if(encounter)persist();return encounter}
function close(){if(!run)return;resolvePending(false);run.node.remove();run=null;document.body.classList.remove('pa-focus-minigame-active');window.PACloud?.syncSaveNow?.()}
function tryStartFocus(skillId,target=null){
 if(!allowedSession())return false;
 const grade=Number(db.schoolGrade),id=text(skillId),meta=typeof META==='undefined'?null:META[id],game=gameFor(id),router=game?.router();
 if(!game||!meta||Number(meta.grade)!==grade||!router?.planFor)return false;
 const plan=router.planFor(db,id);if(!plan||Number(plan.grade)!==grade||!Array.isArray(plan.start)||!plan.start.length)return false;
 if(run)close();
 const idNonce=nonce(),node=document.createElement('section');node.id='paFocusMiniGameOverlay';node.setAttribute('role','dialog');node.setAttribute('aria-modal','true');node.setAttribute('aria-label',game.title+' · Kemahiran Fokus');
 node.innerHTML='<div class="paFocusMiniGameNav"><b>'+game.title+' · Kemahiran Fokus · Darjah '+grade+'</b><button type="button" id="paFocusMiniGameExit">✕ Kembali</button></div><iframe title="'+game.title+' · Kemahiran Fokus" id="paFocusMiniGameFrame"></iframe><p class="paFocusMiniGameStatus" id="paFocusMiniGameStatus" aria-live="polite">Habiskan satu sesi, Wira!</p>';
 let style=document.getElementById('paFocusMiniGameBridgeStyle');if(!style){style=document.createElement('style');style.id='paFocusMiniGameBridgeStyle';style.textContent=`body.pa-focus-minigame-active{overflow:hidden!important}#paFocusMiniGameOverlay{position:fixed;z-index:2147483000;inset:0;background:#07111feF;display:flex;flex-direction:column;padding:0 max(0px,env(safe-area-inset-left)) env(safe-area-inset-bottom) max(0px,env(safe-area-inset-right));font:700 14px/1.35 system-ui,sans-serif;color:#fff}#paFocusMiniGameOverlay .paFocusMiniGameNav{min-height:48px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:6px 12px;background:#14335c;border-bottom:2px solid #b78b47}#paFocusMiniGameOverlay .paFocusMiniGameNav b{font-size:13px}#paFocusMiniGameOverlay button{border:1px solid #e7d9b7;border-radius:10px;background:#fffcf0;color:#123158;font-weight:900;padding:8px 11px;white-space:nowrap}#paFocusMiniGameOverlay iframe{width:100%;flex:1;min-height:0;border:0;background:#08101d}#paFocusMiniGameOverlay .paFocusMiniGameStatus{margin:0;padding:7px 12px;background:#fffcf0;color:#38567c;font-size:12px;text-align:center}@media(min-width:720px){#paFocusMiniGameOverlay{padding:14px}#paFocusMiniGameOverlay .paFocusMiniGameNav,#paFocusMiniGameOverlay .paFocusMiniGameStatus{max-width:650px;width:100%;margin-left:auto;margin-right:auto}#paFocusMiniGameOverlay iframe{max-width:650px;margin:0 auto;border-radius:14px;box-shadow:0 8px 32px #0008}}`;document.head.appendChild(style)}
 document.body.append(node);const frame=node.querySelector('#paFocusMiniGameFrame');run={node,frame,nonce:idNonce,grade,skillId:id,profile:db,plan,game,seen:new Set(),pending:null};(window.PAMiniGameExit?window.PAMiniGameExit.guard(node.querySelector('#paFocusMiniGameExit'),frame,close):node.querySelector('#paFocusMiniGameExit').onclick=close);
 const params=new URLSearchParams({pa_focus_live:'1',skill:id,pa_nonce:idNonce});if(game.id==='gudang-harta'){params.set('focus_limits',JSON.stringify(plan.start.map(x=>({mode:x.mode,min:x.min??0,end:x.end}))));if(target&&target.kind!=='money')params.set('focus_target',JSON.stringify(target))}const [page,hash]=router.url(plan,game.page).split('#');frame.src=page+'?'+params.toString()+(hash?'#'+hash:'');
 document.body.classList.add('pa-focus-minigame-active');window.PAFocusPractice?.close?.();return true;
}
function questionFrom(m){
 const mode=text(m.mode),archetype=text(m.archetypeId),questionKey=text(m.questionKey),index=Number(m.index??m.served);
 if(!questionKey||!Number.isInteger(index)||index<1||!mode||!archetype||run.seen.has(questionKey))return null;
 const route=run.plan.start.find(x=>x.mode===mode);if(!route)return null;
 const tier=Number(m.tier),bank=run.game.router()?.ARCH?.[run.grade]?.[mode]||[];
 if(!Number.isInteger(tier)||tier<1||tier-1<(route.start??route.min??0)||tier-1>=bank.length||bank[tier-1]!==archetype)return null;
 if(run.game.id==='gudang-harta'){
  if(tier-1>route.end)return null;
 }
 const operation=run.game.id==='gudang-harta',representation=operation?(mode==='bina'?'place_value_model':'symbolic'):run.game.id==='kedai-kek'?'fraction_visual':run.game.id==='bengkel-ajaib'?'measurement_tool':run.game.id==='dapur-ramuan'?'ratio_model':run.game.id==='pos-peninjau'?'data_chart':'decimal_visual',q={token:run.nonce+'-'+questionKey,questionId:run.game.id+':'+questionKey,skill:run.skillId,archetypeId:archetype,representation,demand:mode==='masalah'?'application':run.game.id==='pos-peninjau'?'interpretation':'procedure',difficultyBand:Math.max(1,Math.min(4,tier)),prompt:text(m.prompt).slice(0,600)};
 return{q,questionKey,mode,index};
}
function beginPending(m){
 const row=questionFrom(m);if(!row)return null;
 if(run.pending?.questionKey===row.questionKey)return run.pending;
 resolvePending(false);
 const context={grade:run.grade,mode:'practice',selectionReason:'focus-'+run.game.id,demoMode:false,devMode:false};
 if(!window.PALearnerReview.beginQuestion(row.q,context))return null;
 run.pending={...row,hints:0,misses:0};return run.pending;
}
function receiveGudangProgress(m){
 const p=beginPending(m);if(!p)return;
 p.misses=Math.max(p.misses,Math.max(0,Math.min(20,Number(m.misses)||0)));
 p.hints=Math.max(p.hints,Math.max(0,Math.min(2,Number(m.hints)||0)));
 if(m.action==='wrong'&&p.misses)window.PALearnerReview.firstWrong(p.q,{tag:'generic'});
 if(p.hints)window.PALearnerReview.hintUsed(p.q,p.hints);
 if(m.action==='abandoned')resolvePending(false);
}
function receive(event){
 if(!run||event.origin!==location.origin||event.source!==run.frame.contentWindow)return;
 const m=event.data;if(!m||m.version!==1||m.nonce!==run.nonce||Number(m.grade)!==run.grade||m.skillId!==run.skillId)return;
 if(db!==run.profile||Number(db?.schoolGrade)!==run.grade||typeof window.PALearnerReview?.beginQuestion!=='function')return;
 if(run.game.id==='gudang-harta'&&m.type==='PA_GUDANG_HARTA_PROGRESS'){receiveGudangProgress(m);return}
 if(m.type!==run.game.message)return;
 if(run.game.id==='gudang-harta'){
  const p=beginPending(m);if(!p)return;
  p.misses=Math.max(p.misses,Math.max(0,Math.min(20,Number(m.misses)||0)));p.hints=Math.max(p.hints,Math.max(0,Math.min(2,Number(m.hints)||0)));
  if(p.misses)window.PALearnerReview.firstWrong(p.q,{tag:'generic'});if(p.hints)window.PALearnerReview.hintUsed(p.q,p.hints);
  const encounter=resolvePending(true);if(!encounter)return;run.seen.add(p.questionKey);
 }else{
  const row=questionFrom(m);if(!row)return;const{q,questionKey}=row;
  run.seen.add(questionKey);
  const context={grade:run.grade,mode:'practice',selectionReason:'focus-'+run.game.id,demoMode:false,devMode:false};if(!window.PALearnerReview.beginQuestion(q,context))return;
  const misses=Math.max(0,Math.min(20,Number(m.misses)||0)),hints=Math.max(0,Math.min(20,Number(m.hints)||0));if(misses)window.PALearnerReview.firstWrong(q,{tag:'generic'});if(hints)window.PALearnerReview.hintUsed(q,hints);
  const encounter=window.PALearnerReview.resolve(q,{correct:true,usedHint:hints>0,hintLevel:hints,seconds:0},run.profile);if(!encounter)return;
 }
 const domain=run.game===GAMES.operations?'Nombor & Operasi':run.game===GAMES.fraction?'Pecahan':run.game===GAMES.measure?'Ukuran':run.game===GAMES.ratio?'Nisbah & Kadaran':run.game===GAMES.data?'Data':'Perpuluhan & Peratus';
 const status=run.node.querySelector('#paFocusMiniGameStatus');if(status)status.textContent='Bukti latihan direkod: '+run.seen.size+' cabaran '+domain+'. Bintang permainan tidak mengubah mastery.';
}
function isActiveFrame(frame,nonce,skillId,gameId='gudang-harta'){return!!run&&run.game.id===gameId&&run.frame.contentWindow===frame&&run.nonce===nonce&&run.skillId===skillId}
window.addEventListener('message',receive);window.PAFocusMiniGamesLive={tryStartFocus,close,gameFor,isActiveFrame};
})();
