#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const diagnostic=require('../js/engine/focus-money-diagnostic-v2.js');
const tag=(family,side,pair,probe,result='independent',skillId='D2.4.2',matchKey='add:3+4')=>({schema:'pa.money.contrast.v2',tagOrigin:side==='money'?'authored':'derived_exact',family,contextDomain:side==='money'?'money':'number',operation:'addition',pairId:pair,matchKey,probe,variantFingerprint:probe,result,skillId});
const rows=[
 tag('money_add','money','p1','m1','unresolved'),tag('money_add','plain','p1','n1','independent'),
 tag('money_add','money','p2','m2','unresolved'),tag('money_add','plain','p2','n2','independent')
];
let report=diagnostic.evaluate({originSkillId:'D2.4.2',observations:rows,nextSkillId:'D2.2.1',questionBankSkills:['D2.2.1']});
assert.equal(report.state,'candidate');assert.equal(report.rootCause,'money.add');assert.equal(report.nextSkillId,'D2.2.1');assert.equal(report.writes,0);
report=diagnostic.evaluate({originSkillId:'D2.4.2',observations:rows.slice(0,3)});assert.equal(report.state,'needs_contrast');assert.equal(report.rootCause,null);
report=diagnostic.evaluate({originSkillId:'D2.4.2',observations:rows.map((x,i)=>i===1?{...x,matchKey:'add:30+4'}:x)});assert.equal(report.state,'needs_contrast','different operation operands may not count as a matched money/plain pair');
report=diagnostic.evaluate({originSkillId:'D2.4.4',observations:[
 {...tag('money_multiply','money','p1','m1','unresolved','D2.4.4'),operation:'multiplication'},
 {...tag('money_multiply','plain','p1','n1','independent','D2.4.4'),operation:'multiplication'},
 {...tag('money_multiply','money','p2','m2','unresolved','D2.4.4'),operation:'multiplication'},
 {...tag('money_multiply','plain','p2','n2','independent','D2.4.4'),operation:'multiplication'}
]});assert.equal(report.state,'candidate');
report=diagnostic.evaluate({originSkillId:'D2.4.4',observations:rows});assert.equal(report.state,'needs_contrast');assert.equal(report.evidence.accepted,0);
report=diagnostic.evaluate({originSkillId:'D2.4.6',observations:rows});assert.equal(report.state,'needs_contrast','D2 saving accepts only authored subtraction probes');
report=diagnostic.evaluate({originSkillId:'D6.MONEY',observations:[
 {...tag('money_profit','money','p1','m1','unresolved','D6.MONEY'),operation:'subtraction'},
 {...tag('money_profit','plain','p1','n1','independent','D6.MONEY'),operation:'subtraction'},
 {...tag('money_profit','money','p2','m2','unresolved','D6.MONEY'),operation:'subtraction'},
 {...tag('money_profit','plain','p2','n2','independent','D6.MONEY'),operation:'subtraction'}
]});assert.equal(report.state,'candidate');assert.equal(report.rootCause,'money.profit');
const discountRows=['p1','p2'].flatMap((pair,i)=>[
 {schema:'pa.money.contrast.v2',tagOrigin:'authored',family:'money_discount',contextDomain:'money',operation:'discount',pairId:pair,matchKey:'10% of 100 minus discount',probe:'m'+i,result:'independent',skillId:'D5.MONEY'},
 {schema:'pa.money.contrast.v2',tagOrigin:'derived_exact',family:'money_discount',contextDomain:'number',operation:'discount',pairId:pair,matchKey:'10% of 100 minus discount',probe:'n'+i,result:'unresolved',skillId:'D5.MONEY'}
]);
report=diagnostic.evaluate({originSkillId:'D5.MONEY',observations:discountRows});assert.equal(report.state,'candidate');assert.equal(report.rootCause,'operation.discount');
for(const id of ['D2.4.1','D2.4.7']){report=diagnostic.evaluate({originSkillId:id,observations:rows});assert.equal(report.state,'abstain',id+' remains unsupported until its bank has valid matched probes');}
report=diagnostic.evaluate({originSkillId:'D2.4.2',observations:[...rows.slice(0,2),tag('money_add','money','p1','m-extra','unresolved'),...rows.slice(2)]});assert.equal(report.state,'needs_contrast','a pair with more than one probe on a side is ambiguous');
console.log('PASS focus-money-diagnostic-v2: exact matched contrasts, operation recovery, D1-D6 supported capability gates, duplicate/evidence guards, unsupported abstention');
