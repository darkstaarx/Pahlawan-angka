// Darjah 2 Topic 6 — Ukuran. Phase 3.4 Cikgu Wajar repair.
window.PAQuestionBanks = window.PAQuestionBanks || {};
window.PAQuestionBanks.d2t6 = function(id,s,shift){
 if(id==="D2.6.1"){
   const mode=pick(['read','unit','compare']);
   if(mode==='read'){const cm=R(2,19);return Q(`${rulerSvg(cm)}Berapakah panjang garisan merah?`,`${cm} cm`,[N(`${cm+1} cm`,'unit'),N(`${Math.max(1,cm-1)} cm`,'unit'),N(`${cm} m`,'unit')],"Mula pada tanda 0 dan baca tanda di hujung garisan.","D2 Core · Panjang",true,true)}
   if(mode==='unit'){const item=pick([['pensel','cm'],['meja','cm'],['bilik darjah','m'],['panjang koridor','m']]);return Q(`Unit yang lebih sesuai untuk mengukur <b>${item[0]}</b> ialah?`,item[1],[N(item[1]==='cm'?'m':'cm','unit'),N('kg','unit'),N('mL','unit')],"Objek pendek biasanya cm; jarak lebih panjang biasanya m.","D2 Core · Unit Panjang",false,shift)}
   const a=R(3,18),b=R(3,18);if(a===b)return window.PAQuestionBanks.d2t6(id,s,shift);const ans=a>b?'A':'B';return Q(`Pita A panjangnya <b>${a} cm</b> dan Pita B <b>${b} cm</b>. Pita manakah lebih panjang?`,ans,[N(ans==='A'?'B':'A','compare'),N('Sama','compare'),N('Tidak tahu','generic')],"Banding nombor dengan unit yang sama.","D2 Application · Panjang",true,true);
 }
 if(id==="D2.6.2"){
   const mode=pick(['read','unit','compare']);
   if(mode==='read'){const g=pick([100,200,300,400,500,600,700,800,900]);return Q(`${scaleSvg(g)}Jarum penimbang menunjukkan berapa gram?`,`${g} g`,[N(`${Math.max(0,g-100)} g`,'unit'),N(`${Math.min(1000,g+100)} g`,'unit'),N(`${g} kg`,'unit')],"Baca senggatan pada skala dalam gram.","D2 Core · Jisim",true,true)}
   if(mode==='unit'){const item=pick([['pemadam','g'],['epal','g'],['beg beras','kg'],['beg sekolah','kg']]);return Q(`Unit yang lebih sesuai untuk jisim <b>${item[0]}</b> ialah?`,item[1],[N(item[1]==='g'?'kg':'g','unit'),N('cm','unit'),N('L','unit')],"Benda ringan biasanya g; benda lebih berat biasanya kg.","D2 Core · Unit Jisim",false,shift)}
   const a=pick([100,200,300,400,500,600,700,800,900]),b=pick([100,200,300,400,500,600,700,800,900]);if(a===b)return window.PAQuestionBanks.d2t6(id,s,shift);const ans=a>b?'A':'B';return Q(`Bungkusan A berjisim <b>${a} g</b> dan B <b>${b} g</b>. Yang manakah lebih berat?`,ans,[N(ans==='A'?'B':'A','compare'),N('Sama','compare'),N('Tidak tahu','generic')],"Banding nilai dengan unit yang sama.","D2 Application · Jisim",true,true);
 }
 if(id==="D2.6.3"){
   const mode=pick(['read','unit','compare']);
   if(mode==='read'){const ml=pick([100,200,300,400,500,600,700,800,900]);return Q(`${cylinderSvg(ml)}Berapakah isi padu air yang ditunjukkan?`,`${ml} mL`,[N(`${Math.max(0,ml-100)} mL`,'unit'),N(`${Math.min(1000,ml+100)} mL`,'unit'),N(`${ml} L`,'unit')],"Baca paras air pada senggatan silinder penyukat.","D2 Core · Isi Padu Cecair",true,true)}
   if(mode==='unit'){const item=pick([['ubat dalam sudu','mL'],['kotak jus kecil','mL'],['baldi air','L'],['botol air besar','L']]);return Q(`Unit yang lebih sesuai untuk isi padu <b>${item[0]}</b> ialah?`,item[1],[N(item[1]==='mL'?'L':'mL','unit'),N('kg','unit'),N('cm','unit')],"Jumlah kecil biasanya mL; bekas besar biasanya L.","D2 Core · Unit Cecair",false,shift)}
   const a=pick([100,200,300,400,500,600,700,800,900]),b=pick([100,200,300,400,500,600,700,800,900]);if(a===b)return window.PAQuestionBanks.d2t6(id,s,shift);const ans=a>b?'A':'B';return Q(`Bekas A mempunyai <b>${a} mL</b> air dan Bekas B <b>${b} mL</b>. Yang manakah mempunyai lebih banyak air?`,ans,[N(ans==='A'?'B':'A','compare'),N('Sama','compare'),N('Tidak tahu','generic')],"Banding nilai mL kedua-dua bekas.","D2 Application · Isi Padu",true,true);
 }
 if(id==="D2.6.4"){
   const domain=pick(['length','mass','volume']),op=Math.random()<.5?'add':'sub';
   if(domain==='length'){let a=R(30,120),b=R(10,Math.min(70,a));const ans=op==='add'?a+b:a-b;return Q(`Pita A ${a} cm. ${op==='add'?`Pita B ${b} cm disambungkan kepadanya`:`Sebanyak ${b} cm dipotong`}. Berapakah panjang ${op==='add'?'keseluruhan':'yang tinggal'}?`,`${ans} cm`,[N(`${Math.abs(a-b)} cm`,'operation'),N(`${a+b} cm`,'operation'),N(`${ans} kg`,'unit')],"Kenal pasti sama ada cerita meminta tambah atau tolak dan kekalkan unit cm.","D2 Application · Masalah Ukuran",true,true)}
   if(domain==='mass'){let a=pick([300,400,500,600,700,800,900]),b=pick([100,200,300]);if(op==='sub'&&b>a)b=100;const ans=op==='add'?a+b:a-b;return Q(`Bungkusan A berjisim ${a} g. ${op==='add'?`Bungkusan B berjisim ${b} g`:`Sebanyak ${b} g dikeluarkan`}. Berapakah jisim ${op==='add'?'keseluruhan':'yang tinggal'}?`,`${ans} g`,[N(`${Math.abs(a-b)} g`,'operation'),N(`${a+b} g`,'operation'),N(`${ans} mL`,'unit')],"Gunakan operasi yang sesuai dan kekalkan unit g.","D2 Application · Masalah Jisim",true,true)}
   let a=pick([300,400,500,600,700,800,900]),b=pick([100,200,300]);if(op==='sub'&&b>a)b=100;const ans=op==='add'?a+b:a-b;return Q(`Bekas mempunyai ${a} mL air. ${op==='add'?`${b} mL lagi ditambah`:`${b} mL digunakan`}. Berapakah isi padu ${op==='add'?'sekarang':'yang tinggal'}?`,`${ans} mL`,[N(`${Math.abs(a-b)} mL`,'operation'),N(`${a+b} mL`,'operation'),N(`${ans} g`,'unit')],"Kenal pasti operasi dan kekalkan unit mL.","D2 Application · Masalah Isi Padu",true,true);
 }
 return null;
};
