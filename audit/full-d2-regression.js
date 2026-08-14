const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
const ctx={console,Math,window:{PAQuestionBanks:{}},setTimeout,clearTimeout};vm.createContext(ctx);
for(const f of ['questions/helpers.js',...Array.from({length:8},(_,i)=>`questions/d2/topic-${i+1}.js`)]) vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
const skills=[];for(let t=1;t<=8;t++){const counts=[8,5,4,7,3,4,3,3][t-1];for(let s=1;s<=counts;s++)skills.push(`D2.${t}.${s}`)}
const visualRequired=new Set(['D2.3.1','D2.3.2','D2.4.1','D2.5.1','D2.6.1','D2.6.2','D2.6.3','D2.7.1','D2.7.2','D2.8.1','D2.8.2','D2.8.3']);
const report={samplesPerSkill:1000,skills:{},failures:[]};
function bank(id){const t=id.split('.')[1];return ctx.window.PAQuestionBanks['d2t'+t]}
function plain(s){return String(s).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim()}
for(const id of skills){
 const prompts=new Set(),answers=new Set();let visual=0,exceptions=0,dupOptions=0,bad=0;
 for(let i=0;i<1000;i++){
  try{
   const q=bank(id)(id,{mastery:i%101,evidence:3,confidence:60,correct:4,wrong:1},i%2===0);
   if(!q||!q.prompt||q.answer===undefined){bad++;continue}
   prompts.add(plain(q.prompt));answers.add(String(q.answer));if(/<svg|<table|fractionVisual|moneyVisual|moneyvisual|moneyVisual|<div[^>]+money|<span/.test(q.prompt))visual++;
   const opts=[String(q.answer),...(q.wrong||[]).map(x=>String(x.v))];if(new Set(opts).size!==opts.length)dupOptions++;
   if(/\/101\b/.test(q.prompt+' '+opts.join(' ')))bad++;
  }catch(e){exceptions++;if(report.failures.length<30)report.failures.push({id,error:String(e)})}
 }
 const r={uniquePrompts:prompts.size,uniqueAnswers:answers.size,visualSamples:visual,exceptions,duplicateOptionSamples:dupOptions,badSamples:bad};
 report.skills[id]=r;
 if(exceptions||dupOptions||bad)report.failures.push({id,...r});
 if(visualRequired.has(id)&&visual===0)report.failures.push({id,issue:'required visual absent'});
}
fs.writeFileSync(path.join(__dirname,'full-d2-regression-report.json'),JSON.stringify(report,null,2));
console.log('skills',skills.length,'failures',report.failures.length);
for(const [id,r] of Object.entries(report.skills))console.log(id,r.uniquePrompts,r.uniqueAnswers,'visual',r.visualSamples,'dup',r.duplicateOptionSamples,'bad',r.badSamples);
if(report.failures.length){console.error(JSON.stringify(report.failures.slice(0,20),null,2));process.exitCode=1}
