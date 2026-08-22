// Pahlawan Angka v3.26.0 — skill report exports and premium worksheet studio.
(()=>{
'use strict';
const state={mode:'recommended',count:20,topic:'',busy:false};
const $=id=>document.getElementById(id);
const safe=value=>typeof parentSafe==='function'?parentSafe(value):String(value??'');
const allowed=()=>!!(window.PACommercial?.isPremium?.()||window.PACommercial?.canUseDev?.());
const gate=()=>{if(allowed())return true;window.PACommercial?.openPricing?.();return false};
const slug=value=>String(value||'anak').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'anak';
const dateLabel=()=>new Date().toLocaleDateString('ms-MY',{day:'numeric',month:'long',year:'numeric'});
function coreSkills(){const g=typeof coreGrade==='function'?coreGrade():Number(db?.schoolGrade||1);return GRAPH.skills.filter(m=>m.grade===g&&m.role==='core')}
function snapshot(){
 const skills=coreSkills().map(m=>{const s=scoreState(m.id),attempts=skillAttempts(s),accuracy=skillAccuracy(s),level=powerLevel(s);return{m,s,attempts,accuracy,level}});
 const attempts=skills.reduce((n,x)=>n+x.attempts,0),correct=skills.reduce((n,x)=>n+Number(x.s.correct||0),0);
 const tested=skills.filter(x=>x.attempts>0),strong=skills.filter(x=>x.level===3).sort((a,b)=>b.s.mastery-a.s.mastery),priority=skills.filter(x=>x.level===1).sort((a,b)=>a.s.mastery-b.s.mastery),developing=skills.filter(x=>x.level===2).sort((a,b)=>a.s.mastery-b.s.mastery);
 return{grade:Number(db.schoolGrade||1),name:String(db.name||'Anak'),skills,attempts,accuracy:attempts?Math.round(correct/attempts*100):0,tested,strong,priority,developing,recommended:[...priority,...developing,...skills.filter(x=>x.level===0),...strong].map(x=>x.m)};
}
function miniBars(rows){return rows.slice(0,4).map(x=>`<span><b>${safe(x.m.title)}</b><i style="--w:${Math.max(3,Math.round(x.s.mastery||0))}%"></i><em>${x.attempts?x.accuracy+'%':'baru'}</em></span>`).join('')}
function markup(){
 const snap=snapshot(),topics=coreSkills();if(!state.topic)state.topic=topics[0]?.id||'';
 return `<div class="paParentTools">
 <section class="paExportCard"><div class="paToolHead"><span class="paToolIcon">▤</span><div><small>ANALISIS PEMBELAJARAN</small><h3>Laporan yang mudah dikongsi</h3></div><span class="paProPill">PRO</span></div><p class="paToolCopy">Ringkasan kemahiran yang kemas untuk simpanan keluarga, perbincangan bersama guru atau perkongsian media sosial.</p><div class="paSkillSnapshot"><div><b>${snap.attempts}</b><small>soalan dijawab</small></div><div><b>${snap.attempts?snap.accuracy+'%':'-'}</b><small>ketepatan</small></div><div><b>${snap.strong.length}</b><small>kemahiran mantap</small></div></div><div class="paExportPreview"><div class="paExportPreviewHead"><b>Pratonton kemahiran utama</b><span>Darjah ${snap.grade}</span></div><div class="paMiniBars">${miniBars([...snap.priority,...snap.developing,...snap.strong])||'<span><b>Belum cukup bukti</b><i style="--w:8%"></i><em>baru</em></span>'}</div></div><div class="paToolActions"><button class="paToolBtn primary" onclick="PAParentTools.exportReport()">Muat turun PDF</button><button class="paToolBtn" onclick="PAParentTools.shareCard()">Kongsi kad kemajuan</button></div></section>
 <section class="paWorksheetCard"><div class="paToolHead"><span class="paToolIcon">✎</span><div><small>STUDIO WORKSHEET</small><h3>Latihan untuk dicetak</h3></div><span class="paProPill">PRO</span></div><p class="paToolCopy">Pilih latihan mengikut satu topik, campuran Darjah ${snap.grade}, atau keutamaan yang dikenal pasti oleh Cikgu Dimensi.</p><div class="paWorksheetModes"><button class="paWorksheetMode ${state.mode==='topic'?'active':''}" onclick="PAParentTools.mode('topic')"><span>◎</span><b>Topik</b><small>Satu kemahiran</small></button><button class="paWorksheetMode ${state.mode==='grade'?'active':''}" onclick="PAParentTools.mode('grade')"><span>▦</span><b>Darjah</b><small>Latihan campuran</small></button><button class="paWorksheetMode ${state.mode==='recommended'?'active':''}" onclick="PAParentTools.mode('recommended')"><span>✦</span><b>Disyorkan</b><small>Ikut bukti anak</small></button></div><div class="paWorksheetOptions"><label>Fokus worksheet<select id="paWorksheetTopic" ${state.mode==='topic'?'':'disabled'} onchange="PAParentTools.topic(this.value)">${topics.map(m=>`<option value="${m.id}" ${m.id===state.topic?'selected':''}>${safe(m.title)}</option>`).join('')}</select></label><label>Bilangan soalan<div class="paCountPicker">${[10,20,30,40].map(n=>`<button class="${state.count===n?'active':''}" onclick="PAParentTools.count(${n})">${n}</button>`).join('')}</div></label></div><div class="paWorksheetHint"><span>✦</span><span><b>Cadangan Cikgu Dimensi</b><br>${safe(recommendationCopy(snap))}</span></div><div class="paToolActions"><button class="paToolBtn" onclick="PAParentTools.worksheet(false)">Versi murid</button><button class="paToolBtn primary" onclick="PAParentTools.worksheet(true)">Murid + skema</button></div><div id="paWorksheetStatus" class="paWorksheetStatus"></div></section></div>`;
}
function recommendationCopy(snap){
 const lead=snap.priority[0]||snap.developing[0];
 if(lead)return `Mulakan dengan ${lead.m.title}, kemudian selang-selikan satu kemahiran yang lebih stabil.`;
 if(!snap.tested.length)return 'Belum cukup bukti. Worksheet akan menggunakan campuran asas pada darjah semasa.';
 return 'Tiada jurang utama dikesan. Worksheet akan mengukuhkan kemahiran melalui format soalan yang berbeza.';
}
function mount(){const core=$('coreTab');if(!core)return;const head=core.querySelector('.parentReportHead');if(!head)return;let host=$('paParentTools');if(!host){host=document.createElement('div');host.id='paParentTools';head.after(host)}host.innerHTML=markup()}
function mode(value){state.mode=value;mount()}
function count(value){state.count=Math.max(10,Math.min(40,Number(value)||20));mount()}
function topic(value){state.topic=value}
function status(text,error=false){const el=$('paWorksheetStatus');if(el){el.textContent=text||'';el.classList.toggle('error',error)}}

let logoPromise=null;
function loadLogo(){
 if(logoPromise)return logoPromise;
 logoPromise=new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src='assets/icons/pa-192.png'});return logoPromise;
}
function roundRect(ctx,x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
function wrap(ctx,text,maxWidth){
 const words=String(text||'').replace(/\s+/g,' ').trim().split(' '),lines=[];let line='';
 for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test}if(line)lines.push(line);return lines;
}
function drawWrapped(ctx,text,x,y,maxWidth,lineHeight,maxLines=99){const lines=wrap(ctx,text,maxWidth).slice(0,maxLines);lines.forEach((line,i)=>ctx.fillText(line,x,y+i*lineHeight));return y+lines.length*lineHeight}
async function page(title,subtitle){
 const canvas=document.createElement('canvas');canvas.width=1240;canvas.height=1754;const ctx=canvas.getContext('2d');ctx.fillStyle='#f7f4ec';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#0b2340';ctx.fillRect(0,0,canvas.width,212);ctx.fillStyle='#f1c645';ctx.fillRect(0,202,canvas.width,10);
 const logo=await loadLogo();if(logo){roundRect(ctx,78,48,116,116,28,'#102f55','#d8ad34');ctx.drawImage(logo,88,58,96,96)}
 ctx.fillStyle='#f4ca48';ctx.font='900 23px Arial';ctx.fillText('PAHLAWAN ANGKA',224,77);ctx.fillStyle='#fff';ctx.font='900 43px Arial';ctx.fillText(title,224,126);ctx.fillStyle='#b9c9dc';ctx.font='22px Arial';ctx.fillText(subtitle,224,164);return{canvas,ctx,y:270};
}
function footer(ctx,pageNo,label='pahlawanangka.netlify.app'){ctx.strokeStyle='#d4cdbd';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(78,1668);ctx.lineTo(1162,1668);ctx.stroke();ctx.fillStyle='#6e7783';ctx.font='18px Arial';ctx.fillText(label,78,1704);ctx.textAlign='right';ctx.fillText(`Halaman ${pageNo}`,1162,1704);ctx.textAlign='left'}
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1200)}
function jpegBytes(canvas){const data=canvas.toDataURL('image/jpeg',.9).split(',')[1],raw=atob(data),out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out}
function pdfFromCanvases(canvases){
 const enc=new TextEncoder(),parts=[];let length=0;const offsets=[0];const push=value=>{const bytes=typeof value==='string'?enc.encode(value):value;parts.push(bytes);length+=bytes.length};const obj=(n,body,binary=null)=>{offsets[n]=length;push(`${n} 0 obj\n${body}`);if(binary){push(binary);push('\nendstream')}push('\nendobj\n')};
 push('%PDF-1.4\n%PAHL\n');const count=canvases.length,kids=canvases.map((_,i)=>`${3+i*3} 0 R`).join(' ');obj(1,'<< /Type /Catalog /Pages 2 0 R >>');obj(2,`<< /Type /Pages /Kids [${kids}] /Count ${count} >>`);
 canvases.forEach((canvas,i)=>{const p=3+i*3,c=p+1,img=p+2,jpg=jpegBytes(canvas),stream='q\n595 0 0 842 0 0 cm\n/Im0 Do\nQ';obj(p,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 ${img} 0 R >> >> /Contents ${c} 0 R >>`);obj(c,`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);obj(img,`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`,jpg)});
 const xref=length,total=2+count*3;push(`xref\n0 ${total+1}\n0000000000 65535 f \n`);for(let i=1;i<=total;i++)push(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`);push(`trailer\n<< /Size ${total+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);return new Blob(parts,{type:'application/pdf'})
}

async function exportReport(){
 if(!gate()||state.busy)return;state.busy=true;
 try{
  const snap=snapshot(),pages=[];let p=await page(`Laporan Kemahiran ${snap.name}`,`Matematik Darjah ${snap.grade} | ${dateLabel()}`),{ctx}=p;
  ctx.fillStyle='#18273b';ctx.font='900 35px Arial';ctx.fillText('Gambaran pembelajaran',78,302);ctx.fillStyle='#667286';ctx.font='22px Arial';drawWrapped(ctx,'Ringkasan ini menggunakan bukti latihan dalam aplikasi. Ia bukan keputusan peperiksaan atau diagnosis klinikal.',78,342,1060,31,3);
  const stats=[['Soalan dijawab',snap.attempts],['Ketepatan semasa',snap.attempts?snap.accuracy+'%':'-'],['Kemahiran mantap',snap.strong.length]];stats.forEach((s,i)=>{const x=78+i*354;roundRect(ctx,x,430,326,140,22,'#102b4a');ctx.fillStyle='#f2c747';ctx.font='900 38px Arial';ctx.fillText(String(s[1]),x+24,488);ctx.fillStyle='#d9e3ef';ctx.font='20px Arial';ctx.fillText(s[0],x+24,529)});
  const strong=snap.strong[0],priority=snap.priority[0]||snap.developing[0];const cards=[[strong,'YANG SEMAKIN KUAT','#e8f7ef','#237850'],[priority,'PERLU PERHATIAN','#fff3df','#a56718']];cards.forEach((entry,i)=>{const[x,label,bg,color]=entry,y=630+i*226;roundRect(ctx,78,y,1084,190,22,bg,'#d7d4c9');ctx.fillStyle=color;ctx.font='900 19px Arial';ctx.fillText(label,108,y+40);ctx.fillStyle='#17263a';ctx.font='900 30px Arial';ctx.fillText(x?x.m.title:'Belum cukup bukti',108,y+83);ctx.fillStyle='#596577';ctx.font='21px Arial';drawWrapped(ctx,x?skillReason(x.m,x.s,x.level):'Teruskan beberapa latihan lagi supaya Cikgu Dimensi boleh membuat rumusan yang kukuh.',108,y+120,990,29,2)});
  const mission=priority?.m||snap.recommended[0];roundRect(ctx,78,1100,1084,275,24,'#102b4a');ctx.fillStyle='#f2c747';ctx.font='900 19px Arial';ctx.fillText('CADANGAN CIKGU DIMENSI',108,1144);ctx.fillStyle='#fff';ctx.font='900 31px Arial';ctx.fillText(mission?.title||'Teruskan pengembaraan',108,1190);ctx.fillStyle='#c4d2e2';ctx.font='22px Arial';drawWrapped(ctx,recommendationCopy(snap),108,1232,980,32,4);footer(ctx,1);pages.push(p.canvas);
  const chunks=[];for(let i=0;i<snap.skills.length;i+=9)chunks.push(snap.skills.slice(i,i+9));for(let ci=0;ci<chunks.length;ci++){p=await page('Butiran Kemahiran',`${snap.name} | Darjah ${snap.grade} | Bukti mengikut kemahiran`);ctx=p.ctx;let y=280;for(const x of chunks[ci]){roundRect(ctx,78,y,1084,126,18,'#ffffff','#ded9cd');ctx.fillStyle='#17263a';ctx.font='900 23px Arial';ctx.fillText(x.m.title,102,y+38);ctx.fillStyle='#677386';ctx.font='18px Arial';ctx.fillText(`${powerLabel(x.level)} | ${x.attempts?x.s.correct+'/'+x.attempts+' betul':'Belum dicuba'}${Number(x.s.hints||0)?' | '+x.s.hints+' petunjuk':''}`,102,y+70);ctx.fillStyle='#e7e8e4';roundRect(ctx,102,y+88,920,12,6,'#e7e8e4');roundRect(ctx,102,y+88,Math.max(28,920*Math.min(100,Number(x.s.mastery||0))/100),12,6,x.level===3?'#45b77a':x.level===1?'#e4a53e':'#e0c044');ctx.fillStyle='#243247';ctx.font='900 18px Arial';ctx.fillText(x.attempts?x.accuracy+'%':'-',1050,y+101);y+=142}footer(ctx,ci+2);pages.push(p.canvas)}
  download(pdfFromCanvases(pages),`laporan-kemahiran-${slug(snap.name)}-darjah-${snap.grade}.pdf`);
 }catch(error){console.error(error);alert('Laporan belum dapat dijana. Cuba sekali lagi.')}finally{state.busy=false}
}

async function shareCard(){
 if(!gate()||state.busy)return;state.busy=true;
 try{
  const snap=snapshot(),canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;const ctx=canvas.getContext('2d'),gradient=ctx.createLinearGradient(0,0,0,1920);gradient.addColorStop(0,'#0c2948');gradient.addColorStop(1,'#061324');ctx.fillStyle=gradient;ctx.fillRect(0,0,1080,1920);ctx.fillStyle='#f2c646';ctx.fillRect(0,0,1080,18);const logo=await loadLogo();if(logo)ctx.drawImage(logo,74,70,130,130);ctx.fillStyle='#f2c646';ctx.font='900 28px Arial';ctx.fillText('PAHLAWAN ANGKA',228,111);ctx.fillStyle='#fff';ctx.font='900 48px Arial';ctx.fillText('Kemajuan Matematik',228,170);ctx.fillStyle='#aebed2';ctx.font='25px Arial';ctx.fillText(dateLabel(),76,252);
  roundRect(ctx,60,310,960,300,34,'#102f51','#416589');ctx.fillStyle='#f2c646';ctx.font='900 24px Arial';ctx.fillText(`DARJAH ${snap.grade}`,102,370);ctx.fillStyle='#fff';ctx.font='900 60px Arial';ctx.fillText(snap.name,102,445);ctx.fillStyle='#bdcada';ctx.font='27px Arial';ctx.fillText('Perjalanan pembelajaran minggu ini',102,500);ctx.fillStyle='#f2c646';ctx.font='900 68px Arial';ctx.fillText(snap.attempts?snap.accuracy+'%':'-',102,578);ctx.fillStyle='#dce6f2';ctx.font='24px Arial';ctx.fillText('ketepatan semasa',280,566);
  const stats=[['SOALAN',snap.attempts],['MANTAP',snap.strong.length],['DITEROKA',snap.tested.length]];stats.forEach((s,i)=>{const x=60+i*326;roundRect(ctx,x,650,304,150,24,'#0b213b','#304e72');ctx.fillStyle='#f3cc4e';ctx.font='900 42px Arial';ctx.textAlign='center';ctx.fillText(String(s[1]),x+152,711);ctx.fillStyle='#9fb2ca';ctx.font='900 19px Arial';ctx.fillText(s[0],x+152,756);ctx.textAlign='left'});
  const strong=snap.strong.slice(0,2),priority=snap.priority[0]||snap.developing[0];ctx.fillStyle='#fff';ctx.font='900 32px Arial';ctx.fillText('Yang semakin kuat',76,890);let y=932;(strong.length?strong:[null]).forEach(x=>{roundRect(ctx,76,y,928,96,19,'#103c35','#2d8062');ctx.fillStyle='#5de0a1';ctx.font='900 25px Arial';ctx.fillText('✓',106,y+58);ctx.fillStyle='#effff7';ctx.font='900 25px Arial';ctx.fillText(x?x.m.title:'Masih mengumpul bukti',154,y+58);y+=112});ctx.fillStyle='#fff';ctx.font='900 32px Arial';ctx.fillText('Misi seterusnya',76,y+44);roundRect(ctx,76,y+70,928,220,23,'#302a19','#d5aa35');ctx.fillStyle='#f3cb4c';ctx.font='900 27px Arial';ctx.fillText(priority?priority.m.title:'Teruskan pengembaraan',108,y+124);ctx.fillStyle='#e4e8ee';ctx.font='24px Arial';drawWrapped(ctx,recommendationCopy(snap),108,y+166,850,34,4);ctx.fillStyle='#7f95af';ctx.font='20px Arial';ctx.fillText('Dikongsi oleh penjaga | Tiada maklumat akaun dipaparkan',76,1810);ctx.fillStyle='#f2c646';ctx.fillRect(76,1844,928,4);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));const file=new File([blob],`kemajuan-${slug(snap.name)}.png`,{type:'image/png'});if(navigator.share&&navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:`Kemajuan Matematik ${snap.name}`});return}catch(error){if(error.name==='AbortError')return}}download(blob,file.name);
 }catch(error){console.error(error);alert('Kad kemajuan belum dapat disediakan.')}finally{state.busy=false}
}

