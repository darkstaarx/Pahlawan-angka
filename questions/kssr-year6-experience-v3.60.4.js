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
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){const t=b;b=a%b;a=t}return a||1};
const fracText=(n,d)=>{const g=gcd(n,d);n/=g;d/=g;if(d===1)return String(n);if(n>d){const w=Math.floor(n/d),r=n%d;return r?w+' '+r+'/'+d:String(w)}return n+'/'+d};
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
    const each=choose([[1,4],[1,2],[3,4]]),n=choose([4,6,8]),num=each[0]*n,den=each[1],ans=fracText(num,den);
    return mark(Q('Setiap hidangan menggunakan '+each[0]+'/'+each[1]+' L. Untuk '+n+' hidangan, jumlah bahan?',ans+' L',[Nq(each[0]+'/'+(each[1]*n)+' L','fraction'),Nq(n+'/'+each[1]+' L','fraction'),Nq(String(n)+' L','fraction')],'Darab pecahan bagi satu hidangan dengan bilangan hidangan.','Tahun 6 · Pecahan dalam Resipi',true,true),id,'2.1.1/2.5.1','frac_recipe_scale','story','reasoning',s,['fraction','scale']);
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

// Applied domains -----------------------------------------------------------
CORE['D6.TIME']=function(id,s,shift){
  const mode=rotate(id,['prior','time_midnight','time_reverse','time_previous_day','time_schedule','time_duration_core']);
  if(mode==='prior')return usePrior(prior(id,s,shift));
  if(mode==='time_midnight')return mark(Q('Kuala Lumpur ialah UTC+8 dan Tokyo UTC+9. Jika Kuala Lumpur 23:30, waktu Tokyo ialah?','00:30 hari berikutnya',[Nq('22:30 hari yang sama','time'),Nq('23:30 hari yang sama','time'),Nq('01:30 hari berikutnya','time')],'Tokyo 1 jam lebih awal; perhatikan pertukaran hari.','Tahun 6 · Zon Masa dan Pertukaran Hari',true,true),id,'4.1.2','time_midnight','story','application',s,['timezone','day_change']);
  if(mode==='time_reverse'){
    const h=choose([10,14,18]),m=choose([0,15,30,45]),ans=fmt(h-1,m);
    return mark(Q('Tokyo menunjukkan '+fmt(h,m)+'. Apakah waktu pada masa yang sama di Kuala Lumpur?',ans,[Nq(fmt(h+1,m),'time'),Nq(fmt(h,m),'time'),Nq(fmt(h-2,m),'time')],'Kuala Lumpur 1 jam di belakang Tokyo.','Tahun 6 · Menentukan Waktu Zon Masa',true,true),id,'4.1.2','time_reverse','story','application',s,['timezone']);
  }
  if(mode==='time_previous_day')return mark(Q('Kuala Lumpur ialah UTC+8 dan Dubai UTC+4. Jika Kuala Lumpur 02:15, waktu Dubai ialah?','22:15 hari sebelumnya',[Nq('06:15 hari yang sama','time'),Nq('22:15 hari yang sama','time'),Nq('23:15 hari sebelumnya','time')],'Dubai 4 jam di belakang Kuala Lumpur; 02:15 ditolak 4 jam melintasi tengah malam.','Tahun 6 · Zon Masa dan Hari',true,true),id,'4.1.2','time_previous_day','story','application',s,['timezone','day_change']);
  if(mode==='time_schedule')return mark(Q(table(['Bandar','UTC'],[['Kuala Lumpur','+8'],['Bangkok','+7'],['Tokyo','+9']])+'Mesyuarat bermula di Kuala Lumpur pada 09:00. Waktu serentak di Bangkok?','Bangkok 08:00',[Nq('Bangkok 10:00','time'),Nq('Bangkok 09:00','time'),Nq('Bangkok 07:00','time')],'Bangkok 1 jam di belakang Kuala Lumpur.','Tahun 6 · Jadual Zon Masa',true,true),id,'4.1.2','time_schedule','table','application',s,['timezone','table']);
  const dep=choose([8,10,12]),dur=choose([2,3,4]),ans=fmt(dep+dur-4,0);
  return mark(Q('Penerbangan berlepas dari Kuala Lumpur pada '+fmt(dep,0)+', mengambil masa '+dur+' jam dan tiba di Dubai. Apakah waktu tempatan tiba?',ans,[Nq(fmt(dep+dur,0),'time'),Nq(fmt(dep-4,0),'time'),Nq(fmt(dep+dur+4,0),'time')],'Tambah tempoh penerbangan, kemudian laraskan Dubai 4 jam di belakang Kuala Lumpur.','Tahun 6 · Masa Perjalanan dan Zon Masa',true,true),id,'4.2.1','time_duration_core','story','application',s,['timezone','duration']);
};

