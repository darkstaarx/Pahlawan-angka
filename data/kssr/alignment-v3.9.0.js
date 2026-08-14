(function(){
 const units={
  1:{1:'Nombor hingga 100',2:'Tambah dan Tolak',3:'Pecahan',4:'Wang',5:'Masa dan Waktu',6:'Panjang, Jisim dan Isi Padu Cecair',7:'Bentuk dan Ruang',8:'Data'},
  2:{1:'Nombor hingga 1 000',2:'Tambah, Tolak, Darab dan Bahagi',3:'Pecahan dan Perpuluhan',4:'Wang',5:'Masa dan Waktu',6:'Panjang, Jisim dan Isi Padu Cecair',7:'Bentuk',8:'Data'},
  3:{1:'Nombor hingga 10 000',2:'Tambah, Tolak, Darab dan Bahagi',3:'Pecahan, Perpuluhan dan Peratus',4:'Wang',5:'Masa dan Waktu',6:'Panjang, Jisim dan Isi Padu Cecair',7:'Bentuk',8:'Kedudukan',9:'Data'},
  4:{1:'Nombor dan Operasi',2:'Pecahan, Perpuluhan dan Peratus',3:'Wang',4:'Masa dan Waktu',5:'Ukuran dan Sukatan',6:'Ruang',7:'Koordinat, Nisbah dan Kadaran',8:'Pengurusan Data'},
  5:{1:'Nombor Bulat dan Operasi',2:'Pecahan, Perpuluhan dan Peratus',3:'Wang',4:'Masa dan Waktu',5:'Panjang, Jisim dan Isi Padu Cecair',6:'Ruang',7:'Koordinat, Nisbah dan Kadaran',8:'Pengurusan Data'},
  6:{1:'Nombor Bulat dan Operasi Asas',2:'Pecahan, Perpuluhan dan Peratus',3:'Wang',4:'Masa dan Waktu',5:'Ukuran dan Sukatan',6:'Ruang',7:'Koordinat, Nisbah dan Kadaran',8:'Pengurusan Data dan Kebolehjadian'}
 };
 function textbookUnit(m){
  if(m.grade<=2)return +m.chapter;
  if(m.grade===3){if(m.id==='D3.DATA')return 9;if(m.id==='D3.POSITION')return 8;return +m.chapter;}
  if(m.grade>=4){
   if(['Nombor','Operasi'].includes(m.domain))return 1;
   if(['Pecahan','Perpuluhan','Peratus'].includes(m.domain))return 2;
   if(m.domain==='Wang')return 3;if(m.domain==='Masa')return 4;if(m.domain==='Ukuran')return 5;
   if(['Ruang'].includes(m.domain))return 6;if(['Koordinat','Nisbah','Kadaran'].includes(m.domain))return 7;
   if(['Data','Kebolehjadian'].includes(m.domain))return 8;
  }
  return +m.chapter;
 }
 GRAPH.skills.forEach(m=>{m.gameplayChapter=String(m.chapter);m.textbookUnit=textbookUnit(m);m.textbookUnitTitle=units[m.grade]?.[m.textbookUnit]||m.domain;m.mappingConfidence='verified-unit';m.coverage='partial';});
 window.PAKssrUnits=units;
})();
