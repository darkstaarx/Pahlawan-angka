// Pahlawan Angka — Year 6 Question Experience Hardening v3.60.4
// Loaded after kssr-year6-curriculum-v3.60.3.js.
// Prevents "same template, different numbers" fatigue while preserving KSSR demand.
(function(){
'use strict';
const V='3.60.4',banks=window.PAQuestionBanks=window.PAQuestionBanks||{},prior=banks.d6;
if(typeof prior!=='function')return;
const stage=window.PAKSSRYear6?.stage||function(){return 2};
const H=window.PAY6KSSRRepair?.helpers||{},VH=window.PAKSSRDepth?.visualHelpers||{};
const choose=a=>pick(a),rand=(a,b)=>R(a,b),Nq=(v,t)=>N(v,t);
const tidy=(v,d=2)=>typeof tidyNumber==='function'?tidyNumber(v,d):Number(Number(v).toFixed(d));
const money=v=>typeof moneyFmtUpper==='function'?moneyFmtUpper(Number(tidy(v,2))):'RM'+Number(v).toFixed(2);
const table=(h,r)=>VH.miniTable?VH.miniTable(h,r):'<table>'+r.map(x=>'<tr>'+x.map(y=>'<td>'+y+'</td>').join('')+'</tr>').join('')+'</table>';
const coord=(pts,scale)=>VH.coordinateMap?VH.coordinateMap(pts,scale):table(['Titik','x','y'],pts.map(p=>[p.label,p.x,p.y]));
const protractor=d=>H.protractorSvg?H.protractorSvg(d):'<div class="kssrDiagram">Sudut '+d+'°</div>';
const polygon=n=>H.regularPolygonSvg?H.regularPolygonSvg(n):'<div class="kssrDiagram">Poligon sekata '+n+' sisi</div>';
const circle=(m,r)=>H.circleSvg?H.circleSvg(m,r):'<div class="kssrDiagram">Bulatan</div>';
const pie=(s,o={})=>H.pieSvg?H.pieSvg(s,o):table(['Kategori','Sudut'],s.map(x=>[x.label,x.angle+'°']));
const bag=(r,b,g=0)=>H.bagVisual?H.bagVisual(r,b,g):table(['Warna','Bilangan'],[['Merah',r],['Biru',b],['Hijau',g]]);
const sessRef=()=>{try{return typeof sess!=='undefined'?sess:window.sess}catch(_){return window.sess}};
function rotate(id,modes){
  const recent=(sessRef()?.questionHistory||[]).filter(x=>x.skillId===id).slice(-14).map(x=>String(x.archetypeId||'').replace(/^y6x_/,'').replace(/^y6kssr_/,''));
  const last=recent.at(-1),counts=Object.fromEntries(modes.map(x=>[x,recent.filter(y=>y===x).length]));
  const pool=modes.filter(x=>x!==last);
  return (pool.length?pool:modes).sort((a,b)=>counts[a]-counts[b]||Math.random()-.5)[0];
}
function mark(q,id,sp,mode,rep,demand,s,targets=[]){
  if(!q)return q;
  q.source='kssr-year6-experience-v3.60.4';
  q.standardRef=sp;q.competencyId=sp;q.archetypeId='y6x_'+mode;
  q.representation=rep;q.demand=demand;
  q.difficultyBand=stage(s)===3?4:stage(s)===2?3:2;
  q.misconceptionTargets=targets;q.kssrExperienceVersion=V;
  return q;
}
function usePrior(q){if(q)q.kssrExperienceVersion=V;return q}
function priorCore(id,s,shift){
  const e=Number(s?.evidence||0);
  const lifted=e<2?Object.assign({},s,{evidence:4,mastery:Math.max(50,Number(s?.mastery||0)),confidence:Math.max(50,Number(s?.confidence||0)),wrong:0}):s;
  return usePrior(prior(id,lifted,shift));
}
const Z=[['Kuala Lumpur',8],['Tokyo',9],['Bangkok',7],['Dubai',4]];
const fmt=(h,m)=>String((h%24+24)%24).padStart(2,'0')+':'+String(m).padStart(2,'0');
const CORE={},HIGH={};

// Numeric domains -----------------------------------------------------------
CORE['D6.DEC']=function(id,s,shift){
  const mode=rotate(id,['prior','dec_rate','dec_reverse']);
  if(mode==='prior')return priorCore(id,s,shift);
  if(mode==='dec_rate'){
    const rate=choose([1.25,1.5,2.4,3.2]),n=choose([2.5,3.5,4.5]),ans=tidy(rate*n,3);
    return mark(Q('Sebuah mesin mengisi '+rate+' L setiap minit. Dalam '+n+' minit, berapa liter diisi?',String(ans)+' L',[Nq(String(tidy(rate+n,3))+' L','decimal'),Nq(String(tidy(ans*10,3))+' L','decimal'),Nq(String(rate)+' L','decimal')],'Darab kadar setiap minit dengan tempoh.','Tahun 6 · Aplikasi Darab Perpuluhan',true,true),id,'2.2.1','dec_rate','story','application',s,['decimal','rate']);
  }
  const each=choose([0.8,1.2,1.5,2.4]),n=choose([4,5,6,8]),total=tidy(each*n,2);
  return mark(Q(total+' kg bahan dibahagi sama banyak kepada bekas '+each+' kg. Berapa bekas penuh?',n,[Nq(n-1,'decimal'),Nq(n+1,'decimal'),Nq(tidy(total-each,2),'operation')],'Bilangan bekas = jumlah ÷ kapasiti setiap bekas.','Tahun 6 · Aplikasi Bahagi Perpuluhan',true,true),id,'2.2.2','dec_reverse','story','application',s,['decimal','division']);
};

CORE['D6.PERCENT']=function(id,s,shift){
  const mode=rotate(id,['prior','pct_compare','pct_reverse','pct_points_add','pct_points_sub','pct_table']);
  if(mode==='prior')return usePrior(prior(id,s,shift));
  if(mode==='pct_compare'){
    const a=choose([[125,80],[150,60],[175,40]]),b=choose([[120,90],[140,70],[160,50]]),va=a[0]*a[1]/100,vb=b[0]*b[1]/100,ans=va>vb?'A':'B';
    return mark(Q('A: '+a[0]+'% daripada '+a[1]+'. B: '+b[0]+'% daripada '+b[1]+'. Yang manakah lebih besar?',ans,[Nq(ans==='A'?'B':'A','percent'),Nq('sama','percent'),Nq('tidak boleh dibanding','percent')],'Cari kedua-dua nilai sebelum membandingkan.','Tahun 6 · Banding Nilai Peratus',true,true),id,'2.3.3','pct_compare','verbal','application',s,['percent','compare']);
  }
  if(mode==='pct_reverse'){
    const pct=choose([125,150,175,200]),base=choose([40,60,80]),val=base*pct/100;
    return mark(Q(pct+'% daripada suatu kuantiti ialah '+val+'. Apakah kuantiti asal?',base,[Nq(val,'percent'),Nq(val-base,'percent'),Nq(base+pct,'operation')],'Bahagi nilai diberi dengan faktor peratusnya.','Tahun 6 · Kuantiti Asal daripada Peratus',true,true),id,'2.3.3','pct_reverse','symbolic','application',s,['percent','inverse']);
  }
  if(mode==='pct_points_add'){
    const p=choose([110,125,140]),d=choose([15,20,25]),ans=p+d;
    return mark(Q('Tahap awal ialah '+p+'%. Ia meningkat '+d+' mata peratus. Tahap baharu?',ans+'%',[Nq((p*d/100)+'%','percent'),Nq((p+d/100)+'%','percent'),Nq((p-d)+'%','percent')],'Mata peratus ditambah terus kepada nilai peratus.','Tahun 6 · Tambah Peratus',true,true),id,'2.3.2','pct_points_add','story','application',s,['percent']);
  }
  if(mode==='pct_points_sub'){
    const p=choose([150,175,200]),d=choose([20,25,50]),ans=p-d;
    return mark(Q('Kapasiti operasi ialah '+p+'%. Ia dikurangkan '+d+' mata peratus. Kapasiti baharu?',ans+'%',[Nq((p*d/100)+'%','percent'),Nq((p+d)+'%','percent'),Nq((p-d/100)+'%','percent')],'Mata peratus ditolak terus daripada nilai peratus.','Tahun 6 · Tolak Peratus',true,true),id,'2.3.2','pct_points_sub','story','application',s,['percent']);
  }
  const x=choose([[100,120],[80,150],[60,175]]),ans=x[0]*x[1]/100;
  return mark(Q(table(['Kuantiti asal','Peratus'],[[x[0],x[1]+'%']])+'Nilai sebenar selepas menggunakan peratus tersebut?',ans,[Nq(x[0],'percent'),Nq(x[1],'percent'),Nq(x[0]+x[1],'operation')],'Tukar peratus kepada pengganda dan darab kuantiti asal.','Tahun 6 · Jadual Peratus',true,true),id,'2.3.3','pct_table','table','application',s,['percent']);
};

HIGH['D6.NUMBERS']=function(id,s,shift){
  const mode=rotate(id,['prior','numbers_pattern','numbers_constraint','numbers_prime_reason','numbers_estimate_compare']);
  if(mode==='prior')return usePrior(prior(id,s,shift));
  if(mode==='numbers_pattern'){
    const base=choose([3200000,4500000,6200000]),step=choose([125000,250000,500000]),ans=base+3*step;
    return mark(Q('Corak nombor: '+base.toLocaleString()+', '+(base+step).toLocaleString()+', '+(base+2*step).toLocaleString()+', ___. Nombor seterusnya?',ans,[Nq(ans-step,'pattern'),Nq(ans+step,'pattern'),Nq(base+3,'pattern')],'Cari beza tetap pada nilai tempat.','Tahun 6 · Penaakulan Corak Nombor',true,true),id,'1.1.4','numbers_pattern','symbolic','reasoning',s,['pattern']);
  }
  if(mode==='numbers_constraint'){
    return mark(Q('Antara nombor berikut, yang manakah berada antara 4.2 juta dan 4.3 juta serta digit puluh ribunya ialah 5?',4250000,[Nq(4150000,'place'),Nq(4350000,'place'),Nq(4205000,'place')],'Semak julat dahulu, kemudian nilai tempat puluh ribu.','Tahun 6 · Kekangan Nombor',true,true),id,'1.1.1/1.1.2','numbers_constraint','verbal','reasoning',s,['place_value']);
  }
  if(mode==='numbers_prime_reason'){
    return mark(Q('Seorang murid berkata 91 ialah nombor perdana. Penilaian paling tepat?','salah kerana 91 = 7 × 13',[Nq('betul kerana 91 nombor ganjil','prime'),Nq('betul kerana 91 lebih besar daripada 2','prime'),Nq('salah kerana semua nombor dua digit ialah komposit','prime')],'Cari faktor selain 1 dan dirinya.','Tahun 6 · Perdana dan Komposit',true,true),id,'1.3.1','numbers_prime_reason','verbal','reasoning',s,['prime_composite']);
  }
  return mark(Q('Dua anggaran bagi 2,480,000 + 1,670,000 ialah 4 juta (juta terdekat) dan 4.2 juta (ratus ribu terdekat). Yang mana lebih hampir kepada jumlah sebenar?','4.2 juta',[Nq('4 juta','estimate'),Nq('kedua-duanya sama dekat','estimate'),Nq('tidak boleh dibanding','estimate')],'Jumlah sebenar 4.15 juta; banding jarak kedua-dua anggaran.','Tahun 6 · Kewajaran Anggaran',true,true),id,'1.4.1','numbers_estimate_compare','verbal','reasoning',s,['estimate']);
};

HIGH['D6.OPS']=function(id,s,shift){
  const mode=rotate(id,['prior','ops_multi_resource','ops_compare_methods','ops_reverse','ops_error']);
  if(mode==='prior')return usePrior(prior(id,s,shift));
  if(mode==='ops_multi_resource'){
    const boxes=choose([6,8]),each=choose([35,45]),used=choose([80,120]),ans=boxes*each-used;
    return mark(Q('Stor mempunyai '+boxes+' kotak × '+each+' unit. Selepas '+used+' unit digunakan, baki?',ans,[Nq(boxes*(each-used),'operation'),Nq(boxes+each-used,'operation'),Nq(boxes*each+used,'operation')],'Darab dahulu jumlah stok, kemudian tolak yang digunakan.','Tahun 6 · Operasi Bergabung Harian',true,true),id,'1.2.1/2.5.1','ops_multi_resource','story','reasoning',s,['operation','multi_step']);
  }
  if(mode==='ops_compare_methods'){
    const a=choose([40,60]),b=choose([8,12]),c=choose([3,5]);
    return mark(Q('Murid A mengira ('+a+' + '+b+') × '+c+'. Murid B mengira '+a+' + ('+b+' × '+c+'). Siapa menggunakan struktur ungkapan asal dengan betul?','Murid A',[Nq('Murid B','operation'),Nq('kedua-duanya sama','operation'),Nq('tiada siapa','operation')],'Kurungan menentukan operasi yang mesti dibuat dahulu.','Tahun 6 · Menilai Operasi Bergabung',true,true),id,'1.2.1','ops_compare_methods','verbal','reasoning',s,['operation','brackets']);
  }
  if(mode==='ops_reverse'){
    const final=choose([120,160,200]),added=choose([45,60]),used=choose([20,35]),start=final-added+used;
    return mark(Q('Selepas menambah '+added+' unit dan menggunakan '+used+' unit, baki menjadi '+final+'. Berapa unit pada awalnya?',start,[Nq(final+added-used,'operation'),Nq(final-added-used,'operation'),Nq(final+used,'operation')],'Undur operasi: tambah semula yang digunakan dan tolak yang ditambah.','Tahun 6 · Operasi Songsang dalam Masalah',true,true),id,'2.5.1','ops_reverse','story','reasoning',s,['operation','inverse']);
  }
  const a=choose([36,48]),b=choose([6,8]),cc=choose([4,5]),wrong=a+b*cc,correct=(a+b)*cc;
  return mark(Q('Seorang murid mendapat '+wrong+' untuk ('+a+' + '+b+') × '+cc+'. Apakah pembetulan?',correct,[Nq(wrong,'operation'),Nq(a+b+cc,'operation'),Nq(a*b+cc,'operation')],'Kurungan mesti diselesaikan sebelum darab.','Tahun 6 · Analisis Kesilapan Operasi',true,true),id,'1.2.1','ops_error','verbal','reasoning',s,['operation','error_analysis']);
};

HIGH['D6.FRAC']=function(id,s,shift){
  const mode=rotate(id,['prior','frac_recipe_scale','frac_reverse','frac_compare','frac_error']);
  if(mode==='prior')return usePrior(prior(id,s,shift));
  if(mode==='frac_recipe_scale'){
    const each=choose([[1,4],[1,2],[3,4]]),n=choose([4,6,8]),num=each[0]*n,den=each[1];
    return mark(Q('Setiap hidangan menggunakan '+each[0]+'/'+each[1]+' L. Untuk '+n+' hidangan, jumlah bahan?',num+'/'+den+' L',[Nq(each[0]+'/'+(each[1]*n)+' L','fraction'),Nq(n+'/'+each[1]+' L','fraction'),Nq(String(n)+' L','fraction')],'Darab pecahan bagi satu hidangan dengan bilangan hidangan.','Tahun 6 · Pecahan dalam Resipi',true,true),id,'2.1.1/2.5.1','frac_recipe_scale','story','reasoning',s,['fraction','scale']);
  }
  if(mode==='frac_reverse'){
    const fv=choose([[3,4],[2,3]]),part=choose([6,8,12]),total=part*fv[1]/fv[0];
    return mark(Q(fv[0]+'/'+fv[1]+' daripada jumlah ialah '+part+'. Berapakah jumlah asal?',total,[Nq(part*fv[0]/fv[1],'fraction'),Nq(part+fv[1],'fraction'),Nq(part*fv[1],'fraction')],'Bahagi nilai bahagian dengan pecahan yang mewakilinya.','Tahun 6 · Pecahan Songsang',true,true),id,'2.5.1','frac_reverse','symbolic','reasoning',s,['fraction','inverse']);
  }
  if(mode==='frac_compare'){
    return mark(Q('Pilihan A: 2/3 daripada 9 L. Pilihan B: 3/4 daripada 8 L. Yang manakah lebih banyak?','sama banyak, 6 L',[Nq('A lebih banyak','fraction'),Nq('B lebih banyak','fraction'),Nq('tidak boleh dibanding','fraction')],'Cari nilai kedua-dua pecahan daripada kuantiti.','Tahun 6 · Membanding Pecahan dalam Kuantiti',true,true),id,'2.5.1','frac_compare','verbal','reasoning',s,['fraction','compare']);
  }
  return mark(Q('Murid mengira 3 ÷ 1/2 = 1.5. Penilaian?','salah, 3 ÷ 1/2 = 6',[Nq('betul','fraction'),Nq('salah, jawapan ialah 3/2','fraction'),Nq('tidak boleh ditentukan','fraction')],'Membahagi dengan 1/2 bermaksud berapa banyak separuh terdapat dalam 3.','Tahun 6 · Analisis Bahagi Pecahan',true,true),id,'2.1.1','frac_error','verbal','reasoning',s,['fraction','error_analysis']);
};

HIGH['D6.DEC']=function(id,s,shift){
  const mode=rotate(id,['prior','dec_pack','dec_reverse_high','dec_estimate','dec_multi']);
  if(mode==='prior')return usePrior(prior(id,s,shift));
  if(mode==='dec_pack'){
    const total=choose([7.2,9.6,12]),each=choose([1.2,2.4]),n=tidy(total/each,2);
    return mark(Q(total+' L dibungkus ke dalam bekas '+each+' L. Berapa bekas diperlukan?',n,[Nq(tidy(total*each,2),'decimal'),Nq(tidy(total-each,2),'decimal'),Nq(tidy(n+1,2),'decimal')],'Bahagi jumlah dengan kapasiti setiap bekas.','Tahun 6 · Bahagi Perpuluhan dalam Konteks',true,true),id,'2.2.2/2.5.1','dec_pack','story','reasoning',s,['decimal','division']);
  }
  if(mode==='dec_reverse_high'){
    const factor=choose([1.2,1.5,2.5]),ans=choose([3,4,6]),product=tidy(factor*ans,2);
    return mark(Q(factor+' × ___ = '+product+'. Nilai yang hilang?',ans,[Nq(product,'decimal'),Nq(tidy(product-factor,2),'decimal'),Nq(tidy(ans*10,2),'decimal')],'Gunakan operasi songsang: bahagi hasil dengan faktor diketahui.','Tahun 6 · Faktor Perpuluhan Hilang',true,true),id,'2.2.1','dec_reverse_high','symbolic','reasoning',s,['decimal','inverse']);
  }
  if(mode==='dec_estimate'){
    const a=choose([2.4,3.75]),b=choose([1.2,2.5]),exact=tidy(a*b,3),claim=tidy(exact*10,3);
    return mark(Q('Tanpa mengira semula secara panjang, adakah '+a+' × '+b+' = '+claim+' munasabah?','tidak munasabah',[Nq('munasabah','estimate'),Nq('tepat kerana hasil darab mesti lebih 10','estimate'),Nq('tidak boleh dianggarkan','estimate')],'Banding magnitud faktor dengan magnitud hasil.','Tahun 6 · Kewajaran Perpuluhan',true,true),id,'2.2.1','dec_estimate','verbal','reasoning',s,['decimal','estimate']);
  }
  const rate=choose([1.25,1.5,2.4]),n=choose([4,5]),used=choose([0.5,1]),ans=tidy(rate*n-used,2);
  return mark(Q(n+' bekas masing-masing '+rate+' L. Selepas '+used+' L digunakan, baki?',ans+' L',[Nq(tidy(rate*n,2)+' L','decimal'),Nq(tidy(rate+used,2)+' L','operation'),Nq(tidy(ans+used,2)+' L','decimal')],'Darab untuk jumlah awal, kemudian tolak penggunaan.','Tahun 6 · Perpuluhan Pelbagai Langkah',true,true),id,'2.5.1','dec_multi','story','reasoning',s,['decimal','multi_step']);
};

HIGH['D6.PERCENT']=function(id,s,shift){
  const mode=rotate(id,['prior','pct_reverse_high','pct_compare_high','pct_error_high','pct_multi_high']);
  if(mode==='prior')return usePrior(prior(id,s,shift));
  if(mode==='pct_reverse_high'){
    const pct=choose([125,150,175]),base=choose([40,60,80]),val=base*pct/100;
    return mark(Q(pct+'% daripada suatu nilai ialah '+val+'. Nilai asal?',base,[Nq(val,'percent'),Nq(val-base,'percent'),Nq(val+pct,'operation')],'Bahagi nilai diberi dengan faktor peratus.','Tahun 6 · Peratus Songsang',true,true),id,'2.3.3/2.5.1','pct_reverse_high','symbolic','reasoning',s,['percent','inverse']);
  }
  if(mode==='pct_compare_high'){
    return mark(Q('Pelan A memberi 125% daripada 80 unit. Pelan B memberi 150% daripada 60 unit. Pilihan mana memberi lebih banyak?','Pelan A, 100 unit',[Nq('Pelan B, 90 unit','percent'),Nq('kedua-duanya sama','percent'),Nq('tidak boleh dibanding','percent')],'Cari nilai sebenar bagi kedua-dua peratus.','Tahun 6 · Membanding Peratus',true,true),id,'2.5.1','pct_compare_high','verbal','reasoning',s,['percent','compare']);
  }
  if(mode==='pct_error_high'){
    return mark(Q('Murid berkata 150% daripada 40 ialah 60 kerana 150% = 1.5. Penilaian?','betul',[Nq('salah, jawapan 50','percent'),Nq('salah, 150% sama dengan 0.15','percent'),Nq('tidak boleh dinilai','percent')],'150% = 1.5; 1.5 × 40 = 60.','Tahun 6 · Menilai Penaakulan Peratus',true,true),id,'2.3.3','pct_error_high','verbal','reasoning',s,['percent','error_analysis']);
  }
  const base=choose([80,120]),up=choose([150,175]),down=choose([25,50]),finalPct=up-down,ans=base*finalPct/100;
  return mark(Q('Nilai asal '+base+'. Tetapan naik ke '+up+'%, kemudian turun '+down+' mata peratus. Nilai akhir?',ans,[Nq(base*up/100,'percent'),Nq(base*down/100,'percent'),Nq(finalPct,'operation')],'Cari peratus akhir dahulu, kemudian gunakan pada nilai asal.','Tahun 6 · Peratus Pelbagai Langkah',true,true),id,'2.5.1','pct_multi_high','story','reasoning',s,['percent','multi_step']);
};

HIGH['D6.RATIO']=function(id,s,shift){
  const mode=rotate(id,['prior','ratio_partition_high','ratio_compare_high','ratio_unit_high','ratio_error_high']);
  if(mode==='prior')return usePrior(prior(id,s,shift));
  if(mode==='ratio_partition_high'){
    return mark(Q('Nisbah merah:biru = 2:3 dan jumlah 25 objek. Berapa objek biru?',15,[Nq(10,'ratio'),Nq(12,'ratio'),Nq(18,'ratio')],'Jumlah bahagian 5; setiap bahagian 5 objek; biru 3 bahagian.','Tahun 6 · Membahagi Mengikut Nisbah',true,true),id,'7.2.1/7.4.1','ratio_partition_high','story','reasoning',s,['ratio','partition']);
  }
  if(mode==='ratio_compare_high'){
    return mark(Q('Campuran A sirap:air = 2:3. Campuran B = 3:5. Yang mana mempunyai bahagian sirap lebih besar?','A',[Nq('B','ratio'),Nq('sama','ratio'),Nq('tidak boleh dibanding','ratio')],'Banding 2/5 dengan 3/8.','Tahun 6 · Membanding Nisbah',true,true),id,'7.2.1/7.4.1','ratio_compare_high','verbal','reasoning',s,['ratio','compare']);
  }
  if(mode==='ratio_unit_high'){
    return mark(Q('4 botol menggunakan 10 L air. Jika kadar sama, 10 botol menggunakan?',25+' L',[Nq('16 L','ratio'),Nq('20 L','ratio'),Nq('40 L','ratio')],'Kadar 10÷4=2.5 L setiap botol; darab 10.','Tahun 6 · Kadaran Kadar Unit',true,true),id,'7.3.1/7.4.1','ratio_unit_high','story','reasoning',s,['ratio','proportion','unit_rate']);
  }
  return mark(Q('Murid berkata nisbah 4:6 setara dengan 6:8 kerana kedua-duanya tambah 2. Penilaian?','salah',[Nq('betul','ratio'),Nq('betul jika nombor genap','ratio'),Nq('tidak boleh dinilai','ratio')],'Nisbah setara mesti didarab atau dibahagi kedua-dua bahagian dengan faktor sama.','Tahun 6 · Analisis Nisbah Setara',true,true),id,'7.2.1','ratio_error_high','verbal','reasoning',s,['ratio','error_analysis']);
};

/*__REGISTRATIONS__*/

banks.d6=function(id,s,shift){
  if(id==='D6.AREA'||id==='D6.DATA')return null;
  const st=stage(s);let q=null;
  if(st===3&&HIGH[id])q=HIGH[id](id,s,shift);
  else if(st===2&&CORE[id])q=CORE[id](id,s,shift);
  else if(st===2)q=priorCore(id,s,shift);
  else q=usePrior(prior(id,s,shift));
  if(q)q.kssrExperienceVersion=V;
  return q;
};
window.PAY6QuestionExperience={version:V,stage};
document.documentElement?.setAttribute('data-kssr-year6-experience',V);
})();