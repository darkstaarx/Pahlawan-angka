/* Gerai Wirayung — production Focus adapter (no separate user profile). */
(function(){
"use strict";
const MODE_IDS={
  1:{bayar:"D1.MONEY"},
  2:{bayar:"D2.4.1",baki:"D2.4.3",bahagi:"D2.4.5"},
  3:{bayar:"D3.MONEY",baki:"D3.MONEY"},
  4:{bayar:"D4.MONEY",baki:"D4.MONEY"},
  5:{baki:"D5.MONEY",diskaun:"D5.MONEY"},
  6:{diskaun:"D6.MONEY",untung:"D6.MONEY"}
};
const gradeModes={1:["bayar"],2:["bayar","baki","bahagi"],3:["bayar","baki"],4:["bayar","baki"],5:["diskaun","baki"],6:["diskaun","untung"]};
let run=null,shadowRun=null;
const css=document.createElement("style");
css.textContent='#paWirayungOverlay{position:fixed;inset:0;z-index:2147482000;background:#142638;display:flex;flex-direction:column;overscroll-behavior:contain}#paWirayungOverlay .paWirayungNav{flex:0 0 auto;display:flex;align-items:center;gap:10px;min-height:50px;padding:7px max(12px,env(safe-area-inset-right)) 7px max(12px,env(safe-area-inset-left));background:#1c344d;border-bottom:2px solid #d7a76a;color:#fff;font:700 14px system-ui,sans-serif}#paWirayungOverlay .paWirayungNav b{font-size:clamp(15px,3vw,21px);color:#ffdfa1}#paWirayungOverlay .paWirayungNav small{opacity:.8;margin-right:auto}#paWirayungOverlay #paWirayungExit{border:0;border-radius:10px;background:#fff0d0;padding:9px 13px;color:#4a301c;font-weight:900;cursor:pointer}#paWirayungOverlay iframe{width:100%;flex:1;min-height:0;border:0;background:#203952}body.pa-wirayung-active{overflow:hidden!important}#wirayungLaunch{display:block;width:100%;border:2px solid #bf904e;border-radius:14px;background:linear-gradient(#ffe0a3,#edb764);color:#432e1e;min-height:50px;margin:9px 0;font-size:15px;font-weight:900;cursor:pointer}@media(min-width:800px){#paWirayungOverlay .paWirayungNav{padding-inline:24px}}';
document.head.append(css);
const escapeHtml=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const activeGrade=()=>Number(typeof db!=="undefined"&&db&&db.schoolGrade)||0;
// Contrast diagnosis is opt-in per authored skill capability. Unsupported
// money topics keep their existing Gerai/battle route.
const focusShadowMode=()=>new URLSearchParams(location.search).get("focus-shadow");
const moneyShadowAllowed=()=>focusShadowMode()==="money";
const timeShadowAllowed=()=>focusShadowMode()==="time";
function openFocusShadow(kind,skillId,allowProduction=false){
 const isMoney=kind==='money',grade=activeGrade(),moneyPlan=isMoney?window.PAGeraiWirayung?.planFor?.(typeof db!=="undefined"?db:null,skillId):null;
 const timeSupported=!isMoney&&/^D2\.5\.[123]$/.test(String(skillId||''))&&grade===2;
 const production=allowProduction&&!focusShadowMode()&&(isMoney?!!moneyPlan&&(grade<5||moneyPlan.reason==='archetype'):timeSupported);
 const allowed=isMoney?(moneyShadowAllowed()||production):(timeShadowAllowed()||production);
 const moneySupported=isMoney&&!!window.PAFocusMoneyDiagnosticV2?.skillFamilies?.[String(skillId||'')];
 if(!allowed||(isMoney?!moneySupported:!timeSupported))return false;
 if(run)close();if(shadowRun)closeMoneyShadow();
 const nonce=(crypto.randomUUID?.()||String(Date.now())+'-'+Math.random().toString(36).slice(2));
 const label=isMoney?'Wang':'Masa';
 const node=document.createElement('section');node.id='paWirayungOverlay';node.setAttribute('role','dialog');node.setAttribute('aria-label',(production?'Semakan':'Ujian shadow')+' Kemahiran Fokus '+label);node.setAttribute('aria-modal','true');
 node.innerHTML='<div class="paWirayungNav"><b>Mini-game Kemahiran Fokus · '+label+'</b><small>'+(production?'Ujian diagnosis · laporan disimpan':'Shadow sahaja · tiada simpanan profil')+'</small><button id="paWirayungExit" type="button">✕ Kembali</button></div><iframe title="Ujian diagnosis '+label+'" id="paWirayungFrame"></iframe><div id="paFocusShadowSummary" hidden style="flex:0 0 auto;padding:12px 18px;background:#fff8e7;color:#47321f;font:700 15px/1.5 system-ui,sans-serif"></div>';
 document.body.append(node);shadowRun={node,frame:node.querySelector('iframe'),nonce,skillId,kind,production,profile:typeof db!=='undefined'?db:null};
 node.querySelector('#paWirayungExit').onclick=closeMoneyShadow;
 shadowRun.frame.src=isMoney
  ?'gerai-wirayung.html?pa_focus_diagnostic=money&pa_origin_skill='+encodeURIComponent(skillId)+'&pa_grade='+encodeURIComponent(grade)+'&pa_focus_modes='+encodeURIComponent((moneyPlan?.modes||[]).join(','))+'&pa_nonce='+encodeURIComponent(nonce)+'#d'+grade+'-bayar'
  :'menara-jam.html?pa_focus_diagnostic=time&pa_origin_skill='+encodeURIComponent(skillId)+'&pa_nonce='+encodeURIComponent(nonce)+'#d2-baca-unit-tamat-tempoh';
 document.body.classList.add('pa-wirayung-active');window.PAFocusPractice?.close?.();return true;
}
function openMoneyShadow(skillId='D2.4.2',allowProduction=false){return openFocusShadow('money',skillId,allowProduction)}
function openTimeShadow(skillId='D2.5.3',allowProduction=false){return openFocusShadow('time',skillId,allowProduction)}
function openTimeMiniGame(skillId,plan,diagnostic=false){
 if(typeof db==='undefined'||!db||!plan||plan.grade!==activeGrade()||!window.PACommercial?.requireFeature?.('focus'))return false;
 if(diagnostic&&!/^D2\.5\.[123]$/.test(String(skillId||'')))return false;
 if(run)close();if(shadowRun)closeMoneyShadow();
 const nonce=(crypto.randomUUID?.()||String(Date.now())+'-'+Math.random().toString(36).slice(2));
 const node=document.createElement('section');node.id='paWirayungOverlay';node.setAttribute('role','dialog');node.setAttribute('aria-label','Mini-game Kemahiran Fokus Masa Darjah '+plan.grade);node.setAttribute('aria-modal','true');
 node.innerHTML='<div class="paWirayungNav"><b>Tren Jam · Darjah '+plan.grade+'</b><small>'+(diagnostic?'Semakan perbandingan masa · laporan disimpan':'Latihan Masa · mod '+plan.modes.join(', '))+'</small><button id="paWirayungExit" type="button">✕ Kembali</button></div><iframe title="Tren Jam Darjah '+plan.grade+'" id="paWirayungFrame"></iframe><div id="paFocusShadowSummary" hidden style="flex:0 0 auto;padding:12px 18px;background:#fff8e7;color:#47321f;font:700 15px/1.5 system-ui,sans-serif"></div>';
 document.body.append(node);shadowRun={node,frame:node.querySelector('iframe'),nonce,skillId,kind:'time',production:true,diagnostic,profile:db};node.querySelector('#paWirayungExit').onclick=closeMoneyShadow;
 const diagnosticQuery=diagnostic?'&pa_focus_diagnostic=time':'';
 shadowRun.frame.src='menara-jam.html?pa_origin_skill='+encodeURIComponent(skillId)+'&pa_nonce='+encodeURIComponent(nonce)+diagnosticQuery+'#'+plan.hash;
 document.body.classList.add('pa-wirayung-active');window.PAFocusPractice?.close?.();return true;
}
function closeMoneyShadow(){if(!shadowRun)return;shadowRun.node.remove();shadowRun=null;document.body.classList.remove("pa-wirayung-active")}
function receiveMoneyShadow(e){
 if(!shadowRun||e.origin!==location.origin||e.source!==shadowRun.frame.contentWindow)return false;
 const m=e.data;
 if(shadowRun.kind==='time'&&m?.type==='PA_TREN_JAM_ROUND'){
  if(m.version!==1||m.nonce!==shadowRun.nonce||!shadowRun.production||typeof db==='undefined'||db!==shadowRun.profile||Number(m.grade)!==activeGrade()||String(m.skillId||'')!==shadowRun.skillId)return true;
  const modes={baca:'read_clock',unit:'convert_forward',tamat:'find_end',tempoh:'elapsed_duration',mula:'find_start','24jam':'clock24_convert',zon:'zone_difference'};
  const mode=String(m.mode||''),skill=shadowRun.skillId,allowed=/^D2\.5\.[123]$/.test(skill)?['baca','unit','tamat','tempoh']:window.PAMenaraJam?.planFor?.(db,skill)?.modes||[];
  const key=String(m.questionKey||'').slice(0,180),at=Number(m.at);
  if(!allowed.includes(mode)||modes[mode]!==m.archetypeId||!key||!at||Math.abs(Date.now()-at)>3600000)return true;
  const ledger=db.learnerReviewV1||(db.learnerReviewV1={schema:1,encounters:[]}),events=ledger.encounters||(ledger.encounters=[]);
  if(events.some(x=>x.questionKey===key&&x.skillId===skill))return true;
  const misses=Math.max(0,Math.min(20,Number(m.misses)||0)),hints=Math.max(0,Math.min(20,Number(m.hints)||0)),q={token:'trenjam-'+key,skill,questionId:'trenjam:'+key,archetypeId:modes[mode],representation:'visual',demand:'application',prompt:'Tren Jam '+mode};
  try{window.PALearnerReview?.beginQuestion?.(q,{grade:activeGrade(),mode:'practice',selectionReason:'focus_time_mini_game',demoMode:false});if(misses)window.PALearnerReview?.firstWrong?.(q,{tag:modes[mode],seconds:1});if(hints)window.PALearnerReview?.hintUsed?.(q,hints);window.PALearnerReview?.resolve?.(q,{correct:true,usedHint:hints>0,hintLevel:hints,seconds:1},db)}catch(err){console.warn('Tren Jam learner record',err)}
  if(typeof save==='function')save();window.PACloud?.scheduleSave?.();mountReport();return true;
 }
 if(shadowRun.kind==='time'&&m?.type==='PA_FOCUS_TIME_CLOSE'&&m.version===1&&m.nonce===shadowRun.nonce){closeMoneyShadow();return true}
 const expectedType=shadowRun.kind==='time'?'PA_FOCUS_TIME_RESULT':'PA_FOCUS_MONEY_SHADOW_RESULT';if(!m||m.type!==expectedType||m.version!==1||m.nonce!==shadowRun.nonce||!m.report)return true;
 const r=m.report,summary=shadowRun.node.querySelector('#paFocusShadowSummary');
 summary.hidden=false;summary.textContent=(r.state==="candidate"?"Calon fokus: "+String(r.nextSkillId||r.rootCause||"semakan lanjut")+" · ":"Belum cukup bukti · ")+String(r.parentText||"");
 if(shadowRun.production&&shadowRun.kind==="money"){
  if(typeof db==="undefined"||db!==shadowRun.profile||activeGrade()!==Number(db.schoolGrade)||String(r.originSkillId||"")!==shadowRun.skillId)return true;
  const diagnostic=window.PAFocusMoneyDiagnosticV2;
  if(!diagnostic?.skillFamilies?.[shadowRun.skillId]||!['candidate','needs_contrast','abstain'].includes(r.state))return true;
  const nextId=nextMoneyFocusSkill(shadowRun.skillId,r.rootCause);
  const next=nextId&&typeof questionBankFor==="function"&&questionBankFor(nextId)&&typeof META!=="undefined"&&META[nextId]&&Number(META[nextId].grade)===activeGrade()?nextId:null;
  const parentText=moneyParentText(r.rootCause,shadowRun.skillId,next,next&&META[next]?.title);
  const store=db.focusDiagnosticsV1||(db.focusDiagnosticsV1={version:1,reports:[]});
  const families=r.evidence?.diagnostic?.evidence?.byFamily||r.evidence?.byFamily||{};
  const evidence=Object.fromEntries(Object.entries(families).map(([key,value])=>[key,{
   uniquePairs:Number(value?.uniquePairs)||0,
   moneyIndependent:Number(value?.contextual?.independent)||0,moneyAssisted:Number(value?.contextual?.nonIndependent)||0,
   plainIndependent:Number(value?.plain?.independent)||0,plainAssisted:Number(value?.plain?.nonIndependent)||0
  }]));
  store.reports.push({diagnosticVersion:"2.0.0-shadow",skillId:shadowRun.skillId,grade:activeGrade(),at:Date.now(),state:String(r.state||"abstain").slice(0,40),
   rootCause:String(r.rootCause||"").slice(0,80),nextSkillId:next||"",confidence:String(r.confidence||"none").slice(0,16),
   reasonCode:String(r.reasonCode||"").slice(0,100),parentText:parentText.slice(0,600),moneyContrastEvidence:evidence});
  store.reports=store.reports.slice(-30);
  if(typeof save==="function")save();window.PACloud?.scheduleSave?.();mountReport();
 }
 if(shadowRun.production&&shadowRun.kind==="time"){
  const skill=String(r.originSkillId||"");if(typeof db==="undefined"||db!==shadowRun.profile||activeGrade()!==2||skill!==shadowRun.skillId||!/^D2\.5\.[123]$/.test(skill))return true;
  const store=db.focusDiagnosticsV1||(db.focusDiagnosticsV1={version:1,reports:[]});
  store.reports.push({skillId:skill,grade:2,at:Date.now(),state:String(r.state||"insufficient_evidence").slice(0,40),
   rootCause:String(r.rootCause||"").slice(0,80),nextSkillId:String(r.nextSkillId||"").slice(0,24),confidence:String(r.confidence||"none").slice(0,16),
   reasonCode:String(r.reasonCode||"").slice(0,100),parentText:String(r.parentText||"").slice(0,600),
   timeEvidence:{clock:{independent:Number(r.clock?.independent)||0,nonindependent:Number(r.clock?.nonindependent)||0},
    units:{independent:Number(r.units?.independent)||0,nonindependent:Number(r.units?.nonindependent)||0},
    elapsed:{independent:Number(r.elapsed?.independent)||0,nonindependent:Number(r.elapsed?.nonindependent)||0},
    tagged:Number(r.evidence?.uniqueTaggedQuestions)||0}});
  store.reports=store.reports.slice(-30);
  if(typeof save==="function")save();window.PACloud?.scheduleSave?.();mountReport();
 }
 return true;
}
function moneySkill(id){return !!(typeof db!=='undefined'&&db&&window.PAGeraiWirayung?.planFor?.(db,id));}
function nextMoneyFocusSkill(origin,cause){
 const grade=Number((/^D([1-6])\./.exec(String(origin||""))||[])[1])||0;
 const family=String(cause||"").replace(/^operation\./,"");
 if(!String(cause||"").startsWith("operation."))return "";
 const table={
  1:{addition:"D1.ADD100",subtraction:"D1.SUB100"},
  2:{addition:"D2.2.1",subtraction:"D2.2.2",multiplication:"D2.2.3",division:"D2.2.4",operation_choice:"D2.2.5"},
  3:{addition:"D3.ADD10000",subtraction:"D3.SUB10000",multiplication:"D3.MUL",division:"D3.DIV"},
  4:{addition:"D4.ADD",subtraction:"D4.SUB",multiplication:"D4.MUL",division:"D4.DIV"},
  5:{percent:"D5.PERCENT",discount:"D5.PERCENT",addition:"D5.ADD",subtraction:"D5.SUB",multiplication:"D5.MUL",division:"D5.DIV"},
  6:{percent:"D6.PERCENT",discount:"D6.PERCENT",addition:"D6.OPS",subtraction:"D6.OPS",multiplication:"D6.OPS",division:"D6.OPS",profit:"D6.OPS"}
 };
 return table[grade]?.[family]||"";
}
function moneyParentText(cause,origin,next,nextTitle){
 const code=String(cause||"").split(".").slice(1).join(".");
 const labels={add:"tambah wang",addition:"tambah",subtract:"tolak wang",subtraction:"tolak",multiply:"darab wang",multiplication:"darab",divide:"bahagi wang",division:"bahagi",unit:"kenal nilai wang",recognise:"kenal nilai",problem:"pilih operasi",operation_choice:"pilih operasi",total:"jumlah wang",change:"baki wang",unit_price:"harga seunit",budget:"bajet",discount:"diskaun",percent:"peratus",profit:"untung dan rugi"};
 const label=labels[code]||"pengiraan wang";
 if(String(cause||"").startsWith("money."))return 'Soalan wang untuk '+label+' masih mencabar walaupun soalan nombor yang sepadan boleh dijawab sendiri. Fokus kekal pada kemahiran wang '+origin+'.';
 if(String(cause||"").startsWith("operation."))return next
  ?'Soalan wang untuk '+label+' boleh dijawab sendiri, tetapi operasi nombor biasa masih mengelirukan. Fokus seterusnya ialah '+String(nextTitle||next)+'.'
  :'Soalan wang boleh dibuat, tetapi bukti operasi nombor belum cukup untuk memilih latihan seterusnya.';
 return 'Ujian perbandingan belum menunjukkan punca yang cukup jelas. Teruskan latihan dan kumpul beberapa jawapan berbeza sebelum menetapkan fokus.';
}
function open(skillId,focusDiagnostic=false){
 if(typeof db==="undefined"||!db||!window.PACommercial?.requireFeature?.("focus"))return false;
 if(typeof enforceRestuLock==="function"&&enforceRestuLock())return false;
 const grade=activeGrade();if(!gradeModes[grade])return false;
 // Original Gerai Wirayung router decides which Focus skill belongs here.
 const plan=skillId&&window.PAGeraiWirayung?.planFor?.(db,skillId);
 if(!plan||Number(plan.grade)!==grade||typeof META==='undefined'||!META[skillId]||Number(META[skillId].grade)!==grade)return false;
 const modes=plan.modes.filter(mode=>gradeModes[grade].includes(mode));
 if(!modes.length)return false;
 if(run)close();
 const nonce=(crypto.randomUUID?.()||String(Date.now())+"-"+Math.random().toString(36).slice(2));
 const node=document.createElement("section");node.id="paWirayungOverlay";node.setAttribute("role","dialog");node.setAttribute("aria-label","Gerai Wirayung");node.setAttribute("aria-modal","true");
 node.innerHTML='<div class="paWirayungNav"><b>Gerai Wirayung</b><small>Latihan Wang · Darjah '+grade+'</small><button id="paWirayungExit" type="button">✕ Kembali</button></div><iframe title="Permainan Gerai Wirayung" id="paWirayungFrame" allow="autoplay"></iframe>';
 document.body.append(node);
 run={node,frame:node.querySelector("iframe"),grade,nonce,skillId,focusDiagnostic,profile:db};
 node.querySelector("#paWirayungExit").onclick=close;
 run.frame.src="gerai-wirayung.html?pa_nonce="+encodeURIComponent(nonce)+(focusDiagnostic?"&pa_focus_live=money&pa_origin_skill="+encodeURIComponent(skillId)+"&pa_focus_modes="+encodeURIComponent(modes.join(",")):"")+"#d"+grade+"-"+modes.join("-");
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
 const rows=[["bayar","Bayar tepat"],["baki","Kira baki"],["bahagi","Bahagi wang"],["diskaun","Diskaun"],["untung","Untung/rugi"]].map(([mode,label])=>{
  const items=events.filter(x=>x.mode===mode).slice(-12);
  return {mode,label,total:items.length,independent:items.filter(x=>x.independent).length,hinted:items.filter(x=>x.hints>0).length};
 }).filter(x=>x.total);
 return rows;
}
function mountReport(){
 const parent=document.getElementById("coreTab");if(!parent)return;
 const rows=records(),diagnoses=(db?.focusDiagnosticsV1?.reports||[]).filter(x=>Number(x.grade)===activeGrade()&&(/^D[1-6]\.MONEY$/.test(x.skillId||'')||/^D2\.4\.[1-7]$/.test(x.skillId||'')||/^D2\.5\.[123]$/.test(x.skillId||''))).slice(-6).reverse();let box=parent.querySelector('#paWirayungReport');
 if(!rows.length&&!diagnoses.length){box?.remove();return;}
 if(!box){box=document.createElement("section");box.id="paWirayungReport";box.className="card";box.style.cssText="margin:14px 0;padding:15px;background:#fff8e7;border:1px solid #d9b481;border-radius:14px;color:#47321f";parent.prepend(box);}
 const eligible=rows.filter(x=>x.total>=3),weak=eligible.filter(x=>x.independent/x.total<.6),strong=eligible.filter(x=>x.independent/x.total>=.8);
 let message="Bukti awal latihan Wang. Teruskan beberapa pesanan berbeza sebelum membuat rumusan.";
 if(weak.length)message=(strong.length?"Anak boleh buat "+strong.map(x=>x.label.toLowerCase()).join(" dan ")+", tetapi ":"Anak ")+"masih memerlukan latihan khusus "+weak.map(x=>x.label.toLowerCase()).join(" dan ")+".";
 else if(eligible.length&&eligible.every(x=>x.independent/x.total>=.8))message="Anak boleh menyelesaikan kemahiran Wang yang diuji tanpa bantuan. Cuba cabaran lebih sukar untuk mengesahkan penguasaan.";
 const divisionEvents=(db?.wirayungProgress?.events||[]).filter(x=>x.mode==="bahagi"&&Number(x.grade)===activeGrade());
 const divisionKinds=[["kongsi","kongsi bil"],["tukar","tukar duit kecil"]].map(([kind,label])=>({kind,label,events:divisionEvents.filter(x=>x.variant===kind).slice(-12)})).filter(x=>x.events.length>=3);
 if(divisionKinds.length){const struggles=divisionKinds.filter(x=>x.events.filter(e=>e.independent).length/x.events.length<.6);if(struggles.length)message+=" Dalam latihan bahagi wang, anak masih memerlukan bantuan untuk "+struggles.map(x=>x.label).join(" dan ")+".";}
 const normalReport=rows.length?'<b style="color:#97632e">Gerai Wirayung · Kemajuan Wang</b><p style="margin:8px 0;line-height:1.5">'+escapeHtml(message)+'</p><div style="display:flex;flex-wrap:wrap;gap:7px">'+rows.map(x=>'<span style="padding:7px 9px;background:#f3e1bd;border-radius:9px;font-size:12px">'+escapeHtml(x.label)+' <b>'+x.independent+'/'+x.total+'</b> tanpa bantuan</span>').join("")+'</div><small style="display:block;margin-top:9px">Pemerhatian berdasarkan aktiviti gerai, bukan keputusan peperiksaan. Rumusan khusus hanya selepas sekurang-kurangnya 3 pesanan.</small>':'';
 const diagnosisReport=diagnoses.length?'<hr style="border:0;border-top:1px solid #d9b481;margin:16px 0"><b style="color:#97632e">Semakan Kemahiran Fokus</b>'+diagnoses.map(x=>'<p style="margin:8px 0;line-height:1.5"><b>'+(x.state==="candidate"&&x.confidence==="medium"?'Calon fokus seterusnya: '+escapeHtml(x.nextSkillId||'semakan lanjut'):x.state==="candidate"?'Petunjuk awal: '+escapeHtml(x.nextSkillId||'semakan lanjut'):'Belum cukup bukti untuk menetapkan fokus')+'</b><br>'+escapeHtml(x.parentText||'')+'</p><small>Topik: '+(/^D[1-6]\.MONEY$/.test(x.skillId||'')||/^D2\.4\.[1-7]$/.test(x.skillId||'')?'Wang':/^D2\.5\.[123]$/.test(x.skillId||'')?'Masa':'Kemahiran')+' · Kemahiran diuji: '+escapeHtml(x.skillId||'')+' · Tahap diuji: '+escapeHtml(x.testedDemand||'tidak dinyatakan')+' · Isyarat: '+escapeHtml(x.reasonCode||'')+' · Keyakinan: '+escapeHtml(x.confidence||'none')+'</small>').join('<hr style="border:0;border-top:1px solid #ead8bb;margin:12px 0">')+'<small style="display:block;margin-top:8px">Ini rumusan diagnostik untuk membimbing latihan; ia tidak menukar mastery atau ganjaran.</small>':'';
 box.innerHTML=normalReport+diagnosisReport;
}
function finishRound(e){
 if(run&&run.focusDiagnostic&&e&&e.type==="PA_FOCUS_MONEY_LIVE_RESULT"&&e.version===1&&e.nonce===run.nonce){
  const r=e.report;if(db!==run.profile||activeGrade()!==run.grade||!r||r.originSkillId!==run.skillId||!['candidate','needs_contrast','abstain'].includes(r.state))return;
  const nextId=nextMoneyFocusSkill(run.skillId,r.rootCause);
  const next=nextId&&typeof questionBankFor==="function"&&questionBankFor(nextId)&&typeof META!=="undefined"&&META[nextId]&&Number(META[nextId].grade)===activeGrade()?nextId:null;
  const parentText=String(r.parentText||moneyParentText(r.rootCause,run.skillId,next,next&&META[next]?.title));
  const store=db.focusDiagnosticsV1||(db.focusDiagnosticsV1={version:1,reports:[]});
  const families=r.evidence?.byFamily||{},evidence=Object.fromEntries(Object.entries(families).map(([key,value])=>[key,{
   uniquePairs:Number(value?.uniquePairs)||0,moneyIndependent:Number(value?.contextual?.independent)||0,moneyAssisted:Number(value?.contextual?.nonIndependent)||0,
   plainIndependent:Number(value?.plain?.independent)||0,plainAssisted:Number(value?.plain?.nonIndependent)||0
  }]));
  store.reports.push({diagnosticVersion:"2.2.0-live-gerai",skillId:run.skillId,grade:run.grade,at:Date.now(),state:r.state,
   rootCause:String(r.rootCause||"").slice(0,80),nextSkillId:next||"",confidence:String(r.confidence||"none").slice(0,16),
   reasonCode:String(r.reasonCode||"").slice(0,100),parentText:parentText.slice(0,600),testedDemand:String(r.testedDemand||"").slice(0,100),moneyContrastEvidence:evidence});
  store.reports=store.reports.slice(-30);if(typeof save==="function")save();window.PACloud?.scheduleSave?.();mountReport();return;
 }
 if(!run||db!==run.profile||activeGrade()!==run.grade||!e||e.type!=="PA_WIRAYUNG_ROUND"||e.version!==1||e.nonce!==run.nonce)return;
 const grade=Number(e.grade),mode=String(e.mode),key=String(e.questionKey||"").slice(0,200),at=Number(e.at);
 if(grade!==run.grade||!gradeModes[grade]?.includes(mode)||!key||!at||Math.abs(Date.now()-at)>3600000)return;
 const misses=Math.max(0,Math.min(20,Number(e.misses)||0)),hints=Math.max(0,Math.min(20,Number(e.hints)||0)),independent=misses===0&&hints===0;
 const progress=db.wirayungProgress||(db.wirayungProgress={version:1,events:[]});
 const variant=mode==="bahagi"&&["kongsi","tukar"].includes(e.variant)?e.variant:null;
 if(progress.events.some(x=>x.grade===grade&&x.key===key&&x.at===at))return;
 progress.events.push({grade,mode,variant,key,independent,errors:misses,hints,at});
 progress.events=progress.events.slice(-250);
 const skill=(run.skillId&&META[run.skillId])?run.skillId:MODE_IDS[grade][mode];
 if(typeof META!=="undefined"&&META[skill]){
  if(!db.skills[skill]&&typeof initSkill==="function")initSkill(skill);
  const s=db.skills[skill];
  if(s){
   s.evidence=(Number(s.evidence)||0)+1;s.correct=(Number(s.correct)||0)+(mode==="bahagi"?(independent?1:0):1);
   if(misses){s.wrong=(Number(s.wrong)||0)+1;s.mis=s.mis||{};s.mis["wirayung_"+mode]=(Number(s.mis["wirayung_"+mode])||0)+1;}
   if(hints)s.hints=(Number(s.hints)||0)+1;
   s.mastery=Math.max(0,Math.min(100,(Number(s.mastery)||0)+(independent?2:mode==="bahagi"?0:misses?0:.6)));
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
 if(receiveMoneyShadow(e))return;
 if(!run||e.origin!==location.origin||e.source!==run.frame.contentWindow)return;
 finishRound(e.data);
});
document.getElementById("wirayungLaunch")?.addEventListener("click",()=>open());
const original=window.renderParent;
if(typeof original==="function")window.renderParent=function(){const ret=original.apply(this,arguments);mountReport();return ret;};
function tryStartFocus(id){
 if(moneySkill(id)){const hasLiveContrast=!!window.PAFocusMoneyDiagnosticV2?.skillFamilies?.[String(id||'')];return open(id,hasLiveContrast)}
 const plan=window.PAMenaraJam?.planFor?.(typeof db!=='undefined'?db:null,id);if(!plan||plan.grade!==activeGrade()||!window.PACommercial?.requireFeature?.('focus'))return false;
 const reports=db?.focusDiagnosticsV1?.reports||[],latest=reports.filter(r=>Number(r.grade)===activeGrade()&&/^D2\.5\.[123]$/.test(r.skillId||'')).sort((a,b)=>Number(a.at||0)-Number(b.at||0)).at(-1);
 const diagnosedNext=!!latest&&latest.state==='candidate'&&latest.nextSkillId===id;
 return openTimeMiniGame(id,plan,/^D2\.5\.[123]$/.test(String(id||''))&&!diagnosedNext);
}
window.PAWirayungLive={open,close,tryStartFocus,insights:records,openMoneyShadow,openTimeShadow};
if(new URLSearchParams(location.search).get("autostart")==="1")setTimeout(()=>{if(moneyShadowAllowed())openMoneyShadow("D2.4.2");else if(timeShadowAllowed())openTimeShadow("D2.5.3")},0);
})();
