// Year 6 Curriculum Bank v2 — Unit 6B: Bulatan
(function(){
'use strict';
const RT=window.PAY6V2Runtime;if(!RT)return;
const {GEN,Nq,choose,q,mark,chooseMode,bandModes,stage,circle,table}=RT;

GEN['6.2.1']=function(id,s){
 const mode=chooseMode(id,'6.2.1',bandModes(s,['radius','diameter','radius_from_diameter'],['radius','diameter','radius_from_diameter','diameter_from_radius','compare'],['compare','label_error','two_circle','claim']));
 if(mode==='radius'){
  return mark(q(circle('parts')+'Garis dari pusat bulatan ke lilitan disebut?','jejari',[Nq('diameter','circle_part'),Nq('lengkok','circle_part'),Nq('sisi','circle_part')],'Jejari bermula di pusat dan berakhir pada lilitan.','Tahun 6 · Bahagian Bulatan'),id,'6.2.1',mode,'visual','concept',s,['circle_part']);
 }
 if(mode==='diameter'){
  return mark(q(circle('parts')+'Garis lurus melalui pusat dan menyambungkan dua titik pada lilitan disebut?','diameter',[Nq('jejari','circle_part'),Nq('lengkok','circle_part'),Nq('pusat','circle_part')],'Diameter merentasi pusat.','Tahun 6 · Diameter'),id,'6.2.1',mode,'visual','concept',s,['circle_part']);
 }
 if(mode==='radius_from_diameter'){
  const d=choose([8,10,12,16]),r=d/2;
  return mark(q('Diameter bulatan '+d+' cm. Jejari?',r+' cm',[Nq(d+' cm','radius_diameter'),Nq((d*2)+' cm','radius_diameter'),Nq((r+2)+' cm','radius_diameter')],'Jejari = diameter ÷ 2.','Tahun 6 · Jejari dan Diameter'),id,'6.2.1',mode,'symbolic',stage(s)===1?'procedure':'application',s,['radius_diameter']);
 }
 if(mode==='diameter_from_radius'){
  const r=choose([4,5,7,9]);
  return mark(q('Jejari bulatan '+r+' cm. Diameter?',(2*r)+' cm',[Nq(r+' cm','radius_diameter'),Nq((r+2)+' cm','radius_diameter'),Nq((r*r)+' cm','radius_diameter')],'Diameter = 2 × jejari.','Tahun 6 · Diameter daripada Jejari'),id,'6.2.1',mode,'symbolic',stage(s)===3?'reasoning':'application',s,['radius_diameter']);
 }
 if(mode==='compare'){
  return mark(q(table(['Bulatan','Jejari','Diameter'],[['A','4 cm','8 cm'],['B','5 cm','10 cm']])+'Bulatan mana lebih besar?','B',[Nq('A','radius_diameter'),Nq('sama','radius_diameter'),Nq('tidak boleh dibanding','radius_diameter')],'Banding jejari atau diameter.','Tahun 6 · Membanding Bulatan'),id,'6.2.1',mode,'table',stage(s)===3?'reasoning':'application',s,['radius_diameter','compare']);
 }
 if(mode==='label_error'){
  return mark(q('Rajah melabel garis dari pusat ke lilitan sebagai diameter. Apakah kesilapan?','garis itu jejari, bukan diameter',[Nq('diameter mesti lebih pendek','circle_part'),Nq('pusat tidak diperlukan','circle_part'),Nq('tiada kesilapan','circle_part')],'Diameter mesti sampai ke dua sisi lilitan melalui pusat.','Tahun 6 · Semak Label Bulatan'),id,'6.2.1',mode,'verbal','reasoning',s,['circle_part','error_analysis']);
 }
 if(mode==='two_circle'){
  return mark(q('Bulatan A berdiameter 12 cm. Bulatan B berjejari 7 cm. Yang mempunyai jejari lebih besar?','Bulatan B',[Nq('Bulatan A','radius_diameter'),Nq('sama','radius_diameter'),Nq('tidak boleh dibanding','radius_diameter')],'Jejari A=6 cm; B=7 cm.','Tahun 6 · Penaakulan Jejari'),id,'6.2.1',mode,'verbal','reasoning',s,['radius_diameter','compare']);
 }
 return mark(q('Murid berkata diameter sentiasa separuh jejari. Penilaian?','salah, diameter ialah dua kali jejari',[Nq('betul','radius_diameter'),Nq('salah, diameter sama dengan jejari','radius_diameter'),Nq('tidak boleh ditentukan','radius_diameter')],'d = 2r.','Tahun 6 · Menilai Hubungan Bulatan'),id,'6.2.1',mode,'verbal','reasoning',s,['radius_diameter','error_analysis']);
};

GEN['6.2.2']=function(id,s){
 const mode=chooseMode(id,'6.2.2',bandModes(s,['radius_setting','diameter_setting'],['radius_setting','diameter_setting','choose_setting','steps'],['choose_setting','steps','construction_error','design_compare','claim']));
 if(mode==='radius_setting'){
  const r=choose([3,4,5,6]);
  return mark(q('Untuk melukis bulatan berjari-jari '+r+' cm, bukaan jangka lukis?',r+' cm',[Nq((r*2)+' cm','circle_draw'),Nq((r+1)+' cm','circle_draw'),Nq((r/2)+' cm','circle_draw')],'Bukaan jangka sama dengan jejari.','Tahun 6 · Melukis Bulatan'),id,'6.2.2',mode,'verbal','procedure',s,['circle_draw']);
 }
 if(mode==='diameter_setting'){
  const d=choose([8,10,12,16]),r=d/2;
  return mark(q('Bulatan berdiameter '+d+' cm memerlukan bukaan jangka?',r+' cm',[Nq(d+' cm','circle_draw'),Nq((d*2)+' cm','circle_draw'),Nq((r+1)+' cm','circle_draw')],'Bukaan jangka ialah separuh diameter.','Tahun 6 · Bulatan daripada Diameter'),id,'6.2.2',mode,'verbal',stage(s)===3?'reasoning':'application',s,['circle_draw','radius_diameter']);
 }
 if(mode==='choose_setting'){
  return mark(q('Logo memerlukan bulatan berdiameter 14 cm. Tetapan jangka yang tepat?','7 cm',[Nq('14 cm','circle_draw'),Nq('28 cm','circle_draw'),Nq('3.5 cm','circle_draw')],'Tukar diameter kepada jejari.','Tahun 6 · Tetapan Jangka'),id,'6.2.2',mode,'story',stage(s)===3?'reasoning':'application',s,['circle_draw']);
 }
 if(mode==='steps'){
  return mark(q('Urutan melukis bulatan berjari-jari 5 cm yang betul?','ukur bukaan jangka 5 cm → tetapkan pusat → putar jangka satu pusingan',[Nq('ukur diameter 5 cm → lukis segi empat','circle_draw'),Nq('guna protraktor 5° → putar','tool'),Nq('lukis bulatan rawak → ukur selepas itu','circle_draw')],'Jejari menentukan bukaan jangka sebelum melukis.','Tahun 6 · Prosedur Melukis Bulatan'),id,'6.2.2',mode,'verbal',stage(s)===3?'reasoning':'application',s,['circle_draw','procedure']);
 }
 if(mode==='construction_error'){
  return mark(q('Murid mahu diameter 18 cm tetapi membuka jangka 18 cm. Pembetulan?','buka jangka 9 cm',[Nq('kekal 18 cm','circle_draw'),Nq('buka 36 cm','circle_draw'),Nq('buka 4.5 cm','circle_draw')],'Jangka menggunakan jejari, bukan diameter.','Tahun 6 · Analisis Pembinaan Bulatan'),id,'6.2.2',mode,'verbal','reasoning',s,['circle_draw','error_analysis']);
 }
 if(mode==='design_compare'){
  return mark(q('Reka bentuk A perlukan jejari 4 cm; B perlukan diameter 10 cm. Yang memerlukan bukaan jangka lebih besar?','B, 5 cm',[Nq('A, 8 cm','circle_draw'),Nq('sama, 4 cm','circle_draw'),Nq('tidak boleh dibanding','circle_draw')],'Bukaan A=4 cm; B=5 cm.','Tahun 6 · Membanding Pembinaan Bulatan'),id,'6.2.2',mode,'story','reasoning',s,['circle_draw','compare']);
 }
 return mark(q('Murid berkata bulatan diameter 12 cm boleh dilukis dengan jangka 12 cm jika pusat ditanda betul. Penilaian?','salah, bukaan jangka mesti 6 cm',[Nq('betul','circle_draw'),Nq('salah, bukaan 24 cm','circle_draw'),Nq('tidak boleh ditentukan','circle_draw')],'Bukaan jangka ialah jejari.','Tahun 6 · Menilai Pembinaan Bulatan'),id,'6.2.2',mode,'verbal','reasoning',s,['circle_draw','error_analysis']);
};

document.documentElement?.setAttribute('data-y6-v2-unit6-circle','3.61.0');
})();