CORE['D6.MEASURE']=function(id,s,shift){
  const mode=rotate(id,['prior','measure_unit_rate','measure_missing_length','measure_compare','measure_mass_liquid','measure_missing_liquid']);
  if(mode==='prior')return usePrior(prior(id,s,shift));
  if(mode==='measure_unit_rate'){
    const L=choose([2,4]),M=choose([0.6,1.2]),ans=tidy(M/L,2);
    return mark(Q(L+' m kabel berjisim '+M+' kg. Jisim bagi 1 m kabel?',ans+' kg',[Nq(M+' kg','unit'),Nq(tidy(M*L,2)+' kg','unit'),Nq((L-M)+' kg','operation')],'Bahagi jisim dengan panjang untuk kadar per meter.','Tahun 6 · Kadar Panjang dan Jisim',true,true),id,'5.1.1(i)','measure_unit_rate','story','application',s,['length','mass','rate']);
  }
  if(mode==='measure_missing_length'){
    const per=choose([0.25,0.5,0.75]),mass=choose([1.5,2,3]),ans=tidy(mass/per,2);
    return mark(Q('Setiap 1 m wayar berjisim '+per+' kg. Berapa meter wayar mempunyai jisim '+mass+' kg?',ans+' m',[Nq(mass+' m','unit'),Nq(tidy(mass*per,2)+' m','unit'),Nq((mass+per)+' m','operation')],'Panjang = jumlah jisim ÷ jisim per meter.','Tahun 6 · Hubungan Panjang dan Jisim',true,true),id,'5.1.1(i)','measure_missing_length','story','application',s,['length','mass','inverse']);
  }
  if(mode==='measure_compare')return mark(Q(table(['Pakej','Panjang','Jisim'],[['A','4 m','1.2 kg'],['B','6 m','1.5 kg']])+'Pakej mana mempunyai jisim per meter lebih rendah?','B',[Nq('A','unit'),Nq('sama','unit'),Nq('tidak boleh dibanding','unit')],'Banding jisim ÷ panjang bagi setiap pakej.','Tahun 6 · Membanding Hubungan Ukuran',true,true),id,'5.1.1(i)','measure_compare','table','application',s,['length','mass','compare']);
  if(mode==='measure_mass_liquid'){
    const V=choose([1,1.5,2]),M=choose([0.8,1.2,1.6]),k=choose([2,3]),ans=tidy(M*k,2);
    return mark(Q(V+' L cecair berjisim '+M+' kg. '+(V*k)+' L cecair sama berjisim?',ans+' kg',[Nq(M+' kg','unit'),Nq(tidy(M+k,2)+' kg','unit'),Nq(tidy(ans+1,2)+' kg','unit')],'Skalakan isi padu dan jisim dengan faktor sama.','Tahun 6 · Jisim dan Isi Padu Cecair',true,true),id,'5.1.1(iii)','measure_mass_liquid','story','application',s,['mass','liquid']);
  }
  const L=choose([2,4]),V=choose([0.5,1]),need=choose([6,8,12]),ans=tidy(need*(V/L),2);
  return mark(Q(L+' m kain memerlukan '+V+' L pewarna. '+need+' m kain memerlukan berapa liter?',ans+' L',[Nq(V+' L','unit'),Nq((need/L)+' L','unit'),Nq((need+V)+' L','operation')],'Cari bilangan kumpulan panjang, kemudian skalakan isi padu pewarna.','Tahun 6 · Panjang dan Isi Padu Cecair',true,true),id,'5.1.1(ii)','measure_missing_liquid','story','application',s,['length','liquid']);
};

CORE['D6.COORD']=function(id,s,shift){
  const mode=rotate(id,['prior','coord_route_core','coord_missing_x','coord_missing_y','coord_compare_routes']);
  if(mode==='prior')return usePrior(prior(id,s,shift));
  if(mode==='coord_route_core'){
    const sc=choose([2,5]),A={x:1,y:1,label:'A'},B={x:4,y:1,label:'B'},C={x:4,y:4,label:'C'},ans=6*sc;
    return mark(Q(coord([A,B,C],sc)+'Laluan A→B→C. 1 petak = '+sc+' km. Jumlah jarak?',ans+' km',[Nq('6 km','scale'),Nq((3*sc)+' km','coord'),Nq((9*sc)+' km','coord')],'Tambah jarak mengufuk dan mencancang, kemudian gunakan skala.','Tahun 6 · Laluan Koordinat Berskala',true,true),id,'7.4.1','coord_route_core','visual','application',s,['coord','scale','route']);
  }
  if(mode==='coord_missing_x'){
    const sc=choose([2,5]),x1=1,x2=choose([3,4,5]),dist=(x2-x1)*sc;
    return mark(Q('A berada pada ('+x1+',3). B pada (x,3). Jika 1 petak = '+sc+' km dan jarak A ke B '+dist+' km ke kanan, nilai x?',x2,[Nq(x2-1,'coord'),Nq(x2+1,'coord'),Nq(dist,'scale')],'Tukar jarak sebenar kepada bilangan petak, kemudian tambah pada koordinat x.','Tahun 6 · Koordinat Hilang',true,true),id,'7.1.1','coord_missing_x','verbal','application',s,['coord','scale','inverse']);
  }
  if(mode==='coord_missing_y'){
    const sc=choose([2,5]),y1=1,y2=choose([3,4,5]),dist=(y2-y1)*sc;
    return mark(Q('A berada pada (2,'+y1+'). B pada (2,y). Jika 1 petak = '+sc+' km dan jarak A ke B '+dist+' km ke atas, nilai y?',y2,[Nq(y2-1,'coord'),Nq(y2+1,'coord'),Nq(dist,'scale')],'Tukar jarak sebenar kepada bilangan petak, kemudian tambah pada koordinat y.','Tahun 6 · Koordinat Hilang',true,true),id,'7.1.1','coord_missing_y','verbal','application',s,['coord','scale','inverse']);
  }
  const sc=5;
  return mark(Q(coord([{x:1,y:1,label:'A'},{x:5,y:1,label:'B'},{x:3,y:4,label:'C'}],sc)+'Dari A, laluan ke B ialah 4 petak. Laluan ke C secara mengufuk kemudian mencancang ialah 5 petak. Laluan mana lebih pendek?','A ke B',[Nq('A ke C','route'),Nq('sama','route'),Nq('tidak boleh dibanding','route')],'Banding jumlah petak; skala sama untuk kedua-dua laluan.','Tahun 6 · Membanding Laluan',true,true),id,'7.4.1','coord_compare_routes','visual','application',s,['coord','route','compare']);
};

