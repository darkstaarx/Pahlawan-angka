// Year 6 Curriculum Bank v2 — Unit 4 & 5: Masa/Waktu, Ukuran/Sukatan
(function(){
'use strict';
const RT=window.PAY6V2Runtime;if(!RT)return;
const {GEN,Nq,choose,q,mark,chooseMode,bandModes,stage,fmtTime,cities,table,tidy}=RT;

function utcLabel(mins){const sign=mins>=0?'+':'−',a=Math.abs(mins),h=Math.floor(a/60),m=a%60;return 'UTC'+sign+h+(m?':'+String(m).padStart(2,'0'):'')}
function durationLabel(mins){const a=Math.abs(mins),h=Math.floor(a/60),m=a%60;return (h?h+' jam':'')+(h&&m?' ':'')+(m?m+' minit':'')||'0 minit'}
function cityPair(){const a=choose(cities),b=choose(cities.filter(x=>x.name!==a.name));return [a,b]}

GEN['4.1.1']=function(id,s){
 const mode=chooseMode(id,'4.1.1',bandModes(s,['identify_ahead','read_offset','same_zone'],['identify_ahead','read_offset','same_zone','compare_offsets'],['compare_offsets','timezone_claim','offset_difference']));
 const [a,b]=cityPair();
 if(mode==='identify_ahead'){
  const ans=a.offset>b.offset?a.name:b.name;
  return mark(q(a.name+' ialah '+utcLabel(a.offset)+' dan '+b.name+' ialah '+utcLabel(b.offset)+'. Bandar mana lebih awal waktunya?',ans,[Nq(ans===a.name?b.name:a.name,'timezone'),Nq('kedua-duanya sama','timezone'),Nq('tidak boleh ditentukan','timezone')],'Bandar dengan offset UTC lebih besar berada lebih awal.','Tahun 6 · Mengenal Zon Masa'),id,'4.1.1',mode,'verbal','concept',s,['timezone']);
 }
 if(mode==='read_offset'){
  const c=choose(cities);
  return mark(q('Jika '+c.name+' berada pada <b>'+utcLabel(c.offset)+'</b>, apakah maksudnya?','waktunya berbeza '+durationLabel(c.offset)+' daripada UTC mengikut arah tanda',[Nq('semua bandar mempunyai waktu sama','timezone'),Nq('UTC ialah nama bandar tersebut','timezone'),Nq('offset hanya menunjukkan jarak geografi','timezone')],'Offset UTC menerangkan beza waktu daripada UTC.','Tahun 6 · Membaca Zon Masa'),id,'4.1.1',mode,'verbal','concept',s,['timezone']);
 }
 if(mode==='same_zone')return mark(q('Dua bandar masing-masing berada pada UTC+8. Apabila bandar pertama menunjukkan 10:30, bandar kedua menunjukkan?','10:30',[Nq('09:30','timezone'),Nq('11:30','timezone'),Nq('18:30','timezone')],'Offset yang sama bermaksud waktu serentak sama.','Tahun 6 · Zon Masa Sama'),id,'4.1.1',mode,'verbal',stage(s)===3?'reasoning':'application',s,['timezone']);
 if(mode==='compare_offsets'){
  const ans=Math.abs(a.offset-b.offset);
  return mark(q(a.name+' '+utcLabel(a.offset)+' dan '+b.name+' '+utcLabel(b.offset)+'. Beza offset ialah?',durationLabel(ans),[Nq(durationLabel(ans+60),'timezone'),Nq(durationLabel(Math.max(0,ans-60)),'timezone'),Nq(durationLabel(Math.abs(a.offset+b.offset)),'timezone')],'Cari beza mutlak dua offset UTC.','Tahun 6 · Banding Zon Masa'),id,'4.1.1',mode,'table',stage(s)===3?'reasoning':'application',s,['timezone','compare']);
 }
 if(mode==='timezone_claim')return mark(q('Murid berkata UTC+9:30 sentiasa 30 minit di hadapan UTC+9. Penilaian?','betul',[Nq('salah, beza 9 jam 30 minit','timezone'),Nq('salah, kedua-duanya sama','timezone'),Nq('tidak boleh dibanding','timezone')],'Banding offset: +9:30 − +9:00 = 30 minit.','Tahun 6 · Menilai Zon Masa'),id,'4.1.1',mode,'verbal','reasoning',s,['timezone','error_analysis']);
 return mark(q('UTC+5:30 dan UTC+9:30 berbeza berapa jam?', '4 jam',[Nq('5 jam','timezone'),Nq('14 jam','timezone'),Nq('4 jam 30 minit','timezone')],'9 jam 30 minit − 5 jam 30 minit = 4 jam.','Tahun 6 · Beza Zon Separuh Jam'),id,'4.1.1',mode,'verbal','reasoning',s,['timezone','half_hour']);
};

GEN['4.1.2']=function(id,s){
 const mode=chooseMode(id,'4.1.2',bandModes(s,['convert_simple','difference'],['convert_simple','difference','half_hour','next_day','previous_day'],['half_hour','next_day','previous_day','reverse_time','time_claim']));
 if(mode==='convert_simple'){
  const a=choose(cities.filter(x=>x.offset%60===0)),b=choose(cities.filter(x=>x.name!==a.name&&x.offset%60===0)),start=choose([480,600,840,1080]),target=start+(b.offset-a.offset);
  return mark(q('Apabila '+a.name+' ('+utcLabel(a.offset)+') menunjukkan '+fmtTime(start)+', waktu di '+b.name+' ('+utcLabel(b.offset)+') ialah?',fmtTime(target),[Nq(fmtTime(target+60),'time'),Nq(fmtTime(target-60),'time'),Nq(fmtTime(start),'time')],'Tambah beza offset destinasi − asal.','Tahun 6 · Menentukan Waktu Zon Masa'),id,'4.1.2',mode,'story',stage(s)===1?'procedure':'application',s,['timezone']);
 }
 if(mode==='difference'){
  const a=choose(cities),b=choose(cities.filter(x=>x.name!==a.name)),d=Math.abs(a.offset-b.offset),ans=durationLabel(d);
  return mark(q('Berapakah beza waktu antara '+a.name+' ('+utcLabel(a.offset)+') dan '+b.name+' ('+utcLabel(b.offset)+')?',ans,[Nq((Math.floor(d/60)+1)+' jam','time'),Nq(Math.max(0,Math.floor(d/60)-1)+' jam','time'),Nq((d/60)+' minit','time')],'Cari beza mutlak offset UTC.','Tahun 6 · Perbezaan Waktu'),id,'4.1.2',mode,'verbal',stage(s)===1?'procedure':'application',s,['timezone','difference']);
 }
 if(mode==='half_hour')return mark(q('Kuala Lumpur UTC+8 menunjukkan 14:15. Waktu di New Delhi UTC+5:30 ialah?','11:45',[Nq('12:15','time'),Nq('11:15','time'),Nq('16:45','time')],'New Delhi 2 jam 30 minit di belakang Kuala Lumpur.','Tahun 6 · Zon Masa Separuh Jam'),id,'4.1.2',mode,'story',stage(s)===3?'reasoning':'application',s,['timezone','half_hour']);
 if(mode==='next_day')return mark(q('Kuala Lumpur UTC+8 menunjukkan 23:30. Waktu di Tokyo UTC+9 ialah?','00:30 hari berikutnya',[Nq('22:30 hari yang sama','time'),Nq('00:30 hari yang sama','time'),Nq('01:30 hari berikutnya','time')],'Tokyo 1 jam lebih awal dan melintasi tengah malam.','Tahun 6 · Pertukaran Hari'),id,'4.1.2',mode,'story',stage(s)===3?'reasoning':'application',s,['timezone','day_change']);
 if(mode==='previous_day')return mark(q('Kuala Lumpur UTC+8 menunjukkan 02:15. Waktu di Dubai UTC+4 ialah?','22:15 hari sebelumnya',[Nq('06:15 hari yang sama','time'),Nq('22:15 hari yang sama','time'),Nq('23:15 hari sebelumnya','time')],'Dubai 4 jam di belakang; tolak hingga melintasi tengah malam.','Tahun 6 · Hari Sebelumnya'),id,'4.1.2',mode,'story',stage(s)===3?'reasoning':'application',s,['timezone','day_change']);
 if(mode==='reverse_time')return mark(q('Tokyo UTC+9 menunjukkan 18:45. Pada masa yang sama, Kuala Lumpur UTC+8 menunjukkan?','17:45',[Nq('19:45','time'),Nq('18:45','time'),Nq('16:45','time')],'Kuala Lumpur 1 jam di belakang Tokyo.','Tahun 6 · Waktu Songsang'),id,'4.1.2',mode,'story','reasoning',s,['timezone','inverse']);
 return mark(q('Murid menukar 23:45 Kuala Lumpur kepada 00:45 Tokyo tetapi menulis "hari yang sama". Penilaian?','salah, 00:45 ialah hari berikutnya',[Nq('betul','time'),Nq('salah, waktu Tokyo 22:45','time'),Nq('salah, waktu Tokyo 01:45','time')],'Tambah 1 jam melintasi tengah malam.','Tahun 6 · Analisis Kesilapan Zon Masa'),id,'4.1.2',mode,'verbal','reasoning',s,['timezone','error_analysis']);
};

GEN['4.2.1']=function(id,s){
 const mode=chooseMode(id,'4.2.1',bandModes(s,['meeting','arrival_simple'],['meeting','arrival_simple','flight_half_hour','schedule_table','day_change_problem'],['flight_half_hour','schedule_table','day_change_problem','departure_reverse','two_leg','reason_claim']));
 if(mode==='meeting')return mark(q('Mesyuarat bermula di Kuala Lumpur UTC+8 pada 09:00. Apakah waktu serentak di Bangkok UTC+7?','08:00',[Nq('10:00','time'),Nq('09:00','time'),Nq('07:00','time')],'Bangkok 1 jam di belakang.','Tahun 6 · Mesyuarat Antarabangsa'),id,'4.2.1',mode,'story','application',s,['timezone','schedule']);
 if(mode==='arrival_simple')return mark(q('Penerbangan berlepas Kuala Lumpur 10:00, mengambil 4 jam dan tiba di Dubai UTC+4. Waktu tempatan tiba?','10:00',[Nq('14:00','time'),Nq('06:00','time'),Nq('18:00','time')],'10:00 + 4 jam = 14:00 waktu KL; Dubai 4 jam di belakang.','Tahun 6 · Waktu Ketibaan'),id,'4.2.1',mode,'story','application',s,['timezone','duration']);
 if(mode==='flight_half_hour')return mark(q('Penerbangan berlepas Kuala Lumpur 08:30 dan mengambil 6 jam. Destinasi New Delhi UTC+5:30. Waktu tempatan tiba?','12:00',[Nq('14:30','time'),Nq('11:30','time'),Nq('17:00','time')],'Tambah 6 jam, kemudian tolak beza zon 2 jam 30 minit.','Tahun 6 · Penerbangan dan Zon Separuh Jam'),id,'4.2.1',mode,'story',stage(s)===3?'reasoning':'application',s,['timezone','half_hour','duration']);
 if(mode==='schedule_table')return mark(q(table(['Bandar','Waktu acara'],[['Kuala Lumpur','20:00 (UTC+8)'],['Tokyo','? (UTC+9)'],['Dubai','? (UTC+4)']])+'Apakah pasangan waktu yang betul?','Tokyo 21:00, Dubai 16:00',[Nq('Tokyo 19:00, Dubai 24:00','time'),Nq('Tokyo 20:00, Dubai 20:00','time'),Nq('Tokyo 22:00, Dubai 15:00','time')],'Gunakan waktu Kuala Lumpur sebagai rujukan untuk setiap bandar.','Tahun 6 · Jadual Zon Masa'),id,'4.2.1',mode,'table',stage(s)===3?'reasoning':'application',s,['timezone','table']);
 if(mode==='day_change_problem')return mark(q('Siaran bermula di Kuala Lumpur pada 23:00 dan berlangsung 2 jam. Apakah waktu tamat di Tokyo UTC+9?','02:00 hari berikutnya',[Nq('01:00 hari berikutnya','time'),Nq('02:00 hari yang sama','time'),Nq('00:00 hari berikutnya','time')],'Tukar mula ke Tokyo (00:00 hari berikutnya), kemudian tambah 2 jam.','Tahun 6 · Tempoh dan Pertukaran Hari'),id,'4.2.1',mode,'story',stage(s)===3?'reasoning':'application',s,['timezone','duration','day_change']);
 if(mode==='departure_reverse')return mark(q('Penerbangan tiba di Tokyo UTC+9 pada 15:00 selepas 7 jam dari Dubai UTC+4. Pukul berapa berlepas dari Dubai?','03:00',[Nq('08:00','time'),Nq('10:00','time'),Nq('13:00','time')],'15:00 Tokyo = 10:00 Dubai; tolak 7 jam.','Tahun 6 · Waktu Berlepas Songsang'),id,'4.2.1',mode,'story','reasoning',s,['timezone','duration','inverse']);
 if(mode==='two_leg')return mark(q(table(['Segmen','Tempoh'],[['KL→Bangkok','2 jam'],['Transit','1 jam'],['Bangkok→Tokyo','5 jam']])+'Bertolak KL 08:00. Tokyo 1 jam di hadapan KL. Waktu tiba Tokyo?','17:00',[Nq('16:00','time'),Nq('18:00','time'),Nq('15:00','time')],'Jumlah tempoh 8 jam; tambah beza zon 1 jam.','Tahun 6 · Itinerari Pelbagai Segmen'),id,'4.2.1',mode,'table','reasoning',s,['timezone','multi_step']);
 return mark(q('Aiman berkata perjalanan KL 22:00 ke Tokyo selama 3 jam tiba 02:00 hari berikutnya. Betulkah?','betul',[Nq('salah, tiba 01:00','time'),Nq('salah, tiba 02:00 hari yang sama','time'),Nq('salah, tiba 03:00','time')],'22:00 + 3 jam = 01:00 waktu KL; Tokyo +1 jam = 02:00 hari berikutnya.','Tahun 6 · Menilai Jadual Perjalanan'),id,'4.2.1',mode,'verbal','reasoning',s,['timezone','reasoning']);
};

GEN['5.1.1']=function(id,s){
 const mode=chooseMode(id,'5.1.1',bandModes(
  s,
  ['length_mass_direct','length_liquid_direct','mass_liquid_direct','unit_rate'],
  ['length_mass_direct','length_mass_inverse','length_liquid_direct','mass_liquid_direct','unit_rate','table_compare','resource_limit'],
  ['length_mass_inverse','length_liquid_inverse','mass_liquid_inverse','table_compare','resource_limit','measurement_claim','multi_relation']
 ));
 if(mode==='length_mass_direct'){
  const L=choose([2,4,5]),M=choose([0.6,1.2,1.5]),k=choose([2,3]),ans=tidy(M*k,2);
  return mark(q(L+' m kabel berjisim '+M+' kg. '+(L*k)+' m kabel sama berjisim?',ans+' kg',[Nq(M+' kg','unit'),Nq(tidy(M+ k,2)+' kg','unit'),Nq(tidy(ans+1,2)+' kg','unit')],'Skalakan panjang dan jisim dengan faktor sama.','Tahun 6 · Panjang dan Jisim'),id,'5.1.1',mode,'story',stage(s)===1?'application':'application',s,['length','mass']);
 }
 if(mode==='length_mass_inverse')return mark(q('4 m kabel berjisim 1.2 kg. Berapa meter kabel yang sama mempunyai jisim 3.6 kg?','12 m',[Nq('8 m','unit'),Nq('10 m','unit'),Nq('14 m','unit')],'Jisim 3 kali ganda, jadi panjang 3 kali ganda.','Tahun 6 · Panjang daripada Jisim'),id,'5.1.1',mode,'story','reasoning',s,['length','mass','inverse']);
 if(mode==='length_liquid_direct')return mark(q('2 m kain memerlukan 0.5 L pewarna. 8 m kain memerlukan?','2 L',[Nq('1 L','unit'),Nq('4 L','unit'),Nq('8 L','unit')],'8 m ialah 4 kali 2 m.','Tahun 6 · Panjang dan Isi Padu Cecair'),id,'5.1.1',mode,'story','application',s,['length','liquid']);
 if(mode==='length_liquid_inverse')return mark(q('Setiap 3 m kain memerlukan 0.75 L pewarna. Dengan 2.25 L pewarna, berapa meter kain boleh diwarnakan?','9 m',[Nq('6 m','unit'),Nq('12 m','unit'),Nq('3 m','unit')],'2.25 L ialah 3 kali 0.75 L; panjang juga 3 kali.','Tahun 6 · Isi Padu kepada Panjang'),id,'5.1.1',mode,'story','reasoning',s,['length','liquid','inverse']);
 if(mode==='mass_liquid_direct')return mark(q('1.5 L cecair berjisim 1.2 kg. 4.5 L cecair yang sama berjisim?','3.6 kg',[Nq('2.4 kg','unit'),Nq('4.5 kg','unit'),Nq('1.8 kg','unit')],'Isi padu 3 kali ganda, jadi jisim 3 kali ganda.','Tahun 6 · Jisim dan Isi Padu Cecair'),id,'5.1.1',mode,'story','application',s,['mass','liquid']);
 if(mode==='mass_liquid_inverse')return mark(q('2 L cecair berjisim 1.6 kg. Berapa liter cecair yang sama berjisim 4 kg?','5 L',[Nq('3.2 L','unit'),Nq('6 L','unit'),Nq('8 L','unit')],'Kadar 0.8 kg bagi setiap liter.','Tahun 6 · Jisim kepada Isi Padu'),id,'5.1.1',mode,'story','reasoning',s,['mass','liquid','inverse']);
 if(mode==='unit_rate')return mark(q('6 m tali berjisim 1.5 kg. Jisim bagi 1 m?', '0.25 kg',[Nq('0.4 kg','unit'),Nq('2.5 kg','unit'),Nq('4 kg','unit')],'1.5 ÷ 6 = 0.25 kg per meter.','Tahun 6 · Kadar Unit Ukuran'),id,'5.1.1',mode,'story',stage(s)===1?'application':'application',s,['unit_rate']);
 if(mode==='table_compare')return mark(q(table(['Pilihan','Panjang','Jisim'],[['A','8 m','2.4 kg'],['B','10 m','2.5 kg']])+'Pilihan mana lebih ringan bagi setiap meter?','B',[Nq('A','unit'),Nq('sama','unit'),Nq('tidak boleh dibanding','unit')],'A=0.30 kg/m; B=0.25 kg/m.','Tahun 6 · Membanding Perkaitan Ukuran'),id,'5.1.1',mode,'table',stage(s)===3?'reasoning':'application',s,['rate','compare']);
 if(mode==='resource_limit')return mark(q('Setiap 2 m kain memerlukan 0.5 L pewarna. Ada 1.4 L. Berapa kumpulan penuh 2 m boleh disiapkan?',2,[Nq(1,'unit'),Nq(3,'unit'),Nq(4,'unit')],'1.4 ÷ 0.5 = 2.8, jadi 2 kumpulan penuh.','Tahun 6 · Had Sumber Ukuran'),id,'5.1.1',mode,'story',stage(s)===3?'reasoning':'application',s,['limit','liquid']);
 if(mode==='measurement_claim')return mark(q('Jika 2 L cecair berjisim 1.6 kg, murid berkata 5 L berjisim 4.0 kg. Penilaian?','betul',[Nq('salah, 3.2 kg','unit'),Nq('salah, 5.6 kg','unit'),Nq('tidak boleh ditentukan','unit')],'Kadar 0.8 kg/L; 5 × 0.8 = 4 kg.','Tahun 6 · Menilai Perkaitan Ukuran'),id,'5.1.1',mode,'verbal','reasoning',s,['mass','liquid','error_analysis']);
 return mark(q('3 m kain memerlukan 0.75 L pewarna. Setiap 0.25 L pewarna berjisim 0.2 kg. Berapakah jisim pewarna untuk 6 m kain?','1.2 kg',[Nq('0.6 kg','unit'),Nq('1.5 kg','unit'),Nq('2.4 kg','unit')],'6 m perlukan 1.5 L; 1.5 L ialah 6 kumpulan 0.25 L; 6 × 0.2 kg.','Tahun 6 · Perkaitan Ukuran Pelbagai Langkah'),id,'5.1.1',mode,'story','reasoning',s,['length','liquid','mass','multi_step']);
};

document.documentElement?.setAttribute('data-y6-v2-unit45','3.61.0');
})();