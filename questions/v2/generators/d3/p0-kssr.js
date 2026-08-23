// questions/v2/generators/d3/p0-kssr.js
// Phase 3A-1: authored SHADOW bank for Darjah 3 P0 topics.
// Pure authored source: no Node/browser globals.
(function(){
'use strict';
function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(rng,a){return a[Math.floor(rng()*a.length)];}
function shuffle(rng,a){var o=a.slice();for(var i=o.length-1;i>0;i--){var j=Math.floor(rng()*(i+1)),t=o[i];o[i]=o[j];o[j]=t;}return o;}
function gcd(a,b){while(b){var t=a%b;a=b;b=t;}return Math.abs(a);}
function ch(id,label,tag){return{id:String(id),labelMs:String(label),misconceptionTag:tag||null};}
function fp(arch,parts){return arch+'::'+parts.map(String).join('::');}
function uniqLabels(answer,wrong){
  var vals=[answer.labelMs].concat(wrong.map(function(x){return x.labelMs;})).map(function(x){return String(x).trim().toLowerCase();});
  return new Set(vals).size===4;
}
function pack(prompt,answer,wrong,visual,arch,hint,mis,semantic){
  if(!uniqLabels(answer,wrong))throw new Error('d3.p0Kssr duplicate choices '+arch);
  return {value:{promptMs:prompt,answer:answer,visual:visual||null},distractors:wrong,
    meta:{archetype:arch,hintMs:hint||'Baca maklumat satu demi satu.',misconceptionTargets:mis||[],semanticProperties:semantic||{},fingerprint:fp(arch,[answer.id].concat(Object.keys(semantic||{}).sort().map(function(k){return semantic[k];})))}
  };
}
function numPack(prompt,ans,wrongs,visual,arch,hint,mis,fmt,semantic){
  fmt=fmt||function(x){return String(x);};
  var seen={};seen[fmt(ans)]=1;var ws=[];
  for(var i=0;i<wrongs.length&&ws.length<3;i++){var s=fmt(wrongs[i]);if(!seen[s]){seen[s]=1;ws.push(ch('w'+ws.length,s,mis&&mis[0]));}}
  var delta=1;while(ws.length<3){var s2=fmt(ans+delta);delta++;if(!seen[s2]){seen[s2]=1;ws.push(ch('w'+ws.length,s2,mis&&mis[0]));}}
  return pack(prompt,ch('a',fmt(ans)),shuffle(function(){return 0.5;},ws),visual,arch,hint,mis,semantic||{answer:ans});
}
function pctWords(n){
  var small=['sifar','satu','dua','tiga','empat','lima','enam','tujuh','lapan','sembilan','sepuluh','sebelas'];
  function w(x){if(x<12)return small[x];if(x<20)return small[x-10]+' belas';if(x<100){var t=Math.floor(x/10),r=x%10;return small[t]+' puluh'+(r?' '+small[r]:'');}return 'seratus';}
  return w(n)+' peratus';
}
function frac(n,d){return n+'/'+d;}
function decimal2(n){return (Math.round(n*100)/100).toFixed(2);}
function timeLabel(mins){var h=Math.floor(mins/60),m=mins%60;return h+' jam'+(m?' '+m+' minit':'');}
function clockLabel(h,m){return h+':'+String(m).padStart(2,'0');}
function unitVisual(kind,value,max,label){return {kind:kind,value:value,max:max||value,label:label||''};}
function barVisual(parts,labels){return {kind:'bar_model',parts:parts,labels:labels||[]};}
function groupingVisual(groups,each){return {kind:'grouping',groups:groups,each:each};}
function fractionVisual(n,d,count){return {kind:'fraction_area',numerator:n,denominator:d,count:count||1};}
function gridVisual(shaded){return {kind:'hundred_grid',shaded:shaded};}
function lineVisual(values,marks){return {kind:'number_line',values:values,marks:marks||[]};}
function clockVisual(h,m){return {kind:'clock',hour:h,minute:m};}
function timelineVisual(start,end,markers){return {kind:'timeline',start:start,end:end,markers:markers||[]};}
function tableVisual(headers,rows){return {kind:'table',headers:headers,rows:rows};}
function pieVisual(labels,values){return {kind:'pie_chart',labels:labels,values:values};}
function barChartVisual(labels,values){return {kind:'bar_chart',labels:labels,values:values};}
function pictographVisual(labels,values,key){return {kind:'pictograph',labels:labels,values:values,key:key||1};}

registerGenerator('d3.p0Kssr',function(params,rng){
  var c=params&&params.competencyId,m=params&&params.mode;
  if(!c||!m)throw new Error('d3.p0Kssr missing competencyId/mode');

  // D3.T2 — Operasi Asas
  if(c==='solve_addition_subtraction_word_problems'){
    if(m==='context_result'){
      var add=rng()<0.5,a=ri(rng,1200,5200),b=ri(rng,300,1800),ans=add?a+b:a-b;if(!add&&b>a){var z=a;a=b;b=z;ans=a-b;}
      var p=add?'Perpustakaan mempunyai '+a+' buku. Sebanyak '+b+' buku baharu diterima. Berapakah jumlah buku sekarang?':'Sebuah stor mempunyai '+a+' kotak. '+b+' kotak dihantar keluar. Berapakah kotak yang tinggal?';
      return numPack(p,ans,[add?a-b:a+b,Math.abs(ans-100),ans+100],barVisual([a,b],[add?'asal':'jumlah',add?'tambah':'keluar']),'word_problem_result','Tentukan sama ada kuantiti bertambah atau berkurang.',['operation_selection'],null,{a:a,b:b,op:add?'add':'sub'});
    }
    if(m==='missing_part_bar'){
      var whole=ri(rng,3500,9000),part=ri(rng,800,whole-800),ans2=whole-part;
      return numPack('Jumlah dua kumpulan ialah '+whole+'. Satu kumpulan mempunyai '+part+'. Berapakah kumpulan yang satu lagi?',ans2,[whole+part,part,whole-part+100],barVisual([part,ans2],['diketahui','?']),'word_problem_missing_part','Jumlah = bahagian diketahui + bahagian yang dicari.',['part_whole_confusion'],null,{whole:whole,part:part});
    }
    if(m==='choose_operation'){
      var x=ri(rng,1200,6000),y=ri(rng,300,1200);
      var ans3=ch('subtract','Tolak');
      return pack('Ali mempunyai '+x+' keping kad. Dia memberikan '+y+' keping kepada kawannya. Operasi manakah patut digunakan untuk mencari baki?',ans3,[ch('add','Tambah','operation_selection'),ch('multiply','Darab','operation_selection'),ch('divide','Bahagi','operation_selection')],null,'choose_operation_from_context','Perkataan “memberikan” menunjukkan kuantiti berkurang.',['operation_selection'],{x:x,y:y});
    }
  }

  if(c==='solve_mixed_addition_subtraction_problems'){
    if(m==='add_then_subtract'){
      var a1=ri(rng,1500,4000),b1=ri(rng,500,1800),c1=ri(rng,300,1200),ans4=a1+b1-c1;
      return numPack('Sebuah pusat mengumpul '+a1+' botol pada Isnin dan '+b1+' pada Selasa. Kemudian '+c1+' botol dihantar untuk kitar semula. Berapakah yang masih ada?',ans4,[a1+b1+c1,a1-b1+c1,a1+b1],barVisual([a1,b1,-c1],['Isnin','Selasa','keluar']),'mixed_add_then_subtract','Buat operasi mengikut urutan cerita: tambah dahulu, kemudian tolak.',['operation_order'],null,{a:a1,b:b1,c:c1});
    }
    if(m==='subtract_then_add'){
      var a2=ri(rng,4500,8500),b2=ri(rng,600,1800),c2=ri(rng,400,1500),ans5=a2-b2+c2;
      return numPack('Stok awal ialah '+a2+'. Sebanyak '+b2+' digunakan, kemudian '+c2+' stok baharu diterima. Berapakah stok akhir?',ans5,[a2-b2-c2,a2+b2+c2,a2+c2],barVisual([a2,-b2,c2],['awal','guna','terima']),'mixed_subtract_then_add','Ikut perubahan stok satu demi satu.',['operation_order'],null,{a:a2,b:b2,c:c2});
    }
    if(m==='choose_expression'){
      var aa=ri(rng,3000,6000),bb=ri(rng,400,1200),cc=ri(rng,200,900),lab=aa+' − '+bb+' + '+cc;
      return pack('Mula dengan '+aa+' unit. '+bb+' unit digunakan dan kemudian '+cc+' unit ditambah. Ungkapan manakah mewakili situasi itu?',ch('correct',lab),[
        ch('w1',aa+' + '+bb+' + '+cc,'operation_order'),ch('w2',aa+' − ('+bb+' + '+cc+')','operation_order'),ch('w3',aa+' + '+bb+' − '+cc,'operation_order')
      ],barVisual([aa,-bb,cc],['mula','guna','tambah']),'choose_expression_for_two_step','Padankan setiap perubahan cerita dengan tanda operasi.',['operation_order'],{a:aa,b:bb,c:cc});
    }
  }

  if(c==='multiply_divide_numbers_by_1digit_powers10'){
    if(m==='one_digit'){
      var mult=rng()<0.5,f=ri(rng,2,8),n=ri(rng,120,1100),prod=f*n;
      if(mult)return numPack(n+' × '+f+' = ?',prod,[n+f,n*(f-1),prod+f],groupingVisual(f,n),'multiply_divide_one_digit','Darab ialah penambahan kumpulan yang sama banyak.',['multiply_divide_inverse'],null,{n:n,f:f,op:'mul'});
      var q=ri(rng,120,1100),div=ri(rng,2,8),total=q*div;
      return numPack(total+' ÷ '+div+' = ?',q,[div,q+1,Math.max(1,q-1)],groupingVisual(div,q),'multiply_divide_one_digit','Gunakan hubungan darab dan bahagi.',['multiply_divide_inverse'],null,{total:total,div:div,op:'div'});
    }
    if(m==='powers10'){
      var base=ri(rng,2,90),pow=pick(rng,[10,100,1000]),mul=rng()<0.5,an=mul?base*pow:base;
      var prompt=mul?base+' × '+pow+' = ?':(base*pow)+' ÷ '+pow+' = ?';
      return numPack(prompt,an,[base*(pow/10),base+pow,base*10],{kind:'place_value_shift',base:base,factor:pow,operation:mul?'mul':'div'},'multiply_divide_powers10','Perhatikan perubahan nilai tempat apabila darab atau bahagi 10, 100 atau 1000.',['zero_place_value'],null,{base:base,pow:pow,op:mul?'mul':'div'});
    }
    if(m==='missing_factor'){
      var g=ri(rng,2,9),each=ri(rng,20,300),tot=g*each;
      return numPack('□ × '+g+' = '+tot+'. Apakah nombor dalam kotak?',each,[g,tot,each+g],groupingVisual(g,each),'inverse_missing_factor','Gunakan bahagi untuk mencari faktor yang hilang.',['multiply_divide_inverse'],null,{g:g,each:each,total:tot});
    }
  }

  // D3.T3 — Pecahan, Perpuluhan dan Peratus
  if(c==='identify_equivalent_fractions'){
    var d=pick(rng,[2,3,4,5]),n1=ri(rng,1,d-1),k=pick(rng,[2,3]),en=n1*k,ed=d*k;
    if(m==='symbolic_match')return pack('Pecahan manakah setara dengan '+frac(n1,d)+'?',ch('a',frac(en,ed)),[
      ch('w1',frac(n1,ed),'scale_one_part_only'),ch('w2',frac(en,d),'scale_one_part_only'),ch('w3',frac(n1+k,d+k),'scale_one_part_only')
    ],null,'equivalent_fraction_symbolic','Darab pengangka dan penyebut dengan nombor yang sama.',['scale_one_part_only'],{n:n1,d:d,k:k});
    if(m==='area_match')return pack('Rajah menunjukkan '+frac(n1,d)+'. Pecahan manakah mempunyai nilai yang sama?',ch('a',frac(en,ed)),[
      ch('w1',frac(n1,ed),'visual_fraction_equivalence'),ch('w2',frac(en,ed+1),'visual_fraction_equivalence'),ch('w3',frac(Math.min(ed-1,en+1),ed),'visual_fraction_equivalence')
    ],fractionVisual(n1,d),'equivalent_fraction_area','Banding bahagian berlorek, bukan hanya nombor penyebut.',['visual_fraction_equivalence'],{n:n1,d:d,k:k});
    if(m==='missing_number')return numPack(frac(n1,d)+' = □/'+ed+'. Apakah nombor dalam kotak?',en,[n1,k,en+1],null,'equivalent_fraction_missing_number','Cari faktor yang digunakan pada penyebut, kemudian guna faktor sama pada pengangka.',['scale_one_part_only'],null,{n:n1,d:d,k:k});
  }

  if(c==='simplify_proper_fractions'){
    var baseD=pick(rng,[3,4,5]),baseN=ri(rng,1,baseD-1);while(gcd(baseN,baseD)!==1){baseN=ri(rng,1,baseD-1);}
    var factor=pick(rng,[2,3]),sn=baseN*factor,sd=baseD*factor;
    if(m==='simplest_form')return pack('Permudahkan '+frac(sn,sd)+'.',ch('a',frac(baseN,baseD)),[
      ch('w1',frac(sn/factor,sd),'not_fully_simplified'),ch('w2',frac(sn,sd/factor),'not_fully_simplified'),ch('w3',frac(baseN+1,baseD+1),'not_fully_simplified')
    ],null,'simplify_fraction_direct','Bahagi pengangka dan penyebut dengan faktor sepunya yang sama.',['not_fully_simplified'],{n:sn,d:sd,f:factor});
    if(m==='common_factor')return pack('Untuk memudahkan '+frac(sn,sd)+' terus kepada bentuk termudah, nombor manakah sesuai digunakan untuk membahagi kedua-duanya?',ch('a',String(factor)),[
      ch('w1','1','wrong_common_factor'),ch('w2',String(factor+1),'wrong_common_factor'),ch('w3',String(factor*2+1),'wrong_common_factor')
    ],null,'identify_common_factor_for_simplification','Cari faktor yang boleh membahagi pengangka dan penyebut.',['wrong_common_factor'],{n:sn,d:sd,f:factor});
    if(m==='area_simplify')return pack('Bahagian berlorek mewakili '+frac(sn,sd)+'. Bentuk termudahnya ialah?',ch('a',frac(baseN,baseD)),[
      ch('w1',frac(sn,sd),'not_fully_simplified'),ch('w2',frac(baseN,sd),'visual_fraction_equivalence'),ch('w3',frac(sn,baseD),'visual_fraction_equivalence')
    ],fractionVisual(sn,sd),'simplify_fraction_from_area','Gabungkan bahagian yang sama untuk melihat pecahan lebih ringkas.',['visual_fraction_equivalence'],{n:sn,d:sd});
  }

  if(c==='add_subtract_proper_fractions'){
    var den=pick(rng,[4,5,6,8,10]),x1=ri(rng,1,Math.max(1,den-3)),x2=ri(rng,1,Math.max(1,den-x1-1));
    if(m==='add_same_denominator'){
      var suma=x1+x2;return pack(frac(x1,den)+' + '+frac(x2,den)+' = ?',ch('a',frac(suma,den)),[
        ch('w1',frac(suma,den*2),'add_denominators'),ch('w2',frac(x1+x2+1,den),'add_denominators'),ch('w3',frac(Math.max(1,x1-x2),den),'add_denominators')
      ],fractionVisual(suma,den),'add_proper_fractions','Penyebut sama: tambah pengangka sahaja.',['add_denominators'],{a:x1,b:x2,d:den});
    }
    if(m==='subtract_same_denominator'){
      var hi=Math.max(x1,x2)+1;if(hi>=den)hi=den-1;var lo=Math.min(x1,x2),dif=hi-lo;
      return pack(frac(hi,den)+' − '+frac(lo,den)+' = ?',ch('a',frac(dif,den)),[
        ch('w1',frac(dif,Math.max(1,den-lo)),'subtract_denominators'),ch('w2',frac(hi+lo,den),'operation_selection'),ch('w3',frac(dif+1,den),'subtract_denominators')
      ],null,'subtract_proper_fractions','Penyebut sama: tolak pengangka sahaja.',['subtract_denominators'],{a:hi,b:lo,d:den});
    }
    if(m==='context_fraction'){
      var sumc=x1+x2;
      return pack('Aina mewarnakan '+frac(x1,den)+' bahagian pada pagi dan '+frac(x2,den)+' bahagian lagi pada petang. Berapakah bahagian yang telah diwarnakan?',ch('a',frac(sumc,den)),[
        ch('w1',frac(sumc,den*2),'add_denominators'),ch('w2',frac(Math.abs(x1-x2),den),'operation_selection'),ch('w3',frac(sumc+1,den),'add_denominators')
      ],fractionVisual(sumc,den),'fraction_operation_context','Kedua-dua bahagian ditambah kerana kawasan berlorek bertambah.',['operation_selection','add_denominators'],{a:x1,b:x2,d:den});
    }
  }

  if(c==='identify_improper_fractions_and_mixed_numbers'){
    var den2=pick(rng,[2,3,4,5]),whole=ri(rng,1,3),rem=ri(rng,1,den2-1),imp=whole*den2+rem;
    if(m==='improper_to_mixed')return pack('Tukarkan '+frac(imp,den2)+' kepada nombor bercampur.',ch('a',whole+' '+frac(rem,den2)),[
      ch('w1',(whole+1)+' '+frac(rem,den2),'whole_remainder_confusion'),ch('w2',whole+' '+frac(rem,den2+1),'whole_remainder_confusion'),ch('w3',Math.max(0,whole-1)+' '+frac(rem,den2),'whole_remainder_confusion')
    ],null,'convert_improper_to_mixed','Bahagi pengangka dengan penyebut: hasil bahagi ialah nombor bulat, baki ialah pengangka pecahan.',['whole_remainder_confusion'],{imp:imp,d:den2});
    if(m==='mixed_to_improper')return pack('Tukarkan '+whole+' '+frac(rem,den2)+' kepada pecahan tak wajar.',ch('a',frac(imp,den2)),[
      ch('w1',frac(whole+rem,den2),'whole_remainder_confusion'),ch('w2',frac(imp+den2,den2),'whole_remainder_confusion'),ch('w3',frac(imp,den2+1),'whole_remainder_confusion')
    ],null,'convert_mixed_to_improper','Darab nombor bulat dengan penyebut, kemudian tambah pengangka.',['whole_remainder_confusion'],{whole:whole,rem:rem,d:den2});
    if(m==='picture_identify')return pack('Rajah menunjukkan '+whole+' bentuk penuh dan '+rem+' daripada '+den2+' bahagian bentuk seterusnya. Apakah nombor bercampur itu?',ch('a',whole+' '+frac(rem,den2)),[
      ch('w1',frac(imp,den2),'whole_remainder_confusion'),ch('w2',whole+' '+frac(rem,den2+1),'whole_remainder_confusion'),ch('w3',(whole+1)+' '+frac(rem,den2),'whole_remainder_confusion')
    ],fractionVisual(rem,den2,whole+1),'identify_mixed_number_from_picture','Kira bentuk penuh dahulu, kemudian bahagian bentuk yang belum penuh.',['whole_remainder_confusion'],{whole:whole,rem:rem,d:den2});
  }

  if(c==='convert_hundredths_fractions_to_decimals'){
    var hn=pick(rng,[5,10,15,20,25,30,35,40,45,50,60,70,75,80,90,95]);
    var dec=decimal2(hn/100);
    if(m==='hundredths_symbolic')return pack(frac(hn,100)+' dalam bentuk perpuluhan ialah?',ch('a',dec),[
      ch('w1',(hn/10).toFixed(1),'decimal_place_value'),ch('w2',String(hn),'decimal_place_value'),ch('w3',decimal2((hn+1)/100),'decimal_place_value')
    ],null,'hundredths_to_decimal','Perseratus berada pada dua tempat di belakang titik perpuluhan.',['decimal_place_value'],{n:hn});
    if(m==='hundred_grid')return pack('Petak seratus ini mempunyai '+hn+' petak berlorek. Apakah nombor perpuluhannya?',ch('a',dec),[
      ch('w1',(hn/10).toFixed(1),'decimal_place_value'),ch('w2',String(hn),'decimal_place_value'),ch('w3',decimal2(Math.min(99,hn+10)/100),'decimal_place_value')
    ],gridVisual(hn),'hundred_grid_to_decimal','Setiap petak ialah satu perseratus.',['decimal_place_value'],{n:hn});
    if(m==='place_value')return pack('Dalam '+dec+', digit '+String(hn).padStart(2,'0').slice(-1)+' berada pada tempat apa?',ch('a','perseratus'),[
      ch('w1','persepuluh','decimal_place_value'),ch('w2','sa','decimal_place_value'),ch('w3','ratus','decimal_place_value')
    ],{kind:'place_value_decimal',value:dec},'decimal_place_value_from_hundredths','Digit kedua selepas titik perpuluhan ialah perseratus.',['decimal_place_value'],{value:dec});
  }

  if(c==='compare_decimals_to_hundredths'){
    var da=ri(rng,10,89)/100,db=ri(rng,10,89)/100;while(Math.abs(da-db)<0.02)db=ri(rng,10,89)/100;
    var sa=da.toFixed(2),sb=db.toFixed(2),sign=da>db?'>':'<';
    if(m==='compare_pair')return pack(sa+' □ '+sb+'. Simbol manakah betul?',ch('a',sign),[
      ch('w1',sign==='>'?'<':'>','compare_decimal_digits'),ch('w2','=','compare_decimal_digits'),ch('w3','≈','compare_decimal_digits')
    ],null,'compare_decimal_pair','Banding nilai persepuluh dahulu, kemudian perseratus.',['compare_decimal_digits'],{a:sa,b:sb});
    if(m==='number_line')return pack('Pada garis nombor, nilai manakah lebih besar?',ch('a',da>db?sa:sb),[
      ch('w1',da>db?sb:sa,'compare_decimal_digits'),ch('w2','Kedua-duanya sama','compare_decimal_digits'),ch('w3','Tidak boleh ditentukan','compare_decimal_digits')
    ],lineVisual([Math.min(da,db),Math.max(da,db)],[sa,sb]),'compare_decimals_number_line','Nombor yang lebih ke kanan pada garis nombor adalah lebih besar.',['compare_decimal_digits'],{a:sa,b:sb});
    if(m==='largest'){
      // Generate four UNIQUE integer hundredths first. Do not de-duplicate after
      // converting to floating point: binary float adjustment can still format
      // two different raw values to the same 2-decimal label.
      var cents=[];
      while(cents.length<4){var cv=ri(rng,10,90);if(cents.indexOf(cv)<0)cents.push(cv);}
      var vals=cents.map(function(x){return x/100;});
      var maxCents=Math.max.apply(null,cents),max=(maxCents/100).toFixed(2);
      var ws=cents.filter(function(v){return v!==maxCents;}).map(function(v){return (v/100).toFixed(2);});
      return pack('Empat botol berisi '+vals.map(function(v){return v.toFixed(2)+' L';}).join(', ')+'. Isipadu manakah paling besar?',ch('a',max+' L'),ws.map(function(v,i){return ch('w'+i,v+' L','compare_decimal_digits');}),null,'select_largest_decimal','Banding semua nilai hingga perseratus.',['compare_decimal_digits'],{values:cents.join(',')});
    }
  }

  if(c==='add_subtract_decimals_to_hundredths'){
    var ia=ri(rng,5,55),ib=ri(rng,5,35),aD=ia/100,bD=ib/100;
    if(m==='add_decimals'){
      var sm=(aD+bD).toFixed(2);return pack(aD.toFixed(2)+' + '+bD.toFixed(2)+' = ?',ch('a',sm),[
        ch('w1',(aD+bD+0.1).toFixed(2),'decimal_alignment'),ch('w2',String(ia+ib),'decimal_alignment'),ch('w3',(Math.abs(aD-bD)).toFixed(2),'decimal_alignment')
      ],{kind:'place_value_decimal_pair',a:aD.toFixed(2),b:bD.toFixed(2),op:'+'},'add_decimals_hundredths','Selarikan titik perpuluhan dan nilai tempat.',['decimal_alignment'],{a:ia,b:ib});
    }
    if(m==='subtract_decimals'){
      var hiD=Math.max(aD,bD)+0.2,loD=Math.min(aD,bD),df=(hiD-loD).toFixed(2);
      return pack(hiD.toFixed(2)+' − '+loD.toFixed(2)+' = ?',ch('a',df),[
        ch('w1',(hiD-loD+0.10).toFixed(2),'decimal_alignment'),ch('w2',(hiD-loD+0.20).toFixed(2),'decimal_alignment'),ch('w3',Math.max(0,hiD-loD-0.10).toFixed(2),'decimal_alignment')
      ],null,'subtract_decimals_hundredths','Selarikan titik perpuluhan sebelum menolak.',['decimal_alignment'],{a:hiD,b:loD});
    }
    if(m==='missing_decimal'){
      var totalD=aD+bD;
      return pack(aD.toFixed(2)+' + □ = '+totalD.toFixed(2)+'. Apakah nombor dalam kotak?',ch('a',bD.toFixed(2)),[
        ch('w1',(bD+0.01).toFixed(2),'decimal_alignment'),ch('w2',(bD+0.02).toFixed(2),'part_whole_confusion'),ch('w3',(bD+0.03).toFixed(2),'decimal_alignment')
      ],barVisual([aD,bD],[aD.toFixed(2),'?']),'missing_addend_decimal','Tolak bahagian diketahui daripada jumlah.',['decimal_alignment'],{a:aD,b:bD,total:totalD});
    }
  }

  if(c==='represent_percent_on_hundred_grid'){
    var pc=pick(rng,[10,20,25,30,40,50,60,70,75,80,90]);
    if(m==='grid_to_percent')return pack('Berapakah peratus petak yang berlorek?',ch('a',pc+'%'),[
      ch('w1',(pc/10)+'%','percent_out_of_100'),ch('w2',Math.min(99,pc+5)+'%','percent_out_of_100'),ch('w3',Math.max(1,pc-5)+'%','percent_out_of_100')
    ],gridVisual(pc),'hundred_grid_to_percent','Daripada 100 petak, bilangan berlorek sama dengan nilai peratus.',['percent_out_of_100'],{shaded:pc});
    if(m==='percent_to_shaded')return pack(pc+'% daripada petak seratus perlu dilorek. Berapa petak perlu dilorek?',ch('a',String(pc)),[
      ch('w1',String(pc/10),'percent_out_of_100'),ch('w2',String(Math.min(99,pc+5)),'percent_out_of_100'),ch('w3',String(Math.max(1,pc-5)),'percent_out_of_100')
    ],gridVisual(0),'percent_to_shaded_count','Peratus bermaksud “daripada seratus”.',['percent_out_of_100'],{percent:pc});
    if(m==='unshaded_percent')return pack(pc+' petak daripada 100 petak telah berlorek. Berapakah peratus yang BELUM berlorek?',ch('a',(100-pc)+'%'),[
      ch('w1',((100-pc)/10)+'%','percent_out_of_100'),ch('w2',Math.min(99,105-pc)+'%','complement_to_100'),ch('w3',Math.max(1,95-pc)+'%','complement_to_100')
    ],gridVisual(pc),'infer_unshaded_percent','Jumlah keseluruhan ialah 100%. Tolak bahagian berlorek.',['complement_to_100'],{shaded:pc});
  }

  if(c==='read_write_percent_1_to_100'){
    var pn=ri(rng,1,100),pw=pctWords(pn);
    if(m==='symbol_to_words')return pack('Bagaimanakah '+pn+'% dibaca?',ch('a',pw),[
      ch('w1',pn+' perpuluhan','percent_notation'),ch('w2',pn+' perseratusan','percent_notation'),ch('w3','seratus '+pn,'percent_notation')
    ],null,'percent_symbol_to_words','Simbol % dibaca “peratus”.',['percent_notation'],{percent:pn});
    if(m==='words_to_symbol')return pack('Tulis “‘'+pw+'” dalam simbol.',ch('a',pn+'%'),[
      ch('w1','0.'+pn,'percent_notation'),ch('w2',pn+'/10','percent_notation'),ch('w3',pn+'‰','percent_notation')
    ],null,'percent_words_to_symbol','Gunakan simbol % selepas nombor.',['percent_notation'],{percent:pn});
    if(m==='number_to_percent'){
      // Keep notation-confusion distractors semantically plausible but display-unique.
      // In particular, 50 out of 100 must not use its complement (also 50%)
      // as a distractor because that collapses the four-choice MCQ.
      var altPercent=pn<=90?pn+10:pn-10;
      return pack(pn+' daripada 100 petak berlorek. Tulis sebagai peratus.',ch('a',pn+'%'),[
        ch('w1',(pn/100).toFixed(2),'percent_notation'),ch('w2',pn+'/100','percent_notation'),ch('w3',altPercent+'%','percent_out_of_100')
      ],gridVisual(pn),'number_out_of_100_to_percent','Bilangan daripada 100 terus menjadi nilai peratus.',['percent_out_of_100'],{percent:pn});
    }
  }

  if(c==='relate_fractions_decimals_percent'){
    var triples=[['1/2','0.50','50%'],['1/4','0.25','25%'],['3/4','0.75','75%'],['1/5','0.20','20%'],['2/5','0.40','40%'],['3/5','0.60','60%'],['4/5','0.80','80%']];
    var tr=pick(rng,triples);
    if(m==='match_triple')return pack('Set manakah menunjukkan nilai yang sama?',ch('a',tr.join(' = ')),[
      ch('w1',tr[0]+' = '+tr[1]+' = '+(parseInt(tr[2])<=80?parseInt(tr[2])+10:parseInt(tr[2])-10)+'%','cross_representation'),ch('w2',tr[0]+' = 0.10 = '+tr[2],'cross_representation'),ch('w3','1/10 = '+tr[1]+' = '+tr[2],'cross_representation')
    ],null,'match_fraction_decimal_percent','Tukar semua kepada satu bentuk yang sama untuk dibandingkan.',['cross_representation'],{triple:tr.join('|')});
    if(m==='find_mismatch')return pack('Yang manakah TIDAK setara dengan '+tr[2]+'?',ch('a',pick(rng,['0.10','1/10','90%'])),[
      ch('w1',tr[0],'cross_representation'),ch('w2',tr[1],'cross_representation'),ch('w3',tr[2],'cross_representation')
    ],null,'find_non_equivalent_representation','Semak pecahan, perpuluhan dan peratus mewakili bahagian yang sama.',['cross_representation'],{target:tr[2]});
    if(m==='grid_bridge'){
      var sh=parseInt(tr[2]);return pack('Petak seratus menunjukkan '+sh+' petak berlorek. Pilih hubungan yang betul.',ch('a',tr.join(' = ')),[
        ch('w1','1/10 = '+tr[1]+' = '+tr[2],'cross_representation'),ch('w2',tr[0]+' = 0.10 = '+tr[2],'cross_representation'),ch('w3',tr[0]+' = '+tr[1]+' = '+(sh<=80?sh+10:sh-10)+'%','cross_representation')
      ],gridVisual(sh),'hundred_grid_fraction_decimal_percent','Gunakan petak seratus sebagai jambatan antara perpuluhan dan peratus.',['cross_representation'],{shaded:sh});
    }
  }

  // D3.T5 — Masa dan Waktu
  if(c==='read_record_time_of_activities'){
    var hh=ri(rng,1,11),mm=pick(rng,[0,15,30,45]);
    if(m==='analog_read')return pack('Apakah waktu yang ditunjukkan oleh jam?',ch('a',clockLabel(hh,mm)),[
      ch('w1',clockLabel(hh,mm===0?30:0),'hour_minute_hand'),ch('w2',clockLabel((hh%12)+1,mm),'hour_minute_hand'),ch('w3',clockLabel(((hh+1)%12)+1,mm),'hour_minute_hand')
    ],clockVisual(hh,mm),'read_analogue_clock','Jarum pendek menunjukkan jam dan jarum panjang menunjukkan minit.',['hour_minute_hand'],{h:hh,m:mm});
    if(m==='digital_words'){
      var words=mm===0?hh+' tepat':mm===30?hh+' setengah':clockLabel(hh,mm);
      return pack('Waktu digital '+clockLabel(hh,mm)+' sepadan dengan yang mana?',ch('a',words),[
        ch('w1',clockLabel((hh%12)+1,mm),'hour_minute_hand'),ch('w2',clockLabel(hh,(mm+15)%60),'hour_minute_hand'),ch('w3',clockLabel(((hh+1)%12)+1,mm),'hour_minute_hand')
      ],null,'digital_time_to_words','Baca jam dahulu, kemudian minit.',['hour_minute_hand'],{h:hh,m:mm});
    }
    if(m==='schedule_activity'){
      var rows=[['Sarapan','7:30'],['Mula kelas','8:00'],['Rehat','10:00'],['Balik','1:00']];
      var target=pick(rng,rows);
      return pack('Berdasarkan jadual, pukul berapakah aktiviti “'+target[0]+'”?',ch('a',target[1]),rows.filter(function(r){return r!==target;}).map(function(r,i){return ch('w'+i,r[1],'schedule_lookup');}),tableVisual(['Aktiviti','Waktu'],rows),'read_activity_schedule','Cari baris aktiviti yang ditanya dan baca waktunya.',['schedule_lookup'],{activity:target[0]});
    }
  }

  if(c==='convert_hours_minutes_seconds'){
    if(m==='hours_minutes'){
      var h2=ri(rng,2,8),am=h2*60;return numPack(h2+' jam = berapa minit?',am,[h2*10,h2*100,am+60],unitVisual('time_units',h2,8,'jam'),'convert_hours_to_minutes','1 jam = 60 minit.',['time_unit_conversion'],null,{h:h2});
    }
    if(m==='minutes_seconds'){
      var min2=ri(rng,2,9),sec=min2*60;return numPack(min2+' minit = berapa saat?',sec,[min2*10,min2*100,sec+60],unitVisual('time_units',min2,9,'minit'),'convert_minutes_to_seconds','1 minit = 60 saat.',['time_unit_conversion'],null,{m:min2});
    }
    if(m==='mixed_time'){
      var mins=ri(rng,2,5)*60+pick(rng,[10,20,30,40,50]),hh2=Math.floor(mins/60),rm=mins%60;
      return pack(mins+' minit bersamaan?',ch('a',hh2+' jam '+rm+' minit'),[
        ch('w1',hh2+' jam '+(rm+10)+' minit','time_unit_conversion'),ch('w2',(hh2+1)+' jam '+rm+' minit','time_unit_conversion'),ch('w3',mins+' jam','time_unit_conversion')
      ],timelineVisual(0,mins,[60,120,180,240]),'convert_minutes_to_hours_minutes','Kumpulkan setiap 60 minit menjadi 1 jam.',['time_unit_conversion'],{mins:mins});
    }
  }

  if(c==='add_subtract_time_values'){
    if(m==='add_durations'){
      var m1=pick(rng,[20,30,40,50,60,70]),m2=pick(rng,[15,25,35,45]),totm=m1+m2;
      return pack(timeLabel(m1)+' + '+timeLabel(m2)+' = ?',ch('a',timeLabel(totm)),[
        ch('w1',timeLabel(Math.max(5,totm-10)),'time_regrouping'),ch('w2',timeLabel(totm+30),'time_regrouping'),ch('w3',String(totm)+' jam','time_regrouping')
      ],timelineVisual(0,totm,[m1]),'add_time_values','Tambah minit; tukar setiap 60 minit kepada 1 jam.',['time_regrouping'],{a:m1,b:m2});
    }
    if(m==='subtract_durations'){
      var t1=pick(rng,[90,120,150,180]),t2=pick(rng,[20,30,45,60]),td=t1-t2;
      return pack(timeLabel(t1)+' − '+timeLabel(t2)+' = ?',ch('a',timeLabel(td)),[
        ch('w1',timeLabel(t1+t2),'operation_selection'),ch('w2',timeLabel(Math.max(5,td-15)),'time_regrouping'),ch('w3',timeLabel(td+30),'time_regrouping')
      ],null,'subtract_time_values','Samakan unit masa sebelum menolak.',['time_regrouping'],{a:t1,b:t2});
    }
    if(m==='difference_timeline'){
      var st=8*60+pick(rng,[0,15,30]),en=st+pick(rng,[45,60,75,90]),dur=en-st;
      return pack('Aktiviti bermula '+clockLabel(Math.floor(st/60),st%60)+' dan tamat '+clockLabel(Math.floor(en/60),en%60)+'. Berapa lama aktiviti itu?',ch('a',timeLabel(dur)),[
        ch('w1',timeLabel(dur+30),'elapsed_time'),ch('w2',timeLabel(Math.max(15,dur-15)),'elapsed_time'),ch('w3',clockLabel(Math.floor(en/60),en%60),'elapsed_time')
      ],timelineVisual(st,en,[st,en]),'find_time_difference','Cari jarak masa dari waktu mula ke waktu tamat.',['elapsed_time'],{start:st,end:en});
    }
  }

  if(c==='solve_mixed_addition_subtraction_time'){
    if(m==='schedule_two_step'){
      var start=9*60,act=pick(rng,[45,60,75]),br=pick(rng,[15,30]),end=start+act+br;
      return pack('Program bermula 9:00. Aktiviti pertama mengambil '+act+' minit, diikuti rehat '+br+' minit. Pukul berapakah selepas kedua-duanya?',ch('a',clockLabel(Math.floor(end/60),end%60)),[
        ch('w1',clockLabel(Math.floor((start+act)/60),(start+act)%60),'operation_order'),ch('w2',clockLabel(Math.floor((end+30)/60),(end+30)%60),'operation_order'),ch('w3','9:00','operation_order')
      ],timelineVisual(start,end,[start+act]),'two_step_time_schedule','Tambah kedua-dua tempoh kepada waktu mula mengikut urutan.',['operation_order'],{act:act,break:br});
    }
    if(m==='duration_adjustment'){
      var planned=pick(rng,[90,120,150]),used=pick(rng,[30,45,60]),extra=pick(rng,[15,30]),remain=planned-used+extra;
      return pack('Masa yang diperuntukkan ialah '+timeLabel(planned)+'. '+timeLabel(used)+' telah digunakan, kemudian masa ditambah '+timeLabel(extra)+'. Berapa masa yang tinggal?',ch('a',timeLabel(remain)),[
        ch('w1',timeLabel(planned-used-extra),'operation_order'),ch('w2',timeLabel(planned+used+extra),'operation_order'),ch('w3',timeLabel(planned-used),'operation_order')
      ],timelineVisual(0,planned+extra,[used,planned]),'mixed_time_adjustment','Tolak masa digunakan, kemudian tambah masa tambahan.',['operation_order'],{planned:planned,used:used,extra:extra});
    }
    if(m==='choose_time_expression'){
      return pack('Sebuah latihan diberi 120 minit. 35 minit digunakan, kemudian guru menambah 20 minit. Ungkapan manakah mencari masa yang tinggal?',ch('a','120 − 35 + 20'),[
        ch('w1','120 + 35 + 20','operation_order'),ch('w2','120 − 35 − 20','operation_order'),ch('w3','120 + 35 − 20','operation_order')
      ],timelineVisual(0,140,[35,120]),'choose_expression_for_time_problem','Padankan “digunakan” dengan tolak dan “ditambah” dengan tambah.',['operation_order'],{base:120,used:35,extra:20});
    }
  }

  if(c==='multiply_divide_time'){
    if(m==='repeat_duration'){
      var rep=ri(rng,2,5),dm=pick(rng,[10,15,20,30]),totalT=rep*dm;
      return pack(rep+' sesi mengambil '+dm+' minit setiap satu. Jumlah masa?',ch('a',timeLabel(totalT)),[
        ch('w1',timeLabel(dm+rep),'time_multiplication'),ch('w2',timeLabel(totalT+dm),'time_multiplication'),ch('w3',timeLabel(Math.max(5,totalT-dm)),'time_multiplication')
      ],groupingVisual(rep,dm),'multiply_time_duration','Darab bilangan sesi dengan masa setiap sesi.',['time_multiplication'],{groups:rep,each:dm});
    }
    if(m==='share_duration'){
      var gr=ri(rng,2,6),ea=pick(rng,[10,15,20]),tt=gr*ea;
      return pack(timeLabel(tt)+' dibahagi sama rata kepada '+gr+' aktiviti. Setiap aktiviti berapa lama?',ch('a',timeLabel(ea)),[
        ch('w1',timeLabel(gr),'time_division'),ch('w2',timeLabel(ea+5),'time_division'),ch('w3',timeLabel(tt),'time_division')
      ],groupingVisual(gr,ea),'divide_time_duration','Bahagi jumlah masa dengan bilangan aktiviti.',['time_division'],{groups:gr,each:ea});
    }
    if(m==='missing_groups'){
      var eachT=pick(rng,[10,15,20]),groupsT=ri(rng,3,6),totT=eachT*groupsT;
      return numPack('Jumlah masa '+totT+' minit. Setiap sesi '+eachT+' minit. Ada berapa sesi?',groupsT,[eachT,totT,groupsT+1],groupingVisual(groupsT,eachT),'inverse_time_groups','Bahagi jumlah masa dengan masa setiap sesi.',['multiply_divide_inverse'],null,{total:totT,each:eachT});
    }
  }

  // D3.T6 — generic measurement builders
  function measurementConvert(kind,big,small,bigName,smallName,mode){
    var whole=ri(rng,1,6),remU=pick(rng,[100,200,300,400,500,600,700,800,900]),smallTotal=whole*big+remU;
    if(mode===kind+'_to_small')return pack(whole+' '+bigName+' = ?',ch('a',(whole*big)+' '+smallName),[
      ch('w1',(whole*10)+' '+smallName,'unit_conversion'),ch('w2',whole+' '+smallName,'unit_conversion'),ch('w3',(whole*big+100)+' '+smallName,'unit_conversion')
    ],unitVisual(kind,whole,6,bigName),'convert_'+kind+'_small','Gunakan hubungan '+big+' '+smallName+' = 1 '+bigName+'.',['unit_conversion'],{whole:whole});
    return null;
  }

  if(c==='convert_metres_centimetres'){
    var wm=ri(rng,1,8),rc=pick(rng,[10,20,30,40,50,60,70,80,90]),cm=wm*100+rc;
    if(m==='m_to_cm')return numPack(wm+' m = berapa cm?',wm*100,[wm*10,wm,wm*100+100],unitVisual('ruler',wm,8,'m'),'metres_to_centimetres','1 m = 100 cm.',['length_unit_conversion'],function(x){return x+' cm';},{m:wm});
    if(m==='cm_to_m_cm')return pack(cm+' cm bersamaan?',ch('a',wm+' m '+rc+' cm'),[
      ch('w1',(wm+1)+' m '+rc+' cm','length_unit_conversion'),ch('w2',wm+' m '+(rc+10)+' cm','length_unit_conversion'),ch('w3',cm+' m','length_unit_conversion')
    ],unitVisual('ruler',cm,900,'cm'),'centimetres_to_mixed_metres','Kumpulkan setiap 100 cm menjadi 1 m.',['length_unit_conversion'],{cm:cm});
    if(m==='equivalent_length')return pack('Yang manakah sama dengan '+wm+' m '+rc+' cm?',ch('a',cm+' cm'),[
      ch('w1',(wm*10+rc)+' cm','length_unit_conversion'),ch('w2',(cm+100)+' cm','length_unit_conversion'),ch('w3',(cm-10)+' cm','length_unit_conversion')
    ],unitVisual('ruler',cm,900,'cm'),'choose_equivalent_length','Tukar meter kepada sentimeter dahulu.',['length_unit_conversion'],{m:wm,cm:rc});
  }

  if(c==='add_subtract_lengths'){
    var la=ri(rng,120,450),lb=ri(rng,40,180);
    if(m==='add_lengths')return numPack(la+' cm + '+lb+' cm = ?',la+lb,[la-lb,la+lb+100,la+lb-10],unitVisual('ruler',la+lb,700,'cm'),'add_length_values','Unit sama, jadi tambah nilai ukuran.',['unit_alignment'],function(x){return x+' cm';},{a:la,b:lb});
    if(m==='subtract_lengths')return numPack(la+' cm − '+lb+' cm = ?',la-lb,[la+lb,la-lb+10,Math.max(1,la-lb-10)],null,'subtract_length_values','Unit sama, jadi tolak nilai ukuran.',['unit_alignment'],function(x){return x+' cm';},{a:la,b:lb});
    if(m==='missing_length')return numPack('Jumlah panjang '+(la+lb)+' cm. Satu bahagian '+la+' cm. Panjang bahagian satu lagi?',lb,[la,la+lb,Math.abs(la-lb)],barVisual([la,lb],[la+' cm','?']),'find_missing_length','Tolak bahagian diketahui daripada jumlah.',['part_whole_confusion'],function(x){return x+' cm';},{whole:la+lb,part:la});
  }

  if(c==='multiply_divide_lengths'){
    var lg=ri(rng,2,6),le=pick(rng,[20,25,30,40,50]),lt=lg*le;
    if(m==='repeat_length')return numPack(lg+' tali, setiap satu '+le+' cm. Jumlah panjang?',lt,[le+lg,lt+le,Math.max(1,lt-le)],barVisual(new Array(lg).fill(le),[]),'multiply_length','Darab bilangan tali dengan panjang setiap tali.',['multiply_divide_inverse'],function(x){return x+' cm';},{g:lg,e:le});
    if(m==='share_length')return numPack(lt+' cm dipotong sama rata kepada '+lg+' bahagian. Setiap bahagian?',le,[lg,le+10,lt],barVisual(new Array(lg).fill(le),[]),'divide_length','Bahagi jumlah panjang dengan bilangan bahagian.',['multiply_divide_inverse'],function(x){return x+' cm';},{g:lg,e:le});
    if(m==='inverse_length')return numPack('□ × '+le+' cm = '+lt+' cm. Berapakah □?',lg,[le,lt,lg+1],unitVisual('ruler',lt,300,'cm'),'inverse_length_factor','Gunakan bahagi untuk mencari bilangan kumpulan.',['multiply_divide_inverse'],null,{g:lg,e:le});
  }

  if(c==='convert_kilograms_grams'){
    var kg=ri(rng,1,6),rg=pick(rng,[100,200,300,400,500,600,700,800,900]),grams=kg*1000+rg;
    if(m==='kg_to_g')return numPack(kg+' kg = berapa g?',kg*1000,[kg*100,kg*10,kg*1000+1000],unitVisual('scale',kg,6,'kg'),'kilograms_to_grams','1 kg = 1000 g.',['mass_unit_conversion'],function(x){return x+' g';},{kg:kg});
    if(m==='g_to_kg_g')return pack(grams+' g bersamaan?',ch('a',kg+' kg '+rg+' g'),[
      ch('w1',(kg+1)+' kg '+rg+' g','mass_unit_conversion'),ch('w2',kg+' kg '+(rg+100)+' g','mass_unit_conversion'),ch('w3',grams+' kg','mass_unit_conversion')
    ],unitVisual('scale',grams,7000,'g'),'grams_to_mixed_kilograms','Kumpulkan setiap 1000 g menjadi 1 kg.',['mass_unit_conversion'],{g:grams});
    if(m==='equivalent_mass')return pack('Yang manakah sama dengan '+kg+' kg '+rg+' g?',ch('a',grams+' g'),[
      ch('w1',(kg*100+rg)+' g','mass_unit_conversion'),ch('w2',(grams+1000)+' g','mass_unit_conversion'),ch('w3',(grams-100)+' g','mass_unit_conversion')
    ],unitVisual('scale',grams,7000,'g'),'choose_equivalent_mass','Tukar kilogram kepada gram dahulu.',['mass_unit_conversion'],{kg:kg,g:rg});
  }

  if(c==='add_subtract_masses'){
    var ma=ri(rng,1200,4500),mb=ri(rng,300,1100);
    if(m==='add_masses')return numPack(ma+' g + '+mb+' g = ?',ma+mb,[ma-mb,ma+mb+1000,ma+mb-100],unitVisual('scale',ma+mb,6000,'g'),'add_mass_values','Unit sama, jadi tambah nilai jisim.',['unit_alignment'],function(x){return x+' g';},{a:ma,b:mb});
    if(m==='subtract_masses')return numPack(ma+' g − '+mb+' g = ?',ma-mb,[ma+mb,ma-mb+100,Math.max(1,ma-mb-100)],null,'subtract_mass_values','Unit sama, jadi tolak nilai jisim.',['unit_alignment'],function(x){return x+' g';},{a:ma,b:mb});
    if(m==='missing_mass')return numPack('Jumlah jisim '+(ma+mb)+' g. Satu objek '+ma+' g. Jisim objek satu lagi?',mb,[ma,ma+mb,Math.abs(ma-mb)],barVisual([ma,mb],[ma+' g','?']),'find_missing_mass','Tolak jisim diketahui daripada jumlah.',['part_whole_confusion'],function(x){return x+' g';},{whole:ma+mb,part:ma});
  }

  if(c==='multiply_divide_masses'){
    var mg=ri(rng,2,6),me=pick(rng,[100,150,200,250,300]),mt=mg*me;
    if(m==='repeat_mass')return numPack(mg+' pek, setiap satu '+me+' g. Jumlah jisim?',mt,[me+mg,mt+me,Math.max(1,mt-me)],groupingVisual(mg,me),'multiply_mass','Darab bilangan pek dengan jisim setiap pek.',['multiply_divide_inverse'],function(x){return x+' g';},{g:mg,e:me});
    if(m==='share_mass')return numPack(mt+' g dibahagi sama rata kepada '+mg+' bekas. Setiap bekas?',me,[mg,me+50,mt],groupingVisual(mg,me),'divide_mass','Bahagi jumlah jisim dengan bilangan bekas.',['multiply_divide_inverse'],function(x){return x+' g';},{g:mg,e:me});
    if(m==='inverse_mass')return numPack('□ × '+me+' g = '+mt+' g. Berapakah □?',mg,[me,mt,mg+1],unitVisual('scale',mt,2000,'g'),'inverse_mass_factor','Gunakan bahagi untuk mencari bilangan kumpulan.',['multiply_divide_inverse'],null,{g:mg,e:me});
  }

  if(c==='convert_litres_millilitres'){
    var li=ri(rng,1,6),rml=pick(rng,[100,200,300,400,500,600,700,800,900]),ml=li*1000+rml;
    if(m==='l_to_ml')return numPack(li+' L = berapa mL?',li*1000,[li*100,li*10,li*1000+1000],unitVisual('container',li,6,'L'),'litres_to_millilitres','1 L = 1000 mL.',['volume_unit_conversion'],function(x){return x+' mL';},{l:li});
    if(m==='ml_to_l_ml')return pack(ml+' mL bersamaan?',ch('a',li+' L '+rml+' mL'),[
      ch('w1',(li+1)+' L '+rml+' mL','volume_unit_conversion'),ch('w2',li+' L '+(rml+100)+' mL','volume_unit_conversion'),ch('w3',ml+' L','volume_unit_conversion')
    ],unitVisual('container',ml,7000,'mL'),'millilitres_to_mixed_litres','Kumpulkan setiap 1000 mL menjadi 1 L.',['volume_unit_conversion'],{ml:ml});
    if(m==='equivalent_volume')return pack('Yang manakah sama dengan '+li+' L '+rml+' mL?',ch('a',ml+' mL'),[
      ch('w1',(li*100+rml)+' mL','volume_unit_conversion'),ch('w2',(ml+1000)+' mL','volume_unit_conversion'),ch('w3',(ml-100)+' mL','volume_unit_conversion')
    ],unitVisual('container',ml,7000,'mL'),'choose_equivalent_volume','Tukar liter kepada mililiter dahulu.',['volume_unit_conversion'],{l:li,ml:rml});
  }

  if(c==='add_subtract_liquid_volumes'){
    var va=ri(rng,1200,4500),vb=ri(rng,300,1100);
    if(m==='add_volumes')return numPack(va+' mL + '+vb+' mL = ?',va+vb,[va-vb,va+vb+1000,va+vb-100],unitVisual('container',va+vb,6000,'mL'),'add_liquid_volumes','Unit sama, jadi tambah nilai isipadu.',['unit_alignment'],function(x){return x+' mL';},{a:va,b:vb});
    if(m==='subtract_volumes')return numPack(va+' mL − '+vb+' mL = ?',va-vb,[va+vb,va-vb+100,Math.max(1,va-vb-100)],null,'subtract_liquid_volumes','Unit sama, jadi tolak nilai isipadu.',['unit_alignment'],function(x){return x+' mL';},{a:va,b:vb});
    if(m==='missing_volume')return numPack('Jumlah air '+(va+vb)+' mL. Satu bekas mempunyai '+va+' mL. Berapa mL dalam bekas satu lagi?',vb,[va,va+vb,Math.abs(va-vb)],barVisual([va,vb],[va+' mL','?']),'find_missing_liquid_volume','Tolak isipadu diketahui daripada jumlah.',['part_whole_confusion'],function(x){return x+' mL';},{whole:va+vb,part:va});
  }

  if(c==='multiply_divide_liquid_volumes'){
    var vg=ri(rng,2,6),ve=pick(rng,[100,150,200,250,300]),vt=vg*ve;
    if(m==='repeat_volume')return numPack(vg+' botol, setiap satu '+ve+' mL. Jumlah isipadu?',vt,[ve+vg,vt+ve,Math.max(1,vt-ve)],unitVisual('container',ve,400,'mL'),'multiply_liquid_volume','Darab bilangan botol dengan isipadu setiap botol.',['multiply_divide_inverse'],function(x){return x+' mL';},{g:vg,e:ve});
    if(m==='share_volume')return numPack(vt+' mL dibahagi sama rata kepada '+vg+' cawan. Setiap cawan?',ve,[vg,ve+50,vt],groupingVisual(vg,ve),'divide_liquid_volume','Bahagi jumlah isipadu dengan bilangan cawan.',['multiply_divide_inverse'],function(x){return x+' mL';},{g:vg,e:ve});
    if(m==='inverse_volume')return numPack('□ × '+ve+' mL = '+vt+' mL. Berapakah □?',vg,[ve,vt,vg+1],groupingVisual(vg,ve),'inverse_liquid_volume_factor','Gunakan bahagi untuk mencari bilangan kumpulan.',['multiply_divide_inverse'],null,{g:vg,e:ve});
  }

  // D3.T9 — Pengurusan Data
  if(c==='collect_classify_organize_data'){
    if(m==='tally_count'){
      var counts=[ri(rng,3,9),ri(rng,3,9),ri(rng,3,9)],idx=ri(rng,0,2),labs=['Merah','Biru','Hijau'];
      return numPack('Berapakah bilangan item bagi kategori '+labs[idx]+'?',counts[idx],[counts[(idx+1)%3],counts[(idx+2)%3],counts[idx]+1],tableVisual(['Kategori','Gundal'],labs.map(function(l,i){return[l,'|||||'.slice(0,counts[i]%5)+(counts[i]>=5?' + '+(counts[i]-5):'')];})),'count_from_tally','Kira tanda gundal untuk kategori yang ditanya sahaja.',['tally_misread'],null,{category:labs[idx],count:counts[idx]});
    }
    if(m==='classify_list'){
      var items=['epal','pisang','epal','oren','pisang','epal','oren','epal'],target='epal',ct=items.filter(function(x){return x===target;}).length;
      return numPack('Data: '+items.join(', ')+'. Berapa item dalam kategori “'+target+'”?',ct,[2,3,5],{kind:'classification',items:items},'classify_and_count_items','Kumpulkan item yang sama sebelum mengira.',['classification_rule'],null,{target:target});
    }
    if(m==='table_statement'){
      var rws=[['A',8],['B',5],['C',11]];
      return pack('Pernyataan manakah betul berdasarkan jadual?',ch('a','Kategori C paling banyak.'),[
        ch('w1','Kategori B paling banyak.','table_comparison'),ch('w2','Kategori A paling sedikit.','table_comparison'),ch('w3','A dan C mempunyai bilangan yang sama.','table_comparison')
      ],tableVisual(['Kategori','Bilangan'],rws),'interpret_organized_table','Banding nilai setiap baris, bukan nama kategori.',['table_comparison'],{A:8,B:5,C:11});
    }
  }

  if(c==='read_interpret_pie_chart'){
    var labels=['A','B','C','D'],vals=[50,25,15,10];
    if(m==='largest_sector')return pack('Kategori manakah mempunyai bahagian paling besar?',ch('a','A'),[
      ch('w1','B','pie_sector_size'),ch('w2','C','pie_sector_size'),ch('w3','D','pie_sector_size')
    ],pieVisual(labels,vals),'identify_largest_pie_category','Sektor yang paling besar mewakili nilai paling besar.',['pie_sector_size'],{values:vals.join(',')});
    if(m==='category_count'){
      var total=40,cat='B',ansC=total*25/100;
      return numPack('Carta pai menunjukkan 25% daripada '+total+' murid memilih kategori B. Berapa orang murid itu?',ansC,[25,total-ansC,ansC+5],pieVisual(labels,vals),'derive_count_from_pie','Cari 25% daripada jumlah keseluruhan.',['part_whole_confusion'],null,{total:total,percent:25});
    }
    if(m==='difference_categories'){
      return pack('Apakah beza peratus antara kategori A dan B?',ch('a','25%'),[
        ch('w1','75%','pie_sector_size'),ch('w2','50%','pie_sector_size'),ch('w3','15%','pie_sector_size')
      ],pieVisual(labels,vals),'compare_pie_categories','Tolak peratus kategori yang lebih kecil daripada yang lebih besar.',['pie_sector_size'],{A:50,B:25});
    }
  }

  if(c==='relate_pictograph_bar_chart_pie_chart'){
    var labs2=['A','B','C'],v2=[4,2,2];
    if(m==='pictograph_to_bar')return pack('Piktograf menunjukkan A=4, B=2, C=2. Bar manakah sepatutnya paling tinggi?',ch('a','A'),[
      ch('w1','B','representation_mapping'),ch('w2','C','representation_mapping'),ch('w3','Semua sama','representation_mapping')
    ],pictographVisual(labs2,v2,1),'relate_pictograph_to_bar','Ketinggian bar perlu mengikut bilangan simbol dalam piktograf.',['representation_mapping'],{values:v2.join(',')});
    if(m==='bar_to_pie')return pack('Carta palang menunjukkan A=4, B=2, C=2. Apakah bahagian carta pai untuk A?',ch('a','1/2'),[
      ch('w1','1/4','representation_mapping'),ch('w2','1/3','representation_mapping'),ch('w3','3/4','representation_mapping')
    ],barChartVisual(labs2,v2),'relate_bar_to_pie','Jumlah data ialah 8; A mempunyai 4 daripada 8.',['representation_mapping'],{values:v2.join(',')});
    if(m==='same_data_statement')return pack('Piktograf dan carta palang mewakili data yang sama. Pernyataan manakah mesti kekal benar?',ch('a','Kategori dengan bilangan terbesar tetap kategori yang sama.'),[
      ch('w1','Semua bar mesti sama tinggi.','representation_mapping'),ch('w2','Bilangan kategori mesti berubah.','representation_mapping'),ch('w3','Jumlah data mesti menjadi dua kali ganda.','representation_mapping')
    ],{kind:'multi_chart',pictograph:pictographVisual(labs2,v2,1),bar:barChartVisual(labs2,v2)},'compare_chart_representations','Bentuk carta boleh berubah, tetapi data asal tidak berubah.',['representation_mapping'],{values:v2.join(',')});
  }

  throw new Error('d3.p0Kssr unsupported '+c+' / '+m);
});
})();