CORE['D6.SPACE_PROBLEM']=function(id,s,shift){
  const mode=rotate(id,['prior','space_polygon_sum','space_compass_plan','space_straight_context','space_radius_paths']);
  if(mode==='prior')return usePrior(prior(id,s,shift));
  if(mode==='space_polygon_sum'){
    const deg=choose([60,90,120,135]),n=choose([2,3]),ans=deg*n;
    return mark(Q(protractor(deg)+'Dalam corak, '+n+' sudut yang sama seperti rajah dicantum. Jumlah sudut?',ans+'°',[Nq(deg+'°','space_reason'),Nq((deg+n)+'°','operation'),Nq((180-deg)+'°','angle_measure')],'Gunakan ukuran satu sudut dan bilangan sudut yang dicantum.','Tahun 6 · Masalah Ruang dan Sudut',true,true),id,'6.3.1','space_polygon_sum','visual','application',s,['space_reason','angle_measure']);
  }
  if(mode==='space_compass_plan'){
    const d=choose([10,14,18]),r=d/2;
    return mark(Q('Logo perlu mengandungi bulatan berdiameter '+d+' cm. Tetapan jangka yang betul sebelum melukis?',r+' cm',[Nq(d+' cm','circle_draw'),Nq((d+2)+' cm','circle_draw'),Nq((r/2)+' cm','circle_draw')],'Jangka ditetapkan pada jejari, separuh diameter.','Tahun 6 · Rancang Pembinaan Bulatan',true,true),id,'6.3.1','space_compass_plan','story','application',s,['circle_draw','space_reason']);
  }
  if(mode==='space_straight_context'){
    const a=choose([60,75,105,120]),ans=180-a;
    return mark(Q('Dua papan bertemu membentuk garis lurus. Satu sudut ialah '+a+'°. Sudut satu lagi?',ans+'°',[Nq(a+'°','angle_measure'),Nq((180+a)+'°','angle_measure'),Nq(Math.abs(90-a)+'°','angle_measure')],'Jumlah sudut pada garis lurus ialah 180°.','Tahun 6 · Masalah Harian Sudut',true,true),id,'6.3.1','space_straight_context','story','application',s,['angle_measure','space_reason']);
  }
  const d=choose([12,16,20]),r=d/2,count=choose([4,5,6]),ans=r*count;
  return mark(Q(circle('parts')+'Sebuah taman bulatan berdiameter '+d+' m mempunyai '+count+' laluan dari pusat ke tepi. Jumlah panjang laluan?',ans+' m',[Nq((d*count)+' m','radius_diameter'),Nq(d+' m','radius_diameter'),Nq((r+count)+' m','operation')],'Setiap laluan ialah satu jejari.','Tahun 6 · Masalah Bulatan Harian',true,true),id,'6.3.1','space_radius_paths','visual','application',s,['radius_diameter','space_reason']);
};

HIGH['D6.TIME']=function(id,s,shift){
  const mode=rotate(id,['prior','time_departure_reverse','time_day_cross_high','time_two_leg','time_error_high']);
  if(mode==='prior')return usePrior(prior(id,s,shift));
  if(mode==='time_departure_reverse')return mark(Q('Tokyo (UTC+9) menunjukkan 15:00 ketika sebuah penerbangan tiba selepas 7 jam dari Dubai (UTC+4). Pukul berapa penerbangan berlepas dari Dubai?','03:00',[Nq('08:00','time'),Nq('11:00','time'),Nq('13:00','time')],'15:00 Tokyo bersamaan 10:00 Dubai; tolak 7 jam untuk waktu berlepas.','Tahun 6 · Waktu Berlepas Songsang',true,true),id,'4.2.1','time_departure_reverse','story','reasoning',s,['timezone','duration','inverse']);
  if(mode==='time_day_cross_high')return mark(Q('Kuala Lumpur 22:30. Dubai 4 jam di belakang. Aktiviti di Dubai bermula 2 jam kemudian. Apakah waktu aktiviti?','20:30 hari yang sama',[Nq('00:30 hari berikutnya','time'),Nq('18:30 hari yang sama','time'),Nq('16:30 hari yang sama','time')],'Tukar dahulu ke Dubai, kemudian tambah 2 jam.','Tahun 6 · Zon Masa Pelbagai Langkah',true,true),id,'4.2.1','time_day_cross_high','story','reasoning',s,['timezone','multi_step']);
  if(mode==='time_two_leg')return mark(Q(table(['Segmen','Maklumat'],[['KL→Bangkok','2 jam'],['Rehat Bangkok','1 jam'],['Bangkok→Tokyo','5 jam']])+'Bertolak KL 08:00. Jumlah tempoh 8 jam; Tokyo 1 jam di hadapan KL. Waktu tiba Tokyo?','17:00',[Nq('16:00','time'),Nq('18:00','time'),Nq('15:00','time')],'Jumlahkan tempoh, kemudian laras beza zon.','Tahun 6 · Itinerari Masa',true,true),id,'4.2.1','time_two_leg','table','reasoning',s,['timezone','duration','multi_step']);
  return mark(Q('Murid menukar 23:30 Kuala Lumpur kepada 00:30 Tokyo tetapi menulis "hari yang sama". Pembetulan?','00:30 hari berikutnya',[Nq('22:30 hari yang sama','time'),Nq('23:30 hari yang sama','time'),Nq('01:30 hari yang sama','time')],'Tambah 1 jam melintasi tengah malam, jadi hari berubah.','Tahun 6 · Analisis Kesilapan Zon Masa',true,true),id,'4.1.2','time_error_high','verbal','reasoning',s,['timezone','day_change','error_analysis']);
};

