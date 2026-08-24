// questions/v2/generators/d3/full-kssr.js
// Phase 3A-2: Darjah 3 semantic hardening for T1/T4/T8.
// Pure authored source. No Node/browser globals.
(function(){
'use strict';

function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(rng,a){return a[Math.floor(rng()*a.length)];}
function shuffle(rng,a){var o=a.slice();for(var i=o.length-1;i>0;i--){var j=Math.floor(rng()*(i+1)),t=o[i];o[i]=o[j];o[j]=t;}return o;}
function choice(id,label,tag){return{id:String(id),labelMs:String(label),misconceptionTag:tag||null};}
function fp(mode,answer,parts){return mode+'::'+String(answer)+'::'+(parts||[]).join('|');}
function uniqNums(base,cands,min,max){
  var seen=Object.create(null),out=[];
  function add(n){n=Math.round(n);if(n<min||n>max||n===base||seen[n])return;seen[n]=1;out.push(n);}
  for(var i=0;i<cands.length;i++)add(cands[i]);
  for(var d=1;out.length<3&&d<2000000;d++){add(base+d);add(base-d);}
  return out.slice(0,3);
}
function numChoices(base,cands,tag,fmt,min,max){
  var wrong=uniqNums(base,cands,min==null?-99999999:min,max==null?99999999:max);
  return wrong.map(function(n){return choice(n,fmt?fmt(n):String(n),tag);});
}
function money(cents){return 'RM'+(Math.round(cents)/100).toFixed(2);}
function moneyWrong(base,cands,tag){return numChoices(base,cands,tag,money,0,1000000);}
function malayUnder100(n){
  var one=['','satu','dua','tiga','empat','lima','enam','tujuh','lapan','sembilan'];
  if(n<10)return one[n];if(n===10)return 'sepuluh';if(n===11)return 'sebelas';if(n<20)return one[n-10]+' belas';
  var t=Math.floor(n/10),r=n%10;return one[t]+' puluh'+(r?' '+one[r]:'');
}
function numberToMalay(n){
  n=Math.floor(n);if(n<100)return malayUnder100(n);
  if(n<1000){var h=Math.floor(n/100),r=n%100;return (h===1?'seratus':['','satu','dua','tiga','empat','lima','enam','tujuh','lapan','sembilan'][h]+' ratus')+(r?' '+malayUnder100(r):'');}
  var th=Math.floor(n/1000),rem=n%1000,head=th===1?'seribu':numberToMalay(th)+' ribu';return head+(rem?' '+numberToMalay(rem):'');
}
function pvVisual(n,highlight){var s=String(n).padStart(4,'0');return{kind:'place_value_table',digits:[Number(s[0]),Number(s[1]),Number(s[2]),Number(s[3])],highlight:highlight==null?-1:highlight};}
function seqVisual(seq,missing){return{kind:'number_sequence',sequence:seq,missingIndex:missing==null?-1:missing};}
function nearest1000(n){return Math.round(n/1000)*1000;}
function ensureRoundN(rng){var n=ri(rng,1000,9999);if(n%1000===500)n+=17;if(n>9999)n-=37;return n;}
function objs(){return ['Buku','Bola','Pokok','Rumah'];}
function gridObjects(rng){
  var names=shuffle(rng,objs()),used=Object.create(null),out=[];
  for(var i=0;i<4;i++){var x,y,key;do{x=ri(rng,1,5);y=ri(rng,1,5);key=x+','+y;}while(used[key]);used[key]=1;out.push({name:names[i],x:x,y:y});}
  return out;
}
function coordLabel(x,y){return String.fromCharCode(64+Number(x))+String(y);}
function dirText(dx,dy,compass){
  var d=Math.abs(dx||dy),w;
  if(dx>0)w=compass?'timur':'kanan';else if(dx<0)w=compass?'barat':'kiri';else if(dy>0)w=compass?'utara':'atas';else w=compass?'selatan':'bawah';
  return d+' petak ke '+w;
}
function uniqueCoordObjects(objects){var s=Object.create(null);for(var i=0;i<objects.length;i++){var k=objects[i].x+','+objects[i].y;if(s[k])return false;s[k]=1;}return true;}
function replaceOtherCollisions(rng,objects,fixedCount){
  var used=Object.create(null),i;for(i=0;i<fixedCount;i++)used[objects[i].x+','+objects[i].y]=1;
  for(i=fixedCount;i<objects.length;i++){var x,y,k;do{x=ri(rng,1,5);y=ri(rng,1,5);k=x+','+y;}while(used[k]);used[k]=1;objects[i]={name:objects[i].name,x:x,y:y};}
  return objects;
}
function estimateVisual(refCount,targetCount){return{kind:'estimate_reference_sets',referenceCount:refCount,targetCount:targetCount};}

var ASEAN=[
 {country:'Malaysia',currency:'Ringgit',code:'MYR'},{country:'Singapura',currency:'Dolar Singapura',code:'SGD'},
 {country:'Brunei',currency:'Dolar Brunei',code:'BND'},{country:'Indonesia',currency:'Rupiah',code:'IDR'},
 {country:'Thailand',currency:'Baht',code:'THB'},{country:'Filipina',currency:'Peso Filipina',code:'PHP'},
 {country:'Vietnam',currency:'Dong',code:'VND'},{country:'Laos',currency:'Kip',code:'LAK'},
 {country:'Kemboja',currency:'Riel',code:'KHR'},{country:'Myanmar',currency:'Kyat',code:'MMK'}
];

registerGenerator('d3.fullKssr',function(params,rng){
  var m=params&&params.mode||'';

  // T1 — Nombor Bulat hingga 10 000
  if(m==='represent_words'){
    var n=ri(rng,100,9999),ans=choice(n,String(n));
    var dis=numChoices(n,[n+10,n-10,n+100,n-100,Number(String(n).split('').reverse().join(''))],'place_value_confusion',null,0,10000);
    return{value:{promptMs:'Nombor “'+numberToMalay(n)+'” ditulis dalam angka sebagai?',answer:ans,visual:null},distractors:shuffle(rng,dis),meta:{archetype:'number_words_to_numeral',hintMs:'Baca nilai ribu, ratus, puluh dan sa satu demi satu.',semanticProperties:{number:n},fingerprint:fp(m,n,[numberToMalay(n)])}};
  }
  if(m==='place_value_model'){
    var n2=ri(rng,1000,9999),ans2=choice(n2,String(n2)),s=String(n2),alt=Number(s[0]+s[2]+s[1]+s[3]);
    var dis2=numChoices(n2,[alt,n2+100,n2-100,n2+10],'place_value_confusion',null,0,10000);
    return{value:{promptMs:'Nombor manakah diwakili oleh jadual nilai tempat ini?',answer:ans2,visual:pvVisual(n2)},distractors:shuffle(rng,dis2),meta:{archetype:'place_value_model_to_number',hintMs:'Gabungkan digit mengikut tempat ribu, ratus, puluh dan sa.',semanticProperties:{number:n2},fingerprint:fp(m,n2,[s])}};
  }
  if(m==='digit_value'){
    var n3=ri(rng,1000,9999),digits=String(n3).split('').map(Number),pos=ri(rng,0,3);while(digits[pos]===0){pos=ri(rng,0,3);}var pv=[1000,100,10,1],val=digits[pos]*pv[pos],place=['ribu','ratus','puluh','sa'][pos];
    var ans3=choice(val,String(val)),ds3=numChoices(val,[digits[pos],digits[pos]*10,digits[pos]*100,digits[pos]*1000],'place_value_confusion',null,0,10000);
    return{value:{promptMs:'Apakah nilai digit '+digits[pos]+' dalam nombor '+n3+'?',answer:ans3,visual:pvVisual(n3,pos)},distractors:shuffle(rng,ds3),meta:{archetype:'identify_digit_value',hintMs:'Nilai digit bergantung pada tempatnya: ribu, ratus, puluh atau sa.',semanticProperties:{number:n3,digit:digits[pos],place:place,value:val},fingerprint:fp(m,val,[n3,pos])}};
  }
  if(m==='compare_pair'){
    var a=ri(rng,1000,9999),b=ri(rng,1000,9999);if(a===b)b=a===9999?9998:a+1;var big=Math.max(a,b),small=Math.min(a,b);
    var ans4=choice('correct',big+' lebih besar daripada '+small+'.'),ds4=[choice('reverse',small+' lebih besar daripada '+big+'.','place_value_confusion'),choice('equal',a+' sama dengan '+b+'.','place_value_confusion'),choice('ones','Bandingkan digit sa sahaja.','place_value_confusion')];
    return{value:{promptMs:'Pernyataan manakah yang betul?',answer:ans4,visual:{kind:'compare_numbers',numbers:[a,b]}},distractors:shuffle(rng,ds4),meta:{archetype:'compare_number_statements',hintMs:'Banding dari nilai tempat terbesar dahulu.',semanticProperties:{a:a,b:b},fingerprint:fp(m,big,[small])}};
  }
  if(m==='order_three'){
    var ar=[];while(ar.length<4){var nv=ri(rng,1000,9999);if(ar.indexOf(nv)<0)ar.push(nv);}var asc=ar.slice().sort(function(x,y){return x-y;}),ans5=choice('asc',asc.join(', '));
    var perms=[asc.slice().reverse(),[asc[0],asc[2],asc[1],asc[3]],[asc[1],asc[0],asc[2],asc[3]]],ds5=perms.map(function(p,i){return choice('p'+i,p.join(', '),'place_value_confusion');});
    return{value:{promptMs:'Susunan manakah daripada yang paling kecil kepada paling besar?',answer:ans5,visual:{kind:'compare_numbers',numbers:ar}},distractors:shuffle(rng,ds5),meta:{archetype:'order_three_numbers',hintMs:'Bandingkan ribu dahulu, kemudian ratus, puluh dan sa.',semanticProperties:{count:4},fingerprint:fp(m,asc.join('-'),ar)}};
  }
  if(m==='compare_reason'){
    var x=ri(rng,2000,8999),xs=String(x).padStart(4,'0').split(''),pos2=pick(rng,[0,1,2]),maxDelta=Math.max(1,Math.min(3,9-Number(xs[pos2]))),delta=ri(rng,1,maxDelta),ys=xs.slice();ys[pos2]=String(Number(ys[pos2])+delta);var y=Number(ys.join('')),big2=Math.max(x,y),small2=Math.min(x,y),place2=['ribu','ratus','puluh','sa'][pos2];
    var ans6=choice('reason',big2+' lebih besar kerana digit pada tempat '+place2+' lebih besar apabila tempat di sebelah kirinya sama.'),ds6=[choice('ones','Bandingkan digit sa sahaja.','place_value_confusion'),choice('digitsum','Jumlah digit yang lebih besar sentiasa menentukan nombor lebih besar.','place_value_confusion'),choice('length','Kedua-duanya empat digit, jadi nilainya sama.','place_value_confusion')];
    return{value:{promptMs:'Mengapakah '+big2+' lebih besar daripada '+small2+'?',answer:ans6,visual:{kind:'compare_numbers',numbers:[big2,small2]}},distractors:shuffle(rng,ds6),meta:{archetype:'explain_comparison_by_place_value',hintMs:'Cari nilai tempat pertama yang berbeza dari kiri.',semanticProperties:{place:place2},fingerprint:fp(m,big2,[small2,place2])}};
  }
  if(m==='estimate_groups'||m==='estimate_reference_scale'||m==='estimate_context'){
    var ref=pick(rng,[10,20,25,50]),multiple=pick(rng,[2,3,4]),jitter=Math.max(1,Math.floor(ref/5)),target=ref*multiple+ri(rng,-jitter,jitter),nearest=Math.max(1,Math.round(target/ref)),approx=ref*nearest;
    var visual=estimateVisual(ref,target),answer,distractors,prompt,arch;
    if(m==='estimate_groups'){
      answer=choice(nearest,'Kira-kira '+nearest+' kali set rujukan');distractors=[1,2,3,4,5].filter(function(v){return v!==nearest;}).slice(0,3).map(function(v){return choice(v,'Kira-kira '+v+' kali set rujukan','estimation_vs_exact');});
      prompt='Set rujukan mempunyai kira-kira '+ref+' objek. Set sasaran kelihatan kira-kira berapa kali sebanyak set rujukan?';arch='estimate_relative_to_reference_set';
    }else if(m==='estimate_reference_scale'){
      var relation=target>ref*2+jitter?'Lebih daripada dua kali set rujukan':target<ref*2-jitter?'Kurang daripada dua kali set rujukan':'Hampir dua kali set rujukan';
      answer=choice('rel',relation);distractors=['Lebih daripada dua kali set rujukan','Kurang daripada dua kali set rujukan','Hampir dua kali set rujukan','Sama banyak dengan set rujukan'].filter(function(v){return v!==relation;}).slice(0,3).map(function(v,i){return choice('r'+i,v,'estimation_vs_exact');});
      prompt='Bandingkan set sasaran dengan set rujukan. Pernyataan manakah anggaran yang paling munasabah?';arch='judge_relative_reference_quantity';
    }else{
      answer=choice(approx,'Kira-kira '+approx+' objek');distractors=numChoices(approx,[approx-ref,approx+ref,ref],'estimation_vs_exact',function(v){return 'Kira-kira '+v+' objek';},0,10000);
      prompt='Gunakan set rujukan '+ref+' objek untuk menganggar bilangan objek dalam set sasaran.';arch='choose_reasonable_context_estimate';
    }
    return{value:{promptMs:prompt,answer:answer,visual:visual},distractors:shuffle(rng,distractors),meta:{archetype:arch,hintMs:'Bandingkan saiz set sasaran dengan set rujukan; tidak perlu mengira satu demi satu.',semanticProperties:{referenceCount:ref,targetCount:target,nearestMultiple:nearest,approximateCount:approx},fingerprint:fp(m,answer.id,[ref,target])}};
  }
  if(m==='round_symbolic'||m==='round_number_line'||m==='round_reason'){
    var rn=ensureRoundN(rng),rto=nearest1000(rn),lo=Math.floor(rn/1000)*1000,hi=Math.min(10000,lo+1000),ans9=m==='round_reason'?choice('reason',rn+' lebih hampir kepada '+rto+' berbanding ribu yang satu lagi.'):choice(rto,String(rto)),ds9;
    if(m==='round_reason'){var other=rto===lo?hi:lo;ds9=[choice('other',rn+' lebih hampir kepada '+other+'.','rounding_midpoint'),choice('hundred','Lihat digit sa sahaja untuk membundar kepada ribu terdekat.','rounding_midpoint'),choice('alwaysup','Semua nombor empat digit mesti dibundar naik.','rounding_midpoint')];}
    else ds9=numChoices(rto,[lo,hi,rto+1000,rto-1000],'rounding_midpoint',null,0,10000);
    return{value:{promptMs:m==='round_reason'?'Mengapakah '+rn+' dibundarkan kepada '+rto+'?':'Bundarkan '+rn+' kepada ribu terdekat.',answer:ans9,visual:m==='round_symbolic'?null:{kind:'number_line',min:lo,max:hi,value:rn}},distractors:shuffle(rng,ds9),meta:{archetype:m==='round_symbolic'?'round_number_symbolically':m==='round_number_line'?'round_on_number_line':'explain_nearest_thousand',hintMs:'Bandingkan jarak kepada dua ribu yang berjiran.',semanticProperties:{number:rn,rounded:rto},fingerprint:fp(m,rto,[rn,lo,hi])}};
  }
  if(m==='pattern_step'||m==='pattern_next'||m==='pattern_reverse'){
    var step=pick(rng,[1,2,5,10,20,50,100,200,500,1000]),dir=m==='pattern_reverse'?-1:1,len=6,maxStart=9999-step*(len-1),minStart=1000+step*(len-1),start=dir>0?ri(rng,1000,Math.max(1000,maxStart)):ri(rng,Math.min(9999,minStart),9999),seq=[];for(var pi=0;pi<len;pi++)seq.push(start+dir*step*pi);
    if(m==='pattern_step'){
      var label=(dir>0?'Tambah ':'Tolak ')+step,ans10=choice(label,label),pool=[1,2,5,10,20,50,100,200,500,1000].filter(function(z){return z!==step;}),opts=shuffle(rng,pool).slice(0,3).map(function(z){return choice(z,(dir>0?'Tambah ':'Tolak ')+z,'pattern_step_confusion');});
      return{value:{promptMs:'Apakah peraturan pola nombor ini?',answer:ans10,visual:seqVisual(seq)},distractors:opts,meta:{archetype:'identify_pattern_step',hintMs:'Cari beza antara nombor yang bersebelahan.',semanticProperties:{step:step,length:len},fingerprint:fp(m,label,seq)}};
    }
    var nxt=start+dir*step*len,ans11=choice(nxt,String(nxt)),ds11=numChoices(nxt,[nxt+step,nxt-step,nxt+dir*10,nxt-dir*10],'pattern_step_confusion',null,0,10000);
    return{value:{promptMs:m==='pattern_reverse'?'Corak nombor ini menurun. Apakah nombor seterusnya?':'Apakah nombor seterusnya dalam pola ini?',answer:ans11,visual:seqVisual(seq)},distractors:shuffle(rng,ds11),meta:{archetype:m==='pattern_reverse'?'recognize_descending_place_value_pattern':'predict_next_place_value_step',hintMs:'Gunakan beza yang sama pada setiap langkah.',semanticProperties:{step:step,length:len,direction:dir},fingerprint:fp(m,nxt,seq)}};
  }
  if(m==='pattern_missing'||m==='pattern_error'||m==='pattern_rule'){
    var st=pick(rng,[1,2,5,10,20,50,100,200,500]),base=ri(rng,1000,Math.max(1000,9999-st*5)),seq2=[];for(var qi=0;qi<6;qi++)seq2.push(base+st*qi);
    if(m==='pattern_missing'){
      var mi=ri(rng,1,4),target2=seq2[mi],shown=seq2.slice();shown[mi]=null;var ans12=choice(target2,String(target2)),ds12=numChoices(target2,[target2-st,target2+st,target2+10],'pattern_step_confusion',null,0,10000);
      return{value:{promptMs:'Lengkapkan nombor yang hilang dalam pola ini.',answer:ans12,visual:seqVisual(shown,mi)},distractors:shuffle(rng,ds12),meta:{archetype:'complete_missing_pattern_term',hintMs:'Cari beza tetap antara nombor yang diketahui.',semanticProperties:{step:st,length:6},fingerprint:fp(m,target2,seq2)}};
    }
    if(m==='pattern_error'){
      var ei=ri(rng,1,4),errOffset=st===1?10:Math.max(1,Math.floor(st/2)),wrongv=seq2[ei]+errOffset,shown2=seq2.slice();shown2[ei]=wrongv;var ans13=choice(wrongv,String(wrongv)),others=shown2.filter(function(v,ix){return ix!==ei;}).slice(0,3).map(function(v){return choice(v,String(v),'pattern_step_confusion');});
      return{value:{promptMs:'Satu nombor tidak mengikut pola. Nombor manakah yang salah?',answer:ans13,visual:seqVisual(shown2)},distractors:shuffle(rng,others),meta:{archetype:'find_incorrect_pattern_term',hintMs:'Semak beza setiap pasangan nombor bersebelahan.',semanticProperties:{step:st,errorIndex:ei},fingerprint:fp(m,wrongv,shown2)}};
    }
    var rule='Tambah '+st,ans14=choice(rule,rule),alts=shuffle(rng,[1,2,5,10,20,50,100,200,500].filter(function(v){return v!==st;})).slice(0,3).map(function(v){return choice(v,'Tambah '+v,'pattern_step_confusion');});
    return{value:{promptMs:'Peraturan manakah membina pola '+seq2.join(', ')+'?',answer:ans14,visual:null},distractors:alts,meta:{archetype:'choose_pattern_rule',hintMs:'Tolak dua nombor bersebelahan untuk mencari langkah pola.',semanticProperties:{step:st,length:6},fingerprint:fp(m,rule,seq2)}};
  }

  // T4 — Wang
  if(m==='money_add'){
    var prices=[ri(rng,15000,280000),ri(rng,12000,240000),ri(rng,8000,180000)],total=prices[0]+prices[1]+prices[2];while(total>950000){prices[0]=Math.floor(prices[0]*0.75);prices[1]=Math.floor(prices[1]*0.75);prices[2]=Math.floor(prices[2]*0.75);total=prices[0]+prices[1]+prices[2];}
    return{value:{promptMs:'Tiga barang pada resit berharga seperti berikut. Berapakah jumlah semuanya?',answer:choice(total,money(total)),visual:{kind:'money_items',amounts:prices.map(money)}},distractors:shuffle(rng,moneyWrong(total,[total-prices[2],total+5000,total-5000],'money_operation_confusion')),meta:{archetype:'add_multiple_money_values',hintMs:'Tambah ketiga-tiga nilai wang dengan titik perpuluhan selari.',semanticProperties:{values:prices.join(','),count:3,totalCents:total},fingerprint:fp(m,total,prices)}};
  }
  if(m==='money_subtract'){
    var budget=ri(rng,100000,950000),spend=ri(rng,10000,budget-5000),left=budget-spend;
    return{value:{promptMs:'Aina mempunyai '+money(budget)+' dan membelanjakan '+money(spend)+'. Berapakah baki wangnya?',answer:choice(left,money(left)),visual:{kind:'money_budget',start:money(budget),changes:[{label:'Belanja',amount:'− '+money(spend)}]}},distractors:shuffle(rng,moneyWrong(left,[budget+spend,spend,left+5000],'money_operation_confusion')),meta:{archetype:'subtract_money_from_budget',hintMs:'Baki = wang asal − jumlah dibelanjakan.',semanticProperties:{budgetCents:budget,spendCents:spend,resultCents:left},fingerprint:fp(m,left,[budget,spend])}};
  }
  if(m==='money_compare'){
    var aa=[ri(rng,10000,180000),ri(rng,10000,180000),ri(rng,10000,180000)],bb=[ri(rng,10000,180000),ri(rng,10000,180000),ri(rng,10000,180000)],ta=aa[0]+aa[1]+aa[2],tb=bb[0]+bb[1]+bb[2];if(ta===tb){bb[2]+=100;tb+=100;}var winner=ta>tb?'Resit A':'Resit B',ans15=choice(winner,winner+' mempunyai jumlah lebih besar.'),ds15=[choice('other',(winner==='Resit A'?'Resit B':'Resit A')+' mempunyai jumlah lebih besar.','money_operation_confusion'),choice('equal','Kedua-dua jumlah adalah sama.','money_operation_confusion'),choice('first','Cukup bandingkan harga barang pertama sahaja.','money_operation_confusion')];
    return{value:{promptMs:'Resit manakah mempunyai jumlah perbelanjaan lebih besar?',answer:ans15,visual:{kind:'money_receipts',a:aa.map(money),b:bb.map(money)}},distractors:shuffle(rng,ds15),meta:{archetype:'compare_two_money_totals',hintMs:'Jumlahkan semua item pada setiap resit dahulu.',semanticProperties:{aTotalCents:ta,bTotalCents:tb,itemsPerReceipt:3},fingerprint:fp(m,winner,[ta,tb])}};
  }
  if(m==='money_mixed_change'){
    var p1=ri(rng,8000,180000),p2=ri(rng,8000,180000),p3=ri(rng,5000,120000),cost=p1+p2+p3,pay=Math.ceil((cost+5000)/10000)*10000;if(pay>1000000)pay=1000000;var chg=pay-cost;
    return{value:{promptMs:'Mira membeli tiga barang pada kad harga dan membayar '+money(pay)+'. Berapakah baki?',answer:choice(chg,money(chg)),visual:{kind:'money_items',amounts:[money(p1),money(p2),money(p3)],payment:money(pay)}},distractors:shuffle(rng,moneyWrong(chg,[pay-p1,pay-p2,cost],'money_operation_confusion')),meta:{archetype:'purchase_then_find_change',hintMs:'Tambah semua harga, kemudian tolak jumlah itu daripada bayaran.',semanticProperties:{itemCount:3,costCents:cost,paymentCents:pay,changeCents:chg},fingerprint:fp(m,chg,[p1,p2,p3,pay])}};
  }
  if(m==='money_mixed_budget'){
    var start=ri(rng,150000,850000),spent1=ri(rng,10000,Math.min(180000,start-20000)),receive=ri(rng,10000,120000),spent2=ri(rng,10000,Math.min(120000,start-spent1+receive-5000)),final=start-spent1+receive-spent2;
    return{value:{promptMs:'Ikut perubahan wang pada kad. Berapakah wang akhir?',answer:choice(final,money(final)),visual:{kind:'money_budget',start:money(start),changes:[{label:'Belanja',amount:'− '+money(spent1)},{label:'Terima',amount:'+ '+money(receive)},{label:'Belanja',amount:'− '+money(spent2)}]}},distractors:shuffle(rng,moneyWrong(final,[start-spent1-receive-spent2,start+spent1+receive-spent2,start-spent1+receive+spent2],'money_operation_confusion')),meta:{archetype:'track_budget_with_mixed_changes',hintMs:'Wang diterima ditambah; wang dibelanjakan ditolak.',semanticProperties:{startCents:start,resultCents:final,steps:3},fingerprint:fp(m,final,[start,spent1,receive,spent2])}};
  }
  if(m==='money_mixed_error'){
    var base=ri(rng,120000,800000),sp=ri(rng,10000,Math.min(180000,base-10000)),inc=ri(rng,10000,150000),correct=base-sp+inc,ans16=choice(correct,money(correct)),ds16=moneyWrong(correct,[base+sp+inc,base-sp-inc,base+sp-inc],'money_operation_confusion');
    return{value:{promptMs:'Hakim ada '+money(base)+', berbelanja '+money(sp)+' dan kemudian menerima '+money(inc)+'. Apakah jumlah wang yang betul sekarang?',answer:ans16,visual:null},distractors:shuffle(rng,ds16),meta:{archetype:'identify_correct_mixed_money_result',hintMs:'Perbelanjaan ditolak; wang diterima ditambah.',semanticProperties:{baseCents:base,spendCents:sp,incomeCents:inc,resultCents:correct},fingerprint:fp(m,correct,[base,sp,inc])}};
  }
  if(m==='money_multiply'){
    var qty=ri(rng,2,9),maxPrice=Math.floor(950000/qty),price=ri(rng,5000,Math.max(5000,maxPrice)),tot=price*qty;
    return{value:{promptMs:'Setiap barang berharga '+money(price)+'. Berapakah harga '+qty+' barang yang sama?',answer:choice(tot,money(tot)),visual:{kind:'money_items',amounts:Array(Math.min(qty,6)).fill(money(price)),quantity:qty}},distractors:shuffle(rng,moneyWrong(tot,[price+qty,price*(qty-1),Math.min(1000000,price*(qty+1))],'money_operation_confusion')),meta:{archetype:'multiply_equal_item_prices',hintMs:'Darab harga satu barang dengan bilangan barang.',semanticProperties:{factor:qty,factorClass:'one_digit',unitCents:price,totalCents:tot},fingerprint:fp(m,tot,[price,qty])}};
  }
  if(m==='money_divide'){
    var factor=pick(rng,[10,100,1000]),unit=ri(rng,1,Math.max(1,Math.floor(900000/factor))),tot2=unit*factor;
    return{value:{promptMs:money(tot2)+' dibahagi sama rata kepada '+factor+' bahagian. Nilai setiap bahagian ialah?',answer:choice(unit,money(unit)),visual:{kind:'money_share',total:money(tot2),groups:factor}},distractors:shuffle(rng,moneyWrong(unit,[Math.floor(tot2/10),unit+100,Math.max(0,unit-100)],'money_operation_confusion')),meta:{archetype:'divide_money_equally',hintMs:'Bahagi jumlah wang dengan 10, 100 atau 1000 seperti yang diberi.',semanticProperties:{factor:factor,factorClass:'power10',totalCents:tot2,unitCents:unit},fingerprint:fp(m,unit,[tot2,factor])}};
  }
  if(m==='money_unit_price'){
    var qn=pick(rng,[10,100,1000]),unit2=ri(rng,1,Math.max(1,Math.floor(900000/qn))),all=qn*unit2;
    return{value:{promptMs:qn+' unit barang yang sama berharga '+money(all)+' semuanya. Harga satu unit ialah?',answer:choice(unit2,money(unit2)),visual:{kind:'money_items',amounts:[money(all)],quantity:qn}},distractors:shuffle(rng,moneyWrong(unit2,[Math.floor(all/10),unit2+100,Math.max(0,unit2-100)],'money_operation_confusion')),meta:{archetype:'find_unit_price_from_total',hintMs:'Harga satu unit = jumlah harga ÷ bilangan unit.',semanticProperties:{factor:qn,factorClass:'power10',totalCents:all,unitCents:unit2},fingerprint:fp(m,unit2,[all,qn])}};
  }
  if(m==='currency_country_to_name'||m==='currency_name_to_country'||m==='currency_code_match'){
    var c=pick(rng,ASEAN),pool=shuffle(rng,ASEAN.filter(function(z){return z.country!==c.country;})).slice(0,3),prompt,answer,ds,visual;
    if(m==='currency_country_to_name'){prompt='Apakah mata wang negara '+c.country+'?';answer=choice(c.currency,c.currency);ds=pool.map(function(z){return choice(z.currency,z.currency,'currency_country_confusion');});visual={kind:'currency_card',shownCountry:c.country};}
    else if(m==='currency_name_to_country'){prompt='Mata wang '+c.currency+' digunakan oleh negara mana?';answer=choice(c.country,c.country);ds=pool.map(function(z){return choice(z.country,z.country,'currency_country_confusion');});visual={kind:'currency_card',shownCurrency:c.currency};}
    else{prompt='Kod '+c.code+' merujuk kepada mata wang yang mana?';answer=choice(c.currency,c.currency);ds=pool.map(function(z){return choice(z.currency,z.currency,'currency_country_confusion');});visual={kind:'currency_card',shownCode:c.code};}
    return{value:{promptMs:prompt,answer:answer,visual:visual},distractors:shuffle(rng,ds),meta:{archetype:m==='currency_country_to_name'?'country_to_currency':m==='currency_name_to_country'?'currency_to_country':'match_currency_code_to_name',hintMs:'Padankan negara, nama mata wang dan kod ASEAN yang dipelajari.',semanticProperties:{country:c.country,currency:c.currency,code:c.code,hiddenAnswerField:true},fingerprint:fp(m,answer.id,[c.country,c.currency,c.code])}};
  }
  if(m==='needs_identify'){
    var need=pick(rng,['Beras','Ubat ketika sakit','Buku sekolah','Air minuman']),wants=shuffle(rng,['Mainan baharu','Permainan video','Aksesori hiasan','Gula-gula','Patung koleksi']).slice(0,3),opts=shuffle(rng,[need].concat(wants)),ans17=choice(need,need),ds17=opts.filter(function(z){return z!==need;}).map(function(z){return choice(z,z,'need_want_confusion');});
    return{value:{promptMs:'Yang manakah paling jelas merupakan KEPERLUAN?',answer:ans17,visual:{kind:'needs_wants',items:opts}},distractors:ds17,meta:{archetype:'identify_need_among_choices',hintMs:'Keperluan penting untuk hidup, kesihatan atau belajar; kehendak boleh ditangguhkan.',semanticProperties:{need:need},fingerprint:fp(m,need,opts)}};
  }
  if(m==='needs_saving_choice'){
    var ans18=choice('save','Beli barang keperluan dahulu dan simpan baki untuk matlamat yang lebih penting.'),ds18=[choice('want','Habiskan semua wang pada barang kehendak hari ini.','need_want_confusion'),choice('borrow','Pinjam wang supaya boleh membeli semua kehendak.','need_want_confusion'),choice('ignore','Abaikan barang keperluan supaya baki boleh digunakan untuk permainan.','need_want_confusion')];
    return{value:{promptMs:'Sara mempunyai wang terhad. Dia perlu membeli buku latihan tetapi juga mahu mainan baharu. Pilihan manakah paling bijak?',answer:ans18,visual:{kind:'money_budget',start:'Wang terhad',changes:[{label:'Keperluan',amount:'Buku latihan'},{label:'Kehendak',amount:'Mainan'}]}},distractors:shuffle(rng,ds18),meta:{archetype:'choose_sensible_saving_decision',hintMs:'Utamakan keperluan dan fikirkan simpanan sebelum kehendak.',semanticProperties:{decision:'need_then_save'},fingerprint:fp(m,'save',[])}};
  }
  if(m==='needs_priority_reason'){
    var ans19=choice('reason','Keperluan membantu aktiviti penting dan patut didahulukan sebelum kehendak.'),ds19=[choice('expensive','Barang yang lebih mahal sentiasa perlu dibeli dahulu.','need_want_confusion'),choice('fun','Barang yang paling menyeronokkan mesti didahulukan.','need_want_confusion'),choice('spend','Wang simpanan sepatutnya dihabiskan secepat mungkin.','need_want_confusion')];
    return{value:{promptMs:'Mengapakah kasut sekolah yang rosak patut diganti sebelum membeli permainan baharu?',answer:ans19,visual:null},distractors:shuffle(rng,ds19),meta:{archetype:'explain_need_before_want',hintMs:'Bezakan perkara yang diperlukan untuk aktiviti penting dengan perkara yang hanya diingini.',semanticProperties:{reasoning:'need_before_want'},fingerprint:fp(m,'reason',[])}};
  }

  // T8 — Koordinat / kedudukan
  if(m.indexOf('coord_')===0){
    var objects=gridObjects(rng),refObj=objects[0],targetObj=objects[1],dx,dy;
    if(m==='coord_relative_direction'||m==='coord_relative_distance'){
      var dirs=[[1,0],[-1,0],[0,1],[0,-1]],d=pick(rng,dirs),dist=m==='coord_relative_distance'?ri(rng,1,2):1,nx=refObj.x+d[0]*dist,ny=refObj.y+d[1]*dist;
      if(nx<1||nx>5||ny<1||ny>5){refObj={name:refObj.name,x:3,y:3};nx=3+d[0]*dist;ny=3+d[1]*dist;}
      targetObj={name:targetObj.name,x:nx,y:ny};objects[0]=refObj;objects[1]=targetObj;replaceOtherCollisions(rng,objects,2);dx=targetObj.x-refObj.x;dy=targetObj.y-refObj.y;
      var compass=m==='coord_relative_direction'&&rng()<0.5,correctDir=dirText(dx,dy,compass),ans20=choice(correctDir,correctDir),opp=dirText(-dx,-dy,compass),swap=dx!==0?dirText(0,dx>0?Math.abs(dx):-Math.abs(dx),compass):dirText(dy>0?Math.abs(dy):-Math.abs(dy),0,compass),extra=(Math.abs(dx||dy)+1)+' petak ke '+(dx>0?(compass?'timur':'kanan'):dx<0?(compass?'barat':'kiri'):dy>0?(compass?'utara':'atas'):(compass?'selatan':'bawah'));
      var ds20=[choice('op',opp,'direction_distance_confusion'),choice('swap',swap,'horizontal_vertical_confusion'),choice('extra',extra,'direction_distance_confusion')];
      return{value:{promptMs:'Kedudukan '+targetObj.name+' berbanding '+refObj.name+' ialah?',answer:ans20,visual:{kind:'coordinate_grid',objects:objects,highlight:[refObj.name,targetObj.name]}},distractors:shuffle(rng,ds20),meta:{archetype:m==='coord_relative_direction'?'describe_cardinal_relative_position':'describe_relative_distance',hintMs:'Mulakan daripada objek rujukan dan kira petak serta arah.',semanticProperties:{uniqueCoordinates:uniqueCoordObjects(objects),compassVocabulary:compass,dx:dx,dy:dy},fingerprint:fp(m,correctDir,[refObj.x,refObj.y,targetObj.x,targetObj.y])}};
    }
    if(m==='coord_relative_compare'){
      var compass2=true;if(rng()<0.5){targetObj.y=refObj.y;if(targetObj.x===refObj.x)targetObj.x=refObj.x===5?4:refObj.x+1;}else{targetObj.x=refObj.x;if(targetObj.y===refObj.y)targetObj.y=refObj.y===5?4:refObj.y+1;}objects[1]=targetObj;replaceOtherCollisions(rng,objects,2);dx=targetObj.x-refObj.x;dy=targetObj.y-refObj.y;var txt=dirText(dx,dy,compass2),ans21=choice(txt,txt),ds21=[choice('op',dirText(-dx,-dy,compass2),'reference_point_confusion'),choice('swap',dx!==0?dirText(0,dx>0?Math.abs(dx):-Math.abs(dx),compass2):dirText(dy>0?Math.abs(dy):-Math.abs(dy),0,compass2),'horizontal_vertical_confusion'),choice('zero','Kedua-dua objek berada di tempat yang sama.','reference_point_confusion')];
      return{value:{promptMs:'Lihat dua objek yang ditanda. Bagaimanakah kedudukan '+targetObj.name+' daripada '+refObj.name+'?',answer:ans21,visual:{kind:'coordinate_grid',objects:objects,highlight:[refObj.name,targetObj.name]}},distractors:shuffle(rng,ds21),meta:{archetype:'compare_two_object_positions',hintMs:'Pastikan arah dibaca dari objek rujukan yang disebut.',semanticProperties:{uniqueCoordinates:uniqueCoordObjects(objects),compassVocabulary:true},fingerprint:fp(m,txt,[refObj.x,refObj.y,targetObj.x,targetObj.y])}};
    }
    if(m==='coord_identify_axes'||m==='coord_identify_clue'){
      var t=pick(rng,objects),ans22=choice(t.name,t.name),others=objects.filter(function(o){return o.name!==t.name;}).map(function(o){return choice(o.name,o.name,'horizontal_vertical_confusion');}),pr=m==='coord_identify_axes'?'Objek manakah berada pada kedudukan '+coordLabel(t.x,t.y)+'?':'Cari objek pada lajur '+coordLabel(t.x,t.y).charAt(0)+' dan baris '+t.y+'.';
      return{value:{promptMs:pr,answer:ans22,visual:{kind:'coordinate_grid',objects:objects}},distractors:shuffle(rng,others),meta:{archetype:m==='coord_identify_axes'?'identify_object_at_axis_intersection':'identify_object_from_axis_clue',hintMs:'Baca lajur mengufuk dahulu, kemudian baris mencancang.',semanticProperties:{coordinate:coordLabel(t.x,t.y),uniqueCoordinates:uniqueCoordObjects(objects)},fingerprint:fp(m,t.name,[t.x,t.y])}};
    }
    if(m==='coord_match_description'){
      var t2=pick(rng,objects),ans23=choice(t2.name,t2.name),ds23=objects.filter(function(o){return o.name!==t2.name;}).map(function(o){return choice(o.name,o.name,'horizontal_vertical_confusion');});
      return{value:{promptMs:'Objek manakah sepadan dengan kedudukan “'+coordLabel(t2.x,t2.y)+'”?',answer:ans23,visual:{kind:'coordinate_grid',objects:objects}},distractors:shuffle(rng,ds23),meta:{archetype:'match_object_to_position_description',hintMs:'Padankan huruf lajur dan nombor baris.',semanticProperties:{coordinate:coordLabel(t2.x,t2.y),uniqueCoordinates:uniqueCoordObjects(objects)},fingerprint:fp(m,t2.name,[t2.x,t2.y])}};
    }
    if(m==='coord_read_position'){
      var t3=pick(rng,objects),ans24=choice(coordLabel(t3.x,t3.y),coordLabel(t3.x,t3.y)),coords=[];for(var xx=1;xx<=5;xx++)for(var yy=1;yy<=5;yy++){var lab=coordLabel(xx,yy);if(lab!==ans24.labelMs)coords.push(lab);}var ds24=shuffle(rng,coords).slice(0,3).map(function(l,i){return choice('c'+i,l,'horizontal_vertical_confusion');});
      return{value:{promptMs:'Apakah kedudukan '+t3.name+'?',answer:ans24,visual:{kind:'coordinate_grid',objects:objects,highlight:[t3.name]}},distractors:ds24,meta:{archetype:'read_horizontal_vertical_position',hintMs:'Baca huruf lajur dahulu, kemudian nombor baris.',semanticProperties:{coordinate:ans24.labelMs,uniqueCoordinates:uniqueCoordObjects(objects)},fingerprint:fp(m,ans24.labelMs,[t3.x,t3.y])}};
    }
    if(m==='coord_moves_to_target'){
      var r={name:'Mula',x:ri(rng,2,4),y:ri(rng,2,4)},tdir=pick(rng,[[1,0],[-1,0],[0,1],[0,-1]]),maxDist=tdir[0]!==0?(tdir[0]>0?5-r.x:r.x-1):(tdir[1]>0?5-r.y:r.y-1),dist2=ri(rng,1,Math.max(1,Math.min(2,maxDist))),tt={name:'Sasaran',x:r.x+tdir[0]*dist2,y:r.y+tdir[1]*dist2},move=dirText(tt.x-r.x,tt.y-r.y,false),ans25=choice(move,move),ds25=[choice('rev',dirText(r.x-tt.x,r.y-tt.y,false),'direction_distance_confusion'),choice('swap',tdir[0]!==0?dist2+' petak ke atas':dist2+' petak ke kanan','horizontal_vertical_confusion'),choice('extra',(dist2+1)+' petak ke '+(tdir[0]>0?'kanan':tdir[0]<0?'kiri':tdir[1]>0?'atas':'bawah'),'direction_distance_confusion')];
      return{value:{promptMs:'Gerakan manakah membawa Mula ke Sasaran?',answer:ans25,visual:{kind:'coordinate_grid',objects:[r,tt],highlight:['Mula','Sasaran']}},distractors:shuffle(rng,ds25),meta:{archetype:'choose_moves_to_target',hintMs:'Kira bilangan petak dan semak arah gerakan.',semanticProperties:{start:coordLabel(r.x,r.y),target:coordLabel(tt.x,tt.y)},fingerprint:fp(m,move,[r.x,r.y,tt.x,tt.y])}};
    }
    if(m==='coord_follow_moves'){
      var sx=ri(rng,2,4),sy=ri(rng,2,4),dx2=pick(rng,[-1,1]),dy2=pick(rng,[-1,1]),tx=sx+dx2,ty=sy+dy2,answerPos=coordLabel(tx,ty),ans26=choice(answerPos,answerPos),all=[];for(var ax=1;ax<=5;ax++)for(var ay=1;ay<=5;ay++){var lp=coordLabel(ax,ay);if(lp!==answerPos)all.push(lp);}var ds26=shuffle(rng,all).slice(0,3).map(function(l,i){return choice('p'+i,l,'direction_distance_confusion');});
      return{value:{promptMs:'Bermula pada '+coordLabel(sx,sy)+', bergerak 1 petak '+(dx2>0?'ke kanan':'ke kiri')+' dan 1 petak '+(dy2>0?'ke atas':'ke bawah')+'. Di manakah kedudukan akhir?',answer:ans26,visual:{kind:'coordinate_grid',objects:[{name:'Mula',x:sx,y:sy}],highlight:['Mula']}},distractors:ds26,meta:{archetype:'locate_after_movement_instruction',hintMs:'Ubah lajur mengikut kiri/kanan dan baris mengikut atas/bawah.',semanticProperties:{start:coordLabel(sx,sy),target:answerPos,dx:dx2,dy:dy2},fingerprint:fp(m,answerPos,[sx,sy,dx2,dy2])}};
    }
  }

  throw new Error('d3.fullKssr: unknown mode "'+m+'"');
});
})();
