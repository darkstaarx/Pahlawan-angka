// Shared question-generation helpers.
function moneyQ(id,shift){
 let a=R(1,50),b=R(1,40);
 if(id==="D2.4.1")return Q(`Nilai wang manakah bersamaan RM${a}?`,`RM${a}`,[N(`${a} sen`,"money"),N(`RM${a+10}`,"money"),N(`RM${Math.max(1,a-5)}`,"money")],"Semak RM dan sen.","D2 Core · Wang",true,shift);
 if(id==="D2.4.2"){let ans=a+b;return Q(`RM${a} + RM${b} = ?`,`RM${ans}`,[N(`RM${ans+10}`,"same_end"),N(`RM${Math.max(0,ans-10)}`,"same_end"),N(`RM${Math.abs(a-b)}`,"operation")],"Tambah nilai wang.","D2 Core · Wang",true,shift)}
 if(id==="D2.4.3"){if(b>=a)[a,b]=[b+10,a];let ans=a-b;return Q(`RM${a} − RM${b} = ?`,`RM${ans}`,[N(`RM${a+b}`,"operation"),N(`RM${ans+10}`,"same_end"),N(`RM${b}`,"money")],"Cari baki.","D2 Core · Wang",true,shift)}
 if(id==="D2.4.4"){let x=R(1,10),k=[2,3,4,5,10][R(0,4)],ans=x*k;return Q(`RM${x} × ${k} = ?`,`RM${ans}`,[N(`RM${x+k}`,"operation"),N(`RM${ans+x}`,"fact"),N(`RM${k}`,"operation")],"Darab nilai wang.","D2 Core · Wang",true,shift)}
 if(id==="D2.4.5"){let k=[2,4,5,10][R(0,3)],ans=R(1,10),x=k*ans;return Q(`RM${x} ÷ ${k} = ?`,`RM${ans}`,[N(`RM${k}`,"operation"),N(`RM${ans+1}`,"division"),N(`RM${Math.max(1,ans-1)}`,"division")],"Bahagi sama rata.","D2 Core · Wang",true,shift)}
 if(id==="D2.4.6"){let inc=R(10,30),sp=R(1,inc-1),ans=inc-sp;return Q(`Ada RM${inc}, belanja RM${sp}. Boleh simpan?`,`RM${ans}`,[N(`RM${inc+sp}`,"operation"),N(`RM${sp}`,"money"),N(`RM${ans+5}`,"money")],"Simpanan = ada − belanja.","D2 Core · Kewangan",true,shift)}
 let pay=[50,100][R(0,1)],price=R(5,pay-5),ans=pay-price;return Q(`Harga RM${price}, bayar RM${pay}. Baki?`,`RM${ans}`,[N(`RM${price}`,"money"),N(`RM${pay+price}`,"operation"),N(`RM${ans+10}`,"same_end")],"Baki = bayaran − harga.","D2 Core · Masalah Wang",true,true)
}

function shape3DQ(shift){let x=[["kubus","6 muka sama besar"],["kuboid","6 muka segi empat"],["silinder","2 muka bulat"],["sfera","tiada muka rata"]][R(0,3)],all=["kubus","kuboid","silinder","sfera"];return Q(`Bentuk 3D: <b>${x[1]}</b>`,x[0],all.filter(y=>y!==x[0]).map(y=>N(y,"shape")).slice(0,3),"Padankan ciri bentuk.","D2 Core · Ruang",false,shift)}

function shape2DQ(shift){let x=[["segi tiga",3],["segi empat sama",4],["segi lima",5]][R(0,2)],all=["segi tiga","segi empat sama","segi lima","bulatan"];return Q(`Bentuk 2D yang mempunyai ${x[1]} sisi?`,x[0],all.filter(y=>y!==x[0]).map(y=>N(y,"shape")).slice(0,3),"Kira sisi lurus.","D2 Core · Ruang",false,shift)}

function Q(prompt,answer,wrong,hint,kind="Adaptive",diagnostic=false,formatShift=false){
 let seen=new Set([String(answer)]),w=[];
 for(let x of wrong){if(x!=null&&!seen.has(String(x.v))){seen.add(String(x.v));w.push(x)}}
 let d=1;while(w.length<3){let v=typeof answer==="number"?answer+d*10:String(answer)+d;if(!seen.has(String(v))){w.push(N(v,"generic"));seen.add(String(v))}d++}
 return{prompt,answer,wrong:w.slice(0,3),hint,kind,diagnostic,formatShift}
}

function N(v,tag){return{v,tag,label:v}}

function addQ(a,b,ans,kind,shift){return Q(`${a} + ${b} = ?`,ans,addDistractors(a,b,ans),"Pisahkan puluh/ratus dan sa, kemudian gabungkan.",kind,true,shift)}

function addDistractors(a,b,ans){
 let same=[ans-20,ans-10,ans+10,ans+20,ans+100].filter(x=>x>=0&&x!==ans);
 let unit=(a%10)+(b%10),partial=a+(b%10);
 return [N(same[R(0,same.length-1)],"same_end"),N(unit,"units_only"),N(partial===ans?ans+1:partial,"place")]
}

function explain(t){let m={compare:"Semak nilai keseluruhan nombor.",operation:"Semak operasi yang sepatutnya.",place:"Nampak seperti nilai tempat belum stabil.",digit_value:"Digit dan nilai digit tidak sama.",units_only:"Nampak seperti hanya digit sa dihitung.",same_end:"Jangan pilih berdasarkan digit hujung sahaja; kira keseluruhan nilai.",pattern:"Cari beza tetap.",round:"Lihat digit puluh untuk membundar.",fraction:"Semak pengangka dan penyebut.",decimal:"Semak tempat perpuluhan.",money:"Semak nilai serta unit wang.",time:"Semak jam dan minit.",unit:"Pilih unit berdasarkan kuantiti yang diukur.",shape:"Padankan ciri bentuk.",data:"Baca nilai data dengan teliti.",fact:"Semak fakta darab.",division:"Semak kumpulan sama banyak.",estimate:"Anggaran perlu hampir dengan nilai sebenar."};return m[t]||"Belum tepat. Coach akan ubah bentuk soalan atau turun ke prerequisite jika pattern ini berulang."}

function uniqueDigitNumber(len){
 let digits=[];
 digits.push(R(1,9));
 while(digits.length<len){let d=R(0,9);if(!digits.includes(d))digits.push(d)}
 return +digits.join("")
}

function R(a,b){return Math.floor(Math.random()*(b-a+1))+a}

function shuffle(a){return [...a].sort(()=>Math.random()-.5)}

function reverseN(n){return +String(n).split("").reverse().join("")}

function words(n){
 const o=["sifar","satu","dua","tiga","empat","lima","enam","tujuh","lapan","sembilan"],t=["sepuluh","sebelas","dua belas","tiga belas","empat belas","lima belas","enam belas","tujuh belas","lapan belas","sembilan belas"];
 function w99(x){if(x<10)return o[x];if(x<20)return t[x-10];let a=Math.floor(x/10),b=x%10;return o[a]+" puluh"+(b?" "+o[b]:"")}
 let h=Math.floor(n/100),r=n%100;return (h?o[h]+" ratus"+(r?" ":""):"")+w99(r)
}
