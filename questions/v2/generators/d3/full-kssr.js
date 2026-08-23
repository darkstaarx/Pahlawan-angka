// questions/v2/generators/d3/full-kssr.js
// Phase 3A-1 FULL: Darjah 3 remaining T1/T4/T8 authored content.
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
  for(var d=1;out.length<3&&d<5000;d++){add(base+d);add(base-d);}
  return out.slice(0,3);
}
function numChoices(base,cands,tag,fmt){
  var wrong=uniqNums(base,cands,-999999,999999);
  return wrong.map(function(n){return choice(n,fmt?fmt(n):String(n),tag);});
}
function money(cents){return 'RM'+(cents/100).toFixed(2);}
function moneyWrong(base,cands,tag){return numChoices(base,cands,tag,money);}
function malayUnder100(n){
  var one=['','satu','dua','tiga','empat','lima','enam','tujuh','lapan','sembilan'];
  if(n<10)return one[n];
  if(n===10)return 'sepuluh';
  if(n===11)return 'sebelas';
  if(n<20)return one[n-10]+' belas';
  var t=Math.floor(n/10),r=n%10;return one[t]+' puluh'+(r?' '+one[r]:'');
}
function numberToMalay(n){
  n=Math.floor(n);
  if(n<100)return malayUnder100(n);
  if(n<1000){var h=Math.floor(n/100),r=n%100;return (h===1?'seratus':['','satu','dua','tiga','empat','lima','enam','tujuh','lapan','sembilan'][h]+' ratus')+(r?' '+malayUnder100(r):'');}
  var th=Math.floor(n/1000),rem=n%1000,head=th===1?'seribu':numberToMalay(th)+' ribu';
  return head+(rem?' '+numberToMalay(rem):'');
}
function expanded(n){
  var s=String(n).padStart(4,'0'),p=[1000,100,10,1],a=[];
  for(var i=0;i<4;i++){var d=Number(s[i]);if(d)a.push(String(d*p[i]));}
  return a.join(' + ');
}
function pvVisual(n){
  var s=String(n).padStart(4,'0');
  return {kind:'place_value_table',digits:[Number(s[0]),Number(s[1]),Number(s[2]),Number(s[3])]};
}
function seqVisual(seq,missing){return{kind:'number_sequence',sequence:seq,missingIndex:missing==null?-1:missing};}
function nearest1000(n){return Math.round(n/1000)*1000;}
function ensureRoundN(rng){
  var n=ri(rng,1000,9999);
  if(n%1000===500)n+=17;
  if(n>9999)n-=37;
  return n;
}
function objs(){return ['Buku','Bola','Pokok','Rumah'];}
function gridObjects(rng){
  var names=shuffle(rng,objs()),used=Object.create(null),out=[];
  for(var i=0;i<4;i++){
    var x,y,key;
    do{x=ri(rng,1,5);y=ri(rng,1,5);key=x+','+y;}while(used[key]);
    used[key]=1;out.push({name:names[i],x:x,y:y});
  }
  return out;
}
function coordLabel(x,y){return 'Mengufuk '+x+', mencancang '+y;}
function dirText(dx,dy){
  if(dx>0&&dy===0)return Math.abs(dx)+' petak ke kanan';
  if(dx<0&&dy===0)return Math.abs(dx)+' petak ke kiri';
  if(dy>0&&dx===0)return Math.abs(dy)+' petak ke atas';
  if(dy<0&&dx===0)return Math.abs(dy)+' petak ke bawah';
  return '';
}
var ASEAN=[
 {country:'Malaysia',currency:'Ringgit',code:'MYR'},
 {country:'Singapura',currency:'Dolar Singapura',code:'SGD'},
 {country:'Brunei',currency:'Dolar Brunei',code:'BND'},
 {country:'Indonesia',currency:'Rupiah',code:'IDR'},
 {country:'Thailand',currency:'Baht',code:'THB'},
 {country:'Filipina',currency:'Peso Filipina',code:'PHP'},
 {country:'Vietnam',currency:'Dong',code:'VND'},
 {country:'Laos',currency:'Kip',code:'LAK'},
 {country:'Kemboja',currency:'Riel',code:'KHR'},
 {country:'Myanmar',currency:'Kyat',code:'MMK'}
];

