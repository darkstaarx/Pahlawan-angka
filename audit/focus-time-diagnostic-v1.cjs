const assert=require('node:assert/strict');
const {evaluate}=require('../js/engine/focus-time-diagnostic-v1.js');
const families=['time_clock','time_units','time_elapsed'];
function observations(weak){return families.flatMap(f=>[1,2].map(i=>({purpose:'contrast',family:f,probe:`${f}:${i}`,result:f===weak?'corrected':'independent'})))}
for(const [family,skill] of [['time_clock','D2.5.1'],['time_units','D2.5.2'],['time_elapsed','D2.5.3']]){
 const report=evaluate({observations:observations(family),originSkillId:'D2.5.3'});
 assert.equal(report.state,'candidate');assert.equal(report.nextSkillId,skill);assert.equal(report.writes,0);
}
const mixed=observations('time_clock').concat([{purpose:'contrast',family:'time_clock',probe:'clock-extra',result:'independent'}]);
assert.notEqual(evaluate({observations:mixed}).state,'candidate','mixed successes and failures must not trigger a root cause');
const conflict=observations('time_units').concat([{purpose:'contrast',family:'time_units',probe:'time_units:1',result:'independent'}]);
assert.notEqual(evaluate({observations:conflict}).state,'candidate','conflicting repeats must be excluded');
const unsupported=evaluate({observations:observations('time_clock'),originSkillId:'D4.TIME'});
assert.equal(unsupported.state,'insufficient_evidence');assert.equal(unsupported.nextSkillId,null);
const noSignal=evaluate({observations:observations('time_clock'),initialTimeWeak:false});
assert.equal(noSignal.state,'insufficient_evidence');assert.match(noSignal.parentText,/Belum ada isyarat awal/);
console.log('focus-time-diagnostic-v1: PASS (3 candidates, mixed/conflict guards, grade guard, no-signal guard)');
