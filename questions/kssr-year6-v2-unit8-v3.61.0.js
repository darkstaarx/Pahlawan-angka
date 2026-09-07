// Year 6 Curriculum Bank v2 — Unit 8: Pengurusan Data dan Kebolehjadian
(function(){
'use strict';
const RT=window.PAY6V2Runtime;if(!RT)return;
const {GEN,Nq,choose,q,mark,chooseMode,bandModes,stage,pie,bag,table}=RT;

const pieSets=[
 [{label:'Bola',angle:144,value:24},{label:'Badminton',angle:108,value:18},{label:'Renang',angle:72,value:12},{label:'Larian',angle:36,value:6}],
 [{label:'Merah',angle:180,value:40},{label:'Biru',angle:90,value:20},{label:'Hijau',angle:54,value:12},{label:'Kuning',angle:36,value:8}],
 [{label:'Bas',angle:135,value:30},{label:'Kereta',angle:90,value:20},{label:'Berjalan',angle:81,value:18},{label:'Basikal',angle:54,value:12}]
];

GEN['8.1.1']=function(id,s){
 const mode=chooseMode(id,'8.1.1',bandModes(
  s,
  ['largest_sector','read_quantity','missing_angle','complete_label'],
  ['largest_sector','read_quantity','missing_angle','complete_label','infer_total','combine','compare'],
  ['infer_total','combine','compare','validate_chart','reverse_sector','claim','decision']
 ));
 const set=choose(pieSets);
 if(mode==='largest_sector'){
  const max=[...set].sort((a,b)=>b.angle-a.angle)[0];
  return mark(q(pie(set)+'Kategori dengan sektor paling besar?',max.label,[Nq(set[1].label,'pie'),Nq(set[2].label,'pie'),Nq(set[3].label,'pie')],'Sektor terbesar mewakili kuantiti terbesar.','Tahun 6 · Membaca Carta Pai'),id,'8.1.1',mode,'visual','concept',s,['pie_read']);
 }
 if(mode==='read_quantity'){
  const x=choose(set);
  return mark(q(pie(set)+'Jika jumlah data yang ditunjukkan mengikut nilai pada carta, berapakah kuantiti bagi '+x.label+'?',x.value,[Nq(x.angle,'pie'),Nq(x.value+10,'pie'),Nq(Math.max(1,x.value-5),'pie')],'Baca nilai kategori yang sepadan.','Tahun 6 · Kuantiti Carta Pai'),id,'8.1.1',mode,'visual',stage(s)===1?'concept':'application',s,['pie_quantity']);
 }
 if(mode==='missing_angle'){
  const known=choose([[120,90,60],[180,72,54],[135,81,54]]),ans=360-known.reduce((a,b)=>a+b,0);
  return mark(q('Tiga sektor carta pai berukuran '+known.join('°, ')+'°. Sudut sektor keempat?',ans+'°',[Nq((ans+30)+'°','pie_angle'),Nq((ans-30)+'°','pie_angle'),Nq('360°','pie_angle')],'Jumlah semua sektor carta pai ialah 360°.','Tahun 6 · Sudut Hilang Carta Pai'),id,'8.1.1',mode,'symbolic',stage(s)===3?'reasoning':'application',s,['pie_angle']);
 }
 if(mode==='complete_label'){
  return mark(q(pie([{label:'A',angle:180},{label:'B',angle:90},{label:'?',angle:54},{label:'D',angle:36}])+'Data asal: A=40, B=20, C=12, D=8. Label bagi sektor 54° ialah?','C',[Nq('A','pie'),Nq('B','pie'),Nq('D','pie')],'54° ialah 12/80 daripada 360°.','Tahun 6 · Melengkapkan Carta Pai'),id,'8.1.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['pie_complete']);
 }
 if(mode==='infer_total'){
  return mark(q(pie([{label:'A',angle:180,value:40},{label:'B',angle:90,value:20},{label:'C',angle:45,value:10},{label:'D',angle:45,value:10}])+'Sektor B 90° mewakili 20 murid. Jumlah murid?',80,[Nq(40,'pie_quantity'),Nq(90,'pie_angle'),Nq(100,'pie_quantity')],'90° ialah 1/4 bulatan.','Tahun 6 · Inferens Carta Pai'),id,'8.1.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['pie_quantity','inverse']);
 }
 if(mode==='combine'){
  return mark(q(pie([{label:'A',angle:180,value:40},{label:'B',angle:90,value:20},{label:'C',angle:45,value:10},{label:'D',angle:45,value:10}])+'Jika kategori C dan D digabung, sudut sektor baharu?', '90°',[Nq('45°','pie_angle'),Nq('180°','pie_angle'),Nq('20°','pie_angle')],'45° + 45° = 90°.','Tahun 6 · Menggabung Kategori Carta Pai'),id,'8.1.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['pie_angle','combine']);
 }
 if(mode==='compare'){
  return mark(q(pie(set)+'Kategori terbesar berapa kali ganda kategori terkecil berdasarkan sudut?',Math.round(Math.max(...set.map(x=>x.angle))/Math.min(...set.map(x=>x.angle))),[Nq(2,'pie'),Nq(3,'pie'),Nq(5,'pie')],'Banding sudut terbesar dengan sudut terkecil.','Tahun 6 · Membanding Sektor'),id,'8.1.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['pie_angle','compare']);
 }
 if(mode==='validate_chart'){
  return mark(q('Sebuah carta pai mempunyai sektor 180°, 90°, 60° dan 45°. Adakah carta itu lengkap?','tidak, jumlahnya 375°',[Nq('ya, jumlahnya 360°','pie_angle'),Nq('tidak, jumlahnya 315°','pie_angle'),Nq('tidak boleh ditentukan','pie_angle')],'Carta pai lengkap mesti berjumlah 360°.','Tahun 6 · Semak Carta Pai'),id,'8.1.1',mode,'verbal','reasoning',s,['pie_angle','error_analysis']);
 }
 if(mode==='reverse_sector'){
  return mark(q('Dalam carta pai 80 murid, 12 murid memilih Renang. Sudut sektor Renang?', '54°',[Nq('45°','pie_angle'),Nq('72°','pie_angle'),Nq('108°','pie_angle')],'12/80 × 360° = 54°.','Tahun 6 · Sudut daripada Kuantiti'),id,'8.1.1',mode,'story','reasoning',s,['pie_angle','inverse']);
 }
 if(mode==='claim'){
  return mark(q('Murid berkata sektor 90° sentiasa mewakili 90 orang. Penilaian?','salah, kuantiti bergantung pada jumlah data',[Nq('betul','pie'),Nq('salah, sektor 90° sentiasa 25 orang','pie'),Nq('tidak boleh dinilai','pie')],'90° ialah 1/4 daripada jumlah, bukan kuantiti tetap.','Tahun 6 · Menilai Carta Pai'),id,'8.1.1',mode,'verbal','reasoning',s,['pie_quantity','error_analysis']);
 }
 return mark(q(pie(set)+'Jika hanya satu kategori boleh dipilih untuk program utama, kategori mana paling disokong?',[...set].sort((a,b)=>b.angle-a.angle)[0].label,[Nq(set[1].label,'decision'),Nq(set[2].label,'decision'),Nq(set[3].label,'decision')],'Pilih sektor terbesar.','Tahun 6 · Keputusan daripada Carta Pai'),id,'8.1.1',mode,'visual','reasoning',s,['pie_read','decision']);
};

GEN['8.2.1']=function(id,s){
 const mode=chooseMode(id,'8.2.1',bandModes(
  s,
  ['certain','impossible','equal_coin'],
  ['certain','impossible','equal_coin','likely_bag','unlikely_bag'],
  ['likely_bag','unlikely_bag','language_order','claim','context_choice']
 ));
 if(mode==='certain')return mark(q('Sebuah beg hanya mengandungi guli merah. Memilih guli merah ialah peristiwa...', 'pasti',[Nq('mustahil','chance'),Nq('kecil kemungkinan','chance'),Nq('sama kemungkinan','chance')],'Semua hasil yang mungkin ialah merah.','Tahun 6 · Peristiwa Pasti'),id,'8.2.1',mode,'story','concept',s,['chance_category']);
 if(mode==='impossible')return mark(q('Dadu biasa bernombor 1 hingga 6. Mendapat nombor 8 ialah peristiwa...', 'mustahil',[Nq('pasti','chance'),Nq('besar kemungkinan','chance'),Nq('sama kemungkinan','chance')],'8 tidak terdapat pada dadu biasa.','Tahun 6 · Peristiwa Mustahil'),id,'8.2.1',mode,'story','concept',s,['chance_category']);
 if(mode==='equal_coin')return mark(q('Syiling adil dilambung. Peluang kepala berbanding ekor ialah...', 'sama kemungkinan',[Nq('kepala pasti','chance'),Nq('ekor mustahil','chance'),Nq('kepala besar kemungkinan','chance')],'Dua hasil seimbang.','Tahun 6 · Sama Kemungkinan'),id,'8.2.1',mode,'story',stage(s)===3?'reasoning':'application',s,['chance_category']);
 if(mode==='likely_bag')return mark(q(bag(8,2)+'Memilih guli merah paling tepat digambarkan sebagai...', 'besar kemungkinan',[Nq('mustahil','chance'),Nq('sama kemungkinan','chance'),Nq('pasti','chance')],'Merah lebih banyak tetapi bukan satu-satunya warna.','Tahun 6 · Besar Kemungkinan'),id,'8.2.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['chance_category']);
 if(mode==='unlikely_bag')return mark(q(bag(1,9)+'Memilih guli merah paling tepat digambarkan sebagai...', 'kecil kemungkinan',[Nq('pasti','chance'),Nq('sama kemungkinan','chance'),Nq('mustahil','chance')],'Merah ada, tetapi jauh lebih sedikit.','Tahun 6 · Kecil Kemungkinan'),id,'8.2.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['chance_category']);
 if(mode==='language_order')return mark(q('Susun daripada paling kurang kepada paling pasti: mustahil, kecil kemungkinan, sama kemungkinan, besar kemungkinan, pasti.','mustahil → kecil kemungkinan → sama kemungkinan → besar kemungkinan → pasti',[Nq('pasti → besar kemungkinan → sama kemungkinan → kecil kemungkinan → mustahil','chance'),Nq('mustahil → sama kemungkinan → kecil kemungkinan → besar kemungkinan → pasti','chance'),Nq('kecil kemungkinan → mustahil → sama kemungkinan → pasti → besar kemungkinan','chance')],'Gunakan skala bahasa kebolehjadian.','Tahun 6 · Susunan Kebolehjadian'),id,'8.2.1',mode,'verbal','reasoning',s,['chance_category','order']);
 if(mode==='claim')return mark(q('Beg ada 5 merah dan 5 biru. Murid berkata memilih merah ialah "besar kemungkinan". Penilaian?','salah, sama kemungkinan',[Nq('betul','chance'),Nq('salah, kecil kemungkinan','chance'),Nq('mustahil','chance')],'Bilangan merah dan biru sama.','Tahun 6 · Menilai Bahasa Kebolehjadian'),id,'8.2.1',mode,'verbal','reasoning',s,['chance_category','error_analysis']);
 return mark(q('Ramalan cuaca menyatakan peluang hujan sangat tinggi tetapi bukan 100%. Istilah paling sesuai?', 'besar kemungkinan',[Nq('pasti','chance'),Nq('mustahil','chance'),Nq('sama kemungkinan','chance')],'Sangat tinggi tetapi tidak pasti sepenuhnya.','Tahun 6 · Kebolehjadian dalam Konteks'),id,'8.2.1',mode,'story','reasoning',s,['chance_category','context']);
};

GEN['8.2.2']=function(id,s){
 const mode=chooseMode(id,'8.2.2',bandModes(
  s,
  ['compare_counts','equal_chance'],
  ['compare_counts','equal_chance','compare_different_totals','order_bags','explain'],
  ['compare_different_totals','order_bags','explain','equalize','claim','best_strategy']
 ));
 if(mode==='compare_counts')return mark(q(table(['Beg','Merah','Biru'],[['A',6,4],['B',3,7]])+'Beg mana lebih berkemungkinan menghasilkan guli merah?','Beg A',[Nq('Beg B','chance_reason'),Nq('sama kemungkinan','chance_reason'),Nq('mustahil kedua-duanya','chance_reason')],'A mempunyai 6/10 merah, B 3/10.','Tahun 6 · Membanding Kebolehjadian'),id,'8.2.2',mode,'table',stage(s)===1?'application':'application',s,['chance_reason']);
 if(mode==='equal_chance')return mark(q('Beg A ada 4 merah dan 4 biru. Beg B ada 8 merah dan 8 biru. Peluang memilih merah?', 'sama bagi kedua-dua beg',[Nq('lebih tinggi di A','chance_reason'),Nq('lebih tinggi di B','chance_reason'),Nq('mustahil dibanding','chance_reason')],'Kedua-duanya mempunyai separuh merah.','Tahun 6 · Kebolehjadian Setara'),id,'8.2.2',mode,'verbal',stage(s)===3?'reasoning':'application',s,['chance_reason','ratio']);
 if(mode==='compare_different_totals')return mark(q(table(['Beg','Merah','Jumlah'],[['A',4,10],['B',6,20]])+'Beg mana lebih berkemungkinan memberi merah?','Beg A',[Nq('Beg B','chance_reason'),Nq('sama kemungkinan','chance_reason'),Nq('tidak boleh dibanding','chance_reason')],'A=4/10=0.4; B=6/20=0.3.','Tahun 6 · Banding dengan Jumlah Berbeza'),id,'8.2.2',mode,'table',stage(s)===3?'reasoning':'application',s,['chance_reason','compare']);
 if(mode==='order_bags')return mark(q('Beg A: 1 merah/9 biru; B: 5/5; C: 9/1. Susun peluang merah daripada rendah ke tinggi.','A, B, C',[Nq('C, B, A','chance_reason'),Nq('B, A, C','chance_reason'),Nq('A, C, B','chance_reason')],'Banding bahagian merah setiap beg.','Tahun 6 · Susun Kebolehjadian'),id,'8.2.2',mode,'verbal',stage(s)===3?'reasoning':'application',s,['chance_reason','order']);
 if(mode==='explain')return mark(q('Beg mengandungi 7 merah dan 3 biru. Mengapa merah lebih berkemungkinan dipilih?','kerana bahagian merah 7/10 lebih besar daripada bahagian biru 3/10',[Nq('kerana merah sentiasa bertuah','chance_reason'),Nq('kerana warna merah pasti dipilih','chance_reason'),Nq('kerana jumlah warna ada dua','chance_reason')],'Banding bahagian setiap hasil.','Tahun 6 · Memberi Sebab Kebolehjadian'),id,'8.2.2',mode,'verbal',stage(s)===3?'reasoning':'application',s,['chance_reason']);
 if(mode==='equalize')return mark(q('Beg ada 4 merah dan 6 biru. Berapa guli merah perlu ditambah supaya merah dan biru sama kemungkinan?',2,[Nq(1,'chance_reason'),Nq(4,'chance_reason'),Nq(6,'chance_reason')],'Untuk sama kemungkinan, bilangan dua warna sama.','Tahun 6 · Mengubah Kebolehjadian'),id,'8.2.2',mode,'story','reasoning',s,['chance_reason','inverse']);
 if(mode==='claim')return mark(q('Beg A ada 6 merah daripada 10; Beg B ada 8 merah daripada 20. Murid kata B lebih baik sebab ada lebih banyak merah. Penilaian?','salah, A lebih berkemungkinan kerana 6/10 > 8/20',[Nq('betul','chance_reason'),Nq('salah, kedua-duanya sama','chance_reason'),Nq('tidak boleh dibanding','chance_reason')],'Banding nisbah, bukan bilangan merah sahaja.','Tahun 6 · Analisis Kebolehjadian'),id,'8.2.2',mode,'verbal','reasoning',s,['chance_reason','error_analysis']);
 return mark(q('Jika mahu peluang tertinggi memilih hadiah, pilih kotak A 3 hadiah/10 item, B 5/20, atau C 4/8?', 'Kotak C',[Nq('Kotak A','chance_reason'),Nq('Kotak B','chance_reason'),Nq('semua sama','chance_reason')],'Banding 0.3, 0.25 dan 0.5.','Tahun 6 · Strategi Kebolehjadian'),id,'8.2.2',mode,'story','reasoning',s,['chance_reason','decision']);
};

GEN['8.3.1']=function(id,s){
 const mode=chooseMode(id,'8.3.1',bandModes(
  s,
  ['largest_data','simple_chance','combine_data'],
  ['largest_data','simple_chance','combine_data','infer_total','decision','compare'],
  ['infer_total','decision','compare','claim','chance_from_data','threshold','multi_step']
 ));
 const set=choose(pieSets);
 if(mode==='largest_data'){
  const max=[...set].sort((a,b)=>b.value-a.value)[0];
  return mark(q(pie(set)+'Kategori dengan sokongan paling tinggi?',max.label,[Nq(set[1].label,'data'),Nq(set[2].label,'data'),Nq(set[3].label,'data')],'Cari sektor atau nilai terbesar.','Tahun 6 · Tafsir Data'),id,'8.3.1',mode,'visual','application',s,['data_reason']);
 }
 if(mode==='simple_chance')return mark(q('Data pilihan warna: Merah 40, Biru 20, Hijau 12, Kuning 8. Jika seorang dipilih rawak, warna pilihannya paling berkemungkinan?', 'Merah',[Nq('Biru','chance_reason'),Nq('Hijau','chance_reason'),Nq('Kuning','chance_reason')],'Kategori dengan frekuensi tertinggi lebih berkemungkinan.','Tahun 6 · Data dan Kebolehjadian'),id,'8.3.1',mode,'story','application',s,['data_reason','chance_reason']);
 if(mode==='combine_data')return mark(q(pie([{label:'A',angle:180,value:40},{label:'B',angle:90,value:20},{label:'C',angle:45,value:10},{label:'D',angle:45,value:10}])+'Jika C dan D digabung, jumlah murid kategori baharu?',20,[Nq(10,'data'),Nq(40,'data'),Nq(90,'data')],'10 + 10 = 20.','Tahun 6 · Menggabung Data'),id,'8.3.1',mode,'visual','application',s,['data_reason','combine']);
 if(mode==='infer_total')return mark(q('Sektor 45° mewakili 12 murid. Berapakah jumlah keseluruhan?',96,[Nq(48,'pie_quantity'),Nq(45,'pie_angle'),Nq(108,'pie_quantity')],'45° ialah 1/8 bulatan; 12×8.','Tahun 6 · Inferens Jumlah Data'),id,'8.3.1',mode,'story',stage(s)===3?'reasoning':'application',s,['data_reason','inverse']);
 if(mode==='decision'){
  const max=[...set].sort((a,b)=>b.value-a.value)[0];
  return mark(q(pie(set)+'Sekolah hanya boleh memilih satu aktiviti dengan sokongan paling ramai. Pilihan paling wajar?',max.label,[Nq(set[1].label,'decision'),Nq(set[2].label,'decision'),Nq(set[3].label,'decision')],'Gunakan data, bukan andaian.','Tahun 6 · Keputusan Berdasarkan Data'),id,'8.3.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['data_reason','decision']);
 }
 if(mode==='compare')return mark(q('Data menunjukkan A=40 murid dan B=20 murid. A berapa kali ganda B?',2,[Nq(1,'data_reason'),Nq(4,'data_reason'),Nq(20,'data_reason')],'40 ÷ 20 = 2.','Tahun 6 · Membanding Data'),id,'8.3.1',mode,'verbal',stage(s)===3?'reasoning':'application',s,['data_reason','compare']);
 if(mode==='claim')return mark(q(pie([{label:'A',angle:180,value:40},{label:'B',angle:90,value:20},{label:'C',angle:45,value:10},{label:'D',angle:45,value:10}])+'Murid mendakwa B dan C bersama-sama mengatasi A. Penilaian?','salah, B+C=30 kurang daripada A=40',[Nq('betul, B+C=50','data_reason'),Nq('betul kerana dua kategori sentiasa lebih besar','data_reason'),Nq('tidak boleh ditentukan','data_reason')],'Jumlahkan B dan C sebelum membanding.','Tahun 6 · Menilai Dakwaan Data'),id,'8.3.1',mode,'visual','reasoning',s,['data_reason','error_analysis']);
 if(mode==='chance_from_data')return mark(q('Daripada 80 murid, 40 memilih A, 20 B, 12 C, 8 D. Jika seorang dipilih rawak, peluang dia daripada A berbanding bukan A ialah?', 'sama kemungkinan',[Nq('A lebih berkemungkinan','chance_reason'),Nq('A kurang berkemungkinan','chance_reason'),Nq('A mustahil','chance_reason')],'A=40 dan bukan A=40.','Tahun 6 · Kebolehjadian daripada Data'),id,'8.3.1',mode,'story','reasoning',s,['data_reason','chance_reason']);
 if(mode==='threshold')return mark(q('A=40, B=20, C=10, D=10. Syarat pemilihan: sokongan mesti sekurang-kurangnya dua kali kategori kedua tertinggi. Yang layak?', 'A',[Nq('B','data_reason'),Nq('C','data_reason'),Nq('tiada','data_reason')],'A=40 dan kategori kedua B=20; 40 ialah dua kali 20.','Tahun 6 · Ambang Keputusan Data'),id,'8.3.1',mode,'story','reasoning',s,['data_reason','threshold']);
 return mark(q('Sektor A=180° mewakili 40 murid. Selepas 10 murid A berpindah ke B, A dan B masing-masing menjadi 30 murid. Apakah kebolehjadian memilih A berbanding B?', 'sama kemungkinan',[Nq('A lebih berkemungkinan','chance_reason'),Nq('B lebih berkemungkinan','chance_reason'),Nq('mustahil dibanding','chance_reason')],'Selepas perubahan, kedua-duanya 30.','Tahun 6 · Masalah Data Pelbagai Langkah'),id,'8.3.1',mode,'story','reasoning',s,['data_reason','chance_reason','multi_step']);
};

document.documentElement?.setAttribute('data-y6-v2-unit8','3.61.0');
})();