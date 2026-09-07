// Year 6 Curriculum Bank v2 — Unit 6A: Sudut
(function(){
'use strict';
const RT=window.PAY6V2Runtime;if(!RT)return;
const {GEN,Nq,choose,q,mark,chooseMode,bandModes,stage,protractor,polygon}=RT;

GEN['6.1.1']=function(id,s){
 const mode=chooseMode(id,'6.1.1',bandModes(s,['read','classify'],['read','classify','polygon_compare','straight'],['polygon_compare','scale_error','missing','claim']));
 if(mode==='read'){
  const d=choose([35,60,75,110,135,150]);
  return mark(q(protractor(d)+'Apakah ukuran sudut yang ditunjukkan?',d+'°',[Nq((180-d)+'°','angle'),Nq((d+10)+'°','angle'),Nq(Math.abs(90-d)+'°','angle')],'Mulakan bacaan pada 0° di garis dasar.','Tahun 6 · Mengukur Sudut'),id,'6.1.1',mode,'visual',stage(s)===1?'procedure':'application',s,['angle_measure']);
 }
 if(mode==='classify'){
  const d=choose([45,90,120,150]),ans=d<90?'sudut tirus':d===90?'sudut tegak':'sudut cakah';
  return mark(q('Sudut '+d+'° ialah?',ans,[Nq(ans==='sudut tirus'?'sudut cakah':'sudut tirus','angle'),Nq('sudut refleks','angle'),Nq('garis lurus','angle')],'Banding ukuran dengan 90° dan 180°.','Tahun 6 · Jenis Sudut'),id,'6.1.1',mode,'verbal',stage(s)===3?'reasoning':'application',s,['angle_type']);
 }
 if(mode==='polygon_compare'){
  return mark(q(polygon(6)+polygon(8)+'Sudut pedalaman heksagon sekata 120° dan oktagon sekata 135°. Beza ukuran?','15°',[Nq('255°','polygon_angle'),Nq('30°','polygon_angle'),Nq('45°','polygon_angle')],'135° − 120° = 15°.','Tahun 6 · Sudut Poligon Sekata'),id,'6.1.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['polygon_angle','compare']);
 }
 if(mode==='straight'){
  return mark(q(protractor(65)+'Satu sudut pada garis lurus ialah 65°. Sudut bersebelahan?','115°',[Nq('65°','angle'),Nq('125°','angle'),Nq('25°','angle')],'Jumlah sudut pada garis lurus 180°.','Tahun 6 · Sudut pada Garis Lurus'),id,'6.1.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['angle_measure']);
 }
 if(mode==='scale_error'){
  return mark(q(protractor(135)+'Murid membaca 45° kerana menggunakan skala protraktor yang salah. Bacaan betul?','135°',[Nq('45°','angle'),Nq('90°','angle'),Nq('180°','angle')],'Pilih skala yang bermula pada 0° di garis dasar.','Tahun 6 · Analisis Skala Protraktor'),id,'6.1.1',mode,'visual','reasoning',s,['angle_measure','error_analysis']);
 }
 if(mode==='missing'){
  return mark(q('Dua sudut pada satu garis lurus ialah 72° dan x°. Nilai x?','108°',[Nq('18°','angle'),Nq('72°','angle'),Nq('252°','angle')],'72° + x° = 180°.','Tahun 6 · Sudut Hilang'),id,'6.1.1',mode,'symbolic','reasoning',s,['angle_measure','inverse']);
 }
 return mark(q('Murid berkata sudut 150° ialah tirus kerana kurang daripada 180°. Penilaian?','salah, 150° ialah sudut cakah',[Nq('betul','angle'),Nq('salah, 150° sudut tegak','angle'),Nq('tidak boleh ditentukan','angle')],'Tirus <90°; cakah antara 90° dan 180°.','Tahun 6 · Menilai Dakwaan Sudut'),id,'6.1.1',mode,'verbal','reasoning',s,['angle_type','error_analysis']);
};

GEN['6.1.2']=function(id,s){
 const mode=chooseMode(id,'6.1.2',bandModes(s,['tool','target'],['tool','target','combine','turn'],['combine','construct_error','sequence','claim']));
 if(mode==='tool'){
  return mark(q('Alat paling sesuai untuk membentuk sudut tepat 125° ialah?','protraktor',[Nq('jangka lukis','tool'),Nq('pembaris sahaja','tool'),Nq('pemadam','tool')],'Protraktor digunakan untuk mengukur dan membentuk sudut.','Tahun 6 · Alat Membentuk Sudut'),id,'6.1.2',mode,'verbal','concept',s,['angle_construct','tool']);
 }
 if(mode==='target'){
  const d=choose([45,70,110,135]);
  return mark(q('Untuk membentuk sudut '+d+'°, tanda perlu dibuat pada bacaan?',d+'°',[Nq((180-d)+'°','angle_construct'),Nq((d+10)+'°','angle_construct'),Nq(Math.abs(90-d)+'°','angle_construct')],'Mulakan dari 0° pada garis dasar.','Tahun 6 · Membentuk Sudut'),id,'6.1.2',mode,'verbal',stage(s)===1?'procedure':'application',s,['angle_construct']);
 }
 if(mode==='combine'){
  return mark(q('Dua sudut 60° dan 75° dicantum tanpa bertindih. Sudut terhasil?','135°',[Nq('15°','angle_construct'),Nq('120°','angle_construct'),Nq('180°','angle_construct')],'Jumlahkan kedua-dua ukuran.','Tahun 6 · Gabungan Sudut'),id,'6.1.2',mode,'verbal',stage(s)===3?'reasoning':'application',s,['angle_construct']);
 }
 if(mode==='turn'){
  return mark(q('Satu anak panah dipusing 90° kemudian 45° lagi dalam arah sama. Jumlah pusingan?','135°',[Nq('45°','angle_construct'),Nq('90°','angle_construct'),Nq('180°','angle_construct')],'Tambah dua pusingan searah.','Tahun 6 · Pusingan Sudut'),id,'6.1.2',mode,'story',stage(s)===3?'reasoning':'application',s,['angle_construct']);
 }
 if(mode==='construct_error'){
  return mark(q('Murid mahu membentuk 140° tetapi menanda 40° pada skala yang salah. Pembetulan?','gunakan skala yang bermula pada 0° dan tanda 140°',[Nq('kekalkan tanda 40°','angle_construct'),Nq('tanda 90°','angle_construct'),Nq('guna jangka lukis sahaja','tool')],'Skala mesti bermula 0° pada sinar asas.','Tahun 6 · Analisis Pembinaan Sudut'),id,'6.1.2',mode,'verbal','reasoning',s,['angle_construct','error_analysis']);
 }
 if(mode==='sequence'){
  return mark(q('Urutan membentuk sudut 120° yang munasabah?','lukis sinar asas → letak pusat protraktor → tanda 120° → lukis sinar kedua',[Nq('tanda 120° → lukis bulatan → ukur panjang','tool'),Nq('guna jangka → tanda pusat → padam garis','tool'),Nq('lukis dua sinar rawak → anggar sahaja','tool')],'Gunakan garis asas dan protraktor sebelum melukis sinar kedua.','Tahun 6 · Prosedur Membentuk Sudut'),id,'6.1.2',mode,'verbal','reasoning',s,['angle_construct','procedure']);
 }
 return mark(q('Murid berkata sudut 50° dan 40° yang dicantum membentuk sudut tegak. Penilaian?','betul',[Nq('salah, jumlah 80°','angle_construct'),Nq('salah, jumlah 100°','angle_construct'),Nq('tidak boleh ditentukan','angle_construct')],'50° + 40° = 90°.','Tahun 6 · Menilai Pembentukan Sudut'),id,'6.1.2',mode,'verbal','reasoning',s,['angle_construct','reasoning']);
};

document.documentElement?.setAttribute('data-y6-v2-unit6-angle','3.61.0');
})();