const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {scenarios}=require('../js/jelajah-scenarios-v1.js');
for(const s of Object.values(scenarios))test(`Darjah ${s.grade}: bounded preset and fresh independent work`,()=>{
 assert.equal(s.questions,undefined);assert.equal(s.coachQuestions,undefined);
 assert.equal(s.script.length,6);assert.equal(s.script.filter(x=>!x).length,4);
 assert.ok(s.skill.startsWith('D'+s.grade+'.'));assert.ok(s.topic);assert.ok(Number.isInteger(s.seed));
 assert.equal(s.scriptSteps.length,6);assert.ok(s.miniGame.page.startsWith('preview/'));assert.ok(s.misconception);
});
test('isolation never touches real learner storage or permits a network write',async()=>{
 let writes=0,requests=0;const real={getItem:()=> 'paid-learner',setItem:()=>writes++};
 const c={window:null,navigator:{},location:{href:'http://localhost/jelajah-runtime.html',origin:'http://localhost'},URL,Map,Promise,Error,XMLHttpRequest:function(){}};
 c.window=c;c.localStorage=real;c.sessionStorage=real;c.fetch=async()=>{requests++;return {ok:true}};c.XMLHttpRequest.prototype.open=()=>{};
 vm.runInNewContext(fs.readFileSync('js/jelajah-isolation-v1.js','utf8'),c);
 assert.equal(c.localStorage.getItem('pa_coach_v6_full'),null);c.localStorage.setItem('pa_coach_v6_full','demo');assert.equal(writes,0);
 await assert.rejects(c.fetch('http://localhost/record',{method:'POST'}));await assert.rejects(c.fetch('https://example.org/read'));
 assert.equal(requests,0);assert.equal((await c.fetch('http://localhost/assets/file.json')).ok,true);
 await assert.rejects(c.navigator.serviceWorker.register());
});
test('only an explicit guest preview reaches hooks; production authorization stays intact',()=>{
 const code=fs.readFileSync('js/segel-demo-v2.1.0.js','utf8');
 assert.ok(code.includes('if(!run?.production&&entryMode?.guestDemo&&entryMode?.jelajah&&window.PAJelajahBridge)'));
 assert.ok(code.includes("if(!mode?.guestDemo&&!await window.PACommercial?.authorizeMission?.())return"));
 assert.ok(code.includes('if(run&&run.production)return respondProduction(option,button)'));
 assert.ok(code.includes('if(won&&run.asked===(window.PAJelajahBridge.target||12))window.PAJelajahBridge.finished()'));
 const generated=fs.readFileSync('jelajah-runtime.html','utf8');
 assert.ok(generated.indexOf('jelajah-isolation-v1.js')<generated.indexOf('js/app.js'));
 assert.ok(!/<script[^>]*src="js\/(cloud|commercial-foundation|demo-funnel|demo-wrapup)/.test(generated));
});
