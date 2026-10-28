/* Fixed Kembara Dimensi coach scenarios. In-memory demo content only. */
((root)=>{
 'use strict';
 const bad=(v,tag)=>({v:String(v),tag});
 const make=(skill,prompt,answer,near,hint,facets)=>{answer=String(answer);let other=answer.replace(/\d+(?:\.\d+)?/,n=>String(Number(n)+1));while(other===answer||other===String(near))other=other.replace(/\d+(?:\.\d+)?/,n=>String(Number(n)+1));return {skill,prompt,answer,wrong:[bad(near,'targeted-misconception'),bad(other,'near-miss')],hint,facets};};
 const rows=[
  {grade:1,skill:'D1.PV100',topic:'Nilai tempat puluh dan sa',game:'place',key:'place-basic',hint:'Satu puluh ialah 10 sa. Pecahkan nombor kepada kumpulan puluh dan sa.',explain:'18 ialah 1 puluh dan 8 sa; digit 1 bernilai 10 kerana berada di tempat puluh.',qs:[
   make('D1.N100','18 ada berapa puluh dan berapa sa?','1 puluh dan 8 sa','18 puluh','Kira satu kumpulan sepuluh, kemudian baki sa.',{rep:'concrete',format:'visual'}),make('D1.N100','Dalam 47, digit 4 bernilai berapa?','40','4','Digit di tempat puluh mewakili kumpulan sepuluh.',{rep:'pictorial'}),make('D1.N100','36 = ___ puluh + 6 sa.','3','6','Nilai 30 bermaksud 3 kumpulan puluh.',{rep:'abstract'}),make('D1.N100','Yang manakah menunjukkan 52?','5 puluh dan 2 sa','2 puluh dan 5 sa','Susun puluh dahulu, kemudian sa.',{rep:'pictorial'}),make('D1.N100','Apakah nilai digit 7 dalam 72?','70','7','7 berada di tempat puluh.',{rep:'abstract'}),make('D1.N100','Tunjukkan 64 sebagai puluh + sa.','6 puluh dan 4 sa','4 puluh dan 6 sa','Enam kumpulan sepuluh dan empat sa.',{rep:'abstract'})]},
  {grade:2,skill:'D2.2.1',topic:'Tambah dengan kumpul semula',game:'bridge',key:'operation',hint:'Tambah sa dahulu. Jika cukup 10 sa, tukar menjadi 1 puluh.',explain:'6 sa + 7 sa = 13 sa; 13 sa ialah 1 puluh dan 3 sa, jadi 26 + 17 = 43.',qs:[
   make('D2.2.1','26 + 17 = ?','43','33','8 sa + 7 sa cukup untuk 1 puluh dan 5 sa.',{op:'add',regroup:true,rep:'concrete'}),make('D2.2.1','38 + 24 = ?','62','52','8 + 4 sa menghasilkan 12 sa; tukar 10 sa.',{op:'add',regroup:true,rep:'pictorial'}),make('D2.2.1','47 + 16 = ?','63','53','Jangan lupa puluh baharu selepas kumpul semula.',{op:'add',regroup:true,rep:'abstract'}),make('D2.2.1','59 + 23 = ?','82','72','9 + 3 = 12 sa, bawa 1 puluh.',{op:'add',regroup:true,rep:'pictorial'}),make('D2.2.1','68 + 15 = ?','83','73','Semak lajur sa, kemudian lajur puluh.',{op:'add',regroup:true,rep:'abstract'}),make('D2.2.1','76 + 18 = ?','94','84','6 + 8 = 14 sa; 4 sa dan 1 puluh.',{op:'add',regroup:true,rep:'abstract'})]},
  {grade:3,skill:'D3.FRAC',topic:'Pecahan setara',game:'cake',key:'fraction',hint:'Bahagian mesti sama besar. Jika penyebut didarab 2, pengangka juga didarab 2.',explain:'1/4 dan 2/8 menunjukkan bahagian yang sama kerana setiap suku dibelah dua.',qs:[
   make('D3.FRAC','1/4 = berapa per lapan?','2/8','1/8','Belah setiap satu suku kepada 2 bahagian sama.',{rep:'concrete'}),make('D3.FRAC','2/3 = berapa per enam?','4/6','2/6','Darab pengangka dan penyebut dengan 2.',{rep:'pictorial'}),make('D3.FRAC','3/5 = berapa per sepuluh?','6/10','3/10','Bilangan bahagian berubah, saiz keseluruhan kekal.',{rep:'abstract'}),make('D3.FRAC','4/7 = berapa per empat belas?','8/14','4/14','Penyebut 7 menjadi 14, jadi gandaan ialah 2.',{rep:'pictorial'}),make('D3.FRAC','2/5 = berapa per lima belas?','6/15','4/15','Darab kedua-duanya dengan 3.',{rep:'abstract'}),make('D3.FRAC','5/8 = berapa per enam belas?','10/16','5/16','Setiap lapan bahagian dibahagi dua.',{rep:'abstract'})]},
  {grade:4,skill:'D4.MEASURE',topic:'Penukaran unit ukuran',game:'measure',key:'measure',hint:'Unit mesti kekal jelas. 1 m = 100 cm dan 1 kg = 1000 g.',explain:'Tukar unit dengan hubungan sebenar, bukan meneka nombor; 3 m = 300 cm.',qs:[
   make('D4.MEASURE','3 m = berapa cm?','300 cm','30 cm','1 m ada 100 cm, jadi 3 m ada 300 cm.',{context:'measure',rep:'concrete'}),make('D4.MEASURE','450 cm = berapa m dan cm?','4 m 50 cm','45 m','Kumpulkan setiap 100 cm sebagai 1 m.',{context:'measure',rep:'pictorial'}),make('D4.MEASURE','2 kg = berapa g?','2000 g','200 g','1 kg bersamaan 1000 g.',{context:'measure',rep:'abstract'}),make('D4.MEASURE','1750 g = berapa kg dan g?','1 kg 750 g','17 kg 50 g','Ambil 1000 g dahulu sebagai 1 kg.',{context:'measure',rep:'pictorial'}),make('D4.MEASURE','5 L = berapa mL?','5000 mL','500 mL','1 L bersamaan 1000 mL.',{context:'measure',rep:'abstract'}),make('D4.MEASURE','3250 mL = berapa L dan mL?','3 L 250 mL','32 L 50 mL','Tukar 3000 mL kepada 3 L, baki 250 mL.',{context:'measure',rep:'abstract'})]},
  {grade:5,skill:'D5.DEC',topic:'Nilai tempat perpuluhan',game:'place',key:'place',hint:'Digit selepas titik ialah persepuluh, kemudian perseratus. Kekalkan nilai tempat.',explain:'Dalam 3.47, 4 bernilai 4 persepuluh dan 7 bernilai 7 perseratus.',qs:[
   make('D5.DEC','Dalam 3.47, digit 4 bernilai berapa?','0.4','4','Digit pertama selepas titik ialah persepuluh.',{context:'decimal',rep:'concrete'}),make('D5.DEC','0.6 = berapa perseratus?','60/100','6/100','Enam persepuluh sama dengan enam puluh perseratus.',{context:'decimal',rep:'pictorial'}),make('D5.DEC','2.35 + 0.40 = ?','2.75','2.39','Selaraskan titik perpuluhan dan tambah ikut nilai tempat.',{context:'decimal',op:'add',rep:'abstract'}),make('D5.DEC','4.8 − 1.25 = ?','3.55','3.65','Tulis 4.80 supaya perseratus sebaris.',{context:'decimal',op:'sub',rep:'pictorial'}),make('D5.DEC','Yang lebih besar: 0.7 atau 0.65?','0.7','0.65','0.7 ialah 0.70, lebih besar daripada 0.65.',{context:'decimal',rep:'abstract'}),make('D5.DEC','1.2 × 10 = ?','12','1.20','Darab 10 menggerakkan digit satu tempat ke kiri.',{context:'decimal',rep:'abstract'})]},
  {grade:6,skill:'D6.RATIO',topic:'Nisbah dan skala',game:'groups',key:'groups',hint:'Nisbah membandingkan dua kuantiti. Darab atau bahagi kedua-dua bahagian dengan faktor sama.',explain:'Nisbah 2:3 digandakan 2 menjadi 4:6; hubungan kedua-dua kuantiti kekal.',qs:[
   make('D6.RATIO','Nisbah merah kepada biru ialah 2:3. Jika merah 4, biru berapa?','6','5','2 menjadi 4 dengan darab 2; darab 3 dengan 2 juga.',{context:'ratio',rep:'concrete'}),make('D6.RATIO','3:5 = 12:?','20','15','3 didarab 4, jadi 5 juga didarab 4.',{context:'ratio',rep:'pictorial'}),make('D6.RATIO','Nisbah 4:7. Jumlah bahagian ialah?','11','28','Tambah bahagian nisbah, bukan darabnya.',{context:'ratio',rep:'abstract'}),make('D6.RATIO','Nisbah lelaki:perempuan 2:5, jumlah 21. Lelaki?','6','7','Jumlah bahagian 7; 21 ÷ 7 = 3, lelaki 2 × 3.',{context:'ratio',rep:'pictorial'}),make('D6.RATIO','5:8 = ?:24','15','13','8 menjadi 24 dengan darab 3.',{context:'ratio',rep:'abstract'}),make('D6.RATIO','Skala 1:100. 4 cm pada pelan ialah berapa cm sebenar?','400 cm','104 cm','Setiap 1 cm pada pelan mewakili 100 cm sebenar.',{context:'ratio',rep:'abstract'})]}
 ];
 const variation={
  'D1.PV100':[['25 ada berapa puluh dan sa?','2 puluh dan 5 sa','25 puluh'],['Dalam 63, digit 6 bernilai berapa?','60','6'],['48 = ___ puluh + 8 sa.','4','8'],['Yang manakah menunjukkan 71?','7 puluh dan 1 sa','1 puluh dan 7 sa'],['Nilai digit 9 dalam 94?','90','9'],['Tunjukkan 38 sebagai puluh + sa.','3 puluh dan 8 sa','8 puluh dan 3 sa']],
  'D2.2.1':[['35 + 28 = ?','63','53'],['46 + 27 = ?','73','63'],['58 + 16 = ?','74','64'],['67 + 25 = ?','92','82'],['79 + 14 = ?','93','83'],['86 + 19 = ?','105','95']],
  'D3.FRAC':[['1/3 = berapa per enam?','2/6','1/6'],['3/4 = berapa per lapan?','6/8','3/8'],['2/7 = berapa per empat belas?','4/14','2/14'],['4/5 = berapa per sepuluh?','8/10','4/10'],['3/8 = berapa per dua puluh empat?','9/24','6/24'],['5/6 = berapa per lapan belas?','15/18','10/18']],
  'D4.MEASURE':[['4 m = berapa cm?','400 cm','40 cm'],['625 cm = berapa m dan cm?','6 m 25 cm','62 m 5 cm'],['3 kg = berapa g?','3000 g','300 g'],['2250 g = berapa kg dan g?','2 kg 250 g','22 kg 50 g'],['7 L = berapa mL?','7000 mL','700 mL'],['4125 mL = berapa L dan mL?','4 L 125 mL','41 L 25 mL']],
  'D5.DEC':[['Dalam 5.28, digit 2 bernilai?','0.2','2'],['0.4 = berapa perseratus?','40/100','4/100'],['3.46 + 0.30 = ?','3.76','3.49'],['6.2 − 2.35 = ?','3.85','4.15'],['Yang lebih besar: 0.8 atau 0.73?','0.8','0.73'],['2.4 × 10 = ?','24','2.40']],
  'D6.RATIO':[['Nisbah hijau kepada kuning 3:4. Jika hijau 6, kuning?','8','7'],['4:7 = 12:?','21','19'],['Nisbah 5:6. Jumlah bahagian?','11','30'],['Nisbah 3:4, jumlah 28. Bahagian pertama?','12','14'],['7:9 = ?:27','21','18'],['Skala 1:50. 6 cm pada pelan ialah?','300 cm','56 cm']]
 };
 const scenarios=Object.fromEntries(rows.map(s=>{const follow=variation[s.skill].map((x,i)=>make(s.skill,x[0],x[1],x[2],s.hint,{...(s.qs[i].facets||{}),rep:i<2?'pictorial':'abstract'}));const slug=s.skill.toLowerCase().replace(/[^a-z0-9]+/g,'-');return [s.grade,{...s,misconception:'Bukti awal: semak nilai hubungan ini sebelum kembali kepada bentuk lazim.',questions:[...s.qs,...follow],script:[false,false,false,true,false,true],scriptSteps:[0,1,2,3,4,5].map((i)=>({label:['Lihat pola','Pilih hubungan','Tukar bentuk','Semak nilai','Cuba semula','Guna sendiri'][i],help:s.hint,visual:i<4?s.key:undefined})),miniGame:{title:s.topic,page:s.game,hash:'#jelajah-coach-'+slug},independent:follow.map(x=>({prompt:x.prompt,answer:x.answer}))}] }));
 const checks=[
  [['Nilai digit 5 dalam 56 ialah?',50,5],['97 mempunyai berapa puluh dan sa?','9 puluh dan 7 sa','7 puluh dan 9 sa'],['Nilai digit 8 dalam 82 ialah?',80,8],['69 mempunyai berapa puluh dan sa?','6 puluh dan 9 sa','9 puluh dan 6 sa']],
  [['28 + 16 = ?',44,34],['57 + 26 = ?',83,73],['37 + 18 = ?',55,45],['48 + 35 = ?',83,73]],
  [['2/5 = berapa per sepuluh?','4/10','2/10'],['3/7 = berapa per empat belas?','6/14','3/14'],['2/9 = berapa per lapan belas?','4/18','2/18'],['3/10 = berapa per dua puluh?','6/20','3/20']],
  [['6 m = berapa cm?','600 cm','60 cm'],['725 cm = berapa m dan cm?','7 m 25 cm','72 m 5 cm'],['8 m = berapa cm?','800 cm','80 cm'],['945 cm = berapa m dan cm?','9 m 45 cm','94 m 5 cm']],
  [['Dalam 6.382, digit 8 bernilai berapa?','0.08','0.8'],['4.560 + 0.300 = ?','4.860','4.563'],['Dalam 8.152, digit 5 bernilai berapa?','0.05','0.5'],['2.430 + 0.200 = ?','2.630','2.432']],
  [['Nisbah merah:biru 3:5. Jika merah 9, biru berapa?',15,11],['2:7 = 8:?',28,13],['Nisbah merah:biru 4:5. Jika merah 8, biru berapa?',10,9],['3:8 = 9:?',24,14]]
 ];
 const focus=[
  'Digit puluh dibaca sebagai sa, atau kedudukan puluh dan sa ditukar.',
  'Puluh baharu daripada 10 sa tertinggal semasa menambah.',
  'Penyebut berubah tetapi pengangka tidak berubah dengan faktor yang sama.',
  'Hubungan 1 m = 100 cm tersilap menjadi 10 cm.',
  'Nilai digit selepas titik dan penjajaran titik perpuluhan tertukar.',
  'Satu bahagian nisbah berubah tetapi bahagian lain tidak diskalakan bersama.'
 ];
 const pages=['gudang-harta','gudang-harta','kedai-kek','bengkel-ajaib','lombong-permata','dapur-ramuan'];
 const titles=['Gudang Harta Wira','Gudang Harta Wira','Kedai Kek','Bengkel Ajaib','Lombong Permata','Dapur Ramuan'];
 Object.values(scenarios).forEach((s,i)=>{
  s.questions=s.questions.map(q=>({...q,skill:s.skill}));s.key=['place','operation','fraction','measure','decimal','ratio'][i];s.misconception=focus[i];
  s.miniGame={title:titles[i],page:'preview/jelajah-game-'+pages[i]+'.html'};
  s.coachQuestions=checks[i].map(([p,a,w])=>make(s.skill,p,a,w,s.hint));
  s.independent=s.coachQuestions;
  s.scriptSteps=s.scriptSteps.map((x,n)=>({...x,label:['Kesilapan pertama','Soalan susulan','Pola yang berulang','Bantuan visual dan petunjuk','Latihan terarah','Pemulihan berjaya'][n]}));
 });
 scenarios[2].questions[0].hint='6 sa + 7 sa = 13 sa. Tukar 10 sa kepada 1 puluh; baki 3 sa.';
 // The chosen Bengkel mode is length conversion, so all examples retain that exact focus.
 scenarios[4].topic='Penukaran unit panjang';scenarios[4].hint='1 m = 100 cm. Kumpulkan setiap 100 cm sebagai 1 m.';
 const lengthRows=[['3 m = berapa cm?','300 cm','30 cm'],['450 cm = berapa m dan cm?','4 m 50 cm','45 m'],['2 m = berapa cm?','200 cm','20 cm'],['175 cm = berapa m dan cm?','1 m 75 cm','17 m 5 cm'],['5 m = berapa cm?','500 cm','50 cm'],['325 cm = berapa m dan cm?','3 m 25 cm','32 m 5 cm'],['4 m = berapa cm?','400 cm','40 cm'],['625 cm = berapa m dan cm?','6 m 25 cm','62 m 5 cm'],['1 m = berapa cm?','100 cm','10 cm'],['2 m 50 cm = berapa cm?','250 cm','70 cm'],['7 m = berapa cm?','700 cm','70 cm'],['412 cm = berapa m dan cm?','4 m 12 cm','41 m 2 cm']];
 scenarios[4].questions=lengthRows.map(x=>make('D4.MEASURE',...x,scenarios[4].hint));
 scenarios[4].questions[2]=make('D4.MEASURE','9 m = berapa cm?','900 cm','90 cm',scenarios[4].hint);
 const scaffold=[['Satu puluh bernilai berapa sa?',10,1],['8 + 5 = ?',13,3],['1/2 = berapa per empat?','2/4','1/4'],['2 m = berapa cm?','200 cm','20 cm'],['4/10 ditulis sebagai perpuluhan apa?','0.4','0.04'],['Nisbah 4:6 dalam bentuk mudah ialah?','2:3','2:6']];
 Object.values(scenarios).forEach((s,i)=>{
  s.questions[9]=make(s.skill,...scaffold[i],s.hint);
  s.coachMode=['place-basic','add','fraction','measure','decimal','ratio'][i];
 });
 const api={scenarios,get:grade=>scenarios[Number(grade)]||scenarios[1]};root.PAJelajahScenarios=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
