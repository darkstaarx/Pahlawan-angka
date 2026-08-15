// Darjah 1 prerequisite recovery generators.
window.PAQuestionBanks = window.PAQuestionBanks || {};
window.PAQuestionBanks.d1 = function(id,s,shift){
if(id==="D1.N20"||id==="D1.N100"){
 let max=id==="D1.N20"?20:100,a=R(1,max),b=R(1,max);while(b===a)b=R(1,max);
 let larger=Math.max(a,b),smaller=Math.min(a,b),askLarger=R(0,1)===0;
 return Q(askLarger?`Pilih nombor yang lebih besar.`:`Pilih nombor yang lebih kecil.`,askLarger?larger:smaller,
  [N(askLarger?smaller:larger,"compare"),N(Math.min(max,larger+1),"compare"),N(Math.max(1,smaller-1),"compare")],
  "Bandingkan nilai kedua-dua nombor.","Recovery",false,shift)
}
if(id==="D1.PV100"){
  let n=uniqueDigitNumber(2),str=String(n),tens=+str[0],ones=+str[1],mode=R(0,3);
  if(mode===0){let pos=R(0,1),d=+str[pos],ans=pos===0?d*10:d,place=pos===0?"puluh":"sa";return Q(`Apakah nilai digit <b>${d}</b> pada tempat <b>${place}</b> dalam <b>${n}</b>?`,ans,[N(d,"digit_value"),N(pos===0?d:d*10,"place"),N(ans+10,"place")],"Lihat kedudukan digit dahulu.","Recovery",true,true)}
  if(mode===1){let pos=R(0,1),d=+str[pos],ans=pos===0?"puluh":"sa";return Q(`Digit <b>${d}</b> dalam <b>${n}</b> berada pada tempat apa?`,ans,[N(pos===0?"sa":"puluh","place"),N("ratus","place"),N("ribuan","place")],"Nama tempat menunjukkan kedudukan digit.","Recovery",true,true)}
  if(mode===2){let ans=`${tens*10} + ${ones}`;return Q(`Cerakinkan <b>${n}</b> mengikut nilai digit.`,ans,[N(`${tens} + ${ones}`,"digit_value"),N(`${tens*100} + ${ones}`,"place"),N(`${tens*10} + ${ones*10}`,"place")],"Puluh bernilai ×10, sa kekal nilainya.","Recovery",true,true)}
  let ans=n;return Q(`Puluh = <b>${tens}</b> dan sa = <b>${ones}</b>. Apakah nombornya?`,ans,[N(tens+ones,"digit_value"),N(ones*10+tens,"place"),N(tens*100+ones,"place")],"Gabungkan digit mengikut tempat.","Recovery",true,true)
 }
if(id==="D1.ADD20"||id==="D1.ADD100"){let max=id==="D1.ADD20"?20:100,a=R(1,Math.floor(max*.6)),b=R(1,Math.max(1,max-a)),ans=a+b;return addQ(a,b,ans,"Recovery",shift)}
if(id==="D1.SUB20"||id==="D1.SUB100"){let max=id==="D1.SUB20"?20:100,a=R(Math.floor(max*.4),max),b=R(1,a),ans=a-b;return Q(`${a} − ${b} = ?`,ans,[N(ans+10,"same_end"),N(Math.abs((a%10)-(b%10)),"units_only"),N(a+b,"operation")],"Tolak satu langkah pada satu masa.","Recovery",true,shift)}
if(id==="D1.FRAC"){let den=[2,4][R(0,1)],num=R(1,den-1),ans=`${num}/${den}`;return Q(`${num} daripada ${den} bahagian sama besar dipilih. Pecahan?`,ans,[N(`${den}/${num}`,"fraction"),N(`${Math.max(1,num-1)}/${den}`,"fraction"),N(`${num}/${den+1}`,"fraction")],"Pengangka = bahagian dipilih; penyebut = jumlah bahagian.","Recovery",true,shift)}
if(id==="D1.MONEY"){let a=R(1,10),b=R(1,10),ans=a+b;return Q(`RM${a} + RM${b} = ?`,`RM${ans}`,[N(`RM${Math.max(0,ans-5)}`,"money"),N(`RM${ans+5}`,"money"),N(`${ans} sen`,"money")],"Tambah nilai dan kekalkan unit RM.","Recovery",true,shift)}
if(id==="D1.TIME"){let h=R(1,12),ans=`${h}:00`;return Q(`Jam tepat menunjukkan pukul ${h}. Pilih waktu.`,ans,[N(`${(h%12)+1}:00`,"time"),N(`${h}:30`,"time"),N(`${Math.max(1,h-1)}:00`,"time")],"Jam tepat mempunyai 00 minit.","Recovery",false,shift)}
if(id==="D1.MEASURE"){return Q(`Unit sesuai untuk panjang pensel?`,"cm",[N("kg","unit"),N("L","unit"),N("g","unit")],"Panjang biasanya cm atau m.","Recovery",false,shift)}
if(id==="D1.SHAPE"){return Q(`Bentuk yang mempunyai 3 sisi ialah?`,"segi tiga",[N("bulatan","shape"),N("segi empat","shape"),N("kubus","shape")],"Kira sisi lurus.","Recovery",false,shift)}
if(id==="D1.DATA"){let a=R(2,8),b=R(2,8);return Q(`Data A=${a}, B=${b}. Mana lebih banyak?`,a>b?"A":"B",[N(a>b?"B":"A","data"),N("Sama","data"),N(String(a+b),"operation")],"Banding bilangan A dan B.","Recovery",false,shift)}
if(id==="D1.CMP100"){let a=R(1,100),b=R(1,100);return Q(`Pilih nombor lebih kecil: ${a} atau ${b}`,Math.min(a,b),[N(Math.max(a,b),"compare"),N(a+b,"operation"),N(Math.abs(a-b),"operation")],"Banding puluh dahulu.","Recovery",false,shift)}
 return null;
};
