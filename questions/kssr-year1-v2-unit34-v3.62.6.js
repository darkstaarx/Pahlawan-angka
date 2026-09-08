// Year 1 Curriculum Bank v2 — Units 3 & 4: Pecahan dan Wang
(function(){
'use strict';
const RT=window.PAY1V2Runtime;if(!RT)return;
const {GEN,Nq,q,mark,chooseMode,bandModes,rand,choose,fractionStrip,moneyVis,table,name,food}=RT;
const fmt=c=>c<100?c+' sen':(c%100===0?'RM'+c/100:'RM'+Math.floor(c/100)+'.'+String(c%100).padStart(2,'0'));
const coinChoices=[5,10,20,50,100],ringgitChoices=[100,500,1000];

GEN['3.1.1']=function(id,s){
 const mode=chooseMode(id,'3.1.1',bandModes(s,['identify'],['identify','word_match'],['word_match','equivalent_name','non_example']));
 const cases=[[1,2,'satu perdua'],[1,4,'satu perempat'],[2,4,'dua perempat'],[3,4,'tiga perempat']],x=choose(cases),[n,d,word]=x;
 if(mode==='identify')return mark(q(`${fractionStrip(n,d)}Bahagian berlorek ialah?`,`${n}/${d}`,[Nq(`${d-n}/${d}`,'fraction'),Nq(`${d}/${n}`,'fraction'),Nq(`${n}/${Math.max(2,d+1)}`,'fraction')],'Penyebut ialah semua bahagian sama besar.','Tahun 1 · Kenal Pecahan'),id,'3.1.1',mode,'visual','concept',s,['fraction']);
 if(mode==='word_match')return mark(q(`${fractionStrip(n,d)}Nama pecahan yang betul?`,word,[Nq('satu perdua','fraction'),Nq('satu perempat','fraction'),Nq('dua perempat','fraction'),Nq('tiga perempat','fraction')].filter(o=>o.v!==word).slice(0,3),'Padankan bilangan bahagian berlorek dengan nama pecahan.','Tahun 1 · Nama Pecahan'),id,'3.1.1',mode,'visual','concept',s,['fraction']);
 if(mode==='equivalent_name'){
  const ans='satu perdua';return mark(q(`${fractionStrip(2,4)}Dua perempat memenuhi bahagian yang sama seperti?`,ans,[Nq('satu perempat','fraction'),Nq('tiga perempat','fraction'),Nq('satu keseluruhan','fraction')],'Dua daripada empat bahagian sama besar ialah separuh keseluruhan.','Tahun 1 · Hubungan Pecahan'),id,'3.1.1',mode,'visual','reasoning',s,['fraction']);
 }
 return mark(q('Yang manakah <b>bukan</b> menunjukkan satu perempat?','bahagian yang tidak sama besar',[Nq('1 daripada 4 bahagian sama besar','fraction'),Nq('suku daripada satu objek','fraction'),Nq('satu perempat daripada kek','fraction')],'Pecahan memerlukan bahagian yang sama besar.','Tahun 1 · Bukan Contoh Pecahan'),id,'3.1.1',mode,'verbal','reasoning',s,['fraction']);
};

GEN['3.2.1']=function(id,s){
 const mode=chooseMode(id,'3.2.1',bandModes(s,['share'],['share','remaining'],['remaining','compare_story']));
 if(mode==='share'){
  const d=choose([2,4]),n=rand(1,d-1),ans=`${n}/${d}`,item=choose(['roti canai','kuih bakar','buah tembikai']);
  return mark(q(`${item} dibahagi sama rata kepada <b>${d}</b> bahagian. ${name()} mengambil <b>${n}</b> bahagian. Pecahan yang diambil?`,ans,[Nq(`${d}/${n}`,'fraction'),Nq(`${d-n}/${d}`,'fraction'),Nq(`${n}/${d+1}`,'fraction')],'Jumlah bahagian sama besar menjadi penyebut.','Tahun 1 · Pecahan dalam Kehidupan'),id,'3.2.1',mode,'story','application',s,['fraction']);
 }
 if(mode==='remaining'){
  const d=4,taken=choose([1,2,3]),left=d-taken,ans=`${left}/4`;
  return mark(q(`Sebiji kuih dibahagi kepada <b>4</b> bahagian sama besar. <b>${taken}</b> bahagian dimakan. Pecahan yang tinggal?`,ans,[Nq(`${taken}/4`,'fraction'),Nq(`4/${left}`,'fraction'),Nq(`${left}/2`,'fraction')],'Bahagian tinggal = semua bahagian − bahagian dimakan.','Tahun 1 · Pecahan Tinggal'),id,'3.2.1',mode,'story','application',s,['fraction','operation']);
 }
 return mark(q('Aina makan satu perempat roti canai, Kumar makan dua perempat daripada roti yang sama saiz. Siapa makan bahagian lebih besar?','Kumar',[Nq('Aina','fraction'),Nq('sama banyak','fraction'),Nq('tidak boleh dibanding','fraction')],'Penyebut sama: banding bilangan bahagian yang diambil.','Tahun 1 · Banding Pecahan Harian'),id,'3.2.1',mode,'story','reasoning',s,['fraction','compare']);
};

GEN['4.1.1']=function(id,s){
 const mode=chooseMode(id,'4.1.1',bandModes(s,['recognise_coin'],['recognise_coin','recognise_note'],['recognise_coin','recognise_note','malaysia_currency']));
 if(mode==='recognise_coin'){
  const c=choose([5,10,20,50]);return mark(q(`${moneyVis(c)}Nilai duit syiling ini?`,fmt(c),[Nq(fmt(c===5?10:5),'money'),Nq(fmt(Math.min(50,c+10)),'money'),Nq('RM'+c,'money')],'Lihat nilai pada duit syiling Malaysia.','Tahun 1 · Duit Syiling Malaysia'),id,'4.1.1',mode,'visual','concept',s,['money']);
 }
 if(mode==='recognise_note'){
  const c=choose([100,500,1000]);return mark(q(`${moneyVis(c)}Nilai wang kertas ini?`,fmt(c),[Nq(fmt(c===100?500:100),'money'),Nq(fmt(Math.max(100,c-100)),'money'),Nq(c+' sen','money')],'Kenal nilai wang kertas Malaysia.','Tahun 1 · Wang Kertas Malaysia'),id,'4.1.1',mode,'visual','concept',s,['money']);
 }
 return mark(q('Mata wang yang digunakan di Malaysia ialah?','Ringgit Malaysia',[Nq('Baht','money'),Nq('Yen','money'),Nq('Dolar Singapura','money')],'Mata wang Malaysia ialah Ringgit Malaysia (RM).','Tahun 1 · Mata Wang Malaysia'),id,'4.1.1',mode,'verbal','application',s,['money']);
};

GEN['4.1.2']=function(id,s){
 const mode=chooseMode(id,'4.1.2',bandModes(s,['combine_sen'],['combine_sen','combine_ringgit'],['combine_sen','combine_ringgit','choose_representation']));
 if(mode==='combine_sen'){
  const a=choose([10,20,50]),b=choose([5,10,20]),total=Math.min(100,a+b);
  return mark(q(`${moneyVis(a)}${moneyVis(b)}Jumlah nilai wang?`,fmt(total),[Nq(fmt(Math.abs(a-b)),'money'),Nq(fmt(Math.min(100,total+10)),'money'),Nq(total+' RM','money')],'Tambah nilai kedua-dua syiling.','Tahun 1 · Wakil Nilai Sen'),id,'4.1.2',mode,'visual','procedure',s,['money','operation']);
 }
 if(mode==='combine_ringgit'){
  const a=choose([100,200,500]),b=choose([100,200,500]);const total=Math.min(1000,a+b);
  return mark(q(`Wang RM${a/100} dan RM${b/100} berjumlah?`,fmt(total),[Nq(fmt(Math.abs(a-b)),'money'),Nq(fmt(Math.min(1000,total+100)),'money'),Nq(total+' sen','money')],'Tambah nilai ringgit.','Tahun 1 · Wakil Nilai Ringgit'),id,'4.1.2',mode,'story','procedure',s,['money']);
 }
 const target=choose([50,100,200,500]);const ans=target===50?'2 syiling 20 sen + 1 syiling 10 sen':target===100?'2 syiling 50 sen':target===200?'2 keping RM1':'1 keping RM5';
 return mark(q(`Gabungan manakah mewakili <b>${fmt(target)}</b>?`,ans,[Nq(target===50?'1 syiling 20 sen':'1 keping RM1','money'),Nq(target===100?'1 syiling 50 sen':'3 keping RM1','money'),Nq(target===500?'2 keping RM5':'1 syiling 10 sen','money')],'Jumlahkan nilai dalam setiap gabungan.','Tahun 1 · Pilih Perwakilan Wang'),id,'4.1.2',mode,'verbal','reasoning',s,['money']);
};

GEN['4.1.3']=function(id,s){
 const mode=chooseMode(id,'4.1.3',bandModes(s,['exchange_coin'],['exchange_coin','exchange_note'],['exchange_coin','exchange_note','exchange_reason']));
 if(mode==='exchange_coin'){
  const target=choose([20,50,100]),ans=target===20?'2 syiling 10 sen':target===50?'5 syiling 10 sen':'2 syiling 50 sen';
  return mark(q(`${fmt(target)} boleh ditukar kepada gabungan setara yang mana?`,ans,[Nq(target===20?'1 syiling 10 sen':'1 syiling 20 sen','money'),Nq(target===100?'1 syiling 50 sen':'2 syiling 20 sen','money'),Nq('nilai tidak boleh ditukar','money')],'Nilai keseluruhan mesti kekal sama.','Tahun 1 · Tukar Syiling'),id,'4.1.3',mode,'verbal','application',s,['money']);
 }
 if(mode==='exchange_note'){
  const target=choose([200,500,1000]),ans=target===200?'2 keping RM1':target===500?'5 keping RM1':'2 keping RM5';
  return mark(q(`${fmt(target)} boleh ditukar kepada?`,ans,[Nq(target===500?'2 keping RM1':'1 keping RM1','money'),Nq(target===1000?'1 keping RM5':'1 keping RM10','money'),Nq('tidak boleh ditukar','money')],'Banding jumlah ringgit sebelum dan selepas pertukaran.','Tahun 1 · Tukar Ringgit'),id,'4.1.3',mode,'verbal','application',s,['money']);
 }
 return mark(q(`${name()} menukar RM1 kepada satu syiling 50 sen. Adakah nilainya sama?`,'tidak sama',[Nq('sama','money'),Nq('50 sen lebih besar','money'),Nq('tidak boleh dibanding','money')],'RM1 bersamaan 100 sen, bukan 50 sen.','Tahun 1 · Semak Pertukaran Wang'),id,'4.1.3',mode,'story','reasoning',s,['money']);
};

GEN['4.2.1']=function(id,s){
 const mode=chooseMode(id,'4.2.1',bandModes(s,['source'],['source','saving_place'],['source','saving_place','reason_source']));
 if(mode==='source')return mark(q('Yang manakah contoh <b>sumber kewangan</b> seorang murid?','duit belanja daripada penjaga',[Nq('buku latihan','finance'),Nq('botol air','finance'),Nq('jadual kelas','finance')],'Sumber kewangan ialah dari mana wang diperoleh.','Tahun 1 · Sumber Kewangan'),id,'4.2.1',mode,'verbal','concept',s,['finance']);
 if(mode==='saving_place')return mark(q('Cara mudah menyimpan sebahagian wang belanja ialah?','masukkan ke dalam tabung',[Nq('belanjakan semuanya','finance'),Nq('buang baki syiling','finance'),Nq('tinggalkan di kantin','finance')],'Simpanan ialah wang yang diketepikan untuk kegunaan kemudian.','Tahun 1 · Simpanan'),id,'4.2.1',mode,'verbal','application',s,['finance']);
 return mark(q(`${name()} menerima RM2 wang belanja dan menyimpan RM1. Yang manakah sumber kewangannya?`,'wang belanja',[Nq('tabung','finance'),Nq('RM1 yang disimpan','finance'),Nq('kantin','finance')],'Sumber ialah dari mana wang itu datang; tabung ialah tempat menyimpan.','Tahun 1 · Bezakan Sumber dan Simpanan'),id,'4.2.1',mode,'story','reasoning',s,['finance']);
};

GEN['4.2.2']=function(id,s){
 const mode=chooseMode(id,'4.2.2',bandModes(s,['read_record'],['read_record','saving_total'],['saving_total','missing_record']));
 const rows=[['Wang belanja',fmt(300)],['Belanja kantin',fmt(150)],['Simpan',fmt(100)]];
 if(mode==='read_record')return mark(q(`${table(['Catatan','Nilai'],rows)}Berapakah wang yang direkod sebagai simpanan?`,fmt(100),[Nq(fmt(300),'money'),Nq(fmt(150),'money'),Nq(fmt(50),'money')],'Cari baris “Simpan”.','Tahun 1 · Rekod Wang'),id,'4.2.2',mode,'table','concept',s,['money','data']);
 if(mode==='saving_total'){
  const a=choose([50,100,150]),b=choose([50,100]);return mark(q(`${table(['Hari','Simpan'],[['Isnin',fmt(a)],['Selasa',fmt(b)]])}Jumlah simpanan dua hari?`,fmt(a+b),[Nq(fmt(Math.abs(a-b)),'money'),Nq(fmt(a),'money'),Nq(fmt(a+b+50),'money')],'Tambah simpanan kedua-dua hari.','Tahun 1 · Jumlah Simpanan'),id,'4.2.2',mode,'table','application',s,['money','operation']);
 }
 const source=300,spend=120,save=source-spend;return mark(q(`Wang belanja ${fmt(source)}. Belanja ${fmt(spend)}. Jika baki direkod sebagai simpanan, berapakah simpanan?`,fmt(save),[Nq(fmt(source),'money'),Nq(fmt(spend),'money'),Nq(fmt(source+spend),'money')],'Simpanan baki = sumber − perbelanjaan.','Tahun 1 · Rekod Hilang'),id,'4.2.2',mode,'story','reasoning',s,['money','operation']);
};

GEN['4.3.1']=function(id,s){
 const mode=chooseMode(id,'4.3.1',bandModes(s,['add_money'],['add_money','sub_money'],['sub_money','missing_money','reason_money']));
 if(mode==='add_money'){
  const a=choose([20,30,40,50]),b=choose([10,20,30]),ans=a+b;
  return mark(q(`Di kantin, satu ${food()} berharga ${fmt(a)} dan air ${fmt(b)}. Jumlah harga?`,fmt(ans),[Nq(fmt(Math.abs(a-b)),'money'),Nq(fmt(a),'money'),Nq(fmt(Math.min(100,ans+10)),'money')],'Tambah kedua-dua harga dalam sen.','Tahun 1 · Tambah Wang'),id,'4.3.1',mode,'story','application',s,['money','operation']);
 }
 if(mode==='sub_money'){
  const have=choose([100,200,500]),price=choose(have===100?[20,50]:[50,100,150]),ans=have-price;
  return mark(q(`${name()} ada ${fmt(have)} dan membeli makanan ${fmt(price)}. Baki?`,fmt(ans),[Nq(fmt(price),'money'),Nq(fmt(have),'money'),Nq(fmt(Math.min(1000,ans+50)),'money')],'Baki = wang yang ada − harga.','Tahun 1 · Tolak Wang'),id,'4.3.1',mode,'story','application',s,['money','operation']);
 }
 if(mode==='missing_money'){
  const price=choose([50,100,150]),change=choose([50,100]),paid=price+change;
  return mark(q(`Harga barang ${fmt(price)}. Baki selepas membayar ialah ${fmt(change)}. Berapakah wang yang dibayar?`,fmt(paid),[Nq(fmt(price),'money'),Nq(fmt(change),'money'),Nq(fmt(Math.abs(price-change)),'money')],'Wang dibayar = harga + baki.','Tahun 1 · Masalah Wang Songsang'),id,'4.3.1',mode,'story','reasoning',s,['money','operation']);
 }
 return mark(q(`${name()} ada RM5. Harga dua barang ialah RM2 dan RM1. Dia kata baki RM4. Baki sebenar?`,'RM2',[Nq('RM4','money'),Nq('RM3','money'),Nq('RM1','money')],'Tambah belanja dahulu: RM2 + RM1 = RM3, kemudian RM5 − RM3.','Tahun 1 · Semak Belanja'),id,'4.3.1',mode,'story','reasoning',s,['money','operation']);
};

document.documentElement?.setAttribute('data-y1-v2-unit34','3.62.6');
})();