// Pahlawan Angka — Year 1 KSSR competency map v2.0.0
// 56 unique KSSR Semakan 2017 Year 1 learning standards. They stay internal
// so the existing 14 pupil-facing/adaptive skill IDs remain backward-compatible.
(function(){
'use strict';
const VERSION='2.0.0';
const units={
 1:'Nombor Bulat Hingga 100',
 2:'Operasi Asas',
 3:'Pecahan',
 4:'Wang',
 5:'Masa dan Waktu',
 6:'Ukuran dan Sukatan',
 7:'Ruang',
 8:'Pengurusan Data'
};
const nodes=[
 ['1.1.1',1,'D1.N20','Kuantiti secara intuitif','Menyatakan banyak atau sedikit, sama banyak atau tidak sama banyak, lebih atau kurang melalui perbandingan'],
 ['1.2.1',1,'D1.N100','Menamakan nombor hingga 100','Membilang objek, menamakan nombor bagi kuantiti dan membandingkan kuantiti kumpulan'],
 ['1.2.2',1,'D1.CMP100','Menentukan nilai nombor hingga 100','Menunjukkan kuantiti, memadankan kumpulan dengan nombor, membanding dan menyusun nilai'],
 ['1.3.1',1,'D1.N100','Menulis nombor','Menulis nombor dalam angka dan perkataan'],
 ['1.4.1',1,'D1.N20','Kombinasi nombor','Menyatakan kombinasi dua nombor bagi membentuk nombor satu digit'],
 ['1.5.1',1,'D1.N100','Membilang nombor','Membilang satu-satu, dua-dua, empat-empat, lima-lima dan sepuluh-sepuluh secara menaik dan menurun'],
 ['1.5.2',1,'D1.N100','Melengkapkan rangkaian nombor','Melengkapkan rangkaian nombor secara satu, dua, empat, lima dan sepuluh'],
 ['1.6.1',1,'D1.PV100','Nilai tempat dan nilai digit','Menyatakan nilai tempat dan nilai digit bagi nombor hingga 100'],
 ['1.7.1',1,'D1.N100','Menganggar kuantiti','Memberi anggaran bilangan objek yang munasabah'],
 ['1.8.1',1,'D1.N100','Membundarkan nombor','Membundarkan nombor bulat kepada puluh terdekat'],
 ['1.9.1',1,'D1.N100','Mengenal pasti pola nombor','Mengenal pasti pola bagi siri nombor yang diberi'],
 ['1.9.2',1,'D1.N100','Melengkapkan pola nombor','Melengkapkan pelbagai pola nombor yang mudah'],
 ['1.10.1',1,'D1.N100','Masalah nombor harian','Menyelesaikan masalah yang melibatkan nombor dalam situasi harian'],

 ['2.1.1',2,'D1.ADD20','Bahasa tambah dan tolak','Menggunakan perbendaharaan kata yang relevan dalam konteks tambah dan tolak'],
 ['2.1.2',2,'D1.ADD20','Simbol operasi asas','Mengenal simbol tambah, tolak dan sama dengan'],
 ['2.1.3',2,'D1.ADD20','Ayat matematik daripada situasi','Menulis ayat matematik tambah atau tolak berdasarkan situasi yang diberi'],
 ['2.2.1',2,'D1.ADD20','Fakta asas tambah','Menambah dalam lingkungan fakta asas'],
 ['2.2.2',2,'D1.ADD100','Tambah hingga 100','Menambah dua nombor dengan hasil tambah dalam lingkungan 100'],
 ['2.3.1',2,'D1.SUB20','Fakta asas tolak','Menolak dalam lingkungan fakta asas'],
 ['2.3.2',2,'D1.SUB100','Tolak hingga 100','Menolak dua nombor dalam lingkungan 100'],
 ['2.4.1',2,'D1.ADD100','Mereka cerita masalah','Mereka cerita masalah tambah dan tolak dalam lingkungan 100'],
 ['2.4.2',2,'D1.SUB100','Masalah tambah dan tolak','Menyelesaikan masalah tambah dan tolak yang melibatkan situasi harian'],
 ['2.5.1',2,'D1.ADD20','Tambah berulang','Menulis ayat matematik tambah berulang dua, empat, lima dan sepuluh'],
 ['2.6.2',2,'D1.SUB20','Tolak berturut-turut','Menulis ayat matematik tolak berturut-turut dua, empat, lima dan sepuluh'],

 ['3.1.1',3,'D1.FRAC','Perdua dan perempat','Mengenal satu perdua, satu perempat, dua perempat dan tiga perempat'],
 ['3.2.1',3,'D1.FRAC','Masalah pecahan harian','Menyelesaikan masalah harian melibatkan perdua dan perempat'],

 ['4.1.1',4,'D1.MONEY','Mata wang Malaysia','Mengenal pasti syiling dan wang kertas Malaysia'],
 ['4.1.2',4,'D1.MONEY','Mewakilkan nilai wang','Mewakilkan nilai sen hingga RM1 dan ringgit hingga RM10'],
 ['4.1.3',4,'D1.MONEY','Menukar wang','Menukar syiling hingga RM1 dan ringgit hingga RM10 kepada nilai setara'],
 ['4.2.1',4,'D1.MONEY','Sumber kewangan dan simpanan','Mengenal pasti sumber kewangan dan simpanan'],
 ['4.2.2',4,'D1.MONEY','Rekod simpanan dan perbelanjaan','Merekod simpanan dan perbelanjaan daripada sumber kewangan'],
 ['4.3.1',4,'D1.MONEY','Masalah wang harian','Menyelesaikan masalah harian penambahan dan penolakan wang dalam skop Tahun 1'],

 ['5.1.1',5,'D1.TIME','Waktu dalam sehari','Menyatakan waktu seperti pagi, tengah hari, petang dan malam'],
 ['5.1.2',5,'D1.TIME','Urutan peristiwa harian','Menyatakan urutan peristiwa dalam sehari'],
 ['5.1.3',5,'D1.TIME','Hari dalam seminggu','Menamakan dan menggunakan urutan hari dalam seminggu'],
 ['5.1.4',5,'D1.TIME','Bulan dalam setahun','Menamakan dan menggunakan urutan bulan dalam setahun'],
 ['5.2.1',5,'D1.TIME','Jarum pada muka jam','Mengenal pasti jarum jam pada muka jam'],
 ['5.2.2',5,'D1.TIME','Pecahan muka jam','Mengenal setengah, satu perempat dan tiga perempat berdasarkan muka jam'],
 ['5.2.3',5,'D1.TIME','Menyebut dan menulis waktu','Menyebut dan menulis waktu jam, setengah dan satu perempat jam menggunakan jam analog'],
 ['5.3.1',5,'D1.TIME','Masalah masa harian','Menyelesaikan masalah masa dan waktu dalam situasi harian'],

 ['6.1.1',6,'D1.MEASURE','Bahasa ukuran','Menggunakan perbendaharaan kata panjang, jisim dan isi padu cecair dalam konteks'],
 ['6.1.2',6,'D1.MEASURE','Unit bukan piawai','Membuat pengukuran, jisim dan sukatan menggunakan unit bukan piawai'],
 ['6.1.3',6,'D1.MEASURE','Membanding ukuran relatif','Membanding dua atau lebih panjang, jisim dan isi padu menggunakan unit bukan piawai'],
 ['6.2.1',6,'D1.MEASURE','Masalah ukuran harian','Menyelesaikan masalah harian melibatkan ukuran relatif'],

 ['7.1.1',7,'D1.SHAPE','Bentuk tiga dimensi','Menamakan kuboid, kubus, kon, piramid tapak segi empat sama, silinder dan sfera'],
 ['7.1.2',7,'D1.SHAPE','Ciri bentuk tiga dimensi','Memperihalkan permukaan, sisi dan bucu bentuk tiga dimensi'],
 ['7.1.3',7,'D1.SHAPE','Pola bentuk tiga dimensi','Menyusun objek tiga dimensi mengikut pola'],
 ['7.1.4',7,'D1.SHAPE','Gabungan bentuk tiga dimensi','Menghasilkan bentuk baharu daripada gabungan bentuk tiga dimensi'],
 ['7.2.1',7,'D1.SHAPE','Bentuk dua dimensi','Menamakan segi empat sama, segi empat tepat, segi tiga dan bulatan'],
 ['7.2.2',7,'D1.SHAPE','Ciri bentuk dua dimensi','Memperihalkan garis lurus, sisi, bucu dan lengkung bentuk dua dimensi'],
 ['7.2.3',7,'D1.SHAPE','Pola bentuk dua dimensi','Menyusun bentuk dua dimensi mengikut pola'],
 ['7.2.4',7,'D1.SHAPE','Corak bentuk dua dimensi','Menghasilkan corak berasaskan bentuk dua dimensi'],
 ['7.3.1',7,'D1.SHAPE','Masalah ruang harian','Menyelesaikan masalah harian melibatkan bentuk dua dan tiga dimensi'],

 ['8.1.1',8,'D1.DATA','Mengumpul dan menyusun data','Mengumpul data berdasarkan situasi harian'],
 ['8.2.1',8,'D1.DATA','Membaca piktograf','Membaca dan mendapatkan maklumat daripada piktograf satu gambar satu nilai'],
 ['8.3.1',8,'D1.DATA','Masalah data harian','Menyelesaikan masalah data dalam situasi harian']
].map(([id,unit,owner,title,summary])=>({id,unit,unitTitle:units[unit],owner,title,summary}));

const byId=Object.fromEntries(nodes.map(n=>[n.id,n]));
const routes={
 'D1.N20':['1.1.1','1.4.1'],
 'D1.N100':['1.2.1','1.3.1','1.5.1','1.5.2','1.7.1','1.8.1','1.9.1','1.9.2','1.10.1'],
 'D1.PV100':['1.6.1'],
 'D1.CMP100':['1.2.2'],
 'D1.ADD20':['2.1.1','2.1.2','2.1.3','2.2.1','2.5.1'],
 'D1.ADD100':['2.2.2','2.4.1'],
 'D1.SUB20':['2.3.1','2.6.2'],
 'D1.SUB100':['2.3.2','2.4.2'],
 'D1.FRAC':['3.1.1','3.2.1'],
 'D1.MONEY':['4.1.1','4.1.2','4.1.3','4.2.1','4.2.2','4.3.1'],
 'D1.TIME':['5.1.1','5.1.2','5.1.3','5.1.4','5.2.1','5.2.2','5.2.3','5.3.1'],
 'D1.MEASURE':['6.1.1','6.1.2','6.1.3','6.2.1'],
 'D1.SHAPE':['7.1.1','7.1.2','7.1.3','7.1.4','7.2.1','7.2.2','7.2.3','7.2.4','7.3.1'],
 'D1.DATA':['8.1.1','8.2.1','8.3.1']
};
const activeSkills=Object.keys(routes);
const textbookUnits=Object.fromEntries(activeSkills.map(id=>{
 const ids=routes[id],unit=byId[ids[0]]?.unit;
 return [id,{unit,title:units[unit],standards:[...ids]}];
}));
window.PAY1CompetencyV2={
 version:VERSION,nodes,byId,routes,activeSkills,units,textbookUnits,
 uniqueStandardCount:new Set(nodes.map(n=>n.id)).size
};
document.documentElement?.setAttribute('data-y1-competency-v2',VERSION);
})();