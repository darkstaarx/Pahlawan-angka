const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','questions','kssr-year4-curriculum-v3.58.0.js'),'utf8');
const ctx={console,Math,document:{documentElement:{setAttribute(){}}},window:{PAQuestionBanks:{d4:(id)=>({prompt:'legacy',answer:1,wrong:[{v:2},{v:3},{v:4}]})}}};
ctx.R=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;ctx.pick=a=>a[ctx.R(0,a.length-1)];ctx.N=(v,tag)=>({v,label:v,tag});
ctx.tidyNumber=(n,d=2)=>Number(Number(n).toFixed(d));ctx.moneyFmtUpper=n=>'RM'+(Number.isInteger(Number(n))?Number(n):Number(n).toFixed(2));
ctx.barChart=()=>'<svg class="barChart"></svg>';
ctx.Q=(prompt,answer,wrong,hint,kind,diagnostic,formatShift)=>{const seen=new Set([String(answer)]),w=[];for(const x of wrong||[]){if(!seen.has(String(x.v))){seen.add(String(x.v));w.push(x)}}let k=1;while(w.length<3){const v=typeof answer==='number'?answer+100*k:'Pilihan '+k;if(!seen.has(String(v))){seen.add(String(v));w.push(ctx.N(v,'generated'))}k++}return{prompt,answer,wrong:w.slice(0,3),hint,kind,diagnostic,formatShift}};
vm.createContext(ctx);vm.runInContext(src,ctx,{filename:'kssr-year4-curriculum-v3.58.0.js'});
const ids=['D4.FRAC','D4.DEC','D4.PERCENT','D4.MONEY','D4.TIME','D4.MEASURE','D4.PERIM','D4.DATA'],stats={};
for(const id of ids){const archetypes=new Set,competencies=new Set;let percentAdd=0,decimalNumerator=0;
 for(let i=0;i<2000;i++){const q=ctx.window.PAQuestionBanks.d4(id,{mastery:i%101},false);assert(q&&q.prompt&&q.answer!==undefined,id+' invalid');assert.equal(q.source,'kssr-year4-v3.58.0',id+' source');assert.equal(q.wrong.length,3,id+' distractors');const opts=[q.answer,...q.wrong.map(x=>x.v)].map(String);assert.equal(new Set(opts).size,4,id+' duplicate choices');archetypes.add(q.archetypeId);competencies.add(q.competencyId);const t=String(q.prompt).replace(/<[^>]+>/g,' ');if(id==='D4.PERCENT'){if(/%\s*[+\-−]\s*\d+\s*%/.test(t))percentAdd++;if(/\b\d+\.\d+\s*\/\s*\d+\b/.test(t))decimalNumerator++;}}
 stats[id]={archetypes:archetypes.size,competencies:[...competencies].sort(),percentAdd,decimalNumerator};}
assert.equal(stats['D4.PERCENT'].percentAdd,0,'No bare percent +/- in D4');
assert.equal(stats['D4.PERCENT'].decimalNumerator,0,'No decimal-numerator fraction in D4 percent');
assert(stats['D4.PERCENT'].archetypes>=5,'D4 percent breadth');
assert(stats['D4.FRAC'].archetypes>=6,'D4 fraction breadth');
assert(stats['D4.MONEY'].archetypes>=6,'D4 money breadth');
assert(stats['D4.PERIM'].archetypes>=6,'D4 space breadth');
console.log(JSON.stringify({status:'PASS',samplesPerSkill:2000,stats},null,2));