function plainPrompt(raw){const div=document.createElement('div'),spaced=String(raw||'').replace(/<br\s*\/?\s*>/gi,' ').replace(/<\/(?:div|p|li|section|h[1-6])>/gi,' ');div.innerHTML=spaced;let text=(div.textContent||'').replace(/\s+/g,' ').replace(/([.!?])(?=[A-Za-z])/g,'$1 ').trim();if(/^Mempunyai\b/i.test(text))text='Bentuk ini '+text.charAt(0).toLowerCase()+text.slice(1);return text}
const optionDependent=prompt=>/\b(?:manakah|yang mana|pilih|antara berikut|jawapan[^.?!]{0,30}munasabah|anggaran[^.?!]{0,25}sesuai)\b/i.test(prompt);
function printableQuestion(q){
 const raw=String(q?.prompt||'');if(!raw||/<(?:svg|img|canvas|table)\b/i.test(raw)||/(moneyVisual|clockFace|barChart|pictureGraph|coordinateGrid|shapeVisual|dataChart)/i.test(raw))return null;const prompt=plainPrompt(raw);if(prompt.length<3||prompt.length>260)return null;
 const answer=String(q.answer??'').replace(/\s+/g,' ').trim(),choices=optionDependent(prompt)?shuffle([{value:answer,correct:true},...(q.wrong||[]).map(x=>({value:String(x?.label??x?.v??'').replace(/\s+/g,' ').trim(),correct:false}))]).filter(x=>x.value).slice(0,4):null;
 return{prompt,answer,hint:plainPrompt(q.hint||'Semak langkah pengiraan dengan teliti.'),skill:q.skill,choices};
}
const wr=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const wp=arr=>arr[wr(0,arr.length-1)];
function worksheetFallback(m){
 const id=m.id;
 if(id==='D1.MONEY'){
  const a=wp([5,10,20,50]),b=wp([5,10,20,50]),name=wp(['Aina','Ravi','Mei Ling','Hakim']);return{prompt:`${name} mempunyai ${a} sen dan menerima lagi ${b} sen. Berapakah jumlah wangnya?`,answer:`${a+b} sen`,hint:'Tambah nilai kedua-dua wang.',skill:id,title:m.title};
 }
 if(id==='D1.TIME'){
  const h=wr(1,12),later=wr(1,4),name=wp(['kelas','latihan','cerita','permainan']);return{prompt:`${name[0].toUpperCase()+name.slice(1)} bermula pada pukul ${h}:00 dan berlangsung selama ${later} jam. Pukul berapakah ia tamat?`,answer:`${(h+later-1)%12+1}:00`,hint:'Gerakkan waktu ke hadapan mengikut tempoh jam.',skill:id,title:m.title};
 }
 if(id==='D1.SHAPE'){
  const shapes=[['segi tiga','3 sisi dan 3 bucu'],['segi empat sama','4 sisi yang sama panjang dan 4 bucu'],['segi empat tepat','4 bucu serta dua sisi panjang dan dua sisi pendek'],['bulatan','tiada sisi lurus dan tiada bucu']],x=wp(shapes),context=wp(['Kad bentuk','Papan tanda','Corak pada buku','Bentuk pilihan Amir','Bentuk pilihan Siti','Pelekat kelas','Lencana sekolah','Bingkai gambar','Corak lantai','Kad permainan']);return{prompt:`${context} mempunyai ${x[1]}. Apakah nama bentuk itu?`,answer:x[0],hint:'Kenal pasti bentuk melalui ciri sisi dan bucu.',skill:id,title:m.title};
 }
 if(id==='D1.DATA'){
  const values=[wr(2,5),wr(6,9),wr(10,13)].sort(()=>Math.random()-.5),[a,b,c]=values,items=wp([['epal','oren','pisang'],['pensel','pemadam','pembaris'],['buku','komik','majalah']]),owner=wp(['Aina','Ravi','Mei Ling','Hakim']),max=Math.max(a,b,c),answer=items[[a,b,c].indexOf(max)];return{prompt:`Senarai ${owner} menunjukkan ${a} ${items[0]}, ${b} ${items[1]} dan ${c} ${items[2]}. Item manakah paling banyak?`,answer,hint:'Bandingkan ketiga-tiga bilangan.',skill:id,title:m.title};
 }
 if(id==='D2.7.2'){
  const shapes=[['segi tiga','3 sisi dan 3 bucu'],['segi empat sama','4 sisi sama panjang dan 4 bucu'],['segi empat tepat','4 bucu serta dua sisi panjang dan dua sisi pendek'],['pentagon','5 sisi dan 5 bucu'],['heksagon','6 sisi dan 6 bucu']],x=wp(shapes),context=wp(['Kad A','Kad B','Corak jubin','Papan tanda','Lencana','Pelekat','Bingkai','Lukisan']);return{prompt:`${context} menunjukkan bentuk 2D dengan ${x[1]}. Apakah nama bentuk itu?`,answer:x[0],hint:'Padankan bilangan dan sifat sisi dengan nama bentuk.',skill:id,title:m.title};
 }
 if(['D3.SHAPE','D4.PERIM'].includes(id)){
  const l=wr(3,id==='D3.SHAPE'?15:40),w=wr(2,Math.max(2,l-1));return{prompt:`Sebuah segi empat tepat mempunyai panjang ${l} cm dan lebar ${w} cm. Hitung perimeter bentuk itu.`,answer:`${2*(l+w)} cm`,hint:'Perimeter segi empat tepat = 2 × (panjang + lebar).',skill:id,title:m.title};
 }
 if(['D5.AREA','D6.AREA'].includes(id)){
  if(id==='D6.AREA'&&Math.random()<.45){const l=wr(2,12),w=wr(2,10),h=wr(2,8);return{prompt:`Sebuah kuboid mempunyai panjang ${l} cm, lebar ${w} cm dan tinggi ${h} cm. Hitung isi padunya.`,answer:`${l*w*h} cm³`,hint:'Isi padu kuboid = panjang × lebar × tinggi.',skill:id,title:m.title}}
  const l=wr(4,30),w=wr(3,Math.max(3,l-1));return{prompt:`Sebuah segi empat tepat mempunyai panjang ${l} cm dan lebar ${w} cm. Hitung luasnya.`,answer:`${l*w} cm²`,hint:'Luas segi empat tepat = panjang × lebar.',skill:id,title:m.title};
 }
 return null;
}
function worksheetSkills(snap){if(state.mode==='topic')return coreSkills().filter(m=>m.id===state.topic);if(state.mode==='recommended')return snap.recommended.slice(0,Math.min(6,snap.recommended.length));return coreSkills()}
function makeQuestions(){
 const snap=snapshot(),pool=worksheetSkills(snap);if(!pool.length)throw new Error('Tiada kemahiran tersedia.');const originalSess=typeof sess!=='undefined'?sess:null,items=[],seen=new Set();
 try{sess={mode:'practice',questionFingerprints:[],questionHistory:[],recent:[],hint:false};let guard=0;while(items.length<state.count&&guard++<state.count*45){const m=pool[guard%pool.length],s=scoreState(m.id);let q=null;try{q=generate(m.id,s);q.skill=m.id}catch(_){}const item=(q&&printableQuestion(q))||worksheetFallback(m),key=item?.prompt.toLowerCase();if(item&&!seen.has(key)){seen.add(key);item.title=m.title;items.push(item)}}}finally{sess=originalSess}
 if(items.length<Math.min(10,state.count))throw new Error('Bank soalan bercetak belum cukup untuk pilihan ini.');return{snap,items,title:state.mode==='topic'?(pool[0]?.title||'Latihan Topikal'):state.mode==='grade'?`Latihan Campuran Darjah ${snap.grade}`:'Latihan Disyorkan Cikgu Dimensi'};
}
function numericValue(value){const raw=String(value??'');if(/\d\s*[/:]\s*\d/.test(raw))return null;const match=raw.replace(/,/g,'').match(/-?\d+(?:\.\d+)?/);return match?Number(match[0]):null}
function almost(a,b){return Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<1e-8}
function placeExpanded(n){
 if(!Number.isInteger(n)||n<0||n>999999)return String(n);const values=[],digits=String(n).split(''),length=digits.length;digits.forEach((digit,index)=>{const value=Number(digit)*10**(length-index-1);if(value)values.push(value)});return values.join(' + ')||'0';
}
function additionSteps(numbers,answer){
 if(numbers.every(n=>Number.isInteger(n)&&n>=0&&n<=999999))return `Cerakinkan mengikut nilai tempat: ${numbers.map(n=>`(${placeExpanded(n)})`).join(' + ')} = ${answer}.`;
 return `${numbers.join(' + ')} = ${answer}.`;
}
function subtractionSteps(numbers,answer){
 if(numbers.length===2&&numbers.every(n=>Number.isInteger(n)&&n>=0)){const parts=placeExpanded(numbers[1]).split(' + ');return `Tolak mengikut nilai tempat: ${numbers[0]} - ${parts.join(' - ')} = ${answer}.`}
 return `${numbers.join(' - ')} = ${answer}.`;
}
function balancedChunks(items,maxPerPage){
 const pageCount=Math.max(1,Math.ceil(items.length/maxPerPage)),base=Math.floor(items.length/pageCount),extra=items.length%pageCount,chunks=[];let start=0;for(let pageIndex=0;pageIndex<pageCount;pageIndex++){const size=base+(pageIndex<extra?1:0);chunks.push(items.slice(start,start+size));start+=size}return chunks;
}
function missingNumberSteps(prompt,answer){
 const blank='(?:_{2,}|□|—|\\?)',number='(-?\\d+(?:\\.\\d+)?)';let match;
 if((match=prompt.match(new RegExp(`${blank}\\s*\\+\\s*${number}\\s*=\\s*${number}`))))return `Gunakan operasi songsang: ${match[2]} - ${match[1]} = ${answer}. Semakan: ${answer} + ${match[1]} = ${match[2]}.`;
 if((match=prompt.match(new RegExp(`${number}\\s*\\+\\s*${blank}\\s*=\\s*${number}`))))return `Gunakan operasi songsang: ${match[2]} - ${match[1]} = ${answer}. Semakan: ${match[1]} + ${answer} = ${match[2]}.`;
 if((match=prompt.match(new RegExp(`${blank}\\s*[−-]\\s*${number}\\s*=\\s*${number}`))))return `Cari nombor asal dengan operasi songsang: ${match[2]} + ${match[1]} = ${answer}. Semakan: ${answer} - ${match[1]} = ${match[2]}.`;
 if((match=prompt.match(new RegExp(`${number}\\s*[−-]\\s*${blank}\\s*=\\s*${number}`))))return `Cari nombor yang ditolak: ${match[1]} - ${match[2]} = ${answer}. Semakan: ${match[1]} - ${answer} = ${match[2]}.`;
 if((match=prompt.match(new RegExp(`${blank}\\s*[×x]\\s*${number}\\s*=\\s*${number}`))))return `Gunakan operasi songsang: ${match[2]} ÷ ${match[1]} = ${answer}. Semakan: ${answer} × ${match[1]} = ${match[2]}.`;
 if((match=prompt.match(new RegExp(`${number}\\s*[×x]\\s*${blank}\\s*=\\s*${number}`))))return `Gunakan operasi songsang: ${match[2]} ÷ ${match[1]} = ${answer}. Semakan: ${match[1]} × ${answer} = ${match[2]}.`;
 if((match=prompt.match(new RegExp(`${blank}\\s*÷\\s*${number}\\s*=\\s*${number}`))))return `Cari nombor asal: ${match[2]} × ${match[1]} = ${answer}. Semakan: ${answer} ÷ ${match[1]} = ${match[2]}.`;
 if((match=prompt.match(new RegExp(`${number}\\s*÷\\s*${blank}\\s*=\\s*${number}`))))return `Cari pembahagi: ${match[1]} ÷ ${match[2]} = ${answer}. Semakan: ${match[1]} ÷ ${answer} = ${match[2]}.`;
 return null;
}
function estimationSteps(prompt,answer,numbers){
 const pair=prompt.match(/(-?\d+(?:\.\d+)?)\s*([+−\-×x÷])\s*(-?\d+(?:\.\d+)?)/);if(!pair)return null;
 const a=Number(pair[1]),op=pair[2].toLowerCase().replace('x','×').replace('-','−'),b=Number(pair[3]);
 if(op==='÷'){const q=numericValue(answer);return Number.isFinite(q)?`Semak dengan operasi songsang: ${q} × ${b} = ${a}. Jadi ${answer} ialah jawapan yang munasabah.`:`Gunakan darab untuk menyemak bahagi: pembahagi × hasil bahagi mestilah hampir dengan ${a}. Jawapan yang munasabah ialah ${answer}.`}
 const unit=n=>Math.abs(n)>=1000?100:Math.abs(n)>=10?10:1,round=n=>Math.round(n/unit(n))*unit(n),ra=round(a),rb=op==='×'&&Math.abs(b)<10?b:round(b);
 const estimate=op==='+'?ra+rb:op==='−'?ra-rb:ra*rb;
 return `Anggarkan nombor: ${a} ≈ ${ra}${rb!==b?`, ${b} ≈ ${rb}`:''}. Maka ${ra} ${op} ${rb} ≈ ${estimate}; ${answer} paling hampir dan munasabah.`;
}
function geometrySteps(prompt,answer,numbers){
 if(/perimeter/i.test(prompt)&&numbers.length>=2){const [l,w]=numbers,sum=l+w;return `Perimeter = 2 × (panjang + lebar) = 2 × (${l} + ${w}) = 2 × ${sum} = ${answer}.`}
 if(/isi padu/i.test(prompt)&&numbers.length>=3){const [l,w,h]=numbers;return `Isi padu = panjang × lebar × tinggi = ${l} × ${w} × ${h} = ${answer}.`}
 if(/\bluas(?:nya)?\b/i.test(prompt)&&numbers.length>=2){const [l,w]=numbers;return `Luas = panjang × lebar = ${l} × ${w} = ${answer}.`}
 return null;
}
function percentageSteps(prompt,answer,numbers){
 let match=prompt.match(/(\d+(?:\.\d+)?)%\s+daripada\s+(\d+(?:\.\d+)?)/i);if(match)return `${match[1]}% daripada ${match[2]} = ${match[1]} ÷ 100 × ${match[2]} = ${answer}.`;
 match=prompt.match(/(\d+(?:\.\d+)?)%\s+daripada\s+_{2,}\s+(?:ialah|=)\s+(\d+(?:\.\d+)?)/i);if(match)return `Cari nilai penuh: ${match[2]} ÷ ${match[1]} × 100 = ${answer}. Semakan: ${match[1]}% daripada ${answer} = ${match[2]}.`;
 match=prompt.match(/(\d+)\s*\/\s*(\d+)\s+bersamaan/i);if(match&&/%/.test(String(answer)))return `Tukar pecahan kepada peratus: ${match[1]} ÷ ${match[2]} × 100% = ${answer}.`;
 if(/peratus/i.test(prompt)&&numbers.length>=2&&Number.isFinite(numericValue(answer)))return `Gunakan peratus sebagai pecahan daripada 100 dan gantikan nombor dalam soalan. Hasil pengiraan ialah ${answer}.`;
 return null;
}
function fractionSteps(prompt,answer){
 let match=prompt.match(/(\d+)\s*\/\s*(\d+)\s*=\s*(?:_{2,}|□)\s*\/\s*(\d+)/);if(match){const factor=Number(match[3])/Number(match[2]),num=Number(match[1])*factor;return `Penyebut ${match[2]} didarab ${factor} untuk menjadi ${match[3]}. Darab pengangka dengan nombor yang sama: ${match[1]} × ${factor} = ${num}. Jadi jawapannya ${answer}.`}
 match=prompt.match(/pecahan setara[^\d]*(\d+)\s*\/\s*(\d+)/i);const ans=String(answer).match(/(\d+)\s*\/\s*(\d+)/);if(match&&ans){const factor=Number(ans[2])/Number(match[2]);return `Darab pengangka dan penyebut dengan nombor yang sama: (${match[1]} × ${factor}) / (${match[2]} × ${factor}) = ${answer}.`}
 match=prompt.match(/(\d+)\s+(\d+)\s*\/\s*(\d+)/);if(match&&/^\s*\d+\s*\/\s*\d+\s*$/.test(String(answer)))return `Tukar nombor bercampur: (${match[1]} × ${match[3]}) + ${match[2]} = ${Number(match[1])*Number(match[3])+Number(match[2])}. Kekalkan penyebut ${match[3]}: ${answer}.`;
 return null;
}
function measurementSteps(prompt,answer){
 let m=prompt.match(/(\d+)\s*m\s+(\d+)\s*cm[^.?!]*(?:tambah|ditambah)\s*(\d+)\s*cm/i);if(m)return `Tukar meter kepada sentimeter dahulu: ${m[1]} × 100 + ${m[2]} = ${Number(m[1])*100+Number(m[2])} cm. Kemudian tambah ${m[3]} cm: ${Number(m[1])*100+Number(m[2])} + ${m[3]} = ${answer}.`;
 m=prompt.match(/(\d+)\s*(m|km|kg|L)\s+(\d+)\s*(cm|m|g|mL)[^?]*(?:berapa|=)/i);if(m){const factor=/^(m:cm|km:m|kg:g|L:mL)$/.test(`${m[2]}:${m[4]}`)?1000:100;if(m[2]==='m'&&m[4]==='cm')return `${m[1]} m = ${m[1]} × 100 = ${Number(m[1])*100} cm. Tambah ${m[3]} cm: ${Number(m[1])*100} + ${m[3]} = ${answer}.`;return `${m[1]} ${m[2]} = ${m[1]} × ${factor} = ${Number(m[1])*factor} ${m[4]}. Tambah ${m[3]} ${m[4]}: ${Number(m[1])*factor} + ${m[3]} = ${answer}.`}
 m=prompt.match(/(\d+)\s*(km|kg|L)\s+(?:_{2,}|□)\s*(m|g|mL)\s*=\s*(\d+)/i);if(m){const base=Number(m[1])*1000;return `${m[1]} ${m[2]} = ${m[1]} × 1000 = ${base} ${m[3]}. Baki: ${m[4]} - ${base} = ${answer}.`}
 return null;
}
function solutionFor(item){
 const prompt=item.prompt,answer=item.answer,answerNumber=numericValue(answer),numbers=(prompt.match(/-?\d+(?:\.\d+)?/g)||[]).map(Number),direct=prompt.match(/(-?\d+(?:\.\d+)?(?:\s*[+−\-×÷]\s*-?\d+(?:\.\d+)?)+)\s*=\s*\?/);
 const missing=missingNumberSteps(prompt,answer);if(missing)return missing;
 const geometry=geometrySteps(prompt,answer,numbers);if(geometry)return geometry;
 const percentage=percentageSteps(prompt,answer,numbers);if(percentage)return percentage;
 const fraction=fractionSteps(prompt,answer);if(fraction)return fraction;
 const measurement=measurementSteps(prompt,answer);if(measurement)return measurement;
 if(/nilai digit/i.test(prompt)&&numbers.length>=2){const digit=Number((prompt.match(/nilai digit\s+(\d+)/i)||[])[1]);if(Number.isFinite(digit)&&digit!==0&&Number.isFinite(answerNumber)){const place=Math.round(answerNumber/digit);return `${digit} berada pada nilai tempat ${place===1000?'ribu':place===100?'ratus':place===10?'puluh':'sa'}: ${digit} × ${place} = ${answer}.`}}
 if(/dibundarkan kepada\s+\d+/i.test(prompt)&&/manakah/i.test(prompt)){const target=Number((prompt.match(/dibundarkan kepada\s+(\d+)/i)||[])[1]),unit=/ribu/i.test(prompt)?1000:/ratus/i.test(prompt)?100:/puluh/i.test(prompt)?10:1,low=target-unit/2,high=target+unit/2-1,digit=Math.floor(Number(answer)/(unit/10))%10;return `Julat yang dibundarkan kepada ${target} ialah ${low} hingga ${high}. ${answer} berada dalam julat itu (digit penentu ${digit}), jadi jawapannya betul.`}
 if(/bundarkan/i.test(prompt)&&numbers.length){const n=numbers[0],unit=/ribu/i.test(prompt)?1000:/ratus/i.test(prompt)?100:/puluh/i.test(prompt)?10:1,digit=Math.floor(n/(unit/10))%10;return `Lihat digit penentu ${digit}. Oleh sebab ${digit}${digit>=5?' ≥ 5, naikkan digit di sebelah kiri':' < 5, kekalkan digit di sebelah kiri'}: ${n} ≈ ${answer}.`}
 if(/tanpa mengira semula|anggaran|munasabah/i.test(prompt)&&Number.isFinite(answerNumber)&&numbers.length>=2){const estimate=estimationSteps(prompt,answer,numbers);if(estimate)return estimate}
 if(/pukul\s+\d{1,2}:00/i.test(prompt)&&/\d+\s*jam/i.test(prompt)){const start=Number((prompt.match(/pukul\s+(\d{1,2}):00/i)||[])[1]),duration=Number((prompt.match(/(\d+)\s*jam/i)||[])[1]);if(Number.isFinite(start)&&Number.isFinite(duration))return `Gerakkan masa ${duration} jam ke hadapan: ${start}:00 + ${duration} jam = ${answer}.`}
 if(Number.isFinite(answerNumber)&&numbers.length>=2){
  const sum=numbers.reduce((a,b)=>a+b,0),subtract=numbers.slice(1).reduce((a,b)=>a-b,numbers[0]),product=numbers.reduce((a,b)=>a*b,1),divide=numbers.length===2?numbers[0]/numbers[1]:NaN;
  if(almost(subtract,answerNumber))return subtractionSteps(numbers,answer);
  if(almost(sum,answerNumber))return additionSteps(numbers,answer);
  if(almost(divide,answerNumber))return `Bahagi sama rata: ${numbers[0]} ÷ ${numbers[1]} = ${answer}.`;
  if(almost(product,answerNumber)){const repeat=numbers.length===2&&numbers[0]<=6?Array(numbers[0]).fill(numbers[1]).join(' + '):null;return repeat?`Darab ialah tambah berulang: ${repeat} = ${answer}.`:`Darabkan setiap faktor: ${numbers.join(' × ')} = ${answer}.`}
 }
 if(/membentuk nombor/i.test(prompt))return `Gabungkan nilai yang diberi mengikut nilai tempat. Nombor yang terbentuk ialah ${answer}.`;
 if(/\bbentuk\b|sisi|bucu|permukaan|puncak/i.test(prompt)){const shape=String(answer).toLowerCase(),reason=shape.includes('silinder')?'dua permukaan rata berbentuk bulatan dan satu permukaan melengkung':shape.includes('kon')?'satu tapak bulat, satu permukaan melengkung dan satu puncak':shape.includes('piramid')?'satu tapak serta permukaan sisi yang bertemu pada satu puncak':shape.includes('kubus')?'enam permukaan rata berbentuk segi empat sama':shape.includes('kuboid')?'enam permukaan rata berbentuk segi empat tepat':shape.includes('sfera')?'satu permukaan melengkung tanpa bucu':null;return reason?`Kenal pasti cirinya: ${reason}. Oleh itu, bentuk itu ialah ${answer}.`:`${item.hint} Ciri tersebut sepadan dengan ${answer}.`}
 if(direct){const expression=direct[1].replace(/\s+/g,' '),ops=expression.match(/[+−\-×÷]/g)||[],values=(expression.match(/-?\d+(?:\.\d+)?/g)||[]).map(Number);if(ops.every(op=>op==='+'))return additionSteps(values,answer);if(ops.every(op=>op==='−'||op==='-'))return subtractionSteps(values,answer);return `${expression} = ${answer}.`}
 if(/susun|urutan/i.test(prompt))return `Bandingkan nilai tempat terbesar dahulu. Susunan yang betul ialah ${answer}.`;
 return `${item.hint} Hasil akhirnya ialah ${answer}.`;
}
async function worksheet(includeAnswers){
 if(!gate()||state.busy)return;state.busy=true;status('Cikgu Dimensi sedang menyusun worksheet...');
 try{
  const pack=makeQuestions(),pages=[],studentChunks=balancedChunks(pack.items,5);let studentStart=0;for(const subset of studentChunks){const p=await page(pack.title,`${pack.snap.name} | Darjah ${pack.snap.grade} | ${pack.items.length} soalan`),ctx=p.ctx;let y=270;if(studentStart===0){ctx.fillStyle='#526173';ctx.font='20px Arial';ctx.fillText('Nama: ______________________________',78,y);ctx.fillText(`Tarikh: ${dateLabel()}`,720,y);y+=62}for(let i=0;i<subset.length;i++){const item=subset[i],number=studentStart+i+1;roundRect(ctx,78,y,1084,190,18,'#ffffff','#ddd8cc');ctx.fillStyle='#0e2b4a';ctx.font='900 22px Arial';ctx.fillText(`${number}.`,102,y+37);ctx.fillStyle='#17263a';ctx.font='23px Arial';const bottom=drawWrapped(ctx,item.prompt,147,y+37,970,30,3);if(item.choices?.length){ctx.font='18px Arial';item.choices.forEach((choice,index)=>{const col=index%2,row=Math.floor(index/2),x=147+col*470,cy=Math.max(y+98,bottom+12)+row*39;roundRect(ctx,x,cy,440,31,9,'#f4f6f8','#c9cfd4');ctx.fillStyle='#26364a';ctx.fillText('○  '+choice.value,x+12,cy+22)})}else{ctx.strokeStyle='#bfc5c9';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(147,Math.max(y+112,bottom+20));ctx.lineTo(1090,Math.max(y+112,bottom+20));ctx.stroke();ctx.fillStyle='#8993a0';ctx.font='16px Arial';ctx.fillText('Jawapan / ruang kerja',147,Math.max(y+140,bottom+48))}y+=225}footer(ctx,pages.length+1,'Pahlawan Angka | Worksheet murid');pages.push(p.canvas);studentStart+=subset.length}
  if(includeAnswers){const answerChunks=balancedChunks(pack.items,7);let answerStart=0;for(const subset of answerChunks){const p=await page('Skema dan Cara Menjawab',`${pack.title} | Untuk ibu bapa / penjaga`),ctx=p.ctx;let y=272;for(let i=0;i<subset.length;i++){const item=subset[i],number=answerStart+i+1;roundRect(ctx,78,y,1084,178,16,i%2?'#f4f1e9':'#ffffff','#ddd8cc');ctx.fillStyle='#0e2b4a';ctx.font='900 18px Arial';drawWrapped(ctx,`${number}. ${item.prompt}`,102,y+27,1010,22,3);ctx.fillStyle='#9a6b17';ctx.font='900 14px Arial';ctx.fillText('CARA',102,y+102);ctx.fillStyle='#536174';ctx.font='16px Arial';drawWrapped(ctx,solutionFor(item),164,y+102,680,20,3);roundRect(ctx,862,y+121,274,42,12,'#102b4a','#d4aa35');ctx.fillStyle='#f5cf52';ctx.font='900 17px Arial';ctx.textAlign='center';ctx.fillText(`Jawapan: ${item.answer}`,999,y+148);ctx.textAlign='left';y+=190}footer(ctx,pages.length+1,'Pahlawan Angka | Skema penjaga');pages.push(p.canvas);answerStart+=subset.length}}
  download(pdfFromCanvases(pages),`worksheet-${slug(pack.title)}-${slug(pack.snap.name)}${includeAnswers?'-dengan-skema':''}.pdf`);status(`${pack.items.length} soalan berjaya disediakan.`);
 }catch(error){console.error(error);status(error.message||'Worksheet belum dapat dijana. Cuba pilihan lain.',true)}finally{state.busy=false}
}

const originalRender=window.renderParent;if(typeof originalRender==='function')window.renderParent=function(){const result=originalRender.apply(this,arguments);mount();return result};
window.PAParentTools={mount,mode,count,topic,exportReport,shareCard,worksheet};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,0),{once:true});else setTimeout(mount,0);
})();
