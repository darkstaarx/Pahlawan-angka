window.PAQuestionBanks = window.PAQuestionBanks || {};
window.PAQuestionBanks.d5 = function(id,s,shift){
 if(id==="D5.N1000000"){let a=R(100000,999999),b=R(100000,999999);return Q(`Yang manakah lebih besar?<br><b>${a}</b> atau <b>${b}</b>`,Math.max(a,b),[N(Math.min(a,b),"compare"),N(a+b,"operation"),N(Math.abs(a-b),"operation")],"Banding nombor dari digit paling kiri.","Darjah 5",true,shift)}
 if(id==="D5.PV1000000"){let n=uniqueDigitNumber(6),s=String(n),pos=R(0,5),d=+s[pos],pow=5-pos,ans=d*Math.pow(10,pow),place=['ratus ribu','puluh ribu','ribu','ratus','puluh','sa'][pos];return Q(`Apakah nilai digit <b>${d}</b> pada tempat <b>${place}</b> dalam <b>${n}</b>?`,ans,[N(d,"digit_value"),N(d*Math.pow(10,Math.max(0,pow-1)),"place"),N(ans+10000,"place")],"Nilai digit bergantung pada tempatnya.","Darjah 5",true,true)}
 if(id==="D5.MUL"){let a=R(20,99),b=R(11,25),ans=a*b;return Q(`${a} × ${b} = ?`,ans,[N(a+b,"operation"),N(ans+10,"fact"),N(Math.round(ans/100)*100,"fact")],"Pecahkan darab mengikut nilai tempat.","Darjah 5",true,true)}
 if(id==="D5.DIV"){let b=pick([12,15,20,25]),ans=R(12,40),a=b*ans;return Q(`${a} ÷ ${b} = ?`,ans,[N(b,"operation"),N(ans+5,"division"),N(Math.max(1,ans-5),"division")],"Cari berapa kumpulan yang sama.","Darjah 5",true,true)}
 if(id==="D5.FRAC"){let d=pick([4,5,8,10]),a=R(1,d-1),b=R(1,d-a),num=a+b,sim=simplify(num,d),ans=`${sim[0]}/${sim[1]}`;return Q(`${fractionVisual(a,d)}<div style="margin-bottom:8px">${a}/${d} + ${b}/${d} = ?</div>`,ans,[N(`${num}/${d}`,"fraction"),N(`${a*b}/${d}`,"fraction"),N(`${num}/${d+1}`,"fraction")],"Tambah pengangka dahulu, kemudian ringkaskan jika perlu.","Darjah 5",true,true)}
 if(id==="D5.DEC"){
  const mode=pick(["fraction","add","subtract","place"]);
  if(mode==="fraction"){
   let frac=pick([[1,2,'0.5'],[1,4,'0.25'],[3,4,'0.75'],[1,5,'0.2'],[2,5,'0.4'],[3,5,'0.6'],[1,10,'0.1'],[7,10,'0.7']]);
   return Q(`Perpuluhan bagi <b>${frac[0]}/${frac[1]}</b> ialah?`,frac[2],[N(decimalFmt(Number(frac[2])+.1,2).replace(/0$/,''),"decimal"),N(String(Number(frac[2])*10),"decimal"),N(decimalFmt(Math.max(0,Number(frac[2])-.1),2).replace(/0$/,''),"decimal")],"Tukar pecahan kepada perpuluhan.","Darjah 5",true,true)
  }
  if(mode==="place"){
   const whole=R(1,9),tenths=R(1,9),hundredths=R(1,9),n=`${whole}.${tenths}${hundredths}`;
   return Q(`Apakah nilai digit <b>${hundredths}</b> dalam <b>${n}</b>?`,`${hundredths}/100`,[N(`${hundredths}/10`,"place"),N(hundredths,"digit_value"),N(`${tenths}/100`,"place")],"Digit kedua selepas titik perpuluhan ialah perseratus.","Darjah 5",true,true)
  }
  const a=R(120,850)/100,b=R(10,Math.min(300,Math.round(a*100)-1))/100;
  const ans=mode==="add"?a+b:a-b,sign=mode==="add"?"+":"−";
  return Q(`${decimalFmt(a,2)} ${sign} ${decimalFmt(b,2)} = ?`,decimalFmt(ans,2),[N(decimalFmt(ans+.1,2),"decimal"),N(decimalFmt(Math.max(0,ans-.1),2),"decimal"),N(decimalFmt(a+b+(mode==="add"?-.01:.01),2),"decimal")],"Selarikan titik perpuluhan hingga perseratus.","Darjah 5",true,true)
 }
 if(id==="D5.PERCENT"){let pct=R(1,9)*10,mode=pick(["visual","fraction","decimal"]),ans=`${pct}%`;if(mode==="fraction")return Q(`Tukarkan <b>${pct/10}/10</b> kepada peratus.`,ans,[N(`${100-pct}%`,"percent"),N(`${pct/10}%`,"percent"),N(`${pct}`,"percent")],"Penyebut 10: darab pengangka dengan 10%.","Darjah 5",true,true);if(mode==="decimal")return Q(`Tukarkan <b>${decimalFmt(pct/100,1)}</b> kepada peratus.`,ans,[N(`${pct/10}%`,"percent"),N(`${100-pct}%`,"percent"),N(`${pct}`,"percent")],"Darab perpuluhan dengan 100%.","Darjah 5",true,true);return Q(`${percentVisual(pct)}Bahagian berlorek mewakili?`,ans,[N(`${100-pct}%`,"percent"),N(`${pct/10}/10`,"fraction"),N(`${pct}`,"percent")],"Setiap 10% bersamaan satu kotak.","Darjah 5",true,true)}
 if(id==="D5.MONEY"){let price=R(40,120),disc=pick([10,20,25]),discount=tidyNumber(price*disc/100),ans=tidyNumber(price-discount);return Q(`Harga RM${price}. Diskaun ${disc}%. Harga selepas diskaun?`,moneyFmtUpper(ans),[N(moneyFmtUpper(discount),"percent"),N(moneyFmtUpper(price+discount),"operation"),N(moneyFmtUpper(ans+10),"same_end")],"Cari nilai diskaun, kemudian tolak daripada harga asal.","Darjah 5",true,true)}
 if(id==="D5.TIME"){let h=R(7,11),m=R(0,11)*5,dur=pick([65,75,85,95,105,125,150,175]),mins=h*60+m+dur,ans=`${Math.floor(mins/60)}:${String(mins%60).padStart(2,'0')}`;return Q(`Mula ${h}:${String(m).padStart(2,'0')}, tempoh ${dur} minit. Tamat pukul?`,ans,[N(`${h}:${String(m).padStart(2,'0')}`,"time"),N(`${Math.floor((mins+30)/60)}:${String((mins+30)%60).padStart(2,'0')}`,"time"),N(`${Math.floor((mins-30)/60)}:${String((mins-30)%60).padStart(2,'0')}`,"time")],"Tukar kepada jam dan minit jika perlu.","Darjah 5",true,true)}
 if(id==="D5.MEASURE"){let L=R(1,9),ml=R(1,19)*50,ans=L*1000+ml;return Q(`${L} L ${ml} mL = berapa mL?`,ans,[N(L+ml,"unit"),N(L*100+ml,"unit"),N(ans+100,"unit")],"1 L = 1000 mL.","Darjah 5",true,true)}
 if(id==="D5.AREA"){let l=R(6,14),w=R(4,10),ans=l*w;return Q(`Sebuah segi empat tepat panjang ${l} cm dan lebar ${w} cm. Luasnya?`,ans,[N(2*(l+w),"area"),N(l+w,"operation"),N(ans+w,"area")],"Luas = panjang × lebar.","Darjah 5",true,true)}
 if(id==="D5.COORD"){let x=R(1,4),y=R(1,4),label=pick(['P','Q','R','S']),ans=`(${x},${y})`;return Q(`${coordGrid(x,y)}Apakah koordinat titik <b>${label}</b> yang ditandakan ●?`,ans,[N(`(${y},${x})`,"coord"),N(`(${x+1},${y})`,"coord"),N(`(${x},${Math.max(0,y-1)})`,"coord")],"Baca paksi-x dahulu, kemudian paksi-y.","Darjah 5",true,true)}
 if(id==="D5.DATA"){let vals=[R(20,40),R(20,40),R(20,40)],sum=vals.reduce((a,b)=>a+b,0),ans=Math.round(sum/3);return Q(`${barChart(['A','B','C'],vals)}Purata terdekat bagi data di atas?`,ans,[N(Math.max(...vals),"data"),N(sum,"operation"),N(Math.round(sum/2),"data")],"Purata = jumlah ÷ bilangan data.","Darjah 5",true,true)}
 return null;
};
