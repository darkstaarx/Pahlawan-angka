/* DEV-only Focus Micro Lab — optional disposable exercise and DEV answer observer.
 * Does not alter gameplay, mastery, network, progress, or routing.
 */
(()=>{
'use strict';
const F=()=>window.PADevMicroFixturesV1, E=()=>window.PAFocusMicroV1;
const allowed=()=>{try{return typeof isDevMode==='function'&&isDevMode()===true}catch(_){return false}};
const canUse=()=>allowed()&&F()?.SCENARIOS&&E()?.evaluate;
let root=null,mode='manual',scenario='table8',answered=[],index=0,feedback=null;
let watching=false,live=[],serial=0,seen=new WeakSet();
const add=(p,t,s,cls)=>{
 const n=document.createElement(t);if(s!==undefined&&s!==null)n.textContent=String(s);
 if(cls)n.className=cls;if(p)p.appendChild(n);return n;
};
const button=(p,label,fn,cls)=>{
 const b=add(p,'button',label,cls||'');b.type='button';b.addEventListener('click',fn);return b;
};
function style(){
 if(document.getElementById('paFocusMicroDevStyle'))return;
 add(document.head,'style',null).id='paFocusMicroDevStyle';
 document.getElementById('paFocusMicroDevStyle').textContent=[
 '#paFocusMicroDev{position:fixed;inset:0;z-index:2147483005;background:#081424;color:#fff7e6;overflow:auto;font:500 14px/1.5 system-ui,sans-serif}',
 '#paFocusMicroDev *{box-sizing:border-box}',
 '#paFocusMicroDev .microWrap{max-width:740px;margin:auto;padding:16px 14px 40px;display:grid;gap:12px}',
 '#paFocusMicroDev .microHeader{padding:12px 14px;background:#163350;border-bottom:2px solid #b59050;display:flex;align-items:center;justify-content:space-between;gap:9px}',
 '#paFocusMicroDev h2{font-size:18px;margin:0;color:#fff}',
 '#paFocusMicroDev h3{font-size:16px;margin:0 0 8px;color:#f5dfb6}',
 '#paFocusMicroDev p{margin:6px 0 12px}',
 '#paFocusMicroDev .sub{font-size:12px;color:#bbcede}',
 '#paFocusMicroDev .panel{padding:16px;background:#102741;border:1px solid #3f5c75;border-radius:14px}',
 '#paFocusMicroDev button,#paFocusMicroDev input,#paFocusMicroDev select{font:inherit;border-radius:10px;padding:10px;border:1px solid #d1ac69}',
 '#paFocusMicroDev button{background:#ffebbb;color:#15304b;font-weight:800;cursor:pointer;min-height:42px}',
 '#paFocusMicroDev button.alt{background:#183d5f;color:#fff7e6;border-color:#6583a0}',
 '#paFocusMicroDev button.on{outline:2px solid #f6c867;outline-offset:2px}',
 '#paFocusMicroDev input,#paFocusMicroDev select{background:#fffef7;color:#12314c;width:100%}',
 '#paFocusMicroDev .tabs{display:flex;flex-wrap:wrap;gap:8px}',
 '#paFocusMicroDev .tabs button{flex:1;white-space:normal}',
 '#paFocusMicroDev .math{font-size:32px;font-weight:850;text-align:center;margin:16px 0}',
 '#paFocusMicroDev form{display:flex;gap:8px;flex-wrap:wrap}',
 '#paFocusMicroDev form input{flex:1;min-width:120px}',
 '#paFocusMicroDev .finding{background:#183a58;border:1px solid #52718b;border-radius:10px;padding:10px;margin:7px 0}',
 '#paFocusMicroDev .finding b{display:block}',
 '#paFocusMicroDev .finding small{color:#c4d1de}',
 '#paFocusMicroDev ol{padding-left:22px}',
 '@media(max-width:400px){#paFocusMicroDev .tabs button{min-width:90px}}'
 ].join('');
}
function close(){root?.remove();root=null}
function reset(){answered=[];index=0;feedback=null}
function choices(p){
 const sel=add(p,'select',null);sel.setAttribute('aria-label','Pilih senario');
 for(const [key,value] of Object.entries(F().SCENARIOS)){
  const opt=add(sel,'option',value.name);opt.value=key;if(key===scenario)opt.selected=true;
 }
 sel.addEventListener('change',()=>{scenario=sel.value;reset();paint()});
 return sel;
}
function report(p,records,source){
 const data=E().evaluate({diagLog:records});
 const box=add(p,'section',null,'panel');
 add(box,'h3',data.state==='probe_candidates'?'Calon kelemahan untuk disemak':
   data.state==='needs_more_evidence'?'Belum cukup bukti':'Belum ada calon yang memenuhi syarat');
 add(box,'p',source+' · '+data.evidence.usableRows+' rekod layak · tiada markah diubah','sub');
 if(!data.findings.length)add(box,'p','Bukti belum mencukupi untuk mencadangkan soalan pengesahan. Ini bukan bukti murid sudah menguasai semuanya.');
 for(const f of data.findings){
  const item=add(box,'div',null,'finding');
  add(item,'b',(f.status==='probe_candidate'?'PERLU PENGESAHAN':'BUKTI TERHAD')+' · '+f.label);
  add(item,'small','ID: '+f.id+' · '+f.evidence.failedAttempts+' salah · '+f.evidence.distinctFailedEquations+
   ' persamaan salah berbeza · '+f.evidence.independentContrastEquations+' kawalan betul · Probe: '+f.nextProbe);
 }
 add(box,'p','Ini flag ujian sahaja, bukan diagnosis punca sebenar. Penukaran cm→m masih memerlukan metadata unit khusus.','sub');
 return data;
}
function manual(p){
 const box=add(p,'section',null,'panel');
 add(box,'h3','Ujian interaktif · jawab sendiri');
 choices(box);add(box,'p',F().SCENARIOS[scenario].description,'sub');
 const questions=F().SCENARIOS[scenario].items;
 if(index>=questions.length){
  add(box,'p','Semua soalan selesai. Makmal membandingkan jawapan awal dengan pola yang dipilih.');
  button(box,'Ulang semula',()=>{reset();paint()});
  report(p,F().toLog(scenario,answered),'Soalan DEV interaktif (masa simulasi 8s)');
  return;
 }
 const q=questions[index],correct=F().answerOf(q);
 add(box,'p','Soalan '+(index+1)+' daripada '+questions.length,'sub');
 add(box,'div',F().promptOf(q),'math');
 if(feedback!==null){
  add(box,'p',feedback);
  button(box,'Soalan seterusnya',()=>{feedback=null;index++;paint()});
 }else{
  const form=add(box,'form');
  const input=add(form,'input');input.type='number';input.step='any';input.required=true;input.inputMode='decimal';
  input.setAttribute('aria-label','Jawapan');
  const submit=add(form,'button','Semak jawapan');submit.type='submit';
  form.addEventListener('submit',e=>{
   e.preventDefault();if(!input.value.trim())return;
   const value=Number(input.value);if(!Number.isFinite(value))return;
   const ok=Math.abs(value-correct)<1e-8;answered.push(ok);
   feedback=ok?'Betul.':'Belum tepat. Jawapan sepatutnya '+correct+'.';paint();
  });
 }
 if(answered.length)report(p,F().toLog(scenario,answered),'Bukti sementara (masa simulasi 8s)');
}
function auto(p){
 const box=add(p,'section',null,'panel');
 add(box,'h3','Simulasi senario yang telah ditentukan');
 choices(box);add(box,'p',F().SCENARIOS[scenario].description,'sub');
 const rows=F().automatic(scenario);
 const r=report(p,rows,'Simulasi automatik');
 const expected=F().SCENARIOS[scenario].expected;
 add(p,'p',expected?'Target ujian: '+expected+' — '+(r.findings.some(x=>x.id===expected&&x.status==='probe_candidate')?'LULUS':'TIDAK DIPENUHI'):
  'Target: sistem tidak membuat diagnosis daripada bukti ini.','sub');
}
function actual(p){
 const box=add(p,'section',null,'panel');
 add(box,'h3','Pantau DEV Test Skill sebenar');
 add(box,'p','Hanya cubaan pertama daripada Question Bank Tester ketika DEV aktif. Semua tangkapan modul ini disimpan dalam memori halaman, bukan rekod anak.');
 add(box,'p','Untuk selamat, gunakan profil ujian. Gameplay DEV asal mungkin mempunyai kesan simpanan sendiri.','sub');
 const row=add(box,'div',null,'tabs');
 button(row,watching?'Henti pantauan':'Mula pantauan',()=>{watching=!watching;paint()});
 button(row,'Kosongkan',()=>{live=[];seen=new WeakSet();serial=0;paint()},'alt');
 add(box,'p',(watching?'Sedang memantau':'Tidak memantau')+' · '+live.length+' cubaan dirakam');
 add(box,'p','Cara cuba: Mula pantauan → tutup makmal → pilih Darjah dan Skill di Developer Mode → Test Skill → jawab → buka makmal semula.','sub');
 report(p,live,'DEV Test Skill (memori sahaja)');
 if(live.length){
  const recent=add(p,'section',null,'panel');add(recent,'h3','Cubaan terkini');
  const list=add(recent,'ol');
  for(const r of live.slice(-8)){
   add(list,'li',r.a[0]+' '+({add:'+',sub:'−',mul:'×',div:'÷'}[r.o]||r.o)+' '+r.a[1]+
    ' — '+(r.k?'Betul':'Salah')+' ('+r.s+')');
  }
 }
}
function paint(){
 if(!root)return;const host=root.querySelector('.microWrap');host.replaceChildren();
 const nav=add(host,'div',null,'tabs');
 [['manual','Jawab sendiri'],['auto','Simulasi automatik'],['actual','DEV Test sebenar']].forEach(([id,label])=>
  button(nav,label,()=>{mode=id;paint()},'alt'+(mode===id?' on':'')));
 if(mode==='manual')manual(host);else if(mode==='auto')auto(host);else actual(host);
}
function open(){
 if(!canUse())return false;style();close();
 root=add(document.body,'section',null);root.id='paFocusMicroDev';
 root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','Makmal Diagnosis Mikro');
 const head=add(root,'header',null,'microHeader');const title=add(head,'div');
 add(title,'p','DEV ONLY · PHASE 1','sub');add(title,'h2','Micro Diagnosis Lab');
 button(head,'Tutup',close,'alt');
 add(root,'main',null,'microWrap');paint();return true;
}
function capture(skillId,ok,tag,sec,hint,q,responseMode){
 if(!watching||!allowed())return;
 try{
  if(typeof sess==='undefined'||!sess?.devBankTest||!q||typeof q!=='object')return;
  if(seen.has(q)||String(responseMode||'').includes('retry'))return;
  const firstWrong=!ok&&String(responseMode||'').includes('first-attempt');
  const firstCorrect=!!ok&&!String(responseMode||'').includes('first-attempt');
  if(!firstWrong&&!firstCorrect)return;
  seen.add(q);
  const fac=window.PADiagnostic?.facets?.(q,typeof META!=='undefined'?META[skillId]:null);
  if(!fac||!['add','sub','mul','div'].includes(fac.op)||!Array.isArray(fac.operands)||fac.operands.length!==2)return;
  live.push({id:'dev-micro-live-'+(++serial),s:String(skillId),o:fac.op,a:fac.operands.slice(),
   t:Date.now(),k:ok?1:0,h:hint?1:0,sec:Number(sec)||0,w:fac.words||3,f:fac.format||'symbolic',c:fac.context||'plain'});
  if(live.length>120)live.shift();
 }catch(_){/* Never disrupt battle. */}
}
function wrap(){
 const obj=window.PATelemetry;
 if(!obj||typeof obj.response!=='function'||obj.response.__paFocusMicro)return;
 const original=obj.response;
 function wrapped(...args){capture(...args);return original.apply(this,args)}
 wrapped.__paFocusMicro=true;obj.response=wrapped;
}
function mount(){
 if(!canUse())return false;
 const parent=document.getElementById('devPanel');if(!parent)return false;
 if(parent.querySelector('[data-micro-diagnosis-lab]'))return true;
 const sec=add(parent,'section',null,'devScenario');
 sec.dataset.microDiagnosisLab='1';
 add(sec,'b','Micro Diagnosis Lab · Phase 1');
 add(sec,'p','Uji sifir 8, fakta 7×8, pinjam merentas sifar dan baki bahagi. Boleh pantau sesi DEV Test Skill.','mut devMiniCopy');
 button(sec,'Buka Makmal Diagnosis',open,'btn devPrimary small');return true;
}
function init(){
 if(!F()||!E())return;wrap();
 const d=document.getElementById('devOverlay');
 if(d)new MutationObserver(()=>{if(!d.classList.contains('hidden'))mount();else if(root&&!allowed())close()})
  .observe(d,{attributes:true,attributeFilter:['class']});
 mount();
}
window.PADevFocusMicroLabV1={open,close,mount,status:()=>({watching,captured:live.length,visible:!!root})};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
