// Question dispatcher. Loads are split by grade/topic.
function generate(id,s){
  let shift = s.evidence>=2 && (s.confidence+15<s.mastery || s.correct>=3 && s.wrong===0) && Math.random()<.45;
  let bank = null;
  if(id.startsWith("D1.")) bank = window.PAQuestionBanks.d1;
  else if(id.startsWith("D3.")) bank = window.PAQuestionBanks.d3;
  else {
    const m=id.match(/^D2\.(\d+)\./);
    if(m) bank=window.PAQuestionBanks["d2t"+m[1]];
  }
  let q=bank ? bank(id,s,shift) : null;
  return q || Q("2 + 2 = ?",4,[N(3,"generic"),N(5,"generic"),N(6,"generic")],"Tambah kedua-dua nombor.","Fallback",false,false);
}
