// Pahlawan Angka — Year 6 Money Real-KSSR Question Bank v3.60.5
// Research basis: KSSR Semakan Year 6 DSKP Unit 3 + current PBD/UASA-style item structures.
// Original authored items inspired by authentic assessment patterns; no source questions are copied verbatim.
(function(){
'use strict';
const V='3.60.5', banks=window.PAQuestionBanks=window.PAQuestionBanks||{}, prior=banks.d6;
if(typeof prior!=='function')return;

const stage=window.PAKSSRYear6?.stage||function(){return 2};
const VH=window.PAKSSRDepth?.visualHelpers||{};
const pick1=a=>pick(a), r=(a,b)=>R(a,b), Nq=(v,t)=>N(v,t);
const tidy=(v,d=2)=>typeof tidyNumber==='function'?tidyNumber(v,d):Number(Number(v).toFixed(d));
const rm=v=>{
  const n=Number(tidy(v,2));
  return 'RM'+(Number.isInteger(n)?n.toFixed(2):n.toFixed(2));
};
const table=(h,rows)=>VH.miniTable?VH.miniTable(h,rows):
  '<table>'+rows.map(x=>'<tr>'+x.map(y=>'<td>'+y+'</td>').join('')+'</tr>').join('')+'</table>';
const sessRef=()=>{try{return typeof sess!=='undefined'?sess:window.sess}catch(_){return window.sess}};

function rotate(modes){
  const recent=(sessRef()?.questionHistory||[])
    .filter(x=>x.skillId==='D6.MONEY')
    .slice(-20)
    .map(x=>String(x.archetypeId||'').replace(/^y6moneyreal_/,'').replace(/^y6kssr_/,'').replace(/^y6x_/,''));
  const last=recent.at(-1);
  const counts=Object.fromEntries(modes.map(m=>[m,recent.filter(x=>x===m).length]));
  const pool=modes.filter(m=>m!==last);
  return (pool.length?pool:modes).sort((a,b)=>counts[a]-counts[b]||Math.random()-.5)[0];
}
function mark(q,sp,mode,rep,demand,s,targets=[]){
  if(!q)return q;
  q.source='kssr-year6-money-real-v3.60.5';
  q.standardRef=sp;q.competencyId=sp;
  q.archetypeId='y6moneyreal_'+mode;
  q.representation=rep;q.demand=demand;
  q.difficultyBand=stage(s)===3?4:stage(s)===2?3:2;
  q.misconceptionTargets=targets;
  q.kssrMoneyRealVersion=V;
  return q;
}
function qc(prompt,answer,wrong,hint,kind){
  return Q(prompt,answer,wrong,hint,kind,true,true);
}

const LOW_MODES=[
  'identify_receipt','identify_invoice','identify_bill','identify_voucher',
  'term_profit','term_loss','asset_liability','asset_or_liability_table',
  'insurance_purpose','insurance_takaful_compare','interest_meaning','dividend_meaning'
];
function lowQ(s){
  const mode=rotate(LOW_MODES);
  if(mode==='identify_receipt')return mark(qc(
    'Selepas pelanggan membuat bayaran di sebuah kedai, dokumen manakah menjadi bukti bahawa bayaran telah diterima?',
    'resit',[Nq('invois','document'),Nq('baucar','document'),Nq('bil','document')],
    'Resit dikeluarkan selepas bayaran diterima.','Tahun 6 · Dokumen Kewangan'
  ),'3.1.1',mode,'verbal','concept',s,['document']);
  if(mode==='identify_invoice')return mark(qc(
    'Sebuah pembekal menghantar senarai barang, kuantiti, harga seunit dan jumlah yang perlu dibayar kepada sebuah kedai. Dokumen itu ialah?',
    'invois',[Nq('resit','document'),Nq('baucar','document'),Nq('liabiliti','financial_term')],
    'Invois menyenaraikan barang atau perkhidmatan dan amaun yang perlu dibayar.','Tahun 6 · Invois'
  ),'3.1.1',mode,'verbal','concept',s,['document']);
  if(mode==='identify_bill')return mark(qc(
    'Sebuah keluarga menerima dokumen yang menyatakan jumlah caj penggunaan perkhidmatan dan amaun yang perlu dibayar. Dokumen itu ialah?',
    'bil',[Nq('resit','document'),Nq('baucar','document'),Nq('aset','financial_term')],
    'Bil menyatakan caj yang perlu dibayar bagi sesuatu perkhidmatan.','Tahun 6 · Bil'
  ),'3.1.1',mode,'verbal','concept',s,['document']);
  if(mode==='identify_voucher')return mark(qc(
    'Sebuah pasar raya memberi kupon bernilai RM20 yang boleh digunakan untuk mengurangkan bayaran pembelian seterusnya. Istilah kewangan itu ialah?',
    'baucar',[Nq('resit','document'),Nq('invois','document'),Nq('dividen','financial_term')],
    'Baucar mempunyai nilai yang boleh ditebus mengikut syarat.','Tahun 6 · Baucar'
  ),'3.1.1',mode,'story','concept',s,['voucher']);
  if(mode==='term_profit')return mark(qc(
    'Harga jual sebuah barang lebih tinggi daripada harga kos. Keadaan itu disebut...',
    'untung',[Nq('rugi','profit_loss'),Nq('rebat','financial_term'),Nq('liabiliti','financial_term')],
    'Untung berlaku apabila harga jual melebihi harga kos.','Tahun 6 · Untung'
  ),'3.1.1',mode,'verbal','concept',s,['profit_loss']);
  if(mode==='term_loss')return mark(qc(
    'Harga jual sebuah barang lebih rendah daripada harga kos. Keadaan itu disebut...',
    'rugi',[Nq('untung','profit_loss'),Nq('diskaun','financial_term'),Nq('dividen','financial_term')],
    'Rugi berlaku apabila harga kos melebihi harga jual.','Tahun 6 · Rugi'
  ),'3.1.1',mode,'verbal','concept',s,['profit_loss']);
  if(mode==='asset_liability'){
    const x=pick1([
      ['wang simpanan dalam akaun bank','aset'],
      ['rumah yang dimiliki keluarga','aset'],
      ['baki pinjaman rumah yang belum selesai','liabiliti'],
      ['bil tertunggak yang belum dibayar','liabiliti']
    ]);
    return mark(qc(
      '<b>'+x[0]+'</b> paling tepat dikategorikan sebagai?',x[1],
      [Nq(x[1]==='aset'?'liabiliti':'aset','asset_liability'),Nq('faedah','financial_term'),Nq('rebat','financial_term')],
      'Aset mempunyai nilai; liabiliti ialah tanggungan kewangan atau hutang.','Tahun 6 · Aset dan Liabiliti'
    ),'3.1.1',mode,'story','concept',s,['asset_liability']);
  }
  if(mode==='asset_or_liability_table')return mark(qc(
    table(['Perkara','Nilai'],[['Simpanan',rm(2500)],['Baki pinjaman',rm(1800)]])+
    'Antara dua perkara di atas, yang manakah liabiliti?',
    'baki pinjaman',[Nq('simpanan','asset_liability'),Nq('kedua-duanya aset','asset_liability'),Nq('kedua-duanya liabiliti','asset_liability')],
    'Pinjaman yang belum dibayar ialah tanggungan kewangan.','Tahun 6 · Mengenal Liabiliti'
  ),'3.1.1',mode,'table','concept',s,['asset_liability']);
  if(mode==='insurance_purpose')return mark(qc(
    'Apakah tujuan utama insurans atau takaful dalam pengurusan kewangan?',
    'memberi perlindungan terhadap risiko kewangan tertentu',
    [Nq('menjamin semua pelaburan sentiasa untung','insurance'),Nq('menghapuskan semua hutang secara automatik','insurance'),Nq('menggantikan fungsi resit','insurance')],
    'Insurans dan takaful membantu melindungi pencarum atau aset terhadap risiko tertentu.','Tahun 6 · Insurans dan Takaful'
  ),'3.2.2',mode,'verbal','concept',s,['insurance','risk']);
  if(mode==='insurance_takaful_compare')return mark(qc(
    'Pernyataan manakah paling tepat tentang takaful?',
    'perlindungan yang diurus berasaskan prinsip syariah',
    [Nq('sentiasa memberikan dividen tetap','insurance'),Nq('hanya digunakan untuk membeli aset','insurance'),Nq('tidak melibatkan perlindungan risiko','insurance')],
    'Takaful ialah perlindungan berasaskan prinsip syariah.','Tahun 6 · Insurans dan Takaful'
  ),'3.2.1',mode,'verbal','concept',s,['insurance']);
  if(mode==='interest_meaning')return mark(qc(
    'Sejumlah wang yang diterima daripada simpanan di bank atau dikenakan ke atas pinjaman disebut...',
    'faedah',[Nq('dividen','financial_term'),Nq('rebat','financial_term'),Nq('baucar','financial_term')],
    'Faedah berkaitan simpanan atau pinjaman.','Tahun 6 · Faedah'
  ),'3.1.1',mode,'verbal','concept',s,['interest']);
  return mark(qc(
    'Bahagian keuntungan sesebuah syarikat yang diagihkan kepada pelabur disebut...',
    'dividen',[Nq('faedah','financial_term'),Nq('cukai perkhidmatan','financial_term'),Nq('rebat','financial_term')],
    'Dividen ialah pengagihan keuntungan kepada pelabur atau pemegang saham.','Tahun 6 · Dividen'
  ),'3.1.1',mode,'verbal','concept',s,['dividend']);
}

const CORE_MODES=[
  'profit_value','loss_value','selling_from_cost_profit','cost_from_selling_profit',
  'selling_from_cost_loss','cost_from_selling_loss','profit_percent',
  'discount_amount','discount_final','rebate_final','voucher_balance','cash_balance_after_discount',
  'invoice_total','invoice_missing_line','receipt_service_tax_total','service_tax_value',
  'interest_savings','interest_loan_years','dividend_value','dividend_rate',
  'net_asset','money_sufficient','multi_item_discount','bill_after_tax'
];
function coreQ(s){
  const mode=rotate(CORE_MODES);
  if(mode==='profit_value'){
    const cost=pick1([120,180,250,320]),profit=pick1([25,40,55,80]),sell=cost+profit;
    return mark(qc(
      'Harga kos sebuah barang ialah '+rm(cost)+' dan harga jual ialah '+rm(sell)+'. Berapakah untung?',
      rm(profit),[Nq(rm(sell),'profit_loss'),Nq(rm(cost),'profit_loss'),Nq(rm(profit+cost),'operation')],
      'Untung = harga jual − harga kos.','Tahun 6 · Menentukan Untung'
    ),'3.1.2',mode,'story','application',s,['profit_loss']);
  }
  if(mode==='loss_value'){
    const cost=pick1([150,240,360,500]),loss=pick1([20,35,60,90]),sell=cost-loss;
    return mark(qc(
      'Harga kos sebuah barang ialah '+rm(cost)+' tetapi dijual pada '+rm(sell)+'. Berapakah rugi?',
      rm(loss),[Nq(rm(sell),'profit_loss'),Nq(rm(cost),'profit_loss'),Nq(rm(loss+sell),'operation')],
      'Rugi = harga kos − harga jual.','Tahun 6 · Menentukan Rugi'
    ),'3.1.2',mode,'story','application',s,['profit_loss']);
  }
  if(mode==='selling_from_cost_profit'){
    const cost=pick1([80,140,260,420]),profit=pick1([15,30,50,75]),ans=cost+profit;
    return mark(qc(
      'Harga kos '+rm(cost)+'. Peniaga mahu memperoleh untung '+rm(profit)+'. Berapakah harga jual?',
      rm(ans),[Nq(rm(cost-profit),'profit_loss'),Nq(rm(profit),'profit_loss'),Nq(rm(ans+profit),'operation')],
      'Harga jual = harga kos + untung.','Tahun 6 · Harga Jual'
    ),'3.1.2',mode,'story','application',s,['profit_loss','inverse']);
  }
  if(mode==='cost_from_selling_profit'){
    const cost=pick1([95,175,280,450]),profit=pick1([20,35,60,90]),sell=cost+profit;
    return mark(qc(
      'Sebuah barang dijual pada '+rm(sell)+' dengan untung '+rm(profit)+'. Berapakah harga kos?',
      rm(cost),[Nq(rm(sell+profit),'profit_loss'),Nq(rm(profit),'profit_loss'),Nq(rm(cost-profit),'operation')],
      'Harga kos = harga jual − untung.','Tahun 6 · Harga Kos'
    ),'3.1.2',mode,'story','application',s,['profit_loss','inverse']);
  }
  if(mode==='selling_from_cost_loss'){
    const cost=pick1([160,250,390,620]),loss=pick1([25,40,70,120]),sell=cost-loss;
    return mark(qc(
      'Harga kos '+rm(cost)+'. Peniaga mengalami rugi '+rm(loss)+'. Berapakah harga jual?',
      rm(sell),[Nq(rm(cost+loss),'profit_loss'),Nq(rm(loss),'profit_loss'),Nq(rm(sell-loss),'operation')],
      'Harga jual = harga kos − rugi.','Tahun 6 · Harga Jual dan Rugi'
    ),'3.1.2',mode,'story','application',s,['profit_loss','inverse']);
  }
  if(mode==='cost_from_selling_loss'){
    const sell=pick1([120,240,360,480]),loss=pick1([20,35,50,80]),cost=sell+loss;
    return mark(qc(
      'Sebuah barang dijual pada '+rm(sell)+' dan peniaga rugi '+rm(loss)+'. Berapakah harga kos?',
      rm(cost),[Nq(rm(sell-loss),'profit_loss'),Nq(rm(sell),'profit_loss'),Nq(rm(loss),'profit_loss')],
      'Harga kos = harga jual + rugi.','Tahun 6 · Harga Kos dan Rugi'
    ),'3.1.2',mode,'story','application',s,['profit_loss','inverse']);
  }
  if(mode==='profit_percent'){
    const cost=pick1([100,200,400,500]),pct=pick1([10,15,20,25]),profit=cost*pct/100,sell=cost+profit;
    return mark(qc(
      'Harga kos '+rm(cost)+'. Peniaga mahu untung '+pct+'% daripada harga kos. Berapakah harga jual?',
      rm(sell),[Nq(rm(profit),'percent'),Nq(rm(cost-profit),'profit_loss'),Nq(rm(cost+pct),'operation')],
      'Kira nilai untung mengikut peratus, kemudian tambah kepada harga kos.','Tahun 6 · Untung Peratus'
    ),'3.1.2',mode,'story','application',s,['profit_loss','percent']);
  }
  if(mode==='discount_amount'){
    const price=pick1([80,120,160,240]),pct=pick1([10,15,20,25]),off=price*pct/100;
    return mark(qc(
      'Harga asal sebuah barang '+rm(price)+'. Diskaun '+pct+'% diberi. Berapakah nilai diskaun?',
      rm(off),[Nq(rm(price-off),'discount'),Nq(rm(price+pct),'operation'),Nq(rm(pct),'discount')],
      'Diskaun = kadar diskaun × harga asal.','Tahun 6 · Nilai Diskaun'
    ),'3.1.2',mode,'story','application',s,['discount','percent']);
  }
  if(mode==='discount_final'){
    const price=pick1([100,150,200,320]),pct=pick1([10,20,25]),off=price*pct/100,ans=price-off;
    return mark(qc(
      'Sebuah beg berharga '+rm(price)+' diberi diskaun '+pct+'%. Berapakah harga selepas diskaun?',
      rm(ans),[Nq(rm(off),'discount'),Nq(rm(price+off),'discount'),Nq(rm(price-pct),'operation')],
      'Harga selepas diskaun = harga asal − nilai diskaun.','Tahun 6 · Harga Selepas Diskaun'
    ),'3.1.2',mode,'story','application',s,['discount']);
  }
  if(mode==='rebate_final'){
    const bill=pick1([120,180,260,400]),rebate=pick1([10,20,30,50]),ans=bill-rebate;
    return mark(qc(
      'Jumlah bayaran asal '+rm(bill)+'. Rebat tunai '+rm(rebate)+' diberikan. Berapakah bayaran akhir?',
      rm(ans),[Nq(rm(bill+rebate),'rebate'),Nq(rm(rebate),'rebate'),Nq(rm(bill),'money')],
      'Tolak nilai rebat daripada jumlah asal.','Tahun 6 · Rebat'
    ),'3.1.2',mode,'story','application',s,['rebate']);
  }
  if(mode==='voucher_balance'){
    const price=pick1([60,90,120,150]),voucher=pick1([10,20,25,30]),ans=price-voucher;
    return mark(qc(
      'Harga barang '+rm(price)+'. Baucar bernilai '+rm(voucher)+' digunakan sepenuhnya. Berapakah baki bayaran?',
      rm(ans),[Nq(rm(price+voucher),'voucher'),Nq(rm(voucher),'voucher'),Nq(rm(price),'money')],
      'Baki bayaran = harga − nilai baucar.','Tahun 6 · Baucar'
    ),'3.3.1',mode,'story','application',s,['voucher']);
  }
  if(mode==='cash_balance_after_discount'){
    const price=pick1([40,50,80,100]),pct=pick1([10,20]),cash=pick1([50,100,150]),off=price*pct/100,pay=price-off,ans=cash-pay;
    if(ans<0)return coreQ(s);
    return mark(qc(
      'Harga asal '+rm(price)+', diskaun '+pct+'%. Pembeli membayar dengan '+rm(cash)+'. Berapakah baki wang?',
      rm(ans),[Nq(rm(cash-price),'money'),Nq(rm(off),'discount'),Nq(rm(pay),'money')],
      'Cari harga selepas diskaun dahulu, kemudian tolak daripada wang dibayar.','Tahun 6 · Diskaun dan Baki Wang'
    ),'3.3.1',mode,'story','application',s,['discount','multi_step']);
  }
  if(mode==='invoice_total'){
    const q1=pick1([2,3,4]),u1=pick1([6,8,10]),q2=pick1([2,5]),u2=pick1([3,4,6]),ans=q1*u1+q2*u2;
    return mark(qc(
      table(['Kuantiti','Item','Harga seunit'],[[q1,'Buku',rm(u1)],[q2,'Fail',rm(u2)]])+
      'Berapakah jumlah invois?',
      rm(ans),[Nq(rm(q1*u1),'invoice'),Nq(rm(q2*u2),'invoice'),Nq(rm(q1+u1+q2+u2),'operation')],
      'Darab kuantiti dengan harga seunit bagi setiap item, kemudian jumlahkan.','Tahun 6 · Invois'
    ),'3.1.1/3.3.1',mode,'table','application',s,['invoice','multi_item']);
  }
  if(mode==='invoice_missing_line'){
    const q=pick1([3,4,5]),unit=pick1([7,9,12]),total=q*unit;
    return mark(qc(
      table(['Kuantiti','Item','Harga seunit','Jumlah'],[[q,'Pen',rm(unit),'?'],[2,'Buku',rm(8),rm(16)]])+
      'Berapakah jumlah bagi baris Pen?',
      rm(total),[Nq(rm(unit),'invoice'),Nq(rm(q+unit),'operation'),Nq(rm(total+16),'invoice')],
      'Jumlah satu baris = kuantiti × harga seunit.','Tahun 6 · Lengkapkan Invois'
    ),'3.1.1/3.3.1',mode,'table','application',s,['invoice']);
  }
  if(mode==='receipt_service_tax_total'){
    const subtotal=pick1([60,80,120,150]),pct=pick1([6,8,10]),tax=tidy(subtotal*pct/100,2),ans=subtotal+tax;
    return mark(qc(
      table(['Butiran','RM'],[['Jumlah makanan',rm(subtotal)],['Cukai perkhidmatan',pct+'%'],['Jumlah bayaran','?']])+
      'Berapakah jumlah bayaran pada resit?',
      rm(ans),[Nq(rm(tax),'tax'),Nq(rm(subtotal),'money'),Nq(rm(subtotal-tax),'tax')],
      'Kira cukai perkhidmatan, kemudian tambah kepada jumlah makanan.','Tahun 6 · Resit dan Cukai Perkhidmatan'
    ),'3.1.2/3.3.1',mode,'table','application',s,['tax','receipt']);
  }
  if(mode==='service_tax_value'){
    const bill=pick1([50,75,100,125]),pct=pick1([6,8,10]),tax=tidy(bill*pct/100,2);
    return mark(qc(
      'Bil sebelum cukai ialah '+rm(bill)+'. Cukai perkhidmatan '+pct+'% dikenakan. Berapakah nilai cukai?',
      rm(tax),[Nq(rm(bill+tax),'tax'),Nq(rm(bill-tax),'tax'),Nq(rm(pct),'tax')],
      'Nilai cukai = kadar cukai × jumlah sebelum cukai.','Tahun 6 · Cukai Perkhidmatan'
    ),'3.1.2',mode,'story','application',s,['tax','percent']);
  }
  if(mode==='interest_savings'){
    const principal=pick1([500,800,1000,1500]),rate=pick1([2,3,4,5]),interest=principal*rate/100;
    return mark(qc(
      'Simpanan '+rm(principal)+' menerima faedah '+rate+'% setahun. Berapakah faedah selepas setahun?',
      rm(interest),[Nq(rm(principal+interest),'interest'),Nq(rm(rate),'interest'),Nq(rm(principal-rate),'operation')],
      'Faedah = kadar × jumlah simpanan.','Tahun 6 · Faedah Simpanan'
    ),'3.1.2',mode,'story','application',s,['interest','percent']);
  }
  if(mode==='interest_loan_years'){
    const principal=pick1([2000,3000,5000,8000]),rate=pick1([2,3,4,5]),years=pick1([2,3,4]),interest=principal*rate/100*years;
    return mark(qc(
      'Pinjaman '+rm(principal)+' dikenakan faedah '+rate+'% setahun selama '+years+' tahun. Berapakah jumlah faedah?',
      rm(interest),[Nq(rm(principal+interest),'interest'),Nq(rm(principal*rate/100),'interest'),Nq(rm(principal-rate*years),'operation')],
      'Kira faedah setahun, kemudian darab bilangan tahun.','Tahun 6 · Faedah Pinjaman'
    ),'3.1.2',mode,'story','application',s,['interest','duration']);
  }
  if(mode==='dividend_value'){
    const investment=pick1([1000,2000,4000,5000]),rate=pick1([4,5,6,8]),div=investment*rate/100;
    return mark(qc(
      'Pelaburan '+rm(investment)+' menerima dividen '+rate+'%. Berapakah nilai dividen?',
      rm(div),[Nq(rm(investment+div),'dividend'),Nq(rm(rate),'dividend'),Nq(rm(investment-rate),'operation')],
      'Dividen = kadar dividen × nilai pelaburan.','Tahun 6 · Nilai Dividen'
    ),'3.1.2',mode,'story','application',s,['dividend','percent']);
  }
  if(mode==='dividend_rate'){
    const investment=pick1([1000,2000,4000,5000]),rate=pick1([4,5,6,8]),div=investment*rate/100;
    return mark(qc(
      'Modal pelaburan '+rm(investment)+' menghasilkan dividen '+rm(div)+'. Berapakah kadar dividen?',
      rate+'%',[Nq((rate+1)+'%','dividend'),Nq((rate*10)+'%','dividend'),Nq((div/investment)+'%','dividend')],
      'Kadar dividen = dividen ÷ modal × 100%.','Tahun 6 · Kadar Dividen'
    ),'3.1.2',mode,'story','application',s,['dividend','inverse']);
  }
  if(mode==='net_asset'){
    const assets=pick1([12000,18000,25000,32000]),liab=pick1([4000,6500,9000,12000]),net=assets-liab;
    return mark(qc(
      table(['Kedudukan kewangan','Nilai'],[['Jumlah aset',rm(assets)],['Jumlah liabiliti',rm(liab)]])+
      'Berapakah nilai harta bersih?',
      rm(net),[Nq(rm(assets+liab),'asset_liability'),Nq(rm(liab),'asset_liability'),Nq(rm(assets),'asset_liability')],
      'Harta bersih = jumlah aset − jumlah liabiliti.','Tahun 6 · Aset dan Liabiliti'
    ),'3.3.1',mode,'table','application',s,['asset_liability']);
  }
  if(mode==='money_sufficient'){
    const shoe=pick1([40,50,60]),disc=pick1([10,20]),sock=pick1([8,10]),cash=pick1([50,60,70,80]),pay=shoe*(100-disc)/100+sock,ans=cash>=pay?'mencukupi':'tidak mencukupi';
    return mark(qc(
      'Kasut berharga '+rm(shoe)+' diberi diskaun '+disc+'%. Stoking berharga '+rm(sock)+'. Murid mempunyai '+rm(cash)+'. Adakah wangnya mencukupi untuk membeli kedua-duanya?',
      ans,[Nq(ans==='mencukupi'?'tidak mencukupi':'mencukupi','money'),Nq('tidak boleh ditentukan','money'),Nq('hanya cukup membeli stoking','money')],
      'Cari harga kasut selepas diskaun, tambah harga stoking, kemudian banding dengan wang yang ada.','Tahun 6 · Kewajaran Bayaran'
    ),'3.3.1',mode,'story','application',s,['discount','compare']);
  }
  if(mode==='multi_item_discount'){
    const p1=pick1([20,30,40]),p2=pick1([10,15,25]),disc=pick1([10,20]),subtotal=p1+p2,ans=tidy(subtotal*(100-disc)/100,2);
    return mark(qc(
      'Dua barang berharga '+rm(p1)+' dan '+rm(p2)+'. Kedai memberi diskaun '+disc+'% atas jumlah pembelian. Berapakah bayaran akhir?',
      rm(ans),[Nq(rm(subtotal),'discount'),Nq(rm(subtotal-subtotal*disc/100+disc),'operation'),Nq(rm(subtotal*disc/100),'discount')],
      'Jumlahkan harga dahulu, kemudian kira diskaun atas jumlah tersebut.','Tahun 6 · Pembelian Berbilang Item'
    ),'3.3.1',mode,'story','application',s,['discount','multi_item']);
  }
  const subtotal=pick1([80,120,160]),taxRate=pick1([6,8,10]),tax=tidy(subtotal*taxRate/100,2),total=subtotal+tax;
  return mark(qc(
    'Jumlah pada bil sebelum cukai '+rm(subtotal)+'. Cukai perkhidmatan '+taxRate+'% dikenakan. Berapakah jumlah akhir bil?',
    rm(total),[Nq(rm(tax),'tax'),Nq(rm(subtotal-tax),'tax'),Nq(rm(subtotal+taxRate),'operation')],
    'Tambah nilai cukai kepada jumlah sebelum cukai.','Tahun 6 · Bil dan Cukai'
  ),'3.3.1',mode,'story','application',s,['tax','multi_step']);
}

const HIGH_MODES=[
  'all_stock_profit','discount_then_profit','compare_discount_rebate','compare_two_discount_offers',
  'invoice_tax_voucher','invoice_trade_discount','receipt_multiitem_tax',
  'loan_total_payment','savings_interest_growth','dividend_compare','dividend_rate_reverse',
  'asset_liability_decision','asset_liability_change','insurance_risk_choice',
  'profit_error_analysis','tax_error_analysis','discount_error_analysis',
  'reverse_cost_from_discounted_sale','business_target_profit','financial_plan_choice'
];
function highQ(s){
  const mode=rotate(HIGH_MODES);
  if(mode==='all_stock_profit'){
    const qty=pick1([12,15,20]),unitCost=pick1([4,6,8]),unitSell=unitCost+pick1([2,3,4]),cost=qty*unitCost,sales=qty*unitSell,profit=sales-cost;
    return mark(qc(
      'Seorang peniaga membeli '+qty+' unit barang pada '+rm(unitCost)+' seunit dan menjual semuanya pada '+rm(unitSell)+' seunit. Berapakah jumlah untung?',
      rm(profit),[Nq(rm(sales),'profit_loss'),Nq(rm(cost),'profit_loss'),Nq(rm(unitSell-unitCost),'profit_loss')],
      'Cari jumlah harga kos dan jumlah hasil jualan sebelum mencari beza.','Tahun 6 · Untung Keseluruhan'
    ),'3.3.1',mode,'story','reasoning',s,['profit_loss','multi_step']);
  }
  if(mode==='discount_then_profit'){
    const list=pick1([120,160,200]),disc=pick1([10,20,25]),cost=pick1([80,100,120]),sell=tidy(list*(100-disc)/100,2),profit=sell-cost,ans=profit>=0?'untung '+rm(profit):'rugi '+rm(Math.abs(profit));
    return mark(qc(
      'Harga bertanda '+rm(list)+'. Selepas diskaun '+disc+'%, barang dijual kepada pelanggan. Harga kos peniaga '+rm(cost)+'. Apakah keputusan jualan sebenar?',
      ans,[Nq('untung '+rm(Math.abs(list-cost)),'profit_loss'),Nq('rugi '+rm(Math.abs(sell-cost)),'profit_loss'),Nq('tiada untung atau rugi','profit_loss')],
      'Cari harga jual sebenar selepas diskaun, kemudian banding dengan harga kos.','Tahun 6 · Diskaun dan Untung/Rugi'
    ),'3.3.1',mode,'story','reasoning',s,['discount','profit_loss','multi_step']);
  }
  if(mode==='compare_discount_rebate'){
    const price=pick1([100,150,200]),disc=pick1([10,20]),reb=pick1([15,25,30]),payA=price*(100-disc)/100,payB=price-reb,ans=payA<payB?'diskaun '+disc+'%':payB<payA?'rebat '+rm(reb):'kedua-duanya sama';
    return mark(qc(
      'Barang berharga '+rm(price)+'. Pilihan A: diskaun '+disc+'%. Pilihan B: rebat '+rm(reb)+'. Pilihan mana menghasilkan bayaran lebih rendah?',
      ans,[Nq(ans.startsWith('diskaun')?'rebat '+rm(reb):'diskaun '+disc+'%','discount'),Nq('harga asal','discount'),Nq('tidak boleh dibanding','discount')],
      'Kira bayaran akhir bagi kedua-dua pilihan, kemudian banding.','Tahun 6 · Banding Diskaun dan Rebat'
    ),'3.3.1',mode,'story','reasoning',s,['discount','rebate','compare']);
  }
  if(mode==='compare_two_discount_offers'){
    const price=pick1([120,160,200]),a=pick1([10,15]),b=pick1([20,25]),voucher=pick1([5,10]),payA=price*(100-a)/100-voucher,payB=price*(100-b)/100,ans=payA<payB?'Pakej A':payB<payA?'Pakej B':'kedua-duanya sama';
    return mark(qc(
      'Harga asal '+rm(price)+'. Pakej A: diskaun '+a+'% dan baucar '+rm(voucher)+'. Pakej B: diskaun '+b+'% sahaja. Pilihan mana lebih murah?',
      ans,[Nq(ans==='Pakej A'?'Pakej B':'Pakej A','discount'),Nq('kedua-duanya sama tanpa pengiraan','discount'),Nq('harga asal','discount')],
      'Cari bayaran akhir setiap pakej termasuk baucar, kemudian banding.','Tahun 6 · Membanding Tawaran'
    ),'3.3.1',mode,'story','reasoning',s,['discount','voucher','compare']);
  }
  if(mode==='invoice_tax_voucher'){
    const q1=pick1([2,3]),u1=pick1([12,15]),q2=pick1([1,2]),u2=pick1([20,25]),voucher=pick1([10,15]),taxRate=pick1([6,8]),sub=q1*u1+q2*u2-voucher,tax=tidy(sub*taxRate/100,2),ans=sub+tax;
    return mark(qc(
      table(['Kuantiti','Item','Harga seunit'],[[q1,'Buku',rm(u1)],[q2,'Beg',rm(u2)]])+
      'Baucar '+rm(voucher)+' ditolak dahulu. Kemudian cukai perkhidmatan '+taxRate+'% dikenakan pada baki. Bayaran akhir?',
      rm(ans),[Nq(rm(sub),'invoice'),Nq(rm(q1*u1+q2*u2),'invoice'),Nq(rm(sub-tax),'tax')],
      'Jumlahkan invois, tolak baucar, kira cukai pada baki, kemudian tambah cukai.','Tahun 6 · Invois, Baucar dan Cukai'
    ),'3.3.1',mode,'table','reasoning',s,['invoice','voucher','tax','multi_step']);
  }
  if(mode==='invoice_trade_discount'){
    const q=pick1([10,12,15]),unit=pick1([8,10,12]),disc=pick1([10,20]),gross=q*unit,off=gross*disc/100,net=gross-off;
    return mark(qc(
      table(['Kuantiti','Item','Harga seunit'],[[q,'Buku latihan',rm(unit)]])+
      'Pembekal memberi diskaun niaga '+disc+'%. Berapakah jumlah akhir invois?',
      rm(net),[Nq(rm(gross),'invoice'),Nq(rm(off),'discount'),Nq(rm(gross+off),'operation')],
      'Cari jumlah kasar invois, kemudian tolak nilai diskaun.','Tahun 6 · Invois dan Diskaun'
    ),'3.3.1',mode,'table','reasoning',s,['invoice','discount']);
  }
  if(mode==='receipt_multiitem_tax'){
    const a=pick1([2,3]),pa=pick1([10,12]),b=pick1([2,4]),pb=pick1([5,8]),taxRate=pick1([6,10]),sub=a*pa+b*pb,tax=tidy(sub*taxRate/100,2),ans=sub+tax;
    return mark(qc(
      table(['Kuantiti','Item','Harga seunit'],[[a,'Hidangan A',rm(pa)],[b,'Minuman',rm(pb)]])+
      'Cukai perkhidmatan '+taxRate+'% dikenakan pada jumlah makanan dan minuman. Berapakah jumlah resit?',
      rm(ans),[Nq(rm(sub),'receipt'),Nq(rm(tax),'tax'),Nq(rm(sub-tax),'tax')],
      'Kira jumlah semua item dahulu, kemudian cukai dan jumlah akhir.','Tahun 6 · Resit Pelbagai Item'
    ),'3.3.1',mode,'table','reasoning',s,['receipt','tax','multi_item']);
  }
  if(mode==='loan_total_payment'){
    const p=pick1([3000,5000,8000]),rate=pick1([3,4,5]),years=pick1([2,3,4]),interest=p*rate/100*years,total=p+interest;
    return mark(qc(
      'Pinjaman '+rm(p)+' dikenakan faedah '+rate+'% setahun selama '+years+' tahun. Berapakah jumlah keseluruhan yang perlu dibayar?',
      rm(total),[Nq(rm(interest),'interest'),Nq(rm(p+p*rate/100),'interest'),Nq(rm(p-rate*years),'operation')],
      'Kira jumlah faedah untuk semua tahun, kemudian tambah kepada pinjaman asal.','Tahun 6 · Jumlah Bayaran Pinjaman'
    ),'3.3.1',mode,'story','reasoning',s,['interest','duration','multi_step']);
  }
  if(mode==='savings_interest_growth'){
    const p=pick1([1000,2000]),rate=pick1([3,4]),y1=p*rate/100,b1=p+y1,y2=tidy(b1*rate/100,2),ans=b1+y2;
    return mark(qc(
      'Simpanan '+rm(p)+' menerima faedah '+rate+'% setahun. Faedah tahun kedua dikira atas baki selepas tahun pertama. Berapakah baki selepas 2 tahun?',
      rm(ans),[Nq(rm(p+y1*2),'interest'),Nq(rm(b1),'interest'),Nq(rm(y1+y2),'interest')],
      'Tambah faedah tahun pertama kepada modal; gunakan baki baharu untuk faedah tahun kedua.','Tahun 6 · Pertumbuhan Simpanan'
    ),'3.3.1',mode,'story','reasoning',s,['interest','multi_step']);
  }
  if(mode==='dividend_compare'){
    const a=pick1([[2000,5],[3000,4],[4000,3]]),b=pick1([[1500,7],[2500,5],[3500,4]]),da=a[0]*a[1]/100,db=b[0]*b[1]/100,ans=da>db?'Pelaburan A':db>da?'Pelaburan B':'kedua-duanya sama';
    return mark(qc(
      'Pelaburan A: '+rm(a[0])+' pada '+a[1]+'% dividen. Pelaburan B: '+rm(b[0])+' pada '+b[1]+'%. Yang memberi dividen lebih tinggi?',
      ans,[Nq(ans==='Pelaburan A'?'Pelaburan B':'Pelaburan A','dividend'),Nq('kedua-duanya sama tanpa pengiraan','dividend'),Nq('modal lebih besar sentiasa menang','dividend')],
      'Kira nilai dividen kedua-dua pelaburan sebelum membandingkan.','Tahun 6 · Membanding Dividen'
    ),'3.3.1',mode,'story','reasoning',s,['dividend','compare']);
  }
  if(mode==='dividend_rate_reverse'){
    const investment=pick1([2000,4000,5000]),rate=pick1([4,5,6]),div=investment*rate/100;
    return mark(qc(
      'Seorang pelabur menerima dividen '+rm(div)+' daripada modal '+rm(investment)+'. Berapakah kadar dividennya?',
      rate+'%',[Nq((rate+2)+'%','dividend'),Nq((rate*10)+'%','dividend'),Nq((div/investment)+'%','dividend')],
      'Kadar = dividen ÷ modal × 100%.','Tahun 6 · Menentukan Kadar Dividen'
    ),'3.3.1',mode,'story','reasoning',s,['dividend','inverse']);
  }
  if(mode==='asset_liability_decision'){
    const assets=pick1([50000,80000,120000]),liab=pick1([30000,60000,90000]),ans=assets>liab?'kedudukan lebih baik kerana aset melebihi liabiliti':'kedudukan berisiko kerana liabiliti melebihi aset';
    return mark(qc(
      table(['Perkara','Nilai'],[['Jumlah aset',rm(assets)],['Jumlah liabiliti',rm(liab)]])+
      'Apakah penilaian paling munasabah terhadap kedudukan kewangan ini?',
      ans,[Nq(ans.startsWith('kedudukan lebih baik')?'kedudukan berisiko kerana liabiliti melebihi aset':'kedudukan lebih baik kerana aset melebihi liabiliti','asset_liability'),Nq('tidak boleh dinilai langsung','asset_liability'),Nq('aset dan liabiliti sentiasa sama','asset_liability')],
      'Banding jumlah aset dengan jumlah liabiliti.','Tahun 6 · Menilai Aset dan Liabiliti'
    ),'3.3.1',mode,'table','reasoning',s,['asset_liability','compare']);
  }
  if(mode==='asset_liability_change'){
    const assets=50000,liab=30000,newDebt=8000,netBefore=assets-liab,netAfter=assets-(liab+newDebt);
    return mark(qc(
      'Aset sebuah keluarga '+rm(assets)+' dan liabiliti '+rm(liab)+'. Jika mereka menambah pinjaman baharu '+rm(newDebt)+' tanpa menambah aset, apakah harta bersih baharu?',
      rm(netAfter),[Nq(rm(netBefore),'asset_liability'),Nq(rm(assets+liab+newDebt),'asset_liability'),Nq(rm(newDebt),'asset_liability')],
      'Liabiliti meningkat; harta bersih = aset − jumlah liabiliti baharu.','Tahun 6 · Perubahan Kedudukan Kewangan'
    ),'3.3.1',mode,'story','reasoning',s,['asset_liability','multi_step']);
  }
  if(mode==='insurance_risk_choice'){
    const item=pick1([
      ['rumah keluarga','kebakaran atau kerosakan besar'],
      ['kereta keluarga','kemalangan atau kecurian'],
      ['kesihatan pencarum','perbelanjaan rawatan yang tinggi']
    ]);
    return mark(qc(
      'Sebuah keluarga mahu mengurangkan risiko kewangan berkaitan '+item[0]+' akibat '+item[1]+'. Tindakan paling sesuai?',
      'memilih perlindungan insurans atau takaful yang sesuai',
      [Nq('mengabaikan risiko kerana ia belum berlaku','insurance'),Nq('membuat hutang baharu untuk semua risiko','insurance'),Nq('menyimpan resit sahaja sebagai perlindungan','insurance')],
      'Pilih perlindungan yang berkaitan dengan aset atau pencarum dan risiko yang dihadapi.','Tahun 6 · Risiko dan Perlindungan'
    ),'3.2.2/3.3.1',mode,'story','reasoning',s,['insurance','risk']);
  }
  if(mode==='profit_error_analysis')return mark(qc(
    'Harga kos RM240 dan harga jual RM300. Seorang murid berkata untung ialah RM540 kerana dia menambah kedua-duanya. Penilaian?',
    'salah, untung ialah RM60',[Nq('betul','profit_loss'),Nq('salah, untung ialah RM300','profit_loss'),Nq('salah, rugi RM60','profit_loss')],
    'Untung ialah beza harga jual dan harga kos, bukan jumlah.','Tahun 6 · Analisis Kesilapan Untung'
  ),'3.3.1',mode,'verbal','reasoning',s,['profit_loss','error_analysis']);
  if(mode==='tax_error_analysis')return mark(qc(
    'Bil sebelum cukai RM120. Cukai perkhidmatan 10%. Murid menulis jumlah akhir RM130. Penilaian?',
    'salah, jumlah akhir ialah RM132',[Nq('betul','tax'),Nq('salah, jumlah akhir RM120','tax'),Nq('salah, jumlah akhir RM12','tax')],
    '10% daripada RM120 ialah RM12; jumlah akhir RM132.','Tahun 6 · Analisis Kesilapan Cukai'
  ),'3.3.1',mode,'verbal','reasoning',s,['tax','error_analysis']);
  if(mode==='discount_error_analysis')return mark(qc(
    'Harga RM200 diberi diskaun 20%. Murid membayar RM180. Adakah pengiraan itu betul?',
    'tidak, harga selepas diskaun ialah RM160',[Nq('ya, RM180 betul','discount'),Nq('tidak, harga RM40','discount'),Nq('tidak, harga RM220','discount')],
    '20% daripada RM200 ialah RM40; RM200 − RM40 = RM160.','Tahun 6 · Analisis Kesilapan Diskaun'
  ),'3.3.1',mode,'verbal','reasoning',s,['discount','error_analysis']);
  if(mode==='reverse_cost_from_discounted_sale'){
    const list=200,disc=20,actual=160,profit=40,cost=120;
    return mark(qc(
      'Harga bertanda RM200 diberi diskaun 20%. Selepas jualan, peniaga masih untung RM40. Berapakah harga kos?',
      rm(cost),[Nq(rm(actual),'profit_loss'),Nq(rm(200-profit),'profit_loss'),Nq(rm(200*disc/100),'discount')],
      'Cari harga jual sebenar selepas diskaun, kemudian tolak untung untuk mendapatkan harga kos.','Tahun 6 · Harga Kos daripada Jualan Diskaun'
    ),'3.3.1',mode,'story','reasoning',s,['discount','profit_loss','inverse']);
  }
  if(mode==='business_target_profit'){
    const costPer=pick1([6,8,10]),qty=pick1([20,25]),target=pick1([60,80,100]),totalCost=costPer*qty,needed=totalCost+target,unitSell=needed/qty;
    return mark(qc(
      'Peniaga membeli '+qty+' unit pada '+rm(costPer)+' seunit. Dia mahu jumlah untung '+rm(target)+'. Jika semua unit dijual pada harga sama, harga jual minimum seunit?',
      rm(unitSell),[Nq(rm(costPer),'profit_loss'),Nq(rm(target/qty),'profit_loss'),Nq(rm((totalCost-target)/qty),'operation')],
      'Jumlah hasil yang diperlukan = jumlah kos + sasaran untung; kemudian bahagi bilangan unit.','Tahun 6 · Sasaran Untung'
    ),'3.3.1',mode,'story','reasoning',s,['profit_loss','planning']);
  }
  const planA={asset:60000,liab:25000,protect:true},planB={asset:65000,liab:50000,protect:false};
  return mark(qc(
    table(['Pelan','Aset','Liabiliti','Perlindungan'],[['A',rm(planA.asset),rm(planA.liab),'Ada'],['B',rm(planB.asset),rm(planB.liab),'Tiada']])+
    'Jika fokus pada harta bersih yang lebih tinggi dan pengurusan risiko yang lebih baik, pelan manakah lebih munasabah?',
    'Pelan A',[Nq('Pelan B','asset_liability'),Nq('kedua-duanya sama','asset_liability'),Nq('tidak boleh dibanding','asset_liability')],
    'Banding harta bersih dan pertimbangkan perlindungan risiko.','Tahun 6 · Keputusan Kewangan'
  ),'3.3.1',mode,'table','reasoning',s,['asset_liability','insurance','decision']);
}

banks.d6=function(id,s,shift){
  if(id!=='D6.MONEY')return prior(id,s,shift);
  const st=stage(s);
  const q=st===1?lowQ(s):st===2?coreQ(s):highQ(s);
  if(q)q.kssrMoneyRealVersion=V;
  return q;
};
window.PAY6MoneyReal={version:V,lowModes:LOW_MODES.slice(),coreModes:CORE_MODES.slice(),highModes:HIGH_MODES.slice()};
document.documentElement?.setAttribute('data-kssr-year6-money-real',V);
})();