/* Pahlawan Angka — short and long wordings for the common word problems of
   Darjah 3–6 (lens 4.8 language load, docs/PA-DIAGNOSTIC-BRAIN.md §4.8).
   Each family has a short wording (one sentence, at most 12 words) and a long
   one (2–3 sentences with extra names and detail) built from the SAME numbers
   and the same schema, so only the language differs. Every item says which it
   is (facets.reading 1 short, 3 long); the brain never guesses it from text.
   Families: jumlah (tambah), beza (tolak), kali ganda (darab), agih sama rata
   (bahagi), wang jumlah (tambah wang), wang baki (tolak wang).
   Pure module; Node-testable; also loaded by the app and by Gudang Harta. */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.PAReadingPairs=api;
})(typeof window!=='undefined'?window:undefined,function(){
  'use strict';
  const VERSION='1.0.0';
  const FAMILIES=['jumlah','beza','kali_ganda','agih','wang_jumlah','wang_baki'];

  const int=(r,a,b)=>a+Math.floor(r()*(b-a+1));
  const pick=(r,xs)=>xs[Math.floor(r()*xs.length)];
  // KSSR writes 10 000 and above with a space between thousands; a no-break space keeps a number on one line.
  // Answers and choices keep a plain space (the app parses and regroups them).
  const nf=(n,sep='\u00a0')=>{const s=String(Math.abs(n));return(n<0?'−':'')+(Math.abs(n)>=10000?s.replace(/\B(?=(\d{3})+(?!\d))/g,sep):s)};
  const rm=(sen,sep)=>`RM${nf(Math.floor(sen/100),sep)}.${String(sen%100).padStart(2,'0')}`;

  const NAMES=['Aiman','Siti','Mei Ling','Ravi','Aina','Daniel','Farah','Wei Jie','Priya','Hakim'];
  const TEACHERS=['Cikgu Lim','Cikgu Aminah','Cikgu Rajan','Cikgu Zul'];
  const ITEMS=['guli','setem','manik','pelekat','kad'];
  // Things to buy at a realistic price for the grade's money range.
  const GOODS={3:['sebuah buku cerita','sebatang pen','sebiji bola','sebuah kotak pensel'],4:['sepasang kasut','sebuah beg','sebuah jam tangan','sebuah basikal'],
    5:['sebuah telefon','sebuah komputer riba','sebuah peti sejuk','sebuah televisyen'],6:['sebuah motosikal','sebuah kereta terpakai','sebuah komputer riba','sebuah set sofa']};
  const g4=g=>Math.min(6,Math.max(3,Number(g)||3));
  const two=r=>{const a=pick(r,NAMES);let b=pick(r,NAMES);while(b===a)b=pick(r,NAMES);return[a,b]};

  /* Numbers sized for the grade (KSSR: D3 to 10 000, D4 to 100 000, D5–D6 to 1 000 000). */
  const CAP={3:9999,4:99999,5:999999,6:999999},MONEY={3:10000,4:100000,5:1000000,6:10000000};   // money cap in sen
  function numbers(family,grade,r){
    const g=g4(grade),cap=CAP[g],lo=Math.ceil(cap/40);
    if(family==='jumlah'){const a=int(r,lo,Math.floor(cap*.55)),b=int(r,lo,cap-a);return{a,b,ans:a+b}}
    if(family==='beza'){const a=int(r,Math.floor(cap*.3),cap),b=int(r,Math.ceil(a*.2),Math.floor(a*.8));return{a,b,ans:a-b}}
    if(family==='kali_ganda'){const k=int(r,2,9),a=int(r,13,Math.floor(cap/9));return{a,b:k,ans:a*k}}
    if(family==='agih'){const k=int(r,2,9),q=int(r,12,Math.floor(cap/9));return{a:q*k,b:k,ans:q}}
    const top=MONEY[g];   // money in sen, whole 10 sen
    if(family==='wang_jumlah'){const a=int(r,top/50,top*.5)/10|0,b=int(r,top/100,top*.4)/10|0;return{a:a*10,b:b*10,ans:(a+b)*10}}
    const a=(int(r,top/20,top*.9)/100|0)*100,b=(int(r,a*.15,a*.85)/10|0)*10;return{a,b,ans:a-b};   // wang_baki: a whole ringgit amount
  }

  /* Wordings. v = numbers, w = words (names, items). Short: one sentence, ≤12 words. */
  const T={
    jumlah:{op:'add',schema:'part_whole',
      short:[(v,w)=>`Berapakah jumlah ${nf(v.a)} ${w.item} merah dan ${nf(v.b)} ${w.item} biru?`,
        (v,w)=>`Berapakah jumlah ${nf(v.a)} ${w.item} ${w.n1} dan ${nf(v.b)} ${w.item} ${w.n2}?`],
      long:[(v,w)=>`Pada hari Sabtu, ${w.n1} dan ${w.n2} mengemas stor di rumah datuk mereka. ${w.n1} menjumpai ${nf(v.a)} ${w.item} merah di dalam sebuah kotak lama, manakala ${w.n2} menjumpai ${nf(v.b)} ${w.item} biru di bawah rak. Berapakah jumlah ${w.item} yang mereka jumpa?`,
        (v,w)=>`Kelab Kreatif sekolah mengumpul ${w.item} untuk projek hujung tahun. Murid Tahun ${w.g} menyumbang ${nf(v.a)} ${w.item} pada minggu pertama, dan guru-guru menyumbang ${nf(v.b)} ${w.item} lagi pada minggu kedua. Berapakah jumlah ${w.item} yang telah dikumpul?`]},
    beza:{op:'sub',schema:'compare_less',
      short:[(v,w)=>`Berapakah beza antara ${nf(v.a)} ${w.item} ${w.n1} dan ${nf(v.b)} ${w.item} ${w.n2}?`,
        (v,w)=>`${w.n1} ada ${nf(v.a)} ${w.item}, ${w.n2} ada ${nf(v.b)}, berapakah bezanya?`],
      long:[(v,w)=>`${w.n1} dan ${w.n2} mengumpul ${w.item} sejak awal tahun. Sekarang ${w.n1} menyimpan ${nf(v.a)} ${w.item} di dalam balang kaca, manakala ${w.n2} menyimpan ${nf(v.b)} ${w.item} di dalam kotak kasutnya. Berapakah beza bilangan ${w.item} mereka berdua?`,
        (v,w)=>`Sebuah kedai di Taman Melati menerima ${nf(v.a)} ${w.item} pada bulan Mac. Pada bulan April pula, kedai itu hanya menerima ${nf(v.b)} ${w.item} kerana lori penghantaran rosak. Berapakah beza bilangan ${w.item} yang diterima pada dua bulan itu?`]},
    kali_ganda:{op:'mul',schema:'multiplicative',
      short:[(v,w)=>`Berapakah ${v.b} kali ganda ${nf(v.a)} ${w.item}?`,
        (v,w)=>`Berapakah ${w.item} ${w.n2} jika dia ada ${v.b} kali ganda ${nf(v.a)} ${w.item}?`],
      long:[(v,w)=>`${w.n1} mengumpul ${nf(v.a)} ${w.item} dari pelbagai negeri. Sepupunya, ${w.n2}, lebih rajin mengumpul dan kini mempunyai ${v.b} kali ganda bilangan ${w.item} ${w.n1}. Berapakah bilangan ${w.item} ${w.n2}?`,
        (v,w)=>`Pada minggu pertama pesta karnival, gerai ${w.n1} menjual ${nf(v.a)} ${w.item}. Pada minggu kedua, jualan gerai itu meningkat sehingga ${v.b} kali ganda jualan minggu pertama. Berapakah ${w.item} yang dijual pada minggu kedua?`]},
    agih:{op:'div',schema:'multiplicative',
      short:[(v,w)=>`Berapa ${w.item} seorang jika ${nf(v.a)} ${w.item} diagih sama rata kepada ${v.b} murid?`,
        (v,w)=>`Jika ${nf(v.a)} ${w.item} dibahagi sama rata kepada ${v.b} kumpulan, berapakah setiap kumpulan?`],
      long:[(v,w)=>`${w.t} membeli ${nf(v.a)} ${w.item} untuk hari sukan sekolah. Dia mengagihkan semua ${w.item} itu sama rata kepada ${v.b} rumah sukan supaya setiap pasukan mendapat bahagian yang adil. Berapakah bilangan ${w.item} yang diterima oleh setiap rumah sukan?`,
        (v,w)=>`${w.n1} membantu ibunya menyediakan cenderamata untuk majlis perkahwinan sepupunya. Mereka ada ${nf(v.a)} ${w.item}, dan semuanya perlu dimasukkan sama rata ke dalam ${v.b} buah bakul. Berapakah bilangan ${w.item} dalam setiap bakul?`]},
    wang_jumlah:{op:'add',schema:'part_whole',money:true,
      short:[(v,w)=>`Berapakah jumlah harga ${w.goods} ${rm(v.a)} dan ${w.goods2} ${rm(v.b)}?`,
        (v,w)=>`Harga ${w.goods} ${rm(v.a)} dan ${w.goods2} ${rm(v.b)}, berapakah jumlahnya?`],
      long:[(v,w)=>`Semasa cuti sekolah, ${w.n1} pergi ke pusat beli-belah bersama ibunya. Ibunya memilih ${w.goods} berharga ${rm(v.a)} dan ${w.goods2} berharga ${rm(v.b)} sebagai hadiah untuk keluarga. Berapakah jumlah harga yang perlu dibayar?`,
        (v,w)=>w.g>=5?`Sebuah kedai di Taman Melati mencatat jualan ${rm(v.a)} pada bulan Mei. Pada bulan Jun pula, kedai itu mencatat jualan ${rm(v.b)} kerana ramai pelanggan datang semasa cuti sekolah. Berapakah jumlah jualan kedai itu dalam dua bulan?`
          :`Kelab Pengguna sekolah mengadakan jualan amal pada hari Jumaat. Gerai ${w.n1} mengutip ${rm(v.a)} pada waktu pagi dan ${rm(v.b)} lagi selepas waktu rehat. Berapakah jumlah wang yang dikutip oleh gerai itu?`]},
    wang_baki:{op:'sub',schema:'change',money:true,
      short:[(v,w)=>`Berapakah baki jika ${rm(v.b)} dibelanjakan daripada ${rm(v.a)}?`,
        (v,w)=>`${w.n1} ada ${rm(v.a)} dan membeli ${w.goods} ${rm(v.b)}, berapakah bakinya?`],
      long:[(v,w)=>w.g>=5?`Keluarga ${w.n1} menyimpan ${rm(v.a)} untuk perbelanjaan cuti sekolah. Sebelum bercuti, mereka menggunakan ${rm(v.b)} untuk membeli ${w.goods} di sebuah kedai di bandar. Berapakah baki simpanan keluarga itu?`
          :`${w.n1} menyimpan ${rm(v.a)} di dalam tabung sejak dua tahun lalu. Bulan ini dia menggunakan ${rm(v.b)} untuk membeli ${w.goods} sebagai hadiah hari jadi ayahnya. Berapakah baki simpanan ${w.n1}?`,
        (v,w)=>w.g>=5?`Persatuan Ibu Bapa dan Guru menerima derma sebanyak ${rm(v.a)} untuk menceriakan perpustakaan sekolah. Sebanyak ${rm(v.b)} telah dibelanjakan untuk membeli rak dan buku baharu. Berapakah baki wang derma itu?`
          :`Murid kelas ${w.g} Bestari mengutip ${rm(v.a)} untuk sambutan Hari Guru. Mereka membelanjakan ${rm(v.b)} untuk membeli kek dan kad ucapan. Berapakah baki wang kutipan kelas itu?`]}
  };
  const HINT={jumlah:'"Jumlah" bermaksud tambah semua bahagian.',beza:'"Beza" bermaksud tolak nombor kecil daripada nombor besar.',
    kali_ganda:'"Kali ganda" bermaksud darab.',agih:'"Sama rata" bermaksud bahagi.',wang_jumlah:'"Jumlah harga" bermaksud tambah.',wang_baki:'"Baki" bermaksud tolak.'};
  const LONG_HINT='Ayat panjang? Cari nombor dan soalan di ayat terakhir dulu.';

  /* One problem with both wordings (same numbers, names and schema). */
  function pair(family,grade,r=Math.random){
    const f=T[family];if(!f)return null;
    const v=numbers(family,grade,r),[n1,n2]=two(r),goods=GOODS[g4(grade)],goods2=pick(r,goods);
    const w={n1,n2,t:pick(r,TEACHERS),item:pick(r,ITEMS),g:g4(grade),goods:pick(r,goods.filter(x=>x!==goods2)),goods2},k=int(r,0,1);
    const answer=f.money?rm(v.ans,' '):v.ans,{a,b,ans}=v;
    // Wrong answers a child really gives: the other operation first, then a slip in the working.
    const W={add:[[Math.abs(a-b),'operation'],[ans+10,'place'],[ans-1,'counting']],sub:[[a+b,'operation'],[ans+10,'place'],[ans-1,'counting']],
      mul:[[a+b,'operation'],[a*(b+1),'times_neighbour'],[ans+10,'place']],div:[[a*b,'operation'],[ans+1,'counting'],[ans-1,'counting']]}[f.op];
    const wrongs=f.money?[{v:rm(f.op==='add'?Math.abs(a-b):a+b,' '),tag:'operation'},{v:rm(ans*10,' '),tag:'place_value_shift'},{v:`RM${ans}`,tag:'money_unit'}]
      :W.map(([x,tag])=>({v:x,tag}));
    const facets=reading=>({op:f.op,...(f.money?{context:'money'}:{operands:[v.a,v.b]}),format:'word',schema:f.schema,reading});
    const one=(reading,text)=>({prompt:text,answer,wrongs,facets:facets(reading),family,
      hint:reading===3?`${LONG_HINT} ${HINT[family]}`:HINT[family],calc:{op:f.op,a:v.a,b:v.b,ans:v.ans,unit:f.money?'sen':'',family}});
    return{family,numbers:v,short:one(1,f.short[k](v,w)),long:one(3,f.long[k](v,w))};
  }
  /* One wording of a fresh problem: reading 1 (short) or 3 (long). */
  function item(family,grade,reading,r=Math.random){const p=pair(family,grade,r);return p?(reading===3?p.long:p.short):null}
  /* The family that asks a brain finding's operation in its context (money or plain numbers). */
  function familyFor(op,context){
    if(context==='money')return op==='add'?'wang_jumlah':'wang_baki';
    return{add:'jumlah',sub:'beza',mul:'kali_ganda',div:'agih'}[op]||null;
  }
  // A number written 12 345 is one word.
  const words=s=>String(s).replace(/(\d)[ \u00a0](?=\d{3}\b)/g,'$1').trim().split(/\s+/).length;
  const sentences=s=>String(s).split(/[.?!](?:\s|$)/).filter(x=>x.trim()).length;
  return Object.freeze({VERSION,FAMILIES,pair,item,familyFor,words,sentences,_rm:rm,_nf:nf});
});
