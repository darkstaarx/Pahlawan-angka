'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'../..');
const relevant=f=>f.startsWith('questions/')||f.startsWith('data/kssr/')||/^js\/fraction-(visuals-v2|answers-v1)\.js$/.test(f);
function loadPlan(){
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const staticFiles=[...html.matchAll(/<script[^>]+src="([^"?]+)(?:\?[^\"]*)?"/g)].map(m=>m[1]);
 function dynamicPlan(state){
  const sources=[],seen=new Set(staticFiles);
  const doc={readyState:state,querySelector(selector){const m=selector.match(/(?:src|href)\^="([^"]+)"/);return m&&[...seen].some(f=>f.startsWith(m[1]))?{}:null;},write(markup){for(const m of markup.matchAll(/<script src="([^"]+)"/g)){const f=m[1].split('?')[0];sources.push(f);seen.add(f);}},createElement(){return{};},head:{appendChild(el){if(el.src){const f=el.src.split('?')[0];sources.push(f);seen.add(f);el.onload?.();}}}};
  const c={document:doc,navigator:{},addEventListener(){},PA_APP_VERSION:'3.63.1',console};c.window=c;c.globalThis=c;vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(root,'js/pwa.js'),'utf8'),c);return sources;
 }
 const a=dynamicPlan('loading'),b=dynamicPlan('complete');
 if(JSON.stringify(a.filter(relevant))!==JSON.stringify(b.filter(relevant)))throw new Error('Question release loader branches differ: '+JSON.stringify({loading:a.filter(relevant),complete:b.filter(relevant)}));
 const files=[];for(const f of staticFiles){if(relevant(f))files.push(f);if(f==='js/pwa.js')files.push(...a.filter(relevant));}
 return {files,dynamic:a.filter(relevant),branchesAgree:true};
}
function createContext({seed=20261019,omitCompletion=false}={}){
 const plan=loadPlan(),quiet={info(){},log(){},warn(){},error:console.error};
 const c={console:quiet,Date,Map,Set,Math:Object.create(Math),document:{querySelector(){return null;},documentElement:{dataset:{},setAttribute(){}}},navigator:{},addEventListener(){}};
 c.Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};c.window=c;c.globalThis=c;c.sess={mode:'practice',questionHistory:[],questionFingerprints:[]};vm.createContext(c);
 for(const f of plan.files){if(omitCompletion&&/^questions\/d4\/completion/.test(f))continue;vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c,{filename:f});}
 return {context:c,plan};
}
module.exports={root,loadPlan,createContext};
