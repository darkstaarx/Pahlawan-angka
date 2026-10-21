/* Mini game answers → PATelemetry.response (Diagnostic Brain + Portal Restu).
   Every mini game page posts PA_MINIGAME_ATTEMPT for each try (see paAttempt in the page).
   Same contract as battle/Gembok: a wrong first try is "<mode>-first-attempt",
   the final right answer is "<mode>-retry"; a right first try is plain "minigame".
   Learner review / mastery stays with the existing bridges; this only feeds diagnosis. */
(function(){
'use strict';
const rounds=new Map();
function fromChildFrame(src){if(!src)return false;for(const f of document.querySelectorAll('iframe')){try{if(f.contentWindow===src)return true}catch(_){}}return false}
function receive(e){
 const m=e.data;
 if(!m||m.type!=='PA_MINIGAME_ATTEMPT'||m.version!==1||e.origin!==location.origin||!fromChildFrame(e.source))return;
 const key=String(m.key||'').slice(0,80),game=String(m.game||'').replace(/[^a-z-]/g,'').slice(0,24);if(!key||!game)return;
 const r=rounds.get(key)||{wrong:false,done:false};if(r.done)return;
 const skill=String(m.skillId||'').slice(0,40)||'MINIGAME.'+game;
 const sec=Math.max(.1,Math.min(600,(Number(m.ms)||0)/1000));
 const q={token:'mg-'+key,skill,questionId:'minigame:'+game,archetypeId:'minigame_'+game,representation:'manipulative',
  prompt:String(m.prompt||'').slice(0,200),answer:m.answer===''||m.answer==null?undefined:String(m.answer).slice(0,40)};
 const send=(ok,mode)=>{try{window.PATelemetry?.response?.(skill,ok,ok?'':'minigame',sec,(m.hints|0)>0,q,mode)}catch(_){}};
 if(!m.ok){if(m.first&&!r.wrong){r.wrong=true;send(false,'minigame-first-attempt')}}
 else{r.done=true;send(true,r.wrong?'minigame-retry':'minigame')}
 rounds.set(key,r);if(rounds.size>300)rounds.delete(rounds.keys().next().value);
}
window.addEventListener('message',receive);
window.PAMiniGameTelemetry={receive};
})();
