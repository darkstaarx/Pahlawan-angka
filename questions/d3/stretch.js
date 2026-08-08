// Darjah 3 local stretch probes.
window.PAQuestionBanks = window.PAQuestionBanks || {};
window.PAQuestionBanks.d3 = function(id,s,shift){
if(id==="D3.N10000"){let a=R(1000,9999),b=R(1000,9999);return Q(`D3 Probe: nombor lebih besar? ${a} atau ${b}`,Math.max(a,b),[N(Math.min(a,b),"compare"),N(a+b,"operation"),N(Math.abs(a-b),"operation")],"Banding ribu dahulu.","D3 Stretch",true,true)}
if(id==="D3.ADD10000"){let a=R(1000,7000),b=R(200,2500),ans=a+b;return Q(`D3 Probe: ${a} + ${b} = ?`,ans,addDistractors(a,b,ans),"Pisahkan ribu, ratus, puluh dan sa.","D3 Stretch",true,true)}
if(id==="D3.SUB10000"){let a=R(3000,9999),b=R(200,Math.min(3000,a-1)),ans=a-b;return Q(`D3 Probe: ${a} − ${b} = ?`,ans,[N(ans+100,"same_end"),N(Math.abs((a%100)-(b%100)),"units_only"),N(a+b,"operation")],"Tolak mengikut nilai tempat.","D3 Stretch",true,true)}
if(id==="D3.MUL"){let a=R(2,12),b=R(2,12),ans=a*b;return Q(`D3 Probe: ${a} × ${b} = ?`,ans,[N(a+b,"operation"),N(ans+a,"fact"),N(Math.max(1,ans-b),"fact")],"Gunakan fakta darab.","D3 Stretch",true,true)}
if(id==="D3.DIV"){let b=R(2,12),ans=R(2,12),a=b*ans;return Q(`D3 Probe: ${a} ÷ ${b} = ?`,ans,[N(b,"operation"),N(ans+1,"division"),N(Math.max(1,ans-1),"division")],"Gunakan hubungan darab-bahagi.","D3 Stretch",true,true)}
if(id==="D3.FRAC"){let d=R(2,6),n=R(1,d-1),k=[2,3][R(0,1)],ans=`${n*k}/${d*k}`;return Q(`D3 Probe: pecahan setara dengan ${n}/${d}?`,ans,[N(`${n}/${d*k}`,"fraction"),N(`${n*k}/${d}`,"fraction"),N(`${n+k}/${d+k}`,"fraction")],"Darab pengangka dan penyebut dengan nombor yang sama.","D3 Stretch",true,true)}
if(id==="D3.DEC"){let a=(R(1,99)/10).toFixed(1),b=(R(1,50)/10).toFixed(1),ans=(+a + +b).toFixed(1);return Q(`D3 Probe: ${a} + ${b} = ?`,ans,[N((+ans+1).toFixed(1),"decimal"),N(String((+a*10)+(+b*10)),"decimal"),N((+ans-.1).toFixed(1),"decimal")],"Selarikan titik perpuluhan.","D3 Stretch",true,true)}
if(id==="D3.MONEY"){let a=R(20,100),b=R(5,50),ans=a-b;return Q(`D3 Probe: RM${a} − RM${b} = ?`,`RM${ans}`,[N(`RM${a+b}`,"operation"),N(`RM${ans+10}`,"same_end"),N(`RM${b}`,"money")],"Cari baki.","D3 Stretch",true,true)}
if(id==="D3.TIME"){let h=R(7,9),m=[15,30][R(0,1)],dur=R(30,90),start=h*60+m,end=start+dur,ans=`${Math.floor(end/60)}:${String(end%60).padStart(2,"0")}`;return Q(`D3 Probe: mula ${h}:${String(m).padStart(2,"0")}, tempoh ${dur} minit. Tamat?`,ans,[N(`${h}:${String(m).padStart(2,"0")}`,"time"),N(`${Math.floor((end+30)/60)}:${String((end+30)%60).padStart(2,"0")}`,"time"),N(`${Math.floor((end-30)/60)}:${String((end-30)%60).padStart(2,"0")}`,"time")],"Tukar kepada minit jika perlu.","D3 Stretch",true,true)}
if(id==="D3.DATA"){let vals=[R(3,15),R(3,15),R(3,15)],sum=vals.reduce((a,b)=>a+b,0);return Q(`D3 Probe: carta A=${vals[0]}, B=${vals[1]}, C=${vals[2]}. Jumlah?`,sum,[N(Math.max(...vals),"data"),N(sum+3,"data"),N(sum-3,"data")],"Tambah semua nilai carta.","D3 Stretch",true,true)}
 return null;
};
