'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const c={console,Math,document:{documentElement:{setAttribute(){}},createElement(){return{set innerHTML(v){this.textContent=v.replace(/<[^>]*>/g,' ')}}}},sess:{questionHistory:[]}};c.window=c;vm.createContext(c);
for(const file of ['questions/helpers.js','questions/kssr-assessment-depth-v3.22.0.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c);
let checks=0;function check(v,msg){assert(v,msg);checks++}
for(const answer of ['1.893','1.605','1.230','1.600','0.001']){const q=c.Q('test',answer,[c.N('2.001','decimal'),c.N('2.002','decimal'),c.N('2.003','decimal')],'hint');check(q.answer===answer,'explicit precision lost');check(new Set([q.answer,...q.wrong.map(x=>x.v)].map(c.semanticChoiceKey)).size===4,'choices collide')}
check(c.tidyDisplay(0.1+0.2)===0.3,'numeric noise');check(c.tidyDisplay('RM67.19999999999999')==='RM67.2','money noise');check(c.moneyFmtUpper(1.605)==='RM1.60','money convention changed');check(c.semanticChoiceKey('1.600')===c.semanticChoiceKey('1.6'),'equivalent numeric choices');check(c.semanticChoiceKey('0/1000')===c.semanticChoiceKey(0),'zero fraction equivalence');check(c.semanticChoiceKey('1.605')!==c.semanticChoiceKey('1.6'),'distinct decimals merged');
const seen=new Set(),gens=c.PAKSSRDepth.generators;
for(const [grade,id] of [['d4','D4.DEC'],['d5','D5.DEC'],['d4','D4.MUL'],['d5','D5.COORD'],['d6','D6.COORD'],['d6','D6.FRAC'],['d4','D4.PERIM']]){
 for(let i=0;i<700;i++){
 const q=gens[grade](id,{mastery:80,evidence:8},false);seen.add(id+':'+q.competencyId);c.sess.questionHistory.push({skillId:id,archetypeId:q.archetypeId});c.sess.questionHistory=c.sess.questionHistory.slice(-8);
 check(new Set([q.answer,...q.wrong.map(x=>x.v)].map(c.semanticChoiceKey)).size===4,'non-distinct choices');
 const text=q.prompt.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
 if(['D4.DEC','D5.DEC'].includes(id)){
 const m=text.match(/^(\d+\.\d+) ([+−]) (\d+\.\d+) ([+−]) (\d+\.\d+) = \?$/);
 if(m){const a=Math.round(Number(m[1])*1000),b=Math.round(Number(m[3])*1000),d=Math.round(Number(m[5])*1000),expected=(a+(m[2]==='+'?b:-b)+(m[4]==='+'?d:-d))/1000;check(Number(q.answer)===expected,'exact decimal answer mismatch '+text);check(q.solution&&q.hintSteps.length===3,'decimal teaching steps absent')}
 if(q.competencyId==='round3'){const raw=text.match(/\d+\.\d+/)[0];const expected=Math.round(Number(raw.replace('.',''))/10)/1000;check(Number(q.answer)===expected,'round3 changed');check(String(q.answer).split('.')[1]?.length===3,'round3 display')}
 }
 if(id==='D4.MUL'&&q.competencyId==='estimate'){const m=text.match(/Bundarkan (\d+) kepada ratus terdekat, kemudian anggarkan hasil darab dengan (\d+)/);check(!!m,'ambiguous estimate');check(q.answer===Math.round(+m[1]/100)*100*+m[2],'estimate answer')}
 if(id.endsWith('COORD')){const m=q.prompt.match(/aria-label="Grid koordinat: ([^"]+)"/);check(!!m,'coordinate accessible labels absent');const pts=[...m[1].matchAll(/([ABC]) \((\d+), (\d+)\)/g)].map(x=>({label:x[1],x:+x[2],y:+x[3]}));check(new Set(pts.map(p=>p.x+','+p.y)).size===pts.length,'coincident points');check(pts.every(p=>p.x>=0&&p.x<=6&&p.y>=0&&p.y<=6),'out of bounds');if(q.competencyId==='distance'){check(Number(q.answer)===Math.abs(pts[0].x-pts[1].x)+Math.abs(pts[0].y-pts[1].y),'wrong distance')}
 }
 if(id==='D6.FRAC'&&q.competencyId==='whole_div_proper'){check(q.hintSteps.length===3&&q.solution.includes(String(q.answer)),'fraction steps');}
 if(id==='D4.PERIM')check(/cm\?/.test(text),'perimeter answer unit not specified');
 }
}
for(const mode of ['D4.DEC:subtract_two','D4.DEC:add_three','D5.DEC:combined','D5.DEC:round3','D5.COORD:distance','D6.COORD:route','D6.FRAC:whole_div_proper'])check(seen.has(mode),'mode not tested '+mode);
const src=fs.readFileSync('js/parent-learning-tools-v3.26.0.js','utf8');for(const [start,end] of [['function printVisualDependent','function worksheetPool'],['function demoPrintableItems','async function demoWorksheet']]){const a=src.indexOf(start),b=src.indexOf(end,a);if(start==='function printVisualDependent'){const e=src.indexOf('\n',src.indexOf('function plainPrompt',a));vm.runInContext(src.slice(a,e),c)}else vm.runInContext(src.slice(a,b),c)}
const safe={prompt:'1.024 + 1.230 − 0.649 = ?',answer:'1.605'};
for(const n of [0,1,5,8,10]){const items=c.demoPrintableItems([...Array(n).fill(safe),{prompt:'<svg></svg>Koordinat?',answer:7},{prompt:'<table></table>Pelan?',answer:5}]);check(items.length===Math.min(n,8),'printable count');check(items.every(x=>x.answer==='1.605'),'PDF precision')}
console.log(`PASS ${checks} checks; 4900 real-generator items; exact decimals, 3dp rounding, coordinate geometry, labels, hints, variable PDF selection.`);

const app=fs.readFileSync('js/app.js','utf8');vm.runInContext(app.slice(app.indexOf('function qsv2LearnerTitle'),app.indexOf('function nextQ')),c);c.PAD3Topic7LiveCutover={isTargetQuestion:q=>!!q.target,displayTitle:()=> 'Protected D3 title'};assert.equal(c.qsv2LearnerTitle({title:'Tambah perpuluhan'},{kind:'Tahun 4 · Tolak Perpuluhan'}),'Tolak Perpuluhan');assert.equal(c.qsv2LearnerTitle({title:'Legacy'},{target:true,kind:'Tahun 3 · Other'}),'Protected D3 title');console.log('PASS item titles and protected D3 title routing.');
// Exercise the actual hint function repeatedly, including its last-step cap.
const battle=fs.readFileSync('js/battle.js','utf8'),hintStart=battle.indexOf('function hint(){');
const hintEnd=battle.indexOf('\nfunction battle()',hintStart),shown=[];
c.document.getElementById=()=>({innerHTML:''});c.document.querySelector=()=>({classList:{remove(){},add(){}},setAttribute(){}});c.scoreState=()=>({hints:0});c.save=()=>{};c.showHintOverlay=x=>shown.push(x);c.sess={q:{skill:'D6.FRAC',hint:'fallback',hintSteps:['rule','partial','example']},hintLevel:0,hint:false};
vm.runInContext(battle.slice(hintStart,hintEnd),c);for(let i=0;i<4;i++)c.hint();assert.deepStrictEqual(shown,['rule','partial','example','example']);console.log('PASS real hint progression and capped final step.');
