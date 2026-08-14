// Darjah 2 Topic 1 — Nombor. Phase 3.4 Cikgu Wajar repair.
window.PAQuestionBanks = window.PAQuestionBanks || {};
window.PAQuestionBanks.d2t1 = function(id,s,shift){
 const mastery=Number(s?.mastery||0);
 if(id==="D2.1.1"){
   const mode=pick(['compare','symbol','blocks']);
   if(mode==='blocks'){
     const n=R(101,999);return Q(`${base10Visual(n)}Apakah nombor yang ditunjukkan oleh blok nilai tempat?`,n,[N(n+10,'place'),N(Math.max(100,n-100),'place'),N(reverseN(n),'place')],"Kira ratus, puluh dan sa.","D2 Core · Nilai Nombor",true,true);
   }
   let a=R(100,999),b=R(100,999);while(b===a)b=R(100,999);
   if(mode==='symbol'){
     const ans=a>b?'>':'<';return Q(`<b>${a}</b> ___ <b>${b}</b><br>Simbol manakah betul?`,ans,[N(ans==='>'?'<':'>','compare'),N('=','compare'),N('≠','compare')],"Banding ratus dahulu, kemudian puluh dan sa.","D2 Core · Banding Nombor",true,shift);
   }
   const ask=Math.random()<.5?'lebih besar':'lebih kecil',ans=ask==='lebih besar'?Math.max(a,b):Math.min(a,b);
   return Q(`Antara <b>${a}</b> dan <b>${b}</b>, yang manakah ${ask}?`,ans,[N(ans===a?b:a,'compare'),N(Math.abs(a-b),'operation'),N((a+b)%1000,'generic')],"Banding nilai nombor dari kiri.","D2 Core · Nilai Nombor",true,shift);
 }
 if(id==="D2.1.2"){
   const n=R(101,999);
   if(Math.random()<.5)return Q(`Pilih angka bagi nombor:<br><b>${words(n)}</b>`,n,[N(n+10,'place'),N(Math.max(0,n-100),'place'),N(reverseN(n),'place')],"Baca ratus, puluh dan sa.","D2 Core · Menulis Nombor",false,true);
   const ans=words(n);const wrong=[n+10,Math.max(101,n-10),reverseN(n)].map(x=>N(words(x),'place'));
   return Q(`Bagaimanakah <b>${n}</b> ditulis dalam perkataan?`,ans,wrong,"Sebut nilai ratus, puluh dan sa mengikut urutan.","D2 Core · Menulis Nombor",false,true);
 }
 if(id==="D2.1.3"){
   const step=pick([1,2,5,10,100]),dir=Math.random()<.5?1:-1;let start=dir>0?R(100,999-step*4):R(100+step*4,999);
   const seq=Array.from({length:5},(_,i)=>start+dir*step*i),miss=R(1,3),ans=seq[miss];
   const shown=seq.map((v,i)=>i===miss?'___':v).join(', ');
   return Q(`Lengkapkan rangkaian nombor:<br><b>${shown}</b>`,ans,[N(ans+step,'pattern'),N(ans-step,'pattern'),N(ans+dir,'pattern')],"Cari beza yang sama antara nombor bersebelahan.","D2 Core · Rangkaian",true,shift);
 }
 if(id==="D2.1.4"){
   const n=uniqueDigitNumber(3),str=String(n),r=+str[0],t=+str[1],o=+str[2],mode=R(0,4);
   if(mode===0){const pos=R(0,2),d=+str[pos],ans=d*Math.pow(10,2-pos),place=['ratus','puluh','sa'][pos];return Q(`Apakah nilai digit <b>${d}</b> pada tempat <b>${place}</b> dalam <b>${n}</b>?`,ans,[N(d,'digit_value'),N(pos===0?d*10:pos===1?d:d*10,'place'),N(ans+10,'place')],"Nama tempat menunjukkan berapa nilai digit itu.","D2 Core · Nilai Tempat",true,true)}
   if(mode===1){const pos=R(0,2),d=+str[pos],ans=['ratus','puluh','sa'][pos],wrong=['ratus','puluh','sa'].filter(x=>x!==ans);return Q(`Digit <b>${d}</b> dalam <b>${n}</b> berada pada tempat apa?`,ans,[N(wrong[0],'place'),N(wrong[1],'place'),N('ribuan','place')],"Baca kedudukan dari kanan: sa, puluh, ratus.","D2 Core · Nilai Tempat",true,true)}
   if(mode===2){const vals=[r*100,t*10,o],ans=vals.filter(v=>v>0).join(' + ')||'0';return Q(`Cerakinkan <b>${n}</b> mengikut nilai digit.`,ans,[N(`${r} + ${t} + ${o}`,'digit_value'),N(`${r*10} + ${t*100} + ${o}`,'place'),N(`${r*100} + ${t} + ${o*10}`,'place')],"Tulis hanya nilai tempat yang sebenar; elakkan '+ 0' jika digitnya sifar.","D2 Core · Cerakin",true,true)}
   if(mode===3){const vals=[r*100,t*10,o],hide=R(0,2),ans=vals[hide],parts=vals.map((v,i)=>i===hide?'___':v).filter((v,i)=>v!==0||i===hide).join(' + ');return Q(`<b>${n}</b> = ${parts}<br>Nilai yang hilang ialah?`,ans,[N(+str[hide],'digit_value'),N(ans+10,'place'),N(Math.max(0,ans-10),'place')],"Gunakan nilai ratus, puluh dan sa.","D2 Core · Cerakin",true,true)}
   return Q(`${base10Visual(n)}Ratus = <b>${r}</b>, puluh = <b>${t}</b>, sa = <b>${o}</b>.<br>Apakah nombornya?`,n,[N(r+t+o,'digit_value'),N(o*100+t*10+r,'place'),N(r*100+o*10+t,'place')],"Gabungkan nilai tempat mengikut kedudukan.","D2 Core · Nilai Tempat",true,true);
 }
 if(id==="D2.1.5"){
   // KSSR 1.5 Menganggar: estimate a quantity of objects. Keep this distinct from 1.6 Membundar.
   let real=R(23,87);while(real%10===0)real=R(23,87);
   const ans=Math.round(real/10)*10;
   const candidates=[ans-20,ans+20,ans-10,ans+10,ans-30,ans+30]
     .filter(v=>v>=10&&v<=100&&v!==ans);
   const wrong=[];for(const v of candidates){if(!wrong.some(x=>x.v===v))wrong.push(N(v,'estimate'));if(wrong.length===3)break}
   return Q(`${dotsEstimateVisual(real)}Anggarkan bilangan objek dalam gambar. Pilih anggaran yang paling munasabah.`,ans,wrong,
     "Anggaran ialah nilai hampir. Lihat keseluruhan kumpulan dan bandingkan dengan kumpulan kira-kira 10 objek; tidak perlu mencari bilangan tepat.",
     "D2 Core · Menganggar Bilangan Objek",true,true);
 }
 if(id==="D2.1.6"){
   const toHundred=mastery>45&&Math.random()<.5;
   if(toHundred){const n=R(101,949),ans=Math.round(n/100)*100,lo=Math.floor(n/100)*100,hi=lo+100;return Q(`${numberLineSvg(lo,hi,10,n)}Bundarkan <b>${n}</b> kepada ratus terdekat.`,ans,[N(lo,'round'),N(hi,'round'),N(Math.round(n/10)*10,'round')],"Lihat kedudukan nombor pada garis nombor. 50 atau lebih dibundarkan naik.","D2 Core · Bundar Ratus",true,true)}
   const n=R(101,994),ans=Math.round(n/10)*10,lo=Math.floor(n/10)*10,hi=lo+10;return Q(`${numberLineSvg(lo,hi,1,n)}Bundarkan <b>${n}</b> kepada puluh terdekat.`,ans,[N(lo,'round'),N(hi,'round'),N(Math.round(n/100)*100,'round')],"Lihat digit sa atau kedudukan pada garis nombor.","D2 Core · Bundar Puluh",true,true);
 }
 if(id==="D2.1.7"){
   const step=pick([2,5,10,20,50,100]),dir=Math.random()<.5?1:-1,start=dir>0?R(100,999-step*3):R(100+step*3,999),seq=Array.from({length:4},(_,i)=>start+dir*step*i);
   if(Math.random()<.5)return Q(`Apakah aturan bagi pola ini?<br><b>${seq.join(', ')}</b>`,`${dir>0?'tambah':'tolak'} ${step}`,[N(`${dir>0?'tambah':'tolak'} ${step===100?10:step+1}`,'pattern'),N(`${dir>0?'tolak':'tambah'} ${step}`,'pattern'),N(`${dir>0?'tambah':'tolak'} 1`,'pattern')],"Banding dua nombor bersebelahan untuk cari aturan.","D2 Core · Pola",true,true);
   const ans=seq[3]+dir*step;return Q(`${seq.join(', ')}, ?`,ans,[N(ans-dir*step,'pattern'),N(ans+dir*step,'pattern'),N(ans+dir,'pattern')],"Gunakan aturan yang sama pada setiap langkah.","D2 Core · Pola",true,shift);
 }
 if(id==="D2.1.8"){
   const mode=pick(['add','sub','compare']);
   if(mode==='add'){const a=R(120,500),b=R(30,300),ans=a+b;return Q(`Perpustakaan mempunyai <b>${a}</b> buku. Sebanyak <b>${b}</b> buku baharu diterima. Berapakah jumlah buku sekarang?`,ans,addDistractors(a,b,ans),"Perkataan 'diterima' menambah jumlah.","D2 Application · Masalah Nombor",true,true)}
   if(mode==='sub'){const a=R(350,900),b=R(40,a-100),ans=a-b;return Q(`Sebuah kedai mempunyai <b>${a}</b> pensel. Sebanyak <b>${b}</b> telah dijual. Berapa yang tinggal?`,ans,[N(a+b,'operation'),N(b,'operation'),N(ans+10,'same_end')],"'Tinggal' selepas dijual memerlukan operasi tolak.","D2 Application · Masalah Nombor",true,true)}
   const a=R(120,900),b=R(120,900),ans=Math.abs(a-b);return Q(`Kelas A mengumpul <b>${a}</b> penutup botol dan Kelas B mengumpul <b>${b}</b>. Berapakah beza bilangan yang dikumpul?`,ans,[N(a+b,'operation'),N(Math.max(a,b),'compare'),N(Math.min(a,b),'compare')],"Beza bermaksud nilai besar tolak nilai kecil.","D2 Application · Masalah Nombor",true,true);
 }
 return null;
};
