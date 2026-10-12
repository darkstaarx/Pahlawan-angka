/* Gerai Wirayung — production Focus adapter (no separate user profile). */
(function(){
"use strict";
const MODE_IDS={
  1:{bayar:"D1.MONEY"},
  2:{bayar:"D2.4.1",baki:"D2.4.3"},
  3:{bayar:"D3.MONEY",baki:"D3.MONEY"},
  4:{bayar:"D4.MONEY",baki:"D4.MONEY"},
  5:{baki:"D5.MONEY",diskaun:"D5.MONEY"},
  6:{diskaun:"D6.MONEY",untung:"D6.MONEY"}
};
const gradeModes={1:["bayar"],2:["bayar","baki"],3:["bayar","baki"],4:["bayar","baki"],5:["diskaun","baki"],6:["diskaun","untung"]};
let run=null;
const css=document.createElement("style");
css.textContent='#paWirayungOverlay{position:fixed;inset:0;z-index:2147482000;background:#142638;display:flex;flex-direction:column;overscroll-behavior:contain}#paWirayungOverlay .paWirayungNav{flex:0 0 auto;display:flex;align-items:center;gap:10px;min-height:50px;padding:7px max(12px,env(safe-area-inset-right)) 7px max(12px,env(safe-area-inset-left));background:#1c344d;border-bottom:2px solid #d7a76a;color:#fff;font:700 14px system-ui,sans-serif}#paWirayungOverlay .paWirayungNav b{font-size:clamp(15px,3vw,21px);color:#ffdfa1}#paWirayungOverlay .paWirayungNav small{opacity:.8;margin-right:auto}#paWirayungOverlay #paWirayungExit{border:0;border-radius:10px;background:#fff0d0;padding:9px 13px;color:#4a301c;font-weight:900;cursor:pointer}#paWirayungOverlay iframe{width:100%;flex:1;min-height:0;border:0;background:#203952}body.pa-wirayung-active{overflow:hidden!important}#wirayungLaunch{display:block;width:100%;border:2px solid #bf904e;border-radius:14px;background:linear-gradient(#ffe0a3,#edb764);color:#432e1e;min-height:50px;margin:9px 0;font-size:15px;font-weight:900;cursor:pointer}@media(min-width:800px){#paWirayungOverlay .paWirayungNav{padding-inline:24px}}';
document.head.append(css);
const escapeHtml=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const activeGrade=()=>Number(typeof db!=="undefined"&&db&&db.schoolGrade)||0;
function moneySkill(id){return !!id&&(/^D[1-6]\.MONEY$/.test(id)||/^D2\.4\./.test(id));}
function open(skillId){
 if(typeof db==="undefined"||!db||!window.PACommercial?.requireFeature?.("focus"))return false;
 if(typeof enforceRestuLock==="function"&&enforceRestuLock())return false;
 const grade=activeGrade();if(!gradeModes[grade])return false;
 let modes=gradeModes[grade];
 if(skillId){
  if(!moneySkill(skillId)||typeof META==="undefined"||!META[skillId]||Number(META[skillId].grade)!==grade)return false;
  const plan=window.PAGeraiWirayung?.planFor?.(db,skillId);
  if(Array.isArray(plan?.modes)&&plan.modes.length)modes=plan.modes.filter(x=>gradeModes[grade].includes(x));
  else if(grade===2)modes=[skillId==="D2.4.3"?"baki":"bayar"];
  if(!modes.length)return false;
 }
 if(run)close();
 const nonce=(crypto.randomUUID?.()||String(Date.now())+"-"+Math.random().toString(36).slice(2));
 const node=document.createElement("section");node.id="paWirayungOverlay";node.setAttribute("role","dialog");node.setAttribute("aria-label","Gerai Wirayung");node.setAttribute("aria-modal","true");
 node.innerHTML='<div class="paWirayungNav"><b>Gerai Wirayung</b><small>Latihan Wang · Darjah '+grade+'</small><button id="paWirayungExit" type="button">✕ Kembali</button></div><iframe title="Permainan Gerai Wirayung" id="paWirayungFrame" allow="autoplay"></iframe>';
 document.body.append(node);
 run={node,frame:node.querySelector("iframe"),grade,nonce,skillId};
 node.querySelector("#paWirayungExit").onclick=close;
 run.frame.src="gerai-wirayung.html?pa_nonce="+encodeURIComponent(nonce)+"#d"+grade+"-"+modes.join("-");
 document.body.classList.add("pa-wirayung-active");
 window.PAFocusPractice?.close?.();
 return true;
}
function close(){
 if(!run)return;
 run.node.remove();run=null;document.body.classList.remove("pa-wirayung-active");
 window.PACloud?.syncSaveNow?.();mountReport();
}
function records(){
 const events=(typeof db!=="undefined"&&db?.wirayungProgress?.events||[]).filter(e=>Number(e.grade)===activeGrade());
 const rows=[["bayar","Bayar tepat"],["baki","Kira baki"],["diskaun","Diskaun"],["untung","Untung/rugi"]].map(([mode,label])=>{
  const items=events.filter(x=>x.mode===mode).slice(-12);
  return {mode,label,total:items.length,independent:items.filter(x=>x.independent).length,hinted:items.filter(x=>x.hints>0).length};
 }).filter(x=>x.total);
 return rows;
}
function mountReport(){
 const parent=document.getElementById("coreTab");if(!parent)return;
 const rows=records();let box=parent.querySelector("#paWirayungReport");
 if(!rows.length){box?.remove();return;}
 if(!box){box=document.createElement("section");box.id="paWirayungReport";box.className="card";box.style.cssText="margin:14px 0;padding:15px;background:#fff8e7;border:1px solid #d9b481;border-radius:14px;color:#47321f";parent.prepend(box);}
 const eligible=rows.filter(x=>x.total>=3),weak=eligible.filter(x=>x.independent/x.total<.6),strong=eligible.filter(x=>x.independent/x.total>=.8);
 let message="Bukti awal latihan Wang. Teruskan beberapa pesanan berbeza sebelum membuat rumusan.";
 if(weak.length)message=(strong.length?"Anak boleh buat "+strong.map(x=>x.label.toLowerCase()).join(" dan ")+", tetapi ":"Anak ")+"masih memerlukan latihan khusus "+weak.map(x=>x.label.toLowerCase()).join(" dan ")+".";
 else if(eligible.length&&eligible.every(x=>x.independent/x.total>=.8))message="Anak boleh menyelesaikan kemahiran Wang yang diuji tanpa bantuan. Cuba cabaran lebih sukar untuk mengesahkan penguasaan.";
 box.innerHTML='<b style="color:#97632e">Gerai Wirayung · Kemajuan Wang</b><p style="margin:8px 0;line-height:1.5">'+escapeHtml(message)+'</p><div style="display:flex;flex-wrap:wrap;gap:7px">'+rows.map(x=>'<span style="padding:7px 9px;background:#f3e1bd;border-radius:9px;font-size:12px">'+escapeHtml(x.label)+' <b>'+x.independent+'/'+x.total+'</b> tanpa bantuan</span>').join("")+'</div><small style="display:block;margin-top:9px">Pemerhatian berdasarkan aktiviti gerai, bukan keputusan peperiksaan. Rumusan khusus hanya selepas sekurang-kurangnya 3 pesanan.</small>';
}
function finishRound(e){
 if(!run||!e||e.type!=="PA_WIRAYUNG_ROUND"||e.version!==1||e.nonce!==run.nonce)return;
 const grade=Number(e.grade),mode=String(e.mode),key=String(e.questionKey||"").slice(0,200),at=Number(e.at);
 if(grade!==run.grade||!gradeModes[grade]?.includes(mode)||!key||!at||Math.abs(Date.now()-at)>3600000)return;
 const misses=Math.max(0,Math.min(20,Number(e.misses)||0)),hints=Math.max(0,Math.min(20,Number(e.hints)||0)),independent=misses===0&&hints===0;
 const progress=db.wirayungProgress||(db.wirayungProgress={version:1,events:[]});
 progress.events.push({grade,mode,key,independent,errors:misses,hints,at});
 progress.events=progress.events.slice(-250);
 const skill=(run.skillId&&META[run.skillId])?run.skillId:MODE_IDS[grade][mode];
 if(typeof META!=="undefined"&&META[skill]){
  if(!db.skills[skill]&&typeof initSkill==="function")initSkill(skill);
  const s=db.skills[skill];
  if(s){
   s.evidence=(Number(s.evidence)||0)+1;s.correct=(Number(s.correct)||0)+1;
   if(misses){s.wrong=(Number(s.wrong)||0)+1;s.mis=s.mis||{};s.mis["wirayung_"+mode]=(Number(s.mis["wirayung_"+mode])||0)+1;}
   if(hints)s.hints=(Number(s.hints)||0)+1;
   s.mastery=Math.max(0,Math.min(100,(Number(s.mastery)||0)+(independent?2:misses?0:.6)));
   s.confidence=Math.max(0,Math.min(100,(Number(s.confidence)||0)+(independent?1.5:0)));
   s.lastSeen=Date.now();
  }
  const seconds=Math.max(1,Math.min(3600,Number(e.elapsedMs||0)/1000));
  const q={token:"wirayung-"+at+"-"+Math.random().toString(36).slice(2,6),skill,questionId:"wirayung:"+key,archetypeId:"wirayung_"+mode,representation:"manipulative",demand:"application",prompt:"Gerai Wirayung "+mode};
  try{
   window.PALearnerReview?.beginQuestion?.(q,{grade,mode:"practice",selectionReason:"wirayung",demoMode:false});
   if(misses)window.PALearnerReview?.firstWrong?.(q,{tag:"wirayung_"+mode,seconds});
   if(hints)window.PALearnerReview?.hintUsed?.(q,hints);
   window.PALearnerReview?.resolve?.(q,{correct:true,usedHint:hints>0,hintLevel:hints,seconds},db);
  }catch(err){console.warn("Wirayung learner record",err);}
  try{window.PATelemetry?.response?.(skill,independent,independent?"":"wirayung_"+mode,seconds,hints>0,q,"practice");}catch(err){console.warn("Wirayung cloud attempt",err);}
 }
 if(typeof save==="function")save();
 window.PACloud?.scheduleSave?.();
 mountReport();
}
window.addEventListener("message",e=>{
 if(!run||e.origin!==location.origin||e.source!==run.frame.contentWindow)return;
 finishRound(e.data);
});
document.getElementById("wirayungLaunch")?.addEventListener("click",()=>open());
const original=window.renderParent;
if(typeof original==="function")window.renderParent=function(){const ret=original.apply(this,arguments);mountReport();return ret;};
window.PAWirayungLive={open,close,tryStartFocus:id=>moneySkill(id)?open(id):false,insights:records};
})();
