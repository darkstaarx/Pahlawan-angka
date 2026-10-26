/* Fixed demonstration content. No assessment, mastery, storage or learner routing. */
((root)=>{
 'use strict';
 const rows=[
  ['D1.ADD','Tambah: cukupkan sepuluh','bridge','8 + 5',13,12,'9 + 4',13,12,'Cukupkan 10 dahulu, kemudian tambah baki.','9 + 4 = 10 + 3 = 13.'],
  ['D2.DIV','Bahagi: kumpulan sama banyak','supply','12 bekalan dikongsi sama banyak antara 3 Teman. Setiap Teman mendapat berapa?',4,3,'15 bekalan dikongsi sama banyak antara 3 Teman. Setiap Teman mendapat berapa?',5,3,'Bezakan bilangan Teman dengan bekalan setiap Teman.','15 ÷ 3 = 5 bekalan setiap Teman.'],
  ['D3.MONEY','Wang: baki bayaran','market','Harga RM7, bayar RM10. Berapakah baki (RM)?',3,17,'Harga RM8, bayar RM12. Berapakah baki (RM)?',4,20,'Baki ialah beza antara bayaran dengan harga.','RM8 + RM4 = RM12. Baki RM4.'],
  ['D4.FRAC','Pecahan setara','cake','1/4 = berapa per lapan? Isi pengangka.',2,1,'3/4 = berapa per lapan? Isi pengangka.',6,3,'Bahagian mesti sama besar; kek asal kekal sama.','3/4 = 6/8; darab pengangka dan penyebut dengan 2.'],
  ['D5.MUL','Darab: sifat agihan','garden','4 × 6 = (4 × 5) + (4 × berapa)?',1,6,'3 × 7 = (3 × 5) + (3 × berapa)?',2,7,'Bilangan baris yang sama mesti digunakan pada kedua-dua bahagian.','3 × 7 = 3 × 5 + 3 × 2 = 21.'],
  ['D6.SHAPE','Simetri: paksi dan putaran','symmetry','Segi empat tepat bukan segi empat sama mempunyai berapa paksi simetri?',2,4,'Segi empat tepat bukan segi empat sama diputar 30°. Berapa paksi simetrinya?',2,4,'Putaran tidak menambah paksi; uji sama ada kedua-dua belah bertindih.','Masih 2 paksi. Pepenjuru tidak membuat kedua-dua bahagian bertindih.']
 ];
 const make=(skill,prompt,answer,wrong,hint)=>({skill,prompt,answer:String(answer),wrong:[{v:String(wrong),tag:'simulated-misconception'},{v:String(Number(answer)+11),tag:'other'}],hint});
 const scenarios=Object.fromEntries(rows.map((r,i)=>{
  const [skill,topic,game,p,a,w,p2,a2,w2,hint,explain]=r;
  const basic=make(skill,p,a,w,hint),transfer=make(skill,p2,a2,w2,hint);
  return [i+1,{grade:i+1,skill,topic,game,hint,explain,questions:Array.from({length:12},(_,n)=>({...((n%2)?transfer:basic)})),script:[false,false,false,true,false,true],
   transfer:{...transfer,prompt:p2.replace('Isi pengangka.','Nyatakan pengangka sahaja.')},
   remediation:'Contoh pemulihan asas yang ditetapkan untuk demo Darjah '+(i+1)+'. Bukan keputusan penilaian anak.'}];
 }));
 // Independent prompts never appear in the battle script. After support, use a new item.
 const independent=[
  [['7 + 6 = ?',13],['6 + 7 = ?',13],['9 + 7 = ?',16],['8 + 6 = ?',14]],
  [['18 pensel dikongsi sama banyak antara 3 murid. Berapa pensel setiap murid?',6],['20 bekalan dikongsi antara 4 Teman sama banyak. Berapa setiap Teman?',5],['21 biji guli dikongsi antara 3 murid sama banyak. Berapa setiap murid?',7],['24 pelekat dikongsi antara 4 murid sama banyak. Berapa setiap murid?',6]],
  [['Harga RM9, bayar RM15. Berapa baki (RM)?',6],['Harga RM13, bayar RM20. Berapa baki (RM)?',7],['Harga RM11, bayar RM20. Berapa baki (RM)?',9],['Harga RM14, bayar RM20. Berapa baki (RM)?',6]],
  [['2/3 = berapa per sembilan? Nyatakan pengangka.',6],['2/5 = berapa per sepuluh? Nyatakan pengangka.',4],['3/5 = berapa per lima belas? Nyatakan pengangka.',9],['2/7 = berapa per empat belas? Nyatakan pengangka.',4]],
  [['5 × 8 = (5 × 5) + (5 × berapa)?',3],['6 × 9 = (6 × 5) + (6 × berapa)?',4],['7 × 8 = (7 × 5) + (7 × berapa)?',3],['8 × 9 = (8 × 5) + (8 × berapa)?',4]],
  [['Satu papan tanda segi empat tepat bukan segi empat sama diputar 60°. Berapa paksi simetrinya?',2],['Satu pintu segi empat tepat bukan segi empat sama diputar 90°. Berapa paksi simetrinya?',2],['Satu kad segi empat tepat bukan segi empat sama diputar 120°. Berapa paksi simetrinya?',2],['Satu tingkap segi empat tepat bukan segi empat sama diputar 45°. Berapa paksi simetrinya?',2]]
 ];
 const diagnostics=[
  ['Untuk cukupkan 9 kepada 10, berapa unit perlu diambil daripada nombor yang ditambah?',['1 unit','Semua unit'],0,'Kita lengkapkan satu kumpulan sepuluh dahulu.','Garis nombor: 9 → (+1) 10 → (+3) 13. Lompatan kecil dan baki bersama-sama mewakili tambah 4.'],
  ['Apabila 12 bekalan dikongsi antara 3 Teman, nombor 3 mengira apa?',['Bilangan Teman','Bekalan setiap Teman'],0,'Bilangan kumpulan berbeza daripada isi setiap kumpulan.','Jadual agihan: Teman A | B | C; agihan pusingan 1: 1 | 1 | 1; pusingan 2: 2 | 2 | 2. Enam bekalan sudah diagih. Teruskan sama banyak sehingga 12.'],
  ['Baki dicari dengan hubungan yang mana?',['Harga + baki = bayaran','Harga + bayaran = baki'],0,'Bayaran merangkumi harga dan wang yang dipulangkan.','Model bar: satu bar bayaran RM10 dipecah kepada harga RM7 dan bahagian baki. Bahagian baki melengkapkan keseluruhan RM10.'],
  ['Jika setiap bahagian kek dibelah dua, apa terjadi kepada saiz kek asal?',['Kekal sama','Menjadi dua kali ganda'],0,'Kita menambah bilangan potongan, bukan menambah kek.','Garis nombor yang sama dari 0 hingga 1: tanda 1/2 di tengah. Membahagi setiap separuh kepada dua menghasilkan 2/4 pada titik tengah yang sama.'],
  ['Jika setiap baris dipecah kepada 5 + 2 pokok, adakah kedua-dua bahagian masih mempunyai bilangan baris yang sama?',['Ya, baris kekal sama','Tidak, hanya bahagian pertama'],0,'Kedua-dua bahagian datang daripada setiap baris yang sama.','Penambahan berulang: 7 + 7 + 7 = (5 + 2) + (5 + 2) + (5 + 2). Kumpulkan semua 5 dan semua 2 tanpa kehilangan sebarang pokok.'],
  ['Apakah ujian sebenar bagi satu paksi simetri?',['Kedua-dua belah bertindih tepat selepas dilipat','Garis menghubungkan dua bucu'],0,'Garis pepenjuru tidak semestinya garis lipatan simetri.','Cuba dengan kertas berbentuk pintu: lipat tepi kiri ke kanan dan atas ke bawah. Kemudian cuba lipatan bucu ke bucu. Tepi panjang dan tepi pendek tidak bertindih pada lipatan pepenjuru.']
 ];
 const scaffolds=[['8 + 2 = ?',10,9],['6 bekalan dikongsi antara 3 Teman sama banyak. Berapa setiap Teman?',2,3],['Harga RM2, bayar RM5. Berapa baki (RM)?',3,7],['1/2 = berapa per empat? Nyatakan pengangka.',2,1],['2 × 6 = (2 × 5) + (2 × berapa)?',1,6],['Kertas segi empat tepat bukan segi empat sama belum diputar. Berapa paksi simetrinya?',2,4]];
 Object.values(scenarios).forEach((s,i)=>{
  s.independent=independent[i].map(([prompt,answer])=>({prompt,answer:String(answer)}));
  s.transfer=s.independent[0];
  const [question,choices,answer,feedback,alternative]=diagnostics[i];
  s.diagnostic={question,choices,answer,feedback,alternative};
  // The two errors are followed by a deliberately smaller scaffold, then a parallel retry.
  s.questions[6]={...s.questions[1]};s.questions[7]={...s.questions[1]};
  s.questions[8]=make(s.skill,...scaffolds[i],'Model asas: '+s.hint);
  s.questions[9]={...s.questions[8]};
 });
 const api={scenarios,get:grade=>scenarios[grade]||scenarios[1]};
 root.PAJelajahScenarios=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
