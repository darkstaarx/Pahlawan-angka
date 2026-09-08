// Pahlawan Angka v3.62.1 — game-native KSSR/PBD/UASA response engine.
// The curriculum bank remains authoritative. This layer changes how pupils
// produce an answer, records the interaction family, and keeps battle rewards.
(()=>{
 'use strict';
 const VERSION='3.62.1';
 const PROFILES={
  1:{assessment:'KSSR_PBD',label:'Bina jawapan',constructedTarget:.5},
  2:{assessment:'KSSR_PBD',label:'Tunjuk jawapan',constructedTarget:.55},
  3:{assessment:'KSSR_PBD',label:'Selesaikan',constructedTarget:.6},
  4:{assessment:'KSSR_UASA_2025',label:'Respons terhad',constructedTarget:.75},
  5:{assessment:'KSSR_UASA_2025',label:'Respons terhad',constructedTarget:.75},
  6:{assessment:'KSSR_UASA_2025',label:'Respons terhad',constructedTarget:.8}
 };
 const text=v=>String(v??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
 const number=v=>{const n=Number(String(v).replace(/,/g,''));return Number.isFinite(n)?n:null};
 const skillGrade=id=>Number(String(id||'').match(/^D([1-6])\./)?.[1]||0);
 const optionValues=q=>[{v:q.answer,tag:'correct',label:q.answer},...(q.wrong||[])];
 const unique=(arr,key=x=>String(x))=>{const seen=new Set();return arr.filter(x=>{const k=key(x);if(seen.has(k))return false;seen.add(k);return true})};
 const shuffle=a=>[...a].sort(()=>Math.random()-.5);
 function claimReason(value){const raw=text(value);let m=raw.match(/^(.+?),\s*kerana\s+(.+)$/i);if(m)return{claim:m[1],reason:m[2],join:', kerana '};m=raw.match(/^((?:betul|salah|pilih)\b[^,]*),\s*(.+)$/i);return m?{claim:m[1],reason:m[2],join:', '}:null}

 function answerSpec(q,id){
  const raw=text(q?.answer),compact=raw.replace(/\s+/g,''),grade=skillGrade(id);
  let m;
  const angleMode=id==='D6.ANGLE'&&q?.competencyId==='6.1.2'?String(q?.archetypeId||'').replace(/^y6v2_6_1_2_/,''):'';
  if(angleMode==='tool')return{kind:'tool_select',options:optionValues(q)};
  if(angleMode==='sequence'){const steps=raw.split(/\s*→\s*/).filter(Boolean);if(steps.length>1)return{kind:'step_sequence',steps};}
  if(angleMode==='construct_error'){const target=text(q?.prompt).match(/membentuk\s+(\d+)°/i)||raw.match(/tanda\s+(\d+)°/i);if(target)return{kind:'angle_build',value:Number(target[1]),suffix:'°',min:0,max:180,step:5,diagnostic:'construction_correction'};}
  if(angleMode==='claim'&&/^(betul|salah)$/i.test(raw))return{kind:'judgement_gate',value:raw.toLowerCase()};
  const cr=grade>=4&&q?.demand==='reasoning'?claimReason(raw):null;
  if(cr){const parts=optionValues(q).map(x=>claimReason(x.v)).filter(Boolean);const claims=unique([cr.claim,...parts.map(x=>x.claim)]),reasons=unique([cr.reason,...parts.map(x=>x.reason)]);if(claims.length>1&&reasons.length>1)return{kind:'claim_reason',...cr,claims,reasons}}
  if((m=raw.match(/^RM\s*(-?[\d,]+(?:\.\d{1,2})?)$/i)))return{kind:'rune_entry',value:number(m[1]),prefix:'RM',dp:(m[1].split('.')[1]||'').length};
  if((m=raw.match(/^(-?[\d,]+(?:\.\d+)?)\s*%$/)))return{kind:'rune_entry',value:number(m[1]),suffix:'%',dp:(m[1].split('.')[1]||'').length};
  if(id==='D6.ANGLE'&&(m=raw.match(/^(\d+)°$/)))return{kind:q?.competencyId==='6.1.2'?'angle_build':'rune_entry',value:Number(m[1]),suffix:'°',min:0,max:180,step:5};
  if((id==='D6.CIRCLE'||id==='D6.SPACE_PROBLEM')&&/6\.2\.2|circle_draw/.test(`${q?.competencyId||''} ${(q?.misconceptionTargets||[]).join(' ')}`)&&(m=raw.match(/^(\d+(?:\.\d+)?)\s*cm$/)))return{kind:'circle_build',value:Number(m[1]),suffix:'cm',min:1,max:20,step:.5};
  if((m=raw.match(/^(-?[\d,]+(?:\.\d+)?)\s*(mm|cm|m|km|g|kg|mL|L|cm²|m²|km²|cm³|m³)$/i)))return{kind:'rune_entry',value:number(m[1]),suffix:m[2],dp:(m[1].split('.')[1]||'').length};
  if((m=raw.match(/^(-?\d+)\s+(\d+)\/(\d+)$/)))return{kind:'fraction_build',whole:Number(m[1]),numerator:Number(m[2]),denominator:Number(m[3]),mixed:true};
  if((m=raw.match(/^(-?\d+)\/(\d+)$/)))return{kind:'fraction_build',whole:0,numerator:Number(m[1]),denominator:Number(m[2]),mixed:false};
  if((m=raw.match(/^\((\d+)\s*,\s*(\d+)\)$/)))return{kind:'coordinate_plot',x:Number(m[1]),y:Number(m[2])};
  if((id.includes('.TIME')||/masa|waktu|jam/i.test(q?.kind||''))&&(m=raw.match(/^(\d{1,2}):(\d{2})$/)))return{kind:'time_dial',hour:Number(m[1]),minute:Number(m[2])};
  const sequence=raw.split(/\s*,\s*/);if(sequence.length>=2&&sequence.every(x=>/^-?[\d.]+$/.test(x)))return{kind:'sequence_build',tokens:sequence};
  if(typeof q?.answer==='number'&&Number.isFinite(q.answer))return{kind:'rune_entry',value:q.answer,dp:0};
  if(/^-?[\d,]+(?:\.\d+)?$/.test(compact))return{kind:'rune_entry',value:number(compact),dp:(compact.split('.')[1]||'').length};
  return{kind:'sigil_select',grade};
 }
 function alignment(id,grade){
  const profile=PROFILES[grade]||PROFILES[1];
  return{framework:profile.assessment,profileLabel:profile.label,source:'DSKP_KSSR_SEMAKAN_2017',uasaItemClass:grade>=4?'SRT_OR_SRTb':null};
 }
 function prepare(q,ctx={}){
  if(!q)return q;const id=ctx.skillId||q.skill||'',grade=ctx.meta?.grade||skillGrade(id)||1,spec=answerSpec(q,id);
  q.responseType='interactive';q.responseMode='game';q.interaction={type:spec.kind,spec};
  q.assessmentAlignment={...alignment(id,grade),grade};q.gameInteractionVersion=VERSION;
  return q;
 }
 function rootFor(q,answers,title){
  answers.innerHTML='';answers.className='answers paGameAnswers';
  document.querySelector('.qcard')?.classList.add('paGameQCard');
  document.querySelector('.qcard')?.classList.remove('paTypedQCard');
  document.body?.classList.remove('paTypedInputFocused','paTypedKeyboardOpen');
  if(typeof sess!=='undefined')sess.typedAnswerActive=false;
  const root=document.createElement('section');root.className='paInteraction';root.dataset.interaction=q.interaction.type;root.dataset.questionToken=String(q.token);
  const head=document.createElement('div');head.className='paInteractionHead';
  const grade=q.assessmentAlignment?.grade||skillGrade(q.skill),profile=PROFILES[grade]||PROFILES[1];
  head.innerHTML=`<span class="paResponseMark" aria-hidden="true">✦</span><b>${profile.label}</b><small>${title}</small>`;
  root.appendChild(head);answers.appendChild(root);return root;
 }
 function wrongTag(q,value){
  const exact=(q.wrong||[]).find(x=>text(x.v)===text(value)||text(x.label)===text(value));
  if(exact?.tag)return exact.tag;
  const type=q?.interaction?.type,spec=q?.interaction?.spec||{};
  if(type==='angle_build'){
   const got=number(text(value).replace(/°/g,'')),target=Number(spec.value);
   if(got!==null&&Number.isFinite(target)){
    if(got===180-target)return'angle_scale';
    if(Math.abs(got-target)<=10)return'angle_precision';
   }
   return'angle_construct';
  }
  if(type==='step_sequence')return'angle_procedure';
  if(type==='judgement_gate')return'angle_reasoning';
  if(type==='tool_select')return'tool';
  return q?.misconceptionTargets?.[0]||q.wrong?.[0]?.tag||'generated';
 }
 function deliver(q,btn,value,ctx,correct){
  if(!q||!btn||btn.disabled)return;
  const hadRetry=!!sess?.retryState;
  const choice=correct?{v:q.answer,label:q.answer,tag:'correct'}:{v:value,label:value,tag:wrongTag(q,value)};
  ctx.respond(choice,btn,q);
  if(correct||hadRetry){lock();return;}
  if(!['sigil_select','coordinate_plot','tool_select','judgement_gate'].includes(q.interaction?.type))setTimeout(()=>{if(sess?.q?.token===q.token){btn.disabled=false;btn.classList.remove('no')}},260);
 }
 function button(label,cls='paRune'){const b=document.createElement('button');b.type='button';b.className=cls;b.textContent=label;return b}
 function submitButton(q,label='Lancarkan serangan'){const b=button(label,'paInteractionSubmit');b.dataset.questionToken=String(q.token);return b}
 function numericEqual(a,b){return a!==null&&b!==null&&Math.abs(a-b)<1e-9}

 function renderRune(q,root,ctx,spec){
  const board=document.createElement('div');board.className='paRuneBoard';
  const display=document.createElement('output');display.className='paRuneDisplay';display.setAttribute('aria-live','polite');
  let raw='';const refresh=()=>{display.innerHTML=`<span>${spec.prefix||''}</span><b>${raw||'_'}</b><span>${spec.suffix||''}</span>`};refresh();
  const pad=document.createElement('div');pad.className='paRunePad';
  ['1','2','3','4','5','6','7','8','9',spec.dp>0?'.':'00','0','⌫'].forEach(k=>{const b=button(k);b.setAttribute('aria-label',k==='⌫'?'Padam digit':`Digit ${k}`);b.onclick=()=>{if(k==='⌫')raw=raw.slice(0,-1);else if(k==='.'&&!raw.includes('.'))raw+=(raw?'':'0')+'.';else if(k!=='.'&&raw.length<12)raw+=k;refresh()};pad.appendChild(b)});
  const submit=submitButton(q);submit.onclick=()=>{const got=number(raw);if(got===null){display.classList.add('needsValue');return}display.classList.remove('needsValue');deliver(q,submit,raw,ctx,numericEqual(got,spec.value))};
  board.append(display,pad,submit);root.appendChild(board);
 }
 function componentCandidates(q,index,fallback){
  const vals=optionValues(q).map(x=>text(x.v)).map(v=>{
   const m=v.match(/^(?:(-?\d+)\s+)?(\d+)\/(\d+)$/);return m?Number(m[index]):null;
  }).filter(Number.isFinite);return unique([fallback,...vals]).sort((a,b)=>a-b);
 }
 function chipGroup(label,values,onpick){const wrap=document.createElement('fieldset');wrap.className='paForgeGroup';const legend=document.createElement('legend');legend.textContent=label;wrap.appendChild(legend);values.forEach(v=>{const b=button(String(v),'paForgeChip');b.onclick=()=>{wrap.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');onpick(v)};wrap.appendChild(b)});return wrap}
 function renderFraction(q,root,ctx,spec){
  const state={whole:spec.mixed?null:0,numerator:null,denominator:null},forge=document.createElement('div');forge.className='paFractionForge';
  if(spec.mixed)forge.appendChild(chipGroup('Nombor bulat',componentCandidates(q,1,spec.whole),v=>state.whole=v));
  forge.appendChild(chipGroup('Pengangka',componentCandidates(q,2,spec.numerator),v=>state.numerator=v));
  forge.appendChild(chipGroup('Penyebut',componentCandidates(q,3,spec.denominator),v=>state.denominator=v));
  const submit=submitButton(q,'Tempa jawapan');submit.onclick=()=>{if(state.numerator===null||state.denominator===null||(spec.mixed&&state.whole===null)){forge.classList.add('needsValue');return}const got=`${spec.mixed?state.whole+' ':''}${state.numerator}/${state.denominator}`;deliver(q,submit,got,ctx,got===text(q.answer))};forge.appendChild(submit);root.appendChild(forge);
 }
 function renderTime(q,root,ctx,spec){
  const values=optionValues(q).map(x=>text(x.v)).map(v=>v.match(/^(\d{1,2}):(\d{2})$/)).filter(Boolean),hours=unique([spec.hour,...values.map(m=>Number(m[1]))]).sort((a,b)=>a-b),minutes=unique([spec.minute,...values.map(m=>Number(m[2])),0,15,30,45]).filter(x=>x<60).sort((a,b)=>a-b),state={hour:null,minute:null};
  const dial=document.createElement('div');dial.className='paTimeDial';dial.append(chipGroup('Jam',hours,v=>state.hour=v),chipGroup('Minit',minutes.map(v=>String(v).padStart(2,'0')),v=>state.minute=Number(v)));
  const submit=submitButton(q,'Kunci masa');submit.onclick=()=>{if(state.hour===null||state.minute===null){dial.classList.add('needsValue');return}const got=`${state.hour}:${String(state.minute).padStart(2,'0')}`;deliver(q,submit,got,ctx,state.hour===spec.hour&&state.minute===spec.minute)};dial.appendChild(submit);root.appendChild(dial);
 }
 function renderCoordinate(q,root,ctx,spec){
  const coords=optionValues(q).map(x=>text(x.v).match(/^\((\d+)\s*,\s*(\d+)\)$/)).filter(Boolean).map(m=>[Number(m[1]),Number(m[2])]),max=Math.max(5,...coords.flat(),spec.x,spec.y),grid=document.createElement('div');grid.className='paCoordGrid';grid.style.setProperty('--pa-grid-size',max+1);grid.setAttribute('aria-label','Grid koordinat interaktif');
  for(let y=max;y>=0;y--)for(let x=0;x<=max;x++){const b=button('','paCoordPoint');b.title=`(${x}, ${y})`;b.setAttribute('aria-label',`Koordinat ${x}, ${y}`);b.style.gridColumn=String(x+1);b.style.gridRow=String(max-y+1);b.onclick=()=>{grid.querySelectorAll('button').forEach(n=>n.classList.remove('selected'));b.classList.add('selected');deliver(q,b,`(${x},${y})`,ctx,x===spec.x&&y===spec.y)};grid.appendChild(b)}root.appendChild(grid);
 }
 function renderSequence(q,root,ctx,spec){
  const wrap=document.createElement('div');wrap.className='paSequenceForge';const chosen=document.createElement('div');chosen.className='paSequenceChosen';chosen.setAttribute('aria-live','polite');const tray=document.createElement('div');tray.className='paSequenceTray';let order=[];
  const refresh=()=>{chosen.textContent=order.length?order.map(x=>x.token).join(' → '):'Pilih mengikut urutan';tray.querySelectorAll('button').forEach(b=>b.disabled=order.some(x=>x.index===Number(b.dataset.index)))};
  shuffle(spec.tokens.map((token,index)=>({token,index}))).forEach(item=>{const b=button(item.token,'paSequenceToken');b.dataset.index=String(item.index);b.onclick=()=>{order.push(item);refresh()};tray.appendChild(b)});
  const reset=button('Ulang susun','paInteractionReset');reset.onclick=()=>{order=[];refresh()};const submit=submitButton(q,'Kunci urutan');submit.onclick=()=>{if(order.length!==spec.tokens.length){wrap.classList.add('needsValue');return}const got=order.map(x=>x.token).join(', ');deliver(q,submit,got,ctx,order.every((x,i)=>x.token===spec.tokens[i]))};wrap.append(chosen,tray,reset,submit);root.appendChild(wrap);refresh();
 }
 function renderAngle(q,root,ctx,spec){
  const wrap=document.createElement('div');wrap.className='paAngleForge';let value=90;const visual=document.createElement('div');visual.className='paAngleVisual';visual.innerHTML='<i></i><i></i><b>90°</b>';const arm=visual.children[1],label=visual.children[2];
  const range=document.createElement('input');range.type='range';range.min=String(spec.min);range.max=String(spec.max);range.step=String(spec.step);range.value=String(value);range.setAttribute('aria-label','Bukaan sudut');range.oninput=()=>{value=Number(range.value);arm.style.transform=`rotate(${-value}deg)`;label.textContent=value+'°'};range.oninput();
  const submit=submitButton(q,'Bentuk sudut');submit.onclick=()=>deliver(q,submit,value+'°',ctx,value===spec.value);wrap.append(visual,range,submit);root.appendChild(wrap);
 }
 function renderCircle(q,root,ctx,spec){
  const wrap=document.createElement('div');wrap.className='paCircleForge';let value=Math.max(spec.min,Math.min(spec.max,5));const visual=document.createElement('div');visual.className='paCircleVisual';const ring=document.createElement('i'),label=document.createElement('b');visual.append(ring,label);
  const range=document.createElement('input');range.type='range';range.min=String(spec.min);range.max=String(spec.max);range.step=String(spec.step);range.value=String(value);range.setAttribute('aria-label','Bukaan jangka lukis');range.oninput=()=>{value=Number(range.value);ring.style.width=ring.style.height=`${44+value*4}px`;label.textContent=value+' cm'};range.oninput();
  const submit=submitButton(q,'Kunci bukaan jangka');submit.onclick=()=>deliver(q,submit,value+' cm',ctx,numericEqual(value,spec.value));wrap.append(visual,range,submit);root.appendChild(wrap);
 }
 function renderClaimReason(q,root,ctx,spec){
  const state={claim:null,reason:null},forge=document.createElement('div');forge.className='paClaimForge';
  forge.append(chipGroup('Keputusan',shuffle(spec.claims),v=>state.claim=v),chipGroup('Sebab',shuffle(spec.reasons),v=>state.reason=v));
  const submit=submitButton(q,'Kunci hujah');submit.onclick=()=>{if(state.claim===null||state.reason===null){forge.classList.add('needsValue');return}const got=state.claim+spec.join+state.reason;deliver(q,submit,got,ctx,state.claim===spec.claim&&state.reason===spec.reason)};forge.appendChild(submit);root.appendChild(forge);
 }
 function renderToolSelect(q,root,ctx){
  const rack=document.createElement('div');rack.className='paToolRack';rack.setAttribute('aria-label','Pilih alat matematik');
  shuffle(optionValues(q)).forEach(o=>{const b=button(o.label??o.v,'paToolChoice');b.dataset.v=String(o.v);b.dataset.questionToken=String(q.token);b.onclick=()=>deliver(q,b,o.v,ctx,o.tag==='correct'&&text(o.v)===text(q.answer));rack.appendChild(b)});root.appendChild(rack);
 }
 function renderStepSequence(q,root,ctx,spec){
  const wrap=document.createElement('div');wrap.className='paSequenceForge paStepSequence';const chosen=document.createElement('div');chosen.className='paSequenceChosen';chosen.setAttribute('aria-live','polite');const tray=document.createElement('div');tray.className='paSequenceTray';let order=[];
  const items=spec.steps.map((token,index)=>({token,index})),refresh=()=>{chosen.textContent=order.length?order.map(x=>x.token).join(' → '):'Susun langkah mengikut urutan';tray.querySelectorAll('button').forEach(b=>b.disabled=order.some(x=>x.index===Number(b.dataset.index)))};
  shuffle(items).forEach(item=>{const b=button(item.token,'paSequenceToken paStepToken');b.dataset.index=String(item.index);b.onclick=()=>{order.push(item);refresh()};tray.appendChild(b)});
  const reset=button('Ulang susun','paInteractionReset');reset.onclick=()=>{order=[];wrap.classList.remove('needsValue');refresh()};const submit=submitButton(q,'Kunci prosedur');submit.onclick=()=>{if(order.length!==items.length){wrap.classList.add('needsValue');return}wrap.classList.remove('needsValue');const correct=order.every((x,i)=>x.index===i),got=order.map(x=>x.token).join(' → ');deliver(q,submit,got,ctx,correct)};wrap.append(chosen,tray,reset,submit);root.appendChild(wrap);refresh();
 }
 function renderJudgement(q,root,ctx,spec){
  const gate=document.createElement('div');gate.className='paJudgementGate';['betul','salah'].forEach(v=>{const b=button(v==='betul'?'BETUL':'SALAH','paJudgementChoice '+v);b.dataset.v=v;b.dataset.questionToken=String(q.token);b.onclick=()=>deliver(q,b,v,ctx,v===spec.value);gate.appendChild(b)});root.appendChild(gate);
 }
 function renderSigils(q,root,ctx){
  const grid=document.createElement('div');grid.className='paSigilGrid';
  shuffle(optionValues(q)).forEach(o=>{const b=button(o.label??o.v,'paSigilChoice');b.dataset.v=String(o.v);b.dataset.questionToken=String(q.token);b.onclick=()=>deliver(q,b,o.v,ctx,o.tag==='correct'&&text(o.v)===text(q.answer));grid.appendChild(b)});root.appendChild(grid);
 }
 function render(q,answers,ctx){
  if(!q||!answers||!ctx?.respond)return false;if(!q.interaction)prepare(q,{skillId:q.skill,meta:typeof META!=='undefined'?META[q.skill]:null});
  const spec=q.interaction.spec,labels={rune_entry:'Rune nombor',fraction_build:'Tempa pecahan',time_dial:'Dail masa',coordinate_plot:'Peta koordinat',sequence_build:'Rantai urutan',angle_build:'Protraktor kuasa',circle_build:'Jangka bulatan',claim_reason:'Bina hujah',tool_select:'Rak alat',step_sequence:'Susun prosedur',judgement_gate:'Gerbang keputusan',sigil_select:'Pilih sigil tepat'},root=rootFor(q,answers,labels[spec.kind]||'Cabaran interaktif');
  if(spec.kind==='rune_entry')renderRune(q,root,ctx,spec);else if(spec.kind==='fraction_build')renderFraction(q,root,ctx,spec);else if(spec.kind==='time_dial')renderTime(q,root,ctx,spec);else if(spec.kind==='coordinate_plot')renderCoordinate(q,root,ctx,spec);else if(spec.kind==='sequence_build')renderSequence(q,root,ctx,spec);else if(spec.kind==='angle_build')renderAngle(q,root,ctx,spec);else if(spec.kind==='circle_build')renderCircle(q,root,ctx,spec);else if(spec.kind==='claim_reason')renderClaimReason(q,root,ctx,spec);else if(spec.kind==='tool_select')renderToolSelect(q,root,ctx,spec);else if(spec.kind==='step_sequence')renderStepSequence(q,root,ctx,spec);else if(spec.kind==='judgement_gate')renderJudgement(q,root,ctx,spec);else renderSigils(q,root,ctx);return true;
 }
 function lock(){document.querySelectorAll('.paInteraction button,.paInteraction input').forEach(x=>x.disabled=true);document.querySelector('.paInteraction')?.classList.add('locked')}
 function unlockRetry(){const root=document.querySelector('.paInteraction');if(!root)return;root.classList.remove('locked');root.querySelectorAll('button:not(.no),input').forEach(x=>x.disabled=false)}
 function retryCopy(q){const type=q?.interaction?.type;return type==='sigil_select'?'Cuba sigil yang lain.':type==='coordinate_plot'?'Tandakan titik yang baharu.':type==='sequence_build'?'Susun semula rantai nombor.':type==='angle_build'?'Laraskan bukaan sudut semula.':type==='circle_build'?'Laraskan bukaan jangka semula.':type==='claim_reason'?'Padankan keputusan dengan sebab yang lebih tepat.':type==='tool_select'?'Pilih alat yang paling sesuai.':type==='step_sequence'?'Susun semula langkah mengikut prosedur yang betul.':type==='judgement_gate'?'Nilai semula dakwaan sebelum memilih Betul atau Salah.':'Bina jawapan sekali lagi.'}
 window.PAGameQuestionInteractions={version:VERSION,profiles:PROFILES,answerSpec,prepare,render,lock,unlockRetry,retryCopy,diagnoseWrongTag:wrongTag};
 document.documentElement?.setAttribute('data-game-question-interactions',VERSION);
})();
