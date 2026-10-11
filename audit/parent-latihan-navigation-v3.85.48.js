// Exercise the delayed compatibility bridge that replaces the initial tab handler.
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const html=read('index.html');
assert(/data-parent-tab="worksheet" onclick="tab\('worksheet'\)">Latihan<\/button>/.test(html));
const appVersion=/PA_APP_VERSION='([^']+)'/.exec(read('js/version.js'))[1];
assert(html.includes(`js/parent-live-runtime-v1.js?v=${appVersion}`));
assert(read('sw.js').includes("'./js/parent-live-runtime-v1.js'"));
let checks=3;
function classList(){const values=new Set();return{toggle(name,on){on?values.add(name):values.delete(name)},contains:name=>values.has(name)}}
for(const cachedParent of [false,true]){
 const tabs=['summary','core','worksheet','settings','levels','restu','engine'];
 const nodes=Object.fromEntries([...tabs.map(n=>n+'Tab'),'parent'].map(id=>[id,{innerHTML:'',classList:classList()}]));
 const buttons=['summary','core','worksheet','settings'].map(name=>({dataset:{parentTab:name},classList:classList()}));
 const ready=[],timers=[];let mounts=0;
 const ctx={console,URLSearchParams,location:{search:''},setTimeout:fn=>timers.push(fn),document:{readyState:'loading',getElementById:id=>nodes[id],querySelector:()=>null,querySelectorAll:()=>buttons,addEventListener:(name,fn)=>{if(name==='DOMContentLoaded')ready.push(fn)}}};
 ctx.window=ctx;ctx.PAParentTools={mountWorksheet(){mounts++}};vm.createContext(ctx);
 if(cachedParent)ctx.tab=()=>{throw new Error('Cached tab handler should have been replaced')};
 else vm.runInContext(read('js/parent.js'),ctx,{filename:'js/parent.js'});
 const initialTab=ctx.tab;
 vm.runInContext(read('js/parent-live-runtime-v1.js'),ctx,{filename:'js/parent-live-runtime-v1.js'});
 assert.equal(ctx.tab,initialTab);ready.forEach(fn=>fn());while(timers.length)timers.shift()();
 assert.notEqual(ctx.tab,initialTab);checks+=2;
 const select=(input,expected)=>{
  ctx.tab(input);
  for(const name of tabs)assert.equal(nodes[name+'Tab'].classList.contains('hidden'),name!==expected,`${input}: ${name} visibility`);
  for(const button of buttons)assert.equal(button.classList.contains('active'),button.dataset.parentTab===expected);
  assert.equal(nodes.parent.classList.contains('restuOpen'),expected==='restu');checks+=12;
 };
 select('worksheet','worksheet');assert.equal(mounts,1);checks++;
 select('summary','summary');select('core','core');select('settings','settings');
 select('engine','worksheet');assert.equal(mounts,2);checks++;
 select('levels','core');select('restu','restu');select('unknown','summary');
 select('worksheet','worksheet');assert.equal(mounts,3);checks++;
}
console.log(JSON.stringify({status:'pass',checks,coverage:['fresh parent handler','cached parent handler','DOMContentLoaded + delayed bridge boot','Latihan navigation','legacy aliases','worksheet mount','other parent tabs','offline shell']},null,2));
