// KSSR Year 2: tenth conversions, representation and comparisons, never counting-only as mastery.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('kedai-kek.html','utf8');
const P=require('../js/minigame-worked-v1.js');
const start=html.indexOf('const GEN=');
const stop=html.indexOf('/* ---------- enjin Kedai Kek ---------- */',start);
assert.ok(start>=0&&stop>start,'real generator source boundaries');
let roll=7;
const random={random:()=>0.25};
const R=(lo,hi)=>Math.min(hi,Math.max(lo,roll));
const DEC=v=>({type:'dec',v});
const FR=(n,d)=>({type:'frac',n,d});
const TENTH=n=>({type:'tenth',n,d:10,v:n/10});
const fsVal=(n,d)=>'['+n+'/'+d+']';
const generator=new Function('R','DEC','FR','TENTH','fs','Math',
  html.slice(start,stop)+'\nreturn GEN;')(R,DEC,FR,TENTH,fsVal,random);
const sample={fl:{n:'pandan',c:'#8fd16a',k:'#4f8f35'},who:'Keryan'};
test('Year 2 T1 assesses converting given tenths to a decimal, not counting cream',()=>{
 const q=generator[2].persepuluh[0].f(sample);
 assert.equal(q.wk.t,'tenth');assert.equal(q.wk.from,'frac');assert.equal(q.wk.out,'dec');
 assert.equal(q.form.type,'dec');assert.equal(q.form.v,.7);
 assert.match(q.q,/Tukar.*\[7\/10\].*perpuluhan/);
 assert.match(q.s,/nilai persepuluh/);
 assert.equal(q.vis[0].n,10);assert.equal(q.vis[0].sh,7);
 const w=P.buildFrac(q.wk);
 assert.ok(w);assert.equal(w.value.N,7);assert.equal(w.value.D,10);
 assert.equal(w.steps.length,3);
 assert.equal(w.steps[0].kind,'show','counting is an optional visual scaffold, not a graded test');
 assert.equal(w.steps[0].pre.glow,'sh','the one-at-a-time exploded count must be active');
 assert.match(w.steps[0].say,/Sentuh bahagian berkrim satu demi satu/);
 assert.equal(w.steps[1].right,'persepuluh');
 assert.equal(w.steps[2].right,'0.7');
 assert.deepEqual(w.steps.filter(x=>x.kind==='pick').map(x=>x.right),['persepuluh','0.7']);
 assert.doesNotMatch(w.steps.map(x=>x.say).join(' '),/Kira bahagian berkrim daripada 10/);
 const modelHTML=P.boardHTML(w);
 assert.equal((modelHTML.match(/data-k="sh"/g)||[]).length,7,'exactly seven cream parts');
 assert.equal((modelHTML.match(/data-k="un"/g)||[]).length,3,'exactly three uncreamed parts');
 assert.equal(w.value.N/w.value.D,q.form.v);
});
test('real Year 2 bottle gives visual context but requires decimal conversion',()=>{
 const q=generator[2].persepuluh[1].f(sample);
 assert.equal(q.form.type,'dec');assert.equal(q.form.v,.7);
 assert.equal(q.wk.from,'frac');assert.equal(q.vis[0].t,'bottle');
 assert.equal(q.wk.visual,'bottle','bottle model must not claim it is a cake');
 assert.match(q.q,/Tukarkan/);
 const w=P.buildFrac(q.wk);
 assert.equal(w.steps[0].kind,'show');
 assert.match(w.steps[0].say,/bahagian berisi jus/);
 assert.equal(w.steps[0].pre.glow,'sh');
 assert.equal(w.steps[2].right,'0.7');
 assert.match(P.boardHTML(w),/Perhatikan bahagian jus/);
});
test('Year 2 conversion works in the reverse direction',()=>{
 const q=generator[2].persepuluh[2].f(sample);
 assert.equal(q.wk.from,'dec');assert.equal(q.wk.out,'frac');
 assert.equal(q.form.type,'frac');assert.equal(q.form.n,7);assert.equal(q.form.d,10);
 const w=P.buildFrac(q.wk);
 assert.deepEqual([w.value.N,w.value.D],[7,10]);
});
test('remainder asks specifically for decimal or fraction and validates the requested form',()=>{
 const f=generator[2].persepuluh[3].f;roll=3;
 random.random=()=>0.25;
 const a=f(sample);
 assert.equal(a.form.type,'dec');assert.equal(a.form.v,.7);
 assert.match(a.q,/bentuk perpuluhan/);
 assert.equal(P.buildFrac(a.wk).answerText,'0.7');
 random.random=()=>0.75;
 const b=f(sample);
 assert.equal(b.form.type,'frac');assert.deepEqual([b.form.n,b.form.d],[7,10]);
 assert.match(b.q,/bentuk pecahan persepuluh/);
 assert.equal(P.buildFrac(b.wk).value.N,7);
});
test('Year 2 also includes comparison of a fraction and a decimal',()=>{
 assert.equal(generator[2].persepuluh[4].arch,'mixed_compare');
 assert.match(html,/arch:'mixed_compare'[\s\S]*?Yang manakah lebih besar/);
});
test('Kedai Kek loads the revised walkthrough version in its actual runtime',()=>{
 assert.match(html,/js\/minigame-worked-v1\.js\?v=1\.17\.3/);
 assert.equal(P.VERSION,'1.17.4');
});
