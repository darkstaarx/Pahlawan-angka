const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ctx={console,Math};ctx.window=ctx;vm.createContext(ctx);
const load=f=>vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
load('questions/helpers.js');load('questions/d2/topic-3.js');
const labels=html=>[...html.matchAll(/<text\b[^>]*>(.*?)<\/text>/g)].map(m=>m[1]).filter(Boolean);
for(let n=1;n<=9;n++){
 const svg=ctx.numberLineSvg(0,1,.1,n/10,{hidePointValue:true,endpointLabelsOnly:true});
 assert.deepStrictEqual(labels(svg),['0','1','?']);
 assert(svg.includes(`cx="${Number((22+n/10*276).toFixed(2))}"`));
 assert.equal((svg.match(/<line\b/g)||[]).length,12);
}
// Rounding questions still need their given value and full scale.
assert(labels(ctx.numberLineSvg(100,200,10,170)).includes('170'));
let total=0;
function sample(){for(let i=0;i<2000;i++){
 const q=ctx.PAQuestionBanks.d2t3('D2.3.2',{evidence:5,confidence:60,mastery:60,correct:4,wrong:1},true);
 if(!q.prompt.includes('titik merah'))continue;
 total++;assert.deepStrictEqual(labels(q.prompt),['0','1','?']);
 assert(!q.prompt.replace(/<[^>]*>/g,' ').includes(String(q.answer))); assert(!q.prompt.includes('persepuluh daripada'));
}}
sample();
load('questions/kssr-content-v3.11.js');sample();
assert(total>400);console.log(`PASS: all 9 positions, rounding preserved, ${total} generated number-line questions without answer leaks`);
