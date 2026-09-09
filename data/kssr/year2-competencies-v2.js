// Pahlawan Angka — Year 2 KSSR competency map v2.0.0
// 70 unique KSSR Semakan 2017 Year 2 learning standards mapped to the
// existing 46 pupil-facing/adaptive D2 skill IDs for backward compatibility.
(function(){
'use strict';
const VERSION='2.0.0';
const units={
 1:'Nombor Bulat Hingga 1000',
 2:'Operasi Asas',
 3:'Pecahan dan Perpuluhan',
 4:'Wang',
 5:'Masa dan Waktu',
 6:'Ukuran dan Sukatan',
 7:'Ruang',
 8:'Pengurusan Data'
};
const nodes=[
 ['1.1.1',1,'D2.1.1','Menamakan nombor hingga 1000','Membaca nombor dalam perkataan, menyebut angka dan memadankan angka dengan nama nombor'],
 ['1.1.2',1,'D2.1.1','Menentukan nilai nombor hingga 1000','Menunjukkan kuantiti, memadankan kumpulan dengan nombor, membanding dan menyusun nilai'],
 ['1.2.1',1,'D2.1.2','Menulis nombor','Menulis nombor hingga 1000 dalam angka dan perkataan'],
 ['1.3.1',1,'D2.1.3','Membilang nombor','Membilang menaik dan menurun satu-satu hingga sepuluh-sepuluh dan seratus-seratus'],
 ['1.3.2',1,'D2.1.3','Melengkapkan rangkaian nombor','Melengkapkan rangkaian nombor menaik dan menurun'],
 ['1.4.1',1,'D2.1.4','Nilai tempat dan nilai digit','Menyatakan nilai tempat dan nilai digit bagi sebarang nombor hingga 1000'],
 ['1.4.2',1,'D2.1.4','Mencerakin nombor','Mencerakin nombor mengikut nilai tempat dan nilai digit'],
 ['1.5.1',1,'D2.1.5','Menganggar kuantiti','Memberi anggaran bilangan objek yang munasabah menggunakan set rujukan'],
 ['1.6.1',1,'D2.1.6','Membundarkan nombor','Membundarkan nombor bulat hingga ratus terdekat'],
 ['1.7.1',1,'D2.1.7','Mengenal pasti pola nombor','Mengenal pasti aturan pola bagi siri nombor menaik atau menurun'],
 ['1.7.2',1,'D2.1.7','Melengkapkan pola nombor','Melengkapkan pelbagai pola nombor mudah'],
 ['1.8.1',1,'D2.1.8','Masalah nombor harian','Menyelesaikan masalah harian yang melibatkan nombor hingga 1000'],

 ['2.1.1',2,'D2.2.1','Tambah dua nombor','Menambah dua nombor dengan hasil tambah dalam lingkungan 1000'],
 ['2.1.2',2,'D2.2.1','Tambah tiga nombor','Menambah tiga nombor dengan hasil tambah dalam lingkungan 1000'],
 ['2.2.1',2,'D2.2.2','Tolak dua nombor','Menolak dua nombor dalam lingkungan 1000'],
 ['2.2.2',2,'D2.2.2','Tolak dua nombor dari satu nombor','Melaksanakan penolakan berturut-turut dua nombor daripada satu nombor dalam lingkungan 1000'],
 ['2.3.1',2,'D2.2.3','Fakta asas darab','Mendarab dalam lingkungan fakta asas satu digit dengan satu digit'],
 ['2.3.2',2,'D2.2.3','Darab dengan 10','Mendarab nombor satu digit dengan 10'],
 ['2.4.1',2,'D2.2.4','Fakta asas bahagi','Membahagi dalam lingkungan fakta asas termasuk tanpa baki dan berbaki'],
 ['2.4.2',2,'D2.2.4','Bahagi nombor dua digit dengan 10','Membahagi sebarang nombor dua digit dengan 10'],
 ['2.5.1',2,'D2.2.5','Mereka cerita masalah','Mereka cerita masalah tambah, tolak, darab atau bahagi dalam lingkungan 1000'],
 ['2.5.2',2,'D2.2.5','Masalah operasi harian','Menyelesaikan masalah tambah, tolak, darab dan bahagi dalam situasi harian'],

 ['3.1.1',3,'D2.3.1','Pecahan unit','Mengenal pasti dan menyebut pecahan wajar berpengangka 1 dengan penyebut hingga 10'],
 ['3.1.2',3,'D2.3.1','Menamakan pecahan wajar','Menamakan pecahan wajar berpengangka hingga 9 dan penyebut hingga 10'],
 ['3.1.3',3,'D2.3.1','Mewakilkan pecahan','Mewakilkan gambar rajah mengikut pecahan wajar yang diberi'],
 ['3.1.4',3,'D2.3.1','Menulis pecahan','Menulis pecahan wajar yang diberi atau disebut'],
 ['3.1.5',3,'D2.3.1','Membanding pecahan','Membanding nilai dua pecahan wajar yang diberi'],
 ['3.2.1',3,'D2.3.2','Pecahan persepuluh ke perpuluhan','Menukar pecahan persepuluh kepada perpuluhan'],
 ['3.2.2',3,'D2.3.2','Menyebut perpuluhan','Menyebut perpuluhan 0.1 hingga 0.9'],
 ['3.2.3',3,'D2.3.2','Menunjuk perpuluhan','Menunjukkan nombor perpuluhan 0.1 hingga 0.9 pada perwakilan'],
 ['3.2.4',3,'D2.3.2','Mewakilkan perpuluhan','Mewakilkan gambar rajah mengikut perpuluhan yang diberi'],
 ['3.2.5',3,'D2.3.2','Menulis perpuluhan','Menulis perpuluhan yang diberi atau disebut'],
 ['3.2.6',3,'D2.3.2','Membanding perpuluhan','Membanding nilai dua perpuluhan yang diberi'],
 ['3.3.1',3,'D2.3.3','Membanding pecahan dan perpuluhan','Membanding nilai pecahan dengan nilai perpuluhan yang diberi'],
 ['3.4.1',3,'D2.3.4','Masalah pecahan dan perpuluhan','Menyelesaikan masalah pecahan dan perpuluhan dalam situasi harian'],

 ['4.1.1',4,'D2.4.1','Mata wang Malaysia hingga RM100','Mengenal pasti mata wang Malaysia hingga RM100'],
 ['4.1.2',4,'D2.4.1','Menentukan nilai wang','Menentukan nilai wang hingga RM100 melalui gabungan syiling dan wang kertas'],
 ['4.2.1',4,'D2.4.2','Tambah dua nilai wang','Menambah dua nilai wang dengan hasil tambah hingga RM100'],
 ['4.2.2',4,'D2.4.2','Tambah tiga nilai wang','Menambah tiga nilai wang dengan hasil tambah hingga RM100'],
 ['4.3.1',4,'D2.4.3','Tolak dua nilai wang','Menolak dua nilai wang dalam lingkungan RM100'],
 ['4.3.2',4,'D2.4.3','Tolak dua nilai wang dari satu nilai','Menolak dua nilai wang daripada satu nilai wang dalam lingkungan RM100'],
 ['4.4.1',4,'D2.4.4','Darab wang','Mendarab nilai wang dengan nombor satu digit atau 10, hasil hingga RM100'],
 ['4.5.1',4,'D2.4.5','Bahagi wang','Membahagi nilai wang dalam lingkungan RM100'],
 ['4.6.1',4,'D2.4.6','Simpanan dan perbelanjaan','Mengurus kewangan secara efektif sebagai asas simpanan dan perbelanjaan dalam lingkungan RM1000'],
 ['4.7.1',4,'D2.4.7','Masalah wang harian','Menyelesaikan masalah wang yang melibatkan situasi harian'],

 ['5.1.1',5,'D2.5.1','Senggatan minit pada jam','Mengenal tanda senggatan minit pada muka jam analog'],
 ['5.1.2',5,'D2.5.1','Menyatakan dan menunjukkan waktu','Menyatakan dan menunjukkan waktu dalam jam dan minit termasuk gandaan lima minit, setengah dan suku jam'],
 ['5.1.3',5,'D2.5.1','Menukar bentuk waktu','Menukar waktu jam dan minit daripada perkataan kepada angka dan sebaliknya'],
 ['5.1.4',5,'D2.5.1','Merekod waktu','Merekod waktu dalam jam dan minit termasuk aktiviti harian'],
 ['5.2.1',5,'D2.5.2','Perkaitan hari, jam dan minit','Menyatakan perkaitan hari dengan jam dan jam dengan minit'],
 ['5.3.1',5,'D2.5.3','Masalah masa harian','Menyelesaikan masalah masa dan waktu yang melibatkan situasi harian'],

 ['6.1.1',6,'D2.6.1','Unit panjang','Mengenal unit sentimeter dan meter serta simbol cm dan m'],
 ['6.1.2',6,'D2.6.1','Mengukur panjang','Mengukur, menandakan dan merekod panjang dalam cm dan m'],
 ['6.1.3',6,'D2.6.1','Menganggar panjang','Menganggar panjang dalam cm dan m dan membanding dengan ukuran sebenar'],
 ['6.2.1',6,'D2.6.2','Unit jisim','Mengenal unit gram dan kilogram serta simbol g dan kg'],
 ['6.2.2',6,'D2.6.2','Menimbang objek','Menimbang dan merekod jisim objek dalam g dan kg'],
 ['6.2.3',6,'D2.6.2','Menganggar jisim','Menganggar jisim dalam g dan kg dan membanding dengan timbangan sebenar'],
 ['6.3.1',6,'D2.6.3','Unit isi padu cecair','Mengenal unit mililiter dan liter serta simbol mL dan L'],
 ['6.3.2',6,'D2.6.3','Menyukat isi padu cecair','Menyukat, menanda dan merekod isi padu cecair dalam mL dan L'],
 ['6.3.3',6,'D2.6.3','Menganggar isi padu cecair','Menganggar isi padu cecair dalam mL dan L dan membanding dengan sukatan sebenar'],
 ['6.4.1',6,'D2.6.4','Masalah ukuran harian','Menyelesaikan masalah yang melibatkan panjang, jisim atau isi padu cecair dalam situasi harian'],

 ['7.1.1',7,'D2.7.1','Ciri bentuk tiga dimensi','Mengenal pasti bentuk 3D berdasarkan huraian ciri'],
 ['7.1.2',7,'D2.7.1','Bentuk asas bagi bentuk 3D','Mengenal pasti bentuk asas dua dimensi pada permukaan bentuk 3D'],
 ['7.1.3',7,'D2.7.1','Bentangan bentuk 3D','Mengenal pasti pelbagai bentangan bentuk tiga dimensi'],
 ['7.2.1',7,'D2.7.2','Ciri bentuk dua dimensi','Mengenal pasti bentuk 2D berdasarkan huraian ciri'],
 ['7.2.2',7,'D2.7.2','Melukis bentuk dua dimensi','Melukis bentuk asas dua dimensi'],
 ['7.3.1',7,'D2.7.3','Masalah ruang harian','Menyelesaikan masalah yang melibatkan bentuk 2D dan 3D dalam situasi harian'],

 ['8.1.1',8,'D2.8.1','Mengumpul, mengelas dan menyusun data','Mengumpul data berdasarkan situasi harian dan menyusunnya'],
 ['8.2.1',8,'D2.8.2','Membaca carta palang','Membaca dan mendapatkan maklumat daripada carta palang berskala satu unit'],
 ['8.3.1',8,'D2.8.3','Masalah data harian','Menyelesaikan masalah yang melibatkan carta palang dalam situasi harian']
].map(([id,unit,owner,title,summary])=>({id,unit,unitTitle:units[unit],owner,title,summary}));
const byId=Object.fromEntries(nodes.map(n=>[n.id,n]));
const routes={
 'D2.1.1':['1.1.1','1.1.2'],
 'D2.1.2':['1.2.1'],
 'D2.1.3':['1.3.1','1.3.2'],
 'D2.1.4':['1.4.1','1.4.2'],
 'D2.1.5':['1.5.1'],
 'D2.1.6':['1.6.1'],
 'D2.1.7':['1.7.1','1.7.2'],
 'D2.1.8':['1.8.1'],
 'D2.2.1':['2.1.1','2.1.2'],
 'D2.2.2':['2.2.1','2.2.2'],
 'D2.2.3':['2.3.1','2.3.2'],
 'D2.2.4':['2.4.1','2.4.2'],
 'D2.2.5':['2.5.1','2.5.2'],
 'D2.3.1':['3.1.1','3.1.2','3.1.3','3.1.4','3.1.5'],
 'D2.3.2':['3.2.1','3.2.2','3.2.3','3.2.4','3.2.5','3.2.6'],
 'D2.3.3':['3.3.1'],
 'D2.3.4':['3.4.1'],
 'D2.4.1':['4.1.1','4.1.2'],
 'D2.4.2':['4.2.1','4.2.2'],
 'D2.4.3':['4.3.1','4.3.2'],
 'D2.4.4':['4.4.1'],
 'D2.4.5':['4.5.1'],
 'D2.4.6':['4.6.1'],
 'D2.4.7':['4.7.1'],
 'D2.5.1':['5.1.1','5.1.2','5.1.3','5.1.4'],
 'D2.5.2':['5.2.1'],
 'D2.5.3':['5.3.1'],
 'D2.6.1':['6.1.1','6.1.2','6.1.3'],
 'D2.6.2':['6.2.1','6.2.2','6.2.3'],
 'D2.6.3':['6.3.1','6.3.2','6.3.3'],
 'D2.6.4':['6.4.1'],
 'D2.7.1':['7.1.1','7.1.2','7.1.3'],
 'D2.7.2':['7.2.1','7.2.2'],
 'D2.7.3':['7.3.1'],
 'D2.8.1':['8.1.1'],
 'D2.8.2':['8.2.1'],
 'D2.8.3':['8.3.1']
};
const activeSkills=Object.keys(routes);
const textbookUnits=Object.fromEntries(activeSkills.map(id=>{
 const ids=routes[id],unit=byId[ids[0]]?.unit;
 return [id,{unit,title:units[unit],standards:[...ids]}];
}));
window.PAY2CompetencyV2={version:VERSION,nodes,byId,routes,activeSkills,units,textbookUnits,uniqueStandardCount:new Set(nodes.map(n=>n.id)).size};
document.documentElement?.setAttribute('data-y2-competency-v2',VERSION);
})();