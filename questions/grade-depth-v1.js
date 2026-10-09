// On-grade depth additions. Runs after the curriculum/integrity banks.
(function(){
'use strict';
const banks=window.PAQuestionBanks;
if(!banks)return;
const history=id=>(typeof sess!=='undefined'?sess.questionHistory||[]:[]).filter(x=>x.skillId===id);
function mode(id,modes){const h=history(id).slice(-12),last=h.at(-1)?.archetypeId;return [...modes].sort((a,b)=>(last==='progress_'+a)-(last==='progress_'+b)||h.filter(x=>x.archetypeId==='progress_'+a).length-h.filter(x=>x.archetypeId==='progress_'+b).length||Math.random()-.5)[0]}
function mark(q,id,m,demand,rep='story'){Object.assign(q,{familyKey:id,archetypeId:'progress_'+m,competencyId:m,demand,representation:rep,contextId:'on-grade:'+m,difficultyBand:demand==='reasoning'?4:demand==='application'?3:1,depthVersion:'1'});return q}
function question(id,m,p,a,w,h,d='reasoning',rep='story'){return mark(Q(p,a,w.map(x=>N(x,'reasoning')),h,`Tahun ${id[1]} · Cabaran Kefahaman`,true,true),id,m,d,rep)}
const recovery=()=>typeof sess!=='undefined'&&['recover','teach'].includes(sess.mode);
const wrong=n=>[n+1,Math.max(0,n-1),n+10];
function line(a,b){
 let ticks='';for(let i=0;i<=10;i++){const x=22+i*27.6;ticks+=`<line x1="${x}" y1="28" x2="${x}" y2="42" stroke="#405072" stroke-width="2"/>`}
 const point=(n,label,color)=>`<circle cx="${22+n*27.6}" cy="34" r="6" fill="${color}"/><text x="${22+n*27.6}" y="16" text-anchor="middle" fill="${color}" font-size="12">${label}</text>`;
 return `<svg viewBox="0 0 320 74" style="display:block;max-width:330px;width:100%;margin:auto" role="img" aria-label="Garis nombor dibahagi kepada sepuluh bahagian sama besar"><line x1="22" y1="34" x2="298" y2="34" stroke="#405072" stroke-width="3"/>${ticks}${point(a,'A','#b34f18')}${point(b,'B','#405072')}<text x="22" y="59" text-anchor="middle">0</text><text x="298" y="59" text-anchor="middle">1</text></svg>`;
}
function decimalD2(id,s){
 const high=!recovery()&&Number(s?.confidence)>=45&&Number(s?.evidence)>=3&&Number(s?.mastery)>=50&&history(id).length%5!==4;
 const m=mode(id,high?['decimal_marks','decimal_fraction','decimal_claim','decimal_order','decimal_context']:['decimal_read','decimal_fraction','decimal_compare']);
 const n=R(1,9),v=(n/10).toFixed(1);let b=R(1,9);while(b===n)b=R(1,9);
 if(m==='decimal_read')return question(id,m,numberLineSvg(0,1,.1,n/10,{hidePointValue:true,endpointLabelsOnly:true})+'Apakah nilai perpuluhan pada titik merah?',v,[(Math.max(0,n-1)/10).toFixed(1),(n+1)/10,n+'.0'],'Kira bahagian sama besar dari 0. Setiap bahagian bernilai 0.1.','concept','visual');
 if(m==='decimal_fraction')return question(id,m,`${decimalTenthsVisual(n)}Pilih pasangan pecahan dan perpuluhan yang sepadan dengan bahagian berlorek.`,`${n}/10 = ${v}`,[`${n}/10 = ${(b/10).toFixed(1)}`,`${10-n}/10 = ${v}`,`${n}/10 = ${n}.0`],'Bahagian berlorek ialah persepuluh. Padankan pecahan dan perpuluhan.','application','visual');
 if(m==='decimal_marks')return question(id,m,line(n,b)+'Titik manakah menunjukkan nilai yang lebih besar?',n>b?'A':'B',[n>b?'B':'A','Sama nilai','Tidak dapat ditentukan'],'Nilai bertambah apabila bergerak ke kanan.','application','visual');
 if(m==='decimal_claim'){const claim=Math.random()<.5?n:b,ok=claim===n;return question(id,m,numberLineSvg(0,1,.1,n/10,{hidePointValue:true,endpointLabelsOnly:true})+`Hakim kata titik merah bernilai ${(claim/10).toFixed(1)}. Pilih penilaian yang betul.`,ok?`Betul, nilainya ${v}`:`Salah, nilainya ${v}`,[ok?`Salah, nilainya ${(b/10).toFixed(1)}`:`Betul, nilainya ${(b/10).toFixed(1)}`,`Betul, nilainya ${n}.0`,'Tidak dapat ditentukan'],'Semak bilangan bahagian dari 0 sebelum menilai jawapan Hakim.','reasoning','visual')}
 if(m==='decimal_order'){const values=[n,b];let c=R(1,9);while(values.includes(c))c=R(1,9);values.push(c);const asc=Math.random()<.5,sorted=[...values].sort((x,y)=>asc?x-y:y-x),fmt=xs=>xs.map(x=>(x/10).toFixed(1)).join(', ');return question(id,m,`Susun ${fmt(values)} secara ${asc?'menaik':'menurun'}.`,fmt(sorted),[fmt([...sorted].reverse()),fmt([sorted[1],sorted[0],sorted[2]]),fmt([sorted[0],sorted[2],sorted[1]])],'Banding digit persepuluh.','application','symbolic')}
 if(m==='decimal_context')return question(id,m,`Aina mewarnakan ${n}/10 daripada satu kad. Hakim mewarnakan ${(b/10).toFixed(1)} daripada kad lain yang sama saiz. Siapa mewarnakan bahagian lebih besar?`,n>b?'Aina':'Hakim',[n>b?'Hakim':'Aina','Sama besar','Tidak dapat ditentukan'],'Tukar pecahan persepuluh kepada perpuluhan, kemudian banding.');
 return question(id,m,`${v} ___ ${(b/10).toFixed(1)}`,n>b?'>':'<',[n>b?'<':'>','=','Tidak dapat ditentukan'],'Banding digit persepuluh.','concept','symbolic');
}
function d2(id,s){
 if(id==='D2.3.2')return decimalD2(id,s);
 // Foundation questions remain in the original banks for pupils still learning.
 if(recovery()||Number(s?.confidence)<45||Number(s?.evidence)<3||Number(s?.mastery)<50||history(id).length%5===4)return null;
 if(/^D2\.2\.[1-4]$/.test(id)){
  const m=mode(id,['operation_missing','operation_story','operation_check']),op=id.slice(-1),a=R(120,500),b=R(20,200),g=R(2,9),each=R(2,9);
  const x=op==='1'?a:op==='2'?a+b:op==='3'?g:g*each,y=op==='1'||op==='2'?b:op==='3'?each:g,ans=op==='1'?x+y:op==='2'?x-y:op==='3'?x*y:each,sym=({'1':'+','2':'−','3':'×','4':'÷'})[op];
  if(m==='operation_missing')return question(id,m,`${x} ${sym} ___ = ${ans}<br>Apakah nombor yang hilang?`,y,[ans,x,y+1],'Gunakan hubungan operasi songsang.','reasoning','symbolic');
  if(m==='operation_check'){const error=ans+pick([1,10]);return question(id,m,`Hakim menulis ${x} ${sym} ${y} = ${error}. Apakah jawapan yang betul?`,ans,[error,...wrong(ans).filter(z=>z!==error).slice(0,2)],'Kira semula dan semak dengan operasi songsang.','reasoning','symbolic')}
  const p=op==='1'?`Kantin menjual ${x} karipap pada waktu pagi dan ${y} lagi waktu petang. Berapa semuanya?`:op==='2'?`Ada ${x} rambutan. ${y} diberikan kepada jiran. Berapa yang tinggal?`:op==='3'?`Ada ${x} dulang kuih. Setiap dulang ada ${y} biji. Berapa biji semuanya?`:`${x} biji kuih dibahagi sama rata kepada ${y} keluarga. Berapa biji setiap keluarga dapat?`;
  return question(id,m,p,ans,wrong(ans),'Pilih operasi mengikut situasi, kemudian kira.','application');
 }
 if(/^D2\.4\.[2-7]$/.test(id)){
  const m=mode(id,['money_inverse','money_situation','money_check']),kind=id.slice(-1),a=R(15,50),b=R(2,10),k=pick([2,3,4,5]),unit=R(2,10),total=unit*k;
  const x=kind==='2'?a:kind==='3'?a+b:kind==='4'?unit:kind==='5'?total:a;
  const y=kind==='2'||kind==='3'?b:kind==='4'||kind==='5'?k:b;
  const ans=kind==='2'?x+y:kind==='3'?x-y:kind==='4'?total:kind==='5'?unit:a-b;
  const rm=v=>'RM'+v;
  if(kind==='6'||kind==='7'){
   const save=kind==='6';
   if(m==='money_inverse')return question(id,m,save?`Selepas menambah RM${b} ke dalam tabung, simpanan Aina menjadi RM${a+b}. Berapa simpanan asal?`:`Selepas membayar RM${b}, baki wang Aina ialah RM${a}. Berapa wangnya sebelum membeli?`,rm(save?a:a+b),wrong(save?a:a+b).map(rm),'Gunakan operasi songsang.');
   if(m==='money_check')return question(id,m,`Aina ada RM${a}. Dia mahu membeli buku RM${a+b}. Berapakah wang tambahan yang diperlukan?`,rm(b),[rm(a),rm(a+b),rm(b+1)],'Banding harga dengan wang yang ada.');
   return question(id,m,save?`Aina mempunyai RM${a} dalam tabung. Dia menggunakan RM${b} untuk membeli alat tulis. Berapa simpanan yang tinggal?`:`Aina membayar RM${a} untuk barang berharga RM${b}. Berapa baki yang diterima?`,rm(a-b),wrong(a-b).map(rm),'Tolak jumlah yang digunakan.','application');
  }
  const sym=({'2':'+','3':'−','4':'×','5':'÷'})[kind];
  if(m==='money_inverse'){
   const missing=kind==='4'?unit:kind==='5'?total:b;
   const prompt=kind==='4'?`Harga ${k} buku yang sama ialah RM${total}. Berapakah harga sebuah buku?`:kind==='5'?`Sejumlah wang dibahagi sama rata kepada ${k} murid. Setiap murid mendapat RM${unit}. Berapakah jumlah wang asal?`:`${rm(x)} ${sym} ___ = ${rm(ans)}<br>Apakah nilai wang yang hilang?`;
   return question(id,m,prompt,rm(missing),wrong(missing).map(rm),'Gunakan operasi songsang.');
  }
  if(m==='money_check')return question(id,m,`Hakim mengira ${rm(x)} ${sym} ${kind==='4'||kind==='5'?y:rm(y)} = ${rm(ans+1)}. Apakah jawapan yang betul?`,rm(ans),wrong(ans).map(rm),'Kira semula dan semak nilai wang.');
  const prompt=kind==='2'?`Aina menyimpan RM${x} dan menerima RM${y} lagi. Berapa jumlah wangnya?`:kind==='3'?`Aina ada RM${x}. Dia membeli buku RM${y}. Berapa wang yang tinggal?`:kind==='4'?`Sebuah buku berharga RM${x}. Berapakah harga ${y} buku yang sama?`:`RM${x} dibahagi sama rata kepada ${y} murid. Berapa setiap murid dapat?`;
  return question(id,m,prompt,rm(ans),wrong(ans).map(rm),'Pilih operasi mengikut situasi.','application');
 }
 if(id==='D2.5.3'){
  const m=mode(id,['time_duration','time_start','time_end']),start=R(8,14)*60+pick([0,15,30]),duration=pick([15,30,45,60,90]),end=start+duration,fmt=x=>formatClockTime(x,'12','bm');
  if(m==='time_duration')return question(id,m,`Aktiviti bermula ${fmt(start)} dan tamat ${fmt(end)} pada hari yang sama. Berapa minit tempohnya?`,duration,wrong(duration),'Cari beza antara waktu tamat dan waktu mula.','application');
  if(m==='time_start')return question(id,m,`Aktiviti berlangsung ${duration} minit dan tamat ${fmt(end)}. Bilakah aktiviti bermula?`,fmt(start),[fmt(start+15),fmt(start-15),fmt(end)],'Bergerak ke belakang daripada waktu tamat.');
  return question(id,m,`Aktiviti bermula ${fmt(start)} dan berlangsung ${duration} minit. Bilakah tamat?`,fmt(end),[fmt(end+15),fmt(end-15),fmt(start)],'Gerakkan waktu ke hadapan.','application');
 }
 if(id==='D2.6.4'){
  const m=mode(id,['measure_total','measure_difference','measure_inverse']),unit=pick(['cm','g','mL']),a=R(100,500),b=R(20,200);
  if(m==='measure_inverse')return question(id,m,`Jumlah dua kuantiti ialah ${a+b} ${unit}. Satu kuantiti ialah ${a} ${unit}. Berapa kuantiti yang satu lagi dalam ${unit}?`,b,wrong(b),'Tolak kuantiti yang diketahui daripada jumlah.');
  const ans=m==='measure_total'?a+b:Math.abs(a-b);
  return question(id,m,`Dua kuantiti ialah ${a} ${unit} dan ${b} ${unit}. Berapakah ${m==='measure_total'?'jumlah':'beza'} dalam ${unit}?`,ans,wrong(ans),m==='measure_total'?'Tambah kedua-dua kuantiti.':'Tolak kuantiti kecil daripada yang besar.','application');
 }
 if(id==='D2.5.1'){
  const m=mode(id,['clock_compare','clock_words']),h=R(1,11),minute=pick([5,10,15,20,25,30,35,40,45,50,55]);
  if(m==='clock_words')return question(id,m,`${clockSvg(h,minute)}Jarum panjang menunjukkan ${minute} minit. Waktu manakah sepadan dengan jam ini?`,`${h}:${String(minute).padStart(2,'0')}`,[`${h+1}:${String(minute).padStart(2,'0')}`,`${h}:${String(60-minute).padStart(2,'0')}`,`${h}:00`],'Semak kedudukan kedua-dua jarum.','application','visual');
  return question(id,m,`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div>Jam A${clockSvg(h,minute)}</div><div>Jam B${clockSvg(h,minute-5)}</div></div>Kedua-duanya waktu pagi pada hari yang sama. Jam manakah menunjukkan waktu lebih lewat?`,'A',['B','Sama waktu','Tidak dapat ditentukan'],'Banding jam dahulu, kemudian minit.','application','visual');
 }
 if(id==='D2.5.2'){
  const m=mode(id,['time_inverse','time_claim']),unit=pick([['jam','minit',60],['hari','jam',24],['minggu','hari',7]]),n=R(1,4),total=n*unit[2];
  if(m==='time_inverse')return question(id,m,`${total} ${unit[1]} bersamaan berapa ${unit[0]}?`,n,wrong(n),`Bahagi dengan ${unit[2]}.`,'application','symbolic');
  return question(id,m,`Aina kata ${n} ${unit[0]} bersamaan ${total+unit[2]} ${unit[1]}. Apakah nilai yang betul dalam ${unit[1]}?`,total,wrong(total),`1 ${unit[0]} = ${unit[2]} ${unit[1]}.`);
 }
 if(id==='D2.8.1'||id==='D2.8.2'){
  const m=mode(id,['data_compare','data_difference','data_total']),vals=[R(2,8),R(9,14),R(15,20)],labels=['Karipap','Pau','Kuih lapis'],vis=id==='D2.8.1'?tallyTable(labels,vals):barChart(labels,vals),i=R(0,2),j=(i+1)%3;
  if(m==='data_compare')return question(id,m,vis+`Berdasarkan data, makanan manakah lebih banyak: ${labels[i]} atau ${labels[j]}?`,vals[i]>vals[j]?labels[i]:labels[j],[vals[i]>vals[j]?labels[j]:labels[i],'Sama banyak','Tidak dapat ditentukan'],'Baca kedua-dua nilai sebelum membanding.','application','visual');
  const ans=m==='data_difference'?Math.abs(vals[i]-vals[j]):vals[i]+vals[j];return question(id,m,vis+`Berapakah ${m==='data_difference'?'beza bilangan':'jumlah'} ${labels[i]} dan ${labels[j]}?`,ans,wrong(ans),m==='data_difference'?'Tolak nilai kecil daripada nilai besar.':'Tambah dua nilai yang diminta.','application','visual');
 }
 return null;
}
function d3(id,s){
 if(recovery()||Number(s?.confidence)<45||Number(s?.evidence)<3||Number(s?.mastery)<50||history(id).length%5===4)return null;
 if(id==='D3.FRAC'){
  const m=mode(id,['fraction_story','fraction_missing','fraction_check']),d=pick([4,5,6,8,10]),a=R(1,d-2),b=R(1,d-a-1),fmt=n=>`${n}/${d}`;
  if(m==='fraction_story')return question(id,m,`Aina makan ${fmt(a)} daripada sebiji kek. Hakim makan ${fmt(b)} daripada kek yang sama. Berapakah jumlah bahagian yang dimakan?`,fmt(a+b),[fmt(a),fmt(Math.max(0,a-b)),`${a+b}/${2*d}`],'Penyebut sama: tambah pengangka sahaja.','application');
  if(m==='fraction_missing')return question(id,m,`${fmt(a)} + ___ = ${fmt(a+b)}`,fmt(b),[fmt(a+b),fmt(a),fmt(b+1)],'Cari beza antara jumlah dengan bahagian diketahui.','reasoning','symbolic');
  return question(id,m,`Hakim kata ${fmt(a)} + ${fmt(b)} = ${a+b}/${2*d}. Pilih jawapan yang betul.`,fmt(a+b),[`${a+b}/${2*d}`,fmt(a),fmt(b)],'Bahagian masih sama saiz; penyebut tidak ditambah.','reasoning');
 }
 if(id==='D3.DEC'){
  const m=mode(id,['decimal_story','decimal_missing','decimal_check']),a=R(10,70),b=R(1,98-a),fmt=x=>(x/100).toFixed(2);
  if(m==='decimal_story')return question(id,m,`Aina menggunakan ${fmt(a)} m reben dan Hakim menggunakan ${fmt(b)} m. Berapa meter reben digunakan semuanya?`,fmt(a+b),[fmt(a),fmt(Math.abs(a-b)),fmt(a+b+1)],'Selarikan titik perpuluhan dan tambah.','application');
  if(m==='decimal_missing')return question(id,m,`${fmt(a)} + ___ = ${fmt(a+b)}`,fmt(b),[fmt(a+b),fmt(a),fmt(b+1)],'Tolak nilai diketahui daripada jumlah.','reasoning','symbolic');
  return question(id,m,`Hakim mendapat ${fmt(a+b+1)} bagi ${fmt(a)} + ${fmt(b)}. Apakah jawapan yang betul?`,fmt(a+b),[fmt(a+b+1),fmt(a),fmt(Math.abs(a-b))],'Semak tempat persepuluh dan perseratus.','reasoning');
 }
 if(id==='D3.MEASURE'){
  const m=mode(id,['measure_story','measure_missing']),unit=pick(['cm','g','mL']),a=R(100,500),b=R(20,200),ans=m==='measure_story'?a+b:b;
  return question(id,m,m==='measure_story'?`Dua kuantiti ialah ${a} ${unit} dan ${b} ${unit}. Berapakah jumlahnya dalam ${unit}?`:`Jumlah dua kuantiti ialah ${a+b} ${unit}. Satu daripadanya ${a} ${unit}. Berapakah kuantiti yang satu lagi dalam ${unit}?`,ans,wrong(ans),'Unit sama: gunakan tambah atau operasi songsang.',m==='measure_story'?'application':'reasoning');
 }
 return null;
}
for(const key of ['d2t1','d2t2','d2t3','d2t4','d2t5','d2t6','d2t7','d2t8','d3']){const original=banks[key];banks[key]=function(id,s,shift){return (id.startsWith('D2.')?d2(id,s):d3(id,s))||original?.(id,s,shift)||null}}
})();
