const assert=require('assert');
const {runtime}=require('./grade-depth-runtime.cjs');
const {ctx}=runtime();

const state={mastery:85,evidence:20,confidence:80,correct:18,wrong:2};
const plain=s=>String(s).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const moneyCents=v=>{const m=String(v).match(/^RM(-?\d+)(?:\.(\d\d))?$/);return m?Number(m[1])*100+Number(m[2]||0):null};
const seen={D4:new Set(),D5:new Set()};
let samples=0, independentChecks=0;
for(const [id,group] of [['D4.MONEY','D4'],['D5.MONEY','D5']]){
  for(let i=0;i<1800;i++){
    const q=ctx.auditGenerate(id,state);samples++;
    seen[group].add(q.archetypeId);
    assert.equal(new Set([q.answer,...q.wrong.map(x=>x.v)].map(String)).size,4,`${id} duplicate choices`);
    assert(!q.wrong.some(x=>String(x.v).includes('NaN')),`${id} malformed distractor`);
    const ans=moneyCents(q.answer);
    const p=plain(q.prompt), amounts=[...p.matchAll(/RM(\d+(?:\.\d+)?)/g)].map(x=>Math.round(Number(x[1])*100));
    let expected;
    if(q.archetypeId==='money_mixed_mul_div'){
      const m=p.match(/^(\d+) × RM(\d+) ÷ (\d+)/);
      assert(m,'D4 must assess mixed multiplication/division only');
      assert.equal(q.competencyId,'3.2.2'); expected=Number(m[1])*Number(m[2])*100/Number(m[3]);
    }
    if(q.archetypeId==='depth_mixed_brackets'){
      const m=p.match(/^RM(\d+) \+ \(RM(\d+) × (\d+)\) − RM(\d+)/);
      assert(m,'all monetary operands need RM'); expected=(+m[1]+(+m[2])*(+m[3])-(+m[4]))*100;
    }
    if(q.archetypeId==='depth_credit_debt')expected=amounts[0]+amounts[1];
    if(q.archetypeId==='depth_dividend_bonus')expected=Number(p.match(/mempunyai (\d+) unit/)[1])*amounts[0];
    if(q.archetypeId==='depth_saving_investment')expected=amounts[0]*Number(p.match(/selama (\d+) bulan/)[1])+amounts[1];
    if(q.archetypeId==='depth_interest_concept'){
      assert.equal(q.answer,'Faedah kompaun');
      assert(amounts[2]>amounts[1]); assert(!/RM\d+\.\d{3}/.test(p)); independentChecks++;
    }
    if(expected!==undefined){assert.equal(ans,Math.round(expected),p);independentChecks++;}
    if(ans!==null)assert(ans>=0,`${id} negative balance: ${plain(q.prompt)}`);
    if(q.archetypeId==='money_currency_rate')assert(/Kadar latihan/.test(plain(q.prompt))&&/latihan/.test(plain(q.hint||'')),'D4 currency must state hypothetical rate');
    if(q.archetypeId==='depth_saving_investment')assert(/bonus latihan/.test(plain(q.prompt)),'D5 saving bonus must be hypothetical');
    if(q.archetypeId==='depth_credit_debt')assert(/kredit/.test(plain(q.prompt))&&/caj/.test(plain(q.hint)),'D5 credit/debt comparison missing');
    if(q.archetypeId==='depth_interest_concept')assert(/mudah/.test(plain(q.prompt))&&/kompaun/.test(plain(q.prompt)),'D5 interest comparison missing');
    if(q.archetypeId==='depth_dividend_bonus')assert(/Dividen/.test(plain(q.prompt)),'D5 dividend coverage missing');
  }
}
for(const mode of ['money_mixed_mul_div','money_budget_record','money_needs_wants','money_currency_rate'])assert(seen.D4.has(mode),`D4 mode missing: ${mode}`);
for(const mode of ['depth_mixed_brackets','depth_saving_investment','depth_interest_concept','depth_dividend_bonus','depth_credit_debt'])assert(seen.D5.has(mode),`D5 mode missing: ${mode}`);
// Recognition belongs to foundation demand; high-mastery selection deliberately prefers reasoning.
let currencyRecognition=0;
const currencies={'Indonesia':'rupiah','Thailand':'baht','Singapura':'dolar Singapura','Jepun':'yen','United Kingdom':'paun sterling','Amerika Syarikat':'dolar Amerika Syarikat'};
ctx.sess.questionHistory=[];ctx.sess.questionFingerprints=[];
for(let i=0;i<500;i++){
  const q=ctx.auditGenerate('D4.MONEY',{mastery:20,evidence:1,confidence:25,correct:1,wrong:0});
  if(q.archetypeId==='money_currency_name'){
    assert.equal(q.competencyId,'3.5.1');
    assert.equal(q.answer,currencies[plain(q.prompt).match(/digunakan di (.+)\?/)[1]]);currencyRecognition++;
  }
}
assert(currencyRecognition>0,'currency recognition not reachable through beginner production dispatch');
assert(independentChecks>300);
console.log(JSON.stringify({status:'pass',samples,independentChecks,currencyRecognitionDispatches:currencyRecognition,d4Archetypes:[...seen.D4].sort(),d5Archetypes:[...seen.D5].sort()},null,2));