HIGH['D6.MEASURE']=function(id,s,shift){
  const mode=rotate(id,['prior','measure_reverse_rate','measure_batches','measure_compare_high','measure_error_high']);
  if(mode==='prior')return usePrior(prior(id,s,shift));
  if(mode==='measure_reverse_rate')return mark(Q('4 m kabel berjisim 1.2 kg. Berapa meter kabel yang sama mempunyai jisim 3.6 kg?','12 m',[Nq('8 m','unit'),Nq('10 m','unit'),Nq('14 m','unit')],'Jisim meningkat 3 kali ganda, jadi panjang juga 3 kali ganda.','Tahun 6 · Hubungan Ukuran Songsang',true,true),id,'5.1.1(i)','measure_reverse_rate','story','reasoning',s,['length','mass','inverse']);
  if(mode==='measure_batches')return mark(Q('Setiap 2 m kain memerlukan 0.5 L pewarna. Ada 1.4 L pewarna. Berapa kumpulan penuh 2 m boleh disiapkan?',2,[Nq(1,'liquid'),Nq(3,'liquid'),Nq(4,'liquid')],'1.4 ÷ 0.5 = 2.8, jadi hanya 2 kumpulan penuh.','Tahun 6 · Had Sumber Ukuran',true,true),id,'5.1.1(ii)','measure_batches','story','reasoning',s,['length','liquid','limit']);
  if(mode==='measure_compare_high')return mark(Q(table(['Pilihan','Panjang','Jisim'],[['A','8 m','2.4 kg'],['B','10 m','2.5 kg']])+'Pilihan mana lebih ringan bagi setiap meter?','B',[Nq('A','unit'),Nq('sama','unit'),Nq('tidak boleh dibanding','unit')],'Banding jisim per meter: 2.4÷8 dan 2.5÷10.','Tahun 6 · Membanding Kadar Ukuran',true,true),id,'5.1.1(i)','measure_compare_high','table','reasoning',s,['length','mass','rate','compare']);
  return mark(Q('Murid berkata jika 2 L cecair berjisim 1.6 kg, maka 5 L berjisim 4.0 kg. Penilaian?','betul',[Nq('salah, 5 L berjisim 3.2 kg','unit'),Nq('salah, jisim tidak berkadar untuk cecair sama','unit'),Nq('tidak boleh ditentukan','unit')],'Kadar 0.8 kg/L; 5 × 0.8 = 4.0 kg.','Tahun 6 · Menilai Hubungan Ukuran',true,true),id,'5.1.1(iii)','measure_error_high','verbal','reasoning',s,['mass','liquid','error_analysis']);
};

HIGH['D6.COORD']=function(id,s,shift){
  const mode=rotate(id,['prior','coord_multistop_high','coord_scale_reverse_high','coord_shortest_high','coord_error_high']);
  if(mode==='prior')return usePrior(prior(id,s,shift));
  if(mode==='coord_multistop_high'){
    const sc=5;
    return mark(Q(coord([{x:1,y:1,label:'A'},{x:4,y:1,label:'B'},{x:4,y:5,label:'C'}],sc)+'Laluan A→B→C. 1 petak=5 km. Jumlah jarak?','35 km',[Nq('7 km','scale'),Nq('20 km','coord'),Nq('45 km','coord')],'3 petak + 4 petak = 7 petak; darab 5 km.','Tahun 6 · Laluan Berbilang Titik',true,true),id,'7.4.1','coord_multistop_high','visual','reasoning',s,['coord','scale','route']);
  }
  if(mode==='coord_scale_reverse_high')return mark(Q('A(1,2) ke B(5,2) mempunyai jarak sebenar 20 km. Berapakah skala bagi 1 petak?','5 km',[Nq('4 km','scale'),Nq('10 km','scale'),Nq('20 km','scale')],'Beza x = 4 petak; 20 ÷ 4 = 5 km setiap petak.','Tahun 6 · Menentukan Skala Koordinat',true,true),id,'7.1.1','coord_scale_reverse_high','verbal','reasoning',s,['coord','scale','inverse']);
  if(mode==='coord_shortest_high')return mark(Q(table(['Laluan','Petak'],[['A→B→D',7],['A→C→D',9]])+'Jika 1 petak=2 km, laluan lebih pendek dan beza jarak?','A→B→D, lebih pendek 4 km',[Nq('A→C→D, lebih pendek 4 km','route'),Nq('A→B→D, lebih pendek 2 km','route'),Nq('kedua-duanya sama','route')],'Beza 2 petak × 2 km = 4 km.','Tahun 6 · Membanding Laluan Berskala',true,true),id,'7.4.1','coord_shortest_high','table','reasoning',s,['coord','route','compare']);
  return mark(Q('Murid mengira jarak A(1,1) ke B(4,5) sebagai 5 petak dengan hanya melihat perubahan y. Pembetulan untuk laluan mendatar kemudian menegak?','7 petak',[Nq('4 petak','coord'),Nq('5 petak','coord'),Nq('20 petak','coord')],'Perubahan x=3 dan y=4; jumlah laluan grid=7 petak.','Tahun 6 · Analisis Laluan Koordinat',true,true),id,'7.4.1','coord_error_high','verbal','reasoning',s,['coord','error_analysis']);
};

