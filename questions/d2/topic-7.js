// Darjah 2 Topic 7 question generators.
window.PAQuestionBanks = window.PAQuestionBanks || {};
window.PAQuestionBanks.d2t7 = function(id,s,shift){
if(id==="D2.7.1"){return shape3DQ(shift)}
if(id==="D2.7.2"){return shape2DQ(shift)}
if(id==="D2.7.3"){return Q(`Tin minuman paling hampir dengan bentuk apa?`,"silinder",[N("kubus","shape"),N("sfera","shape"),N("piramid","shape")],"Fikir bentuk objek harian.","D2 Core · Ruang",false,true)}
 return null;
};
