// Singapore-inspired learning intervention: Concrete/Virtual -> Pictorial -> Abstract -> Transfer.
const LEARNING_STAGES=['Faham','Bina','Sambung','Cuba','Guna'];
let learningState=null;
const RESTU_LOCK_MS=5*60*1000;
const DUMMY_RESTU_KEY='RESTU5';
let restuTimerHandle=null;

function conceptKeyFor(skillId,tag){
  const m=META[skillId]||{};
  if(['place','digit_value','same_end','units_only'].includes(tag)||/PV|1\.4/.test(skillId))return'place';
  if(tag==='fraction'||m.domain==='Pecahan')return'fraction';
  if(tag==='decimal'||m.domain==='Perpuluhan')return'decimal';
  if(tag==='percent'||m.domain==='Peratus')return'percent';
  if(tag==='ratio'||['Nisbah','Kadaran'].includes(m.domain))return'ratio';
  if(tag==='money'||m.domain==='Wang')return'money';
  if(tag==='time'||m.domain==='Masa')return'time';
  if(tag==='unit'||m.domain==='Ukuran')return'measure';
  if(tag==='area')return'area';
  if(tag==='shape'||m.domain==='Ruang')return'shape';
  if(tag==='data'||['Data','Kebolehjadian'].includes(m.domain))return'data';
  if(tag==='coord'||['Kedudukan','Koordinat'].includes(m.domain))return'coord';
  if(['division','fact'].includes(tag)||/DIV|MUL|2\.[34]/.test(skillId))return'groups';
  if(m.domain==='Operasi'||tag==='operation')return'operation';
  return'general';
}
function baseTenVisual(){return `<div class="cpaBlocks"><div><span class="tenBlock"></span><span class="tenBlock"></span><span class="tenBlock"></span><small>3 puluh</small></div><div class="ones">● ● ● ●</div></div>`}
function fractionLessonVisual(){return `<div class="fractionModel"><span class="filled"></span><span class="filled"></span><span></span><span></span></div><div class="learningCaption">2 daripada 4 bahagian sama besar = 2/4</div>`}
function percentLessonVisual(){return `<div class="percentGrid">${Array.from({length:10},(_,i)=>`<span class="${i<4?'on':''}"></span>`).join('')}</div><div class="learningCaption">4 daripada 10 bahagian = 40%</div>`}
function barModelVisual(){return `<div class="barModel"><div class="part main">Bahagian diketahui</div><div class="part extra">Bahagian tambahan</div></div>`}
function genericManipulative(key){
 const map={
  place:`${baseTenVisual()}<p>Kumpulkan nombor mengikut <b>ratus, puluh dan sa</b>. Nilai digit berubah ikut tempatnya.</p>`,
  fraction:`${fractionLessonVisual()}<p>Pecahan menerangkan <b>bahagian daripada keseluruhan yang sama besar</b>.</p>`,
  decimal:`${percentLessonVisual()}<p>Perpuluhan ialah cara lain mewakili bahagian daripada satu keseluruhan. Fokus pada nilai tempat selepas titik.</p>`,
  percent:`${percentLessonVisual()}<p><b>100%</b> ialah satu keseluruhan. 40% bermaksud 40 daripada 100.</p>`,
  ratio:`<div class="ratioModel"><span>● ●</span><b>:</b><span>▲ ▲ ▲</span></div><p>Nisbah membandingkan dua kuantiti mengikut pasangan yang sama.</p>`,
  money:`<div class="moneyModel"><b>RM10</b><b>RM10</b><b>RM5</b></div><p>Nilai wang datang daripada <b>jumlah nilai</b>, bukan bilangan keping atau syiling.</p>`,
  time:`<div class="timeModel"><b>1 jam</b><span>=</span><b>60 minit</b></div><p>Hubungkan jam, minit dan tempoh sebelum mengira.</p>`,
  measure:`<div class="timeModel"><b>1 m</b><span>=</span><b>100 cm</b></div><p>Pilih unit dahulu, kemudian gunakan hubungan antara unit.</p>`,
  shape:`<div class="shapeModel">△ &nbsp; □ &nbsp; ○</div><p>Kenal bentuk melalui <b>ciri</b> seperti sisi, bucu, muka dan ukuran — bukan rupa semata-mata.</p>`,
  data:`<div class="miniBars"><span style="height:35%"></span><span style="height:75%"></span><span style="height:50%"></span></div><p>Baca paksi/kategori dan nilai dahulu. Kemudian baru banding atau jumlahkan.</p>`,
  area:`<div class="areaGrid">${Array.from({length:12},()=>'<span></span>').join('')}</div><p>Luas ialah bilangan unit persegi yang menutup permukaan.</p>`,
  coord:`<div class="coordHint">→ x dahulu<br>↑ y kemudian</div><p>Koordinat dibaca sebagai <b>(x, y)</b>.</p>`,
  groups:`<div class="groupsModel"><span>●●●</span><span>●●●</span><span>●●●</span></div><p>Darab ialah kumpulan sama banyak. Bahagi ialah memecahkan kepada kumpulan sama banyak.</p>`,
  operation:`${barModelVisual()}<p>Jangan cari keyword sahaja. Tentukan <b>apa yang diketahui, apa yang berubah, dan apa yang dicari</b>.</p>`,
  general:`${barModelVisual()}<p>Kita akan tukar soalan kepada model yang lebih mudah dilihat, kemudian kembali kepada simbol.</p>`
 };
 return map[key]||map.general;
}
function lessonSpecFor(skillId,key){
  if((META[skillId]?.grade===2)&&window.PALessonsD2?.[skillId])return window.PALessonsD2[skillId];
  return {title:META[skillId]?.title||'Kemahiran',goal:'Faham hubungan matematik sebelum menggunakan simbol.',faham:'Kita bina maksud konsep ini dengan model dahulu.',visual:key,build:'Perhatikan hubungan antara bahagian dan nilai.',bridge:'MODEL → HUBUNGAN → SIMBOL',good:'Lihat hubungan matematik dahulu',bad:'Teka daripada rupa nombor sahaja',transfer:'Gunakan idea yang sama pada soalan dalam bentuk berbeza.'};
}
function lessonVisual(type){
 const v={
  base100:`<div class="placeTable"><span><b>4</b><small>ratus</small></span><span><b>2</b><small>puluh</small></span><span><b>6</b><small>sa</small></span></div><div class="abstractBridge"><span>400</span><b>+</b><span>20</span><b>+</b><span>6</span></div>`,
  placeSlots:`<div class="placeTable"><span><b>3</b><small>ratus</small></span><span><b>4</b><small>puluh</small></span><span><b>2</b><small>sa</small></span></div>`,
  numberLine:`<div class="lessonLine"><span>120</span><i>+10</i><span>130</span><i>+10</i><span>140</span><i>+10</i><span>?</span></div>`,
  placeTable:`<div class="placeTable"><span><b>5</b><small>ratus</small></span><span class="focus"><b>3</b><small>puluh = 30</small></span><span><b>2</b><small>sa</small></span></div>`,
  estimateDots:`<div class="dotCloud">${Array.from({length:47},()=>'<i></i>').join('')}</div><div class="learningCaption">Nampak hampir 50, bukan perlu kira setiap titik.</div>`,
  roundLine:`<div class="roundLine"><span>300</span><div><i style="left:47%"></i><b style="left:47%">347</b></div><span>400</span></div>`,
  patternTiles:`<div class="lessonLine"><span>205</span><i>+5</i><span>210</span><i>+5</i><span>215</span><i>+5</i><span>220</span></div>`,
  barModel:barModelVisual(),
  regroupAdd:`<div class="regroup"><div><b>34</b><small>3 puluh + 4 sa</small></div><b>+</b><div><b>28</b><small>2 puluh + 8 sa</small></div></div><div class="learningCaption">4 sa + 8 sa = 12 sa = 1 puluh 2 sa</div>`,
  regroupSub:`<div class="regroup"><div><b>52</b><small>5 puluh + 2 sa</small></div><b>→</b><div><b>4 puluh + 12 sa</b><small>1 puluh ditukar menjadi 10 sa</small></div></div>`,
  equalGroups:`<div class="groupsModel"><span>●●●●</span><span>●●●●</span><span>●●●●</span></div><div class="learningCaption">3 kumpulan × 4 = 12</div>`,
  shareGroups:`<div class="groupsModel"><span>●●●●</span><span>●●●●</span><span>●●●●</span></div><div class="learningCaption">12 objek ÷ 3 kumpulan = 4 setiap kumpulan</div>`,
  fractionParts:`${fractionLessonVisual()}<div class="learningCaption">Bahagian mesti sama besar.</div>`,
  tenthsGrid:`<div class="percentGrid">${Array.from({length:10},(_,i)=>`<span class="${i<4?'on':''}"></span>`).join('')}</div><div class="learningCaption">4 daripada 10 = 4/10 = 0.4</div>`,
  fractionDecimal:`<div class="abstractBridge"><span>7/10</span><b>↔</b><span>0.7</span></div><div class="percentGrid">${Array.from({length:10},(_,i)=>`<span class="${i<7?'on':''}"></span>`).join('')}</div>`,
  fractionBar:`<div class="fractionModel"><span class="filled"></span><span class="filled"></span><span class="filled"></span><span></span></div><div class="learningCaption">Kenal keseluruhan, kemudian bahagian.</div>`,
  moneyPieces:`<div class="moneyModel"><b>RM10</b><b>RM10</b><b>RM5</b></div><div class="learningCaption">3 keping, tetapi nilainya RM25.</div>`,
  moneyColumns:`<div class="moneyColumns"><span>RM12.50</span><span>+ RM3.20</span><b>RM15.70</b></div>`,
  moneyBar:`<div class="barModel"><div class="part main">RM20 asal</div><div class="part extra">RM7 guna</div></div><div class="learningCaption">Baki ialah bahagian yang tinggal.</div>`,
  moneyGroups:`<div class="moneyModel"><b>RM4</b><b>RM4</b><b>RM4</b></div><div class="learningCaption">3 item × RM4 = RM12</div>`,
  moneyShare:`<div class="groupsModel"><span>RM4</span><span>RM4</span><span>RM4</span></div><div class="learningCaption">RM12 dibahagi sama rata kepada 3.</div>`,
  saveSpend:`<div class="barModel"><div class="part main">RM6 belanja</div><div class="part extra">RM4 simpan</div></div><div class="learningCaption">RM10 = RM6 + RM4</div>`,
  moneyFlow:`<div class="abstractBridge"><span>Wang masuk</span><b>→</b><span>Belanja</span><b>→</b><span>Baki</span></div>`,
  clockFace:`<div class="clockVisual"><span>12</span><b>🕒</b><small>Jarum minit bergerak 5 minit setiap nombor.</small></div>`,
  timeBlocks:`<div class="timeModel"><b>60 minit</b><span>=</span><b>1 jam</b></div>`,
  timeLine:`<div class="lessonLine"><span>2:15</span><i>+15m</i><span>2:30</span><i>+30m</i><span>3:00</span></div>`,
  ruler:`<div class="rulerVisual"><span>0</span><i></i><i></i><i></i><i></i><span>5 cm</span></div><div class="learningCaption">Mulakan pada 0 dan baca hujung objek.</div>`,
  balance:`<div class="balanceVisual"><span>Objek</span><b>⚖️</b><span>500 g</span></div><div class="learningCaption">Baca nombor dan unit yang ditunjukkan oleh penimbang.</div>`,
  measuringJug:`<div class="jugVisual"><div></div><span>500 mL</span></div><div class="learningCaption">Baca paras pada skala, bukan bentuk bekas.</div>`,
  measureFlow:`<div class="abstractBridge"><span>Unit</span><b>→</b><span>Samakan</span><b>→</b><span>Kira</span></div>`,
  solidFeatures:`<div class="shapeModel">🧊 &nbsp; ⚽ &nbsp; 🥫</div><div class="learningCaption">Banding muka rata, bucu dan kebolehan bergolek.</div>`,
  shapeRotate:`<div class="shapeModel">△ &nbsp; ◁ &nbsp; ▽</div><div class="learningCaption">Semua masih segi tiga: 3 sisi, 3 bucu.</div>`,
  featureSort:`<div class="abstractBridge"><span>Syarat</span><b>→</b><span>Ciri</span><b>→</b><span>Bentuk</span></div>`,
  tally:`<div class="tallyVisual"><span>🍎</span><b>||||/ ||</b><small>7</small></div>`,
  barChart:`<div class="miniBars"><span style="height:35%"></span><span style="height:75%"></span><span style="height:50%"></span></div><div class="learningCaption">Baca skala sebelum baca tinggi palang.</div>`,
  barCompare:`<div class="miniBars"><span style="height:40%"></span><span style="height:80%"></span></div><div class="learningCaption">Baca nilai dahulu, kemudian cari beza/jumlah.</div>`
 };
 return v[type]||genericManipulative(type);
}
function guidedPlanFor(skillId,key){
 const title=(META[skillId]?.title||'').toLowerCase();
 if(skillId==='D2.6.1')return {problem:'Sebuah pensel bermula pada 0 cm dan hujungnya berada pada 5 cm. Berapa panjangnya?',ask:'Kita baca tanda pada pembaris tepat di hujung objek.',visual:'ruler',steps:['Pastikan pensel bermula pada tanda <b>0</b>.','Cari tanda tepat di hujung pensel.','Hujung pada 5 cm, jadi panjangnya <b>5 cm</b>.'],prompt:'Objek bermula pada 0 cm dan berakhir pada 5 cm. Panjangnya?',choices:[['5 cm',true],['0 cm',false],['10 cm',false]]};
 if(skillId==='D2.6.2')return {problem:'Penimbang menunjukkan 500 g. Berapakah jisim objek itu?',ask:'Jisim memberitahu berapa berat sesuatu objek. Kita mesti baca nilai bersama unit <b>g</b> atau <b>kg</b>.',visual:'balance',steps:['Lihat nombor yang ditunjukkan oleh penimbang.','Nombor yang ditunjukkan ialah <b>500</b>.','Unit pada penimbang ialah g, jadi jisim objek ialah <b>500 g</b>.'],prompt:'Penimbang menunjukkan 300 g. Berapakah jisim objek?',choices:[['300 g',true],['300 kg',false],['300 cm',false]]};
 if(skillId==='D2.6.3')return {problem:'Paras air pada silinder penyukat menunjukkan 500 mL. Berapakah isi padu air itu?',ask:'Kita baca paras air pada skala dan tulis unit isi padu yang betul.',visual:'measuringJug',steps:['Cari paras air pada skala.','Paras air berada pada tanda <b>500</b>.','Unit pada alat ialah mL, jadi isi padunya <b>500 mL</b>.'],prompt:'Paras air menunjukkan 300 mL. Berapakah isi padunya?',choices:[['300 mL',true],['300 L',false],['300 g',false]]};
 if(skillId==='D2.6.4')return {problem:'Pita A panjangnya 30 cm dan Pita B panjangnya 20 cm. Berapakah jumlah panjang kedua-duanya?',ask:'Kenal pasti ukuran, kekalkan unit yang sama, kemudian pilih operasi.',visual:'measureFlow',steps:['Kedua-dua ukuran menggunakan unit <b>cm</b>.','Soalan meminta jumlah, jadi gunakan tambah.','30 cm + 20 cm = <b>50 cm</b>.'],prompt:'Sebuah pita 40 cm dipotong 10 cm. Berapa panjang yang tinggal?',choices:[['30 cm',true],['50 cm',false],['30 g',false]]};
 if(key==='place')return {problem:'Dalam nombor 342, apakah nilai digit 4?',ask:'Soalan minta kita cari <b>nilai digit 4</b>, bukan sekadar digit 4.',visual:'placeTable',steps:['Susun 342 kepada ratus, puluh dan sa.','Digit 4 berada di tempat <b>puluh</b>.','4 puluh = <b>40</b>.'],prompt:'Digit 6 pada tempat puluh bernilai?',choices:[['60',true],['6',false],['600',false]]};
 if(key==='fraction')return {problem:'Apakah maksud 3/4?',ask:'Kita perlu tahu berapa bahagian diambil daripada jumlah bahagian yang sama besar.',visual:'fractionParts',steps:['Penyebut 4 bermaksud keseluruhan dibahagi kepada <b>4 bahagian sama besar</b>.','Pengangka 3 bermaksud <b>3 bahagian diambil</b>.','Jadi 3/4 ialah 3 daripada 4 bahagian sama besar.'],prompt:'Dalam 2/5, berapa jumlah bahagian sama besar?',choices:[['5',true],['2',false],['7',false]]};
 if(key==='decimal')return {problem:'3/10 bersamaan perpuluhan apa?',ask:'Penyebut 10 menunjukkan <b>persepuluh</b>. Kita tukar bahagian persepuluh kepada perpuluhan.',visual:'tenthsGrid',steps:['3/10 bermaksud 3 bahagian daripada 10.','3 persepuluh ditulis sebagai <b>0.3</b>.','Digit selepas titik berada di tempat persepuluh.'],prompt:'7/10 ditulis sebagai?',choices:[['0.7',true],['7.0',false],['0.07',false]]};
 if(key==='money')return {problem:'RM2.70 + RM1.50 = ?',ask:'Kita tambah nilai wang dengan menjaga ringgit dan sen.',visual:'moneyColumns',steps:['Tambah sen: 70 sen + 50 sen = <b>120 sen</b>.','120 sen = <b>RM1.20</b>.','Tambah ringgit: RM2 + RM1 + RM1.20 = <b>RM4.20</b>.'],prompt:'80 sen + 40 sen bersamaan?',choices:[['RM1.20',true],['RM0.12',false],['RM12.00',false]]};
 if(key==='time')return {problem:'Mula 2:15 petang. Tambah 45 minit. Pukul berapa?',ask:'Untuk tempoh masa, bergerak ke hadapan pada jam atau garis masa.',visual:'timeLine',steps:['Dari 2:15 ke 2:30 = <b>15 minit</b>.','Masih tinggal 30 minit.','2:30 + 30 minit = <b>3:00</b>.'],prompt:'Dari 4:30 tambah 30 minit menjadi?',choices:[['5:00',true],['4:60',false],['5:30',false]]};
 if(key==='measure')return {problem:'Sebuah pensel bermula pada 0 cm dan berakhir pada 5 cm. Berapa panjangnya?',ask:'Kita baca skala alat ukur, bukan teka berdasarkan rupa objek.',visual:'ruler',steps:['Pastikan objek bermula pada tanda <b>0</b>.','Cari tanda di hujung objek.','Hujung pada 5 cm, jadi panjangnya <b>5 cm</b>.'],prompt:'Objek bermula pada 0 cm dan berakhir pada 5 cm. Panjangnya?',choices:[['5 cm',true],['0 cm',false],['10 cm',false]]};
 if(key==='data')return {problem:'Epal = 7, Oren = 8, Mangga = 4. Buah mana paling banyak?',ask:'Baca nilai setiap kategori dahulu. Lepas itu baru bandingkan.',visual:'barChart',steps:['Epal mempunyai nilai 7.','Oren mempunyai nilai <b>8</b>.','8 lebih besar daripada 7 dan 4, jadi <b>Oren</b> paling banyak.'],prompt:'A=5, B=9, C=6. Mana paling tinggi?',choices:[['B',true],['A',false],['C',false]]};
 if(key==='shape')return {problem:'Bentuk manakah mempunyai 4 sisi sama panjang?',ask:'Kita kenal bentuk melalui cirinya, bukan arah atau kedudukan gambar.',visual:'shapeRotate',steps:['Kira bilangan sisi.','Semak sama ada panjang sisi sama.','Segi empat sama mempunyai <b>4 sisi sama panjang</b>.'],prompt:'Bentuk dengan 3 sisi dan 3 bucu ialah?',choices:[['Segi tiga',true],['Segi empat sama',false],['Bulatan',false]]};
 if(key==='groups'&&title.includes('bahagi'))return {problem:'12 ÷ 3 = ?',ask:'Bahagi bermaksud agihkan kepada kumpulan sama banyak.',visual:'shareGroups',steps:['Ada 12 objek.','Bahagikan kepada <b>3 kumpulan sama banyak</b>.','Setiap kumpulan mendapat <b>4</b>. Jadi 12 ÷ 3 = 4.'],prompt:'15 objek dibahagi sama rata kepada 3 kumpulan. Setiap kumpulan dapat?',choices:[['5',true],['3',false],['12',false]]};
 if(key==='groups')return {problem:'3 × 4 = ?',ask:'Darab boleh dilihat sebagai beberapa kumpulan yang sama banyak.',visual:'equalGroups',steps:['Ada <b>3 kumpulan</b>.','Setiap kumpulan ada <b>4</b>.','4 + 4 + 4 = 12, jadi 3 × 4 = <b>12</b>.'],prompt:'4 kumpulan, setiap kumpulan ada 2. Jumlah?',choices:[['8',true],['6',false],['2',false]]};
 if(key==='operation'&&title.includes('tolak'))return {problem:'52 − 27 = ?',ask:'Kita tolak ikut nilai tempat. Bila sa tidak cukup, tukar 1 puluh kepada 10 sa.',visual:'regroupSub',steps:['52 = 5 puluh + 2 sa.','Tukar 1 puluh: jadi <b>4 puluh + 12 sa</b>.','12 − 7 = 5 dan 4 puluh − 2 puluh = 2 puluh. Jawapan <b>25</b>.'],prompt:'Dalam 43 − 18, 43 boleh ditukar menjadi?',choices:[['3 puluh + 13 sa',true],['4 puluh + 3 sa',false],['2 puluh + 23 sa',false]]};
 if(key==='operation'&&title.includes('tambah'))return {problem:'34 + 28 = ?',ask:'Kita tambah ikut nilai tempat dan kumpul semula apabila sa menjadi 10 atau lebih.',visual:'regroupAdd',steps:['Tambah sa: 4 + 8 = <b>12 sa</b>.','12 sa = <b>1 puluh + 2 sa</b>.','Tambah puluh: 3 + 2 + 1 = 6 puluh. Jawapan <b>62</b>.'],prompt:'Dalam 27 + 15, 7 + 5 menjadi?',choices:[['12 sa',true],['2 sa',false],['1 sa',false]]};
 return {problem:'Baca soalan dan tentukan apa yang diketahui serta apa yang perlu dicari.',ask:'Jangan terus pilih operasi. Fahami maklumat dahulu.',visual:'barModel',steps:['Cari maklumat yang diberi.','Kenal pasti apa yang soalan minta.','Pilih cara kira yang menghubungkan kedua-duanya.'],prompt:'Langkah pertama sebelum mengira ialah?',choices:[['Fahami apa yang diketahui dan dicari',true],['Teka operasi',false],['Pilih jawapan paling besar',false]]};
}
function childFriendlyCopy(text){
 const replacements=[
  [/\bkuantiti\b/gi,'nilai'],[/\bhubungan\b/gi,'kaitan'],[/\bnotasi\b/gi,'cara menulis'],
  [/\borientasi\b/gi,'arah'],[/\bkonsisten\b/gi,'sama setiap kali'],[/\bmunasabah\b/gi,'masuk akal'],
  [/\bkeyword\b/gi,'kata kunci'],[/\baplikasikan\b/gi,'gunakan'],[/\bkonteks\b/gi,'situasi'],
  [/\bfungsi\b/gi,'tugas'],[/\bpengumpulan semula\b/gi,'kumpul semula'],[/\bmewakili\b/gi,'menunjukkan']
 ];
 return replacements.reduce((value,[pattern,replacement])=>value.replace(pattern,replacement),String(text||''));
}
function conceptTeachingPlanFor(skillId,key){
 const spec=lessonSpecFor(skillId,key),fallback=guidedPlanFor(skillId,key);
 if(!(META[skillId]?.grade===2&&window.PALessonsD2?.[skillId]))return fallback;
 const goal=childFriendlyCopy(spec.goal),faham=childFriendlyCopy(spec.faham),build=childFriendlyCopy(spec.build),bridge=childFriendlyCopy(spec.bridge),good=childFriendlyCopy(spec.good),bad=childFriendlyCopy(spec.bad);
 const lowerBad=bad.charAt(0).toLowerCase()+bad.slice(1);
 return {
  problem:faham,
  ask:goal,
  visual:spec.visual||fallback.visual,
  steps:[build,`Contoh mudah: <b>${bridge}</b>`,`Ingat: <b>${good}</b>.`],
  prompt:'Cara manakah membantu kita memahami soalan ini?',
  choices:[[good,true],[bad,false]],
  compare:{
   question:faham,
   wrong:bad,
   whyWrong:`Cara ini boleh salah kerana kita ${lowerBad}.`,
   right:good,
   whyRight:`Betul. ${bridge}.`
  }
 };
}
function coachStrategyLabel(strategy){return strategy==='contrast'?'Banding Salah & Betul':strategy==='micro'?'Langkah Mikro':'Model Visual'}
function contrastPanel(plan){
 const wrong=plan.compare?.wrong||plan.choices.find(x=>!x[1])?.[0]||'Cara yang kurang tepat';
 const right=plan.compare?.right||plan.choices.find(x=>x[1])?.[0]||'Cara yang membantu';
 const question=plan.compare?.question||plan.prompt;
 const whyWrong=plan.compare?.whyWrong||'Cara ini boleh membawa kepada jawapan yang salah.';
 const whyRight=plan.compare?.whyRight||`Cara ini membantu kita mendapat jawapan yang betul: ${right}.`;
 return `<section class="coachCompare" aria-label="Bandingkan cara salah dan betul"><div class="compareExample"><small>CONTOH MUDAH</small><p>${question}</p></div><div class="coachContrast"><div class="compareWrong"><small>JANGAN BUAT BEGINI</small><b>${wrong}</b><p>${whyWrong}</p></div><div class="compareRight"><small>BUAT BEGINI</small><b>${right}</b><p>${whyRight}</p></div></div></section>`;
}
function microSteps(plan){return plan.steps.map((x,i)=>`<div><span>${i+1}</span><p>${x}${i===0?' <em>Berhenti dan semak langkah ini dahulu.</em>':''}</p></div>`).join('')}
function visualCoachMode(key,m){
 if(m?.id==='D2.1.1')return learningState?.tag==='compare'?'compare':'number';
 if(m?.id==='D2.1.4'||/nilai tempat/i.test(m?.title||''))return'place';
 if(key==='place'&&m?.grade===1)return'place-basic';
 if(key==='fraction')return'fraction';
 if(key==='groups'&&/bahagi/i.test(m?.title||''))return'divide';
 if(key==='groups')return'multiply';
 if(key==='operation')return /tolak/i.test(m?.title||'')?'subtract':'add';
 if(key==='money')return'money';
 if(key==='time')return'time';
 if(key==='measure')return'measure';
 if(key==='shape')return'shape';
 if(key==='area')return'area';
 if(key==='data')return'data';
 return null;
}
function visualCoachDots(count,cls=''){return Array.from({length:count},()=>`<i class="${cls}"></i>`).join('')}
function visualCoachCrystals(count,targets=[]){return Array.from({length:count},(_,i)=>`<i class="vcCrystal ${targets.includes(i)?'target':''}"></i>`).join('')}
function visualCoachCoins(values){return values.map(value=>`<i class="vcCoin"><span>RM</span>${value}</i>`).join('')}
function renderVisualCoachArena(stage,key,m){
 const arena=document.getElementById('visualCoachArena'),board=document.getElementById('visualCoachBoard'),hero=document.getElementById('visualCoachHero'),pet=document.getElementById('visualCoachPet'),cue=document.getElementById('visualCoachCue');
 if(!arena||!board)return;const mode=visualCoachMode(key,m);arena.classList.toggle('hidden',!mode);arena.classList.toggle('vcCheckpoint',stage>2);arena.classList.remove('vcSuccess');board.classList.remove('vcDone');if(!mode)return;
 const terrainTheme=typeof terrainThemeFor==='function'?terrainThemeFor(m):'number',terrainSrc=typeof TERRAIN_BY_THEME!=='undefined'?(TERRAIN_BY_THEME[terrainTheme]||TERRAIN_BY_THEME.number):'assets/battlefields/forest-temple/arena-v1.webp',absoluteTerrain=new URL(`${terrainSrc}?v=3.16.3`,document.baseURI).href;arena.dataset.terrain=terrainTheme;arena.style.setProperty('--coach-terrain',`url("${absoluteTerrain}")`);
 const heroData=HEROES?.[db?.hero]||HEROES?.wira;if(hero&&heroData)hero.src=stage===1?heroData.anticipation:heroData.idle;
 const petId=db?.rewards?.equippedPet,petData=typeof REWARD_PETS!=='undefined'?REWARD_PETS[petId]:null;if(pet&&petData){pet.src=petData.front;pet.classList.remove('hidden')}else pet?.classList.add('hidden');
 if(stage>2){board.innerHTML='<div class="vcResult">?</div>';if(cue)cue.textContent='Cuba sendiri';return}
 if(cue)cue.textContent=stage===0?'Lihat dahulu':stage===1?'Sentuh yang menyala':'Bagus!';
 const scenes={
  number:[`<div class="vcNumber">342</div>`,`<button class="vcTap" onclick="visualCoachInteract('number')"><span class="vcBaseTen"><span class="vcHundreds">${visualCoachDots(3)}</span><span class="vcRods">${visualCoachDots(4)}</span><span class="vcUnits">${visualCoachDots(2)}</span></span></button>`,`<div class="vcResult">300 + 40 + 2 = 342</div>`],
  compare:[`<div class="vcResult">342&nbsp;&nbsp;?&nbsp;&nbsp;324</div>`,`<button class="vcTap" onclick="visualCoachInteract('compare')"><div class="vcPlaceSlots"><span><b>3</b><small>RATUS</small></span><span class="hot"><b>4 &gt; 2</b><small>PULUH</small></span></div></button>`,`<div class="vcResult">342 &gt; 324</div>`],
  place:[`<div class="vcNumber">3<span class="hot">4</span>2</div>`,`<div class="vcPlaceSlots"><button><b>3</b><small>RATUS</small></button><button class="hot" onclick="visualCoachInteract('place')"><b>4</b><small>PULUH</small></button><button><b>2</b><small>SA</small></button></div>`,`<div class="vcResult">4 puluh = 40</div>`],
  'place-basic':[`<div class="vcNumber"><span class="hot">1</span>8</div>`,`<div class="vcSplit"><button class="vcTap" onclick="visualCoachInteract('place-basic')"><span class="vcTens">${visualCoachDots(10)}</span></button><strong>+</strong><span class="vcOnes">${visualCoachDots(8)}</span></div>`,`<div class="vcResult">10 + 8 = 18</div>`],
  fraction:[`<div><div class="vcFraction vcHalf"><span></span><span></span></div><div class="vcEquation">1 daripada 2 = ½</div></div>`,`<button class="vcTap" onclick="visualCoachInteract('fraction')"><div class="vcEquivalent"><span class="vcFraction vcHalf"><i></i><i></i></span><b>potong lagi</b><span class="vcFraction vcQuarter"><i></i><i></i><i></i><i></i></span></div></button>`,`<div><div class="vcEquivalent"><span>½</span><b>=</b><span>²⁄₄</span></div><div class="vcEquation">Saiz berwarna masih sama</div></div>`],
  add:[`<div><div class="vcRegroupRows"><span>${visualCoachDots(8)}</span><b>+</b><span>${visualCoachDots(5)}</span></div><div class="vcEquation">8 + 5</div></div>`,`<button class="vcTap" onclick="visualCoachInteract('add')"><div class="vcOrbs vcThirteen">${visualCoachDots(13)}</div><div class="vcEquation">Kumpul 10 sa</div></button>`,`<div><div class="vcRegroupResult"><span class="vcTenBundle">${visualCoachDots(10)}</span><b>+</b><span class="vcOnes">${visualCoachDots(3)}</span></div><div class="vcResult">1 puluh + 3 sa = 13</div></div>`],
  subtract:[`<div><div class="vcRegroupResult"><span class="vcTenBundle">${visualCoachDots(10)}</span><b>+</b><span class="vcOnes">${visualCoachDots(2)}</span></div><div class="vcEquation">12 − 7</div></div>`,`<button class="vcTap" onclick="visualCoachInteract('subtract')"><div class="vcEquation vcSmallEquation">1 puluh → 10 sa</div><div class="vcCrystals">${visualCoachCrystals(12,[5,6,7,8,9,10,11])}</div><div class="vcEquation">Ambil 7</div></button>`,`<div><div class="vcCrystals">${visualCoachCrystals(5)}</div><div class="vcResult">12 − 7 = 5</div></div>`],
  divide:[`<div><span class="vcBoulder whole"></span><div class="vcEquation">1 batu penuh</div></div>`,`<button class="vcRockAction" onclick="visualCoachInteract('divide')"><span class="vcBoulder whole"></span><b>Hero slash — bahagi 2</b></button>`,`<div><div class="vcRockHalves"><span class="vcBoulder left"><b>1<br><small>½</small></b></span><span class="vcBoulder right"><b>1<br><small>½</small></b></span></div><div class="vcEquation">2 bahagian sama besar</div></div>`],
  multiply:[`<div><div class="vcChestGroups"><span>▣<i>••</i></span><span>▣<i>••</i></span><span>▣<i>••</i></span></div><div class="vcEquation">3 peti × 2 kristal</div></div>`,`<button class="vcTap" onclick="visualCoachInteract('multiply')"><div class="vcChestGroups ready"><span>▣<i>••</i></span><span>▣<i>••</i></span><span>▣<i>••</i></span></div><div class="vcEquation">Buka semua peti</div></button>`,`<div><div class="vcOrbs">${visualCoachDots(6)}</div><div class="vcResult">2 + 2 + 2 = 6</div></div>`],
  money:[`<div><div class="vcShopItem">🧪<b>RM7</b></div><div class="vcEquation">Harga ramuan</div></div>`,`<button class="vcTap" onclick="visualCoachInteract('money')"><div class="vcMoneyTrade"><span>${visualCoachCoins([10])}</span><b>→</b><span class="vcShopItem">🧪<small>RM7</small></span></div><div class="vcEquation">Bayar RM10</div></button>`,`<div><div class="vcMoneyTrade"><span>RM10</span><b>− RM7 =</b><span class="vcCoin"><span>RM</span>3</span></div><div class="vcResult">Baki RM3</div></div>`],
  time:[`<div><div class="vcClock start"><i></i><b></b><span>2:30</span></div><div class="vcEquation">Mula 2:30</div></div>`,`<button class="vcTap" onclick="visualCoachInteract('time')"><div class="vcClock moving"><i></i><b></b><span>+45 minit</span></div></button>`,`<div><div class="vcTimeLine"><span>2:30</span><i>+30m</i><span>3:00</span><i>+15m</i><span>3:15</span></div><div class="vcResult">2:30 + 45 minit = 3:15</div></div>`],
  measure:[`<div><div class="vcSwordMeasure">⚔</div><div class="vcRuler"><span>0</span>${visualCoachDots(5)}<span>5 cm</span></div></div>`,`<button class="vcTap" onclick="visualCoachInteract('measure')"><div class="vcSwordMeasure glow">⚔</div><div class="vcRuler"><span>0</span>${visualCoachDots(5)}<span>5 cm</span></div></button>`,`<div><div class="vcMeasureArrow">0 ━━━━━▶ 5 cm</div><div class="vcResult">Panjang = 5 cm</div></div>`],
  shape:[`<div><div class="vcShieldShape">◇</div><div class="vcEquation">Jangan teka melalui arah</div></div>`,`<button class="vcTap" onclick="visualCoachInteract('shape')"><div class="vcShieldShape spin">◇<i>1</i><i>2</i><i>3</i><i>4</i></div><div class="vcEquation">Kira sisi</div></button>`,`<div><div class="vcShieldShape">□</div><div class="vcResult">4 sisi + 4 bucu</div></div>`],
  area:[`<div><div class="vcTileGrid">${visualCoachDots(12)}</div><div class="vcEquation">Tutup seluruh lantai</div></div>`,`<button class="vcTap" onclick="visualCoachInteract('area')"><div class="vcTileGrid filling">${visualCoachDots(12)}</div><div class="vcEquation">Isi dengan unit persegi</div></button>`,`<div><div class="vcTileGrid done">${visualCoachDots(12)}</div><div class="vcResult">3 × 4 = 12 unit²</div></div>`],
  data:[`<div><div class="vcDataPets">🐾 <span>●●●</span> <span>●●●●●</span> <span>●●</span></div><div class="vcEquation">Kumpul dan kira</div></div>`,`<button class="vcTap" onclick="visualCoachInteract('data')"><div class="vcChartBuild"><i style="--h:3"></i><i style="--h:5"></i><i style="--h:2"></i></div><div class="vcEquation">Susun menjadi carta</div></button>`,`<div><div class="vcChartBuild done"><i style="--h:3"><b>3</b></i><i style="--h:5"><b>5</b></i><i style="--h:2"><b>2</b></i></div><div class="vcResult">Palang tertinggi = 5</div></div>`]
 };
 board.innerHTML=scenes[mode][stage];arena.dataset.mode=mode;arena.dataset.complete='0';
}
function visualCoachInteract(mode){
 const arena=document.getElementById('visualCoachArena'),board=document.getElementById('visualCoachBoard'),cue=document.getElementById('visualCoachCue');if(!arena||arena.dataset.mode!==mode||arena.dataset.complete==='1')return;arena.dataset.complete='1';
 if(mode==='divide'){
  const hero=document.getElementById('visualCoachHero'),heroData=HEROES?.[db?.hero]||HEROES?.wira;if(hero&&heroData)hero.src=heroData.attack;
  board.innerHTML='<div class="vcSlashRock"><i></i><div class="vcRockHalves"><span class="vcBoulder left"><b>½</b></span><span class="vcBoulder right"><b>½</b></span></div></div>';if(typeof playSfx==='function')playSfx(db?.hero==='wira'?'wiraSword':'attack');arena.classList.add('vcSuccess');if(cue)cue.textContent='Dua bahagian sama!';setTimeout(learningAdvance,1000);return;
 }
 const hero=document.getElementById('visualCoachHero'),heroData=HEROES?.[db?.hero]||HEROES?.wira;if(hero&&heroData)hero.src=heroData.attack;
 if(mode==='subtract')board.querySelectorAll('.vcCrystal.target').forEach(x=>x.classList.add('break'));
 else board.classList.add('vcDone');arena.classList.add('vcSuccess');if(cue)cue.textContent='Ya, betul!';if(typeof playSfx==='function')playSfx('correct');setTimeout(learningAdvance,650);
}
function visualCoachContent(stage,key,m){
 const mode=visualCoachMode(key,m);if(!mode||stage>2)return'';
 const copy={number:['Lihat nombor tiga digit','Sentuh blok nombor','Blok itu menunjukkan…'],compare:['Banding dari kiri','Ratus sama—sentuh puluh','Simbol yang betul…'],place:['Cari digit di tempat puluh','Sentuh digit puluh','4 puluh bernilai…'],'place-basic':['Kembali kepada satu puluh','Sentuh satu kumpulan puluh','1 puluh bernilai…'],fraction:['Lihat bahagian yang sama','Potong setiap bahagian sekali lagi','Pecahan yang sama nilai…'],add:['Kembali kepada tambah asas','Satukan semua orb','Jumlah semuanya…'],subtract:['Kembali kepada tolak asas','Pecahkan 2 kristal','Yang tinggal…'],divide:['Mulakan dengan satu batu','Hero bahagi kepada dua','Setiap bahagian ialah…'],multiply:['Lihat kumpulan yang sama','Hero buka semua peti','Jumlah kristal ialah…'],money:['Lihat harga dan bayaran','Buat urus niaga','Baki yang diterima…'],time:['Lihat waktu mula','Gerakkan jarum 45 minit','Waktu akhirnya…'],measure:['Letak pedang pada tanda 0','Baca tanda di hujung','Panjang pedang ialah…'],shape:['Lihat perisai yang dipusing','Kira sisi dan bucu','Bentuk itu mempunyai…'],area:['Lihat ruang lantai','Penuhkan dengan jubin','Luas lantai ialah…'],data:['Lihat objek yang dikumpul','Tukar objek menjadi palang','Palang tertinggi bernilai…']}[mode];
 if(stage===0)return `<div class="visualCoachOnly"><div class="stageTag">CONTOH MUDAH</div><h2>${copy[0]}</h2><p>Tak perlu kira besar dahulu.</p><button class="btn primary learningNext" onclick="learningAdvance()">Lihat caranya →</button></div>`;
 if(stage===1)return `<div class="visualCoachOnly"><div class="stageTag">SENTUH</div><h2>${copy[1]}</h2><p>Buat satu langkah sahaja.</p></div>`;
 const answerMap={number:[['342',true],['34',false]],compare:[['>',true],['<',false]],place:[['40',true],['4',false]],'place-basic':[['10',true],['1',false]],fraction:[['2/4',true],['2/2',false]],divide:[['1/2',true],['2',false]],add:[['13',true],['3',false]],subtract:[['5',true],['7',false]],multiply:[['6',true],['5',false]],money:[['RM3',true],['RM17',false]],time:[['3:15',true],['2:75',false]],measure:[['5 cm',true],['0 cm',false]],shape:[['4 sisi',true],['3 sisi',false]],area:[['12 unit²',true],['7 unit²',false]],data:[['5',true],['3',false]]};const choices=answerMap[mode];
 return `<div class="visualCoachOnly"><div class="stageTag">SEMAK</div><h2>${copy[2]}</h2><div class="learningChoices">${choices.map(([label,ok])=>`<button onclick="learningGuidedChoice(this,${ok})">${label}</button>`).join('')}</div><div id="guidedFeedback" class="learningFeedback"></div></div>`;
}
function stageContent(stage,key,m,strategy='model'){
 const visual=visualCoachContent(stage,key,m);if(visual)return visual;
 const plan=conceptTeachingPlanFor(m.id,key),spec=lessonSpecFor(m.id,key);
 const badge=`<div class="stageTag">${coachStrategyLabel(strategy).toUpperCase()}</div>`;
 if(stage===0)return `${badge}<h2>${strategy==='contrast'?'Mari lihat cara yang membantu':strategy==='micro'?'Kita kecilkan cabaran':'Mari fahamkan konsep'}</h2>${strategy==='contrast'?'':`<div class="workedProblem">${plan.problem}</div><p>${plan.ask}</p>`}${strategy==='contrast'?contrastPanel(plan):strategy==='micro'?'<div class="lessonGoal">🎯 Buat <b>satu keputusan kecil</b> pada satu masa. Tidak perlu fikir semua langkah serentak.</div>':'<div class="lessonGoal">🎯 Kita gunakan <b>contoh yang lebih mudah</b> untuk memahami konsep yang sama.</div>'}<button class="btn primary learningNext" onclick="learningAdvance()">${strategy==='contrast'?'Saya sudah nampak bezanya →':'Tunjuk caranya →'}</button>`;
 if(stage===1)return `${badge}<h2>${strategy==='contrast'?'Kenapa satu cara gagal?':strategy==='micro'?'Satu langkah pada satu masa':'Cikgu tunjuk cara'}</h2>${lessonVisual(plan.visual)}${strategy==='contrast'?contrastPanel(plan):''}<div class="workedSteps">${strategy==='micro'?microSteps(plan):plan.steps.map((x,i)=>`<div><span>${i+1}</span><p>${x}</p></div>`).join('')}</div><button class="btn primary learningNext" onclick="learningAdvance()">Sekarang saya sambung →</button>`;
 if(stage===2){const choices=strategy==='micro'?[plan.choices.find(x=>x[1]),plan.choices.find(x=>!x[1])].filter(Boolean):plan.choices;return `${badge}<h2>${strategy==='micro'?'Pilih antara dua langkah':'Lengkapkan satu langkah'}</h2><p>${plan.prompt}</p><div class="learningChoices">${choices.map(([label,ok])=>`<button onclick="learningGuidedChoice(this,${ok})">${label}</button>`).join('')}</div><div id="guidedFeedback" class="learningFeedback"></div>`;}
 return '';
}
function learningGuidedChoice(btn,correct){
 const box=document.getElementById('guidedFeedback');btn.parentElement.querySelectorAll('button').forEach(x=>x.disabled=true);
 if(correct){btn.classList.add('correct');if(box)box.textContent='Betul. Itu langkah yang kita perlukan.';setTimeout(learningAdvance,550)}
 else{btn.classList.add('wrong');if(box)box.textContent='Belum. Tengok semula langkah yang Coach tunjuk tadi.';setTimeout(()=>{btn.classList.remove('wrong');btn.parentElement.querySelectorAll('button').forEach(x=>x.disabled=false)},700)}
}
function learningStart(skillId,intervention,opts={}){
  if(!opts.dev)window.PAEffortGuard?.coachStarted?.(skillId);
  const m=META[skillId];if(!m)return;
  ensureCoachMemory();
  const strategyPlan=coachStrategyPlan(skillId,intervention?.type||'manual',intervention?.tag||'generic');
  learningState={skillId,originSkill:skillId,tag:intervention?.tag||'generic',type:intervention?.type||'manual',reason:intervention?.reason||'Jom kita tengok cara selesaikan soalan ini.',stage:0,key:conceptKeyFor(skillId,intervention?.tag),checkpoint:0,checkpointWrong:0,fromDev:!!opts.dev,originalPrompt:sess?.q?.prompt||'',need:strategyPlan.need,strategy:strategyPlan.strategy,strategyLadder:strategyPlan.ladder,strategyIndex:0};
  sess.learningActive=true;
  sess.questionToken=(sess.questionToken||0)+1;
  db.coachMemory.interventions[skillId]=(db.coachMemory.interventions[skillId]||0)+1;
  document.getElementById('learningSkill').textContent=`${m.id} · ${m.title}`;
  document.getElementById('learningReason').textContent=learningState.reason;
  renderLearningStage();screen('learning');save();
}
function renderLearningStage(){
  if(!learningState)return;
  const s=learningState.stage,m=META[learningState.skillId];
  renderVisualCoachArena(s,learningState.key,m);
  const mascot=document.getElementById('coachMascot'),stageMascot=document.getElementById('coachStageMascot'),line=document.getElementById('coachLine');
  [mascot,stageMascot].forEach(img=>{if(img){
    const pose=s===0?'welcome':(s<3?'teach':'encourage');
    img.src=`assets/coach/cikgu-wajar/${pose}.webp`;
    img.className=`coachMascot pose-${pose}`;
  }});
  if(line)line.textContent=s===0?'Mari kita fahamkan dahulu':(s===1?'Perhatikan cara Cikgu':(s===2?'Sambung langkah ini bersama-sama':'Sekarang tunjukkan kebolehan kamu'));
  document.querySelectorAll('.learnStep').forEach((x,i)=>{x.classList.toggle('active',i===s);x.classList.toggle('done',i<s)});
  const body=document.getElementById('learningBody');
  if(s<=2){body.innerHTML=stageContent(s,learningState.key,m,learningState.strategy);return}
  renderLearningCheckpoint(s===3?'Cuba':'Guna');
}
function learningAdvance(){learningState.stage=Math.min(4,learningState.stage+1);renderLearningStage()}
function learningChoice(btn,correct){
  btn.parentElement.querySelectorAll('button').forEach(x=>x.disabled=true);
  if(correct){btn.classList.add('correct');setTimeout(learningAdvance,450)}else{btn.classList.add('wrong');setTimeout(()=>{btn.disabled=false;btn.classList.remove('wrong');btn.parentElement.querySelectorAll('button').forEach(x=>x.disabled=false)},650)}
}
function renderLearningCheckpoint(label){
  const id=learningState.skillId,s=scoreState(id),mode=visualCoachMode(learningState.key,META[id]);let q=mode==='divide'&&learningState.stage===3?{prompt:'1 batu dibahagi kepada 2 bahagian sama besar.<br>Setiap bahagian ialah?',answer:'1/2',wrong:[{v:'1',tag:'division'},{v:'2',tag:'division'}]}:generate(id,s);
  const transfer=learningState.stage===4;
  if(transfer&&learningState.lastCheckpointPrompt){for(let i=0;i<5&&q.prompt===learningState.lastCheckpointPrompt;i++)q=generate(id,s)}
  q.skill=id;learningState.q=q;learningState.qStart=performance.now();if(!transfer)learningState.lastCheckpointPrompt=q.prompt;
  const spec=lessonSpecFor(id,learningState.key);const intro=transfer?'Sekarang guna cara yang sama pada soalan dalam bentuk sedikit berbeza.':'Sekarang cuba sendiri tanpa langkah lengkap daripada Coach.';
  document.getElementById('learningBody').innerHTML=`<div class="stageTag">${transfer?'TRANSFER':'CHECKPOINT'}</div><h2>${label}</h2><p>${intro}</p><div class="learningQuestion">${q.prompt}</div><div id="learningAnswers" class="learningAnswers"></div><div id="learningFeedback" class="learningFeedback"></div>`;
  const a=document.getElementById('learningAnswers');shuffle([{v:q.answer,tag:'correct',label:q.answer},...q.wrong]).forEach(o=>{const b=document.createElement('button');b.textContent=o.label??o.v;b.onclick=()=>learningAnswer(o,b);a.appendChild(b)});
}
function learningAnswer(o,btn){
  const q=learningState.q,ok=String(o.v)===String(q.answer),box=document.getElementById('learningFeedback');
  document.querySelectorAll('#learningAnswers button').forEach(x=>x.disabled=true);
  if(ok){btn.classList.add('correct');box.textContent='Betul. Cara kira kamu tepat.';if(learningState.stage===3){setTimeout(()=>{learningState.stage=4;renderLearningStage()},650)}else setTimeout(learningComplete,700)}
  else{
    btn.classList.add('wrong');learningState.checkpointWrong++;box.textContent='Belum tepat. Kita kembali satu langkah dan cuba semula.';
    if(learningState.checkpointWrong>=2){setTimeout(learningFallback,850)}else setTimeout(()=>{learningState.stage=Math.max(1,learningState.stage-1);renderLearningStage()},850)
  }
}
function learningFallback(){
  const id=learningState.skillId,origin=learningState.originSkill||id;
  const nextIndex=(learningState.strategyIndex||0)+1;
  if(nextIndex<(learningState.strategyLadder||[]).length){
    learningState.strategyIndex=nextIndex;learningState.strategy=learningState.strategyLadder[nextIndex];learningState.stage=0;learningState.checkpointWrong=0;
    const profile=coachSkillProfile(id);profile.strategyUses[learningState.strategy]=(profile.strategyUses[learningState.strategy]||0)+1;profile.lastStrategy=learningState.strategy;
    const label=coachStrategyLabel(learningState.strategy);
    learningState.reason=`Cara tadi belum membantu sepenuhnya. Cikgu tukar kepada ${label.toLowerCase()} supaya kamu boleh melihat konsep ini dengan cara lain.`;
    document.getElementById('learningReason').textContent=learningState.reason;
    log(`Cikgu Wajar tukar strategi ${origin}: ${learningState.strategy}.`);save();renderLearningStage();return;
  }
  recordCoachStrategyResult(id,learningState.strategy,false);
  db.restuLearningFailures=db.restuLearningFailures||{};
  db.restuLearningFailures[origin]=(db.restuLearningFailures[origin]||0)+1;
  log(`Learning cycle belum berjaya untuk ${origin}: ${db.restuLearningFailures[origin]}/2.`);
  save();
  if(!learningState.fromDev && db.restuLearningFailures[origin]>=2){
    activateRestuLock(origin);
    return;
  }
  const rec=(REC[id]||[]).find(x=>META[x]&&META[x].grade<=(META[id].grade));
  if(rec&&rec!==id){
    log(`Learning Camp ${id} masih belum stabil; coach pindah ke prerequisite ${rec}.`);
    const old=learningState,plan=coachStrategyPlan(rec,'prerequisite',old.tag);learningState={skillId:rec,originSkill:origin,tag:old.tag,type:'prerequisite',reason:'Kita cuba sekali lagi dengan asas yang lebih mudah. Cikgu akan pilih cara yang paling sesuai.',stage:0,key:conceptKeyFor(rec,old.tag),checkpoint:0,checkpointWrong:0,fromDev:old.fromDev,need:plan.need,strategy:plan.strategy,strategyLadder:plan.ladder,strategyIndex:0};
    document.getElementById('learningSkill').textContent=`Misi Asas · ${META[rec].title}`;document.getElementById('learningReason').textContent=learningState.reason;renderLearningStage();return;
  }
  learningState.stage=0;learningState.checkpointWrong=0;document.getElementById('learningReason').textContent='Kita cuba ajar sekali lagi dengan contoh yang lebih mudah dan langkah yang lebih kecil.';renderLearningStage();
}
function activateRestuLock(skillId){
  const until=Date.now()+RESTU_LOCK_MS;
  db.restuLock={active:true,skillId,until,createdAt:Date.now()};
  const title=META[skillId]?.title||'kemahiran ini';
  log(`Restu Parent Lock diaktifkan untuk ${skillId} selama minimum 5 minit.`);
  save();
  learningState=null;
  sess.learningActive=false;
  showRestuLock(skillId,title);
}
function activateEffortRestuLock(skillId){
  if(!db||db?.restuLock?.active)return;
  db.restuLock={active:true,mode:'effort',skillId,until:0,createdAt:Date.now()};
  log(`Restu Penjaga diaktifkan untuk semakan usaha pada ${skillId}.`);save();
  learningState=null;sess.learningActive=false;
  showRestuLock(skillId,META[skillId]?.title);
}
function showRestuLock(skillId,title){
  const lock=db?.restuLock;if(!lock||!lock.active)return false;
  const card=document.querySelector('#restu .restuLock'),heading=card?.querySelector('h1'),eyebrow=card?.querySelector('.eyebrow');
  const effort=lock.mode==='effort';card?.classList.toggle('effortMode',effort);
  const msg=document.getElementById('restuMessage');
  if(eyebrow)eyebrow.textContent=effort?'RESTU PENJAGA':'RESTU PARENT';
  if(heading)heading.textContent=effort?'Ibu Bapa, semak usaha sebentar':'Berhenti sekejap untuk ulang kaji';
  if(msg)msg.textContent=effort?'Cikgu Dimensi mengesan beberapa jawapan dipilih terlalu cepat walaupun petunjuk dan bimbingan telah diberikan. Mohon pastikan anak sedang membaca, berfikir dan mencuba sendiri.':`Coach sudah mengajar “${title||META[skillId]?.title||'kemahiran ini'}” dua kali, tetapi jawapan masih belum stabil. Ambil masa untuk rujuk buku teks atau nota dahulu.`;
  const key=document.getElementById('restuKeyInput'),err=document.getElementById('restuError');if(key)key.value='';if(err){err.textContent='';err.classList.remove('show')}
  const effortPin=document.getElementById('effortRestuPin'),effortErr=document.getElementById('effortRestuError');if(effortPin)effortPin.value='';if(effortErr){effortErr.textContent='';effortErr.classList.remove('show')}
  screen('restu');if(effort)setTimeout(()=>effortPin?.focus(),100);else startRestuCountdown();return true;
}
function startRestuCountdown(){
  if(restuTimerHandle)clearInterval(restuTimerHandle);
  const tick=()=>{
    const lock=db?.restuLock;if(!lock||!lock.active){if(restuTimerHandle)clearInterval(restuTimerHandle);return;}
    const left=Math.max(0,lock.until-Date.now()),sec=Math.ceil(left/1000),m=Math.floor(sec/60),s=sec%60;
    const out=document.getElementById('restuCountdown'),btn=document.getElementById('restuContinueBtn');
    if(out)out.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    if(btn){btn.disabled=left>0;btn.textContent=left>0?'Ulang Kaji Dulu':'Saya Dah Ulang Kaji';}
    if(left<=0&&restuTimerHandle){clearInterval(restuTimerHandle);restuTimerHandle=null;}
  };tick();restuTimerHandle=setInterval(tick,1000);
}
function clearRestuLock(reason){
  const skillId=db?.restuLock?.skillId;if(!db)return;
  db.restuLock={active:false,mode:null,skillId:null,until:0,clearedAt:Date.now(),reason};
  db.restuLearningFailures=db.restuLearningFailures||{};if(skillId)db.restuLearningFailures[skillId]=0;
  log(`Restu Parent dibuka${skillId?' untuk '+skillId:''}: ${reason}.`);save();
  if(restuTimerHandle){clearInterval(restuTimerHandle);restuTimerHandle=null;}
  if(skillId){sess.confirmSkill=skillId;sess.confirmRemaining=1;}
  if(sess && (sess.coachAdaptive||sess.missionChapter||sess.devBankTest)){nextQ();screen('game');}
  else renderHub();
}
function verifyEffortRestuPin(){
  const lock=db?.restuLock,field=document.getElementById('effortRestuPin'),err=document.getElementById('effortRestuError'),pin=(field?.value||'').trim();
  const fail=message=>{if(err){err.textContent=message;err.classList.add('show')}if(typeof playSfx==='function')playSfx('wrong')};
  if(!lock?.active||lock.mode!=='effort')return;
  if(!/^\d{4}$/.test(pin))return fail('Masukkan PIN Penjaga 4 digit.');
  if(!db.parentPin)return fail('PIN Penjaga belum ditetapkan. Sila buka Parent Mode untuk menyediakan PIN.');
  if(pin!==db.parentPin)return fail('PIN tidak tepat. Minta ibu bapa atau penjaga mencuba semula.');
  window.PAEffortGuard?.resetAfterParent?.();if(typeof playSfx==='function')playSfx('ui');clearRestuLock('Ibu bapa mengesahkan anak bersedia mencuba semula');
}
function restuContinueAfterStudy(){
  const lock=db?.restuLock;if(!lock||!lock.active)return;
  if(lock.mode==='effort')return;
  if(Date.now()<lock.until)return;
  clearRestuLock('self-study minimum 5 minit selesai');
}
function verifyRestuKey(){
  const val=(document.getElementById('restuKeyInput')?.value||'').trim().toUpperCase(),err=document.getElementById('restuError');
  if(db?.restuLock?.mode==='effort')return;
  if(val!==DUMMY_RESTU_KEY){if(err){err.textContent='Restu Key tidak tepat.';err.classList.add('show')}if(typeof playSfx==='function')playSfx('wrong');return;}
  if(typeof playSfx==='function')playSfx('ui');clearRestuLock('Restu Key ibu bapa');
}
function enforceRestuLock(){
  if(db?.restuLock?.active){return showRestuLock(db.restuLock.skillId,META[db.restuLock.skillId]?.title)}
  return false;
}
function learningComplete(){
  const id=learningState.skillId,origin=learningState.originSkill||id,fromDev=learningState.fromDev;
  if(!fromDev)window.PAEffortGuard?.coachFinished?.(origin);
  db.restuLearningFailures=db.restuLearningFailures||{};db.restuLearningFailures[origin]=0;
  ensureCoachMemory();db.coachMemory.recovered[id]=(db.coachMemory.recovered[id]||0)+1;recordCoachStrategyResult(id,learningState.strategy,true);setInterventionCooldown(id);
  if(!fromDev){addCoins(10);addXp(15);sess.hp=Math.min(20,(sess.hp||12)+4);showRewardToast('Konsep dikuasai semula! +10 🪙 · +15 XP · +HP');}
  log(`Learning Camp selesai: ${id}. Strategi ${learningState.strategy}; dua checkpoint diluluskan.`);save();
  const original=sess?.q?.skill;
  learningState=null;
  sess.learningActive=false;
  if(fromDev){renderHub();return}
  if(original){sess.confirmSkill=original;sess.confirmRemaining=1;}
  battle();
  if(sess.coachAdaptive && shouldFinishAdaptiveCoach()){screen('game');setTimeout(finishCoachSession,350);return;}
  if(!sess.devBankTest && !sess.coachAdaptive && sess.missionAnswered>=PROGRESSION.missionQuestions && sess.bossDefeated){screen('game');setTimeout(finishMission,350);return;}
  nextQ();screen('game');
}
function devForceLearning(type='misconception'){
  const id=document.getElementById('devSkill')?.value;if(!id)return;
  const tag=type==='guessing'?'guessing':bestDiagnosticTag(id);
  learningStart(id,{type,tag,reason:type==='guessing'?'DEV: simulasi jawapan terlalu cepat / meneka.':'DEV: simulasi misconception berulang.'},{dev:true});
}
function devOpenVisualCoach(mode='place'){
 if(!db||!isDevMode())return;
 const grade=+(document.getElementById('devGrade')?.value||db.schoolGrade),selected=document.getElementById('devSkill')?.value;
 const patterns={place:/nilai tempat/i,fraction:/pecahan/i,subtract:/tolak/i,divide:/bahagi/i,multiply:/darab/i,money:/wang/i,time:/masa/i,measure:/ukuran|panjang|jisim|isipadu/i,shape:/ruang|bentuk/i,area:/luas|perimeter/i,data:/data|carta|piktograf/i,add:/tambah/i};
 const matches=m=>(patterns[mode]||patterns.add).test(`${m?.domain||''} ${m?.title||''}`);
 const meta=(META[selected]&&matches(META[selected]))?META[selected]:GRAPH.skills.find(x=>x.grade===grade&&matches(x))||GRAPH.skills.find(matches);
 if(!meta){showRewardToast('Demo visual belum tersedia untuk mod ini.');return}
 const tags={place:'place',fraction:'fraction',divide:'division',multiply:'fact',money:'money',time:'time',measure:'unit',shape:'shape',area:'area',data:'data',add:'operation',subtract:'operation'};
 closeDevPanel();learningStart(meta.id,{type:'manual',tag:tags[mode]||'operation',reason:'DEV Visual Coach Lab'},{dev:true});
}
function devPreviewTerrain(theme='number'){
 if(!db||!isDevMode()||!TERRAIN_BY_THEME[theme])return;
 const domainMatch={number:/nombor/i,operation:/operasi|tambah|tolak|darab|bahagi/i,fraction:/pecahan|perpuluhan|peratus/i,money:/wang/i,time:/masa/i,measure:/ukuran|panjang|jisim|isipadu/i,shape:/ruang|bentuk|koordinat/i,data:/data|kebolehjadian/i}[theme];
 const grade=+(document.getElementById('devGrade')?.value||db.schoolGrade),meta=GRAPH.skills.find(x=>x.grade===grade&&domainMatch.test(`${x.domain} ${x.title}`))||GRAPH.skills.find(x=>domainMatch.test(`${x.domain} ${x.title}`));
 if(!meta)return;closeDevPanel();startDevSkill(meta.id);setBattleTerrain(meta);showRewardToast(`Terrain ${theme} dibuka`);
}
function bestDiagnosticTag(id){
 const m=META[id]||{};
 if(m.domain==='Nombor')return'place';if(m.domain==='Pecahan')return'fraction';if(m.domain==='Perpuluhan')return'decimal';if(m.domain==='Wang')return'money';if(m.domain==='Masa')return'time';if(m.domain==='Ukuran')return'unit';if(m.domain==='Ruang')return'shape';if(m.domain==='Data')return'data';if(m.domain==='Peratus')return'percent';if(m.domain==='Nisbah')return'ratio';return'operation';
}