HIGH['D6.SPACE_PROBLEM']=function(id,s,shift){
  const mode=rotate(id,['prior','space_design_high','space_tool_high','space_error_high','space_relevance_high']);
  if(mode==='prior')return usePrior(prior(id,s,shift));
  if(mode==='space_design_high')return mark(Q('Sebuah logo memerlukan bulatan diameter 16 cm dan sudut 135°. Tetapan alat yang betul?','jangka 8 cm dan protraktor 135°',[Nq('jangka 16 cm dan protraktor 135°','space_reason'),Nq('jangka 8 cm dan protraktor 45°','space_reason'),Nq('jangka 32 cm dan protraktor 135°','space_reason')],'Tukar diameter kepada jejari; sudut kekal 135°.','Tahun 6 · Reka Bentuk Ruang',true,true),id,'6.3.1','space_design_high','story','reasoning',s,['circle_draw','angle_construct']);
  if(mode==='space_tool_high')return mark(Q('Untuk membina bulatan diameter 12 cm dan sudut 120°, alat manakah perlu digunakan?','jangka bukaan 6 cm dan protraktor 120°',[Nq('pembaris sahaja','space_reason'),Nq('jangka bukaan 12 cm sahaja','space_reason'),Nq('protraktor 60° sahaja','space_reason')],'Bulatan perlukan jangka berdasarkan jejari; sudut perlukan protraktor.','Tahun 6 · Memilih Alat Ruang',true,true),id,'6.3.1','space_tool_high','verbal','reasoning',s,['circle_draw','angle_construct']);
  if(mode==='space_error_high')return mark(Q('Murid melukis bulatan diameter 18 cm dengan jangka 18 cm. Mengapa hasilnya salah?','jangka sepatutnya 9 cm kerana bukaan jangka ialah jejari',[Nq('jangka mesti 36 cm','circle_draw'),Nq('diameter tidak berkaitan dengan jangka','circle_draw'),Nq('hasil sebenarnya betul','circle_draw')],'Jejari = diameter ÷ 2.','Tahun 6 · Analisis Kesilapan Ruang',true,true),id,'6.3.1','space_error_high','verbal','reasoning',s,['circle_draw','error_analysis']);
  return mark(Q('Sebuah hiasan menggunakan 3 jejari bulatan 8 cm dan satu sudut 120° sebagai ukuran berasingan. Jumlah panjang tiga jejari?','24 cm',[Nq('8 cm','radius_diameter'),Nq('16 cm','radius_diameter'),Nq('120 cm','operation')],'Hanya maklumat panjang jejari digunakan untuk soalan panjang.','Tahun 6 · Memilih Maklumat Relevan Ruang',true,true),id,'6.3.1','space_relevance_high','story','reasoning',s,['space_reason','relevant_information']);
};

// Geometry and data domains --------------------------------------------------
CORE['D6.ANGLE']=function(id,s,shift){
  const mode=rotate(id,['prior','angle_compare_polygon','angle_straight']);
  if(mode==='prior')return usePrior(prior(id,s,shift));
  if(mode==='angle_compare_polygon')return mark(Q(polygon(6)+polygon(8)+'Sudut pedalaman heksagon sekata ialah 120° dan oktagon sekata 135°. Poligon mana mempunyai sudut lebih besar?','oktagon sekata',[Nq('heksagon sekata','polygon_angle'),Nq('kedua-duanya sama','polygon_angle'),Nq('tidak boleh dibanding','polygon_angle')],'Banding ukuran sudut pedalaman yang diberi.','Tahun 6 · Membanding Sudut Poligon',true,true),id,'6.1.1','angle_compare_polygon','visual','application',s,['polygon_angle']);
  const a=choose([45,60,75,105]),ans=180-a;
  return mark(Q(protractor(a)+'Satu sudut pada garis lurus ialah '+a+'°. Berapakah sudut bersebelahan untuk membentuk 180°?',ans+'°',[Nq(a+'°','angle_measure'),Nq((180+a)+'°','angle_measure'),Nq(Math.abs(90-a)+'°','angle_measure')],'Sudut pada garis lurus berjumlah 180°.','Tahun 6 · Aplikasi Ukuran Sudut',true,true),id,'6.1.1','angle_straight','visual','application',s,['angle_measure']);
};

CORE['D6.CIRCLE']=function(id,s,shift){
  const mode=rotate(id,['prior','circle_diameter_compass','circle_compare']);
  if(mode==='prior')return usePrior(prior(id,s,shift));
  if(mode==='circle_diameter_compass'){
    const d=choose([8,10,12,16]),r=d/2;
    return mark(Q('Sebuah bulatan perlu berdiameter '+d+' cm. Berapakah bukaan jangka lukis?',r+' cm',[Nq(d+' cm','circle_draw'),Nq((d*2)+' cm','circle_draw'),Nq((r+1)+' cm','circle_draw')],'Bukaan jangka ialah jejari, iaitu separuh diameter.','Tahun 6 · Melukis Bulatan daripada Diameter',true,true),id,'6.2.2','circle_diameter_compass','story','application',s,['circle_draw','radius_diameter']);
  }
  return mark(Q(table(['Bulatan','Jejari','Diameter'],[['A','4 cm','8 cm'],['B','5 cm','10 cm']])+'Bulatan mana lebih besar?','B',[Nq('A','radius_diameter'),Nq('sama','radius_diameter'),Nq('tidak boleh dibanding','radius_diameter')],'Banding jejari atau diameter; nilai lebih besar memberi bulatan lebih besar.','Tahun 6 · Jejari dan Diameter',true,true),id,'6.2.1','circle_compare','table','application',s,['radius_diameter']);
};

