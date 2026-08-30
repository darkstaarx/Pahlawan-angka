const fs=require('fs'),vm=require('vm'),assert=require('assert');
const read=f=>fs.readFileSync(f,'utf8');
const extract=(src,start,end)=>src.slice(src.indexOf(start),src.indexOf(end,src.indexOf(start)));
let checks=0;const check=(ok,msg)=>{assert(ok,msg);checks++};
const ctx=vm.createContext({window:{},Math,R:(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pick:a=>a[Math.floor(Math.random()*a.length)],N:(v,tag)=>({v,tag}),Q:(prompt,answer,wrong)=>({prompt,answer,wrong})});
vm.runInContext(extract(read('questions/helpers.js'),'function timelineSvg(','function tallyTable('),ctx);
for(let h=7;h<=15;h++)for(const m of [0,15,30,45]){
 const end=h+2;
 check(!ctx.timelineSvg(h,m,end,m,{showEnd:false}).includes('>'+end+':'+String(m).padStart(2,'0')+'<'),'end answer leaked');
 check(!ctx.timelineSvg(h,m,end,m,{showStart:false}).includes('>'+h+':'+String(m).padStart(2,'0')+'<'),'start answer leaked');
 check(ctx.timelineSvg(h,m,end,m).includes('>'+end+':'+String(m).padStart(2,'0')+'<'),'duration endpoint removed');
}
vm.runInContext(read('questions/d2/topic-5.js'),ctx);
for(let i=0;i<500;i++){
 const q=ctx.window.PAQuestionBanks.d2t5('D2.5.3',{},false);
 if(q.prompt.includes('Pukul berapakah'))check(!q.prompt.includes('>'+q.answer+'<'),'fallback prompt leaks answer');
 else check(!q.prompt.includes('>?</text>'),'duration lost endpoints');
}
ctx.mark=q=>q;
vm.runInContext(extract(read('questions/kssr-content-integrity-v3.18.1.js'),'function d2Time(','function d2Measure('),ctx);
for(let i=0;i<500;i++){const q=ctx.d2Time('D2.5.3',{},false);check(!q.prompt.includes('>'+q.answer+'<'),'integrity prompt leaks answer');check(q.prompt.includes('>?</text>'),'missing unknown endpoint')}
vm.runInContext(extract(read('js/parent-learning-tools-v3.26.0.js'),'function fitText(','async function page('),ctx);
const canvas={font:'',measureText(text){return{width:text.length*parseInt(this.font.split(' ')[1])*0.55}}};
ctx.fitText(canvas,'enam ratus lapan puluh empat',195);
check(canvas.measureText('enam ratus lapan puluh empat').width<=195,'long answer does not fit');
ctx.fitText(canvas,'42',195);check(canvas.font==='900 17px Arial','short answer should retain size');
ctx.fitText(canvas,'x'.repeat(100),195);check(canvas.font==='900 11px Arial','minimum font not applied');
check(read('js/parent-learning-tools-v3.26.0.js').includes('fillText(item.answer,1012,y+61,195)'),'hard width guard missing');
let enter=0,pending=null;
Object.assign(ctx,{META:{test:{id:'test',title:'Test'}},sess:{q:{prompt:'question'}},db:{coachMemory:{interventions:{}}},ensureCoachMemory(){},coachStrategyPlan:()=>({need:'concept',strategy:'model',ladder:['model']}),conceptKeyFor:()=> 'general',document:{getElementById:()=>({textContent:''})},renderLearningStage(){enter++},screen(){},save(){}});
ctx.window.PADimensionalPortal={open:({onDone})=>{pending=onDone}};
vm.runInContext(extract(read('js/learning.js'),'function learningStart(','function renderLearningStage('),ctx);
ctx.learningStart('test',{});check(enter===0&&pending,'lesson opened before cinematic');pending();check(enter===1,'lesson did not open after cinematic');
ctx.learningStart('test',{}, {dev:true});check(enter===2,'dev fallback broken');
delete ctx.window.PADimensionalPortal;ctx.learningStart('test',{});check(enter===3,'no-portal fallback broken');
console.log(`${checks} checks passed: timeline, PDF fit, learning cut-in ordering.`);
