// Year 6 Curriculum Bank v2 — Unit 6A: Sudut
(function(){
'use strict';
const RT=window.PAY6V2Runtime;if(!RT)return;
const {GEN,Nq,choose,q,mark,chooseMode,bandModes,stage,protractor,polygon}=RT;

GEN['6.1.1']=function(id,s){
 const mode=chooseMode(id,'6.1.1',bandModes(s,['read','classify','polygon_name'],['read','classify','polygon_compare','straight','polygon_name','polygon_interior','polygon_perimeter'],['polygon_compare','scale_error','missing','claim','polygon_interior','perimeter_side']));
 // v3.86.33: polygon names, interior angles and regular-polygon perimeter (UASA Ruang).
 const NAMES={5:'pentagon',6:'heksagon',7:'heptagon',8:'oktagon'},INTERIOR={5:108,6:120,8:135};
 const fmt=v=>String(Number(v.toFixed(2)));
 if(mode==='polygon_name'){
  const n=choose([5,6,7,8]),ans=NAMES[n];
  return mark(q(polygon(n)+'Poligon sekata ini mempunyai '+n+' sisi yang sama panjang. Apakah nama poligon ini?',ans,Object.values(NAMES).filter(x=>x!==ans).map(x=>Nq(x,'polygon_name')),'Pentagon 5 sisi, heksagon 6, heptagon 7, oktagon 8.','Tahun 6 · Nama Poligon'),id,'6.1.1',mode,'visual','concept',s,['polygon_name']);
 }
 if(mode==='polygon_interior'){
  const n=choose([5,6,8]),ans=INTERIOR[n],others=Object.values(INTERIOR).filter(x=>x!==ans);
  return mark(q(polygon(n)+'Berapakah ukuran setiap sudut pedalaman '+NAMES[n]+' sekata?',ans+'°',[Nq(others[0]+'°','polygon_angle'),Nq(others[1]+'°','polygon_angle'),Nq(fmt(360/n)+'°','polygon_angle')],'Sudut pedalaman sekata: pentagon 108°, heksagon 120°, oktagon 135°.','Tahun 6 · Sudut Pedalaman Poligon'),id,'6.1.1',mode,'visual','procedure',s,['polygon_angle']);
 }
 if(mode==='polygon_perimeter'){
  const n=choose([5,6,7,8]),side=choose([4,5,6.5,7,8.5,9]),ans=n*side;
  return mark(q('Setiap sisi sebuah '+NAMES[n]+' sekata ialah '+fmt(side)+' cm. Berapakah perimeternya?',fmt(ans)+' cm',[Nq(fmt(side*(n-1))+' cm','perimeter'),Nq(fmt(side+n)+' cm','perimeter'),Nq(fmt(ans+side)+' cm','perimeter')],'Poligon sekata: perimeter = bilangan sisi × panjang satu sisi.','Tahun 6 · Perimeter Poligon Sekata'),id,'6.1.1',mode,'story','application',s,['perimeter','polygon_name']);
 }
 if(mode==='perimeter_side'){
  const n=choose([5,6,8]),side=choose([6,7.5,9,12,15]),per=n*side;
  return mark(q('Perimeter sebuah '+NAMES[n]+' sekata ialah '+fmt(per)+' cm. Berapakah panjang satu sisinya?',fmt(side)+' cm',[Nq(fmt(per/(n-1))+' cm','perimeter'),Nq(fmt(per-n)+' cm','perimeter'),Nq(fmt(per*n)+' cm','perimeter')],'Panjang satu sisi = perimeter ÷ bilangan sisi.','Tahun 6 · Sisi daripada Perimeter'),id,'6.1.1',mode,'symbolic','reasoning',s,['perimeter','inverse']);
 }
 if(mode==='read'){
  const d=choose([35,60,75,110,135,150]);
  return mark(q(protractor(d)+'Apakah ukuran sudut yang ditunjukkan?',d+'°',[Nq((180-d)+'°','angle'),Nq((d+10)+'°','angle'),Nq(Math.abs(90-d)+'°','angle')],'Mulakan bacaan pada 0° di garis dasar.','Tahun 6 · Mengukur Sudut'),id,'6.1.1',mode,'visual',stage(s)===1?'procedure':'application',s,['angle_measure']);
 }
 if(mode==='classify'){
  const d=choose([45,90,120,150]),ans=d<90?'sudut tirus':d===90?'sudut tegak':'sudut cakah';
  return mark(q('Nyatakan jenis sudut bagi sudut '+d+'°.',ans,[Nq(ans==='sudut tirus'?'sudut cakah':'sudut tirus','angle'),Nq('sudut refleks','angle'),Nq('garis lurus','angle')],'Banding ukuran dengan 90° dan 180°.','Tahun 6 · Jenis Sudut'),id,'6.1.1',mode,'verbal',stage(s)===3?'reasoning':'application',s,['angle_type']);
 }
 if(mode==='polygon_compare'){
  const pair=choose([[5,6],[5,8],[6,8]]),a1=INTERIOR[pair[0]],a2=INTERIOR[pair[1]],dif=a2-a1;
  return mark(q(polygon(pair[0])+polygon(pair[1])+'Sudut pedalaman '+NAMES[pair[0]]+' sekata '+a1+'° dan '+NAMES[pair[1]]+' sekata '+a2+'°. Berapakah beza ukuran sudut itu?',dif+'°',[Nq((a1+a2)+'°','polygon_angle'),Nq((dif+15)+'°','polygon_angle'),Nq((180-a2)+'°','polygon_angle')],a2+'° − '+a1+'° = '+dif+'°.','Tahun 6 · Sudut Poligon Sekata'),id,'6.1.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['polygon_angle','compare']);
 }
 if(mode==='straight'){
  const d=choose([35,48,65,72,115,128]),ans=180-d;
  return mark(q(protractor(d)+'Satu sudut pada garis lurus ialah '+d+'°. Berapakah sudut bersebelahannya?',ans+'°',[Nq(d+'°','angle'),Nq((ans+10)+'°','angle'),Nq((360-d)+'°','angle')],'Jumlah sudut pada garis lurus 180°.','Tahun 6 · Sudut pada Garis Lurus'),id,'6.1.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['angle_measure']);
 }
 if(mode==='scale_error'){
  return mark(q(protractor(135)+'Hafiz membaca 45° kerana menggunakan skala protraktor yang salah. Apakah bacaan yang betul?','135°',[Nq('45°','angle'),Nq('90°','angle'),Nq('180°','angle')],'Pilih skala yang bermula pada 0° di garis dasar.','Tahun 6 · Analisis Skala Protraktor'),id,'6.1.1',mode,'visual','reasoning',s,['angle_measure','error_analysis']);
 }
 if(mode==='missing'){
  const d=choose([38,54,72,106,133]),ans=180-d;
  return mark(q('Dua sudut pada satu garis lurus ialah '+d+'° dan x°. Berapakah nilai x?',ans+'°',[Nq(Math.abs(90-d)+'°','angle'),Nq(d+'°','angle'),Nq((360-d)+'°','angle')],d+'° + x° = 180°.','Tahun 6 · Sudut Hilang'),id,'6.1.1',mode,'symbolic','reasoning',s,['angle_measure','inverse']);
 }
 return mark(q('Murid berkata sudut 150° ialah tirus kerana kurang daripada 180°. Adakah kenyataan itu betul?','salah, 150° ialah sudut cakah',[Nq('betul','angle'),Nq('salah, 150° sudut tegak','angle'),Nq('tidak boleh ditentukan','angle')],'Tirus <90°; cakah antara 90° dan 180°.','Tahun 6 · Menilai Dakwaan Sudut'),id,'6.1.1',mode,'verbal','reasoning',s,['angle_type','error_analysis']);
};

GEN['6.1.2']=function(id,s){
 const mode=chooseMode(id,'6.1.2',bandModes(s,['tool','target'],['tool','target','combine','turn'],['combine','construct_error','sequence','claim']));
 if(mode==='tool'){
  return mark(q('Alat manakah yang paling sesuai untuk membentuk sudut 125° dengan tepat?','protraktor',[Nq('jangka lukis','tool'),Nq('pembaris sahaja','tool'),Nq('pemadam','tool')],'Protraktor digunakan untuk mengukur dan membentuk sudut.','Tahun 6 · Alat Membentuk Sudut'),id,'6.1.2',mode,'verbal','concept',s,['angle_construct','tool']);
 }
 if(mode==='target'){
  const d=choose([45,70,110,135]);
  return mark(q('Untuk membentuk sudut '+d+'° dengan protraktor, pada bacaan berapakah tanda perlu dibuat?',d+'°',[Nq((180-d)+'°','angle_construct'),Nq((d+10)+'°','angle_construct'),Nq(Math.abs(90-d)+'°','angle_construct')],'Mulakan dari 0° pada garis dasar.','Tahun 6 · Membentuk Sudut'),id,'6.1.2',mode,'verbal',stage(s)===1?'procedure':'application',s,['angle_construct']);
 }
 if(mode==='combine'){
  return mark(q('Sudut 60° dan sudut 75° dicantumkan tanpa bertindih. Berapakah sudut yang terhasil?','135°',[Nq('15°','angle_construct'),Nq('120°','angle_construct'),Nq('180°','angle_construct')],'Jumlahkan kedua-dua ukuran.','Tahun 6 · Gabungan Sudut'),id,'6.1.2',mode,'verbal',stage(s)===3?'reasoning':'application',s,['angle_construct']);
 }
 if(mode==='turn'){
  return mark(q('Satu anak panah diputar 90°, kemudian diputar 45° lagi dalam arah yang sama. Berapakah jumlah sudut putaran anak panah itu?','135°',[Nq('45°','angle_construct'),Nq('90°','angle_construct'),Nq('180°','angle_construct')],'Tambah dua pusingan searah.','Tahun 6 · Pusingan Sudut'),id,'6.1.2',mode,'story',stage(s)===3?'reasoning':'application',s,['angle_construct']);
 }
 if(mode==='construct_error'){
  return mark(q('Hafiz mahu membentuk sudut 140° tetapi dia menanda 40° kerana membaca skala yang salah. Apakah yang patut dia lakukan?','gunakan skala yang bermula pada 0° dan tanda 140°',[Nq('kekalkan tanda 40°','angle_construct'),Nq('tanda 90°','angle_construct'),Nq('guna jangka lukis sahaja','tool')],'Skala mesti bermula 0° pada sinar asas.','Tahun 6 · Analisis Pembinaan Sudut'),id,'6.1.2',mode,'verbal','reasoning',s,['angle_construct','error_analysis']);
 }
 if(mode==='sequence'){
  return mark(q('Apakah urutan langkah yang betul untuk membentuk sudut 120°?','lukis sinar asas → letak pusat protraktor → tanda 120° → lukis sinar kedua',[Nq('tanda 120° → lukis bulatan → ukur panjang','tool'),Nq('guna jangka → tanda pusat → padam garis','tool'),Nq('lukis dua sinar rawak → anggar sahaja','tool')],'Gunakan garis asas dan protraktor sebelum melukis sinar kedua.','Tahun 6 · Prosedur Membentuk Sudut'),id,'6.1.2',mode,'verbal','reasoning',s,['angle_construct','procedure']);
 }
 return mark(q('Murid berkata sudut 50° dan 40° yang dicantum membentuk sudut tegak. Adakah kenyataan itu betul?','betul',[Nq('salah, jumlah 80°','angle_construct'),Nq('salah, jumlah 100°','angle_construct'),Nq('tidak boleh ditentukan','angle_construct')],'50° + 40° = 90°.','Tahun 6 · Menilai Pembentukan Sudut'),id,'6.1.2',mode,'verbal','reasoning',s,['angle_construct','reasoning']);
};

document.documentElement?.setAttribute('data-y6-v2-unit6-angle','3.61.0');
})();