// Darjah 2 Topic 3 — Pecahan & Perpuluhan. Phase 3.4 Cikgu Wajar repair.
window.PAQuestionBanks = window.PAQuestionBanks || {};
window.PAQuestionBanks.d2t3 = function(id,s,shift){
 if(id==="D2.3.1"){
   const den=pick([2,3,4,5,6,8,10]),num=R(1,den-1),mode=pick(['visual','name','compare']);
   if(mode==='visual'){const ans=`${num}/${den}`;return Q(`${fractionVisual(num,den)}Bahagian berwarna mewakili pecahan apa?`,ans,fractionWrongChoices(num,den),"Pengangka ialah bahagian berwarna; penyebut ialah jumlah bahagian sama besar.","D2 Core · Pecahan",true,true)}
   if(mode==='name'){const ans=`${num}/${den}`;return Q(`${num} daripada ${den} bahagian sama besar dipilih. Pecahannya ialah?`,ans,fractionWrongChoices(num,den),"Pengangka di atas, penyebut di bawah.","D2 Core · Pecahan",true,shift)}
   const n2=R(1,den-1);if(n2===num)return window.PAQuestionBanks.d2t3(id,s,shift);const f1=`${num}/${den}`,f2=`${n2}/${den}`,ask=Math.random()<.5?'lebih besar':'lebih kecil',ans=ask==='lebih besar'?(num>n2?f1:f2):(num<n2?f1:f2);
   return Q(`<div style="display:flex;justify-content:center;gap:12px">${fractionVisual(num,den)}${fractionVisual(n2,den)}</div>Antara <b>${f1}</b> dan <b>${f2}</b>, pecahan manakah ${ask}?`,ans,[N(ans===f1?f2:f1,'fraction'),N(`${den}/${num}`,'fraction'),N('Sama','fraction')],"Penyebut sama: banding bilangan bahagian berwarna.","D2 Application · Banding Pecahan",true,true);
 }
 if(id==="D2.3.2"){
   const n=R(1,9),mode=pick(['visual','fraction','compare','line']);
   if(mode==='visual'){const ans=(n/10).toFixed(1);return Q(`${decimalTenthsVisual(n)}Bahagian berwarna ditulis sebagai perpuluhan berapa?`,ans,[N(`0.${Math.max(0,n-1)}`,'decimal'),N(`${n}.0`,'decimal'),N(`0.${Math.min(9,n+1)}`,'decimal')],"Satu tempat selepas titik ialah persepuluh.","D2 Core · Perpuluhan",true,true)}
   if(mode==='fraction'){const ans=(n/10).toFixed(1);return Q(`<b>${n}/10</b> = ?`,ans,[N(String(n),'decimal'),N(`${n}.0`,'decimal'),N(`0.${Math.max(0,n-1)}`,'decimal')],"Persepuluh ditulis satu digit selepas titik perpuluhan.","D2 Core · Perpuluhan",true,shift)}
   if(mode==='line'){const ans=(n/10).toFixed(1);return Q(`${numberLineSvg(0,10,1,n)}Titik merah berada pada ${n} daripada 10 bahagian dari 0 ke 1. Nilainya dalam perpuluhan ialah?`,ans,[N(`0.${Math.max(0,n-1)}`,'decimal'),N(`${n}.0`,'decimal'),N(`0.${Math.min(9,n+1)}`,'decimal')],"Setiap satu langkah mewakili 0.1.","D2 Application · Garis Nombor",true,true)}
   let m=R(1,9);while(m===n)m=R(1,9);const a=n/10,b=m/10,ask=Math.random()<.5?'lebih besar':'lebih kecil',ans=(ask==='lebih besar'?Math.max(a,b):Math.min(a,b)).toFixed(1);return Q(`Antara <b>${a.toFixed(1)}</b> dan <b>${b.toFixed(1)}</b>, yang manakah ${ask}?`,ans,[N((ans===a.toFixed(1)?b:a).toFixed(1),'decimal'),N('Sama','decimal'),N('1.0','decimal')],"Banding digit pada tempat persepuluh.","D2 Application · Banding Perpuluhan",true,true);
 }
 if(id==="D2.3.3"){
   const n=R(1,9),frac=`${n}/10`,dec=(n/10).toFixed(1),mode=Math.random()<.5?'equal':'compare';
   if(mode==='equal')return Q(`${fractionVisual(n,10)}Nilai yang sama dengan <b>${frac}</b> ialah?`,dec,[N(`0.${Math.max(0,n-1)}`,'decimal'),N(`${n}.0`,'decimal'),N(`0.${Math.min(9,n+1)}`,'decimal')],"Bahagi keseluruhan kepada 10: ${n} bahagian ialah ${dec}.","D2 Core · Hubungan Pecahan-Perpuluhan",true,true);
   let m=R(1,9);while(m===n)m=R(1,9);const f2=`${m}/10`,d2=(m/10).toFixed(1),ans=n>m?frac:f2;return Q(`Yang manakah lebih besar: <b>${frac}</b> atau <b>${d2}</b>?`,ans,[N(ans===frac?d2:frac,'decimal'),N('Sama','decimal'),N('1.0','decimal')],"Tukar kedua-duanya kepada persepuluh sebelum membanding.","D2 Application · Hubungan",true,true);
 }
 if(id==="D2.3.4"){
   const mode=pick(['shade','drink','ribbon']);
   if(mode==='shade'){const n=R(1,9),ans=(n/10).toFixed(1);return Q(`${fractionVisual(n,10)}Aina mewarnakan <b>${n}</b> daripada 10 bahagian kad. Berapakah bahagian yang diwarnakan dalam bentuk perpuluhan?`,ans,[N(`0.${Math.max(0,n-1)}`,'decimal'),N(`${n}.0`,'decimal'),N(`0.${Math.min(9,n+1)}`,'decimal')],"${n} daripada 10 ialah ${n}/10, kemudian tukar kepada perpuluhan.","D2 Application · Masalah Pecahan",true,true)}
   if(mode==='drink'){const n=R(1,9),ans=`${n}/10`;return Q(`Sebuah botol dibahagi kepada 10 tanda sama besar. Air memenuhi <b>${n}</b> tanda. Apakah pecahan botol yang berisi air?`,ans,fractionWrongChoices(n,10),"Jumlah bahagian ialah 10; bahagian berisi ialah pengangka.","D2 Application · Masalah Pecahan",true,true)}
   const a=R(1,8),b=R(a+1,9),ans=(b/10).toFixed(1);return Q(`Reben A panjangnya <b>${(a/10).toFixed(1)} m</b> dan Reben B <b>${(b/10).toFixed(1)} m</b>. Reben manakah lebih panjang?`,"Reben B",[N('Reben A','decimal'),N('Sama panjang','decimal'),N('Tidak boleh ditentukan','decimal')],"Banding digit persepuluh kedua-dua panjang.","D2 Application · Masalah Perpuluhan",true,true);
 }
 return null;
};
