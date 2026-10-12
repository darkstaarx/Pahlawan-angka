#!/usr/bin/env node
const fs=require('node:fs'),path=require('node:path'),engine=require('../js/engine/focus-diagnosis-v2.js'),rows=[];
const o=(family,probe,result)=>({family,probe,result});
function check(test,grade,input,predicate,expected){const before=JSON.stringify(input),actual=engine.evaluate(input);rows.push({test,grade,expected,actual,status:predicate(actual)&&actual.writes===0&&before===JSON.stringify(input)?'PASS':'FAIL',evidence:'scenario-results.json'})}
check('B distinct remainder failures do not condemn all division',2,{originSkillId:'D2.2.4',observations:[o('division_fact','24/4','independent'),o('division_fact','20/5','independent'),o('remainder_div','25/4','unresolved'),o('remainder_div','22/5','unresolved')]},a=>a.rootCause===null,'Conservative abstention; precise remainder probe selection is unavailable');
check('H same equation repeated does not become evidence',2,{originSkillId:'D2.4.5',observations:[o('money','24/4','unresolved'),o('money','24/4','unresolved')]},a=>a.state==='insufficient_evidence','One unique question is insufficient');
check('I assisted transfer does not verify',2,{originSkillId:'D2.4.5',observations:[o('transfer_verify','t1','assisted'),o('transfer_verify','t2','corrected')]},a=>a.verification==='not_yet_verified','Only independent transfer verifies');
check('I two independent transfers observed',6,{originSkillId:'D6.MONEY',observations:[o('transfer_verify','budget1','independent'),o('transfer_verify','budget2','independent')]},a=>a.verification==='transfer_observed'&&a.rootCause===null,'Transfer observation is separate from mastery certification');
for(const family of ['time','measurement','fraction','percent','ratio','data'])check('J unsupported '+family+' abstains','1–6',{originSkillId:'context-audit',observations:[o(family,'context1','unresolved'),o(family,'context2','unresolved')]},a=>a.state==='insufficient_evidence'&&a.rootCause===null,'No arithmetic weakness inferred from unsupported context');
for(const [test,grade,expected,actual] of [
 ['A real money vs plain arithmetic contrast',2,'Matched varied authored money/plain probes','Money tags partially survive; final plain D2 division tags absent'],
 ['B operand depth/remainder diagnostic bank', '2–6','Choose digit/regroup/remainder probes at matched arithmetic load','Synthetic digit-depth fixture exists; no runtime contrast-bank scheduler; remainder falls back to div.facts'],
 ['C addition/subtraction root separation','1–6','Facts vs carrying/borrowing/place-value/conceptual probes','Families do not encode carry/borrow; no specialized inference rule or authored runtime probes'],
 ['D multiplication root separation','1–6','Equal groups vs facts vs multi-digit probes','Multiplication is only clean-computation evidence; no root-specific rule'],
 ['E live discount root separation',5,'Percent misconception contrasted with subtraction','Synthetic oracle supported; final authored D5 diagnostic tags absent'],
 ['F cross-grade v2 remediation',6,'Earlier-grade probes with D6 identity and return to origin','V2 returns a probe ID only; active Focus router remains same-grade; no v2 recovery controller'],
 ['I recover -> independent -> transfer -> card removal','1–6','Complete v2 recovery lifecycle','Independent recent evidence removes existing cards; v2 transfer lifecycle/root re-evaluation not wired'],
 ['J mathematically validated cross-topic dependency probes','1–6','Time/measure/fraction/percent/ratio/data operation vs context contrast','Context banks generate content but authored v2 dependency metadata and contrast orchestration absent'],
 ['Authenticated onboarding/save/reload','1–6','Real account onboarding, child grade selection and save/reload','No dedicated authorized test account supplied; guest and synthetic profiles only'],
 ['Kembara earns focus through authenticated gameplay','1–6','Earn five encounters naturally, open hub Focus and complete/reload a real profile','Guest gameplay and setup-assisted production Focus route tested; authenticated cumulative journey not executed'],
 ['Manual D1–D6 full focus journeys','1–6','Computer Use verifies every full journey','Manual production D2 wrong/hint/correct and local shadow inspected; remaining journeys automated/setup-assisted']
 ])rows.push({test,grade,expected,actual,status:'BLOCKED',evidence:'scenario-results.json'});
fs.writeFileSync(path.join(__dirname,'focus-v2-e2e/scenario-results.json'),JSON.stringify({rows},null,2));console.log(JSON.stringify({pass:rows.filter(x=>x.status==='PASS').length,fail:rows.filter(x=>x.status==='FAIL').length,blocked:rows.filter(x=>x.status==='BLOCKED').length},null,2));
if(rows.some(x=>x.status==='FAIL'))process.exitCode=1;
