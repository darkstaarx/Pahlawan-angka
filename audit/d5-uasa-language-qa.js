'use strict';
// Darjah 5 language and format contract, checked against myUASA Matematik Tahun 5 model papers 1 and 2:
// full-sentence questions (Nyatakan / Hitung / Berapakah …?), UASA digit grouping (485 362), ℓ and mℓ,
// answers in simplest form, and no choice a pupil can rule out without doing the mathematics.
const assert=require('assert');
const {createContext}=require('./lib/question-runtime');
const {context:c,plan}=createContext({seed:20261019});
let checks=0;const failures=[],counts={};
function ok(v,msg,q){checks++;if(!v&&failures.length<40)failures.push({msg,prompt:q?plain(q.prompt):undefined,answer:q?.answer,wrong:q?.wrong?.map(label)});}
const plain=s=>String(s??'').replace(/<style[\s\S]*?<\/style>/g,'').replace(/<(b|i|strong|span|sup|sub)\b[^>]*>|<\/(b|i|strong|span|sup|sub)>/g,'').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
const label=o=>plain(o&&typeof o==='object'?(o.label??o.v):o);
const bare=t=>/^[\d\s.,()+\-−×÷=?□\/]+$/.test(t);
const gcd=(a,b)=>b?gcd(b,a%b):a;

assert(plan.files.includes('questions/kssr-year5-curriculum-v3.86.0.js'),'final Year 5 bank is in the release plan');
assert.strictEqual(c.numWords(100),'seratus');assert.strictEqual(c.numWords(169886),'seratus enam puluh sembilan ribu lapan ratus lapan puluh enam');
assert.strictEqual(c.numWords(101000),'seratus satu ribu');assert.strictEqual(c.numWords(1000),'seribu');checks+=4;

const skills=['D5.N1000000','D5.PV1000000','D5.ADD','D5.SUB','D5.MUL','D5.DIV','D5.OPS','D5.FRAC','D5.DEC','D5.PERCENT','D5.MONEY','D5.TIME','D5.MEASURE','D5.AREA','D5.COORD','D5.RATIO','D5.RATE','D5.DATA'];
const states=[{mastery:10,evidence:0,confidence:20},{mastery:45,evidence:5,confidence:40},{mastery:85,evidence:8,confidence:75}];
const banned=[/hasilnya\?/i,/\blatihan\b/i,/hipotetikal/i,/ditunjukkan\/ditanya/i,/mata peratus/i,/Penilaian\?/,/digit terbesar saya/i,/satu ratus/i,/sama rata/i,/Tanpa mengira semula sepenuhnya/i];
for(const id of skills){for(let i=0;i<600;i++){
 const q=c.generate(id,states[i%3],{});counts[id]=(counts[id]||0)+1;
 const t=plain(q.prompt),opts=[plain(q.answer),...q.wrong.map(label)],all=t+' '+opts.join(' ')+' '+plain(q.hint);
 ok(q.wrong.length===3&&new Set(opts).size===4,'four distinct choices',q);
 ok(!/undefined|NaN|\[object Object\]|Pilihan \d|Tidak pasti/.test(all),'no placeholder text',q);
 // Q() pads collisions with arbitrary values; every D5 choice must come from a planned slip instead.
 ok(!q.wrong.some(w=>w.tag==='generated'&&!/order/.test(q.archetypeId||'')),'no filler choices',q);
 for(const re of banned)ok(!re.test(all),'banned wording '+re,q);
 // A question ends in a full sentence, not a note such as "Baki?" or "Koordinat baharu?".
 const last=t.split(/(?<=[.?])\s+/).pop();
 ok(bare(t)||!/\?$/.test(last)||last.split(/\s+/).length>3||/^(Berapakah|Apakah|Adakah|Siapakah|Bilakah)/.test(last),'full-sentence question',q);
 ok(!/\d,\d{3}\b/.test(all),'no comma thousands separator',q);
 ok(bare(t)||!/(^|[^\d.])\d{5,}(?!\d)/.test(t),'UASA digit grouping in sentences',q);
 ok(!/\d\.\d{5,}/.test(opts.join(' ')),'no long recurring decimals in choices',q);
 ok(!/(^|\s)m?L\b/.test(all.replace(/Bentuk L|bentuk L/g,'')),'KSSR uses ℓ and mℓ',q);
 ok(!/bekas[^.]*\bkm\b/.test(t),'containers never measure length',q);
 const n=Number(String(q.answer).replace(/\s/g,''));
 if(Number.isFinite(n)&&n>0)ok(!q.wrong.some(w=>label(w)==='0'),'no zero choice beside a positive answer',q);
 if(id==='D5.COORD')ok(!opts.some(o=>/-\d/.test(o)),'first quadrant only',q);
 if(id==='D5.PV1000000')ok(!/\+ 0\b/.test(t)&&!/\b0 \+/.test(t),'expanded form omits zero terms',q);
 if(id==='D5.FRAC'){
  ok(/bentuk yang termudah/.test(t),'asks for simplest form',q);
  for(const o of opts){const m=o.match(/^(?:(\d+) )?(\d+)\/(\d+)$/);if(m)ok(+m[2]<+m[3]&&gcd(+m[2],+m[3])===1,'choices in simplest mixed form: '+o,q);}
  for(const m of t.matchAll(/(?<![\d\/])(\d+)\/(\d+)(?![\d\/])/g))ok(gcd(+m[1],+m[2])===1,'operands in simplest form',q);
 }
 // Independent arithmetic check for single-operation sentences.
 const m=t.replace(/(\d) (?=\d{3}\b)/g,'$1').match(/^(\d+(?:\.\d+)?) ([+−×÷]) (\d+(?:\.\d+)?) = \?$/);
 if(m&&!/baki/.test(String(q.answer))){const a=+m[1],b=+m[3],r={'+':a+b,'−':a-b,'×':a*b,'÷':a/b}[m[2]];ok(Math.abs(r-n)<1e-9,'answer matches the operation',q);}
 if(/Gunakan anggaran/.test(t)){const step=Math.max(10,10**Math.max(1,String(Math.round(n)).length-2));ok(q.wrong.every(w=>Math.abs(Number(label(w).replace(/\s/g,''))-n)>=step),'estimation choices are a full step apart',q);}
}}
const report={status:failures.length?'fail':'pass',checks,samples:Object.values(counts).reduce((a,b)=>a+b,0),skills:skills.length,failures};
console.log(JSON.stringify(report,null,1));process.exitCode=failures.length?1:0;
