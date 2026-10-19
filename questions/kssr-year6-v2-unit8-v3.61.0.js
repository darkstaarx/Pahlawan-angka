// Year 6 Curriculum Bank v2 — Unit 8: Pengurusan Data dan Kebolehjadian
// Pie charts, bags and data tables are generated afresh for every item.
(function(){
'use strict';
const RT=window.PAY6V2Runtime;if(!RT)return;
const {GEN,Nq,choose,rand,q,mark,chooseMode,bandModes,stage,pie,bag,table,who,distinct,gcd}=RT;

const THEMES=[
 {what:'sukan kegemaran',labels:['Bola sepak','Badminton','Renang','Larian','Hoki']},
 {what:'warna kegemaran',labels:['Merah','Biru','Hijau','Kuning','Ungu']},
 {what:'cara ke sekolah',labels:['Bas','Kereta','Berjalan','Basikal','Van']},
 {what:'makanan kegemaran',labels:['Nasi lemak','Roti canai','Mi goreng','Bihun sup','Satay']},
 {what:'mata pelajaran kegemaran',labels:['Sains','Matematik','Bahasa Melayu','Sejarah','Seni']},
 {what:'haiwan peliharaan',labels:['Kucing','Ikan','Arnab','Burung','Hamster']}
];
// Totals that divide 360 so every sector angle is a whole number of degrees.
const TOTALS=[20,24,30,36,40,45,60,72,90,120];
function partition(n,k){for(;;){const cuts=[...new Set(Array.from({length:k-1},()=>rand(1,n-1)))].sort((a,b)=>a-b);if(cuts.length!==k-1)continue;const parts=[cuts[0],...cuts.slice(1).map((c,i)=>c-cuts[i]),n-cuts[k-2]];if(new Set(parts).size===k&&Math.min(...parts)>=Math.ceil(n/12))return parts}}
// Four distinct categories with distinct values, largest first in the data but shuffled for drawing.
function pieData(){const th=choose(THEMES),N=choose(TOTALS),vals=partition(N,4).sort((a,b)=>b-a),labels=[...th.labels].sort(()=>Math.random()-.5).slice(0,4);const set=vals.map((v,i)=>({label:labels[i],value:v,angle:v*360/N}));return {th,N,set,drawn:[...set].sort(()=>Math.random()-.5)}}
const others=(set,x)=>set.filter(y=>y!==x).map(y=>y.label);
const COLOURS=['merah','biru','hijau','kuning','putih','hitam'];
const HOLDERS=[['beg','guli','biji'],['kotak','bola','biji'],['balang','gula-gula','biji'],['bekas','manik','biji'],['kotak','kad','keping']];
const cap=x=>x[0].toUpperCase()+x.slice(1);
const pickHolder=()=>choose(HOLDERS);
const pickColours=()=>{const c=[...COLOURS].sort(()=>Math.random()-.5);return [c[0],c[1]]};

GEN['8.1.1']=function(id,s){
 const mode=chooseMode(id,'8.1.1',bandModes(
  s,
  ['largest_sector','read_quantity','missing_angle','complete_label'],
  ['largest_sector','read_quantity','missing_angle','complete_label','infer_total','combine','compare'],
  ['infer_total','combine','compare','validate_chart','reverse_sector','claim','decision']
 ));
 const D=pieData(),{set,drawn,N,th}=D,max=set[0],intro='Carta pai menunjukkan '+th.what+' sekumpulan murid. ';
 if(mode==='largest_sector')return mark(q(pie(drawn)+'Kategori manakah yang mempunyai sektor paling besar?',max.label,others(set,max).map(x=>Nq(x,'pie')),'Sektor terbesar mewakili kuantiti terbesar.','Tahun 6 · Membaca Carta Pai'),id,'8.1.1',mode,'visual','concept',s,['pie_read']);
 if(mode==='read_quantity'){const x=choose(set);return mark(q(pie(drawn)+intro+'Jumlah murid ialah '+N+' orang. Berapakah bilangan murid yang memilih '+x.label+'?',x.value,distinct(x.value,[x.angle,N-x.value,x.value*2,x.value+1],'pie'),x.angle+'° ÷ 360° × '+N+'.','Tahun 6 · Kuantiti Carta Pai'),id,'8.1.1',mode,'visual',stage(s)===1?'concept':'application',s,['pie_quantity']);}
 if(mode==='missing_angle'){const hidden=rand(0,3),ans=drawn[hidden].angle;return mark(q(pie(drawn,{hideAngle:hidden})+'Hitung sudut sektor '+drawn[hidden].label+'.',ans+'°',distinct(ans+'°',[(ans+10)+'°',(ans-10)+'°','360°',(360-ans)+'°'],'pie_angle'),'Jumlah semua sudut sektor ialah 360°.','Tahun 6 · Sudut Hilang Carta Pai'),id,'8.1.1',mode,'symbolic',stage(s)===3?'reasoning':'application',s,['pie_angle']);}
 if(mode==='complete_label'){const k=rand(0,3),x=drawn[k],shown=drawn.map((y,i)=>i===k?{label:'?',angle:y.angle}:{label:y.label,angle:y.angle});return mark(q(pie(shown)+table(['Kategori'].concat(set.map(y=>y.label)),[['Bilangan murid'].concat(set.map(y=>y.value))])+'Sektor bertanda ? mewakili kategori yang mana?',x.label,others(set,x).map(v=>Nq(v,'pie')),x.value+' daripada '+N+' murid = '+x.angle+'°.','Tahun 6 · Melengkapkan Carta Pai'),id,'8.1.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['pie_complete']);}
 if(mode==='infer_total'){const x=choose(set);return mark(q(pie(drawn)+'Sektor '+x.label+' mewakili '+x.value+' orang murid. Berapakah jumlah murid semuanya?',N,distinct(N,[x.value*4,x.angle,N+x.value,360],'pie_quantity'),x.angle+'° ialah '+x.value+' murid; 360° ialah '+N+' murid.','Tahun 6 · Inferens Carta Pai'),id,'8.1.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['pie_quantity','inverse']);}
 if(mode==='combine'){const [a,b]=[set[2],set[3]],ans=a.angle+b.angle;return mark(q(pie(drawn)+'Jika kategori '+a.label+' dan '+b.label+' digabungkan, berapakah sudut sektor yang baharu?',ans+'°',distinct(ans+'°',[a.angle+'°',Math.abs(a.angle-b.angle)+'°',(a.value+b.value)+'°',(360-ans)+'°'],'pie_angle'),a.angle+'° + '+b.angle+'°.','Tahun 6 · Menggabung Kategori Carta Pai'),id,'8.1.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['pie_angle','combine']);}
 if(mode==='compare'){
  const pairs=[];for(const a of set)for(const b of set)if(a!==b&&a.angle%b.angle===0&&a.angle>b.angle)pairs.push([a,b]);
  const [a,b]=pairs.length?choose(pairs):[set[0],set[3]],ratio=Number((a.angle/b.angle).toFixed(1));
  return mark(q(pie(drawn)+'Sudut sektor '+a.label+' ialah berapa kali sudut sektor '+b.label+'?',ratio,distinct(ratio,[ratio+1,Math.max(0.5,ratio-1),a.angle-b.angle,ratio*2],'pie'),a.angle+'° ÷ '+b.angle+'°.','Tahun 6 · Membanding Sektor'),id,'8.1.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['pie_angle','compare']);
 }
 if(mode==='validate_chart'){const ok=choose([true,false]),angles=ok?set.map(x=>x.angle):set.map((x,i)=>i===0?x.angle+choose([-15,-10,10,15]):x.angle),sum=angles.reduce((a,b)=>a+b,0),ans=ok?'ya, jumlahnya 360°':'tidak, jumlahnya '+sum+'°';return mark(q(table(['Sektor','A','B','C','D'],[['Sudut'].concat(angles.map(x=>x+'°'))])+'Adakah carta pai itu lengkap?',ans,distinct(ans,[ok?'tidak, jumlahnya '+(sum+15)+'°':'ya, jumlahnya 360°','tidak, jumlahnya '+(sum-30)+'°','tidak boleh ditentukan'],'pie_angle'),'Carta pai lengkap mesti berjumlah 360°.','Tahun 6 · Semak Carta Pai'),id,'8.1.1',mode,'verbal','reasoning',s,['pie_angle','error_analysis']);}
 if(mode==='reverse_sector'){const x=choose(set);return mark(q('Sebuah carta pai mewakili '+N+' orang murid. Seramai '+x.value+' orang murid memilih '+x.label+'. Hitung sudut sektor '+x.label+'.',x.angle+'°',distinct(x.angle+'°',[x.value+'°',(x.angle+15)+'°',(360-x.angle)+'°'],'pie_angle'),x.value+'/'+N+' × 360°.','Tahun 6 · Sudut daripada Kuantiti'),id,'8.1.1',mode,'story','reasoning',s,['pie_angle','inverse']);}
 if(mode==='claim'){const ang=choose([45,90,120,180]),name=who();return mark(q(name+' berkata sektor '+ang+'° dalam mana-mana carta pai sentiasa mewakili '+ang+' orang. Adakah '+name+' betul?','salah, bilangannya bergantung pada jumlah data',distinct('salah, bilangannya bergantung pada jumlah data',['betul','salah, sektor '+ang+'° sentiasa mewakili '+(ang/2)+' orang','tidak boleh dinilai'],'pie'),ang+'° ialah '+(ang/360===0.5?'separuh':ang/360===0.25?'suku':'sebahagian')+' daripada jumlah, bukan bilangan tetap.','Tahun 6 · Menilai Carta Pai'),id,'8.1.1',mode,'verbal','reasoning',s,['pie_quantity','error_analysis']);}
 return mark(q(pie(drawn)+'Hanya satu kategori boleh dipilih untuk program utama. Kategori manakah yang paling ramai menyokong?',max.label,others(set,max).map(x=>Nq(x,'decision')),'Pilih sektor terbesar.','Tahun 6 · Keputusan daripada Carta Pai'),id,'8.1.1',mode,'visual','reasoning',s,['pie_read','decision']);
};

const CONTEXTS=[
 ['Matahari terbit dari timur esok pagi.','pasti'],
 ['Salji turun di Kuala Lumpur pada bulan Ogos.','mustahil'],
 ['Sekeping syiling dilambung dan mendapat kepala.','sama berkemungkinan'],
 ['Hujan turun pada musim tengkujuh di Kelantan.','lebih berkemungkinan'],
 ['Satu tiket cabutan bertuah daripada 500 tiket memenangi hadiah.','kurang berkemungkinan'],
 ['Hari selepas Isnin ialah Selasa.','pasti'],
 ['Seekor kucing bercakap dalam bahasa Melayu.','mustahil']
];
const SCALE=['mustahil','kurang berkemungkinan','sama berkemungkinan','lebih berkemungkinan','pasti'];
const chanceWord=(r,t)=>r===0?'mustahil':r===t?'pasti':2*r===t?'sama berkemungkinan':2*r>t?'lebih berkemungkinan':'kurang berkemungkinan';
GEN['8.2.1']=function(id,s){
 const mode=chooseMode(id,'8.2.1',bandModes(
  s,
  ['certain','impossible','equal_coin'],
  ['certain','impossible','equal_coin','likely_bag','unlikely_bag'],
  ['likely_bag','unlikely_bag','language_order','claim','context_choice']
 ));
 const [h,item,unit]=pickHolder(),[c1,c2]=pickColours();
 const word=(ans)=>SCALE.filter(x=>x!==ans).sort(()=>Math.random()-.5).slice(0,3).map(x=>Nq(x,'chance'));
 if(mode==='certain')return mark(q('Sebuah '+h+' hanya mengandungi '+rand(3,12)+' '+unit+' '+item+' '+c1+'. Se'+unit+' '+item+' diambil tanpa melihat. Kemungkinan '+item+' itu berwarna '+c1+' ialah...','pasti',word('pasti'),'Semua '+item+' berwarna '+c1+'.','Tahun 6 · Peristiwa Pasti'),id,'8.2.1',mode,'story','concept',s,['chance_category']);
 if(mode==='impossible'){const kind=choose(['dadu','kad']);const n=kind==='dadu'?rand(7,12):rand(11,20),txt=kind==='dadu'?'Sebiji dadu biasa bernombor 1 hingga 6 dilambung. Kemungkinan mendapat nombor '+n+' ialah...':'Terdapat 10 keping kad bernombor 1 hingga 10. Sekeping kad dipilih. Kemungkinan mendapat nombor '+n+' ialah...';return mark(q(txt,'mustahil',word('mustahil'),n+' tiada dalam pilihan.','Tahun 6 · Peristiwa Mustahil'),id,'8.2.1',mode,'story','concept',s,['chance_category']);}
 if(mode==='equal_coin'){const v=choose([['Sekeping syiling dilambung. Kemungkinan mendapat kepala ialah...'],['Sebuah pemutar dibahagi kepada 2 bahagian sama besar, '+c1+' dan '+c2+'. Kemungkinan penunjuk berhenti pada '+c1+' ialah...'],['Sebuah '+h+' mengandungi '+(rand(2,6))+' '+unit+' '+item+' '+c1+' dan bilangan '+item+' '+c2+' yang sama. Kemungkinan mengambil '+item+' '+c1+' ialah...']]);return mark(q(v[0],'sama berkemungkinan',word('sama berkemungkinan'),'Dua hasil mempunyai peluang yang sama.','Tahun 6 · Sama Berkemungkinan'),id,'8.2.1',mode,'story',stage(s)===3?'reasoning':'application',s,['chance_category']);}
 if(mode==='likely_bag'||mode==='unlikely_bag'){
  const big=rand(6,9),small=rand(1,Math.min(4,10-big)||1),r=mode==='likely_bag'?big:small,b=mode==='likely_bag'?small:big,ans=chanceWord(r,r+b);
  return mark(q(bag(r,b)+'Sebiji guli diambil tanpa melihat. Pilih perkataan yang sesuai untuk kemungkinan guli itu berwarna merah.',ans,word(ans),'Banding bilangan guli merah dengan guli biru.','Tahun 6 · '+(mode==='likely_bag'?'Lebih':'Kurang')+' Berkemungkinan'),id,'8.2.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['chance_category']);
 }
 if(mode==='language_order')return mark(q('Susun daripada paling kurang kepada paling pasti: '+[...SCALE].sort(()=>Math.random()-.5).join(', ')+'.',SCALE.join(' → '),[Nq([...SCALE].reverse().join(' → '),'chance'),Nq([SCALE[0],SCALE[2],SCALE[1],SCALE[3],SCALE[4]].join(' → '),'chance'),Nq([SCALE[1],SCALE[0],SCALE[2],SCALE[4],SCALE[3]].join(' → '),'chance')],'Gunakan skala bahasa kebolehjadian.','Tahun 6 · Susunan Kebolehjadian'),id,'8.2.1',mode,'verbal','reasoning',s,['chance_category','order']);
 if(mode==='claim'){
  const r=rand(1,8),b=rand(1,8),truth=chanceWord(r,r+b),name=who(),ok=choose([true,false]),said=ok?truth:choose(SCALE.filter(x=>x!==truth&&x!=='mustahil'&&x!=='pasti'));
  const ans=ok?'betul':'salah, '+truth;
  return mark(q(table([cap(h),cap(item)+' '+c1,cap(item)+' '+c2],[['Bilangan',r,b]])+name+' berkata mengambil '+item+' '+c1+' adalah "'+said+'". Adakah '+name+' betul?',ans,distinct(ans,['betul','salah, '+truth,'salah, '+choose(SCALE.filter(x=>x!==truth&&x!==said)),'tidak boleh ditentukan'],'chance'),'Banding '+r+' dengan '+b+'.','Tahun 6 · Menilai Bahasa Kebolehjadian'),id,'8.2.1',mode,'verbal','reasoning',s,['chance_category','error_analysis']);
 }
 const [txt,ans]=choose(CONTEXTS);
 return mark(q(txt+' Perkataan manakah yang paling sesuai untuk kemungkinan peristiwa itu?',ans,word(ans),'Fikirkan sama ada peristiwa itu pasti, mustahil atau di antaranya.','Tahun 6 · Kebolehjadian dalam Konteks'),id,'8.2.1',mode,'story','reasoning',s,['chance_category','context']);
};

GEN['8.2.2']=function(id,s){
 const mode=chooseMode(id,'8.2.2',bandModes(
  s,
  ['compare_counts','equal_chance'],
  ['compare_counts','equal_chance','compare_different_totals','order_bags','explain'],
  ['compare_different_totals','order_bags','explain','equalize','claim','best_strategy']
 ));
 const [h,item,unit]=pickHolder(),[c1,c2]=pickColours(),H=cap(h),I1=item+' '+c1,I2=item+' '+c2,T1=cap(I1),T2=cap(I2);
 if(mode==='compare_counts'){let a,b;do{a=rand(1,9);b=rand(1,9)}while(a===b);const t=10,ans=a>b?H+' A':H+' B';return mark(q(table([H,T1,T2],[['A',a,t-a],['B',b,t-b]])+H+' manakah lebih berkemungkinan memberi '+I1+'?',ans,distinct(ans,[a>b?H+' B':H+' A','sama berkemungkinan','mustahil kedua-duanya'],'chance_reason'),'A: '+a+'/10; B: '+b+'/10.','Tahun 6 · Membanding Kebolehjadian'),id,'8.2.2',mode,'table','application',s,['chance_reason']);}
 if(mode==='equal_chance'){const r=rand(1,5),bl=rand(1,5),k=rand(2,3);return mark(q(table([H,T1,T2],[['A',r,bl],['B',r*k,bl*k]])+'Se'+unit+' '+item+' diambil tanpa melihat. '+H+' manakah lebih berkemungkinan memberi '+I1+'?','sama bagi kedua-dua '+h,distinct('sama bagi kedua-dua '+h,['lebih tinggi di A','lebih tinggi di B','tidak boleh dibanding'],'chance_reason'),'Bahagian '+c1+' sama: '+r+'/'+(r+bl)+'.','Tahun 6 · Kebolehjadian Setara'),id,'8.2.2',mode,'table',stage(s)===3?'reasoning':'application',s,['chance_reason','ratio']);}
 if(mode==='compare_different_totals'){let a,ta,b,tb;do{ta=choose([5,8,10,12]);tb=choose([10,16,20,24]);a=rand(1,ta-1);b=rand(1,tb-1)}while(a*tb===b*ta||(a>b)===(a*tb>b*ta));const ans=a*tb>b*ta?H+' A':H+' B';return mark(q(table([H,T1,'Jumlah '+item],[['A',a,ta],['B',b,tb]])+H+' manakah lebih berkemungkinan memberi '+I1+'?',ans,distinct(ans,[ans===H+' A'?H+' B':H+' A','sama berkemungkinan','tidak boleh dibanding'],'chance_reason'),'Banding '+a+'/'+ta+' dengan '+b+'/'+tb+', bukan bilangan sahaja.','Tahun 6 · Banding dengan Jumlah Berbeza'),id,'8.2.2',mode,'table',stage(s)===3?'reasoning':'application',s,['chance_reason','compare']);}
 if(mode==='order_bags'){const t=10,vals=[...new Set([rand(1,9),rand(1,9),rand(1,9)])];if(vals.length<3)return GEN['8.2.2'](id,s);const rows=['A','B','C'].map((L,i)=>[L,vals[i],t-vals[i]]),asc=[...rows].sort((x,y)=>x[1]-y[1]).map(r=>r[0]),ans=asc.join(', ');return mark(q(table([H,T1,T2],rows)+'Susun '+h+' daripada paling kurang kepada paling berkemungkinan memberi '+I1+'.',ans,distinct(ans,[[...asc].reverse().join(', '),'A, B, C','C, B, A','B, A, C','A, C, B','B, C, A','C, A, B'],'chance_reason'),'Banding bilangan '+c1+' dalam setiap '+h+'.','Tahun 6 · Susun Kebolehjadian'),id,'8.2.2',mode,'table',stage(s)===3?'reasoning':'application',s,['chance_reason','order']);}
 if(mode==='explain'){let r,b;do{r=rand(2,9);b=rand(1,8)}while(r<=b);const t=r+b,ans='kerana bahagian '+c1+' '+r+'/'+t+' lebih besar daripada bahagian '+c2+' '+b+'/'+t;return mark(q(table([H,T1,T2],[['Bilangan',r,b]])+'Se'+unit+' '+item+' diambil tanpa melihat. Mengapakah '+I1+' lebih berkemungkinan dipilih?',ans,[Nq('kerana '+c1+' sentiasa bertuah','chance_reason'),Nq('kerana '+I1+' pasti dipilih','chance_reason'),Nq('kerana ada dua warna sahaja','chance_reason')],'Banding bahagian setiap warna.','Tahun 6 · Memberi Sebab Kebolehjadian'),id,'8.2.2',mode,'table',stage(s)===3?'reasoning':'application',s,['chance_reason']);}
 if(mode==='equalize'){let r,b;do{r=rand(1,8);b=rand(2,10)}while(r>=b);const ans=b-r;return mark(q(table([H,T1,T2],[['Bilangan',r,b]])+'Berapakah bilangan '+I1+' yang perlu ditambah supaya mengambil '+I1+' dan '+I2+' sama berkemungkinan?',ans,distinct(ans,[ans+1,b,r,Math.max(1,ans-1)],'chance_reason'),'Bilangan kedua-dua warna mesti sama.','Tahun 6 · Mengubah Kebolehjadian'),id,'8.2.2',mode,'table','reasoning',s,['chance_reason','inverse']);}
 if(mode==='claim'){let a,ta,b,tb;do{ta=choose([5,8,10]);tb=choose([16,20,24]);a=rand(2,ta-1);b=rand(a+1,tb-1)}while(a*tb<=b*ta);const name=who();return mark(q(table([H,T1,'Jumlah '+item],[['A',a,ta],['B',b,tb]])+name+' kata '+H+' B lebih berkemungkinan memberi '+I1+' kerana bilangannya lebih banyak. Adakah '+name+' betul?','salah, A lebih berkemungkinan kerana '+a+'/'+ta+' > '+b+'/'+tb,distinct('salah, A lebih berkemungkinan kerana '+a+'/'+ta+' > '+b+'/'+tb,['betul','salah, kedua-duanya sama','tidak boleh dibanding'],'chance_reason'),'Banding pecahan, bukan bilangan sahaja.','Tahun 6 · Analisis Kebolehjadian'),id,'8.2.2',mode,'table','reasoning',s,['chance_reason','error_analysis']);}
 let rows;do{rows=['A','B','C'].map(L=>{const t=choose([8,10,12,16,20]);return [L,rand(1,t-1),t]})}while(new Set(rows.map(r=>r[1]/r[2])).size<3);
 const best=[...rows].sort((x,y)=>y[1]/y[2]-x[1]/x[2])[0][0],thing=choose(['Kotak','Balang','Peti']);
 return mark(q(table([thing,'Hadiah','Jumlah bungkusan'],rows)+thing+' manakah paling berkemungkinan memberi hadiah?',thing+' '+best,['A','B','C'].filter(x=>x!==best).map(x=>Nq(thing+' '+x,'chance_reason')).concat([Nq('semua sama','chance_reason')]).slice(0,3),'Banding hadiah ÷ jumlah bagi setiap '+thing.toLowerCase()+'.','Tahun 6 · Strategi Kebolehjadian'),id,'8.2.2',mode,'table','reasoning',s,['chance_reason','decision']);
};

GEN['8.3.1']=function(id,s){
 const mode=chooseMode(id,'8.3.1',bandModes(
  s,
  ['largest_data','simple_chance','combine_data'],
  ['largest_data','simple_chance','combine_data','infer_total','decision','compare'],
  ['infer_total','decision','compare','claim','chance_from_data','threshold','multi_step']
 ));
 const D=pieData(),{set,drawn,N,th}=D,max=set[0],dataTable=()=>table(['Pilihan','Bilangan murid'],set.map(x=>[x.label,x.value]));
 if(mode==='largest_data')return mark(q(pie(drawn)+'Carta pai menunjukkan '+th.what+'. Kategori manakah yang mendapat sokongan paling tinggi?',max.label,others(set,max).map(x=>Nq(x,'data')),'Cari sektor terbesar.','Tahun 6 · Tafsir Data'),id,'8.3.1',mode,'visual','application',s,['data_reason']);
 if(mode==='simple_chance')return mark(q(dataTable()+'Seorang murid dipilih secara rawak. Pilihan manakah yang paling berkemungkinan menjadi pilihannya?',max.label,others(set,max).map(x=>Nq(x,'chance_reason')),'Kategori dengan bilangan tertinggi paling berkemungkinan.','Tahun 6 · Data dan Kebolehjadian'),id,'8.3.1',mode,'table','application',s,['data_reason','chance_reason']);
 if(mode==='combine_data'){const [a,b]=[set[2],set[3]],ans=a.value+b.value;return mark(q(pie(drawn)+'Jumlah murid ialah '+N+' orang. Jika kategori '+a.label+' dan '+b.label+' digabungkan, berapakah bilangan murid dalam kategori baharu itu?',ans,distinct(ans,[a.angle+b.angle,a.value,N-ans,ans+1],'data'),'Cari bilangan bagi setiap kategori, kemudian tambah.','Tahun 6 · Menggabung Data'),id,'8.3.1',mode,'visual','application',s,['data_reason','combine']);}
 if(mode==='infer_total'){const x=choose(set);return mark(q(pie(drawn)+'Sektor '+x.label+' mewakili '+x.value+' orang murid. Berapakah jumlah murid semuanya?',N,distinct(N,[x.value*4,x.angle,N+x.value,360],'pie_quantity'),x.angle+'° mewakili '+x.value+' murid.','Tahun 6 · Inferens Jumlah Data'),id,'8.3.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['data_reason','inverse']);}
 if(mode==='decision')return mark(q(pie(drawn)+'Sekolah hanya boleh memilih satu aktiviti yang paling ramai disokong. Aktiviti manakah yang patut dipilih?',max.label,others(set,max).map(x=>Nq(x,'decision')),'Gunakan data, bukan andaian.','Tahun 6 · Keputusan Berdasarkan Data'),id,'8.3.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['data_reason','decision']);
 if(mode==='compare'){const b=rand(3,15),k=rand(2,5),a=b*k,[la,lb]=[th.labels[0],th.labels[1]];return mark(q(table(['Pilihan','Bilangan murid'],[[la,a],[lb,b]])+'Bilangan murid yang memilih '+la+' ialah berapa kali bilangan murid yang memilih '+lb+'?',k,distinct(k,[a-b,k+1,b,a],'data_reason'),a+' ÷ '+b+' = '+k+'.','Tahun 6 · Membanding Data'),id,'8.3.1',mode,'table',stage(s)===3?'reasoning':'application',s,['data_reason','compare']);}
 if(mode==='claim'){const [A,B,C]=[set[0],set[1],set[2]],sum=B.value+C.value,name=who(),more=sum>A.value,ans=more?'betul, '+B.label+' + '+C.label+' = '+sum:'salah, '+B.label+' + '+C.label+' = '+sum+(sum===A.value?' sama dengan ':' kurang daripada ')+A.label+' = '+A.value;return mark(q(dataTable()+name+' berkata jumlah '+B.label+' dan '+C.label+' lebih banyak daripada '+A.label+'. Adakah '+name+' betul?',ans,distinct(ans,[more?'salah, '+B.label+' + '+C.label+' = '+sum:'betul, '+B.label+' + '+C.label+' = '+sum,'betul kerana dua kategori sentiasa lebih besar','tidak boleh ditentukan'],'data_reason'),'Jumlahkan dua kategori sebelum membanding.','Tahun 6 · Menilai Dakwaan Data'),id,'8.3.1',mode,'table','reasoning',s,['data_reason','error_analysis']);}
 if(mode==='chance_from_data'){const A=set[0],rest=N-A.value,ans=A.value===rest?'sama berkemungkinan':A.value>rest?'memilih '+A.label+' lebih berkemungkinan':'memilih '+A.label+' kurang berkemungkinan';return mark(q(dataTable()+'Seorang murid dipilih secara rawak. Bandingkan kemungkinan dia memilih '+A.label+' dengan tidak memilih '+A.label+'.',ans,distinct(ans,['sama berkemungkinan','memilih '+A.label+' lebih berkemungkinan','memilih '+A.label+' kurang berkemungkinan','memilih '+A.label+' mustahil'],'chance_reason'),A.label+' = '+A.value+'; bukan '+A.label+' = '+rest+'.','Tahun 6 · Kebolehjadian daripada Data'),id,'8.3.1',mode,'table','reasoning',s,['data_reason','chance_reason']);}
 if(mode==='threshold'){const k=choose([2,3]),A=set[0],B=set[1],ok=A.value>=k*B.value,ans=ok?A.label:'tiada';return mark(q(table(['Kategori','Sokongan'],set.map(x=>[x.label,x.value]))+'Kategori layak jika sokongannya sekurang-kurangnya '+k+' kali sokongan kategori kedua tertinggi. Kategori manakah layak?',ans,distinct(ans,[ok?'tiada':A.label,B.label,set[2].label,set[3].label],'data_reason'),A.label+' = '+A.value+'; '+k+' × '+B.value+' = '+(k*B.value)+'.','Tahun 6 · Ambang Keputusan Data'),id,'8.3.1',mode,'table','reasoning',s,['data_reason','threshold']);}
 const b=rand(5,30),move=rand(2,10),a=b+2*move+choose([0,0,-2,2,4]),A2=a-move,B2=b+move,ans=A2===B2?'sama berkemungkinan':A2>B2?'A lebih berkemungkinan':'B lebih berkemungkinan';
 return mark(q(table(['Pilihan','Bilangan murid'],[['A',a],['B',b]])+'Kemudian, '+move+' murid bertukar dari A ke B. Seorang murid dipilih secara rawak. Bandingkan kemungkinan dia memilih A dengan B.',ans,distinct(ans,['sama berkemungkinan','A lebih berkemungkinan','B lebih berkemungkinan','tidak boleh dibanding'],'chance_reason'),'A = '+a+' − '+move+' = '+A2+'; B = '+b+' + '+move+' = '+B2+'.','Tahun 6 · Masalah Data Pelbagai Langkah'),id,'8.3.1',mode,'table','reasoning',s,['data_reason','chance_reason','multi_step']);
};

document.documentElement?.setAttribute('data-y6-v2-unit8','3.61.0');
})();
