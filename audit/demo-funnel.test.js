const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync('js/demo-funnel-v1.js','utf8');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function harness({search='',storage=new Map(),navigator={},fetcher}={}){
  const requests=[];
  const c={location:{search,hostname:'pahlawanangka.netlify.app'},navigator,crypto:require('node:crypto').webcrypto,
    sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},URLSearchParams,Date,
    setTimeout:fn=>{fn()},fetch:async(url,options)=>{requests.push(JSON.parse(options.body));return fetcher?fetcher():{ok:true,status:201}},
    window:{addEventListener(){}}};
  vm.runInNewContext(source,c);
  return {api:c.window.PADemoFunnel,requests,storage};
}
test('one event per session survives reload and repeated entry',async()=>{
  const h=harness();await tick();
  await Promise.all([h.api.track('demo_start'),h.api.track('demo_start')]);
  await h.api.track('demo_complete');
  const reloaded=harness({storage:h.storage});await tick();await reloaded.api.track('demo_start');
  assert.equal(h.requests.length,3);assert.equal(reloaded.requests.length,0);
});
test('UTM is preserved while full URL, fbclid, email and learning data are excluded',async()=>{
  const h=harness({search:'?utm_source=fb&utm_medium=paid_social&utm_campaign=PA%20%7C%20Test&utm_content=RPG&fbclid=secret&email=child@example.com'});await tick();
  await h.api.track('demo_start',{name:'Child',score:10});
  const row=h.requests[1];assert.equal(row.utm_campaign,'PA | Test');assert.equal(row.utm_content,'RPG');
  assert.deepEqual(Object.keys(row).sort(),['session_id','event_name','is_test','utm_source','utm_medium','utm_campaign','utm_content'].sort());
  const reload=harness({storage:h.storage});await tick();await reload.api.track('demo_complete');
  assert.equal(reload.requests[0].utm_source,'fb');
});
test('QA sessions are marked and tracking respects privacy preferences',async()=>{
  const qa=harness({search:'?pa_tracking_test=1'});await tick();assert.equal(qa.requests[0].is_test,true);
  for(const navigator of [{globalPrivacyControl:true},{doNotTrack:'1'}]){
    const h=harness({navigator});await tick();await h.api.track('demo_start');assert.equal(h.requests.length,0);
  }
});
test('network failure is isolated and retries; malformed storage never blocks',async()=>{
  const h=harness({fetcher:()=>{throw Error('offline')}});await tick();assert.equal(h.requests.length,3);
  await assert.doesNotReject(()=>h.api.track('demo_start'));
  const broken=harness({storage:new Map([['pa_demo_funnel_v1','oops']])});await tick();assert.equal(broken.requests.length,1);
});
test('expired and new campaign visits create new sessions',async()=>{
  const h=harness();await tick();const saved=JSON.parse(h.storage.get('pa_demo_funnel_v1'));saved.at=0;h.storage.set('pa_demo_funnel_v1',JSON.stringify(saved));
  const next=harness({storage:h.storage});await tick();assert.notEqual(h.requests[0].session_id,next.requests[0].session_id);
  const campaign=harness({storage:next.storage,search:'?utm_source=ig'});await tick();assert.notEqual(next.requests[0].session_id,campaign.requests[0].session_id);
});
test('only guest rendered questions and successful finishes emit game events',()=>{
  const game=fs.readFileSync('js/segel-demo-v2.1.0.js','utf8');
  assert.match(game,/if\(entryMode\?\.guestDemo\)window\.PADemoFunnel\?\.track\('demo_start'\)/);
  const finish=game.slice(game.indexOf('  function finishRun('),game.indexOf('  function startRun('));
  assert.ok(finish.indexOf('return;')<finish.indexOf("track('demo_complete')"));
  assert.match(finish,/if\(entryMode\?\.guestDemo\)window\.PADemoFunnel\?\.track\('demo_complete'\)/);
});
