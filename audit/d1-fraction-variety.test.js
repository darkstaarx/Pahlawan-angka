const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={console,sess:{questionHistory:[]},PAQuestionBanks:{d1:()=>({legacy:true})}};context.window=context;vm.createContext(context);
for(const path of ['questions/helpers.js','js/fraction-visuals-v2.js','questions/d1/fractions-audit-v1.js'])vm.runInContext(fs.readFileSync(path,'utf8'),context);
const {items,materialise}=context.PAD1FractionBank;assert.equal(items.length,240);assert.equal(new Set(items.map(x=>x.id)).size,240);
const fraction=value=>({'satu perdua':.5,setengah:.5,separuh:.5,'satu perempat':.25,suku:.25,'dua perempat':.5,'tiga perempat':.75,'satu keseluruhan':1}[String(value).toLowerCase()]??(/^\d+\/\d+$/.test(String(value))?value.split('/').map(Number).reduce((a,b)=>a/b):null));
for(const item of items){
 assert([2,4].includes(item.model.d));assert(['3.1.1','3.2.1'].includes(item.standardRef));
 const q=materialise(item);assert.equal(q.wrong.length,3);
 if(!['half_synonyms','quarter_synonyms'].includes(item.mode)){
  const expected=(item.model.answerNumerator??item.model.n)/item.model.d;
  assert.equal(fraction(q.answer),expected,item.id+' correct answer');
  for(const choice of q.wrong)assert.notEqual(fraction(choice.v),expected,item.id+' equivalent distractor');
 }
 if(q.fractionTask){assert.equal(q.fractionTask.d,item.model.d);assert.equal(q.fractionTask.n,item.model.n);}
}
const byId=new Map(items.map(x=>[x.id,x])),seen=new Set(),first=[],firstItems=[];
for(let i=0;i<240;i++){
 const q=context.PAQuestionBanks.d1('D1.FRAC',{},false);assert(!seen.has(q.templateId),'repeated template before deck exhausted');seen.add(q.templateId);
 const item=byId.get(q.templateId);if(i<100){first.push(item.model.d);firstItems.push(item);}
 context.sess.questionHistory.push({...q,skillId:'D1.FRAC'});
}
// Answers rotate by value (v3.86.50): in the first 100, no two neighbours have the same value
// (so 1/2 is never followed by 1/2, 2/4 or setengah), and each of 1/4, 1/2-or-2/4, 3/4 appears often.
const value=item=>fraction(materialise(item).answer);
const vals=firstItems.map(value);
for(let i=1;i<vals.length;i++)assert.notEqual(vals[i],vals[i-1],'same answer value back to back at '+i);
for(const v of [.25,.5,.75])assert(vals.filter(x=>x===v).length>=20,'answer '+v+' under-represented');
context.sess={questionHistory:[]};const fresh=context.PAQuestionBanks.d1('D1.FRAC',{},false);assert(byId.has(fresh.templateId));
assert.equal(context.PAQuestionBanks.d1('D2.FRAC',{},false).legacy,true);
console.log('PASS: 240 unique D1 templates; all correct answers/distractors valid; denominators 2/4 only; first 100 rotate answers with no same value back to back; no repeats per deck; independent sessions; legacy skills preserved.');
