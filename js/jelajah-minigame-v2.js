/* Production mini-game bridge for Demo Jelajah.  The game pages are copied by
 * tools/build-jelajah-minigames.cjs; this file only owns the outer mount. */
(()=>{
 'use strict';
 const ORIGIN=typeof location!=='undefined'?location.origin:'';
 const DEFAULT_MAPPING=Object.freeze({
  1:{page:'preview/jelajah-game-gudang-harta.html',hash:'d1-bina@2',skill:'D1.PV100',label:'Nilai tempat',focusLimits:[{mode:'bina',min:2,end:3}]},
  2:{page:'preview/jelajah-game-gudang-harta.html',hash:'d2-tambah@0',skill:'D2.2.1',label:'Tambah dengan kumpul semula',focusTarget:{kind:'regroup',op:'add'},focusLimits:[{mode:'tambah',min:0,end:2}]},
  3:{page:'preview/jelajah-game-kedai-kek.html',hash:'d3-setara@0',skill:'D3.FRAC',label:'Pecahan setara'},
  4:{page:'preview/jelajah-game-bengkel-ajaib.html',hash:'d4-panjang@2',skill:'D4.MEASURE',label:'Penukaran unit meter dan sentimeter',focusLimits:[{mode:'panjang',min:2,end:3}]},
  5:{page:'preview/jelajah-game-lombong-permata.html',hash:'d5-perpuluhan@0',skill:'D5.DEC',label:'Perpuluhan',focusLimits:[{mode:'perpuluhan',min:0,end:5}]},
  6:{page:'preview/jelajah-game-dapur-ramuan.html',hash:'d6-nisbah@0',skill:'D6.RATIO',label:'Nisbah',focusLimits:[{mode:'nisbah',min:0,end:5}]}
 });
 function mappingFor(s){const g=Number(s?.grade||s);return DEFAULT_MAPPING[g]||DEFAULT_MAPPING[1];}
 function mount(host,scenario,options){
  if(!host||typeof host.appendChild!=='function')throw new TypeError('PAJelajahMiniGame.mount memerlukan host DOM');
  const onComplete=typeof options?.onComplete==='function'?options.onComplete:()=>{};
  const onExit=typeof options?.onExit==='function'?options.onExit:()=>{};
  const cfg=mappingFor(scenario),nonce='jelajah-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);
  const params=new URLSearchParams({pa_focus_live:'1',pa_nonce:nonce,grade:String(scenario?.grade||1),skill:String(cfg.skill||''),jelajah:'1'});
  const step=options?.snapshot?.plan?.steps?.find(item=>item.skills?.includes(cfg.skill));
  const realTarget=step&&window.PATargets?.miniGameTarget?.(step);
  if(realTarget||cfg.focusTarget)params.set('focus_target',JSON.stringify(realTarget||cfg.focusTarget));
  if(cfg.focusLimits)params.set('focus_limits',JSON.stringify(cfg.focusLimits));
  const frame=document.createElement('iframe');frame.className='pa-jelajah-production-game';frame.title=cfg.label||'Mini-game Pahlawan Angka';frame.setAttribute('allow','autoplay');
  frame.src=`${cfg.page}?${params}#${String(cfg.hash||'').replace(/^#/,'')}`;
  const exit=document.createElement('button');exit.type='button';exit.className='pa-jelajah-game-exit';exit.textContent='← Kembali';exit.addEventListener('click',()=>{onExit({scenario,game:cfg.page});cleanup()});
  const seen=new Set(),timers=new Set();let successes=0,workedRounds=0,finished=false,autopilot=false,manualNotified=false,closed=false;
  const later=(fn,ms)=>{const id=setTimeout(()=>{timers.delete(id);if(!closed)fn()},ms);timers.add(id);return id};
  // The old two-success completion (successes>=2) is intentionally replaced by
  // three manual rounds before the explicit worked-example hand-off.
  const roundTypes=new Set(['PA_GUDANG_HARTA_ROUND','PA_KEDAI_KEK_ROUND','PA_BENGKEL_AJAIB_ROUND','PA_LOMBONG_PERMATA_ROUND','PA_DAPUR_RAMUAN_ROUND']);
  const complete=()=>{if(finished)return;finished=true;onComplete({scenario,game:cfg.page,successes,workedRounds});};
  const notifyManual=()=>{if(manualNotified)return;manualNotified=true;options?.onManualComplete?.({scenario,game:cfg.page,successes,startAutopilot});};
  const drive=()=>{
    if(!autopilot||finished)return;
    const rt=frame?.contentWindow?.PAJelajahGameRuntime;if(!rt)return;
    const st=rt.state?.();
    if(st?.offer){rt.startWorked();later(drive,350);return}
    if(st?.worked&&!st?.solved){if(rt.next?.())later(drive,1000);else later(drive,250);return}
  };
  const startAutopilot=()=>{
    if(autopilot||finished||successes<3)return false;autopilot=true;workedRounds=0;
    frame?.contentWindow?.PAJelajahGameRuntime?.beginWorked?.(0);later(drive,350);return true;
  };
  const game=cfg.page.split('/').pop().replace(/^jelajah-game-/, '').replace(/\.html$/,'');
  const previous=window.PAFocusMiniGamesLive;
  const registry={isActiveFrame:(w,n,skill,name)=>w===frame.contentWindow&&n===nonce&&skill===cfg.skill&&(!name||name===game)};
  window.PAFocusMiniGamesLive=registry;
  const receive=e=>{
   const d=e.data;
   if(e.origin!==ORIGIN||e.source!==frame.contentWindow||d?.version!==1||d?.nonce!==nonce||d?.skillId!==cfg.skill)return;
   if(d.type==='PA_MINIGAME_ATTEMPT'&&d.ok===true&&!autopilot&&!d.facets?.guided){const key=String(d.key||'');if(key&&!seen.has(key)){seen.add(key);successes++;if(successes>=3)notifyManual();}}
   if(autopilot&&roundTypes.has(d.type)&&d.stars===0){workedRounds++;if(workedRounds<2){later(()=>frame.contentWindow.PAJelajahGameRuntime?.beginWorked?.(workedRounds),500);later(drive,850)}else complete();}
  };
  const cleanup=()=>{closed=true;autopilot=false;timers.forEach(clearTimeout);timers.clear();window.removeEventListener('message',receive);if(window.PAFocusMiniGamesLive===registry)window.PAFocusMiniGamesLive=previous;exit.remove();frame.remove();};
  window.addEventListener('message',receive);host.append(exit,frame);
  cleanup.startAutopilot=startAutopilot;
  return cleanup;
 }
 const api={mount,defaultMapping:DEFAULT_MAPPING,mappingFor};
 if(typeof window!=='undefined')window.PAJelajahMiniGame=api;
 if(typeof module!=='undefined')module.exports=api;
})();
