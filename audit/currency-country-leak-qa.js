'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),genFile='questions/v2/generators/d3/full-kssr.js',rendererFile='questions/v2/renderers/d3/full-kssr.js';
function rng(seed){let n=seed;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
const generators={},renderers={},source={registerGenerator:(k,v)=>generators[k]=v,registerRenderer:(k,v)=>renderers[k]=v};vm.createContext(source);for(const f of [genFile,rendererFile])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),source,{filename:f});
const bundle={};bundle.window=bundle;vm.createContext(bundle);vm.runInContext(fs.readFileSync(path.join(root,'questions/v2/dist/runtime.js'),'utf8'),bundle);
const modes=['currency_country_to_name','currency_name_to_country','currency_code_match'],seen={},examples={};let checks=0,samples=0;
function ok(v,m){checks++;assert(v,m);}
for(const mode of modes){seen[mode]=new Set();for(let i=0;i<1000;i++){
 const params={mode},seed=(871000+Math.imul(i,104729))>>>0,raw=generators['d3.fullKssr'](params,rng(seed)),built=bundle.PAQuestionSystemV2._generators['d3.fullKssr'](params,rng(seed));samples++;
 ok(JSON.stringify(raw)===JSON.stringify(built),'source matches shipped runtime');
 const value=raw.value,visual=value.visual,answer=value.answer.labelMs,choices=[answer,...raw.distractors.map(d=>d.labelMs)],sem=raw.meta.semanticProperties;
 ok(new Set(choices).size===4,'four unique choices');ok(choices.filter(c=>c===answer).length===1,'one country/name choice');
 const html=renderers.d3full(value),bundleHtml=bundle.PAQuestionSystemV2._renderers.d3full(built.value);ok(html===bundleHtml,'bundled renderer matches source');
 seen[mode].add(sem.country);
 if(mode==='currency_name_to_country'){
  const visible=value.promptMs+' '+html;ok(!visible.toLowerCase().includes(answer.toLowerCase()),'country answer absent from stem/card');ok(!visible.includes(sem.code),'currency code absent from country question');
  ok(!visual.shownCountry&&!visual.shownCode,'country/code fields remain hidden');ok(value.promptMs.includes('ASEAN'),'country scope stated for Peso');ok(visual.shownCurrency!=='Dolar','ambiguous dollar question excluded');
  if(sem.country==='Filipina'){ok(visual.shownCurrency==='Peso','Peso without country prefix/suffix');examples.peso={prompt:value.promptMs,card:visual.shownCurrency,answer,wrong:raw.distractors.map(d=>d.labelMs)};}
 }else if(mode==='currency_country_to_name'){ok(visual.shownCountry&&!visual.shownCurrency&&!visual.shownCode,'country/name visual masked');}
 else ok(visual.shownCode&&!visual.shownCurrency&&!visual.shownCountry,'code/name visual masked');
 }}
ok(seen.currency_name_to_country.size===8,'all8 unambiguous reverse relationships exercised');ok(seen.currency_country_to_name.size===10&&seen.currency_code_match.size===10,'all10 countries retained in other modes');ok(examples.peso,'regression exercised reported Peso case');
const report={pass:true,samples,checks,examples,coverage:Object.fromEntries(Object.entries(seen).map(([k,v])=>[k,[...v]])),limitations:['Checks authored and shipped runtime output/HTML, not a live browser cache or layout.','Reverse Dolar questions intentionally excluded to avoid Singapore/Brunei ambiguity; both countries remain covered by other modes.']};
fs.writeFileSync(path.join(__dirname,'currency-country-leak-qa-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({pass:true,samples,checks,example:examples.peso},null,2));
