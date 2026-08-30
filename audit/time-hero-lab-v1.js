const fs=require('fs'),vm=require('vm'),assert=require('assert');
const noop=()=>{};
const context={window:{},document:{querySelector:()=>null,documentElement:{dataset:{}}},console};
vm.createContext(context);
vm.runInContext(fs.readFileSync('js/cikgu-manipulatives-v3.19.1.js','utf8'),context);
const lab=context.window.PACikguTimeLab;
let checks=0;function check(value){assert(value);checks++}
for(let h=0;h<24;h++)for(const m of [0,15,30,45])for(const target of [15,30,45,60,90,120]){
  const model=lab.timeExample(`Aktiviti bermula pada <b>${h}:${String(m).padStart(2,'0')}</b> dan berlangsung <b>${target} minit</b>.`);
  check(model.fromQuestion&&model.start===h*60+m&&model.target===target);
  model.elapsed=0;check(!lab.moveTime(model,-5));check(!lab.moveTime(model,7));
  for(let i=0;i<target/5;i++)check(lab.moveTime(model,5));
  check(model.elapsed===target);
  const total=(model.start+target)%1440;check(lab.timeLabel(model.start+target)===`${Math.floor(total/60)}:${String(total%60).padStart(2,'0')}`);
  for(let i=0;i<3;i++)check(lab.moveTime(model,5));check(!lab.moveTime(model,5));
  for(let i=0;i<3;i++)check(lab.moveTime(model,-5));check(model.elapsed===target);
}
for(const prompt of ['', 'Berapakah tempoh dari 7:15 hingga 7:45?', 'Aktiviti bermula 27:99 dan berlangsung 1000 minit.'])check(!lab.timeExample(prompt).fromQuestion);
// Render hooks only intercept the approved skill and retain independent checkpoints.
let original=0;context.window.renderVisualCoachArena=()=>original++;
context.window.visualCoachContent=()=> 'original';context.window.visualCoachMode=()=> 'time';
context.document.getElementById=()=>null;
vm.runInContext(fs.readFileSync('js/cikgu-manipulatives-v3.19.1.js','utf8'),context);
context.window.renderVisualCoachArena(3,'time',{id:'D2.5.3'});check(original===1);
check(context.window.visualCoachContent(3,'time',{id:'D2.5.3'})==='original');
console.log(`${checks} checks passed: time extraction, 5-minute moves, bounds, undo, rollover, checkpoint fallback.`);
