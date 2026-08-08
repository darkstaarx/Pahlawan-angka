// Darjah 2 Topic 3 question generators.
window.PAQuestionBanks = window.PAQuestionBanks || {};
window.PAQuestionBanks.d2t3 = function(id,s,shift){
if(id==="D2.3.1"){let den=[2,3,4,5,6,8,10][R(0,6)],num=R(1,den-1),ans=`${num}/${den}`;return Q(`${num} daripada ${den} bahagian sama besar dipilih. Pecahannya?`,ans,[N(`${den}/${num}`,"fraction"),N(`${num}/${Math.min(10,den+1)}`,"fraction"),N(`${Math.max(1,num-1)}/${den}`,"fraction")],"Pengangka di atas, penyebut di bawah.","D2 Core · Pecahan",true,shift)}
if(id==="D2.3.2"){let n=R(1,9),ans=(n/10).toFixed(1);return Q(`${n}/10 = ?`,ans,[N(String(n),"decimal"),N(`0.${Math.max(0,n-1)}`,"decimal"),N(`${n}.0`,"decimal")],"Persepuluh = satu tempat selepas titik.","D2 Core · Perpuluhan",true,shift)}
if(id==="D2.3.3"||id==="D2.3.4"){let n=R(1,9),ans=(n/10).toFixed(1);return Q(`Nilai yang sama dengan ${n}/10 ialah?`,ans,[N(`0.${Math.max(0,n-1)}`,"decimal"),N(`${n}.0`,"decimal"),N(`0.${Math.min(9,n+1)}`,"decimal")],"Tukar persepuluh ke perpuluhan.","D2 Core · Hubungan",true,true)}
 return null;
};
