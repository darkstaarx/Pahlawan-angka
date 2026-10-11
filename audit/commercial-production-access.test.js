const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function harness(data){const c={window:{PACloud:{state:{user:{id:'owner'},client:{rpc:async()=>({data:[data]})},profiles:[]}}},document:{readyState:'loading',addEventListener(){},getElementById(){return null},querySelector(){return null}},localStorage:{removeItem(){}},console,Date,setInterval(){}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/commercial-foundation-v3.25.0.js','utf8'),c);return c;}
for(const [plan,status,expiry,paid,plus] of [['free','inactive',null,false,false],['premium','active',null,true,false],['family_plus','active',null,true,true],['family_plus','trialing',null,true,true],['premium','active','2000-01-01',false,false],['family_plus','cancelled',null,false,false],['standard','active',null,false,false]])test(plan+' '+status+' '+expiry,async()=>{const c=harness({plan,status,current_period_end:expiry});await c.window.PACommercial.refresh();const a=c.window.PACommercial;assert.equal(a.canUse('demo'),true);assert.equal(a.canUse('missions'),true);for(const f of ['focus','report'])assert.equal(a.canUse(f),plus);assert.equal(a.canUse('worksheet'),paid);assert.equal(a.canUse('unknown'),false);});
test('admin retains all supported features',async()=>{const c=harness({role:'admin'});await c.window.PACommercial.refresh();assert.equal(c.window.PACommercial.canUse('missions'),true);assert.equal(c.window.PACommercial.canUse('worksheet'),true)});
test('RPC failure revokes cached paid access',async()=>{const c=harness({plan:'family_plus',status:'active'});await c.window.PACommercial.refresh();c.window.PACloud.state.client.rpc=async()=>({error:Error('offline')});await c.window.PACommercial.refresh();assert.equal(c.window.PACommercial.canUse('missions'),false)});
test('new account cannot inherit a pending old entitlement',async()=>{const c=harness({});let resolve;c.window.PACloud.state.client.rpc=()=>new Promise(r=>resolve=r);const pending=c.window.PACommercial.refresh();c.window.PACloud.state.user={id:'other'};resolve({data:[{plan:'family_plus',status:'active'}]});await pending;assert.equal(c.window.PACommercial.canUse('missions'),false)});

test('production entry rejects unverified access before creating a run',()=>{const c={window:{PACommercial:{requireFeature:()=>false}},performance:{now:()=>0},console,db:{},GRAPH:{skills:[]}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/engine/production-journey.js','utf8'),c);c.window.PAProductionJourney.open({chapter:'1'});assert.equal(c.window.PAProductionJourney.state(),null)});

function worksheetHarness(result,renderError=false){const c={window:{PACommercial:{requireFeature:()=>true},PACloud:{state:{user:{id:'owner'},client:{rpc:async()=>{c.claims++;return result}}}}},state:{count:10,busy:false},worksheetLimit:()=>40,mountWorksheet(){},status:m=>c.message=m,console:{error(){}},makeQuestions:()=>({items:[{}],title:'Test',snap:{name:'A',grade:1}}),studentPages:async()=>{if(renderError)throw Error('render failed');return []},answerPages:async()=>[],pdfFromCanvases:()=> 'pdf',download:()=>c.downloads++,slug:x=>x,claims:0,downloads:0};vm.createContext(c);const s=fs.readFileSync('js/parent-learning-tools-v3.26.0.js','utf8');vm.runInContext(s.slice(s.indexOf('async function worksheet(includeAnswers){'),s.indexOf('function demoPrintableItems(')),c);return c;}
test('quota denied prevents PDF download',async()=>{const c=worksheetHarness({data:{allowed:false}});await c.worksheet(false);assert.equal(c.claims,1);assert.equal(c.downloads,0);assert.match(c.message,/sudah dimuat turun/)});
test('claim RPC failure cannot download offline',async()=>{const c=worksheetHarness({error:Error('offline')});await c.worksheet(true);assert.equal(c.downloads,0)});
test('PDF rendering failure does not consume daily quota',async()=>{const c=worksheetHarness({data:{allowed:true}},true);await c.worksheet(false);assert.equal(c.claims,0);assert.equal(c.downloads,0)});
test('double click consumes only one claim and downloads once',async()=>{const c=worksheetHarness({data:{allowed:true}});await Promise.all([c.worksheet(false),c.worksheet(true)]);assert.equal(c.claims,1);assert.equal(c.downloads,1)});

test('mission quota blocks concurrent starts',async()=>{const c=harness({plan:'free',status:'inactive',profile_limit:1});await c.window.PACommercial.refresh();let complete,calls=0;c.window.PACloud.state.client.rpc=()=>{calls++;return new Promise(r=>complete=r)};const first=c.window.PACommercial.authorizeMission();assert.equal(await c.window.PACommercial.authorizeMission(),false);complete({data:{allowed:true}});assert.equal(await first,true);assert.equal(calls,1)});
test('pricing presents Plus then standard then Free',()=>{const c=harness({});const overlay={classList:{remove(){}}};let html='';c.document.body={insertAdjacentHTML:(_,s)=>html=s};let mounted=false;c.document.getElementById=id=>id==='paPricingOverlay'&&mounted?overlay:null;c.document.body.insertAdjacentHTML=(_,s)=>{html=s;mounted=true};c.window.PACommercial.openPricing();assert.ok(html.indexOf('<b>Family Plus</b>')<html.indexOf('<b>Akses Keluarga</b>'));assert.ok(html.indexOf('<b>Akses Keluarga</b>')<html.indexOf('<b>Free</b>'));assert.match(html,/Satu misi sehari/)});

test('spent free mission shows a reset card before any pricing page',async()=>{
 const c=harness({plan:'free',status:'inactive',profile_limit:1});await c.window.PACommercial.refresh();
 let html='',focused=false;const reset={textContent:''};const overlay={classList:{remove(){},add(){}},addEventListener(){},querySelector:()=>({focus(){focused=true}})};
 let mounted=false;c.document.body={insertAdjacentHTML:(_,text)=>{html=text;mounted=true}};
 c.document.getElementById=id=>id==='paMissionLimitOverlay'&&mounted?overlay:id==='paMissionResetTime'?reset:null;
 c.window.PACloud.state.client.rpc=async()=>({data:{allowed:false,day:'2026-12-31'}});
 assert.equal(await c.window.PACommercial.authorizeMission(),false);
 assert.match(html,/Rehat sekejap, Wira/);assert.match(html,/Tunggu esok/);assert.match(html,/Lihat pelan untuk sambung/);
 assert.doesNotMatch(html,/id="paPricingOverlay"/);assert.match(reset.textContent,/1 Januari 2027/i);assert.match(reset.textContent,/12:00 tengah malam/);assert.equal(focused,true);
});

test('quota card remains on mission attempts after returning home or logging in again',async()=>{
 for(const relog of [false,true]){
  const c=harness({plan:'free',status:'inactive',profile_limit:1});await c.window.PACommercial.refresh();
  let shown=0,claims=0;const overlay={classList:{remove(){shown++},add(){}},addEventListener(){},querySelector:()=>({focus(){}})};
  let mounted=false;c.document.body={insertAdjacentHTML(){mounted=true}};
  c.document.getElementById=id=>id==='paMissionLimitOverlay'&&mounted?overlay:id==='paMissionResetTime'?{textContent:''}:null;
  const rpc=async name=>name==='get_commercial_access'?{data:[{plan:'free',status:'inactive',profile_limit:1}]}:{data:{allowed:++claims===1,day:'2026-10-11'}};
  c.window.PACloud.state.client.rpc=rpc;
  assert.equal(await c.window.PACommercial.authorizeMission(),true);assert.equal(shown,0);
  if(relog){c.window.PACommercial.reset();c.window.PACloud.state.user={id:'owner'};await c.window.PACommercial.refresh();}
  assert.equal(await c.window.PACommercial.authorizeMission(),false);assert.equal(shown,1);
  c.window.PACommercial.closeMissionLimit();
  assert.equal(await c.window.PACommercial.authorizeMission(),false);assert.equal(shown,2);
 }
});
