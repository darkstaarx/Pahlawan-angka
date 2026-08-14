// Darjah 2 Topic 2 — Operasi. Phase 3.4 Cikgu Wajar repair.
window.PAQuestionBanks = window.PAQuestionBanks || {};
window.PAQuestionBanks.d2t2 = function(id,s,shift){
 if(id==="D2.2.1"){
   const three=Math.random()<.42;let a=R(100,650),b=R(20,250),c=three?R(10,100):0;while(a+b+c>1000){a=R(100,550);b=R(20,220);c=three?R(10,90):0}const ans=a+b+c;
   return Q(`${a} + ${b}${three?` + ${c}`:''} = ?`,ans,addDistractors(a,b+c,ans),"Tambah mengikut nilai tempat. Jika 10 sa, tukar kepada 1 puluh.",three?"D2 Application · Tambah 3 Nombor":"D2 Core · Tambah",true,shift);
 }
 if(id==="D2.2.2"){
   const three=Math.random()<.42;let a=R(300,999),b=R(20,Math.min(400,a-20)),c=three?R(10,Math.min(200,a-b)):0;if(a-b-c<0)return window.PAQuestionBanks.d2t2(id,s,shift);const ans=a-b-c;
   return Q(`${a} − ${b}${three?` − ${c}`:''} = ?`,ans,[N(ans+10,'same_end'),N(a+b+c,'operation'),N(Math.max(0,a-b+c),'operation')],"Tolak satu nilai pada satu masa dan semak nilai tempat.",three?"D2 Application · Tolak 2 Nilai":"D2 Core · Tolak",true,shift);
 }
 if(id==="D2.2.3"){
   const timesTen=Math.random()<.28;
   if(timesTen){const a=R(1,9),ans=a*10;return Q(`<b>${a} × 10</b> = ?`,ans,[N(a,'operation'),N(a+10,'fact'),N(ans+10,'fact')],"Darab dengan 10 menghasilkan kumpulan puluh.","D2 Core · Darab dengan 10",true,shift)}
   const a=R(1,9),b=R(1,9),ans=a*b,mode=Math.random()<.5?'symbol':'group';
   if(mode==='group')return Q(`Ada <b>${a}</b> kumpulan. Setiap kumpulan ada <b>${b}</b> objek. Berapakah jumlah objek?`,ans,[N(a+b,'operation'),N(ans+a,'fact'),N(Math.max(1,ans-b),'fact')],"Darab ialah penambahan berulang bagi kumpulan sama banyak.","D2 Core · Fakta Asas Darab",true,true);
   return Q(`${a} × ${b} = ?`,ans,[N(a+b,'operation'),N(ans+a,'fact'),N(Math.max(1,ans-b),'fact')],"Gunakan fakta asas darab. Cuba kaitkan a × b dengan b × a.","D2 Core · Fakta Asas Darab",true,shift);
 }
 if(id==="D2.2.4"){
   const mode=pick(['exact','remainder','ten']);
   if(mode==='ten'){
     const tens=R(1,9),extra=Math.random()<.45?R(1,9):0,total=tens*10+extra,quot=Math.floor(total/10),rem=total%10,ans=rem?`${quot} baki ${rem}`:quot;
     const wrong=rem?[N(quot,'division'),N(`${quot+1} baki ${rem}`,'division'),N(`${quot} baki ${Math.max(0,rem-1)}`,'division')]:[N(10,'division'),N(Math.max(1,quot-1),'division'),N(quot+1,'division')];
     return Q(`<b>${total} ÷ 10</b> = ?`,ans,wrong,"Bentuk kumpulan 10. Yang tidak cukup satu kumpulan penuh ialah baki.","D2 Core · Bahagi dengan 10",true,true);
   }
   const divisor=R(2,9),quot=R(1,9);
   if(mode==='remainder'){
     const rem=R(1,divisor-1),total=divisor*quot+rem,ans=`${quot} baki ${rem}`;
     return Q(`<b>${total}</b> objek dibahagi kepada kumpulan <b>${divisor}</b>. Berapa kumpulan penuh dan berapa baki?`,ans,[N(quot,'division'),N(`${quot+1} baki ${rem}`,'division'),N(`${quot} baki ${Math.max(0,rem-1)}`,'division')],"Cari kumpulan penuh dahulu. Objek yang tinggal ialah baki.","D2 Application · Bahagi Berbaki",true,true);
   }
   const total=divisor*quot;return Q(`${total} ÷ ${divisor} = ?`,quot,[N(divisor,'operation'),N(quot+1,'division'),N(Math.max(1,quot-1),'division')],"Gunakan hubungan songsang darab dan bahagi.","D2 Core · Fakta Asas Bahagi",true,shift);
 }
 if(id==="D2.2.5"){
   const op=pick(['add','sub','mul','div']);
   if(op==='add'){const a=R(80,450),b=R(20,350),ans=a+b;return Q(`Hana ada <b>${a}</b> pelekat. Ibunya memberi <b>${b}</b> lagi. Berapakah jumlah pelekat Hana?`,ans,addDistractors(a,b,ans),"'Memberi lagi' menambah jumlah.","D2 Application · Masalah Tambah",true,true)}
   if(op==='sub'){const a=R(120,800),b=R(20,a-10),ans=a-b;return Q(`Ali ada <b>${a}</b> kad dan memberi <b>${b}</b> kad kepada rakannya. Berapa kad yang tinggal?`,ans,[N(a+b,'operation'),N(b,'operation'),N(ans+10,'same_end')],"'Tinggal' selepas memberi memerlukan tolak.","D2 Application · Masalah Tolak",true,true)}
   if(op==='mul'){const groups=R(2,10),each=R(2,10),ans=groups*each;return Q(`Terdapat <b>${groups}</b> kotak. Setiap kotak mempunyai <b>${each}</b> pensel. Berapakah jumlah pensel?`,ans,[N(groups+each,'operation'),N(ans+groups,'fact'),N(Math.max(1,ans-each),'fact')],"Kumpulan sama banyak menggunakan darab.","D2 Application · Masalah Darab",true,true)}
   const groups=pick([2,4,5,10]),each=R(2,10),total=groups*each;return Q(`<b>${total}</b> gula-gula dibahagi sama rata kepada <b>${groups}</b> murid. Berapa setiap murid dapat?`,each,[N(groups,'operation'),N(each+1,'division'),N(Math.max(1,each-1),'division')],"Bahagi jumlah kepada kumpulan sama rata.","D2 Application · Masalah Bahagi",true,true);
 }
 return null;
};
