const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'),failures=[];
const toolSource=fs.readFileSync(path.join(root,'js/parent-learning-tools-v3.26.0.js'),'utf8');
const start=toolSource.indexOf('function numericValue'),end=toolSource.indexOf('async function worksheet',start);
if(start<0||end<0)throw new Error('Unable to isolate worksheet solution engine');
const solutionCtx={};vm.createContext(solutionCtx);vm.runInContext(`${toolSource.slice(start,end)};globalThis.solve=solutionFor`,solutionCtx);
const solve=(prompt,answer,hint='Semak langkah pengiraan.')=>solutionCtx.solve({prompt,answer,hint});
const expect=(name,condition,actual)=>{if(!condition)failures.push({name,actual})};

const exact=[
 ['subtract-estimate',solve('Tanpa mengira semula sepenuhnya, jawapan manakah munasabah bagi 712 − 692?',20),/710 − 690 ≈ 20/],
 ['multiply-estimate',solve('Tanpa mengira semula sepenuhnya, jawapan manakah munasabah bagi 48 × 6?',288),/50 × 6 ≈ 300/],
 ['divide-estimate',solve('Tanpa mengira semula sepenuhnya, jawapan manakah munasabah bagi 360 ÷ 9?',40),/40 × 9 = 360/],
 ['perimeter',solve('Sebuah segi empat tepat mempunyai panjang 13 cm dan lebar 5 cm. Hitung perimeter bentuk itu.','36 cm'),/2 × \(13 \+ 5\) = 2 × 18 = 36 cm/],
 ['area',solve('Sebuah segi empat tepat mempunyai panjang 12 cm dan lebar 7 cm. Hitung luasnya.','84 cm²'),/12 × 7 = 84 cm²/],
 ['volume',solve('Sebuah kuboid mempunyai panjang 8 cm, lebar 5 cm dan tinggi 3 cm. Hitung isi padunya.','120 cm³'),/8 × 5 × 3 = 120 cm³/],
 ['fraction-percent',solve('1/10 bersamaan berapa peratus?','10%'),/1 ÷ 10 × 100% = 10%/],
 ['percent-of',solve('25% daripada 80 ialah berapa?',20),/25 ÷ 100 × 80 = 20/],
 ['mixed-length',solve('3 m 65 cm ditambah 500 cm. Berapakah jumlahnya?','865 cm'),/3 × 100 \+ 65 = 365 cm.*365 \+ 500 = 865 cm/],
 ['compose-not-shape',solve('80 + 10 membentuk nombor?',90),/^(?!.*Ciri tersebut)/]
];
for(const [name,actual,pattern] of exact)expect(name,pattern.test(actual),actual);

const ctx={console,Math};ctx.window=ctx;ctx.sess={questionFingerprints:[],questionHistory:[],recent:[],mode:'practice'};vm.createContext(ctx);
const files=['data/kssr/knowledge-graph.js','data/kssr/alignment-v3.9.0.js','questions/helpers.js','questions/d1/core.js',...Array.from({length:8},(_,i)=>`questions/d2/topic-${i+1}.js`),'questions/d3/core.js','questions/d4/core.js','questions/d5/core.js','questions/d6/core.js','questions/kssr-archetypes-v3.9.0.js','questions/kssr-content-v3.11.js','questions/index.js'];
for(const file of files)vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
vm.runInContext('globalThis.__generate=generate;globalThis.__skills=GRAPH.skills',ctx);
for(const id of ['D1.ADD20','D1.SUB20']){for(let i=0;i<3000;i++){const q=ctx.__generate(id,{evidence:5,confidence:60,mastery:60,correct:4,wrong:1}),nums=(String(q.prompt).replace(/<[^>]+>/g,' ').match(/\d+/g)||[]).map(Number),answer=Number(q.answer);if(nums.some(n=>n>20)||answer>20||answer<0){failures.push({name:'year1-within-20',id,prompt:q.prompt,answer:q.answer});break}}}
for(const id of ['D1.N20','D1.N100']){for(let i=0;i<3000;i++){const q=ctx.__generate(id,{evidence:5,confidence:60,mastery:60,correct:4,wrong:1});if(/bundar/i.test(String(q.prompt))){failures.push({name:'year1-rounding-leak',id,prompt:q.prompt});break}}}
let estimates=0;for(const skill of ctx.__skills){for(let i=0;i<120;i++){const q=ctx.__generate(skill.id,{evidence:5,confidence:60,mastery:60,correct:4,wrong:1}),prompt=String(q.prompt||'').replace(/<[^>]+>/g,' ');if(!/tanpa mengira semula|anggaran|munasabah/i.test(prompt))continue;const pair=prompt.match(/\d+\s*([+−\-×÷])\s*\d+/);if(!pair)continue;estimates++;const out=solve(prompt,q.answer,String(q.hint||'')),op=pair[1].replace('-','−');if(op==='÷'){if(!out.includes('×'))failures.push({name:'division-estimate-method',skill:skill.id,prompt,out})}else if(!out.includes(` ${op} `))failures.push({name:'estimate-operator-lost',skill:skill.id,prompt,out});if(failures.length>30)break}}
expect('estimation-sample-coverage',estimates>300,estimates);
const report={status:failures.length?'fail':'pass',estimationSamples:estimates,exactCases:exact.length,year1Samples:12000,failures};console.log(JSON.stringify(report,null,2));process.exitCode=failures.length?1:0;
