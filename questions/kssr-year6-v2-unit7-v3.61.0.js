// Year 6 Curriculum Bank v2 — Unit 7: Koordinat, Nisbah dan Kadaran
(function(){
'use strict';
const RT=window.PAY6V2Runtime;if(!RT)return;
const {GEN,Nq,choose,q,mark,chooseMode,bandModes,stage,coord,table}=RT;

function localCoordMap(spec){
 const W=360,H=360,left=34,top=22,right=22,bottom=34,cw=(W-left-right)/8,ch=(H-top-bottom)/8;
 const px=x=>left+x*cw,py=y=>top+(8-y)*ch;
 let g='';
 for(let x=0;x<=8;x++)g+=`<line x1="${px(x)}" y1="${top}" x2="${px(x)}" y2="${H-bottom}" stroke="#d8e2ef" stroke-width="1"/>`;
 for(let y=0;y<=8;y++)g+=`<line x1="${left}" y1="${py(y)}" x2="${W-right}" y2="${py(y)}" stroke="#d8e2ef" stroke-width="1"/>`;
 const points=spec.points.map(p=>`<circle cx="${px(p.x)}" cy="${py(p.y)}" r="7" fill="#ffca62" stroke="#263b5d" stroke-width="2"/><text x="${px(p.x)}" y="${py(p.y)-10}" text-anchor="middle" font-size="11" font-weight="800" fill="#263b5d">${p.label}</text>`).join('');
 const axes=`<line x1="${left}" y1="${py(0)}" x2="${W-right}" y2="${py(0)}" stroke="#526987" stroke-width="2"/><line x1="${left}" y1="${top}" x2="${left}" y2="${py(0)}" stroke="#526987" stroke-width="2"/>`;
 const ticks=[...Array(9)].map((_,x)=>`<text x="${px(x)}" y="${H-20}" text-anchor="middle" font-size="12" fill="#526987">${x}</text>`).join('');
 const yt=[...Array(9)].map((_,y)=>`<text x="16" y="${py(y)+3}" text-anchor="middle" font-size="12" fill="#526987">${y}</text>`).join('');
 const legend=spec.points.map(p=>`<span style="display:inline-block;margin-right:9px"><b>${p.label}</b> = ${p.name}</span>`).join('');
 return `<div><svg viewBox="0 0 ${W} ${H}" width="360" height="360" role="img" aria-label="Peta koordinat grid 0 hingga 8 pada kedua-dua paksi" style="display:block;max-width:100%;height:auto;margin:0 auto 5px;background:#f8fbff;border:1px solid #b9c9dc;border-radius:8px">${g}${axes}${points}${ticks}${yt}<text x="${W-20}" y="${H-7}" font-size="12" fill="#526987">x</text><text x="12" y="12" font-size="12" fill="#526987">y</text></svg><div style="font-size:11px;line-height:1.45;text-align:center">${legend}</div></div>`;
}
function coordMapSpec(mode){
 const layouts=[[[1,1],[3,4],[5,1],[6,5],[8,2]],[[1,4],[2,1],[4,3],[7,1],[8,5]],[[1,2],[3,5],[4,1],[6,3],[8,4]],[[1,5],[2,2],[5,4],[7,2],[8,1]]];
 const names=['Perpustakaan','Kantin','Dewan','Makmal','Taman'];
 const xy=choose(layouts), ns=names.slice().sort(()=>Math.random()-.5);
 return {mode,scale:choose([2,3,5]),points:xy.map((v,i)=>({x:v[0],y:v[1],label:String.fromCharCode(65+i),name:ns[i]})),from:null,to:null,target:null,movements:null,math:null};
}
function coordPair(spec,unequal){
 const pairs=[];for(const a of spec.points)for(const b of spec.points)if(a!==b){const dx=Math.abs(b.x-a.x),dy=Math.abs(b.y-a.y);if(dx&&dy&&(!unequal||dx!==dy))pairs.push([a,b])}
 return choose(pairs);
}
function tupleWrongs(p){
 const out=[],seen=new Set([`(${p.x},${p.y})`]);
 [[p.y,p.x],[p.x+1,p.y],[p.x,p.y+1],[p.x-1,p.y],[p.x,p.y-1]].forEach(v=>{if(v[0]>=0&&v[0]<=8&&v[1]>=0&&v[1]<=8){const s=`(${v[0]},${v[1]})`;if(!seen.has(s)){seen.add(s);out.push(s)}}});
 return out.slice(0,3);
}
function mapMark(out,id,mode,rep,demand,s,spec,targets){out.coordMapSpec=spec;return mark(out,id,'7.1.1',mode,rep,demand,s,targets)}
function dirText(dx,dy){return `${Math.abs(dx)} petak ${dx<0?'ke kiri':'ke kanan'} dan ${Math.abs(dy)} petak ${dy<0?'ke bawah':'ke atas'}`}
function pairText(h,v){return `mengufuk ${h} km, mencancang ${v} km`}
function pairWrongs(h,v,scale){return [...new Set([pairText(v,h),pairText(h+scale,v),pairText(h,v+scale),pairText(h+scale,v+scale),pairText(Math.max(scale,h-scale),v)])].filter(x=>x!==pairText(h,v)).slice(0,3)}

GEN['7.1.1']=function(id,s){
 const mode=chooseMode(id,'7.1.1',bandModes(
  s,
  ['map_coordinate','map_destination','petak_scale','direction','missing_point'],
  ['map_destination','map_distances','map_scaled_destination','petak_scale','direction','missing_point','cm_scale','representative_scale','route'],
  ['map_distances','map_scaled_destination','cm_scale','representative_scale','route','scale_reverse','route_compare','coord_error']
  ));
 if(mode==='map_coordinate'){
  const spec=coordMapSpec(mode),p=choose(spec.points), answer=`(${p.x},${p.y})`, wrong=tupleWrongs(p); spec.target=p.label;
  return mapMark(q(localCoordMap(spec)+'Apakah koordinat bagi '+p.name+'? ',answer,wrong.map(x=>Nq(x,'coord')),'Baca nilai x dahulu, kemudian nilai y.','Tahun 6 · Koordinat Peta'),id,mode,'visual',stage(s)===3?'reasoning':'application',s,spec,['coord','visual_reading']);
 }
 if(mode==='map_destination'){
  const spec=coordMapSpec(mode),[from,to]=coordPair(spec,false),dx=to.x-from.x,dy=to.y-from.y; spec.from=from.label;spec.to=to.label;spec.target=to.label;spec.movements={dx,dy};spec.math={horizontalPetak:Math.abs(dx),verticalPetak:Math.abs(dy)};
  const wrong=spec.points.filter(p=>p!==to).slice(0,3).map(p=>Nq(p.name,'coord'));
  return mapMark(q(localCoordMap(spec)+'Dari '+from.name+', bergerak '+dirText(dx,dy)+'. Di manakah destinasi itu?',to.name,wrong,'Ikut perubahan mengufuk pada x dan mencancang pada y.','Tahun 6 · Destinasi Peta'),id,mode,'visual',stage(s)===3?'reasoning':'application',s,spec,['coord','direction','map_reasoning']);
 }
 if(mode==='map_distances'){
  const spec=coordMapSpec(mode),[from,to]=coordPair(spec,true),dx=Math.abs(to.x-from.x),dy=Math.abs(to.y-from.y),h=dx*spec.scale,v=dy*spec.scale,answer=pairText(h,v); spec.from=from.label;spec.to=to.label;spec.target=to.label;spec.movements={dx:to.x-from.x,dy:to.y-from.y};spec.math={horizontalPetak:dx,verticalPetak:dy,horizontalKm:h,verticalKm:v};
  const wrong=pairWrongs(h,v,spec.scale);
  return mapMark(q(localCoordMap(spec)+'Antara '+from.name+' dan '+to.name+', jika 1 petak = '+spec.scale+' km, berapakah jarak sebenar bagi pasangan mengufuk dan mencancang? Nyatakan kedua-duanya dalam km.',answer,wrong.map(x=>Nq(x,'scale')),'Kira beza x dan y, kemudian darab setiap satu dengan skala '+spec.scale+' km bagi satu petak.','Tahun 6 · Jarak Mengufuk dan Mencancang'),id,mode,'visual','reasoning',s,spec,['coord','scale','distance_pair','swap_error']);
 }
 if(mode==='map_scaled_destination'){
  const spec=coordMapSpec(mode),[from,to]=coordPair(spec,true),dx=Math.abs(to.x-from.x),dy=Math.abs(to.y-from.y),h=dx*spec.scale,v=dy*spec.scale,answer=to.name; spec.from=from.label;spec.to=to.label;spec.target=to.label;spec.movements={dx:to.x-from.x,dy:to.y-from.y};spec.math={horizontalPetak:dx,verticalPetak:dy,horizontalKm:h,verticalKm:v};
  const wrong=spec.points.filter(p=>p!==to).slice(0,3).map(p=>Nq(p.name,'coord'));
  return mapMark(q(localCoordMap(spec)+'Skala peta ialah 1 petak = '+spec.scale+' km. Dari '+from.name+', Hana bergerak '+h+' km '+(to.x<from.x?'ke kiri':'ke kanan')+' dan '+v+' km '+(to.y<from.y?'ke bawah':'ke atas')+'. Ke manakah Hana pergi?',answer,wrong,'Bahagi setiap jarak dengan skala untuk mendapatkan bilangan petak, kemudian ikut arah pergerakan.','Tahun 6 · Destinasi Berskala'),id,mode,'visual','reasoning',s,spec,['coord','scale','direction','map_reasoning']);
 }
 if(mode==='petak_scale'){
  const sc=choose([2,5,10]),dx=choose([2,3,4]),ans=dx*sc;
  return mark(q('Jarak mengufuk antara dua titik ialah '+dx+' petak. Jika 1 petak mewakili '+sc+' km, berapakah jarak sebenar antara kedua-dua titik?',''+ans+' km',[Nq(dx+' km','scale'),Nq((ans+sc)+' km','scale'),Nq((dx+sc)+' km','operation')],'Darab bilangan petak dengan skala.','Tahun 6 · Jarak Berskala'),id,'7.1.1',mode,'verbal',stage(s)===1?'application':'application',s,['coord','scale']);
 }
 if(mode==='direction'){
  return mark(q(coord([{x:1,y:2,label:'A'},{x:4,y:5,label:'B'}])+'Apakah pergerakan yang betul dari titik A ke titik B?','3 petak kanan, 3 petak atas',[Nq('3 petak kiri, 3 petak atas','coord'),Nq('3 petak kanan, 3 petak bawah','coord'),Nq('4 petak kanan, 5 petak atas','coord')],'Banding perubahan x dan y.','Tahun 6 · Arah Koordinat'),id,'7.1.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['coord','direction']);
 }
 if(mode==='missing_point'){
  return mark(q('A berada pada (2,3). B ialah 3 petak ke kanan dan 2 petak ke atas A. Apakah koordinat titik B?','(5,5)',[Nq('(5,1)','coord'),Nq('(4,6)','coord'),Nq('(3,2)','coord')],'Tambah 3 pada x dan 2 pada y.','Tahun 6 · Titik Hilang'),id,'7.1.1',mode,'verbal',stage(s)===3?'reasoning':'application',s,['coord','inverse']);
 }
 if(mode==='cm_scale'){
  return mark(q('Pada peta, jarak A ke B ialah 6 cm. Skala 1 cm mewakili 2 km. Berapakah jarak sebenar?','12 km',[Nq('3 km','scale'),Nq('6 km','scale'),Nq('8 km','scale')],'6 × 2 km.','Tahun 6 · Skala Peta'),id,'7.1.1',mode,'story',stage(s)===3?'reasoning':'application',s,['coord','scale']);
 }
 if(mode==='representative_scale'){
  return mark(q('Skala peta ialah 1 : 100 000. Jarak pada peta 4 cm. Berapakah jarak sebenar?','4 km',[Nq('400 m','scale'),Nq('40 km','scale'),Nq('400 km','scale')],'1 : 100 000 bermaksud 1 cm mewakili 100 000 cm = 1 km.','Tahun 6 · Skala Wakilan'),id,'7.1.1',mode,'story',stage(s)===3?'reasoning':'application',s,['coord','scale','unit_conversion']);
 }
 if(mode==='route'){
  return mark(q(coord([{x:1,y:1,label:'A'},{x:4,y:1,label:'B'},{x:4,y:5,label:'C'}],5)+'Laluan A→B→C. 1 petak = 5 km. Berapakah jumlah jarak perjalanan?','35 km',[Nq('7 km','coord'),Nq('20 km','coord'),Nq('45 km','coord')],'A→B=3 petak, B→C=4 petak; jumlah 7 petak ×5 km.','Tahun 6 · Laluan Koordinat Berskala'),id,'7.1.1',mode,'visual',stage(s)===3?'reasoning':'application',s,['coord','scale','route']);
 }
 if(mode==='scale_reverse'){
  return mark(q('A(1,2) ke B(5,2) mempunyai jarak sebenar 20 km. Berapakah skala bagi 1 petak?','5 km',[Nq('4 km','scale'),Nq('10 km','scale'),Nq('20 km','scale')],'Beza x=4 petak; 20 ÷ 4.','Tahun 6 · Menentukan Skala'),id,'7.1.1',mode,'verbal','reasoning',s,['coord','scale','inverse']);
 }
 if(mode==='route_compare'){
  return mark(q(table(['Laluan','Bilangan petak'],[['A→B→D',7],['A→C→D',9]])+'Jika 1 petak=2 km, laluan lebih pendek dan beza jarak?','A→B→D, lebih pendek 4 km',[Nq('A→C→D, lebih pendek 4 km','route'),Nq('A→B→D, lebih pendek 2 km','route'),Nq('kedua-duanya sama','route')],'Beza 2 petak ×2 km.','Tahun 6 · Membanding Laluan'),id,'7.1.1',mode,'table','reasoning',s,['coord','route','compare']);
 }
 return mark(q('Murid mengira jarak A(1,1) ke B(4,5) sebagai 4 petak dengan hanya melihat perubahan y. Berapakah jumlah petak yang betul bagi laluan mengufuk kemudian mencancang?','7 petak',[Nq('4 petak','coord'),Nq('5 petak','coord'),Nq('12 petak','coord')],'Perubahan x=3 dan y=4; jumlah 7 petak.','Tahun 6 · Analisis Laluan Koordinat'),id,'7.1.1',mode,'verbal','reasoning',s,['coord','error_analysis']);
};

GEN['7.2.1']=function(id,s){
 const mode=chooseMode(id,'7.2.1',bandModes(
  s,
  ['simplify','equivalent','same_unit'],
  ['simplify','equivalent','same_unit','length_units','mass_units','liquid_units','money_ratio'],
  ['length_units','mass_units','liquid_units','ratio_compare','ratio_error','ratio_from_total']
 ));
 if(mode==='simplify')return mark(q('Ringkaskan nisbah 18:24.','3:4',[Nq('6:8','ratio'),Nq('9:12','ratio'),Nq('4:3','ratio')],'Bahagi kedua-dua bahagian dengan faktor sepunya terbesar, 6.','Tahun 6 · Nisbah Termudah'),id,'7.2.1',mode,'symbolic',stage(s)===1?'procedure':'application',s,['ratio']);
 if(mode==='equivalent')return mark(q('Nisbah setara bagi 3:5 ialah?','12:20',[Nq('6:8','ratio'),Nq('9:10','ratio'),Nq('15:20','ratio')],'Darab kedua-dua bahagian dengan faktor yang sama.','Tahun 6 · Nisbah Setara'),id,'7.2.1',mode,'symbolic',stage(s)===1?'concept':'application',s,['ratio']);
 if(mode==='same_unit')return mark(q('Nisbah 2 kg : 500 g dalam bentuk termudah ialah?','4:1',[Nq('2:500','ratio'),Nq('1:4','ratio'),Nq('20:5','ratio')],'2 kg=2000 g; 2000:500=4:1.','Tahun 6 · Nisbah dan Unit'),id,'7.2.1',mode,'verbal',stage(s)===3?'reasoning':'application',s,['ratio','unit_conversion']);
 if(mode==='length_units')return mark(q('Nisbah 3 m : 75 cm dalam bentuk termudah?','4:1',[Nq('3:75','ratio'),Nq('1:4','ratio'),Nq('40:1','ratio')],'3 m=300 cm; 300:75=4:1.','Tahun 6 · Nisbah Panjang'),id,'7.2.1',mode,'verbal',stage(s)===3?'reasoning':'application',s,['ratio','length']);
 if(mode==='mass_units')return mark(q('Nisbah 750 g : 1.5 kg dalam bentuk termudah?','1:2',[Nq('750:1.5','ratio'),Nq('2:1','ratio'),Nq('5:10','ratio')],'1.5 kg=1500 g.','Tahun 6 · Nisbah Jisim'),id,'7.2.1',mode,'verbal',stage(s)===3?'reasoning':'application',s,['ratio','mass']);
 if(mode==='liquid_units')return mark(q('Nisbah 600 mL : 1.2 L dalam bentuk termudah?','1:2',[Nq('600:1.2','ratio'),Nq('2:1','ratio'),Nq('6:12','ratio')],'1.2 L=1200 mL.','Tahun 6 · Nisbah Isi Padu'),id,'7.2.1',mode,'verbal',stage(s)===3?'reasoning':'application',s,['ratio','liquid']);
 if(mode==='money_ratio')return mark(q('Nisbah RM12 : RM18 dalam bentuk termudah?','2:3',[Nq('12:18','ratio'),Nq('3:2','ratio'),Nq('6:9','ratio')],'Bahagi kedua-duanya dengan 6.','Tahun 6 · Nisbah Wang'),id,'7.2.1',mode,'symbolic',stage(s)===3?'reasoning':'application',s,['ratio','money']);
 if(mode==='ratio_compare')return mark(q('Campuran A sirap:air=2:3. Campuran B=3:5. Yang mempunyai bahagian sirap lebih besar?','Campuran A',[Nq('Campuran B','ratio'),Nq('sama','ratio'),Nq('tidak boleh dibanding','ratio')],'Banding 2/5 dengan 3/8.','Tahun 6 · Membanding Nisbah'),id,'7.2.1',mode,'verbal','reasoning',s,['ratio','compare']);
 if(mode==='ratio_error')return mark(q('Murid berkata 4:6 setara dengan 6:8 kerana kedua-duanya tambah 2. Penilaian?','salah',[Nq('betul','ratio'),Nq('betul jika nombor genap','ratio'),Nq('tidak boleh dinilai','ratio')],'Nisbah setara perlu faktor darab/bahagi yang sama.','Tahun 6 · Analisis Nisbah Setara'),id,'7.2.1',mode,'verbal','reasoning',s,['ratio','error_analysis']);
 return mark(q('Nisbah A:B=2:3 dan jumlah A+B=25. Nilai A?',10,[Nq(15,'ratio'),Nq(5,'ratio'),Nq(20,'ratio')],'Jumlah bahagian=5; satu bahagian=5; A=10.','Tahun 6 · Nisbah daripada Jumlah'),id,'7.2.1',mode,'story','reasoning',s,['ratio','partition']);
};

GEN['7.3.1']=function(id,s){
 const mode=chooseMode(id,'7.3.1',bandModes(
  s,
  ['direct','table'],
  ['direct','table','recipe','unit_rate','missing'],
  ['recipe','unit_rate','missing','compare_rates','proportion_error','reverse']
 ));
 if(mode==='direct')return mark(q('Nisbah 2 bahagian merah kepada 3 bahagian biru. Jika merah=12, biru=?',18,[Nq(8,'proportion'),Nq(15,'proportion'),Nq(24,'proportion')],'Faktor skala=12÷2=6; biru=3×6.','Tahun 6 · Kadaran'),id,'7.3.1',mode,'symbolic',stage(s)===1?'application':'application',s,['proportion']);
 if(mode==='table')return mark(q(table(['A','B'],[[3,5],[12,'?']])+'Lengkapkan jadual kadaran.',20,[Nq(14,'proportion'),Nq(15,'proportion'),Nq(60,'proportion')],'3→12 ialah ×4; 5→20 juga ×4.','Tahun 6 · Jadual Kadaran'),id,'7.3.1',mode,'table',stage(s)===3?'reasoning':'application',s,['proportion','table']);
 if(mode==='recipe')return mark(q('Resipi untuk 4 orang menggunakan 300 g tepung. Untuk 10 orang pada kadar sama, berapa gram?',750,[Nq(600,'proportion'),Nq(1200,'proportion'),Nq(3000,'proportion')],'300÷4=75 g seorang; ×10.','Tahun 6 · Kadaran Resipi'),id,'7.3.1',mode,'story',stage(s)===3?'reasoning':'application',s,['proportion','context']);
 if(mode==='unit_rate')return mark(q('4 botol menggunakan 10 L air. Pada kadar sama, 10 botol menggunakan?','25 L',[Nq('16 L','proportion'),Nq('20 L','proportion'),Nq('40 L','proportion')],'10÷4=2.5 L setiap botol; ×10.','Tahun 6 · Kadar Unit'),id,'7.3.1',mode,'story',stage(s)===3?'reasoning':'application',s,['proportion','unit_rate']);
 if(mode==='missing')return mark(q('6 buku berharga RM42. Pada kadar sama, berapa buku boleh dibeli dengan RM70?',10,[Nq(8,'proportion'),Nq(12,'proportion'),Nq(14,'proportion')],'Harga sebuah=RM7; RM70÷7.','Tahun 6 · Nilai Hilang Kadaran'),id,'7.3.1',mode,'story',stage(s)===3?'reasoning':'application',s,['proportion','inverse']);
 if(mode==='compare_rates')return mark(q('Pakej A: 6 botol RM18. Pakej B: 10 botol RM28. Yang lebih murah sebotol?','Pakej B',[Nq('Pakej A','proportion'),Nq('sama','proportion'),Nq('tidak boleh dibanding','proportion')],'A=RM3/botol; B=RM2.80/botol.','Tahun 6 · Membanding Kadar'),id,'7.3.1',mode,'story','reasoning',s,['proportion','compare']);
 if(mode==='proportion_error')return mark(q('Murid berkata jika 3 m kain berharga RM24, 6 m berharga RM30 kerana tambah 3 dan tambah 6. Penilaian?','salah, 6 m berharga RM48',[Nq('betul','proportion'),Nq('salah, RM27','proportion'),Nq('salah, RM72','proportion')],'Panjang dua kali ganda, harga juga dua kali ganda.','Tahun 6 · Analisis Kadaran'),id,'7.3.1',mode,'verbal','reasoning',s,['proportion','error_analysis']);
 return mark(q('Pada kadar sama, 8 unit memerlukan 20 minit. Jika masa yang ada 50 minit, berapa unit boleh disiapkan?',20,[Nq(16,'proportion'),Nq(25,'proportion'),Nq(40,'proportion')],'Kadar 8/20=0.4 unit/minit; ×50.','Tahun 6 · Kadaran Songsang kepada Kuantiti'),id,'7.3.1',mode,'story','reasoning',s,['proportion','inverse']);
};

GEN['7.4.1']=function(id,s){
 const mode=chooseMode(id,'7.4.1',bandModes(
  s,
  ['route_problem','ratio_problem','proportion_problem'],
  ['route_problem','ratio_problem','proportion_problem','map_budget','recipe_route'],
  ['map_budget','recipe_route','compare_plans','multi_constraint','claim','reverse_problem']
 ));
 if(mode==='route_problem')return mark(q('Pada grid, A→B=4 petak dan B→C=3 petak. Skala 1 petak=2 km. Jumlah perjalanan?','14 km',[Nq('7 km','route'),Nq('10 km','route'),Nq('16 km','route')],'(4+3)×2.','Tahun 6 · Masalah Koordinat Berskala'),id,'7.4.1',mode,'story','application',s,['coord','scale']);
 if(mode==='ratio_problem')return mark(q('Jus:air=2:5. Jika jumlah campuran 28 L, berapa liter jus?',8,[Nq(20,'ratio'),Nq(10,'ratio'),Nq(4,'ratio')],'Jumlah bahagian=7; satu bahagian=4 L; jus=8 L.','Tahun 6 · Masalah Nisbah'),id,'7.4.1',mode,'story','application',s,['ratio','partition']);
 if(mode==='proportion_problem')return mark(q('5 tiket berharga RM30. Berapakah harga 12 tiket pada kadar sama?','RM72',[Nq('RM60','proportion'),Nq('RM62','proportion'),Nq('RM120','proportion')],'RM6 setiap tiket; 12×6.','Tahun 6 · Masalah Kadaran'),id,'7.4.1',mode,'story','application',s,['proportion']);
 if(mode==='map_budget')return mark(q('Jarak peta 7 cm pada skala 1 cm=3 km. Kos perjalanan RM2 setiap km. Jumlah kos?','RM42',[Nq('RM21','scale'),Nq('RM14','scale'),Nq('RM63','scale')],'Jarak=21 km; kos=21×RM2.','Tahun 6 · Skala dan Kos'),id,'7.4.1',mode,'story',stage(s)===3?'reasoning':'application',s,['scale','multi_step']);
 if(mode==='recipe_route')return mark(q('Pasukan berjalan 12 km. Setiap 4 km memerlukan 3 botol air. Berapa botol perlu dibawa?',9,[Nq(6,'proportion'),Nq(12,'proportion'),Nq(16,'proportion')],'12÷4=3 kumpulan; 3×3 botol.','Tahun 6 · Kadaran dalam Perjalanan'),id,'7.4.1',mode,'story',stage(s)===3?'reasoning':'application',s,['proportion','route']);
 if(mode==='compare_plans')return mark(q(table(['Pelan','Jarak','Kos/km'],[['A','18 km','RM2'],['B','15 km','RM2.50']])+'Pelan mana lebih murah?','Pelan A, RM36',[Nq('Pelan B, RM37.50','decision'),Nq('kedua-duanya sama','decision'),Nq('Pelan B kerana jarak lebih pendek','decision')],'Kira jumlah kos, bukan jarak sahaja.','Tahun 6 · Membanding Pelan Perjalanan'),id,'7.4.1',mode,'table','reasoning',s,['route','decision']);
 if(mode==='multi_constraint')return mark(q('Campuran merah:biru=2:3. Sebanyak 10 L merah tersedia dan setiap bekas memuatkan 5 L campuran. Berapa bekas penuh maksimum boleh dihasilkan pada nisbah itu?','5 bekas',[Nq('2 bekas','ratio'),Nq('4 bekas','ratio'),Nq('10 bekas','ratio')],'10 L merah ialah 2/5 campuran; jumlah campuran 25 L; 25÷5=5.','Tahun 6 · Masalah Nisbah Pelbagai Langkah'),id,'7.4.1',mode,'story','reasoning',s,['ratio','multi_step']);
 if(mode==='claim')return mark(q('Murid berkata skala 1:100 000 bermaksud 1 cm pada peta = 100 km sebenar. Penilaian?','salah, 1 cm = 1 km',[Nq('betul','scale'),Nq('salah, 1 cm = 10 km','scale'),Nq('salah, 1 cm = 100 m','scale')],'100 000 cm = 1 km.','Tahun 6 · Menilai Skala'),id,'7.4.1',mode,'verbal','reasoning',s,['scale','error_analysis']);
 return mark(q('Sebuah laluan sebenar 24 km diwakili 8 cm pada peta. Apakah skala dalam bentuk 1 cm mewakili berapa km?','1 cm mewakili 3 km',[Nq('1 cm mewakili 2 km','scale'),Nq('1 cm mewakili 8 km','scale'),Nq('1 cm mewakili 24 km','scale')],'24÷8=3 km per cm.','Tahun 6 · Masalah Skala Songsang'),id,'7.4.1',mode,'story','reasoning',s,['scale','inverse']);
};

document.documentElement?.setAttribute('data-y6-v2-unit7','3.61.0');
})();
