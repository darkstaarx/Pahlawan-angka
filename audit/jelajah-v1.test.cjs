const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {scenarios}=require('../js/jelajah-scenarios-v1.js');
for(const s of Object.values(scenarios))test(`Darjah ${s.grade}: bounded preset and fresh independent work`,()=>{
 assert.equal(s.questions.length,12);assert.equal(s.script.length,6);assert.equal(s.script.filter(x=>!x).length,4);
 for(const q of s.questions){assert.ok(q.prompt&&q.hint&&q.skill);assert.ok(q.wrong.every(w=>String(w.v)!==q.answer));assert.equal(new Set([q.answer,...q.wrong.map(w=>w.v)]).size,3)}
 for(const q of s.independent)assert.ok(!s.questions.some(b=>b.prompt===q.prompt),'independent item is absent from battle');
 assert.ok(s.diagnostic.alternative&&s.diagnostic.question);assert.notEqual(s.questions[8].prompt,s.questions[6].prompt);
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
 assert.ok(code.includes('if(won&&run.asked===12)window.PAJelajahBridge.finished()'));
 const generated=fs.readFileSync('jelajah-runtime.html','utf8');
 assert.ok(generated.indexOf('jelajah-isolation-v1.js')<generated.indexOf('js/app.js'));
 assert.ok(!/<script[^>]*src="js\/(cloud|commercial-foundation|demo-funnel|demo-wrapup)/.test(generated));
});
