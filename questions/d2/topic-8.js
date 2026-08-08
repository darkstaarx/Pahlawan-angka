// Darjah 2 Topic 8 question generators.
window.PAQuestionBanks = window.PAQuestionBanks || {};
window.PAQuestionBanks.d2t8 = function(id,s,shift){
if(id==="D2.8.1"){let a=R(2,8),b=R(2,8),c=R(2,8),ans=a+b+c;return Q(`Data: A=${a}, B=${b}, C=${c}. Jumlah data?`,ans,[N(Math.max(a,b,c),"data"),N(ans+2,"data"),N(Math.max(1,ans-2),"data")],"Tambah semua kekerapan.","D2 Core · Data",true,shift)}
if(id==="D2.8.2"||id==="D2.8.3"){let vals=[R(2,10),R(2,10),R(2,10),R(2,10)],mx=Math.max(...vals),i=vals.indexOf(mx),labs=["A","B","C","D"];return Q(`Carta: A=${vals[0]}, B=${vals[1]}, C=${vals[2]}, D=${vals[3]}. Mana paling tinggi?`,labs[i],labs.filter(x=>x!==labs[i]).slice(0,3).map(x=>N(x,"data")),"Cari nilai paling besar dahulu.","D2 Core · Carta",true,shift)}
 return null;
};
