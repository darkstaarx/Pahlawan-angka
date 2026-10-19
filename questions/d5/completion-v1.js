/* Darjah 5 UASA completion. Installed AFTER the final Year 5 bank; no other grade is wrapped.
   Adds the item types in the myUASA Matematik Tahun 5 model papers 1 and 2 that the final bank
   did not assess yet. Existing D5 families stay in rotation alongside them. */
(function(root){
 'use strict';
 if(root.PAD5Completion?.installed)return;
 const banks=root.PAQuestionBanks,previous=banks?.d5;
 if(typeof previous!=='function'||!root.PAD5Scenes)throw new Error('D5 completion requires the final Year 5 bank and the 2.5D scene kit');
 const VERSION='1.0.0';
 const names=['Aiman','Mei Ling','Devi','Hafiz','Siti','Chong','Farah','Ravi'];
 const months=['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember'];
 const group=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
 const rm=(cents,fixed=false)=>{const c=Math.round(cents),r=Math.floor(c/100),s=c%100;return 'RM'+group(r)+(s||fixed?'.'+String(s).padStart(2,'0'):'')};
 const price=cents=>{const c=Math.round(cents);return group(Math.floor(c/100))+'.'+String(c%100).padStart(2,'0')};
 const hm=min=>`${Math.floor(min/60)} jam ${min%60} minit`;
 const kgG=g=>g<1000?`${g} g`:g%1000?`${Math.floor(g/1000)} kg ${g%1000} g`:`${g/1000} kg`;
 const lMl=ml=>ml%1000?`${Math.floor(ml/1000)} ℓ ${ml%1000} mℓ`:`${ml/1000} ℓ`;
 const gcdN=(a,b)=>b?gcdN(b,a%b):a;
 const ratio=(a,b)=>{const g=gcdN(a,b);return `${a/g} : ${b/g}`};
 const dec=(n,dp=3)=>Number(n.toFixed(dp));
 // Years stay as written (2024, not 2 024) when Darjah 5 digit grouping runs.
 const noGroup=v=>`<span data-no-group>${v}</span>`;
 const table=(headers,rows,label)=>`<div class="kssrDiagram" role="group" aria-label="${label}"><table class="kd-table"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,i)=>i===0?`<th>${c}</th>`:`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
 const cards=(items,label)=>`<div class="kssrDiagram" role="group" aria-label="${label}" style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">${items.map(([title,value])=>`<div style="min-width:130px;border:2px solid #2f5ea8;border-radius:10px;overflow:hidden;background:#fff;box-shadow:0 5px 0 #1f437f,0 9px 14px rgba(40,77,116,.18)"><div style="background:#2f5ea8;color:#fff;font-weight:800;padding:4px 8px">${title}</div><div style="font-weight:900;font-size:16px;padding:8px">${value}</div></div>`).join('')}</div>`;
 // Graphics come from the shared Darjah 5 2.5D scene kit (questions/d5/scenes-v1.js).
 const {f1,svgText,scene,poly,slab,personToken,bucket:bucketScene,road:roadScene,pictograph:pictographScene}=root.PAD5Scenes;
 const stageOf=s=>Number(s?.mastery||0)<35||Number(s?.evidence||0)<2?1:Number(s?.mastery||0)>=70&&Number(s?.confidence||0)>=55?3:2;
 function recent(id){try{return (sess?.questionHistory||[]).filter(x=>x.skillId===id).slice(-8).map(x=>String(x.archetypeId||''))}catch(_){return []}}
 function rotate(id,modes){const r=recent(id),last=r.at(-1),count=m=>r.filter(a=>a==='d5c_'+m).length,pool=modes.filter(m=>'d5c_'+m!==last);return (pool.length?pool:modes).sort((a,b)=>count(a)-count(b)||Math.random()-.5)[0]}
 function attempt(build){for(let i=0;i<80;i++){const q=build();if(q)return q}throw new Error('D5 completion could not build a valid question')}
 function choices(answer,list,tag){const seen=new Set([String(answer)]),out=[];for(const v of list){if(v==null||(typeof v==='number'&&(!Number.isFinite(v)||v<=0)))continue;const k=String(v);if(seen.has(k))continue;seen.add(k);out.push(N(v,tag))}return out.slice(0,3)}
 function make(id,mode,standard,prompt,answer,wrong,hint,kind,rep,demand,targets,evidence){
  const q=Q(prompt,answer,wrong,hint,'Tahun 5 · '+kind,true,true);
  return Object.assign(q,{source:'d5-completion-v1',familyKey:id,competencyId:standard,standardRef:standard,archetypeId:'d5c_'+mode,representation:rep,demand,contextId:'d5-uasa:'+mode,difficultyBand:demand==='reasoning'?4:3,misconceptionTargets:targets,qaEvidence:Object.assign({mode},evidence)});
 }

 // ---------- Nombor hingga 1 000 000 ----------
 function reverseRound(id,mode){
  const unit=pick([1000,10000,100000]),place={1000:'ribu',10000:'puluh ribu',100000:'ratus ribu'}[unit],target=unit===100000?R(2,9)*unit:R(Math.ceil(120000/unit),Math.floor(980000/unit))*unit,smallest=Math.random()<.5,lo=target-unit/2,hi=target+unit/2-1,ans=smallest?lo:hi;
  const wrong=smallest?[lo-1,target-unit,target,lo+unit/10]:[hi+1,target+unit-1,target,hi-unit/10+1];
  return make(id,mode,'reverse_round',`Nyatakan nombor bulat yang <b>${smallest?'paling kecil':'paling besar'}</b> yang menjadi ${group(target)} apabila dibundarkan kepada ${place} yang terdekat.`,ans,choices(ans,wrong,'round'),smallest?`Digit penentu 5 atau lebih dibundarkan ke atas. Cari nombor terkecil yang masih menjadi ${group(target)}.`:`Digit penentu kurang daripada 5 dibundarkan ke bawah. Cari nombor terbesar yang masih menjadi ${group(target)}.`,'Bundar Songsang','symbolic','reasoning',['round'],{target,unit,smallest});
 }

 // ---------- Wang hingga RM1 000 000 ----------
 function bigSubtract(id,mode){
  const a=R(30000000,99000000),b=R(1000000,29000000),ans=a-b;
  return make(id,mode,'money_big_subtract',`${rm(a,true)} − ${rm(b,true)} = ?`,rm(ans,true),choices(rm(ans,true),[rm(ans+100000,true),rm(ans-100,true),rm(a+b,true),rm(ans+10000,true)],'money'),'Selarikan titik perpuluhan. Tolak sen dahulu, kemudian ringgit, dan semak pengumpulan semula.','Tolak Wang','symbolic','procedure',['money','operation'],{a,b});
 }
 function bigMissing(id,mode){
  const a=R(3,9)*10000000,c=R(Math.floor(a*.2),Math.floor(a*.8)),ans=a-c;
  return make(id,mode,'money_big_missing',`${rm(a)} − ______ = ${rm(c,true)}`,rm(ans,true),choices(rm(ans,true),[rm(a+c,true),rm(ans+100000,true),rm(ans-100,true),rm(ans+10000,true)],'money'),'Nilai yang hilang = nilai asal − baki.','Wang Hilang','symbolic','reasoning',['money','inverse'],{a,c});
 }
 function downPayment(id,mode){
  const who=pick(names),item=pick(['sebuah motosikal','sebuah komputer riba','sebuah peti sejuk','satu set sofa']),cost=R(20,95)*10000,pct=pick([10,15,20,25,30,35,40]),deposit=cost*pct/100,ans=cost-deposit;
  return make(id,mode,'money_down_payment',`${who} membeli ${item} berharga ${rm(cost)}. Dia membayar ${pct}% daripada harga itu sebagai bayaran pendahuluan. Berapakah baki yang masih perlu dibayar?`,rm(ans),choices(rm(ans),[rm(deposit),rm(cost),rm(cost-pct*100),rm(ans-deposit)],'percent'),'Cari nilai bayaran pendahuluan, kemudian tolak daripada harga.','Bayaran Pendahuluan','story','application',['money','percent'],{cost,pct});
 }
 // Only principal/rate pairs whose second-year interest is a whole number of sen.
 const interestPairs=(()=>{const out=[];for(const p of [5000,8000,10000,12000,15000,20000,25000])for(const r of [1.5,2,2.5,3,3.5,4]){const y1=p*r,y2=(p*100+y1)*r/100;if(Number.isInteger(y1)&&Math.abs(y2-Math.round(y2))<1e-9)out.push({p,r,y1,y2:Math.round(y2)})}return out})();
 function interest(id,mode){
  const year=mode==='interest_year2'?2:1,{p,r,y1,y2}=pick(interestPairs),who=pick(['Cikgu Jamal','Puan Kavitha','Encik Lim','Puan Rohani']),ans=year===1?y1:y2;
  const wrong=year===1?[p*100+y1,y1*10,y1/10,y1*2]:[y1,y1+y2,p*100+y1+y2,y1*2];
  return make(id,mode,'money_interest',`${who} menyimpan wang dalam akaun simpanan seperti yang ditunjukkan dalam jadual. Dia tidak mengeluarkan sebarang wang, termasuk faedah.${table(['Perkara','Butiran'],[['Baki awal',rm(p*100,true)],['Kadar faedah',`${r}% setahun`],['Pengeluaran','Tiada']],'akaun simpanan')}Hitung faedah yang diterima pada akhir tahun ${year===1?'pertama':'kedua'}.`,rm(ans),choices(rm(ans),wrong.map(v=>rm(v)),'interest'),year===1?'Faedah = kadar faedah × baki awal.':'Faedah tahun kedua dikira atas baki awal dan faedah tahun pertama.','Faedah Simpanan','table','application',['money','interest'],{p,r,year});
 }
 const receiptItems=[{cell:'Belon',text:'belon',qty:[10,40],unit:[4,30]},{cell:'Cawan kertas (paket)',text:'paket cawan kertas',qty:[4,15],unit:[40,160]},{cell:'Reben (gulung)',text:'gulung reben',qty:[3,10],unit:[60,200]},{cell:'Pinggan kertas (paket)',text:'paket pinggan kertas',qty:[3,12],unit:[50,150]},{cell:'Kad ucapan',text:'kad ucapan',qty:[5,20],unit:[10,60]}];
 function receipt(id,mode){
  const items=[...receiptItems].sort(()=>Math.random()-.5).slice(0,3).map(x=>({...x,q:R(x.qty[0],x.qty[1]),u:R(x.unit[0],x.unit[1])*5})),miss=R(0,2),lines=items.map(x=>x.q*x.u),total=lines.reduce((a,b)=>a+b,0),part=pick(['line','total','change']),pay=Math.ceil((total+1)/5000)*5000,line=lines[miss];
  const t=table(['Barang','Kuantiti','Harga seunit (RM)','Jumlah (RM)'],items.map((x,i)=>[x.cell,x.q,price(x.u),i===miss?'?':price(lines[i])]),'resit');
  const intro=`Jadual menunjukkan resit bagi barang yang dibeli untuk pesta sekolah. Jumlah bagi ${items[miss].text} tidak ditunjukkan.${t}`;
  if(part==='line')return make(id,'receipt_line','money_receipt',intro+`Hitung jumlah bagi ${items[miss].text}.`,rm(line),choices(rm(line),[rm(line/10),rm(line+100),rm(line-100),rm(items[miss].u*(items[miss].q+1))],'money'),'Jumlah = kuantiti × harga seunit.','Resit','table','application',['money'],{items:items.map(x=>[x.q,x.u]),miss,part});
  if(part==='total')return make(id,'receipt_total','money_receipt',intro+'Hitung jumlah bayaran bagi ketiga-tiga barang itu.',rm(total),choices(rm(total),[rm(total-line),rm(total+100),rm(total-100),rm(total+line)],'money'),'Cari jumlah yang tidak ditunjukkan dahulu, kemudian tambah ketiga-tiga jumlah.','Resit','table','application',['money'],{items:items.map(x=>[x.q,x.u]),miss,part});
  return make(id,'receipt_change','money_receipt',intro+`Cikgu membayar dengan ${rm(pay)}. Berapakah bakinya?`,rm(pay-total),choices(rm(pay-total),[rm(pay-total+line),rm(pay-total+100),rm(pay-total-100),rm(total)],'money'),'Cari jumlah bayaran dahulu, kemudian tolak daripada wang yang dibayar.','Resit','table','application',['money'],{items:items.map(x=>[x.q,x.u]),miss,part,pay});
 }

 // ---------- Ukuran: unit campuran ----------
 function mixedMass(id,mode){return attempt(()=>{
  const a=R(11,49)*50,bt=R(11,39),ck=R(1,4),cg=R(1,39)*25,b=bt*100,c=ck*1000+cg,T=a+b+c;if(bt%10===0||T%1000===0)return null;
  const asTenGrams=T-b+Math.floor(bt/10)*1000+(bt%10)*10,asGrams=T-b+Math.floor(bt/10)*1000+bt%10;
  return make(id,mode,'5.1-5.3',`${group(a)} g + ${bt/10} kg + ${ck} kg ${cg} g = ___ kg ___ g`,kgG(T),choices(kgG(T),[kgG(asTenGrams),kgG(asGrams),kgG(T-1000),kgG(T+1000)],'unit'),'Tukar semua jisim kepada g, tambah, kemudian tulis semula dalam kg dan g.','Jisim Unit Campuran','symbolic','application',['unit','operation'],{a,b,c});
 })}
 function mixedLength(id,mode){return attempt(()=>{
  const kt=R(11,39),m=R(2,19)*50,cm=R(5,95)*100,T=kt*100+m+cm/100;if(kt%10===0)return null;
  return make(id,mode,'5.1-5.3',`${kt/10} km + ${m} m + ${group(cm)} cm = ___ m`,T,choices(T,[T-cm/100+cm,T-kt*100+kt*10,T-cm/100,T+100],'unit'),'1 km = 1 000 m dan 100 cm = 1 m. Tukar semua kepada m sebelum menambah.','Panjang Unit Campuran','symbolic','application',['unit','operation'],{km:kt/10,m,cm});
 })}
 function volumeToLitre(id,mode){
  const q=R(12,60),v=R(11,95)*10,ans=dec(q*v/1000);
  return make(id,mode,'5.1-5.3',`${q} × ${v} mℓ = ___ ℓ`,ans,choices(ans,[dec(q*v/100),dec(q*v/10000,4),q*v,dec(ans+1)],'unit'),'Darab dalam mℓ dahulu, kemudian bahagi dengan 1 000 untuk menukar kepada ℓ.','Isi Padu Cecair','symbolic','procedure',['unit'],{q,v});
 }
 function syrupShare(id,mode){
  const per=R(4,15)*50,n=R(5,12),k=R(2,n-1),total=per*n,who=pick(['Puan Rohani','Encik Lim','Puan Kavitha']),ans=per*k;
  const bucket=bucketScene(lMl(total));
  return make(id,mode,'5.1-5.3',`Rajah menunjukkan isi padu sirap di dalam sebuah baldi di kantin sekolah. ${who} menuang sirap itu sama banyak ke dalam ${n} biji botol yang sama.${bucket}Hitung jumlah isi padu, dalam mℓ, sirap di dalam ${k} biji botol itu.`,ans,choices(ans,[per,total-ans,per*(k+1),total,per*(k-1),ans+100],'unit'),'Tukar kepada mℓ, bahagi sama banyak untuk satu botol, kemudian darab dengan bilangan botol.','Isi Padu Cecair','story','application',['unit','operation'],{total,n,k});
 }
 function ropes(id,mode){return attempt(()=>{
  const pt=R(11,29),q=R(3,19)*5,rc=R(1,19)*5,P=pt*10,Rr=100+rc,total=P+q+Rr,teacher=pick(['Cikgu Wong','Cikgu Aminah','Cikgu Rajan']);if(pt%10===0)return null;
  const t=table(['Tali','Panjang'],[['P',`${pt/10} m`],['Q',`${q} cm`],['R',`1 m ${rc} cm`]],'panjang tiga utas tali'),intro=`Jadual menunjukkan panjang tiga utas tali, P, Q dan R, yang disediakan untuk Hari Sukan.${t}`;
  if(mode==='rope_total')return make(id,mode,'5.1-5.3',intro+'Hitung jumlah panjang, dalam cm, ketiga-tiga utas tali itu.',total,choices(total,[total-P+pt,total+100,total-100,total+10],'unit'),'Tukar setiap panjang kepada cm dahulu: 1 m = 100 cm.','Panjang Unit Campuran','table','application',['unit'],{P,Q:q,R:Rr});
  const pct=pick([20,25,30,35,40,45,60].filter(x=>total*x%100===0));if(!pct)return null;const used=total*pct/100,ans=total-used;
  return make(id,mode,'5.1-5.3',intro+`${teacher} menggunakan ${pct}% daripada jumlah panjang tali itu untuk menanda trek. Berapakah panjang tali, dalam cm, yang tinggal?`,ans,choices(ans,[used,total,total-pct,ans+10],'unit'),'Cari jumlah panjang dalam cm, kemudian cari peratus yang digunakan dan tolak.','Panjang dan Peratus','table','reasoning',['unit','percent'],{P,Q:q,R:Rr,pct});
 })}
 function packets(id,mode){return attempt(()=>{
  const g=pick([250,400,500,750]),n=R(4,16),total=n*g,t=table(['Bahan','Bilangan paket','Jisim satu paket'],[['Tepung',n,`${g} g`],['Gula',R(3,10),'1 kg'],['Mentega',R(2,8),'250 g']],'bahan gerai kek'),intro=`Jadual menunjukkan bahan yang dibeli untuk gerai kek di pesta sekolah.${t}`;
  if(mode==='packets_kg'){const ans=dec(total/1000);return make(id,mode,'5.1-5.3',intro+'Hitung jumlah jisim tepung itu, dalam kg.',ans,choices(ans,[total,dec(total/100),dec(total/10000,4),dec(ans+1)],'unit'),'Darab bilangan paket dengan jisim satu paket, kemudian tukar g kepada kg.','Jisim','table','application',['unit'],{n,g})}
  const used=R(1,Math.floor(total/1000)-1)*1000+R(1,19)*50,left=total-used;if(Math.floor(total/1000)<2||left<1000||left%1000===0)return null;
  const naive=(Math.floor(total/1000)-Math.floor(used/1000))*1000+Math.abs(total%1000-used%1000);
  return make(id,mode,'5.1-5.3',intro+`Sebanyak ${kgG(used)} tepung digunakan untuk membuat kek. Berapakah jisim tepung yang tinggal? Beri jawapan dalam kg dan g.`,kgG(left),choices(kgG(left),[kgG(naive),kgG(left+1000),kgG(left+100),kgG(total+used)],'unit'),'Tukar kepada g dahulu supaya mudah menolak, kemudian tulis jawapan dalam kg dan g.','Jisim Unit Campuran','table','reasoning',['unit','operation'],{n,g,used});
 })}

 // ---------- Masa ----------
 function decimalHour(id,mode){
  const h=R(1,4),t=R(1,9),ans=`${h} jam ${t*6} minit`;
  return make(id,mode,'4.1.1',`Tukarkan ${h}.${t} jam kepada jam dan minit.`,ans,choices(ans,[`${h} jam ${t*10} minit`,`${h} jam ${t} minit`,`${h+1} jam ${t*6} minit`,`${h} jam ${t*6+10} minit`],'time_convert'),'0.1 jam = 6 minit. Darab bahagian perpuluhan dengan 60.','Tukar Jam','symbolic','procedure',['time_convert'],{h,t});
 }
 function visitTotal(id,mode){return attempt(()=>{
  const h=R(1,2),t=R(1,9),H=R(1,3),M=R(1,11)*5,T=h*60+t*6+H*60+M,[place,site]=pick([['sebuah bank','bank'],['sebuah muzium','muzium'],['sebuah kilang roti','kilang roti']]),cls=pick(['5 Cerdik','5 Bestari','5 Gemilang']);if(T%60===0)return null;
  const loose=t*6+M>=60?`${h+H} jam ${t*6+M} minit`:hm(T+60);
  return make(id,mode,'4.2.1',`Rajah menunjukkan masa yang diambil oleh Kelas ${cls} dalam lawatan ke ${place}.${cards([['Perjalanan dengan bas',`${h}.${t} jam`],[`Lawatan di dalam ${site}`,`${H} jam ${M} minit`]],'masa lawatan')}Hitung jumlah masa lawatan itu, dalam jam dan minit.`,hm(T),choices(hm(T),[hm(T-t*6+t*10),loose,hm(T-60),hm(T+10)],'time_operation'),'Tukar jam perpuluhan kepada jam dan minit dahulu. 60 minit = 1 jam.','Tambah Masa','story','application',['time_operation'],{h,t,H,M});
 })}
 function yearFraction(id,mode){
  const w=R(1,3),[n,d]=pick([[1,2],[1,3],[2,3],[1,4],[3,4],[1,6],[5,6],[5,12],[7,12]]),m=R(5,23),ans=w*12+12*n/d+m;
  return make(id,mode,'4.2.1',`${w} ${n}/${d} tahun + ${m} bulan = ___ bulan`,ans,choices(ans,[w*12+n+m,w*12+m,ans+12,ans-12],'time_convert'),`1 tahun = 12 bulan. Tukar ${w} ${n}/${d} tahun kepada bulan dahulu.`,'Tahun dan Bulan','symbolic','application',['time_convert'],{w,n,d,m});
 }
 function dateDuration(id,mode){return attempt(()=>{
  const y=pick([2023,2024,2025,2026]),sm=R(0,10),sd=R(10,28),D=R(12,40),start=Date.UTC(y,sm,sd),end=new Date(start+(D-1)*864e5),em=end.getUTCMonth(),ed=end.getUTCDate();
  if(em===sm||end.getUTCFullYear()!==y)return null;
  const event=pick(['Pesta Buku sekolah','Karnival Sukan','Minggu Sains','Pameran Seni']),days30=30*(em-sm)+ed-sd+1;
  const dateText=(d,m)=>`${d} ${months[m]} ${noGroup(y)}`;
  return make(id,mode,'4.2.2',`Rajah menunjukkan tarikh mula dan tarikh tamat ${event} pada tahun ${noGroup(y)}.${cards([['Mula',dateText(sd,sm)],['Tamat',dateText(ed,em)]],'tarikh mula dan tamat')}Berapakah tempoh ${event} itu, dalam hari? Hitung hari pertama dan hari terakhir.`,D,choices(D,[D-1,D+1,days30,D+2,D-2],'time_operation'),'Kira baki hari dalam bulan pertama termasuk hari pertama, kemudian tambah hari dalam bulan seterusnya. Semak bilangan hari setiap bulan.','Tempoh Tarikh','story','reasoning',['time_operation'],{y,sm,sd,em,ed});
 })}

 // ---------- Nisbah dan kadar ----------
 function ratioPartTotal(id,mode){return attempt(()=>{
  const u=pick([100,150,200,250,300,500]),a=R(1,4),b=R(a+1,8);if(gcdN(a,b)!==1)return null;
  const small=a*u,big=b*u,mass=Math.random()<.5,[bigName,smallName]=mass?pick([['durian','betik'],['tembikai','nanas'],['labu','betik']]):pick([['jus oren','jus epal'],['air sirap','air teh'],['susu','jus mangga']]),[U,u2]=mass?['kg','g']:['ℓ','mℓ'];
  const asText=v=>v>=1000&&v%100===0?`${v/1000} ${U}`:`${v} ${u2}`,bigText=asText(big),smallText=asText(small),askSmall=Math.random()<.5,part=askSmall?a:b,other=askSmall?b:a,ask=askSmall?smallName:bigName,ans=ratio(part,a+b);
  const prompt=mass?`Jisim sebiji ${bigName} ialah ${bigText} dan jisim sebiji ${smallName} ialah ${smallText}. Nyatakan nisbah jisim ${ask} kepada jumlah jisim kedua-dua buah itu dalam bentuk yang termudah.`:`Isi padu sebotol ${bigName} ialah ${bigText} dan isi padu sebotol ${smallName} ialah ${smallText}. Nyatakan nisbah isi padu ${ask} kepada jumlah isi padu kedua-dua botol itu dalam bentuk yang termudah.`;
  return make(id,mode,'ratio_part_total',prompt,ans,choices(ans,[ratio(part,other),ratio(a+b,part),ratio(other,a+b),`${(askSmall?smallText:bigText).split(' ')[0]} : ${(askSmall?bigText:smallText).split(' ')[0]}`],'ratio'),`Tukar kepada unit yang sama (${u2}), cari jumlah, kemudian ringkaskan nisbah.`,'Nisbah dan Jumlah','story','reasoning',['ratio','unit'],{small,big,askSmall});
 })}
 function ratioCountTotal(id,mode){return attempt(()=>{
  const g=R(2,9),a=R(1,5),b=R(1,6);if(a===b||gcdN(a,b)!==1)return null;
  const boys=a*g,girls=b*g,askBoys=Math.random()<.5,part=askBoys?a:b,other=askBoys?b:a,ans=ratio(part,a+b);
  return make(id,mode,'ratio_part_total',`Dalam sebuah kelas, terdapat ${boys} orang murid lelaki dan ${girls} orang murid perempuan. Nyatakan nisbah bilangan murid ${askBoys?'lelaki':'perempuan'} kepada jumlah murid dalam kelas itu dalam bentuk yang termudah.`,ans,choices(ans,[ratio(part,other),ratio(a+b,part),ratio(other,a+b),ratio(part+1,a+b),ratio(part,a+b+1)],'ratio'),'Cari jumlah murid dahulu, kemudian ringkaskan nisbah.','Nisbah dan Jumlah','story','application',['ratio'],{boys,girls,askBoys});
 })}
 function rateDistance(id,mode){
  const k=R(8,15),l1=R(6,20),d1=l1*k,l2=R(l1+2,40),ans=l2*k,[A,B]=pick([['Kota Sinar','Bandar Laut'],['Pekan Lama','Bandar Baru'],['Kampung Indah','Bandar Jaya']]);
  const line=roadScene(A,B,d1);
  return make(id,mode,'rate_distance',`Rajah menunjukkan jarak perjalanan dari ${A} ke ${B}. Sebuah van menggunakan ${l1} ℓ petrol untuk perjalanan itu.${line}Berapakah jarak, dalam km, yang dapat dilalui oleh van itu dengan menggunakan ${l2} ℓ petrol? Van itu menggunakan petrol pada kadar yang sama.`,ans,choices(ans,[d1+(l2-l1),ans+k,ans-k,ans+2*k],'ratio'),'Cari jarak bagi 1 ℓ petrol dahulu, kemudian darab dengan bilangan liter.','Kadar dan Jarak','story','application',['ratio','division'],{k,l1,l2});
 }
 function rateTime(id,mode){return attempt(()=>{
  const per=R(5,12),n1=R(4,9),n2=R(n1+4,24),T=n2*per,[verb,unit,item]=pick([['memasang','buah khemah','khemah'],['menyusun','buah meja','meja']]);if(T<60||T%60===0)return null;
  const hundred=T>=100?`${Math.floor(T/100)} jam ${T%100} minit`:null;
  return make(id,mode,'rate_time',`Pada pagi Hari Sukan, sekumpulan sukarelawan ${verb} ${n1} ${unit} dalam ${n1*per} minit. Mereka bekerja pada kadar yang tetap. Berapa lamakah, dalam jam dan minit, mereka memerlukan untuk ${verb} ${n2} ${unit}?`,hm(T),choices(hm(T),[hundred,hm(T+per),hm(T-per),`${T} minit`],'ratio'),`Cari masa untuk satu ${item} dahulu. 60 minit = 1 jam.`,'Kadar dan Masa','story','reasoning',['ratio','time_operation'],{per,n1,n2});
 })}

 // ---------- Ruang (gabungan bentuk) ----------
 function areaSquareRect(id,mode){
  const s=R(5,10),h=R(2,s-1),L=s+R(4,12),ans=s*s+(L-s)*h,k=Math.min(230/L,96/s),x0=45,y0=14,sq=s*k,yb=y0+sq,xr=x0+sq,xe=x0+L*k,rh=h*k,dim=yb+26;
  const A=slab([[x0,y0],[xr,y0],[xr,yb],[x0,yb]],'#dbe8fb','#9fb9de'),B=slab([[xr,yb-rh],[xe,yb-rh],[xe,yb],[xr,yb]],'#ffe3c2','#e0b07c');
  const art=scene(dim+26,`Segi empat sama dengan luas ${s*s} cm² bercantum dengan segi empat tepat setinggi ${h} cm. Panjang keseluruhan ${L} cm.`,
   A.sides+B.sides+A.face+B.face+`<path d="M${f1(x0+5)} ${f1(y0+5)} h${f1(sq-10)}" stroke="#fff" stroke-width="2.4" opacity=".85"/><path d="M${f1(xr+5)} ${f1(yb-rh+5)} h${f1(xe-xr-10)}" stroke="#fff" stroke-width="2.4" opacity=".85"/>`
   +svgText(x0+sq/2,y0+sq/2-3,'Luas',12,'#3d5a80')+svgText(x0+sq/2,y0+sq/2+15,`${s*s} cm²`,15)+svgText(xe+12,yb-rh/2+5,`${h} cm`,13,'#243d5e','start')
   +`<path d="M${f1(x0)} ${f1(dim)} H${f1(xe)} M${f1(x0)} ${f1(dim-6)} v12 M${f1(xe)} ${f1(dim-6)} v12" stroke="#36577a" stroke-width="1.6"/>`+svgText((x0+xe)/2,dim+17,`${L} cm`,13));
  return make(id,mode,'6.2.2',`Rajah menunjukkan gabungan sebuah segi empat sama dengan sebuah segi empat tepat. Luas segi empat sama itu ialah ${s*s} cm².${art}Hitung luas, dalam cm², seluruh bentuk itu.`,`${ans} cm²`,choices(`${ans} cm²`,[s*s+L*h,s*s+(L-s)*s,L*s,(L-s)*h,s*s+(L-s)+h].map(v=>`${v} cm²`),'area'),'Cari sisi segi empat sama daripada luasnya dahulu. Kemudian cari panjang segi empat tepat dan tambah kedua-dua luas.','Luas Gabungan','visual','reasoning',['area','composite'],{s,h,L});
 }
 function perimeterSquarePolygon(id,mode){
  const [n,name]=pick([[5,'pentagon sekata'],[6,'heksagon sekata'],[8,'oktagon sekata']]),side=R(3,12),ans=(n+2)*side;
  const rin=1/(2*Math.tan(Math.PI/n)),Rc=1/(2*Math.sin(Math.PI/n)),above=n%2===0?2*rin:rin+Rc,a=Math.min(44,124/(1+above)),cx=170,ys=12+above*a,yb=ys+a,cy=ys-rin*a;
  const Q=Array.from({length:n},(_,i)=>{const t=Math.PI/2+Math.PI/n+2*Math.PI*i/n;return [cx+Rc*a*Math.cos(t),cy+Rc*a*Math.sin(t)]}),P=[[cx-a/2,ys],[cx+a/2,ys],[cx+a/2,yb],[cx-a/2,yb]];
  const q=slab(Q,'#dff3e6','#9fcdb0'),sq=slab(P,'#dbe8fb','#9fb9de');
  const art=scene(Math.ceil(yb+22),`Segi empat sama P bercantum dengan ${name} Q pada satu sisi.`,q.sides+sq.sides+q.face+sq.face+`<path d="M${f1(cx-a/2+4)} ${f1(ys+4)} h${f1(a-8)}" stroke="#fff" stroke-width="2.2" opacity=".85"/>`+svgText(cx,cy+6,'Q',17)+svgText(cx,ys+a/2+6,'P',16));
  return make(id,mode,'6.2.1',`Rajah menunjukkan sebuah segi empat sama P dan sebuah ${name} Q yang bercantum pada satu sisi. Perimeter segi empat sama P ialah ${4*side} cm.${art}Hitung perimeter, dalam cm, gabungan bentuk itu.`,`${ans} cm`,choices(`${ans} cm`,[(n+4)*side,(n+3)*side,n*side,(n+1)*side].map(v=>`${v} cm`),'perimeter'),'Sisi segi empat sama dan sisi poligon sekata itu sama panjang. Sisi yang bercantum tidak termasuk dalam perimeter.','Perimeter Gabungan','visual','reasoning',['perimeter','composite'],{n,side});
 }
 function volumeCubeCuboid(id,mode){
  const e=R(3,8),l=R(e+1,12),h=R(2,e-1),ans=e**3+l*e*h,k=Math.min(244/(e+l+.35*e),77/e),E=e*k,Lw=l*k,H=h*k,dx=.35*E,dy=-.35*E,x0=44,yb=32+1.35*E,x1=x0+E;
  const face=(pts,fill)=>poly(pts,fill,'#36577a',1.8);
  const cube=face([[x0+E,yb-E],[x0+E+dx,yb-E+dy],[x0+E+dx,yb+dy],[x0+E,yb]],'#b9cdec')+face([[x0,yb-E],[x0+E,yb-E],[x0+E+dx,yb-E+dy],[x0+dx,yb-E+dy]],'#f2f7ff')+face([[x0,yb-E],[x0+E,yb-E],[x0+E,yb],[x0,yb]],'#dfeafb');
  const cuboid=face([[x1,yb-H],[x1+Lw,yb-H],[x1+Lw+dx,yb-H+dy],[x1+dx,yb-H+dy]],'#f5f9ff')+face([[x1+Lw,yb-H],[x1+Lw+dx,yb-H+dy],[x1+Lw+dx,yb+dy],[x1+Lw,yb]],'#bdd0ee')+face([[x1,yb-H],[x1+Lw,yb-H],[x1+Lw,yb],[x1,yb]],'#e3eefc');
  const art=scene(Math.ceil(yb+30),`Kubus dengan sisi ${e} cm bercantum dengan kuboid sepanjang ${l} cm dan setinggi ${h} cm. Lebar kuboid sama dengan sisi kubus.`,
   `<ellipse cx="${f1(x0+(E+Lw)/2+dx/2)}" cy="${f1(yb+4)}" rx="${f1((E+Lw)/2+dx/2)}" ry="5" fill="#2f5ea8" opacity=".10"/>`+cube+cuboid+`<path d="M${f1(x0+4)} ${f1(yb-E+4)} h${f1(E-8)}" stroke="#fff" stroke-width="2.2" opacity=".85"/>`
   +svgText(x0+E/2+dx/2,yb-E+dy-8,'kubus',12,'#3d5a80')+svgText(x0-6,yb-E/2+5,`${e} cm`,13,'#243d5e','end')+svgText(x1+Lw/2,yb+19,`${l} cm`,13)+svgText(x1+Lw+dx+6,yb+dy/2-H/2+5,`${h} cm`,13,'#243d5e','start'));
  return make(id,mode,'6.3.1',`Rajah menunjukkan gabungan sebuah kubus dan sebuah kuboid. Kuboid itu bercantum dengan satu muka kubus dan lebarnya sama dengan sisi kubus.${art}Hitung isi padu, dalam cm³, gabungan bentuk itu.`,`${ans} cm³`,choices(`${ans} cm³`,[e**3+l*h,(e+l)*e*e,e**3+l*e*e,l*e*h,e**3+l*h*h].map(v=>`${v} cm³`),'volume'),'Isi padu kubus = sisi × sisi × sisi. Lebar kuboid sama dengan sisi kubus. Tambah kedua-dua isi padu.','Isi Padu Gabungan','visual','reasoning',['volume','composite'],{e,l,h});
 }

 // ---------- Pengurusan data ----------
 function freqMedian(id,mode){return attempt(()=>{
  const vals=[1,2,3,4,5],f=vals.map(()=>R(1,5)),n=f.reduce((a,b)=>a+b,0);if(n%2===0||n<9)return null;
  const list=vals.flatMap((v,i)=>Array(f[i]).fill(v)),ans=list[(n-1)/2],modeVal=vals[f.indexOf(Math.max(...f))],[topic,label]=pick([[`bilangan buku cerita yang dibaca oleh ${n} orang murid dalam sebulan`,'Bilangan buku cerita'],[`bilangan adik-beradik bagi ${n} orang murid`,'Bilangan adik-beradik']]);
  return make(id,mode,'8.2.1',`Jadual menunjukkan ${topic}.${table([label,...vals],[['Bilangan murid',...f]],'jadual kekerapan')}Apakah median bagi data itu?`,ans,choices(ans,[modeVal,3,f[2],Math.max(...f),...vals],'data'),'Susun semua data mengikut tertib. Median ialah nilai yang di tengah-tengah.','Median Jadual Kekerapan','table','reasoning',['median'],{f});
 })}
 function pictograph(id,mode){return attempt(()=>{
  const houses=['Merah','Biru','Hijau','Kuning'],key=pick([2,4,5,10]),s=houses.map(()=>R(2,9)),sum=s.reduce((a,b)=>a+b,0);if(mode==='pictograph_mean'&&sum*key%4)return null;
  const pict=pictographScene(houses,s,key);
  const intro=`Piktograf menunjukkan bilangan murid empat buah rumah sukan yang menyertai acara lompat jauh.${pict}`;
  if(mode==='pictograph_diff'){const hi=s.indexOf(Math.max(...s)),lo=s.indexOf(Math.min(...s));if(s[hi]===s[lo])return null;const ans=(s[hi]-s[lo])*key;return make(id,mode,'8.1.1',intro+`Berapakah bilangan murid Rumah ${houses[hi]} lebih banyak daripada murid Rumah ${houses[lo]}?`,ans,choices(ans,[s[hi]-s[lo],s[hi]*key,(s[hi]+s[lo])*key,ans+key],'data'),`Setiap simbol mewakili ${key} orang murid. Cari beza bilangan simbol, kemudian darab.`,'Piktograf','visual','application',['data'],{s,key,hi,lo})}
  if(mode==='pictograph_total'){const ans=sum*key;return make(id,mode,'8.1.1',intro+'Hitung jumlah murid yang menyertai acara itu.',ans,choices(ans,[sum,ans+key,ans-key,ans+2*key],'data'),'Kira semua simbol, kemudian darab dengan nilai satu simbol.','Piktograf','visual','application',['data'],{s,key})}
  const ans=sum*key/4;return make(id,mode,'8.2.1',intro+'Hitung min bilangan murid bagi satu rumah.',ans,choices(ans,[sum*key,ans+key,ans-key,Number.isInteger(sum/4)?sum/4:ans+2*key],'data'),'Min = jumlah murid ÷ bilangan rumah sukan.','Piktograf dan Min','visual','reasoning',['mean','data'],{s,key});
 })}
 function meanDays(id,mode){return attempt(()=>{
  const v=[R(15,35),R(15,35),R(15,35),R(15,35),R(15,35)],sum=v.reduce((a,b)=>a+b,0);if(sum%5)return null;
  const mean=sum/5,t=table(['Hari','Isnin','Selasa','Rabu','Khamis','Jumaat'],[['Murid',...v]],'murid yang membuat simpanan'),intro=`Jadual menunjukkan bilangan murid yang membuat simpanan di kaunter bank sekolah dalam seminggu.${t}`;
  if(mode==='mean_days')return make(id,mode,'8.2.1',intro+'Hitung min bilangan murid yang membuat simpanan setiap hari.',mean,choices(mean,[sum,mean+1,mean-1,[...v].sort((a,b)=>a-b)[2],mean+5],'mean'),'Min = jumlah semua nilai ÷ bilangan hari.','Min','table','application',['mean'],{v});
  const days=pick([10,15,20,25]),ans=mean*days;
  return make(id,mode,'8.2.1',intro+`Pada min yang sama, berapakah jumlah murid yang dijangka membuat simpanan dalam ${days} hari persekolahan?`,ans,choices(ans,[sum*days,mean+days,ans+mean,ans-mean],'mean'),'Cari min dahulu, kemudian darab dengan bilangan hari.','Min dan Jangkaan','table','reasoning',['mean'],{v,days});
 })}

 // ---------- Operasi bergabung ----------
 function thinkNumber(id,mode){return attempt(()=>{
  const x=R(150,2500),m=R(3,9),s=R(4,60)*50,sub=Math.random()<.5,result=sub?x*m-s:x*m+s,who=pick(names);if(result<=0)return null;
  const wrongWay=(sub?result-s:result+s)/m;
  return make(id,mode,'combined_inverse',`${who} berkata, “Saya fikir satu nombor. Saya darabkan nombor itu dengan ${m}, kemudian saya ${sub?'tolak':'tambah'} ${group(s)}. Jawapannya ialah ${group(result)}.” Cari nombor itu.`,x,choices(x,[Number.isInteger(wrongWay)?wrongWay:null,sub?result+s:result-s,x*m,x+m,x-m],'operation'),'Mula daripada jawapan dan buat operasi songsang mengikut tertib terbalik.','Operasi Songsang','story','reasoning',['operation','inverse'],{x,m,s,sub});
 })}
 function stockStory(id,mode){return attempt(()=>{
  const c=R(4,9),per=R(8,30)*50,stock=c*per,sat=R(Math.floor(stock*.2/5),Math.floor(stock*.35/5))*5,more=R(5,40)*25,sun=sat+more,left=stock-sat-sun;if(left<=0)return null;
  return make(id,mode,'combined_story',`Cikgu Aziz dan Puan Mala bercakap tentang kereta mainan yang dijual di pesta sekolah.<br><b>Cikgu Aziz:</b> “Pembekal menghantar ${c} karton kereta mainan. Setiap karton mengandungi ${group(per)} buah kereta mainan.”<br><b>Puan Mala:</b> “Pada hari Sabtu, ${group(sat)} buah dijual. Pada hari Ahad, kami menjual ${group(more)} buah lebih daripada hari Sabtu.”<br>Berapakah bilangan kereta mainan yang masih tinggal selepas dua hari itu?`,left,choices(left,[stock-sat-more,stock-sat,stock-sun,left+more],'operation'),'Cari jumlah kereta mainan, kemudian jualan hari Ahad, dan tolak jualan kedua-dua hari.','Masalah Pelbagai Langkah','story','reasoning',['operation'],{c,per,sat,more});
 })}

 const GEN={reverse_round:reverseRound,big_subtract:bigSubtract,big_missing:bigMissing,down_payment:downPayment,interest_year1:interest,interest_year2:interest,receipt,
  mixed_mass_three:mixedMass,mixed_length_three:mixedLength,volume_to_litre:volumeToLitre,syrup_share:syrupShare,rope_total:ropes,rope_left:ropes,packets_kg:packets,packets_left:packets,
  decimal_hour:decimalHour,visit_total:visitTotal,year_fraction:yearFraction,date_duration:dateDuration,ratio_part_total:ratioPartTotal,ratio_count_total:ratioCountTotal,rate_distance:rateDistance,rate_time:rateTime,
  area_square_rect:areaSquareRect,perimeter_square_polygon:perimeterSquarePolygon,volume_cube_cuboid:volumeCubeCuboid,freq_median:freqMedian,pictograph_diff:pictograph,pictograph_total:pictograph,pictograph_mean:pictograph,mean_days:meanDays,mean_projection:meanDays,think_number:thinkNumber,stock_story:stockStory};
 // Minimum learner stage per new item (1 beginner, 2 core, 3 secure) and the share of core/secure questions it
 // should take. The model papers are about half Bahagian B items (stories with a Rajah); beginners get fewer.
 const PLAN={
  'D5.N1000000':{share:.35,modes:{reverse_round:2}},
  'D5.MONEY':{share:.5,modes:{big_subtract:1,big_missing:2,down_payment:2,receipt:2,interest_year1:2,interest_year2:3}},
  'D5.MEASURE':{share:.5,modes:{volume_to_litre:1,rope_total:1,packets_kg:1,mixed_mass_three:2,mixed_length_three:2,syrup_share:2,rope_left:3,packets_left:3}},
  'D5.TIME':{share:.45,modes:{decimal_hour:1,visit_total:2,year_fraction:2,date_duration:2}},
  'D5.RATIO':{share:.5,modes:{ratio_count_total:1,ratio_part_total:2}},
  'D5.RATE':{share:.5,modes:{rate_distance:2,rate_time:3}},
  'D5.DATA':{share:.45,modes:{pictograph_diff:1,pictograph_total:1,pictograph_mean:2,freq_median:2,mean_days:2,mean_projection:3}},
  'D5.AREA':{share:.4,modes:{area_square_rect:2,perimeter_square_polygon:2,volume_cube_cuboid:3}},
  'D5.OPS':{share:.35,modes:{think_number:2,stock_story:2}}
 };
 function question(id,s,mode){
  const plan=PLAN[id];if(!plan)return null;const stage=stageOf(s),eligible=Object.keys(plan.modes).filter(m=>plan.modes[m]<=stage);
  const chosen=mode&&GEN[mode]?mode:eligible.length?rotate(id,eligible):null;return chosen?GEN[chosen](id,chosen):null;
 }
 // generate() asks the bank for up to 16 candidates per question and keeps the most varied one, so a per-call coin
 // would hand almost every slot to the new items. Decide once per question slot instead: the slot is keyed by the
 // session history, which changes only when a question is shown, and the draw leans towards the target share.
 let slotId=null,slotLast=null,slotLen=-1,slotNew=false;
 function newItemSlot(id,s,plan){
  const target=stageOf(s)===1?Math.min(.3,plan.share):plan.share;let h=null;
  try{h=sess?.questionHistory}catch(_){}
  if(!Array.isArray(h))return Math.random()<target;
  // History is capped, so its length can stay the same; the newest entry is a fresh object for every question shown.
  const last=h.at(-1);
  if(id!==slotId||last!==slotLast||h.length!==slotLen){const same=h.filter(x=>x.skillId===id).slice(-10),seen=same.length?same.filter(x=>x.source==='d5-completion-v1').length/same.length:target;slotId=id;slotLast=last;slotLen=h.length;slotNew=Math.random()<Math.min(.9,Math.max(.1,2*target-seen))}
  return slotNew;
 }
 banks.d5=function(id,s,shift){
  const plan=PLAN[id];
  if(plan&&newItemSlot(id,s,plan)){const q=question(id,s);if(q)return q}
  return previous.call(this,id,s,shift);
 };
 root.PAD5Completion={version:VERSION,installed:true,plan:PLAN,question};
})(typeof window!=='undefined'?window:globalThis);
