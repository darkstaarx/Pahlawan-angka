// Darjah 2 Topic 4 question generators — Cikgu Wajar repaired bank.
window.PAQuestionBanks = window.PAQuestionBanks || {};
window.PAQuestionBanks.d2t4 = function(id,s,shift){
 if(id.startsWith("D2.4.")){return moneyQ(id,shift,s)}
 return null;
};
