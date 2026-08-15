window.PAQuestionBanks = window.PAQuestionBanks || {};
window.PAQuestionBanks.d1 = function(id,s,shift){
 if(id==="D1.N20"||id==="D1.N100"){
   let max=id==="D1.N20"?20:100,values=[];while(values.length<4){let n=R(1,max);if(!values.includes(n))values.push(n)}
   let [a,b]=values,larger=Math.max(a,b),smaller=Math.min(a,b),mode=R(0,3),prompt,answer,wrong;
   if(mode===0){answer=Math.max(...values);prompt=`Pilih nombor yang paling besar.<br><b>${values.join(', ')}</b>`;wrong=values.filter(n=>n!==answer).map(n=>N(n,"compare"))}
   else if(mode===1){answer=Math.min(...values);prompt=`Pilih nombor yang paling kecil.<br><b>${values.join(', ')}</b>`;wrong=values.filter(n=>n!==answer).map(n=>N(n,"compare"))}
   else if(mode===2){prompt=`Isi tempat kosong.<br><b>${smaller} &lt; ___</b>`;answer=larger;wrong=[N(smaller,"compare"),N(Math.max(1,smaller-1),"compare"),N(Math.max(1,smaller-2),"compare")]}
   else{prompt=`Susun nombor daripada kecil kepada besar.<br><b>${a}, ${b}</b>`;answer=`${smaller}, ${larger}`;wrong=[N(`${larger}, ${smaller}`,"compare"),N(`${a}, ${a}`,"compare"),N(`${b}, ${b}`,"compare")]}
   return Q(prompt,answer,wrong,"Bandingkan nilai kedua-dua nombor.","Darjah 1",false,shift)
 }
 if(id==="D1.PV100"){
   let n=uniqueDigitNumber(2),str=String(n),tens=+str[0],ones=+str[1],mode=R(0,4);
   if(mode===0){let pos=R(0,1),d=+str[pos],ans=pos===0?d*10:d,place=pos===0?"puluh":"sa";return Q(`Apakah nilai digit <b>${d}</b> pada tempat <b>${place}</b> dalam <b>${n}</b>?`,ans,[N(d,"digit_value"),N(pos===0?d:d*10,"place"),N(ans+10,"place")],"Lihat kedudukan digit dahulu.","Darjah 1",true,true)}
   if(mode===1){let pos=R(0,1),d=+str[pos],ans=pos===0?"puluh":"sa";return Q(`Digit <b>${d}</b> dalam <b>${n}</b> berada pada tempat apa?`,ans,[N(pos===0?"sa":"puluh","place"),N("ratus","place"),N("ribuan","place")],"Nama tempat menunjukkan kedudukan digit.","Darjah 1",true,true)}
   if(mode===2){let ans=`${tens*10} + ${ones}`;return Q(`Cerakinkan <b>${n}</b> mengikut nilai digit.`,ans,[N(`${tens} + ${ones}`,"digit_value"),N(`${tens*100} + ${ones}`,"place"),N(`${tens*10} + ${ones*10}`,"place")],"Puluh bernilai ×10, sa kekal nilainya.","Darjah 1",true,true)}
   if(mode===3){let ans=n;return Q(`Puluh = <b>${tens}</b> dan sa = <b>${ones}</b>. Apakah nombornya?`,ans,[N(tens+ones,"digit_value"),N(ones*10+tens,"place"),N(tens*100+ones,"place")],"Gabungkan digit mengikut tempat.","Darjah 1",true,true)}
   let ans=Math.round(n/10)*10;return Q(`Bundarkan <b>${n}</b> kepada puluh terdekat.`,ans,[N(Math.floor(n/10)*10,"round"),N(Math.ceil(n/10)*10+10,"round"),N(n,"place")],"Lihat digit sa.","Darjah 1",true,true)
 }
 if(id==="D1.CMP100"){let a=R(1,100),b=R(1,100);return Q(`Pilih nombor lebih kecil: <b>${a}</b> atau <b>${b}</b>`,Math.min(a,b),[N(Math.max(a,b),"compare"),N(a+b,"operation"),N(Math.abs(a-b),"operation")],"Banding puluh dahulu.","Darjah 1",false,shift)}
 if(id==="D1.ADD20"||id==="D1.ADD100"){let max=id==="D1.ADD20"?20:100,a=R(1,Math.floor(max*.6)),b=R(1,Math.max(1,max-a)),ans=a+b;return addQ(a,b,ans,"Darjah 1",shift)}
 if(id==="D1.SUB20"||id==="D1.SUB100"){let max=id==="D1.SUB20"?20:100,a=R(Math.floor(max*.4),max),b=R(1,a),ans=a-b;return subQ(a,b,ans,"Darjah 1",shift)}
 if(id==="D1.FRAC"){let den=pick([2,4]),num=R(1,den-1),ans=`${num}/${den}`;return Q(`${fractionVisual(num,den)}Bahagian berlorek mewakili pecahan?`,ans,[N(`${den}/${num}`,"fraction"),N(`${Math.max(1,num-1)}/${den}`,"fraction"),N(`${num}/${den+1}`,"fraction")],"Pengangka = bahagian dipilih; penyebut = jumlah bahagian.","Darjah 1",true,true)}
 if(id==="D1.MONEY"){let a=R(1,10),b=R(1,10),ans=a+b;return Q(`RM${a} + RM${b} = ?`,`RM${ans}`,[N(`RM${Math.max(0,ans-5)}`,"money"),N(`RM${ans+5}`,"money"),N(`${ans} sen`,"money")],"Tambah nilai dan kekalkan unit RM.","Darjah 1",true,shift)}
 if(id==="D1.TIME"){let h=R(1,12),ans=`${h}:00`;return Q(`${clockSvg(h,0)}Jam menunjukkan pukul?`,ans,[N(`${(h%12)+1}:00`,"time"),N(`${h}:30`,"time"),N(`${Math.max(1,h-1)}:00`,"time")],"Jam tepat mempunyai 00 minit.","Darjah 1",false,shift)}
 if(id==="D1.MEASURE"){return Q(`Unit sesuai untuk panjang pensel?`,`cm`,[N("kg","unit"),N("L","unit"),N("g","unit")],"Panjang biasanya cm atau m.","Darjah 1",false,shift)}
 if(id==="D1.SHAPE"){let q=pick([["triangle","segi tiga"],["square","segi empat sama"],["circle","bulatan"]]);return Q(`${shapeSvg(q[0])}Ini bentuk apa?`,q[1],[N("segi empat tepat","shape"),N("kubus","shape"),N(q[1]==="bulatan"?"segi tiga":"bulatan","shape")],"Perhatikan ciri bentuk.","Darjah 1",false,true)}
 if(id==="D1.DATA"){let labels=['A','B','C'],vals=[R(2,6),R(2,6),R(2,6)],mx=Math.max(...vals),ans=labels[vals.indexOf(mx)];return Q(`${barChart(labels,vals)}Palang manakah paling tinggi?`,ans,labels.filter(x=>x!==ans).map(x=>N(x,"data")).concat([N(String(vals.reduce((a,b)=>a+b,0)),"operation")]).slice(0,3),"Cari nilai paling besar pada carta.","Darjah 1",false,true)}
 return null;
};
