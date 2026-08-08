// Darjah 2 Topic 6 question generators.
window.PAQuestionBanks = window.PAQuestionBanks || {};
window.PAQuestionBanks.d2t6 = function(id,s,shift){
if(id==="D2.6.1"){return Q(`Unit sesuai untuk panjang meja?`,"cm",[N("kg","unit"),N("mL","unit"),N("g","unit")],"Panjang menggunakan cm atau m.","D2 Core · Ukuran",false,shift)}
if(id==="D2.6.2"){return Q(`Unit sesuai untuk jisim beg sekolah?`,"kg",[N("cm","unit"),N("mL","unit"),N("L","unit")],"Jisim menggunakan g atau kg.","D2 Core · Ukuran",false,shift)}
if(id==="D2.6.3"){return Q(`Unit sesuai untuk air dalam botol besar?`,"L",[N("kg","unit"),N("cm","unit"),N("g","unit")],"Cecair menggunakan mL atau L.","D2 Core · Ukuran",false,shift)}
if(id==="D2.6.4"){let a=R(20,90),b=R(10,50),ans=a+b;return Q(`Pita A ${a} cm dan B ${b} cm. Jumlah panjang?`,`${ans} cm`,[N(`${Math.abs(a-b)} cm`,"operation"),N(`${ans} kg`,"unit"),N(`${ans+10} cm`,"same_end")],"Tambah ukuran dan kekalkan unit.","D2 Core · Masalah Ukuran",true,true)}
 return null;
};
