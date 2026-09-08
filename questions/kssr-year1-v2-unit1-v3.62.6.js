// Year 1 Curriculum Bank v2 — Unit 1: Nombor Bulat Hingga 100
(function(){
'use strict';
const RT=window.PAY1V2Runtime;if(!RT)return;
const {GEN,Nq,q,mark,chooseMode,bandModes,stage,rand,choose,words,wrongNums,dots,estimateCloud,numLine,name,fruit}=RT;

GEN['1.1.1']=function(id,s){
 const mode=chooseMode(id,'1.1.1',bandModes(s,['more_less'],['more_less','same_match'],['same_match','pattern_compare','reason_compare']));
 if(mode==='more_less'){
  let a=rand(3,9),b=rand(3,9);while(a===b)b=rand(3,9);const ans=a>b?'Kumpulan A':'Kumpulan B';
  return mark(q(`Kumpulan A mempunyai <b>${a}</b> buah ${fruit()} dan Kumpulan B mempunyai <b>${b}</b>. Kumpulan manakah lebih banyak?`,ans,[Nq(ans==='Kumpulan A'?'Kumpulan B':'Kumpulan A','compare'),Nq('Sama banyak','compare'),Nq('Tidak boleh ditentukan','compare')],'Banding bilangan dalam kedua-dua kumpulan.','Tahun 1 · Kuantiti'),id,'1.1.1',mode,'story','concept',s,['compare']);
 }
 if(mode==='same_match'){
  const n=rand(4,9),other=n+choose([-2,-1,1,2]);const same=Math.random()<.5, b=same?n:Math.max(1,other),ans=same?'sama banyak':'tidak sama banyak';
  return mark(q(`${dots(n)}Kumpulan A ada ${n} objek. Kumpulan B ada <b>${b}</b> objek. Hubungan kedua-duanya?`,ans,[Nq(ans==='sama banyak'?'tidak sama banyak':'sama banyak','compare'),Nq('lebih satu sahaja','compare'),Nq('tidak boleh dibanding','compare')],'Padankan satu-satu atau banding bilangannya.','Tahun 1 · Padanan Satu-satu'),id,'1.1.1',mode,'visual','concept',s,['compare']);
 }
 if(mode==='pattern_compare'){
  const a=rand(3,6),b=a+rand(1,3);
  return mark(q(`Pola A mempunyai ${a} bulatan. Pola B mempunyai ${b} bulatan. Pernyataan yang betul?`,'Pola B lebih banyak',[Nq('Pola A lebih banyak','compare'),Nq('Kedua-duanya sama banyak','compare'),Nq('Pola B lebih sedikit','compare')],'Banding bilangan objek dalam pola.','Tahun 1 · Pola Kuantiti'),id,'1.1.1',mode,'verbal','application',s,['compare']);
 }
 const a=rand(4,8),b=rand(4,8),c=a+b;
 return mark(q(`Hakim kata kumpulan ${a} objek lebih banyak daripada kumpulan ${b} objek. Bila kenyataan Hakim betul?`,a>b?'apabila bilangan pertama lebih besar':'kenyataan itu tidak betul',[Nq('apabila kedua-dua nombor sama','compare'),Nq('apabila bilangan pertama lebih kecil','compare'),Nq(String(c),'operation')],'Banding nilai, bukan saiz tulisan atau susunan objek.','Tahun 1 · Penaakulan Kuantiti'),id,'1.1.1',mode,'verbal','reasoning',s,['compare']);
};

GEN['1.2.1']=function(id,s){
 const mode=chooseMode(id,'1.2.1',bandModes(s,['count_objects'],['count_objects','name_quantity'],['name_quantity','compare_groups']));
 if(mode==='count_objects'){const n=rand(6,20);return mark(q(`${dots(n)}Berapakah bilangan objek?`,n,wrongNums(n,1,'count'),'Kira setiap objek satu demi satu.','Tahun 1 · Membilang'),id,'1.2.1',mode,'visual','concept',s,['count']);}
 if(mode==='name_quantity'){const n=rand(10,99);return mark(q(`Kumpulan itu mempunyai <b>${n}</b> objek. Nama nombor yang betul?`,words(n),[Nq(words(Math.max(1,n-1)),'number_name'),Nq(words(Math.min(100,n+1)),'number_name'),Nq(words(Math.max(1,Math.floor(n/10)*10)),'place')],'Baca puluh dahulu, kemudian sa.','Tahun 1 · Nama Nombor'),id,'1.2.1',mode,'verbal','concept',s,['number_name']);}
 let a=rand(8,30),b=rand(8,30);while(a===b)b=rand(8,30);const ans=a>b?'A':'B';
 return mark(q(`Kumpulan A ada ${a} objek dan Kumpulan B ada ${b}. Kumpulan manakah mempunyai kuantiti lebih besar?`,ans,[Nq(ans==='A'?'B':'A','compare'),Nq('Sama','compare'),Nq('Tidak pasti','compare')],'Banding bilangan kedua-dua kumpulan.','Tahun 1 · Banding Kuantiti'),id,'1.2.1',mode,'story','application',s,['compare']);
};

GEN['1.2.2']=function(id,s){
 const mode=chooseMode(id,'1.2.2',bandModes(s,['match_value'],['match_value','compare_value','order_value'],['compare_value','order_value','between_value']));
 if(mode==='match_value'){const n=rand(5,20);return mark(q(`${dots(n)}Nombor manakah sepadan dengan kumpulan ini?`,n,wrongNums(n,1,'count'),'Padankan kuantiti dengan nombor.','Tahun 1 · Padanan Nilai'),id,'1.2.2',mode,'visual','concept',s,['count']);}
 if(mode==='compare_value'){let a=rand(10,99),b=rand(10,99);while(a===b)b=rand(10,99);const ans=Math.max(a,b);return mark(q(`Yang manakah lebih besar: <b>${a}</b> atau <b>${b}</b>?`,ans,[Nq(Math.min(a,b),'compare'),Nq(Math.abs(a-b),'operation'),Nq(Math.min(100,ans+1),'compare')],'Banding puluh dahulu, kemudian sa.','Tahun 1 · Banding Nilai'),id,'1.2.2',mode,'symbolic','concept',s,['compare','place']);}
 if(mode==='order_value'){let xs=[];while(xs.length<3){const n=rand(1,100);if(!xs.includes(n))xs.push(n)}const ans=[...xs].sort((a,b)=>a-b).join(', ');return mark(q(`Susun secara menaik: <b>${xs.join(', ')}</b>`,ans,[Nq([...xs].sort((a,b)=>b-a).join(', '),'compare'),Nq(xs.join(', '),'compare'),Nq([xs[1],xs[0],xs[2]].join(', '),'compare')],'Nombor paling kecil ditulis dahulu.','Tahun 1 · Susun Nilai'),id,'1.2.2',mode,'symbolic','procedure',s,['compare']);}
 const lo=rand(5,95),ans=lo+1,hi=lo+2;return mark(q(`Nombor manakah berada di antara <b>${lo}</b> dan <b>${hi}</b>?`,ans,[Nq(lo,'compare'),Nq(hi,'compare'),Nq(Math.min(100,hi+1),'compare')],'Cari nombor selepas yang kecil dan sebelum yang besar.','Tahun 1 · Di Antara'),id,'1.2.2',mode,'symbolic','reasoning',s,['compare','pattern']);
};

GEN['1.3.1']=function(id,s){
 const mode=chooseMode(id,'1.3.1',bandModes(s,['number_to_words'],['number_to_words','words_to_number'],['words_to_number','spot_wrong_word']));
 const n=rand(1,100);
 if(mode==='number_to_words')return mark(q(`Pilih perkataan bagi <b>${n}</b>.`,words(n),[Nq(words(Math.max(1,n-1)),'number_name'),Nq(words(Math.min(100,n+1)),'number_name'),Nq(words(Math.max(1,n-10)),'place')],'Baca nombor mengikut puluh dan sa.','Tahun 1 · Angka ke Perkataan'),id,'1.3.1',mode,'verbal','concept',s,['number_name']);
 if(mode==='words_to_number')return mark(q(`Pilih angka bagi <b>${words(n)}</b>.`,n,[Nq(Math.max(0,n-1),'number_name'),Nq(Math.min(100,n+1),'number_name'),Nq(Number(String(n).split('').reverse().join('')),'place')],'Padankan nama nombor dengan angka.','Tahun 1 · Perkataan ke Angka'),id,'1.3.1',mode,'verbal','application',s,['number_name']);
 const wrong=Math.min(100,n+10);return mark(q(`${name()} menulis <b>${n}</b> sebagai “${words(wrong)}”. Apakah ejaan nombor yang betul?`,words(n),[Nq(words(wrong),'number_name'),Nq(words(Math.max(1,n-10)),'place'),Nq(words(Math.min(100,n+1)),'number_name')],'Semak nilai puluh dan sa.','Tahun 1 · Semak Nama Nombor'),id,'1.3.1',mode,'story','reasoning',s,['number_name','place']);
};

GEN['1.4.1']=function(id,s){
 const mode=chooseMode(id,'1.4.1',bandModes(s,['make_number'],['make_number','missing_part'],['missing_part','all_pairs']));
 const total=rand(4,9),a=rand(1,total-1),b=total-a;
 if(mode==='make_number')return mark(q(`<b>${a}</b> dan <b>${b}</b> membentuk nombor?`,total,wrongNums(total,1,'number_bond'),'Gabungkan dua bahagian.','Tahun 1 · Kombinasi Nombor'),id,'1.4.1',mode,'symbolic','concept',s,['number_bond']);
 if(mode==='missing_part')return mark(q(`<b>${a}</b> dan ___ membentuk <b>${total}</b>.`,b,[Nq(a,'number_bond'),Nq(total,'number_bond'),Nq(Math.max(0,b-1),'number_bond')],'Cari bahagian yang hilang.','Tahun 1 · Bahagian Hilang'),id,'1.4.1',mode,'symbolic','application',s,['number_bond']);
 const pairs=[];for(let x=1;x<=Math.floor(total/2);x++)pairs.push(`${x} dan ${total-x}`);const ans=pairs.join('; ');
 return mark(q(`Pilih senarai kombinasi yang semuanya membentuk <b>${total}</b>.`,ans,[Nq(`1 dan ${total}; 2 dan ${total-1}`,'number_bond'),Nq(`${a} dan ${a}`,'number_bond'),Nq(`${total} dan ${total}`,'number_bond')],'Setiap pasangan mesti berjumlah nombor sasaran.','Tahun 1 · Semua Kombinasi'),id,'1.4.1',mode,'verbal','reasoning',s,['number_bond']);
};

GEN['1.5.1']=function(id,s){
 const steps=[1,2,4,5,10],step=choose(steps),down=Math.random()<.5,mode=chooseMode(id,'1.5.1',bandModes(s,['count_next'],['count_next','count_direction'],['count_direction','count_far']));
 const start=down?rand(step*4,100):rand(1,Math.max(1,100-step*4)),next=start+(down?-step:step);
 if(mode==='count_next')return mark(q(`Membilang ${down?'menurun':'menaik'} ${step===1?'satu-satu':step+'-'+step}: <b>${start}, ___</b>`,next,wrongNums(next,step,'pattern'),'Gerak mengikut langkah yang sama.','Tahun 1 · Membilang'),id,'1.5.1',mode,'symbolic','procedure',s,['pattern']);
 if(mode==='count_direction')return mark(q(`Siri <b>${start}, ${next}</b> bergerak bagaimana?`,down?`tolak ${step}`:`tambah ${step}`,[Nq(down?`tambah ${step}`:`tolak ${step}`,'pattern'),Nq('tambah 1','pattern'),Nq('tiada pola','pattern')],'Banding beza antara dua nombor.','Tahun 1 · Arah Membilang'),id,'1.5.1',mode,'symbolic','concept',s,['pattern']);
 const ans=start+(down?-step*3:step*3);return mark(q(`Mulakan ${start}. Kira ${down?'menurun':'menaik'} ${step===1?'satu-satu':step+'-'+step} sebanyak tiga langkah. Nombor akhir?`,ans,wrongNums(ans,step,'pattern'),'Gerak tiga kali dengan langkah yang sama.','Tahun 1 · Membilang Berbilang Langkah'),id,'1.5.1',mode,'story','reasoning',s,['pattern']);
};

GEN['1.5.2']=function(id,s){
 const step=choose([1,2,4,5,10]),down=Math.random()<.5,start=down?rand(step*4,100):rand(1,Math.max(1,100-step*4)),arr=[0,1,2].map(i=>start+(down?-step*i:step*i)),ans=start+(down?-step*3:step*3);
 const mode=chooseMode(id,'1.5.2',bandModes(s,['missing_end'],['missing_end','missing_middle'],['missing_middle','two_missing']));
 if(mode==='missing_end')return mark(q(`<b>${arr.join(', ')}, ___</b>`,ans,wrongNums(ans,step,'pattern'),'Cari beza tetap dalam rangkaian.','Tahun 1 · Lengkap Rangkaian'),id,'1.5.2',mode,'symbolic','procedure',s,['pattern']);
 if(mode==='missing_middle'){const m=start+(down?-step:step);return mark(q(`<b>${start}, ___, ${start+(down?-step*2:step*2)}</b>`,m,wrongNums(m,step,'pattern'),'Nombor tengah mengikut langkah yang sama.','Tahun 1 · Rangkaian Tengah'),id,'1.5.2',mode,'symbolic','application',s,['pattern']);}
 const a=start+(down?-step:step),b=start+(down?-step*2:step*2),pair=`${a}, ${b}`;return mark(q(`<b>${start}, ___, ___, ${ans}</b>`.replace(String(ans),String(start+(down?-step*3:step*3))),pair,[Nq(`${b}, ${a}`,'pattern'),Nq(`${a+1}, ${b+1}`,'pattern'),Nq(`${start}, ${ans}`,'pattern')],'Isi kedua-dua tempat dengan langkah tetap.','Tahun 1 · Dua Nombor Hilang'),id,'1.5.2',mode,'symbolic','reasoning',s,['pattern']);
};

GEN['1.6.1']=function(id,s){
 const n=rand(10,99),t=Math.floor(n/10),o=n%10,mode=chooseMode(id,'1.6.1',bandModes(s,['place_name'],['place_name','digit_value'],['digit_value','missing_place','error_place']));
 if(mode==='place_name'){const ask=Math.random()<.5?'puluh':'sa',d=ask==='puluh'?t:o;return mark(q(`Dalam <b>${n}</b>, digit <b>${d}</b> berada pada tempat?`,ask,[Nq(ask==='puluh'?'sa':'puluh','place'),Nq('ratus','place'),Nq(String(d),'digit_value')],'Baca tempat dari kanan: sa kemudian puluh.','Tahun 1 · Nilai Tempat'),id,'1.6.1',mode,'symbolic','concept',s,['place']);}
 if(mode==='digit_value'){const ask=Math.random()<.5?'puluh':'sa',d=ask==='puluh'?t:o,ans=ask==='puluh'?t*10:o;return mark(q(`Nilai digit <b>${d}</b> pada tempat <b>${ask}</b> dalam ${n} ialah?`,ans,[Nq(d,'digit_value'),Nq(ask==='puluh'?o*10:t,'place'),Nq(n,'place')],'Nilai digit bergantung pada tempatnya.','Tahun 1 · Nilai Digit'),id,'1.6.1',mode,'symbolic','application',s,['digit_value','place']);}
 if(mode==='missing_place'){const ans=t*10;return mark(q(`<b>${n}</b> = ___ + ${o}`,ans,[Nq(t,'digit_value'),Nq(o*10,'place'),Nq(ans+10,'place')],'Bahagian puluh bernilai digit × 10.','Tahun 1 · Nilai Tempat Hilang'),id,'1.6.1',mode,'symbolic','reasoning',s,['place']);}
 return mark(q(`${name()} berkata <b>${n} = ${t} + ${o}</b>. Pembetulan?`,`${t*10} + ${o}`,[Nq(`${t} + ${o}`,'digit_value'),Nq(`${o*10} + ${t}`,'place'),Nq(`${n} + 10`,'place')],'Digit puluh mewakili puluhan.','Tahun 1 · Semak Nilai Tempat'),id,'1.6.1',mode,'verbal','reasoning',s,['place','digit_value']);
};

GEN['1.7.1']=function(id,s){
 const n=rand(12,48),nearest=Math.round(n/10)*10,mode=chooseMode(id,'1.7.1',bandModes(s,['estimate_visual'],['estimate_visual','estimate_reasonable'],['estimate_reasonable','reference_compare']));
 if(mode==='estimate_visual')return mark(q(`${estimateCloud(n)}Tanpa mengira satu demi satu, anggaran paling munasabah?`,nearest,[Nq(Math.max(10,nearest-20),'estimate'),Nq(Math.min(60,nearest+20),'estimate'),Nq(5,'estimate')],'Lihat keseluruhan kumpulan dan banding dengan puluhan terdekat.','Tahun 1 · Anggaran'),id,'1.7.1',mode,'visual','concept',s,['estimate']);
 if(mode==='estimate_reasonable')return mark(q(`Sebuah bakul kelihatan mempunyai lebih kurang <b>${n}</b> rambutan. Anggaran puluh yang sesuai?`,nearest,[Nq(Math.max(0,nearest-10),'estimate'),Nq(nearest+20,'estimate'),Nq(n,'estimate')],'Anggaran tidak perlu sama dengan bilangan tepat.','Tahun 1 · Anggaran Munasabah'),id,'1.7.1',mode,'story','application',s,['estimate']);
 const ref=20,more=n>ref?'lebih daripada 20':'kurang daripada 20';return mark(q(`Banding kumpulan kira-kira ${n} objek dengan set rujukan 20. Pernyataan munasabah?`,more,[Nq(more==='lebih daripada 20'?'kurang daripada 20':'lebih daripada 20','estimate'),Nq('tepat 20','estimate'),Nq('tidak boleh dianggar','estimate')],'Gunakan set rujukan untuk membuat anggaran.','Tahun 1 · Set Rujukan'),id,'1.7.1',mode,'verbal','reasoning',s,['estimate','compare']);
};

GEN['1.8.1']=function(id,s){
 const n=rand(11,99),ans=Math.round(n/10)*10,mode=chooseMode(id,'1.8.1',bandModes(s,['round_line'],['round_line','round_direct'],['round_direct','round_reason']));
 if(mode==='round_line'){const lo=Math.floor(n/10)*10,hi=Math.ceil(n/10)*10;return mark(q(`${numLine(lo,hi,n,String(n))}Bundarkan <b>${n}</b> kepada puluh terdekat.`,ans,[Nq(lo===ans?hi:lo,'round'),Nq(n,'round'),Nq(Math.min(100,ans+10),'round')],'Lihat puluh yang paling dekat pada garis nombor.','Tahun 1 · Bundar Garis Nombor'),id,'1.8.1',mode,'visual','concept',s,['round']);}
 if(mode==='round_direct')return mark(q(`<b>${n}</b> dibundarkan kepada puluh terdekat menjadi?`,ans,[Nq(Math.floor(n/10)*10,'round'),Nq(Math.ceil(n/10)*10,'round'),Nq(n,'round')],'Digit sa 5 atau lebih naik ke puluh seterusnya.','Tahun 1 · Bundar Puluh'),id,'1.8.1',mode,'symbolic','procedure',s,['round']);
 const claim=Math.random()<.5?ans:(ans===Math.floor(n/10)*10?ans+10:ans-10);return mark(q(`${name()} membundarkan <b>${n}</b> kepada <b>${claim}</b>. Adakah betul?`,claim===ans?'betul':'salah',[Nq(claim===ans?'salah':'betul','round'),Nq(String(ans),'round'),Nq('tidak pasti','round')],'Banding jarak nombor kepada dua puluh bersebelahan.','Tahun 1 · Semak Bundaran'),id,'1.8.1',mode,'verbal','reasoning',s,['round']);
};

GEN['1.9.1']=function(id,s){
 const step=choose([1,2,4,5,10]),down=Math.random()<.5,start=down?rand(step*4,100):rand(1,Math.max(1,100-step*4)),seq=[0,1,2,3].map(i=>start+(down?-step*i:step*i));
 const mode=chooseMode(id,'1.9.1',bandModes(s,['identify_step'],['identify_step','identify_direction'],['identify_direction','explain_pattern']));
 const op=down?`tolak ${step}`:`tambah ${step}`;
 if(mode==='identify_step')return mark(q(`Pola: <b>${seq.join(', ')}</b>. Apakah peraturannya?`,op,[Nq(down?`tambah ${step}`:`tolak ${step}`,'pattern'),Nq('tambah 1','pattern'),Nq('tiada pola','pattern')],'Cari beza antara nombor berturutan.','Tahun 1 · Kenal Pola'),id,'1.9.1',mode,'symbolic','concept',s,['pattern']);
 if(mode==='identify_direction')return mark(q(`<b>${seq.join(', ')}</b> bergerak secara?`,down?'menurun':'menaik',[Nq(down?'menaik':'menurun','pattern'),Nq('rawak','pattern'),Nq('sama sahaja','pattern')],'Lihat sama ada nilai bertambah atau berkurang.','Tahun 1 · Arah Pola'),id,'1.9.1',mode,'symbolic','application',s,['pattern']);
 return mark(q(`${name()} kata pola <b>${seq.join(', ')}</b> ialah tambah ${step}. Penilaian?`,down?'salah':'betul',[Nq(down?'betul':'salah','pattern'),Nq(op,'pattern'),Nq('tidak boleh ditentukan','pattern')],'Periksa beza dan arah pada setiap langkah.','Tahun 1 · Semak Pola'),id,'1.9.1',mode,'verbal','reasoning',s,['pattern']);
};

GEN['1.9.2']=function(id,s){
 const step=choose([1,2,4,5,10]),down=Math.random()<.5,start=down?rand(step*4,100):rand(1,Math.max(1,100-step*4)),a=start,b=start+(down?-step:step),c=b+(down?-step:step),d=c+(down?-step:step),mode=chooseMode(id,'1.9.2',bandModes(s,['missing_end'],['missing_end','missing_middle'],['missing_middle','two_step']));
 if(mode==='missing_end')return mark(q(`<b>${a}, ${b}, ${c}, ___</b>`,d,wrongNums(d,step,'pattern'),'Teruskan pola dengan langkah yang sama.','Tahun 1 · Lengkap Pola'),id,'1.9.2',mode,'symbolic','procedure',s,['pattern']);
 if(mode==='missing_middle')return mark(q(`<b>${a}, ___, ${c}</b>`,b,wrongNums(b,step,'pattern'),'Cari nombor yang mengekalkan beza tetap.','Tahun 1 · Pola Tengah'),id,'1.9.2',mode,'symbolic','application',s,['pattern']);
 const e=d+(down?-step:step);return mark(q(`Jika pola ${down?'tolak':'tambah'} ${step} bermula pada ${a}, apakah nombor selepas <b>${d}</b>?`,e,wrongNums(e,step,'pattern'),'Gunakan peraturan pola sekali lagi.','Tahun 1 · Lanjutkan Pola'),id,'1.9.2',mode,'story','reasoning',s,['pattern']);
};

GEN['1.10.1']=function(id,s){
 const mode=chooseMode(id,'1.10.1',bandModes(s,['queue'],['queue','house_number'],['house_number','multi_clue']));
 if(mode==='queue'){
  const pos=rand(2,9);return mark(q(`Di kantin sekolah, ${name()} berada di nombor giliran <b>${pos}</b>. Seorang murid di hadapannya selesai membeli. Nombor giliran seterusnya bagi ${name()}?`,pos-1,wrongNums(pos-1,1,'number_problem'),'Kedudukan bergerak satu tempat ke hadapan.','Tahun 1 · Nombor dalam Kehidupan'),id,'1.10.1',mode,'story','application',s,['number_problem']);
 }
 if(mode==='house_number'){
  const n=rand(21,89);return mark(q(`Nombor rumah jiran ialah <b>${n}</b>. Rumah selepasnya bernombor satu lebih. Nombornya?`,n+1,wrongNums(n+1,1,'number_problem'),'Satu lebih bermaksud tambah 1.','Tahun 1 · Nombor Rumah'),id,'1.10.1',mode,'story','application',s,['number_problem']);
 }
 const n=rand(20,80),ans=n+1;return mark(q(`Saya lebih daripada <b>${n}</b> tetapi kurang daripada <b>${n+2}</b>. Saya nombor apa?`,ans,[Nq(n,'compare'),Nq(n+2,'compare'),Nq(n+3,'compare')],'Gabungkan kedua-dua petunjuk.','Tahun 1 · Teka Nombor Harian'),id,'1.10.1',mode,'verbal','reasoning',s,['number_problem','compare']);
};

document.documentElement?.setAttribute('data-y1-v2-unit1','3.62.6');
})();