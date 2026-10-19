'use strict';
// D5 UASA completion: every new item type is reached through the real release loader and dispatcher,
// every answer is recomputed independently from qaEvidence, and existing D5 families stay reachable.
const assert=require('assert');
const {createContext}=require('./lib/question-runtime');
const {context:c,plan}=createContext({seed:20261020});
let checks=0;const failures=[],reached={},existing={},beginnerModes=new Set();
const plain=s=>String(s??'').replace(/<(b|i|strong|span|sup|sub)\b[^>]*>|<\/(b|i|strong|span|sup|sub)>/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const label=o=>plain(o&&typeof o==='object'?(o.label??o.v):o);
function ok(v,msg,q){checks++;if(!v&&failures.length<40)failures.push({msg,prompt:q?plain(q.prompt).slice(0,260):undefined,answer:q?.answer,wrong:q?.wrong?.map(label)});}
const cents=v=>{const m=plain(v).replace(/\s/g,'').match(/^RM(\d+)(?:\.(\d{1,2}))?$/);return m?Number(m[1])*100+Number((m[2]||'0').padEnd(2,'0')):NaN};
const num=v=>Number(plain(v).replace(/\s/g,''));
const grams=v=>{const t=plain(v),k=t.match(/(\d+) kg/),g=t.match(/(\d+) g$/);return (k?+k[1]*1000:0)+(g?+g[1]:0)};
const minutes=v=>{const m=plain(v).match(/^(\d+) jam (\d+) minit$/);return m&&+m[2]<60?+m[1]*60+ +m[2]:NaN};
const gcd=(a,b)=>b?gcd(b,a%b):a;
const roundTo=(x,u)=>Math.floor(x/u+.5)*u;
const simplest=(a,b)=>{const g=gcd(a,b);return `${a/g} : ${b/g}`};

const base=plan.files.indexOf('questions/kssr-year5-curriculum-v3.86.0.js'),patch=plan.files.indexOf('questions/d5/completion-v1.js');
ok(plan.branchesAgree&&base>=0&&patch===base+1,'completion loads straight after the final Year 5 bank in both loader branches');
ok(c.PAD5Completion?.installed,'completion installed');
const PLAN=c.PAD5Completion.plan,secure={mastery:90,evidence:9,confidence:90},core={mastery:50,evidence:5,confidence:50},beginner={mastery:10,evidence:0,confidence:20};

function verify(q){
 const e=q.qaEvidence,t=plain(q.prompt),a=q.answer;let expected,got;
 switch(e.mode){
  case 'reverse_round':{const n=num(a);ok(roundTo(n,e.unit)===e.target,'answer rounds to the target',q);ok(roundTo(e.smallest?n-1:n+1,e.unit)!==e.target,'answer is the extreme value',q);return}
  case 'big_subtract':expected=e.a-e.b;got=cents(a);break;
  case 'big_missing':expected=e.a-e.c;got=cents(a);break;
  case 'down_payment':expected=e.cost*(100-e.pct)/100;got=cents(a);break;
  case 'interest_year1':case 'interest_year2':{const y1=e.p*100*e.r/100,y2=(e.p*100+y1)*e.r/100;expected=Math.round(e.year===1?y1:y2);got=cents(a);ok(Math.abs((e.year===1?y1:y2)-expected)<1e-6,'interest is a whole number of sen',q);break}
  case 'receipt_line':case 'receipt_total':case 'receipt_change':{const lines=e.items.map(([n,u])=>n*u),total=lines.reduce((x,y)=>x+y,0);expected=e.part==='line'?lines[e.miss]:e.part==='total'?total:e.pay-total;got=cents(a);ok(e.part!=='change'||e.pay>total,'payment covers the bill',q);break}
  case 'mixed_mass_three':expected=e.a+e.b+e.c;got=grams(a);ok(/^\d+ kg \d+ g$/.test(plain(a)),'answer in kg and g',q);break;
  case 'mixed_length_three':expected=e.km*1000+e.m+e.cm/100;got=num(a);break;
  case 'volume_to_litre':expected=e.q*e.v/1000;got=num(a);break;
  case 'syrup_share':expected=e.total/e.n*e.k;got=num(a);ok(t.includes(e.total%1000?`${Math.floor(e.total/1000)} ℓ ${e.total%1000} mℓ`:`${e.total/1000} ℓ`),'bucket shows the total',q);break;
  case 'rope_total':expected=e.P+e.Q+e.R;got=num(a);break;
  case 'rope_left':expected=(e.P+e.Q+e.R)*(100-e.pct)/100;got=num(a);break;
  case 'packets_kg':expected=e.n*e.g/1000;got=num(a);break;
  case 'packets_left':expected=e.n*e.g-e.used;got=grams(a);ok(expected>=1000,'remaining mass has a kg part',q);break;
  case 'decimal_hour':expected=e.h*60+e.t*6;got=minutes(a);break;
  case 'visit_total':expected=e.h*60+e.t*6+e.H*60+e.M;got=minutes(a);break;
  case 'year_fraction':expected=e.w*12+12*e.n/e.d+e.m;got=num(a);ok(Number.isInteger(expected),'whole months',q);break;
  case 'date_duration':expected=(Date.UTC(e.y,e.em,e.ed)-Date.UTC(e.y,e.sm,e.sd))/864e5+1;got=num(a);ok(new RegExp('\\b'+e.y+'\\b').test(t),'year is not digit-grouped',q);break;
  case 'ratio_part_total':ok(plain(a)===simplest(e.askSmall?e.small:e.big,e.small+e.big),'ratio of part to total in simplest form',q);return;
  case 'ratio_count_total':{const part=e.askBoys?e.boys:e.girls;ok(plain(a)===simplest(part,e.boys+e.girls),'ratio of part to total in simplest form',q);return}
  case 'rate_distance':expected=e.l2*e.k;got=num(a);ok(t.includes(`${e.l1*e.k} km`),'diagram distance matches the rate',q);break;
  case 'rate_time':expected=e.n2*e.per;got=minutes(a);break;
  case 'freq_median':{const list=e.f.flatMap((n,i)=>Array(n).fill(i+1));expected=list[(list.length-1)/2];got=num(a);ok(list.length%2===1,'odd number of pupils',q);break}
  case 'pictograph_diff':expected=(e.s[e.hi]-e.s[e.lo])*e.key;got=num(a);break;
  case 'pictograph_total':expected=e.s.reduce((x,y)=>x+y,0)*e.key;got=num(a);break;
  case 'pictograph_mean':expected=e.s.reduce((x,y)=>x+y,0)*e.key/4;got=num(a);ok(Number.isInteger(expected),'whole-number mean',q);break;
  case 'mean_days':expected=e.v.reduce((x,y)=>x+y,0)/5;got=num(a);ok(Number.isInteger(expected),'whole-number mean',q);break;
  case 'mean_projection':expected=e.v.reduce((x,y)=>x+y,0)/5*e.days;got=num(a);break;
  case 'think_number':{const m=t.replace(/(\d) (?=\d{3}\b)/g,'$1').match(/dengan (\d+), kemudian saya (tolak|tambah) (\d+)\. Jawapannya ialah (\d+)\./);ok(m,'statement is readable',q);if(m){const x=num(a);ok((m[2]==='tolak'?x*+m[1]-+m[3]:x*+m[1]+ +m[3])===+m[4],'the number satisfies Hana\'s statement',q)}return}
  case 'stock_story':expected=e.c*e.per-e.sat-(e.sat+e.more);got=num(a);ok(expected>0,'stock left is positive',q);break;
  default:ok(false,'unknown mode '+e.mode,q);return;
 }
 ok(Math.abs(got-expected)<1e-9,`${e.mode} answer ${a} = ${expected}`,q);
}
function common(q,id){
 const opts=[q.answer,...q.wrong.map(w=>w.label??w.v)];
 ok(q.wrong.length===3&&new Set(opts.map(c.semanticChoiceKey)).size===4,'four distinct choices',q);
 ok(!q.wrong.some(w=>w.tag==='generated'),'every wrong choice is a planned misconception',q);
 ok(!/undefined|NaN|\[object Object\]|(^|[^\d])0 kg /.test(plain(q.prompt)+' '+opts.map(plain).join(' ')),'valid display',q);
 ok(!/(^|[^\d.])\d{5,}(?!\d)/.test(plain(q.prompt).replace(/\b20\d\d\b/g,'')),'UASA digit grouping',q);
 ok(q.familyKey===id&&q.source==='d5-completion-v1','tagged to its skill',q);
}
// Direct generation of every mode.
for(const id of Object.keys(PLAN))for(const mode of Object.keys(PLAN[id].modes))for(let i=0;i<250;i++){
 const raw=c.PAD5Completion.question(id,secure,mode),q=c.PAOptionIntegrity.groupDigits(c.PAOptionIntegrity.sanitize(raw),id);common(q,id);verify(q);
}
// The real dispatcher: new types are reached, learner stages are respected and existing families remain.
for(const id of Object.keys(PLAN))for(const [name,state] of [['beginner',beginner],['core',core],['secure',secure]]){
 for(let i=0;i<500;i++){const q=c.generate(id,state,{});if(q.source==='d5-completion-v1'){reached[q.qaEvidence.mode]=(reached[q.qaEvidence.mode]||0)+1;common(q,id);verify(q);if(name==='beginner')beginnerModes.add(id+':'+q.qaEvidence.mode)}else existing[id+':'+name]=(existing[id+':'+name]||0)+1;}
 // generate() prefers deeper, unseen items for secure learners, so existing families thin out there but must stay.
 ok((existing[id+':'+name]||0)>=50,`${id}/${name} keeps existing families`);
}
const planKey=(id,mode)=>PLAN[id].modes[mode]!==undefined?mode:mode.startsWith('receipt_')?'receipt':null;
for(const m of beginnerModes){const [id,mode]=m.split(':'),key=planKey(id,mode);ok(key&&PLAN[id].modes[key]===1,'beginner only receives stage-1 items: '+m)}
for(const id of Object.keys(PLAN))for(const mode of Object.keys(PLAN[id].modes)){const modes=mode==='receipt'?['receipt_line','receipt_total','receipt_change']:[mode];ok(modes.some(m=>reached[m]),'reached through the dispatcher: '+id+' '+mode)}
assert.strictEqual(c.PAOptionIntegrity.groupText('Tarikh <span data-no-group>2024</span> dan 12500'),'Tarikh <span data-no-group>2024</span> dan 12 500');checks++;
const report={status:failures.length?'fail':'pass',checks,newTypes:Object.values(PLAN).reduce((n,p)=>n+Object.keys(p.modes).length,0),reached,failures};
console.log(JSON.stringify(report,null,1));process.exitCode=failures.length?1:0;
