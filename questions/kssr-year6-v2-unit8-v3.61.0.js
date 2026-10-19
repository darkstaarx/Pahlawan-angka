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
  return mark(q(pie(set)+'Kategori manakah yang mempunyai sektor paling besar?',max.label,[Nq(set[1].label,'pie'),Nq(set[2].label,'pie'),Nq(set[3].label,'pie')],'Sektor terbesar mewakili kuantiti terbesar.','Tahun 6 · Membaca Carta Pai'),id,'8.1.1',mode,'visual','concept',s,['pie_read']);
 }
 if(mode==='read_quantity'){
  const x=choose(set);
  return mark(q(pie(set,{showValues:true})+'Berapakah bilangan bagi kategori '+x.label+'?',x.value,[Nq(x.angle,'pie'),Nq(x.value+10,'pie'),Nq(Math.max(1,x.value-5),'pie')],'Baca nilai kategori yang sepadan.','Tahun 6 · Kuantiti Carta Pai'),id,'8.1.1',mode,'visual',stage(s)===1?'concept':'application',s,['pie_quantity']);
 }
 if(mode==='missing_angle'){
  const known=choose([[120,90,60],[180,72,54],[135,81,54]]),ans=360-known.reduce((a,b)=>a+b,0);
  return mark(q('Tiga sektor sebuah carta pai berukuran '+known.join('°, ')+'°. Hitung sudut sektor yang keempat.',ans+'°',[Nq((ans+30)+'°','pie_angle'),Nq((ans-30)+'°','pie_angle'),Nq('360°','pie_angle')],'Jumlah semua sektor carta pai ialah 360°.','Tahun 6 · Sudut Hilang Carta Pai'),id,'8.1.1',mode,'symbolic',stage(s)===3?'reasoning':'application',s,['pie_angle']);
 }
 if(mode==='complete_label'){
  return mark(q(pie([{label:'A',angle:180},{label:'B',angle:90},{label:'?',angle:54},{label:'D',angle:36}])+'Data asal: A = 40, B = 20, C = 12, D = 8. Sektor 54° mewakili kategori yang mana?','C',[Nq('A','pie'),Nq('B','pie'),Nq('D','pie')],'54° ialah 12/80 daripada 360°.','Tahun 6 · Melengkapkan Carta Pai'),id,'8.1.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['pie_complete']);
 }
 if(mode==='infer_total'){
  return mark(q(pie([{label:'A',angle:180,value:40},{label:'B',angle:90,value:20},{label:'C',angle:45,value:10},{label:'D',angle:45,value:10}])+'Sektor B (90°) mewakili 20 orang murid. Berapakah jumlah murid semuanya?',80,[Nq(40,'pie_quantity'),Nq(90,'pie_angle'),Nq(100,'pie_quantity')],'90° ialah 1/4 bulatan.','Tahun 6 · Inferens Carta Pai'),id,'8.1.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['pie_quantity','inverse']);
 }
 if(mode==='combine'){
  return mark(q(pie([{label:'A',angle:180,value:40},{label:'B',angle:90,value:20},{label:'C',angle:45,value:10},{label:'D',angle:45,value:10}])+'Jika kategori C dan D digabungkan, berapakah sudut sektor yang baharu?', '90°',[Nq('45°','pie_angle'),Nq('180°','pie_angle'),Nq('20°','pie_angle')],'45° + 45° = 90°.','Tahun 6 · Menggabung Kategori Carta Pai'),id,'8.1.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['pie_angle','combine']);
 }
 if(mode==='compare'){
  const ratio=Math.max(...set.map(x=>x.angle))/Math.min(...set.map(x=>x.angle));
  const ans=Number.isInteger(ratio)?ratio:Number(ratio.toFixed(2));
  const wrong=[ans+1,Math.max(1,ans-1),Number((ans*2).toFixed(2))].filter((v,i,a)=>v!==ans&&a.indexOf(v)===i).slice(0,3).map(v=>Nq(v,'pie'));
  return mark(q(pie(set)+'Sudut sektor kategori terbesar ialah berapa kali sudut sektor kategori terkecil?',ans,wrong,'Bahagi sudut terbesar dengan sudut terkecil.','Tahun 6 · Membanding Sektor'),id,'8.1.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['pie_angle','compare']);
 }
 if(mode==='validate_chart'){
  return mark(q('Sebuah carta pai mempunyai sektor 180°, 90°, 60° dan 45°. Adakah carta itu lengkap?','tidak, jumlahnya 375°',[Nq('ya, jumlahnya 360°','pie_angle'),Nq('tidak, jumlahnya 315°','pie_angle'),Nq('tidak boleh ditentukan','pie_angle')],'Carta pai lengkap mesti berjumlah 360°.','Tahun 6 · Semak Carta Pai'),id,'8.1.1',mode,'verbal','reasoning',s,['pie_angle','error_analysis']);
 }
 if(mode==='reverse_sector'){
  return mark(q('Sebuah carta pai mewakili 80 orang murid. Seramai 12 orang murid memilih renang. Hitung sudut sektor renang.', '54°',[Nq('45°','pie_angle'),Nq('72°','pie_angle'),Nq('108°','pie_angle')],'12/80 × 360° = 54°.','Tahun 6 · Sudut daripada Kuantiti'),id,'8.1.1',mode,'story','reasoning',s,['pie_angle','inverse']);
 }
 if(mode==='claim'){
  return mark(q('Murid berkata sektor 90° sentiasa mewakili 90 orang. Adakah kenyataan itu betul?','salah, kuantiti bergantung pada jumlah data',[Nq('betul','pie'),Nq('salah, sektor 90° sentiasa 25 orang','pie'),Nq('tidak boleh dinilai','pie')],'90° ialah 1/4 daripada jumlah, bukan kuantiti tetap.','Tahun 6 · Menilai Carta Pai'),id,'8.1.1',mode,'verbal','reasoning',s,['pie_quantity','error_analysis']);
 }
 return mark(q(pie(set)+'Hanya satu kategori boleh dipilih untuk program utama. Kategori manakah yang paling ramai menyokong?',[...set].sort((a,b)=>b.angle-a.angle)[0].label,[Nq(set[1].label,'decision'),Nq(set[2].label,'decision'),Nq(set[3].label,'decision')],'Pilih sektor terbesar.','Tahun 6 · Keputusan daripada Carta Pai'),id,'8.1.1',mode,'visual','reasoning',s,['pie_read','decision']);
};

GEN['8.2.1']=function(id,s){
 const mode=chooseMode(id,'8.2.1',bandModes(
  s,
  ['certain','impossible','equal_coin'],
  ['certain','impossible','equal_coin','likely_bag','unlikely_bag'],
  ['likely_bag','unlikely_bag','language_order','claim','context_choice']
 ));
 if(mode==='certain')return mark(q('Sebuah beg hanya mengandungi guli merah. Memilih guli merah ialah peristiwa...', 'pasti',[Nq('mustahil','chance'),Nq('kurang berkemungkinan','chance'),Nq('sama berkemungkinan','chance')],'Semua hasil yang mungkin ialah merah.','Tahun 6 · Peristiwa Pasti'),id,'8.2.1',mode,'story','concept',s,['chance_category']);
 if(mode==='impossible')return mark(q('Dadu biasa bernombor 1 hingga 6. Mendapat nombor 8 ialah peristiwa...', 'mustahil',[Nq('pasti','chance'),Nq('lebih berkemungkinan','chance'),Nq('sama berkemungkinan','chance')],'8 tidak terdapat pada dadu biasa.','Tahun 6 · Peristiwa Mustahil'),id,'8.2.1',mode,'story','concept',s,['chance_category']);
 if(mode==='equal_coin')return mark(q('Sekeping syiling dilambung. Kemungkinan mendapat kepala berbanding ekor ialah...', 'sama berkemungkinan',[Nq('kepala pasti','chance'),Nq('ekor mustahil','chance'),Nq('kepala lebih berkemungkinan','chance')],'Dua hasil seimbang.','Tahun 6 · Sama Berkemungkinan'),id,'8.2.1',mode,'story',stage(s)===3?'reasoning':'application',s,['chance_category']);
 if(mode==='likely_bag')return mark(q(bag(8,2)+'Sebiji guli diambil tanpa melihat. Pilih perkataan yang sesuai untuk kemungkinan guli itu berwarna merah.', 'lebih berkemungkinan',[Nq('mustahil','chance'),Nq('sama berkemungkinan','chance'),Nq('pasti','chance')],'Merah lebih banyak tetapi bukan satu-satunya warna.','Tahun 6 · Lebih Berkemungkinan'),id,'8.2.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['chance_category']);
 if(mode==='unlikely_bag')return mark(q(bag(1,9)+'Sebiji guli diambil tanpa melihat. Pilih perkataan yang sesuai untuk kemungkinan guli itu berwarna merah.', 'kurang berkemungkinan',[Nq('pasti','chance'),Nq('sama berkemungkinan','chance'),Nq('mustahil','chance')],'Merah ada, tetapi jauh lebih sedikit.','Tahun 6 · Kurang Berkemungkinan'),id,'8.2.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['chance_category']);
 if(mode==='language_order')return mark(q('Susun daripada paling kurang kepada paling pasti: mustahil, kurang berkemungkinan, sama berkemungkinan, lebih berkemungkinan, pasti.','mustahil → kurang berkemungkinan → sama berkemungkinan → lebih berkemungkinan → pasti',[Nq('pasti → lebih berkemungkinan → sama berkemungkinan → kurang berkemungkinan → mustahil','chance'),Nq('mustahil → sama berkemungkinan → kurang berkemungkinan → lebih berkemungkinan → pasti','chance'),Nq('kurang berkemungkinan → mustahil → sama berkemungkinan → pasti → lebih berkemungkinan','chance')],'Gunakan skala bahasa kebolehjadian.','Tahun 6 · Susunan Kebolehjadian'),id,'8.2.1',mode,'verbal','reasoning',s,['chance_category','order']);
 if(mode==='claim')return mark(q('Sebuah beg ada 5 guli merah dan 5 guli biru. Hana berkata memilih guli merah adalah "lebih berkemungkinan". Adakah Hana betul?','salah, sama berkemungkinan',[Nq('betul','chance'),Nq('salah, kurang berkemungkinan','chance'),Nq('mustahil','chance')],'Bilangan merah dan biru sama.','Tahun 6 · Menilai Bahasa Kebolehjadian'),id,'8.2.1',mode,'verbal','reasoning',s,['chance_category','error_analysis']);
 return mark(q('Ramalan cuaca menyatakan hujan sangat mungkin turun esok, tetapi tidak pasti. Perkataan manakah yang paling sesuai untuk kemungkinan hujan turun esok?', 'lebih berkemungkinan',[Nq('pasti','chance'),Nq('mustahil','chance'),Nq('sama berkemungkinan','chance')],'Sangat tinggi tetapi tidak pasti sepenuhnya.','Tahun 6 · Kebolehjadian dalam Konteks'),id,'8.2.1',mode,'story','reasoning',s,['chance_category','context']);
};

GEN['8.2.2']=function(id,s){
 const mode=chooseMode(id,'8.2.2',bandModes(
  s,
  ['compare_counts','equal_chance'],
  ['compare_counts','equal_chance','compare_different_totals','order_bags','explain'],
  ['compare_different_totals','order_bags','explain','equalize','claim','best_strategy']
 ));
 if(mode==='compare_counts')return mark(q(table(['Beg','Merah','Biru'],[['A',6,4],['B',3,7]])+'Beg manakah lebih berkemungkinan memberi guli merah?','Beg A',[Nq('Beg B','chance_reason'),Nq('sama berkemungkinan','chance_reason'),Nq('mustahil kedua-duanya','chance_reason')],'A mempunyai 6/10 merah, B 3/10.','Tahun 6 · Membanding Kebolehjadian'),id,'8.2.2',mode,'table',stage(s)===1?'application':'application',s,['chance_reason']);
 if(mode==='equal_chance')return mark(q('Beg A ada 4 guli merah dan 4 guli biru. Beg B ada 8 guli merah dan 8 guli biru. Beg manakah lebih berkemungkinan memberi guli merah?', 'sama bagi kedua-dua beg',[Nq('lebih tinggi di A','chance_reason'),Nq('lebih tinggi di B','chance_reason'),Nq('mustahil dibanding','chance_reason')],'Kedua-duanya mempunyai separuh merah.','Tahun 6 · Kebolehjadian Setara'),id,'8.2.2',mode,'verbal',stage(s)===3?'reasoning':'application',s,['chance_reason','ratio']);
 if(mode==='compare_different_totals')return mark(q(table(['Beg','Merah','Jumlah'],[['A',4,10],['B',6,20]])+'Beg manakah lebih berkemungkinan memberi guli merah?','Beg A',[Nq('Beg B','chance_reason'),Nq('sama berkemungkinan','chance_reason'),Nq('tidak boleh dibanding','chance_reason')],'A=4/10=0.4; B=6/20=0.3.','Tahun 6 · Banding dengan Jumlah Berbeza'),id,'8.2.2',mode,'table',stage(s)===3?'reasoning':'application',s,['chance_reason','compare']);
 if(mode==='order_bags')return mark(q('Beg A: 1 guli merah, 9 guli biru. Beg B: 5 merah, 5 biru. Beg C: 9 merah, 1 biru. Susun beg daripada paling kurang kepada paling berkemungkinan memberi guli merah.','A, B, C',[Nq('C, B, A','chance_reason'),Nq('B, A, C','chance_reason'),Nq('A, C, B','chance_reason')],'Banding bahagian merah setiap beg.','Tahun 6 · Susun Kebolehjadian'),id,'8.2.2',mode,'verbal',stage(s)===3?'reasoning':'application',s,['chance_reason','order']);
 if(mode==='explain')return mark(q('Sebuah beg mengandungi 7 guli merah dan 3 guli biru. Sebiji guli diambil tanpa melihat. Mengapakah guli merah lebih berkemungkinan dipilih?','kerana bahagian merah 7/10 lebih besar daripada bahagian biru 3/10',[Nq('kerana merah sentiasa bertuah','chance_reason'),Nq('kerana warna merah pasti dipilih','chance_reason'),Nq('kerana jumlah warna ada dua','chance_reason')],'Banding bahagian setiap hasil.','Tahun 6 · Memberi Sebab Kebolehjadian'),id,'8.2.2',mode,'verbal',stage(s)===3?'reasoning':'application',s,['chance_reason']);
 if(mode==='equalize')return mark(q('Sebuah beg ada 4 guli merah dan 6 guli biru. Berapakah bilangan guli merah yang perlu ditambah supaya memilih guli merah dan guli biru sama berkemungkinan?',2,[Nq(1,'chance_reason'),Nq(4,'chance_reason'),Nq(6,'chance_reason')],'Untuk sama berkemungkinan, bilangan dua warna sama.','Tahun 6 · Mengubah Kebolehjadian'),id,'8.2.2',mode,'story','reasoning',s,['chance_reason','inverse']);
 if(mode==='claim')return mark(q('Beg A ada 6 guli merah daripada 10 guli. Beg B ada 8 guli merah daripada 20 guli. Lina kata Beg B lebih berkemungkinan memberi guli merah. Adakah Lina betul?','salah, A lebih berkemungkinan kerana 6/10 > 8/20',[Nq('betul','chance_reason'),Nq('salah, kedua-duanya sama','chance_reason'),Nq('tidak boleh dibanding','chance_reason')],'Banding nisbah, bukan bilangan merah sahaja.','Tahun 6 · Analisis Kebolehjadian'),id,'8.2.2',mode,'verbal','reasoning',s,['chance_reason','error_analysis']);
 return mark(q('Kotak A: 3 hadiah daripada 10 bungkusan. Kotak B: 5 daripada 20. Kotak C: 4 daripada 8. Kotak manakah paling berkemungkinan memberi hadiah?', 'Kotak C',[Nq('Kotak A','chance_reason'),Nq('Kotak B','chance_reason'),Nq('semua sama','chance_reason')],'Banding 0.3, 0.25 dan 0.5.','Tahun 6 · Strategi Kebolehjadian'),id,'8.2.2',mode,'story','reasoning',s,['chance_reason','decision']);
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
  return mark(q(pie(set)+'Kategori manakah yang mendapat sokongan paling tinggi?',max.label,[Nq(set[1].label,'data'),Nq(set[2].label,'data'),Nq(set[3].label,'data')],'Cari sektor atau nilai terbesar.','Tahun 6 · Tafsir Data'),id,'8.3.1',mode,'visual','application',s,['data_reason']);
 }
 if(mode==='simple_chance')return mark(q('Data pilihan warna: Merah 40, Biru 20, Hijau 12, Kuning 8. Seorang murid dipilih secara rawak. Warna manakah yang paling berkemungkinan menjadi pilihannya?', 'Merah',[Nq('Biru','chance_reason'),Nq('Hijau','chance_reason'),Nq('Kuning','chance_reason')],'Kategori dengan frekuensi tertinggi lebih berkemungkinan.','Tahun 6 · Data dan Kebolehjadian'),id,'8.3.1',mode,'story','application',s,['data_reason','chance_reason']);
 if(mode==='combine_data')return mark(q(pie([{label:'A',angle:180,value:40},{label:'B',angle:90,value:20},{label:'C',angle:45,value:10},{label:'D',angle:45,value:10}])+'Jika kategori C dan D digabungkan, berapakah bilangan murid dalam kategori baharu itu?',20,[Nq(10,'data'),Nq(40,'data'),Nq(90,'data')],'10 + 10 = 20.','Tahun 6 · Menggabung Data'),id,'8.3.1',mode,'visual','application',s,['data_reason','combine']);
 if(mode==='infer_total')return mark(q('Dalam sebuah carta pai, sektor 45° mewakili 12 orang murid. Berapakah jumlah murid semuanya?',96,[Nq(48,'pie_quantity'),Nq(45,'pie_angle'),Nq(108,'pie_quantity')],'45° ialah 1/8 bulatan; 12×8.','Tahun 6 · Inferens Jumlah Data'),id,'8.3.1',mode,'story',stage(s)===3?'reasoning':'application',s,['data_reason','inverse']);
 if(mode==='decision'){
  const max=[...set].sort((a,b)=>b.value-a.value)[0];
  return mark(q(pie(set)+'Sekolah hanya boleh memilih satu aktiviti yang paling ramai disokong. Aktiviti manakah yang patut dipilih?',max.label,[Nq(set[1].label,'decision'),Nq(set[2].label,'decision'),Nq(set[3].label,'decision')],'Gunakan data, bukan andaian.','Tahun 6 · Keputusan Berdasarkan Data'),id,'8.3.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['data_reason','decision']);
 }
 if(mode==='compare')return mark(q('Seramai 40 orang murid memilih A dan 20 orang murid memilih B. Bilangan murid yang memilih A ialah berapa kali bilangan murid yang memilih B?',2,[Nq(1,'data_reason'),Nq(4,'data_reason'),Nq(20,'data_reason')],'40 ÷ 20 = 2.','Tahun 6 · Membanding Data'),id,'8.3.1',mode,'verbal',stage(s)===3?'reasoning':'application',s,['data_reason','compare']);
 if(mode==='claim')return mark(q(pie([{label:'A',angle:180,value:40},{label:'B',angle:90,value:20},{label:'C',angle:45,value:10},{label:'D',angle:45,value:10}])+'Aiman berkata jumlah B dan C lebih banyak daripada A. Adakah Aiman betul?','salah, B+C=30 kurang daripada A=40',[Nq('betul, B+C=50','data_reason'),Nq('betul kerana dua kategori sentiasa lebih besar','data_reason'),Nq('tidak boleh ditentukan','data_reason')],'Jumlahkan B dan C sebelum membanding.','Tahun 6 · Menilai Dakwaan Data'),id,'8.3.1',mode,'visual','reasoning',s,['data_reason','error_analysis']);
 if(mode==='chance_from_data')return mark(q('40 murid memilih A, 20 memilih B, 12 memilih C dan 8 memilih D. Seorang murid dipilih secara rawak. Bandingkan kemungkinan dia memilih A dengan tidak memilih A.', 'sama berkemungkinan',[Nq('memilih A lebih berkemungkinan','chance_reason'),Nq('memilih A kurang berkemungkinan','chance_reason'),Nq('memilih A mustahil','chance_reason')],'A=40 dan bukan A=40.','Tahun 6 · Kebolehjadian daripada Data'),id,'8.3.1',mode,'story','reasoning',s,['data_reason','chance_reason']);
 if(mode==='threshold')return mark(q('Sokongan: A = 40, B = 20, C = 10, D = 10. Kategori layak jika sokongannya sekurang-kurangnya dua kali kategori kedua tertinggi. Kategori manakah layak?', 'A',[Nq('B','data_reason'),Nq('C','data_reason'),Nq('tiada','data_reason')],'A=40 dan kategori kedua B=20; 40 ialah dua kali 20.','Tahun 6 · Ambang Keputusan Data'),id,'8.3.1',mode,'story','reasoning',s,['data_reason','threshold']);
 return mark(q('40 murid memilih A dan 20 murid memilih B. Kemudian, 10 murid bertukar dari A ke B. Seorang murid dipilih secara rawak. Bandingkan kemungkinan dia memilih A dengan B.', 'sama berkemungkinan',[Nq('A lebih berkemungkinan','chance_reason'),Nq('B lebih berkemungkinan','chance_reason'),Nq('tidak boleh dibanding','chance_reason')],'A = 40 − 10 = 30 dan B = 20 + 10 = 30.','Tahun 6 · Masalah Data Pelbagai Langkah'),id,'8.3.1',mode,'story','reasoning',s,['data_reason','chance_reason','multi_step']);
};

document.documentElement?.setAttribute('data-y6-v2-unit8','3.61.0');
})();