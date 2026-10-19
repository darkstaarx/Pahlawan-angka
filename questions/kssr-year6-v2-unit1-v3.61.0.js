// Year 6 Curriculum Bank v2 — Unit 1: Nombor Bulat dan Operasi Asas
// Every archetype draws its own values so a pupil does not meet the same item twice.
(function(){
'use strict';
const RT=window.PAY6V2Runtime;if(!RT)return;
const {GEN,Nq,choose,rand,q,mark,chooseMode,bandModes,stage,recentFor,table,who,fmtN,words,distinct}=RT;
const isPrime=n=>{if(n<2)return false;for(let i=2;i*i<=n;i++)if(n%i===0)return false;return true};

const PLACE=['sa','puluh','ratus','ribu','puluh ribu','ratus ribu','juta'];
const dec=x=>String(Number(x.toFixed(3)));
// A 7-digit number with distinct non-zero digits in the given places, zeros elsewhere.
function sparse(places){let n=choose([1,2,3,4,5,6,7,8,9])*1e6;const used=new Set([Math.floor(n/1e6)]);for(const p of places){let d;do d=rand(1,9);while(used.has(d));used.add(d);n+=d*10**p}return n}
// A 7-digit number with all-different digits (so "digit d" names one place).
function distinctDigits(){const ds=[...Array(10).keys()].sort(()=>Math.random()-.5);if(ds[0]===0)ds.push(ds.shift());return Number(ds.slice(0,7).join(''))}
const digitAt=(n,p)=>Math.floor(n/10**p)%10;

GEN['1.1.1']=function(id,s){
 const mode=chooseMode(id,'1.1.1',bandModes(s,['digit_read','word_write'],['digit_read','word_write','order_numbers'],['number_claim','between_constraint','order_numbers']));
 const m=rand(1,9),th=choose([rand(1,9)*10,rand(1,9)*100,rand(101,999),rand(1,9)*100+rand(1,9)]),u=choose([rand(1,9)*100,rand(10,99),rand(101,999),rand(1,9)]),n=m*1e6+th*1000+u;
 if(mode==='digit_read'){
  const opts=[m*1e6+u*1000+(th%1000),m*1e6+((th*10)%1000)*1000+u,n+(m<9?1e6:-1e6),m*1e6+th*100+u,n+100000,n-1000].filter(v=>v>=1e6&&v<1e7).map(words);
  return mark(q('Bagaimanakah nombor <b>'+fmtN(n)+'</b> dibaca?',words(n),distinct(words(n),opts,'number_read'),'Baca mengikut kumpulan juta, ribu dan sa.','Tahun 6 · Membaca Nombor'),id,'1.1.1',mode,'verbal',stage(s)===1?'concept':'application',s,['number_read']);
 }
 if(mode==='word_write')return mark(q('Tulis dalam angka: <b>'+words(n)+'</b>.',n,distinct(n,[m*1e6+u*1000+(th%1000),m*1e6+((th*10)%1000)*1000+u,n+100000,n-1000].filter(v=>v>=1e6&&v<1e7),'number_write'),'Pisahkan juta, ribu dan sa sebelum menulis angka.','Tahun 6 · Menulis Nombor'),id,'1.1.1',mode,'verbal',stage(s)===3?'reasoning':'application',s,['number_write']);
 if(mode==='order_numbers'){
  const a=rand(1,9),b=rand(1,9)===a?(a%9)+1:rand(1,9),bb=b===a?(a%9)+1:b;
  const vals=[m*1e6+a*1e5+bb*1e4,m*1e6+bb*1e5+a*1e4,m*1e6+a*1e5+bb*1e3].sort(()=>Math.random()-.5),asc=[...vals].sort((x,y)=>x-y),line=v=>v.map(fmtN).join(' < '),ans=line(asc);
  const wrongOrders=[[...asc].reverse(),vals,[asc[1],asc[0],asc[2]],[asc[0],asc[2],asc[1]],[asc[2],asc[0],asc[1]]].map(line).filter((v,i,arr)=>v!==ans&&arr.indexOf(v)===i).slice(0,3);
  return mark(q('Susun daripada kecil ke besar: <b>'+vals.map(fmtN).join(', ')+'</b>',ans,wrongOrders.map(v=>Nq(v,'order')),'Banding digit dari nilai tempat terbesar.','Tahun 6 · Menyusun Nombor'),id,'1.1.1',mode,'symbolic',stage(s)===3?'reasoning':'application',s,['order']);
 }
 if(mode==='number_claim'){
  const t=rand(1,9),h=rand(1,9),x=m*1e6+t*10000+h*100,said=words(m*1e6+t*100000+h*100),name=who();
  return mark(q(name+' membaca '+fmtN(x)+' sebagai "'+said+'". Adakah '+name+' betul?','salah, bacaan yang betul ialah '+words(x),distinct('salah, bacaan yang betul ialah '+words(x),['betul','salah, '+words(m*1e6+t*1000+h*100),'salah, '+words(m*1e6+t*10000+h*10)],'number_read'),'Perhatikan nilai tempat setiap digit.','Tahun 6 · Menilai Bacaan Nombor'),id,'1.1.1',mode,'verbal','reasoning',s,['number_read','error_analysis']);
 }
 const lo=rand(1,9)+rand(1,18)*0.05,hi=lo+0.05,L=Math.round(lo*1e6),H=Math.round(hi*1e6);
 return mark(q('Nombor manakah lebih besar daripada '+dec(lo)+' juta tetapi lebih kecil daripada '+dec(hi)+' juta?',L+25000,distinct(L+25000,[L-25000,H+5000,L],'range'),'Tukar kedua-dua sempadan kepada nombor bulat dahulu.','Tahun 6 · Julat Nombor'),id,'1.1.1',mode,'verbal','reasoning',s,['range']);
};

GEN['1.1.2']=function(id,s){
 const mode=chooseMode(id,'1.1.2',bandModes(s,['place_name','digit_value'],['digit_value','expanded_form','place_compare'],['place_error','expanded_form','place_compare']));
 const n=distinctDigits();let p;do p=rand(1,5);while(digitAt(n,p)===0);const d=digitAt(n,p);
 if(mode==='place_name')return mark(q('Nyatakan nilai tempat bagi digit '+d+' dalam nombor '+fmtN(n)+'.',PLACE[p],distinct(PLACE[p],[PLACE[p+1],PLACE[p-1],PLACE[p+2]||PLACE[p-2]],'place'),'Kira nilai tempat dari kanan.','Tahun 6 · Nilai Tempat'),id,'1.1.2',mode,'symbolic','concept',s,['place']);
 if(mode==='digit_value')return mark(q('Nyatakan nilai digit bagi digit '+d+' dalam nombor '+fmtN(n)+'.',d*10**p,distinct(d*10**p,[d*10**(p-1),d*10**(p+1),d],'place'),'Digit '+d+' berada pada tempat '+PLACE[p]+'.','Tahun 6 · Nilai Digit'),id,'1.1.2',mode,'symbolic',stage(s)===3?'reasoning':'application',s,['place']);
 if(mode==='expanded_form'){
  const x=sparse(choose([[4,2,1],[5,3,1],[4,3,0],[5,2,1],[3,2,0]])),parts=[6,5,4,3,2,1,0].map(k=>digitAt(x,k)*10**k).filter(Boolean),line=a=>a.map(fmtN).join(' + ');
  const shift=(i,f)=>line(parts.map((v,j)=>j===i?v*f:v));
  return mark(q('Bentuk cerakin yang betul bagi <b>'+fmtN(x)+'</b> ialah?',line(parts),distinct(line(parts),[shift(1,1/10),shift(0,1/10),shift(2,1/10),shift(parts.length-1,10)],'expanded'),'Cerakinkan setiap digit bukan sifar mengikut nilai tempatnya.','Tahun 6 · Cerakin Nombor'),id,'1.1.2',mode,'symbolic',stage(s)===3?'reasoning':'application',s,['expanded']);
 }
 if(mode==='place_compare'){
  const [a,b]=choose([[8,2],[6,3],[9,3],[4,2],[6,2],[8,4]]),p1=rand(3,5),p2=rand(1,p1-2),filler=[1,5,7,0].filter(v=>v!==a&&v!==b);
  let digits=Array(7).fill(0).map((_,k)=>filler[k%filler.length]);digits[6-p1]=a;digits[6-p2]=b;if(digits[0]===0)digits[0]=filler.find(v=>v)||1;
  const x=Number(digits.join('')),ans=a/b*10**(p1-p2);
  return mark(q('Dalam nombor '+fmtN(x)+', nilai digit '+a+' ialah berapa kali nilai digit '+b+'?',ans,distinct(ans,[10**(p1-p2),ans/10,ans*10],'place'),'Cari nilai kedua-dua digit, kemudian bahagi.','Tahun 6 · Banding Nilai Digit'),id,'1.1.2',mode,'verbal',stage(s)===3?'reasoning':'application',s,['place','compare']);
 }
 const name=who(),said=d*10**(p-1);
 return mark(q(name+' berkata nilai digit '+d+' dalam nombor '+fmtN(n)+' ialah '+fmtN(said)+'. Adakah '+name+' betul?','salah, nilainya '+fmtN(d*10**p),distinct('salah, nilainya '+fmtN(d*10**p),['betul','salah, nilainya '+fmtN(d*10**(p+1)),'salah, nilainya '+d],'place'),'Digit '+d+' berada pada tempat '+PLACE[p]+'.','Tahun 6 · Analisis Nilai Tempat'),id,'1.1.2',mode,'verbal','reasoning',s,['place','error_analysis']);
};

const FRAC=[[1,2],[1,4],[3,4],[1,5],[2,5],[3,5],[4,5],[1,10],[3,10],[7,10],[9,10],[1,8],[3,8]];
const fval=f=>f[0]*1e6/f[1];
GEN['1.1.3']=function(id,s){
 const mode=chooseMode(id,'1.1.3',bandModes(s,['fraction_to_number','number_to_fraction'],['fraction_to_number','number_to_fraction','compare'],['compare','sum','error']));
 const f=choose(FRAC),v=fval(f),ft=f[0]+'/'+f[1]+' juta';
 if(mode==='fraction_to_number')return mark(q('Tulis <b>'+ft+'</b> sebagai nombor bulat.',v,distinct(v,[v/10,1e6-v,f[0]*1e6/(f[1]*10),f[1]*100000],'fraction_million'),'Cari pecahan daripada 1 000 000.','Tahun 6 · Pecahan Juta'),id,'1.1.3',mode,'symbolic',stage(s)===1?'procedure':'application',s,['fraction_million']);
 if(mode==='number_to_fraction')return mark(q('Tulis <b>'+fmtN(v)+'</b> dalam bentuk pecahan juta.',ft,distinct(ft,[f[1]+'/'+f[0]+' juta',f[0]+'/'+(f[1]*10)+' juta',(v/100000)+' juta'],'fraction_million'),'Banding dengan 1 000 000 dan ringkaskan pecahan.','Tahun 6 · Nombor kepada Pecahan Juta'),id,'1.1.3',mode,'symbolic',stage(s)===3?'reasoning':'application',s,['fraction_million']);
 if(mode==='compare'){
  const dv=Math.min(0.95,Math.max(0.05,Number((f[0]/f[1]+choose([-0.05,0.05,-0.15,0.1])).toFixed(2)))),dt=dv+' juta',ans=dv>f[0]/f[1]?dt:dv<f[0]/f[1]?ft:'sama nilai';
  return mark(q('Yang manakah lebih besar: <b>'+ft+'</b> atau <b>'+dt+'</b>?',ans,distinct(ans,[ans===ft?dt:ft,'sama nilai','tidak boleh dibanding'],'fraction_million'),f[0]+'/'+f[1]+' juta = '+fmtN(v)+'.','Tahun 6 · Banding Pecahan Juta'),id,'1.1.3',mode,'verbal',stage(s)===3?'reasoning':'application',s,['fraction_million','compare']);
 }
 if(mode==='sum'){
  const pool=FRAC.filter(g=>g!==f&&fval(g)+v<1e6),base=pool.length?f:[1,4],g=choose(pool.length?pool:FRAC.filter(x=>fval(x)<750000&&x!==base)),bv=fval(base),bt=base[0]+'/'+base[1]+' juta';
  const ans=bv+fval(g);
  return mark(q('Sebuah daerah mempunyai '+bt+' orang penduduk. Seramai '+g[0]+'/'+g[1]+' juta orang lagi berpindah ke daerah itu. Berapakah jumlah penduduk daerah itu sekarang?',ans,distinct(ans,[Math.abs(bv-fval(g)),bv,ans+100000],'fraction_million'),'Tukar setiap pecahan juta kepada nombor bulat, kemudian tambah.','Tahun 6 · Aplikasi Pecahan Juta'),id,'1.1.3',mode,'story','reasoning',s,['fraction_million','multi_step']);
 }
 const name=who(),said=f[0]*100000===v?v/2:f[0]*100000;
 return mark(q(name+' menulis '+ft+' = '+fmtN(said)+'. Adakah '+name+' betul?','salah, '+ft+' = '+fmtN(v),distinct('salah, '+ft+' = '+fmtN(v),['betul','salah, '+ft+' = '+fmtN(v*10>=1e7?v/10:v*10),'salah, '+ft+' = '+fmtN(v/10)],'fraction_million'),'1/'+f[1]+' juta = '+fmtN(1e6/f[1])+'.','Tahun 6 · Semak Pecahan Juta'),id,'1.1.3',mode,'verbal','reasoning',s,['fraction_million','error_analysis']);
};

GEN['1.1.4']=function(id,s){
 const mode=chooseMode(id,'1.1.4',bandModes(s,['decimal_to_number','number_to_decimal'],['decimal_to_number','number_to_decimal','compare'],['compare','operation','error']));
 const m=rand(1,9),frac=choose([rand(1,9)*100000,rand(1,99)*10000,rand(1,9)*1000+rand(0,9)*100000,rand(1,9)*1000]),n=m*1e6+frac,d=dec(n/1e6);
 if(mode==='decimal_to_number')return mark(q('Tulis <b>'+d+' juta</b> sebagai nombor bulat.',n,distinct(n,[n/10,n+100000,n-100000,m*1e6+frac/10],'decimal_million'),'Darab dengan 1 000 000.','Tahun 6 · Perpuluhan Juta'),id,'1.1.4',mode,'symbolic',stage(s)===1?'procedure':'application',s,['decimal_million']);
 if(mode==='number_to_decimal')return mark(q('Tulis <b>'+fmtN(n)+'</b> dalam juta, dalam bentuk perpuluhan.',d+' juta',distinct(d+' juta',[dec(n/1e7)+' juta',dec(n/1e6+1)+' juta',dec(n/1e5)+' juta'],'decimal_million'),'Bahagi dengan 1 000 000.','Tahun 6 · Nombor kepada Perpuluhan Juta'),id,'1.1.4',mode,'symbolic',stage(s)===3?'reasoning':'application',s,['decimal_million']);
 if(mode==='compare'){
  const other=n+choose([-45000,45000,-5000,5000]),ans=n>other?d+' juta':fmtN(other);
  return mark(q('Yang manakah lebih besar: <b>'+d+' juta</b> atau <b>'+fmtN(other)+'</b>?',ans,distinct(ans,[ans===fmtN(other)?d+' juta':fmtN(other),'sama nilai','tidak boleh dibanding'],'decimal_million'),d+' juta = '+fmtN(n)+'.','Tahun 6 · Banding Perpuluhan Juta'),id,'1.1.4',mode,'verbal',stage(s)===3?'reasoning':'application',s,['decimal_million','compare']);
 }
 if(mode==='operation'){
  const a=rand(2,9)+rand(1,9)/10,b=rand(5,95)/100,ans=Math.round((a-b)*1e6);
  return mark(q(dec(a)+' juta − '+dec(b)+' juta = ______. Beri jawapan sebagai nombor bulat.',ans,distinct(ans,[ans-100000,ans+300000,Math.round((a+b)*1e6)],'decimal_million'),dec(a)+' − '+dec(b)+' = '+dec(a-b)+' juta.','Tahun 6 · Operasi Perpuluhan Juta'),id,'1.1.4',mode,'symbolic','reasoning',s,['decimal_million','operation']);
 }
 const name=who(),x=m*1e6+rand(1,9)*10000+rand(1,9)*1000,xd=dec(x/1e6),said=m*1e6+(x%1e6)*10;
 return mark(q(name+' menulis '+xd+' juta = '+fmtN(said)+'. Adakah '+name+' betul?','salah, '+xd+' juta = '+fmtN(x),distinct('salah, '+xd+' juta = '+fmtN(x),['betul','salah, '+xd+' juta = '+fmtN(x/10),'salah, '+xd+' juta = '+fmtN(m*1e6+(x%1e6)/10)],'decimal_million'),'Darab '+xd+' dengan 1 000 000.','Tahun 6 · Semak Perpuluhan Juta'),id,'1.1.4',mode,'verbal','reasoning',s,['decimal_million','error_analysis']);
};

GEN['1.1.5']=function(id,s){
 const mode=chooseMode(id,'1.1.5',bandModes(s,['next','missing'],['next','missing','rule'],['rule','reverse','error']));
 if(mode==='next'){
  const step=choose([75000,125000,150000,200000,250000])*choose([1,-1]),start=rand(15,60)*100000+(step<0?2000000:0),seq=[0,1,2].map(k=>start+k*step),ans=start+3*step;
  return mark(q('Lengkapkan pola nombor ini: '+seq.map(fmtN).join(', ')+', ___',ans,distinct(ans,[ans-step,ans+step,ans+2*step],'pattern'),'Cari beza tetap antara dua nombor bersebelahan.','Tahun 6 · Pola Nombor'),id,'1.1.5',mode,'symbolic',stage(s)===1?'procedure':'application',s,['pattern']);
 }
 const step=choose([0.15,0.2,0.25,0.3,0.35]),start=rand(1,6)+rand(0,9)/10,term=k=>Number((start+k*step).toFixed(2)).toFixed(2);
 if(mode==='missing')return mark(q('Lengkapkan pola nombor ini: '+term(0)+' juta, ___, '+term(2)+' juta, '+term(3)+' juta.',term(1)+' juta',distinct(term(1)+' juta',[Number(term(1)-0.1).toFixed(2)+' juta',Number(+term(1)+0.1).toFixed(2)+' juta',term(2)+' juta'],'pattern'),'Pola bertambah '+step+' juta.','Tahun 6 · Nombor Hilang'),id,'1.1.5',mode,'symbolic',stage(s)===3?'reasoning':'application',s,['pattern']);
 if(mode==='rule')return mark(q('Apakah peraturan bagi pola nombor '+[0,1,2,3].map(k=>term(k)+' juta').join(', ')+'?','tambah '+step+' juta setiap kali',distinct('tambah '+step+' juta setiap kali',['tambah '+Number((step-0.05).toFixed(2))+' juta setiap kali','darab '+step,'tolak '+step+' juta setiap kali'],'pattern'),'Banding beza setiap pasangan.','Tahun 6 · Peraturan Pola'),id,'1.1.5',mode,'verbal',stage(s)===3?'reasoning':'application',s,['pattern']);
 if(mode==='reverse'){
  const st=choose([125000,150000,175000,225000]),t4=rand(15,40)*100000,ans=t4+3*st;
  return mark(q('Suatu pola nombor berkurang '+fmtN(st)+' setiap kali. Nombor keempat dalam pola itu ialah '+fmtN(t4)+'. Apakah nombor pertama?',ans,distinct(ans,[t4+2*st,t4-3*st,t4+4*st],'pattern'),'Bergerak ke belakang tiga langkah dengan menambah '+fmtN(st)+'.','Tahun 6 · Pola Songsang'),id,'1.1.5',mode,'verbal','reasoning',s,['pattern','inverse']);
 }
 const name=who(),bad=Number((+term(3)+0.1).toFixed(2)).toFixed(2);
 return mark(q(name+' berkata pola '+[term(0),term(1),term(2),bad].map(x=>x+' juta').join(', ')+' bertambah '+step+' juta setiap kali. Adakah '+name+' betul?','salah kerana langkah terakhir bertambah '+Number((step+0.1).toFixed(2))+' juta',distinct('salah kerana langkah terakhir bertambah '+Number((step+0.1).toFixed(2))+' juta',['betul','salah kerana semua langkah bertambah 0.1 juta','betul jika nombor akhir dibundarkan'],'pattern'),'Semak setiap beza berturutan.','Tahun 6 · Semak Pola'),id,'1.1.5',mode,'verbal','reasoning',s,['pattern','error_analysis']);
};

const STORIES=[
 {box:'kotak buku',item:'buah buku',act:'dijual',left:'buku'},
 {box:'kotak pensel',item:'batang pensel',act:'diedarkan',left:'pensel'},
 {box:'bungkus gula-gula',item:'biji gula-gula',act:'dimakan',left:'gula-gula'},
 {box:'dulang telur',item:'biji telur',act:'digunakan',left:'telur'},
 {box:'kotak air kotak',item:'kotak air',act:'diminum',left:'air kotak'}
];
GEN['1.2.1']=function(id,s){
 const history=recentFor(id),slot=history.length%5;
 const mode=(slot===0||slot===3)?(slot===0?'written_add':'written_div'):chooseMode(id,'1.2.1',bandModes(s,['order','brackets'],['order','brackets','unknown','story'],['unknown','story','method','error','estimate']));
 if(mode==='written_add'){
  const a=rand(12000,65000),b=rand(1000,Math.min(24000,a-1)),ans=a+b,out=mark(q(a+' + '+b+' = ?',ans,[Nq(a-b,'operation'),Nq(ans+1000,'place'),Nq(ans-1000,'place')],'Selarikan nilai tempat sebelum menambah.','Tahun 6 · Bentuk Lazim Tambah'),id,'1.2.1','written_add','symbolic','procedure',s,['operation']);
  // Focus v2: exact column features (carry columns, digits) from the shared add/sub tagger.
  if(typeof addSubFocusMeta==='function'&&typeof attachFoundationQuestionTags==='function'){const meta=addSubFocusMeta(id,'addition',[a,b],ans);attachFoundationQuestionTags(out,{...meta,evidence:{...meta.evidence,questionFamilyKey:out.archetypeId,tagRevision:'d6-authored-v1'}})}
  out.writtenArithmeticMode='required';return out;
 }
 if(mode==='written_div'){
  const divisor=choose([12,15,20,25]),quotient=rand(12,40),dividend=divisor*quotient,out=mark(q(dividend+' ÷ '+divisor+' = ?',quotient,[Nq(divisor,'division'),Nq(quotient+5,'division'),Nq(Math.max(1,quotient-5),'division')],'Gunakan bahagi panjang dan semak dengan darab.','Tahun 6 · Bentuk Lazim Bahagi'),id,'1.2.1','written_div','symbolic','procedure',s,['division']);
  if(typeof attachFoundationQuestionTags==='function')attachFoundationQuestionTags(out,{originSkillId:id,contextDomain:'number',diagnosticFamily:'two_digit_div',taskRole:'quotient',
   arithmeticProfile:{operationFamilies:['division'],operands:{dividend,divisor,quotient,remainder:0,unit:'integer'},operandDimensions:{dividendDigits:String(dividend).length,divisorDigits:2,quotientDigits:String(quotient).length,canHaveRemainder:false,decimalPlaces:0,stepCount:1},steps:['division']},
   probes:{foundationIds:['div.multidigit','div.facts','mul.facts'],conceptIds:[],diagnosticPurpose:'normal'},
   evidence:{questionFamilyKey:out.archetypeId,representation:'symbolic',demand:'procedure',difficultyBand:out.difficultyBand,misconceptionTargets:['division'],tagRevision:'d6-authored-v1'}});
  out.writtenArithmeticMode='required';return out;
 }
 if(mode==='order'){const a=rand(40,90),b=rand(10,25),c=rand(2,9),ans=a+b*c;return mark(q(a+' + '+b+' × '+c+' = ?',ans,distinct(ans,[(a+b)*c,a+b+c,a*c+b],'operation'),'Darab dahulu.','Tahun 6 · Tertib Operasi'),id,'1.2.1',mode,'symbolic',stage(s)===1?'procedure':'application',s,['operation']);}
 if(mode==='brackets'){const a=rand(20,60),b=rand(5,15),c=rand(2,8),ans=(a+b)*c;return mark(q('('+a+' + '+b+') × '+c+' = ?',ans,distinct(ans,[a+b*c,a+b+c,(a+b)*(c+1)],'operation'),'Selesaikan kurungan dahulu.','Tahun 6 · Operasi dengan Kurungan'),id,'1.2.1',mode,'symbolic',stage(s)===1?'procedure':'application',s,['operation','brackets']);}
 if(mode==='unknown'){const x=rand(6,30),b=rand(2,9),c=rand(10,60),total=x*b+c;return mark(q('□ × '+b+' + '+c+' = '+total+'. Cari nilai □.',x,distinct(x,[total-c,Math.round(total/b),Math.round((total+c)/b)],'inverse'),'Tolak '+c+', kemudian bahagi dengan '+b+'.','Tahun 6 · Nilai Tidak Diketahui'),id,'1.2.1',mode,'symbolic',stage(s)===3?'reasoning':'application',s,['operation','inverse']);}
 if(mode==='story'){
  const st=choose(STORIES),boxes=rand(4,15),each=choose([12,15,20,24,25,30,40]),used=rand(2,boxes-1)*each-choose([0,rand(1,each-1)]),ans=boxes*each-used;
  return mark(q('Sebuah kedai ada '+boxes+' '+st.box+'. Setiap satu mengandungi '+each+' '+st.item+'. Sebanyak '+used+' '+st.item+' telah '+st.act+'. Berapakah bilangan '+st.left+' yang tinggal?',ans,distinct(ans,[boxes*each,boxes*each+used,ans-each],'operation'),'Darab dahulu, kemudian tolak.','Tahun 6 · Masalah Operasi Gabungan'),id,'1.2.1',mode,'story',stage(s)===3?'reasoning':'application',s,['operation','multi_step']);
 }
 if(mode==='method'){
  const a=rand(20,70),b=rand(5,20),c=rand(3,9),[x,y]=who(2),right=choose([x,y]);
  const good=(a+b)+' × '+c,bad=a+' + '+(b*c),pr=right===x?[good,bad]:[bad,good];
  return mark(q('Untuk ('+a+' + '+b+') × '+c+', '+x+' mengira '+pr[0]+'. '+y+' mengira '+pr[1]+'. Siapakah yang betul?',right,distinct(right,[right===x?y:x,'kedua-duanya betul','kedua-duanya salah'],'operation'),'Selesaikan kurungan dahulu.','Tahun 6 · Membanding Kaedah'),id,'1.2.1',mode,'verbal','reasoning',s,['operation','method']);
 }
 if(mode==='error'){
  const a=rand(20,60),b=rand(6,15),c=rand(3,9),name=who(),wrongAns=(a+b)*c,ans=a+b*c;
  return mark(q(name+' mendapat '+wrongAns+' bagi '+a+' + '+b+' × '+c+' kerana dia menambah dahulu. Apakah jawapan yang betul?',ans,distinct(ans,[wrongAns,b*c,a*c+b],'operation'),b+' × '+c+' = '+(b*c)+'; '+a+' + '+(b*c)+' = '+ans+'.','Tahun 6 · Analisis Tertib Operasi'),id,'1.2.1',mode,'verbal','reasoning',s,['operation','error_analysis']);
 }
 const a=rand(3,9)*100+choose([-20,-10,10,20]),b=rand(2,9)*10+choose([-2,-1,1,2]),est=Math.round(a/100)*100*Math.round(b/10)*10,fair=choose([true,false]),said=fair?est:est*choose([2,3])/1+(est<20000?10000:0),name=who();
 const ans=fair?'munasabah':'tidak munasabah';
 return mark(q(name+' menganggarkan '+a+' × '+b+' ≈ '+fmtN(said)+'. Adakah anggaran '+name+' munasabah?',ans,distinct(ans,[fair?'tidak munasabah':'munasabah','tepat tanpa mengira','maklumat tidak cukup'],'estimate'),Math.round(a/100)*100+' × '+Math.round(b/10)*10+' = '+fmtN(est)+'.','Tahun 6 · Kemunasabahan Operasi'),id,'1.2.1',mode,'verbal','reasoning',s,['estimate']);
};

const oddComposites=[];for(let n=21;n<100;n+=2)if(!isPrime(n)&&n%5!==0)oddComposites.push(n);
const primes2=[];for(let n=11;n<100;n++)if(isPrime(n))primes2.push(n);
const factorPair=n=>{for(let i=3;i*i<=n;i+=2)if(n%i===0)return [i,n/i];return [1,n]};
GEN['1.3.1']=function(id,s){
 const mode=chooseMode(id,'1.3.1',bandModes(s,['classify','choose_prime'],['classify','choose_prime','factor_reason'],['factor_reason','claim','range']));
 if(mode==='classify'){const n=choose([...primes2.filter(x=>x>20),...oddComposites]),prime=isPrime(n);return mark(q('Nyatakan jenis nombor bagi '+n+'.',prime?'nombor perdana':'nombor gubahan',[Nq(prime?'nombor gubahan':'nombor perdana','prime'),Nq('nombor genap','prime'),Nq('bukan nombor bulat','prime')],'Nombor perdana mempunyai tepat dua faktor.','Tahun 6 · Perdana dan Gubahan'),id,'1.3.1',mode,'symbolic','concept',s,['prime']);}
 if(mode==='choose_prime'){const p=choose(primes2.filter(x=>x>20)),others=[...oddComposites].sort(()=>Math.random()-.5).slice(0,3),all=[p,...others].sort((a,b)=>a-b);return mark(q('Antara '+all.slice(0,3).join(', ')+' dan '+all[3]+', yang manakah nombor perdana?',p,others.map(v=>Nq(v,'prime')),'Semak faktor setiap nombor.','Tahun 6 · Kenal Perdana'),id,'1.3.1',mode,'symbolic',stage(s)===3?'reasoning':'application',s,['prime']);}
 const n=choose(oddComposites),[f1,f2]=factorPair(n);
 if(mode==='factor_reason')return mark(q('Mengapakah '+n+' ialah nombor gubahan?',n+' mempunyai faktor '+f1+' dan '+f2,[Nq('kerana '+n+' nombor ganjil','prime'),Nq('kerana semua nombor dua digit ialah gubahan','prime'),Nq('kerana '+n+' lebih besar daripada 20','prime')],'Cari faktor selain 1 dan '+n+'.','Tahun 6 · Sebab Nombor Gubahan'),id,'1.3.1',mode,'verbal','reasoning',s,['prime','factor']);
 if(mode==='claim'){const name=who();return mark(q(name+' berkata '+n+' ialah nombor perdana kerana '+n+' nombor ganjil. Adakah '+name+' betul?','salah kerana '+n+' = '+f1+' × '+f2,[Nq('betul','prime'),Nq('betul kerana '+n+' tidak boleh dibahagi dengan 2','prime'),Nq('salah kerana semua nombor ganjil ialah gubahan','prime')],'Nombor ganjil tidak semestinya perdana.','Tahun 6 · Menilai Dakwaan Perdana'),id,'1.3.1',mode,'verbal','reasoning',s,['prime','error_analysis']);}
 // "Saya ialah nombor perdana antara ... " with a digit-sum clue that leaves exactly one prime.
 const sum=x=>Math.floor(x/10)+x%10;let lo,ps,pick;
 do{lo=rand(2,9)*10;ps=primes2.filter(x=>x>lo&&x<lo+10);pick=ps.filter(x=>ps.filter(y=>sum(y)===sum(x)).length===1)}while(!pick.length);
 const p=choose(pick),wrong=[];for(let x=lo+1;x<lo+10;x+=2)if(x!==p)wrong.push(x);
 return mark(q('Saya ialah nombor perdana antara '+lo+' dengan '+(lo+10)+'. Hasil tambah dua digit saya ialah '+sum(p)+'. Apakah nombor saya?',p,distinct(p,wrong.sort(()=>Math.random()-.5),'prime'),'Senaraikan nombor perdana dalam julat, kemudian semak hasil tambah digit.','Tahun 6 · Perdana dalam Julat'),id,'1.3.1',mode,'verbal','reasoning',s,['prime','range']);
};

const PLACES=[['bandar'],['daerah'],['pulau'],['negeri']];
GEN['1.4.1']=function(id,s){
 const mode=chooseMode(id,'1.4.1',bandModes(s,['total','difference'],['total','difference','million_mix'],['million_mix','reverse','decision','claim']));
 const pl=choose(PLACES);
 if(mode==='total'){const a=rand(10,60)*50000,b=rand(5,30)*10000,ans=a+b;return mark(q('Sebuah '+pl[0]+' mempunyai '+fmtN(a)+' orang penduduk. Seramai '+fmtN(b)+' orang lagi berpindah masuk. Berapakah jumlah penduduk '+pl[0]+' itu sekarang?',ans,distinct(ans,[a-b,ans+100000,b],'operation'),'Tambah kedua-dua nombor.','Tahun 6 · Masalah Nombor'),id,'1.4.1',mode,'story','application',s,['operation']);}
 if(mode==='difference'){const a=rand(40,90)*100000,b=rand(10,35)*50000,item=choose(['biji butang','batang pen','helai baju','buah buku']),ans=a-b;return mark(q('Sebuah kilang menyasarkan '+fmtN(a)+' '+item+'. Sebanyak '+fmtN(b)+' '+item+' telah siap. Berapakah bilangan lagi yang perlu dihasilkan?',ans,distinct(ans,[a+b,b,ans+100000],'operation'),'Sasaran − siap.','Tahun 6 · Masalah Baki'),id,'1.4.1',mode,'story','application',s,['operation']);}
 if(mode==='million_mix'){
  const a=rand(15,45)/10,out=rand(5,40)/100,inn=rand(5,30)*5000,ans=Math.round(a*1e6-out*1e6+inn);
  return mark(q(table(['Butiran','Bilangan orang'],[['Penduduk asal',a+' juta'],['Berpindah keluar',out+' juta'],['Berpindah masuk',fmtN(inn)]])+'Berapakah jumlah penduduk '+pl[0]+' itu sekarang?',ans,distinct(ans,[ans-2*inn,Math.round(a*1e6+out*1e6+inn),ans+100000],'operation'),'Tukar semua kepada nombor bulat dahulu.','Tahun 6 · Masalah Juta Pelbagai Bentuk'),id,'1.4.1',mode,'story','reasoning',s,['million','multi_step']);
 }
 if(mode==='reverse'){const add=rand(10,60)*10000,total=rand(20,60)/10,ans=Math.round(total*1e6-add),item=choose(['biji butang','batang pensel','biji guli']);return mark(q('Selepas '+fmtN(add)+' '+item+' ditambah, jumlah '+item+' di sebuah gudang menjadi '+total+' juta. Berapakah bilangan asal di gudang itu?',ans,distinct(ans,[Math.round(total*1e6+add),ans-add,Math.round(total*1e6)],'operation'),'Gunakan operasi songsang: tolak.','Tahun 6 · Masalah Songsang'),id,'1.4.1',mode,'story','reasoning',s,['inverse']);}
 if(mode==='decision'){
  const A=rand(80,160)/100,B=rand(40,100)/100,cap=Number((A+B+choose([-0.1,-0.05,0.05,0.1])).toFixed(2)),enough=cap>=A+B;
  return mark(q(table(['Butiran','Bilangan orang'],[['Bekalan loji air',cap+' juta'],['Keperluan Bandar A',A+' juta'],['Keperluan Bandar B',B+' juta']])+'Adakah bekalan loji air itu mencukupi untuk kedua-dua bandar?',enough?'mencukupi':'tidak mencukupi',[Nq(enough?'tidak mencukupi':'mencukupi','estimate'),Nq('tepat-tepat cukup','estimate'),Nq('tidak boleh ditentukan','estimate')],'Jumlah keperluan = '+Number((A+B).toFixed(2))+' juta.','Tahun 6 · Keputusan Berdasarkan Anggaran'),id,'1.4.1',mode,'story','reasoning',s,['estimate','decision']);
 }
 const f=choose([[1,4],[1,2],[3,4],[2,5],[1,5]]),d=choose([0.1,0.2,0.3,0.4]),tot=Number((f[0]/f[1]+d).toFixed(2)),name=who(),ok=tot<1;
 const ans=ok?'betul, jumlahnya '+tot+' juta':'salah, jumlahnya '+tot+' juta';
 return mark(q(name+' berkata '+f[0]+'/'+f[1]+' juta + '+d+' juta kurang daripada 1 juta. Adakah '+name+' betul?',ans,distinct(ans,[ok?'salah, jumlahnya '+tot+' juta':'betul, jumlahnya '+tot+' juta','salah, jumlahnya '+Number((tot+0.2).toFixed(2))+' juta','tidak boleh dibanding'],'million'),f[0]+'/'+f[1]+' = '+(f[0]/f[1])+'.','Tahun 6 · Menilai Penyelesaian'),id,'1.4.1',mode,'verbal','reasoning',s,['million','error_analysis']);
};

document.documentElement?.setAttribute('data-y6-v2-unit1','3.61.0');
})();
