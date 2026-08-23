#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const {createBridge,_test}=require('../engine/legacy-adapter');
const {createShadowSync}=require('../../../js/qsv2-shadow-sync-v3.37.0.js');
let checks=0;const ok=(v,m)=>{checks++;assert(v,m)},eq=(a,b,m)=>{checks++;assert.deepStrictEqual(a,b,m)};
function storage(){const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}}
function runtime(){const c={console};c.window=c;c.globalThis=c;vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'..','dist','runtime.js'),'utf8'),c);return c.PAQuestionSystemV2}
function fakeRoot(){
 const calls=[];const timers=[];const ls=storage();
 const client={from(table){return {async upsert(rows,opts){calls.push({table,rows:JSON.parse(JSON.stringify(rows)),opts});return {error:null}}}}};
 const root={document:{},localStorage:ls,navigator:{onLine:true},crypto:{randomUUID:()=>`11111111-1111-4111-8111-${String(calls.length+1).padStart(12,'0')}`},setTimeout:(fn,ms)=>{timers.push({fn,ms});return timers.length},clearTimeout:()=>{},addEventListener:()=>{},PA_APP_VERSION:'3.37.0',PATelemetry:{enabled:()=>true},PACloud:{state:{client,user:{id:'owner'},childId:'child-a'}},PAQuestionSystemV2Bridge:{getStatus:()=>({sourceHash:'abc123'})}};
 return {root,calls,timers,ls,client};
}

(async()=>{
 // Queue sanitisation + cloud insert contract.
 const f=fakeRoot(),sync=createShadowSync(f.root);
 eq(sync.getStatus().queued,0,'queue starts empty');
 ok(sync.enqueue({mode:'shadow',outcome:'generated',reason:'ok',generationMs:12.7,standardId:'7.1.1',competencyId:'identify_prism',templateId:'tpl-1',fingerprint:'fp-1',prompt:'SECRET',answer:'SECRET',email:'SECRET'}),'authenticated telemetry event enqueued');
 eq(sync.getStatus().queued,1,'queue increments');
 const row=sync._test.readQueue()[0];
 const allowed=['app_version','child_id','client_event_id','competency_id','event_schema','fingerprint','generation_ms','mode','occurred_at','outcome','reason','source_hash','standard_id','template_id'].sort();
 eq(Object.keys(row).sort(),allowed,'remote row exact allowlist');
 for(const k of ['prompt','answer','wrong','name','email','user_id'])ok(!(k in row),`remote row excludes ${k}`);
 eq(row.mode,'shadow','mode locked to shadow');eq(row.app_version,'3.37.0','app version attached');eq(row.source_hash,'abc123','runtime source hash attached');eq(row.child_id,'child-a','active child reference attached at enqueue time');eq(row.generation_ms,13,'duration rounded');
 ok(await sync.flush(),'flush succeeds');eq(f.calls.length,1,'one Supabase call');eq(f.calls[0].table,'qsv2_shadow_events','correct table');eq(f.calls[0].opts.onConflict,'client_event_id','idempotent conflict key');eq(f.calls[0].opts.ignoreDuplicates,true,'duplicate retries are ignored');eq(sync.getStatus().queued,0,'success clears queue');eq(sync.getStatus().sent,1,'sent counter increments');

 // Fail-open retry: network/db error keeps local queue and never throws.
 const f2=fakeRoot();f2.client.from=()=>({upsert:async()=>({error:{message:'network unavailable'}})});const sync2=createShadowSync(f2.root);ok(sync2.enqueue({outcome:'fallback',reason:'runtime_missing',generationMs:1}),'fallback queued');eq(await sync2.flush(),false,'sync failure returns false');eq(sync2.getStatus().queued,1,'failed upload retained');eq(sync2.getStatus().lastOutcome,'error','sync error observable');

 // No authenticated child => local telemetry may exist, central queue is skipped.
 const f3=fakeRoot();f3.root.PACloud.state.childId=null;const sync3=createShadowSync(f3.root);eq(sync3.enqueue({outcome:'generated',reason:'ok'}),false,'no child context skips remote queue');eq(sync3.getStatus().queued,0,'no orphan remote row');

 // Existing telemetry opt-out is authoritative for enqueue and flush.
 const f4=fakeRoot();f4.root.PATelemetry.enabled=()=>false;const sync4=createShadowSync(f4.root);eq(sync4.enqueue({outcome:'generated',reason:'ok'}),false,'opt-out blocks remote enqueue');eq(await sync4.flush(),false,'opt-out blocks remote flush');

 // Bridge only forwards centrally when the established PATelemetry gate accepts the event.
 const rt=runtime();let central=[],local=[];const brRoot={document:{},localStorage:storage(),performance:{now:()=>10},PAQuestionSystemV2:rt,PA_QSV2_FLAGS:{d3Topic7:'shadow'},PATelemetry:{record:(type,payload)=>{local.push({type,payload});return true}},PAQSV2ShadowSync:{enqueue:p=>central.push(p)}};const bridge=createBridge(brRoot);
 eq(bridge.tryGenerate('D3.SHAPE',{mastery:50},{history:[],rng:_test.makeRng(123)}),null,'shadow remains invisible');eq(local.length,1,'local telemetry accepted');eq(central.length,1,'accepted local event forwarded centrally');eq(JSON.stringify(central[0]),JSON.stringify(local[0].payload),'central payload is same metadata-only payload');
 central=[];brRoot.PATelemetry.record=()=>false;eq(bridge.tryGenerate('D3.SHAPE',{mastery:50},{history:[],rng:_test.makeRng(456)}),null,'opted-out shadow still invisible');eq(central.length,0,'rejected local telemetry is not forwarded centrally');

 console.log(JSON.stringify({status:'pass',checks,table:'qsv2_shadow_events',privacyGate:'PATelemetry.enabled/record',delivery:'fail-open-local-queue',visiblePath:'legacy-shadow-null'},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
