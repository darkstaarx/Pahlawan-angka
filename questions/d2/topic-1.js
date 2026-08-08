// Darjah 2 Topic 1 question generators.
window.PAQuestionBanks = window.PAQuestionBanks || {};
window.PAQuestionBanks.d2t1 = function(id,s,shift){
if(id==="D2.1.1"){let a=R(100,999),b=R(100,999);return Q(`Yang manakah lebih besar?<br><b>${a}</b> atau <b>${b}</b>`,Math.max(a,b),[N(Math.min(a,b),"compare"),N(a+b,"operation"),N(Math.abs(a-b),"operation")],"Banding ratus, kemudian puluh dan sa.","D2 Core",false,shift)}
if(id==="D2.1.2"){let n=R(101,999);return Q(`Pilih angka bagi nombor:<br><b>${words(n)}</b>`,n,[N(n+10,"place"),N(Math.max(0,n-100),"place"),N(reverseN(n),"place")],"Baca ratus, puluh dan sa.","D2 Core · Representasi",false,true)}
if(id==="D2.1.3"||id==="D2.1.7"){let a=R(100,700),step=[2,5,10,20,50,100][R(0,5)],ans=a+step*3;return Q(`${a}, ${a+step}, ${a+2*step}, ?`,ans,[N(ans-step,"pattern"),N(ans+step,"pattern"),N(a+3,"pattern")],"Cari beza tetap.","D2 Core · Pola",false,shift)}
if(id==="D2.1.4"){
  let n=uniqueDigitNumber(3),str=String(n),r=+str[0],p=+str[1],s=+str[2],mode=R(0,4);
  if(mode===0){let pos=R(0,2),d=+str[pos],pow=2-pos,ans=d*Math.pow(10,pow),place=["ratus","puluh","sa"][pos];return Q(`Apakah nilai digit <b>${d}</b> pada tempat <b>${place}</b> dalam <b>${n}</b>?`,ans,[N(d,"digit_value"),N(pos===0?d*10:pos===1?d:d*10,"place"),N(ans+100,"place")],"Kenal pasti tempat digit dahulu, kemudian nilainya.","D2 Core",true,true)}
  if(mode===1){let pos=R(0,2),d=+str[pos],ans=["ratus","puluh","sa"][pos],wrong=["ratus","puluh","sa"].filter(x=>x!==ans);return Q(`Digit <b>${d}</b> dalam <b>${n}</b> berada pada tempat apa?`,ans,[N(wrong[0],"place"),N(wrong[1],"place"),N("ribuan","place")],"Nilai tempat ialah nama kedudukan digit.","D2 Core",true,true)}
  if(mode===2){let ans=`${r*100} + ${p*10} + ${s}`;return Q(`Cerakinkan <b>${n}</b> mengikut nilai digit.`,ans,[N(`${r} + ${p} + ${s}`,"digit_value"),N(`${r*10} + ${p*100} + ${s}`,"place"),N(`${r*100} + ${p} + ${s*10}`,"place")],"Ratus ×100, puluh ×10 dan sa kekal nilainya.","D2 Core",true,true)}
  if(mode===3){let hide=R(0,2),vals=[r*100,p*10,s],ans=vals[hide],parts=vals.map((v,i)=>i===hide?"___":v).join(" + ");return Q(`<b>${n}</b> = ${parts}<br>Nilai yang hilang ialah?`,ans,[N(+str[hide],"digit_value"),N(ans+10,"place"),N(Math.max(0,ans-10),"place")],"Lengkapkan cerakin nombor mengikut nilai tempat.","D2 Core",true,true)}
  let ans=n;return Q(`Ratus = <b>${r}</b>, puluh = <b>${p}</b>, sa = <b>${s}</b>.<br>Apakah nombornya?`,ans,[N(r+p+s,"digit_value"),N(s*100+p*10+r,"place"),N(r*100+s*10+p,"place")],"Letakkan setiap digit pada tempat yang betul.","D2 Core",true,true)
 }
if(id==="D2.1.5"){let real=R(25,95),ans=Math.round(real/10)*10;return Q(`Ada kira-kira ${real} objek. Anggaran puluh terdekat yang munasabah?`,ans,[N(ans+30,"estimate"),N(Math.max(0,ans-30),"estimate"),N(real+1,"estimate")],"Anggaran hampir, bukan semestinya tepat.","D2 Core · Anggaran",false,shift)}
if(id==="D2.1.6"){let n=R(101,999),ans=Math.round(n/100)*100;return Q(`Bundarkan <b>${n}</b> kepada ratus terdekat.`,ans,[N(Math.floor(n/100)*100,"round"),N(Math.ceil(n/100)*100+100,"round"),N(Math.round(n/10)*10,"round")],"Lihat digit puluh.","D2 Core · Bundar",true,shift)}
if(id==="D2.1.8"){let a=R(100,500),b=R(20,200),ans=a+b;return Q(`Perpustakaan ada ${a} buku dan menerima ${b} lagi. Jumlah?`,ans,addDistractors(a,b,ans),"Cari operasi daripada cerita.","D2 Core · Masalah",true,true)}
 return null;
};