CORE['D6.PIE']=function(id,s,shift){
  const mode=rotate(id,['prior','pie_infer_total_core','pie_combine']);
  if(mode==='prior')return usePrior(prior(id,s,shift));
  const sectors=[{label:'A',angle:180,value:40},{label:'B',angle:90,value:20},{label:'C',angle:45,value:10},{label:'D',angle:45,value:10}];
  if(mode==='pie_infer_total_core')return mark(Q(pie(sectors)+'Sektor B ialah 90° dan mewakili 20 murid. Jumlah murid?',80,[Nq(40,'pie_quantity'),Nq(90,'pie_angle'),Nq(100,'pie_quantity')],'90° ialah 1/4 bulatan; darab kuantiti sektor dengan 4.','Tahun 6 · Inferens Carta Pai',true,true),id,'8.1.1','pie_infer_total_core','visual','application',s,['pie_quantity']);
  return mark(Q(pie(sectors)+'Berapa murid dalam kategori C dan D bersama?',20,[Nq(10,'pie_quantity'),Nq(40,'pie_quantity'),Nq(90,'pie_angle')],'Gabungkan kuantiti dua sektor yang diminta.','Tahun 6 · Gabung Data Carta Pai',true,true),id,'8.1.1','pie_combine','visual','application',s,['pie_quantity','combine']);
};

CORE['D6.PROB']=function(id,s,shift){
  const mode=rotate(id,['prior','prob_compare_core','prob_complement_core','prob_order_core']);
  if(mode==='prior')return usePrior(prior(id,s,shift));
  if(mode==='prob_compare_core')return mark(Q(table(['Beg','Merah','Biru'],[['A',6,4],['B',3,7]])+'Beg mana lebih berkemungkinan menghasilkan guli merah?','Beg A',[Nq('Beg B','chance_reason'),Nq('sama kemungkinan','chance_reason'),Nq('mustahil untuk kedua-duanya','chance_reason')],'Banding bahagian guli merah dalam setiap beg.','Tahun 6 · Banding Kebolehjadian',true,true),id,'8.2.2','prob_compare_core','table','application',s,['chance_reason']);
  if(mode==='prob_order_core')return mark(Q('Beg A: 2 merah, 8 biru. Beg B: 5 merah, 5 biru. Beg C: 8 merah, 2 biru. Susunan kebolehjadian merah daripada paling rendah ke paling tinggi?','A, B, C',[Nq('C, B, A','chance_reason'),Nq('B, A, C','chance_reason'),Nq('A, C, B','chance_reason')],'Banding bahagian merah bagi setiap beg.','Tahun 6 · Susunan Kebolehjadian',true,true),id,'8.2.2','prob_order_core','verbal','application',s,['chance_reason','order']);
  return mark(Q(bag(8,2)+'Satu guli dipilih. Peristiwa manakah lebih berkemungkinan?','memilih guli merah',[Nq('memilih guli biru','chance_reason'),Nq('kedua-duanya sama kemungkinan','chance_reason'),Nq('kedua-duanya mustahil','chance_reason')],'Merah lebih banyak daripada biru, jadi lebih berkemungkinan dipilih.','Tahun 6 · Membanding Peristiwa',true,true),id,'8.2.2','prob_complement_core','visual','application',s,['chance_category','chance_reason']);
};

CORE['D6.DATA_PROBLEM']=function(id,s,shift){
  const mode=rotate(id,['prior','data_decision_core','data_infer_total_core','data_compare_core']);
  if(mode==='prior')return usePrior(prior(id,s,shift));
  const sectors=[{label:'A',angle:180,value:40},{label:'B',angle:90,value:20},{label:'C',angle:45,value:10},{label:'D',angle:45,value:10}];
  if(mode==='data_decision_core')return mark(Q(pie(sectors)+'Program hanya boleh memilih satu kategori dengan sokongan paling tinggi. Kategori?','A',[Nq('B','data_reason'),Nq('C','data_reason'),Nq('D','data_reason')],'Sektor terbesar mewakili sokongan tertinggi.','Tahun 6 · Keputusan daripada Data',true,true),id,'8.3.1','data_decision_core','visual','application',s,['data_reason']);
  if(mode==='data_infer_total_core')return mark(Q(pie(sectors)+'Kategori C ialah 45° dan mewakili 10 murid. Jumlah murid?',80,[Nq(40,'pie_quantity'),Nq(45,'pie_angle'),Nq(90,'pie_quantity')],'45° ialah 1/8 bulatan; darab 10 dengan 8.','Tahun 6 · Inferens Data',true,true),id,'8.3.1','data_infer_total_core','visual','application',s,['data_reason','pie_quantity']);
  return mark(Q(pie(sectors)+'Berapa kali ganda sokongan A berbanding B?',2,[Nq(1,'data_reason'),Nq(4,'data_reason'),Nq(20,'operation')],'Banding 180° dengan 90° atau 40 dengan 20.','Tahun 6 · Perbandingan Data',true,true),id,'8.3.1','data_compare_core','visual','application',s,['data_reason','compare']);
};

