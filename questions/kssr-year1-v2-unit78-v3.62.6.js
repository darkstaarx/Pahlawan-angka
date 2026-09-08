// Year 1 Curriculum Bank v2 — Units 7 & 8: Ruang dan Pengurusan Data
(function(){
'use strict';
const RT=window.PAY1V2Runtime;if(!RT)return;
const {GEN,Nq,q,mark,chooseMode,bandModes,rand,choose,solid,table,pictograph,tally,name}=RT;
const shape2d=(kind)=>typeof shapeSvg==='function'?shapeSvg(kind):`<div class="kssrDiagram">${kind}</div>`;

GEN['7.1.1']=function(id,s){
 const mode=chooseMode(id,'7.1.1',bandModes(s,['name_solid'],['name_solid','object_match'],['object_match','distinguish_solid']));
 const kinds=[['kubus','dadu'],['kuboid','kotak kasut'],['kon','kon trafik'],['piramid','piramid tapak segi empat sama'],['silinder','tin minuman'],['sfera','bola']],x=choose(kinds);
 if(mode==='name_solid')return mark(q(`${solid(x[0])}Nama bentuk tiga dimensi ini?`,x[0]==='piramid'?'piramid tapak segi empat sama':x[0],[Nq('kubus','shape'),Nq('kuboid','shape'),Nq('silinder','shape'),Nq('sfera','shape')].filter(o=>o.v!==(x[0]==='piramid'?'piramid tapak segi empat sama':x[0])).slice(0,3),'Perhatikan rupa keseluruhan bentuk 3D.','Tahun 1 · Bentuk 3D'),id,'7.1.1',mode,'visual','concept',s,['shape']);
 if(mode==='object_match')return mark(q(`Objek <b>${x[1]}</b> paling hampir dengan bentuk?`,x[0]==='piramid'?'piramid tapak segi empat sama':x[0],[Nq('kubus','shape'),Nq('silinder','shape'),Nq('sfera','shape'),Nq('kon','shape')].filter(o=>o.v!==(x[0]==='piramid'?'piramid tapak segi empat sama':x[0])).slice(0,3),'Padankan objek harian dengan bentuk 3D.','Tahun 1 · Bentuk dalam Kehidupan'),id,'7.1.1',mode,'story','application',s,['shape']);
 return mark(q('Antara bola, tin minuman dan dadu, objek manakah berbentuk sfera?','bola',[Nq('tin minuman','shape'),Nq('dadu','shape'),Nq('semuanya sfera','shape')],'Sfera bulat pada semua arah.','Tahun 1 · Bezakan Bentuk 3D'),id,'7.1.1',mode,'story','reasoning',s,['shape']);
};

GEN['7.1.2']=function(id,s){
 const mode=chooseMode(id,'7.1.2',bandModes(s,['surface'],['surface','vertex'],['vertex','edge','reason_property']));
 if(mode==='surface')return mark(q(`${solid('sfera')}Sfera mempunyai permukaan yang bagaimana?`,'permukaan melengkung',[Nq('hanya permukaan rata','shape_property'),Nq('tiada permukaan','shape_property'),Nq('semua permukaan segi tiga','shape_property')],'Sentuh atau bayangkan permukaan bola.','Tahun 1 · Permukaan 3D'),id,'7.1.2',mode,'visual','concept',s,['shape_property']);
 if(mode==='vertex')return mark(q(`${solid('kubus')}Berapakah bucu kubus?`,8,[Nq(4,'shape_property'),Nq(6,'shape_property'),Nq(12,'shape_property')],'Bucu ialah titik tempat sisi bertemu.','Tahun 1 · Bucu 3D'),id,'7.1.2',mode,'visual','application',s,['shape_property']);
 if(mode==='edge')return mark(q(`${solid('kubus')}Berapakah sisi/tepi pada kubus?`,12,[Nq(6,'shape_property'),Nq(8,'shape_property'),Nq(4,'shape_property')],'Kira garis tepi yang menghubungkan bucu.','Tahun 1 · Sisi 3D'),id,'7.1.2',mode,'visual','application',s,['shape_property']);
 return mark(q('Bentuk manakah tiada bucu dan boleh bergolek ke semua arah?','sfera',[Nq('kubus','shape_property'),Nq('kuboid','shape_property'),Nq('piramid tapak segi empat sama','shape_property')],'Gabungkan ciri bucu dan permukaan melengkung.','Tahun 1 · Penaakulan Ciri 3D'),id,'7.1.2',mode,'verbal','reasoning',s,['shape_property']);
};

GEN['7.1.3']=function(id,s){
 const mode=chooseMode(id,'7.1.3',bandModes(s,['repeat_two'],['repeat_two','repeat_three'],['repeat_three','missing_pattern']));
 if(mode==='repeat_two')return mark(q('Pola objek: <b>kubus, sfera, kubus, sfera, ___</b>. Bentuk seterusnya?','kubus',[Nq('sfera','shape_pattern'),Nq('kon','shape_pattern'),Nq('silinder','shape_pattern')],'Cari dua bentuk yang berulang.','Tahun 1 · Pola Bentuk 3D'),id,'7.1.3',mode,'verbal','concept',s,['shape_pattern']);
 if(mode==='repeat_three')return mark(q('Pola: <b>kubus, kon, silinder, kubus, kon, ___</b>. Bentuk seterusnya?','silinder',[Nq('kubus','shape_pattern'),Nq('kon','shape_pattern'),Nq('sfera','shape_pattern')],'Pola mengulang tiga bentuk.','Tahun 1 · Pola Tiga Bentuk'),id,'7.1.3',mode,'verbal','application',s,['shape_pattern']);
 return mark(q('Pola: kubus, sfera, kubus, ___, kubus. Bentuk yang hilang?','sfera',[Nq('kubus','shape_pattern'),Nq('kon','shape_pattern'),Nq('silinder','shape_pattern')],'Lihat pasangan bentuk yang berulang.','Tahun 1 · Bentuk Hilang'),id,'7.1.3',mode,'verbal','reasoning',s,['shape_pattern']);
};

GEN['7.1.4']=function(id,s){
 const mode=chooseMode(id,'7.1.4',bandModes(s,['combine_object'],['combine_object','choose_parts'],['choose_parts','reason_build']));
 if(mode==='combine_object')return mark(q('Sebuah model “ais krim” boleh dibina daripada gabungan bentuk mana?','kon + sfera',[Nq('kubus + kubus','shape_combine'),Nq('silinder + kuboid','shape_combine'),Nq('piramid + kubus','shape_combine')],'Fikir bentuk kon untuk bekas dan bentuk bulat untuk ais krim.','Tahun 1 · Gabung Bentuk 3D'),id,'7.1.4',mode,'story','application',s,['shape_combine']);
 if(mode==='choose_parts')return mark(q('Model robot mudah mempunyai kepala kubus dan badan kuboid. Gabungan bentuknya?','kubus + kuboid',[Nq('sfera + kon','shape_combine'),Nq('silinder + sfera','shape_combine'),Nq('kon + kon','shape_combine')],'Kenal bentuk setiap bahagian model.','Tahun 1 · Bina Model'),id,'7.1.4',mode,'story','application',s,['shape_combine']);
 return mark(q('Untuk menghasilkan model menara yang boleh berdiri rata, bentuk manakah lebih sesuai sebagai tapak: sfera atau kuboid?','kuboid',[Nq('sfera','shape_combine'),Nq('kedua-duanya sama sesuai','shape_combine'),Nq('tiada bentuk sesuai','shape_combine')],'Tapak rata lebih stabil untuk berdiri.','Tahun 1 · Penaakulan Gabungan 3D'),id,'7.1.4',mode,'verbal','reasoning',s,['shape_combine','shape_property']);
};

GEN['7.2.1']=function(id,s){
 const mode=chooseMode(id,'7.2.1',bandModes(s,['name_2d'],['name_2d','object_face'],['object_face','distinguish_2d']));
 const cases=[['triangle','segi tiga'],['square','segi empat sama'],['rectangle','segi empat tepat'],['circle','bulatan']],x=choose(cases);
 if(mode==='name_2d')return mark(q(`${shape2d(x[0])}Nama bentuk dua dimensi ini?`,x[1],[Nq('segi tiga','shape'),Nq('segi empat sama','shape'),Nq('segi empat tepat','shape'),Nq('bulatan','shape')].filter(o=>o.v!==x[1]).slice(0,3),'Perhatikan sisi atau lengkung bentuk.','Tahun 1 · Bentuk 2D'),id,'7.2.1',mode,'visual','concept',s,['shape']);
 if(mode==='object_face')return mark(q('Permukaan hadapan buku latihan biasanya berbentuk?','segi empat tepat',[Nq('bulatan','shape'),Nq('segi tiga','shape'),Nq('segi empat sama','shape')],'Padankan bentuk permukaan objek harian.','Tahun 1 · Bentuk pada Objek'),id,'7.2.1',mode,'story','application',s,['shape']);
 return mark(q('Antara pinggan bulat, papan tanda segi tiga dan buku segi empat tepat, yang mempunyai bentuk bulatan?','pinggan',[Nq('papan tanda','shape'),Nq('buku','shape'),Nq('semuanya bulatan','shape')],'Kenal bentuk 2D pada permukaan objek.','Tahun 1 · Bezakan Bentuk 2D'),id,'7.2.1',mode,'story','reasoning',s,['shape']);
};

GEN['7.2.2']=function(id,s){
 const mode=chooseMode(id,'7.2.2',bandModes(s,['count_sides'],['count_sides','count_vertices','curve'],['count_vertices','curve','reason_property']));
 if(mode==='count_sides')return mark(q(`${shape2d('triangle')}Berapakah sisi lurus segi tiga?`,3,[Nq(2,'shape_property'),Nq(4,'shape_property'),Nq(0,'shape_property')],'Kira garis lurus di sekeliling bentuk.','Tahun 1 · Sisi Bentuk 2D'),id,'7.2.2',mode,'visual','concept',s,['shape_property']);
 if(mode==='count_vertices')return mark(q(`${shape2d('square')}Berapakah bucu segi empat sama?`,4,[Nq(3,'shape_property'),Nq(2,'shape_property'),Nq(0,'shape_property')],'Bucu ialah tempat dua sisi bertemu.','Tahun 1 · Bucu Bentuk 2D'),id,'7.2.2',mode,'visual','application',s,['shape_property']);
 if(mode==='curve')return mark(q(`${shape2d('circle')}Bulatan mempunyai?`,'garis lengkung',[Nq('4 sisi lurus','shape_property'),Nq('3 bucu','shape_property'),Nq('2 sisi lurus','shape_property')],'Bulatan tiada sisi lurus atau bucu.','Tahun 1 · Garis Lengkung'),id,'7.2.2',mode,'visual','concept',s,['shape_property']);
 return mark(q('Bentuk mempunyai 4 sisi lurus dan 4 bucu. Yang mungkin ialah?','segi empat sama',[Nq('bulatan','shape_property'),Nq('segi tiga','shape_property'),Nq('sfera','shape_property')],'Gabungkan maklumat sisi dan bucu.','Tahun 1 · Penaakulan Ciri 2D'),id,'7.2.2',mode,'verbal','reasoning',s,['shape_property']);
};

GEN['7.2.3']=function(id,s){
 const mode=chooseMode(id,'7.2.3',bandModes(s,['pattern_two'],['pattern_two','pattern_three'],['pattern_three','missing_two']));
 if(mode==='pattern_two')return mark(q('Pola: <b>bulatan, segi tiga, bulatan, segi tiga, ___</b>. Bentuk seterusnya?','bulatan',[Nq('segi tiga','shape_pattern'),Nq('segi empat sama','shape_pattern'),Nq('segi empat tepat','shape_pattern')],'Cari pasangan bentuk yang berulang.','Tahun 1 · Pola Bentuk 2D'),id,'7.2.3',mode,'verbal','concept',s,['shape_pattern']);
 if(mode==='pattern_three')return mark(q('Pola: segi tiga, bulatan, segi empat sama, segi tiga, bulatan, ___','segi empat sama',[Nq('segi tiga','shape_pattern'),Nq('bulatan','shape_pattern'),Nq('segi empat tepat','shape_pattern')],'Tiga bentuk berulang dalam urutan yang sama.','Tahun 1 · Pola Tiga Bentuk 2D'),id,'7.2.3',mode,'verbal','application',s,['shape_pattern']);
 return mark(q('Pola: bulatan, ___, bulatan, segi tiga. Bentuk yang hilang?','segi tiga',[Nq('bulatan','shape_pattern'),Nq('segi empat sama','shape_pattern'),Nq('segi empat tepat','shape_pattern')],'Banding pasangan pertama dengan pasangan kedua.','Tahun 1 · Pola 2D Hilang'),id,'7.2.3',mode,'verbal','reasoning',s,['shape_pattern']);
};

GEN['7.2.4']=function(id,s){
 const mode=chooseMode(id,'7.2.4',bandModes(s,['choose_pattern'],['choose_pattern','extend_pattern'],['extend_pattern','reason_pattern']));
 if(mode==='choose_pattern')return mark(q('Corak jubin yang berulang setiap dua bentuk ialah?','segi empat sama, bulatan, segi empat sama, bulatan',[Nq('segi empat sama, bulatan, segi tiga, bulatan','shape_pattern'),Nq('bulatan, bulatan, segi tiga, segi empat sama','shape_pattern'),Nq('segi tiga, bulatan, segi empat sama, segi tiga','shape_pattern')],'Corak berulang perlu mengulangi unit yang sama.','Tahun 1 · Hasilkan Corak 2D'),id,'7.2.4',mode,'verbal','application',s,['shape_pattern']);
 if(mode==='extend_pattern')return mark(q('Corak hiasan: <b>segi tiga, bulatan, segi tiga, bulatan</b>. Dua bentuk seterusnya?','segi tiga, bulatan',[Nq('bulatan, segi tiga','shape_pattern'),Nq('segi empat sama, bulatan','shape_pattern'),Nq('bulatan, bulatan','shape_pattern')],'Ulang unit corak yang sama.','Tahun 1 · Sambung Corak'),id,'7.2.4',mode,'verbal','application',s,['shape_pattern']);
 return mark(q(`${name()} mahu corak yang mengulang “bulatan, segi empat sama”. Pilihan mana tidak mematuhi corak?`,'bulatan, segi empat sama, segi tiga',[Nq('bulatan, segi empat sama, bulatan','shape_pattern'),Nq('segi empat sama, bulatan, segi empat sama','shape_pattern'),Nq('bulatan, segi empat sama, bulatan, segi empat sama','shape_pattern')],'Cari bentuk yang memecahkan unit corak.','Tahun 1 · Semak Corak 2D'),id,'7.2.4',mode,'verbal','reasoning',s,['shape_pattern']);
};

GEN['7.3.1']=function(id,s){
 const mode=chooseMode(id,'7.3.1',bandModes(s,['daily_shape'],['daily_shape','property_problem'],['property_problem','combine_problem']));
 if(mode==='daily_shape')return mark(q('Kotak minuman berbentuk kuboid. Permukaan hadapannya biasanya bentuk 2D apa?','segi empat tepat',[Nq('bulatan','shape_problem'),Nq('segi tiga','shape_problem'),Nq('sfera','shape_problem')],'Hubungkan bentuk 3D dengan bentuk pada permukaannya.','Tahun 1 · Masalah Ruang Harian'),id,'7.3.1',mode,'story','application',s,['shape_problem']);
 if(mode==='property_problem')return mark(q('Aina perlukan objek yang boleh bergolek ke semua arah untuk permainan. Pilih bentuk sesuai.','sfera',[Nq('kubus','shape_problem'),Nq('kuboid','shape_problem'),Nq('piramid tapak segi empat sama','shape_problem')],'Sfera mempunyai permukaan melengkung ke semua arah.','Tahun 1 · Pilih Bentuk Sesuai'),id,'7.3.1',mode,'story','reasoning',s,['shape_problem','shape_property']);
 return mark(q('Untuk model ais krim, bahagian bawah perlu boleh dipegang dan bahagian atas bulat. Gabungan bentuk?','kon + sfera',[Nq('kubus + kuboid','shape_problem'),Nq('silinder + kubus','shape_problem'),Nq('sfera + sfera','shape_problem')],'Padankan fungsi model dengan ciri bentuk.','Tahun 1 · Masalah Gabungan Bentuk'),id,'7.3.1',mode,'story','reasoning',s,['shape_problem','shape_combine']);
};

GEN['8.1.1']=function(id,s){
 const mode=chooseMode(id,'8.1.1',bandModes(s,['count_tally'],['count_tally','classify'],['classify','complete_tally','reason_collect']));
 const labels=['Karipap','Pau','Kuih'],vals=[rand(2,8),rand(2,8),rand(2,8)];
 if(mode==='count_tally'){
  const i=rand(0,2);return mark(q(`${table(['Makanan','Gundalan'],labels.map((x,j)=>[x,tally(vals[j])]))}Berapakah ${labels[i]} direkod?`,vals[i],[Nq(Math.max(0,vals[i]-1),'data'),Nq(vals[i]+1,'data'),Nq(vals[(i+1)%3],'data')],'Kira tanda gundalan pada baris yang betul.','Tahun 1 · Kumpul Data Gundalan'),id,'8.1.1',mode,'table','concept',s,['data']);
 }
 if(mode==='classify')return mark(q('Data “rambutan, mangga, rambutan, pisang” boleh dikelaskan berdasarkan?','jenis buah',[Nq('warna kasut','data'),Nq('nama hari','data'),Nq('masa pada jam','data')],'Cari ciri yang sama bagi semua data yang dikumpul.','Tahun 1 · Mengelas Data'),id,'8.1.1',mode,'verbal','application',s,['data']);
 if(mode==='complete_tally'){
  const list=['Pau','Karipap','Pau','Kuih','Pau'],ans=3;return mark(q(`Jualan kantin: <b>${list.join(', ')}</b>. Berapa gundalan perlu untuk Pau?`,ans,[Nq(2,'data'),Nq(4,'data'),Nq(5,'data')],'Kira berapa kali Pau muncul.','Tahun 1 · Lengkap Data'),id,'8.1.1',mode,'story','reasoning',s,['data']);
 }
 return mark(q('Untuk mengetahui buah kegemaran kelas, data paling sesuai dikumpul ialah?','pilihan buah setiap murid',[Nq('tinggi meja guru','data'),Nq('waktu balik sekolah','data'),Nq('bilangan tingkap kelas','data')],'Data mesti menjawab soalan yang hendak diketahui.','Tahun 1 · Pilih Data Relevan'),id,'8.1.1',mode,'verbal','reasoning',s,['data','relevant_information']);
};

GEN['8.2.1']=function(id,s){
 const mode=chooseMode(id,'8.2.1',bandModes(s,['read_one'],['read_one','most'],['read_one','most','difference']));
 const labels=['Karipap','Pau','Kuih'],vals=[rand(2,6),rand(2,6),rand(2,6)];while(new Set(vals).size<3){vals[1]=rand(2,6);vals[2]=rand(2,6)}const vis=pictograph(labels,vals);
 if(mode==='read_one'){const i=rand(0,2);return mark(q(`${vis}Satu gambar mewakili satu item. Berapakah ${labels[i]}?`,vals[i],[Nq(vals[i]-1,'data'),Nq(vals[i]+1,'data'),Nq(vals[(i+1)%3],'data')],'Kira gambar pada baris yang ditanya.','Tahun 1 · Baca Piktograf'),id,'8.2.1',mode,'visual','concept',s,['data']);}
 if(mode==='most'){const mx=Math.max(...vals),ans=labels[vals.indexOf(mx)];return mark(q(`${vis}Yang manakah paling banyak?`,ans,labels.filter(x=>x!==ans).map(x=>Nq(x,'data')).concat([Nq('Sama banyak','data')]).slice(0,3),'Cari baris dengan gambar paling banyak.','Tahun 1 · Tafsir Piktograf'),id,'8.2.1',mode,'visual','application',s,['data']);}
 const hi=vals.indexOf(Math.max(...vals)),lo=vals.indexOf(Math.min(...vals)),ans=vals[hi]-vals[lo];return mark(q(`${vis}Berapa lebih ${labels[hi]} berbanding ${labels[lo]}?`,ans,[Nq(vals[hi],'data'),Nq(vals[lo],'data'),Nq(ans+1,'data')],'Baca dua nilai, kemudian cari beza.','Tahun 1 · Beza Piktograf'),id,'8.2.1',mode,'visual','reasoning',s,['data','operation']);
};

GEN['8.3.1']=function(id,s){
 const mode=chooseMode(id,'8.3.1',bandModes(s,['one_question'],['one_question','total_two'],['total_two','missing_data','reason_data']));
 const labels=['Rambutan','Pisang','Jambu'],vals=[rand(2,7),rand(2,7),rand(2,7)];while(new Set(vals).size<3){vals[1]=rand(2,7);vals[2]=rand(2,7)}const vis=pictograph(labels,vals);
 if(mode==='one_question'){const mx=Math.max(...vals),ans=labels[vals.indexOf(mx)];return mark(q(`${vis}Buah manakah paling banyak dipilih murid?`,ans,labels.filter(x=>x!==ans).map(x=>Nq(x,'data')).concat([Nq('Sama banyak','data')]).slice(0,3),'Gunakan maklumat piktograf untuk menjawab situasi.','Tahun 1 · Masalah Data Harian'),id,'8.3.1',mode,'visual','application',s,['data']);}
 if(mode==='total_two'){const i=0,j=1,ans=vals[i]+vals[j];return mark(q(`${vis}Jumlah ${labels[i]} dan ${labels[j]}?`,ans,[Nq(Math.abs(vals[i]-vals[j]),'data'),Nq(vals[i],'data'),Nq(ans+1,'operation')],'Tambah dua kategori yang ditanya.','Tahun 1 · Jumlah Data'),id,'8.3.1',mode,'visual','reasoning',s,['data','operation']);}
 if(mode==='missing_data'){
  const total=9,known=rand(3,6),ans=total-known;return mark(q(`Jumlah murid memilih karipap dan pau ialah <b>${total}</b>. Jika ${known} memilih karipap, berapa memilih pau?`,ans,[Nq(total,'data'),Nq(known,'data'),Nq(ans+1,'operation')],'Cari bahagian yang hilang daripada jumlah.','Tahun 1 · Data Hilang'),id,'8.3.1',mode,'story','reasoning',s,['data','operation']);
 }
 return mark(q('Piktograf menunjukkan 6 karipap dan 3 pau. Seorang murid kata pau lebih banyak. Penilaian?','salah',[Nq('betul','data'),Nq('sama banyak','data'),Nq('tidak boleh ditentukan','data')],'Banding bilangan gambar bagi kedua-dua kategori.','Tahun 1 · Semak Tafsiran Data'),id,'8.3.1',mode,'verbal','reasoning',s,['data','compare']);
};

document.documentElement?.setAttribute('data-y1-v2-unit78','3.62.6');
})();