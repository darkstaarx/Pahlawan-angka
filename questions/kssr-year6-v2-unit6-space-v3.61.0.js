// Year 6 Curriculum Bank v2 — Unit 6C: Penyelesaian Masalah Ruang
(function(){
'use strict';
const RT=window.PAY6V2Runtime;if(!RT)return;
const {GEN,Nq,q,mark,chooseMode,bandModes,stage,protractor,table}=RT;

GEN['6.3.1']=function(id,s){
 const mode=chooseMode(id,'6.3.1',bandModes(
  s,
  ['radius_path','straight_context','tool_choice','simple_design'],
  ['radius_path','straight_context','tool_choice','simple_design','polygon_sum','compass_plan','polygon_fence'],
  ['polygon_sum','compass_plan','integrated_design','relevant_info','error_analysis','compare_design','multi_step','fence_compare']
 ));
 // v3.86.33: regular-polygon perimeter in real contexts (pagar, bingkai), as tested in UASA Ruang.
 const NAMES={5:'pentagon',6:'heksagon',7:'heptagon',8:'oktagon'},fmt=v=>String(Number(v.toFixed(2)));
 if(mode==='polygon_fence'){
  const n=[5,6,8][Math.floor(Math.random()*3)],side=[3,4,5,6.5][Math.floor(Math.random()*4)],ans=n*side,thing=Math.random()<.5?'taman':'kolam';
  return mark(q('Sebuah '+thing+' berbentuk '+NAMES[n]+' sekata dengan setiap sisi '+fmt(side)+' m. Berapakah panjang pagar yang diperlukan untuk mengelilinginya?',fmt(ans)+' m',[Nq(fmt(side*(n-1))+' m','perimeter'),Nq(fmt(side*(n+1))+' m','perimeter'),Nq(fmt(ans+side*2)+' m','perimeter')],'Panjang pagar = perimeter = bilangan sisi × panjang sisi.','Tahun 6 · Masalah Perimeter Poligon'),id,'6.3.1',mode,'story','application',s,['perimeter','polygon_name']);
 }
 if(mode==='fence_compare'){
  const pair=[[5,8],[6,8],[5,6]][Math.floor(Math.random()*3)],side=[4,5,6][Math.floor(Math.random()*3)],a=pair[0]*side,b=pair[1]*side,dif=b-a;
  return mark(q('Taman A berbentuk '+NAMES[pair[0]]+' sekata dan taman B berbentuk '+NAMES[pair[1]]+' sekata. Setiap sisi kedua-dua taman ialah '+side+' m. Berapakah beza panjang pagar yang diperlukan?',dif+' m',[Nq(a+' m','perimeter'),Nq((a+b)+' m','perimeter'),Nq((pair[1]-pair[0])+' m','perimeter')],'Kira perimeter setiap taman, kemudian tolak.','Tahun 6 · Banding Perimeter Poligon'),id,'6.3.1',mode,'story','reasoning',s,['perimeter','multi_step']);
 }
 if(mode==='radius_path')return mark(q('Sebuah taman berbentuk bulatan berdiameter 16 m. Taman itu mempunyai 5 laluan lurus dari pusat ke tepi taman. Berapakah jumlah panjang, dalam m, kelima-lima laluan itu?','40 m',[Nq('80 m','space'),Nq('16 m','space'),Nq('21 m','space')],'Setiap laluan ialah jejari 8 m; 5 × 8.','Tahun 6 · Masalah Bulatan Harian'),id,'6.3.1',mode,'story','application',s,['radius_diameter','space_reason']);
 if(mode==='straight_context')return mark(q('Dua keping papan disusun membentuk satu garis lurus. Satu sudut ialah 68°. Berapakah sudut yang satu lagi?','112°',[Nq('68°','angle'),Nq('122°','angle'),Nq('22°','angle')],'Jumlah sudut pada garis lurus 180°.','Tahun 6 · Masalah Sudut Harian'),id,'6.3.1',mode,'story','application',s,['angle_measure']);
 if(mode==='tool_choice')return mark(q('Untuk menghasilkan reka bentuk yang memerlukan bulatan diameter 12 cm dan sudut 120°, alat manakah yang sesuai?','jangka bukaan 6 cm dan protraktor 120°',[Nq('pembaris sahaja','tool'),Nq('jangka 12 cm sahaja','tool'),Nq('protraktor 60° sahaja','tool')],'Bulatan perlukan jangka; sudut perlukan protraktor.','Tahun 6 · Memilih Alat Ruang'),id,'6.3.1',mode,'verbal',stage(s)===3?'reasoning':'application',s,['circle_draw','angle_construct']);
 if(mode==='simple_design')return mark(q('Logo memerlukan bulatan diameter 10 cm. Apakah jejari yang perlu digunakan dalam pelan?','5 cm',[Nq('10 cm','space'),Nq('20 cm','space'),Nq('2 cm','space')],'Jejari separuh diameter.','Tahun 6 · Reka Bentuk Bulatan'),id,'6.3.1',mode,'story','application',s,['circle_draw']);
 if(mode==='polygon_sum')return mark(q(protractor(60)+'Satu corak dibentuk dengan mencantumkan 3 sudut 60°. Berapakah jumlah sudut itu?','180°',[Nq('60°','space'),Nq('120°','space'),Nq('240°','space')],'3 × 60° = 180°.','Tahun 6 · Gabungan Sudut dalam Corak'),id,'6.3.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['angle_measure','space_reason']);
 if(mode==='compass_plan')return mark(q('Sebuah logo memerlukan bulatan berdiameter 18 cm. Berapakah bukaan jangka lukis yang perlu ditetapkan?','9 cm',[Nq('18 cm','circle_draw'),Nq('36 cm','circle_draw'),Nq('4.5 cm','circle_draw')],'Tetapkan jejari.','Tahun 6 · Rancang Pembinaan Bulatan'),id,'6.3.1',mode,'story',stage(s)===3?'reasoning':'application',s,['circle_draw','space_reason']);
 if(mode==='integrated_design')return mark(q('Satu reka bentuk memerlukan bulatan berdiameter 16 cm dan sudut 135°. Apakah tetapan alat yang betul?','jangka 8 cm dan protraktor 135°',[Nq('jangka 16 cm dan protraktor 135°','space'),Nq('jangka 8 cm dan protraktor 45°','space'),Nq('jangka 32 cm dan protraktor 135°','space')],'Diameter → jejari 8 cm; sudut kekal 135°.','Tahun 6 · Reka Bentuk Ruang'),id,'6.3.1',mode,'story','reasoning',s,['circle_draw','angle_construct']);
 if(mode==='relevant_info')return mark(q('Satu hiasan menggunakan 3 jejari bulatan yang setiap satunya 8 cm, dan satu sudut 120°. Berapakah jumlah panjang tiga jejari itu?','24 cm',[Nq('8 cm','space'),Nq('16 cm','space'),Nq('120 cm','space')],'Maklumat sudut tidak diperlukan.','Tahun 6 · Memilih Maklumat Relevan'),id,'6.3.1',mode,'story','reasoning',s,['relevant_information']);
 if(mode==='error_analysis')return mark(q('Hafiz melukis bulatan berdiameter 18 cm dengan bukaan jangka lukis 18 cm. Mengapakah cara Hafiz salah?','bukaan jangka sepatutnya 9 cm',[Nq('jangka mesti 36 cm','circle_draw'),Nq('diameter tidak berkaitan dengan jangka','circle_draw'),Nq('hasil sebenarnya betul','circle_draw')],'Jejari = diameter ÷ 2.','Tahun 6 · Analisis Kesilapan Ruang'),id,'6.3.1',mode,'verbal','reasoning',s,['circle_draw','error_analysis']);
 if(mode==='compare_design')return mark(q(table(['Reka bentuk','Bulatan','Sudut'],[['A','jejari 5 cm','120°'],['B','diameter 12 cm','100°']])+'Reka bentuk manakah memerlukan bukaan jangka lukis yang lebih besar?','B',[Nq('A','space'),Nq('sama','space'),Nq('tidak boleh dibanding','space')],'A=5 cm; B jejari=6 cm.','Tahun 6 · Banding Reka Bentuk Ruang'),id,'6.3.1',mode,'table','reasoning',s,['circle_draw','compare']);
 return mark(q('Sebuah corak memerlukan dua sudut 75° dan satu bulatan berdiameter 14 cm. Berapakah jumlah dua sudut itu dan berapakah bukaan jangka lukis yang diperlukan?','150° dan 7 cm',[Nq('75° dan 14 cm','space'),Nq('150° dan 14 cm','space'),Nq('225° dan 7 cm','space')],'Dua sudut: 75+75; bukaan jangka=7 cm.','Tahun 6 · Masalah Ruang Pelbagai Langkah'),id,'6.3.1',mode,'story','reasoning',s,['angle_construct','circle_draw','multi_step']);
};

document.documentElement?.setAttribute('data-y6-v2-unit6-space','3.61.0');
})();