const assert = require('node:assert/strict');
const fs = require('node:fs');
const { runtime } = require('./grade-depth-runtime.cjs');
const { ctx, load } = runtime();
// Check every authored D6 branch separately; the general integrity audit checks final production wrappers.
load('questions/kssr-year6-money-real-v3.60.5.js');
const states = [{mastery:20,evidence:4,confidence:25,correct:1,wrong:3},{mastery:55,evidence:4,confidence:55,correct:3,wrong:0},{mastery:85,evidence:20,confidence:80,correct:18,wrong:2}];
const seen = new Set(); let checks=0, samples=0, zeroProfit=0;
const plain = s => s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const cents = s => Math.round(Number(String(s).replace(/^RM/,''))*100);
for (const state of states) {
  ctx.sess.questionHistory=[];
  for(let i=0;i<2500;i++) {
    const q=ctx.PAQuestionBanks.d6('D6.MONEY',state),p=plain(q.prompt),m=q.archetypeId.replace('y6moneyreal_','');
    ctx.sess.questionHistory.push({skillId:'D6.MONEY',archetypeId:q.archetypeId});
    seen.add(m); samples++;
    const a=[...p.matchAll(/RM(\d+(?:\.\d+)?)/g)].map(x=>Math.round(Number(x[1])*100));
    const pct=[...p.matchAll(/(\d+)%/g)].map(x=>Number(x[1]));
    const mul=(n,r)=>Math.round(n*r/100);
    let expected;
    switch(m) {
      case 'selling_from_cost_profit': expected=a[0]+a[1];break;
      case 'cost_from_selling_profit': expected=a[0]-a[1];break;
      case 'selling_from_cost_loss': expected=a[0]-a[1];break;
      case 'cost_from_selling_loss': expected=a[0]+a[1];break;
      case 'profit_percent': expected=a[0]+mul(a[0],pct[0]);break;
      case 'discount_amount': expected=mul(a[0],pct[0]);break;
      case 'discount_final': expected=a[0]-mul(a[0],pct[0]);break;
      case 'rebate_final': case 'voucher_balance': expected=a[0]-a[1];break;
      case 'cash_balance_after_discount': expected=a[1]-a[0]+mul(a[0],pct[0]);break;
      case 'service_tax_value': expected=mul(a[0],pct[0]);break;
      case 'interest_savings': case 'dividend_value': expected=mul(a[0],pct[0]);break;
      case 'interest_loan_years': case 'loan_total_payment': {
        assert.match(p,/faedah mudah.*atas pinjaman asal/);
        const years=Number(p.match(/selama (\d+) tahun/)[1]);
        expected=mul(a[0],pct[0])*years+(m==='loan_total_payment'?a[0]:0);break;
      }
      case 'multi_item_discount': expected=a[0]+a[1]-mul(a[0]+a[1],pct[0]);break;
      case 'bill_after_tax': expected=a[0]+mul(a[0],pct[0]);break;
      case 'savings_interest_growth': {
        const first=a[0]+mul(a[0],pct[0]);expected=first+mul(first,pct[0]);break;
      }
      case 'asset_liability_change': expected=a[0]-a[1]-a[2];break;
      case 'reverse_cost_from_discounted_sale': expected=a[0]-mul(a[0],pct[0])-a[1];break;
      case 'business_target_profit': {
        const count=Number(p.match(/membeli (\d+) unit/)[1]);expected=a[0]+a[1]/count;break;
      }
      case 'discount_then_profit': {
        const diff=a[0]-mul(a[0],pct[0])-a[1];
        const answer=diff===0?'tiada untung atau rugi':(diff>0?'untung ':'rugi ')+'RM'+(Math.abs(diff)/100).toFixed(2);
        assert.equal(q.answer,answer,p);checks++;
        if(diff===0){zeroProfit++;assert(!q.wrong.some(x=>/^(untung|rugi) RM0(?:\.00)?$/.test(x.v)), 'zero profit has equivalent distractor');}
        break;
      }
    }
    if(expected!==undefined){assert.equal(cents(q.answer),Math.round(expected),m+' '+p);checks++;}
    assert.equal(new Set([q.answer,...q.wrong.map(x=>x.v)].map(String)).size,4,m+' duplicate options');
  }
}
for(const m of [...ctx.PAY6MoneyReal.lowModes,...ctx.PAY6MoneyReal.coreModes,...ctx.PAY6MoneyReal.highModes])assert(seen.has(m),'missing mode '+m);
assert(checks>2000);assert(zeroProfit>0,'break-even not tested');
const report={status:'pass',samples,independentChecks:checks,zeroProfit,archetypes:[...seen].sort()};
fs.writeFileSync('audit/money-d6-release-report.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));

