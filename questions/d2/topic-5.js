// Darjah 2 Topic 5 question generators.
window.PAQuestionBanks = window.PAQuestionBanks || {};
window.PAQuestionBanks.d2t5 = function(id,s,shift){
if(id==="D2.5.1"){let h=R(1,12),m=[0,15,30,45][R(0,3)],ans=`${h}:${String(m).padStart(2,"0")}`;return Q(`Jam menunjukkan ${h} jam ${m} minit. Waktu?`,ans,[N(`${h}:${String((m+15)%60).padStart(2,"0")}`,"time"),N(`${(h%12)+1}:${String(m).padStart(2,"0")}`,"time"),N(`${h}:${String(Math.max(0,m-15)).padStart(2,"0")}`,"time")],"Jam dahulu, minit kemudian.","D2 Core · Masa",true,shift)}
if(id==="D2.5.2"){let d=R(1,4),ans=d*24;return Q(`${d} hari = ? jam`,ans,[N(d*12,"time"),N(d*60,"time"),N(ans+24,"time")],"1 hari = 24 jam.","D2 Core · Masa",true,shift)}
if(id==="D2.5.3"){let h=R(7,10),dur=R(1,3),ans=h+dur;return Q(`Aktiviti mula ${h}:00 dan berlangsung ${dur} jam. Tamat?`,`${ans}:00`,[N(`${h}:00`,"time"),N(`${ans+1}:00`,"time"),N(`${Math.max(1,h-dur)}:00`,"time")],"Tambah tempoh kepada waktu mula.","D2 Core · Masalah Masa",true,true)}
 return null;
};