HIGH['D6.ANGLE']=function(id,s,shift){
  const mode=rotate(id,['prior','angle_polygon_compare_high','angle_scale_high','angle_combined_high','angle_claim_high']);
  if(mode==='prior')return usePrior(prior(id,s,shift));
  if(mode==='angle_polygon_compare_high')return mark(Q(polygon(6)+polygon(8)+'Sudut pedalaman heksagon sekata 120° dan oktagon sekata 135°. Beza ukuran?','15°',[Nq('255°','polygon_angle'),Nq('30°','polygon_angle'),Nq('45°','polygon_angle')],'Banding dua ukuran sudut pedalaman.','Tahun 6 · Penaakulan Sudut Poligon',true,true),id,'6.1.1','angle_polygon_compare_high','visual','reasoning',s,['polygon_angle','compare']);
  if(mode==='angle_scale_high')return mark(Q(protractor(135)+'Murid menggunakan skala yang bermula pada hujung salah dan membaca 45°. Apakah bacaan betul?','135°',[Nq('45°','angle_measure'),Nq('90°','angle_measure'),Nq('180°','angle_measure')],'Mulakan bacaan pada 0° di garis dasar yang digunakan.','Tahun 6 · Semak Skala Protraktor',true,true),id,'6.1.1','angle_scale_high','visual','reasoning',s,['angle_measure','scale_read']);
  if(mode==='angle_combined_high')return mark(Q('Dua sudut 60° dan 75° dicantum tanpa bertindih. Sudut terhasil?','135°',[Nq('15°','angle_measure'),Nq('120°','angle_measure'),Nq('180°','angle_measure')],'Jumlahkan dua bukaan sudut.','Tahun 6 · Gabungan Sudut',true,true),id,'6.1.2','angle_combined_high','verbal','reasoning',s,['angle_construct']);
  return mark(Q('Seorang murid mendakwa sudut 150° ialah sudut tirus kerana kurang daripada 180°. Penilaian?','salah, 150° ialah sudut cakah',[Nq('betul','angle_measure'),Nq('salah, 150° ialah sudut tegak','angle_measure'),Nq('tidak boleh ditentukan','angle_measure')],'Sudut tirus <90°, tegak 90°, cakah antara 90° dan 180°.','Tahun 6 · Menilai Dakwaan Sudut',true,true),id,'6.1.2','angle_claim_high','verbal','reasoning',s,['angle_construct','error_analysis']);
};

HIGH['D6.CIRCLE']=function(id,s,shift){
  const mode=rotate(id,['prior','circle_compass_high','circle_two_high','circle_label_high','circle_design_high']);
  if(mode==='prior')return usePrior(prior(id,s,shift));
  if(mode==='circle_compass_high')return mark(Q('Bulatan perlu berdiameter 14 cm. Murid membuka jangka 14 cm. Apakah pembetulan?','bukaan jangka 7 cm',[Nq('kekal 14 cm','circle_draw'),Nq('bukaan 28 cm','circle_draw'),Nq('bukaan 3.5 cm','circle_draw')],'Jangka ditetapkan kepada jejari, separuh diameter.','Tahun 6 · Analisis Pembinaan Bulatan',true,true),id,'6.2.2','circle_compass_high','story','reasoning',s,['circle_draw','radius_diameter']);
  if(mode==='circle_two_high')return mark(Q(table(['Bulatan','Diameter'],[['A','12 cm'],['B','18 cm']])+'Beza jejari A dan B?','3 cm',[Nq('6 cm','radius_diameter'),Nq('12 cm','radius_diameter'),Nq('15 cm','radius_diameter')],'Jejari ialah separuh diameter: 6 cm dan 9 cm.','Tahun 6 · Banding Jejari Bulatan',true,true),id,'6.2.1','circle_two_high','table','reasoning',s,['radius_diameter','compare']);
  if(mode==='circle_label_high')return mark(Q('Rajah dilabel diameter = 10 cm tetapi garis yang ditanda hanya dari pusat ke lilitan. Apakah kesilapan?','garis itu jejari, bukan diameter',[Nq('diameter mesti lebih pendek daripada jejari','circle_part'),Nq('pusat tidak diperlukan','circle_part'),Nq('tiada kesilapan','circle_part')],'Jejari bermula di pusat dan berakhir di lilitan; diameter merentasi pusat.','Tahun 6 · Semak Label Bulatan',true,true),id,'6.2.1','circle_label_high','verbal','reasoning',s,['circle_part','error_analysis']);
  return mark(Q('Reka bentuk memerlukan dua bulatan: A jejari 4 cm, B diameter 10 cm. Yang mana memerlukan bukaan jangka lebih besar?','B, 5 cm',[Nq('A, 8 cm','circle_draw'),Nq('sama, 4 cm','circle_draw'),Nq('tidak boleh dibanding','circle_draw')],'Bukaan jangka = jejari. A=4 cm, B=5 cm.','Tahun 6 · Rancang Bulatan',true,true),id,'6.2.2','circle_design_high','story','reasoning',s,['circle_draw','compare']);
};

HIGH['D6.PIE']=function(id,s,shift){
  const mode=rotate(id,['prior','pie_total_high','pie_missing_high','pie_combine_high','pie_error_high']);
  if(mode==='prior')return usePrior(prior(id,s,shift));
  const sectors=[{label:'A',angle:180,value:40},{label:'B',angle:90,value:20},{label:'C',angle:45,value:10},{label:'D',angle:45,value:10}];
  if(mode==='pie_total_high')return mark(Q(pie(sectors)+'Jika sektor B 90° mewakili 20 murid, jumlah murid?',80,[Nq(40,'pie_quantity'),Nq(90,'pie_angle'),Nq(100,'pie_quantity')],'90° ialah 1/4; jumlah = 20×4.','Tahun 6 · Inferens Carta Pai',true,true),id,'8.1.1','pie_total_high','visual','reasoning',s,['pie_quantity','inverse']);
  if(mode==='pie_missing_high')return mark(Q('Dalam carta pai, tiga sektor diketahui 120°, 90° dan 60°. Sudut sektor keempat?','90°',[Nq('30°','pie_angle'),Nq('60°','pie_angle'),Nq('120°','pie_angle')],'Jumlah semua sektor carta pai ialah 360°.','Tahun 6 · Sudut Hilang Carta Pai',true,true),id,'8.1.1','pie_missing_high','verbal','reasoning',s,['pie_angle']);
  if(mode==='pie_combine_high')return mark(Q(pie(sectors)+'Adakah gabungan B+C sama dengan A?','tidak, B+C=30 manakala A=40',[Nq('ya, kedua-duanya 40','data_reason'),Nq('ya, kedua-duanya 30','data_reason'),Nq('tidak boleh ditentukan','data_reason')],'Gabungkan kuantiti B dan C, kemudian banding dengan A.','Tahun 6 · Gabung dan Banding Carta Pai',true,true),id,'8.1.1','pie_combine_high','visual','reasoning',s,['pie_quantity','compare']);
  return mark(Q('Sebuah carta pai mempunyai sektor 180°, 90°, 60° dan 45°. Adakah carta lengkap?','tidak, jumlahnya 375°',[Nq('ya, jumlahnya 360°','pie_angle'),Nq('tidak, jumlahnya 315°','pie_angle'),Nq('tidak boleh ditentukan','pie_angle')],'Semua sektor mesti berjumlah tepat 360°.','Tahun 6 · Semak Konsistensi Carta Pai',true,true),id,'8.1.1','pie_error_high','verbal','reasoning',s,['pie_angle','error_analysis']);
};

