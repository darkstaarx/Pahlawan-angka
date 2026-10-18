const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={console,document:{querySelector:()=>null,documentElement:{dataset:{},setAttribute:()=>{}}},sess:{questionHistory:[]}};ctx.window=ctx;vm.createContext(ctx);
for(const path of ['questions/helpers.js','questions/d2/topic-1.js'])vm.runInContext(fs.readFileSync(path,'utf8'),ctx);
const modes=['less','near','more','double','triple'];
function check(q){
 const spec=q.estimateSpec;assert.equal(spec.reference,10);
 const groups=[...q.prompt.matchAll(/<g data-estimate-set="([AB])">([\s\S]*?)<\/g>/g)];
 assert.equal(groups.length,2);assert.equal((groups[0][2].match(/<circle /g)||[]).length,10);
 assert.equal((groups[1][2].match(/<circle /g)||[]).length,spec.target);
 assert(groups[1][2].includes('? objek'));assert(!groups[1][2].includes(spec.target+' objek'));
 assert.equal((q.prompt.match(/<rect /g)||[]).length,2,'no ten-object trays');
 const choices=[q.answer,...q.wrong.map(x=>x.v)].map(Number);assert.equal(new Set(choices).size,4);
 assert(choices.every(n=>n>0&&n<=40));assert(q.wrong.every(x=>x.tag==='estimate'));
 for(const n of choices.slice(1))assert(Math.abs(n-spec.target)>Math.abs(Number(q.answer)-spec.target),'unique closest estimate');
 assert(q.hint.includes('Set A')&&q.hint.includes('10 objek'));assert(!/bundar|digit sa|puluh terdekat/i.test(q.prompt+q.hint));
 // Every circle remains in its panel and has space from every other circle.
 for(const [,label,html] of groups){const pts=[...html.matchAll(/cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g)].map(m=>m.slice(1).map(Number));
 for(const [x,y,r] of pts){assert(x-r>(label==='A'?3:161)&&x+r<(label==='A'?151:309));assert(y-r>30&&y+r<150);}
 for(let i=0;i<pts.length;i++)for(let j=0;j<i;j++)assert(Math.hypot(pts[i][0]-pts[j][0],pts[i][1]-pts[j][1])>pts[i][2]+pts[j][2]);}
}
let count=0;const sizes=new Set();
for(const mode of modes)for(let i=0;i<250;i++){const q=ctx.d2ReferenceEstimate(mode);check(q);sizes.add(q.estimateSpec.target);count++;}
for(let i=0;i<250;i++){check(ctx.PAQuestionBanks.d2t1('D2.1.5',{},false));count++;}
for(const layer of ['questions/kssr-content-v3.11.js','questions/kssr-content-integrity-v3.18.1.js','questions/kssr-assessment-depth-v3.22.1.js']){
 vm.runInContext(fs.readFileSync(layer,'utf8'),ctx);const seen=new Set();
 for(let i=0;i<250;i++){const q=ctx.PAQuestionBanks.d2t1('D2.1.5',{},false);check(q);seen.add(q.estimateSpec.mode);ctx.sess.questionHistory.push({...q,skillId:'D2.1.5'});count++;}
 assert.equal(seen.size,5,layer+' covers all relations');
}
assert.equal(sizes.size,21);
const round=ctx.PAQuestionBanks.d2t1('D2.1.6',{},false);assert(/Bundar|bundar/.test(round.prompt));assert(!round.estimateSpec);
console.log(`PASS: ${count} questions across core, content, integrity and assessment-depth; 21 target counts; unique sensible choices; exact reference; nonoverlapping objects; rounding remains separate.`);
