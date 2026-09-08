// Year 1 Curriculum Bank v2 — Unit 2: Operasi Asas
(function(){
'use strict';
const RT=window.PAY1V2Runtime;if(!RT)return;
const {GEN,Nq,q,mark,chooseMode,bandModes,stage,rand,choose,wrongNums,name,food,fruit}=RT;

GEN['2.1.1']=function(id,s){
 const mode=chooseMode(id,'2.1.1',bandModes(s,['word_meaning'],['word_meaning','operation_from_word'],['operation_from_word','reason_word']));
 if(mode==='word_meaning'){
  const add=Math.random()<.5,word=add?choose(['lagi','semuanya','jumlah']):choose(['tinggal','baki','beza']);
  return mark(q(`Perkataan <b>“${word}”</b> biasanya membantu kita fikir operasi apa?`,add?'tambah':'tolak',[Nq(add?'tolak':'tambah','operation_language'),Nq('darab','operation_language'),Nq('bahagi','operation_language')],'Fikir perubahan dalam cerita.','Tahun 1 · Bahasa Operasi'),id,'2.1.1',mode,'verbal','concept',s,['operation_language']);
 }
 if(mode==='operation_from_word'){
  const prompt=choose([
   ['Makcik kantin menambah 3 karipap lagi.','tambah'],
   ['Ada 9 rambutan, 2 dimakan. Berapa tinggal?','tolak'],
   ['Dua kumpulan digabungkan.','tambah'],
   ['Cari beza bilangan dua bakul.','tolak']
  ]),ans=prompt[1];
  return mark(q(prompt[0]+' Operasi yang sesuai?',ans,[Nq(ans==='tambah'?'tolak':'tambah','operation_language'),Nq('darab','operation_language'),Nq('bahagi','operation_language')],'Kenal perkataan dan perubahan dalam situasi.','Tahun 1 · Kenal Operasi'),id,'2.1.1',mode,'story','application',s,['operation_language']);
 }
 return mark(q(`${name()} kata perkataan <b>“tinggal”</b> sentiasa bermaksud tambah. Penilaian?`,'salah',[Nq('betul','operation_language'),Nq('kadang-kadang darab','operation_language'),Nq('tidak pasti','operation_language')],'Dalam cerita asas, “tinggal” selepas sesuatu dikeluarkan biasanya menunjukkan tolak.','Tahun 1 · Semak Bahasa Operasi'),id,'2.1.1',mode,'verbal','reasoning',s,['operation_language']);
};

GEN['2.1.2']=function(id,s){
 const mode=chooseMode(id,'2.1.2',bandModes(s,['name_symbol'],['name_symbol','match_symbol'],['match_symbol','reason_symbol']));
 if(mode==='name_symbol'){
  const x=choose([['+','tambah'],['−','tolak'],['=','sama dengan']]);
  return mark(q(`Simbol <b>${x[0]}</b> dibaca sebagai?`,x[1],[Nq(x[1]==='tambah'?'tolak':'tambah','symbol'),Nq('lebih besar','symbol'),Nq('darab','symbol')],'Kenal nama simbol operasi asas.','Tahun 1 · Simbol Operasi'),id,'2.1.2',mode,'symbolic','concept',s,['symbol']);
 }
 if(mode==='match_symbol'){
  const ask=Math.random()<.5?'menggabungkan dua kumpulan':'mengeluarkan sebahagian daripada kumpulan',ans=ask.startsWith('menggabungkan')?'+':'−';
  return mark(q(`Simbol yang sesuai untuk <b>${ask}</b> ialah?`,ans,[Nq(ans==='+'?'−':'+','symbol'),Nq('=','symbol'),Nq('×','symbol')],'Padankan makna operasi dengan simbol.','Tahun 1 · Padan Simbol'),id,'2.1.2',mode,'verbal','application',s,['symbol']);
 }
 return mark(q(`Ayat <b>6 + 3 = 9</b>. Simbol “=” menunjukkan apa?`,'kedua-dua nilai adalah sama',[Nq('mesti tambah lagi','symbol'),Nq('nilai kiri lebih besar','symbol'),Nq('nilai kanan lebih kecil','symbol')],'Tanda sama dengan menunjukkan dua nilai yang setara.','Tahun 1 · Makna Sama Dengan'),id,'2.1.2',mode,'symbolic','reasoning',s,['symbol','equality']);
};

GEN['2.1.3']=function(id,s){
 const mode=chooseMode(id,'2.1.3',bandModes(s,['write_add'],['write_add','write_sub'],['write_add','write_sub','match_sentence']));
 if(mode==='write_add'){
  const a=rand(2,8),b=rand(1,8),ans=a+b,eq=`${a} + ${b} = ${ans}`;
  return mark(q(`Di kantin ada <b>${a}</b> pau. Makcik menambah <b>${b}</b> lagi. Ayat matematik yang betul?`,eq,[Nq(`${a} − ${b} = ${Math.max(0,a-b)}`,'operation'),Nq(`${ans} + ${b} = ${a}`,'operation'),Nq(`${a} = ${b} + ${ans}`,'equality')],'Situasi bertambah menggunakan +.','Tahun 1 · Ayat Matematik Tambah'),id,'2.1.3',mode,'story','application',s,['operation','equality']);
 }
 if(mode==='write_sub'){
  const a=rand(6,15),b=rand(1,a-1),ans=a-b,eq=`${a} − ${b} = ${ans}`;
  return mark(q(`Ada <b>${a}</b> biji rambutan. <b>${b}</b> dimakan. Ayat matematik yang betul?`,eq,[Nq(`${a} + ${b} = ${a+b}`,'operation'),Nq(`${ans} − ${b} = ${a}`,'operation'),Nq(`${a} = ${b} − ${ans}`,'equality')],'Yang dimakan dikeluarkan daripada jumlah asal.','Tahun 1 · Ayat Matematik Tolak'),id,'2.1.3',mode,'story','application',s,['operation','equality']);
 }
 const a=rand(3,9),b=rand(1,5),ans=a+b;
 return mark(q(`Ayat matematik <b>${a} + ${b} = ${ans}</b> paling sesuai dengan cerita mana?`,`Ada ${a} buku, kemudian mendapat ${b} buku lagi.`,[Nq(`Ada ${ans} buku, kemudian memberi ${b} buku.`,'operation'),Nq(`Ada ${a} buku dan membuang semuanya.`,'operation'),Nq(`Ada ${b} buku sahaja.`,'operation')],'Cari cerita yang menunjukkan penggabungan dua kuantiti.','Tahun 1 · Padan Cerita dan Ayat'),id,'2.1.3',mode,'verbal','reasoning',s,['operation']);
};

GEN['2.2.1']=function(id,s){
 const mode=chooseMode(id,'2.2.1',bandModes(s,['fact_direct'],['fact_direct','fact_missing'],['fact_missing','fact_check']));
 const a=rand(1,9),b=rand(1,9),ans=a+b;
 if(mode==='fact_direct')return mark(q(`${a} + ${b} = ?`,ans,wrongNums(ans,1,'fact'),'Gunakan fakta asas tambah.','Tahun 1 · Fakta Asas Tambah'),id,'2.2.1',mode,'symbolic','procedure',s,['fact']);
 if(mode==='fact_missing')return mark(q(`${a} + ___ = ${ans}`,b,[Nq(a,'fact'),Nq(ans,'operation'),Nq(Math.max(0,b-1),'fact')],'Cari bahagian yang hilang.','Tahun 1 · Fakta Tambah Hilang'),id,'2.2.1',mode,'symbolic','application',s,['fact']);
 const claim=ans+choose([-1,1]);
 return mark(q(`${name()} kata <b>${a} + ${b} = ${claim}</b>. Jawapan yang betul?`,ans,[Nq(claim,'fact'),Nq(Math.max(0,ans-1),'fact'),Nq(ans+2,'fact')],'Semak fakta asas dengan membilang atau pasangan nombor.','Tahun 1 · Semak Fakta Tambah'),id,'2.2.1',mode,'symbolic','reasoning',s,['fact']);
};

GEN['2.2.2']=function(id,s){
 const mode=chooseMode(id,'2.2.2',bandModes(s,['add_two'],['add_two','add_story'],['add_story','missing_addend','reason_add']));
 let a=rand(10,70),b=rand(1,Math.min(29,100-a)),ans=a+b;
 if(mode==='add_two')return mark(q(`${a} + ${b} = ?`,ans,[Nq(ans+10,'place'),Nq(Math.max(0,ans-10),'place'),Nq(Math.abs(a-b),'operation')],'Tambah sa dan puluh dengan teliti.','Tahun 1 · Tambah Hingga 100'),id,'2.2.2',mode,'symbolic','procedure',s,['operation','place']);
 if(mode==='add_story')return mark(q(`Di ${choose(['perpustakaan sekolah','kantin sekolah','pasar pagi'])}, ada <b>${a}</b> item. Datang <b>${b}</b> lagi. Berapa semuanya?`,ans,[Nq(Math.abs(a-b),'operation'),Nq(a,'operation'),Nq(ans+1,'operation')],'“Lagi” menambah jumlah.','Tahun 1 · Tambah Harian'),id,'2.2.2',mode,'story','application',s,['operation']);
 if(mode==='missing_addend')return mark(q(`${name()} ada ${a} buah ${fruit()}. Selepas menerima beberapa lagi, jumlah menjadi <b>${ans}</b>. Berapa diterima?`,b,[Nq(a,'operation'),Nq(ans,'operation'),Nq(b+1,'operation')],'Cari bahagian tambahan: jumlah − jumlah asal.','Tahun 1 · Tambah Nilai Hilang'),id,'2.2.2',mode,'story','reasoning',s,['operation']);
 const claim=ans+10;return mark(q(`Tanpa mengira dua kali, jawapan ${name()} ialah <b>${claim}</b> bagi ${a} + ${b}. Apakah jawapan sebenar?`,ans,[Nq(claim,'place'),Nq(ans+1,'operation'),Nq(Math.abs(a-b),'operation')],'Semak nilai tempat dan anggaran puluh.','Tahun 1 · Semak Tambah'),id,'2.2.2',mode,'symbolic','reasoning',s,['operation','place']);
};

GEN['2.3.1']=function(id,s){
 const mode=chooseMode(id,'2.3.1',bandModes(s,['fact_direct'],['fact_direct','fact_missing'],['fact_missing','fact_check']));
 const a=rand(2,18),b=rand(1,a-1),ans=a-b;
 if(mode==='fact_direct')return mark(q(`${a} − ${b} = ?`,ans,wrongNums(ans,1,'fact'),'Gunakan fakta asas tolak.','Tahun 1 · Fakta Asas Tolak'),id,'2.3.1',mode,'symbolic','procedure',s,['fact']);
 if(mode==='fact_missing')return mark(q(`${a} − ___ = ${ans}`,b,[Nq(ans,'operation'),Nq(a,'operation'),Nq(Math.max(1,b-1),'fact')],'Cari bahagian yang dikeluarkan.','Tahun 1 · Fakta Tolak Hilang'),id,'2.3.1',mode,'symbolic','application',s,['fact']);
 const claim=Math.max(0,ans-1);return mark(q(`${name()} kata <b>${a} − ${b} = ${claim}</b>. Jawapan sebenar?`,ans,[Nq(claim,'fact'),Nq(ans+1,'fact'),Nq(a+b,'operation')],'Semak fakta asas tolak.','Tahun 1 · Semak Fakta Tolak'),id,'2.3.1',mode,'symbolic','reasoning',s,['fact']);
};

GEN['2.3.2']=function(id,s){
 const mode=chooseMode(id,'2.3.2',bandModes(s,['sub_two'],['sub_two','sub_story'],['sub_story','missing_subtrahend','reason_sub']));
 const a=rand(30,99),b=rand(1,Math.min(39,a-1)),ans=a-b;
 if(mode==='sub_two')return mark(q(`${a} − ${b} = ?`,ans,[Nq(ans+10,'place'),Nq(Math.max(0,ans-10),'place'),Nq(a+b,'operation')],'Tolak mengikut nilai tempat.','Tahun 1 · Tolak Hingga 100'),id,'2.3.2',mode,'symbolic','procedure',s,['operation','place']);
 if(mode==='sub_story')return mark(q(`Di kantin ada <b>${a}</b> ${food()}. Sebanyak <b>${b}</b> dibeli. Berapa yang tinggal?`,ans,[Nq(a+b,'operation'),Nq(a,'operation'),Nq(ans+1,'operation')],'Yang dibeli dikeluarkan daripada jumlah asal.','Tahun 1 · Tolak Harian'),id,'2.3.2',mode,'story','application',s,['operation']);
 if(mode==='missing_subtrahend')return mark(q(`Bas sekolah membawa <b>${a}</b> murid. Selepas beberapa murid turun, tinggal <b>${ans}</b>. Berapa murid turun?`,b,[Nq(ans,'operation'),Nq(a,'operation'),Nq(b+1,'operation')],'Cari perubahan: jumlah asal − baki.','Tahun 1 · Tolak Nilai Hilang'),id,'2.3.2',mode,'story','reasoning',s,['operation']);
 const claim=ans+10;return mark(q(`${name()} mengira <b>${a} − ${b} = ${claim}</b>. Jawapan yang betul?`,ans,[Nq(claim,'place'),Nq(ans+1,'operation'),Nq(a+b,'operation')],'Semak nilai tempat dan operasi tolak.','Tahun 1 · Semak Tolak'),id,'2.3.2',mode,'symbolic','reasoning',s,['operation','place']);
};

GEN['2.4.1']=function(id,s){
 const mode=chooseMode(id,'2.4.1',bandModes(s,['match_add_story'],['match_add_story','match_sub_story'],['match_add_story','match_sub_story','choose_best_story']));
 const add=Math.random()<.5,a=rand(10,40),b=rand(3,20),ans=add?a+b:a-b,eq=`${a} ${add?'+':'−'} ${b} = ${ans}`;
 const correct=add?`Di pasar pagi ada ${a} mangga dan ${b} mangga lagi ditambah.`:`Di kantin ada ${a} pau dan ${b} pau dibeli.`;
 return mark(q(`Ayat matematik <b>${eq}</b>. Cerita manakah sepadan?`,correct,[Nq(add?`Ada ${a} mangga dan ${b} mangga dikeluarkan.`:`Ada ${a} pau dan ${b} pau lagi ditambah.`,'story_model'),Nq(`Ada ${ans} barang tanpa sebarang perubahan.`,'story_model'),Nq(`Ada ${b} barang sahaja.`,'story_model')],'Cerita mesti menggambarkan operasi dan nombor yang sama.','Tahun 1 · Mereka Cerita Masalah'),id,'2.4.1',mode,'verbal',stage(s)===3?'reasoning':'application',s,['story_model','operation']);
};

GEN['2.4.2']=function(id,s){
 const mode=chooseMode(id,'2.4.2',bandModes(s,['one_step'],['one_step','choose_operation'],['missing_value','two_clue']));
 const add=Math.random()<.5,a=rand(15,60),b=rand(3,Math.min(20,add?100-a:a-1)),ans=add?a+b:a-b;
 if(mode==='one_step')return mark(q(add?`${name()} ada ${a} buku cerita dan meminjam ${b} lagi. Berapa semuanya?`:`Di kedai runcit ada ${a} botol air. ${b} botol terjual. Berapa tinggal?`,ans,[Nq(add?Math.abs(a-b):a+b,'operation'),Nq(a,'operation'),Nq(ans+1,'operation')],add?'Tambah kuantiti baharu.':'Tolak kuantiti yang keluar.','Tahun 1 · Masalah Harian'),id,'2.4.2',mode,'story','application',s,['operation']);
 if(mode==='choose_operation')return mark(q(`Situasi: ada ${a} item, kemudian ${b} item ${add?'ditambah':'dikeluarkan'}. Operasi yang sesuai?`,add?'tambah':'tolak',[Nq(add?'tolak':'tambah','operation'),Nq('darab','operation'),Nq('bahagi','operation')],'Tentukan sama ada kuantiti bertambah atau berkurang.','Tahun 1 · Pilih Strategi'),id,'2.4.2',mode,'story','reasoning',s,['operation']);
 if(mode==='missing_value'){
  const start=add?a:ans,total=add?ans:a;
  return mark(q(add?`Jumlah ${total}. Sebelum menerima ${b} lagi, berapa yang ada?`:`Selepas ${b} dikeluarkan, tinggal ${start}. Berapa jumlah asal?`,add?a:a,[Nq(total,'operation'),Nq(b,'operation'),Nq(Math.max(0,a-1),'operation')],'Gunakan hubungan songsang tambah dan tolak.','Tahun 1 · Masalah Songsang'),id,'2.4.2',mode,'story','reasoning',s,['operation']);
 }
 return mark(q(`Di kantin, ${name()} membeli ${b} ${food()} daripada ${a} yang ada. Kawan berkata baki ialah ${a+b}. Apakah baki sebenar?`,a-b,[Nq(a+b,'operation'),Nq(a,'operation'),Nq(b,'operation')],'Perkataan “baki” selepas membeli memerlukan tolak.','Tahun 1 · Semak Masalah Harian'),id,'2.4.2',mode,'story','reasoning',s,['operation','reasoning']);
};

GEN['2.5.1']=function(id,s){
 const step=choose([2,4,5,10]),groups=rand(2,4),terms=Array.from({length:groups},()=>step),sum=step*groups,expr=terms.join(' + ')+' = '+sum;
 const mode=chooseMode(id,'2.5.1',bandModes(s,['write_repeat'],['write_repeat','match_groups'],['match_groups','missing_repeat']));
 if(mode==='write_repeat')return mark(q(`Ada <b>${groups}</b> kumpulan, setiap kumpulan ada <b>${step}</b> objek. Ayat tambah berulang?`,expr,[Nq(`${groups} + ${step} = ${groups+step}`,'repeated_add'),Nq(`${step} + ${groups} = ${sum}`,'repeated_add'),Nq(`${sum} − ${step} = ${sum-step}`,'operation')],'Ulang nombor dalam setiap kumpulan sebanyak bilangan kumpulan.','Tahun 1 · Tambah Berulang'),id,'2.5.1',mode,'story','procedure',s,['repeated_add']);
 if(mode==='match_groups')return mark(q(`Ayat <b>${expr}</b> mewakili situasi mana?`,`${groups} kumpulan, setiap satu ${step}`,[Nq(`${step} kumpulan, setiap satu ${groups}`,'repeated_add'),Nq(`1 kumpulan berisi ${sum}`,'repeated_add'),Nq(`${groups+step} kumpulan kosong`,'repeated_add')],'Bilangan sebutan menunjukkan bilangan kumpulan.','Tahun 1 · Model Tambah Berulang'),id,'2.5.1',mode,'verbal','application',s,['repeated_add']);
 const missing=step;return mark(q(`${step} + ___ + ${step} = ${step*3}`,missing,[Nq(groups,'repeated_add'),Nq(step*2,'operation'),Nq(sum,'operation')],'Tambah berulang menggunakan nilai yang sama setiap kali.','Tahun 1 · Tambah Berulang Hilang'),id,'2.5.1',mode,'symbolic','reasoning',s,['repeated_add']);
};

GEN['2.6.2']=function(id,s){
 const step=choose([2,4,5,10]),times=rand(2,4),start=step*times,arr=[start],parts=[];let x=start;
 for(let i=0;i<times;i++){parts.push(step);x-=step;arr.push(x)}
 const expr=arr[0]+' − '+parts.map(()=>step).join(' − ')+' = 0';
 const mode=chooseMode(id,'2.6.2',bandModes(s,['write_repeat_sub'],['write_repeat_sub','match_remove'],['match_remove','missing_sub']));
 if(mode==='write_repeat_sub')return mark(q(`Ada <b>${start}</b> objek. Keluarkan <b>${step}</b> setiap kali hingga habis. Ayat tolak berturut-turut?`,expr,[Nq(`${start} − ${times} = ${start-times}`,'repeated_sub'),Nq(`${step} + ${step} = ${step*2}`,'operation'),Nq(`${start} − ${step} = ${start-step}`,'repeated_sub')],'Tolak kuantiti yang sama berulang kali hingga habis.','Tahun 1 · Tolak Berturut-turut'),id,'2.6.2',mode,'story','procedure',s,['repeated_sub']);
 if(mode==='match_remove')return mark(q(`<b>${expr}</b> bermaksud?`,`keluarkan ${step} sebanyak ${times} kali`,[Nq(`tambah ${step} sebanyak ${times} kali`,'repeated_sub'),Nq(`keluarkan ${times} sekali sahaja`,'repeated_sub'),Nq(`bahagi kepada ${start} kumpulan`,'repeated_sub')],'Setiap tanda tolak menunjukkan satu pengeluaran.','Tahun 1 · Makna Tolak Berturut-turut'),id,'2.6.2',mode,'verbal','application',s,['repeated_sub']);
 return mark(q(`${start} − ${step} − ___ = ${Math.max(0,start-step*2)}`,step,[Nq(times,'repeated_sub'),Nq(start-step,'operation'),Nq(step*2,'operation')],'Nilai yang ditolak berulang adalah sama.','Tahun 1 · Tolak Berulang Hilang'),id,'2.6.2',mode,'symbolic','reasoning',s,['repeated_sub']);
};

document.documentElement?.setAttribute('data-y1-v2-unit2','3.62.6');
})();