HIGH['D6.PROB']=function(id,s,shift){
  const mode=rotate(id,['prior','prob_compare_high','prob_equalize_high','prob_error_high','prob_order_high']);
  if(mode==='prior')return usePrior(prior(id,s,shift));
  if(mode==='prob_compare_high')return mark(Q(table(['Beg','Merah','Jumlah'],[['A',4,10],['B',6,20]])+'Beg mana lebih berkemungkinan memberi merah?','Beg A',[Nq('Beg B','chance_reason'),Nq('sama kemungkinan','chance_reason'),Nq('tidak boleh dibanding','chance_reason')],'Banding bahagian merah: 4/10 lebih besar daripada 6/20.','Tahun 6 · Banding Kebolehjadian dengan Jumlah Berbeza',true,true),id,'8.2.2','prob_compare_high','table','reasoning',s,['chance_reason','compare']);
  if(mode==='prob_equalize_high')return mark(Q('Beg ada 4 merah dan 6 biru. Berapa guli merah perlu ditambah supaya merah dan biru sama banyak?',2,[Nq(1,'chance_reason'),Nq(4,'chance_reason'),Nq(6,'chance_reason')],'Untuk sama kemungkinan, bilangan dua warna perlu sama.','Tahun 6 · Mengubah Kebolehjadian',true,true),id,'8.2.2','prob_equalize_high','story','reasoning',s,['chance_category','inverse']);
  if(mode==='prob_error_high')return mark(Q('Murid berkata beg dengan 5 merah, 5 biru memberi merah "besar kemungkinan". Penilaian?','salah, sama kemungkinan',[Nq('betul','chance_reason'),Nq('salah, kecil kemungkinan','chance_reason'),Nq('mustahil','chance_reason')],'Dua hasil dengan bilangan sama memberi sama kemungkinan.','Tahun 6 · Analisis Kebolehjadian',true,true),id,'8.2.1/8.2.2','prob_error_high','verbal','reasoning',s,['chance_category','error_analysis']);
  return mark(Q('Susun daripada kurang kepada lebih berkemungkinan memilih merah: Beg A 1 merah/9 biru; B 5/5; C 9/1.','A, B, C',[Nq('C, B, A','chance_reason'),Nq('B, A, C','chance_reason'),Nq('A, C, B','chance_reason')],'Banding bahagian merah bagi setiap beg.','Tahun 6 · Susunan Kebolehjadian',true,true),id,'8.2.2','prob_order_high','verbal','reasoning',s,['chance_reason','order']);
};

HIGH['D6.DATA_PROBLEM']=function(id,s,shift){
  const mode=rotate(id,['prior','data_threshold_high','data_total_high','data_claim_high','data_combine_high']);
  if(mode==='prior')return usePrior(prior(id,s,shift));
  const sectors=[{label:'A',angle:180,value:40},{label:'B',angle:90,value:20},{label:'C',angle:45,value:10},{label:'D',angle:45,value:10}];
  if(mode==='data_threshold_high')return mark(Q(pie(sectors)+'Syarat pemilihan: kategori mesti sekurang-kurangnya dua kali kategori kedua tertinggi. Kategori yang layak?','A',[Nq('B','data_reason'),Nq('C','data_reason'),Nq('tiada','data_reason')],'A=40 dan B=20; A tepat dua kali B.','Tahun 6 · Keputusan Berdasarkan Data',true,true),id,'8.3.1','data_threshold_high','visual','reasoning',s,['data_reason','threshold']);
  if(mode==='data_total_high')return mark(Q('Sektor 45° mewakili 12 murid. Berapakah jumlah keseluruhan data?',96,[Nq(48,'pie_quantity'),Nq(45,'pie_angle'),Nq(108,'pie_quantity')],'45° ialah 1/8 bulatan; jumlah=12×8.','Tahun 6 · Inferens Jumlah Data',true,true),id,'8.3.1','data_total_high','verbal','reasoning',s,['data_reason','inverse']);
  if(mode==='data_claim_high')return mark(Q(pie(sectors)+'Murid mendakwa B dan C bersama-sama mengatasi A. Penilaian?','salah, B+C=30 kurang daripada A=40',[Nq('betul, B+C=50','data_reason'),Nq('betul kerana dua kategori sentiasa lebih besar','data_reason'),Nq('tidak boleh ditentukan','data_reason')],'Jumlahkan B dan C sebelum membandingkan dengan A.','Tahun 6 · Menilai Dakwaan Data',true,true),id,'8.3.1','data_claim_high','visual','reasoning',s,['data_reason','error_analysis']);
  return mark(Q(pie(sectors)+'Jika C dan D digabung menjadi satu kategori, sudut sektor baharu?','90°',[Nq('45°','pie_angle'),Nq('180°','pie_angle'),Nq('20°','operation')],'Gabungkan 45° + 45°.','Tahun 6 · Menggabung Kategori Data',true,true),id,'8.3.1','data_combine_high','visual','reasoning',s,['data_reason','combine']);
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