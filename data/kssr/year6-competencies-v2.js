// Pahlawan Angka — Year 6 KSSR competency map v2.0.0
// 38 unique KSSR Semakan Year 6 learning standards, kept internal so the
// existing 16 pupil-facing/adaptive skill IDs remain backward-compatible.
(function(){
'use strict';
const VERSION='2.0.0';
const units={
  1:'Nombor Bulat dan Operasi Asas',
  2:'Pecahan, Perpuluhan dan Peratus',
  3:'Wang',
  4:'Masa dan Waktu',
  5:'Ukuran dan Sukatan',
  6:'Ruang',
  7:'Koordinat, Nisbah dan Kadaran',
  8:'Pengurusan Data dan Kebolehjadian'
};
const nodes=[
 ['1.1.1',1,'D6.NUMBERS','Nombor hingga 10 juta','Membaca, menyebut dan menulis nombor hingga 10 juta'],
 ['1.1.2',1,'D6.NUMBERS','Nilai tempat dan nilai digit','Mengenal nilai tempat dan nilai digit bagi nombor hingga 10 juta'],
 ['1.1.3',1,'D6.NUMBERS','Pecahan juta','Menghubungkan pecahan juta dengan nombor bulat'],
 ['1.1.4',1,'D6.NUMBERS','Perpuluhan juta','Menghubungkan perpuluhan juta dengan nombor bulat'],
 ['1.1.5',1,'D6.NUMBERS','Pola nombor','Melengkapkan dan menjelaskan pola nombor hingga 10 juta'],
 ['1.2.1',1,'D6.OPS','Operasi asas dan gabungan','Menyelesaikan operasi asas dan operasi bergabung termasuk anu'],
 ['1.3.1',1,'D6.NUMBERS','Nombor perdana dan gubahan','Mengenal pasti dan menaakul nombor perdana dan nombor gubahan'],
 ['1.4.1',1,'D6.NUMBERS','Penyelesaian masalah nombor','Menyelesaikan masalah harian nombor dan operasi hingga 10 juta'],

 ['2.1.1',2,'D6.FRAC','Bahagi pecahan','Membahagi pecahan dengan nombor bulat dan pecahan'],
 ['2.2.1',2,'D6.DEC','Darab perpuluhan','Mendarab perpuluhan dengan perpuluhan'],
 ['2.2.2',2,'D6.DEC','Bahagi perpuluhan','Membahagi perpuluhan dengan perpuluhan'],
 ['2.3.1',2,'D6.PERCENT','Peratus melebihi 100%','Menghubungkan perpuluhan dan peratus melebihi 100%'],
 ['2.3.2',2,'D6.PERCENT','Operasi peratus','Menambah dan menolak nilai peratus'],
 ['2.3.3',2,'D6.PERCENT','Nilai peratus','Menentukan nilai peratus dan kuantiti asal'],
 ['2.4.1',2,'D6.MIXED','Operasi bergabung nombor','Operasi bergabung melibatkan nombor bulat, pecahan dan perpuluhan'],
 ['2.5.1',2,'D6.MIXED','Masalah pecahan, perpuluhan dan peratus','Menyelesaikan masalah harian melibatkan pecahan, perpuluhan dan peratus'],

 ['3.1.1',3,'D6.MONEY','Istilah dan dokumen kewangan','Mengenal istilah, dokumen dan konsep kewangan'],
 ['3.1.2',3,'D6.MONEY','Pengiraan kewangan','Mengira kos, jualan, untung, rugi, diskaun, rebat, faedah, dividen dan cukai'],
 ['3.2.1',3,'D6.MONEY','Insurans dan takaful','Mengenal insurans dan takaful'],
 ['3.2.2',3,'D6.MONEY','Tujuan perlindungan','Menjelaskan tujuan insurans dan takaful dalam pengurusan risiko'],
 ['3.3.1',3,'D6.MONEY','Masalah kewangan','Menyelesaikan masalah harian berkaitan wang dan keputusan kewangan'],

 ['4.1.1',4,'D6.TIME','Zon masa','Mengenal zon masa dunia'],
 ['4.1.2',4,'D6.TIME','Perbezaan waktu','Menentukan perbezaan masa dan waktu antara bandar berlainan zon'],
 ['4.2.1',4,'D6.TIME','Masalah zon masa','Menyelesaikan masalah harian melibatkan zon masa'],

 ['5.1.1',5,'D6.MEASURE','Perkaitan ukuran','Menyelesaikan perkaitan panjang-jisim, panjang-isi padu dan jisim-isi padu'],

 ['6.1.1',6,'D6.ANGLE','Sudut poligon','Mengukur dan menggunakan sudut dalam poligon'],
 ['6.1.2',6,'D6.ANGLE','Membentuk sudut','Membentuk atau menentukan sudut berdasarkan ukuran yang diberi'],
 ['6.2.1',6,'D6.CIRCLE','Bahagian bulatan','Mengenal pusat, jejari dan diameter serta hubungannya'],
 ['6.2.2',6,'D6.CIRCLE','Melukis bulatan','Menentukan pembinaan bulatan berdasarkan jejari atau diameter'],
 ['6.3.1',6,'D6.SPACE_PROBLEM','Masalah ruang','Menyelesaikan masalah harian melibatkan sudut, poligon dan bulatan'],

 ['7.1.1',7,'D6.COORD','Koordinat dan skala','Menentukan jarak dan kedudukan pada satah koordinat menggunakan skala'],
 ['7.2.1',7,'D6.RATIO','Nisbah','Mewakil, menukar unit dan meringkaskan nisbah'],
 ['7.3.1',7,'D6.RATIO','Kadaran','Menentukan nilai menggunakan kadaran'],
 ['7.4.1',7,'D6.RATIO','Masalah koordinat, nisbah dan kadaran','Menyelesaikan masalah harian melibatkan koordinat, nisbah dan kadaran'],

 ['8.1.1',8,'D6.PIE','Carta pai','Melengkapkan, membaca dan mentafsir carta pai'],
 ['8.2.1',8,'D6.PROB','Bahasa kebolehjadian','Menyatakan kebolehjadian sesuatu peristiwa'],
 ['8.2.2',8,'D6.PROB','Menaakul kebolehjadian','Membanding dan memberi sebab bagi kebolehjadian'],
 ['8.3.1',8,'D6.DATA_PROBLEM','Masalah data dan kebolehjadian','Menyelesaikan masalah harian melibatkan data dan kebolehjadian']
].map(([id,unit,owner,title,summary])=>({id,unit,unitTitle:units[unit],owner,title,summary}));

const byId=Object.fromEntries(nodes.map(n=>[n.id,n]));
const routes={
 'D6.NUMBERS':['1.1.1','1.1.2','1.1.3','1.1.4','1.1.5','1.3.1','1.4.1'],
 'D6.OPS':['1.2.1'],
 'D6.FRAC':['2.1.1','2.4.1','2.5.1'],
 'D6.DEC':['2.2.1','2.2.2','2.4.1','2.5.1'],
 'D6.PERCENT':['2.3.1','2.3.2','2.3.3','2.4.1','2.5.1'],
 'D6.MONEY':['3.1.1','3.1.2','3.2.1','3.2.2','3.3.1'],
 'D6.TIME':['4.1.1','4.1.2','4.2.1'],
 'D6.MEASURE':['5.1.1'],
 'D6.ANGLE':['6.1.1','6.1.2'],
 'D6.CIRCLE':['6.2.1','6.2.2'],
 'D6.SPACE_PROBLEM':['6.3.1'],
 'D6.COORD':['7.1.1','7.4.1'],
 'D6.RATIO':['7.2.1','7.3.1','7.4.1'],
 'D6.PIE':['8.1.1'],
 'D6.PROB':['8.2.1','8.2.2'],
 'D6.DATA_PROBLEM':['8.3.1']
};
const activeSkills=Object.keys(routes);
const textbookUnits=Object.fromEntries(activeSkills.map(id=>{
 const ids=routes[id],unit=byId[ids[0]]?.unit;
 return [id,{unit,title:units[unit],standards:[...ids]}];
}));
window.PAY6CompetencyV2={
 version:VERSION,nodes,byId,routes,activeSkills,units,textbookUnits,
 uniqueStandardCount:new Set(nodes.map(n=>n.id)).size
};
document.documentElement?.setAttribute('data-y6-competency-v2',VERSION);
})();