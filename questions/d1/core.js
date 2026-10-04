window.PAQuestionBanks = window.PAQuestionBanks || {};

/* Darjah 1 Pecahan — KSSR Semakan 3.1/3.2.
   Keep this bank self-contained so question expansion does not touch shared
   battle/adaptive/interaction code while the Segel renderer is being edited. */
function d1FracKey(num,den){return num+'/'+den}
function d1FracFormal(num,den){
 if(den===2&&num===1)return 'satu perdua';
 if(den===4&&num===1)return 'satu perempat';
 if(den===4&&num===2)return 'dua perempat';
 if(den===4&&num===3)return 'tiga perempat';
 return d1FracKey(num,den)
}
function d1FracEveryday(num,den){
 if(den===2&&num===1)return pick(['setengah','separuh']);
 if(den===4&&num===1)return 'suku';
 if(den===4&&num===2)return 'dua perempat';
 if(den===4&&num===3)return 'tiga suku';
 return d1FracFormal(num,den)
}
function d1FracTargets(){return [[1,2],[1,4],[2,4],[3,4]]}
function d1FracDistractors(num,den,words=false){
 if(words){
  const pool=(num===2&&den===4)
   ?['satu perempat','tiga perempat','keseluruhan']
   :(num===1&&den===2)
    ?['satu perempat','tiga perempat','keseluruhan']
    :d1FracTargets().filter(([n,d])=>!(n===num&&d===den)).map(([n,d])=>d1FracFormal(n,d));
  return shuffle([...new Set(pool)]).slice(0,3).map(v=>N(v,'fraction'))
 }
 const symbolPool=(num===1&&den===2)?['1/4','3/4','4/4']
  :(num===1&&den===4)?['2/4','3/4','4/4']
  :(num===2&&den===4)?['1/4','3/4','4/4']
  :['1/4','2/4','4/4'];
 return shuffle(symbolPool).map(v=>N(v,'fraction'))
}
function d1FracMini(num,den,kind='bar',invalid=false){
 const fill='#62c991',empty='#edf2ff',stroke='#516684';
 if(invalid){
   if(den===2)return '<div aria-label="dua bahagian tidak sama besar" style="width:78px;height:48px;display:grid;grid-template-columns:1fr 1.8fr;border:2px solid '+stroke+'"><i style="background:'+fill+';border-right:1px solid '+stroke+'"></i><i style="background:'+empty+'"></i></div>';
   return '<div aria-label="empat bahagian tidak sama besar" style="width:78px;height:48px;display:grid;grid-template-columns:.7fr 1.4fr .8fr 1.6fr;border:2px solid '+stroke+'">'+Array.from({length:4},(_,i)=>'<i style="background:'+(i<num?fill:empty)+';border-left:'+(i?'1px':'0')+' solid '+stroke+'"></i>').join('')+'</div>'
 }
 if(kind==='circle'){
   const deg=Math.round(num/den*360);
   return '<div aria-label="'+d1FracFormal(num,den)+'" style="width:56px;height:56px;border:2px solid '+stroke+';border-radius:50%;background:conic-gradient('+fill+' 0deg '+deg+'deg,'+empty+' '+deg+'deg 360deg)"></div>'
 }
 if(kind==='square'&&den===4){
   return '<div aria-label="'+d1FracFormal(num,den)+'" style="width:56px;height:56px;display:grid;grid-template-columns:repeat(2,1fr);border:2px solid '+stroke+'">'+Array.from({length:4},(_,i)=>'<i style="background:'+(i<num?fill:empty)+';border:1px solid '+stroke+'"></i>').join('')+'</div>'
 }
 return '<div aria-label="'+d1FracFormal(num,den)+'" style="width:78px;height:48px;display:grid;grid-template-columns:repeat('+den+',1fr);border:2px solid '+stroke+'">'+Array.from({length:den},(_,i)=>'<i style="background:'+(i<num?fill:empty)+';border-left:'+(i?'1px':'0')+' solid '+stroke+'"></i>').join('')+'</div>'
}
function d1FracChoiceBoard(num,den){
 const correct={n:num,d:den,kind:pick(den===4?['bar','circle','square']:['bar','circle']),ok:true};
 const pool=d1FracTargets().filter(([n,d])=>!(n===num&&d===den));
 const wrong=shuffle(pool).slice(0,2).map(([n,d])=>({n,d,kind:pick(d===4?['bar','circle','square']:['bar','circle']),ok:false}));
 wrong.push({n:num,d:den,kind:'bar',invalid:true,ok:false});
 const choices=shuffle([correct,...wrong]);
 const letters=['A','B','C','D'];
 const answer=letters[choices.findIndex(x=>x.ok)];
 const html='<div role="group" aria-label="Pilihan rajah pecahan" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;max-width:250px;margin:8px auto 12px">'+choices.map((x,i)=>'<div style="display:flex;align-items:center;justify-content:center;gap:7px;padding:8px;border:2px solid #c7d2e5;border-radius:10px;background:#f8fbff"><b>'+letters[i]+'</b>'+d1FracMini(x.n,x.d,x.kind,x.invalid)+'</div>').join('')+'</div>';
 return {html,answer}
}
function d1EqualPartsBoard(den){
 const correct=d1FracMini(1,den,pick(den===4?['bar','square']:['bar']),false);
 const invalid=d1FracMini(1,den,'bar',true);
 const correctFirst=Math.random()<.5,answer=correctFirst?'A':'B';
 const a=correctFirst?correct:invalid,b=correctFirst?invalid:correct;
 return {answer,html:'<div style="display:flex;justify-content:center;gap:14px;margin:8px auto 12px"><div><b>A</b>'+a+'</div><div><b>B</b>'+b+'</div></div>'}
}
function d1FinalizeFrac(q,archetype,competency='D1.FRAC.3.1.1',context='visual'){
 q.archetypeId=archetype;
 q.competencyId=competency;
 q.templateId=archetype;
 q.representation='fraction_area';
 q.demand=competency.endsWith('3.2.1')?'application':'concept';
 q.contextId=context;
 q.source='d1-kssr-expanded';
 return q
}
function d1FractionQuestion(s,shift){
 const [num,den]=pick(d1FracTargets()),mode=R(0,7);
 const visual=()=>fractionVisual(num,den);

 if(mode===0){
   const ans=d1FracFormal(num,den);
   const q=Q(visual()+'Bahagian berlorek menunjukkan pecahan apa?',ans,d1FracDistractors(num,den,true),'Pastikan keseluruhan dibahagi kepada bahagian yang sama besar.','Darjah 1 · Pecahan',true,shift);
   return d1FinalizeFrac(q,'d1_frac_name_from_picture')
 }
 if(mode===1){
   const ans=d1FracKey(num,den);
   const q=Q(visual()+'Pilih simbol pecahan yang sepadan dengan rajah.',ans,d1FracDistractors(num,den,false),'Kira jumlah bahagian sama besar, kemudian kira bahagian yang berlorek.','Darjah 1 · Pecahan',true,shift);
   return d1FinalizeFrac(q,'d1_frac_symbol_from_picture')
 }
 if(mode===2){
   const board=d1FracChoiceBoard(num,den),target=d1FracFormal(num,den);
   const letters=['A','B','C','D'];
   const q=Q('Rajah manakah menunjukkan <b>'+target+'</b>?'+board.html,board.answer,letters.filter(x=>x!==board.answer).map(x=>N(x,'fraction')),'Bahagian pecahan mesti sama besar.','Darjah 1 · Pecahan',true,shift);
   return d1FinalizeFrac(q,'d1_frac_choose_picture')
 }
 if(mode===3){
   const d=pick([2,4]),board=d1EqualPartsBoard(d),letters=['A','B'];
   const target=d===2?'satu perdua':'satu perempat';
   const wrong=[...letters.filter(x=>x!==board.answer),'Kedua-duanya','Tiada'].map(x=>N(x,'fraction'));
   const q=Q('Rajah manakah benar-benar boleh menunjukkan <b>'+target+'</b>?'+board.html,board.answer,wrong,'Pecahan mesti membahagi satu keseluruhan kepada bahagian yang sama besar.','Darjah 1 · Pecahan',true,shift);
   return d1FinalizeFrac(q,'d1_frac_equal_parts')
 }
 if(mode===4){
   const target=pick([2,3]),shown=R(0,target-1),need=target-shown;
   const shownHtml=fractionVisual(shown,4);
   const nums=[0,1,2,3,4].filter(v=>v!==need),wrongNums=shuffle(nums).slice(0,3);
   const q=Q(shownHtml+'Rajah perlu menjadi <b>'+d1FracFormal(target,4)+'</b>. Berapa lagi bahagian perlu dilorek?',need,wrongNums.map(v=>N(v,'fraction')),'Kira bahagian yang masih perlu ditambah sehingga cukup pecahan sasaran.','Darjah 1 · Pecahan',true,shift);
   return d1FinalizeFrac(q,'d1_frac_complete_shading','D1.FRAC.3.1.1','shade')
 }
 if(mode===5){
   const folds=den===2?2:4,ans=d1FracFormal(num,den);
   const object=pick(['sekeping kertas','sekeping kad','sehelai kain']);
   const q=Q('<b>'+object+'</b> dilipat menjadi <b>'+folds+' bahagian sama besar</b>. '+num+' bahagian ditandakan. Apakah pecahannya?',ans,d1FracDistractors(num,den,true),'Bayangkan satu keseluruhan dilipat kepada bahagian yang sama besar.','Darjah 1 · Pecahan',true,shift);
   return d1FinalizeFrac(q,'d1_frac_paper_fold','D1.FRAC.3.1.1','fold')
 }
 if(mode===6){
   const objects=den===2?['sebiji epal','sebiji sandwic','sekeping roti']:['sebiji piza','sebiji kek','sebatang coklat'];
   const object=pick(objects),ans=d1FracEveryday(num,den);
   const wrongWords=(num===2&&den===4)|| (num===1&&den===2)
    ?['suku','tiga suku','keseluruhan']
    :d1FracTargets().filter(([n,d])=>!(n===num&&d===den)).map(([n,d])=>d1FracEveryday(n,d));
   const wrong=shuffle([...new Set(wrongWords)]).slice(0,3).map(v=>N(v,'fraction'));
   const q=Q('<b>'+object+'</b> dibahagi kepada <b>'+den+' bahagian sama besar</b>. '+num+' bahagian digunakan. Berapa bahagian daripada keseluruhan itu?',ans,wrong,'Bayangkan objek itu sebagai satu keseluruhan sebelum dibahagi.','Darjah 1 · Pecahan',true,shift);
   return d1FinalizeFrac(q,'d1_frac_daily_story','D1.FRAC.3.2.1','daily')
 }

 const names=[['satu perdua',1,2],['satu perempat',1,4],['dua perempat',2,4],['tiga perempat',3,4]];
 const target=pick(names),ans=d1FracKey(target[1],target[2]);
 const q=Q('Cikgu menyebut <b>'+target[0]+'</b>. Simbol pecahan yang betul ialah?',ans,d1FracDistractors(target[1],target[2],false),'Padankan nama pecahan dengan bilangan bahagian daripada satu keseluruhan.','Darjah 1 · Pecahan',false,shift);
 return d1FinalizeFrac(q,'d1_frac_words_to_symbol')
}
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
 if(id==="D1.FRAC")return d1FractionQuestion(s,shift)
 if(id==="D1.MONEY"){let a=R(1,10),b=R(1,10),ans=a+b;return Q(`RM${a} + RM${b} = ?`,`RM${ans}`,[N(`RM${Math.max(0,ans-5)}`,"money"),N(`RM${ans+5}`,"money"),N(`${ans} sen`,"money")],"Tambah nilai dan kekalkan unit RM.","Darjah 1",true,shift)}
 if(id==="D1.TIME"){let h=R(1,12),ans=`${h}:00`;return Q(`${clockSvg(h,0)}Jam menunjukkan pukul?`,ans,[N(`${(h%12)+1}:00`,"time"),N(`${h}:30`,"time"),N(`${Math.max(1,h-1)}:00`,"time")],"Jam tepat mempunyai 00 minit.","Darjah 1",false,shift)}
 if(id==="D1.MEASURE"){return Q(`Unit sesuai untuk panjang pensel?`,`cm`,[N("kg","unit"),N("L","unit"),N("g","unit")],"Panjang biasanya cm atau m.","Darjah 1",false,shift)}
 if(id==="D1.SHAPE"){let q=pick([["triangle","segi tiga"],["square","segi empat sama"],["circle","bulatan"]]);return Q(`${shapeSvg(q[0])}Ini bentuk apa?`,q[1],[N("segi empat tepat","shape"),N("kubus","shape"),N(q[1]==="bulatan"?"segi tiga":"bulatan","shape")],"Perhatikan ciri bentuk.","Darjah 1",false,true)}
 if(id==="D1.DATA"){let labels=['A','B','C'],vals=[R(2,6),R(2,6),R(2,6)],mx=Math.max(...vals),ans=labels[vals.indexOf(mx)];return Q(`${barChart(labels,vals)}Palang manakah paling tinggi?`,ans,labels.filter(x=>x!==ans).map(x=>N(x,"data")).concat([N(String(vals.reduce((a,b)=>a+b,0)),"operation")]).slice(0,3),"Cari nilai paling besar pada carta.","Darjah 1",false,true)}
 return null;
};
