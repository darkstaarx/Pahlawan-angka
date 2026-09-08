// Year 1 Curriculum Bank v2 — Units 5 & 6: Masa dan Waktu, Ukuran dan Sukatan
(function(){
'use strict';
const RT=window.PAY1V2Runtime;if(!RT)return;
const {GEN,Nq,q,mark,chooseMode,bandModes,rand,choose,clock,nonStandard,table,name}=RT;
const days=['Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu','Ahad'];
const months=['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'];

GEN['5.1.1']=function(id,s){
 const mode=chooseMode(id,'5.1.1',bandModes(s,['daily_time'],['daily_time','light_time'],['daily_time','light_time','reason_time']));
 if(mode==='daily_time'){
  const x=choose([['sarapan sebelum sekolah','pagi'],['makan tengah hari','tengah hari'],['bermain selepas sekolah','petang'],['tidur','malam']]);
  return mark(q(`Aktiviti <b>${x[0]}</b> biasanya berlaku pada waktu?`,x[1],[Nq('pagi','time'),Nq('tengah hari','time'),Nq('petang','time'),Nq('malam','time')].filter(o=>o.v!==x[1]).slice(0,3),'Hubungkan aktiviti dengan waktu dalam sehari.','Tahun 1 · Waktu Sehari'),id,'5.1.1',mode,'story','concept',s,['time']);
 }
 if(mode==='light_time'){
  return mark(q('Matahari baru terbit dan murid bersiap ke sekolah. Waktu yang paling sesuai?','pagi',[Nq('malam','time'),Nq('tengah malam','time'),Nq('petang','time')],'Gunakan petunjuk keadaan sekeliling.','Tahun 1 · Kenal Waktu'),id,'5.1.1',mode,'story','application',s,['time']);
 }
 return mark(q(`${name()} berkata “sarapan biasanya selepas tidur malam dan sebelum ke sekolah”. Waktu yang dimaksudkan?`,'pagi',[Nq('petang','time'),Nq('malam','time'),Nq('tengah hari','time')],'Susun peristiwa harian untuk mengenal waktu.','Tahun 1 · Penaakulan Waktu'),id,'5.1.1',mode,'verbal','reasoning',s,['time']);
};

GEN['5.1.2']=function(id,s){
 const mode=chooseMode(id,'5.1.2',bandModes(s,['order_two'],['order_two','order_three'],['order_three','missing_event']));
 if(mode==='order_two')return mark(q('Yang berlaku dahulu pada hari persekolahan?','sarapan sebelum ke sekolah',[Nq('tidur malam','time_order'),Nq('makan malam','time_order'),Nq('pulang dari sekolah','time_order')],'Fikir urutan satu hari dari pagi ke malam.','Tahun 1 · Urutan Harian'),id,'5.1.2',mode,'verbal','concept',s,['time_order']);
 if(mode==='order_three')return mark(q('Susunan yang betul ialah?','bangun → sarapan → pergi sekolah',[Nq('pergi sekolah → bangun → sarapan','time_order'),Nq('sarapan → tidur → bangun','time_order'),Nq('pergi sekolah → sarapan → bangun','time_order')],'Letakkan peristiwa mengikut masa sebenar.','Tahun 1 · Susun Peristiwa'),id,'5.1.2',mode,'verbal','application',s,['time_order']);
 return mark(q('Urutan: bangun pagi → ___ → masuk kelas. Peristiwa paling munasabah di tempat kosong?','bersarapan dan pergi ke sekolah',[Nq('tidur malam','time_order'),Nq('makan malam','time_order'),Nq('balik dari sekolah','time_order')],'Cari peristiwa yang logik di antara dua kejadian.','Tahun 1 · Peristiwa Hilang'),id,'5.1.2',mode,'story','reasoning',s,['time_order']);
};

GEN['5.1.3']=function(id,s){
 const mode=chooseMode(id,'5.1.3',bandModes(s,['name_day'],['name_day','next_day'],['next_day','yesterday_day','day_reason']));
 const i=rand(0,6),d=days[i];
 if(mode==='name_day')return mark(q(`Hari ini ialah <b>${d}</b>. Nama hari itu ialah?`,d,days.filter(x=>x!==d).slice(0,3).map(x=>Nq(x,'day')),'Kenal nama hari dalam seminggu.','Tahun 1 · Hari Seminggu'),id,'5.1.3',mode,'verbal','concept',s,['day']);
 if(mode==='next_day'){const ans=days[(i+1)%7];return mark(q(`Hari selepas <b>${d}</b> ialah?`,ans,[Nq(days[(i+6)%7],'day'),Nq(days[(i+2)%7],'day'),Nq(d,'day')],'Bergerak satu hari ke hadapan.','Tahun 1 · Esok'),id,'5.1.3',mode,'verbal','application',s,['day']);}
 if(mode==='yesterday_day'){const ans=days[(i+6)%7];return mark(q(`Jika hari ini <b>${d}</b>, semalam ialah?`,ans,[Nq(days[(i+1)%7],'day'),Nq(days[(i+5)%7],'day'),Nq(d,'day')],'Semalam ialah satu hari sebelum hari ini.','Tahun 1 · Semalam'),id,'5.1.3',mode,'verbal','reasoning',s,['day']);}
 const ans=days[(i+2)%7];return mark(q(`Jika hari ini ${d}, dua hari lagi ialah?`,ans,[Nq(days[(i+1)%7],'day'),Nq(days[(i+3)%7],'day'),Nq(days[(i+6)%7],'day')],'Gerak dua langkah dalam urutan hari.','Tahun 1 · Dua Hari Lagi'),id,'5.1.3',mode,'verbal','reasoning',s,['day']);
};

GEN['5.1.4']=function(id,s){
 const mode=chooseMode(id,'5.1.4',bandModes(s,['name_month'],['name_month','next_month'],['next_month','before_month','month_reason']));
 const i=rand(0,11),m=months[i];
 if(mode==='name_month')return mark(q(`Bulan <b>${m}</b> ialah salah satu bulan dalam setahun. Pilih nama yang sama.`,m,months.filter(x=>x!==m).slice(0,3).map(x=>Nq(x,'month')),'Kenal nama bulan.','Tahun 1 · Bulan Setahun'),id,'5.1.4',mode,'verbal','concept',s,['month']);
 if(mode==='next_month'){const ans=months[(i+1)%12];return mark(q(`Bulan selepas <b>${m}</b> ialah?`,ans,[Nq(months[(i+11)%12],'month'),Nq(months[(i+2)%12],'month'),Nq(m,'month')],'Bergerak satu bulan ke hadapan.','Tahun 1 · Bulan Seterusnya'),id,'5.1.4',mode,'verbal','application',s,['month']);}
 if(mode==='before_month'){const ans=months[(i+11)%12];return mark(q(`Bulan sebelum <b>${m}</b> ialah?`,ans,[Nq(months[(i+1)%12],'month'),Nq(months[(i+10)%12],'month'),Nq(m,'month')],'Bergerak satu bulan ke belakang.','Tahun 1 · Bulan Sebelum'),id,'5.1.4',mode,'verbal','reasoning',s,['month']);}
 const ans=months[(i+2)%12];return mark(q(`Dua bulan selepas <b>${m}</b> ialah?`,ans,[Nq(months[(i+1)%12],'month'),Nq(months[(i+3)%12],'month'),Nq(months[(i+11)%12],'month')],'Bergerak dua langkah dalam urutan bulan.','Tahun 1 · Dua Bulan Lagi'),id,'5.1.4',mode,'verbal','reasoning',s,['month']);
};

GEN['5.2.1']=function(id,s){
 const mode=chooseMode(id,'5.2.1',bandModes(s,['hand_name'],['hand_name','hand_function'],['hand_function','hand_reason']));
 if(mode==='hand_name')return mark(q(`${clock(3,0)}Jarum yang pendek pada muka jam dipanggil?`,'jarum jam',[Nq('jarum minit','clock_hand'),Nq('jarum saat','clock_hand'),Nq('garis nombor','clock_hand')],'Jarum pendek menunjukkan jam.','Tahun 1 · Jarum Jam'),id,'5.2.1',mode,'visual','concept',s,['clock_hand']);
 if(mode==='hand_function')return mark(q(`${clock(6,30)}Jarum panjang membantu menunjukkan?`,'minit',[Nq('bulan','clock_hand'),Nq('hari','clock_hand'),Nq('tahun','clock_hand')],'Jarum panjang menunjukkan bahagian minit pada muka jam.','Tahun 1 · Fungsi Jarum'),id,'5.2.1',mode,'visual','application',s,['clock_hand']);
 return mark(q('Pada pukul tepat, jarum panjang menunjuk 12. Jarum pendek menunjukkan apa?','nombor jam semasa',[Nq('nombor bulan','clock_hand'),Nq('bilangan hari','clock_hand'),Nq('sentiasa nombor 6','clock_hand')],'Jarum pendek berubah mengikut jam semasa.','Tahun 1 · Penaakulan Muka Jam'),id,'5.2.1',mode,'verbal','reasoning',s,['clock_hand']);
};

GEN['5.2.2']=function(id,s){
 const mode=chooseMode(id,'5.2.2',bandModes(s,['half'],['half','quarter'],['quarter','three_quarter','compare_fraction']));
 const map={half:[30,'setengah'],quarter:[15,'satu perempat'],three_quarter:[45,'tiga perempat']},x=map[mode]||map.quarter;
 if(mode==='compare_fraction')return mark(q('Pada muka jam, jarum minit bergerak dari 12 ke 6. Bahagian pusingan itu ialah?','setengah',[Nq('satu perempat','clock_fraction'),Nq('tiga perempat','clock_fraction'),Nq('satu pusingan penuh','clock_fraction')],'12 ke 6 meliputi separuh muka jam.','Tahun 1 · Pecahan Muka Jam'),id,'5.2.2',mode,'verbal','reasoning',s,['clock_fraction']);
 return mark(q(`${clock(2,x[0])}Kedudukan jarum minit mewakili?`,x[1],[Nq('setengah','clock_fraction'),Nq('satu perempat','clock_fraction'),Nq('tiga perempat','clock_fraction')].filter(o=>o.v!==x[1]).concat([Nq('satu penuh','clock_fraction')]).slice(0,3),'Banding kedudukan jarum minit dengan satu pusingan penuh.','Tahun 1 · Pecahan Jam'),id,'5.2.2',mode,'visual',mode==='three_quarter'?'application':'concept',s,['clock_fraction']);
};

GEN['5.2.3']=function(id,s){
 const mode=chooseMode(id,'5.2.3',bandModes(s,['hour'],['hour','half_hour'],['hour','half_hour','quarter_hour']));
 const h=rand(1,11),m=mode==='half_hour'?30:mode==='quarter_hour'?15:0,ans=`${h}:${String(m).padStart(2,'0')}`;
 return mark(q(`${clock(h,m)}Waktu yang ditunjukkan?`,ans,[Nq(`${h}:00`,'time'),Nq(`${h}:30`,'time'),Nq(`${h}:15`,'time'),Nq(`${h+1}:${String(m).padStart(2,'0')}`,'time')].filter(o=>o.v!==ans).slice(0,3),'Baca jarum pendek untuk jam dan jarum panjang untuk bahagian jam.','Tahun 1 · Baca Waktu Analog'),id,'5.2.3',mode,'visual',mode==='hour'?'concept':'application',s,['time']);
};

GEN['5.3.1']=function(id,s){
 const mode=chooseMode(id,'5.3.1',bandModes(s,['daily_problem'],['daily_problem','half_hour_later'],['half_hour_later','quarter_hour_later','order_clock']));
 if(mode==='daily_problem')return mark(q('Perhimpunan sekolah berlaku sebelum waktu rehat. Yang berlaku dahulu?','perhimpunan',[Nq('waktu rehat','time_problem'),Nq('balik sekolah','time_problem'),Nq('makan malam','time_problem')],'Gunakan urutan aktiviti harian.','Tahun 1 · Masalah Masa Harian'),id,'5.3.1',mode,'story','application',s,['time_problem']);
 if(mode==='half_hour_later'){
  const h=rand(7,10),ans=`${h}:30`;return mark(q(`Aktiviti bermula pukul <b>${h}:00</b> dan berlangsung setengah jam. Bilakah tamat?`,ans,[Nq(`${h}:15`,'time'),Nq(`${h+1}:00`,'time'),Nq(`${h+1}:30`,'time')],'Setengah jam selepas pukul tepat ialah :30.','Tahun 1 · Setengah Jam Kemudian'),id,'5.3.1',mode,'story','reasoning',s,['time']);
 }
 if(mode==='quarter_hour_later'){
  const h=rand(7,10),ans=`${h}:15`;return mark(q(`Membaca bermula pukul <b>${h}:00</b> selama satu perempat jam. Waktu tamat?`,ans,[Nq(`${h}:30`,'time'),Nq(`${h+1}:00`,'time'),Nq(`${h}:45`,'time')],'Satu perempat jam pada muka jam ialah 15 minit.','Tahun 1 · Suku Jam Kemudian'),id,'5.3.1',mode,'story','reasoning',s,['time']);
 }
 return mark(q('Aktiviti A pada 8:00, B pada 8:30 dan C pada 9:00. Susunan betul?','A → B → C',[Nq('B → A → C','time'),Nq('C → B → A','time'),Nq('A → C → B','time')],'Susun waktu daripada paling awal ke paling lewat.','Tahun 1 · Susun Waktu'),id,'5.3.1',mode,'verbal','reasoning',s,['time']);
};

GEN['6.1.1']=function(id,s){
 const mode=chooseMode(id,'6.1.1',bandModes(s,['vocab_length'],['vocab_length','vocab_mass','vocab_capacity'],['vocab_mass','vocab_capacity','reason_vocab']));
 if(mode==='vocab_length')return mark(q('Untuk membanding panjang dua reben, perkataan yang sesuai?','lebih panjang / lebih pendek',[Nq('lebih berat / lebih ringan','measure_vocab'),Nq('lebih banyak / lebih sedikit','measure_vocab'),Nq('lebih awal / lebih lewat','measure_vocab')],'Gunakan perbendaharaan kata mengikut jenis ukuran.','Tahun 1 · Bahasa Panjang'),id,'6.1.1',mode,'verbal','concept',s,['measure_vocab']);
 if(mode==='vocab_mass')return mark(q('Untuk membanding jisim tembikai dan rambutan, perkataan yang sesuai?','lebih berat / lebih ringan',[Nq('lebih panjang / lebih pendek','measure_vocab'),Nq('lebih penuh / lebih kosong','measure_vocab'),Nq('lebih awal / lebih lewat','measure_vocab')],'Jisim dibanding dengan berat atau ringan.','Tahun 1 · Bahasa Jisim'),id,'6.1.1',mode,'verbal','concept',s,['measure_vocab']);
 if(mode==='vocab_capacity')return mark(q('Untuk membanding air dalam baldi dan cawan, perkataan yang sesuai?','lebih banyak / lebih sedikit',[Nq('lebih berat / lebih ringan','measure_vocab'),Nq('lebih panjang / lebih pendek','measure_vocab'),Nq('lebih awal / lebih lewat','measure_vocab')],'Isi padu cecair membanding berapa banyak cecair.','Tahun 1 · Bahasa Isi Padu'),id,'6.1.1',mode,'verbal','concept',s,['measure_vocab']);
 return mark(q(`${name()} berkata “pensel lebih berat daripada meja” ialah ayat tentang <b>panjang</b>. Betul atau salah?`,'salah',[Nq('betul','measure_vocab'),Nq('tidak pasti','measure_vocab'),Nq('semua ukuran sama','measure_vocab')],'Perkataan “berat” berkaitan jisim, bukan panjang.','Tahun 1 · Semak Bahasa Ukuran'),id,'6.1.1',mode,'verbal','reasoning',s,['measure_vocab']);
};

GEN['6.1.2']=function(id,s){
 const mode=chooseMode(id,'6.1.2',bandModes(s,['length_units'],['length_units','mass_units','capacity_units'],['length_units','mass_units','capacity_units','choose_unit']));
 if(mode==='length_units'){
  const count=rand(4,9);return mark(q(`${nonStandard(count,'klip')}Panjang buku diukur menggunakan klip kertas. Berapa unit klip?`,count,[Nq(count-1,'nonstandard'),Nq(count+1,'nonstandard'),Nq(count+2,'nonstandard')],'Kira bilangan unit bukan piawai dari hujung ke hujung.','Tahun 1 · Ukur dengan Unit Bukan Piawai'),id,'6.1.2',mode,'visual','procedure',s,['nonstandard']);
 }
 if(mode==='mass_units'){
  const count=rand(3,7);return mark(q(`Satu beg kecil seimbang dengan <b>${count}</b> blok unit pada neraca. Jisim relatif beg ialah berapa blok?`,count,[Nq(count-1,'nonstandard'),Nq(count+1,'nonstandard'),Nq(count+2,'nonstandard')],'Bilangan blok pada keseimbangan menjadi unit jisim bukan piawai.','Tahun 1 · Jisim Unit Bukan Piawai'),id,'6.1.2',mode,'story','procedure',s,['nonstandard']);
 }
 if(mode==='capacity_units'){
  const count=rand(3,8);return mark(q(`Sebuah jag penuh selepas dituangkan <b>${count}</b> cawan air yang sama saiz. Kapasiti jag ialah berapa unit cawan?`,count,[Nq(count-1,'nonstandard'),Nq(count+1,'nonstandard'),Nq(count+2,'nonstandard')],'Kira bilangan cawan yang diperlukan untuk memenuhi jag.','Tahun 1 · Sukat dengan Cawan'),id,'6.1.2',mode,'story','application',s,['nonstandard']);
 }
 return mark(q('Untuk mengukur panjang meja tanpa pembaris, unit bukan piawai yang sesuai?','jengkal',[Nq('kilogram','unit'),Nq('liter','unit'),Nq('ringgit','unit')],'Jengkal ialah unit bukan piawai untuk panjang.','Tahun 1 · Pilih Unit Bukan Piawai'),id,'6.1.2',mode,'verbal','reasoning',s,['nonstandard']);
};

GEN['6.1.3']=function(id,s){
 const mode=chooseMode(id,'6.1.3',bandModes(s,['compare_length'],['compare_length','compare_mass','compare_capacity'],['compare_mass','compare_capacity','three_compare']));
 if(mode==='compare_length'){
  const a=rand(5,9),b=rand(3,8);if(a===b)return GEN['6.1.3'](id,s);const ans=a>b?'Meja A':'Meja B';
  return mark(q(`Meja A panjangnya ${a} jengkal, Meja B ${b} jengkal. Yang lebih panjang?`,ans,[Nq(ans==='Meja A'?'Meja B':'Meja A','compare_measure'),Nq('Sama panjang','compare_measure'),Nq('Tidak boleh dibanding','compare_measure')],'Unit sama: banding bilangan unit.','Tahun 1 · Banding Panjang Relatif'),id,'6.1.3',mode,'story','application',s,['compare_measure']);
 }
 if(mode==='compare_mass'){
  const a=rand(3,8),b=rand(3,8);if(a===b)return GEN['6.1.3'](id,s);const ans=a>b?'Beg A':'Beg B';
  return mark(q(`Beg A seimbang dengan ${a} blok dan Beg B dengan ${b} blok. Yang lebih berat?`,ans,[Nq(ans==='Beg A'?'Beg B':'Beg A','compare_measure'),Nq('Sama berat','compare_measure'),Nq('Tidak boleh dibanding','compare_measure')],'Lebih banyak blok pada neraca bermaksud lebih berat.','Tahun 1 · Banding Jisim Relatif'),id,'6.1.3',mode,'story','application',s,['compare_measure']);
 }
 if(mode==='compare_capacity'){
  const a=rand(3,8),b=rand(3,8);if(a===b)return GEN['6.1.3'](id,s);const ans=a>b?'Bekas A':'Bekas B';
  return mark(q(`Bekas A memuatkan ${a} cawan air, Bekas B ${b} cawan. Yang kapasiti lebih besar?`,ans,[Nq(ans==='Bekas A'?'Bekas B':'Bekas A','compare_measure'),Nq('Sama banyak','compare_measure'),Nq('Tidak boleh dibanding','compare_measure')],'Unit cawan sama: banding bilangannya.','Tahun 1 · Banding Isi Padu Relatif'),id,'6.1.3',mode,'story','application',s,['compare_measure']);
 }
 const vals=[rand(3,9),rand(3,9),rand(3,9)];while(new Set(vals).size<3){vals[1]=rand(3,9);vals[2]=rand(3,9)}const mx=Math.max(...vals),ans=['A','B','C'][vals.indexOf(mx)];
 return mark(q(`${table(['Bekas','Unit cawan'],[['A',vals[0]],['B',vals[1]],['C',vals[2]]])}Bekas mana mempunyai kapasiti paling besar?`,ans,[Nq(ans==='A'?'B':'A','compare_measure'),Nq(ans==='C'?'B':'C','compare_measure'),Nq('Sama semua','compare_measure')],'Banding tiga bilangan unit yang sama.','Tahun 1 · Banding Tiga Ukuran'),id,'6.1.3',mode,'table','reasoning',s,['compare_measure']);
};

GEN['6.2.1']=function(id,s){
 const mode=chooseMode(id,'6.2.1',bandModes(s,['one_step'],['one_step','difference'],['difference','missing_measure','reason_measure']));
 if(mode==='one_step'){
  const a=rand(4,8),b=rand(2,5),ans=a+b;
  return mark(q(`Satu rak panjangnya ${a} unit klip. Rak kedua ${b} unit klip lebih panjang. Panjang rak kedua dalam unit klip?`,ans,[Nq(Math.abs(a-b),'measure_problem'),Nq(a,'measure_problem'),Nq(ans+1,'measure_problem')],'“Lebih panjang” sebanyak b unit bermaksud tambah.','Tahun 1 · Masalah Ukuran Relatif'),id,'6.2.1',mode,'story','application',s,['measure_problem']);
 }
 if(mode==='difference'){
  const a=rand(6,10),b=rand(2,a-1),ans=a-b;
  return mark(q(`Botol A memenuhi jag dengan ${a} cawan kecil, Botol B dengan ${b}. Berapa unit cawan beza kapasiti?`,ans,[Nq(a+b,'measure_problem'),Nq(a,'measure_problem'),Nq(b,'measure_problem')],'Cari beza dengan menolak nilai kecil daripada nilai besar.','Tahun 1 · Beza Sukatan'),id,'6.2.1',mode,'story','reasoning',s,['measure_problem']);
 }
 if(mode==='missing_measure'){
  const total=rand(7,12),known=rand(2,total-2),ans=total-known;
  return mark(q(`Dua bahagian meja berjumlah ${total} unit klip. Bahagian pertama ${known} unit. Bahagian kedua?`,ans,[Nq(total,'measure_problem'),Nq(known,'measure_problem'),Nq(ans+1,'measure_problem')],'Cari bahagian yang hilang daripada jumlah.','Tahun 1 · Ukuran Hilang'),id,'6.2.1',mode,'story','reasoning',s,['measure_problem']);
 }
 return mark(q('Meja A = 6 jengkal dan Meja B = 8 jengkal. Seorang murid kata A lebih panjang. Penilaian?','salah',[Nq('betul','compare_measure'),Nq('sama panjang','compare_measure'),Nq('tidak boleh dibanding','compare_measure')],'Kedua-duanya menggunakan unit jengkal yang sama; 8 lebih besar daripada 6.','Tahun 1 · Semak Ukuran'),id,'6.2.1',mode,'story','reasoning',s,['compare_measure']);
};

document.documentElement?.setAttribute('data-y1-v2-unit56','3.62.6');
})();