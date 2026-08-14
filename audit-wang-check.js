const fs=require('fs'),vm=require('vm');
const code=fs.readFileSync(__dirname+'/questions/helpers.js','utf8');
vm.runInThisContext(code);
const ids=['D2.4.1','D2.4.2','D2.4.3','D2.4.4','D2.4.5','D2.4.6','D2.4.7'];
const report={samplesPerSkill:1000,skills:{},failures:[]};
function moneyToCents(v){
 if(typeof v!=='string')return null;
 let m=v.match(/^RM(\d+)(?:\.(\d{2}))?$/); if(m)return +m[1]*100+(m[2]?+m[2]:0);
 m=v.match(/^(\d+) sen$/); if(m)return +m[1];
 return null;
}
for(const id of ids){
 let prompts=new Set(),answers=new Set(),visual=0,fail=[];
 for(let i=0;i<1000;i++){
   let q;
   try{q=moneyQ(id, i%2===0, {mastery:[10,35,60,85][i%4]});}catch(e){fail.push('runtime:'+e.message);continue}
   prompts.add(q.prompt);answers.add(String(q.answer));
   if(/moneyVisual|<span|priceTag|Harga barang|Buku/.test(q.prompt))visual++;
   const opts=[String(q.answer),...q.wrong.map(x=>String(x.v))];
   if(new Set(opts).size!==opts.length)fail.push('duplicate options');
   const c=moneyToCents(String(q.answer));
   if(c!=null && (c<0||c>10000))fail.push('answer out of range:'+q.answer);
   if(!q.prompt||!q.hint)fail.push('empty prompt/hint');
   if(id==='D2.4.6' && /Boleh simpan\?/i.test(q.prompt))fail.push('old yes/no bug');
   if(id==='D2.4.2' && c!=null && c>10000)fail.push('sum > RM100');
 }
 report.skills[id]={uniquePrompts:prompts.size,uniqueAnswers:answers.size,visualSamples:visual,failures:[...new Set(fail)]};
 if(fail.length)report.failures.push({id,count:fail.length,types:[...new Set(fail)]});
}
fs.mkdirSync(__dirname+'/audit',{recursive:true});
fs.writeFileSync(__dirname+'/audit/wang-regression-report.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
