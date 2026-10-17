/* Lapor Bug (paid guardians only): a new parent tab next to Tetapan.
   Nothing is stored on the server. The form builds an e-mail in the guardian's own
   mail app (mailto), and they attach screenshots there before sending. */
(function(){
'use strict';
if(window.PABugReport)return;
const BUG_EMAIL='pahlawanangka.app@gmail.com';
const EVENT={start:new Date('2026-10-17T00:00:00+08:00'),end:new Date('2026-11-17T23:59:59+08:00'),reward:'RM1'};
const AREAS=['Kembara / Segel','Kemahiran Fokus (mini game)','Soalan salah atau pelik','Laporan ibu bapa','Pembayaran / akaun','Paparan / butang','Lain-lain'];
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateMs=d=>d.toLocaleDateString('ms-MY',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kuala_Lumpur'});
const paid=()=>!!window.PACommercial?.isPaid?.();
const eventOn=()=>{const now=Date.now();return now>=EVENT.start.getTime()&&now<=EVENT.end.getTime()};
function device(){
 const ua=navigator.userAgent||'',os=/Android [\d.]+/.exec(ua)?.[0]||/iPhone OS [\d_]+/.exec(ua)?.[0]?.replace(/_/g,'.')||/iPad/.test(ua)&&'iPad'||/Windows NT [\d.]+/.exec(ua)?.[0]||/Mac OS X [\d_]+/.exec(ua)?.[0]?.replace(/_/g,'.')||'Lain';
 const br=/Edg\/[\d]+/.exec(ua)?.[0]||/SamsungBrowser\/[\d]+/.exec(ua)?.[0]||/Chrome\/[\d]+/.exec(ua)?.[0]||/Version\/[\d.]+.*Safari/.test(ua)&&'Safari'||/Firefox\/[\d]+/.exec(ua)?.[0]||'Pelayar lain';
 const app=window.matchMedia?.('(display-mode: standalone)').matches?'apps (dipasang)':'pelayar';
 return `${os} · ${br} · ${app} · skrin ${screen.width}×${screen.height}`;
}
function reference(){const d=new Date(),p=n=>String(n).padStart(2,'0');return `PA-${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${Math.random().toString(36).slice(2,6).toUpperCase()}`}
function report(){
 const title=$('paBugTitle').value.trim(),what=$('paBugWhat').value.trim(),steps=$('paBugSteps').value.trim(),area=$('paBugArea').value;
 const grade=(typeof db!=='undefined'&&db?.schoolGrade)?'Darjah '+db.schoolGrade:'-',user=window.PACloud?.state?.user?.email||'-';
 const ref=$('paBugForm').dataset.ref||($('paBugForm').dataset.ref=reference());
 const body=[
  `Rujukan: ${ref}`,`Bahagian: ${area}`,'',
  'Apa yang berlaku:',what,'',
  'Langkah untuk ulang:',steps||'-','',
  '--- Maklumat automatik ---',
  `Akaun: ${user}`,`Profil anak: ${grade}`,`Versi app: ${window.PA_APP_VERSION||'-'}`,`Peranti: ${device()}`,`Masa: ${new Date().toLocaleString('ms-MY',{timeZone:'Asia/Kuala_Lumpur'})}`,'',
  '(Sila lampirkan screenshot dalam e-mel ini sebelum hantar.)'
 ].join('\n');
 return{subject:`[Bug PA] ${title} · ${ref}`,body,ref};
}
function valid(){
 const t=$('paBugTitle').value.trim(),w=$('paBugWhat').value.trim(),msg=$('paBugStatus');
 if(t.length<4){msg.textContent='Tulis tajuk ringkas (sekurang-kurangnya 4 huruf).';$('paBugTitle').focus();return false}
 if(w.length<10){msg.textContent='Terangkan apa yang berlaku (sekurang-kurangnya 10 huruf).';$('paBugWhat').focus();return false}
 msg.textContent='';return true;
}
function send(){
 if(!valid())return;const r=report();
 location.href=`mailto:${BUG_EMAIL}?subject=${encodeURIComponent(r.subject)}&body=${encodeURIComponent(r.body)}`;
 $('paBugStatus').textContent=`E-mel dibuka dengan rujukan ${r.ref}. Lampirkan screenshot, kemudian tekan Hantar dalam apps e-mel anda.`;
}
async function copy(){
 if(!valid())return;const r=report(),text=`Kepada: ${BUG_EMAIL}\nTajuk: ${r.subject}\n\n${r.body}`;
 try{await navigator.clipboard.writeText(text);$('paBugStatus').textContent=`Laporan disalin. Tampal dalam e-mel kepada ${BUG_EMAIL} dan lampirkan screenshot.`}
 catch(_){$('paBugStatus').textContent=`Tidak dapat menyalin. Hantar e-mel kepada ${BUG_EMAIL} secara manual.`}
}
function panel(){
 const on=eventOn();
 return `<section class="card paBugEvent${on?'':' ended'}" aria-labelledby="paBugEventTitle">
  <span class="paBugBadge">${on?'EVENT KHAS · MASA TERHAD':'EVENT TELAH TAMAT'}</span>
  <h3 id="paBugEventTitle">Pemburu Bug Pahlawan Angka</h3>
  <p class="paBugReward"><strong>${EVENT.reward}</strong> untuk setiap bug yang disahkan</p>
  <p class="paBugDates">${dateMs(EVENT.start)} – ${dateMs(EVENT.end)}</p>
  <ul>
   <li>Untuk pengguna berbayar sahaja.</li>
   <li>Bug mesti baharu dan boleh diulang. Bug yang sama dikira untuk pelapor pertama sahaja.</li>
   <li>Setiap laporan disemak oleh pasukan kami. Kami akan balas e-mel anda untuk ganjaran.</li>
   <li>Cadangan ciri dan soalan yang anda rasa terlalu susah bukan bug, tetapi tetap dialu-alukan.</li>
  </ul>
  ${on?'':'<p class="paBugNote">Ganjaran tidak lagi diberi, tetapi laporan bug masih sangat dihargai.</p>'}
 </section>
 <form id="paBugForm" class="card paBugForm" novalidate>
  <div class="eyebrow">LAPOR BUG</div>
  <h3>Apa yang tidak kena?</h3>
  <label>Tajuk ringkas<input id="paBugTitle" maxlength="80" placeholder="Contoh: Jawapan 8 tiada dalam pilihan"></label>
  <label>Bahagian<select id="paBugArea">${AREAS.map(a=>`<option>${esc(a)}</option>`).join('')}</select></label>
  <label>Apa yang berlaku?<textarea id="paBugWhat" rows="4" maxlength="1500" placeholder="Apa yang anda nampak, dan apa yang sepatutnya berlaku."></textarea></label>
  <label>Langkah untuk ulang <small>(pilihan)</small><textarea id="paBugSteps" rows="3" maxlength="1000" placeholder="1. Buka Kemahiran Fokus&#10;2. Pilih Wang&#10;3. …"></textarea></label>
  <p class="paBugHint">📎 Screenshot dilampirkan dalam e-mel anda sendiri. Versi app, peranti dan Darjah ditambah secara automatik.</p>
  <div class="paBugActions">
   <button type="submit" class="btn primary">Buka e-mel untuk hantar</button>
   <button type="button" class="btn secondary" id="paBugCopy">Salin laporan</button>
  </div>
  <p id="paBugStatus" class="paBugStatus" role="status" aria-live="polite"></p>
  <p class="paBugTo">Dihantar ke <b>${esc(BUG_EMAIL)}</b></p>
 </form>`;
}
function mount(){
 const tabs=document.querySelector('#parent .parentTabs'),settings=$('settingsTab');if(!tabs||!settings)return;
 let button=tabs.querySelector('[data-parent-tab="bug"]'),host=$('bugTab');
 if(!paid()){button?.remove();host?.remove();return}
 if(!button){button=document.createElement('button');button.className='btn secondary small';button.dataset.parentTab='bug';button.type='button';button.textContent='Lapor Bug';button.onclick=()=>window.tab('bug');tabs.appendChild(button)}
 if(!host){host=document.createElement('div');host.id='bugTab';host.className='hidden';host.innerHTML=panel();settings.after(host);
  $('paBugForm').addEventListener('submit',e=>{e.preventDefault();send()});$('paBugCopy').addEventListener('click',copy);}
}
const original=window.renderParent;
if(typeof original==='function')window.renderParent=function(){const r=original.apply(this,arguments);try{mount()}catch(e){console.warn('Lapor Bug',e)}return r};
document.addEventListener('DOMContentLoaded',()=>{try{mount()}catch(_){}});
window.PABugReport={mount,email:BUG_EMAIL,event:EVENT};
})();
