const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'),ctx={console,Math};ctx.window=ctx;ctx.sess={questionFingerprints:[],questionHistory:[],mode:'practice'};vm.createContext(ctx);
const files=['data/kssr/knowledge-graph.js','data/kssr/alignment-v3.9.0.js','questions/helpers.js','questions/d1/core.js',...Array.from({length:8},(_,i)=>`questions/d2/topic-${i+1}.js`),'questions/d3/core.js','questions/d4/core.js','questions/d5/core.js','questions/d6/core.js','questions/kssr-archetypes-v3.9.0.js','questions/kssr-content-v3.11.js','questions/index.js'];
for(const file of files)vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
vm.runInContext('globalThis.__skills=GRAPH.skills;globalThis.__generate=generate',ctx);
const source=fs.readFileSync(path.join(root,'js/parent-learning-tools-v3.26.0.js'),'utf8'),fallback=new Set(['D1.MONEY','D1.TIME','D1.SHAPE','D1.DATA','D2.7.2','D3.SHAPE','D4.PERIM','D5.AREA','D6.AREA']);
const failures=[],visual=/<(?:svg|img|canvas|table)\b|moneyVisual|clockFace|barChart|pictureGraph|coordinateGrid|shapeVisual|dataChart/i;
for(const skill of ctx.__skills){ctx.sess.questionFingerprints=[];ctx.sess.questionHistory=[];let printable=0;for(let i=0;i<80;i++){const q=ctx.__generate(skill.id,{evidence:5,confidence:60,mastery:60,correct:4,wrong:1});if(!visual.test(String(q.prompt||'')))printable++}if(printable<10&&!fallback.has(skill.id))failures.push({skill:skill.id,type:'printable-pool-too-small',printable});}
for(const id of fallback)if(!source.includes(`'${id}'`))failures.push({skill:id,type:'missing-print-fallback'});
if(!source.includes('[10,20,30,40]'))failures.push({type:'question-count-options-missing'});
if(!/PACommercial\?\.isPremium/.test(source))failures.push({type:'premium-gate-missing'});
if(!/optionDependent/.test(source)||!/item\.choices/.test(source))failures.push({type:'choice-dependent-printing-missing'});
if(!/solutionFor/.test(source)||!/Skema dan Cara Menjawab/.test(source)||!/Jawapan:/.test(source))failures.push({type:'worked-solution-missing'});
if(!/balancedChunks\(pack\.items,5\)/.test(source)||!/balancedChunks\(pack\.items,7\)/.test(source))failures.push({type:'balanced-pdf-pagination-missing'});
if(!/Gunakan operasi songsang/.test(source)||!/Anggarkan nombor/.test(source)||!/Julat yang dibundarkan/.test(source))failures.push({type:'teaching-steps-incomplete'});
if(!/missingNumberSteps/.test(source)||!/Cari nombor yang ditolak/.test(source)||!/Cari pembahagi/.test(source))failures.push({type:'missing-number-operation-coverage-incomplete'});
if(/service_role|secret[_-]?key/i.test(source))failures.push({type:'client-secret-risk'});
const report={status:failures.length?'fail':'pass',skills:ctx.__skills.length,fallbacks:fallback.size,failures};console.log(JSON.stringify(report,null,2));process.exitCode=failures.length?1:0;
