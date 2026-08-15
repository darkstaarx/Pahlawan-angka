// Shared question-generation helpers.
function tidyNumber(value,maxDp=2){
 if(typeof value!=="number"||!Number.isFinite(value))return value;
 return Number(value.toFixed(maxDp));
}
function tidyDisplay(value){
 if(typeof value==="number")return tidyNumber(value);
 if(typeof value!=="string")return value;
 // Remove IEEE-754 tails such as RM67.19999999999999 without changing fractions, ratios or times.
 return value.replace(/-?\d+\.\d{3,}/g,m=>String(tidyNumber(Number(m))));
}
function decimalFmt(value,dp=1){return Number(value).toFixed(dp)}
function moneyFmtUpper(value){
 const n=tidyNumber(Number(value));
 return `RM${Number.isInteger(n)?n:n.toFixed(2)}`;
}
function fallbackChoice(answer,d){
 if(typeof answer==="number")return tidyNumber(answer+d*10);
 const s=String(answer);
 let m=s.match(/^RM(-?\d+(?:\.\d+)?)$/);if(m)return moneyFmtUpper(Number(m[1])+d*10);
 m=s.match(/^(\d+)%$/);if(m)return `${(Number(m[1])+d*10)%110}%`;
 m=s.match(/^(\d+)\/(\d+)$/);if(m)return `${Number(m[1])+d}/${m[2]}`;
 m=s.match(/^(\d+):(\d+)$/);if(m&&!s.includes('jam'))return `${Number(m[1])+d}:${m[2]}`;
 m=s.match(/^\((\d+),(\d+)\)$/);if(m)return `(${Number(m[1])+d},${m[2]})`;
 m=s.match(/^(\d+):(\d+)$/);if(m)return `${Number(m[1])+d}:${m[2]}`;
 if(/^-?\d+\.\d+$/.test(s)){const dp=s.split('.')[1].length;return decimalFmt(Number(s)+d/Math.pow(10,dp),dp)}
 m=s.match(/^(-?\d+(?:\.\d+)?)(\s*[^\d].*)$/);if(m){
  const n=Number(m[1]),step=Math.abs(n)>=100?100:Math.abs(n)>=10?10:1;
  return `${tidyNumber(n+d*step)}${m[2]}`;
 }
 const generic=['Tidak pasti','Tiada jawapan','Maklumat tidak cukup'];
 return generic[(d-1)%generic.length];
}
function choiceKey(value){return String(tidyDisplay(value)).replace(/\s+/g,' ').trim().toLocaleLowerCase('ms')}
function semanticChoiceKey(value){
 const raw=choiceKey(value), compact=raw.replace(/\s+/g,'');
 let m=compact.match(/^rm(-?\d+(?:\.\d+)?)$/);if(m)return `money:${tidyNumber(Number(m[1]))}`;
 m=compact.match(/^(-?\d+(?:\.\d+)?)%$/);if(m)return `percent:${tidyNumber(Number(m[1]))}`;
 m=compact.match(/^(-?\d+)\/(-?\d+)$/);if(m){const n=Number(m[1]),d=Number(m[2]);if(d){const g=gcd(Math.abs(n),Math.abs(d));return `fraction:${n/g}/${d/g}`}}
 // Expanded notation is an addition statement: 20 + 5 and 5 + 20 are the same answer.
 if(/^-?\d+(?:\.\d+)?(?:\+-?\d+(?:\.\d+)?)+$/.test(compact))return `sum:${tidyNumber(compact.split('+').reduce((a,x)=>a+Number(x),0))}`;
 if(/^-?\d+(?:\.\d+)?(?:[×*]-?\d+(?:\.\d+)?)+$/.test(compact))return `product:${tidyNumber(compact.split(/[×*]/).reduce((a,x)=>a*Number(x),1))}`;
 return `text:${raw}`;
}
function Q(prompt,answer,wrong,hint,kind="Adaptive",diagnostic=false,formatShift=false){
 answer=tidyDisplay(answer);
 wrong=(wrong||[]).map(x=>x==null?x:{...x,v:tidyDisplay(x.v),label:tidyDisplay(x.label)});
 let seen=new Set([semanticChoiceKey(answer)]),w=[];
 for(let x of wrong){if(x!=null){const key=semanticChoiceKey(x.label??x.v);if(!seen.has(key)){seen.add(key);w.push(x)}}}
 let d=1,guard=0;while(w.length<3&&guard++<20){let v=fallbackChoice(answer,d++),key=semanticChoiceKey(v);if(!seen.has(key)){w.push(N(v,"generated"));seen.add(key)}}
 if(w.length!==3)throw new Error(`Pilihan unik tidak dapat dijana untuk jawapan: ${answer}`);
 return{prompt,answer,wrong:w.slice(0,3),hint,kind,diagnostic,formatShift}
}
function N(v,tag){return{v,tag,label:v}}
function R(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function pick(arr){return arr[R(0,arr.length-1)]}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function reverseN(n){return +String(n).split("").reverse().join("")}
function uniqueDigitNumber(len){ let digits=[]; digits.push(R(1,9)); while(digits.length<len){let d=R(0,9);if(!digits.includes(d))digits.push(d)} return +digits.join("") }

function explain(t){let m={compare:"Banding nilai nombor dengan teliti.",operation:"Semak operasi yang sepatutnya.",place:"Nilai tempat belum stabil.",digit_value:"Digit dan nilai digit tidak sama.",units_only:"Nampak seperti hanya digit sa dihitung.",same_end:"Jangan pilih ikut digit hujung sahaja.",pattern:"Cari beza atau aturan yang tetap.",round:"Lihat digit penentu sebelum membundar.",fraction:"Semak pengangka dan penyebut.",decimal:"Selarikan tempat perpuluhan.",money:"Semak unit RM dan sen.",time:"Semak jam, minit atau tempoh.",unit:"Pilih unit yang paling sesuai.",shape:"Padankan ciri bentuk atau ruang.",data:"Baca data dengan teliti.",fact:"Semak fakta darab.",division:"Guna hubungan darab-bahagi.",estimate:"Anggaran mesti hampir dengan nilai sebenar.",percent:"100% bermaksud keseluruhan.",ratio:"Banding ikut nisbah yang diberi.",area:"Luas biasanya panjang × lebar.",coord:"Semak kedudukan pada paksi."};return m[t]||"Belum tepat. Coach akan ubah bentuk soalan atau turun ke prerequisite jika pattern ini berulang."}

function addDistractors(a,b,ans){
 let same=[ans-20,ans-10,ans+10,ans+20,ans+100].filter(x=>x>=0&&x!==ans);
 let unit=(a%10)+(b%10),partial=a+(b%10);
 return [N(same[R(0,same.length-1)],"same_end"),N(unit,"units_only"),N(partial===ans?ans+1:partial,"place")]
}
function addQ(a,b,ans,kind,shift){return Q(`${a} + ${b} = ?`,ans,addDistractors(a,b,ans),"Pisahkan ikut nilai tempat, kemudian gabungkan.",kind,true,shift)}
function subQ(a,b,ans,kind,shift){return Q(`${a} − ${b} = ?`,ans,[N(ans+10,"same_end"),N(Math.abs((a%10)-(b%10)),"units_only"),N(a+b,"operation")],"Tolak ikut nilai tempat.",kind,true,shift)}

function moneyFmt(cents){
 cents=Math.round(cents);
 if(cents<100)return `${cents} sen`;
 const rm=Math.floor(cents/100),sen=cents%100;
 return sen?`RM${rm}.${String(sen).padStart(2,"0")}`:`RM${rm}`;
}
function moneyChoice(cents,tag="money"){return N(moneyFmt(cents),tag)}
function moneyDenominations(){return [10000,5000,2000,1000,500,100,50,20,10,5]}
function moneyPieces(cents){
 let remain=cents,pieces=[];
 for(const d of moneyDenominations()){
   while(remain>=d && pieces.length<8){pieces.push(d);remain-=d}
 }
 if(remain>0){ // keep visual exact even for unusual generated values
   pieces.push(remain);remain=0;
 }
 return pieces;
}
function moneyPieceSvg(cents){
 const isCoin=cents<100;
 const label=moneyFmt(cents);
 if(isCoin){
   const fill=cents===50?'#d7b56d':cents===20?'#d8d8d8':cents===10?'#dfc58e':'#d6c2a2';
   return `<span style="width:58px;height:58px;border-radius:50%;display:inline-grid;place-items:center;background:${fill};border:3px solid #7d6a45;color:#182238;font-weight:950;font-size:11px;box-shadow:inset 0 0 0 3px #ffffff55">${label}</span>`;
 }
 const palette={100:'#b689d6',50:'#69b69a',20:'#dc8b89',10:'#d17c77',5:'#85a8d9',1:'#7bb08b'};
 const rm=Math.floor(cents/100),fill=palette[rm]||'#8db7d9';
 return `<span style="width:92px;height:48px;border-radius:8px;display:inline-grid;place-items:center;background:${fill};border:3px solid #53647d;color:white;font-weight:950;font-size:15px;box-shadow:inset 0 0 0 2px #ffffff33">${label}</span>`;
}
function moneyVisual(cents){
 const ps=moneyPieces(cents);
 return `<div class="moneyVisual" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;margin:4px auto 12px;max-width:340px">${ps.map(moneyPieceSvg).join('')}</div>`;
}
function priceTag(label,cents){return `<div style="display:inline-flex;flex-direction:column;align-items:center;gap:3px;padding:8px 12px;border-radius:12px;background:#fff3ca;border:2px solid #d7b657;color:#273149;font-size:12px;font-weight:850"><span>${label}</span><b style="font-size:17px">${moneyFmt(cents)}</b></div>`}
function moneyWrongSet(ans,values=[]){
 const out=[]; const seen=new Set([ans]);
 for(const v of values){if(v>=0&&v<=10000&&!seen.has(v)){seen.add(v);out.push(moneyChoice(v,"money"))}}
 let step=ans<100?10:50;
 for(let k=1;out.length<3&&k<10;k++){
   for(const v of [ans+step*k,ans-step*k]){if(v>=0&&v<=10000&&!seen.has(v)){seen.add(v);out.push(moneyChoice(v,"money"));if(out.length===3)break}}
 }
 return out.slice(0,3);
}
function chooseMoneyValue(mode="mixed",max=10000){
 const coin=[5,10,20,50,60,70,80,90];
 const ringgit=[100,200,300,400,500,1000,1500,2000,2500,3000,4000,5000];
 const mixed=[150,250,270,320,450,575,625,750,825,950,1050,1275,1520,1875,2350,2725,3150,4050];
 let pool=mode==="coin"?coin:mode==="ringgit"?ringgit:mixed;
 pool=pool.filter(x=>x<=max);return pick(pool.length?pool:[Math.min(max,100)]);
}
function moneyQ(id,shift,s){
 const difficulty=(s&&s.mastery>=75)?"STRETCH":(s&&s.mastery>=50)?"APPLICATION":(s&&s.mastery>=25)?"CORE":"FOUNDATION";
 if(id==="D2.4.1"){
   const mode=pick(["recognise","total","total","compare"]);
   if(mode==="recognise"){
     const d=pick([5,10,20,50,100,500,1000,2000,5000]);
     const wrong=moneyWrongSet(d,[d<100?d+10:d+100,d<100?Math.max(5,d-10):Math.max(100,d-100),d<100?d*2:Math.min(10000,d*2)]);
     return Q(`${moneyVisual(d)}Berapakah nilai wang yang ditunjukkan?`,moneyFmt(d),wrong,"Lihat nilai yang tertulis pada syiling atau wang kertas.",`D2 ${difficulty} · Wang`,true,shift);
   }
   if(mode==="compare"){
     const a=chooseMoneyValue("mixed",5000),b=chooseMoneyValue("mixed",5000);
     if(a===b)return moneyQ(id,shift,s);
     const ans=Math.max(a,b);
     return Q(`${moneyVisual(a)}<div style="height:6px"></div>${moneyVisual(b)}Antara dua kumpulan wang ini, yang manakah nilainya lebih besar?`,moneyFmt(ans),[moneyChoice(Math.min(a,b)),moneyChoice(Math.abs(a-b)),moneyChoice(Math.min(10000,a+b))],"Kira nilai setiap kumpulan dahulu, kemudian bandingkan.",`D2 ${difficulty} · Wang`,true,shift);
   }
   const total=chooseMoneyValue(pick(["coin","mixed","ringgit"]),10000);
   const wrong=moneyWrongSet(total,[Math.max(0,total-50),Math.min(10000,total+50),total<100?total*10:Math.round(total/10)]);
   return Q(`${moneyVisual(total)}Berapakah jumlah wang semuanya?`,moneyFmt(total),wrong,"Tambah nilai semua syiling dan wang kertas yang ditunjukkan.",`D2 ${difficulty} · Wang`,true,shift);
 }
 if(id==="D2.4.2"){
   const three=Math.random()<0.42;
   let vals=[];
   if(three){
     vals=[chooseMoneyValue(pick(["coin","mixed","ringgit"]),3000),chooseMoneyValue(pick(["coin","mixed","ringgit"]),3000),chooseMoneyValue(pick(["coin","mixed"]),3000)];
   }else{
     vals=[chooseMoneyValue(pick(["coin","mixed","ringgit"]),5000),chooseMoneyValue(pick(["coin","mixed","ringgit"]),5000)];
   }
   let ans=vals.reduce((a,b)=>a+b,0);if(ans>10000)return moneyQ(id,shift,s);
   const stem=vals.map(moneyFmt).join(' + ');
   const wrong=moneyWrongSet(ans,[ans-100,ans+100,Math.abs(vals[0]-vals[1]),ans-(vals[vals.length-1]||0)]);
   return Q(`${stem} = ?`,moneyFmt(ans),wrong,"Tambah sen dengan sen dan ringgit dengan ringgit. Jika 100 sen, tukarkan kepada RM1.",`D2 ${difficulty} · Tambah Wang`,true,shift);
 }
 if(id==="D2.4.3"){
   const three=Math.random()<0.4;
   let start=chooseMoneyValue("mixed",10000),b=chooseMoneyValue(pick(["coin","mixed","ringgit"]),Math.max(50,start-50)),c=three?chooseMoneyValue(pick(["coin","mixed"]),Math.max(50,start-b-5)):0;
   if(start-b-c<0)return moneyQ(id,shift,s);
   const ans=start-b-c,stem=three?`${moneyFmt(start)} − ${moneyFmt(b)} − ${moneyFmt(c)} = ?`:`${moneyFmt(start)} − ${moneyFmt(b)} = ?`;
   const wrong=moneyWrongSet(ans,[start+b+c,start-b+c,b+c,ans+100]);
   return Q(stem,moneyFmt(ans),wrong,"Tolak satu nilai pada satu masa. Semak sen dahulu, kemudian ringgit.",`D2 ${difficulty} · Tolak Wang`,true,shift);
 }
 if(id==="D2.4.4"){
   const k=pick([2,3,4,5,10]);
   let unit=chooseMoneyValue(pick(["coin","mixed","ringgit"]),Math.floor(10000/k));
   const ans=unit*k;if(ans>10000)return moneyQ(id,shift,s);
   const contextual=Math.random()<0.55;
   const prompt=contextual?`${priceTag('1 barang',unit)}<div style="margin-top:8px">Harga satu barang ialah <b>${moneyFmt(unit)}</b>. Berapakah harga ${k} barang yang sama?</div>`:`${moneyFmt(unit)} × ${k} = ?`;
   const wrong=moneyWrongSet(ans,[unit+k*100,unit+k,ans-unit,ans+unit]);
   return Q(prompt,moneyFmt(ans),wrong,"Harga semua barang = harga satu barang × bilangan barang.",`D2 ${difficulty} · Darab Wang`,true,shift);
 }
 if(id==="D2.4.5"){
   const k=pick([2,4,5,10]);
   let each=chooseMoneyValue(pick(["coin","mixed","ringgit"]),Math.floor(10000/k));
   const total=each*k;
   const contextual=Math.random()<0.6;
   const prompt=contextual?`Wang sebanyak <b>${moneyFmt(total)}</b> dibahagi sama rata kepada <b>${k}</b> orang. Berapakah setiap orang dapat?`:`${moneyFmt(total)} ÷ ${k} = ?`;
   const wrong=moneyWrongSet(each,[total-k*100,total/k+100,total-k,each+50]);
   return Q(prompt,moneyFmt(each),wrong,"Bahagi jumlah wang kepada kumpulan yang sama banyak.",`D2 ${difficulty} · Bahagi Wang`,true,shift);
 }
 if(id==="D2.4.6"){
   const income=chooseMoneyValue("mixed",7000),spend=chooseMoneyValue(pick(["coin","mixed","ringgit"]),Math.max(50,income-5));
   if(spend>=income)return moneyQ(id,shift,s);
   const ans=income-spend;
   const prompt=pick([
     `Aina mempunyai <b>${moneyFmt(income)}</b>. Dia berbelanja <b>${moneyFmt(spend)}</b>. Berapakah wang yang dapat disimpan?`,
     `Hakim menerima <b>${moneyFmt(income)}</b>. Selepas membeli barang bernilai <b>${moneyFmt(spend)}</b>, berapakah baki yang boleh disimpan?`
   ]);
   const wrong=moneyWrongSet(ans,[income+spend,spend,income,ans+100]);
   return Q(prompt,moneyFmt(ans),wrong,"Wang yang disimpan = wang yang ada − wang yang dibelanjakan.",`D2 ${difficulty} · Simpanan`,true,shift);
 }
 // D2.4.7 varied daily money problems
 const mode=pick(["balance","multi","enough","total","savings"]);
 if(mode==="balance"){
   const price=chooseMoneyValue("mixed",7000),pay=pick([5000,10000]);if(pay<=price)return moneyQ(id,shift,s);const ans=pay-price;
   return Q(`${priceTag('Harga barang',price)}<div style="margin-top:8px">Farah membayar <b>${moneyFmt(pay)}</b>. Berapakah baki wangnya?</div>`,moneyFmt(ans),moneyWrongSet(ans,[price,pay+price,ans+100]),"Baki = wang dibayar − harga barang.",`D2 ${difficulty} · Masalah Wang`,true,true);
 }
 if(mode==="multi"){
   const p1=chooseMoneyValue("mixed",4000),p2=chooseMoneyValue("mixed",4000),ans=p1+p2;if(ans>10000)return moneyQ(id,shift,s);
   return Q(`<div style="display:flex;gap:10px;justify-content:center">${priceTag('Buku',p1)}${priceTag('Pensel',p2)}</div><div style="margin-top:8px">Berapakah jumlah harga kedua-dua barang?</div>`,moneyFmt(ans),moneyWrongSet(ans,[Math.abs(p1-p2),p1,p2,ans+100]),"Tambah harga kedua-dua barang.",`D2 ${difficulty} · Masalah Wang`,true,true);
 }
 if(mode==="enough"){
   const price=chooseMoneyValue("mixed",8000),have=Math.random()<.5?Math.min(10000,price+pick([50,100,200,500])):Math.max(5,price-pick([50,100,200,500]));
   const ans=have>=price?"Cukup":"Tidak cukup";
   return Q(`Harga sebuah permainan ialah <b>${moneyFmt(price)}</b>. Amir mempunyai <b>${moneyFmt(have)}</b>. Adakah wang Amir cukup untuk membelinya?`,ans,[N(ans==="Cukup"?"Tidak cukup":"Cukup","money"),N("Perlu RM100 lagi","money"),N("Tidak dapat ditentukan","money")],"Bandingkan wang Amir dengan harga barang.",`D2 ${difficulty} · Masalah Wang`,true,true);
 }
 if(mode==="savings"){
   const have=chooseMoneyValue("mixed",8000),spent=chooseMoneyValue("mixed",Math.max(50,have-5));if(spent>=have)return moneyQ(id,shift,s);const ans=have-spent;
   return Q(`Siti mempunyai <b>${moneyFmt(have)}</b>. Dia menggunakan <b>${moneyFmt(spent)}</b>. Berapakah wang yang tinggal?`,moneyFmt(ans),moneyWrongSet(ans,[have+spent,spent,have]),"Cari baki selepas berbelanja.",`D2 ${difficulty} · Masalah Wang`,true,true);
 }
 const p1=chooseMoneyValue("mixed",4000),p2=chooseMoneyValue("mixed",4000),ans=p1+p2;if(ans>10000)return moneyQ(id,shift,s);
 return Q(`Ibu membeli makanan berharga <b>${moneyFmt(p1)}</b> dan minuman berharga <b>${moneyFmt(p2)}</b>. Berapakah jumlah yang dibayar?`,moneyFmt(ans),moneyWrongSet(ans,[Math.abs(p1-p2),p1,p2]),"Tambah kedua-dua harga.",`D2 ${difficulty} · Masalah Wang`,true,true);
}

function shape3DQ(shift){let x=[["kubus","6 muka sama besar"],["kuboid","6 muka segi empat"],["silinder","2 muka bulat"],["sfera","tiada muka rata"]][R(0,3)],all=["kubus","kuboid","silinder","sfera"];return Q(`Bentuk 3D: <b>${x[1]}</b>`,x[0],all.filter(y=>y!==x[0]).map(y=>N(y,"shape")).slice(0,3),"Padankan ciri bentuk.","D2 Core · Ruang",false,shift)}
function shape2DQ(shift){let shapes=[["segi tiga",3,"3 sisi lurus"],["segi empat sama",4,"4 sisi sama panjang"],["segi empat tepat",4,"4 sisi; sisi bertentangan sama panjang"],["bulatan",0,"tiada sisi lurus"]],x=shapes[R(0,3)];return Q(`Bentuk 2D yang mempunyai <b>${x[2]}</b> ialah?`,x[0],shapes.filter(y=>y[0]!==x[0]).map(y=>N(y[0],"shape")),"Gunakan semua ciri yang diberi.","D2 Core · Ruang",false,shift)}

function numWords(n){
 const o=["sifar","satu","dua","tiga","empat","lima","enam","tujuh","lapan","sembilan"],t=["sepuluh","sebelas","dua belas","tiga belas","empat belas","lima belas","enam belas","tujuh belas","lapan belas","sembilan belas"];
 function w99(x){if(x<10)return o[x];if(x<20)return t[x-10];let a=Math.floor(x/10),b=x%10;return o[a]+" puluh"+(b?" "+o[b]:"")}
 function w999(x){let h=Math.floor(x/100),r=x%100;return (h?o[h]+" ratus"+(r?" ":""):"")+ (r||!h?w99(r):"")}
 if(n<1000)return w999(n);
 if(n<1000000){let th=Math.floor(n/1000),r=n%1000;return (th===1?"seribu":w999(th)+" ribu")+(r?" "+w999(r):"")}
 let mil=Math.floor(n/1000000),r=n%1000000;return (mil===1?"sejuta":w999(mil)+" juta")+(r?" "+numWords(r):"")
}

function fractionVisual(num,den){
 let cells='';
 for(let i=0;i<den;i++)cells+=`<div style="flex:1;height:22px;border:1px solid #7c8fb5;background:${i<num?'#7fd6a7':'#e7edff'}"></div>`;
 return `<div style="width:min(240px,92%);display:flex;border-radius:10px;overflow:hidden;margin:0 auto 10px">${cells}</div>`
}
function percentVisual(pct){
 let parts=''; let filled=Math.round(pct/10);
 for(let i=0;i<10;i++)parts+=`<div style="flex:1;height:18px;border:1px solid #7c8fb5;background:${i<filled?'#ffd36d':'#e7edff'}"></div>`;
 return `<div style="width:min(260px,96%);display:flex;border-radius:9px;overflow:hidden;margin:0 auto 8px">${parts}</div><div style="font-size:12px;color:#667">Setiap kotak = 10%</div>`
}
function barChart(labels,vals){
 let max=Math.max(...vals);
 return `<div style="display:flex;gap:8px;justify-content:center;align-items:flex-end;height:120px;margin:4px 0 10px">${labels.map((l,i)=>`<div style="display:flex;flex-direction:column;align-items:center;gap:4px"><div style="width:40px;height:${Math.max(16,vals[i]/max*88)}px;background:#8ab4ff;border-radius:8px 8px 0 0"></div><div style="font-size:12px">${l}</div></div>`).join('')}</div>`
}
function clockSvg(hour,minute){
 let h=((hour%12)+(minute/60))*30-90,m=minute*6-90,rad=x=>x*Math.PI/180;
 let hx=50+18*Math.cos(rad(h)), hy=50+18*Math.sin(rad(h)), mx=50+26*Math.cos(rad(m)), my=50+26*Math.sin(rad(m));
 const nums=Array.from({length:12},(_,i)=>{const a=(i+1)*30-90,x=50+31*Math.cos(rad(a)),y=50+31*Math.sin(rad(a));return `<text x="${x}" y="${y+2.5}" text-anchor="middle" font-size="7" font-weight="800" fill="#405072">${i+1}</text>`}).join('');
 return `<svg class="clockVisual" viewBox="0 0 100 100" width="112" height="112" role="img" aria-label="Muka jam analog" style="display:block;margin:0 auto 10px"><circle cx="50" cy="50" r="45" fill="#f9fbff" stroke="#405072" stroke-width="4"/>${nums}<line x1="50" y1="50" x2="${hx}" y2="${hy}" stroke="#26344f" stroke-width="5" stroke-linecap="round"/><line x1="50" y1="50" x2="${mx}" y2="${my}" stroke="#4388e8" stroke-width="3.5" stroke-linecap="round"/><circle cx="50" cy="50" r="4" fill="#26344f"/></svg>`
}
function shapeSvg(type){
 let map={triangle:'<polygon points="50,12 88,82 12,82" fill="#ffd36d" stroke="#405072" stroke-width="3"/>',square:'<rect x="18" y="18" width="64" height="64" rx="4" fill="#8ab4ff" stroke="#405072" stroke-width="3"/>',rectangle:'<rect x="12" y="24" width="76" height="52" rx="4" fill="#8fd9a8" stroke="#405072" stroke-width="3"/>',pentagon:'<polygon points="50,10 88,38 74,84 26,84 12,38" fill="#c8a7ef" stroke="#405072" stroke-width="3"/>',circle:'<circle cx="50" cy="50" r="34" fill="#ffb4ca" stroke="#405072" stroke-width="3"/>'};
 return `<svg viewBox="0 0 100 100" width="96" height="96" style="display:block;margin:0 auto 10px">${map[type]||map.square}</svg>`
}
function coordGrid(x,y){
 return `<div class="coordVisual" role="img" aria-label="Grid koordinat dengan titik pada ${x}, ${y}" style="font-family:monospace;white-space:pre;line-height:1.15;display:inline-block;text-align:left;background:#fff;padding:8px 10px;border-radius:10px;border:2px solid #8394b2;margin:0 auto 10px">${[4,3,2,1,0].map(r=>`${r} | ${[0,1,2,3,4].map(c=>c===x&&r===y?'●':'·').join(' ')}`).join('\n')}\n    0 1 2 3 4</div>`
}
function gcd(a,b){while(b){[a,b]=[b,a%b]}return a}
function simplify(n,d){let g=gcd(Math.abs(n),Math.abs(d)); return [n/g,d/g]}

function words(n){return numWords(n)}

function shape3DSvg(type){
 const common='stroke="#405072" stroke-width="3" stroke-linejoin="round"';
 const m={
  cube:`<polygon points="27,35 57,20 82,34 52,49" fill="#b9d6ff" ${common}/><polygon points="27,35 52,49 52,82 27,68" fill="#82aff2" ${common}/><polygon points="52,49 82,34 82,67 52,82" fill="#6e96d5" ${common}/>`,
  cuboid:`<polygon points="18,39 58,23 87,36 47,52" fill="#b9e8c6" ${common}/><polygon points="18,39 47,52 47,77 18,65" fill="#79c898" ${common}/><polygon points="47,52 87,36 87,61 47,77" fill="#5faa80" ${common}/>`,
  pyramid:`<polygon points="50,15 19,71 51,86" fill="#ffd48b" ${common}/><polygon points="50,15 83,69 51,86" fill="#e9a951" ${common}/><polygon points="19,71 50,56 83,69 51,86" fill="#f6c36d" ${common}/>`,
  cylinder:`<ellipse cx="50" cy="27" rx="28" ry="12" fill="#9fe7ef" ${common}/><rect x="22" y="27" width="56" height="49" fill="#71cbd8" ${common}/><ellipse cx="50" cy="76" rx="28" ry="12" fill="#5fb8c5" ${common}/><ellipse cx="50" cy="27" rx="28" ry="12" fill="#baf5fa" ${common}/>`,
  cone:`<ellipse cx="50" cy="75" rx="29" ry="11" fill="#f1b3cc" ${common}/><path d="M50 15 21 75q29 20 58 0z" fill="#e487b0" ${common}/><path d="M50 15 79 75" fill="none" ${common}/>`
 };
 return `<svg viewBox="0 0 100 100" width="104" height="104" style="display:block;margin:0 auto 8px">${m[type]||m.cube}</svg>`
}
function shapeNetSvg(type){
 const cell=(x,y,fill='#9fc5ff')=>`<rect x="${x}" y="${y}" width="22" height="22" fill="${fill}" stroke="#405072" stroke-width="2"/>`;
 if(type==='cube')return `<svg viewBox="0 0 130 100" width="150" height="112" style="display:block;margin:0 auto 8px">${cell(54,10)}${cell(10,32)}${cell(32,32)}${cell(54,32)}${cell(76,32)}${cell(54,54)}</svg>`;
 return `<svg viewBox="0 0 130 100" width="150" height="112" style="display:block;margin:0 auto 8px">${cell(32,20,'#b6e3c2')}${cell(54,20,'#b6e3c2')}${cell(76,20,'#b6e3c2')}${cell(54,42,'#8dcc9f')}${cell(54,64,'#8dcc9f')}${cell(98,20,'#b6e3c2')}</svg>`;
}

// Phase 3.4 curriculum visuals / assessment helpers.
function base10Visual(n){
 const h=Math.floor(n/100),t=Math.floor((n%100)/10),o=n%10;
 const group=(count,label,bg)=>`<div style="display:flex;flex-direction:column;align-items:center;gap:4px"><div style="display:flex;flex-wrap:wrap;justify-content:center;gap:3px;max-width:94px">${Array.from({length:count},()=>`<span style="width:18px;height:18px;border:2px solid #4a5a76;border-radius:3px;background:${bg};display:inline-block"></span>`).join('')||'<span style="font-weight:900;color:#8090aa">0</span>'}</div><small style="font-weight:900">${label}</small></div>`;
 return `<div style="display:flex;justify-content:center;gap:18px;align-items:flex-end;margin:4px auto 12px">${group(h,'ratus','#ffd27d')}${group(t,'puluh','#87c8ff')}${group(o,'sa','#8ee1aa')}</div>`;
}
function numberLineSvg(min,max,step,point=null){
 const vals=[];for(let v=min;v<=max;v+=step)vals.push(v);
 const W=320,H=74,left=22,right=298,y=34,span=Math.max(1,max-min);
 const ticks=vals.map(v=>{const x=left+(v-min)/span*(right-left);return `<line x1="${x}" y1="28" x2="${x}" y2="42" stroke="#405072" stroke-width="2"/><text x="${x}" y="59" text-anchor="middle" font-size="10" fill="#405072">${v}</text>`}).join('');
 let marker=''; if(point!=null){const x=left+(point-min)/span*(right-left);marker=`<circle cx="${x}" cy="${y}" r="6" fill="#ef6f6c"/><path d="M${x} 8 L${x} 24" stroke="#ef6f6c" stroke-width="3"/><text x="${x}" y="10" text-anchor="middle" font-size="11" font-weight="800" fill="#9c3e3b">${point}</text>`}
 return `<svg viewBox="0 0 ${W} ${H}" width="min(330px,98%)" style="display:block;margin:0 auto 10px"><line x1="${left}" y1="${y}" x2="${right}" y2="${y}" stroke="#405072" stroke-width="3"/>${ticks}${marker}</svg>`;
}
function dotsEstimateVisual(count){
 let dots='';for(let i=0;i<count;i++){const x=12+(i%10)*20+(i%3)*2,y=12+Math.floor(i/10)*18;dots+=`<circle cx="${x}" cy="${y}" r="5" fill="${i%3===0?'#78a9ff':i%3===1?'#8bd3a8':'#ffd36d'}"/>`}
 const rows=Math.ceil(count/10);return `<svg viewBox="0 0 220 ${Math.max(50,rows*18+18)}" width="min(240px,92%)" style="display:block;margin:0 auto 10px">${dots}</svg>`;
}
function decimalTenthsVisual(n){return fractionVisual(n,10)}
function rulerSvg(cm){
 const max=20,W=330,left=20,right=310,y=52,scale=(right-left)/max;
 let ticks='';for(let i=0;i<=max;i++){const x=left+i*scale;const tall=i%5===0?18:11;ticks+=`<line x1="${x}" y1="${y-tall}" x2="${x}" y2="${y}" stroke="#405072" stroke-width="2"/>${i%5===0?`<text x="${x}" y="68" text-anchor="middle" font-size="10">${i}</text>`:''}`}
 const x2=left+cm*scale;
 return `<svg viewBox="0 0 ${W} 80" width="min(340px,98%)" style="display:block;margin:0 auto 10px"><rect x="12" y="24" width="306" height="42" rx="8" fill="#fff4c8" stroke="#a88730" stroke-width="2"/>${ticks}<line x1="${left}" y1="18" x2="${x2}" y2="18" stroke="#ef6f6c" stroke-width="6" stroke-linecap="round"/><circle cx="${left}" cy="18" r="4" fill="#ef6f6c"/><circle cx="${x2}" cy="18" r="4" fill="#ef6f6c"/></svg>`;
}
function scaleSvg(grams){
 const max=1000,angle=-120+(grams/max)*240,rad=angle*Math.PI/180,x=70+38*Math.cos(rad),y=70+38*Math.sin(rad);
 let marks='';for(let g=0;g<=1000;g+=100){const a=(-120+(g/max)*240)*Math.PI/180,x1=70+50*Math.cos(a),y1=70+50*Math.sin(a),x2=70+57*Math.cos(a),y2=70+57*Math.sin(a);marks+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#405072" stroke-width="2"/>`}
 return `<svg viewBox="0 0 140 125" width="140" style="display:block;margin:0 auto 10px"><path d="M18 86 A58 58 0 1 1 122 86" fill="#f7fbff" stroke="#405072" stroke-width="4"/>${marks}<line x1="70" y1="70" x2="${x}" y2="${y}" stroke="#ef6f6c" stroke-width="5" stroke-linecap="round"/><circle cx="70" cy="70" r="5" fill="#405072"/><text x="70" y="108" text-anchor="middle" font-size="12" font-weight="800">0–1000 g</text></svg>`;
}
function cylinderSvg(ml){
 const max=1000,H=150,top=12,bottom=132,fillH=(ml/max)*(bottom-top),fy=bottom-fillH;
 let marks='';for(let v=0;v<=1000;v+=100){const y=bottom-(v/max)*(bottom-top);marks+=`<line x1="76" y1="${y}" x2="89" y2="${y}" stroke="#405072" stroke-width="2"/>${v%200===0?`<text x="94" y="${y+4}" font-size="9">${v}</text>`:''}`}
 return `<svg viewBox="0 0 130 ${H}" width="130" style="display:block;margin:0 auto 10px"><path d="M40 10 L40 132 Q40 140 58 140 Q76 140 76 132 L76 10" fill="#f8fbff" stroke="#405072" stroke-width="3"/><rect x="43" y="${fy}" width="30" height="${fillH}" fill="#7fcfff" opacity=".8"/>${marks}<text x="58" y="149" text-anchor="middle" font-size="10" font-weight="800">mL</text></svg>`;
}
function timelineSvg(sh,sm,eh,em){
 const fmt=(h,m)=>`${h}:${String(m).padStart(2,'0')}`;
 return `<svg viewBox="0 0 330 78" width="min(340px,98%)" style="display:block;margin:0 auto 10px"><line x1="42" y1="36" x2="288" y2="36" stroke="#405072" stroke-width="4"/><circle cx="55" cy="36" r="7" fill="#78a9ff"/><circle cx="275" cy="36" r="7" fill="#8bd3a8"/><text x="55" y="64" text-anchor="middle" font-size="13" font-weight="800">${fmt(sh,sm)}</text><text x="275" y="64" text-anchor="middle" font-size="13" font-weight="800">${fmt(eh,em)}</text><path d="M135 22 Q165 4 195 22" fill="none" stroke="#f0ae3d" stroke-width="3"/><path d="M190 16 l10 6 -10 6" fill="#f0ae3d"/></svg>`;
}
function tallyTable(labels,vals){
 const tally=n=>{let s='';for(let i=0;i<n;i++)s+=(i>0&&i%5===0?' ':'')+'|';return s};
 return `<table style="border-collapse:collapse;margin:6px auto 12px;background:#fff;font-size:14px"><tr><th style="border:2px solid #9aa8c3;padding:6px 10px">Item</th><th style="border:2px solid #9aa8c3;padding:6px 10px">Gundalan</th></tr>${labels.map((l,i)=>`<tr><td style="border:2px solid #9aa8c3;padding:6px 10px;font-weight:800">${l}</td><td style="border:2px solid #9aa8c3;padding:6px 10px;font-family:monospace;font-weight:900;letter-spacing:2px">${tally(vals[i])}</td></tr>`).join('')}</table>`;
}
function barChart(labels,vals){
 const max=Math.max(10,Math.ceil(Math.max(...vals)/2)*2),W=330,H=190,left=42,base=154,top=16,plotH=base-top,bw=42,gap=22;
 let grid='';for(let v=0;v<=max;v+=2){const y=base-(v/max)*plotH;grid+=`<line x1="${left}" y1="${y}" x2="318" y2="${y}" stroke="#d8dfed" stroke-width="1"/><text x="34" y="${y+4}" text-anchor="end" font-size="10" fill="#55627a">${v}</text>`}
 let bars='';labels.forEach((l,i)=>{const x=58+i*(bw+gap),h=(vals[i]/max)*plotH,y=base-h;bars+=`<rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="5" fill="${['#78a9ff','#8bd3a8','#ffd36d','#f0a4ba'][i%4]}"/><text x="${x+bw/2}" y="174" text-anchor="middle" font-size="11" font-weight="800" fill="#405072">${l}</text>`});
 return `<svg viewBox="0 0 ${W} ${H}" width="min(350px,100%)" style="display:block;margin:0 auto 10px">${grid}<line x1="${left}" y1="${top}" x2="${left}" y2="${base}" stroke="#405072" stroke-width="2"/><line x1="${left}" y1="${base}" x2="318" y2="${base}" stroke="#405072" stroke-width="2"/>${bars}</svg>`;
}
function uniqueValues(n,min=2,max=10){const a=[];while(a.length<n){const v=R(min,max);if(!a.includes(v))a.push(v)}return a}
function fractionVisual(num,den){
 let cells='';for(let i=0;i<den;i++)cells+=`<div style="flex:1;height:34px;border-left:${i?'2px':'0'} solid #516684;background:${i<num?'#62c991':'#edf2ff'}"></div>`;
 return `<div class="fractionVisual" role="img" aria-label="Satu keseluruhan dibahagi kepada ${den} bahagian sama besar; ${num} bahagian berlorek" style="width:min(280px,94%);display:flex;border:3px solid #516684;border-radius:10px;overflow:hidden;margin:2px auto 12px;box-shadow:0 2px 0 #d3daea">${cells}</div>`;
}
function rectangleMeasureSvg(length,width){
 return `<svg class="geometryVisual" viewBox="0 0 260 130" width="min(290px,94%)" role="img" aria-label="Segi empat tepat berukuran ${length} sentimeter kali ${width} sentimeter" style="display:block;margin:0 auto 10px"><rect x="45" y="25" width="170" height="78" rx="3" fill="#dceaff" stroke="#405072" stroke-width="4"/><text x="130" y="18" text-anchor="middle" font-size="15" font-weight="900" fill="#405072">${length} cm</text><text x="228" y="68" text-anchor="middle" font-size="15" font-weight="900" fill="#405072" transform="rotate(90 228 68)">${width} cm</text></svg>`;
}
function comparisonBarsSvg(a,b,unit,labelA='A',labelB='B'){
 const max=Math.max(a,b),wa=50+150*a/max,wb=50+150*b/max;
 return `<svg class="measureVisual" viewBox="0 0 280 105" width="min(300px,96%)" role="img" aria-label="Perbandingan ${a} ${unit} dengan ${b} ${unit}" style="display:block;margin:0 auto 10px"><text x="15" y="30" font-size="13" font-weight="900">${labelA}</text><rect x="42" y="14" width="${wa}" height="24" rx="6" fill="#78a9ff"/><text x="${48+wa}" y="31" font-size="12" font-weight="800">${a} ${unit}</text><text x="15" y="78" font-size="13" font-weight="900">${labelB}</text><rect x="42" y="62" width="${wb}" height="24" rx="6" fill="#8bd3a8"/><text x="${48+wb}" y="79" font-size="12" font-weight="800">${b} ${unit}</text></svg>`;
}
function fractionWrongChoices(num,den){
 const ans=`${num}/${den}`,cands=[];
 for(const [n,d] of [[den,num],[Math.max(1,num-1),den],[Math.min(den-1,num+1),den],[num,den===10?8:10],[1,den],[den-1,den],[num,Math.max(2,den-1)]]){
   if(n<d && n>0 && d>1){const v=`${n}/${d}`;if(v!==ans&&!cands.includes(v))cands.push(v)}
 }
 let d=2;while(cands.length<3){const n=1,v=`${n}/${d}`;if(v!==ans&&!cands.includes(v))cands.push(v);d++}
 return cands.slice(0,3).map(x=>N(x,'fraction'));
}
function fractionSetVisual(selected,total){
 const dots=Array.from({length:total},(_,i)=>`<circle cx="${22+(i%5)*42}" cy="${22+Math.floor(i/5)*42}" r="14" fill="${i<selected?'#62c991':'#e5ebf7'}" stroke="#516684" stroke-width="2"/>`).join('');
 return `<svg class="fractionSetVisual" viewBox="0 0 220 ${total>5?86:46}" width="min(250px,92%)" role="img" aria-label="${selected} daripada ${total} objek dipilih" style="display:block;margin:0 auto 10px">${dots}</svg>`;
}