registerGenerator('d3.fullKssr',function(params,rng){
  var m=params&&params.mode||'';

  // T1 — Nombor
  if(m==='represent_words'){
    var n=ri(rng,100,9999),ans=choice(n,String(n));
    var dis=numChoices(n,[n+10,n-10,n+100,n-100,Number(String(n).split('').reverse().join(''))],'place_value_confusion');
    return{value:{promptMs:'Nombor "'+numberToMalay(n)+'" ditulis dalam angka sebagai?',answer:ans,visual:null},distractors:shuffle(rng,dis),meta:{archetype:'number_words_to_numeral',hintMs:'Baca nilai ribu, ratus, puluh dan sa satu demi satu.',fingerprint:fp(m,n,[numberToMalay(n)])}};
  }
  if(m==='place_value_model'){
    var n2=ri(rng,1000,9999),ans2=choice(n2,String(n2));
    var s=String(n2),alt=Number(s[0]+s[2]+s[1]+s[3]);
    var dis2=numChoices(n2,[alt,n2+100,n2-100,n2+10],'place_value_confusion');
    return{value:{promptMs:'Nombor manakah diwakili oleh jadual nilai tempat ini?',answer:ans2,visual:pvVisual(n2)},distractors:shuffle(rng,dis2),meta:{archetype:'place_value_model_to_number',hintMs:'Gabungkan digit mengikut tempat ribu, ratus, puluh dan sa.',fingerprint:fp(m,n2,[s])}};
  }
  if(m==='number_to_expanded'){
    var n3=ri(rng,1000,9999),e=expanded(n3),ans3=choice(e,e);
    var wrong=[expanded(Math.min(9999,n3+100)),expanded(Math.max(1000,n3-100)),expanded(Math.min(9999,n3+10))];
    var seen=Object.create(null),ds=[];
    for(var wi=0;wi<wrong.length;wi++){if(wrong[wi]!==e&&!seen[wrong[wi]]){seen[wrong[wi]]=1;ds.push(choice('w'+wi,wrong[wi],'place_value_confusion'));}}
    while(ds.length<3){var q=n3+(ds.length+1);var qe=expanded(q);if(qe!==e&&!seen[qe]){seen[qe]=1;ds.push(choice('x'+ds.length,qe,'place_value_confusion'));}}
    return{value:{promptMs:'Bentuk cerakin yang betul bagi '+n3+' ialah?',answer:ans3,visual:null},distractors:shuffle(rng,ds),meta:{archetype:'number_to_expanded_form',hintMs:'Cerakinkan nombor mengikut nilai setiap digit.',fingerprint:fp(m,e,[n3])}};
  }
  if(m==='compare_pair'){
    var a=ri(rng,1000,9999),b=ri(rng,1000,9999);if(a===b)b+=1;
    var big=Math.max(a,b),small=Math.min(a,b);
    var ans4=choice('correct',big+' lebih besar daripada '+small+'.');
    var ds4=[
      choice('reverse',small+' lebih besar daripada '+big+'.','place_value_confusion'),
      choice('equal',a+' sama dengan '+b+'.','place_value_confusion'),
      choice('digits','Nombor yang mempunyai digit sa lebih besar sentiasa lebih besar.','place_value_confusion')
    ];
    return{value:{promptMs:'Pernyataan manakah yang betul?',answer:ans4,visual:{kind:'compare_numbers',numbers:[a,b]}},distractors:shuffle(rng,ds4),meta:{archetype:'compare_number_statements',hintMs:'Bandingkan digit dari nilai tempat terbesar dahulu.',fingerprint:fp(m,big,[small])}};
  }
  if(m==='order_three'){
    var ar=[ri(rng,1000,9999),ri(rng,1000,9999),ri(rng,1000,9999)];
    while(new Set(ar).size<3)ar=[ri(rng,1000,9999),ri(rng,1000,9999),ri(rng,1000,9999)];
    var asc=ar.slice().sort(function(x,y){return x-y;}),ans5=choice('asc',asc.join(', '));
    var perms=[
      asc.slice().reverse(),
      [asc[0],asc[2],asc[1]],
      [asc[1],asc[0],asc[2]]
    ];
    var ds5=perms.map(function(p,i){return choice('p'+i,p.join(', '),'place_value_confusion');});
    return{value:{promptMs:'Susunan manakah daripada yang paling kecil kepada paling besar?',answer:ans5,visual:{kind:'compare_numbers',numbers:ar}},distractors:shuffle(rng,ds5),meta:{archetype:'order_three_numbers',hintMs:'Bandingkan ribu dahulu, kemudian ratus, puluh dan sa.',fingerprint:fp(m,asc.join('-'),ar)}};
  }
  if(m==='compare_reason'){
    var x=ri(rng,2000,8999),y=x;
    var xs=String(x).padStart(4,'0').split('');
    var pos=pick(rng,[0,1,2]),delta=ri(rng,1,Math.min(3,9-Number(xs[pos])));
    var ys=xs.slice();ys[pos]=String(Number(ys[pos])+delta);y=Number(ys.join(''));
    var big2=Math.max(x,y),small2=Math.min(x,y),place=['ribu','ratus','puluh','sa'][pos];
    var ans6=choice('reason',big2+' lebih besar kerana digit pada tempat '+place+' ialah lebih besar apabila tempat di sebelah kirinya sama.');
    var ds6=[
      choice('ones','Bandingkan digit sa sahaja untuk menentukan nombor lebih besar.','place_value_confusion'),
      choice('digitsum','Nombor dengan jumlah digit lebih besar mesti lebih besar.','place_value_confusion'),
      choice('length','Kedua-duanya empat digit, jadi nilainya sama.','place_value_confusion')
    ];
    return{value:{promptMs:'Mengapakah '+big2+' lebih besar daripada '+small2+'?',answer:ans6,visual:{kind:'compare_numbers',numbers:[big2,small2]}},distractors:shuffle(rng,ds6),meta:{archetype:'explain_comparison_by_place_value',hintMs:'Cari nilai tempat pertama yang berbeza dari kiri.',fingerprint:fp(m,big2,[small2,place])}};
  }
  if(m==='estimate_groups'||m==='estimate_reference_scale'){
    var ref=pick(rng,[10,20,25,50]),mult=ri(rng,2,5),est=ref*mult;
    var ans7=choice(est,String(est));
    var ds7=numChoices(est,[ref*(mult-1),ref*(mult+1),ref+mult,ref*mult+10],'estimation_vs_exact');
    return{value:{promptMs:m==='estimate_groups'?'Satu kumpulan rujukan mewakili kira-kira '+ref+' objek. Anggarkan jumlah bagi '+mult+' kumpulan yang sama.':'Jika 1 kumpulan rujukan dianggarkan '+ref+' objek, anggaran bagi '+mult+' kumpulan ialah?',answer:ans7,visual:{kind:'estimate_groups',reference:ref,groups:mult}},distractors:shuffle(rng,ds7),meta:{archetype:m==='estimate_groups'?'estimate_repeated_reference_groups':'scale_reference_quantity',hintMs:'Gunakan kuantiti rujukan dan gandakan mengikut bilangan kumpulan.',fingerprint:fp(m,est,[ref,mult])}};
  }
  if(m==='estimate_context'){
    var per=pick(rng,[20,25,50,100]),count=ri(rng,2,5),est2=per*count;
    var ans8=choice(est2,'Kira-kira '+est2);
    var ds8=numChoices(est2,[est2-per,est2+per,per+count],'estimation_vs_exact',function(n){return 'Kira-kira '+n;});
    return{value:{promptMs:'Satu bekas memuatkan kira-kira '+per+' guli. Ada '+count+' bekas yang hampir sama penuh. Anggaran jumlah guli ialah?',answer:ans8,visual:null},distractors:shuffle(rng,ds8),meta:{archetype:'choose_reasonable_context_estimate',hintMs:'Anggaran tidak perlu kira satu demi satu; gunakan nilai rujukan setiap bekas.',fingerprint:fp(m,est2,[per,count])}};
  }
  if(m==='round_symbolic'||m==='round_number_line'||m==='round_reason'){
    var rn=ensureRoundN(rng),rto=nearest1000(rn),lo=Math.floor(rn/1000)*1000,hi=lo+1000;
    if(hi>10000){hi=10000;}
    var ans9=m==='round_reason'?choice('reason',rn+' lebih hampir kepada '+rto+' berbanding ribu yang satu lagi.'):choice(rto,String(rto));
    var ds9;
    if(m==='round_reason'){
      var other=rto===lo?hi:lo;
      ds9=[
        choice('other',rn+' lebih hampir kepada '+other+'.','rounding_midpoint'),
        choice('hundred','Lihat digit sa sahaja untuk membundar kepada ribu terdekat.','rounding_midpoint'),
        choice('alwaysup','Semua nombor empat digit mesti dibundar naik.','rounding_midpoint')
      ];
    }else{
      ds9=numChoices(rto,[lo,hi,rto+1000,rto-1000],'rounding_midpoint');
    }
    return{value:{promptMs:m==='round_reason'?'Mengapakah '+rn+' dibundarkan kepada '+rto+'?':'Bundarkan '+rn+' kepada ribu terdekat.',answer:ans9,visual:m==='round_symbolic'?null:{kind:'number_line',min:lo,max:hi,value:rn}},distractors:shuffle(rng,ds9),meta:{archetype:m==='round_symbolic'?'round_number_symbolically':m==='round_number_line'?'round_on_number_line':'explain_nearest_thousand',hintMs:'Bandingkan jarak nombor kepada dua ribu yang berjiran.',fingerprint:fp(m,rto,[rn,lo,hi])}};
  }
  if(m==='pattern_step'||m==='pattern_next'||m==='pattern_reverse'){
    var step=pick(rng,[1,10,100,1000]),dir=m==='pattern_reverse'?-1:1,start=dir>0?ri(rng,1000,Math.max(1000,9999-step*4)):ri(rng,1000+step*4,9999);
    var seq=[];for(var pi=0;pi<4;pi++)seq.push(start+dir*step*pi);
    if(m==='pattern_step'){
      var label=(dir>0?'Tambah ':'Tolak ')+step,ans10=choice(label,label);
      var opts=[1,10,100,1000].filter(function(z){return z!==step;}).slice(0,3).map(function(z){return choice(z,(dir>0?'Tambah ':'Tolak ')+z,'pattern_step_confusion');});
      return{value:{promptMs:'Apakah pola nombor bagi urutan ini?',answer:ans10,visual:seqVisual(seq)},distractors:shuffle(rng,opts),meta:{archetype:'identify_pattern_step',hintMs:'Cari beza antara dua nombor yang bersebelahan.',fingerprint:fp(m,label,seq)}};
    }
    var nxt=start+dir*step*4,ans11=choice(nxt,String(nxt)),ds11=numChoices(nxt,[nxt+step,nxt-step,nxt+dir*10,nxt-dir*10],'pattern_step_confusion');
    return{value:{promptMs:m==='pattern_reverse'?'Corak nombor ini menurun. Apakah nombor seterusnya?':'Apakah nombor seterusnya dalam pola ini?',answer:ans11,visual:seqVisual(seq)},distractors:shuffle(rng,ds11),meta:{archetype:m==='pattern_reverse'?'recognize_descending_place_value_pattern':'predict_next_place_value_step',hintMs:'Gunakan beza yang sama pada setiap langkah.',fingerprint:fp(m,nxt,seq)}};
  }
  if(m==='pattern_missing'||m==='pattern_error'||m==='pattern_rule'){
    var st=pick(rng,[1,10,100,1000]),base=ri(rng,1000,Math.max(1000,9999-st*5)),seq2=[];for(var qi=0;qi<5;qi++)seq2.push(base+st*qi);
    if(m==='pattern_missing'){
      var mi=ri(rng,1,3),target=seq2[mi],shown=seq2.slice();shown[mi]=null;
      var ans12=choice(target,String(target)),ds12=numChoices(target,[target-st,target+st,target+10],'pattern_step_confusion');
      return{value:{promptMs:'Lengkapkan nombor yang hilang dalam pola ini.',answer:ans12,visual:seqVisual(shown,mi)},distractors:shuffle(rng,ds12),meta:{archetype:'complete_missing_pattern_term',hintMs:'Cari beza tetap antara nombor yang diketahui.',fingerprint:fp(m,target,seq2)}};
    }
    if(m==='pattern_error'){
      var ei=ri(rng,1,3),errOffset=st===1?10:Math.max(1,Math.floor(st/10)),wrongv=seq2[ei]+errOffset,shown2=seq2.slice();shown2[ei]=wrongv;
      var ans13=choice(wrongv,String(wrongv));
      var others=shown2.filter(function(v,ix){return ix!==ei;}).slice(0,3).map(function(v){return choice(v,String(v),'pattern_step_confusion');});
      return{value:{promptMs:'Satu nombor tidak mengikut pola. Nombor manakah yang salah?',answer:ans13,visual:seqVisual(shown2)},distractors:shuffle(rng,others),meta:{archetype:'find_incorrect_pattern_term',hintMs:'Semak beza setiap pasangan nombor bersebelahan.',fingerprint:fp(m,wrongv,shown2)}};
    }
    var rule='Tambah '+st,ans14=choice(rule,rule),alts=shuffle(rng,[1,10,100,1000].filter(function(v){return v!==st;})).slice(0,3).map(function(v){return choice(v,'Tambah '+v,'pattern_step_confusion');});
    return{value:{promptMs:'Peraturan manakah membina pola '+seq2.join(', ')+'?',answer:ans14,visual:null},distractors:alts,meta:{archetype:'choose_pattern_rule',hintMs:'Tolak dua nombor bersebelahan untuk mencari langkah pola.',fingerprint:fp(m,rule,seq2)}};
  }

  // T4 — Wang
  if(m==='money_add'){
    var prices=[ri(rng,250,2500),ri(rng,300,3000),ri(rng,150,1800)],total=prices[0]+prices[1]+prices[2];
    return{value:{promptMs:'Berapakah jumlah harga ketiga-tiga barang?',answer:choice(total,money(total)),visual:{kind:'money_items',amounts:prices.map(money)}},distractors:shuffle(rng,moneyWrong(total,[total-prices[2],total+500,total-500],'money_operation_confusion')),meta:{archetype:'add_multiple_money_values',hintMs:'Tambah semua nilai wang dengan titik perpuluhan selari.',fingerprint:fp(m,total,prices)}};
  }
  if(m==='money_subtract'){
    var spend=ri(rng,1000,6000),budget=Math.ceil((spend+ri(rng,500,3000))/500)*500,left=budget-spend;
    return{value:{promptMs:'Aina mempunyai '+money(budget)+' dan membelanjakan '+money(spend)+'. Berapakah baki wangnya?',answer:choice(left,money(left)),visual:{kind:'money_budget',start:money(budget),changes:[{label:'Belanja',amount:'− '+money(spend)}]}},distractors:shuffle(rng,moneyWrong(left,[budget+spend,spend,left+500],'money_operation_confusion')),meta:{archetype:'subtract_money_from_budget',hintMs:'Baki = wang asal − jumlah dibelanjakan.',fingerprint:fp(m,left,[budget,spend])}};
  }
  if(m==='money_compare'){
    var a1=ri(rng,500,2500),a2=ri(rng,500,2500),b1=ri(rng,500,2500),b2=ri(rng,500,2500),ta=a1+a2,tb=b1+b2;if(ta===tb)b2+=100,tb+=100;
    var winner=ta>tb?'Resit A':'Resit B',ans15=choice(winner,winner+' mempunyai jumlah lebih besar.');
    var ds15=[
      choice('other',(winner==='Resit A'?'Resit B':'Resit A')+' mempunyai jumlah lebih besar.','money_operation_confusion'),
      choice('equal','Kedua-dua jumlah adalah sama.','money_operation_confusion'),
      choice('first','Cukup bandingkan harga barang pertama sahaja.','money_operation_confusion')
    ];
    return{value:{promptMs:'Resit manakah mempunyai jumlah perbelanjaan lebih besar?',answer:ans15,visual:{kind:'money_receipts',a:[money(a1),money(a2)],b:[money(b1),money(b2)]}},distractors:shuffle(rng,ds15),meta:{archetype:'compare_two_money_totals',hintMs:'Jumlahkan setiap resit dahulu, kemudian bandingkan.',fingerprint:fp(m,winner,[ta,tb])}};
  }
  if(m==='money_mixed_change'){
    var p1=ri(rng,300,2000),p2=ri(rng,300,2000),cost=p1+p2,pay=Math.ceil((cost+500)/1000)*1000,chg=pay-cost;
    return{value:{promptMs:'Mira membeli dua barang ini dan membayar '+money(pay)+'. Berapakah baki?',answer:choice(chg,money(chg)),visual:{kind:'money_items',amounts:[money(p1),money(p2)],payment:money(pay)}},distractors:shuffle(rng,moneyWrong(chg,[pay-p1,pay-p2,cost],'money_operation_confusion')),meta:{archetype:'purchase_then_find_change',hintMs:'Tambah harga kedua-dua barang, kemudian tolak daripada bayaran.',fingerprint:fp(m,chg,[p1,p2,pay])}};
  }
  if(m==='money_mixed_budget'){
    var start=ri(rng,3000,8000),spent1=ri(rng,500,1500),receive=ri(rng,300,1200),spent2=ri(rng,300,1200),final=start-spent1+receive-spent2;
    return{value:{promptMs:'Ikut perubahan wang pada kad. Berapakah wang akhir?',answer:choice(final,money(final)),visual:{kind:'money_budget',start:money(start),changes:[{label:'Belanja',amount:'− '+money(spent1)},{label:'Terima',amount:'+ '+money(receive)},{label:'Belanja',amount:'− '+money(spent2)}]}},distractors:shuffle(rng,moneyWrong(final,[start-spent1-receive-spent2,start+spent1+receive-spent2,start-spent1+receive+spent2],'money_operation_confusion')),meta:{archetype:'track_budget_with_mixed_changes',hintMs:'Tanda + untuk wang diterima dan − untuk wang dibelanjakan.',fingerprint:fp(m,final,[start,spent1,receive,spent2])}};
  }
  if(m==='money_mixed_error'){
    var base=ri(rng,4000,9000),sp=ri(rng,500,1800),inc=ri(rng,300,1200),correct=base-sp+inc;
    var ans16=choice(correct,money(correct)),ds16=moneyWrong(correct,[base+sp+inc,base-sp-inc,base+sp-inc],'money_operation_confusion');
    return{value:{promptMs:'Hakim ada '+money(base)+', berbelanja '+money(sp)+' dan kemudian menerima '+money(inc)+'. Apakah jumlah wang yang betul sekarang?',answer:ans16,visual:null},distractors:shuffle(rng,ds16),meta:{archetype:'identify_correct_mixed_money_result',hintMs:'Perbelanjaan ditolak; wang diterima ditambah.',fingerprint:fp(m,correct,[base,sp,inc])}};
  }
  if(m==='money_multiply'){
    var price=ri(rng,150,1500),qty=ri(rng,2,6),tot=price*qty;
    return{value:{promptMs:'Setiap barang berharga '+money(price)+'. Berapakah harga '+qty+' barang yang sama?',answer:choice(tot,money(tot)),visual:{kind:'money_items',amounts:Array(qty).fill(money(price))}},distractors:shuffle(rng,moneyWrong(tot,[price+qty,price*(qty-1),price*(qty+1)],'money_operation_confusion')),meta:{archetype:'multiply_equal_item_prices',hintMs:'Harga sama berulang boleh dikira dengan darab.',fingerprint:fp(m,tot,[price,qty])}};
  }
  if(m==='money_divide'){
    var people=ri(rng,2,6),share=ri(rng,200,1500),tot2=people*share;
    return{value:{promptMs:money(tot2)+' dibahagi sama rata kepada '+people+' orang. Setiap orang mendapat berapa?',answer:choice(share,money(share)),visual:{kind:'money_share',total:money(tot2),groups:people}},distractors:shuffle(rng,moneyWrong(share,[tot2-people,share+100,share-100],'money_operation_confusion')),meta:{archetype:'divide_money_equally',hintMs:'Bahagi jumlah wang dengan bilangan orang.',fingerprint:fp(m,share,[tot2,people])}};
  }
  if(m==='money_unit_price'){
    var qn=ri(rng,2,6),unit=ri(rng,200,1200),all=qn*unit;
    return{value:{promptMs:qn+' barang yang sama berharga '+money(all)+' semuanya. Harga satu barang ialah?',answer:choice(unit,money(unit)),visual:{kind:'money_items',amounts:[money(all)],quantity:qn}},distractors:shuffle(rng,moneyWrong(unit,[all-qn,unit+100,unit*2],'money_operation_confusion')),meta:{archetype:'find_unit_price_from_total',hintMs:'Harga satu = jumlah harga ÷ bilangan barang.',fingerprint:fp(m,unit,[all,qn])}};
  }
  if(m==='currency_country_to_name'||m==='currency_name_to_country'||m==='currency_code_match'){
    var c=pick(rng,ASEAN),pool=shuffle(rng,ASEAN.filter(function(z){return z.country!==c.country;})).slice(0,3);
    var prompt,answer,ds;
    if(m==='currency_country_to_name'){prompt='Apakah mata wang negara '+c.country+'?';answer=choice(c.currency,c.currency);ds=pool.map(function(z){return choice(z.currency,z.currency,'currency_country_confusion');});}
    else if(m==='currency_name_to_country'){prompt='Mata wang '+c.currency+' digunakan oleh negara mana?';answer=choice(c.country,c.country);ds=pool.map(function(z){return choice(z.country,z.country,'currency_country_confusion');});}
    else{prompt='Kod '+c.code+' merujuk kepada mata wang yang mana?';answer=choice(c.currency,c.currency);ds=pool.map(function(z){return choice(z.currency,z.currency,'currency_country_confusion');});}
    return{value:{promptMs:prompt,answer:answer,visual:{kind:'currency_card',country:c.country,currency:c.currency,code:c.code}},distractors:shuffle(rng,ds),meta:{archetype:m==='currency_country_to_name'?'country_to_currency':m==='currency_name_to_country'?'currency_to_country':'match_currency_code_to_name',hintMs:'Padankan negara, nama mata wang dan kodnya.',fingerprint:fp(m,answer.id,[c.country,c.currency,c.code])}};
  }
  if(m==='needs_identify'){
    var need=pick(rng,['Beras','Ubat ketika sakit','Buku sekolah','Air minuman']),wants=shuffle(rng,['Mainan baharu','Permainan video','Aksesori hiasan','Gula-gula','Patung koleksi']).slice(0,3);
    var opts=shuffle(rng,[need].concat(wants)),ans17=choice(need,need),ds17=opts.filter(function(z){return z!==need;}).map(function(z){return choice(z,z,'need_want_confusion');});
    return{value:{promptMs:'Yang manakah paling jelas merupakan KEPERLUAN?',answer:ans17,visual:{kind:'needs_wants',items:opts}},distractors:ds17,meta:{archetype:'identify_need_among_choices',hintMs:'Keperluan penting untuk hidup, kesihatan atau belajar; kehendak boleh ditangguhkan.',fingerprint:fp(m,need,opts)}};
  }
  if(m==='needs_saving_choice'){
    var ans18=choice('save','Beli barang keperluan dahulu dan simpan baki untuk matlamat yang lebih penting.');
    var ds18=[
      choice('want','Habiskan semua wang pada barang kehendak hari ini.','need_want_confusion'),
      choice('borrow','Pinjam wang supaya boleh membeli semua kehendak.','need_want_confusion'),
      choice('ignore','Abaikan barang keperluan supaya baki boleh digunakan untuk permainan.','need_want_confusion')
    ];
    return{value:{promptMs:'Sara mempunyai wang terhad. Dia perlu membeli buku latihan tetapi juga mahu mainan baharu. Pilihan manakah paling bijak?',answer:ans18,visual:{kind:'money_budget',start:'Wang terhad',changes:[{label:'Keperluan',amount:'Buku latihan'},{label:'Kehendak',amount:'Mainan'}]}},distractors:shuffle(rng,ds18),meta:{archetype:'choose_sensible_saving_decision',hintMs:'Utamakan keperluan dan fikirkan simpanan sebelum kehendak.',fingerprint:fp(m,'save',[])}};
  }
  if(m==='needs_priority_reason'){
    var ans19=choice('reason','Keperluan membantu aktiviti penting dan patut didahulukan sebelum kehendak.');
    var ds19=[
      choice('expensive','Barang yang lebih mahal sentiasa perlu dibeli dahulu.','need_want_confusion'),
      choice('fun','Barang yang paling menyeronokkan mesti didahulukan.','need_want_confusion'),
      choice('spend','Wang simpanan sepatutnya dihabiskan secepat mungkin.','need_want_confusion')
    ];
    return{value:{promptMs:'Mengapakah kasut sekolah yang rosak patut diganti sebelum membeli permainan baharu?',answer:ans19,visual:null},distractors:shuffle(rng,ds19),meta:{archetype:'explain_need_before_want',hintMs:'Bezakan perkara yang diperlukan untuk aktiviti penting dengan perkara yang hanya diingini.',fingerprint:fp(m,'reason',[])}};
  }

  // T8 — Koordinat / kedudukan
  if(m.indexOf('coord_')===0){
    var objects=gridObjects(rng),ref=objects[0],target=objects[1],dx,dy;
    if(m==='coord_relative_direction'||m==='coord_relative_distance'){
      var dirs=[[1,0],[-1,0],[0,1],[0,-1]],d=pick(rng,dirs),dist=m==='coord_relative_distance'?ri(rng,1,2):1;
      target={name:target.name,x:Math.max(1,Math.min(5,ref.x+d[0]*dist)),y:Math.max(1,Math.min(5,ref.y+d[1]*dist))};
      // If clamping collapses, reset around safe center.
      if(target.x===ref.x&&target.y===ref.y){ref={name:ref.name,x:3,y:3};target={name:target.name,x:3+d[0]*dist,y:3+d[1]*dist};}
      objects[0]=ref;objects[1]=target;dx=target.x-ref.x;dy=target.y-ref.y;
      var correctDir=dirText(dx,dy),ans20=choice(correctDir,correctDir);
      var candidates=[dirText(-dx,-dy),dx!==0?Math.abs(dx)+' petak ke atas':Math.abs(dy)+' petak ke kanan',dx!==0?Math.abs(dx)+' petak ke bawah':Math.abs(dy)+' petak ke kiri'];
      var ds20=candidates.map(function(z,i){return choice('d'+i,z,'direction_distance_confusion');});
      return{value:{promptMs:'Kedudukan '+target.name+' berbanding '+ref.name+' ialah?',answer:ans20,visual:{kind:'coordinate_grid',objects:objects,highlight:[ref.name,target.name]}},distractors:shuffle(rng,ds20),meta:{archetype:m==='coord_relative_direction'?'describe_cardinal_relative_position':'describe_relative_distance',hintMs:'Gunakan objek rujukan dahulu, kemudian kira petak mengufuk atau mencancang.',fingerprint:fp(m,correctDir,[ref.x,ref.y,target.x,target.y])}};
    }
    if(m==='coord_relative_compare'){
      dx=target.x-ref.x;dy=target.y-ref.y;
      // force same row/column for clear Year 3 relation
      if(rng()<0.5){target.y=ref.y;if(target.x===ref.x)target.x=ref.x===5?4:ref.x+1;}else{target.x=ref.x;if(target.y===ref.y)target.y=ref.y===5?4:ref.y+1;}
      dx=target.x-ref.x;dy=target.y-ref.y;objects[1]=target;
      var txt=dirText(dx,dy),ans21=choice(txt,txt);
      var ds21=[choice('op',dirText(-dx,-dy),'reference_point_confusion'),choice('swap',dx!==0?Math.abs(dx)+' petak ke atas':Math.abs(dy)+' petak ke kanan','horizontal_vertical_confusion'),choice('zero','Kedua-dua objek berada di tempat yang sama.','reference_point_confusion')];
      return{value:{promptMs:'Lihat dua objek yang ditanda. Bagaimanakah kedudukan '+target.name+' daripada '+ref.name+'?',answer:ans21,visual:{kind:'coordinate_grid',objects:objects,highlight:[ref.name,target.name]}},distractors:shuffle(rng,ds21),meta:{archetype:'compare_two_object_positions',hintMs:'Pastikan arah dibaca dari objek rujukan yang disebut dalam soalan.',fingerprint:fp(m,txt,[ref.x,ref.y,target.x,target.y])}};
    }
    if(m==='coord_identify_axes'||m==='coord_identify_clue'){
      var t=pick(rng,objects),ans22=choice(t.name,t.name),others=objects.filter(function(o){return o.name!==t.name;}).map(function(o){return choice(o.name,o.name,'horizontal_vertical_confusion');});
      var pr=m==='coord_identify_axes'?'Objek manakah berada pada mengufuk '+t.x+' dan mencancang '+t.y+'?':'Cari objek pada persilangan lajur mengufuk '+t.x+' dengan baris mencancang '+t.y+'.';
      return{value:{promptMs:pr,answer:ans22,visual:{kind:'coordinate_grid',objects:objects}},distractors:shuffle(rng,others),meta:{archetype:m==='coord_identify_axes'?'identify_object_at_axis_intersection':'identify_object_from_axis_clue',hintMs:'Cari nilai mengufuk dahulu, kemudian nilai mencancang.',fingerprint:fp(m,t.name,[t.x,t.y])}};
    }
    if(m==='coord_match_description'){
      var t2=pick(rng,objects),ans23=choice(t2.name,t2.name),ds23=objects.filter(function(o){return o.name!==t2.name;}).map(function(o){return choice(o.name,o.name,'horizontal_vertical_confusion');});
      return{value:{promptMs:'Objek manakah sepadan dengan kedudukan "'+coordLabel(t2.x,t2.y)+'"?',answer:ans23,visual:{kind:'coordinate_grid',objects:objects}},distractors:shuffle(rng,ds23),meta:{archetype:'match_object_to_position_description',hintMs:'Padankan nilai mengufuk dan mencancang dengan petak objek.',fingerprint:fp(m,t2.name,[t2.x,t2.y])}};
    }
    if(m==='coord_read_position'){
      var t3=pick(rng,objects),ans24=choice(coordLabel(t3.x,t3.y),coordLabel(t3.x,t3.y));
      var opts2=shuffle(rng,objects.filter(function(o){return o.name!==t3.name;})).slice(0,2).map(function(o){return choice(o.name,coordLabel(o.x,o.y),'horizontal_vertical_confusion');});
      opts2.push(choice('swap',coordLabel(t3.y,t3.x),'horizontal_vertical_confusion'));
      // de-dup swap if x==y
      var seen2=Object.create(null),ds24=[];for(var z=0;z<opts2.length;z++){var lab=opts2[z].labelMs;if(lab!==ans24.labelMs&&!seen2[lab]){seen2[lab]=1;ds24.push(opts2[z]);}}
      for(var xx=1;ds24.length<3&&xx<=5;xx++){var lab2=coordLabel(xx,t3.y);if(lab2!==ans24.labelMs&&!seen2[lab2]){seen2[lab2]=1;ds24.push(choice('f'+xx,lab2,'horizontal_vertical_confusion'));}}
      return{value:{promptMs:'Apakah kedudukan '+t3.name+'?',answer:ans24,visual:{kind:'coordinate_grid',objects:objects,highlight:[t3.name]}},distractors:shuffle(rng,ds24.slice(0,3)),meta:{archetype:'read_horizontal_vertical_position',hintMs:'Baca mengufuk dahulu, kemudian mencancang.',fingerprint:fp(m,ans24.labelMs,[t3.x,t3.y])}};
    }
    if(m==='coord_moves_to_target'){
      var r={name:'Mula',x:ri(rng,2,4),y:ri(rng,2,4)},tdir=pick(rng,[[1,0],[-1,0],[0,1],[0,-1]]),dist2=ri(rng,1,Math.min(2,tdir[0]!==0?(tdir[0]>0?5-r.x:r.x-1):(tdir[1]>0?5-r.y:r.y-1)));if(dist2<1)dist2=1;
      var tt={name:'Sasaran',x:r.x+tdir[0]*dist2,y:r.y+tdir[1]*dist2},move=dirText(tt.x-r.x,tt.y-r.y),ans25=choice(move,move);
      var ds25=[choice('rev',dirText(r.x-tt.x,r.y-tt.y),'direction_distance_confusion'),choice('swap',tdir[0]!==0?dist2+' petak ke atas':dist2+' petak ke kanan','horizontal_vertical_confusion'),choice('extra',(dist2+1)+' petak '+(tdir[0]>0?'ke kanan':tdir[0]<0?'ke kiri':tdir[1]>0?'ke atas':'ke bawah'),'direction_distance_confusion')];
      return{value:{promptMs:'Gerakan manakah membawa Mula ke Sasaran?',answer:ans25,visual:{kind:'coordinate_grid',objects:[r,tt],highlight:['Mula','Sasaran']}},distractors:shuffle(rng,ds25),meta:{archetype:'choose_moves_to_target',hintMs:'Kira bilangan petak dan semak arah gerakan.',fingerprint:fp(m,move,[r.x,r.y,tt.x,tt.y])}};
    }
    if(m==='coord_follow_moves'){
      var sx=ri(rng,2,4),sy=ri(rng,2,4),dx2=pick(rng,[-1,1])*1,dy2=pick(rng,[-1,1])*1,tx=sx+dx2,ty=sy+dy2;
      var answerPos=coordLabel(tx,ty),ans26=choice(answerPos,answerPos);
      var candPos=[[ty,tx],[tx,sy],[sx,ty],[sx,sy],[Math.max(1,Math.min(5,tx+1)),ty],[tx,Math.max(1,Math.min(5,ty+1))]];
      var seenPos=Object.create(null),ds26=[];
      for(var cp=0;cp<candPos.length&&ds26.length<3;cp++){
        var labp=coordLabel(candPos[cp][0],candPos[cp][1]);
        if(labp!==answerPos&&!seenPos[labp]){seenPos[labp]=1;ds26.push(choice('p'+cp,labp,cp===0?'horizontal_vertical_confusion':'direction_distance_confusion'));}
      }
      for(var fx=1;ds26.length<3&&fx<=5;fx++){for(var fy=1;ds26.length<3&&fy<=5;fy++){var fill=coordLabel(fx,fy);if(fill!==answerPos&&!seenPos[fill]){seenPos[fill]=1;ds26.push(choice('f'+fx+'_'+fy,fill,'direction_distance_confusion'));}}}
      return{value:{promptMs:'Bermula pada '+coordLabel(sx,sy)+', bergerak 1 petak '+(dx2>0?'ke kanan':'ke kiri')+' dan 1 petak '+(dy2>0?'ke atas':'ke bawah')+'. Di manakah kedudukan akhir?',answer:ans26,visual:{kind:'coordinate_grid',objects:[{name:'Mula',x:sx,y:sy}],highlight:['Mula']}},distractors:shuffle(rng,ds26),meta:{archetype:'locate_after_movement_instruction',hintMs:'Ubah nilai mengufuk mengikut kiri/kanan dan nilai mencancang mengikut atas/bawah.',fingerprint:fp(m,answerPos,[sx,sy,dx2,dy2])}};
    }
  }

  throw new Error('d3.fullKssr: unknown mode "'+m+'"');
});
})();