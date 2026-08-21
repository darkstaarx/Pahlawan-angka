const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
const ctx={console,Math};ctx.window=ctx;ctx.sess={questionFingerprints:[],questionHistory:[],mode:'practice'};vm.createContext(ctx);
const bankFiles=['data/kssr/knowledge-graph.js','data/kssr/alignment-v3.9.0.js','questions/helpers.js','questions/d1/core.js',...Array.from({length:8},(_,i)=>`questions/d2/topic-${i+1}.js`),'questions/d3/core.js','questions/d4/core.js','questions/d5/core.js','questions/d6/core.js','questions/kssr-archetypes-v3.9.0.js','questions/kssr-content-v3.11.js','questions/index.js'];
for(const file of bankFiles)vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
vm.runInContext('globalThis.__skills=GRAPH.skills;globalThis.__generate=generate',ctx);

const plain=value=>String(value??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const failures=[];let samples=0;
const technical=/\b(?:coach probe|prerequisite|misconception|diagnostic|calibrat(?:e|ion)|generated)\b/i;
const genericMathHint=/nombor penting|pilih operasi|satu langkah pada satu masa|nombor lebih kecil/i;
for(const skill of ctx.__skills){
  ctx.sess.questionFingerprints=[];ctx.sess.questionHistory=[];
  for(let i=0;i<120;i++){
    const q=ctx.__generate(skill.id,{evidence:5,confidence:60,mastery:60,correct:4,wrong:1});samples++;
    const prompt=plain(q?.prompt),hint=plain(q?.hint);
    if(!hint)failures.push({skill:skill.id,type:'hint-kosong',prompt});
    if(technical.test(`${prompt} ${hint}`))failures.push({skill:skill.id,type:'istilah-teknikal-murid',prompt,hint});
    if(/^D2\.7\./.test(skill.id)&&genericMathHint.test(hint))failures.push({skill:skill.id,type:'hint-ruang-lari-topik',prompt,hint});
    if(skill.id==='D2.7.1'&&/Objek/i.test(prompt)){
      const answer=plain(q.answer).toLocaleLowerCase('ms');
      if(new RegExp(`\\b${answer.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`,'i').test(prompt))failures.push({skill:skill.id,type:'jawapan-bocor-dalam-objek',prompt,answer});
    }
  }
}

const uiFiles=['js/app.js','js/battle.js','js/daily-spaced-review-v3.20.0.js','questions/helpers.js'];
const forbiddenUi=[
  [/Betulkan kesilapan|Semak kesilapan/i,'bahasa-demotivasi'],
  [/Coach Probe|turun ke prerequisite/i,'istilah-teknikal'],
  [/topik[^\n]{0,60}gagal/i,'label-gagal']
];
for(const file of uiFiles){
  const source=fs.readFileSync(path.join(root,file),'utf8');
  for(const [pattern,type] of forbiddenUi)if(pattern.test(source))failures.push({file,type,match:source.match(pattern)[0]});
}

const unique=[...new Map(failures.map(item=>[JSON.stringify(item),item])).values()];
const report={status:unique.length?'fail':'pass',samples,skills:ctx.__skills.length,failures:unique};
console.log(JSON.stringify(report,null,2));process.exitCode=unique.length?1:0;
