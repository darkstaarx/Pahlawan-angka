// Year 6 Curriculum Bank v2 — Unit 4 & 5: Masa/Waktu, Ukuran/Sukatan
// Every archetype draws its own cities, times, days and quantities.
(function(){
'use strict';
const RT=window.PAY6V2Runtime;if(!RT)return;
const {GEN,Nq,choose,rand,q,mark,chooseMode,bandModes,stage,fmtTime,table,tidy,who,distinct}=RT;

// KSSR/UASA notation: whole-hour GMT zones and the 24-hour clock written as "jam 1530".
const j24=m=>typeof formatClockTime==='function'?formatClockTime(m,'24'):'jam '+fmtTime(m).replace(':','');
const j12=m=>typeof formatClockTime==='function'?formatClockTime(m,'12','ampm'):fmtTime(m);
function gmtLabel(mins){const h=mins/60;return 'GMT '+(h<0?'−':'+')+Math.abs(h)}
function durationLabel(mins){const a=Math.abs(mins),h=Math.floor(a/60),m=a%60;return (h?h+' jam':'')+(h&&m?' ':'')+(m?m+' minit':'')||'0 minit'}
const zones=[
 {name:'Kuala Lumpur',offset:480},{name:'Singapura',offset:480},{name:'Beijing',offset:480},{name:'Tokyo',offset:540},{name:'Seoul',offset:540},
 {name:'Bangkok',offset:420},{name:'Jakarta',offset:420},{name:'Dubai',offset:240},{name:'Karachi',offset:300},{name:'Moscow',offset:180},
 {name:'Kaherah',offset:120},{name:'Paris',offset:60},{name:'London',offset:0},{name:'Sydney',offset:600}
];
const KL=zones[0];
// Cities whose clocks differ from Kuala Lumpur by a non-whole hour: only ever shown as two clock readings.
const clockCities=[{name:'Yangon',offset:390},{name:'New Delhi',offset:330},{name:'Kabul',offset:270},{name:'Kathmandu',offset:345},{name:'Colombo',offset:330}];
const DAYS=['Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu','Ahad'];
const MONTHS=['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'];
const norm=m=>((m%1440)+1440)%1440,dayShift=m=>Math.floor(m/1440);
function pair(cond){let a,b;do{a=choose(zones);b=choose(zones)}while(a.name===b.name||!cond(a,b));return [a,b]}
const diffZone=(a,b)=>a.offset!==b.offset;
function zoneTable(rows){return table(['Bandar','Zon waktu'],rows.map(c=>[c.name,gmtLabel(c.offset)]))}
const ZW='Zon waktu';
function zoneRows(rows,extra){return table(['Bandar',ZW,'Waktu'].concat(extra?[extra]:[]),rows)}
function tripRows(rows){return table(['','Bandar',ZW,'Waktu'],rows)}
const anyTime=(lo=360,hi=1260)=>rand(lo/5,hi/5)*5;
const wrongTimes=(ans,extra)=>[ans+60,ans-60,...extra].map(norm).map(j24);

GEN['4.1.1']=function(id,s){
 const mode=chooseMode(id,'4.1.1',bandModes(s,['identify_ahead','read_offset','same_zone'],['identify_ahead','read_offset','same_zone','compare_offsets'],['compare_offsets','timezone_claim','clock_difference']));
 const [a,b]=pair(diffZone);
 if(mode==='identify_ahead'){const ans=a.offset>b.offset?a.name:b.name;return mark(q(zoneTable([a,b])+'Waktu di bandar manakah mendahului?',ans,[Nq(ans===a.name?b.name:a.name,'timezone'),Nq('kedua-duanya sama','timezone'),Nq('tidak boleh ditentukan','timezone')],'Bandar dengan nilai GMT yang lebih besar mendahului.','Tahun 6 · Mengenal Zon Waktu'),id,'4.1.1',mode,'table','concept',s,['timezone']);}
 if(mode==='read_offset'){
  const [r,c]=pair((x,y)=>x.offset!==y.offset),d=c.offset-r.offset,len=Math.abs(d),ahead='mendahului '+r.name+' ',behind='di belakang '+r.name+' ',other=len>60?len-60:len+120;
  const ans=(d>0?ahead:behind)+durationLabel(len);
  return mark(q(zoneTable([r,c])+'Pernyataan manakah yang betul tentang waktu di '+c.name+'?',ans,distinct(ans,[(d>0?behind:ahead)+durationLabel(len),(d>0?ahead:behind)+durationLabel(len+60),(d>0?ahead:behind)+durationLabel(other)],'timezone_direction'),'Banding nilai GMT kedua-dua bandar.','Tahun 6 · Membaca Zon Waktu'),id,'4.1.1',mode,'table','concept',s,['timezone']);
 }
 if(mode==='same_zone'){const [x,y]=pair((p,r)=>p.offset===r.offset),tm=anyTime();return mark(q(zoneRows([[x.name,gmtLabel(x.offset),j24(tm)],[y.name,gmtLabel(y.offset),'?']])+'Apakah waktu di '+y.name+'?',j24(tm),distinct(j24(tm),wrongTimes(tm,[tm+x.offset]),'timezone'),'Zon waktu yang sama bermaksud waktunya sama.','Tahun 6 · Zon Waktu Sama'),id,'4.1.1',mode,'table',stage(s)===3?'reasoning':'application',s,['timezone']);}
 if(mode==='compare_offsets'){const ans=Math.abs(a.offset-b.offset);return mark(q(zoneTable([a,b])+'Berapakah beza masa antara dua bandar itu?',durationLabel(ans),distinct(durationLabel(ans),[ans+60,ans-60,Math.abs(a.offset+b.offset),ans+120].filter(v=>v>0).map(durationLabel),'timezone'),'Cari beza antara dua nilai GMT.','Tahun 6 · Banding Zon Waktu'),id,'4.1.1',mode,'table',stage(s)===3?'reasoning':'application',s,['timezone','compare']);}
 if(mode==='timezone_claim'){
  const [lo,hi]=a.offset<b.offset?[a,b]:[b,a],d=hi.offset-lo.offset,name=who(),ok=choose([true,false]);
  const claim=ok?hi.name+' mendahului '+lo.name+' '+durationLabel(d):lo.name+' mendahului '+hi.name+' '+durationLabel(d);
  const ans=ok?'betul':'salah, '+hi.name+' yang mendahului';
  return mark(q(zoneTable([lo,hi])+name+' berkata waktu di '+claim+'. Adakah '+name+' betul?',ans,distinct(ans,[ok?'salah, '+lo.name+' yang mendahului':'betul','salah, waktunya sama','salah, bezanya '+durationLabel(d+120)],'timezone_direction'),'Bandar dengan nilai GMT yang lebih besar mendahului.','Tahun 6 · Menilai Zon Waktu'),id,'4.1.1',mode,'table','reasoning',s,['timezone','error_analysis']);
 }
 // UASA: two clock readings at the same moment; find the time difference in hours and minutes.
 const c=choose(clockCities),kl=anyTime(600,1380),other=kl-(480-c.offset),d=kl-other;
 const naive=Number(j24(kl).slice(4))-Number(j24(other).slice(4));
 return mark(q(table(['Bandar','Waktu'],[['Kuala Lumpur',j24(kl)],[c.name,j24(other)]])+'Jadual menunjukkan waktu di dua bandar pada saat yang sama. Berapakah beza masa, dalam jam dan minit?',durationLabel(d),distinct(durationLabel(d),[naive+' minit',durationLabel(d+60),durationLabel(d>60?d-60:d+30)],'time'),'Tolak masa dalam jam dan minit; 1 jam = 60 minit, bukan 100 minit.','Tahun 6 · Beza Masa Dua Bandar'),id,'4.1.1',mode,'table','reasoning',s,['timezone','time_subtract']);
};

GEN['4.1.2']=function(id,s){
 const mode=chooseMode(id,'4.1.2',bandModes(s,['convert_simple','difference'],['convert_simple','difference','minutes_difference','next_day','previous_day'],['minutes_difference','next_day','previous_day','reverse_time','time_claim']));
 if(mode==='convert_simple'){
  let a,b,start,target;do{[a,b]=pair(diffZone);start=anyTime();target=start+(b.offset-a.offset)}while(target<0||target>=1440);
  return mark(q(zoneRows([[a.name,gmtLabel(a.offset),j24(start)],[b.name,gmtLabel(b.offset),'?']])+'Apakah waktu di '+b.name+'?',j24(target),distinct(j24(target),[j24(norm(target+60)),j24(norm(target-60)),j24(norm(start-(b.offset-a.offset)))],'timezone_direction'),'Tambah jika bandar itu mendahului, tolak jika di belakang.','Tahun 6 · Menentukan Waktu Zon Lain'),id,'4.1.2',mode,'table',stage(s)===1?'procedure':'application',s,['timezone']);
 }
 if(mode==='difference'){const [a,b]=pair(diffZone),d=Math.abs(a.offset-b.offset),ans=durationLabel(d);return mark(q(zoneTable([a,b])+'Berapakah beza masa antara dua bandar itu?',ans,distinct(ans,[(d/60+1)+' jam',Math.max(1,d/60-1)+' jam',(d/60)+' minit'],'time'),'Cari beza antara dua nilai GMT.','Tahun 6 · Perbezaan Waktu'),id,'4.1.2',mode,'table',stage(s)===1?'procedure':'application',s,['timezone','difference']);}
 if(mode==='minutes_difference'){
  const c=choose(clockCities),kl=anyTime(600,1380),other=kl-(480-c.offset),d=kl-other,naive=Number(j24(kl).slice(4))-Number(j24(other).slice(4));
  return mark(q(table(['Bandar','Waktu'],[['Kuala Lumpur',j24(kl)],[c.name,j24(other)]])+'Jadual menunjukkan waktu di dua bandar pada saat yang sama. Berapakah beza masa, dalam minit?',d+' minit',distinct(d+' minit',[naive+' minit',(d+60)+' minit',(d-20)+' minit'],'time'),j24(kl)+' − '+j24(other)+' = '+durationLabel(d)+' = '+d+' minit.','Tahun 6 · Beza Masa dalam Minit'),id,'4.1.2',mode,'table',stage(s)===3?'reasoning':'application',s,['timezone','time_subtract']);
 }
 if(mode==='next_day'){
  const [a,b]=pair((x,y)=>y.offset>x.offset&&y.offset-x.offset<=360),d=b.offset-a.offset,t=rand(Math.ceil((1440-d)/5),Math.floor(1439/5))*5,ans=norm(t+d),di=rand(0,6),dn=DAYS[di],nx=DAYS[(di+1)%7];
  return mark(q(zoneRows([[a.name,gmtLabel(a.offset),j24(t),dn],[b.name,gmtLabel(b.offset),'?','?']],'Hari')+'Apakah waktu dan hari di '+b.name+'?',j24(ans)+', '+nx,distinct(j24(ans)+', '+nx,[j24(norm(t-d))+', '+dn,j24(ans)+', '+dn,j24(norm(ans+60))+', '+nx],'day_change'),b.name+' mendahului '+durationLabel(d)+'; selepas tengah malam, hari bertukar.','Tahun 6 · Pertukaran Hari'),id,'4.1.2',mode,'table',stage(s)===3?'reasoning':'application',s,['timezone','day_change']);
 }
 if(mode==='previous_day'){
  const [a,b]=pair((x,y)=>y.offset<x.offset&&x.offset-y.offset<=480),d=a.offset-b.offset,t=rand(0,Math.floor((d-5)/5))*5,ans=norm(t-d),day=rand(2,27),mon=choose(MONTHS);
  return mark(q(zoneRows([[a.name,gmtLabel(a.offset),j24(t),day+' '+mon],[b.name,gmtLabel(b.offset),'?','?']],'Tarikh')+'Apakah waktu dan tarikh di '+b.name+'?',j24(ans)+', '+(day-1)+' '+mon,distinct(j24(ans)+', '+(day-1)+' '+mon,[j24(norm(t+d))+', '+day+' '+mon,j24(ans)+', '+day+' '+mon,j24(norm(ans+60))+', '+(day-1)+' '+mon],'day_change'),b.name+' di belakang '+durationLabel(d)+'; tolak hingga melepasi tengah malam.','Tahun 6 · Hari Sebelumnya'),id,'4.1.2',mode,'table',stage(s)===3?'reasoning':'application',s,['timezone','day_change']);
 }
 if(mode==='reverse_time'){
  let a,b,t,ans;do{[a,b]=pair(diffZone);t=anyTime();ans=t+(b.offset-a.offset)}while(ans<0||ans>=1440);
  return mark(q(zoneRows([[a.name,gmtLabel(a.offset),j24(t)],[b.name,gmtLabel(b.offset),'?']])+'Apakah waktu di '+b.name+' pada saat yang sama?',j24(ans),distinct(j24(ans),[j24(norm(t-(b.offset-a.offset))),j24(t),j24(norm(ans+60))],'timezone_direction'),'Banding nilai GMT untuk tahu sama ada perlu tambah atau tolak.','Tahun 6 · Waktu Songsang'),id,'4.1.2',mode,'table','reasoning',s,['timezone','inverse']);
 }
 const [a,b]=pair((x,y)=>y.offset>x.offset&&y.offset-x.offset<=240),d=b.offset-a.offset,t=rand(Math.ceil((1440-d)/5),287)*5,ans=norm(t+d),di=rand(0,6),dn=DAYS[di],nx=DAYS[(di+1)%7],name=who(),ok=choose([true,false]);
 const filledDay=ok?nx:dn,res=ok?'betul':'salah, hari di '+b.name+' ialah '+nx;
 return mark(q(zoneRows([[a.name,gmtLabel(a.offset),j24(t),dn],[b.name,gmtLabel(b.offset),j24(ans),filledDay]],'Hari')+name+' mengisi waktu dan hari di '+b.name+' seperti dalam jadual. Adakah '+name+' betul?',res,distinct(res,[ok?'salah, hari di '+b.name+' ialah '+dn:'betul','salah, waktu di '+b.name+' ialah '+j24(norm(t-d)),'salah, waktu di '+b.name+' ialah '+j24(norm(ans+60))],'day_change'),'Tambah '+durationLabel(d)+'; selepas jam 2400 hari bertukar.','Tahun 6 · Analisis Kesilapan Zon Waktu'),id,'4.1.2',mode,'table','reasoning',s,['timezone','error_analysis']);
};

// Arrival time in the destination's local time, kept within one day.
function flight(cond){let a,b,t,dur,arr;do{[a,b]=pair(cond);t=anyTime(300,1080);dur=rand(2,9)*60+choose([0,0,30]);arr=t+dur+(b.offset-a.offset)}while(arr<0||arr>=1440);return {a,b,t,dur,arr}}
GEN['4.2.1']=function(id,s){
 const mode=chooseMode(id,'4.2.1',bandModes(s,['meeting','arrival_simple'],['meeting','arrival_simple','video_call_12h','schedule_table','day_change_problem'],['flight_local','schedule_table','day_change_problem','departure_reverse','two_leg','reason_claim']));
 if(mode==='meeting'){
  let a,b,t,ans;do{[a,b]=pair(diffZone);t=anyTime(420,1080);ans=t+(b.offset-a.offset)}while(ans<0||ans>=1440);
  const what=choose(['Mesyuarat dalam talian','Kuiz dalam talian','Perlawanan akhir','Sesi bacaan bersama']);
  return mark(q(zoneRows([[a.name,gmtLabel(a.offset),j24(t)],[b.name,gmtLabel(b.offset),'?']])+what+' bermula serentak di dua bandar. Apakah waktunya di '+b.name+'?',j24(ans),distinct(j24(ans),[j24(norm(t-(b.offset-a.offset))),j24(t),j24(norm(ans+60))],'timezone_direction'),'Banding nilai GMT kedua-dua bandar.','Tahun 6 · Acara Antarabangsa'),id,'4.2.1',mode,'table','application',s,['timezone','schedule']);
 }
 if(mode==='arrival_simple'||mode==='flight_local'){
  const f=flight(mode==='arrival_simple'?(x,y)=>x===KL&&diffZone(x,y):diffZone),local=f.t+f.dur;
  return mark(q(tripRows([['Berlepas',f.a.name,gmtLabel(f.a.offset),j24(f.t)],['Tiba',f.b.name,gmtLabel(f.b.offset),'?']])+'Penerbangan mengambil masa '+durationLabel(f.dur)+'. Apakah waktu tiba di '+f.b.name+'?',j24(f.arr),distinct(j24(f.arr),[j24(norm(local)),j24(norm(local-(f.b.offset-f.a.offset))),j24(norm(f.arr+60))],'time'),'Tambah tempoh penerbangan, kemudian laraskan beza zon waktu.','Tahun 6 · Waktu Ketibaan'),id,'4.2.1',mode,'table',mode==='arrival_simple'?'application':(stage(s)===3?'reasoning':'application'),s,['timezone','duration']);
 }
 if(mode==='video_call_12h'){
  const [a,b]=pair(diffZone),t=anyTime(420,1380),local=t+(b.offset-a.offset),di=rand(0,6),day=DAYS[(di+dayShift(local)+7)%7],[x,y]=who(2);
  const ans=j12(norm(local))+', '+day,wrongDay=DAYS[(di+dayShift(local)+(dayShift(local)?0:1)+7)%7];
  return mark(q(zoneRows([[a.name,gmtLabel(a.offset),j12(t),DAYS[di]],[b.name,gmtLabel(b.offset),'?','?']],'Hari')+x+' di '+a.name+' membuat panggilan video kepada '+y+' di '+b.name+'. Apakah waktu dan hari di '+b.name+'?',ans,distinct(ans,[j12(norm(t-(b.offset-a.offset)))+', '+DAYS[di],j12(norm(local+720))+', '+day,j12(norm(local))+', '+wrongDay],'timezone_direction'),'Banding nilai GMT; semak sama ada hari bertukar.','Tahun 6 · Panggilan Video Antarabangsa'),id,'4.2.1',mode,'table',stage(s)===3?'reasoning':'application',s,['timezone','schedule']);
 }
 if(mode==='schedule_table'){
  let a,b,c,t,tb,tc;do{[a,b]=pair(diffZone);c=choose(zones);t=anyTime(480,1200);tb=t+(b.offset-a.offset);tc=t+(c.offset-a.offset)}while(c.offset===a.offset||c.offset===b.offset||c.name===b.name||tb<0||tb>=1440||tc<0||tc>=1440);
  const ans=b.name+' '+j24(tb)+', '+c.name+' '+j24(tc);
  return mark(q(zoneRows([[a.name,gmtLabel(a.offset),j24(t)],[b.name,gmtLabel(b.offset),'?'],[c.name,gmtLabel(c.offset),'?']])+'Satu acara bermula serentak di tiga bandar. Apakah waktunya di '+b.name+' dan di '+c.name+'?',ans,distinct(ans,[b.name+' '+j24(norm(t-(b.offset-a.offset)))+', '+c.name+' '+j24(norm(t-(c.offset-a.offset))),b.name+' '+j24(t)+', '+c.name+' '+j24(t),b.name+' '+j24(norm(tb+60))+', '+c.name+' '+j24(norm(tc-60)),b.name+' '+j24(tc)+', '+c.name+' '+j24(tb),b.name+' '+j24(norm(tb-60))+', '+c.name+' '+j24(norm(tc+60))],'timezone_direction'),'Kira setiap bandar daripada waktu '+a.name+'.','Tahun 6 · Jadual Zon Waktu'),id,'4.2.1',mode,'table',stage(s)===3?'reasoning':'application',s,['timezone','table']);
 }
 if(mode==='day_change_problem'){
  const [a,b]=pair((x,y)=>y.offset>x.offset&&y.offset-x.offset<=180),dur=rand(1,3)*60+choose([0,30]),d=b.offset-a.offset,t=rand(Math.ceil((1440-d-dur)/5),Math.floor((1439-d)/5))*5,end=t+dur+d,what=choose(['Siaran langsung','Perlawanan bola sepak','Konsert amal','Pertandingan catur']);
  const ans=j24(norm(end))+(end>=1440?' hari berikutnya':' hari yang sama');
  return mark(q(tripRows([['Bermula',a.name,gmtLabel(a.offset),j24(t)],['Tamat',b.name,gmtLabel(b.offset),'?']])+what+' itu berlangsung selama '+durationLabel(dur)+'. Apakah waktu ia tamat di '+b.name+'?',ans,distinct(ans,[j24(norm(end))+(end>=1440?' hari yang sama':' hari berikutnya'),j24(norm(end-60))+(end-60>=1440?' hari berikutnya':' hari yang sama'),j24(norm(t+dur))+(t+dur>=1440?' hari berikutnya':' hari yang sama'),j24(norm(end+60))+(end+60>=1440?' hari berikutnya':' hari yang sama')],'day_change'),'Tukar waktu mula ke waktu '+b.name+', kemudian tambah tempoh.','Tahun 6 · Tempoh dan Pertukaran Hari'),id,'4.2.1',mode,'table',stage(s)===3?'reasoning':'application',s,['timezone','duration','day_change']);
 }
 if(mode==='departure_reverse'){
  const f=flight(diffZone),local=f.arr-(f.b.offset-f.a.offset);
  return mark(q(tripRows([['Berlepas',f.a.name,gmtLabel(f.a.offset),'?'],['Tiba',f.b.name,gmtLabel(f.b.offset),j24(f.arr)]])+'Penerbangan mengambil masa '+durationLabel(f.dur)+'. Apakah waktu berlepas di '+f.a.name+'?',j24(f.t),distinct(j24(f.t),[j24(norm(f.arr-f.dur)),j24(norm(local)),j24(norm(f.arr-f.dur+(f.b.offset-f.a.offset)))],'time'),'Tukar waktu tiba ke waktu '+f.a.name+', kemudian tolak tempoh penerbangan.','Tahun 6 · Waktu Berlepas'),id,'4.2.1',mode,'table','reasoning',s,['timezone','duration','inverse']);
 }
 if(mode==='two_leg'){
  let a,mid,b,t,l1,w,l2,arr;do{[a,b]=pair(diffZone);mid=choose(zones);t=anyTime(300,900);l1=rand(1,4)*60;w=rand(1,3)*60;l2=rand(2,6)*60;arr=t+l1+w+l2+(b.offset-a.offset)}while(mid.name===a.name||mid.name===b.name||arr<0||arr>=1440);
  const name=who(),tot=l1+w+l2;
  return mark(q(table(['Perjalanan','Tempoh'],[[a.name+' → '+mid.name,durationLabel(l1)],['Menunggu di '+mid.name,durationLabel(w)],[mid.name+' → '+b.name,durationLabel(l2)]])+tripRows([['Bertolak',a.name,gmtLabel(a.offset),j24(t)],['Tiba',b.name,gmtLabel(b.offset),'?']])+'Apakah waktu keluarga '+name+' tiba di '+b.name+'?',j24(arr),distinct(j24(arr),[j24(norm(t+tot)),j24(norm(arr-w)),j24(norm(t+tot-(b.offset-a.offset)))],'time'),'Jumlah tempoh '+durationLabel(tot)+'; kemudian laraskan beza zon waktu.','Tahun 6 · Perjalanan Pelbagai Bahagian'),id,'4.2.1',mode,'table','reasoning',s,['timezone','multi_step']);
 }
 const [a,b]=pair((x,y)=>y.offset>x.offset&&y.offset-x.offset<=180),dur=rand(2,5)*60,d=b.offset-a.offset,t=rand(Math.ceil((1440-dur-d)/5),Math.floor((1439-dur)/5))*5,arr=t+dur+d,name=who(),ok=choose([true,false]);
 const shown=ok?norm(arr):norm(t+dur),label=j24(shown)+(ok?(arr>=1440?' (hari berikutnya)':''):(t+dur>=1440?' (hari berikutnya)':'')),res=ok?'betul':'salah, tiba '+j24(norm(arr))+(arr>=1440?' hari berikutnya':'');
 return mark(q(tripRows([['Berlepas',a.name,gmtLabel(a.offset),j24(t)],['Tiba',b.name,gmtLabel(b.offset),label]])+'Penerbangan mengambil masa '+durationLabel(dur)+'. '+name+' mengisi waktu tiba seperti dalam jadual. Adakah '+name+' betul?',res,distinct(res,[ok?'salah, tiba '+j24(norm(t+dur)):'betul','salah, tiba '+j24(norm(arr+60)),'salah, tiba '+j24(norm(arr-d-60))],'time'),'Tambah tempoh, kemudian laraskan beza zon waktu.','Tahun 6 · Menilai Jadual Perjalanan'),id,'4.2.1',mode,'table','reasoning',s,['timezone','reasoning']);
};

// Measurement relations: each pairs two measures through a constant rate.
const REL=[
 {kind:'length_mass',thing:'Kabel',x:'Panjang',xu:'m',y:'Jisim',yu:'kg',yq:'jisim',xq:'panjang',xs:[2,3,4,5,6],rate:[0.15,0.2,0.25,0.3,0.4,0.6]},
 {kind:'length_mass',thing:'Paip',x:'Panjang',xu:'m',y:'Jisim',yu:'kg',yq:'jisim',xq:'panjang',xs:[2,4,5,8],rate:[0.35,0.45,0.5,0.75]},
 {kind:'length_liquid',thing:'Kain',x:'Panjang',xu:'m',y:'Pewarna',yu:'ℓ',yq:'isi padu pewarna',xq:'panjang',count:'helai kain sepanjang',xs:[2,3,4,5],rate:[0.2,0.25,0.3,0.4]},
 {kind:'length_liquid',thing:'Reben',x:'Panjang',xu:'m',y:'Gam',yu:'mℓ',yq:'isi padu gam',xq:'panjang',count:'gulung reben sepanjang',xs:[2,4,5,10],rate:[15,20,25,40]},
 {kind:'length_liquid',thing:'Dinding',x:'Luas',xu:'m²',y:'Cat',yu:'ℓ',yq:'isi padu cat',xq:'luas',count:'dinding seluas',xs:[4,5,6,8,10],rate:[0.1,0.2,0.25,0.5]},
 {kind:'mass_liquid',thing:'Botol minyak',x:'Isi padu',xu:'ℓ',y:'Jisim',yu:'kg',yq:'jisim',xq:'isi padu',xs:[1.5,2,2.5,3],rate:[0.8,0.9]},
 {kind:'mass_liquid',thing:'Balang madu',x:'Isi padu',xu:'ℓ',y:'Jisim',yu:'kg',yq:'jisim',xq:'isi padu',xs:[0.5,1,1.5,2],rate:[1.4,1.5]},
 {kind:'mass_liquid',thing:'Bekas susu',x:'Isi padu',xu:'ℓ',y:'Jisim',yu:'kg',yq:'jisim',xq:'isi padu',xs:[1,2,2.5,4],rate:[1.03,1.04]}
];
// Keep every shown value to at most two decimal places, as in primary-school items.
const twoDp=v=>Math.abs(v*100-Math.round(v*100))<1e-6;
function relation(kind){let r,x1,rate,k,x2,y1,y2;do{r=choose(REL.filter(x=>!kind||x.kind===kind));x1=choose(r.xs);rate=choose(r.rate);k=choose([2,3,4,1.5,2.5]);x2=tidy(x1*k,4);y1=tidy(x1*rate,4);y2=tidy(x2*rate,4)}while(![x2,y1,y2].every(twoDp));return {r,x1,x2,y1,y2,rate,k}}
const u=(v,unit)=>v+' '+unit;
GEN['5.1.1']=function(id,s){
 const mode=chooseMode(id,'5.1.1',bandModes(
  s,
  ['length_mass_direct','length_liquid_direct','mass_liquid_direct','unit_rate'],
  ['length_mass_direct','length_mass_inverse','length_liquid_direct','mass_liquid_direct','unit_rate','table_compare','resource_limit'],
  ['length_mass_inverse','length_liquid_inverse','mass_liquid_inverse','table_compare','resource_limit','measurement_claim','multi_relation']
 ));
 const kind=(mode.match(/^(length_mass|length_liquid|mass_liquid)/)||[])[1]||(mode==='resource_limit'?'length_liquid':null),R=relation(kind),{r}=R,head=[r.thing,r.x,r.y];
 if(/_direct$/.test(mode)){
  const prompt=table(head,[['A',u(R.x1,r.xu),u(R.y1,r.yu)],['B',u(R.x2,r.xu),'?']])+r.thing+' A dan '+r.thing+' B adalah sama jenis. Berapakah '+r.yq+', dalam '+r.yu+', bagi '+r.thing+' B?';
  return mark(q(prompt,u(R.y2,r.yu),distinct(u(R.y2,r.yu),[u(R.y1,r.yu),u(tidy(R.y1+R.k,3),r.yu),u(tidy(R.y2+1,3),r.yu),u(tidy(R.y2/10,4),r.yu)],'unit'),R.x2+' ÷ '+R.x1+' = '+R.k+'; darab '+R.y1+' dengan '+R.k+'.','Tahun 6 · Perkaitan Ukuran'),id,'5.1.1',mode,'table','application',s,['measure_relation']);
 }
 if(/_inverse$/.test(mode)){
  const prompt=table(head,[['A',u(R.x1,r.xu),u(R.y1,r.yu)],['B','?',u(R.y2,r.yu)]])+r.thing+' A dan '+r.thing+' B adalah sama jenis. Berapakah '+r.xq+' '+r.thing+' B?';
  return mark(q(prompt,u(R.x2,r.xu),distinct(u(R.x2,r.xu),[u(R.x1,r.xu),u(tidy(R.x2+R.x1,2),r.xu),u(tidy(R.x2-1,2),r.xu)],'unit'),R.y2+' ÷ '+R.y1+' = '+R.k+'; darab '+R.x1+' dengan '+R.k+'.','Tahun 6 · Perkaitan Ukuran Songsang'),id,'5.1.1',mode,'table','reasoning',s,['measure_relation','inverse']);
 }
 if(mode==='unit_rate'){const one=r.xu==='ℓ'?'1 ℓ':'1 '+r.xu;return mark(q(table(head,[['A',u(R.x1,r.xu),u(R.y1,r.yu)]])+'Berapakah '+r.yq+' bagi setiap '+one+'?',u(R.rate,r.yu),distinct(u(R.rate,r.yu),[u(tidy(R.x1/R.y1,2),r.yu),u(tidy(R.y1*R.x1,3),r.yu),u(tidy(R.rate*10,2),r.yu)],'unit_rate'),R.y1+' ÷ '+R.x1+' = '+R.rate+'.','Tahun 6 · Kadar Unit Ukuran'),id,'5.1.1',mode,'table',stage(s)===1?'application':'application',s,['unit_rate']);}
 if(mode==='table_compare'){
  let rb;do rb=choose(r.rate);while(rb===R.rate&&r.rate.length>1);
  const xb=choose(r.xs.filter(x=>x!==R.x1))||R.x1+1,yb=tidy(xb*rb,3),ans=R.rate<rb?'A':rb<R.rate?'B':'sama';
  return mark(q(table(['Pilihan',r.x,r.y],[['A',u(R.x1,r.xu),u(R.y1,r.yu)],['B',u(xb,r.xu),u(yb,r.yu)]])+'Pilihan manakah mempunyai '+r.yq+' lebih rendah bagi setiap 1 '+r.xu+'?',ans,distinct(ans,['A','B','sama','tidak boleh dibanding'],'rate'),'A = '+R.rate+' '+r.yu+'; B = '+rb+' '+r.yu+' bagi setiap 1 '+r.xu+'.','Tahun 6 · Membanding Perkaitan Ukuran'),id,'5.1.1',mode,'table',stage(s)===3?'reasoning':'application',s,['rate','compare']);
 }
 if(mode==='resource_limit'){
  const n=rand(2,6),have=tidy(R.y1*n+R.y1*choose([0.2,0.4,0.6,0.8]),2);
  return mark(q(table(['Butiran','Nilai'],[[r.y+' bagi setiap '+u(R.x1,r.xu)+' '+r.thing.toLowerCase(),u(R.y1,r.yu)],[r.y+' yang ada',u(have,r.yu)]])+'Berapakah bilangan '+r.count+' '+u(R.x1,r.xu)+' yang dapat disiapkan sepenuhnya?',n,distinct(n,[n+1,n-1,tidy(have/R.y1,1)],'unit'),have+' ÷ '+R.y1+' = '+tidy(have/R.y1,2)+'; ambil bahagian nombor bulat sahaja.','Tahun 6 · Had Sumber Ukuran'),id,'5.1.1',mode,'table',stage(s)===3?'reasoning':'application',s,['limit']);
 }
 if(mode==='measurement_claim'){
  const name=who(),ok=choose([true,false]),said=ok?R.y2:tidy(R.y1+R.x2-R.x1,3),res=ok?'betul':'salah, '+u(R.y2,r.yu);
  return mark(q(table(head,[['A',u(R.x1,r.xu),u(R.y1,r.yu)],['B',u(R.x2,r.xu),u(said,r.yu)]])+name+' mengisi '+r.yq+' '+r.thing+' B seperti dalam jadual. Adakah '+name+' betul?',res,distinct(res,[ok?'salah, '+u(tidy(R.y2+0.5,3),r.yu):'betul','salah, '+u(R.y1,r.yu),'tidak boleh ditentukan'],'unit'),'Kadar '+R.rate+' '+r.yu+' bagi setiap 1 '+r.xu+'.','Tahun 6 · Menilai Perkaitan Ukuran'),id,'5.1.1',mode,'table','reasoning',s,['measure_relation','error_analysis']);
 }
 // length -> paint volume -> paint mass
 const len=choose([2,3,4,5]),vol=choose([0.5,0.75,1,1.5]),per=choose([0.25,0.5]),mPer=choose([0.2,0.3,0.4]),want=len*choose([2,3,4]),ans=tidy(want/len*vol/per*mPer,3);
 return mark(q(table(['Butiran','Nilai'],[['Pewarna bagi '+len+' m kain',vol+' ℓ'],['Jisim setiap '+per+' ℓ pewarna',mPer+' kg']])+'Berapakah jisim pewarna, dalam kg, untuk '+want+' m kain?',ans+' kg',distinct(ans+' kg',[tidy(ans/2,3)+' kg',tidy(ans*1.5,3)+' kg',tidy(want/len*vol,3)+' kg'],'unit'),'Cari isi padu pewarna untuk '+want+' m dahulu, kemudian jisimnya.','Tahun 6 · Perkaitan Ukuran Pelbagai Langkah'),id,'5.1.1',mode,'table','reasoning',s,['measure_relation','multi_step']);
};

document.documentElement?.setAttribute('data-y6-v2-unit45','3.61.0');
})();
