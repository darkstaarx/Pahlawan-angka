// Darjah 2 Topic 2 question generators.
window.PAQuestionBanks = window.PAQuestionBanks || {};
window.PAQuestionBanks.d2t2 = function(id,s,shift){
if(id==="D2.2.1"){let a=R(100,650),b=R(20,300),c=Math.random()<.35?R(10,100):0,ans=a+b+c;return Q(`${a} + ${b}${c?` + ${c}`:""} = ?`,ans,addDistractors(a,b+c,ans),"Pisahkan ratus, puluh dan sa.","D2 Core · Tambah",true,shift)}
if(id==="D2.2.2"){let a=R(300,999),b=R(20,Math.min(400,a-1)),ans=a-b;return Q(`${a} − ${b} = ?`,ans,[N(ans+10,"same_end"),N(Math.abs((a%10)-(b%10)),"units_only"),N(a+b,"operation")],"Tolak mengikut nilai tempat.","D2 Core · Tolak",true,shift)}
if(id==="D2.2.3"){let a=R(2,9),b=R(2,10),ans=a*b;return Q(`${a} × ${b} = ?`,ans,[N(a+b,"operation"),N(ans+a,"fact"),N(Math.max(1,ans-b),"fact")],"Fikir kumpulan sama banyak.","D2 Core · Darab",true,shift)}
if(id==="D2.2.4"){let b=R(2,9),ans=R(2,10),a=b*ans;return Q(`${a} ÷ ${b} = ?`,ans,[N(b,"operation"),N(ans+1,"division"),N(Math.max(1,ans-1),"division")],"Berapa kumpulan sama banyak?","D2 Core · Bahagi",true,shift)}
if(id==="D2.2.5"){let a=R(40,120),b=R(2,9),ans=a-b;return Q(`Ali ada ${a} kad dan memberi ${b} kad. Baki?`,ans,[N(a+b,"operation"),N(b,"operation"),N(ans+10,"same_end")],"Perkataan 'memberi' mengurangkan jumlah.","D2 Core · Masalah",true,true)}
 return null;
};
