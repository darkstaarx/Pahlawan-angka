const fs=require('fs'),vm=require('vm'),assert=require('assert');
const {runtime}=require('./grade-depth-runtime.cjs');
const {ctx}=runtime();let samples=0,oracles=0,senAdvanced=0,d6Balance=0,d4Records=0,d5Budgets=0;const dealWinners=new Set();
const plain=s=>s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
function cents(v){
 const s=String(v).replace(/\s|,/g,'');let m=s.match(/^RM(-?\d+(?:\.\d+)?)$/i);
 if(m)return Math.round(Number(m[1])*100);
 m=s.match(/^(-?\d+(?:\.\d+)?)sen$/i);return m?Math.round(Number(m[1])):null;
}
const amounts=p=>[...p.matchAll(/RM\d+(?:\.\d+)?|\d+ sen/g)].map(m=>cents(m[0]));
const check=(q,expected)=>{oracles++;assert.equal(cents(q.answer)??Number(q.answer),expected,JSON.stringify(q));};
// Independent RM/sen equivalence, including the exact old ambiguous options.
assert.equal(ctx.semanticChoiceKey('RM1'),ctx.semanticChoiceKey('100 sen'));
assert.equal(ctx.semanticChoiceKey('RM0.50'),ctx.semanticChoiceKey('50 sen'));
assert.equal(ctx.semanticChoiceKey('10 RM'),ctx.semanticChoiceKey('RM10'));
const old=ctx.Q('Jumlah wang?','RM2',[ctx.N('200 sen','money'),ctx.N('RM3','money'),ctx.N('RM4','money')],'Tambah.');
assert(!old.wrong.some(x=>cents(x.v)===200));
const states=[{mastery:20,evidence:1,confidence:25,correct:1,wrong:0},{mastery:55,evidence:4,confidence:55,correct:3,wrong:0},{mastery:85,evidence:20,confidence:80,correct:18,wrong:2}];
const skills=ctx.auditSkills.filter(x=>x.domain==='Wang'||/MONEY|D2\.4\./.test(x.id));
const report=[];
for(const skill of skills){let numeric=0,modes=new Set();
 for(const state of states){ctx.sess.questionHistory=[];ctx.sess.questionFingerprints=[];
  for(let i=0;i<250;i++){
   const q=ctx.auditGenerate(skill.id,state),p=plain(q.prompt),a=amounts(p),id=skill.id,m=q.archetypeId||'';samples++;modes.add(m);
   const key=v=>cents(v)===null?'text:'+String(v).trim().toLowerCase():'money:'+cents(v);
   assert.equal(new Set([q.answer,...q.wrong.map(x=>x.v)].map(key)).size,4,id+' equivalent money options '+JSON.stringify(q));
   const n=cents(q.answer);if(n!==null){numeric++;assert(n>=0,id+' negative balance '+p);assert(Number.isInteger(n),id+' fraction of a sen');}
   if(/^(?:RM\d+(?:\.\d+)?|\d+ sen) [＋+−×÷] .* = \?$/.test(p)){
    const tokens=p.replace(/RM\d+(?:\.\d+)?|\d+ sen/g,x=>String(cents(x))).replace(/ = \?$/,'').split(' ');
    let expected=Number(tokens[0]);for(let j=1;j<tokens.length;j+=2){const v=Number(tokens[j+1]);expected=tokens[j]==='+'?expected+v:tokens[j]==='−'?expected-v:tokens[j]==='×'?expected*v:expected/v;}
    check(q,expected);
   }
   if(id.startsWith('D2.4.')&&m.startsWith('progress_money_')){
    if(a.some(n=>n%100))senAdvanced++;
    const k=Number(id.at(-1));let expected;
    if(m==='progress_money_inverse')expected=k===2?a[1]-a[0]:k===3?a[0]-a[1]:k===4?a[1]/a[0]:k===5?a[0]/a[1]:k===6?a[1]-a[0]:a[0]+a[1];
    else if(m==='progress_money_check')expected=k===2?a[0]+a[1]:k===3?a[0]-a[1]:k===4?a[0]*Number(p.match(/× (\d+)/)[1]):k===5?a[0]/Number(p.match(/÷ (\d+)/)[1]):a[1]-a[0];
    else expected=k===2?a[0]+a[1]:k===3?a[0]-a[1]:k===4?a[0]*Number(p.match(/harga (\d+) biji/)[1]):k===5?a[0]/Number(p.match(/kepada (\d+) murid/)[1]):a[0]-a[1];
    check(q,expected);
   }
   if(id==='D4.MONEY'&&m.startsWith('money_record')){d4Records++;check(q,m==='money_record_income'?a[0]+a[1]+a[2]:a[0]-a[1]-a[2]);}
   if(id==='D5.MONEY'&&m==='depth_budget'){d5Budgets++;check(q,a[0]-a[1]-a[2]-a[3]);}
   if(id==='D5.MONEY'&&m==='depth_compare_deal'){dealWinners.add(q.answer);assert.equal(q.answer,a[0]*3<a[1]?'Pakej A':'Pakej B');}
   if(id==='D6.MONEY'&&m==='y6moneyreal_money_sufficient'){
    const pct=Number(p.match(/(\d+)%/)[1]),diff=a[2]-(a[0]*(100-pct)/100+a[1]);d6Balance++;
    assert.equal(q.answer,(diff>=0?'baki ':'kurang ')+'RM'+(Math.abs(diff)/100).toFixed(2));
   }
  }
 }
 report.push({id:skill.id,samples:750,numeric,archetypes:modes.size});
}
assert(senAdvanced>500,'deep D2 tasks lost sen');assert(oracles>1500,'money oracle coverage missing');assert(d6Balance>0,'D6 balance branch not exercised');assert(d4Records>0&&d5Budgets>0,'budget branch coverage missing');assert.equal(dealWinners.size,2,'D5 cheaper package is predictable');
// Exercise authored D1 recognition/combination branches directly, including
// RM1 vs 100 sen and RM5+RM5, rather than relying on dispatcher selection.
for(const node of ['4.1.1','4.1.2'])for(let i=0;i<300;i++){
 const q=ctx.PAY1V2Runtime.GEN[node]('D1.MONEY',states[i%3]);
 const n=cents(q.answer);if(n!==null)assert(!q.wrong.some(x=>cents(x.v)===n),node+' two valid options');
}
// Use the production matcher; verify explicit units, bare values in the
// displayed unit, malformed entries, and existing number/percent behavior.
ctx.document.documentElement.removeAttribute=()=>{};ctx.document.getElementById=()=>null;
vm.runInContext(fs.readFileSync('js/dev-experiments-v3.21.2.js','utf8'),ctx);
const api=ctx.PADevExperiments;
for(const [answer,yes,no] of [
 ['RM0.50',['0.50','RM0.50','50 sen'],['50','0.05','RM50','RM50sen']],
 ['50 sen',['50','50 sen','RM0.50'],['0.50','RM50','5 sen']],
 ['RM2.75',['2.75','RM2.75','275 sen'],['275','RM275','27.5 sen']],
 ['RM1000',['1,000','RM1,000','100000 sen'],['100000','1000 sen']],
 [7,['7','7.0'],['RM7','7 sen']],['20%',['20','20%'],['0.2','RM20']]
]){assert(api.typedEligible({answer}));for(const x of yes)assert(api.typedMatch({answer},x),answer+' rejects '+x);for(const x of no)assert(!api.typedMatch({answer},x),answer+' accepts '+x);}
const result={status:'pass',samples,independentOracles:oracles,senAdvanced,d4Records,d5Budgets,d6Balance,dealWinners:[...dealWinners],skills:report};
fs.writeFileSync('audit/money-integrity-report.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
