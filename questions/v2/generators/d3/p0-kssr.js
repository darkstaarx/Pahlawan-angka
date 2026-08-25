// questions/v2/generators/d3/p0-kssr.js
// Phase 3A-2: semantic-hardening generator for Darjah 3 T2/T3/T5/T6/T9.
// Pure authored source: no Node/browser globals.
(function(){
'use strict';
function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(rng,a){return a[Math.floor(rng()*a.length)];}
function shuffle(rng,a){var o=a.slice();for(var i=o.length-1;i>0;i--){var j=Math.floor(rng()*(i+1)),t=o[i];o[i]=o[j];o[j]=t;}return o;}
function gcd(a,b){while(b){var t=a%b;a=b;b=t;}return Math.abs(a);}
function lcm(a,b){return Math.abs(a*b)/gcd(a,b);}
function ch(id,label,tag){return{id:String(id),labelMs:String(label),misconceptionTag:tag||null};}
function fp(arch,parts){return arch+'::'+parts.map(String).join('::');}
function uniqLabels(answer,wrong){var vals=[answer.labelMs].concat(wrong.map(function(x){return x.labelMs;})).map(function(x){return String(x).trim().toLowerCase();});return new Set(vals).size===4;}
function pack(prompt,answer,wrong,visual,arch,hint,mis,semantic){
  if(!Array.isArray(wrong)||wrong.length!==3)throw new Error('d3.p0Kssr needs three distractors '+arch);
  if(!uniqLabels(answer,wrong))throw new Error('d3.p0Kssr duplicate choices '+arch);
  return{value:{promptMs:prompt,answer:answer,visual:visual||null},distractors:wrong,meta:{archetype:arch,hintMs:hint||'Baca maklumat satu demi satu.',misconceptionTargets:mis||[],semanticProperties:semantic||{},fingerprint:fp(arch,[answer.id].concat(Object.keys(semantic||{}).sort().map(function(k){return semantic[k];})))}};
}
function numPack(prompt,ans,wrongs,visual,arch,hint,mis,fmt,semantic,min,max){
  fmt=fmt||function(x){return String(x);};var seen=Object.create(null),ansLabel=fmt(ans);seen[ansLabel]=1;var ws=[];
  function add(v){if(min!=null&&v<min)return;if(max!=null&&v>max)return;var s=fmt(v);if(!seen[s]){seen[s]=1;ws.push(ch('w'+ws.length,s,mis&&mis[0]));}}
  for(var i=0;i<wrongs.length&&ws.length<3;i++)add(wrongs[i]);
  for(var delta=1;ws.length<3&&delta<100000;delta++){add(ans+delta);add(ans-delta);}
  return pack(prompt,ch('a',ansLabel),shuffle(function(){return 0.5;},ws.slice(0,3)),visual,arch,hint,mis,semantic||{answer:ans});
}
function pctWords(n){var small=['sifar','satu','dua','tiga','empat','lima','enam','tujuh','lapan','sembilan','sepuluh','sebelas'];function w(x){if(x<12)return small[x];if(x<20)return small[x-10]+' belas';if(x<100){var t=Math.floor(x/10),r=x%10;return small[t]+' puluh'+(r?' '+small[r]:'');}return 'seratus';}return w(n)+' peratus';}
function frac(n,d){return n+'/'+d;}
function simplify(n,d){var g=gcd(n,d);return[n/g,d/g];}
function decimal2(n){return (Math.round(n*100)/100).toFixed(2);}
function clockLabel(h,m){return h+':'+String(m).padStart(2,'0');}
function clockFromMinutes(mins){mins=((mins%720)+720)%720;var h=Math.floor(mins/60);if(h===0)h=12;return clockLabel(h,mins%60);}
function durationLabel(sec){sec=Math.max(0,Math.round(sec));var h=Math.floor(sec/3600),r=sec%3600,m=Math.floor(r/60),s=r%60,a=[];if(h)a.push(h+' jam');if(m)a.push(m+' minit');if(s||!a.length)a.push(s+' saat');return a.join(' ');}
function durationChoices(answerSec,candidates,tag){var seen=Object.create(null),out=[],answerLabel=durationLabel(answerSec);seen[answerLabel.toLowerCase()]=1;function add(sec){sec=Math.max(1,Math.round(sec));var label=durationLabel(sec),key=label.toLowerCase();if(!seen[key]){seen[key]=1;out.push(ch('w'+out.length,label,tag));}}for(var i=0;i<candidates.length&&out.length<3;i++)add(candidates[i]);for(var step=1;out.length<3&&step<=7200;step++){add(answerSec+step);if(answerSec-step>0)add(answerSec-step);}if(out.length!==3)throw new Error('d3.p0Kssr unable to build duration distractors');return out.slice(0,3);}
function unitVisual(kind,value,max,label,extra){var v={kind:kind,value:value,max:max||value,label:label||''};if(extra)for(var k in extra)v[k]=extra[k];return v;}
function barVisual(parts,labels){return{kind:'bar_model',parts:parts,labels:labels||[]};}
function groupingVisual(groups,each,label){return{kind:'grouping',groups:groups,each:each,label:label||''};}
function fractionVisual(n,d,count){return{kind:'fraction_area',numerator:n,denominator:d,count:count||1};}
function fractionPairVisual(aN,aD,bN,bD,op){return{kind:'fraction_area_pair',a:{numerator:aN,denominator:aD},b:{numerator:bN,denominator:bD},operation:op};}
function mixedNumberVisual(whole,rem,den){return{kind:'mixed_number',whole:whole,numerator:rem,denominator:den};}
function gridVisual(shaded){return{kind:'hundred_grid',shaded:shaded};}
function lineVisual(values,marks){return{kind:'number_line',values:values,marks:marks||[]};}
function clockVisual(h,m){return{kind:'clock',hour:h,minute:m};}
function timelineVisual(start,end,markers,labels){return{kind:'timeline',start:start,end:end,markers:markers||[],labels:labels||[]};}
function calendarVisual(year,month,startDay,days,highlight){return{kind:'calendar',year:year,month:month,startDay:startDay,days:days,highlight:highlight};}
function tableVisual(headers,rows){return{kind:'table',headers:headers,rows:rows};}
function rawDataVisual(items){return{kind:'classification',items:items};}
function pieVisual(labels,values,showValues){return{kind:'pie_chart',labels:labels,values:values,showValues:!!showValues};}
function barChartVisual(labels,values){return{kind:'bar_chart',labels:labels,values:values};}
function pictographVisual(labels,values,key){return{kind:'pictograph',labels:labels,values:values,key:key||1};}
function decimalOperationVisual(a,b,op){return{kind:'decimal_operation',a:a,b:b,operation:op};}
function mixedUnit(total,base,big,small){var w=Math.floor(total/base),r=total%base;return (w?w+' '+big+(r?' ':''):'')+(r?r+' '+small:(!w?'0 '+small:''));}
function tally(n){var groups=Math.floor(n/5),rem=n%5,a=[];for(var i=0;i<groups;i++)a.push('||||/');if(rem)a.push('|'.repeat(rem));return a.join(' ');}
function countMap(items){var m=Object.create(null);items.forEach(function(x){m[x]=(m[x]||0)+1;});return m;}
function safeFractions(rng){var d1=pick(rng,[2,3,4,5]),d2=d1*2;if(d2>10){d1=pick(rng,[2,3,4,5]);d2=d1*2;}var n1=1,n2=1,common=lcm(d1,d2),sum=n1*(common/d1)+n2*(common/d2);return{n1:n1,d1:d1,n2:n2,d2:d2,common:common,sum:sum};}
function fractionWrongs(cn,cd,cands,tag,suffix){var seen=Object.create(null),out=[],suf=suffix||'';function add(n,d){n=Math.round(n);d=Math.round(d);if(n<=0||d<=0||d>10)return;if(n*cd===cn*d)return;var lab=frac(n,d)+suf;if(seen[lab])return;seen[lab]=1;out.push(ch('w'+out.length,lab,tag));}for(var i=0;i<cands.length&&out.length<3;i++)add(cands[i][0],cands[i][1]);for(var dd=2;dd<=10&&out.length<3;dd++)for(var nn=1;nn<dd&&out.length<3;nn++)add(nn,dd);return out.slice(0,3);}

registerGenerator('d3.p0Kssr',function(params,rng){
  var c=params&&params.competencyId,m=params&&params.mode;if(!c||!m)throw new Error('d3.p0Kssr missing competencyId/mode');

  // D3.T2 — Operasi Asas
  if(c==='solve_addition_subtraction_word_problems'){
    if(m==='context_result'){
      var add=rng()<0.5,a=ri(rng,1200,4200),b=ri(rng,300,1800),d=ri(rng,200,1300),ans,p;
      if(add){while(a+b+d>10000){a-=100;b=Math.max(100,b-50);d=Math.max(100,d-50);}ans=a+b+d;p='Perpustakaan mempunyai '+a+' buku. Sebanyak '+b+' buku baharu diterima pada Isnin dan '+d+' lagi pada Selasa. Berapakah jumlah buku sekarang?';}
      else{var total=ri(rng,4500,9800);b=ri(rng,400,1800);d=ri(rng,200,Math.min(1400,total-b-100));ans=total-b-d;a=total;p='Sebuah stor mempunyai '+a+' kotak. '+b+' kotak dihantar pada pagi dan '+d+' kotak lagi pada petang. Berapakah kotak yang tinggal?';}
      return numPack(p,ans,[add?a+b-d:a-b+d,add?a+b:a-b,ans+100],barVisual([a,add?b:-b,add?d:-d],['mula','langkah 1','langkah 2']),'word_problem_result','Jejak ketiga-tiga nilai dalam cerita mengikut tanda operasi.',['operation_selection'],null,{values:3,result:ans,operation:add?'add3':'sub3'},0,10000);
    }
    if(m==='missing_part_bar'){
      var whole=ri(rng,3500,9000),part=ri(rng,800,whole-800),ans2=whole-part;
      return numPack('Jumlah dua kumpulan ialah '+whole+'. Satu kumpulan mempunyai '+part+'. Berapakah kumpulan yang satu lagi?',ans2,[whole+part,part,ans2+100],barVisual([part,ans2],['diketahui','?']),'word_problem_missing_part','Jumlah = bahagian diketahui + bahagian yang dicari.',['part_whole_confusion'],null,{whole:whole,part:part},0,10000);
    }
    if(m==='choose_operation'){
      var x=ri(rng,1200,6000),y=ri(rng,300,1200),ans3=ch('subtract','Tolak');
      return pack('Ali mempunyai '+x+' keping kad. Dia memberikan '+y+' keping kepada kawannya. Operasi manakah patut digunakan untuk mencari baki?',ans3,[ch('add','Tambah','operation_selection'),ch('multiply','Darab','operation_selection'),ch('divide','Bahagi','operation_selection')],null,'choose_operation_from_context','Perkataan “memberikan” menunjukkan kuantiti berkurang.',['operation_selection'],{x:x,y:y});
    }
    if(m==='direct_add'){
      var da1=ri(rng,1200,7500),da2=ri(rng,300,Math.min(2499,9999-da1)),dans=da1+da2;
      return numPack(da1+' + '+da2+' = ?',dans,[da1-da2,da1+da2+10,da2],null,'direct_addition_fluency','Susun mengikut nilai tempat: ribu, ratus, puluh, sa.',['place_value_alignment'],null,{a:da1,b:da2,operation:'add',result:dans},0,10000);
    }
    if(m==='direct_subtract'){
      var ds1=ri(rng,4000,9800),ds2=ri(rng,300,Math.min(3500,ds1-500)),dsans=ds1-ds2;
      return numPack(ds1+' − '+ds2+' = ?',dsans,[ds1+ds2,ds1-ds2-10,ds2],null,'direct_subtraction_fluency','Pinjam daripada nilai tempat sebelah jika perlu.',['borrowing_error'],null,{a:ds1,b:ds2,operation:'sub',result:dsans},0,10000);
    }
  }
  if(c==='solve_mixed_addition_subtraction_problems'){
    if(m==='add_then_subtract'){
      var a1=ri(rng,1500,4000),b1=ri(rng,500,1800),c1=ri(rng,300,1200),ans4=a1+b1-c1;
      return numPack('Sebuah pusat mengumpul '+a1+' botol pada Isnin dan '+b1+' pada Selasa. Kemudian '+c1+' botol dihantar untuk kitar semula. Berapakah yang masih ada?',ans4,[a1+b1+c1,a1-b1+c1,a1+b1],barVisual([a1,b1,-c1],['Isnin','Selasa','keluar']),'mixed_add_then_subtract','Tambah dahulu, kemudian tolak seperti urutan cerita.',['operation_order'],null,{a:a1,b:b1,c:c1},0,10000);
    }
    if(m==='subtract_then_add'){
      var a2=ri(rng,4500,8500),b2=ri(rng,600,1800),c2=ri(rng,400,1500),ans5=a2-b2+c2;
      return numPack('Stok awal ialah '+a2+'. Sebanyak '+b2+' digunakan, kemudian '+c2+' stok baharu diterima. Berapakah stok akhir?',ans5,[a2-b2-c2,a2+b2+c2,a2+c2],barVisual([a2,-b2,c2],['awal','guna','terima']),'mixed_subtract_then_add','Ikut perubahan stok satu demi satu.',['operation_order'],null,{a:a2,b:b2,c:c2},0,10000);
    }
    if(m==='choose_expression'){
      var aa=ri(rng,3000,6000),bb=ri(rng,400,1200),cc=ri(rng,200,900),lab=aa+' − '+bb+' + '+cc;
      return pack('Mula dengan '+aa+' unit. '+bb+' unit digunakan dan kemudian '+cc+' unit ditambah. Ungkapan manakah mewakili situasi itu?',ch('correct',lab),[ch('w1',aa+' + '+bb+' + '+cc,'operation_order'),ch('w2',aa+' − ('+bb+' + '+cc+')','operation_order'),ch('w3',aa+' + '+bb+' − '+cc,'operation_order')],barVisual([aa,-bb,cc],['mula','guna','tambah']),'choose_expression_for_two_step','Padankan setiap perubahan dengan tanda operasi.',['operation_order'],{a:aa,b:bb,c:cc});
    }
    if(m==='missing_addend'){
      var ma1=ri(rng,1000,6000),matotal=ri(rng,ma1+500,Math.min(9999,ma1+4000)),maans=matotal-ma1;
      return numPack(ma1+' + ___ = '+matotal,maans,[matotal+ma1,matotal-ma1-100,matotal],null,'missing_addend_fluency','Tolak nombor yang diketahui daripada jumlah untuk cari nombor yang hilang.',['inverse_operation'],null,{a:ma1,total:matotal,operation:'missing_add',result:maans},0,10000);
    }
    if(m==='direct_two_step'){
      var t1=ri(rng,2000,5000),t2=ri(rng,300,1500),t3=ri(rng,200,1200),tans=t1+t2-t3;
      return numPack(t1+' + '+t2+' − '+t3+' = ?',tans,[t1-t2+t3,t1+t2+t3,t1+t2],null,'direct_two_step_fluency','Kira dari kiri ke kanan mengikut turutan operasi.',['operation_order'],null,{a:t1,b:t2,c:t3,result:tans},0,10000);
    }
  }
  if(c==='multiply_divide_numbers_by_1digit_powers10'){
    if(m==='one_digit'){
      var mult=rng()<0.5,f=ri(rng,2,9),n=ri(rng,12,Math.floor(10000/f)),prod=f*n;
      if(mult)return numPack(n+' × '+f+' = ?',prod,[n+f,n*(f-1),Math.min(10000,prod+f)],groupingVisual(f,n),'multiply_divide_one_digit','Darab ialah kumpulan sama banyak.',['multiply_divide_inverse'],null,{n:n,factor:f,operation:'mul',result:prod},0,10000);
      var q=ri(rng,12,Math.floor(10000/f)),total2=q*f;return numPack(total2+' ÷ '+f+' = ?',q,[f,q+1,Math.max(1,q-1)],groupingVisual(f,q),'multiply_divide_one_digit','Gunakan hubungan darab dan bahagi.',['multiply_divide_inverse'],null,{total:total2,factor:f,operation:'div',result:q},0,10000);
    }
    if(m==='powers10'){
      var pow=pick(rng,[10,100,1000]),mul=rng()<0.5,base=ri(rng,1,Math.max(1,Math.floor(10000/pow))),an=base;
      var prompt=mul?base+' × '+pow+' = ?':(base*pow)+' ÷ '+pow+' = ?';if(mul)an=base*pow;
      return numPack(prompt,an,[mul?base*(pow/10):base*10,base+pow,mul?Math.min(10000,base*10):Math.max(1,Math.floor(base/10))],{kind:'place_value_shift',base:base,factor:pow,operation:mul?'mul':'div'},'multiply_divide_powers10','Perhatikan perubahan nilai tempat apabila darab atau bahagi 10, 100 atau 1000.',['zero_place_value'],null,{base:base,factor:pow,operation:mul?'mul':'div',result:an,maxValue:Math.max(base*pow,an)},0,10000);
    }
    if(m==='missing_factor'){
      var g=ri(rng,2,9),each=ri(rng,20,Math.floor(10000/g)),tot=g*each;
      return numPack('□ × '+g+' = '+tot+'. Apakah nombor dalam kotak?',each,[g,tot,each+g],groupingVisual(g,each),'inverse_missing_factor','Gunakan bahagi untuk mencari faktor yang hilang.',['multiply_divide_inverse'],null,{g:g,each:each,total:tot},0,10000);
    }
  }

  // D3.T3 — Pecahan, Perpuluhan dan Peratus
  if(c==='identify_equivalent_fractions'){
    var d0=pick(rng,[2,3,4,5]),k0=pick(rng,[2,3,4].filter(function(k){return d0*k<=10;})),n0=ri(rng,1,d0-1),en=n0*k0,ed=d0*k0;
    if(m==='symbolic_match')return pack('Pecahan manakah setara dengan '+frac(n0,d0)+'?',ch('a',frac(en,ed)),[ch('w1',frac(n0,ed),'scale_one_part_only'),ch('w2',frac(en,d0),'scale_one_part_only'),ch('w3',frac(en+1,ed),'scale_one_part_only')],null,'equivalent_fraction_symbolic','Darab pengangka dan penyebut dengan nombor yang sama.',['scale_one_part_only'],{sourceDenominator:d0,targetDenominator:ed,maxDenominator:ed});
    if(m==='area_match')return pack('Rajah menunjukkan '+frac(n0,d0)+'. Pecahan manakah mempunyai nilai yang sama?',ch('a',frac(en,ed)),[ch('w1',frac(n0,ed),'visual_fraction_equivalence'),ch('w2',frac(en+1,ed),'visual_fraction_equivalence'),ch('w3',frac(en+2,ed),'visual_fraction_equivalence')],fractionVisual(n0,d0),'equivalent_fraction_area','Banding bahagian berlorek, bukan hanya nombor penyebut.',['visual_fraction_equivalence'],{sourceDenominator:d0,targetDenominator:ed,maxDenominator:ed});
    if(m==='missing_number')return numPack(frac(n0,d0)+' = □/'+ed+'. Apakah nombor dalam kotak?',en,[n0,k0,en+1],null,'equivalent_fraction_missing_number','Cari faktor pada penyebut, kemudian guna faktor sama pada pengangka.',['scale_one_part_only'],null,{sourceDenominator:d0,targetDenominator:ed,maxDenominator:ed},1,10);
  }
  if(c==='simplify_proper_fractions'){
    var sd=pick(rng,[4,6,8,9,10]),factorCandidates=[2,3,5].filter(function(v){return sd%v===0;}),sf=pick(rng,factorCandidates),baseD=sd/sf,baseN=ri(rng,1,baseD-1);while(gcd(baseN,baseD)!==1){baseN=ri(rng,1,baseD-1);}var sn=baseN*sf;
    if(m==='simplest_form')return pack('Permudahkan '+frac(sn,sd)+'.',ch('a',frac(baseN,baseD)),[ch('w1',frac(Math.max(1,sn/sf),sd),'not_fully_simplified'),ch('w2',frac(sn,Math.max(1,sd/sf)),'not_fully_simplified'),ch('w3',frac(baseN,Math.min(10,baseD+1)),'not_fully_simplified')],null,'simplify_fraction_direct','Bahagi pengangka dan penyebut dengan faktor sepunya yang sama.',['not_fully_simplified'],{sourceDenominator:sd,resultDenominator:baseD,maxDenominator:sd});
    if(m==='common_factor')return pack('Untuk memudahkan '+frac(sn,sd)+' terus kepada bentuk termudah, faktor sepunya manakah boleh digunakan?',ch('a',String(sf)),[ch('w1','1','wrong_common_factor'),ch('w2',String(sf+1),'wrong_common_factor'),ch('w3',String(sf+2),'wrong_common_factor')],null,'identify_common_factor_for_simplification','Cari faktor yang membahagi pengangka dan penyebut.',['wrong_common_factor'],{sourceDenominator:sd,factor:sf,maxDenominator:sd});
    if(m==='area_simplify')return pack('Bahagian berlorek mewakili '+frac(sn,sd)+'. Bentuk termudahnya ialah?',ch('a',frac(baseN,baseD)),[ch('w1',frac(sn,sd),'not_fully_simplified'),ch('w2',frac(baseN,sd),'visual_fraction_equivalence'),ch('w3',frac(baseN,Math.min(10,baseD+1)),'visual_fraction_equivalence')],fractionVisual(sn,sd),'simplify_fraction_from_area','Gabungkan bahagian sama untuk melihat pecahan yang lebih ringkas.',['visual_fraction_equivalence'],{sourceDenominator:sd,resultDenominator:baseD,maxDenominator:sd});
  }
  if(c==='add_subtract_proper_fractions'){
    var fr=safeFractions(rng),sumS=simplify(fr.sum,fr.common),diffNum=Math.abs(fr.n1*(fr.common/fr.d1)-fr.n2*(fr.common/fr.d2));if(diffNum===0)diffNum=1;var diffS=simplify(diffNum,fr.common);
    if(m==='add_same_denominator'){var addWrong=fractionWrongs(sumS[0],sumS[1],[[fr.n1+fr.n2,fr.d1+fr.d2],[sumS[0]+1,sumS[1]],[Math.max(1,sumS[0]-1),sumS[1]]],'add_denominators','');return pack(frac(fr.n1,fr.d1)+' + '+frac(fr.n2,fr.d2)+' = ?',ch('a',frac(sumS[0],sumS[1])),addWrong,fractionPairVisual(fr.n1,fr.d1,fr.n2,fr.d2,'+'),'add_proper_fractions','Tukar kepada penyebut sepunya sebelum menambah pengangka.',['add_denominators'],{denominatorA:fr.d1,denominatorB:fr.d2,unlikeDenominators:fr.d1!==fr.d2,maxDenominator:Math.max(fr.d1,fr.d2)});}
    if(m==='subtract_same_denominator'){
      var hiN=fr.n1*(fr.common/fr.d1),loN=fr.n2*(fr.common/fr.d2),aN=hiN>=loN?fr.n1:fr.n2,aD=hiN>=loN?fr.d1:fr.d2,bN=hiN>=loN?fr.n2:fr.n1,bD=hiN>=loN?fr.d2:fr.d1;
      var subWrong=fractionWrongs(diffS[0],diffS[1],[[Math.max(1,aN-bN),aD+bD],[sumS[0],sumS[1]],[diffS[0]+1,diffS[1]]],'subtract_denominators','');return pack(frac(aN,aD)+' − '+frac(bN,bD)+' = ?',ch('a',frac(diffS[0],diffS[1])),subWrong,fractionPairVisual(aN,aD,bN,bD,'−'),'subtract_proper_fractions','Tukar kepada penyebut sepunya sebelum menolak.',['subtract_denominators'],{denominatorA:aD,denominatorB:bD,unlikeDenominators:aD!==bD,maxDenominator:Math.max(aD,bD)});
    }
    if(m==='context_fraction'){var ctxWrong=fractionWrongs(sumS[0],sumS[1],[[fr.n1+fr.n2,fr.d1+fr.d2],[diffS[0],diffS[1]],[sumS[0]+1,sumS[1]]],'add_denominators',' m');return pack('Aina menggunakan '+frac(fr.n1,fr.d1)+' meter reben merah dan '+frac(fr.n2,fr.d2)+' meter reben biru. Berapakah jumlah reben?',ch('a',frac(sumS[0],sumS[1])+' m'),ctxWrong,fractionPairVisual(fr.n1,fr.d1,fr.n2,fr.d2,'+'),'fraction_operation_context','Gunakan penyebut sepunya sebelum menjumlahkan dua panjang reben.',['operation_selection','add_denominators'],{denominatorA:fr.d1,denominatorB:fr.d2,unlikeDenominators:true,context:'ribbon'});}
  }
  if(c==='identify_improper_fractions_and_mixed_numbers'){
    var den2=ri(rng,2,10),whole=ri(rng,1,3),rem=ri(rng,1,den2-1),imp=whole*den2+rem;
    if(m==='improper_to_mixed'){
      // R2: build three semantically plausible but display-unique mixed-number
      // distractors. The old denominator trap used Math.min(10, den2+1), which
      // becomes den2 again when den2 === 10 and duplicated the correct label.
      var altRem=den2===2?1:(rem===den2-1?rem-1:rem+1);
      var w2Label=den2===2?whole+' '+frac(rem,3):whole+' '+frac(altRem,den2);
      var farWhole=whole===1?whole+2:whole-1;
      return pack('Tukarkan '+frac(imp,den2)+' kepada nombor bercampur.',ch('a',whole+' '+frac(rem,den2)),[
        ch('w1',(whole+1)+' '+frac(rem,den2),'whole_remainder_confusion'),
        ch('w2',w2Label,'whole_remainder_confusion'),
        ch('w3',farWhole+' '+frac(rem,den2),'whole_remainder_confusion')
      ],null,'convert_improper_to_mixed','Bahagi pengangka dengan penyebut; baki menjadi pengangka pecahan.',['whole_remainder_confusion'],{denominator:den2,maxDenominator:den2});
    }
    if(m==='mixed_to_improper')return pack('Tukarkan '+whole+' '+frac(rem,den2)+' kepada pecahan tak wajar.',ch('a',frac(imp,den2)),[ch('w1',frac(whole+rem,den2),'whole_remainder_confusion'),ch('w2',frac(imp+den2,den2),'whole_remainder_confusion'),ch('w3',frac(imp,den2===10?9:den2+1),'whole_remainder_confusion')],null,'convert_mixed_to_improper','Darab nombor bulat dengan penyebut, kemudian tambah pengangka.',['whole_remainder_confusion'],{denominator:den2,maxDenominator:den2});
    if(m==='picture_identify')return pack('Rajah menunjukkan '+whole+' bentuk penuh dan '+rem+' daripada '+den2+' bahagian bentuk seterusnya. Apakah nombor bercampur itu?',ch('a',whole+' '+frac(rem,den2)),[ch('w1',frac(imp,den2),'whole_remainder_confusion'),ch('w2',whole+' '+frac(rem,den2===10?9:den2+1),'whole_remainder_confusion'),ch('w3',(whole+1)+' '+frac(rem,den2),'whole_remainder_confusion')],mixedNumberVisual(whole,rem,den2),'identify_mixed_number_from_picture','Kira bentuk penuh dahulu, kemudian bahagian bentuk yang belum penuh.',['whole_remainder_confusion'],{whole:whole,remainder:rem,denominator:den2,visualWholes:whole});
  }
  if(c==='convert_hundredths_fractions_to_decimals'){
    var hn=ri(rng,1,99),dec=decimal2(hn/100);
    if(m==='hundredths_symbolic')return pack(frac(hn,100)+' dalam bentuk perpuluhan ialah?',ch('a',dec),[ch('w1',(hn/10).toFixed(1),'decimal_place_value'),ch('w2',String(hn),'decimal_place_value'),ch('w3',decimal2(((hn%99)+1)/100),'decimal_place_value')],null,'hundredths_to_decimal','Perseratus berada pada dua tempat di belakang titik perpuluhan.',['decimal_place_value'],{numerator:hn,denominator:100});
    if(m==='hundred_grid')return pack('Petak seratus ini mempunyai '+hn+' petak berlorek. Apakah nombor perpuluhannya?',ch('a',dec),[ch('w1',(hn/10).toFixed(1),'decimal_place_value'),ch('w2',String(hn),'decimal_place_value'),ch('w3',decimal2((hn===99?hn-1:hn+1)/100),'decimal_place_value')],gridVisual(hn),'hundred_grid_to_decimal','Setiap petak ialah satu perseratus.',['decimal_place_value'],{numerator:hn,denominator:100});
    if(m==='place_value'){var last=String(hn).padStart(2,'0').slice(-1);return pack('Dalam '+dec+', digit '+last+' berada pada tempat apa?',ch('a','perseratus'),[ch('w1','persepuluh','decimal_place_value'),ch('w2','sa','decimal_place_value'),ch('w3','ratus','decimal_place_value')],{kind:'place_value_decimal',value:dec},'decimal_place_value_from_hundredths','Digit kedua selepas titik perpuluhan ialah perseratus.',['decimal_place_value'],{value:dec});}
  }
  if(c==='compare_decimals_to_hundredths'){
    var ca=ri(rng,1,98),cb=ri(rng,1,98);while(ca===cb)cb=ri(rng,1,98);var sa=(ca/100).toFixed(2),sb=(cb/100).toFixed(2),sign=ca>cb?'>':'<';
    if(m==='compare_pair')return pack(sa+' □ '+sb+'. Simbol manakah betul?',ch('a',sign),[ch('w1',sign==='>'?'<':'>','compare_decimal_digits'),ch('w2','=','compare_decimal_digits'),ch('w3','≈','compare_decimal_digits')],null,'compare_decimal_pair','Banding nilai persepuluh dahulu, kemudian perseratus.',['compare_decimal_digits'],{a:ca,b:cb});
    if(m==='number_line')return pack('Pada garis nombor, nilai manakah lebih besar?',ch('a',ca>cb?sa:sb),[ch('w1',ca>cb?sb:sa,'compare_decimal_digits'),ch('w2','Kedua-duanya sama','compare_decimal_digits'),ch('w3','Tidak boleh ditentukan','compare_decimal_digits')],lineVisual([Math.min(ca,cb)/100,Math.max(ca,cb)/100],[sa,sb]),'compare_decimals_number_line','Nombor yang lebih ke kanan pada garis nombor adalah lebih besar.',['compare_decimal_digits'],{a:ca,b:cb});
    if(m==='largest'){
      var cents=[];while(cents.length<4){var cv=ri(rng,1,99);if(cents.indexOf(cv)<0)cents.push(cv);}var maxCents=Math.max.apply(null,cents),max=(maxCents/100).toFixed(2),ws=cents.filter(function(v){return v!==maxCents;}).map(function(v){return (v/100).toFixed(2);});
      return pack('Empat botol berisi '+cents.map(function(v){return (v/100).toFixed(2)+' L';}).join(', ')+'. Isipadu manakah paling besar?',ch('a',max+' L'),ws.map(function(v,i){return ch('w'+i,v+' L','compare_decimal_digits');}),null,'select_largest_decimal','Banding semua nilai hingga perseratus.',['compare_decimal_digits'],{values:cents.join(',')});
    }
  }
  if(c==='add_subtract_decimals_to_hundredths'){
    var ia=ri(rng,5,55),ib=ri(rng,5,35);while(ia+ib>99){ib=ri(rng,5,35);}var aD=ia/100,bD=ib/100;
    if(m==='add_decimals'){
      var sm=ia+ib;return pack('Aina mempunyai '+(ia/100).toFixed(2)+' m reben merah dan '+(ib/100).toFixed(2)+' m reben biru. Berapakah jumlah panjang reben?',ch('a',(sm/100).toFixed(2)+' m'),[ch('w1',((sm+10)/100).toFixed(2)+' m','decimal_alignment'),ch('w2',String(sm)+' m','decimal_alignment'),ch('w3',(Math.abs(ia-ib)/100).toFixed(2)+' m','decimal_alignment')],decimalOperationVisual((ia/100).toFixed(2),(ib/100).toFixed(2),'+'),'add_decimals_hundredths','Selarikan titik perpuluhan dan tambah nilai perseratus.',['decimal_alignment'],{aHundredths:ia,bHundredths:ib,resultHundredths:sm,context:'ribbon'});
    }
    if(m==='subtract_decimals'){
      var hi=Math.max(ia,ib),lo=Math.min(ia,ib);if(hi===lo)hi=Math.min(99,hi+1);var df=hi-lo;return pack((hi/100).toFixed(2)+' − '+(lo/100).toFixed(2)+' = ?',ch('a',(df/100).toFixed(2)),[ch('w1',((df+10)/100).toFixed(2),'decimal_alignment'),ch('w2',((df+20)/100).toFixed(2),'decimal_alignment'),ch('w3',(Math.max(0,df-10)/100).toFixed(2),'decimal_alignment')],decimalOperationVisual((hi/100).toFixed(2),(lo/100).toFixed(2),'−'),'subtract_decimals_hundredths','Selarikan titik perpuluhan sebelum menolak.',['decimal_alignment'],{aHundredths:hi,bHundredths:lo,resultHundredths:df});
    }
    if(m==='missing_decimal'){
      var totalD=ia+ib;return pack((ia/100).toFixed(2)+' + □ = '+(totalD/100).toFixed(2)+'. Apakah nombor dalam kotak?',ch('a',(ib/100).toFixed(2)),[ch('w1',((ib+1)/100).toFixed(2),'decimal_alignment'),ch('w2',((ib+2)/100).toFixed(2),'part_whole_confusion'),ch('w3',((ib+3)/100).toFixed(2),'decimal_alignment')],barVisual([ia,ib],[(ia/100).toFixed(2),'?']),'missing_addend_decimal','Tolak bahagian diketahui daripada jumlah.',['decimal_alignment'],{aHundredths:ia,bHundredths:ib,totalHundredths:totalD});
    }
  }
  if(c==='represent_percent_on_hundred_grid'){
    var pc=ri(rng,1,99);
    if(m==='grid_to_percent')return numPack('Berapakah peratus petak yang berlorek?',pc,[Math.max(1,Math.floor(pc/10)),pc+5,pc-5,100-pc],gridVisual(pc),'hundred_grid_to_percent','Daripada 100 petak, bilangan berlorek sama dengan nilai peratus.',['percent_out_of_100'],function(v){return v+'%';},{shaded:pc},1,99);
    if(m==='percent_to_shaded')return numPack(pc+'% daripada petak seratus perlu dilorek. Berapa petak perlu dilorek?',pc,[Math.max(1,Math.floor(pc/10)),pc+5,pc-5,100-pc],gridVisual(0),'percent_to_shaded_count','Peratus bermaksud “daripada seratus”.',['percent_out_of_100'],String,{percent:pc,constructionSupport:true},1,99);
    if(m==='unshaded_percent'){var un=100-pc;return numPack(pc+' petak daripada 100 petak telah berlorek. Berapakah peratus yang BELUM berlorek?',un,[pc,un+5,un-5,un+10,un-10],gridVisual(pc),'infer_unshaded_percent','Jumlah keseluruhan ialah 100%. Tolak bahagian berlorek.',['complement_to_100'],function(v){return v+'%';},{shaded:pc,unshaded:un},1,99);}
  }
  if(c==='read_write_percent_1_to_100'){
    var pn=ri(rng,1,100),pw=pctWords(pn);
    if(m==='symbol_to_words')return pack('Bagaimanakah '+pn+'% dibaca?',ch('a',pw),[ch('w1',pn+' perpuluhan','percent_notation'),ch('w2',pn+' perseratusan','percent_notation'),ch('w3','seratus '+pn,'percent_notation')],null,'percent_symbol_to_words','Simbol % dibaca “peratus”.',['percent_notation'],{percent:pn});
    if(m==='words_to_symbol')return pack('Tulis “'+pw+'” dalam simbol.',ch('a',pn+'%'),[ch('w1',(pn/100).toFixed(2),'percent_notation'),ch('w2',pn+'/100','percent_notation'),ch('w3',pn+'‰','percent_notation')],null,'percent_words_to_symbol','Gunakan simbol % selepas nombor.',['percent_notation'],{percent:pn});
    if(m==='number_to_percent'){var altPercent=pn<=90?pn+10:pn-10;return pack(pn+' daripada 100 petak berlorek. Tulis sebagai peratus.',ch('a',pn+'%'),[ch('w1',(pn/100).toFixed(2),'percent_notation'),ch('w2',pn+'/100','percent_notation'),ch('w3',altPercent+'%','percent_out_of_100')],gridVisual(pn),'number_out_of_100_to_percent','Bilangan daripada 100 terus menjadi nilai peratus.',['percent_out_of_100'],{percent:pn});}
  }
  if(c==='relate_fractions_decimals_percent'){
    var hp=pick(rng,[10,20,25,30,40,50,60,70,75,80,90]),decHp=(hp/100).toFixed(2),tr=[hp+'/100',decHp,hp+'%'],alt=hp<=80?hp+10:hp-10,altDec=(alt/100).toFixed(2),altFrac=alt+'/100',altPct=alt+'%';
    if(m==='match_triple')return pack('Set manakah menunjukkan nilai yang sama?',ch('a',tr.join(' = ')),[ch('w1',altFrac+' = '+tr[1]+' = '+tr[2],'cross_representation'),ch('w2',tr[0]+' = '+altDec+' = '+tr[2],'cross_representation'),ch('w3',tr[0]+' = '+tr[1]+' = '+altPct,'cross_representation')],null,'match_fraction_decimal_percent','Gunakan pecahan perseratus sebagai jambatan kepada perpuluhan dan peratus.',['cross_representation'],{hundredths:hp,usesHundredths:true});
    if(m==='find_mismatch')return pack('Yang manakah TIDAK setara dengan '+tr[2]+'?',ch('a',altDec),[ch('w1',tr[0],'cross_representation'),ch('w2',tr[1],'cross_representation'),ch('w3',tr[2],'cross_representation')],null,'find_non_equivalent_representation','Semak pecahan perseratus, perpuluhan dan peratus mewakili bahagian yang sama.',['cross_representation'],{hundredths:hp,usesHundredths:true});
    if(m==='grid_bridge')return pack('Petak seratus menunjukkan '+hp+' petak berlorek. Pilih hubungan yang betul.',ch('a',tr.join(' = ')),[ch('w1',altFrac+' = '+tr[1]+' = '+tr[2],'cross_representation'),ch('w2',tr[0]+' = '+altDec+' = '+tr[2],'cross_representation'),ch('w3',tr[0]+' = '+tr[1]+' = '+altPct,'cross_representation')],gridVisual(hp),'hundred_grid_fraction_decimal_percent','Petak seratus menghubungkan pecahan perseratus, perpuluhan dan peratus.',['cross_representation'],{hundredths:hp,usesHundredths:true});
  }

  // D3.T5 — Masa dan Waktu
  if(c==='read_record_time_of_activities'){
    var hh=ri(rng,1,11),mm=pick(rng,[0,15,30,45]);
    if(m==='analog_read')return pack('Apakah waktu yang ditunjukkan oleh jam?',ch('a',clockLabel(hh,mm)),[ch('w1',clockLabel(hh,(mm+30)%60),'hour_minute_hand'),ch('w2',clockLabel((hh%12)+1,mm),'hour_minute_hand'),ch('w3',clockLabel(hh===1?12:hh-1,mm),'hour_minute_hand')],clockVisual(hh,mm),'read_analogue_clock','Jarum pendek menunjukkan jam dan jarum panjang menunjukkan minit.',['hour_minute_hand'],{hour:hh,minute:mm});
    if(m==='calendar_date'){
      var month=pick(rng,['Mac','April','Mei','Jun','Julai','Ogos']),days=month==='April'||month==='Jun'?30:31,highlight=ri(rng,5,days-3),startDay=ri(rng,0,6);return pack('Tarikh yang ditanda pada kalendar ialah?',ch('a',highlight+' '+month),[ch('w1',(highlight-1)+' '+month,'calendar_lookup'),ch('w2',(highlight+1)+' '+month,'calendar_lookup'),ch('w3',highlight+' '+pick(rng,['Januari','September','November']),'calendar_lookup')],calendarVisual(2026,month,startDay,days,highlight),'read_calendar_date','Cari petak yang ditanda dan baca nombor hari serta nama bulan.',['calendar_lookup'],{month:month,day:highlight});
    }
    if(m==='schedule_activity'){
      var rows=[['Sarapan','7:30'],['Mula kelas','8:00'],['Rehat','10:00'],['Balik','1:00']],target=pick(rng,rows);return pack('Berdasarkan jadual, pukul berapakah aktiviti “'+target[0]+'”?',ch('a',target[1]),rows.filter(function(r){return r!==target;}).map(function(r,i){return ch('w'+i,r[1],'schedule_lookup');}),tableVisual(['Aktiviti','Waktu'],rows),'read_activity_schedule','Cari baris aktiviti yang ditanya dan baca waktunya.',['schedule_lookup'],{activity:target[0]});
    }
  }
  if(c==='convert_hours_minutes_seconds'){
    if(m==='hours_minutes'){
      var h2=ri(rng,2,8),reverse=rng()<0.5,minutes=h2*60;return reverse?numPack(minutes+' minit = berapa jam?',h2,[minutes,h2+1,Math.max(1,h2-1)],unitVisual('time_units',minutes,480,'minit'),'convert_hours_to_minutes','Setiap 60 minit bersamaan 1 jam.',['time_unit_conversion'],function(v){return v+' jam';},{direction:'min_to_hour',hours:h2},0,20):numPack(h2+' jam = berapa minit?',minutes,[h2*10,h2*100,minutes+60],unitVisual('time_units',h2,8,'jam'),'convert_hours_to_minutes','1 jam = 60 minit.',['time_unit_conversion'],function(v){return v+' minit';},{direction:'hour_to_min',hours:h2},0,1000);
    }
    if(m==='minutes_seconds'){
      var min2=ri(rng,2,9),reverse2=rng()<0.5,sec=min2*60;return reverse2?numPack(sec+' saat = berapa minit?',min2,[sec,min2+1,Math.max(1,min2-1)],unitVisual('time_units',sec,540,'saat'),'convert_minutes_to_seconds','Setiap 60 saat bersamaan 1 minit.',['time_unit_conversion'],function(v){return v+' minit';},{direction:'sec_to_min',minutes:min2},0,20):numPack(min2+' minit = berapa saat?',sec,[min2*10,min2*100,sec+60],unitVisual('time_units',min2,9,'minit'),'convert_minutes_to_seconds','1 minit = 60 saat.',['time_unit_conversion'],function(v){return v+' saat';},{direction:'min_to_sec',minutes:min2},0,1000);
    }
    if(m==='mixed_time'){
      var mins=ri(rng,2,5)*60+pick(rng,[10,20,30,40,50]),hh2=Math.floor(mins/60),rm=mins%60;return pack(mins+' minit bersamaan?',ch('a',hh2+' jam '+rm+' minit'),[ch('w1',hh2+' jam '+(rm+10)+' minit','time_unit_conversion'),ch('w2',(hh2+1)+' jam '+rm+' minit','time_unit_conversion'),ch('w3',mins+' jam','time_unit_conversion')],timelineVisual(0,mins,[60,120,180,240],['0','1j','2j','3j','4j']),'convert_minutes_to_hours_minutes','Kumpulkan setiap 60 minit menjadi 1 jam.',['time_unit_conversion'],{direction:'min_to_hour_min',minutes:mins});
    }
  }
  if(c==='add_subtract_time_values'){
    if(m==='add_durations'){
      var s1=pick(rng,[600,900,1200,1800,2400]),s2=pick(rng,[300,600,900,1500]),s3=pick(rng,[30,60,120,300]),totS=s1+s2+s3;return pack(durationLabel(s1)+' + '+durationLabel(s2)+' + '+durationLabel(s3)+' = ?',ch('a',durationLabel(totS)),[ch('w1',durationLabel(totS-s3),'time_regrouping'),ch('w2',durationLabel(totS+300),'time_regrouping'),ch('w3',durationLabel(totS+600),'time_regrouping')],timelineVisual(0,totS,[s1,s1+s2],[durationLabel(s1),durationLabel(s1+s2)]),'add_time_values','Tambah tiga tempoh dan tukar setiap 60 saat/minit apabila perlu.',['time_regrouping'],{values:3,includesSeconds:s3<300,totalSeconds:totS});
    }
    if(m==='subtract_durations'){
      var baseS=pick(rng,[5400,7200,9000,10800]),take1=pick(rng,[600,900,1200,1800]),take2=pick(rng,[30,60,120,300]),remainS=baseS-take1-take2;return pack(durationLabel(baseS)+' − '+durationLabel(take1)+' − '+durationLabel(take2)+' = ?',ch('a',durationLabel(remainS)),[ch('w1',durationLabel(baseS-take1+take2),'operation_selection'),ch('w2',durationLabel(remainS+300),'time_regrouping'),ch('w3',durationLabel(Math.max(1,remainS-300)),'time_regrouping')],null,'subtract_time_values','Tolak dua tempoh secara berurutan dan selaraskan unit masa.',['time_regrouping'],{values:3,includesSeconds:take2<300,resultSeconds:remainS});
    }
    if(m==='difference_timeline'){
      var st=8*60+pick(rng,[0,15,30]),en=st+pick(rng,[45,60,75,90]),dur=en-st;return pack('Aktiviti bermula '+clockFromMinutes(st)+' dan tamat '+clockFromMinutes(en)+'. Berapa lama aktiviti itu?',ch('a',durationLabel(dur*60)),[ch('w1',durationLabel((dur+30)*60),'elapsed_time'),ch('w2',durationLabel(Math.max(15,dur-15)*60),'elapsed_time'),ch('w3',clockFromMinutes(en),'elapsed_time')],timelineVisual(st,en,[st,en],[clockFromMinutes(st),clockFromMinutes(en)]),'find_time_difference','Cari jarak masa dari waktu mula ke waktu tamat.',['elapsed_time'],{startMinutes:st,endMinutes:en,durationMinutes:dur});
    }
  }
  if(c==='solve_mixed_addition_subtraction_time'){
    if(m==='schedule_two_step'){
      var startM=9*60,act=pick(rng,[45,60,75]),br=pick(rng,[15,30]),extraSec=pick(rng,[30,60,120]),endSec=startM*60+act*60+br*60+extraSec;return pack('Program bermula 9:00. Aktiviti mengambil '+act+' minit, rehat '+br+' minit dan persediaan akhir '+durationLabel(extraSec)+'. Pukul berapakah selepas semuanya?',ch('a',clockFromMinutes(Math.floor(endSec/60))),[ch('w1',clockFromMinutes(startM+act),'operation_order'),ch('w2',clockFromMinutes(Math.floor(endSec/60)+30),'operation_order'),ch('w3','9:00','operation_order')],timelineVisual(startM,Math.floor(endSec/60),[startM+act,startM+act+br],['selepas aktiviti','selepas rehat']),'two_step_time_schedule','Tambah setiap tempoh kepada waktu mula mengikut urutan.',['operation_order'],{steps:3,includesSeconds:true});
    }
    if(m==='duration_adjustment'){
      var planned=pick(rng,[5400,7200,9000]),used=pick(rng,[1800,2700,3600]),extra=pick(rng,[300,600,900]),remain=planned-used+extra;return pack('Masa diperuntukkan '+durationLabel(planned)+'. '+durationLabel(used)+' telah digunakan, kemudian ditambah '+durationLabel(extra)+'. Berapa masa yang tinggal?',ch('a',durationLabel(remain)),[ch('w1',durationLabel(planned-used-extra),'operation_order'),ch('w2',durationLabel(planned+used+extra),'operation_order'),ch('w3',durationLabel(planned-used),'operation_order')],timelineVisual(0,planned+extra,[used,planned],[durationLabel(used),durationLabel(planned)]),'mixed_time_adjustment','Tolak masa digunakan, kemudian tambah masa tambahan.',['operation_order'],{plannedSeconds:planned,usedSeconds:used,extraSeconds:extra});
    }
    if(m==='choose_time_expression')return pack('Sebuah latihan diberi 120 minit. 35 minit digunakan, kemudian guru menambah 20 minit. Ungkapan manakah mencari masa yang tinggal?',ch('a','120 − 35 + 20'),[ch('w1','120 + 35 + 20','operation_order'),ch('w2','120 − 35 − 20','operation_order'),ch('w3','120 + 35 − 20','operation_order')],timelineVisual(0,140,[35,120],['35','120']),'choose_expression_for_time_problem','Padankan “digunakan” dengan tolak dan “ditambah” dengan tambah.',['operation_order'],{base:120,used:35,extra:20});
  }
  if(c==='multiply_divide_time'){
    var unit=pick(rng,['seconds','minutes','hours']);
    if(m==='repeat_duration'){
      var rep=ri(rng,2,5),eachSec=unit==='seconds'?pick(rng,[15,20,30,45]):unit==='minutes'?pick(rng,[600,900,1200,1800]):pick(rng,[3600,7200]),totalT=rep*eachSec;
      return pack(rep+' sesi mengambil '+durationLabel(eachSec)+' setiap satu. Jumlah masa?',ch('a',durationLabel(totalT)),[ch('w1',durationLabel(eachSec+rep),'time_multiplication'),ch('w2',durationLabel(totalT+eachSec),'time_multiplication'),ch('w3',durationLabel(Math.max(1,totalT-eachSec)),'time_multiplication')],groupingVisual(rep,durationLabel(eachSec),'masa'),'multiply_time_duration','Darab bilangan sesi dengan masa setiap sesi.',['time_multiplication'],{groups:rep,eachSeconds:eachSec,totalSeconds:totalT,unitDomain:unit});
    }
    if(m==='share_duration'){
      var gr=ri(rng,2,6),eaSec=unit==='seconds'?pick(rng,[15,20,30,45]):unit==='minutes'?pick(rng,[600,900,1200]):pick(rng,[3600,7200]),tt=gr*eaSec;
      var shareWrong=durationChoices(eaSec,[gr,eaSec+(unit==='hours'?3600:unit==='minutes'?300:5),tt,Math.max(1,eaSec-(unit==='hours'?1800:unit==='minutes'?300:5))],'time_division');
      return pack(durationLabel(tt)+' dibahagi sama rata kepada '+gr+' aktiviti. Setiap aktiviti berapa lama?',ch('a',durationLabel(eaSec)),shareWrong,groupingVisual(gr,durationLabel(eaSec),'masa'),'divide_time_duration','Bahagi jumlah masa dengan bilangan aktiviti.',['time_division'],{groups:gr,eachSeconds:eaSec,totalSeconds:tt,unitDomain:unit});
    }
    if(m==='divide_then_multiply'){
      var allGroups=pick(rng,[4,5,6]),targetGroups=pick(rng,[2,3]),one=pick(rng,[600,900,1200,1800]),totalAll=allGroups*one,answerChain=targetGroups*one;
      return pack('Jumlah masa untuk '+allGroups+' corak yang sama ialah '+durationLabel(totalAll)+'. Berapakah masa untuk '+targetGroups+' corak?',ch('a',durationLabel(answerChain)),[ch('w1',durationLabel(one),'operation_order'),ch('w2',durationLabel(totalAll*targetGroups),'operation_order'),ch('w3',durationLabel(answerChain+one),'operation_order')],groupingVisual(allGroups,durationLabel(one),'corak'),'divide_then_multiply_time','Cari masa satu corak dengan bahagi dahulu, kemudian darab dengan bilangan corak yang ditanya.',['multiply_divide_inverse'],{linkedTask:true,totalGroups:allGroups,targetGroups:targetGroups,oneSeconds:one,totalSeconds:totalAll,resultSeconds:answerChain});
    }
  }

  // D3.T6 — Ukuran dan Sukatan
  if(c==='convert_metres_centimetres'){
    var wm=ri(rng,1,8),rc=pick(rng,[10,20,30,40,50,60,70,80,90]),cm=wm*100+rc;
    if(m==='m_to_cm')return numPack(wm+' m = berapa cm?',wm*100,[wm*10,wm,wm*100+100],unitVisual('ruler',wm,8,'m'),'metres_to_centimetres','1 m = 100 cm.',['length_unit_conversion'],function(x){return x+' cm';},{metres:wm},0,2000);
    if(m==='cm_to_m_cm')return pack(cm+' cm bersamaan?',ch('a',wm+' m '+rc+' cm'),[ch('w1',(wm+1)+' m '+rc+' cm','length_unit_conversion'),ch('w2',wm+' m '+Math.min(99,rc+10)+' cm','length_unit_conversion'),ch('w3',cm+' m','length_unit_conversion')],unitVisual('ruler',cm,900,'cm'),'centimetres_to_mixed_metres','Kumpulkan setiap 100 cm menjadi 1 m.',['length_unit_conversion'],{centimetres:cm});
    if(m==='equivalent_length')return pack('Yang manakah sama dengan '+wm+' m '+rc+' cm?',ch('a',cm+' cm'),[ch('w1',(wm*10+rc)+' cm','length_unit_conversion'),ch('w2',(cm+100)+' cm','length_unit_conversion'),ch('w3',(cm-10)+' cm','length_unit_conversion')],unitVisual('ruler',cm,900,'cm'),'choose_equivalent_length','Tukar meter kepada sentimeter dahulu.',['length_unit_conversion'],{centimetres:cm});
  }
  if(c==='add_subtract_lengths'){
    var l1=ri(rng,120,350),l2=ri(rng,40,180),l3=ri(rng,20,140),lt=l1+l2+l3;
    if(m==='add_lengths')return pack(mixedUnit(l1,100,'m','cm')+' + '+mixedUnit(l2,100,'m','cm')+' + '+mixedUnit(l3,100,'m','cm')+' = ?',ch('a',mixedUnit(lt,100,'m','cm')),[ch('w1',mixedUnit(l1+l2,100,'m','cm'),'unit_alignment'),ch('w2',mixedUnit(lt+100,100,'m','cm'),'unit_alignment'),ch('w3',mixedUnit(Math.max(1,lt-10),100,'m','cm'),'unit_alignment')],unitVisual('ruler',lt,700,'cm',{mixedLabel:mixedUnit(lt,100,'m','cm')}),'add_length_values','Tukar kepada unit yang sama, tambah tiga panjang, kemudian tukar semula jika perlu.',['unit_alignment'],{values:3,mixedUnits:true,totalCm:lt});
    if(m==='subtract_lengths'){var baseL=ri(rng,350,850),sub1=ri(rng,40,150),sub2=ri(rng,20,120),resL=baseL-sub1-sub2;return numPack(mixedUnit(baseL,100,'m','cm')+' − '+mixedUnit(sub1,100,'m','cm')+' − '+mixedUnit(sub2,100,'m','cm')+' = ?',resL,[baseL-sub1+sub2,resL+100,Math.max(1,resL-10),resL+50],null,'subtract_length_values','Selaraskan unit dan tolak dua ukuran secara berurutan.',['unit_alignment'],function(x){return mixedUnit(x,100,'m','cm');},{values:3,mixedUnits:true,resultCm:resL},1,2000);}
    if(m==='missing_length')return numPack('Jumlah panjang '+mixedUnit(lt,100,'m','cm')+'. Dua bahagian ialah '+mixedUnit(l1,100,'m','cm')+' dan '+mixedUnit(l2,100,'m','cm')+'. Panjang bahagian satu lagi?',l3,[l3+10,Math.max(1,l3-10),l3+100],barVisual([l1,l2,l3],[mixedUnit(l1,100,'m','cm'),mixedUnit(l2,100,'m','cm'),'?']),'find_missing_length','Tolak dua bahagian diketahui daripada jumlah.',['part_whole_confusion'],function(x){return mixedUnit(x,100,'m','cm');},{values:3,mixedUnits:true,totalCm:lt},1,2000);
  }
  if(c==='multiply_divide_lengths'){
    var lg=ri(rng,2,9),le=pick(rng,[75,120,150,225,250]),lTotal=lg*le;
    if(m==='repeat_length')return pack(lg+' tali, setiap satu '+mixedUnit(le,100,'m','cm')+'. Jumlah panjang?',ch('a',mixedUnit(lTotal,100,'m','cm')),[ch('w1',mixedUnit(le+lg,100,'m','cm'),'multiply_divide_inverse'),ch('w2',mixedUnit(lTotal+le,100,'m','cm'),'multiply_divide_inverse'),ch('w3',mixedUnit(Math.max(1,lTotal-le),100,'m','cm'),'multiply_divide_inverse')],barVisual(new Array(Math.min(lg,6)).fill(le),[]),'multiply_length','Darab bilangan tali dengan panjang setiap tali.',['multiply_divide_inverse'],{factor:lg,mixedUnits:true,totalCm:lTotal});
    if(m==='share_length')return pack(mixedUnit(lTotal,100,'m','cm')+' dipotong sama rata kepada '+lg+' bahagian. Setiap bahagian?',ch('a',mixedUnit(le,100,'m','cm')),[ch('w1',mixedUnit(lg,100,'m','cm'),'multiply_divide_inverse'),ch('w2',mixedUnit(le+10,100,'m','cm'),'multiply_divide_inverse'),ch('w3',mixedUnit(lTotal,100,'m','cm'),'multiply_divide_inverse')],barVisual(new Array(Math.min(lg,6)).fill(le),[]),'divide_length','Bahagi jumlah panjang dengan bilangan bahagian.',['multiply_divide_inverse'],{factor:lg,mixedUnits:true,totalCm:lTotal});
    if(m==='inverse_length')return numPack('□ × '+mixedUnit(le,100,'m','cm')+' = '+mixedUnit(lTotal,100,'m','cm')+'. Berapakah □?',lg,[le,lTotal,lg+1],unitVisual('ruler',lTotal,2500,'cm',{mixedLabel:mixedUnit(lTotal,100,'m','cm')}),'inverse_length_factor','Gunakan bahagi untuk mencari bilangan kumpulan.',['multiply_divide_inverse'],null,{factor:lg,mixedUnits:true,totalCm:lTotal},1,20);
  }
  if(c==='convert_kilograms_grams'){
    var kg=ri(rng,1,6),rg=pick(rng,[100,200,300,400,500,600,700,800,900]),grams=kg*1000+rg;
    if(m==='kg_to_g')return numPack(kg+' kg = berapa g?',kg*1000,[kg*100,kg*10,kg*1000+1000],unitVisual('scale',kg,6,'kg'),'kilograms_to_grams','1 kg = 1000 g.',['mass_unit_conversion'],function(x){return x+' g';},{kg:kg},0,10000);
    if(m==='g_to_kg_g')return pack(grams+' g bersamaan?',ch('a',kg+' kg '+rg+' g'),[ch('w1',(kg+1)+' kg '+rg+' g','mass_unit_conversion'),ch('w2',kg+' kg '+Math.min(999,rg+100)+' g','mass_unit_conversion'),ch('w3',grams+' kg','mass_unit_conversion')],unitVisual('scale',grams,7000,'g'),'grams_to_mixed_kilograms','Kumpulkan setiap 1000 g menjadi 1 kg.',['mass_unit_conversion'],{grams:grams});
    if(m==='equivalent_mass')return pack('Yang manakah sama dengan '+kg+' kg '+rg+' g?',ch('a',grams+' g'),[ch('w1',(kg*100+rg)+' g','mass_unit_conversion'),ch('w2',(grams+1000)+' g','mass_unit_conversion'),ch('w3',(grams-100)+' g','mass_unit_conversion')],unitVisual('scale',grams,7000,'g'),'choose_equivalent_mass','Tukar kilogram kepada gram dahulu.',['mass_unit_conversion'],{grams:grams});
  }
  if(c==='add_subtract_masses'){
    var ma=ri(rng,1200,3500),mb=ri(rng,300,1100),mc=ri(rng,200,900),mt3=ma+mb+mc;
    if(m==='add_masses')return pack(mixedUnit(ma,1000,'kg','g')+' + '+mixedUnit(mb,1000,'kg','g')+' + '+mixedUnit(mc,1000,'kg','g')+' = ?',ch('a',mixedUnit(mt3,1000,'kg','g')),[ch('w1',mixedUnit(ma+mb,1000,'kg','g'),'unit_alignment'),ch('w2',mixedUnit(mt3+1000,1000,'kg','g'),'unit_alignment'),ch('w3',mixedUnit(Math.max(1,mt3-100),1000,'kg','g'),'unit_alignment')],unitVisual('scale',mt3,7000,'g',{mixedLabel:mixedUnit(mt3,1000,'kg','g')}),'add_mass_values','Tukar kepada unit sama dan tambah tiga jisim.',['unit_alignment'],{values:3,mixedUnits:true,totalG:mt3});
    if(m==='subtract_masses'){var baseM=ri(rng,3500,8000),ms1=ri(rng,300,1200),ms2=ri(rng,200,900),mr=baseM-ms1-ms2;return numPack(mixedUnit(baseM,1000,'kg','g')+' − '+mixedUnit(ms1,1000,'kg','g')+' − '+mixedUnit(ms2,1000,'kg','g')+' = ?',mr,[baseM-ms1+ms2,mr+1000,Math.max(1,mr-100),mr+500],null,'subtract_mass_values','Selaraskan unit dan tolak dua jisim.',['unit_alignment'],function(x){return mixedUnit(x,1000,'kg','g');},{values:3,mixedUnits:true,resultG:mr},1,20000);}
    if(m==='missing_mass')return numPack('Jumlah jisim '+mixedUnit(mt3,1000,'kg','g')+'. Dua objek berjisim '+mixedUnit(ma,1000,'kg','g')+' dan '+mixedUnit(mb,1000,'kg','g')+'. Jisim objek ketiga?',mc,[mc+100,Math.max(1,mc-100),mc+500],barVisual([ma,mb,mc],[mixedUnit(ma,1000,'kg','g'),mixedUnit(mb,1000,'kg','g'),'?']),'find_missing_mass','Tolak dua jisim diketahui daripada jumlah.',['part_whole_confusion'],function(x){return mixedUnit(x,1000,'kg','g');},{values:3,mixedUnits:true,totalG:mt3},1,10000);
  }
  if(c==='multiply_divide_masses'){
    var mg=ri(rng,2,9),me=pick(rng,[250,500,750,1250,1500]),mtt=mg*me;
    if(m==='repeat_mass')return pack(mg+' pek, setiap satu '+mixedUnit(me,1000,'kg','g')+'. Jumlah jisim?',ch('a',mixedUnit(mtt,1000,'kg','g')),[ch('w1',mixedUnit(me+mg,1000,'kg','g'),'multiply_divide_inverse'),ch('w2',mixedUnit(mtt+me,1000,'kg','g'),'multiply_divide_inverse'),ch('w3',mixedUnit(Math.max(1,mtt-me),1000,'kg','g'),'multiply_divide_inverse')],groupingVisual(Math.min(mg,8),mixedUnit(me,1000,'kg','g')),'multiply_mass','Darab bilangan pek dengan jisim setiap pek.',['multiply_divide_inverse'],{factor:mg,mixedUnits:true,totalG:mtt});
    if(m==='share_mass')return pack(mixedUnit(mtt,1000,'kg','g')+' dibahagi sama rata kepada '+mg+' bekas. Setiap bekas?',ch('a',mixedUnit(me,1000,'kg','g')),[ch('w1',mixedUnit(mg,1000,'kg','g'),'multiply_divide_inverse'),ch('w2',mixedUnit(me+100,1000,'kg','g'),'multiply_divide_inverse'),ch('w3',mixedUnit(mtt,1000,'kg','g'),'multiply_divide_inverse')],groupingVisual(Math.min(mg,8),mixedUnit(me,1000,'kg','g')),'divide_mass','Bahagi jumlah jisim dengan bilangan bekas.',['multiply_divide_inverse'],{factor:mg,mixedUnits:true,totalG:mtt});
    if(m==='inverse_mass')return numPack('□ × '+mixedUnit(me,1000,'kg','g')+' = '+mixedUnit(mtt,1000,'kg','g')+'. Berapakah □?',mg,[me,mtt,mg+1],unitVisual('scale',mtt,15000,'g',{mixedLabel:mixedUnit(mtt,1000,'kg','g')}),'inverse_mass_factor','Gunakan bahagi untuk mencari bilangan kumpulan.',['multiply_divide_inverse'],null,{factor:mg,mixedUnits:true,totalG:mtt},1,20);
  }
  if(c==='convert_litres_millilitres'){
    var li=ri(rng,1,6),rml=pick(rng,[100,200,300,400,500,600,700,800,900]),ml=li*1000+rml;
    if(m==='l_to_ml')return numPack(li+' L = berapa mL?',li*1000,[li*100,li*10,li*1000+1000],unitVisual('container',li,6,'L'),'litres_to_millilitres','1 L = 1000 mL.',['volume_unit_conversion'],function(x){return x+' mL';},{litres:li},0,10000);
    if(m==='ml_to_l_ml')return pack(ml+' mL bersamaan?',ch('a',li+' L '+rml+' mL'),[ch('w1',(li+1)+' L '+rml+' mL','volume_unit_conversion'),ch('w2',li+' L '+Math.min(999,rml+100)+' mL','volume_unit_conversion'),ch('w3',ml+' L','volume_unit_conversion')],unitVisual('container',ml,7000,'mL'),'millilitres_to_mixed_litres','Kumpulkan setiap 1000 mL menjadi 1 L.',['volume_unit_conversion'],{millilitres:ml});
    if(m==='equivalent_volume')return pack('Yang manakah sama dengan '+li+' L '+rml+' mL?',ch('a',ml+' mL'),[ch('w1',(li*100+rml)+' mL','volume_unit_conversion'),ch('w2',(ml+1000)+' mL','volume_unit_conversion'),ch('w3',(ml-100)+' mL','volume_unit_conversion')],unitVisual('container',ml,7000,'mL'),'choose_equivalent_volume','Tukar liter kepada mililiter dahulu.',['volume_unit_conversion'],{millilitres:ml});
  }
  if(c==='add_subtract_liquid_volumes'){
    var va=ri(rng,1200,3500),vb=ri(rng,300,1100),vc=ri(rng,200,900),vt3=va+vb+vc;
    if(m==='add_volumes')return pack(mixedUnit(va,1000,'L','mL')+' + '+mixedUnit(vb,1000,'L','mL')+' + '+mixedUnit(vc,1000,'L','mL')+' = ?',ch('a',mixedUnit(vt3,1000,'L','mL')),[ch('w1',mixedUnit(va+vb,1000,'L','mL'),'unit_alignment'),ch('w2',mixedUnit(vt3+1000,1000,'L','mL'),'unit_alignment'),ch('w3',mixedUnit(Math.max(1,vt3-100),1000,'L','mL'),'unit_alignment')],unitVisual('container',vt3,7000,'mL',{mixedLabel:mixedUnit(vt3,1000,'L','mL')}),'add_liquid_volumes','Tukar kepada unit sama dan tambah tiga isipadu.',['unit_alignment'],{values:3,mixedUnits:true,totalMl:vt3});
    if(m==='subtract_volumes'){var baseV=ri(rng,3500,8000),vs1=ri(rng,300,1200),vs2=ri(rng,200,900),vr=baseV-vs1-vs2;return numPack(mixedUnit(baseV,1000,'L','mL')+' − '+mixedUnit(vs1,1000,'L','mL')+' − '+mixedUnit(vs2,1000,'L','mL')+' = ?',vr,[baseV-vs1+vs2,vr+1000,Math.max(1,vr-100),vr+500],null,'subtract_liquid_volumes','Selaraskan unit dan tolak dua isipadu.',['unit_alignment'],function(x){return mixedUnit(x,1000,'L','mL');},{values:3,mixedUnits:true,resultMl:vr},1,20000);}
    if(m==='missing_volume')return numPack('Jumlah air '+mixedUnit(vt3,1000,'L','mL')+'. Dua bekas mempunyai '+mixedUnit(va,1000,'L','mL')+' dan '+mixedUnit(vb,1000,'L','mL')+'. Isi padu bekas ketiga?',vc,[vc+100,Math.max(1,vc-100),vc+500],barVisual([va,vb,vc],[mixedUnit(va,1000,'L','mL'),mixedUnit(vb,1000,'L','mL'),'?']),'find_missing_liquid_volume','Tolak dua isipadu diketahui daripada jumlah.',['part_whole_confusion'],function(x){return mixedUnit(x,1000,'L','mL');},{values:3,mixedUnits:true,totalMl:vt3},1,10000);
  }
  if(c==='multiply_divide_liquid_volumes'){
    var vg=ri(rng,2,9),ve=pick(rng,[250,500,750,1250,1500]),vtt=vg*ve;
    if(m==='repeat_volume')return pack(vg+' botol, setiap satu '+mixedUnit(ve,1000,'L','mL')+'. Jumlah isipadu?',ch('a',mixedUnit(vtt,1000,'L','mL')),[ch('w1',mixedUnit(ve+vg,1000,'L','mL'),'multiply_divide_inverse'),ch('w2',mixedUnit(vtt+ve,1000,'L','mL'),'multiply_divide_inverse'),ch('w3',mixedUnit(Math.max(1,vtt-ve),1000,'L','mL'),'multiply_divide_inverse')],unitVisual('container',ve,2000,'mL',{mixedLabel:mixedUnit(ve,1000,'L','mL')}),'multiply_liquid_volume','Darab bilangan botol dengan isipadu setiap botol.',['multiply_divide_inverse'],{factor:vg,mixedUnits:true,totalMl:vtt});
    if(m==='share_volume')return pack(mixedUnit(vtt,1000,'L','mL')+' dibahagi sama rata kepada '+vg+' cawan. Setiap cawan?',ch('a',mixedUnit(ve,1000,'L','mL')),[ch('w1',mixedUnit(vg,1000,'L','mL'),'multiply_divide_inverse'),ch('w2',mixedUnit(ve+100,1000,'L','mL'),'multiply_divide_inverse'),ch('w3',mixedUnit(vtt,1000,'L','mL'),'multiply_divide_inverse')],groupingVisual(Math.min(vg,8),mixedUnit(ve,1000,'L','mL')),'divide_liquid_volume','Bahagi jumlah isipadu dengan bilangan cawan.',['multiply_divide_inverse'],{factor:vg,mixedUnits:true,totalMl:vtt});
    if(m==='inverse_volume')return numPack('□ × '+mixedUnit(ve,1000,'L','mL')+' = '+mixedUnit(vtt,1000,'L','mL')+'. Berapakah □?',vg,[ve,vtt,vg+1],groupingVisual(Math.min(vg,8),mixedUnit(ve,1000,'L','mL')),'inverse_liquid_volume_factor','Gunakan bahagi untuk mencari bilangan kumpulan.',['multiply_divide_inverse'],null,{factor:vg,mixedUnits:true,totalMl:vtt},1,20);
  }

  // D3.T9 — Pengurusan Data
  if(c==='collect_classify_organize_data'){
    var cats=['Merah','Biru','Hijau'],raw=[];for(var rr=0;rr<ri(rng,12,18);rr++)raw.push(pick(rng,cats));var cm=countMap(raw),targetCat=pick(rng,raw),targetCount=cm[targetCat]||0;
    if(m==='tally_count'){
      var correctT=tally(targetCount),dCounts=[Math.max(0,targetCount-1),targetCount+1,targetCount+2],wrongT=dCounts.map(function(v,i){return ch('w'+i,tally(v)||'tiada','tally_misread');});
      return pack('Data mentah ditunjukkan. Tanda gundal manakah betul untuk kategori '+targetCat+'?',ch('a',correctT||'tiada'),wrongT,rawDataVisual(raw),'count_from_tally','Kelaskan data '+targetCat+' dahulu, kemudian bina gundal dalam kumpulan lima.',['tally_misread'],{rawData:true,target:targetCat,count:targetCount,tally:correctT});
    }
    if(m==='classify_list'){
      var summary=cats.map(function(k){return k+'='+String(cm[k]||0);}).join(', '),wrong1=cats.map(function(k){return k+'='+String((cm[k]||0)+(k===targetCat?1:0));}).join(', '),wrong2=cats.slice().reverse().map(function(k){return k+'='+String(cm[k]||0);}).join(', '),wrong3=cats.map(function(k){return k+'='+String(Math.max(0,(cm[k]||0)-1));}).join(', ');
      if(wrong2===summary)wrong2='Merah='+(cm.Merah||0)+', Biru='+(cm.Hijau||0)+', Hijau='+(cm.Biru||0);
      return pack('Pilih pengelasan dan bilangan yang betul bagi data mentah ini.',ch('a',summary),[ch('w1',wrong1,'classification_rule'),ch('w2',wrong2,'classification_rule'),ch('w3',wrong3,'classification_rule')],rawDataVisual(raw),'classify_and_count_items','Kumpulkan item mengikut kategori, kemudian kira setiap kumpulan.',['classification_rule'],{rawData:true,categories:3,total:raw.length});
    }
    if(m==='table_statement'){
      var rows=cats.map(function(k){return[k,cm[k]||0];}),maxCat=cats.slice().sort(function(a,b){return(cm[b]||0)-(cm[a]||0);})[0],ansS='Kategori '+maxCat+' mempunyai bilangan paling banyak.';
      var others=cats.filter(function(k){return k!==maxCat;});return pack('Selepas data mentah disusun dalam jadual, pernyataan manakah betul?',ch('a',ansS),[ch('w1','Kategori '+others[0]+' paling banyak.','table_comparison'),ch('w2','Semua kategori mempunyai bilangan yang sama.','table_comparison'),ch('w3','Jumlah data ialah '+(raw.length+2)+'.','table_comparison')],{kind:'multi_chart',pictograph:rawDataVisual(raw),bar:tableVisual(['Kategori','Bilangan'],rows)},'interpret_organized_table','Bandingkan data mentah dengan jadual yang telah disusun.',['table_comparison'],{rawData:true,organized:true,total:raw.length});
    }
  }
  if(c==='read_interpret_pie_chart'){
    var labels=['A','B','C','D'],vals=shuffle(rng,[8,6,4,2]);
    if(m==='largest_sector'){var mi=vals.indexOf(Math.max.apply(null,vals)),lab=labels[mi];return pack('Kategori manakah mempunyai bahagian paling besar?',ch('a',lab),labels.filter(function(x){return x!==lab;}).map(function(x,i){return ch('w'+i,x,'pie_sector_size');}),pieVisual(labels,vals,false),'identify_largest_pie_category','Sektor paling besar mewakili bilangan paling banyak.',['pie_sector_size'],{values:vals.join(','),readOnly:true});}
    if(m==='category_count'){
      var idx=ri(rng,0,3),cat=labels[idx],ansC=vals[idx],wr=labels.filter(function(_,i){return i!==idx;}).map(function(l,i){return ch('w'+i,String(vals[labels.indexOf(l)]),'pie_sector_size');});return pack('Carta pai dan petunjuk menunjukkan bilangan bagi setiap kategori. Berapakah bilangan kategori '+cat+'?',ch('a',String(ansC)),wr,pieVisual(labels,vals,true),'derive_count_from_pie','Cari sektor '+cat+' dan baca nilai pada petunjuk.',['pie_sector_size'],{category:cat,count:ansC,readFromChart:true});
    }
    if(m==='difference_categories'){
      var first=0,second=1,diff=Math.abs(vals[first]-vals[second]);return numPack('Berdasarkan carta pai, berapakah beza bilangan antara kategori A dan B?',diff,[vals[first]+vals[second],Math.max(0,diff-1),diff+1],pieVisual(labels,vals,true),'compare_pie_categories','Baca nilai A dan B daripada carta, kemudian cari beza.',['pie_sector_size'],null,{A:vals[0],B:vals[1],difference:diff,readFromChart:true},0,30);
    }
  }
  if(c==='relate_pictograph_bar_chart_pie_chart'){
    var labs2=['A','B','C'],v2=shuffle(rng,[4,3,1]),maxIdx=v2.indexOf(Math.max.apply(null,v2)),maxLab=labs2[maxIdx];
    if(m==='pictograph_to_bar')return pack('Piktograf menunjukkan data berikut. Bar manakah sepatutnya paling tinggi?',ch('a',maxLab),labs2.filter(function(x){return x!==maxLab;}).map(function(x,i){return ch('w'+i,x,'representation_mapping');}).concat([ch('weq','Semua sama','representation_mapping')]).slice(0,3),pictographVisual(labs2,v2,1),'relate_pictograph_to_bar','Ketinggian bar perlu mengikut bilangan simbol.',['representation_mapping'],{values:v2.join(','),sameData:true});
    if(m==='bar_to_pie'){
      var totalB=v2.reduce(function(a,b){return a+b;},0),aCount=v2[0],simp=simplify(aCount,totalB),fraction=frac(simp[0],simp[1]),poolF=['1/2','1/4','1/3','2/3','3/4','1/8'].filter(function(x){return x!==fraction;}),wrongF=poolF.slice(0,3).map(function(x,i){return ch('w'+i,x,'representation_mapping');});return pack('Carta palang menunjukkan data A, B dan C. Apakah bahagian keseluruhan bagi A dalam carta pai?',ch('a',fraction),wrongF,barChartVisual(labs2,v2),'relate_bar_to_pie','Jumlahkan semua data, kemudian bandingkan bilangan A dengan jumlah.',['representation_mapping'],{values:v2.join(','),sameData:true,total:totalB});
    }
    if(m==='same_data_statement')return pack('Piktograf dan carta palang mewakili data yang sama. Pernyataan manakah mesti kekal benar?',ch('a','Bilangan bagi setiap kategori kekal sama.'),[ch('w1','Semua bar mesti sama tinggi.','representation_mapping'),ch('w2','Bilangan kategori mesti berubah.','representation_mapping'),ch('w3','Jumlah data mesti menjadi dua kali ganda.','representation_mapping')],{kind:'multi_chart',pictograph:pictographVisual(labs2,v2,1),bar:barChartVisual(labs2,v2)},'compare_chart_representations','Bentuk carta berubah, tetapi data asal tidak berubah.',['representation_mapping'],{values:v2.join(','),sameData:true});
  }

  throw new Error('d3.p0Kssr unsupported '+c+' / '+m);
});
})();
