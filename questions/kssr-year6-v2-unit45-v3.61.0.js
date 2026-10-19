// Year 6 Curriculum Bank v2 — Unit 4 & 5: Masa/Waktu, Ukuran/Sukatan
(function(){
'use strict';
const RT=window.PAY6V2Runtime;if(!RT)return;
const {GEN,Nq,choose,q,mark,chooseMode,bandModes,stage,fmtTime,cities,table,tidy}=RT;

// KSSR/UASA notation: whole-hour GMT zones and the 24-hour clock written as "jam 1530".
const j24=m=>typeof formatClockTime==='function'?formatClockTime(m,'24'):'jam '+fmtTime(m).replace(':','');
const j12=m=>typeof formatClockTime==='function'?formatClockTime(m,'12','ampm'):fmtTime(m);
function gmtLabel(mins){const h=mins/60;return 'GMT '+(h<0?'−':'+')+Math.abs(h)}
function durationLabel(mins){const a=Math.abs(mins),h=Math.floor(a/60),m=a%60;return (h?h+' jam':'')+(h&&m?' ':'')+(m?m+' minit':'')||'0 minit'}
const zones=cities.filter(x=>x.offset%60===0);
// Cities whose clocks differ from Kuala Lumpur by a non-whole hour: only ever shown as two clock readings.
const clockCities=[{name:'Yangon',offset:390},{name:'New Delhi',offset:330},{name:'Kabul',offset:270},{name:'Kathmandu',offset:345}];
function cityPair(){const a=choose(zones),b=choose(zones.filter(x=>x.name!==a.name));return [a,b]}
function zoneTable(rows){return table(['Bandar','Zon waktu'],rows.map(c=>[c.name,gmtLabel(c.offset)]))}

// Every time-zone item shows its data in one table with the same columns
// (Bandar · Zon waktu · Waktu · Tarikh/Hari), as UASA does with "Rajah".
const ZW='Zon waktu';
function zoneRows(rows,extra){return table(['Bandar',ZW,'Waktu'].concat(extra?[extra]:[]),rows)}
function tripRows(rows){return table(['','Bandar',ZW,'Waktu'],rows)}

GEN['4.1.1']=function(id,s){
 const mode=chooseMode(id,'4.1.1',bandModes(s,['identify_ahead','read_offset','same_zone'],['identify_ahead','read_offset','same_zone','compare_offsets'],['compare_offsets','timezone_claim','clock_difference']));
 const [a,b]=cityPair();
 if(mode==='identify_ahead'){
  const ans=a.offset>b.offset?a.name:b.name;
  return mark(q(zoneTable([a,b])+'Waktu di bandar manakah mendahului?',ans,[Nq(ans===a.name?b.name:a.name,'timezone'),Nq('kedua-duanya sama','timezone'),Nq('tidak boleh ditentukan','timezone')],'Bandar dengan nilai GMT yang lebih besar mendahului.','Tahun 6 · Mengenal Zon Waktu'),id,'4.1.1',mode,'table','concept',s,['timezone']);
 }
 if(mode==='read_offset'){
  const kl=zones.find(x=>x.offset===480),c=choose(zones.filter(x=>x.offset!==480)),d=c.offset-480,len=Math.abs(d);
  const ahead='mendahului Kuala Lumpur ',behind='di belakang Kuala Lumpur ';
  const ans=(d>0?ahead:behind)+durationLabel(len),other=len>60?len-60:len+120;
  return mark(q(zoneTable([kl,c])+'Pernyataan manakah yang betul tentang waktu di '+c.name+'?',ans,[Nq((d>0?behind:ahead)+durationLabel(len),'timezone_direction'),Nq((d>0?ahead:behind)+durationLabel(len+60),'timezone'),Nq((d>0?ahead:behind)+durationLabel(other),'timezone')],'Banding nilai GMT kedua-dua bandar.','Tahun 6 · Membaca Zon Waktu'),id,'4.1.1',mode,'table','concept',s,['timezone']);
 }
 if(mode==='same_zone')return mark(q(zoneRows([['Bandar A','GMT +8',j24(630)],['Bandar B','GMT +8','?']])+'Apakah waktu di Bandar B?',j24(630),[Nq(j24(570),'timezone'),Nq(j24(690),'timezone'),Nq(j24(1110),'timezone')],'Zon waktu yang sama bermaksud waktunya sama.','Tahun 6 · Zon Waktu Sama'),id,'4.1.1',mode,'table',stage(s)===3?'reasoning':'application',s,['timezone']);
 if(mode==='compare_offsets'){
  const ans=Math.abs(a.offset-b.offset);
  return mark(q(zoneTable([a,b])+'Berapakah beza masa antara dua bandar itu?',durationLabel(ans),[ans+60,ans-60,Math.abs(a.offset+b.offset),ans+120].filter((v,i,arr)=>v>0&&v!==ans&&arr.indexOf(v)===i).slice(0,3).map(v=>Nq(durationLabel(v),'timezone')),'Cari beza antara dua nilai GMT.','Tahun 6 · Banding Zon Waktu'),id,'4.1.1',mode,'table',stage(s)===3?'reasoning':'application',s,['timezone','compare']);
 }
 if(mode==='timezone_claim')return mark(q(zoneTable([{name:'Kuala Lumpur',offset:480},{name:'Tokyo',offset:540}])+'Mei berkata waktu di Tokyo mendahului Kuala Lumpur 1 jam. Adakah Mei betul?','betul',[Nq('salah, Tokyo 1 jam di belakang','timezone_direction'),Nq('salah, waktunya sama','timezone'),Nq('salah, bezanya 17 jam','timezone')],'9 − 8 = 1; Tokyo mempunyai nilai GMT yang lebih besar.','Tahun 6 · Menilai Zon Waktu'),id,'4.1.1',mode,'table','reasoning',s,['timezone','error_analysis']);
 // UASA: two clock readings at the same moment; find the time difference in hours and minutes.
 const c=choose(clockCities),kl=choose([735,850,1120]),other=kl-(480-c.offset),d=kl-other;
 const naive=Number(j24(kl).slice(4))-Number(j24(other).slice(4));
 const wrong=[naive+' minit',durationLabel(d+60),durationLabel(d>60?d-60:d+30)].filter((v,i,arr)=>v!==durationLabel(d)&&arr.indexOf(v)===i);
 return mark(q(table(['Bandar','Waktu'],[['Kuala Lumpur',j24(kl)],[c.name,j24(other)]])+'Jadual menunjukkan waktu di dua bandar pada saat yang sama. Berapakah beza masa, dalam jam dan minit?',durationLabel(d),wrong.map(v=>Nq(v,'time')),'Tolak masa dalam jam dan minit; 1 jam = 60 minit, bukan 100 minit.','Tahun 6 · Beza Masa Dua Bandar'),id,'4.1.1',mode,'table','reasoning',s,['timezone','time_subtract']);
};

GEN['4.1.2']=function(id,s){
 const mode=chooseMode(id,'4.1.2',bandModes(s,['convert_simple','difference'],['convert_simple','difference','minutes_difference','next_day','previous_day'],['minutes_difference','next_day','previous_day','reverse_time','time_claim']));
 if(mode==='convert_simple'){
  const [a,b]=cityPair(),start=choose([480,600,840,1080]),target=start+(b.offset-a.offset);
  return mark(q(zoneRows([[a.name,gmtLabel(a.offset),j24(start)],[b.name,gmtLabel(b.offset),'?']])+'Apakah waktu di '+b.name+'?',j24(target),[Nq(j24(target+60),'time'),Nq(j24(target-60),'time'),Nq(j24(start-(b.offset-a.offset)),'timezone_direction')],'Tambah jika bandar itu mendahului, tolak jika di belakang.','Tahun 6 · Menentukan Waktu Zon Lain'),id,'4.1.2',mode,'table',stage(s)===1?'procedure':'application',s,['timezone']);
 }
 if(mode==='difference'){
  const [a,b]=cityPair(),d=Math.abs(a.offset-b.offset),ans=durationLabel(d);
  return mark(q(zoneTable([a,b])+'Berapakah beza masa antara dua bandar itu?',ans,[Nq((Math.floor(d/60)+1)+' jam','time'),Nq(Math.max(0,Math.floor(d/60)-1)+' jam','time'),Nq((d/60)+' minit','time')],'Cari beza antara dua nilai GMT.','Tahun 6 · Perbezaan Waktu'),id,'4.1.2',mode,'table',stage(s)===1?'procedure':'application',s,['timezone','difference']);
 }
 if(mode==='minutes_difference')return mark(q(table(['Bandar','Waktu'],[['Kuala Lumpur',j24(855)],['New Delhi',j24(705)]])+'Jadual menunjukkan waktu di dua bandar pada saat yang sama. Berapakah beza masa, dalam minit?','150 minit',[Nq('270 minit','time'),Nq('130 minit','time'),Nq('230 minit','time')],'jam 1415 − jam 1145 = 2 jam 30 minit = 150 minit.','Tahun 6 · Beza Masa dalam Minit'),id,'4.1.2',mode,'table',stage(s)===3?'reasoning':'application',s,['timezone','time_subtract']);
 if(mode==='next_day')return mark(q(zoneRows([['Kuala Lumpur','GMT +8',j24(1410),'Isnin'],['Tokyo','GMT +9','?','?']],'Hari')+'Apakah waktu dan hari di Tokyo?',j24(30)+', Selasa',[Nq(j24(1350)+', Isnin','time'),Nq(j24(30)+', Isnin','day_change'),Nq(j24(90)+', Selasa','time')],'Tokyo mendahului 1 jam; selepas tengah malam, hari bertukar.','Tahun 6 · Pertukaran Hari'),id,'4.1.2',mode,'table',stage(s)===3?'reasoning':'application',s,['timezone','day_change']);
 if(mode==='previous_day')return mark(q(zoneRows([['Kuala Lumpur','GMT +8',j24(135),'15 Mac'],['Dubai','GMT +4','?','?']],'Tarikh')+'Apakah waktu dan tarikh di Dubai?',j24(1335)+', 14 Mac',[Nq(j24(375)+', 15 Mac','timezone_direction'),Nq(j24(1335)+', 15 Mac','day_change'),Nq(j24(1395)+', 14 Mac','time')],'Dubai 4 jam di belakang; tolak hingga melepasi tengah malam.','Tahun 6 · Hari Sebelumnya'),id,'4.1.2',mode,'table',stage(s)===3?'reasoning':'application',s,['timezone','day_change']);
 if(mode==='reverse_time')return mark(q(zoneRows([['Tokyo','GMT +9',j24(1125)],['Kuala Lumpur','GMT +8','?']])+'Apakah waktu di Kuala Lumpur?',j24(1065),[Nq(j24(1185),'timezone_direction'),Nq(j24(1125),'time'),Nq(j24(1005),'time')],'Kuala Lumpur 1 jam di belakang Tokyo.','Tahun 6 · Waktu Songsang'),id,'4.1.2',mode,'table','reasoning',s,['timezone','inverse']);
 return mark(q(zoneRows([['Kuala Lumpur','GMT +8',j24(1425),'Jumaat'],['Tokyo','GMT +9',j24(45),'Jumaat']],'Hari')+'Hana mengisi waktu dan hari di Tokyo seperti dalam jadual. Adakah Hana betul?','salah, hari di Tokyo ialah Sabtu',[Nq('betul','time'),Nq('salah, waktu Tokyo '+j24(1365),'timezone_direction'),Nq('salah, waktu Tokyo '+j24(105),'time')],'Tambah 1 jam; selepas jam 2400 hari bertukar.','Tahun 6 · Analisis Kesilapan Zon Waktu'),id,'4.1.2',mode,'table','reasoning',s,['timezone','error_analysis']);
};

GEN['4.2.1']=function(id,s){
 const mode=chooseMode(id,'4.2.1',bandModes(s,['meeting','arrival_simple'],['meeting','arrival_simple','video_call_12h','schedule_table','day_change_problem'],['flight_local','schedule_table','day_change_problem','departure_reverse','two_leg','reason_claim']));
 if(mode==='meeting')return mark(q(zoneRows([['Kuala Lumpur','GMT +8',j24(540)],['Bangkok','GMT +7','?']])+'Mesyuarat dalam talian bermula serentak di dua bandar. Apakah waktunya di Bangkok?',j24(480),[Nq(j24(600),'timezone_direction'),Nq(j24(540),'time'),Nq(j24(420),'time')],'Bangkok 1 jam di belakang Kuala Lumpur.','Tahun 6 · Mesyuarat Antarabangsa'),id,'4.2.1',mode,'table','application',s,['timezone','schedule']);
 if(mode==='arrival_simple')return mark(q(tripRows([['Berlepas','Kuala Lumpur','GMT +8',j24(600)],['Tiba','Dubai','GMT +4','?']])+'Penerbangan mengambil masa 4 jam. Apakah waktu tiba di Dubai?',j24(600),[Nq(j24(840),'time'),Nq(j24(360),'time'),Nq(j24(1080),'timezone_direction')],'jam 1000 + 4 jam = jam 1400 waktu Kuala Lumpur; Dubai 4 jam di belakang.','Tahun 6 · Waktu Ketibaan'),id,'4.2.1',mode,'table','application',s,['timezone','duration']);
 if(mode==='video_call_12h')return mark(q(zoneRows([['Kuala Lumpur','GMT +8',j12(1280),'Isnin'],['London','GMT +0','?','?']],'Hari')+'Dina di Kuala Lumpur membuat panggilan video kepada Ben di London. Apakah waktu dan hari di London?',j12(800)+', Isnin',[Nq(j12(320)+', Selasa','timezone_direction'),Nq(j12(80)+', Isnin','time'),Nq(j12(1040)+', Isnin','time')],'London 8 jam di belakang Kuala Lumpur.','Tahun 6 · Panggilan Video Antarabangsa'),id,'4.2.1',mode,'table',stage(s)===3?'reasoning':'application',s,['timezone','schedule']);
 if(mode==='flight_local')return mark(q(tripRows([['Berlepas','Kuala Lumpur','GMT +8',j24(510)],['Tiba','Dubai','GMT +4','?']])+'Penerbangan mengambil masa 6 jam. Apakah waktu tiba di Dubai?',j24(630),[Nq(j24(870),'time'),Nq(j24(1110),'timezone_direction'),Nq(j24(390),'time')],'Tambah 6 jam, kemudian tolak 4 jam kerana Dubai di belakang.','Tahun 6 · Penerbangan dan Zon Waktu'),id,'4.2.1',mode,'table',stage(s)===3?'reasoning':'application',s,['timezone','duration']);
 if(mode==='schedule_table')return mark(q(zoneRows([['Kuala Lumpur','GMT +8',j24(1200)],['Tokyo','GMT +9','?'],['Dubai','GMT +4','?']])+'Satu acara bermula serentak di tiga bandar. Apakah waktunya di Tokyo dan di Dubai?','Tokyo '+j24(1260)+', Dubai '+j24(960),[Nq('Tokyo '+j24(1140)+', Dubai '+j24(1440),'timezone_direction'),Nq('Tokyo '+j24(1200)+', Dubai '+j24(1200),'timezone'),Nq('Tokyo '+j24(1320)+', Dubai '+j24(900),'time')],'Tokyo mendahului 1 jam; Dubai di belakang 4 jam.','Tahun 6 · Jadual Zon Waktu'),id,'4.2.1',mode,'table',stage(s)===3?'reasoning':'application',s,['timezone','table']);
 if(mode==='day_change_problem')return mark(q(tripRows([['Siaran bermula','Kuala Lumpur','GMT +8',j24(1380)],['Siaran tamat','Tokyo','GMT +9','?']])+'Siaran itu berlangsung selama 2 jam. Apakah waktu siaran tamat di Tokyo?',j24(120)+' hari berikutnya',[Nq(j24(60)+' hari berikutnya','time'),Nq(j24(120)+' hari yang sama','day_change'),Nq(j24(0)+' hari berikutnya','time')],'Siaran bermula jam 0000 waktu Tokyo, kemudian tambah 2 jam.','Tahun 6 · Tempoh dan Pertukaran Hari'),id,'4.2.1',mode,'table',stage(s)===3?'reasoning':'application',s,['timezone','duration','day_change']);
 if(mode==='departure_reverse')return mark(q(tripRows([['Berlepas','Dubai','GMT +4','?'],['Tiba','Tokyo','GMT +9',j24(900)]])+'Penerbangan mengambil masa 7 jam. Apakah waktu berlepas di Dubai?',j24(180),[Nq(j24(480),'time'),Nq(j24(600),'timezone_direction'),Nq(j24(780),'time')],'jam 1500 di Tokyo = jam 1000 di Dubai; tolak 7 jam.','Tahun 6 · Waktu Berlepas'),id,'4.2.1',mode,'table','reasoning',s,['timezone','duration','inverse']);
 if(mode==='two_leg')return mark(q(table(['Perjalanan','Tempoh'],[['Kuala Lumpur → Bangkok','2 jam'],['Menunggu di Bangkok','1 jam'],['Bangkok → Tokyo','5 jam']])+tripRows([['Bertolak','Kuala Lumpur','GMT +8',j24(480)],['Tiba','Tokyo','GMT +9','?']])+'Apakah waktu keluarga Hakim tiba di Tokyo?',j24(1020),[Nq(j24(960),'time'),Nq(j24(1080),'time'),Nq(j24(900),'time')],'Jumlah tempoh 8 jam; tambah 1 jam kerana Tokyo mendahului.','Tahun 6 · Perjalanan Pelbagai Bahagian'),id,'4.2.1',mode,'table','reasoning',s,['timezone','multi_step']);
 return mark(q(tripRows([['Berlepas','Kuala Lumpur','GMT +8',j24(1320)],['Tiba','Tokyo','GMT +9',j24(120)+' (hari berikutnya)']])+'Penerbangan mengambil masa 3 jam. Aiman mengisi waktu tiba seperti dalam jadual. Adakah Aiman betul?','betul',[Nq('salah, tiba jam 0100','time'),Nq('salah, tiba jam 0200 hari yang sama','day_change'),Nq('salah, tiba jam 0300','time')],'jam 2200 + 3 jam = jam 0100 waktu Kuala Lumpur; Tokyo +1 jam = jam 0200 hari berikutnya.','Tahun 6 · Menilai Jadual Perjalanan'),id,'4.2.1',mode,'table','reasoning',s,['timezone','reasoning']);
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
  const prompt=table(['Kabel','Panjang','Jisim'],[['A',L+' m',M+' kg'],['B',(L*k)+' m','?']])+'Kabel A dan Kabel B daripada jenis yang sama. Berapakah jisim, dalam kg, Kabel B?';
  return mark(q(prompt,ans+' kg',[Nq(M+' kg','unit'),Nq(tidy(M+ k,2)+' kg','unit'),Nq(tidy(ans+1,2)+' kg','unit')],'Skalakan panjang dan jisim dengan faktor sama.','Tahun 6 · Panjang dan Jisim'),id,'5.1.1',mode,'story',stage(s)===1?'application':'application',s,['length','mass']);
 }
 if(mode==='length_mass_inverse')return mark(q(table(['Kabel','Panjang','Jisim'],[['A','4 m','1.2 kg'],['B','?','3.6 kg']])+'Kabel A dan Kabel B daripada jenis yang sama. Berapakah panjang Kabel B?','12 m',[Nq('8 m','unit'),Nq('10 m','unit'),Nq('14 m','unit')],'Jisim 3 kali ganda, jadi panjang 3 kali ganda.','Tahun 6 · Panjang daripada Jisim'),id,'5.1.1',mode,'story','reasoning',s,['length','mass','inverse']);
 if(mode==='length_liquid_direct')return mark(q(table(['Kain','Panjang','Pewarna'],[['A','2 m','0.5 ℓ'],['B','8 m','?']])+'Berapakah isi padu pewarna, dalam ℓ, untuk kain B?','2 ℓ',[Nq('1 ℓ','unit'),Nq('4 ℓ','unit'),Nq('8 ℓ','unit')],'8 m ialah 4 kali 2 m.','Tahun 6 · Panjang dan Isi Padu Cecair'),id,'5.1.1',mode,'story','application',s,['length','liquid']);
 if(mode==='length_liquid_inverse')return mark(q(table(['Kain','Panjang','Pewarna'],[['A','3 m','0.75 ℓ'],['B','?','2.25 ℓ']])+'Berapakah panjang kain B yang boleh diwarnakan?','9 m',[Nq('6 m','unit'),Nq('12 m','unit'),Nq('3 m','unit')],'2.25 ℓ ialah 3 kali 0.75 ℓ; panjang juga 3 kali.','Tahun 6 · Isi Padu kepada Panjang'),id,'5.1.1',mode,'story','reasoning',s,['length','liquid','inverse']);
 if(mode==='mass_liquid_direct')return mark(q(table(['Bekas','Isi padu cecair','Jisim'],[['A','1.5 ℓ','1.2 kg'],['B','4.5 ℓ','?']])+'Cecair dalam kedua-dua bekas adalah sama. Berapakah jisim cecair dalam bekas B?','3.6 kg',[Nq('2.4 kg','unit'),Nq('4.5 kg','unit'),Nq('1.8 kg','unit')],'Isi padu 3 kali ganda, jadi jisim 3 kali ganda.','Tahun 6 · Jisim dan Isi Padu Cecair'),id,'5.1.1',mode,'story','application',s,['mass','liquid']);
 if(mode==='mass_liquid_inverse')return mark(q(table(['Bekas','Isi padu cecair','Jisim'],[['A','2 ℓ','1.6 kg'],['B','?','4 kg']])+'Cecair dalam kedua-dua bekas adalah sama. Berapakah isi padu cecair dalam bekas B?','5 ℓ',[Nq('3.2 ℓ','unit'),Nq('6 ℓ','unit'),Nq('8 ℓ','unit')],'Kadar 0.8 kg bagi setiap liter.','Tahun 6 · Jisim kepada Isi Padu'),id,'5.1.1',mode,'story','reasoning',s,['mass','liquid','inverse']);
 if(mode==='unit_rate')return mark(q(table(['Tali','Panjang','Jisim'],[['Seutas tali','6 m','1.5 kg']])+'Berapakah jisim bagi setiap 1 m tali itu?', '0.25 kg',[Nq('0.4 kg','unit'),Nq('2.5 kg','unit'),Nq('4 kg','unit')],'1.5 ÷ 6 = 0.25 kg per meter.','Tahun 6 · Kadar Unit Ukuran'),id,'5.1.1',mode,'story',stage(s)===1?'application':'application',s,['unit_rate']);
 if(mode==='table_compare')return mark(q(table(['Pilihan','Panjang','Jisim'],[['A','8 m','2.4 kg'],['B','10 m','2.5 kg']])+'Pilihan manakah yang mempunyai jisim lebih rendah bagi setiap meter?','B',[Nq('A','unit'),Nq('sama','unit'),Nq('tidak boleh dibanding','unit')],'A=0.30 kg/m; B=0.25 kg/m.','Tahun 6 · Membanding Perkaitan Ukuran'),id,'5.1.1',mode,'table',stage(s)===3?'reasoning':'application',s,['rate','compare']);
 if(mode==='resource_limit')return mark(q(table(['Butiran','Nilai'],[['Pewarna bagi setiap 2 m kain','0.5 ℓ'],['Pewarna yang ada','1.4 ℓ']])+'Berapakah bilangan helai kain sepanjang 2 m yang dapat diwarnakan sepenuhnya?',2,[Nq(1,'unit'),Nq(3,'unit'),Nq(4,'unit')],'1.4 ÷ 0.5 = 2.8, jadi hanya 2 helai yang lengkap.','Tahun 6 · Had Sumber Ukuran'),id,'5.1.1',mode,'story',stage(s)===3?'reasoning':'application',s,['limit','liquid']);
 if(mode==='measurement_claim')return mark(q(table(['Minyak masak','Isi padu','Jisim'],[['Botol A','2 ℓ','1.6 kg'],['Botol B','5 ℓ','4.0 kg']])+'Hana mengisi jisim Botol B seperti dalam jadual. Adakah Hana betul?','betul',[Nq('salah, 3.2 kg','unit'),Nq('salah, 5.6 kg','unit'),Nq('tidak boleh ditentukan','unit')],'Kadar 0.8 kg/ℓ; 5 × 0.8 = 4 kg.','Tahun 6 · Menilai Perkaitan Ukuran'),id,'5.1.1',mode,'verbal','reasoning',s,['mass','liquid','error_analysis']);
 return mark(q(table(['Butiran','Nilai'],[['Pewarna bagi 3 m kain','0.75 ℓ'],['Jisim setiap 0.25 ℓ pewarna','0.2 kg']])+'Berapakah jisim pewarna untuk 6 m kain?','1.2 kg',[Nq('0.6 kg','unit'),Nq('1.5 kg','unit'),Nq('2.4 kg','unit')],'6 m perlukan 1.5 ℓ; 1.5 ℓ ialah 6 kumpulan 0.25 ℓ; 6 × 0.2 kg.','Tahun 6 · Perkaitan Ukuran Pelbagai Langkah'),id,'5.1.1',mode,'story','reasoning',s,['length','liquid','mass','multi_step']);
};

document.documentElement?.setAttribute('data-y6-v2-unit45','3.61.0');
})();
