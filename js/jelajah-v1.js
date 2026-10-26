(()=>{'use strict';
 const $=id=>document.getElementById(id),names=['Pertempuran','Mini-game','Cikgu Dimensi','Otak Pahlawan'];
 const images=['assets/ui/menu-v2/stage-wira-v1.webp','assets/ui/menu-v2/hero-stage-v1.webp','assets/coach/cikgu-wajar/welcome.webp','assets/ui/menu-v2/kembara-dimensi-book-v7.webp'];
 let grade=1,active=0,done=new Set(),battleFinished=false,model=null,step=0,quiz=0,log=[],frame=null;
 const scenario=()=>PAJelajahScenarios.get(grade),definition=()=>PACoachGames.definitions[scenario().game];
 function cards(){ $('cards').innerHTML=names.map((name,i)=>`<button data-card="${i}" class="${done.has(i)?'done':''}" ${i&&!battleFinished?'disabled':''} ${active===i?'aria-current="page"':''}><img src="${images[i]}" alt=""><strong>${name}</strong><small>${done.has(i)?'Selesai · ulang':i&&!battleFinished?'Selepas battle':'Teroka'}</small></button>`).join('') }
 function reset(){frame=null;done=new Set();battleFinished=false;active=0;log=[];show(0)}
 function show(index){
  if(index&&!battleFinished)return;
  // Removing the real stage destroys all old animation/autopilot callbacks.
  frame=null;active=index;model=PACoachGames.create(scenario().game);step=0;quiz=index===2?1:0;cards();
  $('status').textContent=index?`Topik simulasi Darjah ${grade}: ${scenario().topic}. Bukan analisis anak.`:'Soalan 1–6: kamu jawab. Soalan 7–12: autopilot simulasi; tiada rekod penguasaan.';
  if(index===0){$('content').innerHTML=`<section class="panel"><img class="start-art" src="assets/battlefields/forest-temple/arena-v1.webp" alt="Pentas asal Pahlawan Angka"><p class="lead">DEMO PEMBANGUNAN · TIADA PENILAIAN SEBENAR</p><h1>Jelajah Darjah ${grade}</h1><p>Jawab 6 soalan. Kemudian lihat 6 soalan autopilot dengan kesilapan berulang dan pemulihan yang telah ditetapkan.</p><p>Topik contoh: <b>${scenario().topic}</b>. Selepas battle, ketiga-tiga kad lain dibuka.</p><button class="primary" data-start>Mulakan pertempuran</button></section>`;return}
  if(index===3){renderBrain();return}renderTeaching();
 }
 function start(){
  cards();log=[];
  $('content').innerHTML=`<iframe title="Battlefield asal · Demo Jelajah Darjah ${grade}" src="jelajah-runtime.html?grade=${grade}" allow="autoplay"></iframe>`;
  frame=$('content').querySelector('iframe');
 }
 function renderTeaching(){
  const s=scenario(),d=definition(),coach=active===2;
  let body='';
  if(step===0)body=`<p>${d.goal}</p><p>${s.remediation}</p><button class="primary" data-step>Jom bina model</button>`;
  else if(step===1)body=PACoachGames.scene(model)+PACoachGames.controls(model)+`<p class="feedback" role="status">${model.feedback||'Cuba satu tindakan pada model.'}</p>`;
  else if(step===2)body=`${PACoachGames.diagram(model)}<p>${d.idea}</p><p>${coach?'Boleh terangkan bagaimana model tadi menunjukkan hubungan ini?':'Semak hubungan yang kamu bina.'}</p><button class="primary" data-step>Saya faham · cuba sendiri</button>`;
  else if(step===4)body=`<p>${s.diagnostic.question}</p><div class="choices">${s.diagnostic.choices.map((c,i)=>`<button data-diagnostic="${i}">${c}</button>`).join('')}</div><p id="diagnosticFeedback" class="feedback" role="status"></p>`;
  else if(step===5)body=`<p>${s.diagnostic.feedback}</p><section class="alternate"><h3>Cuba cara lain</h3><p>${s.diagnostic.alternative}</p></section><p>Boleh terangkan hubungan ini dengan kata-kata kamu?</p><button class="primary" data-fresh>Cuba soalan baharu tanpa model</button>`;
  else body=`<p>Tanpa model: ${s.independent[quiz].prompt}</p><form id="transfer"><label>Jawapan <input name="answer" aria-label="Jawapan sendiri" inputmode="decimal" autocomplete="off" required></label><button class="primary">Semak</button></form><p id="checkFeedback" class="feedback" role="status"></p>`;
  $('content').innerHTML=`<section class="panel"><p class="lead">${coach?'CIKGU DIMENSI':'MINI-GAME ASAL'} · SIMULASI PEMULIHAN</p><h2>${s.topic}</h2>${coach?'<div class="coach"><img src="assets/coach/cikgu-wajar/teach.webp" alt="Cikgu Dimensi"><p>Kita lihat hubungan ini perlahan-lahan. Ini contoh pengajaran, bukan bukti penguasaan.</p></div>':`<p>${d.title}</p>`}<p class="steps">${['Faham','Bina','Sambung','Cuba dan Guna'][Math.min(step,3)]}</p>${body}</section>`;
 }
 function renderBrain(){
  done.add(3);cards();
  const s=scenario();
  $('content').innerHTML=`<section class="panel"><span class="badge">CONTOH ANALISIS · DATA SIMULASI</span><h2>Otak Pahlawan · Darjah ${grade}</h2><p>Topik contoh yang telah ditetapkan: <b>${s.topic}</b>.</p><p>Autopilot menunjukkan 4 kesilapan dan 2 jawapan betul. Corak berulang mencetuskan contoh pemulihan: ${s.hint}</p><table><thead><tr><th>Soalan</th><th>Skrip simulasi</th><th>Respons contoh</th></tr></thead><tbody>${s.script.map((ok,i)=>`<tr><td>${i+7}</td><td>${ok?'Betul':'Salah'}</td><td>${i>=2?'Model dan petunjuk terarah':'Perhatikan kesilapan berulang'}</td></tr>`).join('')}</tbody></table><p>Mini-game <b>${definition().title}</b> dan Cikgu Dimensi menggunakan topik yang sama. Pemulihan asas ini sengaja ditetapkan untuk jelajah, bukan penilaian tahap Darjah ${grade}.</p><p>Jawapan kamu pada soalan 1–6 tidak menentukan topik ini. Tiada markah, mastery, ganjaran atau kemajuan disimpan.</p></section>`;
 }
 $('grade').innerHTML=Array.from({length:6},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('');
 $('grade').onchange=()=>{grade=Number($('grade').value);reset()};
 $('cards').onclick=e=>{const b=e.target.closest('[data-card]');if(b&&!b.disabled)show(Number(b.dataset.card))};
 $('buy').onclick=()=>{const open=$('offers').hidden;$('offers').hidden=!open;$('buy').setAttribute('aria-expanded',String(open))};
 $('content').onclick=e=>{
  if(e.target.closest('[data-start]')){start();return}
  if(e.target.closest('[data-step]')){step++;renderTeaching();return}
  if(e.target.closest('[data-cg-next]')){step=2;renderTeaching();return}
  const diagnostic=e.target.closest('[data-diagnostic]');if(diagnostic){if(Number(diagnostic.dataset.diagnostic)===scenario().diagnostic.answer){step=5;renderTeaching()}else $('diagnosticFeedback').textContent=scenario().diagnostic.feedback+' Semak hubungan itu, kemudian cuba pilih lagi.';return}
  if(e.target.closest('[data-fresh]')){quiz=active===2?3:2;step=3;renderTeaching();return}
  const b=e.target.closest('[data-cg-action]');if(!b)return;
  const raw=b.dataset.cgValue,value=raw!==undefined&&/^-?\d+$/.test(raw)?Number(raw):raw;
  model=PACoachGames.reduce(model,b.dataset.cgAction,value);renderTeaching();
 };
 $('content').onsubmit=e=>{
  if(e.target.id!=='transfer')return;e.preventDefault();
  const value=new FormData(e.target).get('answer').trim();
  if(value===scenario().independent[quiz].answer){done.add(active);cards();$('checkFeedback').innerHTML='Tepat untuk contoh ini. Ini latihan demo sahaja; tiada penguasaan direkod. <button data-replay>Ulang aktiviti</button>';e.target.querySelector('button').disabled=true}
  else{step=4;renderTeaching()}
 };
 $('content').addEventListener('click',e=>{if(e.target.closest('[data-replay]'))show(active)});
 window.addEventListener('message',e=>{
  if(e.origin!==location.origin||!frame||e.source!==frame.contentWindow||e.data?.source!=='pa-jelajah'||e.data.grade!==grade)return;
  const d=e.data;
  if(d.type==='failed')$('status').textContent=d.message;
  if(d.type==='question')$('status').textContent=`Soalan ${d.index+1}/12 · ${d.auto?'AUTOPILOT SIMULASI':'KAMU JAWAB'}${d.remediation?' · Pemulihan contoh: '+scenario().hint:''}`;
  if(d.type==='resolved')log.push({index:d.index,correct:d.correct,simulated:d.simulated});
  if(d.type==='finished'){battleFinished=true;done.add(0);frame=null;cards();$('status').textContent='Battle selesai. Mini-game, Cikgu Dimensi dan Otak Pahlawan kini dibuka.';$('content').innerHTML='<section class="panel"><h2>Jelajah diteruskan!</h2><p>Enam jawapan kamu dan enam langkah simulasi telah selesai. Pilih mana-mana kad di atas untuk melihat pemulihan topik simulasi yang sama.</p><button data-card-next class="primary">Main mini-game</button></section>';$('content').querySelector('[data-card-next]').onclick=()=>show(1)}
 });
 reset();
})();
