// Year 6 Curriculum Bank v2 — Unit 6B: Bulatan
// Values and contexts are drawn fresh each time; answer wording stays fixed for the compass interactions.
(function(){
'use strict';
const RT=window.PAY6V2Runtime;if(!RT)return;
const {GEN,Nq,choose,rand,q,mark,chooseMode,bandModes,stage,circle,table,who,distinct}=RT;

const fmt=v=>String(Number(v.toFixed(2)));
const THINGS=['logo','jam dinding','pinggan','tudung balang','roda','cakera','lencana'];

GEN['6.2.1']=function(id,s){
 const mode=chooseMode(id,'6.2.1',bandModes(s,['radius','diameter','radius_from_diameter'],['radius','diameter','radius_from_diameter','diameter_from_radius','compare'],['compare','label_error','two_circle','claim']));
 if(mode==='radius')return mark(q(circle('parts')+'Garis dari pusat bulatan ke lilitan dipanggil apa?','jejari',[Nq('diameter','circle_part'),Nq('lengkok','circle_part'),Nq('sisi','circle_part')],'Jejari bermula di pusat dan berakhir pada lilitan.','Tahun 6 · Bahagian Bulatan'),id,'6.2.1',mode,'visual','concept',s,['circle_part']);
 if(mode==='diameter')return mark(q(circle('parts')+'Garis lurus melalui pusat dan menyambungkan dua titik pada lilitan dipanggil apa?','diameter',[Nq('jejari','circle_part'),Nq('lengkok','circle_part'),Nq('pusat','circle_part')],'Diameter merentasi pusat.','Tahun 6 · Diameter'),id,'6.2.1',mode,'visual','concept',s,['circle_part']);
 if(mode==='radius_from_diameter'){const d=rand(3,40),r=d/2,th=choose(THINGS);return mark(q('Diameter sebuah '+th+' berbentuk bulatan ialah '+d+' cm. Berapakah jejari, dalam cm, '+th+' itu?',fmt(r)+' cm',distinct(fmt(r)+' cm',[d+' cm',(d*2)+' cm',fmt(r+2)+' cm'],'radius_diameter'),'Jejari = diameter ÷ 2.','Tahun 6 · Jejari dan Diameter'),id,'6.2.1',mode,'symbolic',stage(s)===1?'procedure':'application',s,['radius_diameter']);}
 if(mode==='diameter_from_radius'){const r=rand(3,40)/2,th=choose(THINGS);return mark(q('Jejari sebuah '+th+' berbentuk bulatan ialah '+fmt(r)+' cm. Berapakah diameter, dalam cm, '+th+' itu?',fmt(2*r)+' cm',distinct(fmt(2*r)+' cm',[fmt(r)+' cm',fmt(r+2)+' cm',fmt(r/2)+' cm'],'radius_diameter'),'Diameter = 2 × jejari.','Tahun 6 · Diameter daripada Jejari'),id,'6.2.1',mode,'symbolic',stage(s)===3?'reasoning':'application',s,['radius_diameter']);}
 if(mode==='compare'){
  const ra=rand(3,12),rb=ra+choose([-2,-1,1,2]),showA=choose(['r','d']),showB=choose(['r','d']),cell=(r,k)=>k==='r'?['jejari '+r+' cm']:['diameter '+(2*r)+' cm'],ans=ra>rb?'A':'B';
  return mark(q(table(['Bulatan','Ukuran'],[['A',cell(ra,showA)[0]],['B',cell(rb,showB)[0]]])+'Bulatan manakah yang lebih besar?',ans,distinct(ans,['A','B','sama','tidak boleh dibanding'],'radius_diameter'),'Tukar kedua-duanya kepada jejari dahulu.','Tahun 6 · Membanding Bulatan'),id,'6.2.1',mode,'table',stage(s)===3?'reasoning':'application',s,['radius_diameter','compare']);
 }
 if(mode==='label_error'){const wrong=choose(['diameter','lilitan']),line=wrong==='diameter'?'garis dari pusat ke lilitan':'garis dari pusat ke lilitan';return mark(q('Sebuah rajah melabel '+line+' bulatan sebagai '+wrong+'. Apakah kesilapan rajah itu?','garis itu jejari, bukan '+wrong,distinct('garis itu jejari, bukan '+wrong,['diameter mesti lebih pendek','pusat tidak diperlukan','tiada kesilapan'],'circle_part'),'Jejari ialah garis dari pusat ke lilitan.','Tahun 6 · Semak Label Bulatan'),id,'6.2.1',mode,'verbal','reasoning',s,['circle_part','error_analysis']);}
 if(mode==='two_circle'){const ra=rand(3,12),rb=ra+choose([-2,-1,1,2]),ans=rb>ra?'Bulatan B':'Bulatan A';return mark(q('Bulatan A berdiameter '+(2*ra)+' cm. Bulatan B berjejari '+rb+' cm. Bulatan manakah yang mempunyai jejari lebih besar?',ans,distinct(ans,['Bulatan A','Bulatan B','sama','tidak boleh dibanding'],'radius_diameter'),'Jejari A = '+ra+' cm; jejari B = '+rb+' cm.','Tahun 6 · Penaakulan Jejari'),id,'6.2.1',mode,'verbal','reasoning',s,['radius_diameter','compare']);}
 const name=who(),ok=choose([true,false]),said=ok?'diameter ialah dua kali jejari':'diameter ialah separuh jejari',ans=ok?'betul':'salah, diameter ialah dua kali jejari';
 return mark(q(name+' berkata '+said+'. Adakah '+name+' betul?',ans,distinct(ans,[ok?'salah, diameter ialah separuh jejari':'betul','salah, diameter sama dengan jejari','tidak boleh ditentukan'],'radius_diameter'),'Diameter = 2 × jejari.','Tahun 6 · Menilai Hubungan Bulatan'),id,'6.2.1',mode,'verbal','reasoning',s,['radius_diameter','error_analysis']);
};

GEN['6.2.2']=function(id,s){
 const mode=chooseMode(id,'6.2.2',bandModes(s,['radius_setting','diameter_setting'],['radius_setting','diameter_setting','choose_setting','steps'],['choose_setting','steps','construction_error','design_compare','claim']));
 if(mode==='radius_setting'){const r=rand(4,20)/2;return mark(q('Berapakah bukaan jangka lukis yang diperlukan untuk melukis bulatan berjejari '+fmt(r)+' cm?',fmt(r)+' cm',distinct(fmt(r)+' cm',[fmt(r*2)+' cm',fmt(r+1)+' cm',fmt(r/2)+' cm'],'circle_draw'),'Bukaan jangka sama dengan jejari.','Tahun 6 · Melukis Bulatan'),id,'6.2.2',mode,'verbal','procedure',s,['circle_draw']);}
 if(mode==='diameter_setting'){const d=rand(4,30),r=d/2;return mark(q('Berapakah bukaan jangka lukis yang diperlukan untuk melukis bulatan berdiameter '+d+' cm?',fmt(r)+' cm',distinct(fmt(r)+' cm',[d+' cm',(d*2)+' cm',fmt(r+1)+' cm'],'circle_draw'),'Bukaan jangka ialah separuh diameter.','Tahun 6 · Bulatan daripada Diameter'),id,'6.2.2',mode,'verbal',stage(s)===3?'reasoning':'application',s,['circle_draw','radius_diameter']);}
 if(mode==='choose_setting'){const d=rand(4,30),r=d/2,th=choose(THINGS);return mark(q('Sebuah '+th+' memerlukan bulatan berdiameter '+d+' cm. Berapakah bukaan jangka lukis yang betul?',fmt(r)+' cm',distinct(fmt(r)+' cm',[d+' cm',(d*2)+' cm',fmt(r/2)+' cm'],'circle_draw'),'Tukar diameter kepada jejari.','Tahun 6 · Tetapan Jangka'),id,'6.2.2',mode,'story',stage(s)===3?'reasoning':'application',s,['circle_draw']);}
 if(mode==='steps'){const r=rand(2,12);return mark(q('Apakah urutan langkah yang betul untuk melukis bulatan berjejari '+r+' cm?','ukur bukaan jangka '+r+' cm → tetapkan pusat → putar jangka satu pusingan',[Nq('ukur diameter '+r+' cm → lukis segi empat','circle_draw'),Nq('guna protraktor '+r+'° → putar','tool'),Nq('lukis bulatan rawak → ukur selepas itu','circle_draw')],'Jejari menentukan bukaan jangka sebelum melukis.','Tahun 6 · Prosedur Melukis Bulatan'),id,'6.2.2',mode,'verbal',stage(s)===3?'reasoning':'application',s,['circle_draw','procedure']);}
 if(mode==='construction_error'){const d=rand(4,20)*2,name=who();return mark(q(name+' mahu melukis bulatan berdiameter '+d+' cm tetapi dia membuka jangka lukis '+d+' cm. Apakah yang patut dia lakukan?','buka jangka '+(d/2)+' cm',distinct('buka jangka '+(d/2)+' cm',['kekal '+d+' cm','buka '+(d*2)+' cm','buka '+fmt(d/4)+' cm'],'circle_draw'),'Jangka menggunakan jejari, bukan diameter.','Tahun 6 · Analisis Pembinaan Bulatan'),id,'6.2.2',mode,'verbal','reasoning',s,['circle_draw','error_analysis']);}
 if(mode==='design_compare'){
  const ra=rand(3,9),db=2*(ra+choose([-2,-1,1,2])),rb=db/2,ans=rb>ra?'B, '+rb+' cm':'A, '+ra+' cm';
  return mark(q('Reka bentuk A memerlukan bulatan berjejari '+ra+' cm. Reka bentuk B memerlukan bulatan berdiameter '+db+' cm. Reka bentuk manakah memerlukan bukaan jangka lukis yang lebih besar?',ans,distinct(ans,[rb>ra?'A, '+(2*ra)+' cm':'B, '+db+' cm','sama, '+ra+' cm','tidak boleh dibanding'],'circle_draw'),'Bukaan A = '+ra+' cm; bukaan B = '+rb+' cm.','Tahun 6 · Membanding Pembinaan Bulatan'),id,'6.2.2',mode,'story','reasoning',s,['circle_draw','compare']);
 }
 const d=rand(4,20)*2,name=who(),ok=choose([true,false]),open=ok?d/2:d,ans=ok?'betul':'salah, bukaan jangka mesti '+(d/2)+' cm';
 return mark(q(name+' berkata bulatan berdiameter '+d+' cm boleh dilukis dengan bukaan jangka '+open+' cm. Adakah '+name+' betul?',ans,distinct(ans,[ok?'salah, bukaan jangka mesti '+d+' cm':'betul','salah, bukaan jangka mesti '+(d*2)+' cm','tidak boleh ditentukan'],'circle_draw'),'Bukaan jangka ialah jejari.','Tahun 6 · Menilai Pembinaan Bulatan'),id,'6.2.2',mode,'verbal','reasoning',s,['circle_draw','error_analysis']);
};

document.documentElement?.setAttribute('data-y6-v2-unit6-circle','3.61.0');
})();
