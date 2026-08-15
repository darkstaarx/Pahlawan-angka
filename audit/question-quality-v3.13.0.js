const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),ctx={console,Math};ctx.window=ctx;ctx.sess={questionFingerprints:[],questionHistory:[],mode:'practice'};vm.createContext(ctx);
const files=['data/kssr/knowledge-graph.js','data/kssr/alignment-v3.9.0.js','questions/helpers.js','questions/d1/core.js',...Array.from({length:8},(_,i)=>`questions/d2/topic-${i+1}.js`),'questions/d3/core.js','questions/d4/core.js','questions/d5/core.js','questions/d6/core.js','questions/kssr-archetypes-v3.9.0.js','questions/kssr-content-v3.11.js','questions/index.js'];
for(const f of files)vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
vm.runInContext('globalThis.__skills=GRAPH.skills;globalThis.__generate=generate;globalThis.__semantic=semanticChoiceKey',ctx);
const plain=s=>String(s).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const hasGraphic=s=>/<svg\b|<table\b|class="(?:fractionVisual|moneyVisual|clockVisual|geometryVisual|coordVisual)"/i.test(String(s));
const visualFamily=id=>/^(D1\.(FRAC|TIME|SHAPE|DATA)|D2\.(3\.1|3\.2|5\.1|6\.[123]|7\.[12]|8\.[123]))$/.test(id)||/D[3-6]\.(FRAC|TIME|DATA|SHAPE|PERIM|AREA|COORD|POSITION)$/.test(id);
const failures=[],stats={samples:0,semanticCollisions:0,visualSkills:0};
for(const skill of ctx.__skills){ctx.sess.questionFingerprints=[];ctx.sess.questionHistory=[];let visuals=0;
 for(let i=0;i<180;i++){const q=ctx.__generate(skill.id,{evidence:5,confidence:60,mastery:60,correct:4,wrong:1});stats.samples++;
  if(!q||!q.prompt||q.answer===undefined){failures.push({id:skill.id,type:'invalid-question'});continue}
  const keys=[q.answer,...q.wrong.map(x=>x.v)].map(ctx.__semantic);if(new Set(keys).size!==keys.length){stats.semanticCollisions++;failures.push({id:skill.id,type:'mathematically-equivalent-options',options:[q.answer,...q.wrong.map(x=>x.v)]})}
  const text=plain(q.prompt);if(/jam menunjukkan tepat pukul\s+\d+.*pilih waktu/i.test(text))failures.push({id:skill.id,type:'answer-leak',prompt:text});
  if(/^\.|\?\s*\?|\b(?:undefined|nan|infinity)\b/i.test(text))failures.push({id:skill.id,type:'language-or-format',prompt:text});if(hasGraphic(q.prompt))visuals++;
 }
 if(visualFamily(skill.id)){stats.visualSkills++;if(!visuals)failures.push({id:skill.id,type:'required-graphic-absent'})}
}
assert.equal(ctx.__semantic('20 + 5'),ctx.__semantic('5 + 20'),'expanded-form equivalence must be recognised');
assert.equal(ctx.__semantic('1/2'),ctx.__semantic('2/4'),'fraction equivalence must be recognised');
assert.notEqual(ctx.__semantic('9:00'),ctx.__semantic('9:30'),'clock times must stay distinct');
const report={status:failures.length?'fail':'pass',...stats,failures:[...new Map(failures.map(x=>[JSON.stringify(x),x])).values()]};
fs.writeFileSync(path.join(__dirname,'question-quality-v3.13.0-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));process.exitCode=failures.length?1:0;
