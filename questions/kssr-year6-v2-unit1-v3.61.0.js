// Year 6 Curriculum Bank v2 — Unit 1: Nombor Bulat dan Operasi Asas
(function(){
'use strict';
const RT=window.PAY6V2Runtime;if(!RT)return;
const {GEN,Nq,choose,rand,q,mark,chooseMode,bandModes,stage}=RT;

const numberPairs=[
 [1250000,'satu juta dua ratus lima puluh ribu'],
 [2305000,'dua juta tiga ratus lima ribu'],
 [4070200,'empat juta tujuh puluh ribu dua ratus'],
 [5600040,'lima juta enam ratus ribu empat puluh'],
 [7812500,'tujuh juta lapan ratus dua belas ribu lima ratus'],
 [9050006,'sembilan juta lima puluh ribu enam']
];

GEN['1.1.1']=function(id,s){
 const mode=chooseMode(id,'1.1.1',bandModes(s,['digit_read','word_write'],['digit_read','word_write','order_numbers'],['number_claim','between_constraint','order_numbers']));
 const p=choose(numberPairs),i=numberPairs.indexOf(p);
 if(mode==='digit_read')return mark(q('Bagaimanakah <b>'+p[0].toLocaleString('en-US')+'</b> dibaca?',p[1],[Nq(numberPairs[(i+1)%6][1],'number_read'),Nq(numberPairs[(i+2)%6][1],'number_read'),Nq(numberPairs[(i+3)%6][1],'number_read')],'Baca mengikut kumpulan juta, ribu dan unit.','Tahun 6 · Membaca Nombor'),id,'1.1.1',mode,'verbal',stage(s)===1?'concept':'application',s,['number_read']);
 if(mode==='word_write')return mark(q('Tulis dalam angka: <b>'+p[1]+'</b>.',p[0],[Nq(p[0]+1000,'number_write'),Nq(Math.max(0,p[0]-10000),'number_write'),Nq(p[0]+100000,'number_write')],'Pisahkan juta, ribu dan unit sebelum menulis angka.','Tahun 6 · Menulis Nombor'),id,'1.1.1',mode,'verbal',stage(s)===3?'reasoning':'application',s,['number_write']);
 if(mode==='order_numbers'){
  const vals=choose([[4205000,4025000,4250000],[6150000,6105000,6051000],[7900000,7090000,7700000]]),ans=[...vals].sort((a,b)=>a-b).map(x=>x.toLocaleString()).join(' < ');
  return mark(q('Susun daripada kecil ke besar: <b>'+vals.map(x=>x.toLocaleString()).join(', ')+'</b>.',ans,[Nq([...vals].sort((a,b)=>b-a).map(x=>x.toLocaleString()).join(' < '),'order'),Nq(vals.map(x=>x.toLocaleString()).join(' < '),'order'),Nq([vals[1],vals[0],vals[2]].map(x=>x.toLocaleString()).join(' < '),'order')],'Banding digit dari nilai tempat terbesar.','Tahun 6 · Menyusun Nombor'),id,'1.1.1',mode,'symbolic',stage(s)===3?'reasoning':'application',s,['order']);
 }
 if(mode==='number_claim')return mark(q('Murid membaca 4,070,200 sebagai "empat juta tujuh ratus dua ratus". Penilaian?','salah, bacaan yang betul ialah empat juta tujuh puluh ribu dua ratus',[Nq('betul','number_read'),Nq('salah, empat juta tujuh ribu dua ratus','number_read'),Nq('salah, empat juta tujuh ratus ribu dua ratus','number_read')],'Perhatikan nilai 70 ribu.','Tahun 6 · Menilai Bacaan Nombor'),id,'1.1.1',mode,'verbal','reasoning',s,['number_read','error_analysis']);
 return mark(q('Nombor manakah lebih besar daripada 6.45 juta tetapi lebih kecil daripada 6.5 juta?',6475000,[Nq(6405000,'range'),Nq(6505000,'range'),Nq(6450000,'range')],'Semak kedua-dua sempadan julat.','Tahun 6 · Julat Nombor'),id,'1.1.1',mode,'verbal','reasoning',s,['range']);
};

GEN['1.1.2']=function(id,s){
 const mode=chooseMode(id,'1.1.2',bandModes(s,['place_name','digit_value'],['digit_value','expanded_form','place_compare'],['place_error','expanded_form','place_compare']));
 if(mode==='place_name')return mark(q('Dalam 4,385,261, digit 8 berada pada nilai tempat?','puluh ribu',[Nq('ratus ribu','place'),Nq('ribu','place'),Nq('ratus','place')],'Kira nilai tempat dari kanan.','Tahun 6 · Nilai Tempat'),id,'1.1.2',mode,'symbolic','concept',s,['place']);
 if(mode==='digit_value')return mark(q('Apakah nilai digit 6 dalam 7,063,210?',60000,[Nq(6000,'place'),Nq(600000,'place'),Nq(6,'place')],'Digit 6 berada pada tempat puluh ribu.','Tahun 6 · Nilai Digit'),id,'1.1.2',mode,'symbolic',stage(s)===3?'reasoning':'application',s,['place']);
 if(mode==='expanded_form')return mark(q('Bentuk cerakin yang betul bagi <b>7,050,410</b> ialah?','7 000 000 + 50 000 + 400 + 10',[Nq('7 000 000 + 5 000 + 400 + 10','expanded'),Nq('700 000 + 50 000 + 400 + 10','expanded'),Nq('7 000 000 + 50 000 + 40 + 10','expanded')],'Cerakinkan setiap digit bukan sifar mengikut nilai tempatnya.','Tahun 6 · Cerakin Nombor'),id,'1.1.2',mode,'symbolic',stage(s)===3?'reasoning':'application',s,['expanded']);
 if(mode==='place_compare')return mark(q('Dalam 6,482,315, nilai digit 8 berapa kali nilai digit 2?',400,[Nq(4,'place'),Nq(40,'place'),Nq(4000,'place')],'80 000 ÷ 200 = 400.','Tahun 6 · Banding Nilai Digit'),id,'1.1.2',mode,'verbal',stage(s)===3?'reasoning':'application',s,['place','compare']);
 return mark(q('Murid mengatakan nilai digit 5 dalam 3,450,210 ialah 5,000. Penilaian?','salah, nilainya 50 000',[Nq('betul','place'),Nq('salah, nilainya 500 000','place'),Nq('salah, nilainya 500','place')],'Digit 5 berada pada tempat puluh ribu.','Tahun 6 · Analisis Nilai Tempat'),id,'1.1.2',mode,'verbal','reasoning',s,['place','error_analysis']);
};

GEN['1.1.3']=function(id,s){
 const mode=chooseMode(id,'1.1.3',bandModes(s,['fraction_to_number','number_to_fraction'],['fraction_to_number','number_to_fraction','compare'],['compare','sum','error']));
 const f=choose([[1,2,500000],[1,4,250000],[3,4,750000],[1,5,200000],[3,5,600000]]);
 if(mode==='fraction_to_number')return mark(q('<b>'+f[0]+'/'+f[1]+' juta</b> bersamaan?',f[2],[Nq(f[2]/10,'fraction_million'),Nq(1000000-f[2],'fraction_million'),Nq(f[1]*100000,'fraction_million')],'Cari pecahan daripada 1 000 000.','Tahun 6 · Pecahan Juta'),id,'1.1.3',mode,'symbolic',stage(s)===1?'procedure':'application',s,['fraction_million']);
 if(mode==='number_to_fraction')return mark(q('<b>'+f[2].toLocaleString()+'</b> bersamaan berapa juta?',f[0]+'/'+f[1]+' juta',[Nq(f[1]+'/'+f[0]+' juta','fraction_million'),Nq(f[0]+'/'+(f[1]*10)+' juta','fraction_million'),Nq((f[2]/100000)+' juta','fraction_million')],'Banding dengan 1 000 000 dan ringkaskan pecahan.','Tahun 6 · Nombor kepada Pecahan Juta'),id,'1.1.3',mode,'symbolic',stage(s)===3?'reasoning':'application',s,['fraction_million']);
 if(mode==='compare')return mark(q('Yang manakah lebih besar: <b>3/4 juta</b> atau <b>0.7 juta</b>?','3/4 juta',[Nq('0.7 juta','fraction_million'),Nq('sama nilai','fraction_million'),Nq('tidak boleh dibanding','fraction_million')],'3/4 juta = 0.75 juta.','Tahun 6 · Banding Pecahan Juta'),id,'1.1.3',mode,'verbal',stage(s)===3?'reasoning':'application',s,['fraction_million','compare']);
 if(mode==='sum')return mark(q('Sebuah kawasan mempunyai 1/2 juta penduduk dan menerima tambahan 1/4 juta. Jumlah?',750000,[Nq(250000,'fraction_million'),Nq(500000,'fraction_million'),Nq(1000000,'fraction_million')],'1/2 + 1/4 = 3/4 juta.','Tahun 6 · Aplikasi Pecahan Juta'),id,'1.1.3',mode,'story','reasoning',s,['fraction_million','multi_step']);
 return mark(q('Murid menulis 3/5 juta = 300 000. Penilaian?','salah, 3/5 juta = 600 000',[Nq('betul','fraction_million'),Nq('salah, 800 000','fraction_million'),Nq('salah, 60 000','fraction_million')],'1/5 juta = 200 000.','Tahun 6 · Semak Pecahan Juta'),id,'1.1.3',mode,'verbal','reasoning',s,['fraction_million','error_analysis']);
};

GEN['1.1.4']=function(id,s){
 const mode=chooseMode(id,'1.1.4',bandModes(s,['decimal_to_number','number_to_decimal'],['decimal_to_number','number_to_decimal','compare'],['compare','operation','error']));
 const p=choose([[1.25,1250000],[2.4,2400000],[3.075,3075000],[5.6,5600000],[7.008,7008000]]);
 if(mode==='decimal_to_number')return mark(q('<b>'+p[0]+' juta</b> bersamaan?',p[1],[Nq(p[1]/10,'decimal_million'),Nq(p[1]+100000,'decimal_million'),Nq(Math.round(p[0]*100000),'decimal_million')],'Darab dengan 1 000 000.','Tahun 6 · Perpuluhan Juta'),id,'1.1.4',mode,'symbolic',stage(s)===1?'procedure':'application',s,['decimal_million']);
 if(mode==='number_to_decimal')return mark(q('<b>'+p[1].toLocaleString()+'</b> dalam unit juta ialah?',p[0]+' juta',[Nq((p[0]/10)+' juta','decimal_million'),Nq((p[0]+1)+' juta','decimal_million'),Nq((p[1]/100000)+' juta','decimal_million')],'Bahagi dengan 1 000 000.','Tahun 6 · Nombor kepada Perpuluhan Juta'),id,'1.1.4',mode,'symbolic',stage(s)===3?'reasoning':'application',s,['decimal_million']);
 if(mode==='compare')return mark(q('Yang manakah lebih besar: <b>2.35 juta</b> atau <b>2 305 000</b>?','2.35 juta',[Nq('2 305 000','decimal_million'),Nq('sama nilai','decimal_million'),Nq('tidak boleh dibanding','decimal_million')],'2.35 juta = 2 350 000.','Tahun 6 · Banding Perpuluhan Juta'),id,'1.1.4',mode,'verbal',stage(s)===3?'reasoning':'application',s,['decimal_million','compare']);
 if(mode==='operation')return mark(q('2.4 juta − 0.65 juta = ?',1750000,[Nq(1650000,'decimal_million'),Nq(2050000,'decimal_million'),Nq(3050000,'decimal_million')],'2.4 − 0.65 = 1.75 juta.','Tahun 6 · Operasi Perpuluhan Juta'),id,'1.1.4',mode,'symbolic','reasoning',s,['decimal_million','operation']);
 return mark(q('Murid menulis 3.057 juta = 3 570 000. Penilaian?','salah, 3.057 juta = 3 057 000',[Nq('betul','decimal_million'),Nq('salah, 305 700','decimal_million'),Nq('salah, 3 005 700','decimal_million')],'0.057 juta = 57 000.','Tahun 6 · Semak Perpuluhan Juta'),id,'1.1.4',mode,'verbal','reasoning',s,['decimal_million','error_analysis']);
};

GEN['1.1.5']=function(id,s){
 const mode=chooseMode(id,'1.1.5',bandModes(s,['next','missing'],['next','missing','rule'],['rule','reverse','error']));
 if(mode==='next'){const start=choose([1250000,2400000]),step=choose([125000,250000]),ans=start+3*step;return mark(q(start.toLocaleString()+', '+(start+step).toLocaleString()+', '+(start+2*step).toLocaleString()+', ___',ans,[Nq(ans-step,'pattern'),Nq(ans+step,'pattern'),Nq(start+3,'pattern')],'Cari beza tetap.','Tahun 6 · Pola Nombor'),id,'1.1.5',mode,'symbolic',stage(s)===1?'procedure':'application',s,['pattern']);}
 if(mode==='missing')return mark(q('2.10 juta, ___, 2.60 juta, 2.85 juta. Nombor yang hilang?', '2.35 juta',[Nq('2.25 juta','pattern'),Nq('2.45 juta','pattern'),Nq('2.50 juta','pattern')],'Pola bertambah 0.25 juta.','Tahun 6 · Nombor Hilang'),id,'1.1.5',mode,'symbolic',stage(s)===3?'reasoning':'application',s,['pattern']);
 if(mode==='rule')return mark(q('1.2 juta, 1.45 juta, 1.70 juta, 1.95 juta. Peraturannya?','tambah 0.25 juta setiap langkah',[Nq('tambah 0.20 juta','pattern'),Nq('darab 0.25','pattern'),Nq('tolak 0.25 juta','pattern')],'Banding beza setiap pasangan.','Tahun 6 · Peraturan Pola'),id,'1.1.5',mode,'verbal',stage(s)===3?'reasoning':'application',s,['pattern']);
 if(mode==='reverse')return mark(q('Pola berkurang 175 000 setiap langkah. Sebutan keempat 2 300 000. Sebutan pertama?',2825000,[Nq(2475000,'pattern'),Nq(2125000,'pattern'),Nq(3000000,'pattern')],'Bergerak ke belakang tiga langkah dengan menambah 175 000.','Tahun 6 · Pola Songsang'),id,'1.1.5',mode,'verbal','reasoning',s,['pattern','inverse']);
 return mark(q('3.0 juta, 3.2 juta, 3.4 juta, 3.7 juta dikatakan bertambah 0.2 juta secara tetap. Penilaian?','salah kerana langkah terakhir bertambah 0.3 juta',[Nq('betul','pattern'),Nq('salah kerana semua langkah 0.1 juta','pattern'),Nq('betul jika nombor akhir dibundarkan','pattern')],'Semak setiap beza berturutan.','Tahun 6 · Semak Pola'),id,'1.1.5',mode,'verbal','reasoning',s,['pattern','error_analysis']);
};

GEN['1.2.1']=function(id,s){
 const mode=chooseMode(id,'1.2.1',bandModes(s,['order','brackets'],['order','brackets','unknown','story'],['unknown','story','method','error','estimate']));
 if(mode==='order'){const a=rand(40,90),b=rand(10,25),c=rand(2,9),ans=a+b*c;return mark(q(a+' + '+b+' × '+c+' = ?',ans,[Nq((a+b)*c,'operation'),Nq(a+b+c,'operation'),Nq(a*c+b,'operation')],'Darab dahulu.','Tahun 6 · Tertib Operasi'),id,'1.2.1',mode,'symbolic',stage(s)===1?'procedure':'application',s,['operation']);}
 if(mode==='brackets'){const a=rand(20,60),b=rand(5,15),c=rand(2,8),ans=(a+b)*c;return mark(q('('+a+' + '+b+') × '+c+' = ?',ans,[Nq(a+b*c,'operation'),Nq(a+b+c,'operation'),Nq(a+b+c+10,'operation')],'Selesaikan kurungan dahulu.','Tahun 6 · Operasi dengan Kurungan'),id,'1.2.1',mode,'symbolic',stage(s)===1?'procedure':'application',s,['operation','brackets']);}
 if(mode==='unknown'){const x=choose([12,18,24]),b=choose([3,4,5]),c=choose([20,35]),total=x*b+c;return mark(q('□ × '+b+' + '+c+' = '+total+'. Nilai □?',x,[Nq(total-c,'operation'),Nq(Math.round(total/b),'operation'),Nq(x+5,'operation')],'Tolak '+c+', kemudian bahagi '+b+'.','Tahun 6 · Nilai Tidak Diketahui'),id,'1.2.1',mode,'symbolic',stage(s)===3?'reasoning':'application',s,['operation','inverse']);}
 if(mode==='story'){const boxes=choose([6,8,12]),each=choose([25,40]),used=choose([80,100]),ans=boxes*each-used;return mark(q(boxes+' kotak mengandungi '+each+' unit setiap satu. '+used+' unit digunakan. Baki?',ans,[Nq(boxes*(each-used),'operation'),Nq(boxes+each-used,'operation'),Nq(boxes*each+used,'operation')],'Darab dahulu, kemudian tolak.','Tahun 6 · Masalah Operasi Gabungan'),id,'1.2.1',mode,'story',stage(s)===3?'reasoning':'application',s,['operation','multi_step']);}
 if(mode==='method')return mark(q('Untuk (48 + 12) × 5, Murid A mengira 60 × 5. Murid B mengira 48 + 60. Siapa betul?','Murid A',[Nq('Murid B','operation'),Nq('kedua-duanya betul','operation'),Nq('kedua-duanya salah','operation')],'Kurungan dahulu.','Tahun 6 · Membanding Kaedah'),id,'1.2.1',mode,'verbal','reasoning',s,['operation','method']);
 if(mode==='error')return mark(q('Murid mendapat 240 untuk 36 + 12 × 5 kerana dia tambah dahulu. Jawapan betul?',96,[Nq(240,'operation'),Nq(60,'operation'),Nq(180,'operation')],'12 × 5 = 60; 36 + 60 = 96.','Tahun 6 · Analisis Tertib Operasi'),id,'1.2.1',mode,'verbal','reasoning',s,['operation','error_analysis']);
 return mark(q('Anggaran 780 × 32 ≈ 40 000. Adakah munasabah?','tidak munasabah',[Nq('munasabah','estimate'),Nq('tepat tanpa mengira','estimate'),Nq('maklumat tidak cukup','estimate')],'800 × 30 sekitar 24 000.','Tahun 6 · Kemunasabahan Operasi'),id,'1.2.1',mode,'verbal','reasoning',s,['estimate']);
};

GEN['1.3.1']=function(id,s){
 const mode=chooseMode(id,'1.3.1',bandModes(s,['classify','choose_prime'],['classify','choose_prime','factor_reason'],['factor_reason','claim','range']));
 if(mode==='classify'){const n=choose([29,31,37,49,51,57,61,77]),prime=[29,31,37,61].includes(n);return mark(q(n+' ialah?',prime?'nombor perdana':'nombor gubahan',[Nq(prime?'nombor gubahan':'nombor perdana','prime'),Nq('nombor genap','prime'),Nq('bukan nombor bulat','prime')],'Nombor perdana mempunyai tepat dua faktor.','Tahun 6 · Perdana dan Gubahan'),id,'1.3.1',mode,'symbolic','concept',s,['prime']);}
 if(mode==='choose_prime')return mark(q('Antara 39, 41, 51 dan 57, yang manakah perdana?',41,[Nq(39,'prime'),Nq(51,'prime'),Nq(57,'prime')],'Semak faktor.','Tahun 6 · Kenal Perdana'),id,'1.3.1',mode,'symbolic',stage(s)===3?'reasoning':'application',s,['prime']);
 if(mode==='factor_reason')return mark(q('Mengapa 77 nombor gubahan?','77 mempunyai faktor 7 dan 11',[Nq('kerana 77 ganjil','prime'),Nq('kerana semua dua digit gubahan','prime'),Nq('kerana 77 lebih 50','prime')],'Cari faktor selain 1 dan 77.','Tahun 6 · Sebab Nombor Gubahan'),id,'1.3.1',mode,'verbal','reasoning',s,['prime','factor']);
 if(mode==='claim')return mark(q('91 dikatakan perdana kerana ganjil. Penilaian?','salah kerana 91 = 7 × 13',[Nq('betul','prime'),Nq('betul kerana tiada digit genap','prime'),Nq('salah kerana semua ganjil gubahan','prime')],'Ganjil tidak semestinya perdana.','Tahun 6 · Menilai Dakwaan Perdana'),id,'1.3.1',mode,'verbal','reasoning',s,['prime','error_analysis']);
 return mark(q('Nombor perdana antara 50 dan 60 ialah?',53,[Nq(51,'prime'),Nq(55,'prime'),Nq(57,'prime')],'Uji faktor.','Tahun 6 · Perdana dalam Julat'),id,'1.3.1',mode,'verbal','reasoning',s,['prime','range']);
};

GEN['1.4.1']=function(id,s){
 const mode=chooseMode(id,'1.4.1',bandModes(s,['total','difference'],['total','difference','million_mix'],['million_mix','reverse','decision','claim']));
 if(mode==='total'){const a=choose([1250000,2400000]),b=choose([350000,480000]),ans=a+b;return mark(q('Sebuah bandar mempunyai '+a.toLocaleString()+' penduduk. '+b.toLocaleString()+' berpindah masuk. Jumlah baharu?',ans,[Nq(a-b,'operation'),Nq(a+b+100000,'operation'),Nq(b,'operation')],'Tambah.','Tahun 6 · Masalah Nombor'),id,'1.4.1',mode,'story','application',s,['operation']);}
 if(mode==='difference'){const a=choose([5200000,6800000]),b=choose([1750000,2450000]),ans=a-b;return mark(q('Sasaran '+a.toLocaleString()+' unit. '+b.toLocaleString()+' siap. Berapa lagi?',ans,[Nq(a+b,'operation'),Nq(b,'operation'),Nq(ans+100000,'operation')],'Sasaran − siap.','Tahun 6 · Masalah Baki'),id,'1.4.1',mode,'story','application',s,['operation']);}
 if(mode==='million_mix')return mark(q('2.4 juta penduduk, 0.35 juta berpindah keluar, 125 000 masuk. Jumlah baharu?',2175000,[Nq(1925000,'operation'),Nq(2525000,'operation'),Nq(2875000,'operation')],'Samakan unit dahulu.','Tahun 6 · Masalah Juta Pelbagai Bentuk'),id,'1.4.1',mode,'story','reasoning',s,['million','multi_step']);
 if(mode==='reverse')return mark(q('Selepas 450 000 unit ditambah, jumlah 3.2 juta. Jumlah asal?',2750000,[Nq(3650000,'operation'),Nq(2450000,'operation'),Nq(3200000,'operation')],'Gunakan operasi songsang.','Tahun 6 · Masalah Songsang'),id,'1.4.1',mode,'story','reasoning',s,['inverse']);
 if(mode==='decision')return mark(q('Kapasiti 2.1 juta. Anggaran permintaan 1.35 juta + 0.82 juta. Adakah kapasiti cukup?','tidak mencukupi',[Nq('mencukupi','estimate'),Nq('tepat-tepat cukup','estimate'),Nq('tidak boleh ditentukan','estimate')],'Jumlah 2.17 juta > 2.1 juta.','Tahun 6 · Keputusan Berdasarkan Anggaran'),id,'1.4.1',mode,'story','reasoning',s,['estimate','decision']);
 return mark(q('Murid berkata 3/4 juta + 0.2 juta kurang daripada 1 juta. Penilaian?','betul, jumlahnya 0.95 juta',[Nq('salah, 1.15 juta','million'),Nq('salah, 0.55 juta','million'),Nq('tidak boleh dibanding','million')],'0.75 + 0.2 = 0.95 juta.','Tahun 6 · Menilai Penyelesaian'),id,'1.4.1',mode,'verbal','reasoning',s,['million','error_analysis']);
};

document.documentElement?.setAttribute('data-y6-v2-unit1','3.61.0');
})();