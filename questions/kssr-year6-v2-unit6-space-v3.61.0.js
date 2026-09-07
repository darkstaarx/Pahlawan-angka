// Year 6 Curriculum Bank v2 — Unit 6C: Penyelesaian Masalah Ruang
(function(){
'use strict';
const RT=window.PAY6V2Runtime;if(!RT)return;
const {GEN,Nq,q,mark,chooseMode,bandModes,stage,protractor,table}=RT;

GEN['6.3.1']=function(id,s){
 const mode=chooseMode(id,'6.3.1',bandModes(
  s,
  ['radius_path','straight_context','tool_choice','simple_design'],
  ['radius_path','straight_context','tool_choice','simple_design','polygon_sum','compass_plan'],
  ['polygon_sum','compass_plan','integrated_design','relevant_info','error_analysis','compare_design','multi_step']
 ));
 if(mode==='radius_path')return mark(q('Taman bulatan berdiameter 16 m mempunyai 5 laluan dari pusat ke tepi. Jumlah panjang laluan?','40 m',[Nq('80 m','space'),Nq('16 m','space'),Nq('21 m','space')],'Setiap laluan ialah jejari 8 m; 5 × 8.','Tahun 6 · Masalah Bulatan Harian'),id,'6.3.1',mode,'story','application',s,['radius_diameter','space_reason']);
 if(mode==='straight_context')return mark(q('Dua papan membentuk garis lurus. Satu sudut 68°. Sudut satu lagi?','112°',[Nq('68°','angle'),Nq('122°','angle'),Nq('22°','angle')],'Jumlah sudut pada garis lurus 180°.','Tahun 6 · Masalah Sudut Harian'),id,'6.3.1',mode,'story','application',s,['angle_measure']);
 if(mode==='tool_choice')return mark(q('Untuk menghasilkan reka bentuk yang memerlukan bulatan diameter 12 cm dan sudut 120°, alat yang sesuai?','jangka bukaan 6 cm dan protraktor 120°',[Nq('pembaris sahaja','tool'),Nq('jangka 12 cm sahaja','tool'),Nq('protraktor 60° sahaja','tool')],'Bulatan perlukan jangka; sudut perlukan protraktor.','Tahun 6 · Memilih Alat Ruang'),id,'6.3.1',mode,'verbal',stage(s)===3?'reasoning':'application',s,['circle_draw','angle_construct']);
 if(mode==='simple_design')return mark(q('Logo memerlukan bulatan diameter 10 cm. Apakah jejari yang perlu digunakan dalam pelan?','5 cm',[Nq('10 cm','space'),Nq('20 cm','space'),Nq('2 cm','space')],'Jejari separuh diameter.','Tahun 6 · Reka Bentuk Bulatan'),id,'6.3.1',mode,'story','application',s,['circle_draw']);
 if(mode==='polygon_sum')return mark(q(protractor(60)+'Corak menggunakan 3 sudut 60° yang dicantum. Jumlah sudut?','180°',[Nq('60°','space'),Nq('120°','space'),Nq('240°','space')],'3 × 60° = 180°.','Tahun 6 · Gabungan Sudut dalam Corak'),id,'6.3.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['angle_measure','space_reason']);
 if(mode==='compass_plan')return mark(q('Logo perlu bulatan diameter 18 cm. Apakah tetapan awal jangka?','9 cm',[Nq('18 cm','circle_draw'),Nq('36 cm','circle_draw'),Nq('4.5 cm','circle_draw')],'Tetapkan jejari.','Tahun 6 · Rancang Pembinaan Bulatan'),id,'6.3.1',mode,'story',stage(s)===3?'reasoning':'application',s,['circle_draw','space_reason']);
 if(mode==='integrated_design')return mark(q('Reka bentuk memerlukan bulatan diameter 16 cm dan sudut 135°. Tetapan alat yang betul?','jangka 8 cm dan protraktor 135°',[Nq('jangka 16 cm dan protraktor 135°','space'),Nq('jangka 8 cm dan protraktor 45°','space'),Nq('jangka 32 cm dan protraktor 135°','space')],'Diameter → jejari 8 cm; sudut kekal 135°.','Tahun 6 · Reka Bentuk Ruang'),id,'6.3.1',mode,'story','reasoning',s,['circle_draw','angle_construct']);
 if(mode==='relevant_info')return mark(q('Hiasan menggunakan 3 jejari bulatan 8 cm dan satu sudut 120°. Jika ditanya jumlah panjang tiga jejari, jawapan?','24 cm',[Nq('8 cm','space'),Nq('16 cm','space'),Nq('120 cm','space')],'Maklumat sudut tidak diperlukan.','Tahun 6 · Memilih Maklumat Relevan'),id,'6.3.1',mode,'story','reasoning',s,['relevant_information']);
 if(mode==='error_analysis')return mark(q('Murid melukis bulatan diameter 18 cm dengan bukaan jangka 18 cm. Mengapa salah?','bukaan jangka sepatutnya 9 cm',[Nq('jangka mesti 36 cm','circle_draw'),Nq('diameter tidak berkaitan dengan jangka','circle_draw'),Nq('hasil sebenarnya betul','circle_draw')],'Jejari = diameter ÷ 2.','Tahun 6 · Analisis Kesilapan Ruang'),id,'6.3.1',mode,'verbal','reasoning',s,['circle_draw','error_analysis']);
 if(mode==='compare_design')return mark(q(table(['Reka bentuk','Bulatan','Sudut'],[['A','jejari 5 cm','120°'],['B','diameter 12 cm','100°']])+'Yang memerlukan bukaan jangka lebih besar?','B',[Nq('A','space'),Nq('sama','space'),Nq('tidak boleh dibanding','space')],'A=5 cm; B jejari=6 cm.','Tahun 6 · Banding Reka Bentuk Ruang'),id,'6.3.1',mode,'table','reasoning',s,['circle_draw','compare']);
 return mark(q('Sebuah corak perlu dua sudut 75° dan satu bulatan diameter 14 cm. Jumlah dua sudut dan bukaan jangka masing-masing?','150° dan 7 cm',[Nq('75° dan 14 cm','space'),Nq('150° dan 14 cm','space'),Nq('225° dan 7 cm','space')],'Dua sudut: 75+75; bukaan jangka=7 cm.','Tahun 6 · Masalah Ruang Pelbagai Langkah'),id,'6.3.1',mode,'story','reasoning',s,['angle_construct','circle_draw','multi_step']);
};

document.documentElement?.setAttribute('data-y6-v2-unit6-space','3.61.0');
})();